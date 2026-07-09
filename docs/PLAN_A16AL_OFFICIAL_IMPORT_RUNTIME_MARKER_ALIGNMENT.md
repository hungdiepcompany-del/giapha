# A-16AL - A-16R Official Import Runtime Marker Alignment

## Status

`A16AL_STATUS=PASS_MARKERS_ALIGNED_EXECUTION_READY_NOT_PROVEN_READ_ONLY`

`A16AL_CLASSIFICATION=SOURCE_MARKERS_ALIGNED_BUT_RUNTIME_REQUIRES_SAME_RUN_POST_CONFIRMATION`

`A16R_IMPORT_RETRY_NEXT=NO`

## Current production UI state

- Official import button remains locked.
- Correct audited session is shown:
  `2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
- UI requires runtime marker:
  `APPROVE_A16R_RUNTIME_EXECUTION_AFTER_A16V_VERIFY`.
- UI requires session marker:
  `APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.

Owner confirms both markers are approved:

- `APPROVE_A16R_RUNTIME_EXECUTION_AFTER_A16V_VERIFY`
- `APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68`

## Source marker alignment

The marker strings are aligned in source:

- `A16AL_RUNTIME_MARKER_SOURCE=A16R_RUNTIME_EXECUTION_ENABLEMENT_MARKER`
- `A16AL_RUNTIME_MARKER=APPROVE_A16R_RUNTIME_EXECUTION_AFTER_A16V_VERIFY`
- `A16AL_SESSION_MARKER_SOURCE=A16R_AUDITED_OFFICIAL_IMPORT_MARKER`
- `A16AL_SESSION_MARKER=APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68`
- `A16AL_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68`

The official import POST route parses both required confirmation fields:

- `confirmRuntimeExecutionEnablementMarker`
- `confirmMarker`
- `confirmSessionId`

The official import service requires:

- `confirmation.confirmRuntimeExecutionEnablementMarker === A16R_RUNTIME_EXECUTION_ENABLEMENT_MARKER`
- `confirmation.confirmMarker === A16U_REQUIRED_A16R_RETRY_MARKER`
- `confirmation.confirmSessionId === sessionId`

## Read-only result

`A16AL_MARKER_MISMATCH=NO`

`A16AL_UI_CAN_BECOME_EXECUTION_READY_FROM_READ_ONLY_GET=NO`

`A16AL_RUNTIME_CAN_BECOME_EXECUTION_READY_WITHOUT_SAME_RUN_CONFIRMATION=NO`

The current UI/GET gate is intentionally read-only. It can display the required
markers and the audited session, but it does not submit confirmation payloads
and does not call `POST /official-import`.

Owner-provided marker text in this phase is valid evidence for planning, but it
is not runtime state. Runtime execution readiness can only be proven in a later
explicit phase that is allowed to send exactly one owner-approved POST with all
same-run confirmation fields.

## Remaining blocker

`A16AL_BLOCKER=READ_ONLY_UI_DOES_NOT_SUBMIT_SAME_RUN_OFFICIAL_IMPORT_CONFIRMATION`

The next execution-capable phase must still re-check:

- authenticated owner/admin context;
- exact audited session id;
- runtime marker;
- session marker;
- validation errors = 0;
- dry-run blockers = 0;
- duplicate unresolved/needs_review = 0;
- A-16T/A-16U/A-16V gates;
- production deploy/UI visibility;
- rollback and audit review;
- execution branch env gates.

## Safety

- `A16AL_POST_OFFICIAL_IMPORT_CALLED=NO`
- `A16AL_A16R_IMPORT_RETRY_EXECUTED=NO`
- `A16AL_DIRECT_MANUAL_RPC_CALLED=NO`
- `A16AL_SQL_RUN=NO`
- `A16AL_DB_PUSH_RUN=NO`
- `A16AL_MIGRATION_REPAIR_RUN=NO`
- `A16AL_SEED_RUN=NO`
- `A16AL_DEPLOY_RUN=NO`
- `A16AL_AUTH_USER_ROLE_PERMISSION_MEMBERSHIP_MUTATION=NO`
- `A16AL_REAL_GENEALOGY_WRITE=NO`
- `A16AL_RAW_JSON_COMMITTED=NO`
- `A16AL_WRANGLER_TOML_CHANGED=NO`
- `A16AL_APP_LAYOUT_TSX_CHANGED=NO`

## Next action

If owner wants to proceed beyond marker alignment, start a separate final
execution/readiness phase that explicitly authorizes the same-run POST check.
Do not run official import from this A-16AL evidence alone.
