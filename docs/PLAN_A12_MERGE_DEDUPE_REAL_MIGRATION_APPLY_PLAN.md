# Plan A-12 - Merge/Dedupe Real Migration Candidate + Check SQL + Apply Plan

Status: `REAL_MIGRATION_CANDIDATE_CREATED_NOT_APPLIED`

Apply status: `NOT_APPLIED`

Runtime status: `CLOSED`

## Summary

Owner marker `APPROVE_A11_MERGE_DEDUPE_SCHEMA_CANDIDATE` was received for A-12
file creation, static checking and apply planning only. A-12 creates a real
migration candidate and read-only post-apply check SQL, but does not apply DB,
seed/backfill, register permissions or open runtime merge/dedupe.

## A-12A - Real migration candidate

Migration:

`db/migrations/20260622_0009_merge_dedupe_schema_candidate.sql`

The file was scaffolded with Supabase CLI `2.107.0` using `migration new`, then
canonicalized to the repo's `YYYYMMDD_0000_` migration convention. It preserves
the A-11 reviewed six-table schema and tightening constraints.

Migration SHA256:

`9645F8E69068C73332A9CCE74E91449E06271734083A1C419176CBBDCA1C75B9`

The migration is additive only. It contains no DML, seed, backfill, destructive
SQL, function, procedure, trigger, grant, policy or `people.merge.*`
registration. All six tables enable RLS and therefore remain fail-closed.

## A-12B - Check SQL

Read-only check:

`db/checks/check_merge_dedupe_schema.sql`

The query reads PostgreSQL catalogs only and returns nine checks covering:

- required tables;
- required actor/time/checksum/evidence/reason and rollback columns;
- required named constraints;
- RLS enabled for all six tables;
- zero merge/dedupe policies;
- zero non-internal merge/dedupe triggers;
- zero merge/dedupe routines;
- both composite `(session_id, merge_id)` foreign keys;
- all relationship/layout/membership-lineage/visibility-privacy/export scopes.

Expected output: exactly 9 rows and every `passed` value is `true`.

A-12 does not run this SQL because DB apply is not approved or confirmed and no
explicit verification environment was requested.

## A-12C - Static checker

`scripts/check-merge-dedupe-real-migration-readiness.cjs` verifies the exact
migration/check paths, A-11 schema coverage, review constraints, migration
fingerprint, RLS fail-closed behavior, read-only check coverage and closed
runtime/config/dependency boundaries.

Package command:

`npm run check:merge-dedupe-real-migration-readiness`

## A-12D - Owner apply plan

This runbook is preparation only. Do not execute any apply step until the owner
provides exact marker `APPROVE_A12_MERGE_DEDUPE_DB_APPLY` in a separate phase.

### 1. Pre-apply checks

Required before apply:

1. Worktree and deployed source are identified; no unrelated migration is
   pending for the target environment.
2. Target Supabase project ref/environment is confirmed without printing any
   credential.
3. Recompute SHA256 and compare it to the reviewed fingerprint.
4. Run A-10, A-11, A-12 and migration-order checkers.
5. Review that the exact migration has no policy, permission seed or runtime SQL.
6. Confirm `psql` is available if using the command path below.

Local static commands:

```powershell
git status --short
Get-FileHash -Algorithm SHA256 -LiteralPath 'db\migrations\20260622_0009_merge_dedupe_schema_candidate.sql'
npm run check:merge-dedupe-transaction-audit-design
npm run check:merge-dedupe-schema-candidate-readiness
npm run check:merge-dedupe-real-migration-readiness
npm run check:migrations
```

No-go if the worktree contains unreviewed changes, checksum differs, target is
uncertain, more than the exact A-12 migration would be applied, or any checker
fails.

### 2. Backup/snapshot before apply

Owner/operator must confirm a current database backup or platform snapshot made
after the latest production write. Record only non-secret metadata: target
environment, snapshot timestamp, retention, restore owner and tested restore
path. Do not proceed if backup status or restore ownership is unclear.

### 3. Apply migration command

Preferred controlled shell path uses standard PostgreSQL connection variables
already prepared by the owner (`PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`,
`PGPASSWORD`, `PGSSLMODE`). Never paste them into chat, docs or command output.

After receiving `APPROVE_A12_MERGE_DEDUPE_DB_APPLY`, run exactly:

```powershell
psql -X -v ON_ERROR_STOP=1 --single-transaction -f 'db\migrations\20260622_0009_merge_dedupe_schema_candidate.sql'
```

`--single-transaction` ensures an SQL error rolls back the migration statement
set. Do not use `supabase db push` for this one-file plan: this repo's canonical
migrations live under `db/migrations`, and a broad push could include a different
pending set unless separately reviewed.

An owner-operated Supabase Dashboard SQL Editor may be used only when it applies
the exact reviewed file to the confirmed project and preserves the same
single-file/no-extra-SQL boundary.

### 4. Post-apply check SQL command

Only after apply reports success, run:

```powershell
psql -X -v ON_ERROR_STOP=1 -f 'db\checks\check_merge_dedupe_schema.sql'
```

This check reads catalogs only. It must not be replaced by a REST-only check,
because REST cannot prove RLS, policies, constraints, triggers or routines.

### 5. Expected PASS output

Expected check names:

- `required_tables_exist`
- `required_columns_exist`
- `required_constraints_exist`
- `rls_enabled_fail_closed`
- `no_merge_dedupe_policies`
- `no_merge_dedupe_triggers`
- `no_merge_dedupe_routines`
- `audit_rollback_composite_fk`
- `impact_scope_coverage`

PASS requires exactly nine rows with `passed = true`. Sanitize evidence before
recording it; never include connection strings, passwords, tokens or private
genealogy data.

### 6. Rollback plan if apply fails

- If `psql --single-transaction` fails, stop; the transaction should roll back
  automatically. Capture only sanitized error details and verify no new table
  remains before retrying.
- If apply commits but catalog verification fails, do not issue ad hoc `DROP`
  statements. Freeze further merge/dedupe work, preserve evidence and use the
  owner-confirmed database snapshot restore path or a separately reviewed
  rollback migration.
- After restore/rollback, rerun read-only checks and record the result before any
  retry.

### 7. Required owner marker

Required marker before DB apply:

`APPROVE_A12_MERGE_DEDUPE_DB_APPLY`

This marker permits only applying the reviewed schema migration and running the
read-only check SQL. It does not register `people.merge.*`, open RLS policies,
create routes/actions/services or authorize runtime merge/dedupe.

## A-12E - Decision and handoff

Decision 165 records that a real migration candidate and check SQL exist, but
DB remains not applied and runtime remains closed. Apply requires the marker
above in a separate owner-approved phase.

## A-12F - Validation

Command-level results are recorded in the work log and handoff. A-09 missing
explicit auth/session is an expected safe-skip, not a failure.

## A-12G - Commit boundary

Commit once only after all static, migration, Tree dedupe, typecheck, lint,
build and diff gates pass. Do not push.

## Explicitly deferred

- DB apply and live post-apply SQL verification.
- Seed/backfill or production data mutation.
- `people.merge.*` permission registration and RLS policies.
- Runtime merge/dedupe transaction, route, action, service or UI.
- Person/relationship deletion.
- Worker/OpenNext/Wrangler/dependency/deploy/push.

Runtime merge/dedupe remains closed.

## Owner review result

A-12 Review result: `APPROVED`.

Review found and corrected two extra closing parentheses after the composite
audit/rollback foreign-key definitions. The correction was synchronized to the
A-11 draft, the fingerprint was updated, and the A-12 checker now rejects that
invalid FK closing pattern.

Review otherwise confirms:

- six-table schema parity and required gates/coverage;
- no DML, seed/backfill, destructive SQL, routine, trigger, grant, policy or
  permission registration;
- RLS fail-closed on all six tables;
- read-only nine-row catalog verification;
- pre-apply backup, exact one-file apply, expected PASS and rollback/no-go plan.

Owner may grant `APPROVE_A12_MERGE_DEDUPE_DB_APPLY` for a separate phase that
applies only this reviewed migration and runs the read-only check SQL. Marker
status: `NOT_GRANTED_BY_THIS_REVIEW`. Runtime merge/dedupe remains closed.

## Recommended next phase

Owner review of the A-12 real migration candidate, check SQL and apply plan.
Only after explicit `APPROVE_A12_MERGE_DEDUPE_DB_APPLY` may a separate phase
apply the exact migration and capture sanitized read-only verification evidence.
