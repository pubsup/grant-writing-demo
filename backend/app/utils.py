import json
import shutil
from pathlib import Path
from typing import List, Dict, Any, Optional
import os

# Define paths
BASE_DIR = Path(__file__).parent
UPLOADS_DIR = BASE_DIR / "uploads"
INDEX_FILE = UPLOADS_DIR / "index.json"

def ensure_uploads_dir():
    """Ensure uploads directory and index file exist."""
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    if not INDEX_FILE.exists():
        with open(INDEX_FILE, 'w') as f:
            json.dump([], f)

def load_upload_metadata() -> List[Dict[str, Any]]:
    """Load metadata from index.json."""
    ensure_uploads_dir()
    try:
        with open(INDEX_FILE, 'r') as f:
            return json.load(f)
    except json.JSONDecodeError:
        return []

def save_upload_metadata(metadata: Dict[str, Any]) -> None:
    """Append new metadata to index.json."""
    ensure_uploads_dir()
    current_data = load_upload_metadata()
    current_data.append(metadata)
    with open(INDEX_FILE, 'w') as f:
        json.dump(current_data, f, indent=2)

def get_upload_path(filename: str) -> Path:
    """Get the full path for an uploaded file."""
    ensure_uploads_dir()
    return UPLOADS_DIR / filename
