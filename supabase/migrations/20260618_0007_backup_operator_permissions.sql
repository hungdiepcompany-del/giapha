-- BACKUP_PERMISSION_REAL_MIGRATION_FILE
-- OWNER_APPROVED_FILE_CREATION_ONLY
-- DO_NOT_RUN_WITHOUT_SEPARATE_OWNER_APPROVAL
-- Creates backup operator permission metadata and role assignments only.
-- This file has been created for review; do not apply it until a separate
-- owner approval explicitly allows running migrations against the database.

begin;

insert into public.permissions (code, name, description)
values
  (
    'backup.operator.view',
    'View backup operator',
    'View the backup operator UI and panel.'
  ),
  (
    'backup.operator.dry_run',
    'Run backup dry-run',
    'Run the backup operator dry-run route.'
  ),
  (
    'backup.operator.execute',
    'Execute backup',
    'Reserved for future real backup execution; not enabled now.'
  ),
  (
    'backup.operator.restore',
    'Restore backup',
    'Reserved for future real restore execution; not enabled now.'
  )
on conflict (code) do update
set name = excluded.name,
    description = excluded.description;

with role_permission_candidates (role_code, permission_code) as (
  values
    ('OWNER', 'backup.operator.view'),
    ('OWNER', 'backup.operator.dry_run'),
    ('OWNER', 'backup.operator.execute'),
    ('OWNER', 'backup.operator.restore'),
    ('ADMIN', 'backup.operator.view'),
    ('ADMIN', 'backup.operator.dry_run')
)
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from role_permission_candidates rpc
join public.roles r on r.code = rpc.role_code
join public.permissions p on p.code = rpc.permission_code
on conflict (role_id, permission_id) do nothing;

commit;
