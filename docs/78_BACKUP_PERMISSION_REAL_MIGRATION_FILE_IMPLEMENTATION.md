# Phase 78 - Backup Permission Real Migration File Implementation

## Production Baseline

Production remains on the existing main worker `web-gia-pha`.

Phase 78 creates a real migration file in the repo, but does not run migration, apply schema, mutate DB, read env files, call Supabase/API/DB/network, deploy, push, call the backup service worker, create production backup, upload storage, restore data, or create a schedule.

## Backup Permission Baseline

Runtime backup operator guards currently use:

- UI target: `backup.operator.view`
- API target: `backup.operator.dry_run`
- Temporary fallback: `permissions.manage`

`backup.operator.execute` and `backup.operator.restore` are still future permissions and are not enabled in runtime.

## Real Migration File Goal

Create the owner-approved migration file for backup operator permission metadata and recommended role assignments.

This phase only creates the file. It does not run or apply the migration.

## Migration File Path

```txt
db/migrations/20260618_0007_backup_operator_permissions.sql
```

The file follows the repo migration naming pattern `YYYYMMDD_000N_name.sql`.

Phase 83 corrected the repository path. The canonical migration directory is `db/migrations/`.

## Owner Approval Scope

Owner approval in this prompt only allows creating the migration file in the repository.

Separate owner approval is still required before:

- running migration
- applying schema
- mutating DB
- removing runtime fallback `permissions.manage`
- enabling execute/restore runtime behavior

## Permission List

The migration seeds:

- `backup.operator.view`
- `backup.operator.dry_run`
- `backup.operator.execute`
- `backup.operator.restore`

## Role Assignment Behavior

The migration follows the current repo roles:

- `OWNER`: `backup.operator.view`, `backup.operator.dry_run`, `backup.operator.execute`, `backup.operator.restore`
- `ADMIN`: `backup.operator.view`, `backup.operator.dry_run`
- Other roles: none

The repo does not currently have `SYSTEM_ADMIN`; the existing owner-level role is `OWNER`.

## Idempotency Strategy

Permission metadata uses `on conflict (code) do update`.

Role assignments use `on conflict (role_id, permission_id) do nothing`.

## Destructive SQL Ban

The migration must not include destructive SQL such as `drop table`, `drop schema`, `truncate`, `delete from`, or `alter table ... drop`.

It must not include network URL text, service-role/JWT wording, unknown extension creation, `grant all`, `revoke all`, or `security definer`.

## No-Run Policy

Phase 78 does not run SQL and does not apply DB changes.

The migration has marker:

```txt
DO_NOT_RUN_WITHOUT_SEPARATE_OWNER_APPROVAL
```

## Validation

Validation is local/static only:

- `npm run check:backup-permission-real-migration-file`
- existing candidate/seed checks
- existing migration order check
- typecheck/lint/build where possible

## Phase 78 Boundary

- No deploy.
- No push.
- No package added.
- Migration file created: yes.
- Real migration run: no.
- DB apply/mutation: no.
- No `.env.local` read.
- No `.dev.vars` read.
- No Supabase/API/DB/network call.
- No backup service worker call.
- No production backup.
- No real storage.
- No restore.
- No hardcoded secret/token/key.

## Next Phase

Phase 79 - Backup Permission Migration Static Verification.
