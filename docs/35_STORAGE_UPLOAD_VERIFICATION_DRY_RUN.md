# Storage Upload Verification Dry-Run

## Production Baseline

- Worker name: `web-gia-pha`
- Current production URL: https://web-gia-pha.hungdiepcompany.workers.dev/
- Local adapter prototype from Phase 34: available.
- Production storage target: not selected.
- Production backup upload: not implemented.
- Production restore execution: not implemented.

## Upload Verification Goal

Phase 35 verifies the local sandbox adapter output as if it were an uploaded artifact, but without uploading anything to cloud storage. It confirms that the copied fixture artifact still matches the manifest, checksum, fixture marker, and secret/privacy guardrails.

## Local Sandbox Artifact Source

The dry-run reads only:

```text
fixtures/backup-sandbox/adapter/sample-family.fixture.json
fixtures/backup-sandbox/adapter/sample-family.manifest.fixture.json
fixtures/backup-sandbox/adapter/adapter-index.fixture.json
```

If the files are missing, run:

```bash
npm run backup:storage:adapter:local
```

## Verification Steps

- Read adapter index.
- Read copied fixture.
- Read copied manifest.
- Verify adapter marker.
- Verify fixture marker.
- Verify manifest checksum.
- Verify adapter index checksum.
- Verify `contains_real_data: false`.
- Verify `contains_secret: false`.
- Run secret-like pattern scan.
- Report `STORAGE_UPLOAD_VERIFY_DRY_RUN_ONLY`.

## Manifest/Checksum Rules

- Manifest `fixture_file` must match the copied fixture name.
- Manifest `fixture_checksum_sha256` must match the copied fixture contents.
- Adapter index `fixture_checksum_sha256` must match the copied fixture contents.
- Adapter index `manifest_checksum_sha256` must match the copied manifest contents.
- Verification status must be `PASS`.

## Secret Scan Rules

The dry-run fails if fixture, manifest, or index content contains:

- JWT-shaped strings
- service-secret-like strings
- password fields
- private key fields
- access token fields

Only safe field names and `contains_secret: false` flags are expected.

## Failure Handling

- Missing adapter artifacts: run `npm run backup:storage:adapter:local`.
- Checksum mismatch: regenerate fixture and adapter output, then inspect diff.
- Secret-like pattern: stop, do not commit the artifact, and investigate source data.
- Unexpected production marker: stop and do not treat the artifact as safe.

## What This Proves

- Local adapter output can be verified after simulated upload.
- Manifest and checksum rules survive the adapter copy step.
- Fixture privacy/secret flags are still safe.
- The artifact is ready for a future provider-specific sandbox prototype.

## What This Does Not Prove

- It does not prove cloud upload.
- It does not prove provider auth.
- It does not prove production backup creation.
- It does not prove production restore.
- It does not prove retention deletion against real storage.

## PASS/FAIL Criteria

PASS when:

- `npm run backup:storage:verify-upload:dry-run` prints `STORAGE_UPLOAD_VERIFY_DRY_RUN_ONLY`.
- Adapter artifacts exist.
- Manifest and checksums match.
- Fixture marker is valid.
- `contains_real_data` is false.
- `contains_secret` is false.
- Secret scan passes.

FAIL when:

- Adapter artifacts are missing.
- Checksums drift.
- Secret-like values are detected.
- Script calls network/API/DB.
- Script uploads cloud artifacts.
- Script restores production.

## Phase 35 Boundary

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
- Do not upload cloud artifacts.
- Do not delete production backup files.
- Do not restore production.
- Do not create scheduled backup jobs.
- Do not add GitHub Actions scheduled trigger.
- Do not hardcode secret/token/key values.
- Do not commit `.env.local` or `.dev.vars`.
- Do not commit `GIA_PHA_GITHUB_MENU.bat` if it remains an out-of-scope working tree change.

## Next Phase

- Phase 36 - Production Backup Approval Checklist.
