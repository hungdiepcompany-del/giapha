# A-16Z - Owner-facing A-16O Audit Export Download Path

## Status

- Marker: `A-16Z-AUDIT-EXPORT-DOWNLOAD-PATH-EXPOSURE`.
- Status:
  `A16Z_AUDIT_EXPORT_DOWNLOAD_PATH_STATUS=PASS_OWNER_FACING_READ_ONLY_DOWNLOAD_EXPOSED`.
- Purpose:
  `A16Z_PURPOSE=PREVENT_FAMILY_JSON_BACKUP_CONFUSION_WITH_A16O_AUDIT_EXPORT_JSON`.
- A-16R import retry remains:
  `A16R_IMPORT_RETRY_NEXT=NO`.

## Route And UI Path

Exact API route used for the A-16O full relationship audit export JSON:

`GET /api/admin/import-sessions/2af4bfb6-a20e-453e-9804-1b8c0afbdd68/dry-run-preview?auditExport=relationships-full`

Owner-facing UI path:

`/admin/exports/import`

Owner-facing UI component:

`components/imports/import-session-manifest-panel.tsx`

Owner-facing button label:

`Tải A-16O audit export JSON`

Download filename:

`a16o-dry-run-relationship-audit-export-full.json`

## Distinction From family.json

- `family.json` from `/admin/exports/download/json` remains the general backup
  JSON.
- `family.json` is not sufficient evidence for A-16R retry.
- The A-16O full relationship audit export JSON is import-retry evidence only
  after offline shape verification and full relationship audit acceptance.
- The UI copy explicitly says:
  `family.json` is a general backup and is not A-16R retry evidence.

## Read-only Guarantees

- The exposed owner path uses GET only.
- It calls the existing dry-run preview route with
  `auditExport=relationships-full`.
- It is locked to audited session:
  `2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
- It expects marker:
  `A16O_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY`.
- It does not call POST `/official-import`.
- It does not call direct RPC official import.
- It does not set `canRunOfficialImport=true`.
- It does not set `canProceedToOfficialImport=true`.
- It does not set `officialImportOpen=true`.
- It does not write people, relationships, tree layout, revisions, users,
  roles, permissions, memberships, auth settings, or genealogy data.

## Preserved A-16Y Conclusions

- `A16Y_FAMILY_JSON_BACKUP_SUFFICIENT_FOR_A16R_RETRY=NO`.
- `A16Y_MISSING_ARTIFACT=A16O_FULL_RELATIONSHIP_AUDIT_EXPORT_JSON`.
- `A16Y_A16O_AUDIT_EXPORT_API_EXISTS=YES`.
- A-16Y previously recorded:
  `A16Y_PRODUCTION_UI_CORRECT_A16O_AUDIT_EXPORT_DOWNLOAD_EXPOSED=NO_OR_UNCLEAR`.
- A-16Z changes the local source UI readiness to:
  `A16Z_PRODUCTION_UI_CORRECT_A16O_AUDIT_EXPORT_DOWNLOAD_SOURCE_READY=YES`.

Production still needs a later deploy/smoke phase before the owner relies on
the new button in production.

## Next Gate Sequence

1. Deploy/smoke A-16Z through the approved GitHub Actions/Linux path in a later
   explicit phase.
2. Owner downloads the A-16O audit export JSON from `/admin/exports/import`.
3. `A-16AA-FULL-AUDIT-EXPORT-SHAPE-VERIFY` verifies sanitized shape and hash
   without printing raw JSON.
4. `A-16AB-FULL-RELATIONSHIP-AUDIT-RUN-OFFLINE` runs the offline A-16N audit
   only after the shape is correct.
5. A-16R import retry remains blocked until all later gates pass and owner
   explicitly requests the retry phase.

## Safety Boundaries

- `A16Z_POST_OFFICIAL_IMPORT_CALLED=NO`.
- `A16Z_DIRECT_RPC_OFFICIAL_IMPORT_CALLED=NO`.
- `A16Z_A16R_IMPORT_RETRY_RUN=NO`.
- `A16Z_REAL_GENEALOGY_WRITE=NO`.
- `A16Z_SQL_RUN=NO`.
- `A16Z_DB_PUSH_RUN=NO`.
- `A16Z_MIGRATION_REPAIR_RUN=NO`.
- `A16Z_SEED_RUN=NO`.
- `A16Z_PERMISSIONS_ROLES_AUTH_USERS_MEMBERSHIPS_MUTATED=NO`.
- `A16Z_DEPLOY_RUN=NO`.
- `A16Z_WINDOWS_LOCAL_DEPLOY_RUN=NO`.
- `A16Z_WRANGLER_DEPLOY_RUN=NO`.
- `A16Z_WRANGLER_TOML_CHANGED=NO`.
- `A16Z_APP_LAYOUT_TSX_CHANGED=NO`.
- `A16Z_RAW_JSON_EVIDENCE_COMMITTED=NO`.
- `A16Z_PRIVATE_JSON_CONTENT_PRINTED=NO`.

## Runtime Guardrail Review

- Main Worker touched: `YES_MINIMAL_IMPORT_SESSION_UI_ONLY`.
- Runtime dependency added: `NO`.
- New service Worker created: `NO`.
- OpenNext/Wrangler config changed: `NO`.
- Worker size risk: `NO`.
- Service boundary recommendation:
  `NONE_FOR_SMALL_EXISTING_READ_ONLY_A16O_AUDIT_EXPORT_LINK`.
