@echo off
echo Starting Restaurant Reservation System...
echo.

echo Checking if MongoDB is running...
netstat -an | findstr :27017 >nul
if %errorlevel% neq 0 (
    echo WARNING: MongoDB doesn't seem to be running on port 27017
    echo Please start MongoDB first or check your connection string in config.env
    echo.
    pause
)

echo Starting backend server...
start "Backend Server" cmd /k "npm run server"

echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo Starting frontend...
start "Frontend" cmd /k "npm run client"

echo.
echo Application is starting up!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window...
pause >nul
