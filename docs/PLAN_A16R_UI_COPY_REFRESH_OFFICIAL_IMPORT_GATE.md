# A-16R UI Copy Refresh Official Import Gate

## Status

- Marker: `A-16R-UI-COPY-REFRESH-OFFICIAL-IMPORT-GATE`.
- Status:
  `A16R_UI_COPY_REFRESH_OFFICIAL_IMPORT_GATE_STATUS=PASS_UI_COPY_CLARIFIED_FAIL_CLOSED`.
- Classification:
  `A16R_UI_COPY_REFRESH_CLASSIFICATION=UI_COPY_CLARIFIED_A16K_DRY_RUN_SEPARATE_FROM_A16R_OFFICIAL_IMPORT`.
- A-16R import retry remains:
  `A16R_IMPORT_RETRY_NEXT=NO`.

## Preflight

- Branch: `main`.
- Remote slug: `hungdiepcompany-del/giapha.git`.
- Ahead/behind before edits: `0 / 0`.
- Working tree before edits: clean.
- HEAD at phase start: `84bedd0d2e05acd0a034068a9c48dfafd314c1a2`.

## UI Copy Result

- `components/imports/import-session-manifest-panel.tsx` now labels the
  preview gate as `Cổng kiểm tra thử / dry-run A-16K`.
- The dry-run block now states that A-16K only opens review/preview mapping and
  does not authorize official import execution.
- The official import block now labels the runtime gate as
  `Cổng nhập chính thức A-16R`.
- Current state copy is explicit:
  `Trạng thái hiện tại: nhập chính thức vẫn khóa`.
- The UI now displays the exact session execution marker:
  `APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
- The UI keeps the runtime enablement marker separate:
  `APPROVE_A16R_RUNTIME_EXECUTION_AFTER_A16V_VERIFY`.
- The UI states that no real genealogy data has been written from this screen.
- The UI states that the owner should not submit official import until a
  separate execution phase.

## Gate State

- `A16R_UI_COPY_REFRESH_A16K_A16R_SEPARATED=YES`.
- `A16R_UI_COPY_REFRESH_DRY_RUN_DOES_NOT_AUTHORIZE_OFFICIAL_IMPORT=YES`.
- `A16R_UI_COPY_REFRESH_OFFICIAL_IMPORT_BUTTON=DISABLED`.
- `A16R_UI_COPY_REFRESH_CAN_RUN_OFFICIAL_IMPORT=false`.
- `A16R_UI_COPY_REFRESH_CAN_RUN_OFFICIAL_IMPORT_FORCED_TRUE=NO`.
- `A16R_UI_COPY_REFRESH_FAIL_CLOSED_GUARDS_WEAKENED=NO`.
- Current lock reason:
  `A16R_UI_COPY_REFRESH_LOCK_REASON=NO_EXACT_SESSION_EXECUTION_APPROVAL_AND_OWNER_ADMIN_PRODUCTION_CONTEXT_NOT_PROVEN`.

## Boundaries

- `A16R_UI_COPY_REFRESH_DEPLOY_RUN=NO`.
- `A16R_UI_COPY_REFRESH_POST_OFFICIAL_IMPORT_CALLED=NO`.
- `A16R_UI_COPY_REFRESH_OFFICIAL_IMPORT_CONFIRM_BUTTON_CLICKED=NO`.
- `A16R_UI_COPY_REFRESH_DIRECT_RPC_CALLED=NO`.
- `A16R_UI_COPY_REFRESH_REAL_GENEALOGY_WRITE=NO`.
- `A16R_UI_COPY_REFRESH_SQL_RUN=NO`.
- `A16R_UI_COPY_REFRESH_DB_PUSH_RUN=NO`.
- `A16R_UI_COPY_REFRESH_MIGRATION_REPAIR_RUN=NO`.
- `A16R_UI_COPY_REFRESH_SEED_RUN=NO`.
- `A16R_UI_COPY_REFRESH_PERMISSIONS_ROLES_AUTH_USERS_MEMBERSHIPS_MUTATED=NO`.
- `A16R_UI_COPY_REFRESH_WINDOWS_LOCAL_DEPLOY_RUN=NO`.
- `A16R_UI_COPY_REFRESH_WRANGLER_TOML_CHANGED=NO`.
- Migration created: `NONE`.
- Package added: `NONE`.

## Next Allowed Action

`A16R_UI_COPY_REFRESH_NEXT_ALLOWED_ACTION=OWNER_LOGIN_TO_PRODUCTION_WITH_EXPECTED_OWNER_ADMIN_ACCOUNT_THEN_RERUN_AUTHENTICATED_READ_ONLY_GATE_SMOKE_NO_POST_DO_NOT_IMPORT`.

If the read-only gate later proves ready, record READY and stop. Official import
execution must remain a separate explicit phase.
