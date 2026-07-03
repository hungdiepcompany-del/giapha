# A-16R Runtime Execution Enablement Gate

## Status

- Phase marker: `A-16R-RUNTIME-EXECUTION-ENABLEMENT-GATE`.
- Gate status:
  `A16R_RUNTIME_EXECUTION_ENABLEMENT_GATE_STATUS=READY_FAIL_CLOSED`.
- Root cause carried from reconciliation:
  `A16V_PRODUCTION_RUNTIME_ROOT_CAUSE=EVIDENCE_READER_MISMATCH`.
- A-16V runtime evidence:
  `A16R_RUNTIME_EXECUTION_A16V_SQL_CANDIDATE_STATUS=OWNER_APPLIED_VERIFIED`.
- A-16V reconciliation evidence:
  `A16R_RUNTIME_EXECUTION_A16V_RECONCILIATION_STATUS=PASS_RECONCILED_RUNTIME_EVIDENCE_MISMATCH`.
- Current runtime state:
  `A16R_RUNTIME_EXECUTION_CAN_RUN_OFFICIAL_IMPORT=false`.
- Current blocker:
  `A16R_RUNTIME_EXECUTION_BLOCKER=A16R_BLOCKED_RUNTIME_EXECUTION_ENABLEMENT_APPROVAL_MISSING`.

## Owner Marker

The required future owner marker for runtime execution enablement is:

`APPROVE_A16R_RUNTIME_EXECUTION_AFTER_A16V_VERIFY`

This marker is separate from the session-specific official import run marker:

`APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68`

The session marker says which import session may be considered. The runtime
enablement marker says owner has reviewed the A-16V verification and wants the
runtime execution path to be opened in a later phase. This phase does not open
that path and does not run import.

## Why A-16V Verification Alone Is Not Enough

A-16V owner apply/verify evidence proves the database transaction branch was
reported as applied and verified:

- `A16V_APPLY_VERIFY_STATUS=PASS_OWNER_APPLIED_AND_VERIFIED`;
- `A16V_REAL_TRANSACTION_BRANCH_READY=YES`;
- `sqlCandidateStatus: "OWNER_APPLIED_VERIFIED"`;
- `verificationEvidenceSource: "docs/PLAN_A16V_APPLY_VERIFY.md"`.

That evidence is necessary but not sufficient for official import execution.
The route/service also needs an explicit runtime execution approval gate,
post-deploy/source evidence, one-call behavior, audit/rollback/idempotency
checks and the exact session marker before a future phase may open execution.

## Runtime Contract Added

The official import runtime candidate now records a dedicated
`runtimeExecutionEnablementGate` contract:

- `requiredMarker: "APPROVE_A16R_RUNTIME_EXECUTION_AFTER_A16V_VERIFY"`;
- `evidenceStatus: "A16V_OWNER_APPLIED_VERIFIED_RECONCILED"`;
- `productionDeployEvidenceRequired: true`;
- `canRunOfficialImport: false`;
- blocker:
  `A16R_BLOCKED_RUNTIME_EXECUTION_ENABLEMENT_APPROVAL_MISSING` when the marker
  is absent;
- blocker:
  `A16R_BLOCKED_RUNTIME_EXECUTION_NOT_ENABLED_AFTER_A16V_VERIFY` while the
  runtime execution path remains disabled.

The route parses `confirmRuntimeExecutionEnablementMarker` but still refuses
the request when it is missing or wrong. This is a precondition check only; it
does not call the official import RPC.

## Fail-Closed Behavior

Without the exact marker:

- `A16R_RUNTIME_EXECUTION_ENABLEMENT_MARKER_MATCHED=NO`;
- `A16R_RUNTIME_EXECUTION_CAN_RUN_OFFICIAL_IMPORT=false`;
- `A16R_RUNTIME_EXECUTION_OFFICIAL_IMPORT_BUTTON=DISABLED`;
- route/service do not call `.rpc(...)`;
- route/service do not write people, relationships, families, tree layouts,
  revisions or profiles;
- no official import batch, rollback manifest or idempotency execution record
  is created by this phase.

Even with the marker present in a later phase, `canRunOfficialImport` must not
become true unless all of the following are also present and exact:

- A-16V owner apply/verify evidence is `OWNER_APPLIED_VERIFIED`;
- A-16V reconciliation status is
  `PASS_RECONCILED_RUNTIME_EVIDENCE_MISMATCH`;
- production post-deploy/source smoke evidence is sufficient;
- the session-specific A-16R marker matches
  `2af4bfb6-a20e-453e-9804-1b8c0afbdd68`;
- validation errors are `0`;
- dry-run blockers are `0`;
- duplicate unresolved and needs_review counts are `0`;
- rollback and audit plans have been reviewed;
- a later execution phase explicitly allows the guarded one-call RPC path.

## Boundaries

- `A16R_RUNTIME_EXECUTION_POST_OFFICIAL_IMPORT_CALLED=NO`.
- `A16R_RUNTIME_EXECUTION_RPC_DIRECT_CALLED=NO`.
- `A16R_RUNTIME_EXECUTION_REAL_GENEALOGY_WRITE=NO`.
- `A16R_RUNTIME_EXECUTION_DEPLOY_RUN=NO`.
- `A16R_RUNTIME_EXECUTION_PUSH_RUN=NO`.
- `A16R_RUNTIME_EXECUTION_SQL_RUN=NO`.
- `A16R_RUNTIME_EXECUTION_DB_PUSH_RUN=NO`.
- `A16R_RUNTIME_EXECUTION_MIGRATION_REPAIR_RUN=NO`.
- `A16R_RUNTIME_EXECUTION_SEED_RUN=NO`.

## Next Allowed Step

The next phase may only consider enabling runtime execution if the owner
provides this exact marker in a separate prompt:

`APPROVE_A16R_RUNTIME_EXECUTION_AFTER_A16V_VERIFY`

That future phase still must not run official import unless it separately
proves the final execution guard and receives the exact session-specific run
marker. Do not retry A-16R official import from this gate phase.
