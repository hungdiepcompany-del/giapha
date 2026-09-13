# M2A Private R2 Recoverability Source and Local Fixture

## Goal

M2A adds a bounded recoverability proof inside the existing backup-service scaffold. It is restricted to the existing checked-in sample fixture and an R2-compatible in-memory local test double.

## Safety Contract

- `BACKUP_SERVICE_MODE` remains exactly `scaffold` by default.
- Only explicit `fixture-local` mode may reach the R2 `put`/`get` path.
- The route requires the existing bearer token and compares SHA-256 digests with Web Crypto `timingSafeEqual`.
- The request must match the exact SHA-256 allowlist for the existing `SAMPLE_FIXTURE_ONLY` fixture. Marker, `environment: fixture`, `contains_real_data: false`, and `contains_secret: false` are all validated after parsing.
- Plaintext is bounded, encrypted with Web Crypto AES-256-GCM using a random 12-byte IV, and authenticated with a stable JSON manifest as AAD.
- Plaintext, ciphertext, and stored artifact SHA-256 values are checked. R2 object metadata records hashes and artifact format; no list or delete operation exists.
- Responses return only hashes and counts, never fixture payloads, tokens, or encryption keys.

## Local Binding and Secrets

The top-level scaffold declares no R2 binding and requires only
`BACKUP_SERVICE_INTERNAL_TOKEN` for legacy internal endpoints. The non-inheritable
fixture mode, `BACKUP_BUCKET`, and `BACKUP_ENCRYPTION_KEY_B64` are declared only
under named `env.fixture-local`, alongside its own internal-token declaration.
`remote: false` controls local-development binding behavior only; it does not make
the named environment deployment-safe, prevent remote provisioning, or authorize
`wrangler deploy --env fixture-local`. No deploy or resource provisioning path is
described or authorized.

## Validation

- `npm run test:m2a-private-r2-recoverability-fixture`
- `npm run check:m2a-private-r2-recoverability`
- `npx wrangler types --check --env fixture-local` from `services/backup-service`

The fixture test covers success, wrong key, tampered ciphertext/manifest/checksum, invalid fixture marker/flags, and oversize input with no persistent artifacts or remote calls.

## Explicitly Not Done

No bucket creation, remote R2 access, deployment, route configuration, production backup, restore, main app integration, SQL, import, Auth/RLS change, commit, or push is included.
