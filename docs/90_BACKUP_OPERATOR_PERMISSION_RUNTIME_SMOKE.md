# Phase 90 - Backup Operator Permission Runtime Smoke

## Production Baseline

Production remains on the existing main worker `web-gia-pha`.

The backup permission migration apply is owner-confirmed. Automated DB verification remains skipped because local verification credentials are missing.

## Runtime Smoke Goal

Run the existing safe smoke scripts after migration apply without deploying, calling the backup worker, creating a real backup, uploading storage, or restoring data.

## Smoke Env Placeholders

Post-migration endpoint smoke uses:

```txt
BACKUP_PERMISSION_SMOKE_BASE_URL
BACKUP_PERMISSION_SMOKE_EXPECTED_USER
```

The script does not use or print a token.

## API/UI Smoke Scope

Potential endpoint scope when explicit env is provided:

- `/admin/backups`
- `/api/admin/backups/service-dry-run`

Current environment has no explicit smoke env, so endpoint network execution was skipped.

## Dry-Run Only Policy

The API route, UI panel, service adapter, and smoke scripts remain dry-run only.

Runtime fallback `permissions.manage` still remains.

## No-Worker-Call Policy

No backup service worker was called.

The local permission guard and dry-run smoke scripts verify `worker_call: false` and related static markers.

## No-Real-Backup Policy

The smoke did not create a production backup, upload storage, or restore data.

## Smoke Result

Results:

```txt
smoke:backup-permission:post-migration = SKIPPED_NO_EXPLICIT_ENV
smoke:backup-operator:permission-guard = PASS_LOCAL_STATIC
smoke:backup-operator:dry-run = PASS_LOCAL_STATIC
```

Network execution: skipped.

Backup worker call: no.

Production backup: no.

Storage upload: no.

Restore: no.

## Failure Handling

If a future explicit-env runtime smoke fails:

- keep fallback `permissions.manage`
- keep execute/restore runtime disabled
- confirm the target URL and authenticated expected user
- verify permission rows and role assignments through an approved read-only path
- do not call the backup worker or trigger backup/restore
- record the failure in work log and handoff

## Phase 90 Boundary

- No deploy.
- No push.
- No package added.
- No fallback removal.
- No runtime execute/restore enablement.
- No DB mutation.
- No worker call.
- No production backup.
- No storage upload.
- No restore.
- No secret/token/key printed or committed.

## Next Phase

Phase 91 - Backup Permission Fallback Removal Readiness.
