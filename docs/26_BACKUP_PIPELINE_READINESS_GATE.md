# Backup Pipeline Readiness Gate

## Status

BACKUP_PIPELINE_READINESS_GATE_BASELINE

Phase 26 adds a local readiness gate that runs the safe backup automation checks in order. It does not read env files, call network/API/DB, upload files, restore data, create cron jobs, change schema, or mutate real data.

## Production Baseline

- Production URL remains unchanged.
- No custom domain cutover is performed in this phase.
- No scheduled backup job or cron is created in this phase.
- No production backup file is created or uploaded.
- No real restore action is performed.

## Pipeline Goal

The goal is to provide one local command that proves the backup automation readiness bundle is internally consistent before any real backup job exists.

The command must print `PIPELINE_READINESS_ONLY`.

## Pipeline Steps

The gate runs these safe local commands in order:

1. `npm run backup:dry-run`
2. `npm run backup:fixture:generate`
3. `npm run backup:fixture:verify`
4. `npm run restore:dry-run`
5. `npm run test:m2a-private-r2-recoverability-fixture`
6. `npm run check:m2a-private-r2-recoverability`

Each step must pass before the next step is accepted.

## Command

Run:

```bash
npm run backup:pipeline:readiness
```

Expected safe output:

```text
[backup:pipeline:readiness] PIPELINE_READINESS_ONLY
[backup:pipeline:readiness] backup:dry-run: PASS
[backup:pipeline:readiness] backup:fixture:generate: PASS
[backup:pipeline:readiness] backup:fixture:verify: PASS
[backup:pipeline:readiness] restore:dry-run: PASS
[backup:pipeline:readiness] test:m2a-private-r2-recoverability-fixture: PASS
[backup:pipeline:readiness] check:m2a-private-r2-recoverability: PASS
[backup:pipeline:readiness] Result: PASS
```

## Safety Boundary

The gate only coordinates existing safe scripts:

- `backup:dry-run` uses mock/static data in memory.
- `backup:fixture:generate` writes sample fixture files only.
- `backup:fixture:verify` verifies fixture manifest integrity only.
- `restore:dry-run` validates fixture restore readiness only and keeps execution `SKIPPED`.
- The M2A recoverability test uses an in-memory R2-compatible fake only. It accepts
  the exact `SAMPLE_FIXTURE_ONLY` SHA-256 allowlist, never creates a bucket or a
  persistent object, and exercises AES-256-GCM tamper failure locally.
- The fixture binding is isolated to named `fixture-local`; `remote: false` is a
  local-development behavior, not deploy authorization. The pipeline never runs a
  Wrangler deploy or remote resource action.

## Secret/Privacy Guardrails

- Do not read `.env.local`.
- Do not read `.dev.vars`.
- Do not print secret/token/key values.
- Do not include real family data.
- Do not import fixture data into production.
- Do not overwrite current production data.
- Treat this gate as local readiness only.

## PASS/FAIL Criteria

PASS when:

- All six safe local commands pass.
- Output includes `PIPELINE_READINESS_ONLY`.
- Output shows each step as `PASS`.
- No secret-like values are printed.

FAIL when:

- Any step exits non-zero.
- Fixture generation or verification fails.
- Restore dry-run does not keep execution skipped.
- Script tries to read env files, call external services, or write production data.

## Phase 26 Boundary

- Do not deploy in Phase 26.
- Do not push.
- Do not change schema.
- Do not create or run migrations.
- Do not mutate real data.
- Do not read `.env.local`.
- Do not read `.dev.vars`.
- Do not create a real scheduled job.
- Do not create/upload a production backup.
- Do not restore production.
- Do not hardcode secret/token/key values.

## Next Phase

- Phase 27 - Backup CI Gate Integration, or Sandbox Storage Upload Prototype if storage target is confirmed.
