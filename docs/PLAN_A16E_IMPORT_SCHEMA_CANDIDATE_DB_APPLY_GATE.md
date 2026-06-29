# A-16E - Import Schema Candidate / DB Apply Gate

Status: `A16E_IMPORT_SCHEMA_CANDIDATE_DB_APPLY_GATE_RECORDED`

Marker: `A-16E`

Marker: `A16E_IMPORT_SCHEMA_CANDIDATE_DB_APPLY_GATE`

```text
A16E_SCOPE=REVIEW_DESIGN_CHECKER_ONLY
A16E_DB_APPLY_STATUS=NOT_APPLIED
A16E_DB_WRITE_STATUS=NO_DB_WRITE
A16E_SEED_STATUS=NO_SEED
A16E_DEPENDENCY_ADDED=NO
A16E_DEPLOY_STATUS=NO_DEPLOY
A16E_PRODUCTION_MUTATION=NO
A16E_HARD_STOP_REASON=MISSING_APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY
```

## Muc Tieu

A-16E review SQL migration candidate tu A-16D va chuan bi cong xin apply DB
cho import manifest storage. Phase nay khong apply DB, khong connect
production DB, khong seed, khong ghi data that va khong tao runtime ghi import.

Required owner marker for the next DB apply phase:

```text
APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY
```

Marker tren khong co trong prompt/context hien tai, nen A-16E dung lai sau
docs/checker/commit. Khong duoc tu chay A-16F.

## Input Review

Reviewed inputs:

- `db/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql`
- `docs/PLAN_A16D_IMPORT_SCHEMA_CANDIDATE_MANIFEST_STORAGE_DESIGN.md`
- A-16/A-16B/A-16C import docs and checkers.

Preflight before A-16E:

- `git status -sb`: `main...origin/main`, working tree clean.
- `git log --oneline --decorate -20`: A-16/A-16B/A-16C/A-16D commits are
  present; HEAD is `4677ec2`.
- `.env.local` is ignored by `.gitignore:17:.env.*`.
- No staged files and no tracked/staged `.xls`, `.xlsx` or `.csv` evidence.

## SQL Candidate Safety Review

Result: `A16E_SQL_CANDIDATE_STATIC_REVIEW=PASS`.

The A-16D migration candidate:

- has marker `A16D_IMPORT_SCHEMA_CANDIDATE_MANIFEST_STORAGE_DESIGN`;
- has `DO_NOT_APPLY_WITHOUT_APPROVE_A16E_IMPORT_MANIFEST_SCHEMA_APPLY`;
- has `DO_NOT_RUN_SUPABASE_DB_PUSH`;
- creates only additive candidate tables and indexes;
- does not contain `DROP TABLE`;
- does not contain `TRUNCATE`;
- does not contain `DELETE FROM`;
- does not contain data `UPDATE`;
- does not contain seed/data `INSERT`;
- does not contain broad `GRANT`;
- does not contain `CREATE POLICY`;
- does not disable RLS;
- does not store real Excel content.

Note: the A-16D file uses foreign-key `ON DELETE` behavior. This is not a data
deletion statement and is acceptable in the static review.

## Schema Logic Review

Result: `A16E_SCHEMA_LOGIC_REVIEW=PASS`.

The candidate covers the required storage groups:

| Requirement | Candidate coverage |
| --- | --- |
| import session/manifest | `import_sessions` with source hash, manifest hash, mapping version, counts, status, approval marker and retention fields |
| warning storage | `import_session_warnings` with severity, row/column reference, Vietnamese message and review status |
| duplicate candidate storage | `import_duplicate_candidates` with source row index, fingerprint, optional existing person, match strength and owner decision |
| relationship candidate storage | `import_relationship_candidates` with relationship type, source/related row references, confidence, ambiguity and owner decision |
| write manifest and rollback | `import_write_manifests` with manifest hash, approval marker, approved scope, held rows summary, rollback plan and created record ids |

The lifecycle is explicit enough for preview/review/apply planning:

- preview generated;
- owner reviewing;
- warnings reviewed;
- duplicates reviewed;
- relationships reviewed;
- privacy reviewed;
- ready for owner approval;
- owner approved for DB write;
- rejected or expired;
- write started/completed;
- rollback required/rolled back.

## Privacy Review

Result: `A16E_PRIVACY_REVIEW=PASS_WITH_FUTURE_RUNTIME_CARE`.

The candidate stores source metadata, hashes, row indexes, counts,
fingerprints, warning codes, owner decisions and rollback/write summaries. It
does not store workbook binary content and does not require raw spreadsheet row
payloads.

Future runtime must still enforce:

- no real Excel file committed to git;
- no full family person list printed to logs/docs;
- no raw private notes exposed to client UI;
- no source workbook upload persisted unless a separate storage/privacy phase
  approves it;
- no public read access to import sessions, warnings, duplicates, relationships
  or write manifests.

## RLS Fail-Closed Review

Result: `A16E_RLS_REVIEW=PASS_FAIL_CLOSED`.

The candidate enables RLS on all five tables:

- `public.import_sessions`
- `public.import_session_warnings`
- `public.import_duplicate_candidates`
- `public.import_relationship_candidates`
- `public.import_write_manifests`

It creates no policy and no grant in A-16D/A-16E. This is intentional:
fail-closed storage is safer than exposing import review data before exact
permissions are approved.

Supabase platform note: new public-schema tables may also need explicit grants
for Data API access in current/future Supabase defaults. A-16E intentionally
does not add grants. If a later runtime needs Data API or `supabase-js` access,
that phase must approve the exact grants and RLS policies together.

Future policy/runtime phase must decide:

- whether admin UI reads/writes via service-role backend guard or user client;
- which permission gates apply, likely `imports.create` plus stricter owner/admin
  review permissions;
- whether owner approval and write manifest actions need a new permission code;
- how RLS prevents public/anonymous access;
- how audit/backup/export scopes include or exclude import manifest data.

## Migration Apply Prerequisites

Do not apply the candidate until a separate A-16F phase has all items below:

- explicit owner marker:
  `APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY`;
- clean repo after A-16E commit;
- target Supabase project confirmed by owner;
- fresh backup or owner-approved rollback/no-go position;
- Supabase CLI/tooling checked without printing secrets;
- dry-run result recorded;
- one-file apply scope confirmed as only
  `20260629_0010_a16d_import_manifest_storage_candidate.sql`;
- post-apply read-only catalog verification plan;
- RLS verification plan;
- no seed/no app data mutation guarantee.

## Command Templates

These are templates for A-16F only. Do not run them in A-16E.

Check CLI:

```powershell
supabase --version
supabase db --help
supabase db push --help
```

Dry-run template:

```powershell
supabase db push --dry-run --linked
```

Apply template:

```powershell
supabase db push --linked
```

Read-only verification template after apply:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'import_sessions',
    'import_session_warnings',
    'import_duplicate_candidates',
    'import_relationship_candidates',
    'import_write_manifests'
  )
order by table_name;
```

RLS verification template after apply:

```sql
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'import_sessions',
    'import_session_warnings',
    'import_duplicate_candidates',
    'import_relationship_candidates',
    'import_write_manifests'
  )
order by tablename;
```

Policy/grant review template after apply:

```sql
select schemaname, tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public'
  and tablename like 'import_%'
order by tablename, policyname;
```

## Rollback / Fallback Note

Before A-16F apply, owner must choose one:

- rollback by reversing only the import manifest candidate objects if no
  runtime depends on them yet;
- or no-go and keep the candidate unapplied until schema concerns are resolved.

No destructive rollback SQL is created in A-16E. A-16F must document an exact
rollback plan before any apply.

## Hard Stop

A-16E ends at docs/checker/commit because the required marker
`APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY` is not present.

Blocked next phases:

- A-16F DB apply verification: blocked until marker is supplied.
- A-16G import session/read manifest runtime: blocked until A-16F apply and
  verification PASS.
- A-16H Excel parser dependency: blocked until explicit dependency marker.
- A-16I DB write runtime: blocked until schema apply PASS, parser/preview
  evidence, owner-approved manifest and DB write marker.

## A-16E Boundary Statement

A-16E did not apply DB, did not run `supabase db push`, did not connect to
production DB, did not seed, did not insert/update/delete/upsert app data, did
not add dependency, did not deploy and did not push.

Runtime guardrail status:

- Main Worker touched: NO
- Runtime dependency added: NO
- New service Worker created: NO
- OpenNext/Wrangler config changed: NO
- Worker size risk: NO
- Service boundary recommendation: keep future large Excel parsing under
  `genealogy-import-service` or offline tooling review if parser/runtime grows.
