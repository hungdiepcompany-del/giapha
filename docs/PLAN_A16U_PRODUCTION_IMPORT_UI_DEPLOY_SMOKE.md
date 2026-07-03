# A-16U - Production Import UI Deploy Smoke

Status: `PRODUCTION_IMPORT_UI_STATUS=BLOCKED_NOT_DEPLOYED_AFTER_PUSH`

Marker: `A-16U-PRODUCTION-IMPORT-UI-DEPLOY-SMOKE`

## Muc Tieu

Kiem tra read-only sau khi owner push GitHub de phan biet:

- code moi da co trong repo/GitHub;
- production da deploy code moi hay chua;
- UI nhap Excel Gia Pha 4 co ton tai trong source o route admin import;
- official import van khoa.

Phase nay khong deploy, khong push, khong goi SQL, khong DB push, khong migration
repair, khong seed, khong RPC, khong POST `/official-import`, khong official
import va khong ghi du lieu gia pha that.

## Ket Qua Git/Local

- Local HEAD hien tai co commit moi hon A-16U:
  `1215bb6 yyyyy`.
- Commit A-16U da co trong history:
  `8c39f685731fa558155fa710ed495a9491c815e2`.
- `git status -sb` tai luc preflight:
  - `## main...origin/main`
  - `D GIA_PHA_GITHUB_MENU.bat`
- Ket luan local/remote tracking: local branch khong con ahead/behind so voi
  `origin/main` tai thoi diem kiem tra.
- Dirty file `GIA_PHA_GITHUB_MENU.bat` la ngoai scope cua phase nay va khong
  duoc sua/stage/commit trong phase nay.
- Khong stage/commit `CHECK_CLOUDFLARE_ACCOUNT.bat` hoac `GUARD.bat`.

## Deploy Readiness

- Production URL da ghi trong docs van la:
  `https://web-gia-pha.hungdiepcompany.workers.dev/`.
- Cloudflare deploy workflow:
  `.github/workflows/cloudflare-deploy.yml`.
- Trigger workflow hien tai:
  `workflow_dispatch` only.
- Workflow co lenh deploy:
  `npm run deploy`.
- Khong co auto deploy on push trong Cloudflare deploy workflow.

Vì vậy GitHub push khong dong nghia production deploy. Trong prompt nay owner chi
bao da push sau commit A-16U, chua cung cap evidence da chay manual GitHub
Actions Cloudflare Deploy sau push. Do do status production import UI la:

`PRODUCTION_IMPORT_UI_STATUS=BLOCKED_NOT_DEPLOYED_AFTER_PUSH`

Read-only HTTP smoke tu local den production khong ket luan duoc vi PowerShell
`Invoke-WebRequest` gap loi receive va `curl.exe -I` gap loi Schannel cuc bo:
`SEC_E_NO_CREDENTIALS`. Phase nay khong coi production route la PASS.

## Route Dung Can Mo

- Trang dung de xem UI nhap Excel Gia Pha 4 trong admin:
  `/admin/exports/import`.
- Public homepage `/` khong hien form nhap Excel.
- Neu chua dang nhap, UI co the hien:
  `Bạn cần đăng nhập để kiểm tra nhập dữ liệu.`
- Neu da dang nhap nhung thieu quyen, UI co the hien:
  `Bạn chưa có quyền imports.create.`
- Khong bypass auth, khong doc cookie, khong doc localStorage, khong luu token
  hoac storage state.

## Source UI Evidence

Source hien co van co UI upload/staging Gia Pha 4:

- Page route:
  `app/(admin)/admin/exports/import/page.tsx`
- Upload component:
  `components/imports/giapha4-manifest-upload-form.tsx`
- Upload route:
  `app/api/admin/import-sessions/upload/route.ts`
- Upload endpoint:
  `POST /api/admin/import-sessions/upload`

Source markers:

- Page admin import import `GiaPha4ManifestUploadForm`.
- Upload component co input file accept `.xlsx,.xls`.
- Upload component chi fetch `/api/admin/import-sessions/upload`.
- Copy staging: `Chỉ ghi vào vùng staging, chưa nhập vào cây gia phả thật.`
- Button official import trong upload component disabled:
  `Xác nhận nhập chính thức — chưa mở`.
- Panel manifest van co cong official import disabled voi `aria-disabled="true"`.

## Official Import Lock

- `A16U_STATUS=A16U_LOCKED_TRANSACTION_BRANCH_READY_NOT_EXECUTED`.
- `canRunOfficialImport=false`.
- `officialImportButtonDisabled=true`.
- Official import section van disabled.
- Official import route khong duoc goi trong phase nay.
- RPC `public.a16p_tx_execute_giapha4_official_import` khong duoc goi.
- Khong POST `/official-import`.
- Khong ghi people/relationships/families/layout/tree/revision/profile that.

## Ly Do Kha Di Khi Owner Khong Thay UI Tren Web

1. Dang mo public homepage `/`, route nay khong hien form nhap Excel.
2. Chua vao dung route `/admin/exports/import`.
3. Chua dang nhap hoac thieu quyen `imports.create`, nen admin import page hien
   blocker auth/permission thay vi form.
4. GitHub push chua chay manual Cloudflare Deploy, vi deploy workflow la
   `workflow_dispatch` only.
5. Production dang chay worker version cu hon code moi vi chua co deploy sau
   push.

## Ket Luan

`A16U_PRODUCTION_IMPORT_UI_DEPLOY_SMOKE_RESULT=BLOCKED`

`A16U_PRODUCTION_IMPORT_UI_DEPLOY_SMOKE_BLOCKER=BLOCKED_NOT_DEPLOYED_AFTER_PUSH`

Source upload UI PASS, production deploy verification BLOCKED cho den khi owner
chay manual GitHub Actions Cloudflare Deploy hoac cung cap deploy run evidence.
