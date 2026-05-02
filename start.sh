#!/bin/bash

export PATH=/opt/homebrew/bin:/usr/local/bin:$PATH

cd "$(dirname "$0")" || exit

# Kill any stale processes on our ports
echo "Cleaning up stale processes..."
kill -9 $(lsof -ti:8000) 2>/dev/null
kill -9 $(lsof -ti:9090) 2>/dev/null
sleep 1

echo "[1/3] Starting Backend Token Server..."
source venv/bin/activate
cd backend
uvicorn token_server:app --port 8000 --reload &
TOKEN_PID=$!

echo "[2/3] Starting Nova AI Agent..."
python agent.py &
AGENT_PID=$!

echo "[3/3] Starting React Frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "================================================="
echo "✅ Nova Voice Assistant is running!"
echo "   Frontend UI:  http://localhost:5173"
echo "   (Give the Vite server a few seconds to boot)"
echo "   Press Ctrl+C here to safely stop all services."
echo "================================================="

trap "echo '\nStopping services...'; kill $TOKEN_PID $AGENT_PID $FRONTEND_PID; exit" SIGINT SIGTERM
wait
