# A-16X - Full Authenticated Relationship Audit Export Evidence Verification

## Status

- Marker: `A-16X-FULL-AUTHENTICATED-RELATIONSHIP-AUDIT-EXPORT-EVIDENCE-VERIFICATION`.
- Verification status:
  `A16X_FULL_AUTHENTICATED_EXPORT_EVIDENCE_STATUS=BLOCKED_JSON_SHAPE_MISMATCH`.
- Exact blocker:
  `A16X_BLOCKER=OWNER_PROVIDED_JSON_SHAPE_MISMATCH_FAMILY_BACKUP_NOT_A16O_FULL_RELATIONSHIP_AUDIT_EXPORT`.
- Classification:
  `A16X_OWNER_JSON_CLASSIFICATION=FAMILY_BACKUP_JSON_NOT_A16O_AUDIT_EXPORT`.
- A-16O PASS status preserved:
  `A16O_DEPLOY_SMOKE_READY_OWNER_FULL_JSON_NEEDED`.
- A-16O auth boundary preserved:
  `A16O_EXPORT_AUTH_BOUNDARY_PASS`.
- A-16R import retry remains:
  `A16R_IMPORT_RETRY_NEXT=NO`.

## Owner-provided File

- Owner marker:
  `OWNER_PROVIDED_A16W_AUTHENTICATED_FULL_RELATIONSHIP_AUDIT_EXPORT_JSON`.
- Owner source path:
  `D:\CODE\gia-pha-family-20260708.json`.
- Local target path:
  `.tmp\a16o-dry-run-relationship-audit-export-full.json`.
- File available locally:
  `A16X_OWNER_JSON_FILE_AVAILABLE=YES`.
- File size:
  `A16X_OWNER_JSON_FILE_SIZE_BYTES=33121`.
- SHA256:
  `A16X_OWNER_JSON_SHA256=380E45CFDDAE78D0FEA9904B45B7901901708915E335B8D000428A962B5DE513`.
- SHA256 owner match:
  `A16X_OWNER_JSON_SHA256_MATCH=YES`.
- Raw JSON committed:
  `A16X_RAW_FULL_JSON_EVIDENCE_COMMITTED=NO`.

## Sanitized Shape Evidence

Top-level type:

`A16X_OWNER_JSON_TOP_LEVEL_TYPE=object`

Top-level keys observed:

`app_export_version`, `app_name`, `app_version`, `clan_branches`, `clans`,
`couple_relationships`, `export_scope`, `exported_at`, `exported_by`,
`families`, `family_children`, `family_parents`, `generation_rules`,
`manifest`, `people`, `person_branch_memberships`, `privacy_mode`,
`privacy_scope`, `schema_version`, `tree_layout_nodes`, `tree_layouts`.

Sanitized array counts:

- `people=8`.
- `families=7`.
- `family_parents=6`.
- `family_children=6`.
- `couple_relationships=3`.
- `tree_layout_nodes=13`.
- `tree_layouts=1`.
- `clans=0`.
- `clan_branches=0`.
- `generation_rules=0`.
- `person_branch_memberships=0`.

## Expected A-16O Full Audit Export Shape

The required A-16O full audit export must include:

- `marker=A16O_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY`.
- `sessionId=2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
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
- `summary.proposedPeopleCount=102`.
- `summary.proposedPeopleExportCount=102`.
- `summary.proposedRelationshipCount=134`.
- `summary.proposedRelationshipExportCount=134`.
- `summary.exportCapped=false`.
- `proposedPeople.length=102`.
- `proposedRelationships.length=134`.

## Shape Verification Result

The owner-provided file is valid JSON, but it does not match the expected A-16O
full relationship audit export shape.

Missing expected A-16O audit fields:

- `marker`.
- `sessionId`.
- `dryRunPreviewOnly`.
- `auditExportOnly`.
- `fullRelationshipAuditExport`.
- `readOnly`.
- `dbWrite`.
- `peopleWrite`.
- `relationshipWrite`.
- `treeLayoutWrite`.
- `revisionWrite`.
- `canProceedToOfficialImport`.
- `officialImportOpen`.
- `summary`.
- `proposedPeople`.
- `proposedRelationships`.

Observed backup-style keys include:

- `app_export_version`.
- `app_name`.
- `schema_version`.
- `manifest`.
- `people`.
- `families`.
- `family_parents`.
- `family_children`.
- `couple_relationships`.
- `tree_layouts`.
- `tree_layout_nodes`.

Therefore:

`A16X_A16O_FULL_AUDIT_EXPORT_SHAPE_MATCH=NO`

`A16X_OFFLINE_A16N_FULL_AUDIT_RUN=NO_SHAPE_MISMATCH`

`A16X_A16N_FULL_RELATIONSHIP_AUDIT_JSON_ACCEPTED=NO`

## Required Next Evidence

Owner needs to provide the JSON returned by this exact authenticated admin GET
route, not a family backup export:

`https://web-gia-pha.hungdiepcompany.workers.dev/api/admin/import-sessions/2af4bfb6-a20e-453e-9804-1b8c0afbdd68/dry-run-preview?auditExport=relationships-full`

Save it locally as:

`.tmp\a16o-dry-run-relationship-audit-export-full.json`

Then a later read-only/offline phase may run:

`npm run audit:a16n-full-dry-run-relationships -- .tmp\a16o-dry-run-relationship-audit-export-full.json`

Expected later acceptance marker if the correct shape is provided:

`A16N_FULL_RELATIONSHIP_AUDIT_JSON_ACCEPTED`

## No-go Rule

`A16X_NO_GO_RULE=A16R_IMPORT_RETRY_REMAINS_BLOCKED_UNTIL_OWNER_PROVIDES_A16O_FULL_AUDIT_EXPORT_JSON_AND_A16N_OFFLINE_AUDIT_ACCEPTS_IT`

The family backup JSON must not be used as A-16O relationship audit evidence and
must not be used to trigger import execution.

## Safety Boundaries

- `A16X_POST_OFFICIAL_IMPORT_CALLED=NO`.
- `A16X_DIRECT_RPC_OFFICIAL_IMPORT_CALLED=NO`.
- `A16X_A16R_IMPORT_RETRY_RUN=NO`.
- `A16X_REAL_GENEALOGY_WRITE=NO`.
- `A16X_SQL_RUN=NO`.
- `A16X_DB_PUSH_RUN=NO`.
- `A16X_MIGRATION_REPAIR_RUN=NO`.
- `A16X_SEED_RUN=NO`.
- `A16X_PERMISSIONS_ROLES_AUTH_USERS_MEMBERSHIPS_MUTATED=NO`.
- `A16X_DEPLOY_RUN=NO`.
- `A16X_WINDOWS_LOCAL_DEPLOY_RUN=NO`.
- `A16X_WRANGLER_DEPLOY_RUN=NO`.
- `A16X_WRANGLER_TOML_CHANGED=NO`.
- `A16X_APP_LAYOUT_TSX_CHANGED=NO`.
- `A16X_RAW_JSON_CONTENT_PRINTED=NO`.
- `A16X_RAW_FULL_JSON_EVIDENCE_COMMITTED=NO`.

## Runtime Guardrail Review

- Main Worker touched: `NO`.
- Runtime dependency added: `NO`.
- New service Worker created: `NO`.
- OpenNext/Wrangler config changed: `NO`.
- Worker size risk: `NO`.
- Service boundary recommendation: `NONE_FOR_THIS_OFFLINE_SHAPE_VERIFICATION_PHASE`.
