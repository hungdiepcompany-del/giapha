# Phase 76 - Backup Permission Real Migration Approval Checklist

## Production Baseline

Production remains on the existing main worker `web-gia-pha`.

Phase 76 does not deploy, push, create a real migration, run migrations, apply schema, mutate DB, read env files, call Supabase/API/DB/network, call the backup service worker, create production backup, upload storage, restore data, or create a schedule.

## Real Migration Approval Goal

Document the required approval gate before any future phase may create a real backup permission migration or apply DB changes.

This checklist is not approval by itself. It is a readiness artifact for owner review.

## Required Owner Approval

Required approval marker:

```txt
OWNER_APPROVAL_REQUIRED_BEFORE_BACKUP_PERMISSION_REAL_MIGRATION=true
```

The owner must explicitly approve a future phase before:

- creating a real migration file
- applying a real migration
- mutating permission rows
- mutating role-permission mappings
- removing fallback `permissions.manage`
- enabling real execute/restore behavior

## Required SQL Candidate Checks

Before real migration work:

- `npm run check:backup-permission-sql-candidate-draft` must pass.
- `npm run check:backup-permission-sql-static-safety` must pass.
- SQL candidate must contain `BACKUP_PERMISSION_SQL_CANDIDATE_ONLY`.
- SQL candidate must contain `DO_NOT_RUN_ON_PRODUCTION_WITHOUT_OWNER_APPROVAL`.
- SQL candidate must be reviewed against current production schema.
- SQL candidate must be converted into a real migration only in an approved future phase.

## Required Seed Dry-Run Checks

Before real migration work:

- `npm run backup:permission:seed:dry-run` must pass.
- `npm run check:backup-permission-seed-dry-run` must pass.
- `npm run smoke:backup-permission:seed-candidate` must pass.
- `npm run check:backup-permission-seed-candidate-smoke` must pass.
- `would_insert` and `would_assign` must match owner-approved role mapping.

## Required Backup Of Current DB

Before applying any future real migration:

- create or confirm a DB backup/snapshot
- record backup/snapshot time
- record who verified the backup/snapshot
- confirm restore access for the backup/snapshot
- keep backup evidence outside chat and outside repo if it contains sensitive data

## Required Rollback Plan

Rollback plan must define:

- how to remove unintended `role_permissions` mappings
- whether to keep `permissions` rows for audit/reference history
- when permission rows may be removed
- how to restore runtime fallback `permissions.manage`
- how to verify unauthorized roles remain denied
- who approves rollback execution

## Required Production Window

Before applying any future real migration:

- choose a production window
- confirm expected downtime is none or clearly documented
- notify operator/owner
- freeze unrelated schema/data changes
- keep a validation operator available after apply

## Required Post-Migration Validation

After any future real migration:

- verify `backup.operator.view` exists
- verify `backup.operator.dry_run` exists
- verify `backup.operator.execute` exists
- verify `backup.operator.restore` exists
- verify `OWNER` mapping matches owner approval
- verify `ADMIN` mapping matches owner approval
- verify viewer/public roles did not receive backup permissions
- verify `/admin/backups` access for intended role
- verify `/api/admin/backups/service-dry-run` JSON 401/403 behavior for unauthorized users
- verify execute/restore still not enabled unless explicitly approved
- run permission guardrails and seed candidate checks again

## Explicit No-Go Conditions

Do not create or apply a real migration if any condition is true:

- owner approval is missing
- SQL candidate has not been reviewed
- rollback plan is missing
- DB backup/snapshot is missing
- production window is unknown
- local checks have not passed
- permission assignment has not been confirmed
- fallback removal plan has not been confirmed
- execute/restore real activation boundary has not been confirmed
- secrets or env values would need to be pasted into chat
- production incident or unrelated schema change is active

## Phase 76 Boundary

- No deploy.
- No push.
- No package added.
- No migration/schema/data mutation.
- No real migration file.
- No real migration run.
- No `.env.local` read.
- No `.dev.vars` read.
- No Supabase/API/DB/network call.
- No backup service worker call.
- No production backup.
- No real storage.
- No restore.
- No hardcoded secret/token/key.
- No real migration in Phase 76.

## Next Phase

Phase 77 - Backup Permission Migration Candidate Handoff.
