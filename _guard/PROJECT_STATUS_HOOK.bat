@echo off
setlocal EnableExtensions DisableDelayedExpansion

echo.
echo Gia Pha Cloudflare status hook:
where npx >nul 2>&1
if errorlevel 1 (
  echo STATUS_ONLY_CLOUDFLARE_CLI_NOT_AVAILABLE
  exit /b 0
)

set "WRANGLER_OUT=%TEMP%\giapha_guard_wrangler_%RANDOM%%RANDOM%.txt"
call npx wrangler whoami > "%WRANGLER_OUT%" 2>&1
type "%WRANGLER_OUT%"
findstr /I /C:"%CLOUDFLARE_ACCOUNT%" "%WRANGLER_OUT%" >nul
if errorlevel 1 (
  del "%WRANGLER_OUT%" >nul 2>&1
  echo STATUS_ONLY_CLOUDFLARE_NOT_CONFIRMED: expected=%CLOUDFLARE_ACCOUNT%
  echo Suggested fix outside guard status: npx wrangler login
  exit /b 0
)

del "%WRANGLER_OUT%" >nul 2>&1
echo CLOUDFLARE_ACCOUNT_CONFIRMED=%CLOUDFLARE_ACCOUNT%
exit /b 0
