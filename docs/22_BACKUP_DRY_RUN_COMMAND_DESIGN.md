# Backup Dry-Run Command Design

## Status

BACKUP_DRY_RUN_COMMAND_DESIGN_BASELINE

Phase 22 adds a local dry-run command that simulates backup readiness with static mock data only. It does not read env files, call network/API/DB, create a production backup, upload files, restore data, deploy, push, change schema, or mutate real data.

## Production Baseline

- Worker name: `web-gia-pha`
- Current production URL: https://web-gia-pha.hungdiepcompany.workers.dev/
- Deploy workflow: `.github/workflows/cloudflare-deploy.yml`
- Phase 16 status: PASS
- Phase 17 status: PASS
- Phase 18 status: PASS_WITH_NOTES
- Phase 19 status: PASS_WITH_NOTES
- Phase 20 status: PASS_WITH_NOTES
- Phase 21 status: PASS_WITH_NOTES
- Google OAuth production login: PASS by manual user test
- Basic production route smoke: PASS by manual user test
- Automated production smoke with `PROD_SMOKE_BASE_URL`: previously PASS

Known notes:

- Direct `npm run build` in the workspace can fail when old `.next` artifacts are locked by Windows ACL/EPERM.
- Clean temp build has passed in prior phases.
- `npm audit --audit-level=moderate` currently reports known advisory findings; do not run `npm audit fix --force`.
- `GIA_PHA_GITHUB_MENU.bat` is modified outside Phase 22 scope and must not be staged or committed.
- Custom domain has not been cut over.

## Dry-Run Goal

The dry-run command proves the local backup automation contract can validate:

- A mock backup filename.
- A mock manifest shape.
- A naming convention.
- A secret-like pattern scan.
- A restore compatibility checklist.

It is intentionally not a real backup command and must print `DRY_RUN_ONLY`.

## Dry-Run Command Scope

Command:

```bash
npm run backup:dry-run
```

Allowed behavior:

- Use static mock data in memory.
- Generate a mock backup filename.
- Generate a mock manifest.
- Validate manifest shape.
- Validate naming convention.
- Scan mock output for secret-like strings.
- Simulate restore compatibility checks.
- Print a result summary.

Forbidden behavior:

- Do not read `.env.local`.
- Do not read `.dev.vars`.
- Do not call production API/DB/network.
- Do not create real backup files.
- Do not upload files.
- Do not restore data.
- Do not print secret/token/key values.

## Manifest Shape Requirement

The mock manifest must include:

- `project`
- `environment`
- `backup_type`
- `created_at`
- `app_commit`
- `production_url`
- `contains_real_data`
- `contains_secret`
- `operator`
- `notes`
- record counts
- restore compatibility checklist result

For dry-run, `environment` must be `dry-run`, `contains_real_data` must be `false`, and `contains_secret` must be `false`.

## Naming Convention Requirement

The mock filename must follow:

```text
gia-pha-backup-YYYYMMDD-HHMM-dry-run.json
```

The command validates the naming convention without creating a file.

## Secret Safety Scan

The command scans only mock in-memory output. It should fail if the mock payload contains secret-like values such as JWT-shaped strings, service-role-like names, obvious password fields, or token/key patterns.

The scan is a guardrail for future implementation. It is not a substitute for provider-side secret hygiene.

## Restore Compatibility Simulation

The dry-run simulates these checks:

- Manifest is present.
- Mock members are present.
- Mock relationship count is plausible.
- Privacy flags are present.
- No secret-like pattern is present.
- Environment is not production.

No restore is performed.

## PASS/FAIL Criteria

PASS when:

- Dry-run prints `DRY_RUN_ONLY`.
- No production calls happen.
- Manifest shape validates.
- Naming convention validates.
- Secret pattern scan passes.
- Restore compatibility checklist passes.

FAIL when:

- Script tries to read env/secret files.
- Script contains production API/DB/network behavior.
- Manifest shape is incomplete.
- Filename convention fails.
- Secret-like value is found in mock output.
- Script creates real backup/export data or performs restore behavior.

## Future Implementation Path

- Phase 22: dry-run command with mock data only.
- Phase 23: sample fixture backup generator.
- Phase 24: manifest and integrity checker.
- Phase 25: restore dry-run validator.
- Phase 26: pipeline readiness gate.
- Later phase: optional CI gate or sandbox storage prototype, still without production data unless approved.

## Operational Usage

Use `npm run backup:dry-run` before changing backup automation scripts. The command is safe to run locally because it does not read secrets, does not call network, and does not write backup files.

Expected output:

```text
[backup:dry-run] DRY_RUN_ONLY
[backup:dry-run] No production API calls.
[backup:dry-run] Manifest shape: PASS
[backup:dry-run] Naming convention: PASS
[backup:dry-run] Secret pattern scan: PASS
[backup:dry-run] Restore compatibility checklist: PASS
[backup:dry-run] Result: PASS
```

## Phase 22 Boundary

- Do not deploy in Phase 22.
- Do not push.
- Do not change schema.
- Do not create or run migrations.
- Do not mutate real data.
- Do not read `.env.local`.
- Do not read `.dev.vars`.
- Do not call production API/DB/network.
- Do not create real production backup/export files.
- Do not upload backup files.
- Do not restore production.
- Do not create a real scheduled job.
- Do not enable real cron.
- Do not enable import confirm.
- Do not enable revision restore.
- Do not change real domain or DNS.
- Do not change Cloudflare/Supabase/Google OAuth production config.
- Do not hardcode secret/token/key values.
- Do not commit `.env.local` or `.dev.vars`.
- Do not commit backup/export real data.
- Do not commit `GIA_PHA_GITHUB_MENU.bat` if it is only the existing out-of-scope working tree change.

## Next Phase

- Phase 23 - Sample Fixture Backup Generator.
