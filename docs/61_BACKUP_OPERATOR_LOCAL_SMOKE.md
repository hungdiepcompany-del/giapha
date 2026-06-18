# Phase 61 - Backup Operator Local Smoke

## Production Baseline

Production remains on the existing main worker `web-gia-pha`.

Phase 61 does not deploy, push, call the backup service worker, call network/API/DB, read env files, trigger real backup, upload storage, restore data, or require a running server.

## Smoke Goal

Add a local/static smoke script for the backup operator API and UI dry-run bundle.

The smoke verifies source-level readiness only.

## Static Smoke Scope

The smoke checks:

- API route file exists
- API dry-run marker exists
- UI page exists
- UI component exists
- UI warning text exists
- guardrail script exists
- package scripts exist

## Expected Output

Expected marker:

```txt
BACKUP_OPERATOR_DRY_RUN_SMOKE_ONLY
```

Expected result:

```txt
Result: PASS
```

## No-Network Policy

The smoke must not:

- call backup service worker
- call `fetch`
- read env
- read `.env.local`
- read `.dev.vars`
- call DB
- call Cloudflare/Supabase/Google APIs
- hardcode token/key

## Limitations

This smoke does not prove a browser can click the UI button.

It only proves the source files keep the dry-run API/UI/guardrail contract intact.

## Phase 61 Boundary

- No deploy.
- No push.
- No worker call.
- No network call.
- No DB call.
- No env read.
- No production backup.
- No real storage.
- No restore.

## Next Phase

Phase 62 - Backup Operator Dry-Run Handoff.
