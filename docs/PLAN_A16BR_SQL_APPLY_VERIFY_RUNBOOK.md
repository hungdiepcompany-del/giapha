# A-16BR - SQL apply and verify runbook

Runbook status:
`A16BR_RUNBOOK_STATUS=OWNER_REVIEW_REQUIRED_NOT_APPLIED`.

Fix status:
`A16BR_FIX_STATUS=PUBLIC_READ_PATH_VERIFIED`.

Public read classification:
`A16BR_PUBLIC_READ_CLASSIFICATION=BLOCKED_PRESERVE_PUBLIC_ANON_SELECT`.

This runbook is documentation only. Codex did not run SQL, did not apply the
migration, did not run `supabase db push`, did not repair migrations, did not
seed, did not call the official-import RPC, did not call `POST /official-import`,
did not mutate session/genealogy data, did not deploy, and did not push.

## Owner approval marker

Do not apply migration 0020 unless the owner explicitly provides:

`APPROVE_A16BR_APPLY_REVISIONS_INSERT_RLS_AND_ANON_GRANT_CLEANUP`

## Files

- Candidate SQL: `db/migrations/20260711_0020_a16br_revisions_insert_rls_and_anon_grant_cleanup.sql`
- Supabase mirror: `supabase/migrations/20260711_0020_a16br_revisions_insert_rls_and_anon_grant_cleanup.sql`
- SELECT-only verification SQL: `db/checks/20260711_check_a16br_revisions_insert_rls_and_anon_grant_cleanup.sql`
- Superseded SHA: `0A7F69196C97071C7304E4D0CE28DA1C134E95AF3DEFA00C8958FC7971591CF0`
- Corrected SHA: `530129F27EAD748641C71D2C26718043D0B51639FC6104EFFC4B9D222550C0FC`

## Preconditions

- Migration 0018 remains SHA256 `7D62C16E201D452FD73B4E06C8F140361873C0C054A876EDDBFF28DD55FACC42`.
- Migration 0019 remains SHA256 `879A7472026683268A2343324D0CBA8EB6EE2E3E1D0A246CDE158478C0C38038`.
- The owner has reviewed migration 0020.
- The owner verifies the migration 0020 SHA is the corrected SHA above, not the
  superseded full-anon-revoke candidate.
- No A-16R retry is bundled into this apply phase.

## Apply boundary

- `A16BR_RUNBOOK_SUPABASE_DB_PUSH_ALLOWED=NO`
- `A16BR_RUNBOOK_MIGRATION_REPAIR_ALLOWED=NO`
- `A16BR_RUNBOOK_SEED_ALLOWED=NO`
- `A16BR_RUNBOOK_POST_OFFICIAL_IMPORT_ALLOWED=NO`
- `A16BR_RUNBOOK_IMPORT_RPC_ALLOWED=NO`
- `A16BR_RUNBOOK_A16R_RETRY_ALLOWED=NO`
- `A16BR_RUNBOOK_DEPLOY_ALLOWED=NO`

If approved, apply only the exact SQL content of migration 0020 through the
owner-controlled SQL path.

## Verification

After apply, run only:

`db/checks/20260711_check_a16br_revisions_insert_rls_and_anon_grant_cleanup.sql`

Expected final row:

`A16BR_EXPECTED_POST_APPLY_VERIFY=a16br_revisions_insert_rls_and_anon_grant_cleanup_verified_TRUE`

Expected counts:

- `forbidden_anon_mutation_grant_count=0`
- `forbidden_public_mutation_grant_count=0`
- `staging_and_revision_anon_grant_count=0`
- `missing_authenticated_required_privilege_count=0`
- `force_rls_table_count=0`

Expected booleans:

- `public_core_anon_select_contract=true`
- required public SELECT policies for `people`, `families`, `family_parents`,
  and `family_children` exist only for the verified public read path;
- no anon/PUBLIC write policies exist;
- existing revisions SELECT policies remain unchanged;
- new revisions INSERT policy exists;
- new revisions policy role is authenticated only;
- new revisions policy checks `changed_by=current_profile_id()`;
- new revisions policy limits action to create;
- new revisions policy limits entity types to people/families;
- new revisions policy checks `imports.create`;
- new revisions policy checks `permissions.manage`;
- new revisions policy checks people/relationship create by entity type;
- new revisions policy verifies owned `import_session_id`;
- official_import_batches UPDATE policy remains runtime-compatible without a
  literal `completed` check;
- RPC remains SECURITY INVOKER;
- no automatic import trigger exists.

## Public smoke plan

`A16BR_PUBLIC_PAGE_SMOKE_PLAN=RUN_AFTER_OWNER_APPLY_BEFORE_ANY_A16R_RETRY`.

After owner apply and SELECT-only verification, smoke the public pages before
any import retry:

- `/`
- `/tree`
- one known public person detail URL `/people/[slug]` selected from the public UI
- `/admin/preview/public` while authenticated as an admin

Stop if the public route smoke fails or if the verification SQL reports
`public_core_anon_select_contract=false`.

## Stop conditions

Stop and record a blocker if any boolean is false or any count is unexpected.
Do not continue into import execution or A-16R retry from this phase.

## Next phase

`A16BR_NEXT_PHASE_AFTER_APPLY_VERIFY=A16BS_OWNER_SELECT_ONLY_APPLY_VERIFY_EVIDENCE_NO_IMPORT_RETRY`
