# OpenNext Cloudflare Wiring

## Status

READY_FOR_FIRST_DEPLOY

Phase 15A configures the Cloudflare Workers deployment target for the existing Next.js SSR app through OpenNext. This phase does not deploy, upload, push remote, run migrations, change schema, change business logic, enable import confirm, or enable revision restore.

## Windows local build note

- `npm run check:opennext-cloudflare` verifies wiring and is expected to pass on Windows.
- `npm run build` verifies the Next.js app and is expected to pass on Windows.
- `npx.cmd opennextjs-cloudflare build` can be blocked on pure Windows by OpenNext compatibility, including missing `.open-next/.build/open-next.config.edge.mjs`.
- Do not change app business logic only to work around that Windows/OpenNext local issue.
- Real OpenNext build/deploy should be retried from WSL/Linux/GitHub Actions or another Cloudflare-compatible environment.
- Phase 15D confirmed this blocker again during `npm.cmd run deploy` on Windows: Next build passed, OpenNext bundle failed before deployment/upload.

## Linux build gate

- Phase 15C adds `.github/workflows/opennext-build-gate.yml`.
- The workflow runs on `ubuntu-latest`, installs with `npm ci`, runs local checks, runs `npm run build`, then runs `npx opennextjs-cloudflare build`.
- This workflow is a build gate only; it does not deploy, upload or run `wrangler deploy`.
- Placeholder GitHub Actions env can be used for build only. Production Cloudflare secrets/env are configured later for deploy.
- Phase 15C GitHub Actions run `27631937702` passed on commit `b04657535a94378df0a6811a15fff247131d5cac`.

## Deploy target

Cloudflare Workers via OpenNext.

## Audit policy note

- Audit advisories are currently tracked as deploy-toolchain risk, not app business-logic change.
- `npm audit --audit-level=moderate` can report advisories through `next`/`postcss`, `@opennextjs/cloudflare`, `wrangler`, `esbuild` and `ws`.
- Do not run `npm audit fix --force`; track upstream package updates and avoid breaking the Next/OpenNext deploy wiring for a forced audit remediation.

## Files

- `open-next.config.ts`
- `wrangler.toml`
- `package.json` scripts
- `eslint.config.mjs` ignores generated `.open-next` output
- `scripts/check-opennext-cloudflare-wiring.cjs`

## Commands

- `npm run preview`: build OpenNext output and start local Cloudflare preview
- `npm run deploy`: build OpenNext output and deploy to Cloudflare Workers
- `npm run upload`: build OpenNext output and upload without deploying
- `npm run cf-typegen`: generate Cloudflare env types
- `npm run check:opennext-cloudflare`: verify wiring files and scripts

Do not run `npm run deploy`, `npm run upload`, or `npx wrangler deploy` until Phase 15 is retried with production env/secrets and backup confirmation.

## Secrets

- `SUPABASE_SERVICE_ROLE_KEY` must be configured as a Cloudflare secret.
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_APP_URL` can be configured as Cloudflare variables.
- Do not commit `.env.local` or `.dev.vars`.
- Do not use `NEXT_PUBLIC_` for the service role key.
- Do not hardcode Supabase values in `wrangler.toml`.

## Phase 15 retry

After this phase passes:

1. Backup `family.json` and `full-backup.zip`.
2. Configure Cloudflare variables and secrets.
3. Update Supabase Auth production Site URL and Redirect URLs.
4. Update Google OAuth production origin.
5. Run Phase 15 First Cloudflare Deploy again.
