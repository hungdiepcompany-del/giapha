# WEB GIA PHẢ

WEB GIA PHẢ là dự án xây dựng hệ thống web gia phả dùng lâu dài, chi phí thấp, có khả năng vận hành bền vững nhiều năm và ưu tiên bảo vệ dữ liệu gia phả trong dài hạn.

## Mục tiêu dự án

- Quản lý thông tin thành viên gia đình, dòng họ, chi nhánh và đời thứ.
- Hỗ trợ thêm, sửa, xóa mềm và khôi phục dữ liệu gia phả.
- Hiển thị cây gia phả tương tác, có thể mở rộng thành chế độ chỉnh sửa trực tiếp.
- Có phân quyền, lịch sử chỉnh sửa và chế độ public/private.
- Bắt buộc có export JSON/GEDCOM/ZIP từ đầu để bảo vệ dữ liệu lâu dài.

## Stack chính thức

- Next.js
- Supabase Auth
- Supabase Postgres
- Supabase Storage
- Cloudflare Pages/Workers
- React Flow
- ELK.js
- Role permission
- Revision history
- Public/private mode
- JSON/GEDCOM/ZIP export

## Nguyên tắc dữ liệu sống lâu dài

Supabase là hệ thống vận hành. JSON/GEDCOM/ZIP là lớp bảo vệ dữ liệu lâu dài.

Dự án không được thiết kế để khóa dữ liệu trong Supabase. Dữ liệu phải luôn xuất được ra JSON/GEDCOM/ZIP.

Không được khóa dữ liệu gia phả trong database, UI hoặc dịch vụ cloud. Khi cần chuyển hệ thống, phục hồi, kiểm tra hoặc lưu trữ độc lập, dữ liệu phải có thể xuất ra định dạng mở và gói backup đầy đủ.

## Cách đọc tài liệu dự án

Bắt đầu từ [docs/00_INDEX.md](docs/00_INDEX.md). AI và lập trình viên chỉ cần đọc file liên quan đến task, không cần đọc toàn bộ tài liệu mỗi lần.

Tài liệu nên đọc trước khi làm việc:

- [AGENTS.md](AGENTS.md): quy tắc làm việc cho AI coding.
- [docs/99_NEXT_AI_HANDOFF.md](docs/99_NEXT_AI_HANDOFF.md): trạng thái mới nhất và việc tiếp theo.
- File trong `docs/` liên quan trực tiếp đến task.

## Chạy local

Sau Phase 1, repo đã có Next.js App Router foundation. Tạo `.env` cục bộ từ `.env.example` nếu cần kết nối Supabase thật, sau đó chạy:

```bash
npm install
npm run dev
```

Các route nền hiện có:

- `/`: public home an toàn cho chế độ public/private.
- `/tree`: cây gia phả public readonly.
- `/people/[slug]`: hồ sơ public đã lọc riêng tư.
- `/admin`: admin placeholder có guard `people.view`.
- `/auth/login`: magic link login foundation.
- `/auth/callback`: Supabase Auth callback.
- `/auth/logout`: logout route.
- `/unauthorized`: permission denied page.
- `/admin/people`: danh sách thành viên.
- `/admin/people/new`: thêm thành viên.
- `/admin/people/[id]`: chi tiết/sửa thành viên.
- `/admin/relationships`: quản lý family, cha/mẹ/con và quan hệ đôi nền.
- `/admin/tree`: xem cây gia phả bằng dữ liệu people và relationship tables.
- `/admin/tree/edit`: chỉnh sửa layout cây và thêm quan hệ từ cây.
- `/admin/preview/public`: preview public mode cho admin.
- `/admin/exports`: tải family.json, family.ged và full-backup.zip.
- `/admin/revisions`: xem lịch sử chỉnh sửa.
- `/admin/revisions/[id]`: xem diff trước/sau của một revision.

## Deploy

Cloudflare là mục tiêu deploy chính. Phase 1 đã tạo `wrangler.toml` placeholder an toàn, chưa deploy và chưa cấu hình secret thật.

## Lệnh kiểm tra tiêu chuẩn

Khi dự án có code, chạy:

```bash
npm run check:foundation
npm run check:auth-permissions
npm run check:people
npm run check:relationships
npm run check:tree-viewer
npm run check:tree-editor
npm run check:public-privacy
npm run check:export-backup
npm run check:revisions
npm run typecheck
npm run lint
npm run build
```

Task tài liệu có thể chỉ cần:

```bash
git diff --check
git status --short
```
