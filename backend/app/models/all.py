import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from app.database.base import Base

def generate_uuid():
    return str(uuid.uuid4())

class Candidate(Base):
    __tablename__ = "candidates"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    resumes = relationship("Resume", back_populates="candidate")
    sessions = relationship("InterviewSession", back_populates="candidate")

class Resume(Base):
    __tablename__ = "resumes"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    candidate_id = Column(String, ForeignKey("candidates.id"), nullable=False)
    file_path = Column(String, nullable=False)
    parsed_text = Column(Text, nullable=True)
    extracted_data = Column(JSON, nullable=True) # e.g., skills, experience
    created_at = Column(DateTime, default=datetime.utcnow)
    
    candidate = relationship("Candidate", back_populates="resumes")

class Role(Base):
    __tablename__ = "roles"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    requirements = Column(JSON, nullable=True) # Expected skills
    created_at = Column(DateTime, default=datetime.utcnow)

class InterviewSession(Base):
    __tablename__ = "interview_sessions"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    candidate_id = Column(String, ForeignKey("candidates.id"), nullable=False)
    role_id = Column(String, ForeignKey("roles.id"), nullable=False)
    resume_id = Column(String, ForeignKey("resumes.id"), nullable=False)
    status = Column(String, default="active") # active, completed
    current_difficulty = Column(String, default="Medium")
    covered_topics = Column(JSON, default=list)
    weak_topics = Column(JSON, default=list)
    strong_topics = Column(JSON, default=list)
    asked_question_ids = Column(JSON, default=list)
    topic_frequency_map = Column(JSON, default=dict)
    analytics_summary = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    candidate = relationship("Candidate", back_populates="sessions")
    role = relationship("Role")
    resume = relationship("Resume")
    questions = relationship("InterviewQuestion", back_populates="session", order_by="InterviewQuestion.created_at")

class InterviewQuestion(Base):
    __tablename__ = "interview_questions"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    session_id = Column(String, ForeignKey("interview_sessions.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    session = relationship("InterviewSession", back_populates="questions")
    answer = relationship("InterviewAnswer", back_populates="question", uselist=False)
    trace = relationship("RetrievalTrace", back_populates="question", uselist=False)

class InterviewAnswer(Base):
    __tablename__ = "interview_answers"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    question_id = Column(String, ForeignKey("interview_questions.id"), nullable=False)
    answer_text = Column(Text, nullable=False)
    correctness_score = Column(Float, nullable=True)
    depth_score = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)
    strengths = Column(JSON, nullable=True)
    weaknesses = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    question = relationship("InterviewQuestion", back_populates="answer")

class RetrievalTrace(Base):
    __tablename__ = "retrieval_traces"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    question_id = Column(String, ForeignKey("interview_questions.id"), nullable=False)
    extracted_skills = Column(JSON, nullable=True)
    generated_query = Column(String, nullable=False)
    retrieved_chunk_ids = Column(JSON, nullable=False)
    vector_score = Column(JSON, nullable=True)
    bm25_score = Column(JSON, nullable=True)
    final_rank_score = Column(JSON, nullable=True)
    source_documents = Column(JSON, nullable=True)
    retrieved_context = Column(Text, nullable=False)
    prompt_used = Column(Text, nullable=False)
    prompt_version = Column(String, nullable=True)
    prompt_template_name = Column(String, nullable=True)
    llm_model = Column(String, nullable=True)
    temperature = Column(Float, nullable=True)
    retrieval_strategy = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    question = relationship("InterviewQuestion", back_populates="trace")

class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    source = Column(String, nullable=False) # e.g., resume_id
    doc_type = Column(String, nullable=False) # "resume", "role_guidelines"
    created_at = Column(DateTime, default=datetime.utcnow)

class KnowledgeIngestionJob(Base):
    __tablename__ = "knowledge_ingestion_jobs"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    resume_id = Column(String, ForeignKey("resumes.id"), nullable=True)
    status = Column(String, default="pending") # pending, processing, completed, failed
    progress = Column(Float, default=0.0) # 0.0 to 100.0
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
