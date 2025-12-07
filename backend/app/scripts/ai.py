import os
import json
import pathlib
from typing import List
from google import genai
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from typing import List

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

def extract_narrative_questions(text: str) -> List[str]:
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
        
    prompt = f"""
    Analyze the following text which represents a grant form or application.
    Extract all the "narrative questions" or "essay questions" that an applicant needs to answer.
    Ignore simple fields like name, address, date, etc. Focus on questions requiring multiline text responses.
    
    Return the result strictly as a JSON list of strings. Each string is a question.
    Example format: ["Question 1 text...", "Question 2 text..."]
    
    Input Text:
    {text}
    """
    
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt, 
            config={
                "response_mime_type": "application/json",
                "response_json_schema": NarrativeQuestions.model_json_schema()
            }
        )
        print(response.text)
        questions = NarrativeQuestions.model_validate_json(response.text)
        return questions.questions
            
    except Exception as e:
        print(f"Error extracting questions: {e}")
        return []

def test_gemini_setup():
    api_key = get_api_key()
    if not api_key:
        print("❌ Error: GEMINI_API_KEY environment variable not found.")
        return

    print(f"✅ Found API Key: {api_key[:5]}...{api_key[-5:]}")
    
    print("\nTesting Question Extraction...")
    sample_text = """
    Project Title: My Generic Project
    
    1. Executive Summary
    Please provide a brief summary of your organization and the proposed project. (Max 500 words)
    
    2. Needs Statement
    Describe the specific problem or need that this project addresses. Include data to support your claim.
    
    3. Budget
    Enter the total amount requested: $_____
    
    4. Impact
    How will you measure the success of this project?
    """
    
    questions = extract_narrative_questions(sample_text)
    print("Extracted Questions:")
    for i, q in enumerate(questions, 1):
        print(f"{i}. {q}")

if __name__ == "__main__":
    test_gemini_setup()
