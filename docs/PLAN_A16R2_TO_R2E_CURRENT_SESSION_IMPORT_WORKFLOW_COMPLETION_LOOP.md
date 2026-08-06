# A-16R2 to R2E Current Session Import Workflow Completion Loop

Status: `SOURCE_WORKFLOW_IMPLEMENTED_OFFICIAL_IMPORT_LOCKED`

Date: 2026-08-03

## Scope

This phase connects the Gia Pha 4 Excel import workflow on `/admin/exports/import`
from a newly uploaded staging session through source-level official import
readiness.

The workflow is intentionally session-explicit:

1. Upload Gia Pha 4 Excel to staging.
2. Receive the created `sessionId` in the upload response.
3. Navigate to `/admin/exports/import?sessionId=<UUID>`.
4. Server page reads only the explicit URL session.
5. Manifest, validation, warning review, dry-run, duplicate review, mapping
   preview, owner approval and readiness all derive from that current session.

The historical A-16R session `2af4bfb6-a20e-453e-9804-1b8c0afbdd68` remains
audit evidence only and is not a runtime gate for the current import workflow.

## Safety Boundary

- `OFFICIAL_IMPORT_EXECUTED=NO`
- `TRANSACTION_EXECUTOR_CALL_COUNT=0`
- `RUNTIME_GENEALOGY_MUTATION=NONE`
- `PRODUCTION_MUTATION=NONE`
- `MIGRATIONS_CREATED=NO`
- `MIGRATIONS_APPLIED=NO`
- `PUSH_RUN=NO`
- `DEPLOY_RUN=NO`
- `COMMIT_CREATED=NO`

No official-import API was called during this source phase. The new warning
acknowledgement route was added as source, but was not executed by Codex.

## Implementation Summary

- Upload response now exposes top-level current-session identifiers and staging
  counts while preserving the existing summary payload.
- The upload form binds the created session into the URL instead of only
  refreshing transient React/server state.
- `/admin/exports/import` no longer uses a latest-session fallback or a
  historical A-16R session runtime gate.
- The manifest panel accepts the explicit current session and derives workflow
  gates from that session.
- Warning review groups are built from current manifest warnings and
  acknowledgements are bound to `sessionId`, `manifestId`, staging version,
  warning group, actor and policy marker.
- Validation summaries expose `sessionId`, `manifestId`, `stagingVersion` and
  separated blocker counts.
- Dry-run approval no longer compares against the historical A-16R session.
- Owner approval marker and route builders are session-dynamic.
- Official import confirmation markers are session-dynamic, while the UI remains
  disabled in this phase.
- Legacy Excel/family JSON tools are separated from the primary current-session
  workflow.
- A focused static checker verifies current-session continuity, no latest
  fallback, dynamic approval, warning version binding, disabled official import
  and zero executor calls.

## Validation Evidence

Passed:

- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npm.cmd run build`
- `npm.cmd run check:a16r2-to-r2e-current-session-import-workflow-completion-loop`
- `git diff --check`

Legacy checker boundary:

- `check:a16i-upload-parse-giapha4-manifest-staging`
- `check:a16g-import-session-read-manifest-runtime`
- `check:a16j-manifest-staging-review-validation-warnings`
- `check:a16l-dry-run-mapping-preview`
- `check:a16i5-import-review-pack-official-import-gate`

These older checkers fail on their frozen allowlists because the inherited
worktree includes A17/Auth/guard/artifact changes and this phase deliberately
adds a warning acknowledgement route. They do not establish a current-session
behavioral failure; the focused A-16R2 checker is authoritative for this phase.

## Remaining Gates

The final official import remains blocked until a separate
`A-16R3_OWNER_GATED_OFFICIAL_IMPORT_EXECUTION` phase proves production deploy,
production RPC contract, final owner approval, idempotency and post-import
verification conditions.

Next allowed phase:

`A-16R3_OWNER_GATED_OFFICIAL_IMPORT_EXECUTION`
