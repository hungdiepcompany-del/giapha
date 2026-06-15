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
- Public-safe family service
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
- Public routes dùng server-side anon Supabase client và privacy service để sanitize trước khi render.
- Tree service chạy server-side và chỉ trả graph đã lọc quyền/privacy cho client viewer.
- React Flow viewer là client component; không import service role/admin helper.
- ELK layout trong Phase 5 chạy ở client helper để phục vụ auto layout/reset layout của viewer.
- Tree editor action gửi dữ liệu lên server action; layout service server-side ghi `tree_layouts`/`tree_layout_nodes`.
- Kéo node trên React Flow chỉ thay đổi layout UI, không sửa relationship tables.
- Public pages không nhận `notes_private` hoặc dữ liệu admin chưa lọc.
- Export/backup service chạy server-side, kiểm `exports.download` hoặc `exports.create` trước khi query dữ liệu.
- Route download export trả attachment server-side; không ghi file tạm xuống disk và không đưa service role ra client.

## Export/backup layer

- `lib/family/export-collector.ts`: thu thập dữ liệu thật từ people, relationships và tree layouts.
- `lib/family/json-exporter.ts`: build `family.json` với manifest schema version `1.0.0`.
- `lib/family/gedcom-exporter.ts`: build GEDCOM foundation để chuyển dữ liệu sang phần mềm gia phả khác.
- `lib/family/zip-backup-exporter.ts`: build `full-backup.zip` gồm JSON, GEDCOM, manifest và checksums.
- `lib/family/checksum.ts`: SHA-256 helper cho file export/backup.
- `/admin/exports`: UI admin tải backup.

## Deploy

- Cloudflare là mục tiêu deploy chính.
- Chi tiết deploy sẽ bổ sung ở phase sau.
