@echo off
echo STORY(TM) - Starting...
echo.

cd backend
start "STORY Backend" cmd /k "npm install && node src/server.js"
cd ..

timeout /t 3 /nobreak > nul

cd frontend
start "STORY Frontend" cmd /k "npm install && npm run dev"
cd ..

echo.
echo  Backend:  http://localhost:5001
echo  Frontend: http://localhost:5173
echo  Admin:    admin@story.com / admin123
echo.
pause
