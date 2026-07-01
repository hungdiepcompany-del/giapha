-- A-16Q-DUP SELECT-only verification for duplicate decision RLS candidate.
-- Run manually only after owner applies:
-- db/migrations/20260701_0013_a16q_dup_duplicate_decision_rls_candidate.sql
-- This file must not mutate data.

with policy_check as (
  select
    policyname,
    cmd,
    roles,
    qual,
    with_check
  from pg_policies
  where schemaname = 'public'
    and tablename = 'import_duplicate_candidates'
    and policyname = 'a16q_dup_duplicate_candidates_update_decision_own_session'
),
constraint_check as (
  select pg_get_constraintdef(oid) as definition
  from pg_constraint
  where conrelid = 'public.import_duplicate_candidates'::regclass
    and conname = 'import_duplicate_candidates_owner_decision_check'
),
column_grant_check as (
  select
    privilege_type,
    column_name,
    grantee
  from information_schema.column_privileges
  where table_schema = 'public'
    and table_name = 'import_duplicate_candidates'
    and grantee = 'authenticated'
    and privilege_type = 'UPDATE'
)
select
  exists (select 1 from policy_check where cmd = 'UPDATE') as update_policy_exists,
  exists (
    select 1 from policy_check
    where qual like '%imports.create%'
      and qual like '%current_profile_id%'
      and with_check like '%current_profile_id%'
  ) as owner_scoped_policy,
  exists (
    select 1 from constraint_check
    where definition like '%needs_review%'
      and definition like '%ignore_candidate%'
      and definition like '%link_existing%'
  ) as decision_constraint_supports_review_values,
  (
    select count(*)
    from column_grant_check
    where column_name in (
      'owner_decision',
      'decided_by',
      'decided_at',
      'decision_note'
    )
  ) as authenticated_update_column_grants,
  not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'import_duplicate_candidates'
      and (
        'public' = any(roles)
        or 'anon' = any(roles)
      )
  ) as no_public_or_anon_policy;
