# Storage Adapter Contract & Safety Guardrails

## Production Baseline

- Worker name: `web-gia-pha`
- Current production URL: https://web-gia-pha.hungdiepcompany.workers.dev/
- Sandbox recommendation from Phase 32: continue local sandbox storage first.
- Production storage target: not selected.
- Production backup upload: not implemented.
- Production restore execution: not implemented.

## Adapter Contract Goal

Phase 33 defines a future storage adapter contract so backup storage behavior can be implemented consistently later. This phase does not connect to any cloud provider. It creates docs, a local contract-shape script, and a checker only.

## Supported Future Providers

The contract is intended to support these future provider families after separate approval:

- Local sandbox adapter
- Cloudflare R2 adapter
- Google Drive adapter
- Supabase Storage adapter
- Offline/operator-managed adapter

Provider-specific implementations are not created in Phase 33.

## Adapter Method Contract

Conceptual methods:

```text
putBackupArtifact(input)
getBackupArtifactMetadata(input)
listBackupArtifacts(input)
verifyBackupArtifact(input)
deleteBackupArtifact(input)
```

All methods must accept structured input and return structured output. They must never print secret values.

## Manifest Requirements

Every artifact operation must keep a manifest with:

- artifact name
- provider-neutral storage key
- fixture or production environment marker
- checksum
- created timestamp
- contains real data flag
- contains secret flag
- retention class
- verification status

For fixture/sandbox work, `contains_real_data` and `contains_secret` must stay `false`.

## Upload Contract

`putBackupArtifact(input)` must eventually:

- accept artifact bytes or a local fixture path
- require a manifest
- calculate or verify checksum before write
- return provider-neutral metadata
- refuse missing environment markers
- refuse secret-like payloads

Phase 33 does not perform any real upload.

## Verify Contract

`verifyBackupArtifact(input)` must eventually:

- read artifact metadata
- compare checksum
- confirm manifest fields
- confirm retention class
- confirm privacy/secret flags
- return PASS/FAIL with safe messages only

Phase 33 only validates the contract shape.

## List Contract

`listBackupArtifacts(input)` must eventually:

- list artifacts by provider-neutral prefix
- return metadata only by default
- avoid exposing secret values
- support retention and restore drill filtering

Phase 33 does not query any provider.

## Delete/Retention Safety Contract

`deleteBackupArtifact(input)` is design-only in Phase 33. A future implementation must:

- refuse production deletion unless a separate approval gate passes
- require manifest verification
- require retention policy decision
- require operator confirmation
- log safe metadata only
- never delete newest unverified artifacts

No deletion runs in Phase 33.

## Secret/Env Boundary

- Do not read `.env.local`.
- Do not read `.dev.vars`.
- Do not require provider credentials.
- Do not print token, key, password, or secret values.
- Do not store credential placeholders as real values.
- Keep service-role and provider credentials server-side only in any future implementation.

## Provider-Specific Risks

| Provider | Risk |
| --- | --- |
| Local sandbox | Easy to mistake fixture output for a real backup. |
| Cloudflare R2 | Bucket policy or token scope mistakes can expose private archive data. |
| Google Drive | Folder sharing and account ownership must be governed carefully. |
| Supabase Storage | Backup could remain too coupled to the operational database vendor. |
| Offline/operator storage | Process discipline and restore drill cadence matter more than code. |

## No-Network Policy For Phase 33

Phase 33 is local-only:

- No provider SDK.
- No network request.
- No Cloudflare/Supabase/Google API call.
- No storage upload.
- No storage delete.
- No production backup creation.
- No production restore.

## Acceptance Criteria

- Contract methods are documented.
- Manifest, upload, verify, list, and delete/retention safety rules are documented.
- `npm run backup:storage:contract` prints `STORAGE_ADAPTER_CONTRACT_ONLY`.
- `npm run check:storage-adapter-contract-guardrails` passes.
- Package scripts exist.
- No real provider integration exists.

## Phase 33 Boundary

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

- Phase 34 - Local Sandbox Storage Adapter Prototype.
