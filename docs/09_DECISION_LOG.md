# Decision Log

## Decision 359 - A-17Q-TX2 qualifies pgcrypto digest calls

Date: 2026-07-14

Status:
`A17Q_TX2_STATUS=PASS_PGCRYPTO_DIGEST_PATCH_CANDIDATE_READY_NOT_APPLIED`

Decision:
Create not-applied migration 0027 to replace only
`public.execute_admin_a17q_legacy_family_reconciliation`, preserving the
reviewed A-17Q transaction executor contract while schema-qualifying pgcrypto
digest calls as `extensions.digest(..., 'sha256'::text)` and qualifying
`pg_catalog.encode` plus `pg_catalog.convert_to`.

Rationale:
The authenticated owner-session production dry-run reached the applied 0026 RPC
and failed before returning a result with
`function digest(bytea, unknown) does not exist`. Owner-confirmed metadata says
`extensions.digest(bytea,text)` exists. Adding `extensions` to the function
search path would widen the reviewed security contract, so TX2 keeps
`search_path=public, auth, pg_temp` and qualifies the pgcrypto calls directly.

Evidence:

- `PATCH_MIGRATION_FILE=db/migrations/20260714_0027_a17q_tx2_schema_qualified_pgcrypto_digest_patch.sql`
- `PATCH_MIGRATION_SHA256=6CD412A9A00AE54C79999E4606BBAF58B141764F696CE823F44078859D37D9CB`
- `MIRROR_MATCH=YES`
- `PGCRYPTO_SCHEMA=extensions`
- `DIGEST_BYTEA_TEXT_EXISTS=YES`
- `QUALIFIED_EXTENSIONS_DIGEST_CALL_COUNT=17`
- `UNQUALIFIED_EXECUTABLE_DIGEST_CALL_COUNT=0`
- `RPC_SIGNATURE_UNCHANGED=YES`
- `SECURITY_INVOKER_PRESERVED=YES`
- `FIXED_SEARCH_PATH_PRESERVED=YES`
- `GRANTS_PRESERVED=YES`
- `RUNTIME_CHANGED=NO`
- `SQL_EXECUTED=NO`
- `MIGRATION_APPLIED=NO`
- `RPC_CALLED=NO`
- `DATABASE_MUTATION=NO`

Next action:
`A17Q_TX2_MANUAL_APPLY_VERIFY_AND_RETRY_AUTHENTICATED_DRY_RUN`

## Decision 358 - A-17Q-DR1 prepares production reconciliation dry-run bundle

Date: 2026-07-13

Status:
`A17Q_DR1_STATUS=PASS_PRODUCTION_DRY_RUN_BUNDLE_PREPARED_NOT_EXECUTED`

Decision:
Prepare a separate owner-reviewable dry-run SQL statement and a separate
SELECT-only post-dry-run verifier before any production dry-run execution of
`public.execute_admin_a17q_legacy_family_reconciliation`.

Evidence:

- `DRY_RUN_SQL_FILE=db/manual/20260713_a17q_dr1_production_reconciliation_dry_run.sql`
- `POST_DRY_RUN_VERIFIER_FILE=db/checks/20260713_check_a17q_dr1_post_production_reconciliation_dry_run.sql`
- `CHECKER=scripts/check-a17q-dr1-production-reconciliation-dry-run-bundle.cjs`
- `DRY_RUN_CALL_COUNT=1`
- `DRY_RUN_FLAG_TRUE=YES`
- `NON_DRY_RUN_CALL_PRESENT=NO`
- `EXPECTED_FORECAST=74/140/73_TO_38/68/73`
- `SQL_EXECUTED=NO`
- `RPC_CALLED=NO`
- `DATABASE_MUTATION=NO`
- `RECONCILIATION_EXECUTED=NO`
- `RUNTIME_CHANGED=NO`
- `DEPLOY=NO`
- `PUSH=NO`

Next action:
`A17Q_DR2_OWNER_REVIEW_AND_MANUAL_PRODUCTION_DRY_RUN`

## Decision 357 - A-17Q-TX1R records legacy family reconciliation executor manual apply verification

Date: 2026-07-13

Status: Manual apply and SELECT-only verifier evidence recorded; no reconciliation executed

Context: The owner reported that migration 0026 with SHA
`9ABDF7EDC4BEAD60316A82098C72A21BB01464510F7AD3604E4D5FAB83490C66`
was manually applied to Supabase project `frkyeuxrlcflmsxxsolp`, and that the
SELECT-only verifier passed with all contract fields true.

Decision: Record the manual production schema apply and verifier PASS evidence
without calling the reconciliation executor or changing runtime code. The next
phase may prepare the separate production reconciliation dry-run path, but this
record does not authorize execution.

Evidence:

- `A17Q_TX1R_STATUS=PASS_MANUAL_APPLY_VERIFICATION_EVIDENCE_RECORDED`
- `A17Q_TX1_MANUAL_APPLY_STATUS=PASS_MIGRATION_APPLIED_AND_SELECT_ONLY_VERIFIED_NO_RECONCILIATION`
- `TARGET_PROJECT_REF=frkyeuxrlcflmsxxsolp`
- `MIGRATION_SHA256=9ABDF7EDC4BEAD60316A82098C72A21BB01464510F7AD3604E4D5FAB83490C66`
- `FUNCTION_EXISTS=YES`
- `FUNCTION_SECURITY_MODE=SECURITY_INVOKER`
- `FUNCTION_SEARCH_PATH=public, auth, pg_temp`
- `PUBLIC_EXECUTE_ALLOWED=NO`
- `ANON_EXECUTE_ALLOWED=NO`
- `AUTHENTICATED_EXECUTE_GRANT=YES`
- `ALL_EMBEDDED_HASHES_MATCH=YES`
- `FIX3_SOURCE_CONTRACT_PRESENT=YES`
- `SUCCESS_RESULT_STORAGE_PRESENT=YES`
- `SUCCESS_RESULT_SHA256_STORAGE_PRESENT=YES`
- `DECISION_PACK_BATCH_COUNT=0`
- `COMPLETED_RECONCILIATION_BATCH_COUNT=0`
- `ROLLBACK_MANIFEST_COUNT=0`
- `DATABASE_SCHEMA_CHANGED=YES`
- `GENEALOGY_DATA_MUTATED=NO`
- `RPC_CALLED=NO`
- `RECONCILIATION_EXECUTED=NO`
- `DEPLOY=NO`
- `PUSH=NO`

## Decision 356 - A-17Q-TX1-FIX3-REVIEW approves final migration candidate source

Date: 2026-07-13

Status: Source review PASS; migration 0026 remains not applied

Context: A-17Q-TX1-FIX3 corrected the four owner-review blockers from FIX2 by
adding direct canonical uniqueness checks, global membership integrity checks,
stored success-result SHA-256 integrity and SELECT-only verifier evidence.

Decision: Approve the reviewed migration 0026 source at commit `3066ea9` as
the final manual-apply candidate. This does not authorize migration apply,
production dry-run or production execution; those remain separate owner phases.

Evidence:

- `A17Q_TX1_FIX3_REVIEW_STATUS=PASS_OWNER_REVIEW_APPROVED_FINAL_MIGRATION_FOR_MANUAL_APPLY_CANDIDATE`
- `REVIEWED_COMMIT=3066ea9`
- `REVIEWED_MIGRATION_SHA256=9ABDF7EDC4BEAD60316A82098C72A21BB01464510F7AD3604E4D5FAB83490C66`
- `CANONICAL_UNIQUENESS_REVIEW=PASS`
- `GLOBAL_MEMBERSHIP_INTEGRITY_REVIEW=PASS`
- `GRAPH_COMPLETION_GATE_REVIEW=PASS`
- `FRESH_SUCCESS_RESULT_INTEGRITY_REVIEW=PASS`
- `COMPLETED_REPLAY_INTEGRITY_REVIEW=PASS`
- `SUCCESS_PERSISTENCE_ORDER_REVIEW=PASS`
- `SELECT_ONLY_VERIFIER_REVIEW=PASS`
- `BLOCKER_COUNT=0`
- `BLOCKERS=NONE`
- `MIGRATION_APPLY_AUTHORIZED=NO`
- `PRODUCTION_DRY_RUN_AUTHORIZED=NO`
- `PRODUCTION_EXECUTION_AUTHORIZED=NO`
- `SQL_EXECUTED=NO`
- `PRODUCTION_QUERIED=NO`
- `RPC_CALLED=NO`
- `DATABASE_MUTATION=NO`

## Decision 355 - A-17Q-TX1-FIX3 finalizes integrity contract

Date: 2026-07-13

Status: Source corrected; migration 0026 remains not applied

Context: A-17Q-TX1-FIX2-REVIEW blocked manual apply because global active
canonical-key ownership, global duplicate active parent/child membership
checks, stored replay result hash/batch integrity and SELECT-only verifier
source evidence were still incomplete.

Decision: Correct the existing not-applied migration 0026 in place, keep db and
Supabase mirrors byte-identical, add no migration 0027, and require a separate
owner review/manual apply phase before any production execution. The FIX2 SHA is
superseded and must never be applied.

Evidence:

- `A17Q_TX1_FIX3_STATUS=PASS_FINAL_INTEGRITY_RECONCILIATION_CONTRACT_READY_NOT_APPLIED`
- `A17Q_TX1_FIX3_OLD_SHA256_SUPERSEDED=AF9F50098AAC6B9802AF667B80DB90B238BA83F8C6F1C267A9B542CA27C6E40D`
- `A17Q_TX1_FIX3_NEW_SHA256=9ABDF7EDC4BEAD60316A82098C72A21BB01464510F7AD3604E4D5FAB83490C66`
- `MIRROR_MATCH=YES`
- `GLOBAL_DUPLICATE_ACTIVE_CANONICAL_KEY_CHECK=YES`
- `APPROVED_CANONICAL_KEY_OWNER_CHECK=YES`
- `GLOBAL_DUPLICATE_ACTIVE_PARENT_MEMBERSHIP_CHECK=YES`
- `GLOBAL_DUPLICATE_ACTIVE_CHILD_MEMBERSHIP_CHECK=YES`
- `GLOBAL_PARENT_CHILD_OVERLAP_CHECK=YES`
- `SUCCESS_RESULT_SHA256_STORAGE=YES`
- `FRESH_RESULT_INTEGRITY_VERIFIED_BEFORE_COMPLETION=YES`
- `COMPLETED_REPLAY_INTEGRITY_VERIFIED=YES`
- `REPLAY_MUTATION_PATH_COUNT=0`
- `SELECT_ONLY_VERIFIER_UPDATED=YES`
- `MIGRATION_0026_APPLIED=NO`
- `MIGRATION_0027_CREATED=NO`
- `SQL_EXECUTED=NO`
- `PRODUCTION_QUERIED=NO`
- `RPC_CALLED=NO`
- `DATABASE_MUTATION=NO`

## Decision 354 - A-17Q-TX1-FIX2-REVIEW blocks migration 0026 apply

Date: 2026-07-13

Status: Blocked; additional source correction required before any manual apply

Context: Owner review of commit `ec36b65` and migration 0026 SHA
`AF9F50098AAC6B9802AF667B80DB90B238BA83F8C6F1C267A9B542CA27C6E40D`
confirmed that FIX2 improved exact post-state validation, but several high-risk
contracts are still not proven strongly enough for a reconciliation executor.

Decision: Do not approve migration 0026 for manual apply, production dry-run or
execution. Keep the reviewed migration unchanged in this review phase and start
a separate A-17Q-TX1-FIX3 source-correction phase.

Evidence:

- `A17Q_TX1_FIX2_REVIEW_STATUS=BLOCKED_ADDITIONAL_SOURCE_CORRECTION_REQUIRED`
- `REVIEWED_COMMIT=ec36b65`
- `REVIEWED_MIGRATION_SHA256=AF9F50098AAC6B9802AF667B80DB90B238BA83F8C6F1C267A9B542CA27C6E40D`
- `BLOCKER_COUNT=4`
- `BLOCKERS=CANONICAL_KEY_NOT_RECOMPUTED, GRAPH_OR_CYCLE_VALIDATION_INCOMPLETE, REPLAY_NOT_USING_STORED_RESULT, VERIFIER_SOURCE_EVIDENCE_INCOMPLETE`
- `MIGRATION_APPLY_AUTHORIZED=NO`
- `PRODUCTION_DRY_RUN_AUTHORIZED=NO`
- `PRODUCTION_EXECUTION_AUTHORIZED=NO`
- `SQL_EXECUTED=NO`
- `PRODUCTION_QUERIED=NO`
- `RPC_CALLED=NO`
- `DATABASE_MUTATION=NO`

## Decision 353 - A-17Q-TX1-FIX2 completes exact post-state contract

Date: 2026-07-13

Status: Source corrected; migration 0026 remains not applied

Context: A-17Q-TX1-FIX1-REVIEW blocked manual apply because exact
child/parent/role/family/canonical/graph post-state checks and durable success
result ordering were not fully proven in source.

Decision: Correct the existing not-applied migration 0026 in place, keep db and
Supabase mirrors byte-identical, add no migration 0027, and require a separate
owner review/manual apply phase before any production execution. The FIX1 SHA is
superseded and must never be applied.

Evidence:

- `A17Q_TX1_FIX2_STATUS=PASS_EXACT_POST_STATE_RECONCILIATION_CONTRACT_READY_NOT_APPLIED`
- `A17Q_TX1_FIX2_OLD_SHA256_SUPERSEDED=B5F25A1F4583FCC4C54BA3385CE41624F0995EFB3A2383895D6107238A7B5934`
- `A17Q_TX1_FIX2_NEW_SHA256=AF9F50098AAC6B9802AF667B80DB90B238BA83F8C6F1C267A9B542CA27C6E40D`
- `MIRROR_MATCH=YES`
- `EXACT_CHILD_POST_STATE_CONTRACT=YES`
- `EXACT_PARENT_ROLE_POST_STATE_CONTRACT=YES`
- `EXACT_FAMILY_CANONICAL_POST_STATE_CONTRACT=YES`
- `EXACT_GRAPH_POST_STATE_CONTRACT=YES`
- `REPLAY_SAFE_SUCCESS_RESULT_CONTRACT=YES`
- `MIGRATION_0026_APPLIED=NO`
- `MIGRATION_0027_CREATED=NO`
- `SQL_EXECUTED=NO`
- `PRODUCTION_QUERIED=NO`
- `RPC_CALLED=NO`
- `DATABASE_MUTATION=NO`

## Decision 352 - A-17Q-TX1-FIX1-REVIEW blocks migration 0026 apply

Date: 2026-07-13

Status: Blocked; additional source correction required before any manual apply

Context: Owner review of commit `842e7b4` and migration 0026 SHA
`B5F25A1F4583FCC4C54BA3385CE41624F0995EFB3A2383895D6107238A7B5934`
confirmed that FIX1 addressed several prior review issues, but the source still
does not prove all high-risk post-mutation contracts at exact manifest level.

Decision: Do not approve migration 0026 for manual apply, production dry-run or
execution. Keep the reviewed migration unchanged in this review phase and start
a separate A-17Q-TX1-FIX2 source-correction phase.

Evidence:

- `A17Q_TX1_FIX1_REVIEW_STATUS=BLOCKED_ADDITIONAL_SOURCE_CORRECTION_REQUIRED`
- `REVIEWED_COMMIT=842e7b4`
- `REVIEWED_MIGRATION_SHA256=B5F25A1F4583FCC4C54BA3385CE41624F0995EFB3A2383895D6107238A7B5934`
- `BLOCKER_COUNT=10`
- `BLOCKERS=EXACT_PARENT_SET_NOT_PROVEN, CHILD_MAPPING_POST_STATE_NOT_VERIFIED, PARENT_POST_STATE_NOT_VERIFIED, ROLE_POST_STATE_NOT_VERIFIED, FAMILY_POST_STATE_NOT_VERIFIED, CANONICAL_POST_STATE_NOT_VERIFIED, GRAPH_VALIDATION_HARDCODED_OR_INCOMPLETE, SUCCESS_RESULT_NOT_STORED_BEFORE_COMPLETION, SELECT_ONLY_VERIFIER_SOURCE_EVIDENCE_INCOMPLETE, PRE_MUTATION_AUDIT_CONTENT_INCOMPLETE`
- `MIGRATION_APPLY_AUTHORIZED=NO`
- `PRODUCTION_DRY_RUN_AUTHORIZED=NO`
- `PRODUCTION_EXECUTION_AUTHORIZED=NO`
- `SQL_EXECUTED=NO`
- `PRODUCTION_QUERIED=NO`
- `RPC_CALLED=NO`
- `DATABASE_MUTATION=NO`

## Decision 351 - A-17Q-TX1-FIX1 hardens migration 0026 before apply

Date: 2026-07-13

Context: Owner review found that the A-17Q-TX1 executor candidate was not ready
for apply because idempotency replay, precondition coverage, mutation order,
pre-mutation audit and post-state verification were incomplete.

Decision: Correct the existing not-applied migration 0026 in place, keep db and
Supabase mirrors byte-identical, and do not create migration 0027. The old
migration SHA is superseded and must never be applied. The hardened candidate
requires a fresh owner review before any manual apply.

Evidence:

- `A17Q_TX1_FIX1_STATUS=PASS_HARDENED_TRANSACTION_EXECUTOR_CANDIDATE_NOT_APPLIED`
- `A17Q_TX1_OLD_SHA256_SUPERSEDED=696441637B308257ED8B45991EAD2542B4A5A14A648BBE0CCC2D5E996DD18D3B`
- `DB_MIGRATION_SHA256=B5F25A1F4583FCC4C54BA3385CE41624F0995EFB3A2383895D6107238A7B5934`
- `SUPABASE_MIRROR_SHA256=B5F25A1F4583FCC4C54BA3385CE41624F0995EFB3A2383895D6107238A7B5934`
- `MIRROR_MATCH=YES`
- `IDEMPOTENCY_REPLAY_CONTRACT_IMPLEMENTED=YES`
- `PRECONDITION_REVIEW_COMPLETE=YES`
- `MUTATION_ORDER_CONTRACT_MATCHES_REVIEW=YES`
- `AUDIT_PRE_MUTATION_PRESENT=YES`
- `POST_STATE_VERIFIED_BEFORE_COMPLETED=YES`
- `MIGRATION_0026_APPLIED=NO`
- `MIGRATION_0027_CREATED=NO`
- `SQL_EXECUTED=NO`
- `PRODUCTION_QUERIED=NO`
- `RPC_CALLED=NO`
- `DATABASE_MUTATION=NO`

## Decision 350 - A-17Q-TX1 creates fail-closed reconciliation executor candidate

Date: 2026-07-13

Status: Accepted candidate design, migration not applied and execution not authorized

Context: A-17P-R finalized an immutable owner decision pack for 21 approved
legacy duplicate-family groups. The next step is a transaction executor
candidate that is bound to that exact pack, preserves the excluded one-parent
group and deleted-family advisory outside executable scope, and fails closed on
hash, permission or production-state drift.

Decision: Create mirrored migration 0026 with one narrow
`SECURITY INVOKER` RPC, `public.execute_admin_a17q_legacy_family_reconciliation`.
The candidate embeds the A-17P-R decision pack, requires the owner marker and
all five hashes, requires authenticated profile context plus
`relationships.update` and `permissions.manage`, uses advisory and row locks,
supports a non-mutating dry-run path, creates rollback/audit/idempotency
evidence before execution, and has no runtime caller. A SELECT-only verifier and
static checker are created for owner review and later manual apply verification.

Evidence:

- `A17Q_TX1_STATUS=PASS_TRANSACTION_EXECUTOR_CANDIDATE_CREATED_NOT_APPLIED`
- `MIGRATION_FILE=db/migrations/20260713_0026_a17q_tx1_legacy_family_reconciliation_transaction_executor_candidate.sql`
- `DB_MIGRATION_SHA256=696441637B308257ED8B45991EAD2542B4A5A14A648BBE0CCC2D5E996DD18D3B`
- `RPC_NAME=public.execute_admin_a17q_legacy_family_reconciliation`
- `APPROVED_GROUP_COUNT=21`
- `APPROVED_CANDIDATE_FAMILY_COUNT=57`
- `VOID_FAMILY_COUNT=36`
- `ROLE_CORRECTION_PLAN_COUNT=36`
- `EXCLUDED_SCOPE_EXECUTABLE=NO`
- `DELETED_FAMILY_EXECUTABLE=NO`
- `ACTIVE_RUNTIME_CALLER_COUNT=0`

Safety: Codex did not execute SQL, query production, call RPCs, mutate
database rows, void families, move memberships, change relationship roles,
apply the migration, change runtime application code, deploy or push. Owner
review, manual apply, production dry-run and execution remain separate gates.

## Decision 349 - A-17P-R finalizes immutable owner decision pack

Date: 2026-07-13

Status: Accepted immutable decision pack, execution not authorized

Context: A-17P manual owner approval recorded a 21-group reconciliation policy
from the A-17P-FIX3 owner-facing production result. Before any transaction
executor can be designed, the owner decision needs a machine-readable,
deterministic and hash-protected artifact with explicit execution boundaries.

Decision: Create `docs/evidence/A17P_OWNER_DECISION_PACK.json` and
`docs/evidence/A17P_OWNER_DECISION_PACK.sha256` using schema
`a17p-owner-decision-pack:v1`. The pack includes 21 approved groups, 21
survivors, 36 families to void, 36 owner-confirmed role corrections, the
excluded one-parent group, the deleted-family advisory, forecast counts and
canonical SHA-256 hashes. The pack is an authority candidate for later design
only; reconciliation execution remains unauthorized.

Evidence:

- `A17P_R_STATUS=PASS_IMMUTABLE_OWNER_DECISION_PACK_FINALIZED`
- `APPROVED_GROUP_COUNT=21`
- `APPROVED_CANDIDATE_FAMILY_COUNT=57`
- `APPROVED_SURVIVOR_COUNT=21`
- `APPROVED_VOID_FAMILY_COUNT=36`
- `ROLE_CORRECTION_GROUP_COUNT=8`
- `ROLE_CORRECTION_FAMILY_COUNT=18`
- `ROLE_CORRECTION_MEMBERSHIP_COUNT=36`
- `ROLE_CORRECTION_DISTINCT_PERSON_COUNT=16`
- `DECISION_PACK_SHA256=777a8bb13ff45eb9f46fd817c392098ada4a2d550cad8e6ee4c6cd896b874ad0`

Safety: The decision pack contains no production names and no private/contact
or authentication data. Codex did not execute SQL, query production, call RPCs,
mutate database rows, void families, move memberships, change relationship
roles, create migrations, change runtime behavior, deploy or push.

## Decision 348 - A-17P manual owner approval recorded for 21 groups

Date: 2026-07-13

Status: Accepted owner approval evidence, decision pack not finalized

Context: The owner ran the A-17P-FIX3 owner-facing production result review and
approved reconciliation execution for 21 of the 22 reviewed duplicate
parent-set groups. The one-parent group remains excluded pending separate
one-parent and deleted-family context reconciliation. The deleted family remains
a separate reconciliation decision.

Decision: Record the owner approval marker
`A17P_MANUAL_21_GROUP_RECONCILIATION_APPROVED`, the 21 approved execution
groups, the excluded group reference, the equivalent-candidate survivor policy
and the eight role-confirmation group references as sanitized evidence. Do not
finalize a decision pack, create a pack hash, execute reconciliation, mutate
database rows or change relationship roles in this record phase.

Evidence:

- `A17P_MANUAL_APPROVAL_STATUS=PASS_OWNER_APPROVED_21_GROUP_RECONCILIATION_RECORDED`
- `VERIFIED_SOURCE=A17P_FIX3_OWNER_FACING_PRODUCTION_RESULT`
- `TOTAL_REVIEWED_GROUP_COUNT=22`
- `APPROVED_EXECUTION_GROUP_COUNT=21`
- `EXCLUDED_GROUP_COUNT=1`
- `EXCLUDED_GROUP_REF=721e2ae3d95dd418af40b6459531b870`
- `DELETED_FAMILY_DECISION=SEPARATE_RECONCILIATION_REQUIRED`
- `SURVIVOR_POLICY=FAMILY_REVIEW_ORDER_1_FOR_EACH_OF_THE_21_APPROVED_GROUPS`
- `OWNER_CONFIRMS_ROLE_CORRECTION_GROUP_COUNT=8`
- `EXPECTED_VOID_FAMILY_COUNT=36`

Safety: Production person names supplied during owner review are not committed
to repository docs. Codex did not execute SQL, call RPCs, mutate database rows,
change relationship roles, run reconciliation, create migrations, change
runtime behavior, deploy or push.

## Decision 347 - A-17P-FIX3 adds parent role gender review evidence

Date: 2026-07-13

Status: Accepted advisory evidence, no role correction

Context: The owner-facing A-17P review query needs enough evidence for the
owner to compare current `family_parents.parent_role` values with
`people.gender` before deciding survivor/void actions. This must remain
SELECT-only and must not rewrite relationship roles or infer missing father or
mother context.

Decision: Extend the owner-facing legacy family review query with
`parent_gender`, `expected_role_from_gender`, `role_gender_review_status`,
`role_gender_warning` and null owner confirmation placeholders. Add a dedicated
`owner_review_role_gender_advisory` result set and integrity fields for parent
gender evidence, advisory presence, mismatch counts, no automatic role
correction and null owner confirmation placeholders.

Evidence:

- `A17P_FIX3_STATUS=PASS_PARENT_ROLE_GENDER_REVIEW_EVIDENCE_READY`
- `PARENT_GENDER_INCLUDED=YES`
- `ROLE_GENDER_ADVISORY_CREATED=YES`
- `ROLE_GENDER_INTEGRITY_FIELDS_CREATED=YES`
- `AUTOMATIC_ROLE_CORRECTION_PRESENT=NO`
- `OWNER_ROLE_CONFIRMATION_PLACEHOLDERS_NULL=YES`
- `EXPECTED_ROLE_GENDER_MISMATCH_GROUP_COUNT=8`

Safety: Codex did not execute SQL, call RPCs, mutate database rows, change
relationship roles, run reconciliation, create migrations, change runtime
behavior, deploy or push.

## Decision 346 - A-17P-FIX2 adds owner-facing review query

Date: 2026-07-13

Status: Accepted owner-review support, no execution

Context: A-17P manual review correctly blocked because the review materials did
not include an owner-facing SELECT-only query with parent, role and child names.
The corrected FIX1 audit was verified, but survivor selection must not happen
from hashes, UUID order, created-at order or query row order.

Decision: Add a separate owner-facing SELECT-only review query for the 22
legacy duplicate parent-set groups. Preserve exact parent-set grouping from
FIX1, include parent and child display names, expose family IDs only in the
owner-run SQL result, keep owner decision fields null, and keep the deleted
family advisory outside the normal group decision batch.

Evidence:

- `A17P_FIX2_STATUS=PASS_OWNER_FACING_LEGACY_FAMILY_REVIEW_QUERY_READY`
- `OWNER_FACING_QUERY_FILE=db/checks/20260713_check_a17p_owner_facing_legacy_family_review.sql`
- `EXACT_PARENT_SET_GROUPING_PRESERVED=YES`
- `PARENT_DISPLAY_NAMES_INCLUDED=YES`
- `PARENT_ROLES_INCLUDED=YES`
- `CHILD_DISPLAY_NAMES_INCLUDED=YES`
- `FAMILY_IDS_INCLUDED_FOR_OWNER_SELECTION=YES`
- `PRIVATE_FIELDS_EXCLUDED=YES`
- `OWNER_REVIEW_INTEGRITY_RESULT_SET_CREATED=YES`
- `AUTOMATIC_OWNER_APPROVAL_PRESENT=NO`
- `OWNER_DECISION_PLACEHOLDERS_NULL=YES`

Safety: Codex did not execute SQL, call RPCs, mutate database rows, run
reconciliation, create migrations, change runtime behavior, deploy or push.
Production names and IDs remain absent from committed docs and fixtures.

## Decision 345 - A-17P-FIX1 corrects legacy reconciliation audit joins

Date: 2026-07-13

Status: Accepted audit correction, no execution

Context: The first owner-run A-17P SELECT-only audit found that several result
sets were internally inconsistent because joins multiplied rows or associated a
family to a duplicate group through only one shared parent. The observed safe
production evidence remained read-only: active baseline `74/140/73`, duplicate
groups `22`, candidate families `60`, redundant forecast `38`, and no
production mutation.

Decision: Correct the existing A-17P SELECT-only audit before owner review.
Build groups only from the complete normalized parent set, calculate parent,
child, layout, revision and deleted-family counts in independent aggregate CTEs,
and add an `audit_integrity` result set that checks candidate pair uniqueness,
membership subset mapping, child/parent count agreement, duplicate semantics,
deleted-family scope agreement and non-multiplied layout/revision counts.

Evidence:

- `A17P_FIX1_STATUS=PASS_LEGACY_RECONCILIATION_AUDIT_AGGREGATION_GROUP_MAPPING_CORRECTED`
- `AUDIT_QUERY_CORRECTED=YES`
- `EXACT_PARENT_SET_GROUP_MAPPING=YES`
- `JOIN_FAN_OUT_REMOVED=YES`
- `CANDIDATE_CHILD_COUNTS_CORRECTED=YES`
- `DUPLICATE_CHILD_COUNTS_CORRECTED=YES`
- `MEMBERSHIP_DETAIL_GROUP_MAPPING_CORRECTED=YES`
- `LAYOUT_COUNTS_CORRECTED=YES`
- `REVISION_COUNTS_CORRECTED=YES`
- `DELETED_FAMILY_SCOPE_CORRECTED=YES`
- `AUDIT_INTEGRITY_RESULT_SET_ADDED=YES`
- `EXPECTED_GROUP_COUNT=22`
- `EXPECTED_CANDIDATE_FAMILY_COUNT=60`
- `EXPECTED_REDUNDANT_FAMILY_FORECAST=38`

Safety: Codex did not execute SQL, call RPCs, run reconciliation, mutate
genealogy rows, create migrations, deploy or push. The next action is owner
rerun of the corrected SELECT-only audit.

## Decision 344 - A-17P prepares legacy reconciliation review pack

Date: 2026-07-13

Status: Accepted review-pack preparation, no execution

Context: A-17O-DR records that the grouped official importer runtime is pushed,
deployed and covered by production no-import-mutation smoke. A-17N-DR records
that admin parent/child canonical writes are also deployed. The known future
write paths are fixed, but legacy fragmented family rows still require owner
review before any reconciliation execution.

Decision: Prepare only the read-only audit, pure dry-run planner, synthetic
fixture suite and owner review pack. Keep decision pack hash, owner approval
marker and execution batch unassigned. Do not query production, execute SQL,
modify runtime, create migrations, backfill canonical keys, reconcile, deploy
or push in this phase.

Evidence:

- `A17P_STATUS=PASS_LEGACY_RECONCILIATION_AUDIT_DRY_RUN_OWNER_REVIEW_PACK_READY`
- `CURRENT_BASELINE_ACTIVE_FAMILIES=74`
- `CURRENT_BASELINE_ACTIVE_PARENT_MEMBERSHIPS=140`
- `CURRENT_BASELINE_ACTIVE_CHILD_MEMBERSHIPS=73`
- `EXPECTED_DUPLICATE_PARENT_SET_GROUP_COUNT=22`
- `REDUNDANT_FAMILY_ESTIMATE=38`
- `FAMILIES_WITH_MULTIPLE_CHILDREN=0`
- `SELECT_ONLY_AUDIT_STATIC_CHECK=PASS`
- `DRY_RUN_DATABASE_CALL_COUNT=0`
- `DRY_RUN_RPC_CALL_COUNT=0`
- `OWNER_AUTO_APPROVAL_PRESENT=NO`
- `DECISION_PACK_FINALIZED=NO`
- `DECISION_PACK_HASH_CREATED=NO`
- `SYNTHETIC_FIXTURE_COUNT=30`
- `DELETED_FAMILY_AUTOMATIC_ACTION_PLANNED=NO`
- `RECONCILIATION_EXECUTED=NO`

Safety: All reconciliation material is advisory and owner-review-only. The
deleted family with active parent memberships remains a separate owner decision.

## Decision 343 - A-17O-DR records grouped importer deploy smoke evidence

Date: 2026-07-13

Status: Accepted deploy and no-import-mutation evidence

Context: A-17O-R connected the future official-import source path to grouped
planning and the verified grouped executor adapter. The owner later confirmed
that runtime commit `e8def2f` was pushed, deployed to production and covered by
browser no-import-mutation smoke plus before/after database verifier evidence.

Decision: Record A-17O-DR as documentation/checker evidence only. Mark A-17O-R
as deployed and verified, keep official import execution closed for this phase,
and open the next separate legacy canonical family reconciliation design phase.

Evidence:

- `A17O_DR_STATUS=PASS_DEPLOY_AND_PRODUCTION_NO_IMPORT_MUTATION_SMOKE_RECORDED`
- `A17O_R_STATUS=PASS_GROUPED_IMPORTER_RUNTIME_DEPLOYED_AND_VERIFIED`
- `RUNTIME_COMMIT=e8def2f`
- `PUSH_STATUS=PASS`
- `PUSHED_COMMIT=e8def2f`
- `CLOUDFLARE_DEPLOY_STATUS=PASS`
- `DEPLOYED_COMMIT=e8def2f`
- `DATABASE_BEFORE_SMOKE=PASS`
- `BROWSER_NO_IMPORT_MUTATION_SMOKE=PASS`
- `DATABASE_AFTER_SMOKE=PASS`
- `GROUPED_RPC_VISIBLE_IN_NETWORK=NO`
- `OLD_IMPORT_RPC_VISIBLE_IN_NETWORK=NO`
- `IMPORT_FORM_SUBMITTED=NO`
- `PRODUCTION_IMPORT_EXECUTED=NO`
- `ACTIVE_FAMILY_COUNT_AFTER=74`
- `ACTIVE_PARENT_MEMBERSHIP_COUNT_AFTER=140`
- `ACTIVE_CHILD_MEMBERSHIP_COUNT_AFTER=73`
- `GROUPED_BATCH_COUNT_AFTER=0`
- `IDEMPOTENCY_ROW_COUNT_AFTER=0`
- `GROUPED_EXECUTOR_REVISION_COUNT_AFTER=0`
- `GROUPED_ROLLBACK_MANIFEST_COUNT_AFTER=0`
- `CANONICAL_KEY_BACKFILL_COUNT_AFTER=0`
- `COMPLETED_PRODUCTION_SESSION_STILL_NON_EXECUTABLE=YES`
- `A17_LEGACY_RECONCILIATION_READINESS=READY_ALL_KNOWN_WRITE_PATHS_FIXED_AND_DEPLOYED`

Safety: Codex did not execute SQL, deploy, call import RPCs, submit import
forms, mutate genealogy rows, run reconciliation, install dependencies or
change runtime code in this evidence phase.

## Decision 342 - A-17O-R activates grouped official importer runtime source path

Date: 2026-07-13

Status: Accepted source integration, not deployed

Context: A-17O-TX1R recorded owner manual production apply and SELECT-only
verification PASS for the grouped official-import executor
`public.a17o_tx_execute_grouped_giapha4_official_import`. The completed Gia Pha
4 production import session must never be retried or passed to either executor.

Decision: Connect only the future official-import source path to A-17O grouped
planning and the grouped executor adapter. Preserve same-run authenticated
identity precheck, permission gates, session state gates, approval marker,
manifest hash, rollback confirmation and audit confirmation. Keep dry-run
source-only because the SQL dry-run flag deliberately returns a blocked result
instead of simulating mutation.

Evidence:

- `A17O_R_STATUS=PASS_GROUPED_IMPORTER_RUNTIME_SOURCE_INTEGRATED`
- `FUTURE_IMPORT_CALLS_GROUPED_EXECUTOR=YES`
- `ACTIVE_FUTURE_IMPORT_CALLS_OLD_EXECUTOR=NO`
- `GROUPED_EXECUTOR_ADAPTER_CREATED=YES`
- `END_USER_SERVER_CONTEXT_USED=YES`
- `SERVICE_ROLE_USED=NO`
- `COMPLETED_OFFICIAL_IMPORT_REJECTED_BEFORE_RPC=YES`
- `COMPLETED_PRODUCTION_SESSION_GROUPED_RPC_CALL_COUNT=0`
- `COMPLETED_PRODUCTION_SESSION_OLD_RPC_CALL_COUNT=0`
- `OFFICIAL_IMPORT_RPC_CALLED=NO`
- `SQL_EXECUTED=NO`
- `DEPLOY=NO`
- `PUSH=NO`

Safety: No migration was created or modified, no SQL was executed, no
production import endpoint was called, no official import RPC was called, no
genealogy rows were modified, and no reconciliation was executed.

## Decision 341 - A-17O-TX1R records grouped executor production verification

Date: 2026-07-13

Status: Accepted evidence

Context: A-17O-TX1 created a grouped official-import transaction executor
candidate and SELECT-only verifier. The owner manually applied migration 0025
to Gia Pha production and ran the verifier.

Decision: Record owner-provided production evidence that migration 0025 is
applied and the SELECT-only verifier passed. Mark the grouped executor as
available for a future, separate runtime integration phase. Do not change
runtime importer code, call either official import executor, retry import,
execute SQL, reconcile families, deploy, or mutate production genealogy data in
this evidence phase.

Evidence:

- `A17O_TX1R_STATUS=PASS_OWNER_MANUAL_PRODUCTION_APPLY_AND_SELECT_ONLY_VERIFY_RECORDED`
- `A17SQL_O_TX1_STATUS=PASS_OWNER_MANUAL_PRODUCTION_APPLY_AND_SELECT_ONLY_VERIFY`
- `MIGRATION_SHA256=87EE4675746D948C3B32E8E7809A5945F8EA153EC2A6107355EF3E271E3DD4B2`
- `NEW_GROUPED_EXECUTOR_EXISTS=YES`
- `OLD_EXECUTOR_PRESERVED=YES`
- `SECURITY_INVOKER=YES`
- `FIXED_SEARCH_PATH=YES`
- `AUTHENTICATED_EXECUTE_COUNT=1`
- `ANON_EXECUTE_COUNT=0`
- `PUBLIC_EXECUTE_COUNT=0`
- `ACTIVE_FAMILY_COUNT_AFTER=74`
- `ACTIVE_PARENT_MEMBERSHIP_COUNT_AFTER=140`
- `ACTIVE_CHILD_MEMBERSHIP_COUNT_AFTER=73`
- `GROUPED_BATCH_COUNT=0`
- `IDEMPOTENCY_ROW_COUNT=0`
- `GROUPED_EXECUTOR_REVISION_COUNT=0`
- `GROUPED_ROLLBACK_MANIFEST_COUNT=0`
- `CANONICAL_KEY_BACKFILL_COUNT=0`
- `A17O_RUNTIME_INTEGRATION_READINESS=READY_GROUPED_EXECUTOR_APPLIED_AND_VERIFIED`

## Decision 340 - A-17O-TX1 adds grouped official import executor candidate

Date: 2026-07-13

Status: Proposed candidate, not applied

Context: A-17O confirmed that the current official import executor creates one
family per child. The importer grouping foundation is dormant until the
database transaction boundary can create or reuse one canonical family and
attach multiple children atomically.

Decision: Add a new not-applied migration 0025 that creates
`public.a17o_tx_execute_grouped_giapha4_official_import` as a SECURITY INVOKER
candidate executor, plus grouped execution idempotency metadata and grouped
rollback summary metadata. Preserve
`public.a16p_tx_execute_giapha4_official_import` unchanged for existing
completed import compatibility.

Rationale:

- The grouped payload must be validated inside the same transaction that writes
  people, families, memberships, revisions, audit batch and rollback manifest.
- The old executor remains useful historical contract evidence and must not be
  changed by a candidate that has not been owner-reviewed or applied.
- Runtime activation, owner manual apply, post-apply verification and any
  official import retry remain separate phases.

Safety:

- `A17O_TX1_STATUS=CANDIDATE_READY_NOT_APPLIED_OWNER_REVIEW_REQUIRED`
- `OLD_EXECUTOR_SIGNATURE_CHANGED=NO`
- `OLD_EXECUTOR_DROPPED=NO`
- `GROUPED_EXECUTOR_CREATED=YES`
- `SECURITY_MODE=SECURITY_INVOKER`
- `GROUPED_PAYLOAD_SUPPORT=YES`
- `ONE_FAMILY_MULTIPLE_CHILDREN_SUPPORTED=YES`
- `ROLLBACK_DISTINGUISHES_CREATED_VS_PREEXISTING=YES`
- `SQL_EXECUTED=NO`
- `MIGRATION_APPLIED=NO`
- `OFFICIAL_IMPORT_RPC_CALLED=NO`
- `DEPLOY=NO`
- `PUSH=NO`

## Decision 339 - A-17O keeps importer grouping dormant until grouped transaction executor exists

Date: 2026-07-13

Chon:

Add a dormant source grouping foundation for Gia Pha 4 official imports, but do
not activate importer runtime grouping while the current official import RPC
still creates one family per child.

Ly do:

- The current `public.a16p_tx_execute_giapha4_official_import` implementation
  creates a new `family_id` in `clear_children` for each child fingerprint.
- The route and service call the RPC directly; there is no grouped family
  payload contract for one family with multiple children.
- Activating app-side grouping before transaction support would make preview,
  audit, rollback and idempotency counts disagree with actual database writes.

Ket luan:

- `A17O_STATUS=BLOCKED_IMPORT_TRANSACTION_EXECUTOR_GROUPED_FAMILY_SUPPORT_REQUIRED`
- `IMPORTER_CANONICAL_GROUPING_RUNTIME_ACTIVE=NO`
- `NEXT_ACTION=START_SEPARATE_A17O_TX1_GROUPED_IMPORT_TRANSACTION_EXECUTOR_CANDIDATE`

## Decision 338 - A-17N-DR records deployed canonical admin no-mutation smoke

Date: 2026-07-12

Status: Accepted

Context: A-17N-R completed the canonical admin parent/child runtime integration
at commit `256d746`, but repository documentation still recorded the phase as
ready for owner review with deploy/smoke pending. A-17O correctly stopped
because deploy and production no-mutation smoke evidence had not yet been
recorded.

Decision: Record owner-confirmed deployment of A-17N-R commit `256d746` and
owner manual production browser/database no-mutation smoke evidence. Mark
A-17N-R as deployed and no-mutation smoke verified, and open A-17O readiness.

Rationale:

- The deployed revision is confirmed as `256d746`.
- The production URL is
  `https://web-gia-pha.hungdiepcompany.workers.dev`.
- Browser smoke verified authenticated admin tree/edit route access and UI
  mode activation without submitting any relationship form.
- Network evidence showed no request to
  `execute_admin_canonical_family_parent_child_write`.
- Corrected SELECT-only before/after database baselines remained unchanged:
  active families/parents/children `74 / 140 / 73`, idempotency rows `0`, and
  transaction executor revision rows `0`.

Safety:

- `A17N_DR_STATUS=PASS_DEPLOY_AND_PRODUCTION_NO_MUTATION_SMOKE_RECORDED`
- `A17N_R_STATUS=PASS_RUNTIME_INTEGRATION_DEPLOYED_AND_NO_MUTATION_SMOKE_VERIFIED`
- `CLOUDFLARE_DEPLOY_STATUS=PASS`
- `DEPLOYED_COMMIT=256d746`
- `DATABASE_BASELINE_BEFORE_SMOKE=PASS`
- `BROWSER_NO_MUTATION_SMOKE=PASS`
- `DATABASE_BASELINE_AFTER_SMOKE=PASS`
- `TRANSACTION_EXECUTOR_CALLED=NO`
- `GENEALOGY_ROWS_MODIFIED=NO`
- `PRODUCTION_DATA_DRIFT=NO`
- `RECONCILIATION_EXECUTED=NO`
- `OFFICIAL_IMPORT_RPC_CALLED=NO`
- `RUNTIME_CHANGED=NO`
- `MIGRATION_CREATED=NO`
- `MIGRATION_CHANGED=NO`
- `SQL_EXECUTED=NO`
- `RPC_CALLED=NO`
- `DEPLOY_EXECUTED_BY_THIS_PHASE=NO`

Next:

- `A17O_READINESS=READY_A17N_DEPLOY_SMOKE_EVIDENCE_RECORDED`
- `NEXT_ACTION=RETRY_A17O_OFFICIAL_IMPORTER_CANONICAL_FAMILY_GROUPING_FIX`

## Decision 337 - A-17N-R activates canonical admin parent child runtime writes

Date: 2026-07-12

Status: Accepted for owner review before deploy

Context: A-17N created a dormant admin parent/child canonical write-path
application service but blocked production activation until an approved atomic
transaction executor existed. A-17N-TX1 created that executor candidate,
the owner manually applied migration 0024, and A-17N-TX2R recorded the owner
manual production SELECT-only verifier PASS with idempotency rows and executor
revision rows both still zero.

Decision: Activate the existing-person admin tree add-parent and add-child
runtime paths through the A-17M/A-17N application service and the approved
`public.execute_admin_canonical_family_parent_child_write` SECURITY INVOKER RPC.
Use the authenticated end-user Supabase server client, preserve active profile
and `relationships.create` plus `relationships.update` validation, compute a
deterministic idempotency key and mutation-plan hash, and remove the old
sequential family/membership write fallback from tree actions.

Rationale:

- Parent/child edits span family create/reuse, canonical metadata, memberships
  and audit; they need the approved atomic executor rather than sequential app
  writes.
- The executor is SECURITY INVOKER and should run under the authenticated owner
  context, not the service-role boundary.
- A deterministic idempotency key and mutation-plan hash preserve retry safety
  and conflict detection.
- Ambiguous legacy duplicates, multiple spouse/family contexts, cycles and
  invalid references must fail closed before RPC.
- The approved executor does not create people, so new-person parent/child
  linking remains blocked before person creation.

Safety:

- `A17N_R_STATUS=PASS_RUNTIME_INTEGRATION_READY_FOR_OWNER_REVIEW`
- `ADMIN_PARENT_ACTION_INTEGRATED=YES`
- `ADMIN_CHILD_ACTION_INTEGRATED=YES`
- `APPROVED_RPC_USED=YES`
- `END_USER_SERVER_CONTEXT_USED=YES`
- `SERVICE_ROLE_USED=NO`
- `CANONICAL_FAMILY_PRODUCTION_CALLER_COUNT=2`
- `SEQUENTIAL_MUTATION_FALLBACK_PRESENT=NO`
- `NEW_PERSON_AND_LINK_STATUS=BLOCKED_NEW_PERSON_TRANSACTION_CONTRACT_REQUIRED`
- `IMPORTER_RUNTIME_CHANGED=NO`
- `ADD_SPOUSE_RUNTIME_CHANGED=NO`
- `PUBLIC_TREE_RUNTIME_CHANGED=NO`
- `GRAPH_LAYOUT_RUNTIME_CHANGED=NO`
- `TRANSACTION_EXECUTOR_SQL_CHANGED=NO`
- `MIGRATION_CREATED=NO`
- `SQL_EXECUTED=NO`
- `PRODUCTION_MUTATION_SMOKE_EXECUTED=NO`
- `GENEALOGY_ROWS_MODIFIED_BY_PHASE=NO`
- `RECONCILIATION_EXECUTED=NO`
- `OFFICIAL_IMPORT_RPC_CALLED=NO`
- `DEPLOY=NO`
- `PUSH=NO`

Next:

- `NEXT_ACTION=OWNER_REVIEW_A17N_R_THEN_SEPARATE_A17N_DEPLOY_AND_PRODUCTION_NO_MUTATION_SMOKE`

## Decision 336 - A-17N-TX2R records owner manual production verifier PASS

Date: 2026-07-12

Status: Accepted

Context: A-17N-R previously stopped because repository evidence still recorded
the corrected A-17N-TX2 verifier as SAFE_SKIP due unavailable linked database
execution in Codex. After commit `bab0643`, the owner manually ran the
corrected SELECT-only verifier in the production Supabase SQL Editor, and the
verifier returned PASS for every check.

Decision: Record the owner manual production SELECT-only verifier PASS as the
authoritative A-17N-TX2 evidence. Update docs and checker expectations so
A-17N-R readiness is open for a separate runtime integration phase, while
preserving all no-mutation boundaries.

Rationale:

- The production verifier was SELECT-only and owner-executed outside Codex.
- Corrected active graph counts remain `74 / 140 / 73`.
- Physical totals `75 / 142 / 74` remain informational.
- The deleted family and orphan-active parent memberships remain data-quality
  advisories for later reconciliation work.
- `IDEMPOTENCY_ROW_COUNT=0` and `TRANSACTION_EXECUTOR_REVISION_COUNT=0`
  confirm the transaction executor has not been called.

Safety:

- `A17N_TX2R_STATUS=PASS_OWNER_MANUAL_PRODUCTION_VERIFIER_RECORDED`
- `A17N_TX2F_STATUS=PASS_ACTIVE_SCOPE_CORRECTION_VERIFIED`
- `A17N_TX2_STATUS=PASS_CORRECTED_ACTIVE_SCOPE_POST_APPLY_VERIFIED`
- `CORRECTED_POST_APPLY_VERIFIER_EXECUTED=OWNER_MANUAL_PRODUCTION_SELECT_ONLY`
- `CORRECTED_POST_APPLY_VERIFIER_RESULT=PASS`
- `TRANSACTION_EXECUTOR_CALLED=NO`
- `IDEMPOTENCY_ROW_COUNT=0`
- `TRANSACTION_EXECUTOR_REVISION_COUNT=0`
- `MIGRATION_CREATED=NO`
- `MIGRATION_0024_CHANGED=NO`
- `SQL_EXECUTED=NO`
- `RPC_CALLED=NO`
- `GENEALOGY_ROWS_MODIFIED=NO`
- `RUNTIME_CHANGED=NO`
- `DEPLOY=NO`
- `PUSH=NO`

Next:

- `A17N_R_READINESS=READY_POST_APPLY_VERIFIER_PASS_RECORDED`
- `NEXT_ACTION=START_SEPARATE_A17N_R_ADMIN_PARENT_CHILD_RUNTIME_INTEGRATION`

## Decision 335 - A-17N-TX2F corrects post-apply verifier active graph scope

Date: 2026-07-12

Status: Accepted

Context: After owner manual apply of migration 0024, the initial A-17N-TX2
post-apply verifier reported count drift because it compared total physical
rows to the active A-17A/A-17E graph baseline. Production has one deleted
legacy family and two row-level active parent memberships under that deleted
family. Active graph counts remain unchanged.

Decision: Correct the verifier to use active family + active membership +
active owning family for pass/fail baseline counts. Keep total physical rows,
deleted family count and orphan-active memberships as informational/advisory
metrics, not production drift.

Rationale:

- A-17A and A-17E use active graph scope for tree/reconciliation baselines.
- Physical row totals include soft-deleted legacy data and should not be used
  as active graph drift evidence.
- Orphan-active memberships under deleted families are data-quality advisories
  for later reconciliation work.
- The idempotency table has zero rows and no executor revision rows exist, so
  there is no evidence that the transaction executor was called.

Safety:

- `A17N_TX2_INITIAL_RESULT=FALSE_NEGATIVE_COUNT_SCOPE_BUG`
- `A17N_TX2F_STATUS=PASS_STATIC_CORRECTION_DB_EXECUTION_SAFE_SKIP`
- `PRODUCTION_DATA_DRIFT=NO`
- `MIGRATION_0024_DATA_MUTATION=NO`
- `TRANSACTION_EXECUTOR_CALLED=NO`
- `MIGRATION_CREATED=NO`
- `MIGRATION_0024_CHANGED=NO`
- `SQL_MUTATION_EXECUTED=NO`
- `RPC_CALLED=NO`
- `GENEALOGY_ROWS_MODIFIED=NO`
- `RECONCILIATION_EXECUTED=NO`
- `IMPORT_RPC_CALLED=NO`
- `DEPLOY=NO`
- `PUSH=NO`
- `CORRECTED_POST_APPLY_VERIFIER_EXECUTED=SAFE_SKIP`
- `A17N_R_READINESS=BLOCKED_CORRECTED_VERIFIER_NOT_RERUN_BY_CODEX`

Next:

- `NEXT_ACTION=RESTORE_LINKED_SUPABASE_ACCESS_AND_RUN_CORRECTED_VERIFIER_BEFORE_A17N_R`

## Decision 334 - A-17N-TX1 creates admin canonical family transaction executor candidate

Date: 2026-07-12

Status: Accepted for owner review

Context: A-17N proved that admin parent/child canonical write-path activation
needs an atomic transaction executor before production actions can stop using
sequential family and membership writes. The executor must not reuse the A-16
official-import RPC, must not broaden importer behavior, and must preserve the
separate owner review/apply boundary.

Decision: Create a not-applied SQL migration candidate for
`public.execute_admin_canonical_family_parent_child_write` and its idempotency
table. The function is `SECURITY INVOKER`, uses a fixed search path, requires
authenticated identity, matching actor profile, `relationships.create` and
`relationships.update`, stable idempotency and mutation-plan hash checks, row
locks, optimistic concurrency, canonical uniqueness, family status guards,
person reference guards, self-relationship and cycle blockers, and atomic audit
revision insertion.

Rationale:

- Parent/child admin writes span canonical family create/reuse, parent
  membership, child membership, canonical metadata and audit.
- Sequential client writes cannot guarantee rollback across those surfaces.
- A narrow invoker RPC keeps the operation under the authenticated user/RLS
  boundary instead of adding service-role or SECURITY DEFINER bypass.
- A separate manual apply and post-apply verification phase is required before
  any runtime action integration.

Safety:

- `A17N_TX1_STATUS=CANDIDATE_READY_NOT_APPLIED_OWNER_REVIEW_REQUIRED`
- `SECURITY_MODE=SECURITY_INVOKER`
- `SERVICE_ROLE_REQUIRED=NO`
- `PUBLIC_EXECUTE_GRANTED=NO`
- `ANON_EXECUTE_GRANTED=NO`
- `ADMIN_PARENT_ACTION_INTEGRATED=NO`
- `ADMIN_CHILD_ACTION_INTEGRATED=NO`
- `CANONICAL_FAMILY_PRODUCTION_CALLER_COUNT=0`
- `SQL_EXECUTED=NO`
- `MIGRATION_APPLIED=NO`
- `RECONCILIATION_EXECUTED=NO`
- `OFFICIAL_IMPORT_RPC_CALLED=NO`
- `DEPLOY=NO`
- `PUSH=NO`

Next:

- `OWNER_REVIEW_MARKER_REQUIRED=APPROVE_A17N_TX1_ADMIN_CANONICAL_FAMILY_TRANSACTION_EXECUTOR_CANDIDATE`
- `NEXT_ACTION=OWNER_REVIEW_A17N_TX1_THEN_RUN_SEPARATE_A17SQL_N_TX1_MANUAL_APPLY`

## Decision 333 - A-17N blocks admin canonical write activation until a transaction executor exists

Date: 2026-07-12

Status: Accepted for owner review

Context: A-17M added a dormant canonical family domain service foundation, and
A-17N attempted to integrate admin parent/child write paths. The current admin
tree actions create families and memberships through sequential Supabase calls:
family create, parent insert, child insert and independent revision writes. No
approved general transaction executor exists for admin parent/child edits. The
existing official-import transaction RPC is scoped to A-16 import and must not
be reused or broadened in A-17N.

Decision: Add a fail-closed admin canonical family application-service
foundation, but do not wire production admin parent/child actions until a
separate owner-approved transaction executor/RPC phase exists. Do not add
SECURITY DEFINER, SQL, migration, trigger, grant, service role bypass or
sequential replacement writes in A-17N.

Rationale:

- A-17N writes span optional person creation, family creation/update, parent
  membership, child membership, canonical metadata and audit.
- Without an atomic executor, replacing unconditional family creation would
  still risk partial data.
- Wiring actions to a fail-closed service would block live admin relationship
  edits without actually completing the safe write path.
- A new mutation RPC requires a separate SQL/migration/security review phase.

Safety:

- `A17N_STATUS=BLOCKED_TRANSACTION_EXECUTOR_REQUIRED_FOUNDATION_READY`
- `ADMIN_PARENT_ACTION_INTEGRATED=NO_BLOCKED`
- `ADMIN_CHILD_ACTION_INTEGRATED=NO_BLOCKED`
- `CANONICAL_FAMILY_PRODUCTION_CALLER_COUNT=0`
- `TRANSACTION_BOUNDARY_STATUS=BLOCKED_TRANSACTION_EXECUTOR_REQUIRED`
- `MIGRATION_CREATED=NO`
- `SQL_EXECUTED=NO`
- `LEGACY_RECONCILIATION_EXECUTED=NO`
- `OFFICIAL_IMPORT_RPC_CALLED=NO`
- `DEPLOY=NO`
- `PUSH=NO`

Next:

- `NEXT_ACTION=OWNER_REVIEW_A17N_THEN_START_SEPARATE_A17O_IMPORTER_CANONICAL_GROUPING_FIX`

## Decision 332 - A-17M creates dormant canonical family domain service foundation

Date: 2026-07-12

Status: Accepted for owner review

Context: A-17H schema foundation has been manually applied and A-17I
post-apply verification passed. Current production data still contains 22
owner-review duplicate parent-set groups, 38 redundant family records, 0 safe
automatic groups, 2 invalid person references, 1 inactive/soft-deleted
membership and 3 layout references touching duplicate families. Existing write
paths still create child-scoped families.

Decision: Add a dormant server-side canonical family domain service foundation
without changing current production write paths. The foundation provides
deterministic canonical identity, parent-set normalization, lookup/decision
contracts, repository interfaces, mutation planning and no-PII diagnostics.
Production integration remains deferred to separate A-17N, A-17O and A-17P
phases.

Rationale:

- Child IDs, display names and private genealogy data are excluded from
  canonical identity.
- Parent order is normalized deterministically.
- Legacy duplicates require owner review and are not automatically classified
  safe.
- Mutation plans require a future transaction executor and cannot execute
  multi-table writes in A-17M.
- The new service has zero production callers at the end of A-17M.

Safety:

- `CANONICAL_FAMILY_PRODUCTION_CALLER_COUNT=0`
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

Next:

- `NEXT_ACTION=OWNER_REVIEW_A17M_THEN_START_SEPARATE_A17N_ADMIN_PARENT_CHILD_WRITE_PATH_INTEGRATION`

## Decision 331 - A-17I records owner manual apply and post-apply verification

Date: 2026-07-12

Status: Accepted

Context: The owner manually applied A-17H migration 0023 and then executed the
A-17I SELECT-only post-apply verifier. Codex was asked to record evidence only,
without rerunning migration SQL, mutating genealogy data, creating
reconciliation records, changing runtime write paths, deploying or pushing.

Decision: Record
`A17SQL_H_STATUS=PASS_OWNER_MANUAL_SCHEMA_APPLY_COMPLETED` and
`A17I_STATUS=PASS_SCHEMA_POST_APPLY_VERIFIED` based on owner-provided evidence.
Accept the post-apply result that family count remained `74 -> 74`, expected
schema objects exist, RLS is enabled on 3 new tables, anon/PUBLIC grants and
policies are absent, authenticated policies count is 9, and no canonical keys,
owner decisions, reconciliation batches or rollback manifests were seeded.

Rationale:

- Migration SHA matches the A-17H candidate:
  `B5E62D048F284D9E4F03E2294FE060E696E7905890D88587A18503E0786A07AA`.
- Existing family rows were not modified by apply verification.
- The partial unique canonical index is present and legacy-safe.
- Reconciliation remains blocked because 22 duplicate parent-set groups require
  owner review, there are 0 safe automatic merge groups, 2 invalid person
  references, 1 inactive or soft-deleted membership, 3 layout references touching
  duplicate families, and repaired write paths still need a separate phase.

Safety:

- `SQL_MUTATION_EXECUTED=NO`
- `GENEALOGY_ROWS_MODIFIED=NO`
- `CANONICAL_KEYS_BACKFILLED=NO`
- `OWNER_DECISION_ROWS_CREATED=0`
- `RECONCILIATION_BATCH_ROWS_CREATED=0`
- `ROLLBACK_MANIFEST_ROWS_CREATED=0`
- `RECONCILIATION_EXECUTED=NO`
- `IMPORT_RPC_CALLED=NO`
- `DEPLOY=NO`
- `PUSH=NO`

Next:

- `NEXT_ACTION=START_SEPARATE_A17M_CANONICAL_FAMILY_DOMAIN_SERVICE_PHASE`

## Decision 330 - A-17H canonical family schema foundation candidate

Date: 2026-07-12

Status: Accepted for owner review

Context: A-17E/A-17F verified 74 current family rows, 22 owner-review duplicate
parent-set groups, 38 redundant-family estimate, expected future family count
36, and zero automatic-safe groups. A-17G defined rollback requirements, but no
schema foundation existed yet for owner decisions, all-or-nothing batches or
rollback manifests.

Decision: Create a not-applied, additive migration candidate for canonical
family schema foundation as migration 0023, mirrored byte-identically under
`db/migrations` and `supabase/migrations`. The schema extends `families` with
canonical metadata and adds owner decision, reconciliation batch and rollback
manifest structures. Do not execute reconciliation, do not backfill canonical
keys, do not mutate existing rows and do not create any reconciliation RPC.

Rationale:

- `canonical_key` is nullable, so current write paths stay compatible.
- The canonical unique index is partial for active `canonical` rows with a
  non-null key, so legacy duplicate rows do not block owner apply.
- Owner decisions are review records only; they do not execute merges.
- Batch and rollback manifest records provide future all-or-nothing and
  rollback traceability, but the migration seeds no rows.
- New tables enable RLS, have authenticated-only policies and explicitly add no
  anon/PUBLIC policies or grants.

Safety:

- `DB_MIGRATION_SHA256=B5E62D048F284D9E4F03E2294FE060E696E7905890D88587A18503E0786A07AA`
- `SUPABASE_MIRROR_SHA256=B5E62D048F284D9E4F03E2294FE060E696E7905890D88587A18503E0786A07AA`
- `MIRROR_MATCH=YES`
- `PRIOR_MIGRATIONS_UNCHANGED=YES`
- `SQL_EXECUTED=NO`
- `MIGRATION_APPLIED=NO`
- `GENEALOGY_ROWS_MODIFIED=NO`
- `CANONICAL_KEYS_BACKFILLED=NO`
- `FAMILY_RECONCILIATION_EXECUTED=NO`
- `RECONCILIATION_RPC_CREATED=NO`
- `AUTOMATIC_MERGE_TRIGGER_CREATED=NO`
- `IMPORT_RPC_CALLED=NO`
- `DEPLOY=NO`
- `PUSH=NO`

Next:

- `OWNER_REVIEW_MARKER_REQUIRED=APPROVE_A17H_CANONICAL_FAMILY_SCHEMA_CANDIDATE`
- `NEXT_ACTION=OWNER_REVIEW_A17H_THEN_RUN_SEPARATE_A17SQL_H_MANUAL_APPLY_PHASE`

## Decision 329 - A-17E to A-17G family reconciliation remains read-only and blocked

Date: 2026-07-12

Status: Accepted for owner review

Context: The owner approved the A-17A to A-17D canonical family/tree UX design
foundation. The next allowed bundle was read-only duplicate audit,
reconciliation dry-run and rollback design only.

Decision: Accept the A-17E to A-17G bundle as read-only evidence and design.
Do not allow production reconciliation yet. The future path must be owner
review, separate schema foundation, repaired/deployed write paths, backup
evidence, and only then a separate reconciliation candidate.

Rationale:

- A-17E found `DUPLICATE_PARENT_SET_GROUP_COUNT=22` and
  `REDUNDANT_FAMILY_COUNT=38`, but all duplicate groups are
  `OWNER_REVIEW_REQUIRED`; `SAFE_AUTOMATIC_GROUP_COUNT=0`.
- A-17E also found `INVALID_PERSON_REFERENCE_COUNT=2` and
  `LAYOUT_REFERENCES_AFFECTED_COUNT=3`.
- A-17F dry-run shows a deterministic future proposal of family rows `74 -> 36`,
  parent rows `140 -> 66`, child rows remaining `73`, and layout reference
  updates `2`, while all preservation invariants pass.
- A-17G defines rollback manifest, restore order, post-reconciliation edit
  conflict handling and mandatory backup evidence, but no rollback schema or RPC
  exists yet.

Safety:

- `SCHEMA_CREATED=NO`
- `MIGRATION_CREATED=NO`
- `MIGRATION_APPLIED=NO`
- `GENEALOGY_ROWS_MODIFIED=NO`
- `RECONCILIATION_RPC_CREATED=NO`
- `RECONCILIATION_EXECUTED=NO`
- `IMPORT_RPC_CALLED=NO`
- `DEPLOY=NO`
- `PUSH=NO`

Next:

- `OWNER_REVIEW_MARKER_REQUIRED=APPROVE_A17_FAMILY_RECONCILIATION_DRY_RUN`
- `NEXT_ACTION=OWNER_REVIEW_A17EG_THEN_CREATE_SEPARATE_A17H_SCHEMA_FOUNDATION_CANDIDATE`

## Decision 328 - A-17 canonical family tree foundation accepted for owner review

Date: 2026-07-12

Status: Owner approved

Context: A-16R official import completed and post-import verification passed,
but the current tree architecture review found likely child-scoped family rows,
duplicate parent-set groups, couple/family duplication risk, generic layout,
saved-layout overwrite risk and inconsistent Vietnamese search.

Decision: Record the A-17A to A-17D foundation as a read-only architecture
bundle. The next tree architecture should use canonical family units, compact
family junction graph nodes, focus-person/component-aware Vietnamese UX, and
privacy-safe diagnostics. No schema, migration, reconciliation or runtime
implementation is approved by this decision.

Rationale:

- A-17A SELECT-only baseline found `people_count=110`,
  `families_count=74`, `family_children_count=73`,
  `families_with_multiple_children=0`,
  `duplicate_parent_set_group_count=22` and
  `redundant_family_count_estimate=38`, which supports the concern that many
  current family rows are child-scoped.
- Source review confirmed importer per-child family behavior, admin add-parent
  and add-child new-family behavior, add-spouse/couple separation, generic ELK
  layout, saved-layout overwrite risk, global fit behavior and viewer search
  normalization gap.
- A-17B defines canonical family identity using more than sorted parent IDs,
  including union identity, period, status, provenance and legacy exceptions.
- A-17C defines Vietnamese view modes and older-user-oriented tree UX without
  copying proprietary Phả Tuệ code, assets, styling or schema.
- A-17D defines graph and layout contracts with no-PII diagnostics.

Safety:

- `SQL_EXECUTED=YES_READ_ONLY_SELECT_ONLY`
- `MUTATION_SQL_EXECUTED=NO`
- `MIGRATION_CREATED=NO`
- `MIGRATION_APPLIED=NO`
- `RECONCILIATION_EXECUTED=NO`
- `IMPORT_RPC_CALLED=NO`
- `OFFICIAL_IMPORT_RETRY=NO`
- `DEPLOY=NO`
- `PUSH=NO`

Owner acceptance:

- `A17_OWNER_APPROVAL_RECORDED=YES`
- `A17_OWNER_APPROVAL_MARKER=APPROVE_A17_CANONICAL_FAMILY_AND_TREE_UX_DESIGN`
- `A17AD_BUNDLE_STATUS=OWNER_APPROVED_READY_FOR_SEPARATE_A17E_A17G`
- `NEXT_ACTION=RUN_SEPARATE_A17E_A17G_READ_ONLY_AUDIT_DRY_RUN_BUNDLE`

## Decision 327 - A-16R import completion accepted after read-only post-import verification

Date: 2026-07-12

Status: Accepted

Context: The owner reported a successful A-16R official import run with
`Status=IMPORT_COMPLETED`, `Imported people count=102`, `Warnings count=0`,
`Transaction helper call count=1`, and all same-run gates passed. The follow-up
scope was documentation and post-import read-only verification only.

Decision: Accept
`A16R_STATUS=IMPORT_COMPLETED_POST_IMPORT_VERIFICATION` after the SELECT-only
post-import verifier confirms the session is `write_completed`, exactly one
completed audit batch exists, the transaction helper produced one batch, the
rollback manifest is `ready`, write-manifest and rollback counts match the
batch, and basic core tree visibility succeeds by count.

Rationale:

- The verifier confirms 102 imported people and 201 imported relationship rows
  through the audit batch, rollback manifest, write manifest, and active core
  tree counts.
- Audit revision evidence is present and count-matched at `169`.
- The owner same-run result warnings count is recorded as `0`; the stored
  session warning counter remains `46`, so the database safety gate separately
  verifies unresolved blocker warnings are `0`.
- No official import RPC retry, click, deploy, push, runtime code change, or
  mutation SQL belongs to this evidence-record phase.

Safety:

- `SQL_EXECUTED=YES_READ_ONLY_SELECT_ONLY`
- `MUTATION_SQL_EXECUTED=NO`
- `IMPORT_RPC_CALLED=NO`
- `OFFICIAL_IMPORT_RETRY=NO`
- `DEPLOY=NO`
- `PUSH=NO`

## Decision 326 - A-16BU post-apply verification accepts metadata-only evidence

Date: 2026-07-12

Status: Accepted

Context: The owner provided
`OWNER_CONFIRMED_A16BU_0022_MANUAL_SQL_APPLY_SUCCEEDED` after manually applying
migration 0022. The required follow-up was read-only verification only.

Decision: Treat A-16BU as post-apply verified when the SELECT-only metadata
query confirms the official-import RPC exists with unchanged signature,
SECURITY INVOKER, fixed search_path, corrected non-null `is_living` fallback,
absence of the old nullable branch, and no anon/PUBLIC EXECUTE grants.

Rationale:

- The verification reads only metadata and function definition text; it does
  not query genealogy rows.
- The verifier does not call
  `public.a16p_tx_execute_giapha4_official_import(...)`.
- No A16R retry, deploy, push, grant/RLS mutation, or production data mutation
  is part of this phase.

Safety:

- `SQL_EXECUTED=YES_READ_ONLY_METADATA_ONLY`
- `GENEALOGY_ROWS_QUERIED=NO`
- `GENEALOGY_ROWS_MODIFIED=NO`
- `IMPORT_RPC_CALLED=NO`
- `A16R_RETRY=NO`
- `DEPLOY=NO`
- `PUSH=NO`

## Decision 325 - A-16BU fixes official import is_living null derivation

Date: 2026-07-12

Status: Accepted

Context: Owner-provided production evidence showed the official import POST
reached the transaction helper once (`canRunOfficialImport=true`) and blocked
with `A16AH_BLOCKED_TRANSACTION_RPC_FAILED` because the database rejected NULL
for `people.is_living`. Imported people count remained `0`.

Decision: Create a not-applied corrective migration 0022 that replaces
`public.a16p_tx_execute_giapha4_official_import` with the same signature,
SECURITY INVOKER mode, fixed search_path, permission checks, ownership checks,
locking, audit, rollback, all-or-nothing transaction, idempotency, and execute
revokes, while changing only the `is_living` derivation.

New derivation contract:

```sql
case
  when lower(btrim(coalesce(candidate ->> 'isLiving', ''))) in ('true', 'false')
    then lower(btrim(candidate ->> 'isLiving'))::boolean
  else nullif(btrim(coalesce(candidate ->> 'deathDateText', '')), '') is null
end
```

Rationale:

- `candidate ? 'isLiving'` is true for JSON null, so the old A-16V expression
  could produce SQL NULL.
- The corrected expression preserves explicit true/false booleans and strings,
  then fail-safe falls back to `deathDateText` for null, missing, empty, or
  invalid values.
- The expression is deterministic and non-null for the import fixtures.
- A-16R retry remains blocked until owner reviews/applies/verifies this
  corrective migration in a separate phase.

Safety:

- `SQL_EXECUTED=NO`
- `MIGRATION_APPLIED=NO`
- `IMPORT_RPC_CALLED=NO`
- `A16R_RETRY=NO`
- `DEPLOY=NO`
- `PUSH=NO`

## Decision 324 - A-16BT deploy evidence accepted from owner marker

Date: 2026-07-11

Status: Accepted

Context: The owner provided
`OWNER_CONFIRMED_GITHUB_ACTIONS_DEPLOY_SUCCEEDED_FOR_COMMIT_919d3df`. Local HEAD
is `919d3df docs: reconcile a16bt accepted migration history gap`.

Decision: Record
`A16BT_DEPLOY_EVIDENCE_STATUS=PASS_OWNER_CONFIRMED_GITHUB_ACTIONS_DEPLOY_SUCCEEDED`
for commit `919d3df`, with confirmation source `OWNER_MARKER`.

Rationale:

- This is an owner-confirmed GitHub Actions deployment evidence record, not a
  Codex-run deploy.
- Codex did not push, deploy, run production smoke, execute SQL, call import
  RPC, retry A16R, or modify runtime application code in this phase.
- The accepted A-16BT migration-history gap status remains unchanged:
  `A16BT_STATUS=PASS_WITH_ACCEPTED_MANUAL_APPLY_MIGRATION_HISTORY_GAP`.
- The next action remains returning to the A16BF/A16R critical path.

## Decision 323 - A-16BT accepts verified DB effects with migration-history gap

Date: 2026-07-11

Status: Accepted

Context: The owner provided
`OWNER_ACCEPT_A16BT_MANUAL_APPLY_HISTORY_GAP_DB_EFFECTS_VERIFIED` and requested
a reconciliation record without SQL execution, migration apply/repair/rerun,
production row queries, deploy, push, import RPC, A16R retry, or runtime app
changes.

Decision: The canonical A-16BT outcome is
`A16BT_STATUS=PASS_WITH_ACCEPTED_MANUAL_APPLY_MIGRATION_HISTORY_GAP`.
The database security effects are accepted as verified, while Supabase CLI
migration history is not verified because the expected migration history table
is not present.

Required status contract:

- `DB_EFFECTS_VERIFIED=YES`
- `MIGRATION_HISTORY_VERIFIED=NO`
- `MIGRATION_RERUN_ALLOWED=NO`
- `FUTURE_CLI_RECONCILIATION_REQUIRED=YES`

Rationale:

- A previous A-16BT SELECT-only verification recorded all security booleans
  passing and no private anon column exposure.
- The owner explicitly accepts the manual-apply migration-history gap.
- Rerunning, repairing, reverting, or reapplying migration 0021 to force
  migration history is not allowed in this phase.
- Future CLI reconciliation remains required if the project later needs
  Supabase CLI migration history to match manual SQL state.

## Decision 322 - Owner accepts A-16BT manual SQL migration-history gap

Date: 2026-07-11

Status: Accepted

Context: The owner supplied
`OWNER_ACCEPT_A16BT_MANUAL_APPLY_HISTORY_GAP_DB_EFFECTS_VERIFIED` after the
A-16BT verification run confirmed all security effects but could not prove
Supabase migration-history exact-once recording because
`supabase_migrations.schema_migrations` was not available.

Decision: Treat A-16BT as
`A16BT_STATUS=PASS_OWNER_ACCEPTED_MANUAL_APPLY_HISTORY_GAP_DB_EFFECTS_VERIFIED`.
The accepted migration-state contract is
`A16BT_MIGRATION_STATE_VERIFIED=OWNER_ACCEPTED_MANUAL_SQL_HISTORY_GAP_DB_EFFECTS_VERIFIED`.

Rationale:

- The A-16BT SELECT-only verification was rerun after owner acceptance and
  returned `a16bt_secure_public_genealogy_read_boundary_verified=true`.
- Metadata-only verification found all four A-16BT anon public-read policies.
- The migration-history exact-once requirement remains technically
  unverifiable from this environment, but the owner explicitly accepted that
  manual SQL history gap based on verified database effects.
- This acceptance does not authorize import retry, deploy, production row
  queries, mutation SQL, migration repair, or `supabase db push`.

## Decision 321 - A-16BT cannot claim migration-history exact-once while security state is verified

Date: 2026-07-11

Status: Accepted

Context: The owner prompt supplied
`APPROVE_A16BT_0021_PRODUCTION_APPLY_VERIFY_LOCALHOST_SMOKE`. Codex attempted
the production mutation apply command for migration 0021, but the local tool
escalation reviewer rejected that mutation. Codex did not work around the
rejection. Subsequent SELECT-only verification showed the A-16BT grant/RLS
security effects already present and passing.

Decision: Record A-16BT as
`A16BT_STATUS=BLOCKED_MIGRATION_HISTORY_NOT_VERIFIABLE_DB_EFFECTS_VERIFIED`
instead of marking the phase PASS.

Rationale:

- `a16bt_secure_public_genealogy_read_boundary_verified=true`.
- The four A-16BT public anon SELECT policies exist.
- `to_regclass('supabase_migrations.schema_migrations')` returned false, so
  migration 0021 cannot be verified as recorded exactly once in Supabase
  migration history from this environment.
- The next owner action is migration-history reconciliation or explicit owner
  acceptance that manual SQL apply without migration-history recording is the
  project state for A-16BT.

## Decision 320 - A-16BT secures public genealogy reads with column grants

Date: 2026-07-11

Status: Accepted

Context: A-16BS manually applied migration 0020 at SHA
`530129F27EAD748641C71D2C26718043D0B51639FC6104EFFC4B9D222550C0FC`. Owner
verification passed the import/RPC security checks but remained blocked on the
four public SELECT policy checks. A-16BR-FIX had proven that public routes need
the Supabase anon role for direct table SELECT, but broad anon table SELECT
would expose columns that RLS cannot hide, including private/internal fields.

Decision: Add not-applied migration 0021 for
`A16BT_PUBLIC_ACCESS_MODEL=COLUMN_LEVEL_GRANTS_PLUS_ANON_RLS`. Revoke broad
anon/PUBLIC table SELECT on `people`, `families`, `family_parents`, and
`family_children`; grant anon SELECT only on explicit public-safe columns; add
anon-only SELECT policies that require active public people/families and prevent
relationship rows from inferring private or family-only rows. Update public
queries to use explicit allowlists and stop selecting private, date, place,
notes, and audit columns.

Consequences: Public birth/death years are no longer derived from full date
columns in the direct-table anon path. They remain null until a later phase adds
dedicated year-only public columns or a safe view/RPC. Existing authenticated
policies, service_role grants, migration 0020, and the A-16BR revisions INSERT
policy remain unchanged.

Safety: A-16BT does not run SQL, does not apply migration 0021, does not query
production genealogy rows, does not call POST `/official-import`, does not call
the import RPC, does not deploy, and does not push.

## Decision 319 - A-16BR-FIX preserves verified public anon SELECT

Date: 2026-07-11

Status: Accepted

Context: Migration 0020 was still not applied. A critical review found that the
original A-16BR `REVOKE ALL` on `people`, `families`, `family_parents`, and
`family_children` would also remove anon SELECT. Source inspection showed the
public home, public tree, public person detail, and admin public preview route
through `lib/family/public-family-service.ts`, which uses the server Supabase
anon client and directly selects the four core genealogy tables.

Decision: Classify the public-read audit as
`A16BR_PUBLIC_READ_CLASSIFICATION=BLOCKED_PRESERVE_PUBLIC_ANON_SELECT`. Supersede
the old migration 0020 SHA
`0A7F69196C97071C7304E4D0CE28DA1C134E95AF3DEFA00C8958FC7971591CF0` and correct
the unapplied migration to preserve effective anon SELECT on
`people`, `families`, `family_parents`, and `family_children` while revoking
anon/PUBLIC mutation privileges from those tables. Continue revoking all
anon/PUBLIC privileges from `revisions`, `import_session_warnings`,
`import_duplicate_candidates`, and `import_relationship_candidates`. Preserve
the A-16BR revisions INSERT policy because no concrete defect was found.

Consequences: The corrected migration 0020 SHA is
`530129F27EAD748641C71D2C26718043D0B51639FC6104EFFC4B9D222550C0FC`. The
SELECT-only verification SQL now checks separate anon/PUBLIC mutation grant
counts, sensitive staging/revisions anon grant cleanup, effective anon SELECT on
the public core tables, public SELECT policies only where needed, and the
revisions INSERT policy. Owner apply remains a separate later A-16BS decision.

Safety: A-16BR-FIX does not run SQL, does not query production genealogy rows,
does not apply migration 0020, does not call POST `/official-import`, does not
call the import RPC, does not mutate session/genealogy/auth data, does not
deploy, and does not push.

## Decision 318 - A-16BR adds narrow official-import revision INSERT RLS

Date: 2026-07-11

Status: Accepted

Context: A-16BQ owner SELECT-only metadata showed the remaining downstream RPC
write blocker is `revisions_supports_rpc_insert=false`, while the
official_import_batches UPDATE policy is actually runtime-compatible. The batch
policy requires `imports.create`, owned import-session scope, and
`updated_by=current_profile_id()` in WITH CHECK; requiring the literal
`completed` string was a checker false negative.

Decision: Add not-applied migration 0020 with one narrow authenticated
`revisions` INSERT policy for the A-16V official-import people/families create
revision rows only, and revoke all remaining anon/PUBLIC table privileges from
the eight confirmed downstream tables. Preserve existing revisions SELECT
policies, do not add UPDATE/DELETE revision policies, do not change
authenticated or service_role grants, do not disable or FORCE RLS, and correct
the A-16BQ verification logic to avoid the literal `completed` requirement.

Consequences: A-16R retry remains `NO`. Owner review and a separate SQL
apply/verify phase are required before any import retry can be considered.
Migrations 0018 and 0019 remain immutable by SHA256.

Safety: A-16BR does not run SQL, does not call POST `/official-import`, does not
call the import RPC, does not mutate session/genealogy/auth data, does not
deploy, and does not push.

## Decision 317 - A-16BQ requires downstream metadata verification before another retry

Date: 2026-07-11

Status: Accepted

Context: A-16BP records that the owner-applied A-16BO revoke-grants candidate
now verifies successfully. The next risk is no longer the staging table row-lock
contract; it is the remaining downstream write contract for every table touched
by the SECURITY INVOKER official-import RPC.

Decision: Add an owner SELECT-only metadata runbook that covers every RPC
SELECT, SELECT FOR UPDATE, INSERT, UPDATE, and readback target. The runbook
checks authenticated privileges, RLS/force-RLS state, applicable policies,
permission predicates, no anon/PUBLIC grants or policies, SECURITY INVOKER, and
absence of automatic import triggers. It reads only metadata and is not executed
by Codex.

Consequences: A-16R retry remains `NO` until the owner separately runs the
A-16BQ metadata verification and every boolean passes. Any false boolean becomes
a blocker to record before implementation or retry planning.

Safety: A-16BQ does not run SQL, does not call POST `/official-import`, does not
call the import RPC, does not mutate session/genealogy/auth data, does not
deploy, and does not push.

## Decision 316 - A-16BP records owner-applied A-16BO verification pass

Date: 2026-07-11

Status: Accepted

Context: The owner manually applied A-16BO migration 0019 through Supabase SQL
Editor and provided SELECT-only verification showing forbidden anon/PUBLIC
grants and policies are zero, authenticated SELECT/UPDATE on the two import
staging tables remain present, A-16BM policy semantics pass, the RPC remains
SECURITY INVOKER, and no automatic import trigger exists.

Decision: Record A-16BP as
`PASS_OWNER_MANUAL_APPLY_AND_VERIFIED`, mark migrations 0018 and 0019 immutable
by SHA256, and do not edit either applied migration. The next phase is A-16BQ
downstream metadata verification, not an import retry.

Consequences: A-16R retry remains `NO`. The applied migration files are now
history artifacts and must not be amended or regenerated.

Safety: A-16BP records owner evidence only. Codex does not run SQL, does not
call POST `/official-import`, does not call the import RPC, does not mutate
session/genealogy/auth data, does not deploy, and does not push.

## Decision 315 - A-16BO revokes anonymous import staging grants without changing policies

Date: 2026-07-11

Status: Accepted

Context: The owner manually applied A-16BM migration 0018, and SELECT-only
verification showed the A-16BM policies are semantically correct but anonymous
table grants remain on `import_sessions` and `import_write_manifests`.
PostgreSQL deparsing also made the old exact-text policy checks too brittle:
`public.` prefixes may disappear, `IN (...)` may become `= ANY (...)`, and casts
or whitespace may be added.

Decision: Preserve migration 0018 byte-for-byte, add a separate not-applied
0019 migration candidate that only revokes all privileges from `anon` and
`PUBLIC` on the two import staging tables, and add SELECT-only verification
that normalizes policy expressions before checking the A-16BM policy semantics.
Do not alter, drop or recreate policies; do not change RLS; preserve
authenticated SELECT/UPDATE grants.

Consequences: A-16R retry remains `NO`. Owner review and a separate apply/verify
phase are required before any further read-only reconciliation. The next
verification gate can distinguish true anon/PUBLIC grants from policy deparser
formatting differences.

Safety: A-16BO does not run SQL, does not call POST `/official-import`, does not
call the import RPC, does not mutate session/genealogy/auth data, does not
deploy, and does not push.

## Decision 314 - A-16BM verification must use case-hardened public grant counts

Date: 2026-07-11

Status: Accepted

Context: The A-16BM candidate is still not applied, but its SELECT-only
verification and persisted policy comments needed tightening before owner
review. Case-sensitive `grantee in ('anon', 'public')` can miss catalog values
reported as `PUBLIC`, and `NOT_APPLIED` inside `COMMENT ON POLICY` would become
misleading production metadata after a later approved apply.

Decision: Keep the migration candidate and Supabase mirror byte-for-byte,
change verification SQL to compare `lower(grantee)` against `anon` and
`public`, expose sanitized
`forbidden_anon_public_table_grant_count` and
`forbidden_anon_public_policy_count`, and require both counts to be zero for
`a16bm_row_lock_rls_fix_verified`. Remove `NOT_APPLIED` only from persisted
policy comments while preserving source-file candidate headers.

Consequences: A-16R retry remains `NO`. The A-16BM owner apply/verify path now
has explicit count evidence for forbidden anon/PUBLIC grants and policies, and
future production policy comments no longer carry a stale not-applied label.
The RPC order remains compatible because `import_write_manifests` is updated to
`write_completed` before `import_sessions` is updated afterward.

Safety: A-16BM-FIX does not run SQL, does not call POST `/official-import`,
does not call the import RPC, does not mutate session/genealogy/auth data, does
not deploy, and does not push.

## Decision 313 - A-16BM adds a not-applied row-lock RLS schema fix candidate

Date: 2026-07-11

Status: Accepted

Context: Owner SELECT-only metadata confirmed the A-16BL diagnosis:
`import_sessions` has an UPDATE policy, but it does not allow
`owner_approved_for_db_write`; `import_write_manifests` has no UPDATE policy.
The SECURITY INVOKER official import RPC uses `SELECT ... FOR UPDATE` on both
tables before the real import writes.

Decision: Add an additive not-applied candidate migration, mirrored
byte-for-byte under `db/migrations` and `supabase/migrations`, plus SELECT-only
verification SQL. The candidate grants only SELECT/UPDATE on `import_sessions`
and `import_write_manifests` to `authenticated`, adds narrow
owner/profile-scoped official-import UPDATE policies for the exact RPC
row-lock/write-completion path, and preserves the existing preview policies.

Consequences: A-16R retry remains `NO`. The next phase is owner review and a
separate SQL apply/verify gate. Real genealogy-table INSERT grant/RLS risk is
not changed by A-16BM and must be reconciled before another retry.

Safety: A-16BM does not call POST `/official-import`, does not call the import
RPC, does not run SQL or DB mutation, does not change session state, does not
deploy, and does not print or commit raw/private data.

## Decision 312 - A-16BL treats SELECT FOR UPDATE as an UPDATE RLS visibility contract

Date: 2026-07-11

Status: Accepted

Context: After A-16BK, production still returned HTTP 409 with
`SESSION_NOT_FOUND_OR_NOT_OWNED` even though the session was already
`owner_approved_for_db_write`, ownership matched the current owner profile,
identity diagnostics passed, and production RPC metadata matched the repository
contract. The RPC is `SECURITY INVOKER` and locks the session with
`SELECT ... FOR UPDATE`.

Decision: Diagnose the remaining blocker as a lock-visibility contract, not a
normal SELECT ownership mismatch. PostgreSQL row locking requires UPDATE
privilege and UPDATE RLS visibility for the locked row. The source SELECT policy
can expose the owner-approved row, while the existing `import_sessions` UPDATE
policy is preview-state-only and excludes `owner_approved_for_db_write`.

Consequences: The minimum fix must preserve `FOR UPDATE`, stay
`SECURITY INVOKER`, avoid service-role execution, and add a narrow owner/admin
official-import UPDATE/lock policy only after owner SELECT-only metadata
confirms production grants/RLS. `import_write_manifests` has the next likely
lock/update risk and is included in the not-applied draft.

Safety: A-16BL does not call POST `/official-import`, does not call the import
RPC, does not run SQL or DB mutation, does not change session state, does not
deploy, and does not print or commit raw/private data.

## Decision 311 - A-16BJ requires a final read-only reconciliation before another import retry

Date: 2026-07-10

Status: Accepted

Context: Production A-16BH identity diagnostics and owner-provided RPC metadata
now pass, while earlier official-import attempts returned HTTP 409 and imported
zero people. Before any separate retry, the project needs one final sanitized
read-only check that current DB/session/audit state still matches the reviewed
evidence gates and that no partial write markers exist.

Decision: Add an A-16BJ read-only verifier and checker that confirm the audited
session is still `owner_approved_for_db_write`, the session owner matches the
current RPC-visible owner profile, no official import batch or rollback
manifest exists, no A-16V import revision markers or write-completed manifest
exist, candidate counts remain 102/134, and blocker counts remain zero. This
phase may classify retry readiness, but it does not run the retry.

Consequences: The previous HTTP 409 is reconciled as likely pre-`fff4019` stale
deployment or pre-diagnostic execution path rather than a remaining read-only
blocker, provided the verifier keeps passing. A-16R retry remains `NO` until a
separate owner-approved single POST phase.

Safety: A-16BJ does not call POST `/official-import`, does not call the import
RPC, does not run SQL or DB mutation, does not change session state, does not
deploy, and does not print or commit raw/private data.

## Decision 310 - A-16BI treats same-client false as GET diagnostic observability boundary

Date: 2026-07-10

Status: Accepted

Context: Production A-16BH authenticated GET returned all identity-match
booleans true but `precheckAndImportRpcUseSameClientInstance=false`. The GET
route is intentionally read-only and cannot observe or share a future POST
handler's in-memory Supabase client instance.

Decision: Treat the GET `false` as expected diagnostic semantics, not proof of a
POST path bug. The POST source path remains the authoritative same-client
guarantee: it creates one cookie-bound end-user server client, uses it for
`current_profile_id()` and audited session owner reads, and passes the same
client into the transaction executor. If identity binding fails, executor call
count stays `0`.

Consequences: Since production identity booleans pass, the remaining blocker is
production RPC contract verification. Owner must provide read-only SQL metadata
booleans for `public.a16p_tx_execute_giapha4_official_import` before any later
import retry can be considered.

Safety: No POST `/official-import`, no import RPC, no SQL/DB mutation, no
session-state change, no deploy, and no raw/private data exposure in A-16BI.

## Decision 309 - A-16BH exposes read-only identity precheck before any further import retry

Date: 2026-07-10

Status: Accepted

Context: After A-16BF source was available, owner reported another production
official-import POST returning 409 with `SESSION_NOT_FOUND_OR_NOT_OWNED`, and
the runtime branch reached the transaction helper once. That evidence does not
prove whether production included A-16BF or whether A-16BF passed and the
production RPC definition/auth context then failed.

Decision: Do not retry official import. Add an authenticated GET-only
`official-import-identity-precheck` diagnostic that returns only sanitized
booleans and context classifications. Also align the POST source path so the
A-16BF precheck and transaction helper use the same same-run server Supabase
client instance before any import transaction RPC can be called.

Consequences: Future production diagnosis can distinguish stale deployment from
precheck pass plus RPC contract drift without printing private identifiers or
running import. Production RPC definition still requires owner read-only SQL
boolean evidence; Codex does not assume it matches the repository migration.

Safety: A-16BH does not call POST `/official-import`, does not call the import
transaction RPC, does not run SQL or DB mutation, does not deploy, and does not
print or commit raw/private data.

## Decision 308 - A-16BF proves RPC-visible identity before official import transaction RPC

Date: 2026-07-10

Status: Accepted

Context: A-16BE proved the audited session owner metadata matches the current
owner profile, but the production transaction helper still returned
`SESSION_NOT_FOUND_OR_NOT_OWNED`. The application permission context and the
database RPC `SECURITY INVOKER` context are separate identity contracts.

Decision: Add a same-run, server-only A-16BF precheck before the official import
transaction executor. The precheck uses the same authenticated server Supabase
client as the transaction RPC, reads `public.current_profile_id()` through the
RPC-visible context, reads only the audited session `created_by`, and compares
sanitized equality booleans against the permission-context profile. It does not
pass a caller-controlled actor profile id into the import RPC and does not switch
official import execution to unrestricted service-role mode.

Consequences: The official import transaction RPC remains unreachable unless the
permission-context profile, RPC-visible profile and audited session owner all
match in the same run. Unknown, missing or mismatched identity fails closed with
`A16BF_BLOCKED_RPC_INVOCATION_IDENTITY_PRECHECK_FAILED`. A-16R import retry
remains `NO` until a later deployed owner/admin smoke proves the precheck and a
separate phase authorizes any final POST.

Safety: A-16BF does not call POST `/official-import`, does not execute the
import RPC, does not run SQL or DB mutation, does not change session state, does
not deploy, and does not print or commit raw/private data.

## Decision 307 - A-16BE keeps RPC ownership fail-closed

Date: 2026-07-10

Status: Accepted

Context: Production owner/admin UI gates passed and one owner-approved POST
reached `public.a16p_tx_execute_giapha4_official_import`, but the helper
returned `SESSION_NOT_FOUND_OR_NOT_OWNED` before official import completion.
A-16BE read sanitized metadata only and found the audited session's
`created_by`, `updated_by`, and `approved_by` all classify as the current owner
profile id.

Decision: Do not weaken the RPC ownership predicate. Treat the failure as an
RPC invoker auth-context or production RPC contract drift blocker: the
application-level owner/admin `PermissionContext` proof and the PostgreSQL
`SECURITY INVOKER` `public.current_profile_id()` proof are separate contracts
and must be proven identical in the same run before any retry.

Consequences: A-16R import retry remains `NO`. The next phase should add a
fail-closed RPC invocation identity precheck or align the RPC contract so the
actor profile id must equal both `public.current_profile_id()` and
`import_sessions.created_by`.

Safety: A-16BE does not call POST `/official-import`, does not run import RPC,
does not run SQL or DB mutation, does not change session state, does not deploy,
and does not print or commit raw/private data.

## Decision 306 - A-16BC separates owner-approval state transition from A-16R official import execution

Date: 2026-07-10

Status: Accepted

Context: A-16BB proved the audited session is still `preview_generated`, while
the A-16R runtime/UI gate requires `owner_approved_for_db_write`. Existing UI
and API paths expose duplicate decisions, review-pack reads and final
`/official-import`, but no approved owner-facing path was found for the
canonical state transition.

Decision: Add a separate fail-closed A-16BC owner-approval state route and UI
block for `preview_generated -> ready_for_owner_approval ->
owner_approved_for_db_write`. Keep it distinct from `/official-import`, use
separate A-16BC markers, and require owner/admin context plus review-pack,
duplicate, validation, audit and rollback confirmations before any state
transition.

Consequences: Production can later expose a clear owner action for state
approval without making `preview_generated` import-eligible and without
submitting A-16R official import. A-16R import retry remains `NO` until a later
phase verifies state transition and separately approves final import execution.

Safety: This phase does not call POST `/official-import`, does not call RPC,
does not run SQL, does not deploy, and does not mutate real genealogy data.

## Decision 305 - A-16BB requires owner_approved_for_db_write for the runtime/UI POST gate

Date: 2026-07-10

Status: Accepted

Context: A-16BB read sanitized metadata for the audited session and found
`A16BB_STORED_SESSION_STATE=preview_generated`, with only a draft write
manifest and no owner-approved write manifest. The A-16V RPC accepts
`ready_for_owner_approval` or `owner_approved_for_db_write`, but also requires
an owner-approved write manifest.

Decision: Use `owner_approved_for_db_write` as the runtime/UI/API
execution-eligible session state. Treat `ready_for_owner_approval` as review
ready but not POST execution eligible. Remove the stale runtime `staged` check
and keep all non-eligible states fail-closed.

Consequences: The A-16R UI/runtime remains locked for the current audited
session because it is still `preview_generated`. A separate A-16BC phase is
required to design any owner-approved session-state transition before a future
execution phase.

Safety: No POST `/official-import`, no import RPC, no manual SQL, no session
state update, no deploy, and no raw/private evidence.

## Decision 304 - A-16BA plans the session-state runtime contract fix without import execution

Date: 2026-07-10

Status: Accepted

Context: A-16AZ recorded an owner-reported HTTP 409 before RPC/import. Runtime
source still expects session status `staged`, while the schema lifecycle and
A-16V RPC use `ready_for_owner_approval` and `owner_approved_for_db_write`.

Decision: Treat A-16BA as a read-only planning/checker phase. Do not implement
the runtime state change or execute import in this phase. The next safe phase
must first add a sanitized read-only session-state diagnostic, then align
runtime, UI, and API gates with the canonical schema/RPC lifecycle.

Consequences: `A16R_IMPORT_RETRY_NEXT=NO` remains true. If the stored session is
not already in a canonical pre-import state, a separate explicit owner approval
transition phase is required before any future execution attempt.

Safety: No POST `/official-import`, no direct/manual RPC, no SQL/DB mutation,
no deploy, no auth/permission/genealogy mutation, and no raw/private evidence.

## Decision 303 - A-16AZ treats POST 409 as a source/runtime lifecycle contract mismatch

Date: 2026-07-10

Status: Accepted

Context:

- The owner submitted the A-16R final confirmation once for audited session
  `2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
- Production returned HTTP 409 before RPC execution with
  `canRunOfficialImport=false`, imported people count `0`, and message
  `Import session is not in staged state for official import consideration.`
- Runtime source still rejects any session whose status is not `staged`.
- The import session schema does not include `staged`; A-16V transaction helper
  accepts `ready_for_owner_approval` and `owner_approved_for_db_write`.

Decision:

- Classify A-16AZ as a diagnosis-only phase and record the blocker as
  `A16AZ_BLOCKER=OFFICIAL_IMPORT_POST_409_SESSION_STATE_GATE_REJECTED_BEFORE_RPC_NO_IMPORT_EXECUTED`.
- Treat the active issue as a UI/API/runtime lifecycle contract mismatch until a
  read-only session-state diagnostic proves the exact stored session status.
- Do not retry import in A-16AZ. A later phase must first reconcile the runtime
  source state gate with the schema/RPC contract and re-smoke read-only.

Safety:

- A-16AZ does not call POST `/official-import`, execute A-16R import, call
  direct/manual RPC, run SQL, deploy, or mutate DB/auth/permission/genealogy
  data.
- `A16R_IMPORT_RETRY_NEXT=NO`.

## Decision 302 - A-16AX preserves Cloudflare dashboard runtime vars during manual deploy

Date: 2026-07-09

Status: Accepted

Context:

- A-16AW diagnosed the active production blocker as GitHub Actions repository
  variables not being sufficient Cloudflare Worker runtime variables.
- OpenNext Cloudflare production guidance recommends setting runtime variables
  on the deployed Worker and using `opennextjs-cloudflare deploy -- --keep-vars`
  when preserving dashboard-managed runtime variables.
- Cloudflare Wrangler deploy behavior can overwrite dashboard environment
  variables unless keep-vars is enabled.

Decision:

- Update the standard package `deploy` script to
  `opennextjs-cloudflare build && opennextjs-cloudflare deploy -- --keep-vars`.
- Keep the manual Cloudflare Deploy workflow on `npm run deploy` so the single
  standard deploy path carries the preservation flag.
- Add the A-16AX checker to the workflow before deployment.
- Do not add A-16 runtime vars to `wrangler.toml`; owner-managed Worker runtime
  vars remain the required manual step.

Safety:

- A-16AX does not deploy.
- A-16AX does not call POST `/official-import`, execute import, call direct/manual
  RPC, run SQL, mutate Cloudflare env vars, or mutate genealogy/auth/permission
  data.
- `A16R_IMPORT_RETRY_NEXT=NO`.

## Decision 301 - A-16AR opens UI confirmation only behind same-run gates

Date: 2026-07-09

Status: Accepted

Context:

- A-16AQ diagnosed the active lock as
  `SOURCE_UI_PREFLIGHT_REVIEW_PACK_STILL_FAIL_CLOSED_NO_POST_PLUMBING`.
- Owner/admin permission, audited session, duplicate decisions and owner-review
  readiness were no longer the active blockers.
- The official import route already required the approved confirmation body and
  server-side gates, but the UI did not have a same-run confirmation path.

Decision:

- Replace the source hard-disabled A-16R button with a fail-closed confirmation
  component inside the existing official import block.
- Enable submission only when the UI proves owner/admin context, audited
  session, markers, zero blockers, duplicate/review readiness, runtime envs and
  same-run preflight.
- Keep a final checkbox confirmation containing the audited session id before
  any POST.
- Keep the server route authoritative and return a locked response if the
  execution branch env is disabled.

Safety:

- A-16AR does not call POST `/official-import`.
- A-16AR does not execute A-16R import, direct/manual RPC, SQL, deploy, auth,
  role, permission, membership or genealogy mutation.
- `A16R_IMPORT_RETRY_NEXT=NO`.

## Decision 300 - A-16AN diagnoses owner/admin import permission context as role assignment or account-context blocker

Date: 2026-07-09

Status: Accepted

Decision:

Record A-16AN as a read-only diagnosis, not a permission repair phase.

Rationale:

- A-16AM already proved the same-run authenticated context had `NO_ROLE`,
  visible permission count `0`, and missing `imports.create`.
- Source shows owner/admin import permission comes from Supabase Auth user to
  `profiles`, `profile_roles`, `roles`, `role_permissions`, and `permissions`.
- `OWNER` and `ADMIN` receive the strict import permission set through seeded
  role-permission mapping, but the current production context did not prove
  either role.
- The expected owner account source remains the local OWNER bootstrap snippet,
  but private account values are intentionally not copied into evidence.
- No role/user/permission repair belongs in this phase; any repair must be
  separately approved.

Outcome:

- `A16AN_STATUS=DIAGNOSED_READ_ONLY_OWNER_ADMIN_PERMISSION_CONTEXT_BLOCKED`
- `A16AN_BLOCKER=AUTHENTICATED_PROFILE_ROLE_ASSIGNMENT_MISSING_OR_WRONG_ACCOUNT_CONTEXT`
- `A16R_IMPORT_RETRY_NEXT=NO`

## Decision 299 - A-16AM blocks before POST when authenticated context lacks strict import permissions

Date: 2026-07-09

Status: Accepted

Context:

- A-16AM was explicitly allowed to submit exactly one official import
  confirmation POST only if all gates pass in the same authenticated owner/admin
  run.
- The production UI opened at `/admin/exports/import` with an authenticated
  browser session, but the visible context was a redacted non-owner context,
  role `NO_ROLE`, permission count `0`, and missing `imports.create`.

Decision:

- Treat this as a failed same-run auth/permission gate.
- Do not submit POST `/official-import` from a non-owner/admin context.
- Keep A-16R retry blocked until a real owner/admin import context with the
  strict permission set is available and the same-run gates are rechecked.

Safety:

- No POST `/official-import`.
- No direct/manual RPC.
- No SQL, migration repair, seed, db push, deploy or Wrangler deploy.
- No auth/user/role/permission/membership or genealogy mutation by this phase.
- `A16R_IMPORT_RETRY_NEXT=NO`.

## Decision 298 - A-16AL marker approval is evidence, not runtime state without same-run confirmation

Date: 2026-07-09

Status: Accepted

Context:

- Production now shows the correct audited A-16R session
  `2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
- Owner confirms both marker strings:
  `APPROVE_A16R_RUNTIME_EXECUTION_AFTER_A16V_VERIFY` and
  `APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
- A-16AL is still a non-execution phase and must not call POST
  `/official-import`.

Decision:

- Treat owner marker text in this phase as valid planning/evidence, but not as
  runtime state.
- Runtime execution readiness can only be proven by a later explicit phase that
  is allowed to send the confirmation payload in the same POST run.
- The read-only UI/GET gate may display the markers and audited session but must
  keep official import locked.

Safety:

- No POST `/official-import`.
- No direct/manual RPC.
- No SQL, migration repair, seed, db push or deploy.
- No auth/user/role/permission/membership or genealogy mutation by this phase.
- `A16R_IMPORT_RETRY_NEXT=NO`.

## Decision 297 - A-16AK binds owner import readiness UI to the audited A-16R session

Date: 2026-07-09

Status: Accepted

Context:

- Production showed current viewed session
  `cc7c7e6a-58fe-4824-be57-86d00b008306` while the audited official import
  session remains `2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
- The official import button was correctly locked, but the UI also reported 8
  duplicate candidates lacking owner decisions and review-pack not ready on the
  currently viewed session.
- Official import readiness must be evaluated on the audited A-16R session, not
  on the latest/current import session.

Decision:

- `/admin/exports/import` loads
  `getImportManifest(A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID)` for the owner
  import review surface.
- The page must not select `sessions[0]` for official import readiness.
- Duplicate decision readiness, review-pack readiness and official import gate
  display stay tied to the audited session.
- The official import button remains disabled until all duplicate decision,
  review-pack, runtime, owner approval and execution gates pass in a later
  explicit phase.

Safety:

- No `POST /official-import`.
- No direct/manual RPC.
- No SQL, migration repair, seed, db push or deploy.
- No auth/user/role/permission/membership or genealogy mutation by this phase.
- `A16R_IMPORT_RETRY_NEXT=NO`.

## Decision 296 - A-16AH adds real runtime execution branch candidate while keeping default execution disabled

Date: 2026-07-09

Status: Accepted

Context:

- A-16AG proved the same-run gates could reach a candidate-ready state, but the
  runtime still had no real branch that calls the approved transaction helper.
- The owner execution approval marker exists, but A-16AH is not an execution
  phase and must not call POST `/official-import`.

Decision:

- Add a minimal official import runtime execution branch candidate behind a new
  env gate:
  `A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED`.
- Keep the existing route candidate gate:
  `A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED`.
- Require all same-run permission, session, validation, dry-run, duplicate,
  relationship, A-16T/A-16U/A-16V, runtime marker, rollback and audit gates
  before the executor can be called.
- Call the approved transaction helper through exactly one injected executor
  call only after those gates pass.
- Keep the default branch disabled and not executed in A-16AH.

Consequences:

- A-16AH resolves the source-only "no execution branch" blocker as a branch
  candidate, but it does not execute official import.
- A future deploy/smoke or execution phase must explicitly authorize any POST
  `/official-import` attempt and re-check all gates in the same run.
- A-16R import retry remains:
  `A16R_IMPORT_RETRY_NEXT=NO`.

## Decision 295 - A-16AG blocks official import retry because deployed runtime is still candidate-only

Date: 2026-07-09

Status: Accepted

Context:

- The final owner execution approval marker is present.
- A-16O, A-16X2, A-16AA, A-16AB, A-16AE and A-16AF evidence gates are present.
- A-16AG required the route/runtime allow gate to pass in the same run before
  any official import POST.

Decision:

- Block A-16AG before POST with:
  `A16AG_EXECUTION_STATUS=BLOCKED_ROUTE_RUNTIME_NOT_EXECUTION_CAPABLE`.
- Record blocker:
  `A16AG_BLOCKER=ROUTE_RUNTIME_ONLY_EXPOSES_CANDIDATE_READY_NOT_EXECUTED_NO_RPC_EXECUTION_BRANCH`.
- Do not call POST `/official-import` because current source only returns
  `CANDIDATE_READY_NOT_EXECUTED` and does not call the transaction RPC.

Consequences:

- No genealogy data was written by A-16AG.
- A-16R import retry remains:
  `A16R_IMPORT_RETRY_NEXT=NO`.

## Decision 294 - A-16AF production smoke keeps runtime import execution blocked after A-16AE deploy

Date: 2026-07-09

Status: Accepted

Context:

- Owner confirmed GitHub Actions deploy succeeded for A-16AE commit `5ddd7c0`.
- A-16AF was limited to read-only production smoke and could not call POST
  `/official-import`.

Decision:

- Record A-16AF as:
  `A16AF_PRODUCTION_SMOKE_STATUS=PASS_READ_ONLY_BLOCKED_SAFE`.
- Classify current runtime import status as:
  `A16AF_CAN_RUN_OFFICIAL_IMPORT_STATUS=NOT_ENABLED_BY_READ_ONLY_PRODUCTION_SMOKE`.
- Preserve the blocker:
  `A16AF_BLOCKER=RUNTIME_CANDIDATE_NOT_OBSERVABLE_OR_RUNNABLE_BY_SAFE_GET_OFFICIAL_IMPORT_ROUTE_GET_405_GATE_GET_401`.

Consequences:

- The deployed candidate did not produce an import execution approval in this
  phase.
- A-16R import retry remains:
  `A16R_IMPORT_RETRY_NEXT=NO`.

## Decision 293 - A-16AE adds guarded runtime official import enablement candidate without execution

Date: 2026-07-09

Status: Accepted

Context:

- A-16AD classified the blocker as
  `SOURCE_RUNTIME_IMPLEMENTATION_REMAINS_FAIL_CLOSED`.
- The route flag alone was not sufficient because the service always returned
  `status: "BLOCKED"` and `canRunOfficialImport: false`.

Decision:

- Let the service compute:
  `const canRunOfficialImport = reasons.length === 0`.
- Keep the route fail-closed by default with
  `A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED`.
- Return `CANDIDATE_READY_NOT_EXECUTED` only when all confirmation, session,
  permission, validation, dry-run, duplicate, rollback, audit, A-16T/U/V, and
  runtime marker gates pass.
- Do not call RPC or execute import in A-16AE.

Consequences:

- A later deploy/smoke gate must prove the candidate safely in production
  before any final import execution phase.
- A-16R import retry remains:
  `A16R_IMPORT_RETRY_NEXT=NO`.

## Decision 292 - A-16AD classifies runtime official import enablement blocker as source fail-closed

Date: 2026-07-09

Status: Accepted

Context:

- A-16AC proved the final execution gate is still blocked by
  `A16R_BLOCKED_RUNTIME_EXECUTION_NOT_ENABLED_AFTER_A16V_VERIFY`.
- The owner execution approval marker is present.
- A-16V apply/verify and prior runtime enablement owner review evidence exist.

Decision:

- Classify the blocker as:
  `SOURCE_RUNTIME_IMPLEMENTATION_REMAINS_FAIL_CLOSED`.
- Treat the route flag as present but not sufficient because the service result
  still returns `status: "BLOCKED"` and `canRunOfficialImport: false`.
- Treat session mismatch and missing route as not the blocker.
- Keep A-16R import retry as:
  `A16R_IMPORT_RETRY_NEXT=NO`.

Consequences:

- The minimum next safe phase is:
  `A-16AE-RUNTIME-OFFICIAL-IMPORT-ENABLEMENT-CANDIDATE`.
- A-16AD itself does not enable runtime, print a final import command, call
  POST `/official-import`, call direct RPC, deploy, run SQL, or mutate data.

## Decision 291 - A-16AC blocks A-16R import retry execution because runtime remains fail-closed

Date: 2026-07-08

Status: Accepted

Context:

- A-16AB classified the evidence chain as
  `READY_FOR_SEPARATE_OWNER_IMPORT_EXECUTION_APPROVAL`.
- The owner provided:
  `OWNER_APPROVED_A16R_IMPORT_RETRY_EXECUTION`.
- Current source still keeps the official import route and service fail-closed
  with `canRunOfficialImport: false`.

Decision:

- Set final execution gate classification to:
  `BLOCKED_RUNTIME_EXECUTION_NOT_ENABLED`.
- Record exact blocker:
  `A16R_BLOCKED_RUNTIME_EXECUTION_NOT_ENABLED_AFTER_A16V_VERIFY`.
- Do not print a final owner-run command because same-run source verification
  does not allow execution.
- Keep A-16R import retry as:
  `A16R_IMPORT_RETRY_NEXT=NO`.

Consequences:

- A separate runtime enablement implementation gate is required before any final
  execution command or UI action can be offered.
- A-16AC itself does not call POST `/official-import`, direct RPC, SQL, deploy,
  or any data mutation.

## Decision 290 - A-16AB marks retry preflight ready for separate owner import execution approval

Date: 2026-07-08

Status: Accepted

Context:

- A-16O exposes the audited full relationship export route in read-only mode.
- A-16X2 accepted the correct A-16O full audit export shape.
- A-16AA classified all 94 warnings as owner-review required but not
  import-blocking and the owner provided:
  `OWNER_APPROVED_A16AA_WARNING_REVIEW_FOR_A16R_IMPORT_RETRY_PREFLIGHT`.

Decision:

- Set final preflight classification to:
  `READY_FOR_SEPARATE_OWNER_IMPORT_EXECUTION_APPROVAL`.
- Keep actual import execution out of A-16AB.
- Require a future explicit execution marker:
  `OWNER_APPROVED_A16R_IMPORT_RETRY_EXECUTION`.
- Keep A-16R import retry as:
  `A16R_IMPORT_RETRY_NEXT=NO`.

Consequences:

- A later separate phase may request owner execution approval and run the final
  execution-specific preflight.
- A-16AB itself does not call POST `/official-import`, direct RPC, SQL, deploy,
  or any data mutation.

## Decision 289 - A-16AA classifies relationship audit warnings as owner-review required but not import-blocking

Date: 2026-07-08

Status: Accepted

Context:

- A-16X2 verified the owner-downloaded A-16O full audit export shape with 102
  proposed people, 134 proposed relationships, blocked errors `0`, and warnings
  `94`.
- A-16AA reviewed warning metadata offline/read-only without printing or
  committing the raw JSON.

Decision:

- Classify the 94 warnings as non-import-blocking by runtime severity because no
  `error` severity issue is present and `blockedByErrorCount=0`.
- Require owner review before retry preflight because warnings include date
  parse/precision/calendar categories and one duplicate candidate warning.
- Use the next explicit owner marker:
  `OWNER_APPROVED_A16AA_WARNING_REVIEW_FOR_A16R_IMPORT_RETRY_PREFLIGHT`.
- Keep A-16R import retry as:
  `A16R_IMPORT_RETRY_NEXT=NO`.

Consequences:

- A later phase may request owner acceptance of the warning categories/counts.
- A-16AA itself does not run import, SQL, deploy, mutation, or raw evidence
  publication.

## Decision 288 - A-16X2 accepts the correct A-16O audit export shape without opening import

Date: 2026-07-08

Status: Accepted

Context:

- A-16X previously rejected an owner-provided family backup JSON as not being
  the A-16O full relationship audit export.
- A-16Z exposed the owner-facing read-only A-16O audit export download path on
  `/admin/exports/import`.
- Owner provided a newly downloaded local evidence file at
  `.tmp\a16o-dry-run-relationship-audit-export-full.json`.

Decision:

- Accept the newly downloaded JSON for the shape/evidence gate only because it
  has marker `A16O_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY`, audited
  session `2af4bfb6-a20e-453e-9804-1b8c0afbdd68`, summary present, 102
  proposed people, and 134 proposed relationships.
- Record only sanitized metadata, including SHA256
  `B30CF84A78B78CF750EACE9BDBC9D697040D623B194AB095875E66F8EBFF1289`.
- Keep A-16R import retry closed as `A16R_IMPORT_RETRY_NEXT=NO`.

Consequences:

- The next allowed gate is the offline full relationship audit phase, not import
  execution.
- The raw JSON remains local and uncommitted.
- Vietnamese UI mojibake remains a recorded follow-up rather than an A-16X2
  implementation change.

## Decision 287 - A-16Z exposes the A-16O audit export path without opening import

Date: 2026-07-08

Status: Accepted

Context:

- A-16Y concluded the production UI exposed general `family.json` backup, while
  the correct owner-facing A-16O audit export download was missing or unclear.
- A-16X proved a family backup JSON is not valid A-16O relationship audit
  evidence.
- The existing A-16O API route already supports the full read-only audit export
  with `?auditExport=relationships-full`.

Decision:

- Add a minimal owner-facing link on `/admin/exports/import` with label:
  `Tải A-16O audit export JSON`.
- Point it to:
  `GET /api/admin/import-sessions/2af4bfb6-a20e-453e-9804-1b8c0afbdd68/dry-run-preview?auditExport=relationships-full`.
- Keep the path read-only and separate from `family.json`.
- Keep official import locked and A-16R import retry as:
  `A16R_IMPORT_RETRY_NEXT=NO`.

Consequences:

- Owner can fetch the correct JSON after a later deploy/smoke phase instead of
  using general backup JSON by mistake.
- A later A-16AA shape verification phase must still verify the downloaded JSON
  before any offline relationship audit or A-16R retry consideration.

## Decision 286 - A-16Y re-anchors Gia Pha 4 import execution to audit evidence gates

Date: 2026-07-08

Status: Accepted

Context:

- A-16O, A-16W, and A-16X are complete.
- A-16X proved the owner-provided JSON was a family backup JSON, not the
  expected A-16O full relationship audit export.
- The current blocker remains:
  `A16X_BLOCKER=OWNER_PROVIDED_JSON_SHAPE_MISMATCH_FAMILY_BACKUP_NOT_A16O_FULL_RELATIONSHIP_AUDIT_EXPORT`.
- `/admin/exports` exposes general backup downloads, while the A-16O audit
  export exists as the `?auditExport=relationships-full` API path.

Decision:

- Re-anchor the Gia Pha 4 import execution roadmap to a strict phase sequence:
  A-16Z, A-16AA, A-16AB, A-16AC, then A-16AD before any future A-16R retry.
- Record:
  `A16Y_PRODUCTION_UI_CORRECT_A16O_AUDIT_EXPORT_DOWNLOAD_EXPOSED=NO_OR_UNCLEAR`.
- Record:
  `A16Y_FAMILY_JSON_BACKUP_SUFFICIENT_FOR_A16R_RETRY=NO`.
- Keep A-16R import retry as:
  `A16R_IMPORT_RETRY_NEXT=NO`.

Consequences:

- The next implementation phase should expose or document the correct
  read-only A-16O full audit export path, not execute import.
- General backup work, unrelated UI work, domain work, backup-service work,
  deployment, SQL, mutation, and official import execution remain out of scope.

## Decision 285 - A-16X rejects family backup JSON as full relationship audit evidence

Date: 2026-07-08

Status: Accepted

Context:

- Owner provided a local JSON file at
  `.tmp\a16o-dry-run-relationship-audit-export-full.json` with SHA256
  `380E45CFDDAE78D0FEA9904B45B7901901708915E335B8D000428A962B5DE513`.
- Sanitized shape verification showed backup-style keys such as `people`,
  `family_parents`, `family_children`, `families`, `tree_layouts` and
  `tree_layout_nodes`.
- The expected A-16O full relationship audit fields were missing, including
  `marker`, `sessionId`, `summary`, `proposedPeople`, and
  `proposedRelationships`.

Decision:

- Classify the owner file as:
  `A16X_OWNER_JSON_CLASSIFICATION=FAMILY_BACKUP_JSON_NOT_A16O_AUDIT_EXPORT`.
- Block A-16X with:
  `A16X_BLOCKER=OWNER_PROVIDED_JSON_SHAPE_MISMATCH_FAMILY_BACKUP_NOT_A16O_FULL_RELATIONSHIP_AUDIT_EXPORT`.
- Do not run the A-16N offline audit against the wrong shape.
- Keep A-16R import retry as:
  `A16R_IMPORT_RETRY_NEXT=NO`.

Consequences:

- Owner must provide the authenticated JSON returned by
  `?auditExport=relationships-full` for audited session
  `2af4bfb6-a20e-453e-9804-1b8c0afbdd68`, not a family backup export.
- The backup JSON must not be used as A-16O relationship audit evidence or as a
  trigger for official import execution.
- No official import, direct RPC, SQL, DB mutation, deploy, permission mutation,
  raw JSON print, raw JSON commit, `wrangler.toml` change or `app/layout.tsx`
  change is allowed by this verification phase.

## Decision 284 - A-16W keeps A-16R import retry blocked until authenticated full export evidence exists

Date: 2026-07-08

Status: Accepted

Context:

- A-16O production deploy/smoke evidence is accepted and the unauthenticated
  full export API boundary is `A16O_EXPORT_AUTH_BOUNDARY_PASS`.
- The required owner-authenticated full JSON was still not available locally at
  `.tmp\a16o-dry-run-relationship-audit-export-full.json`.
- The A-16N offline full audit cannot prove full 102/134 relationship evidence
  without that authenticated JSON.

Decision:

- Record readiness as:
  `A16W_FULL_AUTHENTICATED_EXPORT_EVIDENCE_STATUS=BLOCKED_OWNER_AUTHENTICATED_FULL_JSON_NOT_AVAILABLE`.
- Record exact blocker:
  `A16W_BLOCKER=OWNER_AUTHENTICATED_FULL_RELATIONSHIP_AUDIT_EXPORT_JSON_MISSING`.
- Preserve A-16O PASS status and keep A-16R import retry as:
  `A16R_IMPORT_RETRY_NEXT=NO`.

Consequences:

- A later phase may run the offline A-16N audit only after owner-authenticated
  full export JSON exists locally under `.tmp\` or another non-committed path.
- Actual official import execution remains a separate owner-approved phase.
- No official import, direct RPC, SQL, DB mutation, deploy, permission mutation,
  `wrangler.toml` change, `app/layout.tsx` change or raw JSON commit is allowed
  by this readiness phase.

## Decision 283 - A-16O deploy smoke records auth boundary before owner full JSON audit

Date: 2026-07-08

Status: Accepted

Context:

- Owner confirmed GitHub Actions Cloudflare Deploy succeeded on branch `main`
  for implementation commit `e74ec38`.
- Production public/login/admin import routes were reachable by GET.
- The default dry-run preview and full audit export API routes returned
  unauthenticated `401`, which proves the API is not publicly exposed from CLI
  but does not prove the authenticated full 102/134 export payload.
- The owner full export JSON was not available locally.

Decision:

- Record the deploy smoke as:
  `A16O_DEPLOY_SMOKE_READY_OWNER_FULL_JSON_NEEDED`.
- Treat unauthenticated `401` as:
  `A16O_EXPORT_AUTH_BOUNDARY_PASS`.
- Require owner-authenticated browser JSON before running offline A-16N full
  relationship audit.
- Keep official import locked and keep A-16R import retry as `NO`.

Consequences:

- Do not infer full export counts from unauthenticated CLI responses.
- Do not run official import, direct RPC, SQL, DB push, migration repair, seed,
  permission mutation or any real genealogy write.

## Decision 282 - A-16O adds read-only full relationship audit export without opening official import

Date: 2026-07-08

Status: Accepted

Context:

- A-16N owner JSON evidence showed valid authenticated dry-run preview data, but
  the default preview was capped to 100 people and 100 relationships.
- Total dry-run counts remain `proposedPeopleCount=102` and
  `proposedRelationshipCount=134`.
- Partial audit of first 100 relationships found
  `REVIEW_ROLE_GENDER_MISMATCH=34`, so full 134/134 evidence is required before
  any parser/staging/SQL fix or owner acceptance decision.

Decision:

- Add an explicit GET-only full audit export mode on the existing dry-run
  preview route:
  `?auditExport=relationships-full`.
- Preserve the default capped UI preview behavior when that query parameter is
  absent.
- Require existing authenticated/admin manifest read access plus the A-16K
  audited dry-run session gate.
- Keep official import locked with `canProceedToOfficialImport=false` and
  `officialImportOpen=false`.
- Do not deploy in this phase; require
  `A-16O-DEPLOY-READ-ONLY-AUDIT-EXPORT-SMOKE` before production use.

Consequences:

- Main Worker has a narrow read-only route/service change, but no dependency,
  Worker config, SQL, deploy, DB write, official import execution or permission
  mutation is introduced.
- Raw full JSON evidence remains local under `.tmp/` or outside the repo and is
  not committed.
- A-16R import retry remains `NO`.

## Decision 281 - A-16N prepares offline full relationship audit evidence before any import fix

Date: 2026-07-07

Status: Accepted

Context:

- A-16M left root cause as
  `A16M_ROOT_CAUSE_UNKNOWN_NEEDS_FULL_EXPORT_EVIDENCE`.
- A-16L/A-16M evidence shows official import should remain blocked until all
  `134` proposed dry-run relationships can be audited with owner-visible JSON.
- No owner-exported full dry-run preview JSON is present in the repo.

Decision:

- Classify the phase as:
  `A16N_FULL_DRY_RUN_RELATIONSHIP_AUDIT_STATUS=A16N_EVIDENCE_TOOLING_READY_OWNER_JSON_NEEDED`.
- Add only offline/read-only tooling and evidence docs for the audited session
  `2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
- Require the full relationship audit before choosing an A-16O path:
  `A-16O-FIX-RELATIONSHIP-ROLE-MAPPING`,
  `A-16O-OWNER-ACCEPTS-SOURCE-RELATIONSHIP-ROLES_AFTER_FULL_AUDIT`, or
  `A-16O-LABEL-ONLY-PREVIEW-CORRECTION`.
- Keep official import locked and keep A-16R import retry as `NO`.

Consequences:

- Do not change parser/import/runtime behavior in A-16N.
- Do not run POST `/official-import`, direct RPC, deploy, SQL, DB push,
  migration repair, seed, auth/role/user mutation or real genealogy writes.

## Decision 280 - A-16M keeps official import blocked until relationship role root cause is proven

Date: 2026-07-07

Status: Accepted

Context:

- A-16L found suspicious `Bố/Mẹ` relationship labels in dry-run preview for
  audited session `2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
- Source inspection shows parser/staging creates and persists
  `relationship_label_vi`; dry-run preview and UI only pass it through.
- The A-16V SQL candidate derives `family_parents.parent_role` from
  `relationship_label_vi`.

Decision:

- Classify root cause as:
  `A16M_ROOT_CAUSE_CLASSIFICATION=A16M_ROOT_CAUSE_UNKNOWN_NEEDS_FULL_EXPORT_EVIDENCE`.
- Treat official import safety as:
  `A16M_IMPORT_SAFETY_CLASSIFICATION=LIKELY_YES`.
- Keep confirmed runtime-write risk as `UNKNOWN` until a full row-level export
  proves affected rows and exact cause.
- Keep official import locked with `canProceedToOfficialImport=false`,
  `officialImportOpen=false`, `officialImportEnabled=false` and
  `canRunOfficialImport=false`.
- Recommend next phase:
  `A-16N-FULL-DRY-RUN-RELATIONSHIP-AUDIT-EVIDENCE`.

Consequences:

- Do not fix parser, SQL or runtime behavior in this plan-only phase.
- Do not run POST `/official-import`, direct RPC, deploy, SQL, DB push,
  migration repair, seed, auth/role/user mutation or real genealogy writes.
- A-16R import retry remains `NO`.

## Decision 279 - A-16L dry-run relationship preview requires owner role audit before official import

Date: 2026-07-07

Status: Accepted

Context:

- A-16K opened the audited dry-run gate for session
  `2af4bfb6-a20e-453e-9804-1b8c0afbdd68` only.
- A-16L dry-run preview returned `proposedPeopleCount=102`,
  `proposedRelationshipCount=134`, `blockedByErrorCount=0` and
  `warningCount=92`.
- Owner preview evidence showed suspicious `Bố/Mẹ` relationship labels such as
  `Bố: Phạm Thị Bích` and `Mẹ: Nguyễn Hoàng Hiệp`.
- Source inspection found the preview UI does not synthesize these labels; the
  labels are parser/staging values passed through from
  `import_relationship_candidates.relationship_label_vi`.

Decision:

- Classify the phase as:
  `A16L_DRY_RUN_PREVIEW_OWNER_REVIEW_CLASSIFICATION=A16L_DRY_RUN_PREVIEW_OWNER_REVIEW_BLOCKED_RELATIONSHIP_ROLE_AUDIT_REQUIRED`.
- Keep the issue as `UNKNOWN_NOT_PROVEN` between confirmed mapping bug and
  source data semantics until raw relationship/warning details are audited.
- Require owner review for suspicious relationship roles, warning categories
  and duplicate decisions before any official import phase.
- Keep official import locked with `canProceedToOfficialImport=false`,
  `officialImportOpen=false`, `officialImportEnabled=false` and
  `canRunOfficialImport=false`.

Consequences:

- This decision does not authorize POST `/official-import`, direct RPC, real
  genealogy writes, SQL, DB push, migration repair, seed, deploy, permissions
  mutation, `wrangler.toml` changes or `app/layout.tsx` changes.
- A-16R import retry remains `NO`.
- The next safe action is an owner/authenticated read-only raw relationship and
  warning detail audit for the audited session only.

## Decision 278 - A-16K owner approval opens dry-run gate only for the audited A-16R session

Date: 2026-07-07

Status: Accepted

Context:

- Owner provided the A-16K dry-run approval marker:
  `APPROVE_A16K_IMPORT_DRY_RUN_GATE`.
- The A-16R session-selection fix binds official import markers to audited
  session `2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
- The previously observed UI session
  `ae7a5fe3-6a29-4f60-85f7-76108ed02565` remains unverified and must not be
  used for dry-run or official import approval.

Decision:

- Open the A-16K dry-run gate only when the requested session id equals
  `2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
- Keep all other sessions locked, including
  `ae7a5fe3-6a29-4f60-85f7-76108ed02565`.
- Treat validation warnings as owner-review warnings rather than hard blockers
  unless existing validation logic already marks them as errors.
- Keep official import fail-closed: `officialImportOpen=false`,
  `canOpenOfficialImport=false`, `officialImportEnabled=false` and
  `canRunOfficialImport=false`.

Consequences:

- A-16K approval opens only read-only dry-run mapping for the audited session.
- A-16K approval does not authorize POST `/official-import`, direct RPC,
  real genealogy writes, SQL, DB push, migration repair, seed, auth/role/user
  mutation, deploy or `wrangler.toml` changes.
- Local hydration warning with `crxlauncher=""` remains classified as likely
  browser extension injection; do not modify `app/layout.tsx` unless it
  reproduces in a clean browser profile without extensions.

## Decision 277 - A-16R official import marker is bound to the audited session, not the current UI session

Date: 2026-07-07

Status: Accepted

Context:

- The previous reconciliation found the production UI could display marker
  `APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_ae7a5fe3-6a29-4f60-85f7-76108ed02565`
  because the admin import page selects a visible/current session.
- The only audited runtime-bound official import session for this A-16R chain is
  `2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
- Official import execution remains fail-closed and is not authorized in this
  phase.

Decision:

- Classify the issue as:
  `A16R_FIX_OFFICIAL_IMPORT_SESSION_SELECTION_MISMATCH_CLASSIFICATION=SESSION_ID_UI_SELECTION_MISMATCH`.
- Bind the UI official import marker to
  `A16R_AUDITED_OFFICIAL_IMPORT_MARKER`, derived from
  `A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
- Do not use `ae7a5fe3-6a29-4f60-85f7-76108ed02565` as an official import
  session.
- Keep `canRunOfficialImport=false`, keep the button disabled and keep
  `A16R_IMPORT_RETRY_NEXT=NO`.

Consequences:

- The current/latest visible UI session can still be displayed as session
  context, but it cannot generate the official import marker.
- When the visible session differs from the audited session, the UI shows a
  mismatch warning with both ids.
- This decision does not authorize deploy, POST `/official-import`, direct RPC,
  real genealogy writes, SQL, DB push, migration repair, seed, auth/role/user
  mutation, Windows-local deploy or `wrangler.toml` changes.

## Decision 276 - A-16R official import session id remains unknown until both sessions are read-only verified

Date: 2026-07-07

Status: Accepted

Context:

- Owner observed production UI marker
  `APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_ae7a5fe3-6a29-4f60-85f7-76108ed02565`.
- Prior A-16R/A-16T/A-16U/A-16V evidence consistently tracked session
  `2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
- Source inspection shows `/admin/exports/import` selects the newest visible
  import session by `created_at desc`, and the UI marker renders from
  `session.id`.
- Runtime official import source still hardcodes the prior session and remains
  fail-closed with `canRunOfficialImport=false`.

Decision:

- Classify the mismatch as:
  `A16R_OFFICIAL_IMPORT_SESSION_ID_RECONCILIATION_CLASSIFICATION=UNKNOWN_NEEDS_READ_ONLY_SESSION_EVIDENCE`.
- Keep authoritative session:
  `A16R_OFFICIAL_IMPORT_SESSION_ID_AUTHORITATIVE=UNKNOWN`.
- Do not approve or use either session marker until both session ids have
  authenticated owner/admin read-only detail evidence.
- Keep A-16R import retry blocked:
  `A16R_IMPORT_RETRY_NEXT=NO`.

Consequences:

- The `ae7a5fe3-6a29-4f60-85f7-76108ed02565` marker is not accepted as correct
  merely because it appears in production UI.
- The `2af4bfb6-a20e-453e-9804-1b8c0afbdd68` marker is not accepted as current
  merely because prior docs and runtime guards reference it.
- Next work must be an authenticated owner/admin read-only session detail smoke
  for both ids, with no POST, direct RPC, SQL, DB push, seed, deploy or import.

## Decision 275 - A-16R import UI copy separates dry-run preview from official import execution while staying locked

Date: 2026-07-07

Status: Accepted

Context:

- The previous reconciliation classified the UI as potentially misleading
  because A-16K dry-run copy could be read as an official import blocker.
- A-16K is a dry-run/preview gate, while A-16R is the official import execution
  gate.
- Official import execution still requires exact session/runtime approval and a
  proven owner/admin production context.

Decision:

- Refresh Vietnamese UI copy on the import session panel so A-16K dry-run and
  A-16R official import execution are visually and textually separate.
- Display the exact A-16R session marker:
  `APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
- Display the runtime enablement marker as separate:
  `APPROVE_A16R_RUNTIME_EXECUTION_AFTER_A16V_VERIFY`.
- Keep the official import button disabled, keep `canRunOfficialImport=false`
  and keep `A16R_IMPORT_RETRY_NEXT=NO`.

Consequences:

- Owner/operator copy is clearer without opening import execution.
- Next allowed action remains an authenticated owner/admin read-only gate smoke
  with no POST and no import.
- This decision does not authorize deploy, POST `/official-import`, direct RPC,
  real genealogy writes, SQL, DB push, migration repair, seed, auth/role/user
  mutation, Windows-local deploy or `wrangler.toml` changes.

## Decision 274 - A-16R production UI gate state treats A-16K as dry-run UI copy, not the official import runtime blocker

Date: 2026-07-07

Status: Accepted

Context:

- Production/operator UI evidence can still surface the A-16K dry-run gate copy
  requiring `APPROVE_A16K_IMPORT_DRY_RUN_GATE`.
- Later A-16R/A-16T/A-16U/A-16V evidence says dry-run/runtime readiness
  progressed, but official import execution still remains closed.
- Source inspection shows the A-16K marker belongs to dry-run gate/preview
  source, while official import execution uses A-16R session/runtime markers
  and remains fail-closed.

Decision:

- Classify the reconciliation as:
  `A16R_PRODUCTION_UI_GATE_STATE_CLASSIFICATION=UI_COPY_STALE_BUT_RUNTIME_GATE_CORRECT`.
- Treat `APPROVE_A16K_IMPORT_DRY_RUN_GATE` as still required by current dry-run
  source, but not proven as required before official import runtime execution.
- Keep source `canRunOfficialImport=false`, source official import button
  disabled and `A16R_IMPORT_RETRY_NEXT=NO`.

Consequences:

- A later phase may refresh UI copy to separate dry-run history from official
  import runtime blockers, or rerun authenticated read-only gate smoke.
- This decision does not authorize POST `/official-import`, direct RPC, deploy,
  SQL, DB push, migration repair, seed, real genealogy writes, auth/role/user
  mutation or `wrangler.toml` changes.

## Decision 273 - A-16R owner auth gate smoke bundle remains blocked by missing app-server owner auth context

Date: 2026-07-06

Status: Accepted

Context:

- The owner repaired local `.git/FETCH_HEAD` permissions and preflight returned
  `main...origin/main`, ahead/behind `0 / 0`, with HEAD equal to
  `origin/main` at `88ec34237543b67c255e61dde8f84d8a9728895f`.
- The active toolset did not expose in-app browser control for direct owner
  session inspection in this resumed turn.
- Safe Node GET-only production smoke without cookies/auth headers reached the
  import page but still showed unknown user, no visible role, visible
  permission count `0` and login-required copy.
- Safe Node GET-only official-import-gate returned guarded `401` with
  `A16N_LOCKED_OFFICIAL_IMPORT_PREFLIGHT_GATE`, `readOnly=true`,
  `canOpenOfficialImport=false` and `officialImportEnabled=false`.

Decision:

- Keep `A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_STATUS=BLOCKED_AUTH_OR_PERMISSION_INSUFFICIENT`.
- Keep owner auth classification
  `A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_OWNER_AUTH_CLASSIFICATION=AUTH_SESSION_COOKIE_MISSING`.
- Keep `A16R_IMPORT_RETRY_NEXT=NO`.
- A future phase must first prove an owner/admin app-server session and
  `imports.create` permission through read-only UI/gate evidence. Even if ready,
  it must record READY and stop before any import execution.

Consequences:

- No deploy, POST `/official-import`, direct RPC, real genealogy write, SQL,
  DB push, migration repair, seed, permission/role/auth/user/membership
  mutation, Windows-local deploy or `wrangler.toml` change is allowed from this
  evidence.

## Decision 272 - A-16R owner/admin import permission blocker is auth session missing until owner login is proven

Date: 2026-07-04

Status: Accepted

Decision:

- Classify the owner/admin import permission diagnosis as:
  `A16R_OWNER_ADMIN_IMPORT_PERMISSION_DIAGNOSIS_CLASSIFICATION=AUTH_SESSION_COOKIE_MISSING`.
- Keep A-16R import retry blocked:
  `A16R_IMPORT_RETRY_NEXT=NO`.
- Treat DB/SQL role repair as unknown, not authorized and not proven:
  `A16R_OWNER_ADMIN_IMPORT_PERMISSION_DB_SQL_ROLE_REPAIR_NEEDED=UNKNOWN_NOT_PROVEN`.
- Require owner manual production login/account action before another
  read-only gate smoke:
  `A16R_OWNER_ADMIN_IMPORT_PERMISSION_OWNER_MANUAL_ACTION_NEEDED=YES`.

Rationale:

- The prior page smoke showed permission count `0` and login-required copy.
- Source uses the login-required import copy when `context.user` is absent.
- Without a proven app-server Supabase auth user context, this phase cannot
  distinguish wrong account, missing profile, missing role, missing
  `imports.create`, or role/permission mapping mismatch.
- This decision does not mutate roles, permissions, auth users, memberships,
  DB, API, dependency, OpenNext/Wrangler config or service boundary.

## Decision 271 - A-16R authenticated owner import gate smoke retry remains blocked by auth or permission context

Date: 2026-07-04

Status: Accepted

Decision:

- Classify the authenticated owner/admin official-import gate smoke retry as:
  `A16R_AUTH_OWNER_GATE_SMOKE_RETRY_CLASSIFICATION=BLOCKED_AUTH_OR_PERMISSION_INSUFFICIENT`.
- Keep A-16R import retry blocked:
  `A16R_IMPORT_RETRY_NEXT=NO`.
- Treat the available production browser context as insufficient because it did
  not prove owner/admin import permission.
- The next allowed action is:
  `A16R_AUTH_OWNER_GATE_SMOKE_RETRY_NEXT_ALLOWED_ACTION=OWNER_LOGIN_WITH_ADMIN_IMPORT_PERMISSION_THEN_RERUN_READ_ONLY_GATE_UI_SMOKE_NO_POST`.

Rationale:

- The production import page was reachable read-only, but visible state showed
  permission count `0` and login-required copy for import checking.
- Authenticated owner/admin gate readiness could not be proven from that
  context.
- Source remains fail-closed with `canRunOfficialImport=false` and the official
  import UI source button disabled.
- This decision does not change DB, auth, permission, API, dependency,
  OpenNext/Wrangler config or service boundary.

## Decision 270 - A-16R authenticated official import gate smoke is blocked by auth or permission context

Date: 2026-07-04

Status: Accepted

Decision:

- Classify the attempted authenticated official-import gate smoke as:
  `A16R_AUTHENTICATED_OFFICIAL_IMPORT_GATE_CLASSIFICATION=BLOCKED_AUTH_OR_PERMISSION_INSUFFICIENT`.
- Keep A-16R import retry blocked:
  `A16R_IMPORT_RETRY_NEXT=NO`.
- Treat the available browser/session context as insufficient for gate
  readiness because it did not prove an authenticated admin import context.
- The next allowed action is to provide a logged-in admin owner browser session
  or explicitly approved read-only auth context, then rerun read-only gate/UI
  smoke with no POST:
  `A16R_AUTH_GATE_SMOKE_NEXT_ALLOWED_ACTION=PROVIDE_LOGGED_IN_ADMIN_OWNER_BROWSER_SESSION_OR_APPROVED_READ_ONLY_AUTH_CONTEXT_THEN_RERUN_AUTHENTICATED_GATE_UI_SMOKE_NO_POST`.

Rationale:

- The production import page was reachable, but visible state showed permission
  count `0` and login-required copy for import checking.
- Authenticated admin API readiness could not be proven from that context.
- Source remains fail-closed with `canRunOfficialImport=false` and the official
  import UI source button disabled.
- This decision does not change DB, auth, permission, API, dependency,
  OpenNext/Wrangler config or service boundary.

## Decision 269 - A-16R official import gate readiness needs authenticated read-only smoke

Date: 2026-07-04

Status: Accepted

Decision:

- Classify the post-deploy official-import-gate readiness state as:
  `A16R_OFFICIAL_IMPORT_GATE_READINESS_CLASSIFICATION=UNKNOWN_NEEDS_AUTHENTICATED_SMOKE`.
- Treat the live guarded `401` as expected unauthenticated GET behavior, not a
  deploy failure and not official import execution.
- Keep A-16R import retry blocked:
  `A16R_IMPORT_RETRY_NEXT=NO`.
- The next allowed action is authenticated admin read-only gate/UI smoke only:
  `A16R_OFFICIAL_IMPORT_GATE_READINESS_NEXT_ALLOWED_ACTION=RUN_AUTHENTICATED_ADMIN_READ_ONLY_GATE_AND_UI_SMOKE_NO_POST`.

Rationale:

- The GET gate depends on manifest read access, which requires an authenticated
  user with `imports.create`; unauthenticated GET cannot prove readiness.
- Source remains fail-closed with `canRunOfficialImport=false` and the official
  import UI button disabled.
- This decision does not change DB, auth, permission, API, dependency,
  OpenNext/Wrangler config or service boundary.

## Decision 268 - A-16R GitHub Actions Linux deploy smoke passes while official import remains locked

Date: 2026-07-03

Status: Accepted

Decision:

- Accept the manual GitHub Actions Linux deploy evidence for A-16R:
  `A16R_GITHUB_ACTIONS_LINUX_DEPLOY_SMOKE_STATUS=PASS_DEPLOYED_SMOKE_GET_ONLY_IMPORT_LOCKED`.
- Treat workflow run `28656644567` on commit
  `cee98384e7df6b6fc3c6703c1ff523b844d89254` as the deploy evidence for this
  phase.
- Treat Worker version `4e7841b6-62ca-4b71-a46c-ccc21ad6cefc` as the active
  version after the GitHub Actions Linux deploy.
- Do not rollback because required GET routes did not return 500:
  `A16R_GITHUB_ACTIONS_LINUX_ROLLBACK_RESULT=NOT_RUN_NO_PRODUCTION_BREAKING_500`.
- Keep official import locked and require a separate execution gate:
  `A16R_IMPORT_RETRY_NEXT=NO`.

Rationale:

- The earlier Windows-local deploy path produced all-route HTTP 500, but this
  Linux workflow deployed from clean `origin/main` and GET smoke passed.
- The guarded official-import GET still returns fail-closed evidence with
  `officialImportEnabled=false`, so deploy success is not import authorization.
- This decision does not change DB, auth, permission, API, dependency,
  OpenNext/Wrangler config or service boundary.

## Decision 267 - A-16R OpenNext deploy bundle fix candidate uses manual GitHub Actions Linux deploy

Date: 2026-07-03

Status: Accepted

Decision:

- Accept the A-16R deploy bundle fix candidate as docs/checker-only:
  `A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_FIX_CANDIDATE_STATUS=FIX_CANDIDATE_READY_DOCS_ONLY`.
- Prefer the manual GitHub Actions Linux deploy path for the next explicit
  deploy-smoke phase:
  `A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_SAFE_PATH=MANUAL_GITHUB_ACTIONS_LINUX_DEPLOY_FROM_CLEAN_CHECKOUT`.
- Do not prefer Windows-local deploy, including clean temp mirror deploy, while
  the repo-local `.next` ACL lock and OpenNext Windows warning remain part of
  the root-cause evidence.
- Keep `wrangler.toml`, `open-next.config.ts`, `next.config.ts`, deploy scripts
  and workflows unchanged for this candidate.
- Keep A-16R import retry blocked:
  `A16R_IMPORT_RETRY_NEXT=NO`.

Rationale:

- The prior failed version `d158869a-3d32-4697-8ad8-815a64526b36` returned
  HTTP 500 on all required GET routes and was rolled back to
  `77fc3067-b197-4bce-8a36-eb2bde6bacc8`.
- The current root-cause classification is
  `OPENNEXT_CLOUDFLARE_INCOMPATIBILITY` with subtype
  `WINDOWS_LOCAL_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_INCOMPATIBILITY`.
- A clean temp mirror helps local build validation when repo-local `.next` is
  ACL-locked, but the previous failed deploy still used Windows-local
  OpenNext/Cloudflare tooling and emitted the OpenNext Windows warning.
- The existing `.github/workflows/cloudflare-deploy.yml` is manual-only,
  `ubuntu-latest`, clean checkout based, and already runs validation before
  `npm run deploy`.
- The phase did not deploy, call POST `/official-import`, call direct RPC, run
  SQL, push DB, repair migrations, seed, write real genealogy data or change
  `wrangler.toml`.

## Decision 266 - A-16R post-deploy HTTP 500 likely caused by Windows OpenNext deploy incompatibility

Date: 2026-07-03

Status: Accepted

Decision:

- Classify the failed A-16R post-deploy all-route HTTP 500 as
  `A16R_POST_DEPLOY_HTTP500_ROOT_CAUSE_CLASSIFICATION=OPENNEXT_CLOUDFLARE_INCOMPATIBILITY`.
- Treat the likely subtype as
  `A16R_POST_DEPLOY_HTTP500_ROOT_CAUSE_SUBTYPE=WINDOWS_LOCAL_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_INCOMPATIBILITY`.
- Keep confidence limited to
  `A16R_POST_DEPLOY_HTTP500_ROOT_CAUSE_CONFIDENCE=LIKELY_NOT_PROVEN_BY_FAILED_VERSION_STACKTRACE`
  because no failed-version stacktrace was captured after rollback.
- Keep failed deploy version
  `d158869a-3d32-4697-8ad8-815a64526b36` as the incident version and active
  rollback version `77fc3067-b197-4bce-8a36-eb2bde6bacc8` as the production
  baseline.
- Keep A-16R import retry blocked:
  `A16R_IMPORT_RETRY_NEXT=NO`.
- Next allowed action is a separate Linux/WSL/GitHub Actions deploy retry plan:
  `A16R_POST_DEPLOY_HTTP500_NEXT_ALLOWED_ACTION=PREPARE_LINUX_OR_GITHUB_ACTIONS_DEPLOY_RETRY_WITH_PREVIEW_AND_ROLLBACK_PLAN`.

Rationale:

- Failed and rollback versions had matching Cloudflare version metadata for
  handler, compatibility date, `nodejs_compat`, secret name and assets binding.
- Source diff from the last known production-smoke PASS commit to the failed
  source commit did not change global route initialization, public routes,
  auth login, Supabase server helpers, OpenNext/Wrangler config, Next config or
  runtime dependencies.
- The failed deploy returned `500` on every required GET route, including
  public and auth routes unrelated to official import, which makes a narrow
  official-import guard side effect unlikely.
- The phase did not deploy, call POST `/official-import`, call direct RPC, run
  SQL, push DB, repair migrations, seed, write real genealogy data or change
  `wrangler.toml`.

## Decision 265 - A-16R correct account deploy smoke failed and rolled back

Date: 2026-07-03

Status: Accepted

Decision:

- Accept the Cloudflare account as correct for deploy only after Wrangler
  reported `hungdiepcompany@gmail.com` on account
  `2974c02a3713cc906eddb18833d69077` and `web-gia-pha` was visible.
- Accept that deploy ran to worker `web-gia-pha` and produced version
  `d158869a-3d32-4697-8ad8-815a64526b36`.
- Treat the deployed version as failed because required GET smoke returned
  `500` for `/`, `/tree`, `/auth/login`, `/admin/exports/import` and the
  GET-only official-import-gate endpoint.
- Roll back to prior version
  `77fc3067-b197-4bce-8a36-eb2bde6bacc8`; post-rollback public GET routes
  returned `200` and the official-import-gate GET returned guarded `401`.
- Keep A-16R import retry blocked:
  `A16R_IMPORT_MAY_BE_RETRIED_NEXT=NO`.

Rationale:

- Correct account and successful upload are not sufficient runtime evidence
  when every required post-deploy GET route returns 500.
- Rolling back preserves production availability while keeping the failed
  version and smoke evidence available for follow-up diagnosis.

## Decision 264 - A-16R account verify deploy smoke remains blocked on the same Cloudflare account

Date: 2026-07-03

Status: Accepted

Decision:

- Keep deploy blocked because `npx wrangler whoami` still reports
  `hung.pham@longthaisteel.com` on account
  `dec1eb5cfb3f4b32956b1aff723e5ace`, the same account previously classified
  as wrong or unverified for GIA PHA.
- Keep target worker status blocked because
  `npx wrangler deployments list --name web-gia-pha` returned Cloudflare API
  `10007: This Worker does not exist on your account.`
- Do not run `npm run deploy`, do not alter `wrangler.toml`, and do not treat
  any post-deploy smoke as run while the account/worker gate fails.
- Keep A-16R import retry blocked:
  `A16R_IMPORT_MAY_BE_RETRIED_NEXT=NO`.

Rationale:

- The phase hard gate requires both a correct Cloudflare account and visible
  target worker `web-gia-pha` before deploy.
- Deploying while the active account is still the known blocked account risks
  updating or creating the wrong Cloudflare target.

## Decision 263 - A-16R Cloudflare account recovery blocks deploy until web-gia-pha is visible

Date: 2026-07-03

Status: Accepted

Decision:

- Classify the current Cloudflare deployment context as not safe for GIA PHA:
  `CLOUDFLARE_ACCOUNT_MATCH=NO`, `TARGET_WORKER_FOUND=NO` and
  `DEPLOY_ALLOWED_NEXT=NO`.
- Keep deploy blocked while account `dec1eb5cfb3f4b32956b1aff723e5ace`
  lists only `bom`, `hrsync`, `san-xuat-lt`,
  `san-xuat-lt-google-drive-service` and `sx`.
- Do not change `wrangler.toml` to fit that account and do not deploy GIA PHA
  to any Sản Xuất LT worker.
- Require owner/operator to log into the correct GIA PHA Cloudflare account or
  provide GitHub Actions/manual deploy evidence for `web-gia-pha` before any
  deploy retry.

Rationale:

- The repo and operations docs identify the GIA PHA worker as `web-gia-pha` and
  the production URL as `https://web-gia-pha.hungdiepcompany.workers.dev/`.
- A Cloudflare account that cannot see `web-gia-pha` cannot be treated as a
  safe deploy target for GIA PHA.

## Decision 262 - A-16R push succeeds but deploy blocks on Cloudflare target mismatch

Date: 2026-07-03

Status: Accepted

Decision:

- Accept the push to `origin/main` after clean preflight, ahead/behind `4 0`
  and source validation.
- Do not deploy from the current Wrangler/Cloudflare context because
  `web-gia-pha` is not visible in account
  `dec1eb5cfb3f4b32956b1aff723e5ace`; Wrangler deployments checks returned
  API code `10007`.
- Treat the public GET 200 responses from
  `https://web-gia-pha.hungdiepcompany.workers.dev/` as existing-production
  smoke only, not proof that commit `55d137c893104c30f7fa738b6be5b0294821dac1`
  is deployed.
- Keep A-16R import retry blocked until owner/operator resolves the Cloudflare
  target mismatch and a later post-deploy/source smoke proves sufficient
  production runtime evidence.

Rationale:

- Deploying when the configured Worker is not visible in the active account
  risks creating or updating the wrong Cloudflare target.
- Production availability alone is not enough to prove the pushed runtime
  enablement evidence is live.

## Decision 261 - A-16R runtime execution owner review accepts marker but keeps import closed

Date: 2026-07-03

Status: Accepted

Decision:

- Treat `APPROVE_A16R_RUNTIME_EXECUTION_AFTER_A16V_VERIFY` in the owner prompt
  as present and exact for runtime execution enablement review.
- Keep the marker separate from the session-specific run marker
  `APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
- Keep `canRunOfficialImport=false` and the official import button disabled
  because post-deploy/source smoke and a final execution gate are still
  required before A-16R import retry.
- Do not call POST `/official-import`, do not call direct RPC and do not write
  real genealogy data in this review phase.

Rationale:

- The runtime enablement marker records owner intent to review opening the
  execution path after A-16V verification; it is not itself an execution
  command.
- Keeping post-deploy/source smoke and final execution gating separate prevents
  readiness evidence from silently becoming a production write.

## Decision 260 - A-16R runtime execution enablement requires a separate owner marker

Date: 2026-07-03

Status: Accepted

Decision:

- Add a distinct runtime execution enablement marker:
  `APPROVE_A16R_RUNTIME_EXECUTION_AFTER_A16V_VERIFY`.
- Keep the session-specific run marker separate:
  `APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
- Record A-16V owner apply/verify as `OWNER_APPLIED_VERIFIED`, but keep
  `canRunOfficialImport=false` and keep the official import button disabled
  until a later phase explicitly opens runtime execution.
- Use blocker
  `A16R_BLOCKED_RUNTIME_EXECUTION_ENABLEMENT_APPROVAL_MISSING` when the new
  marker is absent, while preserving
  `A16R_BLOCKED_RUNTIME_EXECUTION_NOT_ENABLED_AFTER_A16V_VERIFY` for the still
  disabled execution path.

Rationale:

- A-16V verification proves the database transaction branch is ready, but it
  does not prove owner has approved opening the runtime path that calls the
  verified RPC.
- Keeping marker separation avoids silently turning readiness evidence into a
  production data write.
- The phase prepares the next gate without calling POST `/official-import`,
  calling RPC, writing real genealogy data, deploying or pushing.

## Decision 259 - A-16V production runtime evidence mismatch is reconciled without opening import

Date: 2026-07-03

Status: Accepted

Decision:

- Classify the A-16R after A-16V blocker as
  `A16V_PRODUCTION_RUNTIME_ROOT_CAUSE=EVIDENCE_READER_MISMATCH`.
- Reconcile runtime evidence so the A-16V branch reports
  `sqlCandidateStatus: "OWNER_APPLIED_VERIFIED"` with evidence source
  `docs/PLAN_A16V_APPLY_VERIFY.md`.
- Replace the stale runtime blocker
  `A16V_BLOCKED_REAL_TRANSACTION_BRANCH_NOT_APPLIED_OR_VERIFIED` in the active
  execution response with
  `A16R_BLOCKED_RUNTIME_EXECUTION_NOT_ENABLED_AFTER_A16V_VERIFY`.
- Keep `canRunOfficialImport=false`, keep the route fail-closed and keep the
  UI button disabled.

Rationale:

- Owner A-16V apply/verify evidence says the real transaction branch was
  applied and verified, so the runtime `NOT_APPLIED` label was stale.
- The runtime still does not contain an approved execution path that calls the
  RPC under one-call/import-session guards, so A-16R cannot be retried yet.
- Reconciliation fixes evidence accuracy without weakening fail-closed guards.

## Decision 258 - A-16R after A-16V retry stops at source runtime gate

Date: 2026-07-03

Status: Accepted

Decision:

- Accept the owner deploy evidence marker
  `OWNER_CONFIRMED_A16V_DEPLOYED_TO_PRODUCTION`.
- Treat the A-16R official import marker for session
  `2af4bfb6-a20e-453e-9804-1b8c0afbdd68` as matched.
- Keep the retry blocked with
  `A16R_AFTER_A16V_BUNDLE_STATUS=BLOCKED_POST_DEPLOY_SMOKE_INSUFFICIENT`
  because source/runtime still reports official import as fail-closed.
- Do not call POST `/official-import`, do not call the RPC directly and do not
  write real genealogy data while the source still has
  `canRunOfficialImport: false` and A-16V `sqlCandidateStatus: "NOT_APPLIED"`.

Rationale:

- Production deploy evidence is necessary but not sufficient for a dangerous
  import execution.
- The route and upload UI exist, but the official import service still returns
  a blocked candidate and still carries
  `A16V_BLOCKED_REAL_TRANSACTION_BRANCH_NOT_APPLIED_OR_VERIFIED`.
- Running POST while this source gate is fail-closed would violate the
  no-blind-retry rule and would not produce valid execution evidence.

## Decision 257 - A-16R after A-16V stops at production deploy evidence gate

Date: 2026-07-03

Status: Accepted

Decision:

- Treat the A-16R official import marker for session
  `2af4bfb6-a20e-453e-9804-1b8c0afbdd68` as matched.
- Keep the bundle blocked with
  `A16R_AFTER_A16V_BUNDLE_STATUS=BLOCKED_PRODUCTION_DEPLOY_EVIDENCE_MISSING`
  because the Cloudflare deploy workflow is manual-only and this prompt did
  not include owner evidence that A-16V was deployed to production.
- Do not call POST `/official-import`, do not call the RPC directly and do not
  write real genealogy data while production deploy evidence is missing.

Rationale:

- A-16V apply/verify PASS proves the DB-side transaction branch is ready, but
  it does not prove production runtime is running the matching code.
- Prior A-16U evidence showed the import UI visible, but the dangerous import
  execution bundle requires fresh A-16V production deploy evidence before the
  execution gate can be reached.
- Stopping before import preserves the no-blind-retry rule and keeps created
  people/relationship counts at `0/0`.

## Decision 256 - A-16V apply verification PASS allows a future A-16R retry gate

Date: 2026-07-03

Status: Accepted

Decision:

- Record owner-provided A-16V manual apply/verify as PASS because the raw
  verification output includes PASS for every required A-16V row.
- Mark `A16V_REAL_TRANSACTION_BRANCH_READY=YES`.
- Mark `A16R_RETRY_ALLOWED_AFTER_A16V=YES`, but only for a future separate
  prompt with the exact session-specific marker.

Rationale:

- The previous A-16V blocker was the marker verification row; owner evidence now
  shows `A16V marker,PASS`.
- Security and transaction evidence also show PASS: not security definer, fixed
  search_path, no anon/public execute grants, no auto trigger, idempotency,
  rollback manifest and audit tables.
- This decision does not execute official import and does not itself open A-16R.

## Decision 255 - A-16V marker verification fix uses COMMENT ON FUNCTION

Date: 2026-07-03

Status: Accepted

Decision:

- Fix the remaining `A16V marker = FAIL` verification row with a metadata-only
  `COMMENT ON FUNCTION` candidate.
- Keep transaction logic unchanged because owner verification already showed the
  all-or-nothing, audit, rollback, idempotency and security checks PASS.
- Keep A-16V apply/verify blocked until owner manually applies 0017 and reruns
  the SELECT-only verification SQL.

Rationale:

- The marker was present in the 0016 SQL file header but that header is not
  persisted in database metadata after apply.
- `obj_description(function_oid, 'pg_proc')` can safely read the persisted
  function comment without calling the RPC or mutating data.
- This avoids replacing the function body just to add an evidence marker.

## Decision 254 - A-16V real execution branch remains a not-applied SQL candidate

Date: 2026-07-03

Status: Accepted

Decision:

- Create the A-16V official import real transaction execution branch as a
  reviewable SQL candidate and keep runtime fail-closed until a later owner
  manual apply/verify phase.
- Keep `public.a16p_tx_execute_giapha4_official_import` as the canonical RPC
  name instead of creating a parallel execution path.
- Keep `canRunOfficialImport=false` with blocker
  `A16V_BLOCKED_REAL_TRANSACTION_BRANCH_NOT_APPLIED_OR_VERIFIED`.

Rationale:

- A-16R retry proved the owner marker can match, but execution stayed blocked
  because the real transaction branch was not ready.
- The safe next step is a not-applied SQL candidate with SELECT-only
  verification, not a direct import run.
- A future A-16R retry is allowed only after A-16V apply/verify PASS and a fresh
  owner prompt with the exact session-specific marker.

## Decision 243 - A-16R retry stops at execution gate when runtime remains fail-closed

Date: 2026-07-03

Status: Accepted

Decision:

- Treat the owner marker for session
  `2af4bfb6-a20e-453e-9804-1b8c0afbdd68` as matched for the A-16R retry
  prompt.
- Stop the bundle at Phase 2 with
  `A16R_RUN_RETRY_BUNDLE_STATUS=BLOCKED_AT_EXECUTION_GATE` and
  `A16R_RUN_RETRY_STATUS=BLOCKED_TRANSACTION_BRANCH_NOT_READY`.
- Do not call POST `/official-import` when the local runtime still returns
  `status: "BLOCKED"`, `canRunOfficialImport: false` and
  `A16U_LOCKED_TRANSACTION_BRANCH_READY_NOT_EXECUTED`.
- Keep post-import verification as
  `A16R_RUN_RETRY_POST_IMPORT_VERIFY_STATUS=NOT_RUN_EXECUTION_GATE_BLOCKED`.

Rationale:

- A session-specific marker is necessary but not sufficient for a dangerous
  official import execution. The runtime branch must also be a real execution
  implementation, not only a locked contract.
- Calling the official import route while the branch remains fail-closed would
  create misleading evidence and could blur the no-blind-retry rule.

Consequences:

- No POST official import call, no direct RPC, no DB push, no SQL, no seed, no
  deploy, no push and no real people/relationship/family/layout/tree/revision
  write occurred in this bundle.
- Created people and relationship counts remain `0`.
- A later execution phase must first implement and verify a real transaction
  execution branch, then obtain an explicit owner approval prompt again.

## Decision 242 - A-16U post-deploy smoke accepts owner UI visibility while keeping import locked

Status: `ACTIVE`

Chon:

- Record
  `PRODUCTION_IMPORT_UI_POST_DEPLOY_SMOKE_STATUS=PASS_OWNER_UI_VISIBLE`.
- Use owner visual evidence that the Gia Pha 4 Excel upload UI is visible on
  production at `/admin/exports/import`.
- Do not claim automated HTTP PASS from local when the local network/TLS smoke
  is inconclusive.
- Keep official import locked with `canRunOfficialImport=false` and the button
  disabled.

Ly do:

- The previous phase proved source readiness but blocked on missing manual
  deploy evidence. Owner now reports the production UI is visible after deploy.
- The visible upload UI is only the staging upload surface. It is not evidence
  that official import execution is open or has run.
- The official import route/RPC/real genealogy writes remain separated behind a
  future explicit approval phase.

Boundaries:

- No SQL run, no DB push, no migration repair, no seed, no RPC call, no POST
  official import call, no real genealogy write, no deploy and no push.

## Decision 241 - A-16U production import UI needs manual deploy evidence after push

Status: `ACTIVE`

Chon:

- Record
  `PRODUCTION_IMPORT_UI_STATUS=BLOCKED_NOT_DEPLOYED_AFTER_PUSH`.
- Treat GitHub push as source publication only, not production deployment.
- Keep the correct admin import route as `/admin/exports/import`.
- Keep public homepage `/` out of scope for Excel upload visibility.
- Keep official import locked with `canRunOfficialImport=false` and the button
  disabled.

Ly do:

- `.github/workflows/cloudflare-deploy.yml` uses `workflow_dispatch` only and
  deploys only when owner manually runs the Cloudflare Deploy workflow.
- Owner reported only a GitHub push after commit
  `8c39f685731fa558155fa710ed495a9491c815e2`; no manual deploy run evidence was
  provided in this phase.
- Source still contains the Gia Pha 4 upload UI and upload route, so the most
  likely reason production does not show the form is either wrong route/auth
  state or production still running an older deployed Worker version.

Boundaries:

- No SQL run, no DB push, no migration repair, no seed, no RPC call, no POST
  official import call, no real genealogy write, no deploy and no push.

## Decision 240 - A-16T PASS opens only a locked A-16U transaction branch candidate

Status: `ACTIVE`

Chon:

- Record
  `A16T_APPLY_VERIFY_STATUS=PASS_OWNER_APPLIED_AND_VERIFIED` from owner-provided
  verification rows.
- Treat `forbidden_grant_count=0` and `forbidden_policy_count=0` as closing the
  A-16T grant/RLS hardening blocker.
- Set
  `A16U_STATUS=A16U_LOCKED_TRANSACTION_BRANCH_READY_NOT_EXECUTED`.
- Do not create SQL candidate `20260702_0016` because A-16T already provides
  the verified audit batch, rollback manifest and idempotency persistence
  required for this locked runtime contract.
- Keep `canRunOfficialImport=false` and the official import button disabled.
- Require the future marker
  `APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68`
  before any later execution phase may call the official import route.

Ly do:

- Owner supplied real verification output for both A-16T schema and grant/RLS
  hardening. The output includes table/column checks, idempotency unique guards,
  RLS, authenticated policies, no anon/public grant/policy, no auto import
  trigger and RPC not public.
- A-16U can now prepare the all-or-nothing transaction branch contract, but the
  bundle explicitly forbids running official import, calling RPC, calling POST
  `/official-import`, or writing real genealogy data.
- Keeping the runtime locked preserves the separate A-16R-RUN-RETRY approval
  boundary.

Boundaries:

- No SQL run, no DB push, no migration repair, no seed, no RPC call, no POST
  official import call, no real people/person write, no relationship/family
  write, no layout/tree/revision/profile write, no deploy and no push.

## Decision 239 - A-16T remains blocked when latest PASS-to-A16U evidence is placeholder only

Status: `ACTIVE`

Chon:

- Keep
  `A16T_APPLY_VERIFY_STATUS=BLOCKED_VERIFY_EVIDENCE_INSUFFICIENT_OR_FAILED`.
- Treat
  `A16T_OWNER_VERIFY_EVIDENCE_STATUS=INSUFFICIENT_PLACEHOLDER_ONLY` as a hard
  blocker for A-16U.
- Keep `A16U_STATUS=NOT_STARTED_A16T_VERIFY_BLOCKED`.
- Do not create A-16U SQL candidate, runtime wiring or verify runbook.
- Keep `canRunOfficialImport=false` and the official import button disabled.

Ly do:

- The latest A-16T-PASS-TO-A16U bundle still did not include actual SQL
  verification rows after owner manual apply.
- A-16T PASS requires proof for `official_import_batches`,
  `official_import_rollback_manifests`, idempotency guard, RLS, no anon/public
  access and no auto import trigger.
- Proceeding to A-16U with placeholder evidence would fake apply verification
  and blur the official import execution gate.

Boundaries:

- No SQL run, no DB push, no migration repair, no seed, no RPC call, no POST
  official import call, no real people/person write, no relationship/family
  write, no layout/tree/revision/profile write, no deploy and no push.

## Decision 238 - A-16T grant hardening uses revoke-only candidate and keeps runtime locked

Status: `ACTIVE`

Chon:

- Create a NOT_APPLIED SQL candidate to revoke anon/PUBLIC grants from
  `public.official_import_batches` and
  `public.official_import_rollback_manifests`.
- Preserve authenticated policies and do not create replacement grants.
- Add a SELECT-only verification SQL file for owner rerun after manual apply.
- Keep `canRunOfficialImport=false` and the official import button disabled.
- Keep A-16U blocked until the hardening candidate is owner-applied and
  verification reports no anon/PUBLIC grant blocker.

Ly do:

- Owner verification proved the A-16T schema, columns, unique guards, RLS and
  authenticated policies exist, but
  `A16T_NO_ANON_OR_PUBLIC_POLICY_OR_GRANT=FAIL` with
  `forbidden_grant_count=14`.
- The narrowest safe fix is revoking anon/PUBLIC privileges from the two
  A-16T audit/rollback tables, without deleting valid authenticated policies or
  opening official import execution.

Boundaries:

- No SQL run by Codex, no DB push, no migration repair, no seed, no RPC call,
  no POST official import call, no real people/person write, no
  relationship/family write, no layout/tree/revision/profile write, no deploy
  and no push.

## Decision 237 - A-16T PASS-to-A-16U bundle stops when verification evidence is placeholder only

Status: `ACTIVE`

Chon:

- Treat the A-16T-PASS-TO-A16U bundle as blocked at Phase 1 because the prompt
  did not include actual owner verification SQL output.
- Record
  `A16T_APPLY_VERIFY_STATUS=BLOCKED_VERIFY_EVIDENCE_INSUFFICIENT_OR_FAILED`.
- Do not start A-16U transaction branch, locked runtime wiring or verify
  runbook work.
- Keep `canRunOfficialImport=false` and the official import button disabled.

Ly do:

- The prompt contained the placeholder text for pasting verification results,
  not the verification result itself.
- A-16U requires confirmed A-16T apply/verify PASS. Proceeding without actual
  evidence would fake PASS and blur the DB apply verification boundary.

Boundaries:

- No SQL run, no DB push, no migration repair, no seed, no RPC call, no POST
  official import call, no real people/person write, no relationship/family
  write, no layout/tree/revision/profile write, no deploy and no push.

## Decision 236 - A-16T apply verification stays blocked without owner evidence

Status: `ACTIVE`

Chọn:

- Record
  `A16T_APPLY_VERIFY_STATUS=BLOCKED_NO_ANON_PUBLIC_GRANT_FAILED_PENDING_HARDENING_FIX`.
- Do not mark the A-16T schema as applied or verified until owner provides
  verification output from the SELECT-only verification SQL.
- Keep runtime fail-closed with `canRunOfficialImport=false` and the official
  import button disabled.
- Keep A-16U transaction branch blocked until A-16T apply/verify evidence is
  available.

Lý do:

- A-16T created a not-applied schema candidate, but this prompt does not include
  owner evidence that the SQL was manually applied and verified.
- Recording a PASS without owner verification would collapse the candidate/apply
  boundary and risk opening a real import path on unverified schema state.

Boundaries:

- No SQL run, no DB push, no migration repair, no seed, no RPC call, no POST
  official import call, no real people/person write, no relationship/family
  write, no layout/tree/revision/profile write, no deploy and no push.

## Decision 235 - A-16T uses separate official import audit tables before opening execution

Status: `ACTIVE`

Chọn:

- Create a not-applied additive SQL candidate for official import audit batch,
  rollback manifest and idempotency persistence.
- Use `public.official_import_batches` for durable official import batch audit
  and idempotency.
- Use `public.official_import_rollback_manifests` for durable rollback manifest
  persistence.
- Keep the candidate mirrored byte-for-byte under `supabase/migrations`.
- Keep `A16T_STATUS=CANDIDATE_READY_NOT_APPLIED`.
- Keep official import runtime fail-closed with `canRunOfficialImport=false`
  and the UI button disabled.
- Do not widen `revisions.action` in this phase; record
  `A16T_REVISION_ACTION_STRATEGY=SEPARATE_OFFICIAL_IMPORT_BATCH_TABLE`.

Lý do:

- `revisions.action` is currently constrained to create/update/delete/restore.
  A separate batch table is a narrower additive schema for official import audit
  evidence than changing the existing revision action contract.
- A future A-16U execution branch needs durable proof for idempotency, audit
  batch creation, rollback manifest creation and post-import counts before it
  may write real genealogy tables.
- The schema candidate must remain owner-reviewed and not applied by Codex in
  A-16T.

Boundaries:

- No SQL run, no DB push, no migration repair, no seed, no RPC call, no POST
  official import call, no real people/person write, no relationship/family
  write, no layout/tree/revision/profile write, no deploy and no push.

## Decision 234 - A-16S blocks official import transaction branch until audit rollback idempotency schema is sufficient

Status: `ACTIVE`

Chọn:

- Do not create an A-16S SQL execution candidate yet.
- Record
  `A16S_STATUS=BLOCKED_SCHEMA_AUDIT_ROLLBACK_IDEMPOTENCY_INSUFFICIENT`.
- Keep official import runtime fail-closed with `canRunOfficialImport=false` and
  the UI button disabled.
- Add A-16S blocker constants to
  `lib/import/giapha4/official-import-service.ts` without opening execution.
- Require a future schema/contract phase before any transaction execution branch
  can be proposed.

Lý do:

- A real official import branch must prove all-or-nothing writes, durable audit,
  rollback manifest persistence and idempotency.
- Current schema has import write-manifest JSON columns, but the existing
  A-16P-TX contract already warns stronger persistence may require a schema
  phase.
- `revisions.action` currently only supports create/update/delete/restore, not a
  batch official import audit action.
- Writing a best-effort multi-table SQL function would violate the A-16S
  fail-closed rule.

Boundaries:

- No SQL run, no DB push, no migration repair, no seed, no RPC call, no POST
  official import call, no real people/person write, no relationship/family
  write, no layout/tree/revision/profile write, no deploy and no push.

## Decision 233 - A-16R official import remains blocked until a real transaction branch exists

Status: `ACTIVE`

Chọn:

- Accept that the A-16R session-specific marker matched for session
  `2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
- Do not run official import because the current implementation does not have a
  real all-or-nothing execution branch.
- Treat `A16R_RUN_STATUS=BLOCKED_REAL_TRANSACTION_EXECUTION_BRANCH_NOT_READY`
  as the correct fail-closed result.
- Keep `canRunOfficialImport=false` and the official import button disabled.
- Record post-import verification as not run because no import executed:
  `A16R_POST_IMPORT_VERIFICATION_STATUS=NOT_RUN_IMPORT_NOT_EXECUTED`.

Lý do:

- `lib/import/giapha4/official-import-service.ts` still returns
  `status: "BLOCKED"` and includes transaction-helper blockers.
- The A-16P-TX SQL helper still contains
  `REAL_EXECUTION_BRANCH_NOT_OPEN_IN_A16P_TX` and returns zero created rows.
- The prompt explicitly forbids best-effort multi-table inserts when the real
  transaction branch is missing.

Boundaries:

- No DB push, no migration repair, no seed, no deploy, no push, no Excel/secret/
  env/storage-state commit, no POST official import call, no RPC call, no real
  people/person write, no relationship/family write, no layout/tree/revision/
  profile write and no temporary import implementation.

## Decision 232 - A-16R keeps official import closed until session-specific owner marker

Status: `ACTIVE`

Chọn:

- Record A-16R preflight evidence for session
  `2af4bfb6-a20e-453e-9804-1b8c0afbdd68` without running the official import.
- Treat current evidence as preflight-ready:
  people `102`, relationships `134`, validation errors `0`, dry-run blockers
  `0`, duplicate unresolved `0`, duplicate needs_review `0`, duplicate
  create_new `8`.
- Keep rollback and audit plan references mandatory before execution:
  `docs/PLAN_A16M_OFFICIAL_IMPORT_TRANSACTION_ROLLBACK_AUDIT_DESIGN.md` and
  `docs/PLAN_A16P_TX_ROLLBACK_AUDIT_MANIFEST_CONTRACT.md`.
- Require a separate future prompt with exact marker
  `APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68`
  before any execution phase may consider opening official import.
- Keep `canRunOfficialImport=false` and the official import button disabled in
  this bundle.

Lý do:

- The duplicate blocker is resolved by owner evidence, but official import is a
  real genealogy write boundary. The safe next step is to prepare final
  preflight, runbook and approval gate artifacts while preserving a
  session-specific approval marker.

Boundaries:

- No SQL run by Codex, no DB push, no migration repair, no seed, no RPC call, no
  POST official import call, no real people/person write, no relationship/family
  write, no layout/tree/revision/profile write, no auto people/relationship
  creation, no deploy and no push.

## Decision 231 - A-16Q-DUP-DECISION-VERIFY records duplicate blocker completion by owner evidence

Status: `ACTIVE`

Chọn:

- Accept owner SQL evidence for session
  `2af4bfb6-a20e-453e-9804-1b8c0afbdd68` as the verification record for
  duplicate decision completion.
- Record `create_new=8`, `unresolved=0` and `needs_review=0`.
- Treat the duplicate blocker as complete for unresolved/needs_review rows
  based on owner evidence.
- Keep `create_new` as staging-only owner intent; do not create real people or
  relationships in this phase.
- Keep official import locked with `canRunOfficialImport=false` and disabled UI
  button until a later explicit execution phase.

Lý do:

- Owner has already handled all duplicate rows and provided the grouped SQL
  result. The safe next step is to record the evidence and preserve the
  execution boundary, not to run import.

Boundaries:

- No SQL run by Codex, no DB push, no migration repair, no seed, no RPC call, no
  POST official import call, no real people/person write, no relationship/family
  write, no layout/tree/revision/profile write, no auto duplicate decision, no
  deploy and no push.

## Decision 230 - A-16Q-DUP-DECISION-UX-FIX treats saved staging decisions as UI baseline

Status: `ACTIVE`

Chọn:

- Use each duplicate candidate's saved `ownerDecision` and `decisionNote` as the
  baseline for the UI draft.
- Show `Đã lưu quyết định` for saved `create_new`, `ignore_candidate`,
  `link_existing` and `needs_review` rows.
- Keep saved `create_new` rows selected as `Tạo người mới` after refresh.
- Treat `needs_review` as saved but still blocking official import.
- Treat `unresolved` as not decided and blocking official import.
- Enable `Lưu quyết định` only when the owner changes the decision or note.
- Keep `Đã lưu` disabled for clean saved rows and show `Đang lưu...` during
  save.
- Keep duplicate decisions owner-driven; no automatic `create_new`,
  `ignore_candidate` or `link_existing` decision is made by code.

Lý do:

- Owner evidence showed session `2af4bfb6-a20e-453e-9804-1b8c0afbdd68` had
  `create_new,8` persisted in DB, so the UI must not look like those rows are
  still unsaved.
- The safest UX is to compare the editable draft against the saved staging row
  and only allow a new PATCH when the owner has made a real change.

Boundaries:

- No SQL run, no DB push, no migration repair, no seed, no RPC call, no POST
  official import call, no real people/person write, no relationship/family
  write, no layout/tree/revision/profile write, no auto duplicate decision, no
  deploy and no push.

## Decision 229 - A-16Q-DUP-LIVE-SAVE-FIX binds duplicate save UI to the active session

Status: `ACTIVE`

Chọn:

- Treat live `DUPLICATE_DECISION_NOT_IN_SESSION` as a stale UI session/list
  binding failure, not as permission escalation.
- Remount duplicate decision UI by current `session.id` and `session.updatedAt`.
- Reset local duplicate candidates, drafts, save notice and saved marker whenever
  the active session or duplicate candidate list changes.
- Show `Danh sách ứng viên trùng đã cũ, vui lòng tải lại phiên nhập.` and
  disable saving if the client detects stale duplicate list state.
- Keep PATCH using duplicate candidate UUID from `candidate.id`; never use
  `sourceRowIndex` as the duplicate route id.
- Keep owner-driven decisions only; no auto `create_new`, `link_existing` or
  `ignore_candidate`.

Lý do:

- After a new manifest upload, the visible session can change faster than the
  client-local duplicate state. Sending an old duplicate id under a new
  `sessionId` correctly triggers `DUPLICATE_DECISION_NOT_IN_SESSION`.
- The safe repair is to bind UI state to the active session and fail closed with
  a reload message, while preserving server-side session membership checks.

Boundaries:

- No SQL run, no DB push, no migration repair, no seed, no RPC call, no POST
  official import call, no real people/person write, no relationship/family
  write, no layout/tree/revision/profile write, no auto duplicate decision, no
  deploy and no push.

## Decision 228 - A-16Q-DUP-SAVE-FIX keeps RLS and adds duplicate save diagnostics

Status: `ACTIVE`

Chọn:

- Keep duplicate decision writes on the normal user-scoped Supabase client and
  do not bypass RLS.
- Verify duplicate membership from the session review list before attempting
  the staging update.
- Keep the update constrained to `import_duplicate_candidates` and only
  `owner_decision`, `decided_by`, `decided_at`, `decision_note`.
- Return explicit diagnostic codes for invalid value, duplicate not in session,
  link-existing without existing person, RLS/update denial and save success.
- Hide `link_existing` in the UI when `existing_person_id=null`.
- Keep official import locked.

Lý do:

- Owner evidence showed the old UI message mixed not-found and permission
  cases, making the save failure hard to diagnose.
- Supabase UPDATE under RLS can fail by returning no row, especially if the row
  is not visible/updatable for the authenticated user.
- The current 8 duplicate candidates have `existing_person_id=null`, so
  `link_existing` should not be offered for those rows.

Boundaries:

- No SQL run, no DB push, no migration repair, no seed, no RPC call, no POST
  official import call, no real people/person write, no relationship/family
  write, no layout/tree/revision/profile write, no auto duplicate decision, no
  deploy and no push.

## Decision 227 - A-16Q-FIX3 treats lunar death date contradiction as review warning

Status: `ACTIVE`

Chọn:

- Add `calendar_conflict` for Gia Phả 4 death date validation when the death
  value matches lunar anniversary or notes include a pattern like
  `tức ngày ... âm lịch`.
- Treat row 95 sanitized case as warning
  `death_date_calendar_conflict_needs_review`, not error
  `death_before_birth`.
- Keep `death_before_birth` as an error only for certain same-calendar checks
  with full precision or a certain year-before-birth condition.
- Keep duplicate decision save owner-driven; no automatic duplicate decision
  is made by code.
- Keep `canRunOfficialImport=false` and the official import button disabled.

Lý do:

- Owner evidence shows the death value `28/4/2014` conflicts with the column
  label because it also appears as lunar anniversary and notes say
  `tức ngày ... âm lịch`.
- Comparing a likely lunar or calendar-conflicted death value directly against
  solar birth date would create a false blocker.
- The safe action is to preserve the source data and ask the owner to confirm
  the calendar before official import.

Boundaries:

- No SQL run, no DB push, no migration repair, no seed, no RPC call, no POST
  official import call, no real people/person write, no relationship/family
  write, no layout/tree/revision/profile write, no auto duplicate decision, no
  deploy and no push.

## Decision 226 - A-16Q-DUP-RLS-VERIFY enables staging-only duplicate decision write

Status: `ACTIVE`

Chọn:

- Accept owner evidence markers:
  `A16Q_DUP_RLS_OWNER_APPLY_CONFIRMED` and
  `A16Q_DUP_RLS_VERIFY_PASS_CONFIRMED`.
- Enable
  `PATCH /api/admin/import-sessions/[sessionId]/duplicates/[duplicateId]` only
  after owner-confirmed manual RLS apply and verification PASS.
- Limit the PATCH implementation to staging table
  `import_duplicate_candidates`.
- Limit writable columns to `owner_decision`, `decided_by`, `decided_at` and
  `decision_note`.
- Enable the UI “Lưu quyết định” action for duplicate candidates.
- Keep `canRunOfficialImport=false` and keep the official import button
  disabled.

Lý do:

- Owner has confirmed the RLS UPDATE candidate was manually applied and the
  SELECT-only verification passed, so the staging write path can open.
- Duplicate decision save is still not an official import; it only records
  owner intent in the import staging area.
- There are still 8 unresolved duplicate rows in the owner evidence, so the
  future official import gate must remain locked.

Boundaries:

- No SQL run by Codex, no DB push, no migration repair, no seed, no RPC call,
  no POST official import call, no real people/person write, no relationship/
  family write, no layout/tree/revision/profile write, no auto merge, no auto
  link, no deploy and no push.

## Decision 225 - A-16Q-DUP-RLS-VERIFY keeps UI write blocked without owner apply/verify evidence

Status: `ACTIVE`

Chọn:

- Treat A-16Q-DUP-RLS-VERIFY-UI-WRITE as blocked because the prompt lacks both
  required owner evidence markers:
  `A16Q_DUP_RLS_OWNER_APPLY_CONFIRMED` and
  `A16Q_DUP_RLS_VERIFY_PASS_CONFIRMED`.
- Do not create active
  `PATCH /api/admin/import-sessions/[sessionId]/duplicates/[duplicateId]`.
- Keep duplicate decision UI save disabled and read-only.
- Keep `canEditDecisions=false`, `canRunOfficialImport=false` and the official
  import button disabled.
- Require a later prompt with both markers before opening staging decision write
  behavior.

Lý do:

- UPDATE RLS for duplicate decision is a staging write capability and cannot be
  assumed from a candidate file alone.
- Supabase UPDATE policies need appropriate SELECT visibility plus UPDATE
  policy checks; without owner-confirmed apply/verify, enabling UI write would
  be misleading and unsafe.
- There are still 8 unresolved duplicate rows, so A-16R cannot run.

Boundaries:

- No SQL run, no DB push, no migration repair, no seed, no RPC call, no POST
  official import call, no real people/person write, no relationship/family
  write, no layout/tree/revision/profile write, no deploy and no push.

## Decision 224 - A-16Q-DUP keeps duplicate decision save locked until UPDATE RLS is applied

Status: `ACTIVE`

Chọn:

- Add read-only duplicate candidate review UI/API for import session
  `8158711d-1c3c-4208-987d-6fec6a1c5a1a`.
- Do not create an active PATCH route because `import_duplicate_candidates`
  currently has owner-scoped SELECT/INSERT but no safe UPDATE policy for
  decision fields.
- Record blocker:
  `A16Q_DUP_STATUS=BLOCKED_DUPLICATE_DECISION_RLS_UPDATE_MISSING`.
- Create a not-applied SQL candidate that narrows UPDATE to
  `owner_decision`, `decided_by`, `decided_at` and `decision_note`, owner-scoped
  by `imports.create` and `created_by=current_profile_id()`.
- Treat `unresolved`, `needs_review` and legacy `hold` duplicate decisions as
  blockers for official import.
- Keep `canRunOfficialImport=false` and UI official import buttons disabled.

Lý do:

- Owner evidence shows 8 duplicate candidates and 8 unresolved duplicate rows,
  so A-16R cannot safely run.
- Saving duplicate decisions is a staging write and needs an explicit RLS
  update policy before the UI can enable it.
- The current schema used legacy `hold/skip`; the candidate adds
  `needs_review/ignore_candidate` while preserving legacy aliases to avoid
  breaking existing staging rows.
- Read-only review is useful now, but active writes must wait for a separate
  apply/verify phase.

Boundaries:

- No SQL run, no DB push, no migration repair, no seed, no RPC call, no POST
  official import call, no real people/person write, no relationship/family
  write, no layout/tree/revision/profile write, no deploy and no push.

## Decision 223 - A-16Q-LOCAL-UI refreshes official import gate to A-16R wording

Status: `ACTIVE`

Chọn:

- Record localhost import UI smoke as `SAFE_SKIP_MISSING_AUTH` because
  `/admin/exports/import` loaded but the auth gate blocked the import panel.
- Prefer Chrome logged-in smoke through CDP when available, while forbidding
  cookie/localStorage/token/profile/storage-state reads or writes.
- Replace stale official import gate copy that referenced the A-16P runtime
  candidate marker with current session-specific A-16R wording.
- Keep the official import button disabled and keep `canRunOfficialImport=false`.
- Require a future marker of the form
  `APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_<SESSION_ID>` before any real
  execution phase.

Lý do:

- A-16P runtime candidate and A-16P-TX transaction helper verification are no
  longer the current blocker wording.
- The next risky step is session-specific execution approval, not generic A-16P
  readiness.
- Without auth, local UI smoke cannot safely read session id or counts.
- Without Playwright runtime or Chrome CDP availability, the CDP smoke must
  safe-skip rather than fail or open a separate auth context.

Boundaries:

- No SQL run, no DB push, no migration repair, no seed, no RPC call, no POST
  official import call, no real people/person write, no relationship/family
  write, no layout/tree/revision/profile write, no deploy and no push.

## Decision 222 - A-16Q-FIX2 separates uncertain row 95 dates and preview sample counts

Status: `ACTIVE`

Chọn:

- Route date-order validation through `diagnoseDeathBeforeBirth` so uncertain
  cases are warnings before any `death_before_birth` blocker is created.
- Keep row 95 regression evidence sanitized: row number, precision/calendar
  metadata and expected severity only; no full name or raw personal row data.
- Treat unknown death calendar, calendar mismatch and same-year partial
  precision as warning-only cases.
- Use session total counts for total staging people/relationships and expose
  preview sample counts separately.
- Keep official import locked with `canRunOfficialImport=false` and disabled UI
  button.

Lý do:

- Owner confirmed row 95 is not safe to block as a definite
  `death_before_birth` case without calendar/precision certainty.
- The apparent 102/134 vs 100/100 mismatch came from a preview limit, not from
  the import losing rows.
- UI must show total staging and preview sample count as separate concepts.

Boundaries:

- No SQL run, no DB push, no migration repair, no seed, no RPC call, no POST
  official import call, no real people/person write, no relationship/family
  write, no layout/tree/revision/profile write, no deploy and no push.

## Decision 221 - A-16Q-FIX uses precision-aware death date validation

Status: `ACTIVE`

Chọn:

- Treat Gia Phả 4 birth/death date comparisons as precision-aware.
- Keep `death_before_birth` as an ERROR only when `deathYear < birthYear`, or
  when both birth/death share the same known calendar type, are full precision
  and `deathDate < birthDate`.
- Treat same-year death with year-only, missing month/day, different calendar
  type or unknown death calendar type as a warning, not a blocker.
- Treat `Ngày Sinh` as solar, `Ngày mất` as solar/lunar/unknown, and
  `Ngày giỗ` as lunar in Gia Phả 4 staging metadata where available.
- Document owner-confirmed rows 19 and 95 as same-year infant death cases that
  should not block on incomplete date precision.
- Assess `crxlauncher=""` hydration mismatch on `<html>` as likely browser
  extension injection; do not change `app/layout.tsx` without app-side evidence.
- Keep official import locked with `canRunOfficialImport=false` and disabled UI
  button.

Lý do:

- Year-only source data cannot prove the death date is before the birth date.
- Solar birth dates and lunar/unknown death dates cannot be compared directly as
  one calendar.
- Defaulting missing month/day to January 1 creates false blockers for valid
  same-year infant death cases.
- Hydration suppression would hide a browser-extension symptom without evidence
  that the app layout is wrong.

Boundaries:

- No SQL run, no DB push, no migration repair, no seed, no RPC call, no POST
  official import call, no real people/person write, no relationship/family
  write, no layout/tree/revision/profile write, no deploy and no push.

## Decision 220 - A-16Q remains blocked without session-specific approval data

Status: `ACTIVE`

Chọn:

- Do not open A-16Q approval because the current prompt does not provide both
  `APPROVE_A16Q_OFFICIAL_IMPORT_SESSION_EXECUTION` as a session-specific owner
  approval record and `A16Q_IMPORT_SESSION_ID=<uuid>`.
- Record blocker status:
  `A16Q_STATUS=BLOCKED_MISSING_MARKER_OR_SESSION_ID`.
- Keep official import locked: no RPC call, no POST official import call,
  `canRunOfficialImport=false` and UI button disabled.

Lý do:

- A-16Q is dangerous/strict and must bind approval to one exact import session.
- The prompt only describes the required marker/session id contract; it does
  not include an actual `A16Q_IMPORT_SESSION_ID=<uuid>` value.
- Recording a generic approval without a session id would create ambiguity for
  A-16R and could lead to accidental mutation of real genealogy tables.

Boundaries:

- No import run, no RPC call, no POST official import call, no migration, no
  SQL run, no DB push, no migration repair, no seed, no RLS change, no
  anon/public grant, no real people/person write, no relationship/family write,
  no layout/tree/revision/profile write, no deploy and no push.
- A-16R may only be considered after owner provides:
  `APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_<SESSION_ID>`.

## Decision 219 - A-16P-TX manual apply is recorded as verified but official import remains locked

Status: `ACTIVE`

Chọn:

- Accept owner-provided evidence that the A-16P-TX SQL candidate was manually
  applied through Supabase Dashboard.
- Accept owner-provided SELECT-only verification PASS for
  `public.a16p_tx_execute_giapha4_official_import`.
- Keep runtime behavior unchanged: no RPC call, no POST official import call,
  `canRunOfficialImport=false` and UI official import button disabled.
- Treat the function comment `NOT_APPLIED` as a preserved candidate guardrail
  comment, not as the current operational status.

Lý do:

- Owner already performed manual SQL apply and verification outside this phase.
- The verified function still fails closed and does not open real genealogy
  writes, so this phase should record evidence only rather than re-run DB work.
- A-16Q needs a session-specific execution approval marker before any official
  import execution can be considered.

Boundaries:

- No SQL run, no `supabase db push`, no migration repair, no seed, no RPC call,
  no POST official import call, no real people/person write, no
  relationship/family write, no layout/tree/revision/profile write, no deploy
  and no push.
- Future execution requires:
  `APPROVE_A16Q_OFFICIAL_IMPORT_SESSION_EXECUTION`.

## Decision 218 - A-16P-TX creates transaction helper SQL candidate only

Status: `ACTIVE`

Chọn:

- Add a not-applied SQL/RPC candidate:
  `public.a16p_tx_execute_giapha4_official_import`.
- Keep canonical SQL under `db/migrations` and mirror it byte-for-byte under
  `supabase/migrations`.
- Add SELECT-only verification SQL for future owner/manual apply verification.
- Keep the candidate fail-closed: no real execution branch, no people write, no
  relationship/family write, no layout/tree/revision write.
- Align the A-16P runtime service to know the RPC contract name while keeping
  `canRunOfficialImport=false` and adding blocker
  `BLOCKED_TRANSACTION_HELPER_NOT_APPLIED`.

Lý do:

- A-16P correctly blocked on `A16P_BLOCKED_TRANSACTION_HELPER_MISSING`; official
  import needs one all-or-nothing DB boundary.
- Existing revision/audit schema does not yet provide an official import batch
  audit action, so the candidate must not fake audit/rollback persistence.
- Creating a reviewed candidate plus checker lets the owner review SQL before
  any manual apply phase.

Boundaries:

- Candidate not applied.
- A-16P official import remains blocked until SQL apply/verify in a separate
  phase.
- Future manual apply requires marker
  `APPROVE_A16P_TX_RPC_MANUAL_SQL_APPLY`.
- Future session-specific execution requires marker
  `APPROVE_A16Q_OFFICIAL_IMPORT_SESSION_EXECUTION`.
- No DB apply, no SQL run, no `supabase db push`, no migration repair, no seed,
  no RPC call, no POST official import call, no real people/person write, no
  relationship/family write, no layout/tree/revision/profile write, no deploy
  and no push.

## Decision 217 - A-16P creates a locked official import candidate and blocks on missing transaction helper

Status: `ACTIVE`

Chọn:

- Accept the owner marker
  `APPROVE_A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE` as approval to create a
  runtime candidate for review.
- Add POST route candidate
  `/api/admin/import-sessions/[sessionId]/official-import`, but keep it
  fail-closed by `A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED=false`.
- Require strict server-side confirmation body before any future execution:
  `confirmMarker`, `confirmSessionId`, `confirmNoValidationErrors`,
  `confirmRollbackReviewed` and `confirmAuditReviewed`.
- Add official import service candidate that reads staging/review/dry-run data
  and returns blocker `A16P_BLOCKED_TRANSACTION_HELPER_MISSING`.
- Keep UI disabled and avoid any client caller for POST official import.

Lý do:

- Existing people, relationship and revision services use separate Supabase
  client writes; the repo does not currently have a safe RPC/transaction helper
  for all-or-nothing people, relationships, audit and rollback.
- A best-effort multi-table insert would violate the A-16P boundary and could
  create partial import risk.

Boundaries:

- No official import executed, no POST route called, no people/person write, no
  relationship/family write, no layout/tree/revision/profile write, no
  migration, no `supabase db push`, no SQL apply, no seed, no deploy and no
  push.
- Execution requires a later phase: either A-16P-TX for transaction
  RPC/schema readiness or A-16Q after transaction, rollback, audit and exact
  session-specific owner approval are complete.

## Decision 216 - A-16I4U/A-16M/A-16N/A-16O keeps official Gia Pha 4 import locked until A-16P

Status: `ACTIVE`

Chọn:

- Record owner-confirmed manual UI staging upload evidence for the real Gia Pha
  4 workbook: sheet `Thành viên`, `102` staged members and `134` parent
  relationship candidates.
- Treat the evidence as staging-only proof, not official import readiness.
- Design the official import transaction, rollback manifest, audit/revision
  trail and no-go conditions in documentation only.
- Add a locked read-only official import preflight gate:
  `GET /api/admin/import-sessions/[sessionId]/official-import-gate`.
- Keep UI action disabled and require future owner marker
  `APPROVE_A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE` before any runtime candidate
  can write real genealogy tables.

Lý do:

- A-16I3/A-16I4/A-16I5 plus owner manual UI upload prove staging can parse the
  real workbook, but the project still needs transaction, rollback, audit,
  duplicate handling and approval rules before official import.
- A locked preflight gate gives owner/operator visibility without creating a
  POST/PUT/PATCH/DELETE import path.

Boundaries:

- No migration, no `supabase db push`, no SQL apply, no seed, no deploy, no
  push, no service-role bypass, no import token, no official import action, no
  write to real people/person rows, no write to real relationships, no family,
  layout, revision or profile mutation.

## Decision 215 - A-16I5 adds read-only import review pack while official import remains closed

Status: `ACTIVE`

Chọn:

- Add a server-only import review pack service for existing manifest staging
  data.
- Expose only `GET /api/admin/import-sessions/[sessionId]/review-pack`.
- Summarize parse, validation and dry-run preview evidence for owner review.
- Keep `canProceedToOfficialImport=false` and `readyForOfficialImport=false`.
- Keep the existing disabled official import UI boundary.

Lý do:

- Owner needs one compact review surface after A-16I/A-16J/A-16L before any
  separate official import approval phase.
- Existing staging data is enough to produce a read-only review pack without
  schema changes or real genealogy writes.

Boundaries:

- No migration, no `supabase db push`, no SQL apply, no seed, no real Excel
  import in this decision, no people/person write, no relationship write, no
  layout/tree/revision write, no service-role bypass, no official import action,
  no deploy and no push.

## Decision 214 - A-16SQL adds import staging write RLS candidate without DB apply

Status: `ACTIVE`

Chọn:

- Add a not-applied SQL candidate for import staging RLS policies.
- Keep canonical file under `db/migrations` and mirror it byte-for-byte under
  `supabase/migrations`.
- Open only authenticated, owner-scoped staging access for users with
  `imports.create`.
- Add SELECT-only verification SQL for owner/operator use after manual apply.
- Keep official import and real genealogy writes closed.

Lý do:

- A-16I upload can fail at `import_sessions.insert(...).select("id")` when
  RLS is enabled but no matching INSERT/SELECT policy exists.
- A-16F5M confirmed the staging schema was manually applied; adding a candidate
  keeps the next DB step reviewable without running Supabase CLI apply.

Boundaries:

- No `supabase db push`, no `supabase db push --dry-run`, no
  `supabase migration repair`, no SQL apply, no seed, no Excel import, no
  service-role bypass, no anon/public grant or policy, no RLS disable, no real
  people/person write, no relationship write, no layout/tree/revision write,
  no official import action, no deploy and no push.

## Decision 213 - A-16L opens dry-run mapping preview without real genealogy writes

Status: `ACTIVE`

Chọn:

- Open a read-only dry-run mapping preview after owner marker
  `APPROVE_A16K_IMPORT_DRY_RUN_GATE`.
- Derive proposed people/relationships from existing manifest staging and A-16J
  validation issues in memory.
- Expose only `GET /api/admin/import-sessions/[sessionId]/dry-run-preview`.
- Show the preview on `/admin/exports/import`.
- Keep `canProceedToOfficialImport: false` and official import disabled.

Lý do:

- Owner needs a concrete mapping preview before any official import phase.
- Existing A-16G/A-16I/A-16J data is enough to build an in-memory preview
  without schema changes or real genealogy writes.

Boundaries:

- No migration, no `supabase db push`, no SQL apply, no
  `supabase migration repair`, no seed, no upload/parse real file, no real
  people/person write, no real relationship write, no layout/tree/revision
  write, no DB persistence of preview, no official import action, no deploy and
  no push.

## Decision 212 - A-16K keeps dry-run import locked behind owner approval marker

Status: `ACTIVE`

Chọn:

- Add a server-only static approval gate for Gia Phả 4 dry-run import.
- Expose only `GET /api/admin/import-sessions/[sessionId]/dry-run-gate`.
- Show a disabled dry-run approval block on `/admin/exports/import`.
- Require owner marker `APPROVE_A16K_IMPORT_DRY_RUN_GATE` before any later
  dry-run mapping phase can open.
- Keep official import disabled.

Lý do:

- A-16G through A-16J/A-16I2 prepared read/staging/review capability, but no
  phase has approved dry-run mapping or real genealogy writes.
- A visible locked gate makes the next approval boundary explicit for owner and
  operator review.

Boundaries:

- No migration, no `supabase db push`, no SQL apply, no
  `supabase migration repair`, no seed, no upload/parse real file, no real
  people/person write, no real relationship write, no layout/tree/revision
  write, no dry-run mapping execution, no official import action, no deploy and
  no push.

## Decision 211 - A-16I2 real file upload smoke stays staging-only and explicit-env gated

Status: `ACTIVE`

Chọn:

- Add a smoke script for owner/operator-provided real Gia Phả 4 `.xlsx` files.
- Require explicit base URL, Playwright storage state and real file path env.
- Require the real file to stay outside the repo.
- Safe-skip before browser/file read when explicit env is missing.
- Allow only `POST /api/admin/import-sessions/upload` as the staging mutation.
- Keep official import disabled and keep A-16J validation read-only.

Lý do:

- A-16I parser and A-16J validation need a safe path to test real owner files
  without committing sensitive data or opening real genealogy mutation.
- Explicit env keeps ownership of session/file selection with the operator.
- Summary-only output lets the team record counts and warning codes without
  logging personal rows.

Boundaries:

- No migration, no `supabase db push`, no SQL apply, no
  `supabase migration repair`, no seed, no real people/person write, no real
  relationship write, no layout/tree/revision write, no official import action,
  no deploy and no push.
- `.xls` remains unsupported until a separate parser/dependency approval phase.

## Decision 210 - A-16J reviews manifest staging warnings without opening official import

Status: `ACTIVE`

Chọn:

- Add runtime/read-only validation for import manifest staging after A-16I.
- Expose only `GET /api/admin/import-sessions/[sessionId]/validation`.
- Compute validation issues from the existing A-16G/A-16I manifest read result.
- Show Vietnamese warning/error/info groups on `/admin/exports/import`.
- Keep `canImport: false`, `dbWrite: false` and the official import CTA
  disabled.

Lý do:

- Owner needs staging review before any future official import approval.
- Current schema already stores sessions, parser warnings, duplicate candidates,
  relationship candidates and draft write manifests; A-16J can derive useful
  review warnings without adding migration or writing another staging summary.
- Read-only derivation keeps RLS authoritative and avoids accidental real
  genealogy mutation.

Boundaries:

- No migration, no `supabase db push`, no SQL apply, no
  `supabase migration repair`, no seed/import into real tables, no
  people/person creation, no real relationship creation, no layout/tree/revision
  update, no official import action, no deploy and no push.
- Any future official import must be a separate approved phase with transaction,
  rollback, audit and checker coverage.

## Decision 209 - A-16I stages Gia Phả 4 uploads without opening official import

Status: `ACTIVE`

Chọn:

- Add `POST /api/admin/import-sessions/upload` for A-16I staging-only upload.
- Parse `.xlsx` server-side with existing `jszip` instead of adding a new Excel
  parser dependency to the main app.
- Keep `.xls` unsupported in A-16I with a clear Vietnamese blocker.
- Write only existing import manifest staging tables verified in A-16F5M.
- Store normalized person candidates in draft
  `import_write_manifests.approved_scope.person_candidates` because the current
  applied schema has no separate `import_person_candidates` table.
- Keep `canImport: false` and the official import CTA disabled.

Lý do:

- The owner explicitly opened upload/parse into manifest staging but still
  forbids migrations, DB push, SQL apply, real people/relationship writes,
  layout/revision mutation, deploy and push.
- `jszip` already exists for backup ZIP handling, so `.xlsx` can be parsed
  lightly without dependency drift.
- `.xls` binary parsing would require a separate parser dependency or offline
  conversion decision, which is outside A-16I.
- RLS must remain authoritative; using the Supabase server client with user
  cookies is safer than bypassing policies with service role.

Boundaries:

- No migration, no `supabase db push`, no SQL apply, no
  `supabase migration repair`, no seed/import into real tables, no
  people/person creation, no real relationship creation, no layout/tree/revision
  update, no official import action, no deploy and no push.
- Main Worker touched only for small upload/parse coordination with 5MB limit;
  large import validation or `.xls` parser support should be reconsidered under
  `genealogy-import-service` or offline tooling.

## Decision 208 - A-16H authenticated import manifest browser smoke uses explicit session env or safe-skip

Decision:

- Add an authenticated browser smoke script for `/admin/exports/import`.
- Require explicit shell env for authenticated browser context:
  `A16H_IMPORT_MANIFEST_SMOKE_BASE_URL` and
  `A16H_IMPORT_MANIFEST_SMOKE_STORAGE_STATE`.
- If explicit env is missing, return
  `A16H_BROWSER_SMOKE_STATUS=SAFE_SKIP_MISSING_EXPLICIT_ENV` before browser
  navigation.
- Keep official import disabled and fail the smoke on dangerous
  POST/PUT/PATCH/DELETE import/admin mutation requests.

Reason:

- A-16G opened a read-only import manifest screen, but authenticated UI evidence
  needs a browser/session gate that does not store credentials in the repo.
- Auto-login or hardcoded cookies would violate the secret boundary.
- SAFE_SKIP is more honest than claiming browser PASS without an explicit
  owner/operator session.

Boundaries:

- No migration, no DB push, no SQL apply, no seed/import data, no Gia Phả 4 file
  upload/parse, no real import session creation, no people/relationship writes,
  no layout/revision writes, no official import action, no deploy and no push.

## Decision 207 - A-16G opens read-only import manifest runtime without real genealogy writes

Status: `ACTIVE`

Chon:

- Add a small read-only runtime layer for import sessions and import manifest
  rows after A-16F5M owner manual SQL verification.
- Use existing auth/permission context and Supabase server client with user
  cookies so RLS remains authoritative.
- Add only GET routes for session list, session detail and manifest detail.
- Surface the read-only state in the existing admin import page with
  `canImport: false` and a disabled official import CTA.
- Keep real `people`, relationship, tree layout and revision writes forbidden.

Ly do:

- Owner needs a way to inspect import manifest/session state before any real
  import.
- The schema has been manually verified but Supabase CLI migration history still
  needs reconciliation, so A-16G must not create migrations or rerun CLI apply.
- Read-only manifest review is a safe next step that does not bypass RLS and
  does not mutate genealogy data.

## Decision 206 - A-16F5M accepts owner manual SQL verification while requiring migration history reconciliation

Status: `ACTIVE`

Chon:

- Accept the owner-reported manual Supabase Dashboard SQL apply verification as
  the A-16F5M evidence for the Gia Pha 4 import manifest schema.
- Record that all five import manifest tables exist, RLS is enabled, no
  unintended public/anon policy exists and all five tables have zero rows.
- Treat the schema as manually applied, but not reconciled with Supabase CLI
  migration history.
- Do not rerun the same SQL file or run `supabase db push` until a migration
  history reconciliation plan exists.
- Allow a later A-16G phase only for import manifest/session runtime scope; real
  `people` and relationship writes remain forbidden.

Ly do:

- The owner used Supabase Dashboard because CLI project link remained blocked in
  A-16F4R.
- Manual SQL can make the schema correct while leaving CLI migration history
  unaware of the applied migration.
- Running the same migration again via CLI without reconciliation could attempt
  duplicate object creation or confuse future migration state.

## Decision 205 - A-16F4R dry-run rerun remains blocked because Supabase project access is denied

Status: `ACTIVE`

Chon:

- Rerun the project link gate for owner-confirmed project ref
  `frkyeuxrlcflmsxxsolp`.
- Stop before dry-run because `supabase link` returned
  `LegacyLinkProjectStatusError` while retrieving remote project status due to
  insufficient privileges for the current Supabase account.
- Record `A16F4R_STATUS=BLOCKED_SUPABASE_PROJECT_ACCESS_DENIED` and
  `A16F4R_BLOCKER=SUPABASE_PROJECT_ACCESS_DENIED`.
- Do not run `supabase db push --dry-run --linked` without verified link
  metadata.
- Keep expected dry-run migration list limited to
  `20260629_0010_a16d_import_manifest_storage_candidate.sql` for a future retry.

Ly do:

- The link gate still cannot prove that the CLI account is operating on the
  intended GIA PHA Supabase project.
- Even dry-run-only DB commands must not be run against an unverified linked
  target.
- No DB apply, seed, import, people/relationship write, deploy or push is
  allowed in this phase.

## Decision 204 - A-16F4 blocks dry-run because Supabase project link lacks required privileges

Status: `ACTIVE`

Chon:

- Attempt project link to owner-confirmed project ref
  `frkyeuxrlcflmsxxsolp`.
- Stop before dry-run because `supabase link` failed while retrieving remote
  project status due to insufficient privileges for the current Supabase
  account.
- Record `A16F4_STATUS=BLOCKED_SUPABASE_AUTH_REQUIRED` and
  `A16F4_BLOCKER=SUPABASE_LINK_PRIVILEGE_REQUIRED`.
- Do not run `supabase db push --dry-run --linked` without verified link
  metadata.
- Keep expected dry-run migration list limited to
  `20260629_0010_a16d_import_manifest_storage_candidate.sql` for a future retry.

Ly do:

- A dry-run against the wrong or unverified project would be unsafe even though
  it is not an apply.
- Supabase CLI link requires account privileges to the remote project endpoint;
  the current shell account could not prove that access.
- No DB apply, seed, import, people/relationship write, deploy or push is
  allowed in this phase.

## Decision 203 - A-16F3 creates local Supabase metadata and byte-for-byte migration bridge but leaves project link blocked

Status: `ACTIVE`

Chon:

- Create local Supabase CLI metadata with `npx --yes supabase init --yes`.
- Keep seed disabled in local metadata by setting `[db.seed] enabled = false`
  and `sql_paths = []`.
- Preserve `db/migrations` as the canonical reviewed SQL source.
- Create `supabase/migrations` as a Supabase CLI mirror path.
- Copy
  `db/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql`
  to
  `supabase/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql`
  byte-for-byte and enforce equivalence by checker.
- Do not run `supabase link` because the active Supabase account/login state was
  not confirmed in this shell.
- Keep the next phase as `A16F4_DRY_RUN_ONLY`; any future apply still requires
  `APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY`.

Ly do:

- Supabase CLI expects project metadata and migrations under `supabase/`, while
  the repo's reviewed source migration has lived under `db/migrations`.
- A mirror with byte-for-byte verification avoids silently changing the
  reviewed SQL while making the next CLI dry-run path explicit.
- Disabling seed in local metadata prevents the bridge from implying seed
  execution in future reset-style commands.
- Link and DB dry-run/apply remain operationally sensitive and require account
  confirmation and a later phase.
- This decision does not apply DB, run dry-run, seed, mutate data, import
  Excel, add runtime dependency, deploy or push.

## Decision 202 - A-16F2 records project ref but keeps DB apply blocked until link and migration path are bridged

Status: `ACTIVE`

Chon:

- Record owner-confirmed Supabase project ref `frkyeuxrlcflmsxxsolp`.
- Keep A-16F2 readiness-only: no `supabase init`, no `supabase link`, no
  `supabase db push --dry-run --linked` and no `supabase db push --linked`.
- Treat the current state as blocked because local project link metadata is
  still absent and the migration candidate lives in `db/migrations` rather
  than Supabase CLI's expected `supabase/migrations`.
- Recommend A-16F3 create Supabase metadata, link the confirmed project only
  after account confirmation, and bridge the A-16D candidate into
  `supabase/migrations` with an explicit equivalence checker.
- Require the owner marker
  `APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY` again before any later
  dry-run/apply phase.

Ly do:

- Project ref alone is not enough to run link/apply commands safely; the
  operator account and resulting metadata must be confirmed.
- The repo has historically used `db/migrations`; silently changing the apply
  path during a readiness phase would make the next DB operation harder to
  audit.
- A bridge phase can keep `db/migrations` as the reviewed source while giving
  Supabase CLI the expected `supabase/migrations` path.
- This decision does not apply DB, run dry-run, seed, mutate data, import
  Excel, add runtime dependency, deploy or push.

## Decision 201 - A-16F1 confirms npx Supabase CLI but blocks DB apply until project link is confirmed

Status: `ACTIVE`

Chon:

- Treat A-16F1 as Supabase CLI/project-link readiness only, not a DB dry-run or
  apply phase.
- Record global `supabase` CLI as unavailable and `npx --yes supabase` as
  available at version `2.108.0`.
- Keep the DB apply path blocked because no `.supabase/` or `supabase/`
  project-link metadata exists and owner did not provide an exact GIA PHA
  project ref in this phase.
- Do not run `supabase link`, `supabase db push --dry-run --linked` or
  `supabase db push --linked` in A-16F1.
- Require the existing A-16F owner marker
  `APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY` again when retrying the actual
  dry-run/apply verification phase.

Ly do:

- Supabase CLI docs state `supabase db push` requires a linked project and that
  `--dry-run` shows pending changes before apply.
- CLI availability alone is not enough; target project proof is the operational
  safety boundary before any command that can touch remote DB state.
- Linking a project without an explicit project ref/account confirmation could
  bind the checkout to the wrong Supabase project.
- This decision does not apply DB, run dry-run, seed, mutate data, import
  Excel, add runtime dependency, deploy or push.

## Decision 200 - A-16F blocks DB apply because Supabase CLI and project link are not confirmed

Status: `ACTIVE`

Chon:

- Accept the owner marker
  `APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY` as present for this phase.
- Stop before DB dry-run/apply because `supabase --version` failed and no
  safe local project-link metadata exists in the checkout.
- Record `A16F_STATUS=SAFE_SKIP_OR_BLOCKED`.
- Do not run `npx` or a guessed CLI path because the target Supabase project
  cannot be confirmed safely.
- Keep the A-16D/A-16E2 candidate unapplied until a later retry has approved
  Supabase CLI availability, exact project target, backup/rollback/no-go
  evidence and dry-run proof.

Ly do:

- A schema apply phase must prove the target project before any command that can
  mutate DB state.
- A missing CLI and absent project link make `supabase db push --dry-run
  --linked` impossible to run safely from this checkout.
- Claiming schema/RLS verification without apply would be misleading, so this
  phase records static candidate evidence only.
- This decision does not apply DB, seed, mutate `people` or relationships,
  import Excel, enable runtime import write, add dependency, deploy or push.

## Decision 199 - A-16E2 resolves schema-candidate blockers but still requires owner marker before apply

Status: `ACTIVE`

Chon:

- Keep A-16E2 as schema-candidate blocker resolution only, not a DB apply
  phase.
- Update the not-applied A-16D SQL candidate with clearer no raw Excel/PII
  guard comments, fail-closed RLS guard comment, size/hash/approval consistency
  checks and JSON object checks.
- Classify blockers explicitly as `SCHEMA_BLOCKER`, `RLS_BLOCKER`,
  `PERMISSION_BLOCKER`, `PII_BLOCKER`, `RUNTIME_DEPENDENCY_BLOCKER` and
  `REVIEW_ONLY_CAUTION`.
- Set schema recommendation to
  `READY_FOR_A16F_DB_APPLY_REVIEW`.
- Keep A-16F blocked until owner provides
  `APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY` and confirms target project,
  backup/rollback/no-go position and dry-run/apply verification scope.
- Keep runtime grants/RLS policy and service-role vs client Data API access in a
  later approved runtime/policy phase.

Ly do:

- A-16E1 found no direct SQL safety failure, but the candidate needed stronger
  guard comments and consistency checks before owner review of apply.
- Import manifest storage can hold sensitive review state, so no raw workbook
  rows, no public policy and no broad grants should be introduced in the schema
  candidate.
- Schema readiness is separate from apply authorization; target DB, backup,
  dry-run and owner marker are operational gates, not static-doc assumptions.
- This decision does not apply DB, run Supabase CLI, change deployed
  RLS/auth/permission runtime, add dependency, change OpenNext/Wrangler config,
  deploy, push or mutate production data.

## Decision 198 - A-16E1 recommends not applying Gia Pha 4 import schema until owner marker and target proof

Status: `ACTIVE`

Chon:

- Treat A-16E1 as owner review/docs/checker only, not a DB apply phase.
- Accept the A-16D SQL candidate as structurally suitable for a later apply
  phase, while keeping the current recommendation `DO_NOT_APPLY_YET`.
- Require the exact owner marker
  `APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY` before running A-16F.
- Require target Supabase project confirmation, backup/rollback/no-go position,
  dry-run plan and RLS/grant/runtime access approach before apply.
- Keep import storage fail-closed: RLS enabled, no policies and no grants in
  A-16E1.
- Keep A-16G/A-16H/A-16I blocked until their explicit prerequisites are met.

Ly do:

- Static review found no direct SQL safety failure, but import manifest storage
  can contain sensitive family review evidence, duplicate suggestions and
  relationship ambiguity.
- The current schema has `clans` and `clan_branches`, not a single
  `genealogy_id`/`family_tree_id`; runtime scope must be confirmed before real
  import workflow writes sessions.
- Supabase Data API access depends on grants and RLS together, so runtime access
  must be decided explicitly instead of inferred from table creation.
- This decision does not apply DB, change deployed RLS/auth/permission runtime,
  add dependency, alter OpenNext/Wrangler config, deploy, push or mutate
  production data.

## Decision 197 - A-16E blocks import manifest schema apply until explicit owner marker

Status: `ACTIVE`

Chon:

- Treat A-16E as SQL candidate review and DB apply gate documentation only.
- Keep the A-16D import manifest SQL candidate unapplied until owner provides
  the exact marker `APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY`.
- Record A-16E static review as sufficient for candidate safety: additive
  tables/indexes, no seed/data mutation statements, no broad grants, no
  policies and no RLS disablement.
- Preserve fail-closed RLS in the candidate: RLS enabled, no policy/grant in
  A-16E.
- Require a separate A-16F phase for Supabase CLI/project confirmation,
  dry-run, apply, read-only catalog verification, RLS verification and no-seed
  evidence.
- Keep A-16G/A-16H/A-16I blocked until their prerequisite markers/results are
  present.

Ly do:

- The import manifest tables can hold sensitive review state, duplicate
  suggestions, relationship ambiguity and rollback/write manifests.
- A-16D created a candidate file only; A-16E must not silently promote that
  candidate into a live schema without owner approval and target-project
  confirmation.
- Current Supabase Data API behavior can require explicit grants for new
  public-schema tables, so grants and RLS policies must be designed together in
  a later approved runtime/policy phase.
- This decision does not change deployed DB, auth/RLS/permission runtime,
  OpenNext/Wrangler config, dependencies, service Worker boundary, production
  data, deploy policy or push policy.

## Decision 196 - A-16D keeps Gia Pha 4 import manifest storage as a not-applied schema candidate

Status: `ACTIVE`

Chon:

- Create a real SQL migration candidate file for import manifest/review storage
  because the repository migration convention is clear.
- Keep the candidate `NOT_APPLIED` in A-16D. Do not run `supabase db push`,
  connect to production DB, seed permissions or mutate real data.
- Model import storage with five candidate tables:
  `import_sessions`, `import_session_warnings`,
  `import_duplicate_candidates`, `import_relationship_candidates` and
  `import_write_manifests`.
- Enable RLS in the candidate but create no policies and no permission seed, so
  the storage remains fail-closed until a future approved policy/runtime phase.
- Store import review metadata, hashes, counts, fingerprints, owner decisions,
  approved scope and rollback manifest information; do not store Excel file
  content or raw workbook rows in the candidate design.
- Require A-16E with `APPROVE_A16E_IMPORT_MANIFEST_SCHEMA_APPLY` before any DB
  apply, and A-16F with `APPROVE_A16F_GIAPHA4_IMPORT_DB_WRITE_RUNTIME` before
  any real import write runtime.

Ly do:

- A-16C identified persistent manifest/review state as the next safe design
  step before any Gia Pha 4.0 import write.
- Import review state can include privacy-sensitive family evidence, duplicate
  suggestions and ambiguous relationships, so storage must be explicit,
  reviewable and fail-closed.
- Approval markers must bind to exact source hashes/manifests and cannot imply
  auto merge, auto delete, ambiguous relationship auto-link, production deploy
  or runtime import permission.
- This decision does not change deployed DB, RLS/auth/permission runtime,
  OpenNext/Wrangler config, dependencies, service Worker boundary or production
  data.

## Decision 195 - A-16C requires owner-bound approval marker before Gia Pha 4 DB write

Status: `ACTIVE`

Chon:

- Keep A-16C as design/documentation/checker only.
- Require owner review of summary, people, relationships, duplicates,
  ambiguity, privacy notes and import scope before any DB-write phase.
- Require a marker bound to an exact preview summary hash or manifest id before
  opening the next phase:
  `APPROVE_A16D_GIAPHA4_IMPORT_SCHEMA_CANDIDATE` or
  `APPROVE_A16E_GIAPHA4_IMPORT_DB_WRITE_RUNTIME`.
- Require future DB-write runtime to preserve `held_rows`, no auto merge, no
  auto delete, no ambiguous relationship auto-link and rollback manifest scope.

Ly do:

- Gia Pha 4.0 Excel data can contain real family personal data and ambiguous
  relationship references.
- A-16B currently provides safe-skip preview runtime because no Excel parser is
  approved, so DB-write planning must not outrun parser/preview evidence.
- Approval must be tied to a specific file/manifest/mapping result; a generic
  approval marker would be unsafe if the workbook or mapping changes.
- This decision does not change DB, RLS, auth, permission runtime, dependency,
  OpenNext/Wrangler config, deploy policy or service Worker boundary.

## Decision 194 - A-16B keeps Gia Pha 4 Excel preview safe-skip until parser approval

Status: `ACTIVE`

Chon:

- Add the admin Gia Pha 4.0 Excel preview surface as a safe-skip runtime/UI
  shell instead of adding an unapproved Excel parser dependency.
- Keep the preview API in the main app only as light coordination that returns
  metadata/counts/warnings and never writes database rows.
- Keep `Nhập dữ liệu thật` disabled and require a future owner-approved A-16C
  before parser dependency, row-level preview parsing or import-write work.

Ly do:

- A-16 confirmed no direct `xlsx` or `exceljs` dependency is currently present.
- The real workbook can contain sensitive family data, so A-16B must not log raw
  rows, commit files or fake a parse result.
- The current main app may coordinate small preview UI/API work, but large Excel
  parsing and validation can affect Worker size/startup and should be reviewed
  for offline tooling or `genealogy-import-service`.
- This decision does not change DB, RLS, auth, permission model, dependency,
  OpenNext/Wrangler config or service Worker deployment.

## Decision 193 - A-16 keeps Gia Pha 4.0 Excel import preview-only until owner approval

Status: `ACTIVE`

Chon:

- Treat Gia Pha 4.0 Excel/iPhone import work in A-16 as mapping readiness and
  privacy-safe preview only.
- Keep `NO_DB_WRITE`: no insert/update/delete, migration, seed, RLS/auth/
  permission/API contract change or production mutation in this phase.
- Do not add an Excel parser dependency in A-16. The inspector may safe-skip
  when `xlsx`/`exceljs` or equivalent is absent.
- Require a later A16B approval gate before any parser dependency, sanitized
  fixture expansion, runtime import flow or database write is introduced.

Ly do:

- Real Gia Pha 4.0 workbooks can contain personal data and relationship data,
  so raw rows must not be logged or committed.
- The current repository has family.json preview infrastructure, but Excel
  import needs explicit field mapping, duplicate handling, privacy review and
  relationship validation before mutation is safe.
- Large or repeated import/validation work may need a future import service or
  offline operator tool instead of growing the main OpenNext Worker.
- This decision does not change DB, auth, permission, API, dependency,
  OpenNext/Wrangler config or service boundary.

## Decision 192 - A-15E3 standardizes manual GitHub Actions Linux deploy verification

Status: `ACTIVE`

Chon:

- Treat manual GitHub Actions Linux Cloudflare Deploy as the preferred
  production deploy path after the Windows/OpenNext 500 incident.
- Do not deploy production from Windows unless a later owner-approved phase
  specifically revalidates that path.
- Keep Cloudflare Deploy manual-only via `workflow_dispatch`; do not enable auto
  deploy on push yet.
- Treat the GitHub Actions Node.js 20 deprecation/actions forced-to-Node-24
  warning as a non-blocking runner advisory if the workflow status is success.

Ly do:

- A Windows deploy caused HTTP 500 on `/`, `/tree`, `/auth/login` and `/admin`.
- A-15E2 rollback restored production using Worker version
  `4134298b-ef89-4099-b20b-b13995f397c8`.
- A-15E3 production smoke after owner-reported GitHub Actions Linux deploy
  returned `/` 200, `/tree` 200, `/auth/login` 200 and `/admin` 307 redirect to
  login.
- `npx wrangler deployments list` showed current active version
  `f8287634-ecfa-45f6-ac8a-d519e1b4e30b` with 100% traffic.
- This decision does not change DB, auth, permission, API, OpenNext/Wrangler
  config, dependency or service boundary.

## Decision 191 - A-15E2 blocks Windows redeploy after production 500 rollback

Status: `ACTIVE`

Chon:

- Do not deploy again in A-15E2 after owner-confirmed rollback restored
  production.
- Treat Windows/OpenNext deploy as a suspected risk path until A-15E3 validates a
  safer WSL or GitHub Actions Linux path.
- Keep the current production rollback version
  `4134298b-ef89-4099-b20b-b13995f397c8` as the known-good version for this
  incident record.
- Require A-15E3 owner approval before any deploy retry, with env/secret
  names-only verification, one documented deploy command, immediate route smoke
  and rollback plan.

Ly do:

- Owner reported a deploy from Windows caused HTTP 500 on all main routes.
- Rollback restored `/`, `/tree` and `/auth/login` to HTTP 200.
- A-15E2 diagnostics observed production public routes healthy and `/admin`
  redirecting to login, so another rollback or redeploy would add risk without a
  clear recovery need.
- The repo already has `npm run deploy` as the standard OpenNext deploy script;
  a future retry should avoid mixed build/deploy order and avoid unverified
  Windows artifact behavior.
- This decision does not change DB, auth, permission, API, Worker config,
  dependency or service boundary.

## Decision 190 - A-15E production deploy blocked until secret rotation and owner approval

Status: `ACTIVE`

Chon:

A-15E may record deploy readiness and current production read-only smoke, but
must not deploy until service role key rotation is owner-confirmed, production
secrets are known ready and owner provides `APPROVE_A15E_PRODUCTION_DEPLOY`.

Allowed:

- git/GitHub sync checks;
- local build/readiness checks;
- local env presence checks without values;
- Cloudflare/Wrangler secret-name readiness checks without values;
- existing production read-only smoke on public/protected redirect routes;
- phase doc/checker/package script and handoff updates.

Not authorized:

- production deploy or upload;
- Git push after the report commit unless separately requested;
- DB migration, SQL apply, seed, role assignment or data mutation;
- production form submit;
- secret, token, cookie or key logging;
- UI/runtime/auth/API/service change;
- dependency addition;
- OpenNext/Wrangler config change;
- new service Worker.

Ly do:

The heritage UI can only be deployed safely after the owner confirms rotated
service-role material is installed in production and explicitly approves the
deploy. Without those gates, the correct outcome is a documented safe-skip, not
a speculative deploy.

## Decision 189 - A-15B2 closes auth fix path based on owner manual confirmation

Status: `ACTIVE`

Chon:

A-15B2 may record owner-confirmed manual authenticated `/admin` smoke PASS and
close A-15C3/A-15D as not needed, but it remains documentation/checker-only.

Allowed:

- record owner manual confirmation of browser login, `/admin` access and
  Supabase callback URL configuration;
- add phase doc and checker;
- add package checker script;
- update docs index, work log, decision log and handoff;
- update checker allowlists for this exact phase.

Not authorized:

- UI change;
- auth runtime, callback, cookie or middleware change;
- seed, role assignment, profile/permission mutation or data mutation;
- database/schema/migration/RLS/API/service runtime change;
- dependency addition;
- form submission;
- committed `.env.local`, cookie, token, screenshot or storage-state artifact.

Ly do:

A-15C already proved owner/admin permission readiness, and owner manual browser
confirmation proves the auth runtime works. The remaining automated smoke gap is
session-context persistence, which belongs in a separate safe handoff phase if
automation is needed.

## Decision 188 - A-15C2 auth browser session diagnostics remain read-only

Status: `ACTIVE`

Chon:

A-15C2 may diagnose Supabase browser session binding after A-15C readiness PASS
and A-15B1 browser session FAIL, but it must not change auth/runtime behavior.

Allowed:

- static source review of login, callback, logout, server Supabase client and
  permission guard;
- local HTTP read-only checks for `/auth/login`, `/tree` and `/admin`;
- boolean/count/status/reason output without secret, cookie value, token, email
  or private id output;
- Supabase Dashboard redirect URL checklist for owner manual confirmation;
- documentation, checker, smoke script and package script updates.

Not authorized:

- OAuth or magic-link form submission by automation;
- seed, role assignment or profile/permission mutation;
- database/schema/migration/RLS/auth/permission/API/service runtime change;
- dependency addition, route creation, UI polish, deploy or push;
- saved cookie, storage state, screenshot or session artifact.

Ly do:

A-15C proves owner/admin permission readiness in the database, while A-15B1 proves
the current browser context is not bound as an authenticated admin session. The
safe next move is a narrow diagnostic record plus manual callback/cookie trace,
not a speculative auth fix.

## Decision 187 - A-15B1 browser smoke rerun remains verification-only

Status: `ACTIVE`

Chon:

A-15B1 may rerun browser smoke after A-15C readiness PASS, but it must record
the actual browser session result and must not create or force an auth session.

Allowed:

- local browser navigation to existing public/admin routes;
- desktop/mobile overflow checks;
- read-only DOM observation of session, role, permission, CTA and form render;
- SELECT/read-only lookup for safe person id or public slug discovery;
- documentation, checker and package script updates.

Not authorized:

- form submit or create/update/delete action;
- seed or role assignment;
- database/schema/migration/RLS/auth/permission/API contract change;
- service runtime, Worker/OpenNext/Wrangler or deploy config change;
- UI polish or route creation;
- dependency addition;
- saved cookie, token, screenshot or browser session artifact.

Ly do:

A-15C can prove owner/admin permission readiness in the database, but browser
smoke PASS requires a real bound browser session. If the browser still redirects
or shows unknown user/role/permission zero, the correct result is FAIL/PARTIAL,
not an invented authenticated PASS.

## Decision 186 - A-15C owner/admin readiness is SELECT-only

Status: `ACTIVE`

Chon:

A-15C may verify owner/admin auth/profile/role/permission readiness with a
shell-local script, but only through SELECT/read-only checks and boolean/count
output.

Allowed:

- read `.env.local` locally for smoke-only env presence;
- use Supabase admin APIs/server-side reads to locate the configured owner/admin
  account, profile, roles and permissions;
- print only readiness booleans, counts and reason codes;
- safe-skip when required env or target user is absent.

Not authorized:

- seed, insert, update, delete or role assignment;
- raw secret, token, cookie, email or private id output;
- auth, permission, RLS, API or service runtime change;
- browser session creation.

Ly do:

The browser smoke rerun needs a truthful readiness gate before testing UI. The
gate must avoid changing authorization state because A-15B1 is verification-only.

## Decision 185 - A-15B authenticated heritage UI browser smoke is verification-only

Status: `ACTIVE`

Chon:

A-15B may run read-only browser smoke over existing public/admin Vietnamese
heritage UI routes after A-15A2-A15A6 and record PASS, PARTIAL, SAFE_SKIP or
FAIL evidence.

Allowed:

- local browser navigation to existing routes;
- desktop/mobile overflow checks;
- read-only route, text, link, form-render and auth/session observation;
- SELECT read-only lookup for safe slug/id discovery without printing secrets;
- documentation and checker updates for the smoke phase.

Not authorized:

- form submit or create/update/delete action;
- database/schema/migration/seed/RLS change or DB apply;
- auth, role, permission or API/server action contract change;
- service runtime, Worker/OpenNext/Wrangler or deploy config change;
- UI polish or route creation;
- dependency addition;
- saved cookie, session, token, screenshot or browser evidence artifact;
- copied asset/logo/screenshot/CSS/layout from any reference website.

Ly do:

The A-15A2-A15A6 UI polish needs real browser evidence, but authenticated PASS
must not be invented when the browser lacks a verified owner/admin session. The
phase therefore records safe skips and partial reads without widening runtime or
data boundaries.

## Decision 184 - A-15A6 add/edit member form polish is UI/UX-only

Status: `ACTIVE`

Chon:

A-15A6 Add/Edit Member Form Vietnamese Heritage UX may polish existing member,
relationship and related-member form presentation as a UI/UX-only phase.

Allowed:

- warm heritage form layout, section grouping and Vietnamese help text;
- pending/idle submit button labels using existing form actions;
- clearer labels for required fields, optional fields and privacy scope;
- relationship form warnings before adding cha/mẹ, con or vợ/chồng;
- responsive spacing and touch-friendly controls on existing routes.

Not authorized:

- database/schema/migration/seed/RLS or DB apply;
- auth, role, permission or API/server action contract change;
- people/relationship/genealogy service runtime change;
- validation schema or submitted field-name contract change;
- route creation;
- public tree, dashboard or member profile redo;
- dependency addition;
- copied asset/logo/screenshot/CSS/layout from any reference website.

Ly do:

Add/edit forms are the main data-entry surface for the genealogy system. They
need a calmer Vietnamese heritage experience for older users, but changing
schema, validation or relationship behavior would be a separate data-contract
phase.

## Decision 183 - A-15A5 member profile/person detail polish is UI-only

Status: `ACTIVE`

Chon:

A-15A5 Member Profile / Person Detail Vietnamese Heritage UI may polish existing
public member profile and admin person detail presentation as a UI-only phase.

Allowed:

- warm Vietnamese heritage styling for public profile and admin detail;
- profile hero/card, text-avatar, summary tiles and clearer section grouping;
- Vietnamese copy for loading, empty, not-found and missing-value states;
- responsive layout changes on existing routes;
- visual grouping of existing relationship, lineage, revision and soft-delete
  UI without changing their action/service contracts.

Not authorized:

- database/schema/migration/seed/RLS or DB apply;
- auth, role, permission or API/server action contract change;
- people/relationship/genealogy service runtime change;
- route creation;
- tree canvas/editor, public home, public tree viewer or admin dashboard redo;
- dependency addition;
- copied asset/logo/screenshot/CSS/layout from any reference website.

Ly do:

Member profiles are the main reading surface for family history, so they need a
warmer and clearer Vietnamese heritage presentation. The phase must remain
presentation-only because any real profile privacy, relationship model, media or
data contract change needs separate approval.

## Decision 182 - A-15A4 family list and admin dashboard polish is UI-only

Status: `ACTIVE`

Chon:

A-15A4 Vietnamese Heritage Family List / Admin Dashboard UI may polish existing
admin dashboard, admin shell/sidebar and gia phả/dòng họ list card presentation
as a UI-only phase.

Allowed:

- warm Vietnamese heritage dashboard styling;
- compact admin stats and quick-start guidance;
- card layout for gia phả/dòng họ list using data already loaded by existing
  services;
- clearer Vietnamese labels for existing actions and routes;
- mobile-safe card/sidebar spacing.

Not authorized:

- database/schema/migration/seed/RLS or DB apply;
- auth, role, permission or API contract change;
- create/update/delete genealogy logic change;
- service runtime, Worker/OpenNext/Wrangler or deploy config change;
- route creation;
- tree canvas/editor behavior change;
- dependency addition;
- copied asset/logo/screenshot/CSS/layout from any reference website.

Ly do:

The admin list/dashboard needs to feel like a dignified family-management
workspace, but it must remain a presentation-layer polish. Any future real
family creation flow, privacy setting workflow, permission change or data model
change needs a separate approved phase.

## Decision 181 - A-15A3 public tree view polish is UI-only

Status: `ACTIVE`

Chon:

A-15A3 Vietnamese Heritage Public Tree View UI may polish the existing public
`/tree` viewing experience and adjacent public shell/viewer components as a
UI-only phase.

Allowed:

- warm Vietnamese heritage public tree banner and parchment-like surfaces;
- compact public stats for visible graph data;
- larger public phả đồ canvas and clearer read-only toolbar presentation;
- Vietnamese empty/error/private/loading-adjacent copy;
- responsive spacing and touch-friendly controls for public tree viewing.

Not authorized:

- database/schema/migration/seed/RLS or DB apply;
- auth, permission, privacy filtering or API contract change;
- service runtime, Worker/OpenNext/Wrangler or deploy config change;
- route creation;
- relationship model, graph builder or React Flow/ELK layout algorithm change;
- admin tree editor mutation behavior;
- dependency addition;
- copied asset/logo/screenshot/CSS/layout from any reference website.

Ly do:

The public tree needs a warmer heritage experience after the admin tree editor
polish, but it remains a readonly public surface. Future public member lists,
about pages, media, tree export or privacy behavior changes require separate
approval.

## Decision 180 - A-15A2 modern Vietnamese tree editor UI is UI-only

Status: `ACTIVE`

Chon:

A-15A2 Modern Vietnamese Genealogy Tree Editor UI may polish existing admin
tree surfaces `/admin/tree` and `/admin/tree/edit`, plus directly used tree
components, as a UI-only phase.

Allowed:

- compact professional toolbar/canvas styling;
- smaller clearer member node cards;
- selected/related visual distinction;
- side panel grouping for basic information, family relationships, notes,
  privacy and add-relative actions;
- Vietnamese copy improvements for empty/error/loading-adjacent states.

Not authorized:

- database/schema/migration/seed or DB apply;
- RLS/auth/permission changes;
- API contract, server action contract or service runtime changes;
- React Flow/ELK algorithm changes;
- new route creation;
- dependency changes;
- copying website code, asset, logo, image, CSS or exact layout;
- deploy or push.

Ly do:

The tree editor is the core working surface for genealogy operations. It needs
to feel like a modern Vietnamese genealogy tool while preserving the existing
safe action boundaries and data contracts.

## Decision 179 - A-15A2 applies Vietnamese traditional genealogy UI polish

Status: `ACTIVE`

Chon:

A-15A2 applies a Vietnamese traditional genealogy visual polish to existing
public, admin and tree UI surfaces. The phase may update JSX layout, Tailwind
classes, card/toolbar styling and Vietnamese user-facing copy on existing
routes.

The accepted visual direction is:

- parchment-like stone/amber/cream background;
- public header/banner with từ đường / dòng họ feeling;
- deep teal and muted red-brown actions/accent;
- compact tree nodes and larger phả đồ canvas area;
- simple genealogy/list cards with `Xem phả đồ` and
  `Danh sách thành viên` actions;
- admin grouping as `Dòng họ`, `Phả đồ`, `Website`, `Quản trị`.

Not authorized by A-15A2:

- DB/schema/migration or DB apply;
- API/action/service logic changes;
- auth/permission/RLS changes;
- new routes or route renames;
- Worker/OpenNext/Wrangler/runtime boundary changes;
- dependency changes;
- external website image/logo/asset copying;
- deploy or push.

Ly do:

The owner requested a broader UI reference polish after A-15A1. Keeping the
work UI-only lets the app feel more like a Vietnamese genealogy product without
opening data, permission, runtime or deployment risk.

## Decision 178 - A-15A1 applies Modern Heritage to Public Home only

Status: `ACTIVE`

Chon:

A-15A1 applies the Gemini Modern Heritage / Di sản Hiện đại design direction
only to the Public Home surface and its directly used public shell/header.

The phase may polish Public Home visual styling, mobile-safe layout, CTA
treatment and Vietnamese copy, while preserving existing route, stats query,
props contract and public-read-only behavior.

Not authorized by A-15A1:

- admin dashboard, people list, person form or tree viewer/editor changes;
- DB/schema/migration or DB apply;
- API/action/service logic changes;
- auth/permission/middleware/RLS changes;
- route changes;
- tree layout algorithm changes;
- runtime merge/dedupe or permission runtime registration;
- Worker/OpenNext/Wrangler changes;
- dependency changes;
- deploy or push.

Ly do:

A-15A0 accepted the design spec as a source. A-15A1 must implement it in a
small, reviewable slice so Public Home can improve without opening broader
runtime, data, auth or navigation risk.

## Decision 177 - Gemini Modern Heritage design spec is UI-only source

Status: `ACTIVE`

Chon:

The Gemini Modern Heritage / Di sản Hiện đại UI/UX design spec is accepted as
the source design reference for later A-15A1+ UI implementation phases.

A-15A0 is docs-only. Codex must not invent UI direction outside this spec when
implementing later phases. UI implementation must be split by screen and must
stay within existing state/layout unless a later reviewed phase explicitly
opens interaction logic.

Deferred until separate interaction review:

- slide-over selected person panel;
- bottom navigation;
- fixed mobile form action bar;
- drawer/bottom sheet animation;
- pinch zoom gesture;
- new avatar/media behavior;
- any new menu state;
- any new mutation path.

Not authorized by A-15A0:

- DB/schema/migration or DB apply;
- API/action/service logic changes;
- auth/permission changes;
- route changes;
- runtime UI/component implementation;
- Worker/OpenNext/Wrangler changes;
- dependency changes;
- deploy or push.

Ly do:

The design spec should become a stable UI reference without being mistaken for
runtime, schema, auth, route or deployment approval.

## Decision 176 - A-14G-R1 retry remains SAFE_SKIP without explicit base URL

Status: `ACTIVE`

Chon:

A-14G-R1 is a public-only/read-only retry of the A-14G browser visual smoke.
It may open public routes only when an explicit `PUBLIC_VISUAL_SMOKE_BASE_URL`,
`LOCAL_SMOKE_BASE_URL` or `PROD_SMOKE_BASE_URL` is available in the execution
process.

Result:

- `PUBLIC_VISUAL_SMOKE_BASE_URL`, `LOCAL_SMOKE_BASE_URL` and
  `PROD_SMOKE_BASE_URL` were absent.
- `PUBLIC_VISUAL_SMOKE_PERSON_SLUG` was absent.
- Therefore A-14G-R1 remains `SAFE_SKIP_MISSING_PUBLIC_BASE_URL`; the person
  profile target also remains `SAFE_SKIP_MISSING_PUBLIC_SAFE_PERSON_SLUG`.
- No browser was opened and no visual PASS was claimed.

Not authorized:

- admin/auth route smoke;
- mutation click;
- DB apply or check SQL execution;
- migration or `.sql`;
- runtime merge/dedupe;
- permission runtime registration;
- Worker/OpenNext/Wrangler/deploy change;
- dependency change;
- committing secret/session/token/cookie/storage state.

Ly do:

- A real browser visual smoke needs an explicit navigable target. Without one,
  static readiness remains static readiness and must not be promoted to PASS.

## Decision 175 - A-14G public browser visual smoke is SAFE_SKIP without explicit base URL

Status: `ACTIVE`

Chon:

A-14G may run a public browser visual smoke for the polished public home,
public tree viewer, public person profile and public error / not-found /
private states when an explicit `PUBLIC_VISUAL_SMOKE_BASE_URL`,
`LOCAL_SMOKE_BASE_URL` or `PROD_SMOKE_BASE_URL` is set in the execution
process, an explicit `PUBLIC_VISUAL_SMOKE_PERSON_SLUG` is provided for
person profile smoke, and approved Browser/Playwright tooling is
available. The smoke must remain public/read-only, must not click any
mutation action and must not run admin/auth-required routes.

When any of those gates is missing, the only valid result is the matching
SAFE_SKIP token (`SAFE_SKIP_MISSING_PUBLIC_BASE_URL`,
`SAFE_SKIP_MISSING_PUBLIC_SAFE_PERSON_SLUG`,
`SAFE_SKIP_BROWSER_TOOL_UNAVAILABLE`,
`SAFE_SKIP_MOBILE_VIEWPORT_TOOLING_UNAVAILABLE`). Static source readiness
or prior A-14F/A-14B/A-14D/A-14E polish evidence must never be promoted
to a real visual PASS.

Result:

- A-14G in the current checkout stayed `SAFE_SKIP` because no explicit
  base URL was set in the Codex execution process.
- No screenshot, auth state, session, cookie, token or storage state was
  committed.
- No admin/auth route was smoked and no mutation was clicked.
- A real visual PASS may be issued in a later run only after the
  explicit base URL, public-safe slug and browser tooling gates are all
  satisfied.

Ly do:

- Public browser visual smoke needs a real navigable target; a missing
  base URL cannot produce honest visual evidence and must not be papered
  over with a static PASS.
- Public pages are read-only, so this phase can never authorize
  admin/auth smoke, mutation, schema, DB, Worker, dependency, deploy or
  push.
- The SAFE_SKIP surface area keeps the boundary visible to owner/operator
  so a future retry can be planned without claiming false coverage.

## Decision 174 - A-14F browser visual smoke readiness is not visual PASS

Status: `ACTIVE`

Chon:

A-14F may define browser visual smoke scope, environment requirements,
safe-skip behavior, pass/fail criteria and a static readiness checker for the
UI/UX work completed in A-14A through A-14E.

A-14F must not claim real browser visual PASS unless a later run actually opens
the target routes with approved Browser/Playwright tooling, an explicit base
URL and explicit auth/session material where required.

Public read-only smoke can run with an explicit base URL. Admin smoke requires
an explicit owner/operator-managed auth session/env. Mutation-adjacent paths
require separate safe dataset approval and must safe-skip without it.

Not authorized:

- schema change;
- migration or `.sql`;
- DB apply or check SQL execution;
- data mutation;
- runtime merge/dedupe;
- route/action/service merge/dedupe;
- permission runtime registration;
- Worker/OpenNext/Wrangler/deploy change;
- dependency change;
- committing secret/session/token/cookie/storage state.

Public tree remains read-only. Backup gate remains
`BLOCKED_PENDING_OWNER_BACKUP_GATE_CONFIRMATION`. DB merge/dedupe remains not
applied. Runtime merge/dedupe remains closed. Permission runtime remains
unregistered.

Ly do:

- Visual smoke should be prepared with honest evidence boundaries before a real
  browser run.
- Missing Browser tooling, base URL or auth/session input must produce
  SAFE_SKIP, not an inferred PASS.
- Browser readiness must not blur into deploy, DB apply, mutation or
  merge/dedupe runtime authorization.

## Decision 173 - A-14E mobile UX polish is UI-only

Status: `ACTIVE`

Chon:

A-14E may improve mobile/tablet usability for public UI, admin UI, Tree Viewer,
Tree Editor, people list/form, related-member add panel, selected-person
preview, shared empty/loading/error states, Vietnamese copy and accessibility
touch targets.

The style remains classic modern genealogy: cổ điển pha hiện đại, warm paper,
stone text, muted rust labels and restrained deep green actions. On mobile,
readability and tap safety take priority over decorative density.

Not authorized:

- schema change;
- migration or `.sql`;
- DB apply or check SQL execution;
- runtime merge/dedupe;
- route/action/service merge/dedupe;
- permission runtime registration;
- Worker/OpenNext/Wrangler/deploy change;
- dependency change.

Public tree remains read-only. Backup gate remains
`BLOCKED_PENDING_OWNER_BACKUP_GATE_CONFIRMATION`. DB merge/dedupe remains not
applied. Runtime merge/dedupe remains closed. Permission runtime remains
unregistered.

Ly do:

- Mobile and tablet are likely primary viewing devices for family members.
- Tree browsing and member forms need touch-safe controls and readable long
  Vietnamese names.
- Mobile polish must not be interpreted as approval for schema, database,
  merge/dedupe runtime, permission runtime or deployment work.

## Decision 172 - A-14D tree interaction polish is UI-only

Status: `ACTIVE`

Chon:

A-14D may improve tree viewer/editor interaction UX: toolbar controls,
zoom/fit/reset wording, mini help, node/person card selected and focus states,
selected-person preview, empty/error states, mobile/touch layout and Vietnamese
copy.

The tree style follows the same classic modern genealogy direction: warm paper,
stone text, muted rust labels, restrained deep green actions, light borders and
calm interaction states.

Not authorized:

- schema change;
- migration or `.sql`;
- DB apply or check SQL execution;
- runtime merge/dedupe;
- route/action/service merge/dedupe;
- permission runtime registration;
- Worker/OpenNext/Wrangler/deploy change;
- dependency change.

Public tree remains read-only. Backup gate remains
`BLOCKED_PENDING_OWNER_BACKUP_GATE_CONFIRMATION`. DB merge/dedupe remains not
applied. Runtime merge/dedupe remains closed. Permission runtime remains
unregistered.

Ly do:

- Tree browsing is a core genealogy workflow and needs clearer first-use
  guidance for drag, zoom, fit and selection.
- Selected person context helps users understand the tree without opening edit
  flows.
- Interaction polish must not be interpreted as authorization for schema,
  database or merge/dedupe runtime work.

## Decision 171 - A-14C admin UX polish is UI-only

Status: `ACTIVE`

Chon:

A-14C may improve admin dashboard, admin shell/sidebar, admin navigation copy,
shared admin primitives, people list/filter/form styling, admin empty/error
states, Vietnamese copy and accessibility states.

The approved admin style follows the same classic modern genealogy direction:
warm paper/ivory backgrounds, stone text, muted rust labels, restrained deep
green primary actions, light borders, rounded corners and calm spacing.

Not authorized:

- schema change;
- migration or `.sql`;
- DB apply or check SQL execution;
- runtime merge/dedupe;
- route/action/service merge/dedupe;
- permission runtime registration;
- Worker/OpenNext/Wrangler/deploy change;
- dependency change.

Backup gate remains `BLOCKED_PENDING_OWNER_BACKUP_GATE_CONFIRMATION`. DB
merge/dedupe remains not applied. Runtime merge/dedupe remains closed.
Permission runtime remains unregistered.

Ly do:

- Admin users need clearer navigation and next-step guidance before any new
  data operation is opened.
- The dashboard should feel like a family-record workspace rather than a
  technical module launcher.
- UI polish must not blur the line between read-only/admin viewing and real
  schema, DB or merge/dedupe runtime authorization.

## Decision 170 - A-14B public UX polish is UI-only

Status: `ACTIVE`

Chon:

A-14B may improve public home, public tree viewer, public profile, public shell,
Vietnamese copy, empty/error states, responsive behavior and classic modern
genealogy styling.

The approved style is restrained: warm paper/ivory backgrounds, stone text,
muted rust accents, deep green primary actions, light borders and moderate
rounded corners. The UI should feel like family archive material without
becoming heavy or old-fashioned.

Not authorized:

- schema change;
- migration or `.sql`;
- DB apply or check SQL execution;
- runtime merge/dedupe;
- permission runtime registration;
- public edit/delete/mutation action;
- Worker/OpenNext/Wrangler/deploy change;
- dependency change.

Backup gate remains `BLOCKED_PENDING_OWNER_BACKUP_GATE_CONFIRMATION`. DB
merge/dedupe remains not applied. Runtime merge/dedupe remains closed.
Permission runtime remains unregistered.

Ly do:

- Public viewers need a clearer, warmer genealogy experience before any new data
  operation is opened.
- Better public copy and empty/error states reduce confusion between public
  read-only browsing and admin management.
- A-13B backup evidence is still a separate safety gate and must not be bypassed
  by UI polish.

## Decision 169 - A-14A related-member UX uses existing fields only

Status: `ACTIVE`

Chon:

A-14A may improve the Tree Editor related-member add flow, including quick and
detailed create modes, context copy, duplicate suggestion guidance and classic
modern genealogy styling, but it must use only schema/service fields already
available through `CreatePersonInput` and existing relationship actions.

The classic modern style direction is approved for this phase as restrained
warm paper, stone text, deep green and muted rust accents without adding a UI
dependency or changing routes.

Not authorized:

- schema change;
- migration or `.sql`;
- DB apply or check SQL execution;
- runtime merge/dedupe;
- permission runtime registration;
- sibling/other-related-person runtime action without separate service design;
- Worker/OpenNext/Wrangler/deploy change.

Backup gate remains `BLOCKED_PENDING_OWNER_BACKUP_GATE_CONFIRMATION`. DB
merge/dedupe remains not applied. Runtime merge/dedupe remains closed.

Ly do:

- The owner needs a richer add-relative experience now, but the backup gate and
  merge/dedupe runtime gates are still closed.
- Existing person fields are enough to remove the "cut-off form" feeling
  without changing schema.
- Sibling and other relation types require explicit relationship-service design
  before they can be safe runtime behavior.

## Decision 168 - A-14 is UI/UX polish only

Status: `ACTIVE`

Chon:

A-14 Bundle - UI/UX Overhaul is allowed to improve layout, navigation, forms,
tables, detail pages, Tree Viewer/Tree Editor user guidance, Vietnamese copy,
accessibility states, docs and static checker coverage only.

A-14 does not authorize DB/runtime work. DB merge/dedupe vẫn chưa apply. Check
SQL chưa chạy trên DB. Runtime merge/dedupe vẫn đóng. Permission runtime chưa
đăng ký. Backup gate vẫn chưa bị bypass and remains
`BLOCKED_PENDING_OWNER_BACKUP_GATE_CONFIRMATION`. Không deploy trong phase này.

Result:

- Admin navigation may be regrouped without route changes.
- UI components may add help text, empty states, mobile fallback and safer
  warnings.
- Tree Editor may clarify selected person, add-relative flow, duplicate
  suggestions and data-quality warning copy.
- Static checkers may add A-14 compatibility allowlists for UI files while still
  failing SQL, migration, Worker/config/deploy and merge/dedupe runtime drift.

Ly do:

- Owner feedback says current UI/UX is poor and needs immediate improvement.
- A-13 DB apply is blocked by backup evidence, so A-14 must not bypass DB safety
  gates or open merge/dedupe runtime.
- Better UI can reduce mistaken genealogy edits without changing schema,
  service boundary or business logic.

## Decision 167 - A-13 DB apply is blocked without backup confirmation

Status: `ACTIVE`

Chon:

`APPROVE_A12_MERGE_DEDUPE_DB_APPLY` was received, and static precheck passed,
but A-13 must not connect or apply because backup/snapshot timestamp, restore
owner/path, target project/environment and safe apply tooling were not confirmed.

Result:

- A-13A: `PASS`
- A-13B: `BLOCKED_MISSING_BACKUP_CONFIRMATION`
- A-13C: `SKIPPED_BACKUP_GATE`
- A-13D: `SKIPPED_DB_NOT_APPLIED`

DB remains not applied. The nine catalog checks remain unexecuted, so
`APPROVE_A13_MERGE_DEDUPE_DB_SCHEMA_VERIFIED` cannot be issued. Runtime and
permission registration remain closed.

Ly do:

- Apply approval is not evidence that a fresh recoverable backup exists.
- An unknown target or missing rollback owner makes production DDL unsafe.
- Static PASS cannot be promoted to live DB apply or verification PASS.

## Decision 166 - A-12 migration review is approved after FK syntax correction

Status: `ACTIVE`

Chon:

A-12 Review concludes `APPROVED` after removing two extra closing parentheses
from the audit and rollback composite foreign-key definitions, synchronizing the
A-11 draft and updating the reviewed fingerprint/checker.

Owner may next grant:

`APPROVE_A12_MERGE_DEDUPE_DB_APPLY`

That marker permits only the exact reviewed migration apply and read-only check
SQL in a separate phase. It does not register permissions, add policies or open
runtime merge/dedupe.

Ly do:

- A syntactically invalid migration must never reach an apply gate even when its
  schema intent is correct.
- Fingerprint and schema-parity checks must track the corrected artifact.
- DB apply, permission activation and runtime remain separate owner gates.

## Decision 165 - A-12 creates a real migration candidate without DB apply

Status: `ACTIVE`

Chon:

Owner marker `APPROVE_A11_MERGE_DEDUPE_SCHEMA_CANDIDATE` authorizes creation of
the exact A-12 migration candidate, read-only check SQL, static checker and apply
plan. A-12 does not apply DB.

The migration keeps the A-11 reviewed schema body, enables RLS on all six tables
and adds no policy, permission, DML, seed/backfill, function, procedure, trigger
or grant. Runtime merge/dedupe remains closed.

DB apply requires separate marker:

`APPROVE_A12_MERGE_DEDUPE_DB_APPLY`

That marker permits only the reviewed schema apply and read-only verification;
it does not authorize permission runtime, RLS policies, route/action/service or
merge execution.

Ly do:

- A committed migration candidate and fingerprint make owner review precise.
- Catalog check SQL can prove RLS, constraints and absence of policies/triggers/
  routines more reliably than REST-only verification.
- Separating file creation, DB apply and runtime preserves the sequential safety
  gates established by Decisions 161-164.

## Decision 164 - A-11 schema candidate review is approved

Status: `ACTIVE`

Chon:

A-11 Review concludes `APPROVED` after tightening ready-state actor/time,
non-blank gate values, graph evidence, audit reason and no-trigger checker
coverage. The canonical next owner marker is:

`APPROVE_A11_MERGE_DEDUPE_SCHEMA_CANDIDATE`

This marker may open a separate phase for a real migration file, SQL checking
and DB apply planning. It does not apply DB, register permissions or authorize
runtime merge/dedupe. The older shorthand marker name in Decision 163 is
superseded by the canonical marker above.

Ly do:

- Schema status alone must not bypass version, conflict or graph evidence.
- SQL draft remains outside `db/migrations`, with RLS enabled and no policy,
  permission, function, procedure or trigger.
- Real migration creation, DB apply and runtime remain separate approval gates.

## Decision 163 - A-11 remains schema candidate only

Status: `ACTIVE`

Chon:

Owner marker `APPROVE_A10_MERGE_DEDUPE_RUNTIME_DESIGN` opens A-11 schema
candidate/readiness only. A-11 may add a SQL draft outside `db/migrations`,
schema documentation and static checker, but DB remains `NOT_APPLIED` and
runtime merge/dedupe remains closed.

The candidate is additive and fail-closed: six merge/dedupe tables enable RLS
without policies because `people.merge.*` permissions are not registered.
There is no route, action, service, function/procedure or data mutation.

A real migration file requires separate owner marker
`APPROVE_A11_MERGE_DEDUPE_SCHEMA`. DB apply and A-12 runtime each require their
own later approval; one marker never implicitly grants the next gate.

Ly do:

- Separating draft from real migration makes review possible without changing
  database state or current runtime behavior.
- Explicit audit, version, graph, conflict and rollback columns preserve A-10
  safety requirements for a future implementation.
- RLS without policies avoids accidentally exposing sensitive candidate,
  conflict, audit or rollback snapshots before permission design is approved.

## Decision 162 - A-10 design review is approved without granting the owner marker

Status: `ACTIVE`

Chon:

Owner Review A-10 concludes `APPROVED`: the design is complete enough for the
owner to use `APPROVE_A10_MERGE_DEDUPE_RUNTIME_DESIGN` to open A-11 schema
candidate work. This review does not itself grant the marker.

A-11, if explicitly opened, remains docs/schema-candidate/checker only until
its own approval gate. It does not authorize migration, DB apply, permission
registration, merge route/action/service or runtime mutation.

Ly do:

- The design covers advisory candidate confidence, transaction atomicity,
  version/conflict/graph checks, audit impact, rollback and Vietnamese UI.
- Keeping review approval separate from the explicit owner marker preserves the
  sequential A-10/A-11/A-12 gate model in Decision 161.

## Decision 161 - Merge/dedupe runtime remains closed

Status: `ACTIVE`

Decision: Merge/dedupe runtime remains closed until explicit approval, audit,
rollback and schema gates are approved.

Chon:

Plan A-10 defines candidate, transaction, audit, rollback, permission and UI
contracts only. It does not authorize schema, permission registration, route,
action, service or production mutation. The owner markers for A-10, A-11 and
A-12 are sequential gates; mentioning them in documentation is not approval.

Ly do:

- Same-name family members make automatic identity decisions unsafe.
- Merge affects people, relationships, layout, lineage membership, revisions,
  privacy, export identity and backup/restore assumptions.
- A pre-merge snapshot, immutable audit, explicit reviewer decision and tested
  rollback are required before any destructive-capable runtime is considered.

## Decision 160 - Tree data quality guidance is read-only and merge stays approval-gated

Chon:

The Tree Editor may calculate lightweight data quality suggestions from the
selected person and graph data already loaded for the authenticated admin
surface. These suggestions are advisory, are not persisted and must not mutate
people or relationships.

Runtime merge/dedupe remains closed. Any future merge must be a separate
owner-approved phase with explicit permission, affected-record preview,
transaction behavior, revision/audit trail, export/stable-ID compatibility,
privacy review and rollback.

Ly do:

- Lightweight guidance improves daily genealogy editing without introducing a
  full-tree scan or new service boundary.
- Same-name people can be legitimate, so warning evidence cannot authorize
  automatic merge.
- Person identity touches relationships, lineage, layout, revisions, privacy
  and exports; merge without audit and rollback would be unsafe.

## Decision 159 - Tree quick-create duplicate suggestion stays client-side and advisory

Chon:

Plan A-05 may suggest similar existing members while an operator quick-creates a
relative in the Tree Editor, but the suggestion must remain advisory and use
only data already loaded for the Tree Editor. Choosing an existing member
switches to the existing relationship attach path; choosing to continue creates
a new person through the existing `createPerson()` flow.

The bundle does not add a dedupe table, unique constraint, database merge flow,
new route, permission key, schema change or service Worker.

Ly do:

- Duplicate prevention is useful at the point of quick creation, but family
  trees can legitimately contain people with the same name.
- Keeping matching advisory avoids changing genealogy business rules.
- Using the already loaded graph preserves the current permission and privacy
  boundary.

## Decision 158 - Tree inline create person reuses existing services

Chon:

Plan A-03 may add a Tree Editor inline create-person UX, but it must compose the
existing `createPerson()` and relationship services instead of adding schema,
routes, permission keys or a parallel mutation path. The UI may collect compact
Vietnamese fields for a new relative, then submit internal IDs and existing
field names behind the form.

Ly do:

- Tree editing is the highest-value genealogy workflow and should not require
  leaving the tree for a simple new relative.
- Reusing existing services preserves server-side permission checks,
  validation, revision logging and relationship cycle checks.
- Keeping IDs internal avoids exposing UUID entry while preserving service
  contracts.

## Decision 157 - Vietnamese cultural UI favors names and kinship labels over manual IDs

Chon:

Vietnamese genealogy UI should prefer Vietnamese kinship language and member
name selectors on operator-facing forms. UUIDs and English internal enum/API
values remain allowed as hidden submitted values and implementation details,
but normal relationship editing should not ask users to remember or paste IDs
when a permission-checked member list is already available.

The relationship actions, validation, database fields, permission keys, route
structure and service contracts remain unchanged.

Ly do:

- Genealogy work is naturally name- and relationship-centered, not ID-centered.
- Keeping IDs internal preserves existing service contracts and avoids schema or
  permission changes.
- Using already permission-checked member data avoids a new runtime API surface.

## Decision 156 - Tree Editor relationship picker keeps UUID internal

Chon:

Plan A-01 may replace the Tree Editor user-facing related-person UUID input
with a Vietnamese searchable member picker sourced from the already loaded
admin tree graph. The UI may show names, birth year, generation and branch
information, but the submitted internal field remains `related_person_id` and
the selected value remains the person UUID.

The existing tree editor server actions, relationship service, route,
permission keys, database fields and business rules stay unchanged.

Ly do:

- Users should not need to remember or paste UUIDs for normal relationship
  editing.
- Using the already loaded admin tree graph avoids a new API surface and keeps
  the current permission/privacy boundary.
- Keeping UUID as the internal value preserves existing relationship service
  contracts.

## Decision 155 - Routine public monitoring snapshots are not authenticated smoke

Chon:

Phase 132 may record routine unauthenticated production monitoring for `/`,
`/tree` and `/auth/login`, including HTTP status, Vietnamese public UI copy,
obvious server-error checks and forbidden public marker counts. It must not
run authenticated smoke, request credentials, deploy, push, mutate data,
change schema/auth/permission/runtime behavior, expand export/import/media/
backup behavior, create Workers, change OpenNext/Wrangler config or add
dependencies.

Ket qua:

- Public monitoring PASS for the three approved routes.
- Authenticated smoke remains
  `PHASE_130_BLOCKED_MISSING_EXPLICIT_AUTHENTICATED_SMOKE_ENV`.
- Public/static evidence remains separate from authenticated PASS.

Ly do:

- Routine monitoring is useful operational evidence, but it cannot prove
  authenticated role, permission, privacy or export behavior.
- Keeping snapshots public-only avoids credential handling and production data
  exposure.
- The authenticated smoke retry remains gated by explicit shell-only env and
  owner approval.

## Decision 154 - Phase 131 monitoring/prep is not authenticated smoke

Chon:

Phase 131 may record lightweight public production monitoring and prepare a
future authenticated smoke retry with shell-only placeholders. It must not run
authenticated requests, request credentials, deploy, push, mutate data, change
auth/permission logic, expand runtime export/import/media/backup behavior,
create Workers, change OpenNext/Wrangler config or add dependencies.

Public monitoring is allowed only when local `main` and `origin/main` are
synchronized and the worktree is clean. Static checks and public monitoring
must not be promoted to authenticated PASS.

Ly do:

- Phase 130 remains blocked until explicit shell-only authenticated smoke
  material exists in the execution process.
- Public route health is useful operational evidence but cannot prove
  authenticated permission, privacy or export behavior.
- Separating monitoring/prep from authenticated execution keeps credentials
  out of docs, chat, logs and committed files.

## Decision 153 - Phase 130 must remain blocked when explicit smoke env is absent

Chon:

Phase 130 may execute authenticated production requests only when all required
shell-only smoke variables are already present in the execution process. If
any variable is missing, execution must stop before network requests and record
`PHASE_130_BLOCKED_MISSING_EXPLICIT_AUTHENTICATED_SMOKE_ENV`.

Static checks, public smoke and prior deploy evidence must not be promoted to
authenticated PASS.

Ket qua:

- Git synchronization and pre-smoke static gates passed.
- All four explicit Phase 129 smoke variables were missing.
- No authenticated network request was performed.
- Auth/session, permission, authenticated privacy/UI and live export evidence
  remain unverified.

Ly do:

- Missing shell-only material prevents safe authenticated verification.
- Requesting or reconstructing credentials would violate owner approval.
- Honest blocked evidence is safer than an inferred PASS.

## Decision 152 - Authenticated production smoke requires explicit shell-only material

Chon:

Phase 129 may document authenticated production smoke readiness, operator
prerequisites, role/privacy/export/UI matrices and safe-skip behavior. It must
not run authenticated requests unless explicit shell-only smoke material is
already configured. Real authentication material must never be requested in
chat, written to docs, printed to logs or committed.

If prerequisites are missing, the only valid result is:

`SAFE_SKIP_MISSING_EXPLICIT_AUTHENTICATED_SMOKE_ENV`

Ly do:

- Authenticated production smoke can expose session material and private
  responses if handled casually.
- Shell-only placeholders let the owner/operator prepare a later run without
  turning documentation into a credential store.
- SAFE_SKIP preserves honest evidence and must not be upgraded to PASS from
  public smoke or static checks.
- This readiness phase must not change auth, permissions, schema, runtime,
  Worker, deployment or dependencies.

## Decision 151 - Phase 128 deploys only the synchronized Phase 125-127 bundle

Chon:

Phase 128 may deploy only when local `main` and `origin/main` are synchronized,
the working tree is clean and all required pre-deploy gates pass. The approved
deploy path is the existing manual GitHub Actions `Cloudflare Deploy` workflow.
Post-deploy verification is lightweight and read-only; authenticated smoke must
safe-skip when explicit shell-only smoke material is unavailable.

Result:

- The sync gate returned `0 0` at commit `692920a`.
- GitHub Actions run `27817582152` deployed successfully.
- Public production smoke passed.
- Authenticated smoke safe-skipped because explicit authenticated-smoke
  environment was unavailable.

Ly do:

- Deploying only a synchronized commit keeps the deployed source traceable.
- Reusing the existing workflow avoids unapproved Worker/config/dependency
  drift.
- Safe-skipping authenticated smoke avoids requesting or exposing credentials.
- Deploy approval does not authorize migration, DB mutation, schema/auth
  changes or runtime feature expansion.

## Decision 150 - Phase 127 is a manual deploy readiness gate, not a deploy

Chon:

Phase 127 may add a deploy-readiness document and static checker after recent
runtime/UI changes. It may review small JSON export hardening, small JSON
export smoke evidence and Vietnamese UI copy normalization for a future manual
deploy decision. It must not deploy, push, create migrations, create SQL files,
apply DB changes, mutate data, change schema, change permission/auth logic,
expand export/import/GEDCOM/ZIP/media/backup runtime, create Workers, change
OpenNext/Wrangler config, mutate deploy workflows or add runtime dependencies.

Ly do:

- Recent runtime/UI changes need a clear readiness gate before any production
  deploy decision.
- `READY_FOR_MANUAL_DEPLOY_CHECK` is an operator decision state, not proof that
  production has been deployed.
- Worker, dependency, privacy, DB and deploy boundaries must remain explicit so
  a later AI does not treat readiness documentation as deploy authorization.

## Decision 149 - Vietnamese UI copy normalization is display-only

Chon:

UI-VN-01 may normalize user-visible UI labels, headings, helper text,
placeholders, dropdown labels and service/validation messages to Vietnamese
with diacritics. It must keep code/internal values unchanged, including route
paths, identifiers, permission keys, enum values, database names, JSON keys,
package/env names and migration/SQL contracts. It does not authorize schema,
migration, DB apply, runtime expansion, Worker, dependency, deploy or push
work.

Ly do:

- User-visible Vietnamese copy improves clarity without changing product
  behavior or contracts.
- Form option display labels can change safely as long as submitted values stay
  unchanged.
- Internal values must remain stable for routes, permissions, database schema,
  export/import compatibility and existing static checkers.

## Decision 148 - Phase 126 smoke is static review only, not export expansion

Chon:

Phase 126 may add local static/source smoke checks and docs for the Phase 125
small `family.json` export hardening. It must not call the database, generate
real production exports, add fixtures from production data, expand large JSON,
GEDCOM, ZIP, import, media or backup runtime, add dependencies, create Workers,
change OpenNext/Wrangler config, deploy, push or mutate data.

Ly do:

- Phase 125 already changed the approved small JSON export path; Phase 126 is
  only the post-integration review and handoff hardening.
- Privacy and lineage behavior can be reviewed from source without live DB
  access or production data.
- Large export/import/media/backup work remains service-boundary governed.

## Decision 147 - Phase 125 allows only small main-app JSON export hardening

Chon:

Owner-approved Phase 125 may harden the existing small/main-app `family.json`
export path with metadata, lineage sections from existing verified tables and
privacy-safe non-admin builder behavior. This approval does not authorize large
JSON export runtime, GEDCOM/ZIP runtime expansion, media export/import,
backup/restore runtime, import parser runtime, migration, SQL, DB apply,
dependency, Worker, OpenNext/Wrangler config, deploy or push.

Ly do:

- The current JSON export already exists and can be hardened without adding a
  new runtime surface or dependency.
- `family.json` is the canonical portability format and should include lineage
  metadata after the lineage tables were applied and verified.
- Public/family export behavior must be safe even before a public/family export
  route is approved.
- GEDCOM/ZIP/media/backup work remains service-boundary governed because it can
  affect Worker size, timeout, privacy and rollback requirements.

## Decision 146 - Export/import final readiness is an owner decision gate, not runtime approval

Chon:

Phase 122C-124C may add export/import compatibility matrices, portability
backup final readiness review, a decision matrix and a static checker. This
bundle confirms docs/contracts/examples readiness for owner decision only. It
does not authorize runtime export/import, parser implementation, backup or
restore runtime, media bundle work, GEDCOM/ZIP heavy processing, migration,
SQL, DB apply, dependency, Worker, OpenNext/Wrangler config, deploy or
production mutation changes.

Ly do:

- Compatibility matrices help the owner choose a future path without opening
  unsafe runtime surfaces.
- Restore/import apply is production mutation and must remain owner-gated with
  backup, rollback and verification evidence.
- GEDCOM/ZIP/media/backup work can affect Worker size, startup and privacy, so
  it must follow service-boundary approval before runtime.
- The default recommendation remains defer implementation, with only small
  main-app JSON export hardening as a possible separately approved low-risk
  candidate.

## Decision 145 - Export/import static examples are review evidence, not runtime fixtures

Chon:

Phase 122B-124B may add static export/import/backup examples, acceptance
checklists and dry-run report shapes, but those examples are documentation
only. They do not authorize runtime fixtures, parser implementation, large
JSON/GEDCOM/ZIP expansion, backup/restore runtime, service Workers, dependency,
config, deploy or production mutation changes.

Ly do:

- Concrete examples make future export/import reviews testable without opening
  unsafe runtime surfaces.
- Backup and restore examples can be mistaken for runnable fixtures, so the
  design-only boundary must remain explicit.
- Public/family/admin export examples need privacy review before code changes.
- Import apply remains a production mutation and requires owner approval,
  backup/snapshot evidence and rollback gates.

## Decision 144 - Export/import portability work remains design-only until service/runtime approval

Chon:

Phase 122A-124A records export boundary, import boundary and data portability
contracts only. These docs do not authorize large JSON/GEDCOM/ZIP runtime,
large import parser/runtime, media export/import, production mutation,
export-service Worker, import-service Worker, dependency, config or deploy
changes.

Ly do:

- `family.json` must remain the canonical long-term portability format, but
  versioning and compatibility must be reviewed before runtime expansion.
- Large ZIP/GEDCOM/export assembly and large import validation are Worker-size,
  timeout and privacy risks.
- Import apply is a production mutation and requires owner approval, backup,
  rollback and verification gates.
- Media and persistent warnings remain separately deferred and must not sneak
  into export/import runtime through portability planning.

## Decision 143 - Option D permits only deterministic inline admin hints from already loaded data

Chon:

Phase 121A may add lightweight warning helpers and UI to existing admin people,
genealogy and tree surfaces only when findings are derived from data those
surfaces already loaded. The approval does not include persistent warning
storage, new queries for warning generation, full-tree scans, media work,
service Workers, dependencies or deploy changes.

Ly do:

- Deterministic inline hints can improve admin review without creating a new
  data-quality subsystem.
- Existing server-side permission boundaries remain the authority for access.
- Empty state and warning copy must state the displayed-data boundary and must
  not imply a complete tree scan.
- Persistent lifecycle, heavy scans and media processing remain separate
  schema/service decisions under the Worker guardrail and service roadmap.

## Decision 142 - Default implementation decision remains defer; inline hints need separate approval

Chon:

After final review of Phase 118A-120C, choose option A by default: defer all media, persistent data-quality and runtime warning implementation. Option D, lightweight inline admin warning UI without schema, is only conditionally ready and still requires a separate explicit owner-approved runtime phase.

Ly do:

- Media still lacks an approved schema, storage provider, RLS/signed-access model and service contract.
- Persistent warnings still lack an approved lifecycle, RLS/privacy model and migration gate.
- Full-tree, duplicate, import-wide and export-readiness scans remain service/offline workloads.
- Inline hints can potentially use already loaded admin data, but they are runtime changes and must not be inferred from docs-only readiness.

## Decision 141 - Static examples are acceptance evidence, not runtime or schema authorization

Chon:

Phase 118C-120C may provide illustrative media payloads, warning examples, Vietnamese copy and acceptance checklists, but those examples remain documentation only. They do not authorize fixtures, runtime data, schema, migration, storage, scans, warning UI, Worker creation or deploy.

Ly do:

- Concrete examples make future reviews testable without opening implementation surfaces.
- Media examples can expose privacy/storage mistakes, so unsafe cases and service gates must be explicit before runtime work.
- Warning examples need deterministic codes, consistent severity and fail-closed public behavior before persistence or scanning.
- UX acceptance criteria can be reviewed now while warning source, persistence and service boundaries remain separately owner-gated.

## Decision 140 - Media/data-quality static contracts require approval gates before schema or service work

Chon:

Phase 118B-120B records static media, data-quality and admin warning UX contracts with approval gates only. These contracts do not authorize schema, migration, SQL, storage bucket creation, media upload, thumbnail/image processing, persistent warning tables, full-tree scans, Worker creation, dependency changes or deploy.

Ly do:

- Phase 118A-120A established boundary design but future agents still need concrete no-go gates before implementation.
- Media storage and processing require owner approval, storage/provider selection, RLS/privacy review, export/backup impact review and service boundary review before any real migration or Worker.
- Persistent warnings and full-tree quality scans require schema/privacy/service approval before they can become database or runtime behavior.
- Admin warning UX can have static copy and accessibility contracts now, but runtime components must wait until warning source and persistence model are approved.

## Decision 139 - Media and data-quality work remain boundary design before schema/runtime

Chon:

Phase 118A-120A records media, data-quality warning and admin warning UX plans as design-only boundary work. It does not authorize schema, migration, storage bucket, media upload, thumbnail generation, full-tree scan, runtime warning implementation, Worker creation, dependency change or deploy.

Ly do:

- Media files and thumbnails can be large, private and dependency-heavy, so they must follow `docs/RUNTIME_WORKER_GUARDRAIL.md` and `docs/SERVICE_BOUNDARY_ROADMAP.md`.
- Data-quality scans and duplicate detection can become full-family or import-wide work that should be scheduled or service-boundary governed instead of folded into the main Worker by default.
- Admin warning UX can be planned now, but persistent warning records and runtime warning generation need separate schema/privacy/service approval.
- Future Phase 118B/119B/120B work must keep media, warning and scan boundaries explicit before any runtime or database implementation.

## Decision 138 - Lineage admin UI uses existing permissions and keeps heavy work deferred

Chon:

Grouped Phase 114-117 can integrate verified Vietnamese genealogy lineage tables into the main app as lightweight admin CRUD/UI and privacy-safe display work, using only existing permissions and no new schema, Worker, dependency or deploy change.

Ly do:

- Phase 113C recorded `PASS_MANUAL_SQL_DIAGNOSTIC` for `clans`, `clan_branches`, `generation_rules` and `person_branch_memberships`.
- Existing RLS policies already use `people.view` or `tree.view` for reads and `people.update`, `relationships.update`, `tree.edit_layout` or `settings.manage` for writes.
- Adding a dedicated lineage permission would require a future migration/permission phase and is outside Phase 114-117.
- Public routes must stay conservative: lineage membership data is not queried on public routes in this phase, and sanitizer logic clears lineage fields unless they are explicitly public-safe.
- Export/import/GEDCOM/ZIP/media/data-quality work remains deferred to boundary-governed phases and must not be folded into this UI integration.

## Decision 137 - Manual SQL diagnostic PASS unblocks grouped Phase 114-117

Chon:

Record Vietnamese genealogy post-apply DB verification as `PASS_MANUAL_SQL_DIAGNOSTIC` based on owner/operator manual read-only SQL diagnostic results from the Supabase Dashboard SQL Editor for project `frkyeuxrlcflmsxxsolp`. Grouped Phase 114-117 can start from this evidence.

Ly do:

- Owner/operator confirmed required lineage tables exist: `clans`, `clan_branches`, `generation_rules` and `person_branch_memberships`.
- Owner/operator confirmed excluded tables do not exist: `person_names`, `person_life_events`, `person_burials` and `person_media`.
- Owner/operator confirmed existing core tables still exist: `people`, `families`, `family_parents`, `family_children` and `couple_relationships`.
- Owner/operator confirmed RLS is enabled and policies exist for all four new lineage tables.
- Owner/operator confirmed zero rows in all four new lineage tables, so no seed/backfill was recorded.
- Codex did not run DB verification, did not run the REST verifier, did not execute SQL and did not use credentials for this PASS record.
- The previously exposed service role key must still be rotated or revoked before future credential-assisted verification.

## Decision 136 - Phase 113B-fix requires SQL metadata evidence before PASS

Chon:

Keep Vietnamese genealogy post-apply DB verification at `NOT_VERIFIED` after the owner-provided REST-only verifier output returned `FAIL` for all four required lineage tables. Do not record PASS until sanitized read-only SQL metadata evidence proves required table existence, excluded table absence, existing core table safety, RLS enabled status, policies and no seed/backfill row counts.

Ly do:

- The available owner-provided verifier output is FAIL evidence, not PASS evidence.
- A REST-only verifier cannot prove RLS enabled status or `pg_policies` contents.
- The verifier cannot distinguish every failure mode between migration not applied, wrong project ref, REST schema cache/exposure issues and metadata access limits.
- Service role key material was exposed in chat and must be rotated or revoked before further credential-assisted verification.
- Phase 114-117 should remain blocked until sanitized SQL evidence is provided or the owner explicitly accepts proceeding with this limitation recorded.

## Decision 135 - Phase 113B safe-skip does not unblock Phase 114-117

Chon:

Record Phase 113B as `PASS_WITH_SAFE_SKIP` because explicit shell-only verification env was missing, while keeping independent DB verification for required tables, RLS, policies, excluded scope, no seed/backfill and existing table safety incomplete.

Ly do:

- The verifier safe-skipped before creating a Supabase client, as required by the shell-only credential contract.
- No `.env.local`, `.dev.vars`, credential file or secret value was read.
- A safe-skip proves the verifier guardrail works, but does not prove the applied database state.
- Phase 114-117 should wait for credential-assisted read-only verification unless the owner explicitly accepts proceeding with owner-confirmation-only evidence and the limitation recorded.

## Decision 134 - Owner manual apply confirmation is not independent DB verification

Chon:

Record Phase 113A as `OWNER_CONFIRMED_APPLIED` based on owner/operator confirmation, while keeping DB verification, RLS/policy DB verification and excluded-scope DB verification as `SKIPPED_MISSING_EXPLICIT_VERIFICATION_CREDENTIALS` until shell-only read-only verification credentials are provided.

Ly do:

- The owner/operator confirmed manual apply success through Supabase Dashboard SQL Editor for the exact approved migration and target project.
- The migration checksum still matches the approved Phase 112/113 fingerprint.
- Codex did not apply DB locally, rerun migration or execute SQL mutation in Phase 113A.
- Independent DB verification requires explicit shell env and must not read `.env.local`, `.dev.vars` or secrets from files.
- Phase 114-117 should wait for credential-assisted read-only DB verification if the owner wants independent DB evidence before runtime/UI planning.

## Decision 133 - Phase 113 local apply requires safe one-file execution tooling

Chon:

Record the owner-approved Phase 113 apply attempt as `OWNER_ACTION_REQUIRED_MANUAL_DASHBOARD_APPLY` because this workstation has no Supabase CLI in PATH and no explicit DB apply/verification credentials in shell state.

Ly do:

- Owner approval, target project ref and backup/snapshot were provided.
- The approved migration checksum matches the Phase 112 fingerprint.
- Applying from local tooling must prove the operation targets `frkyeuxrlcflmsxxsolp` and applies only `db/migrations/20260618_0008_vietnamese_genealogy_first_migration.sql`.
- Without safe one-file execution tooling, Codex must not run DB apply, extra SQL, seeds or backfills.
- Phase 114-117 runtime/UI planning should wait until owner manual apply result and read-only DB verification are recorded.

## Decision 132 - Phase 112 is apply readiness only

Chon:

Phase 112 prepares readiness for the Phase 111 Vietnamese genealogy migration but does not authorize DB apply. Phase 113 can proceed only after separate explicit owner approval for DB apply, confirmed Supabase project ref, current backup/snapshot, rollback owner/path and post-apply verification plan.

Ly do:

- The Phase 111 migration file exists and remains `NOT_APPLIED`.
- Applying schema changes is a separate risk boundary from creating a migration file.
- The migration checksum/fingerprint must be recorded before apply so Phase 113 can detect drift.
- RLS/privacy, backup/snapshot and rollback must be reviewed before any production data mutation.

## Decision 131 - Phase 111 creates only the approved lineage migration file

Chon:

Owner approval for Phase 111 authorizes only real migration file creation for `clans`, `clan_branches`, `generation_rules` and `person_branch_memberships`. `person_names`, life events, burials, media, heavy export/import/GEDCOM/ZIP work, runtime changes, Worker/service creation and DB apply stay excluded.

Ly do:

- Phase 110B narrowed the first migration to the smallest useful Vietnamese lineage metadata layer.
- The owner explicitly excluded `person_names`, event, burial and media tables from this migration.
- RLS must be enabled from table creation and must use existing permissions instead of introducing a new permission seed in Phase 111.
- Phase 111 is file creation only; Phase 112 must prepare apply readiness and Phase 113 needs separate owner approval before DB apply.

## Decision 130 - First Vietnamese genealogy migration scope is narrowed and owner-gated

Chon:

Phase 111 must not start until the owner explicitly approves real migration file creation. The proposed first migration scope is limited to `clans`, `clan_branches`, `generation_rules` and `person_branch_memberships`; `person_names` is optional and requires owner decision.

Ly do:

- The Phase 108-110 owner review found the broader candidate direction sound but too broad for a first migration.
- `person_life_events`, `person_burials`, `person_media`, media processing and large export/import/GEDCOM/ZIP work add privacy, workflow or service-boundary risk and stay deferred.
- First migration design must stay additive-only, RLS-enabled and compatible with existing `people`, relationship truth, tree layout, revisions and export/backup foundations.
- Phase 110B remains docs/checker only; no migration file, SQL execution, DB apply, runtime app change, Worker creation or dependency change is authorized.

## Decision 129 - Schema candidate needs owner changes before Phase 111

Chon:

Recommend `REQUEST_CHANGES_BEFORE_PHASE_111` for the Phase 108-110 schema candidate. Phase 111 should not create a real migration file until the first migration scope, RLS policy shape, export/import JSON compatibility and `person_names` inclusion are explicitly approved.

Ly do:

- The candidate direction is sound, but first migration should be narrower than the full candidate.
- `clans`, `clan_branches`, `generation_rules` and `person_branch_memberships` are the safest first migration scope.
- `person_life_events`, `person_burials` and `person_media` add privacy/workflow/media-boundary risk and should be deferred.
- Phase 111 remains file-creation only; DB apply still requires a separate later approval.

## Decision 128 - Vietnamese genealogy schema candidate stays additive and gated

Chon:

Phase 108-110 stays candidate-only. The preferred schema direction is normalized metadata for clan, branch, generation rules, branch memberships and person names first; life events and burials are recommended next; media remains later until media/storage boundary design is approved.

Ly do:

- Normalized metadata preserves compatibility with `people`, relationship tables, tree layout, revisions, public/private filtering and export foundation.
- Candidate review must prove additive-only migration strategy before any real migration file exists.
- Heavy export/import/media/GEDCOM/ZIP work must remain governed by runtime worker guardrail and service-boundary roadmap.
- Phase 110 is only an approval gate; Phase 111 needs owner approval to create a real migration file, and Phase 113 needs separate approval before DB apply.

## Decision 127 - Domain roadmap is not runtime or schema authorization

Chon:

Domain roadmap must not be interpreted as runtime/schema authorization. Heavy export/import/media/GEDCOM/ZIP work must follow worker guardrail and service-boundary roadmap.

Ly do:

- Phase 103-107 is specification/readiness only.
- `Required Now` means required for the documentation bundle, not permission to create schema, migration, DB apply, runtime, UI, service Worker or production changes.
- Future heavy processing needs explicit boundary-governed phases before implementation.

## Decision 126 - Vietnamese genealogy Bundle 1 stays docs/checker only

Chon:

Phase 103-107 chot domain gia pha Viet Nam bang mot tai lieu tong hop va checker static. Khong tao migration, khong apply DB, khong deploy, khong sua runtime app.

Ly do:

- Current model da co people, relationship, tree layout, privacy va export foundation, nhung can chot nghiep vu Viet Nam truoc khi thiet ke schema.
- Cac khai niem dong ho, chi, nhanh, doi/the he, truong ho, truong chi, ten huy/ten tu/phap danh, ngay am lich va mo phan co anh huong schema/export/privacy.
- Phase 108-110 moi la noi thiet ke schema candidate, safety check va approval gate.
- Giu RLS, auth, permission, public privacy va export/backup boundary hien co.

## Decision 125 - Next phase remains verification environment completion

Chon:

De xuat Phase 103 la Verification Environment Completion.

Ly do:

- DB verification van thieu shell-only credential.
- Authenticated smoke van thieu explicit base URL/auth material.
- Fallback removal khong du dieu kien va can approval rieng.

## Decision 124 - Fallback removal remains blocked after consolidation

Chon:

Ghi fallback removal readiness la `NOT_READY_FOR_FALLBACK_REMOVAL`.

Ly do:

- DB verification van la skip, khong phai PASS.
- Authenticated endpoint smoke van la skip, khong phai PASS.
- Local/static PASS la can thiet nhung khong du de go fallback.

## Decision 123 - Local smoke PASS does not upgrade authenticated smoke SKIP

Chon:

Ghi authenticated endpoint `SKIPPED_MISSING_EXPLICIT_ENV`; ghi rieng permission guard va dry-run local/static `PASS`.

Ly do:

- Khong co base URL/auth material explicit.
- Static source evidence khong chung minh authenticated runtime access.
- Khong fake PASS va khong goi worker/backup that.

## Decision 122 - Assisted DB run remains a skip without shell credentials

Chon:

Ghi `SKIPPED_MISSING_VERIFICATION_CREDENTIALS`, four permissions `NO`, role assignments `NOT_RUN`.

Ly do:

- Shell khong co ba DB verification env.
- Verifier return truoc network/client creation.
- Owner-confirmed apply khong duoc doi thanh independent PASS.

## Decision 121 - Verification credentials are owner-operated shell state

Chon:

Phase 98 chi huong dan set/clear credential trong current CMD/PowerShell bang placeholder. Khong luu vao repo env file va khong yeu cau paste value vao chat.

Ly do:

- Giu secret ngoai source/docs/log.
- Cho phep verifier/smoke dung process env hien co va safe-skip neu thieu.
- Clear-shell procedure giam rui ro credential ton tai sau verification.

## Decision 120 - Fallback removal remains blocked after Phase 97

Chon:

Ket luan `NOT_READY_FOR_FALLBACK_REMOVAL` va de xuat Phase 98 Verification Credential Completion.

Ly do:

- DB verification va role assignments chua co independent PASS.
- Authenticated endpoint smoke chua co PASS.
- Local/static PASS khong thay the hai evidence tren.
- Fallback removal va execute/restore can approval rieng sau verification completion.

## Decision 119 - Verification completion preserves external skips

Chon:

Phase 96 chi ghi PASS cho hai local/static smoke. DB verifier va authenticated endpoint smoke giu nguyen SKIP vi shell env thieu; khong suy dien PASS tu owner-confirmed migration apply.

Ly do:

- Local/static evidence khong chung minh database rows hoac authenticated production access.
- Khong fake PASS khi credential/auth material khong co.
- Fallback removal van NOT_READY cho den khi ca DB verify va authenticated smoke PASS.

## Decision 118 - Authenticated smoke accepts shell-only cookie or bearer

Chon:

Authenticated smoke Phase 95 nhan cookie hoac bearer token tu explicit shell env, uu tien cookie neu ca hai co mat. Script chi gui auth material den `/admin/backups` va `/api/admin/backups/service-dry-run`.

Ly do:

- Khong hardcode va khong doc env file.
- Co the smoke session trinh duyet hoac token-based session ma khong doi Auth config.
- Safe-skip truoc network neu thieu base URL, expected user hoac auth material.
- Output chi ghi auth method name va status, khong ghi value/header/body.

## Decision 117 - DB verifier uses confirmed permission schema and sanitized failures

Chon:

Phase 94 query truc tiep ba bang da duoc migration xac nhan: `permissions`, `roles`, `role_permissions`. Verifier chi dung shell-only env Phase 93 va chi SELECT.

Ly do:

- Foundation migration da xac nhan cac cot can thiet, nen khong fake schema limitation.
- Permission va role assignment co the verify doc lap trong mot lan read-only.
- Raw provider error message co the chua endpoint hoac metadata nhay cam; output chi co query stage va non-secret error code.
- Thieu env hoac mode khong dung `read_only` thi return truoc client creation, khong network.

## Decision 116 - Verification credentials are shell-only and SELECT-only

Chon:

Backup permission DB verifier chi dung `BACKUP_PERMISSION_VERIFY_SUPABASE_URL`, `BACKUP_PERMISSION_VERIFY_SUPABASE_SERVER_KEY` va `BACKUP_PERMISSION_VERIFY_MODE=read_only` tu environment variables da set truc tiep trong shell/CI secret.

Ly do:

- Boundary Phase 93-97 cam doc `.env.local` va `.dev.vars`.
- Supabase khong co generic read-only key; server key co the co quyen rong nen script phai bi gioi han SELECT/read-only.
- Script chi SELECT permissions, roles va role_permissions.
- Cam insert/update/delete/upsert/RPC mutation va khong in credential/connection string.
- Thieu env thi safe-skip, khong network call va khong doan ket qua.

## Decision 115 - Apply handoff preserves evidence limitations

Chon:

Phase 92 ghi migration apply la `OWNER_CONFIRMED_APPLIED`, DB verification la `SKIPPED_MISSING_VERIFICATION_CREDENTIALS`, runtime smoke la `PARTIAL_LOCAL_STATIC_ONLY`, va fallback readiness la `NOT_READY_FOR_FALLBACK_REMOVAL`.

Ly do:

- Khong nang cap owner confirmation thanh automated DB proof.
- Khong nang cap local/static smoke thanh authenticated production smoke.
- Future fallback removal can verification completion va separate owner approval.

## Decision 114 - Fallback removal is not ready after partial verification

Chon:

Phase 91 ket luan `NOT_READY_FOR_FALLBACK_REMOVAL`; giu `permissions.manage` trong API/UI guards.

Ly do:

- Migration apply la owner-confirmed nhung DB permission/role rows chua duoc verifier query thanh cong.
- Runtime smoke moi PASS local/static; authenticated endpoint smoke chua chay.
- Go fallback can separate owner approval sau khi DB verify va endpoint smoke PASS.

## Decision 113 - Runtime smoke remains local/static without explicit env

Chon:

Phase 90 chap nhan post-migration endpoint smoke safe-skip khi thieu `BACKUP_PERMISSION_SMOKE_BASE_URL` va `BACKUP_PERMISSION_SMOKE_EXPECTED_USER`; permission guard va dry-run smoke van chay local/static.

Ly do:

- Khong tu doan production URL, user identity hoac authentication context.
- Local/static smoke van xac nhan fallback, dry-run boundary va no-worker-call markers.
- Runtime smoke chua du bang chung de go fallback `permissions.manage`.

## Decision 112 - Post-apply verification must safe-skip without admin credentials

Chon:

Phase 89 them verifier read-only cho backup permissions va role assignments. Khi local khong co `NEXT_PUBLIC_SUPABASE_URL` va `SUPABASE_SERVICE_ROLE_KEY`, verifier tra `SKIPPED_MISSING_VERIFICATION_CREDENTIALS` thay vi doan ket qua hoac in secret.

Ly do:

- Owner-confirmed apply va Codex-independent DB verification la hai lop bang chung khac nhau.
- Khong duoc che thieu credential bang mock data.
- Fallback `permissions.manage` phai giu nguyen trong khi DB verification con limited.

## Decision 111 - Record manual Dashboard migration apply as owner-confirmed execution

Chon:

Phase 88 ghi nhan migration `db/migrations/20260618_0007_backup_operator_permissions.sql` da duoc owner chay thu cong bang Supabase Dashboard SQL Editor tren project ref `frkyeuxrlcflmsxxsolp`.

Ly do:

- Owner da xac nhan apply thanh cong tren dung project.
- Local workspace khong co Supabase CLI, project link hoac DB credential de tai hien CLI apply.
- Phase 89 se tach post-apply verification khoi execution record va khong suy dien qua muc bang chung hien co.
- Fallback `permissions.manage` va runtime execute/restore van giu nguyen.

## Decision 110 - Execution readiness is not permission to apply DB

Chon:

Phase 87 danh dau backup permission migration execution readiness ve docs/check only, nhung van blocked cho den khi owner explicitly approve real apply.

Ly do:

- Runbook, checklist, rollback plan va approval gate chi la readiness artifact.
- Migration has not been run va no DB mutation.
- Fallback `permissions.manage` phai giu lai den khi post-migration smoke that pass va owner approve removal.

## Decision 109 - Backup permission apply requires explicit owner approval marker

Chon:

Future apply phase cho backup permission migration phai co marker `OWNER_APPROVAL_REQUIRED_BEFORE_APPLYING_BACKUP_PERMISSION_MIGRATION=true` va owner approval rieng truoc khi chay migration.

Ly do:

- Migration file ton tai khong dong nghia voi duoc phep apply DB.
- Apply phai tach khoi fallback removal va runtime execute/restore enablement.
- Supabase project, DB backup/snapshot, rollback owner, smoke owner va apply window phai duoc xac nhan truoc.

## Decision 108 - Backup permission rollback drill stays documented before execution

Chon:

Rollback cho backup permission migration phai duoc drill bang docs/check truoc khi apply that, nhung Phase 85 khong chay rollback va khong mutate DB.

Ly do:

- Permission migration co the lam sai access UI/API neu role mapping hoac project target sai.
- Fallback `permissions.manage` la safety bridge va khong duoc go bo som.
- Restore-from-snapshot va permission-assignment rollback can co owner/rollback owner truoc khi execution phase bat dau.

## Decision 107 - Pre-apply backup permission migration requires explicit no-go gate

Chon:

Khong apply backup permission migration neu thieu owner approval, DB backup/snapshot, dung Supabase project, static checks, canonical path check, rollback owner, smoke owner, expected role confirmation hoac fallback removal understanding.

Ly do:

- Permission migration la DB mutation that nen can gate truoc khi chay.
- Runtime fallback `permissions.manage` van phai con cho den khi post-migration smoke pass.
- Checklist giup phase apply sau khong phai doan lai dieu kien an toan.

## Decision 106 - Canonical backup permission migration path is db/migrations

Chon:

Backup permission migration file source of truth la `db/migrations/20260618_0007_backup_operator_permissions.sql`.

`supabase/migrations/20260618_0007_backup_operator_permissions.sql` la wrong old path va khong duoc giu duplicate sau Phase 83.

Ly do:

- Repo GIA PHA dung `db/migrations/` lam canonical migration directory.
- `check:migrations` doc va tooling hien co doc tu `db/migrations/`.
- Tranh hai source of truth cho cung mot migration.
- Van khong chay migration/apply DB neu chua co owner approval rieng, DB backup/snapshot va rollback gate.

## Decision 105 - Real migration handoff keeps execution blocked

Chon:

Phase 82 tong hop trang thai migration file backup permission da tao trong repo, nhung van chan execution cho den khi co owner approval rieng.

Ly do:

- File migration ton tai khong dong nghia voi da apply DB.
- Runtime fallback va execute/restore boundary can duoc giu cho den khi migration duoc apply va smoke that pass.
- Future execution can DB backup/snapshot va rollback plan.

He qua:

- Migration file path duoc ghi la `supabase/migrations/20260618_0007_backup_operator_permissions.sql`.
- Migration has not been run va no DB mutation.
- Fallback `permissions.manage` still remains until post-migration phase.

## Decision 104 - Post-migration smoke is safe-skip unless explicit env is set

Chon:

Phase 81 them smoke plan/script cho sau khi migration duoc apply, nhung script safe-skip neu thieu `BACKUP_PERMISSION_SMOKE_BASE_URL` hoac `BACKUP_PERMISSION_SMOKE_EXPECTED_USER`.

Ly do:

- Phase nay chua duoc phep goi production/network mac dinh.
- Post-migration smoke can duoc chuan bi truoc nhung chi chay route khi operator set explicit env.
- Smoke khong can token va khong duoc trigger backup/restore/storage.

He qua:

- `npm run smoke:backup-permission:post-migration` mac dinh SKIPPED trong local validation.
- Future execution phase co the set env explicit de smoke API/UI route an toan.

## Decision 103 - Runtime fallback removal waits for applied migration and real smoke

Chon:

Phase 80 chi tao plan bo fallback `permissions.manage`, khong sua runtime fallback trong API/UI.

Ly do:

- Migration file da duoc tao nhung chua apply DB.
- Neu bo fallback truoc khi DB co `backup.operator.view` va `backup.operator.dry_run`, operator access co the bi chan sai.
- Can smoke voi real user va rollback plan truoc khi thay runtime guard.

He qua:

- API/UI van giu fallback `permissions.manage`.
- Future fallback removal can migration applied confirmation, assignment confirmation, real-user smoke va owner approval.

## Decision 102 - Real migration file requires static verification before execution planning

Chon:

Phase 79 them static verification rieng cho migration file `supabase/migrations/20260618_0007_backup_operator_permissions.sql`, khong chay migration va khong goi DB.

Ly do:

- File migration that da ton tai trong repo nen can guardrail manh hon candidate checks.
- Can xac nhan role assignment khong cap backup permission cho viewer/public/anonymous roles.
- Can chan destructive SQL, secret/network text va runtime execute/restore action wording truoc execution planning.

He qua:

- `npm run check:backup-permission-real-migration-static-verification` la gate bat buoc truoc cac phase sau.
- Migration van chua duoc chay va runtime fallback `permissions.manage` van giu nguyen.

## Decision 101 - Backup operator permission migration file is created but not run

Chon:

Phase 78 tao real migration file trong `supabase/migrations/` cho `backup.operator.*`, nhung khong chay migration va khong apply DB.

Ly do:

- Owner chi approve file creation trong prompt nay.
- DB mutation, fallback removal va execute/restore runtime activation van can approval rieng.
- Migration can idempotent va static-checkable truoc khi co bat ky apply that nao.

He qua:

- Migration file la `supabase/migrations/20260618_0007_backup_operator_permissions.sql`.
- File co marker `DO_NOT_RUN_WITHOUT_SEPARATE_OWNER_APPROVAL`.
- Runtime fallback `permissions.manage` van giu nguyen.

## Decision 100 - Migration candidate handoff stops before real DB change

Chon:

Phase 77 tong hop SQL candidate, static safety, seed candidate smoke va approval checklist, nhung van dung truoc real migration file va DB mutation.

Ly do:

- Phase 73-77 tao du artifact de owner review nhung khong thay the explicit approval cho DB change.
- Candidate SQL khong phai migration that va khong nam trong `supabase/migrations/`.
- Execute/restore van high-risk va chua duoc bat runtime.

He qua:

- Runtime fallback `permissions.manage` van con.
- Future Phase 78 chi duoc tao migration file that neu owner explicitly approve.
- Khong deploy, khong chay SQL, khong mutate DB, khong production backup va khong secret commit trong bundle nay.

## Decision 099 - Real backup permission migration requires explicit approval gate

Chon:

Phase 76 tao approval checklist bat buoc truoc khi bat ky phase sau nao duoc tao migration that hoac apply DB cho `backup.operator.*`.

Ly do:

- Real migration se cham permission rows va role-permission mappings.
- Execute/restore la high-risk permission va khong duoc bat ngoai y muon.
- Can owner approval, DB backup/snapshot, rollback plan, production window va post-migration validation truoc khi thao tac DB.

He qua:

- Approval marker la `OWNER_APPROVAL_REQUIRED_BEFORE_BACKUP_PERMISSION_REAL_MIGRATION=true`.
- Neu thieu owner approval, SQL review, rollback, DB backup, production window, local checks, assignment confirmation, fallback plan hoac execute/restore boundary thi no-go.
- Phase 76 van khong tao migration that va khong mutate DB.

## Decision 098 - Backup permission seed candidate smoke stays source-static

Chon:

Phase 75 them smoke local de so sanh SQL candidate draft voi seed dry-run script, khong execute SQL va khong goi DB/network/env.

Ly do:

- Candidate SQL va dry-run plan can dong nhat truoc khi owner review approval checklist.
- Smoke source-static phat hien permission drift ma khong can Supabase secret hay database.
- Chua co approval migration/schema/DB mutation that.

He qua:

- `smoke:backup-permission:seed-candidate` chi doc file local va in JSON marker `BACKUP_PERMISSION_SEED_CANDIDATE_SMOKE_ONLY`.
- Candidate van khong phai migration that va van nam ngoai `supabase/migrations/`.
- Future real migration van can approval checklist.

## Decision 097 - Backup permission SQL candidate needs static safety gate

Chon:

Phase 74 them static safety checker rieng cho `scripts/backup-permission-sql-candidate.sql.draft`, khong chay SQL va khong cham DB.

Ly do:

- SQL candidate co the bi drift thanh destructive migration neu khong co guardrail.
- Static check can khoa destructive SQL, network URL, service-role/JWT wording va thieu marker owner approval.
- Check local giu an toan tren may khong co secret hoac Supabase env.

He qua:

- Candidate phai co `BACKUP_PERMISSION_SQL_CANDIDATE_ONLY` va `DO_NOT_RUN_ON_PRODUCTION_WITHOUT_OWNER_APPROVAL`.
- Candidate phai co idempotency concept va 4 permission names.
- Real migration van can approval checklist rieng truoc khi tao file/applied DB.

## Decision 096 - Backup permission SQL remains a draft candidate

Chon:

Phase 73 tao SQL candidate draft trong `scripts/backup-permission-sql-candidate.sql.draft`, khong tao migration that trong `supabase/migrations/` va khong chay SQL.

Ly do:

- Owner chua approve migration/schema/DB mutation that.
- Can co artifact review gan voi schema hien co truoc khi tao migration.
- Draft co the static check destructive SQL va secret/URL drift ma khong cham DB.

He qua:

- Candidate co `BACKUP_PERMISSION_SQL_CANDIDATE_ONLY` va `DO_NOT_RUN_ON_PRODUCTION_WITHOUT_OWNER_APPROVAL`.
- Future migration that van can approval, DB backup/snapshot, rollback va validation rieng.
- Runtime fallback `permissions.manage` van giu nguyen.

## Decision 095 - Backup permission seed readiness stops before real migration

Chon:

Phase 72 tong hop readiness cho `backup.operator.*` permission seed nhung van dung truoc migration/schema/DB mutation that.

Ly do:

- Phase 68-72 da co du design, dry-run, assignment runbook va activation guardrail de owner review.
- Real seed se cham permission table va role mappings nen can approval rieng.
- Execute/restore van la high-risk surface va chua nen bat runtime.

He qua:

- Runtime fallback `permissions.manage` van con den khi co migration/seed that.
- Future Phase 73 co the tao migration/seed that neu owner approve.
- Khong co deploy, DB mutation, worker call, production backup, storage upload, restore hoac secret commit trong bundle nay.

## Decision 094 - Backup permission activation stays blocked by guardrails

Chon:

Phase 71 them source-static guardrail de chan `backup.operator.execute` va `backup.operator.restore` trong runtime dry-run, dong thoi chan worker call, production backup, storage upload, restore trigger va secret/env drift.

Ly do:

- Execute/restore la permission high-risk va chua co migration/seed approval.
- Runtime hien tai chi nen cho phep view/dry_run voi fallback `permissions.manage`.
- Guardrail static giup phat hien drift ma khong can server, DB, worker, secret hay network.

He qua:

- Execute/restore chi duoc xuat hien trong docs/runbook/dry-run seed voi ghi chu chua bat that.
- Runtime backup operator van dry-run-only va chua goi backup service worker that.
- Future migration/seed or real backup activation van can owner approval va phase rieng.

## Decision 093 - Backup permission assignment requires owner approval

Chon:

Phase 70 ghi runbook assignment nhung khong assign that. Future assignment can owner approval, dac biet cho `backup.operator.execute` va `backup.operator.restore`.

Ly do:

- Execute/restore co the mo duong backup/restore that sau nay.
- Role assignment can kiem soat ro de khong cap backup permission cho viewer/public roles.
- Runbook giup phase migration/seed that co checklist verify va rollback truoc khi cham DB.

He qua:

- `OWNER` duoc de xuat all four permission.
- `ADMIN` chi duoc de xuat view/dry_run.
- Cac role khac none by default unless owner approves.

## Decision 092 - Backup permission seed proof stays dry-run only

Chon:

Phase 69 tao local dry-run script mo phong `backup.operator.*` permission seed va role assignment, khong goi Supabase, khong doc env va khong ghi migration.

Ly do:

- Can co bang chung seed plan truoc khi tao migration that.
- Permission execute/restore co rui ro cao nen phai thay ro `would_assign` truoc khi owner approve.
- Dry-run local giu validation chay duoc tren may khong co secret hoac DB.

He qua:

- `backup:permission:seed:dry-run` chi in JSON an toan voi `dry_run: true`.
- Migration/seed that van can phase rieng va approval.

## Decision 091 - Backup permission seed should be a future idempotent migration

Chon:

Phase 68 chi design future migration/seed cho `backup.operator.*`, khong tao migration trong phase nay. Future implementation nen tao migration moi `0007` thay vi sua migration cu.

Ly do:

- Existing migration pattern seed roles/permissions bang `insert ... on conflict`.
- Existing roles la `OWNER`, `ADMIN`, `EDITOR`, `CONTRIBUTOR`, `FAMILY_VIEWER`, `PUBLIC_VIEWER`; repo chua co `SYSTEM_ADMIN`.
- Migration/seed that can approval rieng de tranh cap execute/restore qua rong.

He qua:

- `OWNER` duoc de xuat co view/dry_run/execute/restore trong future seed.
- `ADMIN` chi duoc de xuat view/dry_run.
- Runtime fallback `permissions.manage` van giu cho den khi co migration/seed that.

## Decision 090 - Permission hardening stops before permission seed and real backup

Chon:

Ket thuc Phase 63-67 voi backup operator permission model, API/UI guards, smoke, guardrails va handoff, nhung khong them migration/seed va khong bat real backup worker.

Ly do:

- `backup.operator.*` can duoc seed/map role trong phase rieng co owner approval.
- Worker deploy, storage target, production backup va restore van la surface rui ro cao.
- Handoff can khoa ro fallback hien tai `permissions.manage` de agent sau khong tu y cap quyen hoac deploy.

He qua:

- Phase tiep theo co the la permission migration/seed design, worker manual deploy co approval, hoac quay lai domain model gia pha.
- Bat ky real worker call, storage upload, production backup, restore, cron, deploy hoac secret setup that nao van can phase rieng.

## Decision 089 - Backup operator permission guardrails stay source-static

Chon:

Phase 66 tao smoke va guardrail source-static cho backup operator permission guard, khong chay server/browser/network.

Ly do:

- API/UI permission hardening can gate nhanh tren source de bat marker drift truoc khi co worker deploy that.
- Chua co approval cho deploy worker, storage, backup production hay restore.
- Static guardrail co the chay local/CI ma khong can secret hoac env.

He qua:

- `smoke:backup-operator:permission-guard` xac nhan API/UI guard markers va dry-run boundary.
- `check:backup-operator-permission-guardrails` chan route/page/component/adapter drift sang worker URL, secret, backup, storage, restore hoac cron.

## Decision 088 - Backup operator UI guard mirrors API permission fallback

Chon:

Phase 65 guard `/admin/backups` bang `backup.operator.view` truoc, fallback fail-closed bang `permissions.manage` khi permission backup chua duoc seed that.

Ly do:

- UI operator khong nen tiep tuc dung `exports.download` vi backup operator la boundary rieng.
- Phase nay khong duoc migration/schema/seed nen can fallback tren permission admin hien co.
- Server-side page guard ngan panel render truoc khi user du quyen.

He qua:

- UI va API cung theo model `backup.operator.*` future permission voi fallback `permissions.manage`.
- Panel van chi goi local dry-run route va khong mo backup/storage/restore that.

## Decision 087 - Backup operator API guard uses future permission with admin fallback

Chon:

Phase 64 guard route `/api/admin/backups/service-dry-run` bang `backup.operator.dry_run` truoc, fallback fail-closed bang `permissions.manage` khi permission backup chua duoc seed that.

Ly do:

- Phase nay khong duoc migration/schema/seed nen `backup.operator.dry_run` co the chua ton tai trong DB.
- `permissions.manage` da la permission admin hien co va phu hop lam fallback tam thoi cho operator permission hardening.
- API route can tra JSON 401/403 thay vi redirect page guard.

He qua:

- Route khong con la public dry-run contract nua; no can permission context server-side.
- Backup that, storage upload, worker call va restore van bi chan.
- Phase sau co the them UI guard va smoke/guardrail cho permission markers.

## Decision 086 - Backup operator permissions are proposed before DB seed

Chon:

Phase 63 chi de xuat `backup.operator.view`, `backup.operator.dry_run`, `backup.operator.execute` va `backup.operator.restore`, chua them migration/schema/seed.

Ly do:

- Current permission table chua co backup operator codes.
- Them permission that can phase rieng de kiem seed, role mapping va owner approval.
- API/UI guard co the fail-closed bang fallback documented `permissions.manage` cho den khi permission backup duoc seed that.

He qua:

- Dry-run UI/API se duoc guard trong phase sau nhung van khong mo execute/restore.
- Real backup, real storage, deploy worker va restore van bi chan cho den khi co approval va phase rieng.

## Decision 085 - Operator dry-run bundle stops before permission hardening or real worker call

Chon:

Ket thuc Phase 58-62 voi operator API/UI dry-run, guardrails, smoke va handoff, nhung chua permission hardening that va chua goi backup service worker.

Ly do:

- API route da co contract dry-run nhung permission boundary cho API can phase rieng.
- Worker deploy, secret readiness, real storage va production backup van chua duoc owner approve.
- Handoff can khoa trang thai hien tai de agent sau khong tu y bien dry-run thanh runtime backup.

He qua:

- Phase tiep theo hop ly la permission hardening, manual worker deploy co approval, hoac quay lai domain model gia pha.
- Bat ky real worker call, storage upload, restore, cron, deploy hoac production backup nao van can approval va phase rieng.

## Decision 084 - Operator smoke stays source-static

Chon:

Phase 61 tao smoke local/static chi doc source files cho operator API/UI dry-run.

Ly do:

- Chua co worker deploy that va khong can server dang chay de kiem contract.
- Smoke source-static giup chay local/CI an toan, khong can secret va khong cham network.
- Runtime browser click/integration can phase rieng khi permission va worker approval ro rang.

He qua:

- `smoke:backup-operator:dry-run` xac nhan marker, UI warnings, guardrail va package scripts.
- Smoke khong thay the permission hardening hay deploy smoke that.

## Decision 083 - Operator UI guardrails scan only runtime-relevant source

Chon:

Phase 60 tao guardrail scan cho operator UI/API source va dry-run adapter, khong scan toan bo docs.

Ly do:

- Can chan drift runtime nhu worker URL, token, storage upload, restore, cron hoac production backup trigger.
- Scan docs qua rong se false positive voi runbook va placeholder secret policy.
- Runtime-relevant source la noi co nguy co bien dry-run thanh thao tac that.

He qua:

- `check:backup-operator-ui-guardrails` tro thanh gate cho cac phase UI/API/smoke tiep theo.
- Docs van co the ghi warning va placeholder neu khong dua gia tri secret that vao source.

## Decision 082 - Operator UI calls only the local dry-run route

Chon:

Phase 59 tao `/admin/backups` va component operator panel chi goi `/api/admin/backups/service-dry-run`.

Ly do:

- UI can cho operator thay dry-run status nhung khong duoc goi backup worker URL that.
- Local route da co marker dry-run va envelope safety ro rang.
- Dashboard admin can co duong vao panel de tranh route bi an trong van hanh.

He qua:

- UI hien canh bao no production backup, no storage upload, no restore va no real worker call.
- Route API van can permission hardening rieng truoc khi dung cho van hanh that.

## Decision 081 - Operator API route starts as dry-run contract without DB auth

Chon:

Phase 58 tao `/api/admin/backups/service-dry-run` de tra dry-run envelope local, nhung chua them Supabase permission guard trong route.

Ly do:

- Boundary Phase 58 cam goi DB/network va cam doc secret/env, trong khi permission context hien tai dua vao Supabase.
- Route khong tao backup, khong doc du lieu that va khong goi worker, nen co the dong vai tro contract route cho UI dry-run.
- Auth/permission hardening can phase rieng voi API server-side pattern ro rang.

He qua:

- UI operator co the goi route dry-run noi bo ma khong cham worker that.
- Phase sau phai them guard quyen ro rang truoc khi route duoc dung cho van hanh that.

## Decision 080 - Main app binding remains dry-run until real worker approval

Chon:

Ket thuc Phase 53-57 voi main app binding dry-run-only, chua tao runtime route va chua goi backup service worker that.

Ly do:

- Backup service worker chua deploy that va chua co owner approval cho runtime integration.
- Route operator admin can auth/permission boundary ro rang truoc khi mo API surface.
- Handoff can dong goi trang thai adapter, guardrail, operator contract va smoke de agent sau khong tu y vuot scope.

He qua:

- Phase tiep theo co the lam UI dry-run panel, deploy worker that co approval, hoac quay lai domain model readiness.
- Bat ky real worker call, secret, storage, production backup hoac restore nao van can phase rieng va approval ro rang.

## Decision 079 - Binding smoke remains source-static

Chon:

Phase 56 chi them smoke static/local doc source files va package scripts, khong import runtime app code va khong goi worker/network/env.

Ly do:

- Main app binding van chua co worker deploy, URL, service binding hoac secret that.
- Smoke can bat drift cua adapter/guardrail/operator API contract ma khong bien thanh integration test that.
- Doc source-only giup smoke an toan tren may local va CI khong co secret.

He qua:

- `smoke:main-app-backup-service-binding` la gate local cho contract hien tai.
- `check:main-app-backup-service-binding-smoke` khoa viec doc env, hardcode secret va goi network trong smoke.
- Integration that voi backup service worker van can phase approval/deploy rieng.

## Decision 078 - Backup operator API remains contract-only until API auth boundary is clear

Chon:

Phase 55 chi tao docs/check cho operator API dry-run, khong tao `app/api/admin/backups/service-dry-run/route.ts`.

Ly do:

- Repo hien chua co pattern `app/api/admin` auth/permission route ro rang.
- Tu che API auth co the bypass permission model hoac tao route admin khong duoc bao ve dung.
- Dry-run adapter va guardrails da du de khoa contract truoc khi implement runtime route.

He qua:

- Proposed route duoc document de phase sau implement khi co auth/permission boundary ro.
- Checker se kiem route neu route xuat hien sau nay.

## Decision 077 - Backup service binding guardrails stay source-static and narrow

Chon:

Phase 54 them static guardrail scanner cho cac vung source lien quan main app, nhung khong scan docs/workflow va khong goi runtime.

Ly do:

- Can phat hien som viec hardcode token, URL worker that, hoac bat backup/restore/storage that.
- Scanner qua rong se gay false positive voi docs placeholder va worker scaffold hop le.
- Main app binding van dang dry-run, nen guardrail phai khoa nhung duong runtime that.

He qua:

- `check:backup-service-binding-guardrails` tro thanh gate bat buoc cho cac phase binding/API/smoke sau.
- Cac placeholder hop le van duoc chap nhan khi khong co gia tri that.

## Decision 076 - Main app backup service client starts as dry-run-only server adapter

Chon:

Phase 53 tao `server/services/backup-service-client.ts` lam server-side dry-run adapter thay vi goi backup service worker that.

Ly do:

- Main app chua co binding, URL hay secret that.
- Dry-run adapter cho phep khoa response envelope va action contract truoc khi co network path.
- Tao `server/services` giup phan biet future server-only caller voi UI/client code.

He qua:

- Adapter tra envelope local cho `health`, `dryRun`, `fixtureVerify`.
- Network path bi chan bang `backup_service_network_disabled` cho den phase approval/integration rieng.

## Decision 075 - Pre-deploy handoff keeps real deploy blocked until explicit approval

Chon:

Phase 52 tong hop pre-deploy readiness cho backup service worker, nhung van giu trang thai no-deploy cho den khi owner approve that va secrets san sang.

Ly do:

- Phase 48-51 da chuan bi workflow, runbook, secrets preflight va approval gate nhung chua co approval/execution.
- Handoff can noi ro cai gi da ready va cai gi van blocked de tranh agent sau tu y deploy.
- Production backup, real storage va main app integration van la boundary rieng.

He qua:

- Phase 53 co the chon manual deploy execution, main app binding dry-run, hoac tam dung ha tang.
- Bat ky deploy that nao van can owner approval ngoai repo.

## Decision 074 - Owner approval gate is required before real backup service deploy

Chon:

Phase 51 tao deploy approval gate voi `OWNER_APPROVAL_REQUIRED_BEFORE_REAL_DEPLOY=true`, nhung khong ghi rang deploy da duoc approve.

Ly do:

- Backup service worker deploy co the mo runtime surface moi va can owner chot target, secret, smoke, rollback va deployment window.
- Approval gate can tach khoi secrets preflight va manual runbook de tranh nham lan giua "san sang" va "duoc phep".
- Production backup van khong duoc chay chi vi worker duoc deploy.

He qua:

- Phase 52 co the handoff trang thai pre-deploy voi blocker ro rang.
- Phase deploy that sau nay phai co approval ngoai repo truoc khi chay.

## Decision 073 - Secret preflight is checklist-only

Chon:

Phase 50 tao secrets preflight checklist bang placeholder va no-go conditions, khong doc, tao, verify gia tri, hay goi GitHub/Cloudflare API.

Ly do:

- Secret readiness can duoc xac nhan boi owner/operator trong approved secret stores, khong phai bang cach in gia tri vao repo/log.
- Deploy backup service worker can Cloudflare token/account id, internal token va smoke env nhung tat ca phai o ngoai repo.
- No-go list giup dung deploy khi thieu approval, rollback, local checks hoac post-deploy tester.

He qua:

- Phase 51 co the them deploy approval gate dua tren checklist nay.
- Repo van khong co secret that.

## Decision 072 - Manual deploy remains a runbook until owner approval

Chon:

Phase 49 ghi manual deploy runbook voi `wrangler secret put` va `wrangler deploy` nhu placeholder commands, nhung khong chay bat ky command deploy/secret nao.

Ly do:

- Deploy that can secret runtime, smoke owner va rollback owner.
- Command can duoc ghi ro de van hanh sau nay, nhung khong duoc thuc thi khi chua owner approval.
- Runbook phai giu production backup disabled rieng voi worker deploy.

He qua:

- Phase 50 co the kiem secrets preflight ma van khong doc/tao secret that.
- Manual deploy future se phai di qua approval gate truoc.

## Decision 071 - Backup service deploy workflow is manual-only

Chon:

Phase 48 tao `.github/workflows/backup-service-deploy.yml` chi voi `workflow_dispatch`, khong co push, pull_request hoac schedule trigger.

Ly do:

- Backup service worker deploy can owner chu dong bam workflow sau khi secret/approval san sang.
- Auto deploy tu code change co the mo production route khi chua smoke/rollback.
- Workflow rieng giup khong tron deploy main app voi backup service worker.

He qua:

- Workflow co deploy step cho tuong lai nhung khong duoc chay trong Phase 48.
- Checker khoa manual-only trigger va secret reference dang `secrets.*`.

## Decision 070 - Deploy readiness handoff is not deploy approval

Chon:

Phase 47 tong hop backup service worker deploy readiness thanh handoff, nhung khong xem day la approval de deploy, push, cau hinh secret, storage hoac main app integration.

Ly do:

- Phase 43-46 moi khoa tai lieu, checker va smoke safe-skip.
- Real deploy can owner approval, runtime secret, route decision, smoke plan va rollback.
- Production backup van can approval rieng va khong duoc kich hoat boi handoff nay.

He qua:

- Phase 48 co the chon manual deploy execution, GitHub Actions deploy workflow readiness, hoac main app binding implementation.
- Bat ky huong nao cung phai giu no-secret/no-production-backup boundary cho den khi co approval ro rang.

## Decision 069 - Main app binding remains contract-only

Chon:

Phase 46 chi thiet ke contract de main app goi backup service worker sau nay, khong sua main app runtime va khong them binding/secret that.

Ly do:

- Main app -> backup service worker la duong runtime co the dan toi production backup, can approval va permission boundary rieng.
- Can quyet dinh giua Cloudflare service binding va internal URL + Bearer token truoc khi code.
- Permission model hien co khong duoc bypass boi backup service integration.

He qua:

- Contract da ghi request/response envelope, error mapping, timeout/retry/logging va permission boundary.
- Future implementation phai la phase rieng, server-only va dry-run first.

## Decision 068 - Post-deploy smoke must safe-skip without explicit env

Chon:

Phase 45 them smoke script cho backup service worker nhung script phai skip neu thieu `BACKUP_SERVICE_SMOKE_BASE_URL` va chi goi internal endpoints khi co `BACKUP_SERVICE_SMOKE_TOKEN`.

Ly do:

- Backup service worker chua deploy va chua co production route.
- Smoke script co the huu ich sau deploy, nhung khong duoc tu y goi production hoac in token.
- Safe-skip giup validation local/CI khong can secret va khong cham network.

He qua:

- `smoke:backup-service-worker:post-deploy` mac dinh SKIPPED trong repo hien tai.
- Future operator phai set env explicit neu muon smoke sau deploy that.

## Decision 067 - Backup service secrets stay placeholder-only until approved runtime setup

Chon:

Phase 44 chi ghi env/secret contract cho backup service worker bang placeholder, khong tao secret that, khong doc secret file va khong goi Wrangler/API.

Ly do:

- `BACKUP_SERVICE_INTERNAL_TOKEN` se la runtime secret nhay cam khi worker duoc deploy va co caller that.
- Secret provisioning/rotation can approval va thao tac van hanh rieng ngoai repo.
- Docs/checker can khoa chinh sach no-secret-in-docs truoc khi them post-deploy smoke.

He qua:

- Repo chi luu ten placeholder, khong luu gia tri.
- Phase 45 co the them smoke plan voi safe-skip neu khong co env explicit.

## Decision 066 - Backup service deploy readiness remains no-deploy

Chon:

Phase 43 tao deploy readiness gate cho backup service worker bang static/local checks, nhung khong deploy that va khong them production route.

Ly do:

- Backup service worker moi o muc scaffold va chua co secret/storage/main-app integration.
- Deploy command can duoc document nhu placeholder de phase sau biet huong, nhung khong nen chay khi chua approval.
- Wrangler config can duoc khoa o muc no-route/no-secret truoc khi bat ky deploy phase nao.

He qua:

- `check:backup-service-worker-deploy-readiness` xac nhan source/config/endpoints/auth/envelope/secret safety.
- Phase 44 co the tap trung vao env/secret contract runbook.

## Decision 065 - Worker split readiness is a handoff baseline, not deploy approval

Chon:

Phase 42 tong hop worker split va backup readiness Phase 37-42 thanh handoff baseline, khong xem day la approval de deploy backup service worker hoac chay production backup.

Ly do:

- Backup service worker da co scaffold va local/static contract checks nhung chua co deploy readiness gate.
- Main app integration van chua duoc implement va chua co service binding/token/env that.
- Production backup can approval rieng ve owner, storage target, privacy, retention, restore drill va rollback.

He qua:

- Phase tiep theo nen la deploy readiness gate hoac service binding design rieng.
- Handoff nay chi khoa tai lieu/checks va boundary, khong mo duong runtime production.

## Decision 064 - Main app integration needs a separate approval phase

Chon:

Phase 41 chi thiet ke readiness cho main app goi backup service worker qua service binding hoac internal URL + Bearer token, khong implement integration that.

Ly do:

- Main app integration co the tao duong goi production backup nen can approval va deploy-readiness rieng.
- Binding/token/env that la secret/config van hanh, khong nen them trong docs/check phase.
- Request/response envelope va error mapping can duoc khoa truoc khi code tich hop.

He qua:

- Main app van chua goi backup service.
- Phase sau co the lam deploy readiness hoac binding design chi tiet hon.

## Decision 063 - Worker contract smoke stays static before deploy readiness

Chon:

Phase 40 dung static/source contract checker va smoke marker thay vi import/chay Cloudflare Worker runtime.

Ly do:

- Chua co build/runtime harness rieng cho worker service.
- Static checks du de khoa endpoint/auth/envelope/no-outbound contract o phase nay.
- Runtime smoke nen la phase deploy-readiness rieng sau khi co config ro rang.

He qua:

- `smoke:backup-service-worker:contract` khong goi network va khong deploy.
- Phase 41 co the thiet ke integration readiness dua tren contract da khoa.

## Decision 062 - Backup service scaffold has internal-only mutation endpoints

Chon:

Phase 39 scaffold `services/backup-service` voi `GET /health` public va cac endpoint `/internal/*` yeu cau bearer token placeholder.

Ly do:

- Health check can non-sensitive va public de future deploy smoke don gian.
- Dry-run/fixture verify la internal behavior, khong nen public mutation.
- Scaffold can typecheck duoc nhung khong can Cloudflare runtime/deploy that.

He qua:

- Worker source co JSON envelope va marker `BACKUP_SERVICE_DRY_RUN_ONLY`.
- Token that va route production van chua duoc cau hinh.

## Decision 061 - Backup service should be a small separate worker

Chon:

Phase 38 thiet ke `services/backup-service/` nhu mot worker nho rieng cho backup/storage readiness thay vi nhhoi logic backup vao main Next/OpenNext worker.

Ly do:

- Backup/storage co the tang bundle/startup va can internal auth/logging/retry rieng.
- Main app nen giu vai tro UI/auth/family data route nhe.
- Worker rieng giup sau nay tich hop bang service binding hoac internal URL + Bearer token co boundary ro rang.

He qua:

- Phase 39 co the scaffold worker toi thieu nhung khong deploy.
- Main app integration van can phase readiness/approval rieng.

## Decision 060 - Restore GitHub menu script dirty state to HEAD

Chon:

Phase 37 chon `REVERT_TO_HEAD` cho `GIA_PHA_GITHUB_MENU.bat`.

Ly do:

- `git diff -- GIA_PHA_GITHUB_MENU.bat` khong co content diff huu ich.
- Dirty state chi la line-ending/touched-file noise.
- Commit file .bat trong trang thai nay se tao nhieu hon gia tri van hanh.

He qua:

- Repo hygiene sach hon truoc khi scaffold backup service worker.
- File menu khong duoc stage/commit trong phase sau tru khi co yeu cau rieng.

## Decision 059 - Production backup requires explicit approval gate

Chon:

Phase 36 tao approval/no-go checklist truoc khi bat ky phase sau nao duoc tao backup production that hoac upload vao storage that.

Ly do:

- Backup production co the chua du lieu gia dinh rieng tu va can storage/secret/privacy/retention/restore drill approval ro rang.
- Cac phase 32-35 moi chung minh local sandbox va dry-run, khong phai approval backup that.
- No-go list giup AI/operator dung lai khi thieu owner, storage target, secret plan hoac privacy review.

He qua:

- Phase sau chi duoc chuyen sang sandbox cloud prototype hoac production runbook neu co approval ro rang.
- Phase 36 khong tao backup, khong upload, khong restore va khong deploy.

## Decision 058 - Upload verification remains a local dry-run

Chon:

Phase 35 tao `backup:storage:verify-upload:dry-run` chi doc artifact da tao boi local sandbox adapter va verify manifest/checksum/secret flags. Khong upload cloud that.

Ly do:

- Can kiem artifact sau buoc put local truoc khi chuyen sang provider sandbox.
- Upload cloud that can storage target, credential va approval rieng.
- Dry-run verification giup bat checksum/manifest drift ma khong cham network.

He qua:

- Phase 36 co the dua upload verification dry-run vao approval checklist.
- Provider upload van la phase rieng sau khi co storage target va approval.

## Decision 057 - Local storage adapter writes only fixture sandbox output

Chon:

Phase 34 implement `backup:storage:adapter:local` chi copy fixture/manifest mau vao `fixtures/backup-sandbox/adapter/`, tao index local va verify checksum.

Ly do:

- Can prototype adapter behavior that hon contract nhung van khong cham cloud/storage provider.
- Fixture-only output giup Phase 35 verify upload dry-run co artifact on dinh de doc.
- Khong implement delete de tranh tao pattern nguy hiem truoc retention/approval that.

He qua:

- Adapter local co the duoc dung nhu input cho upload verification dry-run.
- Cloud adapter va production upload van la phase rieng sau approval.

## Decision 056 - Storage adapter contract is provider-neutral and no-network

Chon:

Phase 33 tao contract provider-neutral cho storage adapter va script `backup:storage:contract` chi validate shape local voi marker `STORAGE_ADAPTER_CONTRACT_ONLY`.

Ly do:

- Can thong nhat method/manifest/verify/delete safety truoc khi prototype local adapter.
- Provider cloud that can credential va policy rieng, khong nen dua vao contract phase.
- Contract provider-neutral giup so sanh R2, Google Drive, Supabase Storage va offline storage sau nay ma khong khoa vao mot SDK.

He qua:

- Phase 34 co the implement local sandbox adapter theo contract.
- Cloud provider adapter van can phase rieng va approval rieng.

## Decision 055 - Phase 32 keeps sandbox storage local

Chon:

Phase 32 recommend tiep tuc dung local sandbox trong `fixtures/backup-sandbox/` cho prototype tiep theo. Cloudflare R2, Google Drive, Supabase Storage va local/offline storage duoc so sanh, nhung production storage target chua duoc chot.

Ly do:

- Local sandbox giu validation deterministic va khong can secret/provider setup.
- Production backup storage can approval, credential handling, retention, restore drill va incident owner rieng.
- Cloudflare R2 co the la candidate ky thuat tot sau nay, nhung khong duoc cau hinh that trong Phase 32.

He qua:

- Phase 33 co the thiet ke adapter contract ma chua can cloud provider.
- Bat ky storage production nao sau nay phai la phase rieng voi approval ro rang.

## Decision 054 - Backup readiness handoff is not production backup approval

Chon:

Phase 31 tao `docs/31_BACKUP_READINESS_HANDOFF.md` va checker de tong hop Phase 18-31, nhung khong bien bundle nay thanh approval cho backup production.

Ly do:

- Cac phase backup gan day moi tao runbook, fixture, dry-run, local CI va report mau.
- Production backup can storage target, credential handling, approval, smoke evidence va rollback rieng.
- Handoff can ro rang de AI sau khong hieu nham fixture/report la backup that.

He qua:

- Next phase nen chon storage target sandbox hoac approval checklist truoc khi tao backup that.
- Khong bat cron, khong upload, khong restore va khong deploy tu Phase 31.

## Decision 053 - Restore drill report is fixture evidence only

Chon:

Phase 30 tao command `restore:drill:report` sinh report JSON tu fixture va manifest sample, khong restore that.

Ly do:

- Can co artifact report de handoff va CI/local review ma khong cham production.
- Report restore that se co rui ro neu bi hieu nham la da phuc hoi production.
- Fixture report giu bang chung manifest/graph/privacy/secret scan o muc an toan.

He qua:

- Report co `noProductionMutation: true` va `restoreExecution: SKIPPED`.
- Report production that van can phase rieng sau khi co backup/storage/approval.

## Decision 052 - Retention policy gate does not remove artifacts

Chon:

Phase 29 tao command `backup:retention:check` chi validate retention policy bang fixture/sandbox metadata va khong xoa file.

Ly do:

- Backup retention co rui ro mat du lieu neu ap dung vao storage that khi chua co manifest/verification/approval.
- Can co policy gate truoc khi chon storage target hoac bat job that.
- Weekly/monthly/pre-deploy rules can duoc document va test bang data mau truoc.

He qua:

- Retention command chi bao `keep`, `review_later`, `blocked_manifest_invalid`.
- Bat ky cleanup that nao sau nay phai la phase rieng voi approval va rollback notes.

## Decision 051 - Backup storage simulation stays local sandbox only

Chon:

Phase 28 tao command `backup:storage:sandbox` copy fixture va manifest sample vao `fixtures/backup-sandbox/`, kem local index `storage-index.fixture.json`.

Ly do:

- Can mo phong artifact staging truoc khi chon storage target that.
- Storage cloud that can credential, access policy va retention approval rieng.
- Fixture sandbox giup kiem file/index contract ma khong cham production data.

He qua:

- `fixtures/backup-sandbox/` chi chua du lieu mau va co the commit an toan.
- R2/Google Drive/Supabase Storage hoac storage target that van la phase rieng sau approval.

## Decision 050 - Backup readiness CI stays local-only

Chon:

Phase 27 tao workflow `.github/workflows/backup-readiness.yml` cho `pull_request` va `workflow_dispatch`, chi chay local backup readiness scripts va checker.

Ly do:

- Can CI gate de bat drift trong dry-run/fixture/restore validator truoc khi mo automation that.
- Workflow backup readiness khong can production secret, storage target hay deploy permission.
- Khong them `schedule:` de tranh bien no thanh backup job that khi chua co approval.

He qua:

- PR/manual gate co the chay `backup:pipeline:readiness` an toan.
- Real backup, storage upload, cron va restore production van la phase rieng.

## Decision 049 - Backup readiness pipeline coordinates local safe gates only

Chon:

Phase 26 tao command `backup:pipeline:readiness` de chay lan luot `backup:dry-run`, `backup:fixture:generate`, `backup:fixture:verify` va `restore:dry-run`.

Ly do:

- Can mot lenh tong hop de xac nhan bundle backup readiness nhung van chua tao automation production.
- Cac buoc con deu chi dung mock/static fixture va restore dry-run, nen phu hop lam local gate.
- Giu ranh gioi an toan truoc khi them CI gate, storage sandbox hoac scheduled job that.

He qua:

- Phase sau co the dua `backup:pipeline:readiness` vao CI/manual checklist.
- Pipeline nay khong thay the real backup smoke test khi co storage/job that.

## Decision 048 - Restore validator remains dry-run only

Chon:

Phase 25 tao command `restore:dry-run` de validate fixture restore readiness bang in-memory plan, nhung restore execution luon la `SKIPPED`.

Ly do:

- Can kiem graph/privacy/manifest truoc khi thiet ke restore that.
- Restore that co rui ro ghi de du lieu gia pha, nen khong duoc lam khi chua co transaction/validation/approval rieng.
- Fixture-only validator giup pipeline sau nay co gate an toan ma khong cham production.

He qua:

- `restore:dry-run` co the dung trong readiness pipeline.
- Bat ky restore that nao sau nay phai la phase rieng voi rollback, transaction va approval ro rang.

## Decision 047 - Backup manifest integrity stays fixture-only

Chon:

Phase 24 tao command `backup:fixture:verify` de verify manifest va fixture sample local, tinh lai checksum SHA-256 va validate count/flag/shape truoc khi co automation backup that.

Ly do:

- Can co gate kiem checksum va manifest drift truoc restore dry-run.
- Giu an toan: chi doc fixture mau, khong doc env, khong goi API/DB/network va khong restore.
- Khong can package moi vi Node `crypto` du de tinh SHA-256.

He qua:

- Backup pipeline sau nay co the goi `backup:fixture:verify` nhu mot readiness gate local.
- Neu manifest schema thay doi, checker Phase 24 phai duoc cap nhat cung fixture generator.

## Decision 046 - Phase 23 uses generated sample fixtures only

Chon:

Phase 23 tao sample fixture generator ghi file vao `fixtures/backup/` voi du lieu gia, khong dung du lieu gia pha that. Fixture va manifest deu danh dau `environment: fixture`, `contains_real_data: false`, `contains_secret: false`.

Ly do:

- Cac buoc manifest integrity va restore dry-run can input on dinh de kiem tra ma khong cham production.
- Fixture trong repo phai la du lieu mau ro rang, khong phai backup that.
- Generator giup tao lai fixture deterministic thay vi copy thu cong.
- File `GIA_PHA_GITHUB_MENU.bat` van la thay doi ton dong ngoai scope, khong stage/commit.

## Decision 045 - Phase 22 starts backup automation with mock dry-run only

Chon:

Phase 22 tao command `backup:dry-run` chi dung mock/static data trong bo nho. Command validate manifest shape, naming convention, secret pattern scan va restore compatibility checklist nhung khong doc env, khong goi network/API/DB, khong tao file backup that va khong restore.

Ly do:

- Backup automation can co buoc dry-run cuc nho de khoa contract truoc khi tao fixture hoac job that.
- Mock dry-run giup validate guardrail ma khong cham du lieu gia dinh production.
- Phase 22 van giu `GIA_PHA_GITHUB_MENU.bat` ngoai stage/commit vi day la thay doi ton dong ngoai scope.

## Decision 044 - Phase 21 designs automated backup without enabling automation

Chon:

Phase 21 chi tao automated backup job design. Khong tao scheduled job that, khong bat cron, khong tao/upload backup production that, khong restore, khong them storage credential, khong deploy va khong mutate du lieu.

Ly do:

- Backup automation co the di chuyen du lieu gia dinh that ra ngoai app, nen can storage, retention, manifest, checksum, restore drill va monitoring truoc khi bat that.
- Current export layer da co JSON/GEDCOM/ZIP output, nhung chua co job identity, storage target hay retention policy duoc approval.
- Job production can disabled-by-default va phai di qua dry-run/sample data truoc.
- File `GIA_PHA_GITHUB_MENU.bat` dang modified ngoai scope phai tiep tuc de ngoai stage/commit.

## Decision 043 - Phase 20 keeps custom domain cutover as readiness only

Chon:

Phase 20 chi tao runbook custom domain cutover readiness. Khong chot domain that, khong doi DNS, khong cau hinh Cloudflare custom domain/route, khong doi Supabase Auth, khong doi Google OAuth, khong deploy va khong goi API mutate config.

Ly do:

- Domain cutover co the lam hong login/OAuth, Supabase session va canonical production URL neu Cloudflare, Supabase va Google OAuth khong doi dong bo.
- Repo chua co custom domain chinh thuc, nen ghi `<TO_BE_CONFIRMED>` thay vi tu doan.
- `workers.dev` can duoc giu lam fallback cho toi khi custom domain smoke PASS.
- File `GIA_PHA_GITHUB_MENU.bat` dang modified ngoai scope phai tiep tuc de ngoai stage/commit.

## Decision 042 - Phase 19 keeps backup and restore drill procedural before automation

Chon:

Phase 19 chi tao runbook scheduled backup va restore drill o muc quy trinh. Khong tao backup production that, khong restore production, khong them cron/job that, khong doi schema/data va khong doi domain/Auth/OAuth config.

Ly do:

- Backup production co the chua du lieu gia dinh that, nen can quy tac luu tru, manifest, PASS/FAIL va incident response truoc khi tu dong hoa.
- Restore production la thao tac high-risk; drill phai chay tren local/test/staging/sandbox truoc.
- Scheduled automation can thiet ke storage, retention, alerting va secret policy rieng; Phase 19 chi chuan hoa manual schedule va checklist.
- File `GIA_PHA_GITHUB_MENU.bat` dang modified ngoai scope phai tiep tuc de ngoai stage/commit.

## Decision 041 - Phase 18 hardens backup, domain and alerting before automation

Chon:

Phase 18 chi bo sung runbook hardening cho backup, domain va alerting/incident readiness. Khong deploy lai, khong tao backup that, khong doi domain/Auth/OAuth config that, khong sua schema va khong mutate du lieu.

Ly do:

- Production da PASS, nen can ky luat backup/restore/domain/alerting truoc cac thay doi van hanh rui ro hon.
- Restore, import confirm, revision restore va custom domain cutover deu la thao tac high-risk can phase rieng.
- Backup that co the chua du lieu gia pha production, nen khong duoc commit hoac paste vao docs/logs/chat.
- Alerting tu dong can cau hinh dashboard/tai khoan rieng; Phase 18 chi ghi checklist va future setup, khong gia vo da cau hinh.

## Decision 040 - Phase 17 ưu tiên runbook vận hành production

Chọn:

Phase 17 chỉ bổ sung runbook vận hành production, monitoring checklist, smoke guide, incident triage và rollback guidance. Không deploy lại, không mở tính năng lớn và không sửa runtime/data.

Lý do:

- Production đã có Worker thật và Google OAuth production PASS, nên cần quy trình kiểm tra sau deploy rõ ràng.
- Sự cố production nên được xử lý theo logs, deploy history, auth redirect config và rollback trước khi chạm schema hoặc dữ liệu.
- Optional smoke bằng `PROD_SMOKE_BASE_URL` phải skip an toàn khi thiếu env, không làm local validation phụ thuộc network.
- Boundary giữ nguyên: không deploy lại, không migration, không sửa dữ liệu thật, không hardcode secret/token/key.

## Decision 039 - Phase 16 chỉ ổn định production, không mở tính năng lớn

Chọn:

Phase 16 tập trung checklist vận hành production sau deploy đầu tiên: route smoke, Auth/OAuth, privacy, export backup, logs/observability và quy trình sau mỗi deploy. Không sửa schema, không chạy migration, không thay đổi privacy/business logic, không import confirm và không revision restore.

Lý do:

- Production vừa PASS, nên ưu tiên ổn định vận hành và phát hiện regression trước khi mở tính năng mới.
- Dữ liệu thật đang tồn tại, mọi thay đổi ghi dữ liệu hoặc schema cần phase riêng.
- Checklist production giúp deploy sau có quy trình rõ và giảm rủi ro lộ dữ liệu riêng tư.

## Decision 038 - Production deploy đầu tiên PASS qua GitHub Actions Cloudflare Deploy

Chọn:

Ghi nhận deploy production đầu tiên chạy bằng GitHub Actions Cloudflare Deploy thay vì Windows local. Worker `web-gia-pha` chạy tại `https://web-gia-pha.hungdiepcompany.workers.dev/`.

Lý do:

- Windows local deploy bị blocker OpenNext compatibility.
- GitHub Actions/Linux deploy path đã PASS và phù hợp môi trường Cloudflare-compatible.
- Supabase URL/Redirect URLs và Google OAuth đã được cấu hình theo production URL, Google OAuth login PASS.

## Decision 037 - Phase 15E deploy thật chuyển sang GitHub Actions thủ công

Chọn:

Tạo workflow `.github/workflows/cloudflare-deploy.yml` chạy thủ công bằng `workflow_dispatch` trên `ubuntu-latest`, dùng Node 24, GitHub Actions variables/secrets và `npm run deploy`. Workflow không chạy khi push/pull request và không hardcode token/secret trong repo.

Lý do:

- Windows local deploy đã bị chặn bởi OpenNext compatibility, trong khi Linux build gate đã PASS.
- Deploy thật cần chạy trong môi trường Linux/Cloudflare-compatible nhưng vẫn phải giữ kiểm soát thủ công.
- Không đưa Cloudflare/Supabase secret vào repo hoặc log.

## Decision 036 - Phase 15D không vá app logic cho OpenNext Windows deploy blocker

Chọn:

Khi `npm.cmd run deploy` trên Windows fail ở bước OpenNext bundle với lỗi thiếu `.open-next/.build/open-next.config.edge.mjs`, dừng deploy và ghi report BLOCKED. Không sửa app logic để né lỗi Windows/OpenNext; deploy thật phải chuyển sang WSL/Linux hoặc GitHub Actions deploy path.

Lý do:

- GitHub Actions Linux build gate đã PASS, nên vấn đề là Windows-local compatibility.
- Vá app logic cho lỗi build tool theo môi trường có thể làm lệch business logic và tăng rủi ro deploy.
- Production deploy cần chạy trong môi trường Cloudflare-compatible đã được gate bằng Linux.

## Decision 035 - Phase 15C dùng GitHub Actions/Linux làm OpenNext build gate

Chọn:

Tạo GitHub Actions workflow chạy trên `ubuntu-latest` để kiểm tra `npm ci`, foundation checks, Next build và `npx opennextjs-cloudflare build` trước khi retry deploy thật.

Lý do:

- OpenNext build trên Windows local có compatibility issue đã biết, không nên sửa app logic để né lỗi môi trường.
- Linux gate giúp xác nhận OpenNext build có PASS trên môi trường Cloudflare-compatible trước khi deploy.
- Workflow không deploy, không upload, không chạy migration và không yêu cầu production secret thật.

## Decision 034 - Phase 15B chỉ chuẩn bị service boundary, chưa tách Worker

Chọn:

Giữ main Web Worker cho UI public/admin, auth callback, CRUD nhẹ và tree nhẹ. Ghi nhận export/import/media/PDF/image/backup nặng là ứng viên split service sau này, tạo template worker và checker readiness nhưng chưa tạo service Cloudflare thật.

Lý do:

- App còn nhỏ và cần đo bundle/deploy thật trước khi tách service.
- Tránh main Worker phình to khi export/import/media/PDF tăng độ nặng.
- Giữ business logic hiện tại ổn định, không đổi behavior chỉ vì lỗi OpenNext local trên Windows.

## Decision 033 - Deploy target là Cloudflare Workers via OpenNext

Chọn:

Phase 15A dùng Cloudflare Workers qua `@opennextjs/cloudflare` cho app Next.js SSR/server routes. `wrangler.toml` trỏ `.open-next/worker.js`, assets trỏ `.open-next/assets`, và deploy command chuẩn là `npm run deploy` sau khi production env/secrets và backup đã sẵn sàng.

Lý do:

- App dùng App Router, route handlers và server-side admin/auth flow nên không chọn static-only deploy.
- OpenNext là adapter phù hợp để build Next.js SSR lên Cloudflare Workers.
- `SUPABASE_SERVICE_ROLE_KEY` vẫn chỉ là Cloudflare secret/server-side, không hardcode vào repo.
- Phase 15A chỉ wiring, chưa deploy thật.

## Decision 032 - Phase 14 chỉ chuẩn bị deploy, chưa deploy

Chọn:

Phase 14 tạo deploy readiness docs/checklist/script và giữ Cloudflare deploy ở trạng thái chuẩn bị. Không deploy thật, không push remote, không tạo Cloudflare project, không ghi secret vào repo.

Lý do:

- Production env, Supabase redirect URL và Google OAuth domain cần được kiểm tra thủ công trước first deploy.
- Dữ liệu thật đã tồn tại, nên deploy phải đi kèm backup JSON/ZIP và rollback plan.
- `SUPABASE_SERVICE_ROLE_KEY` phải cấu hình ở deploy platform/server-side, không xuất hiện trong client hoặc file tracked.
- Mốc tiếp theo là Phase 15 First Cloudflare Deploy.

## Decision 031 - Phase 13 polish UI, không đổi luồng dữ liệu

Chọn:

Phase 13 chỉ chuẩn hóa giao diện nền bằng UI primitives nhẹ, copywriting tiếng Việt, spacing và trạng thái empty/error. Không đổi schema, RLS, auth callback, relationship model, import confirm hoặc revision restore.

Lý do:

- Phase 12 đã là baseline ổn định sau smoke test Supabase thật, nên UI polish không được làm trôi business logic.
- Import confirm và revision restore vẫn là bề mặt ghi dữ liệu lớn, cần planning riêng trước khi bật.
- Reusable primitives giúp các trang đọc nhất quán mà không kéo thêm UI package.
- Phase kế tiếp nên là Deploy Readiness hoặc Import Confirm Planning tùy ưu tiên.

## Decision 030 - Phase 12 khóa baseline sau real Supabase smoke test

Chọn:

Phase 12 là docs/stability phase sau khi user xác nhận real Supabase smoke test chính đã PASS. Baseline hiện tại được xem là mốc ổn định trước UI polish.

Lý do:

- Dự án đã có dữ liệu thật trong Supabase, nên không chạy lại toàn bộ migration 0001-0006 nếu chưa review schema/data state.
- Google OAuth đã hoạt động và PKCE issue trước đó tự hết, nên không sửa thêm auth nếu lỗi không tái diễn.
- Import confirm thật và revision restore thật vẫn có rủi ro ghi dữ liệu, nên chưa bật trước khi có transaction, validation và log đầy đủ.
- Phase tiếp theo nên là UI Polish Foundation thay vì mở bề mặt ghi dữ liệu lớn.

## Decision 028 - Phase 11 là integration gate, không chạy Supabase thật tự động

Chọn:

Phase 11 chỉ tạo docs, script gate và status route an toàn để chuẩn bị tích hợp Supabase thật. Không tự động chạy migration, không deploy và không push.

Lý do:

- Migration production cần user xác nhận project/env/quyền rõ ràng.
- Secret thật không được ghi vào repo hoặc log.
- Gate kiểm tra giúp giảm rủi ro trước khi smoke test bằng user thật.

## Decision 029 - System status chỉ hiển thị boolean config

Chọn:

`/admin/system/status` chỉ hiển thị yes/no cho env config và danh sách checks, yêu cầu `settings.manage` hoặc `permissions.manage`.

Lý do:

- Không lộ secret ra client.
- Không cần query dữ liệu nhạy cảm để biết cấu hình đã sẵn sàng chưa.
- Người không có quyền quản trị hệ thống không cần xem trạng thái service role.

## Decision 026 - Phase 10 chỉ preview import JSON, không ghi DB

Chọn:

Phase 10 tạo validator và preview UI cho `family.json`, nhưng không bật import thật, không lưu file upload và không ghi đè dữ liệu hiện tại.

Lý do:

- Import thật có nguy cơ phá hỏng dữ liệu gia phả nếu chưa có transaction, conflict resolution, rollback và revision/import log.
- Preview giúp kiểm tra sớm schema, reference và vòng tổ tiên mà không cần mở bề mặt ghi dữ liệu.
- `family.json` là bản bảo toàn dữ liệu chính nên đường import phải đi từng bước, không dùng generic overwrite.

## Decision 027 - Conflict check import chạy server-side sau permission

Chọn:

Conflict check DB cho import JSON chỉ chạy trong server service sau khi user có `imports.create` và admin Supabase config khả dụng.

Lý do:

- Service role key không được đưa ra client.
- Client chỉ cần summary/issues/conflicts đã được server tính.
- Khi thiếu Supabase config, validator vẫn hoạt động độc lập và báo conflict DB unavailable thay vì crash.

## Decision 025 - Phase 9 chỉ bật restore placeholder

Chọn:

Phase 9 tạo UI xem revision list/detail và diff before/after, nhưng nút khôi phục chỉ disabled placeholder.

Lý do:

- Restore thật có nguy cơ ghi đè dữ liệu hiện tại nếu chưa có transaction và validation rõ.
- Cần ghi revision mới cho hành động restore, kiểm entity_type/action và xử lý quan hệ liên bảng trước khi bật.
- Mục tiêu Phase 9 là audit trail có thể xem được trước, không phải phục hồi tự động.

## Decision 023 - family.json là bản bảo toàn dữ liệu chính

Chọn:

Phase 8 dùng `family.json` làm bản export chính giữ ID ổn định, quan hệ thật và layout cây. GEDCOM là định dạng chuyển đổi phụ.

Lý do:

- GEDCOM không map hết dữ liệu riêng của hệ thống như layout, visibility, audit field hoặc quan hệ không chuẩn.
- JSON giúp bảo toàn dữ liệu khi cần phục hồi hoặc chuyển hệ thống.
- Không làm mất dữ liệu chỉ vì phần mềm GEDCOM không hỗ trợ đủ.

## Decision 024 - ZIP backup tách manifest và checksums

Chọn:

`full-backup.zip` chứa `family.json`, `family.ged`, `manifest.json` và `checksums.json`. Checksum SHA-256 được ghi trong `checksums.json` để tránh tự tham chiếu vòng tròn trong manifest.

Lý do:

- Manifest mô tả backup và limitation.
- Checksums là nguồn kiểm tra toàn vẹn file.
- Cấu trúc này đơn giản, dễ đọc và đủ cho foundation trước khi có media thật.

## Decision 021 - Public pages dùng DTO public-safe

Chọn:

Phase 7 tạo `PublicPerson` và privacy service để sanitize dữ liệu trước khi render public pages.

Lý do:

- Không dựa vào CSS/UI để ẩn dữ liệu nhạy cảm.
- Đảm bảo `notes_private` không xuất hiện trong DTO public.
- Người còn sống được bảo vệ mặc định ở public mode.

## Decision 022 - Chưa mở RLS public rộng trong Phase 7

Chọn:

Public service dùng server-side anon Supabase client với query/filter `visibility = public`, `deleted_at is null`, nhưng không tạo policy public rộng mới trong Phase 7.

Lý do:

- Tránh mở nhầm dữ liệu private trước khi có audit RLS public đầy đủ.
- Nếu database thật chưa có public-safe policy, public route fail hoặc empty an toàn.
- Không dùng service role để lách RLS cho public pages.

## Decision 019 - Layout cây lưu riêng với dữ liệu gia phả thật

Chọn:

Phase 6 tạo `tree_layouts` và `tree_layout_nodes` để lưu vị trí node thủ công.

Lý do:

- Kéo node là thao tác UI, không phải thay đổi quan hệ cha/mẹ/con/vợ/chồng.
- Giữ nguyên nguyên tắc không trộn dữ liệu layout cây với dữ liệu gia phả thật.
- Cho phép reset layout về auto layout mà không ảnh hưởng dữ liệu quan hệ.

## Decision 020 - Tree Editor add relationship đi qua service thật

Chọn:

Side panel editor gọi server actions rồi dùng relationship service hiện có để thêm cha/mẹ, vợ/chồng hoặc con.

Lý do:

- Không tạo edge React Flow giả che lỗi.
- Giữ permission, validation, cycle check và revision ở service layer.
- Phase 6 chưa tạo người mới từ cây; chỉ nối người đã tồn tại bằng UUID.

## Decision 016 - Chọn `@xyflow/react` cho Tree Viewer

Chọn:

Phase 5 dùng `@xyflow/react` thay vì package `reactflow` cũ.

Lý do:

- `@xyflow/react` là package hiện đại của React Flow.
- Phù hợp yêu cầu viewer có zoom, pan, fit view, custom node và toolbar.
- Không cần thêm package UI nặng ngoài scope.

## Decision 017 - ELK layout chạy trong client viewer ở Phase 5

Chọn:

`lib/family/tree-layout-elk.ts` dùng `elkjs` để layout graph trong client viewer.

Lý do:

- Viewer cần reset layout/fit view tương tác mà không tạo persistence layout.
- Không đưa service role/admin helper vào client; client chỉ nhận graph đã lọc từ tree service.
- Nếu ELK lỗi, helper trả graph gốc để route không crash trắng.

## Decision 018 - Tree viewer dùng family node trung gian

Chọn:

Graph builder tạo node `family` trung gian để nối cha/mẹ với con, bên cạnh node `person`.

Lý do:

- Gia phả thật có thể có nhiều cha/mẹ và nhiều con trong một family.
- Tránh render quá nhiều edge person-to-person gây rối khi có tái hôn, con nuôi hoặc con riêng.
- Giữ dữ liệu quan hệ thật tách khỏi dữ liệu layout UI.

## Decision 013 - Relationship CRUD dùng bảng quan hệ riêng

Chọn:

Phase 4 tạo `families`, `family_parents`, `family_children`, `couple_relationships` thay vì thêm `father_id`, `mother_id`, `spouse_id` vào `people`.

Lý do:

- Giữ đúng mô hình gia phả thật có nhiều cha/mẹ nuôi, con riêng, tái hôn và nhiều quan hệ đôi.
- Không trộn hồ sơ cá nhân với cấu trúc quan hệ.
- Chuẩn bị tốt hơn cho tree viewer/layout ở phase sau.

## Decision 014 - Relationship dùng soft delete và revision chung

Chọn:

Relationship records dùng `deleted_at`, `deleted_by`, `delete_reason` và ghi revision before/after JSON qua helper `logRevision()`.

Lý do:

- Phù hợp quyết định không xóa cứng dữ liệu gia phả.
- Cho phép truy vết ai đã thêm/xóa family edge hoặc couple relationship.
- Tách revision helper khỏi people service để dùng chung lâu dài.

## Decision 015 - Cycle check cha-con ở service layer Phase 4

Chọn:

Phase 4 kiểm vòng lặp tổ tiên trong `relationship-service` trước khi thêm parent/child edge.

Lý do:

- Chặn lỗi dữ liệu cơ bản trước khi có graph/tree UI phức tạp.
- Không cần thêm package ngoài scope Phase 4.
- Có thể nâng cấp sang constraint hoặc graph validation sâu hơn ở phase cây.

## Decision 010 - People CRUD dùng soft delete bắt buộc

Chọn:

Bảng `people` không xóa cứng. Xóa thành viên chỉ cập nhật `deleted_at`, `deleted_by`, `delete_reason`.

Lý do:

- Gia phả dễ bị sửa/xóa nhầm và cần khả năng khôi phục.
- Phù hợp nguyên tắc dữ liệu sống lâu dài.
- Cho phép ghi revision delete/restore rõ ràng.

## Decision 011 - Revision people ghi before/after JSON tối thiểu

Chọn:

Tạo `revisions` và `revision_items` foundation trong Phase 3, service people ghi `before_json` và `after_json` ở mức entity.

Lý do:

- Đủ để truy vết create/update/delete/restore ở Phase 3.
- Chưa cần diff từng field hoàn chỉnh trước khi có workflow review/restore nâng cao.
- Không bỏ qua thiết kế revision history đã chốt từ đầu.

## Decision 012 - Chưa tạo relationship tables trong People CRUD

Chọn:

Phase 3 chỉ tạo `people`, không tạo `families`, `family_parents`, `family_children` hoặc `couple_relationships`.

Lý do:

- Giữ đúng scope People CRUD.
- Tránh trộn hồ sơ cá nhân với quan hệ gia phả thật.
- Relationship CRUD sẽ có phase riêng để xử lý cha/mẹ/con/vợ/chồng đúng mô hình.

## Decision 007 - Dùng magic link cho auth foundation

Chọn:

Supabase magic link theo email cho Phase 2.

Lý do:

- Không cần hardcode tài khoản hoặc mật khẩu.
- Phù hợp foundation khi chưa có signup/admin onboarding UI hoàn chỉnh.
- Callback `/auth/callback` có thể bootstrap profile và kiểm tra quyền server-side.
- Nếu thiếu env Supabase, login page hiển thị trạng thái thiếu cấu hình thay vì crash trắng.

## Decision 008 - Không tự động cấp OWNER

Chọn:

Không auto OWNER cho user đầu tiên. OWNER được gán thủ công bằng SQL/admin context sau khi xác minh danh tính.

Lý do:

- Tránh tự cấp quyền cao chỉ vì thứ tự đăng nhập.
- Phù hợp nguyên tắc không mở quyền rộng trong phase foundation.
- Có SQL snippet `db/snippets/assign-owner-role.sql` để vận hành thủ công khi cần.

## Decision 009 - Quyền tối thiểu vào `/admin` là `people.view`

Chọn:

Route `/admin` yêu cầu permission `people.view`.

Lý do:

- Admin foundation là cổng vào các module vận hành gia phả, không phải trang settings hệ thống thuần túy.
- `people.view` đủ hẹp để chặn user chưa có role, nhưng không yêu cầu quyền quản trị cao như `settings.manage`.
- Các hành động nhạy cảm hơn sẽ cần permission riêng ở phase sau.

## Decision 005 - Dùng cấu trúc App Router ở root `app/`

Chọn:

Giữ Next.js App Router tại root `app/`, không dùng `src/`.

Lý do:

- Khớp trực tiếp với prompt Phase 1 và cấu trúc thư mục đã yêu cầu.
- Dễ đọc cho AI trong các phase tiếp theo.
- Giảm một lớp đường dẫn khi tra route public/admin/auth.

## Decision 006 - Dùng `@supabase/ssr` cho helper client/server

Chọn:

Sử dụng `@supabase/ssr` cùng `@supabase/supabase-js`.

Lý do:

- Phù hợp App Router và cookie-based auth ở server.
- Tách rõ client anon key, server client và admin service role.
- Giữ `SUPABASE_SERVICE_ROLE_KEY` trong helper server-only, không đưa ra client.

## Decision 001 - Chọn stack chính thức

Chọn:

Next.js + Supabase + Cloudflare + React Flow + ELK.js.

Lý do:

- Next.js phù hợp web nhiều trang public/admin.
- Supabase phù hợp Auth/Postgres/Storage.
- Cloudflare phù hợp deploy chi phí thấp.
- React Flow phù hợp cây tương tác/chỉnh sửa trên UI.
- ELK.js phù hợp auto layout sơ đồ/cây phức tạp.

## Decision 002 - Export JSON/GEDCOM/ZIP bắt buộc từ đầu

Lý do:

- Mục tiêu dữ liệu sống lâu dài.
- Không khóa dữ liệu trong Supabase.
- Có thể chuyển hệ thống sau này.
- Có thể phục hồi khi cloud/database gặp vấn đề.

## Decision 003 - Không dùng parent_id/spouse_id đơn giản trong people

Lý do:

- Gia phả thật có nhiều vợ/chồng, con riêng, con nuôi, tái hôn.
- Cần nguồn xác minh và revision history.
- Cần tách quan hệ khỏi hồ sơ cá nhân.

## Decision 004 - Không xóa cứng dữ liệu gia phả

Lý do:

- Gia phả dễ bị sửa/xóa nhầm.
- Cần khôi phục.
- Cần lưu lịch sử thay đổi.
# 2026-07-14 - A-17Q dry-run must use authenticated owner session

- Decision: replace the Supabase SQL Editor dry-run path with an owner/admin application route that calls the A-17Q executor through the real signed-in user's server-cookie Supabase client.
- Reason: the executor is `SECURITY INVOKER` and correctly requires `auth.uid()` plus `current_profile_id`; SQL Editor does not provide the application user's authenticated Supabase session.
- Safety contract: the source caller hardcodes `p_dry_run_only=true`, all approved hashes, owner marker and confirmation booleans; no request input can enable non-dry-run execution.
- Boundary: no service role, no JWT claim spoofing, no migration change, no RPC call during source phase, no deploy and no push.

# 2026-07-14 - A-17Q-TX2 verifier must prove dry-run return ordering

- Decision: classify the `dry_run_branch_preserved=false` TX2 verifier result as a verifier false negative and correct only the SELECT-only verifier/checker.
- Reason: production function source showed the reviewed branch `if p_dry_run_only is true then return v_result; end if;`, while the verifier searched only the stale literal `if p_dry_run_only then`.
- Safety contract: the corrected verifier must accept the equivalent current predicate and also prove the dry-run return occurs before batch insert, rollback write, audit write, genealogy mutation and durable success-result write.
- Boundary: no RPC source change, no migration 0028, no migration 0026/0027 edit, no SQL execution in FIX1, no RPC call, no runtime change, no deploy and no push.
