# A-16BO - Revoke Anonymous Import Staging Grants

Status:
`A16BO_STATUS=CANDIDATE_READY_NOT_APPLIED_OWNER_REVIEW_REQUIRED`.

A-16R retry:
`A16R_IMPORT_RETRY_NEXT=NO`.

Migration 0018 immutable check:
`A16BO_MIGRATION_0018_IMMUTABLE_SHA256=7D62C16E201D452FD73B4E06C8F140361873C0C054A876EDDBFF28DD55FACC42`.

Production evidence:
`A16BO_FORBIDDEN_ANON_GRANT_STATUS=CONFIRMED_14_PENDING_REVOKE`.

A-16BM policies:
`A16BO_A16BM_POLICIES_SEMANTIC_STATUS=PASS_PRODUCTION_METADATA_CONFIRMED`.

## Candidate artifacts

Migration candidate:
`A16BO_MIGRATION_0019=db/migrations/20260711_0019_a16bo_revoke_anon_import_staging_grants.sql`.

Supabase mirror:
`A16BO_SUPABASE_MIRROR=supabase/migrations/20260711_0019_a16bo_revoke_anon_import_staging_grants.sql`.

Mirror status:
`A16BO_MIRROR_MATCH=BYTE_FOR_BYTE_REQUIRED_BY_CHECKER`.

Verification SQL:
`A16BO_VERIFICATION_SQL=db/checks/20260711_check_a16bo_revoke_anon_import_staging_grants_and_policy_scope.sql`.

## Revoke scope

Anon revoke scope:
`A16BO_ANON_REVOKE_SCOPE=REVOKE_ALL_PRIVILEGES_ON_IMPORT_SESSIONS_AND_IMPORT_WRITE_MANIFESTS_FROM_ANON`.

PUBLIC revoke scope:
`A16BO_PUBLIC_REVOKE_SCOPE=REVOKE_ALL_PRIVILEGES_ON_IMPORT_SESSIONS_AND_IMPORT_WRITE_MANIFESTS_FROM_PUBLIC`.

Authenticated grants preserved:
`A16BO_AUTHENTICATED_GRANTS_PRESERVED=SELECT_UPDATE_ON_IMPORT_SESSIONS_AND_IMPORT_WRITE_MANIFESTS`.

Policies unchanged:
`A16BO_POLICIES_UNCHANGED=YES_NO_ALTER_DROP_CREATE_POLICY`.

RLS unchanged:
`A16BO_RLS_UNCHANGED=YES`.

Real genealogy tables:
`A16BO_REAL_GENEALOGY_TABLES_TOUCHED=NO`.

## Verification normalization

Policy verification normalization:
`A16BO_POLICY_VERIFICATION_NORMALIZATION=PG_POLICIES_DEPARSE_TOLERANT_NO_PUBLIC_PREFIX_NO_IN_TEXT_DEPENDENCY`.

The verification SQL normalizes whitespace, case and simple casts before
checking policy semantics. It does not require `public.` prefixes, and it does
not depend on `IN (...)` staying textually unchanged after PostgreSQL deparsing.

Final boolean:
`A16BO_FINAL_VERIFY_BOOLEAN=a16bo_revoke_anon_import_staging_grants_verified`.

The final boolean requires:

- `forbidden_anon_public_table_grant_count = 0`
- `forbidden_anon_public_policy_count = 0`
- authenticated SELECT/UPDATE still present on both import staging tables
- both A-16BM policies still present
- session and manifest policy semantics pass normalized checks
- RPC remains SECURITY INVOKER
- no automatic import trigger exists

## Blocker

Blocker:
`A16BO_BLOCKER=OWNER_REVIEW_AND_MANUAL_APPLY_VERIFY_REQUIRED_BEFORE_ANY_SEPARATE_RETRY`.

Next owner action:
`A16BO_NEXT_OWNER_ACTION=REVIEW_CANDIDATE_THEN_SEPARATE_SQL_APPLY_VERIFY_PHASE_NO_IMPORT_RETRY`.

## Safety

`A16BO_SQL_RUN_BY_CODEX=NO`.

`A16BO_MIGRATION_APPLY_RUN=NO`.

`A16BO_DB_PUSH_RUN=NO`.

`A16BO_MIGRATION_REPAIR_RUN=NO`.

`A16BO_POST_OFFICIAL_IMPORT_CALLED=NO`.

`A16BO_IMPORT_RPC_CALLED=NO`.

`A16BO_SESSION_STATE_CHANGED=NO`.

`A16BO_REAL_GENEALOGY_WRITE=NO`.

`A16BO_DEPLOY_RUN=NO`.
