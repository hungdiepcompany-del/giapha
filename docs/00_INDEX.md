# Bản đồ tài liệu

Không bắt AI đọc tất cả file `.md` mỗi lần. AI chỉ đọc file liên quan task để tiết kiệm token và tránh loãng context.

| File | Mục đích | Khi nào cần đọc |
| --- | --- | --- |
| README.md | Tổng quan dự án, stack, nguyên tắc dữ liệu lâu dài và cách chạy/deploy placeholder. | Luôn đọc khi bắt đầu một task mới hoặc cần định hướng dự án. |
| AGENTS.md | Quy tắc làm việc cho AI coding. | Luôn đọc trước khi AI sửa code hoặc tài liệu. |
| 01_PROJECT_OVERVIEW.md | Mục tiêu, người dùng chính và nguyên tắc 100 năm. | Khi cần hiểu phạm vi sản phẩm hoặc tránh mở rộng sai hướng. |
| 02_ARCHITECTURE.md | Stack, luồng chính, server/client boundary và deploy. | Khi task liên quan kiến trúc, runtime, Supabase, Cloudflare hoặc service layer. |
| 03_DATABASE_MODEL.md | Mô hình bảng nền, bảng gia phả, layout, revision và backup. | Khi task liên quan schema, migration, query hoặc quan hệ gia phả. |
| 04_PERMISSION_PRIVACY_MODEL.md | Roles, permissions, public/private mode và RLS. | Khi task liên quan auth, quyền, riêng tư, public page hoặc RLS. |
| 05_TREE_UI_MODEL.md | Nguyên tắc React Flow/ELK.js, node card, side panel và toolbar. | Khi task liên quan cây gia phả, layout cây hoặc chỉnh sửa trực tiếp trên cây. |
| 06_EXPORT_BACKUP_MODEL.md | Nguyên tắc JSON/GEDCOM/ZIP, manifest, checksum và import. | Khi task liên quan export, import, backup, phục hồi hoặc chuyển đổi dữ liệu. |
| 07_PHASE_PLAN.md | Kế hoạch theo phase, scope, nghiệm thu và lệnh test. | Khi lập kế hoạch, chọn task tiếp theo hoặc kiểm tra task có đúng phase không. |
| 08_AI_WORK_LOG.md | Nhật ký việc AI đã làm. | Sau mỗi task để cập nhật lịch sử làm việc và bằng chứng kiểm tra. |
| 09_DECISION_LOG.md | Các quyết định kiến trúc/sản phẩm quan trọng. | Khi có quyết định mới hoặc cần kiểm tra lý do của quyết định cũ. |
| 10_SUPABASE_SETUP.md | Hướng dẫn cấu hình Supabase thật, migration order, OWNER bootstrap và smoke gate. | Khi cần kết nối Supabase thật hoặc chuẩn bị smoke test production-like. |
| 11_SMOKE_TEST_CHECKLIST.md | Checklist smoke test thủ công cho auth, OWNER, CRUD, tree, export/import và revision. | Sau khi đã cấu hình `.env.local`, chạy migration thật và gán OWNER. |
| 12_REAL_SUPABASE_SMOKE_TEST_REPORT.md | Báo cáo Phase 12 ghi nhận baseline ổn định sau smoke test Supabase thật. | Khi cần biết mốc ổn định trước UI polish, deploy hoặc import/restore thật. |
| 13_DEPLOY_READINESS.md | Checklist và chính sách sẵn sàng deploy Cloudflare lần đầu. | Khi chuẩn bị production env, Supabase redirect URL, Google OAuth domain, backup và rollback. |
| 14_OPENNEXT_CLOUDFLARE_WIRING.md | Cấu hình Cloudflare Workers qua OpenNext, scripts deploy/preview/upload và chính sách secret. | Khi chạy lại Phase 15 First Cloudflare Deploy hoặc kiểm tra wiring deploy. |
| 15_SERVICE_BOUNDARY_WORKER_SPLIT.md | Kế hoạch boundary cho main worker và các service worker ứng viên. | Khi task liên quan OpenNext Worker size, export/import/media/PDF nặng hoặc chuẩn bị split service. |
| 15C_GITHUB_ACTIONS_OPENNEXT_BUILD_GATE.md | GitHub Actions/Linux build gate cho OpenNext Cloudflare build. | Khi cần xác nhận lỗi OpenNext build là Windows-local trước khi deploy thật. |
| 15D_FIRST_CLOUDFLARE_DEPLOY_RETRY.md | Báo cáo retry deploy Cloudflare đầu tiên. | Khi cần biết kết quả deploy thật, production URL, smoke test hoặc blocker Windows/OpenNext. |
| 15E_GITHUB_ACTIONS_CLOUDFLARE_DEPLOY.md | Workflow deploy Cloudflare thủ công bằng GitHub Actions/Linux. | Khi cần deploy qua GitHub Actions sau khi Windows local deploy bị blocker. |
| 16_PRODUCTION_STABILIZATION.md | Checklist ổn định production sau deploy đầu tiên. | Khi cần smoke test production, auth/privacy/export/logs checklist hoặc quy trình sau deploy. |
| 17_PRODUCTION_OPERATIONS_MONITORING.md | Runbook vận hành production, monitoring, smoke test, incident triage và rollback. | Sau mỗi deploy production hoặc khi cần điều tra lỗi production an toàn. |
| 18_BACKUP_DOMAIN_ALERTING_HARDENING.md | Runbook hardening backup, domain, alerting, incident matrix và quy tắc đặt tên backup. | Khi chuẩn bị backup drill, custom domain, cảnh báo vận hành hoặc xử lý incident production. |
| 19_SCHEDULED_BACKUP_RESTORE_DRILL.md | Runbook lap lich backup thu cong, restore drill an toan, PASS/FAIL criteria va drill log template. | Khi can dien tap backup/restore, chuan bi automation backup hoac kiem tra quy trinh truoc thao tac du lieu rui ro. |
| 20_CUSTOM_DOMAIN_CUTOVER_READINESS.md | Runbook san sang doi custom domain: Cloudflare, Supabase Auth, Google OAuth, smoke va rollback. | Khi chuan bi chot domain, doi canonical URL hoac lap ke hoach cutover domain production. |
| 21_AUTOMATED_BACKUP_JOB_DESIGN.md | Thiet ke automated backup job, trigger, storage, retention, guardrail va roadmap dry-run. | Khi chuan bi tu dong hoa backup nhung chua bat cron/job hoac upload backup that. |
| 22_BACKUP_DRY_RUN_COMMAND_DESIGN.md | Thiet ke command backup dry-run dung mock data, manifest shape, naming convention va secret scan. | Khi can kiem tra backup automation an toan truoc khi tao fixture hoac job that. |
| 23_SAMPLE_FIXTURE_BACKUP_GENERATOR.md | Generator fixture backup mau, manifest fixture va guardrail khong dung du lieu that. | Khi can tao sample fixture cho manifest integrity, restore dry-run hoac pipeline readiness. |
| 24_BACKUP_MANIFEST_INTEGRITY_CHECKER.md | Checker fixture-only de verify manifest shape, fixture shape va checksum integrity. | Khi can xac nhan fixture/manifest backup mau khong bi drift truoc restore dry-run. |
| 25_RESTORE_DRY_RUN_VALIDATOR.md | Restore dry-run validator chi kiem graph/privacy/readiness tren fixture mau, khong restore that. | Khi can kiem tra payload co san sang cho restore validator truoc pipeline gate. |
| 26_BACKUP_PIPELINE_READINESS_GATE.md | Gate tong hop chay cac command backup dry-run, fixture generate/verify va restore dry-run an toan. | Khi can mot lenh local de xac nhan backup automation readiness bundle. |
| 27_BACKUP_CI_GATE_INTEGRATION.md | GitHub Actions backup readiness gate cho PR/manual, chi chay local dry-run va fixture checks. | Khi can kiem tra backup readiness tren CI ma khong dung secret, schedule hay deploy. |
| 28_LOCAL_SANDBOX_BACKUP_STORAGE_SIMULATION.md | Mo phong storage local bang fixture sandbox va index mau, khong dung cloud/storage that. | Khi can staging backup fixture vao sandbox truoc khi chon storage target. |
| 29_BACKUP_ARTIFACT_RETENTION_POLICY_GATE.md | Retention policy gate tren fixture/sandbox metadata, khong xoa backup that. | Khi can kiem weekly/monthly/pre-deploy retention rule truoc storage/job that. |
| 30_RESTORE_DRILL_REPORT_GENERATOR.md | Generator report restore dry-run bang fixture only, ghi report mau khong production mutation. | Khi can bang chung report cho restore drill truoc handoff backup readiness. |
| 31_BACKUP_READINESS_HANDOFF.md | Handoff tong hop backup readiness Phase 18-31, lenh local, CI gate, fixtures va boundary chua production backup. | Khi can resume backup readiness hoac chon buoc tiep theo ve storage/domain/approval. |
| 32_SANDBOX_STORAGE_TARGET_SELECTION.md | So sanh Cloudflare R2, Google Drive, Supabase Storage va local/offline storage; recommend tiep tuc local sandbox. | Khi can chon huong sandbox storage truoc khi thiet ke adapter hoac storage that. |
| 33_STORAGE_ADAPTER_CONTRACT_GUARDRAILS.md | Contract va guardrail cho storage adapter backup tuong lai, chua co provider/cloud upload that. | Khi can thiet ke adapter truoc khi prototype local sandbox hoac storage provider that. |
| 34_LOCAL_SANDBOX_STORAGE_ADAPTER_PROTOTYPE.md | Prototype adapter local sandbox dung fixture backup, put/list/metadata/verify trong fixtures only. | Khi can chay adapter local truoc upload verification dry-run hoac cloud prototype. |
| 35_STORAGE_UPLOAD_VERIFICATION_DRY_RUN.md | Verify dry-run cho artifact trong local adapter sandbox: manifest, checksum, marker va secret scan. | Khi can kiem artifact sau mo phong upload local truoc approval backup production. |
| 36_PRODUCTION_BACKUP_APPROVAL_CHECKLIST.md | Checklist approval/no-go truoc khi bat ky phase nao tao backup production that. | Khi can go/no-go cho production backup, storage target, secret, privacy, retention va restore drill. |
| 37_REPOSITORY_HYGIENE_GITHUB_MENU_REVIEW.md | Review va xu ly dirty state cua GIA_PHA_GITHUB_MENU.bat truoc worker split. | Khi can biet vi sao file menu duoc restore ve HEAD va repo hygiene sach hon. |
| 38_BACKUP_SERVICE_WORKER_BOUNDARY_DESIGN.md | Thiet ke boundary cho backup service worker nho rieng, internal endpoint va JSON envelope. | Khi can chuan bi tach backup/storage khoi main OpenNext worker nhung chua scaffold code. |
| 39_BACKUP_SERVICE_WORKER_SCAFFOLD.md | Scaffold backup service worker toi thieu trong services/backup-service, chua deploy va chua storage that. | Khi can xem endpoint, auth placeholder, wrangler config va scaffold worker local. |
| 40_BACKUP_SERVICE_WORKER_LOCAL_CONTRACT_CHECKS.md | Static/local contract checks cho backup service worker scaffold, gom auth, envelope, endpoint va no-deploy policy. | Khi can kiem worker source/config truoc integration readiness hoac deploy readiness. |
| 41_BACKUP_SERVICE_WORKER_INTEGRATION_READINESS.md | Readiness design cho future main app to backup service worker integration qua service binding hoac Bearer token. | Khi can thiet ke binding/tich hop nhung chua goi service that. |
| 42_WORKER_SPLIT_BACKUP_READINESS_HANDOFF.md | Handoff tong hop worker split va backup readiness Phase 37-42, service files, checks va boundary chua deploy. | Khi can resume worker split/backup readiness hoac chon deploy readiness phase tiep theo. |
| 43_BACKUP_SERVICE_WORKER_DEPLOY_READINESS_GATE.md | Gate static/local cho backup service worker deploy readiness, chua deploy va chua route production. | Khi can kiem source/config endpoint/auth/envelope va secret safety truoc deploy approval. |
| 44_BACKUP_SERVICE_WORKER_ENV_SECRET_CONTRACT.md | Runbook env/secret contract cho backup service worker, chi placeholder va khong secret that. | Khi can chuan bi secret provisioning/rotation an toan truoc deploy hoac smoke. |
| 45_BACKUP_SERVICE_WORKER_POST_DEPLOY_SMOKE_PLAN.md | Plan va smoke script safe-skip cho backup service worker sau deploy tuong lai. | Khi can chuan bi smoke /health va internal dry-run sau khi co URL/token explicit. |
| 46_BACKUP_SERVICE_WORKER_MAIN_APP_BINDING_CONTRACT.md | Contract main app goi backup service worker qua service binding hoac internal URL, chua implement runtime. | Khi can thiet ke integration boundary truoc khi sua main app hoac them binding. |
| 47_BACKUP_SERVICE_WORKER_DEPLOY_READINESS_HANDOFF.md | Handoff tong hop deploy readiness Phase 43-47 cho backup service worker, chua deploy. | Khi can quyet dinh Phase 48 deploy/manual workflow/binding implementation. |
| 48_BACKUP_SERVICE_WORKER_GITHUB_ACTIONS_DEPLOY_WORKFLOW_READINESS.md | Readiness workflow GitHub Actions manual-only cho backup service worker deploy, chua chay deploy. | Khi can chuan bi workflow deploy rieng cho backup service worker ma khong auto trigger. |
| 99_NEXT_AI_HANDOFF.md | Trạng thái mới nhất và handoff cho AI tiếp theo. | Luôn đọc phần trên cùng trước khi tiếp tục dự án. |
