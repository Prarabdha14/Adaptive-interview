from app.models.all import InterviewSession
from app.services.llm_service import get_llm
from app.services.prompt_registry import PromptRegistryService
from langchain_core.prompts import PromptTemplate
import json

class AnalyticsService:
    def __init__(self):
        self.llm = get_llm()

    def generate_hiring_report(self, session: InterviewSession, transcript: str) -> dict:
        prompt_data = PromptRegistryService.get_prompt("analytics_summary_v1")
        prompt = PromptTemplate.from_template(prompt_data["template"])
        chain = prompt | self.llm
        
        try:
            response = chain.invoke({"role_title": session.role.title, "transcript": transcript})
            content = response.content.strip()
            if content.startswith("```json"):
                content = content[7:-3].strip()
            eval_data = json.loads(content)
        except Exception as e:
            print(f"Analytics error: {e}")
            # Fallback
            eval_data = {
                "strong_areas": session.strong_topics or [],
                "weak_areas": session.weak_topics or [],
                "technical_depth_score": 5.0,
                "adaptability_score": 5.0,
                "communication_score": 5.0,
                "recommended_level": "Unknown",
                "hiring_signal": "Need More Data",
                "overall_feedback": "Failed to generate advanced analytics dynamically."
            }
            
        eval_data["topics_covered"] = session.covered_topics or []
        
        # Calculate average score directly from DB
        total_c = 0
        total_d = 0
        count = 0
        for q in session.questions:
            if q.answer:
                total_c += (q.answer.correctness_score or 0)
                total_d += (q.answer.depth_score or 0)
                count += 1
                
        eval_data["average_score"] = ((total_c + total_d) / (count * 2)) if count > 0 else 0
        eval_data["confidence_score"] = min(eval_data["average_score"] + eval_data.get("communication_score", 5) / 2, 10.0)

        return eval_data
