@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion

call "%~dp0GIA_PHA_GITHUB_AUTH.config.bat"
call "%~dp0_GIA_PHA_GITHUB_COMMON.bat"
if errorlevel 1 pause & exit /b 1

call "%~dp0GIA_PHA_GITHUB_ENSURE_AUTH.bat"
if errorlevel 1 (
  echo [ERROR] Correct GitHub account required. Push blocked.
  pause
  exit /b 1
)

echo ============================================================
echo GIA PHA - PUSH V12 AUTH STATUS VERIFIED
echo ============================================================

cd /d "%REPO_FOLDER%"
if errorlevel 1 (
  echo [ERROR] Cannot enter repo folder: %REPO_FOLDER%
  pause
  exit /b 1
)

if not exist ".git" (
  echo [INFO] .git missing. Initializing repo.
  "%GIT_EXE%" init -b "%BRANCH_NAME%"
  if errorlevel 1 (
    "%GIT_EXE%" init
    "%GIT_EXE%" checkout -B "%BRANCH_NAME%"
  )
)

"%GIT_EXE%" remote get-url origin >nul 2>nul
if errorlevel 1 (
  echo [INFO] Adding origin...
  "%GIT_EXE%" remote add origin "%REPO_URL%"
) else (
  for /f "delims=" %%A in ('"%GIT_EXE%" remote get-url origin') do set "CURRENT_ORIGIN=%%A"
  if /I not "!CURRENT_ORIGIN!"=="%REPO_URL%" (
    echo [WARN] origin differs. Fixing.
    "%GIT_EXE%" remote set-url origin "%REPO_URL%"
  )
)

"%GIT_EXE%" checkout "%BRANCH_NAME%" >nul 2>nul
if errorlevel 1 (
  "%GIT_EXE%" checkout -B "%BRANCH_NAME%"
)

echo.
echo [INFO] Repo status before push:
"%GIT_EXE%" status --short

REM If merge conflict still exists only in README.md, fix it by keeping local.
"%GIT_EXE%" rev-parse --git-dir > "%TEMP%\gia_pha_gitdir.txt" 2>nul
set /p GITDIR=<"%TEMP%\gia_pha_gitdir.txt"

if exist "%GITDIR%\MERGE_HEAD" (
  echo.
  echo [WARN] Merge in progress. Checking conflicted files...
  "%GIT_EXE%" diff --name-only --diff-filter=U > "%TEMP%\gia_pha_conflicts.txt"
  type "%TEMP%\gia_pha_conflicts.txt"

  findstr /I /X "README.md" "%TEMP%\gia_pha_conflicts.txt" >nul
  if not errorlevel 1 (
    echo [INFO] Keeping local README.md and committing merge.
    "%GIT_EXE%" checkout --ours README.md
    "%GIT_EXE%" add README.md
    "%GIT_EXE%" commit -m "merge: resolve README conflict and sync GitHub main"
    if errorlevel 1 (
      echo [ERROR] Merge commit failed.
      pause
      exit /b 1
    )
  ) else (
    echo [ERROR] Conflict is not README.md. Resolve manually in VS Code.
    pause
    exit /b 1
  )
)

echo.
set /p DO_COMMIT=Commit ALL local changes before push? (Y/N): 
if /I "%DO_COMMIT%"=="Y" (
  "%GIT_EXE%" add -A
  set /p MSG=Commit message, Enter for default: 
  if "!MSG!"=="" set "MSG=%DEFAULT_COMMIT_MESSAGE%"
  "%GIT_EXE%" commit -m "!MSG!"
)

echo.
echo [INFO] Fetching origin...
"%GIT_EXE%" fetch origin --prune
if errorlevel 1 (
  echo [ERROR] Fetch failed.
  pause
  exit /b 1
)

echo.
echo [INFO] Pushing to GitHub...
"%GIT_EXE%" push -u origin "%BRANCH_NAME%"
if errorlevel 1 (
  echo [ERROR] Push failed.
  echo [INFO] Check whether the expected account has write access to the repo.
  pause
  exit /b 1
)

echo.
echo [OK] Push completed.
pause
