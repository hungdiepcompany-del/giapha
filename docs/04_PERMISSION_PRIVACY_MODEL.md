# Permission & Privacy model

## Roles

- OWNER
- ADMIN
- EDITOR
- CONTRIBUTOR
- FAMILY_VIEWER
- PUBLIC_VIEWER

## Permissions nền

- people.view
- people.create
- people.update
- people.delete
- people.restore
- relationships.view
- relationships.create
- relationships.update
- relationships.delete
- tree.view
- tree.edit_layout
- media.view
- media.upload
- media.delete
- revisions.view
- revisions.restore
- exports.create
- exports.download
- imports.create
- settings.manage
- permissions.manage

## Public/private mode

Người còn sống mặc định riêng tư.

Public không được hiện:

- ngày sinh đầy đủ
- địa chỉ
- số điện thoại
- email
- ảnh riêng tư
- ghi chú nội bộ
- tài liệu cá nhân

Public chỉ nên hiện an toàn:

- họ tên hoặc tên hiển thị
- đời thứ
- chi/nhánh nếu được public
- trạng thái còn sống

## RLS

- Bật RLS cho bảng nhạy cảm.
- Không đưa service role key ra client.
- Không đưa dữ liệu private về client rồi chỉ ẩn bằng UI.
- Không đưa file riêng tư lên public URL nếu chưa được phép.
- Không đưa revision có dữ liệu nhạy cảm cho public.
- Không đưa backup/full export cho user không có quyền.
- Không đưa API write cho PUBLIC_VIEWER.
- Server/API phải lọc đúng quyền.
- Không dựa vào UI để ẩn dữ liệu private.

## Phase 2 auth/permission hardening

- Auth flow nền dùng Supabase magic link theo email.
- Auth callback tạo profile server-side nếu user đã đăng nhập nhưng chưa có profile.
- Không tự động cấp OWNER cho user đầu tiên.
- OWNER được gán thủ công bằng SQL/admin context sau khi xác minh danh tính.
- User mới không được cấp quyền admin mặc định.
- Quyền tối thiểu để vào `/admin` là `people.view`.
- Nếu thiếu cấu hình Supabase, helper phải fail an toàn và không cấp quyền mặc định.
- Admin guard kiểm tra quyền server-side, không chỉ ẩn bằng UI.
- Phase 2 chưa làm People CRUD, Relationship CRUD, cây gia phả hoặc export thật.

## Phase 3 people permission model

- `/admin/people` yêu cầu `people.view`.
- `/admin/people/new` yêu cầu `people.create`.
- `/admin/people/[id]` yêu cầu `people.view`; form sửa chỉ hoạt động khi có `people.update`.
- Soft delete yêu cầu `people.delete`.
- Restore yêu cầu `people.restore`.
- Service layer kiểm tra permission server-side trước mọi mutation.
- RLS bảng `people` không mở public rộng; public people profile sẽ là phase sau.
- Trường `notes_private` không được dùng cho public output.
