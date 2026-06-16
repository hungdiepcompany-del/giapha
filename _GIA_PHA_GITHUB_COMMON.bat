@echo off
REM Internal common loader.

call "%~dp0GIA_PHA_GITHUB_AUTH.config.bat"

set "GIT_EXE="
set "GH_EXE="

for /f "delims=" %%A in ('where git 2^>nul') do (
  if not defined GIT_EXE set "GIT_EXE=%%A"
)

for /f "delims=" %%A in ('where gh 2^>nul') do (
  if not defined GH_EXE set "GH_EXE=%%A"
)

if not defined GIT_EXE if exist "%ProgramFiles%\Git\cmd\git.exe" set "GIT_EXE=%ProgramFiles%\Git\cmd\git.exe"
if not defined GH_EXE if exist "%ProgramFiles%\GitHub CLI\gh.exe" set "GH_EXE=%ProgramFiles%\GitHub CLI\gh.exe"

if not defined GIT_EXE (
  echo [ERROR] git.exe not found.
  exit /b 1
)

if not defined GH_EXE (
  echo [ERROR] gh.exe not found.
  exit /b 1
)

exit /b 0
