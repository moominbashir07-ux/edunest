@echo off
echo ========================================
echo EduNest GitHub Pages Deployment Script
echo ========================================
echo.

:: Set the path to Git executable found in GitHub Desktop
set "GIT_PATH=C:\Users\moomi\AppData\Local\GitHubDesktop\app-3.5.4\resources\app\git\cmd\git.exe"

echo Checking for Git...
if exist "%GIT_PATH%" (
    echo Git found!
) else (
    echo ERROR: Git not found at expected location!
    pause
    exit /b
)

cd /d "c:\Users\moomi\OneDrive\Desktop\edunest\edunest"

echo.
echo ========================================================
echo IMPORTANT: A browser window may open asking you to login.
echo Please check your browser and approve the login!
echo ========================================================
echo.

echo Adding changes...
"%GIT_PATH%" add .

echo Committing...
"%GIT_PATH%" commit -m "Fix: Add missing folders"

echo.
echo Pushing to GitHub...
echo (If this takes a long time, check your browser for a login screen!)
echo.
"%GIT_PATH%" push origin main

echo.
echo ========================================
echo DONE! Check your GitHub repository now.
echo ========================================
echo.
pause
