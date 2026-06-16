# Deploy Readiness

## Status

READY_FOR_FIRST_DEPLOY

This report prepares the project for first deploy only. Phase 14 did not deploy, push remote, create a Cloudflare project, write secrets, run migrations, change schema, change auth logic, enable import confirm, or enable revision restore.

## Current baseline

- Real Supabase smoke test: PASS
- Google OAuth local: PASS
- Build: PASS
- Typecheck: PASS
- Lint: PASS
- Deploy readiness check: PASS

## Target deploy platform

- Cloudflare
- First deploy has not been executed in Phase 14
- Phase 15A selected Cloudflare Workers via OpenNext for the Next.js SSR/server-route app
- `wrangler.toml` points to `.open-next/worker.js` and `.open-next/assets`
- `open-next.config.ts` uses the minimal Cloudflare config

## Required production environment variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`

## Secret policy

- Do not commit `.env.local`
- Do not print secrets in logs
- `SUPABASE_SERVICE_ROLE_KEY` is server-side only
- Never use `NEXT_PUBLIC_` for the service role key
- Configure production secrets in the deploy platform, not in repo files

## Supabase production Auth URLs

Update these after the production domain exists.

Site URL:

- `https://<production-domain>`

Redirect URLs:

- `https://<production-domain>/auth/callback`
- If preview deploys are used, add preview URLs only according to a deliberate preview policy

Local dev redirect URLs:

- `http://localhost:3000/auth/callback`
- `http://127.0.0.1:3000/auth/callback` if testing through `127.0.0.1`

## Google OAuth

Google Cloud OAuth Client:

- Authorized JavaScript origins:
  - `https://<production-domain>`
- Authorized redirect URI:
  - `https://<supabase-project-ref>.supabase.co/auth/v1/callback`

The app callback `/auth/callback` belongs in Supabase Redirect URLs, while Google Cloud points to the Supabase Auth callback.

## Database policy

- Do not rerun migrations 0001-0006 after real data exists unless reviewed
- New database changes must use a new migration file
- Download `family.json` before deploy if a release could affect data behavior
- Download `full-backup.zip` before high-risk deploys

## Pre-deploy checklist

- [ ] Repo sạch
- [ ] `npm.cmd run typecheck` PASS
- [ ] `npm.cmd run lint` PASS
- [ ] `npm.cmd run build` PASS
- [ ] `npm.cmd run check:deploy-readiness` PASS
- [ ] `npm.cmd run check:opennext-cloudflare` PASS
- [ ] Supabase production env configured
- [ ] Supabase redirect URL configured for production domain
- [ ] Google OAuth has production domain in authorized origins
- [ ] `family.json` backup downloaded
- [ ] `full-backup.zip` downloaded
- [ ] No secret in git diff

## First deploy steps

Checklist only; do not execute in Phase 14.

1. Confirm deploy target: Cloudflare Workers via OpenNext.
2. Configure production environment variables in Cloudflare.
3. Configure Supabase Site URL and Redirect URLs for the production domain.
4. Configure Google OAuth authorized origin and confirm Supabase callback URI.
5. Run all local checks again.
6. Create/download backup files before first production deploy.
7. Deploy through `npm.cmd run deploy`.
8. Smoke test `/`, `/auth/login`, `/auth/callback`, `/admin`, `/tree`, export, import preview, and revision routes.

## Rollback plan

- Keep stable baseline commit hash before deploy.
- Roll back Cloudflare deployment if smoke test fails.
- Use `family.json` or `full-backup.zip` as data recovery evidence if needed.
- Do not restore database data automatically without a reviewed restore plan.

## Known limitations

- Import confirm is not implemented
- Revision restore is not implemented
- Media backup has no real media coverage yet
- Audit warnings may remain for Next/PostCSS with no available fix
- Production deploy has not been executed yet
