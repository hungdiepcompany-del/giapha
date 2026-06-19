# Phase 129 - Authenticated Production Smoke Runbook

Status: `SAFE_SKIP_MISSING_EXPLICIT_AUTHENTICATED_SMOKE_ENV`

## Summary

Phase 129 provides an owner/operator runbook for a future authenticated
production smoke against the deployed GIA PHẢ application.

This phase is documentation and static-checker work only. It does not run an
authenticated smoke, request credentials, create a test account, change auth
or permission logic, deploy, mutate data or expand runtime behavior.

## Scope

In scope:

- Define owner/operator prerequisites.
- Define shell-only authentication material handling.
- Define safe-skip, pass and fail outcomes.
- Define authenticated route, role/permission, privacy, small JSON export and
  Vietnamese UI smoke matrices.
- Define no-go, incident and escalation guidance.
- Add a static checker for this runbook.

Out of scope:

- Automated authenticated smoke implementation.
- Account/session creation.
- Auth or permission changes.
- Write, import, restore, backup execution or data mutation.
- New runtime, Worker, dependency, deployment or configuration work.

## Production URL

`https://web-gia-pha.hungdiepcompany.workers.dev`

## Current Status From Phase 128

- Production deploy: PASS.
- Deployed source commit:
  `692920a5ba8779cde2d77bcf3fa8e5806cbc18aa`.
- Public smoke: PASS for `/`, `/tree` and `/auth/login`.
- Vietnamese public UI copy: PASS.
- Public tree admin-warning/privacy marker review: PASS.
- Authenticated smoke:
  `SAFE_SKIP_MISSING_EXPLICIT_AUTHENTICATED_SMOKE_ENV`.

## Why Authenticated Smoke Was Safe-Skipped

Phase 128 did not have explicit authenticated-smoke material in the Codex
execution process. No session, cookie, token or test identity was requested or
read.

Safe-skip occurred before authenticated route requests. This is the required
behavior when owner/operator prerequisites are incomplete.

## Required Owner/Operator Prerequisites

Before a future authenticated smoke:

- Confirm the production URL and deployed commit/version.
- Use a dedicated approved account or an existing operator account.
- Confirm the account role and expected permission set.
- Confirm the account is allowed to access production.
- Confirm the smoke is read-only except for a normal login/session lifecycle.
- Prepare authentication material only in the current local shell or an
  approved secure secret store.
- Confirm no terminal transcript, screen share, CI output or command history
  will expose authentication material.
- Confirm rollback/escalation owner and production monitoring access.
- Confirm export smoke will download only a small `family.json` and will not
  commit, paste or retain it in an unsafe location.

Do not create a new test account in Phase 129.

## Shell-Only Env Policy

Credential and test material may exist only in the current local shell or an
approved secure secret store. Never paste real values into chat, docs, issues,
source files, shell scripts committed to Git or screenshots.

Safe PowerShell placeholders:

```powershell
$env:PROD_SMOKE_BASE_URL="https://web-gia-pha.hungdiepcompany.workers.dev"
$env:PROD_AUTH_SMOKE_ENABLED="1"
$env:PROD_AUTH_SMOKE_USER_EMAIL="<set-in-shell-only>"
$env:PROD_AUTH_SMOKE_SESSION="<set-in-shell-only>"
```

The placeholders are examples only. They do not define a new runtime contract
or authorize an automated request. A future execution phase must use an
existing approved smoke script or a separately reviewed operator procedure.

If required environment is missing, record:

`SAFE_SKIP_MISSING_EXPLICIT_AUTHENTICATED_SMOKE_ENV`

Then stop before authenticated network requests.

After the operator run, clear all temporary shell variables and close any
temporary authenticated browser/session context.

## Forbidden Credential Handling

Never:

- Ask the owner to paste authentication material into chat.
- Write session, cookie, token, password, key or full authorization header
  values into docs or logs.
- Read `.env.local`, `.dev.vars` or unrelated credential files for this smoke.
- Print request headers or authenticated response bodies.
- Put authentication material in command arguments that are persisted by shell
  history when a safer prompt/secret-store method is available.
- Commit downloaded `family.json` or any production response containing private
  data.
- Reuse smoke material outside the approved production URL.

Only names, boolean presence checks, route labels, status codes and sanitized
PASS/FAIL/SAFE_SKIP summaries may be recorded.

## Authenticated Smoke Checklist

- Login/auth page is reachable.
- Approved login flow completes without exposing secrets.
- Authenticated dashboard loads.
- Displayed user identity matches the expected operator account.
- Permission-denied page works for an account missing a required permission.
- Admin navigation does not show unauthorized actions.
- `/admin/people` is accessible only with `people.view`.
- People create/update/delete/restore controls follow their matching
  `people.*` permissions.
- `/admin/relationships` is accessible only with `relationships.view`.
- Genealogy admin pages are accessible only with their existing guarded
  permissions.
- `/admin/tree` is accessible only with `tree.view`.
- `/admin/tree/edit` requires `tree.view` and `tree.edit_layout`.
- `/admin/exports` and download routes require `exports.download`.
- Small `family.json` export includes required metadata and lineage sections.
- `/admin/revisions` requires `revisions.view`.
- `/admin/system/status` requires `settings.manage` or
  `permissions.manage` and displays only yes/no configuration state.
- Public/non-admin paths do not expose private fields, source notes, hidden
  relationship facts, admin warning UI or authentication/storage material.
- Authenticated pages retain Vietnamese UI copy with diacritics.
- Logout ends the operator session safely.

## Role/Permission Smoke Matrix

| Scenario | Expected permission | Expected result |
| --- | --- | --- |
| Open admin dashboard | `people.view` | PASS with dashboard; otherwise redirect/login or permission denial |
| View people list | `people.view` | PASS only for permitted account |
| Create person | `people.create` | Create control visible/usable only when approved; do not execute mutation in this smoke |
| Update person | `people.update` | Edit control available only when approved; do not save |
| Delete or restore person | `people.delete` / `people.restore` | Controls absent or denied without matching permission; do not execute |
| View relationships | `relationships.view` | PASS only for permitted account |
| Create relationship | `relationships.create` | Control gated; do not submit mutation |
| View admin tree | `tree.view` | PASS only for permitted account |
| Open tree editor | `tree.view` and `tree.edit_layout` | PASS only when both permissions are present |
| Download export | `exports.download` | Route allowed only for permitted account |
| View revisions | `revisions.view` | PASS only for permitted account |
| View system status | `settings.manage` or `permissions.manage` | Yes/no config state only |
| Insufficient permission | Missing target permission | `/unauthorized` or safe denial; no protected content |

This matrix verifies existing authorization behavior. It does not authorize
role, permission or account changes.

## Privacy Smoke Matrix

| Surface | Required check | PASS condition |
| --- | --- | --- |
| Public home | No admin/private payload | Public-safe content only |
| Public tree | No private notes or admin warning UI | No private/admin-only markers in page content |
| Public profile | Living-person/privacy rules | No full private fields or internal notes |
| Admin people | Private data restricted to permitted user | Route denied without permission |
| Relationships | Hidden facts remain protected | No unauthorized relationship detail |
| Genealogy | Source notes remain protected | Non-admin/public response omits source notes |
| Tree editor | Admin-only operation | Public/non-editor account cannot access |
| System status | Secret-safe output | Configuration presence only, never raw values |
| Error pages | No sensitive diagnostic output | No token, key, stack or private response body |

Privacy smoke is read-only. Do not alter visibility or production records to
manufacture test cases.

## JSON Export Smoke Matrix

| Check | Expected result |
| --- | --- |
| Permission gate | Download allowed only with `exports.download` |
| File scope | Small `family.json` only |
| Metadata | `schema_version`, `app_export_version`, `exported_at`, `export_scope`, `privacy_scope` present |
| Lineage sections | `clans`, `clan_branches`, `generation_rules`, `person_branch_memberships` present |
| Manifest | Lineage counts included |
| Admin mode | Full authorized admin export only |
| Non-admin/public builder behavior | Hidden rows filtered; private/source notes removed; non-admin layout coordinates omitted |
| Unsupported scope | No media, large GEDCOM, ZIP, backup/restore or import expansion |
| Artifact handling | Do not commit, paste or upload downloaded production data |

If the operator cannot safely inspect the export without exposing production
data, record SAFE_SKIP for the export portion.

## Vietnamese UI Smoke Matrix

| Surface | Expected Vietnamese copy |
| --- | --- |
| Login | Vietnamese heading, labels, buttons, helper/error states |
| Admin shell | Vietnamese navigation and identity labels |
| Dashboard | Vietnamese section headings and action labels |
| People | Vietnamese fields, visibility labels and empty/error states |
| Relationships | Vietnamese relationship labels and actions |
| Genealogy | Vietnamese clan/branch/generation/membership labels |
| Tree viewer/editor | Vietnamese toolbar, side panel and state labels |
| Export/import preview | Vietnamese labels, validation and conflict states |
| Revisions/system status | Vietnamese headings, filters and status labels |
| Unauthorized | Vietnamese permission-denied heading and reason |

Internal route names, permission keys, enums, API fields, JSON keys, database
names, environment names and code identifiers remain English.

## Expected PASS/FAIL/SAFE_SKIP Statuses

`PASS`

- Explicit shell-only prerequisites are present.
- Approved account identity and expected permissions are known.
- Required routes behave as expected.
- No privacy or credential exposure is observed.
- No production mutation is performed.

`FAIL`

- Authenticated route returns an unexpected server error.
- Identity or permission behavior differs from the expected account.
- Protected content is accessible without permission.
- Private/source information appears on public/non-admin surfaces.
- Raw authentication material or secrets appear in output.
- Small JSON export violates the approved scope or privacy contract.

`SAFE_SKIP_MISSING_EXPLICIT_AUTHENTICATED_SMOKE_ENV`

- Any required explicit shell-only prerequisite is missing.
- Account role/permission expectation is unknown.
- The operator cannot prevent credential or production-data exposure.
- The approved smoke procedure/script is unavailable.

SAFE_SKIP is honest incomplete evidence, not PASS.

## No-Go Conditions

Stop without authenticated requests if:

- Required shell-only environment is missing.
- Authentication material came from chat, docs, committed files or an
  unapproved source.
- The account identity or role is uncertain.
- The production URL does not match the approved target.
- The deployed commit/version is uncertain.
- A request would write, import, restore, delete, seed or backfill data.
- The procedure would expose request headers or authenticated response bodies.
- Public smoke already shows a privacy or server-error regression.
- The only available path requires auth/permission code, schema, Worker,
  config, dependency or deploy changes.

## Incident Rollback/Escalation Notes

If authenticated smoke fails:

- Stop further authenticated requests.
- Preserve only sanitized route/status/timestamp evidence.
- Do not paste headers, response bodies or authentication material.
- Check Cloudflare and GitHub Actions logs for the deployed commit.
- Check Supabase Auth redirect/session configuration before changing roles or
  database rows.
- Confirm server-side permission expectations from
  `docs/04_PERMISSION_PRIVACY_MODEL.md`.
- If production impact is broad, use the existing Cloudflare deployment
  rollback path from the production operations runbook.
- Do not run emergency migrations or permission reassignment as a first
  response.
- Rotate authentication material if exposure is suspected.
- Escalate with sanitized symptom, route, HTTP status, expected permission,
  deployed commit and time.

## Explicitly Not Done

- No authenticated smoke run without explicit shell-only environment.
- No credential requested.
- No secret written to docs/chat.
- No test account created.
- No deploy.
- No push.
- No migration.
- No `.sql`.
- No DB apply.
- No SQL mutation.
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

Recommended next phase: an owner/operator authenticated production smoke
execution phase only after explicit shell-only prerequisites are prepared.
Otherwise continue routine production monitoring and keep the authenticated
result at `SAFE_SKIP_MISSING_EXPLICIT_AUTHENTICATED_SMOKE_ENV`.
