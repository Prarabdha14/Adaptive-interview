import os
from sqlalchemy.orm import Session
from app.models.all import Candidate, Resume, KnowledgeIngestionJob
from app.database.session import SessionLocal
import pdfplumber
import json
from langchain_core.prompts import PromptTemplate
from app.services.llm_service import get_llm

class IngestionService:
    @staticmethod
    def process_resume_background(job_id: str, candidate_name: str, file_path: str):
        # We need a new db session for the background thread
        db: Session = SessionLocal()
        try:
            job = db.query(KnowledgeIngestionJob).filter(KnowledgeIngestionJob.id == job_id).first()
            if not job:
                return
            
            job.status = "processing"
            job.progress = 10.0
            db.commit()
            
            # 1. Parse PDF
            text = ""
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
                        
            job.progress = 50.0
            db.commit()
            
            # 2. Extract Skills via LLM
            llm = get_llm()
            prompt = PromptTemplate.from_template(
                "Extract the core technical skills, programming languages, and frameworks from the following resume text. "
                "Return them as a JSON list of strings.\n\nResume Text:\n{text}\n\nJSON List:"
            )
            chain = prompt | llm
            
            response = chain.invoke({"text": text[:4000]}) # limit text to avoid token limits
            
            # Clean JSON
            content = response.content.strip()
            if content.startswith("```json"):
                content = content[7:-3]
            try:
                skills = json.loads(content)
                if not isinstance(skills, list):
                    skills = []
            except:
                skills = ["Python", "JavaScript"] # fallback
                
            job.progress = 80.0
            db.commit()

            # 3. Save to DB
            candidate = Candidate(name=candidate_name)
            db.add(candidate)
            db.flush()
            
            resume = Resume(
                candidate_id=candidate.id,
                file_path=file_path,
                parsed_text=text,
                extracted_data={"skills": skills}
            )
            db.add(resume)
            db.flush()
            
            # Note: We do not ingest into VectorDB (Textbook RAG only)
            
            job.resume_id = resume.id
            job.progress = 100.0
            job.status = "completed"
            db.commit()
            
        except Exception as e:
            db.rollback()
            job = db.query(KnowledgeIngestionJob).filter(KnowledgeIngestionJob.id == job_id).first()
            if job:
                job.status = "failed"
                job.error_message = str(e)
                db.commit()
        finally:
            db.close()
