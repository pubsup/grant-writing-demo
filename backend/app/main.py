from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.utils import ensure_uploads_dir, UPLOADS_DIR
import shutil
from app.routes import api_router

app = FastAPI(
    title="Grant Writing Demo API",
    description="FastAPI backend for Next.js frontend",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api")

PRESERVE_UPLOAD_FILES = [
    "default-grant-doc.pdf",
    "budget_template.pdf",
]

@app.on_event("startup")
async def cleanup_uploads_on_startup() -> None:
    ensure_uploads_dir()
    for item in UPLOADS_DIR.iterdir():
        if item.name in PRESERVE_UPLOAD_FILES:
            continue
        if item.is_file() or item.is_symlink():
            item.unlink(missing_ok=True)
        elif item.is_dir():
            shutil.rmtree(item, ignore_errors=True)

@app.get("/")
async def root():
    return {
        "message": "Welcome to Grant Writing Demo API",
        "docs": "/docs",
        "version": "1.0.0"
    }
