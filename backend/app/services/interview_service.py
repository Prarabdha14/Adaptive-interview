from sqlalchemy.orm import Session
from app.models.all import InterviewSession, InterviewQuestion, RetrievalTrace, Role, Resume
from app.services.llm_service import get_llm
from app.services.retrieval_service import RetrievalService
from app.services.memory_service import MemoryService
from app.services.prompt_registry import PromptRegistryService
from app.services.interview_flow_planner import InterviewFlowPlannerService
from langchain_core.prompts import PromptTemplate
import json
import re

class InterviewService:
    def __init__(self, db: Session):
        self.db = db
        self.llm = get_llm()
        self.retriever = RetrievalService()

    def generate_query(self, role: Role, resume: Resume, current_difficulty: str, memory_directive: dict) -> str:
        prompt = PromptTemplate.from_template(
            "Given a candidate applying for the role of '{role_title}' with skills: {skills}. "
            "The current difficulty is '{difficulty}'. "
            "Avoid these topics: {covered_topics}. "
            "Focus on these weak areas if applicable: {weak_topics}. "
            "Generate a short semantic search query to look up advanced textbook concepts or system design principles. "
            "Return ONLY the query string."
        )
        chain = prompt | self.llm
        skills_str = ", ".join(resume.extracted_data.get("skills", []))
        response = chain.invoke({
            "role_title": role.title, 
            "skills": skills_str, 
            "difficulty": current_difficulty,
            "covered_topics": memory_directive["covered_topics"],
            "weak_topics": memory_directive["weak_topics"]
        })
        return response.content.strip()

    def generate_question(self, session_id: str) -> dict:
        session = self.db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
        if not session:
            raise ValueError("Session not found")
        
        role = session.role
        resume = session.resume
        current_difficulty = session.current_difficulty or "Medium"
        
        # 1. Get Memory Directives
        memory_directive = MemoryService.get_memory_directive(session)
        
        # 1.5 Get Conversational Flow Plan
        flow_plan = InterviewFlowPlannerService.plan_next_step(session)
        
        # 2. Generate Query
        generated_query = self.generate_query(role, resume, current_difficulty, memory_directive)
        
        # 3. Hybrid Retrieval with Metadata Filter
        context_texts, chunk_metadata, v_scores, b_scores, f_scores = self.retriever.hybrid_search(
            query=generated_query,
            filters={"doc_type": "textbook"}, # Example metadata filter
            k=3
        )
        context_str = "\n\n".join(context_texts)
        
        # Identify Target Topic from metadata
        target_topic = chunk_metadata[0].get("topic", "General Tech") if chunk_metadata else "General Tech"
        
        # 4. Generate Question using Registry Prompt v3
        prompt_data = PromptRegistryService.get_prompt("question_generation_v3")
        prompt = PromptTemplate.from_template(prompt_data["template"])
        chain = prompt | self.llm
        
        skills_str = ", ".join(resume.extracted_data.get("skills", []))
        
        llm_kwargs = {
            "role_title": role.title, 
            "skills": skills_str, 
            "difficulty": current_difficulty, 
            "covered_topics": memory_directive["covered_topics"],
            "target_topic": target_topic,
            "progression_strategy": flow_plan["progression_strategy"],
            "previous_context": flow_plan["previous_context"],
            "context": context_str
        }
        
        formatted_prompt = prompt.format(**llm_kwargs)
        response = chain.invoke(llm_kwargs)
        raw_output = response.content.strip()
        
        # Parse JSON
        generated_q_text = raw_output
        parsed_metadata = {}
        try:
            # Strip markdown formatting if present
            cleaned_json = re.sub(r'```json|```', '', raw_output).strip()
            parsed_metadata = json.loads(cleaned_json)
            generated_q_text = parsed_metadata.get("primary_question", raw_output)
        except Exception as e:
            print(f"Failed to parse LLM JSON output: {e}")
        
        # 5. Save Question
        new_question = InterviewQuestion(
            session_id=session.id,
            question_text=generated_q_text
        )
        self.db.add(new_question)
        self.db.flush()
        
        # 6. Save Traceability Data with Versioning and Scores
        trace = RetrievalTrace(
            question_id=new_question.id,
            extracted_skills=resume.extracted_data.get("skills", []),
            generated_query=generated_query,
            retrieved_chunk_ids=[m.get("topic", "Unknown") for m in chunk_metadata], # Mock ID as topic
            vector_score=v_scores,
            bm25_score=b_scores,
            final_rank_score=f_scores,
            source_documents=[m.get("source", "Unknown") for m in chunk_metadata],
            retrieved_context=context_str,
            prompt_used=formatted_prompt,
            prompt_version=prompt_data["version"],
            prompt_template_name="question_generation_v3",
            llm_model=prompt_data["llm_model"],
            temperature=prompt_data["temperature"],
            retrieval_strategy="hybrid_bm25_chroma"
        )
        self.db.add(trace)
        self.db.commit()
        
        return {
            "question_id": new_question.id,
            "question_text": new_question.question_text
        }
