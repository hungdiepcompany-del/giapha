# Decision Log

## Decision 109 - Backup permission apply requires explicit owner approval marker

Chon:

Future apply phase cho backup permission migration phai co marker `OWNER_APPROVAL_REQUIRED_BEFORE_APPLYING_BACKUP_PERMISSION_MIGRATION=true` va owner approval rieng truoc khi chay migration.

Ly do:

- Migration file ton tai khong dong nghia voi duoc phep apply DB.
- Apply phai tach khoi fallback removal va runtime execute/restore enablement.
- Supabase project, DB backup/snapshot, rollback owner, smoke owner va apply window phai duoc xac nhan truoc.

## Decision 108 - Backup permission rollback drill stays documented before execution

Chon:

Rollback cho backup permission migration phai duoc drill bang docs/check truoc khi apply that, nhung Phase 85 khong chay rollback va khong mutate DB.

Ly do:

- Permission migration co the lam sai access UI/API neu role mapping hoac project target sai.
- Fallback `permissions.manage` la safety bridge va khong duoc go bo som.
- Restore-from-snapshot va permission-assignment rollback can co owner/rollback owner truoc khi execution phase bat dau.

## Decision 107 - Pre-apply backup permission migration requires explicit no-go gate

Chon:

Khong apply backup permission migration neu thieu owner approval, DB backup/snapshot, dung Supabase project, static checks, canonical path check, rollback owner, smoke owner, expected role confirmation hoac fallback removal understanding.

Ly do:

- Permission migration la DB mutation that nen can gate truoc khi chay.
- Runtime fallback `permissions.manage` van phai con cho den khi post-migration smoke pass.
- Checklist giup phase apply sau khong phai doan lai dieu kien an toan.

## Decision 106 - Canonical backup permission migration path is db/migrations

Chon:

Backup permission migration file source of truth la `db/migrations/20260618_0007_backup_operator_permissions.sql`.

`supabase/migrations/20260618_0007_backup_operator_permissions.sql` la wrong old path va khong duoc giu duplicate sau Phase 83.

Ly do:

- Repo GIA PHA dung `db/migrations/` lam canonical migration directory.
- `check:migrations` doc va tooling hien co doc tu `db/migrations/`.
- Tranh hai source of truth cho cung mot migration.
- Van khong chay migration/apply DB neu chua co owner approval rieng, DB backup/snapshot va rollback gate.

## Decision 105 - Real migration handoff keeps execution blocked

Chon:

Phase 82 tong hop trang thai migration file backup permission da tao trong repo, nhung van chan execution cho den khi co owner approval rieng.

Ly do:

- File migration ton tai khong dong nghia voi da apply DB.
- Runtime fallback va execute/restore boundary can duoc giu cho den khi migration duoc apply va smoke that pass.
- Future execution can DB backup/snapshot va rollback plan.

He qua:

- Migration file path duoc ghi la `supabase/migrations/20260618_0007_backup_operator_permissions.sql`.
- Migration has not been run va no DB mutation.
- Fallback `permissions.manage` still remains until post-migration phase.

## Decision 104 - Post-migration smoke is safe-skip unless explicit env is set

Chon:

Phase 81 them smoke plan/script cho sau khi migration duoc apply, nhung script safe-skip neu thieu `BACKUP_PERMISSION_SMOKE_BASE_URL` hoac `BACKUP_PERMISSION_SMOKE_EXPECTED_USER`.

Ly do:

- Phase nay chua duoc phep goi production/network mac dinh.
- Post-migration smoke can duoc chuan bi truoc nhung chi chay route khi operator set explicit env.
- Smoke khong can token va khong duoc trigger backup/restore/storage.

He qua:

- `npm run smoke:backup-permission:post-migration` mac dinh SKIPPED trong local validation.
- Future execution phase co the set env explicit de smoke API/UI route an toan.

## Decision 103 - Runtime fallback removal waits for applied migration and real smoke

Chon:

Phase 80 chi tao plan bo fallback `permissions.manage`, khong sua runtime fallback trong API/UI.

Ly do:

- Migration file da duoc tao nhung chua apply DB.
- Neu bo fallback truoc khi DB co `backup.operator.view` va `backup.operator.dry_run`, operator access co the bi chan sai.
- Can smoke voi real user va rollback plan truoc khi thay runtime guard.

He qua:

- API/UI van giu fallback `permissions.manage`.
- Future fallback removal can migration applied confirmation, assignment confirmation, real-user smoke va owner approval.

## Decision 102 - Real migration file requires static verification before execution planning

Chon:

Phase 79 them static verification rieng cho migration file `supabase/migrations/20260618_0007_backup_operator_permissions.sql`, khong chay migration va khong goi DB.

Ly do:

- File migration that da ton tai trong repo nen can guardrail manh hon candidate checks.
- Can xac nhan role assignment khong cap backup permission cho viewer/public/anonymous roles.
- Can chan destructive SQL, secret/network text va runtime execute/restore action wording truoc execution planning.

He qua:

- `npm run check:backup-permission-real-migration-static-verification` la gate bat buoc truoc cac phase sau.
- Migration van chua duoc chay va runtime fallback `permissions.manage` van giu nguyen.

## Decision 101 - Backup operator permission migration file is created but not run

Chon:

Phase 78 tao real migration file trong `supabase/migrations/` cho `backup.operator.*`, nhung khong chay migration va khong apply DB.

Ly do:

- Owner chi approve file creation trong prompt nay.
- DB mutation, fallback removal va execute/restore runtime activation van can approval rieng.
- Migration can idempotent va static-checkable truoc khi co bat ky apply that nao.

He qua:

- Migration file la `supabase/migrations/20260618_0007_backup_operator_permissions.sql`.
- File co marker `DO_NOT_RUN_WITHOUT_SEPARATE_OWNER_APPROVAL`.
- Runtime fallback `permissions.manage` van giu nguyen.

## Decision 100 - Migration candidate handoff stops before real DB change

Chon:

Phase 77 tong hop SQL candidate, static safety, seed candidate smoke va approval checklist, nhung van dung truoc real migration file va DB mutation.

Ly do:

- Phase 73-77 tao du artifact de owner review nhung khong thay the explicit approval cho DB change.
- Candidate SQL khong phai migration that va khong nam trong `supabase/migrations/`.
- Execute/restore van high-risk va chua duoc bat runtime.

He qua:

- Runtime fallback `permissions.manage` van con.
- Future Phase 78 chi duoc tao migration file that neu owner explicitly approve.
- Khong deploy, khong chay SQL, khong mutate DB, khong production backup va khong secret commit trong bundle nay.

## Decision 099 - Real backup permission migration requires explicit approval gate

Chon:

Phase 76 tao approval checklist bat buoc truoc khi bat ky phase sau nao duoc tao migration that hoac apply DB cho `backup.operator.*`.

Ly do:

- Real migration se cham permission rows va role-permission mappings.
- Execute/restore la high-risk permission va khong duoc bat ngoai y muon.
- Can owner approval, DB backup/snapshot, rollback plan, production window va post-migration validation truoc khi thao tac DB.

He qua:

- Approval marker la `OWNER_APPROVAL_REQUIRED_BEFORE_BACKUP_PERMISSION_REAL_MIGRATION=true`.
- Neu thieu owner approval, SQL review, rollback, DB backup, production window, local checks, assignment confirmation, fallback plan hoac execute/restore boundary thi no-go.
- Phase 76 van khong tao migration that va khong mutate DB.

## Decision 098 - Backup permission seed candidate smoke stays source-static

Chon:

Phase 75 them smoke local de so sanh SQL candidate draft voi seed dry-run script, khong execute SQL va khong goi DB/network/env.

Ly do:

- Candidate SQL va dry-run plan can dong nhat truoc khi owner review approval checklist.
- Smoke source-static phat hien permission drift ma khong can Supabase secret hay database.
- Chua co approval migration/schema/DB mutation that.

He qua:

- `smoke:backup-permission:seed-candidate` chi doc file local va in JSON marker `BACKUP_PERMISSION_SEED_CANDIDATE_SMOKE_ONLY`.
- Candidate van khong phai migration that va van nam ngoai `supabase/migrations/`.
- Future real migration van can approval checklist.

## Decision 097 - Backup permission SQL candidate needs static safety gate

Chon:

Phase 74 them static safety checker rieng cho `scripts/backup-permission-sql-candidate.sql.draft`, khong chay SQL va khong cham DB.

Ly do:

- SQL candidate co the bi drift thanh destructive migration neu khong co guardrail.
- Static check can khoa destructive SQL, network URL, service-role/JWT wording va thieu marker owner approval.
- Check local giu an toan tren may khong co secret hoac Supabase env.

He qua:

- Candidate phai co `BACKUP_PERMISSION_SQL_CANDIDATE_ONLY` va `DO_NOT_RUN_ON_PRODUCTION_WITHOUT_OWNER_APPROVAL`.
- Candidate phai co idempotency concept va 4 permission names.
- Real migration van can approval checklist rieng truoc khi tao file/applied DB.

## Decision 096 - Backup permission SQL remains a draft candidate

Chon:

Phase 73 tao SQL candidate draft trong `scripts/backup-permission-sql-candidate.sql.draft`, khong tao migration that trong `supabase/migrations/` va khong chay SQL.

Ly do:

- Owner chua approve migration/schema/DB mutation that.
- Can co artifact review gan voi schema hien co truoc khi tao migration.
- Draft co the static check destructive SQL va secret/URL drift ma khong cham DB.

He qua:

- Candidate co `BACKUP_PERMISSION_SQL_CANDIDATE_ONLY` va `DO_NOT_RUN_ON_PRODUCTION_WITHOUT_OWNER_APPROVAL`.
- Future migration that van can approval, DB backup/snapshot, rollback va validation rieng.
- Runtime fallback `permissions.manage` van giu nguyen.

## Decision 095 - Backup permission seed readiness stops before real migration

Chon:

Phase 72 tong hop readiness cho `backup.operator.*` permission seed nhung van dung truoc migration/schema/DB mutation that.

Ly do:

- Phase 68-72 da co du design, dry-run, assignment runbook va activation guardrail de owner review.
- Real seed se cham permission table va role mappings nen can approval rieng.
- Execute/restore van la high-risk surface va chua nen bat runtime.

He qua:

- Runtime fallback `permissions.manage` van con den khi co migration/seed that.
- Future Phase 73 co the tao migration/seed that neu owner approve.
- Khong co deploy, DB mutation, worker call, production backup, storage upload, restore hoac secret commit trong bundle nay.

## Decision 094 - Backup permission activation stays blocked by guardrails

Chon:

Phase 71 them source-static guardrail de chan `backup.operator.execute` va `backup.operator.restore` trong runtime dry-run, dong thoi chan worker call, production backup, storage upload, restore trigger va secret/env drift.

Ly do:

- Execute/restore la permission high-risk va chua co migration/seed approval.
- Runtime hien tai chi nen cho phep view/dry_run voi fallback `permissions.manage`.
- Guardrail static giup phat hien drift ma khong can server, DB, worker, secret hay network.

He qua:

- Execute/restore chi duoc xuat hien trong docs/runbook/dry-run seed voi ghi chu chua bat that.
- Runtime backup operator van dry-run-only va chua goi backup service worker that.
- Future migration/seed or real backup activation van can owner approval va phase rieng.

## Decision 093 - Backup permission assignment requires owner approval

Chon:

Phase 70 ghi runbook assignment nhung khong assign that. Future assignment can owner approval, dac biet cho `backup.operator.execute` va `backup.operator.restore`.

Ly do:

- Execute/restore co the mo duong backup/restore that sau nay.
- Role assignment can kiem soat ro de khong cap backup permission cho viewer/public roles.
- Runbook giup phase migration/seed that co checklist verify va rollback truoc khi cham DB.

He qua:

- `OWNER` duoc de xuat all four permission.
- `ADMIN` chi duoc de xuat view/dry_run.
- Cac role khac none by default unless owner approves.

## Decision 092 - Backup permission seed proof stays dry-run only

Chon:

Phase 69 tao local dry-run script mo phong `backup.operator.*` permission seed va role assignment, khong goi Supabase, khong doc env va khong ghi migration.

Ly do:

- Can co bang chung seed plan truoc khi tao migration that.
- Permission execute/restore co rui ro cao nen phai thay ro `would_assign` truoc khi owner approve.
- Dry-run local giu validation chay duoc tren may khong co secret hoac DB.

He qua:

- `backup:permission:seed:dry-run` chi in JSON an toan voi `dry_run: true`.
- Migration/seed that van can phase rieng va approval.

## Decision 091 - Backup permission seed should be a future idempotent migration

Chon:

Phase 68 chi design future migration/seed cho `backup.operator.*`, khong tao migration trong phase nay. Future implementation nen tao migration moi `0007` thay vi sua migration cu.

Ly do:

- Existing migration pattern seed roles/permissions bang `insert ... on conflict`.
- Existing roles la `OWNER`, `ADMIN`, `EDITOR`, `CONTRIBUTOR`, `FAMILY_VIEWER`, `PUBLIC_VIEWER`; repo chua co `SYSTEM_ADMIN`.
- Migration/seed that can approval rieng de tranh cap execute/restore qua rong.

He qua:

- `OWNER` duoc de xuat co view/dry_run/execute/restore trong future seed.
- `ADMIN` chi duoc de xuat view/dry_run.
- Runtime fallback `permissions.manage` van giu cho den khi co migration/seed that.

## Decision 090 - Permission hardening stops before permission seed and real backup

Chon:

Ket thuc Phase 63-67 voi backup operator permission model, API/UI guards, smoke, guardrails va handoff, nhung khong them migration/seed va khong bat real backup worker.

Ly do:

- `backup.operator.*` can duoc seed/map role trong phase rieng co owner approval.
- Worker deploy, storage target, production backup va restore van la surface rui ro cao.
- Handoff can khoa ro fallback hien tai `permissions.manage` de agent sau khong tu y cap quyen hoac deploy.

He qua:

- Phase tiep theo co the la permission migration/seed design, worker manual deploy co approval, hoac quay lai domain model gia pha.
- Bat ky real worker call, storage upload, production backup, restore, cron, deploy hoac secret setup that nao van can phase rieng.

## Decision 089 - Backup operator permission guardrails stay source-static

Chon:

Phase 66 tao smoke va guardrail source-static cho backup operator permission guard, khong chay server/browser/network.

Ly do:

- API/UI permission hardening can gate nhanh tren source de bat marker drift truoc khi co worker deploy that.
- Chua co approval cho deploy worker, storage, backup production hay restore.
- Static guardrail co the chay local/CI ma khong can secret hoac env.

He qua:

- `smoke:backup-operator:permission-guard` xac nhan API/UI guard markers va dry-run boundary.
- `check:backup-operator-permission-guardrails` chan route/page/component/adapter drift sang worker URL, secret, backup, storage, restore hoac cron.

## Decision 088 - Backup operator UI guard mirrors API permission fallback

Chon:

Phase 65 guard `/admin/backups` bang `backup.operator.view` truoc, fallback fail-closed bang `permissions.manage` khi permission backup chua duoc seed that.

Ly do:

- UI operator khong nen tiep tuc dung `exports.download` vi backup operator la boundary rieng.
- Phase nay khong duoc migration/schema/seed nen can fallback tren permission admin hien co.
- Server-side page guard ngan panel render truoc khi user du quyen.

He qua:

- UI va API cung theo model `backup.operator.*` future permission voi fallback `permissions.manage`.
- Panel van chi goi local dry-run route va khong mo backup/storage/restore that.

## Decision 087 - Backup operator API guard uses future permission with admin fallback

Chon:

Phase 64 guard route `/api/admin/backups/service-dry-run` bang `backup.operator.dry_run` truoc, fallback fail-closed bang `permissions.manage` khi permission backup chua duoc seed that.

Ly do:

- Phase nay khong duoc migration/schema/seed nen `backup.operator.dry_run` co the chua ton tai trong DB.
- `permissions.manage` da la permission admin hien co va phu hop lam fallback tam thoi cho operator permission hardening.
- API route can tra JSON 401/403 thay vi redirect page guard.

He qua:

- Route khong con la public dry-run contract nua; no can permission context server-side.
- Backup that, storage upload, worker call va restore van bi chan.
- Phase sau co the them UI guard va smoke/guardrail cho permission markers.

## Decision 086 - Backup operator permissions are proposed before DB seed

Chon:

Phase 63 chi de xuat `backup.operator.view`, `backup.operator.dry_run`, `backup.operator.execute` va `backup.operator.restore`, chua them migration/schema/seed.

Ly do:

- Current permission table chua co backup operator codes.
- Them permission that can phase rieng de kiem seed, role mapping va owner approval.
- API/UI guard co the fail-closed bang fallback documented `permissions.manage` cho den khi permission backup duoc seed that.

He qua:

- Dry-run UI/API se duoc guard trong phase sau nhung van khong mo execute/restore.
- Real backup, real storage, deploy worker va restore van bi chan cho den khi co approval va phase rieng.

## Decision 085 - Operator dry-run bundle stops before permission hardening or real worker call

Chon:

Ket thuc Phase 58-62 voi operator API/UI dry-run, guardrails, smoke va handoff, nhung chua permission hardening that va chua goi backup service worker.

Ly do:

- API route da co contract dry-run nhung permission boundary cho API can phase rieng.
- Worker deploy, secret readiness, real storage va production backup van chua duoc owner approve.
- Handoff can khoa trang thai hien tai de agent sau khong tu y bien dry-run thanh runtime backup.

He qua:

- Phase tiep theo hop ly la permission hardening, manual worker deploy co approval, hoac quay lai domain model gia pha.
- Bat ky real worker call, storage upload, restore, cron, deploy hoac production backup nao van can approval va phase rieng.

## Decision 084 - Operator smoke stays source-static

Chon:

Phase 61 tao smoke local/static chi doc source files cho operator API/UI dry-run.

Ly do:

- Chua co worker deploy that va khong can server dang chay de kiem contract.
- Smoke source-static giup chay local/CI an toan, khong can secret va khong cham network.
- Runtime browser click/integration can phase rieng khi permission va worker approval ro rang.

He qua:

- `smoke:backup-operator:dry-run` xac nhan marker, UI warnings, guardrail va package scripts.
- Smoke khong thay the permission hardening hay deploy smoke that.

## Decision 083 - Operator UI guardrails scan only runtime-relevant source

Chon:

Phase 60 tao guardrail scan cho operator UI/API source va dry-run adapter, khong scan toan bo docs.

Ly do:

- Can chan drift runtime nhu worker URL, token, storage upload, restore, cron hoac production backup trigger.
- Scan docs qua rong se false positive voi runbook va placeholder secret policy.
- Runtime-relevant source la noi co nguy co bien dry-run thanh thao tac that.

He qua:

- `check:backup-operator-ui-guardrails` tro thanh gate cho cac phase UI/API/smoke tiep theo.
- Docs van co the ghi warning va placeholder neu khong dua gia tri secret that vao source.

## Decision 082 - Operator UI calls only the local dry-run route

Chon:

Phase 59 tao `/admin/backups` va component operator panel chi goi `/api/admin/backups/service-dry-run`.

Ly do:

- UI can cho operator thay dry-run status nhung khong duoc goi backup worker URL that.
- Local route da co marker dry-run va envelope safety ro rang.
- Dashboard admin can co duong vao panel de tranh route bi an trong van hanh.

He qua:

- UI hien canh bao no production backup, no storage upload, no restore va no real worker call.
- Route API van can permission hardening rieng truoc khi dung cho van hanh that.

## Decision 081 - Operator API route starts as dry-run contract without DB auth

Chon:

Phase 58 tao `/api/admin/backups/service-dry-run` de tra dry-run envelope local, nhung chua them Supabase permission guard trong route.

Ly do:

- Boundary Phase 58 cam goi DB/network va cam doc secret/env, trong khi permission context hien tai dua vao Supabase.
- Route khong tao backup, khong doc du lieu that va khong goi worker, nen co the dong vai tro contract route cho UI dry-run.
- Auth/permission hardening can phase rieng voi API server-side pattern ro rang.

He qua:

- UI operator co the goi route dry-run noi bo ma khong cham worker that.
- Phase sau phai them guard quyen ro rang truoc khi route duoc dung cho van hanh that.

## Decision 080 - Main app binding remains dry-run until real worker approval

Chon:

Ket thuc Phase 53-57 voi main app binding dry-run-only, chua tao runtime route va chua goi backup service worker that.

Ly do:

- Backup service worker chua deploy that va chua co owner approval cho runtime integration.
- Route operator admin can auth/permission boundary ro rang truoc khi mo API surface.
- Handoff can dong goi trang thai adapter, guardrail, operator contract va smoke de agent sau khong tu y vuot scope.

He qua:

- Phase tiep theo co the lam UI dry-run panel, deploy worker that co approval, hoac quay lai domain model readiness.
- Bat ky real worker call, secret, storage, production backup hoac restore nao van can phase rieng va approval ro rang.

## Decision 079 - Binding smoke remains source-static

Chon:

Phase 56 chi them smoke static/local doc source files va package scripts, khong import runtime app code va khong goi worker/network/env.

Ly do:

- Main app binding van chua co worker deploy, URL, service binding hoac secret that.
- Smoke can bat drift cua adapter/guardrail/operator API contract ma khong bien thanh integration test that.
- Doc source-only giup smoke an toan tren may local va CI khong co secret.

He qua:

- `smoke:main-app-backup-service-binding` la gate local cho contract hien tai.
- `check:main-app-backup-service-binding-smoke` khoa viec doc env, hardcode secret va goi network trong smoke.
- Integration that voi backup service worker van can phase approval/deploy rieng.

## Decision 078 - Backup operator API remains contract-only until API auth boundary is clear

Chon:

Phase 55 chi tao docs/check cho operator API dry-run, khong tao `app/api/admin/backups/service-dry-run/route.ts`.

Ly do:

- Repo hien chua co pattern `app/api/admin` auth/permission route ro rang.
- Tu che API auth co the bypass permission model hoac tao route admin khong duoc bao ve dung.
- Dry-run adapter va guardrails da du de khoa contract truoc khi implement runtime route.

He qua:

- Proposed route duoc document de phase sau implement khi co auth/permission boundary ro.
- Checker se kiem route neu route xuat hien sau nay.

## Decision 077 - Backup service binding guardrails stay source-static and narrow

Chon:

Phase 54 them static guardrail scanner cho cac vung source lien quan main app, nhung khong scan docs/workflow va khong goi runtime.

Ly do:

- Can phat hien som viec hardcode token, URL worker that, hoac bat backup/restore/storage that.
- Scanner qua rong se gay false positive voi docs placeholder va worker scaffold hop le.
- Main app binding van dang dry-run, nen guardrail phai khoa nhung duong runtime that.

He qua:

- `check:backup-service-binding-guardrails` tro thanh gate bat buoc cho cac phase binding/API/smoke sau.
- Cac placeholder hop le van duoc chap nhan khi khong co gia tri that.

## Decision 076 - Main app backup service client starts as dry-run-only server adapter

Chon:

Phase 53 tao `server/services/backup-service-client.ts` lam server-side dry-run adapter thay vi goi backup service worker that.

Ly do:

- Main app chua co binding, URL hay secret that.
- Dry-run adapter cho phep khoa response envelope va action contract truoc khi co network path.
- Tao `server/services` giup phan biet future server-only caller voi UI/client code.

He qua:

- Adapter tra envelope local cho `health`, `dryRun`, `fixtureVerify`.
- Network path bi chan bang `backup_service_network_disabled` cho den phase approval/integration rieng.

## Decision 075 - Pre-deploy handoff keeps real deploy blocked until explicit approval

Chon:

Phase 52 tong hop pre-deploy readiness cho backup service worker, nhung van giu trang thai no-deploy cho den khi owner approve that va secrets san sang.

Ly do:

- Phase 48-51 da chuan bi workflow, runbook, secrets preflight va approval gate nhung chua co approval/execution.
- Handoff can noi ro cai gi da ready va cai gi van blocked de tranh agent sau tu y deploy.
- Production backup, real storage va main app integration van la boundary rieng.

He qua:

- Phase 53 co the chon manual deploy execution, main app binding dry-run, hoac tam dung ha tang.
- Bat ky deploy that nao van can owner approval ngoai repo.

## Decision 074 - Owner approval gate is required before real backup service deploy

Chon:

Phase 51 tao deploy approval gate voi `OWNER_APPROVAL_REQUIRED_BEFORE_REAL_DEPLOY=true`, nhung khong ghi rang deploy da duoc approve.

Ly do:

- Backup service worker deploy co the mo runtime surface moi va can owner chot target, secret, smoke, rollback va deployment window.
- Approval gate can tach khoi secrets preflight va manual runbook de tranh nham lan giua "san sang" va "duoc phep".
- Production backup van khong duoc chay chi vi worker duoc deploy.

He qua:

- Phase 52 co the handoff trang thai pre-deploy voi blocker ro rang.
- Phase deploy that sau nay phai co approval ngoai repo truoc khi chay.

## Decision 073 - Secret preflight is checklist-only

Chon:

Phase 50 tao secrets preflight checklist bang placeholder va no-go conditions, khong doc, tao, verify gia tri, hay goi GitHub/Cloudflare API.

Ly do:

- Secret readiness can duoc xac nhan boi owner/operator trong approved secret stores, khong phai bang cach in gia tri vao repo/log.
- Deploy backup service worker can Cloudflare token/account id, internal token va smoke env nhung tat ca phai o ngoai repo.
- No-go list giup dung deploy khi thieu approval, rollback, local checks hoac post-deploy tester.

He qua:

- Phase 51 co the them deploy approval gate dua tren checklist nay.
- Repo van khong co secret that.

## Decision 072 - Manual deploy remains a runbook until owner approval

Chon:

Phase 49 ghi manual deploy runbook voi `wrangler secret put` va `wrangler deploy` nhu placeholder commands, nhung khong chay bat ky command deploy/secret nao.

Ly do:

- Deploy that can secret runtime, smoke owner va rollback owner.
- Command can duoc ghi ro de van hanh sau nay, nhung khong duoc thuc thi khi chua owner approval.
- Runbook phai giu production backup disabled rieng voi worker deploy.

He qua:

- Phase 50 co the kiem secrets preflight ma van khong doc/tao secret that.
- Manual deploy future se phai di qua approval gate truoc.

## Decision 071 - Backup service deploy workflow is manual-only

Chon:

Phase 48 tao `.github/workflows/backup-service-deploy.yml` chi voi `workflow_dispatch`, khong co push, pull_request hoac schedule trigger.

Ly do:

- Backup service worker deploy can owner chu dong bam workflow sau khi secret/approval san sang.
- Auto deploy tu code change co the mo production route khi chua smoke/rollback.
- Workflow rieng giup khong tron deploy main app voi backup service worker.

He qua:

- Workflow co deploy step cho tuong lai nhung khong duoc chay trong Phase 48.
- Checker khoa manual-only trigger va secret reference dang `secrets.*`.

## Decision 070 - Deploy readiness handoff is not deploy approval

Chon:

Phase 47 tong hop backup service worker deploy readiness thanh handoff, nhung khong xem day la approval de deploy, push, cau hinh secret, storage hoac main app integration.

Ly do:

- Phase 43-46 moi khoa tai lieu, checker va smoke safe-skip.
- Real deploy can owner approval, runtime secret, route decision, smoke plan va rollback.
- Production backup van can approval rieng va khong duoc kich hoat boi handoff nay.

He qua:

- Phase 48 co the chon manual deploy execution, GitHub Actions deploy workflow readiness, hoac main app binding implementation.
- Bat ky huong nao cung phai giu no-secret/no-production-backup boundary cho den khi co approval ro rang.

## Decision 069 - Main app binding remains contract-only

Chon:

Phase 46 chi thiet ke contract de main app goi backup service worker sau nay, khong sua main app runtime va khong them binding/secret that.

Ly do:

- Main app -> backup service worker la duong runtime co the dan toi production backup, can approval va permission boundary rieng.
- Can quyet dinh giua Cloudflare service binding va internal URL + Bearer token truoc khi code.
- Permission model hien co khong duoc bypass boi backup service integration.

He qua:

- Contract da ghi request/response envelope, error mapping, timeout/retry/logging va permission boundary.
- Future implementation phai la phase rieng, server-only va dry-run first.

## Decision 068 - Post-deploy smoke must safe-skip without explicit env

Chon:

Phase 45 them smoke script cho backup service worker nhung script phai skip neu thieu `BACKUP_SERVICE_SMOKE_BASE_URL` va chi goi internal endpoints khi co `BACKUP_SERVICE_SMOKE_TOKEN`.

Ly do:

- Backup service worker chua deploy va chua co production route.
- Smoke script co the huu ich sau deploy, nhung khong duoc tu y goi production hoac in token.
- Safe-skip giup validation local/CI khong can secret va khong cham network.

He qua:

- `smoke:backup-service-worker:post-deploy` mac dinh SKIPPED trong repo hien tai.
- Future operator phai set env explicit neu muon smoke sau deploy that.

## Decision 067 - Backup service secrets stay placeholder-only until approved runtime setup

Chon:

Phase 44 chi ghi env/secret contract cho backup service worker bang placeholder, khong tao secret that, khong doc secret file va khong goi Wrangler/API.

Ly do:

- `BACKUP_SERVICE_INTERNAL_TOKEN` se la runtime secret nhay cam khi worker duoc deploy va co caller that.
- Secret provisioning/rotation can approval va thao tac van hanh rieng ngoai repo.
- Docs/checker can khoa chinh sach no-secret-in-docs truoc khi them post-deploy smoke.

He qua:

- Repo chi luu ten placeholder, khong luu gia tri.
- Phase 45 co the them smoke plan voi safe-skip neu khong co env explicit.

## Decision 066 - Backup service deploy readiness remains no-deploy

Chon:

Phase 43 tao deploy readiness gate cho backup service worker bang static/local checks, nhung khong deploy that va khong them production route.

Ly do:

- Backup service worker moi o muc scaffold va chua co secret/storage/main-app integration.
- Deploy command can duoc document nhu placeholder de phase sau biet huong, nhung khong nen chay khi chua approval.
- Wrangler config can duoc khoa o muc no-route/no-secret truoc khi bat ky deploy phase nao.

He qua:

- `check:backup-service-worker-deploy-readiness` xac nhan source/config/endpoints/auth/envelope/secret safety.
- Phase 44 co the tap trung vao env/secret contract runbook.

## Decision 065 - Worker split readiness is a handoff baseline, not deploy approval

Chon:

Phase 42 tong hop worker split va backup readiness Phase 37-42 thanh handoff baseline, khong xem day la approval de deploy backup service worker hoac chay production backup.

Ly do:

- Backup service worker da co scaffold va local/static contract checks nhung chua co deploy readiness gate.
- Main app integration van chua duoc implement va chua co service binding/token/env that.
- Production backup can approval rieng ve owner, storage target, privacy, retention, restore drill va rollback.

He qua:

- Phase tiep theo nen la deploy readiness gate hoac service binding design rieng.
- Handoff nay chi khoa tai lieu/checks va boundary, khong mo duong runtime production.

## Decision 064 - Main app integration needs a separate approval phase

Chon:

Phase 41 chi thiet ke readiness cho main app goi backup service worker qua service binding hoac internal URL + Bearer token, khong implement integration that.

Ly do:

- Main app integration co the tao duong goi production backup nen can approval va deploy-readiness rieng.
- Binding/token/env that la secret/config van hanh, khong nen them trong docs/check phase.
- Request/response envelope va error mapping can duoc khoa truoc khi code tich hop.

He qua:

- Main app van chua goi backup service.
- Phase sau co the lam deploy readiness hoac binding design chi tiet hon.

## Decision 063 - Worker contract smoke stays static before deploy readiness

Chon:

Phase 40 dung static/source contract checker va smoke marker thay vi import/chay Cloudflare Worker runtime.

Ly do:

- Chua co build/runtime harness rieng cho worker service.
- Static checks du de khoa endpoint/auth/envelope/no-outbound contract o phase nay.
- Runtime smoke nen la phase deploy-readiness rieng sau khi co config ro rang.

He qua:

- `smoke:backup-service-worker:contract` khong goi network va khong deploy.
- Phase 41 co the thiet ke integration readiness dua tren contract da khoa.

## Decision 062 - Backup service scaffold has internal-only mutation endpoints

Chon:

Phase 39 scaffold `services/backup-service` voi `GET /health` public va cac endpoint `/internal/*` yeu cau bearer token placeholder.

Ly do:

- Health check can non-sensitive va public de future deploy smoke don gian.
- Dry-run/fixture verify la internal behavior, khong nen public mutation.
- Scaffold can typecheck duoc nhung khong can Cloudflare runtime/deploy that.

He qua:

- Worker source co JSON envelope va marker `BACKUP_SERVICE_DRY_RUN_ONLY`.
- Token that va route production van chua duoc cau hinh.

## Decision 061 - Backup service should be a small separate worker

Chon:

Phase 38 thiet ke `services/backup-service/` nhu mot worker nho rieng cho backup/storage readiness thay vi nhhoi logic backup vao main Next/OpenNext worker.

Ly do:

- Backup/storage co the tang bundle/startup va can internal auth/logging/retry rieng.
- Main app nen giu vai tro UI/auth/family data route nhe.
- Worker rieng giup sau nay tich hop bang service binding hoac internal URL + Bearer token co boundary ro rang.

He qua:

- Phase 39 co the scaffold worker toi thieu nhung khong deploy.
- Main app integration van can phase readiness/approval rieng.

## Decision 060 - Restore GitHub menu script dirty state to HEAD

Chon:

Phase 37 chon `REVERT_TO_HEAD` cho `GIA_PHA_GITHUB_MENU.bat`.

Ly do:

- `git diff -- GIA_PHA_GITHUB_MENU.bat` khong co content diff huu ich.
- Dirty state chi la line-ending/touched-file noise.
- Commit file .bat trong trang thai nay se tao nhieu hon gia tri van hanh.

He qua:

- Repo hygiene sach hon truoc khi scaffold backup service worker.
- File menu khong duoc stage/commit trong phase sau tru khi co yeu cau rieng.

## Decision 059 - Production backup requires explicit approval gate

Chon:

Phase 36 tao approval/no-go checklist truoc khi bat ky phase sau nao duoc tao backup production that hoac upload vao storage that.

Ly do:

- Backup production co the chua du lieu gia dinh rieng tu va can storage/secret/privacy/retention/restore drill approval ro rang.
- Cac phase 32-35 moi chung minh local sandbox va dry-run, khong phai approval backup that.
- No-go list giup AI/operator dung lai khi thieu owner, storage target, secret plan hoac privacy review.

He qua:

- Phase sau chi duoc chuyen sang sandbox cloud prototype hoac production runbook neu co approval ro rang.
- Phase 36 khong tao backup, khong upload, khong restore va khong deploy.

## Decision 058 - Upload verification remains a local dry-run

Chon:

Phase 35 tao `backup:storage:verify-upload:dry-run` chi doc artifact da tao boi local sandbox adapter va verify manifest/checksum/secret flags. Khong upload cloud that.

Ly do:

- Can kiem artifact sau buoc put local truoc khi chuyen sang provider sandbox.
- Upload cloud that can storage target, credential va approval rieng.
- Dry-run verification giup bat checksum/manifest drift ma khong cham network.

He qua:

- Phase 36 co the dua upload verification dry-run vao approval checklist.
- Provider upload van la phase rieng sau khi co storage target va approval.

## Decision 057 - Local storage adapter writes only fixture sandbox output

Chon:

Phase 34 implement `backup:storage:adapter:local` chi copy fixture/manifest mau vao `fixtures/backup-sandbox/adapter/`, tao index local va verify checksum.

Ly do:

- Can prototype adapter behavior that hon contract nhung van khong cham cloud/storage provider.
- Fixture-only output giup Phase 35 verify upload dry-run co artifact on dinh de doc.
- Khong implement delete de tranh tao pattern nguy hiem truoc retention/approval that.

He qua:

- Adapter local co the duoc dung nhu input cho upload verification dry-run.
- Cloud adapter va production upload van la phase rieng sau approval.

## Decision 056 - Storage adapter contract is provider-neutral and no-network

Chon:

Phase 33 tao contract provider-neutral cho storage adapter va script `backup:storage:contract` chi validate shape local voi marker `STORAGE_ADAPTER_CONTRACT_ONLY`.

Ly do:

- Can thong nhat method/manifest/verify/delete safety truoc khi prototype local adapter.
- Provider cloud that can credential va policy rieng, khong nen dua vao contract phase.
- Contract provider-neutral giup so sanh R2, Google Drive, Supabase Storage va offline storage sau nay ma khong khoa vao mot SDK.

He qua:

- Phase 34 co the implement local sandbox adapter theo contract.
- Cloud provider adapter van can phase rieng va approval rieng.

## Decision 055 - Phase 32 keeps sandbox storage local

Chon:

Phase 32 recommend tiep tuc dung local sandbox trong `fixtures/backup-sandbox/` cho prototype tiep theo. Cloudflare R2, Google Drive, Supabase Storage va local/offline storage duoc so sanh, nhung production storage target chua duoc chot.

Ly do:

- Local sandbox giu validation deterministic va khong can secret/provider setup.
- Production backup storage can approval, credential handling, retention, restore drill va incident owner rieng.
- Cloudflare R2 co the la candidate ky thuat tot sau nay, nhung khong duoc cau hinh that trong Phase 32.

He qua:

- Phase 33 co the thiet ke adapter contract ma chua can cloud provider.
- Bat ky storage production nao sau nay phai la phase rieng voi approval ro rang.

## Decision 054 - Backup readiness handoff is not production backup approval

Chon:

Phase 31 tao `docs/31_BACKUP_READINESS_HANDOFF.md` va checker de tong hop Phase 18-31, nhung khong bien bundle nay thanh approval cho backup production.

Ly do:

- Cac phase backup gan day moi tao runbook, fixture, dry-run, local CI va report mau.
- Production backup can storage target, credential handling, approval, smoke evidence va rollback rieng.
- Handoff can ro rang de AI sau khong hieu nham fixture/report la backup that.

He qua:

- Next phase nen chon storage target sandbox hoac approval checklist truoc khi tao backup that.
- Khong bat cron, khong upload, khong restore va khong deploy tu Phase 31.

## Decision 053 - Restore drill report is fixture evidence only

Chon:

Phase 30 tao command `restore:drill:report` sinh report JSON tu fixture va manifest sample, khong restore that.

Ly do:

- Can co artifact report de handoff va CI/local review ma khong cham production.
- Report restore that se co rui ro neu bi hieu nham la da phuc hoi production.
- Fixture report giu bang chung manifest/graph/privacy/secret scan o muc an toan.

He qua:

- Report co `noProductionMutation: true` va `restoreExecution: SKIPPED`.
- Report production that van can phase rieng sau khi co backup/storage/approval.

## Decision 052 - Retention policy gate does not remove artifacts

Chon:

Phase 29 tao command `backup:retention:check` chi validate retention policy bang fixture/sandbox metadata va khong xoa file.

Ly do:

- Backup retention co rui ro mat du lieu neu ap dung vao storage that khi chua co manifest/verification/approval.
- Can co policy gate truoc khi chon storage target hoac bat job that.
- Weekly/monthly/pre-deploy rules can duoc document va test bang data mau truoc.

He qua:

- Retention command chi bao `keep`, `review_later`, `blocked_manifest_invalid`.
- Bat ky cleanup that nao sau nay phai la phase rieng voi approval va rollback notes.

## Decision 051 - Backup storage simulation stays local sandbox only

Chon:

Phase 28 tao command `backup:storage:sandbox` copy fixture va manifest sample vao `fixtures/backup-sandbox/`, kem local index `storage-index.fixture.json`.

Ly do:

- Can mo phong artifact staging truoc khi chon storage target that.
- Storage cloud that can credential, access policy va retention approval rieng.
- Fixture sandbox giup kiem file/index contract ma khong cham production data.

He qua:

- `fixtures/backup-sandbox/` chi chua du lieu mau va co the commit an toan.
- R2/Google Drive/Supabase Storage hoac storage target that van la phase rieng sau approval.

## Decision 050 - Backup readiness CI stays local-only

Chon:

Phase 27 tao workflow `.github/workflows/backup-readiness.yml` cho `pull_request` va `workflow_dispatch`, chi chay local backup readiness scripts va checker.

Ly do:

- Can CI gate de bat drift trong dry-run/fixture/restore validator truoc khi mo automation that.
- Workflow backup readiness khong can production secret, storage target hay deploy permission.
- Khong them `schedule:` de tranh bien no thanh backup job that khi chua co approval.

He qua:

- PR/manual gate co the chay `backup:pipeline:readiness` an toan.
- Real backup, storage upload, cron va restore production van la phase rieng.

## Decision 049 - Backup readiness pipeline coordinates local safe gates only

Chon:

Phase 26 tao command `backup:pipeline:readiness` de chay lan luot `backup:dry-run`, `backup:fixture:generate`, `backup:fixture:verify` va `restore:dry-run`.

Ly do:

- Can mot lenh tong hop de xac nhan bundle backup readiness nhung van chua tao automation production.
- Cac buoc con deu chi dung mock/static fixture va restore dry-run, nen phu hop lam local gate.
- Giu ranh gioi an toan truoc khi them CI gate, storage sandbox hoac scheduled job that.

He qua:

- Phase sau co the dua `backup:pipeline:readiness` vao CI/manual checklist.
- Pipeline nay khong thay the real backup smoke test khi co storage/job that.

## Decision 048 - Restore validator remains dry-run only

Chon:

Phase 25 tao command `restore:dry-run` de validate fixture restore readiness bang in-memory plan, nhung restore execution luon la `SKIPPED`.

Ly do:

- Can kiem graph/privacy/manifest truoc khi thiet ke restore that.
- Restore that co rui ro ghi de du lieu gia pha, nen khong duoc lam khi chua co transaction/validation/approval rieng.
- Fixture-only validator giup pipeline sau nay co gate an toan ma khong cham production.

He qua:

- `restore:dry-run` co the dung trong readiness pipeline.
- Bat ky restore that nao sau nay phai la phase rieng voi rollback, transaction va approval ro rang.

## Decision 047 - Backup manifest integrity stays fixture-only

Chon:

Phase 24 tao command `backup:fixture:verify` de verify manifest va fixture sample local, tinh lai checksum SHA-256 va validate count/flag/shape truoc khi co automation backup that.

Ly do:

- Can co gate kiem checksum va manifest drift truoc restore dry-run.
- Giu an toan: chi doc fixture mau, khong doc env, khong goi API/DB/network va khong restore.
- Khong can package moi vi Node `crypto` du de tinh SHA-256.

He qua:

- Backup pipeline sau nay co the goi `backup:fixture:verify` nhu mot readiness gate local.
- Neu manifest schema thay doi, checker Phase 24 phai duoc cap nhat cung fixture generator.

## Decision 046 - Phase 23 uses generated sample fixtures only

Chon:

Phase 23 tao sample fixture generator ghi file vao `fixtures/backup/` voi du lieu gia, khong dung du lieu gia pha that. Fixture va manifest deu danh dau `environment: fixture`, `contains_real_data: false`, `contains_secret: false`.

Ly do:

- Cac buoc manifest integrity va restore dry-run can input on dinh de kiem tra ma khong cham production.
- Fixture trong repo phai la du lieu mau ro rang, khong phai backup that.
- Generator giup tao lai fixture deterministic thay vi copy thu cong.
- File `GIA_PHA_GITHUB_MENU.bat` van la thay doi ton dong ngoai scope, khong stage/commit.

## Decision 045 - Phase 22 starts backup automation with mock dry-run only

Chon:

Phase 22 tao command `backup:dry-run` chi dung mock/static data trong bo nho. Command validate manifest shape, naming convention, secret pattern scan va restore compatibility checklist nhung khong doc env, khong goi network/API/DB, khong tao file backup that va khong restore.

Ly do:

- Backup automation can co buoc dry-run cuc nho de khoa contract truoc khi tao fixture hoac job that.
- Mock dry-run giup validate guardrail ma khong cham du lieu gia dinh production.
- Phase 22 van giu `GIA_PHA_GITHUB_MENU.bat` ngoai stage/commit vi day la thay doi ton dong ngoai scope.

## Decision 044 - Phase 21 designs automated backup without enabling automation

Chon:

Phase 21 chi tao automated backup job design. Khong tao scheduled job that, khong bat cron, khong tao/upload backup production that, khong restore, khong them storage credential, khong deploy va khong mutate du lieu.

Ly do:

- Backup automation co the di chuyen du lieu gia dinh that ra ngoai app, nen can storage, retention, manifest, checksum, restore drill va monitoring truoc khi bat that.
- Current export layer da co JSON/GEDCOM/ZIP output, nhung chua co job identity, storage target hay retention policy duoc approval.
- Job production can disabled-by-default va phai di qua dry-run/sample data truoc.
- File `GIA_PHA_GITHUB_MENU.bat` dang modified ngoai scope phai tiep tuc de ngoai stage/commit.

## Decision 043 - Phase 20 keeps custom domain cutover as readiness only

Chon:

Phase 20 chi tao runbook custom domain cutover readiness. Khong chot domain that, khong doi DNS, khong cau hinh Cloudflare custom domain/route, khong doi Supabase Auth, khong doi Google OAuth, khong deploy va khong goi API mutate config.

Ly do:

- Domain cutover co the lam hong login/OAuth, Supabase session va canonical production URL neu Cloudflare, Supabase va Google OAuth khong doi dong bo.
- Repo chua co custom domain chinh thuc, nen ghi `<TO_BE_CONFIRMED>` thay vi tu doan.
- `workers.dev` can duoc giu lam fallback cho toi khi custom domain smoke PASS.
- File `GIA_PHA_GITHUB_MENU.bat` dang modified ngoai scope phai tiep tuc de ngoai stage/commit.

## Decision 042 - Phase 19 keeps backup and restore drill procedural before automation

Chon:

Phase 19 chi tao runbook scheduled backup va restore drill o muc quy trinh. Khong tao backup production that, khong restore production, khong them cron/job that, khong doi schema/data va khong doi domain/Auth/OAuth config.

Ly do:

- Backup production co the chua du lieu gia dinh that, nen can quy tac luu tru, manifest, PASS/FAIL va incident response truoc khi tu dong hoa.
- Restore production la thao tac high-risk; drill phai chay tren local/test/staging/sandbox truoc.
- Scheduled automation can thiet ke storage, retention, alerting va secret policy rieng; Phase 19 chi chuan hoa manual schedule va checklist.
- File `GIA_PHA_GITHUB_MENU.bat` dang modified ngoai scope phai tiep tuc de ngoai stage/commit.

## Decision 041 - Phase 18 hardens backup, domain and alerting before automation

Chon:

Phase 18 chi bo sung runbook hardening cho backup, domain va alerting/incident readiness. Khong deploy lai, khong tao backup that, khong doi domain/Auth/OAuth config that, khong sua schema va khong mutate du lieu.

Ly do:

- Production da PASS, nen can ky luat backup/restore/domain/alerting truoc cac thay doi van hanh rui ro hon.
- Restore, import confirm, revision restore va custom domain cutover deu la thao tac high-risk can phase rieng.
- Backup that co the chua du lieu gia pha production, nen khong duoc commit hoac paste vao docs/logs/chat.
- Alerting tu dong can cau hinh dashboard/tai khoan rieng; Phase 18 chi ghi checklist va future setup, khong gia vo da cau hinh.

## Decision 040 - Phase 17 ưu tiên runbook vận hành production

Chọn:

Phase 17 chỉ bổ sung runbook vận hành production, monitoring checklist, smoke guide, incident triage và rollback guidance. Không deploy lại, không mở tính năng lớn và không sửa runtime/data.

Lý do:

- Production đã có Worker thật và Google OAuth production PASS, nên cần quy trình kiểm tra sau deploy rõ ràng.
- Sự cố production nên được xử lý theo logs, deploy history, auth redirect config và rollback trước khi chạm schema hoặc dữ liệu.
- Optional smoke bằng `PROD_SMOKE_BASE_URL` phải skip an toàn khi thiếu env, không làm local validation phụ thuộc network.
- Boundary giữ nguyên: không deploy lại, không migration, không sửa dữ liệu thật, không hardcode secret/token/key.

## Decision 039 - Phase 16 chỉ ổn định production, không mở tính năng lớn

Chọn:

Phase 16 tập trung checklist vận hành production sau deploy đầu tiên: route smoke, Auth/OAuth, privacy, export backup, logs/observability và quy trình sau mỗi deploy. Không sửa schema, không chạy migration, không thay đổi privacy/business logic, không import confirm và không revision restore.

Lý do:

- Production vừa PASS, nên ưu tiên ổn định vận hành và phát hiện regression trước khi mở tính năng mới.
- Dữ liệu thật đang tồn tại, mọi thay đổi ghi dữ liệu hoặc schema cần phase riêng.
- Checklist production giúp deploy sau có quy trình rõ và giảm rủi ro lộ dữ liệu riêng tư.

## Decision 038 - Production deploy đầu tiên PASS qua GitHub Actions Cloudflare Deploy

Chọn:

Ghi nhận deploy production đầu tiên chạy bằng GitHub Actions Cloudflare Deploy thay vì Windows local. Worker `web-gia-pha` chạy tại `https://web-gia-pha.hungdiepcompany.workers.dev/`.

Lý do:

- Windows local deploy bị blocker OpenNext compatibility.
- GitHub Actions/Linux deploy path đã PASS và phù hợp môi trường Cloudflare-compatible.
- Supabase URL/Redirect URLs và Google OAuth đã được cấu hình theo production URL, Google OAuth login PASS.

## Decision 037 - Phase 15E deploy thật chuyển sang GitHub Actions thủ công

Chọn:

Tạo workflow `.github/workflows/cloudflare-deploy.yml` chạy thủ công bằng `workflow_dispatch` trên `ubuntu-latest`, dùng Node 24, GitHub Actions variables/secrets và `npm run deploy`. Workflow không chạy khi push/pull request và không hardcode token/secret trong repo.

Lý do:

- Windows local deploy đã bị chặn bởi OpenNext compatibility, trong khi Linux build gate đã PASS.
- Deploy thật cần chạy trong môi trường Linux/Cloudflare-compatible nhưng vẫn phải giữ kiểm soát thủ công.
- Không đưa Cloudflare/Supabase secret vào repo hoặc log.

## Decision 036 - Phase 15D không vá app logic cho OpenNext Windows deploy blocker

Chọn:

Khi `npm.cmd run deploy` trên Windows fail ở bước OpenNext bundle với lỗi thiếu `.open-next/.build/open-next.config.edge.mjs`, dừng deploy và ghi report BLOCKED. Không sửa app logic để né lỗi Windows/OpenNext; deploy thật phải chuyển sang WSL/Linux hoặc GitHub Actions deploy path.

Lý do:

- GitHub Actions Linux build gate đã PASS, nên vấn đề là Windows-local compatibility.
- Vá app logic cho lỗi build tool theo môi trường có thể làm lệch business logic và tăng rủi ro deploy.
- Production deploy cần chạy trong môi trường Cloudflare-compatible đã được gate bằng Linux.

## Decision 035 - Phase 15C dùng GitHub Actions/Linux làm OpenNext build gate

Chọn:

Tạo GitHub Actions workflow chạy trên `ubuntu-latest` để kiểm tra `npm ci`, foundation checks, Next build và `npx opennextjs-cloudflare build` trước khi retry deploy thật.

Lý do:

- OpenNext build trên Windows local có compatibility issue đã biết, không nên sửa app logic để né lỗi môi trường.
- Linux gate giúp xác nhận OpenNext build có PASS trên môi trường Cloudflare-compatible trước khi deploy.
- Workflow không deploy, không upload, không chạy migration và không yêu cầu production secret thật.

## Decision 034 - Phase 15B chỉ chuẩn bị service boundary, chưa tách Worker

Chọn:

Giữ main Web Worker cho UI public/admin, auth callback, CRUD nhẹ và tree nhẹ. Ghi nhận export/import/media/PDF/image/backup nặng là ứng viên split service sau này, tạo template worker và checker readiness nhưng chưa tạo service Cloudflare thật.

Lý do:

- App còn nhỏ và cần đo bundle/deploy thật trước khi tách service.
- Tránh main Worker phình to khi export/import/media/PDF tăng độ nặng.
- Giữ business logic hiện tại ổn định, không đổi behavior chỉ vì lỗi OpenNext local trên Windows.

## Decision 033 - Deploy target là Cloudflare Workers via OpenNext

Chọn:

Phase 15A dùng Cloudflare Workers qua `@opennextjs/cloudflare` cho app Next.js SSR/server routes. `wrangler.toml` trỏ `.open-next/worker.js`, assets trỏ `.open-next/assets`, và deploy command chuẩn là `npm run deploy` sau khi production env/secrets và backup đã sẵn sàng.

Lý do:

- App dùng App Router, route handlers và server-side admin/auth flow nên không chọn static-only deploy.
- OpenNext là adapter phù hợp để build Next.js SSR lên Cloudflare Workers.
- `SUPABASE_SERVICE_ROLE_KEY` vẫn chỉ là Cloudflare secret/server-side, không hardcode vào repo.
- Phase 15A chỉ wiring, chưa deploy thật.

## Decision 032 - Phase 14 chỉ chuẩn bị deploy, chưa deploy

Chọn:

Phase 14 tạo deploy readiness docs/checklist/script và giữ Cloudflare deploy ở trạng thái chuẩn bị. Không deploy thật, không push remote, không tạo Cloudflare project, không ghi secret vào repo.

Lý do:

- Production env, Supabase redirect URL và Google OAuth domain cần được kiểm tra thủ công trước first deploy.
- Dữ liệu thật đã tồn tại, nên deploy phải đi kèm backup JSON/ZIP và rollback plan.
- `SUPABASE_SERVICE_ROLE_KEY` phải cấu hình ở deploy platform/server-side, không xuất hiện trong client hoặc file tracked.
- Mốc tiếp theo là Phase 15 First Cloudflare Deploy.

## Decision 031 - Phase 13 polish UI, không đổi luồng dữ liệu

Chọn:

Phase 13 chỉ chuẩn hóa giao diện nền bằng UI primitives nhẹ, copywriting tiếng Việt, spacing và trạng thái empty/error. Không đổi schema, RLS, auth callback, relationship model, import confirm hoặc revision restore.

Lý do:

- Phase 12 đã là baseline ổn định sau smoke test Supabase thật, nên UI polish không được làm trôi business logic.
- Import confirm và revision restore vẫn là bề mặt ghi dữ liệu lớn, cần planning riêng trước khi bật.
- Reusable primitives giúp các trang đọc nhất quán mà không kéo thêm UI package.
- Phase kế tiếp nên là Deploy Readiness hoặc Import Confirm Planning tùy ưu tiên.

## Decision 030 - Phase 12 khóa baseline sau real Supabase smoke test

Chọn:

Phase 12 là docs/stability phase sau khi user xác nhận real Supabase smoke test chính đã PASS. Baseline hiện tại được xem là mốc ổn định trước UI polish.

Lý do:

- Dự án đã có dữ liệu thật trong Supabase, nên không chạy lại toàn bộ migration 0001-0006 nếu chưa review schema/data state.
- Google OAuth đã hoạt động và PKCE issue trước đó tự hết, nên không sửa thêm auth nếu lỗi không tái diễn.
- Import confirm thật và revision restore thật vẫn có rủi ro ghi dữ liệu, nên chưa bật trước khi có transaction, validation và log đầy đủ.
- Phase tiếp theo nên là UI Polish Foundation thay vì mở bề mặt ghi dữ liệu lớn.

## Decision 028 - Phase 11 là integration gate, không chạy Supabase thật tự động

Chọn:

Phase 11 chỉ tạo docs, script gate và status route an toàn để chuẩn bị tích hợp Supabase thật. Không tự động chạy migration, không deploy và không push.

Lý do:

- Migration production cần user xác nhận project/env/quyền rõ ràng.
- Secret thật không được ghi vào repo hoặc log.
- Gate kiểm tra giúp giảm rủi ro trước khi smoke test bằng user thật.

## Decision 029 - System status chỉ hiển thị boolean config

Chọn:

`/admin/system/status` chỉ hiển thị yes/no cho env config và danh sách checks, yêu cầu `settings.manage` hoặc `permissions.manage`.

Lý do:

- Không lộ secret ra client.
- Không cần query dữ liệu nhạy cảm để biết cấu hình đã sẵn sàng chưa.
- Người không có quyền quản trị hệ thống không cần xem trạng thái service role.

## Decision 026 - Phase 10 chỉ preview import JSON, không ghi DB

Chọn:

Phase 10 tạo validator và preview UI cho `family.json`, nhưng không bật import thật, không lưu file upload và không ghi đè dữ liệu hiện tại.

Lý do:

- Import thật có nguy cơ phá hỏng dữ liệu gia phả nếu chưa có transaction, conflict resolution, rollback và revision/import log.
- Preview giúp kiểm tra sớm schema, reference và vòng tổ tiên mà không cần mở bề mặt ghi dữ liệu.
- `family.json` là bản bảo toàn dữ liệu chính nên đường import phải đi từng bước, không dùng generic overwrite.

## Decision 027 - Conflict check import chạy server-side sau permission

Chọn:

Conflict check DB cho import JSON chỉ chạy trong server service sau khi user có `imports.create` và admin Supabase config khả dụng.

Lý do:

- Service role key không được đưa ra client.
- Client chỉ cần summary/issues/conflicts đã được server tính.
- Khi thiếu Supabase config, validator vẫn hoạt động độc lập và báo conflict DB unavailable thay vì crash.

## Decision 025 - Phase 9 chỉ bật restore placeholder

Chọn:

Phase 9 tạo UI xem revision list/detail và diff before/after, nhưng nút khôi phục chỉ disabled placeholder.

Lý do:

- Restore thật có nguy cơ ghi đè dữ liệu hiện tại nếu chưa có transaction và validation rõ.
- Cần ghi revision mới cho hành động restore, kiểm entity_type/action và xử lý quan hệ liên bảng trước khi bật.
- Mục tiêu Phase 9 là audit trail có thể xem được trước, không phải phục hồi tự động.

## Decision 023 - family.json là bản bảo toàn dữ liệu chính

Chọn:

Phase 8 dùng `family.json` làm bản export chính giữ ID ổn định, quan hệ thật và layout cây. GEDCOM là định dạng chuyển đổi phụ.

Lý do:

- GEDCOM không map hết dữ liệu riêng của hệ thống như layout, visibility, audit field hoặc quan hệ không chuẩn.
- JSON giúp bảo toàn dữ liệu khi cần phục hồi hoặc chuyển hệ thống.
- Không làm mất dữ liệu chỉ vì phần mềm GEDCOM không hỗ trợ đủ.

## Decision 024 - ZIP backup tách manifest và checksums

Chọn:

`full-backup.zip` chứa `family.json`, `family.ged`, `manifest.json` và `checksums.json`. Checksum SHA-256 được ghi trong `checksums.json` để tránh tự tham chiếu vòng tròn trong manifest.

Lý do:

- Manifest mô tả backup và limitation.
- Checksums là nguồn kiểm tra toàn vẹn file.
- Cấu trúc này đơn giản, dễ đọc và đủ cho foundation trước khi có media thật.

## Decision 021 - Public pages dùng DTO public-safe

Chọn:

Phase 7 tạo `PublicPerson` và privacy service để sanitize dữ liệu trước khi render public pages.

Lý do:

- Không dựa vào CSS/UI để ẩn dữ liệu nhạy cảm.
- Đảm bảo `notes_private` không xuất hiện trong DTO public.
- Người còn sống được bảo vệ mặc định ở public mode.

## Decision 022 - Chưa mở RLS public rộng trong Phase 7

Chọn:

Public service dùng server-side anon Supabase client với query/filter `visibility = public`, `deleted_at is null`, nhưng không tạo policy public rộng mới trong Phase 7.

Lý do:

- Tránh mở nhầm dữ liệu private trước khi có audit RLS public đầy đủ.
- Nếu database thật chưa có public-safe policy, public route fail hoặc empty an toàn.
- Không dùng service role để lách RLS cho public pages.

## Decision 019 - Layout cây lưu riêng với dữ liệu gia phả thật

Chọn:

Phase 6 tạo `tree_layouts` và `tree_layout_nodes` để lưu vị trí node thủ công.

Lý do:

- Kéo node là thao tác UI, không phải thay đổi quan hệ cha/mẹ/con/vợ/chồng.
- Giữ nguyên nguyên tắc không trộn dữ liệu layout cây với dữ liệu gia phả thật.
- Cho phép reset layout về auto layout mà không ảnh hưởng dữ liệu quan hệ.

## Decision 020 - Tree Editor add relationship đi qua service thật

Chọn:

Side panel editor gọi server actions rồi dùng relationship service hiện có để thêm cha/mẹ, vợ/chồng hoặc con.

Lý do:

- Không tạo edge React Flow giả che lỗi.
- Giữ permission, validation, cycle check và revision ở service layer.
- Phase 6 chưa tạo người mới từ cây; chỉ nối người đã tồn tại bằng UUID.

## Decision 016 - Chọn `@xyflow/react` cho Tree Viewer

Chọn:

Phase 5 dùng `@xyflow/react` thay vì package `reactflow` cũ.

Lý do:

- `@xyflow/react` là package hiện đại của React Flow.
- Phù hợp yêu cầu viewer có zoom, pan, fit view, custom node và toolbar.
- Không cần thêm package UI nặng ngoài scope.

## Decision 017 - ELK layout chạy trong client viewer ở Phase 5

Chọn:

`lib/family/tree-layout-elk.ts` dùng `elkjs` để layout graph trong client viewer.

Lý do:

- Viewer cần reset layout/fit view tương tác mà không tạo persistence layout.
- Không đưa service role/admin helper vào client; client chỉ nhận graph đã lọc từ tree service.
- Nếu ELK lỗi, helper trả graph gốc để route không crash trắng.

## Decision 018 - Tree viewer dùng family node trung gian

Chọn:

Graph builder tạo node `family` trung gian để nối cha/mẹ với con, bên cạnh node `person`.

Lý do:

- Gia phả thật có thể có nhiều cha/mẹ và nhiều con trong một family.
- Tránh render quá nhiều edge person-to-person gây rối khi có tái hôn, con nuôi hoặc con riêng.
- Giữ dữ liệu quan hệ thật tách khỏi dữ liệu layout UI.

## Decision 013 - Relationship CRUD dùng bảng quan hệ riêng

Chọn:

Phase 4 tạo `families`, `family_parents`, `family_children`, `couple_relationships` thay vì thêm `father_id`, `mother_id`, `spouse_id` vào `people`.

Lý do:

- Giữ đúng mô hình gia phả thật có nhiều cha/mẹ nuôi, con riêng, tái hôn và nhiều quan hệ đôi.
- Không trộn hồ sơ cá nhân với cấu trúc quan hệ.
- Chuẩn bị tốt hơn cho tree viewer/layout ở phase sau.

## Decision 014 - Relationship dùng soft delete và revision chung

Chọn:

Relationship records dùng `deleted_at`, `deleted_by`, `delete_reason` và ghi revision before/after JSON qua helper `logRevision()`.

Lý do:

- Phù hợp quyết định không xóa cứng dữ liệu gia phả.
- Cho phép truy vết ai đã thêm/xóa family edge hoặc couple relationship.
- Tách revision helper khỏi people service để dùng chung lâu dài.

## Decision 015 - Cycle check cha-con ở service layer Phase 4

Chọn:

Phase 4 kiểm vòng lặp tổ tiên trong `relationship-service` trước khi thêm parent/child edge.

Lý do:

- Chặn lỗi dữ liệu cơ bản trước khi có graph/tree UI phức tạp.
- Không cần thêm package ngoài scope Phase 4.
- Có thể nâng cấp sang constraint hoặc graph validation sâu hơn ở phase cây.

## Decision 010 - People CRUD dùng soft delete bắt buộc

Chọn:

Bảng `people` không xóa cứng. Xóa thành viên chỉ cập nhật `deleted_at`, `deleted_by`, `delete_reason`.

Lý do:

- Gia phả dễ bị sửa/xóa nhầm và cần khả năng khôi phục.
- Phù hợp nguyên tắc dữ liệu sống lâu dài.
- Cho phép ghi revision delete/restore rõ ràng.

## Decision 011 - Revision people ghi before/after JSON tối thiểu

Chọn:

Tạo `revisions` và `revision_items` foundation trong Phase 3, service people ghi `before_json` và `after_json` ở mức entity.

Lý do:

- Đủ để truy vết create/update/delete/restore ở Phase 3.
- Chưa cần diff từng field hoàn chỉnh trước khi có workflow review/restore nâng cao.
- Không bỏ qua thiết kế revision history đã chốt từ đầu.

## Decision 012 - Chưa tạo relationship tables trong People CRUD

Chọn:

Phase 3 chỉ tạo `people`, không tạo `families`, `family_parents`, `family_children` hoặc `couple_relationships`.

Lý do:

- Giữ đúng scope People CRUD.
- Tránh trộn hồ sơ cá nhân với quan hệ gia phả thật.
- Relationship CRUD sẽ có phase riêng để xử lý cha/mẹ/con/vợ/chồng đúng mô hình.

## Decision 007 - Dùng magic link cho auth foundation

Chọn:

Supabase magic link theo email cho Phase 2.

Lý do:

- Không cần hardcode tài khoản hoặc mật khẩu.
- Phù hợp foundation khi chưa có signup/admin onboarding UI hoàn chỉnh.
- Callback `/auth/callback` có thể bootstrap profile và kiểm tra quyền server-side.
- Nếu thiếu env Supabase, login page hiển thị trạng thái thiếu cấu hình thay vì crash trắng.

## Decision 008 - Không tự động cấp OWNER

Chọn:

Không auto OWNER cho user đầu tiên. OWNER được gán thủ công bằng SQL/admin context sau khi xác minh danh tính.

Lý do:

- Tránh tự cấp quyền cao chỉ vì thứ tự đăng nhập.
- Phù hợp nguyên tắc không mở quyền rộng trong phase foundation.
- Có SQL snippet `db/snippets/assign-owner-role.sql` để vận hành thủ công khi cần.

## Decision 009 - Quyền tối thiểu vào `/admin` là `people.view`

Chọn:

Route `/admin` yêu cầu permission `people.view`.

Lý do:

- Admin foundation là cổng vào các module vận hành gia phả, không phải trang settings hệ thống thuần túy.
- `people.view` đủ hẹp để chặn user chưa có role, nhưng không yêu cầu quyền quản trị cao như `settings.manage`.
- Các hành động nhạy cảm hơn sẽ cần permission riêng ở phase sau.

## Decision 005 - Dùng cấu trúc App Router ở root `app/`

Chọn:

Giữ Next.js App Router tại root `app/`, không dùng `src/`.

Lý do:

- Khớp trực tiếp với prompt Phase 1 và cấu trúc thư mục đã yêu cầu.
- Dễ đọc cho AI trong các phase tiếp theo.
- Giảm một lớp đường dẫn khi tra route public/admin/auth.

## Decision 006 - Dùng `@supabase/ssr` cho helper client/server

Chọn:

Sử dụng `@supabase/ssr` cùng `@supabase/supabase-js`.

Lý do:

- Phù hợp App Router và cookie-based auth ở server.
- Tách rõ client anon key, server client và admin service role.
- Giữ `SUPABASE_SERVICE_ROLE_KEY` trong helper server-only, không đưa ra client.

## Decision 001 - Chọn stack chính thức

Chọn:

Next.js + Supabase + Cloudflare + React Flow + ELK.js.

Lý do:

- Next.js phù hợp web nhiều trang public/admin.
- Supabase phù hợp Auth/Postgres/Storage.
- Cloudflare phù hợp deploy chi phí thấp.
- React Flow phù hợp cây tương tác/chỉnh sửa trên UI.
- ELK.js phù hợp auto layout sơ đồ/cây phức tạp.

## Decision 002 - Export JSON/GEDCOM/ZIP bắt buộc từ đầu

Lý do:

- Mục tiêu dữ liệu sống lâu dài.
- Không khóa dữ liệu trong Supabase.
- Có thể chuyển hệ thống sau này.
- Có thể phục hồi khi cloud/database gặp vấn đề.

## Decision 003 - Không dùng parent_id/spouse_id đơn giản trong people

Lý do:

- Gia phả thật có nhiều vợ/chồng, con riêng, con nuôi, tái hôn.
- Cần nguồn xác minh và revision history.
- Cần tách quan hệ khỏi hồ sơ cá nhân.

## Decision 004 - Không xóa cứng dữ liệu gia phả

Lý do:

- Gia phả dễ bị sửa/xóa nhầm.
- Cần khôi phục.
- Cần lưu lịch sử thay đổi.
