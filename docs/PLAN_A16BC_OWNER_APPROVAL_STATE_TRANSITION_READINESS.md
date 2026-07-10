# A-16BC - Audited Session Owner-approval State-transition Readiness

## Status

`A16BC_STATUS=PASS_SOURCE_CANDIDATE_NOT_EXECUTED_NOT_DEPLOYED`

`A16BC_TARGET_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68`

`A16BC_STARTING_STORED_SESSION_STATE=preview_generated`

`A16BC_EXECUTION_ELIGIBLE_STATE=owner_approved_for_db_write`

`A16R_IMPORT_RETRY_NEXT=NO`

## Existing Transition Path

`A16BC_EXISTING_TRANSITION_PATH=NO_APPROVED_UI_API_ACTION_FOUND`

The existing `/admin/exports/import` UI could display the audited session,
review pack, duplicate decisions and A-16R official import gate, but no approved
owner-facing action was found for the canonical state transition:

`preview_generated -> ready_for_owner_approval -> owner_approved_for_db_write`

Existing related paths remain scoped differently:

- `PATCH /api/admin/import-sessions/[sessionId]/duplicates/[duplicateId]`
  saves duplicate decisions only.
- `GET /api/admin/import-sessions/[sessionId]/review-pack` is read-only.
- `POST /api/admin/import-sessions/[sessionId]/official-import` remains the
  final official import execution path and must not be used for state approval.

## Source Candidate Added

`A16BC_SOURCE_CANDIDATE=ADDED_FAIL_CLOSED_UI_API_SERVICE_PLUMBING`

New route:

`POST /api/admin/import-sessions/2af4bfb6-a20e-453e-9804-1b8c0afbdd68/owner-approval-state`

New owner-facing UI path:

`/admin/exports/import`

New UI block:

`A-16BC - Owner approval state`

New state markers:

- `APPROVE_A16BC_READY_FOR_OWNER_APPROVAL_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68`
- `APPROVE_A16BC_OWNER_APPROVED_FOR_DB_WRITE_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68`

The A-16BC route is separate from `/official-import` and returns sanitized
metadata only. It does not call the official import route, does not call the
transaction RPC, and does not write real genealogy tables.

## Server-side Gates

A-16BC remains fail-closed unless all of these are true in the same request:

- authenticated profile exists;
- OWNER or ADMIN role is present;
- strict permissions include `imports.create`, `people.create`,
  `relationships.create`, and `permissions.manage`;
- session is exactly `2af4bfb6-a20e-453e-9804-1b8c0afbdd68`;
- expected marker for the selected transition is present;
- validation errors are zero;
- dry-run blockers are zero;
- duplicate decisions are complete;
- relationship ambiguity is clear;
- review pack is `READY_FOR_OWNER_REVIEW`;
- rollback and audit review confirmations are present;
- caller confirms no official import execution in this transition.

## Canonical State Contract

`preview_generated` is not import-eligible.

`ready_for_owner_approval` is review-ready, but not POST execution eligible in
the UI/runtime gate.

`owner_approved_for_db_write` is the state required by A-16BB UI/runtime gate
before a later separate A-16R import execution phase can be considered.

## Missing Plumbing

`A16BC_MISSING_PLUMBING=PRODUCTION_DEPLOY_AND_OWNER_RUNTIME_CLICK_NOT_RUN`

This phase adds source plumbing only. It does not deploy and does not click the
transition button, so production session state remains unchanged until a
separate deploy and owner action.

Potential DB/RLS caveat:

`A16BC_DB_POLICY_CAVEAT=SOURCE_USES_SERVER_VALIDATED_ADMIN_UPDATE_FOR_IMPORT_SESSION_STATE_ONLY`

The transition service is server-only, checks owner/admin permissions before
any update, and scopes writes to import session/write-manifest state. It does
not mutate auth, roles, memberships, people, relationships, families, layout,
revision, or official import batches.

## Safety

`A16BC_POST_OFFICIAL_IMPORT_CALLED=NO`

`A16BC_A16R_IMPORT_RETRY_RUN=NO`

`A16BC_DIRECT_RPC_CALLED=NO`

`A16BC_SQL_RUN=NO`

`A16BC_DB_PUSH_RUN=NO`

`A16BC_MIGRATION_REPAIR_RUN=NO`

`A16BC_SEED_RUN=NO`

`A16BC_DEPLOY_RUN=NO`

`A16BC_AUTH_ROLE_PERMISSION_MEMBERSHIP_MUTATION=NO`

`A16BC_REAL_GENEALOGY_WRITE=NO`

`A16BC_RAW_PRIVATE_DATA_COMMITTED=NO`

## Next Owner Action

After a separately approved deploy of this source candidate, owner should:

1. Open `/admin/exports/import` as the authenticated OWNER/ADMIN account.
2. Confirm the audited session is
   `2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
3. Use the A-16BC block to submit
   `mark_ready_for_owner_approval` if the session is still
   `preview_generated`.
4. Re-open or refresh the page and verify the state is
   `ready_for_owner_approval`.
5. Use the A-16BC block to submit `approve_for_db_write` only if all gates are
   still clear.
6. Stop. Do not run A-16R official import in the same phase.

`A16BC_NEXT_ACTION=A16BD_DEPLOY_AND_OWNER_STATE_TRANSITION_SMOKE_NO_OFFICIAL_IMPORT`
