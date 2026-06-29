# A-16F - Import Schema DB Apply Verification

Status: `A16F_IMPORT_SCHEMA_DB_APPLY_VERIFICATION_RECORDED`

Marker: `A-16F`

Owner approval marker supplied in prompt:

```text
APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY
```

Final status:

```text
A16F_STATUS=SAFE_SKIP_OR_BLOCKED
A16F_DB_DRY_RUN_RESULT=BLOCKED_SUPABASE_CLI_NOT_AVAILABLE
A16F_DB_APPLY_RESULT=NOT_RUN
A16F_SCHEMA_VERIFICATION_RESULT=NOT_RUN_NO_APPLY
A16F_RLS_VERIFICATION_RESULT=STATIC_CANDIDATE_ONLY_NOT_LIVE_DB
A16F_SEED_STATUS=NO_SEED
A16F_PEOPLE_RELATIONSHIPS_WRITE_STATUS=NO_WRITE
A16F_EXCEL_IMPORT_STATUS=NO_EXCEL_IMPORT
```

## Goal

A-16F was opened to dry-run and, if safe, apply the A-16D import manifest
schema candidate:

- `db/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql`

The phase was allowed to run `supabase db push --dry-run --linked` and
`supabase db push --linked` only after all gates passed. It was not allowed to
seed, import real Excel, write `people`, write relationships, deploy, push, add
dependencies or enable runtime import write.

## Preflight Result

Preflight commands/results:

- `git status -sb`: `## main...origin/main`
- `git log --oneline --decorate -20`: A-16 through A-16E2 commits are present;
  HEAD at preflight was `54a22bb`.
- `git check-ignore -v .env.local`: `.gitignore:17:.env.* .env.local`
- Staged `.xls`, `.xlsx`, `.csv`: none.
- Tracked `.xls`, `.xlsx`, `.csv`: none.
- Owner marker: present exactly as
  `APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY`.
- `supabase --version`: failed because `supabase` is not available in PATH.
- Project link check: blocked because the checkout has no `.supabase/` or
  `supabase/` project-link metadata to confirm the target project safely.

No secret value was read or printed. `.env.local` was not read.

## Dry-Run Result

Dry-run command required by the phase:

```bash
supabase db push --dry-run --linked
```

Dry-run result:

```text
A16F_DB_DRY_RUN_RESULT=BLOCKED_SUPABASE_CLI_NOT_AVAILABLE
```

Reason:

- `supabase --version` failed with command not found.
- There is no confirmed local Supabase CLI project link metadata in this
  checkout.
- Because the target project could not be confirmed safely, running `npx` or a
  guessed CLI path would not satisfy the phase safety gate.

## Apply Result

Apply command that would have been allowed only after dry-run PASS:

```bash
supabase db push --linked
```

Apply result:

```text
A16F_DB_APPLY_RESULT=NOT_RUN
```

No DB apply was attempted.

## Migration File

Candidate reviewed for A-16F:

- `db/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql`

The file remains a repository migration candidate from A-16D/A-16E2. Since
dry-run did not run and DB apply did not run, this phase cannot claim the
candidate was applied to Supabase.

## Schema Verification Result

Required live post-apply schema checks:

- `import_sessions`
- `import_session_warnings`
- `import_duplicate_candidates`
- `import_relationship_candidates`
- `import_write_manifests`

Schema verification result:

```text
A16F_SCHEMA_VERIFICATION_RESULT=NOT_RUN_NO_APPLY
```

Reason: no apply was run, so live read-only catalog verification would be
misleading. The only evidence in this phase is static source review of the
candidate file.

## RLS Verification Result

Required live RLS checks:

- verify RLS is enabled for the five import tables;
- verify no broad public/anonymous policy;
- verify important comments/constraints if possible.

RLS verification result:

```text
A16F_RLS_VERIFICATION_RESULT=STATIC_CANDIDATE_ONLY_NOT_LIVE_DB
```

Static candidate evidence:

- the candidate enables row level security for all five import tables;
- the candidate creates no RLS policy;
- the candidate creates no broad grant;
- A-16E2 added guard comments and constraints for no raw Excel content, no raw
  PII row storage, source/manifest hashes and approval consistency.

This is not a live DB verification result.

## Explicitly Not Done

- No seed.
- No insert/update/delete/upsert of real Gia Pha data.
- No write to `people`.
- No write to relationship tables.
- No real Excel import.
- No runtime import write route/action/service was enabled.
- No dependency added.
- No deploy.
- No push.
- No `.env.local` commit.
- No secret printed.
- No personal data printed.
- No A-16G/A-16H/A-16I work was run.

## Blocker

Primary blocker:

```text
A16F_BLOCKER=SUPABASE_CLI_NOT_AVAILABLE_AND_PROJECT_LINK_NOT_CONFIRMED
```

Resolution needed before retrying A-16F:

- install or provide an approved Supabase CLI path;
- confirm the exact target Supabase project for GIA PHA;
- provide safe project-link evidence without printing secrets;
- confirm backup/rollback/no-go position;
- rerun `supabase --version`;
- rerun `supabase db push --dry-run --linked`;
- apply only if dry-run shows exactly the intended A-16D candidate and no
  unexpected migration.

## Boundary Statement

A-16F recorded a safe-skip/blocker result. It did not run dry-run, did not
apply DB, did not seed, did not mutate data, did not import Excel, did not
deploy, did not push, did not add dependency and did not enable runtime import
write.

Runtime guardrail status:

- Main Worker touched: NO
- Runtime dependency added: NO
- New service Worker created: NO
- OpenNext/Wrangler config changed: NO
- Worker size risk: NO
- Service boundary recommendation: NONE for this blocked verification phase.
