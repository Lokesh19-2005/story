#!/bin/bash
# STORY™ — Quick Start
# Usage: bash start.sh

echo ""
echo "  ███████╗████████╗ ██████╗ ██████╗ ██╗   ██╗™"
echo "  ██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗╚██╗ ██╔╝"
echo "  ███████╗   ██║   ██║   ██║██████╔╝ ╚████╔╝ "
echo "  ╚════██║   ██║   ██║   ██║██╔══██╗  ╚██╔╝  "
echo "  ███████║   ██║   ╚██████╔╝██║  ██║   ██║   "
echo "  ╚══════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝   ╚═╝   "
echo ""

# Backend
echo "Starting backend..."
cd backend
npm install --silent 2>/dev/null
node src/server.js &
BACKEND_PID=$!
echo "  ✅ Backend: http://localhost:5001"

sleep 2

# Frontend
cd ../frontend
echo "Starting frontend..."
npm install --silent 2>/dev/null
npm run dev &
FRONTEND_PID=$!
echo "  ✅ Frontend: http://localhost:5173"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  STORY™ is live!"
echo ""
echo "  🛍️  Store:   http://localhost:5173"
echo "  ⚙️  API:     http://localhost:5001/api/health"
echo "  🔐  Admin:   admin@story.com / admin123"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Press Ctrl+C to stop all servers"
echo ""

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" INT
wait $BACKEND_PID $FRONTEND_PID
