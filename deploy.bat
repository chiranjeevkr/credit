@echo off
echo Setting up Git repository...

git branch -M main
echo Branch set to main

echo.
echo Now you need to:
echo 1. Go to github.com and create a new repository
echo 2. Copy the repository URL
echo 3. Run: git remote add origin [YOUR_REPO_URL]
echo 4. Run: git push -u origin main

echo.
echo Example:
echo git remote add origin https://github.com/kchir/expense-tracker.git
echo git push -u origin main

pause