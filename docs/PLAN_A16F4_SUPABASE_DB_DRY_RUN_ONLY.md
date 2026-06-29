# A-16F4 - Supabase DB Dry-run Only

Status: `A16F4_SUPABASE_DB_DRY_RUN_ONLY_RECORDED`

Marker: `A-16F4`

Final status:

```text
A16F4_STATUS=BLOCKED_SUPABASE_AUTH_REQUIRED
A16F4_NPX_SUPABASE_CLI=AVAILABLE_VERSION_2_108_0
A16F4_PROJECT_REF=frkyeuxrlcflmsxxsolp
A16F4_LINK_RESULT=FAIL_SUPABASE_LINK_PRIVILEGE_REQUIRED
A16F4_DRY_RUN_RESULT=NOT_RUN_LINK_BLOCKED
A16F4_DB_APPLY_STATUS=NOT_RUN
A16F4_SEED_STATUS=NO_SEED
A16F4_EXCEL_IMPORT_STATUS=NO_EXCEL_IMPORT
A16F4_PEOPLE_WRITE_STATUS=NO_WRITE
A16F4_RELATIONSHIP_WRITE_STATUS=NO_WRITE
A16F4_DATA_WRITE_STATUS=NO_INSERT_UPDATE_DELETE_UPSERT
```

## Goal

A-16F4 was opened to link the local Supabase metadata to the owner-confirmed
GIA PHA project and run dry-run only:

```powershell
npx --yes supabase db push --dry-run --linked
```

This phase is dry-run-only. It must not apply DB, seed, import Excel, write
`people`, write relationships, deploy, push or run A-16G/A-16H/A-16I.

## Preflight

Preflight results:

- `git status -sb`: `## main...origin/main [ahead 1]`
- `git log --oneline --decorate -20`: A-16 through A-16F3 commits are present;
  HEAD before edits was `ecf4104`.
- `git check-ignore -v .env.local`: `.gitignore:17:.env.* .env.local`
- Staged `.xls`, `.xlsx`, `.csv`: none.
- `npx --yes supabase --version`: `2.108.0`
- `supabase/config.toml`: present.
- `db/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql`:
  present.
- `supabase/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql`:
  present.

Working tree was clean before A-16F4 edits. No secret value was read or
printed. `.env.local` was not read.

## Project Ref

Owner-confirmed project ref:

```text
frkyeuxrlcflmsxxsolp
```

## Migration Hash

Source migration:

```text
db/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql
```

Mirror migration:

```text
supabase/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql
```

Hash verification:

```text
A16F4_SOURCE_SHA256=D22593729092FEF43C295126E74D5FDCD41ABD696A08DFEC63218C7E1851ABBE
A16F4_MIRROR_SHA256=D22593729092FEF43C295126E74D5FDCD41ABD696A08DFEC63218C7E1851ABBE
A16F4_MIGRATION_BRIDGE_RESULT=PASS_BYTE_FOR_BYTE
```

## Link Result

Existing link metadata before link:

- `.supabase`: missing.
- `.supabase/.temp`: missing.
- `.supabase/.temp/project-ref`: missing.

Command attempted:

```powershell
npx --yes supabase link --project-ref frkyeuxrlcflmsxxsolp
```

Result:

```text
A16F4_LINK_RESULT=FAIL_SUPABASE_LINK_PRIVILEGE_REQUIRED
A16F4_BLOCKER=SUPABASE_LINK_PRIVILEGE_REQUIRED
```

Observed sanitized error summary:

- The CLI could not retrieve remote project status.
- The current account does not have the necessary privileges to access the
  required Supabase endpoint.

No token, password, service role key, anon key or connection string was printed.

Link metadata after the failed link attempt:

- `.supabase`: missing.
- `.supabase/.temp/project-ref`: missing.

Because the project was not linked, A-16F4 did not run dry-run.

## Dry-run Result

Dry-run command planned but not run:

```powershell
npx --yes supabase db push --dry-run --linked
```

Dry-run result:

```text
A16F4_DRY_RUN_RESULT=NOT_RUN_LINK_BLOCKED
```

Expected migration list if a later linked dry-run is allowed:

```text
EXPECTED_ONLY_MIGRATION=20260629_0010_a16d_import_manifest_storage_candidate.sql
EXPECTED_NO_OUT_OF_SCOPE_MIGRATIONS=true
```

A-16F4 cannot claim `READY_FOR_A16F5_DB_APPLY_VERIFICATION` because dry-run did
not run.

## Boundary Statement

A-16F4 did not run `supabase db push --linked`, did not run `supabase db push --dry-run --linked`, did not apply DB, did not seed, did not import Excel, did not write `people`, did not write relationships, did not
insert/update/delete/upsert real data, did not deploy, did not push and did not
run A-16G/A-16H/A-16I.

Next safe step:

- Owner/operator should confirm the Supabase account has access to project
  `frkyeuxrlcflmsxxsolp`.
- Then rerun a dry-run-only phase.
- Any later apply phase still requires
  `APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY`.

Runtime guardrail status:

- Main Worker touched: NO
- Runtime dependency added: NO
- New service Worker created: NO
- OpenNext/Wrangler config changed: NO
- Worker size risk: NO
- Service boundary recommendation: NONE for this dry-run-only blocked phase.
