# Phase 98 - Verification Credential Completion Runbook

## Current Verification Limitation

DB verification remains `SKIPPED_MISSING_VERIFICATION_CREDENTIALS`.

Authenticated endpoint smoke remains `SKIPPED_MISSING_EXPLICIT_ENV`.

## Goal

Provide a short owner-operated procedure for setting verification credentials directly in the current Windows shell, running the approved commands, and clearing the shell variables afterward.

## Shell-Only Env Policy

Credential values must exist only in the current PowerShell/CMD process or an approved CI secret context.

Do not paste real credential values into chat, docs, source files, command history exports, screenshots, or logs.

## Windows CMD Set Examples Without Real Values

DB verification:

```bat
set BACKUP_PERMISSION_VERIFY_SUPABASE_URL=<SUPABASE_URL>
set BACKUP_PERMISSION_VERIFY_SUPABASE_SERVER_KEY=<SERVER_KEY>
set BACKUP_PERMISSION_VERIFY_MODE=read_only
npm run verify:backup-permissions:post-apply
```

Authenticated smoke using a cookie:

```bat
set BACKUP_PERMISSION_SMOKE_BASE_URL=<BASE_URL>
set BACKUP_PERMISSION_SMOKE_EXPECTED_USER=<EXPECTED_USER>
set BACKUP_PERMISSION_SMOKE_AUTH_COOKIE=<AUTH_COOKIE>
npm run smoke:backup-permission:post-migration
```

Use `BACKUP_PERMISSION_SMOKE_BEARER_TOKEN=<BEARER_TOKEN>` instead of the cookie variable only when the approved runtime supports bearer authentication.

## PowerShell Env Examples Without Real Values

DB verification:

```powershell
$env:BACKUP_PERMISSION_VERIFY_SUPABASE_URL="<SUPABASE_URL>"
$env:BACKUP_PERMISSION_VERIFY_SUPABASE_SERVER_KEY="<SERVER_KEY>"
$env:BACKUP_PERMISSION_VERIFY_MODE="read_only"
npm run verify:backup-permissions:post-apply
```

Authenticated smoke using a cookie:

```powershell
$env:BACKUP_PERMISSION_SMOKE_BASE_URL="<BASE_URL>"
$env:BACKUP_PERMISSION_SMOKE_EXPECTED_USER="<EXPECTED_USER>"
$env:BACKUP_PERMISSION_SMOKE_AUTH_COOKIE="<AUTH_COOKIE>"
npm run smoke:backup-permission:post-migration
```

Use `$env:BACKUP_PERMISSION_SMOKE_BEARER_TOKEN="<BEARER_TOKEN>"` instead of the cookie variable only when approved.

## DB Verification Env Names

- `BACKUP_PERMISSION_VERIFY_SUPABASE_URL`
- `BACKUP_PERMISSION_VERIFY_SUPABASE_SERVER_KEY`
- `BACKUP_PERMISSION_VERIFY_MODE=read_only`

## Authenticated Smoke Env Names

- `BACKUP_PERMISSION_SMOKE_BASE_URL`
- `BACKUP_PERMISSION_SMOKE_EXPECTED_USER`
- `BACKUP_PERMISSION_SMOKE_AUTH_COOKIE`
- `BACKUP_PERMISSION_SMOKE_BEARER_TOKEN`

Either cookie or bearer token is required; cookie is preferred if both are set.

## No Env File Policy

Do not save these values in `.env.local`, `.dev.vars`, or another repository file.

## No Secret Logging Policy

Verification scripts must not print URL values, server keys, cookies, bearer tokens, authorization headers, connection strings, or response bodies.

Record only PASS/FAIL/SKIP, non-secret status codes, permission codes, and safety booleans.

## Safe Skip Behavior

- Missing DB env: `SKIPPED_MISSING_VERIFICATION_CREDENTIALS`.
- DB mode other than `read_only`: `SKIPPED_VERIFICATION_MODE_NOT_READ_ONLY`.
- Missing authenticated smoke env: `SKIPPED_MISSING_EXPLICIT_ENV`.

Safe-skip returns before network execution.

## Clear Shell Variables

CMD:

```bat
set BACKUP_PERMISSION_VERIFY_SUPABASE_URL=
set BACKUP_PERMISSION_VERIFY_SUPABASE_SERVER_KEY=
set BACKUP_PERMISSION_VERIFY_MODE=
set BACKUP_PERMISSION_SMOKE_BASE_URL=
set BACKUP_PERMISSION_SMOKE_EXPECTED_USER=
set BACKUP_PERMISSION_SMOKE_AUTH_COOKIE=
set BACKUP_PERMISSION_SMOKE_BEARER_TOKEN=
```

PowerShell:

```powershell
Remove-Item Env:BACKUP_PERMISSION_VERIFY_SUPABASE_URL -ErrorAction SilentlyContinue
Remove-Item Env:BACKUP_PERMISSION_VERIFY_SUPABASE_SERVER_KEY -ErrorAction SilentlyContinue
Remove-Item Env:BACKUP_PERMISSION_VERIFY_MODE -ErrorAction SilentlyContinue
Remove-Item Env:BACKUP_PERMISSION_SMOKE_BASE_URL -ErrorAction SilentlyContinue
Remove-Item Env:BACKUP_PERMISSION_SMOKE_EXPECTED_USER -ErrorAction SilentlyContinue
Remove-Item Env:BACKUP_PERMISSION_SMOKE_AUTH_COOKIE -ErrorAction SilentlyContinue
Remove-Item Env:BACKUP_PERMISSION_SMOKE_BEARER_TOKEN -ErrorAction SilentlyContinue
```

## Phase 98 Boundary

- Runbook/check only.
- No DB query or authenticated network smoke required.
- No deploy/push, migration/apply, or DB mutation.
- No fallback removal or execute/restore enablement.
- No env-file read and no secret committed.

## Next Phase

Phase 99 - DB Verification Credential Assisted Run.
