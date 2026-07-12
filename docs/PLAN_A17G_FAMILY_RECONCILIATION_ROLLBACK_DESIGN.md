# A-17G - Family Reconciliation Rollback Design

Date: 2026-07-12

Status: `A17G_STATUS=ROLLBACK_CONTRACT_READY_FOR_OWNER_REVIEW`

## Scope

A-17G defines the rollback contract required before any future production family
reconciliation. It creates no rollback table, no migration and no RPC.

## Rollback Manifest Contract

`ROLLBACK_MANIFEST_CONTRACT_DEFINED=YES`

Each reconciliation batch must capture:

- reconciliation batch ID;
- idempotency key;
- actor profile ID reference;
- execution marker;
- execution timestamp;
- dry-run hash;
- approved audit hash;
- family records before reconciliation;
- parent memberships before reconciliation;
- child memberships before reconciliation;
- couple relationship links before reconciliation;
- layout references before reconciliation;
- canonical family chosen for each group;
- family records marked merged, voided or soft-deleted;
- audit revision IDs;
- post-execution counts;
- verification status.

Manifest rules:

- The manifest must represent every proposed family merge, parent membership
  deduplication, child membership move, couple link update and layout reference
  update.
- It must preserve soft-deleted records and inactive memberships needed to
  restore the pre-reconciliation state.
- It must never require deleting people records.
- It must not include names, dates, private notes, emails or raw auth IDs in
  operator-facing logs.

## Restore Order

`ROLLBACK_RESTORE_ORDER_DEFINED=YES`

1. Lock reconciliation batch.
2. Validate rollback eligibility.
3. Restore canonical and source family records.
4. Restore parent memberships.
5. Restore child memberships.
6. Restore couple links.
7. Restore layout references.
8. Reverse reconciliation audit state.
9. Verify counts and semantic invariants.
10. Mark rollback completed.

## Rollback Rules

- all-or-nothing transaction;
- owner-specific approval marker;
- idempotent execution;
- no anonymous or PUBLIC execution;
- no SECURITY DEFINER unless separately justified and owner-approved;
- fixed search_path;
- row locks;
- fail closed on post-reconciliation edits;
- fail closed if affected family records changed after reconciliation;
- no hard deletion required for the first reconciliation;
- rollback must restore soft-merged records;
- rollback must not remove people records;
- rollback must not affect unrelated families.

## Post-Reconciliation Edit Conflict

`POST_RECONCILIATION_EDIT_CONFLICT_DEFINED=YES`

Conflict classes:

- `ROLLBACK_STILL_SAFE`: no affected family, parent, child, couple or layout
  record changed after reconciliation; rollback may continue.
- `ROLLBACK_REQUIRES_OWNER_REVIEW`: non-structural metadata changed after
  reconciliation; rollback may continue only after owner accepts data loss or a
  merged restore plan.
- `ROLLBACK_BLOCKED_LATER_EDITS_WOULD_BE_LOST`: parent, child, couple or layout
  semantics changed after reconciliation; rollback must stop until a manual
  repair plan exists.

The future rollback verifier must compare post-reconciliation `updated_at`,
soft-delete fields, membership counts and semantic hashes against the manifest.

## Backup Requirements Before Future A-17K

`BACKUP_EVIDENCE_REQUIREMENTS_DEFINED=YES`

Mandatory evidence before any future production reconciliation:

- database backup;
- JSON export;
- GEDCOM or equivalent export;
- ZIP export;
- SHA256 hashes;
- pre-reconciliation counts;
- dry-run hash;
- approved audit report;
- owner marker.

## Future Security Boundary

- `RECONCILIATION_RPC_CREATED=NO`
- `ROLLBACK_RPC_CREATED=NO`
- `ANON_OR_PUBLIC_EXECUTION_ALLOWED=NO`
- `SECURITY_DEFINER_ALLOWED_WITHOUT_SEPARATE_OWNER_APPROVAL=NO`
- `FIXED_SEARCH_PATH_REQUIRED=YES`
- `ROW_LOCKS_REQUIRED=YES`

## Safety

- `SQL_EXECUTED=NO`
- `MUTATION_SQL_EXECUTED=NO`
- `SCHEMA_CREATED=NO`
- `MIGRATION_CREATED=NO`
- `MIGRATION_APPLIED=NO`
- `GENEALOGY_ROWS_MODIFIED=NO`
- `RECONCILIATION_RPC_CREATED=NO`
- `RECONCILIATION_EXECUTED=NO`
- `IMPORT_RPC_CALLED=NO`
- `DEPLOY=NO`
- `PUSH=NO`
