# Next AI Handoff

## 2026-06-17 - Phase 22 Backup Dry-Run Command Design completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 22 them command backup dry-run an toan bang mock/static data. Phase nay khong deploy, khong push, khong doc `.env.local`/`.dev.vars`, khong goi network/API/DB, khong tao backup/export that, khong upload file, khong restore va khong tao scheduled job/cron that.

### File/script moi

- `docs/22_BACKUP_DRY_RUN_COMMAND_DESIGN.md`
- `scripts/backup-dry-run.cjs`
- `scripts/check-backup-dry-run-command-design.cjs`
- `npm run backup:dry-run`
- `npm run check:backup-dry-run-command-design`

### Dry-run baseline

- Output marker: `DRY_RUN_ONLY`
- Uses mock/static data in memory only.
- Validates manifest shape, naming convention, secret pattern scan and restore compatibility checklist.
- Does not write backup files.
- Does not call production services.

### Boundary giu nguyen

- Khong deploy/push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong tao/upload backup that.
- Khong restore production.
- Khong tao scheduled job/cron that.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

### Task tiep theo de xuat

Phase 23 - Sample Fixture Backup Generator.

## 2026-06-17 - Phase 21 Automated Backup Job Design completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 21 bo sung design automated backup job. Phase nay khong deploy lai, khong push, khong tao scheduled job/cron that, khong tao/upload backup production that, khong restore production, khong them storage credential, khong sua schema, khong chay migration va khong mutate du lieu.

### File/script moi

- `docs/21_AUTOMATED_BACKUP_JOB_DESIGN.md`
- `scripts/check-automated-backup-job-design.cjs`
- `npm run check:automated-backup-job-design`

### Backup automation baseline

- Current export outputs: JSON, GEDCOM, ZIP.
- Existing builders referenced by design: `buildFamilyJsonFile`, `buildGedcomExport`, `buildFullBackupZip`.
- Recommended path: manual checklist -> sample dry-run -> manifest generator -> sandbox storage -> disabled-by-default schedule -> approved production schedule.
- Storage candidates: local operator storage, Cloudflare R2, Google Drive, Supabase Storage, private NAS/offline backup.
- No real storage/bucket/job/cron configured in Phase 21.

### Boundary giu nguyen

- Khong deploy lai.
- Khong push.
- Khong tao scheduled job/cron that.
- Khong tao/upload backup that.
- Khong restore production.
- Khong them storage secret/credential.
- Khong doi domain/Auth/OAuth config that.
- Khong sua schema.
- Khong tao/chay migration.
- Khong sua du lieu that.
- Khong hardcode secret/token/key.
- Khong commit `.env.local` hoac `.dev.vars`.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

### Task tiep theo de xuat

Phase 22 co the la Backup Dry-Run Command Design neu tiep tuc backup automation, hoac Custom Domain Cutover Execution neu domain that da chot va co quyen cau hinh.

## 2026-06-17 - Phase 20 Custom Domain Cutover Readiness completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 20 bo sung runbook san sang doi custom domain. Phase nay khong deploy lai, khong chot/doi domain that, khong doi DNS, khong cau hinh Cloudflare custom domain/route, khong doi Supabase/Auth/OAuth config that, khong goi API mutate config, khong sua schema va khong mutate du lieu.

### File/script moi

- `docs/20_CUSTOM_DOMAIN_CUTOVER_READINESS.md`
- `scripts/check-custom-domain-cutover-readiness.cjs`
- `npm run check:custom-domain-cutover-readiness`

### Domain readiness baseline

- Worker: `web-gia-pha`
- Current production URL: https://web-gia-pha.hungdiepcompany.workers.dev/
- Candidate custom domain: `<TO_BE_CONFIRMED>`
- Deploy workflow: `.github/workflows/cloudflare-deploy.yml`
- Cloudflare config: `wrangler.toml`
- App canonical env: `NEXT_PUBLIC_APP_URL`
- Smoke env: `PROD_SMOKE_BASE_URL`
- Google OAuth login: PASS by manual user test on current production URL.
- Custom domain smoke: not run because no real domain was configured in this phase.

### Boundary giu nguyen

- Khong deploy lai.
- Khong push.
- Khong doi domain/DNS that.
- Khong doi Cloudflare custom domain/route that.
- Khong doi Supabase/Auth/OAuth config that.
- Khong goi Cloudflare/Supabase/Google/DNS API mutate config.
- Khong tao backup that.
- Khong restore production.
- Khong sua schema.
- Khong tao/chay migration.
- Khong sua du lieu that.
- Khong hardcode secret/token/key.
- Khong commit `.env.local` hoac `.dev.vars`.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

### Task tiep theo de xuat

Phase 21 co the la Custom Domain Cutover Execution neu user da chot domain va co quyen Cloudflare/Supabase/Google, hoac Automated Backup Job Design neu domain cutover can cho.

## 2026-06-17 - Phase 19 Scheduled Backup & Restore Drill completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 19 bo sung runbook scheduled backup va restore drill an toan. Phase nay khong deploy lai, khong tao backup production that, khong restore production, khong them cron/job that, khong sua schema, khong chay migration, khong mutate du lieu va khong doi domain/Auth/OAuth config that.

### File/script moi

- `docs/19_SCHEDULED_BACKUP_RESTORE_DRILL.md`
- `scripts/check-scheduled-backup-restore-drill.cjs`
- `npm run check:scheduled-backup-restore-drill`

### Drill baseline

- Worker: `web-gia-pha`
- Production URL: https://web-gia-pha.hungdiepcompany.workers.dev/
- Deploy workflow: `.github/workflows/cloudflare-deploy.yml`
- Phase 16/17: PASS
- Phase 18: PASS_WITH_NOTES
- Google OAuth production login: PASS by manual user test
- Basic production route smoke: PASS by manual user test
- Backup schedule: documented manual runbook only, no cron/job configured.
- Restore drill: documented for non-production only, no production restore executed.

### Boundary giu nguyen

- Khong deploy lai.
- Khong push.
- Khong tao backup that.
- Khong restore production.
- Khong commit backup/export artifact.
- Khong sua schema.
- Khong tao/chay migration.
- Khong sua du lieu that.
- Khong doi domain/Auth/OAuth config that.
- Khong lam import confirm that.
- Khong lam revision restore that.
- Khong hardcode secret/token/key.
- Khong commit `.env.local` hoac `.dev.vars`.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

### Task tiep theo de xuat

Phase 20 co the la Custom Domain Cutover Readiness, Automated Backup Job Design, hoac focused production bugfix neu monitoring/smoke phat hien loi that.

## 2026-06-17 - Phase 18 Backup, Domain & Alerting Hardening completed

### Trang thai hien tai

Production van chay tai `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 18 bo sung runbook hardening cho backup, restore readiness, domain cutover, alerting va incident matrix. Phase nay khong deploy lai, khong tao backup that, khong doi domain/Auth/OAuth config that, khong sua schema, khong chay migration va khong mutate du lieu.

### File/script moi

- `docs/18_BACKUP_DOMAIN_ALERTING_HARDENING.md`
- `scripts/check-backup-domain-alerting-hardening.cjs`
- `npm run check:backup-domain-alerting-hardening`

### Hardening baseline

- Worker: `web-gia-pha`
- Production URL: https://web-gia-pha.hungdiepcompany.workers.dev/
- Deploy workflow: `.github/workflows/cloudflare-deploy.yml`
- Backup naming convention: `web-gia-pha_<env>_<YYYYMMDD-HHMMSS>_<scope>.<ext>`
- Restore readiness: documented only, no restore drill executed in this phase.
- Alerting: checklist documented only, no dashboard or external alert destination configured in this phase.

### Boundary giu nguyen

- Khong deploy lai.
- Khong tao backup that.
- Khong commit backup/export artifact.
- Khong sua schema.
- Khong tao/chay migration.
- Khong sua du lieu that.
- Khong doi domain/Auth/OAuth config that.
- Khong lam import confirm that.
- Khong lam revision restore that.
- Khong hardcode secret/token/key.
- Khong commit `.env.local` hoac `.dev.vars`.

### Task tiep theo de xuat

Phase 19 co the la Scheduled Backup & Restore Drill, Custom Domain Cutover, hoac focused production bugfix neu monitoring/smoke phat hien loi that.

## 2026-06-17 - Phase 17 Production Operations & Monitoring completed

### Trạng thái hiện tại

Production đang PASS tại `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 17 bổ sung runbook vận hành production, monitoring checklist, smoke guide, incident triage và rollback guidance. Phase này không deploy lại, không mở tính năng lớn, không sửa schema, không chạy migration và không sửa dữ liệu thật.

### File/script mới

- `docs/17_PRODUCTION_OPERATIONS_MONITORING.md`
- `scripts/check-production-ops-monitoring.cjs`
- `npm run check:production-ops-monitoring`

### Operations baseline

- Worker: `web-gia-pha`
- Production URL: https://web-gia-pha.hungdiepcompany.workers.dev/
- Deploy workflow: `.github/workflows/cloudflare-deploy.yml`
- Phase 16 baseline: PASS
- Google OAuth production login: PASS by manual user test
- Basic production route smoke: PASS by manual user test
- Optional automated smoke with `PROD_SMOKE_BASE_URL=https://web-gia-pha.hungdiepcompany.workers.dev`: PASS

### Boundary giữ nguyên

- Không deploy lại.
- Không sửa schema.
- Không tạo/chạy migration.
- Không sửa dữ liệu thật.
- Không làm import confirm thật.
- Không làm revision restore thật.
- Không đổi privacy/business logic.
- Không hardcode secret/token/key.
- Không commit `.env.local` hoặc `.dev.vars`.

### Task tiếp theo đề xuất

Use `docs/17_PRODUCTION_OPERATIONS_MONITORING.md` after each deploy. Next phase can be a focused production bugfix only if monitoring/smoke finds an issue, or backup/domain/alerting hardening.

## 2026-06-17 - Phase 16 Production Stabilization checklist added

### Trạng thái hiện tại

Production deploy đang PASS tại `https://web-gia-pha.hungdiepcompany.workers.dev/`. Phase 16 đã thêm checklist vận hành production sau deploy đầu tiên, tập trung route smoke, Auth/OAuth, privacy, export backup và logs/observability. Phase này không deploy lại và không mở tính năng lớn.

### File/script mới

- `docs/16_PRODUCTION_STABILIZATION.md`
- `scripts/check-production-stabilization.cjs`
- `npm run check:production-stabilization`

### Local validation

- `npm run check:production-stabilization`: PASS.
- Optional production smoke: skipped because `PROD_SMOKE_BASE_URL` was not set.
- `npm run check:env:safe`: PASS.
- `npm run check:migrations`: PASS.
- `npm run check:deploy-readiness`: PASS.
- `npm run check:opennext-cloudflare`: PASS.
- `npm run check:service-boundary`: PASS.
- `npm run check:github-actions-opennext`: PASS.
- `npm run check:github-actions-deploy`: PASS.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS.
- `npm audit --audit-level=moderate`: PASS_WITH_KNOWN_AUDIT_ADVISORIES.
- `git diff --check`: PASS.

### Production baseline

- Worker: `web-gia-pha`
- Production URL: https://web-gia-pha.hungdiepcompany.workers.dev/
- Deploy workflow: `.github/workflows/cloudflare-deploy.yml`
- Deploy status: PASS
- Google OAuth login: PASS by manual production test
- Basic production route smoke: PASS by manual user test

### Boundary giữ nguyên

- Không sửa schema.
- Không tạo/chạy migration.
- Không sửa dữ liệu thật.
- Không làm import confirm thật.
- Không làm revision restore thật.
- Không đổi privacy/business logic.
- Không hardcode secret/token/key.
- Không commit `.env.local` hoặc `.dev.vars`.

### Task tiếp theo đề xuất

Run production stabilization checklist after each deploy. Next likely phase: Phase 17 - Production Operations & Monitoring, or a focused fix phase only if production smoke/logs reveal an issue.

## 2026-06-17 - Production deploy PASS

### Trạng thái hiện tại

Production deploy cho WEB GIA PHẢ đã PASS qua GitHub Actions Cloudflare Deploy theo xác nhận của user. Worker production đang chạy tại URL Cloudflare Workers thật.

### Production

- Worker: `web-gia-pha`
- Production URL: https://web-gia-pha.hungdiepcompany.workers.dev/
- Deploy path: GitHub Actions Cloudflare Deploy
- Deploy status: PASS
- `NEXT_PUBLIC_APP_URL`: đã cập nhật theo URL thật

### Auth/OAuth

- Supabase Site URL: đã cấu hình theo production URL.
- Supabase Redirect URLs: đã cấu hình theo production URL và `/auth/callback`.
- Google OAuth: đã sửa lỗi `deleted_client`.
- Login Google OAuth production: PASS theo test thủ công.

### Smoke test

- Các route smoke cơ bản: PASS theo test thủ công.
- Import confirm: vẫn disabled.
- Revision restore: vẫn disabled.

### Boundary giữ nguyên

- Không sửa schema.
- Không tạo/chạy migration.
- Không sửa dữ liệu thật.
- Không làm import confirm thật.
- Không làm revision restore thật.
- Không hardcode secret/token/key.
- Không commit `.env.local` hoặc `.dev.vars`.

### Task tiếp theo đề xuất

Phase 16 - Production Stabilization: theo dõi logs/observability, smoke test chi tiết production, xác nhận export backup production, và ghi checklist vận hành.

## 2026-06-17 - Phase 15E GitHub Actions Cloudflare Deploy Workflow ready

### Trạng thái hiện tại

Dự án đã có workflow deploy Cloudflare thủ công qua GitHub Actions/Linux để tránh blocker Windows/OpenNext local. Phase này chỉ tạo workflow/checker/docs, chưa chạy workflow deploy, chưa deploy thật, không sửa schema, không chạy migration và không đổi business logic.

### Workflow mới

- `.github/workflows/cloudflare-deploy.yml`
- Trigger: `workflow_dispatch` only
- Runner: `ubuntu-latest`
- Node: `24`
- Cài dependency bằng `npm ci`
- Chạy safety checks, typecheck, lint, build
- Chạy deploy bằng `npm run deploy`
- Không chạy khi push hoặc pull request

### Required GitHub Actions config

- Variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_APP_URL`
- Secrets:
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `CLOUDFLARE_API_TOKEN`
  - `CLOUDFLARE_ACCOUNT_ID`

### Script/docs mới

- `scripts/check-github-actions-cloudflare-deploy.cjs`
- `npm run check:github-actions-deploy`
- `docs/15E_GITHUB_ACTIONS_CLOUDFLARE_DEPLOY.md`

### Local validation

- `npm run check:github-actions-deploy`: PASS.
- `npm run check:github-actions-opennext`: PASS.
- `npm run check:opennext-cloudflare`: PASS.
- `npm run check:service-boundary`: PASS.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS.
- `npm audit --audit-level=moderate`: PASS_WITH_KNOWN_AUDIT_ADVISORIES.
- `git diff --check`: PASS.
- Secret scan: PASS, no real secret value found.

### Boundary giữ nguyên

- Không deploy từ Windows local.
- Không auto deploy on push.
- Không sửa schema.
- Không chạy migration.
- Không sửa dữ liệu thật.
- Không làm import confirm thật.
- Không làm revision restore thật.
- Không hardcode secret/token/key.
- Không commit `.env.local` hoặc `.dev.vars`.

### Task tiếp theo đề xuất

Push commit Phase 15E lên GitHub, sau đó chạy thủ công GitHub Actions -> Cloudflare Deploy -> Run workflow trên branch `main`. Nếu deploy PASS, ghi production URL và tiếp tục smoke test/Phase 16 - Production Stabilization.

## 2026-06-16 - Phase 15D First Cloudflare Deploy Retry blocked on Windows

### Trạng thái hiện tại

Phase 15D đã chạy gate đầy đủ và thử deploy thật bằng `npm.cmd run deploy`, nhưng deploy bị BLOCKED bởi known OpenNext/Windows local blocker trước khi upload/deploy lên Cloudflare. Không có production URL mới, không có Cloudflare deployment mới và chưa smoke test production.

### Gate đã PASS

- Repo sạch trước deploy.
- Branch: `main`.
- Local commit: `b04657535a94378df0a6811a15fff247131d5cac`.
- `origin/main`: `b04657535a94378df0a6811a15fff247131d5cac`.
- GitHub Actions OpenNext Cloudflare Build Gate: PASS.
- Run URL: https://github.com/hungdiepcompany-del/giapha/actions/runs/27631937702
- Local checks/build: PASS.
- Audit: PASS_WITH_KNOWN_AUDIT_ADVISORIES.

### User confirmations before deploy

- Backup `family.json`: DONE, outside repo.
- Backup `full-backup.zip`: DONE, outside repo.
- `NEXT_PUBLIC_SUPABASE_URL`: configured as Text.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: configured as Text.
- `NEXT_PUBLIC_APP_URL`: configured as Text.
- `SUPABASE_SERVICE_ROLE_KEY`: configured as Secret.

### Deploy attempt

- Command: `npm.cmd run deploy`.
- Next build: PASS.
- OpenNext bundle on Windows: FAIL.
- Error summary: `ENOENT` copying `.open-next/.build/open-next.config.edge.mjs` to `.open-next/middleware/open-next.config.mjs`.
- Cloudflare upload/deploy reached: No.

### Boundary giữ nguyên

- Không sửa schema.
- Không tạo/chạy migration.
- Không sửa dữ liệu thật.
- Không làm import confirm thật.
- Không làm revision restore thật.
- Không in secret.
- Không commit `.env.local` hoặc `.dev.vars`.

### Task tiếp theo đề xuất

Use WSL/Linux for deploy, or create a dedicated GitHub Actions deploy workflow only after explicit user confirmation. If deploy later PASS, continue Phase 16 - Production Stabilization.

## 2026-06-16 - Phase 15C Linux/GitHub Actions OpenNext Build Gate completed

### Trạng thái hiện tại

Dự án WEB GIA PHẢ đã có GitHub Actions/Linux build gate cho OpenNext Cloudflare build. Phase này chỉ thêm workflow/checker/docs, chưa deploy thật, chưa upload, chưa push remote, không tạo Cloudflare deployment, không chạy migration, không sửa schema và không đổi business logic.

### Workflow mới

- `.github/workflows/opennext-build-gate.yml`
- Trigger: `workflow_dispatch`, `pull_request` vào `main`, `push` vào `main`
- Runner: `ubuntu-latest`
- Node: `24`
- Cài dependency bằng `npm ci`
- Chạy check scripts, typecheck, lint, `npm run build` và `npx opennextjs-cloudflare build`
- Không chạy `npm run deploy`, `npm run upload` hoặc `wrangler deploy`

### Script/docs mới

- `scripts/check-github-actions-opennext-gate.cjs`
- `npm run check:github-actions-opennext`
- `docs/15C_GITHUB_ACTIONS_OPENNEXT_BUILD_GATE.md`

### Env/secrets policy

- Workflow là build gate, không phải deploy.
- Workflow có placeholder env để build khi chưa cấu hình production secrets thật.
- Không dùng workflow này để smoke test Supabase thật.
- Production deploy phase sau mới cấu hình Cloudflare/GitHub secrets/env thật.

### Audit status

- `npm audit --audit-level=moderate` vẫn có advisory trong Next/OpenNext/Wrangler/PostCSS/esbuild/ws chain.
- Không chạy `npm audit fix --force`.
- Nếu checks/build PASS, Phase 15C được xem là READY_TO_RUN_ON_GITHUB với known audit advisories.

### Local validation

- Gate Phase 15B signs: PASS.
- `npm run check:github-actions-opennext`: PASS.
- `npm run check:opennext-cloudflare`: PASS.
- `npm run check:service-boundary`: PASS.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS.
- `git diff --check`: PASS.
- `npm audit --audit-level=moderate`: PASS_WITH_KNOWN_AUDIT_ADVISORIES.
- Phase 15C status: READY_TO_RUN_ON_GITHUB.

### Task tiếp theo đề xuất

Push commit lên GitHub để chạy OpenNext Cloudflare Build Gate. Nếu GitHub Actions PASS, tiếp tục Phase 15D - First Cloudflare Deploy Retry.

## 2026-06-16 - Phase 15B Service Boundary & Worker Split Readiness completed

### Trạng thái hiện tại

Dự án WEB GIA PHẢ đã có service boundary readiness để tránh main Worker phình to về sau. Phase này chỉ tạo docs, template worker và checker; chưa tách Worker thật, chưa tạo Cloudflare service thật, chưa deploy, chưa upload, chưa push remote, không chạy migration và không đổi business logic.

### Boundary đã ghi nhận

- Main Web Worker giữ UI public/admin, auth callback, people CRUD nhẹ, relationship CRUD nhẹ, tree viewer/editor nhẹ và gọi service phụ khi cần.
- `export-backup-worker` tương lai xử lý `family.json`, GEDCOM, ZIP backup, checksum và scheduled/manual backup.
- `import-validate-worker` tương lai xử lý JSON parse, schema validation, missing reference validation, cycle check và conflict report; phase đầu không ghi DB.
- `media-worker` tương lai xử lý upload ảnh, resize/compress, metadata và media backup.
- `pdf-image-export-worker` tương lai xử lý xuất ảnh cây và PDF.

### File/script mới

- `docs/15_SERVICE_BOUNDARY_WORKER_SPLIT.md`
- `services/_template-worker/`
- `scripts/check-service-boundary-readiness.cjs`
- `npm run check:service-boundary`

### OpenNext/Windows note

- OpenNext wiring check PASS bằng `npm run check:opennext-cloudflare`.
- Next build PASS bằng `npm run build`.
- `npx.cmd opennextjs-cloudflare build` trên Windows thuần có thể bị BLOCKED bởi compatibility issue của OpenNext.
- Build/deploy thật nên chạy bằng WSL/Linux/GitHub Actions hoặc môi trường Cloudflare-compatible.

### Check status

- All project readiness/type/lint/build checks PASS.
- `npm.cmd audit --audit-level=moderate` FAIL vì advisory còn trong `next`/`postcss`, `@opennextjs/cloudflare`/`wrangler`/`esbuild`/`ws`.
- Không chạy `npm audit fix --force` vì ngoài scope, có advisory no-fix và force path có thể gây breaking downgrade.
- Phase 15B technical status: PASS.
- Commit status: allowed with audit exception.
- Audit status: npm audit still reports advisories in dependency/toolchain chain.
- Policy: no `npm audit fix --force`; track upstream package updates.
- Reason: current advisory remediation may require force/breaking changes and could destabilize Next/OpenNext deploy wiring.
- Kết luận validation: PASS_WITH_KNOWN_AUDIT_ADVISORIES.

### Task tiếp theo đề xuất

Phase 15C - GitHub Actions/WSL OpenNext Build Gate hoặc retry first Cloudflare deploy bằng môi trường Linux sau khi backup và production env/secrets đã sẵn sàng.

## 2026-06-16 - Phase 15A OpenNext Cloudflare Workers Wiring completed

### Trạng thái hiện tại

Dự án WEB GIA PHẢ đã có wiring deploy rõ ràng cho Cloudflare Workers qua OpenNext. Phase này chỉ cài/cấu hình deploy adapter và docs/checker, chưa deploy thật, chưa upload, chưa push remote, không chạy migration, không sửa schema/auth/business logic và không đọc/in `.env.local`.

### File/script mới hoặc cập nhật

- `@opennextjs/cloudflare`
- `wrangler`
- `open-next.config.ts`
- `wrangler.toml`
- `eslint.config.mjs` ignores generated `.open-next` output
- `scripts/check-opennext-cloudflare-wiring.cjs`
- `docs/14_OPENNEXT_CLOUDFLARE_WIRING.md`
- `npm run check:opennext-cloudflare`
- `npm run preview`
- `npm run deploy`
- `npm run upload`
- `npm run cf-typegen`

### Deploy boundary

- Target: Cloudflare Workers via OpenNext.
- `npm run deploy`, `npm run upload` và `npx wrangler deploy` vẫn chưa được chạy.
- Trước khi retry Phase 15, cần backup `family.json` và `full-backup.zip`.
- Cần cấu hình Cloudflare variables/secrets: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- `SUPABASE_SERVICE_ROLE_KEY` phải là secret/server-side, không dùng `NEXT_PUBLIC_`.

### Task tiếp theo đề xuất

Chạy lại Phase 15 - First Cloudflare Deploy.

## 2026-06-16 - Phase 14 Deploy Readiness completed

### Trạng thái hiện tại

Dự án WEB GIA PHẢ đã có deploy readiness baseline cho first Cloudflare deploy. Phase này chỉ tạo docs/check/script, không deploy thật, không push remote, không tạo Cloudflare project, không sửa schema/auth/business logic và không đọc/in `.env.local`.

### File/script mới

- `docs/13_DEPLOY_READINESS.md`
- `scripts/check-deploy-readiness.cjs`
- `npm run check:deploy-readiness`

### Deploy readiness policy

- Target deploy: Cloudflare, nhưng Pages versus Workers wiring cần xác nhận ở Phase 15.
- Production env bắt buộc: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`.
- `.env.example` chỉ giữ placeholder rỗng.
- `SUPABASE_SERVICE_ROLE_KEY` chỉ server-side, không dùng `NEXT_PUBLIC_`.
- Trước deploy cần cập nhật Supabase Site URL/Redirect URLs và Google OAuth Authorized JavaScript origin.
- Trước deploy có rủi ro dữ liệu cần tải `family.json` và `full-backup.zip`.

### Boundary giữ nguyên

- Không chạy lại migrations 0001-0006.
- Không tạo migration mới.
- Không bật import confirm thật.
- Không bật revision restore thật.
- Không deploy hoặc push remote.

### Task tiếp theo đề xuất

Phase 15 - First Cloudflare Deploy.

## 2026-06-16 - Phase 13 UI Polish Foundation completed

### Trạng thái hiện tại

Dự án WEB GIA PHẢ đã có UI polish foundation trên các bề mặt chính. Phase này chỉ sửa giao diện/copy/layout và thêm checker, không sửa schema, RLS, auth callback, business logic dữ liệu, import confirm hoặc revision restore.

### UI primitives mới

- `components/ui/page-header.tsx`
- `components/ui/section-card.tsx`
- `components/ui/status-callout.tsx`
- `components/ui/empty-state.tsx`
- `components/ui/action-link.tsx`

### UI đã polish

- Admin shell: nav rõ hơn, active route rõ hơn, user/role/permission context gọn hơn.
- Public homepage/tree/profile: hero, CTA, readonly/public privacy copy.
- Login page: Google OAuth và magic link phân biệt rõ hơn.
- People list/form: bảng dễ đọc hơn, form chia nhóm thông tin.
- Relationships: giải thích family, cha mẹ/con, quan hệ đôi và UUID.
- Tree viewer/editor: toolbar rõ hơn, hướng dẫn click/kéo/lưu layout, empty state rõ hơn.
- Export/import: nhấn mạnh `family.json` là backup chính, import preview chưa ghi DB.

### Script check mới

- `npm run check:ui-polish`

### Boundary giữ nguyên

- Không tạo migration.
- Không chạy lại migrations 0001-0006.
- Không sửa auth callback/PKCE.
- Không bật import confirm thật.
- Không bật revision restore thật.
- Không deploy hoặc push remote.

### Task tiếp theo đề xuất

Phase 14 - Deploy Readiness hoặc Phase 14 - Import Confirm Planning, tùy ưu tiên.

## 2026-06-16 - Phase 12 Real Supabase Smoke Test Baseline completed

### Trạng thái hiện tại

Dự án WEB GIA PHẢ đã có mốc baseline ổn định sau real Supabase smoke test. Phase 12 chỉ cập nhật tài liệu và report, không sửa code app, không tạo migration, không deploy và không push remote.

### File/report mới

- `docs/12_REAL_SUPABASE_SMOKE_TEST_REPORT.md`

### User-confirmed smoke status

- Google OAuth login: PASS.
- User đã thêm người thật vào database thật: PASS.
- Main routes/functions smoke test chính: OK theo xác nhận của user.
- PKCE issue trước đó: tự hết, xem như transient browser/cookie/origin issue nếu không tái diễn.

### Baseline policy

- Đây là baseline ổn định trước UI polish.
- Không chạy lại toàn bộ migration 0001-0006 sau khi đã có dữ liệu thật nếu chưa review schema/data state.
- Không bật import confirm thật nếu chưa có transaction, final validation, conflict resolution và log an toàn.
- Không bật revision restore thật nếu chưa có transaction, validation và revision mới cho hành động restore.

### Chưa làm

- Chưa deploy Cloudflare.
- Chưa push remote.
- Chưa làm import confirm thật.
- Chưa làm revision restore thật.
- Chưa ghi nhận per-route evidence độc lập từ Codex trong Phase 12; report dùng `PASS_USER_CONFIRMED` hoặc `NOT_CONFIRMED` đúng mức xác nhận.

### Task tiếp theo đề xuất

Phase 13 - UI Polish Foundation. Không ưu tiên import confirm thật ở bước kế tiếp.

## 2026-06-16 - Google OAuth login added

### Trạng thái hiện tại

Dự án WEB GIA PHẢ đã có thêm đăng nhập Google OAuth qua Supabase Auth để tránh phụ thuộc hoàn toàn vào magic link khi gặp `email rate limit exceeded` hoặc `otp_expired`.

### File/route đã cập nhật

- `components/auth/login-form.tsx`
- `app/auth/login/page.tsx`
- `app/auth/callback/route.ts`
- `docs/10_SUPABASE_SETUP.md`

### Auth behavior

- `/auth/login` vẫn giữ form magic link.
- `/auth/login` có thêm nút `Đăng nhập với Google`, gọi Supabase `signInWithOAuth` với `redirectTo` là `${window.location.origin}/auth/callback`.
- `/auth/callback` xử lý cả magic link và Google OAuth bằng `exchangeCodeForSession(code)`.
- `/auth/callback` ưu tiên `error_code`/`error` trước khi kiểm tra thiếu `code`.
- Exchange lỗi redirect về `/auth/login?reason=auth_callback_failed` và chỉ log metadata an toàn: name, message, status/code.
- Callback thành công vẫn ưu tiên `/admin` khi user có `people.view`.

### Cấu hình thủ công còn cần user kiểm tra

- Google Cloud OAuth Client có Authorized redirect URI: `https://<SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`.
- Supabase Dashboard -> Authentication -> Providers -> Google đã Enabled và có Client ID/Secret.
- Supabase URL Configuration local có:
  - `http://localhost:3000/**`
  - `http://localhost:3000/auth/callback`
- Khi deploy Cloudflare Pages, thêm redirect URL tương ứng cho `https://<pages-project>.pages.dev/**` và `/auth/callback`.

### Chưa làm

- Chưa tạo migration.
- Chưa sửa schema/role/OWNER.
- Chưa commit secret.
- Chưa push remote.
- Chưa deploy.

### Task tiếp theo đề xuất

User kiểm tra cấu hình Google Cloud/Supabase Dashboard rồi smoke test `/auth/login` bằng Google OAuth với tài khoản OWNER thật.

## 2026-06-16 - Phase 11 Supabase Integration & Real Smoke Test Gate completed

### Trạng thái hiện tại

Dự án WEB GIA PHẢ đã có gate chuẩn bị tích hợp Supabase thật. Phase này không chạy migration thật, không deploy, không push và không commit secret.

### File/route/script đã có

- `docs/10_SUPABASE_SETUP.md`
- `docs/11_SMOKE_TEST_CHECKLIST.md`
- `scripts/check-env-safe.cjs`
- `scripts/check-migrations-order.cjs`
- `/admin/system/status`
- `npm run check:env:safe`
- `npm run check:migrations`

### Supabase integration behavior

- `.env.local` vẫn chỉ là file local, không commit.
- `check:env:safe` chỉ in trạng thái present/missing, không in giá trị secret.
- `check:migrations` kiểm migration folder, thứ tự tên file, đủ prefix `0001` đến `0006`, không duplicate prefix và không conflict marker.
- `/admin/system/status` yêu cầu `settings.manage` hoặc `permissions.manage`, chỉ hiển thị trạng thái env dạng yes/no và danh sách foundation checks.

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa chạy migration thật trên Supabase.
- Chưa test login Supabase thật.
- Chưa gán OWNER thật.
- Chưa smoke test CRUD/export/import preview bằng user thật.

### Task tiếp theo đề xuất

User cấu hình `.env.local`, chạy migrations thật, đăng nhập lần đầu, gán OWNER bằng `db/snippets/assign-owner-role.sql`, rồi chạy checklist `docs/11_SMOKE_TEST_CHECKLIST.md`.

## 2026-06-15 - Phase 10 Import JSON Foundation completed

### Trạng thái hiện tại

Dự án WEB GIA PHẢ đã có Import JSON foundation dạng preview an toàn. Admin có route `/admin/exports/import` để upload hoặc paste `family.json`, kiểm tra schema, quan hệ, vòng tổ tiên và conflict cơ bản với DB hiện tại.

### Import service/UI đã có

- `lib/family/import-types.ts`
- `lib/family/json-import-validator.ts`
- `lib/family/json-import-preview-service.ts`
- `app/(admin)/admin/exports/import/page.tsx`
- `app/(admin)/admin/exports/import/actions.ts`
- `components/imports/json-import-preview-form.tsx`

### Import behavior

- Hỗ trợ preview schema `1.0.0`.
- Validate JSON parse được, `schema_version`, `people`, `full_name`, duplicate person/family IDs, reference giữa family/person/layout và vòng tổ tiên.
- Conflict check DB nếu có Supabase/admin config và user có `imports.create`: existing person IDs, duplicate slugs, family IDs, tree layout IDs.
- Nếu thiếu Supabase config, route vẫn cho kiểm tra cấu trúc file và báo conflict DB unavailable an toàn.
- File/input giới hạn 5MB.
- Nút xác nhận import bị disabled; Phase 10 không ghi DB, không lưu file, không restore dữ liệu.

### Permission/privacy status

- Route import yêu cầu `imports.create` khi Supabase/auth đã cấu hình.
- Service role chỉ dùng server-side trong conflict check.
- Client form chỉ gọi server action, không nhận secret.
- Không tạo mock data, không ghi đè dữ liệu hiện tại.

### Script check đã tạo

- `npm run check:import-json`

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa làm import thật.
- Chưa ghi import job/revision log cho thao tác import.
- Chưa có transaction import/rollback.
- Chưa kiểm thử với Supabase data thật.

### Lưu ý cho AI tiếp theo

- Không bật import thật nếu chưa có transaction, validation final, conflict resolution và revision/import log.
- Không overwrite person/family/layout theo ID cũ nếu chưa có chế độ xác nhận rõ ràng.
- `family.json` vẫn là bản bảo toàn dữ liệu chính; GEDCOM không thay thế được JSON.

### Task tiếp theo đề xuất

Phase 11 - Import transaction/restore planning hoặc UI polish foundation.

## 2026-06-15 - Phase 9 Revision History UI Foundation completed

### Trạng thái hiện tại

Dự án WEB GIA PHẢ đã có Revision History UI foundation. Admin có thể xem danh sách revision, lọc cơ bản và mở chi tiết để xem before/after JSON cùng diff field.

### Revision service/UI đã có

- `lib/family/revision-types.ts`
- `lib/family/revision-service.ts`
- `lib/family/revision-diff.ts`
- `/admin/revisions`
- `/admin/revisions/[id]`

### Revision behavior

- `/admin/revisions` hiển thị thời gian, action, entity_type, entity_id, changed_by và reason.
- Filter hỗ trợ `entity_type`, `action`, `entity_id`, `changed_by`, `changed_from`, `changed_to`.
- `/admin/revisions/[id]` hiển thị metadata, diff field, `revision_items` nếu có và raw before/after JSON.
- `/admin/people/[id]` có link nhanh tới `/admin/revisions?entity_type=people&entity_id=<id>` nếu user có `revisions.view`.

### Restore status

- Phase 9 chưa làm restore thật.
- Nút restore là placeholder disabled.
- Người có `revisions.restore` chỉ thấy ghi chú rằng restore thật cần transaction, validation và revision mới.

### Permission/privacy status

- Service và route kiểm `revisions.view` server-side.
- Revision có thể chứa dữ liệu nhạy cảm trong `before_json`/`after_json`, không public.
- Không đưa service role key ra client.

### Script check đã tạo

- `npm run check:revisions`

### Lệnh đã chạy

- Baseline trước khi sửa: `npm run check:foundation`, `npm run check:auth-permissions`, `npm run check:people`, `npm run check:relationships`, `npm run check:tree-viewer`, `npm run check:tree-editor`, `npm run check:public-privacy`, `npm run check:export-backup`, `npm run typecheck`, `npm run lint`, `npm run build` - PASS
- Phase 9: `npm run check:revisions`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` - PASS
- Browser route check `/admin/revisions`, `/admin/revisions/fake-id` trên `http://127.0.0.1:3000` - PASS; routes render nội dung an toàn, không crash trắng.
- `npm audit --audit-level=moderate` - WARN, còn 2 moderate warnings từ `next`/`postcss`; không chạy force fix vì breaking change ngoài scope.

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa làm restore thật.
- Chưa có transaction/validation restore.
- Chưa kiểm thử với dữ liệu Supabase thật.
- NPM audit còn 2 moderate warnings từ `next`/`postcss`.

### Lưu ý cho AI tiếp theo

- Không bật restore thật nếu chưa có validation, transaction và revision log cho hành động restore.
- Revision detail có thể hiển thị dữ liệu nhạy cảm nên không đưa ra public route.
- Nếu mở restore, phải xử lý từng `entity_type` riêng, không dùng generic overwrite mù.

### Task tiếp theo đề xuất

Phase 10 - Import JSON foundation hoặc UI polish foundation.

## 2026-06-15 - Phase 8 Export/backup foundation completed

### Trạng thái hiện tại

Dự án WEB GIA PHẢ đã có export/backup foundation. Admin có route `/admin/exports` để tải `family.json`, `family.ged` và `full-backup.zip`.

### Export/backup service đã có

- `lib/family/export-types.ts`
- `lib/family/export-collector.ts`
- `lib/family/json-exporter.ts`
- `lib/family/gedcom-exporter.ts`
- `lib/family/checksum.ts`
- `lib/family/zip-backup-exporter.ts`

### Route đã có

- `/admin/exports`: trang admin backup/export.
- `/admin/exports/download/json`: tải `family.json`.
- `/admin/exports/download/gedcom`: tải `family.ged`.
- `/admin/exports/download/zip`: tải `full-backup.zip`.

### Database migration đã có

- `db/migrations/20260614_0006_export_backup_foundation.sql`
- Bảng `export_jobs`: metadata job export.
- Bảng `backup_records`: metadata backup dài hạn.
- RLS: `exports.download` đọc record, `exports.create` tạo record.
- Chưa chạy migration trên Supabase thật.

### Export status

- `family.json`: đã build từ people, families, family_parents, family_children, couple_relationships, tree_layouts và tree_layout_nodes.
- `family.ged`: foundation GEDCOM với HEAD/INDI/FAM/TRLR.
- `full-backup.zip`: dùng `jszip`, gồm `family.json`, `family.ged`, `manifest.json`, `checksums.json`.
- Manifest/checksum: schema version `1.0.0`, app version `0.1.0`, SHA-256.
- Media: chưa có media upload thật, `media_count = 0`.
- Import: chưa bật import ghi dữ liệu; chỉ giữ nguyên tắc docs.

### Permission/privacy status

- Download routes kiểm `exports.download` server-side.
- Export admin/internal có thể chứa dữ liệu đầy đủ theo quyền; không dùng làm public export.
- Nếu sau này cần public export, phải dùng privacy service/DTO public-safe.
- Không đưa service role key ra client.

### Script check đã tạo

- `npm run check:export-backup`

### Lệnh đã chạy

- Baseline trước khi sửa: `npm run check:foundation`, `npm run check:auth-permissions`, `npm run check:people`, `npm run check:relationships`, `npm run check:tree-viewer`, `npm run check:tree-editor`, `npm run check:public-privacy`, `npm run typecheck`, `npm run lint`, `npm run build` - PASS
- Phase 8: `npm run check:export-backup`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` - PASS
- Browser route check `/admin/exports`, `/admin/exports/download/json`, `/admin/exports/download/gedcom`, `/admin/exports/download/zip` trên `http://127.0.0.1:3001` - PASS; download routes trả lỗi cấu hình an toàn khi thiếu Supabase config.
- `npm audit --audit-level=moderate` - WARN, còn 2 moderate warnings từ `next`/`postcss`; không chạy force fix vì breaking change ngoài scope.

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa chạy migration trên Supabase thật.
- Chưa ghi `export_jobs`/`backup_records` vào DB runtime.
- Chưa làm import đầy đủ.
- Chưa làm media upload thật.
- Chưa làm export ảnh cây/PDF.
- Chưa kiểm thử với dữ liệu Supabase thật.
- NPM audit còn 2 moderate warnings từ `next`/`postcss`.

### Lưu ý cho AI tiếp theo

- Không bật import ghi dữ liệu nếu chưa có validation, preview, xác nhận và revision/import log.
- Không dùng admin export làm public export.
- Không bỏ `family.json`; GEDCOM không thay thế được JSON vì không giữ đủ dữ liệu riêng của hệ thống.

### Task tiếp theo đề xuất

Phase 9 - Revision history UI foundation.

## 2026-06-15 - Phase 7 Public/private mode foundation completed

### Trạng thái hiện tại

Dự án WEB GIA PHẢ đã có public/private foundation. Public routes dùng privacy service và public-safe DTO, không đưa dữ liệu admin/private thẳng ra client.

### Public/privacy service đã có

- `lib/privacy/privacy-types.ts`
- `lib/privacy/privacy-service.ts`
- `lib/family/public-family-service.ts`

Privacy service có:

- `canShowPersonInMode`
- `toPublicPerson`
- `toFamilyPerson`
- `toAdminPerson`
- `sanitizePersonForMode`
- `sanitizeTreeGraphForMode`

### Public routes đã có

- `/`: public homepage.
- `/tree`: public readonly tree.
- `/people/[slug]`: public-safe person profile.
- `/admin/preview/public`: admin preview mô phỏng public tree.

### Public privacy behavior

- Public mode chỉ hiện người `visibility = public` và chưa xóa mềm.
- `PublicPerson` không có `notes_private`.
- Người còn sống public không hiện ngày sinh đầy đủ, ngày mất, nơi sinh, quê quán, ghi chú riêng tư hoặc dữ liệu nội bộ.
- Public tree được sanitize server-side trước khi truyền vào React Flow viewer.
- Admin preview dùng cùng public service với `/tree`.

### RLS/public query limitation

- Phase 7 không mở RLS public rộng.
- Public service dùng server-side anon Supabase client với query/filter `visibility = public`, `deleted_at is null`.
- Nếu database thật chưa có public-safe RLS policy, public routes có thể empty hoặc báo lỗi an toàn.
- Không dùng service role để build public pages trong Phase 7.

### Script check đã tạo

- `npm run check:public-privacy`

### Lệnh đã chạy

- Baseline: `npm run check:foundation`, `npm run check:auth-permissions`, `npm run check:people`, `npm run check:relationships`, `npm run check:tree-viewer`, `npm run check:tree-editor`, `npm run typecheck`, `npm run lint`, `npm run build` - PASS
- Phase 7: `npm run check:public-privacy`, `npm run typecheck`, `npm run lint`, `npm run build` - PASS
- Browser route check `/`, `/tree`, `/people/test-slug`, `/admin/preview/public` trên `http://127.0.0.1:3001` - PASS; các route render nội dung an toàn khi thiếu Supabase config.

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa kiểm thử public routes với Supabase data thật.
- Chưa tạo public RLS policy/view/function riêng.
- Chưa làm export JSON/GEDCOM/ZIP thật.
- Chưa làm export ảnh/PDF.
- Chưa làm media upload thật.
- NPM audit còn 2 moderate warnings từ `next`/`postcss`.

### Lưu ý cho AI tiếp theo

- Không đưa `notes_private` vào public DTO.
- Không dựa vào CSS/UI để ẩn dữ liệu riêng tư.
- Nếu mở RLS public sau này, phải audit rất kỹ chỉ public-safe fields.
- Public tree/profile hiện dùng anon client; nếu DB policy chưa mở, fail/empty là expected-safe behavior.

### Task tiếp theo đề xuất

Phase 8 - Export/backup foundation:

- JSON export/import foundation.
- GEDCOM/ZIP planning hoặc export foundation.
- Không bỏ qua privacy/permission khi export.

## 2026-06-15 - Phase 6 Tree Editor foundation completed

### Trạng thái hiện tại

Dự án WEB GIA PHẢ đã có Tree Editor foundation trong admin. Editor dùng React Flow, side panel và server actions để lưu layout UI riêng hoặc thêm quan hệ qua service thật.

### Migration/layout persistence đã tạo

- Migration: `db/migrations/20260614_0005_tree_layout_foundation.sql`
- Bảng `tree_layouts`: lưu layout tree theo scope.
- Bảng `tree_layout_nodes`: lưu vị trí node thủ công.
- RLS: `tree.view` đọc layout chưa xóa mềm, `tree.edit_layout` tạo/sửa/xóa mềm layout.
- Layout là dữ liệu UI, không thay thế relationship tables.

### Tree editor đã có

- Route: `/admin/tree/edit`
- Actions: `app/(admin)/admin/tree/edit/actions.ts`
- Layout service: `lib/family/tree-layout-service.ts`
- Components:
  - `components/tree/family-tree-editor.tsx`
  - `components/tree/tree-editor-side-panel.tsx`
  - `components/tree/tree-editor-toolbar.tsx`
- `/admin/tree` vẫn readonly và chỉ thêm link `Chỉnh sửa cây` khi có `tree.edit_layout`.

### Side panel/action status

- Click person node mở side panel.
- Side panel hiển thị họ tên, năm sinh/mất, đời, chi/nhánh, link hồ sơ và quan hệ tóm tắt.
- Có form thêm cha/mẹ, vợ/chồng/bạn đời, con bằng UUID người đã tồn tại.
- Add relationship từ cây dùng relationship service thật.
- Không tạo người mới từ cây trong Phase 6.

### Permission/privacy status

- `/admin/tree/edit` yêu cầu `tree.view` và `tree.edit_layout`.
- Save/reset layout yêu cầu `tree.edit_layout`.
- Add relationship yêu cầu `relationships.create` trong relationship service.
- Client editor không import service role/admin helper.
- Public tree chưa làm.

### Script check đã tạo

- `npm run check:tree-editor`

### Lệnh đã chạy

- Baseline: `npm run check:foundation`, `npm run check:auth-permissions`, `npm run check:people`, `npm run check:relationships`, `npm run check:tree-viewer`, `npm run typecheck`, `npm run lint`, `npm run build` - PASS
- Phase 6: `npm run check:tree-editor`, `npm run typecheck`, `npm run lint`, `npm run build` - PASS
- Browser route check `/admin/tree` trên `http://127.0.0.1:3001` - PASS, hiển thị thiếu cấu hình an toàn khi chưa có Supabase env thật.
- Browser route check `/admin/tree/edit` trên `http://127.0.0.1:3001` - PASS, hiển thị thiếu cấu hình an toàn khi chưa có Supabase env thật.

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa chạy migration trên database thật.
- Chưa kiểm thử editor với Supabase data thật.
- Chưa làm public tree.
- Chưa export ảnh cây/PDF.
- Chưa làm JSON/GEDCOM/ZIP export thật.
- NPM audit còn 2 moderate warnings từ `next`/`postcss`.

### Lưu ý cho AI tiếp theo

- Không trộn layout tree với relationship data.
- Kéo node và lưu layout chỉ ghi `tree_layout_nodes`.
- Add relationship từ cây hiện tạo family unit nền rồi nối người đã tồn tại bằng UUID.
- Nếu thiếu Supabase env thật, `/admin/tree` và `/admin/tree/edit` phải fail an toàn, không dùng mock data.

### Task tiếp theo đề xuất

Phase 7 - Public/private mode foundation:

- Tạo public/internal surfaces.
- Lọc dữ liệu người còn sống và visibility server-side.
- Không chỉ ẩn dữ liệu private bằng UI.

## 2026-06-15 - Phase 5 Tree Viewer foundation completed

### Trạng thái hiện tại

Dự án WEB GIA PHẢ đã có Tree Viewer foundation trong admin. Viewer dùng graph được build từ dữ liệu thật trong `people` và relationship tables, chưa có tree editor hoặc layout persistence.

### Package đã thêm

- `@xyflow/react`
- `elkjs`

### Tree graph/viewer đã có

- Types: `lib/family/tree-types.ts`
- Graph builder: `lib/family/tree-graph-builder.ts`
- Tree service: `lib/family/tree-service.ts`
- ELK layout helper: `lib/family/tree-layout-elk.ts`
- Route: `/admin/tree`
- Components:
  - `components/tree/family-tree-viewer.tsx`
  - `components/tree/family-node-card.tsx`
  - `components/tree/family-tree-toolbar.tsx`
  - `components/tree/family-tree-empty-state.tsx`
  - `components/tree/family-tree-error-state.tsx`

### Graph model

- Node kind: `person`, `family`.
- Edge kind: `family_unit`, `parent_child`, `couple`.
- Family node trung gian gom cha/mẹ và con.
- Node person không chứa `notes_private`.
- Builder có mode `admin`, `internal`, `public`; Phase 5 chỉ dùng admin route.

### Permission/privacy status

- `/admin/tree` yêu cầu `tree.view`.
- Tree service query server-side và trả graph đã build cho client viewer.
- Client viewer không import service role/admin helper.
- Public tree chưa làm trong Phase 5.

### Script check đã tạo

- `npm run check:tree-viewer`

### Lệnh đã chạy

- Baseline: `npm run check:foundation`, `npm run check:auth-permissions`, `npm run check:people`, `npm run check:relationships`, `npm run typecheck`, `npm run lint`, `npm run build` - PASS
- Phase 5: `npm run check:tree-viewer`, `npm run typecheck`, `npm run lint`, `npm run build` - PASS
- Browser route check `/admin/tree` trên `http://127.0.0.1:3001` - PASS, hiển thị thiếu cấu hình an toàn khi chưa có Supabase env thật.

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa kiểm thử viewer với Supabase data thật.
- Chưa làm Tree Editor.
- Chưa lưu layout thủ công.
- Chưa làm public tree.
- Chưa export ảnh cây/PDF.
- Chưa làm export JSON/GEDCOM/ZIP thật.
- NPM audit còn 2 moderate warnings sau khi cài package.

### Lưu ý cho AI tiếp theo

- Không trộn dữ liệu layout cây với dữ liệu quan hệ thật.
- Tree editor/mutation từ cây là Phase 6, chưa có trong viewer.
- Nếu thiếu Supabase env thật, `/admin/tree` phải fail an toàn, không dùng mock data.
- Public tree cần lọc visibility server-side, không chỉ ẩn bằng UI.

### Task tiếp theo đề xuất

Phase 6 - Tree Editor foundation:

- Thêm edit interactions qua service/action có permission rõ ràng.
- Nếu lưu layout, dùng bảng `tree_layouts`, `tree_layout_nodes`, `tree_layout_edges` riêng.
- Không coi kéo node là sửa quan hệ gia phả thật.

## 2026-06-15 - Phase 4 Relationship CRUD foundation completed

### Trạng thái hiện tại

Dự án WEB GIA PHẢ đã có Relationship CRUD foundation trong admin. Relationship data được lưu trong bảng riêng, có permission server-side, RLS, soft delete, revision và cycle check cơ bản.

### Relationship schema đã tạo

- Migration: `db/migrations/20260614_0004_relationship_foundation.sql`
- Bảng `families`: nhóm family với `family_code`, `family_label`, `visibility`, notes, audit và soft delete fields.
- Bảng `family_parents`: nối family với cha/mẹ/người nuôi bằng `parent_role` và `relationship_type`.
- Bảng `family_children`: nối family với con bằng `child_relationship_type`.
- Bảng `couple_relationships`: lưu quan hệ đôi với `relationship_status`, ngày bắt đầu/kết thúc, `visibility`, notes, audit và soft delete fields.

### Service/UI đã có

- `lib/family/relationship-service.ts`: list, summary theo person, create family, add parent/child, create/update couple, soft delete relationship records.
- `lib/family/relationship-graph.ts`: cycle check cha-con cơ bản.
- `lib/family/revision-service.ts`: helper revision dùng chung.
- `/admin/relationships`: danh sách family/couple, form tạo family, thêm cha/mẹ/con, tạo quan hệ đôi.
- `/admin/people/[id]`: có section Quan hệ gia đình.
- Admin nav có link `Quan hệ gia đình`.

### RLS/permission status

- Bật RLS cho `families`, `family_parents`, `family_children`, `couple_relationships`.
- `relationships.view` xem bản ghi chưa xóa mềm.
- `relationships.create` insert.
- `relationships.update`/`relationships.delete` update hoặc xóa mềm.
- Service layer vẫn enforce action-specific permission trước từng mutation.
- Không mở public-wide policy cho relationship tables.

### Script check đã tạo

- `npm run check:relationships`

### Lệnh đã chạy

- Baseline: `npm run check:foundation`, `npm run check:auth-permissions`, `npm run check:people`, `npm run typecheck`, `npm run lint`, `npm run build` - PASS
- Phase 4: `npm run check:relationships`, `npm run typecheck`, `npm run lint`, `npm run build` - PASS
- Browser route check `/admin/relationships` trên `http://127.0.0.1:3001` - PASS
- Browser route check `/admin/people/00000000-0000-0000-0000-000000000000` trên `http://127.0.0.1:3001` - PASS
- `git diff --check` - PASS

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa chạy migration trên database thật.
- Chưa kiểm thử Relationship CRUD với Supabase project thật.
- Chưa làm tree viewer/editor.
- Chưa cài React Flow/ELK trong Phase 4.
- Chưa làm public family tree.
- Chưa làm media upload thật.
- Chưa làm export JSON/GEDCOM/ZIP thật.

### Lưu ý cho AI tiếp theo

- Không thêm `father_id`, `mother_id`, `spouse_id` vào `people`.
- Relationship UI hiện nhập UUID trực tiếp, chưa có autocomplete.
- Nếu thiếu Supabase env thật, relationship routes phải fail an toàn, không dùng mock data.
- Tree viewer/editor và layout graph là phase sau, không nằm trong Phase 4.

### Task tiếp theo đề xuất

Phase 5 - Tree viewer foundation:

- Đọc relationship tables để dựng dữ liệu cây.
- Chỉ cài React Flow/ELK khi phase tree cho phép.
- Không trộn dữ liệu layout cây với dữ liệu quan hệ thật.

## 2026-06-15 - Phase 3 People CRUD foundation completed

### Trạng thái hiện tại

Dự án WEB GIA PHẢ đã có nền quản lý thành viên trong admin. Các route People CRUD foundation đã được tạo, dùng permission server-side và soft delete, chưa làm quan hệ gia đình hoặc cây gia phả.

### People schema đã tạo

- Migration: `db/migrations/20260614_0003_people_foundation.sql`
- Bảng `people` gồm identity, birth/death, place/branch, content/privacy, audit và soft delete fields.
- `visibility`: `public`, `family`, `private`.
- `gender`: `male`, `female`, `other`, `unknown`.
- Date precision: `exact`, `year_month`, `year`, `approximate`, `unknown`.

### Soft delete rule

- Không xóa cứng.
- Soft delete dùng `deleted_at`, `deleted_by`, `delete_reason`.
- Restore xóa các field soft-delete và ghi revision restore.

### Revision status

- Tạo foundation `revisions` và `revision_items`.
- People service ghi revision tối thiểu cho create/update/delete/restore với `before_json`, `after_json`, `changed_by`, `change_reason`.
- Chưa làm UI revision history hoặc restore revision nâng cao.

### RLS status

- Bật RLS cho `people`, `revisions`, `revision_items`.
- `people.view` xem bản ghi chưa xóa mềm.
- `people.create` insert.
- Update policy cho người có `people.update`, `people.delete`, hoặc `people.restore`.
- Service layer vẫn enforce action-specific permission trước từng mutation.
- Không mở public-wide policy cho `people`.

### CRUD route đã có

- `/admin/people`: danh sách, search, filter visibility/is_living.
- `/admin/people/new`: form thêm thành viên.
- `/admin/people/[id]`: xem/sửa, soft delete, restore.

### Script check đã tạo

- `npm run check:people`

### Lệnh đã chạy

- `npm run check:foundation` - PASS
- `npm run check:auth-permissions` - PASS
- `npm run check:people` - PASS
- `npm run typecheck` - PASS
- `npm run lint` - PASS
- `npm run build` - PASS
- Browser route check `/admin/people`, `/admin/people/new`, `/admin/people/[id]` trên `http://127.0.0.1:3001` - PASS

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa chạy migration trên database thật.
- Chưa kiểm thử CRUD với Supabase project thật.
- Chưa làm Relationship CRUD.
- Chưa tạo `families`, `family_parents`, `family_children`, `couple_relationships`.
- Chưa làm cây gia phả.
- Chưa làm media upload thật.
- Chưa làm export JSON/GEDCOM/ZIP thật.

### Lưu ý cho AI tiếp theo

- Không xóa cứng people.
- Không thêm relationship vào `people`.
- Relationship CRUD phải dùng bảng quan hệ riêng ở phase sau.
- Service role vẫn chỉ dùng server-side.
- Nếu chưa có Supabase env thật, People UI phải fail an toàn, không dùng mock data.

### Task tiếp theo đề xuất

Phase 4 - Relationship CRUD foundation:

- Tạo `families`, `family_parents`, `family_children`, `couple_relationships`.
- Gắn permissions `relationships.*`.
- Kiểm tra vòng lặp dữ liệu cơ bản.
- Không làm React Flow/ELK tree viewer nếu chưa sang phase cây.

## 2026-06-14 - Phase 2 Auth + Role Permission hardening completed

### Trạng thái hiện tại

Dự án WEB GIA PHẢ đã có auth/permission foundation server-side. Route `/admin` không còn là placeholder mở; route này yêu cầu user đăng nhập và có permission `people.view`.

### Auth flow đã chọn

- Supabase magic link theo email.
- Login UI tối giản tại `/auth/login`.
- Callback tại `/auth/callback`.
- Logout tại `/auth/logout`.
- Nếu thiếu cấu hình Supabase, login page hiển thị cảnh báo thay vì crash trắng.

### OWNER bootstrap đã chọn

- Không auto OWNER.
- User mới chỉ được bootstrap profile, không tự động có role admin.
- OWNER cần gán thủ công bằng SQL/admin context.
- Snippet: `db/snippets/assign-owner-role.sql`.

### Permission/admin guard

- Permission service server-side:
  - `lib/permissions/permission-service.ts`
  - `lib/permissions/require-permission.ts`
- Profile bootstrap:
  - `lib/auth/profile-service.ts`
- Quyền tối thiểu vào `/admin`: `people.view`.
- Nếu chưa đăng nhập: redirect `/auth/login`.
- Nếu đăng nhập nhưng thiếu quyền: redirect `/unauthorized`.

### Migration đã tạo

- `db/migrations/20260614_0002_auth_permission_hardening.sql`

Migration bổ sung:

- Bật lại RLS cho bảng nền.
- Recreate helper functions `current_profile_id()` và `has_permission(permission_code text)`.
- Cho authenticated user insert/update profile của chính mình.
- Cho user đọc role assignment và role permissions của chính mình.
- Thêm policy quản lý roles/permissions cho người có `permissions.manage`.
- Không mở public rộng cho bảng nhạy cảm.

### Script check đã tạo

- `npm run check:auth-permissions`

### Lệnh đã chạy

- `npm run check:foundation` - PASS
- `npm run check:auth-permissions` - PASS
- `npm run typecheck` - PASS
- `npm run lint` - PASS
- `npm run build` - PASS
- Browser route check `/auth/login`, `/auth/logout`, `/unauthorized`, `/admin` trên `http://127.0.0.1:3001` - PASS

### Chưa làm

- Chưa push remote.
- Chưa deploy Cloudflare.
- Chưa tạo `.env` thật.
- Chưa kết nối Supabase project thật.
- Chưa chạy migration trên database thật.
- Chưa kiểm thử magic link với Supabase project thật.
- Chưa làm People CRUD.
- Chưa làm Relationship CRUD.
- Chưa làm cây gia phả.
- Chưa làm export JSON/GEDCOM/ZIP thật.

### Lưu ý cho AI tiếp theo

- Không đưa `SUPABASE_SERVICE_ROLE_KEY` vào client.
- Không tự động cấp OWNER nếu chưa có quyết định mới.
- `/admin` đang dùng `people.view` làm quyền vào cổng quản trị.
- Nếu cần OWNER đầu tiên, dùng `db/snippets/assign-owner-role.sql` sau khi profile đã tồn tại.
- Route guard và permission helper là server-side; không thay bằng kiểm tra UI.

### Task tiếp theo đề xuất

Phase 3 - People CRUD foundation:

- Tạo schema people theo docs.
- Xóa mềm/khôi phục, không xóa cứng.
- List/profile/search/filter thành viên.
- Gắn permission `people.*` vào service layer và UI.
- Không làm quan hệ/cây nếu chưa sang phase sau.

## 2026-06-14 - Phase 1 Project foundation completed

### Trạng thái hiện tại

Dự án WEB GIA PHẢ đã có Next.js App Router foundation, Supabase helper foundation, migration nền roles/permissions và script kiểm tra foundation.

### Stack/code foundation đã có

- Next.js App Router tại root `app/`.
- TypeScript.
- Tailwind CSS.
- ESLint.
- Supabase browser/server/admin helpers.
- Public route `/`.
- Admin placeholder `/admin`.
- Login placeholder `/auth/login`.
- Logout route `/auth/logout`.
- `.env.example`.
- `.gitattributes`.
- `wrangler.toml` placeholder cho Cloudflare.

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

- `db/migrations/20260614_0001_foundation_auth_roles_permissions.sql`

Migration tạo:

- `profiles`
- `roles`
- `permissions`
- `role_permissions`
- `profile_roles`
- seed roles nền
- seed permissions nền
- RLS foundation
- helper functions `current_profile_id()` và `has_permission(permission_code text)`

### Script check đã tạo

- `npm run check:foundation`
- `npm run typecheck`

### Lệnh đã chạy

- `npm run check:foundation` - PASS
- `npm run typecheck` - PASS
- `npm run lint` - PASS
- `npm run build` - PASS
- Browser route check `/`, `/admin`, `/auth/login` trên `http://127.0.0.1:3001` - PASS

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

### Lưu ý cho AI tiếp theo

- Không đưa `SUPABASE_SERVICE_ROLE_KEY` vào client.
- Không bỏ RLS trong migration/schema mới.
- App dùng `app/` root, không dùng `src/`.
- Supabase SSR helper đã có trong `lib/supabase/server.ts`.
- Admin helper `lib/supabase/admin.ts` có `server-only`; không import vào Client Component.

### Task tiếp theo đề xuất

Phase 2 - Auth + Role Permission hardening:

- Kết nối Supabase project thật qua `.env`.
- Hoàn thiện login/logout thật.
- Tạo profile sau đăng nhập.
- Siết RLS/policy theo role permission.
- Thêm kiểm tra schema/permission chi tiết hơn.

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
