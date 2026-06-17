# Production Operations & Monitoring

## Status

PRODUCTION_OPERATIONS_BASELINE

Phase 17 adds production operations guidance after the first successful Cloudflare deploy. This phase does not deploy, change schema, run migrations, mutate real data, change privacy/business logic, enable import confirm, or enable revision restore.

## Production Baseline

- Worker name: `web-gia-pha`
- Production URL: https://web-gia-pha.hungdiepcompany.workers.dev/
- Deploy workflow: `.github/workflows/cloudflare-deploy.yml`
- Phase 16 baseline: PASS
- Google OAuth production login: PASS by manual user test
- Basic production route smoke: PASS by manual user test
- Optional automated production smoke: skipped unless `PROD_SMOKE_BASE_URL` is set

## Post-Deploy Operations Checklist

Run this after each production deploy:

- Check basic routes: `/`, `/tree`, `/auth/login`, `/admin`, `/admin/system/status`
- Check login/logout flow without creating test data
- Check Google OAuth callback returns to `/auth/callback`
- Check private routes redirect or deny before login
- Check admin routes are available after OWNER/admin login
- Check public routes do not expose private admin fields
- Check export backup UI if available: download `family.json` and `full-backup.zip`
- Check `/admin/system/status` shows only yes/no state, not env values
- Check application error responses do not expose stack traces, token, key, or secret values

## Cloudflare Monitoring Checklist

Use Cloudflare dashboard after each deploy:

- Check Worker `web-gia-pha` deploy status
- Check the active deployment timestamp and commit reference if available
- Check Worker logs for 4xx/5xx spikes
- Check Worker errors and exceptions
- Check CPU/time limit warnings if Cloudflare reports them
- Check abnormal 404/500 route patterns
- Check that no token, key, Supabase value, cookie, access token, refresh token, or service role key is logged
- Do not hardcode token/key values into `wrangler.toml`, logs, docs, or GitHub workflow files

## GitHub Actions Monitoring Checklist

Use GitHub Actions after each deploy:

- Open the `Cloudflare Deploy` workflow
- Confirm the workflow was manually triggered by `workflow_dispatch`
- Confirm `npm ci`, safety checks, typecheck, lint, build, and deploy all passed
- If a job fails, inspect the first failing step
- Check for missing GitHub Actions secrets or variables
- Check OpenNext output/build artifact generation in logs
- Confirm logs do not print secret values
- Do not add automatic push or pull request deploy triggers unless reviewed

## Supabase/Auth Monitoring Checklist

Use Supabase Dashboard and production browser smoke:

- Check Google OAuth login on production
- Check Supabase Site URL is the production URL
- Check Supabase Redirect URLs include `https://web-gia-pha.hungdiepcompany.workers.dev/auth/callback`
- Check local redirect URLs can remain for local development if needed
- Check session/cookie behavior after login/logout
- Check `/unauthorized` renders safely for denied access
- Check admin routes still require permission
- Do not change real data in Phase 17
- If auth redirect fails, inspect Supabase Redirect URLs and Google OAuth config before touching database or roles

## Smoke Testing Guide

Manual smoke:

- `/`
- `/tree`
- `/auth/login`
- Google OAuth login
- `/auth/callback`
- `/admin`
- `/admin/system/status`
- `/admin/people`
- `/admin/relationships`
- `/admin/tree`
- `/admin/tree/edit`
- `/admin/exports`
- `/admin/exports/import`
- `/admin/revisions`

Optional automated smoke:

```bash
PROD_SMOKE_BASE_URL=https://web-gia-pha.hungdiepcompany.workers.dev npm.cmd run check:production-stabilization
```

The automated smoke is optional. It should skip safely when `PROD_SMOKE_BASE_URL` is missing, should not require network for normal local validation, should not login automatically, and should not mutate data.

## Incident Triage Runbook

### Login fails

- Check Supabase Auth provider status
- Check Supabase Site URL and Redirect URLs
- Check Google OAuth authorized origin and Supabase callback redirect URI
- Check browser cookie/session behavior
- Do not reassign OWNER or change roles until the auth redirect path is confirmed

### Route returns 500

- Check Cloudflare Worker logs
- Check GitHub Actions deploy logs for build/deploy warnings
- Check env presence through safe status only, not raw values
- Roll back deployment first if production impact is broad
- Do not run emergency migrations without root cause

### Deploy workflow fails

- Check the first failing GitHub Actions step
- Check missing GitHub variables/secrets
- Check `npm ci`, OpenNext build, and `npm run deploy` output
- Re-run only after the cause is clear

### Cloudflare Worker fails

- Check Worker deployment history
- Check runtime errors and CPU/time limit warnings
- Roll back to the previous stable deployment if needed
- Record deployment id, commit hash, time, and symptom

### Supabase/Auth redirect fails

- Check Supabase Redirect URLs before changing app code
- Check Google OAuth Client uses Supabase callback URI, not app `/auth/callback`
- Check `NEXT_PUBLIC_APP_URL` in production environment
- Do not change database rows as a first response

### Suspected secret exposure

- Stop deploys and preserve logs
- Rotate affected secret/token/key in the owning provider
- Remove exposed value from logs/docs/history where possible
- Review GitHub Actions, Cloudflare logs, and repo diff
- Do not paste secret values into chat, docs, or issues

### Build passes but production fails

- Compare deployed commit with local commit
- Check Cloudflare runtime logs
- Check production env/secret configuration
- Check OpenNext/Worker compatibility warnings
- Roll back first if user-facing impact is significant

## Rollback Guidance

- Prefer rollback through Cloudflare deployment history or GitHub Actions deploy history
- Keep previous stable commit hash and deployment id in the incident notes
- Do not edit production database as a rollback shortcut
- Do not run urgent migrations until root cause is confirmed
- Record commit, deploy id, failure time, symptom, and rollback result
- Use backup files as evidence and recovery input only with a reviewed restore plan

## Boundary

- Do not deploy in Phase 17
- Do not change schema
- Do not create or run migrations
- Do not mutate real data
- Do not enable real import confirm
- Do not enable real revision restore
- Do not change privacy or business logic
- Do not hardcode secret/token/key values
- Do not commit `.env.local` or `.dev.vars`
