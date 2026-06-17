# Restore Drill Report Generator

## Status

RESTORE_DRILL_REPORT_GENERATOR_BASELINE

Phase 30 adds a restore drill report generator for fixture-only dry-run evidence. It reads the sample fixture and manifest, validates the same safe restore-readiness facts, and writes a fixture report under `fixtures/backup/reports/`. It does not read env files, call network/API/DB, restore data, upload files, deploy, push, change schema, or mutate real data.

## Production Baseline

- Worker name: `web-gia-pha`
- Current production URL: https://web-gia-pha.hungdiepcompany.workers.dev/
- Backup readiness CI gate: PASS
- Local sandbox storage simulation: PASS
- Retention policy gate: PASS
- No real storage target has been selected.
- No production backup job or cron exists.
- Custom domain has not been cut over.

## Restore Drill Report Goal

The goal is to produce a durable fixture report that records restore dry-run readiness without performing any real restore.

The command must print `RESTORE_DRILL_REPORT_ONLY`.

## Report Fields

The report contains:

- `timestamp`
- `environment`
- `fixtureFilename`
- `manifestStatus`
- `memberGraphStatus`
- `privacyStatus`
- `secretScanStatus`
- `result`
- `noProductionMutation`
- `restoreExecution`
- `notes`

## Fixture-Only Policy

The report is generated only from:

- `fixtures/backup/sample-family.fixture.json`
- `fixtures/backup/sample-family.manifest.fixture.json`

The output report is:

```text
fixtures/backup/reports/sample-restore-drill-report.fixture.json
```

The report is not evidence of a production restore and must not be treated as a production backup artifact.

## Operational Usage

Run:

```bash
npm run restore:drill:report
```

Expected safe output:

```text
[restore:drill:report] RESTORE_DRILL_REPORT_ONLY
[restore:drill:report] Manifest status: PASS
[restore:drill:report] Member graph status: PASS
[restore:drill:report] Privacy status: PASS
[restore:drill:report] Secret scan status: PASS
[restore:drill:report] Report file: PASS
[restore:drill:report] Result: PASS
```

## PASS/FAIL Criteria

PASS when:

- Report command prints `RESTORE_DRILL_REPORT_ONLY`.
- Fixture and manifest can be read.
- Manifest status is `PASS`.
- Member graph status is `PASS`.
- Privacy status is `PASS`.
- Secret scan status is `PASS`.
- Report has `noProductionMutation: true`.
- Report result is `PASS`.

FAIL when:

- Fixture or manifest is missing.
- Report is marked production.
- Report claims real restore execution.
- Secret-like values are detected.
- Script reads env files or calls external services.

## Phase 30 Boundary

- Do not deploy in Phase 30.
- Do not push.
- Do not change schema.
- Do not create or run migrations.
- Do not mutate real data.
- Do not read `.env.local`.
- Do not read `.dev.vars`.
- Do not call production API/DB/network.
- Do not create/upload production backup files.
- Do not use real cloud storage.
- Do not restore production.
- Do not create a real scheduled job.
- Do not add GitHub Actions `schedule:`.
- Do not change real domain or DNS.
- Do not change Cloudflare/Supabase/Google OAuth production config.
- Do not hardcode secret/token/key values.
- Do not commit `.env.local` or `.dev.vars`.
- Do not commit `GIA_PHA_GITHUB_MENU.bat` if it is only the existing out-of-scope working tree change.

## Next Phase

- Phase 31 - Backup Readiness Handoff Consolidation.
