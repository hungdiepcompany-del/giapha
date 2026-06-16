@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion

call "%~dp0_GIA_PHA_GITHUB_COMMON.bat"

if not defined GIT_EXE (
  echo [ERROR] Git missing. Run menu [1] first.
  pause
  exit /b 1
)

call "%~dp0GIA_PHA_GITHUB_ENSURE_AUTH.bat"
if errorlevel 1 (
  echo [ERROR] Correct GitHub account required before pull.
  pause
  exit /b 1
)

echo ============================================================
echo GIA PHA - SAFE PULL V13
echo ============================================================
echo Folder : %REPO_FOLDER%
echo Repo   : %REPO_URL%
echo Branch : %BRANCH_NAME%
echo.

if not exist "%REPO_FOLDER%" (
  echo [INFO] Repo folder missing. Creating...
  mkdir "%REPO_FOLDER%"
)

cd /d "%REPO_FOLDER%"
if errorlevel 1 (
  echo [ERROR] Cannot enter repo folder.
  pause
  exit /b 1
)

if not exist ".git" (
  echo [WARN] This folder is not a git repo.
  echo [INFO] Initializing git repo in this folder...
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
    echo [WARN] origin differs. Fixing origin.
    echo [WARN] Current: !CURRENT_ORIGIN!
    echo [WARN] Config : %REPO_URL%
    "%GIT_EXE%" remote set-url origin "%REPO_URL%"
  )
)

"%GIT_EXE%" checkout "%BRANCH_NAME%" >nul 2>nul
if errorlevel 1 (
  "%GIT_EXE%" checkout -B "%BRANCH_NAME%"
)

echo [INFO] Checking local uncommitted changes...
"%GIT_EXE%" status --porcelain > "%TEMP%\gia_pha_status.txt"
for %%A in ("%TEMP%\gia_pha_status.txt") do set "STATUS_SIZE=%%~zA"

if not "%STATUS_SIZE%"=="0" (
  echo [WARN] Local changes exist. Pull is blocked to avoid overwriting your files.
  "%GIT_EXE%" status --short
  echo.
  echo Commit/push your local changes first, then pull again.
  pause
  exit /b 1
)

echo.
echo [INFO] Fetching GitHub...
"%GIT_EXE%" fetch origin --prune
if errorlevel 1 (
  echo [ERROR] Fetch failed.
  pause
  exit /b 1
)

"%GIT_EXE%" show-ref --verify --quiet refs/remotes/origin/%BRANCH_NAME%
if errorlevel 1 (
  echo [WARN] Remote branch origin/%BRANCH_NAME% not found. Nothing to pull.
  pause
  exit /b 0
)

echo.
echo [INFO] Pulling latest code by fast-forward only...
"%GIT_EXE%" pull --ff-only origin "%BRANCH_NAME%"
if errorlevel 1 (
  echo [ERROR] Pull failed because histories diverged or local state is not fast-forwardable.
  echo [INFO] This script blocks unsafe pull. Use push/merge workflow or resolve manually.
  pause
  exit /b 1
)

echo.
echo [OK] Pull completed.
"%GIT_EXE%" status
pause
