@echo off
rem One-click start: Vite dev server (5173) + Express API (3000) in one window.
rem Using npm.cmd avoids the PowerShell block on npm.ps1 (execution policy).
cd /d "%~dp0"

if not exist "node_modules\vite\bin\vite.js" (
  echo [1/2] Installing dependencies, please wait...
  call npm.cmd install --no-audit --no-fund
  if errorlevel 1 goto :failed
) else (
  echo [1/2] Dependencies already installed, skipped.
)

echo [2/2] Starting web ^(5173^) + api ^(3000^)
echo   - open http://localhost:5173 in your browser
echo   - the API needs MySQL running, see server\.env
echo Press Ctrl+C to stop.
call npm.cmd run start

pause
goto :eof

:failed
echo.
echo Install failed. Please check your network / npm registry, then run "npm.cmd install" manually.
pause
