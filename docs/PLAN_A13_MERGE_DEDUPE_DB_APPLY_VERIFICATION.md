# Plan A-13 - Merge/Dedupe DB Apply + Read-only Schema Verification

Status: `BLOCKED_MISSING_BACKUP_CONFIRMATION`

DB apply status: `SKIPPED_BACKUP_GATE`

Check SQL status: `SKIPPED_DB_NOT_APPLIED`

Runtime status: `CLOSED`

## Summary

Owner marker `APPROVE_A12_MERGE_DEDUPE_DB_APPLY` was received for the exact
reviewed migration and read-only check SQL. Static pre-apply verification passed,
but the mandatory backup/snapshot and target/tooling confirmations were absent.

No DB connection or apply was attempted. No check SQL was run on DB.

## A-13A - Pre-apply verification

Result: `PASS`.

- Worktree was clean at start.
- HEAD was `3645208`; local `main` was ahead of `origin/main` by 5 and not behind.
- Migration exists at
  `db/migrations/20260622_0009_merge_dedupe_schema_candidate.sql`.
- Check SQL exists at `db/checks/check_merge_dedupe_schema.sql`.
- Migration SHA256 matched:
  `9645F8E69068C73332A9CCE74E91449E06271734083A1C419176CBBDCA1C75B9`.
- `npm run check:merge-dedupe-real-migration-readiness` passed.
- Static checker confirms no DML, seed/backfill, destructive SQL, routine,
  trigger, grant, policy or `people.merge.*` registration.
- Runtime merge/dedupe remains closed; no runtime/config/dependency drift was
  present.

## A-13B - Backup and snapshot confirmation

Result: `BLOCKED_MISSING_BACKUP_CONFIRMATION`.

The owner message granted the DB apply marker but did not confirm:

- a fresh backup/snapshot made after the latest production write;
- snapshot timestamp and retention;
- tested restore path and rollback owner;
- exact Supabase project ref/environment for this apply.

Shell presence checks, without reading or printing values, found these missing:

- `GIA_PHA_DB_BACKUP_CONFIRMED`
- `GIA_PHA_DB_BACKUP_TIMESTAMP`
- `GIA_PHA_DB_RESTORE_OWNER`
- `GIA_PHA_DB_TARGET_PROJECT_REF`
- `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`, `PGSSLMODE`

`psql` was also unavailable in PATH. Repo-stored env files were not read.

Per the A-12 runbook and owner prompt, marker approval does not waive backup,
target identity, rollback ownership or safe apply tooling.

## A-13C - Apply migration

Result: `SKIPPED_BACKUP_GATE`.

Migration was not applied. No Supabase/API/DB/network command was run, no SQL was
executed and no schema/data state changed.

## A-13D - Read-only check SQL

Result: `SKIPPED_DB_NOT_APPLIED`.

All nine checks remain unexecuted against DB:

| Check | Result |
| --- | --- |
| `required_tables_exist` | `SKIPPED` |
| `required_columns_exist` | `SKIPPED` |
| `required_constraints_exist` | `SKIPPED` |
| `rls_enabled_fail_closed` | `SKIPPED` |
| `no_merge_dedupe_policies` | `SKIPPED` |
| `no_merge_dedupe_triggers` | `SKIPPED` |
| `no_merge_dedupe_routines` | `SKIPPED` |
| `audit_rollback_composite_fk` | `SKIPPED` |
| `impact_scope_coverage` | `SKIPPED` |

Static coverage is PASS, but it is not promoted to live DB verification.

## A-13E - Local static validation

Result: `PASS`.

- A-10/A-11/A-12 checkers: PASS.
- Migration order and related schema/migration gates: PASS.
- Tree duplicate and polish/dedupe/data-quality gates: PASS.
- Typecheck, lint and workspace-root production build: PASS.
- Diff and cached-diff checks: PASS.
- A-09 returned expected safe-skip due missing explicit auth/session; this is not
  an A-13 local-validation failure.

Local PASS does not override the A-13B backup gate.

## A-13F - Decision and handoff

Decision 167 records the blocked result. DB remains not applied, check SQL is not
run, permission runtime is not registered and runtime merge/dedupe remains
closed.

`APPROVE_A13_MERGE_DEDUPE_DB_SCHEMA_VERIFIED` is not available because schema
apply and verification did not occur.

## A-13G - Commit boundary

Commit only the blocked-result documentation and checker allowlist compatibility
after local validation passes. Do not push.

## Resume requirements

To resume A-13, the owner/operator must provide non-secret confirmation of:

1. exact target project/environment;
2. fresh backup/snapshot timestamp and retention;
3. tested restore path and named rollback owner;
4. an approved apply window;
5. safe one-file tooling (`psql` plus shell-only PG env, or an explicitly
   owner-operated Dashboard exact-file path).

Never paste credentials into chat or commit them. Re-run A-13A before apply;
fingerprint, worktree or target drift requires a new no-go review.

## Explicit boundary

- DB not applied.
- Check SQL not run on DB.
- No seed/backfill or genealogy data mutation.
- No permission registration or RLS policy.
- No runtime route/action/service/UI.
- No Worker/OpenNext/Wrangler/dependency/deploy/push.
- `PLANNING.MD` was not read or committed.
