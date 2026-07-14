# A-17Q closeout - execution surface retirement

Status:

```text
A17Q_CLOSEOUT_STATUS=BLOCKED_PRODUCTION_API_SMOKE_BROWSER_POST_POLICY
BASELINE_COMMIT=80fc415
CLOSEOUT_COMMIT=8d5a70b
```

This document records the source closeout for completed A-17Q reconciliation.
The reconciliation itself is already complete and verified.

```text
RECONCILIATION_EXECUTED=YES
MUTATION_APPLIED=YES
ACTIVE_POST_STATE=38/68/73
DECISION_PACK_BATCH_COUNT=1
COMPLETED_BATCH_COUNT=1
ROLLBACK_MANIFEST_COUNT=1
APPROVED_GROUP_COUNT=21
APPROVED_SURVIVOR_ACTIVE_COUNT=21
APPROVED_VOID_MERGED_COUNT=36
CHILD_LOSS_COUNT=0
ANCESTRY_CYCLE_COUNT=0
ALL_REQUIRED_PASS_FIELDS_TRUE=YES
STORED_SUCCESS_RESULT_INTEGRITY=YES
GLOBAL_GRAPH_INTEGRITY=YES
TOTAL_FORM_SUBMIT_COUNT=2
THIRD_SUBMISSION_ATTEMPTED=NO
```

## Runtime retirement

The former operational page at `/admin/reconciliation/a17q/execute` no longer
renders execution controls or debug contract details. It is now a read-only
Vietnamese completion screen.

```text
EXECUTION_PAGE_RETIRED=YES
READ_ONLY_COMPLETION_SCREEN_VISIBLE=YES
DEBUG_CONTRACT_REMOVED=YES
CONFIRMATION_PHRASE_REMOVED=YES
REVIEW_CHECKBOXES_REMOVED=YES
EXECUTE_BUTTON_REMOVED=YES
INTERNAL_HASHES_REMOVED_FROM_UI=YES
IDEMPOTENCY_KEY_REMOVED_FROM_UI=YES
```

Visible completion content:

```text
TITLE=A-17Q đã hoàn tất
SUMMARY=21 nhóm gia đình trùng lặp đã được đối soát và hợp nhất thành công.
COMPLETION_DATE=14/07/2026
FINAL_ACTIVE_STATE=38/68/73
CHILD_LOSS=NO
ANCESTRY_CYCLE=NO
AUDIT_AND_ROLLBACK_EVIDENCE_STORED=YES
```

The former POST endpoint `/api/admin/a17q/reconciliation-execute` now fails
closed permanently before any helper or Supabase RPC path is reachable.

```text
EXECUTION_API_RETIRED=YES
API_HTTP_STATUS=410
API_STATUS=RETIRED
API_CODE=A17Q_RECONCILIATION_ALREADY_COMPLETED
API_RPC_CALLED=false
EXECUTION_HELPER_CALL_COUNT=0
SUPABASE_RPC_CALL_COUNT=0
REQUEST_BODY_TRUSTED=NO
CONFIRMATION_PHRASE_CAN_REACTIVATE=NO
ROLE_OR_PERMISSION_CAN_OVERRIDE=NO
QUERY_HEADER_COOKIE_ENV_CAN_REACTIVATE=NO
```

Operational navigation entries for A-17Q execution were removed from the admin
shell. The completion page preserves safe read-only navigation to admin home,
the tree viewer and revisions history.

```text
EXECUTION_NAVIGATION_REMOVED=YES
READ_ONLY_HISTORY_PRESERVED=YES
AUDIT_HISTORY_RETAINED=YES
ROLLBACK_MANIFEST_RETAINED=YES
FINAL_A17Q_EVIDENCE_RETAINED=YES
```

## Preserved evidence

The closeout does not delete or rerun any database artifact.

```text
MIGRATION_0028_RERUN=NO
MIGRATION_0029_RERUN=NO
NEW_MIGRATION_CREATED=NO
RPC_CALLED=NO
THIRD_SUBMISSION_ATTEMPTED=NO
FAMILY_DATA_MUTATED=NO
DEPLOY_SECRET_OR_TOKEN_PRINTED=NO
```

The historical execution helper source remains in the repository for audit
traceability, but the runtime API route no longer imports or calls it.

## Static coverage

```text
CHECKER=scripts/check-a17q-closeout-execution-surface-retirement.cjs
PACKAGE_SCRIPT=check:a17q-closeout-execution-surface-retirement
CHECKER_STATUS=PASS
```

The checker requires:

- completion page visible;
- no confirmation input, checkbox, execution button, raw JSON or debug contract
  in the page implementation;
- API response `410` with `A17Q_RECONCILIATION_ALREADY_COMPLETED`;
- `rpcCalled=false`;
- route helper/RPC call counts `0`;
- operational navigation removed;
- migrations 0028 and 0029 unchanged;
- final SELECT-only verifier unchanged;
- no new migration.

## Deployment and smoke evidence

Deployment must happen only after the closeout commit is pushed to `origin/main`.
Actual production deployment and focused smoke evidence are recorded in the
final phase report for the pushed closeout commit.

```text
DEPLOY_STATUS=PASS_OWNER_CONFIRMED_GITHUB_ACTIONS
DEPLOYED_COMMIT=8d5a70b
PRODUCTION_URL=https://web-gia-pha.hungdiepcompany.workers.dev
PRODUCTION_PAGE_SMOKE=PASS
PAGE_HTTP_STATUS=200
AUTHENTICATED_OWNER_VISIBLE=YES
OWNER_ROLE_VISIBLE=YES
READ_ONLY_COMPLETION_SCREEN_VISIBLE=YES
VISIBLE_TITLE=A-17Q da hoan tat
FINAL_STATE_VISIBLE=38/68/73
CHILD_LOSS_VISIBLE=NO
ANCESTRY_CYCLE_VISIBLE=NO
AUDIT_ROLLBACK_EVIDENCE_VISIBLE=YES
DEBUG_CONTRACT_REMOVED=YES
CONFIRMATION_PHRASE_REMOVED=YES
REVIEW_CHECKBOXES_REMOVED=YES
EXECUTE_BUTTON_REMOVED=YES
INTERNAL_HASHES_REMOVED_FROM_UI=YES
IDEMPOTENCY_KEY_REMOVED_FROM_UI=YES
PRODUCTION_API_SMOKE=BLOCKED_CHROME_TOOL_POST_POLICY
API_POST_NETWORK_REQUEST_COMPLETED=NO
API_BLOCKER=CHROME_AUTOMATION_BLOCKED_JAVASCRIPT_URL_AND_READ_ONLY_EVALUATOR_HAS_NO_FETCH_OR_XHR
API_SOURCE_CONTRACT_REMAINS_RETIRED=YES
API_EXPECTED_HTTP_STATUS=410
API_EXPECTED_STATUS=RETIRED
API_EXPECTED_CODE=A17Q_RECONCILIATION_ALREADY_COMPLETED
API_EXPECTED_RPC_CALLED=false
EXECUTION_HELPER_CALL_COUNT=0
SUPABASE_RPC_CALL_COUNT=0
```

## Next action

```text
NEXT_ACTION=COMPLETE_A17Q_CLOSEOUT_API_POST_SMOKE_WITH_OWNER_APPROVED_BROWSER_METHOD_OR_MANUAL_EVIDENCE
```
