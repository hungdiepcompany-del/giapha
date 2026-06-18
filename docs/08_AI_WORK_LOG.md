# AI Work Log

## 2026-06-18 - Phase 85 Backup Permission Rollback Drill Plan

### Phase

Phase 85 - Backup Permission Rollback Drill Plan

### Viec da lam

- Tao rollback drill plan cho future backup permission migration execution.
- Ghi failure scenarios bat buoc: owner/admin mat `/admin/backups`, API dry-run 403 nham, thieu permission seed, role assignment sai, wrong project, fallback removal qua som.
- Ghi rollback options: restore from snapshot, sua role_permissions, giu permission rows, giu fallback `permissions.manage`.
- Tao checker local cho rollback drill plan.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/85_BACKUP_PERMISSION_ROLLBACK_DRILL_PLAN.md
- scripts/check-backup-permission-rollback-drill-plan.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration moi.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong chay migration that.
- Khong apply DB.
- Khong mutate DB.
- Khong chay rollback that.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Supabase/API/DB/network.

## 2026-06-18 - Phase 84 Backup Permission Pre-Apply Verification Checklist

### Phase

Phase 84 - Backup Permission Pre-Apply Verification Checklist

### Viec da lam

- Tao checklist pre-apply cho future migration execution.
- Ghi ro canonical path `db/migrations/20260618_0007_backup_operator_permissions.sql`.
- Ghi no-go conditions: owner approval, DB backup/snapshot, dung Supabase project, static checks, canonical path, rollback owner, smoke owner, expected roles va fallback plan.
- Tao checker local cho checklist.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/84_BACKUP_PERMISSION_PRE_APPLY_VERIFICATION_CHECKLIST.md
- scripts/check-backup-permission-pre-apply-verification-checklist.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration moi.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong chay migration that.
- Khong apply DB.
- Khong mutate DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Supabase/API/DB/network.

## 2026-06-18 - Phase 83 Backup Permission Migration Path Canonicalization & Execution Runbook

### Phase

Phase 83 - Backup Permission Migration Path Canonicalization & Execution Runbook

### Viec da lam

- Chuyen canonical migration path ve `db/migrations/20260618_0007_backup_operator_permissions.sql`.
- Xoa wrong old path `supabase/migrations/20260618_0007_backup_operator_permissions.sql` khoi tracked files.
- Cap nhat Phase 78-82 docs/check scripts de doc migration tu `db/migrations/`.
- Tao execution runbook cho future apply, yeu cau owner approval, DB backup/snapshot, pre-apply checks, post-apply verification va rollback notes.
- Tao canonical path checker de chan duplicate/sai thu muc.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- db/migrations/20260618_0007_backup_operator_permissions.sql
- docs/83_BACKUP_PERMISSION_MIGRATION_EXECUTION_RUNBOOK.md
- scripts/check-backup-permission-migration-canonical-path.cjs
- scripts/check-backup-permission-migration-execution-runbook.cjs
- docs/78_BACKUP_PERMISSION_REAL_MIGRATION_FILE_IMPLEMENTATION.md
- docs/79_BACKUP_PERMISSION_MIGRATION_STATIC_VERIFICATION.md
- docs/82_BACKUP_PERMISSION_REAL_MIGRATION_HANDOFF.md
- scripts/check-backup-permission-real-migration-file.cjs
- scripts/check-backup-permission-real-migration-static-verification.cjs
- scripts/check-backup-permission-real-migration-handoff.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration moi; move file da co ve canonical path `db/migrations/`.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong chay migration that.
- Khong apply DB.
- Khong mutate DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Supabase/API/DB/network.

## 2026-06-18 - Phase 82 Backup Permission Real Migration Handoff

### Phase

Phase 82 - Backup Permission Real Migration Handoff

### Viec da lam

- Tao `docs/82_BACKUP_PERMISSION_REAL_MIGRATION_HANDOFF.md`.
- Tao `scripts/check-backup-permission-real-migration-handoff.cjs`.
- Them `npm run check:backup-permission-real-migration-handoff`.
- Tong hop Phase 78-82: migration file, static verification, fallback removal plan, post-migration smoke plan va handoff.
- Ghi ro migration file exists in `supabase/migrations/`, migration has not been run, no DB mutation, no deploy va no production backup.
- Ghi ro fallback `permissions.manage` van con va `backup.operator.execute`/`backup.operator.restore` still not enabled.
- Ghi required future migration execution approval, DB backup/snapshot va rollback plan.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/82_BACKUP_PERMISSION_REAL_MIGRATION_HANDOFF.md
- scripts/check-backup-permission-real-migration-handoff.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration moi trong Phase 82.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong chay migration that.
- Khong apply DB.
- Khong mutate DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Supabase/API/DB/network.

## 2026-06-18 - Phase 81 Backup Permission Post-Migration Smoke Plan

### Phase

Phase 81 - Backup Permission Post-Migration Smoke Plan

### Viec da lam

- Tao `docs/81_BACKUP_PERMISSION_POST_MIGRATION_SMOKE_PLAN.md`.
- Tao `scripts/smoke-backup-permission-post-migration.cjs`.
- Tao `scripts/check-backup-permission-post-migration-smoke-plan.cjs`.
- Them `npm run smoke:backup-permission:post-migration`.
- Them `npm run check:backup-permission-post-migration-smoke-plan`.
- Smoke script safe-skip khi thieu `BACKUP_PERMISSION_SMOKE_BASE_URL` hoac `BACKUP_PERMISSION_SMOKE_EXPECTED_USER`.
- Smoke script khong doc `.env.local`/`.dev.vars`, khong dung token va khong goi URL khi thieu env explicit.
- Ghi no-real-backup policy va failure handling.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/81_BACKUP_PERMISSION_POST_MIGRATION_SMOKE_PLAN.md
- scripts/smoke-backup-permission-post-migration.cjs
- scripts/check-backup-permission-post-migration-smoke-plan.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration moi trong Phase 81.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong chay migration that.
- Khong apply DB.
- Khong mutate DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Supabase/API/DB truc tiep.
- Smoke mac dinh SKIPPED khi thieu explicit env.

## 2026-06-18 - Phase 80 Backup Permission Runtime Fallback Removal Plan

### Phase

Phase 80 - Backup Permission Runtime Fallback Removal Plan

### Viec da lam

- Tao `docs/80_BACKUP_PERMISSION_RUNTIME_FALLBACK_REMOVAL_PLAN.md`.
- Tao `scripts/check-backup-permission-runtime-fallback-removal-plan.cjs`.
- Them `npm run check:backup-permission-runtime-fallback-removal-plan`.
- Ghi current fallback `permissions.manage` va preconditions truoc khi bo fallback.
- Ghi API fallback removal plan, UI fallback removal plan, post-removal smoke plan va rollback plan.
- Checker xac nhan runtime API/UI van con `permissions.manage` trong Phase 80.
- Khong sua runtime fallback, khong chay migration va khong mutate DB.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/80_BACKUP_PERMISSION_RUNTIME_FALLBACK_REMOVAL_PLAN.md
- scripts/check-backup-permission-runtime-fallback-removal-plan.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration moi trong Phase 80.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong chay migration that.
- Khong apply DB.
- Khong mutate DB.
- Khong sua runtime fallback.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Supabase/API/DB/network.

## 2026-06-18 - Phase 79 Backup Permission Migration Static Verification

### Phase

Phase 79 - Backup Permission Migration Static Verification

### Viec da lam

- Tao `docs/79_BACKUP_PERMISSION_MIGRATION_STATIC_VERIFICATION.md`.
- Tao `scripts/check-backup-permission-real-migration-static-verification.cjs`.
- Them `npm run check:backup-permission-real-migration-static-verification`.
- Checker scan `supabase/migrations/20260618_0007_backup_operator_permissions.sql`.
- Checker xac nhan filename pattern, markers, 4 permission names, idempotency va role assignment khong vuot qua `OWNER`/`ADMIN`.
- Checker chan destructive SQL, URL/network text, secret-like text va runtime backup/restore action wording.
- Khong chay migration, khong apply DB va khong goi Supabase/API/DB/network.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/79_BACKUP_PERMISSION_MIGRATION_STATIC_VERIFICATION.md
- scripts/check-backup-permission-real-migration-static-verification.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration moi trong Phase 79.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong chay migration that.
- Khong apply DB.
- Khong mutate DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Supabase/API/DB/network.

## 2026-06-18 - Phase 78 Backup Permission Real Migration File Implementation

### Phase

Phase 78 - Backup Permission Real Migration File Implementation

### Viec da lam

- Tao `supabase/migrations/20260618_0007_backup_operator_permissions.sql`.
- Tao `docs/78_BACKUP_PERMISSION_REAL_MIGRATION_FILE_IMPLEMENTATION.md`.
- Tao `scripts/check-backup-permission-real-migration-file.cjs`.
- Them `npm run check:backup-permission-real-migration-file`.
- Migration file seed 4 permission `backup.operator.*` va role assignments cho `OWNER`/`ADMIN`.
- Migration co marker `BACKUP_PERMISSION_REAL_MIGRATION_FILE`, `OWNER_APPROVED_FILE_CREATION_ONLY`, `DO_NOT_RUN_WITHOUT_SEPARATE_OWNER_APPROVAL`.
- Khong chay migration, khong apply DB va khong goi Supabase/API/DB/network.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- supabase/migrations/20260618_0007_backup_operator_permissions.sql
- docs/78_BACKUP_PERMISSION_REAL_MIGRATION_FILE_IMPLEMENTATION.md
- scripts/check-backup-permission-real-migration-file.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Co: `supabase/migrations/20260618_0007_backup_operator_permissions.sql`.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong chay migration that.
- Khong apply DB.
- Khong mutate DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Supabase/API/DB/network.
- Khong bat execute/restore runtime.

## 2026-06-18 - Phase 77 Backup Permission Migration Candidate Handoff

### Phase

Phase 77 - Backup Permission Migration Candidate Handoff

### Viec da lam

- Tao `docs/77_BACKUP_PERMISSION_MIGRATION_CANDIDATE_HANDOFF.md`.
- Tao `scripts/check-backup-permission-migration-candidate-handoff.cjs`.
- Them `npm run check:backup-permission-migration-candidate-handoff`.
- Tong hop Phase 73-77: SQL candidate draft, static safety, seed candidate smoke, approval checklist va handoff.
- Ghi ro SQL candidate is not real migration, no file in `supabase/migrations/`, no DB mutation, no deploy va no production backup.
- Ghi ro `backup.operator.execute` va `backup.operator.restore` still not enabled.
- Ghi required future real migration, DB backup/snapshot va rollback plan.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/77_BACKUP_PERMISSION_MIGRATION_CANDIDATE_HANDOFF.md
- scripts/check-backup-permission-migration-candidate-handoff.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong tao migration that.
- Khong chay SQL.
- Khong chay migration that.
- Khong mutate DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Supabase/API/DB/network.
- Khong tao file trong `supabase/migrations/`.

## 2026-06-18 - Phase 76 Backup Permission Real Migration Approval Checklist

### Phase

Phase 76 - Backup Permission Real Migration Approval Checklist

### Viec da lam

- Tao `docs/76_BACKUP_PERMISSION_REAL_MIGRATION_APPROVAL_CHECKLIST.md`.
- Tao `scripts/check-backup-permission-real-migration-approval-checklist.cjs`.
- Them `npm run check:backup-permission-real-migration-approval-checklist`.
- Ghi marker approval `OWNER_APPROVAL_REQUIRED_BEFORE_BACKUP_PERMISSION_REAL_MIGRATION=true`.
- Ghi required SQL candidate checks, seed dry-run checks, DB backup/snapshot, rollback plan, production window va post-migration validation.
- Ghi explicit no-go conditions truoc khi tao/apply migration that.
- Ghi ro Phase 76 khong tao migration that, khong chay SQL, khong mutate DB.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/76_BACKUP_PERMISSION_REAL_MIGRATION_APPROVAL_CHECKLIST.md
- scripts/check-backup-permission-real-migration-approval-checklist.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong tao migration that.
- Khong chay SQL.
- Khong chay migration that.
- Khong mutate DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Supabase/API/DB/network.

## 2026-06-18 - Phase 75 Backup Permission Seed Candidate Smoke

### Phase

Phase 75 - Backup Permission Seed Candidate Smoke

### Viec da lam

- Tao `docs/75_BACKUP_PERMISSION_SEED_CANDIDATE_SMOKE.md`.
- Tao `scripts/smoke-backup-permission-seed-candidate.cjs`.
- Tao `scripts/check-backup-permission-seed-candidate-smoke.cjs`.
- Them `npm run smoke:backup-permission:seed-candidate`.
- Them `npm run check:backup-permission-seed-candidate-smoke`.
- Smoke local so sanh SQL candidate draft voi seed dry-run script.
- Smoke xac nhan 4 permission names va no-production marker dong nhat.
- Smoke khong chay SQL, khong goi DB/network, khong doc env va khong mutate file.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/75_BACKUP_PERMISSION_SEED_CANDIDATE_SMOKE.md
- scripts/smoke-backup-permission-seed-candidate.cjs
- scripts/check-backup-permission-seed-candidate-smoke.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong chay SQL.
- Khong chay migration that.
- Khong mutate DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Supabase/API/DB/network.

## 2026-06-18 - Phase 74 Backup Permission SQL Static Safety Check

### Phase

Phase 74 - Backup Permission SQL Static Safety Check

### Viec da lam

- Tao `docs/74_BACKUP_PERMISSION_SQL_STATIC_SAFETY_CHECK.md`.
- Tao `scripts/check-backup-permission-sql-static-safety.cjs`.
- Them `npm run check:backup-permission-sql-static-safety`.
- Static checker scan `scripts/backup-permission-sql-candidate.sql.draft`.
- Checker yeu cau marker `BACKUP_PERMISSION_SQL_CANDIDATE_ONLY` va `DO_NOT_RUN_ON_PRODUCTION_WITHOUT_OWNER_APPROVAL`.
- Checker yeu cau 4 permission names va idempotency concept.
- Checker chan destructive SQL, network URL, `service_role`, `anon key`, `jwt secret` va `security definer`.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/74_BACKUP_PERMISSION_SQL_STATIC_SAFETY_CHECK.md
- scripts/check-backup-permission-sql-static-safety.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong chay SQL.
- Khong chay migration that.
- Khong mutate DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Supabase/API/DB/network.

## 2026-06-18 - Phase 73 Backup Permission SQL Candidate Draft

### Phase

Phase 73 - Backup Permission SQL Candidate Draft

### Viec da lam

- Tao `docs/73_BACKUP_PERMISSION_SQL_CANDIDATE_DRAFT.md`.
- Tao `scripts/backup-permission-sql-candidate.sql.draft`.
- Tao `scripts/check-backup-permission-sql-candidate-draft.cjs`.
- Them `npm run check:backup-permission-sql-candidate-draft`.
- SQL draft co marker `BACKUP_PERMISSION_SQL_CANDIDATE_ONLY` va `DO_NOT_RUN_ON_PRODUCTION_WITHOUT_OWNER_APPROVAL`.
- SQL draft nam trong `scripts/`, khong nam trong `supabase/migrations/`.
- SQL draft chi mo ta upsert permission va role_permissions bang `on conflict`, khong chay SQL va khong mutate DB.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/73_BACKUP_PERMISSION_SQL_CANDIDATE_DRAFT.md
- scripts/backup-permission-sql-candidate.sql.draft
- scripts/check-backup-permission-sql-candidate-draft.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong chay migration that.
- Khong mutate DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Supabase/API/DB/network.
- Khong tao file trong `supabase/migrations/`.

## 2026-06-18 - Phase 72 Backup Permission Seed Readiness Handoff

### Phase

Phase 72 - Backup Permission Seed Readiness Handoff

### Viec da lam

- Tao `docs/72_BACKUP_PERMISSION_SEED_READINESS_HANDOFF.md`.
- Tao `scripts/check-backup-permission-seed-readiness-handoff.cjs`.
- Them `npm run check:backup-permission-seed-readiness-handoff`.
- Tong hop status Phase 68-72: design, seed dry-run, assignment runbook, activation guardrails va handoff.
- Ghi ro no migration/schema in Phase 68-72, no DB mutation, no real worker call, no deploy, no production backup, no real storage va no secret committed.
- Ghi ro `backup.operator.execute` va `backup.operator.restore` still not enabled.
- Ghi ro fallback `permissions.manage` van con trong runtime cho den khi co migration/seed that.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/72_BACKUP_PERMISSION_SEED_READINESS_HANDOFF.md
- scripts/check-backup-permission-seed-readiness-handoff.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong chay migration that.
- Khong mutate DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Supabase/API/network.
- Khong goi backup service worker that.
- Khong bat execute/restore that.

## 2026-06-18 - Phase 71 Backup Permission Activation Guardrails

### Phase

Phase 71 - Backup Permission Activation Guardrails

### Viec da lam

- Tao `docs/71_BACKUP_PERMISSION_ACTIVATION_GUARDRAILS.md`.
- Tao `scripts/check-backup-permission-activation-guardrails.cjs`.
- Them `npm run check:backup-permission-activation-guardrails`.
- Guardrail scan `app/api/admin/backups`, `app/(admin)/admin/backups`, `components/admin/backup-operator-dry-run-panel.tsx`, `server/services/backup-service-client.ts` va `scripts/backup-permission-seed-dry-run.cjs`.
- Chan `backup.operator.execute`/`backup.operator.restore` trong runtime route/page/component/service.
- Chan worker real call, production backup trigger, storage upload, restore trigger, hardcoded token/key va `.env.local`/`.dev.vars` read.
- Cho phep execute/restore trong seed dry-run script vi script co marker dry-run va khong mutate DB/network.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/71_BACKUP_PERMISSION_ACTIVATION_GUARDRAILS.md
- scripts/check-backup-permission-activation-guardrails.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong chay migration that.
- Khong mutate DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Supabase/API/network.
- Khong goi backup service worker that.
- Khong bat execute/restore that.

## 2026-06-18 - Phase 70 Backup Permission Assignment Runbook

### Phase

Phase 70 - Backup Permission Assignment Runbook

### Viec da lam

- Tao `docs/70_BACKUP_PERMISSION_ASSIGNMENT_RUNBOOK.md`.
- Tao `scripts/check-backup-permission-assignment-runbook.cjs`.
- Them `npm run check:backup-permission-assignment-runbook`.
- Ghi permission list, recommended role assignments, operator assignment workflow, approval required, verification checklist va rollback checklist.
- Ghi ro `OWNER` duoc de xuat all four, `ADMIN` view/dry_run, other roles none by default unless owner approves.
- Ghi ro Phase 70 khong assign that, khong SQL, khong migration va khong mutate DB.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/70_BACKUP_PERMISSION_ASSIGNMENT_RUNBOOK.md
- scripts/check-backup-permission-assignment-runbook.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong chay migration that.
- Khong mutate DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Supabase/API/network.
- Khong goi backup service worker that.

## 2026-06-18 - Phase 69 Backup Permission Seed Dry-Run Checker

### Phase

Phase 69 - Backup Permission Seed Dry-Run Checker

### Viec da lam

- Tao `docs/69_BACKUP_PERMISSION_SEED_DRY_RUN_CHECKER.md`.
- Tao `scripts/backup-permission-seed-dry-run.cjs`.
- Tao `scripts/check-backup-permission-seed-dry-run.cjs`.
- Them `npm run backup:permission:seed:dry-run`.
- Them `npm run check:backup-permission-seed-dry-run`.
- Dry-run script output marker `BACKUP_PERMISSION_SEED_DRY_RUN_ONLY`.
- Dry-run script mo phong `would_insert`, `would_assign`, `dry_run: true`, khong import Supabase, khong doc env va khong ghi migration.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/69_BACKUP_PERMISSION_SEED_DRY_RUN_CHECKER.md
- scripts/backup-permission-seed-dry-run.cjs
- scripts/check-backup-permission-seed-dry-run.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong chay migration that.
- Khong mutate DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Supabase/API/network.
- Khong goi backup service worker that.

## 2026-06-18 - Phase 68 Backup Permission Migration/Seed Design

### Phase

Phase 68 - Backup Permission Migration/Seed Design

### Viec da lam

- Tao `docs/68_BACKUP_PERMISSION_MIGRATION_SEED_DESIGN.md`.
- Tao `scripts/check-backup-permission-migration-seed-design.cjs`.
- Them `npm run check:backup-permission-migration-seed-design`.
- Tong hop permission/migration pattern hien co trong `db/migrations`.
- De xuat future permission rows `backup.operator.view`, `backup.operator.dry_run`, `backup.operator.execute`, `backup.operator.restore`.
- De xuat mapping theo role hien co: `OWNER` co view/dry_run/execute/restore, `ADMIN` co view/dry_run, cac role khac none by default.
- Ghi ro Phase 68 chi design, khong tao/chay migration, khong mutate DB.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/68_BACKUP_PERMISSION_MIGRATION_SEED_DESIGN.md
- scripts/check-backup-permission-migration-seed-design.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong chay migration that.
- Khong mutate DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi backup service worker that.
- Khong tao/upload backup production that.

## 2026-06-18 - Phase 67 Backup Operator Permission Handoff

### Phase

Phase 67 - Backup Operator Permission Handoff

### Viec da lam

- Tao `docs/67_BACKUP_OPERATOR_PERMISSION_HANDOFF.md`.
- Tao `scripts/check-backup-operator-permission-handoff.cjs`.
- Them `npm run check:backup-operator-permission-handoff`.
- Tong hop Phase 63-67: permission model review, API guard, UI guard, smoke va guardrail status.
- Ghi ro permission names proposed/used: `backup.operator.view`, `backup.operator.dry_run`, `backup.operator.execute`, `backup.operator.restore`.
- Ghi ro fallback hien tai la `permissions.manage` cho den khi co migration/seed permission that.
- Ghi ro chua co real worker call, chua deploy, chua production backup, chua real storage, chua secret committed, chua migration/schema trong Phase 63-67.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/67_BACKUP_OPERATOR_PERMISSION_HANDOFF.md
- scripts/check-backup-operator-permission-handoff.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong goi backup service worker that.
- Khong hardcode URL/token/key.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong tao/upload backup production that.
- Khong restore production.

## 2026-06-18 - Phase 66 Backup Operator Permission Smoke & Guardrails

### Phase

Phase 66 - Backup Operator Permission Smoke & Guardrails

### Viec da lam

- Tao `docs/66_BACKUP_OPERATOR_PERMISSION_SMOKE_GUARDRAILS.md`.
- Tao `scripts/smoke-backup-operator-permission-guard.cjs`.
- Tao `scripts/check-backup-operator-permission-guardrails.cjs`.
- Them `npm run smoke:backup-operator:permission-guard`.
- Them `npm run check:backup-operator-permission-guardrails`.
- Smoke xac nhan API/UI markers, permission names, adapter dry-run marker va no-real-backup fields.
- Guardrail scan operator route/page/component va dry-run adapter de chan worker URL, secret, production backup, storage upload, restore, cron va env file read.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/66_BACKUP_OPERATOR_PERMISSION_SMOKE_GUARDRAILS.md
- scripts/smoke-backup-operator-permission-guard.cjs
- scripts/check-backup-operator-permission-guardrails.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong goi backup service worker that.
- Khong hardcode URL/token/key.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong tao/upload backup production that.
- Khong restore production.

## 2026-06-18 - Phase 65 Backup Operator UI Permission Guard

### Phase

Phase 65 - Backup Operator UI Permission Guard

### Viec da lam

- Cap nhat `app/(admin)/admin/backups/page.tsx` voi marker `BACKUP_OPERATOR_UI_PERMISSION_GUARD`.
- Dung `getPermissionContext` de guard `/admin/backups` server-side.
- Check `backup.operator.view` truoc, fallback fail-closed bang `permissions.manage` vi chua co migration/seed permission backup.
- Redirect anonymous user ve login va unauthorized user ve `/unauthorized?reason=missing_backup_operator_view`.
- Cap nhat `components/admin/backup-operator-dry-run-panel.tsx` de nhan permission guard/source va van chi goi route noi bo dry-run.
- Tao `docs/65_BACKUP_OPERATOR_UI_PERMISSION_GUARD.md`.
- Tao `scripts/check-backup-operator-ui-permission-guard.cjs`.
- Them `npm run check:backup-operator-ui-permission-guard`.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- app/(admin)/admin/backups/page.tsx
- components/admin/backup-operator-dry-run-panel.tsx
- docs/65_BACKUP_OPERATOR_UI_PERMISSION_GUARD.md
- scripts/check-backup-operator-ui-permission-guard.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong goi backup service worker that.
- Khong hardcode URL/token/key.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong tao/upload backup production that.
- Khong restore production.

## 2026-06-18 - Phase 64 Backup Operator API Permission Guard

### Phase

Phase 64 - Backup Operator API Permission Guard

### Viec da lam

- Cap nhat `app/api/admin/backups/service-dry-run/route.ts` voi marker `BACKUP_OPERATOR_API_PERMISSION_GUARD`.
- Dung `getPermissionContext` hien co de guard route server-side.
- Check `backup.operator.dry_run` truoc, fallback fail-closed bang `permissions.manage` vi chua co migration/seed permission backup.
- Tra JSON 401/403 khi thieu login/quyen, van giu dry-run envelope voi `worker_call: false`, `production_backup: false`, `storage_upload: false`, `restore: false`.
- Tao `docs/64_BACKUP_OPERATOR_API_PERMISSION_GUARD.md`.
- Tao `scripts/check-backup-operator-api-permission-guard.cjs`.
- Them `npm run check:backup-operator-api-permission-guard`.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- app/api/admin/backups/service-dry-run/route.ts
- docs/64_BACKUP_OPERATOR_API_PERMISSION_GUARD.md
- scripts/check-backup-operator-api-permission-guard.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong goi backup service worker that.
- Khong hardcode URL/token/key.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong tao/upload backup production that.
- Khong restore production.

## 2026-06-18 - Phase 63 Backup Operator Permission Model Review

### Phase

Phase 63 - Backup Operator Permission Model Review

### Viec da lam

- Tao `docs/63_BACKUP_OPERATOR_PERMISSION_MODEL_REVIEW.md`.
- Tao `scripts/check-backup-operator-permission-model-review.cjs`.
- Them `npm run check:backup-operator-permission-model-review`.
- De xuat permission model `backup.operator.view`, `backup.operator.dry_run`, `backup.operator.execute`, `backup.operator.restore`.
- Ghi ro dry-run UI/API chi can view/dry_run, execute/restore danh cho phase that sau nay.
- Khong tao migration/schema/seed va khong cap quyen DB that trong phase nay.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/63_BACKUP_OPERATOR_PERMISSION_MODEL_REVIEW.md
- scripts/check-backup-operator-permission-model-review.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong goi backup service worker that.
- Khong goi network/API/DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong tao/upload backup production that.
- Khong restore production.

## 2026-06-18 - Phase 62 Backup Operator Dry-Run Handoff

### Phase

Phase 62 - Backup Operator Dry-Run Handoff

### Viec da lam

- Tao `docs/62_BACKUP_OPERATOR_DRY_RUN_HANDOFF.md`.
- Tao `scripts/check-backup-operator-dry-run-handoff.cjs`.
- Them `npm run check:backup-operator-dry-run-handoff`.
- Tong hop Phase 58-62: API route, UI panel, guardrails, local smoke va boundary.
- Ghi ro operator bundle van dry-run-only, no real worker call, no deploy, no production backup, no real storage, no secret committed.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/62_BACKUP_OPERATOR_DRY_RUN_HANDOFF.md
- scripts/check-backup-operator-dry-run-handoff.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy.
- Khong push.
- Khong goi backup service worker that.
- Khong goi network/API/DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong tao/upload backup production that.
- Khong restore production.

## 2026-06-18 - Phase 61 Backup Operator Local Smoke

### Phase

Phase 61 - Backup Operator Local Smoke

### Viec da lam

- Tao `docs/61_BACKUP_OPERATOR_LOCAL_SMOKE.md`.
- Tao `scripts/smoke-backup-operator-dry-run.cjs`.
- Tao `scripts/check-backup-operator-local-smoke.cjs`.
- Them `npm run smoke:backup-operator:dry-run`.
- Them `npm run check:backup-operator-local-smoke`.
- Smoke chi doc source files va package scripts, khong goi network/env/DB.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/61_BACKUP_OPERATOR_LOCAL_SMOKE.md
- scripts/smoke-backup-operator-dry-run.cjs
- scripts/check-backup-operator-local-smoke.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong can server dang chay.
- Khong goi backup service worker that.
- Khong goi network/API/DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong tao/upload backup production that.
- Khong restore production.

## 2026-06-18 - Phase 60 Backup Operator UI Guardrails

### Phase

Phase 60 - Backup Operator UI Guardrails

### Viec da lam

- Tao `docs/60_BACKUP_OPERATOR_UI_GUARDRAILS.md`.
- Tao `scripts/check-backup-operator-ui-guardrails.cjs`.
- Them `npm run check:backup-operator-ui-guardrails`.
- Guardrail scan `app/(admin)/admin/backups`, `components/admin`, `app/api/admin/backups`, `server/services/backup-service-client.ts`.
- Khoa worker URL, hardcoded token/key, direct wrangler, direct Cloudflare/Supabase/Google API, production backup, storage upload, restore va cron/schedule.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/60_BACKUP_OPERATOR_UI_GUARDRAILS.md
- scripts/check-backup-operator-ui-guardrails.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong goi backup service worker that.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong tao cron/schedule.

## 2026-06-18 - Phase 59 Backup Operator UI Dry-Run Panel

### Phase

Phase 59 - Backup Operator UI Dry-Run Panel

### Viec da lam

- Tao `app/(admin)/admin/backups/page.tsx`.
- Tao `components/admin/backup-operator-dry-run-panel.tsx`.
- Them link `/admin/backups` vao dashboard admin.
- Tao `docs/59_BACKUP_OPERATOR_UI_DRY_RUN_PANEL.md`.
- Tao `scripts/check-backup-operator-ui-dry-run-panel.cjs`.
- Them `npm run check:backup-operator-ui-dry-run-panel`.
- UI chi goi route noi bo `/api/admin/backups/service-dry-run`.
- UI hien ro `Dry-run only`, `No production backup`, `No storage upload`, `No restore`, `No real worker call`.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- app/(admin)/admin/backups/page.tsx
- app/(admin)/admin/page.tsx
- components/admin/backup-operator-dry-run-panel.tsx
- docs/59_BACKUP_OPERATOR_UI_DRY_RUN_PANEL.md
- scripts/check-backup-operator-ui-dry-run-panel.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong goi backup service worker that.
- Khong hardcode worker URL/token/key.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong tao/upload backup production that.
- Khong restore production.

## 2026-06-18 - Phase 58 Backup Operator API Dry-Run Route

### Phase

Phase 58 - Backup Operator API Dry-Run Route

### Viec da lam

- Tao `app/api/admin/backups/service-dry-run/route.ts`.
- Tao `docs/58_BACKUP_OPERATOR_API_DRY_RUN_ROUTE.md`.
- Tao `scripts/check-backup-operator-api-dry-run-route.cjs`.
- Them `npm run check:backup-operator-api-dry-run-route`.
- Route tra dry-run envelope voi `worker_call: false`, `production_backup: false`, `storage_upload: false`, `restore: false`.
- Ghi ro auth/permission hardening can phase rieng vi phase nay khong goi DB/network.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- app/api/admin/backups/service-dry-run/route.ts
- docs/58_BACKUP_OPERATOR_API_DRY_RUN_ROUTE.md
- scripts/check-backup-operator-api-dry-run-route.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong goi backup service worker that.
- Khong goi network/API/DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong tao/upload backup production that.
- Khong restore production.

## 2026-06-18 - Phase 57 Main App Binding Dry-Run Handoff

### Phase

Phase 57 - Main App Binding Dry-Run Handoff

### Viec da lam

- Tao `docs/57_MAIN_APP_BINDING_DRY_RUN_HANDOFF.md`.
- Tao `scripts/check-main-app-binding-dry-run-handoff.cjs`.
- Them `npm run check:main-app-binding-dry-run-handoff`.
- Tong hop Phase 53-57: adapter, guardrail, operator API contract va binding smoke.
- Ghi ro main app binding van dry-run-only, chua co route runtime, chua co real worker call.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/57_MAIN_APP_BINDING_DRY_RUN_HANDOFF.md
- scripts/check-main-app-binding-dry-run-handoff.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong tao route runtime.
- Khong goi backup service worker that.
- Khong goi network/API/DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong deploy.
- Khong push.
- Khong tao/upload backup production that.
- Khong restore production.

## 2026-06-18 - Phase 56 Main App Backup Service Binding Smoke

### Phase

Phase 56 - Main App Backup Service Binding Smoke

### Viec da lam

- Hoan tat smoke static/local cho main app backup service binding dry-run.
- Bo sung `scripts/check-main-app-backup-service-binding-smoke.cjs`.
- Xac nhan `npm run smoke:main-app-backup-service-binding` chi doc source files trong repo.
- Xac nhan smoke/check khong doc `.env.local`, `.dev.vars`, khong doc env va khong goi network/API/DB.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- docs/56_MAIN_APP_BACKUP_SERVICE_BINDING_SMOKE.md
- scripts/smoke-main-app-backup-service-binding.cjs
- scripts/check-main-app-backup-service-binding-smoke.cjs
- package.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Phase 56 da co commit truoc do `45061e1 push` chua day du checker/docs handoff.
- Task hien tai hoan tat phan con thieu, khong rewrite lich su Git.
- Khong goi backup service worker that.
- Khong goi network/API/DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong tao/upload backup production that.
- Khong restore production.

## 2026-06-17 - Phase 55 Backup Operator API Dry-Run Contract

### Phase

Phase 55 - Backup Operator API Dry-Run Contract

### Viec da lam

- Tao `docs/55_BACKUP_OPERATOR_API_DRY_RUN_CONTRACT.md`.
- Tao `scripts/check-backup-operator-api-dry-run-contract.cjs`.
- Them `npm run check:backup-operator-api-dry-run-contract`.
- Ghi proposed route `app/api/admin/backups/service-dry-run/route.ts`.
- Chon docs/check-only vi repo chua co pattern `app/api/admin` auth/permission route ro rang.
- Checker se validate route marker/guardrail neu route duoc tao trong phase sau.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-backup-operator-api-dry-run-contract.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/55_BACKUP_OPERATOR_API_DRY_RUN_CONTRACT.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong tao route runtime trong Phase 55.
- Khong goi backup service worker that.
- Khong goi network/API/DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong tao/upload backup production that.
- Khong restore production.

## 2026-06-17 - Phase 54 Backup Service Binding Guardrail Checks

### Phase

Phase 54 - Backup Service Binding Guardrail Checks

### Viec da lam

- Tao `docs/54_BACKUP_SERVICE_BINDING_GUARDRAIL_CHECKS.md`.
- Tao `scripts/check-backup-service-binding-guardrails.cjs`.
- Them `npm run check:backup-service-binding-guardrails`.
- Guardrail scan cac vung `server/`, `app/`, `components/`, `lib/`, `services/` neu ton tai.
- Khoa cac pattern nguy hiem: hardcoded token, backup service workers.dev URL, `.env.local`, `.dev.vars`, real backup/storage/restore trigger.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-backup-service-binding-guardrails.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/54_BACKUP_SERVICE_BINDING_GUARDRAIL_CHECKS.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong goi backup service worker that.
- Khong goi network/API/DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong hardcode URL/token/key.
- Khong tao/upload backup production that.
- Khong restore production.

## 2026-06-17 - Phase 53 Main App Backup Service Client Dry-Run Adapter

### Phase

Phase 53 - Main App Backup Service Client Dry-Run Adapter

### Viec da lam

- Tao `server/services/backup-service-client.ts`.
- Tao `docs/53_MAIN_APP_BACKUP_SERVICE_CLIENT_DRY_RUN_ADAPTER.md`.
- Tao `scripts/check-main-app-backup-service-client-dry-run-adapter.cjs`.
- Them `npm run check:main-app-backup-service-client-dry-run-adapter`.
- Adapter co marker `MAIN_APP_BACKUP_SERVICE_CLIENT_DRY_RUN_ONLY`.
- Adapter chi mo phong `health`, `dryRun`, `fixtureVerify` va tra local response envelope.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- server/services/backup-service-client.ts
- package.json
- scripts/check-main-app-backup-service-client-dry-run-adapter.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/53_MAIN_APP_BACKUP_SERVICE_CLIENT_DRY_RUN_ADAPTER.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong goi backup service worker that.
- Khong goi network/API/DB.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong hardcode URL/token/key.
- Khong tao/upload backup production that.
- Khong restore production.

## 2026-06-17 - Phase 52 Backup Service Worker Pre-Deploy Handoff

### Phase

Phase 52 - Backup Service Worker Pre-Deploy Handoff

### Viec da lam

- Tao `docs/52_BACKUP_SERVICE_WORKER_PRE_DEPLOY_HANDOFF.md`.
- Tao `scripts/check-backup-service-worker-pre-deploy-handoff.cjs`.
- Them `npm run check:backup-service-worker-pre-deploy-handoff`.
- Tong hop Phase 48-52: workflow readiness, manual deploy runbook, secrets preflight, approval gate va pre-deploy status.
- Ghi required commands, required secrets, required owner approval, what is ready, what is still blocked, boundary va known notes.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-backup-service-worker-pre-deploy-handoff.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/52_BACKUP_SERVICE_WORKER_PRE_DEPLOY_HANDOFF.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy worker.
- Khong push remote.
- Khong doc/tao secret that.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi GitHub/Cloudflare/Supabase/Google API.
- Khong tao/upload backup production that.
- Khong restore production.

## 2026-06-17 - Phase 51 Backup Service Worker Deploy Approval Gate

### Phase

Phase 51 - Backup Service Worker Deploy Approval Gate

### Viec da lam

- Tao `docs/51_BACKUP_SERVICE_WORKER_DEPLOY_APPROVAL_GATE.md`.
- Tao `scripts/check-backup-service-worker-deploy-approval-gate.cjs`.
- Them `npm run check:backup-service-worker-deploy-approval-gate`.
- Ghi `OWNER_APPROVAL_REQUIRED_BEFORE_REAL_DEPLOY=true`.
- Ghi approval checklist, required validation, required secrets, rollback owner, smoke owner, deployment window va no-go conditions.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-backup-service-worker-deploy-approval-gate.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/51_BACKUP_SERVICE_WORKER_DEPLOY_APPROVAL_GATE.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy worker.
- Khong doc/tao secret that.
- Khong goi API.
- Approval statement la yeu cau bat buoc, khong phai owner da approve.
- Khong tao/upload backup production that.

## 2026-06-17 - Phase 50 Backup Service Worker Secrets Preflight Checklist

### Phase

Phase 50 - Backup Service Worker Secrets Preflight Checklist

### Viec da lam

- Tao `docs/50_BACKUP_SERVICE_WORKER_SECRETS_PREFLIGHT_CHECKLIST.md`.
- Tao `scripts/check-backup-service-worker-secrets-preflight-checklist.cjs`.
- Them `npm run check:backup-service-worker-secrets-preflight-checklist`.
- Ghi required placeholders: `BACKUP_SERVICE_INTERNAL_TOKEN`, `BACKUP_SERVICE_SMOKE_BASE_URL`, `BACKUP_SERVICE_SMOKE_TOKEN`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
- Ghi secret ownership, rotation, verification without printing values, no-secret-logging policy va no-go conditions.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-backup-service-worker-secrets-preflight-checklist.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/50_BACKUP_SERVICE_WORKER_SECRETS_PREFLIGHT_CHECKLIST.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong doc secret that.
- Khong tao secret that.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi GitHub/Cloudflare API.
- Khong deploy worker.
- Khong tao/upload backup production that.

## 2026-06-17 - Phase 49 Backup Service Worker Manual Deploy Runbook

### Phase

Phase 49 - Backup Service Worker Manual Deploy Runbook

### Viec da lam

- Tao `docs/49_BACKUP_SERVICE_WORKER_MANUAL_DEPLOY_RUNBOOK.md`.
- Tao `scripts/check-backup-service-worker-manual-deploy-runbook.cjs`.
- Them `npm run check:backup-service-worker-manual-deploy-runbook`.
- Ghi pre-deploy checklist, required secrets/vars, local validation commands, manual deploy command placeholders, post-deploy smoke, rollback va failure handling.
- Ghi ro `npx wrangler secret put BACKUP_SERVICE_INTERNAL_TOKEN` va `npx wrangler deploy` chi la future commands, khong chay trong Phase 49.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-backup-service-worker-manual-deploy-runbook.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/49_BACKUP_SERVICE_WORKER_MANUAL_DEPLOY_RUNBOOK.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong chay `wrangler secret put`.
- Khong chay `wrangler deploy`.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Cloudflare/Supabase/Google API.
- Khong tao/upload backup production that.
- Khong restore production.

## 2026-06-17 - Phase 48 Backup Service Worker GitHub Actions Deploy Workflow Readiness

### Phase

Phase 48 - Backup Service Worker GitHub Actions Deploy Workflow Readiness

### Viec da lam

- Tao `.github/workflows/backup-service-deploy.yml`.
- Tao `docs/48_BACKUP_SERVICE_WORKER_GITHUB_ACTIONS_DEPLOY_WORKFLOW_READINESS.md`.
- Tao `scripts/check-backup-service-worker-github-actions-deploy-readiness.cjs`.
- Them `npm run check:backup-service-worker-github-actions-deploy-readiness`.
- Workflow chi co `workflow_dispatch`, khong co `push`, `pull_request`, `schedule`.
- Workflow co readiness checks truoc deploy step va deploy step chi scoped vao `services/backup-service`.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- .github/workflows/backup-service-deploy.yml
- package.json
- scripts/check-backup-service-worker-github-actions-deploy-readiness.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/48_BACKUP_SERVICE_WORKER_GITHUB_ACTIONS_DEPLOY_WORKFLOW_READINESS.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong chay workflow.
- Khong deploy worker tu local.
- Khong push remote.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Cloudflare/Supabase/Google API.
- Khong hardcode secret/token/key.

## 2026-06-17 - Phase 47 Backup Service Worker Deploy Readiness Handoff

### Phase

Phase 47 - Backup Service Worker Deploy Readiness Handoff

### Viec da lam

- Tao `docs/47_BACKUP_SERVICE_WORKER_DEPLOY_READINESS_HANDOFF.md`.
- Tao `scripts/check-backup-service-worker-deploy-readiness-handoff.cjs`.
- Them `npm run check:backup-service-worker-deploy-readiness-handoff`.
- Tong hop Phase 43-47: deploy readiness gate, env/secret contract, post-deploy smoke plan, main app binding contract va handoff.
- Ghi service files, endpoints, auth/env placeholders, deploy readiness status, post-deploy smoke readiness, binding contract status, approvals/secrets can co truoc deploy va known notes.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-backup-service-worker-deploy-readiness-handoff.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/47_BACKUP_SERVICE_WORKER_DEPLOY_READINESS_HANDOFF.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy worker.
- Khong push remote.
- Khong them route production.
- Khong them secret that.
- Khong sua main app runtime.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong tao/upload backup production that.
- Khong restore production.

## 2026-06-17 - Phase 46 Backup Service Worker Main App Binding Contract

### Phase

Phase 46 - Backup Service Worker Main App Binding Contract

### Viec da lam

- Tao `docs/46_BACKUP_SERVICE_WORKER_MAIN_APP_BINDING_CONTRACT.md`.
- Tao `scripts/check-backup-service-worker-main-app-binding-contract.cjs`.
- Them `npm run check:backup-service-worker-main-app-binding-contract`.
- Ghi hai huong tich hop tuong lai: Cloudflare service binding hoac internal URL + Bearer token.
- Ghi auth header contract, request/response envelope, error mapping, timeout/retry/logging policy va permission boundary.
- Ghi future implementation checklist nhung khong sua main app runtime.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-backup-service-worker-main-app-binding-contract.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/46_BACKUP_SERVICE_WORKER_MAIN_APP_BINDING_CONTRACT.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong sua main app runtime.
- Khong them binding that.
- Khong them internal URL/token that.
- Khong deploy worker.
- Khong goi service that.
- Khong tao/upload backup production that.
- Khong restore production.

## 2026-06-17 - Phase 45 Backup Service Worker Post-Deploy Smoke Plan

### Phase

Phase 45 - Backup Service Worker Post-Deploy Smoke Plan

### Viec da lam

- Tao `docs/45_BACKUP_SERVICE_WORKER_POST_DEPLOY_SMOKE_PLAN.md`.
- Tao `scripts/check-backup-service-worker-post-deploy-smoke-plan.cjs`.
- Tao `scripts/smoke-backup-service-worker-post-deploy.cjs`.
- Them `npm run check:backup-service-worker-post-deploy-smoke-plan`.
- Them `npm run smoke:backup-service-worker:post-deploy`.
- Smoke script co marker `POST_DEPLOY_SMOKE_ONLY` va safe skip khi thieu `BACKUP_SERVICE_SMOKE_BASE_URL`.
- Noi ro neu thieu `BACKUP_SERVICE_SMOKE_TOKEN` thi chi `/health` duoc chay, internal endpoint bi skip.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-backup-service-worker-post-deploy-smoke-plan.cjs
- scripts/smoke-backup-service-worker-post-deploy.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/45_BACKUP_SERVICE_WORKER_POST_DEPLOY_SMOKE_PLAN.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy worker.
- Khong hardcode URL.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network vi khong co `BACKUP_SERVICE_SMOKE_BASE_URL` explicit.
- Khong in token.
- Khong tao/upload backup production that.
- Khong restore production.

## 2026-06-17 - Phase 44 Backup Service Worker Env Secret Contract

### Phase

Phase 44 - Backup Service Worker Env & Secret Contract Runbook

### Viec da lam

- Tao `docs/44_BACKUP_SERVICE_WORKER_ENV_SECRET_CONTRACT.md`.
- Tao `scripts/check-backup-service-worker-env-secret-contract.cjs`.
- Them `npm run check:backup-service-worker-env-secret-contract`.
- Ghi required secret placeholder `BACKUP_SERVICE_INTERNAL_TOKEN`.
- Ghi optional placeholders `BACKUP_STORAGE_PROVIDER`, `BACKUP_STORAGE_DRY_RUN`, `BACKUP_STORAGE_PREFIX`, `BACKUP_RETENTION_POLICY`.
- Ghi provisioning checklist, rotation checklist, local/CI boundary, logging safety va no-secret-in-docs policy.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-backup-service-worker-env-secret-contract.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/44_BACKUP_SERVICE_WORKER_ENV_SECRET_CONTRACT.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong tao secret that.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi Wrangler/API.
- Khong deploy worker.
- Khong goi network/API/DB.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.

## 2026-06-17 - Phase 43 Backup Service Worker Deploy Readiness Gate

### Phase

Phase 43 - Backup Service Worker Deploy Readiness Gate

### Viec da lam

- Tao `docs/43_BACKUP_SERVICE_WORKER_DEPLOY_READINESS_GATE.md`.
- Tao `scripts/check-backup-service-worker-deploy-readiness.cjs`.
- Them `npm run check:backup-service-worker-deploy-readiness`.
- Khoa deploy readiness bang static checks: source, wrangler config, endpoints, auth placeholder, JSON envelope va secret safety.
- Ghi future deploy command placeholder nhung noi ro khong chay trong Phase 43.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-backup-service-worker-deploy-readiness.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/43_BACKUP_SERVICE_WORKER_DEPLOY_READINESS_GATE.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy worker.
- Khong them route production.
- Khong them deploy workflow.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.

## 2026-06-17 - Phase 42 Worker Split Backup Readiness Handoff

### Phase

Phase 42 - Worker Split Backup Readiness Handoff

### Viec da lam

- Tao `docs/42_WORKER_SPLIT_BACKUP_READINESS_HANDOFF.md`.
- Tao `scripts/check-worker-split-backup-readiness-handoff.cjs`.
- Them `npm run check:worker-split-backup-readiness-handoff`.
- Tong hop Phase 37-42: repository hygiene, backup service worker boundary, scaffold, contract checks va integration readiness.
- Ghi service files, worker endpoints, checks available, what is implemented/not implemented, deployment boundary, secret boundary va production backup boundary.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-worker-split-backup-readiness-handoff.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/42_WORKER_SPLIT_BACKUP_READINESS_HANDOFF.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy worker.
- Khong push remote.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong tich hop main app that.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.

## 2026-06-17 - Phase 41 Backup Service Worker Integration Readiness

### Phase

Phase 41 - Backup Service Worker Integration Readiness

### Viec da lam

- Tao `docs/41_BACKUP_SERVICE_WORKER_INTEGRATION_READINESS.md`.
- Tao `scripts/check-backup-service-worker-integration-readiness.cjs`.
- Them `npm run check:backup-service-worker-integration-readiness`.
- Ghi future integration options: Cloudflare service binding hoac internal URL + Bearer token.
- Ghi request/response envelope, error mapping, timeout/retry/logging policy va no-production-call policy.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-backup-service-worker-integration-readiness.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/41_BACKUP_SERVICE_WORKER_INTEGRATION_READINESS.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong tich hop main app that.
- Khong them service binding/env thật.
- Khong deploy worker.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong tao/upload backup production that.
- Khong restore production.

## 2026-06-17 - Phase 40 Backup Service Worker Local Contract Checks

### Phase

Phase 40 - Backup Service Worker Local Contract Checks

### Viec da lam

- Tao `docs/40_BACKUP_SERVICE_WORKER_LOCAL_CONTRACT_CHECKS.md`.
- Tao `scripts/check-backup-service-worker-local-contract.cjs`.
- Tao `scripts/smoke-backup-service-worker-contract.cjs`.
- Them `npm run check:backup-service-worker-local-contract`.
- Them `npm run smoke:backup-service-worker:contract`.
- Static/source contract check xac nhan health route, internal routes, bearer auth, 401, JSON envelope va dry-run marker.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-backup-service-worker-local-contract.cjs
- scripts/smoke-backup-service-worker-contract.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/40_BACKUP_SERVICE_WORKER_LOCAL_CONTRACT_CHECKS.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy worker.
- Khong runtime smoke Cloudflare.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.

## 2026-06-17 - Phase 39 Backup Service Worker Scaffold

### Phase

Phase 39 - Backup Service Worker Scaffold

### Viec da lam

- Tao `services/backup-service/src/index.ts`.
- Tao `services/backup-service/wrangler.jsonc`.
- Tao `services/backup-service/README.md`.
- Tao `docs/39_BACKUP_SERVICE_WORKER_SCAFFOLD.md`.
- Tao `scripts/check-backup-service-worker-scaffold.cjs`.
- Them `npm run check:backup-service-worker-scaffold`.
- Worker scaffold co `GET /health`, `POST /internal/backup/dry-run`, `POST /internal/backup/fixture-verify`, JSON envelope va bearer auth placeholder cho internal routes.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- services/backup-service/src/index.ts
- services/backup-service/wrangler.jsonc
- services/backup-service/README.md
- scripts/check-backup-service-worker-scaffold.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/39_BACKUP_SERVICE_WORKER_SCAFFOLD.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy worker.
- Khong tich hop main app that.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.

## 2026-06-17 - Phase 38 Backup Service Worker Boundary Design

### Phase

Phase 38 - Backup Service Worker Boundary Design

### Viec da lam

- Tao `docs/38_BACKUP_SERVICE_WORKER_BOUNDARY_DESIGN.md`.
- Tao `scripts/check-backup-service-worker-boundary-design.cjs`.
- Them `npm run check:backup-service-worker-boundary-design`.
- Thiet ke service path `services/backup-service/`, endpoints `GET /health`, `POST /internal/backup/dry-run`, `POST /internal/backup/fixture-verify`.
- Ghi auth placeholder `Authorization: Bearer BACKUP_SERVICE_INTERNAL_TOKEN`, JSON envelope, logging policy va no-production-backup boundary.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-backup-service-worker-boundary-design.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/38_BACKUP_SERVICE_WORKER_BOUNDARY_DESIGN.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Chua scaffold worker code that.
- Khong deploy lai.
- Khong push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.

## 2026-06-17 - Phase 37 Repository Hygiene GitHub Menu Review

### Phase

Phase 37 - Repository Hygiene & GitHub Menu Script Review

### Viec da lam

- Review dirty state cua `GIA_PHA_GITHUB_MENU.bat`.
- Xac nhan `git diff -- GIA_PHA_GITHUB_MENU.bat` khong co content diff, chi co line-ending warning.
- Chon decision `REVERT_TO_HEAD` va restore file ve HEAD.
- Tao `docs/37_REPOSITORY_HYGIENE_GITHUB_MENU_REVIEW.md`.
- Tao `scripts/check-repository-hygiene-github-menu-review.cjs`.
- Them `npm run check:repository-hygiene-github-menu-review`.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-repository-hygiene-github-menu-review.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/37_REPOSITORY_HYGIENE_GITHUB_MENU_REVIEW.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- `GIA_PHA_GITHUB_MENU.bat` da restore ve HEAD, khong commit noi dung .bat.
- Khong deploy lai.
- Khong push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.

## 2026-06-17 - Phase 36 Production Backup Approval Checklist

### Phase

Phase 36 - Production Backup Approval Checklist

### Viec da lam

- Tao `docs/36_PRODUCTION_BACKUP_APPROVAL_CHECKLIST.md`.
- Tao `scripts/check-production-backup-approval-checklist.cjs`.
- Them `npm run check:production-backup-approval-checklist`.
- Ghi required approvals, storage target decision, secret handling, privacy, retention, restore drill, operator checklist va explicit no-go conditions.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-production-backup-approval-checklist.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/36_PRODUCTION_BACKUP_APPROVAL_CHECKLIST.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy lai.
- Khong push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong tao bucket/folder/storage that.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong bat cron/schedule.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

## 2026-06-17 - Phase 35 Storage Upload Verification Dry-Run

### Phase

Phase 35 - Storage Upload Verification Dry-Run

### Viec da lam

- Tao `docs/35_STORAGE_UPLOAD_VERIFICATION_DRY_RUN.md`.
- Tao `scripts/verify-storage-upload-dry-run.cjs`.
- Tao `scripts/check-storage-upload-verification-dry-run.cjs`.
- Them `npm run backup:storage:verify-upload:dry-run`.
- Them `npm run check:storage-upload-verification-dry-run`.
- Verify artifact trong `fixtures/backup-sandbox/adapter/` bang manifest/checksum/fixture marker/secret scan.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/verify-storage-upload-dry-run.cjs
- scripts/check-storage-upload-verification-dry-run.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/35_STORAGE_UPLOAD_VERIFICATION_DRY_RUN.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy lai.
- Khong push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong upload cloud.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

## 2026-06-17 - Phase 34 Local Sandbox Storage Adapter Prototype

### Phase

Phase 34 - Local Sandbox Storage Adapter Prototype

### Viec da lam

- Tao `docs/34_LOCAL_SANDBOX_STORAGE_ADAPTER_PROTOTYPE.md`.
- Tao `scripts/local-sandbox-storage-adapter.cjs`.
- Tao `scripts/check-local-sandbox-storage-adapter-prototype.cjs`.
- Them `npm run backup:storage:adapter:local`.
- Them `npm run check:local-sandbox-storage-adapter-prototype`.
- Adapter local copy fixture/manifest vao `fixtures/backup-sandbox/adapter/`, tao index, list metadata va verify checksum.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/local-sandbox-storage-adapter.cjs
- scripts/check-local-sandbox-storage-adapter-prototype.cjs
- fixtures/backup-sandbox/adapter/
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/34_LOCAL_SANDBOX_STORAGE_ADAPTER_PROTOTYPE.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy lai.
- Khong push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong upload cloud.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

## 2026-06-17 - Phase 33 Storage Adapter Contract Guardrails

### Phase

Phase 33 - Storage Adapter Contract & Safety Guardrails

### Viec da lam

- Tao `docs/33_STORAGE_ADAPTER_CONTRACT_GUARDRAILS.md`.
- Tao `scripts/backup-storage-adapter-contract.cjs`.
- Tao `scripts/check-storage-adapter-contract-guardrails.cjs`.
- Them `npm run backup:storage:contract`.
- Them `npm run check:storage-adapter-contract-guardrails`.
- Dinh nghia adapter methods, manifest requirements, upload/verify/list/delete safety contract va no-network policy.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/backup-storage-adapter-contract.cjs
- scripts/check-storage-adapter-contract-guardrails.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/33_STORAGE_ADAPTER_CONTRACT_GUARDRAILS.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy lai.
- Khong push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong dung provider SDK.
- Khong tao/upload backup production that.
- Khong delete backup production.
- Khong restore production.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

## 2026-06-17 - Phase 32 Sandbox Storage Target Selection

### Phase

Phase 32 - Sandbox Storage Target Selection

### Viec da lam

- Tao `docs/32_SANDBOX_STORAGE_TARGET_SELECTION.md`.
- Tao `scripts/check-sandbox-storage-target-selection.cjs`.
- Them `npm run check:sandbox-storage-target-selection`.
- So sanh Cloudflare R2, Google Drive, Supabase Storage, Local/NAS/offline operator storage va Manual encrypted offline backup.
- Recommend sandbox/prototype tiep tuc local sandbox; production storage target chua chot va can approval rieng.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-sandbox-storage-target-selection.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/32_SANDBOX_STORAGE_TARGET_SELECTION.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy lai.
- Khong push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong tao bucket/folder/storage that.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

## 2026-06-17 - Phase 31 Backup Readiness Handoff

### Phase

Phase 31 - Backup Readiness Handoff Consolidation

### Viec da lam

- Tao `docs/31_BACKUP_READINESS_HANDOFF.md`.
- Tao `scripts/check-backup-readiness-handoff.cjs`.
- Them `npm run check:backup-readiness-handoff`.
- Tong hop baseline Phase 18-31, command local, CI workflow, fixture files, safe scope va nhung viec van chua phai production backup.
- Ghi ro next phase de xuat va boundary khong deploy/push/network/secret/restore/schedule.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-backup-readiness-handoff.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/31_BACKUP_READINESS_HANDOFF.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy lai.
- Khong push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong bat cron/schedule.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

## 2026-06-17 - Phase 30 Restore Drill Report Generator

### Phase

Phase 30 - Restore Drill Report Generator

### Viec da lam

- Tao `docs/30_RESTORE_DRILL_REPORT_GENERATOR.md`.
- Tao `scripts/generate-restore-drill-report.cjs`.
- Tao `scripts/check-restore-drill-report-generator.cjs`.
- Them `npm run restore:drill:report`.
- Them `npm run check:restore-drill-report-generator`.
- Report generator doc fixture va manifest sample, validate manifest/graph/privacy/secret scan va tao report fixture JSON.
- Report ghi `noProductionMutation: true` va `restoreExecution: SKIPPED`.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/generate-restore-drill-report.cjs
- scripts/check-restore-drill-report-generator.cjs
- fixtures/backup/reports/
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/30_RESTORE_DRILL_REPORT_GENERATOR.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy lai.
- Khong push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

## 2026-06-17 - Phase 29 Backup Artifact Retention Policy Gate

### Phase

Phase 29 - Backup Artifact Retention Policy Gate

### Viec da lam

- Tao `docs/29_BACKUP_ARTIFACT_RETENTION_POLICY_GATE.md`.
- Tao `scripts/backup-retention-policy-check.cjs`.
- Tao `scripts/check-backup-artifact-retention-policy-gate.cjs`.
- Them `npm run backup:retention:check`.
- Them `npm run check:backup-artifact-retention-policy-gate`.
- Retention gate validate weekly keep 8, monthly keep 12, pre-deploy release marker, newest unverified guard va invalid manifest guard.
- Script chi tinh policy tren fixture/sandbox metadata, khong xoa file va khong cham production.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/backup-retention-policy-check.cjs
- scripts/check-backup-artifact-retention-policy-gate.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/29_BACKUP_ARTIFACT_RETENTION_POLICY_GATE.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy lai.
- Khong push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong xoa backup production that.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

## 2026-06-17 - Phase 28 Local Sandbox Backup Storage Simulation

### Phase

Phase 28 - Local Sandbox Backup Storage Simulation

### Viec da lam

- Tao `docs/28_LOCAL_SANDBOX_BACKUP_STORAGE_SIMULATION.md`.
- Tao `scripts/backup-storage-sandbox-simulate.cjs`.
- Tao `scripts/check-local-sandbox-backup-storage-simulation.cjs`.
- Them `npm run backup:storage:sandbox`.
- Them `npm run check:local-sandbox-backup-storage-simulation`.
- Sandbox script copy fixture va manifest mau vao `fixtures/backup-sandbox/` va tao `storage-index.fixture.json`.
- Sandbox chi local fixture data, khong cloud storage, khong network/API/DB, khong upload/restore that.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/backup-storage-sandbox-simulate.cjs
- scripts/check-local-sandbox-backup-storage-simulation.cjs
- fixtures/backup-sandbox/
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/28_LOCAL_SANDBOX_BACKUP_STORAGE_SIMULATION.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy lai.
- Khong push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong dung cloud storage that.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

## 2026-06-17 - Phase 27 Backup CI Gate Integration

### Phase

Phase 27 - Backup CI Gate Integration

### Viec da lam

- Tao `docs/27_BACKUP_CI_GATE_INTEGRATION.md`.
- Tao `.github/workflows/backup-readiness.yml`.
- Tao `scripts/check-backup-ci-gate-integration.cjs`.
- Them `npm run check:backup-ci-gate-integration`.
- Workflow chi chay `pull_request` va `workflow_dispatch`.
- Workflow chi chay local backup readiness commands, khong dung `secrets.*`, khong schedule, khong deploy va khong upload/restore.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- .github/workflows/backup-readiness.yml
- scripts/check-backup-ci-gate-integration.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/27_BACKUP_CI_GATE_INTEGRATION.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy lai.
- Khong push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong dung GitHub secrets trong workflow moi.
- Khong them `schedule:`.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

## 2026-06-17 - Phase 26 Backup Pipeline Readiness Gate

### Phase

Phase 26 - Backup Pipeline Readiness Gate

### Viec da lam

- Tao `docs/26_BACKUP_PIPELINE_READINESS_GATE.md`.
- Tao `scripts/backup-pipeline-readiness.cjs`.
- Tao `scripts/check-backup-pipeline-readiness-gate.cjs`.
- Them `npm run backup:pipeline:readiness`.
- Them `npm run check:backup-pipeline-readiness-gate`.
- Pipeline gate chay `backup:dry-run`, `backup:fixture:generate`, `backup:fixture:verify`, `restore:dry-run` theo thu tu.
- Gate chi local readiness, khong tao job/cron, khong upload backup va khong restore that.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/backup-pipeline-readiness.cjs
- scripts/check-backup-pipeline-readiness-gate.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/26_BACKUP_PIPELINE_READINESS_GATE.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy lai.
- Khong push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong dung du lieu gia pha that.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

## 2026-06-17 - Phase 25 Restore Dry-Run Validator

### Phase

Phase 25 - Restore Dry-Run Validator

### Viec da lam

- Tao `docs/25_RESTORE_DRY_RUN_VALIDATOR.md`.
- Tao `scripts/restore-dry-run-validate.cjs`.
- Tao `scripts/check-restore-dry-run-validator.cjs`.
- Them `npm run restore:dry-run`.
- Them `npm run check:restore-dry-run-validator`.
- Validator doc fixture va manifest sample, kiem manifest integrity, graph, privacy flags va secret scan.
- Restore execution duoc danh dau `SKIPPED`, khong co restore that.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/restore-dry-run-validate.cjs
- scripts/check-restore-dry-run-validator.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/25_RESTORE_DRY_RUN_VALIDATOR.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy lai.
- Khong push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong dung du lieu gia pha that.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

## 2026-06-17 - Phase 24 Backup Manifest Integrity Checker

### Phase

Phase 24 - Backup Manifest & Integrity Checker

### Viec da lam

- Tao `docs/24_BACKUP_MANIFEST_INTEGRITY_CHECKER.md`.
- Tao `scripts/verify-sample-backup-integrity.cjs`.
- Tao `scripts/check-backup-manifest-integrity.cjs`.
- Them `npm run backup:fixture:verify`.
- Them `npm run check:backup-manifest-integrity`.
- Verify command doc fixture va manifest sample, validate shape/count/flag va tinh lai checksum SHA-256.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/verify-sample-backup-integrity.cjs
- scripts/check-backup-manifest-integrity.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/24_BACKUP_MANIFEST_INTEGRITY_CHECKER.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy lai.
- Khong push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong dung du lieu gia pha that.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

## 2026-06-17 - Phase 23 Sample Fixture Backup Generator

### Phase

Phase 23 - Sample Fixture Backup Generator

### Viec da lam

- Tao `docs/23_SAMPLE_FIXTURE_BACKUP_GENERATOR.md`.
- Tao `scripts/generate-sample-backup-fixture.cjs`.
- Tao `scripts/check-sample-fixture-backup-generator.cjs`.
- Them `npm run backup:fixture:generate`.
- Them `npm run check:sample-fixture-backup-generator`.
- Generator tao fixture JSON va manifest JSON trong `fixtures/backup/` bang static sample data.
- Fixture danh dau `environment: fixture`, `contains_real_data: false`, `contains_secret: false`.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/generate-sample-backup-fixture.cjs
- scripts/check-sample-fixture-backup-generator.cjs
- fixtures/backup/sample-family.fixture.json
- fixtures/backup/sample-family.manifest.fixture.json
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/23_SAMPLE_FIXTURE_BACKUP_GENERATOR.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy lai.
- Khong push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong dung du lieu gia pha that.
- Khong tao/upload backup production that.
- Khong restore production.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

## 2026-06-17 - Phase 22 Backup Dry-Run Command Design

### Phase

Phase 22 - Backup Dry-Run Command Design

### Viec da lam

- Tao `docs/22_BACKUP_DRY_RUN_COMMAND_DESIGN.md`.
- Tao `scripts/backup-dry-run.cjs` dung mock/static data trong bo nho.
- Tao `scripts/check-backup-dry-run-command-design.cjs`.
- Them `npm run check:backup-dry-run-command-design`.
- Them `npm run backup:dry-run`.
- Dry-run validate manifest shape, naming convention, secret pattern scan va restore compatibility checklist.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/backup-dry-run.cjs
- scripts/check-backup-dry-run-command-design.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/22_BACKUP_DRY_RUN_COMMAND_DESIGN.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy lai.
- Khong push.
- Khong doc `.env.local` hoac `.dev.vars`.
- Khong goi network/API/DB.
- Khong tao backup/export that.
- Khong upload file.
- Khong restore production.
- Khong tao scheduled job/cron that.
- Khong hardcode secret/token/key.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

## 2026-06-17 - Phase 21 Automated Backup Job Design

### Phase

Phase 21 - Automated Backup Job Design

### Viec da lam

- Tao `docs/21_AUTOMATED_BACKUP_JOB_DESIGN.md`.
- Ghi production baseline hien tai: Worker, production URL, workflow deploy, Phase 16/17/18/19/20 status va known notes.
- Ghi design goal: chi thiet ke automated backup job, khong bat job/cron that, khong tao/upload backup that, khong restore that.
- Ghi candidate architecture: GitHub Actions scheduled workflow, Cloudflare Worker Cron Trigger, manual operator-triggered backup, Supabase/manual export flow va external storage later.
- Ghi recommended safe architecture theo tung stage tu manual checklist den dry-run, storage sandbox va scheduled job disabled-by-default.
- Ghi trigger/output/storage/retention design.
- Ghi security and privacy guardrails, job failure handling, restore compatibility requirement va future implementation stages.
- Ghi configuration variables design bang placeholder an toan, khong cap nhat `.env.local`.
- Tao `scripts/check-automated-backup-job-design.cjs`.
- Them `npm run check:automated-backup-job-design`.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-automated-backup-job-design.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/21_AUTOMATED_BACKUP_JOB_DESIGN.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy lai.
- Khong push.
- Khong sua schema.
- Khong chay migration.
- Khong sua du lieu that.
- Khong tao scheduled job/cron that.
- Khong tao/upload backup/export that.
- Khong restore production.
- Khong doi domain/Auth/OAuth config that.
- Khong hardcode secret/token/key.
- Khong commit `.env.local`, `.dev.vars` hoac backup/export du lieu that.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

## 2026-06-17 - Phase 20 Custom Domain Cutover Readiness

### Phase

Phase 20 - Custom Domain Cutover Readiness

### Viec da lam

- Tao `docs/20_CUSTOM_DOMAIN_CUTOVER_READINESS.md`.
- Ghi production baseline hien tai: Worker, workers.dev URL, workflow deploy, wrangler config, Phase 16/17/18/19 status va known issues.
- Ghi candidate custom domain la `<TO_BE_CONFIRMED>`, khong tu chot domain that.
- Ghi Cloudflare readiness checklist cho DNS, route/custom domain binding, SSL/TLS, HTTPS va fallback workers.dev.
- Ghi Supabase Auth readiness checklist cho Site URL, Redirect URLs, callback/login/logout/unauthorized smoke.
- Ghi Google OAuth readiness checklist cho JavaScript origins, redirect URI alignment va consent status.
- Ghi app configuration readiness cho `NEXT_PUBLIC_APP_URL`, Supabase env, `PROD_SMOKE_BASE_URL`, `window.location.origin` va hardcoded workers.dev gap.
- Ghi smoke test plan, rollback plan, pre-cutover approval checklist, risk matrix, gaps va Phase 20 boundary.
- Tao `scripts/check-custom-domain-cutover-readiness.cjs`.
- Them `npm run check:custom-domain-cutover-readiness`.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-custom-domain-cutover-readiness.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/20_CUSTOM_DOMAIN_CUTOVER_READINESS.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy lai.
- Khong push.
- Khong sua schema.
- Khong chay migration.
- Khong sua du lieu that.
- Khong doi domain/DNS/Cloudflare route that.
- Khong doi Supabase/Auth/OAuth config that.
- Khong tao backup/export that.
- Khong restore production.
- Khong hardcode secret/token/key.
- Khong commit `.env.local`, `.dev.vars` hoac backup/export du lieu that.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

## 2026-06-17 - Phase 19 Scheduled Backup & Restore Drill

### Phase

Phase 19 - Scheduled Backup & Restore Drill

### Viec da lam

- Tao `docs/19_SCHEDULED_BACKUP_RESTORE_DRILL.md`.
- Ghi production baseline hien tai: Worker, production URL, workflow deploy, Phase 16/17/18 status, smoke/OAuth status va known issues.
- Ghi drill goal: manual runbook, khong backup that, khong restore production, khong cron/job that.
- Ghi recommended backup schedule cho pre/post deploy, weekly, monthly, import/restore/revision restore va future migration.
- Ghi backup scope, naming convention, manifest template va privacy/secret safety.
- Ghi restore drill scope, restore verification checklist va PASS/FAIL criteria.
- Ghi drill log template, scheduled reminder strategy va incident response matrix cho backup/restore.
- Ghi gaps/future work va Phase 19 boundary.
- Tao `scripts/check-scheduled-backup-restore-drill.cjs`.
- Them `npm run check:scheduled-backup-restore-drill`.
- Cap nhat docs index, decision log va handoff.

### File da tao/cap nhat

- package.json
- scripts/check-scheduled-backup-restore-drill.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/19_SCHEDULED_BACKUP_RESTORE_DRILL.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration da tao

- Khong tao migration.

### Package da them

- Khong them package.

### Ghi chu

- Khong deploy lai.
- Khong push.
- Khong sua schema.
- Khong chay migration.
- Khong sua du lieu that.
- Khong tao backup/export that.
- Khong restore production.
- Khong lam import confirm that.
- Khong lam revision restore that.
- Khong doi domain that.
- Khong doi Supabase/Auth/OAuth config that.
- Khong hardcode secret/token/key.
- Khong commit `.env.local`, `.dev.vars` hoac backup/export du lieu that.
- Khong stage/commit `GIA_PHA_GITHUB_MENU.bat`.

## 2026-06-17 - Phase 18 Backup, Domain & Alerting Hardening

### Phase

Phase 18 - Backup, Domain & Alerting Hardening

### Việc đã làm

- Tạo `docs/18_BACKUP_DOMAIN_ALERTING_HARDENING.md`.
- Ghi production baseline hiện tại: Worker, production URL, workflow deploy, Phase 16/17 PASS, smoke/OAuth PASS.
- Ghi backup hardening checklist cho JSON/GEDCOM/ZIP, trước/sau deploy và trước thao tác dữ liệu thật.
- Ghi restore readiness checklist và boundary restore thật là high-risk phase riêng.
- Ghi domain hardening checklist cho custom domain tương lai, DNS, SSL/TLS, Supabase/Auth và Google OAuth URL alignment.
- Ghi alerting hardening checklist và recommended future setup.
- Ghi incident response matrix.
- Ghi backup naming convention.
- Ghi environment/secret safety và Phase 18 boundary.
- Tạo `scripts/check-backup-domain-alerting-hardening.cjs`.
- Thêm `npm run check:backup-domain-alerting-hardening`.
- Cập nhật docs index, decision log và handoff.

### File đã tạo/cập nhật

- package.json
- scripts/check-backup-domain-alerting-hardening.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/18_BACKUP_DOMAIN_ALERTING_HARDENING.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration đã tạo

- Không tạo migration.

### Package đã thêm

- Không thêm package.

### Ghi chú

- Không deploy lại.
- Không sửa schema.
- Không chạy migration.
- Không sửa dữ liệu thật.
- Không tạo backup/export thật.
- Không làm import confirm thật.
- Không làm revision restore thật.
- Không đổi domain thật.
- Không đổi Supabase/Auth/OAuth config thật.
- Không hardcode secret/token/key.
- Không commit `.env.local`, `.dev.vars` hoặc backup/export dữ liệu thật.

## 2026-06-17 - Phase 17 Production Operations & Monitoring

### Phase

Phase 17 - Production Operations & Monitoring

### Việc đã làm

- Tạo `docs/17_PRODUCTION_OPERATIONS_MONITORING.md`.
- Ghi production baseline: Worker `web-gia-pha`, production URL, workflow deploy và Phase 16 PASS.
- Ghi post-deploy operations checklist.
- Ghi Cloudflare monitoring checklist.
- Ghi GitHub Actions monitoring checklist.
- Ghi Supabase/Auth monitoring checklist.
- Ghi smoke testing guide, bao gồm optional smoke bằng `PROD_SMOKE_BASE_URL`.
- Ghi incident triage runbook và rollback guidance.
- Tạo `scripts/check-production-ops-monitoring.cjs`.
- Thêm `npm run check:production-ops-monitoring`.
- Cập nhật docs index, decision log và handoff.

### File đã tạo/cập nhật

- package.json
- scripts/check-production-ops-monitoring.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/17_PRODUCTION_OPERATIONS_MONITORING.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration đã tạo

- Không tạo migration.

### Package đã thêm

- Không thêm package.

### Ghi chú

- Không deploy lại.
- Không sửa schema.
- Không chạy migration.
- Không sửa dữ liệu thật.
- Không làm import confirm thật.
- Không làm revision restore thật.
- Không đổi privacy/business logic.
- Không hardcode secret/token/key.
- Không commit `.env.local` hoặc `.dev.vars`.
- Optional production smoke with `PROD_SMOKE_BASE_URL=https://web-gia-pha.hungdiepcompany.workers.dev` PASS.
- `npm run build` PASS trong clean temp copy; build trực tiếp tại repo bị chặn bởi ACL cũ trên generated `.next` artifact.

## 2026-06-17 - Phase 16 Production Stabilization

### Phase

Phase 16 - Production Stabilization

### Việc đã làm

- Tạo `docs/16_PRODUCTION_STABILIZATION.md`.
- Ghi production URL, Worker name và deploy workflow đang dùng.
- Ghi Supabase Auth checklist, Google OAuth checklist, route smoke checklist và auth/login checklist.
- Ghi public/private privacy checklist.
- Ghi export backup production checklist an toàn, không import ngược, không restore.
- Ghi logs/observability checklist và các lỗi cần theo dõi.
- Ghi known non-blocking warnings và blocking conditions.
- Ghi quy trình sau mỗi deploy.
- Tạo `scripts/check-production-stabilization.cjs`.
- Thêm `npm run check:production-stabilization`.
- Cập nhật docs index, decision log và handoff.

### File đã tạo/cập nhật

- package.json
- scripts/check-production-stabilization.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/16_PRODUCTION_STABILIZATION.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration đã tạo

- Không tạo migration.

### Package đã thêm

- Không thêm package.

### Kiểm tra

- `npm.cmd run check:env:safe` - PASS
- `npm.cmd run check:migrations` - PASS
- `npm.cmd run check:deploy-readiness` - PASS
- `npm.cmd run check:opennext-cloudflare` - PASS
- `npm.cmd run check:service-boundary` - PASS
- `npm.cmd run check:github-actions-opennext` - PASS
- `npm.cmd run check:github-actions-deploy` - PASS
- `npm.cmd run check:production-stabilization` - PASS, optional network smoke skipped vì `PROD_SMOKE_BASE_URL` chưa set.
- `npm.cmd run typecheck` - PASS
- `npm.cmd run lint` - PASS
- `npm.cmd run build` - PASS
- `npm.cmd audit --audit-level=moderate` - PASS_WITH_KNOWN_AUDIT_ADVISORIES, còn known advisories trong Next/OpenNext/Wrangler/PostCSS/esbuild/ws chain.
- `git diff --check` - PASS
- `git status --short` - chỉ có thay đổi Phase 16 trước commit

### Ghi chú

- Không deploy lại.
- Không sửa schema.
- Không chạy migration.
- Không sửa dữ liệu thật.
- Không làm import confirm thật.
- Không làm revision restore thật.
- Không đổi privacy/business logic.
- Không hardcode secret/token/key.
- Không commit `.env.local` hoặc `.dev.vars`.
- Optional network smoke chỉ chạy khi set `PROD_SMOKE_BASE_URL`, không login tự động và không mutate data.

## 2026-06-17 - Production deploy success recorded

### Phase

Post Phase 15E - Production deploy result

### Việc đã làm

- Ghi nhận GitHub Actions Cloudflare Deploy đã PASS theo xác nhận của user.
- Ghi nhận Worker production: `web-gia-pha`.
- Ghi nhận Production URL: `https://web-gia-pha.hungdiepcompany.workers.dev/`.
- Ghi nhận `NEXT_PUBLIC_APP_URL` đã cập nhật theo URL thật.
- Ghi nhận Supabase Site URL và Redirect URLs đã cấu hình theo URL thật.
- Ghi nhận Google OAuth đã sửa lỗi `deleted_client` và login PASS.
- Ghi nhận các route smoke cơ bản đã PASS theo test thủ công.
- Cập nhật docs deploy/handoff/work log.

### File đã tạo/cập nhật

- docs/08_AI_WORK_LOG.md
- docs/15E_GITHUB_ACTIONS_CLOUDFLARE_DEPLOY.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration đã tạo

- Không tạo migration.

### Package đã thêm

- Không thêm package.

### Ghi chú

- Không deploy lại.
- Không sửa schema.
- Không chạy migration.
- Không sửa dữ liệu thật.
- Không làm import confirm thật.
- Không làm revision restore thật.
- Không commit `.env.local` hoặc `.dev.vars`.
- Không hardcode secret/token/key.

## 2026-06-17 - Phase 15E GitHub Actions Cloudflare Deploy Workflow

### Phase

Phase 15E - GitHub Actions Cloudflare Deploy Workflow

### Việc đã làm

- User xác nhận GitHub Actions secrets `CLOUDFLARE_API_TOKEN` và `CLOUDFLARE_ACCOUNT_ID` đã cấu hình.
- Tạo workflow `.github/workflows/cloudflare-deploy.yml`.
- Workflow chỉ chạy thủ công bằng `workflow_dispatch`, không auto deploy khi push/pull request.
- Workflow chạy trên `ubuntu-latest`, dùng Node 24, `npm ci`, safety checks, typecheck, lint, build và `npm run deploy`.
- Workflow đọc env/secrets từ GitHub `vars.*` và `secrets.*`, không hardcode token/key/secret.
- Tạo `scripts/check-github-actions-cloudflare-deploy.cjs`.
- Thêm `npm run check:github-actions-deploy`.
- Tạo docs `docs/15E_GITHUB_ACTIONS_CLOUDFLARE_DEPLOY.md`.
- Cập nhật docs index, decision log, handoff và Phase 15D report.

### File đã tạo/cập nhật

- .github/workflows/cloudflare-deploy.yml
- package.json
- scripts/check-github-actions-cloudflare-deploy.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/15D_FIRST_CLOUDFLARE_DEPLOY_RETRY.md
- docs/15E_GITHUB_ACTIONS_CLOUDFLARE_DEPLOY.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration đã tạo

- Không tạo migration.

### Package đã thêm

- Không thêm package.

### Kiểm tra

- `npm.cmd run check:env:safe` - PASS
- `npm.cmd run check:migrations` - PASS
- `npm.cmd run check:deploy-readiness` - PASS
- `npm.cmd run check:opennext-cloudflare` - PASS
- `npm.cmd run check:service-boundary` - PASS
- `npm.cmd run check:github-actions-opennext` - PASS
- `npm.cmd run check:github-actions-deploy` - PASS
- `npm.cmd run typecheck` - PASS
- `npm.cmd run lint` - PASS
- `npm.cmd run build` - PASS
- `npm.cmd audit --audit-level=moderate` - PASS_WITH_KNOWN_AUDIT_ADVISORIES
- `git diff --check` - PASS
- `git status --short` - chỉ có thay đổi Phase 15E trước commit
- Secret scan - PASS, chỉ match GitHub `secrets.*` references, placeholder/docs policy và checker patterns; không có secret thật.
- `git ls-files .env .env.local .dev.vars` - rỗng

### Ghi chú

- Không deploy từ Windows local.
- Không chạy deploy trong Phase 15E local validation.
- Không sửa schema.
- Không chạy migration.
- Không sửa dữ liệu thật.
- Không làm import confirm thật.
- Không làm revision restore thật.
- Không commit `.env.local` hoặc `.dev.vars`.
- Không hardcode secret/token/key.
- Không chạy `npm audit fix --force`.

## 2026-06-16 - Phase 15D First Cloudflare Deploy Retry

### Phase

Phase 15D - First Cloudflare Deploy Retry

### Việc đã làm

- Xác nhận repo sạch, branch `main`, commit Phase 15B và Phase 15C đã có ở local.
- Xác nhận `origin/main` đang ở commit `b04657535a94378df0a6811a15fff247131d5cac`.
- Xác nhận GitHub Actions OpenNext Cloudflare Build Gate PASS: run `27631937702`.
- Chạy local gates trước deploy: checks/build PASS, audit ở trạng thái known advisories.
- User xác nhận đã backup `family.json` và `full-backup.zip` ngoài repo.
- User xác nhận Cloudflare production variables/secrets đã cấu hình đúng loại.
- Chạy `npm.cmd run deploy`.
- Deploy bị BLOCKED ở bước OpenNext bundle trên Windows trước khi upload/deploy Cloudflare.
- Tạo report `docs/15D_FIRST_CLOUDFLARE_DEPLOY_RETRY.md`.

### File đã tạo/cập nhật

- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/14_OPENNEXT_CLOUDFLARE_WIRING.md
- docs/15C_GITHUB_ACTIONS_OPENNEXT_BUILD_GATE.md
- docs/15D_FIRST_CLOUDFLARE_DEPLOY_RETRY.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration đã tạo

- Không tạo migration.

### Package đã thêm

- Không thêm package.

### Kiểm tra

- `git status --short` - sạch trước deploy
- `git log --oneline -10`
- `git branch --show-current` - `main`
- `git remote -v`
- `gh run view 27631937702 --json ...` - PASS
- `npm.cmd run check:env:safe` - PASS
- `npm.cmd run check:migrations` - PASS
- `npm.cmd run check:foundation` - PASS
- `npm.cmd run check:auth-permissions` - PASS
- `npm.cmd run check:people` - PASS
- `npm.cmd run check:relationships` - PASS
- `npm.cmd run check:tree-viewer` - PASS
- `npm.cmd run check:tree-editor` - PASS
- `npm.cmd run check:public-privacy` - PASS
- `npm.cmd run check:export-backup` - PASS
- `npm.cmd run check:revisions` - PASS
- `npm.cmd run check:import-json` - PASS
- `npm.cmd run check:deploy-readiness` - PASS
- `npm.cmd run check:opennext-cloudflare` - PASS
- `npm.cmd run check:service-boundary` - PASS
- `npm.cmd run check:github-actions-opennext` - PASS
- `npm.cmd run typecheck` - PASS
- `npm.cmd run lint` - PASS
- `npm.cmd run build` - PASS
- `npm.cmd audit --audit-level=moderate` - PASS_WITH_KNOWN_AUDIT_ADVISORIES
- `git diff --check` - PASS

### Deploy result

- `npm.cmd run deploy` - BLOCKED
- Next build inside deploy - PASS
- OpenNext bundle on Windows - FAIL with known `open-next.config.edge.mjs` copyfile ENOENT
- Cloudflare upload/deploy reached - No
- Production URL - Not created

### Ghi chú

- Không sửa schema.
- Không chạy migration.
- Không sửa dữ liệu thật.
- Không làm import confirm thật.
- Không làm revision restore thật.
- Không in secret.
- Không commit `.env.local` hoặc `.dev.vars`.
- Không push remote trong phase này.
- Việc tiếp theo: deploy bằng WSL/Linux hoặc tạo GitHub Actions deploy workflow khi user xác nhận rõ.

## 2026-06-16 - Phase 15C Linux/GitHub Actions OpenNext Build Gate

### Phase

Phase 15C - Linux/GitHub Actions OpenNext Build Gate

### Việc đã làm

- Xác nhận gate Phase 15B đã đủ: service boundary docs, template worker, checker và handoff PASS_WITH_KNOWN_AUDIT_ADVISORIES.
- Tạo workflow `.github/workflows/opennext-build-gate.yml` chạy trên `ubuntu-latest`.
- Workflow chạy `npm ci`, check scripts, typecheck, lint, Next build và `npx opennextjs-cloudflare build`.
- Workflow không deploy, không upload, không chạy `wrangler deploy`, không chạy migration và không smoke test Supabase thật.
- Tạo `scripts/check-github-actions-opennext-gate.cjs`.
- Thêm `npm run check:github-actions-opennext`.
- Tạo docs `docs/15C_GITHUB_ACTIONS_OPENNEXT_BUILD_GATE.md`.
- Cập nhật docs index, OpenNext wiring, decision log và handoff.

### File đã tạo/cập nhật

- .github/workflows/opennext-build-gate.yml
- package.json
- scripts/check-github-actions-opennext-gate.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/14_OPENNEXT_CLOUDFLARE_WIRING.md
- docs/15C_GITHUB_ACTIONS_OPENNEXT_BUILD_GATE.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration đã tạo

- Không tạo migration.

### Package đã thêm

- Không thêm package.

### Kiểm tra

- `git status --short` trước sửa - sạch
- Gate Phase 15B signs - PASS
- `npm.cmd run check:env:safe` - PASS
- `npm.cmd run check:migrations` - PASS
- `npm.cmd run check:foundation` - PASS
- `npm.cmd run check:auth-permissions` - PASS
- `npm.cmd run check:people` - PASS
- `npm.cmd run check:relationships` - PASS
- `npm.cmd run check:tree-viewer` - PASS
- `npm.cmd run check:tree-editor` - PASS
- `npm.cmd run check:public-privacy` - PASS
- `npm.cmd run check:export-backup` - PASS
- `npm.cmd run check:revisions` - PASS
- `npm.cmd run check:import-json` - PASS
- `npm.cmd run check:deploy-readiness` - PASS
- `npm.cmd run check:opennext-cloudflare` - PASS
- `npm.cmd run check:service-boundary` - PASS
- `npm.cmd run check:github-actions-opennext` - PASS
- `npm.cmd run typecheck` - PASS
- `npm.cmd run lint` - PASS
- `npm.cmd run build` - PASS
- `npm.cmd audit --audit-level=moderate` - PASS_WITH_KNOWN_AUDIT_ADVISORIES, còn advisory trong Next/OpenNext/Wrangler/PostCSS/esbuild/ws chain.
- `git diff --check` - PASS

### Ghi chú

- Không deploy thật.
- Không push remote.
- Không tách Worker thật.
- Không sửa schema hoặc business logic.
- Không chạy migration.
- Không hardcode secret hoặc thêm GitHub secret thật vào workflow.
- Audit advisory của Next/OpenNext/Wrangler/PostCSS/esbuild/ws tiếp tục là known deploy-toolchain risk; không chạy `npm audit fix --force`.
- Kết luận local: READY_TO_RUN_ON_GITHUB.

## 2026-06-16 - Phase 15B Service Boundary & Worker Split Readiness

### Phase

Phase 15B - Service Boundary & Worker Split Readiness

### Việc đã làm

- Tạo tài liệu `docs/15_SERVICE_BOUNDARY_WORKER_SPLIT.md` ghi boundary giữa Main Web Worker và các service worker ứng viên.
- Tạo template worker độc lập tại `services/_template-worker/` với `GET /health` và `POST /internal/example`.
- Internal route trong template yêu cầu `Authorization: Bearer <SERVICE_INTERNAL_TOKEN>` qua binding placeholder, không có secret thật trong repo.
- Tạo `scripts/check-service-boundary-readiness.cjs`.
- Thêm `npm run check:service-boundary`.
- Cập nhật docs index, architecture, export/backup model, OpenNext note, decision log và handoff.

### File đã tạo/cập nhật

- package.json
- scripts/check-service-boundary-readiness.cjs
- docs/00_INDEX.md
- docs/02_ARCHITECTURE.md
- docs/06_EXPORT_BACKUP_MODEL.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/14_OPENNEXT_CLOUDFLARE_WIRING.md
- docs/15_SERVICE_BOUNDARY_WORKER_SPLIT.md
- docs/99_NEXT_AI_HANDOFF.md
- services/_template-worker/README.md
- services/_template-worker/package.json
- services/_template-worker/wrangler.toml
- services/_template-worker/src/index.ts

### Migration đã tạo

- Không tạo migration.

### Package đã thêm

- Không thêm package vào app chính.

### Kiểm tra

- `npm.cmd run check:env:safe` - PASS
- `npm.cmd run check:migrations` - PASS
- `npm.cmd run check:foundation` - PASS
- `npm.cmd run check:auth-permissions` - PASS
- `npm.cmd run check:people` - PASS
- `npm.cmd run check:relationships` - PASS
- `npm.cmd run check:tree-viewer` - PASS
- `npm.cmd run check:tree-editor` - PASS
- `npm.cmd run check:public-privacy` - PASS
- `npm.cmd run check:export-backup` - PASS
- `npm.cmd run check:revisions` - PASS
- `npm.cmd run check:import-json` - PASS
- `npm.cmd run check:deploy-readiness` - PASS
- `npm.cmd run check:opennext-cloudflare` - PASS
- `npm.cmd run check:service-boundary` - PASS
- `npm.cmd run typecheck` - PASS
- `npm.cmd run lint` - PASS
- `npm.cmd run build` - PASS
- `npm.cmd audit --audit-level=moderate` - FAIL, còn advisory trong `next`/`postcss`, `@opennextjs/cloudflare`/`wrangler`/`esbuild`/`ws`; không chạy `npm audit fix --force` vì ngoài scope và có breaking/no-fix advisory.
- `git diff --check` - PASS

### Ghi chú

- Không tách Worker thật.
- Không tạo Cloudflare service thật.
- Không deploy, không upload, không push remote.
- Không chạy migration.
- Không sửa schema, dữ liệu thật hoặc business logic export/import hiện có.
- Không đọc/in secret và không hardcode secret.
- Phase 15B technical status: PASS.
- Commit status: allowed with audit exception.
- Audit status: `npm audit --audit-level=moderate` vẫn report advisory trong dependency/toolchain chain: `next`/`postcss`, `@opennextjs/cloudflare`, `wrangler`, `esbuild` và `ws`.
- Policy: không chạy `npm audit fix --force`; theo dõi upstream package updates.
- Reason: remediation hiện tại có thể cần force/breaking changes và có thể làm mất ổn định Next/OpenNext deploy wiring.
- Kết luận validation: PASS_WITH_KNOWN_AUDIT_ADVISORIES.

## 2026-06-16 - Phase 15A OpenNext Cloudflare Workers Wiring

### Phase

Phase 15A - OpenNext Cloudflare Workers Wiring

### Việc đã làm

- Cài `@opennextjs/cloudflare` và `wrangler`.
- Cập nhật `package.json` scripts `preview`, `deploy`, `upload`, `cf-typegen` và `check:opennext-cloudflare`.
- Cập nhật `wrangler.toml` cho Cloudflare Workers qua OpenNext.
- Tạo `open-next.config.ts`.
- Cập nhật `.gitignore` cho `.open-next`, `cloudflare-env.d.ts` và `.dev.vars`.
- Tạo `scripts/check-opennext-cloudflare-wiring.cjs`.
- Tạo `docs/14_OPENNEXT_CLOUDFLARE_WIRING.md`.
- Cập nhật deploy readiness, docs index, decision log và handoff.

### File đã tạo/cập nhật

- package.json
- package-lock.json
- wrangler.toml
- open-next.config.ts
- .gitignore
- eslint.config.mjs
- scripts/check-opennext-cloudflare-wiring.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/13_DEPLOY_READINESS.md
- docs/14_OPENNEXT_CLOUDFLARE_WIRING.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration đã tạo

- Không tạo migration.

### Ghi chú

- Không deploy thật.
- Không push remote.
- Không chạy `npm run deploy`, `npm run upload` hoặc `npx wrangler deploy`.
- Không đọc/in `.env.local`.
- Không hardcode secret hoặc Supabase key vào `wrangler.toml`.
- Không sửa schema/auth/business logic/import confirm/revision restore.

## 2026-06-16 - Phase 14 Deploy Readiness

### Phase

Phase 14 - Deploy Readiness

### Việc đã làm

- Tạo `docs/13_DEPLOY_READINESS.md`.
- Tạo `scripts/check-deploy-readiness.cjs`.
- Thêm script `check:deploy-readiness`.
- Cập nhật `.env.example` để tất cả env là placeholder rỗng.
- Cập nhật Supabase setup docs cho local `127.0.0.1`, production callback và Google OAuth redirect boundary.
- Cập nhật README, docs index, decision log và handoff.

### File đã tạo/cập nhật

- README.md
- .env.example
- package.json
- scripts/check-deploy-readiness.cjs
- docs/00_INDEX.md
- docs/08_AI_WORK_LOG.md
- docs/09_DECISION_LOG.md
- docs/10_SUPABASE_SETUP.md
- docs/13_DEPLOY_READINESS.md
- docs/99_NEXT_AI_HANDOFF.md

### Migration đã tạo

- Không tạo migration.

### Package thay đổi

- Không thêm package.

### Ghi chú

- Phase 14 chỉ chuẩn bị deploy readiness.
- Không deploy thật.
- Không push remote.
- Không sửa `.env.local`, không đọc/in secret.
- Không sửa schema/auth/business logic/import confirm/revision restore.

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
