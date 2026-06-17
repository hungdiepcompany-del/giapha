# Automated Backup Job Design

## Status

AUTOMATED_BACKUP_JOB_DESIGN_BASELINE

Phase 21 designs a future automated backup job without enabling it. This phase does not deploy, push, create a scheduled job, enable cron, create a real production backup/export, upload real backup data, restore production, change schema, run migrations, mutate real data, or change domain/Auth/OAuth configuration.

## Production Baseline

- Worker name: `web-gia-pha`
- Current production URL: https://web-gia-pha.hungdiepcompany.workers.dev/
- Deploy workflow: `.github/workflows/cloudflare-deploy.yml`
- Phase 16 status: PASS
- Phase 17 status: PASS
- Phase 18 status: PASS_WITH_NOTES
- Phase 19 status: PASS_WITH_NOTES
- Phase 20 status: PASS_WITH_NOTES
- Google OAuth production login: PASS by manual user test
- Basic production route smoke: PASS by manual user test
- Automated production smoke with `PROD_SMOKE_BASE_URL`: previously PASS

Known notes:

- Direct `npm run build` in the workspace can fail when old `.next` artifacts are locked by Windows ACL/EPERM.
- Clean temp build has passed in prior phases and should be used to distinguish source errors from local generated artifact locks.
- `npm audit --audit-level=moderate` currently reports known advisory findings; do not run `npm audit fix --force` in this phase.
- `GIA_PHA_GITHUB_MENU.bat` is modified outside Phase 21 scope and must not be staged or committed by this phase.
- Custom domain has not been cut over; current canonical production URL remains the workers.dev URL.

## Design Goal

The goal is to design an automated backup job foundation and its safety envelope.

- Do not enable a real job in Phase 21.
- Do not create a real production backup in Phase 21.
- Do not restore real data in Phase 21.
- Do not upload real backup data to any storage in Phase 21.
- Do not add live storage credentials in Phase 21.
- Every real automation step needs a separate phase and explicit approval.

## Backup Job Candidate Architecture

### GitHub Actions scheduled workflow

- Advantages: visible logs, manual dispatch can be added later, familiar secrets/vars management, easy to disable.
- Risks: logs can leak metadata if not redacted, workflow permissions must be narrow, artifact retention can accidentally store real data.
- Secrets needed if implemented: Supabase server-side key, app URL, optional storage credentials, optional internal backup endpoint token.
- Why not enabled in Phase 21: no storage target, retention policy, dry-run command, or approved production backup flow is active yet.

### Cloudflare Worker Cron Trigger

- Advantages: close to app runtime, no external runner needed, can use Worker bindings later.
- Risks: accidental production mutation, harder local dry-run, secrets and storage bindings must be handled carefully.
- Secrets needed if implemented: server-side Supabase credential, storage binding/credential, optional internal job token.
- Why not enabled in Phase 21: no cron trigger, no storage binding, and no monitored restore drill automation exist yet.

### Manual operator-triggered backup

- Advantages: safest starting point, human can verify backup need, avoids unattended data movement.
- Risks: operator may forget schedule, inconsistent naming, manual storage mistakes.
- Secrets needed if implemented: no extra job secret if using existing authenticated admin export UI.
- Why not fully automated in Phase 21: this remains the recommended first stage until dry-run and storage policies are proven.

### Supabase/manual export flow

- Advantages: can be controlled through existing admin permissions and export services.
- Risks: service role use must remain server-only, large exports may hit runtime limits, export scope must respect privacy.
- Secrets needed if implemented: existing server-side Supabase configuration only.
- Why not enabled in Phase 21: current routes are user-triggered download routes, not a scheduled job contract.

### External storage later

Possible storage targets include Cloudflare R2, Google Drive, Supabase Storage, local operator storage, or private NAS/offline backup.

- Advantages: durable off-app storage and better retention options.
- Risks: access control mistakes, public buckets/links, data residency concerns, stale backups, leaked credentials.
- Secrets needed if implemented: provider-specific write credentials or bindings.
- Why not enabled in Phase 21: storage choice, access policy, retention, and restore drill are not approved yet.

## Recommended Safe Architecture

Recommended staged approach:

- Start with manual/semi-manual backup checklist from Phase 19.
- Use current JSON/GEDCOM/ZIP export outputs as the conceptual backup payload.
- Add a dry-run command with sample data before touching production data.
- Add manifest and checksum validation before storage upload.
- Add storage integration only in sandbox/test first.
- Add scheduled automation disabled-by-default before any production enablement.
- Enable production scheduling only after storage, retention, monitoring, and restore drill are approved.

Rules:

- Do not store real backup files in git.
- Do not print backup data in logs.
- Do not commit real backup data.
- Do not put secrets in docs.
- Do not use a public bucket or anonymous download URL for real backups.

## Backup Trigger Design

Future trigger classes:

- Weekly light backup.
- Monthly full backup.
- Pre-deploy backup.
- Post-deploy backup.
- Pre-migration backup.
- Pre-import backup.
- Pre-restore backup.
- Pre-revision-restore backup.

This is design only. No scheduled workflow, cron trigger, route, or job is enabled in Phase 21.

## Backup Output Design

Future backup outputs should include:

- JSON export, currently represented by `buildFamilyJsonFile`.
- GEDCOM export, currently represented by `buildGedcomExport`.
- ZIP export, currently represented by `buildFullBackupZip`.
- Manifest JSON with app/version/schema/export metadata.
- Checksum values, currently SHA-256 headers and ZIP `checksums.json` exist for manual exports.
- App commit and deploy metadata when automation is implemented.
- Created time using ISO timestamp and Vietnam operator context when applicable.
- Environment marker: production, staging, local, or sandbox.

The current export layer includes JSON/GEDCOM/ZIP routes under `/admin/exports/download/*`. A future job should reuse audited server-side export builders instead of duplicating export shape.

## Backup Storage Design

### Local operator storage

- Advantages: simple, no new service dependency, good for early manual process.
- Risks: laptop loss, inconsistent encryption, missing retention.
- Access needed: operator account and local secure storage process.
- Retention: keep weekly/monthly/pre-deploy folders with manual review.
- Phase 21 status: documented only, no backup is created.

### Cloudflare R2

- Advantages: close to Cloudflare deployment, object storage with lifecycle options.
- Risks: bucket access policy mistakes, public object exposure, binding/secret setup.
- Access needed: R2 bucket binding or API token scoped to backup writes.
- Retention: lifecycle rules after restore drill is proven.
- Phase 21 status: not configured.

### Google Drive

- Advantages: familiar manual access and sharing controls.
- Risks: accidental sharing, service-account setup complexity, folder permission drift.
- Access needed: service account or OAuth flow with least privilege.
- Retention: monthly folder review and restricted access list.
- Phase 21 status: not configured.

### Supabase Storage

- Advantages: same platform family, policies can restrict access.
- Risks: mixing app data and backup data, RLS/storage policy mistakes, public URL mistakes.
- Access needed: server-side storage credential and private bucket policy.
- Retention: explicit lifecycle or manual cleanup after verified replacement.
- Phase 21 status: not configured.

### Private NAS/offline backup

- Advantages: offline or local control, reduced cloud exposure.
- Risks: manual process, hardware failure, missing remote redundancy.
- Access needed: operator-controlled secure storage.
- Retention: monthly offline snapshot plus critical pre-release backups.
- Phase 21 status: documented only.

## Retention Policy Design

Recommended retention:

- Keep 4-8 most recent weekly backups.
- Keep 12 monthly backups.
- Keep important pre-deploy backups at least through the related release validation window.
- Never delete an older production backup until the newer backup is verified.
- Do not automatically delete production backups without explicit approval.
- Treat backups containing real family data as private data.
- Record retention exceptions in the drill/job log.

## Security And Privacy Guardrails

- Do not backup secret/token/key values.
- Do not log backup content.
- Do not send real backup files into chat or public issues.
- Do not commit real backup files.
- Do not store real backup files in the repository.
- Do not use a public bucket for real backups.
- Do not use anonymous or public download URLs for real backups.
- Restrict access to backups that contain real family data.
- Keep service role keys server-side only.
- Prefer least-privilege write-only storage credentials for future automation.

## Job Failure Handling

| Failure | Symptoms | First checks | Do not do quickly | Safe response | Alert when |
| --- | --- | --- | --- | --- | --- |
| Backup export fail | Job cannot build JSON/GEDCOM/ZIP | Export route/service error, permissions, Supabase query error | Do not skip backup and continue risky production work | Stop job, record failure, inspect logs without printing data | Backup needed before deploy/data change |
| Storage upload fail | Backup builds but upload fails | Storage credential, bucket/folder policy, file size | Do not paste backup into logs/chat | Keep backup local only if approved, fix storage in sandbox | Repeated upload failure or no alternate storage |
| Manifest/checksum fail | Manifest missing or checksum mismatch | Manifest generator, file bytes, checksum algorithm | Do not mark backup verified | Mark backup invalid and regenerate from source | Latest backup cannot be verified |
| Secret/env missing | Job reports missing config | Present/missing status only, job env names | Do not print secret values | Abort job and configure env securely | Required secret remains missing |
| Auth/session fail | Job cannot access export service | Auth mode, permission, service boundary | Do not disable RLS or bypass client-side | Use server-side approved job identity only | Auth fails for all backup attempts |
| Rate limit/network fail | Timeout, 429, transient fetch error | Provider logs, retry count, network status | Do not retry indefinitely | Retry with bounded backoff, then fail closed | Backup window closes without success |
| File too large | Upload or memory failure | File size, route limits, Worker limits | Do not split by hand without manifest update | Design chunking or service split in a later phase | Current runtime cannot produce backup safely |
| Storage permission fail | 403 or denied from storage provider | Bucket/folder ACL, service account, policy | Do not make bucket public | Fix least-privilege policy in sandbox | Permission fix would broaden public access |

## Restore Compatibility Requirement

- A backup job has no value if the backup cannot be restored.
- Every backup must have a manifest.
- Every backup should have checksum metadata.
- Restore drill must use sample or sanitized data before real production data.
- Do not restore production through an automated job.
- Verify people, relationships, privacy flags, role separation, export ability, and UI/log safety after restore drill.
- Real restore needs a separate phase and explicit approval.

## Future Implementation Stages

- Stage A: docs/checklist only - current Phase 21.
- Stage B: dry-run backup command with sample data only.
- Stage C: manual export plus manifest generator.
- Stage D: storage integration using sandbox/test data.
- Stage E: scheduled job disabled-by-default.
- Stage F: scheduled production job with approval and monitoring.
- Stage G: restore drill automation.

## Configuration Variables Design

Names only; do not add these to `.env.local` in Phase 21.

```text
BACKUP_JOB_ENABLED=false
BACKUP_STORAGE_PROVIDER=<r2|google_drive|supabase_storage|manual>
BACKUP_RETENTION_WEEKLY_COUNT=8
BACKUP_RETENTION_MONTHLY_COUNT=12
BACKUP_MANIFEST_REQUIRED=true
BACKUP_FAIL_ON_SECRET_PATTERN=true
```

Do not commit real secrets. If `.env.example` is updated in a later implementation phase, keep only safe placeholders.

## Acceptance Criteria

PASS when:

- Design doc exists and covers the required sections.
- Checker script exists.
- No real job is created.
- No real backup is created.
- No real backup is uploaded.
- No real restore is performed.
- No secret/token/key values are hardcoded.
- Required validation passes or known local notes are clearly reported.

FAIL when:

- A real job or cron is enabled.
- A real production backup is created, committed, or uploaded.
- A secret appears in docs, diff, or logs.
- Production is mutated.
- Schema or migration changes are made.
- Deploy or push happens without request.

## Phase 21 Boundary

- Do not deploy in Phase 21.
- Do not push.
- Do not change schema.
- Do not create or run migrations.
- Do not mutate real data.
- Do not create real production backup/export files.
- Do not restore production.
- Do not create a real scheduled job.
- Do not enable real cron.
- Do not upload real backup files to storage.
- Do not enable real import confirm.
- Do not enable real revision restore.
- Do not change real domain or DNS.
- Do not change Cloudflare/Supabase/Google OAuth production config.
- Do not call Cloudflare, Supabase, Google, or storage APIs to mutate config.
- Do not hardcode secret/token/key values.
- Do not commit `.env.local` or `.dev.vars`.
- Do not commit backup/export real data.
- Do not commit `GIA_PHA_GITHUB_MENU.bat` if it is only the existing out-of-scope working tree change.

## Next Phase

- Phase 22 - Backup Dry-Run Command Design, if the priority is backup automation.
- Phase 22 - Custom Domain Cutover Execution, if the official domain is confirmed and Cloudflare/Supabase/Google access is available.
- Focused production bugfix phase, if monitoring or smoke tests reveal a real issue.
