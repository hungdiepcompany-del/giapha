# Backup Artifact Retention Policy Gate

## Status

BACKUP_ARTIFACT_RETENTION_POLICY_GATE_BASELINE

Phase 29 adds a fixture/sandbox-only retention policy gate for backup artifacts. It validates retention rules and simulated artifact metadata without removing files. It does not read env files, call network/API/DB, use cloud storage, remove production backups, restore data, deploy, push, change schema, or mutate real data.

## Production Baseline

- Worker name: `web-gia-pha`
- Current production URL: https://web-gia-pha.hungdiepcompany.workers.dev/
- Backup readiness CI gate: PASS
- Local sandbox storage simulation: PASS
- No real storage target has been selected.
- No production backup job or cron exists.
- Custom domain has not been cut over.

## Retention Gate Goal

The goal is to define and validate backup artifact retention behavior before any real storage target or production backup automation exists.

The command must print `RETENTION_POLICY_CHECK_ONLY`.

## Retention Policy

Proposed policy:

- Weekly backups: keep 8 verified artifacts.
- Monthly backups: keep 12 verified artifacts.
- Pre-deploy backups: keep artifacts with a release marker.
- Do not remove the newest artifact if it has not been verified.
- Do not remove anything when a manifest is invalid.
- Treat production backup removal as a separate approval-only operation.

## Fixture/Sandbox-Only Scope

The command may read:

- `fixtures/backup-sandbox/storage-index.fixture.json`

The command uses synthetic artifact metadata only. It does not scan real backup folders, cloud buckets, external storage, or production exports.

## Deletion Safety Rule

Phase 29 does not remove any file. The command only reports simulated retention decisions:

- `keep`
- `review_later`
- `blocked_manifest_invalid`

Any future real removal needs a separate phase, explicit approval, provider-specific safeguards, manifest verification, and rollback notes.

## PASS/FAIL Criteria

PASS when:

- Policy values are present.
- Weekly keep count is 8.
- Monthly keep count is 12.
- Pre-deploy artifacts require a release marker.
- Newest unverified artifact is kept for review.
- Invalid manifest blocks removal.
- Command prints `RETENTION_POLICY_CHECK_ONLY`.

FAIL when:

- Script tries to remove files.
- Script reads env files.
- Script calls external services.
- Policy would remove unverified or invalid-manifest artifacts.
- Policy references production paths for mutation.

## Failure Handling

- Treat a failed retention check as a policy design issue.
- Do not loosen safety rules to make the check pass.
- Do not perform real cleanup while investigating.
- Fix fixture metadata or policy logic in a scoped follow-up.

## Phase 29 Boundary

- Do not deploy in Phase 29.
- Do not push.
- Do not change schema.
- Do not create or run migrations.
- Do not mutate real data.
- Do not read `.env.local`.
- Do not read `.dev.vars`.
- Do not call production API/DB/network.
- Do not create/upload production backup files.
- Do not remove production backup files.
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

- Phase 30 - Restore Drill Report Generator.
