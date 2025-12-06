@echo off
REM Script to run both frontend and backend concurrently on Windows
REM Usage: start.bat

echo Starting Grant Writing Demo Application...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed. Please install Node.js first.
    exit /b 1
)

REM Check if Python is installed
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Python is not installed. Please install Python first.
    exit /b 1
)

REM Setup backend
echo Setting up backend...
cd backend

if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

echo Activating virtual environment and installing dependencies...
call venv\Scripts\activate.bat
pip install -q -r requirements.txt

echo Backend setup complete
echo.

REM Setup frontend
echo Setting up frontend...
cd ..\frontend

if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
) else (
    echo Frontend dependencies already installed
)

echo Frontend setup complete
echo.

REM Start both services
echo Starting services...
echo.
echo Frontend will be available at: http://localhost:3000
echo Backend will be available at: http://localhost:8000
echo Backend API docs at: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop both services
echo.

cd ..

REM Start backend
cd backend
start /b cmd /c "call venv\Scripts\activate.bat && uvicorn app.main:app --host 0.0.0.0 --port 8000"

REM Wait a moment for backend to start and capture its info
timeout /t 2 /nobreak >nul

REM Start frontend
cd ..\frontend
start /b cmd /c "npm run dev"

echo.
echo Services started! Press any key to stop...
pause >nul

REM Cleanup - kill processes on specific ports
echo Stopping services...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul
echo Services stopped.
