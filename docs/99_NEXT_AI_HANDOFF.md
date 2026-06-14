# Next AI Handoff

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
