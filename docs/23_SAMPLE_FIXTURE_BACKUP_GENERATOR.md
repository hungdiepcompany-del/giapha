# Sample Fixture Backup Generator

## Status

SAMPLE_FIXTURE_BACKUP_GENERATOR_BASELINE

Phase 23 adds a safe fixture generator for backup/restore checks. It uses static sample data only and writes fixture files under `fixtures/backup/`. It does not read env files, call network/API/DB, use real family data, create production backup data, upload files, restore data, deploy, push, change schema, or mutate real data.

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
- Phase 22 status: PASS_WITH_NOTES
- Google OAuth production login: PASS by manual user test
- Basic production route smoke: PASS by manual user test

Known notes:

- Direct `npm run build` in the workspace can fail when old `.next` artifacts are locked by Windows ACL/EPERM.
- Clean temp build has passed in prior phases.
- `npm audit --audit-level=moderate` currently reports known advisory findings; do not run `npm audit fix --force`.
- `GIA_PHA_GITHUB_MENU.bat` is modified outside Phase 23 scope and must not be staged or committed.
- Custom domain has not been cut over.

## Fixture Goal

The goal is to create a small deterministic fixture that later backup and restore checks can use without touching real production data.

The generator must print `SAMPLE_FIXTURE_ONLY`.

## Sample Data Policy

- Use only fake names: `Sample Root`, `Sample Parent`, `Sample Child`, `Sample Relative`.
- Do not use real family names.
- Do not read production data.
- Do not read env files.
- Mark the fixture as `environment: "fixture"`.
- Mark `contains_real_data: false`.
- Mark `contains_secret: false`.

## Fixture Schema

The fixture file is `fixtures/backup/sample-family.fixture.json`.

The fixture contains:

- `metadata`
- `people`
- `families`
- `family_parents`
- `family_children`
- `privacy_flags`

The minimum sample graph has four people and parent/child relationships that are intentionally small and easy to verify.

## Manifest Fixture

The manifest file is `fixtures/backup/sample-family.manifest.fixture.json`.

Required manifest fields:

- `project`
- `environment`
- `backup_type`
- `fixture_marker`
- `created_at`
- `schema_version`
- `contains_real_data`
- `contains_secret`
- `fixture_file`
- `people_count`
- `relationship_count`
- `checksum_algorithm`
- `fixture_checksum_sha256`

## Generator Command

Command:

```bash
npm run backup:fixture:generate
```

Expected safe output:

```text
[backup:fixture:generate] SAMPLE_FIXTURE_ONLY
[backup:fixture:generate] Fixture file: PASS
[backup:fixture:generate] Manifest file: PASS
[backup:fixture:generate] Secret pattern scan: PASS
[backup:fixture:generate] Result: PASS
```

## Secret/Privacy Guardrails

- Do not include secret/token/key values.
- Do not include real family data.
- Do not include public download URLs.
- Do not write outside `fixtures/backup/`.
- Do not upload fixture files.
- Treat this as sample data only.

## Restore Drill Usage

Later phases can use the generated fixture to validate:

- Manifest shape.
- Checksum integrity.
- Member graph shape.
- Parent/child relationships.
- Privacy fields.
- Restore dry-run readiness.

The fixture is not a production backup and must not be imported into production as real data.

## PASS/FAIL Criteria

PASS when:

- Fixture file exists.
- Manifest file exists.
- Fixture has 3-5 fake members.
- Fixture has parent/child relationships.
- `environment` is `fixture`.
- `contains_real_data` is `false`.
- `contains_secret` is `false`.
- Secret pattern scan passes.

FAIL when:

- Generator reads env files.
- Generator calls network/API/DB.
- Fixture contains real names or secret-like values.
- Fixture files are missing.
- Fixture is marked as production or real data.

## Phase 23 Boundary

- Do not deploy in Phase 23.
- Do not push.
- Do not change schema.
- Do not create or run migrations.
- Do not mutate real data.
- Do not read `.env.local`.
- Do not read `.dev.vars`.
- Do not call production API/DB/network.
- Do not use real family data.
- Do not create real production backup/export files.
- Do not upload backup files.
- Do not restore production.
- Do not create a real scheduled job.
- Do not enable real cron.
- Do not change real domain or DNS.
- Do not change Cloudflare/Supabase/Google OAuth production config.
- Do not hardcode secret/token/key values.
- Do not commit `.env.local` or `.dev.vars`.
- Do not commit backup/export real data.
- Do not commit `GIA_PHA_GITHUB_MENU.bat` if it is only the existing out-of-scope working tree change.

## Next Phase

- Phase 24 - Backup Manifest & Integrity Checker.
