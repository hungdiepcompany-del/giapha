# Database model

## Nguyên tắc

Không dùng model đơn giản `parent_id`/`spouse_id` trực tiếp trong `people` vì không đủ cho gia phả thật.

Lý do:

- Nhiều vợ/chồng.
- Con riêng.
- Con nuôi.
- Không rõ cha/mẹ.
- Tái hôn.
- Quan hệ cần nguồn xác minh.
- Cần lịch sử chỉnh sửa.

## Bảng nền

### profiles

- Mục đích: Lưu hồ sơ người dùng đăng nhập và liên kết với Supabase Auth.
- Trường chính dự kiến: `id`, `auth_user_id`, `display_name`, `email`, `avatar_url`, `status`, `created_at`, `updated_at`.
- Bảo mật/RLS: Chỉ chủ tài khoản và role được cấp quyền mới xem/sửa thông tin nhạy cảm.

### roles

- Mục đích: Định nghĩa vai trò hệ thống như OWNER, ADMIN, EDITOR.
- Trường chính dự kiến: `id`, `code`, `name`, `description`, `created_at`.
- Bảo mật/RLS: Chỉ OWNER/ADMIN được quản lý.

### permissions

- Mục đích: Định nghĩa quyền chi tiết theo hành động.
- Trường chính dự kiến: `id`, `code`, `name`, `description`, `created_at`.
- Bảo mật/RLS: Chỉ OWNER/ADMIN được quản lý.

### role_permissions

- Mục đích: Gán permissions vào roles.
- Trường chính dự kiến: `id`, `role_id`, `permission_id`, `created_at`.
- Bảo mật/RLS: Chỉ OWNER/ADMIN được cập nhật.

### profile_roles

- Mục đích: Gán roles cho profile.
- Trường chính dự kiến: `id`, `profile_id`, `role_id`, `created_at`, `created_by`.
- Bảo mật/RLS: Chỉ người có `permissions.manage` được cập nhật.

## Bảng gia phả

### people

- Mục đích: Lưu hồ sơ cá nhân của thành viên gia phả.
- Trường chính hiện có Phase 3: `id`, `slug`, `full_name`, `display_name`, `gender`, `birth_date`, `birth_date_precision`, `death_date`, `death_date_precision`, `is_living`, `birth_place`, `home_town`, `branch_name`, `generation_number`, `short_bio`, `notes_private`, `visibility`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`, `delete_reason`.
- Bảo mật/RLS: Bật RLS. Người có `people.view` xem bản ghi chưa xóa mềm. Mutations đi qua server service và kiểm tra `people.create`, `people.update`, `people.delete`, `people.restore`. Không xóa cứng.
- Ghi chú: `visibility` hỗ trợ `public`, `family`, `private`; `gender` hỗ trợ `male`, `female`, `other`, `unknown`; date precision hỗ trợ `exact`, `year_month`, `year`, `approximate`, `unknown`.

### families

- Mục đích: Gom nhóm đơn vị gia đình để biểu diễn cha/mẹ/con và nguồn xác minh.
- Trường chính hiện có Phase 4: `id`, `family_code`, `family_label`, `visibility`, `notes`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`, `delete_reason`.
- Bảo mật/RLS: Bật RLS. Người có `relationships.view` xem bản ghi chưa xóa mềm. Insert cần `relationships.create`; update/delete mềm cần `relationships.update` hoặc `relationships.delete`.
- Ghi chú: Đây là đơn vị gia đình dùng để nối nhiều cha/mẹ với nhiều con, không thay thế bảng `people`.

### family_parents

- Mục đích: Lưu cha/mẹ hoặc người nuôi trong một family.
- Trường chính hiện có Phase 4: `id`, `family_id`, `person_id`, `parent_role`, `relationship_type`, `sort_order`, `notes`, audit fields và soft delete fields.
- Bảo mật/RLS: Cần quyền `relationships.view` để xem, `relationships.create` để thêm, `relationships.update`/`relationships.delete` để cập nhật hoặc xóa mềm.
- Ghi chú: `parent_role` hỗ trợ `father`, `mother`, `parent`, `unknown`; `relationship_type` hỗ trợ `biological`, `adoptive`, `step`, `guardian`, `unknown`.

### family_children

- Mục đích: Lưu con trong một family, bao gồm con ruột, con nuôi, con riêng.
- Trường chính hiện có Phase 4: `id`, `family_id`, `person_id`, `child_relationship_type`, `sort_order`, `notes`, audit fields và soft delete fields.
- Bảo mật/RLS: Cần quyền quan hệ; không xóa cứng.
- Ghi chú: `child_relationship_type` hỗ trợ `biological`, `adoptive`, `step`, `foster`, `unknown`.

### couple_relationships

- Mục đích: Lưu quan hệ vợ/chồng, hôn nhân, tái hôn hoặc quan hệ bạn đời có nguồn xác minh.
- Trường chính hiện có Phase 4: `id`, `person1_id`, `person2_id`, `relationship_status`, `start_date`, `start_date_precision`, `end_date`, `end_date_precision`, `family_id`, `visibility`, `notes`, audit fields và soft delete fields.
- Bảo mật/RLS: Public chưa được mở trong Phase 4; admin service kiểm quyền `relationships.*`.
- Ghi chú: Có constraint không cho một người tự tạo quan hệ đôi với chính mình; active unique index dùng cặp `least/person1`, `greatest/person2` và `relationship_status`.

### events

- Mục đích: Lưu sự kiện gia phả như sinh, mất, kết hôn, ly hôn, di cư, giỗ tổ.
- Trường chính dự kiến: `id`, `person_id`, `family_id`, `event_type`, `event_date`, `place`, `description`, `privacy_level`, `source_id`, `created_at`.
- Bảo mật/RLS: Sự kiện nhạy cảm phải lọc theo privacy.

### media_assets

- Mục đích: Lưu metadata ảnh, tài liệu và file liên quan thành viên/nguồn.
- Trường chính dự kiến: `id`, `storage_path`, `file_name`, `mime_type`, `size_bytes`, `owner_person_id`, `privacy_level`, `created_at`, `created_by`.
- Bảo mật/RLS: Storage và metadata phải có policy; file riêng tư không được public URL tùy tiện.

### sources

- Mục đích: Lưu nguồn xác minh cho thông tin gia phả.
- Trường chính dự kiến: `id`, `title`, `source_type`, `description`, `citation`, `media_asset_id`, `created_at`.
- Bảo mật/RLS: Nguồn có tài liệu cá nhân phải lọc theo privacy.

## Bảng cây UI

### tree_layouts

- Mục đích: Lưu cấu hình layout cây theo chế độ hoặc nhánh.
- Trường chính hiện có Phase 6: `id`, `layout_code`, `layout_name`, `layout_scope`, `is_default`, `description`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`, `delete_reason`.
- Bảo mật/RLS: Người có `tree.view` xem layout chưa xóa mềm. Người có `tree.edit_layout` tạo/sửa/xóa mềm layout.
- Ghi chú: `layout_scope` hỗ trợ `admin`, `family`, `public`, `custom`. Layout là dữ liệu UI, không phải dữ liệu quan hệ gia phả.

### tree_layout_nodes

- Mục đích: Lưu vị trí, trạng thái thu gọn và metadata UI của node.
- Trường chính hiện có Phase 6: `id`, `layout_id`, `node_id`, `node_kind`, `person_id`, `family_id`, `x`, `y`, `is_locked`, `is_collapsed`, `style_json`, audit fields và soft delete fields.
- Bảo mật/RLS: Không chứa dữ liệu gia phả nhạy cảm; chỉ chứa dữ liệu UI. Đọc cần `tree.view`; ghi cần `tree.edit_layout`.
- Ghi chú: Có unique index partial trên `(layout_id, node_id)` cho bản ghi chưa xóa mềm.

### tree_layout_edges

- Mục đích: Lưu tùy chỉnh UI cho edge nếu cần.
- Trường chính dự kiến: `id`, `layout_id`, `relationship_ref`, `edge_type`, `style_json`, `updated_at`.
- Bảo mật/RLS: Không thay thế bảng quan hệ thật; chỉ bổ sung hiển thị.

## Bảng lịch sử

### revisions

- Mục đích: Ghi nhận một đợt thay đổi dữ liệu.
- Trường chính Phase 3/4: `id`, `entity_type`, `entity_id`, `action`, `before_json`, `after_json`, `changed_by`, `changed_at`, `change_reason`.
- Bảo mật/RLS: Cần quyền `revisions.view`; restore cần `revisions.restore`.
- Ghi chú Phase 4: revision helper dùng chung ghi before/after JSON cho `people`, `families`, `family_parents`, `family_children`, `couple_relationships`.
- Ghi chú Phase 9: đã có UI đọc list/detail và diff cơ bản tại `/admin/revisions`; không tạo migration mới và chưa bật restore thật.

### revision_items

- Mục đích: Lưu trước/sau của từng trường hoặc entity trong một revision.
- Trường chính Phase 3: `id`, `revision_id`, `field_name`, `before_json`, `after_json`, `created_at`.
- Bảo mật/RLS: Có thể chứa dữ liệu nhạy cảm nên không public.
- Ghi chú Phase 9: detail page hiển thị `revision_items` nếu có; hiện các service ghi revision chủ yếu dùng `before_json`/`after_json` ở bảng `revisions`.

## Bảng export/backup

### export_jobs

- Mục đích: Theo dõi job export JSON/GEDCOM/ZIP.
- Trường chính Phase 8: `id`, `export_type`, `status`, `file_name`, `file_mime_type`, `file_size_bytes`, `checksum`, `record_count`, `media_count`, `created_at`, `created_by`, `error_message`, `metadata_json`.
- Bảo mật/RLS: Chỉ người có `exports.create`/`exports.download` được thao tác.
- Ghi chú: `export_type` hỗ trợ `family_json`, `gedcom`, `media_zip`, `full_backup_zip`, `manifest`. `status` hỗ trợ `pending`, `running`, `completed`, `failed`.

### backup_records

- Mục đích: Lưu lịch sử backup, manifest và checksum.
- Trường chính Phase 8: `id`, `backup_type`, `schema_version`, `app_version`, `file_name`, `checksum`, `people_count`, `relationship_count`, `media_count`, `created_at`, `created_by`, `notes`, `metadata_json`.
- Bảo mật/RLS: Backup có thể chứa toàn bộ dữ liệu nên chỉ OWNER/ADMIN được tải.
- Ghi chú: Migration `20260614_0006_export_backup_foundation.sql` đã tạo bảng và RLS nền, chưa chạy trên Supabase thật trong Phase 8.
