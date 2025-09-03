Write-Host "Starting Restaurant Reservation System..." -ForegroundColor Green
Write-Host ""

# Check if MongoDB is running
Write-Host "Checking if MongoDB is running..." -ForegroundColor Yellow
$mongoRunning = Get-NetTCPConnection -LocalPort 27017 -ErrorAction SilentlyContinue

if (-not $mongoRunning) {
    Write-Host "WARNING: MongoDB doesn't seem to be running on port 27017" -ForegroundColor Red
    Write-Host "Please start MongoDB first or check your connection string in config.env" -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to continue anyway..."
}

Write-Host "Starting backend server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run server" -WindowStyle Normal

Write-Host "Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "Starting frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run client" -WindowStyle Normal

Write-Host ""
Write-Host "Application is starting up!" -ForegroundColor Green
Write-Host "Backend: http://localhost:5000" -ForegroundColor Blue
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Blue
Write-Host ""
Write-Host "Both terminals will remain open. Close them when you're done." -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to close this window..."
