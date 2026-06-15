-- Manual OWNER bootstrap snippet for WEB GIA PHA.
-- Review the email literal below before running this snippet.
-- Run only from a trusted SQL console/admin context after verifying identity.

with target_profile as (
  select id
  from public.profiles
  where lower(email) = lower('hungdiepcompany@gmail.com')
  limit 1
),
owner_role as (
  select id
  from public.roles
  where code = 'OWNER'
  limit 1
)
insert into public.profile_roles (profile_id, role_id)
select target_profile.id, owner_role.id
from target_profile
cross join owner_role
on conflict (profile_id, role_id) do nothing;
