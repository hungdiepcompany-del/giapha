# Smoke test checklist

Checklist này dùng sau khi user đã cấu hình `.env.local`, chạy migration thật và gán OWNER thủ công. Không dùng checklist này để thay thế test tự động.

## Phase 12 snapshot

Real Supabase smoke test đã được user xác nhận PASS ở mức chính:

- Google OAuth login hoạt động.
- User đã thêm người thật vào database thật.
- Các route/chức năng smoke test chính OK.
- PKCE issue trước đó tự hết, xem như transient browser/cookie/origin issue nếu không tái diễn.
- Chi tiết mốc baseline nằm ở `docs/12_REAL_SUPABASE_SMOKE_TEST_REPORT.md`.

Các mục chưa có bằng chứng chi tiết trong Phase 12 vẫn để `NOT_CONFIRMED` trong report thay vì tự đánh dấu PASS.

## Auth

- [ ] `/auth/login` mở được
- [ ] Gửi magic link được
- [ ] `/auth/callback` hoạt động
- [ ] `/auth/logout` hoạt động

## OWNER

- [ ] User login lần đầu tạo profile
- [ ] Gán OWNER bằng SQL snippet
- [ ] `/admin` vào được sau khi có quyền `people.view`

## People

- [ ] Tạo thành viên
- [ ] Sửa thành viên
- [ ] Xóa mềm
- [ ] Restore

## Relationships

- [ ] Thêm cha
- [ ] Thêm mẹ
- [ ] Thêm vợ/chồng
- [ ] Thêm con
- [ ] Không tạo được vòng lặp sai

## Tree

- [ ] `/admin/tree` render được
- [ ] `/admin/tree/edit` mở được
- [ ] Click node mở side panel
- [ ] Kéo node không crash
- [ ] Lưu layout nếu có quyền

## Public/privacy

- [ ] `/tree` public mở được
- [ ] Người còn sống không lộ thông tin nhạy cảm
- [ ] `notes_private` không hiện public

## Export/import

- [ ] Tải `family.json`
- [ ] Tải `family.ged`
- [ ] Tải `full-backup.zip`
- [ ] Import preview `family.json`
- [ ] Confirm import vẫn disabled

## Revision

- [ ] `/admin/revisions` mở được
- [ ] Detail revision mở được
- [ ] Restore vẫn disabled

## Evidence cần ghi lại

- Ngày giờ smoke test
- Browser dùng để test
- Supabase project đã dùng
- User/email test đã đăng nhập
- Lỗi còn lại nếu có
