# A-16T - Official Import Audit, Rollback and Idempotency Schema

Status: `A16T_STATUS=CANDIDATE_READY_NOT_APPLIED`

Marker: `A-16T-OFFICIAL-IMPORT-AUDIT-ROLLBACK-IDEMPOTENCY-SCHEMA`

This phase creates a NOT_APPLIED additive schema candidate for future Gia Pha 4
official import audit batch persistence, rollback manifest persistence and
idempotency by `import_session_id`. It does not apply DB and does not run
official import.

## Candidate Artifacts

```text
A16T_SQL_CANDIDATE_CREATED=YES
A16T_SQL_CANDIDATE_PATH=db/migrations/20260702_0014_a16t_official_import_audit_rollback_idempotency_schema_candidate.sql
A16T_SUPABASE_MIRROR_PATH=supabase/migrations/20260702_0014_a16t_official_import_audit_rollback_idempotency_schema_candidate.sql
A16T_SQL_MIRROR_BYTE_FOR_BYTE=PASS
A16T_VERIFICATION_SQL_PATH=db/checks/20260702_check_a16t_official_import_audit_rollback_idempotency_schema.sql
```

The SQL candidate contains:

```text
A16T_OFFICIAL_IMPORT_AUDIT_ROLLBACK_IDEMPOTENCY_SCHEMA_CANDIDATE
SQL_CANDIDATE_STATUS=NOT_APPLIED
DO_NOT_RUN_AUTOMATICALLY
OWNER_MANUAL_REVIEW_REQUIRED
```

## Schema Strategy

A-16T uses separate official import tables instead of changing
`revisions.action`:

- `official_import_batches` is the audit/import batch persistence table.
- `official_import_rollback_manifests` stores rollback manifest persistence.

Revision/action strategy:

```text
A16T_REVISION_ACTION_STRATEGY=SEPARATE_OFFICIAL_IMPORT_BATCH_TABLE
```

Reason: existing `revisions.action` is constrained to create/update/delete/
restore. A separate official import batch table is safer and avoids changing the
general revision action contract before a dedicated revision model phase.

## Audit Batch Persistence

`official_import_batches` stores:

- `import_session_id`;
- `actor_profile_id`;
- `status`;
- `source_type`;
- `manifest_hash`;
- expected and created people/relationship counts;
- `audit_record_count`;
- `rollback_manifest_count`;
- duplicate, validation and dry-run summaries;
- `idempotency_key`;
- `import_marker`;
- sanitized failure fields;
- timestamps and actor metadata.

```text
A16T_AUDIT_BATCH_PERSISTENCE=YES
A16T_AUDIT_BATCH_TABLE=official_import_batches
```

## Rollback Manifest Persistence

`official_import_rollback_manifests` stores created record ids/refs required for
rollback, without raw Excel rows or unnecessary PII:

- created people ids;
- created family ids;
- created family parent/child ids;
- created couple relationship ids;
- created revision ids;
- created layout ids;
- rollback order;
- rollback status;
- sanitized notes and manifest hash.

```text
A16T_ROLLBACK_MANIFEST_PERSISTENCE=YES
A16T_ROLLBACK_MANIFEST_TABLE=official_import_rollback_manifests
```

## Idempotency Guard

A-16T enforces idempotency at schema level:

- unique `official_import_batches(import_session_id)`;
- unique `official_import_batches(idempotency_key)`;
- `idempotency_key = import_session_id::text`;
- one rollback manifest per import batch/session.

```text
A16T_IDEMPOTENCY_GUARD=YES
A16T_IDEMPOTENCY_KEY=import_session_id
```

## RLS and Access

The candidate enables RLS on both new tables and adds authenticated,
owner-scoped policies using `public.has_permission('imports.create')` and
`public.current_profile_id()`. It does not add anon/public policies and does not
add broad grants.

```text
A16T_RLS_ENABLED=YES
A16T_NO_ANON_PUBLIC_GRANT=YES
A16T_NO_BROAD_GRANT=YES
A16T_NO_RLS_DISABLE=YES
```

## Runtime State

`lib/import/giapha4/official-import-service.ts` recognizes:

```text
A16T_OFFICIAL_IMPORT_AUDIT_ROLLBACK_IDEMPOTENCY_SCHEMA_CANDIDATE
A16T_BLOCKED_SCHEMA_CANDIDATE_NOT_APPLIED
```

Because this SQL candidate is not applied or verified, runtime remains locked:

```text
A16T_RUNTIME_FAIL_CLOSED=YES
A16T_CAN_RUN_OFFICIAL_IMPORT=false
A16T_OFFICIAL_IMPORT_BUTTON=DISABLED
A16T_RPC_CALLED=NO
A16T_OFFICIAL_IMPORT_POST_CALLED=NO
A16T_REAL_GENEALOGY_WRITE_STATUS=NO_WRITE
```

## Boundary

```text
A16T_SQL_RUN_STATUS=NOT_RUN
A16T_DB_PUSH_STATUS=NOT_RUN
A16T_MIGRATION_REPAIR_STATUS=NOT_RUN
A16T_SEED_STATUS=NOT_RUN
A16T_DEPLOY_STATUS=NOT_DEPLOYED
A16T_PUSH_STATUS=NOT_PUSHED
A16T_SECRET_STORAGE_STATE_STATUS=NOT_COMMITTED
A16T_EXCEL_STATUS=NOT_COMMITTED
A16T_SERVICE_ROLE_CLIENT_SIDE_STATUS=NOT_USED
```
