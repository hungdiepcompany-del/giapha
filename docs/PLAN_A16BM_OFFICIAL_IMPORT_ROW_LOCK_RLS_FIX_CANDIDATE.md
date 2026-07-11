# A-16BM - Official Import Row-lock RLS Fix Candidate

Status:
`A16BM_STATUS=CANDIDATE_READY_NOT_APPLIED_OWNER_REVIEW_REQUIRED`.

Root cause:
`A16BM_ROOT_CAUSE=CONFIRMED_BY_OWNER_SELECT_ONLY_METADATA`.

A-16R retry:
`A16BM_A16R_RETRY_NEXT=NO`.

Target session:
`A16BM_TARGET_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.

## Confirmed production evidence

`A16BM_IMPORT_SESSIONS_UPDATE_POLICY_EXISTS=true`.

`A16BM_IMPORT_SESSIONS_UPDATE_POLICY_ALLOWS_OWNER_APPROVED_STATE=false`.

`A16BM_IMPORT_WRITE_MANIFESTS_UPDATE_POLICY_EXISTS=false`.

Previous owner-approved POST:
`A16BM_PREVIOUS_POST_RESULT=HTTP_409_BLOCKED_SESSION_NOT_FOUND_OR_NOT_OWNED_BEFORE_IMPORT_COMPLETION`.

Transaction helper reached:
`A16BM_TRANSACTION_HELPER_REACHED_ONCE=YES`.

Imported people count:
`A16BM_IMPORTED_PEOPLE_COUNT=0`.

## Candidate artifacts

Migration candidate:
`A16BM_MIGRATION_CANDIDATE=db/migrations/20260711_0018_a16bm_official_import_row_lock_rls_fix_candidate.sql`.

Supabase mirror:
`A16BM_SUPABASE_MIRROR=supabase/migrations/20260711_0018_a16bm_official_import_row_lock_rls_fix_candidate.sql`.

Mirror status:
`A16BM_MIRROR_MATCH=BYTE_FOR_BYTE_REQUIRED_BY_CHECKER`.

Verification SQL:
`A16BM_VERIFICATION_SQL=db/checks/20260711_check_a16bm_official_import_row_lock_rls_fix.sql`.

Candidate status:
`A16BM_SQL_CANDIDATE_STATUS=NOT_APPLIED_DO_NOT_RUN_AUTOMATICALLY_OWNER_REVIEW_REQUIRED`.

## RPC contract review

RPC source:
`A16BM_RPC_SOURCE=supabase/migrations/20260703_0016_a16v_official_import_real_transaction_execution_branch_candidate.sql`.

SELECT FOR UPDATE tables:
`A16BM_RPC_FOR_UPDATE_TABLES=import_sessions,official_import_batches,import_write_manifests`.

UPDATE targets:
`A16BM_RPC_UPDATE_TARGETS=official_import_batches,import_write_manifests,import_sessions`.

Success session status written:
`A16BM_RPC_IMPORT_SESSIONS_SUCCESS_STATUS=write_completed`.

Success write manifest status written:
`A16BM_RPC_IMPORT_WRITE_MANIFESTS_SUCCESS_STATUS=write_completed`.

Official import batch states written:
`A16BM_RPC_OFFICIAL_IMPORT_BATCH_STATUSES_WRITTEN=pending,running,completed`.

Official import batch/rollback policy review:
`A16BM_A16T_AUDIT_ROLLBACK_POLICY_REVIEW=OWNER_SCOPED_POLICIES_PRESENT_EFFECTIVE_GRANTS_STILL_OWNER_VERIFY`.

Real genealogy insert RLS review:
`A16BM_REAL_GENEALOGY_INSERT_RLS_REVIEW=INDEPENDENT_DOWNSTREAM_GRANT_RLS_RISK_NOT_CHANGED_IN_A16BM`.

## Policy scope

Import sessions policy:
`A16BM_IMPORT_SESSIONS_POLICY=a16bm_import_sessions_update_official_import_owner_lock`.

Import sessions policy scope:
`A16BM_IMPORT_SESSIONS_POLICY_SCOPE=AUTHENTICATED_IMPORTS_CREATE_OWNER_PROFILE_APPROVED_ROW_OWNER_APPROVED_FOR_DB_WRITE_TO_WRITE_COMPLETED_ONLY`.

The policy is additive. It does not remove or replace
`a16sql_import_sessions_update_own_preview`. It permits row-lock visibility for
the owner-approved official-import row and permits the exact RPC success update
to `write_completed`.

Import write manifests policy:
`A16BM_IMPORT_WRITE_MANIFESTS_POLICY=a16bm_import_write_manifests_update_official_import_owner_lock`.

Import write manifests policy scope:
`A16BM_IMPORT_WRITE_MANIFESTS_POLICY_SCOPE=AUTHENTICATED_IMPORTS_CREATE_PARENT_SESSION_OWNER_SCOPED_OWNER_APPROVED_OR_READY_FOR_APPLY_TO_WRITE_COMPLETED_ONLY`.

The manifest policy is additive. It verifies ownership through the parent
`import_sessions` row and permits the exact RPC success update to
`write_completed`.

Grant scope:
`A16BM_GRANT_SCOPE=GRANT_SELECT_UPDATE_TO_AUTHENTICATED_ON_IMPORT_SESSIONS_AND_IMPORT_WRITE_MANIFESTS_ONLY`.

Grant verification hardening:
`A16BM_FIX_PUBLIC_GRANT_CHECK=LOWER_GRANTEE_MATCHES_ANON_PUBLIC`.

Forbidden grant count check:
`A16BM_FIX_FORBIDDEN_GRANT_COUNT_CHECK=forbidden_anon_public_table_grant_count_EQUALS_0`.

Forbidden policy count check:
`A16BM_FIX_FORBIDDEN_POLICY_COUNT_CHECK=forbidden_anon_public_policy_count_EQUALS_0`.

Policy comment metadata:
`A16BM_FIX_POLICY_COMMENT_STATUS=APPLIED_METADATA_COMMENTS_DO_NOT_SAY_NOT_APPLIED`.

RPC update order:
`A16BM_FIX_RPC_UPDATE_ORDER=MANIFEST_WRITE_COMPLETED_BEFORE_SESSION_WRITE_COMPLETED_PARENT_CHECK_COMPATIBLE`.

Existing policies preserved:
`A16BM_EXISTING_POLICIES_PRESERVED=YES_PREVIEW_STATE_POLICIES_NOT_REMOVED_OR_REPLACED`.

Forbidden grants:
`A16BM_ANON_PUBLIC_GRANTS_ADDED=NO`.

RLS disabled:
`A16BM_RLS_DISABLED=NO`.

Security mode:
`A16BM_RPC_SECURITY_MODE_CHANGE=NO_RPC_REMAINS_SECURITY_INVOKER`.

## Blocker

Blocker:
`A16BM_BLOCKER=OWNER_REVIEW_AND_MANUAL_APPLY_VERIFY_REQUIRED_BEFORE_ANY_SEPARATE_RETRY`.

Next owner action:
`A16BM_NEXT_OWNER_ACTION=REVIEW_CANDIDATE_THEN_SEPARATE_SQL_APPLY_VERIFY_PHASE_IF_APPROVED_NO_IMPORT_RETRY`.

## Safety

`A16BM_POST_OFFICIAL_IMPORT_CALLED=NO`.

`A16BM_IMPORT_RPC_CALLED=NO`.

`A16BM_DIRECT_MANUAL_RPC_CALLED=NO`.

`A16BM_SQL_RUN_BY_CODEX=NO`.

`A16BM_DB_MUTATION_RUN=NO`.

`A16BM_SESSION_STATE_CHANGED=NO`.

`A16BM_MIGRATION_APPLY_RUN=NO`.

`A16BM_DB_PUSH_RUN=NO`.

`A16BM_MIGRATION_REPAIR_RUN=NO`.

`A16BM_SEED_RUN=NO`.

`A16BM_DEPLOY_RUN=NO`.

`A16BM_AUTH_PERMISSION_GENEALOGY_MUTATION=NO`.

`A16BM_RAW_PRIVATE_DATA_PRINTED_OR_COMMITTED=NO`.
