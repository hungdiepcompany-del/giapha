# A-16BF - Same-run RPC invocation identity precheck and contract alignment candidate

Status:
`A16BF_STATUS=PASS_SOURCE_CANDIDATE_NOT_EXECUTED_NOT_DEPLOYED`.

Target session:
`A16BF_TARGET_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.

Previous blocker:
`A16BE_BLOCKER=A16BE_BLOCKED_RPC_INVOKER_AUTH_CONTEXT_OR_PRODUCTION_RPC_CONTRACT_DRIFT_SESSION_NOT_FOUND_OR_NOT_OWNED`.

## Contract tracing

Permission client auth context:
`A16BF_PERMISSION_CLIENT_AUTH_CONTEXT=END_USER_SERVER_COOKIES_PLUS_ADMIN_PROFILE_PERMISSION_READS`.

- `getPermissionContext()` resolves the authenticated user through the
  cookie-bound server Supabase client.
- The same permission context reads profile, role and permission rows through
  the admin/service client.
- That mixed context proves application permissions, but it does not by itself
  prove what `SECURITY INVOKER` RPCs see through `auth.uid()`.

RPC client auth context:
`A16BF_RPC_CLIENT_AUTH_CONTEXT=END_USER_SERVER_COOKIES_ANON_KEY_SECURITY_INVOKER`.

- The official import transaction helper uses `maybeCreateServerSupabaseClient()`.
- The transaction helper calls
  `public.a16p_tx_execute_giapha4_official_import` as an authenticated end-user
  server client, not as an unrestricted service-role import executor.
- The RPC still derives ownership through `public.current_profile_id()`.

RPC expected identifier type:
`A16BF_RPC_EXPECTED_IDENTIFIER_TYPE=PROFILE_ID_FROM_PUBLIC_CURRENT_PROFILE_ID_SECURITY_INVOKER`.

Runtime identifier type:
`A16BF_RUNTIME_IDENTIFIER_TYPE=PROFILE_ID_FROM_PERMISSION_CONTEXT_ADMIN_LOOKUP`.

Session owner identifier type:
`A16BF_SESSION_OWNER_IDENTIFIER_TYPE=CURRENT_OWNER_PROFILE_ID`.

Production RPC contract status:
`A16BF_PRODUCTION_RPC_CONTRACT_STATUS=SOURCE_CONTRACT_IDENTIFIED_PRODUCTION_CONTRACT_NOT_READ_NO_SQL`.

Codex did not run SQL and did not read production function DDL from the
database in this phase. The source contract remains the repository migration
definition that sets `v_profile_id := public.current_profile_id()` and looks up
`import_sessions.created_by = v_profile_id`.

## Source candidate

Exact fix candidate:
`A16BF_EXACT_FIX_CANDIDATE=SAME_RUN_RPC_IDENTITY_PRECHECK_BEFORE_IMPORT_TRANSACTION_RPC`.

The runtime now adds a server-only A-16BF identity precheck immediately before
the official import transaction executor can be called.

The precheck uses the same cookie-bound server Supabase client intended for the
transaction RPC and verifies only sanitized booleans:

- authenticated auth user exists;
- runtime permission profile is present;
- RPC-visible `current_profile_id()` is present;
- audited session owner profile is present;
- runtime permission profile matches RPC-visible profile;
- runtime permission profile matches audited session owner;
- RPC-visible profile matches audited session owner.

If any identity check is missing, mismatched or unreadable, the runtime blocks
with:
`A16BF_BLOCKED_RPC_INVOCATION_IDENTITY_PRECHECK_FAILED`.

The precheck does not return or print auth tokens, cookies, names, raw JSON,
profile IDs or genealogy rows. It returns only equality booleans, identifier
types and sanitized status markers.

## Safety result

RPC-visible profile result:
`A16BF_RPC_VISIBLE_PROFILE_RESULT=SOURCE_PRECHECK_ADDED_NOT_EXECUTED_IN_THIS_PHASE`.

Import execution:
`A16BF_POST_OFFICIAL_IMPORT_CALLED=NO`.

`A16BF_IMPORT_RPC_EXECUTED=NO`.

`A16BF_DIRECT_MANUAL_RPC_CALLED=NO`.

`A16BF_SQL_RUN=NO`.

`A16BF_DB_MUTATION_RUN=NO`.

`A16BF_SESSION_STATE_MUTATION_RUN=NO`.

`A16BF_DEPLOY_RUN=NO`.

`A16BF_RAW_PRIVATE_DATA_PRINTED_OR_COMMITTED=NO`.

A-16R import retry remains:
`A16R_IMPORT_RETRY_NEXT=NO`.

## Next action

`A16BF_NEXT_ACTION=A16BG_DEPLOY_AND_AUTHENTICATED_IDENTITY_PRECHECK_SMOKE_NO_IMPORT`.

The next phase should deploy the source candidate through the approved
GitHub Actions path, then run an authenticated owner/admin read-only smoke that
checks the sanitized A-16BF precheck output. It still must not run import unless
a later phase separately authorizes one final POST and all same-run gates pass.
