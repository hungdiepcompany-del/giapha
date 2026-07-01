-- A-16Q-DUP - Duplicate Candidate Owner Decision RLS Candidate
-- SQL_CANDIDATE_STATUS=NOT_APPLIED
-- OWNER_MANUAL_REVIEW_REQUIRED_BEFORE_APPLY
-- DO_NOT_RUN_SUPABASE_DB_PUSH
-- DO_NOT_RUN_SUPABASE_DB_PUSH_DRY_RUN_IN_THIS_PHASE
-- DO_NOT_RUN_SUPABASE_MIGRATION_REPAIR
-- NO_SEED_DATA
-- NO_OFFICIAL_IMPORT_EXECUTION
-- NO_PEOPLE_RELATIONSHIP_FAMILY_LAYOUT_REVISION_WRITE
-- NO_ANON_OR_PUBLIC_POLICY
-- NO_ANON_OR_PUBLIC_GRANT
-- This candidate opens only authenticated, owner-scoped staging review updates
-- for duplicate decision columns. It does not write real genealogy tables and
-- does not open official import execution.

alter table public.import_duplicate_candidates
  drop constraint if exists import_duplicate_candidates_owner_decision_check;

alter table public.import_duplicate_candidates
  add constraint import_duplicate_candidates_owner_decision_check check (
    owner_decision in (
      'unresolved',
      'create_new',
      'link_existing',
      'needs_review',
      'ignore_candidate',
      'hold',
      'skip'
    )
  );

revoke update on public.import_duplicate_candidates from authenticated;

grant update (
  owner_decision,
  decided_by,
  decided_at,
  decision_note
) on public.import_duplicate_candidates to authenticated;

drop policy if exists a16q_dup_duplicate_candidates_update_decision_own_session
  on public.import_duplicate_candidates;

create policy a16q_dup_duplicate_candidates_update_decision_own_session
  on public.import_duplicate_candidates
  for update
  to authenticated
  using (
    public.has_permission('imports.create')
    and exists (
      select 1
      from public.import_sessions owned_session
      where owned_session.id = import_duplicate_candidates.import_session_id
        and owned_session.created_by = public.current_profile_id()
        and owned_session.approved_by is null
        and owned_session.approved_at is null
        and owned_session.status in (
          'preview_generated',
          'owner_reviewing',
          'warnings_acknowledged',
          'duplicates_reviewed',
          'rejected_needs_fix'
        )
    )
  )
  with check (
    public.has_permission('imports.create')
    and (decided_by is null or decided_by = public.current_profile_id())
    and (
      owner_decision <> 'link_existing'
      or existing_person_id is not null
    )
    and exists (
      select 1
      from public.import_sessions owned_session
      where owned_session.id = import_duplicate_candidates.import_session_id
        and owned_session.created_by = public.current_profile_id()
        and owned_session.approved_by is null
        and owned_session.approved_at is null
        and owned_session.status in (
          'preview_generated',
          'owner_reviewing',
          'warnings_acknowledged',
          'duplicates_reviewed',
          'rejected_needs_fix'
        )
    )
  );

comment on policy a16q_dup_duplicate_candidates_update_decision_own_session
  on public.import_duplicate_candidates is
  'A-16Q-DUP not-applied candidate. Allows owner-scoped staging duplicate decision update only; no official import and no real genealogy write.';
