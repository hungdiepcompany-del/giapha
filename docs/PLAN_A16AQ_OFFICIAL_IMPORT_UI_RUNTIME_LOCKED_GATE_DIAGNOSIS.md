# A-16AQ - Official Import UI Runtime Locked Gate Diagnosis

## Status

- `A16AQ_STATUS=DIAGNOSED_SOURCE_UI_RUNTIME_GATE_FAIL_CLOSED`.
- `A16AP_BLOCKER=OFFICIAL_IMPORT_UI_RUNTIME_GATE_REMAINS_LOCKED_BUTTON_DISABLED_SAME_RUN_ROUTE_NOT_EXECUTION_CAPABLE`.
- `A16AQ_TARGET_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
- `A16R_IMPORT_RETRY_NEXT=NO`.

## Diagnosis

Owner/admin role and strict permission blockers are resolved, but the A-16R
execution surface is still locked by source-level fail-closed UI/runtime gates.

Exact disabled conditions:

- `A16AQ_DISABLED_CONDITION_PERMISSION_CONTEXT=NO_LONGER_BLOCKING_OWNER_ADMIN_PASS`.
- `A16AQ_DISABLED_CONDITION_SESSION_MISMATCH=NO_AUDITED_SESSION_BOUND`.
- `A16AQ_DISABLED_CONDITION_DUPLICATE_DECISIONS=NO_VISIBLE_BLOCKER_FROM_A16AP`.
- `A16AQ_DISABLED_CONDITION_REVIEW_PACK_READINESS=NO_VISIBLE_OWNER_REVIEW_BLOCKER_FROM_A16AP`.
- `A16AQ_DISABLED_CONDITION_UI_BUTTON=HARD_DISABLED_IN_IMPORT_SESSION_MANIFEST_PANEL`.
- `A16AQ_DISABLED_CONDITION_UI_LOCK_REASON=A16R_LOCKED_BY_PHASE_BOUNDARY_NO_POST_IN_A16AO_AFTER_OWNER_PERMISSION_PASS`.
- `A16AQ_DISABLED_CONDITION_PREFLIGHT_GATE=OFFICIAL_IMPORT_PREFLIGHT_GATE_ALWAYS_READ_ONLY_CAN_OPEN_FALSE_ENABLED_FALSE`.
- `A16AQ_DISABLED_CONDITION_REVIEW_PACK_FLAGS=CAN_PROCEED_TO_OFFICIAL_IMPORT_FALSE_READY_FOR_OFFICIAL_IMPORT_FALSE_BY_DESIGN`.
- `A16AQ_DISABLED_CONDITION_POST_ROUTE=POST_ROUTE_NOT_REACHED_BY_UI_REQUIRES_CONFIRMATION_BODY_AND_ENV_FLAGS`.
- `A16AQ_DIRECT_GET_GATE_BLOCKER=CHROME_ERR_BLOCKED_BY_CLIENT_TOOLING_ONLY_NOT_APP_LOCK_SOURCE`.

## Source Evidence

### UI block

- File:
  `components/imports/import-session-manifest-panel.tsx`.
- The A-16R button is rendered with literal `disabled` and
  `aria-disabled="true"`.
- After permission, session and preflight checks pass, the UI lock reason falls
  through to:
  `A16R_LOCKED_BY_PHASE_BOUNDARY_NO_POST_IN_A16AO`.
- No UI code submits the required POST body to `/official-import`.

### GET preflight gate

- File:
  `lib/import/giapha4/official-import-preflight-gate.ts`.
- The GET gate type and return value are read-only by design:
  `canOpenOfficialImport: false` and `officialImportEnabled: false`.
- Its base no-go reasons always include the future marker guidance even when
  runtime/transaction candidates exist.
- This GET route is therefore not an execution-readiness proof.

### Review pack

- File:
  `lib/import/giapha4/import-review-pack-service.ts`.
- The review pack can become `READY_FOR_OWNER_REVIEW`, but still returns
  `canProceedToOfficialImport: false` and `readyForOfficialImport: false`.
- This preserves the phase boundary and does not open A-16R.

### POST route

- File:
  `app/api/admin/import-sessions/[sessionId]/official-import/route.ts`.
- The route is the only approved runtime path that can call the candidate.
- It is not reached from the UI.
- It requires a same-run JSON confirmation body including the session marker,
  session id, validation/dry-run/duplicate/A-16T/A-16U/A-16V/rollback/audit
  confirmations and runtime marker.
- It also gates execution with env names only:
  `A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED` and
  `A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED`.
- Production values for those env flags were not read in this phase.

## Classification

- `A16AQ_MISSING_MARKER_PLUMBING=YES_UI_DOES_NOT_SUBMIT_REQUIRED_CONFIRMATION_BODY`.
- `A16AQ_ROUTE_FLAG_ENV_STATUS=UNKNOWN_NOT_READ_NO_SECRET_OR_PRODUCTION_ENV_INSPECTION`.
- `A16AQ_EXECUTION_BRANCH_ENV_STATUS=UNKNOWN_NOT_READ_NO_SECRET_OR_PRODUCTION_ENV_INSPECTION`.
- `A16AQ_BROWSER_GET_BLOCKER_IS_SOURCE_BLOCKER=NO`.
- `A16AQ_DISABLED_CLASSIFICATION=SOURCE_UI_PREFLIGHT_REVIEW_PACK_STILL_FAIL_CLOSED_NO_POST_PLUMBING`.

## Safety

- `A16AQ_POST_OFFICIAL_IMPORT_CALLED=NO`.
- `A16AQ_A16R_IMPORT_RETRY_EXECUTED=NO`.
- `A16AQ_DIRECT_MANUAL_RPC_CALLED=NO`.
- `A16AQ_SQL_RUN=NO`.
- `A16AQ_DB_MUTATION_RUN=NO`.
- `A16AQ_AUTH_ROLE_PERMISSION_MEMBERSHIP_MUTATION=NO`.
- `A16AQ_GENEALOGY_MUTATION=NO`.
- `A16AQ_DEPLOY_RUN=NO`.
- `A16AQ_WRANGLER_DEPLOY_RUN=NO`.
- `A16AQ_RAW_JSON_COMMITTED=NO`.
- `A16AQ_PRIVATE_DATA_PRINTED=NO`.
- `A16AQ_WRANGLER_TOML_CHANGED=NO`.
- `A16AQ_APP_LAYOUT_TSX_CHANGED=NO`.

## Boundary Review

- Main Worker source touched: NO.
- Runtime dependency added: NO.
- New service Worker created: NO.
- OpenNext/Wrangler config changed: NO.
- Worker size risk: NO.
- Service boundary recommendation: `NONE_FOR_DIAGNOSIS_ONLY`.

## Next Action

`A16AQ_NEXT_ACTION=IMPLEMENT_MINIMAL_OWNER_SAME_RUN_CONFIRMATION_UI_OR_OPERATOR_RUNTIME_GATE_THAT_SUBMITS_REQUIRED_CONFIRMATION_BODY_ONLY_AFTER_ALL_GATES_PASS`.
