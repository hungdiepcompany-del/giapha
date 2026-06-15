# Next AI Handoff

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
