# AI-Powered Candidate Interview Platform

This is a full-stack, production-grade AI interview platform utilizing a modular monolith architecture. It ingests candidate resumes, extracts skills, generates dynamic role-specific questions via a ChromaDB RAG pipeline, and provides an interactive Next.js chat interface.

## Core Features
- **PDF Resume Ingestion**: Uses `pdfplumber` to extract content.
- **RAG Pipeline**: LangChain + ChromaDB for semantic retrieval.
- **Dynamic Question Generation**: GPT-4 driven tailored questions based on context.
- **Full Traceability**: Every question generated tracks the exact prompt, retrieved context, and vector IDs used.
- **Interactive UI**: Next.js 15 frontend with Zustand state management.

## Project Structure
- `/backend`: FastAPI, SQLAlchemy, LangChain
- `/frontend`: Next.js 15 (App Router), TailwindCSS, TypeScript
- `docker-compose.yml`: Local infrastructure

## Setup Instructions

### 1. Environment Configuration
```bash
cp .env.example .env
# Edit .env and add your MISTRAL_API_KEY
```

### 2. Run with Docker Compose
```bash
docker-compose up --build
```
This will start:
- PostgreSQL on port 5432
- FastAPI Backend on port 8000
- Next.js Frontend on port 3000

### 3. Usage
1. Navigate to [http://localhost:3000](http://localhost:3000)
2. Upload a sample candidate PDF resume and enter a name.
3. Once parsed, enter a target role (e.g. "Senior DevOps Engineer").
4. Proceed through the dynamic interview.
5. Review the final summary and the **RAG Traceability** pipeline logic on the final dashboard!

## API Documentation
Once running, interactive API documentation is available at [http://localhost:8000/api/v1/openapi.json](http://localhost:8000/api/v1/openapi.json) or [http://localhost:8000/docs](http://localhost:8000/docs) (if enabled in FastAPI).
