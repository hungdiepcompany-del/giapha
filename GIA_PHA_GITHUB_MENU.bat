@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion

REM ============================================================
REM GIA PHA - GITHUB SYNC V15 STANDARD PULL
REM Single-file menu. No helper .bat required.
REM ============================================================

set "SCRIPT_DIR=%~dp0"
if "%SCRIPT_DIR:~-1%"=="\" set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

REM The sync folder is the folder containing this .bat file.
set "REPO_FOLDER=%SCRIPT_DIR%"

set "REPO_URL=https://github.com/hungdiepcompany-del/giapha.git"
set "REPO_WEB=https://github.com/hungdiepcompany-del/giapha"
set "BRANCH_NAME=main"

set "EXPECTED_GITHUB_USER=hungdiepcompany-del"
set "EXPECTED_GITHUB_EMAIL=hungdiepcompany@gmail.com"
set "DEFAULT_COMMIT_MESSAGE=chore: update project files"

if /I "%~1"=="__PULL_STANDARD_WORKER__" goto PULL_STANDARD_WORKER

goto MENU

:FIND_TOOLS
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

:CHECK_TOOLS_ONLY
call :FIND_TOOLS

echo ============================================================
echo GIA PHA - CHECK REQUIRED TOOLS V15
echo ============================================================
echo Folder : %REPO_FOLDER%
echo Repo   : %REPO_URL%
echo Branch : %BRANCH_NAME%
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

echo [WARN] Some tools are missing.
if not defined WINGET_EXE (
  echo [ERROR] winget is missing. Install Git and GitHub CLI manually.
  exit /b 1
)

set /p INSTALL_NOW=Install missing tools using winget now? (Y/N): 
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
echo [INFO] Reopen this menu after install if tools are not detected immediately.
exit /b 0

:CHECK_TOOLS_AND_LOGIN
call :CHECK_TOOLS_ONLY
if errorlevel 1 exit /b 1
call :ENSURE_AUTH
exit /b %ERRORLEVEL%

:ENSURE_AUTH
call :FIND_TOOLS

if not defined GH_EXE (
  echo [ERROR] GitHub CLI missing. Run menu [1] first.
  exit /b 1
)

echo ============================================================
echo GIA PHA - ENFORCE GITHUB ACCOUNT V15
echo ============================================================
echo Expected user : %EXPECTED_GITHUB_USER%
echo Expected email: %EXPECTED_GITHUB_EMAIL%
echo.

REM Try to switch to the expected account if it already exists in gh keyring.
"%GH_EXE%" auth switch -h github.com -u "%EXPECTED_GITHUB_USER%" >nul 2>nul

call :CHECK_ACTIVE_EXPECTED
if not errorlevel 1 (
  echo [OK] Correct GitHub account is active.
  "%GH_EXE%" auth setup-git -h github.com >nul 2>nul
  if errorlevel 1 (
    echo [WARN] gh auth setup-git failed.
  ) else (
    echo [OK] gh auth setup-git OK.
  )
  exit /b 0
)

echo [WARN] Correct GitHub account is not active.
echo [INFO] Login browser will open. Use:
echo        Username: %EXPECTED_GITHUB_USER%
echo        Email   : %EXPECTED_GITHUB_EMAIL%
echo.

"%GH_EXE%" auth logout -h github.com --yes >nul 2>nul

REM Remove common Windows cached GitHub credentials.
cmdkey /delete:git:https://github.com >nul 2>nul
cmdkey /delete:LegacyGeneric:target=git:https://github.com >nul 2>nul

"%GH_EXE%" auth login -h github.com -p https --web -s repo,workflow,user:email
if errorlevel 1 (
  echo [ERROR] GitHub login failed.
  exit /b 1
)

"%GH_EXE%" auth switch -h github.com -u "%EXPECTED_GITHUB_USER%" >nul 2>nul

call :CHECK_ACTIVE_EXPECTED
if errorlevel 1 (
  echo [ERROR] Expected GitHub account is still not active.
  echo [INFO] Run this command to inspect:
  echo gh auth status -h github.com
  exit /b 1
)

"%GH_EXE%" auth setup-git -h github.com >nul 2>nul
if errorlevel 1 (
  echo [WARN] gh auth setup-git failed.
) else (
  echo [OK] gh auth setup-git OK.
)

echo [OK] GitHub account verified.
exit /b 0

:CHECK_ACTIVE_EXPECTED
"%GH_EXE%" auth status -h github.com --active > "%TEMP%\gia_pha_gh_active.txt" 2>&1
if errorlevel 1 (
  type "%TEMP%\gia_pha_gh_active.txt"
  exit /b 1
)

type "%TEMP%\gia_pha_gh_active.txt"

findstr /I /C:"%EXPECTED_GITHUB_USER%" "%TEMP%\gia_pha_gh_active.txt" >nul
if errorlevel 1 exit /b 1

exit /b 0

:ENSURE_REPO_BASIC
call :FIND_TOOLS

if not defined GIT_EXE (
  echo [ERROR] Git missing. Run menu [1] first.
  exit /b 1
)

if not exist "%REPO_FOLDER%" (
  echo [INFO] Repo folder missing. Creating...
  mkdir "%REPO_FOLDER%"
)

cd /d "%REPO_FOLDER%"
if errorlevel 1 (
  echo [ERROR] Cannot enter repo folder: %REPO_FOLDER%
  exit /b 1
)

if not exist ".git" (
  echo [WARN] This folder is not a git repo.
  echo [INFO] Initializing git repo here...
  "%GIT_EXE%" init -b "%BRANCH_NAME%" >nul 2>nul
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

exit /b 0

:PULL_STANDARD
call :CHECK_TOOLS_ONLY
if errorlevel 1 (
  pause
  exit /b 1
)

call :ENSURE_AUTH
if errorlevel 1 (
  echo [ERROR] Correct GitHub account required before pull.
  pause
  exit /b 1
)

echo ============================================================
echo GIA PHA - PULL STANDARD FROM GITHUB V15
echo ============================================================
echo This mode will:
echo   1. Backup current folder to parent backup folder
echo   2. Clone GitHub main into a temp folder
echo   3. Replace this folder with GitHub code
echo   4. Restore this V15 menu file
echo.
echo Folder : %REPO_FOLDER%
echo Repo   : %REPO_URL%
echo Branch : %BRANCH_NAME%
echo.

set /p CONFIRM_PULL=Continue backup + replace by GitHub code? (Y/N): 
if /I not "%CONFIRM_PULL%"=="Y" (
  echo [WARN] Pull standard cancelled.
  pause
  exit /b 1
)

for /f %%A in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd_HHmmss"') do set "TS=%%A"

set "WORKER=%TEMP%\GIA_PHA_PULL_STANDARD_WORKER_%TS%_%RANDOM%.bat"
copy /Y "%~f0" "%WORKER%" >nul
if errorlevel 1 (
  echo [ERROR] Cannot create temp worker.
  pause
  exit /b 1
)

echo [INFO] Starting pull worker outside repo...
call "%WORKER%" __PULL_STANDARD_WORKER__ "%REPO_FOLDER%" "%REPO_URL%" "%BRANCH_NAME%" "%TS%"
set "WORKER_EXIT=%ERRORLEVEL%"

if "%WORKER_EXIT%"=="0" (
  echo [OK] Pull standard completed.
) else (
  echo [ERROR] Pull standard failed.
)

pause
exit /b %WORKER_EXIT%

:PULL_STANDARD_WORKER
set "TARGET=%~2"
set "REMOTE=%~3"
set "BRANCH=%~4"
set "TS=%~5"

call :FIND_TOOLS

if not defined GIT_EXE (
  echo [ERROR] Git missing in worker.
  exit /b 1
)

for %%P in ("%TARGET%") do set "PARENT=%%~dpP"
if "%PARENT:~-1%"=="\" set "PARENT=%PARENT:~0,-1%"

set "BACKUP_ROOT=%PARENT%\_GIA_PHA_GITHUB_BACKUPS"
set "TEMP_ROOT=%PARENT%\_GIA_PHA_GITHUB_TEMP"
set "BACKUP_DIR=%BACKUP_ROOT%\backup_%TS%"
set "CLONE_DIR=%TEMP_ROOT%\clone_%TS%"

echo ============================================================
echo GIA PHA - WORKER BACKUP + REPLACE
echo ============================================================
echo Target : %TARGET%
echo Backup : %BACKUP_DIR%
echo Temp   : %CLONE_DIR%
echo Remote : %REMOTE%
echo Branch : %BRANCH%
echo.

if not exist "%BACKUP_ROOT%" mkdir "%BACKUP_ROOT%"
if not exist "%TEMP_ROOT%" mkdir "%TEMP_ROOT%"

echo [INFO] Backing up current folder...
robocopy "%TARGET%" "%BACKUP_DIR%" /E /R:1 /W:1 /XD ".git" "_GIA_PHA_GITHUB_BACKUPS" "_GIA_PHA_GITHUB_TEMP" >nul
set "ROBO_BACKUP=%ERRORLEVEL%"
if %ROBO_BACKUP% GEQ 8 (
  echo [ERROR] Backup failed. Robocopy code: %ROBO_BACKUP%
  exit /b 1
)
echo [OK] Backup completed.

if exist "%CLONE_DIR%" rmdir /S /Q "%CLONE_DIR%" >nul 2>nul

echo [INFO] Cloning GitHub code...
"%GIT_EXE%" clone --branch "%BRANCH%" "%REMOTE%" "%CLONE_DIR%"
if errorlevel 1 (
  echo [ERROR] Git clone failed.
  exit /b 1
)

echo [INFO] Mirroring GitHub code into target folder...
robocopy "%CLONE_DIR%" "%TARGET%" /MIR /R:1 /W:1 >nul
set "ROBO_MIRROR=%ERRORLEVEL%"
if %ROBO_MIRROR% GEQ 8 (
  echo [ERROR] Mirror failed. Robocopy code: %ROBO_MIRROR%
  exit /b 1
)

echo [INFO] Restoring V15 menu file...
copy /Y "%~f0" "%TARGET%\GIA_PHA_GITHUB_MENU.bat" >nul
if errorlevel 1 (
  echo [WARN] Could not restore menu file, but GitHub code is pulled.
) else (
  echo [OK] Menu restored: %TARGET%\GIA_PHA_GITHUB_MENU.bat
)

cd /d "%TARGET%"
"%GIT_EXE%" status

echo.
echo [OK] GitHub standard code is now in target folder.
echo [INFO] Backup is saved at:
echo %BACKUP_DIR%
exit /b 0

:SAFE_PUSH
call :CHECK_TOOLS_ONLY
if errorlevel 1 (
  pause
  exit /b 1
)

call :ENSURE_AUTH
if errorlevel 1 (
  echo [ERROR] Correct GitHub account required before push.
  pause
  exit /b 1
)

echo ============================================================
echo GIA PHA - SAFE PUSH TO GITHUB V15
echo ============================================================
echo Folder : %REPO_FOLDER%
echo Repo   : %REPO_URL%
echo Branch : %BRANCH_NAME%
echo.

call :ENSURE_REPO_BASIC
if errorlevel 1 (
  pause
  exit /b 1
)

echo [INFO] Repo status before push:
"%GIT_EXE%" status --short

REM Resolve current README merge conflict if it is still in progress.
"%GIT_EXE%" rev-parse --git-dir > "%TEMP%\gia_pha_gitdir.txt" 2>nul
set /p GITDIR=<"%TEMP%\gia_pha_gitdir.txt"

if exist "%GITDIR%\MERGE_HEAD" (
  echo.
  echo [WARN] Merge in progress. Checking conflicts...
  "%GIT_EXE%" diff --name-only --diff-filter=U > "%TEMP%\gia_pha_conflicts.txt"
  type "%TEMP%\gia_pha_conflicts.txt"

  findstr /I /X "README.md" "%TEMP%\gia_pha_conflicts.txt" >nul
  if not errorlevel 1 (
    echo [INFO] Keeping local README.md.
    "%GIT_EXE%" checkout --ours README.md
    "%GIT_EXE%" add README.md
    "%GIT_EXE%" commit -m "merge: resolve README conflict and sync GitHub main"
    if errorlevel 1 (
      echo [ERROR] Merge commit failed.
      pause
      exit /b 1
    )
  ) else (
    echo [ERROR] Conflict is not README.md only. Resolve manually in VS Code.
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

REM If remote is ahead, require safe fast-forward before push.
"%GIT_EXE%" show-ref --verify --quiet refs/remotes/origin/%BRANCH_NAME%
if not errorlevel 1 (
  "%GIT_EXE%" merge-base --is-ancestor HEAD refs/remotes/origin/%BRANCH_NAME% >nul 2>nul
  if not errorlevel 1 (
    echo [WARN] Remote has new commits. Pulling fast-forward before push.
    "%GIT_EXE%" pull --ff-only origin "%BRANCH_NAME%"
    if errorlevel 1 (
      echo [ERROR] Fast-forward pull failed. Push blocked.
      pause
      exit /b 1
    )
  )
)

echo.
echo [INFO] Pushing to GitHub...
"%GIT_EXE%" push -u origin "%BRANCH_NAME%"
if errorlevel 1 (
  echo [ERROR] Push failed.
  echo [INFO] Check repo permission for account: %EXPECTED_GITHUB_USER%
  pause
  exit /b 1
)

echo.
echo [OK] Push completed.
pause
exit /b 0

:SHOW_STATUS
call :FIND_TOOLS

if not defined GIT_EXE (
  echo [ERROR] Git missing. Run menu [1].
  pause
  exit /b 1
)

echo ============================================================
echo GIA PHA - GIT STATUS V15
echo ============================================================
echo Folder : %REPO_FOLDER%
echo.

cd /d "%REPO_FOLDER%"
if errorlevel 1 (
  echo [ERROR] Cannot enter repo folder.
  pause
  exit /b 1
)

if not exist ".git" (
  echo [WARN] This folder is not a git repo.
  pause
  exit /b 0
)

"%GIT_EXE%" remote -v
echo.
"%GIT_EXE%" branch -vv
echo.
"%GIT_EXE%" status --short
echo.
"%GIT_EXE%" status
pause
exit /b 0

:MENU
cls
echo ============================================================
echo GIA PHA - GITHUB SYNC V15 STANDARD PULL
echo ============================================================
echo Folder : %REPO_FOLDER%
echo Repo   : %REPO_URL%
echo Branch : %BRANCH_NAME%
echo User   : %EXPECTED_GITHUB_USER%
echo Email  : %EXPECTED_GITHUB_EMAIL%
echo.
echo [1] CHECK TOOLS + LOGIN
echo [2] PULL STANDARD FROM GITHUB
echo [3] PUSH TO GITHUB
echo [4] STATUS
echo [5] OPEN REPO
echo [6] OPEN THIS SCRIPT CONFIG
echo [0] EXIT
echo.
set /p CHOOSE=Choose: 

if "%CHOOSE%"=="1" (
  call :CHECK_TOOLS_AND_LOGIN
  pause
  goto MENU
)

if "%CHOOSE%"=="2" (
  call :PULL_STANDARD
  goto MENU
)

if "%CHOOSE%"=="3" (
  call :SAFE_PUSH
  goto MENU
)

if "%CHOOSE%"=="4" (
  call :SHOW_STATUS
  goto MENU
)

if "%CHOOSE%"=="5" (
  start "" "%REPO_WEB%"
  goto MENU
)

if "%CHOOSE%"=="6" (
  notepad "%~f0"
  goto MENU
)

if "%CHOOSE%"=="0" exit /b 0

goto MENU
