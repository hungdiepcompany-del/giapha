@echo off
echo ============================================================
echo GIA PHA - CLOUDFLARE ACCOUNT CHECK
echo Expected Cloudflare account: hungdiepcompany@gmail.com
echo ============================================================

npx wrangler whoami

echo.
echo Confirm manually:
echo - Email must be: hungdiepcompany@gmail.com
echo - Project must belong to GIA PHA Cloudflare account
echo.
pause