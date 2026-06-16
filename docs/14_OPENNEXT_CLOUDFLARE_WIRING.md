# OpenNext Cloudflare Wiring

## Status

READY_FOR_FIRST_DEPLOY

Phase 15A configures the Cloudflare Workers deployment target for the existing Next.js SSR app through OpenNext. This phase does not deploy, upload, push remote, run migrations, change schema, change business logic, enable import confirm, or enable revision restore.

## Deploy target

Cloudflare Workers via OpenNext.

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
