# A-17N - Admin Parent/Child Canonical Write Path

Date: 2026-07-12

Status: `A17N_STATUS=BLOCKED_TRANSACTION_EXECUTOR_REQUIRED_FOUNDATION_READY`

## Preflight

- `PRECONDITION_A17M_COMMIT_PRESENT=YES`
- `WORKTREE_CLEAN_BEFORE_PHASE=YES`
- `REMOTE_SYNC_BEFORE_PHASE=LOCAL_AHEAD_2_NO_DIVERGENCE`
- `A17SQL_H_STATUS=PASS_OWNER_MANUAL_SCHEMA_APPLY_COMPLETED`
- `A17I_STATUS=PASS_SCHEMA_POST_APPLY_VERIFIED`
- `CANONICAL_FAMILY_PRODUCTION_CALLER_COUNT_BEFORE=0`
- `PRODUCTION_RECONCILIATION_REMAINS_BLOCKED=YES`
- `CANONICAL_KEYS_BACKFILLED=NO`

## Current Admin Write Flows

### Add Existing Person As Parent

Source: `app/(admin)/admin/tree/edit/actions.ts`,
`addParentFromTreeAction`.

Current flow:

1. Reads selected child ID and related parent ID from form data.
2. Calls `createTreeFamily("Family created from tree editor", notes)`.
3. `createTreeFamily` calls `createFamily`.
4. `createFamily` checks `relationships.create`, inserts `families`, and logs
   a `families` revision.
5. Action calls `addParentToFamily`.
6. `addParentToFamily` checks `relationships.create`, validates the parent
   input, checks cycles against existing children, inserts `family_parents`,
   and logs a `family_parents` revision.
7. Action calls `addChildToFamily`.
8. `addChildToFamily` checks `relationships.create`, validates the child
   input, checks cycles against existing parents, inserts `family_children`,
   and logs a `family_children` revision.
9. Action revalidates `/admin/tree`, `/admin/tree/edit`,
   `/admin/relationships` and `/admin/people`, then redirects with
   `saved=parent_added`.

Unconditional family creation source:

- `createTreeFamily("Family created from tree editor", notes)`

Transaction model:

- `TRANSACTION_BOUNDARY_STATUS=BLOCKED_TRANSACTION_EXECUTOR_REQUIRED`
- The current flow is sequential Supabase calls and can leave partial data.

### Create New Person As Parent

Source: `app/(admin)/admin/tree/edit/actions.ts`,
`createPersonAndAttachFromTreeAction`.

Current flow:

1. Calls `createPerson`.
2. `createPerson` checks `people.create`, validates input, inserts `people`,
   and logs a `people` revision.
3. For `father` or `mother`, action creates a new family unconditionally.
4. Action adds the new person as parent, then selected person as child.
5. If family or membership creation fails after person creation, the person
   remains created and the action returns a partial-write error message.

Transaction model:

- `TRANSACTION_BOUNDARY_STATUS=BLOCKED_TRANSACTION_EXECUTOR_REQUIRED`
- A safe A-17N activation must include person creation, family mutation,
  memberships and audit in one approved transaction boundary.

### Add Existing Person As Child

Source: `app/(admin)/admin/tree/edit/actions.ts`, `addChildFromTreeAction`.

Current flow:

1. Reads selected parent ID and related child ID from form data.
2. Creates a new family unconditionally.
3. Adds selected person as parent.
4. Adds related person as child.
5. Revalidates tree/relationship/people paths and redirects with
   `saved=child_added`.

Unconditional family creation source:

- `createTreeFamily("Family created from tree editor", notes)`

### Create New Person As Child

Source: `app/(admin)/admin/tree/edit/actions.ts`,
`createPersonAndAttachFromTreeAction`.

Current flow:

1. Calls `createPerson`.
2. Creates a new family unconditionally for `relation_kind=child`.
3. Adds selected person as parent.
4. Adds the new person as child.
5. Person creation is not atomic with relationship creation.

## A-17N Foundation

Created:

- `lib/family/admin-canonical-family-link-service.ts`
- `scripts/check-a17n-admin-parent-child-canonical-write-path.cjs`

The application-service foundation defines:

- `planAndExecuteAdminParentLink`
- `planAndExecuteAdminChildLink`
- `AdminCanonicalFamilyTransactionExecutor`
- stable result classes:
  `PARENT_LINK_CREATED`, `PARENT_LINK_ALREADY_EXISTS`,
  `CHILD_LINK_CREATED`, `CHILD_LINK_ALREADY_EXISTS`,
  `CANONICAL_FAMILY_REUSED`, `CANONICAL_FAMILY_CREATED`,
  `OWNER_REVIEW_REQUIRED`, `BLOCKED_AMBIGUOUS`, `BLOCKED_CYCLE`,
  `BLOCKED_PERMISSION`, `BLOCKED_TRANSACTION_EXECUTOR_REQUIRED`

The service is dependency-injected and has no direct Supabase client, no
service role, no SQL, no migration and no production caller. It calls A-17M
domain planning and fails closed when no approved transaction executor is
provided.

## Integration Status

- `ADMIN_PARENT_ACTION_INTEGRATED=NO_BLOCKED`
- `ADMIN_CHILD_ACTION_INTEGRATED=NO_BLOCKED`
- `UNCONDITIONAL_PARENT_FAMILY_CREATE_REMOVED=NO_BLOCKED`
- `UNCONDITIONAL_CHILD_FAMILY_CREATE_REMOVED=NO_BLOCKED`
- `DIRECT_PARENT_MEMBERSHIP_INSERT_REMOVED_FROM_ACTION=NO_BLOCKED`
- `DIRECT_CHILD_MEMBERSHIP_INSERT_REMOVED_FROM_ACTION=NO_BLOCKED`
- `CANONICAL_FAMILY_PRODUCTION_CALLER_COUNT=0`

Reason:

- No approved admin parent/child transaction executor exists.
- Existing official-import transaction RPC is scoped to A-16 import and must not
  be reused for admin family edits.
- Adding a new mutation RPC, SECURITY DEFINER helper, schema object, trigger or
  grant requires a separate owner-approved SQL/migration phase.
- Sequential Supabase calls are explicitly unsafe for A-17N.

## Target Behavior Recorded

- `CANONICAL_FAMILY_REUSE_SUPPORTED=FOUNDATION_ONLY_BLOCKED`
- `CANONICAL_FAMILY_CREATE_SUPPORTED=FOUNDATION_ONLY_BLOCKED`
- `SINGLE_PARENT_FAMILY_EXTENSION_SUPPORTED=FOUNDATION_ONLY_BLOCKED`
- `MULTIPLE_SPOUSE_CONTEXT_FAILS_CLOSED=YES`
- `LEGACY_DUPLICATE_REVIEW_REQUIRED=YES`
- `CYCLE_VALIDATION_PRESERVED=YES`
- `PERMISSION_VALIDATION_PRESERVED=YES`
- `AUDIT_VALIDATION_PRESERVED=FOUNDATION_REQUIRES_TRANSACTION_EXECUTOR`
- `TRANSACTION_BOUNDARY_STATUS=BLOCKED_TRANSACTION_EXECUTOR_REQUIRED`

## Legacy Family Reuse Rules

Legacy family reuse remains blocked from production activation unless all are
true:

- family is active;
- intended parent set is unambiguous;
- no equivalent duplicate candidate creates uncertainty;
- no invalid person reference exists;
- no conflicting metadata exists;
- family is not merged or voided;
- reuse does not require merging records;
- operation does not change unrelated relationships.

Duplicate parent-set candidates return:

- `CANONICAL_FAMILY_LEGACY_DUPLICATE_REVIEW_REQUIRED`
- `OWNER_REVIEW_REQUIRED`

Production reconciliation remains blocked.

## Tests And Checker Contract

- `SECOND_CHILD_REUSES_FAMILY_TEST=BLOCKED_FOUNDATION_PASS`
- `EIGHT_CHILDREN_ONE_FAMILY_TEST=PASS_A17M_IDENTITY`
- `SECOND_PARENT_EXTENDS_FAMILY_TEST=BLOCKED_FOUNDATION_PASS`
- `MULTIPLE_CANDIDATE_FAIL_CLOSED_TEST=PASS`
- `DUPLICATE_LINK_NO_OP_TEST=PASS`
- `CYCLE_BLOCK_TEST=PASS`
- `ATOMIC_ROLLBACK_TEST=BLOCKED_TRANSACTION_EXECUTOR_REQUIRED`

The checker verifies 30 fixture/static cases for add-parent, add-child,
atomicity and runtime boundaries. Because production activation is blocked,
the checker also verifies admin tree actions do not yet call the A-17N service.

## Runtime Boundaries

- `IMPORTER_RUNTIME_CHANGED=NO`
- `ADD_SPOUSE_RUNTIME_CHANGED=NO`
- `PUBLIC_TREE_RUNTIME_CHANGED=NO`
- `GRAPH_LAYOUT_RUNTIME_CHANGED=NO`
- `MAIN_WORKER_TOUCHED=YES_LIGHT_ADMIN_SERVICE_FOUNDATION`
- `RUNTIME_DEPENDENCY_ADDED=NO`
- `NEW_SERVICE_WORKER_CREATED=NO`
- `OPENNEXT_WRANGLER_CONFIG_CHANGED=NO`
- `WORKER_SIZE_RISK=NO`
- `SERVICE_BOUNDARY_RECOMMENDATION=NONE`

## Safety

- `MIGRATION_CREATED=NO`
- `SQL_EXECUTED=NO`
- `MIGRATION_APPLIED=NO`
- `LEGACY_RECONCILIATION_EXECUTED=NO`
- `OFFICIAL_IMPORT_RPC_CALLED=NO`
- `PRODUCTION_MUTATION_SMOKE_EXECUTED=NO`
- `DEPLOY=NO`
- `PUSH=NO`
- `PACKAGE_DEPENDENCY_INSTALLED=NO`

## Validation

- `npm.cmd run check:a17n-admin-parent-child-canonical-write-path` - PASS
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
- `npm.cmd run check:tree-editor` - PASS
- `npm.cmd run check:tree-viewer` - PASS
- `npm.cmd run check:public-privacy` - PASS
- `npm.cmd run check:env:safe` - PASS
- `npm.cmd run check:migrations` - PASS
- `npm.cmd run typecheck` - PASS
- `npm.cmd run lint` - PASS
- `npm.cmd run build` - PASS
- `git diff --check` - PASS

## Next

- `NEXT_ACTION=OWNER_REVIEW_A17N_THEN_START_SEPARATE_A17O_IMPORTER_CANONICAL_GROUPING_FIX`
