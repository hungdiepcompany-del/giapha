@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion

call "%~dp0GIA_PHA_GITHUB_AUTH.config.bat"
call "%~dp0_GIA_PHA_GITHUB_COMMON.bat"
if errorlevel 1 exit /b 1

echo ============================================================
echo GIA PHA - CHECK GITHUB LOGIN V12
echo ============================================================
echo Expected GitHub user : %EXPECTED_GITHUB_USER%
echo Expected email       : %EXPECTED_GITHUB_EMAIL%
echo.

call :CHECK_EXPECTED_AUTH
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
call :LOGIN_CORRECT
if errorlevel 1 exit /b 1

call :CHECK_EXPECTED_AUTH
if errorlevel 1 (
  echo [ERROR] Login finished, but expected account was not detected.
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

echo [OK] GitHub login verified.
exit /b 0

:CHECK_EXPECTED_AUTH
"%GH_EXE%" auth status -h github.com > "%TEMP%\gia_pha_gh_auth_status.txt" 2>&1
if errorlevel 1 (
  type "%TEMP%\gia_pha_gh_auth_status.txt"
  exit /b 1
)

type "%TEMP%\gia_pha_gh_auth_status.txt"

findstr /I /C:"Logged in" "%TEMP%\gia_pha_gh_auth_status.txt" >nul
if errorlevel 1 exit /b 1

findstr /I /C:"%EXPECTED_GITHUB_USER%" "%TEMP%\gia_pha_gh_auth_status.txt" >nul
if errorlevel 1 exit /b 1

exit /b 0

:LOGIN_CORRECT
echo.
echo ============================================================
echo LOGIN WITH CORRECT GITHUB ACCOUNT
echo ============================================================
echo Use account:
echo   Username: %EXPECTED_GITHUB_USER%
echo   Email   : %EXPECTED_GITHUB_EMAIL%
echo.

"%GH_EXE%" auth logout -h github.com --yes >nul 2>nul

REM Remove common Windows cached GitHub credentials.
cmdkey /delete:git:https://github.com >nul 2>nul
cmdkey /delete:LegacyGeneric:target=git:https://github.com >nul 2>nul

"%GH_EXE%" auth login -h github.com -p https --web -s repo,workflow
if errorlevel 1 (
  echo [ERROR] gh auth login failed.
  exit /b 1
)

exit /b 0
