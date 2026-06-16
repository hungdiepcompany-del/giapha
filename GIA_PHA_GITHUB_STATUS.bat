@echo off
chcp 65001 >nul
setlocal

call "%~dp0_GIA_PHA_GITHUB_COMMON.bat"

if not defined GIT_EXE (
  echo [ERROR] Git missing. Run menu [1].
  pause
  exit /b 1
)

cd /d "%REPO_FOLDER%"
if errorlevel 1 (
  echo [ERROR] Cannot enter repo folder: %REPO_FOLDER%
  pause
  exit /b 1
)

echo ============================================================
echo GIA PHA - GIT STATUS V13
echo ============================================================
"%GIT_EXE%" remote -v
echo.
"%GIT_EXE%" branch -vv
echo.
"%GIT_EXE%" status --short
echo.
"%GIT_EXE%" status
pause
