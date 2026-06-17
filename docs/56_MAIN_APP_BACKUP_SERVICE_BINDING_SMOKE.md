# Phase 56 - Main App Backup Service Binding Smoke

## Production Baseline

Production remains on the existing main worker `web-gia-pha`.

Phase 56 does not deploy, push, call the backup service worker, call network/API/DB, read env files, or create production backup.

## Binding Smoke Goal

Add local/static smoke coverage for the main app backup service binding dry-run contract.

The smoke verifies source-level readiness only.

## Smoke Scope

Smoke checks:

- adapter file exists
- adapter marker exists
- dry-run action concepts exist
- guardrail script exists
- operator API contract checker exists
- required package scripts exist

## Static Checks

The smoke script reads repository source files only.

It does not import runtime app code, call fetch, read env, or execute network calls.

## No-Network Policy

The smoke script must not:

- call backup service worker
- call `fetch`
- read `process.env`
- read `.env.local`
- read `.dev.vars`
- call database
- call Cloudflare/Supabase/Google APIs

## Expected Output

Expected marker:

```txt
MAIN_APP_BACKUP_SERVICE_BINDING_SMOKE_ONLY
```

Expected result:

```txt
Result: PASS
```

## Limitations

This smoke does not prove a real deployed worker is reachable.

It only proves the current dry-run binding contract remains local/static and guarded.

## Phase 56 Boundary

- No deploy.
- No push.
- No worker call.
- No network call.
- No env read.
- No DB call.
- No production backup.
- No real storage.
- No restore.

## Next Phase

Phase 57 - Main App Binding Dry-Run Handoff.
