# Kiến trúc hệ thống

## Stack

- Next.js App Router
- Supabase Auth
- Supabase Postgres
- Supabase Storage
- Cloudflare Pages/Workers
- React Flow
- ELK.js

## Luồng chính

- Public site
- Admin app
- Supabase Auth
- Database service layer
- Permission layer
- Privacy layer
- Tree graph builder
- Tree viewer layout layer
- Tree editor layout persistence layer
- Export/backup layer

## Server/client boundary

- Service role chỉ dùng server.
- Client chỉ dùng anon key.
- Query private phải lọc ở server/RLS, không chỉ ẩn bằng UI.
- Không hardcode secret trong client bundle.
- API server phải áp dụng permission và privacy filter trước khi trả dữ liệu.
- Tree service chạy server-side và chỉ trả graph đã lọc quyền/privacy cho client viewer.
- React Flow viewer là client component; không import service role/admin helper.
- ELK layout trong Phase 5 chạy ở client helper để phục vụ auto layout/reset layout của viewer.
- Tree editor action gửi dữ liệu lên server action; layout service server-side ghi `tree_layouts`/`tree_layout_nodes`.
- Kéo node trên React Flow chỉ thay đổi layout UI, không sửa relationship tables.

## Deploy

- Cloudflare là mục tiêu deploy chính.
- Chi tiết deploy sẽ bổ sung ở phase sau.
