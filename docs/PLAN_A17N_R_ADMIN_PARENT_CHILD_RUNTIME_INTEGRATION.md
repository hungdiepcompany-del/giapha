# A-17N-R - Admin Parent/Child Canonical Runtime Integration

Date: 2026-07-12

Status: `A17N_R_STATUS=PASS_RUNTIME_INTEGRATION_DEPLOYED_AND_NO_MUTATION_SMOKE_VERIFIED`

## Preconditions

- `PRECONDITION_TX2_PASS=YES`
- `A17N_TX2R_STATUS=PASS_OWNER_MANUAL_PRODUCTION_VERIFIER_RECORDED`
- `A17N_R_READINESS=READY_POST_APPLY_VERIFIER_PASS_RECORDED`
- `WORKTREE_CLEAN_BEFORE_PHASE=YES`
- `REMOTE_SYNC_BEFORE_PHASE=YES`
- `TRANSACTION_EXECUTOR_CALLED_BEFORE_PHASE=NO`
- `IDEMPOTENCY_ROW_COUNT_BEFORE_PHASE=0`
- `ACTIVE_FAMILY_COUNT_BASELINE=74`
- `ACTIVE_PARENT_MEMBERSHIP_COUNT_BASELINE=140`
- `ACTIVE_CHILD_MEMBERSHIP_COUNT_BASELINE=73`
- `RECONCILIATION_EXECUTED_BEFORE_PHASE=NO`

## Runtime Change

The previous admin tree add-parent and add-child flows created a new family
unconditionally, then inserted parent and child memberships through sequential
application writes. A-17N-R replaces those two existing-person paths with a
canonical runtime service and the approved transaction executor.

Activated files:

- `app/(admin)/admin/tree/edit/actions.ts`
- `lib/family/admin-canonical-family-runtime-service.ts`
- `lib/family/admin-canonical-family-transaction-adapter.ts`
- `lib/family/canonical-family-supabase-repository.ts`
- `lib/family/admin-canonical-family-link-service.ts`

During the original A-17N-R implementation phase, no migration, SQL,
production smoke mutation, deploy or push was performed. A later evidence-only
phase, A-17N-DR, recorded owner-confirmed deployment and production
no-mutation smoke evidence for commit `256d746`.

## Deploy And Smoke Evidence

- `A17N_DR_STATUS=PASS_DEPLOY_AND_PRODUCTION_NO_MUTATION_SMOKE_RECORDED`
- `PUSH_STATUS=PASS`
- `PUSHED_COMMIT=256d746`
- `REMOTE_SYNC_AFTER_PUSH=0_0`
- `CLOUDFLARE_DEPLOY_STATUS=PASS`
- `DEPLOYED_COMMIT=256d746`
- `PRODUCTION_BASE_URL=https://web-gia-pha.hungdiepcompany.workers.dev`
- `DATABASE_BASELINE_BEFORE_SMOKE=PASS`
- `BROWSER_NO_MUTATION_SMOKE=PASS`
- `DATABASE_BASELINE_AFTER_SMOKE=PASS`
- `TRANSACTION_EXECUTOR_CALLED=NO`
- `GENEALOGY_ROWS_MODIFIED=NO`
- `PRODUCTION_DATA_DRIFT=NO`
- `RECONCILIATION_EXECUTED=NO`
- `OFFICIAL_IMPORT_RPC_CALLED=NO`
- `A17O_READINESS=READY_A17N_DEPLOY_SMOKE_EVIDENCE_RECORDED`

## Runtime Contract

- `ADMIN_PARENT_ACTION_INTEGRATED=YES`
- `ADMIN_CHILD_ACTION_INTEGRATED=YES`
- `CANONICAL_APPLICATION_SERVICE_ACTIVE=YES`
- `TRANSACTION_EXECUTOR_ADAPTER_CREATED=YES`
- `APPROVED_RPC_USED=YES`
- `APPROVED_RPC=public.execute_admin_canonical_family_parent_child_write`
- `END_USER_SERVER_CONTEXT_USED=YES`
- `SERVICE_ROLE_USED=NO`
- `ANONYMOUS_EXECUTION_USED=NO`
- `CANONICAL_FAMILY_PRODUCTION_CALLER_COUNT=2`

The only production runtime callers are:

- `addParentFromTreeAction`
- `addChildFromTreeAction`

The adapter calls only
`public.execute_admin_canonical_family_parent_child_write` with the verified
`ADD_PARENT` and `ADD_CHILD` operations. It uses the authenticated server
Supabase client from the current cookie context and never imports the admin
client or service-role boundary.

## Removed Direct Write Path

- `UNCONDITIONAL_PARENT_FAMILY_CREATE_REMOVED=YES`
- `UNCONDITIONAL_CHILD_FAMILY_CREATE_REMOVED=YES`
- `DIRECT_PARENT_MEMBERSHIP_INSERT_REMOVED_FROM_ACTION=YES`
- `DIRECT_CHILD_MEMBERSHIP_INSERT_REMOVED_FROM_ACTION=YES`
- `SEQUENTIAL_MUTATION_FALLBACK_PRESENT=NO`

The tree action no longer calls `createFamily`, `addParentToFamily` or
`addChildToFamily` for parent/child links. On canonical service failure it
returns a Vietnamese user-facing error and does not attempt a fallback direct
write.

## Application Service Flow

The runtime service:

1. resolves the authenticated Supabase user from the end-user server client;
2. validates an active profile through RLS-visible profile data;
3. loads role permissions and requires `relationships.create` plus
   `relationships.update`;
4. validates the submitted UUID references;
5. reads active family memberships required to determine context;
6. validates ancestry-cycle safety before RPC;
7. delegates canonical identity and duplicate decisions to A-17M domain logic;
8. fails closed for ambiguity, duplicate legacy candidates and unsafe context;
9. constructs a deterministic executor identity;
10. invokes the approved transaction executor once.

## Idempotency

- `IDEMPOTENCY_KEY_REQUIRED=YES`
- `MUTATION_PLAN_HASH_REQUIRED=YES`
- `IDEMPOTENT_REPLAY_TEST=PASS_STATIC_CONTRACT`

The idempotency key and mutation-plan hash are derived deterministically from
the operation type, actor profile ID, family action, target family context,
canonical key, parent memberships, child membership and source action. Names,
dates, hometowns, biographies, private notes, cookies and tokens are excluded.

## Parent And Child Behavior

- `SECOND_PARENT_REUSES_FAMILY_TEST=PASS_STATIC_CONTRACT`
- `SECOND_CHILD_REUSES_FAMILY_TEST=PASS_STATIC_CONTRACT`
- `EIGHT_CHILDREN_ONE_FAMILY_TEST=PASS_A17M_IDENTITY`
- `DUPLICATE_LINK_NO_OP_TEST=PASS_STATIC_CONTRACT`
- `MULTIPLE_CANDIDATE_FAIL_CLOSED_TEST=PASS_STATIC_CONTRACT`
- `CYCLE_BLOCK_TEST=PASS_STATIC_CONTRACT`
- `RPC_FAILURE_NO_FALLBACK_TEST=PASS_STATIC_CONTRACT`
- `LEGACY_DUPLICATE_FAILS_CLOSED=YES`
- `MULTIPLE_SPOUSE_CONTEXT_FAILS_CLOSED=YES`

Add-parent reuses a single active child family when safe, inserts only the
missing parent membership through the executor and allows canonical metadata
updates only for the selected existing family context.

Add-child reuses an explicit or unambiguous parent family context when safe.
Multiple spouse or family contexts require owner/operator selection and fail
closed without calling the RPC.

Duplicate parent or child memberships return idempotent no-op semantics and do
not insert duplicate memberships.

## New Person Limitation

- `NEW_PERSON_AND_LINK_STATUS=BLOCKED_NEW_PERSON_TRANSACTION_CONTRACT_REQUIRED`

Creating a new person and linking that person as parent or child remains
blocked because the approved A-17N transaction executor does not include person
creation in the same atomic contract. The tree action blocks before creating
the person. The add-spouse flow remains unchanged and still uses the existing
person plus couple relationship path.

## Privacy And Diagnostics

- `PERMISSION_VALIDATION_PRESERVED=YES`
- `PROFILE_VALIDATION_PRESERVED=YES`
- `CYCLE_VALIDATION_PRESERVED=YES`
- `RAW_RPC_ERROR_EXPOSED=NO`
- `PII_DIAGNOSTICS_PRESENT=NO`

Application diagnostics are limited to stable operation/result codes, counts,
create/reuse booleans and the idempotent replay flag. They do not include
person names, dates, hometowns, biographies, private notes, cookies, tokens,
raw RPC payloads or raw Supabase errors.

## Runtime Boundaries

- `IMPORTER_RUNTIME_CHANGED=NO`
- `ADD_SPOUSE_RUNTIME_CHANGED=NO`
- `PUBLIC_TREE_RUNTIME_CHANGED=NO`
- `GRAPH_LAYOUT_RUNTIME_CHANGED=NO`
- `TRANSACTION_EXECUTOR_SQL_CHANGED=NO`
- `MAIN_WORKER_TOUCHED=YES`
- `RUNTIME_DEPENDENCY_ADDED=NO`
- `NEW_SERVICE_WORKER_CREATED=NO`
- `OPENNEXT_WRANGLER_CONFIG_CHANGED=NO`
- `WORKER_SIZE_RISK=NO`
- `SERVICE_BOUNDARY_RECOMMENDATION=NONE`

## Safety

- `MIGRATION_CREATED=NO`
- `SQL_EXECUTED=NO`
- `PRODUCTION_MUTATION_SMOKE_EXECUTED=NO`
- `PRODUCTION_MUTATION_SMOKE_EXECUTED_BY_CODEX=NO`
- `GENEALOGY_ROWS_MODIFIED_BY_PHASE=NO`
- `RECONCILIATION_EXECUTED=NO`
- `OFFICIAL_IMPORT_RPC_CALLED=NO`
- `DEPLOY_EXECUTED_BY_A17N_R_PHASE=NO`
- `PUSH_EXECUTED_BY_A17N_R_PHASE=NO`
- `DEPLOY_RECORDED_BY_A17N_DR=YES`
- `PUSH_RECORDED_BY_A17N_DR=YES`
- `PACKAGE_DEPENDENCY_INSTALLED=NO`

Legacy advisories remain deferred:

- `DELETED_FAMILY_COUNT=1`
- `ORPHAN_ACTIVE_PARENT_MEMBERSHIP_COUNT=2`
- `ORPHAN_ACTIVE_CHILD_MEMBERSHIP_COUNT=0`

Production reconciliation remains blocked until a separate owner-approved
phase.

## Validation

- `npm.cmd run check:a17n-r-admin-parent-child-runtime-integration` - PASS
- `npm.cmd run check:a17n-admin-parent-child-canonical-write-path` - PASS
- `npm.cmd run check:a17n-tx1-admin-canonical-family-transaction-executor-candidate` - PASS
- `npm.cmd run check:a17n-tx2f-post-apply-verifier-active-scope-correction` - PASS
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
- Direct `npm.cmd run build` - FAIL before compilation on known Windows
  `.next` artifact lock:
  `EPERM: operation not permitted, unlink 'D:\CODE\GIA PHẢ\.next\build\56416d4ae4ce586f.js'`
- Clean temp-copy `npm.cmd run build` - PASS after `npm.cmd ci` in
  `D:\CODE\.codex-temp\a17n-r-build-20260712145435`, with `.next`,
  `.open-next`, `.wrangler`, `.git`, `.tmp`, `node_modules` and local env files
  excluded from the source copy.
- `git diff --check` - PASS
- `git diff --cached --check` - PASS

## Build Status

- `DIRECT_WORKTREE_BUILD_STATUS=FAIL_KNOWN_WINDOWS_NEXT_EPHEMERAL_LOCK_BEFORE_COMPILE`
- `TEMP_COPY_BUILD_STATUS=PASS_CLEAN_TEMP_COPY_WITH_NPM_CI`

## Next

- `NEXT_ACTION=RETRY_A17O_OFFICIAL_IMPORTER_CANONICAL_FAMILY_GROUPING_FIX`
