# A-16AZ - Official Import POST 409 Session State Diagnosis

## Status

`A16AZ_STATUS=DIAGNOSED_POST_409_SESSION_STATE_MISMATCH_NO_IMPORT`

## Owner-Provided Production Result

- Target session:
  `A16AZ_TARGET_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
- Owner submitted the final confirmation exactly once:
  `A16AZ_OWNER_POST_ATTEMPT_COUNT=1_OWNER_REPORTED`.
- Result:
  `A16AZ_POST_RESULT=OFFICIAL_IMPORT_POST_REJECTED_HTTP_409`.
- Route status:
  `A16AZ_ROUTE_STATUS=BLOCKED`.
- Runtime response:
  `A16AZ_CAN_RUN_OFFICIAL_IMPORT=false`.
- Imported people count:
  `A16AZ_IMPORTED_PEOPLE_COUNT=0`.
- Warnings count reported by the runtime response:
  `A16AZ_WARNINGS_COUNT_REPORTED=46`.
- RPC import called:
  `A16AZ_RPC_IMPORT_CALLED=NO`.
- Real genealogy data imported:
  `A16AZ_REAL_GENEALOGY_DATA_IMPORTED=NO`.
- UI message:
  `A16AZ_UI_MESSAGE=Import session is not in staged state for official import consideration.`

## Source Diagnosis

The 409 response happens before the transaction helper/RPC can run.

Runtime route:

`A16AZ_OFFICIAL_IMPORT_ROUTE=POST /api/admin/import-sessions/2af4bfb6-a20e-453e-9804-1b8c0afbdd68/official-import`

The route returns HTTP 409 when `getOfficialImportRuntimeCandidate` returns
`status: "BLOCKED"`.

The current no-go source condition is:

`A16AZ_SOURCE_BLOCKING_CONDITION=params.manifest.session.status !== "staged"`

Expected state according to current runtime source:

`A16AZ_RUNTIME_SOURCE_EXPECTED_SESSION_STATE=staged`

However, the import session schema does not define `staged` as a valid
`import_sessions.status`. The valid lifecycle states in the schema are:

`A16AZ_SCHEMA_VALID_SESSION_STATES=preview_generated,owner_reviewing,warnings_acknowledged,duplicates_reviewed,relationships_reviewed,privacy_reviewed,ready_for_owner_approval,owner_approved_for_db_write,rejected_needs_fix,expired_preview,write_started,write_completed,rollback_required,rolled_back`

The A-16V transaction helper expects one of:

`A16AZ_A16V_RPC_VALID_OFFICIAL_IMPORT_STATES=ready_for_owner_approval,owner_approved_for_db_write`

Therefore, the current runtime source gate is stricter than both the schema and
the applied A-16V transaction helper:

`A16AZ_SOURCE_VS_RPC_STATE_CONTRACT=SOURCE_EXPECTS_STAGED_BUT_SCHEMA_AND_RPC_EXPECT_READY_FOR_OWNER_APPROVAL_OR_OWNER_APPROVED_FOR_DB_WRITE`

## Actual Or Suspected Session State

This phase did not run SQL and did not perform a credentialed DB read. The exact
stored state of session `2af4bfb6-a20e-453e-9804-1b8c0afbdd68` is therefore:

`A16AZ_ACTUAL_SESSION_STATE=UNKNOWN_NOT_READ_FROM_DB_IN_A16AZ`

The owner-provided POST result proves the session was not accepted by the
current runtime source condition:

`A16AZ_ACTUAL_SESSION_STATE_PROOF=NOT_ACCEPTED_AS_STAGED_BY_RUNTIME_SOURCE`

Because `staged` is not a valid schema state, any valid stored
`import_sessions.status` will fail the current source condition. The most likely
minimum blocker is not an import data problem but a lifecycle-contract mismatch:

`A16AZ_BLOCKER_CLASSIFICATION=SOURCE_RUNTIME_SESSION_STATE_EXPECTATION_STALE_STAGED_NOT_IN_SCHEMA`

This remains compatible with the user-visible message saying the session is not
in staged state, because the source code still uses that stale state name.

## Warning Count Reconciliation

The warning counts are from different evidence surfaces:

- `A16AA_WARNING_COUNT=94` came from the offline A-16O full relationship audit
  export JSON.
- `A16AZ_WARNINGS_COUNT_REPORTED=46` comes from the runtime import manifest
  session response and matches earlier sanitized audited-session evidence:
  `A16R_AUDITED_SESSION_WARNING_COUNT=46`.

Therefore:

`A16AZ_WARNING_COUNT_DELTA_EXPLANATION=94_A16AA_FULL_RELATIONSHIP_AUDIT_WARNINGS_VS_46_RUNTIME_IMPORT_MANIFEST_WARNINGS_DIFFERENT_WARNING_SURFACES`

No source evidence in A-16AZ proves that warnings were deleted or mutated during
the POST attempt.

## Blocker

`A16AZ_BLOCKER=OFFICIAL_IMPORT_POST_409_SESSION_STATE_GATE_REJECTED_BEFORE_RPC_NO_IMPORT_EXECUTED`

The blocker is best classified as:

`A16AZ_BLOCKER_TYPE=UI_API_RUNTIME_LIFECYCLE_CONTRACT_MISMATCH`

Current rejected alternatives:

- `A16AZ_STALE_SESSION_STATE=UNKNOWN_POSSIBLE_BUT_NOT_PROVEN_WITHOUT_READ_ONLY_STATE_DIAGNOSTIC`
- `A16AZ_CONSUMED_SESSION=NOT_PROVEN_NO_COMPLETED_IMPORT_EVIDENCE_RPC_NOT_CALLED`
- `A16AZ_WRONG_LIFECYCLE_TRANSITION=LIKELY_SOURCE_EXPECTS_STAGED_WHILE_SCHEMA_RPC_EXPECT_LATER_STATES`
- `A16AZ_DUPLICATE_PREFLIGHT_STATE=NOT_ACTIVE_BLOCKER_BY_PRIOR_A16AQ_A16AR_EVIDENCE`
- `A16AZ_UI_API_MISMATCH=YES_RUNTIME_SOURCE_CONTRACT_MISMATCH`

## Minimum Safe Next Step

`A16AZ_NEXT_ACTION=A16BA_READ_ONLY_SESSION_STATE_AND_RUNTIME_STATE_CONTRACT_FIX_PLAN_NO_POST_NO_RPC`

Minimum safe path:

1. Run or add a read-only diagnostic that exposes only sanitized session state
   metadata for `2af4bfb6-a20e-453e-9804-1b8c0afbdd68`: status, warning count,
   write-manifest status, official-import batch presence/status, and no private
   row data.
2. Align the runtime source official-import state gate with the schema/RPC
   contract only in a separate source-fix phase. The likely accepted states
   should be `ready_for_owner_approval` and/or `owner_approved_for_db_write`,
   subject to the read-only diagnostic.
3. Keep all POST/import execution blocked until the corrected gate is deployed
   and re-smoked read-only, then require a fresh owner final execution approval.

## Safety

- `A16AZ_POST_OFFICIAL_IMPORT_CALLED_IN_THIS_PHASE=NO`.
- `A16AZ_A16R_IMPORT_RETRY_EXECUTED_IN_THIS_PHASE=NO`.
- `A16AZ_DIRECT_MANUAL_RPC_CALLED=NO`.
- `A16AZ_SQL_RUN=NO`.
- `A16AZ_DB_MUTATION_RUN=NO`.
- `A16AZ_MIGRATION_REPAIR_RUN=NO`.
- `A16AZ_SEED_RUN=NO`.
- `A16AZ_DEPLOY_RUN=NO`.
- `A16AZ_AUTH_ROLE_PERMISSION_MEMBERSHIP_MUTATION=NO`.
- `A16AZ_GENEALOGY_MUTATION=NO`.
- `A16AZ_RAW_JSON_COMMITTED=NO`.
- `A16AZ_PRIVATE_DATA_PRINTED=NO`.
- `A16AZ_WRANGLER_TOML_CHANGED=NO`.
- `A16AZ_APP_LAYOUT_TSX_CHANGED=NO`.
- `A16R_IMPORT_RETRY_NEXT=NO`.

## Runtime Guardrail

- Main Worker touched: `NO`.
- Runtime dependency added: `NO`.
- New service Worker created: `NO`.
- OpenNext/Wrangler config changed: `NO`.
- Worker size risk: `NO`.
- Service boundary recommendation:
  `NONE_FOR_A16AZ_DIAGNOSIS_ONLY_NEXT_FIX_MAY_TOUCH_RUNTIME_GATE`.
