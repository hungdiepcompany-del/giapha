# A-17I - Canonical Family Schema Post-Apply Verification

Date: 2026-07-12

Status: `A17I_STATUS=PASS_SCHEMA_POST_APPLY_VERIFIED`

## Scope

A-17I records owner-provided SELECT-only post-apply verification for the A-17H
schema foundation. This repository phase is documentation and checker
reconciliation only.

No SQL was executed by Codex in this phase.

## Migration

- `MIGRATION_FILE=db/migrations/20260712_0023_a17h_canonical_family_schema_foundation_candidate.sql`
- `MIGRATION_SHA256=B5E62D048F284D9E4F03E2294FE060E696E7905890D88587A18503E0786A07AA`
- `SUPABASE_MIRROR_SHA256=B5E62D048F284D9E4F03E2294FE060E696E7905890D88587A18503E0786A07AA`
- `MIRROR_MATCH=YES`

## Verified Results

- `POST_APPLY_VERIFICATION_RECORDED=YES`
- `EXISTING_FAMILY_COUNT_BEFORE=74`
- `EXISTING_FAMILY_COUNT_AFTER=74`
- `EXPECTED_COLUMNS_PRESENT=YES`
- `EXPECTED_CONSTRAINTS_PRESENT=YES`
- `CANONICAL_LOOKUP_INDEX_PRESENT=YES`
- `UNIQUE_INDEX_LEGACY_SAFE=YES`
- `NEW_TABLES_RLS_ENABLED=YES`
- `NEW_TABLES_RLS_ENABLED_COUNT=3`
- `ANON_GRANT_COUNT=0`
- `PUBLIC_GRANT_COUNT=0`
- `ANON_GRANTS_PRESENT=NO`
- `PUBLIC_GRANTS_PRESENT=NO`
- `ANON_POLICY_COUNT=0`
- `PUBLIC_POLICY_COUNT=0`
- `AUTHENTICATED_POLICY_COUNT=9`
- `ANON_POLICIES_PRESENT=NO`
- `PUBLIC_POLICIES_PRESENT=NO`
- `OWNER_DECISION_ROW_COUNT=0`
- `RECONCILIATION_BATCH_ROW_COUNT=0`
- `ROLLBACK_MANIFEST_ROW_COUNT=0`
- `OWNER_DECISION_ROWS_CREATED=0`
- `RECONCILIATION_BATCH_ROWS_CREATED=0`
- `ROLLBACK_MANIFEST_ROWS_CREATED=0`
- `CANONICAL_KEY_BACKFILL_COUNT=0`
- `CANONICAL_KEYS_BACKFILLED=NO`
- `MERGED_OR_VOIDED_LEGACY_FAMILY_COUNT=0`
- `LEGACY_FAMILIES_MARKED_MERGED_OR_VOIDED=NO`

## Read-Only Audit Caveats

- `SAFE_AUTOMATIC_GROUP_COUNT=0`
- `OWNER_REVIEW_GROUP_COUNT=22`
- `REDUNDANT_FAMILY_COUNT=38`
- `INVALID_PERSON_REFERENCE_COUNT=2`
- `INACTIVE_OR_SOFT_DELETED_MEMBERSHIP_COUNT=1`
- `LAYOUT_REFERENCES_AFFECTED_COUNT=3`
- `PRODUCTION_RECONCILIATION_REMAINS_BLOCKED=YES`

Reconciliation blockers:

- 22 duplicate parent-set groups require owner review.
- 0 safe automatic merge groups exist.
- 2 invalid person references require later investigation.
- 1 inactive or soft-deleted membership requires later investigation.
- 3 layout references touch duplicate families.
- Repaired write paths must be deployed and verified before reconciliation.

## Safety

- `SQL_EXECUTED=NO`
- `SQL_MUTATION_EXECUTED=NO`
- `GENEALOGY_ROWS_MODIFIED=NO`
- `FAMILY_RECORDS_MODIFIED=NO`
- `CANONICAL_KEYS_BACKFILLED=NO`
- `OWNER_DECISION_ROWS_CREATED=0`
- `RECONCILIATION_BATCH_ROWS_CREATED=0`
- `ROLLBACK_MANIFEST_ROWS_CREATED=0`
- `RECONCILIATION_EXECUTED=NO`
- `IMPORT_RPC_CALLED=NO`
- `DEPLOY=NO`
- `PUSH=NO`

## Validation

- `npm.cmd run check:a17i-canonical-family-schema-post-apply-verification`: PASS
- `npm.cmd run check:a17h-canonical-family-schema-foundation-candidate`: PASS
- `npm.cmd run check:a17a-tree-baseline-evidence`: PASS
- `npm.cmd run check:a17b-canonical-family-unit-design`: PASS
- `npm.cmd run check:a17c-phatue-oriented-tree-ux-contract`: PASS
- `npm.cmd run check:a17d-canonical-tree-graph-contract`: PASS
- `npm.cmd run check:a17e-family-duplicate-read-only-audit`: PASS
- `npm.cmd run check:a17f-family-reconciliation-dry-run`: PASS
- `npm.cmd run check:a17g-family-reconciliation-rollback-design`: PASS
- `npm.cmd run check:env:safe`: PASS
- `npm.cmd run check:migrations`: PASS
- `npm.cmd run check:relationships`: PASS
- `npm.cmd run check:tree-viewer`: PASS
- `npm.cmd run check:tree-editor`: PASS
- `npm.cmd run check:public-privacy`: PASS
- `npm.cmd run typecheck`: PASS
- `npm.cmd run lint`: PASS
- `npm.cmd run build`: PASS

## Next

- `NEXT_ACTION=START_SEPARATE_A17M_CANONICAL_FAMILY_DOMAIN_SERVICE_PHASE`
