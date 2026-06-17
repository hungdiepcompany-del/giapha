# Sandbox Storage Target Selection

## Production Baseline

- Worker name: `web-gia-pha`
- Current production URL: https://web-gia-pha.hungdiepcompany.workers.dev/
- Deploy workflow: `.github/workflows/cloudflare-deploy.yml`
- Backup readiness workflow: `.github/workflows/backup-readiness.yml`
- Production backup storage target: not selected.
- Production backup job: not enabled.
- Production backup upload: not implemented.
- Production restore execution: not implemented.

## Selection Goal

Phase 32 compares storage target candidates for future backup automation and chooses the safest sandbox direction for the next prototype. This phase is docs and checker only. It does not integrate a real provider, create a bucket or folder, read credentials, call network/API/DB, upload backup files, or restore data.

## Storage Candidates

- Cloudflare R2
- Google Drive
- Supabase Storage
- Local/NAS/offline operator storage
- Manual encrypted offline backup

## Evaluation Criteria

- Privacy/safety
- Long-term maintainability
- Cost
- Restore reliability
- Access control
- Secret management
- Automation readiness
- Vendor lock-in
- Ease of operator use
- Fit for 100-year family archive goal

## Candidate Comparison Matrix

| Candidate | Privacy/safety | Maintainability | Cost | Restore reliability | Access control | Secret management | Automation readiness | Vendor lock-in | Operator ease | 100-year archive fit |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Cloudflare R2 | Strong if private bucket and scoped credentials are used | Good with current Cloudflare deploy stack | Usually low | Good if manifest/checksum and lifecycle are enforced | Strong with bucket policy and scoped token | Needs careful secret handling outside repo | Strong for future worker-native automation | Medium | Medium | Good as cloud copy, not sole archive |
| Google Drive | Good if folder permissions stay private | Familiar but API/service-account policy needs care | Low for small archives | Good for manual retrieval, weaker for strict automation | Depends on account/folder governance | Needs service account or OAuth design | Medium | Medium | High for non-technical operator | Good as operator-accessible copy |
| Supabase Storage | Good inside existing Supabase project | Good but tied to app database vendor | Included/low initially | Good if bucket private and manifest rules exist | Strong with RLS/storage policies | Needs server-side key discipline | Medium | High | Medium | Good but should not be the only independent backup |
| Local/NAS/offline operator storage | Strong if encrypted and physically controlled | Depends on operator process | Hardware/process cost | Good for disaster copy if tested | Physical/operator controlled | Avoids cloud secrets for sandbox | Low to medium | Low | Medium | Strong for independent archive |
| Manual encrypted offline backup | Strong when encryption and custody are handled well | Process-heavy | Low | Good if periodic restore drill is done | Physical custody | No cloud secret needed | Low | Low | Medium | Very strong as long-term secondary archive |

## Recommended Sandbox Target

Default sandbox/prototype target: continue using local sandbox storage under `fixtures/backup-sandbox/`.

Reasoning:

- It keeps all current checks local and deterministic.
- It avoids real storage credentials and provider configuration.
- It lets the adapter contract, manifest verification, retention policy, and restore drill report mature before a real provider is approved.
- It matches the current readiness bundle without widening into production backup behavior.

Production long-term target: not selected in Phase 32. Cloudflare R2 may be a strong technical candidate later because the app already deploys on Cloudflare, but R2 must not be configured in this phase. A future decision can compare R2 with Google Drive, Supabase Storage, and offline encrypted storage after owner approval.

## Secret/Env Placeholders

Do not create or read real secret values in Phase 32.

Future storage integration may need placeholders such as:

- `BACKUP_STORAGE_PROVIDER`
- `BACKUP_STORAGE_BUCKET`
- `BACKUP_STORAGE_PREFIX`
- `BACKUP_STORAGE_RETENTION_POLICY`

These are names only. They are not real credentials and are not required for the current local sandbox recommendation.

## Sandbox Prototype Boundary

The next prototype should remain local-only:

- Use fixture data.
- Use `fixtures/backup-sandbox/`.
- Verify manifest/checksum after simulated storage operations.
- Do not read `.env.local`.
- Do not read `.dev.vars`.
- Do not call provider APIs.
- Do not upload cloud artifacts.

## Production Storage Boundary

Production storage is explicitly out of scope for Phase 32.

- No production backup is created.
- No production upload is performed.
- No bucket, folder, object prefix, or provider account is created.
- No Cloudflare R2, Google Drive, or Supabase Storage API is called.
- No storage credential is read or generated.
- No retention deletion is performed.
- No restore production action is performed.

## Risk Matrix

| Risk | Phase 32 handling |
| --- | --- |
| Secret leak during provider setup | Avoid provider setup entirely. |
| Backup contains private living-person data | Use only fixture/sample data. |
| Operator mistakes sandbox as real backup | Mark docs and scripts as sandbox/readiness only. |
| Vendor lock-in too early | Do not select production target yet. |
| Restore confidence overstated | Keep restore proof limited to fixture dry-run evidence. |
| Storage deletion risk | Do not implement deletion in Phase 32. |

## Acceptance Criteria

- Candidate comparison includes Cloudflare R2, Google Drive, Supabase Storage, Local/NAS/offline operator storage, and Manual encrypted offline backup.
- Evaluation criteria include privacy, maintainability, cost, restore reliability, access control, secret management, automation readiness, vendor lock-in, operator ease, and 100-year archive fit.
- Recommended sandbox target remains local sandbox.
- Production target remains unapproved and unconfigured.
- Checker passes without reading env files or calling network/API/DB.

## Phase 32 Boundary

- Do not deploy.
- Do not push.
- Do not change schema.
- Do not create or run migrations.
- Do not mutate real data.
- Do not read `.env.local`.
- Do not read `.dev.vars`.
- Do not call production API/DB/network.
- Do not call Cloudflare/Supabase/Google API.
- Do not create bucket/folder/storage cloud resources.
- Do not create/upload production backup files.
- Do not restore production.
- Do not create scheduled backup jobs.
- Do not add GitHub Actions scheduled trigger.
- Do not hardcode secret/token/key values.
- Do not commit `.env.local` or `.dev.vars`.
- Do not commit `GIA_PHA_GITHUB_MENU.bat` if it remains an out-of-scope working tree change.

## Next Phase

- Phase 33 - Storage Adapter Contract & Safety Guardrails.
