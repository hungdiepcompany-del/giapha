# A-16N - Full Dry-run Relationship Audit Evidence

## Status

- Marker: `A-16N-FULL-DRY-RUN-RELATIONSHIP-AUDIT-EVIDENCE`.
- Status:
  `A16N_FULL_DRY_RUN_RELATIONSHIP_AUDIT_STATUS=A16N_EVIDENCE_TOOLING_READY_OWNER_JSON_NEEDED`.
- A-16M root-cause classification:
  `A16M_ROOT_CAUSE_UNKNOWN_NEEDS_FULL_EXPORT_EVIDENCE`.
- Import safety:
  `LIKELY_YES`.
- Confirmed runtime-write risk:
  `UNKNOWN`.
- A-16R import retry remains:
  `A16R_IMPORT_RETRY_NEXT=NO`.

## Preflight

- `git status -sb`: `## main...origin/main`.
- `git status --short`: clean.
- Sandboxed `git fetch origin --prune` failed with `.git/FETCH_HEAD:
  Permission denied`.
- Owner manual push/fetch evidence says A-16M commit is now on `origin/main`.
- Cached `git rev-list --left-right --count HEAD...origin/main`: `0 / 0`.
- Branch: `main`.
- Remote slug: `hungdiepcompany-del/giapha.git`.
- HEAD at phase start:
  `479f6a19750e350fa2b247851bfdd0c3d38ee6a7`.
- A-16L on origin/main:
  `406f1f74baf46a1b8558e41cbd3c0cd27a60a7c0`.
- A-16M on origin/main:
  `479f6a19750e350fa2b247851bfdd0c3d38ee6a7`.

## Session And Preview Evidence

- Audited session:
  `A16N_AUDITED_IMPORT_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
- Bad/unverified session:
  `A16N_BAD_UNVERIFIED_SESSION_ID=ae7a5fe3-6a29-4f60-85f7-76108ed02565`.
- Endpoint:
  `/api/admin/import-sessions/2af4bfb6-a20e-453e-9804-1b8c0afbdd68/dry-run-preview`.
- `proposedPeopleCount=102`.
- `proposedRelationshipCount=134`.
- `blockedByErrorCount=0`.
- `warningCount=92`.
- `canProceedToOfficialImport=false`.
- `officialImportOpen=false`.
- `dryRunPreviewOnly=true`.
- `readOnly=true`.
- `dbWrite=false`.
- `peopleWrite=false`.
- `relationshipWrite=false`.
- `treeLayoutWrite=false`.
- `revisionWrite=false`.

## Evidence Availability

- Full owner JSON available during this phase:
  `A16N_FULL_OWNER_JSON_AVAILABLE=NO`.
- Classification:
  `A16N_EVIDENCE_TOOLING_READY_OWNER_JSON_NEEDED`.
- This phase prepared offline tooling and owner instructions only.

## Offline Audit Tool

- Script:
  `scripts/audit-a16n-full-dry-run-relationships.cjs`.
- Package command:
  `npm run audit:a16n-full-dry-run-relationships -- .tmp\a16n-dry-run-preview.json`.
- Optional markdown report:
  `npm run audit:a16n-full-dry-run-relationships -- .tmp\a16n-dry-run-preview.json --markdown .tmp\a16n-full-relationship-audit-report.md`.
- Evidence template:
  `docs/evidence/A16N_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EVIDENCE_TEMPLATE.md`.

The script parses only an owner-exported local JSON file. It does not call
production APIs, Supabase, RPC, SQL, official import, or any secret-bearing
environment.

## Full Audit Requirement

`A16N_FULL_AUDIT_REQUIRED_FOR_ALL_RELATIONSHIPS=134`

For every proposed relationship, the offline audit row includes:

- relationship index;
- sourceRowIndex;
- relationshipType;
- relationshipLabelVi;
- sourcePersonFingerprint;
- sourcePersonName;
- sourcePersonGender;
- relatedPersonFingerprint;
- relatedPersonName;
- relatedPersonGender;
- confidence;
- ambiguityStatus;
- suspiciousReason;
- severity.

The script builds a person lookup by `sourceFingerprint` with:

- fullName;
- displayName;
- gender;
- sourceRowIndex;
- generationNumber;
- birthDateText;
- deathDateText.

## Suspicious Detection

The script detects:

- `Bố:` role with source person parsed gender `female`;
- `Mẹ:` role with source person parsed gender `male`;
- culturally female/male name-marker advisory only when parsed gender is
  unknown, without treating name alone as proof;
- missing source or related person lookup;
- `confidence` not `strong`;
- `ambiguityStatus` not `clear`;
- suspected direction issue when parent generation is not before child
  generation;
- parent role conflict with persisted/parsed gender.

Relationship classifications:

- `PASS_CLEAR`;
- `REVIEW_ROLE_GENDER_MISMATCH`;
- `REVIEW_MISSING_PERSON_LOOKUP`;
- `REVIEW_AMBIGUOUS_RELATIONSHIP`;
- `REVIEW_WEAK_CONFIDENCE`;
- `REVIEW_DIRECTION_SUSPECTED`;
- `REVIEW_UNKNOWN`.

## Output Summary Fields

The offline audit prints JSON with:

- `sessionId`;
- `totalPeople`;
- `totalRelationships`;
- `passClearCount`;
- `suspiciousCount`;
- `roleGenderMismatchCount`;
- `missingPersonLookupCount`;
- `ambiguousCount`;
- `weakConfidenceCount`;
- `directionSuspectedCount`;
- `unknownCount`;
- `officialImportOpen`;
- `canProceedToOfficialImport`;
- `writeFlags`;
- `recommendation`.

## No-go Rule

`A16N_NO_GO_RULE=OFFICIAL_IMPORT_REMAINS_BLOCKED_UNTIL_FULL_AUDIT_PROVES_NO_PARENT_ROLE_WRITE_RISK_OR_FIX_PHASE_RERUNS_DRY_RUN`

Official import remains blocked until full audit either proves no parent-role
write risk or a fix phase corrects parser/staging/SQL behavior and dry-run
preview is rerun.

## Post-evidence Paths

Allowed future paths after owner JSON audit evidence:

- `A-16O-FIX-RELATIONSHIP-ROLE-MAPPING`;
- `A-16O-OWNER-ACCEPTS-SOURCE-RELATIONSHIP-ROLES_AFTER_FULL_AUDIT`;
- `A-16O-LABEL-ONLY-PREVIEW-CORRECTION`.

A-16M currently says the issue is likely not label-only because A-16V SQL
derives `family_parents.parent_role` from `relationship_label_vi`.

## Safety Boundaries

- `A16N_RUNTIME_PARSER_IMPORT_BEHAVIOR_CHANGED=NO`.
- `A16N_POST_OFFICIAL_IMPORT_CALLED=NO`.
- `A16N_DIRECT_RPC_OFFICIAL_IMPORT_CALLED=NO`.
- `A16N_REAL_GENEALOGY_WRITE=NO`.
- `A16N_SQL_RUN=NO`.
- `A16N_DB_PUSH_RUN=NO`.
- `A16N_MIGRATION_REPAIR_RUN=NO`.
- `A16N_SEED_RUN=NO`.
- `A16N_PERMISSIONS_ROLES_AUTH_USERS_MEMBERSHIPS_MUTATED=NO`.
- `A16N_DEPLOY_RUN=NO`.
- `A16N_WINDOWS_LOCAL_DEPLOY_RUN=NO`.
- `A16N_WRANGLER_TOML_CHANGED=NO`.
- `A16N_CAN_PROCEED_TO_OFFICIAL_IMPORT=false`.
- `A16N_OFFICIAL_IMPORT_OPEN=false`.
- `A16N_CAN_RUN_OFFICIAL_IMPORT=false`.
- `A16N_USED_BAD_SESSION_AE7A5FE3_FOR_APPROVAL=NO`.

## Hydration Advisory

- `LOCAL_HYDRATION_ADVISORY_LIKELY_BROWSER_EXTENSION_INJECTION`.
- `A16N_APP_LAYOUT_TSX_CHANGED=NO`.
- `A16N_APP_LAYOUT_CRXLAUNCHER_ADDED=NO`.
- `A16N_HYDRATION_GLOBAL_SUPPRESSION_ADDED=NO`.
