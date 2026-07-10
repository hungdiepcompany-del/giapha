# A-16BE - Official Import RPC Session Ownership Contract Diagnosis

## Status

`A16BE_STATUS=DIAGNOSED_READ_ONLY_OWNERSHIP_METADATA_PASS_RPC_CONTEXT_BLOCKED`

`A16BE_TARGET_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68`

`A16BE_PRODUCTION_POST_RESULT=HTTP_409_BLOCKED`

`A16BE_PRODUCTION_RPC_BLOCKER=A16AH_BLOCKED_TRANSACTION_RPC_FAILED_SESSION_NOT_FOUND_OR_NOT_OWNED`

`A16BE_STORED_SESSION_STATE_BEFORE_POST=owner_approved_for_db_write`

`A16R_IMPORT_RETRY_NEXT=NO`

## Read-only Ownership Diagnostic

Verifier:

`verify:a16be-session-ownership-contract`

The verifier reads sanitized ownership metadata only. It does not print names,
raw JSON, row payloads, tokens, secret values, genealogy rows, or source file
contents.

`A16BE_READ_ONLY_VERIFIER_MARKER=A16BE_SESSION_OWNERSHIP_CONTRACT_READ_ONLY`

`A16BE_READ_ONLY_VERIFIER_STATUS=PASS_READ_ONLY_SANITIZED_OWNERSHIP_METADATA`

`A16BE_SESSION_CREATED_BY_IDENTIFIER_TYPE=CURRENT_OWNER_PROFILE_ID`

`A16BE_SESSION_UPDATED_BY_IDENTIFIER_TYPE=CURRENT_OWNER_PROFILE_ID`

`A16BE_SESSION_APPROVED_BY_IDENTIFIER_TYPE=CURRENT_OWNER_PROFILE_ID`

`A16BE_SESSION_OWNED_BY_CURRENT_PROFILE=YES`

`A16BE_CURRENT_OWNER_PROFILE_MATCHES_PROVIDED=YES`

Therefore the known production failure is not explained by the audited session
being owned by a different historical importer profile, by a missing
`created_by`, or by `created_by` containing the auth user id instead of a
profile id.

## RPC Ownership Contract

RPC/helper:

`public.a16p_tx_execute_giapha4_official_import`

The source lookup that can raise `SESSION_NOT_FOUND_OR_NOT_OWNED` is:

`A16BE_RPC_LOOKUP=import_sessions.id = p_import_session_id AND import_sessions.created_by = public.current_profile_id()`

The ownership field is:

`A16BE_SESSION_OWNER_FIELD=import_sessions.created_by`

The owner field type is:

`A16BE_SESSION_OWNER_FIELD_TYPE=profiles.id`

The RPC identity source is:

`A16BE_RPC_EXPECTED_IDENTIFIER_TYPE=PROFILE_ID_FROM_PUBLIC_CURRENT_PROFILE_ID_SECURITY_INVOKER`

`public.current_profile_id()` resolves `profiles.id` by `profiles.auth_user_id = auth.uid()`.

The route/runtime identity source is:

`A16BE_RUNTIME_IDENTIFIER_TYPE=PROFILE_ID_FROM_PERMISSION_CONTEXT_ADMIN_LOOKUP`

The runtime executor input includes an `actorProfileId`, but the current RPC
signature does not accept an actor profile id parameter. The RPC independently
derives the actor from the Supabase invoker auth context.

`A16BE_RUNTIME_ACTOR_PROFILE_ID_PASSED_TO_RPC=NO`

`A16BE_RPC_ACCEPTS_ACTOR_PROFILE_ID_PARAMETER=NO`

## Contract Mismatch

`A16BE_EXACT_CONTRACT_MISMATCH=NO_STORED_SESSION_OWNER_MISMATCH_BUT_RUNTIME_ADMIN_PERMISSION_CONTEXT_AND_RPC_INVOKER_AUTH_CONTEXT_NOT_PROVEN_IDENTICAL_IN_SAME_RUN`

The UI/runtime permission gate passed because the server route resolved the
current owner/admin context through application code and admin-backed profile,
role and permission reads.

The transaction RPC is `SECURITY INVOKER` and performs its own ownership proof
inside PostgreSQL using the Supabase request JWT. That proof is independent of
the application-level `PermissionContext` proof. A UI owner/admin PASS therefore
does not prove that the RPC invoker context resolves to the same `profiles.id`
unless the route verifies that exact contract before calling the RPC or the RPC
accepts and validates an explicit actor profile contract.

`A16BE_RLS_PARTICIPATES=YES_VIA_SECURITY_INVOKER_AND_OWNER_SCOPED_POLICIES`

`A16BE_SECURITY_DEFINER_HELPERS_PARTICIPATE=YES_CURRENT_PROFILE_ID_AND_HAS_PERMISSION`

`A16BE_PRODUCTION_RPC_VERSION_DRIFT=UNKNOWN_NOT_READ_FROM_DATABASE_FUNCTION_DEFINITION_IN_THIS_PHASE`

## Blocker

`A16BE_BLOCKER=A16BE_BLOCKED_RPC_INVOKER_AUTH_CONTEXT_OR_PRODUCTION_RPC_CONTRACT_DRIFT_SESSION_NOT_FOUND_OR_NOT_OWNED`

The minimum safe conclusion is:

- session ownership metadata is correct for the current owner profile;
- runtime same-run gate can reach the helper;
- the helper's independent invoker-context ownership lookup still fails in
  production;
- the next phase must align or prove the RPC invocation identity contract before
  any further official import attempt.

## Minimum Fail-closed Fix Candidate

`A16BE_MINIMUM_FAIL_CLOSED_FIX_CANDIDATE=A16BF_RPC_INVOCATION_IDENTITY_CONTRACT_PRECHECK_AND_RPC_CONTRACT_ALIGNMENT`

A safe A-16BF candidate should:

- add a pre-RPC same-run identity contract check that proves the Supabase RPC
  invoker `public.current_profile_id()` equals the runtime
  `PermissionContext.profile.id`;
- or add a new RPC contract parameter such as `p_actor_profile_id` and require
  it to equal both `public.current_profile_id()` and
  `import_sessions.created_by`;
- keep `import_sessions.created_by = public.current_profile_id()` or a stricter
  equivalent;
- fail closed if the auth context is missing, mismatched, stale, anonymous,
  service-role-only, or not the audited owner profile;
- verify the production-applied function contract before another POST;
- not weaken ownership checks merely to allow import.

## Safety

`A16BE_POST_OFFICIAL_IMPORT_CALLED=NO_IN_THIS_PHASE`

`A16BE_A16R_IMPORT_RETRY_EXECUTED=NO`

`A16BE_IMPORT_RPC_EXECUTED=NO_IN_THIS_PHASE`

`A16BE_DIRECT_MANUAL_RPC_CALLED=NO`

`A16BE_SESSION_STATE_CHANGED=NO`

`A16BE_SQL_RUN=NO`

`A16BE_DB_MUTATION_RUN=NO`

`A16BE_MIGRATION_REPAIR_RUN=NO`

`A16BE_SEED_RUN=NO`

`A16BE_DB_PUSH_RUN=NO`

`A16BE_DEPLOY_RUN=NO`

`A16BE_AUTH_ROLE_PERMISSION_MEMBERSHIP_MUTATION=NO`

`A16BE_GENEALOGY_MUTATION_RUN=NO`

`A16BE_RAW_PRIVATE_DATA_COMMITTED=NO`

## Next Action

`A16BE_NEXT_ACTION=A16BF_RPC_INVOCATION_IDENTITY_CONTRACT_PRECHECK_NO_IMPORT_NO_DEPLOY`

Do not retry A-16R import until A-16BF proves the RPC invoker identity contract
in the same run and preserves the owner-scoped session lookup.
