# A-16BI - Same-client RPC binding and production contract read-only verification

Status:
`A16BI_STATUS=PASS_DIAGNOSED_SAME_CLIENT_FALSE_AND_READY_FOR_OWNER_RPC_CONTRACT_SQL`.

Target session:
`A16BI_TARGET_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.

## Production identity precheck result

Owner-provided production A-16BH authenticated GET result:

- `ok=true`
- `status=PASS_READ_ONLY`
- `authenticatedAuthUserPresent=true`
- `runtimePermissionProfilePresent=true`
- `rpcVisibleProfilePresent=true`
- `auditedSessionOwnerProfilePresent=true`
- `runtimeProfileMatchesRpcVisibleProfile=true`
- `runtimeProfileMatchesAuditedSessionOwner=true`
- `rpcVisibleProfileMatchesAuditedSessionOwner=true`
- `rpcVisibleProfileResult=MATCHED_RUNTIME_PROFILE_AND_SESSION_OWNER`
- `precheckAndImportRpcUseSameClientInstance=false`
- `productionRpcContractStatus=SOURCE_CONTRACT_IDENTIFIED_PRODUCTION_CONTRACT_NOT_READ_NO_SQL`
- `blocker=null`
- `piiPrinted=false`

Classification:
`A16BI_IDENTITY_PRECHECK_RESULT=PASS_READ_ONLY_IDENTITIES_MATCHED_POST_INSTANCE_NOT_OBSERVED`.

## Same-client false root cause

`A16BI_SAME_CLIENT_FALSE_ROOT_CAUSE=GET_DIAGNOSTIC_CANNOT_OBSERVE_FUTURE_POST_PATH_CLIENT_INSTANCE_BOOLEAN_IMPLEMENTED_CORRECTLY`.

The authenticated GET diagnostic route is read-only. It does not call
`POST /official-import`, does not call the import transaction RPC, and therefore
cannot share a live in-memory Supabase client object with a future POST.

The GET diagnostic can prove:

- the authenticated auth user is present;
- the runtime permission profile is present;
- `public.current_profile_id()` is visible through a cookie-bound server client;
- the audited session owner is visible;
- all identity equality booleans match.

It cannot prove:

- that a future POST invocation will reuse the exact same JavaScript client
  object, because no POST/import execution happens in the GET route.

Therefore `precheckAndImportRpcUseSameClientInstance=false` in GET is expected
and correct.

## POST path same-client guarantee

`A16BI_POST_PATH_SAME_CLIENT_GUARANTEE=PASS_SOURCE_GUARANTEE`.

Source trace:

1. `executeOfficialImportRuntimeCandidate()` creates one `sameRunRpcClient` with
   `maybeCreateServerSupabaseClient()`.
2. The same `sameRunRpcClient` is passed into
   `runRpcInvocationIdentityPrecheck()`.
3. The precheck uses that client for:
   - read-only `current_profile_id()`;
   - read-only `import_sessions.created_by` lookup for the audited session.
4. If precheck fails, runtime returns
   `A16BF_BLOCKED_RPC_INVOCATION_IDENTITY_PRECHECK_FAILED`,
   `executorCallCount:0`, and no transaction helper is called.
5. If precheck passes, the same `sameRunRpcClient` object is passed into
   `executeOfficialImportTransactionWithSupabase()`.
6. The transaction helper then calls
   `public.a16p_tx_execute_giapha4_official_import` through that same
   cookie-bound end-user server client.

This preserves fail-closed ownership enforcement. It does not switch execution
to service role and does not pass a caller-controlled profile id to the RPC.

## Production RPC read-only SQL runbook

`A16BI_PRODUCTION_RPC_READ_ONLY_SQL_RUNBOOK=OWNER_METADATA_BOOLEAN_SQL_ONLY`.

Owner should run the following read-only SQL in Supabase SQL Editor and return
only the boolean columns. Do not paste function source, profile ids, auth ids,
names, tokens, cookies, raw JSON or genealogy rows.

```sql
with target_function as (
  select p.oid, p.prosecdef, p.proargnames, p.proargtypes, p.pronargs
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname = 'a16p_tx_execute_giapha4_official_import'
)
select
  exists(select 1 from target_function) as rpc_function_present,
  exists(select 1 from target_function where prosecdef = false) as rpc_security_invoker,
  exists(select 1 from target_function where pronargs = 8) as rpc_arg_count_is_8,
  exists(
    select 1
    from target_function
    where proargnames @> array[
      'p_import_session_id',
      'p_confirm_marker',
      'p_confirm_manifest_hash',
      'p_confirm_review_pack_hash',
      'p_confirm_validation_errors_resolved',
      'p_confirm_rollback_reviewed',
      'p_confirm_audit_reviewed',
      'p_dry_run_only'
    ]
  ) as rpc_expected_arg_names_present,
  exists(
    select 1
    from target_function
    where pg_get_functiondef(oid) like '%v_profile_id uuid := public.current_profile_id();%'
  ) as rpc_uses_current_profile_id,
  exists(
    select 1
    from target_function
    where pg_get_functiondef(oid) like '%created_by = v_profile_id%'
  ) as rpc_uses_created_by_profile_ownership,
  exists(
    select 1
    from target_function
    where pg_get_functiondef(oid) like '%owner_approved_for_db_write%'
  ) as rpc_mentions_owner_approved_for_db_write,
  exists(
    select 1
    from target_function
    where pg_get_functiondef(oid) like '%SESSION_NOT_FOUND_OR_NOT_OWNED%'
  ) as rpc_session_not_found_blocker_present,
  exists(
    select 1
    from target_function
    where obj_description(oid, 'pg_proc') like '%A16V%'
       or pg_get_functiondef(oid) like '%A16V%'
  ) as rpc_has_a16v_marker_or_comment;
```

Repository migration source expects all booleans above to be `true`.

Production contract status:
`A16BI_PRODUCTION_CONTRACT_STATUS=PENDING_OWNER_READ_ONLY_SQL_BOOLEAN_RESULTS`.

## Blocker and next action

Blocker:
`A16BI_BLOCKER=PRODUCTION_RPC_CONTRACT_NOT_VERIFIED_AFTER_IDENTITY_PRECHECK_PASS`.

A-16R retry:
`A16BI_A16R_RETRY_NEXT=NO`.

Next action:
`A16BI_NEXT_ACTION=OWNER_RUN_READ_ONLY_RPC_CONTRACT_SQL_AND_PROVIDE_BOOLEAN_RESULTS_NO_IMPORT`.

## Safety

`A16BI_POST_OFFICIAL_IMPORT_CALLED=NO`.

`A16BI_IMPORT_RPC_CALLED=NO`.

`A16BI_SQL_RUN_BY_CODEX=NO`.

`A16BI_DB_MUTATION_RUN=NO`.

`A16BI_DEPLOY_RUN=NO`.

`A16BI_RAW_PRIVATE_DATA_COMMITTED=NO`.
