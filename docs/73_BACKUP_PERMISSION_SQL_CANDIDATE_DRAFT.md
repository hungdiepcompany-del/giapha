# Phase 73 - Backup Permission SQL Candidate Draft

## Production Baseline

Production remains on the existing main worker `web-gia-pha`.

Phase 73 does not deploy, push, run migrations, apply schema, mutate DB, read env files, call Supabase/API/DB/network, call the backup service worker, create production backup, upload storage, restore data, or create a schedule.

## Backup Permission Baseline

Runtime backup operator guards already reference future backup permissions:

- UI target: `backup.operator.view`
- API target: `backup.operator.dry_run`
- Temporary fallback: `permissions.manage`

`backup.operator.execute` and `backup.operator.restore` are still future permissions and are not enabled in runtime.

## SQL Candidate Goal

Create a local SQL candidate draft for review before any future real migration is approved.

This candidate is not a migration file and must not be applied to any database in Phase 73.

## Candidate File Path

SQL draft path:

```txt
scripts/backup-permission-sql-candidate.sql.draft
```

The file intentionally does not live in `supabase/migrations/`.

## Permission List

Candidate permission rows:

- `backup.operator.view`
- `backup.operator.dry_run`
- `backup.operator.execute`
- `backup.operator.restore`

## Role Assignment Candidate

Candidate role mapping follows the current role model:

| Role | Candidate permissions |
| --- | --- |
| `OWNER` | `backup.operator.view`, `backup.operator.dry_run`, `backup.operator.execute`, `backup.operator.restore` |
| `ADMIN` | `backup.operator.view`, `backup.operator.dry_run` |
| `EDITOR` | none |
| `CONTRIBUTOR` | none |
| `FAMILY_VIEWER` | none |
| `PUBLIC_VIEWER` | none |

No OWNER auto-assignment is added. This draft only models role-to-permission mappings.

## Idempotency Requirement

The candidate uses `on conflict` for permission rows and role-permission mappings so the future migration can be rerunnable after review.

Future real migration implementation must keep this idempotent behavior.

## Destructive SQL Ban

The SQL candidate must not include destructive SQL such as table/schema removal, truncation, broad deletion, or dropping table columns.

The candidate must only model permission row upserts and role-permission inserts.

## Review Requirements

Before any real migration is created:

- owner approval is required
- SQL candidate must be reviewed against the active schema
- role assignment must be approved
- rollback plan must be written
- DB backup/snapshot must exist
- execute/restore activation must remain separate unless explicitly approved

## No-Real-Migration Policy

Phase 73 does not:

- create a migration in `supabase/migrations/`
- run SQL
- apply schema
- mutate DB
- call Supabase/API/DB/network
- read `.env.local`
- read `.dev.vars`
- remove fallback `permissions.manage`

## Phase 73 Boundary

- No deploy.
- No push.
- No package added.
- No migration/schema/data mutation.
- No real migration run.
- No `.env.local` read.
- No `.dev.vars` read.
- No Supabase/API/DB/network call.
- No backup service worker call.
- No production backup.
- No real storage.
- No restore.
- No hardcoded secret/token/key.

## Next Phase

Phase 74 - Backup Permission SQL Static Safety Check.
