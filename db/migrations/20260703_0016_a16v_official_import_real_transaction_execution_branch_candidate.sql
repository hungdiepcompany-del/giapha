-- A16V_OFFICIAL_IMPORT_REAL_TRANSACTION_EXECUTION_BRANCH_CANDIDATE
-- SQL_CANDIDATE_STATUS=NOT_APPLIED
-- DO_NOT_RUN_AUTOMATICALLY
-- OWNER_MANUAL_REVIEW_REQUIRED
-- DO_NOT_RUN_SUPABASE_DB_PUSH
-- DO_NOT_RUN_SUPABASE_MIGRATION_REPAIR
-- NO_SEED_DATA
-- NO_SQL_EXECUTED_IN_A16V
-- NO_OFFICIAL_IMPORT_EXECUTED_IN_A16V
-- NO_RPC_CALLED_IN_A16V
-- Runtime stays fail-closed until a separate owner manual apply/verify phase.
--
-- Purpose:
-- Upgrade the existing canonical RPC contract into a real all-or-nothing
-- execution branch for Gia Pha 4 official import, backed by:
-- - official_import_batches idempotency guard on import_session_id;
-- - official_import_rollback_manifests rollback arrays;
-- - revisions audit entries for created records;
-- - no SECURITY DEFINER and no anon/public EXECUTE grant.

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
  v_write_manifest public.import_write_manifests%rowtype;
  v_batch_id uuid;
  v_existing_batch public.official_import_batches%rowtype;
  v_manifest_hash text;
  v_person_candidate_count integer := 0;
  v_parent_child_candidate_count integer := 0;
  v_created_people_count integer := 0;
  v_created_family_count integer := 0;
  v_created_family_parent_count integer := 0;
  v_created_family_child_count integer := 0;
  v_created_relationship_count integer := 0;
  v_created_revision_count integer := 0;
  v_blocker_count integer := 0;
  v_duplicate_blocker_count integer := 0;
  v_relationship_blocker_count integer := 0;
  v_skipped_relationship_count integer := 0;
  v_created_people_ids uuid[] := array[]::uuid[];
  v_created_family_ids uuid[] := array[]::uuid[];
  v_created_family_parent_ids uuid[] := array[]::uuid[];
  v_created_family_child_ids uuid[] := array[]::uuid[];
  v_created_revision_ids uuid[] := array[]::uuid[];
  v_marker constant text :=
    'APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68';
begin
  if p_dry_run_only then
    return jsonb_build_object(
      'ok', false,
      'status', 'BLOCKED',
      'blocked_reasons', jsonb_build_array('DRY_RUN_ONLY_TRUE'),
      'can_run_official_import', false,
      'created_people_count', 0,
      'created_relationship_count', 0
    );
  end if;

  if v_profile_id is null then
    raise exception 'AUTHENTICATED_PROFILE_REQUIRED';
  end if;

  if p_import_session_id is null then
    raise exception 'IMPORT_SESSION_ID_REQUIRED';
  end if;

  if p_confirm_marker is distinct from v_marker then
    raise exception 'SESSION_SPECIFIC_A16R_MARKER_REQUIRED';
  end if;

  if not p_confirm_validation_errors_resolved then
    raise exception 'VALIDATION_ERRORS_NOT_CONFIRMED_RESOLVED';
  end if;

  if not p_confirm_rollback_reviewed then
    raise exception 'ROLLBACK_REVIEW_NOT_CONFIRMED';
  end if;

  if not p_confirm_audit_reviewed then
    raise exception 'AUDIT_REVIEW_NOT_CONFIRMED';
  end if;

  if not public.has_permission('imports.create') then
    raise exception 'IMPORTS_CREATE_REQUIRED';
  end if;

  if not public.has_permission('people.create') then
    raise exception 'PEOPLE_CREATE_REQUIRED';
  end if;

  if not public.has_permission('relationships.create') then
    raise exception 'RELATIONSHIPS_CREATE_REQUIRED';
  end if;

  if not public.has_permission('permissions.manage') then
    raise exception 'PERMISSIONS_MANAGE_REQUIRED_FOR_OFFICIAL_IMPORT';
  end if;

  select *
  into v_session
  from public.import_sessions
  where id = p_import_session_id
    and created_by = v_profile_id
  for update;

  if not found then
    raise exception 'SESSION_NOT_FOUND_OR_NOT_OWNED';
  end if;

  if v_session.status not in ('ready_for_owner_approval', 'owner_approved_for_db_write') then
    raise exception 'SESSION_NOT_READY_FOR_OFFICIAL_IMPORT';
  end if;

  if p_confirm_manifest_hash is not null
    and v_session.preview_manifest_hash is distinct from p_confirm_manifest_hash then
    raise exception 'MANIFEST_HASH_MISMATCH';
  end if;

  select *
  into v_existing_batch
  from public.official_import_batches
  where import_session_id = p_import_session_id
  for update;

  if found and v_existing_batch.status = 'completed' then
    return jsonb_build_object(
      'ok', true,
      'status', 'IMPORT_ALREADY_COMPLETED',
      'import_session_id', p_import_session_id,
      'audit_batch_id', v_existing_batch.id,
      'created_people_count', v_existing_batch.created_people_count,
      'created_relationship_count', v_existing_batch.created_relationship_count,
      'idempotent', true,
      'can_run_official_import', false
    );
  end if;

  if found and v_existing_batch.status <> 'voided' then
    raise exception 'IMPORT_BATCH_ALREADY_EXISTS_REVIEW_REQUIRED';
  end if;

  select *
  into v_write_manifest
  from public.import_write_manifests
  where import_session_id = p_import_session_id
    and status in ('owner_approved', 'ready_for_apply')
  order by approved_at desc nulls last, created_at desc
  limit 1
  for update;

  if not found then
    raise exception 'OWNER_APPROVED_WRITE_MANIFEST_REQUIRED';
  end if;

  v_manifest_hash := v_write_manifest.manifest_hash;

  if p_confirm_manifest_hash is not null and v_manifest_hash is distinct from p_confirm_manifest_hash then
    raise exception 'WRITE_MANIFEST_HASH_MISMATCH';
  end if;

  select count(*)
  into v_blocker_count
  from public.import_session_warnings
  where import_session_id = p_import_session_id
    and severity = 'blocker'
    and review_status not in ('resolved', 'acknowledged');

  if v_blocker_count > 0 then
    raise exception 'IMPORT_SESSION_BLOCKER_WARNINGS_REMAIN';
  end if;

  select count(*)
  into v_duplicate_blocker_count
  from public.import_duplicate_candidates
  where import_session_id = p_import_session_id
    and owner_decision in ('unresolved', 'needs_review', 'hold');

  if v_duplicate_blocker_count > 0 then
    raise exception 'DUPLICATE_DECISIONS_REMAIN_UNRESOLVED';
  end if;

  select count(*)
  into v_relationship_blocker_count
  from public.import_relationship_candidates
  where import_session_id = p_import_session_id
    and relationship_type = 'parent_child'
    and (
      ambiguity_status <> 'clear'
      or source_person_fingerprint is null
      or related_person_fingerprint is null
      or source_person_fingerprint = related_person_fingerprint
      or owner_decision in ('hold', 'skip')
    );

  if v_relationship_blocker_count > 0 then
    raise exception 'RELATIONSHIP_CANDIDATES_NOT_SAFE_FOR_IMPORT';
  end if;

  if jsonb_typeof(v_write_manifest.approved_scope -> 'person_candidates') <> 'array' then
    raise exception 'PERSON_CANDIDATES_ARRAY_REQUIRED';
  end if;

  select jsonb_array_length(v_write_manifest.approved_scope -> 'person_candidates')
  into v_person_candidate_count;

  if v_person_candidate_count <= 0 then
    raise exception 'NO_PERSON_CANDIDATES_TO_IMPORT';
  end if;

  select count(*)
  into v_parent_child_candidate_count
  from public.import_relationship_candidates
  where import_session_id = p_import_session_id
    and relationship_type = 'parent_child'
    and ambiguity_status = 'clear'
    and owner_decision in ('unresolved', 'create_relationship', 'link_existing');

  insert into public.official_import_batches (
    import_session_id,
    write_manifest_id,
    actor_profile_id,
    source_type,
    status,
    manifest_hash,
    review_pack_hash,
    expected_people_count,
    expected_relationship_count,
    duplicate_decision_summary,
    validation_summary,
    dry_run_summary,
    idempotency_key,
    import_marker,
    started_at,
    created_by,
    updated_by
  )
  values (
    p_import_session_id,
    v_write_manifest.id,
    v_profile_id,
    'giapha4_xlsx',
    'pending',
    v_manifest_hash,
    p_confirm_review_pack_hash,
    v_person_candidate_count,
    v_parent_child_candidate_count,
    jsonb_build_object(
      'create_new', (
        select count(*)
        from public.import_duplicate_candidates
        where import_session_id = p_import_session_id
          and owner_decision = 'create_new'
      ),
      'link_existing', (
        select count(*)
        from public.import_duplicate_candidates
        where import_session_id = p_import_session_id
          and owner_decision = 'link_existing'
      ),
      'ignore_or_skip', (
        select count(*)
        from public.import_duplicate_candidates
        where import_session_id = p_import_session_id
          and owner_decision in ('ignore_candidate', 'skip')
      )
    ),
    jsonb_build_object('validation_errors', 0, 'confirmed_by_owner', true),
    jsonb_build_object('dry_run_blockers', 0, 'confirmed_by_owner', true),
    p_import_session_id::text,
    p_confirm_marker,
    timezone('utc', now()),
    v_profile_id,
    v_profile_id
  )
  returning id into v_batch_id;

  update public.official_import_batches
  set status = 'running',
      updated_by = v_profile_id,
      updated_at = timezone('utc', now())
  where id = v_batch_id;

  create temporary table a16v_person_map (
    source_person_fingerprint text primary key,
    source_row_index integer not null,
    person_id uuid not null
  ) on commit drop;

  create temporary table a16v_family_map (
    child_fingerprint text primary key,
    child_person_id uuid not null,
    child_source_row_index integer not null,
    family_id uuid not null
  ) on commit drop;

  with candidate_people as (
    select
      gen_random_uuid() as person_id,
      coalesce(nullif(candidate ->> 'fingerprint', ''), candidate ->> 'externalId') as fingerprint,
      nullif(candidate ->> 'fullName', '') as full_name,
      nullif(candidate ->> 'displayName', '') as display_name,
      case
        when candidate ->> 'gender' in ('male', 'female', 'other', 'unknown') then candidate ->> 'gender'
        else 'unknown'
      end as gender,
      nullif(candidate ->> 'birthPlace', '') as birth_place,
      nullif(candidate ->> 'homeTown', '') as home_town,
      nullif(candidate ->> 'branchName', '') as branch_name,
      case
        when candidate ->> 'generationNumber' ~ '^[0-9]+$' then (candidate ->> 'generationNumber')::integer
        else null
      end as generation_number,
      nullif(candidate ->> 'shortBio', '') as short_bio,
      nullif(candidate ->> 'notesPrivate', '') as notes_private,
      case
        when candidate ->> 'visibility' in ('public', 'family', 'private') then candidate ->> 'visibility'
        else 'family'
      end as visibility,
      case
        when candidate ? 'isLiving' then (candidate ->> 'isLiving')::boolean
        else nullif(candidate ->> 'deathDateText', '') is null
      end as is_living,
      case
        when candidate ->> 'sourceRowIndex' ~ '^[0-9]+$' then (candidate ->> 'sourceRowIndex')::integer
        else ordinality::integer
      end as source_row_index
    from jsonb_array_elements(v_write_manifest.approved_scope -> 'person_candidates')
      with ordinality as source(candidate, ordinality)
  ),
  inserted_people as (
    insert into public.people (
      id,
      slug,
      full_name,
      display_name,
      gender,
      birth_date,
      birth_date_precision,
      death_date,
      death_date_precision,
      is_living,
      birth_place,
      home_town,
      branch_name,
      generation_number,
      short_bio,
      notes_private,
      visibility,
      created_by,
      updated_by
    )
    select
      person_id,
      'a16v-giapha4-' || left(person_id::text, 8),
      coalesce(full_name, 'Chưa rõ tên'),
      display_name,
      gender,
      null::date,
      'unknown',
      null::date,
      'unknown',
      is_living,
      birth_place,
      home_town,
      branch_name,
      generation_number,
      short_bio,
      notes_private,
      visibility,
      v_profile_id,
      v_profile_id
    from candidate_people
    where fingerprint is not null
      and full_name is not null
    returning id
  )
  insert into a16v_person_map (source_person_fingerprint, source_row_index, person_id)
  select candidate_people.fingerprint, candidate_people.source_row_index, candidate_people.person_id
  from candidate_people
  join inserted_people on inserted_people.id = candidate_people.person_id;

  get diagnostics v_created_people_count = row_count;

  select coalesce(array_agg(person_id order by source_row_index), array[]::uuid[])
  into v_created_people_ids
  from a16v_person_map;

  with person_revisions as (
    insert into public.revisions (
      entity_type,
      entity_id,
      action,
      before_json,
      after_json,
      changed_by,
      change_reason
    )
    select
      'people',
      person_id,
      'create',
      null,
      jsonb_build_object(
        'source', 'A-16V Gia Pha 4 official import candidate',
        'import_session_id', p_import_session_id,
        'source_row_index', source_row_index
      ),
      v_profile_id,
      'A-16V official import candidate'
    from a16v_person_map
    returning id
  )
  select count(*), coalesce(array_agg(id), array[]::uuid[])
  into v_created_revision_count, v_created_revision_ids
  from person_revisions;

  with clear_children as (
    select
      rel.related_person_fingerprint as child_fingerprint,
      child.person_id as child_person_id,
      child.source_row_index as child_source_row_index,
      gen_random_uuid() as family_id
    from public.import_relationship_candidates rel
    join a16v_person_map child
      on child.source_person_fingerprint = rel.related_person_fingerprint
    where rel.import_session_id = p_import_session_id
      and rel.relationship_type = 'parent_child'
      and rel.ambiguity_status = 'clear'
      and rel.owner_decision in ('unresolved', 'create_relationship', 'link_existing')
    group by rel.related_person_fingerprint, child.person_id, child.source_row_index
  ),
  inserted_families as (
    insert into public.families (
      id,
      family_code,
      family_label,
      visibility,
      notes,
      created_by,
      updated_by
    )
    select
      family_id,
      'a16v-family-' || left(family_id::text, 8),
      'Gia đình nhập từ Gia Phả 4',
      'family',
      'A-16V official import candidate',
      v_profile_id,
      v_profile_id
    from clear_children
    returning id
  )
  insert into a16v_family_map (
    child_fingerprint,
    child_person_id,
    child_source_row_index,
    family_id
  )
  select
    clear_children.child_fingerprint,
    clear_children.child_person_id,
    clear_children.child_source_row_index,
    clear_children.family_id
  from clear_children
  join inserted_families on inserted_families.id = clear_children.family_id;

  get diagnostics v_created_family_count = row_count;

  select coalesce(array_agg(family_id order by child_source_row_index), array[]::uuid[])
  into v_created_family_ids
  from a16v_family_map;

  insert into public.family_children (
    family_id,
    person_id,
    child_relationship_type,
    sort_order,
    notes,
    created_by,
    updated_by
  )
  select
    family_id,
    child_person_id,
    'biological',
    child_source_row_index,
    'A-16V Gia Pha 4 official import candidate',
    v_profile_id,
    v_profile_id
  from a16v_family_map;

  get diagnostics v_created_family_child_count = row_count;

  select coalesce(array_agg(id order by created_at), array[]::uuid[])
  into v_created_family_child_ids
  from public.family_children
  where family_id = any(v_created_family_ids)
    and created_by = v_profile_id;

  insert into public.family_parents (
    family_id,
    person_id,
    parent_role,
    relationship_type,
    sort_order,
    notes,
    created_by,
    updated_by
  )
  select
    fam.family_id,
    parent.person_id,
    case
      when lower(rel.relationship_label_vi) like '%mẹ%' then 'mother'
      when lower(rel.relationship_label_vi) like '%me%' then 'mother'
      when lower(rel.relationship_label_vi) like '%bố%' then 'father'
      when lower(rel.relationship_label_vi) like '%bo%' then 'father'
      when lower(rel.relationship_label_vi) like '%cha%' then 'father'
      else 'unknown'
    end,
    'biological',
    rel.source_row_index,
    'A-16V Gia Pha 4 official import candidate',
    v_profile_id,
    v_profile_id
  from public.import_relationship_candidates rel
  join a16v_person_map parent
    on parent.source_person_fingerprint = rel.source_person_fingerprint
  join a16v_family_map fam
    on fam.child_fingerprint = rel.related_person_fingerprint
  where rel.import_session_id = p_import_session_id
    and rel.relationship_type = 'parent_child'
    and rel.ambiguity_status = 'clear'
    and rel.owner_decision in ('unresolved', 'create_relationship', 'link_existing');

  get diagnostics v_created_family_parent_count = row_count;

  select coalesce(array_agg(id order by created_at), array[]::uuid[])
  into v_created_family_parent_ids
  from public.family_parents
  where family_id = any(v_created_family_ids)
    and created_by = v_profile_id;

  v_created_relationship_count :=
    coalesce(v_created_family_parent_count, 0) + coalesce(v_created_family_child_count, 0);

  select count(*)
  into v_skipped_relationship_count
  from public.import_relationship_candidates
  where import_session_id = p_import_session_id
    and relationship_type <> 'parent_child';

  with family_revisions as (
    insert into public.revisions (
      entity_type,
      entity_id,
      action,
      before_json,
      after_json,
      changed_by,
      change_reason
    )
    select
      'families',
      family_id,
      'create',
      null,
      jsonb_build_object(
        'source', 'A-16V Gia Pha 4 official import candidate',
        'import_session_id', p_import_session_id,
        'child_source_row_index', child_source_row_index
      ),
      v_profile_id,
      'A-16V official import candidate'
    from a16v_family_map
    returning id
  )
  select
    v_created_revision_count + count(*),
    v_created_revision_ids || coalesce(array_agg(id), array[]::uuid[])
  into v_created_revision_count, v_created_revision_ids
  from family_revisions;

  insert into public.official_import_rollback_manifests (
    import_batch_id,
    import_session_id,
    manifest_hash,
    rollback_status,
    rollback_order,
    created_people_ids,
    created_family_ids,
    created_family_parent_ids,
    created_family_child_ids,
    created_couple_relationship_ids,
    created_revision_ids,
    created_layout_ids,
    skipped_candidate_summary,
    blocked_candidate_summary,
    rollback_notes_sanitized,
    created_by,
    updated_by
  )
  values (
    v_batch_id,
    p_import_session_id,
    v_manifest_hash,
    'ready',
    jsonb_build_array(
      'family_parents',
      'family_children',
      'families',
      'revisions',
      'people'
    ),
    coalesce(v_created_people_ids, array[]::uuid[]),
    coalesce(v_created_family_ids, array[]::uuid[]),
    coalesce(v_created_family_parent_ids, array[]::uuid[]),
    coalesce(v_created_family_child_ids, array[]::uuid[]),
    array[]::uuid[],
    coalesce(v_created_revision_ids, array[]::uuid[]),
    array[]::uuid[],
    jsonb_build_object(
      'non_parent_child_relationship_candidates', v_skipped_relationship_count
    ),
    jsonb_build_object(),
    'A-16V rollback manifest candidate. Delete in reverse rollback_order only after owner approval.',
    v_profile_id,
    v_profile_id
  );

  update public.import_write_manifests
  set status = 'write_completed',
      created_record_ids = jsonb_build_object(
        'people', to_jsonb(coalesce(v_created_people_ids, array[]::uuid[])),
        'families', to_jsonb(coalesce(v_created_family_ids, array[]::uuid[])),
        'family_parents', to_jsonb(coalesce(v_created_family_parent_ids, array[]::uuid[])),
        'family_children', to_jsonb(coalesce(v_created_family_child_ids, array[]::uuid[])),
        'revisions', to_jsonb(coalesce(v_created_revision_ids, array[]::uuid[]))
      ),
      completed_at = timezone('utc', now())
  where id = v_write_manifest.id;

  update public.import_sessions
  set status = 'write_completed',
      approval_marker = p_confirm_marker,
      approved_by = v_profile_id,
      approved_at = coalesce(approved_at, timezone('utc', now())),
      updated_by = v_profile_id,
      updated_at = timezone('utc', now())
  where id = p_import_session_id;

  update public.official_import_batches
  set status = 'completed',
      created_people_count = v_created_people_count,
      created_relationship_count = v_created_relationship_count,
      audit_record_count = v_created_revision_count,
      rollback_manifest_count = 1,
      completed_at = timezone('utc', now()),
      updated_by = v_profile_id,
      updated_at = timezone('utc', now())
  where id = v_batch_id;

  return jsonb_build_object(
    'ok', true,
    'status', 'IMPORT_COMPLETED',
    'import_session_id', p_import_session_id,
    'audit_batch_id', v_batch_id,
    'idempotency_key', p_import_session_id::text,
    'created_people_count', v_created_people_count,
    'created_relationship_count', v_created_relationship_count,
    'created_family_count', v_created_family_count,
    'created_revision_count', v_created_revision_count,
    'rollback_manifest_count', 1,
    'can_run_official_import', false,
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
  'A16V official import real transaction execution branch candidate. NOT_APPLIED in repo phase; owner must manual apply and verify before any runtime execution.';

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
