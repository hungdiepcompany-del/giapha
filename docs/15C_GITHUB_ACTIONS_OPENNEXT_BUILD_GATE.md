# GitHub Actions OpenNext Build Gate

## Status

READY_TO_RUN_ON_GITHUB

## Purpose

Validate OpenNext Cloudflare build on Linux before first real deploy.

## Why

Local Windows OpenNext build is blocked by OpenNext/Windows compatibility issue.

## Workflow

`.github/workflows/opennext-build-gate.yml`

## What It Does

- npm ci
- env safe check
- migrations order check
- project foundation checks
- service boundary check
- deploy readiness check
- OpenNext wiring check
- typecheck
- lint
- Next build
- OpenNext Cloudflare build

## What It Does Not Do

- no deploy
- no upload
- no wrangler deploy
- no migration
- no DB mutation
- no import confirm
- no revision restore

## Secrets

No production secrets are committed.
Build gate can use placeholders.
Production deploy will configure Cloudflare/GitHub secrets separately.

- Workflow này là build gate, không phải deploy.
- `SUPABASE_SERVICE_ROLE_KEY` trong workflow chỉ dùng placeholder nếu chưa cấu hình secret thật.
- Không in secret.
- Không dùng workflow này để smoke test Supabase thật.
- Production deploy phase sau mới cấu hình Cloudflare secrets/env thật.
- Nếu build yêu cầu env thật, cấu hình qua GitHub Repository Settings -> Secrets and variables -> Actions.

## Expected Result

If GitHub Actions PASS, OpenNext build problem is Windows-local only.

## Audit Note

`npm audit --audit-level=moderate` hiện còn advisory trong dependency/toolchain chain của Next/OpenNext/Wrangler/PostCSS/esbuild/ws. Không chạy `npm audit fix --force`; theo dõi upstream package updates và không chặn Phase 15C nếu checks/build PASS.

## Next Step

After PASS:

- Phase 15D - First Cloudflare Deploy Retry
