@echo off
REM Internal common loader. Do not run directly.

set "SCRIPT_DIR=%~dp0"
if "%SCRIPT_DIR:~-1%"=="\" set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

call "%~dp0GIA_PHA_GITHUB.config.bat"

if /I "%REPO_FOLDER_MODE%"=="SCRIPT_DIR" (
  set "REPO_FOLDER=%SCRIPT_DIR%"
)

set "GIT_EXE="
set "GH_EXE="
set "WINGET_EXE="

for /f "delims=" %%A in ('where git 2^>nul') do (
  if not defined GIT_EXE set "GIT_EXE=%%A"
)

for /f "delims=" %%A in ('where gh 2^>nul') do (
  if not defined GH_EXE set "GH_EXE=%%A"
)

for /f "delims=" %%A in ('where winget 2^>nul') do (
  if not defined WINGET_EXE set "WINGET_EXE=%%A"
)

if not defined GIT_EXE if exist "%ProgramFiles%\Git\cmd\git.exe" set "GIT_EXE=%ProgramFiles%\Git\cmd\git.exe"
if not defined GH_EXE if exist "%ProgramFiles%\GitHub CLI\gh.exe" set "GH_EXE=%ProgramFiles%\GitHub CLI\gh.exe"
if not defined WINGET_EXE if exist "%LOCALAPPDATA%\Microsoft\WindowsApps\winget.exe" set "WINGET_EXE=%LOCALAPPDATA%\Microsoft\WindowsApps\winget.exe"

exit /b 0
