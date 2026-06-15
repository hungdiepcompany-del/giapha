# Decision Log

## Decision 021 - Public pages dùng DTO public-safe

Chọn:

Phase 7 tạo `PublicPerson` và privacy service để sanitize dữ liệu trước khi render public pages.

Lý do:

- Không dựa vào CSS/UI để ẩn dữ liệu nhạy cảm.
- Đảm bảo `notes_private` không xuất hiện trong DTO public.
- Người còn sống được bảo vệ mặc định ở public mode.

## Decision 022 - Chưa mở RLS public rộng trong Phase 7

Chọn:

Public service dùng server-side anon Supabase client với query/filter `visibility = public`, `deleted_at is null`, nhưng không tạo policy public rộng mới trong Phase 7.

Lý do:

- Tránh mở nhầm dữ liệu private trước khi có audit RLS public đầy đủ.
- Nếu database thật chưa có public-safe policy, public route fail hoặc empty an toàn.
- Không dùng service role để lách RLS cho public pages.

## Decision 019 - Layout cây lưu riêng với dữ liệu gia phả thật

Chọn:

Phase 6 tạo `tree_layouts` và `tree_layout_nodes` để lưu vị trí node thủ công.

Lý do:

- Kéo node là thao tác UI, không phải thay đổi quan hệ cha/mẹ/con/vợ/chồng.
- Giữ nguyên nguyên tắc không trộn dữ liệu layout cây với dữ liệu gia phả thật.
- Cho phép reset layout về auto layout mà không ảnh hưởng dữ liệu quan hệ.

## Decision 020 - Tree Editor add relationship đi qua service thật

Chọn:

Side panel editor gọi server actions rồi dùng relationship service hiện có để thêm cha/mẹ, vợ/chồng hoặc con.

Lý do:

- Không tạo edge React Flow giả che lỗi.
- Giữ permission, validation, cycle check và revision ở service layer.
- Phase 6 chưa tạo người mới từ cây; chỉ nối người đã tồn tại bằng UUID.

## Decision 016 - Chọn `@xyflow/react` cho Tree Viewer

Chọn:

Phase 5 dùng `@xyflow/react` thay vì package `reactflow` cũ.

Lý do:

- `@xyflow/react` là package hiện đại của React Flow.
- Phù hợp yêu cầu viewer có zoom, pan, fit view, custom node và toolbar.
- Không cần thêm package UI nặng ngoài scope.

## Decision 017 - ELK layout chạy trong client viewer ở Phase 5

Chọn:

`lib/family/tree-layout-elk.ts` dùng `elkjs` để layout graph trong client viewer.

Lý do:

- Viewer cần reset layout/fit view tương tác mà không tạo persistence layout.
- Không đưa service role/admin helper vào client; client chỉ nhận graph đã lọc từ tree service.
- Nếu ELK lỗi, helper trả graph gốc để route không crash trắng.

## Decision 018 - Tree viewer dùng family node trung gian

Chọn:

Graph builder tạo node `family` trung gian để nối cha/mẹ với con, bên cạnh node `person`.

Lý do:

- Gia phả thật có thể có nhiều cha/mẹ và nhiều con trong một family.
- Tránh render quá nhiều edge person-to-person gây rối khi có tái hôn, con nuôi hoặc con riêng.
- Giữ dữ liệu quan hệ thật tách khỏi dữ liệu layout UI.

## Decision 013 - Relationship CRUD dùng bảng quan hệ riêng

Chọn:

Phase 4 tạo `families`, `family_parents`, `family_children`, `couple_relationships` thay vì thêm `father_id`, `mother_id`, `spouse_id` vào `people`.

Lý do:

- Giữ đúng mô hình gia phả thật có nhiều cha/mẹ nuôi, con riêng, tái hôn và nhiều quan hệ đôi.
- Không trộn hồ sơ cá nhân với cấu trúc quan hệ.
- Chuẩn bị tốt hơn cho tree viewer/layout ở phase sau.

## Decision 014 - Relationship dùng soft delete và revision chung

Chọn:

Relationship records dùng `deleted_at`, `deleted_by`, `delete_reason` và ghi revision before/after JSON qua helper `logRevision()`.

Lý do:

- Phù hợp quyết định không xóa cứng dữ liệu gia phả.
- Cho phép truy vết ai đã thêm/xóa family edge hoặc couple relationship.
- Tách revision helper khỏi people service để dùng chung lâu dài.

## Decision 015 - Cycle check cha-con ở service layer Phase 4

Chọn:

Phase 4 kiểm vòng lặp tổ tiên trong `relationship-service` trước khi thêm parent/child edge.

Lý do:

- Chặn lỗi dữ liệu cơ bản trước khi có graph/tree UI phức tạp.
- Không cần thêm package ngoài scope Phase 4.
- Có thể nâng cấp sang constraint hoặc graph validation sâu hơn ở phase cây.

## Decision 010 - People CRUD dùng soft delete bắt buộc

Chọn:

Bảng `people` không xóa cứng. Xóa thành viên chỉ cập nhật `deleted_at`, `deleted_by`, `delete_reason`.

Lý do:

- Gia phả dễ bị sửa/xóa nhầm và cần khả năng khôi phục.
- Phù hợp nguyên tắc dữ liệu sống lâu dài.
- Cho phép ghi revision delete/restore rõ ràng.

## Decision 011 - Revision people ghi before/after JSON tối thiểu

Chọn:

Tạo `revisions` và `revision_items` foundation trong Phase 3, service people ghi `before_json` và `after_json` ở mức entity.

Lý do:

- Đủ để truy vết create/update/delete/restore ở Phase 3.
- Chưa cần diff từng field hoàn chỉnh trước khi có workflow review/restore nâng cao.
- Không bỏ qua thiết kế revision history đã chốt từ đầu.

## Decision 012 - Chưa tạo relationship tables trong People CRUD

Chọn:

Phase 3 chỉ tạo `people`, không tạo `families`, `family_parents`, `family_children` hoặc `couple_relationships`.

Lý do:

- Giữ đúng scope People CRUD.
- Tránh trộn hồ sơ cá nhân với quan hệ gia phả thật.
- Relationship CRUD sẽ có phase riêng để xử lý cha/mẹ/con/vợ/chồng đúng mô hình.

## Decision 007 - Dùng magic link cho auth foundation

Chọn:

Supabase magic link theo email cho Phase 2.

Lý do:

- Không cần hardcode tài khoản hoặc mật khẩu.
- Phù hợp foundation khi chưa có signup/admin onboarding UI hoàn chỉnh.
- Callback `/auth/callback` có thể bootstrap profile và kiểm tra quyền server-side.
- Nếu thiếu env Supabase, login page hiển thị trạng thái thiếu cấu hình thay vì crash trắng.

## Decision 008 - Không tự động cấp OWNER

Chọn:

Không auto OWNER cho user đầu tiên. OWNER được gán thủ công bằng SQL/admin context sau khi xác minh danh tính.

Lý do:

- Tránh tự cấp quyền cao chỉ vì thứ tự đăng nhập.
- Phù hợp nguyên tắc không mở quyền rộng trong phase foundation.
- Có SQL snippet `db/snippets/assign-owner-role.sql` để vận hành thủ công khi cần.

## Decision 009 - Quyền tối thiểu vào `/admin` là `people.view`

Chọn:

Route `/admin` yêu cầu permission `people.view`.

Lý do:

- Admin foundation là cổng vào các module vận hành gia phả, không phải trang settings hệ thống thuần túy.
- `people.view` đủ hẹp để chặn user chưa có role, nhưng không yêu cầu quyền quản trị cao như `settings.manage`.
- Các hành động nhạy cảm hơn sẽ cần permission riêng ở phase sau.

## Decision 005 - Dùng cấu trúc App Router ở root `app/`

Chọn:

Giữ Next.js App Router tại root `app/`, không dùng `src/`.

Lý do:

- Khớp trực tiếp với prompt Phase 1 và cấu trúc thư mục đã yêu cầu.
- Dễ đọc cho AI trong các phase tiếp theo.
- Giảm một lớp đường dẫn khi tra route public/admin/auth.

## Decision 006 - Dùng `@supabase/ssr` cho helper client/server

Chọn:

Sử dụng `@supabase/ssr` cùng `@supabase/supabase-js`.

Lý do:

- Phù hợp App Router và cookie-based auth ở server.
- Tách rõ client anon key, server client và admin service role.
- Giữ `SUPABASE_SERVICE_ROLE_KEY` trong helper server-only, không đưa ra client.

## Decision 001 - Chọn stack chính thức

Chọn:

Next.js + Supabase + Cloudflare + React Flow + ELK.js.

Lý do:

- Next.js phù hợp web nhiều trang public/admin.
- Supabase phù hợp Auth/Postgres/Storage.
- Cloudflare phù hợp deploy chi phí thấp.
- React Flow phù hợp cây tương tác/chỉnh sửa trên UI.
- ELK.js phù hợp auto layout sơ đồ/cây phức tạp.

## Decision 002 - Export JSON/GEDCOM/ZIP bắt buộc từ đầu

Lý do:

- Mục tiêu dữ liệu sống lâu dài.
- Không khóa dữ liệu trong Supabase.
- Có thể chuyển hệ thống sau này.
- Có thể phục hồi khi cloud/database gặp vấn đề.

## Decision 003 - Không dùng parent_id/spouse_id đơn giản trong people

Lý do:

- Gia phả thật có nhiều vợ/chồng, con riêng, con nuôi, tái hôn.
- Cần nguồn xác minh và revision history.
- Cần tách quan hệ khỏi hồ sơ cá nhân.

## Decision 004 - Không xóa cứng dữ liệu gia phả

Lý do:

- Gia phả dễ bị sửa/xóa nhầm.
- Cần khôi phục.
- Cần lưu lịch sử thay đổi.
