from fastapi import APIRouter, HTTPException, Form
from pydantic import BaseModel
from typing import List, Optional, Dict
from app.scripts import ai
from app.database import add_file_metadata, add_to_grants_database

api_router = APIRouter()

class HealthResponse(BaseModel):
    status: str
    message: str

@api_router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        message="Backend is running successfully!"
    )

# Gemini API Integration
import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini API
GOOGLE_API_KEY = os.getenv("GEMINI_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

class GenerateRequest(BaseModel):
    prompt: str

@api_router.post("/generate")
async def generate_text(request: GenerateRequest):
    """
    Generate text using Gemini API
    """
    if not GOOGLE_API_KEY:
        raise HTTPException(
            status_code=500, 
            detail="GEMINI_API_KEY not found in environment variables"
        )
        
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(request.prompt)
        return {"response": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# File Upload Integration
from fastapi import UploadFile, File
from app.utils import save_upload_metadata, get_upload_path
import shutil
import uuid
import time


@api_router.post("/upload_file")
async def upload_file(
    file: UploadFile = File(...),
    file_role: str = Form(...),
    grant_id: str = Form(...),
    ):
    """
    Upload a file, save it to disk, and record metadata in index.json
    """
    try:
        # Generate a unique ID for the file
        file_id = str(uuid.uuid4())
        # Preserve original extension or assume none/binary
        original_filename = file.filename if file.filename else "unknown"
        ext = os.path.splitext(original_filename)[1]
        stored_filename = f"{file_id}{ext}"
        
        # Save file to disk
        file_path = get_upload_path(stored_filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Create metadata
        metadata = {
            "id": file_id,
            "original_name": original_filename,
            "stored_name": stored_filename,
            "content_type": file.content_type,
            "doc_role": file_role,
            "grant_id": grant_id,
            "upload_timestamp": time.time()
        }
        
        # Save metadata
        add_file_metadata(metadata)
        
        return {
            "message": "File uploaded successfully", 
            "file_id": file_id,
            "file_info": metadata
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class TextUploadRequest(BaseModel):
    text: str
    filename: Optional[str] = None

@api_router.post("/upload_text")
async def upload_text(request: TextUploadRequest):
    """
    Save raw text content as a file
    """
    try:
        file_id = str(uuid.uuid4())
        original_filename = request.filename if request.filename else "text_upload.txt"
        stored_filename = f"{file_id}.txt"
        
        file_path = get_upload_path(stored_filename)
        
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(request.text)
            
        metadata = {
            "id": file_id,
            "original_name": original_filename,
            "stored_name": stored_filename,
            "content_type": "text/plain",
            "doc_role": "context",
            "upload_timestamp": time.time(),
            "size_bytes": os.path.getsize(file_path)
        }
        
        save_upload_metadata(metadata)
        
        return {
            "message": "Text saved successfully",
            "file_id": file_id,
            "file_info": metadata
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/upload_grant")
async def upload_grant(
    file: UploadFile = File(...),
    grant_name: str = Form(...),
    department: str = Form(...),
    county: str = Form(...),
    due_date: str = Form(...),
):
    """
    Upload a grant document with department and county information
    """
    
    import os
    import shutil

    # Assuming get_upload_path() without arguments returns the base upload directory.
    # If not, replace `get_upload_path()` with the actual path to your upload directory,
    # e.g., `os.getenv("UPLOAD_DIR", "uploads")` or a predefined constant.
    upload_dir = get_upload_path("") 
    
    # Ensure the directory exists before trying to remove its contents
    if os.path.exists(upload_dir) and os.path.isdir(upload_dir):
        for filename in os.listdir(upload_dir):
            file_path = os.path.join(upload_dir, filename)
            try:
                if os.path.isfile(file_path) or os.path.islink(file_path):
                    os.unlink(file_path)
                elif os.path.isdir(file_path):
                    shutil.rmtree(file_path)
            except Exception as e:
                # Log the error or handle it as appropriate for your application
                print(f"Failed to delete {file_path}. Reason: {e}")



    try:
        # Generate a unique ID for the file
        file_id = str(uuid.uuid4())
        # Preserve original extension or assume none/binary
        original_filename = file.filename if file.filename else "unknown"
        ext = os.path.splitext(original_filename)[1]
        stored_filename = f"{file_id}{ext}"
        
        # Save file to disk
        file_path = get_upload_path(stored_filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        grant_id = str(uuid.uuid4())
            
        # Create metadata including department and county
        file_metadata = {
            "id": file_id,
            "original_name": original_filename,
            "stored_name": stored_filename,
            "content_type": file.content_type,
            "doc_role": "grant",
            "upload_timestamp": time.time(),
            "grant_id": grant_id,
        }
        
        # Save metadata
        add_file_metadata(file_metadata)

        questions = ai.extract_narrative_questions(grant_id = grant_id)

        grant_questions = []

        for question in questions:
            question_breakdown = ai.break_down_question(question)
            grant_questions.append({
                "question": question,
                "sub_questions": question_breakdown
            })

        grant_entry = {
            "id": grant_id,
            "name": grant_name,
            "department": department,
            "county": county,
            "due_date": due_date,
            "questions": grant_questions,
            "status": "researching"
        }

        add_to_grants_database(grant_entry)
        
        return {
            "message": "Grant document uploaded successfully", 
            "file_id": file_id,
        }
        
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# AI Workflow Endpoints
@api_router.post("/extract_questions")
async def extract_questions():
    """
    Extract narrative questions from the uploaded grant document.
    """
    try:
        questions = ai.extract_narrative_questions()
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class QuestionBreakdownRequest(BaseModel):
    question: str

@api_router.post("/break_down_question")
async def break_down_question(request: QuestionBreakdownRequest):
    """
    Break down a complex question into sub-questions.
    """
    try:
        sub_questions = ai.break_down_question(request.question)
        return {"sub_questions": sub_questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class GenerateResponseRequest(BaseModel):
    question: str
    outline: Dict  # expects a dict with "sections": [{"name": "...", "description": "..."}]

@api_router.post("/generate_response")
async def generate_response(request: GenerateResponseRequest):
    """
    Generate a draft response for a question.
    """
    try:
        response_text = ai.generate_response(request.question, request.outline)
        return {"response": response_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@api_router.get("/all_grants")
async def get_all_grants():
    """
    Retrieve all grants from the in-memory database.
    """
    try:
        from app.database import grants_database
        return {"grants": grants_database}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/all_files")
async def get_all_files():
    """
    Retrieve all uploaded files' metadata from the in-memory database.
    """
    try:
        from app.database import files_database
        return {"files": files_database}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))