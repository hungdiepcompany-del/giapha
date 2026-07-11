# A-16BR - Revisions INSERT RLS and anon grant cleanup

Status:
`A16BR_STATUS=CANDIDATE_READY_NOT_APPLIED_OWNER_REVIEW_REQUIRED`.

A-16R retry:
`A16R_IMPORT_RETRY_NEXT=NO`.

SQL execution:
`A16BR_SQL_APPLIED=NO`.

Production evidence recorded from A-16BQ:

- `missing_authenticated_required_privilege_count=0`
- `forbidden_anon_public_table_grant_count=56`
- `forbidden_anon_public_policy_count=0`
- `revisions_supports_rpc_insert=false`
- `official_import_batches_supports_rpc_update_lifecycle=false`
- `A16BR_OFFICIAL_IMPORT_BATCH_UPDATE_STATUS=PASS_RUNTIME_COMPATIBLE`
- `A16BR_A16BQ_BATCH_LIFECYCLE_BOOLEAN=FALSE_NEGATIVE_CHECKER_TOO_STRICT`

## Candidate files

- `A16BR_MIGRATION_0020=db/migrations/20260711_0020_a16br_revisions_insert_rls_and_anon_grant_cleanup.sql`
- `A16BR_SUPABASE_MIRROR=supabase/migrations/20260711_0020_a16br_revisions_insert_rls_and_anon_grant_cleanup.sql`
- `A16BR_VERIFICATION_SQL=db/checks/20260711_check_a16br_revisions_insert_rls_and_anon_grant_cleanup.sql`
- `A16BR_MIRROR_MATCH=BYTE_FOR_BYTE_REQUIRED_BY_CHECKER`

## Immutable migrations

- `A16BR_MIGRATION_0018_IMMUTABLE_SHA256=7D62C16E201D452FD73B4E06C8F140361873C0C054A876EDDBFF28DD55FACC42`
- `A16BR_MIGRATION_0019_IMMUTABLE_SHA256=879A7472026683268A2343324D0CBA8EB6EE2E3E1D0A246CDE158478C0C38038`

Do not edit, rename, reformat or regenerate migrations 0018 or 0019.

## Revisions INSERT policy

`A16BR_REVISIONS_INSERT_BLOCKER=FIX_CANDIDATE_READY`.

The new policy is:
`A16BR_REVISIONS_INSERT_POLICY=a16br_revisions_insert_official_import_create`.

Scope:

- `FOR INSERT`
- `TO authenticated`
- `changed_by=public.current_profile_id()`
- `action='create'`
- `entity_type in ('people','families')`
- `imports.create` and `permissions.manage`
- `people.create` only when `entity_type='people'`
- `relationships.create` only when `entity_type='families'`
- `change_reason='A-16V official import candidate'`
- `after_json.source='A-16V Gia Pha 4 official import candidate'`
- valid `after_json.import_session_id`
- owned `import_sessions.id`
- session status in `ready_for_owner_approval` or `owner_approved_for_db_write`

Existing revisions SELECT policies are preserved:

- `revision viewers can read people revisions`
- `revision viewers can read relationship revisions`
- `revision viewers can read tree layout revisions`

No UPDATE or DELETE policy is added for `revisions`.

## Anonymous grant cleanup

Before:
`A16BR_ANON_GRANT_COUNT_BEFORE=56`.

Expected after owner apply:
`A16BR_ANON_GRANT_COUNT_EXPECTED_AFTER=0`.

Migration 0020 revokes all privileges from `anon` and `PUBLIC` only on:

- `public.families`
- `public.family_children`
- `public.family_parents`
- `public.people`
- `public.revisions`
- `public.import_session_warnings`
- `public.import_duplicate_candidates`
- `public.import_relationship_candidates`

It does not revoke or change authenticated grants, does not change service_role
privileges, does not disable RLS, does not FORCE RLS, and does not create
anon/PUBLIC policies.

## A-16BQ correction

`A16BR_OFFICIAL_IMPORT_BATCH_UPDATE_STATUS=PASS_RUNTIME_COMPATIBLE`.

`A16BR_A16BQ_BATCH_LIFECYCLE_BOOLEAN=FALSE_NEGATIVE_CHECKER_TOO_STRICT`.

The A-16BQ checker now treats the official_import_batches UPDATE policy as
compatible when the policy:

- exists for UPDATE;
- is scoped to authenticated;
- requires `imports.create`;
- scopes USING and WITH CHECK to the owned import session;
- requires `updated_by=current_profile_id()` in WITH CHECK.

It does not require the literal `completed` string. The RPC sets `updated_by` to
the current profile for both the `pending -> running` and `running -> completed`
updates, so the existing production policy is runtime-compatible.

## Safety

- `A16BR_SQL_EXECUTED_BY_CODEX=NO`
- `A16BR_SQL_APPLIED=NO`
- `A16BR_SUPABASE_DB_PUSH_RUN=NO`
- `A16BR_MIGRATION_REPAIR_RUN=NO`
- `A16BR_SEED_RUN=NO`
- `A16BR_POST_OFFICIAL_IMPORT_CALLED=NO`
- `A16BR_IMPORT_RPC_CALLED=NO`
- `A16BR_SESSION_OR_GENEALOGY_MUTATION=NO`
- `A16BR_DEPLOY_RUN=NO`
- `A16R_IMPORT_RETRY_NEXT=NO`

## Worker boundary

- Main Worker touched: NO
- Runtime dependency added: NO
- New service Worker created: NO
- OpenNext/Wrangler config changed: NO
- Worker size risk: NO
- Service boundary recommendation: NONE

## Next owner action

`A16BR_NEXT_OWNER_ACTION=REVIEW_MIGRATION_0020_THEN_SEPARATE_OWNER_SQL_APPLY_VERIFY_PHASE_NO_IMPORT_RETRY`.
