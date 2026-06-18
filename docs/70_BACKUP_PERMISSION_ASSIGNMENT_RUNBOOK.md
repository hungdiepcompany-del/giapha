# Phase 70 - Backup Permission Assignment Runbook

## Production Baseline

Production remains on the existing main worker `web-gia-pha`.

Phase 70 does not deploy, push, run migrations, apply schema, mutate DB, read env files, call production network/API/DB, call Supabase, call the backup service worker, create production backup, upload storage, restore data, or create a schedule.

## Assignment Goal

Document the future operator workflow for assigning backup permissions after an approved migration/seed exists.

This runbook is guidance only and does not grant any permission.

## Permission List

Backup permission list:

- `backup.operator.view`: view the backup operator UI/panel.
- `backup.operator.dry_run`: run the backup dry-run route.
- `backup.operator.execute`: reserved for real backup execution later.
- `backup.operator.restore`: reserved for real restore execution later.

## Recommended Role Assignments

| Role | Recommended permissions |
| --- | --- |
| `OWNER` | `backup.operator.view`, `backup.operator.dry_run`, `backup.operator.execute`, `backup.operator.restore` |
| `ADMIN` | `backup.operator.view`, `backup.operator.dry_run` |
| Other roles | none by default unless owner approves |

Expanded recommendation:

```txt
OWNER:
- backup.operator.view
- backup.operator.dry_run
- backup.operator.execute
- backup.operator.restore

ADMIN:
- backup.operator.view
- backup.operator.dry_run

Other roles:
- none by default unless owner approves
```

Repo roles included in "Other roles" today:

- `EDITOR`
- `CONTRIBUTOR`
- `FAMILY_VIEWER`
- `PUBLIC_VIEWER`

## Operator Assignment Workflow

Future assignment workflow after migration approval:

1. Confirm the future migration/seed has inserted the four permission rows.
2. Confirm owner has approved which roles receive backup permissions.
3. Assign role permissions through an approved migration or admin flow.
4. Verify UI/API dry-run access for intended roles.
5. Verify non-authorized roles remain denied.
6. Keep execute/restore disabled in runtime until separate real-backup approval.

## Approval Required Before Assignment

Owner approval is required before:

- adding backup permissions to DB
- assigning `backup.operator.execute`
- assigning `backup.operator.restore`
- granting backup permissions to any role beyond `OWNER` and `ADMIN`
- enabling any real worker call, backup, storage upload, restore or schedule

## Verification Checklist

- `backup.operator.view` exists in `permissions`.
- `backup.operator.dry_run` exists in `permissions`.
- `backup.operator.execute` exists in `permissions`.
- `backup.operator.restore` exists in `permissions`.
- `OWNER` has all four backup permissions if owner approved.
- `ADMIN` has only view/dry_run unless owner explicitly approves more.
- `EDITOR`, `CONTRIBUTOR`, `FAMILY_VIEWER`, and `PUBLIC_VIEWER` do not receive backup permissions by default.
- `/admin/backups` renders for intended roles.
- `/api/admin/backups/service-dry-run` returns success for intended roles.
- Unauthorized users receive login/unauthorized or JSON 401/403.

## Rollback Checklist

- Remove role mappings for unintended backup permissions.
- Keep permission rows if audit/reference history may depend on them.
- Remove permission rows only if owner approves and no references exist.
- Confirm `permissions.manage` fallback still protects operator UI/API.
- Re-run permission smoke and guardrails.
- Record rollback result in work log and handoff.

## No-DB-Mutation Policy

Phase 70 does not:

- run SQL
- create migration
- modify migration
- assign permission
- assign role
- update profile role
- read `.env.local`
- read `.dev.vars`
- call Supabase
- call DB/network/API

## Phase 70 Boundary

- No deploy.
- No push.
- No package added.
- No migration/schema/data mutation.
- No real migration run.
- No `.env.local` read.
- No `.dev.vars` read.
- No Supabase call.
- No production network/API/DB call.
- No backup service worker call.
- No production backup.
- No real storage.
- No restore.
- No hardcoded secret/token/key.

## Next Phase

Phase 71 - Backup Permission Activation Guardrails.
