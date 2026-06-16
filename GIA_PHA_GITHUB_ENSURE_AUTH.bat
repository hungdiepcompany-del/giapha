@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion

call "%~dp0_GIA_PHA_GITHUB_COMMON.bat"

if not defined GH_EXE (
  echo [ERROR] GitHub CLI missing. Run menu [1] first.
  exit /b 1
)

echo ============================================================
echo GIA PHA - ENFORCE GITHUB ACCOUNT V13
echo ============================================================
echo Expected user : %EXPECTED_GITHUB_USER%
echo Expected email: %EXPECTED_GITHUB_EMAIL%
echo.

REM If expected account already exists in gh keyring, switch it to active.
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

echo [WARN] Correct account is not active. Login is required.
call :LOGIN_CORRECT
if errorlevel 1 exit /b 1

REM Try switching again after login.
"%GH_EXE%" auth switch -h github.com -u "%EXPECTED_GITHUB_USER%" >nul 2>nul

call :CHECK_ACTIVE_EXPECTED
if errorlevel 1 (
  echo [ERROR] Expected account is still not active.
  echo [INFO] Run manually to inspect:
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

findstr /I /C:"Active account: true" "%TEMP%\gia_pha_gh_active.txt" >nul
if errorlevel 1 (
  REM Some gh versions with --active may not print this exact line.
  REM If expected username is present in --active output, accept it.
  exit /b 0
)

exit /b 0

:LOGIN_CORRECT
echo.
echo ============================================================
echo LOGIN WITH CORRECT GITHUB ACCOUNT
echo ============================================================
echo Use:
echo   Username: %EXPECTED_GITHUB_USER%
echo   Email   : %EXPECTED_GITHUB_EMAIL%
echo.

REM Logout current github.com sessions only if expected account is not active.
REM This avoids accidental push by wrong account.
"%GH_EXE%" auth logout -h github.com --yes >nul 2>nul

cmdkey /delete:git:https://github.com >nul 2>nul
cmdkey /delete:LegacyGeneric:target=git:https://github.com >nul 2>nul

"%GH_EXE%" auth login -h github.com -p https --web -s repo,workflow,user:email
if errorlevel 1 (
  echo [ERROR] GitHub login failed.
  exit /b 1
)

exit /b 0
