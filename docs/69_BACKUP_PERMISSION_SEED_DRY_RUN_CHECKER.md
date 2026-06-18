# Phase 69 - Backup Permission Seed Dry-Run Checker

## Production Baseline

Production remains on the existing main worker `web-gia-pha`.

Phase 69 does not deploy, push, run migrations, apply schema, mutate DB, read env files, call production network/API/DB, call Supabase, call the backup service worker, create production backup, upload storage, restore data, or create a schedule.

## Seed Dry-Run Goal

Create a local dry-run command that models the backup permission seed plan without touching any database or migration file.

The command is evidence for future migration planning only.

## Dry-Run Script Behavior

Script:

```txt
scripts/backup-permission-seed-dry-run.cjs
```

Package command:

```txt
npm run backup:permission:seed:dry-run
```

The script prints marker:

```txt
BACKUP_PERMISSION_SEED_DRY_RUN_ONLY
```

It emits safe JSON with `dry_run: true`, `would_insert`, and `would_assign`.

## Expected Permissions

Expected permission rows:

```txt
backup.operator.view
backup.operator.dry_run
backup.operator.execute
backup.operator.restore
```

## Expected Role Assignments

Expected future assignment:

| Role | would_assign |
| --- | --- |
| `OWNER` | `backup.operator.view`, `backup.operator.dry_run`, `backup.operator.execute`, `backup.operator.restore` |
| `ADMIN` | `backup.operator.view`, `backup.operator.dry_run` |
| `EDITOR` | none |
| `CONTRIBUTOR` | none |
| `FAMILY_VIEWER` | none |
| `PUBLIC_VIEWER` | none |

## No-DB Policy

The dry-run script does not import Supabase, create clients, open sockets, read env files, or query DB.

It uses static local arrays only.

## No-Migration Policy

The dry-run script does not create, update, rename, or delete files in `db/migrations`.

It does not produce SQL.

## Expected Output

Expected output shape:

```json
{
  "marker": "BACKUP_PERMISSION_SEED_DRY_RUN_ONLY",
  "dry_run": true,
  "would_insert": [],
  "would_assign": []
}
```

## Failure Handling

The dry-run script should fail only if the static plan is internally inconsistent.

It must not fail because production env, Supabase, Cloudflare, Google, backup worker, storage, or DB is unavailable.

## Phase 69 Boundary

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

Phase 70 - Backup Permission Assignment Runbook.
