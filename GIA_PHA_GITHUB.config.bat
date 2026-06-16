@echo off
REM ============================================================
REM GIA PHA - GITHUB SYNC V13 CONFIG
REM ============================================================

REM SCRIPT_DIR = use the folder containing these .bat files as repo folder.
REM FIXED      = use REPO_FOLDER below.
set "REPO_FOLDER_MODE=SCRIPT_DIR"
set "REPO_FOLDER=D:\CODE\GIA PHẢ"

set "REPO_URL=https://github.com/hungdiepcompany-del/giapha.git"
set "BRANCH_NAME=main"

set "EXPECTED_GITHUB_USER=hungdiepcompany-del"
set "EXPECTED_GITHUB_EMAIL=hungdiepcompany@gmail.com"

set "DEFAULT_COMMIT_MESSAGE=chore: update project files"
