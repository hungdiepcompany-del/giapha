# A-16F1 - Supabase CLI Project Link Readiness

Status: `A16F1_SUPABASE_CLI_PROJECT_LINK_READINESS_RECORDED`

Marker: `A-16F1`

Final readiness:

```text
A16F1_STATUS=SAFE_SKIP_OR_BLOCKED
A16F1_GLOBAL_SUPABASE_CLI=UNAVAILABLE
A16F1_NPX_SUPABASE_CLI=AVAILABLE_VERSION_2_108_0
A16F1_PROJECT_LINK_READINESS=BLOCKED_MISSING_SUPABASE_PROJECT_LINK
A16F1_DB_PUSH_STATUS=NOT_RUN
A16F1_DB_DRY_RUN_STATUS=NOT_RUN
A16F1_DB_APPLY_STATUS=NOT_RUN
A16F1_SEED_STATUS=NO_SEED
A16F1_DATA_WRITE_STATUS=NO_INSERT_UPDATE_DELETE_UPSERT
A16F1_EXCEL_IMPORT_STATUS=NO_EXCEL_IMPORT
```

## Reason For A-16F Blocker

A-16F had the owner marker:

```text
APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY
```

However, A-16F was blocked safely because:

- `supabase --version` failed because the global Supabase CLI was not available
  in PATH.
- The checkout did not contain `.supabase/`, `supabase/` or link metadata that
  could confirm the target Supabase project for GIA PHA.

Therefore A-16F did not run:

- `supabase db push --dry-run --linked`
- `supabase db push --linked`

## Preflight

Preflight results:

- `git status -sb`: `## main...origin/main`
- `git log --oneline --decorate -20`: A-16 through A-16F commits are present;
  HEAD before A-16F1 edits was `aa123fa`.
- `git check-ignore -v .env.local`: `.gitignore:17:.env.* .env.local`
- Staged `.xls`, `.xlsx`, `.csv`: none.

Working tree was clean before edits. No secret value was read or printed.
`.env.local` was not read.

## Supabase CLI Readiness

Command:

```powershell
supabase --version
```

Result:

```text
A16F1_GLOBAL_SUPABASE_CLI=UNAVAILABLE
```

Observed result: PowerShell reported that `supabase` was not recognized as a
command.

Command:

```powershell
npx --yes supabase --version
```

Result:

```text
A16F1_NPX_SUPABASE_CLI=AVAILABLE_VERSION_2_108_0
```

Meaning:

- A Supabase CLI executable can be reached through `npx`.
- This phase still does not run any `supabase db push` command.
- Global installation was not attempted because A-16F1 has no approval to
  install a global CLI.

## Project Link Readiness

Checked paths:

- `.supabase`
- `supabase`
- `supabase/config.toml`
- `.supabase/project-ref`
- `.supabase/.temp/project-ref`
- `db`

Result:

```text
A16F1_PROJECT_LINK_READINESS=BLOCKED_MISSING_SUPABASE_PROJECT_LINK
```

Only `db/` exists. No Supabase CLI project-link metadata was found.

This phase does not infer project ref from `.env.local`, because reading secret
or local env values is outside the safety boundary. Owner did not provide a
project ref in the prompt, so no link command was run.

## Env Presence Check

Repo convention command:

```powershell
npm run check:env:safe
```

Result:

```text
A16F1_ENV_SAFE_CHECK=PASS_NAMES_ONLY
```

The checker reported presence/missing status only. It did not print secret
values.

## Remaining Blockers

```text
A16F1_BLOCKER=MISSING_SUPABASE_PROJECT_LINK
```

Remaining blockers before retrying A-16F:

- Confirm exact Supabase project ref for the GIA PHA project.
- Confirm the operator is logged into the correct Supabase account.
- Create or verify Supabase project link metadata safely.
- Confirm backup/rollback/no-go position before any dry-run/apply phase.
- Keep the A-16F owner apply marker:
  `APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY`.

## Owner Runbook

If owner wants to prepare the next A-16F retry, run these manually in a trusted
shell and do not paste tokens or passwords into chat:

```powershell
npx --yes supabase --version
npx --yes supabase login
npx --yes supabase link --project-ref <GIA_PHA_PROJECT_REF>
```

Notes:

- Replace `<GIA_PHA_PROJECT_REF>` with the exact project ref for GIA PHA.
- Do not print or commit token/password values.
- Do not run `supabase db push` in A-16F1.
- After linking, rerun a separate apply-verification phase before any DB
  dry-run/apply.

Official Supabase CLI documentation says `supabase link` links a local project
to a hosted project and `supabase db push` requires the local project to be
linked before pushing migrations.

## Boundary Statement

A-16F1 did not run `supabase db push`, did not run `supabase db push --dry-run --linked`, did not apply DB, did not seed, did not
insert/update/delete/upsert, did not import Excel, did not write production
data, did not write `people`, did not write relationships, did not deploy, did
not push, did not commit `.env.local` and did not add runtime dependency.

Runtime guardrail status:

- Main Worker touched: NO
- Runtime dependency added: NO
- New service Worker created: NO
- OpenNext/Wrangler config changed: NO
- Worker size risk: NO
- Service boundary recommendation: NONE for this readiness-only phase.
