import os
import json
import pathlib
from typing import List
from google import genai
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from typing import List
import sys
import os
# Add the parent directory to sys.path for direct execution
if __name__ == "__main__":
    sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from utils import load_upload_metadata
from google.genai import types
import httpx

def get_api_key():
    """Helper to get and validate API key"""
    # 1. Try to locate .env file
    current_dir = pathlib.Path(__file__).parent.absolute()
    # Check backend/app/.env
    env_path_app = current_dir.parent / '.env'
    # Check backend/.env
    env_path_root = current_dir.parent.parent / '.env'

    if env_path_app.exists():
        load_dotenv(env_path_app)
    elif env_path_root.exists():
        load_dotenv(env_path_root)
    else:
        load_dotenv()

    api_key = os.getenv("GEMINI_API_KEY")
    return api_key

def extract_narrative_questions() -> List[str]:
    """
    Extracts narrative questions from the provided text using Gemini API.
    Returns a list of question strings.
    """
    api_key = get_api_key()
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found.")
    
    # Use gemini-2.0-flash as verified earlier
    client = genai.Client()

    class NarrativeQuestions(BaseModel):
        questions: List[str] = Field(description="List of narrative questions extracted from the text.")
    
    # Load metadata and find grant document
    metadata = load_upload_metadata()
    grant_doc = next((doc for doc in metadata if doc.get("doc_role") == "grant"), None)
    if not grant_doc:
        raise ValueError("No document with doc_role 'grant' found in metadata.")
    file_name = grant_doc.get("stored_name", "")
    file_path = pathlib.Path(__file__).parent.parent / "uploads" / file_name
    

    # Upload the grant document file to Gemini
    if not file_path.exists():
        raise ValueError(f"Grant document not found at {file_path}")

    prompt = """
    Analyze the provided grant form or application document.
    Extract all the "narrative questions" or "essay questions" that an applicant needs to answer.
    Ignore simple fields like name, address, date, etc. Focus on questions requiring multiline text responses.
    
    Return the result strictly as a JSON list of strings. Each string is a question.
    Example format: ["Question 1 text...", "Question 2 text..."]
    """
    
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[
                types.Part.from_bytes(
                    data=file_path.read_bytes(),
                    mime_type='application/pdf',
                ),
                prompt
            ],
            config={
                "response_mime_type": "application/json",
                "response_json_schema": NarrativeQuestions.model_json_schema()
            }
        )
        questions = NarrativeQuestions.model_validate_json(response.text)
        return questions.questions
            
    except Exception as e:
        print(f"Error extracting questions: {e}")
        return []


def generate_response(question: str, outline: dict) -> str:
    """
    Generate a response to a question using uploaded context and an answer outline.
    
    Args:
        question: The question to answer
        outline: Dict containing sections with 'name' and 'description' keys
        
    Returns:
        The generated response string
    """
    api_key = get_api_key()
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found.")
    
    client = genai.Client()
    
    # Load all uploaded files
    metadata = load_upload_metadata()
    total_prompt_in = []
    
    for item in metadata:
        file_path = pathlib.Path(__file__).parent.parent / "uploads" / item["stored_name"]
        if file_path.exists():
            total_prompt_in.append(types.Part.from_bytes(
                data=file_path.read_bytes(),
                mime_type=item["content_type"],
            ))
        else:
            print(f"Warning: Uploaded file {file_path} not found.")
    
    # Format the outline
    outline_text = "Answer Outline:\n"
    if "sections" in outline:
        for i, section in enumerate(outline["sections"], 1):
            outline_text += f"{i}. {section['name']}: {section['description']}\n"
    
    prompt = f"""
You are helping with grant writing. Answer the following question using the provided context and outline.

QUESTION: {question}

{outline_text}

Please provide a comprehensive answer that draws from the uploaded documents and follows the structure outlined above. Be specific and reference relevant details from the context where appropriate.
"""
    
    total_prompt_in.append(prompt)
    
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=total_prompt_in,
        )
        return response.text
    except Exception as e:
        print(f"Error generating response: {e}")
        return f"Error generating response: {e}"


def test_gemini_setup():
    api_key = get_api_key()
    if not api_key:
        print("❌ Error: GEMINI_API_KEY environment variable not found.")
        return

    print(f"✅ Found API Key: {api_key[:5]}...{api_key[-5:]}")

    try:
        print("\nTesting Response Generation...")
        test_outline = {
            "sections": [
                {"name": "Background", "description": "Provide organizational background"},
                {"name": "Impact", "description": "Describe expected impact"}
            ]
        }
        response = generate_response("write a narrative about your project", test_outline)
        print(f"Generated Response:\n{response}")
    except ValueError as e:
        print(f"❌ Error: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    test_gemini_setup()
