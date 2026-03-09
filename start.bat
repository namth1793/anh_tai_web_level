@echo off
echo ========================================
echo     F-QUEST: The First Year Survivor
echo ========================================

:: Auto-install if node_modules missing
if not exist "%~dp0backend\node_modules" (
  echo Installing backend dependencies...
  cd /d "%~dp0backend"
  npm install
)

if not exist "%~dp0frontend\node_modules" (
  echo Installing frontend dependencies...
  cd /d "%~dp0frontend"
  npm install
)

echo.
echo Starting Backend on http://localhost:5000 ...
start "F-QUEST Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend on http://localhost:3000 ...
start "F-QUEST Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ========================================
echo  Backend:  http://localhost:5000
echo  Frontend: http://localhost:3000
echo.
echo  Demo accounts:
echo  Admin:   admin@fquest.edu.vn / admin123
echo  Student: an.nv@fquest.edu.vn / student123
echo ========================================