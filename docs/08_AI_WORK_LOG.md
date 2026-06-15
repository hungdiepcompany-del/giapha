# AI Work Log

## 2026-06-15 - Phase 4 Relationship CRUD foundation

### Phase

Phase 4 - Relationship CRUD foundation

### Việc đã làm

- Tạo migration `families`, `family_parents`, `family_children`, `couple_relationships`.
- Bật RLS cho các bảng relationship và policy theo `relationships.*`.
- Tách revision helper dùng chung tại `lib/family/revision-service.ts`.
- Tạo relationship types, validation, graph cycle helper và service server-side.
- Tạo server actions cho create family, add parent/child, create couple và soft delete.
- Tạo route `/admin/relationships`.
- Tích hợp section quan hệ gia đình vào `/admin/people/[id]`.
- Tạo components `RelationshipForm`, `CoupleForm`, `RelationshipSummary`.
- Thêm menu admin `Quan hệ gia đình`.
- Tạo script `check:relationships`.

### File đã tạo/cập nhật

- README.md
- package.json
- app/(admin)/admin/page.tsx
- app/(admin)/admin/people/[id]/page.tsx
- app/(admin)/admin/relationships/actions.ts
- app/(admin)/admin/relationships/page.tsx
- components/layout/admin-shell.tsx
- components/relationships/relationship-form.tsx
- components/relationships/couple-form.tsx
- components/relationships/relationship-summary.tsx
- lib/family/revision-service.ts
- lib/family/relationship-types.ts
- lib/family/relationship-validation.ts
- lib/family/relationship-graph.ts
- lib/family/relationship-service.ts
- lib/family/people-service.ts
- db/migrations/20260614_0004_relationship_foundation.sql
- scripts/check-relationship-foundation.cjs
- docs/03_DATABASE_MODEL.md
- docs/04_PERMISSION_PRIVACY_MODEL.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration đã tạo

- db/migrations/20260614_0004_relationship_foundation.sql

### Script check đã tạo

- `check:relationships`: chạy `node scripts/check-relationship-foundation.cjs`

### Quyết định kỹ thuật

- Relationship schema dùng bảng riêng, không thêm `father_id`, `mother_id`, `spouse_id` vào `people`.
- Soft delete relationship bằng `deleted_at`, `deleted_by`, `delete_reason`.
- Revision helper dùng chung cho people và relationship entities.
- Cycle check cha-con chạy ở service layer trước khi thêm edge.

### Lệnh đã chạy

- git status --short
- git log --oneline -5
- npm run check:foundation
- npm run check:auth-permissions
- npm run check:people
- npm run typecheck
- npm run lint
- npm run build
- npm run check:relationships
- Browser route check `/admin/relationships`
- Browser route check `/admin/people/00000000-0000-0000-0000-000000000000`

### Kết quả

- PASS: baseline `npm run check:foundation`
- PASS: baseline `npm run check:auth-permissions`
- PASS: baseline `npm run check:people`
- PASS: baseline `npm run typecheck`
- PASS: baseline `npm run lint`
- PASS: baseline `npm run build`
- PASS: `npm run check:relationships`
- PASS: Phase 4 `npm run typecheck`
- PASS: Phase 4 `npm run lint`
- PASS: Phase 4 `npm run build`
- PASS: Browser route check cho `/admin/relationships`
- PASS: Browser route check cho `/admin/people/[id]` giả

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa chạy migration trên database thật.
- Chưa kiểm thử CRUD relationship với Supabase project thật.
- Chưa làm tree viewer/editor.
- Chưa thêm React Flow/ELK vào Phase 4.
- Chưa làm media upload thật.
- Chưa làm export JSON/GEDCOM/ZIP thật.

### Task tiếp theo đề xuất

- Phase 5 - Tree viewer foundation.

## 2026-06-15 - Phase 3 People CRUD foundation

### Phase

Phase 3 - People CRUD foundation

### Việc đã làm

- Tạo migration bảng `people`.
- Tạo revision foundation tối thiểu cho people với `revisions` và `revision_items`.
- Bật RLS cho `people`, `revisions`, `revision_items`.
- Tạo TypeScript types cho people.
- Tạo validator thủ công cho people input.
- Tạo people service server-side.
- Tạo server actions cho create/update/soft delete/restore.
- Tạo route `/admin/people`.
- Tạo route `/admin/people/new`.
- Tạo route `/admin/people/[id]`.
- Tạo component `PersonForm` và `PersonList`.
- Thêm menu admin tối giản: Tổng quan, Thành viên.
- Tạo script `check:people`.

### File đã tạo/cập nhật

- README.md
- package.json
- app/(admin)/admin/page.tsx
- app/(admin)/admin/people/actions.ts
- app/(admin)/admin/people/page.tsx
- app/(admin)/admin/people/new/page.tsx
- app/(admin)/admin/people/[id]/page.tsx
- components/layout/admin-shell.tsx
- components/people/person-form.tsx
- components/people/person-list.tsx
- lib/family/people-types.ts
- lib/family/people-validation.ts
- lib/family/people-service.ts
- db/migrations/20260614_0003_people_foundation.sql
- scripts/check-people-foundation.cjs
- docs/03_DATABASE_MODEL.md
- docs/04_PERMISSION_PRIVACY_MODEL.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration đã tạo

- db/migrations/20260614_0003_people_foundation.sql

### Script check đã tạo

- `check:people`: chạy `node scripts/check-people-foundation.cjs`

### Quyết định kỹ thuật

- People schema: một bảng `people` độc lập, chưa tạo relationship tables.
- Soft delete: dùng `deleted_at`, `deleted_by`, `delete_reason`; không xóa cứng.
- Revision: ghi tối thiểu vào `revisions` với before/after JSON cho people actions.
- RLS: bật từ đầu; service layer enforce action-specific permissions.

### Lệnh đã chạy

- git status --short
- git log --oneline -5
- npm run check:foundation
- npm run check:auth-permissions
- npm run typecheck
- npm run lint
- npm run build
- npm run check:people
- Browser route check `/admin/people`
- Browser route check `/admin/people/new`
- Browser route check `/admin/people/00000000-0000-0000-0000-000000000000`

### Kết quả

- PASS: baseline `npm run check:foundation`
- PASS: baseline `npm run check:auth-permissions`
- PASS: baseline `npm run typecheck` sau khi build tái tạo `.next/types`
- PASS: baseline `npm run lint`
- PASS: baseline `npm run build`
- PASS: `npm run check:people`
- PASS: Phase 3 `npm run typecheck`
- PASS: Phase 3 `npm run lint`
- PASS: Phase 3 `npm run build`
- PASS: Browser route check cho `/admin/people`, `/admin/people/new`, `/admin/people/[id]`

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa chạy migration trên database thật.
- Chưa kiểm thử CRUD với Supabase project thật.
- Chưa làm Relationship CRUD.
- Chưa làm cây gia phả.
- Chưa làm media upload thật.
- Chưa làm export JSON/GEDCOM/ZIP thật.

### Task tiếp theo đề xuất

- Phase 4 - Relationship CRUD foundation.

## 2026-06-14 - Phase 2 Auth + Role Permission hardening

### Phase

Phase 2 - Auth + Role Permission hardening

### Việc đã làm

- Chọn auth flow nền bằng Supabase magic link.
- Tạo UI đăng nhập email tối giản tại `/auth/login`.
- Tạo auth callback route `/auth/callback`.
- Cập nhật logout route `/auth/logout` để hỗ trợ GET/POST và không crash khi thiếu session.
- Tạo profile bootstrap service server-side.
- Tạo permission service server-side.
- Tạo `requirePermission()` cho route guard.
- Guard `/admin` bằng quyền `people.view`.
- Tạo page `/unauthorized` có reason và link điều hướng.
- Hiển thị email, roles và permission summary trong admin shell.
- Tạo migration hardening RLS/policies Phase 2.
- Tạo SQL snippet gán OWNER thủ công.
- Tạo script `check:auth-permissions`.

### File đã tạo/cập nhật

- README.md
- package.json
- app/(admin)/admin/page.tsx
- app/auth/login/page.tsx
- app/auth/callback/route.ts
- app/auth/logout/route.ts
- app/unauthorized/page.tsx
- components/auth/login-form.tsx
- components/layout/admin-shell.tsx
- lib/auth/profile-service.ts
- lib/permissions/permission-service.ts
- lib/permissions/require-permission.ts
- lib/supabase/client.ts
- lib/supabase/server.ts
- lib/supabase/admin.ts
- db/migrations/20260614_0002_auth_permission_hardening.sql
- db/snippets/assign-owner-role.sql
- scripts/check-auth-permissions.cjs
- docs/04_PERMISSION_PRIVACY_MODEL.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Package đã thêm

- Không thêm package mới trong Phase 2.

### Migration đã tạo

- db/migrations/20260614_0002_auth_permission_hardening.sql

### Script check đã tạo

- `check:auth-permissions`: chạy `node scripts/check-auth-permissions.cjs`

### Quyết định kỹ thuật

- Auth flow: Supabase magic link theo email.
- OWNER bootstrap: không auto OWNER; gán thủ công bằng SQL/admin context.
- Quyền tối thiểu vào `/admin`: `people.view`.

### Lệnh đã chạy

- git status --short
- git log --oneline -5
- npm run check:foundation
- npm run typecheck
- npm run lint
- npm run build
- npm run check:auth-permissions
- Browser route check `/auth/login`
- Browser route check `/auth/logout`
- Browser route check `/unauthorized`
- Browser route check `/admin`

### Kết quả

- PASS: baseline `npm run check:foundation`
- PASS: baseline `npm run typecheck`
- PASS: baseline `npm run lint`
- PASS: baseline `npm run build`
- PASS: `npm run check:auth-permissions`
- PASS: Phase 2 `npm run typecheck`
- PASS: Phase 2 `npm run lint`
- PASS: Phase 2 `npm run build`
- PASS: Browser route check cho `/auth/login`, `/auth/logout`, `/unauthorized`, `/admin`

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

### Task tiếp theo đề xuất

- Phase 3 - People CRUD foundation.

## 2026-06-14 - Phase 1 Project foundation

### Phase

Phase 1 - Project foundation

### Việc đã làm

- Tạo Next.js App Router foundation ở root `app/`.
- Bật TypeScript, Tailwind CSS và ESLint theo scaffold Next.js.
- Tạo route nền `/`, `/admin`, `/auth/login`, `/auth/logout`.
- Tạo `PublicShell` và `AdminShell` tối giản.
- Tạo Supabase helper foundation cho client, server và admin.
- Tạo type nền cho auth, permission, privacy và family.
- Tạo `.env.example`.
- Tạo `.gitattributes` để giảm cảnh báo CRLF về sau.
- Tạo `wrangler.toml` placeholder cho Cloudflare, chưa deploy.
- Tạo migration nền cho `profiles`, `roles`, `permissions`, `role_permissions`, `profile_roles`.
- Bật RLS trong migration và tạo policy nền an toàn.
- Tạo script `check:foundation`.

### File đã tạo/cập nhật

- README.md
- package.json
- package-lock.json
- tsconfig.json
- next.config.ts
- eslint.config.mjs
- postcss.config.mjs
- app/layout.tsx
- app/globals.css
- app/(public)/page.tsx
- app/(admin)/admin/page.tsx
- app/auth/login/page.tsx
- app/auth/logout/route.ts
- components/layout/public-shell.tsx
- components/layout/admin-shell.tsx
- components/ui/.gitkeep
- lib/supabase/client.ts
- lib/supabase/server.ts
- lib/supabase/admin.ts
- lib/auth/auth-types.ts
- lib/permissions/permission-types.ts
- lib/permissions/permission-constants.ts
- lib/privacy/privacy-types.ts
- lib/family/family-types.ts
- db/migrations/20260614_0001_foundation_auth_roles_permissions.sql
- scripts/check-project-foundation.cjs
- .env.example
- .gitattributes
- wrangler.toml
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

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

- db/migrations/20260614_0001_foundation_auth_roles_permissions.sql

### Script check đã tạo

- `check:foundation`: chạy `node scripts/check-project-foundation.cjs`
- `typecheck`: chạy `tsc --noEmit`

### Lệnh đã chạy

- git status --short
- git log --oneline -5
- npx create-next-app@latest tmp-next-app --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm --yes
- npm install @supabase/supabase-js @supabase/ssr
- npm install --package-lock-only
- npm run check:foundation
- npm run typecheck
- npm run lint
- npm run build
- Browser check `http://127.0.0.1:3001/`
- Browser check `http://127.0.0.1:3001/admin`
- Browser check `http://127.0.0.1:3001/auth/login`

### Kết quả

- PASS: `npm run check:foundation`
- PASS: `npm run typecheck`
- PASS: `npm run lint`
- PASS: `npm run build`
- PASS: Browser route check cho `/`, `/admin`, `/auth/login`

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa tạo `.env` thật.
- Chưa kết nối Supabase project thật.
- Chưa làm People CRUD.
- Chưa làm Relationship CRUD.
- Chưa làm cây gia phả.
- Chưa làm export JSON/GEDCOM/ZIP thật.

### Task tiếp theo đề xuất

- Phase 2 - Auth + Role Permission hardening.

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
