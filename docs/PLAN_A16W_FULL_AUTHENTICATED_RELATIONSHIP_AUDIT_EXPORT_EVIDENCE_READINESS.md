# A-16W - Full Authenticated Relationship Audit Export Evidence Readiness

## Status

- Marker: `A-16W-FULL-AUTHENTICATED-RELATIONSHIP-AUDIT-EXPORT-EVIDENCE-READINESS`.
- Readiness status:
  `A16W_FULL_AUTHENTICATED_EXPORT_EVIDENCE_STATUS=BLOCKED_OWNER_AUTHENTICATED_FULL_JSON_NOT_AVAILABLE`.
- Exact blocker:
  `A16W_BLOCKER=OWNER_AUTHENTICATED_FULL_RELATIONSHIP_AUDIT_EXPORT_JSON_MISSING`.
- A-16O production smoke remains:
  `A16O_DEPLOY_SMOKE_READY_OWNER_FULL_JSON_NEEDED`.
- A-16O unauthenticated API boundary remains:
  `A16O_EXPORT_AUTH_BOUNDARY_PASS`.
- A-16R import retry remains:
  `A16R_IMPORT_RETRY_NEXT=NO`.

## Current Evidence State

- A-16O evidence publication is complete at:
  `c3494db docs: record A16O production smoke verification`.
- Production deploy evidence from A-16O remains accepted:
  `OWNER_CONFIRMED_A16O_GITHUB_ACTIONS_DEPLOY_SUCCEEDED_FOR_COMMIT_e74ec38`.
- Production GET smoke remains accepted:
  `/` = `HTTP 200`;
  `/auth/login` = `HTTP 200`;
  `/admin/exports/import` = `HTTP 200`.
- Unauthenticated API boundary remains accepted:
  default dry-run preview API = `HTTP 401`;
  full audit export API = `HTTP 401`;
  `A16O_EXPORT_AUTH_BOUNDARY_PASS`.
- Full authenticated export JSON is not available locally at:
  `.tmp\a16o-dry-run-relationship-audit-export-full.json`.
- The only local `.tmp` artifact observed for this readiness phase was:
  `.tmp\a16n-dry-run-preview.json`.
- The A-16N offline full audit was not run in this phase because the required
  authenticated full 102/134 export JSON is missing.

## Required Full Authenticated Export

Required production URL for owner-authenticated admin browser fetch:

`https://web-gia-pha.hungdiepcompany.workers.dev/api/admin/import-sessions/2af4bfb6-a20e-453e-9804-1b8c0afbdd68/dry-run-preview?auditExport=relationships-full`

Audited session:

`A16W_AUDITED_IMPORT_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68`

Bad/unverified session that must not be used for approval:

`A16W_BAD_UNVERIFIED_SESSION_ID=ae7a5fe3-6a29-4f60-85f7-76108ed02565`

The owner-authenticated JSON must be saved locally outside committed evidence as:

`.tmp\a16o-dry-run-relationship-audit-export-full.json`

The required response contract remains:

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

## Safe Validation Path

When the owner-authenticated JSON exists, run only the offline/read-only audit:

`npm run audit:a16n-full-dry-run-relationships -- .tmp\a16o-dry-run-relationship-audit-export-full.json`

Optional local markdown report, not raw JSON evidence:

`npm run audit:a16n-full-dry-run-relationships -- .tmp\a16o-dry-run-relationship-audit-export-full.json --markdown .tmp\a16o-full-relationship-audit-report.md`

Expected acceptance marker:

`A16N_FULL_RELATIONSHIP_AUDIT_JSON_ACCEPTED`

Do not run the audit against unauthenticated `401` output. Do not treat the
capped preview as full evidence; the full audit script rejects capped 100/134
payloads with:

`A16N_CAPPED_PREVIEW_JSON_REJECTED_FOR_FULL_AUDIT`

## Gate Result

`A16W_FULL_AUTHENTICATED_EXPORT_EVIDENCE_AVAILABLE=NO`

`A16W_FULL_AUTHENTICATED_EXPORT_EVIDENCE_MISSING=YES`

`A16W_FULL_AUTHENTICATED_EXPORT_EVIDENCE_BLOCKED=YES`

`A16W_OFFLINE_A16N_FULL_AUDIT_RUN=NO`

`A16W_A16R_IMPORT_RETRY_STATUS=NO_FULL_EXPORT_EVIDENCE_MISSING`

## No-go Rule

`A16W_NO_GO_RULE=A16R_IMPORT_RETRY_REMAINS_BLOCKED_UNTIL_OWNER_AUTHENTICATED_FULL_EXPORT_JSON_EXISTS_AND_A16N_FULL_AUDIT_ACCEPTS_IT`

Even if the full export gate becomes ready later, actual A-16R official import
execution must remain a separate owner-approved phase.

## Safety Boundaries

- `A16W_POST_OFFICIAL_IMPORT_CALLED=NO`.
- `A16W_DIRECT_RPC_OFFICIAL_IMPORT_CALLED=NO`.
- `A16W_A16R_IMPORT_RETRY_RUN=NO`.
- `A16W_REAL_GENEALOGY_WRITE=NO`.
- `A16W_SQL_RUN=NO`.
- `A16W_DB_PUSH_RUN=NO`.
- `A16W_MIGRATION_REPAIR_RUN=NO`.
- `A16W_SEED_RUN=NO`.
- `A16W_PERMISSIONS_ROLES_AUTH_USERS_MEMBERSHIPS_MUTATED=NO`.
- `A16W_DEPLOY_RUN=NO`.
- `A16W_WINDOWS_LOCAL_DEPLOY_RUN=NO`.
- `A16W_WRANGLER_DEPLOY_RUN=NO`.
- `A16W_WRANGLER_TOML_CHANGED=NO`.
- `A16W_APP_LAYOUT_TSX_CHANGED=NO`.
- `A16W_RAW_FULL_JSON_EVIDENCE_COMMITTED=NO`.

## Runtime Guardrail Review

- Main Worker touched: `NO`.
- Runtime dependency added: `NO`.
- New service Worker created: `NO`.
- OpenNext/Wrangler config changed: `NO`.
- Worker size risk: `NO`.
- Service boundary recommendation: `NONE_FOR_THIS_READINESS_DOC_CHECKER_PHASE`.
