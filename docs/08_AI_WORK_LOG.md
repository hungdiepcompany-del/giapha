# AI Work Log

## 2026-07-01 - A-16Q-DUP-LIVE-SAVE-FIX - Live Duplicate Decision Session Binding

- Marker: `A-16Q-DUP-LIVE-SAVE-FIX`.
- Final status:
  `A16Q_DUP_LIVE_SAVE_FIX_STATUS=LIVE_SESSION_BINDING_REPAIRED`.
- Live UI error addressed:
  `DUPLICATE_DECISION_NOT_IN_SESSION`.
- Root cause: the duplicate review client kept local `duplicateCandidates` and
  draft state from a previous render. After a new manifest upload/session
  refresh, the UI could call PATCH with the current `sessionId` but an old
  duplicate candidate id.
- Fixed `components/imports/import-session-manifest-panel.tsx` so
  `DuplicateDecisionReviewClient` remounts by current session id and
  `session.updatedAt`.
- Fixed `components/imports/duplicate-decision-review-client.tsx` so the mounted
  component snapshots the active session/list; the keyed parent remount resets
  candidate state, drafts, notice and saved marker for a new session.
- If incoming props ever differ from the mounted snapshot before remount, the UI
  fails closed with the stale-list warning and disables save.
- Added stale-state guard copy:
  `Danh sách ứng viên trùng đã cũ, vui lòng tải lại phiên nhập.`
- PATCH continues to use duplicate candidate UUID from `candidate.id`; it does
  not use `sourceRowIndex`.
- The UI still shows one save notice at a time and does not show success and
  error together.
- The UI does not auto decide duplicate candidates; owner must choose and press
  `Lưu quyết định`.
- Official import remains locked: `canRunOfficialImport=false`, UI button
  disabled, no RPC call and no POST official import call.
- A-16Q-DUP-LIVE-SAVE-FIX did not run SQL, did not run DB push, did not repair
  migrations, did not seed, did not write people/relationships/families/layout/
  tree/revision/profile data, did not deploy and did not push.

## 2026-07-01 - A-16Q-DUP-SAVE-FIX - Duplicate Decision Save Diagnostics

- Marker: `A-16Q-DUP-SAVE-FIX`.
- Final status:
  `A16Q_DUP_SAVE_FIX_STATUS=PATCH_DIAGNOSTICS_AND_UI_SAVE_REPAIRED`.
- Owner evidence: session `8158711d-1c3c-4208-987d-6fec6a1c5a1a`
  still has 8 duplicate rows with `owner_decision=unresolved`,
  `decided_by=null`, `decided_at=null` and `decision_note=null`.
- Owner evidence: all 8 duplicate rows have `existing_person_id=null`, so
  `link_existing` must be rejected and hidden from the UI.
- Cause addressed: the previous PATCH flow returned a generic not-found/no
  access message before separating duplicate-not-in-session from RLS/update
  failure.
- PATCH now verifies membership through the duplicate review list for the
  session, then updates `import_duplicate_candidates` with filters
  `id + import_session_id`.
- PATCH returns diagnostic codes such as
  `DUPLICATE_DECISION_NOT_IN_SESSION`,
  `DUPLICATE_DECISION_LINK_EXISTING_REQUIRES_EXISTING_PERSON` and
  `DUPLICATE_DECISION_UPDATE_RLS_DENIED`.
- UI now shows a single save notice at a time, displays diagnostic codes only
  for errors and hides “Liên kết với người đã có” when no existing person is
  attached.
- Owner should retest by saving one duplicate with `create_new`,
  `ignore_candidate` or `needs_review`; do not use `link_existing` for the
  current 8 rows.
- Official import remains locked: `canRunOfficialImport=false`, UI button
  disabled, no RPC call and no POST official import call.
- A-16Q-DUP-SAVE-FIX did not run SQL, did not run DB push, did not repair
  migrations, did not seed, did not write people/relationships/families/layout/
  tree/revision/profile data, did not deploy and did not push.

## 2026-07-01 - A-16Q-FIX3 - Lunar Death Date Contradiction

- Marker: `A-16Q-FIX3`.
- Final status:
  `A16Q_FIX3_STATUS=LUNAR_DEATH_CONTRADICTION_WARNING_DUP_SAVE_VERIFIED`.
- Row 95 sanitized regression:
  `A16Q_FIX3_ROW95_LUNAR_CONTRADICTION_REGRESSION_CASE`.
- Owner evidence for row 95: birth date `26/5/2014`, death value
  `28/4/2014`, lunar anniversary `28/4/2014`, and notes pattern
  `tức ngày ... âm lịch`.
- Updated Gia Phả 4 validation so a death date that matches lunar anniversary
  or notes indicating lunar date is inferred as `calendar_conflict`.
- `calendar_conflict`, `unknown` and calendar mismatch death dates now produce
  warning review issues, not blocker `death_before_birth`.
- `death_before_birth` remains an error only when the data is certain enough:
  same known calendar, full precision and death date before birth date, or a
  certain year-before-birth case.
- Duplicate decision save UI remains enabled from A-16Q-DUP-RLS PASS, but
  requires owner action through “Lưu quyết định”; Codex did not auto decide any
  duplicate candidate.
- Current owner evidence still has `unresolved_duplicate_rows=8`.
- Official import remains locked: `canRunOfficialImport=false`, UI button
  disabled, no RPC call and no POST official import call.
- A-16Q-FIX3 did not run SQL, did not run DB push, did not repair migrations,
  did not seed, did not write people/relationships/families/layout/tree/
  revision/profile data, did not deploy and did not push.

## 2026-07-01 - A-16Q-DUP-RLS-VERIFY-UI-WRITE-PASS - Staging Decision Write Enabled

- Marker: `A-16Q-DUP-RLS-VERIFY-UI-WRITE-PASS`.
- Final status:
  `A16Q_DUP_RLS_UI_WRITE_STATUS=OWNER_RLS_VERIFY_PASS_UI_WRITE_ENABLED`.
- Target session:
  `A16Q_DUP_IMPORT_SESSION_ID=8158711d-1c3c-4208-987d-6fec6a1c5a1a`.
- Owner provided both evidence markers:
  `A16Q_DUP_RLS_OWNER_APPLY_CONFIRMED` and
  `A16Q_DUP_RLS_VERIFY_PASS_CONFIRMED`.
- Owner manually applied:
  `db/migrations/20260701_0013_a16q_dup_duplicate_decision_rls_candidate.sql`.
- Owner ran and confirmed PASS:
  `db/checks/20260701_check_a16q_dup_duplicate_decision_rls.sql`.
- Enabled staging-only route:
  `PATCH /api/admin/import-sessions/[sessionId]/duplicates/[duplicateId]`.
- PATCH writes only `import_duplicate_candidates` and only the columns
  `owner_decision`, `decided_by`, `decided_at` and `decision_note`.
- The route validates `sessionId` + `duplicateId`, allowed decisions, and only
  permits `link_existing` when the staging row has `existing_person_id`.
- UI block “Ứng viên trùng cần quyết định” now lets owner save a staging
  decision with “Lưu quyết định”.
- Current owner evidence still says `unresolved_duplicate_rows=8`, so owner
  must review the remaining duplicate candidates before any later execution
  phase.
- Official import remains locked: `canRunOfficialImport=false`, UI button
  disabled, no RPC call and no POST official import call.
- A-16Q-DUP-RLS-VERIFY-UI-WRITE-PASS did not run SQL, did not run DB push, did
  not repair migrations, did not seed, did not write people/relationships/
  families/layout/tree/revision/profile data, did not auto merge, did not auto
  link, did not deploy and did not push.

## 2026-07-01 - A-16Q-DUP-RLS-VERIFY-UI-WRITE - Blocked Evidence Gate

- Marker: `A-16Q-DUP-RLS-VERIFY-UI-WRITE`.
- Final status:
  `A16Q_DUP_RLS_UI_WRITE_STATUS=BLOCKED_MISSING_OWNER_RLS_APPLY_VERIFY_EVIDENCE`.
- Target session:
  `A16Q_DUP_IMPORT_SESSION_ID=8158711d-1c3c-4208-987d-6fec6a1c5a1a`.
- Prompt did not include both required owner evidence markers:
  `A16Q_DUP_RLS_OWNER_APPLY_CONFIRMED` and
  `A16Q_DUP_RLS_VERIFY_PASS_CONFIRMED`.
- Because the evidence gate is incomplete, no PATCH route was created for
  `/api/admin/import-sessions/[sessionId]/duplicates/[duplicateId]`.
- UI duplicate decision save remains disabled/read-only. Existing duplicate
  review still returns `canEditDecisions=false`.
- SQL candidate remains present in repo, but Codex did not run it:
  `db/migrations/20260701_0013_a16q_dup_duplicate_decision_rls_candidate.sql`.
- SELECT-only verification remains present in repo, but Codex did not run SQL:
  `db/checks/20260701_check_a16q_dup_duplicate_decision_rls.sql`.
- Official import remains locked: `canRunOfficialImport=false`, UI button
  disabled, no RPC call and no POST official import call.
- A-16Q-DUP-RLS-VERIFY-UI-WRITE did not run SQL, did not run DB push, did not
  repair migrations, did not seed, did not write people/relationships/families/
  layout/tree/revision/profile data, did not deploy and did not push.

## 2026-07-01 - A-16Q-DUP - Duplicate Candidate Owner Decision Review

- Marker: `A-16Q-DUP`.
- Final status:
  `A16Q_DUP_STATUS=BLOCKED_DUPLICATE_DECISION_RLS_UPDATE_MISSING`.
- Session under review:
  `A16Q_DUP_IMPORT_SESSION_ID=8158711d-1c3c-4208-987d-6fec6a1c5a1a`.
- Owner evidence recorded: 102 staging rows, 102 person candidates, 134
  relationship candidates, 0 blocker rows, 45 warning rows, 1 info row,
  0 unmapped columns, 0 held rows, 0 unclear relationships, 8 duplicate
  candidates and 8 unresolved duplicate rows.
- Inspected `import_duplicate_candidates`: the table has review columns
  `owner_decision`, `decided_by`, `decided_at` and `decision_note`, but the
  currently applied/candidate RLS only shows owner-scoped SELECT/INSERT and no
  safe UPDATE policy.
- Added read-only duplicate review service and GET route:
  `GET /api/admin/import-sessions/[sessionId]/duplicates`.
- The duplicate review response is staging-only and returns
  `canEditDecisions=false`, `canRunOfficialImport=false`, total duplicates,
  unresolved duplicates and edit blocked reasons.
- Updated the import session panel with “Ứng viên trùng cần quyết định”,
  duplicate metrics, blocked save copy and disabled “Lưu quyết định ứng viên
  trùng — chưa mở” button.
- Updated review pack, preflight gate and official import candidate gate so
  `unresolved`, `needs_review` and legacy `hold` duplicate decisions block the
  future official import path.
- Created not-applied SQL candidate:
  `db/migrations/20260701_0013_a16q_dup_duplicate_decision_rls_candidate.sql`
  and mirrored it byte-for-byte to `supabase/migrations/`.
- Created SELECT-only verification SQL:
  `db/checks/20260701_check_a16q_dup_duplicate_decision_rls.sql`.
- Official import remains locked: `canRunOfficialImport=false`, UI button
  disabled, no RPC call and no POST official import call.
- A-16Q-DUP did not run SQL, did not run DB push, did not repair migrations,
  did not seed, did not write people/relationships/families/layout/tree/
  revision/profile data, did not deploy and did not push.

## 2026-07-01 - A-16Q-LOCAL-UI - Localhost Import UI Smoke and Gate Copy Refresh

- Marker: `A-16Q-LOCAL-UI`.
- Final status:
  `A16Q_LOCAL_UI_STATUS=SAFE_SKIP_MISSING_AUTH_GATE_COPY_REFRESHED`.
- Opened `http://localhost:3001/admin/exports/import` in the in-app browser.
- Browser smoke result: `SAFE_SKIP_MISSING_AUTH`; page loaded but displayed
  `Bạn cần đăng nhập để kiểm tra nhập dữ liệu.`
- Session id and counts were not readable because the auth gate blocked the
  import panel: session id, total members, total relationships, preview sample
  counts, validation errors, warnings, dry-run blockers and duplicate
  candidates are `UNKNOWN`.
- Added `scripts/smoke-a16q-local-ui-import-guided.cjs`; it prefers Chrome CDP
  at `A16Q_LOCAL_UI_CDP_URL`/`http://127.0.0.1:9222`, reuses the existing
  Chrome context/page, and does not read or save cookies, localStorage, tokens,
  profile data or storage state.
- Scripted smoke result in this checkout:
  `SAFE_SKIP_BROWSER_RUNTIME_UNAVAILABLE` because Playwright runtime is not
  available. If Playwright is available but CDP is not, the script returns
  `SAFE_SKIP_MISSING_CHROME_CDP`.
- Refreshed official import gate copy: stale A-16P/A-16N marker wording was
  replaced by the current A-16R session-specific approval wording.
- Gate now states that runtime candidate and transaction helper are prepared,
  official import has not run, and future execution requires exact session id,
  validation errors = 0, dry-run blockers = 0, rollback reviewed and audit
  reviewed.
- Required future marker:
  `APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_<SESSION_ID>`.
- Official import remains locked: `canRunOfficialImport=false`, UI button
  disabled, no RPC call and no POST official import call.
- A-16Q-LOCAL-UI did not run SQL, did not run DB push, did not repair
  migrations, did not seed, did not write people/relationships/families/layout/
  tree/revision/profile data, did not deploy and did not push.

## 2026-07-01 - A-16Q-FIX2 - Row 95 Date Diagnosis and Count Consistency

- Marker: `A-16Q-FIX2`.
- Final status: `A16Q_FIX2_STATUS=ROW95_WARNING_AND_COUNTS_ALIGNED`.
- Added sanitized row 95 regression metadata:
  `A16Q_FIX2_ROW95_SANITIZED_REGRESSION_CASE`; no full name or raw personal
  row data is logged.
- Date order validation now goes through `diagnoseDeathBeforeBirth`.
- Death calendar `unknown`, calendar mismatch, same-year partial precision and
  other uncertain cases return warning, not blocker.
- `death_before_birth` remains an error only when the date order is certain in
  a known shared calendar: same calendar with `deathYear < birthYear`, or same
  calendar with full date precision and `deathDate < birthDate`.
- Count inconsistency was caused by preview/sample limits: person preview is
  capped at 100 and relationship query reads 100, while session totals are 102
  people and 134 relationships.
- Validation, dry-run preview and review pack now use session total counts for
  staging totals and separate preview sample counts for the 100/100 sample.
- UI now exposes sample count labels beside total staging counts so 100/100 is
  not mistaken for the real total.
- Official import remains locked: `canRunOfficialImport=false`, UI button
  disabled, no RPC call and no POST official import call.
- A-16Q-FIX2 did not run SQL, did not run DB push, did not repair migrations,
  did not seed, did not write people/relationships/families/layout/tree/
  revision/profile data, did not deploy and did not push.

## 2026-07-01 - A-16Q-FIX - Import Session UI Evidence + Date Precision Fix + Hydration Assessment

- Marker: `A-16Q-FIX`.
- Final status: `A16Q_FIX_STATUS=VALIDATION_FIX_READY_UI_SMOKE_SAFE_SKIP_CAPABLE`.
- Updated Gia Phả 4 date normalization so four-digit values such as `2020`
  remain year-only dates and are not interpreted as Excel serial dates.
- Updated Gia Phả 4 parser to persist/suggest calendar metadata:
  `birth_date_calendar=solar`, `death_date_calendar=solar|lunar|unknown` and
  `death_anniversary_calendar=lunar`.
- Updated manifest validation to track date precision:
  `year`, `year_month` and `full`.
- Updated manifest validation to track calendar type:
  `solar`, `lunar` and `unknown`.
- `death_before_birth` remains an ERROR only when `deathYear < birthYear` or
  both birth/death share the same known calendar type, are full precision and
  `deathDate < birthDate`.
- Birth date is treated as solar. Death date may be lunar, solar or unknown.
  Death anniversary is treated as lunar. Unknown/different calendar death dates
  produce warning only, not a blocker.
- Same-year death with missing month/day is now warning
  `death_same_year_incomplete_precision`, not a blocker.
- Owner-confirmed rows 19 and 95 are same-year infant death cases and should be
  warning cases, not blocking `death_before_birth` errors.
- Added read-only smoke script
  `scripts/smoke-a16q-import-session-ui-evidence.cjs`; it safe-skips without
  explicit base URL and auth storage state.
- Recorded owner UI evidence: 102 staging rows, 102 staging members, 134
  staging relationships and 44 warnings; previous two blockers were the
  same-year `death_before_birth` rows 19 and 95.
- Hydration warning with `crxlauncher=""` on `<html>` is documented as likely
  browser extension injection. `app/layout.tsx` was not changed and no
  `suppressHydrationWarning` was added.
- Official import remains locked: `canRunOfficialImport=false`, UI button
  disabled, no RPC call and no POST official import call.
- A-16Q-FIX did not run SQL, did not run DB push, did not repair migrations,
  did not seed, did not write people/relationships/families/layout/tree/
  revision/profile data, did not deploy and did not push.

## 2026-07-01 - A-16Q - Session-specific Official Import Execution Approval Blocked

- Marker: `A-16Q`.
- Final status: `A16Q_STATUS=BLOCKED_MISSING_MARKER_OR_SESSION_ID`.
- A-16Q approval was not opened because the prompt did not provide both an
  explicit owner approval record and `A16Q_IMPORT_SESSION_ID=<uuid>` for one
  import session.
- The marker string `APPROVE_A16Q_OFFICIAL_IMPORT_SESSION_EXECUTION` appeared
  only in the condition/requirement text, not as a session-specific approval
  record with an exact session id.
- Required session id is missing: `A16Q_IMPORT_SESSION_ID=<uuid>`.
- Staging evidence remains recorded from prior phases: sheet `Thanh vien`, 102
  staged members and 134 parent relationship candidates, staging-only.
- A-16P-TX manual apply/verification remains PASS and RPC
  `public.a16p_tx_execute_giapha4_official_import` remains fail-closed.
- Official import remains locked: `canRunOfficialImport=false`, UI button
  disabled, no RPC call and no POST official import call.
- Required next phase is A-16R Official Import Execution Run, only after owner
  provides `APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_<SESSION_ID>`.
- A-16Q blocked phase did not run SQL, did not run DB push, did not run
  migration repair, did not seed, did not call RPC, did not call POST official
  import, did not write people/person rows, did not write
  relationships/families, did not update layout/tree/revision/profile data, did
  not deploy and did not push.

## 2026-07-01 - A-16P-TX-APPLY-VERIFY - Manual SQL Apply Verification Record

- Marker: `A-16P-TX-APPLY-VERIFY`.
- Final status: `A16P_TX_APPLY_VERIFY_STATUS=PASS_OWNER_CONFIRMED`.
- Recorded owner confirmation that SQL from
  `db/migrations/20260701_0012_a16p_tx_official_import_transaction_helper_candidate.sql`
  was manually applied in Supabase Dashboard.
- Recorded owner confirmation that SELECT-only verification from
  `db/checks/20260701_check_a16p_tx_official_import_transaction_helper.sql`
  PASS.
- Verification evidence reported by owner:
  `public.a16p_tx_execute_giapha4_official_import` exists, is not
  `SECURITY DEFINER`, has fixed `search_path=public, pg_temp`, has no
  `EXECUTE` for `anon`/`public`, fails closed, has no A-16P policy on real
  tables and has no auto import trigger.
- Function comment still includes `NOT_APPLIED` from the original guardrail
  candidate; this phase documents that owner manually applied it while the
  function remains fail-closed.
- Official import remains locked: `canRunOfficialImport=false`, UI button
  disabled, no RPC call and no POST official import call.
- Next phase remains A-16Q Session-specific Official Import Execution Approval
  and requires `APPROVE_A16Q_OFFICIAL_IMPORT_SESSION_EXECUTION`.
- A-16P-TX-APPLY-VERIFY did not run SQL, did not run `supabase db push`, did
  not run migration repair, did not seed, did not call RPC, did not call POST
  official import, did not write people/person rows, did not write
  relationships/families, did not update layout/tree/revision/profile data, did
  not deploy and did not push.

## 2026-07-01 - A-16P-TX - Official Import Transaction Helper / RPC Schema Readiness

- Marker: `A-16P-TX`.
- Final status: `A16P_TX_STATUS=PASS_WITH_BLOCKER_TRANSACTION_NOT_APPLIED`.
- Created SQL candidate, not applied:
  `db/migrations/20260701_0012_a16p_tx_official_import_transaction_helper_candidate.sql`.
- Created byte-for-byte Supabase mirror:
  `supabase/migrations/20260701_0012_a16p_tx_official_import_transaction_helper_candidate.sql`.
- Created SELECT-only verification SQL:
  `db/checks/20260701_check_a16p_tx_official_import_transaction_helper.sql`.
- Candidate RPC/function name:
  `public.a16p_tx_execute_giapha4_official_import`.
- Candidate is fail-closed: `p_dry_run_only` defaults true, false still returns
  blocker `REAL_EXECUTION_BRANCH_NOT_OPEN_IN_A16P_TX`,
  `can_run_official_import=false`, `created_people_count=0`, and
  `created_relationship_count=0`.
- Runtime A-16P service now records the RPC contract name and blocker
  `BLOCKED_TRANSACTION_HELPER_NOT_APPLIED`, but it does not call RPC and still
  returns `canRunOfficialImport=false`.
- Added rollback/audit contract doc:
  `docs/PLAN_A16P_TX_ROLLBACK_AUDIT_MANIFEST_CONTRACT.md`.
- Added readiness doc/checker:
  `docs/PLAN_A16P_TX_OFFICIAL_IMPORT_TRANSACTION_HELPER_READINESS.md` and
  `scripts/check-a16p-tx-official-import-transaction-helper-readiness.cjs`.
- Future manual SQL apply requires:
  `APPROVE_A16P_TX_RPC_MANUAL_SQL_APPLY`.
- Future session-specific execution requires:
  `APPROVE_A16Q_OFFICIAL_IMPORT_SESSION_EXECUTION`.
- A-16P-TX did not apply DB, did not run SQL, did not run `supabase db push`,
  did not run `supabase db push --dry-run`, did not run migration repair, did
  not seed, did not call RPC, did not call POST official import, did not write
  people/person rows, did not write relationships/families, did not update
  layout/tree/revision/profile data, did not deploy and did not push.

## 2026-07-01 - A-16P - Official Import Runtime Candidate

- Marker present in prompt:
  `APPROVE_A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE`.
- Runtime marker: `A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE`.
- Final status: `A16P_STATUS=BLOCKED_TRANSACTION_HELPER_MISSING`.
- Added locked service candidate:
  `lib/import/giapha4/official-import-service.ts`.
- Added POST route candidate:
  `POST /api/admin/import-sessions/[sessionId]/official-import`.
- Route is fail-closed by server flag
  `A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED`; default is false and
  returns HTTP 423 with `Nhập chính thức chưa được bật trong môi trường này.`
- Even if enabled in a future phase, route requires `confirmMarker`,
  `confirmSessionId`, `confirmNoValidationErrors`,
  `confirmRollbackReviewed` and `confirmAuditReviewed`.
- Service reads staging manifest, validation, dry-run preview and review pack
  only; it does not read Excel again and does not write real genealogy tables.
- Transaction capability check found no safe all-or-nothing transaction helper
  or RPC for people, relationships, revisions and rollback in one boundary.
- Service returns blocker `A16P_BLOCKED_TRANSACTION_HELPER_MISSING`; it does
  not fake best-effort multi-table inserts.
- `/admin/exports/import` still keeps official import disabled and adds locked
  copy: candidate prepared, not enabled, no official import run, rollback/audit
  review required.
- Added doc/checker:
  `docs/PLAN_A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE.md` and
  `scripts/check-a16p-official-import-runtime-candidate.cjs`.
- A-16P did not call POST official import, did not run import, did not write
  people/person rows, did not write relationships/families, did not update
  layout/tree/revision/profile data, did not create migration, did not DB push,
  did not SQL apply, did not seed, did not deploy and did not push.

## 2026-07-01 - A-16I4U/A-16M/A-16N/A-16O - Manual Gia Pha 4 Staging Verification and Official Import Readiness Gate

- Markers: `A-16I4U`, `A-16M`, `A-16N`, `A-16O`.
- A-16I4U final status:
  `A16I4U_STATUS=PASS_OWNER_CONFIRMED_STAGING_ONLY_OFFICIAL_IMPORT_NOT_OPENED`.
- A-16M final status:
  `A16M_STATUS=OFFICIAL_IMPORT_DESIGN_READY_RUNTIME_NOT_OPENED`.
- A-16N final status:
  `A16N_STATUS=LOCKED_OFFICIAL_IMPORT_PREFLIGHT_GATE_READY`.
- A-16O final status:
  `A16O_STATUS=OFFICIAL_IMPORT_RUNTIME_READINESS_HANDOFF_BLOCKED_UNTIL_A16P_MARKER`.
- Owner manually verified the real Gia Pha 4 UI upload: sheet `Thanh vien`
  detected, `102` staged members, `134` parent relationship candidates, and
  data remained staging-only.
- A-16SQL owner-applied staging RLS evidence remains PASS: five staging tables
  have RLS enabled, authenticated SELECT/INSERT policies, authenticated UPDATE
  only on `import_sessions`, no anon/public staging policy, `imports.create`
  exists, and no A-16SQL policy touches real genealogy tables.
- Added official import transaction/rollback/audit design documentation without
  creating any official import write route or service.
- Added locked read-only official import preflight gate service and GET-only API:
  `GET /api/admin/import-sessions/[sessionId]/official-import-gate`.
- `/admin/exports/import` now shows `Cong nhap chinh thuc`,
  `Nhap chinh thuc chua duoc mo`, the future marker
  `APPROVE_A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE`, and keeps the official
  import button disabled.
- Added docs/checkers:
  `docs/PLAN_A16I4U_MANUAL_UI_REAL_GIAPHA4_STAGING_UPLOAD_VERIFICATION.md`,
  `docs/PLAN_A16M_OFFICIAL_IMPORT_TRANSACTION_ROLLBACK_AUDIT_DESIGN.md`,
  `docs/PLAN_A16N_LOCKED_OFFICIAL_IMPORT_PREFLIGHT_GATE.md`,
  `docs/PLAN_A16O_OFFICIAL_IMPORT_RUNTIME_READINESS_HANDOFF.md`,
  `scripts/check-a16i4u-manual-ui-real-giapha4-staging-upload-verification.cjs`,
  `scripts/check-a16m-official-import-transaction-rollback-audit-design.cjs`,
  `scripts/check-a16n-locked-official-import-preflight-gate.cjs`, and
  `scripts/check-a16o-official-import-runtime-readiness-handoff.cjs`.
- A-16I4U/A-16M/A-16N/A-16O did not create migrations, did not run
  `supabase db push`, did not run SQL apply, did not seed, did not deploy, did
  not push, did not write real people/person rows, did not write real
  relationships, did not update families/layout/tree/revision/profile data, did
  not create import token, and did not open official import.

## 2026-07-01 - A-16I3/A-16I4/A-16I5 - Gia Phả 4 Mapping, Real Staging Smoke, Owner Review Pack

- Markers: `A-16I3`, `A-16I4`, `A-16I5`.
- A-16I3 final status: `A16I3_STATUS=XLSX_COLUMN_MAPPING_READY_STAGING_ONLY`.
- A-16I4 final status: `A16I4_STATUS=REAL_STAGING_UPLOAD_SMOKE_READY_OR_SAFE_SKIP`.
- A-16I5 final status: `A16I5_STATUS=OWNER_REVIEW_PACK_READY_OFFICIAL_IMPORT_CLOSED`.
- Hardened Gia Phả 4 `.xlsx` parser for sheet `Thành viên`, `Mã GP`, `Họ tên`,
  `Mã GP Bố`, `Mã GP Mẹ`, placeholder values, Excel serial/year/date parsing and
  parent-reference warnings.
- Added staging `parseSummary` and surfaced Vietnamese upload summary copy for
  `Đã nhận diện sheet Thành viên`, `Mã GP`, and `Quan hệ cha/mẹ`.
- Hardened real staging smoke reason codes:
  `AUTH_SESSION_MISSING`, `PERMISSION_IMPORTS_CREATE_MISSING`,
  `RLS_STAGING_WRITE_BLOCKED`, `PARSER_HEADER_MISSING`,
  `PARSER_SHEET_MISSING`, `PARSER_UNSUPPORTED_XLS`,
  `NETWORK_OR_BASE_URL_ERROR`, `UNKNOWN_UPLOAD_ERROR`.
- Owner reported A-16SQL manual Supabase Dashboard apply verification PASS:
  RLS enabled, authenticated staging SELECT/INSERT policies, authenticated
  UPDATE only on `import_sessions`, no anon/public staging policy,
  `imports.create` exists, and no A-16SQL policy on real genealogy tables.
- Added read-only owner review pack service/API:
  `GET /api/admin/import-sessions/[sessionId]/review-pack`.
- `/admin/exports/import` now shows `Gói rà soát trước khi nhập` and keeps
  `canProceedToOfficialImport=false`, `readyForOfficialImport=false`.
- Added docs/checkers:
  `docs/PLAN_A16I3_GIAPHA4_XLSX_COLUMN_MAPPING.md`,
  `docs/PLAN_A16I4_REAL_GIAPHA4_STAGING_UPLOAD_RUN.md`,
  `docs/PLAN_A16I5_IMPORT_REVIEW_PACK_OFFICIAL_IMPORT_GATE.md`,
  `scripts/check-a16i3-giapha4-xlsx-column-mapping.cjs`,
  `scripts/check-a16i4-real-giapha4-staging-upload-run.cjs`,
  `scripts/check-a16i5-import-review-pack-official-import-gate.cjs`.
- A-16I3/I4/I5 did not create migrations, did not run `supabase db push`, did
  not run SQL apply, did not seed, did not deploy, did not push, did not write
  real people/person rows, did not write real relationships, did not update
  layout/tree/revision, and did not open official import.

## 2026-06-30 - A-16SQL - Import Staging Write RLS Candidate

- Marker: `A-16SQL-RLS-IMPORT-STAGING-WRITE`.
- Final status: `A16SQL_STATUS=SQL_CANDIDATE_READY_NOT_APPLIED`.
- Recorded the production/runtime symptom from A-16I upload:
  `Không đọc được file Gia Phả 4` and
  `Không tạo được import session staging. Bảng có thể đang được RLS bảo vệ hoặc bạn chưa có quyền ghi staging.`
- Added SQL candidate
  `db/migrations/20260630_0011_a16sql_import_staging_write_rls.sql`.
- Added byte-for-byte Supabase mirror
  `supabase/migrations/20260630_0011_a16sql_import_staging_write_rls.sql`.
- Candidate opens owner-scoped staging RLS policies only:
  `SELECT/INSERT/UPDATE` on `import_sessions`, and `SELECT/INSERT` on
  `import_session_warnings`, `import_duplicate_candidates`,
  `import_relationship_candidates` and `import_write_manifests`.
- Policies require `to authenticated`, `public.has_permission('imports.create')`
  and session ownership via `created_by = public.current_profile_id()`.
- No `DELETE`, no anon/public policy, no grant, no service-role bypass, no RLS
  disable, no policy on real genealogy tables.
- Added SELECT-only verification SQL:
  `db/checks/20260630_check_a16sql_import_staging_write_rls.sql`.
- Added checker `scripts/check-a16sql-rls-import-staging-write.cjs` and package
  command `check:a16sql-rls-import-staging-write`.
- Updated A-16G/A-16H/A-16I/A-16J/A-16I2/A-16K/A-16L checkers with a narrow
  allowlist for the exact A-16SQL candidate and verification SQL.
- A-16SQL did not run `supabase db push`, did not run
  `supabase db push --dry-run`, did not run SQL apply, did not run
  `supabase migration repair`, did not seed, did not import Excel, did not write
  people/person rows, did not write relationships, did not update
  layout/tree/revision, did not open official import, did not deploy and did not
  push.

## 2026-06-30 - A-16L - Dry-run Mapping Preview from Manifest Staging

- Marker: `A16L_DRY_RUN_MAPPING_PREVIEW_FROM_MANIFEST_STAGING`.
- Owner marker received for read-only preview:
  `APPROVE_A16K_IMPORT_DRY_RUN_GATE`.
- Added server-only preview service
  `lib/import/giapha4/dry-run-mapping-preview-service.ts`.
- Added GET-only route
  `GET /api/admin/import-sessions/[sessionId]/dry-run-preview`.
- Updated `/admin/exports/import` panel with `Bản xem trước dry-run`,
  `Dữ liệu này chỉ là bản mô phỏng, chưa được ghi vào cây gia phả thật.`,
  `Người dự kiến tạo`, `Quan hệ dự kiến tạo` and
  `Không thể dry-run vì còn lỗi dữ liệu staging`.
- Preview maps manifest staging people/relationships to proposed payload objects
  in runtime response only, including source row/fingerprint references and
  related A-16J issues.
- Summary includes `stagedPeopleCount`, `proposedPeopleCount`,
  `stagedRelationshipCount`, `proposedRelationshipCount`,
  `blockedByErrorCount`, `warningCount` and
  `canProceedToOfficialImport: false`.
- Added checker `scripts/check-a16l-dry-run-mapping-preview.cjs` and package
  command `check:a16l-dry-run-mapping-preview`.
- Updated A-16G/A-16H/A-16I/A-16J/A-16I2/A-16K checkers narrowly to allow the
  A-16L read-only preview service/API/doc/checker while preserving no official
  import/no real genealogy mutation checks.
- A-16L did not create/modify migrations, did not run `supabase db push`, did
  not run SQL apply, did not run `supabase migration repair`, did not seed, did
  not upload/parse a real file, did not write real people/person rows, did not
  write real relationships, did not update layout/tree/revision, did not open
  official import, did not deploy and did not push.
- Validation: `check:env:safe` PASS, `check:migrations` PASS,
  `check:a16g-import-session-read-manifest-runtime` PASS,
  `check:a16h-import-manifest-auth-browser-smoke` PASS,
  `check:a16i-upload-parse-giapha4-manifest-staging` PASS,
  `check:a16j-manifest-staging-review-validation-warnings` PASS,
  `check:a16i2-real-giapha4-upload-smoke` PASS,
  `check:a16k-owner-approval-gate-dry-run-import` PASS,
  `check:a16l-dry-run-mapping-preview` PASS,
  `smoke:a16i2-real-giapha4-upload-staging` SAFE_SKIP_MISSING_EXPLICIT_ENV,
  `typecheck` PASS, `lint` PASS and `build` PASS.

## 2026-06-30 - A-16K - Owner Approval Gate for Dry-run Import

- Marker: `A16K_OWNER_APPROVAL_GATE_DRY_RUN_IMPORT`.
- Required owner approval marker for any later dry-run phase:
  `APPROVE_A16K_IMPORT_DRY_RUN_GATE`.
- Added server-only static gate service
  `lib/import/giapha4/import-dry-run-approval-gate.ts`.
- Added GET-only route
  `GET /api/admin/import-sessions/[sessionId]/dry-run-gate`.
- Updated `/admin/exports/import` panel with `Cổng phê duyệt dry-run`,
  `Dry-run import chưa được mở`, the required marker, and disabled
  `Chạy dry-run — cần phê duyệt`.
- Official import remains disabled with
  `Xác nhận nhập chính thức — chưa mở`.
- Added checker
  `scripts/check-a16k-owner-approval-gate-dry-run-import.cjs` and package
  command `check:a16k-owner-approval-gate-dry-run-import`.
- Updated A-16G/A-16H/A-16I/A-16J/A-16I2 checkers narrowly to allow the A-16K
  gate files while preserving no dry-run mapping/no official import/no real
  genealogy mutation checks.
- A-16K did not create/modify migrations, did not run `supabase db push`, did
  not run SQL apply, did not run `supabase migration repair`, did not seed, did
  not upload/parse a real file, did not write real people/person rows, did not
  write real relationships, did not update layout/tree/revision, did not run
  dry-run mapping, did not open official import, did not deploy and did not push.
- Validation: `check:env:safe` PASS, `check:migrations` PASS,
  `check:a16g-import-session-read-manifest-runtime` PASS,
  `check:a16h-import-manifest-auth-browser-smoke` PASS,
  `check:a16i-upload-parse-giapha4-manifest-staging` PASS,
  `check:a16j-manifest-staging-review-validation-warnings` PASS,
  `check:a16i2-real-giapha4-upload-smoke` PASS,
  `check:a16k-owner-approval-gate-dry-run-import` PASS,
  `smoke:a16i2-real-giapha4-upload-staging` SAFE_SKIP_MISSING_EXPLICIT_ENV,
  `typecheck` PASS, `lint` PASS, `build` PASS, `git diff --check` PASS and
  `git diff --cached --check` PASS.

## 2026-06-30 - A-16I2 - Real Gia Phả 4 Upload Smoke

- Marker: `A16I2_REAL_GIAPHA4_UPLOAD_SMOKE`.
- Added `docs/PLAN_A16I2_REAL_GIAPHA4_UPLOAD_SMOKE.md`.
- Added explicit-env gated smoke:
  `scripts/smoke-a16i2-real-giapha4-upload-staging.cjs`.
- Added checker:
  `scripts/check-a16i2-real-giapha4-upload-smoke.cjs`.
- Added package commands:
  `smoke:a16i2-real-giapha4-upload-staging` and
  `check:a16i2-real-giapha4-upload-smoke`.
- Smoke runs only with
  `A16I2_GIAPHA4_REAL_UPLOAD_BASE_URL`,
  `A16I2_GIAPHA4_REAL_UPLOAD_STORAGE_STATE` and
  `A16I2_GIAPHA4_REAL_FILE_PATH`.
- Current local smoke result:
  `A16I2_REAL_UPLOAD_SMOKE_STATUS=SAFE_SKIP_MISSING_EXPLICIT_ENV` and
  `A16I2_COUNTS_AVAILABLE=false`.
- The real Gia Phả 4 file was not provided in shell env, was not read, was not
  copied into repo and was not committed.
- A-16I2 allows only manifest staging/session staging writes through
  `POST /api/admin/import-sessions/upload` when explicit env is provided.
- A-16I2 did not create/modify migrations, did not run `supabase db push`, did
  not run SQL apply, did not run `supabase migration repair`, did not seed, did
  not write real people/person rows, did not write real relationships, did not
  update layout/tree/revision, did not open official import, did not deploy and
  did not push.
- Validation: `check:env:safe` PASS, `check:migrations` PASS,
  `check:a16g-import-session-read-manifest-runtime` PASS,
  `check:a16h-import-manifest-auth-browser-smoke` PASS,
  `check:a16i-upload-parse-giapha4-manifest-staging` PASS,
  `check:a16j-manifest-staging-review-validation-warnings` PASS,
  `check:a16i2-real-giapha4-upload-smoke` PASS,
  `smoke:a16i2-real-giapha4-upload-staging` SAFE_SKIP,
  `typecheck` PASS, `lint` PASS, `build` PASS, `git diff --check` PASS and
  `git diff --cached --check` PASS.

## 2026-06-30 - A-16J - Manifest Staging Review / Validation Warnings

- Marker: `A16J_MANIFEST_STAGING_REVIEW_VALIDATION_WARNINGS`.
- Added `docs/PLAN_A16J_MANIFEST_STAGING_REVIEW_VALIDATION_WARNINGS.md`.
- Added server-only read-only validation service
  `lib/import/giapha4/manifest-validation-service.ts`.
- Added GET-only route
  `GET /api/admin/import-sessions/[sessionId]/validation`.
- Updated `components/imports/import-session-manifest-panel.tsx` to show
  `Kiểm tra dữ liệu staging`, summary counts, `Lỗi cần xử lý`,
  `Cảnh báo dữ liệu`, `Gợi ý kiểm tra` and the disabled official import CTA.
- Validation is runtime/read-only. A-16J does not persist warning summaries to
  staging tables and does not write real genealogy data.
- Added checker
  `scripts/check-a16j-manifest-staging-review-validation-warnings.cjs` and
  package command `check:a16j-manifest-staging-review-validation-warnings`.
- Updated A-16G/A-16H/A-16I checkers narrowly so their guardrails remain
  compatible with the A-16J read-only validation route/files.
- A-16J did not create/modify migrations, did not run `supabase db push`, did
  not run SQL apply, did not run `supabase migration repair`, did not seed, did
  not import into real people/person tables, did not create real relationships,
  did not update layout/tree/revision, did not open official import, did not
  deploy and did not push.
- Validation: `check:env:safe` PASS, `check:migrations` PASS,
  `check:a16g-import-session-read-manifest-runtime` PASS,
  `check:a16h-import-manifest-auth-browser-smoke` PASS,
  `check:a16i-upload-parse-giapha4-manifest-staging` PASS,
  `check:a16j-manifest-staging-review-validation-warnings` PASS,
  `typecheck` PASS, `lint` PASS, `build` PASS, `git diff --check` PASS and
  `git diff --cached --check` PASS.

## 2026-06-30 - A-16I - Upload/Parse Gia Phả 4 Into Manifest Staging

- Marker: `A16I_UPLOAD_PARSE_GIAPHA4_MANIFEST_STAGING`.
- Added `docs/PLAN_A16I_UPLOAD_PARSE_GIAPHA4_MANIFEST_STAGING.md`.
- Added server-only `.xlsx` staging parser
  `lib/import/giapha4/xlsx-staging-parser.ts` using existing `jszip`; no new
  package was added.
- Added upload/staging service
  `lib/import/giapha4/manifest-upload-service.ts` and route
  `POST /api/admin/import-sessions/upload`.
- Added admin UI upload component
  `components/imports/giapha4-manifest-upload-form.tsx` on
  `/admin/exports/import`.
- Extended A-16G manifest panel/read service to show staged person candidates
  from draft `import_write_manifests.approved_scope.person_candidates` and
  staged relationship candidates from `import_relationship_candidates`.
- Actual supported format: `.xlsx`. `.xls` returns a Vietnamese blocker because
  no binary `.xls` parser dependency is installed or approved in this phase.
- Staging writes are limited to `import_sessions`,
  `import_session_warnings`, `import_duplicate_candidates`,
  `import_relationship_candidates` and `import_write_manifests`; RLS remains
  authoritative through the Supabase server client with user cookies.
- Official import CTA remains disabled:
  `Xác nhận nhập chính thức — chưa mở`.
- Added checker
  `scripts/check-a16i-upload-parse-giapha4-manifest-staging.cjs` and package
  command `check:a16i-upload-parse-giapha4-manifest-staging`.
- Updated A-16G/A-16H checkers narrowly so their guardrails remain compatible
  with the A-16I staging-only route/files.
- A-16I did not create/modify migrations, did not run `supabase db push`, did
  not run SQL apply, did not run `supabase migration repair`, did not seed, did
  not import into real people/person tables, did not create real relationships,
  did not update layout/tree/revision, did not open official import, did not
  deploy and did not push.
- Validation: `check:env:safe` PASS, `check:migrations` PASS,
  `check:a16g-import-session-read-manifest-runtime` PASS,
  `check:a16h-import-manifest-auth-browser-smoke` PASS,
  `check:a16i-upload-parse-giapha4-manifest-staging` PASS, `typecheck` PASS,
  `lint` PASS, `build` PASS, `git diff --check` PASS and
  `git diff --cached --check` PASS.

## 2026-06-30 - A-16H - Authenticated Browser Smoke for Import Manifest Read Screen

- Marker: `A16H_IMPORT_MANIFEST_AUTH_BROWSER_SMOKE`.
- Added `docs/PLAN_A16H_IMPORT_MANIFEST_AUTH_BROWSER_SMOKE.md`.
- Added `scripts/smoke-a16h-import-manifest-auth-browser.cjs`.
- Added `scripts/check-a16h-import-manifest-auth-browser-smoke.cjs`.
- Updated the A-16G checker allowlist so the existing
  `check:a16g-import-session-read-manifest-runtime` gate remains compatible
  with the new A-16H doc/smoke/checker files.
- Added package commands:
  `smoke:a16h-import-manifest-auth-browser` and
  `check:a16h-import-manifest-auth-browser-smoke`.
- Smoke uses explicit shell env only:
  `A16H_IMPORT_MANIFEST_SMOKE_BASE_URL` and
  `A16H_IMPORT_MANIFEST_SMOKE_STORAGE_STATE`.
- Missing explicit env safe-skips before browser navigation with
  `A16H_BROWSER_SMOKE_STATUS=SAFE_SKIP_MISSING_EXPLICIT_ENV`.
- With env and browser runtime, smoke opens `/admin/exports/import`, checks
  Vietnamese read-only copy, checks the official import CTA remains disabled and
  fails on dangerous mutation requests.
- A-16H did not create or modify migrations, did not run `supabase db push`, did
  not run SQL apply, did not seed/import data, did not upload/parse Gia Phả 4,
  did not create real import sessions, did not write people/relationships,
  did not write layout/revision, did not enable official import, did not deploy
  and did not push.
- Validation: `check:env:safe` PASS, `check:migrations` PASS,
  `check:a16g-import-session-read-manifest-runtime` PASS,
  `check:a16h-import-manifest-auth-browser-smoke` PASS,
  `smoke:a16h-import-manifest-auth-browser` SAFE_SKIP with
  `A16H_BROWSER_SMOKE_STATUS=SAFE_SKIP_MISSING_EXPLICIT_ENV`, `typecheck` PASS,
  `lint` PASS and `build` PASS.

## 2026-06-30 - A-16G - Import Session / Read Manifest Runtime

- Marker: `A-16G`.
- Final status: `A16G_STATUS=IMPORT_SESSION_READ_MANIFEST_RUNTIME_READY`.
- Preflight checked: repo started clean at `main...origin/main`, HEAD
  `720e30f`.
- Read `docs/PLAN_A16F5M_MANUAL_SQL_APPLY_VERIFICATION_MIGRATION_STATE_RECONCILIATION.md`
  and kept the manual apply/migration-history reconciliation boundary.
- Added read-only service
  `lib/import/giapha4/manifest-read-service.ts` with marker
  `A16G_IMPORT_SESSION_READ_MANIFEST_RUNTIME`.
- Added GET-only API routes:
  `/api/admin/import-sessions`,
  `/api/admin/import-sessions/[sessionId]` and
  `/api/admin/import-sessions/[sessionId]/manifest`.
- Added read-only admin panel on `/admin/exports/import` via
  `components/imports/import-session-manifest-panel.tsx`.
- Runtime uses existing auth/permission context and Supabase server client with
  user cookies so RLS is respected. It does not use service role in client code.
- UI/API return safe Vietnamese empty/error states when no session exists,
  manifest rows are empty, permission is missing or RLS blocks reads.
- Response shape keeps `canImport: false`, `peoplePreview: []`,
  `relationshipsPreview`, `warnings` and manifest summary fields.
- Added checker
  `scripts/check-a16g-import-session-read-manifest-runtime.cjs` and package
  command `check:a16g-import-session-read-manifest-runtime`.
- A-16G did not create or modify migrations, did not run `supabase db push`, did
  not run SQL, did not seed, did not import Excel into DB, did not create real
  people/relationships, did not update tree layout/revisions, did not deploy
  and did not push.

## 2026-06-30 - A-16F5M - Manual SQL Apply Verification & Migration State Reconciliation

- Marker: `A-16F5M`.
- Final status:
  `A16F5M_STATUS=PASS_MANUAL_SQL_APPLY_VERIFIED_RECONCILIATION_REQUIRED`.
- Preflight checked: repo started clean at `main...origin/main`, HEAD
  `1997774`; `.env.local` is ignored by `.gitignore:17:.env.*`; no staged
  `.xls`, `.xlsx` or `.csv` file.
- Source/mirror migration hash remains
  `D22593729092FEF43C295126E74D5FDCD41ABD696A08DFEC63218C7E1851ABBE`.
- Owner reported manual Supabase Dashboard SQL apply PASS for
  `20260629_0010_a16d_import_manifest_storage_candidate.sql`.
- Owner reported read-only verification PASS:
  `import_sessions`, `import_session_warnings`,
  `import_duplicate_candidates`, `import_relationship_candidates` and
  `import_write_manifests` exist.
- Owner reported RLS enabled, no unintended public/anon policy and row_count = 0
  for all five import manifest tables.
- Recorded migration-history reconciliation risk because manual Dashboard SQL
  apply may not be represented in Supabase CLI migration history.
- Created
  `docs/PLAN_A16F5M_MANUAL_SQL_APPLY_VERIFICATION_MIGRATION_STATE_RECONCILIATION.md`
  and
  `scripts/check-a16f5m-manual-sql-apply-verification-migration-state-reconciliation.cjs`.
- Added package command
  `check:a16f5m:manual-sql-apply-verification-migration-state-reconciliation`.
- A-16F5M did not run `supabase db push`, did not run
  `supabase db push --dry-run`, did not apply DB, did not rerun SQL, did not
  seed, did not import Excel, did not write people/relationships, did not
  deploy and did not push.
- A-16G can open only as a separate phase limited to import manifest/session
  tables; real people/relationship writes remain forbidden.

## 2026-06-29 - A-16F4R - Supabase DB Dry-run Only Rerun

- Marker: `A16F4R_SUPABASE_DB_DRY_RUN_ONLY_RERUN_RECORDED`.
- Preflight checked: repo started clean at `main...origin/main [ahead 1]`,
  HEAD `1ac5412`; `.env.local` is ignored by `.gitignore:17:.env.*`; no
  staged files and no staged `.xls`, `.xlsx` or `.csv` file.
- `npx --yes supabase --version` result: `2.108.0`.
- Source/mirror migration hash remains
  `D22593729092FEF43C295126E74D5FDCD41ABD696A08DFEC63218C7E1851ABBE`.
- Project ref remains owner-confirmed as `frkyeuxrlcflmsxxsolp`.
- Link metadata before rerun was missing: `.supabase/`,
  `.supabase/.temp/` and `.supabase/.temp/project-ref`.
- Attempted
  `npx --yes supabase link --project-ref frkyeuxrlcflmsxxsolp`.
- Link failed with sanitized summary: `LegacyLinkProjectStatusError`; current
  account lacks necessary privileges to access the Supabase remote project
  status endpoint.
- Final status: `A16F4R_STATUS=BLOCKED_SUPABASE_PROJECT_ACCESS_DENIED`.
- Blocker: `A16F4R_BLOCKER=SUPABASE_PROJECT_ACCESS_DENIED`.
- Dry-run command `npx --yes supabase db push --dry-run --linked` was not run
  because project link did not succeed.
- Created `docs/PLAN_A16F4R_SUPABASE_DB_DRY_RUN_ONLY_RERUN.md` and
  `scripts/check-a16f4r-supabase-db-dry-run-only-rerun.cjs`.
- Added package command `check:a16f4r:supabase-db-dry-run-only-rerun`.
- Updated A-16 through A-16F4 checker allowlists narrowly for the A-16F4R
  doc/checker/package-script/docs changes.
- A-16F4R did not run `supabase db push --linked`, did not run
  `supabase db push --dry-run --linked`, did not apply DB, did not seed, did
  not import Excel, did not write people/relationships, did not deploy and did
  not push.
- Runtime guardrail status: Main Worker touched NO, runtime dependency added
  NO, new service Worker NO, OpenNext/Wrangler config changed NO, Worker size
  risk NO.

## 2026-06-29 - A-16F4 - Supabase DB Dry-run Only

- Marker: `A16F4_SUPABASE_DB_DRY_RUN_ONLY_RECORDED`.
- Preflight checked: repo started clean at `main...origin/main [ahead 1]`,
  HEAD `ecf4104`; `.env.local` is ignored by `.gitignore:17:.env.*`; no
  staged files and no staged `.xls`, `.xlsx` or `.csv` file.
- `npx --yes supabase --version` result: `2.108.0`.
- Source/mirror migration hash remains
  `D22593729092FEF43C295126E74D5FDCD41ABD696A08DFEC63218C7E1851ABBE`.
- Project ref remains owner-confirmed as `frkyeuxrlcflmsxxsolp`.
- Link metadata before link was missing: `.supabase/`,
  `.supabase/.temp/` and `.supabase/.temp/project-ref`.
- Attempted
  `npx --yes supabase link --project-ref frkyeuxrlcflmsxxsolp`.
- Link failed with sanitized summary: current account lacks necessary
  privileges to access the Supabase remote project status endpoint.
- Final status: `A16F4_STATUS=BLOCKED_SUPABASE_AUTH_REQUIRED`.
- Blocker: `A16F4_BLOCKER=SUPABASE_LINK_PRIVILEGE_REQUIRED`.
- Dry-run command `npx --yes supabase db push --dry-run --linked` was not run
  because project link did not succeed.
- Created `docs/PLAN_A16F4_SUPABASE_DB_DRY_RUN_ONLY.md` and
  `scripts/check-a16f4-supabase-db-dry-run-only.cjs`.
- Added package command `check:a16f4:supabase-db-dry-run-only`.
- A-16F4 did not run `supabase db push --linked`, did not run
  `supabase db push --dry-run --linked`, did not apply DB, did not seed, did
  not import Excel, did not write people/relationships, did not deploy and did
  not push.
- Runtime guardrail status: Main Worker touched NO, runtime dependency added
  NO, new service Worker NO, OpenNext/Wrangler config changed NO, Worker size
  risk NO.

## 2026-06-29 - A-16F3 - Supabase Metadata Link Migration Path Bridge

- Marker: `A16F3_SUPABASE_METADATA_LINK_MIGRATION_PATH_BRIDGE_RECORDED`.
- Preflight checked: repo started clean at `main...origin/main`, HEAD
  `71c6f96`; `.env.local` is ignored by `.gitignore:17:.env.*`; no staged
  files and no staged `.xls`, `.xlsx` or `.csv` file.
- `npx --yes supabase --version` result: `2.108.0`.
- Ran `npx --yes supabase init --yes`; this created local metadata only:
  `supabase/config.toml` and `supabase/.gitignore`.
- Adjusted local Supabase metadata so `[db.seed] enabled = false` and
  `sql_paths = []`.
- Project ref remains owner-confirmed as `frkyeuxrlcflmsxxsolp`.
- Did not run `npx --yes supabase link --project-ref frkyeuxrlcflmsxxsolp`
  because the active Supabase account/login state was not confirmed in this
  shell.
- Created `supabase/migrations` and copied
  `db/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql`
  to
  `supabase/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql`.
- Byte-for-byte bridge verification PASS:
  `D22593729092FEF43C295126E74D5FDCD41ABD696A08DFEC63218C7E1851ABBE` for
  both source and mirror.
- Final status: `A16F3_STATUS=BRIDGE_READY_LINK_BLOCKED`.
- Created
  `docs/PLAN_A16F3_SUPABASE_METADATA_LINK_MIGRATION_PATH_BRIDGE.md` and
  `scripts/check-a16f3-supabase-metadata-link-migration-path-bridge.cjs`.
- Added package command
  `check:a16f3:supabase-metadata-link-migration-path-bridge`.
- Updated A-16 through A-16F2 checker allowlists narrowly for the A-16F3
  doc/checker/package-script/supabase metadata and mirror migration changes.
- A-16F3 did not run `supabase db push`, did not run
  `supabase db push --dry-run --linked`, did not apply DB, did not seed, did
  not insert/update/delete/upsert, did not import Excel, did not write
  people/relationships, did not deploy and did not push.
- Next planned phase: `A16F4_DRY_RUN_ONLY`.
- Runtime guardrail status: Main Worker touched NO, runtime dependency added
  NO, new service Worker NO, OpenNext/Wrangler config changed NO, Worker size
  risk NO.

## 2026-06-29 - A-16F2 - Supabase Project Link Migration Path Readiness

- Marker: `A16F2_SUPABASE_PROJECT_LINK_MIGRATION_PATH_READINESS_RECORDED`.
- Preflight checked: repo started clean at `main...origin/main`, HEAD
  `0b8d44b`; `.env.local` is ignored by `.gitignore:17:.env.*`; no staged
  files and no staged `.xls`, `.xlsx` or `.csv` file.
- `npx --yes supabase --version` result: `2.108.0`.
- Owner-confirmed project ref recorded: `frkyeuxrlcflmsxxsolp`.
- Local metadata check: `.supabase/`, `supabase/`, `supabase/config.toml`,
  `supabase/migrations`, `.supabase/project-ref` and
  `.supabase/.temp/project-ref` are missing.
- Existing repo migration path remains `db/migrations`; A-16D candidate remains
  `db/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql`.
- Supabase CLI expected migration path recorded as `supabase/migrations`.
- Final status: `A16F2_STATUS=SAFE_SKIP_OR_BLOCKED`.
- Main blockers: project is not linked and migration path strategy is not yet
  applied.
- Recommendation for A-16F3:
  `A16F2_A16F3_RECOMMENDATION=CREATE_SUPABASE_METADATA_AND_BRIDGE_CANDIDATE_WITH_EXPLICIT_CHECKER`.
- Created
  `docs/PLAN_A16F2_SUPABASE_PROJECT_LINK_MIGRATION_PATH_READINESS.md` and
  `scripts/check-a16f2-supabase-project-link-migration-path-readiness.cjs`.
- Added package command
  `check:a16f2:supabase-project-link-migration-path-readiness`.
- Updated A-16 through A-16F1 checker allowlists narrowly for the A-16F2
  doc/checker/package-script changes.
- A-16F2 did not run `supabase init`, did not run `supabase link`, did not run
  `supabase db push`, did not run `supabase db push --dry-run --linked`, did
  not apply DB, did not seed, did not insert/update/delete/upsert, did not
  import Excel, did not write people/relationships, did not deploy and did not
  push.
- Runtime guardrail status: Main Worker touched NO, runtime dependency added
  NO, new service Worker NO, OpenNext/Wrangler config changed NO, Worker size
  risk NO.

## 2026-06-29 - A-16F1 - Supabase CLI Project Link Readiness

- Marker: `A16F1_SUPABASE_CLI_PROJECT_LINK_READINESS_RECORDED`.
- Preflight checked: repo started clean at `main...origin/main`, HEAD
  `aa123fa`; `.env.local` is ignored by `.gitignore:17:.env.*`; no staged
  files and no staged `.xls`, `.xlsx` or `.csv` file.
- `supabase --version` result: global Supabase CLI unavailable in PATH.
- `npx --yes supabase --version` result: `2.108.0`.
- Project link metadata check: `.supabase/`, `supabase/`,
  `supabase/config.toml`, `.supabase/project-ref` and
  `.supabase/.temp/project-ref` are missing; only `db/` exists.
- Env presence check used `npm run check:env:safe`; it reported names-only
  presence and printed no secret values.
- Final status: `A16F1_STATUS=SAFE_SKIP_OR_BLOCKED`.
- Main blocker: `A16F1_BLOCKER=MISSING_SUPABASE_PROJECT_LINK`.
- Created `docs/PLAN_A16F1_SUPABASE_CLI_PROJECT_LINK_READINESS.md` and
  `scripts/check-a16f1-supabase-cli-project-link-readiness.cjs`.
- Added package command
  `check:a16f1:supabase-cli-project-link-readiness`.
- Updated A-16 through A-16F checker allowlists narrowly for the A-16F1
  doc/checker/package-script changes.
- A-16F1 did not run `supabase db push`, did not run
  `supabase db push --dry-run --linked`, did not apply DB, did not seed, did
  not insert/update/delete/upsert, did not import Excel, did not write
  production data, did not deploy and did not push.
- Runtime guardrail status: Main Worker touched NO, runtime dependency added
  NO, new service Worker NO, OpenNext/Wrangler config changed NO, Worker size
  risk NO.

## 2026-06-29 - A-16F - Import Schema DB Apply Verification

- Marker: `A16F_IMPORT_SCHEMA_DB_APPLY_VERIFICATION_RECORDED`.
- Owner approval marker was present exactly:
  `APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY`.
- Preflight checked: repo started clean at `main...origin/main`, HEAD
  `54a22bb`; `.env.local` is ignored by `.gitignore:17:.env.*`; no staged
  files; no staged/tracked `.xls`, `.xlsx` or `.csv` file.
- `supabase --version` failed because the `supabase` command is not available
  in PATH.
- Project link check was blocked because the checkout has no `.supabase/` or
  `supabase/` project-link metadata to confirm the target project safely.
- Dry-run result:
  `A16F_DB_DRY_RUN_RESULT=BLOCKED_SUPABASE_CLI_NOT_AVAILABLE`.
- Apply result: `A16F_DB_APPLY_RESULT=NOT_RUN`.
- Schema verification result: `A16F_SCHEMA_VERIFICATION_RESULT=NOT_RUN_NO_APPLY`.
- RLS verification result:
  `A16F_RLS_VERIFICATION_RESULT=STATIC_CANDIDATE_ONLY_NOT_LIVE_DB`.
- Final status: `A16F_STATUS=SAFE_SKIP_OR_BLOCKED`.
- Created `docs/PLAN_A16F_IMPORT_SCHEMA_DB_APPLY_VERIFICATION.md` and
  `scripts/check-a16f-import-schema-db-apply-verification.cjs`.
- Added package command
  `check:a16f:import-schema-db-apply-verification`.
- Updated A-16/A-16B/A-16C/A-16D/A-16E/A-16E1/A-16E2 checker allowlists
  narrowly for the A-16F doc/checker/package-script changes.
- A-16F did not run `supabase db push --dry-run --linked`, did not run
  `supabase db push --linked`, did not apply DB, did not seed, did not mutate
  people or relationships, did not import Excel, did not enable runtime import
  write, did not add dependency, did not deploy and did not push.
- Runtime guardrail status: Main Worker touched NO, runtime dependency added
  NO, new service Worker NO, OpenNext/Wrangler config changed NO, Worker size
  risk NO.

## 2026-06-29 - A-16E2 - Import Schema Candidate Apply Blocker Resolution

- Marker: `A16E2_IMPORT_SCHEMA_CANDIDATE_APPLY_BLOCKER_RESOLUTION`.
- Preflight checked: repo started clean at `main...origin/main`, HEAD
  `22c58b1`; `.env.local` is ignored by `.gitignore:17:.env.*`; no staged
  files and no staged `.xls`, `.xlsx` or `.csv` file.
- Created
  `docs/PLAN_A16E2_IMPORT_SCHEMA_CANDIDATE_APPLY_BLOCKER_RESOLUTION.md` and
  `scripts/check-a16e2-import-schema-candidate-apply-blocker-resolution.cjs`.
- Added package command
  `check:a16e2:import-schema-candidate-apply-blocker-resolution`.
- Updated A-16/A-16B/A-16C/A-16D/A-16E/A-16E1 checker allowlists narrowly for
  the A-16E2 doc/checker/package-script and not-applied SQL candidate edits.
- Updated
  `db/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql`
  while it remains `NOT_APPLIED`.
- Candidate changes: added A-16E2 marker, `SQL_CANDIDATE_STATUS=NOT_APPLIED`,
  no raw Excel/PII guard comments, RLS fail-closed guard comment, source file
  size check, manifest hash/approval consistency checks and JSON object checks.
- Blocker classification recorded:
  `SCHEMA_BLOCKER`, `RLS_BLOCKER`, `PERMISSION_BLOCKER`, `PII_BLOCKER`,
  `RUNTIME_DEPENDENCY_BLOCKER` and `REVIEW_ONLY_CAUTION`.
- Updated recommendation:
  `A16E2_SCHEMA_APPLY_RECOMMENDATION=READY_FOR_A16F_DB_APPLY_REVIEW`.
- Remaining blockers: owner marker
  `APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY`, target Supabase project,
  backup/rollback/no-go confirmation, A-16F dry-run/apply verification and
  later runtime RLS/grant approach.
- A-16E2 did not apply DB, did not run `supabase db push`, did not run dry-run,
  did not connect production DB, did not seed, did not mutate data, did not add
  dependency, did not deploy and did not push.
- Runtime guardrail status: Main Worker touched NO, runtime dependency added
  NO, new service Worker NO, OpenNext/Wrangler config changed NO, Worker size
  risk NO.

## 2026-06-29 - A-16E1 - Owner Review Import Schema Apply Gate

- Marker: `A16E1_OWNER_REVIEW_IMPORT_SCHEMA_APPLY_GATE`.
- Preflight checked: repo started clean at `main...origin/main`, HEAD
  `1ba9279`; `.env.local` is ignored by `.gitignore:17:.env.*`; no staged
  files and no staged `.xls`, `.xlsx` or `.csv` file.
- Created
  `docs/PLAN_A16E1_OWNER_REVIEW_IMPORT_SCHEMA_APPLY_GATE.md` and
  `scripts/check-a16e1-owner-review-import-schema-apply-gate.cjs`.
- Added package command
  `check:a16e1:owner-review-import-schema-apply-gate`.
- Updated A-16/A-16B/A-16C/A-16D/A-16E checker allowlists narrowly for the
  A-16E1 doc/checker/package-script change.
- Reviewed A-16D SQL candidate and A-16E apply gate. Result:
  `A16E1_REVIEW_RESULT=PASS_WITH_OWNER_APPLY_GATE_BLOCKED`.
- Apply recommendation recorded:
  `A16E1_APPLY_RECOMMENDATION=DO_NOT_APPLY_YET` because owner marker, target
  Supabase project confirmation, backup/rollback position and final
  RLS/grant/runtime approach are missing.
- Static SQL safety review: no dangerous `DROP TABLE`, no `TRUNCATE`, no
  `DELETE FROM`, no data `UPDATE`, no seed/data `INSERT`, no broad `GRANT`, no
  `CREATE POLICY` and no RLS disable statement.
- Naming/schema review: migration path follows `db/migrations` convention,
  import table names do not conflict with existing people/family/lineage tables,
  and optional `clan_id`/`branch_id` are appropriate for the current schema
  while exact runtime scope remains a later decision.
- RLS review: fail-closed remains correct; no grants/policies are added.
- A-16E1 did not apply DB, did not run `supabase db push`, did not run dry-run,
  did not connect production DB, did not seed, did not mutate data, did not add
  dependency, did not deploy and did not push.
- Hard stop: marker `APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY` is missing,
  so A-16F/A-16G/A-16H/A-16I remain blocked.
- Runtime guardrail status: Main Worker touched NO, runtime dependency added
  NO, new service Worker NO, OpenNext/Wrangler config changed NO, Worker size
  risk NO.

## 2026-06-29 - A-16E - Import Schema Candidate / DB Apply Gate

- Marker: `A16E_IMPORT_SCHEMA_CANDIDATE_DB_APPLY_GATE`.
- Preflight checked: repo started clean at `main...origin/main`, HEAD
  `4677ec2`; `.env.local` is ignored by `.gitignore:17:.env.*`; no staged
  files and no staged `.xls`, `.xlsx` or `.csv` file.
- Created
  `docs/PLAN_A16E_IMPORT_SCHEMA_CANDIDATE_DB_APPLY_GATE.md` and
  `scripts/check-a16e-import-schema-candidate-db-apply-gate.cjs`.
- Added package command
  `check:a16e:import-schema-candidate-db-apply-gate`.
- Updated A-16/A-16B/A-16C/A-16D checker allowlists narrowly for the A-16E
  doc/checker/package-script change.
- Reviewed
  `db/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql`:
  additive candidate tables only, no `DROP`, no `TRUNCATE`, no `DELETE FROM`,
  no data `UPDATE`, no seed/data `INSERT`, no broad `GRANT`, no `CREATE POLICY`
  and no RLS disable statement.
- Schema review PASS for import sessions, warnings, duplicate candidates,
  relationship candidates, write manifests, source/manifest hashes, lifecycle
  status, owner decision state and rollback/write manifest shape.
- RLS review PASS fail-closed: A-16D candidate enables RLS on all five import
  tables and intentionally adds no policies or grants.
- Supabase platform note recorded: future Data API/client access may require
  explicit grants plus RLS policies, but A-16E intentionally does not add them.
- A-16E did not apply DB, did not run `supabase db push`, did not connect to
  production DB, did not seed, did not mutate app data, did not add dependency,
  did not deploy and did not push.
- Hard stop: marker `APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY` is missing,
  so A-16F/A-16G/A-16H/A-16I remain blocked.
- Runtime guardrail status: Main Worker touched NO, runtime dependency added
  NO, new service Worker NO, OpenNext/Wrangler config changed NO, Worker size
  risk NO.

## 2026-06-29 - A-16D - Import Schema Candidate / Manifest Storage Design

- Marker: `A16D_IMPORT_SCHEMA_CANDIDATE_MANIFEST_STORAGE_DESIGN`.
- Precondition checked: A-16 commit `f824cbe`, A-16B commit `a05f1a9`
  and A-16C commit `b58ee98` exist locally; repo started
  `main...origin/main [ahead 3]`; `.env.local` remains ignored by
  `.gitignore:17:.env.*`; no staged `.xls`, `.xlsx` or `.csv` file.
- Created
  `docs/PLAN_A16D_IMPORT_SCHEMA_CANDIDATE_MANIFEST_STORAGE_DESIGN.md`,
  `db/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql`
  and
  `scripts/check-a16d-import-schema-candidate-manifest-storage-design.cjs`.
- Added package command
  `check:a16d:import-schema-candidate-manifest-storage-design`.
- Updated A-16/A-16B/A-16C checkers with a narrow allowlist exception for the
  A-16D doc/checker/not-applied SQL candidate only.
- Migration status: SQL candidate file created, `NOT_APPLIED`; no
  `supabase db push`, no production DB connection and no database mutation was
  run.
- Candidate tables: `import_sessions`, `import_session_warnings`,
  `import_duplicate_candidates`, `import_relationship_candidates` and
  `import_write_manifests`.
- RLS status: candidate enables RLS on all five tables but creates no policies
  and no permission seed, keeping storage fail-closed until a future approved
  phase.
- Privacy status: no real Gia Pha 4.0 Excel/CSV file, screenshot, raw source
  rows or real personal data committed; candidate is metadata/hash/count/
  fingerprint oriented and records `NO_EXCEL_FILE_STORAGE`.
- Future gates recorded:
  `APPROVE_A16E_IMPORT_MANIFEST_SCHEMA_APPLY` for DB apply verification and
  `APPROVE_A16F_GIAPHA4_IMPORT_DB_WRITE_RUNTIME` for real import write
  runtime.
- Runtime guardrail status: Main Worker touched NO, runtime dependency added
  NO, new service Worker NO, OpenNext/Wrangler config changed NO, Worker size
  risk NO, deploy NO.

## 2026-06-29 - A-16C - Owner Review Import Preview DB Write Approval Design

- Marker: `A16C_OWNER_REVIEW_IMPORT_PREVIEW_DB_WRITE_APPROVAL_DESIGN`.
- Precondition checked: A-16 commit `f824cbe` and A-16B commit `a05f1a9`
  exist locally; repo started `main...origin/main [ahead 2]`; `.env.local`
  remains ignored by `.gitignore:17:.env.*`; no staged `.xls`, `.xlsx` or
  `.csv` file.
- Created
  `docs/PLAN_A16C_OWNER_REVIEW_IMPORT_PREVIEW_DB_WRITE_APPROVAL_DESIGN.md`
  and
  `scripts/check-a16c-owner-review-import-preview-db-write-approval-design.cjs`.
- Added package command
  `check:a16c:owner-review-import-preview-db-write-approval-design`.
- Scope: design/documentation/checker only for owner review and DB-write
  approval gates. No runtime import write route/action/service was created.
- Designed review steps for summary, person candidates, parent-child
  relationships, spouse/couple relationships, duplicate/ambiguity, privacy
  notes, import scope and owner approval marker.
- Designed approval states, manifest fields, future DB write groups,
  duplicate/merge policy, relationship ambiguity policy, privacy/PII policy and
  rollback manifest policy.
- Required future markers recorded:
  `APPROVE_A16D_GIAPHA4_IMPORT_SCHEMA_CANDIDATE` and
  `APPROVE_A16E_GIAPHA4_IMPORT_DB_WRITE_RUNTIME`.
- No DB insert/update/delete/upsert, no migration, no seed, no RLS/auth/
  permission runtime change, no dependency, no deploy, no push, no real Excel
  file and no real personal data committed.
- Runtime guardrail status: Main Worker touched NO, runtime dependency added NO,
  new service Worker NO, OpenNext/Wrangler config changed NO, Worker size risk
  NO.

## 2026-06-29 - A-16B - Gia Pha 4.0 Excel Import Preview Runtime UI

- Marker: `A16B_GIAPHA4_EXCEL_IMPORT_PREVIEW_RUNTIME_UI`.
- Precondition checked: A-16 is complete at local commit `f824cbe` with
  mapping/readiness docs and PASS validation recorded. Current repo started
  from `main...origin/main [ahead 1]`, with no staged `.xls`, `.xlsx` or
  `.csv` file and `.env.local` ignored by `.gitignore:17:.env.*`.
- Added
  `docs/PLAN_A16B_GIAPHA4_EXCEL_IMPORT_PREVIEW_RUNTIME_UI.md`,
  `scripts/check-a16b-giapha4-excel-import-preview-runtime-ui.cjs`,
  `lib/import/giapha4/types.ts`, `lib/import/giapha4/normalize.ts`,
  `lib/import/giapha4/parser.ts`, `lib/import/giapha4/preview.ts`,
  `app/api/admin/import/giapha4/preview/route.ts` and
  `components/imports/giapha4-import-preview-form.tsx`.
- Updated existing `/admin/exports/import` to show a Gia Pha 4.0 Excel preview
  panel before the existing `family.json` preview form.
- Dependency status remains unchanged: no `xlsx`, no `exceljs`, no new parser
  dependency and no package dependency change.
- Runtime status:
  `A16B_PREVIEW_RUNTIME_STATUS=SAFE_SKIP_MISSING_EXCEL_PARSER_DEPENDENCY`.
  The API returns structured safe-skip preview JSON with `db_write: false`,
  `printed_pii: false`, `stored_file: false`, zero parsed rows and Vietnamese
  warnings.
- UI actions: `Xem trước dữ liệu`, `Tải lại file` and disabled
  `Nhập dữ liệu thật`. There is no active real-import button in A-16B.
- No DB insert/update/delete/upsert, no migration, no seed, no RLS/auth/
  permission contract change, no production data mutation, no deploy, no push,
  no real Excel file and no real personal data committed.
- Runtime guardrail status: Main Worker touched YES for small admin UI/API
  coordination only, runtime dependency added NO, new service Worker NO,
  OpenNext/Wrangler config changed NO, Worker size risk LOW.

## 2026-06-29 - A-16 - Import Du Lieu Gia Pha 4.0 Tu File Excel iPhone

- Marker: `A16_GIAPHA4_EXCEL_IMPORT_MAPPING_READINESS`.
- Created
  `docs/PLAN_A16_GIAPHA4_EXCEL_IMPORT_MAPPING_READINESS.md`,
  `scripts/inspect-giapha4-excel-import.cjs`,
  `scripts/check-a16-giapha4-excel-import-mapping-readiness.cjs`
  and package commands
  `check:a16:giapha4-excel-import-mapping-readiness` and
  `inspect:giapha4-excel`.
- Scope: analysis/design/checker and optional privacy-safe workbook inspection
  only. The phase is `NO_DB_WRITE`, with no insert/update/delete, no migration,
  no seed, no RLS/auth/permission/API contract change, no deploy and no
  production data mutation.
- Checked safe sample locations: `data/import-samples/`, `tmp/`, `private/`
  and project root. No `.xls`, `.xlsx` or `.csv` input file was found in the
  inspected locations, and no real workbook or real personal data was added.
- Checked direct package/runtime parser availability: `xlsx`, `exceljs`,
  `csv-parse` and `papaparse` are not present. No dependency was added.
- Added a safe-skip inspector that accepts a local path or
  `GIAPHA4_EXCEL_PATH`, prints metadata/header/sample-shape only when a parser
  dependency is available, and otherwise returns
  `SAFE_SKIP_EXCEL_DEPENDENCY_MISSING` or `SAFE_SKIP_NO_INPUT_PATH` without
  printing raw PII or writing output files.
- Recorded proposed Gia Pha 4.0 mapping to current people/family relationship
  fields, duplicate policy, relationship preview behavior, privacy rules and
  A16B approval gates before any real import or DB mutation.
- Runtime guardrail status: Main Worker touched NO, dependency added NO, new
  service Worker NO, OpenNext/Wrangler config changed NO.

## 2026-06-29 - A-15E3 - Safe GitHub Actions Linux Production Deploy Verification

- Marker: `A15E3_SAFE_GITHUB_ACTIONS_LINUX_PRODUCTION_DEPLOY_VERIFICATION`.
- Created
  `docs/PLAN_A15E3_SAFE_GITHUB_ACTIONS_LINUX_PRODUCTION_DEPLOY_VERIFICATION.md`,
  `scripts/check-a15e3-safe-github-actions-linux-production-deploy-verification.cjs`
  and package command
  `check:a15e3:safe-github-actions-linux-production-deploy-verification`.
- Scope: verification/documentation/checker only after owner ran the manual
  GitHub Actions Cloudflare Deploy workflow; no deploy rerun and no rollback.
- Local state before edits: `git status -sb` was clean on
  `main...origin/main`, HEAD `9b6383e`, and `.env.local` is ignored by
  `.gitignore:17:.env.*`.
- Verified `.github/workflows/cloudflare-deploy.yml`: `workflow_dispatch`,
  `ubuntu-latest`, Node.js `24`, required Cloudflare/Supabase env contract, and
  deploy step `npm run deploy`.
- Verified `.github/workflows/opennext-build-gate.yml`: can run on push, but
  only builds/checks OpenNext and does not deploy production.
- Recorded owner-reported GitHub Actions warning:
  Node.js 20 deprecated / actions forced to Node.js 24. Classified as
  `NON_BLOCKING_GITHUB_ACTIONS_RUNNER_ADVISORY_IF_WORKFLOW_SUCCESS`; workflow
  run status was not independently read via GitHub API in this phase.
- Production smoke after the owner-reported GitHub Actions deploy:
  `/` 200, `/tree` 200, `/auth/login` 200, `/admin` 307 redirect to login.
  Result: `A15E3_STATUS=PASS_GITHUB_ACTIONS_LINUX_DEPLOY_VERIFIED`.
- `npx wrangler deployments list` was read-only and showed current active
  version `f8287634-ecfa-45f6-ac8a-d519e1b4e30b` with 100% traffic.
- Recommendation recorded: do not deploy production from Windows again; keep
  manual GitHub Actions Linux deploy; do not enable auto deploy on push until
  several manual deploys pass.
- No DB migration, seed, RLS/auth/permission/API contract change, production
  data mutation, dependency, `.env.local` commit or OpenNext/Wrangler config
  change.

## 2026-06-29 - A-15E2 - Production 500 Rollback & Deploy Failure Diagnostics

- Marker: `A15E2_PRODUCTION_500_ROLLBACK_DEPLOY_FAILURE_DIAGNOSTICS`.
- Created
  `docs/PLAN_A15E2_PRODUCTION_500_ROLLBACK_DEPLOY_FAILURE_DIAGNOSTICS.md`,
  `scripts/check-a15e2-production-500-rollback-deploy-failure-diagnostics.cjs`
  and package command
  `check:a15e2:production-500-rollback-deploy-failure-diagnostics`.
- Scope: diagnostics/documentation/checker only after owner reported that a
  production deploy from Windows caused HTTP 500 on `/`, `/tree`, `/auth/login`
  and `/admin`, then rollback restored production.
- Recorded owner-confirmed rollback target:
  `4134298b-ef89-4099-b20b-b13995f397c8`.
- Read-only evidence collected:
  `git status -sb`, `git log --oneline --decorate -12`,
  `npx wrangler deployments list`, package deploy script discovery,
  config reads for `wrangler.toml`, `open-next.config.ts`, `next.config.ts`,
  `.open-next` directory metadata, `npx wrangler secret list`, Wrangler version
  and read-only production route status.
- Production post-rollback route status observed:
  `/` 200, `/tree` 200, `/auth/login` 200, `/admin` 307 to login.
- Secret check was names-only. `SUPABASE_SERVICE_ROLE_KEY` was listed as a
  secret; no secret value was printed or written.
- Likely cause candidates recorded: Windows OpenNext runtime bundle issue,
  missing/mismatched production vars or secrets, wrong deploy command/order,
  stale or incompatible `.open-next` output and Wrangler/OpenNext version
  mismatch.
- Safe direction: no redeploy in A-15E2; prefer A-15E3 with owner approval,
  WSL or GitHub Actions Linux deploy path, env/secret verification and rollback
  plan.
- No deploy, no extra rollback, no DB migration, no seed, no production data
  mutation, no dependency and no OpenNext/Wrangler config change.

## 2026-06-29 - A-15E - Heritage UI Production Deploy Readiness & Smoke

- Marker: `A15E_HERITAGE_UI_PRODUCTION_DEPLOY_READINESS_SMOKE`.
- Added `docs/PLAN_A15E_HERITAGE_UI_PRODUCTION_DEPLOY_READINESS_SMOKE.md`.
- Added `scripts/check-a15e-heritage-ui-production-deploy-readiness-smoke.cjs`
  and package command
  `check:a15e:heritage-ui-production-deploy-readiness-smoke`.
- Git/GitHub status before A-15E edits: `GIT_STATUS=PASS_SYNCED_CLEAN`,
  local `main` and `origin/main` were `0_AHEAD_0_BEHIND`, `.env.local` ignored.
- Env/secret status: local env presence check can pass, but production
  Cloudflare secret readiness is `UNKNOWN`; `npx wrangler secret list` did not
  return the `web-gia-pha` secret list in this local account/context.
- Service role rotation after prior exposure is not owner-confirmed, so deploy
  was blocked with `DEPLOY_STATUS=SAFE_SKIP_SECRET_ROTATION_REQUIRED` and
  `PRODUCTION_DEPLOY_READINESS_STATUS=SAFE_SKIP_SECRET_ROTATION_REQUIRED`.
- Existing production read-only smoke against
  `https://web-gia-pha.hungdiepcompany.workers.dev` was partial: `/`, `/tree`
  and `/auth/login` returned 200; `/admin` returned 307 to login; no forbidden
  secret/privacy marker was counted. This is current-production evidence only,
  not proof that the new heritage UI was deployed.
- Boundary: no deploy, no push, no UI change, no DB migration, no seed, no data
  mutation, no env commit, no secret log, no auth/runtime/API/service change, no
  dependency and no OpenNext/Wrangler config change.

## 2026-06-29 - A-15B2 - Manual Authenticated Admin Heritage UI Smoke

- Marker: `A15B2_MANUAL_AUTHENTICATED_ADMIN_HERITAGE_UI_SMOKE`.
- Added `docs/PLAN_A15B2_MANUAL_AUTHENTICATED_ADMIN_HERITAGE_UI_SMOKE.md`.
- Added `scripts/check-a15b2-manual-authenticated-admin-heritage-ui-smoke.cjs`
  and package command
  `check:a15b2:manual-authenticated-admin-heritage-ui-smoke`.
- Recorded owner manual confirmation:
  `Manual owner/admin login: PASS_OWNER_CONFIRMED`,
  `Supabase callback URL config: PASS_OWNER_CONFIRMED`, `/admin real browser
  session: PASS_OWNER_CONFIRMED`.
- Conclusion: `AUTH_RUNTIME_STATUS=PASS_OWNER_CONFIRMED`,
  `AUTOMATED_BROWSER_SMOKE_STATUS=NEEDS_PERSISTED_SESSION_CONTEXT`,
  `A15C3_AUTH_FIX_NEEDED=false`, `A15D_PERMISSION_SEED_NEEDED=false`.
- Interpreted A-15B1/A-15C2 `auth_session_missing` as non-persisted smoke
  browser context rather than auth runtime failure.
- Boundary: documentation/checker-only; no UI, no auth runtime change, no
  mutation, no seed, no role assignment, no database/schema/RLS/permission/API/
  service runtime change, no dependency, no form submit and no `.env.local`
  commit.

## 2026-06-29 - A-15C2 - Supabase Auth Browser Session Binding Diagnostics

- Marker: `A15C2_SUPABASE_AUTH_BROWSER_SESSION_BINDING_DIAGNOSTICS`.
- Added `docs/PLAN_A15C2_SUPABASE_AUTH_BROWSER_SESSION_BINDING_DIAGNOSTICS.md`.
- Added `scripts/smoke-a15c2-auth-browser-session-binding-diagnostics.cjs`,
  `scripts/check-a15c2-supabase-auth-browser-session-binding-diagnostics.cjs`,
  package commands `smoke:a15c2:supabase-auth-browser-session-binding-diagnostics`
  and `check:a15c2:supabase-auth-browser-session-binding-diagnostics`.
- Static auth flow observation: `/auth/login`, `/auth/callback` and
  `/auth/logout` exist; callback reads `code`, handles callback errors and calls
  `supabase.auth.exchangeCodeForSession(code)`.
- Login redirect observation: magic link uses `/auth/callback` from
  `NEXT_PUBLIC_APP_URL`; Google OAuth uses `window.location.origin/auth/callback`.
- Cookie/server observation: server client uses `@supabase/ssr` with
  `cookies().getAll()` and `setAll`; `/admin` has no `middleware.ts` guard and
  instead redirects through server-side `requirePermission("people.view")`.
- Diagnostic result recorded as `DIAGNOSTIC_STATUS=PARTIAL`,
  `DIAGNOSTIC_REASON=AUTH_FLOW_STATIC_PRESENT_BROWSER_SESSION_NOT_BOUND`: A-15C
  permission readiness is PASS, `/auth/login` and `/tree` return 200 locally, but
  `/admin` returns 307 to login with `auth_session_missing`; cookie after a real
  owner/admin callback still requires manual browser trace without printing cookie
  values.
- Boundary: diagnostics/read-only only; no UI polish, no login submission, no
  mutation, no seed, no role assignment, no database/schema/RLS/auth/permission/
  API/service runtime change, no dependency and no `.env.local` commit.

## 2026-06-29 - A-15B1 - Authenticated Admin Heritage UI Browser Smoke Rerun

- Marker: `A15B1_AUTHENTICATED_ADMIN_HERITAGE_UI_BROWSER_SMOKE_RERUN`.
- Added `docs/PLAN_A15B1_AUTHENTICATED_ADMIN_HERITAGE_UI_BROWSER_SMOKE_RERUN.md`.
- Added `scripts/check-a15b1-authenticated-admin-heritage-ui-browser-smoke-rerun.cjs`
  and package command
  `check:a15b1:authenticated-admin-heritage-ui-browser-smoke-rerun`.
- Reran A-15C readiness before browser smoke: `READINESS_STATUS=PASS`,
  `READINESS_REASON=OWNER_ADMIN_PERMISSION_READY_READ_ONLY`, `ROLE_COUNT=1`,
  `PERMISSION_COUNT=25`, `REQUIRED_ADMIN_PERMISSION_MISSING_COUNT=0`.
- Browser rerun used local `http://localhost:3000` after starting a fresh dev
  server. `/admin` still redirected to `/auth/login?reason=auth_session_missing!`,
  so browser session status is `FAIL_AUTH_SESSION_NOT_BOUND`.
- Admin shell status is `FAIL_UNKNOWN_USER_ROLE_PERMISSION_ZERO`: admin routes
  that rendered still showed `Người dùng: Không rõ`, `Vai trò: Chưa có vai trò`,
  `Số quyền: 0`.
- Route results: `/tree` PASS; `/people/[slug]`
  `SAFE_SKIP_NO_PUBLICLY_VISIBLE_PROFILE`; `/admin` `FAIL_AUTH_SESSION_NOT_BOUND`;
  `/admin/genealogy`, `/admin/tree/edit`, `/admin/people/new`,
  `/admin/relationships` and `/admin/people/[id]` PARTIAL read-only renders.
- Desktop/mobile smoke found no horizontal overflow on the opened routes.
- Boundary: browser/readiness verification-only; no form submit, no mutation, no
  seed, no role assignment, no schema/RLS/auth/permission/API/service runtime
  change, no dependency and no push.

## 2026-06-29 - A-15C - Owner/Admin Session Permission Smoke Readiness

- Marker: `A15C_OWNER_ADMIN_SESSION_PERMISSION_SMOKE_READINESS`.
- Added `docs/PLAN_A15C_OWNER_ADMIN_SESSION_PERMISSION_SMOKE_READINESS.md`.
- Added `scripts/smoke-a15c-owner-admin-session-permission-readiness.cjs`,
  `scripts/check-a15c-owner-admin-session-permission-smoke-readiness.cjs`,
  package commands `smoke:a15c:owner-admin-session-permission-readiness` and
  `check:a15c:owner-admin-session-permission-smoke-readiness`.
- Readiness result was PASS using SELECT/read-only checks only:
  `ENV_SUPABASE_URL_PRESENT=true`, `ENV_SUPABASE_ANON_PRESENT=true`,
  `ENV_SERVICE_ROLE_PRESENT=true`, `ADMIN_CLIENT_READY=true`,
  `AUTH_USER_FOUND=true`, `PROFILE_FOUND=true`, `ROLE_COUNT=1`,
  `PERMISSION_COUNT=25`, `REQUIRED_ADMIN_PERMISSION_MISSING_COUNT=0`.
- Boundary: no seed, no role assignment, no mutation, no DB/schema/RLS/auth/
  permission/API/service runtime change and no secret/email/token output.

## 2026-06-28 - A-15B - Authenticated Heritage UI Browser Smoke

- Marker: `A15B_AUTHENTICATED_HERITAGE_UI_BROWSER_SMOKE`.
- Ran read-only browser smoke on local `http://localhost:3100` after A-15A2
  through A-15A6. No form was submitted, no mutation route was exercised and no
  browser/session artifact was saved.
- Public smoke: `/tree` is `PASS` for desktop/mobile with no horizontal overflow,
  public read-only Vietnamese empty state and route-safe CTAs. `/people/[slug]`
  is `SAFE_SKIP_NO_PUBLICLY_VISIBLE_PROFILE` because public/anon lookup did not
  find a profile route that can be read safely.
- Admin smoke: `/admin` is `SAFE_SKIP_AUTH_REQUIRED` because it redirects to
  login. `/admin/genealogy`, `/admin/tree/edit`, `/admin/people/new`,
  `/admin/people/[id]` and `/admin/relationships` are `PARTIAL` read-only
  renders because the browser did not have a verified owner/admin session and
  the shell showed `Người dùng: Không rõ`, `Vai trò: Chưa có vai trò`,
  `Số quyền: 0`.
- Desktop/mobile checks did not find horizontal overflow on the smoked routes.
- Added `docs/PLAN_A15B_AUTHENTICATED_HERITAGE_UI_BROWSER_SMOKE.md`.
- Added `scripts/check-a15b-authenticated-heritage-ui-browser-smoke.cjs` and
  package command `check:a15b:authenticated-heritage-ui-browser-smoke`.
- Boundary: verification-only; no UI polish, no database/schema/migration/seed/
  RLS/auth/permission/API/service runtime change, no dependency, no deploy and
  no push.

## 2026-06-28 - A-15A6 - Add/Edit Member Form Vietnamese Heritage UX

- Marker: `A15A6_ADD_EDIT_MEMBER_FORM_VIETNAMESE_HERITAGE_UX`.
- Polished add/edit member and relationship data-entry forms as warm Vietnamese
  heritage UX while keeping field names, actions, services, permissions and
  validation contracts unchanged.
- Touched UI files: `app/(admin)/admin/people/new/page.tsx`,
  `app/(admin)/admin/people/[id]/page.tsx`,
  `components/people/person-form.tsx`,
  `app/(admin)/admin/relationships/page.tsx`,
  `components/relationships/relationship-form.tsx`,
  `components/relationships/couple-form.tsx`,
  `components/tree/tree-editor-side-panel.tsx` and
  `components/ui/form-submit-button.tsx`.
- Member form now reads like a `Phiếu ghi thông tin gia tộc số`, with clear
  `Thêm thành viên` / `Sửa thông tin thành viên` context, grouped sections,
  required/help copy, privacy guidance and pending state
  `Đang lưu thông tin thành viên...`.
- Relationship forms now use clear cards for creating a family, adding cha/mẹ,
  adding con and adding vợ/chồng, with gentle warnings before changes that may
  affect the phả đồ.
- Tree Editor related-member entry keeps the existing flow and actions, but adds
  clearer context, required-field help and privacy guidance.
- Added `docs/PLAN_A15A6_ADD_EDIT_MEMBER_FORM_VIETNAMESE_HERITAGE_UX.md`.
- Added `scripts/check-a15a6-add-edit-member-form-vietnamese-heritage-ux.cjs`
  and package command `check:a15a6:add-edit-member-form-vietnamese-heritage-ux`.
- Boundary: UI/UX-only, no migration/schema/seed/DB apply, no API/action/service
  runtime contract change, no auth/permission/RLS, no route creation, no
  dependency, no external website asset and no deploy/push.

## 2026-06-28 - A-15A5 - Member Profile / Person Detail Vietnamese Heritage UI

- Marker: `A15A5_MEMBER_PROFILE_PERSON_DETAIL_VIETNAMESE_HERITAGE_UI`.
- Polished the existing public member profile and admin person detail screens
  while keeping all data, auth, permission and runtime contracts unchanged.
- Touched UI files: `app/(public)/people/[slug]/page.tsx`,
  `components/public/public-person-profile.tsx`,
  `app/(admin)/admin/people/[id]/page.tsx` and
  `components/people/person-form.tsx`.
- Public profile now uses a warm heritage profile card with text-avatar,
  `Thông tin cơ bản`, `Gia đình & quan hệ`, `Ghi chú`, `Quyền riêng tư`,
  `Chưa cập nhật` empty values and route-safe `Xem trong phả đồ` navigation.
- Admin person detail now opens with `Hồ sơ thành viên`, quick actions for
  member list, phả đồ and relationship management, a clearer two-column desktop
  layout, summary tiles and grouped panels for dòng họ, quan hệ, history and
  soft-delete safety.
- Person form sections are clearer for older users: basic information, birth/
  death dates, quê quán/dòng họ, notes and privacy. Field names/actions were not
  changed.
- Added `docs/PLAN_A15A5_MEMBER_PROFILE_PERSON_DETAIL_VIETNAMESE_HERITAGE_UI.md`.
- Added `scripts/check-a15a5-member-profile-person-detail-vietnamese-heritage-ui.cjs`
  and package command
  `check:a15a5:member-profile-person-detail-vietnamese-heritage-ui`.
- Boundary: UI-only, no migration/schema/seed/DB apply, no API/action/service
  runtime contract change, no auth/permission/RLS, no route creation, no
  dependency, no external website asset and no deploy/push.

## 2026-06-28 - A-15A4 - Vietnamese Heritage Family List / Admin Dashboard UI

- Marker: `A15A4_VIETNAMESE_HERITAGE_FAMILY_LIST_ADMIN_DASHBOARD_UI`.
- Polished the existing admin dashboard, admin shell/sidebar and gia phả/dòng họ
  list cards while keeping all data, auth, permission and runtime contracts
  unchanged.
- Touched UI files: `app/(admin)/admin/page.tsx`,
  `app/(admin)/admin/genealogy/page.tsx`,
  `components/layout/admin-shell.tsx` and
  `components/genealogy/lineage-admin.tsx`.
- `/admin` now opens with a warmer `Quản trị gia phả` heritage banner,
  `Dòng họ của tôi` quick-start copy, compact stats for `Gia phả`,
  `Thành viên`, `Thế hệ` and `Nhánh quan hệ`, plus route-safe quick actions.
- `/admin/genealogy` now has `Gia phả của tôi` cards with public/private status,
  member count, generation count, branch count, last-updated date and existing
  actions: `Xem phả đồ`, `Quản lý thành viên`, `Chỉnh sửa`,
  `Thiết lập riêng tư`.
- Empty/loading/error/permission-adjacent copy includes
  `Đang tải danh sách gia phả...`, `Chưa có gia phả nào.`,
  `Tạo gia phả đầu tiên` and
  `Tài khoản hiện tại chưa có quyền quản trị khu vực này.`.
- Added `docs/PLAN_A15A4_VIETNAMESE_HERITAGE_FAMILY_LIST_ADMIN_DASHBOARD_UI.md`.
- Added `scripts/check-a15a4-vietnamese-heritage-family-list-admin-dashboard-ui.cjs`
  and package command
  `check:a15a4:vietnamese-heritage-family-list-admin-dashboard-ui`.
- Boundary: UI-only, no migration/schema/seed/DB apply, no API/action/service
  runtime contract change, no auth/permission/RLS, no route creation, no
  dependency, no external website asset and no deploy/push.

## 2026-06-28 - A-15A3 - Vietnamese Heritage Public Tree View UI

- Marker: `A15A3_VIETNAMESE_HERITAGE_PUBLIC_TREE_VIEW_UI`.
- Polished the existing public `/tree` view as a warm Vietnamese heritage
  genealogy viewing experience while keeping the route public-read-only.
- Touched UI files: `components/layout/public-shell.tsx`,
  `components/public/public-tree-shell.tsx`,
  `components/tree/family-tree-viewer.tsx`,
  `components/tree/family-tree-toolbar.tsx`,
  `components/tree/family-tree-empty-state.tsx` and
  `components/tree/family-tree-error-state.tsx`.
- Public tree now has a stronger family banner, warm paper/parchment surface,
  compact public stats, and a larger canvas area for the phả đồ.
- Public shell menu now uses the simpler `Trang chủ` / `Phả đồ` wording and a
  quieter `Quản trị gia phả` affordance without adding routes.
- Viewer toolbar keeps the existing search, zoom, fit and reset actions while
  using clearer Vietnamese guidance and touch-friendly controls.
- Public empty/error/private states now include `Đang tải phả đồ`,
  `Gia phả này chưa có thành viên`, `Gia phả này đang được giới hạn quyền xem`
  and `Không thể tải phả đồ. Vui lòng thử lại sau.`.
- Added `docs/PLAN_A15A3_VIETNAMESE_HERITAGE_PUBLIC_TREE_VIEW_UI.md`.
- Added `scripts/check-a15a3-vietnamese-heritage-public-tree-view-ui.cjs` and
  package command `check:a15a3:vietnamese-heritage-public-tree-view-ui`.
- Boundary: UI-only, public tree only, no migration/schema/seed/DB apply, no
  API/action/service runtime contract change, no auth/permission/RLS, no route
  creation, no dependency, no external website asset and no deploy/push.

## 2026-06-28 - A-15A2 - Modern Vietnamese Genealogy Tree Editor UI

- Marker: `A15A2_MODERN_VIETNAMESE_TREE_EDITOR_UI`.
- Polished the existing admin tree viewer/editor UI without changing route,
  data, permission, auth or service contracts.
- Touched UI files: `app/(admin)/admin/tree/page.tsx`,
  `app/(admin)/admin/tree/edit/page.tsx`,
  `components/tree/family-tree-editor.tsx`,
  `components/tree/tree-editor-toolbar.tsx`,
  `components/tree/tree-editor-side-panel.tsx`,
  `components/tree/family-node-card.tsx`,
  `components/tree/family-tree-empty-state.tsx` and
  `components/tree/family-tree-error-state.tsx`.
- Editor canvas now occupies more of the viewport and uses a cleaner
  professional tool background.
- Toolbar now has compact Vietnamese controls: `Căn giữa`, `Phóng to`,
  `Thu nhỏ`, `Sắp xếp lại`, `Lưu bố cục`, `Khôi phục tự động`.
- Node cards are smaller; selected node is visually stronger; related/family
  node treatment is distinct and lighter.
- Side panel is grouped into `Thông tin cơ bản`, `Quan hệ gia đình`,
  `Ghi chú`, `Quyền riêng tư` and `Thêm người thân`.
- Empty state now guides admin users toward `Thêm người đầu tiên` and
  `Thêm quan hệ gia đình`.
- Added `docs/PLAN_A15A2_MODERN_VIETNAMESE_GENEALOGY_TREE_EDITOR_UI.md`.
- Added `scripts/check-a15a2-modern-vietnamese-genealogy-tree-editor-ui.cjs`
  and package command
  `check:a15a2:modern-vietnamese-genealogy-tree-editor-ui`.
- Boundary: UI-only, no migration/schema/seed/DB apply, no API/action/service
  runtime contract change, no auth/permission/RLS, no route creation, no
  dependency, no external website asset and no deploy/push.

## 2026-06-28 - A-15A2 - Vietnamese Traditional Genealogy UI Reference Polish

- Applied Vietnamese traditional genealogy UI polish to existing public/admin/
  tree surfaces while keeping data, auth, permission and runtime boundaries
  closed.
- Touched UI files: `components/layout/public-shell.tsx`,
  `components/public/public-home.tsx`,
  `components/public/public-tree-shell.tsx`,
  `components/tree/family-node-card.tsx`,
  `components/tree/family-tree-toolbar.tsx`,
  `components/tree/family-tree-viewer.tsx`,
  `components/tree/family-tree-editor.tsx`,
  `components/tree/tree-editor-toolbar.tsx`,
  `components/layout/admin-shell.tsx`,
  `app/(admin)/admin/page.tsx`,
  `app/(admin)/admin/genealogy/page.tsx`,
  `components/genealogy/lineage-admin.tsx`,
  `components/people/person-list.tsx` and
  `components/ui/section-card.tsx`.
- Public UI now uses warmer paper/amber/cream surfaces, a public banner,
  lineage wording, and the primary CTA `Xem phả đồ`.
- Tree UI gives the canvas more height, uses warmer toolbar/canvas colors, and
  makes person nodes more compact with a text-avatar placeholder.
- Admin sidebar is grouped as `Dòng họ`, `Phả đồ`, `Website`, `Quản trị`.
- Admin dashboard and genealogy cards include clearer card-style actions:
  `Xem phả đồ` and `Danh sách thành viên`.
- Added `docs/PLAN_A15A2_VIETNAMESE_TRADITIONAL_GENEALOGY_UI.md`.
- Added `scripts/check-a15a2-vietnamese-traditional-genealogy-ui.cjs` and
  package command `check:a15a2:vietnamese-traditional-genealogy-ui`.
- Boundary: UI/UX only, no migration/schema/DB apply, no API/action/service
  logic, no auth/permission/RLS, no new route, no Worker/OpenNext/Wrangler
  change, no dependency, no external website asset, no deploy and no push.
- `PLANNING.MD` was not read or committed.

## 2026-06-27 - A-15A1 - Public Home Modern Heritage UI

- Applied Gemini Modern Heritage / Di sản Hiện đại polish to Public Home only.
- Touched UI files: `components/public/public-home.tsx` and
  `components/layout/public-shell.tsx`.
- Home route `app/(public)/page.tsx` was inspected but not changed; existing
  stats query and props contract remain unchanged.
- Public Home now uses warm paper `bg-stone-50`, `text-stone-900`,
  `text-stone-600`, teal primary CTA `bg-teal-700 hover:bg-teal-800`, amber
  accents `bg-amber-50 text-amber-800`, rounded-xl/rounded-2xl cards,
  rounded-full CTAs, `shadow-sm`/`shadow-md` and `min-h-11` touch targets.
- Vietnamese copy was polished toward a warmer family-memory tone:
  `Lưu giữ ký ức, kết nối các thế hệ.` and
  `Cội nguồn yêu thương của dòng họ...`.
- Added `docs/PLAN_A15A1_PUBLIC_HOME_MODERN_HERITAGE_UI.md`.
- Added `scripts/check-a15a1-public-home-modern-heritage-ui.cjs` and package
  command `check:a15a1-public-home-modern-heritage-ui`.
- Validation PASS: A-15A1, A-15A0, A-14G, A-14F, A-14E, A-14D, A-14C,
  A-14B, A-14A, UI polish, Vietnamese UI copy, Vietnamese cultural UI/UX,
  env safe, migrations, typecheck, lint, root build and diff checks.
- Browser smoke PASS on local `http://localhost:3100/`: desktop and mobile
  viewport checks showed the expected Public Home H1/copy/CTA and no horizontal
  overflow.
- Root `npm run build` passed directly; no clean temp-copy workaround was
  required.
- Boundary: Public Home only, UI-only, no admin/tree/form UI, no DB/schema/
  migration, no `.sql`, no DB apply/check SQL, no API/action/service logic, no
  auth/permission/route change, no runtime merge/dedupe, no Worker/OpenNext/
  Wrangler change, no dependency, no deploy and no push.
- `PLANNING.MD` was not read or committed.

## 2026-06-27 - A-15A0 - Gemini Modern Heritage UI/UX Design Spec

- Added `docs/PLAN_A15A0_GEMINI_MODERN_HERITAGE_UI_UX_DESIGN_SPEC.md`.
- Copied the owner-provided Gemini UI/UX design output into the docs tree as
  the accepted `Modern Heritage / Di sản Hiện đại` design reference for later
  UI-only implementation phases.
- Added A-15A0 status metadata:
  `DESIGN_SPEC_ACCEPTED_FOR_UI_ONLY_IMPLEMENTATION`, source, scope and
  deferred implementation boundary.
- Added an implementation boundary note for ideas that require interaction
  logic review before implementation: slide-over selected person panel, bottom
  navigation, fixed mobile form action bar, drawer/bottom sheet animation,
  pinch zoom gesture, new avatar/media behavior, new menu state and new
  mutation path.
- Added `scripts/check-a15a0-gemini-modern-heritage-design-spec.cjs` and
  `npm run check:a15a0-gemini-modern-heritage-design-spec`.
- Validation PASS: A-15A0 checker, A-14G, A-14F, A-14E, A-14D, A-14C,
  A-14B, A-14A, env safe, migrations, typecheck, lint, root build and diff
  checks.
- Root `npm run build` passed directly; no clean temp-copy workaround was
  required.
- Boundary: docs-only; no UI component/runtime JSX/class changes, no DB/API/
  auth/permission/route/runtime changes, no migration, no `.sql`, no Worker/
  OpenNext/Wrangler change, no dependency, no deploy and no push.
- `PLANNING.MD` was not read or committed.

## 2026-06-27 - A-14G-R1 - Public Browser Visual Smoke Retry

- Reran A-14G public browser visual smoke gate.
- Base URL source: none. `PUBLIC_VISUAL_SMOKE_BASE_URL`,
  `LOCAL_SMOKE_BASE_URL` and `PROD_SMOKE_BASE_URL` were all absent in the
  Codex execution process.
- Result remained `SAFE_SKIP_MISSING_PUBLIC_BASE_URL`.
- Public home `/`, public tree `/tree`, public not-found/private/error state
  and mobile viewport smoke were not opened in a browser.
- Public person profile smoke also remained
  `SAFE_SKIP_MISSING_PUBLIC_SAFE_PERSON_SLUG` because
  `PUBLIC_VISUAL_SMOKE_PERSON_SLUG` was absent and no DB query was allowed to
  discover a slug.
- No browser opened, no screenshot captured, no screenshot committed and no
  token/cookie/session/storage-state artifact was read, printed, saved or
  committed.
- Validation PASS: A-14G, A-14F, A-14E, A-14D, A-14C, A-14B, A-14A, A-14, UI
  polish, Vietnamese UI copy, Vietnamese cultural UI/UX, tree relationship
  picker, inline create, duplicate suggestion, tree polish/dedupe/data-quality,
  A-10/A-11/A-12 merge/dedupe guards, env safe, migrations, typecheck, lint,
  root build and diff checks.
- A-09 authenticated browser smoke returned the expected missing-explicit-auth
  safe-skip.
- `check:merge-dedupe-backup-gate-readiness` is `NOT_AVAILABLE` in this
  checkout; A-13B backup gate remains blocked and was not recreated by
  A-14G-R1.
- Root `npm run build` passed directly; no clean temp-copy workaround was
  required.
- Boundary: public-only/read-only retry, no admin/auth route smoke, no mutation,
  no DB apply, no check SQL run on DB, no migration, no `.sql`, no seed/backfill,
  no runtime merge/dedupe, no permission runtime registration, no Worker/OpenNext/
  Wrangler config change, no dependency, no deploy and no push.
- Backup gate remains `BLOCKED_PENDING_OWNER_BACKUP_GATE_CONFIRMATION`.
- `PLANNING.MD` was not read or committed.

## 2026-06-27 - A-14G - Public Browser Visual Smoke

- Added `docs/PLAN_A14G_PUBLIC_BROWSER_VISUAL_SMOKE.md`.
- Status: `SAFE_SKIP_MISSING_PUBLIC_BASE_URL` because none of
  `PUBLIC_VISUAL_SMOKE_BASE_URL`, `LOCAL_SMOKE_BASE_URL` and
  `PROD_SMOKE_BASE_URL` were set in the Codex execution context.
- Browser tooling: `playwright` MCP server is registered locally but no base
  URL was available; the run was therefore treated as
  `SAFE_SKIP_BROWSER_TOOL_UNAVAILABLE` rather than a fake visual PASS.
- `/people/<slug>` smoke also recorded
  `SAFE_SKIP_MISSING_PUBLIC_SAFE_PERSON_SLUG` because no
  `PUBLIC_VISUAL_SMOKE_PERSON_SLUG` env was provided and the phase must
  not query the database to discover a real slug.
- Mobile viewport smoke recorded
  `SAFE_SKIP_MOBILE_VIEWPORT_TOOLING_UNAVAILABLE` because resize without
  a base URL cannot reach a route.
- No screenshots were captured, no auth/session/token/cookie/storage-state
  artifact was produced or committed.
- No real visual PASS was claimed for any route. Public home `/`, public
  tree `/tree`, public person profile, public error/not-found/private
  state and mobile viewports all remained unverified at runtime; only
  static source-readiness inherited from A-14B/A-14D/A-14E/A-14F holds.
- Added `scripts/check-a14g-public-browser-visual-smoke.cjs` and package
  command `check:a14g-public-browser-visual-smoke`.
- Validation: A-14G, A-14F, A-14E, A-14D, A-14C, A-14B, A-14A, A-14, UI
  polish, Vietnamese UI copy, Vietnamese cultural UI/UX, tree
  relationship picker, inline create, duplicate suggestion, tree
  polish/dedupe/data-quality, A-10/A-11/A-12 merge/dedupe guards, env
  safe, migrations, typecheck, lint, root build and diff checks all PASS.
- `check:tree-editor-auth-browser-smoke` returned the expected
  missing-explicit-auth safe-skip.
- `check:merge-dedupe-backup-gate-readiness` is `NOT_AVAILABLE` in this
  checkout; do not infer backup readiness from A-14G.
- Root `npm run build` passed directly; no clean temp-copy workaround was
  required.
- Boundary confirmed: no migration, no `.sql`, no DB apply, no check SQL
  on DB, no seed/backfill, no data mutation, no runtime merge/dedupe, no
  route/action/service merge/dedupe, no permission runtime registration,
  no Worker/OpenNext/Wrangler config change, no dependency, no deploy,
  no push, no secret/session/token/cookie/storage-state committed.
- Backup gate remains `BLOCKED_PENDING_OWNER_BACKUP_GATE_CONFIRMATION`.
  DB merge/dedupe remains not applied. Runtime merge/dedupe remains
  closed. Permission runtime remains unregistered.
- `PLANNING.MD` was not read or committed.

## 2026-06-27 - A-14F - Browser Visual Smoke Readiness

- Added `docs/PLAN_A14F_BROWSER_VISUAL_SMOKE_READINESS.md`.
- Defined browser visual smoke scope for A-14A/B/C/D/E public, admin and
  mobile/tablet surfaces.
- Classified public routes as smokeable without auth when an explicit base URL
  exists, while public person profile still needs a known public-safe slug.
- Classified admin routes as requiring explicit owner/operator auth session/env
  and safe-skipping without that evidence.
- Documented safe dataset approval requirement for mutation-adjacent paths such
  as person form submit and Tree Editor related-member add submit.
- Documented browser environment requirements, viewports, screenshot guidance,
  no-secret/no-session-commit rules and visual pass/fail criteria.
- Added `scripts/check-a14f-browser-visual-smoke-readiness.cjs` and
  `npm run check:a14f-browser-visual-smoke-readiness`.
- Browser visual smoke itself was not run in this phase; readiness records
  `SAFE_SKIP_BROWSER_TOOL_UNAVAILABLE` when Browser tooling is unavailable and
  does not claim visual PASS.
- Validation PASS: A-14F, A-14E, A-14D, A-14C, A-14B, A-14A, A-14, UI polish,
  Vietnamese UI copy, Vietnamese cultural UI/UX, tree relationship picker,
  inline create, duplicate suggestion, tree polish/dedupe/data-quality,
  A-10/A-11/A-12 merge/dedupe guards, env safe, migrations, typecheck, lint,
  root build and diff checks.
- A-09 authenticated browser smoke returned the expected missing-explicit-auth
  safe-skip.
- `check:merge-dedupe-backup-gate-readiness` is `NOT_AVAILABLE` in this
  checkout; A-13B backup gate remains blocked and was not recreated by A-14F.
- Root `npm run build` passed directly; no clean temp-copy workaround was
  required.
- Boundary: no migration, no `.sql`, no DB apply, no check SQL run on DB, no
  seed/backfill, no data mutation, no runtime merge/dedupe, no
  route/action/service merge/dedupe, no permission runtime registration, no
  Worker/OpenNext/Wrangler config change, no dependency, no deploy and no push.
- Backup gate remains `BLOCKED_PENDING_OWNER_BACKUP_GATE_CONFIRMATION`.
- `PLANNING.MD` was not read or committed.

## 2026-06-27 - A-14E - Mobile UX Sweep

- Added `docs/PLAN_A14E_MOBILE_UX_SWEEP.md`.
- Polished public shell navigation for mobile with a two-column grid, full-width
  admin login action and safer brand wrapping.
- Polished public home/tree/profile spacing, long-text wrapping and mobile CTA
  layout while keeping public pages read-only.
- Polished admin shell/sidebar/header with bounded mobile navigation, larger
  admin nav touch targets and safer long account/role wrapping.
- Polished shared UI primitives (`ActionLink`, `PageHeader`, `SectionCard`,
  `EmptyState`) for mobile padding, one-column actions and long-title wrapping.
- Polished people mobile cards and person form actions/inputs for larger touch
  targets, text-base input sizing and safer action separation.
- Polished Tree Viewer and Tree Editor mobile behavior: toolbar controls use a
  mobile grid, canvas heights are viewport-aware, selected preview stays below
  the canvas on smaller screens and node cards cap width on mobile.
- Polished Tree Editor related-member add panel controls with mobile-friendly
  segmented controls, rounded inputs, larger text and full-width submit behavior
  on small screens.
- Added `scripts/check-a14e-mobile-ux-sweep.cjs` and
  `npm run check:a14e-mobile-ux-sweep`.
- Validation PASS: A-14E, A-14D, A-14C, A-14B, A-14A, A-14, UI polish,
  Vietnamese UI copy, Vietnamese cultural UI/UX, tree relationship picker,
  inline create, duplicate suggestion, tree polish/dedupe/data-quality,
  A-10/A-11/A-12 merge/dedupe guards, env safe, migrations, typecheck, lint,
  root build and diff checks.
- A-09 authenticated browser smoke returned the expected missing-explicit-auth
  safe-skip.
- `check:merge-dedupe-backup-gate-readiness` is `NOT_AVAILABLE` in this
  checkout; A-13B backup gate remains blocked and was not recreated by A-14E.
- Root `npm run build` passed directly; no clean temp-copy workaround was
  required.
- Boundary: no migration, no `.sql`, no DB apply, no check SQL run on DB, no
  seed/backfill, no runtime merge/dedupe, no route/action/service merge/dedupe,
  no permission runtime registration, no Worker/OpenNext/Wrangler config
  change, no dependency, no deploy and no push.
- Backup gate remains `BLOCKED_PENDING_OWNER_BACKUP_GATE_CONFIRMATION`.
- `PLANNING.MD` was not read or committed.

## 2026-06-27 - A-14D - Tree Viewer Interaction Polish

- Added `docs/PLAN_A14D_TREE_VIEWER_INTERACTION_UX.md`.
- Polished public/admin tree viewer toolbar with explicit `Vừa màn hình`,
  `Phóng to`, `Thu nhỏ` and `Đưa cây về giữa` controls.
- Added mini help for drag/pan, scroll zoom and selecting a person.
- Added read-only selected-person preview in tree viewer with public/admin CTA
  split: public profile route for public mode and admin profile route for admin
  mode.
- Polished node cards with warmer selected state, `Đang chọn` badge and
  keyboard focus ring.
- Polished admin Tree Editor toolbar with `Chế độ chỉnh sửa`, clear layout-only
  guidance and warm canvas/background styling.
- Polished public/admin tree empty and error states without exposing raw
  Supabase/SQL/policy details.
- Added `scripts/check-a14d-tree-viewer-interaction-ux.cjs` and
  `npm run check:a14d-tree-viewer-interaction-ux`.
- Validation PASS: A-14D, A-14C, A-14B, A-14A, A-14, UI polish, Vietnamese UI
  copy, Vietnamese cultural UI/UX, tree relationship picker, inline create,
  duplicate suggestion, tree polish/dedupe/data-quality, A-10/A-11/A-12
  merge/dedupe guards, env safe, migrations, typecheck, lint, root build and
  diff checks.
- A-09 authenticated browser smoke returned the expected missing-explicit-auth
  safe-skip. Browser visual smoke was not run because no Browser navigation
  tool was available in this Codex session.
- `check:merge-dedupe-backup-gate-readiness` is `NOT_AVAILABLE` in this
  checkout; A-13B backup gate remains blocked and was not recreated by A-14D.
- Root `npm run build` passed directly; no clean temp-copy workaround was
  required.
- Boundary: no migration, no `.sql`, no DB apply, no check SQL run on DB, no
  seed/backfill, no runtime merge/dedupe, no route/action/service merge/dedupe,
  no permission runtime registration, no Worker/OpenNext/Wrangler config
  change, no dependency, no deploy and no push.
- Backup gate remains `BLOCKED_PENDING_OWNER_BACKUP_GATE_CONFIRMATION`.
- `PLANNING.MD` was not read or committed.

## 2026-06-27 - A-14C - Admin Dashboard / Layout UX Polish

- Added `docs/PLAN_A14C_ADMIN_DASHBOARD_LAYOUT_UX.md`.
- Polished admin shell/sidebar into genealogy-oriented groups: Tổng quan,
  Thành viên / hồ sơ, Cây gia phả, Nhập / xuất dữ liệu and An toàn / hệ thống.
- Added short sidebar group/item descriptions so users can choose the next step
  without knowing route names.
- Reworked admin dashboard as a practical starting point with quick actions:
  Thêm thành viên, Mở Tree Editor, Xem cây công khai and Xuất dữ liệu.
- Added dashboard safety cards confirming public/admin separation,
  merge/dedupe closed status and backup gate evidence requirement.
- Polished shared admin primitives: rounded action links, section cards, empty
  states and status callouts with warm paper styling.
- Polished People admin filter/list: warmer filter panel, clearer generic error
  state, better empty state, warm desktop table/mobile cards and separated soft
  delete action.
- Polished person form inputs with rounded fields and deep-green focus state.
- Added `scripts/check-a14c-admin-dashboard-layout-ux.cjs` and
  `npm run check:a14c-admin-dashboard-layout-ux`.
- Validation PASS: A-14C, A-14B, A-14A, A-14, UI polish, Vietnamese UI copy,
  Vietnamese cultural UI/UX, tree relationship picker, inline create,
  duplicate suggestion, tree polish/dedupe/data-quality, A-10/A-11/A-12
  merge/dedupe guards, env safe, migrations, typecheck, lint, root build and
  diff checks.
- A-09 authenticated browser smoke returned the expected missing-explicit-auth
  safe-skip. Browser visual smoke was not run because no Browser navigation
  tool was available in this Codex session.
- `check:merge-dedupe-backup-gate-readiness` is `NOT_AVAILABLE` in this
  checkout; A-13B backup gate remains blocked and was not recreated by A-14C.
- Boundary: no migration, no `.sql`, no DB apply, no check SQL run on DB, no
  seed/backfill, no runtime merge/dedupe, no route/action/service merge/dedupe,
  no permission runtime registration, no Worker/OpenNext/Wrangler config
  change, no dependency, no deploy and no push.
- Backup gate remains `BLOCKED_PENDING_OWNER_BACKUP_GATE_CONFIRMATION`.
- `PLANNING.MD` was not read or committed.

## 2026-06-27 - A-14B - Public Tree / Home UX Classic Modern Polish

- Added `docs/PLAN_A14B_PUBLIC_TREE_HOME_UX.md`.
- Polished public shell with a warmer brand mark, subtitle and footer.
- Reworked public home hero around `Lưu giữ ký ức gia đình, kết nối các thế hệ`
  with clear public-tree/admin CTAs and family-archive stats.
- Added public benefit sections for lưu giữ dòng họ, xem cây trực quan, bảo vệ
  riêng tư and dữ liệu lâu dài.
- Improved public tree guidance: drag/pan, scroll zoom, search focus and
  read-only boundary are now explicit.
- Polished tree toolbar labels, titles, touch targets, warm canvas background
  and classic-modern node card styling.
- Split public/admin tree empty-state behavior so public viewers do not get
  pushed into admin actions.
- Polished public person profile into grouped public-safe fields with
  `Thông tin này đang được gia đình cập nhật` copy.
- Added `scripts/check-a14b-public-tree-home-ux.cjs` and
  `npm run check:a14b-public-tree-home-ux`.
- Validation PASS: A-14B, A-14A, A-14, UI polish, Vietnamese UI copy,
  Vietnamese cultural UI/UX, tree relationship picker, inline create,
  duplicate suggestion, tree polish/dedupe/data-quality, A-10/A-11/A-12
  merge/dedupe guards, env safe, migrations, typecheck, lint and root build.
- A-09 authenticated browser smoke returned the expected missing-explicit-auth
  safe-skip. Browser visual smoke was not run because no Browser navigation
  tool was available in this Codex session.
- `check:merge-dedupe-backup-gate-readiness` is `NOT_AVAILABLE` in this
  checkout; A-13B backup gate remains blocked and was not recreated by A-14B.
- Boundary: no migration, no `.sql`, no DB apply, no check SQL run on DB, no
  seed/backfill, no runtime merge/dedupe, no route/action/service merge/dedupe,
  no permission runtime registration, no Worker/OpenNext/Wrangler config
  change, no dependency, no deploy and no push.
- Backup gate remains `BLOCKED_PENDING_OWNER_BACKUP_GATE_CONFIRMATION`.
- `PLANNING.MD` was not read or committed.

## 2026-06-23 - A-14A - Related Member Add UX Overhaul

- Added `docs/PLAN_A14A_RELATED_MEMBER_ADD_UX.md` for the focused Tree Editor
  related-member add UX phase and classic modern genealogy style direction.
- Local branch status before continuing: `main...origin/main` ahead 0 / behind
  0. No push was attempted.
- Expanded `components/tree/tree-editor-side-panel.tsx` from a shortened create
  form into two modes: `Thêm nhanh` and `Nhập chi tiết hơn`.
- Quick mode keeps fast tree-building fields: full name, gender, birth/death
  year, short note, duplicate suggestion and primary `Thêm vào cây`.
- Detail mode adds only existing person fields: display name, is living,
  birth/death date, birth place, home town, branch name, generation number,
  visibility and admin-only private note.
- Updated `app/(admin)/admin/tree/edit/actions.ts` to pass those existing fields
  into `createPerson()` without schema change, migration or new service.
- Kept unsupported fields out of runtime: death place, aliases beyond
  `display_name`, sibling order, "other related person", sibling action and
  inline lineage membership assignment are documented as later schema/service
  candidates.
- Applied classic modern genealogy style through warm paper/stone palette in
  global CSS, admin/public shells and shared UI primitives.
- Added `scripts/check-a14a-related-member-add-ux.cjs` and
  `npm run check:a14a-related-member-add-ux`.
- Validation PASS: A-14A/A-14, UI polish, Vietnamese UI, Vietnamese cultural
  UI, Tree relationship picker, inline create, duplicate suggestion,
  polish/dedupe/data-quality, A-10/A-11/A-12 merge/dedupe, env safe,
  migrations, typecheck, lint, root build and diff checks. A-09 returned the
  expected missing-explicit-auth-session safe-skip.
- Boundary: no migration, no `.sql`, no DB apply, no check SQL run on DB, no
  seed/backfill, no runtime merge/dedupe, no route/action/service merge/dedupe,
  no permission runtime registration, no Worker/OpenNext/Wrangler config
  change, no dependency, no deploy and no push.
- Backup gate remains `BLOCKED_PENDING_OWNER_BACKUP_GATE_CONFIRMATION`.
- `PLANNING.MD` was not read or committed.

## 2026-06-23 - A-14 Bundle - UI/UX Overhaul

- Added `docs/PLAN_A14_UI_UX_OVERHAUL.md` for A-14A through A-14J:
  UI/UX audit, design direction, layout/navigation polish, Tree Editor UX,
  forms/tables/detail polish, Vietnamese copy/accessibility/safety, checker,
  docs/handoff and validation boundary.
- Polished admin navigation into grouped sidebar sections: daily work, tree
  surfaces and data safety. Routes were not changed and no feature was hidden.
- Improved shared UI primitives: page header typography, empty state spacing,
  public/admin shell labels and keyboard focus state.
- Improved People CRUD UX with filter guidance, mobile card fallback, clearer
  profile actions, form help text and safer privacy-note copy.
- Improved Relationship CRUD UX with clearer family/parent-child/couple
  distinctions, next-step empty state and warnings when no family unit exists.
- Improved Tree Editor UX with stronger layout-vs-relationship guidance,
  selected-person side-panel hints, warning before attaching an existing member
  and separate pending labels for attach-existing versus create-new.
- Improved import/login/revision/system UI copy: no raw login error message,
  friendlier import issue labels, shared `PageHeader`/`EmptyState`/`StatusCallout`
  on secondary admin pages.
- Added `scripts/check-a14-ui-ux-overhaul.cjs` and
  `npm run check:a14-ui-ux-overhaul`.
- Updated Tree/A-10/A-11/A-12 checker compatibility allowlists so A-14 UI files
  do not count as drift while SQL, migration, Worker/config/deploy and
  merge/dedupe runtime remain blocked.
- Boundary: no migration, no `.sql`, no DB apply, no check SQL run on DB, no
  seed/backfill, no runtime merge/dedupe, no route/action/service merge/dedupe,
  no permission runtime registration, no Worker/OpenNext/Wrangler config
  change, no dependency, no deploy and no push.
- Backup gate remains `BLOCKED_PENDING_OWNER_BACKUP_GATE_CONFIRMATION`; A-13
  DB merge/dedupe remains not applied and runtime remains closed.
- `PLANNING.MD` was not read or committed.

## 2026-06-22 - A-13 Merge/Dedupe DB Apply - BLOCKED

- Received `APPROVE_A12_MERGE_DEDUPE_DB_APPLY`.
- A-13A PASS: clean preflight, exact files, SHA256 and A-12 checker passed.
- A-13B result: `BLOCKED_MISSING_BACKUP_CONFIRMATION`.
- Missing non-secret confirmations: fresh snapshot timestamp/retention, tested
  restore path, rollback owner and exact target project/environment.
- Shell-only PG env and `psql` were absent; values were not read or printed and
  repo env files were not opened.
- A-13C migration apply: `SKIPPED_BACKUP_GATE`.
- A-13D nine-item check SQL: `SKIPPED_DB_NOT_APPLIED` for every item.
- No DB/API/network connection or SQL execution occurred.
- A-13E local validation PASS: A-10/A-11/A-12, migration/schema and related Tree
  checkers; typecheck; lint; workspace-root production build; diff checks.
- A-09 remained the expected missing-explicit-session safe-skip.
- Runtime merge/dedupe remains closed; permission runtime remains unregistered.
- Boundary: docs/checker compatibility only; no schema/data mutation,
  seed/backfill, route/action/service, Worker/config/dependency/deploy/push.
- `PLANNING.MD` was not read or committed.

## 2026-06-22 - Owner Review A-12 - APPROVED

- Reviewed migration, check SQL, static checker and owner apply/backup/rollback
  plan against A-10/A-11 requirements.
- Found two extra closing parentheses after composite FK clauses in the
  committed migration; retained the pre-existing correction and synchronized
  the A-11 draft.
- Updated migration fingerprint to
  `9645F8E69068C73332A9CCE74E91449E06271734083A1C419176CBBDCA1C75B9`.
- Tightened the A-12 checker to reject the invalid composite-FK closing pattern.
- Result: `APPROVED`. Owner may grant
  `APPROVE_A12_MERGE_DEDUPE_DB_APPLY` for a separate exact-file apply/read-only
  verification phase. Marker status is `NOT_GRANTED_BY_THIS_REVIEW`.
- DB remains not applied; check SQL was not run on DB; runtime remains closed.
- Validation PASS: A-10/A-11/A-12 checkers; migration order and related
  Vietnamese genealogy schema/migration gates; Tree duplicate and
  polish/dedupe/data-quality gates; typecheck; lint; workspace-root production
  build; diff and cached-diff checks.
- A-09 returned expected safe-skip
  `A09_AUTH_BROWSER_SMOKE_SKIPPED_MISSING_EXPLICIT_AUTH_SESSION`; this is not a
  review failure.
- Boundary: migration/check/docs/checker only; no seed/backfill, data mutation,
  permission runtime, route/action/service, Worker/config, dependency, deploy or
  push.
- `PLANNING.MD` was not read or committed.

## 2026-06-22 - A-12 Bundle - Merge/Dedupe Real Migration Candidate

- Received `APPROVE_A11_MERGE_DEDUPE_SCHEMA_CANDIDATE` for migration candidate,
  check SQL and apply-plan creation only.
- Used Supabase CLI 2.107.0 `migration new` to scaffold the migration, then
  canonicalized its filename to the repo's `YYYYMMDD_0000_` convention.
- Added `db/migrations/20260622_0009_merge_dedupe_schema_candidate.sql` with the
  exact reviewed A-11 schema body and A-12 no-apply markers.
- Added read-only catalog check `db/checks/check_merge_dedupe_schema.sql`.
- Added `docs/PLAN_A12_MERGE_DEDUPE_REAL_MIGRATION_APPLY_PLAN.md` with preflight,
  backup, exact apply/check commands, expected output and rollback/no-go plan.
- Added A-12 static checker/package command; it verifies schema parity,
  fingerprint, SQL safety, check coverage and closed runtime boundaries.
- Decision 165 requires `APPROVE_A12_MERGE_DEDUPE_DB_APPLY` before a separate DB
  apply phase. Runtime merge/dedupe remains closed.
- Validation PASS: A-10/A-11/A-12 checkers; migration order and related
  Vietnamese genealogy schema/migration gates; Tree duplicate and
  polish/dedupe/data-quality gates; typecheck; lint; workspace-root production
  build; diff and cached-diff checks.
- A-09 returned expected safe-skip
  `A09_AUTH_BROWSER_SMOKE_SKIPPED_MISSING_EXPLICIT_AUTH_SESSION`; this is not a
  bundle failure.
- Boundary: DB not applied; no check SQL run on DB, seed/backfill, data mutation,
  permission runtime, route/action/service, Worker/config, dependency, deploy or
  push.
- `PLANNING.MD` was not read or committed.

## 2026-06-22 - Owner Review A-11 - APPROVED

- Reviewed all six candidate tables for lifecycle, version/conflict/graph,
  impacts, audit and rollback coverage.
- Confirmed composite `(session_id, merge_id)` FKs for audit and rollback,
  fail-closed RLS, no policies/permissions, no DML/destructive/runtime SQL and
  no real migration.
- Tightened ready-state actor/time requirements, non-blank tokens/checksums/
  markers, graph evidence and audit reason constraints.
- Extended the checker to reject trigger runtime and guard the tightened
  constraints.
- Result: `APPROVED`. Owner may use
  `APPROVE_A11_MERGE_DEDUPE_SCHEMA_CANDIDATE` to open a separate real-migration/
  check-SQL/apply-plan phase. Marker status is `NOT_GRANTED_BY_THIS_REVIEW`.
- Runtime merge/dedupe remains closed; DB remains not applied.
- Validation PASS: A-10/A-11 checkers; migration order and related Vietnamese
  genealogy schema/migration gates; Tree duplicate and polish/dedupe/data-quality
  gates; typecheck; lint; workspace-root production build; diff checks.
- A-09 returned expected safe-skip
  `A09_AUTH_BROWSER_SMOKE_SKIPPED_MISSING_EXPLICIT_AUTH_SESSION`; this is not a
  review failure.
- Boundary: docs/checker/SQL draft only; no real migration, DB apply,
  seed/backfill, route/action/service, auth/permission runtime, Worker/config,
  dependency, deploy or push.
- `PLANNING.MD` was not read or committed.

## 2026-06-22 - A-11 Bundle - Merge/Dedupe Schema Candidate Readiness

- Received owner marker `APPROVE_A10_MERGE_DEDUPE_RUNTIME_DESIGN` for A-11
  schema candidate only.
- Added `docs/PLAN_A11_MERGE_DEDUPE_SCHEMA_CANDIDATE_READINESS.md`.
- Added non-applied SQL draft
  `scripts/merge-dedupe-schema-candidate.sql.draft` outside `db/migrations`.
- Candidate covers pairs, sessions, field decisions, typed relationship/layout/
  lineage/privacy/export impacts, audit events and rollback manifests.
- Added `scripts/check-merge-dedupe-schema-candidate-readiness.cjs` and package
  command to guard schema coverage, static SQL safety and closed runtime.
- Decision 163 keeps A-11 candidate-only. Real migration file requires
  `APPROVE_A11_MERGE_DEDUPE_SCHEMA`; DB apply and runtime require later gates.
- Validation PASS: A-10 and A-11 checkers; migration order, Vietnamese
  genealogy schema candidate/first-migration-scope/real-migration-file gates;
  Tree duplicate, polish/dedupe/data-quality checkers; typecheck; lint;
  workspace-root production build; diff and cached-diff checks.
- A-09 returned expected safe-skip
  `A09_AUTH_BROWSER_SMOKE_SKIPPED_MISSING_EXPLICIT_AUTH_SESSION`; it is not
  counted as a failure.
- Boundary: no DB apply, seed/backfill, real migration, runtime merge/dedupe,
  route/action/service, person/relationship deletion, auth/permission runtime,
  Worker/config, dependency, deploy or push.
- `PLANNING.MD` was not read or committed.

## 2026-06-22 - Owner Review A-10 - APPROVED

- Reviewed the A-10 design and checker against candidate, transaction, audit,
  rollback, permission/approval and Vietnamese future UI acceptance criteria.
- Result: `APPROVED`; no design blocker remains before an explicit owner marker.
- Strengthened the A-10 checker to require strong/medium/weak advisory behavior,
  same-name create continuity, all-or-nothing/version/conflict/graph guards,
  complete audit actors/timestamps/impact and rollback restoration coverage.
- Owner may use `APPROVE_A10_MERGE_DEDUPE_RUNTIME_DESIGN` to open A-11 schema
  candidate. Marker status remains `NOT_GRANTED_BY_THIS_REVIEW`.
- Decision 162 separates design review approval from the explicit owner action.
- Validation PASS: A-10 checker; Tree viewer/editor, relationship picker,
  inline-create, duplicate suggestion, Tree polish/dedupe/data-quality, inline
  warning and media/data-quality readiness checkers; typecheck; lint;
  workspace-root production build; `git diff --check`; cached diff check.
- A-09 authenticated browser checker remains the expected safe-skip:
  `A09_AUTH_BROWSER_SMOKE_SKIPPED_MISSING_EXPLICIT_AUTH_SESSION`.
- Boundary: review/docs/checker only; no migration, `.sql`, DB apply,
  seed/backfill, schema change, runtime merge/dedupe, route/action/service,
  person/relationship delete, auth/permission runtime change, Worker/config,
  dependency, deploy or push.
- `PLANNING.MD` was not read or committed.

## 2026-06-22 - Plan A-10 - Merge/Dedupe Transaction & Audit Design

- Added `docs/PLAN_A10_MERGE_DEDUPE_TRANSACTION_AUDIT_DESIGN.md`.
- Added `scripts/check-merge-dedupe-transaction-audit-design.cjs` and
  `npm run check:merge-dedupe-transaction-audit-design`.
- Defined strong/medium/weak candidate confidence as advisory only; same-name
  people remain allowed and candidate detection does not block creation.
- Defined source/target, per-field conflict resolution, relationship and layout
  impact, lineage membership, revision and stable export identity contracts.
- Defined all-or-nothing transaction, idempotent `merge_id`, immutable audit
  fields and pre-merge rollback snapshot/manifest requirements.
- Proposed future permission keys and sequential owner markers without
  registering any runtime permission.
- Defined Vietnamese future UI steps for candidate list, comparison, conflict
  selection, affected relationships, approval, execution, audit and rollback.
- Decision 161 keeps runtime closed until explicit approval, audit, rollback and
  schema gates are approved.
- Updated the required historical checker allowlists only for the A-10 doc and
  checker artifacts so cross-phase validation remains strict and compatible.
- Validation PASS: A-10 checker; all requested Tree Editor, Vietnamese UI,
  monitoring, authenticated-smoke-result, deploy-readiness, inline warning,
  small JSON export, export/import readiness, env safety and migration checkers;
  typecheck; lint; workspace-root production build; `git diff --check`.
- A-09 remains the expected safe-skip:
  `A09_AUTH_BROWSER_SMOKE_SKIPPED_MISSING_EXPLICIT_AUTH_SESSION`.
- Boundary: docs/checker/readiness only; no migration, `.sql`, DB apply,
  seed/backfill, schema change, runtime merge/dedupe, person/relationship
  delete, auth/permission runtime change, route/action/service, Worker,
  OpenNext/Wrangler config, dependency, deploy or push.
- `PLANNING.MD` was not read or committed.

## 2026-06-22 - Plan A-09 - Authenticated Tree Editor Browser Smoke

- Added `docs/PLAN_A09_AUTHENTICATED_TREE_EDITOR_BROWSER_SMOKE.md`.
- Added `scripts/check-tree-editor-auth-browser-smoke.cjs` and
  `npm run check:tree-editor-auth-browser-smoke`.
- Git sync gate PASS before work: local `main` and `origin/main` synchronized;
  worktree clean.
- Explicit A-09 auth/browser env presence check found all gates absent:
  `GIA_PHA_AUTH_BROWSER_SMOKE`, `GIA_PHA_SMOKE_BASE_URL` and
  `GIA_PHA_AUTH_STORAGE_STATE_PATH`.
- Smoke result:
  `A09_AUTH_BROWSER_SMOKE_SKIPPED_MISSING_EXPLICIT_AUTH_SESSION`.
- No authenticated browser PASS was claimed. No session file, token, cookie or
  credential value was read or printed.
- Existing-member mutation result:
  `A09_ATTACH_EXISTING_MUTATION_SKIPPED_MISSING_EXPLICIT_SAFE_DATASET`.
- Create-person mutation result:
  `A09_CREATE_PERSON_MUTATION_SKIPPED_MISSING_EXPLICIT_SAFE_DATASET`.
- Static Tree Editor source guards continue to verify Vietnamese toolbar,
  add-relative flow, loading/disabled submit guard, duplicate suggestion,
  read-only data quality guidance, internal UUID behavior and privacy markers.
- No runtime Tree Editor bug was established or fixed because authorized browser
  execution was unavailable.
- Boundary: no migration, no `.sql`, no DB apply, no seed/backfill, no schema
  change, no auth/permission change, no bypass, no mutation, no merge/dedupe,
  no person/relationship delete, no Worker/config/dependency/deploy/push.
- `PLANNING.MD` was not read or committed.

## 2026-06-22 - PLAN_A06_A07_A08_TREE_POLISH_DEDUPE_READINESS_DATA_QUALITY_WARNINGS

- Added
  `docs/PLAN_A06_A07_A08_TREE_POLISH_DEDUPE_READINESS_DATA_QUALITY_WARNINGS.md`.
- Added `scripts/check-tree-polish-dedupe-readiness-data-quality.cjs` and
  `npm run check:tree-polish-dedupe-readiness-data-quality`.
- Polished the Tree Editor as the primary/highest-value product surface:
  larger canvas, wider working area, selected-person visual state and clearer
  person/family cards.
- Replaced Tree Editor control copy with Vietnamese actions: `Vừa màn hình`,
  `Phóng to`, `Thu nhỏ`, `Sắp xếp lại cây`, `Lưu bố cục` and
  `Khôi phục bố cục tự động`.
- Added `Gợi ý hoàn thiện dữ liệu` for the selected person using only the
  already loaded graph. Suggestions include missing birth/death year, missing
  parents, no family relationships and clearly similar names.
- Warning UI explicitly states:
  `Đây chỉ là gợi ý kiểm tra, hệ thống không tự thay đổi dữ liệu.`
- Recorded A-07 merge/dedupe readiness. Runtime merge remains closed until a
  separate owner-approved phase defines permissions, preview, audit,
  transaction behavior, export/stable-ID compatibility and rollback.
- No auto merge, person deletion, relationship deletion or private/source-note
  overwrite was added.
- Existing auth/permission, person, relationship and layout action contracts
  remain unchanged.
- Validation PASS for all required static checkers, env safety, migration order,
  typecheck and lint.
- Workspace-root build hit the known Windows `.next` ACL `EPERM` before
  compile; clean temporary-copy production build PASS.
- Local `/admin/tree/edit` browser review reached the fail-closed permission
  state because the current session lacked `tree.view`; authenticated canvas
  visual smoke status:
  `TREE_POLISH_BROWSER_SMOKE_SKIPPED_NO_AUTHORIZED_SESSION`.
- Boundary: no migration, no `.sql`, no DB apply, no seed/backfill, no schema
  change, no auth/permission logic change, no runtime merge/dedupe mutation, no
  Worker, no OpenNext/Wrangler config change, no dependency, no deploy and no
  push.
- `PLANNING.MD` was not read or committed.

## 2026-06-22 - PLAN_A04_A05_TREE_EDITOR_SMOKE_AND_DUPLICATE_SUGGESTION

- Added `docs/PLAN_A04_A05_TREE_EDITOR_SMOKE_AND_DUPLICATE_SUGGESTION.md`.
- Added `scripts/check-tree-duplicate-suggestion-ux.cjs` and
  `npm run check:tree-duplicate-suggestion-ux`.
- A-04 authenticated/browser smoke was safe-skipped with
  `A04_AUTH_BROWSER_SMOKE_SKIPPED_MISSING_EXPLICIT_ENV` because no explicit
  browser/auth smoke environment was available in the Codex execution context.
- Static/source review found no true A-03 blocker before A-05: existing-member
  mode still uses existing relationship actions, new-member mode still uses
  `createPersonAndAttachFromTreeAction`, and UUIDs remain internal.
- Added A-05 duplicate suggestion UX to the Tree Editor quick-create form using
  only people already loaded in the admin tree graph.
- Matching is advisory and local: normalized Vietnamese names, optional
  birth/death year proximity, and at most five suggestions.
- Choosing `Dùng thành viên này để gắn quan hệ` switches to existing-member mode
  and submits the internal personId through the existing relationship action;
  no new person is created.
- Choosing `Vẫn tạo thành viên mới` keeps the existing quick-create behavior:
  create through `createPerson()` and attach through existing relationship
  services.
- Added success copy for the existing-member path and clarified new-member
  success copy.
- Boundary: no migration, no `.sql`, no DB apply, no seed/backfill, no schema
  change, no auth/permission logic change, no Worker created, no
  OpenNext/Wrangler config change, no runtime dependency added, no deploy and no
  push.
- `PLANNING.MD` was not read or committed.

## 2026-06-22 - Plan A-03 - Tree Inline Create Person UX

- Added `docs/PLAN_A03_TREE_INLINE_CREATE_PERSON_UX.md`.
- Added `scripts/check-tree-inline-create-person-ux.cjs` and
  `npm run check:tree-inline-create-person-ux`.
- Reviewed the existing create-person flow and reused `createPerson()` from
  `lib/family/people-service.ts`; no new schema, API route or permission key was
  added.
- Added `createPersonAndAttachFromTreeAction` in the existing Tree Editor action
  module. It creates the person through the people service, then attaches the
  relationship through existing relationship services.
- Updated the Tree Editor side panel so the operator can choose `Cha`, `Mẹ`,
  `Con` or `Vợ/chồng/bạn đời`, then either choose an existing member or create a
  new member inline.
- New-member form uses compact Vietnamese fields: `Họ và tên`, `Chọn giới
  tính`, `Năm sinh`, `Năm mất` and `Ghi chú ngắn`.
- UUIDs remain internal values; the side panel does not ask users to type or
  paste UUIDs.
- Existing auth and permission logic remains unchanged. `people.create` is still
  enforced by `createPerson()` and `relationships.create` by relationship
  services.
- Boundary: no migration, no `.sql`, no DB apply, no seed/backfill, no schema
  change, no auth/permission logic change, no Worker created, no
  OpenNext/Wrangler config change, no runtime dependency added, no deploy and no
  push.
- `PLANNING.MD` was not read or committed.

## 2026-06-21 - UI-UX-VN-02 - Vietnamese Cultural UI/UX Hardening

- Added `docs/UI_UX_VN_02_VIETNAMESE_CULTURAL_UI_UX_HARDENING.md`.
- Hardened `/admin/relationships` copy so operators are guided to choose
  members by Vietnamese name labels instead of typing/copying UUIDs.
- Updated relationship creation forms to render member selectors for
  parent/child and couple workflows while keeping internal submitted values as
  existing IDs.
- Updated `/admin/people/[id]` relationship forms to pass the existing
  permission-checked member list into the relationship selectors.
- Existing relationship actions, validation, service contracts, route
  structure, auth and permission logic remain unchanged.
- Added `scripts/check-vietnamese-cultural-ui-ux.cjs` and
  `npm run check:vietnamese-cultural-ui-ux`.
- Boundary: no migration, no `.sql`, no DB apply, no SQL/data mutation, no
  seed/backfill, no schema change, no auth/permission logic change, no Worker
  created, no OpenNext/Wrangler config change, no runtime dependency added, no
  deploy and no push.
- `PLANNING.MD` was not read or committed.

## 2026-06-21 - Plan A-01 - Tree Relationship Picker UX

- Replaced the Tree Editor side-panel manual related-person UUID input with a
  Vietnamese searchable member picker built from the already loaded admin tree
  graph.
- Picker labels show member name plus supporting birth year, generation and
  branch information when available.
- Internal submitted field remains `related_person_id`; selected value remains
  the person UUID through `person.personId`.
- Existing server actions and relationship service remain unchanged:
  `addParentFromTreeAction`, `addSpouseFromTreeAction` and
  `addChildFromTreeAction`.
- Existing permission/auth logic remains unchanged; `/admin/tree/edit` still
  requires tree permissions and mutations still require `relationships.create`
  in the relationship service.
- Added `docs/PLAN_A01_TREE_RELATIONSHIP_PICKER_UX.md`.
- Added `scripts/check-tree-relationship-picker-ux.cjs` and
  `npm run check:tree-relationship-picker-ux`.
- Inline create-new-person from Tree Editor: DEFERRED.
- Broader `/admin/relationships` UUID form replacement: DEFERRED.
- Boundary: no migration, no `.sql`, no DB apply, no seed/backfill, no schema
  change, no auth/permission logic change, no Worker created, no
  OpenNext/Wrangler config change, no runtime dependency added, no deploy and
  no push.
- `PLANNING.MD` was not read or committed.

## 2026-06-19 - Phase 132 - Routine Production Monitoring Snapshot

- Added `docs/132_ROUTINE_PRODUCTION_MONITORING_SNAPSHOT.md`.
- Added `scripts/check-routine-production-monitoring-snapshot.cjs` and
  `npm run check:routine-production-monitoring-snapshot`.
- Confirmed local `main` and `origin/main` synchronized before monitoring;
  ahead/behind result `0 0`; worktree clean.
- Public production monitoring snapshot at `2026-06-19 17:58:02 +07:00` for
  `https://web-gia-pha.hungdiepcompany.workers.dev`.
- `/`, `/tree` and `/auth/login` returned HTTP 200.
- Expected Vietnamese public UI copy was present on all three checked routes.
- Obvious server error count was `0` on all three routes.
- Forbidden marker count was `0` on all three routes for `notes_private`,
  `source_note`, `admin-warning`, `service_role`, `sb_secret_`, `Bearer `,
  `signedUrl`, `signed_url`, `COOKIE` and `SESSION`.
- Current authenticated smoke status remains
  `PHASE_130_BLOCKED_MISSING_EXPLICIT_AUTHENTICATED_SMOKE_ENV`; public/static
  evidence was not promoted to authenticated PASS.
- Boundary: no authenticated smoke run, no credential requested, no secret
  printed or written, no deploy, no push, no migration, no `.sql`, no DB
  apply, no SQL/data mutation, no seed/backfill, no schema change, no
  auth/permission logic change, no export/import runtime expansion, no
  GEDCOM/ZIP/media/backup runtime, no Worker created, no OpenNext/Wrangler
  config change and no runtime dependency added.
- `PLANNING.MD` was not read or committed.

## 2026-06-19 - Phase 131 - Production Monitoring and Authenticated Smoke Preparation

- Added `docs/131_PRODUCTION_MONITORING_AND_AUTH_SMOKE_PREPARATION.md`.
- Confirmed Phase 130 authenticated smoke status remains
  `PHASE_130_BLOCKED_MISSING_EXPLICIT_AUTHENTICATED_SMOKE_ENV`.
- Public production monitoring was allowed only after sync/clean gate passed:
  local `main` and `origin/main` synchronized; worktree clean.
- Lightweight unauthenticated public monitoring PASS for `/`, `/tree` and
  `/auth/login`: HTTP 200, Vietnamese copy present, no obvious server error
  and no public privacy/runtime marker exposure found.
- Authenticated smoke was not run and public/static evidence was not promoted
  to authenticated PASS.
- Added shell-only preparation guidance, cleanup commands, no-go conditions,
  incident notes and rollback/escalation notes for a future Phase 130 retry.
- Added `scripts/check-production-monitoring-auth-smoke-prep.cjs` and
  `npm run check:production-monitoring-auth-smoke-prep`.
- Boundary: no authenticated smoke run, no credential requested, no secret
  printed or written, no deploy, no push, no migration, no `.sql`, no DB
  apply, no SQL/data mutation, no seed/backfill, no schema change, no
  auth/permission logic change, no export/import runtime expansion, no
  GEDCOM/ZIP/media/backup runtime, no Worker created, no OpenNext/Wrangler
  config change and no runtime dependency added.
- `PLANNING.MD` was not read or committed.

## 2026-06-19 - Phase 130 - Authenticated Production Smoke Execution

- Owner approved authenticated production smoke only when explicit shell-only
  smoke environment was already present.
- Git sync PASS: local `main` and `origin/main` synchronized; ahead/behind
  result `0 0`; worktree clean before Phase 130 changes.
- Checked presence by variable name and boolean only. `PROD_SMOKE_BASE_URL`,
  `PROD_AUTH_SMOKE_ENABLED`, `PROD_AUTH_SMOKE_USER_EMAIL` and
  `PROD_AUTH_SMOKE_SESSION` were all missing.
- Authenticated smoke stopped before network requests with status
  `PHASE_130_BLOCKED_MISSING_EXPLICIT_AUTHENTICATED_SMOKE_ENV`.
- Auth/session, role/permission, authenticated privacy, authenticated
  Vietnamese UI and live small JSON export smoke were NOT RUN.
- Static pre-smoke validation PASS, but it was not promoted to authenticated
  PASS.
- Workspace-root build failed before compile only on the known Windows `.next`
  ACL `EPERM`; clean temp build PASS.
- Added `docs/130_AUTHENTICATED_PRODUCTION_SMOKE_RESULT.md`.
- Added `scripts/check-authenticated-smoke-result.cjs` and
  `npm run check:authenticated-smoke-result`.
- Credential safety: no credential requested, read, printed or written; no
  authenticated response was fetched.
- Boundary: no authenticated network request, no deploy, no push, no
  migration, no `.sql`, no DB apply, no SQL mutation, no seed/backfill, no
  schema change, no auth/permission logic change, no export/import runtime
  expansion, no GEDCOM/ZIP/media/backup runtime, no Worker created, no
  OpenNext/Wrangler config change and no runtime dependency added.
- `PLANNING.MD` was not read or committed.

## 2026-06-19 - Phase 129 - Authenticated Production Smoke Readiness / Operator Runbook

- Added `docs/129_AUTHENTICATED_PRODUCTION_SMOKE_RUNBOOK.md`.
- Recorded current authenticated smoke status as
  `SAFE_SKIP_MISSING_EXPLICIT_AUTHENTICATED_SMOKE_ENV`.
- Added owner/operator prerequisites and a shell-only environment policy using
  placeholders only; no real session, cookie, token, email or credential value
  was requested or written.
- Added authenticated route checklist plus role/permission, privacy, small JSON
  export and Vietnamese UI smoke matrices.
- Added PASS/FAIL/SAFE_SKIP definitions, no-go conditions and sanitized
  incident/rollback escalation guidance.
- Added `scripts/check-authenticated-smoke-runbook.cjs` and
  `npm run check:authenticated-smoke-runbook`.
- Checker verifies runbook structure, safe-skip wording, production URL,
  credential safety, package dependency stability and no SQL/migration,
  Worker/service, workflow, OpenNext/Wrangler or `PLANNING.MD` drift.
- Phase 129 did not run authenticated production smoke because explicit
  shell-only smoke material was unavailable.
- Boundary: no credential requested, no secret written, no test account, no
  deploy, no push, no migration, no `.sql`, no DB apply, no SQL mutation, no
  seed/backfill, no schema change, no auth/permission logic change, no
  export/import runtime expansion, no GEDCOM/ZIP/media/backup runtime, no
  Worker created, no OpenNext/Wrangler config change and no runtime dependency
  added.
- `PLANNING.MD` was not read or committed.

## 2026-06-19 - Phase 128 - Production Deploy And Smoke

- Owner approved manual production deploy check and post-deploy smoke.
- Confirmed local `main` and `origin/main` were synchronized at `692920a`;
  `git rev-list --left-right --count HEAD...origin/main` returned `0 0`.
- Confirmed worktree clean and Phase 127 status
  `READY_FOR_MANUAL_DEPLOY_CHECK`.
- Pre-deploy readiness, Vietnamese UI copy, small JSON export smoke/hardening,
  inline warning UI, export/import readiness, env safety, migration order,
  typecheck, lint and Git whitespace checks PASS.
- Workspace-root build failed before compile only on the known Windows `.next`
  ACL `EPERM`; clean temp build PASS.
- Triggered existing `.github/workflows/cloudflare-deploy.yml` manually on
  `main`; no workflow/config change.
- GitHub Actions run `27817582152` PASS, including Linux Next build and
  Cloudflare deploy.
- Deployed commit:
  `692920a5ba8779cde2d77bcf3fa8e5806cbc18aa`.
- Production Worker `web-gia-pha` Version ID:
  `4765471a-a05d-45e8-8db4-7ccb3795d002`.
- Production URL:
  `https://web-gia-pha.hungdiepcompany.workers.dev`.
- Lightweight production smoke PASS for `/`, `/tree` and `/auth/login`; public
  Vietnamese copy present, no obvious server error, no admin warning marker and
  no `notes_private` marker on public tree response.
- Authenticated smoke safe-skipped because no explicit authenticated-smoke
  environment was configured. No credential was requested, read, printed or
  written.
- Boundary: no migration, no `.sql`, no DB apply, no SQL mutation, no
  seed/backfill, no schema change, no permission/auth logic change, no new
  runtime feature, no export/import runtime expansion, no
  GEDCOM/ZIP/media/backup runtime, no Worker created, no OpenNext/Wrangler
  config change and no runtime dependency added.
- `PLANNING.MD` was not read or committed.

## 2026-06-19 - Phase 127 - Post Runtime/UI Deploy Readiness Gate

- Added `docs/127_POST_RUNTIME_UI_DEPLOY_READINESS_GATE.md` with status
  `READY_FOR_MANUAL_DEPLOY_CHECK`.
- Reviewed recent local work: Phase 125 small JSON export hardening, Phase 126
  small JSON export smoke/review and UI-VN-01 Vietnamese UI copy normalization.
- Added `scripts/check-post-runtime-ui-deploy-readiness.cjs` and
  `npm run check:post-runtime-ui-deploy-readiness`.
- Runtime/UI review: Phase 125 touched the existing small `family.json` export
  path; Phase 126 was static review only; UI-VN-01 was display-copy/message
  normalization only.
- Worker/runtime result: Main Worker touched YES by prior small JSON/UI changes;
  runtime dependency added NO; new Worker created NO; OpenNext/Wrangler config
  changed NO; Worker size risk LOW.
- Dependency/config drift result: no dependency drift, no Wrangler/OpenNext
  config drift and no deploy workflow mutation for Phase 127.
- Migration/SQL/DB result: no migration, no `.sql`, no DB apply, no SQL
  mutation, no seed/backfill and no schema change.
- Privacy/security result: small JSON export remains guarded; non-admin builder
  behavior remains privacy-safe; UI copy did not expose private notes, source
  notes, tokens, keys or secrets.
- Deploy readiness status: `READY_FOR_MANUAL_DEPLOY_CHECK`, not deployed.
- Validation: post-runtime/UI deploy readiness PASS; Vietnamese UI copy PASS;
  small JSON export smoke PASS; small JSON export hardening PASS; inline admin
  warning UI PASS; export/import final readiness PASS; export/import static
  examples PASS; export/import boundary design PASS; env-safe PASS; migrations
  PASS; typecheck PASS; lint PASS; clean temp `npm run build` PASS.
- Workspace-root `npm run build` remains blocked before compile by the known
  Windows `.next` artifact ACL error:
  `EPERM: operation not permitted, unlink 'D:\CODE\GIA PHẢ\.next\build\56416d4ae4ce586f.js'`.
- Boundary result: no deploy, no push, no migration, no `.sql`, no DB apply, no
  SQL mutation, no seed/backfill, no schema change, no permission/auth logic
  change, no export/import runtime expansion, no GEDCOM/ZIP/media/backup
  runtime, no Worker created, no OpenNext/Wrangler config change and no runtime
  dependency added.
- `PLANNING.MD` was not read or committed.

## 2026-06-19 - UI-VN-01 - Vietnamese UI Copy Normalization

- Normalized user-visible UI copy to Vietnamese with diacritics across admin
  navigation/dashboard, people, relationships, tree viewer/editor,
  import/export preview, public pages, revisions, system status, backup
  dry-run and related service/validation messages.
- Kept code/internal values unchanged: route paths, component/function names,
  DB table/column names, permission keys, enum values, JSON keys, package/env
  names and migration/SQL contracts were not renamed.
- Normalized textfield labels/placeholders where they were user-visible; kept
  technical examples such as UUID/JSON/ID/schema_version where they describe
  input contracts.
- Normalized combobox/dropdown display labels for visibility, relationship
  roles/types/statuses and tree-editor relationship inputs while preserving
  submitted values.
- Added `scripts/check-vietnamese-ui-copy.cjs` and
  `npm run check:vietnamese-ui-copy` to guard known English UI snippets,
  expected Vietnamese copy, dependency stability and no PLANNING/SQL/migration
  drift.
- Added `docs/UI_VN_01_VIETNAMESE_UI_COPY_NORMALIZATION.md` and indexed it in
  `docs/00_INDEX.md`.
- Boundary result: No migration, no `.sql` file, no DB apply, no SQL mutation,
  no seed/backfill, no schema change, no permission/auth logic change, no
  export/import runtime expansion, no Worker created, no OpenNext/Wrangler
  config change, no runtime dependency added, no deploy and no push.
- `PLANNING.MD` was not read or committed.

## 2026-06-19 - Phase 126 - Small JSON Export Smoke, Privacy Review, and Handoff Hardening

- Reviewed Phase 125 small `family.json` export hardening using local
  static/source smoke only; no live DB query or real export file generation.
- Confirmed metadata coverage in source: `schema_version`,
  `app_export_version`, `exported_at`, `export_scope`, `privacy_scope` and
  manifest lineage counts.
- Confirmed lineage sections remain limited to existing verified tables:
  `clans`, `clan_branches`, `generation_rules` and
  `person_branch_memberships`.
- Confirmed privacy hardening source behavior for future non-admin builder
  paths: people privacy sanitizer, visibility filtering, private/source note
  stripping, audit/delete actor clearing and non-admin tree layout omission.
- Added `scripts/check-small-json-export-smoke.cjs` and
  `npm run check:small-json-export-smoke`.
- Decision 148 records that Phase 126 is static smoke/review only and does not
  authorize more export runtime, DB, Worker, dependency, config, deploy or push
  work.
- Boundary result: No migration, no `.sql` file, No DB apply, No SQL mutation,
  no seed/backfill, no large JSON export runtime, no GEDCOM runtime, no ZIP
  runtime, no import parser runtime, no media export/import, no
  backup/restore runtime, no Worker created, no OpenNext/Wrangler config
  change, no runtime dependency added, no deploy and no push.
- Validation: small JSON export smoke PASS; small JSON export hardening PASS;
  export/import final readiness PASS; export/import static examples PASS;
  export/import boundary design PASS; inline admin warning UI PASS; Vietnamese
  genealogy manual SQL diagnostic, domain UI and domain readiness PASS;
  env-safe PASS; migrations PASS; typecheck PASS; lint PASS; clean temp
  `npm run build` PASS; Git whitespace checks PASS.
- Workspace-root `npm run build` remains blocked before compile by the
  pre-existing Windows `.next` artifact ACL error:
  `EPERM: operation not permitted, unlink 'D:\CODE\GIA PHẢ\.next\build\56416d4ae4ce586f.js'`.
  A clean temp copy excluding `.git`, `.next`, env files and `PLANNING.MD`
  built successfully.
- `PLANNING.MD` was not read or committed.

## 2026-06-19 - Phase 125 - Small Main-App JSON Export Hardening

- Implemented owner-approved small/main-app `family.json` hardening only.
- Reviewed existing export surface:
  `app/(admin)/admin/exports/download/json/route.ts`,
  `lib/family/json-exporter.ts`, `lib/family/export-collector.ts` and
  `lib/family/export-types.ts`.
- Added JSON metadata/scope fields: `app_export_version`, `export_scope` and
  `privacy_scope`; existing `schema_version`, `exported_at`, app metadata,
  manifest and checksum behavior remain.
- Added lineage sections to JSON export using only existing verified tables:
  `clans`, `clan_branches`, `generation_rules` and
  `person_branch_memberships`.
- Hardened non-admin JSON builder behavior for future `family`/`public` modes:
  people are sanitized through the existing privacy service, hidden rows are
  filtered, private/source notes are stripped, and non-admin tree layout export
  is omitted.
- Added `scripts/check-small-json-export-hardening.cjs` and
  `npm run check:small-json-export-hardening`.
- Decision 147 records that Phase 125 touches only the existing small JSON
  export path and does not authorize large JSON, GEDCOM/ZIP/media,
  backup/restore, Worker, dependency, config, deploy or DB mutation work.
- Boundary result: No migration, no `.sql` file, No DB apply, No SQL mutation,
  no seed/backfill, no large JSON export runtime, no GEDCOM heavy runtime, no
  ZIP runtime, no import parser runtime, no media export/import, no
  backup/restore runtime, no Worker created, no OpenNext/Wrangler config
  change, no runtime dependency added, no deploy and no push.
- Validation: small JSON export hardening PASS; export/import final readiness
  PASS; export/import static examples PASS; export/import boundary design PASS;
  inline admin warning UI PASS; Vietnamese genealogy manual SQL diagnostic,
  domain UI and domain readiness PASS; env-safe PASS; migrations PASS;
  typecheck PASS; lint PASS; clean temp `npm run build` PASS; Git whitespace
  checks PASS.
- Workspace-root `npm run build` remains blocked before compile by the
  pre-existing Windows `.next` artifact ACL error:
  `EPERM: operation not permitted, unlink 'D:\CODE\GIA PHẢ\.next\build\56416d4ae4ce586f.js'`.
  A clean temp copy excluding `.git`, `.next`, env files and `PLANNING.MD`
  built successfully.
- `PLANNING.MD` was not read or committed.

## 2026-06-19 - Phase 122C-124C Export/Import Final Readiness Matrix

- Added Phase 122C export compatibility matrix for `family.json`, GEDCOM, ZIP,
  media-later, core genealogy tables, lineage tables, tree layouts, revisions,
  future media, future warnings, public/family/admin scopes and living-person
  privacy handling.
- Added Phase 123C import compatibility matrix for current/older/future
  `family.json`, GEDCOM, ZIP, media-later, validation areas, conflict handling,
  preview expectations and restore/import apply gates.
- Added Phase 124C final readiness gate with docs/contracts/examples readiness,
  not-ready runtime items, decision matrix, required owner approvals, no-go
  runtime conditions, privacy/security notes and default recommendation.
- Added `scripts/check-export-import-final-readiness.cjs` and
  `npm run check:export-import-final-readiness`.
- Decision 146 records that the export/import/backup portability bundle is
  ready for owner decision only and remains design/static, not runtime,
  schema, service Worker, dependency, config, deploy or mutation approval.
- Boundary result: No migration, no `.sql` file, No DB apply, No SQL mutation,
  no seed/backfill, no large JSON/GEDCOM/ZIP runtime, no import parser runtime,
  no media export/import, no backup/restore runtime, no Worker created, no
  OpenNext/Wrangler config change, no runtime dependency added, no deploy and
  no push.
- Validation: export/import final readiness PASS; export/import static
  examples PASS; export/import boundary design PASS; inline admin warning UI
  PASS; media-quality final readiness, static examples, static contracts and
  boundary design PASS; Vietnamese genealogy manual SQL diagnostic, domain UI
  and domain readiness PASS; env-safe PASS; migrations PASS; typecheck PASS;
  lint PASS; clean temp `npm run build` PASS; Git whitespace checks PASS.
- Workspace-root `npm run build` remains blocked before compile by the
  pre-existing Windows `.next` artifact ACL error:
  `EPERM: operation not permitted, unlink 'D:\CODE\GIA PHẢ\.next\build\56416d4ae4ce586f.js'`.
  A clean temp copy excluding `.git`, `.next`, env files and `PLANNING.MD`
  built successfully.
- `PLANNING.MD` was not read or committed.

## 2026-06-19 - Phase 122B-124B Export/Import Static Examples And Test Contracts

- Added Phase 122B export static examples and acceptance checklists for
  `family.json`, privacy-safe export cases, GEDCOM mapping notes, ZIP manifest
  shape, unsafe export cases and future export-service/GEDCOM/ZIP gates.
- Added Phase 123B import static examples and acceptance checklists for valid
  and unsafe payload cases, preview result shape, apply gate, future
  import-service and large import gates.
- Added Phase 124B portability/backup test contract examples for stable IDs,
  reference resolution, backup manifest, restore dry-run report, compatibility
  examples, no-go conditions and future backup/import-service gates.
- Added `scripts/check-export-import-static-examples.cjs` and
  `npm run check:export-import-static-examples`.
- Decision 145 records that static examples are review evidence, not runtime
  fixtures or restore/import/export approval.
- Boundary result: No migration, no `.sql` file, No DB apply, No SQL mutation,
  no seed/backfill, no large JSON/GEDCOM/ZIP runtime, no import parser runtime,
  no media export/import, no backup/restore runtime, no Worker created, no
  OpenNext/Wrangler config change, no runtime dependency added, no deploy and
  no push.
- Validation: export/import static examples PASS; export/import boundary
  design PASS; inline admin warning UI PASS; media-quality final readiness,
  static examples, static contracts and boundary design PASS; Vietnamese
  genealogy manual SQL diagnostic, domain UI and domain readiness PASS;
  env-safe PASS; migrations PASS; typecheck PASS; lint PASS; clean temp
  `npm run build` PASS; Git whitespace checks PASS.
- Workspace-root `npm run build` remains blocked before compile by the
  pre-existing Windows `.next` artifact ACL error:
  `EPERM: operation not permitted, unlink 'D:\CODE\GIA PHẢ\.next\build\56416d4ae4ce586f.js'`.
  A clean temp copy excluding `.git`, `.next`, env files and `PLANNING.MD`
  built successfully.
- `PLANNING.MD` was not read or committed.

## 2026-06-19 - Phase 122A-124A Export/Import Boundary And Portability Contract

- Added Phase 122A export boundary design covering current export foundation,
  `family.json`, GEDCOM, ZIP, media-later scope, privacy rules, main Worker
  limits and future export-service approval gates.
- Added Phase 123A import boundary design covering current import preview
  foundation, import stages, validation groups, production mutation gate and
  future import-service approval gates.
- Added Phase 124A data portability and backup compatibility contract covering
  canonical `family.json`, stable IDs, schema versioning, compatibility,
  restore dry-run expectations, manifest expectations, lineage compatibility,
  media-later and warnings-later boundaries.
- Added `scripts/check-export-import-boundary-design.cjs` and
  `npm run check:export-import-boundary-design`.
- Decision 144 records that export/import portability work remains design-only
  until separately approved service/runtime phases.
- Boundary result: No migration, no `.sql` file, No DB apply, No SQL mutation,
  no seed/backfill, no large JSON/GEDCOM/ZIP runtime, no import parser runtime,
  no media export/import, no Worker created, no OpenNext/Wrangler config
  change, no runtime dependency added, no deploy and no push.
- Validation: export/import boundary design PASS; inline admin warning UI PASS;
  media-quality final readiness, static examples, static contracts and boundary
  design PASS; Vietnamese genealogy manual SQL diagnostic, domain UI and domain
  readiness PASS; env-safe PASS; migrations PASS; typecheck PASS; lint PASS;
  clean temp `npm run build` PASS; Git whitespace checks PASS.
- Workspace-root `npm run build` remains blocked before compile by the
  pre-existing Windows `.next` artifact ACL error:
  `EPERM: operation not permitted, unlink 'D:\CODE\GIA PHẢ\.next\build\56416d4ae4ce586f.js'`.
  A clean temp copy excluding `.git`, `.next`, env files and `PLANNING.MD`
  built successfully.
- `PLANNING.MD` was not read or committed.

## 2026-06-19 - Phase 121B Inline Warning UI Post-Integration Smoke

- Reviewed Phase 121A inline admin warning UI/copy/privacy/performance after
  commit `86d4ad6`.
- Browser smoke: `/admin/genealogy` with no effective permissions failed
  closed and did not render fake warning findings; `/tree` had no admin warning
  panel/copy and no browser console warning/error.
- Source audit confirmed warning UI remains limited to admin people,
  genealogy, memberships and tree-editor selected-node surfaces.
- Hardened `scripts/check-inline-admin-warning-ui.cjs` to scan public
  route/component files and reject admin warning imports/helpers plus
  persistent-warning references.
- Added `docs/121B_INLINE_WARNING_UI_POST_INTEGRATION_SMOKE.md` and updated
  index/handoff.
- Boundary result: No migration, no `.sql` file, No DB apply, No SQL mutation,
  no seed/backfill, no persistent warning table, no full-tree scan, no media
  upload/storage/processing, no large export/import/GEDCOM/ZIP, no Worker
  created, no OpenNext/Wrangler config change, no dependency added, no deploy
  and no push.
- Validation: inline admin warning UI PASS; media-quality final readiness,
  static examples, static contracts and boundary design PASS; Vietnamese
  genealogy manual SQL diagnostic, domain UI and domain readiness PASS;
  env-safe PASS; migrations PASS; typecheck PASS; lint PASS; clean temp
  `npm run build` PASS; Git whitespace checks PASS.
- Workspace-root `npm run build` remains blocked before compile by the
  pre-existing Windows `.next` artifact ACL error:
  `EPERM: operation not permitted, unlink 'D:\CODE\GIA PHẢ\.next\build\56416d4ae4ce586f.js'`.
  A clean temp copy excluding `.git`, `.next`, env files and `PLANNING.MD`
  built successfully.
- `PLANNING.MD` was not read or committed.

## 2026-06-19 - Phase 121A Lightweight Inline Admin Warning UI

- Implemented owner-approved Option D as lightweight deterministic inline
  warnings on admin person detail, genealogy dashboard, membership management
  and the selected tree-node side panel.
- Warning generation uses only person, lineage and tree-node data already
  loaded by each surface; no warning query, persistence or full-tree scan was
  added.
- Added reusable Vietnamese severity badge/list UI with `Thông tin`, `Cảnh báo`
  and `Cần xử lý`, actionable next-step copy, text severity signals and a safe
  empty state that does not imply full-tree coverage.
- Added `lib/family/inline-warning-rules.ts`,
  `lib/family/inline-warning-types.ts`,
  `components/genealogy/admin-warning-badge.tsx` and
  `components/genealogy/admin-warning-list.tsx`.
- Added `docs/121A_INLINE_ADMIN_WARNING_UI.md`,
  `scripts/check-inline-admin-warning-ui.cjs` and
  `npm run check:inline-admin-warning-ui`.
- Updated the Phase 118A-120D static checkers with an exact owner-marker-gated
  Phase 121A runtime whitelist.
- Boundary result: No migration, no `.sql` file, No DB apply, No SQL mutation,
  no seed/backfill, no persistent warning table, no full-tree scan, no media
  work, no Worker created, no OpenNext/Wrangler config change, no runtime
  dependency added, no deploy and no push.
- Validation: inline admin warning UI PASS; media-quality final readiness,
  static examples, static contracts and boundary design PASS; Vietnamese
  genealogy manual SQL diagnostic, domain UI and domain readiness PASS;
  env-safe PASS; migrations PASS; typecheck PASS; lint PASS; clean temp
  `npm run build` PASS; Git whitespace checks PASS.
- Workspace-root `npm run build` remains blocked before compile by the
  pre-existing Windows `.next` artifact ACL error:
  `EPERM: operation not permitted, unlink 'D:\CODE\GIA PHẢ\.next\build\56416d4ae4ce586f.js'`.
  A clean temp copy excluding `.git`, `.next`, env files and `PLANNING.MD`
  built successfully.
- `PLANNING.MD` was not read or committed.

## 2026-06-19 - Phase 118D-120D Vietnamese Genealogy Media/Data Quality Final Readiness

- Completed final docs-only readiness review after Phase 118C-120C commit `3bc3847`.
- Phase 118D result: media contracts/examples are review-ready, but media schema, storage provider, RLS/signed access, export/backup behavior and media-service contracts remain unapproved.
- Phase 119D result: inline checks were separated from persistent-warning and quality-service requirements; persistent lifecycle and heavy-scan service decisions remain unapproved.
- Phase 120D result: static copy and potential inline-hint UX were separated from persistent, import/export and service-generated warning UX.
- Decision matrix result: option A defer is the default; option D inline admin warning UI is conditionally ready only through a separate explicit owner-approved lightweight runtime phase.
- Added `docs/118D_120D_MEDIA_QUALITY_FINAL_READINESS_REVIEW.md`.
- Added `scripts/check-media-quality-final-readiness.cjs` and `npm run check:media-quality-final-readiness`.
- Boundary result: No migration, no `.sql` file, No DB apply, No SQL mutation, no seed/backfill, No media upload/storage bucket, no thumbnail/image processing, no persistent warning table, no full-tree runtime scan, no runtime warning UI, no large export/import/GEDCOM/ZIP, No Worker created, no OpenNext/Wrangler config change, no runtime dependency added, no deploy and no push.
- Validation: final readiness checker PASS, static examples/contracts/boundary checkers PASS, Phase 103-120D Vietnamese genealogy static checkers PASS, env-safe PASS, migrations PASS, typecheck PASS, lint PASS, clean temp `npm run build` PASS, `git diff --check` PASS and `git diff --cached --check` PASS.
- Workspace-root `npm run build` remains blocked before compile by the pre-existing Windows `.next` artifact ACL error: `EPERM: operation not permitted, unlink 'D:\CODE\GIA PHẢ\.next\build\56416d4ae4ce586f.js'`. A clean temp copy excluding `.next`, env files and `PLANNING.MD` built successfully.
- `.env.local`, `.dev.vars` and `PLANNING.MD` were not read; `PLANNING.MD` was not committed.

## 2026-06-19 - Phase 118C-120C Vietnamese Genealogy Media/Data Quality Acceptance Examples

- Implemented grouped Phase 118C, 119C and 120C as docs/static examples and acceptance checklists only after commit `7f794d7`.
- Phase 118C result: added illustrative media metadata, visibility, storage and unsafe-case examples plus future media migration, media-service Worker and export/backup acceptance checklists.
- Phase 119C result: added nine deterministic warning examples with severity, Vietnamese copy, admin-only detail, public behavior and resolution path plus quality-service acceptance criteria.
- Phase 120C result: added admin warning UX acceptance checklists for people, genealogy, tree editor, import preview and export readiness with Vietnamese copy, accessibility and privacy requirements.
- Added `scripts/check-media-quality-static-examples.cjs` and `npm run check:media-quality-static-examples`.
- Boundary result: No migration, no `.sql` file, No DB apply, No SQL mutation, no seed/backfill, No media upload/storage bucket, no thumbnail/image processing, no persistent warning table, no full-tree runtime scan, no runtime warning UI, no large export/import/GEDCOM/ZIP, No Worker created, no OpenNext/Wrangler config change, no runtime dependency added, no deploy and no push.
- Runtime result: main app runtime code was not changed; examples remain documentation-only and are not fixtures or runtime data.
- Validation: media/data-quality static examples checker PASS, static contracts checker PASS, boundary design checker PASS, Phase 103-120C Vietnamese genealogy static checkers PASS, env-safe PASS, migrations PASS, typecheck PASS, lint PASS, clean temp `npm run build` PASS, `git diff --check` PASS and `git diff --cached --check` PASS.
- Workspace-root `npm run build` remains blocked before compile by the pre-existing Windows `.next` artifact ACL error: `EPERM: operation not permitted, unlink 'D:\CODE\GIA PHẢ\.next\build\56416d4ae4ce586f.js'`. A clean temp copy excluding `.next`, env files and `PLANNING.MD` built successfully.
- `.env.local`, `.dev.vars` and `PLANNING.MD` were not read; `PLANNING.MD` was not committed.

## 2026-06-19 - Phase 118B-120B Vietnamese Genealogy Media/Data Quality Static Contracts

- Implemented grouped Phase 118B, 119B and 120B as docs/static contract and approval-gate work only after commit `a436cfa`.
- Phase 118B result: created media static contract and approval gate covering future person/family/clan/branch/memorial media concepts, storage contract fields, privacy, media-service boundary and approval gates before media migration or media-service Worker.
- Phase 119B result: created data-quality static contract and approval gate covering warning categories, severity, future warning shape, privacy, persistent warning migration gate and quality-service Worker gate.
- Phase 120B result: created admin warning UX static contract covering admin locations, Vietnamese labels, UX states, privacy-safe copy, accessibility rules and schema/service boundaries.
- Added `scripts/check-media-quality-static-contracts.cjs` and `npm run check:media-quality-static-contracts`.
- Approval gates added before future media migration, media-service Worker, persistent warning migration and quality-service Worker.
- Boundary result: No migration, no `.sql` file, No DB apply, No SQL mutation, no seed/backfill, No media upload/storage bucket, no thumbnail/image/video/file processing, no persistent warning table, no full-tree runtime scan, no large export/import/GEDCOM/ZIP, No Worker created, no OpenNext/Wrangler config change, no runtime dependency added, no deploy and no push.
- Runtime result: main app runtime code was not changed; this phase only changed docs, package script registration and a static checker.
- Validation: media/data-quality static contracts checker PASS, media/data-quality boundary checker PASS, Phase 103-120B Vietnamese genealogy static checkers PASS, env-safe PASS, migrations PASS, typecheck PASS, lint PASS, clean temp `npm run build` PASS, `git diff --check` PASS and `git diff --cached --check` PASS.
- Workspace-root `npm run build` remains blocked before compile by the pre-existing Windows `.next` artifact ACL error: `EPERM: operation not permitted, unlink 'D:\CODE\GIA PHẢ\.next\build\56416d4ae4ce586f.js'`. A clean temp copy excluding `.next`, env files and `PLANNING.MD` built successfully.
- `.env.local`, `.dev.vars` and `PLANNING.MD` were not read; `PLANNING.MD` was not committed.

## 2026-06-19 - Phase 118A-120A Vietnamese Genealogy Media/Data Quality Boundary Design

- Implemented grouped Phase 118A, 119A and 120A as docs/static planning only after Phase 117A commit `4a3f45038950f18d6e9bdf680d4c66de171b5e3e`.
- Phase 118A result: created media domain/storage boundary design for portraits, grave/tombstone photos, family documents/photos, branch/clan documents, event photos, metadata concepts, privacy and future storage/service gates.
- Phase 119A result: created data-quality boundary design for missing dates, impossible dates, duplicate suspicion, missing parent links, multiple primary memberships, branch/generation conflict, relationship inconsistency and visibility conflict warnings.
- Phase 120A result: created admin warning UX planning with Vietnamese severity labels, empty-state copy, suggested admin locations and privacy-safe warning behavior.
- Added `scripts/check-media-quality-boundary-design.cjs` and `npm run check:media-quality-boundary-design`.
- Boundary result: No migration, no `.sql` file, No DB apply, No SQL mutation, no seed/backfill, No media upload/storage bucket, no real image/video/file processing, no thumbnail generation, no large export/import/GEDCOM/ZIP, No Worker created, no OpenNext/Wrangler config change, no runtime dependency added, no deploy and no push.
- Runtime result: main app runtime code was not changed; this phase only changed docs, package script registration and a static checker.
- Validation: media/data-quality boundary checker PASS, Phase 103-120A Vietnamese genealogy static checkers PASS, env-safe PASS, migrations PASS, typecheck PASS, lint PASS, clean temp `npm run build` PASS, `git diff --check` PASS and `git diff --cached --check` PASS.
- Workspace-root `npm run build` remains blocked before compile by the pre-existing Windows `.next` artifact ACL error: `EPERM: operation not permitted, unlink 'D:\CODE\GIA PHẢ\.next\build\56416d4ae4ce586f.js'`. A clean temp copy excluding `.next`, env files and `PLANNING.MD` built successfully.
- `.env.local`, `.dev.vars` and `PLANNING.MD` were not read; `PLANNING.MD` was not committed.

## 2026-06-19 - Phase 117A Vietnamese Genealogy Admin UX Polish

- Implemented Phase 117A as a scoped polish pass after grouped Phase 114-117 commit `22aff0f28e3f361a13e79cca831dd7935eb7ac45`.
- UX polish result: admin genealogy dashboard/routes now use clearer Vietnamese labels and saved messages; empty states include next-step links.
- Validation/form result: lineage forms have clearer labels, placeholders, helper text, Vietnamese required-field validation, friendlier duplicate/foreign-key action errors and pending submit buttons that prevent double-submit.
- Person membership UX result: person detail lineage section now explains explicit lineage-table assignment and shows a prerequisite warning when no clan exists.
- Tree display result: admin tree card labels lineage data as `Dòng họ` and `Chi`, preferring lineage branch metadata when present without changing React Flow/ELK behavior.
- Public privacy behavior remains conservative: public routes still do not query lineage tables, sanitizer still clears lineage fields unless public-visible and not living, and private/family-only/source-note data is not exposed publicly.
- Added `docs/117A_VIETNAMESE_GENEALOGY_ADMIN_UX_POLISH.md` and updated `docs/00_INDEX.md`.
- Updated `scripts/check-vietnamese-genealogy-domain-ui.cjs` to cover Phase 117A doc/polish markers and public privacy guard continuity.
- Validation: Phase 103-117A Vietnamese genealogy static checkers PASS, env-safe PASS, migrations PASS, typecheck PASS, lint PASS, clean temp `npm run build` PASS, `git diff --check` PASS and `git diff --cached --check` PASS.
- Workspace-root `npm run build` remains blocked before compile by the pre-existing Windows `.next` artifact ACL error: `EPERM: operation not permitted, unlink 'D:\CODE\GIA PHẢ\.next\build\56416d4ae4ce586f.js'`. A clean temp copy excluding `.next`, env files and `PLANNING.MD` built successfully.
- No migration, no DB apply, no SQL mutation, no seed/backfill, no excluded runtime tables, no media/upload/storage, no large export/import/GEDCOM/ZIP, no Worker created, no OpenNext/Wrangler config change, no runtime dependency added, no deploy and no push.
- `.env.local`, `.dev.vars` and `PLANNING.MD` were not read; `PLANNING.MD` was not committed.

## 2026-06-19 - Phase 114-117 Vietnamese Genealogy Domain UI Integration

- Implemented grouped Phase 114-117 runtime/admin integration after Phase 113C recorded `PASS_MANUAL_SQL_DIAGNOSTIC`.
- Phase 114 service result: added server-only lineage types, validation and service layer for `clans`, `clan_branches`, `generation_rules` and `person_branch_memberships`.
- Phase 115 admin UI result: added `/admin/genealogy`, `/admin/genealogy/clans`, `/admin/genealogy/branches`, `/admin/genealogy/generation-rules` and `/admin/genealogy/memberships`.
- Phase 116 membership integration result: person detail pages now show branch membership and include an explicit assignment form when the user has an existing manage permission.
- Phase 117 privacy/tree/public result: admin tree can display lineage membership data; public sanitizer clears lineage fields unless future lineage data is public-visible and the person is not living. Public routes do not query lineage tables in this phase.
- Permissions used: read via `people.view` or `tree.view`; manage via `people.update`, `relationships.update`, `tree.edit_layout` or `settings.manage`.
- Added `scripts/check-vietnamese-genealogy-domain-ui.cjs` and `npm run check:vietnamese-genealogy-domain-ui`.
- Created `docs/114_117_VIETNAMESE_GENEALOGY_DOMAIN_UI_INTEGRATION.md` and updated `docs/00_INDEX.md`.
- Validation: Phase 103-117 Vietnamese genealogy static checkers PASS, env-safe PASS, migrations PASS, typecheck PASS, lint PASS, clean temp `npm run build` PASS, `git diff --check` PASS and `git diff --cached --check` PASS.
- Workspace-root `npm run build` was blocked before compile by a pre-existing Windows `.next` artifact ACL error: `EPERM: operation not permitted, unlink 'D:\CODE\GIA PHẢ\.next\build\56416d4ae4ce586f.js'`. A clean temp copy excluding `.next`, env files and `PLANNING.MD` built successfully.
- No migration created, no DB apply, no SQL mutation by Codex, no seed/backfill, no automatic backfill from `people.branch_name` or `people.generation_number`, no excluded tables used, no media/upload/storage, no large export/import/GEDCOM/ZIP, no Worker created, no OpenNext/Wrangler config change, no runtime dependency added, no deploy and no push.
- `.env.local`, `.dev.vars` and `PLANNING.MD` were not read; `PLANNING.MD` was not committed.

## 2026-06-19 - Phase 113C Vietnamese Genealogy Manual SQL Diagnostic PASS

- Recorded owner/operator-provided manual Supabase Dashboard SQL diagnostic result for project `frkyeuxrlcflmsxxsolp`.
- Final DB verification status recorded as `PASS_MANUAL_SQL_DIAGNOSTIC`.
- Verification source: owner/operator manual read-only SQL diagnostic in Supabase Dashboard SQL Editor.
- Required tables result: PASS for `clans`, `clan_branches`, `generation_rules` and `person_branch_memberships`.
- Excluded tables result: PASS; `person_names`, `person_life_events`, `person_burials` and `person_media` do not exist per owner/operator diagnostic.
- Existing core tables result: PASS for `people`, `families`, `family_parents`, `family_children` and `couple_relationships`.
- RLS result: PASS; owner/operator diagnostic confirmed RLS enabled on all four new lineage tables.
- Policies result: PASS; owner/operator diagnostic confirmed policies exist for all four new lineage tables.
- No seed/backfill result: PASS; owner/operator diagnostic confirmed zero rows in all four new lineage tables.
- Created `docs/113C_VIETNAMESE_GENEALOGY_MANUAL_SQL_DIAGNOSTIC_PASS.md`.
- Added `scripts/check-vietnamese-genealogy-manual-sql-diagnostic-pass.cjs` and `npm run check:vietnamese-genealogy-manual-sql-diagnostic-pass`.
- Security note remains active: previously exposed service role key material must be rotated or revoked before future credential-assisted verification. No key value was repeated or written to files.
- No DB apply, no migration rerun, no SQL execution by Codex, no SQL mutation, no seed/backfill, no migration file change, no new migration, no runtime app code change, no UI change, no deploy, no Worker created, no OpenNext/Wrangler config change, no runtime dependency added and no push.
- `.env.local`, `.dev.vars` and `PLANNING.MD` were not read; `PLANNING.MD` was not committed.
- Recommended next phase: grouped Phase 114-117 can start.

## 2026-06-19 - Phase 113B-fix Vietnamese Genealogy Verification Diagnostic

- Recorded Phase 113B-fix as diagnostic follow-up after owner-provided PowerShell verifier output returned `FAIL`, not PASS.
- DB verification status remains `NOT_VERIFIED`; PASS was not recorded.
- Required REST table checks failed for `clans`, `clan_branches`, `generation_rules` and `person_branch_memberships`.
- RLS, policies, no seed/backfill row counts and existing core table safety were not proven by the REST-only verifier output.
- Added `docs/113B_FIX_VIETNAMESE_GENEALOGY_VERIFICATION_DIAGNOSTIC.md` with diagnostic hypotheses, manual read-only Supabase Dashboard SQL checks and no-go conditions before Phase 114-117.
- Hardened `scripts/verify-vietnamese-genealogy-migration-post-apply.cjs` so it classifies table read failures, checks expected project ref and existing core table readability, and does not claim RLS/policy PASS from REST-only verification.
- Added `scripts/check-vietnamese-genealogy-verification-diagnostic.cjs` and `npm run check:vietnamese-genealogy-verification-diagnostic`.
- Security note: service role key material was exposed in chat by the owner/operator; the diagnostic records that the key must be rotated or revoked before further credential-assisted verification. The key value was not repeated or written to files.
- No DB apply, no migration rerun, no SQL mutation, no seed/backfill, no migration file modification, no new migration, no runtime app code change, no UI change, no deploy, no Worker created, no OpenNext/Wrangler config change, no runtime dependency added and no push.
- `PLANNING.MD` was not read and was not committed.
- Recommended next step: owner rotates/revokes the exposed key, then runs the manual read-only SQL diagnostic checklist in Supabase Dashboard for project `frkyeuxrlcflmsxxsolp` and provides sanitized results.

## 2026-06-18 - Phase 113B Vietnamese Genealogy Credential Verification

- Ran Phase 113B as credential-assisted read-only post-apply verification attempt.
- Explicit verification env was missing: `VIET_GENEALOGY_VERIFY_SUPABASE_URL`, `VIET_GENEALOGY_VERIFY_SUPABASE_SERVER_KEY` and `VIET_GENEALOGY_VERIFY_MODE=read_only`.
- Verifier result: `SKIPPED_MISSING_EXPLICIT_VERIFICATION_CREDENTIALS`.
- Final verification status recorded as `PASS_WITH_SAFE_SKIP`.
- Created `docs/113B_VIETNAMESE_GENEALOGY_CREDENTIAL_VERIFICATION.md`.
- Added checker `scripts/check-vietnamese-genealogy-credential-verification.cjs` and `npm run check:vietnamese-genealogy-credential-verification`.
- Required tables, RLS, policies, excluded scope, no seed/backfill and existing table safety were not independently DB-verified in this phase.
- Static source review remains unchanged: migration creates only `clans`, `clan_branches`, `generation_rules` and `person_branch_memberships`, enables RLS, uses existing permissions and includes no seed/backfill.
- No DB apply, no migration rerun, no SQL mutation, no seed/backfill, no migration file modification, no new migration, no deploy, no runtime app code change, no UI change, no Worker created, no OpenNext/Wrangler config change, no runtime dependency added and no push.
- `PLANNING.MD` remains untracked, was not read and was not committed.
- Validation: verifier PASS_WITH_SAFE_SKIP, Phase 113B checker PASS, Phase 103-113A checkers PASS, env-safe PASS, migrations PASS, typecheck PASS, lint PASS, `git diff --check` PASS and `git diff --cached --check` PASS.
- Recommended next phase: provide shell-only verification env and rerun credential-assisted verification before Phase 114-117.

## 2026-06-18 - Phase 113A Vietnamese Genealogy Manual Apply Verification

- Owner/operator confirmation received: `OWNER CONFIRMED MANUAL APPLY SUCCESS`.
- Manual apply method recorded: Supabase Dashboard SQL Editor.
- Target Supabase project ref recorded: `frkyeuxrlcflmsxxsolp`.
- Migration file recorded: `db/migrations/20260618_0008_vietnamese_genealogy_first_migration.sql`.
- Expected SHA256 and actual SHA256 matched: `522B11AF4D8BDA4F1E29AB63C49C9718129ADF1B27F3F2119BB40D9F7214EA5F`.
- Apply status recorded as `OWNER_CONFIRMED_APPLIED`.
- Created `docs/113A_VIETNAMESE_GENEALOGY_MANUAL_APPLY_VERIFICATION.md`.
- Added read-only verifier `scripts/verify-vietnamese-genealogy-migration-post-apply.cjs`.
- Added checker `scripts/check-vietnamese-genealogy-manual-apply-verification.cjs`.
- DB verification safe-skipped because explicit shell env was missing: `SKIPPED_MISSING_EXPLICIT_VERIFICATION_CREDENTIALS`.
- RLS/policy DB verification safe-skipped; static migration review remains unchanged.
- Excluded-scope DB verification safe-skipped; static source verification remains unchanged.
- No DB apply run by AI/local, no migration rerun, no SQL mutation executed by AI/local, no seed/backfill, no migration file modification, no new migration, no deploy, no runtime app code change, no UI change, no Worker created, no OpenNext/Wrangler config change, no runtime dependency added and no push.
- `PLANNING.MD` remains untracked, was not read and was not committed.
- Validation: Phase 103-113 checkers PASS, Phase 113A verifier PASS_WITH_SAFE_SKIP, Phase 113A checker PASS, env-safe PASS, migrations PASS, typecheck PASS, lint PASS, `git diff --check` PASS and `git diff --cached --check` PASS.
- Recommended next phase: Phase 113B Credential-Assisted Vietnamese Genealogy Read-Only DB Verification before Phase 114-117.

## 2026-06-18 - Phase 113 Vietnamese Genealogy Migration Apply Execution

- Owner approval received for DB apply of `db/migrations/20260618_0008_vietnamese_genealogy_first_migration.sql`.
- Target Supabase project ref recorded: `frkyeuxrlcflmsxxsolp`.
- DB backup/snapshot recorded as `DONE`.
- Expected SHA256 and actual SHA256 matched: `522B11AF4D8BDA4F1E29AB63C49C9718129ADF1B27F3F2119BB40D9F7214EA5F`.
- Local/static pre-apply validation passed.
- Local apply was not run because Supabase CLI was not available in PATH and no explicit DB apply/verification credentials were present in shell state.
- Phase 113 status recorded as `OWNER_ACTION_REQUIRED_MANUAL_DASHBOARD_APPLY`.
- Apply result: `OWNER_ACTION_REQUIRED`; DB verification result: `NOT_RUN_APPLY_NOT_CONFIRMED`.
- Created `docs/113_VIETNAMESE_GENEALOGY_MIGRATION_APPLY_EXECUTION.md`.
- Added `scripts/check-vietnamese-genealogy-migration-apply-execution.cjs` and `npm run check:vietnamese-genealogy-migration-apply-execution`.
- No migration file modification, no extra migration, no extra SQL executed, no seed data, no production data mutation, no backfill from `people.branch_name`, no backfill from `people.generation_number`, no deploy, no runtime app code change, no UI change, no Worker created, no OpenNext/Wrangler config change, no runtime dependency added and no push.
- `PLANNING.MD` remains untracked, was not read and was not committed.
- Validation: genealogy domain/schema/scope/real-migration/readiness/apply-execution checkers PASS, env-safe PASS, migrations PASS, typecheck PASS, lint PASS, `git diff --check` PASS and `git diff --cached --check` PASS.
- Recommended next phase before Phase 114 runtime planning: Phase 113A Owner Manual Apply Result Capture And Read-Only Verification.

## 2026-06-18 - Phase 112 Vietnamese Genealogy Migration Apply Readiness

- Created `docs/112_VIETNAMESE_GENEALOGY_MIGRATION_APPLY_READINESS.md`.
- Added `scripts/check-vietnamese-genealogy-migration-apply-readiness.cjs` and `npm run check:vietnamese-genealogy-migration-apply-readiness`.
- Reviewed migration file `db/migrations/20260618_0008_vietnamese_genealogy_first_migration.sql` without modifying it.
- Migration fingerprint recorded: SHA256 `522B11AF4D8BDA4F1E29AB63C49C9718129ADF1B27F3F2119BB40D9F7214EA5F`.
- Readiness result: `READY_FOR_PHASE_113_APPROVAL_REQUEST`.
- Apply status remains `NOT_APPLIED`.
- Phase 113 remains blocked until the owner explicitly approves DB apply after Supabase project confirmation, backup/snapshot, rollback path and post-apply verification plan are confirmed.
- No DB apply, no SQL executed, no Supabase command run, no production data mutation, no migration file modified, no new migration created, no deploy, no runtime app code change, no UI change, no Worker created, no OpenNext/Wrangler config change, no runtime dependency added and no push.
- `PLANNING.MD` remains untracked, was not read and was not committed.
- Validation: `npm run check:vietnamese-genealogy-domain` PASS, `npm run check:vietnamese-genealogy-schema-candidate` PASS, `npm run check:vietnamese-genealogy-first-migration-scope` PASS, `npm run check:vietnamese-genealogy-real-migration-file` PASS, `npm run check:vietnamese-genealogy-migration-apply-readiness` PASS, `npm run check:env:safe` PASS, `npm run check:migrations` PASS, `npm run typecheck` PASS, `npm run lint` PASS, `git diff --check` PASS, `git diff --cached --check` PASS, `git status --short` completed with `PLANNING.MD` still untracked outside scope.

## 2026-06-18 - Phase 111 Vietnamese Genealogy Real Migration File

- Owner approved Phase 111 real migration file creation only.
- Created `db/migrations/20260618_0008_vietnamese_genealogy_first_migration.sql`.
- Created `docs/111_VIETNAMESE_GENEALOGY_REAL_MIGRATION_FILE.md`.
- Added `scripts/check-vietnamese-genealogy-real-migration-file.cjs` and `npm run check:vietnamese-genealogy-real-migration-file`.
- Approved tables included: `clans`, `clan_branches`, `generation_rules`, `person_branch_memberships`.
- Explicitly excluded: `person_names`, `person_life_events`, `person_burials`, `person_media`, media processing, large export/import/GEDCOM/ZIP work, runtime app changes, Worker/service creation, DB apply, seed data and automatic backfill from `people.branch_name` or `people.generation_number`.
- Migration is additive-only and creates tables, indexes, constraints, update triggers and RLS policies.
- RLS is enabled for all new tables and uses existing permissions only; no new permission rows were created.
- Apply status: `NOT_APPLIED`.
- No DB apply, no SQL executed, no production data mutation, no deploy, no runtime app code change, no UI change, no Worker created, no OpenNext/Wrangler config change, no runtime dependency added and no push.
- `PLANNING.MD` remains untracked, was not read and was not committed.
- Validation: `npm run check:vietnamese-genealogy-domain` PASS, `npm run check:vietnamese-genealogy-schema-candidate` PASS, `npm run check:vietnamese-genealogy-first-migration-scope` PASS, `npm run check:vietnamese-genealogy-real-migration-file` PASS, `npm run check:env:safe` PASS, `npm run check:migrations` PASS, `npm run typecheck` PASS, `npm run lint` PASS, `git diff --check` PASS, `git status --short` completed with `PLANNING.MD` still untracked outside scope.

## 2026-06-18 - Phase 110B Vietnamese Genealogy First Migration Scope

- Created `docs/110B_VIETNAMESE_GENEALOGY_FIRST_MIGRATION_SCOPE.md` to narrow the first Vietnamese genealogy migration scope before any Phase 111 real migration file.
- Current status: `PHASE_111_NOT_APPROVED`.
- Required marker recorded: `OWNER_APPROVAL_REQUIRED_BEFORE_PHASE_111_REAL_MIGRATION_FILE=true`.
- Final proposed first migration scope: `clans`, `clan_branches`, `generation_rules`, `person_branch_memberships`.
- `person_names` remains optional and needs explicit owner decision before inclusion.
- Deferred from first migration: `person_life_events`, `person_burials`, `person_media`, media processing, large export/import/GEDCOM/ZIP work, runtime app changes, Worker/service creation, DB apply and automatic backfill from `people.branch_name`.
- Added `scripts/check-vietnamese-genealogy-first-migration-scope.cjs` and `npm run check:vietnamese-genealogy-first-migration-scope`.
- The checker is local/static only: no network, no `.env.local`, no Supabase client, no SQL execution and no file mutation.
- No real migration file, no DB apply, no SQL executed, no deploy, no runtime app change, no Worker created, no OpenNext/Wrangler config change, no runtime dependency added and no push.
- `PLANNING.MD` remains untracked, was not read and was not committed.
- Validation: `npm run check:vietnamese-genealogy-domain` PASS, `npm run check:vietnamese-genealogy-schema-candidate` PASS, `npm run check:vietnamese-genealogy-first-migration-scope` PASS, `npm run check:env:safe` PASS, `npm run check:migrations` PASS, `npm run typecheck` PASS, `npm run lint` PASS, `git diff --check` PASS, `git status --short` completed with `PLANNING.MD` still untracked outside scope.

## 2026-06-18 - Phase 108-110 Schema Candidate Owner Review

- Created `docs/108_110_SCHEMA_CANDIDATE_OWNER_REVIEW.md` to review the Phase 108-110 candidate before any Phase 111 migration-file decision.
- Review result: candidate direction is sound, but first migration scope should be narrowed before owner approval.
- Recommended owner decision: `REQUEST_CHANGES_BEFORE_PHASE_111`.
- Proposed first migration scope: `clans`, `clan_branches`, `generation_rules`, `person_branch_memberships`; `person_names` is optional only if owner confirms immediate need.
- Deferred from first migration: `person_life_events`, `person_burials`, `person_media`, media processing, large export/import/GEDCOM/ZIP work and runtime changes.
- No migration, no DB apply, no SQL executed, no deploy, no runtime app change, no Worker created, no OpenNext/Wrangler config change, no package added and no push.
- `PLANNING.MD` remains untracked and was not committed in this review.
- Validation: `npm run check:vietnamese-genealogy-domain` PASS, `npm run check:vietnamese-genealogy-schema-candidate` PASS, `npm run check:env:safe` PASS, `npm run check:migrations` PASS, `git diff --check` PASS, `git status --short` completed with `PLANNING.MD` still untracked outside scope.

## 2026-06-18 - Phase 108-110 Vietnamese Genealogy Schema Candidate Gate

- Created `docs/108_110_VIETNAMESE_GENEALOGY_SCHEMA_CANDIDATE.md` as a candidate-only schema design, static safety and approval gate bundle.
- Recommended normalized metadata first: `clans`, `clan_branches`, `generation_rules`, `person_branch_memberships` and `person_names`.
- Marked `person_life_events` and `person_burials` as recommended next, and `person_media` as later after media/storage boundary design.
- Added `scripts/check-vietnamese-genealogy-schema-candidate.cjs` and `npm run check:vietnamese-genealogy-schema-candidate`.
- The checker is local/static only: no network, no `.env.local`, no Supabase client, no SQL execution and no file mutation.
- No real migration file in `db/migrations/`, no DB apply, no SQL executed, no deploy, no runtime app change, no Worker created, no OpenNext/Wrangler config change, no runtime dependency added and no push.
- `PLANNING.MD` remains untracked and was not committed in this phase.
- Validation: `npm run check:vietnamese-genealogy-domain` PASS, `npm run check:vietnamese-genealogy-schema-candidate` PASS, `npm run check:env:safe` PASS, `npm run check:migrations` PASS, `npm run typecheck` PASS, `npm run lint` PASS, `git diff --check` PASS, `git status --short` completed with `PLANNING.MD` still untracked outside scope.

## 2026-06-18 - Phase 103-107 Domain Guardrail Hardening

- Hardened `docs/103_107_VIETNAMESE_GENEALOGY_DOMAIN_MODEL_READINESS.md` wording so `Required Now` is explicit specification/readiness language only.
- Renamed the Phase 104 priority label to `Specification Required Now` and added a note that it does not authorize schema, migration, DB apply, runtime, UI, service Worker or production changes.
- Added cross-reference text requiring large export/import/media/GEDCOM/ZIP work to follow `docs/RUNTIME_WORKER_GUARDRAIL.md` and `docs/SERVICE_BOUNDARY_ROADMAP.md`.
- Added runtime and Worker boundary status checklist: main Worker untouched, no runtime dependency, no service Worker, no OpenNext/Wrangler config change and no Worker size risk.
- No migration, no DB apply, no deploy, no runtime app change, no Worker created, no package added and no push.
- Validation: `npm run check:vietnamese-genealogy-domain` PASS, `npm run check:env:safe` PASS, `npm run check:migrations` PASS, `git diff --check` PASS, `git status --short` completed with expected pre-existing dirty docs plus this patch.

## 2026-06-18 - Phase 103-107 Vietnamese Genealogy Domain Model Readiness

- Created Bundle 1 docs/checker artifact for Vietnamese genealogy domain readiness.
- Phase 103: documented Vietnamese clan, branch, generation, founder, clan head, branch head, spouse, child, adopted child, step child, memorial and privacy concepts.
- Phase 104: compared current `people`, family/parent/child/couple, tree layout, privacy and export foundations against Vietnamese genealogy needs.
- Phase 105: specified person profile field groups, including legal/birth name, common name, taboo/courtesy/dharma names, lunar dates, home town, death place, occupation, biography, avatar, living status and private notes.
- Phase 106: specified relationship rules and warning cases for biological/adoptive/step/guardian parent-child relationships, spouses, former spouses, child order and conflict detection.
- Phase 107: specified clan/branch/generation structure and compatibility with public tree filtering, export/import and backup.
- Added static checker `check:vietnamese-genealogy-domain` to verify required headings/concepts, docs index/log/handoff entries, no migration status changes and no runtime surface changes.
- No migration created, no DB apply, no deploy, no production data mutation and no runtime app change.
- Validation: `npm.cmd run check:env:safe` PASS, `npm.cmd run check:migrations` PASS, `npm.cmd run check:vietnamese-genealogy-domain` PASS, `npm.cmd run typecheck` PASS, `npm.cmd run lint` PASS, `git diff --check` PASS.
- Direct `npm.cmd run build` failed on known Windows-local `.next` EPERM unlink artifact; isolated temp build with a temporary `distDir` override PASS, then temporary `next.config.ts`/`tsconfig.json` changes and `.next-domain-build-check` were removed.
- Recommended next phase: Phase 108-110 schema candidate design, static safety check and approval gate before any real migration file.

## 2026-06-18 - Phase 102 Verification Credential Completion Handoff

- Phase 98-102 summary recorded.
- DB verification: `SKIPPED_MISSING_VERIFICATION_CREDENTIALS`.
- Four permissions independently verified: NO.
- Role assignments independently verified: NOT_RUN.
- Authenticated endpoint smoke: `SKIPPED_MISSING_EXPLICIT_ENV`.
- Local/static smoke: PASS.
- Fallback removal readiness: `NOT_READY_FOR_FALLBACK_REMOVAL`.
- Recommended next phase: Phase 103 Verification Environment Completion.
- Phase 102/101/99/100/98 checkers, migration/pipeline/service/OpenNext checks, typecheck/lint - PASS.
- DB verifier and authenticated smoke safe-skip before network.
- Direct build - known `.next` EPERM; clean temp build - PASS.
- Audit - `FAIL_WITH_KNOWN_ADVISORIES`; `git diff --check` - PASS.

## 2026-06-18 - Phase 101 Verification Result Consolidation

- DB verification final status: `SKIPPED_MISSING_VERIFICATION_CREDENTIALS`.
- Four permissions independently verified: NO.
- Role assignments independently verified: NOT_RUN.
- Authenticated endpoint smoke final status: `SKIPPED_MISSING_EXPLICIT_ENV`.
- Local/static smoke and dry-run smoke: PASS.
- Fallback removal readiness: `NOT_READY_FOR_FALLBACK_REMOVAL`.
- Fallback retained; execute/restore disabled.
- Phase 101/99/100/97 checkers, typecheck/lint - PASS.
- Direct build - known `.next` EPERM; clean temp build - PASS.
- Audit - `FAIL_WITH_KNOWN_ADVISORIES`; `git diff --check` - PASS.

## 2026-06-18 - Phase 100 Authenticated Smoke Credential Assisted Run

- Authenticated endpoint smoke: `SKIPPED_MISSING_EXPLICIT_ENV`.
- Permission guard local/static smoke: PASS.
- Dry-run local/static smoke: PASS.
- Network/worker/production backup/upload/restore: no.
- Fallback retained; execute/restore disabled.
- Phase 100 checker/env-contract checker/typecheck/lint - PASS.
- Direct build - known `.next` EPERM; clean temp build - PASS.
- Audit - `FAIL_WITH_KNOWN_ADVISORIES`; `git diff --check` - PASS.

## 2026-06-18 - Phase 99 DB Verification Credential Assisted Run

- DB result: `SKIPPED_MISSING_VERIFICATION_CREDENTIALS`.
- Four permissions independently verified: NO.
- Role assignments independently verified: NOT_RUN.
- Network/DB mutation/secret logging: no.
- Fallback retained; execute/restore disabled.
- Phase 99/94/98 checkers, typecheck/lint, clean temp build - PASS.
- Direct build - known `.next` EPERM; audit - known advisories.

## 2026-06-18 - Phase 98 Verification Credential Completion Runbook

- Tao runbook CMD/PowerShell bang placeholder cho 7 shell env.
- Ghi no-env-file, no-secret-logging, safe-skip va clear-shell procedure.
- Khong tu set credential, khong query DB, khong authenticated network smoke.
- Khong deploy/push, mutation, fallback removal hoac execute/restore enablement.
- Checker/dependency checkers/typecheck/lint - PASS.
- Direct build - known `.next` EPERM; clean temp build - PASS.
- Audit - `FAIL_WITH_KNOWN_ADVISORIES`; `git diff --check` - PASS.

## 2026-06-18 - Phase 97 Backup Permission Verification Completion Handoff

### Handoff

- Migration apply: `OWNER_CONFIRMED_APPLIED`.
- DB verification: `SKIPPED_MISSING_VERIFICATION_CREDENTIALS`.
- Four permissions independently verified: no.
- Role assignments independently verified: no.
- Authenticated endpoint smoke: `SKIPPED_MISSING_EXPLICIT_ENV`.
- Local/static smoke: PASS.
- Fallback removal: `NOT_READY_FOR_FALLBACK_REMOVAL`.

### Boundary

- Fallback `permissions.manage` van con.
- Execute/restore runtime van disabled.
- Khong deploy/push, migration/DB mutation, worker call hoac production backup/restore.
- Khong doc env file hoac commit secret.

### Recommendation

Phase 98 - Verification Credential Completion.

### Validation

- Phase 97/96/95/94 checkers - PASS.
- DB/authenticated smoke - safe-skip; local/static smoke - PASS.
- Apply/fallback/canonical migration/migration order - PASS.
- Backup pipeline readiness - PASS.
- Service boundary/OpenNext wiring - PASS.
- Typecheck/lint - PASS.
- Direct build - known `.next` EPERM.
- Clean temp build - PASS.
- Audit - `FAIL_WITH_KNOWN_ADVISORIES`.
- `git diff --check` - PASS.

## 2026-06-18 - Phase 96 Backup Permission Verification Completion Run

### Ket qua run

- DB verification: `SKIPPED_MISSING_VERIFICATION_CREDENTIALS`.
- Permission verification: `NOT_RUN`.
- Role assignment verification: `NOT_RUN`.
- Authenticated endpoint smoke: `SKIPPED_MISSING_EXPLICIT_ENV`.
- Permission guard local/static smoke: PASS.
- Backup operator dry-run local/static smoke: PASS.

### Ket luan

- Status: `PASS_WITH_LIMITATIONS_AND_SAFE_SKIP`.
- Fallback removal: `NOT_READY_FOR_FALLBACK_REMOVAL`.
- Fallback `permissions.manage` van con.
- Execute/restore runtime van disabled.

### Boundary

- Khong deploy/push.
- Khong migration/DB mutation.
- Khong worker call/production backup/upload/restore.
- Khong doc env file hoac commit secret.

### Validation

- Phase 96 checker - PASS.
- DB verifier - safe-skip.
- Authenticated endpoint smoke - safe-skip.
- Permission guard/dry-run local static smoke - PASS.
- Phase 95/94/fallback readiness checkers - PASS.
- Typecheck/lint - PASS.
- Direct build - known `.next` EPERM.
- Clean temp build - PASS.
- Audit - `FAIL_WITH_KNOWN_ADVISORIES`.
- `git diff --check` - PASS.

## 2026-06-18 - Phase 95 Backup Operator Authenticated Smoke Env Contract

### Viec da lam

- Chot 4 placeholder shell-only cho authenticated smoke.
- Sua smoke script de gui cookie hoac bearer token den dung 2 route main app.
- Safe-skip truoc `fetch` neu thieu base URL, expected user hoac auth material.
- Khong log auth value, request header, base URL value hoac response body.
- Verify API dry-run safety envelope va UI khong redirect login/unauthorized.
- Tao docs/checker/package script Phase 95.

### Current run

- Ca 4 smoke env deu missing.
- Expected smoke result: `SKIPPED_MISSING_EXPLICIT_ENV`.
- Network call: khong.

### Boundary

- Khong deploy/push.
- Khong mutation/apply migration.
- Khong go fallback.
- Khong bat execute/restore.
- Khong backup worker/production backup/upload/restore.
- Khong doc env file hoac commit secret.

### Validation

- Phase 95 checker - PASS.
- Authenticated smoke - `SKIPPED_MISSING_EXPLICIT_ENV`, no network.
- Phase 81 smoke-plan checker - PASS compatibility.
- Phase 94 DB query checker - PASS.
- Typecheck/lint - PASS.
- Direct build - FAIL do known `.next` EPERM.
- Clean temp build - PASS.
- Audit - `FAIL_WITH_KNOWN_ADVISORIES` trong `esbuild`, `postcss`, `ws`.
- `git diff --check` - PASS.

### Ket qua

`PASS_WITH_SAFE_SKIP`.

## 2026-06-18 - Phase 94 Backup Permission DB Verification Query

### Phase

Phase 94 - Backup Permission DB Verification Query

### Viec da lam

- Sua verifier cu de chi dung shell-only env Phase 93.
- Bo doc env file va bo legacy `NEXT_PUBLIC_SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`.
- Them mode gate `BACKUP_PERMISSION_VERIFY_MODE=read_only`.
- Query SELECT-only tren `permissions`, `roles`, `role_permissions`.
- Verify 4 permission va OWNER/ADMIN assignment theo migration da review.
- Khong in raw provider error message; chi output query stage va non-secret error code.
- Tao docs/checker Phase 94 va package script.

### Current run

- Shell env: thieu ca URL, server key va mode.
- DB verification: `SKIPPED_MISSING_VERIFICATION_CREDENTIALS`.
- Permission verification: `NOT_RUN`.
- Role assignment verification: `NOT_RUN`.
- Network call: khong.
- DB mutation: khong.

### Package da them

- Khong them package.

### Boundary

- Khong deploy/push.
- Khong rerun/apply migration.
- Khong go fallback `permissions.manage`.
- Khong bat execute/restore runtime.
- Khong worker call/production backup/upload/restore.
- Khong doc `.env.local`/`.dev.vars`.
- Khong in/commit credential.

### Kiem thu

- `npm run verify:backup-permissions:post-apply` - `SKIPPED_MISSING_VERIFICATION_CREDENTIALS`, no network.
- Mode gate voi placeholder va mode khong hop le - `SKIPPED_VERIFICATION_MODE_NOT_READ_ONLY`, no network.
- `npm run check:backup-permission-db-verification-query` - PASS.
- `npm run check:backup-permission-read-only-verification-credential-contract` - PASS.
- `npm run check:backup-permission-post-apply-verification` - PASS compatibility.
- `npm run check:backup-permission-apply-handoff` - PASS.
- `npm run check:backup-permission-fallback-removal-readiness` - PASS.
- `npm run typecheck` - PASS.
- `npm run lint` - PASS.
- Direct `npm run build` - FAIL do known Windows `.next` EPERM artifact lock.
- Clean temp `npm run build` - PASS.
- `npm audit --audit-level=moderate` - `FAIL_WITH_KNOWN_ADVISORIES`: 7 vulnerabilities trong `esbuild`, `postcss`, `ws`; khong force-fix.
- `git diff --check` - PASS.

### Ket qua

`PASS_WITH_SAFE_SKIP`.

## 2026-06-18 - Phase 93 Backup Permission Read-Only Verification Credential Contract

### Phase

Phase 93 - Backup Permission Read-Only Verification Credential Contract

### Viec da lam

- Tao shell-only credential contract cho post-apply DB verification.
- Chon env placeholders `BACKUP_PERMISSION_VERIFY_SUPABASE_URL`, `BACKUP_PERMISSION_VERIFY_SUPABASE_SERVER_KEY`, `BACKUP_PERMISSION_VERIFY_MODE=read_only`.
- Ghi ro Supabase server key co the co quyen rong, nhung verifier chi duoc SELECT/read-only.
- Cam verification script doc `.env.local` hoac `.dev.vars`.
- Ghi cam insert/update/delete/upsert/RPC mutation, no-secret-logging, safe-skip va no-DB-mutation policy.
- Tao checker local cho credential contract va chan legacy readonly-key name, network, env-secret access, DB mutation trong checker.
- Cap nhat docs index, decision log va handoff.

### Package da them

- Khong them package.

### Ghi chu

- Phase 93 khong query DB.
- Phase 89 van co limitation `SKIPPED_MISSING_VERIFICATION_CREDENTIALS`.
- Khong deploy/push.
- Khong go fallback.
- Khong bat execute/restore runtime.
- Khong in/commit credential.

### Kiem thu

- `npm run check:backup-permission-read-only-verification-credential-contract` - PASS.
- `npm run check:backup-permission-apply-handoff` - PASS.
- `npm run check:backup-permission-fallback-removal-readiness` - PASS.
- `npm run check:backup-permission-post-apply-verification` - PASS.
- `npm run check:backup-permission-real-migration-apply-execution` - PASS.
- `npm run typecheck` - PASS.
- `npm run lint` - PASS.
- Direct `npm run build` - FAIL do known Windows `.next` EPERM artifact lock.
- Clean temp `npm run build` - PASS.
- `npm audit --audit-level=moderate` - `FAIL_WITH_KNOWN_ADVISORIES`: 7 vulnerabilities trong `esbuild`, `postcss`, `ws`; khong chay `npm audit fix --force`.
- `git diff --check` - PASS.

### Ket qua

PASS_WITH_KNOWN_NOTES.

## 2026-06-18 - Phase 92 Backup Permission Apply Handoff

### Phase

Phase 92 - Backup Permission Apply Handoff

### Viec da lam

- Tong hop Phase 88-92: owner-confirmed apply, verifier safe-skip, runtime smoke partial va fallback removal not ready.
- Ghi ro DB mutation expected scope va bang chung chua independently verified.
- Ghi ro runtime khong doi: fallback con, execute/restore chua bat, worker khong goi.
- Tao apply handoff checker.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/92_BACKUP_PERMISSION_APPLY_HANDOFF.md
- scripts/check-backup-permission-apply-handoff.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration moi.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy/push.
- Khong go fallback.
- Khong bat execute/restore runtime.
- Khong worker call/production backup/restore.
- Khong hardcode hoac in secret/token/key.

## 2026-06-18 - Phase 91 Backup Permission Fallback Removal Readiness

### Phase

Phase 91 - Backup Permission Fallback Removal Readiness

### Viec da lam

- Danh gia migration apply, DB verification va runtime smoke evidence.
- Xac nhan API/UI runtime files van con fallback `permissions.manage`.
- Ket luan `NOT_READY_FOR_FALLBACK_REMOVAL`.
- Ly do: DB verification safe-skip va explicit-env endpoint smoke safe-skip.
- Ghi required separate owner approval truoc future fallback removal.
- Tao checker local xac nhan docs va fallback van ton tai trong runtime.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/91_BACKUP_PERMISSION_FALLBACK_REMOVAL_READINESS.md
- scripts/check-backup-permission-fallback-removal-readiness.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration moi.

### Package da them

- Khong them package.

### Ghi chu

- Khong sua runtime.
- Khong go fallback.
- Khong deploy/push.
- Khong mutate DB.
- Khong bat execute/restore runtime.

## 2026-06-18 - Phase 90 Backup Operator Permission Runtime Smoke

### Phase

Phase 90 - Backup Operator Permission Runtime Smoke

### Viec da lam

- Chay `smoke:backup-permission:post-migration`: SKIPPED do thieu explicit smoke env.
- Chay `smoke:backup-operator:permission-guard`: PASS local/static.
- Chay `smoke:backup-operator:dry-run`: PASS local/static.
- Xac nhan khong worker call, khong production backup, khong storage upload va khong restore.
- Tao docs/checker tong hop runtime smoke result.
- Khong sua existing smoke scripts vi safe-skip/guardrails da dung.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/90_BACKUP_OPERATOR_PERMISSION_RUNTIME_SMOKE.md
- scripts/check-backup-operator-permission-runtime-smoke.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration moi.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong network endpoint smoke do thieu explicit env.
- Khong go fallback.
- Khong bat execute/restore runtime.
- Khong goi worker/backup/restore that.

## 2026-06-18 - Phase 89 Backup Permission Post-Apply Verification

### Phase

Phase 89 - Backup Permission Post-Apply Verification

### Viec da lam

- Tao verifier read-only cho 4 backup operator permissions va OWNER/ADMIN role assignments.
- Verifier doc `.env.local` neu ton tai nhung khong in credential values.
- Verifier safe-skip khi thieu `NEXT_PUBLIC_SUPABASE_URL` hoac `SUPABASE_SERVICE_ROLE_KEY`.
- Ghi result hien tai `SKIPPED_MISSING_VERIFICATION_CREDENTIALS`.
- Ghi ro apply van la owner-confirmed, con permission rows/role mappings chua duoc Codex verify doc lap.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/89_BACKUP_PERMISSION_POST_APPLY_VERIFICATION.md
- scripts/verify-backup-permissions-post-apply.cjs
- scripts/check-backup-permission-post-apply-verification.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration moi.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong mutate DB trong verifier.
- Khong go fallback.
- Khong bat execute/restore runtime.
- Khong in secret/token/key.

## 2026-06-18 - Phase 88 Backup Permission Real Migration Apply Execution

### Phase

Phase 88 - Backup Permission Real Migration Apply Execution

### Viec da lam

- Ghi nhan owner da chay SQL migration qua Supabase Dashboard SQL Editor.
- Ghi target project ref `frkyeuxrlcflmsxxsolp`.
- Ghi migration path `db/migrations/20260618_0007_backup_operator_permissions.sql`.
- Ghi DB mutation owner-confirmed va gioi han trong backup operator permission metadata/role assignments.
- Ghi ro Codex khong co Supabase CLI/link/credential local de tu query DB trong Phase 88.
- Tao checker local cho apply execution record.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/88_BACKUP_PERMISSION_REAL_MIGRATION_APPLY_EXECUTION.md
- scripts/check-backup-permission-real-migration-apply-execution.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration moi.
- Migration 0007 da duoc owner-confirmed apply tren Supabase Dashboard.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong go fallback `permissions.manage`.
- Khong bat execute/restore runtime.
- Khong in secret/token/key/connection string.

## 2026-06-18 - Phase 87 Backup Permission Execution Readiness Handoff

### Phase

Phase 87 - Backup Permission Execution Readiness Handoff

### Viec da lam

- Tao handoff tong hop Phase 83-87 cho backup permission migration execution readiness.
- Ghi ro migration file exists in `db/migrations/`, wrong old path no longer exists, migration has not been run va no DB mutation.
- Tong hop execution runbook, pre-apply checklist, rollback drill plan va approval gate.
- Ghi ro owner approval, DB backup/snapshot va post-apply smoke van bat buoc truoc real apply.
- Ghi fallback `permissions.manage` still remains va execute/restore runtime still not enabled.
- Tao checker local cho execution readiness handoff.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/87_BACKUP_PERMISSION_EXECUTION_READINESS_HANDOFF.md
- scripts/check-backup-permission-execution-readiness-handoff.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration moi.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong chay migration that.
- Khong apply DB.
- Khong mutate DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Supabase/API/DB/network.

## 2026-06-18 - Phase 86 Backup Permission Apply Approval Gate

### Phase

Phase 86 - Backup Permission Apply Approval Gate

### Viec da lam

- Tao approval gate cuoi truoc future migration apply.
- Them marker `OWNER_APPROVAL_REQUIRED_BEFORE_APPLYING_BACKUP_PERMISSION_MIGRATION=true`.
- Ghi required Supabase project confirmation, DB backup/snapshot, local validation, rollback owner, smoke owner va apply window.
- Ghi no-go conditions de chan apply neu thieu approval hoac bundle fallback removal/execute/restore runtime.
- Tao checker local cho approval gate.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/86_BACKUP_PERMISSION_APPLY_APPROVAL_GATE.md
- scripts/check-backup-permission-apply-approval-gate.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration moi.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong chay migration that.
- Khong apply DB.
- Khong mutate DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Supabase/API/DB/network.

## 2026-06-18 - Phase 85 Backup Permission Rollback Drill Plan

### Phase

Phase 85 - Backup Permission Rollback Drill Plan

### Viec da lam

- Tao rollback drill plan cho future backup permission migration execution.
- Ghi failure scenarios bat buoc: owner/admin mat `/admin/backups`, API dry-run 403 nham, thieu permission seed, role assignment sai, wrong project, fallback removal qua som.
- Ghi rollback options: restore from snapshot, sua role_permissions, giu permission rows, giu fallback `permissions.manage`.
- Tao checker local cho rollback drill plan.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/85_BACKUP_PERMISSION_ROLLBACK_DRILL_PLAN.md
- scripts/check-backup-permission-rollback-drill-plan.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration moi.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong chay migration that.
- Khong apply DB.
- Khong mutate DB.
- Khong chay rollback that.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Supabase/API/DB/network.

## 2026-06-18 - Phase 84 Backup Permission Pre-Apply Verification Checklist

### Phase

Phase 84 - Backup Permission Pre-Apply Verification Checklist

### Viec da lam

- Tao checklist pre-apply cho future migration execution.
- Ghi ro canonical path `db/migrations/20260618_0007_backup_operator_permissions.sql`.
- Ghi no-go conditions: owner approval, DB backup/snapshot, dung Supabase project, static checks, canonical path, rollback owner, smoke owner, expected roles va fallback plan.
- Tao checker local cho checklist.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/84_BACKUP_PERMISSION_PRE_APPLY_VERIFICATION_CHECKLIST.md
- scripts/check-backup-permission-pre-apply-verification-checklist.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration moi.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong chay migration that.
- Khong apply DB.
- Khong mutate DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Supabase/API/DB/network.

## 2026-06-18 - Phase 83 Backup Permission Migration Path Canonicalization & Execution Runbook

### Phase

Phase 83 - Backup Permission Migration Path Canonicalization & Execution Runbook

### Viec da lam

- Chuyen canonical migration path ve `db/migrations/20260618_0007_backup_operator_permissions.sql`.
- Xoa wrong old path `supabase/migrations/20260618_0007_backup_operator_permissions.sql` khoi tracked files.
- Cap nhat Phase 78-82 docs/check scripts de doc migration tu `db/migrations/`.
- Tao execution runbook cho future apply, yeu cau owner approval, DB backup/snapshot, pre-apply checks, post-apply verification va rollback notes.
- Tao canonical path checker de chan duplicate/sai thu muc.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- db/migrations/20260618_0007_backup_operator_permissions.sql
- docs/83_BACKUP_PERMISSION_MIGRATION_EXECUTION_RUNBOOK.md
- scripts/check-backup-permission-migration-canonical-path.cjs
- scripts/check-backup-permission-migration-execution-runbook.cjs
- docs/78_BACKUP_PERMISSION_REAL_MIGRATION_FILE_IMPLEMENTATION.md
- docs/79_BACKUP_PERMISSION_MIGRATION_STATIC_VERIFICATION.md
- docs/82_BACKUP_PERMISSION_REAL_MIGRATION_HANDOFF.md
- scripts/check-backup-permission-real-migration-file.cjs
- scripts/check-backup-permission-real-migration-static-verification.cjs
- scripts/check-backup-permission-real-migration-handoff.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration moi; move file da co ve canonical path `db/migrations/`.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong chay migration that.
- Khong apply DB.
- Khong mutate DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Supabase/API/DB/network.

## 2026-06-18 - Phase 82 Backup Permission Real Migration Handoff

### Phase

Phase 82 - Backup Permission Real Migration Handoff

### Viec da lam

- Tao `docs/82_BACKUP_PERMISSION_REAL_MIGRATION_HANDOFF.md`.
- Tao `scripts/check-backup-permission-real-migration-handoff.cjs`.
- Them `npm run check:backup-permission-real-migration-handoff`.
- Tong hop Phase 78-82: migration file, static verification, fallback removal plan, post-migration smoke plan va handoff.
- Ghi ro migration file exists in `supabase/migrations/`, migration has not been run, no DB mutation, no deploy va no production backup.
- Ghi ro fallback `permissions.manage` van con va `backup.operator.execute`/`backup.operator.restore` still not enabled.
- Ghi required future migration execution approval, DB backup/snapshot va rollback plan.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/82_BACKUP_PERMISSION_REAL_MIGRATION_HANDOFF.md
- scripts/check-backup-permission-real-migration-handoff.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration moi trong Phase 82.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong chay migration that.
- Khong apply DB.
- Khong mutate DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Supabase/API/DB/network.

## 2026-06-18 - Phase 81 Backup Permission Post-Migration Smoke Plan

### Phase

Phase 81 - Backup Permission Post-Migration Smoke Plan

### Viec da lam

- Tao `docs/81_BACKUP_PERMISSION_POST_MIGRATION_SMOKE_PLAN.md`.
- Tao `scripts/smoke-backup-permission-post-migration.cjs`.
- Tao `scripts/check-backup-permission-post-migration-smoke-plan.cjs`.
- Them `npm run smoke:backup-permission:post-migration`.
- Them `npm run check:backup-permission-post-migration-smoke-plan`.
- Smoke script safe-skip khi thieu `BACKUP_PERMISSION_SMOKE_BASE_URL` hoac `BACKUP_PERMISSION_SMOKE_EXPECTED_USER`.
- Smoke script khong doc `.env.local`/`.dev.vars`, khong dung token va khong goi URL khi thieu env explicit.
- Ghi no-real-backup policy va failure handling.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/81_BACKUP_PERMISSION_POST_MIGRATION_SMOKE_PLAN.md
- scripts/smoke-backup-permission-post-migration.cjs
- scripts/check-backup-permission-post-migration-smoke-plan.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration moi trong Phase 81.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong chay migration that.
- Khong apply DB.
- Khong mutate DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Supabase/API/DB truc tiep.
- Smoke mac dinh SKIPPED khi thieu explicit env.

## 2026-06-18 - Phase 80 Backup Permission Runtime Fallback Removal Plan

### Phase

Phase 80 - Backup Permission Runtime Fallback Removal Plan

### Viec da lam

- Tao `docs/80_BACKUP_PERMISSION_RUNTIME_FALLBACK_REMOVAL_PLAN.md`.
- Tao `scripts/check-backup-permission-runtime-fallback-removal-plan.cjs`.
- Them `npm run check:backup-permission-runtime-fallback-removal-plan`.
- Ghi current fallback `permissions.manage` va preconditions truoc khi bo fallback.
- Ghi API fallback removal plan, UI fallback removal plan, post-removal smoke plan va rollback plan.
- Checker xac nhan runtime API/UI van con `permissions.manage` trong Phase 80.
- Khong sua runtime fallback, khong chay migration va khong mutate DB.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/80_BACKUP_PERMISSION_RUNTIME_FALLBACK_REMOVAL_PLAN.md
- scripts/check-backup-permission-runtime-fallback-removal-plan.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration moi trong Phase 80.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong chay migration that.
- Khong apply DB.
- Khong mutate DB.
- Khong sua runtime fallback.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Supabase/API/DB/network.

## 2026-06-18 - Phase 79 Backup Permission Migration Static Verification

### Phase

Phase 79 - Backup Permission Migration Static Verification

### Viec da lam

- Tao `docs/79_BACKUP_PERMISSION_MIGRATION_STATIC_VERIFICATION.md`.
- Tao `scripts/check-backup-permission-real-migration-static-verification.cjs`.
- Them `npm run check:backup-permission-real-migration-static-verification`.
- Checker scan `supabase/migrations/20260618_0007_backup_operator_permissions.sql`.
- Checker xac nhan filename pattern, markers, 4 permission names, idempotency va role assignment khong vuot qua `OWNER`/`ADMIN`.
- Checker chan destructive SQL, URL/network text, secret-like text va runtime backup/restore action wording.
- Khong chay migration, khong apply DB va khong goi Supabase/API/DB/network.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/79_BACKUP_PERMISSION_MIGRATION_STATIC_VERIFICATION.md
- scripts/check-backup-permission-real-migration-static-verification.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration moi trong Phase 79.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong chay migration that.
- Khong apply DB.
- Khong mutate DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Supabase/API/DB/network.

## 2026-06-18 - Phase 78 Backup Permission Real Migration File Implementation

### Phase

Phase 78 - Backup Permission Real Migration File Implementation

### Viec da lam

- Tao `supabase/migrations/20260618_0007_backup_operator_permissions.sql`.
- Tao `docs/78_BACKUP_PERMISSION_REAL_MIGRATION_FILE_IMPLEMENTATION.md`.
- Tao `scripts/check-backup-permission-real-migration-file.cjs`.
- Them `npm run check:backup-permission-real-migration-file`.
- Migration file seed 4 permission `backup.operator.*` va role assignments cho `OWNER`/`ADMIN`.
- Migration co marker `BACKUP_PERMISSION_REAL_MIGRATION_FILE`, `OWNER_APPROVED_FILE_CREATION_ONLY`, `DO_NOT_RUN_WITHOUT_SEPARATE_OWNER_APPROVAL`.
- Khong chay migration, khong apply DB va khong goi Supabase/API/DB/network.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- supabase/migrations/20260618_0007_backup_operator_permissions.sql
- docs/78_BACKUP_PERMISSION_REAL_MIGRATION_FILE_IMPLEMENTATION.md
- scripts/check-backup-permission-real-migration-file.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Co: `supabase/migrations/20260618_0007_backup_operator_permissions.sql`.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong chay migration that.
- Khong apply DB.
- Khong mutate DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Supabase/API/DB/network.
- Khong bat execute/restore runtime.

## 2026-06-18 - Phase 77 Backup Permission Migration Candidate Handoff

### Phase

Phase 77 - Backup Permission Migration Candidate Handoff

### Viec da lam

- Tao `docs/77_BACKUP_PERMISSION_MIGRATION_CANDIDATE_HANDOFF.md`.
- Tao `scripts/check-backup-permission-migration-candidate-handoff.cjs`.
- Them `npm run check:backup-permission-migration-candidate-handoff`.
- Tong hop Phase 73-77: SQL candidate draft, static safety, seed candidate smoke, approval checklist va handoff.
- Ghi ro SQL candidate is not real migration, no file in `supabase/migrations/`, no DB mutation, no deploy va no production backup.
- Ghi ro `backup.operator.execute` va `backup.operator.restore` still not enabled.
- Ghi required future real migration, DB backup/snapshot va rollback plan.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/77_BACKUP_PERMISSION_MIGRATION_CANDIDATE_HANDOFF.md
- scripts/check-backup-permission-migration-candidate-handoff.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong tao migration that.
- Khong chay SQL.
- Khong chay migration that.
- Khong mutate DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Supabase/API/DB/network.
- Khong tao file trong `supabase/migrations/`.

## 2026-06-18 - Phase 76 Backup Permission Real Migration Approval Checklist

### Phase

Phase 76 - Backup Permission Real Migration Approval Checklist

### Viec da lam

- Tao `docs/76_BACKUP_PERMISSION_REAL_MIGRATION_APPROVAL_CHECKLIST.md`.
- Tao `scripts/check-backup-permission-real-migration-approval-checklist.cjs`.
- Them `npm run check:backup-permission-real-migration-approval-checklist`.
- Ghi marker approval `OWNER_APPROVAL_REQUIRED_BEFORE_BACKUP_PERMISSION_REAL_MIGRATION=true`.
- Ghi required SQL candidate checks, seed dry-run checks, DB backup/snapshot, rollback plan, production window va post-migration validation.
- Ghi explicit no-go conditions truoc khi tao/apply migration that.
- Ghi ro Phase 76 khong tao migration that, khong chay SQL, khong mutate DB.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/76_BACKUP_PERMISSION_REAL_MIGRATION_APPROVAL_CHECKLIST.md
- scripts/check-backup-permission-real-migration-approval-checklist.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong tao migration that.
- Khong chay SQL.
- Khong chay migration that.
- Khong mutate DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Supabase/API/DB/network.

## 2026-06-18 - Phase 75 Backup Permission Seed Candidate Smoke

### Phase

Phase 75 - Backup Permission Seed Candidate Smoke

### Viec da lam

- Tao `docs/75_BACKUP_PERMISSION_SEED_CANDIDATE_SMOKE.md`.
- Tao `scripts/smoke-backup-permission-seed-candidate.cjs`.
- Tao `scripts/check-backup-permission-seed-candidate-smoke.cjs`.
- Them `npm run smoke:backup-permission:seed-candidate`.
- Them `npm run check:backup-permission-seed-candidate-smoke`.
- Smoke local so sanh SQL candidate draft voi seed dry-run script.
- Smoke xac nhan 4 permission names va no-production marker dong nhat.
- Smoke khong chay SQL, khong goi DB/network, khong doc env va khong mutate file.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/75_BACKUP_PERMISSION_SEED_CANDIDATE_SMOKE.md
- scripts/smoke-backup-permission-seed-candidate.cjs
- scripts/check-backup-permission-seed-candidate-smoke.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong chay SQL.
- Khong chay migration that.
- Khong mutate DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Supabase/API/DB/network.

## 2026-06-18 - Phase 74 Backup Permission SQL Static Safety Check

### Phase

Phase 74 - Backup Permission SQL Static Safety Check

### Viec da lam

- Tao `docs/74_BACKUP_PERMISSION_SQL_STATIC_SAFETY_CHECK.md`.
- Tao `scripts/check-backup-permission-sql-static-safety.cjs`.
- Them `npm run check:backup-permission-sql-static-safety`.
- Static checker scan `scripts/backup-permission-sql-candidate.sql.draft`.
- Checker yeu cau marker `BACKUP_PERMISSION_SQL_CANDIDATE_ONLY` va `DO_NOT_RUN_ON_PRODUCTION_WITHOUT_OWNER_APPROVAL`.
- Checker yeu cau 4 permission names va idempotency concept.
- Checker chan destructive SQL, network URL, `service_role`, `anon key`, `jwt secret` va `security definer`.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/74_BACKUP_PERMISSION_SQL_STATIC_SAFETY_CHECK.md
- scripts/check-backup-permission-sql-static-safety.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong chay SQL.
- Khong chay migration that.
- Khong mutate DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Supabase/API/DB/network.

## 2026-06-18 - Phase 73 Backup Permission SQL Candidate Draft

### Phase

Phase 73 - Backup Permission SQL Candidate Draft

### Viec da lam

- Tao `docs/73_BACKUP_PERMISSION_SQL_CANDIDATE_DRAFT.md`.
- Tao `scripts/backup-permission-sql-candidate.sql.draft`.
- Tao `scripts/check-backup-permission-sql-candidate-draft.cjs`.
- Them `npm run check:backup-permission-sql-candidate-draft`.
- SQL draft co marker `BACKUP_PERMISSION_SQL_CANDIDATE_ONLY` va `DO_NOT_RUN_ON_PRODUCTION_WITHOUT_OWNER_APPROVAL`.
- SQL draft nam trong `scripts/`, khong nam trong `supabase/migrations/`.
- SQL draft chi mo ta upsert permission va role_permissions bang `on conflict`, khong chay SQL va khong mutate DB.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/73_BACKUP_PERMISSION_SQL_CANDIDATE_DRAFT.md
- scripts/backup-permission-sql-candidate.sql.draft
- scripts/check-backup-permission-sql-candidate-draft.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong chay migration that.
- Khong mutate DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Supabase/API/DB/network.
- Khong tao file trong `supabase/migrations/`.

## 2026-06-18 - Phase 72 Backup Permission Seed Readiness Handoff

### Phase

Phase 72 - Backup Permission Seed Readiness Handoff

### Viec da lam

- Tao `docs/72_BACKUP_PERMISSION_SEED_READINESS_HANDOFF.md`.
- Tao `scripts/check-backup-permission-seed-readiness-handoff.cjs`.
- Them `npm run check:backup-permission-seed-readiness-handoff`.
- Tong hop status Phase 68-72: design, seed dry-run, assignment runbook, activation guardrails va handoff.
- Ghi ro no migration/schema in Phase 68-72, no DB mutation, no real worker call, no deploy, no production backup, no real storage va no secret committed.
- Ghi ro `backup.operator.execute` va `backup.operator.restore` still not enabled.
- Ghi ro fallback `permissions.manage` van con trong runtime cho den khi co migration/seed that.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/72_BACKUP_PERMISSION_SEED_READINESS_HANDOFF.md
- scripts/check-backup-permission-seed-readiness-handoff.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong chay migration that.
- Khong mutate DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Supabase/API/network.
- Khong goi backup service worker that.
- Khong bat execute/restore that.

## 2026-06-18 - Phase 71 Backup Permission Activation Guardrails

### Phase

Phase 71 - Backup Permission Activation Guardrails

### Viec da lam

- Tao `docs/71_BACKUP_PERMISSION_ACTIVATION_GUARDRAILS.md`.
- Tao `scripts/check-backup-permission-activation-guardrails.cjs`.
- Them `npm run check:backup-permission-activation-guardrails`.
- Guardrail scan `app/api/admin/backups`, `app/(admin)/admin/backups`, `components/admin/backup-operator-dry-run-panel.tsx`, `server/services/backup-service-client.ts` va `scripts/backup-permission-seed-dry-run.cjs`.
- Chan `backup.operator.execute`/`backup.operator.restore` trong runtime route/page/component/service.
- Chan worker real call, production backup trigger, storage upload, restore trigger, hardcoded token/key va `.env.local`/`.dev.vars` read.
- Cho phep execute/restore trong seed dry-run script vi script co marker dry-run va khong mutate DB/network.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/71_BACKUP_PERMISSION_ACTIVATION_GUARDRAILS.md
- scripts/check-backup-permission-activation-guardrails.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong chay migration that.
- Khong mutate DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Supabase/API/network.
- Khong goi backup service worker that.
- Khong bat execute/restore that.

## 2026-06-18 - Phase 70 Backup Permission Assignment Runbook

### Phase

Phase 70 - Backup Permission Assignment Runbook

### Viec da lam

- Tao `docs/70_BACKUP_PERMISSION_ASSIGNMENT_RUNBOOK.md`.
- Tao `scripts/check-backup-permission-assignment-runbook.cjs`.
- Them `npm run check:backup-permission-assignment-runbook`.
- Ghi permission list, recommended role assignments, operator assignment workflow, approval required, verification checklist va rollback checklist.
- Ghi ro `OWNER` duoc de xuat all four, `ADMIN` view/dry_run, other roles none by default unless owner approves.
- Ghi ro Phase 70 khong assign that, khong SQL, khong migration va khong mutate DB.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/70_BACKUP_PERMISSION_ASSIGNMENT_RUNBOOK.md
- scripts/check-backup-permission-assignment-runbook.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong chay migration that.
- Khong mutate DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Supabase/API/network.
- Khong goi backup service worker that.

## 2026-06-18 - Phase 69 Backup Permission Seed Dry-Run Checker

### Phase

Phase 69 - Backup Permission Seed Dry-Run Checker

### Viec da lam

- Tao `docs/69_BACKUP_PERMISSION_SEED_DRY_RUN_CHECKER.md`.
- Tao `scripts/backup-permission-seed-dry-run.cjs`.
- Tao `scripts/check-backup-permission-seed-dry-run.cjs`.
- Them `npm run backup:permission:seed:dry-run`.
- Them `npm run check:backup-permission-seed-dry-run`.
- Dry-run script output marker `BACKUP_PERMISSION_SEED_DRY_RUN_ONLY`.
- Dry-run script mo phong `would_insert`, `would_assign`, `dry_run: true`, khong import Supabase, khong doc env va khong ghi migration.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/69_BACKUP_PERMISSION_SEED_DRY_RUN_CHECKER.md
- scripts/backup-permission-seed-dry-run.cjs
- scripts/check-backup-permission-seed-dry-run.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong chay migration that.
- Khong mutate DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Supabase/API/network.
- Khong goi backup service worker that.

## 2026-06-18 - Phase 68 Backup Permission Migration/Seed Design

### Phase

Phase 68 - Backup Permission Migration/Seed Design

### Viec da lam

- Tao `docs/68_BACKUP_PERMISSION_MIGRATION_SEED_DESIGN.md`.
- Tao `scripts/check-backup-permission-migration-seed-design.cjs`.
- Them `npm run check:backup-permission-migration-seed-design`.
- Tong hop permission/migration pattern hien co trong `db/migrations`.
- De xuat future permission rows `backup.operator.view`, `backup.operator.dry_run`, `backup.operator.execute`, `backup.operator.restore`.
- De xuat mapping theo role hien co: `OWNER` co view/dry_run/execute/restore, `ADMIN` co view/dry_run, cac role khac none by default.
- Ghi ro Phase 68 chi design, khong tao/chay migration, khong mutate DB.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/68_BACKUP_PERMISSION_MIGRATION_SEED_DESIGN.md
- scripts/check-backup-permission-migration-seed-design.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong chay migration that.
- Khong mutate DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi backup service worker that.
- Khong tao/upload backup production that.

## 2026-06-18 - Phase 67 Backup Operator Permission Handoff

### Phase

Phase 67 - Backup Operator Permission Handoff

### Viec da lam

- Tao `docs/67_BACKUP_OPERATOR_PERMISSION_HANDOFF.md`.
- Tao `scripts/check-backup-operator-permission-handoff.cjs`.
- Them `npm run check:backup-operator-permission-handoff`.
- Tong hop Phase 63-67: permission model review, API guard, UI guard, smoke va guardrail status.
- Ghi ro permission names proposed/used: `backup.operator.view`, `backup.operator.dry_run`, `backup.operator.execute`, `backup.operator.restore`.
- Ghi ro fallback hien tai la `permissions.manage` cho den khi co migration/seed permission that.
- Ghi ro chua co real worker call, chua deploy, chua production backup, chua real storage, chua secret committed, chua migration/schema trong Phase 63-67.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/67_BACKUP_OPERATOR_PERMISSION_HANDOFF.md
- scripts/check-backup-operator-permission-handoff.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong goi backup service worker that.
- Khong hardcode URL/token/key.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong tao/upload backup production that.
- Khong restore production.

## 2026-06-18 - Phase 66 Backup Operator Permission Smoke & Guardrails

### Phase

Phase 66 - Backup Operator Permission Smoke & Guardrails

### Viec da lam

- Tao `docs/66_BACKUP_OPERATOR_PERMISSION_SMOKE_GUARDRAILS.md`.
- Tao `scripts/smoke-backup-operator-permission-guard.cjs`.
- Tao `scripts/check-backup-operator-permission-guardrails.cjs`.
- Them `npm run smoke:backup-operator:permission-guard`.
- Them `npm run check:backup-operator-permission-guardrails`.
- Smoke xac nhan API/UI markers, permission names, adapter dry-run marker va no-real-backup fields.
- Guardrail scan operator route/page/component va dry-run adapter de chan worker URL, secret, production backup, storage upload, restore, cron va env file read.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/66_BACKUP_OPERATOR_PERMISSION_SMOKE_GUARDRAILS.md
- scripts/smoke-backup-operator-permission-guard.cjs
- scripts/check-backup-operator-permission-guardrails.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong goi backup service worker that.
- Khong hardcode URL/token/key.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong tao/upload backup production that.
- Khong restore production.

## 2026-06-18 - Phase 65 Backup Operator UI Permission Guard

### Phase

Phase 65 - Backup Operator UI Permission Guard

### Viec da lam

- Cap nhat `app/(admin)/admin/backups/page.tsx` voi marker `BACKUP_OPERATOR_UI_PERMISSION_GUARD`.
- Dung `getPermissionContext` de guard `/admin/backups` server-side.
- Check `backup.operator.view` truoc, fallback fail-closed bang `permissions.manage` vi chua co migration/seed permission backup.
- Redirect anonymous user ve login va unauthorized user ve `/unauthorized?reason=missing_backup_operator_view`.
- Cap nhat `components/admin/backup-operator-dry-run-panel.tsx` de nhan permission guard/source va van chi goi route noi bo dry-run.
- Tao `docs/65_BACKUP_OPERATOR_UI_PERMISSION_GUARD.md`.
- Tao `scripts/check-backup-operator-ui-permission-guard.cjs`.
- Them `npm run check:backup-operator-ui-permission-guard`.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- app/(admin)/admin/backups/page.tsx
- components/admin/backup-operator-dry-run-panel.tsx
- docs/65_BACKUP_OPERATOR_UI_PERMISSION_GUARD.md
- scripts/check-backup-operator-ui-permission-guard.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong goi backup service worker that.
- Khong hardcode URL/token/key.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong tao/upload backup production that.
- Khong restore production.

## 2026-06-18 - Phase 64 Backup Operator API Permission Guard

### Phase

Phase 64 - Backup Operator API Permission Guard

### Viec da lam

- Cap nhat `app/api/admin/backups/service-dry-run/route.ts` voi marker `BACKUP_OPERATOR_API_PERMISSION_GUARD`.
- Dung `getPermissionContext` hien co de guard route server-side.
- Check `backup.operator.dry_run` truoc, fallback fail-closed bang `permissions.manage` vi chua co migration/seed permission backup.
- Tra JSON 401/403 khi thieu login/quyen, van giu dry-run envelope voi `worker_call: false`, `production_backup: false`, `storage_upload: false`, `restore: false`.
- Tao `docs/64_BACKUP_OPERATOR_API_PERMISSION_GUARD.md`.
- Tao `scripts/check-backup-operator-api-permission-guard.cjs`.
- Them `npm run check:backup-operator-api-permission-guard`.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- app/api/admin/backups/service-dry-run/route.ts
- docs/64_BACKUP_OPERATOR_API_PERMISSION_GUARD.md
- scripts/check-backup-operator-api-permission-guard.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong goi backup service worker that.
- Khong hardcode URL/token/key.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong tao/upload backup production that.
- Khong restore production.

## 2026-06-18 - Phase 63 Backup Operator Permission Model Review

### Phase

Phase 63 - Backup Operator Permission Model Review

### Viec da lam

- Tao `docs/63_BACKUP_OPERATOR_PERMISSION_MODEL_REVIEW.md`.
- Tao `scripts/check-backup-operator-permission-model-review.cjs`.
- Them `npm run check:backup-operator-permission-model-review`.
- De xuat permission model `backup.operator.view`, `backup.operator.dry_run`, `backup.operator.execute`, `backup.operator.restore`.
- Ghi ro dry-run UI/API chi can view/dry_run, execute/restore danh cho phase that sau nay.
- Khong tao migration/schema/seed va khong cap quyen DB that trong phase nay.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/63_BACKUP_OPERATOR_PERMISSION_MODEL_REVIEW.md
- scripts/check-backup-operator-permission-model-review.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong goi backup service worker that.
- Khong goi network/API/DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong tao/upload backup production that.
- Khong restore production.

## 2026-06-18 - Phase 62 Backup Operator Dry-Run Handoff

### Phase

Phase 62 - Backup Operator Dry-Run Handoff

### Viec da lam

- Tao `docs/62_BACKUP_OPERATOR_DRY_RUN_HANDOFF.md`.
- Tao `scripts/check-backup-operator-dry-run-handoff.cjs`.
- Them `npm run check:backup-operator-dry-run-handoff`.
- Tong hop Phase 58-62: API route, UI panel, guardrails, local smoke va boundary.
- Ghi ro operator bundle van dry-run-only, no real worker call, no deploy, no production backup, no real storage, no secret committed.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/62_BACKUP_OPERATOR_DRY_RUN_HANDOFF.md
- scripts/check-backup-operator-dry-run-handoff.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong goi backup service worker that.
- Khong goi network/API/DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong tao/upload backup production that.
- Khong restore production.

## 2026-06-18 - Phase 61 Backup Operator Local Smoke

### Phase

Phase 61 - Backup Operator Local Smoke

### Viec da lam

- Tao `docs/61_BACKUP_OPERATOR_LOCAL_SMOKE.md`.
- Tao `scripts/smoke-backup-operator-dry-run.cjs`.
- Tao `scripts/check-backup-operator-local-smoke.cjs`.
- Them `npm run smoke:backup-operator:dry-run`.
- Them `npm run check:backup-operator-local-smoke`.
- Smoke chi doc source files va package scripts, khong goi network/env/DB.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/61_BACKUP_OPERATOR_LOCAL_SMOKE.md
- scripts/smoke-backup-operator-dry-run.cjs
- scripts/check-backup-operator-local-smoke.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong can server dang chay.
- Khong goi backup service worker that.
- Khong goi network/API/DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong tao/upload backup production that.
- Khong restore production.

## 2026-06-18 - Phase 60 Backup Operator UI Guardrails

### Phase

Phase 60 - Backup Operator UI Guardrails

### Viec da lam

- Tao `docs/60_BACKUP_OPERATOR_UI_GUARDRAILS.md`.
- Tao `scripts/check-backup-operator-ui-guardrails.cjs`.
- Them `npm run check:backup-operator-ui-guardrails`.
- Guardrail scan `app/(admin)/admin/backups`, `components/admin`, `app/api/admin/backups`, `server/services/backup-service-client.ts`.
- Khoa worker URL, hardcoded token/key, direct wrangler, direct Cloudflare/Supabase/Google API, production backup, storage upload, restore va cron/schedule.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/60_BACKUP_OPERATOR_UI_GUARDRAILS.md
- scripts/check-backup-operator-ui-guardrails.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong goi backup service worker that.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong tao cron/schedule.

## 2026-06-18 - Phase 59 Backup Operator UI Dry-Run Panel

### Phase

Phase 59 - Backup Operator UI Dry-Run Panel

### Viec da lam

- Tao `app/(admin)/admin/backups/page.tsx`.
- Tao `components/admin/backup-operator-dry-run-panel.tsx`.
- Them link `/admin/backups` vao dashboard admin.
- Tao `docs/59_BACKUP_OPERATOR_UI_DRY_RUN_PANEL.md`.
- Tao `scripts/check-backup-operator-ui-dry-run-panel.cjs`.
- Them `npm run check:backup-operator-ui-dry-run-panel`.
- UI chi goi route noi bo `/api/admin/backups/service-dry-run`.
- UI hien ro `Dry-run only`, `No production backup`, `No storage upload`, `No restore`, `No real worker call`.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- app/(admin)/admin/backups/page.tsx
- app/(admin)/admin/page.tsx
- components/admin/backup-operator-dry-run-panel.tsx
- docs/59_BACKUP_OPERATOR_UI_DRY_RUN_PANEL.md
- scripts/check-backup-operator-ui-dry-run-panel.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong goi backup service worker that.
- Khong hardcode worker URL/token/key.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong tao/upload backup production that.
- Khong restore production.

## 2026-06-18 - Phase 58 Backup Operator API Dry-Run Route

### Phase

Phase 58 - Backup Operator API Dry-Run Route

### Viec da lam

- Tao `app/api/admin/backups/service-dry-run/route.ts`.
- Tao `docs/58_BACKUP_OPERATOR_API_DRY_RUN_ROUTE.md`.
- Tao `scripts/check-backup-operator-api-dry-run-route.cjs`.
- Them `npm run check:backup-operator-api-dry-run-route`.
- Route tra dry-run envelope voi `worker_call: false`, `production_backup: false`, `storage_upload: false`, `restore: false`.
- Ghi ro auth/permission hardening can phase rieng vi phase nay khong goi DB/network.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- app/api/admin/backups/service-dry-run/route.ts
- docs/58_BACKUP_OPERATOR_API_DRY_RUN_ROUTE.md
- scripts/check-backup-operator-api-dry-run-route.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong goi backup service worker that.
- Khong goi network/API/DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong tao/upload backup production that.
- Khong restore production.

## 2026-06-18 - Phase 57 Main App Binding Dry-Run Handoff

### Phase

Phase 57 - Main App Binding Dry-Run Handoff

### Viec da lam

- Tao `docs/57_MAIN_APP_BINDING_DRY_RUN_HANDOFF.md`.
- Tao `scripts/check-main-app-binding-dry-run-handoff.cjs`.
- Them `npm run check:main-app-binding-dry-run-handoff`.
- Tong hop Phase 53-57: adapter, guardrail, operator API contract va binding smoke.
- Ghi ro main app binding van dry-run-only, chua co route runtime, chua co real worker call.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/57_MAIN_APP_BINDING_DRY_RUN_HANDOFF.md
- scripts/check-main-app-binding-dry-run-handoff.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong tao route runtime.
- Khong goi backup service worker that.
- Khong goi network/API/DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong deploy.
- Khong push.
- Khong tao/upload backup production that.
- Khong restore production.

## 2026-06-18 - Phase 56 Main App Backup Service Binding Smoke

### Phase

Phase 56 - Main App Backup Service Binding Smoke

### Viec da lam

- Hoan tat smoke static/local cho main app backup service binding dry-run.
- Bo sung `scripts/check-main-app-backup-service-binding-smoke.cjs`.
- Xac nhan `npm run smoke:main-app-backup-service-binding` chi doc source files trong repo.
- Xac nhan smoke/check khong doc `.env.local`, `.dev.vars`, khong doc env va khong goi network/API/DB.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/56_MAIN_APP_BACKUP_SERVICE_BINDING_SMOKE.md
- scripts/smoke-main-app-backup-service-binding.cjs
- scripts/check-main-app-backup-service-binding-smoke.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Phase 56 da co commit truoc do `45061e1 push` chua day du checker/docs handoff.
- Task hien tai hoan tat phan con thieu, khong rewrite lich su Git.
- Khong goi backup service worker that.
- Khong goi network/API/DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong tao/upload backup production that.
- Khong restore production.

## 2026-06-17 - Phase 55 Backup Operator API Dry-Run Contract

### Phase

Phase 55 - Backup Operator API Dry-Run Contract

### Viec da lam

- Tao `docs/55_BACKUP_OPERATOR_API_DRY_RUN_CONTRACT.md`.
- Tao `scripts/check-backup-operator-api-dry-run-contract.cjs`.
- Them `npm run check:backup-operator-api-dry-run-contract`.
- Ghi proposed route `app/api/admin/backups/service-dry-run/route.ts`.
- Chon docs/check-only vi repo chua co pattern `app/api/admin` auth/permission route ro rang.
- Checker se validate route marker/guardrail neu route duoc tao trong phase sau.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-backup-operator-api-dry-run-contract.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/55_BACKUP_OPERATOR_API_DRY_RUN_CONTRACT.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong tao route runtime trong Phase 55.
- Khong goi backup service worker that.
- Khong goi network/API/DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong tao/upload backup production that.
- Khong restore production.

## 2026-06-17 - Phase 54 Backup Service Binding Guardrail Checks

### Phase

Phase 54 - Backup Service Binding Guardrail Checks

### Viec da lam

- Tao `docs/54_BACKUP_SERVICE_BINDING_GUARDRAIL_CHECKS.md`.
- Tao `scripts/check-backup-service-binding-guardrails.cjs`.
- Them `npm run check:backup-service-binding-guardrails`.
- Guardrail scan cac vung `server/`, `app/`, `components/`, `lib/`, `services/` neu ton tai.
- Khoa cac pattern nguy hiem: hardcoded token, backup service workers.dev URL, `.env.local`, `.dev.vars`, real backup/storage/restore trigger.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-backup-service-binding-guardrails.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/54_BACKUP_SERVICE_BINDING_GUARDRAIL_CHECKS.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong goi backup service worker that.
- Khong goi network/API/DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong hardcode URL/token/key.
- Khong tao/upload backup production that.
- Khong restore production.

## 2026-06-17 - Phase 53 Main App Backup Service Client Dry-Run Adapter

### Phase

Phase 53 - Main App Backup Service Client Dry-Run Adapter

### Viec da lam

- Tao `server/services/backup-service-client.ts`.
- Tao `docs/53_MAIN_APP_BACKUP_SERVICE_CLIENT_DRY_RUN_ADAPTER.md`.
- Tao `scripts/check-main-app-backup-service-client-dry-run-adapter.cjs`.
- Them `npm run check:main-app-backup-service-client-dry-run-adapter`.
- Adapter co marker `MAIN_APP_BACKUP_SERVICE_CLIENT_DRY_RUN_ONLY`.
- Adapter chi mo phong `health`, `dryRun`, `fixtureVerify` va tra local response envelope.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- server/services/backup-service-client.ts
- package.json
- scripts/check-main-app-backup-service-client-dry-run-adapter.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/53_MAIN_APP_BACKUP_SERVICE_CLIENT_DRY_RUN_ADAPTER.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong goi backup service worker that.
- Khong goi network/API/DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong hardcode URL/token/key.
- Khong tao/upload backup production that.
- Khong restore production.

## 2026-06-17 - Phase 52 Backup Service Worker Pre-Deploy Handoff

### Phase

Phase 52 - Backup Service Worker Pre-Deploy Handoff

### Viec da lam

- Tao `docs/52_BACKUP_SERVICE_WORKER_PRE_DEPLOY_HANDOFF.md`.
- Tao `scripts/check-backup-service-worker-pre-deploy-handoff.cjs`.
- Them `npm run check:backup-service-worker-pre-deploy-handoff`.
- Tong hop Phase 48-52: workflow readiness, manual deploy runbook, secrets preflight, approval gate va pre-deploy status.
- Ghi required commands, required secrets, required owner approval, what is ready, what is still blocked, boundary va known notes.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-backup-service-worker-pre-deploy-handoff.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/52_BACKUP_SERVICE_WORKER_PRE_DEPLOY_HANDOFF.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy worker.
- Khong push remote.
- Khong doc/tao secret that.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi GitHub/Cloudflare/Supabase/Google API.
- Khong tao/upload backup production that.
- Khong restore production.

## 2026-06-17 - Phase 51 Backup Service Worker Deploy Approval Gate

### Phase

Phase 51 - Backup Service Worker Deploy Approval Gate

### Viec da lam

- Tao `docs/51_BACKUP_SERVICE_WORKER_DEPLOY_APPROVAL_GATE.md`.
- Tao `scripts/check-backup-service-worker-deploy-approval-gate.cjs`.
- Them `npm run check:backup-service-worker-deploy-approval-gate`.
- Ghi `OWNER_APPROVAL_REQUIRED_BEFORE_REAL_DEPLOY=true`.
- Ghi approval checklist, required validation, required secrets, rollback owner, smoke owner, deployment window va no-go conditions.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-backup-service-worker-deploy-approval-gate.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/51_BACKUP_SERVICE_WORKER_DEPLOY_APPROVAL_GATE.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy worker.
- Khong doc/tao secret that.
- Khong goi API.
- Approval statement la yeu cau bat buoc, khong phai owner da approve.
- Khong tao/upload backup production that.

## 2026-06-17 - Phase 50 Backup Service Worker Secrets Preflight Checklist

### Phase

Phase 50 - Backup Service Worker Secrets Preflight Checklist

### Viec da lam

- Tao `docs/50_BACKUP_SERVICE_WORKER_SECRETS_PREFLIGHT_CHECKLIST.md`.
- Tao `scripts/check-backup-service-worker-secrets-preflight-checklist.cjs`.
- Them `npm run check:backup-service-worker-secrets-preflight-checklist`.
- Ghi required placeholders: `BACKUP_SERVICE_INTERNAL_TOKEN`, `BACKUP_SERVICE_SMOKE_BASE_URL`, `BACKUP_SERVICE_SMOKE_TOKEN`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
- Ghi secret ownership, rotation, verification without printing values, no-secret-logging policy va no-go conditions.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-backup-service-worker-secrets-preflight-checklist.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/50_BACKUP_SERVICE_WORKER_SECRETS_PREFLIGHT_CHECKLIST.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong doc secret that.
- Khong tao secret that.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi GitHub/Cloudflare API.
- Khong deploy worker.
- Khong tao/upload backup production that.

## 2026-06-17 - Phase 49 Backup Service Worker Manual Deploy Runbook

### Phase

Phase 49 - Backup Service Worker Manual Deploy Runbook

### Viec da lam

- Tao `docs/49_BACKUP_SERVICE_WORKER_MANUAL_DEPLOY_RUNBOOK.md`.
- Tao `scripts/check-backup-service-worker-manual-deploy-runbook.cjs`.
- Them `npm run check:backup-service-worker-manual-deploy-runbook`.
- Ghi pre-deploy checklist, required secrets/vars, local validation commands, manual deploy command placeholders, post-deploy smoke, rollback va failure handling.
- Ghi ro `npx wrangler secret put BACKUP_SERVICE_INTERNAL_TOKEN` va `npx wrangler deploy` chi la future commands, khong chay trong Phase 49.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-backup-service-worker-manual-deploy-runbook.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/49_BACKUP_SERVICE_WORKER_MANUAL_DEPLOY_RUNBOOK.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong chay `wrangler secret put`.
- Khong chay `wrangler deploy`.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Cloudflare/Supabase/Google API.
- Khong tao/upload backup production that.
- Khong restore production.

## 2026-06-17 - Phase 48 Backup Service Worker GitHub Actions Deploy Workflow Readiness

### Phase

Phase 48 - Backup Service Worker GitHub Actions Deploy Workflow Readiness

### Viec da lam

- Tao `.github/workflows/backup-service-deploy.yml`.
- Tao `docs/48_BACKUP_SERVICE_WORKER_GITHUB_ACTIONS_DEPLOY_WORKFLOW_READINESS.md`.
- Tao `scripts/check-backup-service-worker-github-actions-deploy-readiness.cjs`.
- Them `npm run check:backup-service-worker-github-actions-deploy-readiness`.
- Workflow chi co `workflow_dispatch`, khong co `push`, `pull_request`, `schedule`.
- Workflow co readiness checks truoc deploy step va deploy step chi scoped vao `services/backup-service`.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- .github/workflows/backup-service-deploy.yml
- package.json
- scripts/check-backup-service-worker-github-actions-deploy-readiness.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/48_BACKUP_SERVICE_WORKER_GITHUB_ACTIONS_DEPLOY_WORKFLOW_READINESS.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong chay workflow.
- Khong deploy worker tu local.
- Khong push remote.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Cloudflare/Supabase/Google API.
- Khong hardcode secret/token/key.

## 2026-06-17 - Phase 47 Backup Service Worker Deploy Readiness Handoff

### Phase

Phase 47 - Backup Service Worker Deploy Readiness Handoff

### Viec da lam

- Tao `docs/47_BACKUP_SERVICE_WORKER_DEPLOY_READINESS_HANDOFF.md`.
- Tao `scripts/check-backup-service-worker-deploy-readiness-handoff.cjs`.
- Them `npm run check:backup-service-worker-deploy-readiness-handoff`.
- Tong hop Phase 43-47: deploy readiness gate, env/secret contract, post-deploy smoke plan, main app binding contract va handoff.
- Ghi service files, endpoints, auth/env placeholders, deploy readiness status, post-deploy smoke readiness, binding contract status, approvals/secrets can co truoc deploy va known notes.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-backup-service-worker-deploy-readiness-handoff.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/47_BACKUP_SERVICE_WORKER_DEPLOY_READINESS_HANDOFF.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy worker.
- Khong push remote.
- Khong them route production.
- Khong them secret that.
- Khong sua main app runtime.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong tao/upload backup production that.
- Khong restore production.

## 2026-06-17 - Phase 46 Backup Service Worker Main App Binding Contract

### Phase

Phase 46 - Backup Service Worker Main App Binding Contract

### Viec da lam

- Tao `docs/46_BACKUP_SERVICE_WORKER_MAIN_APP_BINDING_CONTRACT.md`.
- Tao `scripts/check-backup-service-worker-main-app-binding-contract.cjs`.
- Them `npm run check:backup-service-worker-main-app-binding-contract`.
- Ghi hai huong tich hop tuong lai: Cloudflare service binding hoac internal URL + Bearer token.
- Ghi auth header contract, request/response envelope, error mapping, timeout/retry/logging policy va permission boundary.
- Ghi future implementation checklist nhung khong sua main app runtime.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-backup-service-worker-main-app-binding-contract.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/46_BACKUP_SERVICE_WORKER_MAIN_APP_BINDING_CONTRACT.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong sua main app runtime.
- Khong them binding that.
- Khong them internal URL/token that.
- Khong deploy worker.
- Khong goi service that.
- Khong tao/upload backup production that.
- Khong restore production.

## 2026-06-17 - Phase 45 Backup Service Worker Post-Deploy Smoke Plan

### Phase

Phase 45 - Backup Service Worker Post-Deploy Smoke Plan

### Viec da lam

- Tao `docs/45_BACKUP_SERVICE_WORKER_POST_DEPLOY_SMOKE_PLAN.md`.
- Tao `scripts/check-backup-service-worker-post-deploy-smoke-plan.cjs`.
- Tao `scripts/smoke-backup-service-worker-post-deploy.cjs`.
- Them `npm run check:backup-service-worker-post-deploy-smoke-plan`.
- Them `npm run smoke:backup-service-worker:post-deploy`.
- Smoke script co marker `POST_DEPLOY_SMOKE_ONLY` va safe skip khi thieu `BACKUP_SERVICE_SMOKE_BASE_URL`.
- Noi ro neu thieu `BACKUP_SERVICE_SMOKE_TOKEN` thi chi `/health` duoc chay, internal endpoint bi skip.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-backup-service-worker-post-deploy-smoke-plan.cjs
- scripts/smoke-backup-service-worker-post-deploy.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/45_BACKUP_SERVICE_WORKER_POST_DEPLOY_SMOKE_PLAN.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy worker.
- Khong hardcode URL.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network vi khong co `BACKUP_SERVICE_SMOKE_BASE_URL` explicit.
- Khong in token.
- Khong tao/upload backup production that.
- Khong restore production.

## 2026-06-17 - Phase 44 Backup Service Worker Env Secret Contract

### Phase

Phase 44 - Backup Service Worker Env & Secret Contract Runbook

### Viec da lam

- Tao `docs/44_BACKUP_SERVICE_WORKER_ENV_SECRET_CONTRACT.md`.
- Tao `scripts/check-backup-service-worker-env-secret-contract.cjs`.
- Them `npm run check:backup-service-worker-env-secret-contract`.
- Ghi required secret placeholder `BACKUP_SERVICE_INTERNAL_TOKEN`.
- Ghi optional placeholders `BACKUP_STORAGE_PROVIDER`, `BACKUP_STORAGE_DRY_RUN`, `BACKUP_STORAGE_PREFIX`, `BACKUP_RETENTION_POLICY`.
- Ghi provisioning checklist, rotation checklist, local/CI boundary, logging safety va no-secret-in-docs policy.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-backup-service-worker-env-secret-contract.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/44_BACKUP_SERVICE_WORKER_ENV_SECRET_CONTRACT.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong tao secret that.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Wrangler/API.
- Khong deploy worker.
- Khong goi network/API/DB.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.

## 2026-06-17 - Phase 43 Backup Service Worker Deploy Readiness Gate

### Phase

Phase 43 - Backup Service Worker Deploy Readiness Gate

### Viec da lam

- Tao `docs/43_BACKUP_SERVICE_WORKER_DEPLOY_READINESS_GATE.md`.
- Tao `scripts/check-backup-service-worker-deploy-readiness.cjs`.
- Them `npm run check:backup-service-worker-deploy-readiness`.
- Khoa deploy readiness bang static checks: source, wrangler config, endpoints, auth placeholder, JSON envelope va secret safety.
- Ghi future deploy command placeholder nhung noi ro khong chay trong Phase 43.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-backup-service-worker-deploy-readiness.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/43_BACKUP_SERVICE_WORKER_DEPLOY_READINESS_GATE.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy worker.
- Khong them route production.
- Khong them deploy workflow.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.

## 2026-06-17 - Phase 42 Worker Split Backup Readiness Handoff

### Phase

Phase 42 - Worker Split Backup Readiness Handoff

### Viec da lam

- Tao `docs/42_WORKER_SPLIT_BACKUP_READINESS_HANDOFF.md`.
- Tao `scripts/check-worker-split-backup-readiness-handoff.cjs`.
- Them `npm run check:worker-split-backup-readiness-handoff`.
- Tong hop Phase 37-42: repository hygiene, backup service worker boundary, scaffold, contract checks va integration readiness.
- Ghi service files, worker endpoints, checks available, what is implemented/not implemented, deployment boundary, secret boundary va production backup boundary.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-worker-split-backup-readiness-handoff.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/42_WORKER_SPLIT_BACKUP_READINESS_HANDOFF.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy worker.
- Khong push remote.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong tich hop main app that.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.

## 2026-06-17 - Phase 41 Backup Service Worker Integration Readiness

### Phase

Phase 41 - Backup Service Worker Integration Readiness

### Viec da lam

- Tao `docs/41_BACKUP_SERVICE_WORKER_INTEGRATION_READINESS.md`.
- Tao `scripts/check-backup-service-worker-integration-readiness.cjs`.
- Them `npm run check:backup-service-worker-integration-readiness`.
- Ghi future integration options: Cloudflare service binding hoac internal URL + Bearer token.
- Ghi request/response envelope, error mapping, timeout/retry/logging policy va no-production-call policy.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-backup-service-worker-integration-readiness.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/41_BACKUP_SERVICE_WORKER_INTEGRATION_READINESS.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong tich hop main app that.
- Khong them service binding/env thật.
- Khong deploy worker.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong tao/upload backup production that.
- Khong restore production.

## 2026-06-17 - Phase 40 Backup Service Worker Local Contract Checks

### Phase

Phase 40 - Backup Service Worker Local Contract Checks

### Viec da lam

- Tao `docs/40_BACKUP_SERVICE_WORKER_LOCAL_CONTRACT_CHECKS.md`.
- Tao `scripts/check-backup-service-worker-local-contract.cjs`.
- Tao `scripts/smoke-backup-service-worker-contract.cjs`.
- Them `npm run check:backup-service-worker-local-contract`.
- Them `npm run smoke:backup-service-worker:contract`.
- Static/source contract check xac nhan health route, internal routes, bearer auth, 401, JSON envelope va dry-run marker.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-backup-service-worker-local-contract.cjs
- scripts/smoke-backup-service-worker-contract.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/40_BACKUP_SERVICE_WORKER_LOCAL_CONTRACT_CHECKS.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy worker.
- Khong runtime smoke Cloudflare.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.

## 2026-06-17 - Phase 39 Backup Service Worker Scaffold

### Phase

Phase 39 - Backup Service Worker Scaffold

### Viec da lam

- Tao `services/backup-service/src/index.ts`.
- Tao `services/backup-service/wrangler.jsonc`.
- Tao `services/backup-service/README.md`.
- Tao `docs/39_BACKUP_SERVICE_WORKER_SCAFFOLD.md`.
- Tao `scripts/check-backup-service-worker-scaffold.cjs`.
- Them `npm run check:backup-service-worker-scaffold`.
- Worker scaffold co `GET /health`, `POST /internal/backup/dry-run`, `POST /internal/backup/fixture-verify`, JSON envelope va bearer auth placeholder cho internal routes.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- services/backup-service/src/index.ts
- services/backup-service/wrangler.jsonc
- services/backup-service/README.md
- scripts/check-backup-service-worker-scaffold.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/39_BACKUP_SERVICE_WORKER_SCAFFOLD.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy worker.
- Khong tich hop main app that.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.

## 2026-06-17 - Phase 38 Backup Service Worker Boundary Design

### Phase

Phase 38 - Backup Service Worker Boundary Design

### Viec da lam

- Tao `docs/38_BACKUP_SERVICE_WORKER_BOUNDARY_DESIGN.md`.
- Tao `scripts/check-backup-service-worker-boundary-design.cjs`.
- Them `npm run check:backup-service-worker-boundary-design`.
- Thiet ke service path `services/backup-service/`, endpoints `GET /health`, `POST /internal/backup/dry-run`, `POST /internal/backup/fixture-verify`.
- Ghi auth placeholder `Authorization: Bearer BACKUP_SERVICE_INTERNAL_TOKEN`, JSON envelope, logging policy va no-production-backup boundary.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-backup-service-worker-boundary-design.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/38_BACKUP_SERVICE_WORKER_BOUNDARY_DESIGN.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Chua scaffold worker code that.
- Khong deploy lai.
- Khong push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.

## 2026-06-17 - Phase 37 Repository Hygiene GitHub Menu Review

### Phase

Phase 37 - Repository Hygiene & GitHub Menu Script Review

### Viec da lam

- Review dirty state cua `GIA_PHA_GITHUB_MENU.bat`.
- Xac nhan `git diff -- GIA_PHA_GITHUB_MENU.bat` khong co content diff, chi co line-ending warning.
- Chon decision `REVERT_TO_HEAD` va restore file ve HEAD.
- Tao `docs/37_REPOSITORY_HYGIENE_GITHUB_MENU_REVIEW.md`.
- Tao `scripts/check-repository-hygiene-github-menu-review.cjs`.
- Them `npm run check:repository-hygiene-github-menu-review`.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-repository-hygiene-github-menu-review.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/37_REPOSITORY_HYGIENE_GITHUB_MENU_REVIEW.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- `GIA_PHA_GITHUB_MENU.bat` da restore ve HEAD, khong commit noi dung .bat.
- Khong deploy lai.
- Khong push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.

## 2026-06-17 - Phase 36 Production Backup Approval Checklist

### Phase

Phase 36 - Production Backup Approval Checklist

### Viec da lam

- Tao `docs/36_PRODUCTION_BACKUP_APPROVAL_CHECKLIST.md`.
- Tao `scripts/check-production-backup-approval-checklist.cjs`.
- Them `npm run check:production-backup-approval-checklist`.
- Ghi required approvals, storage target decision, secret handling, privacy, retention, restore drill, operator checklist va explicit no-go conditions.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-production-backup-approval-checklist.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/36_PRODUCTION_BACKUP_APPROVAL_CHECKLIST.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy lai.
- Khong push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong tao bucket/folder/storage that.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong bat cron/schedule.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

## 2026-06-17 - Phase 35 Storage Upload Verification Dry-Run

### Phase

Phase 35 - Storage Upload Verification Dry-Run

### Viec da lam

- Tao `docs/35_STORAGE_UPLOAD_VERIFICATION_DRY_RUN.md`.
- Tao `scripts/verify-storage-upload-dry-run.cjs`.
- Tao `scripts/check-storage-upload-verification-dry-run.cjs`.
- Them `npm run backup:storage:verify-upload:dry-run`.
- Them `npm run check:storage-upload-verification-dry-run`.
- Verify artifact trong `fixtures/backup-sandbox/adapter/` bang manifest/checksum/fixture marker/secret scan.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/verify-storage-upload-dry-run.cjs
- scripts/check-storage-upload-verification-dry-run.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/35_STORAGE_UPLOAD_VERIFICATION_DRY_RUN.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy lai.
- Khong push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong upload cloud.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

## 2026-06-17 - Phase 34 Local Sandbox Storage Adapter Prototype

### Phase

Phase 34 - Local Sandbox Storage Adapter Prototype

### Viec da lam

- Tao `docs/34_LOCAL_SANDBOX_STORAGE_ADAPTER_PROTOTYPE.md`.
- Tao `scripts/local-sandbox-storage-adapter.cjs`.
- Tao `scripts/check-local-sandbox-storage-adapter-prototype.cjs`.
- Them `npm run backup:storage:adapter:local`.
- Them `npm run check:local-sandbox-storage-adapter-prototype`.
- Adapter local copy fixture/manifest vao `fixtures/backup-sandbox/adapter/`, tao index, list metadata va verify checksum.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/local-sandbox-storage-adapter.cjs
- scripts/check-local-sandbox-storage-adapter-prototype.cjs
- fixtures/backup-sandbox/adapter/
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/34_LOCAL_SANDBOX_STORAGE_ADAPTER_PROTOTYPE.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy lai.
- Khong push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong upload cloud.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

## 2026-06-17 - Phase 33 Storage Adapter Contract Guardrails

### Phase

Phase 33 - Storage Adapter Contract & Safety Guardrails

### Viec da lam

- Tao `docs/33_STORAGE_ADAPTER_CONTRACT_GUARDRAILS.md`.
- Tao `scripts/backup-storage-adapter-contract.cjs`.
- Tao `scripts/check-storage-adapter-contract-guardrails.cjs`.
- Them `npm run backup:storage:contract`.
- Them `npm run check:storage-adapter-contract-guardrails`.
- Dinh nghia adapter methods, manifest requirements, upload/verify/list/delete safety contract va no-network policy.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/backup-storage-adapter-contract.cjs
- scripts/check-storage-adapter-contract-guardrails.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/33_STORAGE_ADAPTER_CONTRACT_GUARDRAILS.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy lai.
- Khong push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong dung provider SDK.
- Khong tao/upload backup production that.
- Khong delete backup production.
- Khong restore production.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

## 2026-06-17 - Phase 32 Sandbox Storage Target Selection

### Phase

Phase 32 - Sandbox Storage Target Selection

### Viec da lam

- Tao `docs/32_SANDBOX_STORAGE_TARGET_SELECTION.md`.
- Tao `scripts/check-sandbox-storage-target-selection.cjs`.
- Them `npm run check:sandbox-storage-target-selection`.
- So sanh Cloudflare R2, Google Drive, Supabase Storage, Local/NAS/offline operator storage va Manual encrypted offline backup.
- Recommend sandbox/prototype tiep tuc local sandbox; production storage target chua chot va can approval rieng.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-sandbox-storage-target-selection.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/32_SANDBOX_STORAGE_TARGET_SELECTION.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy lai.
- Khong push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong tao bucket/folder/storage that.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

## 2026-06-17 - Phase 31 Backup Readiness Handoff

### Phase

Phase 31 - Backup Readiness Handoff Consolidation

### Viec da lam

- Tao `docs/31_BACKUP_READINESS_HANDOFF.md`.
- Tao `scripts/check-backup-readiness-handoff.cjs`.
- Them `npm run check:backup-readiness-handoff`.
- Tong hop baseline Phase 18-31, command local, CI workflow, fixture files, safe scope va nhung viec van chua phai production backup.
- Ghi ro next phase de xuat va boundary khong deploy/push/network/secret/restore/schedule.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-backup-readiness-handoff.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/31_BACKUP_READINESS_HANDOFF.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy lai.
- Khong push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong bat cron/schedule.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

## 2026-06-17 - Phase 30 Restore Drill Report Generator

### Phase

Phase 30 - Restore Drill Report Generator

### Viec da lam

- Tao `docs/30_RESTORE_DRILL_REPORT_GENERATOR.md`.
- Tao `scripts/generate-restore-drill-report.cjs`.
- Tao `scripts/check-restore-drill-report-generator.cjs`.
- Them `npm run restore:drill:report`.
- Them `npm run check:restore-drill-report-generator`.
- Report generator doc fixture va manifest sample, validate manifest/graph/privacy/secret scan va tao report fixture JSON.
- Report ghi `noProductionMutation: true` va `restoreExecution: SKIPPED`.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/generate-restore-drill-report.cjs
- scripts/check-restore-drill-report-generator.cjs
- fixtures/backup/reports/
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/30_RESTORE_DRILL_REPORT_GENERATOR.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy lai.
- Khong push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

## 2026-06-17 - Phase 29 Backup Artifact Retention Policy Gate

### Phase

Phase 29 - Backup Artifact Retention Policy Gate

### Viec da lam

- Tao `docs/29_BACKUP_ARTIFACT_RETENTION_POLICY_GATE.md`.
- Tao `scripts/backup-retention-policy-check.cjs`.
- Tao `scripts/check-backup-artifact-retention-policy-gate.cjs`.
- Them `npm run backup:retention:check`.
- Them `npm run check:backup-artifact-retention-policy-gate`.
- Retention gate validate weekly keep 8, monthly keep 12, pre-deploy release marker, newest unverified guard va invalid manifest guard.
- Script chi tinh policy tren fixture/sandbox metadata, khong xoa file va khong cham production.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/backup-retention-policy-check.cjs
- scripts/check-backup-artifact-retention-policy-gate.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/29_BACKUP_ARTIFACT_RETENTION_POLICY_GATE.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy lai.
- Khong push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong xoa backup production that.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

## 2026-06-17 - Phase 28 Local Sandbox Backup Storage Simulation

### Phase

Phase 28 - Local Sandbox Backup Storage Simulation

### Viec da lam

- Tao `docs/28_LOCAL_SANDBOX_BACKUP_STORAGE_SIMULATION.md`.
- Tao `scripts/backup-storage-sandbox-simulate.cjs`.
- Tao `scripts/check-local-sandbox-backup-storage-simulation.cjs`.
- Them `npm run backup:storage:sandbox`.
- Them `npm run check:local-sandbox-backup-storage-simulation`.
- Sandbox script copy fixture va manifest mau vao `fixtures/backup-sandbox/` va tao `storage-index.fixture.json`.
- Sandbox chi local fixture data, khong cloud storage, khong network/API/DB, khong upload/restore that.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/backup-storage-sandbox-simulate.cjs
- scripts/check-local-sandbox-backup-storage-simulation.cjs
- fixtures/backup-sandbox/
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/28_LOCAL_SANDBOX_BACKUP_STORAGE_SIMULATION.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy lai.
- Khong push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong dung cloud storage that.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

## 2026-06-17 - Phase 27 Backup CI Gate Integration

### Phase

Phase 27 - Backup CI Gate Integration

### Viec da lam

- Tao `docs/27_BACKUP_CI_GATE_INTEGRATION.md`.
- Tao `.github/workflows/backup-readiness.yml`.
- Tao `scripts/check-backup-ci-gate-integration.cjs`.
- Them `npm run check:backup-ci-gate-integration`.
- Workflow chi chay `pull_request` va `workflow_dispatch`.
- Workflow chi chay local backup readiness commands, khong dung `secrets.*`, khong schedule, khong deploy va khong upload/restore.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- .github/workflows/backup-readiness.yml
- scripts/check-backup-ci-gate-integration.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/27_BACKUP_CI_GATE_INTEGRATION.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy lai.
- Khong push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong dung GitHub secrets trong workflow moi.
- Khong them `schedule:`.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

## 2026-06-17 - Phase 26 Backup Pipeline Readiness Gate

### Phase

Phase 26 - Backup Pipeline Readiness Gate

### Viec da lam

- Tao `docs/26_BACKUP_PIPELINE_READINESS_GATE.md`.
- Tao `scripts/backup-pipeline-readiness.cjs`.
- Tao `scripts/check-backup-pipeline-readiness-gate.cjs`.
- Them `npm run backup:pipeline:readiness`.
- Them `npm run check:backup-pipeline-readiness-gate`.
- Pipeline gate chay `backup:dry-run`, `backup:fixture:generate`, `backup:fixture:verify`, `restore:dry-run` theo thu tu.
- Gate chi local readiness, khong tao job/cron, khong upload backup va khong restore that.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/backup-pipeline-readiness.cjs
- scripts/check-backup-pipeline-readiness-gate.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/26_BACKUP_PIPELINE_READINESS_GATE.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy lai.
- Khong push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong dung du lieu gia pha that.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

## 2026-06-17 - Phase 25 Restore Dry-Run Validator

### Phase

Phase 25 - Restore Dry-Run Validator

### Viec da lam

- Tao `docs/25_RESTORE_DRY_RUN_VALIDATOR.md`.
- Tao `scripts/restore-dry-run-validate.cjs`.
- Tao `scripts/check-restore-dry-run-validator.cjs`.
- Them `npm run restore:dry-run`.
- Them `npm run check:restore-dry-run-validator`.
- Validator doc fixture va manifest sample, kiem manifest integrity, graph, privacy flags va secret scan.
- Restore execution duoc danh dau `SKIPPED`, khong co restore that.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/restore-dry-run-validate.cjs
- scripts/check-restore-dry-run-validator.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/25_RESTORE_DRY_RUN_VALIDATOR.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy lai.
- Khong push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong dung du lieu gia pha that.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

## 2026-06-17 - Phase 24 Backup Manifest Integrity Checker

### Phase

Phase 24 - Backup Manifest & Integrity Checker

### Viec da lam

- Tao `docs/24_BACKUP_MANIFEST_INTEGRITY_CHECKER.md`.
- Tao `scripts/verify-sample-backup-integrity.cjs`.
- Tao `scripts/check-backup-manifest-integrity.cjs`.
- Them `npm run backup:fixture:verify`.
- Them `npm run check:backup-manifest-integrity`.
- Verify command doc fixture va manifest sample, validate shape/count/flag va tinh lai checksum SHA-256.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/verify-sample-backup-integrity.cjs
- scripts/check-backup-manifest-integrity.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/24_BACKUP_MANIFEST_INTEGRITY_CHECKER.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy lai.
- Khong push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong dung du lieu gia pha that.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

## 2026-06-17 - Phase 23 Sample Fixture Backup Generator

### Phase

Phase 23 - Sample Fixture Backup Generator

### Viec da lam

- Tao `docs/23_SAMPLE_FIXTURE_BACKUP_GENERATOR.md`.
- Tao `scripts/generate-sample-backup-fixture.cjs`.
- Tao `scripts/check-sample-fixture-backup-generator.cjs`.
- Them `npm run backup:fixture:generate`.
- Them `npm run check:sample-fixture-backup-generator`.
- Generator tao fixture JSON va manifest JSON trong `fixtures/backup/` bang static sample data.
- Fixture danh dau `environment: fixture`, `contains_real_data: false`, `contains_secret: false`.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/generate-sample-backup-fixture.cjs
- scripts/check-sample-fixture-backup-generator.cjs
- fixtures/backup/sample-family.fixture.json
- fixtures/backup/sample-family.manifest.fixture.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/23_SAMPLE_FIXTURE_BACKUP_GENERATOR.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy lai.
- Khong push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong dung du lieu gia pha that.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

## 2026-06-17 - Phase 22 Backup Dry-Run Command Design

### Phase

Phase 22 - Backup Dry-Run Command Design

### Viec da lam

- Tao `docs/22_BACKUP_DRY_RUN_COMMAND_DESIGN.md`.
- Tao `scripts/backup-dry-run.cjs` dung mock/static data trong bo nho.
- Tao `scripts/check-backup-dry-run-command-design.cjs`.
- Them `npm run check:backup-dry-run-command-design`.
- Them `npm run backup:dry-run`.
- Dry-run validate manifest shape, naming convention, secret pattern scan va restore compatibility checklist.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/backup-dry-run.cjs
- scripts/check-backup-dry-run-command-design.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/22_BACKUP_DRY_RUN_COMMAND_DESIGN.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy lai.
- Khong push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong tao backup/export that.
- Khong upload file.
- Khong restore production.
- Khong tao scheduled job/cron that.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

## 2026-06-17 - Phase 21 Automated Backup Job Design

### Phase

Phase 21 - Automated Backup Job Design

### Viec da lam

- Tao `docs/21_AUTOMATED_BACKUP_JOB_DESIGN.md`.
- Ghi production baseline hien tai: Worker, production URL, workflow deploy, Phase 16/17/18/19/20 status va known notes.
- Ghi design goal: chi thiet ke automated backup job, khong bat job/cron that, khong tao/upload backup that, khong restore that.
- Ghi candidate architecture: GitHub Actions scheduled workflow, Cloudflare Worker Cron Trigger, manual operator-triggered backup, Supabase/manual export flow va external storage later.
- Ghi recommended safe architecture theo tung stage tu manual checklist den dry-run, storage sandbox va scheduled job disabled-by-default.
- Ghi trigger/output/storage/retention design.
- Ghi security and privacy guardrails, job failure handling, restore compatibility requirement va future implementation stages.
- Ghi configuration variables design bang placeholder an toan, khong cap nhat `.env.local`.
- Tao `scripts/check-automated-backup-job-design.cjs`.
- Them `npm run check:automated-backup-job-design`.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-automated-backup-job-design.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/21_AUTOMATED_BACKUP_JOB_DESIGN.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy lai.
- Khong push.
- Khong sua schema.
- Khong chay migration.
- Khong sua du lieu that.
- Khong tao scheduled job/cron that.
- Khong tao/upload backup/export that.
- Khong restore production.
- Khong doi domain/Auth/OAuth config that.
- Khong hardcode secret/token/key.
- Khong commit `.env.local`, `.dev.vars` hoac backup/export du lieu that.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

## 2026-06-17 - Phase 20 Custom Domain Cutover Readiness

### Phase

Phase 20 - Custom Domain Cutover Readiness

### Viec da lam

- Tao `docs/20_CUSTOM_DOMAIN_CUTOVER_READINESS.md`.
- Ghi production baseline hien tai: Worker, workers.dev URL, workflow deploy, wrangler config, Phase 16/17/18/19 status va known issues.
- Ghi candidate custom domain la `<TO_BE_CONFIRMED>`, khong tu chot domain that.
- Ghi Cloudflare readiness checklist cho DNS, route/custom domain binding, SSL/TLS, HTTPS va fallback workers.dev.
- Ghi Supabase Auth readiness checklist cho Site URL, Redirect URLs, callback/login/logout/unauthorized smoke.
- Ghi Google OAuth readiness checklist cho JavaScript origins, redirect URI alignment va consent status.
- Ghi app configuration readiness cho `NEXT_PUBLIC_APP_URL`, Supabase env, `PROD_SMOKE_BASE_URL`, `window.location.origin` va hardcoded workers.dev gap.
- Ghi smoke test plan, rollback plan, pre-cutover approval checklist, risk matrix, gaps va Phase 20 boundary.
- Tao `scripts/check-custom-domain-cutover-readiness.cjs`.
- Them `npm run check:custom-domain-cutover-readiness`.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-custom-domain-cutover-readiness.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/20_CUSTOM_DOMAIN_CUTOVER_READINESS.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy lai.
- Khong push.
- Khong sua schema.
- Khong chay migration.
- Khong sua du lieu that.
- Khong doi domain/DNS/Cloudflare route that.
- Khong doi Supabase/Auth/OAuth config that.
- Khong tao backup/export that.
- Khong restore production.
- Khong hardcode secret/token/key.
- Khong commit `.env.local`, `.dev.vars` hoac backup/export du lieu that.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

## 2026-06-17 - Phase 19 Scheduled Backup & Restore Drill

### Phase

Phase 19 - Scheduled Backup & Restore Drill

### Viec da lam

- Tao `docs/19_SCHEDULED_BACKUP_RESTORE_DRILL.md`.
- Ghi production baseline hien tai: Worker, production URL, workflow deploy, Phase 16/17/18 status, smoke/OAuth status va known issues.
- Ghi drill goal: manual runbook, khong backup that, khong restore production, khong cron/job that.
- Ghi recommended backup schedule cho pre/post deploy, weekly, monthly, import/restore/revision restore va future migration.
- Ghi backup scope, naming convention, manifest template va privacy/secret safety.
- Ghi restore drill scope, restore verification checklist va PASS/FAIL criteria.
- Ghi drill log template, scheduled reminder strategy va incident response matrix cho backup/restore.
- Ghi gaps/future work va Phase 19 boundary.
- Tao `scripts/check-scheduled-backup-restore-drill.cjs`.
- Them `npm run check:scheduled-backup-restore-drill`.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-scheduled-backup-restore-drill.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/19_SCHEDULED_BACKUP_RESTORE_DRILL.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy lai.
- Khong push.
- Khong sua schema.
- Khong chay migration.
- Khong sua du lieu that.
- Khong tao backup/export that.
- Khong restore production.
- Khong lam import confirm that.
- Khong lam revision restore that.
- Khong doi domain that.
- Khong doi Supabase/Auth/OAuth config that.
- Khong hardcode secret/token/key.
- Khong commit `.env.local`, `.dev.vars` hoac backup/export du lieu that.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

## 2026-06-17 - Phase 18 Backup, Domain & Alerting Hardening

### Phase

Phase 18 - Backup, Domain & Alerting Hardening

### Việc đã làm

- Tạo `docs/18_BACKUP_DOMAIN_ALERTING_HARDENING.md`.
- Ghi production baseline hiện tại: Worker, production URL, workflow deploy, Phase 16/17 PASS, smoke/OAuth PASS.
- Ghi backup hardening checklist cho JSON/GEDCOM/ZIP, trước/sau deploy và trước thao tác dữ liệu thật.
- Ghi restore readiness checklist và boundary restore thật là high-risk phase riêng.
- Ghi domain hardening checklist cho custom domain tương lai, DNS, SSL/TLS, Supabase/Auth và Google OAuth URL alignment.
- Ghi alerting hardening checklist và recommended future setup.
- Ghi incident response matrix.
- Ghi backup naming convention.
- Ghi environment/secret safety và Phase 18 boundary.
- Tạo `scripts/check-backup-domain-alerting-hardening.cjs`.
- Thêm `npm run check:backup-domain-alerting-hardening`.
- Cập nhật docs index, decision log và handoff.

### File đã tạo/cập nhật

- package.json
- scripts/check-backup-domain-alerting-hardening.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/18_BACKUP_DOMAIN_ALERTING_HARDENING.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration đã tạo

- Không tạo migration.

### Package đã thêm

- Không thêm package.

### Ghi chú

- Không deploy lại.
- Không sửa schema.
- Không chạy migration.
- Không sửa dữ liệu thật.
- Không tạo backup/export thật.
- Không làm import confirm thật.
- Không làm revision restore thật.
- Không đổi domain thật.
- Không đổi Supabase/Auth/OAuth config thật.
- Không hardcode secret/token/key.
- Không commit `.env.local`, `.dev.vars` hoặc backup/export dữ liệu thật.

## 2026-06-17 - Phase 17 Production Operations & Monitoring

### Phase

Phase 17 - Production Operations & Monitoring

### Việc đã làm

- Tạo `docs/17_PRODUCTION_OPERATIONS_MONITORING.md`.
- Ghi production baseline: Worker `web-gia-pha`, production URL, workflow deploy và Phase 16 PASS.
- Ghi post-deploy operations checklist.
- Ghi Cloudflare monitoring checklist.
- Ghi GitHub Actions monitoring checklist.
- Ghi Supabase/Auth monitoring checklist.
- Ghi smoke testing guide, bao gồm optional smoke bằng `PROD_SMOKE_BASE_URL`.
- Ghi incident triage runbook và rollback guidance.
- Tạo `scripts/check-production-ops-monitoring.cjs`.
- Thêm `npm run check:production-ops-monitoring`.
- Cập nhật docs index, decision log và handoff.

### File đã tạo/cập nhật

- package.json
- scripts/check-production-ops-monitoring.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/17_PRODUCTION_OPERATIONS_MONITORING.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration đã tạo

- Không tạo migration.

### Package đã thêm

- Không thêm package.

### Ghi chú

- Không deploy lại.
- Không sửa schema.
- Không chạy migration.
- Không sửa dữ liệu thật.
- Không làm import confirm thật.
- Không làm revision restore thật.
- Không đổi privacy/business logic.
- Không hardcode secret/token/key.
- Không commit `.env.local` hoặc `.dev.vars`.
- Optional production smoke with `PROD_SMOKE_BASE_URL=https://web-gia-pha.hungdiepcompany.workers.dev` PASS.
- `npm run build` PASS trong clean temp copy; build trực tiếp tại repo bị chặn bởi ACL cũ trên generated `.next` artifact.

## 2026-06-17 - Phase 16 Production Stabilization

### Phase

Phase 16 - Production Stabilization

### Việc đã làm

- Tạo `docs/16_PRODUCTION_STABILIZATION.md`.
- Ghi production URL, Worker name và deploy workflow đang dùng.
- Ghi Supabase Auth checklist, Google OAuth checklist, route smoke checklist và auth/login checklist.
- Ghi public/private privacy checklist.
- Ghi export backup production checklist an toàn, không import ngược, không restore.
- Ghi logs/observability checklist và các lỗi cần theo dõi.
- Ghi known non-blocking warnings và blocking conditions.
- Ghi quy trình sau mỗi deploy.
- Tạo `scripts/check-production-stabilization.cjs`.
- Thêm `npm run check:production-stabilization`.
- Cập nhật docs index, decision log và handoff.

### File đã tạo/cập nhật

- package.json
- scripts/check-production-stabilization.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/16_PRODUCTION_STABILIZATION.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration đã tạo

- Không tạo migration.

### Package đã thêm

- Không thêm package.

### Kiểm tra

- `npm.cmd run check:env:safe` - PASS
- `npm.cmd run check:migrations` - PASS
- `npm.cmd run check:deploy-readiness` - PASS
- `npm.cmd run check:opennext-cloudflare` - PASS
- `npm.cmd run check:service-boundary` - PASS
- `npm.cmd run check:github-actions-opennext` - PASS
- `npm.cmd run check:github-actions-deploy` - PASS
- `npm.cmd run check:production-stabilization` - PASS, optional network smoke skipped vì `PROD_SMOKE_BASE_URL` chưa set.
- `npm.cmd run typecheck` - PASS
- `npm.cmd run lint` - PASS
- `npm.cmd run build` - PASS
- `npm.cmd audit --audit-level=moderate` - PASS_WITH_KNOWN_AUDIT_ADVISORIES, còn known advisories trong Next/OpenNext/Wrangler/PostCSS/esbuild/ws chain.
- `git diff --check` - PASS
- `git status --short` - chỉ có thay đổi Phase 16 trước commit

### Ghi chú

- Không deploy lại.
- Không sửa schema.
- Không chạy migration.
- Không sửa dữ liệu thật.
- Không làm import confirm thật.
- Không làm revision restore thật.
- Không đổi privacy/business logic.
- Không hardcode secret/token/key.
- Không commit `.env.local` hoặc `.dev.vars`.
- Optional network smoke chỉ chạy khi set `PROD_SMOKE_BASE_URL`, không login tự động và không mutate data.

## 2026-06-17 - Production deploy success recorded

### Phase

Post Phase 15E - Production deploy result

### Việc đã làm

- Ghi nhận GitHub Actions Cloudflare Deploy đã PASS theo xác nhận của user.
- Ghi nhận Worker production: `web-gia-pha`.
- Ghi nhận Production URL: `https://web-gia-pha.hungdiepcompany.workers.dev/`.
- Ghi nhận `NEXT_PUBLIC_APP_URL` đã cập nhật theo URL thật.
- Ghi nhận Supabase Site URL và Redirect URLs đã cấu hình theo URL thật.
- Ghi nhận Google OAuth đã sửa lỗi `deleted_client` và login PASS.
- Ghi nhận các route smoke cơ bản đã PASS theo test thủ công.
- Cập nhật docs deploy/handoff/work log.

### File đã tạo/cập nhật

- docs/08_AI_WORK_LOG.md
- docs/15E_GITHUB_ACTIONS_CLOUDFLARE_DEPLOY.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration đã tạo

- Không tạo migration.

### Package đã thêm

- Không thêm package.

### Ghi chú

- Không deploy lại.
- Không sửa schema.
- Không chạy migration.
- Không sửa dữ liệu thật.
- Không làm import confirm thật.
- Không làm revision restore thật.
- Không commit `.env.local` hoặc `.dev.vars`.
- Không hardcode secret/token/key.

## 2026-06-17 - Phase 15E GitHub Actions Cloudflare Deploy Workflow

### Phase

Phase 15E - GitHub Actions Cloudflare Deploy Workflow

### Việc đã làm

- User xác nhận GitHub Actions secrets `CLOUDFLARE_API_TOKEN` và `CLOUDFLARE_ACCOUNT_ID` đã cấu hình.
- Tạo workflow `.github/workflows/cloudflare-deploy.yml`.
- Workflow chỉ chạy thủ công bằng `workflow_dispatch`, không auto deploy khi push/pull request.
- Workflow chạy trên `ubuntu-latest`, dùng Node 24, `npm ci`, safety checks, typecheck, lint, build và `npm run deploy`.
- Workflow đọc env/secrets từ GitHub `vars.*` và `secrets.*`, không hardcode token/key/secret.
- Tạo `scripts/check-github-actions-cloudflare-deploy.cjs`.
- Thêm `npm run check:github-actions-deploy`.
- Tạo docs `docs/15E_GITHUB_ACTIONS_CLOUDFLARE_DEPLOY.md`.
- Cập nhật docs index, decision log, handoff và Phase 15D report.

### File đã tạo/cập nhật

- .github/workflows/cloudflare-deploy.yml
- package.json
- scripts/check-github-actions-cloudflare-deploy.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/15D_FIRST_CLOUDFLARE_DEPLOY_RETRY.md
- docs/15E_GITHUB_ACTIONS_CLOUDFLARE_DEPLOY.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration đã tạo

- Không tạo migration.

### Package đã thêm

- Không thêm package.

### Kiểm tra

- `npm.cmd run check:env:safe` - PASS
- `npm.cmd run check:migrations` - PASS
- `npm.cmd run check:deploy-readiness` - PASS
- `npm.cmd run check:opennext-cloudflare` - PASS
- `npm.cmd run check:service-boundary` - PASS
- `npm.cmd run check:github-actions-opennext` - PASS
- `npm.cmd run check:github-actions-deploy` - PASS
- `npm.cmd run typecheck` - PASS
- `npm.cmd run lint` - PASS
- `npm.cmd run build` - PASS
- `npm.cmd audit --audit-level=moderate` - PASS_WITH_KNOWN_AUDIT_ADVISORIES
- `git diff --check` - PASS
- `git status --short` - chỉ có thay đổi Phase 15E trước commit
- Secret scan - PASS, chỉ match GitHub `secrets.*` references, placeholder/docs policy và checker patterns; không có secret thật.
- `git ls-files .env .env.local .dev.vars` - rỗng

### Ghi chú

- Không deploy từ Windows local.
- Không chạy deploy trong Phase 15E local validation.
- Không sửa schema.
- Không chạy migration.
- Không sửa dữ liệu thật.
- Không làm import confirm thật.
- Không làm revision restore thật.
- Không commit `.env.local` hoặc `.dev.vars`.
- Không hardcode secret/token/key.
- Không chạy `npm audit fix --force`.

## 2026-06-16 - Phase 15D First Cloudflare Deploy Retry

### Phase

Phase 15D - First Cloudflare Deploy Retry

### Việc đã làm

- Xác nhận repo sạch, branch `main`, commit Phase 15B và Phase 15C đã có ở local.
- Xác nhận `origin/main` đang ở commit `b04657535a94378df0a6811a15fff247131d5cac`.
- Xác nhận GitHub Actions OpenNext Cloudflare Build Gate PASS: run `27631937702`.
- Chạy local gates trước deploy: checks/build PASS, audit ở trạng thái known advisories.
- User xác nhận đã backup `family.json` và `full-backup.zip` ngoài repo.
- User xác nhận Cloudflare production variables/secrets đã cấu hình đúng loại.
- Chạy `npm.cmd run deploy`.
- Deploy bị BLOCKED ở bước OpenNext bundle trên Windows trước khi upload/deploy Cloudflare.
- Tạo report `docs/15D_FIRST_CLOUDFLARE_DEPLOY_RETRY.md`.

### File đã tạo/cập nhật

- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/14_OPENNEXT_CLOUDFLARE_WIRING.md
- docs/15C_GITHUB_ACTIONS_OPENNEXT_BUILD_GATE.md
- docs/15D_FIRST_CLOUDFLARE_DEPLOY_RETRY.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration đã tạo

- Không tạo migration.

### Package đã thêm

- Không thêm package.

### Kiểm tra

- `git status --short` - sạch trước deploy
- `git log --oneline -10`
- `git branch --show-current` - `main`
- `git remote -v`
- `gh run view 27631937702 --json ...` - PASS
- `npm.cmd run check:env:safe` - PASS
- `npm.cmd run check:migrations` - PASS
- `npm.cmd run check:foundation` - PASS
- `npm.cmd run check:auth-permissions` - PASS
- `npm.cmd run check:people` - PASS
- `npm.cmd run check:relationships` - PASS
- `npm.cmd run check:tree-viewer` - PASS
- `npm.cmd run check:tree-editor` - PASS
- `npm.cmd run check:public-privacy` - PASS
- `npm.cmd run check:export-backup` - PASS
- `npm.cmd run check:revisions` - PASS
- `npm.cmd run check:import-json` - PASS
- `npm.cmd run check:deploy-readiness` - PASS
- `npm.cmd run check:opennext-cloudflare` - PASS
- `npm.cmd run check:service-boundary` - PASS
- `npm.cmd run check:github-actions-opennext` - PASS
- `npm.cmd run typecheck` - PASS
- `npm.cmd run lint` - PASS
- `npm.cmd run build` - PASS
- `npm.cmd audit --audit-level=moderate` - PASS_WITH_KNOWN_AUDIT_ADVISORIES
- `git diff --check` - PASS

### Deploy result

- `npm.cmd run deploy` - BLOCKED
- Next build inside deploy - PASS
- OpenNext bundle on Windows - FAIL with known `open-next.config.edge.mjs` copyfile ENOENT
- Cloudflare upload/deploy reached - No
- Production URL - Not created

### Ghi chú

- Không sửa schema.
- Không chạy migration.
- Không sửa dữ liệu thật.
- Không làm import confirm thật.
- Không làm revision restore thật.
- Không in secret.
- Không commit `.env.local` hoặc `.dev.vars`.
- Không push remote trong phase này.
- Việc tiếp theo: deploy bằng WSL/Linux hoặc tạo GitHub Actions deploy workflow khi user xác nhận rõ.

## 2026-06-16 - Phase 15C Linux/GitHub Actions OpenNext Build Gate

### Phase

Phase 15C - Linux/GitHub Actions OpenNext Build Gate

### Việc đã làm

- Xác nhận gate Phase 15B đã đủ: service boundary docs, template worker, checker và handoff PASS_WITH_KNOWN_AUDIT_ADVISORIES.
- Tạo workflow `.github/workflows/opennext-build-gate.yml` chạy trên `ubuntu-latest`.
- Workflow chạy `npm ci`, check scripts, typecheck, lint, Next build và `npx opennextjs-cloudflare build`.
- Workflow không deploy, không upload, không chạy `wrangler deploy`, không chạy migration và không smoke test Supabase thật.
- Tạo `scripts/check-github-actions-opennext-gate.cjs`.
- Thêm `npm run check:github-actions-opennext`.
- Tạo docs `docs/15C_GITHUB_ACTIONS_OPENNEXT_BUILD_GATE.md`.
- Cập nhật docs index, OpenNext wiring, decision log và handoff.

### File đã tạo/cập nhật

- .github/workflows/opennext-build-gate.yml
- package.json
- scripts/check-github-actions-opennext-gate.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/14_OPENNEXT_CLOUDFLARE_WIRING.md
- docs/15C_GITHUB_ACTIONS_OPENNEXT_BUILD_GATE.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration đã tạo

- Không tạo migration.

### Package đã thêm

- Không thêm package.

### Kiểm tra

- `git status --short` trước sửa - sạch
- Gate Phase 15B signs - PASS
- `npm.cmd run check:env:safe` - PASS
- `npm.cmd run check:migrations` - PASS
- `npm.cmd run check:foundation` - PASS
- `npm.cmd run check:auth-permissions` - PASS
- `npm.cmd run check:people` - PASS
- `npm.cmd run check:relationships` - PASS
- `npm.cmd run check:tree-viewer` - PASS
- `npm.cmd run check:tree-editor` - PASS
- `npm.cmd run check:public-privacy` - PASS
- `npm.cmd run check:export-backup` - PASS
- `npm.cmd run check:revisions` - PASS
- `npm.cmd run check:import-json` - PASS
- `npm.cmd run check:deploy-readiness` - PASS
- `npm.cmd run check:opennext-cloudflare` - PASS
- `npm.cmd run check:service-boundary` - PASS
- `npm.cmd run check:github-actions-opennext` - PASS
- `npm.cmd run typecheck` - PASS
- `npm.cmd run lint` - PASS
- `npm.cmd run build` - PASS
- `npm.cmd audit --audit-level=moderate` - PASS_WITH_KNOWN_AUDIT_ADVISORIES, còn advisory trong Next/OpenNext/Wrangler/PostCSS/esbuild/ws chain.
- `git diff --check` - PASS

### Ghi chú

- Không deploy thật.
- Không push remote.
- Không tách Worker thật.
- Không sửa schema hoặc business logic.
- Không chạy migration.
- Không hardcode secret hoặc thêm GitHub secret thật vào workflow.
- Audit advisory của Next/OpenNext/Wrangler/PostCSS/esbuild/ws tiếp tục là known deploy-toolchain risk; không chạy `npm audit fix --force`.
- Kết luận local: READY_TO_RUN_ON_GITHUB.

## 2026-06-16 - Phase 15B Service Boundary & Worker Split Readiness

### Phase

Phase 15B - Service Boundary & Worker Split Readiness

### Việc đã làm

- Tạo tài liệu `docs/15_SERVICE_BOUNDARY_WORKER_SPLIT.md` ghi boundary giữa Main Web Worker và các service worker ứng viên.
- Tạo template worker độc lập tại `services/_template-worker/` với `GET /health` và `POST /internal/example`.
- Internal route trong template yêu cầu `Authorization: Bearer <SERVICE_INTERNAL_TOKEN>` qua binding placeholder, không có secret thật trong repo.
- Tạo `scripts/check-service-boundary-readiness.cjs`.
- Thêm `npm run check:service-boundary`.
- Cập nhật docs index, architecture, export/backup model, OpenNext note, decision log và handoff.

### File đã tạo/cập nhật

- package.json
- scripts/check-service-boundary-readiness.cjs
- docs/00_INDEX.md
- docs/02_ARCHITECTURE.md
- docs/06_EXPORT_BACKUP_MODEL.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/14_OPENNEXT_CLOUDFLARE_WIRING.md
- docs/15_SERVICE_BOUNDARY_WORKER_SPLIT.md
- docs/99_NEXT_AI_HANDOFF.md
- services/_template-worker/README.md
- services/_template-worker/package.json
- services/_template-worker/wrangler.toml
- services/_template-worker/src/index.ts

### Migration đã tạo

- Không tạo migration.

### Package đã thêm

- Không thêm package vào app chính.

### Kiểm tra

- `npm.cmd run check:env:safe` - PASS
- `npm.cmd run check:migrations` - PASS
- `npm.cmd run check:foundation` - PASS
- `npm.cmd run check:auth-permissions` - PASS
- `npm.cmd run check:people` - PASS
- `npm.cmd run check:relationships` - PASS
- `npm.cmd run check:tree-viewer` - PASS
- `npm.cmd run check:tree-editor` - PASS
- `npm.cmd run check:public-privacy` - PASS
- `npm.cmd run check:export-backup` - PASS
- `npm.cmd run check:revisions` - PASS
- `npm.cmd run check:import-json` - PASS
- `npm.cmd run check:deploy-readiness` - PASS
- `npm.cmd run check:opennext-cloudflare` - PASS
- `npm.cmd run check:service-boundary` - PASS
- `npm.cmd run typecheck` - PASS
- `npm.cmd run lint` - PASS
- `npm.cmd run build` - PASS
- `npm.cmd audit --audit-level=moderate` - FAIL, còn advisory trong `next`/`postcss`, `@opennextjs/cloudflare`/`wrangler`/`esbuild`/`ws`; không chạy `npm audit fix --force` vì ngoài scope và có breaking/no-fix advisory.
- `git diff --check` - PASS

### Ghi chú

- Không tách Worker thật.
- Không tạo Cloudflare service thật.
- Không deploy, không upload, không push remote.
- Không chạy migration.
- Không sửa schema, dữ liệu thật hoặc business logic export/import hiện có.
- Không đọc/in secret và không hardcode secret.
- Phase 15B technical status: PASS.
- Commit status: allowed with audit exception.
- Audit status: `npm audit --audit-level=moderate` vẫn report advisory trong dependency/toolchain chain: `next`/`postcss`, `@opennextjs/cloudflare`, `wrangler`, `esbuild` và `ws`.
- Policy: không chạy `npm audit fix --force`; theo dõi upstream package updates.
- Reason: remediation hiện tại có thể cần force/breaking changes và có thể làm mất ổn định Next/OpenNext deploy wiring.
- Kết luận validation: PASS_WITH_KNOWN_AUDIT_ADVISORIES.

## 2026-06-16 - Phase 15A OpenNext Cloudflare Workers Wiring

### Phase

Phase 15A - OpenNext Cloudflare Workers Wiring

### Việc đã làm

- Cài `@opennextjs/cloudflare` và `wrangler`.
- Cập nhật `package.json` scripts `preview`, `deploy`, `upload`, `cf-typegen` và `check:opennext-cloudflare`.
- Cập nhật `wrangler.toml` cho Cloudflare Workers qua OpenNext.
- Tạo `open-next.config.ts`.
- Cập nhật `.gitignore` cho `.open-next`, `cloudflare-env.d.ts` và `.dev.vars`.
- Tạo `scripts/check-opennext-cloudflare-wiring.cjs`.
- Tạo `docs/14_OPENNEXT_CLOUDFLARE_WIRING.md`.
- Cập nhật deploy readiness, docs index, decision log và handoff.

### File đã tạo/cập nhật

- package.json
- package-lock.json
- wrangler.toml
- open-next.config.ts
- .gitignore
- eslint.config.mjs
- scripts/check-opennext-cloudflare-wiring.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/13_DEPLOY_READINESS.md
- docs/14_OPENNEXT_CLOUDFLARE_WIRING.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration đã tạo

- Không tạo migration.

### Ghi chú

- Không deploy thật.
- Không push remote.
- Không chạy `npm run deploy`, `npm run upload` hoặc `npx wrangler deploy`.
- Không đọc/in `.env.local`.
- Không hardcode secret hoặc Supabase key vào `wrangler.toml`.
- Không sửa schema/auth/business logic/import confirm/revision restore.

## 2026-06-16 - Phase 14 Deploy Readiness

### Phase

Phase 14 - Deploy Readiness

### Việc đã làm

- Tạo `docs/13_DEPLOY_READINESS.md`.
- Tạo `scripts/check-deploy-readiness.cjs`.
- Thêm script `check:deploy-readiness`.
- Cập nhật `.env.example` để tất cả env là placeholder rỗng.
- Cập nhật Supabase setup docs cho local `127.0.0.1`, production callback và Google OAuth redirect boundary.
- Cập nhật README, docs index, decision log và handoff.

### File đã tạo/cập nhật

- README.md
- .env.example
- package.json
- scripts/check-deploy-readiness.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/10_SUPABASE_SETUP.md
- docs/13_DEPLOY_READINESS.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration đã tạo

- Không tạo migration.

### Package thay đổi

- Không thêm package.

### Ghi chú

- Phase 14 chỉ chuẩn bị deploy readiness.
- Không deploy thật.
- Không push remote.
- Không sửa `.env.local`, không đọc/in secret.
- Không sửa schema/auth/business logic/import confirm/revision restore.

## 2026-06-16 - Phase 13 UI Polish Foundation

### Phase

Phase 13 - UI Polish Foundation

### Việc đã làm

- Tạo UI primitives nhẹ: page header, section card, empty state, status callout và action link.
- Polish admin shell: nav rõ hơn, active route rõ hơn, user/role/permission context gọn hơn.
- Polish public shell và homepage: hero rõ hơn, CTA xem cây/đăng nhập, giải thích public/private.
- Polish login page: phân biệt Google OAuth và magic link, không đổi callback/auth logic.
- Polish people list và person form: bảng dễ đọc hơn, form chia nhóm thông tin.
- Polish relationship page: giải thích family, cha mẹ/con, quan hệ đôi và hướng dẫn UUID.
- Polish tree viewer/editor: header hướng dẫn, toolbar rõ hơn, empty state thân thiện.
- Polish export/import: nhấn mạnh `family.json` là backup chính, GEDCOM là tương thích, ZIP có manifest/checksum, import preview chưa ghi DB.
- Tạo `scripts/check-ui-polish-foundation.cjs` và script `check:ui-polish`.

### File đã tạo/cập nhật

- package.json
- scripts/check-ui-polish-foundation.cjs
- components/ui/action-link.tsx
- components/ui/empty-state.tsx
- components/ui/page-header.tsx
- components/ui/section-card.tsx
- components/ui/status-callout.tsx
- components/layout/admin-shell.tsx
- components/layout/public-shell.tsx
- components/public/public-home.tsx
- components/public/public-tree-shell.tsx
- components/public/public-person-profile.tsx
- components/people/person-list.tsx
- components/people/person-form.tsx
- components/tree/family-tree-toolbar.tsx
- components/tree/tree-editor-toolbar.tsx
- components/tree/family-tree-empty-state.tsx
- app/auth/login/page.tsx
- app/(admin)/admin/page.tsx
- app/(admin)/admin/people/page.tsx
- app/(admin)/admin/people/new/page.tsx
- app/(admin)/admin/relationships/page.tsx
- app/(admin)/admin/tree/page.tsx
- app/(admin)/admin/tree/edit/page.tsx
- app/(admin)/admin/exports/page.tsx
- app/(admin)/admin/exports/import/page.tsx
- docs/05_TREE_UI_MODEL.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration đã tạo

- Không tạo migration.

### Package đã thêm

- Không thêm package.

### Ghi chú

- Không sửa schema, RLS, auth callback, import confirm hoặc revision restore.
- Không chạy lại migrations 0001-0006.
- Không push remote.
- Baseline Supabase thật từ Phase 12 vẫn giữ nguyên.

## 2026-06-16 - Phase 12 Real Supabase Smoke Test Report & Stable Baseline

### Phase

Phase 12 - Real Supabase Smoke Test Report & Stable Baseline

### Việc đã làm

- Tạo `docs/12_REAL_SUPABASE_SMOKE_TEST_REPORT.md`.
- Ghi nhận user-confirmed real Supabase smoke test PASS ở mức chính.
- Ghi nhận Google OAuth login đã hoạt động.
- Ghi nhận user đã thêm người thật vào database thật.
- Ghi nhận main routes/functions smoke test chính OK theo xác nhận của user.
- Ghi nhận PKCE issue trước đó là transient nếu không tái diễn.
- Ghi rõ không chạy lại toàn bộ migration 0001-0006 sau khi đã có dữ liệu thật nếu chưa review.
- Ghi rõ import confirm thật và revision restore thật vẫn chưa làm.
- Cập nhật index, setup, checklist, handoff và decision log cho baseline trước UI polish.

### File đã tạo/cập nhật

- README.md
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/10_SUPABASE_SETUP.md
- docs/11_SMOKE_TEST_CHECKLIST.md
- docs/12_REAL_SUPABASE_SMOKE_TEST_REPORT.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration đã tạo

- Không tạo migration.

### Package/script thay đổi

- Không thay đổi package hoặc script.

### Kiểm tra

- `npm.cmd run check:env:safe`
- `npm.cmd run check:migrations`
- `npm.cmd run check:foundation`
- `npm.cmd run check:auth-permissions`
- `npm.cmd run check:people`
- `npm.cmd run check:relationships`
- `npm.cmd run check:tree-viewer`
- `npm.cmd run check:tree-editor`
- `npm.cmd run check:public-privacy`
- `npm.cmd run check:export-backup`
- `npm.cmd run check:revisions`
- `npm.cmd run check:import-json`
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npm.cmd run build`
- `npm.cmd audit --audit-level=moderate`
- `git diff --check`
- `git status --short`

### Ghi chú

- Phase 12 là docs/stability phase.
- Không sửa code app.
- Không đọc/in `.env.local`.
- Không in secret.
- Không push remote.
- Phase tiếp theo đề xuất: Phase 13 - UI Polish Foundation.

## 2026-06-16 - Google OAuth login via Supabase Auth

### Phase

Auth usability hardening after Phase 11

### Việc đã làm

- Thêm nút `Đăng nhập với Google` tại `/auth/login`.
- Giữ nguyên form magic link hiện có.
- Google OAuth dùng Supabase browser client và redirect về `/auth/callback`.
- Callback ưu tiên xử lý `error`/`error_code` trước khi kiểm tra thiếu `code`.
- Callback vẫn dùng `exchangeCodeForSession(code)` cho cả magic link và Google OAuth.
- Bổ sung mapping lỗi đăng nhập dễ hiểu cho `otp_expired`, `missing_auth_code`, `auth_callback_failed`, `access_denied`, `provider_disabled` và fallback unknown.
- Cập nhật hướng dẫn cấu hình Google OAuth trong `docs/10_SUPABASE_SETUP.md`.

### File đã tạo/cập nhật

- app/auth/callback/route.ts
- app/auth/login/page.tsx
- components/auth/login-form.tsx
- docs/08_AI_WORK_LOG.md
- docs/10_SUPABASE_SETUP.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration đã tạo

- Không tạo migration.

### Package đã thêm

- Không thêm package.

### Kiểm tra

- `npm run check:foundation`
- `npm run check:auth-permissions`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `git status --short`

### Ghi chú

- Không sửa schema, permission model, OWNER logic hoặc dữ liệu Supabase.
- Không hard-code email đăng nhập.
- Không commit `.env.local`.
- Chưa push remote.

## 2026-06-16 - Phase 11 Supabase Integration & Real Smoke Test Gate

### Phase

Phase 11 - Supabase Integration & Real Smoke Test Gate

### Việc đã làm

- Tạo `scripts/check-env-safe.cjs` để kiểm `.env.example` và trạng thái key trong `.env.local` mà không in secret.
- Tạo `scripts/check-migrations-order.cjs` để kiểm migration order/prefix/conflict marker.
- Thêm package scripts `check:env:safe` và `check:migrations`.
- Tạo `docs/10_SUPABASE_SETUP.md`.
- Tạo `docs/11_SMOKE_TEST_CHECKLIST.md`.
- Cập nhật `docs/00_INDEX.md`.
- Tạo route `/admin/system/status` có permission guard và chỉ hiển thị trạng thái yes/no.
- Thêm link `System` vào admin nav.

### File đã tạo/cập nhật

- package.json
- scripts/check-env-safe.cjs
- scripts/check-migrations-order.cjs
- app/(admin)/admin/system/status/page.tsx
- components/layout/admin-shell.tsx
- docs/00_INDEX.md
- docs/02_ARCHITECTURE.md
- docs/04_PERMISSION_PRIVACY_MODEL.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/10_SUPABASE_SETUP.md
- docs/11_SMOKE_TEST_CHECKLIST.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration đã tạo

- Không tạo migration trong Phase 11.

### Package đã thêm

- Không thêm package.

### Script check đã tạo

- `check:env:safe`: chạy `node scripts/check-env-safe.cjs`
- `check:migrations`: chạy `node scripts/check-migrations-order.cjs`

### Quyết định kỹ thuật

- Env handling: `.env.local` nếu có thì chỉ kiểm present/missing, không in value.
- Migration gate: kiểm đủ migration `0001` đến `0006`, thứ tự tên file, duplicate prefix và conflict marker.
- OWNER assignment: giữ thủ công bằng `db/snippets/assign-owner-role.sql`, không auto OWNER.
- Smoke test: checklist thủ công sau khi user cấu hình Supabase thật.
- Secret policy: không commit secret, không đưa service role key ra client.

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa chạy migration thật.
- Chưa test login thật.
- Chưa gán OWNER thật.

### Task tiếp theo đề xuất

- User cấu hình `.env.local`, chạy migrations thật, gán OWNER và smoke test thật.

## 2026-06-15 - Phase 10 Import JSON Foundation

### Phase

Phase 10 - Import JSON Foundation

### Việc đã làm

- Tạo import types và hằng số schema/size limit.
- Tạo validator thuần cho `family.json`, không dùng Supabase và không ghi DB.
- Validate JSON parse, schema version, arrays, duplicate IDs, full_name, references và vòng tổ tiên.
- Tạo preview service server-side có kiểm `imports.create` và conflict check DB nếu khả dụng.
- Tạo route `/admin/exports/import`.
- Tạo server action `previewImportAction` để đọc upload/paste JSON tối đa 5MB.
- Tạo client form preview summary/issues/conflicts và khóa nút xác nhận import.
- Thêm link từ `/admin/exports` sang import preview.
- Tạo script `check:import-json`.

### File đã tạo/cập nhật

- package.json
- app/(admin)/admin/exports/page.tsx
- app/(admin)/admin/exports/import/page.tsx
- app/(admin)/admin/exports/import/actions.ts
- components/imports/json-import-preview-form.tsx
- lib/family/import-types.ts
- lib/family/json-import-validator.ts
- lib/family/json-import-preview-service.ts
- scripts/check-import-json-foundation.cjs
- docs/02_ARCHITECTURE.md
- docs/04_PERMISSION_PRIVACY_MODEL.md
- docs/06_EXPORT_BACKUP_MODEL.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration đã tạo

- Không tạo migration trong Phase 10.

### Package đã thêm

- Không thêm package.

### Script check đã tạo

- `check:import-json`: chạy `node scripts/check-import-json-foundation.cjs`

### Quyết định kỹ thuật

- Import preview: chỉ đọc file và trả summary/issues/conflicts, không ghi DB.
- Validator: thuần, chạy được ngay cả khi Supabase thiếu cấu hình.
- Conflict check: server-side bằng admin Supabase client nếu permission/config đầy đủ.
- Permission: `imports.create` là quyền mở trang/preview khi auth đã cấu hình.
- Restore/import thật: chưa bật, nút xác nhận import disabled.

### Lệnh đã chạy

- git status --short
- git log --oneline -5
- npm run check:foundation
- npm run check:auth-permissions
- npm run check:people
- npm run check:relationships
- npm run check:tree-viewer
- npm run check:tree-editor
- npm run check:public-privacy
- npm run check:export-backup
- npm run check:revisions
- npm run check:import-json
- npm run typecheck
- npm run lint
- npm run build
- npm audit --audit-level=moderate
- git diff --check

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa làm import thật.
- Chưa có transaction/rollback import.
- Chưa ghi import job/revision log.
- Chưa kiểm thử với Supabase data thật.

### Task tiếp theo đề xuất

- Phase 11 - Import transaction/restore planning hoặc UI polish foundation.

## 2026-06-15 - Phase 9 Revision History UI Foundation

### Phase

Phase 9 - Revision History UI Foundation

### Việc đã làm

- Tạo revision types.
- Mở rộng revision service để đọc list/detail/entity revisions.
- Tạo diff helper so sánh `before_json` và `after_json`.
- Tạo route `/admin/revisions`.
- Tạo route `/admin/revisions/[id]`.
- Thêm filter theo entity_type, action, entity_id, changed_by và ngày.
- Thêm link từ `/admin/people/[id]` sang lịch sử revision của người đó.
- Thêm admin nav `Lịch sử chỉnh sửa`.
- Tạo restore placeholder disabled, chưa làm restore thật.
- Tạo script `check:revisions`.

### File đã tạo/cập nhật

- README.md
- package.json
- app/(admin)/admin/revisions/page.tsx
- app/(admin)/admin/revisions/[id]/page.tsx
- app/(admin)/admin/people/[id]/page.tsx
- components/layout/admin-shell.tsx
- lib/family/revision-types.ts
- lib/family/revision-service.ts
- lib/family/revision-diff.ts
- scripts/check-revision-history-foundation.cjs
- docs/02_ARCHITECTURE.md
- docs/03_DATABASE_MODEL.md
- docs/04_PERMISSION_PRIVACY_MODEL.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration đã tạo

- Không tạo migration trong Phase 9.

### Package đã thêm

- Không thêm package.

### Script check đã tạo

- `check:revisions`: chạy `node scripts/check-revision-history-foundation.cjs`

### Quyết định kỹ thuật

- Revision list: server-side list với filter cơ bản, giới hạn 100 bản ghi mới nhất.
- Revision detail: server-side detail theo UUID, hiển thị metadata, revision_items nếu có và raw JSON.
- Diff viewer: so sánh field top-level từ `before_json`/`after_json`, fallback an toàn cho JSON phức tạp.
- Restore: chỉ placeholder disabled, không ghi đè dữ liệu hiện tại.
- Permission: route/service kiểm `revisions.view`; `revisions.restore` chỉ ảnh hưởng ghi chú placeholder.

### Lệnh đã chạy

- git status --short
- git log --oneline -5
- npm run check:foundation
- npm run check:auth-permissions
- npm run check:people
- npm run check:relationships
- npm run check:tree-viewer
- npm run check:tree-editor
- npm run check:public-privacy
- npm run check:export-backup
- npm run check:revisions
- npm run typecheck
- npm run lint
- npm run build
- npm audit --audit-level=moderate
- git diff --check
- Browser route check `http://127.0.0.1:3000/admin/revisions`
- Browser route check `http://127.0.0.1:3000/admin/revisions/fake-id`

### Kết quả hiện tại

- PASS: baseline trước khi sửa.
- PASS: `npm run check:revisions`
- PASS: `npm run typecheck`
- PASS: `npm run lint`
- PASS: `npm run build`
- PASS: `git diff --check`
- PASS: Browser route check cho `/admin/revisions` và `/admin/revisions/fake-id`; routes render nội dung an toàn, không crash trắng.
- WARN: `npm audit --audit-level=moderate` còn 2 moderate warnings từ `next`/`postcss`; không chạy `npm audit fix --force` vì breaking change ngoài scope.

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa làm restore thật.
- Chưa có transaction/validation restore.
- Chưa kiểm thử với dữ liệu Supabase thật.

### Task tiếp theo đề xuất

- Phase 10 - Import JSON foundation hoặc UI polish foundation.

## 2026-06-15 - Phase 8 Export/backup foundation

### Phase

Phase 8 - Export/backup foundation

### Việc đã làm

- Tạo migration `export_jobs` và `backup_records`.
- Tạo export types, collector, JSON exporter, GEDCOM exporter, checksum helper và ZIP backup exporter.
- Tạo route admin `/admin/exports`.
- Tạo route download `/admin/exports/download/json`.
- Tạo route download `/admin/exports/download/gedcom`.
- Tạo route download `/admin/exports/download/zip`.
- Thêm admin nav `Backup / Export`.
- Thêm package `jszip`.
- Tạo script `check:export-backup`.
- Cập nhật docs export/backup, database, architecture, permission/privacy, decision log và handoff.

### File đã tạo/cập nhật

- README.md
- package.json
- package-lock.json
- db/migrations/20260614_0006_export_backup_foundation.sql
- app/(admin)/admin/exports/page.tsx
- app/(admin)/admin/exports/download/json/route.ts
- app/(admin)/admin/exports/download/gedcom/route.ts
- app/(admin)/admin/exports/download/zip/route.ts
- components/layout/admin-shell.tsx
- lib/family/export-types.ts
- lib/family/export-collector.ts
- lib/family/json-exporter.ts
- lib/family/gedcom-exporter.ts
- lib/family/checksum.ts
- lib/family/zip-backup-exporter.ts
- scripts/check-export-backup-foundation.cjs
- docs/02_ARCHITECTURE.md
- docs/03_DATABASE_MODEL.md
- docs/04_PERMISSION_PRIVACY_MODEL.md
- docs/06_EXPORT_BACKUP_MODEL.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration đã tạo

- `db/migrations/20260614_0006_export_backup_foundation.sql`

### Package đã thêm

- `jszip`

### Script check đã tạo

- `check:export-backup`: chạy `node scripts/check-export-backup-foundation.cjs`

### Quyết định kỹ thuật

- family.json export: bản bảo toàn dữ liệu chính, giữ ID ổn định, quan hệ và layout.
- GEDCOM export: foundation chuyển đổi, không cố map dữ liệu ngoài chuẩn bằng mọi giá.
- ZIP backup: gói `family.json`, `family.ged`, `manifest.json`, `checksums.json`.
- Manifest/checksum: SHA-256 trong `checksums.json`, tránh checksum tự tham chiếu vòng tròn.
- Import: chưa bật import ghi dữ liệu trong Phase 8.
- Media backup: chưa có media upload thật, `media_count = 0`.
- Permission: route admin/download kiểm `exports.download` server-side.

### Lệnh đã chạy

- git status --short
- git log --oneline -5
- npm run check:foundation
- npm run check:auth-permissions
- npm run check:people
- npm run check:relationships
- npm run check:tree-viewer
- npm run check:tree-editor
- npm run check:public-privacy
- npm run check:export-backup
- npm run typecheck
- npm run lint
- npm run build
- npm audit --audit-level=moderate
- git diff --check
- Browser route check `http://127.0.0.1:3001/admin/exports`
- Browser route check `http://127.0.0.1:3001/admin/exports/download/json`
- Browser route check `http://127.0.0.1:3001/admin/exports/download/gedcom`
- Browser route check `http://127.0.0.1:3001/admin/exports/download/zip`

### Kết quả hiện tại

- PASS: baseline trước khi sửa.
- PASS: `npm run check:export-backup`
- PASS: `npm run typecheck`
- PASS: `npm run lint`
- PASS: `npm run build`
- PASS: `git diff --check`
- PASS: Browser route check cho `/admin/exports`, `/admin/exports/download/json`, `/admin/exports/download/gedcom`, `/admin/exports/download/zip`; download routes trả lỗi cấu hình an toàn khi thiếu Supabase config.
- WARN: `npm audit --audit-level=moderate` còn 2 moderate warnings từ `next`/`postcss`; không chạy `npm audit fix --force` vì breaking change ngoài scope.

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa chạy migration trên Supabase thật.
- Chưa làm import đầy đủ.
- Chưa làm media upload thật.
- Chưa làm export ảnh/PDF.
- Chưa kiểm thử với dữ liệu Supabase thật.

### Task tiếp theo đề xuất

- Phase 9 - Revision history UI foundation.

## 2026-06-15 - Phase 7 Public/private mode foundation

### Phase

Phase 7 - Public/private mode foundation

### Việc đã làm

- Tạo privacy types và privacy service dùng chung.
- Tạo `PublicPerson`, `FamilyPerson`, `AdminPerson`.
- Tạo public-safe mapper cho person.
- Tạo sanitize tree graph theo mode public/family/admin.
- Tạo public family service.
- Cập nhật public homepage `/`.
- Tạo public tree route `/tree`.
- Tạo public person profile route `/people/[slug]`.
- Tạo admin public preview route `/admin/preview/public`.
- Tạo public components `PublicHome`, `PublicTreeShell`, `PublicPersonProfile`.
- Tạo script `check:public-privacy`.

### File đã tạo/cập nhật

- README.md
- package.json
- app/(public)/page.tsx
- app/(public)/tree/page.tsx
- app/(public)/people/[slug]/page.tsx
- app/(admin)/admin/preview/public/page.tsx
- components/layout/public-shell.tsx
- components/public/public-home.tsx
- components/public/public-tree-shell.tsx
- components/public/public-person-profile.tsx
- lib/privacy/privacy-types.ts
- lib/privacy/privacy-service.ts
- lib/family/public-family-service.ts
- scripts/check-public-privacy-foundation.cjs
- docs/02_ARCHITECTURE.md
- docs/04_PERMISSION_PRIVACY_MODEL.md
- docs/05_TREE_UI_MODEL.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration đã tạo

- Không tạo migration trong Phase 7.

### Script check đã tạo

- `check:public-privacy`: chạy `node scripts/check-public-privacy-foundation.cjs`

### Quyết định kỹ thuật

- Privacy service: sanitize server-side trước khi render.
- Public tree: readonly `/tree`, dùng graph public đã lọc.
- Public person profile: `/people/[slug]`, dùng DTO public-safe.
- Public preview: `/admin/preview/public`, dùng cùng public service với `/tree`.
- RLS/public query: không mở public RLS rộng; dùng server-side anon client với filter chặt, fail/empty an toàn nếu policy DB chưa cho phép.
- Living person privacy: public mode không hiện ngày sinh/mất đầy đủ, nơi sinh, quê quán, ghi chú riêng tư hoặc dữ liệu nội bộ.

### Lệnh đã chạy

- git status --short
- git log --oneline -5
- npm run check:foundation
- npm run check:auth-permissions
- npm run check:people
- npm run check:relationships
- npm run check:tree-viewer
- npm run check:tree-editor
- npm run check:public-privacy
- npm run typecheck
- npm run lint
- npm run build
- Browser route check `http://127.0.0.1:3001/`
- Browser route check `http://127.0.0.1:3001/tree`
- Browser route check `http://127.0.0.1:3001/people/test-slug`
- Browser route check `http://127.0.0.1:3001/admin/preview/public`

### Kết quả

- PASS: baseline `npm run check:foundation`
- PASS: baseline `npm run check:auth-permissions`
- PASS: baseline `npm run check:people`
- PASS: baseline `npm run check:relationships`
- PASS: baseline `npm run check:tree-viewer`
- PASS: baseline `npm run check:tree-editor`
- PASS: baseline `npm run typecheck`
- PASS: baseline `npm run lint`
- PASS: baseline `npm run build`
- PASS: `npm run check:public-privacy`
- PASS: Phase 7 `npm run typecheck`
- PASS: Phase 7 `npm run lint`
- PASS: Phase 7 `npm run build`
- PASS: Browser route check cho `/`, `/tree`, `/people/test-slug`, `/admin/preview/public`; các route render nội dung an toàn khi thiếu Supabase config.

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa chạy public RLS policy trên database thật.
- Chưa kiểm thử public routes với Supabase data thật.
- Chưa làm export JSON/GEDCOM/ZIP thật.
- Chưa làm export ảnh/PDF.
- Chưa làm media upload thật.
- NPM audit vẫn còn 2 moderate warnings từ `next`/`postcss`.

### Task tiếp theo đề xuất

- Phase 8 - Export/backup foundation.

## 2026-06-15 - Phase 6 Tree Editor foundation

### Phase

Phase 6 - Tree Editor foundation

### Việc đã làm

- Tạo migration `tree_layouts` và `tree_layout_nodes`.
- Bật RLS layout theo `tree.view` và `tree.edit_layout`.
- Tạo `tree-layout-service` để đọc, áp dụng, lưu và reset layout.
- Tạo route `/admin/tree/edit`.
- Tạo Tree Editor bằng React Flow.
- Tạo side panel khi click person node.
- Tạo toolbar editor: fit view, auto layout, lưu layout, reset layout.
- Thêm action thêm cha/mẹ, vợ/chồng/bạn đời, con từ cây bằng relationship service thật.
- Cập nhật `/admin/tree` có link chỉnh sửa cây khi có `tree.edit_layout`.
- Thêm menu admin `Chỉnh sửa cây`.
- Tạo script `check:tree-editor`.

### File đã tạo/cập nhật

- README.md
- package.json
- app/(admin)/admin/page.tsx
- app/(admin)/admin/tree/page.tsx
- app/(admin)/admin/tree/edit/page.tsx
- app/(admin)/admin/tree/edit/actions.ts
- components/layout/admin-shell.tsx
- components/tree/family-tree-editor.tsx
- components/tree/tree-editor-side-panel.tsx
- components/tree/tree-editor-toolbar.tsx
- db/migrations/20260614_0005_tree_layout_foundation.sql
- lib/family/tree-types.ts
- lib/family/tree-layout-service.ts
- scripts/check-tree-editor-foundation.cjs
- docs/02_ARCHITECTURE.md
- docs/03_DATABASE_MODEL.md
- docs/04_PERMISSION_PRIVACY_MODEL.md
- docs/05_TREE_UI_MODEL.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration đã tạo

- db/migrations/20260614_0005_tree_layout_foundation.sql

### Script check đã tạo

- `check:tree-editor`: chạy `node scripts/check-tree-editor-foundation.cjs`

### Quyết định kỹ thuật

- Tree editor: route riêng `/admin/tree/edit`, không biến viewer readonly thành editor.
- Layout persistence: lưu `tree_layouts`/`tree_layout_nodes`, tách khỏi dữ liệu quan hệ thật.
- Side panel: click person node hiển thị thông tin, quan hệ tóm tắt và form UUID tối giản.
- Add relationship from tree: dùng relationship service thật, không tạo edge mock.
- Permission: route edit yêu cầu `tree.view` + `tree.edit_layout`; add relationship yêu cầu `relationships.create` trong service.
- Public/private handling: chưa làm public tree.

### Lệnh đã chạy

- git status --short
- git log --oneline -5
- npm run check:foundation
- npm run check:auth-permissions
- npm run check:people
- npm run check:relationships
- npm run check:tree-viewer
- npm run check:tree-editor
- npm run typecheck
- npm run lint
- npm run build
- Browser route check `/admin/tree`
- Browser route check `/admin/tree/edit`

### Kết quả

- PASS: baseline `npm run check:foundation`
- PASS: baseline `npm run check:auth-permissions`
- PASS: baseline `npm run check:people`
- PASS: baseline `npm run check:relationships`
- PASS: baseline `npm run check:tree-viewer`
- PASS: baseline `npm run typecheck`
- PASS: baseline `npm run lint`
- PASS: baseline `npm run build`
- PASS: `npm run check:tree-editor`
- PASS: Phase 6 `npm run typecheck`
- PASS: Phase 6 `npm run lint`
- PASS: Phase 6 `npm run build`
- PASS: Browser route check cho `/admin/tree` khi thiếu Supabase config
- PASS: Browser route check cho `/admin/tree/edit` khi thiếu Supabase config

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa chạy migration trên database thật.
- Chưa kiểm thử editor với Supabase data thật.
- Chưa làm public tree.
- Chưa export ảnh cây/PDF.
- Chưa làm JSON/GEDCOM/ZIP export thật.
- NPM audit vẫn còn 2 moderate warnings từ Phase 5.

### Task tiếp theo đề xuất

- Phase 7 - Public/private mode foundation.

## 2026-06-15 - Phase 5 Tree Viewer foundation

### Phase

Phase 5 - Tree Viewer foundation

### Việc đã làm

- Cài `@xyflow/react` và `elkjs`.
- Tạo tree graph types.
- Tạo graph builder từ `people` và relationship tables.
- Tạo tree service server-side kiểm quyền `tree.view`.
- Tạo ELK auto layout helper.
- Tạo route `/admin/tree`.
- Tạo React Flow viewer client component.
- Tạo custom person/family node card.
- Tạo toolbar tìm người, fit view, reset layout.
- Tạo empty/error state an toàn.
- Thêm menu admin `Cây gia phả`.
- Tạo script `check:tree-viewer`.

### File đã tạo/cập nhật

- README.md
- package.json
- package-lock.json
- app/layout.tsx
- app/(admin)/admin/page.tsx
- app/(admin)/admin/tree/page.tsx
- components/layout/admin-shell.tsx
- components/tree/family-tree-viewer.tsx
- components/tree/family-node-card.tsx
- components/tree/family-tree-toolbar.tsx
- components/tree/family-tree-empty-state.tsx
- components/tree/family-tree-error-state.tsx
- lib/family/tree-types.ts
- lib/family/tree-graph-builder.ts
- lib/family/tree-service.ts
- lib/family/tree-layout-elk.ts
- scripts/check-tree-viewer-foundation.cjs
- docs/02_ARCHITECTURE.md
- docs/04_PERMISSION_PRIVACY_MODEL.md
- docs/05_TREE_UI_MODEL.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Package đã thêm

- `@xyflow/react`
- `elkjs`

### Script check đã tạo

- `check:tree-viewer`: chạy `node scripts/check-tree-viewer-foundation.cjs`

### Quyết định kỹ thuật

- React Flow package: `@xyflow/react`.
- ELK layout: `elkjs`, chạy trong client viewer helper và fail mềm.
- Graph builder: tạo `person` node và `family` node trung gian; edge gồm `family_unit`, `parent_child`, `couple`.
- Public/private handling: service admin kiểm `tree.view`; builder có mode `admin`, `internal`, `public`; node không chứa `notes_private`.
- Tree editor status: chưa làm mutation/edit trên cây.

### Lệnh đã chạy

- git status --short
- git log --oneline -5
- npm run check:foundation
- npm run check:auth-permissions
- npm run check:people
- npm run check:relationships
- npm run typecheck
- npm run lint
- npm run build
- npm install @xyflow/react elkjs
- npm run check:tree-viewer
- Browser route check `/admin/tree`

### Kết quả

- PASS: baseline `npm run check:foundation`
- PASS: baseline `npm run check:auth-permissions`
- PASS: baseline `npm run check:people`
- PASS: baseline `npm run check:relationships`
- PASS: baseline `npm run typecheck`
- PASS: baseline `npm run lint`
- PASS: baseline `npm run build`
- PASS: `npm run check:tree-viewer`
- PASS: Phase 5 `npm run typecheck`
- PASS: Phase 5 `npm run lint`
- PASS: Phase 5 `npm run build`
- PASS: Browser route check cho `/admin/tree` khi thiếu Supabase config

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa chạy migration trên database thật.
- Chưa kiểm thử viewer với Supabase data thật.
- Chưa làm Tree Editor.
- Chưa lưu layout thủ công.
- Chưa làm public tree.
- Chưa export ảnh cây/PDF.
- Chưa làm export JSON/GEDCOM/ZIP thật.
- NPM audit còn 2 moderate warnings sau khi cài package.

### Task tiếp theo đề xuất

- Phase 6 - Tree Editor foundation.

## 2026-06-15 - Phase 4 Relationship CRUD foundation

### Phase

Phase 4 - Relationship CRUD foundation

### Việc đã làm

- Tạo migration `families`, `family_parents`, `family_children`, `couple_relationships`.
- Bật RLS cho các bảng relationship và policy theo `relationships.*`.
- Tách revision helper dùng chung tại `lib/family/revision-service.ts`.
- Tạo relationship types, validation, graph cycle helper và service server-side.
- Tạo server actions cho create family, add parent/child, create couple và soft delete.
- Tạo route `/admin/relationships`.
- Tích hợp section quan hệ gia đình vào `/admin/people/[id]`.
- Tạo components `RelationshipForm`, `CoupleForm`, `RelationshipSummary`.
- Thêm menu admin `Quan hệ gia đình`.
- Tạo script `check:relationships`.

### File đã tạo/cập nhật

- README.md
- package.json
- app/(admin)/admin/page.tsx
- app/(admin)/admin/people/[id]/page.tsx
- app/(admin)/admin/relationships/actions.ts
- app/(admin)/admin/relationships/page.tsx
- components/layout/admin-shell.tsx
- components/relationships/relationship-form.tsx
- components/relationships/couple-form.tsx
- components/relationships/relationship-summary.tsx
- lib/family/revision-service.ts
- lib/family/relationship-types.ts
- lib/family/relationship-validation.ts
- lib/family/relationship-graph.ts
- lib/family/relationship-service.ts
- lib/family/people-service.ts
- db/migrations/20260614_0004_relationship_foundation.sql
- scripts/check-relationship-foundation.cjs
- docs/03_DATABASE_MODEL.md
- docs/04_PERMISSION_PRIVACY_MODEL.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration đã tạo

- db/migrations/20260614_0004_relationship_foundation.sql

### Script check đã tạo

- `check:relationships`: chạy `node scripts/check-relationship-foundation.cjs`

### Quyết định kỹ thuật

- Relationship schema dùng bảng riêng, không thêm `father_id`, `mother_id`, `spouse_id` vào `people`.
- Soft delete relationship bằng `deleted_at`, `deleted_by`, `delete_reason`.
- Revision helper dùng chung cho people và relationship entities.
- Cycle check cha-con chạy ở service layer trước khi thêm edge.

### Lệnh đã chạy

- git status --short
- git log --oneline -5
- npm run check:foundation
- npm run check:auth-permissions
- npm run check:people
- npm run typecheck
- npm run lint
- npm run build
- npm run check:relationships
- Browser route check `/admin/relationships`
- Browser route check `/admin/people/00000000-0000-0000-0000-000000000000`

### Kết quả

- PASS: baseline `npm run check:foundation`
- PASS: baseline `npm run check:auth-permissions`
- PASS: baseline `npm run check:people`
- PASS: baseline `npm run typecheck`
- PASS: baseline `npm run lint`
- PASS: baseline `npm run build`
- PASS: `npm run check:relationships`
- PASS: Phase 4 `npm run typecheck`
- PASS: Phase 4 `npm run lint`
- PASS: Phase 4 `npm run build`
- PASS: Browser route check cho `/admin/relationships`
- PASS: Browser route check cho `/admin/people/[id]` giả

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa chạy migration trên database thật.
- Chưa kiểm thử CRUD relationship với Supabase project thật.
- Chưa làm tree viewer/editor.
- Chưa thêm React Flow/ELK vào Phase 4.
- Chưa làm media upload thật.
- Chưa làm export JSON/GEDCOM/ZIP thật.

### Task tiếp theo đề xuất

- Phase 5 - Tree viewer foundation.

## 2026-06-15 - Phase 3 People CRUD foundation

### Phase

Phase 3 - People CRUD foundation

### Việc đã làm

- Tạo migration bảng `people`.
- Tạo revision foundation tối thiểu cho people với `revisions` và `revision_items`.
- Bật RLS cho `people`, `revisions`, `revision_items`.
- Tạo TypeScript types cho people.
- Tạo validator thủ công cho people input.
- Tạo people service server-side.
- Tạo server actions cho create/update/soft delete/restore.
- Tạo route `/admin/people`.
- Tạo route `/admin/people/new`.
- Tạo route `/admin/people/[id]`.
- Tạo component `PersonForm` và `PersonList`.
- Thêm menu admin tối giản: Tổng quan, Thành viên.
- Tạo script `check:people`.

### File đã tạo/cập nhật

- README.md
- package.json
- app/(admin)/admin/page.tsx
- app/(admin)/admin/people/actions.ts
- app/(admin)/admin/people/page.tsx
- app/(admin)/admin/people/new/page.tsx
- app/(admin)/admin/people/[id]/page.tsx
- components/layout/admin-shell.tsx
- components/people/person-form.tsx
- components/people/person-list.tsx
- lib/family/people-types.ts
- lib/family/people-validation.ts
- lib/family/people-service.ts
- db/migrations/20260614_0003_people_foundation.sql
- scripts/check-people-foundation.cjs
- docs/03_DATABASE_MODEL.md
- docs/04_PERMISSION_PRIVACY_MODEL.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration đã tạo

- db/migrations/20260614_0003_people_foundation.sql

### Script check đã tạo

- `check:people`: chạy `node scripts/check-people-foundation.cjs`

### Quyết định kỹ thuật

- People schema: một bảng `people` độc lập, chưa tạo relationship tables.
- Soft delete: dùng `deleted_at`, `deleted_by`, `delete_reason`; không xóa cứng.
- Revision: ghi tối thiểu vào `revisions` với before/after JSON cho people actions.
- RLS: bật từ đầu; service layer enforce action-specific permissions.

### Lệnh đã chạy

- git status --short
- git log --oneline -5
- npm run check:foundation
- npm run check:auth-permissions
- npm run typecheck
- npm run lint
- npm run build
- npm run check:people
- Browser route check `/admin/people`
- Browser route check `/admin/people/new`
- Browser route check `/admin/people/00000000-0000-0000-0000-000000000000`

### Kết quả

- PASS: baseline `npm run check:foundation`
- PASS: baseline `npm run check:auth-permissions`
- PASS: baseline `npm run typecheck` sau khi build tái tạo `.next/types`
- PASS: baseline `npm run lint`
- PASS: baseline `npm run build`
- PASS: `npm run check:people`
- PASS: Phase 3 `npm run typecheck`
- PASS: Phase 3 `npm run lint`
- PASS: Phase 3 `npm run build`
- PASS: Browser route check cho `/admin/people`, `/admin/people/new`, `/admin/people/[id]`

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa chạy migration trên database thật.
- Chưa kiểm thử CRUD với Supabase project thật.
- Chưa làm Relationship CRUD.
- Chưa làm cây gia phả.
- Chưa làm media upload thật.
- Chưa làm export JSON/GEDCOM/ZIP thật.

### Task tiếp theo đề xuất

- Phase 4 - Relationship CRUD foundation.

## 2026-06-14 - Phase 2 Auth + Role Permission hardening

### Phase

Phase 2 - Auth + Role Permission hardening

### Việc đã làm

- Chọn auth flow nền bằng Supabase magic link.
- Tạo UI đăng nhập email tối giản tại `/auth/login`.
- Tạo auth callback route `/auth/callback`.
- Cập nhật logout route `/auth/logout` để hỗ trợ GET/POST và không crash khi thiếu session.
- Tạo profile bootstrap service server-side.
- Tạo permission service server-side.
- Tạo `requirePermission()` cho route guard.
- Guard `/admin` bằng quyền `people.view`.
- Tạo page `/unauthorized` có reason và link điều hướng.
- Hiển thị email, roles và permission summary trong admin shell.
- Tạo migration hardening RLS/policies Phase 2.
- Tạo SQL snippet gán OWNER thủ công.
- Tạo script `check:auth-permissions`.

### File đã tạo/cập nhật

- README.md
- package.json
- app/(admin)/admin/page.tsx
- app/auth/login/page.tsx
- app/auth/callback/route.ts
- app/auth/logout/route.ts
- app/unauthorized/page.tsx
- components/auth/login-form.tsx
- components/layout/admin-shell.tsx
- lib/auth/profile-service.ts
- lib/permissions/permission-service.ts
- lib/permissions/require-permission.ts
- lib/supabase/client.ts
- lib/supabase/server.ts
- lib/supabase/admin.ts
- db/migrations/20260614_0002_auth_permission_hardening.sql
- db/snippets/assign-owner-role.sql
- scripts/check-auth-permissions.cjs
- docs/04_PERMISSION_PRIVACY_MODEL.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Package đã thêm

- Không thêm package mới trong Phase 2.

### Migration đã tạo

- db/migrations/20260614_0002_auth_permission_hardening.sql

### Script check đã tạo

- `check:auth-permissions`: chạy `node scripts/check-auth-permissions.cjs`

### Quyết định kỹ thuật

- Auth flow: Supabase magic link theo email.
- OWNER bootstrap: không auto OWNER; gán thủ công bằng SQL/admin context.
- Quyền tối thiểu vào `/admin`: `people.view`.

### Lệnh đã chạy

- git status --short
- git log --oneline -5
- npm run check:foundation
- npm run typecheck
- npm run lint
- npm run build
- npm run check:auth-permissions
- Browser route check `/auth/login`
- Browser route check `/auth/logout`
- Browser route check `/unauthorized`
- Browser route check `/admin`

### Kết quả

- PASS: baseline `npm run check:foundation`
- PASS: baseline `npm run typecheck`
- PASS: baseline `npm run lint`
- PASS: baseline `npm run build`
- PASS: `npm run check:auth-permissions`
- PASS: Phase 2 `npm run typecheck`
- PASS: Phase 2 `npm run lint`
- PASS: Phase 2 `npm run build`
- PASS: Browser route check cho `/auth/login`, `/auth/logout`, `/unauthorized`, `/admin`

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa tạo `.env` thật.
- Chưa kết nối Supabase project thật.
- Chưa chạy migration trên database thật.
- Chưa làm People CRUD.
- Chưa làm Relationship CRUD.
- Chưa làm cây gia phả.
- Chưa làm export JSON/GEDCOM/ZIP thật.

### Task tiếp theo đề xuất

- Phase 3 - People CRUD foundation.

## 2026-06-14 - Phase 1 Project foundation

### Phase

Phase 1 - Project foundation

### Việc đã làm

- Tạo Next.js App Router foundation ở root `app/`.
- Bật TypeScript, Tailwind CSS và ESLint theo scaffold Next.js.
- Tạo route nền `/`, `/admin`, `/auth/login`, `/auth/logout`.
- Tạo `PublicShell` và `AdminShell` tối giản.
- Tạo Supabase helper foundation cho client, server và admin.
- Tạo type nền cho auth, permission, privacy và family.
- Tạo `.env.example`.
- Tạo `.gitattributes` để giảm cảnh báo CRLF về sau.
- Tạo `wrangler.toml` placeholder cho Cloudflare, chưa deploy.
- Tạo migration nền cho `profiles`, `roles`, `permissions`, `role_permissions`, `profile_roles`.
- Bật RLS trong migration và tạo policy nền an toàn.
- Tạo script `check:foundation`.

### File đã tạo/cập nhật

- README.md
- package.json
- package-lock.json
- tsconfig.json
- next.config.ts
- eslint.config.mjs
- postcss.config.mjs
- app/layout.tsx
- app/globals.css
- app/(public)/page.tsx
- app/(admin)/admin/page.tsx
- app/auth/login/page.tsx
- app/auth/logout/route.ts
- components/layout/public-shell.tsx
- components/layout/admin-shell.tsx
- components/ui/.gitkeep
- lib/supabase/client.ts
- lib/supabase/server.ts
- lib/supabase/admin.ts
- lib/auth/auth-types.ts
- lib/permissions/permission-types.ts
- lib/permissions/permission-constants.ts
- lib/privacy/privacy-types.ts
- lib/family/family-types.ts
- db/migrations/20260614_0001_foundation_auth_roles_permissions.sql
- scripts/check-project-foundation.cjs
- .env.example
- .gitattributes
- wrangler.toml
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Package đã thêm

- next
- react
- react-dom
- @supabase/supabase-js
- @supabase/ssr
- tailwindcss
- @tailwindcss/postcss
- typescript
- eslint
- eslint-config-next
- @types/node
- @types/react
- @types/react-dom

### Migration đã tạo

- db/migrations/20260614_0001_foundation_auth_roles_permissions.sql

### Script check đã tạo

- `check:foundation`: chạy `node scripts/check-project-foundation.cjs`
- `typecheck`: chạy `tsc --noEmit`

### Lệnh đã chạy

- git status --short
- git log --oneline -5
- npx create-next-app@latest tmp-next-app --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm --yes
- npm install @supabase/supabase-js @supabase/ssr
- npm install --package-lock-only
- npm run check:foundation
- npm run typecheck
- npm run lint
- npm run build
- Browser check `http://127.0.0.1:3001/`
- Browser check `http://127.0.0.1:3001/admin`
- Browser check `http://127.0.0.1:3001/auth/login`

### Kết quả

- PASS: `npm run check:foundation`
- PASS: `npm run typecheck`
- PASS: `npm run lint`
- PASS: `npm run build`
- PASS: Browser route check cho `/`, `/admin`, `/auth/login`

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa tạo `.env` thật.
- Chưa kết nối Supabase project thật.
- Chưa làm People CRUD.
- Chưa làm Relationship CRUD.
- Chưa làm cây gia phả.
- Chưa làm export JSON/GEDCOM/ZIP thật.

### Task tiếp theo đề xuất

- Phase 2 - Auth + Role Permission hardening.

## 2026-06-14 - Git baseline

### Phase

Step 0 - Git baseline

### Việc đã làm

- Khởi tạo Git repo tại `D:\CODE\GIA PHẢ`.
- Tạo `.gitignore` phù hợp cho Next.js, Supabase và Cloudflare.
- Kiểm tra lại bộ docs hiện có.
- Commit baseline docs.
- Cập nhật handoff sau baseline Git.

### File đã tạo/cập nhật

- .gitignore
- docs/08_AI_WORK_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Commit đã tạo

- `dd911c9` - docs: initialize gia pha project knowledge base

### Kiểm tra

- git rev-parse --is-inside-work-tree
- rg --files
- rg -n "[ \t]+$" README.md AGENTS.md docs
- rg -n "^(<<<<<<<|=======|>>>>>>>)" README.md AGENTS.md docs
- git status --short
- git diff --check

### Ghi chú

- Chưa push remote.
- Chưa tạo code app.
- Chưa tạo package.json.
- Chưa tạo migration.
- Task tiếp theo đề xuất: Phase 1 - Project foundation.

## 2026-06-14 - Docs foundation

### Phase

Documentation foundation

### Việc đã làm

- Tạo bộ tài liệu nền cho dự án WEB GIA PHẢ.
- Tạo README.md, AGENTS.md và docs/*.md.
- Ghi stack chính thức.
- Ghi quy tắc làm việc cho AI coding.
- Ghi phase plan ban đầu.
- Ghi nguyên tắc export JSON/GEDCOM/ZIP bắt buộc từ đầu.

### File đã tạo/cập nhật

- README.md
- AGENTS.md
- docs/00_INDEX.md
- docs/01_PROJECT_OVERVIEW.md
- docs/02_ARCHITECTURE.md
- docs/03_DATABASE_MODEL.md
- docs/04_PERMISSION_PRIVACY_MODEL.md
- docs/05_TREE_UI_MODEL.md
- docs/06_EXPORT_BACKUP_MODEL.md
- docs/07_PHASE_PLAN.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Kiểm tra

- git diff --check

### Ghi chú

- Chưa triển khai code app.
- Chưa tạo migration.
- Chưa cài package.
- Thư mục hiện tại chưa phải Git repo tại thời điểm tạo tài liệu.
