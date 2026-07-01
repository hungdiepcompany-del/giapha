# A-16Q-DUP-SAVE-FIX - Diagnose and Fix Duplicate Decision Save

Marker: `A-16Q-DUP-SAVE-FIX`

Status: `A16Q_DUP_SAVE_FIX_STATUS=PATCH_DIAGNOSTICS_AND_UI_SAVE_REPAIRED`

## Mục tiêu

Sửa luồng lưu quyết định duplicate staging cho Gia Phả 4. Phase này chỉ cho
owner lưu quyết định vào `import_duplicate_candidates`, không chạy nhập chính
thức và không ghi cây gia phả thật.

## Bối cảnh

- A-16Q-DUP-RLS-VERIFY-UI-WRITE-PASS đã bật UI “Lưu quyết định”.
- Owner bấm lưu nhưng DB vẫn không đổi.
- UI báo chung:
  “Không tìm thấy ứng viên trùng trong phiên nhập này hoặc bạn không có quyền
  truy cập.”
- Owner kiểm tra session `8158711d-1c3c-4208-987d-6fec6a1c5a1a` thấy 8/8
  duplicate vẫn `owner_decision=unresolved`, `decided_by=null`,
  `decided_at=null`, `decision_note=null`.
- 8 duplicate đều `existing_person_id=null`, `match_strength=weak` và
  `match_reason_codes=["same_full_name_in_source_file"]`.

## Nguyên nhân

Luồng PATCH cũ đọc trực tiếp row duplicate trước khi update và gộp trường hợp
không thấy row với không có quyền thành một thông báo chung. Nếu bước đọc này
không thấy row do RLS/column access/session mismatch, UI không biết lỗi là
duplicate không thuộc session hay RLS/update bị chặn.

A-16Q-DUP-SAVE-FIX đổi luồng sang:

1. Đọc duplicate từ review manifest của chính `sessionId`.
2. Nếu `duplicateId` không nằm trong list đó, trả
   `DUPLICATE_DECISION_NOT_IN_SESSION`.
3. Nếu chọn `link_existing` khi `existing_person_id=null`, trả
   `DUPLICATE_DECISION_LINK_EXISTING_REQUIRES_EXISTING_PERSON`.
4. Nếu qua kiểm tra, update `import_duplicate_candidates` bằng filter
   `id + import_session_id`.
5. Nếu update bị RLS/quyền chặn, trả
   `DUPLICATE_DECISION_UPDATE_RLS_DENIED`.

## Diagnostic Codes

- `DUPLICATE_DECISION_INVALID_VALUE`
- `DUPLICATE_DECISION_UNAUTHENTICATED`
- `DUPLICATE_DECISION_FORBIDDEN`
- `DUPLICATE_DECISION_SUPABASE_UNAVAILABLE`
- `DUPLICATE_DECISION_READ_RLS_DENIED`
- `DUPLICATE_DECISION_NOT_IN_SESSION`
- `DUPLICATE_DECISION_LINK_EXISTING_REQUIRES_EXISTING_PERSON`
- `DUPLICATE_DECISION_UPDATE_RLS_DENIED`
- `DUPLICATE_DECISION_UPDATE_NO_ROW_RETURNED`
- `DUPLICATE_DECISION_SAVED`

## API Scope

- PATCH route remains:
  `/api/admin/import-sessions/[sessionId]/duplicates/[duplicateId]`.
- PATCH only updates `import_duplicate_candidates`.
- PATCH only updates `owner_decision`, `decided_by`, `decided_at` and
  `decision_note`.
- PATCH keeps the filter `.eq("id", input.duplicateId)` and
  `.eq("import_session_id", input.sessionId)`.
- Allowed decisions remain:
  `create_new`, `ignore_candidate`, `needs_review`, `unresolved`,
  `link_existing`.
- `link_existing` remains invalid when `existing_person_id=null`.

## UI Scope

- UI still sends `ownerDecision` and `decisionNote`.
- UI hides the “Liên kết với người đã có” option when `existingPersonId` is
  missing.
- UI shows either success or error, not both.
- UI displays diagnostic code only for errors.
- UI does not auto choose a decision for owner.

## Locks

- Duplicate unresolved remains owner-driven; current evidence still has
  `duplicate_unresolved=8`.
- `unresolved` and `needs_review` still block the future official import gate.
- `canRunOfficialImport=false`.
- Official import button remains disabled.
- No RPC call.
- No POST `/official-import`.
- No SQL run, no DB push, no migration repair and no seed.
- No writes to `people`, `relationships`, `families`, `layout`, `tree`,
  `revision` or `profile`.
- No deploy and no push.

## Owner Retest

Owner should retest one row by selecting a valid non-link decision such as
`create_new`, `ignore_candidate` or `needs_review`, then verify the row updates
in `import_duplicate_candidates`. Do not choose `link_existing` for these 8 rows
because `existing_person_id=null`.
