@echo off
chcp 65001 >nul
setlocal
cd /d "D:\CODE\GIA PHẢ"

echo ============================================================
echo GIA PHA - FIX CURRENT PUSH
echo ============================================================

where git >nul 2>nul
if errorlevel 1 (
  echo [ERROR] git not found.
  pause
  exit /b 1
)

if not exist ".git" (
  echo [INFO] .git not found. Running git init...
  git init -b main
  if errorlevel 1 (
    git init
    git checkout -B main
  )
)

git remote get-url origin >nul 2>nul
if errorlevel 1 (
  echo [INFO] Adding origin...
  git remote add origin https://github.com/hungdiepcompany-del/giapha.git
) else (
  echo [INFO] Setting origin URL...
  git remote set-url origin https://github.com/hungdiepcompany-del/giapha.git
)

git checkout main >nul 2>nul
if errorlevel 1 (
  git checkout -B main
)

echo [INFO] Current status:
git status --short

echo.
set /p DO_COMMIT=Commit ALL local changes before push? (Y/N): 
if /I "%DO_COMMIT%"=="Y" (
  git add -A
  set /p MSG=Commit message, Enter for default: 
  if "%MSG%"=="" set MSG=chore: update project files
  git commit -m "%MSG%"
)

echo.
echo [INFO] Fetching origin...
git fetch origin --prune

echo.
echo [INFO] Trying safe merge with origin/main if it exists...
git show-ref --verify --quiet refs/remotes/origin/main
if not errorlevel 1 (
  git merge --no-edit --allow-unrelated-histories origin/main
  if errorlevel 1 (
    echo [ERROR] Merge conflict or merge failed.
    echo Open VS Code, resolve conflicts, commit, then run this file again.
    pause
    exit /b 1
  )
)

echo.
echo [INFO] Pushing...
git push -u origin main
if errorlevel 1 (
  echo [ERROR] Push failed.
  pause
  exit /b 1
)

echo.
echo [OK] Push completed.
pause
