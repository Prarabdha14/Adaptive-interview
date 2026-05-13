from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from app.services.llm_service import get_vectorstore
from app.models.all import Resume
from sqlalchemy.orm import Session

class RAGIngestionService:
    def __init__(self):
        self.vectorstore = get_vectorstore()
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50
        )

    def ingest_resume(self, resume: Resume):
        if not resume.parsed_text:
            return

        chunks = self.text_splitter.split_text(resume.parsed_text)
        documents = [
            Document(
                page_content=chunk, 
                metadata={"source_id": resume.id, "doc_type": "resume", "candidate_id": resume.candidate_id}
            ) for chunk in chunks
        ]
        
        # Decoupled architecture: We no longer ingest the resume into the vector database.
        # The resume is strictly kept in Postgres for semantic understanding and query generation.
        # RAG retrieval now ONLY happens from the textbook knowledge base.
        pass
