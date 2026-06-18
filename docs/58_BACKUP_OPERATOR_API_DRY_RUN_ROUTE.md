# Phase 58 - Backup Operator API Dry-Run Route

## Production Baseline

Production remains on the existing main worker `web-gia-pha`.

Phase 58 does not deploy, push, call the backup service worker, call production DB/network, read env files, trigger real backup, upload storage, or restore data.

## Backup Service Baseline

The backup service worker remains scaffolded but not deployed by this phase.

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

## API Route Goal

Add a main app runtime route for operator/admin dry-run checks while keeping the route local and non-mutating.

The route returns a dry-run envelope only.

## Route Path

Implemented route:

```txt
app/api/admin/backups/service-dry-run/route.ts
```

Public URL path:

```txt
/api/admin/backups/service-dry-run
```

Required marker:

```txt
BACKUP_OPERATOR_API_DRY_RUN_ONLY
```

## Dry-Run Response Envelope

The route exposes:

- `mode: "dry_run"`
- `worker_call: false`
- `production_backup: false`
- `storage_upload: false`
- `restore: false`
- local adapter envelopes from `server/services/backup-service-client.ts`

## Auth/Permission Boundary

The route is currently a dry-run/operator contract route.

It does not read Supabase permission context because this phase must not call DB/network. Real operator auth and permission hardening must be added in a later phase with an explicit server-side API permission pattern.

Recommended future permission:

```txt
backup.manage
```

## No-Worker-Call Policy

The route must not call the backup service worker directly.

It may use the local dry-run adapter only.

## No-Real-Backup Policy

The route must not:

- create production backup
- export production data for backup storage
- upload backup to storage
- restore data
- mutate Supabase data
- schedule backup jobs

## Failure Handling

The route currently returns a deterministic dry-run envelope.

Future failure handling must not expose secret values, bearer tokens, internal URLs, raw backup payloads, or private family data.

## Phase 58 Boundary

- No deploy.
- No push.
- No worker call.
- No network call.
- No DB call.
- No env read.
- No secret read.
- No production backup.
- No real storage.
- No restore.

## Next Phase

Phase 59 - Backup Operator UI Dry-Run Panel.
