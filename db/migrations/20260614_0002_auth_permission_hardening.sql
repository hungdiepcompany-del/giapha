-- Phase 2 auth + permission hardening for WEB GIA PHA.
-- This migration keeps RLS enabled and adds narrow self-read/self-profile
-- policies. It does not open public access to sensitive tables.

alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.profile_roles enable row level security;

create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.id
  from public.profiles p
  where p.auth_user_id = auth.uid()
  limit 1
$$;

create or replace function public.has_permission(permission_code text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profile_roles pr
    join public.role_permissions rp on rp.role_id = pr.role_id
    join public.permissions p on p.id = rp.permission_id
    where pr.profile_id = public.current_profile_id()
      and p.code = permission_code
  )
$$;

drop policy if exists "profiles can insert own profile" on public.profiles;
create policy "profiles can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth_user_id = auth.uid());

drop policy if exists "profiles can update own profile" on public.profiles;
create policy "profiles can update own profile"
on public.profiles
for update
to authenticated
using (auth_user_id = auth.uid())
with check (auth_user_id = auth.uid());

drop policy if exists "profiles can read own profile roles" on public.profile_roles;
create policy "profiles can read own profile roles"
on public.profile_roles
for select
to authenticated
using (profile_id = public.current_profile_id());

drop policy if exists "profiles can read own role permissions" on public.role_permissions;
create policy "profiles can read own role permissions"
on public.role_permissions
for select
to authenticated
using (
  exists (
    select 1
    from public.profile_roles pr
    where pr.profile_id = public.current_profile_id()
      and pr.role_id = role_permissions.role_id
  )
);

drop policy if exists "permission managers can manage profile roles" on public.profile_roles;
create policy "permission managers can manage profile roles"
on public.profile_roles
for all
to authenticated
using (public.has_permission('permissions.manage'))
with check (public.has_permission('permissions.manage'));

drop policy if exists "permission managers can manage role permissions" on public.role_permissions;
create policy "permission managers can manage role permissions"
on public.role_permissions
for all
to authenticated
using (public.has_permission('permissions.manage'))
with check (public.has_permission('permissions.manage'));

drop policy if exists "permission managers can manage roles" on public.roles;
create policy "permission managers can manage roles"
on public.roles
for all
to authenticated
using (public.has_permission('permissions.manage'))
with check (public.has_permission('permissions.manage'));

drop policy if exists "permission managers can manage permissions" on public.permissions;
create policy "permission managers can manage permissions"
on public.permissions
for all
to authenticated
using (public.has_permission('permissions.manage'))
with check (public.has_permission('permissions.manage'));
