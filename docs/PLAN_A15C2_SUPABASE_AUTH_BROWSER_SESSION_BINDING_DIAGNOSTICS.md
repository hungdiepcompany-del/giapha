# A-15C2 - Supabase Auth Browser Session Binding Diagnostics

Status: `DIAGNOSTIC_RECORDED_LOCAL`

Marker: `A15C2_SUPABASE_AUTH_BROWSER_SESSION_BINDING_DIAGNOSTICS`

## Muc Tieu Diagnostics

A-15C2 chan doan vi sao browser local chua duoc app nhan la phien dang nhap
owner/admin, du A-15C da xac nhan du lieu auth/profile/role/permission san sang.

Phase nay chi ghi nhan bang chung doc-only va HTTP read-only. Neu can sua auth
callback, cookie hoac dashboard config, viec sua se nam o phase sau.

## Pham Vi Read-Only

Duoc lam:

- doc auth flow hien tai;
- kiem tra tinh route login/callback/logout, server Supabase client va guard;
- chay smoke script doc-only de in co boolean/status code/reason code;
- ghi checklist Supabase Dashboard cho owner tu xac nhan.

Khong lam:

- Khong polish UI;
- Khong mutate du lieu;
- Khong seed;
- Khong gan role;
- Khong sua database, migration, seed, RLS, auth, permission, API contract hoac service runtime;
- Khong tao/sua/xoa profile, role, permission hoac du lieu gia pha;
- Khong commit `.env.local`;
- Khong in secret, token, cookie value, email rieng tu hoac id rieng tu;
- Khong them dependency;
- Khong luu browser storage state, cookie artifact, screenshot hoac asset ngoai.

## Ket Qua Nen

A-15C readiness PASS:

```text
READINESS_STATUS=PASS
READINESS_REASON=OWNER_ADMIN_PERMISSION_READY_READ_ONLY
ROLE_COUNT=1
PERMISSION_COUNT=25
REQUIRED_ADMIN_PERMISSION_MISSING_COUNT=0
```

A-15B1 browser session FAIL:

```text
Browser session result: FAIL_AUTH_SESSION_NOT_BOUND
/admin redirects to /auth/login?reason=auth_session_missing
Admin shell shows unknown user, no role and 0 permissions.
```

Ket luan nen: DB permission readiness da san sang; blocker la browser/session
binding, khong phai seed/gia quyen.

## Auth Flow Hien Tai

Login route:

- `app/auth/login/page.tsx` ton tai va render `/auth/login`.
- Login page truyen `NEXT_PUBLIC_APP_URL` fallback `http://localhost:3000` vao `LoginForm`.
- `components/auth/login-form.tsx` dung client Supabase browser client.
- Magic link dung `emailRedirectTo: ${appUrl}/auth/callback`.
- Google OAuth dung `redirectTo: ${window.location.origin}/auth/callback`.

Callback route:

- `app/auth/callback/route.ts` ton tai.
- Route doc `error_code`, `error` va `code` tu query string.
- Khi thieu `code`, route redirect ve `/auth/login?reason=missing_auth_code`.
- Khi thieu Supabase public config, route redirect ve `/auth/login?reason=missing_supabase_config`.
- Route goi `supabase.auth.exchangeCodeForSession(code)`.
- Sau exchange, route goi `ensureCurrentUserProfile(supabase)`.
- Neu profile bootstrap thanh cong va `people.view` co trong permission context, route redirect ve `/admin`.
- Neu khong du quyen, route redirect ve `/unauthorized`.

Logout route:

- `app/auth/logout/route.ts` ton tai.
- Route tao server Supabase client neu co config, goi `supabase.auth.signOut()` va redirect ve `/auth/login`.

## Cookie / Session Observations

- `lib/supabase/server.ts` dung `createServerClient` tu `@supabase/ssr`.
- Server client doc cookie bang `cookies().getAll()`.
- Server client set cookie bang `cookies().set(...)` trong route handler/action khi duoc Next.js cho phep.
- A-15C2 khong tu dong login Google/magic link va khong submit OAuth form, nen chua the xac nhan cookie Supabase co duoc set sau real callback hay khong.
- HTTP read-only khi chua co session hop le du kien thay `/admin` redirect ve login voi `auth_session_missing`.
- Cookie sau callback can owner kiem tra thu cong trong browser DevTools; chi ghi co/khong, domain/path/expires, khong ghi value.

## Server Client Va Guard Observations

Server client:

- `SERVER_COOKIE_CLIENT_PRESENT=true`.
- Server auth user duoc doc qua `getCurrentAuthUser()` trong `lib/auth/profile-service.ts`.
- Neu Supabase config thieu, reason la `missing_supabase_config`.
- Neu `supabase.auth.getUser()` khong tra user, `getPermissionContext()` tra user null va reason tu Supabase error.

Route guard:

- `middleware.ts` khong ton tai.
- `/admin` dung server-side `requirePermission("people.view")`.
- Khi khong co `context.user`, `requirePermission()` redirect ve `/auth/login?reason=<reason>`.
- A-15B1 ghi nhan reason `auth_session_missing`, nghia la server guard khong doc duoc user tu browser cookie hien tai.

## Supabase Redirect URL Checklist

Owner can xac nhan thu cong trong Supabase Dashboard:

- Authentication -> URL Configuration.
- Site URL co `http://localhost:3000` khi smoke local bang port 3000.
- Redirect URLs co `http://localhost:3000/auth/callback`.
- Neu smoke bang port khac, them dung origin va callback cua port do.
- Co the them `http://localhost:3000/**` neu chinh sach project cho phep.
- Google OAuth provider da bat va duoc phep redirect ve callback tren.

Neu Dashboard thieu redirect URL dung voi code callback hien tai, phan loai:
`SUPABASE_REDIRECT_URL_MISMATCH`.

## Diagnostic Conclusion

Static diagnostic flags:

```text
LOGIN_ROUTE_PRESENT=true
CALLBACK_ROUTE_PRESENT=true
LOGOUT_ROUTE_PRESENT=true
EXCHANGE_CODE_FOR_SESSION_PRESENT=true
LOGIN_REDIRECT_TO_CALLBACK_PRESENT=true
SERVER_COOKIE_CLIENT_PRESENT=true
GET_CURRENT_AUTH_USER_PRESENT=true
AUTH_SESSION_MISSING_REASON_PRESENT=true
MIDDLEWARE_AUTH_GUARD_PRESENT=false
```

DIAGNOSTIC_STATUS: `PARTIAL`

DIAGNOSTIC_REASON: `AUTH_FLOW_STATIC_PRESENT_BROWSER_SESSION_NOT_BOUND`

Ly do: code login/callback/server-cookie path co mat day du o muc tinh, local HTTP
read-only thay `/auth/login` va `/tree` tra 200, trong khi `/admin` tra 307 ve login
voi `auth_session_missing`. A-15C2 khong thuc hien owner/admin login that va khong
duoc doc cookie value, nen van can trace thu cong sau OAuth/magic-link callback de
tach ro ba kha nang:

- `BROWSER_CONTEXT_NOT_LOGGED_IN`;
- `SUPABASE_REDIRECT_URL_MISMATCH`;
- `COOKIE_NOT_SET_AFTER_CALLBACK`;
- `COOKIE_SET_BUT_SERVER_NOT_READING`.

## De Xuat Tiep Theo

- Neu manual trace cho thay callback khong duoc Supabase cho phep: owner cap nhat
  Supabase URL Configuration, sau do rerun A-15B1/A-15C2 smoke; chua can code fix.
- Neu callback vao duoc nhung cookie khong set hoac server khong doc duoc cookie:
  mo A-15C3 - Supabase Auth Session Binding Fix, chi sua auth/callback/cookie trong
  pham vi duoc duyet.
- Neu browser context don gian la chua dang nhap: mo A-15B2 - Manual Authenticated
  Browser Smoke With Persisted Session va rerun matrix bang session owner/admin that.

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
- `npm run smoke:a15c2:supabase-auth-browser-session-binding-diagnostics`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`
