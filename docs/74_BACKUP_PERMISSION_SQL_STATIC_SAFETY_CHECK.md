# Phase 74 - Backup Permission SQL Static Safety Check

## Production Baseline

Production remains on the existing main worker `web-gia-pha`.

Phase 74 does not deploy, push, run migrations, apply schema, mutate DB, read env files, call Supabase/API/DB/network, call the backup service worker, create production backup, upload storage, restore data, or create a schedule.

## SQL Static Safety Goal

Add a stronger static safety checker for the backup permission SQL candidate draft.

The checker validates the draft as a review artifact only. It does not run SQL and does not require a database connection.

## Candidate Path

The checker scans:

```txt
scripts/backup-permission-sql-candidate.sql.draft
```

The candidate must remain outside `supabase/migrations/`.

## Forbidden Patterns

The static safety checker rejects:

- `drop table`
- `drop schema`
- `truncate`
- `delete from`
- `alter table drop`
- `create extension`
- `grant all`
- `revoke all`
- `security definer`
- `http`
- `https`
- `service_role`
- `anon key`
- `jwt secret`

These patterns are forbidden because this candidate should only model idempotent permission and role-permission inserts.

## Required Markers

The SQL candidate must include:

```txt
BACKUP_PERMISSION_SQL_CANDIDATE_ONLY
DO_NOT_RUN_ON_PRODUCTION_WITHOUT_OWNER_APPROVAL
```

The candidate must also include all four backup permission names:

- `backup.operator.view`
- `backup.operator.dry_run`
- `backup.operator.execute`
- `backup.operator.restore`

## Idempotency Expectations

The candidate must include an idempotency concept:

- `on conflict`
- or `where not exists`
- or an explicit comment that idempotency still requires review

Current candidate uses `on conflict`.

## No-Run Policy

Phase 74 does not create or run a real migration.

No SQL from the candidate is executed locally, in staging, or in production.

## Failure Handling

If the checker fails:

- do not run the SQL candidate
- do not create a real migration from it
- fix the draft or document the blocker
- re-run the static checker and prior candidate draft checker

## Phase 74 Boundary

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

Phase 75 - Backup Permission Seed Candidate Smoke.
