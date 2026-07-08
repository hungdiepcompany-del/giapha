# A-16O - Uncap Dry-run Relationship Audit Export Read-only

## Status

- Marker: `A-16O-UNCAP-DRY-RUN-RELATIONSHIP-AUDIT-EXPORT-READ-ONLY`.
- Full export response marker:
  `A16O_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY`.
- Source marker:
  `A16L_DRY_RUN_MAPPING_PREVIEW_FROM_MANIFEST_STAGING`.
- A-16K approval marker:
  `APPROVE_A16K_IMPORT_DRY_RUN_GATE`.
- A-16R import retry remains:
  `A16R_IMPORT_RETRY_NEXT=NO`.

## Why A-16O Is Needed

- Authenticated A-16N dry-run preview JSON was valid and read-only.
- The audited session is:
  `2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
- The bad/unverified session remains:
  `ae7a5fe3-6a29-4f60-85f7-76108ed02565`.
- Current preview counts:
  `proposedPeopleCount=102`, `proposedRelationshipCount=134`,
  `blockedByErrorCount=0`, `warningCount=92`.
- Current preview cap finding:
  `proposedPeoplePreviewCount=100`,
  `proposedRelationshipPreviewCount=100`,
  actual `proposedPeople` array `100`,
  actual `proposedRelationships` array `100`.
- Partial A-16N audit of first 100 relationships found:
  `PASS_CLEAR=66`,
  `REVIEW_ROLE_GENDER_MISMATCH=34`,
  `father_label_source_gender_female=17`,
  `mother_label_source_gender_male=17`,
  `missingPersonLookup=0`,
  `weakConfidence=0`,
  `ambiguousRelationship=0`,
  `directionSuspectedByGeneration=0`.
- Full 134/134 relationship evidence is required before parser/staging/SQL fix
  selection or any official import execution.

## Route Contract

Preferred route/query parameter chosen:

`GET /api/admin/import-sessions/[sessionId]/dry-run-preview?auditExport=relationships-full`

Default UI preview remains capped and unchanged when `auditExport` is absent:

- `proposedPeoplePreviewCount <= 100`.
- `proposedRelationshipPreviewCount <= 100`.
- The default marker remains
  `A16L_DRY_RUN_MAPPING_PREVIEW_FROM_MANIFEST_STAGING`.

Full audit export mode is explicit and read-only:

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
- `exportCapped=false`.
- `sessionId=2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.

Full export summary contract:

- `stagedPeopleCount=102`.
- `proposedPeopleCount=102`.
- `proposedPeopleExportCount=102`.
- `stagedRelationshipCount=134`.
- `proposedRelationshipCount=134`.
- `proposedRelationshipExportCount=134`.
- `blockedByErrorCount=0`.
- `warningCount=92`.
- `canProceedToOfficialImport=false`.
- `exportCapped=false`.

Arrays:

- `proposedPeople` can return all 102 entries.
- `proposedRelationships` can return all 134 entries.
- `issues` carries the available dry-run validation/warning metadata.
- No raw source workbook content is included.
- No secrets, service-role data or unrelated admin data are included.

## Safety And Gates

- The route remains GET-only.
- The route remains authenticated/admin-only through the existing manifest read
  permission gate.
- Full export requires the A-16K audited dry-run session gate and is locked to
  `2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
- The bad/unverified session
  `ae7a5fe3-6a29-4f60-85f7-76108ed02565` is not approved for official import
  or full audit approval.
- Official import remains locked:
  `officialImportOpen=false`,
  `canProceedToOfficialImport=false`,
  `canRunOfficialImport` is not forced true.
- No official import code is called.
- No direct RPC official import is called.
- No real genealogy data is written.
- No people, relationships, tree layout or revisions are mutated.
- No SQL, DB push, migration repair or seed is run.
- No permissions, roles, auth, users or memberships are mutated.
- No deploy or Windows-local deploy is run.
- `wrangler.toml` is unchanged.
- `app/layout.tsx` is unchanged; no `crxlauncher` or hydration suppression is
  added.
- Raw full JSON evidence stays local under `.tmp/` or outside the repo and is
  not committed.

## Offline Audit Script Update

`scripts/audit-a16n-full-dry-run-relationships.cjs` now treats full audit mode
as the default:

- It accepts the new full export JSON.
- It rejects capped 100/134 preview JSON for full audit with:
  `A16N_CAPPED_PREVIEW_JSON_REJECTED_FOR_FULL_AUDIT`.
- It prints/records:
  `A16N_FULL_RELATIONSHIP_AUDIT_JSON_ACCEPTED`
  only when all 102 people and all 134 relationships are present.
- `--partial` is retained only for diagnostic review of capped preview evidence.

## Next Required Phase

This phase does not deploy. A separate owner-approved deploy/smoke phase is
required before using the new export in production:

`A-16O-DEPLOY-READ-ONLY-AUDIT-EXPORT-SMOKE`

After deploy/smoke, owner should fetch the full export JSON and rerun:

`npm run audit:a16n-full-dry-run-relationships -- .tmp\a16o-full-dry-run-relationship-audit-export.json --markdown .tmp\a16o-full-relationship-audit-report.md`

## No-go Rule

Official import remains blocked until full 134/134 relationship audit is
complete and either:

1. parser/staging/SQL fix corrects parent role mapping and dry-run is rerun; or
2. owner explicitly accepts all source relationship roles after full audit.

## Runtime Guardrail Review

- Main Worker touched: `YES`.
- Runtime dependency added: `NO`.
- New service Worker created: `NO`.
- OpenNext/Wrangler config changed: `NO`.
- Worker size risk: `LOW_READ_ONLY_SMALL_JSON_EXPORT_FOR_134_RELATIONSHIPS`.
- Service boundary recommendation: `NONE_FOR_THIS_SMALL_AUDIT_EXPORT`; keep
  larger import validation/export workloads behind later service-boundary
  approval.
