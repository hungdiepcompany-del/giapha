# A-16S - Official Import Transaction Execution Branch Candidate

Status: `A16S_STATUS=BLOCKED_SCHEMA_AUDIT_ROLLBACK_IDEMPOTENCY_INSUFFICIENT`

Marker: `A-16S-OFFICIAL-IMPORT-TRANSACTION-EXECUTION-BRANCH`

This phase evaluated whether a real Gia Pha 4 official import transaction
execution branch can be prepared safely. It does not run SQL, does not apply DB,
does not call RPC, does not call POST `/official-import`, and does not write
real genealogy data.

## Result

The transaction execution branch remains blocked.

```text
A16S_STATUS=BLOCKED_SCHEMA_AUDIT_ROLLBACK_IDEMPOTENCY_INSUFFICIENT
A16S_SQL_CANDIDATE_CREATED=NO
A16S_SQL_CANDIDATE_PATH=NOT_CREATED_BECAUSE_BLOCKED_SCHEMA_AUDIT_ROLLBACK_IDEMPOTENCY_INSUFFICIENT
A16S_SUPABASE_MIRROR_PATH=NOT_CREATED_BECAUSE_BLOCKED_SCHEMA_AUDIT_ROLLBACK_IDEMPOTENCY_INSUFFICIENT
A16S_SQL_MIRROR_BYTE_FOR_BYTE=N/A_SAFE_BLOCKED_NO_SQL_CANDIDATE
A16S_RUNTIME_FAIL_CLOSED=YES
A16S_CAN_RUN_OFFICIAL_IMPORT=false
A16S_OFFICIAL_IMPORT_BUTTON=DISABLED
A16S_RPC_CALLED=NO
A16S_OFFICIAL_IMPORT_POST_CALLED=NO
A16S_REAL_GENEALOGY_WRITE_STATUS=NO_WRITE
```

## Why No SQL Candidate Was Created

The current schema is not sufficient to prove the required official import
transaction contract:

- `import_write_manifests.rollback_plan` and `created_record_ids` exist, but the
  current contract already records that stronger persistence may require a
  separate schema phase.
- `revisions.action` currently allows only `create`, `update`, `delete` and
  `restore`; it does not model a batch official import audit action.
- A-16P-TX still records blockers for audit/rollback persistence:
  `A16P_TX_AUDIT_TABLE_OR_SERVICE_MISSING` and
  `A16P_TX_AUDIT_OR_ROLLBACK_PERSISTENCE_MISSING`.
- The existing RPC candidate still contains
  `REAL_EXECUTION_BRANCH_NOT_OPEN_IN_A16P_TX`.
- A safe idempotency guard for official import execution has not been proven
  beyond the existing fail-closed session status checks.

Per the A-16S prompt, this means no best-effort multi-table insert candidate may
be written.

## Runtime State

`lib/import/giapha4/official-import-service.ts` now records the A-16S blocker:

```text
A16S_OFFICIAL_IMPORT_TRANSACTION_EXECUTION_BRANCH
A16S_BLOCKED_SCHEMA_AUDIT_ROLLBACK_IDEMPOTENCY_INSUFFICIENT
```

Runtime behavior remains fail-closed:

- `status: "BLOCKED"`.
- `canRunOfficialImport: false`.
- `importedPeopleCount: 0`.
- `importedRelationshipCount: 0`.
- No TS runtime writes to `people`, `relationships`, `families`, layout, tree,
  revisions or profiles.

## Required Future Work

A later phase must first add or verify a durable schema contract for:

- official import batch audit evidence;
- rollback manifest persistence;
- import idempotency keyed by `import_session_id`;
- import completion marker;
- post-import count verification.

Only after that contract exists may a new NOT_APPLIED SQL candidate propose a
real execution branch.

## Boundary

```text
A16S_DB_PUSH_STATUS=NOT_RUN
A16S_MIGRATION_REPAIR_STATUS=NOT_RUN
A16S_SEED_STATUS=NOT_RUN
A16S_SQL_RUN_STATUS=NOT_RUN
A16S_DEPLOY_STATUS=NOT_DEPLOYED
A16S_PUSH_STATUS=NOT_PUSHED
A16S_SECRET_STORAGE_STATE_STATUS=NOT_COMMITTED
A16S_EXCEL_STATUS=NOT_COMMITTED
A16S_SERVICE_ROLE_CLIENT_SIDE_STATUS=NOT_USED
```
