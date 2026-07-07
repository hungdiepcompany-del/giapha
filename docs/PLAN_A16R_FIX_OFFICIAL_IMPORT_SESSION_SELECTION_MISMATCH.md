# A-16R Fix Official Import Session Selection Mismatch

## Status

- Marker: `A-16R-FIX-OFFICIAL-IMPORT-SESSION-SELECTION-MISMATCH`.
- Status:
  `A16R_FIX_OFFICIAL_IMPORT_SESSION_SELECTION_MISMATCH_STATUS=PASS_MARKER_BOUND_TO_AUDITED_SESSION_FAIL_CLOSED`.
- Classification:
  `A16R_FIX_OFFICIAL_IMPORT_SESSION_SELECTION_MISMATCH_CLASSIFICATION=SESSION_ID_UI_SELECTION_MISMATCH`.
- Audited official import session:
  `A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
- Unverified UI session:
  `A16R_UNVERIFIED_UI_SESSION_ID=ae7a5fe3-6a29-4f60-85f7-76108ed02565`.
- A-16R import retry next:
  `A16R_IMPORT_RETRY_NEXT=NO`.

## Preflight

- `git status -sb`: `## main...origin/main`.
- `git status --short`: clean.
- `git fetch origin --prune`: PASS after approved metadata access because
  sandboxed fetch hit `.git/FETCH_HEAD: Permission denied`.
- Branch: `main`.
- Remote slug: `hungdiepcompany-del/giapha.git`.
- Ahead/behind after fetch: `0 / 0`.
- Working tree before edits: clean.
- HEAD at phase start:
  `197b2c688e8e31620982d93a5c5c505b023dcb18`.

## Owner Manual Read-Only Evidence

- `/api/admin/import-sessions/2af4bfb6-a20e-453e-9804-1b8c0afbdd68/manifest`
  returned `200` with valid manifest.
- `/api/admin/import-sessions/ae7a5fe3-6a29-4f60-85f7-76108ed02565` did not
  return a useful result in owner browser check.
- `/api/admin/import-sessions` did not return a useful result in owner browser
  check.
- Runtime official import service is bound to:
  `2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.

Known authoritative session evidence:

- `A16R_AUDITED_SESSION_OK=true`.
- `A16R_AUDITED_SESSION_HTTP_STATUS=200`.
- `A16R_AUDITED_SESSION_PREVIEW_ONLY=true`.
- `A16R_AUDITED_SESSION_CAN_IMPORT=false`.
- `A16R_AUDITED_SESSION_DB_WRITE=false`.
- `A16R_AUDITED_SESSION_PEOPLE_WRITE=false`.
- `A16R_AUDITED_SESSION_RELATIONSHIP_WRITE=false`.
- `A16R_AUDITED_SESSION_SOURCE_FILE_NAME=Phạm Văn.xls.xlsx`.
- `A16R_AUDITED_SESSION_ROW_COUNT=102`.
- `A16R_AUDITED_SESSION_PERSON_CANDIDATE_COUNT=102`.
- `A16R_AUDITED_SESSION_RELATIONSHIP_CANDIDATE_COUNT=134`.
- `A16R_AUDITED_SESSION_WARNING_COUNT=46`.
- `A16R_AUDITED_SESSION_DUPLICATE_CANDIDATE_COUNT=8`.
- `A16R_AUDITED_SESSION_WRITE_MANIFEST_COUNT=1`.

## Implementation

- Added single source constant:
  `A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID`.
- Added marker derived from the audited session:
  `A16R_AUDITED_OFFICIAL_IMPORT_MARKER`.
- `A16U_REQUIRED_SESSION_ID` now aliases
  `A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID`.
- `A16U_REQUIRED_A16R_RETRY_MARKER` now aliases
  `A16R_AUDITED_OFFICIAL_IMPORT_MARKER`.
- `ImportSessionManifestPanel` displays the A-16R official import marker from
  `A16R_AUDITED_OFFICIAL_IMPORT_MARKER`, not from arbitrary `session.id`.
- If the visible/current session differs from the audited session, the UI shows
  the Vietnamese warning:
  `Phiên đang xem không khớp phiên nhập chính thức đã được kiểm toán.`
- The mismatch warning includes both:
  - `Phiên đang xem: <current session id>`.
  - `Phiên nhập chính thức đã kiểm toán: 2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
- Official import button remains disabled.

## Runtime And Gate State

- Runtime required session check remains present:
  `A16R_FIX_SESSION_SELECTION_REQUIRED_SESSION_CHECK=YES`.
- Runtime marker check remains present:
  `A16R_FIX_SESSION_SELECTION_REQUIRED_MARKER_CHECK=YES`.
- `canRunOfficialImport` remains:
  `A16R_FIX_SESSION_SELECTION_CAN_RUN_OFFICIAL_IMPORT=false`.
- `canRunOfficialImport` forced true:
  `A16R_FIX_SESSION_SELECTION_CAN_RUN_OFFICIAL_IMPORT_FORCED_TRUE=NO`.
- Official import button:
  `A16R_FIX_SESSION_SELECTION_OFFICIAL_IMPORT_BUTTON=DISABLED`.
- A-16R import may be retried next:
  `A16R_IMPORT_MAY_BE_RETRIED_NEXT=NO`.

## Boundaries

- `A16R_FIX_SESSION_SELECTION_DEPLOY_RUN=NO`.
- `A16R_FIX_SESSION_SELECTION_POST_OFFICIAL_IMPORT_CALLED=NO`.
- `A16R_FIX_SESSION_SELECTION_OFFICIAL_IMPORT_CONFIRM_BUTTON_CLICKED=NO`.
- `A16R_FIX_SESSION_SELECTION_DIRECT_RPC_CALLED=NO`.
- `A16R_FIX_SESSION_SELECTION_REAL_GENEALOGY_WRITE=NO`.
- `A16R_FIX_SESSION_SELECTION_SQL_RUN=NO`.
- `A16R_FIX_SESSION_SELECTION_DB_PUSH_RUN=NO`.
- `A16R_FIX_SESSION_SELECTION_MIGRATION_REPAIR_RUN=NO`.
- `A16R_FIX_SESSION_SELECTION_SEED_RUN=NO`.
- `A16R_FIX_SESSION_SELECTION_PERMISSIONS_ROLES_AUTH_USERS_MEMBERSHIPS_MUTATED=NO`.
- `A16R_FIX_SESSION_SELECTION_CAN_RUN_OFFICIAL_IMPORT_BYPASSED=NO`.
- `A16R_FIX_SESSION_SELECTION_FAIL_CLOSED_GUARDS_WEAKENED=NO`.
- `A16R_FIX_SESSION_SELECTION_WRANGLER_TOML_CHANGED=NO`.
- Main Worker source touched: YES.
- Runtime dependency added: NO.
- New service Worker created: NO.
- OpenNext/Wrangler config changed: NO.
- Worker size risk: NO.
- Service boundary recommendation: `NONE_FOR_THIS_PHASE_UI_MARKER_BINDING_ONLY`.

## Next Allowed Action

`A16R_FIX_SESSION_SELECTION_NEXT_ALLOWED_ACTION=DEPLOY_VIA_MANUAL_GITHUB_ACTIONS_LINUX_THEN_OWNER_AUTHENTICATED_READ_ONLY_UI_SMOKE_NO_POST_NO_IMPORT`.

Do not run official import until a later explicit execution phase proves the
audited session, owner/admin context, runtime marker and all fail-closed gates.
