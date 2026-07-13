# A-17Q-TX1-FIX2 Owner Review - Exact Post-State Reconciliation Candidate

Date: 2026-07-13

Status:
`A17Q_TX1_FIX2_REVIEW_STATUS=BLOCKED_ADDITIONAL_SOURCE_CORRECTION_REQUIRED`

## Scope

This review inspected migration candidate `0026` at commit `ec36b65` directly
from source. It did not apply the migration, execute SQL, run the SELECT-only
verifier, call the reconciliation executor, query production, change runtime
files, deploy or push.

## Source Authority

- `REVIEWED_COMMIT=ec36b65`
- `REVIEWED_MIGRATION_FILE=db/migrations/20260713_0026_a17q_tx1_legacy_family_reconciliation_transaction_executor_candidate.sql`
- `REVIEWED_MIGRATION_SHA256=AF9F50098AAC6B9802AF667B80DB90B238BA83F8C6F1C267A9B542CA27C6E40D`
- `SUPERSEDED_SHA256=B5F25A1F4583FCC4C54BA3385CE41624F0995EFB3A2383895D6107238A7B5934`
- `MIGRATION_0026_APPLIED=NO`
- `MIGRATION_0027_CREATED=NO`

Preconditions passed:

- `BRANCH=main`
- `WORKTREE_CLEAN=YES`
- `REMOTE_SYNC=0_0`
- `ORIGIN_MAIN_CONTAINS_EC36B65=YES`
- `ORIGIN_MAIN_CONTAINS_10A870F=YES`
- `ORIGIN_MAIN_CONTAINS_846B0C9=YES`
- `MIGRATION_SHA256_MATCH=YES`

## Preserved Contract Review

Result: `SECURITY_AND_GRANT_REVIEW=PASS`

Evidence:

- Function remains `SECURITY INVOKER` with `set search_path = public, auth, pg_temp`: lines 69-86.
- Owner marker and five hash constants remain embedded unchanged: lines 91-96.
- Public and anon EXECUTE are revoked and authenticated EXECUTE is granted: lines 1860-1903.
- No runtime caller was found in `app`, `components`, `lib`, `server` or `services`.
- Manifest counts remain embedded for 21 groups, 57 approved families, 21 survivors, 36 void families, 36 role corrections, 1 excluded group and 1 deleted-family advisory in the manifest and count checks: lines 390-396 and 910-924.

## Exact Parent-Set Review

Result: `EXACT_PARENT_ARRAY_REVIEW=PASS_WITH_SOURCE_CAVEAT`

Evidence:

- Global approved active parent membership count is checked as `114`: lines 695-702.
- Per-family precondition checks prove each configured family has two distinct active parent person IDs and one normalized parent set per group: lines 725-778.
- FIX2 snapshots survivor parent arrays deterministically using sorted UUID arrays: lines 494-519.
- Family parent arrays are compared against the survivor group array and the A-17P safe group ref is recomputed from the actual array: lines 580-599.
- Additional active families with the same normalized parent set are rejected: lines 601-620.

The exact two-membership proof is by composition: every family has two distinct
active parent person IDs and the approved scope has exactly 114 active parent
memberships across 57 families.

## Pre-Mutation Snapshot And Audit Review

Result: `PRE_MUTATION_SNAPSHOT_REVIEW=PASS`
Result: `PRE_MUTATION_AUDIT_REVIEW=PASS`

Evidence:

- Expected-state temp tables exist for parent sets, child final mappings,
  parent final states and void-to-survivor mappings: lines 261-282.
- Snapshot inserts define expected child final family/action and expected parent
  active state/role/disposition from locked rows: lines 494-578.
- Dry-run returns before batch insert, and running batch insert follows full
  precondition validation: lines 891-985.
- Rollback manifest is written before pre-mutation audit: lines 987-1060.
- Pre-mutation audit precedes first genealogy mutation: lines 1062-1141.
- Pre-mutation audit includes all five hashes, owner marker, actor/batch,
  snapshot counts, child keep/move counts, parent deactivation count, role
  correction counts, excluded/deleted counts, parent-set and safe-ref validation
  evidence, manifest hashes and rollback manifest reference: lines 1070-1138.
- Pre-mutation audit insert count and non-null ID are verified: lines 1139-1145.

## Exact Child Post-State Review

Result: `CHILD_MAPPING_POST_STATE_REVIEW=PASS`

Evidence:

- Expected child mapping captures membership ID, child person ID, source family,
  expected final family, relationship type and keep/move action: lines 532-550.
- Mutation moves only rows in the expected move set: lines 1161-1173.
- Post-state anti-join verifies all expected child mappings and relationship
  types, unexpected survivor child rows, duplicate survivor children and active
  children under void families: lines 1333-1367.
- Aggregate approved/global active child counts are checked: lines 1258-1269 and
  1540-1553.

## Parent And Role Post-State Review

Result: `PARENT_MAPPING_POST_STATE_REVIEW=PASS`
Result: `ROLE_POST_STATE_REVIEW=PASS`

Evidence:

- Expected parent final state captures membership ID, person, family, active
  state, target role, relationship type and disposition: lines 552-578.
- Survivor role updates and void-family parent deactivations are driven by the
  expected parent state: lines 1149-1187.
- Post-state checks verify missing/unexpected parent rows, duplicate survivor
  parents, active parents under void families, survivor target roles and
  superseded role rows: lines 1369-1431 and 1563-1569.
- Aggregate survivor/void/global active parent counts are checked: lines
  1251-1256, 1272-1284 and 1540-1553.

## Family Void And Merge Post-State Review

Result: `FAMILY_VOID_POST_STATE_REVIEW=PASS`
Result: `MERGE_TARGET_POST_STATE_REVIEW=PASS`

Evidence:

- Voiding is driven from `a17q_void_to_survivor_mapping`: lines 1205-1214.
- Exact family state checks cover active survivors, merged void families,
  survivor merge-target null, void-family target, reconciliation batch ID and
  active/inactive canonical status: lines 1433-1468.
- Active children and active parents under void families are separately checked:
  lines 1364-1367 and 1409-1412.
- Aggregate active family and merge target counts are checked: lines 1219-1242,
  1286-1302 and 1540-1553.

## Canonical Post-State Review

Result: `CANONICAL_KEY_POST_STATE_REVIEW=BLOCKED`

Evidence:

- Survivor canonical keys are recomputed from the verified parent UUID array
  using the serialized A-17N parent identity contract: lines 494-519.
- Survivor canonicalization writes the expected key from the parent-set snapshot:
  lines 1190-1203.
- Post-state checks reject survivor canonical-key mismatches and duplicate active
  parent-set families in the approved parent-set scope: lines 1470-1492.

Blocker:

- `CANONICAL_KEY_NOT_RECOMPUTED`: the source does not directly verify
  `DUPLICATE_ACTIVE_CANONICAL_KEY_COUNT=0` across active canonical family rows.
  The parent-set duplicate guard is useful but is not the same as an active
  `canonical_key` uniqueness proof, especially if a pre-existing row has a stale
  or incorrect canonical key.

## Graph Validation Review

Result: `GRAPH_VALIDATION_REVIEW=BLOCKED`
Result: `ANCESTRY_CYCLE_REVIEW=PASS`

Evidence:

- Self parent/child overlap and recursive ancestry cycle detection are real SQL
  checks over the resulting active graph: lines 1494-1538.
- `graph_validation_passed` is assigned only after exact post-state and graph
  checks pass: lines 1556-1634.

Blocker:

- `GRAPH_OR_CYCLE_VALIDATION_INCOMPLETE`: duplicate active parent and child
  membership checks remain scoped to approved survivor families rather than the
  resulting active genealogy graph. The prompt requires
  `DUPLICATE_ACTIVE_PARENT_MEMBERSHIP_COUNT=0` and
  `DUPLICATE_ACTIVE_CHILD_MEMBERSHIP_COUNT=0` for the active graph, plus explicit
  evidence for unexpected approved parent/child row counts.

## Durable Success Result And Replay Review

Result: `DURABLE_SUCCESS_RESULT_REVIEW=PASS_WITH_SOURCE_CAVEAT`
Result: `SUCCESS_PERSISTENCE_ORDER_REVIEW=PASS`
Result: `IDEMPOTENT_REPLAY_REVIEW=BLOCKED`

Evidence:

- Success JSON is built from actual mutation and post-state variables after
  graph validation and post-mutation audit: lines 1634-1787.
- `success_result` is persisted while the batch is still `running`; row count,
  non-null result and reread equality are verified before completion: lines
  1789-1818.
- Completion is a separate update after stored success verification, and the
  returned JSON must equal stored JSON: lines 1820-1840.
- Replay reads stored `success_result` and fails recovery-required for missing
  or malformed stored JSON: lines 442-466.

Blocker:

- `REPLAY_NOT_USING_STORED_RESULT`: replay uses stored JSON, but the source does
  not verify that the stored `batch_id` equals `v_existing_batch.id`, and no
  stored result hash is computed or checked. The prompt explicitly requires the
  stored result hash and batch ID to be checked.

## SELECT-Only Verifier Review

Result: `SELECT_ONLY_VERIFIER_REVIEW=BLOCKED`

Evidence:

- The verifier is SELECT-only and does not call the executor: lines 1-143.
- It checks function metadata, grants, policy existence and broad source markers
  for FIX2 structures.

Blocker:

- `VERIFIER_SOURCE_EVIDENCE_INCOMPLETE`: the verifier still relies mostly on
  marker/token presence. It does not independently inspect source evidence for
  exact parent active-membership proof, complete pre-mutation audit payload,
  role final-state verification, void/merge-target proof, canonical-key
  recomputation details, real cycle validation shape, stored-result hash/batch
  checks or recovery behavior when stored success is absent.

## Out-Of-Scope Check Advisory

- `OUT_OF_SCOPE_CHECK=check:tree-relationship-picker-ux`
- `OUT_OF_SCOPE_CHECK_STATUS=FAILED_UNRELATED_PLAN_A01_RUNTIME_TOKEN_EXPECTATIONS`
- `A17Q_SCOPE_IMPACT=NONE`
- `RUNTIME_CHANGED_TO_SATISFY_OUT_OF_SCOPE_CHECK=NO`

## Blocker Classification

- `BLOCKER_COUNT=4`
- `BLOCKERS=CANONICAL_KEY_NOT_RECOMPUTED, GRAPH_OR_CYCLE_VALIDATION_INCOMPLETE, REPLAY_NOT_USING_STORED_RESULT, VERIFIER_SOURCE_EVIDENCE_INCOMPLETE`

## Boundary

- `SQL_EXECUTED=NO`
- `PRODUCTION_QUERIED=NO`
- `RPC_CALLED=NO`
- `DATABASE_MUTATION=NO`
- `MIGRATION_APPLIED=NO`
- `RECONCILIATION_EXECUTED=NO`
- `RUNTIME_CHANGED=NO`
- `DEPLOY=NO`
- `PUSH=NO`

## Gate

- `MIGRATION_APPLY_AUTHORIZED=NO`
- `PRODUCTION_DRY_RUN_AUTHORIZED=NO`
- `PRODUCTION_EXECUTION_AUTHORIZED=NO`

## Next Action

`NEXT_ACTION=A17Q_TX1_FIX3`
