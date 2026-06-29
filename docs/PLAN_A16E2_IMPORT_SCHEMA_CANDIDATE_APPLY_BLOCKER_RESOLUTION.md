# A-16E2 - Import Schema Candidate Apply Blocker Resolution

Status: `A16E2_IMPORT_SCHEMA_CANDIDATE_APPLY_BLOCKER_RESOLUTION_RECORDED`

Marker: `A-16E2`

Marker: `A16E2_IMPORT_SCHEMA_CANDIDATE_APPLY_BLOCKER_RESOLUTION`

```text
A16E2_SCOPE=SCHEMA_CANDIDATE_BLOCKER_RESOLUTION_DOCS_CHECKER_ONLY
A16E2_DB_APPLY_STATUS=NOT_APPLIED
A16E2_DB_WRITE_STATUS=NO_DB_WRITE
A16E2_SEED_STATUS=NO_SEED
A16E2_DEPENDENCY_ADDED=NO
A16E2_DEPLOY_STATUS=NO_DEPLOY
A16E2_SCHEMA_APPLY_RECOMMENDATION=READY_FOR_A16F_DB_APPLY_REVIEW
A16E2_A16F_MARKER_REQUIRED=APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY
```

## Muc Tieu

A-16E2 xu ly cac diem chua chac trong A-16E1 truoc khi owner quyet dinh co mo
A-16F DB apply verification hay khong. Phase nay duoc sua SQL migration
candidate vi candidate van `NOT_APPLIED`, nhung khong apply DB, khong chay
`supabase db push`, khong connect production DB, khong seed, khong ghi data,
khong deploy, khong push va khong them dependency.

## Preflight

Preflight before A-16E2:

- `git status -sb`: `main...origin/main`, working tree clean.
- `git log --oneline --decorate -20`: A-16 through A-16E1 commits are present;
  HEAD before edits is `22c58b1`.
- `.env.local` is ignored by `.gitignore:17:.env.*`.
- No staged files.
- No staged `.xls`, `.xlsx` or `.csv` file.

No secret value was read or printed.

## Inputs Reviewed

- `docs/PLAN_A16D_IMPORT_SCHEMA_CANDIDATE_MANIFEST_STORAGE_DESIGN.md`
- `docs/PLAN_A16E_IMPORT_SCHEMA_CANDIDATE_DB_APPLY_GATE.md`
- `docs/PLAN_A16E1_OWNER_REVIEW_IMPORT_SCHEMA_APPLY_GATE.md`
- `db/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql`
- Supabase official guidance on Data API grants and RLS separation.

## Initial Blockers From A-16E1

| Blocker | Category | A-16E2 status |
| --- | --- | --- |
| Missing owner marker `APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY` | `PERMISSION_BLOCKER` | Still blocked; owner marker is still required. |
| Target Supabase project not confirmed | `REVIEW_ONLY_CAUTION` | Still blocked for actual apply; A-16E2 does not connect DB. |
| Backup/rollback/no-go position not confirmed | `REVIEW_ONLY_CAUTION` | Still blocked for actual apply; A-16F must record it. |
| Dry-run not run | `REVIEW_ONLY_CAUTION` | Still blocked for actual apply; A-16E2 forbids dry-run/apply commands. |
| No post-apply read-only verification result | `REVIEW_ONLY_CAUTION` | Still blocked until A-16F. |
| Final RLS/grant runtime approach not decided | `RLS_BLOCKER` and `PERMISSION_BLOCKER` | Resolved for schema candidate by preserving fail-closed; runtime access remains later. |
| Service-role backend vs user-client Data API path not decided | `RUNTIME_DEPENDENCY_BLOCKER` | Resolved as not needed for schema candidate; deferred to runtime phase. |
| No single `genealogy_id` or `family_tree_id` in schema | `SCHEMA_BLOCKER` | Resolved for candidate by keeping optional `clan_id` and `branch_id`; runtime scope must confirm behavior later. |
| Raw Excel/raw PII storage boundary needed stronger wording | `PII_BLOCKER` | Resolved by SQL candidate markers/comments and doc wording. |
| Indexes/constraints/status lifecycle could be tightened | `SCHEMA_BLOCKER` | Resolved by adding candidate-only check constraints. |

## Migration Candidate Changes

Updated:

- `db/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql`

Changes made in A-16E2:

- Added marker `A16E2_IMPORT_SCHEMA_CANDIDATE_APPLY_BLOCKER_RESOLUTION`.
- Added `SQL_CANDIDATE_STATUS=NOT_APPLIED`.
- Added explicit guard comments:
  - `NO_RAW_EXCEL_CONTENT`
  - `NO_RAW_PII_ROW_STORAGE`
  - `RLS_FAIL_CLOSED_NO_POLICY_NO_GRANT`
- Added `import_sessions_source_file_size_check`.
- Added `import_sessions_hash_presence_check`.
- Added `import_sessions_approval_marker_check`.
- Added JSON object checks for `review_summary` and `privacy_summary`.
- Added JSON object checks for write manifest JSON fields.
- Added `import_write_manifests_approval_consistency_check`.
- Strengthened table comments to state no Excel content and no raw PII row
  storage.

What did not change:

- No seed was added.
- No RLS policy was added.
- No grant was added.
- No `DROP`, `TRUNCATE`, data `UPDATE`, `DELETE FROM`, data `INSERT` or
  `UPSERT` was added.
- No runtime route/action/service was added.
- No dependency was added.

## Remaining Blockers

Remaining blockers before A-16F can run:

- `PERMISSION_BLOCKER`: owner has not supplied
  `APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY`.
- `REVIEW_ONLY_CAUTION`: target Supabase project must be confirmed by owner.
- `REVIEW_ONLY_CAUTION`: backup/rollback/no-go position must be confirmed.
- `REVIEW_ONLY_CAUTION`: Supabase dry-run and apply commands must be run only
  in A-16F after the marker exists.
- `RLS_BLOCKER`: runtime RLS/grant policy is intentionally deferred; schema can
  be applied fail-closed, but runtime access must not be inferred.
- `RUNTIME_DEPENDENCY_BLOCKER`: A-16G/A-16H/A-16I remain blocked until A-16F
  apply verification PASS and their own markers/prerequisites exist.

## Schema Apply Recommendation

Updated recommendation:

```text
A16E2_SCHEMA_APPLY_RECOMMENDATION=READY_FOR_A16F_DB_APPLY_REVIEW
```

Meaning:

- The SQL candidate is now clearer and safer for owner review.
- Schema-specific blockers found in A-16E1 have been resolved or explicitly
  deferred to the correct later phase.
- This is not permission to apply DB.
- A-16F still requires the exact marker:
  `APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY`.

## A-16F Gate

A-16F must not run unless owner provides:

```text
APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY
```

A-16F must also confirm:

- clean repo after A-16E2 commit;
- target Supabase project;
- backup/rollback/no-go position;
- Supabase CLI command syntax;
- dry-run result;
- apply result, if dry-run passes;
- read-only catalog verification;
- RLS verification;
- no seed/no app data mutation.

## Boundary Statement

A-16E2 did not apply DB, did not run `supabase db push`, did not run dry-run,
did not connect production DB, did not seed, did not insert/update/delete/upsert
real data, did not deploy, did not push, did not add dependency, did not commit
Excel/CSV and did not commit real personal data.

Runtime guardrail status:

- Main Worker touched: NO
- Runtime dependency added: NO
- New service Worker created: NO
- OpenNext/Wrangler config changed: NO
- Worker size risk: NO
- Service boundary recommendation: keep large Excel parsing/validation under
  future `genealogy-import-service` or offline tooling review if parser/runtime
  grows beyond light preview coordination.
