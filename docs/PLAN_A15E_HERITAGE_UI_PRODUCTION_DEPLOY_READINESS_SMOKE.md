# A-15E - Heritage UI Production Deploy Readiness & Smoke

Status: `SAFE_SKIP_DEPLOY_READINESS_RECORDED_LOCAL`

Marker: `A15E_HERITAGE_UI_PRODUCTION_DEPLOY_READINESS_SMOKE`

## Muc Tieu

A-15E kiem tra readiness de dua chuoi UI heritage A-15A2 den A-15A6 len
production mot cach an toan, dong thoi ghi nhan smoke production read-only neu co
the. Phase nay khong tu dong deploy khi thieu gate bat buoc.

## Pham Vi Production-Safe

Duoc lam:

- kiem tra git/GitHub sync;
- kiem tra `.env.local` ignored;
- kiem tra local env booleans bang checker san co;
- kiem tra production secret readiness o muc ten/boolean neu cong cu cho phep;
- chay local build/readiness checks;
- smoke production read-only cac route chinh neu khong can credential;
- them phase doc/checker/package script va cap nhat handoff.

Khong lam:

- no DB migration;
- no seed;
- no data mutation;
- no env commit;
- no secret log;
- no UI change;
- no auth/runtime/API/service change;
- no production form submit;
- no dependency;
- no OpenNext/Wrangler config change;
- no new service Worker;
- no deploy without `APPROVE_A15E_PRODUCTION_DEPLOY`, verified production secrets
  and owner-confirmed service role rotation.

## Git / GitHub Checklist

```text
GIT_STATUS=PASS_SYNCED_CLEAN
LOCAL_BRANCH=main
LOCAL_ORIGIN_SYNC=0_AHEAD_0_BEHIND
WORKING_TREE_BEFORE_PHASE=CLEAN
UNPUSHED_COMMITS_BEFORE_PHASE=NO
ENV_LOCAL_IGNORED=true
FILES_OUT_OF_SCOPE_MODIFIED=NO
```

Commands run:

- `git status -sb`
- `git log --oneline --decorate -12`
- `git log --oneline origin/main..HEAD`
- `git rev-list --left-right --count HEAD...origin/main`
- `git diff --stat`
- `git diff --cached --stat`
- `git check-ignore -v .env.local`

Result: local `main` and `origin/main` were synchronized before A-15E edits.
No push was needed before readiness recording.

## Env / Secret Checklist

Local safe env checker result:

```text
NEXT_PUBLIC_SUPABASE_URL present
NEXT_PUBLIC_SUPABASE_ANON_KEY present
SUPABASE_SERVICE_ROLE_KEY present
```

Production/Cloudflare check:

```text
PROD_SUPABASE_URL_PRESENT=UNKNOWN
PROD_SUPABASE_ANON_PRESENT=UNKNOWN
PROD_SERVICE_ROLE_PRESENT=UNKNOWN
SERVICE_ROLE_ROTATION_OWNER_CONFIRMED=UNKNOWN
WRANGLER_SECRET_LIST_STATUS=FAIL_WORKER_NOT_FOUND_OR_WRONG_ACCOUNT
```

`npx wrangler secret list` was attempted only to list secret names, but it did
not return a production secret list for `web-gia-pha` in this local context. No
secret value was printed or written.

Because the owner has not confirmed service role key rotation after the earlier
exposure, deployment is blocked:

```text
ENV_SECRET_READINESS_STATUS=SAFE_SKIP_PROD_SECRET_UNKNOWN_AND_ROTATION_UNCONFIRMED
```

## Build / Deploy Checklist

Local build/readiness status after A-15E edits:

```text
BUILD_READINESS_STATUS=PASS_LOCAL
```

Deploy gate status:

```text
OWNER_DEPLOY_MARKER_PRESENT=false
DEPLOY_STATUS=SAFE_SKIP_SECRET_ROTATION_REQUIRED
PRODUCTION_DEPLOY_READINESS_STATUS=SAFE_SKIP_SECRET_ROTATION_REQUIRED
```

Reasons:

- `APPROVE_A15E_PRODUCTION_DEPLOY` was not provided.
- Service role key rotation was not owner-confirmed.
- Production/Cloudflare secret presence could not be verified from this local
  Wrangler context.

No `npm run deploy`, `npm run upload`, `npx wrangler deploy`, GitHub Actions
workflow dispatch or push was run in A-15E.

## Production Smoke Read-Only

Production URL checked:

`https://web-gia-pha.hungdiepcompany.workers.dev`

Existing production route smoke was read-only and did not submit forms, use
credentials, save cookies or mutate data.

```text
PRODUCTION_SMOKE_STATUS=PARTIAL_EXISTING_PRODUCTION_HTTP_READONLY
```

| Route | HTTP status | Result | Notes |
| --- | ---: | --- | --- |
| `/` | 200 | PARTIAL_EXISTING_PRODUCTION_HTTP_READONLY | Public route responded; no forbidden secret/privacy marker count. |
| `/tree` | 200 | PARTIAL_EXISTING_PRODUCTION_HTTP_READONLY | Public route responded; no forbidden secret/privacy marker count. |
| `/auth/login` | 200 | PARTIAL_EXISTING_PRODUCTION_HTTP_READONLY | Login route responded; no form submit. |
| `/admin` | 307 | SAFE_REDIRECT_TO_LOGIN | Protected route redirected to `/auth/login` without authenticated smoke material. |
| `/admin/genealogy` | 200 | PARTIAL_EXISTING_PRODUCTION_HTTP_READONLY | Existing production response only; not authenticated proof. |
| `/people/[slug]` | not run | SAFE_SKIP_NO_PUBLICLY_VISIBLE_PROFILE | No safe public slug was selected in this phase. |

Forbidden marker count was `0` for checked markers including `notes_private`,
`service_role`, `sb_secret_`, bearer token and signed URL markers.

This smoke does not prove the new A-15A2-A15A6 heritage UI was deployed because
A-15E did not deploy.

## Deployment Result

```text
DEPLOY_RESULT=NOT_RUN
DEPLOY_STATUS=SAFE_SKIP_SECRET_ROTATION_REQUIRED
```

No production deploy was attempted.

## Next Steps

Before any deploy phase:

1. Owner confirms service role key has been rotated after prior exposure.
2. Owner updates Cloudflare/GitHub production secret/env with rotated values.
3. Owner confirms `APPROVE_A15E_PRODUCTION_DEPLOY`.
4. Re-run A-15E readiness.
5. If all gates pass, deploy through the existing approved Cloudflare/GitHub
   Actions path or documented `npm run deploy` path, then smoke production again.

## Runtime Worker Guardrail

- Main Worker touched: NO.
- Runtime dependency added: NO.
- New service Worker created: NO.
- OpenNext/Wrangler config changed: NO.
- Worker size risk: NO.
- Service boundary recommendation: NONE.

## Validation Plan

- `npm run check:env:safe`
- `npm run check:a15a2:modern-vietnamese-genealogy-tree-editor-ui`
- `npm run check:a15a3:vietnamese-heritage-public-tree-view-ui`
- `npm run check:a15a4:vietnamese-heritage-family-list-admin-dashboard-ui`
- `npm run check:a15a5:member-profile-person-detail-vietnamese-heritage-ui`
- `npm run check:a15a6:add-edit-member-form-vietnamese-heritage-ux`
- `npm run check:a15b:authenticated-heritage-ui-browser-smoke`
- `npm run check:a15c:owner-admin-session-permission-smoke-readiness`
- `npm run check:a15b1:authenticated-admin-heritage-ui-browser-smoke-rerun`
- `npm run check:a15c2:supabase-auth-browser-session-binding-diagnostics`
- `npm run check:a15b2:manual-authenticated-admin-heritage-ui-smoke`
- `npm run check:a15e:heritage-ui-production-deploy-readiness-smoke`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`
