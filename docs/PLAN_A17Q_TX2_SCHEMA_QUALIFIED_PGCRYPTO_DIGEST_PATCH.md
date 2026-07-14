# A-17Q-TX2 - Schema-Qualified pgcrypto Digest Patch

Date: 2026-07-14

Status:
`A17Q_TX2_STATUS=PASS_PGCRYPTO_DIGEST_PATCH_CANDIDATE_READY_NOT_APPLIED`

## Production Evidence

- `MIGRATION_0026_APPLIED=YES_OWNER_MANUAL_PRODUCTION`
- `AUTHENTICATED_DRY_RUN_CALLED=YES_DRY_RUN_ONLY_ONCE`
- `AUTHENTICATED_DRY_RUN_RESULT=RPC_ERROR`
- `RPC_ERROR=function digest(bytea, unknown) does not exist`
- `GENEALOGY_DATA_MUTATED=NO`

Owner-confirmed production metadata says pgcrypto is installed under
`extensions` and exposes `extensions.digest(bytea, text)` plus
`extensions.digest(text, text)`. The applied A-17Q RPC keeps the fixed
`search_path=public, auth, pg_temp`, so unqualified `digest(...)` is not
resolved during the authenticated dry-run.

## Patch Scope

- `PATCH_MIGRATION_FILE=db/migrations/20260714_0027_a17q_tx2_schema_qualified_pgcrypto_digest_patch.sql`
- `PATCH_SUPABASE_MIRROR_FILE=supabase/migrations/20260714_0027_a17q_tx2_schema_qualified_pgcrypto_digest_patch.sql`
- `PATCH_MIGRATION_SHA256=6CD412A9A00AE54C79999E4606BBAF58B141764F696CE823F44078859D37D9CB`
- `MIRROR_MATCH=YES`
- `PGCRYPTO_SCHEMA=extensions`
- `DIGEST_BYTEA_TEXT_EXISTS=YES`
- `QUALIFIED_EXTENSIONS_DIGEST_CALL_COUNT=17`
- `UNQUALIFIED_EXECUTABLE_DIGEST_CALL_COUNT=0`
- `QUALIFIED_PG_CATALOG_ENCODE_CALL_COUNT=17`
- `QUALIFIED_PG_CATALOG_CONVERT_TO_CALL_COUNT=17`

Migration 0027 replaces only
`public.execute_admin_a17q_legacy_family_reconciliation` by replaying the
reviewed migration 0026 RPC body with digest resolution changed to:

```sql
pg_catalog.encode(
  extensions.digest(
    pg_catalog.convert_to(<text-expression>, 'UTF8'),
    'sha256'::text
  ),
  'hex'
)
```

Existing bytea expressions already using `convert_to(...)` are preserved as
bytea inputs and schema-qualified as `pg_catalog.convert_to(...)`.

## Preserved Contract

- `RPC_SIGNATURE_UNCHANGED=YES`
- `RPC_RETURN_TYPE=jsonb`
- `SECURITY_INVOKER_PRESERVED=YES`
- `FIXED_SEARCH_PATH_PRESERVED=YES`
- `SEARCH_PATH=public, auth, pg_temp`
- `EXTENSIONS_ADDED_TO_SEARCH_PATH=NO`
- `PGCRYPTO_EXTENSION_ADDED_OR_MOVED=NO`
- `GRANTS_PRESERVED=YES`
- `PUBLIC_EXECUTE_ALLOWED=NO`
- `ANON_EXECUTE_ALLOWED=NO`
- `AUTHENTICATED_EXECUTE_GRANT=YES`
- `ALL_FIVE_HASHES_PRESERVED=YES`
- `IMMUTABLE_MANIFESTS_PRESERVED=YES`
- `DRY_RUN_PURITY_PRESERVED=YES`
- `IDEMPOTENCY_REPLAY_PRESERVED=YES`
- `AUDIT_ROLLBACK_GRAPH_POST_STATE_CONTRACTS_PRESERVED=YES`
- `RUNTIME_CHANGED=NO`

## Verifier and Checker

- `SELECT_ONLY_VERIFIER_FILE=db/checks/20260714_check_a17q_tx2_schema_qualified_pgcrypto_digest_patch.sql`
- `CHECKER_FILE=scripts/check-a17q-tx2-schema-qualified-pgcrypto-digest-patch.cjs`
- `PACKAGE_SCRIPT=check:a17q-tx2-schema-qualified-pgcrypto-digest-patch`

The verifier is SELECT-only, checks the `extensions.digest(bytea,text)` function
exists, confirms executable digest calls in the deployed RPC are
schema-qualified, verifies unqualified executable digest call count is zero, and
confirms signature/security/search path/grants are unchanged. It does not call
the reconciliation executor.

The checker verifies migration 0026 SHA remains unchanged and proves migration
0027 equals migration 0026's RPC/grant body after the expected mechanical
qualification of `digest`, `encode` and `convert_to`.

## Boundary

- `SQL_EXECUTED=NO`
- `MIGRATION_APPLIED=NO`
- `RPC_CALLED=NO`
- `DATABASE_MUTATION=NO`
- `GENEALOGY_DATA_MUTATED=NO`
- `RECONCILIATION_EXECUTED=NO`
- `FAMILY_VOIDED=NO`
- `MEMBERSHIP_MOVED=NO`
- `RELATIONSHIP_ROLE_CHANGED=NO`
- `RUNTIME_CHANGED=NO`
- `DEPLOY=NO`
- `PUSH=NO`

## Next Action

`NEXT_ACTION=A17Q_TX2_MANUAL_APPLY_VERIFY_AND_RETRY_AUTHENTICATED_DRY_RUN`

`EXPECTED_SUCCESS_STATUS=PASS_PGCRYPTO_DIGEST_PATCH_CANDIDATE_READY_NOT_APPLIED`
