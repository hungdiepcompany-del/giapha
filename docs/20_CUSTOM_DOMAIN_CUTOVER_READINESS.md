# Custom Domain Cutover Readiness

## Status

CUSTOM_DOMAIN_CUTOVER_READINESS_BASELINE

Phase 20 prepares the checklist and guardrails for a future move from the current `workers.dev` production URL to a custom domain. This phase does not deploy, does not push, does not change DNS, does not configure a real Cloudflare custom domain or route, does not change Supabase/Auth/OAuth settings, does not mutate data, and does not call Cloudflare, Supabase, Google, or DNS APIs.

## Production Baseline

- Worker name: `web-gia-pha`
- Current production URL: https://web-gia-pha.hungdiepcompany.workers.dev/
- Deploy workflow: `.github/workflows/cloudflare-deploy.yml`
- Cloudflare config: `wrangler.toml`
- Phase 16 status: PASS
- Phase 17 status: PASS
- Phase 18 status: PASS_WITH_NOTES
- Phase 19 status: PASS_WITH_NOTES
- Google OAuth production login: PASS by manual user test
- Basic production route smoke: PASS by manual user test
- Automated production smoke with `PROD_SMOKE_BASE_URL`: previously PASS

Known local/environment notes:

- Direct `npm run build` in the workspace can fail when old `.next` artifacts are locked by Windows ACL/EPERM.
- Clean temp build has passed in prior phases and should be used to distinguish source errors from local generated artifact locks.
- `npm audit --audit-level=moderate` currently reports known advisory findings; do not run `npm audit fix --force` in this phase.
- `GIA_PHA_GITHUB_MENU.bat` is modified outside Phase 20 scope and must not be staged or committed by this phase.

## Candidate Custom Domain

```text
Current production URL:
https://web-gia-pha.hungdiepcompany.workers.dev/

Candidate custom domain:
<TO_BE_CONFIRMED>
```

No official custom domain is selected in this phase. Do not configure DNS, Cloudflare custom domain, Supabase Auth, or Google OAuth settings until the domain is confirmed by the user.

## Cutover Goal

Future cutover goals:

- Users can access the app through a stable custom domain.
- The current `workers.dev` URL can remain as fallback if intentionally kept.
- Google OAuth login and callback do not fail with redirect mismatch.
- Supabase Auth Site URL and Redirect URLs align with the canonical production URL.
- Sessions and cookies do not drift across unexpected domains.
- Backup manifests and smoke test URLs use the chosen canonical production URL.
- Rollback is ready if DNS, SSL, OAuth, Supabase Auth, or Worker routing fails.

## Cloudflare Readiness Checklist

Before a real cutover, confirm:

- The custom domain and Cloudflare zone are known.
- DNS ownership and zone management access are available.
- Required DNS record is identified.
- Worker route or custom domain binding points to Worker `web-gia-pha`.
- SSL/TLS is active and compatible with the zone.
- HTTPS is required.
- `www` versus non-`www` redirect policy is chosen.
- Cache/routing behavior is reviewed if Cloudflare caching rules exist.
- Existing `workers.dev` fallback is intentionally kept or intentionally retired later.
- `wrangler.toml` remains free of hardcoded secret/token/key values.

Phase 20 does not configure a real Cloudflare custom domain, route, DNS record, SSL/TLS setting, or deploy.

## Supabase Auth Readiness Checklist

Before a real cutover, confirm:

- Supabase Site URL will be changed to the confirmed custom domain when cutover executes.
- Supabase Redirect URLs include the custom domain callback, for example `https://<custom-domain>/auth/callback`.
- Supabase Redirect URLs keep the current workers.dev callback fallback until custom domain smoke passes.
- Login, logout, auth callback, and unauthorized route are tested after the change.
- Magic link redirect behavior is aligned with `NEXT_PUBLIC_APP_URL`.
- Google OAuth callback still returns through Supabase Auth correctly.
- Old URLs are not removed before the custom domain is verified.

Phase 20 does not change Supabase Dashboard settings.

## Google OAuth Readiness Checklist

Before a real cutover, confirm:

- Authorized JavaScript origins include the custom domain origin.
- Authorized redirect URIs remain aligned with the Supabase Auth callback flow.
- The Google OAuth authorized redirect URI for Supabase provider remains the Supabase callback URL unless Supabase documentation and dashboard configuration require otherwise.
- OAuth consent screen and publishing status are still valid for the production use case.
- Current workers.dev and Supabase fallback URLs are not removed too early.

Phase 20 does not change Google Cloud Console settings.

## App Configuration Readiness

Current app/deploy conventions:

- `NEXT_PUBLIC_APP_URL` exists in `.env.example` and GitHub Actions deploy variables.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are Supabase project settings, not the app custom domain.
- `PROD_SMOKE_BASE_URL` is an optional smoke-test base URL and should point to the canonical production URL for future cutover smoke.
- Google OAuth client login uses `window.location.origin` for `redirectTo`, so the browser origin after cutover matters.
- Magic link login uses `NEXT_PUBLIC_APP_URL` to build `/auth/callback`, so that env value must be updated for the canonical custom domain.
- Backup manifests should record the canonical production URL used during the backup or drill.

Hardcoded workers.dev note:

- The current workers.dev URL appears in docs and operational runbooks as the current production baseline.
- If future code contains hardcoded `workers.dev`, treat it as a gap and change it only in a dedicated, tested behavior phase.

## Smoke Test Plan

After a real cutover, smoke test:

- Open custom domain `/`.
- Login with Google OAuth.
- Confirm OAuth callback succeeds.
- Logout succeeds.
- Public/private route behavior remains correct.
- Unauthorized route behavior remains correct.
- Admin route guard remains correct.
- Export/backup UI works if permissions allow it.
- No unexpected 404/500 responses appear.
- Cloudflare Worker logs do not show route or runtime errors.
- Supabase Auth logs do not show redirect mismatch.
- `workers.dev` fallback still works if intentionally kept.
- `PROD_SMOKE_BASE_URL` is updated to the canonical custom domain for automated smoke.

## Rollback Plan

Rollback guidance:

- If DNS or SSL fails, return users to `https://web-gia-pha.hungdiepcompany.workers.dev/`.
- If OAuth fails, restore the previous Google OAuth origin/redirect configuration.
- If Supabase Auth fails, restore the previous Site URL and Redirect URLs.
- If Worker route or custom domain binding fails, disable the custom domain route/binding and keep the previous Worker deployment active.
- Do not run migrations or edit database records to fix a domain cutover issue.
- Record cutover time, before/after configuration, operator, smoke result, and rollback owner.

## Pre-Cutover Approval Checklist

Before a real cutover, get explicit confirmation for:

- Official custom domain.
- DNS/Cloudflare zone access.
- Supabase project settings access.
- Google Cloud Console OAuth settings access.
- Recent backup or backup drill PASS/PASS_WITH_NOTES accepted by the owner.
- Test window and rollback window.
- Rollback owner.
- Smoke checklist owner.
- User who will confirm Google login after cutover.
- Whether `workers.dev` fallback should remain active.

## Domain Cutover Risk Matrix

| Risk | Symptoms | First checks | Safe response | Rollback if needed |
| --- | --- | --- | --- | --- |
| DNS not propagated | Custom domain does not resolve or points elsewhere | DNS record, Cloudflare zone, resolver cache | Wait for propagation or correct DNS record | Use workers.dev fallback |
| SSL not active | Browser SSL warning or HTTPS failure | Cloudflare SSL/TLS status, certificate status | Wait/fix certificate or TLS mode | Disable custom domain route temporarily |
| OAuth redirect mismatch | Google login fails or callback returns error | Google OAuth origins, Supabase provider settings, callback URL | Add correct origin/redirect and retest | Restore previous OAuth config |
| Supabase Site URL wrong | Magic link or session redirects to wrong host | Supabase Site URL and Redirect URLs | Correct Site URL and callback entries | Restore previous Supabase Auth settings |
| Cookie/session domain drift | Login appears successful but admin redirects loop | Browser origin, callback origin, cookies, app URL env | Align canonical URL and retest auth | Return traffic to workers.dev |
| Hardcoded workers.dev | Custom domain redirects or links back to workers.dev unexpectedly | Search code/docs/env for workers.dev | Document gap or fix in scoped behavior change | Keep workers.dev as canonical until fixed |
| Production smoke URL stale | Automated smoke tests old URL only | `PROD_SMOKE_BASE_URL`, workflow/env docs | Update smoke env after custom domain passes | Continue smoke on workers.dev fallback |
| Backup manifest URL stale | Backup metadata records wrong canonical URL | Manifest template and operator process | Use canonical custom domain in future manifest | Mark old manifest as pre-cutover baseline |
| Rollback owner unclear | Incident response stalls | Cutover notes and owner assignment | Stop cutover until owner is named | Revert to previous stable URL/config |

## Phase 20 Gaps

- Official custom domain is not confirmed.
- Real DNS is not configured.
- Real Cloudflare custom domain or route is not configured.
- Real Supabase Auth settings are not changed.
- Real Google OAuth settings are not changed.
- Real custom domain smoke has not run.
- `PROD_SMOKE_BASE_URL` has not been changed to a custom domain.
- Cutover execution still needs an approved future phase.

## Phase 20 Boundary

- Do not deploy in Phase 20.
- Do not push.
- Do not change schema.
- Do not create or run migrations.
- Do not mutate real data.
- Do not create real production backup files.
- Do not restore production.
- Do not enable real import confirm.
- Do not enable real revision restore.
- Do not change the real domain.
- Do not change real DNS.
- Do not change a real Cloudflare custom domain or route.
- Do not change Supabase/Auth/OAuth production config.
- Do not call Cloudflare, Supabase, Google, or DNS APIs to mutate config.
- Do not hardcode secret/token/key values.
- Do not commit `.env.local` or `.dev.vars`.
- Do not commit backup/export real data.
- Do not commit `GIA_PHA_GITHUB_MENU.bat` if it is only the existing out-of-scope working tree change.

## Next Phase

- Phase 21 - Custom Domain Cutover Execution, if the official domain is confirmed and Cloudflare/Supabase/Google access is available.
- Phase 21 - Automated Backup Job Design, if domain cutover should wait.
- Focused production bugfix phase, if monitoring or smoke tests reveal a real issue.
