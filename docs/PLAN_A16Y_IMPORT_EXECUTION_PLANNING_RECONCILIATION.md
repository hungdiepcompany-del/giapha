# A-16Y - Import Execution Planning Reconciliation

## Status

- Marker: `A-16Y-IMPORT-EXECUTION-PLANNING-RECONCILIATION`.
- Planning status:
  `A16Y_IMPORT_EXECUTION_PLANNING_STATUS=PASS_PLANNING_RECONCILED_A16R_RETRY_BLOCKED`.
- True objective:
  `A16Y_TRUE_OBJECTIVE=SAFELY_IMPORT_GIA_PHA_4_DATA_INTO_PRODUCTION_WITH_DRY_RUN_AUDIT_OWNER_APPROVAL_AND_ROLLBACK_GATES`.
- Current blocker:
  `A16X_BLOCKER=OWNER_PROVIDED_JSON_SHAPE_MISMATCH_FAMILY_BACKUP_NOT_A16O_FULL_RELATIONSHIP_AUDIT_EXPORT`.
- A-16R import retry remains:
  `A16R_IMPORT_RETRY_NEXT=NO`.

## Completed Evidence Phases

- A-16O evidence publication is complete and pushed.
- A-16W full authenticated relationship audit export readiness is complete.
- A-16X owner-provided JSON verification is complete locally and pushed before
  this planning phase.
- A-16X result:
  `A16X_OWNER_JSON_CLASSIFICATION=FAMILY_BACKUP_JSON_NOT_A16O_AUDIT_EXPORT`.
- A-16X shape match:
  `A16X_A16O_FULL_AUDIT_EXPORT_SHAPE_MATCH=NO`.
- A-16X A-16N audit result:
  `A16X_OFFLINE_A16N_FULL_AUDIT_RUN=NO_SHAPE_MISMATCH`.

## Why family.json Is Not Enough

The owner-provided file matched the supplied SHA256 but had backup-style fields
such as `people`, `families`, `family_parents`, `family_children`,
`couple_relationships`, `tree_layouts`, and `tree_layout_nodes`.

The general `family.json` backup is valuable for backup/restore, but it is not
evidence for the A-16O dry-run relationship audit because it does not include:

- `marker=A16O_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY`.
- `sessionId=2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
- `summary`.
- `proposedPeople`.
- `proposedRelationships`.
- dry-run write flags such as `readOnly=true`, `dbWrite=false`,
  `relationshipWrite=false`, and `officialImportOpen=false`.

Therefore:

`A16Y_FAMILY_JSON_BACKUP_SUFFICIENT_FOR_A16R_RETRY=NO`

## Missing Artifact

Missing required artifact:

`A16Y_MISSING_ARTIFACT=A16O_FULL_RELATIONSHIP_AUDIT_EXPORT_JSON`

Required authenticated admin GET:

`GET /api/admin/import-sessions/2af4bfb6-a20e-453e-9804-1b8c0afbdd68/dry-run-preview?auditExport=relationships-full`

Required production URL:

`https://web-gia-pha.hungdiepcompany.workers.dev/api/admin/import-sessions/2af4bfb6-a20e-453e-9804-1b8c0afbdd68/dry-run-preview?auditExport=relationships-full`

Required expected fields:

- `marker`.
- `sessionId`.
- `summary`.
- `proposedPeople`.
- `proposedRelationships`.
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
- `summary.proposedPeopleExportCount=102`.
- `summary.proposedRelationshipExportCount=134`.

## Current UI/API Exposure

Implementation read-only inspection found:

- `/admin/exports` exposes the general backup downloads:
  `family.json`, `family.ged`, and `full-backup.zip`.
- `/admin/exports/download/json` builds the general family backup JSON.
- `/admin/exports/import` renders the Gia Pha 4 import/staging review surface
  but does not clearly expose an owner-facing A-16O full audit export download.
- The A-16O API path exists:
  `/api/admin/import-sessions/[sessionId]/dry-run-preview?auditExport=relationships-full`.

Conclusion:

`A16Y_PRODUCTION_UI_CORRECT_A16O_AUDIT_EXPORT_DOWNLOAD_EXPOSED=NO_OR_UNCLEAR`

`A16Y_GENERAL_FAMILY_BACKUP_DOWNLOAD_EXPOSED=YES`

`A16Y_A16O_AUDIT_EXPORT_API_EXISTS=YES`

## Required Gate Sequence Before Any A-16R Retry

1. `A-16Z-AUDIT-EXPORT-DOWNLOAD-PATH-EXPOSURE`
   - Expose or document the correct read-only A-16O full audit export download
     path for the audited session.
   - Do not expose POST import execution.
   - Do not make `family.json` look like the audit export.
2. Owner fetches the authenticated A-16O JSON from the audited session URL and
   saves it locally under `.tmp\` or another non-committed path.
3. `A-16AA-FULL-AUDIT-EXPORT-SHAPE-VERIFY`
   - Verify SHA/size/sanitized shape only.
   - Confirm marker, session id, summary, proposed people and proposed
     relationships are present.
   - Do not print or commit raw JSON.
4. Run the offline/read-only A-16N relationship audit only after the shape is
   correct:
   `npm run audit:a16n-full-dry-run-relationships -- .tmp\a16o-dry-run-relationship-audit-export-full.json`.
5. Resolve full-audit findings by one explicit path:
   - parser/staging/SQL mapping fix followed by a new dry-run and full audit; or
   - owner accepts all source relationship roles after full audit evidence.
6. Reconcile the official import execution gates:
   - audited session id only:
     `2af4bfb6-a20e-453e-9804-1b8c0afbdd68`;
   - bad/unverified session remains forbidden:
     `ae7a5fe3-6a29-4f60-85f7-76108ed02565`;
   - duplicate decisions complete;
   - transaction branch and rollback/idempotency evidence present;
   - production deploy/smoke evidence current;
   - explicit owner approval markers present.
7. Only then may a separate future A-16R retry phase be considered. It must be
   separately requested and must still stop before execution if any gate is
   missing.

Current retry gate:

`A16Y_A16R_IMPORT_RETRY_STATUS=NO_BLOCKED_BY_A16X_SHAPE_MISMATCH_AND_MISSING_A16O_AUDIT_EXPORT`

## Allowed Next-phase List

- `A-16Z-AUDIT-EXPORT-DOWNLOAD-PATH-EXPOSURE`
- `A-16AA-FULL-AUDIT-EXPORT-SHAPE-VERIFY`
- `A-16AB-FULL-RELATIONSHIP-AUDIT-RUN-OFFLINE`
- `A-16AC-RELATIONSHIP-ROLE-MAPPING-FIX-OR-OWNER-ACCEPTANCE-PLAN`
- `A-16AD-FINAL-A16R-RETRY-PREFLIGHT-RECONCILIATION`

## Forbidden Work List

- Do not run POST `/official-import`.
- Do not retry A-16R import.
- Do not run direct RPC official import.
- Do not perform SQL/DB mutation.
- Do not run migration repair, seed, or db push.
- Do not mutate users, roles, permissions, memberships, auth settings, or
  genealogy data.
- Do not run local Windows deploy.
- Do not run Wrangler deploy.
- Do not edit `wrangler.toml` or `app/layout.tsx`.
- Do not commit raw JSON evidence.
- Do not print private JSON contents.
- Do not start unrelated UI, backup, domain, backup-service, media, custom
  domain, monitoring, or public-site work.

## Runtime Guardrail Review

- Main Worker touched: `NO`.
- Runtime dependency added: `NO`.
- New service Worker created: `NO`.
- OpenNext/Wrangler config changed: `NO`.
- Worker size risk: `NO`.
- Service boundary recommendation:
  `NONE_FOR_A16Y_PLANNING_ONLY`; if future A-16Z adds UI/API download exposure,
  keep it read-only and scoped to the existing small A-16O audit export route.
