# A-16BL - Import Session FOR UPDATE RLS And Lock-visibility Diagnosis

Status:
`A16BL_STATUS=PASS_DIAGNOSED_FOR_UPDATE_RLS_LOCK_VISIBILITY_FIX_CANDIDATE_NOT_APPLIED`.

Target session:
`A16BL_TARGET_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.

Previous production result:
`A16BL_PREVIOUS_POST_RESULT=OFFICIAL_IMPORT_POST_REJECTED_HTTP_409_SESSION_NOT_FOUND_OR_NOT_OWNED`.

A-16R import retry:
`A16R_IMPORT_RETRY_NEXT=NO`.

## Read-only/source diagnosis

Normal authenticated SELECT visibility:
`A16BL_NORMAL_SELECT_VISIBILITY=YES_FROM_A16BH_A16BJ_IDENTITY_AND_SESSION_READ_EVIDENCE`.

FOR UPDATE privilege contract:
`A16BL_FOR_UPDATE_PRIVILEGE_CONTRACT=SELECT_FOR_UPDATE_REQUIRES_SELECT_PLUS_UPDATE_TABLE_PRIVILEGE_AND_UPDATE_RLS_USING_VISIBILITY_FOR_LOCKED_ROW`.

Authenticated SELECT privilege:
`A16BL_AUTHENTICATED_SELECT_PRIVILEGE=PRODUCTION_EFFECTIVE_YES_BY_READ_EVIDENCE_SOURCE_GRANT_NOT_EXPLICIT_IN_REPO_NEEDS_OWNER_METADATA_CONFIRMATION`.

Authenticated UPDATE privilege:
`A16BL_AUTHENTICATED_UPDATE_PRIVILEGE=UNKNOWN_NOT_EXPLICIT_IN_REPO_NEEDS_OWNER_METADATA_CONFIRMATION`.

Applicable SELECT policy:
`A16BL_APPLICABLE_SELECT_POLICY=a16sql_import_sessions_select_own`.

Applicable UPDATE policy:
`A16BL_APPLICABLE_UPDATE_POLICY=a16sql_import_sessions_update_own_preview`.

UPDATE policy state coverage:
`A16BL_IMPORT_SESSION_UPDATE_POLICY_STATE_COVERAGE=PREVIEW_STATES_ONLY_EXCLUDES_OWNER_APPROVED_FOR_DB_WRITE`.

RLS/FOR UPDATE root cause:
`A16BL_RLS_FOR_UPDATE_ROOT_CAUSE=IMPORT_SESSION_OWNER_APPROVED_ROW_VISIBLE_TO_NORMAL_SELECT_BUT_NOT_LOCK_VISIBLE_TO_SECURITY_INVOKER_SELECT_FOR_UPDATE_BECAUSE_UPDATE_RLS_POLICY_EXCLUDES_OWNER_APPROVED_FOR_DB_WRITE`.

Blocker:
`A16BL_BLOCKER=IMPORT_SESSION_FOR_UPDATE_REQUIRES_UPDATE_RLS_POLICY_FOR_OWNER_APPROVED_STATE`.

## Source evidence

RPC lock source:
`A16BL_RPC_LOCK_SOURCE=supabase/migrations/20260703_0016_a16v_official_import_real_transaction_execution_branch_candidate.sql`.

The official import transaction helper is `SECURITY INVOKER`, derives the actor
from `public.current_profile_id()`, and then locks the import session by
session id plus `created_by` equality. The source raises
`SESSION_NOT_FOUND_OR_NOT_OWNED` when the locked read returns no row.

Canonical execution state:
`A16BL_EXECUTION_ELIGIBLE_STATE=owner_approved_for_db_write`.

The existing `import_sessions` SELECT policy allows the owner with
`imports.create` to read the row. The existing `import_sessions` UPDATE policy
is intentionally scoped to preview/review states where `approved_by` and
`approved_at` are still null, so it does not cover the owner-approved official
import state.

## Downstream RPC write RLS risks

Downstream risk summary:
`A16BL_DOWNSTREAM_RPC_WRITE_RLS_RISKS=IMPORT_WRITE_MANIFESTS_LOCK_UPDATE_LIKELY_NEXT_RISK_OFFICIAL_IMPORT_BATCHES_HAVE_A16T_OWNER_POLICIES_REAL_GENEALOGY_INSERT_TABLE_GRANTS_RLS_NEED_METADATA_CONFIRMATION`.

Observed downstream lock/update points:

- `import_write_manifests` is read with `FOR UPDATE`, then updated to
  `write_completed`; source migrations define SELECT and INSERT policies but no
  owner-approved UPDATE policy.
- `official_import_batches` and `official_import_rollback_manifests` have
  A-16T owner-scoped insert/update policies, but effective table grants still
  need production metadata confirmation.
- `people`, `families`, `family_children`, `family_parents`,
  `couple_relationships`, and `revisions` are written by the SECURITY INVOKER
  RPC and may fail later if production grants/RLS do not permit the authenticated
  owner/admin context to insert the required rows.

## Minimum fix candidate

Candidate file:
`A16BL_MINIMUM_FIX_CANDIDATE=scripts/a16bl-import-session-for-update-rls-fix-candidate.sql.draft`.

Candidate status:
`A16BL_FIX_CANDIDATE_STATUS=NOT_APPLIED_DO_NOT_RUN_AUTOMATICALLY_OWNER_REVIEW_REQUIRED`.

Minimum fix candidate:
`A16BL_MINIMUM_FIX=ADD_NARROW_AUTHENTICATED_OWNER_ADMIN_UPDATE_GRANTS_IF_MISSING_AND_RLS_UPDATE_POLICIES_FOR_IMPORT_SESSIONS_OWNER_APPROVED_LOCK_AND_IMPORT_WRITE_MANIFEST_OWNER_APPROVED_LOCK_UPDATE_WITHOUT_REMOVING_FOR_UPDATE_OR_SWITCHING_SECURITY_MODE`.

The candidate preserves fail-closed behavior for unknown, missing, terminal,
already-imported, failed, cancelled, or unexpected states. It does not remove
`FOR UPDATE`, does not switch to service-role execution, and does not make the
RPC `SECURITY DEFINER`.

## Owner SELECT-only metadata runbook

Runbook status:
`A16BL_OWNER_SQL_RUNBOOK_SELECT_ONLY=YES`.

The owner may run these metadata-only queries in Supabase SQL editor or another
approved read-only SQL context. They inspect catalog metadata only; they do not
invoke the import RPC, do not lock production rows, and do not mutate data.

```sql
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename = 'import_sessions'
order by policyname;

select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename = 'import_write_manifests'
order by policyname;

select
  table_schema,
  table_name,
  grantee,
  privilege_type,
  is_grantable
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('import_sessions', 'import_write_manifests')
  and grantee in ('authenticated', 'anon', 'public')
order by table_name, grantee, privilege_type;

select
  'import_sessions' as table_name,
  has_table_privilege('authenticated', 'public.import_sessions', 'SELECT') as authenticated_select,
  has_table_privilege('authenticated', 'public.import_sessions', 'UPDATE') as authenticated_update
union all
select
  'import_write_manifests' as table_name,
  has_table_privilege('authenticated', 'public.import_write_manifests', 'SELECT') as authenticated_select,
  has_table_privilege('authenticated', 'public.import_write_manifests', 'UPDATE') as authenticated_update;

select
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity,
  c.relforcerowsecurity
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('import_sessions', 'import_write_manifests');

select
  n.nspname as schema_name,
  p.proname,
  p.prosecdef as security_definer,
  pg_get_function_arguments(p.oid) as arguments,
  pg_get_functiondef(p.oid) as function_definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'a16p_tx_execute_giapha4_official_import';

select
  routine_schema,
  routine_name,
  grantee,
  privilege_type,
  is_grantable
from information_schema.routine_privileges
where routine_schema = 'public'
  and routine_name = 'a16p_tx_execute_giapha4_official_import'
order by grantee, privilege_type;
```

## Safety

`A16BL_POST_OFFICIAL_IMPORT_CALLED=NO`.

`A16BL_IMPORT_RPC_CALLED=NO`.

`A16BL_DIRECT_MANUAL_RPC_CALLED=NO`.

`A16BL_SQL_RUN_BY_CODEX=NO`.

`A16BL_DB_MUTATION_RUN=NO`.

`A16BL_SESSION_STATE_CHANGED=NO`.

`A16BL_MIGRATION_APPLY_RUN=NO`.

`A16BL_DB_PUSH_RUN=NO`.

`A16BL_MIGRATION_REPAIR_RUN=NO`.

`A16BL_SEED_RUN=NO`.

`A16BL_DEPLOY_RUN=NO`.

`A16BL_AUTH_PERMISSION_GENEALOGY_MUTATION=NO`.

`A16BL_RAW_PRIVATE_DATA_PRINTED_OR_COMMITTED=NO`.

Next action:
`A16BL_NEXT_ACTION=OWNER_RUN_SELECT_ONLY_METADATA_RUNBOOK_THEN_SEPARATE_A16BM_SCHEMA_FIX_APPLY_APPROVAL_IF_CONFIRMED`.
