# Grant Writing Demo

A full-stack application boilerplate with Next.js frontend and FastAPI backend.

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful and accessible component library

### Backend
- **FastAPI** - Modern Python web framework
- **Pydantic** - Data validation using Python type hints
- **Uvicorn** - ASGI server

## Project Structure

```
grant-writing-demo/
├── frontend/           # Next.js application
│   ├── src/
│   │   ├── app/       # Next.js app router pages
│   │   ├── components/ # React components
│   │   └── lib/       # Utility functions
│   ├── public/        # Static assets
│   └── package.json
└── backend/           # FastAPI application
    ├── app/
    │   ├── main.py    # FastAPI app entry point
    │   └── routes.py  # API routes
    └── requirements.txt
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- pip

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

5. API documentation available at [http://localhost:8000/docs](http://localhost:8000/docs)

## API Endpoints

- `GET /` - Root endpoint with API information
- `GET /api/health` - Health check endpoint
- `GET /api/items` - Get all items
- `POST /api/items` - Create a new item
- `GET /api/items/{item_id}` - Get a specific item
- `DELETE /api/items/{item_id}` - Delete an item

## Development

### Frontend Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Backend Commands
- `uvicorn app.main:app --reload` - Start development server with hot reload
- `uvicorn app.main:app` - Start production server

## Features

- ✅ TypeScript for type safety
- ✅ Tailwind CSS for styling
- ✅ shadcn/ui components
- ✅ FastAPI with automatic OpenAPI documentation
- ✅ CORS configured for local development
- ✅ REST API with CRUD operations
- ✅ Pydantic models for data validation

## License

MIT
