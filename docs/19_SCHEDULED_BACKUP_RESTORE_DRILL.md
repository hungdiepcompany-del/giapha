# Scheduled Backup & Restore Drill

## Status

SCHEDULED_BACKUP_RESTORE_DRILL_BASELINE

Phase 19 standardizes a safe scheduled backup and restore drill runbook. This phase does not create a real production backup, does not restore production, does not deploy, does not change schema, does not run migrations, does not mutate real data, does not add a real cron/job, and does not change domain/Auth/OAuth configuration.

## Production Baseline

- Worker name: `web-gia-pha`
- Current production URL: https://web-gia-pha.hungdiepcompany.workers.dev/
- Deploy workflow: `.github/workflows/cloudflare-deploy.yml`
- Phase 16 status: PASS
- Phase 17 status: PASS
- Phase 18 status: PASS_WITH_NOTES
- Google OAuth production login: PASS by manual user test
- Basic production route smoke: PASS by manual user test
- Automated production smoke with `PROD_SMOKE_BASE_URL`: previously PASS

Known local/environment notes:

- Direct `npm run build` in the workspace can fail when old `.next` artifacts are locked by Windows ACL/EPERM.
- Clean temp build has passed in prior phases and remains the preferred source-vs-artifact check if the local `.next` directory is locked.
- `npm audit --audit-level=moderate` currently reports known advisory findings; do not run `npm audit fix --force` in this phase.
- `GIA_PHA_GITHUB_MENU.bat` is modified outside Phase 19 scope and must not be staged or committed by this phase.

## Drill Goal

The goal is to define the schedule, process, verification criteria, and logging template for backup and restore drills.

- Phase 19 does not create a real backup.
- Phase 19 does not restore production.
- Phase 19 does not add automated cron or worker jobs.
- Phase 19 documents how an operator should prepare, run, verify, and record a future drill.
- A real restore is a high-risk operation and needs a separate phase or explicit approval.

## Recommended Backup Schedule

Recommended manual schedule:

- Before every important production deploy.
- After every important production deploy, especially if export/backup behavior changed.
- Weekly lightweight backup review.
- Monthly full backup review.
- Before any import, restore, or revision restore work.
- Before any future schema or migration work.

This is a recommended manual runbook. Phase 19 does not configure an automated cron, Cloudflare scheduled Worker, GitHub scheduled workflow, or external backup job.

## Backup Scope

Track these backup types and companion metadata:

- JSON export, usually `family.json`.
- GEDCOM export when the UI/API is available and permissions allow it.
- ZIP export when the UI/API is available and permissions allow it.
- Backup metadata or manifest stored beside the backup.
- Application version, git commit, deploy time, and production URL baseline.
- Operator notes for why the backup was taken.
- Confirmation that the backup contains no secret, token, or key values.

Gaps must be documented rather than hidden. If an export type is incomplete or unavailable, record it as a gap and do not open a large feature in this phase.

## Backup Naming Convention

Recommended names:

```text
gia-pha-backup-YYYYMMDD-HHMM-production.json
gia-pha-backup-YYYYMMDD-HHMM-production.gedcom
gia-pha-backup-YYYYMMDD-HHMM-production.zip
gia-pha-backup-YYYYMMDD-HHMM-production-manifest.json
```

Rules:

- Do not commit real backup files to git.
- Do not store real backup files inside the repository.
- Do not paste real backup content into chat, docs, logs, public issues, or pull requests.
- Treat backups that contain real family data as private data.
- Keep backup files outside the production system and outside source control.

## Backup Manifest Template

This is documentation only. Phase 19 does not create a real manifest file.

```json
{
  "project": "gia-pha",
  "environment": "production",
  "backup_type": "json|gedcom|zip",
  "created_at": "YYYY-MM-DDTHH:mm:ss+07:00",
  "app_commit": "<commit_sha>",
  "production_url": "https://web-gia-pha.hungdiepcompany.workers.dev/",
  "contains_real_data": true,
  "contains_secret": false,
  "operator": "<manual_operator>",
  "notes": "<short_notes>"
}
```

## Restore Drill Scope

Safe restore drill boundaries:

- Run restore drills only in local, test, staging, or sandbox environments.
- Do not restore into production in Phase 19.
- Do not use real production data unless the user gives explicit approval.
- Prefer sample or sanitized backup data.
- Verify restored data using the checklist below.
- Do not mutate production while validating a drill.

## Restore Verification Checklist

After a restore drill, verify:

- Backup file can be read.
- Manifest is valid.
- Family/project identity is correct.
- Member count is plausible.
- Parent, mother, father, spouse, and child relationships are not broken.
- Privacy flags are preserved.
- Role and permission data is not mixed into family data.
- Export can run again after restore.
- Output contains no secret, token, or key values.
- UI and logs do not expose 500 stack traces or private operational details.

## PASS/FAIL Criteria

PASS when:

- Backup file and manifest are valid.
- Restore drill runs in a non-production environment.
- Relationship and privacy checks pass.
- No secret, token, or key values appear in backup, output, chat, docs, or logs.
- No production mutation occurs.

FAIL when:

- Backup cannot be read.
- Manifest is missing required information.
- Restore loses or corrupts relationships.
- Restore targets production by mistake.
- Backup, output, or logs contain secret, token, or key values.
- Production is mutated unexpectedly.

Use PASS_WITH_NOTES only when the drill did not violate safety boundaries but has documented gaps to fix before the next drill.

## Drill Log Template

Use this template after each future drill. Phase 19 does not create a real drill log with real data.

```md
## Backup/Restore Drill Log

- Date/time:
- Operator:
- Environment:
- Source backup type:
- Source backup filename:
- App commit:
- Production URL baseline:
- Restore target:
- Checks performed:
- Result: PASS/FAIL/PASS_WITH_NOTES
- Issues found:
- Follow-up actions:
```

## Scheduled Reminder Strategy

Recommended reminder cadence:

- Weekly backup review.
- Monthly full backup review.
- Quarterly restore drill.
- Pre-deploy backup checkpoint.
- Post-deploy backup checkpoint.

This is documentation only. Phase 19 does not create a cron, scheduled GitHub workflow, scheduled Cloudflare Worker, external monitor, or calendar automation.

## Incident Response

| Situation | Symptoms | First checks | Do not do quickly | Safe response | Stop/rollback/escalate when |
| --- | --- | --- | --- | --- | --- |
| Backup fail | Export errors, empty file, interrupted download | Worker logs, export route, permissions, network response | Do not deploy risky changes without a backup | Retry once, capture error safely, inspect service logs | Backup is needed before production mutation |
| Restore drill fail | Drill cannot import/read backup or data checks fail | Manifest, file format, target environment, validation output | Do not retry against production | Keep failure isolated, record gap, fix in test/staging | Any risk of production mutation appears |
| Backup may contain secret | Secret-like string found in backup or manifest | Diff, manifest, logs, export code path | Do not paste the value into chat/docs | Quarantine file, rotate affected secret if confirmed, remove exposure | Any real token/key is confirmed |
| Backup may be wrong family/project | Names/counts/source metadata do not match | Manifest, operator notes, source URL, timestamp | Do not restore it anywhere important | Mark backup unusable until verified | Identity cannot be proven |
| Backup file corrupt | Cannot open/decompress/parse | File size, checksum when available, download history | Do not edit file manually and call it fixed | Re-download or use previous known-good backup | No readable backup exists before risky work |
| Restored wrong environment | Production or wrong sandbox changed | Target URL/env, logs, affected data | Do not continue the drill | Stop, preserve evidence, restore from latest safe backup if needed | Any production data changed unexpectedly |
| Export button/API missing | Operator cannot find or access export | Permissions, route availability, UI state | Do not bypass permissions with service keys in client | Verify role/permission path and documented export route | Owner/admin cannot export before risky work |
| Production export fails | `/admin/exports` or download route fails in production | Cloudflare logs, Supabase errors, latest deploy | Do not import old backup into production | Roll back if deploy caused regression, then debug export service | Backup is impossible and production change is pending |

## Gaps And Future Work

- No automatic cron backup exists yet.
- No dedicated backup storage target exists yet.
- No automated restore sandbox exists yet.
- No automatic alert for backup failure exists yet.
- Custom domain cutover is still separate unless completed in a later phase.
- No real drill with production data should happen without explicit approval.
- Backup checksum/manifest automation can be added later.
- Scheduled reminder automation can be added later.

## Phase 19 Boundary

- Do not deploy in Phase 19.
- Do not push.
- Do not change schema.
- Do not create or run migrations.
- Do not mutate real data.
- Do not create real production backup files.
- Do not restore production.
- Do not enable real import confirm.
- Do not enable real revision restore.
- Do not change the real domain.
- Do not change Supabase/Auth/OAuth production config.
- Do not hardcode secret/token/key values.
- Do not commit `.env.local` or `.dev.vars`.
- Do not commit backup/export real data.
- Do not commit `GIA_PHA_GITHUB_MENU.bat` if it is only the existing out-of-scope working tree change.

## Next Phase

- Phase 20 - Custom Domain Cutover Readiness, if the priority is domain.
- Phase 20 - Automated Backup Job Design, if the priority is scheduled automation.
- Focused production bugfix phase, if monitoring or smoke tests reveal a real issue.
