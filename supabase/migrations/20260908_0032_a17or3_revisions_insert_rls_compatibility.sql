-- A17O-R3_REVISIONS_INSERT_RLS_COMPATIBILITY
-- SQL_CANDIDATE_STATUS=NOT_APPLIED
-- OWNER_MANUAL_REVIEW_REQUIRED
-- SQL_EXECUTED_BY_CODEX=NO; MIGRATION_APPLIED=NO.
--
-- Adds only the authenticated INSERT policy required by the existing
-- SECURITY INVOKER A17O grouped-import executor's four exact revision shapes.
-- It preserves the A16BR policy, RLS state, existing grants, and anon/PUBLIC
-- denial. It does not invoke the executor or mutate business data.

create policy a17or3_revisions_insert_grouped_official_import
on public.revisions
for insert
to authenticated
with check (
  public.has_permission('imports.create')
  and public.has_permission('permissions.manage')
  and changed_by = public.current_profile_id()
  and before_json is null
  and change_reason = 'A-17O-TX1 grouped official import transaction executor'
  and jsonb_typeof(after_json) = 'object'
  and after_json ->> 'source' = 'A-17O-TX1 grouped official import transaction executor'
  and jsonb_typeof(after_json -> 'import_session_id') = 'string'
  and (after_json ->> 'import_session_id') ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  and jsonb_typeof(after_json -> 'executor_contract_version') = 'number'
  and after_json ->> 'executor_contract_version' = '1'
  and jsonb_typeof(after_json -> 'mutation_plan_hash') = 'string'
  and after_json ->> 'mutation_plan_hash' ~ '^[a-f0-9]{64}$'
  and exists (
    select 1
    from public.import_sessions owned_session
    where owned_session.id::text = after_json ->> 'import_session_id'
      and owned_session.created_by = public.current_profile_id()
      and owned_session.approved_by = public.current_profile_id()
      and owned_session.approved_at is not null
      and nullif(btrim(owned_session.approval_marker), '') is not null
      and nullif(btrim(owned_session.preview_manifest_hash), '') is not null
      and owned_session.status = 'owner_approved_for_db_write'
      and (
        select count(*)
        from public.import_write_manifests eligible_manifest
        where eligible_manifest.import_session_id = owned_session.id
          and eligible_manifest.status in ('owner_approved', 'ready_for_apply')
          and eligible_manifest.approved_by = public.current_profile_id()
          and eligible_manifest.approved_at is not null
          and nullif(btrim(eligible_manifest.approval_marker), '') is not null
          and nullif(btrim(eligible_manifest.manifest_hash), '') is not null
          and eligible_manifest.approval_marker = owned_session.approval_marker
          and eligible_manifest.manifest_hash = owned_session.preview_manifest_hash
      ) = 1
  )
  and (
    (
      entity_type = 'people'
      and action = 'create'
      and public.has_permission('people.create')
      and after_json ?& array['source', 'import_session_id', 'executor_contract_version', 'mutation_plan_hash', 'source_row_index']
      and (select count(*) from jsonb_object_keys(after_json)) = 5
      and jsonb_typeof(after_json -> 'source_row_index') = 'number'
      and after_json ->> 'source_row_index' ~ '^(0|[1-9][0-9]*)$'
      and exists (
        select 1
        from public.people target_person
        where target_person.id = entity_id
          and target_person.created_by = public.current_profile_id()
          and target_person.deleted_at is null
      )
    )
    or (
      entity_type = 'families'
      and action in ('create', 'update')
      and public.has_permission('relationships.create')
      and after_json ?& array['source', 'import_session_id', 'executor_contract_version', 'mutation_plan_hash', 'group_key_hash', 'family_created', 'family_reused']
      and (select count(*) from jsonb_object_keys(after_json)) = 7
      and jsonb_typeof(after_json -> 'group_key_hash') = 'string'
      and after_json ->> 'group_key_hash' ~ '^[a-f0-9]{64}$'
      and jsonb_typeof(after_json -> 'family_created') = 'boolean'
      and jsonb_typeof(after_json -> 'family_reused') = 'boolean'
      and (
        (action = 'create' and after_json ->> 'family_created' = 'true' and after_json ->> 'family_reused' = 'false')
        or (action = 'update' and after_json ->> 'family_created' = 'false' and after_json ->> 'family_reused' = 'true')
      )
      and exists (
        select 1
        from public.families target_family
        where target_family.id = entity_id
          and target_family.deleted_at is null
          and (
            action = 'update'
            or target_family.created_by = public.current_profile_id()
          )
      )
    )
    or (
      entity_type = 'family_parents'
      and action = 'create'
      and public.has_permission('relationships.create')
      and after_json ?& array['source', 'import_session_id', 'executor_contract_version', 'mutation_plan_hash', 'created_by_execution']
      and (select count(*) from jsonb_object_keys(after_json)) = 5
      and jsonb_typeof(after_json -> 'created_by_execution') = 'boolean'
      and after_json ->> 'created_by_execution' = 'true'
      and exists (
        select 1
        from public.family_parents target_parent
        where target_parent.id = entity_id
          and target_parent.created_by = public.current_profile_id()
          and target_parent.deleted_at is null
      )
    )
    or (
      entity_type = 'family_children'
      and action = 'create'
      and public.has_permission('relationships.create')
      and after_json ?& array['source', 'import_session_id', 'executor_contract_version', 'mutation_plan_hash', 'created_by_execution']
      and (select count(*) from jsonb_object_keys(after_json)) = 5
      and jsonb_typeof(after_json -> 'created_by_execution') = 'boolean'
      and after_json ->> 'created_by_execution' = 'true'
      and exists (
        select 1
        from public.family_children target_child
        where target_child.id = entity_id
          and target_child.created_by = public.current_profile_id()
          and target_child.deleted_at is null
      )
    )
  )
);

comment on policy a17or3_revisions_insert_grouped_official_import
on public.revisions is
  'A17O-R3: narrow authenticated INSERT policy for exact A17O grouped-import revision audit rows; preserves A16BR and all existing grants/RLS.';
