# A-17Q-DR2-FIX1 - Post-Dry-Run Verifier UUID Array Operator Fix

Date: 2026-07-14

Status:
`A17Q_DR2_FIX1_STATUS=PASS_POST_DRY_RUN_UUID_ARRAY_VERIFIER_CORRECTED`

## Baseline

The authenticated production dry-run reached the A-17Q executor through the
owner/admin application session and returned the expected no-mutation forecast:

- `DRY_RUN=true`
- `EXECUTION_ALLOWED=true`
- `MUTATION_APPLIED=false`
- `APPROVED_GROUP_COUNT=21`
- `VOID_FAMILY_COUNT=36`
- `CHILD_MEMBERSHIP_MOVE_COUNT=36`
- `PARENT_MEMBERSHIP_DEACTIVATION_COUNT=72`
- `EXPECTED_POST_STATE=38/68/73`

The separate post-dry-run SELECT-only verifier then failed with PostgreSQL
error `42883`:

`operator does not exist: uuid = uuid[]`

## Root Cause

`ROOT_CAUSE=POSTGRES_ANY_SUBQUERY_INTERPRETED_UUID_ARRAY_ROW_AS_UUID_ARRAY_SCALAR_COMPARISON`

The verifier used:

```sql
f.id = any((select excluded_family_ids from expected))
```

PostgreSQL treated the nested `select` as an `ANY(subquery)` expression whose
single returned value is a `uuid[]`, producing a scalar `uuid = uuid[]`
comparison. The intended semantics are membership of a scalar UUID in the
expected UUID array.

## Correction

- `VERIFIER_FILE=db/checks/20260713_check_a17q_dr1_post_production_reconciliation_dry_run.sql`
- `UUID_EQUALS_UUID_ARRAY_COUNT=0`
- `VALID_UUID_ANY_OR_CONTAINMENT_CHECK_PRESENT=YES`
- `UUID_MEMBERSHIP_OPERATOR_CORRECTED=YES`

The excluded-family membership check now uses an explicitly typed array
expression:

```sql
f.id = any(
  coalesce(
    (select excluded_family_ids from expected),
    array[]::uuid[]
  )
)
```

No array-to-array equality was changed.

## Preserved Contract

- `SELECT_ONLY_PRESERVED=YES`
- `EXECUTOR_CALL_COUNT=0`
- `ACTIVE_BASELINE_CHECK_PRESERVED=74/140/73`
- `DECISION_PACK_BATCH_COUNT_ZERO_CHECK_PRESERVED=YES`
- `COMPLETED_BATCH_COUNT_ZERO_CHECK_PRESERVED=YES`
- `ROLLBACK_MANIFEST_COUNT_ZERO_CHECK_PRESERVED=YES`
- `EXCLUDED_SCOPE_UNCHANGED_CHECK_PRESERVED=YES`
- `DELETED_SCOPE_UNCHANGED_CHECK_PRESERVED=YES`

## Static Checker

- `CHECKER_FILE=scripts/check-a17q-dr2-fix1-post-dry-run-verifier-uuid-array.cjs`
- `PACKAGE_SCRIPT=check:a17q-dr2-fix1-post-dry-run-verifier-uuid-array`

The checker verifies:

- `UUID_EQUALS_UUID_ARRAY_COUNT=0`
- `VALID_UUID_ANY_OR_CONTAINMENT_CHECK_PRESENT=YES`
- `SELECT_ONLY=YES`
- `EXECUTOR_CALL_COUNT=0`
- migration files unchanged;
- runtime files unchanged.

## Boundary

- `MIGRATION_CHANGED=NO`
- `RPC_CHANGED=NO`
- `RUNTIME_CHANGED=NO`
- `SQL_EXECUTED=NO`
- `DRY_RUN_REPEATED=NO`
- `DATABASE_MUTATION=NO`
- `RECONCILIATION_EXECUTED=NO`
- `DEPLOY=NO`
- `PUSH=NO`

## Next Action

`NEXT_ACTION=A17Q_DR2_RERUN_POST_DRY_RUN_VERIFIER_ONLY`

`EXPECTED_SUCCESS_STATUS=PASS_POST_DRY_RUN_UUID_ARRAY_VERIFIER_CORRECTED`
