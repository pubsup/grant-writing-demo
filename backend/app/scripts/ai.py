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
from app.database import load_file_metadata
# Add the parent directory to sys.path for direct execution
if __name__ == "__main__":
    sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

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

class SubQuestions(BaseModel):
    subquestions: List[str] = Field(description="List of sub-questions derived from the main question.")

def break_down_question(question: str) -> List[str]:
    """
    Analyzes a given question using an LLM and breaks it down into sub-questions.

    Args:
        question: The main question to be broken down.

    Returns:
        A list of sub-question strings.
    """
    api_key = get_api_key()
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found.")

    client = genai.Client()

    prompt = f"""
You are an AI assistant that analyzes a single narrative question from a government grant application and breaks it into the key sub-questions, components, or sections that an applicant must address in order to fully answer the original question.

Your Task:

Given one narrative question, decompose it into a small set of clear, actionable sub-questions.
These sub-questions should:

- Capture all the major elements required for a strong, complete response
- Reflect the implicit expectations behind typical government grant scoring rubrics
- Help the applicant understand exactly what components to cover in their narrative

Guidelines:

When breaking down the question:

- Identify all conceptual parts embedded in the question (e.g., need, goals, activities, outcomes, partners, timeline, population served, evidence, evaluation, sustainability).
- Make implicit expectations explicit—if the question implies justification, significance, or evidence, include them.
- Do not rewrite the original question; only deconstruct it.
- Do not answer the question.
- Sub-questions should be concise but clear enough that an applicant could respond directly.
- Aim for 3-5 sub-questions, depending on complexity. Less sub questions is better.
- Make each sub-question focused on a single aspect.
- Each sub-question should be distinct and non-overlapping.

Output Format:

Output a JSON object with this structure:

{{
  "subquestions": [
    "string",
    "string",
    "string"
  ]
}}


Where each string is a required component or sub-question derived from the original narrative prompt.

Example

Input question:
"Describe the community need this project addresses and explain how your proposed activities will meet that need."

Output:

{{
  "subquestions": [
    "What specific community need or problem does the project address?",
    "Who is affected by this need?",
    "How do you know this need exists?",
    "How do these activities address the identified need?"
  ]
}}

Final Requirement:
Your output must be only the JSON object.

Here is the question: {question}
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[prompt],
            config={
                "response_mime_type": "application/json",
                "response_mime_type": "application/json",
                "response_schema": SubQuestions.model_json_schema()
            }
        )
        sub_questions_obj = SubQuestions.model_validate_json(response.text)
        return sub_questions_obj.subquestions
    except httpx.HTTPStatusError as e:
        print(f"HTTP error during LLM call: {e}")
        return []
    except json.JSONDecodeError:
        print(f"Failed to decode JSON from LLM response: {response.text}")
        return []
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return []


def extract_narrative_questions(grant_id: str) -> List[str]:
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
    metadata = load_file_metadata()
    grant_doc = next((doc for doc in metadata if doc.get("doc_role") == "grant" and doc.get("grant_id") == grant_id), None)
    if not grant_doc:
        raise ValueError("No document with doc_role 'grant' found in metadata.")
    file_name = grant_doc.get("stored_name", "")
    file_path = pathlib.Path(__file__).parent.parent / "uploads" / file_name
    

    # Upload the grant document file to Gemini
    if not file_path.exists():
        raise ValueError(f"Grant document not found at {file_path}")

    prompt = """
You are an AI assistant that extracts only the narrative questions from a government grant application.
Narrative questions are prompts that require the applicant to write multi-sentence or paragraph-length responses in their own words. These typically ask for descriptions, explanations, plans, justifications, needs assessments, project narratives, community impact statements, etc.

Your Task:

Given the full text of a government grant application, identify and output only the narrative questions — questions that require free-form text responses.
Ignore and do not output:

- Yes/No questions
- Multiple-choice questions
- Checkboxes, tables, numeric fields
- Budget line items
- Eligibility attestations
- Upload requests (“Upload your budget”, “Attach resume”)
- Anything that is not a written narrative response by the applicant

Definition of Narrative Questions:

A narrative question must require the applicant to write a meaningful written response, typically beginning with prompts like:

- “Describe…”
- “Explain…”
- “Provide a justification for…”
- “Summarize…”
- “Detail the plan for…”
- “What is the need for…?”
- “How will the project…?”

This list is not exhaustive. Other prompts may also be narrative questions.

Output Format:

Return your answer as a JSON array of strings.

Instructions:

- Preserve the exact wording of each narrative question.
- Do not rewrite, summarize, or merge questions.
- Only output narrative questions that require written narrative responses.
- If no narrative questions exist, return an empty list [].
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
                "response_schema": NarrativeQuestions.model_json_schema()
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
    metadata = load_file_metadata()
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
You are an expert grant writer drafting responses on behalf of a local government applicant. You will be given multiple context sources (e.g., grant notice text, local government background, project descriptions, data, compliance requirements, strategic plans).

Your task is to write a single narrative response to one specific question from the grant application.

Follow these rules:

- Answer ONLY the specific question provided.
- Use information strictly from the provided context. Do NOT invent or assume facts.
- Write in a professional, government-facing, grant-appropriate tone.

Ensure the response is:

- Clear, concise, and well-structured
- Fully aligned with the grant program's goals and requirements
- Written as if the local government is the applicant (“we,” “the City/County,” etc.)
- If context is insufficient to answer part of the question, acknowledge it briefly and still provide the strongest possible grant-aligned narrative.

OUTPUT FORMAT

Return only the final narrative response as polished text. Do not include explanation, notes, or analysis.

INPUTS YOU WILL RECEIVE

Grant_Question: The single question you must answer.

Response_Outline: The structure and key points your response should cover:

You will also be given files attached as context to inform your response.

TASK

Using all provided context, draft the best possible response to the Grant_Question, tailored to a local government applying for the grant.

Grant_Question: {question}

Response_Outline: {outline_text}

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
        print("\nTesting Question Breakdown...")
        test_question = "What are the long-term effects of climate change on coastal ecosystems, and what mitigation strategies can be implemented?"
        sub_questions = break_down_question(test_question)
        print(f"Original Question: {test_question}")
        print(f"Broken Down Sub-Questions:")
        for i, sq in enumerate(sub_questions):
            print(f"  {i+1}. {sq}")
    except ValueError as e:
        print(f"❌ Error: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    test_gemini_setup()
