# Phase 85 - Backup Permission Rollback Drill Plan

## Production Baseline

Production remains on the existing main worker `web-gia-pha`.

Phase 85 documents a rollback drill plan for a future owner-approved backup permission migration execution. It does not run rollback, run migration, apply schema, mutate DB, read env files, call Supabase/API/DB/network, deploy, push, call the backup service worker, create production backup, upload storage, restore data, or create a schedule.

## Canonical Migration Path

The canonical migration path is:

```txt
db/migrations/20260618_0007_backup_operator_permissions.sql
```

## Rollback Drill Goal

The goal is to define how operators decide, communicate, and recover if the future permission migration causes an access or assignment issue.

This plan is for readiness only. It is not a rollback execution script.

## Failure Scenarios

Required failure scenarios:

- owner/admin mat quyen xem `/admin/backups`
- API dry-run tra 403 nham
- permission seed thieu `backup.operator.view`
- permission seed thieu `backup.operator.dry_run`
- role assignment sai
- migration applied to wrong project
- fallback removal duoc thuc hien qua som

## Detection Signals

Detection signals include:

- `/admin/backups` redirects intended OWNER or ADMIN to unauthorized
- `/api/admin/backups/service-dry-run` returns unexpected 401/403 for intended role
- database query shows missing `backup.operator.view`
- database query shows missing `backup.operator.dry_run`
- database query shows ADMIN received execute or restore unexpectedly
- smoke owner cannot confirm expected route behavior
- project identity does not match the approved target

## Immediate Safe Action

If a future apply or smoke reveals an issue:

- stop further migration or permission changes
- do not remove fallback `permissions.manage`
- do not enable execute/restore runtime behavior
- do not trigger production backup or restore
- record observed failure and target project identity
- notify owner, rollback owner, and smoke owner

## Rollback Options

Rollback options must be chosen by the owner and rollback owner after checking the failure scope.

Supported readiness options:

- restore from DB backup/snapshot
- remove unintended role-permission mappings
- keep permission rows but correct role mappings
- keep runtime fallback `permissions.manage` while access is repaired

## Restore-From-Snapshot Option

Use restore-from-snapshot only if the approved backup/snapshot is available and the owner approves the downtime/risk tradeoff.

Do not store snapshot evidence, secret values, or access links in the repo.

## Permission Assignment Rollback Option

If only role assignment is wrong, future rollback may remove unintended `role_permissions` rows for backup operator permissions.

Do not delete unrelated permissions or roles.

Do not broaden permissions without owner approval.

## Fallback permissions.manage Behavior

Runtime fallback `permissions.manage` remains the safety bridge until post-migration smoke passes and owner separately approves removal.

If backup operator permissions fail, keep or restore fallback `permissions.manage` in the API/UI guards while DB assignments are corrected.

## Communication Checklist

Communication checklist:

- identify the target Supabase project
- identify the migration path
- identify the failing role/user class
- identify whether fallback still exists
- identify rollback owner and smoke owner
- record owner decision before any DB mutation
- update work log and handoff after the drill or rollback

## No-Rollback-Execution Policy

Phase 85 does not run rollback.

Phase 85 does not run migration or apply DB changes.

Phase 85 does not connect to Supabase, call network, read secrets, deploy, push, create backups, upload storage, restore data, or create schedules.

## Phase 85 Boundary

- No deploy.
- No push.
- No package added.
- No migration run.
- No DB apply/mutation.
- No rollback execution.
- No `.env.local` read.
- No `.dev.vars` read.
- No Supabase/API/DB/network call.
- No backup service worker call.
- No production backup.
- No real storage.
- No restore.
- No hardcoded secret/token/key.

## Next Phase

Phase 86 - Backup Permission Apply Approval Gate.
