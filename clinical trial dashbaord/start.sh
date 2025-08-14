#!/bin/bash

# Interactive Clinical Trial Explorer Startup Script

echo "🚀 Starting Interactive Clinical Trial Explorer..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Function to cleanup background processes
cleanup() {
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend
echo "🔧 Starting FastAPI backend..."
cd backend

# Check if requirements are installed
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install requirements if needed
if [ ! -f "requirements_installed" ]; then
    echo "📦 Installing Python dependencies..."
    pip install -r requirements.txt
    touch requirements_installed
fi

# Start backend server
echo "🚀 Starting backend server on http://localhost:8000"
python main.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🔧 Starting React frontend..."
cd ../frontend

# Install npm dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Start frontend server
echo "🚀 Starting frontend server on http://localhost:3000"
npm start &
FRONTEND_PID=$!

echo ""
echo "🎉 Interactive Clinical Trial Explorer is starting up!"
echo ""
echo "📊 Backend API: http://localhost:8000"
echo "🌐 Frontend App: http://localhost:3000"
echo ""
echo "⏳ Please wait for both servers to fully start..."
echo "🛑 Press Ctrl+C to stop both servers"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID 