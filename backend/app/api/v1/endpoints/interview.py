from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.all import (
    SessionStartRequest, SessionStartResponse, 
    InterviewQuestionResponse, InterviewAnswerRequest, 
    SessionSummaryResponse
)
from app.services.session_service import SessionService
from app.services.interview_service import InterviewService

router = APIRouter()

@router.post("/start", response_model=SessionStartResponse)
def start_interview(request: SessionStartRequest, db: Session = Depends(deps.get_db)):
    try:
        session_service = SessionService(db)
        session_id = session_service.start_session(
            candidate_id=request.candidate_id,
            resume_id=request.resume_id,
            role_id=request.role_id
        )
        return SessionStartResponse(session_id=session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/question/{session_id}", response_model=InterviewQuestionResponse)
def get_next_question(session_id: str, db: Session = Depends(deps.get_db)):
    try:
        interview_service = InterviewService(db)
        question_data = interview_service.generate_question(session_id)
        return InterviewQuestionResponse(**question_data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/answer")
def submit_answer(request: InterviewAnswerRequest, db: Session = Depends(deps.get_db)):
    try:
        session_service = SessionService(db)
        eval_data = session_service.submit_answer(
            session_id=request.session_id,
            question_id=request.question_id,
            answer_text=request.answer_text
        )
        return eval_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/summary/{session_id}", response_model=SessionSummaryResponse)
def get_interview_summary(session_id: str, db: Session = Depends(deps.get_db)):
    try:
        session_service = SessionService(db)
        return session_service.generate_summary(session_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
