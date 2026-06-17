# Local Sandbox Backup Storage Simulation

## Status

LOCAL_SANDBOX_BACKUP_STORAGE_SIMULATION_BASELINE

Phase 28 adds a local sandbox storage simulation for backup readiness. It copies fixture-only backup files into `fixtures/backup-sandbox/` and writes a local index. It does not read env files, call network/API/DB, use cloud storage, upload files outside the repo, restore data, deploy, push, change schema, or mutate real data.

## Production Baseline

- Worker name: `web-gia-pha`
- Current production URL: https://web-gia-pha.hungdiepcompany.workers.dev/
- Backup readiness CI gate: PASS
- Backup pipeline readiness gate: PASS
- No storage target has been selected.
- No production backup job or cron exists.
- Custom domain has not been cut over.

## Sandbox Storage Goal

The goal is to prove that fixture backup files can be staged into a storage-like local folder with an index before selecting any real storage target.

The command must print `LOCAL_SANDBOX_ONLY`.

## Local-Only Storage Simulation

The sandbox folder is:

```text
fixtures/backup-sandbox/
```

The script only reads:

- `fixtures/backup/sample-family.fixture.json`
- `fixtures/backup/sample-family.manifest.fixture.json`

The script only writes fixture/sample outputs under `fixtures/backup-sandbox/`.

## Files Copied

The simulation copies:

- `sample-family.fixture.json`
- `sample-family.manifest.fixture.json`

The copied files are still fixture data, not production backup data.

## Storage Index Simulation

The script writes:

```text
fixtures/backup-sandbox/storage-index.fixture.json
```

Index fields include:

- `marker`
- `environment`
- `storage`
- `contains_real_data`
- `contains_secret`
- `files`
- `result`

## Security/Privacy Guardrails

- Do not read `.env.local`.
- Do not read `.dev.vars`.
- Do not print secret/token/key values.
- Do not call network/API/DB.
- Do not use cloud storage providers.
- Do not upload fixture files outside the repo.
- Do not include real family data.
- Do not restore production.
- Do not hardcode secret/token/key values.

## What This Proves

- Fixture and manifest can be staged together.
- A local storage-like index can describe staged files.
- The workflow can check file presence and metadata before a real storage target exists.

## What This Does Not Prove

- It does not prove real storage upload works.
- It does not prove access control for a real bucket or folder.
- It does not prove retention lifecycle rules.
- It does not prove production backup creation.
- It does not prove restore production is safe.

## PASS/FAIL Criteria

PASS when:

- Command prints `LOCAL_SANDBOX_ONLY`.
- Fixture and manifest are copied into `fixtures/backup-sandbox/`.
- Storage index exists.
- Storage index marks `contains_real_data: false`.
- Storage index marks `contains_secret: false`.
- No network/API/DB/cloud behavior appears.

FAIL when:

- Fixture or manifest is missing.
- Manifest integrity fails.
- Script tries to read env files.
- Script calls external services.
- Script uploads outside the local sandbox.
- Script writes production backup data.

## Phase 28 Boundary

- Do not deploy in Phase 28.
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

- Phase 29 - Backup Artifact Retention Policy Gate.
