# A-16AR - Owner Same-run Official Import Confirmation UI Plumbing

## Status

`A16AR_STATUS=PASS_SOURCE_UI_CONFIRMATION_PLUMBING_ADDED_NOT_EXECUTED`

## Goal

Add the minimal owner/admin same-run UI plumbing so the A-16R official import
button can become enabled only when every source gate is satisfied and can send
the required confirmation body through the approved route.

## Target

- UI path: `/admin/exports/import`
- Audited session:
  `A16AR_TARGET_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68`
- Approved route:
  `A16AR_APPROVED_POST_ROUTE=/api/admin/import-sessions/2af4bfb6-a20e-453e-9804-1b8c0afbdd68/official-import`

## Implementation

- Replaced the source hard-disabled A-16R button with a gated client
  confirmation component inside the existing "Cong nhap chinh thuc A-16R"
  block.
- The button remains disabled by default and stays locked unless:
  - authenticated OWNER/ADMIN import context is proven;
  - the current audited session matches
    `2af4bfb6-a20e-453e-9804-1b8c0afbdd68`;
  - required markers match:
    `APPROVE_A16R_RUNTIME_EXECUTION_AFTER_A16V_VERIFY` and
    `APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68`;
  - blocked validation errors and dry-run blockers are zero;
  - import-blocking warning category remains no;
  - duplicate/review-pack blockers are clear;
  - runtime candidate env and execution branch env are enabled;
  - same-run preflight resolves to
    `canOpenOfficialImport=true` and `officialImportEnabled=true`.
- Added a final checkbox confirmation state before any POST. The text includes
  the audited session id.
- Added client-side repeated-submit protection with `submitting` and
  `hasSubmitted`.
- Kept a single client POST path to the approved official import route.
- Tightened the server route so disabled
  `A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED` returns a locked response
  before runtime candidate execution.

## Gate Result

- `A16AR_UI_PLUMBING=ADDED`
- `A16AR_BUTTON_DEFAULT_STATE=DISABLED_FAIL_CLOSED`
- `A16AR_FINAL_CONFIRMATION_STATE=YES_SESSION_ID_INCLUDED`
- `A16AR_CLIENT_REPEAT_SUBMIT_PROTECTION=YES`
- `A16AR_SINGLE_POST_PATH=YES_APPROVED_ROUTE_ONLY`
- `A16AR_SERVER_SIDE_GATES_STILL_ENFORCED=YES`
- `A16AR_ROUTE_EXECUTION_BRANCH_DISABLED_RESPONSE=LOCKED`
- `A16AR_IMPORT_EXECUTED=NO`
- `A16R_IMPORT_RETRY_NEXT=NO`

## Safety

- `A16AR_POST_OFFICIAL_IMPORT_CALLED=NO`
- `A16AR_A16R_IMPORT_RETRY_EXECUTED=NO`
- `A16AR_DIRECT_MANUAL_RPC_CALLED=NO`
- `A16AR_SQL_RUN=NO`
- `A16AR_DB_MUTATION_RUN=NO`
- `A16AR_MIGRATION_REPAIR_RUN=NO`
- `A16AR_SEED_RUN=NO`
- `A16AR_DEPLOY_RUN=NO`
- `A16AR_WRANGLER_DEPLOY_RUN=NO`
- `A16AR_AUTH_ROLE_PERMISSION_MEMBERSHIP_MUTATION=NO`
- `A16AR_GENEALOGY_MUTATION=NO`
- `A16AR_RAW_JSON_COMMITTED=NO`
- `A16AR_PRIVATE_DATA_PRINTED=NO`
- `A16AR_WRANGLER_TOML_CHANGED=NO`
- `A16AR_APP_LAYOUT_TSX_CHANGED=NO`

## Next Action

`A16AR_NEXT_ACTION=PUSH_AND_DEPLOY_A16AR_THEN_RUN_AUTHENTICATED_OWNER_READ_ONLY_UI_SMOKE_BEFORE_ANY_IMPORT_EXECUTION_PHASE`
