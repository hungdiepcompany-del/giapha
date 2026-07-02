# A-16R-RUNBOOK - Official Gia Pha 4 Import Execution Runbook

Status: `A16R_RUNBOOK_STATUS=PASS_RUNBOOK_READY_NOT_EXECUTED`

Marker: `A-16R-RUNBOOK`

Session under review:

```text
2af4bfb6-a20e-453e-9804-1b8c0afbdd68
```

Required future owner approval marker:

```text
APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68
```

## Goal

This runbook prepares a later, separately approved A-16R official Gia Pha 4
import execution for one session. It is not an execution phase and does not call
the official import route or RPC.

## Preconditions Before Any Future Execution

The future execution phase must verify all conditions again immediately before
opening the official import:

```text
A16R_RUNBOOK_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68
A16R_RUNBOOK_STAGING_PEOPLE_COUNT=102
A16R_RUNBOOK_STAGING_RELATIONSHIP_COUNT=134
A16R_RUNBOOK_VALIDATION_ERROR_COUNT=0
A16R_RUNBOOK_DRY_RUN_BLOCKER_COUNT=0
A16R_RUNBOOK_DUPLICATE_UNRESOLVED_COUNT=0
A16R_RUNBOOK_DUPLICATE_NEEDS_REVIEW_COUNT=0
A16R_RUNBOOK_DUPLICATE_CREATE_NEW_COUNT=8
A16R_RUNBOOK_DUPLICATE_BLOCKER_STATUS=PASS
```

Required documented readiness:

- Rollback plan:
  `docs/PLAN_A16M_OFFICIAL_IMPORT_TRANSACTION_ROLLBACK_AUDIT_DESIGN.md`.
- Rollback/audit manifest contract:
  `docs/PLAN_A16P_TX_ROLLBACK_AUDIT_MANIFEST_CONTRACT.md`.
- A-16P-TX owner apply/verify PASS for
  `public.a16p_tx_execute_giapha4_official_import`, with the function still
  fail-closed until a later execution phase explicitly opens it.
- A-16Q-DUP-DECISION-VERIFY owner evidence:
  `create_new=8`, `unresolved=0`, `needs_review=0`.

## Required Marker Gate

The exact marker must appear in a separate future prompt:

```text
APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68
```

If the marker is absent, misspelled, scoped to a different session or mixed with
unrelated execution instructions, stop and keep official import locked.

## No-Go Checklist

Stop before any future import execution if any item is true:

- Session id is not exactly `2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
- Staging people count is not `102`.
- Staging relationship count is not `134`.
- Validation errors are not `0`.
- Dry-run blockers are not `0`.
- Duplicate `unresolved` count is not `0`.
- Duplicate `needs_review` count is not `0`.
- Duplicate `create_new` count is not `8`.
- Rollback plan or audit plan is missing.
- Owner marker is missing or does not match the session.
- Auth, permission or profile context does not match the owner/admin execution
  requirement.
- The transaction helper is not verified for the target project.
- The UI or route indicates `canRunOfficialImport=false` during a phase that
  claims execution is open.
- Any unexpected route, RPC, table write or session mismatch appears.

## Intended Future Route And RPC

These names are recorded for the later approved execution phase only. They are
not called in A-16R-PREFLIGHT-BUNDLE:

```text
A16R_RUNBOOK_OFFICIAL_IMPORT_ROUTE=POST /api/admin/import-sessions/2af4bfb6-a20e-453e-9804-1b8c0afbdd68/official-import
A16R_RUNBOOK_OFFICIAL_IMPORT_RPC=public.a16p_tx_execute_giapha4_official_import
A16R_RUNBOOK_ROUTE_STATUS=NOT_CALLED
A16R_RUNBOOK_RPC_STATUS=NOT_CALLED
```

## Rollback Checklist

Before any future execution, confirm the operator can identify and use:

- Import session id and transaction/audit identifiers.
- Created people, relationships, family/layout/revision/profile effects.
- Rollback manifest rows and audit manifest rows.
- A stop path if any partial import, count mismatch or permission mismatch is
  detected.
- A fresh backup or restore point appropriate for the target Supabase project.

## Audit Checklist

After a future approved execution, verify:

- Import session id and owner/operator identity are recorded.
- Source staging counts and final write counts are recorded.
- Created people and relationships are tied back to the session.
- Duplicate decisions remain traceable as staging decisions.
- Rollback manifest is complete.
- Audit/revision records exist where the runtime contract requires them.
- No auto merge, auto link or unapproved data repair happened.

## Post-Run Verification For A Later Phase

The later execution phase must verify:

```text
A16R_RUNBOOK_POST_RUN_SESSION_ID_MATCH=REQUIRED
A16R_RUNBOOK_POST_RUN_PEOPLE_COUNT_MATCH=REQUIRED
A16R_RUNBOOK_POST_RUN_RELATIONSHIP_COUNT_MATCH=REQUIRED
A16R_RUNBOOK_POST_RUN_AUDIT_MANIFEST=REQUIRED
A16R_RUNBOOK_POST_RUN_ROLLBACK_MANIFEST=REQUIRED
A16R_RUNBOOK_POST_RUN_NO_PARTIAL_IMPORT=REQUIRED
```

If any verification result is missing or inconsistent, stop, do not rerun the
import, and follow the rollback/audit plan.

## Boundary For This Bundle

This runbook confirms:

```text
A16R_RUNBOOK_SQL_STATUS=NOT_RUN
A16R_RUNBOOK_DB_PUSH_STATUS=NOT_RUN
A16R_RUNBOOK_MIGRATION_REPAIR_STATUS=NOT_RUN
A16R_RUNBOOK_SEED_STATUS=NOT_RUN
A16R_RUNBOOK_RPC_STATUS=NOT_CALLED
A16R_RUNBOOK_OFFICIAL_IMPORT_POST_STATUS=NOT_CALLED
A16R_RUNBOOK_REAL_GENEALOGY_WRITE_STATUS=NO_WRITE
A16R_RUNBOOK_AUTO_PEOPLE_CREATE_STATUS=NO_AUTO_CREATE
A16R_RUNBOOK_AUTO_RELATIONSHIP_CREATE_STATUS=NO_AUTO_CREATE
A16R_RUNBOOK_A16R_EXECUTION_STATUS=NOT_OPENED
A16R_RUNBOOK_DEPLOY_STATUS=NOT_DEPLOYED
A16R_RUNBOOK_PUSH_STATUS=NOT_PUSHED
canRunOfficialImport=false
officialImportButtonDisabled=true
```
