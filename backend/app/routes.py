from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

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
