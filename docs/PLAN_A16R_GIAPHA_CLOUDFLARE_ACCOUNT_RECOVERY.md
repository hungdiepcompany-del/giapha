# A-16R GIA PHA Cloudflare Account Recovery

## Status

- Phase marker: `A-16R-GIAPHA-CLOUDFLARE-ACCOUNT-RECOVERY`.
- Current status:
  `A16R_GIAPHA_CLOUDFLARE_ACCOUNT_RECOVERY_STATUS=BLOCKED_WRONG_OR_UNVERIFIED_CLOUDFLARE_ACCOUNT`.
- `CLOUDFLARE_ACCOUNT_MATCH=NO`.
- `TARGET_WORKER_FOUND=NO`.
- `DEPLOY_ALLOWED_NEXT=NO`.
- `DEPLOY_BLOCKER=BLOCKED_TARGET_WORKER_NOT_FOUND_IN_CURRENT_CLOUDFLARE_ACCOUNT`.
- Required owner action:
  `REQUIRED_OWNER_ACTION=LOGIN_TO_CORRECT_GIAPHA_CLOUDFLARE_ACCOUNT_OR_PROVIDE_GITHUB_ACTIONS_DEPLOY_EVIDENCE_FOR_WEB_GIA_PHA`.

This phase is identity and evidence only. It does not deploy and does not open
official import.

## Git State

- Latest local commit at phase start:
  `2e223c1f9969bd7698a5ec43f32e54895fe`.
- Commit message:
  `docs: record A16R runtime execution push deploy smoke`.
- Branch state at phase start:
  `main...origin/main [ahead 1]`.
- Working tree at phase start: clean.
- The previous four safe commits had already been pushed:
  - `70f7df2`
  - `c3ab5f7`
  - `132160f`
  - `55d137c`
- The local evidence commit `2e223c1f9969bd7698a5ec43f32e54895fe` remains
  local-only until a separate push approval.

## Expected GIA PHA Cloudflare Target

- Worker name from `wrangler.toml`:
  `web-gia-pha`.
- Worker entrypoint from `wrangler.toml`:
  `.open-next/worker.js`.
- Production URL documented in deploy/operations docs:
  `https://web-gia-pha.hungdiepcompany.workers.dev/`.
- Deploy workflow:
  `.github/workflows/cloudflare-deploy.yml`.
- Deploy workflow type:
  `workflow_dispatch` manual-only.
- Deploy command inside workflow:
  `npm run deploy`.
- Documented GIA PHA Cloudflare account id:
  `GIA_PHA_CLOUDFLARE_ACCOUNT_ID_DOCUMENTED=UNKNOWN_NOT_DOCUMENTED_IN_REPO_DOCS`.

## Current Wrangler And Cloudflare Evidence

- Wrangler version observed:
  `4.100.0`.
- Current Wrangler email observed in the previous phase:
  `hung.pham@longthaisteel.com`.
- Current Wrangler account id observed in the previous phase and confirmed by
  read-only Cloudflare API in this phase:
  `dec1eb5cfb3f4b32956b1aff723e5ace`.
- `npx wrangler whoami` in this phase timed out while calling Cloudflare API:
  `A16R_GIAPHA_CLOUDFLARE_ACCOUNT_RECOVERY_WRANGLER_WHOAMI_STATUS=TIMEOUT`.
- `npx wrangler deployments list --name web-gia-pha` in this phase timed out
  when run through Wrangler CLI, but read-only Cloudflare API returned:
  `Cloudflare API error: 10007: This Worker does not exist on your account.`
- `npx wrangler deployments status --name web-gia-pha` in this phase timed out
  when run through Wrangler CLI.
- Read-only Cloudflare API worker list for account
  `dec1eb5cfb3f4b32956b1aff723e5ace` returned only:
  `bom`, `hrsync`, `san-xuat-lt`, `san-xuat-lt-google-drive-service`, `sx`.
- Target worker `web-gia-pha` is not present in that account:
  `TARGET_WORKER_FOUND=NO`.

## Classification

- `CLOUDFLARE_ACCOUNT_MATCH=NO`.
- `TARGET_WORKER_FOUND=NO`.
- `DEPLOY_ALLOWED_NEXT=NO`.
- `DEPLOY_BLOCKER=BLOCKED_TARGET_WORKER_NOT_FOUND_IN_CURRENT_CLOUDFLARE_ACCOUNT`.
- `A16R_GIAPHA_CLOUDFLARE_ACCOUNT_RECOVERY_REASON=ACTIVE_ACCOUNT_LISTS_SAN_XUAT_LT_WORKERS_NOT_WEB_GIA_PHA`.

The active account appears to be the Sản Xuất LT Cloudflare account or a shared
account currently exposing Sản Xuất LT workers. It must not be used for a GIA
PHA deploy while `web-gia-pha` is absent.

## Required Owner Action

Before any deploy retry:

1. Confirm the correct Cloudflare account that owns worker `web-gia-pha`.
2. Log Wrangler into that correct GIA PHA Cloudflare account, or provide a
   GitHub Actions `Cloudflare Deploy` run URL/evidence that deployed
   `web-gia-pha`.
3. Re-run read-only checks:
   - `npx wrangler whoami`
   - `npx wrangler deployments list --name web-gia-pha`
   - read-only worker list for the selected account
4. Only if `web-gia-pha` is visible and the account/target matches GIA PHA may
   a later deploy retry phase proceed.

Do not change `wrangler.toml` to match the current wrong account. Do not deploy
GIA PHA to `sx` or any Sản Xuất LT worker.

## Forbidden Actions Confirmed

- `A16R_GIAPHA_CLOUDFLARE_ACCOUNT_RECOVERY_POST_OFFICIAL_IMPORT_CALLED=NO`.
- `A16R_GIAPHA_CLOUDFLARE_ACCOUNT_RECOVERY_RPC_DIRECT_CALLED=NO`.
- `A16R_GIAPHA_CLOUDFLARE_ACCOUNT_RECOVERY_REAL_GENEALOGY_WRITE=NO`.
- `A16R_GIAPHA_CLOUDFLARE_ACCOUNT_RECOVERY_DEPLOY_RUN=NO`.
- `A16R_GIAPHA_CLOUDFLARE_ACCOUNT_RECOVERY_PUSH_RUN=NO`.
- `A16R_GIAPHA_CLOUDFLARE_ACCOUNT_RECOVERY_SQL_RUN=NO`.
- `A16R_GIAPHA_CLOUDFLARE_ACCOUNT_RECOVERY_DB_PUSH_RUN=NO`.
- `A16R_GIAPHA_CLOUDFLARE_ACCOUNT_RECOVERY_MIGRATION_REPAIR_RUN=NO`.
- `A16R_GIAPHA_CLOUDFLARE_ACCOUNT_RECOVERY_SEED_RUN=NO`.
- No POST `/official-import`.
- No direct RPC call.
- No people, relationships, families, tree layout, revision or profile write.
- No SQL, DB push, migration repair or seed.
- No deploy.
- No push.

## Next Safe Gate

`A16R_GIAPHA_CLOUDFLARE_ACCOUNT_RECOVERY_NEXT_GATE=WAIT_FOR_OWNER_CORRECT_ACCOUNT_OR_DEPLOY_EVIDENCE`

After owner/operator provides correct account evidence, create a separate phase
to verify `web-gia-pha` exists in the active account and only then decide
whether a deploy retry is safe. A-16R official import remains blocked until
post-deploy/source smoke is sufficient and a later explicit execution phase
allows it.
