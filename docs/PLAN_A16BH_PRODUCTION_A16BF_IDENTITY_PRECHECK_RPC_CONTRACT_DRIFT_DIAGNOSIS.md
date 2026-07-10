# A-16BH - Production A-16BF identity precheck and RPC contract drift diagnosis

Status:
`A16BH_STATUS=PASS_SOURCE_DIAGNOSTIC_CANDIDATE_NOT_DEPLOYED_NOT_EXECUTED`.

Target session:
`A16BH_TARGET_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.

Production evidence received from owner:

- `OFFICIAL_IMPORT_POST_REJECTED_HTTP_409`
- `Status=BLOCKED`
- `canRunOfficialImport=true`
- `A16AH_BLOCKED_TRANSACTION_RPC_FAILED`
- `SESSION_NOT_FOUND_OR_NOT_OWNED`
- imported people count `0`
- runtime branch reached the transaction helper once
- no genealogy data imported

## Production commit evidence

`A16BH_PRODUCTION_COMMIT_EVIDENCE=LOCAL_ORIGIN_MAIN_CONTAIN_92C4271_PRODUCTION_DEPLOY_OF_92C4271_NOT_PROVEN_IN_THIS_PHASE`.

Local `main` and `origin/main` contain:
`92c4271 feat: add A16BF RPC identity precheck`.

This phase did not deploy and did not query Cloudflare deployment metadata. The
owner-reported POST result proves production is still failing at the transaction
RPC, but by itself it does not prove whether production already includes
`92c4271`.

## A-16BF precheck active status

`A16BH_A16BF_PRECHECK_ACTIVE=UNKNOWN_NEEDS_AUTHENTICATED_GET_DIAGNOSTIC_AFTER_DEPLOY`.

Reason:

- If A-16BF is active and the precheck fails, the transaction helper should not
  be reached.
- The owner-reported production result says the transaction helper was reached
  once.
- Therefore the current evidence means either:
  - production did not include A-16BF; or
  - A-16BF was active and the same-run identity precheck passed, then the
    transaction RPC failed due production RPC contract drift or deeper database
    context mismatch.

## Read-only diagnostic added

Diagnostic route:
`GET /api/admin/import-sessions/2af4bfb6-a20e-453e-9804-1b8c0afbdd68/official-import-identity-precheck`

`A16BH_READ_ONLY_DIAGNOSTIC_ROUTE=ADDED_AUTHENTICATED_GET_ONLY`.

The route requires authenticated strict official-import permission context and
returns only sanitized markers, classifications and booleans:

- auth user present boolean;
- permission profile present boolean;
- RPC-visible profile present boolean;
- audited session owner present boolean;
- equality booleans;
- client/auth context classifications;
- sanitized blocker markers;
- `piiPrinted:false`.

It does not call `POST /official-import`, does not call
`a16p_tx_execute_giapha4_official_import`, does not mutate DB, and does not
return profile IDs, auth IDs, names, tokens, cookies, raw JSON or genealogy rows.

Read-only precheck result in this local source phase:
`A16BH_READ_ONLY_PRECHECK_RESULT=NOT_RUN_AGAINST_PRODUCTION_IN_THIS_PHASE`.

## Same-run client alignment

Precheck client context:
`A16BH_PRECHECK_CLIENT_CONTEXT=SAME_RUN_END_USER_SERVER_COOKIES_ANON_KEY_SECURITY_INVOKER_FOR_POST_PATH`.

Import RPC client context:
`A16BH_IMPORT_RPC_CLIENT_CONTEXT=SAME_RUN_END_USER_SERVER_COOKIES_ANON_KEY_SECURITY_INVOKER_FOR_POST_PATH`.

Exact same client instance:
`A16BH_PRECHECK_AND_IMPORT_RPC_USE_SAME_CLIENT_INSTANCE=YES_IN_SOURCE_POST_PATH`.

The source now creates one same-run server Supabase client in
`executeOfficialImportRuntimeCandidate`, uses it for the A-16BF identity
precheck, then passes that same client object into
`executeOfficialImportTransactionWithSupabase`.

The GET diagnostic route intentionally does not run the import RPC, so it cannot
share a live instance with an import call. It proves the RPC-visible identity
through the same cookie-bound server client factory and records sanitized
booleans only.

## Production RPC contract status

`A16BH_PRODUCTION_RPC_CONTRACT_STATUS=UNKNOWN_OWNER_READ_ONLY_SQL_REQUIRED`.

Codex did not run SQL and did not mutate the database. To compare production RPC
contract without printing function source, owner can run this read-only SQL in
Supabase SQL Editor and provide only the booleans:

```sql
select
  p.oid is not null as rpc_function_present,
  p.prosecdef = false as rpc_security_invoker,
  p.proargnames @> array[
    'p_import_session_id',
    'p_confirm_marker',
    'p_confirm_manifest_hash',
    'p_confirm_review_pack_hash',
    'p_confirm_validation_errors_resolved',
    'p_confirm_rollback_reviewed',
    'p_confirm_audit_reviewed',
    'p_dry_run_only'
  ] as rpc_expected_args_present,
  pg_get_functiondef(p.oid) like '%v_profile_id uuid := public.current_profile_id();%' as rpc_uses_current_profile_id,
  pg_get_functiondef(p.oid) like '%created_by = v_profile_id%' as rpc_uses_created_by_profile_ownership,
  pg_get_functiondef(p.oid) like '%SESSION_NOT_FOUND_OR_NOT_OWNED%' as rpc_session_not_found_blocker_present,
  obj_description(p.oid, 'pg_proc') like '%A16V%' as rpc_comment_has_a16v_marker
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'a16p_tx_execute_giapha4_official_import';
```

Do not paste function source or private data back into docs/chat. Provide only
the boolean column results.

## Root cause classification

`A16BH_ROOT_CAUSE=PRODUCTION_PRECHECK_ACTIVE_OR_RPC_CONTRACT_DRIFT_NOT_PROVEN_YET`.

Minimum next evidence:
`A16BH_NEXT_ACTION=DEPLOY_A16BH_THEN_RUN_AUTHENTICATED_GET_IDENTITY_PRECHECK_AND_OWNER_READ_ONLY_RPC_CONTRACT_SQL_NO_IMPORT`.

## Safety

`A16BH_POST_OFFICIAL_IMPORT_CALLED=NO_IN_THIS_PHASE`.

`A16BH_IMPORT_TRANSACTION_RPC_CALLED=NO_IN_THIS_PHASE`.

`A16BH_A16R_RETRY_NEXT=NO`.

`A16BH_SQL_RUN=NO`.

`A16BH_DB_MUTATION_RUN=NO`.

`A16BH_DEPLOY_RUN=NO`.

`A16BH_RAW_PRIVATE_DATA_PRINTED_OR_COMMITTED=NO`.
