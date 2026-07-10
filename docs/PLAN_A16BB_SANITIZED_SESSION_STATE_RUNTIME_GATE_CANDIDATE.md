# A-16BB - Sanitized Session-state Diagnostic And Runtime State-gate Candidate

`A16BB_STATUS=PASS_SANITIZED_STATE_DIAGNOSTIC_AND_STATE_GATE_CANDIDATE_NO_IMPORT`

`A16BB_TARGET_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68`

`A16BB_SOURCE_BLOCKER=A16AZ_BLOCKER=OFFICIAL_IMPORT_POST_409_SESSION_STATE_GATE_REJECTED_BEFORE_RPC_NO_IMPORT_EXECUTED`

## Sanitized Stored-state Result

The read-only verifier `scripts/verify-a16bb-sanitized-session-state.cjs`
queried sanitized metadata only. It did not print row payloads, names, raw JSON,
hashes, tokens, or private genealogy data.

`A16BB_SESSION_STATE_DIAGNOSTIC_MARKER=A16BB_SANITIZED_SESSION_STATE_DIAGNOSTIC_READ_ONLY`

`A16BB_STORED_SESSION_STATE=preview_generated`

`A16BB_READ_ONLY_VERIFIER_STATUS=PASS_READ_ONLY_SANITIZED_METADATA`

`A16BB_PREVIEW_MANIFEST_HASH_PRESENT=YES`

`A16BB_APPROVAL_MARKER_PRESENT=NO`

`A16BB_WARNING_COUNT=46`

`A16BB_DUPLICATE_CANDIDATE_COUNT=8`

`A16BB_RELATIONSHIP_CANDIDATE_COUNT=134`

`A16BB_PERSON_CANDIDATE_COUNT=102`

`A16BB_WRITE_MANIFEST_STATUS_COUNTS=draft:1`

`A16BB_OWNER_APPROVED_WRITE_MANIFEST_COUNT=0`

`A16BB_OFFICIAL_IMPORT_BATCH_STATUS_COUNTS=none`

`A16BB_BLOCKER_WARNING_COUNT_OPEN_OR_NEEDS_REVIEW=0`

`A16BB_UNRESOLVED_DUPLICATE_COUNT=0`

`A16BB_NEEDS_REVIEW_DUPLICATE_COUNT=0`

## Canonical State Contract

The schema lists the lifecycle states, and A-16V RPC accepts
`ready_for_owner_approval` and `owner_approved_for_db_write` before it checks
the owner-approved write manifest. A-16BB does not assume both should open the
UI/runtime POST gate.

`A16BB_SCHEMA_VALID_SESSION_STATES=preview_generated,owner_reviewing,warnings_acknowledged,duplicates_reviewed,relationships_reviewed,privacy_reviewed,ready_for_owner_approval,owner_approved_for_db_write,rejected_needs_fix,expired_preview,write_started,write_completed,rollback_required,rolled_back`

`A16BB_RPC_ACCEPTS_SESSION_STATES=ready_for_owner_approval,owner_approved_for_db_write`

`A16BB_RUNTIME_UI_API_EXECUTION_ELIGIBLE_STATE=owner_approved_for_db_write`

`A16BB_READY_FOR_OWNER_APPROVAL_EXECUTION_ELIGIBLE=NO`

`A16BB_REQUIRED_WRITE_MANIFEST_STATES=owner_approved,ready_for_apply`

`A16BB_CURRENT_SESSION_EXECUTION_ELIGIBLE=NO`

The stored state is `preview_generated`, and the only write manifest is still
`draft`. Therefore A-16R must remain blocked.

`A16BB_CURRENT_BLOCKER=STORED_SESSION_STATE_PREVIEW_GENERATED_NOT_OWNER_APPROVED_FOR_DB_WRITE`

`A16BB_WRITE_MANIFEST_BLOCKER=OWNER_APPROVED_WRITE_MANIFEST_MISSING`

## Source Locations

Before A-16BB, the obsolete `staged` source check was located in:

`A16BB_OBSOLETE_STAGED_SOURCE_LOCATIONS_BEFORE_FIX=lib/import/giapha4/official-import-service.ts`

After A-16BB, runtime source uses
`buildOfficialImportSessionStateGate` instead of the `staged` assumption.

`A16BB_OBSOLETE_STAGED_SOURCE_LOCATIONS_AFTER_FIX=NONE_IN_RUNTIME_SOURCE`

`A16BB_STATE_GATE_HELPER=lib/import/giapha4/official-import-session-state-gate.ts`

`A16BB_STATE_GATE_EXECUTION_ELIGIBLE_CONSTANT=A16BB_OFFICIAL_IMPORT_EXECUTION_ELIGIBLE_SESSION_STATE`

`A16BB_STATE_GATE_EXECUTION_ELIGIBLE_VALUE=owner_approved_for_db_write`

`A16BB_STATE_GATE_READY_FOR_OWNER_APPROVAL_BLOCKER=A16BB_BLOCKED_SESSION_STATE_READY_FOR_OWNER_APPROVAL_NOT_OWNER_APPROVED_FOR_DB_WRITE`

`A16BB_STATE_GATE_TERMINAL_BLOCKER=A16BB_BLOCKED_SESSION_STATE_TERMINAL_OR_ALREADY_IMPORT_PROCESSED`

`A16BB_STATE_GATE_UNKNOWN_BLOCKER=A16BB_BLOCKED_SESSION_STATE_NOT_CANONICAL_FOR_OFFICIAL_IMPORT`

## Runtime/UI/API Candidate

A-16BB updates:

- the runtime candidate service, so `canRunOfficialImport` remains false unless
  the session state is exactly `owner_approved_for_db_write`;
- the GET preflight no-go reasons, so the state blocker is visible before POST;
- the owner UI same-run gate, so the button remains locked for non-eligible
  states and shows the sanitized A-16BB state reason;
- the read-only verifier, so future phases can re-check state without printing
  private data.

`A16BB_SERVICE_GATE_UPDATED=YES`

`A16BB_UI_GATE_UPDATED=YES`

`A16BB_GET_PREFLIGHT_GATE_UPDATED=YES`

`A16BB_POST_ROUTE_GATE_CONSISTENCY=DELEGATES_TO_SERVICE_STATE_GATE_BEFORE_RPC`

`A16BB_TRANSACTION_HELPER_CONSISTENCY=RPC_STILL_REQUIRES_READY_OR_OWNER_APPROVED_PLUS_OWNER_APPROVED_WRITE_MANIFEST`

Invalid, missing, terminal, consumed, failed, expired, and unexpected states
remain fail-closed.

`A16BB_INVALID_STATES_REMAIN_BLOCKED=YES`

`A16BB_READY_FOR_OWNER_APPROVAL_REMAINS_BLOCKED_FOR_POST=YES`

`A16BB_PREVIEW_GENERATED_REMAINS_BLOCKED_FOR_POST=YES`

## Safety

`A16BB_POST_OFFICIAL_IMPORT_CALLED=NO`

`A16BB_A16R_IMPORT_RETRY_EXECUTED=NO`

`A16BB_DIRECT_MANUAL_RPC_CALLED=NO`

`A16BB_IMPORT_RPC_INVOKED=NO`

`A16BB_SESSION_STATE_UPDATED=NO`

`A16BB_MANUAL_SQL_RUN=NO`

`A16BB_SQL_DB_MUTATION_RUN=NO`

`A16BB_MIGRATION_REPAIR_RUN=NO`

`A16BB_SEED_RUN=NO`

`A16BB_DB_PUSH_RUN=NO`

`A16BB_DEPLOY_RUN=NO`

`A16BB_AUTH_PERMISSION_MUTATION_RUN=NO`

`A16BB_GENEALOGY_MUTATION_RUN=NO`

`A16BB_RAW_JSON_COMMITTED=NO`

`A16BB_PRIVATE_DATA_PRINTED=NO`

`A16BB_WRANGLER_TOML_CHANGED=NO`

`A16BB_APP_LAYOUT_TSX_CHANGED=NO`

`A16R_IMPORT_RETRY_NEXT=NO`

## Next Action

`A16BB_NEXT_ACTION=A16BC_OWNER_APPROVAL_SESSION_STATE_TRANSITION_CANDIDATE_NO_IMPORT_NO_RPC`

The next safe phase should decide whether and how to transition the audited
session from `preview_generated` to the canonical owner-approved DB-write
lifecycle state. It must remain separate from the official import execution
phase.
