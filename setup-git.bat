@echo off
echo Adding all files to Git...
git add .

echo Committing files...
git commit -m "Initial commit"

echo Setting branch to main...
git branch -M main

echo.
echo ✅ Git setup complete!
echo.
echo Next steps:
echo 1. Go to github.com and create a new repository named "expense-tracker"
echo 2. Copy the repository URL
echo 3. Run this command (replace with your URL):
echo    git remote add origin https://github.com/YOUR_USERNAME/expense-tracker.git
echo 4. Run: git push -u origin main
echo.
echo Then deploy to Netlify:
echo 1. Go to netlify.com
echo 2. Sign up with GitHub
echo 3. Import your repository
echo 4. Your site will be live!
echo.
pause