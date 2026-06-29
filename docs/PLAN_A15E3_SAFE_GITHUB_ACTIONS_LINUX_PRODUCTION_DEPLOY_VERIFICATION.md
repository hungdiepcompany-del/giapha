# A-15E3 - Safe GitHub Actions Linux Production Deploy Verification

Status: `PASS_GITHUB_ACTIONS_LINUX_DEPLOY_VERIFIED`

Marker: `A-15E3`

Marker: `A15E3_SAFE_GITHUB_ACTIONS_LINUX_PRODUCTION_DEPLOY_VERIFICATION`

## Muc Tieu

A-15E3 xac minh production sau khi owner chay Cloudflare Deploy bang GitHub
Actions Linux manual workflow. Phase nay chi verification/documentation/checker,
khong tu deploy lai va khong rollback tu dong.

## Pham Vi An Toan

Duoc lam:

- doc local git state va `.env.local` ignore state;
- doc workflow Cloudflare Deploy va OpenNext Build Gate hien co;
- doc owner-reported GitHub Actions deploy run va Node.js warning;
- smoke production read-only bang `curl.exe -I`;
- doc `npx wrangler deployments list` read-only;
- them phase doc/checker/package script va cap nhat handoff.

Khong lam:

- no deploy rerun;
- no automatic rollback;
- no DB migration;
- no seed;
- no RLS/auth/permission/API contract change;
- no production data mutation;
- no production form submit;
- no `.env.local` commit;
- no secret value log;
- no dependency;
- no auto deploy on push;
- no OpenNext/Wrangler config change.

## Background

A-15E2 recorded a Windows/OpenNext deploy failure: a direct Windows production
deploy using `npx wrangler deploy` after `npm run build` caused HTTP 500 on all
main routes:

```text
WINDOWS_OPENNEXT_DEPLOY_INCIDENT=500_ALL_MAIN_ROUTES
FAILED_ROUTE_/=500
FAILED_ROUTE_/tree=500
FAILED_ROUTE_/auth/login=500
FAILED_ROUTE_/admin=500
ROLLBACK_VERSION=4134298b-ef89-4099-b20b-b13995f397c8
A15E2_ROLLBACK_STATUS=OWNER_CONFIRMED_SUCCESS
```

After rollback, production was stable again:

```text
POST_ROLLBACK_/=200
POST_ROLLBACK_/tree=200
POST_ROLLBACK_/auth/login=200
POST_ROLLBACK_/admin=307_REDIRECT_LOGIN
```

## Local State

Commands run:

- `git status -sb`
- `git log --oneline --decorate -12`
- `git check-ignore -v .env.local`

Observed:

```text
GIT_STATUS_BEFORE_A15E3=PASS_SYNCED_CLEAN
HEAD_BEFORE_A15E3=9b6383e docs: record production rollback and deploy failure diagnostics
LOCAL_BRANCH=main
REMOTE_STATUS=main...origin/main
ENV_LOCAL_IGNORED=true
ENV_LOCAL_IGNORE_RULE=.gitignore:17:.env.*
```

## Workflow Verification

Read-only workflow files:

- `.github/workflows/cloudflare-deploy.yml`
- `.github/workflows/opennext-build-gate.yml`

Cloudflare Deploy workflow:

```text
CLOUDFLARE_DEPLOY_WORKFLOW=.github/workflows/cloudflare-deploy.yml
CLOUDFLARE_DEPLOY_TRIGGER=workflow_dispatch
CLOUDFLARE_DEPLOY_AUTO_ON_PUSH=false
CLOUDFLARE_DEPLOY_RUNNER=ubuntu-latest
CLOUDFLARE_DEPLOY_NODE_VERSION=24
CLOUDFLARE_DEPLOY_COMMAND=npm run deploy
```

Env/secrets contract in the manual deploy workflow:

```text
CLOUDFLARE_API_TOKEN=secrets.CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID=secrets.CLOUDFLARE_ACCOUNT_ID
NEXT_PUBLIC_SUPABASE_URL=vars.NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=vars.NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_APP_URL=vars.NEXT_PUBLIC_APP_URL
SUPABASE_SERVICE_ROLE_KEY=secrets.SUPABASE_SERVICE_ROLE_KEY
```

OpenNext Build Gate workflow:

```text
OPENNEXT_BUILD_GATE_WORKFLOW=.github/workflows/opennext-build-gate.yml
OPENNEXT_BUILD_GATE_RUNNER=ubuntu-latest
OPENNEXT_BUILD_GATE_NODE_VERSION=24
OPENNEXT_BUILD_GATE_CAN_RUN_ON_PUSH=true
OPENNEXT_BUILD_GATE_DEPLOYS_PRODUCTION=false
OPENNEXT_BUILD_GATE_COMMAND=npx opennextjs-cloudflare build
```

The build gate can run on `push` and `pull_request`, but it does not run
`npm run deploy` and does not deploy production.

## GitHub Actions Deploy Result

Owner reported running the manual GitHub Actions Cloudflare Deploy workflow
after A-15E2.

Local tooling in A-15E3 did not call GitHub API and did not read workflow run
status independently. Therefore:

```text
GITHUB_ACTIONS_RUN_STATUS=OWNER_CONFIRMATION_REQUIRED_FOR_SUCCESS_FAILURE
GITHUB_ACTIONS_DEPLOY_RUN=OWNER_REPORTED_MANUAL_RUN
```

Owner-reported runner warning:

```text
GITHUB_ACTIONS_NODE_WARNING=Node.js 20 is deprecated... actions/checkout@v4, actions/setup-node@v4 are being forced to run on Node.js 24
GITHUB_ACTIONS_NODE_WARNING_CLASSIFICATION=NON_BLOCKING_GITHUB_ACTIONS_RUNNER_ADVISORY_IF_WORKFLOW_SUCCESS
```

This warning is an advisory and should not be treated as deploy failure if the
workflow status is success.

## Production Smoke After GitHub Actions Deploy

Production URL:

`https://web-gia-pha.hungdiepcompany.workers.dev`

Commands run:

- `curl.exe -I https://web-gia-pha.hungdiepcompany.workers.dev/`
- `curl.exe -I https://web-gia-pha.hungdiepcompany.workers.dev/tree`
- `curl.exe -I https://web-gia-pha.hungdiepcompany.workers.dev/auth/login`
- `curl.exe -I https://web-gia-pha.hungdiepcompany.workers.dev/admin`

Observed at `Mon, 29 Jun 2026 04:16:17-04:16:19 GMT`:

```text
ROUTE_/=200
ROUTE_/tree=200
ROUTE_/auth/login=200
ROUTE_/admin=307_REDIRECT_LOGIN
ROUTE_/admin_LOCATION=/auth/login?reason=auth_session_missing!
PRODUCTION_SMOKE_STATUS=PASS
A15E3_STATUS=PASS_GITHUB_ACTIONS_LINUX_DEPLOY_VERIFIED
ROLLBACK_REQUIRED=false
```

No public route returned 500. No authenticated smoke, form submit, cookie
capture, DB write or production data mutation was performed.

## Deployment List Read-Only

Command run:

- `npx wrangler deployments list`

Observed:

```text
WRANGLER_DEPLOYMENTS_LIST_STATUS=PASS_READ_ONLY
CURRENT_ACTIVE_VERSION=f8287634-ecfa-45f6-ac8a-d519e1b4e30b
CURRENT_ACTIVE_CREATED=2026-06-29T04:10:56.111Z
CURRENT_ACTIVE_TRAFFIC=100%
PREVIOUS_KNOWN_GOOD_ROLLBACK_VERSION=4134298b-ef89-4099-b20b-b13995f397c8
```

A-15E3 did not deploy and did not roll back. If future smoke returns 500, owner
should roll back manually to the known good version
`4134298b-ef89-4099-b20b-b13995f397c8`.

## Conclusion

```text
A15E3_STATUS=PASS_GITHUB_ACTIONS_LINUX_DEPLOY_VERIFIED
PRODUCTION_PUBLIC_ROUTES_HEALTH=PASS
ADMIN_AUTH_REDIRECT=PASS
DEPLOY_FROM_WINDOWS_ALLOWED=false
MANUAL_GITHUB_ACTIONS_LINUX_DEPLOY_RECOMMENDED=true
AUTO_DEPLOY_ON_PUSH=false
```

The production smoke after the owner-reported GitHub Actions Linux deploy is
healthy. Keep production deploys on the manual GitHub Actions Linux path. Do not
deploy production from Windows again. Do not enable auto deploy on push yet.
After several manual deploys pass with clean smoke, owner may consider a
separate phase to evaluate auto deploy.

## Runtime Worker Guardrail

- Main Worker touched: NO.
- Runtime dependency added: NO.
- New service Worker created: NO.
- OpenNext/Wrangler config changed: NO.
- Worker size risk: NO.
- Service boundary recommendation: NONE.

## Validation Plan

- `npm run check:env:safe`
- `npm run check:a15e:heritage-ui-production-deploy-readiness-smoke`
- `npm run check:a15e2:production-500-rollback-deploy-failure-diagnostics`
- `npm run check:a15e3:safe-github-actions-linux-production-deploy-verification`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `git diff --cached --check`
