-- A17O_TX1_GROUPED_OFFICIAL_IMPORT_TRANSACTION_EXECUTOR_CANDIDATE
-- SQL_CANDIDATE_STATUS=NOT_APPLIED
-- DO_NOT_RUN_AUTOMATICALLY
-- OWNER_MANUAL_REVIEW_REQUIRED
-- DO_NOT_RUN_SUPABASE_DB_PUSH
-- DO_NOT_RUN_SUPABASE_MIGRATION_REPAIR
-- NO_SEED_DATA
-- NO_OFFICIAL_IMPORT_EXECUTION
-- NO_PRODUCTION_IMPORT_ENDPOINT
-- NO_GENEALOGY_ROW_UPDATE_IN_THIS_PHASE
-- NO_CANONICAL_KEY_BACKFILL
-- NO_FAMILY_RECONCILIATION_EXECUTION
-- A17O_IMPORTER_RUNTIME_ACTIVE=NO
--
-- Purpose:
-- Add a new versioned SECURITY INVOKER transaction executor candidate for
-- future Gia Pha 4 official imports whose planned canonical family groups can
-- create or reuse one canonical family with multiple child memberships.
--
-- OLD_EXECUTOR_SIGNATURE_CHANGED=NO
-- OLD_EXECUTOR_DROPPED=NO
-- OLD_EXECUTOR_NAME=public.a16p_tx_execute_giapha4_official_import
-- NEW_GROUPED_EXECUTOR_NAME=public.a17o_tx_execute_grouped_giapha4_official_import
-- NEGATIVE_TEST_ONLY_COMPLETED_PRODUCTION_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68
--
-- This candidate does not call either RPC. Owner manual apply and SELECT-only
-- verification must happen in a separate phase before any runtime activation.

create table if not exists public.official_import_grouped_execution_idempotency (
  id uuid primary key default gen_random_uuid(),
  import_session_id uuid not null references public.import_sessions(id) on delete restrict,
  write_manifest_id uuid references public.import_write_manifests(id) on delete restrict,
  actor_profile_id uuid not null references public.profiles(id) on delete restrict,
  idempotency_key text not null,
  mutation_plan_hash text not null,
  executor_contract_version integer not null default 1,
  status text not null default 'running',
  result_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz,
  updated_at timestamptz not null default timezone('utc', now()),
  constraint official_import_grouped_execution_session_unique unique (
    import_session_id
  ),
  constraint official_import_grouped_execution_actor_key_unique unique (
    actor_profile_id,
    idempotency_key
  ),
  constraint official_import_grouped_execution_contract_version_check check (
    executor_contract_version = 1
  ),
  constraint official_import_grouped_execution_status_check check (
    status in ('running', 'completed', 'blocked', 'failed')
  ),
  constraint official_import_grouped_execution_idempotency_key_check check (
    length(btrim(idempotency_key)) between 16 and 180
    and idempotency_key ~ '^[A-Za-z0-9:_-]+$'
  ),
  constraint official_import_grouped_execution_hash_shape_check check (
    mutation_plan_hash ~* '^[a-f0-9]{64}$'
  ),
  constraint official_import_grouped_execution_result_shape_check check (
    jsonb_typeof(result_summary) = 'object'
  )
);

create index if not exists official_import_grouped_execution_status_idx
  on public.official_import_grouped_execution_idempotency(
    actor_profile_id,
    status,
    created_at desc
  );

alter table public.official_import_grouped_execution_idempotency
  enable row level security;

drop policy if exists a17o_tx1_grouped_execution_select_own
  on public.official_import_grouped_execution_idempotency;
create policy a17o_tx1_grouped_execution_select_own
on public.official_import_grouped_execution_idempotency
for select
to authenticated
using (
  actor_profile_id = public.current_profile_id()
  and public.has_permission('imports.create')
);

drop policy if exists a17o_tx1_grouped_execution_insert_own
  on public.official_import_grouped_execution_idempotency;
create policy a17o_tx1_grouped_execution_insert_own
on public.official_import_grouped_execution_idempotency
for insert
to authenticated
with check (
  actor_profile_id = public.current_profile_id()
  and public.has_permission('imports.create')
  and public.has_permission('people.create')
  and public.has_permission('relationships.create')
);

drop policy if exists a17o_tx1_grouped_execution_update_own
  on public.official_import_grouped_execution_idempotency;
create policy a17o_tx1_grouped_execution_update_own
on public.official_import_grouped_execution_idempotency
for update
to authenticated
using (
  actor_profile_id = public.current_profile_id()
  and public.has_permission('imports.create')
)
with check (
  actor_profile_id = public.current_profile_id()
  and public.has_permission('imports.create')
);

alter table public.official_import_batches
  add column if not exists grouped_execution_contract_version integer;

alter table public.official_import_batches
  add column if not exists mutation_plan_hash text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'official_import_batches_grouped_contract_version_check'
  ) then
    alter table public.official_import_batches
      add constraint official_import_batches_grouped_contract_version_check
      check (
        grouped_execution_contract_version is null
        or grouped_execution_contract_version = 1
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'official_import_batches_mutation_plan_hash_check'
  ) then
    alter table public.official_import_batches
      add constraint official_import_batches_mutation_plan_hash_check
      check (
        mutation_plan_hash is null
        or mutation_plan_hash ~* '^[a-f0-9]{64}$'
      );
  end if;
end $$;

alter table public.official_import_rollback_manifests
  add column if not exists grouped_family_rollback_summary jsonb not null default '{}'::jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'official_import_rollback_grouped_summary_shape_check'
  ) then
    alter table public.official_import_rollback_manifests
      add constraint official_import_rollback_grouped_summary_shape_check
      check (jsonb_typeof(grouped_family_rollback_summary) = 'object');
  end if;
end $$;

create or replace function public.a17o_tx_execute_grouped_giapha4_official_import(
  p_import_session_id uuid,
  p_confirm_marker text,
  p_confirm_manifest_hash text default null,
  p_confirm_review_pack_hash text default null,
  p_grouped_plan jsonb default '{}'::jsonb,
  p_idempotency_key text default null,
  p_mutation_plan_hash text default null,
  p_confirm_validation_errors_resolved boolean default false,
  p_confirm_rollback_reviewed boolean default false,
  p_confirm_audit_reviewed boolean default false,
  p_dry_run_only boolean default true
)
returns jsonb
language plpgsql
security invoker
set search_path = public, auth, pg_temp
as $$
declare
  v_profile_id uuid := public.current_profile_id();
  v_session public.import_sessions%rowtype;
  v_write_manifest public.import_write_manifests%rowtype;
  v_existing_batch public.official_import_batches%rowtype;
  v_idempotency public.official_import_grouped_execution_idempotency%rowtype;
  v_batch_id uuid;
  v_result jsonb;
  v_manifest_hash text;
  v_person_candidate_count integer := 0;
  v_relationship_candidate_count integer := 0;
  v_created_people_count integer := 0;
  v_created_family_count integer := 0;
  v_reused_family_count integer := 0;
  v_created_family_parent_count integer := 0;
  v_existing_family_parent_count integer := 0;
  v_created_family_child_count integer := 0;
  v_existing_family_child_count integer := 0;
  v_created_relationship_count integer := 0;
  v_created_revision_count integer := 0;
  v_skipped_relationship_count integer := 0;
  v_group_count integer := 0;
  v_invalid_count integer := 0;
  v_duplicate_count integer := 0;
  v_created_people_ids uuid[] := array[]::uuid[];
  v_created_family_ids uuid[] := array[]::uuid[];
  v_created_family_parent_ids uuid[] := array[]::uuid[];
  v_created_family_child_ids uuid[] := array[]::uuid[];
  v_created_revision_ids uuid[] := array[]::uuid[];
  v_group record;
  v_family public.families%rowtype;
  v_family_created boolean;
  v_expected_canonical_key text;
begin
  if p_dry_run_only then
    return jsonb_build_object(
      'ok', false,
      'status', 'BLOCKED',
      'blocked_reasons', jsonb_build_array('DRY_RUN_ONLY_TRUE'),
      'executor_contract_version', 1,
      'can_run_official_import', false
    );
  end if;

  if auth.uid() is null or v_profile_id is null then
    raise exception 'A17O_TX_AUTHENTICATED_PROFILE_REQUIRED';
  end if;

  if not public.has_permission('imports.create') then
    raise exception 'A17O_TX_IMPORTS_CREATE_REQUIRED';
  end if;

  if not public.has_permission('people.create') then
    raise exception 'A17O_TX_PEOPLE_CREATE_REQUIRED';
  end if;

  if not public.has_permission('relationships.create') then
    raise exception 'A17O_TX_RELATIONSHIPS_CREATE_REQUIRED';
  end if;

  if not public.has_permission('permissions.manage') then
    raise exception 'A17O_TX_PERMISSIONS_MANAGE_REQUIRED';
  end if;

  if p_import_session_id is null then
    raise exception 'A17O_TX_IMPORT_SESSION_ID_REQUIRED';
  end if;

  if p_idempotency_key is null
    or length(btrim(p_idempotency_key)) < 16
    or p_idempotency_key !~ '^[A-Za-z0-9:_-]+$' then
    raise exception 'A17O_TX_IDEMPOTENCY_KEY_REQUIRED';
  end if;

  if p_mutation_plan_hash is null
    or p_mutation_plan_hash !~* '^[a-f0-9]{64}$' then
    raise exception 'A17O_TX_MUTATION_PLAN_HASH_REQUIRED';
  end if;

  if jsonb_typeof(p_grouped_plan) <> 'object'
    or (p_grouped_plan ->> 'contractVersion')::integer is distinct from 1
    or (p_grouped_plan ->> 'sessionId')::uuid is distinct from p_import_session_id
    or p_grouped_plan ->> 'approvalMarker' is distinct from p_confirm_marker
    or (p_grouped_plan ->> 'actorProfileId')::uuid is distinct from v_profile_id
    or p_grouped_plan ->> 'idempotencyKey' is distinct from p_idempotency_key
    or lower(p_grouped_plan ->> 'mutationPlanHash') is distinct from lower(p_mutation_plan_hash)
    or jsonb_typeof(p_grouped_plan -> 'people') <> 'array'
    or jsonb_typeof(p_grouped_plan -> 'familyGroups') <> 'array'
    or jsonb_typeof(p_grouped_plan -> 'auditSummary') <> 'object' then
    raise exception 'A17O_TX_GROUP_CONTRACT_INVALID';
  end if;

  if not p_confirm_validation_errors_resolved then
    raise exception 'A17O_TX_VALIDATION_ERRORS_NOT_CONFIRMED_RESOLVED';
  end if;

  if not p_confirm_rollback_reviewed then
    raise exception 'A17O_TX_ROLLBACK_REVIEW_NOT_CONFIRMED';
  end if;

  if not p_confirm_audit_reviewed then
    raise exception 'A17O_TX_AUDIT_REVIEW_NOT_CONFIRMED';
  end if;

  select *
  into v_session
  from public.import_sessions
  where id = p_import_session_id
    and created_by = v_profile_id
  for update;

  if not found then
    raise exception 'A17O_TX_SESSION_NOT_FOUND_OR_NOT_OWNED';
  end if;

  if v_session.status in (
    'write_started',
    'write_completed',
    'rollback_required',
    'rolled_back',
    'expired_preview'
  ) then
    raise exception 'A17O_TX_COMPLETED_OR_CONSUMED_SESSION_REJECTED';
  end if;

  if v_session.retention_until is not null
    and v_session.retention_until < timezone('utc', now()) then
    raise exception 'A17O_TX_SESSION_EXPIRED';
  end if;

  if v_session.status not in ('ready_for_owner_approval', 'owner_approved_for_db_write') then
    raise exception 'A17O_TX_SESSION_NOT_READY_FOR_OFFICIAL_IMPORT';
  end if;

  if p_confirm_manifest_hash is not null
    and v_session.preview_manifest_hash is distinct from p_confirm_manifest_hash then
    raise exception 'A17O_TX_MANIFEST_HASH_MISMATCH';
  end if;

  select *
  into v_existing_batch
  from public.official_import_batches
  where import_session_id = p_import_session_id
  for update;

  if found and v_existing_batch.status in ('completed', 'running', 'pending') then
    raise exception 'A17O_TX_IMPORT_SESSION_ALREADY_EXECUTED';
  end if;

  insert into public.official_import_grouped_execution_idempotency (
    import_session_id,
    actor_profile_id,
    idempotency_key,
    mutation_plan_hash,
    executor_contract_version,
    status
  )
  values (
    p_import_session_id,
    v_profile_id,
    p_idempotency_key,
    lower(p_mutation_plan_hash),
    1,
    'running'
  )
  on conflict on constraint official_import_grouped_execution_actor_key_unique
  do nothing;

  select *
  into v_idempotency
  from public.official_import_grouped_execution_idempotency
  where actor_profile_id = v_profile_id
    and idempotency_key = p_idempotency_key
  for update;

  if not found then
    raise exception 'A17O_TX_IDEMPOTENCY_RECORD_NOT_VISIBLE';
  end if;

  if v_idempotency.import_session_id is distinct from p_import_session_id then
    raise exception 'A17O_TX_IDEMPOTENCY_SESSION_MISMATCH';
  end if;

  if v_idempotency.mutation_plan_hash is distinct from lower(p_mutation_plan_hash) then
    raise exception 'A17O_TX_IDEMPOTENCY_PLAN_HASH_MISMATCH';
  end if;

  if v_idempotency.status = 'completed' then
    return v_idempotency.result_summary || jsonb_build_object(
      'idempotent_replay',
      true,
      'can_run_official_import',
      false
    );
  end if;

  if v_idempotency.status <> 'running' then
    raise exception 'A17O_TX_IDEMPOTENCY_STATE_NOT_REUSABLE';
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
    raise exception 'A17O_TX_OWNER_APPROVED_WRITE_MANIFEST_REQUIRED';
  end if;

  if v_write_manifest.approval_marker is distinct from p_confirm_marker then
    raise exception 'A17O_TX_APPROVAL_MARKER_MISMATCH';
  end if;

  if v_session.approval_marker is not null
    and v_session.approval_marker is distinct from p_confirm_marker then
    raise exception 'A17O_TX_SESSION_APPROVAL_MARKER_MISMATCH';
  end if;

  v_manifest_hash := v_write_manifest.manifest_hash;

  if p_confirm_manifest_hash is not null and v_manifest_hash is distinct from p_confirm_manifest_hash then
    raise exception 'A17O_TX_WRITE_MANIFEST_HASH_MISMATCH';
  end if;

  update public.official_import_grouped_execution_idempotency
  set write_manifest_id = v_write_manifest.id,
      updated_at = timezone('utc', now())
  where id = v_idempotency.id;

  if exists (
    select 1
    from public.import_session_warnings
    where import_session_id = p_import_session_id
      and severity = 'blocker'
      and review_status not in ('resolved', 'acknowledged')
  ) then
    raise exception 'A17O_TX_IMPORT_SESSION_BLOCKER_WARNINGS_REMAIN';
  end if;

  if exists (
    select 1
    from public.import_duplicate_candidates
    where import_session_id = p_import_session_id
      and owner_decision in ('unresolved', 'needs_review', 'hold')
  ) then
    raise exception 'A17O_TX_DUPLICATE_DECISIONS_REMAIN_UNRESOLVED';
  end if;

  if exists (
    select 1
    from public.family_canonicalization_decisions
    where status in ('pending_review', 'blocked')
  ) then
    raise exception 'A17O_TX_LEGACY_DUPLICATE_REVIEW_REQUIRED';
  end if;

  create temporary table a17o_planned_people (
    source_person_fingerprint text primary key,
    planned_person_id uuid not null unique
  ) on commit drop;

  insert into a17o_planned_people (
    source_person_fingerprint,
    planned_person_id
  )
  select
    nullif(person_plan ->> 'sourcePersonFingerprint', ''),
    (person_plan ->> 'personId')::uuid
  from jsonb_array_elements(p_grouped_plan -> 'people') as person_plan
  where nullif(person_plan ->> 'sourcePersonFingerprint', '') is not null
    and nullif(person_plan ->> 'personId', '') is not null;

  create temporary table a17o_person_map (
    source_person_fingerprint text primary key,
    source_row_index integer not null,
    person_id uuid not null
  ) on commit drop;

  if jsonb_typeof(v_write_manifest.approved_scope -> 'person_candidates') <> 'array' then
    raise exception 'A17O_TX_PERSON_CANDIDATES_ARRAY_REQUIRED';
  end if;

  select jsonb_array_length(v_write_manifest.approved_scope -> 'person_candidates')
  into v_person_candidate_count;

  if v_person_candidate_count <= 0 then
    raise exception 'A17O_TX_NO_PERSON_CANDIDATES_TO_IMPORT';
  end if;

  if (
    select count(*) from a17o_planned_people
  ) <> v_person_candidate_count then
    raise exception 'A17O_TX_PERSON_ID_RESOLUTION_CONTRACT_REQUIRED';
  end if;

  with candidate_people as (
    select
      planned.planned_person_id as person_id,
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
        when lower(btrim(coalesce(candidate ->> 'isLiving', ''))) in ('true', 'false')
          then lower(btrim(candidate ->> 'isLiving'))::boolean
        else nullif(btrim(coalesce(candidate ->> 'deathDateText', '')), '') is null
      end as is_living,
      case
        when candidate ->> 'sourceRowIndex' ~ '^[0-9]+$' then (candidate ->> 'sourceRowIndex')::integer
        else ordinality::integer
      end as source_row_index
    from jsonb_array_elements(v_write_manifest.approved_scope -> 'person_candidates')
      with ordinality as source(candidate, ordinality)
    join a17o_planned_people planned
      on planned.source_person_fingerprint =
        coalesce(nullif(candidate ->> 'fingerprint', ''), candidate ->> 'externalId')
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
      'a17o-giapha4-' || left(person_id::text, 8),
      coalesce(full_name, 'Chua ro ten'),
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
  insert into a17o_person_map (
    source_person_fingerprint,
    source_row_index,
    person_id
  )
  select candidate_people.fingerprint, candidate_people.source_row_index, candidate_people.person_id
  from candidate_people
  join inserted_people on inserted_people.id = candidate_people.person_id;

  get diagnostics v_created_people_count = row_count;

  if v_created_people_count <> v_person_candidate_count then
    raise exception 'A17O_TX_PERSON_ID_RESOLUTION_CONTRACT_REQUIRED';
  end if;

  select coalesce(array_agg(person_id order by source_row_index), array[]::uuid[])
  into v_created_people_ids
  from a17o_person_map;

  create temporary table a17o_group_input (
    group_key text primary key,
    canonical_key text not null,
    identity_version integer not null,
    family_action text not null,
    target_family_id uuid,
    expected_family_updated_at timestamptz,
    source_reference_hashes text[] not null default array[]::text[]
  ) on commit drop;

  insert into a17o_group_input (
    group_key,
    canonical_key,
    identity_version,
    family_action,
    target_family_id,
    expected_family_updated_at,
    source_reference_hashes
  )
  select
    group_plan ->> 'groupKey',
    group_plan ->> 'canonicalKey',
    (group_plan ->> 'identityVersion')::integer,
    upper(group_plan ->> 'familyAction'),
    nullif(group_plan ->> 'targetFamilyId', '')::uuid,
    nullif(group_plan ->> 'expectedFamilyUpdatedAt', '')::timestamptz,
    coalesce(
      array(
        select jsonb_array_elements_text(group_plan -> 'sourceReferenceHashes')
        order by 1
      ),
      array[]::text[]
    )
  from jsonb_array_elements(p_grouped_plan -> 'familyGroups') as group_plan;

  select count(*) into v_group_count from a17o_group_input;
  if v_group_count <= 0 then
    raise exception 'A17O_TX_GROUP_CONTRACT_INVALID';
  end if;

  create temporary table a17o_group_parents (
    group_key text not null references a17o_group_input(group_key) on delete cascade,
    person_id uuid not null,
    parent_role text not null,
    relationship_type text not null
  ) on commit drop;

  insert into a17o_group_parents (
    group_key,
    person_id,
    parent_role,
    relationship_type
  )
  select
    group_plan ->> 'groupKey',
    (parent_plan ->> 'personId')::uuid,
    coalesce(nullif(parent_plan ->> 'role', ''), 'unknown'),
    coalesce(nullif(parent_plan ->> 'relationshipType', ''), 'unknown')
  from jsonb_array_elements(p_grouped_plan -> 'familyGroups') as group_plan
  cross join lateral jsonb_array_elements(group_plan -> 'parentMemberships') as parent_plan;

  create temporary table a17o_group_children (
    group_key text not null references a17o_group_input(group_key) on delete cascade,
    person_id uuid not null,
    relationship_type text not null
  ) on commit drop;

  insert into a17o_group_children (
    group_key,
    person_id,
    relationship_type
  )
  select
    group_plan ->> 'groupKey',
    (child_plan ->> 'personId')::uuid,
    coalesce(nullif(child_plan ->> 'relationshipType', ''), 'unknown')
  from jsonb_array_elements(p_grouped_plan -> 'familyGroups') as group_plan
  cross join lateral jsonb_array_elements(group_plan -> 'childMemberships') as child_plan;

  select count(*)
  into v_invalid_count
  from a17o_group_input group_input
  where group_input.group_key is null
    or group_input.group_key !~ '^a17o-import-family-group:v1:[a-f0-9]{64}$'
    or group_input.identity_version <> 1
    or group_input.canonical_key !~ '^canonical-family:v1:[a-f0-9]{64}$'
    or group_input.family_action not in ('CREATE', 'REUSE');

  if v_invalid_count > 0 then
    raise exception 'A17O_TX_GROUP_CONTRACT_INVALID';
  end if;

  select count(*)
  into v_duplicate_count
  from (
    select group_key, person_id
    from a17o_group_parents
    group by group_key, person_id
    having count(*) > 1
    union all
    select group_key, person_id
    from a17o_group_children
    group by group_key, person_id
    having count(*) > 1
  ) duplicates;

  if v_duplicate_count > 0 then
    raise exception 'A17O_TX_DUPLICATE_PARENT_OR_CHILD_MEMBERSHIP';
  end if;

  if exists (
    select 1
    from a17o_group_parents parent_ref
    where parent_ref.parent_role not in ('father', 'mother', 'parent', 'unknown')
      or parent_ref.relationship_type not in ('biological', 'adoptive', 'step', 'guardian', 'unknown')
      or not exists (
        select 1 from public.people p
        where p.id = parent_ref.person_id and p.deleted_at is null
      )
  ) then
    raise exception 'A17O_TX_GROUP_CONTRACT_INVALID';
  end if;

  if exists (
    select 1
    from a17o_group_children child_ref
    where child_ref.relationship_type not in ('biological', 'adoptive', 'step', 'foster', 'unknown')
      or not exists (
        select 1 from public.people p
        where p.id = child_ref.person_id and p.deleted_at is null
      )
  ) then
    raise exception 'A17O_TX_GROUP_CONTRACT_INVALID';
  end if;

  create temporary table a17o_group_identity (
    group_key text primary key,
    parent_ids uuid[] not null,
    parent_count integer not null,
    child_count integer not null,
    expected_canonical_key text not null
  ) on commit drop;

  insert into a17o_group_identity (
    group_key,
    parent_ids,
    parent_count,
    child_count,
    expected_canonical_key
  )
  select
    parent_sets.group_key,
    parent_sets.parent_ids,
    cardinality(parent_sets.parent_ids),
    (
      select count(*)::integer
      from a17o_group_children child_ref
      where child_ref.group_key = parent_sets.group_key
    ),
    'canonical-family:v1:' || encode(
      digest(
        convert_to(
          '{"parentIds":['
          || array_to_string(
            array(
              select to_json(parent_id::text)::text
              from unnest(parent_sets.parent_ids) as parent_id
              order by parent_id
            ),
            ','
          )
          || '],"relationshipPeriod":null,"unionIdentity":null,"version":1}',
          'UTF8'
        ),
        'sha256'
      ),
      'hex'
    )
  from (
    select
      group_key,
      array_agg(person_id order by person_id) as parent_ids
    from a17o_group_parents
    group by group_key
  ) parent_sets;

  if exists (
    select 1
    from a17o_group_identity identity_check
    join a17o_group_input group_input
      on group_input.group_key = identity_check.group_key
    where identity_check.parent_count not between 1 and 2
      or identity_check.child_count <= 0
      or group_input.canonical_key is distinct from identity_check.expected_canonical_key
  ) then
    raise exception 'A17O_TX_CANONICAL_KEY_MISMATCH';
  end if;

  if exists (
    select 1
    from a17o_group_identity identity_check
    join a17o_group_children child_ref
      on child_ref.group_key = identity_check.group_key
    where child_ref.person_id = any(identity_check.parent_ids)
  ) then
    raise exception 'A17O_TX_GROUP_CONTRACT_INVALID';
  end if;

  if exists (
    select 1
    from (
      select canonical_key, count(*) as canonical_count
      from public.families
      where deleted_at is null
        and canonical_status = 'canonical'
        and canonical_key in (
          select canonical_key from a17o_group_input
        )
      group by canonical_key
      having count(*) > 1
    ) multiple_matches
  ) then
    raise exception 'A17O_TX_MULTIPLE_ACTIVE_CANONICAL_MATCHES';
  end if;

  if exists (
    with duplicate_parent_sets as (
      select
        identity_check.group_key,
        fp.family_id,
        array_agg(fp.person_id order by fp.person_id) as parent_ids
      from a17o_group_identity identity_check
      join public.family_parents fp
        on fp.deleted_at is null
      join public.families family_candidate
        on family_candidate.id = fp.family_id
       and family_candidate.deleted_at is null
       and coalesce(family_candidate.canonical_status, 'legacy_unreviewed') not in ('merged', 'voided')
      group by identity_check.group_key, fp.family_id
    )
    select 1
    from duplicate_parent_sets duplicate_set
    join a17o_group_identity identity_check
      on identity_check.group_key = duplicate_set.group_key
    where duplicate_set.parent_ids = identity_check.parent_ids
      and not exists (
        select 1
        from a17o_group_input group_input
        where group_input.group_key = duplicate_set.group_key
          and group_input.target_family_id = duplicate_set.family_id
      )
  ) then
    raise exception 'A17O_TX_LEGACY_DUPLICATE_REVIEW_REQUIRED';
  end if;

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
    grouped_execution_contract_version,
    mutation_plan_hash,
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
    (
      select count(*)::integer
      from a17o_group_parents
    ) + (
      select count(*)::integer
      from a17o_group_children
    ),
    jsonb_build_object('grouped_contract_version', 1),
    jsonb_build_object('validation_errors', 0, 'confirmed_by_owner', true),
    jsonb_build_object(
      'dry_run_blockers',
      0,
      'confirmed_by_owner',
      true,
      'family_group_count',
      v_group_count
    ),
    p_import_session_id::text,
    p_confirm_marker,
    1,
    lower(p_mutation_plan_hash),
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

  create temporary table a17o_family_results (
    group_key text primary key,
    family_id uuid not null,
    family_created boolean not null,
    family_reused boolean not null
  ) on commit drop;

  create temporary table a17o_parent_membership_results (
    group_key text not null,
    membership_id uuid not null,
    person_id uuid not null,
    created_by_execution boolean not null
  ) on commit drop;

  create temporary table a17o_child_membership_results (
    group_key text not null,
    membership_id uuid not null,
    person_id uuid not null,
    created_by_execution boolean not null
  ) on commit drop;

  for v_group in
    select *
    from a17o_group_input
    order by group_key
  loop
    v_family_created := false;

    if v_group.family_action = 'REUSE' then
      if v_group.target_family_id is null then
        raise exception 'A17O_TX_TARGET_FAMILY_NOT_REUSABLE';
      end if;

      select *
      into v_family
      from public.families
      where id = v_group.target_family_id
      for update;

      if not found
        or v_family.deleted_at is not null
        or v_family.canonical_status in ('merged', 'voided')
        or v_family.canonical_key is distinct from v_group.canonical_key
        or (
          v_group.expected_family_updated_at is not null
          and v_family.updated_at is distinct from v_group.expected_family_updated_at
        ) then
        raise exception 'A17O_TX_TARGET_FAMILY_NOT_REUSABLE';
      end if;

      v_reused_family_count := v_reused_family_count + 1;
    else
      insert into public.families (
        family_label,
        visibility,
        notes,
        canonical_key,
        canonical_status,
        canonicalized_at,
        canonicalized_by,
        created_by,
        updated_by
      )
      values (
        'Canonical family created from grouped official import',
        'family',
        'A-17O-TX1 grouped official import transaction executor',
        v_group.canonical_key,
        'canonical',
        timezone('utc', now()),
        v_profile_id,
        v_profile_id,
        v_profile_id
      )
      on conflict (canonical_key)
        where deleted_at is null
          and canonical_status = 'canonical'
          and canonical_key is not null
      do nothing
      returning * into v_family;

      if found then
        v_family_created := true;
        v_created_family_count := v_created_family_count + 1;
      else
        select *
        into v_family
        from public.families
        where canonical_key = v_group.canonical_key
          and canonical_status = 'canonical'
          and deleted_at is null
        for update;
      end if;

      if not found
        or v_family.deleted_at is not null
        or v_family.canonical_status <> 'canonical'
        or v_family.canonical_key is distinct from v_group.canonical_key then
        raise exception 'A17O_TX_MULTIPLE_ACTIVE_CANONICAL_MATCHES';
      end if;
    end if;

    insert into a17o_family_results (
      group_key,
      family_id,
      family_created,
      family_reused
    )
    values (
      v_group.group_key,
      v_family.id,
      v_family_created,
      not v_family_created
    );

    with inserted_parent_memberships as (
      insert into public.family_parents (
        family_id,
        person_id,
        parent_role,
        relationship_type,
        notes,
        created_by,
        updated_by
      )
      select
        v_family.id,
        parent_ref.person_id,
        parent_ref.parent_role,
        parent_ref.relationship_type,
        'A-17O-TX1 grouped official import transaction executor',
        v_profile_id,
        v_profile_id
      from a17o_group_parents parent_ref
      where parent_ref.group_key = v_group.group_key
      on conflict (family_id, person_id)
        where deleted_at is null
      do nothing
      returning id, person_id
    )
    insert into a17o_parent_membership_results (
      group_key,
      membership_id,
      person_id,
      created_by_execution
    )
    select
      v_group.group_key,
      id,
      person_id,
      true
    from inserted_parent_memberships;

    insert into a17o_parent_membership_results (
      group_key,
      membership_id,
      person_id,
      created_by_execution
    )
    select
      v_group.group_key,
      existing_parent.id,
      existing_parent.person_id,
      false
    from public.family_parents existing_parent
    join a17o_group_parents parent_ref
      on parent_ref.person_id = existing_parent.person_id
     and parent_ref.group_key = v_group.group_key
    where existing_parent.family_id = v_family.id
      and existing_parent.deleted_at is null
      and not exists (
        select 1
        from a17o_parent_membership_results result
        where result.group_key = v_group.group_key
          and result.person_id = existing_parent.person_id
      );

    with inserted_child_memberships as (
      insert into public.family_children (
        family_id,
        person_id,
        child_relationship_type,
        notes,
        created_by,
        updated_by
      )
      select
        v_family.id,
        child_ref.person_id,
        child_ref.relationship_type,
        'A-17O-TX1 grouped official import transaction executor',
        v_profile_id,
        v_profile_id
      from a17o_group_children child_ref
      where child_ref.group_key = v_group.group_key
      on conflict (family_id, person_id)
        where deleted_at is null
      do nothing
      returning id, person_id
    )
    insert into a17o_child_membership_results (
      group_key,
      membership_id,
      person_id,
      created_by_execution
    )
    select
      v_group.group_key,
      id,
      person_id,
      true
    from inserted_child_memberships;

    insert into a17o_child_membership_results (
      group_key,
      membership_id,
      person_id,
      created_by_execution
    )
    select
      v_group.group_key,
      existing_child.id,
      existing_child.person_id,
      false
    from public.family_children existing_child
    join a17o_group_children child_ref
      on child_ref.person_id = existing_child.person_id
     and child_ref.group_key = v_group.group_key
    where existing_child.family_id = v_family.id
      and existing_child.deleted_at is null
      and not exists (
        select 1
        from a17o_child_membership_results result
        where result.group_key = v_group.group_key
          and result.person_id = existing_child.person_id
      );
  end loop;

  select
    count(*) filter (where created_by_execution),
    count(*) filter (where not created_by_execution)
  into v_created_family_parent_count, v_existing_family_parent_count
  from a17o_parent_membership_results;

  select
    count(*) filter (where created_by_execution),
    count(*) filter (where not created_by_execution)
  into v_created_family_child_count, v_existing_family_child_count
  from a17o_child_membership_results;

  v_created_relationship_count :=
    coalesce(v_created_family_parent_count, 0) + coalesce(v_created_family_child_count, 0);

  select count(*)
  into v_skipped_relationship_count
  from public.import_relationship_candidates
  where import_session_id = p_import_session_id
    and relationship_type <> 'parent_child';

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
        'source', 'A-17O-TX1 grouped official import transaction executor',
        'import_session_id', p_import_session_id,
        'executor_contract_version', 1,
        'mutation_plan_hash', lower(p_mutation_plan_hash),
        'source_row_index', source_row_index
      ),
      v_profile_id,
      'A-17O-TX1 grouped official import transaction executor'
    from a17o_person_map
    returning id
  ),
  family_revisions as (
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
      case when family_created then 'create' else 'update' end,
      null,
      jsonb_build_object(
        'source', 'A-17O-TX1 grouped official import transaction executor',
        'import_session_id', p_import_session_id,
        'executor_contract_version', 1,
        'mutation_plan_hash', lower(p_mutation_plan_hash),
        'group_key_hash', encode(digest(convert_to(group_key, 'UTF8'), 'sha256'), 'hex'),
        'family_created', family_created,
        'family_reused', family_reused
      ),
      v_profile_id,
      'A-17O-TX1 grouped official import transaction executor'
    from a17o_family_results
    returning id
  ),
  parent_revisions as (
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
      'family_parents',
      membership_id,
      'create',
      null,
      jsonb_build_object(
        'source', 'A-17O-TX1 grouped official import transaction executor',
        'import_session_id', p_import_session_id,
        'executor_contract_version', 1,
        'mutation_plan_hash', lower(p_mutation_plan_hash),
        'created_by_execution', created_by_execution
      ),
      v_profile_id,
      'A-17O-TX1 grouped official import transaction executor'
    from a17o_parent_membership_results
    where created_by_execution
    returning id
  ),
  child_revisions as (
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
      'family_children',
      membership_id,
      'create',
      null,
      jsonb_build_object(
        'source', 'A-17O-TX1 grouped official import transaction executor',
        'import_session_id', p_import_session_id,
        'executor_contract_version', 1,
        'mutation_plan_hash', lower(p_mutation_plan_hash),
        'created_by_execution', created_by_execution
      ),
      v_profile_id,
      'A-17O-TX1 grouped official import transaction executor'
    from a17o_child_membership_results
    where created_by_execution
    returning id
  ),
  all_revisions as (
    select id from person_revisions
    union all select id from family_revisions
    union all select id from parent_revisions
    union all select id from child_revisions
  )
  select count(*), coalesce(array_agg(id), array[]::uuid[])
  into v_created_revision_count, v_created_revision_ids
  from all_revisions;

  select coalesce(array_agg(family_id order by group_key), array[]::uuid[])
  into v_created_family_ids
  from a17o_family_results
  where family_created;

  select coalesce(array_agg(membership_id order by group_key, person_id), array[]::uuid[])
  into v_created_family_parent_ids
  from a17o_parent_membership_results
  where created_by_execution;

  select coalesce(array_agg(membership_id order by group_key, person_id), array[]::uuid[])
  into v_created_family_child_ids
  from a17o_child_membership_results
  where created_by_execution;

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
    grouped_family_rollback_summary,
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
      'family_parents_created_by_execution',
      'family_children_created_by_execution',
      'families_created_by_execution',
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
      'non_parent_child_relationship_candidates',
      v_skipped_relationship_count
    ),
    jsonb_build_object(),
    jsonb_build_object(
      'executor_contract_version', 1,
      'familyCreatedByExecution', (
        select coalesce(jsonb_agg(family_id order by group_key), '[]'::jsonb)
        from a17o_family_results
        where family_created
      ),
      'familyReused', (
        select coalesce(jsonb_agg(family_id order by group_key), '[]'::jsonb)
        from a17o_family_results
        where family_reused
      ),
      'parentMembershipsCreatedByExecution', (
        select coalesce(jsonb_agg(membership_id order by group_key, person_id), '[]'::jsonb)
        from a17o_parent_membership_results
        where created_by_execution
      ),
      'parentMembershipsPreExisting', (
        select coalesce(jsonb_agg(membership_id order by group_key, person_id), '[]'::jsonb)
        from a17o_parent_membership_results
        where not created_by_execution
      ),
      'childMembershipsCreatedByExecution', (
        select coalesce(jsonb_agg(membership_id order by group_key, person_id), '[]'::jsonb)
        from a17o_child_membership_results
        where created_by_execution
      ),
      'childMembershipsPreExisting', (
        select coalesce(jsonb_agg(membership_id order by group_key, person_id), '[]'::jsonb)
        from a17o_child_membership_results
        where not created_by_execution
      )
    ),
    'A-17O-TX1 rollback manifest candidate. Remove only rows marked created_by_execution after owner approval.',
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

  v_result := jsonb_build_object(
    'ok', true,
    'status', 'IMPORT_COMPLETED',
    'executor_contract_version', 1,
    'import_session_id', p_import_session_id,
    'audit_batch_id', v_batch_id,
    'idempotency_key', p_idempotency_key,
    'mutation_plan_hash', lower(p_mutation_plan_hash),
    'created_people_count', v_created_people_count,
    'family_group_count', v_group_count,
    'created_family_count', v_created_family_count,
    'reused_family_count', v_reused_family_count,
    'created_parent_membership_count', v_created_family_parent_count,
    'existing_parent_membership_count', v_existing_family_parent_count,
    'created_child_membership_count', v_created_family_child_count,
    'existing_child_membership_count', v_existing_family_child_count,
    'created_relationship_count', v_created_relationship_count,
    'created_revision_count', v_created_revision_count,
    'rollback_manifest_count', 1,
    'can_run_official_import', false,
    'pii_printed', false
  );

  update public.official_import_grouped_execution_idempotency
  set status = 'completed',
      result_summary = v_result,
      completed_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
  where actor_profile_id = v_profile_id
    and idempotency_key = p_idempotency_key;

  return v_result;
end;
$$;

comment on table public.official_import_grouped_execution_idempotency is
  'A-17O-TX1 candidate: grouped official import idempotency table for future approved imports only. No seed rows are created by the migration.';

comment on function public.a17o_tx_execute_grouped_giapha4_official_import(
  uuid,
  text,
  text,
  text,
  jsonb,
  text,
  text,
  boolean,
  boolean,
  boolean,
  boolean
) is
  'A-17O-TX1 candidate: SECURITY INVOKER grouped official import executor v1 for future approved imports. Old A16P/A16BU executor is preserved unchanged. Not applied until owner review.';

revoke execute on function public.a17o_tx_execute_grouped_giapha4_official_import(
  uuid,
  text,
  text,
  text,
  jsonb,
  text,
  text,
  boolean,
  boolean,
  boolean,
  boolean
) from public;

revoke execute on function public.a17o_tx_execute_grouped_giapha4_official_import(
  uuid,
  text,
  text,
  text,
  jsonb,
  text,
  text,
  boolean,
  boolean,
  boolean,
  boolean
) from anon;

grant execute on function public.a17o_tx_execute_grouped_giapha4_official_import(
  uuid,
  text,
  text,
  text,
  jsonb,
  text,
  text,
  boolean,
  boolean,
  boolean,
  boolean
) to authenticated;

revoke all privileges on table public.official_import_grouped_execution_idempotency from anon;
revoke all privileges on table public.official_import_grouped_execution_idempotency from public;
grant select, insert, update on table public.official_import_grouped_execution_idempotency to authenticated;
