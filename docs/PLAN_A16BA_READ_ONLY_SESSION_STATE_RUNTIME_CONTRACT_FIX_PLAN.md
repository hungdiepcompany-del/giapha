# A-16BA - Read-only Session State And Runtime State Contract Fix Plan

`A16BA_STATUS=PLAN_READY_READ_ONLY_NO_RUNTIME_CHANGE`

`A16BA_SOURCE_BLOCKER=A16AZ_BLOCKER=OFFICIAL_IMPORT_POST_409_SESSION_STATE_GATE_REJECTED_BEFORE_RPC_NO_IMPORT_EXECUTED`

`A16BA_TARGET_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68`

## Scope

A-16BA is a read-only diagnosis and contract-fix planning phase. It does not
execute official import, does not call RPC, does not run SQL, and does not
change runtime source behavior.

`A16BA_POST_OFFICIAL_IMPORT_CALLED=NO`

`A16BA_A16R_IMPORT_RETRY_EXECUTED=NO`

`A16BA_DIRECT_MANUAL_RPC_CALLED=NO`

`A16BA_SQL_RUN=NO`

`A16BA_DB_MUTATION_RUN=NO`

`A16BA_DEPLOY_RUN=NO`

`A16BA_AUTH_PERMISSION_MUTATION_RUN=NO`

`A16BA_GENEALOGY_MUTATION_RUN=NO`

`A16BA_RAW_JSON_COMMITTED=NO`

`A16BA_PRIVATE_DATA_PRINTED=NO`

`A16R_IMPORT_RETRY_NEXT=NO`

## Contract Diagnosis

The A-16AZ POST result was HTTP 409 before RPC/import. The runtime candidate
blocked the request before the execution branch could call the transaction
helper.

`A16BA_ROUTE_409_SOURCE=app/api/admin/import-sessions/[sessionId]/official-import/route.ts`

`A16BA_ROUTE_409_MEANING=RUNTIME_CANDIDATE_STATUS_BLOCKED_BEFORE_RPC`

The source gate currently rejects every non-`staged` session:

`A16BA_RUNTIME_STALE_STATE_EXPECTATION=staged`

`A16BA_RUNTIME_STAGED_SOURCE_PATH=lib/import/giapha4/official-import-service.ts`

`A16BA_RUNTIME_STALE_STATE_CONDITION=params.manifest.session.status !== "staged"`

That state is not canonical in the import session schema.

`A16BA_STAGED_IN_SCHEMA=NO`

`A16BA_SCHEMA_VALID_SESSION_STATES=preview_generated,owner_reviewing,warnings_acknowledged,duplicates_reviewed,relationships_reviewed,privacy_reviewed,ready_for_owner_approval,owner_approved_for_db_write,rejected_needs_fix,expired_preview,write_started,write_completed,rollback_required,rolled_back`

The A-16V real transaction RPC accepts these pre-write session states:

`A16BA_RPC_VALID_STATES_SOURCE=supabase/migrations/20260703_0016_a16v_official_import_real_transaction_execution_branch_candidate.sql`

`A16BA_CANONICAL_PRE_IMPORT_STATES=ready_for_owner_approval,owner_approved_for_db_write`

`A16BA_READY_FOR_OWNER_APPROVAL_STATE=ready_for_owner_approval`

`A16BA_EXPECTED_OWNER_APPROVAL_STATE=owner_approved_for_db_write`

The same RPC also requires an owner-approved write manifest:

`A16BA_OWNER_APPROVED_WRITE_MANIFEST_STATES=owner_approved,ready_for_apply`

Therefore the current blocker is not a data import failure. It is a source/API
lifecycle contract mismatch:

`A16BA_BLOCKER_CLASSIFICATION=SOURCE_RUNTIME_SESSION_STATE_GATE_EXPECTS_STAGED_BUT_SCHEMA_RPC_USE_OWNER_APPROVAL_LIFECYCLE`

## Stored State Evidence Gap

A-16AZ did not read the stored database state, and A-16BA intentionally does
not run SQL or DB reads. The stored state remains unknown in this phase.

`A16BA_CURRENT_STORED_SESSION_STATE=UNKNOWN_NOT_READ_FROM_DB_IN_A16BA`

Existing manifest/read routes can expose more than sanitized state metadata, so
they are not sufficient as log evidence for this phase.

`A16BA_EXISTING_READ_ONLY_MANIFEST_ROUTE_PRIVATE_DATA_RISK=YES_NOT_USED_AS_LOG_EVIDENCE`

No dedicated sanitized read-only session-state verifier was identified in this
phase.

`A16BA_DEDICATED_SANITIZED_SESSION_STATE_VERIFIER_EXISTS=NO`

## Fix Plan

The next safe implementation should not jump straight to import execution. It
should first add a sanitized session-state diagnostic, then align the source,
UI, and API contract around the schema/RPC lifecycle.

`A16BA_FIX_RECOMMENDATION=ADD_SANITIZED_READ_ONLY_SESSION_STATE_DIAGNOSTIC_THEN_ALIGN_RUNTIME_UI_API_STATE_GATE`

Runtime source candidate:

`A16BA_RUNTIME_ACCEPTED_STATES_FIX_CANDIDATE=ready_for_owner_approval,owner_approved_for_db_write`

UI/API contract candidate:

`A16BA_UI_API_CONTRACT_FIX=SHOW_SESSION_STATUS_AND_LOCK_BEFORE_POST_WHEN_NOT_CANONICAL`

Transition candidate:

`A16BA_TRANSITION_GATE_FIX=REQUIRE_EXPLICIT_OWNER_APPROVAL_TRANSITION_TO_OWNER_APPROVED_FOR_DB_WRITE_IF_SESSION_NOT_ALREADY_CANONICAL`

If a read-only verifier later proves the stored session is already
`ready_for_owner_approval` or `owner_approved_for_db_write`, the runtime state
gate should be updated to accept the canonical states, with server-side checks
still enforcing owner/admin permission, session id, approval markers, warning
and duplicate gates, write manifest status, env gates, rollback/audit
acknowledgement, and idempotency.

If the stored session is earlier than `ready_for_owner_approval`, the official
import remains blocked. A separate owner approval transition phase must promote
the session only after sanitized review gates pass. That transition must not be
inferred from the final confirmation checkbox.

## Next Phase

`A16BA_NEXT_PHASE=A16BB_SANITIZED_SESSION_STATE_DIAGNOSTIC_AND_RUNTIME_STATE_GATE_CANDIDATE_NO_POST`

A-16BB should:

- add a sanitized read-only verifier for session
  `2af4bfb6-a20e-453e-9804-1b8c0afbdd68`;
- report only metadata such as session status, canonical-state match, write
  manifest status presence, existing official import batch status, warning and
  duplicate blocker counts;
- avoid raw names, raw JSON, hashes unless reduced to presence/shape, and any
  private row data;
- update runtime/UI/API state gating only after the state contract is explicit;
- keep `A16R_IMPORT_RETRY_NEXT=NO` until a later owner-approved execution phase.
