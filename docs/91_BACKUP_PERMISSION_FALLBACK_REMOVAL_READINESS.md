# Phase 91 - Backup Permission Fallback Removal Readiness

## Production Baseline

Production remains on the existing main worker `web-gia-pha`.

Migration apply is owner-confirmed. Automated DB verification and explicit-env endpoint runtime smoke have not completed because local credentials/env are unavailable.

## Fallback Removal Readiness Goal

Assess whether the temporary fallback `permissions.manage` can be removed from the backup operator API and UI guards.

Phase 91 does not change runtime code.

## Current Fallback Status

Fallback `permissions.manage` still remains in Phase 91.

Current locations:

- `app/api/admin/backups/service-dry-run/route.ts`
- `app/(admin)/admin/backups/page.tsx`

Do not remove fallback until owner separately approves.

## Migration Apply Status

Status:

```txt
OWNER_CONFIRMED_APPLIED
```

Migration:

```txt
db/migrations/20260618_0007_backup_operator_permissions.sql
```

Target project ref: `frkyeuxrlcflmsxxsolp`.

## Permission Verification Status

Status:

```txt
SKIPPED_MISSING_VERIFICATION_CREDENTIALS
```

The four permission rows and OWNER/ADMIN assignments have not been independently queried by Codex.

## Runtime Smoke Status

Status:

```txt
PARTIAL_LOCAL_STATIC_ONLY
```

- Permission guard smoke: PASS local/static.
- Dry-run smoke: PASS local/static.
- Explicit-env endpoint smoke: SKIPPED.

## Required Additional Approval

Separate owner approval is required before removing fallback `permissions.manage`.

That approval should occur only after:

- read-only DB verification passes
- explicit-env authenticated endpoint smoke passes
- intended OWNER and ADMIN users are confirmed
- rollback plan is ready

## API Fallback Removal Readiness

API readiness:

```txt
NOT_READY_FOR_FALLBACK_REMOVAL
```

Reason: `backup.operator.dry_run` assignment has not been independently verified and authenticated endpoint smoke has not run.

## UI Fallback Removal Readiness

UI readiness:

```txt
NOT_READY_FOR_FALLBACK_REMOVAL
```

Reason: `backup.operator.view` assignment has not been independently verified and authenticated page smoke has not run.

## Rollback Plan

If a future approved fallback removal breaks access:

- restore fallback `permissions.manage`
- verify permission rows and role assignments
- run API/UI permission guard checks
- keep execute/restore runtime disabled
- record affected role/user and owner decision

## No-Runtime-Change Policy

Phase 91 is docs/check only.

It does not remove fallback, change permission guards, deploy, push, mutate DB, call the backup worker, create backup, upload storage, or restore data.

## Phase 91 Boundary

- Readiness result: NOT_READY_FOR_FALLBACK_REMOVAL.
- Fallback remains.
- No runtime change.
- No deploy.
- No push.
- No DB mutation.
- No worker call.
- No production backup.
- No production restore.
- No secret/token/key printed or committed.

## Next Phase

Phase 92 - Backup Permission Apply Handoff.
