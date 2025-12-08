from fastapi import APIRouter, HTTPException, Form
from pydantic import BaseModel
from typing import List, Optional, Dict
from app.scripts import ai

api_router = APIRouter()

class HealthResponse(BaseModel):
    status: str
    message: str

class Item(BaseModel):
    id: Optional[int] = None
    name: str
    description: Optional[str] = None

# In-memory storage for demo purposes
items_db: List[Item] = []

@api_router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        message="Backend is running successfully!"
    )

@api_router.get("/items", response_model=List[Item])
async def get_items():
    """Get all items"""
    return items_db

@api_router.post("/items", response_model=Item)
async def create_item(item: Item):
    """Create a new item"""
    item.id = len(items_db) + 1
    items_db.append(item)
    return item

@api_router.get("/items/{item_id}", response_model=Item)
async def get_item(item_id: int):
    """Get a specific item by ID"""
    for item in items_db:
        if item.id == item_id:
            return item
    raise HTTPException(status_code=404, detail="Item not found")

@api_router.delete("/items/{item_id}")
async def delete_item(item_id: int):
    """Delete an item"""
    global items_db
    items_db = [item for item in items_db if item.id != item_id]
    return {"message": "Item deleted successfully"}

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
async def upload_file(file: UploadFile = File(...)):
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
            "doc_role": "context",
            "upload_timestamp": time.time(),
            "size_bytes": os.path.getsize(file_path)
        }
        
        # Save metadata
        save_upload_metadata(metadata)
        
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
    department: str = Form(...),
    county: str = Form(...)
):
    """
    Upload a grant document with department and county information
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
            
        # Create metadata including department and county
        metadata = {
            "id": file_id,
            "original_name": original_filename,
            "stored_name": stored_filename,
            "content_type": file.content_type,
            "doc_role": "grant",
            "upload_timestamp": time.time(),
            "size_bytes": os.path.getsize(file_path),
            "department": department,
            "county": county
        }
        
        # Save metadata
        save_upload_metadata(metadata)
        
        return {
            "message": "Grant document uploaded successfully", 
            "file_id": file_id,
            "file_info": metadata
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
