# AI Work Log

## 2026-06-14 - Git baseline

### Phase

Step 0 - Git baseline

### Việc đã làm

- Khởi tạo Git repo tại `D:\CODE\GIA PHẢ`.
- Tạo `.gitignore` phù hợp cho Next.js, Supabase và Cloudflare.
- Kiểm tra lại bộ docs hiện có.
- Commit baseline docs.
- Cập nhật handoff sau baseline Git.

### File đã tạo/cập nhật

- .gitignore
- docs/08_AI_WORK_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Commit đã tạo

- `dd911c9` - docs: initialize gia pha project knowledge base

### Kiểm tra

- git rev-parse --is-inside-work-tree
- rg --files
- rg -n "[ \t]+$" README.md AGENTS.md docs
- rg -n "^(<<<<<<<|=======|>>>>>>>)" README.md AGENTS.md docs
- git status --short
- git diff --check

### Ghi chú

- Chưa push remote.
- Chưa tạo code app.
- Chưa tạo package.json.
- Chưa tạo migration.
- Task tiếp theo đề xuất: Phase 1 - Project foundation.

## 2026-06-14 - Docs foundation

### Phase

Documentation foundation

### Việc đã làm

- Tạo bộ tài liệu nền cho dự án WEB GIA PHẢ.
- Tạo README.md, AGENTS.md và docs/*.md.
- Ghi stack chính thức.
- Ghi quy tắc làm việc cho AI coding.
- Ghi phase plan ban đầu.
- Ghi nguyên tắc export JSON/GEDCOM/ZIP bắt buộc từ đầu.

### File đã tạo/cập nhật

- README.md
- AGENTS.md
- docs/00_INDEX.md
- docs/01_PROJECT_OVERVIEW.md
- docs/02_ARCHITECTURE.md
- docs/03_DATABASE_MODEL.md
- docs/04_PERMISSION_PRIVACY_MODEL.md
- docs/05_TREE_UI_MODEL.md
- docs/06_EXPORT_BACKUP_MODEL.md
- docs/07_PHASE_PLAN.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Kiểm tra

- git diff --check

### Ghi chú

- Chưa triển khai code app.
- Chưa tạo migration.
- Chưa cài package.
- Thư mục hiện tại chưa phải Git repo tại thời điểm tạo tài liệu.
