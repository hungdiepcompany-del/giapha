# Phase 131 - Production Monitoring and Authenticated Smoke Preparation

Status: `PRODUCTION_MONITORING_AUTH_SMOKE_PREP_READY`

## Summary

Phase 131 records lightweight production monitoring evidence and prepares the
next authenticated smoke retry without running authenticated requests.

This phase is docs and static-checker work only. It does not request
credentials, read credential files, run authenticated smoke, deploy, mutate
data, change runtime behavior, expand export/import paths or change Worker
configuration.

Production URL:

`https://web-gia-pha.hungdiepcompany.workers.dev`

## Scope

In scope:

- Record the current public production monitoring status.
- Keep Phase 130 authenticated smoke status honest and blocked.
- Define public monitoring, Vietnamese UI and privacy checklists.
- Define authenticated smoke prerequisites for a future retry.
- Provide shell-only environment placeholders and cleanup commands.
- Add a static checker that guards the preparation document and phase scope.

Out of scope:

- Authenticated smoke execution.
- Credential request, capture, logging or storage.
- Deploy, push, migration, SQL, DB/data mutation or schema change.
- Auth or permission logic changes.
- Export/import runtime expansion, GEDCOM, ZIP, media or backup runtime.
- Worker creation, OpenNext/Wrangler config changes or dependency changes.

## Current Production Status

Result: PASS for lightweight public monitoring.

Prerequisite gate:

- Local `main` and `origin/main` synchronized before public monitoring: PASS.
- Worktree clean before public monitoring: PASS.
- Production URL reachable: PASS.

Public route results:

| Route | HTTP | Vietnamese copy | Server error review | Privacy/runtime marker review |
| --- | --- | --- | --- | --- |
| `/` | 200 | PASS, contains `Gia pha` rendered copy | PASS | PASS |
| `/tree` | 200 | PASS, contains public tree copy | PASS | PASS |
| `/auth/login` | 200 | PASS, contains login copy | PASS | PASS |

The public monitoring used only unauthenticated GET requests to public routes.
It did not access admin routes, export downloads, credential material or
private production data.

## Current Authenticated Smoke Status

Current authenticated smoke status remains:

`PHASE_130_BLOCKED_MISSING_EXPLICIT_AUTHENTICATED_SMOKE_ENV`

Phase 131 does not upgrade this status. Public route monitoring and static
checks are not authenticated smoke evidence.

If a future authenticated smoke attempt is missing required explicit
shell-only environment, record:

`SAFE_SKIP_MISSING_EXPLICIT_AUTHENTICATED_SMOKE_ENV`

Then stop before authenticated network requests.

## Public Monitoring Checklist

For routine public monitoring, check:

- `/` returns HTTP 200.
- `/tree` returns HTTP 200.
- `/auth/login` returns HTTP 200.
- Public pages show Vietnamese user-visible copy.
- Responses do not show obvious server errors.
- `/tree` does not show admin warning UI.
- `/tree` does not expose `notes_private`.
- `/tree` does not expose `source_note`.
- Public responses do not expose token, key, session, cookie, authorization or
  signed URL material.
- Login route is reachable and remains unauthenticated-safe.

Public monitoring must not be treated as permission, role or authenticated
privacy verification.

## Lightweight Production Health Checklist

- Confirm production URL resolves and responds.
- Confirm only public routes are fetched without authenticated material.
- Confirm no 500-style error page, stack trace or framework diagnostic appears.
- Confirm no credential-looking output is logged or copied into docs.
- Confirm the deployed Worker name remains `web-gia-pha` when checking
  Cloudflare manually.
- Confirm any incident notes include only route, status, time and sanitized
  symptoms.

## Vietnamese UI Monitoring Checklist

- Home page keeps Vietnamese public copy.
- Public tree page keeps Vietnamese public tree labels and empty states.
- Login page keeps Vietnamese heading, button and helper/error copy.
- User-visible copy remains Vietnamese with diacritics where rendered by the
  app.
- Internal names remain unchanged: route names, permission keys, env names,
  API fields, database names and JSON keys.

## Privacy Monitoring Checklist

- Public tree response must not contain admin warning UI markers.
- Public tree response must not contain `notes_private`.
- Public tree response must not contain `source_note`.
- Public responses must not contain signed URLs.
- Public responses must not contain session, cookie, token, key or
  authorization values.
- Public monitoring must not fetch admin pages with authenticated material.
- Error responses must not expose stack traces, raw env values or private
  Supabase details.

## Small JSON Export Monitoring Note

Small `family.json` export remains an authenticated, permission-gated runtime
surface. Phase 131 does not download a production export and does not inspect
production export content.

A future authenticated smoke may verify the small JSON export only when:

- The operator has explicit owner approval for the retry.
- The account has `exports.download`.
- The export is handled as production data.
- The artifact is not pasted into chat, committed, uploaded to an unsafe
  location or retained beyond the approved smoke procedure.
- The check remains limited to small `family.json`; no GEDCOM, ZIP, media,
  backup/restore or large export runtime is attempted.

## Authenticated Smoke Prerequisite Checklist

Retry Phase 130 only when all prerequisites are true:

- Local `main` and `origin/main` are synchronized.
- Worktree is clean.
- Production URL is reachable.
- Phase 129 authenticated smoke runbook still passes.
- Phase 130 authenticated smoke result checker exists and passes.
- All shell-only env names are present in the execution process.
- Credential values are not printed, pasted, logged or written to files.
- Owner explicitly approves the retry scope, target URL and timing.
- Operator is ready to clear temporary shell env after the run.
- The retry remains read-only except for normal login/session lifecycle.

Static checks and public monitoring must not be promoted to authenticated
PASS.

## Shell-Only Env Preparation Guide

Use placeholders in docs only. Real values must be set only in the local shell
or an approved secure secret store.

Safe PowerShell placeholder shape:

```powershell
$env:PROD_SMOKE_BASE_URL="https://web-gia-pha.hungdiepcompany.workers.dev"
$env:PROD_AUTH_SMOKE_ENABLED="1"
$env:PROD_AUTH_SMOKE_USER_EMAIL="<set-in-shell-only>"
$env:PROD_AUTH_SMOKE_SESSION="<set-in-shell-only-if-supported>"
```

Clear temporary shell variables after the operator run:

```powershell
Remove-Item Env:PROD_AUTH_SMOKE_ENABLED -ErrorAction SilentlyContinue
Remove-Item Env:PROD_AUTH_SMOKE_USER_EMAIL -ErrorAction SilentlyContinue
Remove-Item Env:PROD_AUTH_SMOKE_SESSION -ErrorAction SilentlyContinue
```

Do not read `.env.local` or `.dev.vars` for authenticated smoke preparation.
Do not write real session, cookie, token, key, password or authorization
material into docs, scripts, issue comments, terminal transcripts or Git.

## Safe Retry Plan For Phase 130

1. Confirm Git sync and clean worktree.
2. Run the Phase 129 runbook checker and Phase 130 result checker.
3. Confirm the production URL responds on public routes.
4. Confirm owner approval for the specific retry.
5. Confirm required shell-only env names are present by boolean only.
6. If any required env is missing, record
   `SAFE_SKIP_MISSING_EXPLICIT_AUTHENTICATED_SMOKE_ENV` and stop before
   authenticated network requests.
7. If all gates pass, run only the separately approved authenticated smoke
   procedure.
8. Record sanitized PASS/FAIL evidence only: route labels, status codes and
   high-level observations.
9. Clear temporary shell env after the run.

## No-Go Conditions

Do not start an authenticated smoke retry when:

- Local branch and `origin/main` are not synchronized.
- Worktree is dirty with unrelated or risky changes.
- Production URL is unreachable.
- Owner approval is absent or ambiguous.
- Required shell-only env is missing.
- Any credential value would need to be pasted into chat, docs or committed
  files.
- The retry would require schema, migration, DB mutation, seed/backfill or
  runtime/auth/permission code changes.
- The retry would expand export/import, GEDCOM, ZIP, media, backup or Worker
  behavior.

## Incident Response Notes

If public monitoring fails:

- Record route, HTTP status, timestamp and sanitized symptom.
- Check Cloudflare Worker logs without copying secrets.
- Check GitHub Actions deploy history and deployed commit.
- Check Supabase/Auth configuration through presence/status only.
- Do not run emergency migrations or mutate production data as a first
  response.
- Roll back first if user-facing impact is broad and a previous stable
  deployment is available.

If authenticated smoke later fails:

- Stop the smoke and preserve sanitized evidence.
- Clear temporary shell env when safe.
- Do not paste response bodies that may contain private data.
- Triage permission, auth redirect and privacy boundaries before changing
  runtime code.

## Rollback/Escalation Notes

- Use Cloudflare deployment history or the existing manual GitHub Actions
  deploy path for rollback decisions.
- Keep previous stable commit and deployment identifiers in incident notes.
- Escalate to owner before changing production secrets, Supabase Auth settings,
  permissions or database state.
- Do not use database edits as rollback shortcuts.
- Do not deploy a new fix without a separate owner-approved deploy phase.

## Checker Result

Checker added:

`npm run check:production-monitoring-auth-smoke-prep`

The checker verifies this preparation document, package script registration,
credential-safety wording, dependency stability and phase boundary guardrails.

## Explicitly Not Done

- No authenticated smoke run.
- No credential requested.
- No secret printed or written.
- No deploy.
- No push.
- No migration.
- No `.sql`.
- No DB apply.
- No SQL/data mutation.
- No seed/backfill.
- No schema change.
- No auth/permission logic change.
- No export/import runtime expansion.
- No GEDCOM/ZIP/media/backup runtime.
- No Worker created.
- No OpenNext/Wrangler config change.
- No runtime dependency added.
- `PLANNING.MD` not read, modified or committed.

## Recommended Next Phase

Recommended next phase: retry Phase 130 authenticated production smoke only
after owner/operator prepares explicit shell-only env in the Codex execution
process and explicitly approves the retry. Otherwise continue routine public
production monitoring.
