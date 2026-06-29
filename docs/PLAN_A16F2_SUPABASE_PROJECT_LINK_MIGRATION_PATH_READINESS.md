# A-16F2 - Supabase Project Link Migration Path Readiness

Status: `A16F2_SUPABASE_PROJECT_LINK_MIGRATION_PATH_READINESS_RECORDED`

Marker: `A-16F2`

Final readiness:

```text
A16F2_STATUS=SAFE_SKIP_OR_BLOCKED
A16F2_NPX_SUPABASE_CLI=AVAILABLE_VERSION_2_108_0
A16F2_OWNER_CONFIRMED_PROJECT_REF=frkyeuxrlcflmsxxsolp
A16F2_PROJECT_LINK_READINESS=BLOCKED_NOT_LINKED
A16F2_MIGRATION_PATH_READINESS=BLOCKED_PATH_STRATEGY_NOT_APPLIED
A16F2_DB_PUSH_STATUS=NOT_RUN
A16F2_DB_DRY_RUN_STATUS=NOT_RUN
A16F2_DB_APPLY_STATUS=NOT_RUN
A16F2_SEED_STATUS=NO_SEED
A16F2_DATA_WRITE_STATUS=NO_INSERT_UPDATE_DELETE_UPSERT
A16F2_EXCEL_IMPORT_STATUS=NO_EXCEL_IMPORT
```

## Reason For A-16F Blocker

A-16F had owner approval marker:

```text
APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY
```

It was blocked safely because:

- global `supabase --version` was unavailable in PATH;
- A-16F1 confirmed `npx --yes supabase --version` works;
- the checkout did not contain `.supabase/`, `supabase/`,
  `supabase/config.toml`, `.supabase/project-ref` or
  `.supabase/.temp/project-ref`;
- the A-16D candidate lives in `db/migrations/`, while Supabase CLI workflows
  conventionally use `supabase/migrations/`.

A-16F2 only records link and migration path readiness. It does not dry-run or
apply database changes.

## Preflight

Preflight results:

- `git status -sb`: `## main...origin/main`
- `git log --oneline --decorate -20`: A-16 through A-16F1 commits are present;
  HEAD before A-16F2 edits was `0b8d44b`.
- `git check-ignore -v .env.local`: `.gitignore:17:.env.* .env.local`
- Staged `.xls`, `.xlsx`, `.csv`: none.

Working tree was clean before edits. No secret value was read or printed.
`.env.local` was not read.

## CLI Readiness

Command:

```powershell
npx --yes supabase --version
```

Result:

```text
A16F2_NPX_SUPABASE_CLI=AVAILABLE_VERSION_2_108_0
```

Global CLI is not required for A-16F2 because `npx --yes supabase` is available.

## Owner-Confirmed Project Ref

Owner-confirmed project ref:

```text
frkyeuxrlcflmsxxsolp
```

This is recorded as the intended Supabase project ref for GIA PHA. A-16F2 does
not print Supabase anon key, service role key, access token or database
password.

Optional owner verification outside Codex:

- Open Supabase Dashboard and confirm project ref `frkyeuxrlcflmsxxsolp`.
- Confirm the project name/account is the intended GIA PHA project.
- Do not paste access tokens or passwords into chat.

## Local Link Metadata Status

Checked paths:

- `.supabase`: missing
- `supabase`: missing
- `supabase/config.toml`: missing
- `supabase/migrations`: missing
- `.supabase/project-ref`: missing
- `.supabase/.temp/project-ref`: missing
- `db`: present
- `db/migrations`: present
- `db/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql`:
  present

Result:

```text
A16F2_PROJECT_LINK_READINESS=BLOCKED_NOT_LINKED
```

A-16F2 did not run `npx --yes supabase init` because creating CLI project
metadata before choosing the migration path strategy could make the next apply
phase ambiguous. It also did not run `npx --yes supabase link --project-ref
frkyeuxrlcflmsxxsolp` because the current Supabase account/login state was not
confirmed by owner in this shell.

## Link Command Template

Owner/operator may prepare a later phase in a trusted shell:

```powershell
npx --yes supabase --version
npx --yes supabase login
npx --yes supabase init
npx --yes supabase link --project-ref frkyeuxrlcflmsxxsolp
```

Rules:

- Do not paste tokens or passwords into chat.
- Do not commit secrets.
- Do not run `supabase db push` in A-16F2.
- Do not run `supabase db push --dry-run --linked` in A-16F2.
- After linking, verify metadata only before opening the next apply phase.

## Migration Path Issue

Current repository canonical migration path:

```text
db/migrations
```

Current A-16D candidate:

```text
db/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql
```

Supabase CLI expected migration path:

```text
supabase/migrations
```

This mismatch must be resolved before a future dry-run/apply phase. A-16F2 does
not move or copy the candidate SQL.

## A-16F3 Recommendation

Recommended A-16F3 path:

```text
A16F2_A16F3_RECOMMENDATION=CREATE_SUPABASE_METADATA_AND_BRIDGE_CANDIDATE_WITH_EXPLICIT_CHECKER
```

Recommended strategy:

1. Confirm owner/operator is logged into the correct Supabase account.
2. Run `npx --yes supabase init` if `supabase/` remains missing.
3. Run `npx --yes supabase link --project-ref frkyeuxrlcflmsxxsolp`.
4. Create `supabase/migrations/` in A-16F3.
5. Copy, not move, the A-16D candidate SQL into `supabase/migrations/` with a
   matching filename and a checker that verifies the copied file is byte-for-
   byte equivalent to `db/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql`.
6. Do not run `supabase db push` until a later A-16F retry or A-16F4 dry-run
   phase with the owner marker again.

Why not choose the other paths now:

- Keeping only `db/migrations` would require a custom bridge/apply command and
  risks drifting from Supabase CLI defaults.
- A custom apply script that reads `db/migrations` should be a later phase only,
  because it would create a new operational apply path.

## Boundary Statement

A-16F2 did not run `supabase db push`, did not run `supabase db push --dry-run --linked`, did not apply DB, did not seed, did not
insert/update/delete/upsert, did not import Excel, did not write production
data, did not write `people`, did not write relationships, did not deploy, did
not push, did not commit `.env.local` and did not add runtime dependency.

The A-16F apply marker is still required before any later apply attempt:

```text
APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY
```

Runtime guardrail status:

- Main Worker touched: NO
- Runtime dependency added: NO
- New service Worker created: NO
- OpenNext/Wrangler config changed: NO
- Worker size risk: NO
- Service boundary recommendation: NONE for this readiness-only phase.
