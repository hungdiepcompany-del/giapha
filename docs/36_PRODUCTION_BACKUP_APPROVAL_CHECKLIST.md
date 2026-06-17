# Production Backup Approval Checklist

## Production Baseline

- Worker name: `web-gia-pha`
- Current production URL: https://web-gia-pha.hungdiepcompany.workers.dev/
- Sandbox storage target: local sandbox.
- Production storage target: not selected.
- Production backup job: not enabled.
- Production backup upload: not implemented.
- Production restore execution: not implemented.
- Phase 36 creates approval documentation only.

## Approval Goal

Phase 36 defines the approval gate required before any future phase may create a real production backup or upload it to a real storage target. This phase does not create a production backup, does not restore production, does not mutate storage, does not deploy, and does not read secrets.

## Required Approvals

Before production backup work starts, record approval from:

- Family archive owner.
- Technical operator.
- Privacy/data reviewer.
- Restore drill reviewer.
- Incident/rollback owner.

Approval must be explicit and tied to a chosen storage target and backup run date.

## Storage Target Decision

Production backup is blocked until the storage target is selected and documented.

Required decision fields:

- Provider name.
- Storage location or bucket/folder name.
- Access owner.
- Access recovery path.
- Retention class.
- Encryption/custody model.
- Operator instructions.

## Secret Handling Approval

No production backup work may begin until secret handling is approved:

- Required credentials are named without printing values.
- Credential owner is identified.
- Storage credential scope is least-privilege.
- No secret is committed to the repo.
- No secret is printed in logs.
- `.env.local` and `.dev.vars` remain untracked and unread by checklist phases.
- Rotation plan exists for suspected exposure.

## Data Privacy Approval

Privacy review must confirm:

- Backup may contain living-person data.
- Backup storage access is private.
- Public/private flags are preserved.
- Operator understands archive sensitivity.
- Sharing outside approved owners is forbidden.
- Backup filenames do not expose private family details.

## Retention Approval

Retention approval must define:

- Weekly retention count.
- Monthly retention count.
- Pre-deploy backup retention.
- Manual/legal hold handling.
- Deletion approval owner.
- No deletion of newest unverified artifact.
- No deletion when manifest is invalid.

## Restore Drill Approval

Restore drill approval must confirm:

- Latest fixture restore dry-run PASS.
- Latest storage upload verification dry-run PASS.
- Manual restore owner is assigned.
- Restore target is non-production unless a separate production restore approval exists.
- Rollback notes exist before any restore run.

## Operator Checklist

- Confirm selected storage target.
- Confirm operator has access.
- Confirm owner approval is recorded.
- Confirm secret handling plan is approved.
- Confirm privacy review is approved.
- Confirm retention policy is approved.
- Confirm restore drill evidence is current.
- Confirm incident/rollback owner is available.

## Pre-Production Backup Checklist

- Run `npm run backup:pipeline:readiness`.
- Run `npm run backup:storage:adapter:local`.
- Run `npm run backup:storage:verify-upload:dry-run`.
- Run `npm run check:production-backup-approval-checklist`.
- Confirm current git status does not include unreviewed product changes.
- Confirm no real secret value appears in diff or logs.
- Confirm production backup command is approved in a separate phase.

## During-Backup Checklist

Phase 36 does not run this checklist. Future production backup execution should:

- Use approved storage target only.
- Print present/missing status for credentials, never values.
- Generate manifest and checksum.
- Avoid logging private payload contents.
- Abort on secret scan failure.
- Abort on manifest failure.
- Abort if operator approval is missing.

## Post-Backup Verification Checklist

Future production backup verification should:

- Verify manifest.
- Verify checksum.
- Verify storage metadata.
- Verify retention class.
- Confirm backup is private.
- Record backup identifier without exposing secret values.
- Record restore drill follow-up.

## Incident/Rollback Checklist

If anything fails:

- Stop backup operation.
- Do not retry blindly.
- Preserve safe logs.
- Do not paste secret or private data into chat/docs/issues.
- Rotate affected credential if exposure is suspected.
- Remove or quarantine unsafe artifact.
- Notify owner and incident/rollback owner.
- Record final decision before resuming.

## Explicit No-Go Conditions

Production backup is NO-GO if any item is true:

- no-go: storage target is not selected.
- no-go: owner backup approval is missing.
- no-go: restore drill PASS is missing.
- no-go: secret handling plan is missing.
- no-go: privacy review is missing.
- no-go: retention policy is missing.
- no-go: rollback/incident owner is missing.
- no-go: approval from the responsible person is missing.
- no-go: production backup command has not been separately approved.
- no-go: secret-like values appear in diff, logs, or artifacts.
- no-go: working tree includes unrelated unreviewed changes.

## Phase 36 Boundary

- No production backup in Phase 36.
- No restore production.
- No secret values are read or printed.
- No deploy/push.
- No storage mutation.
- Do not change schema.
- Do not create or run migrations.
- Do not mutate real data.
- Do not read `.env.local`.
- Do not read `.dev.vars`.
- Do not call production API/DB/network.
- Do not call Cloudflare/Supabase/Google API.
- Do not create bucket/folder/storage cloud resources.
- Do not create/upload production backup files.
- Do not delete production backup files.
- Do not create scheduled backup jobs.
- Do not add GitHub Actions scheduled trigger.
- Do not hardcode secret/token/key values.
- Do not commit `.env.local` or `.dev.vars`.
- Do not commit `GIA_PHA_GITHUB_MENU.bat` if it remains an out-of-scope working tree change.

## Next Phase

- Phase 37 - Sandbox Cloud Storage Prototype, if a real sandbox target such as Cloudflare R2, Google Drive, or Supabase Storage is selected and credentials are configured manually outside the repo.
- Alternative: Phase 37 - Production Backup Manual Execution Runbook, if all approvals are recorded.
- Alternative: Phase 37 - Custom Domain Cutover Execution, if domain ownership and provider configuration are confirmed.
