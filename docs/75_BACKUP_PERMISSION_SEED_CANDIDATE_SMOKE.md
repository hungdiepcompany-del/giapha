# Phase 75 - Backup Permission Seed Candidate Smoke

## Production Baseline

Production remains on the existing main worker `web-gia-pha`.

Phase 75 does not deploy, push, run migrations, apply schema, mutate DB, read env files, call Supabase/API/DB/network, call the backup service worker, create production backup, upload storage, restore data, or create a schedule.

## Seed Candidate Smoke Goal

Add a local smoke check that compares the SQL candidate draft with the seed dry-run script.

This smoke is source-static. It does not run SQL and does not execute any database or network operation.

## Inputs Checked

The smoke reads:

- `scripts/backup-permission-sql-candidate.sql.draft`
- `scripts/backup-permission-seed-dry-run.cjs`

It checks that both inputs exist and contain the expected backup permission names.

## Permission Consistency

The smoke checks that both files include:

- `backup.operator.view`
- `backup.operator.dry_run`
- `backup.operator.execute`
- `backup.operator.restore`

It also checks the SQL candidate has:

- `BACKUP_PERMISSION_SQL_CANDIDATE_ONLY`
- `DO_NOT_RUN_ON_PRODUCTION_WITHOUT_OWNER_APPROVAL`

## No-DB Policy

The smoke does not:

- run SQL
- call Supabase
- call DB
- call network
- read `.env.local`
- read `.dev.vars`
- mutate files
- create migration

## Expected Output

The smoke prints marker:

```txt
BACKUP_PERMISSION_SEED_CANDIDATE_SMOKE_ONLY
```

Expected output is safe JSON with:

- `ok`
- `marker`
- `sql_candidate`
- `seed_dry_run`
- `permissions`
- `db_call: false`
- `network_call: false`
- `file_mutation: false`

## Limitations

This smoke does not prove the SQL will apply to a real database.

It only proves the local candidate and dry-run script stay internally consistent before a future approval checklist.

## Phase 75 Boundary

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

Phase 76 - Backup Permission Real Migration Approval Checklist.
