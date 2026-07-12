# A-17H - Canonical Family Schema Foundation Candidate

Date: 2026-07-12

Status: `A17H_STATUS=SCHEMA_FOUNDATION_CANDIDATE_READY_FOR_OWNER_REVIEW`

## Summary

`SCHEMA_FOUNDATION_READY_FOR_OWNER_REVIEW=YES`

A-17H creates a not-applied, additive schema foundation candidate for future
canonical family write paths, owner-reviewed canonicalization decisions,
all-or-nothing reconciliation batches and rollback manifests.

This phase does not reconcile data and does not update existing genealogy rows.

## Owner Input

- `OWNER_INPUT_MARKER_MATCHED=YES`
- `OWNER_REVIEW_MARKER_REQUIRED=APPROVE_A17H_CANONICAL_FAMILY_SCHEMA_CANDIDATE`
- `NEXT_ACTION=OWNER_REVIEW_A17H_THEN_RUN_SEPARATE_A17SQL_H_MANUAL_APPLY_PHASE`

## Files

- `MIGRATION_FILE=db/migrations/20260712_0023_a17h_canonical_family_schema_foundation_candidate.sql`
- `SUPABASE_MIRROR_FILE=supabase/migrations/20260712_0023_a17h_canonical_family_schema_foundation_candidate.sql`
- `POST_APPLY_VERIFIER=db/checks/20260712_check_a17i_canonical_family_schema_post_apply.sql`
- `STATIC_CHECKER=scripts/check-a17h-canonical-family-schema-foundation-candidate.cjs`
- `PACKAGE_SCRIPT=check:a17h-canonical-family-schema-foundation-candidate`

## Hashes

- `DB_MIGRATION_SHA256=B5E62D048F284D9E4F03E2294FE060E696E7905890D88587A18503E0786A07AA`
- `SUPABASE_MIRROR_SHA256=B5E62D048F284D9E4F03E2294FE060E696E7905890D88587A18503E0786A07AA`
- `MIRROR_MATCH=YES`
- `PRIOR_MIGRATIONS_UNCHANGED=YES`
- `MIGRATION_0022_SHA256_PRESERVED=97EC8E3108033CB4F26E86B5E348C5A15BF33DCC46650F384735482FA4712CA3`

## Baseline Evidence Carried Forward

- `CURRENT_FAMILY_COUNT=74`
- `OWNER_REVIEW_GROUP_COUNT=22`
- `REDUNDANT_FAMILY_COUNT=38`
- `EXPECTED_FAMILY_COUNT_AFTER=36`
- `SAFE_AUTOMATIC_GROUP_COUNT=0`
- `WRITE_PATH_REPAIR_REQUIRED_BEFORE_RECONCILIATION=YES`
- `A17EG_PRODUCTION_RECONCILIATION_ALLOWED=NO`

These values come from the already recorded A-17E/A-17F read-only audit and
dry-run. A-17H does not rerun production SQL and does not query rows.

## Families Additive Metadata

- `FAMILIES_CANONICAL_KEY_ADDED=YES`
- `FAMILIES_CANONICAL_STATUS_ADDED=YES`
- `FAMILIES_MERGED_INTO_REFERENCE_ADDED=YES`
- `SELF_MERGE_GUARD_ADDED=YES`
- `CANONICAL_LOOKUP_INDEX_ADDED=YES`
- `UNIQUE_INDEX_LEGACY_SAFE=YES`

`canonical_key` is nullable. The unique canonical lookup index is partial and
only applies to active rows where `canonical_status = 'canonical'` and
`canonical_key is not null`, so it is safe with existing legacy duplicate family
rows.

Existing insert paths remain compatible because the new fields are nullable or
have defaults. Runtime code does not need to provide canonical metadata before
A-17M/A-17Q write-path repair.

## New Foundation Tables

- `OWNER_DECISION_STRUCTURE_ADDED=YES`
- `RECONCILIATION_BATCH_STRUCTURE_ADDED=YES`
- `ROLLBACK_MANIFEST_STRUCTURE_ADDED=YES`

New structures:

- `public.family_canonicalization_decisions`: owner-reviewed decision records
  with hashed audit group key, source family set, proposed canonical family,
  decision status, reason, actor, reviewed timestamp, dry-run hash, audit hash,
  versioning and superseded/revoked state.
- `public.family_reconciliation_batches`: future all-or-nothing batch records
  with idempotency key, status, owner execution marker, actor, dry-run hash,
  approved audit hash, expected/actual counts, timestamps and blocker/error
  summaries.
- `public.family_reconciliation_rollback_manifests`: one authoritative manifest
  per batch with family, parent, child, couple and layout pre-state snapshots,
  canonical choice, merged/voided family IDs, audit revision IDs, payload hash,
  verification status and rollback status.

No batch, decision or manifest row is inserted by this migration.

## RLS and Grants

- `NEW_TABLES_RLS_ENABLED=YES`
- `ANON_POLICIES_ADDED=NO`
- `PUBLIC_POLICIES_ADDED=NO`
- `ANON_GRANTS_ADDED=NO`
- `PUBLIC_GRANTS_ADDED=NO`
- `SECURITY_DEFINER_ADDED=NO`

The new tables enable RLS. Policies are only for `authenticated` users and use
existing permission helpers: `relationships.view`, `relationships.update` and
`permissions.manage`. Rollback manifests are limited to `permissions.manage`
for reads.

The migration revokes table privileges from `anon` and `public` for the new
tables and does not add anon/PUBLIC grants or policies.

## Compatibility

- `EXISTING_RUNTIME_COMPATIBLE=YES`
- `CURRENT_FAMILY_INSERT_PATHS_COMPATIBLE=YES`
- `PUBLIC_TREE_READ_COMPATIBLE=YES`
- `ADMIN_TREE_READ_COMPATIBLE=YES`
- `EXISTING_FAMILY_ROWS_UPDATED=NO`
- `CANONICAL_KEYS_BACKFILLED=NO`
- `FAMILY_RECONCILIATION_EXECUTED=NO`
- `RECONCILIATION_RPC_CREATED=NO`
- `AUTOMATIC_MERGE_TRIGGER_CREATED=NO`
- `IMPORT_RPC_CALLED=NO`

A-17H is schema foundation only. It creates no reconciliation execution RPC,
no rollback RPC and no automatic merge trigger. It also does not create a
trigger that mutates relationship memberships.

## Post-Apply Verifier

- `POST_APPLY_VERIFIER_CREATED=YES`
- `POST_APPLY_VERIFIER_EXECUTED=NO`

The A-17I verifier is SELECT-only and is intended for a separate owner-approved
post-apply phase. It checks:

- expected columns, constraints and indexes;
- partial unique index predicate remains legacy-safe;
- new table RLS is enabled;
- no anon/PUBLIC policies or grants exist on new tables;
- active family count remains 74 immediately after apply;
- no legacy row is marked `merged` or `voided`;
- no canonical keys are backfilled;
- no batch, decision or rollback manifest rows were seeded.

## Validation

- `npm.cmd run check:a17a-tree-baseline-evidence`: PASS
- `npm.cmd run check:a17b-canonical-family-unit-design`: PASS
- `npm.cmd run check:a17c-phatue-oriented-tree-ux-contract`: PASS
- `npm.cmd run check:a17d-canonical-tree-graph-contract`: PASS
- `npm.cmd run check:a17e-family-duplicate-read-only-audit`: PASS
- `npm.cmd run check:a17f-family-reconciliation-dry-run`: PASS
- `npm.cmd run check:a17g-family-reconciliation-rollback-design`: PASS
- `npm.cmd run check:a17h-canonical-family-schema-foundation-candidate`: PASS
- `npm.cmd run check:relationships`: PASS
- `npm.cmd run check:tree-viewer`: PASS
- `npm.cmd run check:tree-editor`: PASS
- `npm.cmd run check:public-privacy`: PASS
- `npm.cmd run check:env:safe`: PASS
- `npm.cmd run check:migrations`: PASS
- `npm.cmd run typecheck`: PASS
- `npm.cmd run lint`: PASS
- `npm.cmd run build`: PASS

## Safety

- `SQL_EXECUTED=NO`
- `MIGRATION_APPLIED=NO`
- `GENEALOGY_ROWS_MODIFIED=NO`
- `DEPLOY=NO`
- `PUSH=NO`
- `NO_SEED_DATA=YES`
- `NO_HARD_DELETE=YES`
- `NO_CASCADE_DELETE_OF_PEOPLE_OR_EVIDENCE=YES`
- `NO_OFFICIAL_IMPORT_EXECUTION=YES`

The migration is ready for owner review only. It must not be applied through
this A-17H phase.
