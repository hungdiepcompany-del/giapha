# A-16Q-LOCAL-UI - Guided Localhost Import UI Smoke and Gate Copy Refresh

Marker: `A-16Q-LOCAL-UI`

Status: `A16Q_LOCAL_UI_STATUS=SAFE_SKIP_MISSING_AUTH_GATE_COPY_REFRESHED`

## Scope

A-16Q-LOCAL-UI kiểm tra local UI tại `http://localhost:3001/admin/exports/import`, ghi nhận trạng thái smoke read-only và làm mới copy cổng nhập chính thức.

Ranh giới:

- Không bấm `Xác nhận nhập chính thức`.
- Không gọi POST `/official-import`.
- Không gọi RPC `public.a16p_tx_execute_giapha4_official_import`.
- Không chạy SQL, DB push, migration repair hoặc seed.
- Không ghi `people`, `relationships`, `families`, `layout`, `tree`, `revision` hoặc `profile` thật.
- Không deploy, không push.
- Không commit Excel, secret, env hoặc storage state.
- Không log raw personal rows; chỉ ghi count, row number, code và status.

## Guided Browser Smoke Result

Manual browser check bằng in-app browser:

- URL: `http://localhost:3001/admin/exports/import`.
- Result: `SAFE_SKIP_MISSING_AUTH`.
- Page loaded successfully, but UI displayed: `Bạn cần đăng nhập để kiểm tra nhập dữ liệu.`
- Session id: `UNKNOWN`.
- Total staging members: `UNKNOWN`.
- Total staging relationships: `UNKNOWN`.
- Preview sample members: `UNKNOWN`.
- Preview sample relationships: `UNKNOWN`.
- Validation errors: `UNKNOWN`.
- Warnings: `UNKNOWN`.
- Dry-run blockers: `UNKNOWN`.
- Duplicate candidates: `UNKNOWN`.
- Official import gate/button state: not readable because auth gate blocked the import panel.

Scripted smoke:

- `npm run smoke:a16q-local-ui-import-guided`.
- The script now prefers Chrome logged-in access through CDP:
  `A16Q_LOCAL_UI_CDP_URL=http://127.0.0.1:9222` and
  `A16Q_LOCAL_UI_BASE_URL=http://localhost:3001`.
- It uses `chromium.connectOverCDP`, reuses the existing Chrome context/page, and does not read or save cookies, localStorage, tokens, profile data or storage state.
- Current scripted result: `SAFE_SKIP_BROWSER_RUNTIME_UNAVAILABLE` because Playwright runtime is not available in this checkout.
- If Playwright runtime is available but Chrome CDP is not, the script returns `SAFE_SKIP_MISSING_CHROME_CDP`.
- If CDP reaches Chrome but the import page lacks auth/roles, the script returns `SAFE_SKIP_MISSING_AUTH`.

If owner logs into localhost and reopens this phase, rerun browser smoke after the authenticated page shows the import panel. Owner may select the Gia Phả 4 Excel manually; Codex must not use automated file chooser upload for personal files unless the prompt explicitly authorizes it.

## Gate Copy Refresh

Old gate copy was stale because it still pointed to A-16P/A-16N readiness:

- `APPROVE_A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE`.
- `A-16N chỉ là cổng khóa read-only`.
- `Thiếu marker tương lai APPROVE_A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE`.

New gate copy reflects the current state:

- A-16P runtime candidate has been prepared.
- A-16P-TX transaction helper has been manually applied and verified PASS.
- Official import still has not run.
- A session-specific execution approval is required before any real import.
- Required next marker form:
  `APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_<SESSION_ID>`.
- Required conditions include exact session id, validation errors = 0, dry-run blockers = 0, rollback reviewed and audit reviewed.
- UI button remains disabled.

## Safety Status

Official import remains locked:

- `canRunOfficialImport=false`.
- `canOpenOfficialImport=false`.
- `officialImportEnabled=false`.
- UI button disabled.
- No script calls RPC.
- No script calls POST official import.
