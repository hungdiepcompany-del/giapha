# Backup, Domain & Alerting Hardening

## Status

BACKUP_DOMAIN_ALERTING_BASELINE

Phase 18 hardens production operations around backup discipline, future domain changes, and alert/incident readiness. This phase does not deploy, change schema, run migrations, mutate real data, create production backups, change domain/Auth/OAuth configuration, enable import confirm, or enable revision restore.

## Production Baseline

- Worker name: `web-gia-pha`
- Current production URL: https://web-gia-pha.hungdiepcompany.workers.dev/
- Deploy workflow: `.github/workflows/cloudflare-deploy.yml`
- Phase 16 status: PASS
- Phase 17 status: PASS
- Google OAuth production login: PASS by manual user test
- Basic production route smoke: PASS by manual user test
- Automated production smoke with `PROD_SMOKE_BASE_URL`: PASS

## Backup Hardening Checklist

Use this checklist before and after risky production work:

- Export `family.json` from `/admin/exports`
- Export GEDCOM if the UI/API is available and permissions allow it
- Export `full-backup.zip` if the UI/API is available and permissions allow it
- Download backup before deploy
- Download backup after deploy if the deploy changes data/export behavior
- Download backup before editing real production data
- Download backup before any import, restore, or revision restore work
- Store backup outside the production system
- Store backup outside the git repository
- Name backup files with date/time and environment
- Confirm backup files are non-empty
- Do not put secrets into backup files
- Do not commit real backup/export files to git
- Do not paste real backup content into chat, docs, issues, or logs

Current gap:

- Backup/export UI exists for JSON/GEDCOM/ZIP.
- Phase 18 does not create backups and does not add scheduled backup automation.
- Restore/import-confirm remains a separate high-risk phase.

## Restore Readiness Checklist

Before any real restore:

- Confirm the backup file can still be opened/read
- Confirm the backup file matches the intended family/project
- Confirm file timestamp and source environment
- Validate manifest/checksum when available
- Test restore/import in a test or staging environment first
- Compare people, relationships, tree layout, export output, and revision behavior after test restore
- Do not restore into production until the test/staging result is reviewed
- Do not run real revision restore in Phase 18
- Treat production restore as high-risk work requiring a dedicated phase, rollback plan, and backup taken immediately before the operation

## Domain Hardening Checklist

Current production uses the Cloudflare Workers domain:

- https://web-gia-pha.hungdiepcompany.workers.dev/

If a custom domain is introduced later:

- Confirm DNS record points to the intended Cloudflare target
- Confirm SSL/TLS is active and valid
- Confirm Cloudflare route/custom domain binding points to Worker `web-gia-pha`
- Confirm canonical production URL
- Update `NEXT_PUBLIC_APP_URL` in deploy environment
- Update Supabase Site URL
- Update Supabase Redirect URLs for `/auth/callback`
- Update Google OAuth Authorized JavaScript origin
- Keep Google OAuth Authorized redirect URI as the Supabase callback, not app `/auth/callback`
- Avoid URL drift between app env, Supabase Dashboard, and Google Cloud Console
- Keep local redirect URLs only if local development still needs them

Phase 18 does not change the real domain and does not redeploy just to change domain settings.

## Alerting Hardening Checklist

Monitor and alert manually until automated alerts are deliberately configured:

- Cloudflare Worker failed deploy
- Cloudflare Worker runtime error
- Route 500 increase
- OAuth callback/login failure
- Supabase Auth redirect mismatch
- Export/backup failure
- GitHub Actions build workflow failure
- GitHub Actions deploy workflow failure
- Known audit advisories changing severity
- Secret/env missing
- Production smoke failure
- Unexpected public data exposure

Recommended future setup:

- Cloudflare notification for Worker errors if available for the account
- GitHub Actions notification review for failed `Cloudflare Deploy`
- Scheduled production smoke using `PROD_SMOKE_BASE_URL`
- Manual monthly backup drill until scheduled backup exists
- Audit advisory review during dependency upgrades

Do not claim automatic alerting is configured until it is confirmed in Cloudflare/GitHub/Supabase dashboards.

## Incident Response Matrix

| Situation | Symptoms | First checks | Do not do quickly | Safe response | Rollback trigger |
| --- | --- | --- | --- | --- | --- |
| Production route 500 | Public/admin route returns 5xx | Cloudflare logs, deploy commit, env present/missing state | Do not run migrations or edit DB first | Roll back Worker if broad impact, then inspect logs | Repeated 5xx or admin unavailable |
| Login/OAuth fail | Google login fails or callback loops | Supabase Redirect URLs, Google OAuth origin, `NEXT_PUBLIC_APP_URL` | Do not reassign OWNER or change roles first | Fix URL/provider config, retest login | Auth broken for all admin users |
| Export/backup fail | JSON/GEDCOM/ZIP download fails or empty | Worker logs, export permissions, Supabase query errors | Do not import old backup into production | Roll back deploy if export regressed, then inspect service logs | Backup impossible before risky work |
| Domain/SSL error | Browser SSL warning, DNS failure, wrong host | DNS, SSL/TLS status, Cloudflare route/custom domain | Do not change Supabase/Auth configs randomly | Restore previous canonical URL or fix DNS binding | Custom domain blocks all access |
| GitHub Actions deploy fail | Workflow red, failed job | First failing step, missing vars/secrets, OpenNext output | Do not rerun repeatedly without reading logs | Fix config or dependency cause, rerun manually | Failed deploy after production regression |
| Cloudflare Worker deploy fail | Deploy rejected or Worker not updated | Wrangler/OpenNext logs, Cloudflare dashboard | Do not force deploy with secret in config | Keep previous deployment active, fix build/deploy config | New deployment partially active or unstable |
| Supabase/Auth error | Unauthorized unexpectedly, callback error | Auth provider, Site URL, Redirect URLs, RLS errors | Do not disable RLS | Verify config and permissions with safe queries | Admin cannot access after config change |
| Suspected secret exposure | Token/key in logs, docs, or repo | Git diff, GitHub logs, Cloudflare logs | Do not paste secret anywhere | Rotate secret, remove exposure, audit logs | Any confirmed secret exposure |

## Backup Naming Convention

Recommended file names:

```text
gia-pha-backup-YYYYMMDD-HHMM-production.json
gia-pha-backup-YYYYMMDD-HHMM-production.gedcom
gia-pha-backup-YYYYMMDD-HHMM-production.zip
```

Examples:

```text
gia-pha-backup-20260617-0830-production.json
gia-pha-backup-20260617-0830-production.gedcom
gia-pha-backup-20260617-0830-production.zip
```

Phase 18 does not create real backup files.

## Environment And Secret Safety

- Do not hardcode secret/token/key values
- Do not print secrets in logs
- Do not commit `.env.local`
- Do not commit `.dev.vars`
- Do not commit real backup files
- Do not commit production export files
- Do not put Google OAuth Client Secret in docs
- Do not put Supabase keys or Cloudflare tokens in docs
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only
- Keep public env values in deploy platform variables, not hardcoded source

## Phase 18 Boundary

- Do not deploy in Phase 18
- Do not change schema
- Do not create or run migrations
- Do not mutate real data
- Do not create real production backup/export files
- Do not enable real import confirm
- Do not enable real revision restore
- Do not change the real domain
- Do not change Supabase/Auth/OAuth production config
- Do not hardcode secret/token/key values
- Do not commit `.env.local` or `.dev.vars`
- Do not commit real backup/export data

## Next Phase

- Phase 19 - Scheduled Backup & Restore Drill, if the priority is operations
- Phase 19 - Custom Domain Cutover, if the priority is domain
- Focused production bugfix phase, if monitoring or smoke tests reveal an issue
