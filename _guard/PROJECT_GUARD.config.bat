@echo off

set "GUARD_CONFIG_VERSION=2"
set "PROJECT_KEY=giapha"
set "PROJECT_NAME=GIA PHA"
set "PROJECT_ROOT=D:\CODE\GIA PHẢ"
set "EXPECTED_BRANCH=main"

set "GITHUB_SSH_ALIAS=github-giapha"
set "GITHUB_ACCOUNT=hungdiepcompany-del"
set "GITHUB_REPO=hungdiepcompany-del/giapha"
set "GIT_USER_NAME=hungdiepcompany-del"
set "GIT_USER_EMAIL=hungdiepcompany@gmail.com"

set "CLOUDFLARE_ACCOUNT=hungdiepcompany@gmail.com"

set "DEPLOY_MODE=cloudflare"
set "PROJECT_STATUS_HOOK=%~dp0PROJECT_STATUS_HOOK.bat"
