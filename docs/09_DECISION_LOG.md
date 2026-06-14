# Decision Log

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
