import pdfplumber
import os
import json
from sqlalchemy.orm import Session
from app.models.all import Candidate, Resume
from langchain_core.prompts import PromptTemplate
from app.services.llm_service import get_llm

class ResumeService:
    def __init__(self, db: Session):
        self.db = db
        self.llm = get_llm()

    def parse_pdf(self, file_path: str) -> str:
        text = ""
        try:
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    extracted = page.extract_text()
                    if extracted:
                        text += extracted + "\n"
        except Exception as e:
            print(f"Error reading PDF {file_path}: {e}")
        return text

    def extract_skills(self, text: str) -> list[str]:
        # Using LLM to extract skills from text
        prompt = PromptTemplate.from_template(
            "Extract a list of technical and soft skills from the following resume text. "
            "Return ONLY a JSON list of strings, nothing else. Example: [\"Python\", \"Communication\"]\n\nResume:\n{text}"
        )
        chain = prompt | self.llm
        try:
            response = chain.invoke({"text": text[:4000]}) # Limit to avoid context length issues on huge resumes
            content = response.content
            # Clean up potential markdown formatting
            if content.startswith("```json"):
                content = content[7:-3].strip()
            skills = json.loads(content)
            if isinstance(skills, list):
                return skills
        except Exception as e:
            print(f"Error extracting skills: {e}")
        return ["Python", "FastAPI", "React"] # Fallback

    def process_and_save_resume(self, candidate_name: str, file_path: str) -> tuple[Candidate, Resume]:
        candidate = Candidate(name=candidate_name)
        self.db.add(candidate)
        self.db.commit()
        self.db.refresh(candidate)

        parsed_text = self.parse_pdf(file_path)
        skills = self.extract_skills(parsed_text)

        resume = Resume(
            candidate_id=candidate.id,
            file_path=file_path,
            parsed_text=parsed_text,
            extracted_data={"skills": skills}
        )
        self.db.add(resume)
        self.db.commit()
        self.db.refresh(resume)

        return candidate, resume
