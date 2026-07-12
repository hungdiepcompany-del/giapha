# A-16BU - Post-Apply Read-Only Verification

## Status

`A16BU_STATUS=POST_APPLY_READ_ONLY_VERIFIED`

Owner apply marker:

`OWNER_CONFIRMED_A16BU_0022_MANUAL_SQL_APPLY_SUCCEEDED`

Codex did not apply migration 0022. This phase only ran the post-apply
metadata verifier after the owner confirmed manual SQL apply.

## Scope

`A16BU_POST_APPLY_VERIFICATION_SQL=db/checks/20260712_check_a16bu_official_import_is_living_null_contract_post_apply.sql`

`A16BU_POST_APPLY_SQL_SCOPE=SELECT_ONLY_METADATA_NO_GENEALOGY_ROWS`

The verifier reads only database metadata:

- `pg_proc`
- `pg_namespace`
- `information_schema.routine_privileges`
- trigger metadata for automatic-import safety

It does not query genealogy rows, does not execute the official-import RPC, and
does not mutate production data.

## Verification Result

- `FUNCTION_EXISTS_WITH_UNCHANGED_SIGNATURE=YES`
- `SECURITY_INVOKER_PRESERVED=YES`
- `FIXED_SEARCH_PATH_PRESERVED=YES`
- `CORRECTED_IS_LIVING_NON_NULL_FALLBACK_PRESENT=YES`
- `OLD_NULLABLE_IS_LIVING_BRANCH_ABSENT=YES`
- `ANON_EXECUTE_GRANT_COUNT_ZERO=YES`
- `PUBLIC_EXECUTE_GRANT_COUNT_ZERO=YES`
- `MIGRATION_0016_HASH_MATCH=YES`
- `MIGRATION_0016_SHA256=68B98F59F575CADA6A0AB3AA0ACB856ED78984A5320A4DD784DB97E0D2317903`
- `MIGRATION_0022_HASH_MATCH=YES`
- `MIGRATION_0022_SHA256=97EC8E3108033CB4F26E86B5E348C5A15BF33DCC46650F384735482FA4712CA3`

Raw metadata verification output, normalized as CSV rows:

```text
A16BU_POST_APPLY_VERIFY,a16bu_post_apply_verified,PASS
A16BU_POST_APPLY_VERIFY,anon_execute_grant_count_zero,PASS
A16BU_POST_APPLY_VERIFY,corrected_is_living_boolean_cast,PASS
A16BU_POST_APPLY_VERIFY,corrected_is_living_boolean_guard,PASS
A16BU_POST_APPLY_VERIFY,corrected_is_living_death_text_fallback,PASS
A16BU_POST_APPLY_VERIFY,fixed_search_path_preserved,PASS
A16BU_POST_APPLY_VERIFY,function_exists_with_unchanged_signature,PASS
A16BU_POST_APPLY_VERIFY,no_automatic_import_trigger,PASS
A16BU_POST_APPLY_VERIFY,old_nullable_is_living_branch_absent,PASS
A16BU_POST_APPLY_VERIFY,public_execute_grant_count_zero,PASS
A16BU_POST_APPLY_VERIFY,security_invoker_preserved,PASS
```

## Safety

- `SQL_EXECUTED=YES_READ_ONLY_METADATA_ONLY`
- `GENEALOGY_ROWS_QUERIED=NO`
- `GENEALOGY_ROWS_MODIFIED=NO`
- `IMPORT_RPC_CALLED=NO`
- `A16R_RETRY=NO`
- `DEPLOY=NO`
- `PUSH=NO`

## Validation

- `npx.cmd --yes supabase db query --linked --file db/checks/20260712_check_a16bu_official_import_is_living_null_contract_post_apply.sql`: PASS
- `npm.cmd run check:a16bu-post-apply-read-only-verification`: PASS

## Next Action

`NEXT_ACTION=OWNER_DECIDE_SEPARATE_A16R_RETRY_PHASE_AFTER_REVIEWING_POST_APPLY_EVIDENCE`
