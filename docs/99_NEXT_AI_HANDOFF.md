# Next AI Handoff

## 2026-07-01 - A-16Q - Session-specific Official Import Execution Approval Blocked

- Marker: `A-16Q`.
- Current status: `A16Q_STATUS=BLOCKED_MISSING_MARKER_OR_SESSION_ID`.
- A-16Q approval was not opened because the prompt did not provide both:
  `APPROVE_A16Q_OFFICIAL_IMPORT_SESSION_EXECUTION` as a session-specific owner
  approval record and `A16Q_IMPORT_SESSION_ID=<uuid>`.
- Missing session id: `A16Q_IMPORT_SESSION_ID=<uuid>`.
- Marker string appeared in the prompt only as the required condition/future
  marker wording, not as a concrete approval bound to a session id.
- Prior evidence remains staging-only: sheet `Thanh vien`, 102 staged members
  and 134 parent relationship candidates.
- A-16P-TX manual SQL apply/verification remains PASS; RPC
  `public.a16p_tx_execute_giapha4_official_import` exists but still fails
  closed.
- Official import remains locked: `canRunOfficialImport=false`, UI button
  disabled, no RPC call and no POST official import call.
- Do not run A-16R until owner provides exact session-specific marker:
  `APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_<SESSION_ID>`.
- Boundaries preserved: no SQL run, no DB push, no migration repair, no seed,
  no RLS change, no anon/public grant, no RPC call, no POST official import
  call, no real people/relationships/families/layout/tree/revision/profile
  write, no deploy and no push.

## 2026-07-01 - A-16P-TX-APPLY-VERIFY - Manual SQL Apply Verification Record

- Marker: `A-16P-TX-APPLY-VERIFY`.
- Current status: `A16P_TX_APPLY_VERIFY_STATUS=PASS_OWNER_CONFIRMED`.
- Owner confirmed manual apply of:
  `db/migrations/20260701_0012_a16p_tx_official_import_transaction_helper_candidate.sql`.
- Owner confirmed SELECT-only verification PASS from:
  `db/checks/20260701_check_a16p_tx_official_import_transaction_helper.sql`.
- Verification PASS evidence: function
  `public.a16p_tx_execute_giapha4_official_import` exists, is not
  `SECURITY DEFINER`, has fixed `search_path=public, pg_temp`, has no execute
  for `anon`/`public`, fails closed, has no A-16P policy on real tables and has
  no auto import trigger.
- Function comment still contains `NOT_APPLIED` from the original SQL candidate
  guardrail. This is documented as a stale safety comment; owner manual apply
  has been recorded, and the function still fails closed.
- Official import remains locked: `canRunOfficialImport=false`, UI button
  disabled, no RPC call and no POST official import call.
- A-16P-TX-APPLY-VERIFY did not run SQL, did not run DB push, did not run
  migration repair, did not seed, did not call RPC, did not call POST official
  import, did not write people/relationships/families/layout/tree/revision or
  profile data, did not deploy and did not push.
- Next safe phase: A-16Q Session-specific Official Import Execution Approval.
  Required future marker:
  `APPROVE_A16Q_OFFICIAL_IMPORT_SESSION_EXECUTION`.

## 2026-07-01 - A-16P-TX - Official Import Transaction Helper / RPC Schema Readiness

- Marker: `A-16P-TX`.
- Current status: `A16P_TX_STATUS=PASS_WITH_BLOCKER_TRANSACTION_NOT_APPLIED`.
- SQL candidate ready but not applied:
  `db/migrations/20260701_0012_a16p_tx_official_import_transaction_helper_candidate.sql`.
- Supabase mirror ready and must remain byte-for-byte identical:
  `supabase/migrations/20260701_0012_a16p_tx_official_import_transaction_helper_candidate.sql`.
- SELECT-only verification SQL:
  `db/checks/20260701_check_a16p_tx_official_import_transaction_helper.sql`.
- RPC/function contract:
  `public.a16p_tx_execute_giapha4_official_import`.
- Candidate is fail-closed and returns blockers; it does not open a real
  mutation branch in A-16P-TX.
- Runtime A-16P service knows RPC contract name but does not call RPC. It still
  returns `canRunOfficialImport=false` and blocker
  `BLOCKED_TRANSACTION_HELPER_NOT_APPLIED`.
- UI official import button remains disabled.
- Rollback/audit contract doc:
  `docs/PLAN_A16P_TX_ROLLBACK_AUDIT_MANIFEST_CONTRACT.md`.
- Readiness doc/checker:
  `docs/PLAN_A16P_TX_OFFICIAL_IMPORT_TRANSACTION_HELPER_READINESS.md` and
  `scripts/check-a16p-tx-official-import-transaction-helper-readiness.cjs`.
- Manual apply is NOT authorized in A-16P-TX. Future manual apply requires:
  `APPROVE_A16P_TX_RPC_MANUAL_SQL_APPLY`.
- Future session-specific execution after apply/verify requires:
  `APPROVE_A16Q_OFFICIAL_IMPORT_SESSION_EXECUTION`.
- Boundaries preserved: no DB apply, no SQL run, no Supabase db push, no
  migration repair, no seed, no RPC call, no POST official import call, no
  people/person write, no relationship/family write, no layout/tree/revision
  write, no deploy and no push.
- Next safe step: owner reviews SQL candidate. If accepted, open a separate
  `A-16P-TX-APPLY-VERIFY` phase with the manual apply marker.

## 2026-07-01 - A-16P - Official Import Runtime Candidate

- Marker present in prompt:
  `APPROVE_A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE`.
- Runtime marker: `A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE`.
- Current status: `A16P_STATUS=BLOCKED_TRANSACTION_HELPER_MISSING`.
- Added locked service candidate:
  `lib/import/giapha4/official-import-service.ts`.
- Added POST route candidate:
  `POST /api/admin/import-sessions/[sessionId]/official-import`.
- Route is fail-closed by server flag
  `A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED`; default is false and
  returns HTTP 423 with `Nhập chính thức chưa được bật trong môi trường này.`
- Future execution would still require body confirmations:
  `confirmMarker`, `confirmSessionId`, `confirmNoValidationErrors`,
  `confirmRollbackReviewed` and `confirmAuditReviewed`.
- Permission boundary uses existing strict set:
  `imports.create`, `people.create`, `relationships.create` and
  `permissions.manage`; no new permission seed or migration was created.
- Service candidate reads staging manifest, validation, dry-run preview and
  review pack only. It does not read Excel again and does not write real
  people/relationships/families/layout/revisions/profiles.
- Transaction capability is blocked: existing people/relationship/revision
  services use separate Supabase client writes and there is no safe
  all-or-nothing transaction helper/RPC.
- Blocker code: `A16P_BLOCKED_TRANSACTION_HELPER_MISSING`.
- UI remains disabled; no active button, no onClick and no form submit calls
  official import.
- Added doc/checker:
  `docs/PLAN_A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE.md` and
  `scripts/check-a16p-official-import-runtime-candidate.cjs`.
- Boundaries preserved: no import run, no POST official import call, no
  migration, no DB push, no SQL apply, no seed, no deploy, no push, no Excel or
  secret committed.
- Next safe step: A-16P-TX transaction RPC/schema readiness for official import.
  A-16Q should wait until transaction, rollback, audit and exact session-specific
  owner approval are complete.

## 2026-07-01 - A-16I4U/A-16M/A-16N/A-16O - Official Import Readiness Handoff

- Markers: `A-16I4U`, `A-16M`, `A-16N`, `A-16O`.
- Current statuses:
  `A16I4U_STATUS=PASS_OWNER_CONFIRMED_STAGING_ONLY_OFFICIAL_IMPORT_NOT_OPENED`,
  `A16M_STATUS=OFFICIAL_IMPORT_DESIGN_READY_RUNTIME_NOT_OPENED`,
  `A16N_STATUS=LOCKED_OFFICIAL_IMPORT_PREFLIGHT_GATE_READY`,
  `A16O_STATUS=OFFICIAL_IMPORT_RUNTIME_READINESS_HANDOFF_BLOCKED_UNTIL_A16P_MARKER`.
- Owner manually verified real Gia Pha 4 UI upload evidence: sheet
  `Thành viên` detected, `102` staged members, `134` parent relationship
  candidates, staging only.
- A-16SQL owner-applied staging RLS verification remains PASS: five staging
  tables have RLS enabled, authenticated SELECT/INSERT policies, authenticated
  UPDATE only on `import_sessions`, no anon/public staging policy,
  `imports.create` exists and no A-16SQL policy touches real genealogy tables.
- A-16M documents the future official import transaction/rollback/audit design;
  no official import write route or service was opened.
- A-16N adds a locked read-only preflight gate:
  `GET /api/admin/import-sessions/[sessionId]/official-import-gate`.
- `/admin/exports/import` now shows a disabled `Cổng nhập chính thức` block
  with required future marker
  `APPROVE_A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE`.
- Added docs/checkers:
  `docs/PLAN_A16I4U_MANUAL_UI_REAL_GIAPHA4_STAGING_UPLOAD_VERIFICATION.md`,
  `docs/PLAN_A16M_OFFICIAL_IMPORT_TRANSACTION_ROLLBACK_AUDIT_DESIGN.md`,
  `docs/PLAN_A16N_LOCKED_OFFICIAL_IMPORT_PREFLIGHT_GATE.md`,
  `docs/PLAN_A16O_OFFICIAL_IMPORT_RUNTIME_READINESS_HANDOFF.md`,
  `scripts/check-a16i4u-manual-ui-real-giapha4-staging-upload-verification.cjs`,
  `scripts/check-a16m-official-import-transaction-rollback-audit-design.cjs`,
  `scripts/check-a16n-locked-official-import-preflight-gate.cjs`, and
  `scripts/check-a16o-official-import-runtime-readiness-handoff.cjs`.
- Boundaries preserved: no migration, no DB push, no SQL apply, no seed, no
  deploy, no push, no service-role bypass, no import token, no official import,
  no real people/person write, no real relationship write, no
  family/layout/tree/revision/profile mutation.
- Next safe step: only open A-16P after owner gives
  `APPROVE_A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE`; A-16P must remain a
  separate runtime candidate phase with explicit transaction, rollback, audit
  and validation gates.
- Commit hash: use current `HEAD` after this local commit; final report records
  the exact hash.

## 2026-07-01 - A-16I3/A-16I4/A-16I5 - Gia Phả 4 Mapping, Real Staging Smoke, Owner Review Pack

- Markers: `A-16I3`, `A-16I4`, `A-16I5`.
- Current statuses:
  `A16I3_STATUS=XLSX_COLUMN_MAPPING_READY_STAGING_ONLY`,
  `A16I4_STATUS=REAL_STAGING_UPLOAD_SMOKE_READY_OR_SAFE_SKIP`,
  `A16I5_STATUS=OWNER_REVIEW_PACK_READY_OFFICIAL_IMPORT_CLOSED`.
- A-16I3 hardens the Gia Phả 4 `.xlsx` parser for sheet `Thành viên`, `Mã GP`,
  `Họ tên`, `Mã GP Bố`, `Mã GP Mẹ`, nullable placeholders, date parsing and
  parent-reference warnings.
- A-16I4 hardens the real staging smoke with reason codes:
  `AUTH_SESSION_MISSING`, `PERMISSION_IMPORTS_CREATE_MISSING`,
  `RLS_STAGING_WRITE_BLOCKED`, `PARSER_HEADER_MISSING`,
  `PARSER_SHEET_MISSING`, `PARSER_UNSUPPORTED_XLS`,
  `NETWORK_OR_BASE_URL_ERROR`, `UNKNOWN_UPLOAD_ERROR`.
- Owner reported A-16SQL manual Supabase Dashboard apply verification PASS:
  five staging tables have RLS enabled, authenticated SELECT/INSERT policies,
  authenticated UPDATE only on `import_sessions`, no anon/public staging policy,
  `imports.create` exists, and no A-16SQL policy touches real genealogy tables.
- A-16I5 adds read-only owner review pack:
  `GET /api/admin/import-sessions/[sessionId]/review-pack`.
- `/admin/exports/import` now includes `Gói rà soát trước khi nhập`; official
  import remains closed with `canProceedToOfficialImport=false` and
  `readyForOfficialImport=false`.
- Added docs/checkers:
  `docs/PLAN_A16I3_GIAPHA4_XLSX_COLUMN_MAPPING.md`,
  `docs/PLAN_A16I4_REAL_GIAPHA4_STAGING_UPLOAD_RUN.md`,
  `docs/PLAN_A16I5_IMPORT_REVIEW_PACK_OFFICIAL_IMPORT_GATE.md`,
  `scripts/check-a16i3-giapha4-xlsx-column-mapping.cjs`,
  `scripts/check-a16i4-real-giapha4-staging-upload-run.cjs`,
  `scripts/check-a16i5-import-review-pack-official-import-gate.cjs`.
- Boundaries preserved: no migration, no DB push, no SQL apply, no seed, no
  deploy, no push, no people/person write, no relationship write, no
  layout/tree/revision write, no service-role bypass and no official import.
- Next safe step: run a real staging upload smoke only with explicit owner env
  and a real `.xlsx` file outside the repo; any official import still requires a
  separate approval/transaction/rollback phase.

## 2026-06-30 - A-16SQL - Import Staging Write RLS Candidate

- Marker: `A-16SQL-RLS-IMPORT-STAGING-WRITE`.
- Final status: `A16SQL_STATUS=SQL_CANDIDATE_READY_NOT_APPLIED`.
- Actual A-16I symptom recorded:
  `Không đọc được file Gia Phả 4` and
  `Không tạo được import session staging. Bảng có thể đang được RLS bảo vệ hoặc bạn chưa có quyền ghi staging.`
- Added candidate:
  `db/migrations/20260630_0011_a16sql_import_staging_write_rls.sql`.
- Added Supabase mirror:
  `supabase/migrations/20260630_0011_a16sql_import_staging_write_rls.sql`.
- Added SELECT-only verification SQL:
  `db/checks/20260630_check_a16sql_import_staging_write_rls.sql`.
- Added doc:
  `docs/PLAN_A16SQL_RLS_IMPORT_STAGING_WRITE.md`.
- Added checker:
  `scripts/check-a16sql-rls-import-staging-write.cjs`.
- Added package command:
  `check:a16sql-rls-import-staging-write`.
- Candidate policy scope:
  `to authenticated`, requires `public.has_permission('imports.create')`,
  limits rows by `created_by = public.current_profile_id()`, opens
  `SELECT/INSERT/UPDATE` on `import_sessions` and `SELECT/INSERT` on child
  staging tables only.
- No `DELETE`, no anon/public policy, no grant, no service-role bypass, no RLS
  disable, no policy on real genealogy tables.
- A-16SQL did not run `supabase db push`, did not run
  `supabase db push --dry-run`, did not run SQL apply, did not run
  `supabase migration repair`, did not seed, did not import Excel, did not write
  people/person rows, did not write relationships, did not update
  layout/tree/revision, did not open official import, did not deploy and did not
  push.
- Next safe step: owner reviews/applies the SQL manually only in a separate
  approved DB phase, then runs the SELECT-only verification SQL and reruns
  A-16I/A-16I2 upload staging smoke.

## 2026-06-30 - A-16L - Dry-run Mapping Preview from Manifest Staging

- Marker: `A16L_DRY_RUN_MAPPING_PREVIEW_FROM_MANIFEST_STAGING`.
- Owner marker received for opening read-only preview:
  `APPROVE_A16K_IMPORT_DRY_RUN_GATE`.
- Added server-only dry-run preview service:
  `lib/import/giapha4/dry-run-mapping-preview-service.ts`.
- Added GET-only API:
  `GET /api/admin/import-sessions/[sessionId]/dry-run-preview`.
- `/admin/exports/import` now shows `Bản xem trước dry-run`,
  `Dữ liệu này chỉ là bản mô phỏng, chưa được ghi vào cây gia phả thật.`,
  `Người dự kiến tạo`, `Quan hệ dự kiến tạo` and
  `Không thể dry-run vì còn lỗi dữ liệu staging`.
- The preview derives proposed people/relationships from manifest staging and
  A-16J validation issues only in runtime/API response.
- Summary includes staged/proposed people and relationship counts,
  `blockedByErrorCount`, `warningCount` and
  `canProceedToOfficialImport: false`.
- Official import remains disabled:
  `Xác nhận nhập chính thức — chưa mở`.
- Added doc:
  `docs/PLAN_A16L_DRY_RUN_MAPPING_PREVIEW.md`.
- Added checker:
  `scripts/check-a16l-dry-run-mapping-preview.cjs`.
- Added package command:
  `check:a16l-dry-run-mapping-preview`.
- A-16L did not create/modify migrations, did not run `supabase db push`, did
  not run SQL apply, did not run `supabase migration repair`, did not seed, did
  not upload/parse a real file, did not write people/person rows, did not write
  relationships, did not update layout/tree/revision, did not open official
  import, did not deploy and did not push.
- Validation completed: `check:env:safe`, `check:migrations`,
  `check:a16g-import-session-read-manifest-runtime`,
  `check:a16h-import-manifest-auth-browser-smoke`,
  `check:a16i-upload-parse-giapha4-manifest-staging`,
  `check:a16j-manifest-staging-review-validation-warnings`,
  `check:a16i2-real-giapha4-upload-smoke`,
  `check:a16k-owner-approval-gate-dry-run-import`,
  `check:a16l-dry-run-mapping-preview`, `typecheck`, `lint` and `build`
  passed.
- `smoke:a16i2-real-giapha4-upload-staging` returned
  `SAFE_SKIP_MISSING_EXPLICIT_ENV` because owner base URL, storage state and
  real file path env were absent.
- Next options: owner reviews the preview and validation blockers; any official
  import still needs a separate approval/transaction/rollback/audit phase.

## 2026-06-30 - A-16K - Owner Approval Gate for Dry-run Import

- Marker: `A16K_OWNER_APPROVAL_GATE_DRY_RUN_IMPORT`.
- Required owner approval marker for a later phase:
  `APPROVE_A16K_IMPORT_DRY_RUN_GATE`.
- Added server-only gate service:
  `lib/import/giapha4/import-dry-run-approval-gate.ts`.
- Added GET-only status API:
  `GET /api/admin/import-sessions/[sessionId]/dry-run-gate`.
- `/admin/exports/import` now shows `Cổng phê duyệt dry-run`,
  `Dry-run import chưa được mở`, `Cần owner phê duyệt trước khi chạy dry-run.`,
  `Marker yêu cầu: APPROVE_A16K_IMPORT_DRY_RUN_GATE`,
  `Dữ liệu staging vẫn chưa được nhập vào cây gia phả thật.` and disabled
  `Chạy dry-run — cần phê duyệt`.
- Official import remains disabled:
  `Xác nhận nhập chính thức — chưa mở`.
- Added doc:
  `docs/PLAN_A16K_OWNER_APPROVAL_GATE_DRY_RUN_IMPORT.md`.
- Added checker:
  `scripts/check-a16k-owner-approval-gate-dry-run-import.cjs`.
- Added package command:
  `check:a16k-owner-approval-gate-dry-run-import`.
- A-16K did not create/modify migrations, did not run `supabase db push`, did
  not run SQL apply, did not run `supabase migration repair`, did not seed, did
  not upload/parse a real file, did not write people/person rows, did not write
  relationships, did not update layout/tree/revision, did not run dry-run
  mapping, did not open official import, did not deploy and did not push.
- Validation completed: `check:env:safe`, `check:migrations`,
  `check:a16g-import-session-read-manifest-runtime`,
  `check:a16h-import-manifest-auth-browser-smoke`,
  `check:a16i-upload-parse-giapha4-manifest-staging`,
  `check:a16j-manifest-staging-review-validation-warnings`,
  `check:a16i2-real-giapha4-upload-smoke`,
  `check:a16k-owner-approval-gate-dry-run-import`, `typecheck`, `lint`,
  `build`, `git diff --check` and `git diff --cached --check` passed.
- `smoke:a16i2-real-giapha4-upload-staging` returned
  `SAFE_SKIP_MISSING_EXPLICIT_ENV` because owner base URL, storage state and
  real file path env were absent.
- Next options:
  - A-16L only after owner explicitly provides
    `APPROVE_A16K_IMPORT_DRY_RUN_GATE`.
  - A-16I2-RUN if a real `.xlsx` staging smoke still needs owner-provided file
    and storage state outside git.

## 2026-06-30 - A-16I2 - Real Gia Phả 4 Upload Smoke

- Marker: `A16I2_REAL_GIAPHA4_UPLOAD_SMOKE`.
- Added explicit-env gated real-file staging smoke:
  `scripts/smoke-a16i2-real-giapha4-upload-staging.cjs`.
- Added checker:
  `scripts/check-a16i2-real-giapha4-upload-smoke.cjs`.
- Added doc:
  `docs/PLAN_A16I2_REAL_GIAPHA4_UPLOAD_SMOKE.md`.
- Added package commands:
  `smoke:a16i2-real-giapha4-upload-staging` and
  `check:a16i2-real-giapha4-upload-smoke`.
- Required env for a real run:
  `A16I2_GIAPHA4_REAL_UPLOAD_BASE_URL`,
  `A16I2_GIAPHA4_REAL_UPLOAD_STORAGE_STATE` and
  `A16I2_GIAPHA4_REAL_FILE_PATH`.
- Current local result:
  `A16I2_REAL_UPLOAD_SMOKE_STATUS=SAFE_SKIP_MISSING_EXPLICIT_ENV`.
- `A16I2_COUNTS_AVAILABLE=false` because no explicit owner file/session env was
  present, so the smoke did not open browser and did not read a real file.
- Real Gia Phả 4 file rule: must stay outside `D:\CODE\GIA PHẢ`; do not commit
  workbook, storage state, cookie/session file, screenshot or raw data log.
- `.xlsx` is the only real upload format supported by A-16I2. `.xls` returns
  `SAFE_SKIP_UNSUPPORTED_XLS` until a separate parser/dependency phase.
- Allowed mutation during real smoke: only
  `POST /api/admin/import-sessions/upload`.
- A-16I2 did not create/modify migrations, did not run `supabase db push`, did
  not run SQL apply, did not run `supabase migration repair`, did not seed, did
  not write real people/person rows, did not write real relationships, did not
  update layout/tree/revision, did not open official import, did not deploy and
  did not push.
- Validation completed: `check:env:safe`, `check:migrations`,
  `check:a16g-import-session-read-manifest-runtime`,
  `check:a16h-import-manifest-auth-browser-smoke`,
  `check:a16i-upload-parse-giapha4-manifest-staging`,
  `check:a16j-manifest-staging-review-validation-warnings`,
  `check:a16i2-real-giapha4-upload-smoke`, `typecheck`, `lint`, `build`,
  `git diff --check` and `git diff --cached --check` passed. The smoke command
  safe-skipped due to missing explicit env.
- Next options: rerun A-16I2 with owner-provided `.xlsx` outside repo and
  storage state, open A-16I3 if parser/validation hardening is needed, or open
  A-16K for owner approval gate design before any official import.

## 2026-06-30 - A-16J - Manifest Staging Review / Validation Warnings

- Marker: `A16J_MANIFEST_STAGING_REVIEW_VALIDATION_WARNINGS`.
- Final status target: `A16J_STATUS=MANIFEST_STAGING_VALIDATION_REVIEW_READY`.
- Added read-only validation service:
  `lib/import/giapha4/manifest-validation-service.ts`.
- Added GET-only API:
  `GET /api/admin/import-sessions/[sessionId]/validation`.
- `/admin/exports/import` now shows `Kiểm tra dữ liệu staging`, `Số người
  staging`, `Số quan hệ staging`, `Số lỗi`, `Số cảnh báo`, `Số thông tin`,
  `Lỗi cần xử lý`, `Cảnh báo dữ liệu` and `Gợi ý kiểm tra`.
- The UI still states `Dữ liệu này vẫn chưa được nhập vào cây gia phả thật.`
  and keeps `Xác nhận nhập chính thức — chưa mở` disabled.
- A-16J derives warnings/errors at runtime/read-only from the A-16I staging
  manifest. It does not write summary warnings back to DB.
- Added checker
  `scripts/check-a16j-manifest-staging-review-validation-warnings.cjs` and
  package command `check:a16j-manifest-staging-review-validation-warnings`.
- Updated A-16G/A-16H/A-16I checkers only to allow the explicit A-16J
  read-only files and route while preserving no official import/no real
  genealogy mutation checks.
- A-16J did not create/modify migrations, did not run `supabase db push`, did
  not run SQL apply, did not run `supabase migration repair`, did not seed, did
  not create people/person thật, did not create relationship thật, did not
  update layout/tree/revision, did not open official import, did not deploy and
  did not push.
- Validation completed: `check:env:safe`, `check:migrations`,
  `check:a16g-import-session-read-manifest-runtime`,
  `check:a16h-import-manifest-auth-browser-smoke`,
  `check:a16i-upload-parse-giapha4-manifest-staging`,
  `check:a16j-manifest-staging-review-validation-warnings`, `typecheck`,
  `lint`, `build`, `git diff --check` and `git diff --cached --check` all
  passed.
- Next recommended step after PASS: owner reviews real staging warnings in an
  authenticated environment; any official import still needs a separate
  approval/transaction/rollback phase.

## 2026-06-30 - A-16I - Upload/Parse Gia Phả 4 Into Manifest Staging

- Marker: `A16I_UPLOAD_PARSE_GIAPHA4_MANIFEST_STAGING`.
- Final status target: `A16I_STATUS=UPLOAD_PARSE_MANIFEST_STAGING_READY`.
- Added staging-only upload route:
  `POST /api/admin/import-sessions/upload`.
- Added parser/service/UI:
  `lib/import/giapha4/xlsx-staging-parser.ts`,
  `lib/import/giapha4/manifest-upload-service.ts` and
  `components/imports/giapha4-manifest-upload-form.tsx`.
- Parser uses existing `jszip`; no runtime dependency was added.
- Supported format in A-16I: `.xlsx` only. `.xls` returns a clear Vietnamese
  blocker until owner approves a binary `.xls` parser or converts the file to
  `.xlsx`.
- Upload route creates an import session staging and writes only the existing
  import manifest tables:
  `import_sessions`, `import_session_warnings`,
  `import_duplicate_candidates`, `import_relationship_candidates` and
  `import_write_manifests`.
- Because current schema has no `import_person_candidates` table, normalized
  person candidates are stored in draft
  `import_write_manifests.approved_scope.person_candidates` with marker
  `A16I_STAGING_ONLY_NOT_APPROVED`; this is for owner review only, not approval
  to import.
- A-16G read service/panel now surfaces staged people and relationships while
  keeping `canImport: false`.
- Official import remains disabled with
  `Xác nhận nhập chính thức — chưa mở`.
- RLS remains authoritative. The route uses Supabase server client with user
  cookies; if DB policies do not allow staging inserts, it returns a Vietnamese
  error instead of using service role to bypass RLS.
- Added checker
  `scripts/check-a16i-upload-parse-giapha4-manifest-staging.cjs` and package
  command `check:a16i-upload-parse-giapha4-manifest-staging`.
- Updated A-16G/A-16H checkers only to allow the explicit A-16I staging files
  and route while preserving no official import/no real genealogy mutation
  checks.
- A-16I did not create/modify migrations, did not run `supabase db push`, did
  not run SQL apply, did not run `supabase migration repair`, did not seed, did
  not create people/person thật, did not create relationship thật, did not
  update layout/tree/revision, did not open official import, did not deploy and
  did not push.
- Validation completed: `check:env:safe`, `check:migrations`,
  `check:a16g-import-session-read-manifest-runtime`,
  `check:a16h-import-manifest-auth-browser-smoke`,
  `check:a16i-upload-parse-giapha4-manifest-staging`, `typecheck`, `lint`,
  `build`, `git diff --check` and `git diff --cached --check` all passed.
- Next recommended step: A-16J validate/review manifest warnings before owner
  approval, or A-16I2 authenticated dev upload with owner-provided real Gia Phả
  4 file kept outside git.

## 2026-06-30 - A-16H - Authenticated Browser Smoke for Import Manifest Read Screen

- Marker: `A16H_IMPORT_MANIFEST_AUTH_BROWSER_SMOKE`.
- Added `docs/PLAN_A16H_IMPORT_MANIFEST_AUTH_BROWSER_SMOKE.md`,
  `scripts/smoke-a16h-import-manifest-auth-browser.cjs`,
  `scripts/check-a16h-import-manifest-auth-browser-smoke.cjs` and package
  commands `smoke:a16h-import-manifest-auth-browser` plus
  `check:a16h-import-manifest-auth-browser-smoke`.
- Smoke env contract:
  `A16H_IMPORT_MANIFEST_SMOKE_BASE_URL` and
  `A16H_IMPORT_MANIFEST_SMOKE_STORAGE_STATE`.
- Missing env safe-skips before browser navigation with
  `A16H_BROWSER_SMOKE_STATUS=SAFE_SKIP_MISSING_EXPLICIT_ENV`.
- With env and browser runtime, smoke opens `/admin/exports/import`, confirms no
  unexpected login/unauthorized redirect, checks Vietnamese copy including
  `Phiên nhập dữ liệu`, `Manifest dữ liệu`, preview-only warning text and
  disabled `Xác nhận nhập chính thức`, then fails on dangerous mutation network
  requests.
- A-16H did not create/modify migrations, did not run `supabase db push`, did
  not run SQL, did not seed/import data, did not upload/parse Gia Phả 4, did
  not create real import sessions, did not write people/relationships, did not
  write tree layout/revisions, did not enable official import, did not deploy
  and did not push.
- If current machine lacks explicit smoke env, expected result is checker PASS
  plus `A16H_BROWSER_SMOKE_STATUS=SAFE_SKIP_MISSING_EXPLICIT_ENV`. Current run
  produced that SAFE_SKIP because `A16H_IMPORT_MANIFEST_SMOKE_BASE_URL` was not
  set. A true
  authenticated PASS requires owner/operator-provided storage state outside the
  repo.
- Validation completed: `check:env:safe`, `check:migrations`,
  `check:a16g-import-session-read-manifest-runtime`,
  `check:a16h-import-manifest-auth-browser-smoke`, `typecheck`, `lint` and
  `build` passed; A-16H browser smoke safe-skipped for missing explicit env.
- Next options: A-16H2 authenticated rerun with explicit storage state, or a
  separate A-16I staging parser/upload phase that still forbids real
  people/relationship writes until owner approval.

## 2026-06-30 - A-16G - Import session read manifest runtime

- Marker: `A-16G`.
- Final status: `A16G_STATUS=IMPORT_SESSION_READ_MANIFEST_RUNTIME_READY`.
- Added read-only service
  `lib/import/giapha4/manifest-read-service.ts` with marker
  `A16G_IMPORT_SESSION_READ_MANIFEST_RUNTIME`.
- Added GET-only API routes:
  `/api/admin/import-sessions`,
  `/api/admin/import-sessions/[sessionId]` and
  `/api/admin/import-sessions/[sessionId]/manifest`.
- Added read-only admin UI panel on `/admin/exports/import` via
  `components/imports/import-session-manifest-panel.tsx`.
- Runtime uses existing auth/permission context and Supabase server client with
  user cookies, not service role in client code, so RLS remains authoritative.
- Empty/RLS-blocked states are safe and Vietnamese:
  `Chưa có phiên nhập dữ liệu`, `Chưa có dữ liệu manifest`,
  `Không tìm thấy phiên nhập hoặc bạn không có quyền truy cập.`
- API/UI keeps `canImport: false`; official import CTA is disabled:
  `Xác nhận nhập chính thức — chưa mở`.
- Added
  `docs/PLAN_A16G_IMPORT_SESSION_READ_MANIFEST_RUNTIME.md`,
  `scripts/check-a16g-import-session-read-manifest-runtime.cjs` and package
  command `check:a16g-import-session-read-manifest-runtime`.
- A-16G did not create/modify migrations, did not run `supabase db push`, did
  not run SQL, did not seed, did not import Excel into DB, did not create real
  people/relationships, did not update tree layout/revisions, did not deploy
  and did not push.
- Next A-16H options: authenticated browser smoke for this read-only manifest
  screen, or upload/parse Gia Pha 4 file into manifest staging only with a new
  explicit boundary.

## 2026-06-30 - A-16F5M - Manual SQL apply verified, migration reconciliation required

- Marker: `A-16F5M`.
- Final status:
  `A16F5M_STATUS=PASS_MANUAL_SQL_APPLY_VERIFIED_RECONCILIATION_REQUIRED`.
- Added
  `docs/PLAN_A16F5M_MANUAL_SQL_APPLY_VERIFICATION_MIGRATION_STATE_RECONCILIATION.md`,
  `scripts/check-a16f5m-manual-sql-apply-verification-migration-state-reconciliation.cjs`
  and package command
  `check:a16f5m:manual-sql-apply-verification-migration-state-reconciliation`.
- Owner reported manually applying
  `20260629_0010_a16d_import_manifest_storage_candidate.sql` in Supabase
  Dashboard after A-16F4R CLI link remained blocked.
- Owner reported read-only verification PASS:
  five import manifest tables exist, RLS is enabled, no unintended public/anon
  policy exists and row_count = 0 for all five tables.
- Verified locally that source/mirror migration remain byte-for-byte with hash
  `D22593729092FEF43C295126E74D5FDCD41ABD696A08DFEC63218C7E1851ABBE`.
- Important migration-history boundary: because SQL was applied manually in
  Dashboard, Supabase CLI migration history may not know this migration is
  already applied.
- Do not run this migration again through `supabase db push` and do not rerun
  the SQL file until a migration-history reconciliation plan exists.
- A-16F5M did not run `supabase db push`, did not run
  `supabase db push --dry-run`, did not apply DB, did not rerun SQL, did not
  seed, did not import Excel, did not write people/relationships, did not deploy
  and did not push.
- A-16G can open only as a separate phase limited to import manifest/session
  runtime behavior. Real people/relationship writes remain forbidden.

## 2026-06-29 - A-16F4R - Supabase DB dry-run only rerun blocked before dry-run

- Marker: `A16F4R_SUPABASE_DB_DRY_RUN_ONLY_RERUN_RECORDED`.
- Added `docs/PLAN_A16F4R_SUPABASE_DB_DRY_RUN_ONLY_RERUN.md`,
  `scripts/check-a16f4r-supabase-db-dry-run-only-rerun.cjs` and package command
  `check:a16f4r:supabase-db-dry-run-only-rerun`.
- `npx --yes supabase --version`: available, version `2.108.0`.
- Owner-confirmed project ref remains `frkyeuxrlcflmsxxsolp`.
- Source/mirror migration hash remains
  `D22593729092FEF43C295126E74D5FDCD41ABD696A08DFEC63218C7E1851ABBE`.
- Attempted
  `npx --yes supabase link --project-ref frkyeuxrlcflmsxxsolp`.
- Link failed with sanitized reason: `LegacyLinkProjectStatusError`; current
  Supabase account lacks necessary privileges to access the remote project
  status endpoint.
- Link metadata remains missing: `.supabase/`, `.supabase/.temp/` and
  `.supabase/.temp/project-ref` were not created.
- Final status: `A16F4R_STATUS=BLOCKED_SUPABASE_PROJECT_ACCESS_DENIED`.
- Blocker: `A16F4R_BLOCKER=SUPABASE_PROJECT_ACCESS_DENIED`.
- Dry-run command `npx --yes supabase db push --dry-run --linked` was not run
  because the project link gate failed.
- Expected migration for future retry:
  `20260629_0010_a16d_import_manifest_storage_candidate.sql` only.
- A-16F4R did not run `supabase db push --linked`, did not run
  `supabase db push --dry-run --linked`, did not apply DB, did not seed, did
  not import Excel, did not write people/relationships, did not deploy and did
  not push.
- To retry, owner/operator must use a Supabase account with privileges on
  project `frkyeuxrlcflmsxxsolp`, confirm link metadata, then run a dry-run-only
  phase again.
- A-16F5/A-16G/A-16H/A-16I remain blocked because schema dry-run/apply
  verification has not passed.
- Runtime guardrail status: Main Worker touched NO, runtime dependency added
  NO, new service Worker NO, OpenNext/Wrangler config changed NO, Worker size
  risk NO.

## 2026-06-29 - A-16F4 - Supabase DB dry-run only blocked before dry-run

- Marker: `A16F4_SUPABASE_DB_DRY_RUN_ONLY_RECORDED`.
- Added `docs/PLAN_A16F4_SUPABASE_DB_DRY_RUN_ONLY.md`,
  `scripts/check-a16f4-supabase-db-dry-run-only.cjs` and package command
  `check:a16f4:supabase-db-dry-run-only`.
- `npx --yes supabase --version`: available, version `2.108.0`.
- Owner-confirmed project ref remains `frkyeuxrlcflmsxxsolp`.
- Source/mirror migration hash remains
  `D22593729092FEF43C295126E74D5FDCD41ABD696A08DFEC63218C7E1851ABBE`.
- Attempted
  `npx --yes supabase link --project-ref frkyeuxrlcflmsxxsolp`.
- Link failed with sanitized reason: current Supabase account lacks necessary
  privileges to access the remote project status endpoint.
- Link metadata remains missing: `.supabase/` and `.supabase/.temp/project-ref`
  were not created.
- Final status: `A16F4_STATUS=BLOCKED_SUPABASE_AUTH_REQUIRED`.
- Blocker: `A16F4_BLOCKER=SUPABASE_LINK_PRIVILEGE_REQUIRED`.
- Dry-run command `npx --yes supabase db push --dry-run --linked` was not run
  because the project link gate failed.
- Expected migration for future retry:
  `20260629_0010_a16d_import_manifest_storage_candidate.sql` only.
- A-16F4 did not run `supabase db push --linked`, did not run
  `supabase db push --dry-run --linked`, did not apply DB, did not seed, did
  not import Excel, did not write people/relationships, did not deploy and did
  not push.
- To retry, owner/operator must use a Supabase account with privileges on
  project `frkyeuxrlcflmsxxsolp`, confirm link metadata, then run a dry-run-only
  phase again.
- A-16G/A-16H/A-16I remain blocked because schema dry-run/apply verification
  has not passed.
- Runtime guardrail status: Main Worker touched NO, runtime dependency added
  NO, new service Worker NO, OpenNext/Wrangler config changed NO, Worker size
  risk NO.

## 2026-06-29 - A-16F3 - Supabase Metadata Link Migration Path Bridge ready, link blocked

- Marker: `A16F3_SUPABASE_METADATA_LINK_MIGRATION_PATH_BRIDGE_RECORDED`.
- Added
  `docs/PLAN_A16F3_SUPABASE_METADATA_LINK_MIGRATION_PATH_BRIDGE.md`,
  `scripts/check-a16f3-supabase-metadata-link-migration-path-bridge.cjs`
  and package command
  `check:a16f3:supabase-metadata-link-migration-path-bridge`.
- `npx --yes supabase --version`: available, version `2.108.0`.
- Owner-confirmed project ref remains `frkyeuxrlcflmsxxsolp`.
- Ran `npx --yes supabase init --yes`, creating local metadata:
  `supabase/config.toml` and `supabase/.gitignore`.
- Local Supabase seed config is disabled: `[db.seed] enabled = false` and
  `sql_paths = []`.
- Did not run `npx --yes supabase link --project-ref frkyeuxrlcflmsxxsolp`
  because Supabase account/login state was not confirmed in this shell.
- Link result:
  `A16F3_PROJECT_LINK_RESULT=BLOCKED_SUPABASE_AUTH_REQUIRED_OR_ACCOUNT_NOT_CONFIRMED`.
- Created `supabase/migrations` and mirrored
  `db/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql`
  to
  `supabase/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql`.
- Byte-for-byte bridge PASS, SHA256 for both files:
  `D22593729092FEF43C295126E74D5FDCD41ABD696A08DFEC63218C7E1851ABBE`.
- Final status: `A16F3_STATUS=BRIDGE_READY_LINK_BLOCKED`.
- Canonical source remains `db/migrations`; `supabase/migrations` is the CLI
  mirror path and must stay byte-for-byte equivalent.
- A-16F3 did not run `supabase db push`, did not run
  `supabase db push --dry-run --linked`, did not apply DB, did not seed, did
  not insert/update/delete/upsert, did not import Excel, did not write
  people/relationships, did not deploy and did not push.
- Next planned phase: `A16F4_DRY_RUN_ONLY`. It should confirm Supabase
  account/login, link to `frkyeuxrlcflmsxxsolp`, verify project-ref metadata,
  run dry-run only if gates pass and still not apply DB.
- Any later apply phase still requires:
  `APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY`.
- A-16G/A-16H/A-16I remain blocked because schema apply verification has not
  passed.
- Runtime guardrail status: Main Worker touched NO, runtime dependency added
  NO, new service Worker NO, OpenNext/Wrangler config changed NO, Worker size
  risk NO.

## 2026-06-29 - A-16F2 - Supabase Project Link Migration Path Readiness blocked on link/path bridge

- Marker: `A16F2_SUPABASE_PROJECT_LINK_MIGRATION_PATH_READINESS_RECORDED`.
- Added
  `docs/PLAN_A16F2_SUPABASE_PROJECT_LINK_MIGRATION_PATH_READINESS.md`,
  `scripts/check-a16f2-supabase-project-link-migration-path-readiness.cjs`
  and package command
  `check:a16f2:supabase-project-link-migration-path-readiness`.
- `npx --yes supabase --version`: available, version `2.108.0`.
- Owner-confirmed project ref: `frkyeuxrlcflmsxxsolp`.
- Final status: `A16F2_STATUS=SAFE_SKIP_OR_BLOCKED`.
- Project link readiness: `A16F2_PROJECT_LINK_READINESS=BLOCKED_NOT_LINKED`.
- Migration path readiness:
  `A16F2_MIGRATION_PATH_READINESS=BLOCKED_PATH_STRATEGY_NOT_APPLIED`.
- Missing metadata: `.supabase/`, `supabase/`, `supabase/config.toml`,
  `supabase/migrations`, `.supabase/project-ref` and
  `.supabase/.temp/project-ref`.
- Existing candidate remains in
  `db/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql`.
- Recommendation for A-16F3:
  `A16F2_A16F3_RECOMMENDATION=CREATE_SUPABASE_METADATA_AND_BRIDGE_CANDIDATE_WITH_EXPLICIT_CHECKER`.
- A-16F2 did not run `supabase init`, did not run `supabase link`, did not run
  `supabase db push`, did not run `supabase db push --dry-run --linked`, did
  not apply DB, did not seed, did not insert/update/delete/upsert, did not
  import Excel, did not write people/relationships, did not deploy and did not
  push.
- To continue safely, A-16F3 should confirm owner/operator Supabase account,
  run/init link metadata if approved, create `supabase/migrations`, copy the
  A-16D candidate there with a byte-for-byte equivalence checker, and still
  avoid db push until a later apply-verification phase with marker
  `APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY`.
- A-16G/A-16H/A-16I remain blocked because schema apply verification has not
  passed.
- Runtime guardrail status: Main Worker touched NO, runtime dependency added
  NO, new service Worker NO, OpenNext/Wrangler config changed NO, Worker size
  risk NO.

## 2026-06-29 - A-16F1 - Supabase CLI Project Link Readiness blocked on project link

- Marker: `A16F1_SUPABASE_CLI_PROJECT_LINK_READINESS_RECORDED`.
- Added `docs/PLAN_A16F1_SUPABASE_CLI_PROJECT_LINK_READINESS.md`,
  `scripts/check-a16f1-supabase-cli-project-link-readiness.cjs` and package
  command `check:a16f1:supabase-cli-project-link-readiness`.
- Final status: `A16F1_STATUS=SAFE_SKIP_OR_BLOCKED`.
- `supabase --version`: unavailable in PATH.
- `npx --yes supabase --version`: available, version `2.108.0`.
- Project link readiness:
  `A16F1_PROJECT_LINK_READINESS=BLOCKED_MISSING_SUPABASE_PROJECT_LINK`.
- Missing link metadata: `.supabase/`, `supabase/`, `supabase/config.toml`,
  `.supabase/project-ref` and `.supabase/.temp/project-ref`.
- Env presence was checked by `npm run check:env:safe` names-only; no secret
  values were printed and `.env.local` was not read directly.
- Owner did not provide an exact GIA PHA project ref in this phase, so no
  `supabase link` command was run.
- A-16F1 did not run `supabase db push`, did not run
  `supabase db push --dry-run --linked`, did not apply DB, did not seed, did
  not insert/update/delete/upsert, did not import Excel, did not write
  people/relationships, did not deploy and did not push.
- To retry A-16F apply verification safely, owner/operator must confirm exact
  GIA PHA Supabase project ref, confirm the logged-in Supabase account, create
  or verify project link metadata, confirm backup/rollback/no-go position and
  provide the apply marker again:
  `APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY`.
- A-16G/A-16H/A-16I remain blocked because schema apply verification still has
  not passed.
- Runtime guardrail status: Main Worker touched NO, runtime dependency added
  NO, new service Worker NO, OpenNext/Wrangler config changed NO, Worker size
  risk NO.

## 2026-06-29 - A-16F - Import Schema DB Apply Verification blocked safely

- Marker: `A16F_IMPORT_SCHEMA_DB_APPLY_VERIFICATION_RECORDED`.
- Owner approval marker was present exactly:
  `APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY`.
- Added `docs/PLAN_A16F_IMPORT_SCHEMA_DB_APPLY_VERIFICATION.md`,
  `scripts/check-a16f-import-schema-db-apply-verification.cjs` and package
  command `check:a16f:import-schema-db-apply-verification`.
- Final status: `A16F_STATUS=SAFE_SKIP_OR_BLOCKED`.
- Dry-run result:
  `A16F_DB_DRY_RUN_RESULT=BLOCKED_SUPABASE_CLI_NOT_AVAILABLE`.
- Apply result: `A16F_DB_APPLY_RESULT=NOT_RUN`.
- Schema verification result: `A16F_SCHEMA_VERIFICATION_RESULT=NOT_RUN_NO_APPLY`.
- RLS verification result:
  `A16F_RLS_VERIFICATION_RESULT=STATIC_CANDIDATE_ONLY_NOT_LIVE_DB`.
- `supabase --version` failed because the `supabase` command is not available
  in PATH.
- Project link check is blocked: no `.supabase/` or `supabase/` project-link
  metadata exists in the checkout, so the target project cannot be confirmed
  safely.
- No `npx` fallback was used; no secret was read or printed; `.env.local` was
  not read.
- A-16F did not run `supabase db push --dry-run --linked`, did not run
  `supabase db push --linked`, did not apply DB, did not seed, did not mutate
  people/relationships, did not import Excel, did not enable runtime import
  write, did not add dependency, did not deploy and did not push.
- To retry A-16F, owner/operator must provide an approved Supabase CLI path or
  install CLI, confirm the exact GIA PHA Supabase project link safely, confirm
  backup/rollback/no-go position and rerun dry-run before any apply.
- A-16G/A-16H/A-16I remain blocked because schema apply verification did not
  PASS.
- Runtime guardrail status: Main Worker touched NO, runtime dependency added
  NO, new service Worker NO, OpenNext/Wrangler config changed NO, Worker size
  risk NO.

## 2026-06-29 - A-16E2 - Import Schema Candidate Apply Blocker Resolution recorded

- Marker: `A16E2_IMPORT_SCHEMA_CANDIDATE_APPLY_BLOCKER_RESOLUTION`.
- Added
  `docs/PLAN_A16E2_IMPORT_SCHEMA_CANDIDATE_APPLY_BLOCKER_RESOLUTION.md`,
  `scripts/check-a16e2-import-schema-candidate-apply-blocker-resolution.cjs`
  and package command
  `check:a16e2:import-schema-candidate-apply-blocker-resolution`.
- Updated
  `db/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql`
  while it remains `NOT_APPLIED`. No DB apply, no dry-run and no
  `supabase db push` were run.
- Candidate hardening added A-16E2 marker, explicit `NOT_APPLIED` marker,
  no raw Excel/PII guard comments, RLS fail-closed guard comment, source file
  size check, manifest hash/approval consistency checks and JSON object checks.
- Blocker categories recorded: `SCHEMA_BLOCKER`, `RLS_BLOCKER`,
  `PERMISSION_BLOCKER`, `PII_BLOCKER`, `RUNTIME_DEPENDENCY_BLOCKER` and
  `REVIEW_ONLY_CAUTION`.
- Updated schema recommendation:
  `A16E2_SCHEMA_APPLY_RECOMMENDATION=READY_FOR_A16F_DB_APPLY_REVIEW`.
- This means the schema candidate is ready for owner review of A-16F, not that
  DB apply is authorized. A-16F still requires the exact marker
  `APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY`.
- Remaining apply blockers: target Supabase project confirmation,
  backup/rollback/no-go position, A-16F dry-run/apply verification and later
  runtime RLS/grant approach.
- A-16G remains blocked until A-16F apply/verification PASS. A-16H remains
  blocked until parser dependency marker. A-16I remains blocked until schema
  apply PASS, parser or approved preview source, owner-approved manifest and
  DB-write marker.
- Runtime guardrail status: Main Worker touched NO, runtime dependency added
  NO, new service Worker NO, OpenNext/Wrangler config changed NO, Worker size
  risk NO.

## 2026-06-29 - A-16E1 - Owner Review Import Schema Apply Gate recorded

- Marker: `A16E1_OWNER_REVIEW_IMPORT_SCHEMA_APPLY_GATE`.
- Added
  `docs/PLAN_A16E1_OWNER_REVIEW_IMPORT_SCHEMA_APPLY_GATE.md`,
  `scripts/check-a16e1-owner-review-import-schema-apply-gate.cjs` and package
  command `check:a16e1:owner-review-import-schema-apply-gate`.
- A-16E1 is owner review/docs/checker only. It did not apply DB, did not run
  `supabase db push`, did not run dry-run, did not connect production DB, did
  not seed, did not mutate data, did not add dependency, did not deploy and did
  not push.
- Reviewed A-16D SQL candidate and A-16E apply gate. Result:
  `A16E1_REVIEW_RESULT=PASS_WITH_OWNER_APPLY_GATE_BLOCKED`.
- Apply recommendation remains `DO_NOT_APPLY_YET` until owner provides
  `APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY` plus target Supabase project
  confirmation, backup/rollback/no-go position, dry-run plan and RLS/grant
  runtime approach.
- Static SQL review found no direct safety failure: no dangerous `DROP TABLE`,
  `TRUNCATE`, `DELETE FROM`, data `UPDATE`, seed/data `INSERT`, broad `GRANT`,
  `CREATE POLICY` or RLS disable statement.
- Naming/schema review: migration path follows `db/migrations` convention; the
  five import tables do not conflict with current people/family/lineage tables;
  optional `clan_id`/`branch_id` are reasonable but later runtime must confirm
  exact import scope because there is no single `genealogy_id`/`family_tree_id`.
- RLS/Data API note: the candidate stays fail-closed with RLS enabled and no
  policies/grants. Later runtime must approve grants and RLS policies together
  if client/Data API access is needed.
- A-16F remains blocked until exact owner marker appears. A-16G remains blocked
  until A-16F apply/verification PASS. A-16H remains blocked until parser
  dependency marker. A-16I remains blocked until schema apply PASS, parser or
  approved preview data source, owner-approved manifest and DB-write marker.
- Runtime guardrail status: Main Worker touched NO, runtime dependency added
  NO, new service Worker NO, OpenNext/Wrangler config changed NO, Worker size
  risk NO.

## 2026-06-29 - A-16E - Import Schema Candidate / DB Apply Gate recorded

- Marker: `A16E_IMPORT_SCHEMA_CANDIDATE_DB_APPLY_GATE`.
- Added
  `docs/PLAN_A16E_IMPORT_SCHEMA_CANDIDATE_DB_APPLY_GATE.md`,
  `scripts/check-a16e-import-schema-candidate-db-apply-gate.cjs` and package
  command `check:a16e:import-schema-candidate-db-apply-gate`.
- A-16E is review/design/checker only. It did not apply DB, did not run
  `supabase db push`, did not connect to production DB, did not seed, did not
  mutate data, did not add dependency, did not deploy and did not push.
- Reviewed A-16D SQL candidate static safety: additive candidate tables/indexes
  only; no `DROP`, `TRUNCATE`, `DELETE FROM`, data `UPDATE`, seed/data
  `INSERT`, broad `GRANT`, `CREATE POLICY` or RLS disable statement.
- Reviewed schema logic as sufficient for import sessions, warnings, duplicate
  candidates, relationship candidates and write manifests, including hashes,
  lifecycle status, owner decisions and rollback/write manifest shape.
- Reviewed RLS as fail-closed: RLS is enabled on the five import tables and no
  policies/grants are created. Future runtime/Data API access must approve
  exact grants and RLS policies together.
- Supabase docs/changelog note: new public-schema tables may require explicit
  grants for Data API access in current/future Supabase behavior; A-16E
  intentionally does not grant access.
- Hard stop: required owner marker
  `APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY` is not present. Do not run
  A-16F, do not apply DB, do not create a fake marker.
- A-16G remains blocked until A-16F schema apply/verification PASS. A-16H
  remains blocked until explicit Excel parser dependency marker. A-16I remains
  blocked until schema apply PASS, parser/preview evidence, owner-approved
  manifest and DB-write marker.
- Runtime guardrail status: Main Worker touched NO, runtime dependency added
  NO, new service Worker NO, OpenNext/Wrangler config changed NO, Worker size
  risk NO.

## 2026-06-29 - A-16D - Import Schema Candidate / Manifest Storage Design recorded

- Marker: `A16D_IMPORT_SCHEMA_CANDIDATE_MANIFEST_STORAGE_DESIGN`.
- Added
  `docs/PLAN_A16D_IMPORT_SCHEMA_CANDIDATE_MANIFEST_STORAGE_DESIGN.md`,
  `db/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql`,
  `scripts/check-a16d-import-schema-candidate-manifest-storage-design.cjs`
  and package command
  `check:a16d:import-schema-candidate-manifest-storage-design`.
- A-16D is schema candidate/design/checker only. The SQL file is
  `NOT_APPLIED`; no `supabase db push`, DB connection, migration apply, seed,
  production mutation, dependency, deploy or push was performed.
- Candidate tables are `import_sessions`, `import_session_warnings`,
  `import_duplicate_candidates`, `import_relationship_candidates` and
  `import_write_manifests`.
- Candidate RLS is fail-closed: RLS is enabled on all five tables, but A-16D
  creates no policies and no permission seed. Future policy/permission design
  requires separate approval.
- Privacy boundary: no real Gia Pha 4.0 Excel/CSV file, raw workbook content,
  screenshot or real personal data was committed. Candidate storage is intended
  for metadata, source hashes, counts, fingerprints, owner decisions, approved
  scope and rollback manifest data.
- Updated A-16/A-16B/A-16C checker allowlists narrowly so their old checks pass
  while accepting only the A-16D doc/checker/not-applied SQL candidate.
- Next possible phase: A-16E DB apply verification gate for the import manifest
  schema candidate, requiring explicit owner approval marker
  `APPROVE_A16E_IMPORT_MANIFEST_SCHEMA_APPLY`, backup readiness, target project
  confirmation, one-file apply plan, rollback/no-go plan and post-apply catalog
  verification.
- Real import DB write runtime remains blocked until A-16F or a later explicit
  approval marker `APPROVE_A16F_GIAPHA4_IMPORT_DB_WRITE_RUNTIME` after parser,
  owner review, schema apply verification and rollback evidence are complete.
- Runtime guardrail status: Main Worker touched NO, runtime dependency added
  NO, new service Worker NO, OpenNext/Wrangler config changed NO, Worker size
  risk NO, deploy NO.

## 2026-06-29 - A-16C - Owner Review Import Preview DB Write Approval Design recorded

- Marker: `A16C_OWNER_REVIEW_IMPORT_PREVIEW_DB_WRITE_APPROVAL_DESIGN`.
- Added
  `docs/PLAN_A16C_OWNER_REVIEW_IMPORT_PREVIEW_DB_WRITE_APPROVAL_DESIGN.md`,
  `scripts/check-a16c-owner-review-import-preview-db-write-approval-design.cjs`
  and package command
  `check:a16c:owner-review-import-preview-db-write-approval-design`.
- A-16C is design/documentation/checker only. It does not add import write
  runtime, migration, seed, dependency, deploy, DB mutation, Excel file or real
  personal data.
- Owner review workflow now covers summary, person candidates, parent-child,
  spouse/couple, duplicate/ambiguity, privacy/private notes, scope confirmation
  and owner approval marker.
- Future approval states are design-only:
  `preview_generated`, `owner_reviewing`, `warnings_acknowledged`,
  `duplicates_reviewed`, `relationships_reviewed`, `privacy_reviewed`,
  `ready_for_owner_approval`, `owner_approved_for_db_write`,
  `rejected_needs_fix`, `expired_preview`.
- Future approval markers:
  `APPROVE_A16D_GIAPHA4_IMPORT_SCHEMA_CANDIDATE` for schema candidate work or
  `APPROVE_A16E_GIAPHA4_IMPORT_DB_WRITE_RUNTIME` for DB-write runtime if no
  schema is needed. Marker must bind to exact preview summary hash/manifest id
  and cannot be reused for a different Excel file or changed mapping.
- Future write design requires held rows, no auto merge/delete, no ambiguous
  relationship auto-link, rollback manifest, source manifest/hash, actor and
  timestamp.
- Next likely step: A-16D schema candidate if persistent import manifest/review
  state is needed; otherwise A-16E can only open with explicit owner approval,
  parser/offline conversion approval, backup/rollback plan and completed review
  evidence.
- Runtime guardrail status: Main Worker touched NO, runtime dependency added NO,
  new service Worker NO, OpenNext/Wrangler config changed NO, Worker size risk
  NO.

## 2026-06-29 - A-16B - Gia Pha 4.0 Excel Import Preview Runtime UI recorded

- Marker: `A16B_GIAPHA4_EXCEL_IMPORT_PREVIEW_RUNTIME_UI`.
- Added
  `docs/PLAN_A16B_GIAPHA4_EXCEL_IMPORT_PREVIEW_RUNTIME_UI.md`,
  `scripts/check-a16b-giapha4-excel-import-preview-runtime-ui.cjs`,
  `lib/import/giapha4/types.ts`, `lib/import/giapha4/normalize.ts`,
  `lib/import/giapha4/parser.ts`, `lib/import/giapha4/preview.ts`,
  `app/api/admin/import/giapha4/preview/route.ts` and
  `components/imports/giapha4-import-preview-form.tsx`.
- Updated `/admin/exports/import` to include a Gia Pha 4.0 Excel preview panel
  before the existing `family.json` import preview.
- A-16B remains preview-only and safe-skip because no approved Excel parser
  dependency exists. No `xlsx`/`exceljs` dependency was added.
- Runtime status:
  `A16B_PREVIEW_RUNTIME_STATUS=SAFE_SKIP_MISSING_EXCEL_PARSER_DEPENDENCY`.
- API route: `POST /api/admin/import/giapha4/preview`. It uses existing
  permission context, accepts multipart file metadata, enforces a 5MB limit and
  returns preview JSON with `db_write: false`, `printed_pii: false` and
  `stored_file: false`.
- UI does not show raw filename; it shows extension and size only. It has
  `Xem trước dữ liệu`, `Tải lại file` and disabled `Nhập dữ liệu thật` with
  copy that real import opens only after owner approval in a later phase.
- No real Excel/CSV file, no real personal data, no DB mutation, no migration,
  no seed, no auth/RLS/permission/API contract expansion, no deploy and no push.
- Next A-16C can open only after owner approves a parser dependency or offline
  conversion path, sanitized fixture rules, privacy-safe preview evidence and
  explicit separate DB-write/import approval gates.
- Runtime guardrail status: Main Worker touched YES for small admin UI/API
  coordination only, runtime dependency added NO, new service Worker NO,
  OpenNext/Wrangler config changed NO, Worker size risk LOW.

## 2026-06-29 - A-16 - Import Du Lieu Gia Pha 4.0 Tu File Excel iPhone recorded

- Marker: `A16_GIAPHA4_EXCEL_IMPORT_MAPPING_READINESS`.
- Added `docs/PLAN_A16_GIAPHA4_EXCEL_IMPORT_MAPPING_READINESS.md`,
  `scripts/inspect-giapha4-excel-import.cjs`,
  `scripts/check-a16-giapha4-excel-import-mapping-readiness.cjs`
  and package commands
  `check:a16:giapha4-excel-import-mapping-readiness` and
  `inspect:giapha4-excel`.
- A-16 is preview/design/readiness only. It does not import rows, mutate
  Supabase, create migrations, seed data, change RLS/auth/permission/API
  contracts, deploy, push or commit a real Gia Pha 4.0 workbook.
- Safe sample search checked `data/import-samples/`, `tmp/`, `private/` and the
  project root. No `.xls`, `.xlsx` or `.csv` source file was found in those
  inspected locations.
- Direct parser dependency status: `xlsx` MISSING, `exceljs` MISSING,
  `csv-parse` MISSING, `papaparse` MISSING. No dependency was added in A-16.
- The inspector safe-skips without a path (`SAFE_SKIP_NO_INPUT_PATH`) and, if a
  workbook path is provided while no parser is installed, reports
  `SAFE_SKIP_EXCEL_DEPENDENCY_MISSING` with file metadata only. It must not
  print raw PII, write output files or perform DB writes.
- Mapping plan covers person fields (`full_name` / `display_name`, gender,
  birth/death dates, hometown, generation, notes), parent/child links,
  spouse/couple links, duplicate candidate policy, privacy handling and manual
  review gates.
- Next phase A16B can be considered only with owner approval for a parser
  dependency or offline parsing path, sanitized fixture rules, preview evidence
  and an explicit separate DB-write/import approval gate.
- Runtime guardrail status: Main Worker touched NO, dependency added NO, new
  service Worker NO, OpenNext/Wrangler config changed NO.

## 2026-06-29 - A-15E3 - Safe GitHub Actions Linux Production Deploy Verification recorded

- Marker: `A15E3_SAFE_GITHUB_ACTIONS_LINUX_PRODUCTION_DEPLOY_VERIFICATION`.
- Added
  `docs/PLAN_A15E3_SAFE_GITHUB_ACTIONS_LINUX_PRODUCTION_DEPLOY_VERIFICATION.md`,
  `scripts/check-a15e3-safe-github-actions-linux-production-deploy-verification.cjs`
  and package command
  `check:a15e3:safe-github-actions-linux-production-deploy-verification`.
- Owner reported running the manual GitHub Actions Cloudflare Deploy workflow
  after A-15E2. This phase did not call GitHub API and did not independently
  read workflow run status; owner success/failure confirmation is still the
  source for the workflow UI result.
- Verified deploy workflow locally: `.github/workflows/cloudflare-deploy.yml`
  is `workflow_dispatch`, `ubuntu-latest`, Node.js `24`, has the Cloudflare and
  Supabase env contract, and deploys with `npm run deploy`.
- Verified OpenNext Build Gate: `.github/workflows/opennext-build-gate.yml`
  can run on push, but it does not deploy production.
- GitHub Actions warning about Node.js 20 deprecation/actions being forced to
  Node.js 24 is recorded as
  `NON_BLOCKING_GITHUB_ACTIONS_RUNNER_ADVISORY_IF_WORKFLOW_SUCCESS`.
- Production smoke after owner-reported GitHub Actions deploy PASS:
  `/` 200, `/tree` 200, `/auth/login` 200, `/admin` 307 redirect to login.
- `npx wrangler deployments list` showed current active version
  `f8287634-ecfa-45f6-ac8a-d519e1b4e30b` with 100% traffic; prior known good
  rollback version remains `4134298b-ef89-4099-b20b-b13995f397c8`.
- A-15E3 status:
  `A15E3_STATUS=PASS_GITHUB_ACTIONS_LINUX_DEPLOY_VERIFIED`.
- Next policy: do not deploy production from Windows; use manual GitHub Actions
  Linux deploy; do not enable auto deploy on push until a separate owner-approved
  phase after several manual deploys pass.
- Runtime guardrail status: Main Worker touched NO, dependency added NO, new
  service Worker NO, OpenNext/Wrangler config changed NO, deploy NO from this
  phase.

## 2026-06-29 - A-15E2 - Production 500 Rollback & Deploy Failure Diagnostics recorded

- Marker: `A15E2_PRODUCTION_500_ROLLBACK_DEPLOY_FAILURE_DIAGNOSTICS`.
- Added
  `docs/PLAN_A15E2_PRODUCTION_500_ROLLBACK_DEPLOY_FAILURE_DIAGNOSTICS.md`,
  `scripts/check-a15e2-production-500-rollback-deploy-failure-diagnostics.cjs`
  and package command
  `check:a15e2:production-500-rollback-deploy-failure-diagnostics`.
- Owner-reported incident: a new production deploy using `npx wrangler deploy`
  after `npm run build` caused HTTP 500 on `/`, `/tree`, `/auth/login` and
  `/admin`. Wrangler reported OpenNext project detection and OpenNext warned
  Windows is not fully compatible.
- Owner rollback succeeded to Worker version
  `4134298b-ef89-4099-b20b-b13995f397c8`.
- A-15E2 read-only production check after rollback observed:
  `/` 200, `/tree` 200, `/auth/login` 200 and `/admin` 307 redirect to login.
- `npx wrangler deployments list` showed final rollback traffic on
  `4134298b-ef89-4099-b20b-b13995f397c8`; it also showed failed candidate
  versions around the incident window. Do not redeploy from this phase.
- `npx wrangler secret list` was names-only and showed
  `SUPABASE_SERVICE_ROLE_KEY`; no secret values were logged. Public Supabase/App
  vars still need explicit verification in A-15E3 before any retry.
- Next safe step: create a separate A-15E3 owner-approved deploy retry/preflight
  phase, preferably using WSL or GitHub Actions Linux, one documented deploy
  path, env/secret verification, immediate route smoke and rollback plan.
- Runtime guardrail status: Main Worker touched NO, dependency added NO, new
  service Worker NO, OpenNext/Wrangler config changed NO, deploy NO.

## 2026-06-29 - A-15E - Heritage UI Production Deploy Readiness & Smoke recorded

- Marker: `A15E_HERITAGE_UI_PRODUCTION_DEPLOY_READINESS_SMOKE`.
- Added `docs/PLAN_A15E_HERITAGE_UI_PRODUCTION_DEPLOY_READINESS_SMOKE.md`.
- Added `scripts/check-a15e-heritage-ui-production-deploy-readiness-smoke.cjs`
  and package command
  `check:a15e:heritage-ui-production-deploy-readiness-smoke`.
- Git/GitHub status before A-15E edits: `GIT_STATUS=PASS_SYNCED_CLEAN`;
  `HEAD...origin/main` was `0 0`; `.env.local` remains ignored.
- Production deploy status:
  `PRODUCTION_DEPLOY_READINESS_STATUS=SAFE_SKIP_SECRET_ROTATION_REQUIRED`,
  `DEPLOY_STATUS=SAFE_SKIP_SECRET_ROTATION_REQUIRED`.
- Blockers: no `APPROVE_A15E_PRODUCTION_DEPLOY` marker, service role key
  rotation not owner-confirmed after prior exposure, and local Wrangler context
  could not verify production secret list for `web-gia-pha`.
- Existing production read-only smoke was partial only: `/`, `/tree` and
  `/auth/login` returned 200, `/admin` returned 307 to login, and no forbidden
  secret/privacy marker was counted. No authenticated production smoke was run.
- No deploy, push, UI change, DB migration, seed, data mutation, env commit,
  secret log, auth/runtime/API/service change, dependency or OpenNext/Wrangler
  config change.
- Next deploy attempt requires owner confirmation that service role key has been
  rotated and production secrets updated, then explicit marker
  `APPROVE_A15E_PRODUCTION_DEPLOY`.

## 2026-06-29 - A-15B2 - Manual Authenticated Admin Heritage UI Smoke recorded

- Marker: `A15B2_MANUAL_AUTHENTICATED_ADMIN_HERITAGE_UI_SMOKE`.
- Added `docs/PLAN_A15B2_MANUAL_AUTHENTICATED_ADMIN_HERITAGE_UI_SMOKE.md`.
- Added `scripts/check-a15b2-manual-authenticated-admin-heritage-ui-smoke.cjs`
  and package command
  `check:a15b2:manual-authenticated-admin-heritage-ui-smoke`.
- Owner manual confirmation recorded:
  `Manual owner/admin login: PASS_OWNER_CONFIRMED`,
  `Supabase callback URL config: PASS_OWNER_CONFIRMED`, `/admin real browser
  session: PASS_OWNER_CONFIRMED`.
- Current conclusion: `AUTH_RUNTIME_STATUS=PASS_OWNER_CONFIRMED`;
  `AUTOMATED_BROWSER_SMOKE_STATUS=NEEDS_PERSISTED_SESSION_CONTEXT`;
  `A15C3_AUTH_FIX_NEEDED=false`; `A15D_PERMISSION_SEED_NEEDED=false`.
- A-15B1/A-15C2 `auth_session_missing` is treated as the automated smoke browser
  context not carrying the owner/admin session, not as an auth runtime defect.
- If future authenticated automation is needed, open a separate persisted browser
  storage-state/manual session handoff phase without committing cookie/token/
  storage-state artifacts.
- No UI polish, auth runtime change, mutation, seed, role assignment, schema/RLS/
  permission/API/service runtime change, dependency, `.env.local` commit, deploy
  or push.

## 2026-06-29 - A-15C2 - Supabase Auth Browser Session Binding Diagnostics recorded

- Marker: `A15C2_SUPABASE_AUTH_BROWSER_SESSION_BINDING_DIAGNOSTICS`.
- Added `docs/PLAN_A15C2_SUPABASE_AUTH_BROWSER_SESSION_BINDING_DIAGNOSTICS.md`.
- Added `scripts/smoke-a15c2-auth-browser-session-binding-diagnostics.cjs`,
  `scripts/check-a15c2-supabase-auth-browser-session-binding-diagnostics.cjs`,
  package commands `smoke:a15c2:supabase-auth-browser-session-binding-diagnostics`
  and `check:a15c2:supabase-auth-browser-session-binding-diagnostics`.
- A-15C remains PASS at DB/auth/profile/role/permission readiness:
  `OWNER_ADMIN_PERMISSION_READY_READ_ONLY`, `ROLE_COUNT=1`,
  `PERMISSION_COUNT=25`, `REQUIRED_ADMIN_PERMISSION_MISSING_COUNT=0`.
- A-15B1 remains FAIL at browser session binding: `/admin` redirects to
  `/auth/login?reason=auth_session_missing`; admin shell can render unauthenticated
  routes with unknown user, no role and 0 permissions.
- Static code diagnostics: login/callback/logout routes exist, callback has
  `exchangeCodeForSession`, login redirects to `/auth/callback`, server client
  uses cookie-backed `createServerClient`, and no `middleware.ts` auth guard exists.
- Diagnostic status: `PARTIAL`; reason:
  `AUTH_FLOW_STATIC_PRESENT_BROWSER_SESSION_NOT_BOUND`.
- Next step: owner should confirm Supabase Dashboard URL config for
  `http://localhost:3000/auth/callback` and perform a manual owner/admin login
  trace without sharing cookie values. If callback/cookie binding is wrong in
  code, open A-15C3; if the browser context simply was not logged in, rerun A-15B
  style smoke as A-15B2 with a real session.
- No UI polish, mutation, seed, role assignment, schema/RLS/auth/permission/API/
  service runtime change, dependency, `.env.local` commit, deploy or push.

## 2026-06-29 - A-15B1 - Authenticated Admin Heritage UI Browser Smoke Rerun completed

- Marker: `A15B1_AUTHENTICATED_ADMIN_HERITAGE_UI_BROWSER_SMOKE_RERUN`.
- Added `docs/PLAN_A15B1_AUTHENTICATED_ADMIN_HERITAGE_UI_BROWSER_SMOKE_RERUN.md`.
- Added `scripts/check-a15b1-authenticated-admin-heritage-ui-browser-smoke-rerun.cjs`
  and package command
  `check:a15b1:authenticated-admin-heritage-ui-browser-smoke-rerun`.
- A-15C readiness was rerun and PASS:
  `READINESS_REASON=OWNER_ADMIN_PERMISSION_READY_READ_ONLY`, `ROLE_COUNT=1`,
  `PERMISSION_COUNT=25`, `REQUIRED_ADMIN_PERMISSION_MISSING_COUNT=0`.
- Browser rerun used a fresh local dev server at `http://localhost:3000`.
- Browser session result: `FAIL_AUTH_SESSION_NOT_BOUND`; `/admin` still
  redirected to `/auth/login?reason=auth_session_missing!`.
- Admin shell result: `FAIL_UNKNOWN_USER_ROLE_PERMISSION_ZERO`; rendered admin
  routes still showed `Người dùng: Không rõ`, `Vai trò: Chưa có vai trò`,
  `Số quyền: 0`.
- Route matrix: `/tree` PASS; `/people/[slug]`
  `SAFE_SKIP_NO_PUBLICLY_VISIBLE_PROFILE`; `/admin` FAIL auth session not bound;
  `/admin/genealogy`, `/admin/tree/edit`, `/admin/people/new`,
  `/admin/relationships`, `/admin/people/[id]` PARTIAL read-only render.
- Desktop/mobile: no horizontal overflow observed on opened routes.
- No form submit, no mutation, no seed, no role assignment, no dependency, no
  runtime/service/schema change and no push.
- Next retry condition: bind a real owner/admin browser session on localhost and
  rerun A-15B1 route matrix.

## 2026-06-29 - A-15C - Owner/Admin Session Permission Smoke Readiness recorded

- Marker: `A15C_OWNER_ADMIN_SESSION_PERMISSION_SMOKE_READINESS`.
- Added `docs/PLAN_A15C_OWNER_ADMIN_SESSION_PERMISSION_SMOKE_READINESS.md`.
- Added `scripts/smoke-a15c-owner-admin-session-permission-readiness.cjs`,
  `scripts/check-a15c-owner-admin-session-permission-smoke-readiness.cjs`,
  package commands `smoke:a15c:owner-admin-session-permission-readiness` and
  `check:a15c:owner-admin-session-permission-smoke-readiness`.
- Result: `READINESS_STATUS=PASS`,
  `READINESS_REASON=OWNER_ADMIN_PERMISSION_READY_READ_ONLY`.
- This is SELECT/read-only readiness only; it proves DB auth/profile/role/
  permission readiness, not browser cookie/session binding.

## 2026-06-28 - A-15B - Authenticated Heritage UI Browser Smoke completed

- Marker: `A15B_AUTHENTICATED_HERITAGE_UI_BROWSER_SMOKE`.
- Added `docs/PLAN_A15B_AUTHENTICATED_HERITAGE_UI_BROWSER_SMOKE.md`.
- Added `scripts/check-a15b-authenticated-heritage-ui-browser-smoke.cjs` and
  package command `check:a15b:authenticated-heritage-ui-browser-smoke`.
- Browser smoke ran read-only on local `http://localhost:3100`; no form submit,
  no mutation, no auth/permission/API/service/runtime/schema change and no
  browser/session artifact was saved.
- Public result: `/tree` is `PASS` on desktop/mobile with no horizontal overflow,
  public read-only Vietnamese copy and safe CTAs. `/people/[slug]` is
  `SAFE_SKIP_NO_PUBLICLY_VISIBLE_PROFILE` because no public/anon-readable
  profile was available for safe route smoke.
- Auth/session result: `/admin` redirects to login with
  `auth_session_missing!`, so a real owner/admin authenticated smoke was not
  available in this browser session.
- Admin result: `/admin/genealogy`, `/admin/tree/edit`, `/admin/people/new`,
  `/admin/people/[id]` and `/admin/relationships` rendered read-only without
  horizontal overflow, but only as `PARTIAL` because the admin shell showed
  `Người dùng: Không rõ`, `Vai trò: Chưa có vai trò`, `Số quyền: 0`.
- Next retry condition: run the same A-15B route matrix with an explicit safe
  owner/admin browser session if the project owner wants full authenticated PASS.

## 2026-06-28 - A-15A6 - Add/Edit Member Form Vietnamese Heritage UX completed

- Marker: `A15A6_ADD_EDIT_MEMBER_FORM_VIETNAMESE_HERITAGE_UX`.
- Applied Vietnamese heritage UX polish to existing add/edit member and
  relationship/related-member forms only.
- Added `docs/PLAN_A15A6_ADD_EDIT_MEMBER_FORM_VIETNAMESE_HERITAGE_UX.md`.
- Added `scripts/check-a15a6-add-edit-member-form-vietnamese-heritage-ux.cjs`
  and package command `check:a15a6:add-edit-member-form-vietnamese-heritage-ux`.
- `/admin/people/new` now presents the form as a `Phiếu ghi thông tin gia tộc`
  with clearer guidance and route-safe back action.
- `components/people/person-form.tsx` now has `Thêm thành viên` /
  `Sửa thông tin thành viên` context, grouped sections, required/help text,
  privacy guidance and pending label `Đang lưu thông tin thành viên...`.
- `/admin/relationships`, `RelationshipForm` and `CoupleForm` now use warmer
  card grouping for family, cha/mẹ, con and vợ/chồng relationships, with clear
  warnings that relation changes may affect the phả đồ.
- Tree Editor related-member entry keeps existing action flow but improves
  context and privacy/help text for `Thêm người thân`.
- Boundary confirmed: UI/UX-only; no DB/schema/migration/seed/RLS/auth/
  permission/API/service runtime, no validation contract change, no route
  creation, no public tree/dashboard/member profile redo, no dependency, no
  deploy and no push.
- No external website code, asset, logo, screenshot, CSS, image or copied layout
  was used.

## 2026-06-28 - A-15A5 - Member Profile / Person Detail Vietnamese Heritage UI completed

- Marker: `A15A5_MEMBER_PROFILE_PERSON_DETAIL_VIETNAMESE_HERITAGE_UI`.
- Applied Vietnamese heritage polish to existing public `/people/[slug]` and
  admin `/admin/people/[id]` person detail/profile surfaces only.
- Added `docs/PLAN_A15A5_MEMBER_PROFILE_PERSON_DETAIL_VIETNAMESE_HERITAGE_UI.md`.
- Added `scripts/check-a15a5-member-profile-person-detail-vietnamese-heritage-ui.cjs`
  and package command
  `check:a15a5:member-profile-person-detail-vietnamese-heritage-ui`.
- Public member profile now has a warm profile card, text-avatar, grouped
  `Thông tin cơ bản`, `Gia đình & quan hệ`, `Ghi chú`, `Quyền riêng tư`, and
  `Chưa cập nhật` placeholders. It keeps public privacy behavior and existing
  route/query boundaries.
- Admin person detail now has a clearer `Hồ sơ thành viên` header, quick links
  to member list/phả đồ/relationships, a two-column desktop layout, summary
  tiles, and preserved existing form/action/permission behavior.
- `components/people/person-form.tsx` was restyled only; field names, submit
  action, read-only state and data contract remain unchanged.
- Boundary confirmed: UI-only; no DB/schema/migration/seed/RLS/auth/permission/
  API/service runtime, no route creation, no tree/public-home/dashboard redo, no
  dependency, no deploy and no push.
- No external website code, asset, logo, screenshot, CSS, image or copied layout
  was used.

## 2026-06-28 - A-15A4 - Vietnamese Heritage Family List / Admin Dashboard UI completed

- Marker: `A15A4_VIETNAMESE_HERITAGE_FAMILY_LIST_ADMIN_DASHBOARD_UI`.
- Applied Vietnamese heritage polish to existing `/admin`, `/admin/genealogy`,
  `AdminShell` and genealogy list cards only.
- Added `docs/PLAN_A15A4_VIETNAMESE_HERITAGE_FAMILY_LIST_ADMIN_DASHBOARD_UI.md`.
- Added `scripts/check-a15a4-vietnamese-heritage-family-list-admin-dashboard-ui.cjs`
  and package command
  `check:a15a4:vietnamese-heritage-family-list-admin-dashboard-ui`.
- Admin dashboard now uses a warm `Quản trị gia phả` banner, `Dòng họ của tôi`
  quick-start copy, compact stats for `Gia phả`, `Thành viên`, `Thế hệ` and
  `Nhánh quan hệ`, plus route-safe quick actions.
- Admin genealogy now shows `Gia phả của tôi` cards with member count, generation
  count, branch count, public/private status, last updated date and existing
  actions: `Xem phả đồ`, `Quản lý thành viên`, `Chỉnh sửa`,
  `Thiết lập riêng tư`.
- Sidebar grouping is simplified to `Gia phả`, `Phả đồ`, `Xuất dữ liệu`,
  `Cài đặt`; no route or permission logic was changed.
- Boundary confirmed: UI-only; no DB/schema/migration/seed/RLS/auth/permission/
  API/service runtime, no route creation, no tree canvas/editor logic, no
  dependency, no deploy and no push.
- No external website code, asset, logo, screenshot, CSS, image or copied layout
  was used.

## 2026-06-28 - A-15A3 - Vietnamese Heritage Public Tree View UI completed

- Marker: `A15A3_VIETNAMESE_HERITAGE_PUBLIC_TREE_VIEW_UI`.
- Applied Vietnamese heritage public tree polish to existing `/tree` and
  adjacent public shell/viewer components only.
- Added `docs/PLAN_A15A3_VIETNAMESE_HERITAGE_PUBLIC_TREE_VIEW_UI.md`.
- Added `scripts/check-a15a3-vietnamese-heritage-public-tree-view-ui.cjs` and
  package command `check:a15a3:vietnamese-heritage-public-tree-view-ui`.
- Public tree now opens with a warm family banner, compact public stats, and a
  larger parchment-toned phả đồ canvas.
- Public shell menu is simpler: `Trang chủ`, `Phả đồ`, and a quiet
  `Quản trị gia phả` link. No new public routes were created.
- Viewer toolbar remains read-only and keeps search, zoom, fit and reset/căn
  giữa actions; it does not add editor actions or layout persistence.
- Empty/error/private copy now includes `Đang tải phả đồ`,
  `Gia phả này chưa có thành viên`, `Gia phả này đang được giới hạn quyền xem`
  and `Không thể tải phả đồ. Vui lòng thử lại sau.`.
- Boundary confirmed: UI-only, public tree view only; no DB/schema/migration,
  no seed/RLS/auth/permission/API/service runtime, no route creation, no
  React Flow/ELK algorithm change, no dependency, no deploy and no push.
- No external website code, asset, logo, screenshot, CSS, image or copied
  layout was used.

## 2026-06-28 - A-15A2 - Modern Vietnamese Genealogy Tree Editor UI completed

- Marker: `A15A2_MODERN_VIETNAMESE_TREE_EDITOR_UI`.
- Applied modern Vietnamese genealogy Tree Editor polish to existing
  `/admin/tree` and `/admin/tree/edit` surfaces only.
- Added `docs/PLAN_A15A2_MODERN_VIETNAMESE_GENEALOGY_TREE_EDITOR_UI.md`.
- Added `scripts/check-a15a2-modern-vietnamese-genealogy-tree-editor-ui.cjs`
  and package command
  `check:a15a2:modern-vietnamese-genealogy-tree-editor-ui`.
- Tree Editor canvas is wider/taller and uses a clean tool-style background.
- Toolbar is compact with clear controls: `Căn giữa`, `Phóng to`, `Thu nhỏ`,
  `Sắp xếp lại`, `Lưu bố cục`, `Khôi phục tự động`.
- Node cards are smaller and clearer; selected person has a strong teal ring,
  while family/related nodes use a distinct light blue treatment.
- Side panel now reads like a responsive drawer/panel and is grouped into
  `Thông tin cơ bản`, `Quan hệ gia đình`, `Ghi chú`, `Quyền riêng tư`,
  and `Thêm người thân`.
- Relationship actions are explicit: `Thêm cha`, `Thêm mẹ`,
  `Thêm vợ/chồng`, `Thêm con`. The existing profile link is labeled
  `Sửa / xóa mềm hồ sơ`; no new delete runtime action was created in the tree.
- Empty state points to `Thêm người đầu tiên` and `Thêm quan hệ gia đình`.
- Boundary confirmed: UI-only; no DB/schema/migration/seed/RLS/auth/
  permission/API/service runtime/route creation/dependency/deploy/push.
- No external website code, asset, logo, image, CSS or copied layout was used.

## 2026-06-28 - A-15A2 - Vietnamese Traditional Genealogy UI Reference Polish completed

- Applied Vietnamese traditional genealogy UI polish across existing public,
  admin and tree surfaces.
- Added `docs/PLAN_A15A2_VIETNAMESE_TRADITIONAL_GENEALOGY_UI.md`.
- Added `scripts/check-a15a2-vietnamese-traditional-genealogy-ui.cjs` and
  package command `check:a15a2:vietnamese-traditional-genealogy-ui`.
- Public shell/home now use a warmer parchment-like base, public banner
  `Không gian từ đường số của dòng họ`, stronger lineage copy and primary CTA
  `Xem phả đồ`.
- Public tree shell and tree viewer give more screen area to the phả đồ canvas,
  use warmer toolbar/card styling and keep public read-only behavior unchanged.
- Family tree node cards are more compact, include a text-avatar placeholder,
  and keep name, birth/death range, generation and branch labels visible.
- Admin shell groups navigation as `Dòng họ`, `Phả đồ`, `Website`,
  `Quản trị` without adding routes.
- Admin dashboard, genealogy cards and person cards now use warmer card styling
  and clear Vietnamese CTAs including `Xem phả đồ` and
  `Danh sách thành viên`.
- Boundary confirmed: UI/UX only; no DB/schema/migration, no `.sql`, no
  API/action/service logic, no auth/permission/RLS, no route creation, no
  Worker/OpenNext/Wrangler config, no dependency, no deploy and no push.
- No external website image/logo/asset was copied or added.
- `PLANNING.MD` was not read or committed.

## 2026-06-27 - A-15A1 - Public Home Modern Heritage UI completed

- Applied Gemini Modern Heritage / Di sản Hiện đại polish to Public Home only.
- Changed `components/public/public-home.tsx` and
  `components/layout/public-shell.tsx`.
- Inspected home route `app/(public)/page.tsx`; no route/query/runtime logic was
  changed.
- Public Home now uses warm paper `bg-stone-50`, `text-stone-900`,
  `text-stone-600`, teal primary CTA `bg-teal-700 hover:bg-teal-800`, amber
  accents `bg-amber-50 text-amber-800`, `border-stone-200`, rounded-xl/
  rounded-2xl cards, rounded-full CTAs, `shadow-sm`/`shadow-md` and `min-h-11`
  touch targets.
- Mobile behavior: header/nav remains stacked, H1 starts at `text-3xl`, CTAs
  stack safely, cards stack to one column, no sticky/floating/drawer/menu/gesture
  behavior was added.
- Vietnamese copy now emphasizes family memory and lineage:
  `Lưu giữ ký ức, kết nối các thế hệ.` and
  `Cội nguồn yêu thương của dòng họ...`.
- Added `docs/PLAN_A15A1_PUBLIC_HOME_MODERN_HERITAGE_UI.md`.
- Added `scripts/check-a15a1-public-home-modern-heritage-ui.cjs` and package
  command `check:a15a1-public-home-modern-heritage-ui`.
- Validation PASS: A-15A1, A-15A0, A-14G, A-14F, A-14E, A-14D, A-14C,
  A-14B, A-14A, UI polish, Vietnamese UI copy, Vietnamese cultural UI/UX,
  env safe, migrations, typecheck, lint, root build and diff checks.
- Browser smoke PASS on local `http://localhost:3100/`: desktop and mobile
  viewport checks showed expected Public Home H1/copy/CTA and no horizontal
  overflow. The temporary local server was stopped and the smoke log removed.
- Root `npm run build` passed directly; no clean temp-copy workaround was
  required.
- Decision 178 records that A-15A1 is Public Home only and UI-only.
- Boundary confirmed: no admin/tree/form UI, no DB/schema/migration, no `.sql`,
  no DB apply/check SQL, no API/action/service logic, no auth/permission/route
  change, no runtime merge/dedupe, no permission runtime registration, no
  Worker/OpenNext/Wrangler change, no dependency, no deploy and no push.
- `PLANNING.MD` was not read or committed.

## 2026-06-27 - A-15A0 - Gemini Modern Heritage UI/UX Design Spec completed

- Added `docs/PLAN_A15A0_GEMINI_MODERN_HERITAGE_UI_UX_DESIGN_SPEC.md`.
- The doc records the Gemini `Modern Heritage / Di sản Hiện đại` UI/UX design
  output as the accepted source design reference for later A-15A1+ phases.
- A-15A0 is docs-only. It does not implement UI and does not authorize Codex
  to invent design direction outside the spec.
- Future UI work must be split by screen and should only implement ideas when
  compatible state/layout already exists.
- Items requiring later interaction logic review are marked/deferred:
  slide-over selected person panel, bottom navigation, fixed mobile form
  action bar, drawer/bottom sheet animation, pinch zoom gesture, new
  avatar/media behavior, new menu state and new mutation path. Use
  `DEFERRED_REQUIRES_INTERACTION_LOGIC_REVIEW` when new logic is needed.
- Added `scripts/check-a15a0-gemini-modern-heritage-design-spec.cjs` and
  package command `check:a15a0-gemini-modern-heritage-design-spec`.
- Validation PASS: A-15A0 checker, A-14G, A-14F, A-14E, A-14D, A-14C,
  A-14B, A-14A, env safe, migrations, typecheck, lint, root build and diff
  checks.
- Root `npm run build` passed directly; no clean temp-copy workaround was
  required.
- Decision 177 records that the Gemini Modern Heritage spec is UI-only source,
  and A-15A0 does not authorize DB/API/auth/permission/route/runtime/deploy/
  dependency changes.
- Boundary confirmed: no UI component edit, no JSX/class Tailwind runtime
  change, no DB apply, no migration, no `.sql`, no API/action/service logic,
  no auth/permission, no route change, no Worker/OpenNext/Wrangler change, no
  dependency, no deploy and no push.
- `PLANNING.MD` was not read or committed.

## 2026-06-27 - A-14G-R1 - Public Browser Visual Smoke Retry completed (SAFE_SKIP)

- Reran A-14G-R1 public/read-only visual smoke gate.
- Base URL source: none. `PUBLIC_VISUAL_SMOKE_BASE_URL`,
  `LOCAL_SMOKE_BASE_URL` and `PROD_SMOKE_BASE_URL` were all absent in the
  Codex execution process.
- Result remains `SAFE_SKIP_MISSING_PUBLIC_BASE_URL`; no browser was opened.
- `/` result: `SAFE_SKIP_MISSING_PUBLIC_BASE_URL`.
- `/tree` result: `SAFE_SKIP_MISSING_PUBLIC_BASE_URL`.
- `/people/<slug>` result: `SAFE_SKIP_MISSING_PUBLIC_SAFE_PERSON_SLUG` plus
  `SAFE_SKIP_MISSING_PUBLIC_BASE_URL`; no DB query was run to discover a slug.
- Public not-found/private/error state result:
  `SAFE_SKIP_MISSING_PUBLIC_BASE_URL`.
- Mobile viewport result: `SAFE_SKIP_MOBILE_VIEWPORT_TOOLING_UNAVAILABLE` plus
  `SAFE_SKIP_MISSING_PUBLIC_BASE_URL`.
- No screenshots were captured or committed. No token/cookie/session/storage
  state was read, printed, saved or committed.
- Validation PASS: A-14G, A-14F, A-14E, A-14D, A-14C, A-14B, A-14A, A-14, UI
  polish, Vietnamese UI copy, Vietnamese cultural UI/UX, tree relationship
  picker, inline create, duplicate suggestion, tree polish/dedupe/data-quality,
  A-10/A-11/A-12 merge/dedupe guards, env safe, migrations, typecheck, lint,
  root build and diff checks.
- A-09 authenticated browser smoke returned the expected missing-explicit-auth
  safe-skip.
- `check:merge-dedupe-backup-gate-readiness` is `NOT_AVAILABLE` in this
  checkout; do not infer backup readiness from A-14G-R1.
- Root `npm run build` passed directly; no clean temp-copy workaround was
  required.
- Boundary confirmed: public-only/read-only retry, no admin/auth route smoke,
  no mutation, no DB apply, no check SQL on DB, no migration, no `.sql`, no
  seed/backfill, no runtime merge/dedupe, no permission runtime registration,
  no Worker/OpenNext/Wrangler config change, no dependency, no deploy and no
  push.
- Backup gate remains `BLOCKED_PENDING_OWNER_BACKUP_GATE_CONFIRMATION`.
  DB merge/dedupe remains not applied. Runtime merge/dedupe remains closed.
  Permission runtime remains unregistered.
- `PLANNING.MD` was not read or committed.
- To get real visual PASS later, owner/operator must provide explicit
  `PUBLIC_VISUAL_SMOKE_BASE_URL` (preferred) or `LOCAL_SMOKE_BASE_URL` /
  `PROD_SMOKE_BASE_URL`; person profile smoke also needs
  `PUBLIC_VISUAL_SMOKE_PERSON_SLUG`.

## 2026-06-27 - A-14G - Public Browser Visual Smoke completed (SAFE_SKIP)

- Added `docs/PLAN_A14G_PUBLIC_BROWSER_VISUAL_SMOKE.md`.
- A-14G ran the public browser visual smoke only in static-readiness form;
  no real visual PASS was claimed because no explicit base URL was set
  in the Codex execution process.
- Base URL resolution followed the A-14F priority
  (`PUBLIC_VISUAL_SMOKE_BASE_URL` then `LOCAL_SMOKE_BASE_URL` then
  `PROD_SMOKE_BASE_URL`); all three were absent, so the result was
  `SAFE_SKIP_MISSING_PUBLIC_BASE_URL`.
- `playwright` MCP server is registered locally but cannot be used to
  navigate to any route without a base URL; the browser-tooling status
  was therefore `SAFE_SKIP_BROWSER_TOOL_UNAVAILABLE` for this run.
- Person profile smoke additionally returned
  `SAFE_SKIP_MISSING_PUBLIC_SAFE_PERSON_SLUG` because no
  `PUBLIC_VISUAL_SMOKE_PERSON_SLUG` env was provided and the phase must
  not query the database to discover a real public-safe slug.
- Mobile viewport smoke returned
  `SAFE_SKIP_MOBILE_VIEWPORT_TOOLING_UNAVAILABLE` because viewport
  resize without a base URL cannot reach any route.
- No screenshots were captured and no auth/session/token/cookie/
  storage-state artifact was produced or committed.
- Targets recorded: public home `/`, public tree `/tree`, public person
  `/people/<slug>`, public error / not-found / private state, mobile
  viewport. All targets stayed at the matching SAFE_SKIP.
- Decision 175 records that A-14G is SAFE_SKIP without explicit base URL
  and that static evidence must not be promoted to a real visual PASS.
- Added `scripts/check-a14g-public-browser-visual-smoke.cjs` and package
  command `check:a14g-public-browser-visual-smoke`.
- Validation PASS: A-14G, A-14F, A-14E, A-14D, A-14C, A-14B, A-14A, A-14,
  UI polish, Vietnamese UI copy, Vietnamese cultural UI/UX, tree
  relationship picker, inline create, duplicate suggestion, tree
  polish/dedupe/data-quality, A-10/A-11/A-12 merge/dedupe guards, env
  safe, migrations, typecheck, lint, root build and diff checks.
- A-09 authenticated browser smoke returned the expected
  missing-explicit-auth safe-skip.
- `check:merge-dedupe-backup-gate-readiness` is `NOT_AVAILABLE` in this
  checkout; do not infer backup readiness from A-14G.
- Root `npm run build` passed directly; no clean temp-copy workaround
  was required.
- Boundary confirmed: no migration, no `.sql`, no DB apply, no check SQL
  on DB, no seed/backfill, no data mutation, no runtime merge/dedupe, no
  route/action/service merge/dedupe, no permission runtime registration,
  no Worker/OpenNext/Wrangler config change, no dependency, no deploy and
  no push.
- Backup gate remains `BLOCKED_PENDING_OWNER_BACKUP_GATE_CONFIRMATION`.
  DB merge/dedupe remains not applied. Runtime merge/dedupe remains
  closed. Permission runtime remains unregistered.
- `PLANNING.MD` was not read or committed.
- Recommended next phase: A-14H (or a later phase) may attempt a real
  public browser visual smoke only after the owner/operator provides an
  explicit base URL (`PUBLIC_VISUAL_SMOKE_BASE_URL` or
  `LOCAL_SMOKE_BASE_URL` for a local `next dev`/`next start` server, or
  `PROD_SMOKE_BASE_URL` for the deployed production URL) and an
  explicit `PUBLIC_VISUAL_SMOKE_PERSON_SLUG`. Until then, no claim of
  visual PASS is allowed.

## 2026-06-27 - A-14F - Browser Visual Smoke Readiness completed

- Added `docs/PLAN_A14F_BROWSER_VISUAL_SMOKE_READINESS.md`.
- A-14F prepared browser visual smoke readiness for A-14A/B/C/D/E public,
  admin and mobile/tablet surfaces; it did not claim real visual PASS.
- Public read-only candidates: `/`, `/tree`, `/people/[public-safe-slug]` and
  safe public error/private/not-found states when an explicit base URL exists.
- Admin candidates require explicit owner/operator auth session/env:
  `/admin`, `/admin/people`, `/admin/people/new`, `/admin/people/[id]`,
  `/admin/tree`, `/admin/tree/edit` and related-member add panel states.
- Mutation-adjacent paths require separate safe dataset approval and must
  safe-skip without it.
- Browser tooling unavailable is recorded as
  `SAFE_SKIP_BROWSER_TOOL_UNAVAILABLE`, not a fake visual PASS.
- Added `scripts/check-a14f-browser-visual-smoke-readiness.cjs` and package
  command `check:a14f-browser-visual-smoke-readiness`.
- Validation PASS: A-14F, A-14E, A-14D, A-14C, A-14B, A-14A, A-14, UI polish,
  Vietnamese UI copy, Vietnamese cultural UI/UX, tree relationship picker,
  inline create, duplicate suggestion, tree polish/dedupe/data-quality,
  A-10/A-11/A-12 merge/dedupe guards, env safe, migrations, typecheck, lint,
  root build and diff checks.
- A-09 authenticated browser smoke returned the expected missing-explicit-auth
  safe-skip.
- `check:merge-dedupe-backup-gate-readiness` is `NOT_AVAILABLE` in this
  checkout; do not infer backup readiness from A-14F.
- Root `npm run build` passed directly; no clean temp-copy workaround was
  required.
- Boundary confirmed: no migration, no `.sql`, no DB apply, no check SQL run on
  DB, no seed/backfill, no data mutation, no runtime merge/dedupe, no
  route/action/service merge/dedupe, no permission runtime registration, no
  Worker/OpenNext/Wrangler config change, no dependency, no deploy and no push.
- Backup gate remains `BLOCKED_PENDING_OWNER_BACKUP_GATE_CONFIRMATION`. DB
  merge/dedupe remains not applied. Runtime merge/dedupe remains closed.
  Permission runtime remains unregistered.
- `PLANNING.MD` was not read or committed.

## 2026-06-27 - A-14E - Mobile UX Sweep completed

- Added `docs/PLAN_A14E_MOBILE_UX_SWEEP.md`.
- Public shell navigation now uses a mobile two-column grid, full-width admin
  login action and safer brand wrapping.
- Public home/tree/profile now have tighter mobile padding, stacked CTAs and
  long-text wrapping while preserving public read-only behavior.
- Admin shell/sidebar/header now have bounded mobile navigation, larger touch
  targets and safer long account/role wrapping.
- Shared UI primitives now handle mobile action stacking, long title wrapping
  and compact card/empty-state padding.
- People list/form now have improved mobile card layout, larger actions,
  text-base inputs and clearer mobile submit/cancel stacking.
- Tree Viewer and Tree Editor now use mobile grid toolbars, viewport-aware
  canvas heights, mobile-safe node card widths and selected preview placement
  that does not cover the canvas.
- Tree Editor related-member add panel now has rounded mobile inputs, larger
  touch targets and narrow-screen segmented controls.
- Added `scripts/check-a14e-mobile-ux-sweep.cjs` and package command
  `check:a14e-mobile-ux-sweep`.
- Validation PASS: A-14E, A-14D, A-14C, A-14B, A-14A, A-14, UI polish,
  Vietnamese UI copy, Vietnamese cultural UI/UX, tree relationship picker,
  inline create, duplicate suggestion, tree polish/dedupe/data-quality,
  A-10/A-11/A-12 merge/dedupe guards, env safe, migrations, typecheck, lint,
  root build and diff checks.
- A-09 authenticated browser smoke returned the expected missing-explicit-auth
  safe-skip.
- `check:merge-dedupe-backup-gate-readiness` is `NOT_AVAILABLE` in this
  checkout; do not infer backup readiness from A-14E.
- Root `npm run build` passed directly; no clean temp-copy workaround was
  required.
- Boundary confirmed: no migration, no `.sql`, no DB apply, no check SQL run on
  DB, no seed/backfill, no runtime merge/dedupe, no route/action/service
  merge/dedupe, no permission runtime registration, no Worker/OpenNext/Wrangler
  config change, no dependency, no deploy and no push.
- Backup gate remains `BLOCKED_PENDING_OWNER_BACKUP_GATE_CONFIRMATION`. DB
  merge/dedupe remains not applied. Runtime merge/dedupe remains closed.
  Permission runtime remains unregistered.
- `PLANNING.MD` was not read or committed.

## 2026-06-27 - A-14D - Tree Viewer Interaction Polish completed

- Added `docs/PLAN_A14D_TREE_VIEWER_INTERACTION_UX.md`.
- Tree viewer toolbar now has explicit Vietnamese controls for `Vừa màn hình`,
  `Phóng to`, `Thu nhỏ` and `Đưa cây về giữa`.
- Viewer mini help now explains dragging/panning, scroll zoom and selecting a
  person.
- Tree viewer now has a read-only selected-person preview with grouped fields
  and public/admin CTA split.
- Node cards now have warmer selected state, `Đang chọn` badge and keyboard
  focus ring.
- Admin Tree Editor toolbar now says `Chế độ chỉnh sửa`, explains layout-only
  dragging and uses the warm paper tree canvas.
- Tree empty/error states were hardened for public/admin wording and avoid raw
  technical error leakage.
- Added `scripts/check-a14d-tree-viewer-interaction-ux.cjs` and package command
  `check:a14d-tree-viewer-interaction-ux`.
- Validation PASS: A-14D, A-14C, A-14B, A-14A, A-14, UI polish, Vietnamese UI
  copy, Vietnamese cultural UI/UX, tree relationship picker, inline create,
  duplicate suggestion, tree polish/dedupe/data-quality, A-10/A-11/A-12
  merge/dedupe guards, env safe, migrations, typecheck, lint, root build and
  diff checks.
- A-09 authenticated browser smoke returned the expected missing-explicit-auth
  safe-skip. Browser visual smoke was not run because no Browser navigation
  tool was available in this Codex session.
- `check:merge-dedupe-backup-gate-readiness` is `NOT_AVAILABLE` in this
  checkout; do not infer backup readiness from A-14D.
- Root `npm run build` passed directly; no clean temp-copy workaround was
  required.
- Boundary confirmed: no migration, no `.sql`, no DB apply, no check SQL run on
  DB, no seed/backfill, no runtime merge/dedupe, no route/action/service
  merge/dedupe, no permission runtime registration, no Worker/OpenNext/Wrangler
  config change, no dependency, no deploy and no push.
- Backup gate remains `BLOCKED_PENDING_OWNER_BACKUP_GATE_CONFIRMATION`. DB
  merge/dedupe remains not applied. Runtime merge/dedupe remains closed.
  Permission runtime remains unregistered.
- `PLANNING.MD` was not read or committed.

## 2026-06-27 - A-14C - Admin Dashboard / Layout UX Polish completed

- Added `docs/PLAN_A14C_ADMIN_DASHBOARD_LAYOUT_UX.md`.
- Admin shell/sidebar now groups navigation by genealogy work: Tổng quan,
  Thành viên / hồ sơ, Cây gia phả, Nhập / xuất dữ liệu and An toàn / hệ thống.
- Sidebar items now include short descriptions and a warmer active state while
  preserving existing routes.
- Admin dashboard now leads with a practical genealogy workflow, quick actions
  for adding a member, opening Tree Editor, viewing the public tree and
  exporting data, plus safety cards for public/admin separation, closed
  merge/dedupe runtime and backup gate evidence.
- Shared admin primitives now use rounded warm-paper cards/callouts/buttons.
- People admin filter/list/form received warm styling, clearer empty/error
  states, mobile cards, a warm desktop table and safer soft-delete separation.
- Added `scripts/check-a14c-admin-dashboard-layout-ux.cjs` and package command
  `check:a14c-admin-dashboard-layout-ux`.
- Validation PASS: A-14C, A-14B, A-14A, A-14, UI polish, Vietnamese UI copy,
  Vietnamese cultural UI/UX, tree relationship picker, inline create,
  duplicate suggestion, tree polish/dedupe/data-quality, A-10/A-11/A-12
  merge/dedupe guards, env safe, migrations, typecheck, lint, root build and
  diff checks.
- A-09 authenticated browser smoke returned the expected missing-explicit-auth
  safe-skip. Browser visual smoke was not run because no Browser navigation
  tool was available in this Codex session.
- `check:merge-dedupe-backup-gate-readiness` is `NOT_AVAILABLE` in this
  checkout; do not infer backup readiness from A-14C.
- Boundary confirmed: no migration, no `.sql`, no DB apply, no check SQL run on
  DB, no seed/backfill, no runtime merge/dedupe, no route/action/service
  merge/dedupe, no permission runtime registration, no Worker/OpenNext/Wrangler
  config change, no dependency, no deploy and no push.
- Backup gate remains `BLOCKED_PENDING_OWNER_BACKUP_GATE_CONFIRMATION`. DB
  merge/dedupe remains not applied. Runtime merge/dedupe remains closed.
  Permission runtime remains unregistered.
- `PLANNING.MD` was not read or committed.

## 2026-06-27 - A-14B - Public Tree / Home UX Classic Modern Polish completed

- Added `docs/PLAN_A14B_PUBLIC_TREE_HOME_UX.md`.
- Public shell now has a warmer family-archive brand treatment, subtitle and
  footer while preserving existing routes.
- Public home now leads with `Lưu giữ ký ức gia đình, kết nối các thế hệ`, clear
  CTAs, privacy-safe public stats and four benefit sections.
- Public tree page now explains drag/pan, scroll zoom, search focus and the
  read-only public boundary.
- Tree viewer/toolbar/node cards now use the classic modern genealogy palette:
  warm paper, stone text, muted rust and restrained green.
- Public empty/error states are friendlier and avoid confusing public viewers
  with admin-only actions.
- Public person profile now groups public-safe fields and uses
  `Thông tin này đang được gia đình cập nhật` for missing values.
- Added `scripts/check-a14b-public-tree-home-ux.cjs` and package command
  `check:a14b-public-tree-home-ux`.
- Validation PASS: A-14B, A-14A, A-14, UI polish, Vietnamese UI copy,
  Vietnamese cultural UI/UX, tree relationship picker, inline create,
  duplicate suggestion, tree polish/dedupe/data-quality, A-10/A-11/A-12
  merge/dedupe guards, env safe, migrations, typecheck, lint and root build.
- A-09 authenticated browser smoke returned the expected missing-explicit-auth
  safe-skip. Browser visual smoke was not run because no Browser navigation
  tool was available in this Codex session.
- `check:merge-dedupe-backup-gate-readiness` is `NOT_AVAILABLE` in this
  checkout; do not infer backup readiness from A-14B.
- Boundary confirmed: no migration, no `.sql`, no DB apply, no check SQL run on
  DB, no seed/backfill, no runtime merge/dedupe, no route/action/service
  merge/dedupe, no permission runtime registration, no Worker/OpenNext/Wrangler
  config change, no dependency, no deploy and no push.
- Backup gate remains `BLOCKED_PENDING_OWNER_BACKUP_GATE_CONFIRMATION`. DB
  merge/dedupe remains not applied. Runtime merge/dedupe remains closed.
  Permission runtime remains unregistered.
- `PLANNING.MD` was not read or committed.

## 2026-06-23 - A-14A - Related Member Add UX Overhaul completed

- Added `docs/PLAN_A14A_RELATED_MEMBER_ADD_UX.md`.
- Local branch status before continuing: ahead 0 / behind 0 vs `origin/main`.
  No push was attempted.
- Tree Editor related-member create flow now has two modes:
  - `Thêm nhanh`: full name, gender, birth/death year, short note and duplicate
    suggestion.
  - `Nhập chi tiết hơn`: adds display name, is living, birth/death date, birth
    place, home town, branch, generation, visibility and admin-only private
    note.
- `createPersonAndAttachFromTreeAction()` now passes those existing fields into
  `createPerson()` and still reuses existing relationship actions.
- Unsupported fields were not added: death place, multiple aliases, sibling
  order, sibling action, other-related-person action and inline lineage
  membership assignment need a later schema/service phase if owner approves.
- Classic modern genealogy style direction applied through warm paper/stone
  palette in global CSS, public/admin shells and UI primitives.
- Added `scripts/check-a14a-related-member-add-ux.cjs` and package script
  `check:a14a-related-member-add-ux`.
- Validation PASS: A-14A/A-14, UI/Vietnamese, Tree picker/inline/duplicate/
  data-quality, A-10/A-11/A-12 merge/dedupe, env safe, migrations, typecheck,
  lint, root build and diff checks. A-09 is the expected safe-skip without an
  explicit auth session.
- Boundary confirmed: no migration, no `.sql`, no DB apply, no check SQL run on
  DB, no seed/backfill, no runtime merge/dedupe, no route/action/service
  merge/dedupe, no permission runtime registration, no Worker/OpenNext/Wrangler
  config change, no dependency, no deploy and no push.
- Backup gate remains `BLOCKED_PENDING_OWNER_BACKUP_GATE_CONFIRMATION`. Runtime
  merge/dedupe remains closed. Permission runtime remains unregistered.
- `PLANNING.MD` was not read or committed.

## 2026-06-23 - A-14 Bundle - UI/UX Overhaul completed

- Added `docs/PLAN_A14_UI_UX_OVERHAUL.md`.
- Admin layout/navigation now uses grouped sidebar sections for daily work,
  tree surfaces and data safety. Routes were not changed.
- People CRUD polish: filter guidance, mobile card fallback, clearer profile
  actions and form help text/placeholders.
- Relationship CRUD polish: clearer family/parent-child/couple explanations,
  better empty state and warnings when no family unit exists.
- Tree UX polish: toolbar clarifies layout-only dragging, side panel gives
  no-selection guidance, attach-existing warning and distinct pending labels.
- Import/login/revision/system polish: friendlier import issue labels, login
  errors no longer expose raw provider messages, shared PageHeader/EmptyState/
  StatusCallout on secondary admin pages.
- Added `scripts/check-a14-ui-ux-overhaul.cjs` and package script
  `check:a14-ui-ux-overhaul`.
- Updated Tree/A-10/A-11/A-12 checker compatibility allowlists for A-14 UI files
  while keeping SQL/migration/Worker/config/deploy/merge-runtime guardrails.
- Boundary confirmed: no migration, no `.sql`, no DB apply, no check SQL run on
  DB, no seed/backfill, no runtime merge/dedupe, no route/action/service
  merge/dedupe, no permission runtime registration, no Worker/OpenNext/Wrangler
  config change, no dependency, no deploy and no push.
- Backup gate remains `BLOCKED_PENDING_OWNER_BACKUP_GATE_CONFIRMATION`. DB
  merge/dedupe remains not applied. Runtime merge/dedupe remains closed.
  Permission runtime remains unregistered.
- `PLANNING.MD` was not read or committed.

## 2026-06-22 - A-13 Merge/Dedupe DB Apply blocked

- Owner marker `APPROVE_A12_MERGE_DEDUPE_DB_APPLY` was received.
- A-13A static precheck PASS at migration SHA256
  `9645F8E69068C73332A9CCE74E91449E06271734083A1C419176CBBDCA1C75B9`.
- A-13B: `BLOCKED_MISSING_BACKUP_CONFIRMATION` because no fresh snapshot
  timestamp/retention, restore owner/path or exact target confirmation existed.
- PG shell env and `psql` were absent; no repo env file was read.
- A-13C: `SKIPPED_BACKUP_GATE`; DB remains not applied.
- A-13D: `SKIPPED_DB_NOT_APPLIED`; all nine catalog checks remain unexecuted.
- A-13E local static validation PASS for A-10/A-11/A-12, migration/schema, Tree
  dedupe/data-quality, typecheck, lint, build and diff gates. A-09 remained the
  expected safe-skip.
- Static evidence was not promoted to DB verification PASS, and
  `APPROVE_A13_MERGE_DEDUPE_DB_SCHEMA_VERIFIED` is not available.
- Runtime merge/dedupe and permission registration remain closed.
- Resume only after explicit backup/restore/target/tooling confirmation, then
  rerun A-13A before any one-file apply.
- Boundary: no DB/API/network/SQL execution, seed/backfill, data mutation,
  route/action/service, Worker/config/dependency/deploy/push. `PLANNING.MD` was
  not read or committed.

## 2026-06-22 - Owner Review A-12 approved

- Review result: `APPROVED`.
- Review found and corrected two extra `)` tokens after the audit/rollback
  composite FK clauses; A-11 draft parity and checker regression coverage were
  updated.
- Corrected migration SHA256:
  `9645F8E69068C73332A9CCE74E91449E06271734083A1C419176CBBDCA1C75B9`.
- Migration safety, six-table coverage, fail-closed RLS, read-only nine-row check
  SQL and backup/apply/rollback plan are approved for the next owner gate.
- Owner may grant `APPROVE_A12_MERGE_DEDUPE_DB_APPLY` in a separate phase.
  Marker status: `NOT_GRANTED_BY_THIS_REVIEW`; runtime remains closed.
- DB is not applied and check SQL was not run on DB.
- A-10/A-11/A-12, migration/schema and Tree dedupe/data-quality checkers plus
  typecheck, lint, workspace-root production build and diff gates PASS. A-09 is
  the expected missing-explicit-session safe-skip.
- Boundary: no seed/backfill, data mutation, permission runtime,
  route/action/service, Worker/config/dependency/deploy/push. `PLANNING.MD` was
  not read or committed.

## 2026-06-22 - A-12 Bundle - Merge/Dedupe Real Migration Candidate completed

- Owner marker `APPROVE_A11_MERGE_DEDUPE_SCHEMA_CANDIDATE` was received for file
  creation/readiness only.
- Added migration `db/migrations/20260622_0009_merge_dedupe_schema_candidate.sql`
  and read-only check `db/checks/check_merge_dedupe_schema.sql`.
- Migration schema body matches the approved A-11 draft, all six tables enable
  RLS, and no policy/permission/DML/seed/function/trigger/grant exists.
- Migration SHA256 at A-12 bundle commit (superseded by Owner Review correction):
  `5ADECCDAA0396E42CFDED01574B6FCD785617CF01CDCD7F894ECEEF3824A525C`.
- Added A-12 static checker/package command and owner apply plan with exact
  backup, one-file apply, 9-row catalog verification and rollback/no-go gates.
- Decision 165: DB remains not applied; runtime merge/dedupe remains closed.
  Apply requires separate `APPROVE_A12_MERGE_DEDUPE_DB_APPLY` and still does not
  authorize runtime.
- A-10/A-11/A-12, migration/schema and Tree dedupe/data-quality checkers plus
  typecheck, lint, workspace-root production build and diff gates PASS. A-09 is
  the expected missing-explicit-session safe-skip.
- Boundary: no DB/check SQL execution, seed/backfill, data mutation,
  auth/permission runtime, route/action/service, Worker/config/dependency,
  deploy or push. `PLANNING.MD` was not read or committed.

## 2026-06-22 - Owner Review A-11 approved

- Review result: `APPROVED`.
- Six-table schema coverage, composite audit/rollback correlation, rollback
  restoration and fail-closed RLS boundary are complete.
- Review tightened approved/executed actor/time requirements, non-blank gate
  values, graph evidence, audit reason and no-trigger checker coverage.
- Canonical next marker:
  `APPROVE_A11_MERGE_DEDUPE_SCHEMA_CANDIDATE`.
- Marker status: `NOT_GRANTED_BY_THIS_REVIEW`. It may open a separate real
  migration/check-SQL/apply-plan phase, but does not apply DB or authorize A-12
  runtime merge/dedupe.
- SQL remains `.sql.draft` outside `db/migrations`; DB remains not applied.
- A-10/A-11, migration/schema and Tree dedupe/data-quality checkers plus
  typecheck, lint, workspace-root production build and diff gates PASS. A-09 is
  the expected missing-explicit-session safe-skip.
- Boundary: no seed/backfill, permission runtime, route/action/service,
  Worker/config/dependency/deploy/push. `PLANNING.MD` was not read or committed.

## 2026-06-22 - A-11 Bundle - Merge/Dedupe Schema Candidate Readiness completed

- Owner marker `APPROVE_A10_MERGE_DEDUPE_RUNTIME_DESIGN` was received for A-11
  candidate work only.
- Added the A-11 design doc, non-applied `.sql.draft`, static checker and package
  command.
- Six candidate tables cover duplicate pairs, sessions, field decisions,
  typed impacts, audit events and rollback manifests.
- Version/conflict/graph state, approval evidence, actor/timestamps, impact
  snapshots and person/relationship/layout/lineage/privacy/revision/export
  rollback coverage are explicit.
- All candidate tables enable RLS with no policies. No `people.merge.*`
  permission is registered; access remains fail-closed if a later real migration
  adopts the candidate.
- Decision 163: DB remains not applied and runtime merge/dedupe remains closed.
  A real migration file requires `APPROVE_A11_MERGE_DEDUPE_SCHEMA`; apply and
  A-12 runtime need later approvals.
- A-10/A-11, migration/schema and related Tree dedupe/data-quality checkers plus
  typecheck, lint, workspace-root production build and diff gates PASS. A-09 is
  the expected missing-explicit-session safe-skip, not a failure.
- Boundary: no real migration, DB apply, seed/backfill, route/action/service,
  data mutation/delete, auth/permission runtime, Worker/config, dependency,
  deploy or push. `PLANNING.MD` was not read or committed.

## 2026-06-22 - Owner Review A-10 approved

- Review result: `APPROVED`.
- A-10 fully covers advisory strong/medium/weak candidates, same-name create
  continuity, atomic/versioned transaction, conflict and graph validation,
  audit impact, rollback restoration, five proposed permissions, three
  sequential markers and Vietnamese future UI.
- The checker now guards the complete review criteria rather than only section
  presence and a subset of tokens.
- Owner may explicitly use `APPROVE_A10_MERGE_DEDUPE_RUNTIME_DESIGN` to open
  A-11 schema candidate.
- Marker status: `NOT_GRANTED_BY_THIS_REVIEW`; A-11 has not been opened by this
  review and runtime remains closed under Decisions 161 and 162.
- Relevant A-10, Tree, dedupe and data-quality checkers plus typecheck, lint,
  workspace-root production build and diff checks PASS. A-09 remains the honest
  authenticated-browser safe-skip because no explicit session was supplied.
- Boundary: no migration, `.sql`, DB apply, schema/runtime/auth/permission
  change, route/action/service, delete, Worker/config, dependency, deploy or
  push. `PLANNING.MD` was not read or committed.

## 2026-06-22 - Plan A-10 - Merge/Dedupe Transaction & Audit Design completed

- Added `docs/PLAN_A10_MERGE_DEDUPE_TRANSACTION_AUDIT_DESIGN.md` and its static
  checker/package command.
- Candidate confidence is strong/medium/weak and advisory only. No level
  authorizes automatic merge or blocks a legitimate same-name person.
- Future transaction design is all-or-nothing, version-checked and idempotent by
  `merge_id`; it must validate graph/privacy before and after mutation.
- Audit design covers actors/timestamps/reason/confidence plus field,
  relationship, layout, branch/generation, export and rollback-manifest impact.
- Rollback requires a pre-merge snapshot/manifest and restores source person,
  relationships, layout, membership, visibility and revision trail. Later edits
  require manual conflict reconciliation rather than silent overwrite.
- Proposed permissions and owner markers are design text only. Decision 161
  keeps runtime closed until explicit approval, audit, rollback and schema gates
  are approved.
- Future UI copy is Vietnamese and covers candidate list, person comparison,
  conflict selection, affected relationships, request/approval/execution and
  audit/rollback.
- Required static checker suite, env/migration safety, typecheck, lint and
  workspace-root production build PASS. A-09 remains the honest safe-skip
  `A09_AUTH_BROWSER_SMOKE_SKIPPED_MISSING_EXPLICIT_AUTH_SESSION`.
- Boundary: no migration, `.sql`, DB apply, seed/backfill, schema change,
  runtime merge/dedupe, person/relationship delete, auth/permission runtime
  change, route/action/service, Worker, OpenNext/Wrangler config, dependency,
  deploy or push.
- `PLANNING.MD` was not read or committed.
- Recommended next phase: owner review of A-10. A-11 schema candidate work may
  begin only after explicit `APPROVE_A10_MERGE_DEDUPE_RUNTIME_DESIGN`; it still
  must not DB apply or open runtime merge.

## 2026-06-22 - Plan A-09 - Authenticated Tree Editor Browser Smoke safe-skipped

- Added `docs/PLAN_A09_AUTHENTICATED_TREE_EDITOR_BROWSER_SMOKE.md`.
- Added `scripts/check-tree-editor-auth-browser-smoke.cjs` and
  `npm run check:tree-editor-auth-browser-smoke`.
- Git sync gate PASS: local `main` and `origin/main` synchronized; worktree was
  clean before A-09 changes.
- Explicit A-09 env/session gates were absent in the Codex process:
  `GIA_PHA_AUTH_BROWSER_SMOKE`, `GIA_PHA_SMOKE_BASE_URL` and
  `GIA_PHA_AUTH_STORAGE_STATE_PATH`.
- Result:
  `A09_AUTH_BROWSER_SMOKE_SKIPPED_MISSING_EXPLICIT_AUTH_SESSION`.
- No authenticated canvas, toolbar, selected-node, add-relative, duplicate
  suggestion or data-quality browser PASS was claimed from static evidence.
- Permission result: `NOT_RUN_MISSING_EXPLICIT_AUTH_SESSION`; no bypass was
  attempted.
- Mutation results:
  - `A09_ATTACH_EXISTING_MUTATION_SKIPPED_MISSING_EXPLICIT_SAFE_DATASET`
  - `A09_CREATE_PERSON_MUTATION_SKIPPED_MISSING_EXPLICIT_SAFE_DATASET`
- Static guards still verify Vietnamese Tree Editor copy, pending/disabled
  submit behavior, no visible UUID entry, duplicate suggestion, read-only
  warning copy and privacy marker exclusions.
- No runtime Tree Editor bug was established or fixed.
- Boundary: no credential read/log, no migration, no `.sql`, no DB apply, no
  seed/backfill, no schema/auth/permission change, no mutation, no
  merge/dedupe, no delete, no Worker/config/dependency/deploy/push.
- `PLANNING.MD` was not read or committed.
- Recommended next phase: retry A-09 only after owner/operator prepares an
  explicit authorized browser session; mutation smoke additionally needs an
  explicitly approved safe local/staging dataset.

## 2026-06-22 - PLAN_A06_A07_A08_TREE_POLISH_DEDUPE_READINESS_DATA_QUALITY_WARNINGS completed

- Added
  `docs/PLAN_A06_A07_A08_TREE_POLISH_DEDUPE_READINESS_DATA_QUALITY_WARNINGS.md`.
- Added `scripts/check-tree-polish-dedupe-readiness-data-quality.cjs` and
  `npm run check:tree-polish-dedupe-readiness-data-quality`.
- A-06 visual polish:
  - Tree canvas has more space and a stable taller viewport.
  - Selected person card has a visible `Người đang chọn` state.
  - Person cards show clearer year, `Đời thứ` and `Chi nhánh` labels.
  - Family intermediary cards show `Gia đình`, not an English implementation
    label.
  - Toolbar uses `Vừa màn hình`, `Phóng to`, `Thu nhỏ`,
    `Sắp xếp lại cây`, `Lưu bố cục` and `Khôi phục bố cục tự động`.
- Add-relative panel copy is shorter and remains split into selected person,
  relationship, existing/new member and confirmation steps.
- A-07 merge/dedupe readiness is docs/checker-only. No merge UI, action,
  service, route or DB mutation was created.
- No-auto-merge guard:
  - no automatic person merge;
  - no automatic person or relationship deletion;
  - no automatic private/source-note overwrite;
  - no future merge without explicit owner approval, audit and rollback.
- A-08 adds `Gợi ý hoàn thiện dữ liệu` for the selected person using only the
  already loaded graph. Suggestions may cover missing years, missing parents,
  no relationships and clearly similar names.
- Warning UI states:
  `Đây chỉ là gợi ý kiểm tra, hệ thống không tự thay đổi dữ liệu.`
- Decision 160 records that Tree data quality guidance is read-only and future
  merge stays approval-gated.
- Existing auth/permission logic, relationship business rules, route contracts
  and internal UUID/personId behavior remain unchanged.
- Required static checkers, env safety, migration order, typecheck and lint
  PASS.
- Workspace-root build hit the known Windows `.next` ACL `EPERM` before
  compile; clean temporary-copy production build PASS.
- Local browser opened `/admin/tree/edit`, but the current session lacked
  `tree.view`. The route failed closed safely; authenticated canvas visual smoke
  was not claimed. Status:
  `TREE_POLISH_BROWSER_SMOKE_SKIPPED_NO_AUTHORIZED_SESSION`.
- Boundary: no migration, no `.sql`, no DB apply, no seed/backfill, no schema
  change, no runtime merge/dedupe mutation, no person/relationship delete, no
  Worker, no OpenNext/Wrangler config change, no runtime dependency, no deploy
  and no push.
- `PLANNING.MD` was not read or committed.
- Recommended next phase: authenticated browser smoke for the polished Tree
  Editor when explicit owner/operator auth env is available, or a docs-only
  merge transaction/audit design phase without runtime authorization.

## 2026-06-22 - PLAN_A04_A05_TREE_EDITOR_SMOKE_AND_DUPLICATE_SUGGESTION completed

- Added `docs/PLAN_A04_A05_TREE_EDITOR_SMOKE_AND_DUPLICATE_SUGGESTION.md`.
- Added `scripts/check-tree-duplicate-suggestion-ux.cjs` and
  `npm run check:tree-duplicate-suggestion-ux`.
- A-04 authenticated/browser smoke result:
  `A04_AUTH_BROWSER_SMOKE_SKIPPED_MISSING_EXPLICIT_ENV`. No explicit
  browser/auth smoke environment was present in the Codex execution context, so
  no authenticated browser PASS was claimed.
- A-03 source review before A-05 found no blocker: existing-member mode still
  uses relationship actions, new-member mode still uses
  `createPersonAndAttachFromTreeAction`, submit still has a pending/disabled
  guard and UUIDs remain internal form values.
- A-05 duplicate suggestion UX is now available in the Tree Editor quick-create
  form. It uses only the already loaded admin tree graph, normalizes Vietnamese
  names, optionally considers birth/death year proximity and shows at most five
  suggestions.
- Required Vietnamese copy added:
  - `Có thể đã tồn tại thành viên tương tự`
  - `Dùng thành viên này để gắn quan hệ`
  - `Vẫn tạo thành viên mới`
  - `Không tìm thấy thành viên tương tự`
  - `Gợi ý tránh tạo trùng`
  - `Thành viên đã có`
  - `Tạo mới vẫn đúng nếu đây là người khác trong gia đình`
- Choosing an existing suggestion switches to the existing-member attach path
  and submits the matched personId internally. It does not create a new person.
- Choosing to continue creating keeps the existing A-03 quick-create path:
  `createPerson()` first, then attach through existing relationship services.
- Success copy is explicit:
  - Existing member: `Đã gắn quan hệ với thành viên đã có trong cây gia phả.`
  - New member: `Đã thêm thành viên mới và gắn quan hệ vào cây gia phả.`
- Decision 159 records that Tree quick-create duplicate suggestion is
  client-side/advisory, not dedupe schema or merge behavior.
- Boundary: no migration, no `.sql`, no DB apply, no seed/backfill, no schema
  change, no auth/permission logic change, no Worker created, no
  OpenNext/Wrangler config change, no runtime dependency added, no deploy and no
  push.
- `PLANNING.MD` was not read or committed.
- Recommended next phase: authenticated browser smoke for Tree Editor
  quick-create only after owner/operator provides explicit browser/auth smoke
  env, or a narrow merge/dedupe planning phase without schema changes.

## 2026-06-22 - Plan A-03 - Tree Inline Create Person UX completed

- Added `docs/PLAN_A03_TREE_INLINE_CREATE_PERSON_UX.md`.
- Added `scripts/check-tree-inline-create-person-ux.cjs` and
  `npm run check:tree-inline-create-person-ux`.
- Existing create-person flow reviewed and reused: `createPerson()` in
  `lib/family/people-service.ts`, existing person validation and existing
  relationship services.
- Added `createPersonAndAttachFromTreeAction` in
  `app/(admin)/admin/tree/edit/actions.ts`. It creates the person first, then
  attaches father, mother, child or spouse/partner through existing services.
- Updated `components/tree/tree-editor-side-panel.tsx` with a compact
  Vietnamese flow:
  - `Chọn quan hệ`
  - `Chọn thành viên đã có`
  - `Tạo thành viên mới`
  - `Lưu và gắn quan hệ`
- Supported relationship types: `Cha`, `Mẹ`, `Con`, `Vợ/chồng/bạn đời`.
- If person creation succeeds but relationship attachment fails, the user sees
  the safe Vietnamese partial-success message beginning with `Đã tạo thành viên
  mới nhưng chưa gắn được quan hệ`.
- Internal UUIDs remain hidden/submitted values; user-facing UI does not ask for
  manual UUID entry.
- Existing auth and permission logic remains unchanged. `people.create` and
  `relationships.create` remain enforced by the existing services.
- Decision 158 records the service-reuse boundary for Tree inline create person.
- Boundary: no migration, no `.sql`, no DB apply, no seed/backfill, no schema
  change, no auth/permission logic change, no Worker created, no
  OpenNext/Wrangler config change, no runtime dependency added, no deploy and no
  push.
- `PLANNING.MD` was not read or committed.
- Recommended next phase: browser-level authenticated Tree Editor smoke for
  inline create-person UX, or a narrow polish phase for family linking after
  quick-create.

## 2026-06-21 - UI-UX-VN-02 - Vietnamese Cultural UI/UX Hardening completed

- Added `docs/UI_UX_VN_02_VIETNAMESE_CULTURAL_UI_UX_HARDENING.md`.
- `/admin/relationships` now tells operators to choose members by Vietnamese
  names; visible manual UUID/copy-ID guidance was removed from that surface.
- `RelationshipForm` now accepts a permission-checked `people` list and uses
  member selectors for parent/child relationship creation.
- `CoupleForm` now accepts the same member list and uses selectors for
  spouse/partner relationship creation.
- `/admin/people/[id]` passes the existing member list into the relationship
  forms so person-detail relationship workflows also avoid visible manual ID
  entry.
- Internal submitted values and field names remain unchanged:
  `person_id`, `person1_id`, `person2_id`, `family_id` and
  `related_person_id` stay internal IDs.
- Existing relationship actions, service validation, route structure and
  auth/permission logic remain unchanged.
- Added `scripts/check-vietnamese-cultural-ui-ux.cjs` and
  `npm run check:vietnamese-cultural-ui-ux`.
- Decision 157 records that Vietnamese cultural UI should favor names and
  kinship labels while keeping IDs internal.
- Boundary: no migration, no `.sql`, no DB apply, no SQL/data mutation, no
  seed/backfill, no schema change, no auth/permission logic change, no Worker
  created, no OpenNext/Wrangler config change, no runtime dependency added, no
  deploy and no push.
- `PLANNING.MD` was not read or committed.
- Recommended next phase: optional browser-level authenticated Vietnamese
  relationship UX smoke, or a small visual polish phase for dense admin
  relationship screens.

## 2026-06-21 - Plan A-01 - Tree Relationship Picker UX completed

- Replaced the Tree Editor side-panel manual related-person UUID input with a
  Vietnamese searchable member picker.
- Picker source: already loaded admin tree graph, so no new API endpoint was
  added.
- User-visible picker copy includes `Người đang chọn`, `Tìm thành viên`,
  `Tìm theo tên, năm sinh hoặc chi nhánh...`, `Không tìm thấy thành viên phù hợp.`
  and `Kết quả chọn`.
- Picker display label uses member name plus available birth year, generation
  and branch information.
- Internal submitted field remains `related_person_id`; selected value remains
  `person.personId` UUID.
- Existing server actions and relationship service remain unchanged:
  `addParentFromTreeAction`, `addSpouseFromTreeAction` and
  `addChildFromTreeAction`.
- Existing permission/auth logic remains unchanged; relationship creation still
  goes through the current service and `relationships.create` boundary.
- Added `docs/PLAN_A01_TREE_RELATIONSHIP_PICKER_UX.md`.
- Added `scripts/check-tree-relationship-picker-ux.cjs` and
  `npm run check:tree-relationship-picker-ux`.
- Decision 156 records that UUID stays internal while the Tree Editor shows a
  human-friendly member picker.
- Deferred: inline create-new-person from Tree Editor and broader
  `/admin/relationships` UUID form replacement.
- Boundary: no migration, no `.sql`, no DB apply, no seed/backfill, no schema
  change, no auth/permission logic change, no Worker created, no
  OpenNext/Wrangler config change, no runtime dependency added, no deploy and
  no push.
- `PLANNING.MD` was not read or committed.
- Recommended next phase: optional browser-level Tree Editor UX smoke with an
  authenticated operator session, or a separate scoped phase to replace UUID
  inputs on `/admin/relationships`.

## 2026-06-19 - Phase 132 - Routine Production Monitoring Snapshot completed

- Added `docs/132_ROUTINE_PRODUCTION_MONITORING_SNAPSHOT.md`.
- Added `scripts/check-routine-production-monitoring-snapshot.cjs` and
  `npm run check:routine-production-monitoring-snapshot`.
- Git sync/public monitoring gate PASS: local `main` and `origin/main`
  synchronized; ahead/behind `0 0`; worktree clean.
- Production URL:
  `https://web-gia-pha.hungdiepcompany.workers.dev`.
- Monitoring timestamp: `2026-06-19 17:58:02 +07:00`.
- Public monitoring PASS for `/`, `/tree` and `/auth/login`: HTTP 200,
  expected Vietnamese public UI copy present, obvious server error count `0`
  and forbidden marker count `0`.
- Forbidden markers checked: `notes_private`, `source_note`, `admin-warning`,
  `service_role`, `sb_secret_`, `Bearer `, `signedUrl`, `signed_url`,
  `COOKIE` and `SESSION`.
- Current authenticated smoke status remains
  `PHASE_130_BLOCKED_MISSING_EXPLICIT_AUTHENTICATED_SMOKE_ENV`.
- Public monitoring and static validation were not promoted to authenticated
  PASS.
- Decision 155 records that routine public monitoring snapshots are not
  authenticated smoke.
- Boundary: no authenticated smoke run, no credential requested, no secret
  printed or written, no deploy, no push, no migration, no `.sql`, no DB
  apply, no SQL/data mutation, no seed/backfill, no schema change, no
  auth/permission logic change, no export/import runtime expansion, no
  GEDCOM/ZIP/media/backup runtime, no Worker created, no OpenNext/Wrangler
  config change and no runtime dependency added.
- `PLANNING.MD` was not read or committed.
- Recommended next phase: continue routine public production monitoring, or
  retry Phase 130 authenticated production smoke only after owner/operator
  prepares explicit shell-only env in the Codex execution process and
  explicitly approves the retry.

## 2026-06-19 - Phase 131 - Production Monitoring and Authenticated Smoke Preparation completed

- Added `docs/131_PRODUCTION_MONITORING_AND_AUTH_SMOKE_PREPARATION.md`.
- Added `scripts/check-production-monitoring-auth-smoke-prep.cjs` and
  `npm run check:production-monitoring-auth-smoke-prep`.
- Git sync/public monitoring gate PASS before public requests: local `main`
  and `origin/main` synchronized; worktree clean.
- Production URL:
  `https://web-gia-pha.hungdiepcompany.workers.dev`.
- Lightweight public production monitoring PASS for `/`, `/tree` and
  `/auth/login`: HTTP 200, Vietnamese copy present and no obvious server error.
- Public tree/privacy marker review PASS: no admin warning UI marker,
  `notes_private`, `source_note`, token/key/session/signed URL marker found in
  the public route review.
- Current authenticated smoke status remains
  `PHASE_130_BLOCKED_MISSING_EXPLICIT_AUTHENTICATED_SMOKE_ENV`.
- Public monitoring and static validation were not promoted to authenticated
  PASS.
- Future Phase 130 retry requires: synced local/origin, clean worktree,
  reachable production URL, Phase 129 runbook PASS, Phase 130 checker PASS,
  all explicit shell-only env names present, no credential printing/writing
  and explicit owner approval for retry.
- If explicit shell-only env is missing, record
  `SAFE_SKIP_MISSING_EXPLICIT_AUTHENTICATED_SMOKE_ENV` and stop before
  authenticated network requests.
- Decision 154 records that Phase 131 monitoring/prep is docs/checker-only and
  not authenticated smoke.
- Boundary: no authenticated smoke run, no credential requested, no secret
  printed or written, no deploy, no push, no migration, no `.sql`, no DB
  apply, no SQL/data mutation, no seed/backfill, no schema change, no
  auth/permission logic change, no export/import runtime expansion, no
  GEDCOM/ZIP/media/backup runtime, no Worker created, no OpenNext/Wrangler
  config change and no runtime dependency added.
- `PLANNING.MD` was not read or committed.
- Recommended next phase: retry Phase 130 authenticated production smoke only
  after owner/operator prepares explicit shell-only env in the Codex execution
  process and explicitly approves the retry; otherwise continue routine public
  production monitoring.

## 2026-06-19 - Phase 130 - Authenticated Production Smoke Result completed

- Owner approved authenticated production smoke only if explicit shell-only
  smoke environment was already present.
- Git sync PASS: local `main` and `origin/main` were synchronized; ahead/behind
  `0 0`; worktree clean before Phase 130 changes.
- Env presence check used names and booleans only; no values were read or
  printed.
- Missing: `PROD_SMOKE_BASE_URL`, `PROD_AUTH_SMOKE_ENABLED`,
  `PROD_AUTH_SMOKE_USER_EMAIL`, `PROD_AUTH_SMOKE_SESSION`.
- Final execution status:
  `PHASE_130_BLOCKED_MISSING_EXPLICIT_AUTHENTICATED_SMOKE_ENV`.
- No authenticated network request was performed.
- Auth/session smoke: NOT RUN.
- Role/permission smoke: NOT RUN.
- Authenticated privacy smoke: NOT RUN.
- Authenticated Vietnamese UI smoke: NOT RUN.
- Live small `family.json` smoke: NOT RUN.
- Static pre-smoke checkers passed but were not promoted to authenticated
  production PASS.
- Workspace-root build failed before compile only on the known Windows `.next`
  ACL `EPERM`; clean temp build PASS.
- Added `docs/130_AUTHENTICATED_PRODUCTION_SMOKE_RESULT.md`.
- Added `scripts/check-authenticated-smoke-result.cjs` and
  `npm run check:authenticated-smoke-result`.
- Credential safety: no credential requested, read, printed or written; no
  authenticated response body was obtained.
- Decision 153 records that Phase 130 must stop before network when any
  explicit shell-only smoke variable is missing.
- Boundary: no authenticated request, no deploy, no push, no migration, no
  `.sql`, no DB apply, no SQL mutation, no seed/backfill, no schema change, no
  auth/permission logic change, no export/import runtime expansion, no
  GEDCOM/ZIP/media/backup runtime, no Worker created, no OpenNext/Wrangler
  config change and no runtime dependency added.
- `PLANNING.MD` was not read or committed.
- Recommended next phase: retry Phase 130 only after owner/operator prepares
  all explicit shell-only smoke variables in the Codex execution process.

## 2026-06-19 - Phase 129 - Authenticated Production Smoke Runbook completed

- Added `docs/129_AUTHENTICATED_PRODUCTION_SMOKE_RUNBOOK.md`.
- Current production remains deployed and public smoke remains PASS from Phase
  128 at `https://web-gia-pha.hungdiepcompany.workers.dev`.
- Authenticated smoke remains
  `SAFE_SKIP_MISSING_EXPLICIT_AUTHENTICATED_SMOKE_ENV`.
- Added owner/operator prerequisites and shell-only placeholders for base URL,
  enable marker, expected user email and session material.
- Real credential/session/cookie/token values must not be pasted into chat,
  docs, issues, committed files or logs.
- Added authenticated route checklist and role/permission matrix for people,
  relationships, genealogy, tree editor, export, revisions and system status.
- Added privacy matrix covering public tree/profile, private/source notes,
  relationship facts, admin warnings, system status and error output.
- Added small `family.json` smoke matrix for permission, metadata, lineage,
  privacy and artifact handling.
- Added Vietnamese UI smoke matrix for login, admin shell/dashboard, people,
  relationships, genealogy, tree, export/import, revisions, system status and
  unauthorized states.
- Added `scripts/check-authenticated-smoke-runbook.cjs` and
  `npm run check:authenticated-smoke-runbook`.
- Decision 152 records that SAFE_SKIP is required until explicit shell-only
  authenticated smoke material is prepared; public/static evidence cannot be
  promoted to authenticated PASS.
- No authenticated smoke was run in Phase 129.
- Boundary: no credential requested, no secret written, no test account, no
  deploy, no push, no migration, no `.sql`, no DB apply, no SQL mutation, no
  seed/backfill, no schema change, no auth/permission logic change, no
  export/import runtime expansion, no GEDCOM/ZIP/media/backup runtime, no
  Worker created, no OpenNext/Wrangler config change and no runtime dependency
  added.
- `PLANNING.MD` was not read or committed.
- Recommended next phase: owner/operator authenticated production smoke
  execution only after explicit shell-only prerequisites are prepared;
  otherwise continue routine production monitoring.

## 2026-06-19 - Phase 128 - Production Deploy And Smoke completed

- Owner approved manual production deploy check and post-deploy smoke.
- Git sync PASS: local `main` and `origin/main` both at `692920a`; ahead/behind
  count `0 0`; worktree clean before deploy.
- Phase 127 status confirmed: `READY_FOR_MANUAL_DEPLOY_CHECK`.
- Pre-deploy gates PASS: post-runtime/UI readiness, Vietnamese UI copy, small
  JSON export smoke/hardening, inline warning UI, export/import final
  readiness, env safety, migrations, typecheck, lint and Git whitespace.
- Workspace-root `npm run build` failed before compile only on the known
  Windows `.next` ACL `EPERM`; clean temp build PASS.
- Existing manual workflow `.github/workflows/cloudflare-deploy.yml` deployed
  commit `692920a5ba8779cde2d77bcf3fa8e5806cbc18aa`.
- GitHub Actions run:
  `https://github.com/hungdiepcompany-del/giapha/actions/runs/27817582152`.
- Deploy result: PASS.
- Worker: `web-gia-pha`.
- Cloudflare Version ID:
  `4765471a-a05d-45e8-8db4-7ccb3795d002`.
- Production URL:
  `https://web-gia-pha.hungdiepcompany.workers.dev`.
- Lightweight public smoke PASS: `/`, `/tree`, `/auth/login` returned HTTP 200;
  Vietnamese copy present; no obvious server error; public tree response did
  not contain admin warning UI markers or `notes_private`.
- Authenticated smoke:
  `SAFE_SKIP_MISSING_EXPLICIT_AUTHENTICATED_SMOKE_ENV`.
- Small JSON export risk remains LOW and limited to the approved small
  `family.json` path. No authenticated export download was run.
- No credential, token, key, cookie or secret was written to docs.
- Boundary: no migration, no `.sql`, no DB apply, no SQL mutation, no
  seed/backfill, no schema change, no permission/auth logic change, no new
  runtime feature, no export/import runtime expansion, no
  GEDCOM/ZIP/media/backup runtime, no Worker created, no OpenNext/Wrangler
  config change and no runtime dependency added.
- `PLANNING.MD` was not read or committed.
- Recommended next phase: owner/operator authenticated production smoke with
  explicit shell-only smoke material, or routine production monitoring.

## 2026-06-19 - Phase 127 - Post Runtime/UI Deploy Readiness Gate completed

- Added `docs/127_POST_RUNTIME_UI_DEPLOY_READINESS_GATE.md` with status
  `READY_FOR_MANUAL_DEPLOY_CHECK`.
- Added `scripts/check-post-runtime-ui-deploy-readiness.cjs` and
  `npm run check:post-runtime-ui-deploy-readiness`.
- Reviewed recent local work for deploy readiness: Phase 125 small JSON export
  hardening, Phase 126 small JSON export smoke/review and UI-VN-01 Vietnamese
  UI copy normalization.
- Runtime/UI changes reviewed: small existing `family.json` export hardening
  and display-only Vietnamese UI/message copy normalization.
- Worker/runtime: Main Worker touched YES by prior small JSON/UI changes;
  runtime dependency added NO; new Worker created NO; OpenNext/Wrangler config
  changed NO; Worker size risk LOW.
- Dependency/config drift: no dependency drift, no Wrangler/OpenNext config
  drift and no deploy workflow mutation in Phase 127.
- Migration/SQL/DB impact: no migration, no `.sql`, no DB apply, no SQL
  mutation, no seed/backfill, no schema change.
- Privacy/security: small JSON export remains guarded and privacy-safe;
  UI-VN-01 did not expose private/source notes, tokens, keys or secrets.
- Deploy readiness status: `READY_FOR_MANUAL_DEPLOY_CHECK`; this is not
  `DEPLOYED` and no deploy/push was performed.
- Validation: post-runtime/UI deploy readiness PASS; Vietnamese UI copy PASS;
  small JSON export smoke PASS; small JSON export hardening PASS; inline admin
  warning UI PASS; export/import final readiness PASS; export/import static
  examples PASS; export/import boundary design PASS; env-safe PASS; migrations
  PASS; typecheck PASS; lint PASS; clean temp `npm run build` PASS.
- Required before any deploy: explicit owner approval for deploy target/timing,
  intended commit, backup/snapshot expectation, GitHub Actions/Cloudflare path,
  Auth/OAuth URL readiness, rollback owner/path and post-deploy smoke operator.
- Root workspace build remains expected to hit the known Windows `.next` ACL
  `EPERM` before compile; use clean temp build excluding `.git`, `.next`,
  `node_modules`, env files and `PLANNING.MD` to distinguish source build
  failures from local artifact locks.
- Boundary: no deploy, no push, no migration, no `.sql`, no DB apply, no SQL
  mutation, no seed/backfill, no schema change, no permission/auth logic
  change, no export/import runtime expansion, no GEDCOM/ZIP/media/backup
  runtime, no Worker created, no OpenNext/Wrangler config change and no runtime
  dependency added.
- `PLANNING.MD` was not read or committed.
- Recommended next phase: owner-approved manual deploy check/deploy phase, or
  defer deploy and continue with separately approved product/runtime work.

## 2026-06-19 - UI-VN-01 - Vietnamese UI Copy Normalization completed

- Normalized user-visible UI copy to Vietnamese with diacritics across admin
  navigation/dashboard, people, relationships, tree viewer/editor,
  import/export preview, public pages, revisions, system status, backup
  dry-run and related service/validation messages.
- Textfield labels/placeholders and combobox/dropdown display labels were
  normalized where user-visible.
- Code/internal values remained unchanged: route paths, identifiers,
  component/function names, DB table/column names, enum values, permission keys,
  API fields, JSON keys, package/env names and migration/SQL contracts were not
  renamed.
- Added `docs/UI_VN_01_VIETNAMESE_UI_COPY_NORMALIZATION.md`.
- Added `scripts/check-vietnamese-ui-copy.cjs` and
  `npm run check:vietnamese-ui-copy`.
- Decision 149 records that UI-VN-01 is display-only copy normalization and
  does not authorize schema, migration, DB apply, runtime expansion, Worker,
  dependency, deploy or push work.
- Boundary: no migration, no `.sql`, no DB apply, no SQL mutation, no
  seed/backfill, no schema change, no permission/auth logic change, no
  export/import runtime expansion, no Worker created, no OpenNext/Wrangler
  config change, no runtime dependency added, no deploy and no push.
- `PLANNING.MD` was not read or committed.
- Recommended next path: a small browser-level Vietnamese copy smoke if owner
  wants screenshots, otherwise continue only with the next separately approved
  product/runtime phase.

## 2026-06-19 - Phase 126 - Small JSON Export Smoke Review completed

- Reviewed Phase 125 small `family.json` export hardening with local
  static/source smoke only; no DB query, real export file generation, deploy or
  production data access.
- Added `docs/126_SMALL_JSON_EXPORT_SMOKE_REVIEW.md` with metadata, privacy,
  lineage and runtime-boundary review results.
- Added `scripts/check-small-json-export-smoke.cjs` and
  `npm run check:small-json-export-smoke`.
- Smoke confirmed source coverage for `schema_version`, `app_export_version`,
  `exported_at`, `export_scope`, `privacy_scope`, lineage sections and lineage
  counts.
- Privacy review confirmed future non-admin builder paths use the existing
  privacy sanitizer, filter hidden rows, strip private/source notes, clear
  audit/delete actors and omit non-admin tree layout coordinates.
- Lineage review confirmed runtime export source references only `clans`,
  `clan_branches`, `generation_rules` and `person_branch_memberships`; no
  unsupported future media/name/life-event/burial/persistent-warning tables.
- Decision 148 records that Phase 126 is static smoke/review only and does not
  authorize export expansion, DB access, Worker, dependency, config, deploy or
  push work.
- Worker/runtime: main Worker touched NO in Phase 126 review; runtime
  dependency added NO; new service Worker created NO; OpenNext/Wrangler config
  changed NO; Worker size risk NO.
- Boundary: no migration, no `.sql`, no DB apply, no SQL mutation, no
  seed/backfill, no large JSON export runtime, no GEDCOM runtime, no ZIP
  runtime, no import parser runtime, no media export/import, no backup/restore
  runtime, no deploy and no push.
- Validation: small JSON export smoke PASS; small JSON export hardening PASS;
  export/import final readiness PASS; export/import static examples PASS;
  export/import boundary design PASS; inline admin warning UI PASS; Vietnamese
  genealogy manual SQL diagnostic, domain UI and domain readiness PASS;
  env-safe PASS; migrations PASS; typecheck PASS; lint PASS; clean temp
  `npm run build` PASS; Git whitespace checks PASS.
- Workspace-root build remains blocked before compile by the pre-existing
  Windows `.next` ACL `EPERM` unlink error. The clean temp copy build passed
  with `.git`, `.next`, env files and `PLANNING.MD` excluded.
- `.env.local`, `.dev.vars` and `PLANNING.MD` were not read;
  `PLANNING.MD` was not committed.
- Recommended next path: defer further export implementation, or request a
  separately owner-approved export-service boundary design phase before large
  JSON/GEDCOM/ZIP/media/backup expansion.

## 2026-06-19 - Phase 125 - Small Main-App JSON Export Hardening completed

- Owner approved Phase 125 small main-app JSON export hardening only.
- Reviewed existing JSON export surface:
  `app/(admin)/admin/exports/download/json/route.ts`,
  `lib/family/json-exporter.ts`, `lib/family/export-collector.ts` and
  `lib/family/export-types.ts`.
- Hardened `family.json` metadata with `app_export_version`, `export_scope`
  and `privacy_scope`; existing `schema_version`, `exported_at`, app metadata,
  manifest and checksum behavior remain.
- Added lineage export sections for existing verified tables only: `clans`,
  `clan_branches`, `generation_rules` and `person_branch_memberships`.
- Hardened non-admin JSON builder behavior for future `family`/`public` calls:
  people are sanitized through the existing privacy service, hidden rows are
  filtered, private/source notes are stripped, audit/delete actor fields are
  cleared and non-admin tree layout coordinates are omitted.
- Added `docs/125_SMALL_JSON_EXPORT_HARDENING.md`,
  `scripts/check-small-json-export-hardening.cjs` and
  `npm run check:small-json-export-hardening`.
- Decision 147 records that Phase 125 is only small JSON export hardening and
  does not authorize large JSON, GEDCOM/ZIP/media, backup/restore, import
  parser, Worker, dependency, config, deploy, migration or DB mutation work.
- Worker/runtime: main Worker touched YES, limited to existing small JSON
  export code; runtime dependency added NO; new service Worker created NO;
  OpenNext/Wrangler config changed NO; Worker size risk LOW.
- Boundary: no migration, no `.sql`, no DB apply, no SQL mutation, no
  seed/backfill, no large JSON export runtime, no GEDCOM heavy runtime, no ZIP
  runtime, no import parser runtime, no media export/import, no backup/restore
  runtime, no deploy and no push.
- Validation: small JSON export hardening PASS; export/import final readiness
  PASS; export/import static examples PASS; export/import boundary design PASS;
  inline admin warning UI PASS; Vietnamese genealogy manual SQL diagnostic,
  domain UI and domain readiness PASS; env-safe PASS; migrations PASS;
  typecheck PASS; lint PASS; clean temp `npm run build` PASS; Git whitespace
  checks PASS.
- Workspace-root build remains blocked before compile by the pre-existing
  Windows `.next` ACL `EPERM` unlink error. The clean temp copy build passed
  with `.git`, `.next`, env files and `PLANNING.MD` excluded.
- `.env.local`, `.dev.vars` and `PLANNING.MD` were not read;
  `PLANNING.MD` was not committed.
- Recommended next path: Phase 126 small JSON export smoke/review, or defer
  further export implementation until a separately owner-approved
  export-service boundary design phase.

## 2026-06-19 - Phase 122C-124C Export/Import Final Readiness Matrix completed

- Added `docs/122C_EXPORT_COMPATIBILITY_MATRIX.md` with export compatibility
  status for `family.json`, GEDCOM, ZIP, media-later, core genealogy tables,
  lineage tables, tree layouts, revisions, future media/warnings,
  public/family/admin export scopes and living-person privacy handling.
- Added `docs/123C_IMPORT_COMPATIBILITY_MATRIX.md` with import compatibility
  status for current/older/future `family.json`, GEDCOM, ZIP, media-later,
  validation matrix, conflict handling, preview expectations and
  restore/import apply gates.
- Added `docs/124C_PORTABILITY_BACKUP_FINAL_READINESS_GATE.md` with final
  docs/contracts/examples readiness, runtime not-ready list, decision matrix,
  required owner approvals, no-go runtime conditions, privacy/security notes
  and default recommendation.
- Added `scripts/check-export-import-final-readiness.cjs` and
  `npm run check:export-import-final-readiness`.
- Decision 146 records that the bundle is an owner decision gate only, not
  runtime, schema, service Worker, dependency, config, deploy or mutation
  approval.
- Default recommendation: defer implementation, or only consider separately
  approved small main-app JSON export hardening if it adds no heavy runtime,
  dependency or Worker changes.
- Worker/runtime: main Worker touched NO; runtime dependency added NO; new
  service Worker created NO; OpenNext/Wrangler config changed NO; large
  export/import/media/GEDCOM/ZIP/backup/restore work NO.
- Boundary: no migration, no `.sql`, no DB apply, no SQL mutation, no
  seed/backfill, no large JSON/GEDCOM/ZIP runtime, no import parser runtime, no
  media export/import, no backup/restore runtime, no deploy and no push.
- Validation: export/import final readiness PASS; export/import static
  examples PASS; export/import boundary design PASS; inline admin warning UI
  PASS; media-quality final readiness, static examples, static contracts and
  boundary design PASS; Vietnamese genealogy manual SQL diagnostic, domain UI
  and domain readiness PASS; env-safe PASS; migrations PASS; typecheck PASS;
  lint PASS; clean temp `npm run build` PASS; Git whitespace checks PASS.
- Workspace-root build remains blocked before compile by the pre-existing
  Windows `.next` ACL `EPERM` unlink error. The clean temp copy build passed
  with `.git`, `.next`, env files and `PLANNING.MD` excluded.
- `.env.local`, `.dev.vars` and `PLANNING.MD` were not read;
  `PLANNING.MD` was not committed.
- Recommended next path: defer implementation or request a separately
  owner-approved Phase 125 small JSON export hardening design/runtime gate.

## 2026-06-19 - Phase 122B-124B Export/Import Static Examples And Test Contracts completed

- Added `docs/122B_EXPORT_STATIC_EXAMPLES_ACCEPTANCE_CHECKLIST.md` with static
  `family.json` export shape, public/family/admin privacy-safe cases, GEDCOM
  mapping notes, ZIP manifest example, unsafe export cases and future
  export-service/GEDCOM/ZIP acceptance checklists.
- Added `docs/123B_IMPORT_STATIC_EXAMPLES_ACCEPTANCE_CHECKLIST.md` with static
  import payload cases, preview result shape, apply gate and future
  import-service/large import acceptance checklists.
- Added `docs/124B_PORTABILITY_BACKUP_TEST_CONTRACT_EXAMPLES.md` with static
  portability checks, backup manifest example, restore dry-run report,
  backward/forward compatibility examples, no-go conditions and future
  backup/import-service acceptance checklists.
- Added `scripts/check-export-import-static-examples.cjs` and
  `npm run check:export-import-static-examples`.
- Decision 145 records that these examples are review evidence only, not
  runtime fixtures, parser implementation, restore/apply approval or service
  Worker approval.
- Worker/runtime: main Worker touched NO; runtime dependency added NO; new
  service Worker created NO; OpenNext/Wrangler config changed NO; large
  export/import/media/backup/restore work NO.
- Boundary: no migration, no `.sql`, no DB apply, no SQL mutation, no
  seed/backfill, no large JSON/GEDCOM/ZIP runtime, no import parser runtime, no
  media export/import, no backup/restore runtime, no deploy and no push.
- Validation: export/import static examples PASS; export/import boundary
  design PASS; inline admin warning UI PASS; media-quality final readiness,
  static examples, static contracts and boundary design PASS; Vietnamese
  genealogy manual SQL diagnostic, domain UI and domain readiness PASS;
  env-safe PASS; migrations PASS; typecheck PASS; lint PASS; clean temp
  `npm run build` PASS; Git whitespace checks PASS.
- Workspace-root build remains blocked before compile by the pre-existing
  Windows `.next` ACL `EPERM` unlink error. The clean temp copy build passed
  with `.git`, `.next`, env files and `PLANNING.MD` excluded.
- `.env.local`, `.dev.vars` and `PLANNING.MD` were not read;
  `PLANNING.MD` was not committed.
- Recommended next path: Phase 122C/123C/124C static compatibility matrix or a
  separately owner-approved service-boundary design phase.

## 2026-06-19 - Phase 122A-124A Export/Import Boundary And Portability Contract completed

- Added `docs/122A_EXPORT_BOUNDARY_DESIGN.md` for design-only export boundary:
  current foundation, `family.json`, GEDCOM, ZIP, media-later, data groups,
  privacy rules, main Worker limits and export-service/ZIP/GEDCOM approval
  gates.
- Added `docs/123A_IMPORT_BOUNDARY_DESIGN.md` for design-only import boundary:
  current safe preview foundation, import stages, validation groups, no direct
  production mutation and import-service/large-import approval gates.
- Added `docs/124A_DATA_PORTABILITY_BACKUP_COMPATIBILITY_CONTRACT.md` for
  canonical `family.json`, stable IDs, schema versioning, backward/forward
  compatibility, restore dry-run, manifest, lineage, media-later and
  warnings-later compatibility.
- Added `scripts/check-export-import-boundary-design.cjs` and
  `npm run check:export-import-boundary-design`.
- Decision 144 records that these docs are not runtime/schema/service approval.
- Worker/runtime: main Worker touched NO; runtime dependency added NO; new
  service Worker created NO; OpenNext/Wrangler config changed NO; large
  export/import/media work NO.
- Boundary: no migration, no `.sql`, no DB apply, no SQL mutation, no
  seed/backfill, no large JSON/GEDCOM/ZIP runtime, no import parser runtime, no
  media export/import, no deploy and no push.
- Validation: export/import boundary design PASS; inline admin warning UI PASS;
  media-quality final readiness, static examples, static contracts and boundary
  design PASS; Vietnamese genealogy manual SQL diagnostic, domain UI and domain
  readiness PASS; env-safe PASS; migrations PASS; typecheck PASS; lint PASS;
  clean temp `npm run build` PASS; Git whitespace checks PASS.
- Workspace-root build remains blocked before compile by the pre-existing
  Windows `.next` ACL `EPERM` unlink error. The clean temp copy build passed
  with `.git`, `.next`, env files and `PLANNING.MD` excluded.
- `.env.local`, `.dev.vars` and `PLANNING.MD` were not read;
  `PLANNING.MD` was not committed.
- Recommended next path: Phase 122B/123B/124B static examples/checklists, or a
  separately owner-approved service-boundary design phase.

## 2026-06-19 - Phase 121B Inline Warning UI Post-Integration Smoke completed

- Completed post-integration smoke/review after commit `86d4ad6`.
- Admin smoke: `/admin/genealogy` with no effective permissions failed closed,
  showing the existing permission message and no fake warning data.
- Public smoke: `/tree` showed no admin warning panel/copy and no console
  warning/error.
- UI/copy review passed: labels remain `Thông tin`, `Cảnh báo`, `Cần xử lý`;
  warning cards include an actionable next step and safe empty-state copy.
- Privacy review passed: warning copy does not expose `notes_private`,
  `source_note`, hidden relationship facts, credentials, media/storage details
  or raw source material.
- Hardened `scripts/check-inline-admin-warning-ui.cjs` to scan public
  route/component source for admin warning imports/helpers and persistent
  warning references.
- Added `docs/121B_INLINE_WARNING_UI_POST_INTEGRATION_SMOKE.md`.
- Worker/runtime: main Worker touched only by checker/doc hardening in this
  phase; runtime dependency added NO; new service Worker created NO;
  OpenNext/Wrangler config changed NO; heavy scan/media/export/import work NO.
- Boundary: no migration, no `.sql`, no DB apply, no SQL mutation, no
  seed/backfill, no persistent warning table, no full-tree scan, no media work,
  no deploy and no push.
- Validation: inline admin warning UI PASS; media-quality final readiness,
  static examples, static contracts and boundary design PASS; Vietnamese
  genealogy manual SQL diagnostic, domain UI and domain readiness PASS;
  env-safe PASS; migrations PASS; typecheck PASS; lint PASS; clean temp
  `npm run build` PASS; Git whitespace checks PASS.
- Workspace-root build remains blocked before compile by the pre-existing
  Windows `.next` ACL `EPERM` unlink error. The clean temp copy build passed
  with `.git`, `.next`, env files and `PLANNING.MD` excluded.
- `.env.local`, `.dev.vars` and `PLANNING.MD` were not read;
  `PLANNING.MD` was not committed.
- Recommended next path: keep media, persistent warnings and heavy scans
  deferred; require separate owner approval for any schema, service Worker,
  media, export/import or broader runtime phase.

## 2026-06-19 - Phase 121A Lightweight Inline Admin Warning UI completed

- Owner-approved Option D was implemented only as deterministic inline admin
  hints from data already loaded on person, genealogy, membership and selected
  tree-node surfaces.
- Added reusable Vietnamese warning badge/list UI and pure warning-rule
  helpers; no warning query, persistence, background job or full-tree scan was
  introduced.
- Admin people warnings cover incomplete identity, invalid date order,
  living-person public visibility, multiple primary memberships, incomplete
  lineage assignment and lineage scope conflicts.
- Admin genealogy warnings summarize the already-loaded memberships; the tree
  editor only evaluates the selected loaded person node.
- Warning UI remains inside existing admin permission boundaries, does not
  expose private notes/source notes and is not present on public routes.
- Added `docs/121A_INLINE_ADMIN_WARNING_UI.md`,
  `scripts/check-inline-admin-warning-ui.cjs` and
  `npm run check:inline-admin-warning-ui`.
- Worker/runtime: main Worker receives only the small existing-app component
  and helper code; runtime dependency added NO; new service Worker created NO;
  OpenNext/Wrangler config changed NO; heavy scan/media/export/import work NO.
- Boundary: no migration, no `.sql`, no DB apply, no SQL mutation, no
  seed/backfill, no persistent warning table, no full-tree scan, no media work,
  no deploy and no push.
- Validation: inline admin warning UI PASS; media-quality final readiness,
  static examples, static contracts and boundary design PASS; Vietnamese
  genealogy manual SQL diagnostic, domain UI and domain readiness PASS;
  env-safe PASS; migrations PASS; typecheck PASS; lint PASS; clean temp
  `npm run build` PASS; Git whitespace checks PASS.
- Workspace-root build remains blocked before compile by the pre-existing
  Windows `.next` ACL `EPERM` unlink error. The clean temp copy build passed
  with `.git`, `.next`, env files and `PLANNING.MD` excluded.
- `.env.local`, `.dev.vars` and `PLANNING.MD` were not read;
  `PLANNING.MD` was not committed.
- Recommended next path: keep media, persistent warnings and heavy scans
  deferred; require separate owner approval for any Phase 121B schema, service
  or broader runtime scope.

## 2026-06-19 - Phase 118D-120D Vietnamese Genealogy Media/Data Quality Final Readiness completed

- Completed final docs-only readiness/signoff review after commit `3bc3847`.
- Created `docs/118D_120D_MEDIA_QUALITY_FINAL_READINESS_REVIEW.md` with Phase 118D media review, Phase 119D data-quality review, Phase 120D admin warning UX review, decision matrix, owner approvals and no-go conditions.
- Decision matrix result: option A defer all implementation is `RECOMMENDED_DEFAULT`.
- Option D inline admin warning UI is `CONDITIONALLY_READY` only through a separate explicit owner-approved lightweight runtime phase with no schema, persistence, heavy scan, Worker, dependency or config change.
- Options B/C are ready only for separately approved docs/static schema-candidate phases; options E/F are ready only for separately approved service design phases, not Worker implementation.
- Added `scripts/check-media-quality-final-readiness.cjs` and `npm run check:media-quality-final-readiness`.
- Worker/runtime: main Worker touched NO; runtime dependency added NO; new service Worker created NO; OpenNext/Wrangler config changed NO; Worker size risk introduced NO.
- Boundary: no migration, no `.sql` file, no DB apply, no SQL mutation, no seed/backfill, no media upload/storage bucket, no thumbnail/image processing, no persistent warning table, no full-tree runtime scan, no runtime warning UI, no large export/import/GEDCOM/ZIP, no deploy and no push.
- Validation: final readiness checker PASS, static examples/contracts/boundary checkers PASS, Phase 103-120D Vietnamese genealogy static checkers PASS, env-safe PASS, migrations PASS, typecheck PASS, lint PASS, clean temp `npm run build` PASS, `git diff --check` PASS and `git diff --cached --check` PASS.
- Note for next AI: workspace-root `npm run build` remains blocked before compile by pre-existing Windows `.next` artifact ACL error `EPERM: operation not permitted, unlink 'D:\CODE\GIA PHẢ\.next\build\56416d4ae4ce586f.js'`; clean temp copy build passed with `.next`, env files and `PLANNING.MD` excluded.
- Note for next AI: this final readiness review is a decision gate, not approval for any option B-F. Require explicit owner approval naming the selected path.
- `.env.local`, `.dev.vars` and `PLANNING.MD` were not read; `PLANNING.MD` was not committed.
- Recommended next path: keep option A, or request explicit owner approval for a narrowly scoped option D phase.

## 2026-06-19 - Phase 118C-120C Vietnamese Genealogy Media/Data Quality Acceptance Examples completed

- Grouped Phase 118C, 119C and 120C completed locally as docs/static examples and acceptance checklists after commit `7f794d7`.
- Phase 118C result: created `docs/118C_MEDIA_STATIC_EXAMPLES_ACCEPTANCE_CHECKLIST.md` with media payload, visibility, storage, unsafe-case and future migration/service/export acceptance examples.
- Phase 119C result: created `docs/119C_DATA_QUALITY_STATIC_EXAMPLES_ACCEPTANCE_CHECKLIST.md` with nine warning examples, deterministic codes, severity, Vietnamese copy, privacy behavior, resolution paths and quality-service acceptance criteria.
- Phase 120C result: created `docs/120C_ADMIN_WARNING_UX_ACCEPTANCE_CHECKLIST.md` with acceptance criteria for people, genealogy, tree editor, future import/export warning surfaces, copy, accessibility and privacy.
- Added `scripts/check-media-quality-static-examples.cjs` and `npm run check:media-quality-static-examples`.
- Worker/runtime: main Worker touched NO; runtime dependency added NO; new service Worker created NO; OpenNext/Wrangler config changed NO; Worker size risk introduced NO.
- Boundary: no migration, no `.sql` file, no DB apply, no SQL mutation, no seed/backfill, no media upload/storage bucket, no thumbnail/image processing, no persistent warning table, no full-tree runtime scan, no runtime warning UI, no large export/import/GEDCOM/ZIP, no deploy and no push.
- Validation: media/data-quality static examples checker PASS, static contracts checker PASS, boundary design checker PASS, Phase 103-120C Vietnamese genealogy static checkers PASS, env-safe PASS, migrations PASS, typecheck PASS, lint PASS, clean temp `npm run build` PASS, `git diff --check` PASS and `git diff --cached --check` PASS.
- Note for next AI: workspace-root `npm run build` remains blocked before compile by pre-existing Windows `.next` artifact ACL error `EPERM: operation not permitted, unlink 'D:\CODE\GIA PHẢ\.next\build\56416d4ae4ce586f.js'`; clean temp copy build passed with `.next`, env files and `PLANNING.MD` excluded.
- Note for next AI: static examples are acceptance evidence only. They are not fixtures, runtime data, schema authorization or service/Worker approval.
- `.env.local`, `.dev.vars` and `PLANNING.MD` were not read; `PLANNING.MD` was not committed.
- Recommended next phase: Phase 118D/119D/120D review-only refinement, or a separately owner-approved schema/service/runtime candidate phase.

## 2026-06-19 - Phase 118B-120B Vietnamese Genealogy Media/Data Quality Static Contracts completed

- Grouped Phase 118B, 119B and 120B completed locally as docs/static contract and approval-gate work after commit `a436cfa`.
- Phase 118B result: created `docs/118B_MEDIA_STATIC_CONTRACT_AND_APPROVAL_GATE.md` for future media metadata concepts, storage contract fields, privacy contract, media-service boundary and approval gates before media migration or media-service Worker.
- Phase 119B result: created `docs/119B_DATA_QUALITY_STATIC_CONTRACT_AND_APPROVAL_GATE.md` for warning categories, severity contract, future warning shape, privacy boundary and approval gates before persistent warning migration or quality-service Worker.
- Phase 120B result: created `docs/120B_ADMIN_WARNING_UX_STATIC_CONTRACT.md` for admin warning locations, Vietnamese labels, UX states, privacy-safe copy, accessibility/basic UI rules and schema/service boundaries.
- Added `scripts/check-media-quality-static-contracts.cjs` and `npm run check:media-quality-static-contracts`.
- Worker/runtime: main Worker touched NO; runtime dependency added NO; new service Worker created NO; OpenNext/Wrangler config changed NO; Worker size risk introduced NO.
- Boundary: no migration, no `.sql` file, no DB apply, no SQL mutation, no seed/backfill, no media upload/storage bucket, no thumbnail/image/video/file processing, no persistent warning table, no full-tree runtime scan, no large export/import/GEDCOM/ZIP, no deploy and no push.
- Validation: media/data-quality static contracts checker PASS, media/data-quality boundary checker PASS, Phase 103-120B Vietnamese genealogy static checkers PASS, env-safe PASS, migrations PASS, typecheck PASS, lint PASS, clean temp `npm run build` PASS, `git diff --check` PASS and `git diff --cached --check` PASS.
- Note for next AI: workspace-root `npm run build` remains blocked before compile by pre-existing Windows `.next` artifact ACL error `EPERM: operation not permitted, unlink 'D:\CODE\GIA PHẢ\.next\build\56416d4ae4ce586f.js'`; clean temp copy build passed with `.next`, env files and `PLANNING.MD` excluded.
- Note for next AI: these contracts are approval gates, not implementation permission. Any future media migration, storage provider activation, media-service Worker, persistent warning table, full-tree quality scan, import preview scan or export-readiness scan needs separate owner-approved phase.
- `.env.local`, `.dev.vars` and `PLANNING.MD` were not read; `PLANNING.MD` was not committed.
- Recommended next phase: Phase 118C/119C/120C static examples and acceptance checklists, or a separately owner-approved schema/service candidate phase.

## 2026-06-19 - Phase 118A-120A Vietnamese Genealogy Media/Data Quality Boundary Design completed

- Grouped Phase 118A, 119A and 120A completed locally as design-only boundary planning after Phase 117A commit `4a3f45038950f18d6e9bdf680d4c66de171b5e3e`.
- Phase 118A result: created `docs/118A_MEDIA_DOMAIN_STORAGE_BOUNDARY_DESIGN.md` for media domain/storage boundary, portraits, grave/tombstone photos, family documents/photos, branch/clan documents, event photos, metadata concepts, privacy and future storage/service gates.
- Phase 119A result: created `docs/119A_DATA_QUALITY_BOUNDARY_WARNING_DESIGN.md` for data-quality warning categories, severity, admin display locations, privacy and service-boundary split.
- Phase 120A result: created `docs/120A_ADMIN_WARNING_UX_PLANNING.md` for admin warning UX principles, Vietnamese severity labels, empty states, privacy-safe behavior and deferred runtime work.
- Added `scripts/check-media-quality-boundary-design.cjs` and `npm run check:media-quality-boundary-design`.
- Worker/runtime: main Worker touched NO; runtime dependency added NO; new service Worker created NO; OpenNext/Wrangler config changed NO; Worker size risk introduced NO.
- Boundary: no migration, no `.sql` file, no DB apply, no SQL mutation, no seed/backfill, no media upload/storage bucket, no real image/video/file processing, no thumbnail generation, no large export/import/GEDCOM/ZIP, no deploy and no push.
- Validation: media/data-quality boundary checker PASS, Phase 103-120A Vietnamese genealogy static checkers PASS, env-safe PASS, migrations PASS, typecheck PASS, lint PASS, clean temp `npm run build` PASS, `git diff --check` PASS and `git diff --cached --check` PASS.
- Note for next AI: workspace-root `npm run build` remains blocked before compile by pre-existing Windows `.next` artifact ACL error `EPERM: operation not permitted, unlink 'D:\CODE\GIA PHẢ\.next\build\56416d4ae4ce586f.js'`; clean temp copy build passed with `.next`, env files and `PLANNING.MD` excluded.
- Note for next AI: `docs/RUNTIME_WORKER_GUARDRAIL.md` and `docs/SERVICE_BOUNDARY_ROADMAP.md` remain mandatory before any future media upload/storage, large data-quality scan, import preview, GEDCOM/ZIP, new Worker, dependency or deploy/config work.
- `.env.local`, `.dev.vars` and `PLANNING.MD` were not read; `PLANNING.MD` was not committed.
- Recommended next phase: Phase 118B/119B/120B static contract/checklist work, or owner-approved Phase 121 only if it explicitly stays within boundary gates.

## 2026-06-19 - Phase 117A Vietnamese Genealogy Admin UX Polish completed

- Phase 117A completed locally as a scoped polish pass after grouped Phase 114-117 commit `22aff0f28e3f361a13e79cca831dd7935eb7ac45`.
- UX polish: admin genealogy dashboard/routes now use clearer Vietnamese labels and saved messages; empty states include next-step links.
- Form polish: clan, branch, generation rule and membership forms now have clearer Vietnamese labels, placeholders and helper text.
- Validation polish: required-field validation returns Vietnamese messages; duplicate/unique and foreign-key action errors are mapped to clearer user-facing copy.
- Double-submit guard: genealogy submit buttons use `useFormStatus` pending labels without adding dependencies.
- Person membership UX: person detail lineage section now explains explicit lineage-table assignment and warns when a clan prerequisite is missing.
- Tree display: admin tree cards label lineage display as `Dòng họ` and `Chi`, preferring lineage branch metadata when present.
- Public privacy remains conservative: public routes still do not query lineage tables, sanitizer still clears lineage fields unless public-visible and not living, and source/private/family-only membership data is not exposed publicly.
- Created `docs/117A_VIETNAMESE_GENEALOGY_ADMIN_UX_POLISH.md` and updated `docs/00_INDEX.md`.
- Updated `scripts/check-vietnamese-genealogy-domain-ui.cjs` to cover Phase 117A doc/polish markers and public privacy guard continuity.
- Worker/runtime: main Worker touched YES for lightweight admin UI polish only; runtime dependency added NO; new service Worker created NO; OpenNext/Wrangler config changed NO; Worker size risk LOW.
- Validation: Phase 103-117A Vietnamese genealogy static checkers PASS, env-safe PASS, migrations PASS, typecheck PASS, lint PASS, clean temp `npm run build` PASS, `git diff --check` PASS and `git diff --cached --check` PASS.
- Note for next AI: workspace-root `npm run build` remains blocked before compile by pre-existing Windows `.next` artifact ACL error `EPERM: operation not permitted, unlink 'D:\CODE\GIA PHẢ\.next\build\56416d4ae4ce586f.js'`; clean temp copy build passed with `.next`, env files and `PLANNING.MD` excluded.
- Boundary: no migration, no DB apply, no SQL mutation, no seed/backfill, no excluded runtime tables, no media/upload/storage, no large export/import/GEDCOM/ZIP, no Worker created, no OpenNext/Wrangler config change, no runtime dependency added, no deploy, no push and `.env.local`, `.dev.vars` and `PLANNING.MD` not read.
- Recommended next phase: Phase 118A Media Domain and Storage Boundary Design.

## 2026-06-19 - Phase 114-117 Vietnamese Genealogy Domain UI Integration completed

- Grouped Phase 114-117 completed locally after Phase 113C `PASS_MANUAL_SQL_DIAGNOSTIC`.
- Phase 114 result: added server-only lineage types, validation and service layer for `clans`, `clan_branches`, `generation_rules` and `person_branch_memberships`.
- Phase 115 result: added admin routes `/admin/genealogy`, `/admin/genealogy/clans`, `/admin/genealogy/branches`, `/admin/genealogy/generation-rules` and `/admin/genealogy/memberships`.
- Phase 116 result: person detail pages now show branch membership and include an explicit assignment form when the user has an existing manage permission.
- Phase 117 result: admin tree can display lineage membership data; public sanitizer clears lineage fields unless future lineage data is public-visible and the person is not living. Public routes do not query lineage tables in this phase.
- Permissions used: read via `people.view` or `tree.view`; manage via `people.update`, `relationships.update`, `tree.edit_layout` or `settings.manage`.
- Created `docs/114_117_VIETNAMESE_GENEALOGY_DOMAIN_UI_INTEGRATION.md`.
- Added `scripts/check-vietnamese-genealogy-domain-ui.cjs` and `npm run check:vietnamese-genealogy-domain-ui`.
- Updated `docs/00_INDEX.md`, `docs/08_AI_WORK_LOG.md` and `docs/09_DECISION_LOG.md`.
- Worker/runtime: main Worker touched YES for lightweight admin CRUD/UI only; runtime dependency added NO; new service Worker created NO; OpenNext/Wrangler config changed NO; Worker size risk LOW.
- Validation: Phase 103-117 Vietnamese genealogy static checkers PASS, env-safe PASS, migrations PASS, typecheck PASS, lint PASS, clean temp `npm run build` PASS, `git diff --check` PASS and `git diff --cached --check` PASS.
- Note for next AI: workspace-root `npm run build` is blocked before compile by pre-existing Windows `.next` artifact ACL error `EPERM: operation not permitted, unlink 'D:\CODE\GIA PHẢ\.next\build\56416d4ae4ce586f.js'`; clean temp copy build passed with `.next`, env files and `PLANNING.MD` excluded.
- Deferred: export/import/GEDCOM/ZIP/media/data-quality work remains boundary-governed and not implemented here.
- Boundary: no migration created, no DB apply, no SQL mutation by Codex, no seed/backfill, no automatic backfill from `people.branch_name` or `people.generation_number`, no excluded tables used, no media/upload/storage, no large export/import/GEDCOM/ZIP, no Worker created, no OpenNext/Wrangler config change, no runtime dependency added, no deploy, no push and `.env.local`, `.dev.vars` and `PLANNING.MD` not read.
- Recommended next phase: Phase 118A Media Domain and Storage Boundary Design, or a focused Phase 117A UX polish pass for genealogy admin selectors.

## 2026-06-19 - Phase 113C Vietnamese Genealogy Manual SQL Diagnostic PASS recorded

- Phase 113C recorded owner/operator-provided manual read-only SQL diagnostic PASS from Supabase Dashboard SQL Editor.
- Target Supabase project ref: `frkyeuxrlcflmsxxsolp`.
- Migration file: `db/migrations/20260618_0008_vietnamese_genealogy_first_migration.sql`.
- Final DB verification status: `PASS_MANUAL_SQL_DIAGNOSTIC`.
- Credential verifier status: `REST_VERIFIER_NOT_USED_FOR_PASS`.
- Required tables result: PASS for `clans`, `clan_branches`, `generation_rules` and `person_branch_memberships`.
- Excluded tables result: PASS; `person_names`, `person_life_events`, `person_burials` and `person_media` do not exist per owner/operator diagnostic.
- Existing core tables result: PASS for `people`, `families`, `family_parents`, `family_children` and `couple_relationships`.
- RLS result: PASS; owner/operator diagnostic confirmed RLS enabled on all four new lineage tables.
- Policies result: PASS; owner/operator diagnostic confirmed policies exist for all four new lineage tables.
- No seed/backfill result: PASS; owner/operator diagnostic confirmed zero rows in all four new lineage tables.
- Created `docs/113C_VIETNAMESE_GENEALOGY_MANUAL_SQL_DIAGNOSTIC_PASS.md`.
- Added `scripts/check-vietnamese-genealogy-manual-sql-diagnostic-pass.cjs` and `npm run check:vietnamese-genealogy-manual-sql-diagnostic-pass`.
- Security note remains active: service role key material was previously exposed in chat and must be rotated or revoked before future credential-assisted verification. Do not repeat, request, write or commit credential values.
- Boundary: no DB apply by Codex, no migration rerun, no SQL execution by Codex, no SQL mutation, no seed/backfill, no migration file change, no new migration, no runtime app code change, no UI change, no deploy, no Worker created, no OpenNext/Wrangler config change, no runtime dependency added, no push and `.env.local`, `.dev.vars` and `PLANNING.MD` not read.
- Recommended next phase: grouped Phase 114-117 can start.

## 2026-06-19 - Phase 113B-fix Vietnamese Genealogy Verification Diagnostic completed

- Phase 113B-fix handled owner-provided PowerShell verifier output that returned `FAIL`, not PASS.
- Current DB verification status: `NOT_VERIFIED`; do not record PASS from the current evidence.
- Required REST table checks failed for `clans`, `clan_branches`, `generation_rules` and `person_branch_memberships`.
- RLS result: not verified by REST-only verifier; needs SQL metadata evidence.
- Policy result: not verified by REST-only verifier; needs `pg_policies` evidence.
- Excluded scope result: not fully proven by current evidence; needs sanitized SQL output showing `person_names`, `person_life_events`, `person_burials` and `person_media` are absent.
- No seed/backfill result: not proven; needs read-only row-count SQL output for the four lineage tables.
- Existing table safety result: not proven; needs sanitized SQL output showing `people`, `families`, `family_parents`, `family_children` and `couple_relationships` still exist.
- Added `docs/113B_FIX_VIETNAMESE_GENEALOGY_VERIFICATION_DIAGNOSTIC.md` with diagnostic hypotheses and manual Supabase Dashboard read-only SQL checks.
- Hardened `scripts/verify-vietnamese-genealogy-migration-post-apply.cjs` to classify table failures, verify expected project ref shape, check existing core table REST readability and avoid claiming RLS/policy PASS from REST-only evidence.
- Added `scripts/check-vietnamese-genealogy-verification-diagnostic.cjs` and `npm run check:vietnamese-genealogy-verification-diagnostic`.
- Security note: service role key material was exposed in chat by the owner/operator. The exposed key must be rotated or revoked before further credential-assisted verification. Do not repeat, request, write or commit credential values.
- Boundary: no DB apply, no migration rerun, no SQL mutation, no seed/backfill, no migration file modification, no new migration, no runtime app code change, no UI change, no deploy, no Worker created, no OpenNext/Wrangler config change, no runtime dependency added, no push and `PLANNING.MD` not read or committed.
- No-go before Phase 114-117: required tables, RLS, policies, excluded scope, no seed/backfill and existing core table safety must be proven by sanitized SQL evidence, or the owner must explicitly accept proceeding with the limitation recorded.
- Recommended next step: owner rotates/revokes the exposed key, then runs the manual SQL checklist in Supabase Dashboard for project `frkyeuxrlcflmsxxsolp` and provides sanitized results.

## 2026-06-18 - Phase 113B Vietnamese Genealogy Credential Verification recorded

- Phase 113B attempted credential-assisted read-only post-apply verification.
- Explicit verification env was missing: `VIET_GENEALOGY_VERIFY_SUPABASE_URL`, `VIET_GENEALOGY_VERIFY_SUPABASE_SERVER_KEY` and `VIET_GENEALOGY_VERIFY_MODE=read_only`.
- Verifier result: `SKIPPED_MISSING_EXPLICIT_VERIFICATION_CREDENTIALS`.
- Final verification status: `PASS_WITH_SAFE_SKIP`.
- Created `docs/113B_VIETNAMESE_GENEALOGY_CREDENTIAL_VERIFICATION.md`.
- Added `scripts/check-vietnamese-genealogy-credential-verification.cjs` and `npm run check:vietnamese-genealogy-credential-verification`.
- Required tables result: not independently DB-verified due missing env.
- RLS result: not independently DB-verified due missing env.
- Policy result: not independently DB-verified due missing env.
- Excluded scope result: not independently DB-verified due missing env.
- No seed/backfill result: not independently DB-verified due missing env.
- Existing table safety result: not independently DB-verified due missing env.
- Static source review remains unchanged: migration creates only `clans`, `clan_branches`, `generation_rules` and `person_branch_memberships`, enables RLS, uses existing permissions and includes no seed/backfill.
- Boundary: no DB apply, no migration rerun, no SQL mutation, no seed/backfill, no migration file modification, no new migration, no deploy, no runtime app code change, no UI change, no Worker created, no OpenNext/Wrangler config change, no runtime dependency added, no push and `PLANNING.MD` not read or committed.
- Validation: verifier PASS_WITH_SAFE_SKIP, Phase 113B checker PASS, Phase 103-113A checkers PASS, env-safe PASS, migrations PASS, typecheck PASS, lint PASS, `git diff --check` PASS and `git diff --cached --check` PASS.
- Recommended next phase: provide shell-only verification env and rerun credential-assisted verification before Phase 114-117. Phase 114-117 remains not recommended after this safe-skip.

## 2026-06-18 - Phase 113A Vietnamese Genealogy Manual Apply Verification recorded

- Owner/operator confirmation received: `OWNER CONFIRMED MANUAL APPLY SUCCESS`.
- Manual apply method: Supabase Dashboard SQL Editor.
- Apply result from owner/operator: `SUCCESS`.
- Apply status recorded: `OWNER_CONFIRMED_APPLIED`.
- Target Supabase project ref: `frkyeuxrlcflmsxxsolp`.
- Migration file: `db/migrations/20260618_0008_vietnamese_genealogy_first_migration.sql`.
- Expected SHA256: `522B11AF4D8BDA4F1E29AB63C49C9718129ADF1B27F3F2119BB40D9F7214EA5F`.
- Actual SHA256: `522B11AF4D8BDA4F1E29AB63C49C9718129ADF1B27F3F2119BB40D9F7214EA5F`.
- Created `docs/113A_VIETNAMESE_GENEALOGY_MANUAL_APPLY_VERIFICATION.md`.
- Added `scripts/verify-vietnamese-genealogy-migration-post-apply.cjs` and `npm run verify:vietnamese-genealogy-migration:post-apply`.
- Added `scripts/check-vietnamese-genealogy-manual-apply-verification.cjs` and `npm run check:vietnamese-genealogy-manual-apply-verification`.
- DB verification status: `SKIPPED_MISSING_EXPLICIT_VERIFICATION_CREDENTIALS`.
- RLS/policy DB verification status: `SKIPPED_MISSING_EXPLICIT_VERIFICATION_CREDENTIALS`.
- Excluded-scope DB verification status: `SKIPPED_MISSING_EXPLICIT_VERIFICATION_CREDENTIALS`.
- Static source review remains unchanged: migration creates only `clans`, `clan_branches`, `generation_rules` and `person_branch_memberships`, enables RLS, uses existing permissions and includes no seed/backfill.
- Boundary: no DB apply run by AI/local, no migration rerun, no SQL mutation executed by AI/local, no seed/backfill, no migration file modification, no new migration, no deploy, no runtime app code change, no UI change, no Worker created, no OpenNext/Wrangler config change, no runtime dependency added, no push and `PLANNING.MD` not read or committed.
- Validation: Phase 103-113 checkers PASS, Phase 113A verifier PASS_WITH_SAFE_SKIP, Phase 113A checker PASS, env-safe PASS, migrations PASS, typecheck PASS, lint PASS, `git diff --check` PASS and `git diff --cached --check` PASS.
- Recommended next phase: Phase 113B Credential-Assisted Vietnamese Genealogy Read-Only DB Verification before Phase 114-117. If the owner accepts owner-confirmation-only evidence, Phase 114-117 grouped prompt can start with this limitation recorded.

## 2026-06-18 - Phase 113 Vietnamese Genealogy Migration Apply Execution recorded

- Owner approval received for DB apply of `db/migrations/20260618_0008_vietnamese_genealogy_first_migration.sql`.
- Target Supabase project ref: `frkyeuxrlcflmsxxsolp`.
- DB backup/snapshot: `DONE`.
- Expected SHA256: `522B11AF4D8BDA4F1E29AB63C49C9718129ADF1B27F3F2119BB40D9F7214EA5F`.
- Actual SHA256: `522B11AF4D8BDA4F1E29AB63C49C9718129ADF1B27F3F2119BB40D9F7214EA5F`.
- Pre-apply local/static checks passed.
- Local Supabase project ref file matched `frkyeuxrlcflmsxxsolp`, but Supabase CLI was not available in PATH and `.env.local` was missing.
- Apply result: `OWNER_ACTION_REQUIRED`; Codex did not run local DB apply.
- Required owner/operator action: manually apply exactly the approved migration file through a controlled Supabase Dashboard or equivalent one-file-only path, then record the result.
- DB verification result: `NOT_RUN_APPLY_NOT_CONFIRMED`; read-only post-apply verification still needs to confirm tables, RLS, policies, no old table drift, no excluded tables, no seed rows and no backfill.
- Created `docs/113_VIETNAMESE_GENEALOGY_MIGRATION_APPLY_EXECUTION.md`.
- Added `scripts/check-vietnamese-genealogy-migration-apply-execution.cjs` and `npm run check:vietnamese-genealogy-migration-apply-execution`.
- Boundary: no migration file modification, no extra migration, no extra SQL executed, no seed data, no production data mutation, no backfill from `people.branch_name`, no backfill from `people.generation_number`, no deploy, no runtime app code change, no UI change, no Worker created, no OpenNext/Wrangler config change, no runtime dependency added, no push and `PLANNING.MD` not read or committed.
- Validation: genealogy domain/schema/scope/real-migration/readiness/apply-execution checkers PASS, env-safe PASS, migrations PASS, typecheck PASS, lint PASS, `git diff --check` PASS and `git diff --cached --check` PASS.
- Recommended next phase: Phase 113A Owner Manual Apply Result Capture And Read-Only Verification. Phase 114-117 should wait until apply confirmation and read-only verification are recorded.

## 2026-06-18 - Phase 112 Vietnamese Genealogy Migration Apply Readiness completed

- Created `docs/112_VIETNAMESE_GENEALOGY_MIGRATION_APPLY_READINESS.md`.
- Added `scripts/check-vietnamese-genealogy-migration-apply-readiness.cjs` and `npm run check:vietnamese-genealogy-migration-apply-readiness`.
- Reviewed migration file `db/migrations/20260618_0008_vietnamese_genealogy_first_migration.sql` without modifying it.
- Migration fingerprint recorded: SHA256 `522B11AF4D8BDA4F1E29AB63C49C9718129ADF1B27F3F2119BB40D9F7214EA5F`.
- Readiness result: `READY_FOR_PHASE_113_APPROVAL_REQUEST`.
- Apply status remains `NOT_APPLIED`.
- Required before Phase 113: explicit owner approval for DB apply, correct Supabase project ref, current DB backup/snapshot, migration path confirmation, checksum comparison, RLS review, rollback owner/path and post-apply verification plan.
- No-go: wrong/unconfirmed project, missing backup, unclear rollback, failing migration/readiness checker, out-of-scope migration contents, unclear RLS/privacy or missing Phase 113 owner approval.
- Post-apply verification plan: verify tables, RLS, policies, unchanged old tables, build/runtime surfaces and no Worker/runtime changes.
- Worker/runtime: no main Worker touch, no runtime dependency, no service Worker, no OpenNext/Wrangler config change and no Worker size risk.
- Boundary: no DB apply, no SQL executed, no Supabase command run, no production data mutation, no migration file modified, no new migration created, no deploy, no runtime app code change, no UI change, no Worker created, no OpenNext/Wrangler config change, no runtime dependency added, no push and `PLANNING.MD` not read or committed.
- Recommended next phase: Phase 113 only if owner explicitly approves DB apply.

## 2026-06-18 - Phase 111 Vietnamese Genealogy Real Migration File completed

- Owner approved Phase 111 real migration file creation only.
- Created migration file `db/migrations/20260618_0008_vietnamese_genealogy_first_migration.sql`.
- Created `docs/111_VIETNAMESE_GENEALOGY_REAL_MIGRATION_FILE.md`.
- Added `scripts/check-vietnamese-genealogy-real-migration-file.cjs` and `npm run check:vietnamese-genealogy-real-migration-file`.
- Approved tables included: `clans`, `clan_branches`, `generation_rules`, `person_branch_memberships`.
- Explicitly excluded: `person_names`, `person_life_events`, `person_burials`, `person_media`, media processing, large export/import/GEDCOM/ZIP work, runtime app changes, Worker/service creation, DB apply, seed data and automatic backfill from `people.branch_name` or `people.generation_number`.
- RLS/privacy: all four new tables have RLS enabled from creation. Policies use existing permissions only: read via `people.view` or `tree.view`; insert/update via `people.update`, `relationships.update`, `tree.edit_layout` or `settings.manage`. No public-wide direct table access was added.
- Export/import follow-up: future `family.json` support must preserve clan, branch, generation rule and membership rows with stable IDs and reference validation; GEDCOM remains partial/JSON-first.
- Worker/runtime: no main Worker touch, no runtime dependency, no service Worker, no OpenNext/Wrangler config change and no Worker size risk.
- Apply status: `NOT_APPLIED`.
- Boundary: no DB apply, no SQL executed, no production data mutation, no deploy, no runtime app code change, no UI change, no Worker created, no OpenNext/Wrangler config change, no runtime dependency added, no push and `PLANNING.MD` not read or committed.
- Recommended next phase: Phase 112 Domain Migration Apply Readiness.

## 2026-06-18 - Phase 110B Vietnamese Genealogy First Migration Scope completed

- Created `docs/110B_VIETNAMESE_GENEALOGY_FIRST_MIGRATION_SCOPE.md`.
- Added `scripts/check-vietnamese-genealogy-first-migration-scope.cjs` and `npm run check:vietnamese-genealogy-first-migration-scope`.
- Current status: `PHASE_111_NOT_APPROVED`.
- Required marker: `OWNER_APPROVAL_REQUIRED_BEFORE_PHASE_111_REAL_MIGRATION_FILE=true`.
- Final proposed first migration scope if owner approves later: `clans`, `clan_branches`, `generation_rules`, `person_branch_memberships`.
- Optional owner decision: include or defer `person_names`.
- Deferred from first migration: `person_life_events`, `person_burials`, `person_media`, media processing, large export/import/GEDCOM/ZIP work, runtime app changes, Worker/service creation, DB apply and automatic backfill from `people.branch_name`.
- Privacy/RLS: all allowed first-migration tables must have RLS enabled; public output must remain filtered through server-side privacy rules.
- Export/import: allowed tables must eventually be preserved in `family.json`; GEDCOM remains partial and JSON-first for clan/branch/generation metadata.
- Worker/runtime: no main Worker touch, no runtime dependency, no service Worker, no OpenNext/Wrangler config change and no Worker size risk.
- Boundary: no real migration file, no DB apply, no SQL executed, no deploy, no runtime app change, no Worker created, no OpenNext/Wrangler config change, no runtime dependency added, no push and `PLANNING.MD` not read or committed.
- Recommended next phase: Phase 111 only if owner explicitly approves real migration file creation and answers the open scope questions.

## 2026-06-18 - Phase 108-110 Schema Candidate Owner Review completed

- Created `docs/108_110_SCHEMA_CANDIDATE_OWNER_REVIEW.md`.
- Review result: Phase 108-110 candidate is directionally sound but should not proceed directly to Phase 111 without scope and policy decisions.
- Recommended owner decision: `REQUEST_CHANGES_BEFORE_PHASE_111`.
- Proposed first migration scope if owner approves later: `clans`, `clan_branches`, `generation_rules`, `person_branch_memberships`; `person_names` is optional only if owner confirms immediate need.
- Deferred from first migration: `person_life_events`, `person_burials`, `person_media`, media processing, large export/import/GEDCOM/ZIP work and runtime changes.
- Boundary: no real migration file, no DB apply, no SQL executed, no deploy, no runtime app change, no Worker created, no OpenNext/Wrangler config change, no package added, no push and `PLANNING.MD` not committed.
- Recommended next phase: Phase 111 only if owner approves real migration file creation after review changes/questions are resolved.

## 2026-06-18 - Phase 108-110 Vietnamese Genealogy Schema Candidate Gate completed

- Created `docs/108_110_VIETNAMESE_GENEALOGY_SCHEMA_CANDIDATE.md` for schema strategy, candidate tables/fields, compatibility, worker boundary notes and real migration approval gate.
- Added `scripts/check-vietnamese-genealogy-schema-candidate.cjs` and `npm run check:vietnamese-genealogy-schema-candidate`.
- Candidate recommendation: normalize `clans`, `clan_branches`, `generation_rules`, `person_branch_memberships` and `person_names` first; defer `person_life_events` and `person_burials` to recommended next; keep `person_media` later until Phase 118A media/storage boundary design.
- Phase 110 remains approval-only: no real migration file, no DB apply and no SQL execution.
- Boundary: no deploy, no runtime app change, no Worker created, no OpenNext/Wrangler config change, no runtime dependency added, no push and `PLANNING.MD` not committed.
- Recommended next phase: review schema candidate; start Phase 111 only if owner approves real migration file creation.

## 2026-06-18 - Phase 103-107 Vietnamese Genealogy Domain Guardrail Hardening completed

- Phase 103-107 docs were hardened so `Required Now` cannot be mistaken for authorization to create schema, migration, DB apply, runtime, UI, service Worker or production changes.
- Phase 104 priority wording now uses `Specification Required Now`, with a nearby note clarifying it means specification/readiness only.
- Added cross-references to `docs/RUNTIME_WORKER_GUARDRAIL.md` and `docs/SERVICE_BOUNDARY_ROADMAP.md` for large export/import/media/GEDCOM/ZIP processing.
- Added runtime and Worker boundary status checklist to the Phase 103-107 bundle.
- Boundary: no migration, no DB apply, no deploy, no runtime app change, no Worker created, no OpenNext/Wrangler config change, no package added, no push.
- Recommended next phase: Phase 108-110 Vietnamese Genealogy Schema Candidate Design / Static Safety Check / Approval Gate.

## 2026-06-18 - Runtime Worker Guardrail and Service Boundary Roadmap docs prepared

- Created `docs/RUNTIME_WORKER_GUARDRAIL.md` to keep the main Cloudflare/OpenNext Worker small and prevent heavy runtime/dependency drift.
- Created `docs/SERVICE_BOUNDARY_ROADMAP.md` to map main app, backup service, export service, import service, media service and data-quality service candidates.
- Updated `AGENTS.md` reading rules so AI only reads these guardrail docs when the task touches runtime/export/import/media/backup/dependency/Worker concerns.
- Updated `docs/00_INDEX.md` with the two new docs.
- Updated `docs/02_ARCHITECTURE.md` with a short cross-reference and main Worker responsibility boundary.
- Updated `docs/07_PHASE_PLAN.md` with Phase 102B plus A/B boundary checkpoints for media/export/import/data-quality phases.
- Boundary: docs only, no migration, no DB apply, no deploy, no runtime code change, no Worker created, no package added, no push.
- Recommended next phase: apply these docs into the repo, then continue Phase 108-110 schema candidate design / static safety / approval gate.

## 2026-06-18 - Phase 103-107 Vietnamese Genealogy Domain Model Readiness completed

- Bundle 1 completed as docs/checker only.
- Created `docs/103_107_VIETNAMESE_GENEALOGY_DOMAIN_MODEL_READINESS.md`.
- Added `npm run check:vietnamese-genealogy-domain`.
- Phase 103 documented Vietnamese genealogy domain concepts: `dong_ho`, `chi`, `nhanh`, `doi`, `the_he`, founder, clan head, branch head, spouse/child/adopted/step relationships, memorial and privacy needs.
- Phase 104 recorded current model strengths and gaps, classified as Required Now / Recommended Next / Later.
- Phase 105 specified Vietnamese person profile fields and public/private defaults.
- Phase 106 specified relationship rules, child ordering and conflict warnings.
- Phase 107 specified clan/branch/generation structure, tree filtering and export/import compatibility.
- Boundary: no migration, no DB apply, no deploy, no production data mutation, no runtime app change.
- Validation: env safe, migration order, domain checker, typecheck, lint and `git diff --check` PASS.
- Direct build hit known Windows `.next` EPERM artifact lock; isolated temp build PASS and temp artifacts/config rewrites were removed.
- Recommended next phase: Phase 108-110 schema candidate design, candidate static safety and explicit approval gate before any real migration.

## 2026-06-18 - Phase 102 Verification Credential Completion Handoff completed

- Phase 98-102 completed with separate commits.
- DB verification: `SKIPPED_MISSING_VERIFICATION_CREDENTIALS`.
- Four permissions independently verified: NO.
- Role assignments independently verified: NOT_RUN.
- Authenticated endpoint smoke: `SKIPPED_MISSING_EXPLICIT_ENV`.
- Local/static permission guard smoke: PASS.
- Dry-run smoke: PASS.
- Fallback `permissions.manage`: retained.
- Execute/restore runtime: disabled.
- Fallback removal readiness: `NOT_READY_FOR_FALLBACK_REMOVAL`.
- Recommended next phase: Phase 103 Verification Environment Completion.
- Validation: Phase 102/101/99/100/98 checkers, DB/smoke safe-skips, local/static smoke, migration/pipeline/service/OpenNext checks, typecheck/lint/clean temp build PASS; direct build known `.next` EPERM; audit known advisories.

## 2026-06-18 - Phase 101 Verification Result Consolidation completed

- DB verification final status: `SKIPPED_MISSING_VERIFICATION_CREDENTIALS`.
- Four permissions independently verified: NO.
- Role assignments independently verified: NOT_RUN.
- Authenticated endpoint smoke final status: `SKIPPED_MISSING_EXPLICIT_ENV`.
- Local/static permission guard smoke: PASS.
- Dry-run smoke: PASS.
- Fallback removal readiness: `NOT_READY_FOR_FALLBACK_REMOVAL`.
- Fallback retained; execute/restore disabled.
- Validation: Phase 101/99/100/97 checkers, typecheck/lint/clean temp build PASS; direct build known `.next` EPERM; audit known advisories.
- Task tiep theo: Phase 102 Verification Credential Completion Handoff.

## 2026-06-18 - Phase 100 Authenticated Smoke Credential Assisted Run completed

- Authenticated endpoint smoke: `SKIPPED_MISSING_EXPLICIT_ENV`.
- Permission guard local/static smoke: PASS.
- Dry-run local/static smoke: PASS.
- No network/worker/production backup/upload/restore.
- Fallback retained; execute/restore disabled.
- Validation: smoke/checkers/typecheck/lint/clean temp build PASS; direct build known `.next` EPERM; audit known advisories.
- Task tiep theo: Phase 101 Verification Result Consolidation.

## 2026-06-18 - Phase 99 DB Verification Credential Assisted Run completed

- DB verification: `SKIPPED_MISSING_VERIFICATION_CREDENTIALS`.
- Four permissions independently verified: NO.
- Role assignments independently verified: NOT_RUN.
- Network/DB mutation: no.
- Fallback retained; execute/restore disabled.
- Validation: checker/typecheck/lint/clean temp build PASS; direct build known EPERM; audit known advisories.
- Task tiep theo: Phase 100 Authenticated Smoke Credential Assisted Run.

## 2026-06-18 - Phase 98 Verification Credential Completion Runbook completed

- Da tao CMD/PowerShell shell-only runbook cho DB verification va authenticated smoke.
- Chi co placeholder, khong co credential value.
- Khong doc `.env.local`/`.dev.vars`.
- Phase 98 khong query DB/network, deploy/push, mutation, fallback removal hoac execute/restore enablement.
- Validation: checker/typecheck/lint/clean temp build PASS; direct build known `.next` EPERM; audit known advisories.
- Task tiep theo: Phase 99 DB Verification Credential Assisted Run.

## 2026-06-18 - Phase 97 Backup Permission Verification Completion Handoff completed

### Final verification baseline

- Migration apply: `OWNER_CONFIRMED_APPLIED`.
- DB verification: `SKIPPED_MISSING_VERIFICATION_CREDENTIALS`.
- Four permissions independently verified: no.
- Role assignments independently verified: no, `NOT_RUN`.
- Authenticated endpoint smoke: `SKIPPED_MISSING_EXPLICIT_ENV`.
- Local/static permission guard and dry-run smoke: PASS.

### Readiness

- Fallback `permissions.manage`: still remains.
- Fallback removal: `NOT_READY_FOR_FALLBACK_REMOVAL`.
- Execute/restore runtime: still disabled.
- No deploy/push or new DB mutation.
- No secret committed.

### Recommended next phase

Phase 98 - Verification Credential Completion.

### Validation

- Phase 97/96/95/94 checkers: PASS.
- DB/authenticated smoke: safe-skip.
- Local/static smoke: PASS.
- Migration, backup pipeline, service boundary, OpenNext wiring: PASS.
- Typecheck/lint: PASS.
- Direct build: known `.next` EPERM; clean temp build PASS.
- Audit: `FAIL_WITH_KNOWN_ADVISORIES`.
- `git diff --check`: PASS.

Phase 97 status: `PASS_WITH_LIMITATIONS_AND_SAFE_SKIP`.

## 2026-06-18 - Phase 96 Backup Permission Verification Completion Run completed

### Verification result

- DB verification: `SKIPPED_MISSING_VERIFICATION_CREDENTIALS`.
- Four permissions independently verified: no.
- Role assignments independently verified: no, `NOT_RUN`.
- Authenticated endpoint smoke: `SKIPPED_MISSING_EXPLICIT_ENV`.
- Permission guard local/static smoke: PASS.
- Dry-run local/static smoke: PASS.

### Readiness

- Phase 96: `PASS_WITH_LIMITATIONS_AND_SAFE_SKIP`.
- Fallback `permissions.manage`: still remains.
- Fallback removal: `NOT_READY_FOR_FALLBACK_REMOVAL`.
- Execute/restore runtime: still disabled.

### Boundary

- No deploy/push.
- No migration/DB mutation.
- No worker call/production backup/upload/restore.
- No env-file read or secret commit.

### Validation

- Phase 96 checker and dependency checkers: PASS.
- DB/authenticated smoke: safe-skip.
- Local/static smoke: PASS.
- Typecheck/lint: PASS.
- Direct build: known `.next` EPERM; clean temp build PASS.
- Audit: `FAIL_WITH_KNOWN_ADVISORIES`.
- `git diff --check`: PASS.

### Task tiep theo

Phase 97 - Backup Permission Verification Completion Handoff.

## 2026-06-18 - Phase 95 Backup Operator Authenticated Smoke Env Contract completed

### Trang thai hien tai

Phase 95 da chot shell-only auth contract va harden smoke script de gui cookie hoac bearer den UI/API backup operator. Script chi kiem authenticated access va dry-run safety envelope.

### Current run

- Smoke env: missing.
- Authenticated smoke: `SKIPPED_MISSING_EXPLICIT_ENV`.
- Network call: no.
- Khong log cookie/token/header/base URL/response body.

### Boundary

- Khong deploy/push.
- Khong DB mutation/migration apply.
- Fallback `permissions.manage` van con.
- Execute/restore runtime van disabled.
- Khong worker call/production backup/upload/restore.
- Khong doc `.env.local`/`.dev.vars`.

### Validation

- Phase 95 checker: PASS.
- Authenticated smoke: `SKIPPED_MISSING_EXPLICIT_ENV`, no network.
- Typecheck/lint: PASS.
- Direct build: known `.next` EPERM; clean temp build PASS.
- Audit: `FAIL_WITH_KNOWN_ADVISORIES`.
- `git diff --check`: PASS.

Phase 95 status: `PASS_WITH_SAFE_SKIP`.

### Task tiep theo

Phase 96 - Backup Permission Verification Completion Run.

## 2026-06-18 - Phase 94 Backup Permission DB Verification Query completed

### Trang thai hien tai

Phase 94 da sua verifier thanh shell-only, SELECT-only theo contract Phase 93. Schema `permissions`, `roles`, `role_permissions` duoc xac nhan tu migration repo; verifier co the kiem 4 permission va OWNER/ADMIN assignments khi co env explicit.

### Current run result

- DB verification: `SKIPPED_MISSING_VERIFICATION_CREDENTIALS`.
- Permission verification: `NOT_RUN`.
- Role assignment verification: `NOT_RUN`.
- Ca 3 shell env deu missing.
- Verifier return truoc client creation; khong network/DB query.

### File/script

- `docs/94_BACKUP_PERMISSION_DB_VERIFICATION_QUERY.md`
- `scripts/verify-backup-permissions-post-apply.cjs`
- `scripts/check-backup-permission-db-verification-query.cjs`
- `npm run check:backup-permission-db-verification-query`

### Boundary giu nguyen

- Khong deploy/push.
- Khong rerun/apply migration, khong mutate DB.
- Fallback `permissions.manage` van con.
- Execute/restore runtime van disabled.
- Khong worker call/production backup/upload/restore.
- Khong doc `.env.local`/`.dev.vars`.
- Khong in/commit credential.

### Validation

- Verifier: `SKIPPED_MISSING_VERIFICATION_CREDENTIALS`, no network.
- Phase 94 checker, Phase 93 contract, apply handoff, fallback readiness: PASS.
- Legacy Phase 89 checker compatibility: PASS.
- Typecheck/lint: PASS.
- Direct build: FAIL do known Windows `.next` EPERM artifact lock.
- Clean temp build: PASS.
- Audit: `FAIL_WITH_KNOWN_ADVISORIES` trong `esbuild`, `postcss`, `ws`; khong force-fix.
- `git diff --check`: PASS.

Phase 94 status: `PASS_WITH_SAFE_SKIP`.

### Task tiep theo de xuat

Phase 95 - ghi nhan credentialed read-only verification khi approved shell-only env san sang. Khong go fallback hoac bat execute/restore neu chua co approval rieng.

## 2026-06-18 - Phase 93 Backup Permission Read-Only Verification Credential Contract completed

### Trang thai hien tai

Phase 93 da chot credential contract shell-only cho DB verification. Contract dung `BACKUP_PERMISSION_VERIFY_SUPABASE_URL`, `BACKUP_PERMISSION_VERIFY_SUPABASE_SERVER_KEY`, `BACKUP_PERMISSION_VERIFY_MODE=read_only`. Server key co the co quyen rong, nhung verifier phase sau chi duoc SELECT/read-only, khong doc `.env.local`/`.dev.vars`, khong in secret va safe-skip khi thieu env.

### File/script moi

- `docs/93_BACKUP_PERMISSION_READ_ONLY_VERIFICATION_CREDENTIAL_CONTRACT.md`
- `scripts/check-backup-permission-read-only-verification-credential-contract.cjs`
- `npm run check:backup-permission-read-only-verification-credential-contract`

### Boundary giu nguyen

- Khong query/mutate DB trong Phase 93.
- Khong deploy/push.
- Khong go fallback.
- Khong bat execute/restore runtime.
- Khong doc env file hoac in credential.
- Phase 89 limitation van la `SKIPPED_MISSING_VERIFICATION_CREDENTIALS`.
- Phase 94 tro di phai dung shell-only env va khong doc `.env.local`/`.dev.vars`.

### Validation

- Contract checker, apply handoff, fallback readiness, post-apply verification, migration apply execution: PASS.
- Typecheck/lint: PASS.
- Direct build: FAIL do known Windows `.next` EPERM artifact lock.
- Clean temp build: PASS.
- Audit: `FAIL_WITH_KNOWN_ADVISORIES` trong `esbuild`, `postcss`, `ws`; khong force-fix.
- `git diff --check`: PASS.

Phase 93 status: `PASS_WITH_KNOWN_NOTES`.

### Task tiep theo de xuat

Phase 94 - Backup Permission DB Verification Query.

## 2026-06-18 - Phase 92 Backup Permission Apply Handoff completed

### Trang thai hien tai

Phase 88-92 da hoan tat apply handoff bundle. Migration apply la owner-confirmed tren project ref `frkyeuxrlcflmsxxsolp`. DB verification read-only va authenticated endpoint smoke chua hoan tat do thieu local credentials/explicit env. Fallback removal status la `NOT_READY_FOR_FALLBACK_REMOVAL`.

### File/script moi

- `docs/92_BACKUP_PERMISSION_APPLY_HANDOFF.md`
- `scripts/check-backup-permission-apply-handoff.cjs`
- `npm run check:backup-permission-apply-handoff`

### Final baseline

- Migration apply: OWNER_CONFIRMED_APPLIED.
- Permission verification: SKIPPED_MISSING_VERIFICATION_CREDENTIALS.
- Runtime smoke: PARTIAL_LOCAL_STATIC_ONLY.
- Fallback removal readiness: NOT_READY_FOR_FALLBACK_REMOVAL.
- Fallback `permissions.manage` still remains.
- Execute/restore runtime still disabled.
- No deploy/push.
- No worker call/production backup/restore/storage operation.

### Task tiep theo de xuat

- Phase 93 - Backup Permission Verification Completion, khi co safe read-only credentials va explicit authenticated smoke env.
- Hoac Phase 93 - Backup Permission Runtime Fallback Removal, chi sau verification completion va owner approval rieng.
- Hoac Phase 93 - Backup Service Worker Manual Deploy Execution, chi khi owner approve deploy va secrets san sang.
- Hoac Phase 93 - Vietnamese Genealogy Domain Model Readiness.

## 2026-06-18 - Phase 91 Backup Permission Fallback Removal Readiness completed

### Trang thai hien tai

Phase 91 da danh gia fallback removal readiness va ket luan `NOT_READY_FOR_FALLBACK_REMOVAL`. Migration apply la owner-confirmed, nhung DB verification va authenticated endpoint smoke van safe-skip. Fallback `permissions.manage` van con trong API/UI runtime.

### File/script moi

- `docs/91_BACKUP_PERMISSION_FALLBACK_REMOVAL_READINESS.md`
- `scripts/check-backup-permission-fallback-removal-readiness.cjs`
- `npm run check:backup-permission-fallback-removal-readiness`

### Readiness baseline

- Migration apply: OWNER_CONFIRMED_APPLIED.
- Permission verification: SKIPPED_MISSING_VERIFICATION_CREDENTIALS.
- Runtime smoke: PARTIAL_LOCAL_STATIC_ONLY.
- API fallback removal: NOT_READY.
- UI fallback removal: NOT_READY.
- Separate owner approval still required.

### Boundary giu nguyen

- Khong sua runtime/go fallback.
- Khong deploy/push.
- Khong mutate DB.
- Khong bat execute/restore runtime.
- Khong worker call/production backup/restore.

### Task tiep theo de xuat

Phase 92 - Backup Permission Apply Handoff.

## 2026-06-18 - Phase 90 Backup Operator Permission Runtime Smoke completed

### Trang thai hien tai

Phase 90 da chay runtime smoke an toan. Post-migration endpoint smoke safe-skip vi thieu explicit env; permission guard va dry-run smoke local/static PASS. Khong goi worker, khong tao backup, khong upload storage va khong restore.

### File/script moi

- `docs/90_BACKUP_OPERATOR_PERMISSION_RUNTIME_SMOKE.md`
- `scripts/check-backup-operator-permission-runtime-smoke.cjs`
- `npm run check:backup-operator-permission-runtime-smoke`

### Smoke baseline

- `smoke:backup-permission:post-migration`: SKIPPED_NO_EXPLICIT_ENV.
- `smoke:backup-operator:permission-guard`: PASS_LOCAL_STATIC.
- `smoke:backup-operator:dry-run`: PASS_LOCAL_STATIC.
- Network execution: skipped.
- Worker call/production backup/storage upload/restore: no.
- Runtime fallback `permissions.manage` still remains.

### Boundary giu nguyen

- Khong deploy/push.
- Khong go fallback.
- Khong bat execute/restore runtime.
- Khong DB mutation.
- Khong worker call/production backup/restore.
- Khong hardcode hoac in secret/token/key.

### Task tiep theo de xuat

Phase 91 - Backup Permission Fallback Removal Readiness.

## 2026-06-18 - Phase 89 Backup Permission Post-Apply Verification completed

### Trang thai hien tai

Migration apply van la owner-confirmed successful tren project ref `frkyeuxrlcflmsxxsolp`. Phase 89 da them verifier read-only cho permission rows va OWNER/ADMIN mappings. Local khong co verification credentials nen current result la `SKIPPED_MISSING_VERIFICATION_CREDENTIALS`.

### File/script moi

- `docs/89_BACKUP_PERMISSION_POST_APPLY_VERIFICATION.md`
- `scripts/verify-backup-permissions-post-apply.cjs`
- `scripts/check-backup-permission-post-apply-verification.cjs`
- `npm run verify:backup-permissions:post-apply`
- `npm run check:backup-permission-post-apply-verification`

### Verification baseline

- Apply: owner-confirmed successful.
- Automated permission existence verification: SKIPPED.
- Automated role assignment verification: SKIPPED.
- Reason: missing local verification credentials.
- Verifier is read-only and does not print credential values.
- Runtime fallback `permissions.manage` still remains.
- Execute/restore runtime still disabled.

### Boundary giu nguyen

- Khong deploy/push.
- Khong mutate DB trong verifier.
- Khong go fallback.
- Khong bat execute/restore runtime.
- Khong worker call/production backup/restore.
- Khong hardcode hoac in secret/token/key.

### Task tiep theo de xuat

Phase 90 - Backup Operator Permission Runtime Smoke.

## 2026-06-18 - Phase 88 Backup Permission Real Migration Apply Execution completed

### Trang thai hien tai

Owner da xac nhan chay SQL migration `db/migrations/20260618_0007_backup_operator_permissions.sql` bang Supabase Dashboard SQL Editor tren project ref `frkyeuxrlcflmsxxsolp`. DB mutation da xay ra trong migration scope. Khong deploy, khong push, khong go fallback va khong bat execute/restore runtime.

### File/script moi

- `docs/88_BACKUP_PERMISSION_REAL_MIGRATION_APPLY_EXECUTION.md`
- `scripts/check-backup-permission-real-migration-apply-execution.cjs`
- `npm run check:backup-permission-real-migration-apply-execution`

### Apply baseline

- Apply method: Supabase Dashboard SQL Editor manual execution.
- Apply result: owner-confirmed successful.
- Target project ref: `frkyeuxrlcflmsxxsolp`.
- Local Supabase CLI/link/DB credentials: unavailable to Codex.
- Phase 89 must separate owner confirmation from automated DB verification.
- Runtime fallback `permissions.manage` still remains.
- Execute/restore runtime still disabled.

### Boundary giu nguyen

- Khong deploy/push.
- Khong go fallback.
- Khong bat execute/restore runtime.
- Khong goi backup worker.
- Khong tao/upload backup production.
- Khong restore production.
- Khong hardcode hoac in secret/token/key/connection string.

### Task tiep theo de xuat

Phase 89 - Backup Permission Post-Apply Verification.

## 2026-06-18 - Phase 87 Backup Permission Execution Readiness Handoff completed

### Trang thai hien tai

Production van chay tren main worker hien co. Phase 83-87 da hoan tat execution readiness bundle cho backup permission migration. Migration file nam o canonical path `db/migrations/20260618_0007_backup_operator_permissions.sql`; wrong old path trong `supabase/migrations/` khong con. Migration chua duoc chay, chua apply DB, chua mutate DB, chua deploy va chua bat execute/restore runtime.

### File/script moi

- `docs/87_BACKUP_PERMISSION_EXECUTION_READINESS_HANDOFF.md`
- `scripts/check-backup-permission-execution-readiness-handoff.cjs`
- `npm run check:backup-permission-execution-readiness-handoff`

### Execution readiness baseline

- Canonical migration path: `db/migrations/20260618_0007_backup_operator_permissions.sql`
- Wrong old path no longer exists: `supabase/migrations/20260618_0007_backup_operator_permissions.sql`
- Execution runbook: ready as docs/check.
- Pre-apply checklist: ready as docs/check.
- Rollback drill: ready as docs/check.
- Approval gate: ready as docs/check.
- Migration has not been run.
- No DB mutation.
- Runtime fallback `permissions.manage` still remains.
- `backup.operator.execute` and `backup.operator.restore` still not enabled in runtime.

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong chay migration.
- Khong apply DB.
- Khong mutate DB.
- Khong goi Supabase/API/DB/network.
- Khong goi backup service worker that.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong cron/schedule.
- Khong hardcode secret/token/key.

### Task tiep theo de xuat

- Phase 88 - Backup Permission Real Migration Apply Execution, chi khi owner explicitly approve chay migration/apply DB that.
- Hoac Phase 88 - Backup Service Worker Manual Deploy Execution, chi khi owner approve deploy that va secrets da san sang.
- Hoac Phase 88 - Vietnamese Genealogy Domain Model Readiness, neu muon tam dung ha tang.

## 2026-06-18 - Phase 86 Backup Permission Apply Approval Gate completed

### Trang thai hien tai

Production van chay tren main worker hien co. Phase 86 da tao approval gate cuoi truoc future backup permission migration apply. Migration chua duoc chay, chua apply DB, chua mutate DB, chua deploy va chua bat execute/restore runtime.

### File/script moi

- `docs/86_BACKUP_PERMISSION_APPLY_APPROVAL_GATE.md`
- `scripts/check-backup-permission-apply-approval-gate.cjs`
- `npm run check:backup-permission-apply-approval-gate`

### Approval gate baseline

- Required marker: `OWNER_APPROVAL_REQUIRED_BEFORE_APPLYING_BACKUP_PERMISSION_MIGRATION=true`
- Canonical migration path: `db/migrations/20260618_0007_backup_operator_permissions.sql`
- Required before future apply: Supabase project confirmation, DB backup/snapshot, local validation, rollback owner, smoke owner va apply window.
- Migration has not been run.
- No DB mutation.

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong chay migration.
- Khong apply DB.
- Khong mutate DB.
- Khong goi Supabase/API/DB/network.
- Khong hardcode secret/token/key.

### Task tiep theo de xuat

Phase 87 - Backup Permission Execution Readiness Handoff.

## 2026-06-18 - Phase 85 Backup Permission Rollback Drill Plan completed

### Trang thai hien tai

Production van chay tren main worker hien co. Phase 85 da tao rollback drill plan cho backup permission migration. Migration chua duoc chay, chua apply DB, chua mutate DB, chua deploy, chua rollback that va chua bat execute/restore runtime.

### File/script moi

- `docs/85_BACKUP_PERMISSION_ROLLBACK_DRILL_PLAN.md`
- `scripts/check-backup-permission-rollback-drill-plan.cjs`
- `npm run check:backup-permission-rollback-drill-plan`

### Rollback readiness baseline

- Canonical migration path: `db/migrations/20260618_0007_backup_operator_permissions.sql`
- Rollback options documented: restore from snapshot, correct role mappings, keep permission rows if appropriate, keep fallback `permissions.manage`.
- Failure scenarios documented for `/admin/backups`, API dry-run, missing permissions, wrong assignments, wrong project and premature fallback removal.
- Migration has not been run.
- No DB mutation.

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong chay migration.
- Khong apply DB.
- Khong mutate DB.
- Khong chay rollback that.
- Khong goi Supabase/API/DB/network.
- Khong hardcode secret/token/key.

### Task tiep theo de xuat

Phase 86 - Backup Permission Apply Approval Gate.

## 2026-06-18 - Phase 84 Backup Permission Pre-Apply Verification Checklist completed

### Trang thai hien tai

Production van chay tren main worker hien co. Phase 84 da tao pre-apply verification checklist cho backup permission migration. Migration chua duoc chay, chua apply DB, chua mutate DB, chua deploy va chua bat execute/restore runtime.

### File/script moi

- `docs/84_BACKUP_PERMISSION_PRE_APPLY_VERIFICATION_CHECKLIST.md`
- `scripts/check-backup-permission-pre-apply-verification-checklist.cjs`
- `npm run check:backup-permission-pre-apply-verification-checklist`

### Checklist baseline

- Canonical migration path: `db/migrations/20260618_0007_backup_operator_permissions.sql`
- No-go neu thieu owner approval, DB backup/snapshot, dung Supabase project, static checks, canonical path check, rollback owner, smoke owner, expected roles hoac fallback plan understanding.
- Runtime fallback `permissions.manage` still remains.
- Migration has not been run.
- No DB mutation.

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong chay migration.
- Khong apply DB.
- Khong mutate DB.
- Khong goi Supabase/API/DB/network.
- Khong hardcode secret/token/key.

### Task tiep theo de xuat

Phase 85 - Backup Permission Rollback Drill Plan.

## 2026-06-18 - Phase 83 Backup Permission Migration Path Canonicalization completed

### Trang thai hien tai

Production van chay tren main worker hien co. Phase 83 da sua canonical path cua backup permission migration ve `db/migrations/20260618_0007_backup_operator_permissions.sql` va tao execution runbook. Migration chua duoc chay, chua apply DB, chua mutate DB, chua deploy va chua bat execute/restore runtime.

### File/script moi

- `docs/83_BACKUP_PERMISSION_MIGRATION_EXECUTION_RUNBOOK.md`
- `scripts/check-backup-permission-migration-canonical-path.cjs`
- `scripts/check-backup-permission-migration-execution-runbook.cjs`
- `npm run check:backup-permission-migration-canonical-path`
- `npm run check:backup-permission-migration-execution-runbook`

### Migration path baseline

- Canonical path: `db/migrations/20260618_0007_backup_operator_permissions.sql`
- Wrong old path: `supabase/migrations/20260618_0007_backup_operator_permissions.sql`
- Wrong old path must not exist after Phase 83.
- Migration content behavior was not changed.
- Migration has not been run.
- No DB mutation.
- Runtime fallback `permissions.manage` still remains.

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong chay migration.
- Khong apply DB.
- Khong mutate DB.
- Khong goi Supabase/API/DB/network.
- Khong goi backup service worker that.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.

### Task tiep theo de xuat

Phase 84 - Backup Permission Pre-Apply Verification Checklist.

## 2026-06-18 - Phase 82 Backup Permission Real Migration Handoff completed

### Trang thai hien tai

Production van chay tren main worker hien co. Phase 78-82 da hoan tat real migration file bundle cho backup permissions: migration file da co trong `supabase/migrations/`, static verification, fallback removal plan, post-migration smoke plan va handoff. Migration chua duoc chay, chua apply DB, chua mutate DB, chua deploy va chua bat execute/restore runtime.

### File/script moi

- `docs/82_BACKUP_PERMISSION_REAL_MIGRATION_HANDOFF.md`
- `scripts/check-backup-permission-real-migration-handoff.cjs`
- `npm run check:backup-permission-real-migration-handoff`

### Real migration baseline

- Migration file: `supabase/migrations/20260618_0007_backup_operator_permissions.sql`
- Migration has not been run.
- No DB mutation.
- Static verification: `npm run check:backup-permission-real-migration-static-verification`
- Fallback removal plan: documented only.
- Post-migration smoke: safe-skip unless explicit env is set.
- Runtime fallback `permissions.manage` still remains.

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong chay migration.
- Khong apply DB.
- Khong mutate DB.
- Khong goi Supabase/API/DB/network.
- Khong goi backup service worker that.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.

### Task tiep theo de xuat

- Phase 83 - Backup Permission Migration Execution Runbook, neu owner chuan bi cho apply DB nhung van chua chay.
- Hoac Phase 83 - Backup Permission Real Migration Apply Execution, chi khi owner explicitly approve chay migration/apply DB that.
- Hoac Phase 83 - Backup Service Worker Manual Deploy Execution, chi khi owner approve deploy that va secrets da san sang.
- Hoac Phase 83 - Vietnamese Genealogy Domain Model Readiness.

## 2026-06-18 - Phase 81 Backup Permission Post-Migration Smoke Plan completed

### Trang thai hien tai

Production van chay tren main worker hien co. Phase 81 da them post-migration smoke plan va smoke script safe-skip. Script khong goi URL khi thieu explicit env va khong doc `.env.local`/`.dev.vars`.

### File/script moi

- `docs/81_BACKUP_PERMISSION_POST_MIGRATION_SMOKE_PLAN.md`
- `scripts/smoke-backup-permission-post-migration.cjs`
- `scripts/check-backup-permission-post-migration-smoke-plan.cjs`
- `npm run smoke:backup-permission:post-migration`
- `npm run check:backup-permission-post-migration-smoke-plan`

### Smoke baseline

- Marker: `BACKUP_PERMISSION_POST_MIGRATION_SMOKE_ONLY`
- Env placeholders: `BACKUP_PERMISSION_SMOKE_BASE_URL`, `BACKUP_PERMISSION_SMOKE_EXPECTED_USER`
- Default result without env: SKIPPED
- Scope with explicit env: `/api/admin/backups/service-dry-run` and `/admin/backups`
- No backup worker call, production backup, storage upload or restore.

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong chay migration.
- Khong apply DB.
- Khong mutate DB.
- Khong goi Supabase/API/DB truc tiep.
- Khong goi backup service worker that.

### Task tiep theo de xuat

Phase 82 - Backup Permission Real Migration Handoff.

## 2026-06-18 - Phase 80 Backup Permission Runtime Fallback Removal Plan completed

### Trang thai hien tai

Production van chay tren main worker hien co. Phase 80 da them plan bo fallback `permissions.manage` sau khi migration duoc apply trong tuong lai. Phase nay khong sua runtime fallback, khong chay migration va khong mutate DB.

### File/script moi

- `docs/80_BACKUP_PERMISSION_RUNTIME_FALLBACK_REMOVAL_PLAN.md`
- `scripts/check-backup-permission-runtime-fallback-removal-plan.cjs`
- `npm run check:backup-permission-runtime-fallback-removal-plan`

### Fallback baseline

- Current fallback: `permissions.manage`
- API/UI runtime still contain fallback.
- Do not remove fallback until migration has been applied, backup permissions exist in DB, expected roles have assignments, smoke test passes with real user, rollback is ready and owner approves.

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong chay migration.
- Khong apply DB.
- Khong mutate DB.
- Khong sua runtime fallback.
- Khong goi Supabase/API/DB/network.

### Task tiep theo de xuat

Phase 81 - Backup Permission Post-Migration Smoke Plan.

## 2026-06-18 - Phase 79 Backup Permission Migration Static Verification completed

### Trang thai hien tai

Production van chay tren main worker hien co. Phase 79 da them static verification cho migration file backup permission that. Checker chi doc source local, khong chay migration, khong apply DB va khong goi Supabase/API/DB/network.

### File/script moi

- `docs/79_BACKUP_PERMISSION_MIGRATION_STATIC_VERIFICATION.md`
- `scripts/check-backup-permission-real-migration-static-verification.cjs`
- `npm run check:backup-permission-real-migration-static-verification`

### Verification baseline

- Migration under review: `supabase/migrations/20260618_0007_backup_operator_permissions.sql`
- Required markers: `BACKUP_PERMISSION_REAL_MIGRATION_FILE`, `OWNER_APPROVED_FILE_CREATION_ONLY`, `DO_NOT_RUN_WITHOUT_SEPARATE_OWNER_APPROVAL`
- Required permissions: `backup.operator.view`, `backup.operator.dry_run`, `backup.operator.execute`, `backup.operator.restore`
- Allowed assignment: `OWNER` all four, `ADMIN` view/dry_run, viewer/public/anonymous none.

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong chay migration.
- Khong apply DB.
- Khong mutate DB.
- Khong goi Supabase/API/DB/network.
- Khong goi backup service worker that.
- Khong bat execute/restore runtime.

### Task tiep theo de xuat

Phase 80 - Backup Permission Runtime Fallback Removal Plan.

## 2026-06-18 - Phase 78 Backup Permission Real Migration File Implementation completed

### Trang thai hien tai

Production van chay tren main worker hien co. Phase 78 da tao migration file that trong repo cho backup operator permissions, nhung chua chay migration, chua apply DB, chua mutate DB va chua goi Supabase/API/DB/network.

### File/script moi

- `supabase/migrations/20260618_0007_backup_operator_permissions.sql`
- `docs/78_BACKUP_PERMISSION_REAL_MIGRATION_FILE_IMPLEMENTATION.md`
- `scripts/check-backup-permission-real-migration-file.cjs`
- `npm run check:backup-permission-real-migration-file`

### Migration file baseline

- Path: `supabase/migrations/20260618_0007_backup_operator_permissions.sql`
- Markers: `BACKUP_PERMISSION_REAL_MIGRATION_FILE`, `OWNER_APPROVED_FILE_CREATION_ONLY`, `DO_NOT_RUN_WITHOUT_SEPARATE_OWNER_APPROVAL`
- Permissions: `backup.operator.view`, `backup.operator.dry_run`, `backup.operator.execute`, `backup.operator.restore`
- Role assignment: `OWNER` all four, `ADMIN` view/dry_run, other roles none.

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong chay migration.
- Khong apply DB.
- Khong mutate DB.
- Khong goi Supabase/API/DB/network.
- Khong goi backup service worker that.
- Khong bat execute/restore runtime.

### Task tiep theo de xuat

Phase 79 - Backup Permission Migration Static Verification.

## 2026-06-18 - Phase 77 Backup Permission Migration Candidate Handoff completed

### Trang thai hien tai

Production van chay tren main worker hien co. Phase 73-77 da hoan tat migration candidate bundle cho `backup.operator.*`: SQL candidate draft, static safety, seed candidate smoke, approval checklist va handoff. Chua tao migration that, chua co file trong `supabase/migrations/`, chua chay SQL, chua mutate DB, chua deploy va chua bat execute/restore.

### File/script moi

- `docs/77_BACKUP_PERMISSION_MIGRATION_CANDIDATE_HANDOFF.md`
- `scripts/check-backup-permission-migration-candidate-handoff.cjs`
- `npm run check:backup-permission-migration-candidate-handoff`

### Candidate baseline

- SQL candidate path: `scripts/backup-permission-sql-candidate.sql.draft`
- SQL candidate is not real migration.
- Static safety: `npm run check:backup-permission-sql-static-safety`
- Seed candidate smoke: `npm run smoke:backup-permission:seed-candidate`
- Approval checklist: `npm run check:backup-permission-real-migration-approval-checklist`
- Required owner marker: `OWNER_APPROVAL_REQUIRED_BEFORE_BACKUP_PERMISSION_REAL_MIGRATION=true`
- Runtime fallback `permissions.manage` remains.

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong tao migration that.
- Khong co file trong `supabase/migrations/`.
- Khong chay SQL.
- Khong chay migration that.
- Khong mutate DB.
- Khong goi Supabase/API/DB/network.
- Khong goi backup service worker that.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.

### Task tiep theo de xuat

- Phase 78 - Backup Permission Real Migration File Implementation, chi khi owner explicitly approve tao migration/schema that.
- Hoac Phase 78 - Backup Service Worker Manual Deploy Execution, chi khi owner explicitly approve deploy that va secrets da san sang.
- Hoac Phase 78 - Vietnamese Genealogy Domain Model Readiness.

## 2026-06-18 - Phase 76 Backup Permission Real Migration Approval Checklist completed

### Trang thai hien tai

Production van chay tren main worker hien co. Phase 76 da them approval checklist cho future real backup permission migration. Checklist chi la gate review, chua tao migration that, chua chay SQL va chua mutate DB.

### File/script moi

- `docs/76_BACKUP_PERMISSION_REAL_MIGRATION_APPROVAL_CHECKLIST.md`
- `scripts/check-backup-permission-real-migration-approval-checklist.cjs`
- `npm run check:backup-permission-real-migration-approval-checklist`

### Approval baseline

- Marker: `OWNER_APPROVAL_REQUIRED_BEFORE_BACKUP_PERMISSION_REAL_MIGRATION=true`
- Required before real migration: owner approval, SQL candidate checks, seed dry-run/smoke checks, DB backup/snapshot, rollback plan, production window, post-migration validation.
- No-go if assignment, fallback removal plan, or execute/restore boundary is not confirmed.

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong tao migration that.
- Khong chay SQL.
- Khong chay migration that.
- Khong mutate DB.
- Khong goi Supabase/API/DB/network.
- Khong tao file trong `supabase/migrations/`.

### Task tiep theo de xuat

Phase 77 - Backup Permission Migration Candidate Handoff.

## 2026-06-18 - Phase 75 Backup Permission Seed Candidate Smoke completed

### Trang thai hien tai

Production van chay tren main worker hien co. Phase 75 da them smoke local cho SQL candidate + seed dry-run. Smoke chi doc source local, khong chay SQL, khong goi Supabase/API/DB/network, khong doc env va khong mutate file.

### File/script moi

- `docs/75_BACKUP_PERMISSION_SEED_CANDIDATE_SMOKE.md`
- `scripts/smoke-backup-permission-seed-candidate.cjs`
- `scripts/check-backup-permission-seed-candidate-smoke.cjs`
- `npm run smoke:backup-permission:seed-candidate`
- `npm run check:backup-permission-seed-candidate-smoke`

### Smoke baseline

- Marker: `BACKUP_PERMISSION_SEED_CANDIDATE_SMOKE_ONLY`
- Inputs: SQL candidate draft and seed dry-run script.
- Checks: 4 permission names consistent, SQL candidate marker present, no-production marker present.
- Output: safe JSON with `db_call: false`, `network_call: false`, `file_mutation: false`.

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong chay SQL.
- Khong chay migration that.
- Khong mutate DB.
- Khong goi Supabase/API/DB/network.
- Khong tao file trong `supabase/migrations/`.

### Task tiep theo de xuat

Phase 76 - Backup Permission Real Migration Approval Checklist.

## 2026-06-18 - Phase 74 Backup Permission SQL Static Safety Check completed

### Trang thai hien tai

Production van chay tren main worker hien co. Phase 74 da them static safety checker cho SQL candidate draft. Checker chi doc source local, khong chay SQL, khong goi Supabase/API/DB/network va khong mutate DB.

### File/script moi

- `docs/74_BACKUP_PERMISSION_SQL_STATIC_SAFETY_CHECK.md`
- `scripts/check-backup-permission-sql-static-safety.cjs`
- `npm run check:backup-permission-sql-static-safety`

### Safety baseline

- Scan: `scripts/backup-permission-sql-candidate.sql.draft`
- Required markers: `BACKUP_PERMISSION_SQL_CANDIDATE_ONLY`, `DO_NOT_RUN_ON_PRODUCTION_WITHOUT_OWNER_APPROVAL`
- Required permissions: `backup.operator.view`, `backup.operator.dry_run`, `backup.operator.execute`, `backup.operator.restore`
- Required idempotency concept: `on conflict`, `where not exists`, or explicit idempotency review comment.
- Forbidden: destructive SQL, network URL, `service_role`, `anon key`, `jwt secret`, `security definer`.

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong chay SQL.
- Khong chay migration that.
- Khong mutate DB.
- Khong goi Supabase/API/DB/network.
- Khong tao file trong `supabase/migrations/`.

### Task tiep theo de xuat

Phase 75 - Backup Permission Seed Candidate Smoke.

## 2026-06-18 - Phase 73 Backup Permission SQL Candidate Draft completed

### Trang thai hien tai

Production van chay tren main worker hien co. Phase 73 da tao SQL candidate draft local cho `backup.operator.*`, nhung chua tao migration that, chua dat file vao `supabase/migrations/`, chua chay SQL va chua mutate DB.

### File/script moi

- `docs/73_BACKUP_PERMISSION_SQL_CANDIDATE_DRAFT.md`
- `scripts/backup-permission-sql-candidate.sql.draft`
- `scripts/check-backup-permission-sql-candidate-draft.cjs`
- `npm run check:backup-permission-sql-candidate-draft`

### Candidate baseline

- Marker: `BACKUP_PERMISSION_SQL_CANDIDATE_ONLY`
- No-production marker: `DO_NOT_RUN_ON_PRODUCTION_WITHOUT_OWNER_APPROVAL`
- SQL draft path: `scripts/backup-permission-sql-candidate.sql.draft`
- Permission rows: `backup.operator.view`, `backup.operator.dry_run`, `backup.operator.execute`, `backup.operator.restore`
- Candidate mapping: `OWNER` all four, `ADMIN` view/dry_run.

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong chay migration that.
- Khong mutate DB.
- Khong goi Supabase/API/DB/network.
- Khong tao file trong `supabase/migrations/`.
- Khong bat execute/restore runtime.

### Task tiep theo de xuat

Phase 74 - Backup Permission SQL Static Safety Check.

## 2026-06-18 - Phase 72 Backup Permission Seed Readiness Handoff completed

### Trang thai hien tai

Production van chay tren main worker hien co. Phase 68-72 da hoan tat readiness bundle cho backup permission seed: migration/seed design, dry-run seed checker, assignment runbook, activation guardrails va handoff. Chua co migration/schema, chua mutate DB, chua deploy, chua worker real call va chua bat execute/restore.

### File/script moi

- `docs/72_BACKUP_PERMISSION_SEED_READINESS_HANDOFF.md`
- `scripts/check-backup-permission-seed-readiness-handoff.cjs`
- `npm run check:backup-permission-seed-readiness-handoff`

### Seed readiness baseline

- Future permission rows: `backup.operator.view`, `backup.operator.dry_run`, `backup.operator.execute`, `backup.operator.restore`.
- Seed dry-run: local simulation only, no DB/Supabase/env/network.
- Assignment runbook: documented only, owner approval required.
- Activation guardrail: source-static, blocks runtime execute/restore and real backup/storage/worker drift.
- Runtime fallback `permissions.manage` remains until approved migration/seed.

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong chay migration that.
- Khong mutate DB.
- Khong goi backup service worker that.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.

### Task tiep theo de xuat

- Phase 73 - Backup Permission Real Migration/Seed Implementation, chi khi owner approve migration/schema/seed.
- Hoac Phase 73 - Backup Service Worker Manual Deploy Execution, chi khi owner explicitly approve deploy that va secrets da san sang.
- Hoac Phase 73 - Vietnamese Genealogy Domain Model Readiness.

## 2026-06-18 - Phase 71 Backup Permission Activation Guardrails completed

### Trang thai hien tai

Production van chay tren main worker hien co. Phase 71 da them guardrail source-static de xac nhan runtime dry-run chua bat `backup.operator.execute` hoac `backup.operator.restore`, chua goi worker that, chua tao backup/storage/restore va chua doc env secret.

### File/script moi

- `docs/71_BACKUP_PERMISSION_ACTIVATION_GUARDRAILS.md`
- `scripts/check-backup-permission-activation-guardrails.cjs`
- `npm run check:backup-permission-activation-guardrails`

### Guardrail baseline

- Runtime UI may use `backup.operator.view`.
- Runtime API may use `backup.operator.dry_run`.
- Runtime fallback `permissions.manage` van giu cho den khi co migration/seed that.
- `backup.operator.execute` va `backup.operator.restore` chi la future permissions, chua bat runtime.
- Checker scan runtime backup route/page/component/service va seed dry-run script.

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong chay migration that.
- Khong mutate DB.
- Khong goi backup service worker that.
- Khong tao/upload backup production that.
- Khong restore production.

### Task tiep theo de xuat

Phase 72 - Backup Permission Seed Readiness Handoff.

## 2026-06-18 - Phase 70 Backup Permission Assignment Runbook completed

### Trang thai hien tai

Production van chay tren main worker hien co. Phase 70 da them runbook assignment cho backup permissions. Runbook chi la huong dan, khong assign that, khong chay SQL, khong migration va khong mutate DB.

### File/script moi

- `docs/70_BACKUP_PERMISSION_ASSIGNMENT_RUNBOOK.md`
- `scripts/check-backup-permission-assignment-runbook.cjs`
- `npm run check:backup-permission-assignment-runbook`

### Assignment baseline

- `OWNER`: view, dry_run, execute, restore.
- `ADMIN`: view, dry_run.
- Other roles: none by default unless owner approves.
- Execute/restore require owner approval before any real activation.

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong chay migration that.
- Khong mutate DB.
- Khong goi backup service worker that.
- Khong tao/upload backup production that.
- Khong restore production.

### Task tiep theo de xuat

Phase 71 - Backup Permission Activation Guardrails.

## 2026-06-18 - Phase 69 Backup Permission Seed Dry-Run Checker completed

### Trang thai hien tai

Production van chay tren main worker hien co. Phase 69 da them dry-run seed checker cho `backup.operator.*`. Script chi mo phong `would_insert` va `would_assign`, khong goi Supabase, khong doc env, khong ghi migration va khong mutate DB.

### File/script moi

- `docs/69_BACKUP_PERMISSION_SEED_DRY_RUN_CHECKER.md`
- `scripts/backup-permission-seed-dry-run.cjs`
- `scripts/check-backup-permission-seed-dry-run.cjs`
- `npm run backup:permission:seed:dry-run`
- `npm run check:backup-permission-seed-dry-run`

### Dry-run baseline

- Marker: `BACKUP_PERMISSION_SEED_DRY_RUN_ONLY`
- Output: JSON safe summary
- Fields: `dry_run: true`, `would_insert`, `would_assign`
- No DB/env/network/Supabase/migration write

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong chay migration that.
- Khong mutate DB.
- Khong goi backup service worker that.
- Khong tao/upload backup production that.
- Khong restore production.

### Task tiep theo de xuat

Phase 70 - Backup Permission Assignment Runbook.

## 2026-06-18 - Phase 68 Backup Permission Migration/Seed Design completed

### Trang thai hien tai

Production van chay tren main worker hien co. Phase 68 da thiet ke strategy future migration/seed cho `backup.operator.*`, nhung chua tao migration that, chua chay migration va chua mutate DB.

### File/script moi

- `docs/68_BACKUP_PERMISSION_MIGRATION_SEED_DESIGN.md`
- `scripts/check-backup-permission-migration-seed-design.cjs`
- `npm run check:backup-permission-migration-seed-design`

### Seed design baseline

- Future permission rows: `backup.operator.view`, `backup.operator.dry_run`, `backup.operator.execute`, `backup.operator.restore`.
- Repo roles hien co: `OWNER`, `ADMIN`, `EDITOR`, `CONTRIBUTOR`, `FAMILY_VIEWER`, `PUBLIC_VIEWER`.
- Recommendation: `OWNER` gets all four, `ADMIN` gets view/dry_run only, other roles none by default.
- Recommended future migration: new idempotent `0007`, not editing old migrations.

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong chay migration that.
- Khong mutate DB.
- Khong goi backup service worker that.
- Khong tao/upload backup production that.
- Khong restore production.

### Task tiep theo de xuat

Phase 69 - Backup Permission Seed Dry-Run Checker.

## 2026-06-18 - Phase 67 Backup Operator Permission Handoff completed

### Trang thai hien tai

Production van chay tren main worker hien co. Phase 63-67 da hoan tat backup operator permission hardening bundle: permission model review, API guard, UI guard, permission smoke/guardrails va handoff. Tat ca van dry-run-only.

### File/script moi

- `docs/67_BACKUP_OPERATOR_PERMISSION_HANDOFF.md`
- `scripts/check-backup-operator-permission-handoff.cjs`
- `npm run check:backup-operator-permission-handoff`

### Permission hardening baseline

- UI permission target: `backup.operator.view`
- API permission target: `backup.operator.dry_run`
- Future backup permission: `backup.operator.execute`
- Future restore permission: `backup.operator.restore`
- Current fallback until migration/seed: `permissions.manage`

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi backup service worker that.
- Khong hardcode URL/token/key.
- Khong tao migration/schema/seed.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong tao cron/schedule.

### Task tiep theo de xuat

- Phase 68 - Backup Permission Migration/Seed Design.
- Hoac Phase 68 - Backup Service Worker Manual Deploy Execution neu co explicit owner approval va secret readiness.
- Hoac Phase 68 - Vietnamese Genealogy Domain Model Readiness.

## 2026-06-18 - Phase 66 Backup Operator Permission Smoke & Guardrails completed

### Trang thai hien tai

Production van chay tren main worker hien co. Phase 66 da them smoke va guardrail source-static cho backup operator permission guard. Check xac nhan API/UI permission markers, permission names, dry-run markers va adapter dry-run boundary.

### File/script moi

- `docs/66_BACKUP_OPERATOR_PERMISSION_SMOKE_GUARDRAILS.md`
- `scripts/smoke-backup-operator-permission-guard.cjs`
- `scripts/check-backup-operator-permission-guardrails.cjs`
- `npm run smoke:backup-operator:permission-guard`
- `npm run check:backup-operator-permission-guardrails`

### Guardrail baseline

- Scan `app/api/admin/backups`
- Scan `app/(admin)/admin/backups`
- Scan `components/admin/backup-operator-dry-run-panel.tsx`
- Scan `server/services/backup-service-client.ts`
- Khoa worker URL, secret, production backup, storage upload, restore, cron va env file read.

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi backup service worker that.
- Khong hardcode URL/token/key.
- Khong tao migration/schema/seed.
- Khong tao/upload backup production that.
- Khong restore production.

### Task tiep theo de xuat

Phase 67 - Backup Operator Permission Handoff.

## 2026-06-18 - Phase 65 Backup Operator UI Permission Guard completed

### Trang thai hien tai

Production van chay tren main worker hien co. Phase 65 da guard `/admin/backups` server-side bang `backup.operator.view` hoac fallback documented `permissions.manage`. Panel operator van dry-run-only va chi goi route noi bo `/api/admin/backups/service-dry-run`.

### File/script moi

- `docs/65_BACKUP_OPERATOR_UI_PERMISSION_GUARD.md`
- `scripts/check-backup-operator-ui-permission-guard.cjs`
- `npm run check:backup-operator-ui-permission-guard`

### Runtime source cap nhat

- `app/(admin)/admin/backups/page.tsx`
- `components/admin/backup-operator-dry-run-panel.tsx`
- Marker moi: `BACKUP_OPERATOR_UI_PERMISSION_GUARD`

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi backup service worker that.
- Khong hardcode URL/token/key.
- Khong tao migration/schema/seed.
- Khong tao/upload backup production that.
- Khong restore production.

### Task tiep theo de xuat

Phase 66 - Backup Operator Permission Smoke & Guardrails.

## 2026-06-18 - Phase 64 Backup Operator API Permission Guard completed

### Trang thai hien tai

Production van chay tren main worker hien co. Phase 64 da guard `/api/admin/backups/service-dry-run` bang permission context server-side. Route yeu cau `backup.operator.dry_run` hoac fallback documented `permissions.manage`, tra JSON 401/403 khi fail va van dry-run-only.

### File/script moi

- `docs/64_BACKUP_OPERATOR_API_PERMISSION_GUARD.md`
- `scripts/check-backup-operator-api-permission-guard.cjs`
- `npm run check:backup-operator-api-permission-guard`

### Runtime source cap nhat

- `app/api/admin/backups/service-dry-run/route.ts`
- Marker moi: `BACKUP_OPERATOR_API_PERMISSION_GUARD`
- Marker cu van giu: `BACKUP_OPERATOR_API_DRY_RUN_ONLY`

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi backup service worker that.
- Khong hardcode URL/token/key.
- Khong tao migration/schema/seed.
- Khong tao/upload backup production that.
- Khong restore production.

### Task tiep theo de xuat

Phase 65 - Backup Operator UI Permission Guard.

## 2026-06-18 - Phase 63 Backup Operator Permission Model Review completed

### Trang thai hien tai

Production van chay tren main worker hien co. Phase 63 da review permission model cho backup operator va de xuat `backup.operator.*` lam boundary tuong lai, nhung chua migration/schema/seed va chua cap quyen DB that.

### File/script moi

- `docs/63_BACKUP_OPERATOR_PERMISSION_MODEL_REVIEW.md`
- `scripts/check-backup-operator-permission-model-review.cjs`
- `npm run check:backup-operator-permission-model-review`

### Permission model de xuat

- `backup.operator.view` cho UI dry-run.
- `backup.operator.dry_run` cho API dry-run.
- `backup.operator.execute` cho backup that trong phase sau.
- `backup.operator.restore` cho restore that trong phase sau.

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi backup service worker that.
- Khong goi network/API/DB.
- Khong tao migration/schema/seed.
- Khong hardcode URL/token/key.
- Khong tao/upload backup production that.
- Khong restore production.

### Task tiep theo de xuat

Phase 64 - Backup Operator API Permission Guard.

## 2026-06-18 - Phase 62 Backup Operator Dry-Run Handoff completed

### Trang thai hien tai

Production van chay tren main worker hien co. Phase 58-62 da hoan tat operator API/UI dry-run bundle. Co route API dry-run, UI panel, guardrails, smoke va handoff. Tat ca van dry-run-only: chua deploy worker, chua goi worker that, chua tao production backup, chua upload storage va chua restore.

### File/script moi

- `docs/62_BACKUP_OPERATOR_DRY_RUN_HANDOFF.md`
- `scripts/check-backup-operator-dry-run-handoff.cjs`
- `npm run check:backup-operator-dry-run-handoff`

### Operator bundle baseline

- API route: `app/api/admin/backups/service-dry-run/route.ts`
- UI page: `app/(admin)/admin/backups/page.tsx`
- UI component: `components/admin/backup-operator-dry-run-panel.tsx`
- Guardrail: `scripts/check-backup-operator-ui-guardrails.cjs`
- Smoke: `scripts/smoke-backup-operator-dry-run.cjs`
- Status: dry-run only

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi backup service worker that.
- Khong goi network/API/DB.
- Khong hardcode URL/token/key.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong tao cron/schedule.

### Task tiep theo de xuat

- Phase 63 - Backup Operator Permission Hardening.
- Hoac Phase 63 - Backup Service Worker Manual Deploy Execution neu co owner approval va secret readiness that.
- Hoac Phase 63 - Vietnamese Genealogy Domain Model Readiness.

## 2026-06-18 - Phase 61 Backup Operator Local Smoke completed

### Trang thai hien tai

Production van chay tren main worker hien co. Phase 61 da them smoke local/static cho operator API/UI dry-run. Smoke chi doc source files, khong can server dang chay, khong doc env va khong goi network/API/DB.

### File/script moi

- `docs/61_BACKUP_OPERATOR_LOCAL_SMOKE.md`
- `scripts/smoke-backup-operator-dry-run.cjs`
- `scripts/check-backup-operator-local-smoke.cjs`
- `npm run smoke:backup-operator:dry-run`
- `npm run check:backup-operator-local-smoke`

### Smoke baseline

- Marker: `BACKUP_OPERATOR_DRY_RUN_SMOKE_ONLY`
- API route: `app/api/admin/backups/service-dry-run/route.ts`
- UI page: `app/(admin)/admin/backups/page.tsx`
- UI component: `components/admin/backup-operator-dry-run-panel.tsx`
- Guardrail: `scripts/check-backup-operator-ui-guardrails.cjs`
- Network execution: skipped

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi backup service worker that.
- Khong goi network/API/DB.
- Khong hardcode URL/token/key.
- Khong tao/upload backup production that.
- Khong restore production.

### Task tiep theo de xuat

Phase 62 - Backup Operator Dry-Run Handoff.

## 2026-06-18 - Phase 60 Backup Operator UI Guardrails completed

### Trang thai hien tai

Production van chay tren main worker hien co. Phase 60 da them guardrail static cho operator UI/API dry-run. Checker scan cac path runtime lien quan va chan worker URL, hardcoded token/key, direct wrangler, direct Cloudflare/Supabase/Google API, production backup, storage upload, restore va cron/schedule.

### File/script moi

- `docs/60_BACKUP_OPERATOR_UI_GUARDRAILS.md`
- `scripts/check-backup-operator-ui-guardrails.cjs`
- `npm run check:backup-operator-ui-guardrails`

### Guardrail baseline

- Scan `app/(admin)/admin/backups`
- Scan `components/admin`
- Scan `app/api/admin/backups`
- Scan `server/services/backup-service-client.ts`
- Cho phep dry-run marker, placeholder names va local route dry-run.

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi backup service worker that.
- Khong hardcode URL/token/key.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong tao cron/schedule.

### Task tiep theo de xuat

Phase 61 - Backup Operator Local Smoke.

## 2026-06-18 - Phase 59 Backup Operator UI Dry-Run Panel completed

### Trang thai hien tai

Production van chay tren main worker hien co. Phase 59 da tao trang `/admin/backups` va component operator dry-run panel. UI chi goi route noi bo `/api/admin/backups/service-dry-run`, khong hardcode worker URL/token va khong tao backup/storage/restore that.

### File/script moi

- `app/(admin)/admin/backups/page.tsx`
- `components/admin/backup-operator-dry-run-panel.tsx`
- `docs/59_BACKUP_OPERATOR_UI_DRY_RUN_PANEL.md`
- `scripts/check-backup-operator-ui-dry-run-panel.cjs`
- `npm run check:backup-operator-ui-dry-run-panel`

### UI baseline

- Route/page: `/admin/backups`
- Component: `BackupOperatorDryRunPanel`
- Button: `Run dry-run check`
- API called: `/api/admin/backups/service-dry-run`
- Warnings: Dry-run only, no production backup, no storage upload, no restore, no real worker call.

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi backup service worker that.
- Khong hardcode URL/token/key.
- Khong tao/upload backup production that.
- Khong restore production.

### Task tiep theo de xuat

Phase 60 - Backup Operator UI Guardrails.

## 2026-06-18 - Phase 58 Backup Operator API Dry-Run Route completed

### Trang thai hien tai

Production van chay tren main worker hien co. Phase 58 da tao route dry-run noi bo `/api/admin/backups/service-dry-run`. Route chi tra envelope dry-run, khong goi backup service worker that, khong goi DB/network va khong tao production backup.

### File/script moi

- `app/api/admin/backups/service-dry-run/route.ts`
- `docs/58_BACKUP_OPERATOR_API_DRY_RUN_ROUTE.md`
- `scripts/check-backup-operator-api-dry-run-route.cjs`
- `npm run check:backup-operator-api-dry-run-route`

### API route baseline

- Marker: `BACKUP_OPERATOR_API_DRY_RUN_ONLY`
- Mode: `dry_run`
- Worker call: false
- Production backup: false
- Storage upload: false
- Restore: false
- Permission boundary: pending hardening phase

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi backup service worker that.
- Khong goi network/API/DB.
- Khong hardcode URL/token/key.
- Khong tao/upload backup production that.
- Khong restore production.

### Task tiep theo de xuat

Phase 59 - Backup Operator UI Dry-Run Panel.

## 2026-06-18 - Phase 57 Main App Binding Dry-Run Handoff completed

### Trang thai hien tai

Production van chay tren main worker hien co. Phase 57 da tong hop handoff Phase 53-57 cho main app backup service binding dry-run. Integration van dry-run-only: chua deploy backup service worker, chua tao route runtime, chua goi worker/network/API/DB va chua tao production backup.

### File/script moi

- `docs/57_MAIN_APP_BINDING_DRY_RUN_HANDOFF.md`
- `scripts/check-main-app-binding-dry-run-handoff.cjs`
- `npm run check:main-app-binding-dry-run-handoff`

### Phase 53-57 baseline

- Adapter: `server/services/backup-service-client.ts`
- Adapter marker: `MAIN_APP_BACKUP_SERVICE_CLIENT_DRY_RUN_ONLY`
- Guardrail: `npm run check:backup-service-binding-guardrails`
- Operator contract: `npm run check:backup-operator-api-dry-run-contract`
- Binding smoke: `npm run smoke:main-app-backup-service-binding`
- Binding smoke checker: `npm run check:main-app-backup-service-binding-smoke`

### Boundary giu nguyen

- Khong deploy/push.
- Khong tao route runtime.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi backup service worker that.
- Khong goi network/API/DB.
- Khong hardcode URL/token/key.
- Khong tao/upload backup production that.
- Khong restore production.

### Task tiep theo de xuat

- Phase 58 - Backup Operator UI Dry-Run Panel.
- Hoac Backup Service Worker Manual Deploy Execution neu co owner approval va secret readiness that.
- Hoac Vietnamese Genealogy Domain Model Readiness.

## 2026-06-18 - Phase 56 Main App Backup Service Binding Smoke completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 56 da co smoke static/local cho main app backup service binding dry-run. Smoke chi doc source files trong repo, khong doc env, khong goi network/API/DB va khong goi backup service worker that.

### File/script moi

- `docs/56_MAIN_APP_BACKUP_SERVICE_BINDING_SMOKE.md`
- `scripts/smoke-main-app-backup-service-binding.cjs`
- `scripts/check-main-app-backup-service-binding-smoke.cjs`
- `npm run smoke:main-app-backup-service-binding`
- `npm run check:main-app-backup-service-binding-smoke`

### Binding smoke baseline

- Marker: `MAIN_APP_BACKUP_SERVICE_BINDING_SMOKE_ONLY`
- Adapter contract: `server/services/backup-service-client.ts`
- Guardrail checker: `scripts/check-backup-service-binding-guardrails.cjs`
- Operator API checker: `scripts/check-backup-operator-api-dry-run-contract.cjs`
- Network execution: skipped

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi backup service worker that.
- Khong goi network/API/DB.
- Khong hardcode URL/token/key.
- Khong tao/upload backup production that.
- Khong restore production.

### Task tiep theo de xuat

Phase 57 - Main App Binding Dry-Run Handoff.

## 2026-06-17 - Phase 55 Backup Operator API Dry-Run Contract completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 55 da tao backup operator API dry-run contract docs/check. Khong tao route runtime vi repo chua co pattern `app/api/admin` auth/permission route ro rang.

### File/script moi

- `docs/55_BACKUP_OPERATOR_API_DRY_RUN_CONTRACT.md`
- `scripts/check-backup-operator-api-dry-run-contract.cjs`
- `npm run check:backup-operator-api-dry-run-contract`

### Operator API baseline

- Proposed route: `app/api/admin/backups/service-dry-run/route.ts`
- Implementation status: docs/check-only
- Required future marker: `BACKUP_OPERATOR_API_DRY_RUN_ONLY`
- Real worker call: not implemented
- Real backup/storage/restore: not implemented

### Boundary giu nguyen

- Khong deploy/push.
- Khong tao route runtime trong Phase 55.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi backup service worker that.
- Khong goi network/API/DB.
- Khong tao/upload backup production that.
- Khong restore production.

### Task tiep theo de xuat

Phase 56 - Main App Backup Service Binding Smoke.

## 2026-06-17 - Phase 54 Backup Service Binding Guardrail Checks completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 54 da them static guardrail checks cho main app backup service binding. Guardrail khong goi network, khong goi worker that, khong doc secret va khong scan docs/workflow placeholders.

### File/script moi

- `docs/54_BACKUP_SERVICE_BINDING_GUARDRAIL_CHECKS.md`
- `scripts/check-backup-service-binding-guardrails.cjs`
- `npm run check:backup-service-binding-guardrails`

### Guardrail baseline

- Scan paths: `server/`, `app/`, `components/`, `lib/`, `services/`
- Skip missing paths safely.
- Block hardcoded token, backup workers.dev URL, env-file reads, real backup/storage/restore triggers.
- Allow placeholder-only dry-run adapter markers.

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi backup service worker that.
- Khong goi network/API/DB.
- Khong hardcode URL/token/key.
- Khong tao/upload backup production that.
- Khong restore production.

### Task tiep theo de xuat

Phase 55 - Backup Operator API Dry-Run Contract.

## 2026-06-17 - Phase 53 Main App Backup Service Client Dry-Run Adapter completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 53 da tao main app backup service client dry-run adapter tai `server/services/backup-service-client.ts`. Adapter chi tra local envelope, khong goi worker that, khong goi network/API/DB va khong doc secret.

### File/script moi

- `server/services/backup-service-client.ts`
- `docs/53_MAIN_APP_BACKUP_SERVICE_CLIENT_DRY_RUN_ADAPTER.md`
- `scripts/check-main-app-backup-service-client-dry-run-adapter.cjs`
- `npm run check:main-app-backup-service-client-dry-run-adapter`

### Adapter baseline

- Marker: `MAIN_APP_BACKUP_SERVICE_CLIENT_DRY_RUN_ONLY`
- Actions: `health`, `dryRun`, `fixtureVerify`
- Response envelope: local dry-run envelope
- Future network path: disabled by `backup_service_network_disabled`
- Real worker call: not implemented

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi backup service worker that.
- Khong goi network/API/DB.
- Khong hardcode URL/token/key.
- Khong tao/upload backup production that.
- Khong restore production.

### Task tiep theo de xuat

Phase 54 - Backup Service Binding Guardrail Checks.

## 2026-06-17 - Phase 52 Backup Service Worker Pre-Deploy Handoff completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 52 da tong hop pre-deploy handoff cho backup service worker sau Phase 48-52. Worker van chua deploy, chua co owner approval that, chua co secret that, chua co real storage, chua co main app integration va chua tao/upload backup production that.

### File/script moi

- `docs/52_BACKUP_SERVICE_WORKER_PRE_DEPLOY_HANDOFF.md`
- `scripts/check-backup-service-worker-pre-deploy-handoff.cjs`
- `npm run check:backup-service-worker-pre-deploy-handoff`

### Pre-deploy baseline

- Workflow readiness: prepared
- Manual deploy runbook: prepared
- Secrets preflight: prepared
- Approval gate: prepared
- Required owner approval: still required
- Real deploy: not done
- Post-deploy smoke default: safe skip without explicit URL

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong doc/tao secret that.
- Khong goi GitHub/Cloudflare/Supabase/Google API.
- Khong goi production API/DB/network.
- Khong tao bucket/folder/storage that.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong cron/schedule.

### Task tiep theo de xuat

Phase 53 options:

- Backup Service Worker Manual Deploy Execution, chi khi owner explicitly approve deploy that va secrets da san sang.
- Main App Backup Service Binding Dry-Run Implementation, neu chua muon deploy worker nhung muon chuan bi binding/caller.
- Vietnamese Genealogy Domain Model Readiness, neu muon tam dung ha tang va review nghiep vu gia pha Viet.

## 2026-06-17 - Phase 51 Backup Service Worker Deploy Approval Gate completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 51 da tao deploy approval gate cho backup service worker. Gate ghi ro `OWNER_APPROVAL_REQUIRED_BEFORE_REAL_DEPLOY=true`, nhung owner approval that chua duoc cap trong repo va chua deploy.

### File/script moi

- `docs/51_BACKUP_SERVICE_WORKER_DEPLOY_APPROVAL_GATE.md`
- `scripts/check-backup-service-worker-deploy-approval-gate.cjs`
- `npm run check:backup-service-worker-deploy-approval-gate`

### Approval baseline

- Required owner approval: documented
- Required validation: documented
- Required secrets: documented as placeholders
- Rollback owner: required
- Smoke owner: required
- Deployment window: required
- Real approval: not recorded in repo

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong doc/tao secret that.
- Khong goi API.
- Khong tao/upload backup production that.
- Khong restore production.

### Task tiep theo de xuat

Phase 52 - Backup Service Worker Pre-Deploy Handoff.

## 2026-06-17 - Phase 50 Backup Service Worker Secrets Preflight Checklist completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 50 da tao secrets preflight checklist cho backup service worker. Chua doc/tao secret that, chua goi GitHub/Cloudflare API, chua deploy va chua tao production backup.

### File/script moi

- `docs/50_BACKUP_SERVICE_WORKER_SECRETS_PREFLIGHT_CHECKLIST.md`
- `scripts/check-backup-service-worker-secrets-preflight-checklist.cjs`
- `npm run check:backup-service-worker-secrets-preflight-checklist`

### Secrets preflight baseline

- Required GitHub placeholders: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
- Required runtime placeholder: `BACKUP_SERVICE_INTERNAL_TOKEN`
- Required smoke placeholders: `BACKUP_SERVICE_SMOKE_BASE_URL`, `BACKUP_SERVICE_SMOKE_TOKEN`
- No-go conditions: documented
- Real secret values: not present

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong doc/tao secret that.
- Khong goi GitHub/Cloudflare API.
- Khong goi production API/DB/network.
- Khong tao/upload backup production that.
- Khong restore production.

### Task tiep theo de xuat

Phase 51 - Backup Service Worker Deploy Approval Gate.

## 2026-06-17 - Phase 49 Backup Service Worker Manual Deploy Runbook completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 49 da tao manual deploy runbook cho backup service worker. Chua chay `wrangler secret put`, chua chay `wrangler deploy`, chua deploy worker va chua tao production backup.

### File/script moi

- `docs/49_BACKUP_SERVICE_WORKER_MANUAL_DEPLOY_RUNBOOK.md`
- `scripts/check-backup-service-worker-manual-deploy-runbook.cjs`
- `npm run check:backup-service-worker-manual-deploy-runbook`

### Manual deploy baseline

- Required future secret: `BACKUP_SERVICE_INTERNAL_TOKEN`
- Future commands: documented only
- Post-deploy smoke: documented
- Rollback procedure: documented
- Real execution: not run

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong chay `wrangler secret put`.
- Khong chay `wrangler deploy`.
- Khong goi Cloudflare/Supabase/Google API.
- Khong tao/upload backup production that.
- Khong restore production.

### Task tiep theo de xuat

Phase 50 - Backup Service Worker Secrets Preflight Checklist.

## 2026-06-17 - Phase 48 Backup Service Worker GitHub Actions Deploy Workflow Readiness completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 48 da tao GitHub Actions workflow readiness cho backup service worker deploy. Workflow moi la manual-only qua `workflow_dispatch`; chua chay workflow, chua push, chua deploy va chua them schedule.

### File/script moi

- `.github/workflows/backup-service-deploy.yml`
- `docs/48_BACKUP_SERVICE_WORKER_GITHUB_ACTIONS_DEPLOY_WORKFLOW_READINESS.md`
- `scripts/check-backup-service-worker-github-actions-deploy-readiness.cjs`
- `npm run check:backup-service-worker-github-actions-deploy-readiness`

### Workflow baseline

- Name: `Backup Service Deploy`
- Trigger: `workflow_dispatch` only
- Forbidden triggers: no `push`, no `pull_request`, no `schedule`
- Secrets references: `secrets.CLOUDFLARE_API_TOKEN`, `secrets.CLOUDFLARE_ACCOUNT_ID`
- Deploy scope: `services/backup-service`
- Local deploy in phase: not run

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB tu local workspace.
- Khong goi Cloudflare/Supabase/Google API tu local workspace.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.

### Task tiep theo de xuat

Phase 49 - Backup Service Worker Manual Deploy Runbook.

## 2026-06-17 - Phase 47 Backup Service Worker Deploy Readiness Handoff completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 47 da tong hop deploy readiness cho backup service worker sau Phase 43-47. Worker van chua deploy, chua co production route, chua co real storage, chua co secret that, chua co main app integration va chua tao/upload backup production that.

### File/script moi

- `docs/47_BACKUP_SERVICE_WORKER_DEPLOY_READINESS_HANDOFF.md`
- `scripts/check-backup-service-worker-deploy-readiness-handoff.cjs`
- `npm run check:backup-service-worker-deploy-readiness-handoff`

### Deploy readiness baseline

- Service path: `services/backup-service`
- Endpoints: `/health`, `/internal/backup/dry-run`, `/internal/backup/fixture-verify`
- Internal token placeholder: `BACKUP_SERVICE_INTERNAL_TOKEN`
- Smoke placeholders: `BACKUP_SERVICE_SMOKE_BASE_URL`, `BACKUP_SERVICE_SMOKE_TOKEN`
- Deploy readiness checks: available
- Post-deploy smoke script: safe-skip by default
- Main app binding: contract-only

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB khi thieu explicit smoke URL.
- Khong goi Cloudflare/Supabase/Google API.
- Khong tao bucket/folder/storage that.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong cron/schedule.
- Khong hardcode secret/token/key.

### Task tiep theo de xuat

Phase 48 options:

- Backup Service Worker Manual Deploy Execution, chi neu owner cho phep deploy that va secret da san sang.
- Backup Service Worker GitHub Actions Deploy Workflow Readiness, neu muon chuan bi workflow nhung chua deploy.
- Main App Backup Service Binding Implementation, neu muon noi main app voi worker theo dry-run/internal.

## 2026-06-17 - Phase 46 Backup Service Worker Main App Binding Contract completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 46 da tao main app binding contract cho backup service worker. Main app runtime chua duoc sua, chua them Cloudflare service binding, chua them internal URL/token that, chua goi service va chua deploy.

### File/script moi

- `docs/46_BACKUP_SERVICE_WORKER_MAIN_APP_BINDING_CONTRACT.md`
- `scripts/check-backup-service-worker-main-app-binding-contract.cjs`
- `npm run check:backup-service-worker-main-app-binding-contract`

### Binding contract baseline

- Option A: Cloudflare service binding
- Option B: internal URL + Bearer token
- Auth header: `Authorization: Bearer BACKUP_SERVICE_INTERNAL_TOKEN`
- Request/response envelope: documented
- Permission boundary: documented as future approval item
- Runtime integration: not implemented

### Boundary giu nguyen

- Khong deploy/push.
- Khong sua main app runtime.
- Khong them binding/secret that.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB khi thieu explicit smoke URL.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.

### Task tiep theo de xuat

Phase 47 - Backup Service Worker Deploy Readiness Handoff.

## 2026-06-17 - Phase 45 Backup Service Worker Post-Deploy Smoke Plan completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 45 da them post-deploy smoke plan va smoke script safe-skip cho backup service worker. Mac dinh smoke khong goi network vi `BACKUP_SERVICE_SMOKE_BASE_URL` chua duoc set explicit.

### File/script moi

- `docs/45_BACKUP_SERVICE_WORKER_POST_DEPLOY_SMOKE_PLAN.md`
- `scripts/check-backup-service-worker-post-deploy-smoke-plan.cjs`
- `scripts/smoke-backup-service-worker-post-deploy.cjs`
- `npm run check:backup-service-worker-post-deploy-smoke-plan`
- `npm run smoke:backup-service-worker:post-deploy`

### Smoke baseline

- Marker: `POST_DEPLOY_SMOKE_ONLY`
- Required explicit URL env: `BACKUP_SERVICE_SMOKE_BASE_URL`
- Optional internal endpoint token env: `BACKUP_SERVICE_SMOKE_TOKEN`
- Default result without URL env: SKIPPED
- Token logging: forbidden

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB khi thieu explicit smoke URL.
- Khong goi Cloudflare/Supabase/Google API.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.

### Task tiep theo de xuat

Phase 46 - Backup Service Worker Main App Binding Contract.

## 2026-06-17 - Phase 44 Backup Service Worker Env Secret Contract completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 44 da tao env/secret contract runbook cho backup service worker. Repo chi co placeholder names, khong co secret that, khong doc `.env.local`/`.dev.vars`, khong goi Wrangler/API va khong deploy.

### File/script moi

- `docs/44_BACKUP_SERVICE_WORKER_ENV_SECRET_CONTRACT.md`
- `scripts/check-backup-service-worker-env-secret-contract.cjs`
- `npm run check:backup-service-worker-env-secret-contract`

### Env/secret baseline

- Required future secret placeholder: `BACKUP_SERVICE_INTERNAL_TOKEN`
- Optional placeholders: `BACKUP_STORAGE_PROVIDER`, `BACKUP_STORAGE_DRY_RUN`, `BACKUP_STORAGE_PREFIX`, `BACKUP_RETENTION_POLICY`
- Provisioning/rotation: documented only
- Real secret value: not present

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong goi Cloudflare/Supabase/Google API.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.

### Task tiep theo de xuat

Phase 45 - Backup Service Worker Post-Deploy Smoke Plan.

## 2026-06-17 - Phase 43 Backup Service Worker Deploy Readiness Gate completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 43 da tao deploy readiness gate cho backup service worker bang static/local checks. Worker van chua deploy, chua co production route, chua co secret that, chua co real storage va chua tao production backup.

### File/script moi

- `docs/43_BACKUP_SERVICE_WORKER_DEPLOY_READINESS_GATE.md`
- `scripts/check-backup-service-worker-deploy-readiness.cjs`
- `npm run check:backup-service-worker-deploy-readiness`

### Deploy readiness baseline

- Service path: `services/backup-service`
- Wrangler name: `web-gia-pha-backup-service`
- Future deploy command: documented as placeholder only
- Production route: not configured
- Deploy: not run

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong goi Cloudflare/Supabase/Google API.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.

### Task tiep theo de xuat

Phase 44 - Backup Service Worker Env & Secret Contract Runbook.

## 2026-06-17 - Phase 42 Worker Split Backup Readiness Handoff completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 42 da tong hop worker split va backup readiness Phase 37-42 thanh handoff baseline. Backup service worker van chua deploy, chua co production route, chua co real storage, chua co main app integration va chua duoc approval de chay production backup.

### File/script moi

- `docs/42_WORKER_SPLIT_BACKUP_READINESS_HANDOFF.md`
- `scripts/check-worker-split-backup-readiness-handoff.cjs`
- `npm run check:worker-split-backup-readiness-handoff`

### Worker split baseline

- Service path: `services/backup-service`
- Worker endpoints: `GET /health`, `POST /internal/backup/dry-run`, `POST /internal/backup/fixture-verify`
- Auth boundary: `Authorization: Bearer BACKUP_SERVICE_INTERNAL_TOKEN` placeholder only
- Contract checks: available
- Main app integration: not implemented
- Deploy: not run

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong tich hop main app that.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.

### Task tiep theo de xuat

Phase 43 - Backup Service Worker Deploy Readiness Gate.

## 2026-06-17 - Phase 41 Backup Service Worker Integration Readiness completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 41 da tao integration readiness doc/check cho future main app -> backup service worker. Chua them service binding, chua them internal URL/token that, chua goi service tu main app va chua deploy.

### File/script moi

- `docs/41_BACKUP_SERVICE_WORKER_INTEGRATION_READINESS.md`
- `scripts/check-backup-service-worker-integration-readiness.cjs`
- `npm run check:backup-service-worker-integration-readiness`

### Integration baseline

- Option A: Cloudflare service binding
- Option B: internal URL + Bearer token
- Request/response envelope: documented
- Timeout/retry/logging policy: documented
- Real integration: not implemented

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong tich hop main app that.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.

### Task tiep theo de xuat

Phase 42 - Worker Split & Backup Readiness Handoff.

## 2026-06-17 - Phase 40 Backup Service Worker Local Contract Checks completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 40 da them static/local contract checks cho backup service worker scaffold. Khong deploy, khong runtime smoke Cloudflare, khong goi network.

### File/script moi

- `docs/40_BACKUP_SERVICE_WORKER_LOCAL_CONTRACT_CHECKS.md`
- `scripts/check-backup-service-worker-local-contract.cjs`
- `scripts/smoke-backup-service-worker-contract.cjs`
- `npm run check:backup-service-worker-local-contract`
- `npm run smoke:backup-service-worker:contract`

### Contract baseline

- Smoke marker: `BACKUP_SERVICE_CONTRACT_SMOKE_ONLY`
- Worker dry-run marker: `BACKUP_SERVICE_DRY_RUN_ONLY`
- Checks: routes, bearer auth, 401, JSON envelope, no outbound API patterns
- Runtime execution: skipped by design

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.

### Task tiep theo de xuat

Phase 41 - Backup Service Worker Integration Readiness.

## 2026-06-17 - Phase 39 Backup Service Worker Scaffold completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 39 da scaffold backup service worker toi thieu trong `services/backup-service/`. Worker chua deploy, chua co production route, chua co real storage va chua tich hop main app.

### File/script moi

- `services/backup-service/src/index.ts`
- `services/backup-service/wrangler.jsonc`
- `services/backup-service/README.md`
- `docs/39_BACKUP_SERVICE_WORKER_SCAFFOLD.md`
- `scripts/check-backup-service-worker-scaffold.cjs`
- `npm run check:backup-service-worker-scaffold`

### Worker scaffold baseline

- `GET /health`: public non-sensitive
- `POST /internal/backup/dry-run`: bearer auth required
- `POST /internal/backup/fixture-verify`: bearer auth required
- Internal marker: `BACKUP_SERVICE_DRY_RUN_ONLY`
- Auth placeholder: `BACKUP_SERVICE_INTERNAL_TOKEN`
- Deploy: not run

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.

### Task tiep theo de xuat

Phase 40 - Backup Service Worker Local Contract Checks.

## 2026-06-17 - Phase 38 Backup Service Worker Boundary Design completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 38 da thiet ke boundary cho backup service worker nho rieng tai `services/backup-service/`. Chua scaffold code worker va chua deploy.

### File/script moi

- `docs/38_BACKUP_SERVICE_WORKER_BOUNDARY_DESIGN.md`
- `scripts/check-backup-service-worker-boundary-design.cjs`
- `npm run check:backup-service-worker-boundary-design`

### Worker boundary baseline

- Service path: `services/backup-service/`
- Public endpoint: `GET /health`
- Internal endpoints: `POST /internal/backup/dry-run`, `POST /internal/backup/fixture-verify`
- Auth placeholder: `Authorization: Bearer BACKUP_SERVICE_INTERNAL_TOKEN`
- Response shape: JSON envelope
- Production backup/deploy: not implemented

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.

### Task tiep theo de xuat

Phase 39 - Backup Service Worker Scaffold.

## 2026-06-17 - Phase 37 Repository Hygiene GitHub Menu Review completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 37 da xu ly dirty state cua `GIA_PHA_GITHUB_MENU.bat`. Diff khong co content change huu ich, chi co line-ending warning, nen file da duoc restore ve HEAD.

### File/script moi

- `docs/37_REPOSITORY_HYGIENE_GITHUB_MENU_REVIEW.md`
- `scripts/check-repository-hygiene-github-menu-review.cjs`
- `npm run check:repository-hygiene-github-menu-review`

### Repository hygiene decision

- Decision: `REVERT_TO_HEAD`
- File reviewed: `GIA_PHA_GITHUB_MENU.bat`
- Reason: no meaningful content diff, line-ending/touched-file noise only

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.

### Task tiep theo de xuat

Phase 38 - Backup Service Worker Boundary Design.

## 2026-06-17 - Phase 36 Production Backup Approval Checklist completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 36 da tao approval/no-go checklist cho production backup tuong lai. Phase nay van khong tao backup that, khong upload storage that, khong restore production va khong deploy.

### File/script moi

- `docs/36_PRODUCTION_BACKUP_APPROVAL_CHECKLIST.md`
- `scripts/check-production-backup-approval-checklist.cjs`
- `npm run check:production-backup-approval-checklist`

### Approval baseline

- Storage target: chua chot
- Production backup: not enabled
- Restore production: not implemented
- Required approvals: owner, technical operator, privacy reviewer, restore drill reviewer, incident/rollback owner
- No-go list: recorded in Phase 36 doc

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong goi Cloudflare/Supabase/Google API.
- Khong tao bucket/folder/storage that.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong bat cron/schedule.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

### Task tiep theo de xuat

Phase 37 - Sandbox Cloud Storage Prototype neu da chot target sandbox that, hoac Production Backup Manual Execution Runbook neu da co approval.

## 2026-06-17 - Phase 35 Storage Upload Verification Dry-Run completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 35 da tao verify dry-run cho artifact trong local adapter sandbox. Script chi doc `fixtures/backup-sandbox/adapter/`, verify checksum/manifest/marker va khong upload cloud.

### File/script moi

- `docs/35_STORAGE_UPLOAD_VERIFICATION_DRY_RUN.md`
- `scripts/verify-storage-upload-dry-run.cjs`
- `scripts/check-storage-upload-verification-dry-run.cjs`
- `npm run backup:storage:verify-upload:dry-run`
- `npm run check:storage-upload-verification-dry-run`

### Verification baseline

- Marker: `STORAGE_UPLOAD_VERIFY_DRY_RUN_ONLY`
- Source: `fixtures/backup-sandbox/adapter/`
- Manifest checksum: PASS
- Fixture marker: PASS
- Secret scan: PASS
- Cloud upload: SKIPPED

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong upload cloud.
- Khong tao bucket/folder/storage that.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong bat cron/schedule.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

### Task tiep theo de xuat

Phase 36 - Production Backup Approval Checklist.

## 2026-06-17 - Phase 34 Local Sandbox Storage Adapter Prototype completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 34 da tao local sandbox storage adapter prototype dung fixture backup, chi ghi vao `fixtures/backup-sandbox/adapter/` va verify checksum local.

### File/script moi

- `docs/34_LOCAL_SANDBOX_STORAGE_ADAPTER_PROTOTYPE.md`
- `scripts/local-sandbox-storage-adapter.cjs`
- `scripts/check-local-sandbox-storage-adapter-prototype.cjs`
- `fixtures/backup-sandbox/adapter/`
- `npm run backup:storage:adapter:local`
- `npm run check:local-sandbox-storage-adapter-prototype`

### Adapter baseline

- Marker: `LOCAL_STORAGE_ADAPTER_ONLY`
- Adapter root: `fixtures/backup-sandbox/adapter`
- Operations: put/list/read metadata/verify PASS
- Delete: SKIPPED
- Cloud upload: not implemented

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong dung provider SDK.
- Khong tao bucket/folder/storage that.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong bat cron/schedule.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

### Task tiep theo de xuat

Phase 35 - Storage Upload Verification Dry-Run.

## 2026-06-17 - Phase 33 Storage Adapter Contract Guardrails completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 33 da tao contract provider-neutral cho backup storage adapter, van la local/docs/check only va chua co cloud provider implementation.

### File/script moi

- `docs/33_STORAGE_ADAPTER_CONTRACT_GUARDRAILS.md`
- `scripts/backup-storage-adapter-contract.cjs`
- `scripts/check-storage-adapter-contract-guardrails.cjs`
- `npm run backup:storage:contract`
- `npm run check:storage-adapter-contract-guardrails`

### Contract baseline

- Marker: `STORAGE_ADAPTER_CONTRACT_ONLY`
- Methods: `putBackupArtifact`, `getBackupArtifactMetadata`, `listBackupArtifacts`, `verifyBackupArtifact`, `deleteBackupArtifact`
- Provider policy: no cloud provider implementation in Phase 33
- Network/API/env policy: forbidden

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong dung provider SDK.
- Khong tao bucket/folder/storage that.
- Khong tao/upload backup production that.
- Khong delete backup production.
- Khong restore production.
- Khong bat cron/schedule.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

### Task tiep theo de xuat

Phase 34 - Local Sandbox Storage Adapter Prototype.

## 2026-06-17 - Phase 32 Sandbox Storage Target Selection completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 32 da so sanh cac storage candidate cho backup tuong lai va recommend sandbox/prototype tiep tuc dung local sandbox. Production storage target chua duoc chot.

### File/script moi

- `docs/32_SANDBOX_STORAGE_TARGET_SELECTION.md`
- `scripts/check-sandbox-storage-target-selection.cjs`
- `npm run check:sandbox-storage-target-selection`

### Storage recommendation

- Sandbox target: local sandbox trong `fixtures/backup-sandbox/`.
- Production target: chua chot.
- Cloudflare R2: candidate ky thuat tot neu sau nay muon Cloudflare-native, nhung chua cau hinh that.
- Google Drive, Supabase Storage va offline storage: van la candidate can approval rieng.

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong goi Cloudflare/Supabase/Google API.
- Khong tao bucket/folder/storage that.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong bat cron/schedule.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

### Task tiep theo de xuat

Phase 33 - Storage Adapter Contract & Safety Guardrails.

## 2026-06-17 - Phase 31 Backup Readiness Handoff completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 31 da tong hop backup readiness Phase 18-31 vao mot handoff. Bundle hien tai van la docs/local fixture/dry-run/CI readiness only, khong phai production backup approval.

### File/script moi

- `docs/31_BACKUP_READINESS_HANDOFF.md`
- `scripts/check-backup-readiness-handoff.cjs`
- `npm run check:backup-readiness-handoff`

### Backup readiness baseline

- CI gate: `.github/workflows/backup-readiness.yml`
- Local pipeline: `npm run backup:pipeline:readiness`
- Sandbox storage simulation: `npm run backup:storage:sandbox`
- Retention policy gate: `npm run backup:retention:check`
- Restore drill report: `npm run restore:drill:report`
- Production backup/storage/cron/restore: not enabled

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong tao/upload backup production that.
- Khong dung cloud storage that.
- Khong restore production.
- Khong bat cron/schedule.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

### Task tiep theo de xuat

Phase 32 - Sandbox Storage Target Selection, hoac Production Backup Approval Checklist neu can go/no-go truoc khi dung storage that.

## 2026-06-17 - Phase 30 Restore Drill Report Generator completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 30 them restore drill report generator fixture-only. Report duoc tao tu fixture/manifest sample, khong restore that, khong goi network/API/DB va khong tao production mutation.

### File/script moi

- `docs/30_RESTORE_DRILL_REPORT_GENERATOR.md`
- `scripts/generate-restore-drill-report.cjs`
- `scripts/check-restore-drill-report-generator.cjs`
- `fixtures/backup/reports/sample-restore-drill-report.fixture.json`
- `npm run restore:drill:report`
- `npm run check:restore-drill-report-generator`

### Report baseline

- Marker: `RESTORE_DRILL_REPORT_ONLY`
- Environment: `fixture-dry-run`
- Manifest status: PASS
- Member graph status: PASS
- Privacy status: PASS
- Secret scan status: PASS
- Restore execution: `SKIPPED`
- noProductionMutation: true

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

### Task tiep theo de xuat

Phase 31 - Backup Readiness Handoff Consolidation.

## 2026-06-17 - Phase 29 Backup Artifact Retention Policy Gate completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 29 them retention policy gate tren fixture/sandbox metadata. Command chi tinh policy, khong xoa file, khong goi storage/API/DB va khong cham backup production.

### File/script moi

- `docs/29_BACKUP_ARTIFACT_RETENTION_POLICY_GATE.md`
- `scripts/backup-retention-policy-check.cjs`
- `scripts/check-backup-artifact-retention-policy-gate.cjs`
- `npm run backup:retention:check`
- `npm run check:backup-artifact-retention-policy-gate`

### Retention baseline

- Marker: `RETENTION_POLICY_CHECK_ONLY`
- Weekly keep: 8
- Monthly keep: 12
- Pre-deploy requires release marker
- Newest unverified artifact kept for review
- Invalid manifest blocks removal

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong dung cloud storage that.
- Khong xoa backup production that.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

### Task tiep theo de xuat

Phase 30 - Restore Drill Report Generator.

## 2026-06-17 - Phase 28 Local Sandbox Backup Storage Simulation completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 28 them local sandbox storage simulation. Script chi copy fixture/manifest sample vao `fixtures/backup-sandbox/` va tao local index; khong dung cloud storage, khong upload backup that, khong goi network/API/DB va khong restore.

### File/script moi

- `docs/28_LOCAL_SANDBOX_BACKUP_STORAGE_SIMULATION.md`
- `scripts/backup-storage-sandbox-simulate.cjs`
- `scripts/check-local-sandbox-backup-storage-simulation.cjs`
- `fixtures/backup-sandbox/`
- `npm run backup:storage:sandbox`
- `npm run check:local-sandbox-backup-storage-simulation`

### Sandbox baseline

- Marker: `LOCAL_SANDBOX_ONLY`
- Fixture copy: `fixtures/backup-sandbox/sample-family.fixture.json`
- Manifest copy: `fixtures/backup-sandbox/sample-family.manifest.fixture.json`
- Index: `fixtures/backup-sandbox/storage-index.fixture.json`
- Contains real data: false
- Contains secret: false

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong dung cloud storage that.
- Khong dung du lieu gia pha that.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

### Task tiep theo de xuat

Phase 29 - Backup Artifact Retention Policy Gate.

## 2026-06-17 - Phase 27 Backup CI Gate Integration completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 27 them GitHub Actions backup readiness gate cho PR/manual. Workflow moi chi chay local backup readiness scripts, khong dung GitHub secrets, khong schedule, khong deploy, khong upload backup va khong restore.

### File/script moi

- `docs/27_BACKUP_CI_GATE_INTEGRATION.md`
- `.github/workflows/backup-readiness.yml`
- `scripts/check-backup-ci-gate-integration.cjs`
- `npm run check:backup-ci-gate-integration`

### CI baseline

- Trigger: `pull_request`, `workflow_dispatch`
- Local gate: `backup:pipeline:readiness`
- No `schedule:`
- No `secrets.*`
- No deploy/push/upload/restore behavior

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong dung du lieu gia pha that.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

### Task tiep theo de xuat

Phase 28 - Local Sandbox Backup Storage Simulation.

## 2026-06-17 - Phase 26 Backup Pipeline Readiness Gate completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 26 them local backup pipeline readiness gate de chay cac buoc an toan: dry-run, fixture generate, fixture verify va restore dry-run. Phase nay khong tao cron/job, khong upload backup, khong restore that va khong goi production API/DB.

### File/script moi

- `docs/26_BACKUP_PIPELINE_READINESS_GATE.md`
- `scripts/backup-pipeline-readiness.cjs`
- `scripts/check-backup-pipeline-readiness-gate.cjs`
- `npm run backup:pipeline:readiness`
- `npm run check:backup-pipeline-readiness-gate`

### Pipeline baseline

- Marker: `PIPELINE_READINESS_ONLY`
- Step 1: `backup:dry-run`
- Step 2: `backup:fixture:generate`
- Step 3: `backup:fixture:verify`
- Step 4: `restore:dry-run`
- Real restore/upload/job execution: not implemented

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong dung du lieu gia pha that.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

### Task tiep theo de xuat

Phase 27 - Backup CI Gate Integration, hoac Sandbox Storage Upload Prototype neu storage target da duoc chot.

## 2026-06-17 - Phase 25 Restore Dry-Run Validator completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 25 them restore dry-run validator chi doc fixture sample local, validate manifest integrity, graph, privacy flags va secret scan. Restore execution luon la `SKIPPED`; phase nay khong restore that.

### File/script moi

- `docs/25_RESTORE_DRY_RUN_VALIDATOR.md`
- `scripts/restore-dry-run-validate.cjs`
- `scripts/check-restore-dry-run-validator.cjs`
- `npm run restore:dry-run`
- `npm run check:restore-dry-run-validator`

### Restore dry-run baseline

- Marker: `RESTORE_DRY_RUN_ONLY`
- Manifest integrity: checked
- Graph validation: checked
- Privacy validation: checked
- Restore execution: `SKIPPED`

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong dung du lieu gia pha that.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

### Task tiep theo de xuat

Phase 26 - Backup Pipeline Readiness Gate.

## 2026-06-17 - Phase 24 Backup Manifest Integrity Checker completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 24 them manifest integrity checker chi doc fixture sample local, tinh lai checksum SHA-256 va validate shape/count/flag. Phase nay khong doc env, khong goi network/API/DB, khong dung du lieu gia pha that, khong tao/upload backup production that va khong restore.

### File/script moi

- `docs/24_BACKUP_MANIFEST_INTEGRITY_CHECKER.md`
- `scripts/verify-sample-backup-integrity.cjs`
- `scripts/check-backup-manifest-integrity.cjs`
- `npm run backup:fixture:verify`
- `npm run check:backup-manifest-integrity`

### Integrity baseline

- Marker: `FIXTURE_ONLY`
- Manifest shape: checked
- Fixture shape: checked
- SHA-256 checksum: recomputed from `fixtures/backup/sample-family.fixture.json`
- Secret scan: checked against fixture and manifest data

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong dung du lieu gia pha that.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

### Task tiep theo de xuat

Phase 25 - Restore Dry-Run Validator.

## 2026-06-17 - Phase 23 Sample Fixture Backup Generator completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 23 them sample fixture backup generator. Phase nay chi tao fixture bang static sample data, khong doc env, khong goi network/API/DB, khong dung du lieu gia pha that, khong tao/upload backup production that va khong restore.

### File/script moi

- `docs/23_SAMPLE_FIXTURE_BACKUP_GENERATOR.md`
- `scripts/generate-sample-backup-fixture.cjs`
- `scripts/check-sample-fixture-backup-generator.cjs`
- `fixtures/backup/sample-family.fixture.json`
- `fixtures/backup/sample-family.manifest.fixture.json`
- `npm run backup:fixture:generate`
- `npm run check:sample-fixture-backup-generator`

### Fixture baseline

- Marker: `SAMPLE_FIXTURE_ONLY`
- Environment: `fixture`
- Contains real data: false
- Contains secret: false
- Sample names only: `Sample Root`, `Sample Parent`, `Sample Child`, `Sample Relative`

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong dung du lieu gia pha that.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

### Task tiep theo de xuat

Phase 24 - Backup Manifest & Integrity Checker.

## 2026-06-17 - Phase 22 Backup Dry-Run Command Design completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 22 them command backup dry-run an toan bang mock/static data. Phase nay khong deploy, khong push, khong doc `.env.local`/`.dev.vars`, khong goi network/API/DB, khong tao backup/export that, khong upload file, khong restore va khong tao scheduled job/cron that.

### File/script moi

- `docs/22_BACKUP_DRY_RUN_COMMAND_DESIGN.md`
- `scripts/backup-dry-run.cjs`
- `scripts/check-backup-dry-run-command-design.cjs`
- `npm run backup:dry-run`
- `npm run check:backup-dry-run-command-design`

### Dry-run baseline

- Output marker: `DRY_RUN_ONLY`
- Uses mock/static data in memory only.
- Validates manifest shape, naming convention, secret pattern scan and restore compatibility checklist.
- Does not write backup files.
- Does not call production services.

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong tao/upload backup that.
- Khong restore production.
- Khong tao scheduled job/cron that.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

### Task tiep theo de xuat

Phase 23 - Sample Fixture Backup Generator.

## 2026-06-17 - Phase 21 Automated Backup Job Design completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 21 bo sung design automated backup job. Phase nay khong deploy lai, khong push, khong tao scheduled job/cron that, khong tao/upload backup production that, khong restore production, khong them storage credential, khong sua schema, khong chay migration va khong mutate du lieu.

### File/script moi

- `docs/21_AUTOMATED_BACKUP_JOB_DESIGN.md`
- `scripts/check-automated-backup-job-design.cjs`
- `npm run check:automated-backup-job-design`

### Backup automation baseline

- Current export outputs: JSON, GEDCOM, ZIP.
- Existing builders referenced by design: `buildFamilyJsonFile`, `buildGedcomExport`, `buildFullBackupZip`.
- Recommended path: manual checklist -> sample dry-run -> manifest generator -> sandbox storage -> disabled-by-default schedule -> approved production schedule.
- Storage candidates: local operator storage, Cloudflare R2, Google Drive, Supabase Storage, private NAS/offline backup.
- No real storage/bucket/job/cron configured in Phase 21.

### Boundary giu nguyen

- Khong deploy lai.
- Khong push.
- Khong tao scheduled job/cron that.
- Khong tao/upload backup that.
- Khong restore production.
- Khong them storage secret/credential.
- Khong doi domain/Auth/OAuth config that.
- Khong sua schema.
- Khong tao/chay migration.
- Khong sua du lieu that.
- Khong hardcode secret/token/key.
- Khong commit `.env.local` hoac `.dev.vars`.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

### Task tiep theo de xuat

Phase 22 co the la Backup Dry-Run Command Design neu tiep tuc backup automation, hoac Custom Domain Cutover Execution neu domain that da chot va co quyen cau hinh.

## 2026-06-17 - Phase 20 Custom Domain Cutover Readiness completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 20 bo sung runbook san sang doi custom domain. Phase nay khong deploy lai, khong chot/doi domain that, khong doi DNS, khong cau hinh Cloudflare custom domain/route, khong doi Supabase/Auth/OAuth config that, khong goi API mutate config, khong sua schema va khong mutate du lieu.

### File/script moi

- `docs/20_CUSTOM_DOMAIN_CUTOVER_READINESS.md`
- `scripts/check-custom-domain-cutover-readiness.cjs`
- `npm run check:custom-domain-cutover-readiness`

### Domain readiness baseline

- Worker: `web-gia-pha`
- Current production URL: https://web-gia-pha.hungdiepcompany.workers.dev/
- Candidate custom domain: `<TO_BE_CONFIRMED>`
- Deploy workflow: `.github/workflows/cloudflare-deploy.yml`
- Cloudflare config: `wrangler.toml`
- App canonical env: `NEXT_PUBLIC_APP_URL`
- Smoke env: `PROD_SMOKE_BASE_URL`
- Google OAuth login: PASS by manual user test on current production URL.
- Custom domain smoke: not run because no real domain was configured in this phase.

### Boundary giu nguyen

- Khong deploy lai.
- Khong push.
- Khong doi domain/DNS that.
- Khong doi Cloudflare custom domain/route that.
- Khong doi Supabase/Auth/OAuth config that.
- Khong goi Cloudflare/Supabase/Google/DNS API mutate config.
- Khong tao backup that.
- Khong restore production.
- Khong sua schema.
- Khong tao/chay migration.
- Khong sua du lieu that.
- Khong hardcode secret/token/key.
- Khong commit `.env.local` hoac `.dev.vars`.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

### Task tiep theo de xuat

Phase 21 co the la Custom Domain Cutover Execution neu user da chot domain va co quyen Cloudflare/Supabase/Google, hoac Automated Backup Job Design neu domain cutover can cho.

## 2026-06-17 - Phase 19 Scheduled Backup & Restore Drill completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 19 bo sung runbook scheduled backup va restore drill an toan. Phase nay khong deploy lai, khong tao backup production that, khong restore production, khong them cron/job that, khong sua schema, khong chay migration, khong mutate du lieu va khong doi domain/Auth/OAuth config that.

### File/script moi

- `docs/19_SCHEDULED_BACKUP_RESTORE_DRILL.md`
- `scripts/check-scheduled-backup-restore-drill.cjs`
- `npm run check:scheduled-backup-restore-drill`

### Drill baseline

- Worker: `web-gia-pha`
- Production URL: https://web-gia-pha.hungdiepcompany.workers.dev/
- Deploy workflow: `.github/workflows/cloudflare-deploy.yml`
- Phase 16/17: PASS
- Phase 18: PASS_WITH_NOTES
- Google OAuth production login: PASS by manual user test
- Basic production route smoke: PASS by manual user test
- Backup schedule: documented manual runbook only, no cron/job configured.
- Restore drill: documented for non-production only, no production restore executed.

### Boundary giu nguyen

- Khong deploy lai.
- Khong push.
- Khong tao backup that.
- Khong restore production.
- Khong commit backup/export artifact.
- Khong sua schema.
- Khong tao/chay migration.
- Khong sua du lieu that.
- Khong doi domain/Auth/OAuth config that.
- Khong lam import confirm that.
- Khong lam revision restore that.
- Khong hardcode secret/token/key.
- Khong commit `.env.local` hoac `.dev.vars`.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

### Task tiep theo de xuat

Phase 20 co the la Custom Domain Cutover Readiness, Automated Backup Job Design, hoac focused production bugfix neu monitoring/smoke phat hien loi that.

## 2026-06-17 - Phase 18 Backup, Domain & Alerting Hardening completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 18 bo sung runbook hardening cho backup, restore readiness, domain cutover, alerting va incident matrix. Phase nay khong deploy lai, khong tao backup that, khong doi domain/Auth/OAuth config that, khong sua schema, khong chay migration va khong mutate du lieu.

### File/script moi

- `docs/18_BACKUP_DOMAIN_ALERTING_HARDENING.md`
- `scripts/check-backup-domain-alerting-hardening.cjs`
- `npm run check:backup-domain-alerting-hardening`

### Hardening baseline

- Worker: `web-gia-pha`
- Production URL: https://web-gia-pha.hungdiepcompany.workers.dev/
- Deploy workflow: `.github/workflows/cloudflare-deploy.yml`
- Backup naming convention: `web-gia-pha_<env>_<YYYYMMDD-HHMMSS>_<scope>.<ext>`
- Restore readiness: documented only, no restore drill executed in this phase.
- Alerting: checklist documented only, no dashboard or external alert destination configured in this phase.

### Boundary giu nguyen

- Khong deploy lai.
- Khong tao backup that.
- Khong commit backup/export artifact.
- Khong sua schema.
- Khong tao/chay migration.
- Khong sua du lieu that.
- Khong doi domain/Auth/OAuth config that.
- Khong lam import confirm that.
- Khong lam revision restore that.
- Khong hardcode secret/token/key.
- Khong commit `.env.local` hoac `.dev.vars`.

### Task tiep theo de xuat

Phase 19 co the la Scheduled Backup & Restore Drill, Custom Domain Cutover, hoac focused production bugfix neu monitoring/smoke phat hien loi that.

## 2026-06-17 - Phase 17 Production Operations & Monitoring completed

### Trạng thái hiện tại

Production đang PASS tại `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 17 bổ sung runbook vận hành production, monitoring checklist, smoke guide, incident triage và rollback guidance. Phase này không deploy lại, không mở tính năng lớn, không sửa schema, không chạy migration và không sửa dữ liệu thật.

### File/script mới

- `docs/17_PRODUCTION_OPERATIONS_MONITORING.md`
- `scripts/check-production-ops-monitoring.cjs`
- `npm run check:production-ops-monitoring`

### Operations baseline

- Worker: `web-gia-pha`
- Production URL: https://web-gia-pha.hungdiepcompany.workers.dev/
- Deploy workflow: `.github/workflows/cloudflare-deploy.yml`
- Phase 16 baseline: PASS
- Google OAuth production login: PASS by manual user test
- Basic production route smoke: PASS by manual user test
- Optional automated smoke with `PROD_SMOKE_BASE_URL=https://web-gia-pha.hungdiepcompany.workers.dev`: PASS

### Boundary giữ nguyên

- Không deploy lại.
- Không sửa schema.
- Không tạo/chạy migration.
- Không sửa dữ liệu thật.
- Không làm import confirm thật.
- Không làm revision restore thật.
- Không đổi privacy/business logic.
- Không hardcode secret/token/key.
- Không commit `.env.local` hoặc `.dev.vars`.

### Task tiếp theo đề xuất

Use `docs/17_PRODUCTION_OPERATIONS_MONITORING.md` after each deploy. Next phase can be a focused production bugfix only if monitoring/smoke finds an issue, or backup/domain/alerting hardening.

## 2026-06-17 - Phase 16 Production Stabilization checklist added

### Trạng thái hiện tại

Production deploy đang PASS tại `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 16 đã thêm checklist vận hành production sau deploy đầu tiên, tập trung route smoke, Auth/OAuth, privacy, export backup và logs/observability. Phase này không deploy lại và không mở tính năng lớn.

### File/script mới

- `docs/16_PRODUCTION_STABILIZATION.md`
- `scripts/check-production-stabilization.cjs`
- `npm run check:production-stabilization`

### Local validation

- `npm run check:production-stabilization`: PASS.
- Optional production smoke: skipped because `PROD_SMOKE_BASE_URL` was not set.
- `npm run check:env:safe`: PASS.
- `npm run check:migrations`: PASS.
- `npm run check:deploy-readiness`: PASS.
- `npm run check:opennext-cloudflare`: PASS.
- `npm run check:service-boundary`: PASS.
- `npm run check:github-actions-opennext`: PASS.
- `npm run check:github-actions-deploy`: PASS.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS.
- `npm audit --audit-level=moderate`: PASS_WITH_KNOWN_AUDIT_ADVISORIES.
- `git diff --check`: PASS.

### Production baseline

- Worker: `web-gia-pha`
- Production URL: https://web-gia-pha.hungdiepcompany.workers.dev/
- Deploy workflow: `.github/workflows/cloudflare-deploy.yml`
- Deploy status: PASS
- Google OAuth login: PASS by manual production test
- Basic production route smoke: PASS by manual user test

### Boundary giữ nguyên

- Không sửa schema.
- Không tạo/chạy migration.
- Không sửa dữ liệu thật.
- Không làm import confirm thật.
- Không làm revision restore thật.
- Không đổi privacy/business logic.
- Không hardcode secret/token/key.
- Không commit `.env.local` hoặc `.dev.vars`.

### Task tiếp theo đề xuất

Run production stabilization checklist after each deploy. Next likely phase: Phase 17 - Production Operations & Monitoring, or a focused fix phase only if production smoke/logs reveal an issue.

## 2026-06-17 - Production deploy PASS

### Trạng thái hiện tại

Production deploy cho WEB GIA PHẢ đã PASS qua GitHub Actions Cloudflare Deploy theo xác nhận của user. Worker production đang chạy tại URL Cloudflare Workers thật.

### Production

- Worker: `web-gia-pha`
- Production URL: https://web-gia-pha.hungdiepcompany.workers.dev/
- Deploy path: GitHub Actions Cloudflare Deploy
- Deploy status: PASS
- `NEXT_PUBLIC_APP_URL`: đã cập nhật theo URL thật

### Auth/OAuth

- Supabase Site URL: đã cấu hình theo production URL.
- Supabase Redirect URLs: đã cấu hình theo production URL và `/auth/callback`.
- Google OAuth: đã sửa lỗi `deleted_client`.
- Login Google OAuth production: PASS theo test thủ công.

### Smoke test

- Các route smoke cơ bản: PASS theo test thủ công.
- Import confirm: vẫn disabled.
- Revision restore: vẫn disabled.

### Boundary giữ nguyên

- Không sửa schema.
- Không tạo/chạy migration.
- Không sửa dữ liệu thật.
- Không làm import confirm thật.
- Không làm revision restore thật.
- Không hardcode secret/token/key.
- Không commit `.env.local` hoặc `.dev.vars`.

### Task tiếp theo đề xuất

Phase 16 - Production Stabilization: theo dõi logs/observability, smoke test chi tiết production, xác nhận export backup production, và ghi checklist vận hành.

## 2026-06-17 - Phase 15E GitHub Actions Cloudflare Deploy Workflow ready

### Trạng thái hiện tại

Dự án đã có workflow deploy Cloudflare thủ công qua GitHub Actions/Linux để tránh blocker Windows/OpenNext local. Phase này chỉ tạo workflow/checker/docs, chưa chạy workflow deploy, chưa deploy thật, không sửa schema, không chạy migration và không đổi business logic.

### Workflow mới

- `.github/workflows/cloudflare-deploy.yml`
- Trigger: `workflow_dispatch` only
- Runner: `ubuntu-latest`
- Node: `24`
- Cài dependency bằng `npm ci`
- Chạy safety checks, typecheck, lint, build
- Chạy deploy bằng `npm run deploy`
- Không chạy khi push hoặc pull request

### Required GitHub Actions config

- Variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_APP_URL`
- Secrets:
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `CLOUDFLARE_API_TOKEN`
  - `CLOUDFLARE_ACCOUNT_ID`

### Script/docs mới

- `scripts/check-github-actions-cloudflare-deploy.cjs`
- `npm run check:github-actions-deploy`
- `docs/15E_GITHUB_ACTIONS_CLOUDFLARE_DEPLOY.md`

### Local validation

- `npm run check:github-actions-deploy`: PASS.
- `npm run check:github-actions-opennext`: PASS.
- `npm run check:opennext-cloudflare`: PASS.
- `npm run check:service-boundary`: PASS.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS.
- `npm audit --audit-level=moderate`: PASS_WITH_KNOWN_AUDIT_ADVISORIES.
- `git diff --check`: PASS.
- Secret scan: PASS, no real secret value found.

### Boundary giữ nguyên

- Không deploy từ Windows local.
- Không auto deploy on push.
- Không sửa schema.
- Không chạy migration.
- Không sửa dữ liệu thật.
- Không làm import confirm thật.
- Không làm revision restore thật.
- Không hardcode secret/token/key.
- Không commit `.env.local` hoặc `.dev.vars`.

### Task tiếp theo đề xuất

Push commit Phase 15E lên GitHub, sau đó chạy thủ công GitHub Actions -> Cloudflare Deploy -> Run workflow trên branch `main`. Nếu deploy PASS, ghi production URL và tiếp tục smoke test/Phase 16 - Production Stabilization.

## 2026-06-16 - Phase 15D First Cloudflare Deploy Retry blocked on Windows

### Trạng thái hiện tại

Phase 15D đã chạy gate đầy đủ và thử deploy thật bằng `npm.cmd run deploy`, nhưng deploy bị BLOCKED bởi known OpenNext/Windows local blocker trước khi upload/deploy lên Cloudflare. Không có production URL mới, không có Cloudflare deployment mới và chưa smoke test production.

### Gate đã PASS

- Repo sạch trước deploy.
- Branch: `main`.
- Local commit: `b04657535a94378df0a6811a15fff247131d5cac`.
- `origin/main`: `b04657535a94378df0a6811a15fff247131d5cac`.
- GitHub Actions OpenNext Cloudflare Build Gate: PASS.
- Run URL: https://github.com/hungdiepcompany-del/giapha/actions/runs/27631937702
- Local checks/build: PASS.
- Audit: PASS_WITH_KNOWN_AUDIT_ADVISORIES.

### User confirmations before deploy

- Backup `family.json`: DONE, outside repo.
- Backup `full-backup.zip`: DONE, outside repo.
- `NEXT_PUBLIC_SUPABASE_URL`: configured as Text.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: configured as Text.
- `NEXT_PUBLIC_APP_URL`: configured as Text.
- `SUPABASE_SERVICE_ROLE_KEY`: configured as Secret.

### Deploy attempt

- Command: `npm.cmd run deploy`.
- Next build: PASS.
- OpenNext bundle on Windows: FAIL.
- Error summary: `ENOENT` copying `.open-next/.build/open-next.config.edge.mjs` to `.open-next/middleware/open-next.config.mjs`.
- Cloudflare upload/deploy reached: No.

### Boundary giữ nguyên

- Không sửa schema.
- Không tạo/chạy migration.
- Không sửa dữ liệu thật.
- Không làm import confirm thật.
- Không làm revision restore thật.
- Không in secret.
- Không commit `.env.local` hoặc `.dev.vars`.

### Task tiếp theo đề xuất

Use WSL/Linux for deploy, or create a dedicated GitHub Actions deploy workflow only after explicit user confirmation. If deploy later PASS, continue Phase 16 - Production Stabilization.

## 2026-06-16 - Phase 15C Linux/GitHub Actions OpenNext Build Gate completed

### Trạng thái hiện tại

Dự án WEB GIA PHẢ đã có GitHub Actions/Linux build gate cho OpenNext Cloudflare build. Phase này chỉ thêm workflow/checker/docs, chưa deploy thật, chưa upload, chưa push remote, không tạo Cloudflare deployment, không chạy migration, không sửa schema và không đổi business logic.

### Workflow mới

- `.github/workflows/opennext-build-gate.yml`
- Trigger: `workflow_dispatch`, `pull_request` vào `main`, `push` vào `main`
- Runner: `ubuntu-latest`
- Node: `24`
- Cài dependency bằng `npm ci`
- Chạy check scripts, typecheck, lint, `npm run build` và `npx opennextjs-cloudflare build`
- Không chạy `npm run deploy`, `npm run upload` hoặc `wrangler deploy`

### Script/docs mới

- `scripts/check-github-actions-opennext-gate.cjs`
- `npm run check:github-actions-opennext`
- `docs/15C_GITHUB_ACTIONS_OPENNEXT_BUILD_GATE.md`

### Env/secrets policy

- Workflow là build gate, không phải deploy.
- Workflow có placeholder env để build khi chưa cấu hình production secrets thật.
- Không dùng workflow này để smoke test Supabase thật.
- Production deploy phase sau mới cấu hình Cloudflare/GitHub secrets/env thật.

### Audit status

- `npm audit --audit-level=moderate` vẫn có advisory trong Next/OpenNext/Wrangler/PostCSS/esbuild/ws chain.
- Không chạy `npm audit fix --force`.
- Nếu checks/build PASS, Phase 15C được xem là READY_TO_RUN_ON_GITHUB với known audit advisories.

### Local validation

- Gate Phase 15B signs: PASS.
- `npm run check:github-actions-opennext`: PASS.
- `npm run check:opennext-cloudflare`: PASS.
- `npm run check:service-boundary`: PASS.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS.
- `git diff --check`: PASS.
- `npm audit --audit-level=moderate`: PASS_WITH_KNOWN_AUDIT_ADVISORIES.
- Phase 15C status: READY_TO_RUN_ON_GITHUB.

### Task tiếp theo đề xuất

Push commit lên GitHub để chạy OpenNext Cloudflare Build Gate. Nếu GitHub Actions PASS, tiếp tục Phase 15D - First Cloudflare Deploy Retry.

## 2026-06-16 - Phase 15B Service Boundary & Worker Split Readiness completed

### Trạng thái hiện tại

Dự án WEB GIA PHẢ đã có service boundary readiness để tránh main Worker phình to về sau. Phase này chỉ tạo docs, template worker và checker; chưa tách Worker thật, chưa tạo Cloudflare service thật, chưa deploy, chưa upload, chưa push remote, không chạy migration và không đổi business logic.

### Boundary đã ghi nhận

- Main Web Worker giữ UI public/admin, auth callback, people CRUD nhẹ, relationship CRUD nhẹ, tree viewer/editor nhẹ và gọi service phụ khi cần.
- `export-backup-worker` tương lai xử lý `family.json`, GEDCOM, ZIP backup, checksum và scheduled/manual backup.
- `import-validate-worker` tương lai xử lý JSON parse, schema validation, missing reference validation, cycle check và conflict report; phase đầu không ghi DB.
- `media-worker` tương lai xử lý upload ảnh, resize/compress, metadata và media backup.
- `pdf-image-export-worker` tương lai xử lý xuất ảnh cây và PDF.

### File/script mới

- `docs/15_SERVICE_BOUNDARY_WORKER_SPLIT.md`
- `services/_template-worker/`
- `scripts/check-service-boundary-readiness.cjs`
- `npm run check:service-boundary`

### OpenNext/Windows note

- OpenNext wiring check PASS bằng `npm run check:opennext-cloudflare`.
- Next build PASS bằng `npm run build`.
- `npx.cmd opennextjs-cloudflare build` trên Windows thuần có thể bị BLOCKED bởi compatibility issue của OpenNext.
- Build/deploy thật nên chạy bằng WSL/Linux/GitHub Actions hoặc môi trường Cloudflare-compatible.

### Check status

- All project readiness/type/lint/build checks PASS.
- `npm.cmd audit --audit-level=moderate` FAIL vì advisory còn trong `next`/`postcss`, `@opennextjs/cloudflare`/`wrangler`/`esbuild`/`ws`.
- Không chạy `npm audit fix --force` vì ngoài scope, có advisory no-fix và force path có thể gây breaking downgrade.
- Phase 15B technical status: PASS.
- Commit status: allowed with audit exception.
- Audit status: npm audit still reports advisories in dependency/toolchain chain.
- Policy: no `npm audit fix --force`; track upstream package updates.
- Reason: current advisory remediation may require force/breaking changes and could destabilize Next/OpenNext deploy wiring.
- Kết luận validation: PASS_WITH_KNOWN_AUDIT_ADVISORIES.

### Task tiếp theo đề xuất

Phase 15C - GitHub Actions/WSL OpenNext Build Gate hoặc retry first Cloudflare deploy bằng môi trường Linux sau khi backup và production env/secrets đã sẵn sàng.

## 2026-06-16 - Phase 15A OpenNext Cloudflare Workers Wiring completed

### Trạng thái hiện tại

Dự án WEB GIA PHẢ đã có wiring deploy rõ ràng cho Cloudflare Workers qua OpenNext. Phase này chỉ cài/cấu hình deploy adapter và docs/checker, chưa deploy thật, chưa upload, chưa push remote, không chạy migration, không sửa schema/auth/business logic và không đọc/in `.env.local`.

### File/script mới hoặc cập nhật

- `@opennextjs/cloudflare`
- `wrangler`
- `open-next.config.ts`
- `wrangler.toml`
- `eslint.config.mjs` ignores generated `.open-next` output
- `scripts/check-opennext-cloudflare-wiring.cjs`
- `docs/14_OPENNEXT_CLOUDFLARE_WIRING.md`
- `npm run check:opennext-cloudflare`
- `npm run preview`
- `npm run deploy`
- `npm run upload`
- `npm run cf-typegen`

### Deploy boundary

- Target: Cloudflare Workers via OpenNext.
- `npm run deploy`, `npm run upload` và `npx wrangler deploy` vẫn chưa được chạy.
- Trước khi retry Phase 15, cần backup `family.json` và `full-backup.zip`.
- Cần cấu hình Cloudflare variables/secrets: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- `SUPABASE_SERVICE_ROLE_KEY` phải là secret/server-side, không dùng `NEXT_PUBLIC_`.

### Task tiếp theo đề xuất

Chạy lại Phase 15 - First Cloudflare Deploy.

## 2026-06-16 - Phase 14 Deploy Readiness completed

### Trạng thái hiện tại

Dự án WEB GIA PHẢ đã có deploy readiness baseline cho first Cloudflare deploy. Phase này chỉ tạo docs/check/script, không deploy thật, không push remote, không tạo Cloudflare project, không sửa schema/auth/business logic và không đọc/in `.env.local`.

### File/script mới

- `docs/13_DEPLOY_READINESS.md`
- `scripts/check-deploy-readiness.cjs`
- `npm run check:deploy-readiness`

### Deploy readiness policy

- Target deploy: Cloudflare, nhưng Pages versus Workers wiring cần xác nhận ở Phase 15.
- Production env bắt buộc: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`.
- `.env.example` chỉ giữ placeholder rỗng.
- `SUPABASE_SERVICE_ROLE_KEY` chỉ server-side, không dùng `NEXT_PUBLIC_`.
- Trước deploy cần cập nhật Supabase Site URL/Redirect URLs và Google OAuth Authorized JavaScript origin.
- Trước deploy có rủi ro dữ liệu cần tải `family.json` và `full-backup.zip`.

### Boundary giữ nguyên

- Không chạy lại migrations 0001-0006.
- Không tạo migration mới.
- Không bật import confirm thật.
- Không bật revision restore thật.
- Không deploy hoặc push remote.

### Task tiếp theo đề xuất

Phase 15 - First Cloudflare Deploy.

## 2026-06-16 - Phase 13 UI Polish Foundation completed

### Trạng thái hiện tại

Dự án WEB GIA PHẢ đã có UI polish foundation trên các bề mặt chính. Phase này chỉ sửa giao diện/copy/layout và thêm checker, không sửa schema, RLS, auth callback, business logic dữ liệu, import confirm hoặc revision restore.

### UI primitives mới

- `components/ui/page-header.tsx`
- `components/ui/section-card.tsx`
- `components/ui/status-callout.tsx`
- `components/ui/empty-state.tsx`
- `components/ui/action-link.tsx`

### UI đã polish

- Admin shell: nav rõ hơn, active route rõ hơn, user/role/permission context gọn hơn.
- Public homepage/tree/profile: hero, CTA, readonly/public privacy copy.
- Login page: Google OAuth và magic link phân biệt rõ hơn.
- People list/form: bảng dễ đọc hơn, form chia nhóm thông tin.
- Relationships: giải thích family, cha mẹ/con, quan hệ đôi và UUID.
- Tree viewer/editor: toolbar rõ hơn, hướng dẫn click/kéo/lưu layout, empty state rõ hơn.
- Export/import: nhấn mạnh `family.json` là backup chính, import preview chưa ghi DB.

### Script check mới

- `npm run check:ui-polish`

### Boundary giữ nguyên

- Không tạo migration.
- Không chạy lại migrations 0001-0006.
- Không sửa auth callback/PKCE.
- Không bật import confirm thật.
- Không bật revision restore thật.
- Không deploy hoặc push remote.

### Task tiếp theo đề xuất

Phase 14 - Deploy Readiness hoặc Phase 14 - Import Confirm Planning, tùy ưu tiên.

## 2026-06-16 - Phase 12 Real Supabase Smoke Test Baseline completed

### Trạng thái hiện tại

Dự án WEB GIA PHẢ đã có mốc baseline ổn định sau real Supabase smoke test. Phase 12 chỉ cập nhật tài liệu và report, không sửa code app, không tạo migration, không deploy và không push remote.

### File/report mới

- `docs/12_REAL_SUPABASE_SMOKE_TEST_REPORT.md`

### User-confirmed smoke status

- Google OAuth login: PASS.
- User đã thêm người thật vào database thật: PASS.
- Main routes/functions smoke test chính: OK theo xác nhận của user.
- PKCE issue trước đó: tự hết, xem như transient browser/cookie/origin issue nếu không tái diễn.

### Baseline policy

- Đây là baseline ổn định trước UI polish.
- Không chạy lại toàn bộ migration 0001-0006 sau khi đã có dữ liệu thật nếu chưa review schema/data state.
- Không bật import confirm thật nếu chưa có transaction, final validation, conflict resolution và log an toàn.
- Không bật revision restore thật nếu chưa có transaction, validation và revision mới cho hành động restore.

### Chưa làm

- Chưa deploy Cloudflare.
- Chưa push remote.
- Chưa làm import confirm thật.
- Chưa làm revision restore thật.
- Chưa ghi nhận per-route evidence độc lập từ Codex trong Phase 12; report dùng `PASS_USER_CONFIRMED` hoặc `NOT_CONFIRMED` đúng mức xác nhận.

### Task tiếp theo đề xuất

Phase 13 - UI Polish Foundation. Không ưu tiên import confirm thật ở bước kế tiếp.

## 2026-06-16 - Google OAuth login added

### Trạng thái hiện tại

Dự án WEB GIA PHẢ đã có thêm đăng nhập Google OAuth qua Supabase Auth để tránh phụ thuộc hoàn toàn vào magic link khi gặp `email rate limit exceeded` hoặc `otp_expired`.

### File/route đã cập nhật

- `components/auth/login-form.tsx`
- `app/auth/login/page.tsx`
- `app/auth/callback/route.ts`
- `docs/10_SUPABASE_SETUP.md`

### Auth behavior

- `/auth/login` vẫn giữ form magic link.
- `/auth/login` có thêm nút `Đăng nhập với Google`, gọi Supabase `signInWithOAuth` với `redirectTo` là `${window.location.origin}/auth/callback`.
- `/auth/callback` xử lý cả magic link và Google OAuth bằng `exchangeCodeForSession(code)`.
- `/auth/callback` ưu tiên `error_code`/`error` trước khi kiểm tra thiếu `code`.
- Exchange lỗi redirect về `/auth/login?reason=auth_callback_failed` và chỉ log metadata an toàn: name, message, status/code.
- Callback thành công vẫn ưu tiên `/admin` khi user có `people.view`.

### Cấu hình thủ công còn cần user kiểm tra

- Google Cloud OAuth Client có Authorized redirect URI: `https://<SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`.
- Supabase Dashboard -> Authentication -> Providers -> Google đã Enabled và có Client ID/Secret.
- Supabase URL Configuration local có:
  - `http://localhost:3000/**`
  - `http://localhost:3000/auth/callback`
- Khi deploy Cloudflare Pages, thêm redirect URL tương ứng cho `https://<pages-project>.pages.dev/**` và `/auth/callback`.

### Chưa làm

- Chưa tạo migration.
- Chưa sửa schema/role/OWNER.
- Chưa commit secret.
- Chưa push remote.
- Chưa deploy.

### Task tiếp theo đề xuất

User kiểm tra cấu hình Google Cloud/Supabase Dashboard rồi smoke test `/auth/login` bằng Google OAuth với tài khoản OWNER thật.

## 2026-06-16 - Phase 11 Supabase Integration & Real Smoke Test Gate completed

### Trạng thái hiện tại

Dự án WEB GIA PHẢ đã có gate chuẩn bị tích hợp Supabase thật. Phase này không chạy migration thật, không deploy, không push và không commit secret.

### File/route/script đã có

- `docs/10_SUPABASE_SETUP.md`
- `docs/11_SMOKE_TEST_CHECKLIST.md`
- `scripts/check-env-safe.cjs`
- `scripts/check-migrations-order.cjs`
- `/admin/system/status`
- `npm run check:env:safe`
- `npm run check:migrations`

### Supabase integration behavior

- `.env.local` vẫn chỉ là file local, không commit.
- `check:env:safe` chỉ in trạng thái present/missing, không in giá trị secret.
- `check:migrations` kiểm migration folder, thứ tự tên file, đủ prefix `0001` đến `0006`, không duplicate prefix và không conflict marker.
- `/admin/system/status` yêu cầu `settings.manage` hoặc `permissions.manage`, chỉ hiển thị trạng thái env dạng yes/no và danh sách foundation checks.

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa chạy migration thật trên Supabase.
- Chưa test login Supabase thật.
- Chưa gán OWNER thật.
- Chưa smoke test CRUD/export/import preview bằng user thật.

### Task tiếp theo đề xuất

User cấu hình `.env.local`, chạy migrations thật, đăng nhập lần đầu, gán OWNER bằng `db/snippets/assign-owner-role.sql`, rồi chạy checklist `docs/11_SMOKE_TEST_CHECKLIST.md`.

## 2026-06-15 - Phase 10 Import JSON Foundation completed

### Trạng thái hiện tại

Dự án WEB GIA PHẢ đã có Import JSON foundation dạng preview an toàn. Admin có route `/admin/exports/import` để upload hoặc paste `family.json`, kiểm tra schema, quan hệ, vòng tổ tiên và conflict cơ bản với DB hiện tại.

### Import service/UI đã có

- `lib/family/import-types.ts`
- `lib/family/json-import-validator.ts`
- `lib/family/json-import-preview-service.ts`
- `app/(admin)/admin/exports/import/page.tsx`
- `app/(admin)/admin/exports/import/actions.ts`
- `components/imports/json-import-preview-form.tsx`

### Import behavior

- Hỗ trợ preview schema `1.0.0`.
- Validate JSON parse được, `schema_version`, `people`, `full_name`, duplicate person/family IDs, reference giữa family/person/layout và vòng tổ tiên.
- Conflict check DB nếu có Supabase/admin config và user có `imports.create`: existing person IDs, duplicate slugs, family IDs, tree layout IDs.
- Nếu thiếu Supabase config, route vẫn cho kiểm tra cấu trúc file và báo conflict DB unavailable an toàn.
- File/input giới hạn 5MB.
- Nút xác nhận import bị disabled; Phase 10 không ghi DB, không lưu file, không restore dữ liệu.

### Permission/privacy status

- Route import yêu cầu `imports.create` khi Supabase/auth đã cấu hình.
- Service role chỉ dùng server-side trong conflict check.
- Client form chỉ gọi server action, không nhận secret.
- Không tạo mock data, không ghi đè dữ liệu hiện tại.

### Script check đã tạo

- `npm run check:import-json`

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa làm import thật.
- Chưa ghi import job/revision log cho thao tác import.
- Chưa có transaction import/rollback.
- Chưa kiểm thử với Supabase data thật.

### Lưu ý cho AI tiếp theo

- Không bật import thật nếu chưa có transaction, validation final, conflict resolution và revision/import log.
- Không overwrite person/family/layout theo ID cũ nếu chưa có chế độ xác nhận rõ ràng.
- `family.json` vẫn là bản bảo toàn dữ liệu chính; GEDCOM không thay thế được JSON.

### Task tiếp theo đề xuất

Phase 11 - Import transaction/restore planning hoặc UI polish foundation.

## 2026-06-15 - Phase 9 Revision History UI Foundation completed

### Trạng thái hiện tại

Dự án WEB GIA PHẢ đã có Revision History UI foundation. Admin có thể xem danh sách revision, lọc cơ bản và mở chi tiết để xem before/after JSON cùng diff field.

### Revision service/UI đã có

- `lib/family/revision-types.ts`
- `lib/family/revision-service.ts`
- `lib/family/revision-diff.ts`
- `/admin/revisions`
- `/admin/revisions/[id]`

### Revision behavior

- `/admin/revisions` hiển thị thời gian, action, entity_type, entity_id, changed_by và reason.
- Filter hỗ trợ `entity_type`, `action`, `entity_id`, `changed_by`, `changed_from`, `changed_to`.
- `/admin/revisions/[id]` hiển thị metadata, diff field, `revision_items` nếu có và raw before/after JSON.
- `/admin/people/[id]` có link nhanh tới `/admin/revisions?entity_type=people&entity_id=<id>` nếu user có `revisions.view`.

### Restore status

- Phase 9 chưa làm restore thật.
- Nút restore là placeholder disabled.
- Người có `revisions.restore` chỉ thấy ghi chú rằng restore thật cần transaction, validation và revision mới.

### Permission/privacy status

- Service và route kiểm `revisions.view` server-side.
- Revision có thể chứa dữ liệu nhạy cảm trong `before_json`/`after_json`, không public.
- Không đưa service role key ra client.

### Script check đã tạo

- `npm run check:revisions`

### Lệnh đã chạy

- Baseline trước khi sửa: `npm run check:foundation`, `npm run check:auth-permissions`, `npm run check:people`, `npm run check:relationships`, `npm run check:tree-viewer`, `npm run check:tree-editor`, `npm run check:public-privacy`, `npm run check:export-backup`, `npm run typecheck`, `npm run lint`, `npm run build` - PASS
- Phase 9: `npm run check:revisions`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` - PASS
- Browser route check `/admin/revisions`, `/admin/revisions/fake-id` trên `http://127.0.0.1:3000` - PASS; routes render nội dung an toàn, không crash trắng.
- `npm audit --audit-level=moderate` - WARN, còn 2 moderate warnings từ `next`/`postcss`; không chạy force fix vì breaking change ngoài scope.

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa làm restore thật.
- Chưa có transaction/validation restore.
- Chưa kiểm thử với dữ liệu Supabase thật.
- NPM audit còn 2 moderate warnings từ `next`/`postcss`.

### Lưu ý cho AI tiếp theo

- Không bật restore thật nếu chưa có validation, transaction và revision log cho hành động restore.
- Revision detail có thể hiển thị dữ liệu nhạy cảm nên không đưa ra public route.
- Nếu mở restore, phải xử lý từng `entity_type` riêng, không dùng generic overwrite mù.

### Task tiếp theo đề xuất

Phase 10 - Import JSON foundation hoặc UI polish foundation.

## 2026-06-15 - Phase 8 Export/backup foundation completed

### Trạng thái hiện tại

Dự án WEB GIA PHẢ đã có export/backup foundation. Admin có route `/admin/exports` để tải `family.json`, `family.ged` và `full-backup.zip`.

### Export/backup service đã có

- `lib/family/export-types.ts`
- `lib/family/export-collector.ts`
- `lib/family/json-exporter.ts`
- `lib/family/gedcom-exporter.ts`
- `lib/family/checksum.ts`
- `lib/family/zip-backup-exporter.ts`

### Route đã có

- `/admin/exports`: trang admin backup/export.
- `/admin/exports/download/json`: tải `family.json`.
- `/admin/exports/download/gedcom`: tải `family.ged`.
- `/admin/exports/download/zip`: tải `full-backup.zip`.

### Database migration đã có

- `db/migrations/20260614_0006_export_backup_foundation.sql`
- Bảng `export_jobs`: metadata job export.
- Bảng `backup_records`: metadata backup dài hạn.
- RLS: `exports.download` đọc record, `exports.create` tạo record.
- Chưa chạy migration trên Supabase thật.

### Export status

- `family.json`: đã build từ people, families, family_parents, family_children, couple_relationships, tree_layouts và tree_layout_nodes.
- `family.ged`: foundation GEDCOM với HEAD/INDI/FAM/TRLR.
- `full-backup.zip`: dùng `jszip`, gồm `family.json`, `family.ged`, `manifest.json`, `checksums.json`.
- Manifest/checksum: schema version `1.0.0`, app version `0.1.0`, SHA-256.
- Media: chưa có media upload thật, `media_count = 0`.
- Import: chưa bật import ghi dữ liệu; chỉ giữ nguyên tắc docs.

### Permission/privacy status

- Download routes kiểm `exports.download` server-side.
- Export admin/internal có thể chứa dữ liệu đầy đủ theo quyền; không dùng làm public export.
- Nếu sau này cần public export, phải dùng privacy service/DTO public-safe.
- Không đưa service role key ra client.

### Script check đã tạo

- `npm run check:export-backup`

### Lệnh đã chạy

- Baseline trước khi sửa: `npm run check:foundation`, `npm run check:auth-permissions`, `npm run check:people`, `npm run check:relationships`, `npm run check:tree-viewer`, `npm run check:tree-editor`, `npm run check:public-privacy`, `npm run typecheck`, `npm run lint`, `npm run build` - PASS
- Phase 8: `npm run check:export-backup`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` - PASS
- Browser route check `/admin/exports`, `/admin/exports/download/json`, `/admin/exports/download/gedcom`, `/admin/exports/download/zip` trên `http://127.0.0.1:3001` - PASS; download routes trả lỗi cấu hình an toàn khi thiếu Supabase config.
- `npm audit --audit-level=moderate` - WARN, còn 2 moderate warnings từ `next`/`postcss`; không chạy force fix vì breaking change ngoài scope.

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa chạy migration trên Supabase thật.
- Chưa ghi `export_jobs`/`backup_records` vào DB runtime.
- Chưa làm import đầy đủ.
- Chưa làm media upload thật.
- Chưa làm export ảnh cây/PDF.
- Chưa kiểm thử với dữ liệu Supabase thật.
- NPM audit còn 2 moderate warnings từ `next`/`postcss`.

### Lưu ý cho AI tiếp theo

- Không bật import ghi dữ liệu nếu chưa có validation, preview, xác nhận và revision/import log.
- Không dùng admin export làm public export.
- Không bỏ `family.json`; GEDCOM không thay thế được JSON vì không giữ đủ dữ liệu riêng của hệ thống.

### Task tiếp theo đề xuất

Phase 9 - Revision history UI foundation.

## 2026-06-15 - Phase 7 Public/private mode foundation completed

### Trạng thái hiện tại

Dự án WEB GIA PHẢ đã có public/private foundation. Public routes dùng privacy service và public-safe DTO, không đưa dữ liệu admin/private thẳng ra client.

### Public/privacy service đã có

- `lib/privacy/privacy-types.ts`
- `lib/privacy/privacy-service.ts`
- `lib/family/public-family-service.ts`

Privacy service có:

- `canShowPersonInMode`
- `toPublicPerson`
- `toFamilyPerson`
- `toAdminPerson`
- `sanitizePersonForMode`
- `sanitizeTreeGraphForMode`

### Public routes đã có

- `/`: public homepage.
- `/tree`: public readonly tree.
- `/people/[slug]`: public-safe person profile.
- `/admin/preview/public`: admin preview mô phỏng public tree.

### Public privacy behavior

- Public mode chỉ hiện người `visibility = public` và chưa xóa mềm.
- `PublicPerson` không có `notes_private`.
- Người còn sống public không hiện ngày sinh đầy đủ, ngày mất, nơi sinh, quê quán, ghi chú riêng tư hoặc dữ liệu nội bộ.
- Public tree được sanitize server-side trước khi truyền vào React Flow viewer.
- Admin preview dùng cùng public service với `/tree`.

### RLS/public query limitation

- Phase 7 không mở RLS public rộng.
- Public service dùng server-side anon Supabase client với query/filter `visibility = public`, `deleted_at is null`.
- Nếu database thật chưa có public-safe RLS policy, public routes có thể empty hoặc báo lỗi an toàn.
- Không dùng service role để build public pages trong Phase 7.

### Script check đã tạo

- `npm run check:public-privacy`

### Lệnh đã chạy

- Baseline: `npm run check:foundation`, `npm run check:auth-permissions`, `npm run check:people`, `npm run check:relationships`, `npm run check:tree-viewer`, `npm run check:tree-editor`, `npm run typecheck`, `npm run lint`, `npm run build` - PASS
- Phase 7: `npm run check:public-privacy`, `npm run typecheck`, `npm run lint`, `npm run build` - PASS
- Browser route check `/`, `/tree`, `/people/test-slug`, `/admin/preview/public` trên `http://127.0.0.1:3001` - PASS; các route render nội dung an toàn khi thiếu Supabase config.

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa kiểm thử public routes với Supabase data thật.
- Chưa tạo public RLS policy/view/function riêng.
- Chưa làm export JSON/GEDCOM/ZIP thật.
- Chưa làm export ảnh/PDF.
- Chưa làm media upload thật.
- NPM audit còn 2 moderate warnings từ `next`/`postcss`.

### Lưu ý cho AI tiếp theo

- Không đưa `notes_private` vào public DTO.
- Không dựa vào CSS/UI để ẩn dữ liệu riêng tư.
- Nếu mở RLS public sau này, phải audit rất kỹ chỉ public-safe fields.
- Public tree/profile hiện dùng anon client; nếu DB policy chưa mở, fail/empty là expected-safe behavior.

### Task tiếp theo đề xuất

Phase 8 - Export/backup foundation:

- JSON export/import foundation.
- GEDCOM/ZIP planning hoặc export foundation.
- Không bỏ qua privacy/permission khi export.

## 2026-06-15 - Phase 6 Tree Editor foundation completed

### Trạng thái hiện tại

Dự án WEB GIA PHẢ đã có Tree Editor foundation trong admin. Editor dùng React Flow, side panel và server actions để lưu layout UI riêng hoặc thêm quan hệ qua service thật.

### Migration/layout persistence đã tạo

- Migration: `db/migrations/20260614_0005_tree_layout_foundation.sql`
- Bảng `tree_layouts`: lưu layout tree theo scope.
- Bảng `tree_layout_nodes`: lưu vị trí node thủ công.
- RLS: `tree.view` đọc layout chưa xóa mềm, `tree.edit_layout` tạo/sửa/xóa mềm layout.
- Layout là dữ liệu UI, không thay thế relationship tables.

### Tree editor đã có

- Route: `/admin/tree/edit`
- Actions: `app/(admin)/admin/tree/edit/actions.ts`
- Layout service: `lib/family/tree-layout-service.ts`
- Components:
  - `components/tree/family-tree-editor.tsx`
  - `components/tree/tree-editor-side-panel.tsx`
  - `components/tree/tree-editor-toolbar.tsx`
- `/admin/tree` vẫn readonly và chỉ thêm link `Chỉnh sửa cây` khi có `tree.edit_layout`.

### Side panel/action status

- Click person node mở side panel.
- Side panel hiển thị họ tên, năm sinh/mất, đời, chi/nhánh, link hồ sơ và quan hệ tóm tắt.
- Có form thêm cha/mẹ, vợ/chồng/bạn đời, con bằng UUID người đã tồn tại.
- Add relationship từ cây dùng relationship service thật.
- Không tạo người mới từ cây trong Phase 6.

### Permission/privacy status

- `/admin/tree/edit` yêu cầu `tree.view` và `tree.edit_layout`.
- Save/reset layout yêu cầu `tree.edit_layout`.
- Add relationship yêu cầu `relationships.create` trong relationship service.
- Client editor không import service role/admin helper.
- Public tree chưa làm.

### Script check đã tạo

- `npm run check:tree-editor`

### Lệnh đã chạy

- Baseline: `npm run check:foundation`, `npm run check:auth-permissions`, `npm run check:people`, `npm run check:relationships`, `npm run check:tree-viewer`, `npm run typecheck`, `npm run lint`, `npm run build` - PASS
- Phase 6: `npm run check:tree-editor`, `npm run typecheck`, `npm run lint`, `npm run build` - PASS
- Browser route check `/admin/tree` trên `http://127.0.0.1:3001` - PASS, hiển thị thiếu cấu hình an toàn khi chưa có Supabase env thật.
- Browser route check `/admin/tree/edit` trên `http://127.0.0.1:3001` - PASS, hiển thị thiếu cấu hình an toàn khi chưa có Supabase env thật.

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa chạy migration trên database thật.
- Chưa kiểm thử editor với Supabase data thật.
- Chưa làm public tree.
- Chưa export ảnh cây/PDF.
- Chưa làm JSON/GEDCOM/ZIP export thật.
- NPM audit còn 2 moderate warnings từ `next`/`postcss`.

### Lưu ý cho AI tiếp theo

- Không trộn layout tree với relationship data.
- Kéo node và lưu layout chỉ ghi `tree_layout_nodes`.
- Add relationship từ cây hiện tạo family unit nền rồi nối người đã tồn tại bằng UUID.
- Nếu thiếu Supabase env thật, `/admin/tree` và `/admin/tree/edit` phải fail an toàn, không dùng mock data.

### Task tiếp theo đề xuất

Phase 7 - Public/private mode foundation:

- Tạo public/internal surfaces.
- Lọc dữ liệu người còn sống và visibility server-side.
- Không chỉ ẩn dữ liệu private bằng UI.

## 2026-06-15 - Phase 5 Tree Viewer foundation completed

### Trạng thái hiện tại

Dự án WEB GIA PHẢ đã có Tree Viewer foundation trong admin. Viewer dùng graph được build từ dữ liệu thật trong `people` và relationship tables, chưa có tree editor hoặc layout persistence.

### Package đã thêm

- `@xyflow/react`
- `elkjs`

### Tree graph/viewer đã có

- Types: `lib/family/tree-types.ts`
- Graph builder: `lib/family/tree-graph-builder.ts`
- Tree service: `lib/family/tree-service.ts`
- ELK layout helper: `lib/family/tree-layout-elk.ts`
- Route: `/admin/tree`
- Components:
  - `components/tree/family-tree-viewer.tsx`
  - `components/tree/family-node-card.tsx`
  - `components/tree/family-tree-toolbar.tsx`
  - `components/tree/family-tree-empty-state.tsx`
  - `components/tree/family-tree-error-state.tsx`

### Graph model

- Node kind: `person`, `family`.
- Edge kind: `family_unit`, `parent_child`, `couple`.
- Family node trung gian gom cha/mẹ và con.
- Node person không chứa `notes_private`.
- Builder có mode `admin`, `internal`, `public`; Phase 5 chỉ dùng admin route.

### Permission/privacy status

- `/admin/tree` yêu cầu `tree.view`.
- Tree service query server-side và trả graph đã build cho client viewer.
- Client viewer không import service role/admin helper.
- Public tree chưa làm trong Phase 5.

### Script check đã tạo

- `npm run check:tree-viewer`

### Lệnh đã chạy

- Baseline: `npm run check:foundation`, `npm run check:auth-permissions`, `npm run check:people`, `npm run check:relationships`, `npm run typecheck`, `npm run lint`, `npm run build` - PASS
- Phase 5: `npm run check:tree-viewer`, `npm run typecheck`, `npm run lint`, `npm run build` - PASS
- Browser route check `/admin/tree` trên `http://127.0.0.1:3001` - PASS, hiển thị thiếu cấu hình an toàn khi chưa có Supabase env thật.

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa kiểm thử viewer với Supabase data thật.
- Chưa làm Tree Editor.
- Chưa lưu layout thủ công.
- Chưa làm public tree.
- Chưa export ảnh cây/PDF.
- Chưa làm export JSON/GEDCOM/ZIP thật.
- NPM audit còn 2 moderate warnings sau khi cài package.

### Lưu ý cho AI tiếp theo

- Không trộn dữ liệu layout cây với dữ liệu quan hệ thật.
- Tree editor/mutation từ cây là Phase 6, chưa có trong viewer.
- Nếu thiếu Supabase env thật, `/admin/tree` phải fail an toàn, không dùng mock data.
- Public tree cần lọc visibility server-side, không chỉ ẩn bằng UI.

### Task tiếp theo đề xuất

Phase 6 - Tree Editor foundation:

- Thêm edit interactions qua service/action có permission rõ ràng.
- Nếu lưu layout, dùng bảng `tree_layouts`, `tree_layout_nodes`, `tree_layout_edges` riêng.
- Không coi kéo node là sửa quan hệ gia phả thật.

## 2026-06-15 - Phase 4 Relationship CRUD foundation completed

### Trạng thái hiện tại

Dự án WEB GIA PHẢ đã có Relationship CRUD foundation trong admin. Relationship data được lưu trong bảng riêng, có permission server-side, RLS, soft delete, revision và cycle check cơ bản.

### Relationship schema đã tạo

- Migration: `db/migrations/20260614_0004_relationship_foundation.sql`
- Bảng `families`: nhóm family với `family_code`, `family_label`, `visibility`, notes, audit và soft delete fields.
- Bảng `family_parents`: nối family với cha/mẹ/người nuôi bằng `parent_role` và `relationship_type`.
- Bảng `family_children`: nối family với con bằng `child_relationship_type`.
- Bảng `couple_relationships`: lưu quan hệ đôi với `relationship_status`, ngày bắt đầu/kết thúc, `visibility`, notes, audit và soft delete fields.

### Service/UI đã có

- `lib/family/relationship-service.ts`: list, summary theo person, create family, add parent/child, create/update couple, soft delete relationship records.
- `lib/family/relationship-graph.ts`: cycle check cha-con cơ bản.
- `lib/family/revision-service.ts`: helper revision dùng chung.
- `/admin/relationships`: danh sách family/couple, form tạo family, thêm cha/mẹ/con, tạo quan hệ đôi.
- `/admin/people/[id]`: có section Quan hệ gia đình.
- Admin nav có link `Quan hệ gia đình`.

### RLS/permission status

- Bật RLS cho `families`, `family_parents`, `family_children`, `couple_relationships`.
- `relationships.view` xem bản ghi chưa xóa mềm.
- `relationships.create` insert.
- `relationships.update`/`relationships.delete` update hoặc xóa mềm.
- Service layer vẫn enforce action-specific permission trước từng mutation.
- Không mở public-wide policy cho relationship tables.

### Script check đã tạo

- `npm run check:relationships`

### Lệnh đã chạy

- Baseline: `npm run check:foundation`, `npm run check:auth-permissions`, `npm run check:people`, `npm run typecheck`, `npm run lint`, `npm run build` - PASS
- Phase 4: `npm run check:relationships`, `npm run typecheck`, `npm run lint`, `npm run build` - PASS
- Browser route check `/admin/relationships` trên `http://127.0.0.1:3001` - PASS
- Browser route check `/admin/people/00000000-0000-0000-0000-000000000000` trên `http://127.0.0.1:3001` - PASS
- `git diff --check` - PASS

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa chạy migration trên database thật.
- Chưa kiểm thử Relationship CRUD với Supabase project thật.
- Chưa làm tree viewer/editor.
- Chưa cài React Flow/ELK trong Phase 4.
- Chưa làm public family tree.
- Chưa làm media upload thật.
- Chưa làm export JSON/GEDCOM/ZIP thật.

### Lưu ý cho AI tiếp theo

- Không thêm `father_id`, `mother_id`, `spouse_id` vào `people`.
- Relationship UI hiện nhập UUID trực tiếp, chưa có autocomplete.
- Nếu thiếu Supabase env thật, relationship routes phải fail an toàn, không dùng mock data.
- Tree viewer/editor và layout graph là phase sau, không nằm trong Phase 4.

### Task tiếp theo đề xuất

Phase 5 - Tree viewer foundation:

- Đọc relationship tables để dựng dữ liệu cây.
- Chỉ cài React Flow/ELK khi phase tree cho phép.
- Không trộn dữ liệu layout cây với dữ liệu quan hệ thật.

## 2026-06-15 - Phase 3 People CRUD foundation completed

### Trạng thái hiện tại

Dự án WEB GIA PHẢ đã có nền quản lý thành viên trong admin. Các route People CRUD foundation đã được tạo, dùng permission server-side và soft delete, chưa làm quan hệ gia đình hoặc cây gia phả.

### People schema đã tạo

- Migration: `db/migrations/20260614_0003_people_foundation.sql`
- Bảng `people` gồm identity, birth/death, place/branch, content/privacy, audit và soft delete fields.
- `visibility`: `public`, `family`, `private`.
- `gender`: `male`, `female`, `other`, `unknown`.
- Date precision: `exact`, `year_month`, `year`, `approximate`, `unknown`.

### Soft delete rule

- Không xóa cứng.
- Soft delete dùng `deleted_at`, `deleted_by`, `delete_reason`.
- Restore xóa các field soft-delete và ghi revision restore.

### Revision status

- Tạo foundation `revisions` và `revision_items`.
- People service ghi revision tối thiểu cho create/update/delete/restore với `before_json`, `after_json`, `changed_by`, `change_reason`.
- Chưa làm UI revision history hoặc restore revision nâng cao.

### RLS status

- Bật RLS cho `people`, `revisions`, `revision_items`.
- `people.view` xem bản ghi chưa xóa mềm.
- `people.create` insert.
- Update policy cho người có `people.update`, `people.delete`, hoặc `people.restore`.
- Service layer vẫn enforce action-specific permission trước từng mutation.
- Không mở public-wide policy cho `people`.

### CRUD route đã có

- `/admin/people`: danh sách, search, filter visibility/is_living.
- `/admin/people/new`: form thêm thành viên.
- `/admin/people/[id]`: xem/sửa, soft delete, restore.

### Script check đã tạo

- `npm run check:people`

### Lệnh đã chạy

- `npm run check:foundation` - PASS
- `npm run check:auth-permissions` - PASS
- `npm run check:people` - PASS
- `npm run typecheck` - PASS
- `npm run lint` - PASS
- `npm run build` - PASS
- Browser route check `/admin/people`, `/admin/people/new`, `/admin/people/[id]` trên `http://127.0.0.1:3001` - PASS

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa chạy migration trên database thật.
- Chưa kiểm thử CRUD với Supabase project thật.
- Chưa làm Relationship CRUD.
- Chưa tạo `families`, `family_parents`, `family_children`, `couple_relationships`.
- Chưa làm cây gia phả.
- Chưa làm media upload thật.
- Chưa làm export JSON/GEDCOM/ZIP thật.

### Lưu ý cho AI tiếp theo

- Không xóa cứng people.
- Không thêm relationship vào `people`.
- Relationship CRUD phải dùng bảng quan hệ riêng ở phase sau.
- Service role vẫn chỉ dùng server-side.
- Nếu chưa có Supabase env thật, People UI phải fail an toàn, không dùng mock data.

### Task tiếp theo đề xuất

Phase 4 - Relationship CRUD foundation:

- Tạo `families`, `family_parents`, `family_children`, `couple_relationships`.
- Gắn permissions `relationships.*`.
- Kiểm tra vòng lặp dữ liệu cơ bản.
- Không làm React Flow/ELK tree viewer nếu chưa sang phase cây.

## 2026-06-14 - Phase 2 Auth + Role Permission hardening completed

### Trạng thái hiện tại

Dự án WEB GIA PHẢ đã có auth/permission foundation server-side. Route `/admin` không còn là placeholder mở; route này yêu cầu user đăng nhập và có permission `people.view`.

### Auth flow đã chọn

- Supabase magic link theo email.
- Login UI tối giản tại `/auth/login`.
- Callback tại `/auth/callback`.
- Logout tại `/auth/logout`.
- Nếu thiếu cấu hình Supabase, login page hiển thị cảnh báo thay vì crash trắng.

### OWNER bootstrap đã chọn

- Không auto OWNER.
- User mới chỉ được bootstrap profile, không tự động có role admin.
- OWNER cần gán thủ công bằng SQL/admin context.
- Snippet: `db/snippets/assign-owner-role.sql`.

### Permission/admin guard

- Permission service server-side:
  - `lib/permissions/permission-service.ts`
  - `lib/permissions/require-permission.ts`
- Profile bootstrap:
  - `lib/auth/profile-service.ts`
- Quyền tối thiểu vào `/admin`: `people.view`.
- Nếu chưa đăng nhập: redirect `/auth/login`.
- Nếu đăng nhập nhưng thiếu quyền: redirect `/unauthorized`.

### Migration đã tạo

- `db/migrations/20260614_0002_auth_permission_hardening.sql`

Migration bổ sung:

- Bật lại RLS cho bảng nền.
- Recreate helper functions `current_profile_id()` và `has_permission(permission_code text)`.
- Cho authenticated user insert/update profile của chính mình.
- Cho user đọc role assignment và role permissions của chính mình.
- Thêm policy quản lý roles/permissions cho người có `permissions.manage`.
- Không mở public rộng cho bảng nhạy cảm.

### Script check đã tạo

- `npm run check:auth-permissions`

### Lệnh đã chạy

- `npm run check:foundation` - PASS
- `npm run check:auth-permissions` - PASS
- `npm run typecheck` - PASS
- `npm run lint` - PASS
- `npm run build` - PASS
- Browser route check `/auth/login`, `/auth/logout`, `/unauthorized`, `/admin` trên `http://127.0.0.1:3001` - PASS

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa tạo `.env` thật.
- Chưa kết nối Supabase project thật.
- Chưa chạy migration trên database thật.
- Chưa kiểm thử magic link với Supabase project thật.
- Chưa làm People CRUD.
- Chưa làm Relationship CRUD.
- Chưa làm cây gia phả.
- Chưa làm export JSON/GEDCOM/ZIP thật.

### Lưu ý cho AI tiếp theo

- Không đưa `SUPABASE_SERVICE_ROLE_KEY` vào client.
- Không tự động cấp OWNER nếu chưa có quyết định mới.
- `/admin` đang dùng `people.view` làm quyền vào cổng quản trị.
- Nếu cần OWNER đầu tiên, dùng `db/snippets/assign-owner-role.sql` sau khi profile đã tồn tại.
- Route guard và permission helper là server-side; không thay bằng kiểm tra UI.

### Task tiếp theo đề xuất

Phase 3 - People CRUD foundation:

- Tạo schema people theo docs.
- Xóa mềm/khôi phục, không xóa cứng.
- List/profile/search/filter thành viên.
- Gắn permission `people.*` vào service layer và UI.
- Không làm quan hệ/cây nếu chưa sang phase sau.

## 2026-06-14 - Phase 1 Project foundation completed

### Trạng thái hiện tại

Dự án WEB GIA PHẢ đã có Next.js App Router foundation, Supabase helper foundation, migration nền roles/permissions và script kiểm tra foundation.

### Stack/code foundation đã có

- Next.js App Router tại root `app/`.
- TypeScript.
- Tailwind CSS.
- ESLint.
- Supabase browser/server/admin helpers.
- Public route `/`.
- Admin placeholder `/admin`.
- Login placeholder `/auth/login`.
- Logout route `/auth/logout`.
- `.env.example`.
- `.gitattributes`.
- `wrangler.toml` placeholder cho Cloudflare.

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

- `db/migrations/20260614_0001_foundation_auth_roles_permissions.sql`

Migration tạo:

- `profiles`
- `roles`
- `permissions`
- `role_permissions`
- `profile_roles`
- seed roles nền
- seed permissions nền
- RLS foundation
- helper functions `current_profile_id()` và `has_permission(permission_code text)`

### Script check đã tạo

- `npm run check:foundation`
- `npm run typecheck`

### Lệnh đã chạy

- `npm run check:foundation` - PASS
- `npm run typecheck` - PASS
- `npm run lint` - PASS
- `npm run build` - PASS
- Browser route check `/`, `/admin`, `/auth/login` trên `http://127.0.0.1:3001` - PASS

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

### Lưu ý cho AI tiếp theo

- Không đưa `SUPABASE_SERVICE_ROLE_KEY` vào client.
- Không bỏ RLS trong migration/schema mới.
- App dùng `app/` root, không dùng `src/`.
- Supabase SSR helper đã có trong `lib/supabase/server.ts`.
- Admin helper `lib/supabase/admin.ts` có `server-only`; không import vào Client Component.

### Task tiếp theo đề xuất

Phase 2 - Auth + Role Permission hardening:

- Kết nối Supabase project thật qua `.env`.
- Hoàn thiện login/logout thật.
- Tạo profile sau đăng nhập.
- Siết RLS/policy theo role permission.
- Thêm kiểm tra schema/permission chi tiết hơn.

## 2026-06-14 - Git baseline completed

### Trạng thái hiện tại

Dự án WEB GIA PHẢ đã có Git repo cục bộ và baseline tài liệu đã được commit.

### Đã hoàn thành

- Khởi tạo Git repo tại `D:\CODE\GIA PHẢ`.
- Tạo `.gitignore` cho Next.js, Supabase và Cloudflare.
- Kiểm tra bộ docs bằng `rg --files`.
- Kiểm tra trailing whitespace.
- Kiểm tra conflict markers.
- Commit baseline docs.

### Commit baseline

- `dd911c9` - docs: initialize gia pha project knowledge base

### Chưa làm

- Chưa push remote.
- Chưa tạo Next.js project.
- Chưa có `package.json`.
- Chưa kết nối Supabase.
- Chưa tạo migration.
- Chưa triển khai code app.

### Task tiếp theo đề xuất

Phase 1 - Project foundation:

- Next.js App Router
- Tailwind/TypeScript/ESLint
- Supabase helper
- Auth cơ bản
- profiles/roles/permissions migration
- RLS nền
- script check schema

## 2026-06-14 - Documentation foundation created

### Trạng thái hiện tại

Dự án WEB GIA PHẢ đã chốt stack và nguyên tắc kiến trúc.
Hiện tại task này chỉ tạo bộ tài liệu nền, chưa triển khai code app.

### Stack chính thức

- Next.js
- Supabase
- Cloudflare
- React Flow
- ELK.js
- Role permission
- Revision history
- Public/private mode
- JSON/GEDCOM/ZIP export bắt buộc từ đầu

### Đã hoàn thành

- Tạo/cập nhật README.md
- Tạo/cập nhật AGENTS.md
- Tạo/cập nhật docs/00_INDEX.md
- Tạo/cập nhật docs/01_PROJECT_OVERVIEW.md
- Tạo/cập nhật docs/02_ARCHITECTURE.md
- Tạo/cập nhật docs/03_DATABASE_MODEL.md
- Tạo/cập nhật docs/04_PERMISSION_PRIVACY_MODEL.md
- Tạo/cập nhật docs/05_TREE_UI_MODEL.md
- Tạo/cập nhật docs/06_EXPORT_BACKUP_MODEL.md
- Tạo/cập nhật docs/07_PHASE_PLAN.md
- Tạo/cập nhật docs/08_AI_WORK_LOG.md
- Tạo/cập nhật docs/09_DECISION_LOG.md

### Chưa làm

- Chưa tạo Next.js project nếu repo chưa có.
- Chưa kết nối Supabase.
- Chưa tạo migration.
- Chưa làm Auth.
- Chưa làm People CRUD.
- Chưa làm cây gia phả.
- Chưa làm export JSON/GEDCOM/ZIP thật.

### Task tiếp theo đề xuất

Phase 1 - Project foundation:

- Next.js App Router
- Tailwind/TypeScript/ESLint
- Supabase helper
- Auth cơ bản
- profiles/roles/permissions migration
- RLS nền
- script check schema

### Lưu ý bắt buộc cho AI tiếp theo

- Đọc README.md
- Đọc AGENTS.md
- Đọc docs/00_INDEX.md
- Đọc phần mới nhất của file này
- Chỉ đọc thêm docs liên quan task
- Không đọc toàn bộ .md nếu task nhỏ
- Không bỏ export/backup khỏi thiết kế
