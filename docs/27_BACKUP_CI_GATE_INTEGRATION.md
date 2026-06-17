# Backup CI Gate Integration

## Status

BACKUP_CI_GATE_INTEGRATION_BASELINE

Phase 27 adds a GitHub Actions backup readiness gate that runs local dry-run and fixture checks only. It does not deploy, push, use GitHub secrets, call network/API/DB, create production backup data, upload backup files, restore data, add a schedule, change schema, or mutate real data.

## Production Baseline

- Worker name: `web-gia-pha`
- Current production URL: https://web-gia-pha.hungdiepcompany.workers.dev/
- Deploy workflow: `.github/workflows/cloudflare-deploy.yml`
- Backup pipeline readiness gate: PASS
- Restore dry-run validator: PASS
- Custom domain has not been cut over.
- No production backup job or cron exists.
- No storage target has been selected.

## CI Gate Goal

The goal is to run the safe local backup readiness bundle in GitHub Actions so pull requests and manual checks can catch drift before any real backup automation exists.

The workflow must remain local-only and must not require production configuration.

## Workflow Design

Workflow file:

```text
.github/workflows/backup-readiness.yml
```

Allowed triggers:

- `pull_request`
- `workflow_dispatch`

Forbidden triggers and behavior:

- No `schedule:`
- No deploy step.
- No push step.
- No GitHub `secrets.*`.
- No Cloudflare, Supabase, Google, storage, or production API mutation.

## Commands Included

The workflow runs:

```bash
npm ci
npm run backup:pipeline:readiness
npm run check:backup-pipeline-readiness-gate
npm run check:restore-dry-run-validator
npm run check:backup-manifest-integrity
npm run check:sample-fixture-backup-generator
npm run check:backup-dry-run-command-design
npm run check:backup-ci-gate-integration
```

## What This CI Gate Proves

- Backup dry-run contract still passes.
- Fixture generation and manifest verification still pass.
- Restore dry-run remains `SKIPPED`.
- Pipeline readiness command stays local-only.
- Workflow does not use production secrets or scheduled automation.

## What This CI Gate Does Not Prove

- It does not prove real production backup works.
- It does not prove storage upload works.
- It does not prove Cloudflare, Supabase, Google, or storage provider configuration.
- It does not prove restore production is safe.
- It does not replace a real backup/restore drill after production approval.

## Security And Privacy Guardrails

- Do not use `secrets.*` in this workflow.
- Do not read `.env.local`.
- Do not read `.dev.vars`.
- Do not print secret/token/key values.
- Do not create or upload real backup files.
- Do not restore production.
- Do not add `schedule:`.
- Do not hardcode secret/token/key values.

## Failure Handling

- Treat a failed workflow as readiness drift, not as production data loss.
- Inspect the first failing local command.
- Do not bypass the gate by adding production secrets.
- Do not add deploy or storage upload steps to this workflow.
- Fix the local script or fixture contract in a separate scoped change.

## Acceptance Criteria

PASS when:

- Workflow exists.
- Workflow triggers only on pull request and manual dispatch.
- Workflow runs all required local commands.
- Checker script passes.
- No `schedule:`, `secrets.*`, deploy, push, production backup, storage upload, or restore behavior appears.

FAIL when:

- Workflow uses GitHub secrets.
- Workflow adds a scheduled trigger.
- Workflow deploys or pushes.
- Workflow calls production API/DB/network.
- Workflow creates/uploads production backup data or restores production.

## Phase 27 Boundary

- Do not deploy in Phase 27.
- Do not push.
- Do not change schema.
- Do not create or run migrations.
- Do not mutate real data.
- Do not read `.env.local`.
- Do not read `.dev.vars`.
- Do not call production API/DB/network.
- Do not create/upload production backup files.
- Do not restore production.
- Do not create a real scheduled job.
- Do not add GitHub Actions `schedule:`.
- Do not change real domain or DNS.
- Do not change Cloudflare/Supabase/Google OAuth production config.
- Do not hardcode secret/token/key values.
- Do not commit `.env.local` or `.dev.vars`.
- Do not commit `GIA_PHA_GITHUB_MENU.bat` if it is only the existing out-of-scope working tree change.

## Next Phase

- Phase 28 - Local Sandbox Backup Storage Simulation.
