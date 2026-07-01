# PLAN A-16I4 - Real Gia Phả 4 Staging Upload Run

Marker: `A-16I4`

## Mục tiêu

A-16I4 chạy hoặc chuẩn bị chạy lại smoke upload file Gia Phả 4 thật vào staging sau khi owner đã xác nhận A-16SQL RLS staging write PASS. Nếu thiếu env rõ ràng, smoke phải safe-skip và báo đúng blocker, không tự dùng file thật trong repo.

## Phạm vi an toàn

- Không tạo migration, không DB push, không dry-run DB push, không SQL apply.
- Không seed, không deploy, không push.
- Không nhập chính thức, không tạo route/action xác nhận nhập.
- Không ghi `people/person` thật, không ghi quan hệ thật, không ghi layout/tree/revision.
- Không dùng service role để bypass RLS.
- Không commit file Excel thật, storage state, cookie, token, secret hoặc screenshot chứa dữ liệu thật.

## Env bắt buộc để chạy smoke thật

- `A16I2_GIAPHA4_REAL_UPLOAD_BASE_URL`
- `A16I2_GIAPHA4_REAL_UPLOAD_STORAGE_STATE`
- `A16I2_GIAPHA4_REAL_FILE_PATH`

Nếu thiếu một trong các biến trên, smoke trả `SAFE_SKIP_MISSING_EXPLICIT_ENV`.

## Reason code khi blocked

Smoke phải phân loại lỗi chính:

- `AUTH_SESSION_MISSING`
- `PERMISSION_IMPORTS_CREATE_MISSING`
- `RLS_STAGING_WRITE_BLOCKED`
- `PARSER_HEADER_MISSING`
- `PARSER_SHEET_MISSING`
- `PARSER_UNSUPPORTED_XLS`
- `NETWORK_OR_BASE_URL_ERROR`
- `UNKNOWN_UPLOAD_ERROR`

## Dữ liệu cần chứng minh khi PASS

- Có `session_id` staging.
- Có số người staging và số quan hệ staging.
- Có số lỗi, cảnh báo và thông tin từ validation.
- Có dry-run preview summary nhưng `can_proceed_to_official_import=false`.
- Không phát hiện mutation nguy hiểm ngoài endpoint upload staging đã cho phép.

## Trạng thái DB do owner cung cấp

Owner đã chạy SQL A-16SQL bằng Supabase Dashboard và xác nhận:

- RLS enabled trên năm bảng staging.
- Authenticated SELECT/INSERT policy trên năm bảng staging.
- Authenticated UPDATE chỉ trên `import_sessions`.
- Không có anon/public staging policy.
- `imports.create` tồn tại.
- Không có policy A-16SQL trên bảng gia phả thật.

## Kết quả

`A16I4_STATUS=REAL_STAGING_UPLOAD_SMOKE_READY_OR_SAFE_SKIP`

## Kiểm tra

- `npm run smoke:a16i2-real-giapha4-upload-staging`
- `npm run check:a16i4-real-giapha4-staging-upload-run`
- Các checker A-16 hiện có vẫn phải PASS.
