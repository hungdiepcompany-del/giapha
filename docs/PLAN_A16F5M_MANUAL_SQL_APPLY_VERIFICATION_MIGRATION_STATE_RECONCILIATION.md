# A-16F5M - Manual SQL Apply Verification & Migration State Reconciliation

Status: `A16F5M_STATUS=PASS_MANUAL_SQL_APPLY_VERIFIED_RECONCILIATION_REQUIRED`

Marker: `A-16F5M`

## Goal

A-16F5M records the owner-reported manual Supabase Dashboard SQL apply result
for the Gia Pha 4 import manifest schema and defines the migration-history
reconciliation boundary before any runtime import-manifest work.

This phase is documentation/checker/reconciliation-only. It does not run SQL,
does not run Supabase CLI dry-run/apply, does not seed, does not import Excel,
does not write `people`, does not write relationships, does not deploy and does
not push.

## Context

A-16F4R was blocked because the active Supabase CLI account could not link to
project `frkyeuxrlcflmsxxsolp`.

Owner then opened Supabase Dashboard and manually applied:

```text
20260629_0010_a16d_import_manifest_storage_candidate.sql
```

Canonical source migration:

```text
db/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql
```

Supabase CLI mirror migration:

```text
supabase/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql
```

Preflight confirmed the source and mirror migration remain byte-for-byte equal:

```text
A16F5M_SOURCE_SHA256=D22593729092FEF43C295126E74D5FDCD41ABD696A08DFEC63218C7E1851ABBE
A16F5M_MIRROR_SHA256=D22593729092FEF43C295126E74D5FDCD41ABD696A08DFEC63218C7E1851ABBE
A16F5M_MIGRATION_BRIDGE_RESULT=PASS_BYTE_FOR_BYTE
```

## Owner Manual Verification

Owner reported all four read-only checks PASS after manual SQL apply:

```text
A16F5M_MANUAL_SQL_APPLY=OWNER_APPLIED_IN_SUPABASE_DASHBOARD
A16F5M_TABLES_EXIST=PASS
A16F5M_RLS_ENABLED=PASS
A16F5M_NO_PUBLIC_ANON_POLICY=PASS
A16F5M_ZERO_SEED_ROWS=PASS
```

The five import manifest tables verified by owner:

- `import_sessions`
- `import_session_warnings`
- `import_duplicate_candidates`
- `import_relationship_candidates`
- `import_write_manifests`

Owner verification states that RLS is enabled, no unintended public/anon policy
exists, and every table has row_count = 0. This means the manual schema apply
created structure only and did not seed data.

## Boundary

A-16F5M confirms:

```text
A16F5M_DB_PUSH_STATUS=NOT_RUN
A16F5M_DB_DRY_RUN_STATUS=NOT_RUN
A16F5M_DB_APPLY_STATUS=NOT_RUN_BY_CODEX
A16F5M_SQL_RERUN_STATUS=NOT_RUN
A16F5M_SEED_STATUS=NO_SEED
A16F5M_EXCEL_IMPORT_STATUS=NO_EXCEL_IMPORT
A16F5M_PEOPLE_WRITE_STATUS=NO_WRITE
A16F5M_RELATIONSHIP_WRITE_STATUS=NO_WRITE
A16F5M_DATA_WRITE_STATUS=NO_INSERT_UPDATE_DELETE_UPSERT
A16F5M_DEPLOY_STATUS=NOT_DEPLOYED
A16F5M_PUSH_STATUS=NOT_PUSHED
```

A-16F5M did not run `supabase db push`, did not run `supabase db push --dry-run`, did not apply DB, did not run the SQL file again, did not seed, did not import Excel, did not write `people`, did not write relationships, did not insert/update/delete/upsert real data, did not deploy and did not push.

## Migration History Reconciliation Risk

Because owner applied the SQL manually in Supabase Dashboard, the database schema
now has the import manifest tables but Supabase CLI migration history may not
record migration
`20260629_0010_a16d_import_manifest_storage_candidate.sql`.

Risk:

```text
A16F5M_MIGRATION_HISTORY_RISK=MANUAL_SQL_APPLY_NOT_RECORDED_BY_SUPABASE_CLI_HISTORY
A16F5M_RECONCILIATION_REQUIRED=TRUE
```

Rules from this point:

- Do not run this migration again through `supabase db push` until a migration
  history reconciliation plan exists.
- Do not run the SQL file again.
- If Supabase CLI is needed later, check migration history first and reconcile
  before any CLI apply/dry-run that could attempt a duplicate create.
- Keep `db/migrations` as the reviewed canonical source and
  `supabase/migrations` as the byte-for-byte CLI mirror.

## A-16G Gate

A-16G may open only as a separate phase if it stays within this boundary:

```text
A16G_GATE_SCHEMA_TABLES_VERIFIED=TRUE
A16G_GATE_RUNTIME_SCOPE=IMPORT_MANIFEST_SESSION_TABLES_ONLY
A16G_GATE_PEOPLE_WRITE=FORBIDDEN
A16G_GATE_RELATIONSHIP_WRITE=FORBIDDEN
A16G_GATE_REAL_EXCEL_IMPORT=FORBIDDEN_UNTIL_SEPARATE_APPROVAL
```

A-16G runtime may only read/write import manifest/session tables. It must not
write real `people` or relationship data.

Runtime guardrail status:

- Main Worker touched: NO
- Runtime dependency added: NO
- New service Worker created: NO
- OpenNext/Wrangler config changed: NO
- Worker size risk: NO
- Service boundary recommendation: NONE for this documentation/checker-only
  reconciliation phase.
