# A-16O - Deploy Read-only Audit Export Smoke

## Status

- Marker: `A-16O-DEPLOY-READ-ONLY-AUDIT-EXPORT-SMOKE`.
- Implementation commit:
  `e74ec38 feat: add A16O read-only full relationship audit export`.
- Owner deploy evidence:
  `OWNER_CONFIRMED_A16O_GITHUB_ACTIONS_DEPLOY_SUCCEEDED_FOR_COMMIT_e74ec38`.
- Deploy method used:
  `GITHUB_ACTIONS_CLOUDFLARE_DEPLOY_WORKFLOW_BRANCH_MAIN`.
- Production worker URL:
  `https://web-gia-pha.hungdiepcompany.workers.dev`.
- Full export URL:
  `https://web-gia-pha.hungdiepcompany.workers.dev/api/admin/import-sessions/2af4bfb6-a20e-453e-9804-1b8c0afbdd68/dry-run-preview?auditExport=relationships-full`.
- Smoke classification:
  `A16O_DEPLOY_SMOKE_READY_OWNER_FULL_JSON_NEEDED`.
- Auth boundary:
  `A16O_EXPORT_AUTH_BOUNDARY_PASS`.
- A-16R import retry remains:
  `A16R_IMPORT_RETRY_NEXT=NO`.

## Preflight

- Branch: `main`.
- Remote slug: `hungdiepcompany-del/giapha.git`.
- Working tree before smoke docs changes: clean.
- Cached `git rev-list --left-right --count HEAD...origin/main`: `0 / 0`.
- `origin/main` contains A-16O implementation commit:
  `e74ec38 feat: add A16O read-only full relationship audit export`.
- Bad/unverified session remains blocked and was not used for approval:
  `ae7a5fe3-6a29-4f60-85f7-76108ed02565`.
- `git fetch origin --prune` caveat: local sandbox still cannot write
  `.git/FETCH_HEAD`, so cached synced refs and owner confirmation were used.

## Deploy Evidence

- Owner confirmed GitHub Actions Cloudflare Deploy succeeded on branch `main`
  for commit `e74ec38`.
- Codex did not run Windows-local deploy.
- Codex did not run `wrangler deploy`.
- Codex did not run local OpenNext deploy.

## GET-only Production Smoke

All smoke requests were GET-only.

| Route | Result | Notes |
| --- | --- | --- |
| `/` | `HTTP 200` | Public route reachable. |
| `/auth/login` | `HTTP 200` | Login route reachable. |
| `/admin/exports/import` | `HTTP 200` | Import admin page route reachable from CLI. |
| `/api/admin/import-sessions/2af4bfb6-a20e-453e-9804-1b8c0afbdd68/dry-run-preview` | `HTTP 401` | Unauthenticated JSON boundary; expected for CLI without admin session. |
| `/api/admin/import-sessions/2af4bfb6-a20e-453e-9804-1b8c0afbdd68/dry-run-preview?auditExport=relationships-full` | `HTTP 401` | Unauthenticated JSON boundary; `A16O_EXPORT_AUTH_BOUNDARY_PASS`. |

The first local non-escalated web client attempts failed with a Windows TLS /
Schannel receive error before reaching the worker. The same GET-only smoke was
then rerun through approved network context and reached production.

## Authenticated Full Export Status

- Authenticated admin full export JSON was not available locally at:
  `.tmp\a16o-dry-run-relationship-audit-export-full.json`.
- Offline A-16N audit was not run.
- Do not treat the unauthenticated `401` response as full 102/134 audit evidence.
- Do not treat the unauthenticated `401` response as full 102/134 audit
  evidence.
- Classification:
  `A16O_DEPLOY_SMOKE_READY_OWNER_FULL_JSON_NEEDED`.

Expected full export contract still required for owner-authenticated browser
smoke:

- `marker=A16O_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY`.
- `sourceMarker=A16L_DRY_RUN_MAPPING_PREVIEW_FROM_MANIFEST_STAGING`.
- `approvalMarker=APPROVE_A16K_IMPORT_DRY_RUN_GATE`.
- `dryRunPreviewOnly=true`.
- `auditExportOnly=true`.
- `fullRelationshipAuditExport=true`.
- `readOnly=true`.
- `dbWrite=false`.
- `peopleWrite=false`.
- `relationshipWrite=false`.
- `treeLayoutWrite=false`.
- `revisionWrite=false`.
- `canProceedToOfficialImport=false`.
- `officialImportOpen=false`.
- `proposedPeopleCount=102`.
- `proposedPeopleExportCount=102`.
- `proposedRelationshipCount=134`.
- `proposedRelationshipExportCount=134`.
- `exportCapped=false`.
- `proposedPeople.length=102`.
- `proposedRelationships.length=134`.

## Next Owner Step

Owner should open the full export URL in an authenticated admin browser session,
save the JSON locally as:

`.tmp\a16o-dry-run-relationship-audit-export-full.json`

Then run:

`npm run audit:a16n-full-dry-run-relationships -- .tmp\a16o-dry-run-relationship-audit-export-full.json`

Expected offline audit acceptance marker:

`A16N_FULL_RELATIONSHIP_AUDIT_JSON_ACCEPTED`

## Safety Boundaries

- `A16O_DEPLOY_SMOKE_POST_OFFICIAL_IMPORT_CALLED=NO`.
- `A16O_DEPLOY_SMOKE_DIRECT_RPC_OFFICIAL_IMPORT_CALLED=NO`.
- `A16O_DEPLOY_SMOKE_REAL_GENEALOGY_WRITE=NO`.
- `A16O_DEPLOY_SMOKE_SQL_RUN=NO`.
- `A16O_DEPLOY_SMOKE_DB_PUSH_RUN=NO`.
- `A16O_DEPLOY_SMOKE_MIGRATION_REPAIR_RUN=NO`.
- `A16O_DEPLOY_SMOKE_SEED_RUN=NO`.
- `A16O_DEPLOY_SMOKE_PERMISSIONS_ROLES_AUTH_USERS_MEMBERSHIPS_MUTATED=NO`.
- `A16O_DEPLOY_SMOKE_WINDOWS_LOCAL_DEPLOY_RUN=NO`.
- `A16O_DEPLOY_SMOKE_WRANGLER_TOML_CHANGED=NO`.
- `A16O_DEPLOY_SMOKE_APP_LAYOUT_TSX_CHANGED=NO`.
- `A16O_DEPLOY_SMOKE_RAW_JSON_EVIDENCE_COMMITTED=NO`.
- `A16O_DEPLOY_SMOKE_CAN_PROCEED_TO_OFFICIAL_IMPORT=false`.
- `A16O_DEPLOY_SMOKE_OFFICIAL_IMPORT_OPEN=false`.
