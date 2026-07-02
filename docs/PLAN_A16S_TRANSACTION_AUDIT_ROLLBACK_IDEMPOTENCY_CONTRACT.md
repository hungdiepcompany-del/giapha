# A-16S - Transaction Audit, Rollback and Idempotency Contract

Status: `A16S_CONTRACT_STATUS=BLOCKED_SCHEMA_AUDIT_ROLLBACK_IDEMPOTENCY_INSUFFICIENT`

Marker: `A-16S-TRANSACTION-AUDIT-ROLLBACK-IDEMPOTENCY-CONTRACT`

## Goal

Define the minimum contract required before Gia Pha 4 official import can have a
real all-or-nothing transaction branch. This document records why the current
schema is insufficient and why A-16S must stay blocked.

## Required Transaction Contract

A future execution branch must prove:

```text
A16S_CONTRACT_ALL_OR_NOTHING_REQUIRED=YES
A16S_CONTRACT_IDEMPOTENCY_REQUIRED=YES
A16S_CONTRACT_IMPORT_COMPLETION_MARKER_REQUIRED=YES
A16S_CONTRACT_AUDIT_REVISION_REQUIRED=YES
A16S_CONTRACT_ROLLBACK_MANIFEST_REQUIRED=YES
A16S_CONTRACT_POST_IMPORT_VERIFICATION_REQUIRED=YES
```

Function result must include:

- `created_people_count`;
- `created_relationship_count`;
- `audit_record_count`;
- `rollback_manifest_count`;
- `import_session_status`.

## Current Blockers

```text
A16S_IDEMPOTENCY_GUARD_STATUS=BLOCKED_SCHEMA_INSUFFICIENT
A16S_AUDIT_REVISION_CONTRACT_STATUS=BLOCKED_SCHEMA_INSUFFICIENT
A16S_ROLLBACK_MANIFEST_CONTRACT_STATUS=BLOCKED_SCHEMA_INSUFFICIENT
A16S_POST_IMPORT_VERIFICATION_CONTRACT_STATUS=DOCUMENTED_BUT_NOT_EXECUTABLE
```

Reasons:

- Existing import write manifest JSON columns can describe rollback intent, but
  A-16P-TX already records that stronger persistence may need a dedicated schema
  phase.
- Existing revision actions are not enough to represent an official import batch
  as one auditable transaction.
- No applied schema currently proves a unique import completion marker that
  blocks rerun by `import_session_id` while preserving rollback evidence.
- No applied schema currently proves count-verifiable audit and rollback records
  after a transaction commit.

## No Fake Success Rule

Because the schema/contract is insufficient, A-16S must not create a SQL
candidate that performs best-effort inserts. A future phase may first add a
reviewable schema candidate for audit/rollback/idempotency, then a later phase
may create an execution candidate.

## Boundary

```text
A16S_CONTRACT_SQL_CANDIDATE_CREATED=NO
A16S_CONTRACT_RPC_CALLED=NO
A16S_CONTRACT_OFFICIAL_IMPORT_POST_CALLED=NO
A16S_CONTRACT_REAL_GENEALOGY_WRITE_STATUS=NO_WRITE
A16S_CONTRACT_DB_PUSH_STATUS=NOT_RUN
A16S_CONTRACT_MIGRATION_REPAIR_STATUS=NOT_RUN
A16S_CONTRACT_SEED_STATUS=NOT_RUN
A16S_CONTRACT_DEPLOY_STATUS=NOT_DEPLOYED
A16S_CONTRACT_PUSH_STATUS=NOT_PUSHED
```
