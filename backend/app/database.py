from typing import Dict, Any, List

files_database = [
    # {
    #     "id": file_id,
    #     "original_name": original_filename,
    #     "stored_name": stored_filename,
    #     "content_type": file.content_type,
    #     "doc_role": "context",
    #     "upload_timestamp": time.time(),
    #     "size_bytes": os.path.getsize(file_path)
    # }
]

grants_database = [
    {

    }
]

def add_to_grants_database(grant_entry: Dict[str, Any]) -> None:
    """Add grant entry to the in-memory database."""
    grants_database.append(grant_entry)
    return grants_database

def add_file_metadata(file_metadata: Dict[str, Any]) -> None:
    """Add file metadata to the in-memory database."""
    files_database.append(file_metadata)
    return files_database

def load_file_metadata() -> List[Dict[str, Any]]:
    """Load all file metadata from the in-memory database."""
    return files_database
