# GitHub Actions Cloudflare Deploy Workflow

## Status

PASS

## Purpose

Deploy the existing OpenNext Cloudflare Workers app from Linux/GitHub Actions after Windows local deploy was blocked by OpenNext compatibility.

## Workflow

`.github/workflows/cloudflare-deploy.yml`

## Trigger

Manual only:

- `workflow_dispatch`

The workflow does not run on push, pull request or schedule.

## What It Does

- Checks out the repository.
- Sets up Node.js 24.
- Runs `npm ci`.
- Verifies required GitHub Actions variables and secrets are present without printing values.
- Runs safety checks:
  - `npm run check:env:safe`
  - `npm run check:migrations`
  - `npm run check:deploy-readiness`
  - `npm run check:opennext-cloudflare`
  - `npm run check:service-boundary`
  - `npm run check:github-actions-opennext`
  - `npm run check:github-actions-deploy`
- Runs `npm run typecheck`.
- Runs `npm run lint`.
- Runs `npm run build`.
- Runs `npm run deploy`.

## What It Does Not Do

- No automatic deploy on push.
- No migration.
- No schema change.
- No data mutation outside the app deploy.
- No import confirm.
- No revision restore.
- No local Windows deploy.
- No `npm audit fix --force`.

## Required GitHub Actions Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`

## Required GitHub Actions Secrets

- `SUPABASE_SERVICE_ROLE_KEY`
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## Secret Policy

- No token, key or secret value is committed to the repo.
- Workflow reads values from `vars.*` and `secrets.*`.
- Workflow checks only whether required values are present.
- Workflow must not print secret values.
- `.env.local` and `.dev.vars` remain untracked.

## Preconditions Confirmed By User

- GitHub Actions OpenNext Build Gate PASS.
- Backup before deploy DONE:
  - `family.json`
  - `full-backup.zip`
- Cloudflare production variables/secrets configured:
  - `NEXT_PUBLIC_SUPABASE_URL`: Text
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Text
  - `NEXT_PUBLIC_APP_URL`: Text
  - `SUPABASE_SERVICE_ROLE_KEY`: Secret
- GitHub Actions secrets configured:
  - `CLOUDFLARE_API_TOKEN`
  - `CLOUDFLARE_ACCOUNT_ID`

## How To Run

After this commit is pushed:

1. Open GitHub Actions.
2. Select `Cloudflare Deploy`.
3. Click `Run workflow`.
4. Confirm the selected branch is `main`.
5. Run the workflow manually.

## Expected Result

If the workflow passes, the app is deployed to Cloudflare Workers via OpenNext from Linux.

## Production Deploy Result

- GitHub Actions Cloudflare Deploy: PASS
- Worker: `web-gia-pha`
- Production URL: https://web-gia-pha.hungdiepcompany.workers.dev/
- `NEXT_PUBLIC_APP_URL`: updated to the production URL
- Supabase Site URL: configured for the production URL
- Supabase Redirect URLs: configured for the production `/auth/callback`
- Google OAuth: fixed `deleted_client` issue and login PASS
- Basic production route smoke test: PASS by manual user test

## Production Smoke Summary

- Homepage: PASS
- Public tree: PASS
- Login page: PASS
- Google OAuth: PASS after OAuth client fix
- Admin/basic protected routes: PASS by manual user test
- Export/import/revision surfaces: basic smoke PASS by manual user test
- Import confirm: still disabled
- Revision restore: still disabled

## Local Validation

- `npm.cmd run check:env:safe`: PASS
- `npm.cmd run check:migrations`: PASS
- `npm.cmd run check:deploy-readiness`: PASS
- `npm.cmd run check:opennext-cloudflare`: PASS
- `npm.cmd run check:service-boundary`: PASS
- `npm.cmd run check:github-actions-opennext`: PASS
- `npm.cmd run check:github-actions-deploy`: PASS
- `npm.cmd run typecheck`: PASS
- `npm.cmd run lint`: PASS
- `npm.cmd run build`: PASS
- `npm.cmd audit --audit-level=moderate`: PASS_WITH_KNOWN_AUDIT_ADVISORIES
- `git diff --check`: PASS
- Secret scan: PASS, only GitHub `secrets.*` references, placeholders and docs policy matched

## After Deploy

- Record the production URL.
- Verify Supabase Auth Site URL and Redirect URLs.
- Verify Google OAuth production origin.
- Smoke test production routes.
- Create/update a deploy report with the run URL and production URL.

## Known Risks

- Audit advisories in the Next/OpenNext/Wrangler/PostCSS/esbuild/ws toolchain remain tracked.
- No `npm audit fix --force`.
- Import confirm remains disabled.
- Revision restore remains disabled.
- Media backup is not implemented yet.
