# A-16BU - Official Import `is_living` Null Contract Fix Candidate

## Status

`A16BU_STATUS=CANDIDATE_READY_NOT_APPLIED_OWNER_REVIEW_REQUIRED`

This phase creates a corrective migration candidate only. It does not execute
SQL, does not apply the migration, does not call the official import RPC, does
not retry A-16R, does not deploy, and does not push.

## Production Failure Evidence

Owner-provided production evidence:

- `OFFICIAL_IMPORT_POST_REJECTED_HTTP_409`
- `Status=BLOCKED`
- `canRunOfficialImport=true`
- `Imported people count=0`
- `Warnings count=0`
- `Transaction helper call count=1`
- `Blocker=A16AH_BLOCKED_TRANSACTION_RPC_FAILED`
- database error:
  `null value in column "is_living" of relation "people" violates not-null constraint`

Identity/session/RPC visibility was already verified before this corrective
candidate:

- authenticated owner identity present;
- runtime permission profile present;
- RPC-visible profile present;
- audited import session owner present;
- runtime profile, RPC-visible profile, and session owner all matched;
- `imports.create` present;
- no A-16BF identity blocker.

The official import retry reached the transaction helper, but the transaction
blocked before creating people. Imported people count remained `0`.

## Root Cause

`ROOT_CAUSE_CONFIRMED=YES`

`IS_LIVING_NULL_SOURCE_CONTRACT=A16V_CANDIDATE_EXISTS_BRANCH_TREATS_JSON_NULL_AS_PRESENT`

Migration 0016 used this nullable contract:

```sql
case
  when candidate ? 'isLiving' then (candidate ->> 'isLiving')::boolean
  else nullif(candidate ->> 'deathDateText', '') is null
end
```

`candidate ? 'isLiving'` is true even when the JSON value is `null`. In that
case `candidate ->> 'isLiving'` becomes SQL NULL, the boolean cast remains NULL,
and the insert violates `people.is_living NOT NULL`.

## Corrective Migration

`CORRECTIVE_MIGRATION=db/migrations/20260712_0022_a16bu_official_import_is_living_null_contract_fix.sql`

Mirror:

`supabase/migrations/20260712_0022_a16bu_official_import_is_living_null_contract_fix.sql`

`MIGRATION_0016_HASH_MATCH=YES`

`MIGRATION_0016_SHA256=68B98F59F575CADA6A0AB3AA0ACB856ED78984A5320A4DD784DB97E0D2317903`

`DB_MIGRATION_SHA256=97EC8E3108033CB4F26E86B5E348C5A15BF33DCC46650F384735482FA4712CA3`

`SUPABASE_MIRROR_SHA256=97EC8E3108033CB4F26E86B5E348C5A15BF33DCC46650F384735482FA4712CA3`

`MIRROR_MATCH=YES`

The migration replaces the same RPC signature:

`public.a16p_tx_execute_giapha4_official_import(uuid,text,text,text,boolean,boolean,boolean,boolean)`

Preserved contracts:

- `FUNCTION_SIGNATURE_PRESERVED=YES`
- `SECURITY_INVOKER_PRESERVED=YES`
- fixed `search_path = public, pg_temp`
- permission checks preserved
- session ownership checks preserved
- row locking preserved
- all-or-nothing transaction shape preserved
- audit/revision/rollback/idempotency contracts preserved
- `ANON_PUBLIC_EXECUTE_REVOKED=YES`
- no anon/PUBLIC EXECUTE grant added

Only the `people.is_living` derivation changes:

```sql
case
  when lower(btrim(coalesce(candidate ->> 'isLiving', ''))) in ('true', 'false')
    then lower(btrim(candidate ->> 'isLiving'))::boolean
  else nullif(btrim(coalesce(candidate ->> 'deathDateText', '')), '') is null
end
```

## Static Fixture Contract

`IS_LIVING_NEVER_NULL_STATIC_VERIFIED=YES`

- `BOOLEAN_TRUE_FIXTURE=true`
- `BOOLEAN_FALSE_FIXTURE=true`
- `STRING_TRUE_FIXTURE=true`
- `STRING_FALSE_FIXTURE=true`
- `NULL_WITHOUT_DEATH_FIXTURE=true`
- `NULL_WITH_DEATH_FIXTURE=true`
- `MISSING_WITHOUT_DEATH_FIXTURE=true`
- `MISSING_WITH_DEATH_FIXTURE=true`
- `EMPTY_IS_LIVING_FIXTURE=true`
- `EMPTY_IS_LIVING_WITH_DEATH_FIXTURE=true`
- `INVALID_VALUE_FALLBACK_FIXTURE=true`
- `INVALID_VALUE_WITH_DEATH_FALLBACK_FIXTURE=true`

Required outcomes:

- explicit true -> true
- explicit false -> false
- string `"true"` -> true
- string `"false"` -> false
- null/missing/empty/invalid plus no `deathDateText` -> true
- null/missing/empty/invalid plus non-empty `deathDateText` -> false
- expression never returns NULL

## Safety

- `SQL_EXECUTED=NO`
- `MIGRATION_APPLIED=NO`
- `IMPORT_RPC_CALLED=NO`
- `A16R_RETRY=NO`
- `DEPLOY=NO`
- `PUSH=NO`
- no production rows queried
- no data seed added
- no runtime application code changed
- do not click "Xac nhan nhap" again before a separate owner review, apply,
  verification, and retry approval phase

## Validation Contract

Primary checker:

`npm run check:a16bu-official-import-is-living-null-contract-fix`

The checker verifies:

- migration 0016 hash unchanged;
- corrective migration DB/Supabase mirror match;
- function signature/security/search_path preserved;
- no anon/PUBLIC EXECUTE grant;
- anon/PUBLIC EXECUTE remains revoked;
- deterministic non-null `is_living` expression;
- required static fixtures;
- no direct RPC invocation/import call in the migration;
- docs/index/work-log/decision-log/handoff are synchronized.

## Next Action

`NEXT_ACTION=OWNER_REVIEW_CORRECTIVE_MIGRATION_THEN_SEPARATE_APPLY_VERIFY_PHASE`
