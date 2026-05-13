from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime

class ResumeUploadResponse(BaseModel):
    candidate_id: str
    resume_id: str
    parsed_skills: List[str]

class RoleCreate(BaseModel):
    title: str
    description: Optional[str] = None
    requirements: Optional[List[str]] = None

class SessionStartRequest(BaseModel):
    candidate_id: str
    resume_id: str
    role_id: str

class SessionStartResponse(BaseModel):
    session_id: str

class InterviewQuestionResponse(BaseModel):
    question_id: str
    question_text: str

class InterviewAnswerRequest(BaseModel):
    session_id: str
    question_id: str
    answer_text: str

class TraceResponse(BaseModel):
    generated_query: str
    retrieved_chunk_ids: List[str]
    retrieved_scores: Optional[List[float]] = None
    source_documents: Optional[List[str]] = None
    retrieved_context: str
    prompt_used: str

class QuestionAnswerPair(BaseModel):
    question_id: str
    question_text: str
    answer_text: Optional[str]
    evaluation: Optional[Dict[str, Any]] = None
    trace: Optional[TraceResponse]

class SessionSummaryResponse(BaseModel):
    session_id: str
    candidate_name: Optional[str]
    role_title: str
    qa_pairs: List[QuestionAnswerPair]
    analytics: Optional[Dict[str, Any]] = None

class IngestionStatusResponse(BaseModel):
    job_id: str
    status: str
    progress: float
    error_message: Optional[str] = None
    resume_id: Optional[str] = None
    candidate_id: Optional[str] = None
