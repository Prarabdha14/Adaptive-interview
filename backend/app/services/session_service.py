from sqlalchemy.orm import Session
from app.models.all import InterviewSession, InterviewAnswer, InterviewQuestion, Role
from app.schemas.all import SessionSummaryResponse, QuestionAnswerPair, TraceResponse
from app.services.llm_service import get_llm
from app.services.memory_service import MemoryService
from app.services.analytics_service import AnalyticsService
from app.services.prompt_registry import PromptRegistryService
from langchain_core.prompts import PromptTemplate
import json

class SessionService:
    def __init__(self, db: Session):
        self.db = db
        self.llm = get_llm()
        self.analytics = AnalyticsService()

    def start_session(self, candidate_id: str, resume_id: str, role_id: str) -> str:
        role = self.db.query(Role).filter(Role.id == role_id).first()
        if not role:
            role = Role(id=role_id, title=role_id)
            self.db.add(role)
            self.db.commit()

        session = InterviewSession(
            candidate_id=candidate_id,
            resume_id=resume_id,
            role_id=role.id
        )
        self.db.add(session)
        self.db.commit()
        return session.id

    def submit_answer(self, session_id: str, question_id: str, answer_text: str) -> dict:
        session = self.db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
        question = self.db.query(InterviewQuestion).filter(InterviewQuestion.id == question_id).first()
        
        prompt_data = PromptRegistryService.get_prompt("answer_evaluation_v2")
        prompt = PromptTemplate.from_template(prompt_data["template"])
        chain = prompt | self.llm
        
        try:
            response = chain.invoke({
                "role_title": session.role.title,
                "question_text": question.question_text,
                "answer_text": answer_text
            })
            content = response.content.strip()
            if content.startswith("```json"):
                content = content[7:-3].strip()
            eval_data = json.loads(content)
        except Exception as e:
            print(f"Evaluation error: {e}")
            eval_data = {
                "correctness_score": 5.0,
                "depth_score": 5.0,
                "feedback": "Could not evaluate answer dynamically.",
                "strengths": [],
                "weaknesses": []
            }
            
        answer = InterviewAnswer(
            question_id=question_id,
            answer_text=answer_text,
            correctness_score=eval_data.get("correctness_score", 0),
            depth_score=eval_data.get("depth_score", 0),
            feedback=eval_data.get("feedback", ""),
            strengths=eval_data.get("strengths", []),
            weaknesses=eval_data.get("weaknesses", [])
        )
        self.db.add(answer)
        
        # Adaptive Difficulty & Memory update
        avg_score = (eval_data.get("correctness_score", 0) + eval_data.get("depth_score", 0)) / 2
        topic = question.trace.retrieved_chunk_ids[0] if question.trace and question.trace.retrieved_chunk_ids else "General"
        
        MemoryService.update_memory(session, question.question_text, str(topic), avg_score)
        
        current_diff = session.current_difficulty or "Medium"
        if avg_score >= 8.0:
            if current_diff == "Easy": new_diff = "Medium"
            elif current_diff == "Medium": new_diff = "Hard"
            else: new_diff = "Expert"
        elif avg_score <= 4.0:
            if current_diff == "Hard": new_diff = "Medium"
            elif current_diff == "Medium": new_diff = "Easy"
            elif current_diff == "Expert": new_diff = "Hard"
            else: new_diff = "Easy"
        else:
            new_diff = current_diff
            
        session.current_difficulty = new_diff
        self.db.commit()
        
        return eval_data

    def generate_summary(self, session_id: str) -> dict: # Changed to dict to map to new analytics format easily
        session = self.db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
        if not session:
            raise ValueError("Session not found")
        
        qa_pairs = []
        conversation_context = ""
        for q in session.questions:
            ans_text = q.answer.answer_text if q.answer else None
            trace = q.trace
            
            trace_resp = TraceResponse(
                generated_query=trace.generated_query,
                retrieved_chunk_ids=[str(t) for t in trace.retrieved_chunk_ids] if trace.retrieved_chunk_ids else [],
                retrieved_scores=[float(s) for s in trace.final_rank_score] if trace.final_rank_score else [],
                source_documents=trace.source_documents if hasattr(trace, 'source_documents') and trace.source_documents else [],
                retrieved_context=trace.retrieved_context,
                prompt_used=trace.prompt_used
            ) if trace else None
            
            qa_pairs.append(QuestionAnswerPair(
                question_id=q.id,
                question_text=q.question_text,
                answer_text=ans_text,
                evaluation={
                    "correctness_score": q.answer.correctness_score,
                    "depth_score": q.answer.depth_score,
                    "feedback": q.answer.feedback,
                    "strengths": q.answer.strengths,
                    "weaknesses": q.answer.weaknesses
                } if q.answer else None,
                trace=trace_resp
            ))
            
            if q.answer:
                conversation_context += f"Q: {q.question_text}\nA: {ans_text}\nScore: {q.answer.correctness_score}/10\nWeaknesses: {', '.join(q.answer.weaknesses or [])}\n\n"
            else:
                conversation_context += f"Q: {q.question_text}\nA: No answer provided\n\n"

        analytics_data = self.analytics.generate_hiring_report(session, conversation_context)
        session.analytics_summary = analytics_data
        self.db.commit()
        
        # We'll just return a raw dict for the new schema since it changed significantly
        return {
            "session_id": session.id,
            "candidate_name": session.candidate.name,
            "role_title": session.role.title,
            "qa_pairs": [p.dict() for p in qa_pairs],
            "analytics": analytics_data
        }
