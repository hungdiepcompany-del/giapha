-- Phase 8 export/backup foundation for WEB GIA PHA.
-- Export records are admin-only metadata. They do not open public access and
-- do not store exported file contents.

create table if not exists public.export_jobs (
  id uuid primary key default gen_random_uuid(),
  export_type text not null,
  status text not null default 'completed',
  file_name text,
  file_mime_type text,
  file_size_bytes bigint,
  checksum text,
  record_count integer,
  media_count integer,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  error_message text,
  metadata_json jsonb not null default '{}'::jsonb,
  constraint export_jobs_type_check check (
    export_type in (
      'family_json',
      'gedcom',
      'media_zip',
      'full_backup_zip',
      'manifest'
    )
  ),
  constraint export_jobs_status_check check (
    status in ('pending', 'running', 'completed', 'failed')
  )
);

create table if not exists public.backup_records (
  id uuid primary key default gen_random_uuid(),
  backup_type text not null,
  schema_version text not null,
  app_version text,
  file_name text,
  checksum text,
  people_count integer not null default 0,
  relationship_count integer not null default 0,
  media_count integer not null default 0,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  notes text,
  metadata_json jsonb not null default '{}'::jsonb,
  constraint backup_records_type_check check (
    backup_type in (
      'family_json',
      'gedcom',
      'media_zip',
      'full_backup_zip',
      'manifest'
    )
  )
);

create index if not exists export_jobs_created_at_idx
on public.export_jobs (created_at desc);

create index if not exists export_jobs_type_idx
on public.export_jobs (export_type, created_at desc);

create index if not exists backup_records_created_at_idx
on public.backup_records (created_at desc);

create index if not exists backup_records_type_idx
on public.backup_records (backup_type, created_at desc);

alter table public.export_jobs enable row level security;
alter table public.backup_records enable row level security;

drop policy if exists "export downloaders can read export jobs" on public.export_jobs;
create policy "export downloaders can read export jobs"
on public.export_jobs
for select
to authenticated
using (public.has_permission('exports.download'));

drop policy if exists "export creators can insert export jobs" on public.export_jobs;
create policy "export creators can insert export jobs"
on public.export_jobs
for insert
to authenticated
with check (public.has_permission('exports.create'));

drop policy if exists "export downloaders can read backup records" on public.backup_records;
create policy "export downloaders can read backup records"
on public.backup_records
for select
to authenticated
using (public.has_permission('exports.download'));

drop policy if exists "export creators can insert backup records" on public.backup_records;
create policy "export creators can insert backup records"
on public.backup_records
for insert
to authenticated
with check (public.has_permission('exports.create'));

insert into public.permissions (code, name, description)
values
  ('exports.create', 'Create exports', 'Create export jobs and backup metadata.'),
  ('exports.download', 'Download exports', 'Download export and backup files.'),
  ('imports.create', 'Create imports', 'Create import jobs after validation.')
on conflict (code) do update
set name = excluded.name,
    description = excluded.description;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.code in (
  'exports.create',
  'exports.download',
  'imports.create'
)
where r.code in ('OWNER', 'ADMIN')
on conflict (role_id, permission_id) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.code in (
  'exports.create',
  'exports.download'
)
where r.code = 'EDITOR'
on conflict (role_id, permission_id) do nothing;
