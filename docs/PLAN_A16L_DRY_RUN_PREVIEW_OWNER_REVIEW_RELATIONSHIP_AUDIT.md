# A-16L - Dry-run Preview Owner Review Relationship Audit

## Status

- Marker: `A-16L-DRY-RUN-PREVIEW-OWNER-REVIEW-RELATIONSHIP-AUDIT`.
- Status:
  `A16L_DRY_RUN_PREVIEW_OWNER_REVIEW_RELATIONSHIP_AUDIT_STATUS=BLOCKED_RELATIONSHIP_ROLE_AUDIT_REQUIRED_READ_ONLY`.
- Classification:
  `A16L_DRY_RUN_PREVIEW_OWNER_REVIEW_CLASSIFICATION=A16L_DRY_RUN_PREVIEW_OWNER_REVIEW_BLOCKED_RELATIONSHIP_ROLE_AUDIT_REQUIRED`.
- Audited session:
  `A16L_AUDITED_DRY_RUN_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
- Bad/unverified session:
  `A16L_BAD_UNVERIFIED_SESSION_ID=ae7a5fe3-6a29-4f60-85f7-76108ed02565`.
- A-16K owner approval marker:
  `APPROVE_A16K_IMPORT_DRY_RUN_GATE`.
- A-16R import retry remains:
  `A16R_IMPORT_RETRY_NEXT=NO`.

## Preflight

- Branch: `main`.
- Remote slug: `hungdiepcompany-del/giapha.git`.
- Working tree before edits: clean.
- Cached ahead/behind before edits: `0 / 0`.
- HEAD before edits:
  `e679681c47cd86172d1f9cee0261e4d26531f7b4`.
- Required origin/main commit was present locally:
  `e679681c47cd86172d1f9cee0261e4d26531f7b4 guard: record A16K dry-run approval after A16R fix`.
- Caveat: sandbox `git fetch origin --prune` could not write `.git/FETCH_HEAD`
  and returned permission denied. Owner manual PowerShell fetch evidence already
  showed fetch PASS, `git status -sb` as `## main...origin/main`, and
  `git rev-list --left-right --count HEAD...origin/main` as `0 0`, so this
  docs/checker-only audit continued from clean cached Git metadata.

## Dry-run Preview Evidence

- Endpoint:
  `/api/admin/import-sessions/2af4bfb6-a20e-453e-9804-1b8c0afbdd68/dry-run-preview`.
- Result marker:
  `A16L_DRY_RUN_MAPPING_PREVIEW_FROM_MANIFEST_STAGING`.
- `ok=true`.
- `status=ready`.
- `httpStatus=200`.
- `dryRunPreviewOnly=true`.
- `readOnly=true`.
- `dbWrite=false`.
- `peopleWrite=false`.
- `relationshipWrite=false`.
- `treeLayoutWrite=false`.
- `revisionWrite=false`.
- `canProceedToOfficialImport=false`.
- `officialImportOpen=false`.
- `proposedPeopleCount=102`.
- `proposedRelationshipCount=134`.
- `blockedByErrorCount=0`.
- `warningCount=92`.

## Source Findings

- `A16L_RELATIONSHIP_LABEL_SOURCE=PARSER_PARENT_COLUMN_TO_IMPORT_RELATIONSHIP_CANDIDATE_FIELD_PASSTHROUGH`.
- `A16L_DRY_RUN_PREVIEW_LABEL_RENDERING_SYNTHESIZES_ROLE=NO`.
- `A16L_DRY_RUN_PREVIEW_SERVICE_SYNTHESIZES_ROLE=NO`.
- `A16L_RELATIONSHIP_ROLE_CONFIRMED_MAPPING_BUG=UNKNOWN_NOT_PROVEN`.
- `A16L_RELATIONSHIP_ROLE_SOURCE_DATA_SEMANTICS_ISSUE=UNKNOWN_NOT_PROVEN`.
- `A16L_RELATIONSHIP_ROLE_PREVIEW_RENDERING_ISSUE=NO_SOURCE_EVIDENCE`.
- `A16L_RELATIONSHIP_ROLE_NEEDS_SOURCE_EVIDENCE=YES`.

Code path inspected:

- `lib/import/giapha4/xlsx-staging-parser.ts` builds parent candidates from
  `fatherExternalId` / `fatherName` and `motherExternalId` / `motherName`.
  It sets `roleLabel` to `Bố` for `father` and `Mẹ` for `mother`, then writes
  `relationshipLabelVi`.
- `lib/import/giapha4/manifest-upload-service.ts` persists the parser value to
  `import_relationship_candidates.relationship_label_vi`.
- `lib/import/giapha4/manifest-read-service.ts` reads
  `relationship_label_vi` back as `relationshipLabelVi`.
- `lib/import/giapha4/dry-run-mapping-preview-service.ts` passes
  `relationship.relationshipLabelVi` through into proposed relationships.
- `components/imports/import-session-manifest-panel.tsx` renders
  `relationship.relationshipLabelVi` directly and does not synthesize the
  parent role.

Conservative finding: the owner-visible suspicious labels are not caused by
the dry-run preview component inventing labels. They originate before preview
rendering, from staging/parser data that must be reconciled with the source
Excel semantics before any official import.

## Relationship Role Audit

- `A16L_RELATIONSHIP_AUDIT_TOTAL_PROPOSED_RELATIONSHIPS=134`.
- `A16L_RELATIONSHIP_AUDIT_TOTAL_CLEAR_RELATIONSHIPS=UNKNOWN_NEEDS_RAW_RELATIONSHIP_LIST`.
- `A16L_SUSPICIOUS_ROLE_GENDER_MISMATCH_EXAMPLE_COUNT=8`.
- `A16L_SUSPICIOUS_ROLE_GENDER_MISMATCH_TOTAL=UNKNOWN_NOT_DETERMINABLE_FROM_OWNER_EXCERPT`.
- `A16L_RELATIONSHIP_AUDIT_OWNER_REVIEW_REQUIRED=YES`.

Suspicious examples recorded from owner preview evidence:

| Example | relationshipLabelVi | Concern |
| --- | --- | --- |
| 1 | `Bố: Phạm Thị Bích` | Source/person name appears female while label says father. |
| 2 | `Mẹ: Nguyễn Hoàng Hiệp` | Source/person name appears male while label says mother. |
| 3 | `Bố: Phạm Thị Học` | Source/person name appears female while label says father. |
| 4 | `Mẹ: Nguyễn Văn Tiến` | Source/person name appears male while label says mother. |
| 5 | `Bố: Phạm Thị Phòng` | Source/person name appears female while label says father. |
| 6 | `Mẹ: Nguyễn Văn Trung` | Source/person name appears male while label says mother. |
| 7 | `Bố: Phạm Thị Nhỡ (cụ bà Trá)` | Source/person name appears female while label says father. |
| 8 | `Mẹ: Phạm Văn Trá` | Source/person name appears male while label says mother. |

The raw relationship list with rowNumber, source name/gender, child
name/gender was not retrieved in this phase. Therefore the exact total
suspicious count and clear count remain unknown.

## Warning Audit

- `A16L_WARNING_AUDIT_TOTAL=92`.
- `A16L_WARNING_AUDIT_GROUP_COUNTS_REQUIRE_RAW_WARNING_LIST=YES`.

Required owner-review warning groups:

| Group | Count |
| --- | --- |
| Birth date only year / incomplete precision | `UNKNOWN_FROM_SUMMARY` |
| Death date only year / incomplete precision | `UNKNOWN_FROM_SUMMARY` |
| Lunar/solar calendar conflict | `UNKNOWN_FROM_SUMMARY` |
| Death same year incomplete precision | `UNKNOWN_FROM_SUMMARY` |
| Duplicate person candidate | `UNKNOWN_FROM_SUMMARY` |
| Parser warnings | `UNKNOWN_FROM_SUMMARY` |
| Other | `UNKNOWN_FROM_SUMMARY` |

The 92 warnings remain owner-review warnings. They are not converted to
automatic corrections, automatic merges, automatic deletes, or official import
approval.

## Duplicate Audit

- Duplicate example recorded:
  `A16L_DUPLICATE_EXAMPLE=Nguyễn Văn Tiến / Nguyễn Văn Tiện`.
- `A16L_DUPLICATE_NGUYEN_VAN_TIEN_TIEN_OWNER_REVIEW_REQUIRED=YES`.
- `A16L_DUPLICATE_AUTO_MERGE=NO`.
- `A16L_DUPLICATE_AUTO_DELETE=NO`.
- `A16L_DUPLICATE_AUTO_CORRECT=NO`.

## Official Import Gate

- `A16L_OFFICIAL_IMPORT_REMAINS_LOCKED=YES`.
- `A16L_CAN_PROCEED_TO_OFFICIAL_IMPORT=false`.
- `A16L_OFFICIAL_IMPORT_OPEN=false`.
- `A16L_CAN_RUN_OFFICIAL_IMPORT=false`.
- `A16L_OFFICIAL_IMPORT_ENABLED=false`.
- `A16L_OFFICIAL_IMPORT_OPEN_FORCED_TRUE=NO`.
- `A16L_A16R_FAIL_CLOSED_GUARDS_WEAKENED=NO`.
- If the role issue is later proven label-only, official import still requires
  a separate owner-approved phase.

## Safety Boundaries

- `A16L_POST_OFFICIAL_IMPORT_CALLED=NO`.
- `A16L_OFFICIAL_IMPORT_CONFIRM_CLICKED=NO`.
- `A16L_DIRECT_RPC_OFFICIAL_IMPORT_CALLED=NO`.
- `A16L_REAL_GENEALOGY_WRITE=NO`.
- `A16L_PEOPLE_MUTATED=NO`.
- `A16L_RELATIONSHIPS_MUTATED=NO`.
- `A16L_TREE_LAYOUT_MUTATED=NO`.
- `A16L_REVISIONS_MUTATED=NO`.
- `A16L_SQL_RUN=NO`.
- `A16L_DB_PUSH_RUN=NO`.
- `A16L_MIGRATION_REPAIR_RUN=NO`.
- `A16L_SEED_RUN=NO`.
- `A16L_PERMISSIONS_ROLES_AUTH_USERS_MEMBERSHIPS_MUTATED=NO`.
- `A16L_DEPLOY_RUN=NO`.
- `A16L_WINDOWS_LOCAL_DEPLOY_RUN=NO`.
- `A16L_WRANGLER_TOML_CHANGED=NO`.
- `A16L_AUTO_DATE_CORRECTION=NO`.
- `A16L_AUTO_RELATIONSHIP_ROLE_CORRECTION=NO`.
- `A16L_AUTO_PARENT_CHILD_DIRECTION_CORRECTION=NO`.
- `A16L_USED_BAD_SESSION_AE7A5FE3_FOR_APPROVAL=NO`.

## Hydration Advisory

- `LOCAL_HYDRATION_ADVISORY_LIKELY_BROWSER_EXTENSION_INJECTION`.
- `A16L_APP_LAYOUT_TSX_CHANGED=NO`.
- `A16L_APP_LAYOUT_CRXLAUNCHER_ADDED=NO`.
- `A16L_HYDRATION_GLOBAL_SUPPRESSION_ADDED=NO`.

## Next Allowed Action

`A16L_DRY_RUN_PREVIEW_OWNER_REVIEW_NEXT_ALLOWED_ACTION=OWNER_EXPORT_OR_AUTHENTICATED_READ_ONLY_RELATIONSHIP_WARNING_DETAIL_AUDIT_NO_POST_NO_IMPORT`

The next safe phase should collect the raw relationship/warning rows for the
audited session in read-only mode and produce an owner decision table. Do not
run official import even if every suspicious item is later resolved.
