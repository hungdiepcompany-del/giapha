# A-17M - Canonical Family Domain Service Foundation

Date: 2026-07-12

Status: `A17M_STATUS=CANONICAL_FAMILY_DOMAIN_SERVICE_FOUNDATION_READY`

## Scope

A-17M creates a dormant server-side canonical family domain foundation. It does
not replace existing production write paths and has zero production callers.

## Preconditions

- `PRECONDITION_A17I_COMMIT_PRESENT=YES`
- `WORKTREE_CLEAN_BEFORE_PHASE=YES`
- `A17SQL_H_STATUS=PASS_OWNER_MANUAL_SCHEMA_APPLY_COMPLETED`
- `A17I_STATUS=PASS_SCHEMA_POST_APPLY_VERIFIED`
- `CURRENT_PRODUCTION_FAMILY_COUNT=74`
- `RECONCILIATION_EXECUTED=NO`
- `CANONICAL_KEYS_BACKFILLED=NO`

## Files

- `lib/family/canonical-family-types.ts`
- `lib/family/canonical-family-errors.ts`
- `lib/family/canonical-family-identity.ts`
- `lib/family/canonical-family-repository.ts`
- `lib/family/canonical-family-service.ts`
- `scripts/check-a17m-canonical-family-domain-service.cjs`

## Foundation Created

- `CANONICAL_FAMILY_DOMAIN_SERVICE_CREATED=YES`
- `CANONICAL_IDENTITY_VERSION=canonical-family:v1`
- `PARENT_SET_NORMALIZATION_CREATED=YES`
- `CANONICAL_KEY_BUILDER_CREATED=YES`
- `CANONICAL_LOOKUP_CREATED=YES`
- `REUSE_OR_CREATE_DECISION_CREATED=YES`
- `MUTATION_PLAN_CONTRACT_CREATED=YES`
- `REPOSITORY_CONTRACT_CREATED=YES`
- `DOMAIN_ERROR_CODES_CREATED=YES`
- `NO_PII_DIAGNOSTICS_CREATED=YES`

Identity rules:

- `CHILD_ID_INCLUDED_IN_CANONICAL_IDENTITY=NO`
- `INPUT_PARENT_ORDER_AFFECTS_IDENTITY=NO`
- `DISPLAY_NAME_INCLUDED_IN_IDENTITY=NO`
- `PRIVATE_GENEALOGY_DATA_INCLUDED_IN_IDENTITY=NO`

## Contract Test Coverage

- `SAME_PARENTS_MULTIPLE_CHILDREN_ONE_IDENTITY_TEST=PASS`
- `DIFFERENT_SPOUSE_DIFFERENT_IDENTITY_TEST=PASS`
- `LEGACY_DUPLICATE_OWNER_REVIEW_TEST=PASS`
- `MULTIPLE_CANONICAL_MATCH_FAIL_CLOSED_TEST=PASS`
- `MISSING_PERSON_REFERENCE_FAIL_CLOSED_TEST=PASS`
- `MERGED_VOIDED_NOT_REUSED_TEST=PASS`
- `TRANSACTION_EXECUTOR_REQUIRED_TEST=PASS`

The checker-backed fixtures cover all required identity, lookup/decision and
mutation-safety cases using pure data. They do not use production credentials,
linked Supabase, browser sessions or mutation SQL.

## Runtime Boundary

- `CANONICAL_FAMILY_PRODUCTION_CALLER_COUNT=0`
- `CURRENT_WRITE_PATHS_REMAIN_UNCHANGED=YES`
- `ADMIN_ADD_PARENT_RUNTIME_CHANGED=NO`
- `ADMIN_ADD_CHILD_RUNTIME_CHANGED=NO`
- `ADD_SPOUSE_RUNTIME_CHANGED=NO`
- `IMPORTER_RUNTIME_CHANGED=NO`
- `PUBLIC_TREE_RUNTIME_CHANGED=NO`
- `GRAPH_LAYOUT_RUNTIME_CHANGED=NO`

A-17M intentionally does not modify:

- admin add-parent action;
- admin add-child action;
- add-spouse action;
- official import executor;
- official import RPC;
- public tree graph projection;
- React Flow graph builder;
- ELK layout;
- tree editor;
- tree viewer.

## Future Phases

- A-17N will integrate admin parent/child actions.
- A-17O will integrate importer grouping.
- A-17P will unify couple/family behavior.
- Transaction execution remains a separate guarded concern.
- Production reconciliation remains blocked.

## Safety

- `MIGRATION_CREATED=NO`
- `SQL_EXECUTED=NO`
- `MIGRATION_APPLIED=NO`
- `PRODUCTION_FAMILY_CREATED=NO`
- `PRODUCTION_MEMBERSHIP_CREATED=NO`
- `EXISTING_FAMILY_ROWS_UPDATED=NO`
- `CANONICAL_KEYS_BACKFILLED=NO`
- `RECONCILIATION_EXECUTED=NO`
- `IMPORT_RPC_CALLED=NO`
- `DEPLOY=NO`
- `PUSH=NO`
- `PACKAGE_DEPENDENCY_INSTALLED=NO`

## Validation

- `npm.cmd run check:a17m-canonical-family-domain-service` - PASS
- `npm.cmd run check:a17a-tree-baseline-evidence` - PASS
- `npm.cmd run check:a17b-canonical-family-unit-design` - PASS
- `npm.cmd run check:a17c-phatue-oriented-tree-ux-contract` - PASS
- `npm.cmd run check:a17d-canonical-tree-graph-contract` - PASS
- `npm.cmd run check:a17e-family-duplicate-read-only-audit` - PASS
- `npm.cmd run check:a17f-family-reconciliation-dry-run` - PASS
- `npm.cmd run check:a17g-family-reconciliation-rollback-design` - PASS
- `npm.cmd run check:a17h-canonical-family-schema-foundation-candidate` - PASS
- `npm.cmd run check:a17i-canonical-family-schema-post-apply-verification` - PASS
- `npm.cmd run check:a16r-import-completed-post-import-verification` - PASS
- `npm.cmd run check:relationships` - PASS
- `npm.cmd run check:tree-viewer` - PASS
- `npm.cmd run check:tree-editor` - PASS
- `npm.cmd run check:public-privacy` - PASS
- `npm.cmd run check:env:safe` - PASS
- `npm.cmd run check:migrations` - PASS
- `npm.cmd run typecheck` - PASS
- `npm.cmd run lint` - PASS
- `npm.cmd run build` - PASS
- `git diff --check` - PASS
- `git diff --cached --check` - NOT RUN, staging blocked by local git
  permission/usage-limit boundary.

## Next

- `NEXT_ACTION=OWNER_REVIEW_A17M_THEN_START_SEPARATE_A17N_ADMIN_PARENT_CHILD_WRITE_PATH_INTEGRATION`
