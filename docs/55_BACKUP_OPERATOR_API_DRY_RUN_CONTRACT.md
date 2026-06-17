# Phase 55 - Backup Operator API Dry-Run Contract

## Production Baseline

Production remains on the existing main worker `web-gia-pha`.

Phase 55 does not deploy, push, call the backup service worker, call production DB/network, trigger real backup, upload storage, or restore data.

## Operator API Goal

Prepare the contract for a future admin/operator API that can request backup service dry-run behavior from the main app.

This phase is docs/check-only because the repo does not yet have a clear `app/api/admin` auth/permission route pattern. A future route should be added only when the API permission boundary is explicit.

## Proposed Route

Proposed future route:

```txt
app/api/admin/backups/service-dry-run/route.ts
```

The route is not implemented in Phase 55.

## Auth/Permission Boundary

Future route must:

- be server-only
- require an authenticated admin/operator
- require an explicit backup/admin permission before returning dry-run data
- never rely on client-side checks only
- not bypass existing role/permission model

Candidate future permission:

```txt
backup.manage
```

This permission is not added in Phase 55.

## Dry-Run Response Envelope

Future route response should follow the local dry-run envelope:

- `ok`
- `code`
- `message`
- `data`
- `requestId`
- `dryRun`

Required marker if route is implemented later:

```txt
BACKUP_OPERATOR_API_DRY_RUN_ONLY
```

## No-Real-Backup Policy

The operator API must not:

- create production backup
- export production data for backup storage
- upload backup to storage
- delete backup artifacts
- restore data
- mutate Supabase data

## No-Worker-Call Policy

Phase 55 does not call the backup service worker.

Future route must start by calling the dry-run adapter only, not the worker directly.

Real worker calls require a separate approval phase.

## Failure Handling

Future route should fail closed:

- missing auth -> safe auth error
- missing permission -> safe permission error
- dry-run adapter error -> safe dry-run error
- unexpected error -> safe fallback with request id

Errors must not include secret values, bearer tokens, internal URLs, or raw private backup payloads.

## Implementation Status

Current status:

- Docs/check-only.
- Proposed route documented.
- No route file created in Phase 55.
- No API runtime behavior added.
- No backup service worker call added.

## Phase 55 Boundary

- No deploy.
- No push.
- No new route runtime.
- No worker call.
- No network call.
- No DB call.
- No secret read.
- No production backup.
- No real storage.
- No restore.

## Next Phase

Phase 56 - Main App Backup Service Binding Smoke.
