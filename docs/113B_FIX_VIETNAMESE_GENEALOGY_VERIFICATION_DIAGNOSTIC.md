# Phase 113B-fix - Vietnamese Genealogy Verification Diagnostic

Status: `NOT_VERIFIED`

Current verification status: `NOT_VERIFIED`

## Summary

Phase 113B-fix records why Vietnamese genealogy post-apply verification cannot be marked PASS yet.

The owner-provided PowerShell verifier output showed `FAIL` for all four required lineage tables through the REST-only verifier:

- `clans`
- `clan_branches`
- `generation_rules`
- `person_branch_memberships`

The same output did not verify RLS, policies, no seed/backfill row counts, or existing core table safety. Therefore DB verification PASS cannot be recorded.

## Why PASS Cannot Be Recorded

PASS requires evidence for all of the following:

- Required tables exist.
- RLS is enabled for all four lineage tables.
- Policies exist for all four lineage tables.
- Excluded tables do not exist.
- The four new lineage tables have no seed/backfill rows unless the owner manually inserted data separately.
- Existing core tables still exist.

The current evidence does not prove these points. It only proves that the REST-only verifier could not read the required tables and that RLS/policy metadata was not verified by that verifier.

## Security Note

Service role key material was exposed in chat during the owner-operated PowerShell verification attempt.

Before any further credential-assisted verification, the owner must rotate or revoke the exposed Supabase service role key in Supabase. Future prompts and outputs must never include the service role key or any credential value.

## Diagnostic Hypothesis

The current FAIL can mean one or more of:

- `migration_not_applied`: the Phase 111 migration was not actually applied to the target project.
- `wrong_project_ref`: the verification env points to a different Supabase project than `frkyeuxrlcflmsxxsolp`.
- `rest_metadata_not_available`: PostgREST schema cache or REST exposure does not include these tables yet.
- `insufficient_metadata_access`: the REST path cannot access the required table or metadata even though SQL metadata might show the table exists.
- `insufficient_verifier_design`: the REST-only verifier cannot prove RLS and policy metadata and cannot distinguish all failure modes.

## Manual Supabase Dashboard SQL Checks

Run these read-only SQL statements in Supabase SQL Editor for project `frkyeuxrlcflmsxxsolp` after rotating the exposed service role key.

### A. Required Tables Exist

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'clans',
    'clan_branches',
    'generation_rules',
    'person_branch_memberships'
  )
order by table_name;
```

Expected: 4 rows.

### B. Excluded Tables Do Not Exist

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'person_names',
    'person_life_events',
    'person_burials',
    'person_media'
  )
order by table_name;
```

Expected: 0 rows.

### C. Existing Core Tables Still Exist

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'people',
    'families',
    'family_parents',
    'family_children',
    'couple_relationships'
  )
order by table_name;
```

Expected: 5 rows.

### D. RLS Enabled

```sql
select relname as table_name, relrowsecurity as rls_enabled
from pg_class
where relnamespace = 'public'::regnamespace
  and relname in (
    'clans',
    'clan_branches',
    'generation_rules',
    'person_branch_memberships'
  )
order by relname;
```

Expected: 4 rows, all `rls_enabled = true`.

### E. Policies Exist

```sql
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename in (
    'clans',
    'clan_branches',
    'generation_rules',
    'person_branch_memberships'
  )
order by tablename, policyname;
```

Expected: policies exist for all 4 tables.

### F. No Seed/Backfill Rows

```sql
select 'clans' as table_name, count(*) as row_count from public.clans
union all
select 'clan_branches', count(*) from public.clan_branches
union all
select 'generation_rules', count(*) from public.generation_rules
union all
select 'person_branch_memberships', count(*) from public.person_branch_memberships;
```

Expected: 4 rows, each with `row_count = 0`, unless owner manually inserted data.

## Read-Only Verification Strategy

Use a two-layer verification strategy:

- REST verifier: useful for checking whether expected tables are readable through PostgREST and whether the row counts are zero, but not sufficient for RLS and policy metadata.
- Supabase SQL Editor read-only checks: required for table existence, RLS, policies, excluded table absence and existing core table safety.

The verifier was hardened to distinguish:

- `verification_env_missing`
- `table_missing_or_not_in_rest_schema_cache`
- `rest_metadata_not_available`
- `insufficient_metadata_access`
- `wrong_project_ref`
- `verification_incomplete`

The verifier must not claim RLS or policy PASS unless verified through reliable read-only metadata.

## What Evidence Is Required Before PASS

Before any PASS record, provide sanitized SQL output showing:

- Required table query returns exactly 4 expected rows.
- Excluded table query returns 0 rows.
- Existing core table query returns exactly 5 expected rows.
- RLS query returns 4 rows and all `rls_enabled = true`.
- Policy query returns policies for all 4 lineage tables.
- No seed/backfill query returns 0 row count for each of the four lineage tables unless owner explicitly explains manual inserted data.

Do not include credentials, auth headers, tokens or raw private data in the evidence.

## No-Go Conditions Before Phase 114-117

Do not start grouped Phase 114-117 while any of these remain true:

- Required tables are missing or not proven.
- RLS is not proven enabled.
- Policies are not proven present.
- Excluded tables are present or not proven absent.
- No seed/backfill row counts are not proven.
- Existing core table safety is not proven.
- The exposed service role key has not been rotated or revoked.

## Worker/Runtime Impact

- Main Worker touched: NO
- Runtime app code changed: NO
- UI changed: NO
- Runtime dependency added: NO
- New service Worker created: NO
- OpenNext/Wrangler config changed: NO
- Worker size risk introduced by Phase 113B-fix: NO
- Deploy run: NO

## Recommended Next Step

Owner rotates/revokes the exposed service role key, then runs the manual SQL diagnostic checklist in Supabase Dashboard for project `frkyeuxrlcflmsxxsolp`.

After that, provide sanitized SQL results for PASS recording.
