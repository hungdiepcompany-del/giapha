# A-16BT - SQL apply, verify and localhost smoke runbook

Runbook status:
`A16BT_RUNBOOK_STATUS=OWNER_REVIEW_REQUIRED_NOT_APPLIED`.

## 2026-07-11 - Owner acceptance of manual apply history gap

`A16BT_STATUS=PASS_OWNER_ACCEPTED_MANUAL_APPLY_HISTORY_GAP_DB_EFFECTS_VERIFIED`.

Owner marker received:
`OWNER_ACCEPT_A16BT_MANUAL_APPLY_HISTORY_GAP_DB_EFFECTS_VERIFIED`.

Codex reran the A-16BT SELECT-only verification after receiving the owner
acceptance marker. The database effects remain verified:

- `a16bt_secure_public_genealogy_read_boundary_verified=true`
- `broad_anon_table_select_grant_count=0`
- `broad_public_table_select_grant_count=0`
- `missing_required_anon_column_grant_count=0`
- `forbidden_private_column_anon_grant_count=0`
- `notes_private_anon_select_privilege=false`
- `forbidden_anon_mutation_grant_count=0`
- `forbidden_public_mutation_grant_count=0`
- `forbidden_anon_public_write_policy_count=0`
- `rls_enabled_table_count=4`
- `rls_disabled_table_count=0`
- `a16br_revisions_insert_policy_remains_unchanged=true`
- `rpc_remains_security_invoker=true`
- `no_automatic_import_trigger=true`

Metadata-only policy count:

- `a16bt_policy_count=4`

Accepted migration-state contract:

- `A16BT_MIGRATION_STATE_VERIFIED=OWNER_ACCEPTED_MANUAL_SQL_HISTORY_GAP_DB_EFFECTS_VERIFIED`
- `A16BT_MIGRATION_HISTORY_EXACT_ONCE=NOT_VERIFIABLE_HISTORY_TABLE_NOT_PRESENT_OWNER_ACCEPTED`
- `A16BT_MIGRATION_0021_APPLY_STATUS=OWNER_ACCEPTED_MANUAL_APPLY_DB_EFFECTS_PRESENT_CODEX_APPLY_NOT_EXECUTED`

No mutation SQL was run in this acceptance update. No production genealogy rows
were queried. No import RPC, no `POST /official-import`, no deploy and no push
were performed.

## 2026-07-11 - Owner-approved verification run result

`A16BT_STATUS=BLOCKED_MIGRATION_HISTORY_NOT_VERIFIABLE_DB_EFFECTS_VERIFIED`.

The prompt provided the owner approval marker
`APPROVE_A16BT_0021_PRODUCTION_APPLY_VERIFY_LOCALHOST_SMOKE`, but the local
tool escalation reviewer rejected the production mutation command for applying
`db/migrations/20260711_0021_a16bt_secure_public_genealogy_read_boundary.sql`.
Codex therefore did not execute the mutation apply command and did not attempt a
workaround.

Read-only Supabase verification then showed the A-16BT database effects are
already present and valid:

- `a16bt_secure_public_genealogy_read_boundary_verified=true`
- `broad_anon_table_select_grant_count=0`
- `broad_public_table_select_grant_count=0`
- `missing_required_anon_column_grant_count=0`
- `forbidden_private_column_anon_grant_count=0`
- `notes_private_anon_select_privilege=false`
- `forbidden_anon_mutation_grant_count=0`
- `forbidden_public_mutation_grant_count=0`
- `forbidden_anon_public_write_policy_count=0`
- `rls_enabled_table_count=4`
- `rls_disabled_table_count=0`
- `a16br_revisions_insert_policy_remains_unchanged=true`
- `rpc_remains_security_invoker=true`
- `no_automatic_import_trigger=true`

Additional metadata check:

- `a16bt_policy_count=4`
- `has_supabase_schema_migrations=false`

Because the Supabase migration-history table was not available, this run cannot
truthfully mark `A16BT_MIGRATION_STATE_VERIFIED=YES_RECORDED_EXACTLY_ONCE`.
The verified state is:
`A16BT_MIGRATION_STATE_VERIFIED=BLOCKED_SUPABASE_MIGRATION_HISTORY_TABLE_NOT_PRESENT`.

Localhost smoke used anonymous localhost requests against Next dev:

- `/`: HTTP 200, no private-field payload tokens found.
- `/tree`: HTTP 200, no private-field payload tokens found.
- `/people/[slug]`: `SAFE_SKIP_NO_PUBLIC_PERSON_LINK_IN_RENDERED_PUBLIC_ROUTES`;
  no arbitrary production genealogy-row query was used to discover a slug.
- `/admin/preview/public`: HTTP 200, no private-field payload tokens found.

Validation:

- `npm run check:a16bt-secure-public-genealogy-read-boundary`: PASS
- `npm run check:a16br-revisions-insert-rls-and-anon-grant-cleanup`: PASS
- `npm run check:a16bq-downstream-rpc-write-contract-read-only-verification`: PASS
- `npm run check:env:safe`: PASS
- `npm run check:migrations`: PASS
- `npm run typecheck`: PASS
- `npm run lint`: PASS
- `npm run build`: PASS after safe workspace-local `.next` cleanup for Windows
  `EPERM` on `D:\CODE\GIA PHẢ\.next\diagnostics\build-diagnostics.json`.

Original candidate-runbook note before the owner-approved continuation: Codex
did not run SQL, did not apply migration 0021, did not run `supabase db push`,
did not repair migrations, did not query production genealogy rows, did not call
the official-import RPC, did not call `POST /official-import`, did not deploy,
and did not push.

## Owner approval marker

Do not apply migration 0021 unless the owner explicitly provides:

`APPROVE_A16BT_APPLY_SECURE_PUBLIC_GENEALOGY_READ_BOUNDARY`

## Files

- Candidate SQL: `db/migrations/20260711_0021_a16bt_secure_public_genealogy_read_boundary.sql`
- Supabase mirror: `supabase/migrations/20260711_0021_a16bt_secure_public_genealogy_read_boundary.sql`
- SELECT-only verification SQL: `db/checks/20260711_check_a16bt_secure_public_genealogy_read_boundary.sql`

## Preconditions

- Migration 0018 remains SHA256 `7D62C16E201D452FD73B4E06C8F140361873C0C054A876EDDBFF28DD55FACC42`.
- Migration 0019 remains SHA256 `879A7472026683268A2343324D0CBA8EB6EE2E3E1D0A246CDE158478C0C38038`.
- Migration 0020 remains SHA256 `530129F27EAD748641C71D2C26718043D0B51639FC6104EFFC4B9D222550C0FC`.
- Migration 0021 remains SHA256 `A7277E8A682610447BEC8142564C1A94B5FDE1AB4726C76D7DDF8205486B5D2C`.
- No A-16R retry is bundled into this apply phase.

## Apply boundary

- `A16BT_RUNBOOK_SQL_EXECUTION_ALLOWED=NO`
- `A16BT_RUNBOOK_SUPABASE_DB_PUSH_ALLOWED=NO`
- `A16BT_RUNBOOK_MIGRATION_REPAIR_ALLOWED=NO`
- `A16BT_RUNBOOK_PRODUCTION_ROW_QUERY_ALLOWED=NO`
- `A16BT_RUNBOOK_POST_OFFICIAL_IMPORT_ALLOWED=NO`
- `A16BT_RUNBOOK_IMPORT_RPC_ALLOWED=NO`
- `A16BT_RUNBOOK_A16R_RETRY_ALLOWED=NO`
- `A16BT_RUNBOOK_DEPLOY_ALLOWED=NO`

If approved later, apply only the exact SQL content of migration 0021 through
the owner-controlled SQL path.

## Verification

After owner apply, run only:

`db/checks/20260711_check_a16bt_secure_public_genealogy_read_boundary.sql`

Expected final row:

`A16BT_EXPECTED_POST_APPLY_VERIFY=a16bt_secure_public_genealogy_read_boundary_verified_TRUE`

Expected critical values:

- `broad_anon_table_select_grant_count=0`
- `broad_public_table_select_grant_count=0`
- `missing_required_anon_column_grant_count=0`
- `forbidden_private_column_anon_grant_count=0`
- `notes_private_anon_select_privilege=false`
- `forbidden_anon_mutation_grant_count=0`
- `forbidden_public_mutation_grant_count=0`
- `existing_authenticated_policies_remain_unchanged=true`
- `a16br_revisions_insert_policy_remains_unchanged=true`
- `rpc_remains_security_invoker=true`
- `no_automatic_import_trigger=true`

## Localhost smoke plan

`A16BT_LOCALHOST_SMOKE_PLAN=AFTER_LOCAL_BUILD_NO_PRODUCTION_MUTATION`.

Use localhost only. Do not deploy and do not run production Worker smoke.

Smoke routes:

- `/`
- `/tree`
- `/people/[slug]` using a known public slug if available locally
- `/admin/preview/public` with an authenticated local admin session if available

Safe skip is acceptable when no local dev server or no local authenticated admin
session is available. Record the exact skip reason as
`A16BT_LOCALHOST_SMOKE=SAFE_SKIP_WITH_REASON`.

## Stop conditions

Stop and record a blocker if verification fails, a public route needs a column
outside the allowlist, or a public route loses expected graph/profile data after
owner apply. Do not continue into import execution or A-16R retry from this
phase.
