# Decision Log

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
