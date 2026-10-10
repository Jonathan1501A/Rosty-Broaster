@echo off
title ROSTY Broaster - Lanzador del Sistema
echo ==============================================================
echo        INICIANDO ROSTY BROASTER (POS & COCINA)
echo ==============================================================
echo.
echo [*] Iniciando Servidor Backend (API & WebSockets en puerto 4000)...
start "ROSTY Backend (Puerto 4000)" cmd /k "cd /d %~dp0backend && npm.cmd run dev"

timeout /t 3 /nobreak >nul

echo [*] Iniciando Cliente Frontend (Vite en puerto 5173)...
start "ROSTY Frontend (Puerto 5173)" cmd /k "cd /d %~dp0frontend && npm.cmd run dev"

timeout /t 2 /nobreak >nul

echo [*] Abriendo navegador automaticamente...
start http://localhost:5173

echo.
echo ==============================================================
echo  El sistema se esta ejecutando en segundo plano!
echo  Frontend: http://localhost:5173
echo  Backend:  http://localhost:4000
echo ==============================================================
pause
