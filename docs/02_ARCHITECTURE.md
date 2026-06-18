# Kiến trúc hệ thống

## Phase 15B service boundary readiness

- Main Web Worker giữ UI public/admin, auth callback, people CRUD nhẹ, relationship CRUD nhẹ và tree viewer/editor nhẹ.
- Export/import/media/PDF/image/backup nặng là ứng viên tách service worker sau này, không nhét lâu dài vào main app.
- Phase 15B chưa tách Worker thật, chưa tạo Cloudflare service thật và chưa deploy.
- Boundary chi tiết nằm ở `docs/15_SERVICE_BOUNDARY_WORKER_SPLIT.md`.
- UI nên đi qua adapter/client layer khi gọi tác vụ nặng để sau này đổi từ local function sang HTTP/service binding.


## Runtime Worker guardrail and service-boundary roadmap

- `docs/RUNTIME_WORKER_GUARDRAIL.md` là luật cố định để tránh main Cloudflare/OpenNext Worker phình to.
- `docs/SERVICE_BOUNDARY_ROADMAP.md` là roadmap chia trách nhiệm giữa main app Worker, backup service, export service, import service, media service và data-quality service candidate.
- Main app Worker mặc định chỉ giữ UI, auth, CRUD nhẹ, permission/privacy filter, tree viewer/editor nhẹ và API coordination nhẹ.
- ZIP/GEDCOM/export lớn, import validation lớn, media processing, backup/restore production và data-quality scan lớn phải được đánh giá service boundary trước khi triển khai.
- Không tạo service Worker mới nếu chưa có boundary doc, route contract, env/secret contract, smoke plan, rollback/deploy plan và owner approval.

## Phase 11 Supabase integration gate

- `scripts/check-env-safe.cjs`: kiểm `.env.example` và `.env.local` theo trạng thái present/missing, không in giá trị secret.
- `scripts/check-migrations-order.cjs`: kiểm migration order/prefix/conflict marker trước khi chạy Supabase thật.
- `/admin/system/status`: status route server-side, yêu cầu `settings.manage` hoặc `permissions.manage`, chỉ hiển thị yes/no cho env config.
- Phase 11 không chạy migration production, không deploy và không push.

## Phase 10 import JSON preview layer

- `lib/family/import-types.ts`: type cho summary, issues, conflicts và preview result.
- `lib/family/json-import-validator.ts`: parse/validate `family.json` schema `1.0.0`, references và vòng tổ tiên, không dùng DB.
- `lib/family/json-import-preview-service.ts`: kiểm quyền, gọi validator và kiểm conflict DB server-side nếu có config.
- `/admin/exports/import`: form upload/paste JSON, validation và conflict report an toàn, chưa import thật.
- Import validator là pure TypeScript để có thể kiểm cấu trúc file ngay cả khi Supabase thiếu cấu hình.

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
- Revision history UI layer
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
- Revision pages chạy server-side, kiểm `revisions.view` trước khi đọc audit trail.
- Revision restore trong Phase 9 chỉ là placeholder disabled, không ghi đè dữ liệu.
- Export/backup service chạy server-side, kiểm `exports.download` hoặc `exports.create` trước khi query dữ liệu.
- Route download export trả attachment server-side; không ghi file tạm xuống disk và không đưa service role ra client.

## Export/backup layer

- `lib/family/export-collector.ts`: thu thập dữ liệu thật từ people, relationships và tree layouts.
- `lib/family/json-exporter.ts`: build `family.json` với manifest schema version `1.0.0`.
- `lib/family/gedcom-exporter.ts`: build GEDCOM foundation để chuyển dữ liệu sang phần mềm gia phả khác.
- `lib/family/zip-backup-exporter.ts`: build `full-backup.zip` gồm JSON, GEDCOM, manifest và checksums.
- `lib/family/checksum.ts`: SHA-256 helper cho file export/backup.
- `/admin/exports`: UI admin tải backup.

## Revision history layer

- `lib/family/revision-service.ts`: ghi revision và đọc list/detail cho UI.
- `lib/family/revision-types.ts`: type nền cho revision list/detail/filter.
- `lib/family/revision-diff.ts`: so sánh JSON before/after ở mức field cơ bản.
- `/admin/revisions`: danh sách lịch sử chỉnh sửa có filter.
- `/admin/revisions/[id]`: chi tiết revision, before/after JSON và diff field.

## Deploy

- Cloudflare là mục tiêu deploy chính.
- Chi tiết deploy sẽ bổ sung ở phase sau.
