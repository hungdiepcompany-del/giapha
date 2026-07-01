-- A-16P-TX - Official Import Transaction Helper / RPC Schema Readiness
-- SQL_CANDIDATE_STATUS=NOT_APPLIED
-- DO_NOT_RUN_AUTOMATICALLY
-- OWNER_MANUAL_REVIEW_REQUIRED
-- DO_NOT_RUN_SUPABASE_DB_PUSH
-- DO_NOT_RUN_SUPABASE_DB_PUSH_DRY_RUN_IN_THIS_PHASE
-- DO_NOT_RUN_SUPABASE_MIGRATION_REPAIR
-- NO_SEED_DATA
-- NO_REAL_GENEALOGY_WRITE
-- NO_PEOPLE_RELATIONSHIP_FAMILY_LAYOUT_REVISION_WRITE
-- NO_OFFICIAL_IMPORT_EXECUTION
-- NO_ANON_OR_PUBLIC_GRANT
-- NO_RLS_DISABLE
-- A16P_BLOCKED_TRANSACTION_HELPER_MISSING is resolved only as a reviewed
-- RPC contract candidate in this phase. The function below is deliberately
-- fail-closed and returns blockers until owner manually applies and verifies a
-- later approved SQL phase.

create or replace function public.a16p_tx_execute_giapha4_official_import(
  p_import_session_id uuid,
  p_confirm_marker text,
  p_confirm_manifest_hash text default null,
  p_confirm_review_pack_hash text default null,
  p_confirm_validation_errors_resolved boolean default false,
  p_confirm_rollback_reviewed boolean default false,
  p_confirm_audit_reviewed boolean default false,
  p_dry_run_only boolean default true
)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_profile_id uuid := public.current_profile_id();
  v_session public.import_sessions%rowtype;
  v_blocked_reasons text[] := array[
    'A16P_TX_CANDIDATE_NOT_APPLIED_FOR_EXECUTION',
    'A16P_TX_AUDIT_OR_ROLLBACK_PERSISTENCE_MISSING',
    'A16P_TX_SCHEMA_INSUFFICIENT_FOR_SAFE_TRANSACTION'
  ];
  v_warning_count integer := 0;
  v_duplicate_unresolved_count integer := 0;
  v_relationship_unresolved_count integer := 0;
  v_people_candidate_count integer := 0;
  v_relationship_candidate_count integer := 0;
begin
  -- Fail closed: A-16P-TX is a candidate/readiness phase. This RPC must not
  -- mutate people, families, relationships, layouts, revisions, profiles, or
  -- import staging rows until a later apply/verify/execution phase is approved.
  if p_import_session_id is null then
    v_blocked_reasons := array_append(v_blocked_reasons, 'SESSION_ID_REQUIRED');
  end if;

  if v_profile_id is null then
    v_blocked_reasons := array_append(v_blocked_reasons, 'AUTHENTICATED_PROFILE_REQUIRED');
  end if;

  if p_confirm_marker is distinct from 'APPROVE_A16Q_OFFICIAL_IMPORT_SESSION_EXECUTION' then
    v_blocked_reasons := array_append(v_blocked_reasons, 'FUTURE_EXECUTION_MARKER_REQUIRED');
  end if;

  if not p_confirm_validation_errors_resolved then
    v_blocked_reasons := array_append(v_blocked_reasons, 'VALIDATION_ERRORS_NOT_CONFIRMED_RESOLVED');
  end if;

  if not p_confirm_rollback_reviewed then
    v_blocked_reasons := array_append(v_blocked_reasons, 'ROLLBACK_REVIEW_NOT_CONFIRMED');
  end if;

  if not p_confirm_audit_reviewed then
    v_blocked_reasons := array_append(v_blocked_reasons, 'AUDIT_REVIEW_NOT_CONFIRMED');
  end if;

  if not public.has_permission('imports.create') then
    v_blocked_reasons := array_append(v_blocked_reasons, 'IMPORTS_CREATE_PERMISSION_REQUIRED');
  end if;

  if not public.has_permission('people.create') then
    v_blocked_reasons := array_append(v_blocked_reasons, 'PEOPLE_CREATE_PERMISSION_REQUIRED');
  end if;

  if not public.has_permission('relationships.create') then
    v_blocked_reasons := array_append(v_blocked_reasons, 'RELATIONSHIPS_CREATE_PERMISSION_REQUIRED');
  end if;

  if not public.has_permission('permissions.manage') then
    v_blocked_reasons := array_append(v_blocked_reasons, 'PERMISSIONS_MANAGE_REQUIRED_FOR_A16P_TX_CANDIDATE');
  end if;

  if p_import_session_id is not null then
    select *
    into v_session
    from public.import_sessions
    where id = p_import_session_id
      and created_by = v_profile_id;

    if not found then
      v_blocked_reasons := array_append(v_blocked_reasons, 'SESSION_NOT_FOUND_OR_NOT_OWNED');
    else
      if v_session.status in (
        'write_started',
        'write_completed',
        'rollback_required',
        'rolled_back',
        'expired_preview'
      ) then
        v_blocked_reasons := array_append(v_blocked_reasons, 'SESSION_ALREADY_IMPORTED_OR_CLOSED');
      end if;

      if p_confirm_manifest_hash is not null
        and v_session.preview_manifest_hash is distinct from p_confirm_manifest_hash then
        v_blocked_reasons := array_append(v_blocked_reasons, 'MANIFEST_HASH_MISMATCH');
      end if;

      select count(*)
      into v_warning_count
      from public.import_session_warnings
      where import_session_id = p_import_session_id
        and severity = 'blocker'
        and review_status not in ('resolved', 'acknowledged');

      if v_warning_count > 0 then
        v_blocked_reasons := array_append(v_blocked_reasons, 'VALIDATION_OR_PARSER_BLOCKERS_REMAIN');
      end if;

      select count(*)
      into v_duplicate_unresolved_count
      from public.import_duplicate_candidates
      where import_session_id = p_import_session_id
        and owner_decision = 'unresolved';

      if v_duplicate_unresolved_count > 0 then
        v_blocked_reasons := array_append(v_blocked_reasons, 'DUPLICATE_CANDIDATES_UNRESOLVED');
      end if;

      select count(*)
      into v_relationship_unresolved_count
      from public.import_relationship_candidates
      where import_session_id = p_import_session_id
        and relationship_type = 'parent_child'
        and (
          owner_decision = 'unresolved'
          or ambiguity_status <> 'clear'
          or source_person_fingerprint = related_person_fingerprint
          or related_person_fingerprint is null
        );

      if v_relationship_unresolved_count > 0 then
        v_blocked_reasons := array_append(v_blocked_reasons, 'RELATIONSHIP_CANDIDATES_UNRESOLVED');
      end if;

      select coalesce(sum(jsonb_array_length(approved_scope -> 'person_candidates')), 0)
      into v_people_candidate_count
      from public.import_write_manifests
      where import_session_id = p_import_session_id
        and jsonb_typeof(approved_scope -> 'person_candidates') = 'array';

      select count(*)
      into v_relationship_candidate_count
      from public.import_relationship_candidates
      where import_session_id = p_import_session_id
        and relationship_type = 'parent_child'
        and owner_decision in ('create_relationship', 'link_existing')
        and ambiguity_status = 'clear';
    end if;
  end if;

  if p_confirm_review_pack_hash is not null then
    v_blocked_reasons := array_append(v_blocked_reasons, 'REVIEW_PACK_HASH_RECORDED_NOT_ENFORCED_BY_SCHEMA');
  end if;

  if p_dry_run_only is false then
    v_blocked_reasons := array_append(v_blocked_reasons, 'REAL_EXECUTION_BRANCH_NOT_OPEN_IN_A16P_TX');
  end if;

  return jsonb_build_object(
    'ok', false,
    'status', 'BLOCKED',
    'import_session_id', p_import_session_id,
    'can_run_official_import', false,
    'blocked_reasons', to_jsonb(v_blocked_reasons),
    'would_create_people_count', coalesce(v_people_candidate_count, 0),
    'would_create_relationship_count', coalesce(v_relationship_candidate_count, 0),
    'created_people_count', 0,
    'created_relationship_count', 0,
    'rollback_manifest_preview', jsonb_build_object(
      'available', false,
      'status', 'BLOCKED',
      'blocker', 'A16P_TX_AUDIT_OR_ROLLBACK_PERSISTENCE_MISSING',
      'created_people_ids', jsonb_build_array(),
      'created_relationship_ids', jsonb_build_array(),
      'instructions', 'Candidate only. No rollback manifest is persisted in A-16P-TX.'
    ),
    'audit_manifest_preview', jsonb_build_object(
      'available', false,
      'status', 'BLOCKED',
      'blocker', 'A16P_TX_AUDIT_TABLE_OR_SERVICE_MISSING',
      'reason', 'Gia Pha 4 official import candidate only. No audit write in A-16P-TX.'
    ),
    'pii_printed', false
  );
end;
$$;

comment on function public.a16p_tx_execute_giapha4_official_import(
  uuid,
  text,
  text,
  text,
  boolean,
  boolean,
  boolean,
  boolean
) is
  'A-16P-TX candidate only. SQL_CANDIDATE_STATUS=NOT_APPLIED. DO_NOT_RUN_AUTOMATICALLY. OWNER_MANUAL_REVIEW_REQUIRED. Fail-closed transaction helper contract for Gia Pha 4 official import; no real genealogy mutation branch is open in A-16P-TX.';

revoke execute on function public.a16p_tx_execute_giapha4_official_import(
  uuid,
  text,
  text,
  text,
  boolean,
  boolean,
  boolean,
  boolean
) from public;

revoke execute on function public.a16p_tx_execute_giapha4_official_import(
  uuid,
  text,
  text,
  text,
  boolean,
  boolean,
  boolean,
  boolean
) from anon;
