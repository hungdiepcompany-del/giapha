# Restore Dry-Run Validator

## Status

RESTORE_DRY_RUN_VALIDATOR_BASELINE

Phase 25 adds a restore dry-run validator for backup automation readiness. It reads only the sample fixture and manifest under `fixtures/backup/`, validates graph and privacy shape, and prints a simulated restore readiness result. It does not read env files, call network/API/DB, upload files, restore data, deploy, push, change schema, or mutate real data.

## Production Baseline

- Production URL remains unchanged.
- No custom domain cutover is performed in this phase.
- No scheduled backup job or cron is created in this phase.
- No production backup file is created or uploaded.
- No real restore action is performed.

## Restore Dry-Run Goal

The goal is to prove that backup payload shape can be validated before any restore implementation exists.

The command must print `RESTORE_DRY_RUN_ONLY`.

## Input Files

- Fixture: `fixtures/backup/sample-family.fixture.json`
- Manifest: `fixtures/backup/sample-family.manifest.fixture.json`

The validator should be run after:

```bash
npm run backup:fixture:generate
npm run backup:fixture:verify
```

## Validation Scope

The dry-run validates:

- Manifest and fixture are fixture-only.
- Fixture checksum matches the manifest.
- Person IDs are unique.
- Family IDs are unique.
- Parent/child relationship references exist.
- Parent/child relationship family references exist.
- Expected sample members have parent coverage.
- Visibility values are known.
- Living/private fields are typed.
- Privacy flags are present and boolean.
- No secret-like strings exist.

## Restore Simulation

The command builds an in-memory plan only:

- Count people that would be validated.
- Count family records that would be validated.
- Count relationship edges that would be validated.
- Confirm fixture is not a production backup.
- Confirm restore execution is blocked by design.

No database write, delete, upsert or overwrite is allowed in this phase.

## Command

Run:

```bash
npm run restore:dry-run
```

Expected safe output:

```text
[restore:dry-run] RESTORE_DRY_RUN_ONLY
[restore:dry-run] Manifest integrity: PASS
[restore:dry-run] Graph validation: PASS
[restore:dry-run] Privacy validation: PASS
[restore:dry-run] Restore execution: SKIPPED
[restore:dry-run] Result: PASS
```

## Secret/Privacy Guardrails

- Do not read `.env.local`.
- Do not read `.dev.vars`.
- Do not print secret/token/key values.
- Do not include real family data.
- Do not import fixture data into production.
- Do not overwrite current production data.
- Treat this command as validation only.

## PASS/FAIL Criteria

PASS when:

- Manifest integrity passes.
- Fixture graph is internally consistent.
- Privacy fields are valid.
- Secret pattern scan passes.
- Output includes `Restore execution: SKIPPED`.
- The command prints `RESTORE_DRY_RUN_ONLY`.

FAIL when:

- Fixture or manifest file is missing.
- Checksum does not match.
- Relationship references are broken.
- Private/living fields are malformed.
- Secret-like values are detected.
- Script tries to read env files, call external services, or write data.

## Phase 25 Boundary

- Do not deploy in Phase 25.
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

- Phase 26 - Backup Pipeline Readiness Gate.
