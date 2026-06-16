# First Cloudflare Deploy Retry Report

## Status

BLOCKED

Phase 15D attempted the first Cloudflare deploy from Windows after all required gates were confirmed. The deploy did not reach Cloudflare upload/deployment because OpenNext failed during the local Windows bundle step.

## Commit Deployed

Not deployed.

Attempted commit: `b04657535a94378df0a6811a15fff247131d5cac`

## Deploy Target

Cloudflare Workers via OpenNext

## GitHub Actions Gate

- Workflow: OpenNext Cloudflare Build Gate
- Status: PASS
- Commit: `b04657535a94378df0a6811a15fff247131d5cac`
- Run URL: https://github.com/hungdiepcompany-del/giapha/actions/runs/27631937702

## Production URL

Not created by this attempt.

## Commands

- `npm.cmd run deploy` - BLOCKED during `opennextjs-cloudflare build`

## Environment

- `NEXT_PUBLIC_SUPABASE_URL`: configured, confirmed by user
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: configured, confirmed by user
- `NEXT_PUBLIC_APP_URL`: configured, confirmed by user
- `SUPABASE_SERVICE_ROLE_KEY`: configured as secret, confirmed by user

## Secret Policy

- Secrets committed: no
- `.env.local` tracked: no
- `.dev.vars` tracked: no
- Secret values printed: no

## Backup Before Deploy

- `family.json`: done, confirmed by user
- `full-backup.zip`: done, confirmed by user
- confirmed by: user
- backup location: outside repo, confirmed by user

## Supabase Auth

- Site URL updated: not verified in this attempt
- Redirect URL `/auth/callback` added: not verified in this attempt
- Local redirect kept: not verified in this attempt

## Google OAuth

- Production origin added: not verified in this attempt
- Supabase OAuth callback configured: not verified in this attempt

Google redirect URI is the Supabase callback, not the app `/auth/callback`. The app `/auth/callback` belongs in Supabase Redirect URLs.

## Deploy Result

- Next build: PASS
- OpenNext Cloudflare build on GitHub Actions/Linux: PASS
- OpenNext Cloudflare deploy from Windows: BLOCKED
- Failure point: OpenNext bundle middleware step
- Error summary: `ENOENT: no such file or directory, copyfile '.open-next/.build/open-next.config.edge.mjs' -> '.open-next/middleware/open-next.config.mjs'`
- Cloudflare upload/deploy reached: no

## Production Smoke Test

- `/`: not run, no production URL
- `/tree`: not run, no production URL
- `/auth/login`: not run, no production URL
- Google OAuth: not run, no production URL
- `/admin`: not run, no production URL
- `/admin/system/status`: not run, no production URL
- `/admin/people`: not run, no production URL
- `/admin/relationships`: not run, no production URL
- `/admin/tree`: not run, no production URL
- `/admin/tree/edit`: not run, no production URL
- `/admin/exports`: not run, no production URL
- `/admin/exports/import`: not run, no production URL
- `/admin/revisions`: not run, no production URL

## Known Limitations

- Import confirm disabled
- Revision restore disabled
- Audit advisories tracked, no force fix
- Media backup not implemented
- Custom domain not configured yet
- Windows local OpenNext deploy remains blocked

## Rollback

- Previous stable commit: `b04657535a94378df0a6811a15fff247131d5cac`
- Cloudflare rollback method: not applicable; no deploy was created
- Backup file location: outside repo, confirmed by user

## Next Step

Use WSL/Linux or create a dedicated GitHub Actions deploy workflow after explicit user confirmation. Do not change app logic to work around the Windows/OpenNext local blocker.

## Phase 15E Follow-Up

User confirmed GitHub Actions secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are configured. Phase 15E adds a manual-only GitHub Actions Cloudflare deploy workflow so deploy can run from Linux without using Windows local OpenNext deploy.
