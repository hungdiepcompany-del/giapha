-- A17N_TX1_ADMIN_CANONICAL_FAMILY_TRANSACTION_EXECUTOR_CANDIDATE
-- SQL_CANDIDATE_STATUS=NOT_APPLIED
-- DO_NOT_RUN_AUTOMATICALLY
-- OWNER_MANUAL_REVIEW_REQUIRED
-- DO_NOT_RUN_SUPABASE_DB_PUSH
-- DO_NOT_RUN_SUPABASE_MIGRATION_REPAIR
-- NO_SEED_DATA
-- NO_GENEALOGY_ROW_UPDATE
-- NO_CANONICAL_KEY_BACKFILL
-- NO_FAMILY_RECONCILIATION_EXECUTION
-- NO_IMPORTER_RUNTIME_CHANGE
-- NO_ADD_SPOUSE_RUNTIME_CHANGE
-- NO_PUBLIC_TREE_CHANGE
-- NO_OFFICIAL_IMPORT_EXECUTION
--
-- Purpose:
-- Add a narrowly scoped SECURITY INVOKER transaction executor candidate for
-- already validated admin canonical-family ADD_PARENT / ADD_CHILD plans.
-- Domain decisions remain in the A-17M/A-17N server application layer.
-- This candidate is additive and has no trigger, no production caller and no
-- automatic execution path.

create table if not exists public.admin_canonical_family_write_idempotency (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null,
  actor_profile_id uuid not null references public.profiles(id) on delete restrict,
  operation_type text not null,
  mutation_plan_hash text not null,
  status text not null default 'running',
  result_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz,
  updated_at timestamptz not null default timezone('utc', now()),
  constraint admin_canonical_family_write_idempotency_actor_key_unique unique (
    actor_profile_id,
    idempotency_key
  ),
  constraint admin_canonical_family_write_idempotency_operation_check check (
    operation_type in ('ADD_PARENT', 'ADD_CHILD')
  ),
  constraint admin_canonical_family_write_idempotency_status_check check (
    status in ('running', 'completed', 'blocked', 'failed')
  ),
  constraint admin_canonical_family_write_idempotency_key_shape_check check (
    length(btrim(idempotency_key)) between 16 and 160
    and idempotency_key ~ '^[A-Za-z0-9:_-]+$'
  ),
  constraint admin_canonical_family_write_idempotency_hash_shape_check check (
    mutation_plan_hash ~* '^[a-f0-9]{64}$'
  ),
  constraint admin_canonical_family_write_idempotency_result_shape_check check (
    jsonb_typeof(result_summary) = 'object'
  )
);

create index if not exists admin_canonical_family_write_idempotency_status_idx
  on public.admin_canonical_family_write_idempotency(
    actor_profile_id,
    status,
    created_at desc
  );

alter table public.admin_canonical_family_write_idempotency enable row level security;

drop policy if exists a17n_tx1_idempotency_select_own
  on public.admin_canonical_family_write_idempotency;
create policy a17n_tx1_idempotency_select_own
on public.admin_canonical_family_write_idempotency
for select
to authenticated
using (
  actor_profile_id = public.current_profile_id()
  and public.has_permission('relationships.create')
);

drop policy if exists a17n_tx1_idempotency_insert_own
  on public.admin_canonical_family_write_idempotency;
create policy a17n_tx1_idempotency_insert_own
on public.admin_canonical_family_write_idempotency
for insert
to authenticated
with check (
  actor_profile_id = public.current_profile_id()
  and public.has_permission('relationships.create')
);

drop policy if exists a17n_tx1_idempotency_update_own
  on public.admin_canonical_family_write_idempotency;
create policy a17n_tx1_idempotency_update_own
on public.admin_canonical_family_write_idempotency
for update
to authenticated
using (
  actor_profile_id = public.current_profile_id()
  and public.has_permission('relationships.create')
)
with check (
  actor_profile_id = public.current_profile_id()
  and public.has_permission('relationships.create')
);

drop policy if exists a17n_tx1_revisions_insert_admin_canonical_family_write
  on public.revisions;
create policy a17n_tx1_revisions_insert_admin_canonical_family_write
on public.revisions
for insert
to authenticated
with check (
  public.has_permission('relationships.create')
  and public.has_permission('relationships.update')
  and changed_by = public.current_profile_id()
  and action in ('create', 'update')
  and entity_type in ('families', 'family_parents', 'family_children')
  and change_reason = 'A-17N-TX1 admin canonical family transaction executor'
  and jsonb_typeof(after_json) = 'object'
  and after_json ->> 'source' = 'A-17N-TX1 admin canonical family transaction executor'
  and after_json ? 'idempotency_key'
  and after_json ? 'mutation_plan_hash'
  and (after_json ->> 'mutation_plan_hash') ~* '^[a-f0-9]{64}$'
  and before_json is null
);

comment on policy a17n_tx1_revisions_insert_admin_canonical_family_write
on public.revisions is
  'A-17N-TX1 candidate: narrow authenticated revision INSERT policy for the admin canonical family transaction executor only.';

revoke all privileges on table public.admin_canonical_family_write_idempotency from anon;
revoke all privileges on table public.admin_canonical_family_write_idempotency from public;
grant select, insert, update on table public.admin_canonical_family_write_idempotency to authenticated;
grant insert on table public.revisions to authenticated;

create or replace function public.execute_admin_canonical_family_parent_child_write(
  p_operation_type text,
  p_idempotency_key text,
  p_actor_profile_id uuid,
  p_family_action text,
  p_target_family_id uuid,
  p_expected_family_updated_at timestamptz,
  p_allow_canonical_metadata_update boolean,
  p_canonical_key text,
  p_canonical_identity_version integer,
  p_parent_person_ids uuid[],
  p_parent_roles text[],
  p_parent_relationship_types text[],
  p_child_person_id uuid,
  p_child_relationship_type text,
  p_source_action text,
  p_mutation_plan_hash text
)
returns jsonb
language plpgsql
security invoker
set search_path = public, auth, pg_temp
as $$
declare
  v_profile_id uuid := public.current_profile_id();
  v_idempotency public.admin_canonical_family_write_idempotency%rowtype;
  v_result jsonb;
  v_sorted_parent_ids uuid[];
  v_serialized_identity text;
  v_expected_canonical_key text;
  v_family public.families%rowtype;
  v_family_before jsonb;
  v_family_created boolean := false;
  v_parent_count_before integer := 0;
  v_parent_count_after integer := 0;
  v_child_count_before integer := 0;
  v_child_count_after integer := 0;
  v_parent_id uuid;
  v_parent_role text;
  v_parent_relationship_type text;
  v_parent_membership_id uuid;
  v_child_membership_id uuid;
  v_parent_membership_created boolean := false;
  v_child_membership_created boolean := false;
  v_audit_record_id uuid;
  v_parent_index integer;
  v_duplicate_family_count integer := 0;
  v_existing_child_relationship text;
begin
  if auth.uid() is null or v_profile_id is null then
    return jsonb_build_object(
      'status', 'BLOCKED_PERMISSION',
      'blocker_code', 'AUTHENTICATED_PROFILE_REQUIRED'
    );
  end if;

  if p_actor_profile_id is distinct from v_profile_id then
    return jsonb_build_object(
      'status', 'BLOCKED_PERMISSION',
      'blocker_code', 'ACTOR_PROFILE_MISMATCH'
    );
  end if;

  if not public.has_permission('relationships.create')
    or not public.has_permission('relationships.update') then
    return jsonb_build_object(
      'status', 'BLOCKED_PERMISSION',
      'blocker_code', 'RELATIONSHIP_CREATE_UPDATE_REQUIRED'
    );
  end if;

  if p_operation_type not in ('ADD_PARENT', 'ADD_CHILD') then
    return jsonb_build_object(
      'status', 'BLOCKED_AMBIGUOUS',
      'blocker_code', 'UNSUPPORTED_OPERATION_TYPE'
    );
  end if;

  if p_family_action not in ('CREATE', 'REUSE') then
    return jsonb_build_object(
      'status', 'BLOCKED_AMBIGUOUS',
      'blocker_code', 'UNSUPPORTED_FAMILY_ACTION'
    );
  end if;

  if p_idempotency_key is null
    or length(btrim(p_idempotency_key)) < 16
    or p_idempotency_key !~ '^[A-Za-z0-9:_-]+$' then
    return jsonb_build_object(
      'status', 'BLOCKED_IDEMPOTENCY_CONFLICT',
      'blocker_code', 'IDEMPOTENCY_KEY_REQUIRED'
    );
  end if;

  if p_mutation_plan_hash is null
    or p_mutation_plan_hash !~* '^[a-f0-9]{64}$' then
    return jsonb_build_object(
      'status', 'BLOCKED_IDEMPOTENCY_CONFLICT',
      'blocker_code', 'MUTATION_PLAN_HASH_REQUIRED'
    );
  end if;

  insert into public.admin_canonical_family_write_idempotency (
    idempotency_key,
    actor_profile_id,
    operation_type,
    mutation_plan_hash,
    status
  )
  values (
    p_idempotency_key,
    v_profile_id,
    p_operation_type,
    lower(p_mutation_plan_hash),
    'running'
  )
  on conflict on constraint admin_canonical_family_write_idempotency_actor_key_unique
  do nothing;

  select *
  into v_idempotency
  from public.admin_canonical_family_write_idempotency
  where actor_profile_id = v_profile_id
    and idempotency_key = p_idempotency_key
  for update;

  if not found then
    return jsonb_build_object(
      'status', 'BLOCKED_IDEMPOTENCY_CONFLICT',
      'blocker_code', 'IDEMPOTENCY_RECORD_NOT_VISIBLE'
    );
  end if;

  if v_idempotency.mutation_plan_hash is distinct from lower(p_mutation_plan_hash)
    or v_idempotency.operation_type is distinct from p_operation_type then
    v_result := jsonb_build_object(
      'status', 'BLOCKED_IDEMPOTENCY_CONFLICT',
      'operation_type', p_operation_type,
      'blocker_code', 'IDEMPOTENCY_PAYLOAD_HASH_MISMATCH'
    );
    update public.admin_canonical_family_write_idempotency
    set status = 'blocked',
        result_summary = v_result,
        completed_at = timezone('utc', now()),
        updated_at = timezone('utc', now())
    where id = v_idempotency.id;
    return v_result;
  end if;

  if v_idempotency.status = 'completed' then
    return v_idempotency.result_summary || jsonb_build_object(
      'idempotent_replay', true
    );
  end if;

  if p_canonical_identity_version <> 1
    or p_canonical_key is null
    or p_canonical_key !~ '^canonical-family:v1:[a-f0-9]{64}$' then
    v_result := jsonb_build_object(
      'status', 'BLOCKED_INVALID_REFERENCE',
      'operation_type', p_operation_type,
      'blocker_code', 'INVALID_CANONICAL_IDENTITY'
    );
    update public.admin_canonical_family_write_idempotency
    set status = 'blocked',
        result_summary = v_result,
        completed_at = timezone('utc', now()),
        updated_at = timezone('utc', now())
    where id = v_idempotency.id;
    return v_result;
  end if;

  select array_agg(parent_id order by parent_id)
  into v_sorted_parent_ids
  from (
    select distinct unnest(p_parent_person_ids) as parent_id
  ) normalized_parents;

  if cardinality(v_sorted_parent_ids) is null
    or cardinality(v_sorted_parent_ids) not between 1 and 2
    or cardinality(v_sorted_parent_ids) <> cardinality(p_parent_person_ids)
    or cardinality(p_parent_roles) <> cardinality(p_parent_person_ids)
    or cardinality(p_parent_relationship_types) <> cardinality(p_parent_person_ids) then
    v_result := jsonb_build_object(
      'status', 'BLOCKED_INVALID_REFERENCE',
      'operation_type', p_operation_type,
      'blocker_code', 'INVALID_PARENT_SET'
    );
    update public.admin_canonical_family_write_idempotency
    set status = 'blocked',
        result_summary = v_result,
        completed_at = timezone('utc', now()),
        updated_at = timezone('utc', now())
    where id = v_idempotency.id;
    return v_result;
  end if;

  select '{"parentIds":['
    || string_agg(to_json(parent_id::text)::text, ',' order by parent_id)
    || '],"relationshipPeriod":null,"unionIdentity":null,"version":1}'
  into v_serialized_identity
  from unnest(v_sorted_parent_ids) as parent_id;

  v_expected_canonical_key := 'canonical-family:v1:'
    || encode(digest(convert_to(v_serialized_identity, 'UTF8'), 'sha256'), 'hex');

  if p_canonical_key is distinct from v_expected_canonical_key then
    v_result := jsonb_build_object(
      'status', 'BLOCKED_INVALID_REFERENCE',
      'operation_type', p_operation_type,
      'blocker_code', 'CANONICAL_KEY_PARENT_SET_MISMATCH'
    );
    update public.admin_canonical_family_write_idempotency
    set status = 'blocked',
        result_summary = v_result,
        completed_at = timezone('utc', now()),
        updated_at = timezone('utc', now())
    where id = v_idempotency.id;
    return v_result;
  end if;

  if p_child_person_id = any(v_sorted_parent_ids) then
    v_result := jsonb_build_object(
      'status', 'BLOCKED_CYCLE',
      'operation_type', p_operation_type,
      'blocker_code', 'SELF_RELATIONSHIP_BLOCKED'
    );
    update public.admin_canonical_family_write_idempotency
    set status = 'blocked',
        result_summary = v_result,
        completed_at = timezone('utc', now()),
        updated_at = timezone('utc', now())
    where id = v_idempotency.id;
    return v_result;
  end if;

  perform 1
  from public.people person_lock
  where person_lock.id in (
    select unnest(v_sorted_parent_ids)
    union all
    select p_child_person_id
  )
    and person_lock.deleted_at is null
  order by person_lock.id
  for update;

  if (
    select count(*)
    from public.people existing_people
    where existing_people.id in (
      select unnest(v_sorted_parent_ids)
      union all
      select p_child_person_id
    )
      and existing_people.deleted_at is null
  ) <> cardinality(v_sorted_parent_ids) + 1 then
    v_result := jsonb_build_object(
      'status', 'BLOCKED_INVALID_REFERENCE',
      'operation_type', p_operation_type,
      'blocker_code', 'PERSON_REFERENCE_MISSING_OR_INACTIVE'
    );
    update public.admin_canonical_family_write_idempotency
    set status = 'blocked',
        result_summary = v_result,
        completed_at = timezone('utc', now()),
        updated_at = timezone('utc', now())
    where id = v_idempotency.id;
    return v_result;
  end if;

  if exists (
    select 1
    from public.family_parents existing_parent
    join public.family_children existing_child
      on existing_child.family_id = existing_parent.family_id
     and existing_child.deleted_at is null
    where existing_parent.deleted_at is null
      and existing_parent.person_id = p_child_person_id
      and existing_child.person_id = any(v_sorted_parent_ids)
  ) then
    v_result := jsonb_build_object(
      'status', 'BLOCKED_CYCLE',
      'operation_type', p_operation_type,
      'blocker_code', 'DIRECT_ANCESTRY_CYCLE'
    );
    update public.admin_canonical_family_write_idempotency
    set status = 'blocked',
        result_summary = v_result,
        completed_at = timezone('utc', now()),
        updated_at = timezone('utc', now())
    where id = v_idempotency.id;
    return v_result;
  end if;

  if p_family_action = 'REUSE' then
    if p_target_family_id is null then
      v_result := jsonb_build_object(
        'status', 'BLOCKED_INVALID_REFERENCE',
        'operation_type', p_operation_type,
        'blocker_code', 'TARGET_FAMILY_REQUIRED'
      );
      update public.admin_canonical_family_write_idempotency
      set status = 'blocked',
          result_summary = v_result,
          completed_at = timezone('utc', now()),
          updated_at = timezone('utc', now())
      where id = v_idempotency.id;
      return v_result;
    end if;

    select *
    into v_family
    from public.families
    where id = p_target_family_id
    for update;

    if not found
      or v_family.deleted_at is not null
      or v_family.canonical_status in ('merged', 'voided')
      or (
        p_expected_family_updated_at is not null
        and v_family.updated_at is distinct from p_expected_family_updated_at
      ) then
      v_result := jsonb_build_object(
        'status', 'BLOCKED_CONCURRENT_MODIFICATION',
        'operation_type', p_operation_type,
        'blocker_code', 'CANONICAL_FAMILY_TARGET_NOT_REUSABLE'
      );
      update public.admin_canonical_family_write_idempotency
      set status = 'blocked',
          result_summary = v_result,
          completed_at = timezone('utc', now()),
          updated_at = timezone('utc', now())
      where id = v_idempotency.id;
      return v_result;
    end if;

    if v_family.canonical_key is not null
      and v_family.canonical_key is distinct from p_canonical_key then
      v_result := jsonb_build_object(
        'status', 'BLOCKED_CONCURRENT_MODIFICATION',
        'operation_type', p_operation_type,
        'blocker_code', 'CANONICAL_FAMILY_CONCURRENT_MODIFICATION'
      );
      update public.admin_canonical_family_write_idempotency
      set status = 'blocked',
          result_summary = v_result,
          completed_at = timezone('utc', now()),
          updated_at = timezone('utc', now())
      where id = v_idempotency.id;
      return v_result;
    end if;

    if v_family.canonical_key is null and not p_allow_canonical_metadata_update then
      v_result := jsonb_build_object(
        'status', 'BLOCKED_AMBIGUOUS',
        'operation_type', p_operation_type,
        'blocker_code', 'CANONICAL_METADATA_UPDATE_NOT_AUTHORIZED'
      );
      update public.admin_canonical_family_write_idempotency
      set status = 'blocked',
          result_summary = v_result,
          completed_at = timezone('utc', now()),
          updated_at = timezone('utc', now())
      where id = v_idempotency.id;
      return v_result;
    end if;

    if v_family.canonical_key is null then
      v_family_before := to_jsonb(v_family);
      update public.families
      set canonical_key = p_canonical_key,
          canonical_status = 'canonical',
          canonicalized_at = timezone('utc', now()),
          canonicalized_by = v_profile_id,
          updated_by = v_profile_id
      where id = v_family.id
      returning * into v_family;

      insert into public.revisions (
        entity_type,
        entity_id,
        action,
        before_json,
        after_json,
        changed_by,
        change_reason
      )
      values (
        'families',
        v_family.id,
        'update',
        null,
        jsonb_build_object(
          'source', 'A-17N-TX1 admin canonical family transaction executor',
          'family_id', v_family.id,
          'canonical_identity_version', p_canonical_identity_version,
          'idempotency_key', p_idempotency_key,
          'mutation_plan_hash', lower(p_mutation_plan_hash),
          'before_parent_membership_count', null,
          'after_parent_membership_count', null,
          'before_child_membership_count', null,
          'after_child_membership_count', null
        ),
        v_profile_id,
        'A-17N-TX1 admin canonical family transaction executor'
      )
      returning id into v_audit_record_id;
    end if;
  else
    insert into public.families (
      family_label,
      visibility,
      canonical_key,
      canonical_status,
      canonicalized_at,
      canonicalized_by,
      created_by,
      updated_by
    )
    values (
      'Canonical family created from admin parent/child write',
      'family',
      p_canonical_key,
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
    else
      select *
      into v_family
      from public.families
      where canonical_key = p_canonical_key
        and canonical_status = 'canonical'
        and deleted_at is null
      for update;
    end if;

    if not found or v_family.canonical_status <> 'canonical' then
      v_result := jsonb_build_object(
        'status', 'BLOCKED_CONCURRENT_MODIFICATION',
        'operation_type', p_operation_type,
        'blocker_code', 'CANONICAL_FAMILY_CONCURRENT_MODIFICATION'
      );
      update public.admin_canonical_family_write_idempotency
      set status = 'blocked',
          result_summary = v_result,
          completed_at = timezone('utc', now()),
          updated_at = timezone('utc', now())
      where id = v_idempotency.id;
      return v_result;
    end if;

    if v_family_created then
      insert into public.revisions (
        entity_type,
        entity_id,
        action,
        before_json,
        after_json,
        changed_by,
        change_reason
      )
      values (
        'families',
        v_family.id,
        'create',
        null,
        jsonb_build_object(
          'source', 'A-17N-TX1 admin canonical family transaction executor',
          'family_id', v_family.id,
          'family_created', true,
          'canonical_identity_version', p_canonical_identity_version,
          'idempotency_key', p_idempotency_key,
          'mutation_plan_hash', lower(p_mutation_plan_hash)
        ),
        v_profile_id,
        'A-17N-TX1 admin canonical family transaction executor'
      )
      returning id into v_audit_record_id;
    end if;
  end if;

  select count(*)
  into v_duplicate_family_count
  from (
    select fp.family_id
    from public.family_parents fp
    join public.families f on f.id = fp.family_id
    where fp.deleted_at is null
      and f.deleted_at is null
      and f.id <> v_family.id
      and coalesce(f.canonical_status, 'legacy_unreviewed') not in ('merged', 'voided')
    group by fp.family_id
    having array_agg(fp.person_id order by fp.person_id) = v_sorted_parent_ids
  ) duplicate_parent_sets;

  if v_duplicate_family_count > 0 then
    v_result := jsonb_build_object(
      'status', 'BLOCKED_AMBIGUOUS',
      'operation_type', p_operation_type,
      'family_id', v_family.id,
      'blocker_code', 'CANONICAL_FAMILY_LEGACY_DUPLICATE_REVIEW_REQUIRED'
    );
    update public.admin_canonical_family_write_idempotency
    set status = 'blocked',
        result_summary = v_result,
        completed_at = timezone('utc', now()),
        updated_at = timezone('utc', now())
    where id = v_idempotency.id;
    return v_result;
  end if;

  perform 1
  from public.family_parents fp
  where fp.family_id = v_family.id
    and fp.deleted_at is null
  order by fp.person_id
  for update;

  perform 1
  from public.family_children fc
  where fc.family_id = v_family.id
    and fc.deleted_at is null
  order by fc.person_id
  for update;

  select count(*)
  into v_parent_count_before
  from public.family_parents
  where family_id = v_family.id
    and deleted_at is null;

  select count(*)
  into v_child_count_before
  from public.family_children
  where family_id = v_family.id
    and deleted_at is null;

  for v_parent_index in 1..cardinality(p_parent_person_ids) loop
    v_parent_id := p_parent_person_ids[v_parent_index];
    v_parent_role := p_parent_roles[v_parent_index];
    v_parent_relationship_type := p_parent_relationship_types[v_parent_index];

    if v_parent_role not in ('father', 'mother', 'parent', 'unknown')
      or v_parent_relationship_type not in ('biological', 'adoptive', 'step', 'guardian', 'unknown') then
      v_result := jsonb_build_object(
        'status', 'BLOCKED_INVALID_REFERENCE',
        'operation_type', p_operation_type,
        'family_id', v_family.id,
        'blocker_code', 'INVALID_PARENT_ROLE_OR_TYPE'
      );
      update public.admin_canonical_family_write_idempotency
      set status = 'blocked',
          result_summary = v_result,
          completed_at = timezone('utc', now()),
          updated_at = timezone('utc', now())
      where id = v_idempotency.id;
      return v_result;
    end if;

    insert into public.family_parents (
      family_id,
      person_id,
      parent_role,
      relationship_type,
      created_by,
      updated_by
    )
    values (
      v_family.id,
      v_parent_id,
      v_parent_role,
      v_parent_relationship_type,
      v_profile_id,
      v_profile_id
    )
    on conflict (family_id, person_id)
      where deleted_at is null
    do nothing
    returning id into v_parent_membership_id;

    if found then
      v_parent_membership_created := true;
      insert into public.revisions (
        entity_type,
        entity_id,
        action,
        before_json,
        after_json,
        changed_by,
        change_reason
      )
      values (
        'family_parents',
        v_parent_membership_id,
        'create',
        null,
        jsonb_build_object(
          'source', 'A-17N-TX1 admin canonical family transaction executor',
          'family_id', v_family.id,
          'canonical_identity_version', p_canonical_identity_version,
          'idempotency_key', p_idempotency_key,
          'mutation_plan_hash', lower(p_mutation_plan_hash)
        ),
        v_profile_id,
        'A-17N-TX1 admin canonical family transaction executor'
      );
    end if;
  end loop;

  if p_child_relationship_type not in ('biological', 'adoptive', 'step', 'foster', 'unknown') then
    v_result := jsonb_build_object(
      'status', 'BLOCKED_INVALID_REFERENCE',
      'operation_type', p_operation_type,
      'family_id', v_family.id,
      'blocker_code', 'INVALID_CHILD_RELATIONSHIP_TYPE'
    );
    update public.admin_canonical_family_write_idempotency
    set status = 'blocked',
        result_summary = v_result,
        completed_at = timezone('utc', now()),
        updated_at = timezone('utc', now())
    where id = v_idempotency.id;
    return v_result;
  end if;

  select child_relationship_type
  into v_existing_child_relationship
  from public.family_children
  where family_id = v_family.id
    and person_id = p_child_person_id
    and deleted_at is null
  for update;

  if found and v_existing_child_relationship is distinct from p_child_relationship_type then
    v_result := jsonb_build_object(
      'status', 'BLOCKED_AMBIGUOUS',
      'operation_type', p_operation_type,
      'family_id', v_family.id,
      'blocker_code', 'CONFLICTING_CHILD_RELATIONSHIP_TYPE'
    );
    update public.admin_canonical_family_write_idempotency
    set status = 'blocked',
        result_summary = v_result,
        completed_at = timezone('utc', now()),
        updated_at = timezone('utc', now())
    where id = v_idempotency.id;
    return v_result;
  end if;

  insert into public.family_children (
    family_id,
    person_id,
    child_relationship_type,
    created_by,
    updated_by
  )
  values (
    v_family.id,
    p_child_person_id,
    p_child_relationship_type,
    v_profile_id,
    v_profile_id
  )
  on conflict (family_id, person_id)
    where deleted_at is null
  do nothing
  returning id into v_child_membership_id;

  if found then
    v_child_membership_created := true;
    insert into public.revisions (
      entity_type,
      entity_id,
      action,
      before_json,
      after_json,
      changed_by,
      change_reason
    )
    values (
      'family_children',
      v_child_membership_id,
      'create',
      null,
      jsonb_build_object(
        'source', 'A-17N-TX1 admin canonical family transaction executor',
        'family_id', v_family.id,
        'canonical_identity_version', p_canonical_identity_version,
        'idempotency_key', p_idempotency_key,
        'mutation_plan_hash', lower(p_mutation_plan_hash)
      ),
      v_profile_id,
      'A-17N-TX1 admin canonical family transaction executor'
    );
  end if;

  select count(*)
  into v_parent_count_after
  from public.family_parents
  where family_id = v_family.id
    and deleted_at is null;

  select count(*)
  into v_child_count_after
  from public.family_children
  where family_id = v_family.id
    and deleted_at is null;

  v_result := jsonb_build_object(
    'status',
      case
        when p_operation_type = 'ADD_PARENT' and not v_parent_membership_created
          then 'PARENT_LINK_ALREADY_EXISTS'
        when p_operation_type = 'ADD_CHILD' and not v_child_membership_created
          then 'CHILD_LINK_ALREADY_EXISTS'
        when p_operation_type = 'ADD_PARENT'
          then 'PARENT_LINK_CREATED'
        else 'CHILD_LINK_CREATED'
      end,
    'operation_type', p_operation_type,
    'family_id', v_family.id,
    'family_created', v_family_created,
    'parent_membership_created', v_parent_membership_created,
    'child_membership_created', v_child_membership_created,
    'idempotent_replay', false,
    'audit_record_id', v_audit_record_id,
    'blocker_code', null,
    'canonical_identity_version', p_canonical_identity_version,
    'parent_membership_count_before', v_parent_count_before,
    'parent_membership_count_after', v_parent_count_after,
    'child_membership_count_before', v_child_count_before,
    'child_membership_count_after', v_child_count_after
  );

  update public.admin_canonical_family_write_idempotency
  set status = 'completed',
      result_summary = v_result,
      completed_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
  where id = v_idempotency.id;

  return v_result;
end;
$$;

comment on function public.execute_admin_canonical_family_parent_child_write(
  text,
  text,
  uuid,
  text,
  uuid,
  timestamptz,
  boolean,
  text,
  integer,
  uuid[],
  text[],
  text[],
  uuid,
  text,
  text,
  text
) is
  'A-17N-TX1 candidate: SECURITY INVOKER transaction executor for validated admin canonical family ADD_PARENT/ADD_CHILD plans only. Not applied until owner review.';

revoke execute on function public.execute_admin_canonical_family_parent_child_write(
  text,
  text,
  uuid,
  text,
  uuid,
  timestamptz,
  boolean,
  text,
  integer,
  uuid[],
  text[],
  text[],
  uuid,
  text,
  text,
  text
) from public;

revoke execute on function public.execute_admin_canonical_family_parent_child_write(
  text,
  text,
  uuid,
  text,
  uuid,
  timestamptz,
  boolean,
  text,
  integer,
  uuid[],
  text[],
  text[],
  uuid,
  text,
  text,
  text
) from anon;

grant execute on function public.execute_admin_canonical_family_parent_child_write(
  text,
  text,
  uuid,
  text,
  uuid,
  timestamptz,
  boolean,
  text,
  integer,
  uuid[],
  text[],
  text[],
  uuid,
  text,
  text,
  text
) to authenticated;
