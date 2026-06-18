# Phase 88 - Backup Permission Real Migration Apply Execution

## Production Baseline

Production remains on the existing main worker `web-gia-pha`.

Phase 88 records the owner-confirmed manual migration apply on the Supabase Dashboard. No application deploy or repository push was performed.

## Owner Approval Scope

The owner explicitly approved applying only:

```txt
db/migrations/20260618_0007_backup_operator_permissions.sql
```

The approval did not include deploy, push, fallback removal, runtime execute enablement, runtime restore enablement, production backup, or production restore.

## Migration File Path

Canonical migration file:

```txt
db/migrations/20260618_0007_backup_operator_permissions.sql
```

## Pre-Flight Checks Run

The following checks passed before recording the apply:

- `npm run check:backup-permission-migration-canonical-path`
- `npm run check:backup-permission-apply-approval-gate`
- `npm run check:backup-permission-pre-apply-verification-checklist`
- `npm run check:backup-permission-real-migration-static-verification`
- `npm run check:backup-permission-real-migration-file`
- `npm run check:migrations`
- `git diff --check`

## Apply Command Used

Apply method:

```txt
Supabase Dashboard SQL Editor - manual execution
```

Target project ref:

```txt
frkyeuxrlcflmsxxsolp
```

No CLI command, connection string, access token, service-role key, or database password was printed or committed.

## Apply Result

Apply result: owner-confirmed successful execution on the correct Supabase project.

The migration was applied through the Supabase Dashboard before this documentation update.

## DB Mutation Result

DB mutation result: yes, owner-confirmed.

The intended mutation scope is limited to backup operator permission metadata and role-permission assignments defined in the canonical migration file.

Phase 89 performs post-apply verification where credentials or an authenticated verification path are available.

## Permissions Expected

Expected permissions:

- `backup.operator.view`
- `backup.operator.dry_run`
- `backup.operator.execute`
- `backup.operator.restore`

## Role Assignments Expected

Expected role assignments:

- `OWNER`: all four backup operator permissions
- `ADMIN`: `backup.operator.view`, `backup.operator.dry_run`
- Other roles: none

## What Was Not Changed

- No application runtime code changed.
- No migration SQL content changed.
- No deploy occurred.
- No push occurred.
- No backup service worker was called.
- No production backup was created.
- No production restore was performed.
- No domain, Auth, or OAuth configuration changed.

## No-Deploy/No-Push Boundary

No deploy was performed.

No push was performed.

## Fallback Still Remains

Runtime fallback `permissions.manage` still remains in the backup operator API and UI guards.

Fallback removal requires a separate owner approval after post-apply verification and runtime smoke.

## Execute/Restore Still Disabled

`backup.operator.execute` is metadata only and runtime execute remains disabled.

`backup.operator.restore` is metadata only and runtime restore remains disabled.

## Phase 88 Boundary

- Migration apply: owner-confirmed successful.
- DB mutation: yes, limited to the migration scope.
- No deploy.
- No push.
- No package added.
- No fallback removal.
- No runtime execute/restore enablement.
- No worker call.
- No production backup.
- No production restore.
- No secret/token/key/connection string committed or printed.

## Next Phase

Phase 89 - Backup Permission Post-Apply Verification.
