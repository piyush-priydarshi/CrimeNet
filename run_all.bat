@echo off
title CrimeNet AI Launcher
echo ===============================================================
echo     CrimeNet AI - Criminal Network Analysis System (NCRB/MHA)
echo ===============================================================
echo.
echo [1/2] Starting FastAPI Backend on http://localhost:8000 ...
start "CrimeNet AI - Backend API" cmd /k "cd /d %~dp0backend && python -m uvicorn main:app --reload --port 8000"

echo [2/2] Starting React + Vite Frontend on http://localhost:5173 ...
start "CrimeNet AI - Web Application" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ===============================================================
echo Servers launched in separate windows!
echo - Web Dashboard: http://localhost:5173
echo - API Docs / Swagger: http://localhost:8000/docs
echo ===============================================================
echo.
pause
