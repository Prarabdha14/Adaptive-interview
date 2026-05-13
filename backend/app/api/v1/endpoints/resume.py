import os
import shutil
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.all import IngestionStatusResponse
from app.models.all import KnowledgeIngestionJob
from app.services.ingestion_service import IngestionService

router = APIRouter()

@router.post("/upload")
async def upload_resume(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    candidate_name: str = Form(...),
    db: Session = Depends(deps.get_db)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        # Create Job
        job = KnowledgeIngestionJob()
        db.add(job)
        db.commit()
        
        # Dispatch background task
        background_tasks.add_task(
            IngestionService.process_resume_background,
            job_id=job.id,
            candidate_name=candidate_name,
            file_path=file_path
        )
        
        return {"job_id": job.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status/{job_id}", response_model=IngestionStatusResponse)
async def get_upload_status(job_id: str, db: Session = Depends(deps.get_db)):
    job = db.query(KnowledgeIngestionJob).filter(KnowledgeIngestionJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    resume_id = job.resume_id
    candidate_id = None
    if resume_id:
        from app.models.all import Resume
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
        if resume:
            candidate_id = resume.candidate_id
            
    return IngestionStatusResponse(
        job_id=job.id,
        status=job.status,
        progress=job.progress,
        error_message=job.error_message,
        resume_id=resume_id,
        candidate_id=candidate_id
    )
