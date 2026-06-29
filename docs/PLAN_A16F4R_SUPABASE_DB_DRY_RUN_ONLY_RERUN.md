# A-16F4R - Supabase DB Dry-run Only Rerun

Status: `A16F4R_SUPABASE_DB_DRY_RUN_ONLY_RERUN_RECORDED`

Marker: `A-16F4R`

Final status:

```text
A16F4R_STATUS=BLOCKED_SUPABASE_PROJECT_ACCESS_DENIED
A16F4R_NPX_SUPABASE_CLI=AVAILABLE_VERSION_2_108_0
A16F4R_PROJECT_REF=frkyeuxrlcflmsxxsolp
A16F4R_LINK_RESULT=FAIL_SUPABASE_PROJECT_ACCESS_DENIED
A16F4R_DRY_RUN_RESULT=NOT_RUN_LINK_BLOCKED
A16F4R_DB_APPLY_STATUS=NOT_RUN
A16F4R_SEED_STATUS=NO_SEED
A16F4R_EXCEL_IMPORT_STATUS=NO_EXCEL_IMPORT
A16F4R_PEOPLE_WRITE_STATUS=NO_WRITE
A16F4R_RELATIONSHIP_WRITE_STATUS=NO_WRITE
A16F4R_DATA_WRITE_STATUS=NO_INSERT_UPDATE_DELETE_UPSERT
```

## Goal

A-16F4R reruns the A-16F4 dry-run-only gate after owner/operator was expected to
correct Supabase account access for the GIA PHA project.

Allowed command if link is correct:

```powershell
npx --yes supabase db push --dry-run --linked
```

This phase is dry-run-only. It must not apply DB, seed, import Excel, write
`people`, write relationships, deploy, push or run A-16F5/A-16G/A-16H/A-16I.

## Previous Blocker

A-16F4 was blocked before dry-run because:

```text
A16F4_LINK_RESULT=FAIL_SUPABASE_LINK_PRIVILEGE_REQUIRED
A16F4_DRY_RUN_RESULT=NOT_RUN_LINK_BLOCKED
```

The active Supabase account could not prove access to project
`frkyeuxrlcflmsxxsolp`.

## Preflight

Preflight results for A-16F4R:

- `git status -sb`: `## main...origin/main [ahead 1]`
- `git log --oneline --decorate -20`: A-16 through A-16F4 commits are present;
  HEAD before A-16F4R edits was
  `1ac5412 docs: record Gia Pha 4 import schema dry run blocker`.
- `git check-ignore -v .env.local`: `.gitignore:17:.env.* .env.local`
- Staged `.xls`, `.xlsx`, `.csv`: none.
- `npx --yes supabase --version`: `2.108.0`
- `supabase/config.toml`: present.
- `db/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql`:
  present.
- `supabase/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql`:
  present.

Working tree was clean before A-16F4R edits. No secret value was read or
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
A16F4R_SOURCE_SHA256=D22593729092FEF43C295126E74D5FDCD41ABD696A08DFEC63218C7E1851ABBE
A16F4R_MIRROR_SHA256=D22593729092FEF43C295126E74D5FDCD41ABD696A08DFEC63218C7E1851ABBE
A16F4R_MIGRATION_BRIDGE_RESULT=PASS_BYTE_FOR_BYTE
```

## Link Result

Existing link metadata before the rerun link attempt:

- `.supabase`: missing.
- `.supabase/.temp`: missing.
- `.supabase/.temp/project-ref`: missing.

Command attempted:

```powershell
npx --yes supabase link --project-ref frkyeuxrlcflmsxxsolp
```

Result:

```text
A16F4R_LINK_RESULT=FAIL_SUPABASE_PROJECT_ACCESS_DENIED
A16F4R_BLOCKER=SUPABASE_PROJECT_ACCESS_DENIED
```

Observed sanitized error summary:

- The CLI returned `LegacyLinkProjectStatusError`.
- The CLI could not retrieve remote project status.
- The current account does not have the necessary privileges to access the
  required Supabase endpoint.

No token, password, service role key, anon key or connection string was printed.

Link metadata after the failed link attempt:

- `.supabase`: missing.
- `.supabase/.temp`: missing.
- `.supabase/.temp/project-ref`: missing.

Because the project was not linked, A-16F4R did not run dry-run.

## Dry-run Result

Dry-run command planned but not run:

```powershell
npx --yes supabase db push --dry-run --linked
```

Dry-run result:

```text
A16F4R_DRY_RUN_RESULT=NOT_RUN_LINK_BLOCKED
```

Expected migration list if a later linked dry-run is allowed:

```text
EXPECTED_ONLY_MIGRATION=20260629_0010_a16d_import_manifest_storage_candidate.sql
EXPECTED_NO_OUT_OF_SCOPE_MIGRATIONS=true
```

A-16F4R cannot claim `READY_FOR_A16F5_DB_APPLY_VERIFICATION` because dry-run did
not run.

## Boundary Statement

A-16F4R did not run `supabase db push --linked`, did not run `supabase db push --dry-run --linked`, did not apply DB, did not seed, did not import Excel, did not write `people`, did not write relationships, did not
insert/update/delete/upsert real data, did not deploy, did not push and did not
run A-16F5/A-16G/A-16H/A-16I.

Next safe step:

- Owner/operator should log in to Supabase with an account that has privileges
  on project `frkyeuxrlcflmsxxsolp`.
- Owner/operator should confirm `supabase link` can retrieve remote project
  status without exposing any token or secret.
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
