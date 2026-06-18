# Phase 57 - Main App Binding Dry-Run Handoff

## Current Production Baseline

Production remains on the existing main worker `web-gia-pha`.

This phase does not deploy, push, call network/API/DB, read env files, call the backup service worker, create production backup, upload storage, or restore data.

## Backup Service Current Status

The backup service worker remains prepared but not deployed by this bundle.

Known service path:

```txt
services/backup-service
```

Known planned endpoints:

```txt
GET /health
POST /internal/backup/dry-run
POST /internal/backup/fixture-verify
```

Runtime status:

- Real deploy: not executed.
- Real storage: not selected.
- Real main app worker call: not implemented.
- Production backup: not created.

## Phase 53-57 Summary

Phase 53 added the dry-run-only main app adapter at `server/services/backup-service-client.ts`.

Phase 54 added source guardrails with `check:backup-service-binding-guardrails`.

Phase 55 added operator API dry-run contract docs/check without creating a runtime route.

Phase 56 added `smoke:main-app-backup-service-binding` and `check:main-app-backup-service-binding-smoke`.

Phase 57 records this handoff and keeps the integration dry-run-only.

## Main App Dry-Run Adapter Status

Adapter path:

```txt
server/services/backup-service-client.ts
```

Required marker:

```txt
MAIN_APP_BACKUP_SERVICE_CLIENT_DRY_RUN_ONLY
```

Current behavior:

- Returns local dry-run envelopes.
- Supports health, dry-run and fixture-verify action concepts.
- Does not call a real backup service worker.
- Does not read env values.
- Does not call network/API/DB.

## Guardrail Status

Guardrail script:

```txt
scripts/check-backup-service-binding-guardrails.cjs
```

Package script:

```txt
check:backup-service-binding-guardrails
```

Purpose:

- Block hardcoded backup worker URL/token patterns.
- Block real backup/storage/restore trigger patterns.
- Keep placeholder-only integration work safe until explicit approval.

## Operator API Contract Status

Contract doc:

```txt
docs/55_BACKUP_OPERATOR_API_DRY_RUN_CONTRACT.md
```

Checker:

```txt
scripts/check-backup-operator-api-dry-run-contract.cjs
```

Package script:

```txt
check:backup-operator-api-dry-run-contract
```

Current route status:

- Runtime route not created.
- Proposed route remains `app/api/admin/backups/service-dry-run/route.ts`.
- Route should wait until admin API auth/permission boundary is clear.

## Binding Smoke Status

Smoke script:

```txt
scripts/smoke-main-app-backup-service-binding.cjs
```

Package script:

```txt
smoke:main-app-backup-service-binding
```

Checker:

```txt
scripts/check-main-app-backup-service-binding-smoke.cjs
```

Current behavior:

- Reads repository source files only.
- Verifies adapter, guardrail and operator contract presence.
- Reports source-level readiness.
- Performs no real worker call.

## What Is Implemented

- Dry-run server adapter contract.
- Source guardrail checker.
- Operator API dry-run contract docs/check.
- Binding smoke script.
- Binding smoke checker.
- Phase 53-57 handoff documentation.

## What Is Not Implemented

- No runtime operator API route.
- No service binding configured in main app runtime.
- No internal URL/token fallback.
- No deployed backup service worker call.
- No production backup.
- No real storage upload.
- No restore flow.
- No scheduled backup job.

## Boundary

- no real worker call
- no deploy
- no push
- no production backup
- no real storage
- no restore
- no secret committed
- no `.env.local` read
- no `.dev.vars` read
- no Cloudflare/Supabase/Google API call

## Known Notes

- Direct workspace `npm run build` may fail on Windows when `.next` files are locked.
- Clean temp build is the preferred confirmation when the workspace build hits EPERM.
- `npm audit --audit-level=moderate` has known advisories in the current dependency tree.
- Do not run `npm audit fix --force` unless a separate dependency upgrade phase approves breaking changes.

## Recommended Next Phase

Recommended options:

- Phase 58 - Backup Operator UI Dry-Run Panel.
- Backup Service Worker Manual Deploy Execution, only with explicit owner approval and real secret readiness.
- Vietnamese Genealogy Domain Model Readiness.
