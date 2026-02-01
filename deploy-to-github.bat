@echo off
echo ========================================
echo EduNest GitHub Pages Deployment Script
echo ========================================
echo.

cd /d "c:\Users\moomi\OneDrive\Desktop\edunest\edunest"

echo Current directory:
cd
echo.

echo Files in repository:
dir /b
echo.

echo Adding all changes (including scripts, styles, and images)...
git add .
echo.

echo Committing changes...
git commit -m "Fix: Add missing scripts, styles, and images folders for Vite build"
echo.

echo Pushing to GitHub...
git push origin main
echo.

echo ========================================
echo Deployment complete!
echo.
echo What happens next:
echo 1. GitHub Actions will run the Vite build
echo 2. Your site will be deployed to GitHub Pages
echo 3. Wait 2-3 minutes, then check your site!
echo ========================================
echo.
pause
