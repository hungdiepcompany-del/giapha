# A-16F3 - Supabase Metadata Link Migration Path Bridge

Status: `A16F3_SUPABASE_METADATA_LINK_MIGRATION_PATH_BRIDGE_RECORDED`

Marker: `A-16F3`

Final status:

```text
A16F3_STATUS=BRIDGE_READY_LINK_BLOCKED
A16F3_NPX_SUPABASE_CLI=AVAILABLE_VERSION_2_108_0
A16F3_OWNER_CONFIRMED_PROJECT_REF=frkyeuxrlcflmsxxsolp
A16F3_SUPABASE_INIT_RESULT=PASS_LOCAL_METADATA_CREATED
A16F3_PROJECT_LINK_RESULT=BLOCKED_SUPABASE_AUTH_REQUIRED_OR_ACCOUNT_NOT_CONFIRMED
A16F3_MIGRATION_BRIDGE_RESULT=PASS_BYTE_FOR_BYTE
A16F3_SOURCE_CANONICAL_PATH=db/migrations
A16F3_MIRROR_PATH=supabase/migrations
A16F3_DB_PUSH_STATUS=NOT_RUN
A16F3_DB_DRY_RUN_STATUS=NOT_RUN
A16F3_DB_APPLY_STATUS=NOT_RUN
A16F3_SEED_STATUS=NO_SEED
A16F3_DATA_WRITE_STATUS=NO_INSERT_UPDATE_DELETE_UPSERT
A16F3_EXCEL_IMPORT_STATUS=NO_EXCEL_IMPORT
```

## Goal

A-16F3 prepares local Supabase CLI metadata and a migration path bridge so a
later phase can dry-run the import manifest schema safely. This phase creates
local metadata and mirrors the already reviewed A-16D candidate into the path
expected by Supabase CLI.

A-16F3 does not dry-run DB, apply DB, seed, import Excel, deploy or push.

## Preflight

Preflight results:

- `git status -sb`: `## main...origin/main`
- `git log --oneline --decorate -20`: A-16 through A-16F2 commits are present;
  HEAD before edits was `71c6f96`.
- `git check-ignore -v .env.local`: `.gitignore:17:.env.* .env.local`
- Staged `.xls`, `.xlsx`, `.csv`: none.
- `npx --yes supabase --version`: `2.108.0`

No secret value was read or printed. `.env.local` was not read.

## Project Ref

Owner-confirmed Supabase project ref:

```text
frkyeuxrlcflmsxxsolp
```

This project ref is recorded for the later link/apply phases. A-16F3 does not
print Supabase anon key, service role key, database password or access token.

## Metadata Result

Command run:

```powershell
npx --yes supabase init --yes
```

Result:

```text
A16F3_SUPABASE_INIT_RESULT=PASS_LOCAL_METADATA_CREATED
```

Created/updated local metadata:

- `supabase/config.toml`
- `supabase/.gitignore`

Safety adjustment:

- `[db.seed] enabled = false`
- `[db.seed] sql_paths = []`

This keeps local metadata from implying seed execution in future reset-style
commands. A-16F3 did not run any reset or push command.

## Link Result

Link command intentionally not run:

```powershell
npx --yes supabase link --project-ref frkyeuxrlcflmsxxsolp
```

Result:

```text
A16F3_PROJECT_LINK_RESULT=BLOCKED_SUPABASE_AUTH_REQUIRED_OR_ACCOUNT_NOT_CONFIRMED
```

Reason:

- Owner provided the project ref, but the active Supabase account/login state in
  this shell was not confirmed.
- Running link without confirming account could bind the checkout to the wrong
  project or prompt for token/login in a way that risks secret handling.

Current link metadata:

- `.supabase/.temp/project-ref`: not present.

## Migration Path Bridge

Canonical source path remains:

```text
db/migrations
```

Source candidate:

```text
db/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql
```

Supabase CLI mirror path:

```text
supabase/migrations
```

Mirror candidate:

```text
supabase/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql
```

Bridge action:

- Created `supabase/migrations`.
- Copied the candidate SQL from `db/migrations` to `supabase/migrations`.
- Did not edit SQL content during copy.

Byte-for-byte/hash verification:

```text
A16F3_SOURCE_SHA256=D22593729092FEF43C295126E74D5FDCD41ABD696A08DFEC63218C7E1851ABBE
A16F3_MIRROR_SHA256=D22593729092FEF43C295126E74D5FDCD41ABD696A08DFEC63218C7E1851ABBE
A16F3_MIGRATION_BRIDGE_RESULT=PASS_BYTE_FOR_BYTE
```

Policy:

- `db/migrations` remains canonical for reviewed source SQL.
- `supabase/migrations` is a CLI mirror for future Supabase dry-run/apply
  phases.
- Future changes to the source candidate must be mirrored and verified
  byte-for-byte before any dry-run/apply phase.

## Next Phase

Next phase should be:

```text
A16F4_DRY_RUN_ONLY
```

A-16F4 should:

- verify the Supabase account/login state safely;
- run or confirm `npx --yes supabase link --project-ref frkyeuxrlcflmsxxsolp`;
- verify `.supabase/.temp/project-ref` equals `frkyeuxrlcflmsxxsolp`;
- run dry-run only if link and bridge checks pass;
- still not apply DB unless a later apply phase is explicitly approved.

The A-16F apply marker remains required before any future apply attempt:

```text
APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY
```

## Boundary Statement

A-16F3 did not run `supabase db push`, did not run `supabase db push --dry-run --linked`, did not apply DB, did not seed, did not
insert/update/delete/upsert, did not import Excel, did not write production
data, did not write `people`, did not write relationships, did not deploy, did
not push, did not commit `.env.local` and did not add runtime dependency.

Runtime guardrail status:

- Main Worker touched: NO
- Runtime dependency added: NO
- New service Worker created: NO
- OpenNext/Wrangler config changed: NO
- Worker size risk: NO
- Service boundary recommendation: NONE for this metadata/bridge phase.
