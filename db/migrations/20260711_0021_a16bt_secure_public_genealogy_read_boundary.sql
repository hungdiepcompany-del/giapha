-- A16BT_SECURE_PUBLIC_GENEALOGY_READ_BOUNDARY
-- SQL_CANDIDATE_STATUS=NOT_APPLIED
-- DO_NOT_APPLY_WITHOUT_OWNER_APPROVAL
-- MIGRATION_0020_IMMUTABLE_SHA256=530129F27EAD748641C71D2C26718043D0B51639FC6104EFFC4B9D222550C0FC
-- NO_AUTHENTICATED_GRANT_CHANGE
-- NO_SERVICE_ROLE_CHANGE
-- NO_ANON_MUTATION_GRANT
-- NO_PUBLIC_SELECT_GRANT
-- NO_PUBLIC_MUTATION_GRANT
-- NO_RLS_DISABLE
-- NO_FORCE_RLS

revoke select on table public.people from anon;
revoke select on table public.people from public;

revoke select on table public.families from anon;
revoke select on table public.families from public;

revoke select on table public.family_parents from anon;
revoke select on table public.family_parents from public;

revoke select on table public.family_children from anon;
revoke select on table public.family_children from public;

grant select (
  id,
  slug,
  full_name,
  display_name,
  is_living,
  branch_name,
  generation_number,
  visibility,
  deleted_at
) on table public.people to anon;

grant select (
  id,
  family_code,
  family_label,
  visibility,
  deleted_at
) on table public.families to anon;

grant select (
  id,
  family_id,
  person_id,
  parent_role,
  deleted_at
) on table public.family_parents to anon;

grant select (
  id,
  family_id,
  person_id,
  child_relationship_type,
  deleted_at
) on table public.family_children to anon;

drop policy if exists a16bt_public_people_select_active_public
  on public.people;
drop policy if exists a16bt_public_families_select_active_public
  on public.families;
drop policy if exists a16bt_public_family_parents_select_active_public_edges
  on public.family_parents;
drop policy if exists a16bt_public_family_children_select_active_public_edges
  on public.family_children;

create policy a16bt_public_people_select_active_public
on public.people
for select
to anon
using (
  deleted_at is null
  and visibility = 'public'
);

create policy a16bt_public_families_select_active_public
on public.families
for select
to anon
using (
  deleted_at is null
  and visibility = 'public'
);

create policy a16bt_public_family_parents_select_active_public_edges
on public.family_parents
for select
to anon
using (
  deleted_at is null
  and exists (
    select 1
    from public.families public_family
    where public_family.id = family_parents.family_id
      and public_family.deleted_at is null
      and public_family.visibility = 'public'
  )
  and exists (
    select 1
    from public.people public_person
    where public_person.id = family_parents.person_id
      and public_person.deleted_at is null
      and public_person.visibility = 'public'
  )
);

create policy a16bt_public_family_children_select_active_public_edges
on public.family_children
for select
to anon
using (
  deleted_at is null
  and exists (
    select 1
    from public.families public_family
    where public_family.id = family_children.family_id
      and public_family.deleted_at is null
      and public_family.visibility = 'public'
  )
  and exists (
    select 1
    from public.people public_person
    where public_person.id = family_children.person_id
      and public_person.deleted_at is null
      and public_person.visibility = 'public'
  )
);

comment on policy a16bt_public_people_select_active_public
on public.people is
  'A-16BT candidate: anon can read only active public people through column-level grants.';

comment on policy a16bt_public_families_select_active_public
on public.families is
  'A-16BT candidate: anon can read only active public families through column-level grants.';

comment on policy a16bt_public_family_parents_select_active_public_edges
on public.family_parents is
  'A-16BT candidate: anon can read only active parent edges whose family and person are both active public rows.';

comment on policy a16bt_public_family_children_select_active_public_edges
on public.family_children is
  'A-16BT candidate: anon can read only active child edges whose family and person are both active public rows.';
