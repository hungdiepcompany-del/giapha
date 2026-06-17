# Local Sandbox Storage Adapter Prototype

## Production Baseline

- Worker name: `web-gia-pha`
- Current production URL: https://web-gia-pha.hungdiepcompany.workers.dev/
- Sandbox target from Phase 32: local sandbox.
- Adapter contract from Phase 33: provider-neutral, no-network.
- Production storage target: not selected.
- Production backup upload: not implemented.
- Production restore execution: not implemented.

## Local Adapter Goal

Phase 34 implements a local sandbox storage adapter prototype using fixture backup files. It exercises put, list, metadata read, and verify behavior without using cloud storage or production data.

## Local Sandbox Path

The adapter writes only under:

```text
fixtures/backup-sandbox/adapter/
```

The adapter reads only:

```text
fixtures/backup/sample-family.fixture.json
fixtures/backup/sample-family.manifest.fixture.json
```

## Adapter Operations Implemented

- Put artifact: copy fixture and manifest into the adapter sandbox folder.
- List artifacts: create and read a local `adapter-index.fixture.json`.
- Read metadata: read the copied manifest and index entry.
- Verify artifact: compare SHA-256 checksums and fixture flags.
- Delete artifact: not implemented in Phase 34.

## Fixture-Only Policy

- Input data must have `environment: fixture`.
- Input data must have `contains_real_data: false`.
- Input data must have `contains_secret: false`.
- Fixture marker must stay `SAMPLE_FIXTURE_ONLY`.
- Adapter output marker is `LOCAL_STORAGE_ADAPTER_ONLY`.

## Verification Rules

- Source fixture checksum must match the source manifest.
- Copied fixture checksum must match the source fixture checksum.
- Copied manifest checksum must match the source manifest checksum.
- Adapter index must include artifact name, manifest name, storage key, checksums, environment marker, and verification status.
- Secret-like patterns must fail the adapter run.

## No-Cloud Policy

Phase 34 does not use cloud storage:

- No Cloudflare R2 API.
- No Google Drive API.
- No Supabase Storage API.
- No provider SDK.
- No network request.
- No bucket or folder creation outside the repo.
- No upload outside `fixtures/backup-sandbox/adapter/`.

## Secret/Privacy Guardrails

- Do not read `.env.local`.
- Do not read `.dev.vars`.
- Do not print token, key, password, or secret values.
- Do not use service-role credentials.
- Do not use production family data.
- Do not write production backup files.

## What This Proves

- The adapter contract can be exercised locally.
- Fixture artifact copy is deterministic.
- Manifest/checksum verification can run after a simulated put operation.
- Local metadata/index shape is ready for upload verification dry-run.

## What This Does Not Prove

- It does not prove Cloudflare R2, Google Drive, or Supabase Storage access.
- It does not prove production backup upload.
- It does not prove production restore.
- It does not prove retention deletion safety against real storage.
- It does not prove operator credential setup.

## PASS/FAIL Criteria

PASS when:

- `npm run backup:storage:adapter:local` prints `LOCAL_STORAGE_ADAPTER_ONLY`.
- Fixture and manifest are copied into `fixtures/backup-sandbox/adapter/`.
- Adapter index is generated.
- Checksums match.
- Secret scan passes.
- No production mutation occurs.

FAIL when:

- Script reads env files.
- Script calls network/API/DB.
- Script uses provider SDK patterns.
- Script writes outside `fixtures/backup-sandbox/adapter/`.
- Script uploads cloud artifacts.
- Script restores production.

## Phase 34 Boundary

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
- Do not delete production backup files.
- Do not restore production.
- Do not create scheduled backup jobs.
- Do not add GitHub Actions scheduled trigger.
- Do not hardcode secret/token/key values.
- Do not commit `.env.local` or `.dev.vars`.
- Do not commit `GIA_PHA_GITHUB_MENU.bat` if it remains an out-of-scope working tree change.

## Next Phase

- Phase 35 - Storage Upload Verification Dry-Run.
