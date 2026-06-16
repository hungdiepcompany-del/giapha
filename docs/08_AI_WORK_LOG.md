# AI Work Log

## 2026-06-16 - Phase 13 UI Polish Foundation

### Phase

Phase 13 - UI Polish Foundation

### Việc đã làm

- Tạo UI primitives nhẹ: page header, section card, empty state, status callout và action link.
- Polish admin shell: nav rõ hơn, active route rõ hơn, user/role/permission context gọn hơn.
- Polish public shell và homepage: hero rõ hơn, CTA xem cây/đăng nhập, giải thích public/private.
- Polish login page: phân biệt Google OAuth và magic link, không đổi callback/auth logic.
- Polish people list và person form: bảng dễ đọc hơn, form chia nhóm thông tin.
- Polish relationship page: giải thích family, cha mẹ/con, quan hệ đôi và hướng dẫn UUID.
- Polish tree viewer/editor: header hướng dẫn, toolbar rõ hơn, empty state thân thiện.
- Polish export/import: nhấn mạnh `family.json` là backup chính, GEDCOM là tương thích, ZIP có manifest/checksum, import preview chưa ghi DB.
- Tạo `scripts/check-ui-polish-foundation.cjs` và script `check:ui-polish`.

### File đã tạo/cập nhật

- package.json
- scripts/check-ui-polish-foundation.cjs
- components/ui/action-link.tsx
- components/ui/empty-state.tsx
- components/ui/page-header.tsx
- components/ui/section-card.tsx
- components/ui/status-callout.tsx
- components/layout/admin-shell.tsx
- components/layout/public-shell.tsx
- components/public/public-home.tsx
- components/public/public-tree-shell.tsx
- components/public/public-person-profile.tsx
- components/people/person-list.tsx
- components/people/person-form.tsx
- components/tree/family-tree-toolbar.tsx
- components/tree/tree-editor-toolbar.tsx
- components/tree/family-tree-empty-state.tsx
- app/auth/login/page.tsx
- app/(admin)/admin/page.tsx
- app/(admin)/admin/people/page.tsx
- app/(admin)/admin/people/new/page.tsx
- app/(admin)/admin/relationships/page.tsx
- app/(admin)/admin/tree/page.tsx
- app/(admin)/admin/tree/edit/page.tsx
- app/(admin)/admin/exports/page.tsx
- app/(admin)/admin/exports/import/page.tsx
- docs/05_TREE_UI_MODEL.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration đã tạo

- Không tạo migration.

### Package đã thêm

- Không thêm package.

### Ghi chú

- Không sửa schema, RLS, auth callback, import confirm hoặc revision restore.
- Không chạy lại migrations 0001-0006.
- Không push remote.
- Baseline Supabase thật từ Phase 12 vẫn giữ nguyên.

## 2026-06-16 - Phase 12 Real Supabase Smoke Test Report & Stable Baseline

### Phase

Phase 12 - Real Supabase Smoke Test Report & Stable Baseline

### Việc đã làm

- Tạo `docs/12_REAL_SUPABASE_SMOKE_TEST_REPORT.md`.
- Ghi nhận user-confirmed real Supabase smoke test PASS ở mức chính.
- Ghi nhận Google OAuth login đã hoạt động.
- Ghi nhận user đã thêm người thật vào database thật.
- Ghi nhận main routes/functions smoke test chính OK theo xác nhận của user.
- Ghi nhận PKCE issue trước đó là transient nếu không tái diễn.
- Ghi rõ không chạy lại toàn bộ migration 0001-0006 sau khi đã có dữ liệu thật nếu chưa review.
- Ghi rõ import confirm thật và revision restore thật vẫn chưa làm.
- Cập nhật index, setup, checklist, handoff và decision log cho baseline trước UI polish.

### File đã tạo/cập nhật

- README.md
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/10_SUPABASE_SETUP.md
- docs/11_SMOKE_TEST_CHECKLIST.md
- docs/12_REAL_SUPABASE_SMOKE_TEST_REPORT.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration đã tạo

- Không tạo migration.

### Package/script thay đổi

- Không thay đổi package hoặc script.

### Kiểm tra

- `npm.cmd run check:env:safe`
- `npm.cmd run check:migrations`
- `npm.cmd run check:foundation`
- `npm.cmd run check:auth-permissions`
- `npm.cmd run check:people`
- `npm.cmd run check:relationships`
- `npm.cmd run check:tree-viewer`
- `npm.cmd run check:tree-editor`
- `npm.cmd run check:public-privacy`
- `npm.cmd run check:export-backup`
- `npm.cmd run check:revisions`
- `npm.cmd run check:import-json`
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npm.cmd run build`
- `npm.cmd audit --audit-level=moderate`
- `git diff --check`
- `git status --short`

### Ghi chú

- Phase 12 là docs/stability phase.
- Không sửa code app.
- Không đọc/in `.env.local`.
- Không in secret.
- Không push remote.
- Phase tiếp theo đề xuất: Phase 13 - UI Polish Foundation.

## 2026-06-16 - Google OAuth login via Supabase Auth

### Phase

Auth usability hardening after Phase 11

### Việc đã làm

- Thêm nút `Đăng nhập với Google` tại `/auth/login`.
- Giữ nguyên form magic link hiện có.
- Google OAuth dùng Supabase browser client và redirect về `/auth/callback`.
- Callback ưu tiên xử lý `error`/`error_code` trước khi kiểm tra thiếu `code`.
- Callback vẫn dùng `exchangeCodeForSession(code)` cho cả magic link và Google OAuth.
- Bổ sung mapping lỗi đăng nhập dễ hiểu cho `otp_expired`, `missing_auth_code`, `auth_callback_failed`, `access_denied`, `provider_disabled` và fallback unknown.
- Cập nhật hướng dẫn cấu hình Google OAuth trong `docs/10_SUPABASE_SETUP.md`.

### File đã tạo/cập nhật

- app/auth/callback/route.ts
- app/auth/login/page.tsx
- components/auth/login-form.tsx
- docs/08_AI_WORK_LOG.md
- docs/10_SUPABASE_SETUP.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration đã tạo

- Không tạo migration.

### Package đã thêm

- Không thêm package.

### Kiểm tra

- `npm run check:foundation`
- `npm run check:auth-permissions`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `git status --short`

### Ghi chú

- Không sửa schema, permission model, OWNER logic hoặc dữ liệu Supabase.
- Không hard-code email đăng nhập.
- Không commit `.env.local`.
- Chưa push remote.

## 2026-06-16 - Phase 11 Supabase Integration & Real Smoke Test Gate

### Phase

Phase 11 - Supabase Integration & Real Smoke Test Gate

### Việc đã làm

- Tạo `scripts/check-env-safe.cjs` để kiểm `.env.example` và trạng thái key trong `.env.local` mà không in secret.
- Tạo `scripts/check-migrations-order.cjs` để kiểm migration order/prefix/conflict marker.
- Thêm package scripts `check:env:safe` và `check:migrations`.
- Tạo `docs/10_SUPABASE_SETUP.md`.
- Tạo `docs/11_SMOKE_TEST_CHECKLIST.md`.
- Cập nhật `docs/00_INDEX.md`.
- Tạo route `/admin/system/status` có permission guard và chỉ hiển thị trạng thái yes/no.
- Thêm link `System` vào admin nav.

### File đã tạo/cập nhật

- package.json
- scripts/check-env-safe.cjs
- scripts/check-migrations-order.cjs
- app/(admin)/admin/system/status/page.tsx
- components/layout/admin-shell.tsx
- docs/00_INDEX.md
- docs/02_ARCHITECTURE.md
- docs/04_PERMISSION_PRIVACY_MODEL.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/10_SUPABASE_SETUP.md
- docs/11_SMOKE_TEST_CHECKLIST.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration đã tạo

- Không tạo migration trong Phase 11.

### Package đã thêm

- Không thêm package.

### Script check đã tạo

- `check:env:safe`: chạy `node scripts/check-env-safe.cjs`
- `check:migrations`: chạy `node scripts/check-migrations-order.cjs`

### Quyết định kỹ thuật

- Env handling: `.env.local` nếu có thì chỉ kiểm present/missing, không in value.
- Migration gate: kiểm đủ migration `0001` đến `0006`, thứ tự tên file, duplicate prefix và conflict marker.
- OWNER assignment: giữ thủ công bằng `db/snippets/assign-owner-role.sql`, không auto OWNER.
- Smoke test: checklist thủ công sau khi user cấu hình Supabase thật.
- Secret policy: không commit secret, không đưa service role key ra client.

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa chạy migration thật.
- Chưa test login thật.
- Chưa gán OWNER thật.

### Task tiếp theo đề xuất

- User cấu hình `.env.local`, chạy migrations thật, gán OWNER và smoke test thật.

## 2026-06-15 - Phase 10 Import JSON Foundation

### Phase

Phase 10 - Import JSON Foundation

### Việc đã làm

- Tạo import types và hằng số schema/size limit.
- Tạo validator thuần cho `family.json`, không dùng Supabase và không ghi DB.
- Validate JSON parse, schema version, arrays, duplicate IDs, full_name, references và vòng tổ tiên.
- Tạo preview service server-side có kiểm `imports.create` và conflict check DB nếu khả dụng.
- Tạo route `/admin/exports/import`.
- Tạo server action `previewImportAction` để đọc upload/paste JSON tối đa 5MB.
- Tạo client form preview summary/issues/conflicts và khóa nút xác nhận import.
- Thêm link từ `/admin/exports` sang import preview.
- Tạo script `check:import-json`.

### File đã tạo/cập nhật

- package.json
- app/(admin)/admin/exports/page.tsx
- app/(admin)/admin/exports/import/page.tsx
- app/(admin)/admin/exports/import/actions.ts
- components/imports/json-import-preview-form.tsx
- lib/family/import-types.ts
- lib/family/json-import-validator.ts
- lib/family/json-import-preview-service.ts
- scripts/check-import-json-foundation.cjs
- docs/02_ARCHITECTURE.md
- docs/04_PERMISSION_PRIVACY_MODEL.md
- docs/06_EXPORT_BACKUP_MODEL.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration đã tạo

- Không tạo migration trong Phase 10.

### Package đã thêm

- Không thêm package.

### Script check đã tạo

- `check:import-json`: chạy `node scripts/check-import-json-foundation.cjs`

### Quyết định kỹ thuật

- Import preview: chỉ đọc file và trả summary/issues/conflicts, không ghi DB.
- Validator: thuần, chạy được ngay cả khi Supabase thiếu cấu hình.
- Conflict check: server-side bằng admin Supabase client nếu permission/config đầy đủ.
- Permission: `imports.create` là quyền mở trang/preview khi auth đã cấu hình.
- Restore/import thật: chưa bật, nút xác nhận import disabled.

### Lệnh đã chạy

- git status --short
- git log --oneline -5
- npm run check:foundation
- npm run check:auth-permissions
- npm run check:people
- npm run check:relationships
- npm run check:tree-viewer
- npm run check:tree-editor
- npm run check:public-privacy
- npm run check:export-backup
- npm run check:revisions
- npm run check:import-json
- npm run typecheck
- npm run lint
- npm run build
- npm audit --audit-level=moderate
- git diff --check

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa làm import thật.
- Chưa có transaction/rollback import.
- Chưa ghi import job/revision log.
- Chưa kiểm thử với Supabase data thật.

### Task tiếp theo đề xuất

- Phase 11 - Import transaction/restore planning hoặc UI polish foundation.

## 2026-06-15 - Phase 9 Revision History UI Foundation

### Phase

Phase 9 - Revision History UI Foundation

### Việc đã làm

- Tạo revision types.
- Mở rộng revision service để đọc list/detail/entity revisions.
- Tạo diff helper so sánh `before_json` và `after_json`.
- Tạo route `/admin/revisions`.
- Tạo route `/admin/revisions/[id]`.
- Thêm filter theo entity_type, action, entity_id, changed_by và ngày.
- Thêm link từ `/admin/people/[id]` sang lịch sử revision của người đó.
- Thêm admin nav `Lịch sử chỉnh sửa`.
- Tạo restore placeholder disabled, chưa làm restore thật.
- Tạo script `check:revisions`.

### File đã tạo/cập nhật

- README.md
- package.json
- app/(admin)/admin/revisions/page.tsx
- app/(admin)/admin/revisions/[id]/page.tsx
- app/(admin)/admin/people/[id]/page.tsx
- components/layout/admin-shell.tsx
- lib/family/revision-types.ts
- lib/family/revision-service.ts
- lib/family/revision-diff.ts
- scripts/check-revision-history-foundation.cjs
- docs/02_ARCHITECTURE.md
- docs/03_DATABASE_MODEL.md
- docs/04_PERMISSION_PRIVACY_MODEL.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration đã tạo

- Không tạo migration trong Phase 9.

### Package đã thêm

- Không thêm package.

### Script check đã tạo

- `check:revisions`: chạy `node scripts/check-revision-history-foundation.cjs`

### Quyết định kỹ thuật

- Revision list: server-side list với filter cơ bản, giới hạn 100 bản ghi mới nhất.
- Revision detail: server-side detail theo UUID, hiển thị metadata, revision_items nếu có và raw JSON.
- Diff viewer: so sánh field top-level từ `before_json`/`after_json`, fallback an toàn cho JSON phức tạp.
- Restore: chỉ placeholder disabled, không ghi đè dữ liệu hiện tại.
- Permission: route/service kiểm `revisions.view`; `revisions.restore` chỉ ảnh hưởng ghi chú placeholder.

### Lệnh đã chạy

- git status --short
- git log --oneline -5
- npm run check:foundation
- npm run check:auth-permissions
- npm run check:people
- npm run check:relationships
- npm run check:tree-viewer
- npm run check:tree-editor
- npm run check:public-privacy
- npm run check:export-backup
- npm run check:revisions
- npm run typecheck
- npm run lint
- npm run build
- npm audit --audit-level=moderate
- git diff --check
- Browser route check `http://127.0.0.1:3000/admin/revisions`
- Browser route check `http://127.0.0.1:3000/admin/revisions/fake-id`

### Kết quả hiện tại

- PASS: baseline trước khi sửa.
- PASS: `npm run check:revisions`
- PASS: `npm run typecheck`
- PASS: `npm run lint`
- PASS: `npm run build`
- PASS: `git diff --check`
- PASS: Browser route check cho `/admin/revisions` và `/admin/revisions/fake-id`; routes render nội dung an toàn, không crash trắng.
- WARN: `npm audit --audit-level=moderate` còn 2 moderate warnings từ `next`/`postcss`; không chạy `npm audit fix --force` vì breaking change ngoài scope.

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa làm restore thật.
- Chưa có transaction/validation restore.
- Chưa kiểm thử với dữ liệu Supabase thật.

### Task tiếp theo đề xuất

- Phase 10 - Import JSON foundation hoặc UI polish foundation.

## 2026-06-15 - Phase 8 Export/backup foundation

### Phase

Phase 8 - Export/backup foundation

### Việc đã làm

- Tạo migration `export_jobs` và `backup_records`.
- Tạo export types, collector, JSON exporter, GEDCOM exporter, checksum helper và ZIP backup exporter.
- Tạo route admin `/admin/exports`.
- Tạo route download `/admin/exports/download/json`.
- Tạo route download `/admin/exports/download/gedcom`.
- Tạo route download `/admin/exports/download/zip`.
- Thêm admin nav `Backup / Export`.
- Thêm package `jszip`.
- Tạo script `check:export-backup`.
- Cập nhật docs export/backup, database, architecture, permission/privacy, decision log và handoff.

### File đã tạo/cập nhật

- README.md
- package.json
- package-lock.json
- db/migrations/20260614_0006_export_backup_foundation.sql
- app/(admin)/admin/exports/page.tsx
- app/(admin)/admin/exports/download/json/route.ts
- app/(admin)/admin/exports/download/gedcom/route.ts
- app/(admin)/admin/exports/download/zip/route.ts
- components/layout/admin-shell.tsx
- lib/family/export-types.ts
- lib/family/export-collector.ts
- lib/family/json-exporter.ts
- lib/family/gedcom-exporter.ts
- lib/family/checksum.ts
- lib/family/zip-backup-exporter.ts
- scripts/check-export-backup-foundation.cjs
- docs/02_ARCHITECTURE.md
- docs/03_DATABASE_MODEL.md
- docs/04_PERMISSION_PRIVACY_MODEL.md
- docs/06_EXPORT_BACKUP_MODEL.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration đã tạo

- `db/migrations/20260614_0006_export_backup_foundation.sql`

### Package đã thêm

- `jszip`

### Script check đã tạo

- `check:export-backup`: chạy `node scripts/check-export-backup-foundation.cjs`

### Quyết định kỹ thuật

- family.json export: bản bảo toàn dữ liệu chính, giữ ID ổn định, quan hệ và layout.
- GEDCOM export: foundation chuyển đổi, không cố map dữ liệu ngoài chuẩn bằng mọi giá.
- ZIP backup: gói `family.json`, `family.ged`, `manifest.json`, `checksums.json`.
- Manifest/checksum: SHA-256 trong `checksums.json`, tránh checksum tự tham chiếu vòng tròn.
- Import: chưa bật import ghi dữ liệu trong Phase 8.
- Media backup: chưa có media upload thật, `media_count = 0`.
- Permission: route admin/download kiểm `exports.download` server-side.

### Lệnh đã chạy

- git status --short
- git log --oneline -5
- npm run check:foundation
- npm run check:auth-permissions
- npm run check:people
- npm run check:relationships
- npm run check:tree-viewer
- npm run check:tree-editor
- npm run check:public-privacy
- npm run check:export-backup
- npm run typecheck
- npm run lint
- npm run build
- npm audit --audit-level=moderate
- git diff --check
- Browser route check `http://127.0.0.1:3001/admin/exports`
- Browser route check `http://127.0.0.1:3001/admin/exports/download/json`
- Browser route check `http://127.0.0.1:3001/admin/exports/download/gedcom`
- Browser route check `http://127.0.0.1:3001/admin/exports/download/zip`

### Kết quả hiện tại

- PASS: baseline trước khi sửa.
- PASS: `npm run check:export-backup`
- PASS: `npm run typecheck`
- PASS: `npm run lint`
- PASS: `npm run build`
- PASS: `git diff --check`
- PASS: Browser route check cho `/admin/exports`, `/admin/exports/download/json`, `/admin/exports/download/gedcom`, `/admin/exports/download/zip`; download routes trả lỗi cấu hình an toàn khi thiếu Supabase config.
- WARN: `npm audit --audit-level=moderate` còn 2 moderate warnings từ `next`/`postcss`; không chạy `npm audit fix --force` vì breaking change ngoài scope.

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa chạy migration trên Supabase thật.
- Chưa làm import đầy đủ.
- Chưa làm media upload thật.
- Chưa làm export ảnh/PDF.
- Chưa kiểm thử với dữ liệu Supabase thật.

### Task tiếp theo đề xuất

- Phase 9 - Revision history UI foundation.

## 2026-06-15 - Phase 7 Public/private mode foundation

### Phase

Phase 7 - Public/private mode foundation

### Việc đã làm

- Tạo privacy types và privacy service dùng chung.
- Tạo `PublicPerson`, `FamilyPerson`, `AdminPerson`.
- Tạo public-safe mapper cho person.
- Tạo sanitize tree graph theo mode public/family/admin.
- Tạo public family service.
- Cập nhật public homepage `/`.
- Tạo public tree route `/tree`.
- Tạo public person profile route `/people/[slug]`.
- Tạo admin public preview route `/admin/preview/public`.
- Tạo public components `PublicHome`, `PublicTreeShell`, `PublicPersonProfile`.
- Tạo script `check:public-privacy`.

### File đã tạo/cập nhật

- README.md
- package.json
- app/(public)/page.tsx
- app/(public)/tree/page.tsx
- app/(public)/people/[slug]/page.tsx
- app/(admin)/admin/preview/public/page.tsx
- components/layout/public-shell.tsx
- components/public/public-home.tsx
- components/public/public-tree-shell.tsx
- components/public/public-person-profile.tsx
- lib/privacy/privacy-types.ts
- lib/privacy/privacy-service.ts
- lib/family/public-family-service.ts
- scripts/check-public-privacy-foundation.cjs
- docs/02_ARCHITECTURE.md
- docs/04_PERMISSION_PRIVACY_MODEL.md
- docs/05_TREE_UI_MODEL.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration đã tạo

- Không tạo migration trong Phase 7.

### Script check đã tạo

- `check:public-privacy`: chạy `node scripts/check-public-privacy-foundation.cjs`

### Quyết định kỹ thuật

- Privacy service: sanitize server-side trước khi render.
- Public tree: readonly `/tree`, dùng graph public đã lọc.
- Public person profile: `/people/[slug]`, dùng DTO public-safe.
- Public preview: `/admin/preview/public`, dùng cùng public service với `/tree`.
- RLS/public query: không mở public RLS rộng; dùng server-side anon client với filter chặt, fail/empty an toàn nếu policy DB chưa cho phép.
- Living person privacy: public mode không hiện ngày sinh/mất đầy đủ, nơi sinh, quê quán, ghi chú riêng tư hoặc dữ liệu nội bộ.

### Lệnh đã chạy

- git status --short
- git log --oneline -5
- npm run check:foundation
- npm run check:auth-permissions
- npm run check:people
- npm run check:relationships
- npm run check:tree-viewer
- npm run check:tree-editor
- npm run check:public-privacy
- npm run typecheck
- npm run lint
- npm run build
- Browser route check `http://127.0.0.1:3001/`
- Browser route check `http://127.0.0.1:3001/tree`
- Browser route check `http://127.0.0.1:3001/people/test-slug`
- Browser route check `http://127.0.0.1:3001/admin/preview/public`

### Kết quả

- PASS: baseline `npm run check:foundation`
- PASS: baseline `npm run check:auth-permissions`
- PASS: baseline `npm run check:people`
- PASS: baseline `npm run check:relationships`
- PASS: baseline `npm run check:tree-viewer`
- PASS: baseline `npm run check:tree-editor`
- PASS: baseline `npm run typecheck`
- PASS: baseline `npm run lint`
- PASS: baseline `npm run build`
- PASS: `npm run check:public-privacy`
- PASS: Phase 7 `npm run typecheck`
- PASS: Phase 7 `npm run lint`
- PASS: Phase 7 `npm run build`
- PASS: Browser route check cho `/`, `/tree`, `/people/test-slug`, `/admin/preview/public`; các route render nội dung an toàn khi thiếu Supabase config.

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa chạy public RLS policy trên database thật.
- Chưa kiểm thử public routes với Supabase data thật.
- Chưa làm export JSON/GEDCOM/ZIP thật.
- Chưa làm export ảnh/PDF.
- Chưa làm media upload thật.
- NPM audit vẫn còn 2 moderate warnings từ `next`/`postcss`.

### Task tiếp theo đề xuất

- Phase 8 - Export/backup foundation.

## 2026-06-15 - Phase 6 Tree Editor foundation

### Phase

Phase 6 - Tree Editor foundation

### Việc đã làm

- Tạo migration `tree_layouts` và `tree_layout_nodes`.
- Bật RLS layout theo `tree.view` và `tree.edit_layout`.
- Tạo `tree-layout-service` để đọc, áp dụng, lưu và reset layout.
- Tạo route `/admin/tree/edit`.
- Tạo Tree Editor bằng React Flow.
- Tạo side panel khi click person node.
- Tạo toolbar editor: fit view, auto layout, lưu layout, reset layout.
- Thêm action thêm cha/mẹ, vợ/chồng/bạn đời, con từ cây bằng relationship service thật.
- Cập nhật `/admin/tree` có link chỉnh sửa cây khi có `tree.edit_layout`.
- Thêm menu admin `Chỉnh sửa cây`.
- Tạo script `check:tree-editor`.

### File đã tạo/cập nhật

- README.md
- package.json
- app/(admin)/admin/page.tsx
- app/(admin)/admin/tree/page.tsx
- app/(admin)/admin/tree/edit/page.tsx
- app/(admin)/admin/tree/edit/actions.ts
- components/layout/admin-shell.tsx
- components/tree/family-tree-editor.tsx
- components/tree/tree-editor-side-panel.tsx
- components/tree/tree-editor-toolbar.tsx
- db/migrations/20260614_0005_tree_layout_foundation.sql
- lib/family/tree-types.ts
- lib/family/tree-layout-service.ts
- scripts/check-tree-editor-foundation.cjs
- docs/02_ARCHITECTURE.md
- docs/03_DATABASE_MODEL.md
- docs/04_PERMISSION_PRIVACY_MODEL.md
- docs/05_TREE_UI_MODEL.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration đã tạo

- db/migrations/20260614_0005_tree_layout_foundation.sql

### Script check đã tạo

- `check:tree-editor`: chạy `node scripts/check-tree-editor-foundation.cjs`

### Quyết định kỹ thuật

- Tree editor: route riêng `/admin/tree/edit`, không biến viewer readonly thành editor.
- Layout persistence: lưu `tree_layouts`/`tree_layout_nodes`, tách khỏi dữ liệu quan hệ thật.
- Side panel: click person node hiển thị thông tin, quan hệ tóm tắt và form UUID tối giản.
- Add relationship from tree: dùng relationship service thật, không tạo edge mock.
- Permission: route edit yêu cầu `tree.view` + `tree.edit_layout`; add relationship yêu cầu `relationships.create` trong service.
- Public/private handling: chưa làm public tree.

### Lệnh đã chạy

- git status --short
- git log --oneline -5
- npm run check:foundation
- npm run check:auth-permissions
- npm run check:people
- npm run check:relationships
- npm run check:tree-viewer
- npm run check:tree-editor
- npm run typecheck
- npm run lint
- npm run build
- Browser route check `/admin/tree`
- Browser route check `/admin/tree/edit`

### Kết quả

- PASS: baseline `npm run check:foundation`
- PASS: baseline `npm run check:auth-permissions`
- PASS: baseline `npm run check:people`
- PASS: baseline `npm run check:relationships`
- PASS: baseline `npm run check:tree-viewer`
- PASS: baseline `npm run typecheck`
- PASS: baseline `npm run lint`
- PASS: baseline `npm run build`
- PASS: `npm run check:tree-editor`
- PASS: Phase 6 `npm run typecheck`
- PASS: Phase 6 `npm run lint`
- PASS: Phase 6 `npm run build`
- PASS: Browser route check cho `/admin/tree` khi thiếu Supabase config
- PASS: Browser route check cho `/admin/tree/edit` khi thiếu Supabase config

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa chạy migration trên database thật.
- Chưa kiểm thử editor với Supabase data thật.
- Chưa làm public tree.
- Chưa export ảnh cây/PDF.
- Chưa làm JSON/GEDCOM/ZIP export thật.
- NPM audit vẫn còn 2 moderate warnings từ Phase 5.

### Task tiếp theo đề xuất

- Phase 7 - Public/private mode foundation.

## 2026-06-15 - Phase 5 Tree Viewer foundation

### Phase

Phase 5 - Tree Viewer foundation

### Việc đã làm

- Cài `@xyflow/react` và `elkjs`.
- Tạo tree graph types.
- Tạo graph builder từ `people` và relationship tables.
- Tạo tree service server-side kiểm quyền `tree.view`.
- Tạo ELK auto layout helper.
- Tạo route `/admin/tree`.
- Tạo React Flow viewer client component.
- Tạo custom person/family node card.
- Tạo toolbar tìm người, fit view, reset layout.
- Tạo empty/error state an toàn.
- Thêm menu admin `Cây gia phả`.
- Tạo script `check:tree-viewer`.

### File đã tạo/cập nhật

- README.md
- package.json
- package-lock.json
- app/layout.tsx
- app/(admin)/admin/page.tsx
- app/(admin)/admin/tree/page.tsx
- components/layout/admin-shell.tsx
- components/tree/family-tree-viewer.tsx
- components/tree/family-node-card.tsx
- components/tree/family-tree-toolbar.tsx
- components/tree/family-tree-empty-state.tsx
- components/tree/family-tree-error-state.tsx
- lib/family/tree-types.ts
- lib/family/tree-graph-builder.ts
- lib/family/tree-service.ts
- lib/family/tree-layout-elk.ts
- scripts/check-tree-viewer-foundation.cjs
- docs/02_ARCHITECTURE.md
- docs/04_PERMISSION_PRIVACY_MODEL.md
- docs/05_TREE_UI_MODEL.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Package đã thêm

- `@xyflow/react`
- `elkjs`

### Script check đã tạo

- `check:tree-viewer`: chạy `node scripts/check-tree-viewer-foundation.cjs`

### Quyết định kỹ thuật

- React Flow package: `@xyflow/react`.
- ELK layout: `elkjs`, chạy trong client viewer helper và fail mềm.
- Graph builder: tạo `person` node và `family` node trung gian; edge gồm `family_unit`, `parent_child`, `couple`.
- Public/private handling: service admin kiểm `tree.view`; builder có mode `admin`, `internal`, `public`; node không chứa `notes_private`.
- Tree editor status: chưa làm mutation/edit trên cây.

### Lệnh đã chạy

- git status --short
- git log --oneline -5
- npm run check:foundation
- npm run check:auth-permissions
- npm run check:people
- npm run check:relationships
- npm run typecheck
- npm run lint
- npm run build
- npm install @xyflow/react elkjs
- npm run check:tree-viewer
- Browser route check `/admin/tree`

### Kết quả

- PASS: baseline `npm run check:foundation`
- PASS: baseline `npm run check:auth-permissions`
- PASS: baseline `npm run check:people`
- PASS: baseline `npm run check:relationships`
- PASS: baseline `npm run typecheck`
- PASS: baseline `npm run lint`
- PASS: baseline `npm run build`
- PASS: `npm run check:tree-viewer`
- PASS: Phase 5 `npm run typecheck`
- PASS: Phase 5 `npm run lint`
- PASS: Phase 5 `npm run build`
- PASS: Browser route check cho `/admin/tree` khi thiếu Supabase config

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa chạy migration trên database thật.
- Chưa kiểm thử viewer với Supabase data thật.
- Chưa làm Tree Editor.
- Chưa lưu layout thủ công.
- Chưa làm public tree.
- Chưa export ảnh cây/PDF.
- Chưa làm export JSON/GEDCOM/ZIP thật.
- NPM audit còn 2 moderate warnings sau khi cài package.

### Task tiếp theo đề xuất

- Phase 6 - Tree Editor foundation.

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
