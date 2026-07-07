# A-16R Official Import Session ID Reconciliation

## Status

- Marker: `A-16R-OFFICIAL-IMPORT-SESSION-ID-RECONCILIATION`.
- Status:
  `A16R_OFFICIAL_IMPORT_SESSION_ID_RECONCILIATION_STATUS=RECONCILED_READ_ONLY_NO_IMPORT`.
- Classification:
  `A16R_OFFICIAL_IMPORT_SESSION_ID_RECONCILIATION_CLASSIFICATION=UNKNOWN_NEEDS_READ_ONLY_SESSION_EVIDENCE`.
- Authoritative session:
  `A16R_OFFICIAL_IMPORT_SESSION_ID_AUTHORITATIVE=UNKNOWN`.
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
- HEAD equals `origin/main`: `YES`.
- HEAD/source/deployed commit understood:
  `bc6a688aa081ccbd00c2f7ae043b828083b3e91c`.
- Workflow deploy evidence carried from owner:
  `A16R_SESSION_ID_RECONCILIATION_DEPLOY_WORKFLOW=Cloudflare Deploy`.
- Workflow run id:
  `A16R_SESSION_ID_RECONCILIATION_DEPLOY_RUN_ID=28837197217`.
- Workflow run URL:
  `https://github.com/hungdiepcompany-del/giapha/actions/runs/28837197217`.
- No newer local or unpushed state was present before edits.

## Observed Mismatch

- Observed production UI marker:
  `APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_ae7a5fe3-6a29-4f60-85f7-76108ed02565`.
- Observed production UI session id:
  `ae7a5fe3-6a29-4f60-85f7-76108ed02565`.
- Previously tracked A-16R session id:
  `2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
- Previously tracked A-16R marker:
  `APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.

## Source Behavior

- `components/imports/import-session-manifest-panel.tsx` renders the official
  import marker from `session.id` when a session exists.
- The `2af4bfb6-a20e-453e-9804-1b8c0afbdd68` marker in the panel is only the
  fallback when no session exists.
- `/admin/exports/import` calls `listImportSessions()`, then calls
  `getImportManifest(importSessionsResult.sessions[0].id)`.
- `listImportSessions()` orders `import_sessions` by
  `created_at desc` and limits to 20.
- Therefore the production UI marker is for the newest visible import session
  returned by the read path, not for the historical docs session by default.
- `lib/import/giapha4/official-import-service.ts` still hardcodes
  `A16U_REQUIRED_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68` and
  `A16U_REQUIRED_A16R_RETRY_MARKER=APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
- Official import service remains fail-closed with
  `canRunOfficialImport: false`.

## Session Comparison

### Session 2af4bfb6-a20e-453e-9804-1b8c0afbdd68

- Exists:
  `A16R_SESSION_2AF4BFB6_EXISTS=UNKNOWN_CURRENT_DB_NOT_QUERIED_DIRECTLY`.
- Current/latest in production UI:
  `A16R_SESSION_2AF4BFB6_CURRENT=UNKNOWN_NOT_SHOWN_BY_OBSERVED_UI`.
- Source file/import manifest identity:
  `A16R_SESSION_2AF4BFB6_SOURCE_IDENTITY=KNOWN_FROM_PRIOR_EVIDENCE_ONLY`.
- People count:
  `A16R_SESSION_2AF4BFB6_PEOPLE_COUNT=102`.
- Relationships count:
  `A16R_SESSION_2AF4BFB6_RELATIONSHIP_COUNT=134`.
- Validation errors:
  `A16R_SESSION_2AF4BFB6_VALIDATION_ERRORS=0`.
- Dry-run blockers:
  `A16R_SESSION_2AF4BFB6_DRY_RUN_BLOCKERS=0`.
- Duplicate unresolved:
  `A16R_SESSION_2AF4BFB6_DUPLICATE_UNRESOLVED=0`.
- Duplicate needs_review:
  `A16R_SESSION_2AF4BFB6_DUPLICATE_NEEDS_REVIEW=0`.
- Duplicate create_new:
  `A16R_SESSION_2AF4BFB6_DUPLICATE_CREATE_NEW=8`.
- A-16T/A-16U/A-16V readiness evidence:
  `A16R_SESSION_2AF4BFB6_A16T_A16U_A16V_READINESS=YES_FROM_PRIOR_DOCS`.
- Rollback/audit evidence:
  `A16R_SESSION_2AF4BFB6_ROLLBACK_AUDIT_EVIDENCE=YES_FROM_PRIOR_DOCS_NOT_EXECUTION`.
- Eligible for official import:
  `A16R_SESSION_2AF4BFB6_ELIGIBLE_FOR_OFFICIAL_IMPORT=NO_RUNTIME_GATE_FAIL_CLOSED_AND_CURRENT_SESSION_NOT_REPROVEN`.
- Already imported:
  `A16R_SESSION_2AF4BFB6_ALREADY_IMPORTED=NO_EVIDENCE_IMPORT_NOT_CALLED`.
- Stale/superseded:
  `A16R_SESSION_2AF4BFB6_STALE_OR_SUPERSEDED=UNKNOWN_OBSERVED_UI_SHOWS_DIFFERENT_NEWEST_SESSION`.

### Session ae7a5fe3-6a29-4f60-85f7-76108ed02565

- Exists:
  `A16R_SESSION_AE7A5FE3_EXISTS=UNKNOWN_OBSERVED_IN_PRODUCTION_UI_MARKER_ONLY`.
- Current/latest in production UI:
  `A16R_SESSION_AE7A5FE3_CURRENT=LIKELY_SELECTED_BY_UI_BUT_NOT_PROVEN_BY_DB_COUNTS`.
- Source file/import manifest identity:
  `A16R_SESSION_AE7A5FE3_SOURCE_IDENTITY=UNKNOWN`.
- People count:
  `A16R_SESSION_AE7A5FE3_PEOPLE_COUNT=UNKNOWN`.
- Relationships count:
  `A16R_SESSION_AE7A5FE3_RELATIONSHIP_COUNT=UNKNOWN`.
- Validation errors:
  `A16R_SESSION_AE7A5FE3_VALIDATION_ERRORS=UNKNOWN`.
- Dry-run blockers:
  `A16R_SESSION_AE7A5FE3_DRY_RUN_BLOCKERS=UNKNOWN`.
- Duplicate unresolved:
  `A16R_SESSION_AE7A5FE3_DUPLICATE_UNRESOLVED=UNKNOWN`.
- Duplicate needs_review:
  `A16R_SESSION_AE7A5FE3_DUPLICATE_NEEDS_REVIEW=UNKNOWN`.
- Duplicate create_new:
  `A16R_SESSION_AE7A5FE3_DUPLICATE_CREATE_NEW=UNKNOWN`.
- A-16T/A-16U/A-16V readiness evidence:
  `A16R_SESSION_AE7A5FE3_A16T_A16U_A16V_READINESS=UNKNOWN_NOT_CARRIED_BY_PRIOR_DOCS`.
- Rollback/audit evidence:
  `A16R_SESSION_AE7A5FE3_ROLLBACK_AUDIT_EVIDENCE=UNKNOWN`.
- Eligible for official import:
  `A16R_SESSION_AE7A5FE3_ELIGIBLE_FOR_OFFICIAL_IMPORT=NO_NOT_PROVEN_AND_RUNTIME_SERVICE_STILL_EXPECTS_2AF4BFB6`.
- Already imported:
  `A16R_SESSION_AE7A5FE3_ALREADY_IMPORTED=UNKNOWN_NO_READ_ONLY_IMPORT_BATCH_EVIDENCE`.
- Stale/superseded:
  `A16R_SESSION_AE7A5FE3_STALE_OR_SUPERSEDED=UNKNOWN`.

## Decision

- Observed UI marker correctness:
  `A16R_SESSION_ID_RECONCILIATION_OBSERVED_UI_MARKER_CORRECT=UNKNOWN`.
- The UI marker is not a hardcoded/fallback marker if a session exists:
  `A16R_SESSION_ID_RECONCILIATION_HARDCODED_OR_FALLBACK_BUG=NO_SOURCE_EVIDENCE`.
- The mismatch is not safe to resolve by approving either marker.
- The only session with complete prior count/readiness evidence is
  `2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
- The session currently shown by observed production UI is
  `ae7a5fe3-6a29-4f60-85f7-76108ed02565`, but its counts/readiness/eligibility
  are not proven by available read-only evidence.
- Authoritative session remains:
  `UNKNOWN`.
- A-16R import may be retried next:
  `A16R_IMPORT_MAY_BE_RETRIED_NEXT=NO`.

## Boundaries

- `A16R_SESSION_ID_RECONCILIATION_DEPLOY_RUN=NO`.
- `A16R_SESSION_ID_RECONCILIATION_POST_OFFICIAL_IMPORT_CALLED=NO`.
- `A16R_SESSION_ID_RECONCILIATION_OFFICIAL_IMPORT_CONFIRM_BUTTON_CLICKED=NO`.
- `A16R_SESSION_ID_RECONCILIATION_DIRECT_RPC_CALLED=NO`.
- `A16R_SESSION_ID_RECONCILIATION_REAL_GENEALOGY_WRITE=NO`.
- `A16R_SESSION_ID_RECONCILIATION_SQL_RUN=NO`.
- `A16R_SESSION_ID_RECONCILIATION_DB_PUSH_RUN=NO`.
- `A16R_SESSION_ID_RECONCILIATION_MIGRATION_REPAIR_RUN=NO`.
- `A16R_SESSION_ID_RECONCILIATION_SEED_RUN=NO`.
- `A16R_SESSION_ID_RECONCILIATION_PERMISSIONS_ROLES_AUTH_USERS_MEMBERSHIPS_MUTATED=NO`.
- `A16R_SESSION_ID_RECONCILIATION_CAN_RUN_OFFICIAL_IMPORT_BYPASSED=NO`.
- `A16R_SESSION_ID_RECONCILIATION_FAIL_CLOSED_GUARDS_WEAKENED=NO`.
- `A16R_SESSION_ID_RECONCILIATION_WRANGLER_TOML_CHANGED=NO`.
- `A16R_SESSION_ID_RECONCILIATION_DIRECT_PRODUCTION_DB_QUERY=NO`.

## Next Allowed Action

`A16R_SESSION_ID_RECONCILIATION_NEXT_ALLOWED_ACTION=OWNER_AUTHENTICATED_READ_ONLY_SESSION_DETAIL_SMOKE_FOR_BOTH_SESSION_IDS_NO_POST_NO_IMPORT`.

The next phase must read both session detail/review-pack/gate states using an
authenticated owner/admin read-only context and record counts for both session
ids. Do not approve or use any session marker until the authoritative session
is proven.
