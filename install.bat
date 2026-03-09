@echo off
echo ========================================
echo     F-QUEST: The First Year Survivor
echo ========================================

echo.
echo [1/2] Installing Backend dependencies...
cd /d "%~dp0backend"
npm install
if errorlevel 1 (
  echo Backend install FAILED!
  pause
  exit /b 1
)

echo.
echo [2/2] Installing Frontend dependencies...
cd /d "%~dp0frontend"
npm install
if errorlevel 1 (
  echo Frontend install FAILED!
  pause
  exit /b 1
)

echo.
echo ========================================
echo   Installation complete!
echo   Run start.bat to launch the app.
echo ========================================
pause