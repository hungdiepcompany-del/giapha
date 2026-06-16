@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion

call "%~dp0_GIA_PHA_GITHUB_COMMON.bat"

echo ============================================================
echo GIA PHA - CHECK REQUIRED TOOLS V13
echo ============================================================
echo Repo folder mode : %REPO_FOLDER_MODE%
echo Repo folder      : %REPO_FOLDER%
echo Repo url         : %REPO_URL%
echo Branch           : %BRANCH_NAME%
echo.

set "MISSING=0"

if defined GIT_EXE (
  echo [OK] Git found: %GIT_EXE%
  "%GIT_EXE%" --version
) else (
  echo [ERROR] Git is missing.
  set "MISSING=1"
)

echo.

if defined GH_EXE (
  echo [OK] GitHub CLI found: %GH_EXE%
  "%GH_EXE%" --version
) else (
  echo [ERROR] GitHub CLI is missing.
  set "MISSING=1"
)

echo.

if defined WINGET_EXE (
  echo [OK] winget found: %WINGET_EXE%
) else (
  echo [WARN] winget not found. Auto install may not work.
)

echo.
if "%MISSING%"=="0" (
  echo [OK] Required tools are installed.
  exit /b 0
)

echo [WARN] Some required tools are missing.
if not defined WINGET_EXE (
  echo [ERROR] winget is missing, cannot auto install.
  echo Install manually:
  echo - Git for Windows
  echo - GitHub CLI
  exit /b 1
)

set /p INSTALL_NOW=Install missing tools now using winget? (Y/N): 
if /I not "%INSTALL_NOW%"=="Y" (
  echo [WARN] Install skipped.
  exit /b 1
)

if not defined GIT_EXE (
  echo [INFO] Installing Git...
  "%WINGET_EXE%" install --id Git.Git -e --source winget --accept-source-agreements --accept-package-agreements
)

if not defined GH_EXE (
  echo [INFO] Installing GitHub CLI...
  "%WINGET_EXE%" install --id GitHub.cli -e --source winget --accept-source-agreements --accept-package-agreements
)

echo.
echo [INFO] Reopen this menu after install if Git/gh are not detected immediately.
exit /b 0
