# A-16V Production Runtime Evidence Reconciliation

## Status

- Phase marker: `A-16V-PRODUCTION-RUNTIME-EVIDENCE-RECONCILIATION`.
- Reconciliation status:
  `A16V_PRODUCTION_RUNTIME_EVIDENCE_RECONCILIATION_STATUS=PASS_RECONCILED_RUNTIME_EVIDENCE_MISMATCH`.
- Root cause classification:
  `A16V_PRODUCTION_RUNTIME_ROOT_CAUSE=EVIDENCE_READER_MISMATCH`.
- A-16R retry allowed now:
  `A16V_PRODUCTION_RUNTIME_A16R_RETRY_ALLOWED=NO`.

## Finding

A-16V SQL/transaction branch is not treated as missing by owner evidence. The
owner-provided A-16V apply/verify record says:

- `A16V_APPLY_VERIFY_STATUS=PASS_OWNER_APPLIED_AND_VERIFIED`;
- `A16V_REAL_TRANSACTION_BRANCH_READY=YES`;
- `A16R_RETRY_ALLOWED_AFTER_A16V=YES`.

The later A-16R after A-16V retry still blocked because runtime source was using
the old static evidence label:

- old runtime evidence: `sqlCandidateStatus: "NOT_APPLIED"`;
- old blocker:
  `A16V_BLOCKED_REAL_TRANSACTION_BRANCH_NOT_APPLIED_OR_VERIFIED`;
- runtime remained `status: "BLOCKED"`;
- `canRunOfficialImport: false`.

This was an evidence-reader mismatch, not proof that SQL was absent. The source
was not reading live database verification evidence and had not been reconciled
after owner A-16V apply/verify PASS.

## Classification Matrix

- `SQL_NOT_APPLIED=NO_OWNER_EVIDENCE_SAYS_A16V_PASS`.
- `STALE_PRODUCTION_SOURCE=NO_LOCAL_SOURCE_MATCHED_THE_BLOCKER_TOO`.
- `EVIDENCE_READER_MISMATCH=YES`.
- `DOCS_READY_RUNTIME_GUARD_CORRECTLY_NOT_APPLIED=NO_RUNTIME_LABEL_WAS_STALE`.
- `POST_DEPLOY_SMOKE_MISSING=NO_OWNER_DEPLOY_EVIDENCE_EXISTS`.
- `OTHER=NO`.

## Runtime Evidence Fix

The runtime evidence contract now reports A-16V as owner-verified while keeping
official import disabled:

- `A16V_PRODUCTION_RUNTIME_SOURCE_SQL_CANDIDATE_STATUS=OWNER_APPLIED_VERIFIED`.
- `A16V_PRODUCTION_RUNTIME_SOURCE_VERIFICATION_EVIDENCE=docs/PLAN_A16V_APPLY_VERIFY.md`.
- `A16V_PRODUCTION_RUNTIME_BLOCKER=A16R_BLOCKED_RUNTIME_EXECUTION_NOT_ENABLED_AFTER_A16V_VERIFY`.
- `A16V_PRODUCTION_RUNTIME_CAN_RUN_OFFICIAL_IMPORT=false`.
- `A16V_PRODUCTION_RUNTIME_STATUS=BLOCKED`.

The route precondition parser now accepts the future confirmation fields:

- `confirmA16VApplyVerified`;
- `confirmA16VRealTransactionBranchReady`;
- `confirmProductionDeployReady`.

This is not an import execution. It only prevents the runtime from reporting the
wrong A-16V evidence source.

## Why A-16R Still Cannot Be Retried

Even after reconciliation, A-16R official import may not be retried yet:

- `A16V_PRODUCTION_RUNTIME_A16R_RETRY_ALLOWED=NO`.
- Local branch was `main...origin/main [ahead 1]` at phase start.
- Runtime still does not call `.rpc(...)`.
- Official import route remains guarded and returns blocked/fail-closed
  behavior.
- `canRunOfficialImport=false`.
- Official import button remains disabled.

## Boundaries

- `A16V_PRODUCTION_RUNTIME_OFFICIAL_IMPORT_POST_CALLED=NO`.
- `A16V_PRODUCTION_RUNTIME_RPC_DIRECT_CALLED=NO`.
- `A16V_PRODUCTION_RUNTIME_REAL_GENEALOGY_WRITE=NO`.
- `A16V_PRODUCTION_RUNTIME_DEPLOY_RUN=NO`.
- `A16V_PRODUCTION_RUNTIME_DB_PUSH_RUN=NO`.
- `A16V_PRODUCTION_RUNTIME_MIGRATION_REPAIR_RUN=NO`.
- `A16V_PRODUCTION_RUNTIME_SEED_RUN=NO`.
- No SQL was run.
- No production data was changed.

## Next Allowed Gate

Next safe gate is a separate owner-approved runtime execution enablement phase.
That phase must prove how the guarded route/service will call the verified RPC
exactly once for session `2af4bfb6-a20e-453e-9804-1b8c0afbdd68`, while keeping
preflight, one-call, no-blind-retry, audit, rollback and idempotency checks.

Do not run A-16R official import from this reconciliation phase.
