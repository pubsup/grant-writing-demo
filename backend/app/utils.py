import json
import shutil
from pathlib import Path
from typing import List, Dict, Any, Optional
import os

# Define paths
BASE_DIR = Path(__file__).parent
UPLOADS_DIR = BASE_DIR / "uploads"

def ensure_uploads_dir():
    """Ensure uploads directory and index file exist."""
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

def get_upload_path(filename: str) -> Path:
    """Get the full path for an uploaded file."""
    ensure_uploads_dir()
    return UPLOADS_DIR / filename
