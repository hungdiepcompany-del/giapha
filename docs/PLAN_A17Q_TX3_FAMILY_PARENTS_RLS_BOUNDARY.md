# A-17Q-TX3A - family_parents RLS boundary diagnosis and local patch

Status:

```text
A17Q_TX3A_STATUS=PASS_LOCAL_PATCH_READY_FOR_OWNER_REVIEW
A17Q_TX3B_FIX1_STATUS=PASS_EXPLICIT_POSTGRES_OWNER_AND_TRACKED_MIRROR_READY_FOR_FINAL_REVIEW
ROOT_CAUSE_PROVEN=YES
PRIMARY_ROOT_CAUSE=RPC_SECURITY_INVOKER_INCORRECT_BOUNDARY
PATCH_TYPE=LOCAL_MIGRATION_CANDIDATE_SECURITY_DEFINER_TRANSACTION_BOUNDARY
```

## Input Evidence

```text
DEPLOYED_COMMIT=c7d535d8c641f706ac2c7be18d4c64c03e73977c
FAILED_DEPLOY_RUN=29309666934
A17Q_EXEC2_STATUS=BLOCKED_INITIAL_RPC_ERROR_FAMILY_PARENTS_RLS
OWNER_SESSION_VERIFIED=YES
EXACT_CONFIRMATION_ACCEPTED=YES
INITIAL_RPC_CALLED=YES_SINGLE_OWNER_EXECUTION_ATTEMPT
INITIAL_MUTATION_APPLIED=NO_COMPLETION_BLOCKED_RPC_ERROR
INITIAL_RPC_ERROR=new row violates row-level security policy for table "family_parents"
COMPLETED_BATCH_COUNT=0
ROLLBACK_MANIFEST_COUNT=0
REPLAY_CALLED=NO
RECONCILIATION_EXECUTED=NO_COMPLETED_EXECUTION
TRACKED_ACTIVE_COUNTS_BEFORE=74/140/73
TRACKED_ACTIVE_COUNTS_AFTER_ERROR=74/140/73
GENEALOGY_DATA_MUTATED=NO_TRACKED_ACTIVE_COUNTS_UNCHANGED_AFTER_RPC_ERROR
```

No production SQL was executed by Codex in TX3A. No RPC was retried.

## Diagnosis

The failing RPC is:

```text
FAILING_FUNCTION=public.execute_admin_a17q_legacy_family_reconciliation
RPC_SECURITY_MODE=SECURITY_INVOKER
RPC_SEARCH_PATH=public, auth, pg_temp
CALLER_ROLE_EXPECTED=authenticated owner/admin application session
DIRECT_OR_TRIGGERED=DIRECT
```

The first genealogy mutation in the reviewed executor is a direct `UPDATE public.family_parents fp` in migration 0027. It is the `survivor_role_updates` CTE immediately after the pre-mutation audit insert. The second `family_parents` mutation is the `deactivated_parents` CTE, also a direct update. There is no `INSERT`, `DELETE`, `UPSERT`, helper-generated insert, or trigger-generated insert into `family_parents` in A17Q.

```text
FAILING_OPERATION=UPDATE public.family_parents
FAILING_STATEMENT_LOCATION=db/migrations/20260714_0027_a17q_tx2_schema_qualified_pgcrypto_digest_patch.sql family_parents update CTEs
INSERTED_ROW_POLICY_MATCH=NOT_APPLICABLE_UPDATE_NEW_ROW_RLS_CHECK
```

The table boundary is:

```text
FAMILY_PARENTS_RLS_ENABLED=YES
FAMILY_PARENTS_RLS_FORCED=NO_SOURCE_FORCE_RLS_NOT_PRESENT
SELECT_POLICY_COUNT=2_SOURCE_POLICIES_RELATIONSHIP_AUTHENTICATED_AND_A16BT_ANON_PUBLIC_EDGE
INSERT_POLICY_COUNT=1_SOURCE_POLICY_RELATIONSHIP_CREATORS
UPDATE_POLICY_COUNT=1_SOURCE_POLICY_RELATIONSHIP_MAINTAINERS
DELETE_POLICY_COUNT=0_SOURCE_POLICY_NONE
RELEVANT_POLICY_ROLES=authenticated
RELEVANT_USING=public.has_permission('relationships.update') or public.has_permission('relationships.delete')
RELEVANT_WITH_CHECK=public.has_permission('relationships.update') or public.has_permission('relationships.delete')
```

The trigger chain is not the source of the secondary write:

```text
TRIGGER_NAME=family_parents_set_updated_at
TRIGGER_TIMING=BEFORE
TRIGGER_EVENT=UPDATE
TRIGGER_FUNCTION=public.set_updated_at()
TRIGGER_SECURITY_MODE=UNSPECIFIED_INVOKER_DEFAULT
SECONDARY_TABLE_MUTATIONS=NONE
```

The function body has no exception handler that swallows errors, no autonomous transaction, no HTTP call, no queue call, and no out-of-band write. The observed post-error counts `74/140/73` and batch/rollback counts `0/0` are consistent with the single PostgreSQL transaction rolling back after the RLS error.

```text
ATOMICITY_EXPECTED=YES
PARTIAL_COMMIT_PATH_FOUND=NO
ERROR_SWALLOWED=NO
```

## Root Cause

The source-proven boundary defect is that the single reviewed reconciliation executor was left as `SECURITY INVOKER` while it is the transaction boundary for a one-time owner-approved reconciliation that must atomically update `family_parents`, `family_children`, `families`, audit rows, rollback manifest rows and idempotency state. The authenticated owner path reached the first `family_parents` update and PostgreSQL rejected the new row under table RLS before any completion state committed.

This is not classified as a missing trigger fix, row-shape insert issue, service-role issue, anon grant issue, or broad authenticated grant requirement.

```text
PRIMARY_ROOT_CAUSE=RPC_SECURITY_INVOKER_INCORRECT_BOUNDARY
SECONDARY_CONTRIBUTORS=family_parents RLS evaluated during direct UPDATE inside the transaction executor
ROOT_CAUSE_PROVEN=YES
```

## Local Patch

Migration candidate:

```text
MIGRATION_CANDIDATE=db/migrations/20260714_0028_a17q_tx3_family_parents_rls_boundary_patch.sql
MIRROR=supabase/migrations/20260714_0028_a17q_tx3_family_parents_rls_boundary_patch.sql
OLD_SHA256=413129868C04142B0A8EE7A7B9B11A9A832D3C68EC9D3D4B96C96A07935C65F5
NEW_SHA256=9BBDB8CC9F161EC93A6B2FA97FE0F899C13242A270D2CAB328A95BE8893A23F7
MIRROR_TRACKED=YES
MIRROR_MATCH=YES
```

The migration replaces only `public.execute_admin_a17q_legacy_family_reconciliation` by copying the already-applied TX2 digest-qualified body and changing the executable function mode from:

```text
SECURITY INVOKER
```

to:

```text
SECURITY DEFINER
```

TX3B-FIX1 resolves the owner-review blockers using owner-provided production
evidence that the current RPC owner is `postgres`, `postgres.rolbypassrls=true`,
target tables are owned by `postgres`, RLS remains enabled and FORCE RLS is
disabled. The candidate now explicitly assigns the exact RPC signature to
`postgres` after the function definition and before reasserting the final
execute grant contract.

Preserved:

```text
RPC signature unchanged
explicit function owner=postgres
fixed search_path=public, auth, pg_temp
auth.uid/profile assertion preserved
relationships.update and permissions.manage assertions preserved
owner marker preserved
five immutable hashes preserved
p_dry_run_only branch preserved
idempotency and completed replay preserved
rollback manifest logic preserved
pre/post audit logic preserved
final graph/post-state checks preserved
PUBLIC and anon EXECUTE revoked
authenticated EXECUTE grant preserved
runtime caller unchanged
```

Security-expansion assessment:

```text
SECURITY_EXPANSION=NARROW_TRANSACTION_BOUNDARY_ONLY
RLS_DISABLED=NO
ANON_WRITE_GRANTED=NO
AUTHENTICATED_WRITE_BROADENED=NO
SERVICE_ROLE_USED=NO
JWT_SPOOFED=NO
```

This phase does not add a broad authenticated table-write policy, does not add `USING (true)` or `WITH CHECK (true)`, does not grant anon writes, and does not expose direct frontend writes to `family_parents`.

## Checker

```text
CHECKER=scripts/check-a17q-tx3-family-parents-rls-boundary.cjs
PACKAGE_SCRIPT=check:a17q-tx3-family-parents-rls-boundary
FIX1_PACKAGE_SCRIPT=check:a17q-tx3b-fix1-privileged-function-ownership
```

The checker verifies:

- db and Supabase migration mirrors are byte-identical.
- the Supabase migration mirror is tracked by Git.
- no migration 0029 exists.
- 0028 differs from 0027 only by TX3 header/comment, the intended
  `SECURITY DEFINER` transaction-boundary mode, explicit `owner to postgres`
  assignment and final revoke-all/grant contract.
- the exact RPC signature is targeted by the owner statement.
- owner assignment appears before final PUBLIC/anon revoke and authenticated
  grant statements.
- `family_parents` RLS remains enabled in schema source.
- no new policy is added and no policy uses `true`.
- no anon write grant is added.
- no authenticated `family_parents` write grant is broadened.
- fixed search path, auth/profile/permission/hash gates, dry-run branch, idempotency, rollback and audit logic remain present.
- the migration does not call the executor.
- runtime service-role/JWT spoofing is absent.
- the dry-run and single-execution caller counts remain unchanged.

## Gates

Owner review is still required before any apply:

```text
NEXT_ALLOWED_PHASE=A17Q_TX3B_FINAL_OWNER_REVIEW
OWNER_MARKERS_REQUIRED=OWNER_APPROVES_A17Q_TX3_FAMILY_PARENTS_RLS_BOUNDARY_PATCH_REVIEW
SQL_APPLY=NO
RPC_RETRY=NO
RPC_REPLAY=NO
RECONCILIATION=NO
DEPLOY=NO
GIT_PUSH=NO
```

After owner review and manual apply in a later phase, rerun the TX3 verifier/checker and only then consider a single owner execution retry under a separate explicit marker.

## Rollback Code Plan

If owner review rejects this boundary, do not apply migration 0028. If 0028 is manually applied and must be rolled back before execution, a separate owner-approved patch should replace the RPC with the prior TX2 `SECURITY INVOKER` body from migration 0027 and preserve TX2 digest qualification.
