-- Phase 1 foundation for WEB GIA PHA.
-- RLS is enabled from the beginning. Policies are intentionally conservative
-- until auth flows and permission management screens are implemented.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text,
  email text,
  avatar_url text,
  status text not null default 'active' check (status in ('active', 'disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (role_id, permission_id)
);

create table if not exists public.profile_roles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  unique (profile_id, role_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.profiles
  where auth_user_id = auth.uid()
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

alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.profile_roles enable row level security;

drop policy if exists "profiles can read own profile" on public.profiles;
create policy "profiles can read own profile"
on public.profiles
for select
to authenticated
using (auth_user_id = auth.uid());

drop policy if exists "permission managers can read profiles" on public.profiles;
create policy "permission managers can read profiles"
on public.profiles
for select
to authenticated
using (public.has_permission('permissions.manage'));

drop policy if exists "authenticated can read role catalog" on public.roles;
create policy "authenticated can read role catalog"
on public.roles
for select
to authenticated
using (true);

drop policy if exists "authenticated can read permission catalog" on public.permissions;
create policy "authenticated can read permission catalog"
on public.permissions
for select
to authenticated
using (true);

drop policy if exists "permission managers can read role permissions" on public.role_permissions;
create policy "permission managers can read role permissions"
on public.role_permissions
for select
to authenticated
using (public.has_permission('permissions.manage'));

drop policy if exists "permission managers can read profile roles" on public.profile_roles;
create policy "permission managers can read profile roles"
on public.profile_roles
for select
to authenticated
using (public.has_permission('permissions.manage'));

insert into public.roles (code, name, description)
values
  ('OWNER', 'Owner', 'Full project owner.'),
  ('ADMIN', 'Admin', 'Administrative access.'),
  ('EDITOR', 'Editor', 'Can edit approved family data.'),
  ('CONTRIBUTOR', 'Contributor', 'Can contribute family data for review.'),
  ('FAMILY_VIEWER', 'Family viewer', 'Can view internal family data.'),
  ('PUBLIC_VIEWER', 'Public viewer', 'Can view public data only.')
on conflict (code) do update
set name = excluded.name,
    description = excluded.description;

insert into public.permissions (code, name, description)
values
  ('people.view', 'View people', 'View permitted people records.'),
  ('people.create', 'Create people', 'Create people records.'),
  ('people.update', 'Update people', 'Update people records.'),
  ('people.delete', 'Delete people', 'Soft delete people records.'),
  ('people.restore', 'Restore people', 'Restore soft-deleted people records.'),
  ('relationships.view', 'View relationships', 'View permitted family relationships.'),
  ('relationships.create', 'Create relationships', 'Create family relationships.'),
  ('relationships.update', 'Update relationships', 'Update family relationships.'),
  ('relationships.delete', 'Delete relationships', 'Delete family relationships.'),
  ('tree.view', 'View tree', 'View the family tree.'),
  ('tree.edit_layout', 'Edit tree layout', 'Edit saved tree layouts.'),
  ('media.view', 'View media', 'View permitted media.'),
  ('media.upload', 'Upload media', 'Upload media.'),
  ('media.delete', 'Delete media', 'Delete media.'),
  ('revisions.view', 'View revisions', 'View revision history.'),
  ('revisions.restore', 'Restore revisions', 'Restore from revision history.'),
  ('exports.create', 'Create exports', 'Create export jobs.'),
  ('exports.download', 'Download exports', 'Download export files.'),
  ('imports.create', 'Create imports', 'Create import jobs.'),
  ('settings.manage', 'Manage settings', 'Manage system settings.'),
  ('permissions.manage', 'Manage permissions', 'Manage roles and permissions.')
on conflict (code) do update
set name = excluded.name,
    description = excluded.description;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.code in ('OWNER', 'ADMIN')
on conflict (role_id, permission_id) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.code in (
  'people.view',
  'people.create',
  'people.update',
  'relationships.view',
  'relationships.create',
  'relationships.update',
  'tree.view',
  'tree.edit_layout',
  'media.view',
  'media.upload',
  'revisions.view',
  'exports.create',
  'exports.download'
)
where r.code = 'EDITOR'
on conflict (role_id, permission_id) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.code in (
  'people.view',
  'people.create',
  'relationships.view',
  'tree.view',
  'media.view',
  'media.upload'
)
where r.code = 'CONTRIBUTOR'
on conflict (role_id, permission_id) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.code in (
  'people.view',
  'relationships.view',
  'tree.view',
  'media.view'
)
where r.code = 'FAMILY_VIEWER'
on conflict (role_id, permission_id) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.code in (
  'people.view',
  'tree.view'
)
where r.code = 'PUBLIC_VIEWER'
on conflict (role_id, permission_id) do nothing;
