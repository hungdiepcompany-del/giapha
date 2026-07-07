# A-16M - Relationship Role Mapping Root Cause Plan

## Status

- Marker: `A-16M-RELATIONSHIP-ROLE-MAPPING-ROOT-CAUSE-PLAN`.
- Status:
  `A16M_RELATIONSHIP_ROLE_MAPPING_ROOT_CAUSE_STATUS=PLAN_ONLY_IMPORT_BLOCKED`.
- A-16L classification carried forward:
  `A16L_DRY_RUN_PREVIEW_OWNER_REVIEW_BLOCKED_RELATIONSHIP_ROLE_AUDIT_REQUIRED`.
- Root-cause classification:
  `A16M_ROOT_CAUSE_CLASSIFICATION=A16M_ROOT_CAUSE_UNKNOWN_NEEDS_FULL_EXPORT_EVIDENCE`.
- Import safety classification:
  `A16M_IMPORT_SAFETY_CLASSIFICATION=LIKELY_YES`.
- Confirmed runtime-write risk:
  `A16M_CONFIRMED_RUNTIME_WRITE_RISK=UNKNOWN`.
- Recommended next phase:
  `A16M_RECOMMENDED_NEXT_PHASE=A-16N-FULL-DRY-RUN-RELATIONSHIP-AUDIT-EVIDENCE`.
- A-16R import retry remains:
  `A16R_IMPORT_RETRY_NEXT=NO`.

## Preflight

- `git status -sb`: `## main...origin/main`.
- `git status --short`: clean.
- Sandboxed `git fetch origin --prune` failed with `.git/FETCH_HEAD:
  Permission denied`.
- Owner prompt supplied manual fetch evidence that branch `main` was synced.
- Cached `git rev-list --left-right --count HEAD...origin/main`: `0 / 0`.
- Branch: `main`.
- Remote slug: `hungdiepcompany-del/giapha.git`.
- HEAD at phase start:
  `406f1f74baf46a1b8558e41cbd3c0cd27a60a7c0`.
- A-16L audit commit present:
  `406f1f74baf46a1b8558e41cbd3c0cd27a60a7c0 docs: audit A16L dry-run relationship preview`.

## Session And Preview Evidence

- Authoritative audited session:
  `A16M_AUDITED_IMPORT_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
- Bad/unverified session:
  `A16M_BAD_UNVERIFIED_SESSION_ID=ae7a5fe3-6a29-4f60-85f7-76108ed02565`.
- `proposedPeopleCount=102`.
- `proposedRelationshipCount=134`.
- `blockedByErrorCount=0`.
- `warningCount=92`.
- `canProceedToOfficialImport=false`.
- `officialImportOpen=false`.
- `readOnly=true`.
- `dbWrite=false`.
- `peopleWrite=false`.
- `relationshipWrite=false`.
- `treeLayoutWrite=false`.
- `revisionWrite=false`.

Suspicious examples carried forward from owner dry-run preview:

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

## Relationship Candidate Creation Trace

- `A16M_RELATIONSHIP_CANDIDATE_CREATOR=lib/import/giapha4/xlsx-staging-parser.ts::buildParentRelationshipCandidates`.
- `A16M_RELATIONSHIP_STAGING_WRITER=lib/import/giapha4/manifest-upload-service.ts::toRelationshipRows`.
- `A16M_RELATIONSHIP_STAGING_TABLE=import_relationship_candidates`.
- `A16M_PARENT_ROLE_FIELD_IN_PARSER=parentRole`.
- `A16M_PARENT_ROLE_PERSISTED_IN_IMPORT_RELATIONSHIP_CANDIDATES=NO`.
- `A16M_RELATIONSHIP_LABEL_FIELD_IN_PARSER=relationshipLabelVi`.
- `A16M_RELATIONSHIP_LABEL_PERSISTED_FIELD=relationship_label_vi`.
- `A16M_SOURCE_PERSON_FINGERPRINT_SIDE=parent`.
- `A16M_RELATED_PERSON_FINGERPRINT_SIDE=child`.
- `A16M_SOURCE_ROW_INDEX_SIDE=child_row`.
- `A16M_RELATED_ROW_INDEX_SIDE=child_row`.

Parser behavior:

- `mapMemberRowToStagingPerson()` creates each staged person from one Gia Phả 4
  member row.
- `buildParentRelationshipCandidates()` then inspects that same child row.
- `addParentCandidate("father", "fatherExternalId", "fatherName")` uses the
  source columns mapped from `Mã GP Bố` / `Tên Bố`.
- `addParentCandidate("mother", "motherExternalId", "motherName")` uses the
  source columns mapped from `Mã GP Mẹ` / `Tên Mẹ`.
- `sourcePersonFingerprint` is the matched parent candidate fingerprint when
  the parent external id exists in the staged people map.
- `relatedPersonFingerprint` is `input.person.fingerprint`, the child row's
  staged person fingerprint.
- `parentRole` exists only in the in-memory parser candidate. It is not
  persisted by `toRelationshipRows()`.

## Source Column Semantics Trace

- `A16M_ROLE_LABEL_DERIVED_FROM_SOURCE_COLUMN_HEADER=YES`.
- `A16M_ROLE_LABEL_DERIVED_FROM_SOURCE_ROW_TEXT=NO`.
- `A16M_ROLE_LABEL_DERIVED_FROM_INFERRED_GENDER=NO`.
- `A16M_ROLE_LABEL_DERIVED_FROM_RELATIONSHIP_DIRECTION=NO`.
- `A16M_ROLE_LABEL_DERIVED_FROM_PARENT_CANDIDATE_ROLE=YES`.
- `A16M_ROLE_LABEL_DERIVED_FROM_UI_PREVIEW_FORMATTING=NO`.
- `A16M_ROLE_LABEL_DERIVED_FROM_STAGING_PASSTHROUGH=YES`.

`Bố` and `Mẹ` are selected by the parser's `role` argument, which is selected
from the mapped source columns. The parser does not compare the parent
candidate's parsed gender to the selected role before creating the candidate.

## Label Construction Trace

- `A16M_RELATIONSHIP_LABEL_CREATED_AT_PARSE_TIME=YES`.
- `A16M_RELATIONSHIP_LABEL_CREATED_DURING_MANIFEST_STAGING=NO`.
- `A16M_RELATIONSHIP_LABEL_CREATED_DURING_DRY_RUN_PREVIEW=NO`.
- `A16M_RELATIONSHIP_LABEL_CREATED_ONLY_IN_UI_RENDER=NO`.
- `A16M_RELATIONSHIP_LABEL_PERSISTED_IN_IMPORT_RELATIONSHIP_CANDIDATES=YES`.

Flow:

1. Parser creates `relationshipLabelVi` as
   `` `${roleLabel}: ${parentName || parentExternalId}` ``.
2. Manifest upload persists it to `relationship_label_vi`.
3. Manifest read maps `relationship_label_vi` back to `relationshipLabelVi`.
4. Dry-run preview copies `relationship.relationshipLabelVi`.
5. UI renders `{relationship.relationshipLabelVi}` directly.

## Gender Source Trace

- `A16M_GENDER_SOURCE=PARSED_DIRECTLY_FROM_GIAPHA4_GENDER_COLUMN`.
- `A16M_GENDER_INFERRED_FROM_NAME=NO`.
- `A16M_GENDER_INFERRED_FROM_PARENT_ROLE=NO`.
- `A16M_GENDER_INFERRED_FROM_SPOUSE_OR_PARENT_COLUMNS=NO`.
- `A16M_GENDER_NULLABLE_OR_UNKNOWN=YES`.
- `A16M_GENDER_MAY_BE_WRONG_FOR_SPECIFIC_ROWS=UNKNOWN_NEEDS_RAW_EXPORT_EVIDENCE`.

`normalizeGiaPha4Gender()` maps explicit source values equivalent to `nam` /
`male` / `m` to `male`, `nu` / `female` / `f` to `female`, `khac` / `other`
to `other`, and everything else to `unknown`. It does not infer gender from
names or relationship columns.

## Import Runtime Risk Trace

- `A16M_OFFICIAL_IMPORT_PARENT_ROLE_SOURCE=relationship_label_vi`.
- `A16M_OFFICIAL_IMPORT_DIRECTION_SOURCE=source_person_fingerprint_PARENT_AND_related_person_fingerprint_CHILD`.
- `A16M_OFFICIAL_IMPORT_PARENT_ROLE_PERSISTED_SOURCE_FIELD=relationship_label_vi`.
- `A16M_OFFICIAL_IMPORT_PARENT_ROLE_STRUCTURED_FIELD_AVAILABLE=NO`.
- `A16M_OFFICIAL_IMPORT_WOULD_USE_LABEL_TO_WRITE_PARENT_ROLE=YES`.

The A-16V SQL candidate maps `family_parents.parent_role` by matching
`relationship_label_vi` text for `mẹ` / `me` / `bố` / `bo` / `cha`. Therefore a
wrong `Bố/Mẹ` label is not merely preview copy: if official import were opened
without a fix or owner audit, it would likely write wrong `parent_role` values
for any affected relationship rows. The relationship direction still appears
to be parent-to-child because the parser sets `sourcePersonFingerprint` to the
parent and `relatedPersonFingerprint` to the child.

## Root Cause Classification

Primary classification:

`A16M_ROOT_CAUSE_CLASSIFICATION=A16M_ROOT_CAUSE_UNKNOWN_NEEDS_FULL_EXPORT_EVIDENCE`

Rejected or not-yet-proven classifications:

- `A16M_ROOT_CAUSE_CONFIRMED_PARENT_ROLE_LABEL_SWAP=NOT_PROVEN`.
- `A16M_ROOT_CAUSE_CONFIRMED_RELATIONSHIP_DIRECTION_SWAP=NOT_PROVEN`.
- `A16M_ROOT_CAUSE_CONFIRMED_SOURCE_COLUMN_SEMANTICS_MISMATCH=NOT_PROVEN`.
- `A16M_ROOT_CAUSE_CONFIRMED_GENDER_PARSE_OR_INFERENCE_ISSUE=NOT_PROVEN`.
- `A16M_ROOT_CAUSE_LABEL_ONLY_PREVIEW_BUG=NO_SOURCE_EVIDENCE`.
- `A16M_ROOT_CAUSE_SOURCE_DATA_NEEDS_OWNER_REVIEW=POSSIBLE_NOT_PRIMARY`.

Reasoning:

- The suspicious examples are name/label observations from the owner preview,
  not a full row-level export with source row, parent id, parent name, parsed
  gender, child id and child name.
- The parser's source/related direction is structurally parent-to-child, so a
  direction swap is not currently proven.
- The parser does not infer gender from names, so the "appears female/male"
  concern cannot be confirmed as a parsed-gender mismatch without raw rows.
- Official import is not label-only because `relationship_label_vi` currently
  feeds the A-16V SQL `parent_role` mapping.

## No-go Rule

`A16M_NO_GO_RULE=IF_PARENT_ROLE_OR_DIRECTION_UNPROVEN_OFFICIAL_IMPORT_REMAINS_BLOCKED`

Official import must remain blocked until a later phase proves every
relationship row's parent side, child side and parent role, or changes the
runtime mapping to use a verified structured parent-role source instead of
deriving role from label text.

## Recommended Next Phase

`A16M_RECOMMENDED_NEXT_PHASE=A-16N-FULL-DRY-RUN-RELATIONSHIP-AUDIT-EVIDENCE`

This is the safest next phase because it can remain read-only and collect the
missing evidence before any parser or SQL fix:

- all `134` relationship candidates;
- parent fingerprint and child fingerprint;
- parent external id/name/gender;
- child external id/name/gender;
- source column role (`fatherExternalId` or `motherExternalId`) if available;
- current `relationship_label_vi`;
- official-import projected `parent_role`;
- suspicious/clear classification per row.

Do not run official import even if this read-only audit finds many clear rows.
Execution must remain a separate later phase.

## Safety Boundaries

- `A16M_RUNTIME_PARSER_IMPORT_BEHAVIOR_CHANGED=NO`.
- `A16M_POST_OFFICIAL_IMPORT_CALLED=NO`.
- `A16M_OFFICIAL_IMPORT_CONFIRM_CLICKED=NO`.
- `A16M_DIRECT_RPC_OFFICIAL_IMPORT_CALLED=NO`.
- `A16M_REAL_GENEALOGY_WRITE=NO`.
- `A16M_PEOPLE_MUTATED=NO`.
- `A16M_RELATIONSHIPS_MUTATED=NO`.
- `A16M_TREE_LAYOUT_MUTATED=NO`.
- `A16M_REVISIONS_MUTATED=NO`.
- `A16M_SQL_RUN=NO`.
- `A16M_DB_PUSH_RUN=NO`.
- `A16M_MIGRATION_REPAIR_RUN=NO`.
- `A16M_SEED_RUN=NO`.
- `A16M_PERMISSIONS_ROLES_AUTH_USERS_MEMBERSHIPS_MUTATED=NO`.
- `A16M_DEPLOY_RUN=NO`.
- `A16M_WINDOWS_LOCAL_DEPLOY_RUN=NO`.
- `A16M_WRANGLER_TOML_CHANGED=NO`.
- `A16M_USED_BAD_SESSION_AE7A5FE3_FOR_APPROVAL=NO`.
- `A16M_CAN_PROCEED_TO_OFFICIAL_IMPORT=false`.
- `A16M_OFFICIAL_IMPORT_OPEN=false`.
- `A16M_CAN_RUN_OFFICIAL_IMPORT=false`.

## Hydration Advisory

- `LOCAL_HYDRATION_ADVISORY_LIKELY_BROWSER_EXTENSION_INJECTION`.
- `A16M_APP_LAYOUT_TSX_CHANGED=NO`.
- `A16M_APP_LAYOUT_CRXLAUNCHER_ADDED=NO`.
- `A16M_HYDRATION_GLOBAL_SUPPRESSION_ADDED=NO`.
