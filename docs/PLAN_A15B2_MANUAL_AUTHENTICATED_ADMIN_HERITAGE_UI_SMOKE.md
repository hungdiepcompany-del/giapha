# A-15B2 - Manual Authenticated Admin Heritage UI Smoke

Status: `MANUAL_AUTH_SMOKE_RECORDED_LOCAL`

Marker: `A15B2_MANUAL_AUTHENTICATED_ADMIN_HERITAGE_UI_SMOKE`

## Muc Tieu

A-15B2 ghi nhan xac nhan thu cong cua owner rang auth runtime local dang hoat dong
binh thuong: dang nhap browser that vao duoc, `/admin` vao duoc va Supabase callback
URL da duoc cau hinh day du.

Phase nay dong huong A-15C3 auth fix vi loi A-15B1/A-15C2 la smoke browser context
khong dung session/cookie da dang nhap, khong phai loi auth runtime.

## Pham Vi Documentation/Checker-Only

Duoc lam:

- tao phase doc A-15B2;
- them checker static A-15B2;
- them package script checker;
- cap nhat index, work log, decision log va handoff;
- cap nhat allowlist checker gan nhat de nhan artifact A-15B2.

Khong lam:

- no UI change;
- no auth runtime change;
- no mutation;
- no seed;
- no role assignment;
- no env commit;
- no database, migration, seed, RLS, role, permission, API contract hoac service runtime change;
- no dependency;
- no form submit;
- no cookie, token, storage-state, screenshot hoac secret artifact.

## A-15C Permission Readiness PASS

A-15C da xac nhan owner/admin readiness bang SELECT/read-only:

```text
ENV_SUPABASE_URL_PRESENT=true
ENV_SUPABASE_ANON_PRESENT=true
ENV_SERVICE_ROLE_PRESENT=true
ADMIN_CLIENT_READY=true
AUTH_USER_FOUND=true
PROFILE_FOUND=true
ROLE_COUNT=1
PERMISSION_COUNT=25
REQUIRED_ADMIN_PERMISSION_MISSING_COUNT=0
READINESS_STATUS=PASS
READINESS_REASON=OWNER_ADMIN_PERMISSION_READY_READ_ONLY
```

Ket luan: A15D_PERMISSION_SEED_NEEDED=false.

## A-15C2 Static Auth Diagnostics

A-15C2 da xac nhan code flow tinh co du:

- `/auth/login` ton tai;
- `/auth/callback` ton tai;
- callback co `exchangeCodeForSession`;
- login redirect ve `/auth/callback`;
- server client dung cookie-backed `createServerClient`;
- `/admin` dung server-side `requirePermission("people.view")`;
- `middleware.ts` khong ton tai.

A-15C2 HTTP read-only van thay `/admin` redirect voi `auth_session_missing` trong
smoke context khong co session bound.

## Owner Manual Confirmation

Owner da xac nhan thu cong:

```text
Manual owner/admin login: PASS_OWNER_CONFIRMED
Supabase callback URL config: PASS_OWNER_CONFIRMED
/admin real browser session: PASS_OWNER_CONFIRMED
```

Owner confirmation nay khong chia se credential, cookie value, token, screenshot
hoac storage artifact. A-15B2 chi ghi nhan ket qua manual do owner cung cap.

## Ket Luan

```text
AUTH_RUNTIME_STATUS=PASS_OWNER_CONFIRMED
AUTOMATED_BROWSER_SMOKE_STATUS=NEEDS_PERSISTED_SESSION_CONTEXT
A15C3_AUTH_FIX_NEEDED=false
A15D_PERMISSION_SEED_NEEDED=false
```

A-15B1/A-15C2 `auth_session_missing` duoc phan loai la non-persisted smoke browser
context, khong phai loi auth runtime. Khong can sua callback/cookie code trong A-15C3
va khong can seed/gia quyen trong A-15D.

## Route Manual Confirmed

- `/admin`: `PASS_OWNER_CONFIRMED`.

## Routes Can Authenticated-Automate Later

Neu muon automation smoke authenticated that trong tuong lai, can phase rieng dung
persisted browser storage-state hoac manual session handoff an toan:

- `/admin/genealogy`;
- `/admin/tree/edit`;
- `/admin/people/new`;
- `/admin/relationships`;
- `/admin/people/[id]`.

Khong nen sua auth runtime chi de phuc vu automation smoke.

## Next Step Recommendation

- Khong mo A-15C3 Supabase Auth Session Binding Fix neu khong co bang chung loi
  callback/cookie/server client moi.
- Khong mo A-15D Owner/Admin Permission Seed vi A-15C da PASS.
- Neu can smoke admin tu dong authenticated, tao phase rieng cho persisted browser
  session handoff, voi rule khong commit cookie/token/storage-state.

## Runtime Worker Guardrail

- Main Worker touched: NO.
- Runtime dependency added: NO.
- New service Worker created: NO.
- OpenNext/Wrangler config changed: NO.
- Worker size risk: NO.
- Service boundary recommendation: NONE.

## Validation Plan

- `npm run check:env:safe`
- `npm run check:a15a2:modern-vietnamese-genealogy-tree-editor-ui`
- `npm run check:a15a3:vietnamese-heritage-public-tree-view-ui`
- `npm run check:a15a4:vietnamese-heritage-family-list-admin-dashboard-ui`
- `npm run check:a15a5:member-profile-person-detail-vietnamese-heritage-ui`
- `npm run check:a15a6:add-edit-member-form-vietnamese-heritage-ux`
- `npm run check:a15b:authenticated-heritage-ui-browser-smoke`
- `npm run check:a15c:owner-admin-session-permission-smoke-readiness`
- `npm run check:a15b1:authenticated-admin-heritage-ui-browser-smoke-rerun`
- `npm run check:a15c2:supabase-auth-browser-session-binding-diagnostics`
- `npm run check:a15b2:manual-authenticated-admin-heritage-ui-smoke`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`
