# Production Stabilization

## Status

PRODUCTION_DEPLOY_PASS

Phase 16 ổn định production sau deploy đầu tiên. Phase này không mở tính năng lớn mới, không sửa schema, không chạy migration, không sửa dữ liệu thật, không import confirm và không revision restore.

## Production Baseline

- Production URL: https://web-gia-pha.hungdiepcompany.workers.dev/
- Worker name: `web-gia-pha`
- Deploy workflow: `.github/workflows/cloudflare-deploy.yml`
- Deploy path: GitHub Actions Cloudflare Deploy
- Deploy status: PASS
- `NEXT_PUBLIC_APP_URL`: configured to production URL

## Supabase Auth Checklist

- Site URL points to `https://web-gia-pha.hungdiepcompany.workers.dev/`.
- Redirect URLs include `https://web-gia-pha.hungdiepcompany.workers.dev/auth/callback`.
- Local redirect URLs can stay for local development if still needed:
  - `http://localhost:3000/auth/callback`
  - `http://127.0.0.1:3000/auth/callback`
- Auth callback must not print secret values.
- `/admin/system/status` must show only yes/no config state.

## Google OAuth Checklist

- Authorized JavaScript origin includes `https://web-gia-pha.hungdiepcompany.workers.dev`.
- Authorized redirect URI is the Supabase callback:
  - `https://<supabase-project-ref>.supabase.co/auth/v1/callback`
- Google redirect URI is not the app `/auth/callback`.
- App `/auth/callback` belongs in Supabase Redirect URLs.
- `deleted_client` issue was fixed and Google OAuth login passed by manual production test.

## Route Smoke Checklist

Required production smoke routes:

- `/`
- `/tree`
- `/auth/login`
- `/admin`
- `/admin/system/status`

Expected:

- `/` renders without crash.
- `/tree` renders without crash.
- `/auth/login` shows login.
- `/admin` before login redirects to login or returns unauthorized; both are acceptable.
- `/admin` after OWNER/admin login is accessible.
- `/admin/system/status` does not expose secret, token or key values.
- Google OAuth returns to `/auth/callback`.

## Auth/Login Checklist

- Magic link UI renders.
- Google OAuth button starts the OAuth flow.
- Google OAuth returns to `/auth/callback`.
- After login, OWNER/admin can reach `/admin`.
- Auth callback failure should not expose secret values.
- Login smoke should not create or alter test data beyond normal auth session state.

## Public/Private Privacy Checklist

- Public mode must not expose living people if policy requires them hidden.
- Public mode must not expose `notes_private`.
- Public routes must use public-safe DTO/service output.
- Protected/admin data is visible only after auth and matching permission.
- `/tree` public graph must not contain admin-only fields.
- `/people/[slug]` public profile must not contain private notes or full private fields.
- Phase 16 does not change privacy logic; it only records checklist and structural checks.

## Export Backup Production Checklist

Manual safe test from production:

1. Login as OWNER/admin with export permission.
2. Open `/admin/exports`.
3. Download `family.json`.
4. Download `full-backup.zip`.
5. Confirm each file is created, non-empty and no 5xx occurs.
6. Do not commit backup contents.
7. Do not paste sensitive backup content into docs/issues.
8. Do not import the backup back into production.
9. Do not run restore or revision restore.

Optional non-mutating smoke can be run with:

```bash
PROD_SMOKE_BASE_URL=https://web-gia-pha.hungdiepcompany.workers.dev npm.cmd run check:production-stabilization
```

The optional smoke does not login automatically, does not mutate data and accepts protected route redirects/401/403 as safe outcomes.

## Logs/Observability Checklist

GitHub Actions:

- Open GitHub repository.
- Go to Actions.
- Review `Cloudflare Deploy` workflow logs.
- Confirm deploy job passed and no secret values are printed.

Cloudflare:

- Open Cloudflare dashboard.
- Open Workers & Pages.
- Select Worker `web-gia-pha`.
- Review deployments.
- Review Worker logs/observability.

Errors to watch:

- 5xx responses
- auth callback error
- missing env
- Supabase permission/RLS error
- export backup error
- unexpected redirects after login
- public route exposing private data

Do not add logging that prints secret, token or key values.

## Known Non-Blocking Warnings

- Node.js 20 actions deprecation warning if still present in GitHub Actions logs.
- OpenNext/minified warning `Comparison with -0` if still present in deploy logs.
- Known audit advisories in Next/OpenNext/Wrangler/PostCSS/esbuild/ws toolchain; no `npm audit fix --force`.

## Blocking Conditions

Treat these as blocking:

- deploy fail
- app 5xx
- login redirect wrong
- protected route exposes data without auth/permission
- public route exposes living people when policy requires hiding them
- public route exposes `notes_private`
- export backup fails
- export backup file is empty
- `/admin/system/status` exposes secret, token or key values

## Procedure After Each Deploy

1. Run workflow manually.
2. Capture version/URL.
3. Test route smoke checklist.
4. Test Auth/OAuth.
5. Test export backup safely.
6. Check logs/observability.
7. Record handoff.

## Current Production Smoke Result

- Basic route smoke: PASS by manual user test.
- Google OAuth production login: PASS by manual user test.
- Export/import/revision surfaces: basic smoke PASS by manual user test.
- Import confirm: disabled.
- Revision restore: disabled.
