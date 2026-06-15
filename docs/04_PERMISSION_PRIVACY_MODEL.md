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

## Phase 4 relationship permission model

- `/admin/relationships` yêu cầu `relationships.view`.
- Relationship forms chỉ hiển thị khi có `relationships.create`.
- Soft delete family, parent edge, child edge và couple relationship yêu cầu `relationships.delete`.
- Service layer kiểm tra permission server-side trước mọi mutation.
- Relationship data nằm trong `families`, `family_parents`, `family_children`, `couple_relationships`; không thêm `father_id`, `mother_id`, `spouse_id` vào `people`.
- Cycle check cha-con chạy trong service trước khi thêm parent/child edge.
- RLS các bảng relationship không mở public rộng trong Phase 4.
- Public tree/viewer sẽ là phase riêng và phải lọc `visibility` server-side.

## Phase 5 tree viewer permission model

- `/admin/tree` yêu cầu `tree.view`.
- Tree service query server-side bằng admin helper, sau đó build graph đã lọc trước khi trả cho client viewer.
- Tree node không chứa `notes_private`.
- Phase 5 chỉ có viewer, không có mutation trên cây nên không dùng `tree.edit_layout`.
- Public tree chưa làm; builder chỉ chuẩn bị option `public` để phase sau lọc visibility server-side.

## Phase 6 tree editor permission model

- `/admin/tree/edit` yêu cầu cả `tree.view` và `tree.edit_layout`.
- Lưu/reset vị trí node yêu cầu `tree.edit_layout`.
- Thêm cha/mẹ/vợ/chồng/con từ side panel dùng relationship service thật và yêu cầu `relationships.create`.
- Editor không tạo người mới; chỉ nhận UUID người đã tồn tại.
- Kéo node chỉ thay đổi `tree_layout_nodes`, không sửa quan hệ thật.
- Layout persistence không chứa `notes_private` hoặc dữ liệu hồ sơ nhạy cảm.
- Public tree vẫn chưa làm trong Phase 6.

## Phase 7 public/private foundation

- Public mode dùng `lib/privacy/privacy-service.ts`.
- `PublicPerson` không có `notes_private`.
- Người còn sống ở public mode không hiện `birth_date` đầy đủ, `death_date`, `birth_place`, `home_town`, ghi chú riêng tư hoặc dữ liệu nội bộ.
- Public mode chỉ hiện người có `visibility = public` và chưa bị xóa mềm.
- Public tree `/tree` dùng graph đã sanitize trước khi truyền vào client component.
- Public profile `/people/[slug]` dùng DTO public-safe.
- Admin preview `/admin/preview/public` dùng cùng public service với `/tree`.
- Phase 7 không mở RLS public rộng. Public service dùng server-side anon client và query/filter chặt `visibility = public`, `deleted_at is null`; nếu database chưa có public-safe RLS policy thì route fail/empty an toàn.
- Không dùng service role để build public pages trong Phase 7.

## Phase 8 export/backup permission model

- `/admin/exports` yêu cầu `exports.download` để hiển thị file backup.
- Route download `/admin/exports/download/json`, `/admin/exports/download/gedcom` và `/admin/exports/download/zip` kiểm quyền server-side.
- Full admin export có thể chứa dữ liệu đầy đủ theo quyền admin; không được dùng làm public export.
- Public export không được tự động lộ `notes_private`; nếu cần public export riêng sau này phải dùng privacy service và DTO public-safe.
- `export_jobs` và `backup_records` bật RLS, chỉ người có `exports.download` được đọc và `exports.create` được tạo record.
- `imports.create` chỉ là quyền nền; Phase 8 chưa bật import ghi dữ liệu.
