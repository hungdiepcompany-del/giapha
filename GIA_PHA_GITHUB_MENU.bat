@echo off
chcp 65001 >nul
setlocal

:MENU
cls
call "%~dp0_GIA_PHA_GITHUB.config.bat"

set "SCRIPT_DIR=%~dp0"
if "%SCRIPT_DIR:~-1%"=="\" set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"
if /I "%REPO_FOLDER_MODE%"=="SCRIPT_DIR" set "REPO_FOLDER=%SCRIPT_DIR%"

echo ============================================================
echo GIA PHA - GITHUB SYNC V13 PULL/PUSH
echo ============================================================
echo Folder : %REPO_FOLDER%
echo Repo   : %REPO_URL%
echo Branch : %BRANCH_NAME%
echo User   : %EXPECTED_GITHUB_USER%
echo Email  : %EXPECTED_GITHUB_EMAIL%
echo.
echo [1] CHECK TOOLS + LOGIN
echo [2] PULL FROM GITHUB
echo [3] PUSH TO GITHUB
echo [4] STATUS
echo [5] OPEN REPO
echo [6] CONFIG
echo [0] EXIT
echo.
set /p CHOOSE=Choose: 

if "%CHOOSE%"=="1" (
  call "%~dp0GIA_PHA_GITHUB_CHECK_TOOLS.bat"
  echo.
  call "%~dp0GIA_PHA_GITHUB_ENSURE_AUTH.bat"
  pause
  goto MENU
)

if "%CHOOSE%"=="2" (
  call "%~dp0GIA_PHA_GITHUB_PULL.bat"
  goto MENU
)

if "%CHOOSE%"=="3" (
  call "%~dp0GIA_PHA_GITHUB_PUSH.bat"
  goto MENU
)

if "%CHOOSE%"=="4" (
  call "%~dp0GIA_PHA_GITHUB_STATUS.bat"
  goto MENU
)

if "%CHOOSE%"=="5" (
  start "" "https://github.com/hungdiepcompany-del/giapha"
  goto MENU
)

if "%CHOOSE%"=="6" (
  notepad "%~dp0GIA_PHA_GITHUB.config.bat"
  goto MENU
)

if "%CHOOSE%"=="0" exit /b 0

goto MENU
