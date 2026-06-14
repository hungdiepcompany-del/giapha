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
- Export/backup layer

## Server/client boundary

- Service role chỉ dùng server.
- Client chỉ dùng anon key.
- Query private phải lọc ở server/RLS, không chỉ ẩn bằng UI.
- Không hardcode secret trong client bundle.
- API server phải áp dụng permission và privacy filter trước khi trả dữ liệu.

## Deploy

- Cloudflare là mục tiêu deploy chính.
- Chi tiết deploy sẽ bổ sung ở phase sau.

