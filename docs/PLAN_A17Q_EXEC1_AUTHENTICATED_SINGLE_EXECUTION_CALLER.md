# A-17Q-EXEC1 - Record Dry-Run Evidence and Prepare Single Execution Caller

Date: 2026-07-14

Status:
`A17Q_EXEC1_STATUS=PASS_SINGLE_EXECUTION_CALLER_PREPARED_NOT_EXECUTED`

## DR2 No-Mutation Evidence

Final authenticated production dry-run evidence was recorded from the owner
session path:

- `DR2_EVIDENCE_RECORDED=YES`
- `DRY_RUN=true`
- `EXECUTION_ALLOWED=true`
- `MUTATION_APPLIED=false`
- `APPROVED_GROUP_COUNT=21`
- `SURVIVOR_COUNT=21`
- `VOID_FAMILY_COUNT=36`
- `CHILD_MOVE_COUNT=36`
- `CHILD_LOST_COUNT=0`
- `PARENT_DEACTIVATION_COUNT=72`
- `EXPECTED_POST_STATE=38/68/73`
- `POST_DRY_RUN_VERIFIER_STATUS=PASS`
- `ACTIVE_BASELINE_AFTER_DRY_RUN=74/140/73`
- `DECISION_PACK_BATCH_COUNT=0`
- `AUDIT_REVISION_COUNT=0`
- `ROLLBACK_MANIFEST_COUNT=0`
- `IDEMPOTENCY_STATE_COUNT=0`
- `EXCLUDED_SCOPE_UNCHANGED=YES`
- `DELETED_FAMILY_UNCHANGED=YES`
- `GENEALOGY_DATA_MUTATED=NO`

## Authenticated Execution Caller

- `AUTHENTICATED_EXECUTION_CALLER_CREATED=YES`
- `EXECUTION_PAGE=/admin/reconciliation/a17q/execute`
- `EXECUTION_API_ROUTE=/api/admin/a17q/reconciliation-execute`
- `RPC_NAME=execute_admin_a17q_legacy_family_reconciliation`
- `OWNER_SESSION_REQUIRED=YES`
- `SERVER_COOKIE_SESSION_USED=YES`
- `SERVICE_ROLE_USED=NO`
- `JWT_SPOOFED=NO`
- `EXACT_CONFIRMATION_REQUIRED=YES`
- `CONFIRMATION_PHRASE=EXECUTE_A17Q_21_GROUP_RECONCILIATION`
- `BACKUP_CONFIRMATION_REQUIRED=YES`
- `ROLLBACK_CONFIRMATION_REQUIRED=YES`
- `AUDIT_CONFIRMATION_REQUIRED=YES`
- `EXCLUDED_SCOPE_CONFIRMATION_REQUIRED=YES`
- `PAGE_LOAD_RPC_CALL_COUNT=0`
- `NON_DRY_RUN_CALLER_COUNT=1`
- `DRY_RUN_CALLER_UNCHANGED=YES`

The execution caller reuses the application server-cookie Supabase client,
checks the authenticated user, requires OWNER or ADMIN role visibility, and
requires the existing `relationships.update` plus `permissions.manage`
permissions before the execution action can be invoked.

The page reads only the gate context. The RPC call exists only in the POST API
route after the exact confirmation phrase and all four review confirmations
have been accepted.

## Hardcoded Execution Contract

- `OWNER_APPROVAL_MARKER=A17P_MANUAL_21_GROUP_RECONCILIATION_APPROVED`
- `DECISION_PACK_SHA256=777a8bb13ff45eb9f46fd817c392098ada4a2d550cad8e6ee4c6cd896b874ad0`
- `APPROVED_GROUP_PLAN_SHA256=7dd719c926dc560aa69bc7070c395535942823e87739d9893d0161713e151740`
- `ROLE_CORRECTION_PLAN_SHA256=ee255398f84dc2ce899d14056fb0573f771202ca7ad71e598cbbe7fc47707a9f`
- `EXCLUDED_SCOPE_SHA256=7898280dab816af96b6a9277b93b49429c5db8a71c9f24739a7d55660a0bdd61`
- `FORECAST_SHA256=4c0beb0de1589a7728b7f8b4918844e3103aa773ad3a5ab8e87d1ab2cead9ff3`
- `EXECUTION_IDEMPOTENCY_KEY=A17Q_EXEC1_SINGLE_EXECUTION_20260714_FBBF24C_001`
- `EXECUTION_ROUTE_DRY_RUN_FLAG=false`
- `DRY_RUN_ROUTE_DRY_RUN_FLAG=true`

Executor idempotency and completed-batch protection remain authoritative in
the database function.

## Boundary

- `RPC_CALLED=NO`
- `DATABASE_MUTATION=NO`
- `RECONCILIATION_EXECUTED=NO`
- `MIGRATION_CHANGED=NO`
- `SQL_EXECUTED=NO`
- `RUNTIME_CHANGED=YES`
- `DEPLOY=NO`
- `PUSH=NO`

## Static Checker

- `CHECKER_FILE=scripts/check-a17q-exec1-authenticated-single-execution-caller.cjs`
- `PACKAGE_SCRIPT=check:a17q-exec1-authenticated-single-execution-caller`

The checker verifies:

- authenticated server-cookie client usage;
- no service-role client and no JWT claim spoofing;
- exact phrase gate before the RPC call;
- all four owner review confirmations before the RPC call;
- one approved non-dry-run runtime caller;
- dry-run route remains hardcoded true;
- execution route is hardcoded false;
- page load RPC call count is zero;
- DR2 no-mutation evidence is recorded.

## Next Action

`NEXT_ACTION=A17Q_EXEC2_DEPLOY_OWNER_APPROVAL_EXECUTE_ONCE_AND_FINAL_VERIFY`

`EXPECTED_SUCCESS_STATUS=PASS_SINGLE_EXECUTION_CALLER_PREPARED_NOT_EXECUTED`
