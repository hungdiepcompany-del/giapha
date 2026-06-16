@echo off
chcp 65001 >nul
setlocal

:MENU
cls
call "%~dp0GIA_PHA_GITHUB_AUTH.config.bat"

echo ============================================================
echo GIA PHA - GITHUB SYNC V12 AUTH STATUS
echo ============================================================
echo Folder : %REPO_FOLDER%
echo Repo   : %REPO_URL%
echo Branch : %BRANCH_NAME%
echo User   : %EXPECTED_GITHUB_USER%
echo Email  : %EXPECTED_GITHUB_EMAIL%
echo.
echo [1] CHECK LOGIN ACCOUNT
echo [2] PUSH
echo [3] OPEN REPO
echo [4] CONFIG
echo [0] EXIT
echo.
set /p CHOOSE=Choose: 

if "%CHOOSE%"=="1" (
  call "%~dp0GIA_PHA_GITHUB_ENSURE_AUTH.bat"
  pause
  goto MENU
)

if "%CHOOSE%"=="2" (
  call "%~dp0GIA_PHA_GITHUB_PUSH_AUTH_VERIFIED.bat"
  goto MENU
)

if "%CHOOSE%"=="3" (
  start "" "https://github.com/hungdiepcompany-del/giapha"
  goto MENU
)

if "%CHOOSE%"=="4" (
  notepad "%~dp0GIA_PHA_GITHUB_AUTH.config.bat"
  goto MENU
)

if "%CHOOSE%"=="0" exit /b 0

goto MENU
