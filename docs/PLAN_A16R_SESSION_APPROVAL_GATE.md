# A-16R-APPROVAL-GATE - Session-specific Official Import Approval Gate

Status: `A16R_APPROVAL_GATE_STATUS=PASS_GATE_DOCUMENTED_RUNTIME_LOCKED`

Marker: `A-16R-APPROVAL-GATE`

Session under review:

```text
2af4bfb6-a20e-453e-9804-1b8c0afbdd68
```

Required future owner approval marker:

```text
APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68
```

## Goal

This gate records the exact approval string needed before any later phase may
consider running official import for session
`2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.

It does not open official import in this bundle.

## Gate State

```text
A16R_APPROVAL_GATE_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68
A16R_APPROVAL_GATE_REQUIRED_MARKER=APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68
A16R_APPROVAL_GATE_CAN_RUN_OFFICIAL_IMPORT=false
A16R_APPROVAL_GATE_OFFICIAL_IMPORT_BUTTON=DISABLED
A16R_APPROVAL_GATE_A16R_EXECUTION_STATUS=NOT_OPENED
canRunOfficialImport=false
officialImportButtonDisabled=true
```

The owner must provide the exact marker in a separate future prompt. The future
prompt must also name the same session id. Any other marker, missing session id
or stale session id keeps the gate closed.

## Phase Status Summary

```text
A16R_PREFLIGHT_STATUS=PASS_OWNER_EVIDENCE_READY_APPROVAL_REQUIRED
A16R_RUNBOOK_STATUS=PASS_RUNBOOK_READY_NOT_EXECUTED
A16R_APPROVAL_GATE_STATUS=PASS_GATE_DOCUMENTED_RUNTIME_LOCKED
```

Recorded owner evidence for the session:

```text
A16R_APPROVAL_GATE_STAGING_PEOPLE_COUNT=102
A16R_APPROVAL_GATE_STAGING_RELATIONSHIP_COUNT=134
A16R_APPROVAL_GATE_VALIDATION_ERROR_COUNT=0
A16R_APPROVAL_GATE_DRY_RUN_BLOCKER_COUNT=0
A16R_APPROVAL_GATE_DUPLICATE_UNRESOLVED_COUNT=0
A16R_APPROVAL_GATE_DUPLICATE_NEEDS_REVIEW_COUNT=0
A16R_APPROVAL_GATE_DUPLICATE_CREATE_NEW_COUNT=8
A16R_APPROVAL_GATE_DUPLICATE_BLOCKER_STATUS=PASS
```

## UI And Runtime Lock

The UI must remain clear that official import is not open yet:

- `canRunOfficialImport=false`.
- The official import button remains disabled.
- The copy must not imply the import has run.
- The copy must not imply `create_new=8` already created people.
- `create_new` remains a staging owner decision until a later approved execution
  phase runs.

## Boundary For This Bundle

This gate confirms:

```text
A16R_APPROVAL_GATE_SQL_STATUS=NOT_RUN
A16R_APPROVAL_GATE_DB_PUSH_STATUS=NOT_RUN
A16R_APPROVAL_GATE_MIGRATION_REPAIR_STATUS=NOT_RUN
A16R_APPROVAL_GATE_SEED_STATUS=NOT_RUN
A16R_APPROVAL_GATE_RPC_STATUS=NOT_CALLED
A16R_APPROVAL_GATE_OFFICIAL_IMPORT_POST_STATUS=NOT_CALLED
A16R_APPROVAL_GATE_REAL_GENEALOGY_WRITE_STATUS=NO_WRITE
A16R_APPROVAL_GATE_AUTO_PEOPLE_CREATE_STATUS=NO_AUTO_CREATE
A16R_APPROVAL_GATE_AUTO_RELATIONSHIP_CREATE_STATUS=NO_AUTO_CREATE
A16R_APPROVAL_GATE_DEPLOY_STATUS=NOT_DEPLOYED
A16R_APPROVAL_GATE_PUSH_STATUS=NOT_PUSHED
```

No SQL, no DB push, no migration repair, no seed, no RPC call, no POST
`/official-import`, no writes to real people/relationships/families/layout/tree/
revision/profile data, no auto people creation, no auto relationship creation,
no deploy and no push.
