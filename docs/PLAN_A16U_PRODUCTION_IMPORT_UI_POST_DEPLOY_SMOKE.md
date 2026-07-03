# A-16U - Production Import UI Post Deploy Smoke

Status: `PRODUCTION_IMPORT_UI_POST_DEPLOY_SMOKE_STATUS=PASS_OWNER_UI_VISIBLE`

Marker: `A16U_PRODUCTION_IMPORT_UI_POST_DEPLOY_SMOKE`

## Muc Tieu

Ghi nhan sau deploy production, owner da thay UI nhap Excel/Gia Pha 4 tren
trang admin import. Phase nay chi xac nhan UI/readiness sau deploy, khong chay
official import that.

## Owner Production Evidence

- Owner evidence: owner da thay phan nhap Excel tren web production.
- Production admin import route dung:
  `/admin/exports/import`.
- Homepage `/` khong phai noi hien thi form nhap Excel.
- Evidence type:
  `OWNER_VISUAL_EVIDENCE`.
- Automated HTTP smoke:
  `NOT_CLAIMED`.
- Note: phase truoc da gap local TLS/Schannel khi dung PowerShell/curl, nen neu
  moi truong local van khong HTTP smoke duoc thi dung owner visual evidence va
  khong claim automated HTTP PASS.

## Source Evidence

- Page route ton tai:
  `app/(admin)/admin/exports/import/page.tsx`.
- Page route import upload component:
  `GiaPha4ManifestUploadForm`.
- Upload component ton tai:
  `components/imports/giapha4-manifest-upload-form.tsx`.
- Upload route ton tai:
  `app/api/admin/import-sessions/upload/route.ts`.
- Upload endpoint:
  `POST /api/admin/import-sessions/upload`.
- Upload Gia Pha 4/Excel la staging-only:
  `UPLOAD_SCOPE=STAGING_ONLY`.
- Upload form chi goi staging upload endpoint, khong goi `/official-import`.

## Official Import Lock

- A-16U locked branch status:
  `A16U_STATUS=A16U_LOCKED_TRANSACTION_BRANCH_READY_NOT_EXECUTED`.
- Runtime import flag:
  `canRunOfficialImport=false`.
- Official import button:
  `officialImportButtonDisabled=true`.
- UI official import section:
  `DISABLED`.
- RPC call:
  `NO`.
- POST `/official-import`:
  `NO`.
- Real genealogy write:
  `NO`.

## Boundaries

- Khong chay SQL.
- Khong DB push.
- Khong migration repair.
- Khong seed.
- Khong goi RPC.
- Khong POST `/official-import`.
- Khong ghi people/relationships/families/layout/tree/revision/profile that.
- Khong chay official import.
- Khong deploy them trong phase nay.
- Khong push.
- Khong commit Excel/secret/env/storage state.
- Khong stage/commit dirty ngoai scope nhu `CHECK_CLOUDFLARE_ACCOUNT.bat`,
  `GUARD.bat` hoac `GIA_PHA_GITHUB_MENU.bat`.

## Ket Luan

`PRODUCTION_IMPORT_UI_POST_DEPLOY_SMOKE_STATUS=PASS_OWNER_UI_VISIBLE`

Production UI nhap Excel/Gia Pha 4 da duoc owner thay o route
`/admin/exports/import`. Source upload form va upload route van dung staging-only.
Official import van khoa, khong co RPC/POST official import/import that trong
phase nay.
