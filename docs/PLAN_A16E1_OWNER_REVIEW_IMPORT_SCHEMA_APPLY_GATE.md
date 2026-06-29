# A-16E1 - Owner Review Import Schema Apply Gate

Status: `A16E1_OWNER_REVIEW_IMPORT_SCHEMA_APPLY_GATE_RECORDED`

Marker: `A-16E1`

Marker: `A16E1_OWNER_REVIEW_IMPORT_SCHEMA_APPLY_GATE`

```text
A16E1_SCOPE=OWNER_REVIEW_DOCS_CHECKER_ONLY
A16E1_DB_APPLY_STATUS=NOT_APPLIED
A16E1_DB_WRITE_STATUS=NO_DB_WRITE
A16E1_SEED_STATUS=NO_SEED
A16E1_DEPENDENCY_ADDED=NO
A16E1_DEPLOY_STATUS=NO_DEPLOY
A16E1_RECOMMENDATION=DO_NOT_APPLY_UNTIL_OWNER_MARKER_AND_TARGET_CONFIRMATION
A16E1_HARD_STOP_REASON=MISSING_APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY
```

## Muc Tieu

A-16E1 review lai toan bo A-16D SQL migration candidate va A-16E DB apply
gate truoc khi owner quyet dinh co mo A-16F apply DB hay khong. Phase nay chi
la review/docs/checker, khong apply DB, khong chay `supabase db push`, khong
seed, khong ghi du lieu, khong deploy va khong them dependency.

Required owner marker for A-16F:

```text
APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY
```

Marker tren khong co trong prompt/context hien tai. A-16E1 vi vay phai dung
sau commit va khong tu chay A-16F.

## Inputs Reviewed

- `docs/PLAN_A16D_IMPORT_SCHEMA_CANDIDATE_MANIFEST_STORAGE_DESIGN.md`
- `docs/PLAN_A16E_IMPORT_SCHEMA_CANDIDATE_DB_APPLY_GATE.md`
- `db/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql`
- `docs/03_DATABASE_MODEL.md`
- `docs/04_PERMISSION_PRIVACY_MODEL.md`
- `docs/RUNTIME_WORKER_GUARDRAIL.md`
- `docs/SERVICE_BOUNDARY_ROADMAP.md`
- Supabase official Data API security guidance for grants and RLS.

Preflight result:

- `git status -sb`: `main...origin/main`, working tree clean before A-16E1.
- `git log --oneline --decorate -20`: A-16 through A-16E commits are present;
  HEAD before edits is `1ba9279`.
- `.env.local` is ignored by `.gitignore:17:.env.*`.
- No staged files and no staged `.xls`, `.xlsx` or `.csv` file.

## Review Result

Overall result: `A16E1_REVIEW_RESULT=PASS_WITH_OWNER_APPLY_GATE_BLOCKED`.

Recommendation:

```text
A16E1_APPLY_RECOMMENDATION=DO_NOT_APPLY_YET
A16E1_REASON=OWNER_MARKER_TARGET_BACKUP_AND_POLICY_CONFIRMATION_MISSING
```

The SQL candidate is structurally suitable for a later apply phase, but A-16E1
does not recommend applying it yet because the required owner marker, target
Supabase project confirmation, backup/rollback position and future runtime
RLS/grant approach are not confirmed in this prompt.

## Pass List

- Migration path follows current repo convention:
  `db/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql`.
- Candidate uses additive `create table if not exists` and index statements.
- Candidate includes the five expected import storage tables:
  `import_sessions`, `import_session_warnings`,
  `import_duplicate_candidates`, `import_relationship_candidates`,
  `import_write_manifests`.
- Candidate includes source hash and preview manifest hash on
  `import_sessions`.
- Candidate includes review lifecycle status values for preview, owner review,
  approval, rejection, expiry, write and rollback states.
- Candidate includes warning storage with severity, row/column reference and
  Vietnamese message field.
- Candidate includes duplicate candidate storage with source row fingerprint,
  optional existing `people.id`, match strength and owner decision.
- Candidate includes relationship candidate storage with relationship type,
  source/related row references, confidence, ambiguity status and owner
  decision.
- Candidate includes write manifest storage with manifest hash, approval marker,
  approved scope, held rows summary, rollback plan and created record ids.
- Candidate enables RLS on all five import tables.
- Candidate creates no RLS policies and no grants, keeping storage fail-closed.
- Candidate does not store workbook binary content.
- Candidate avoids raw workbook row payload columns; it favors metadata, hashes,
  counts, fingerprints, row indexes and owner decisions.
- Candidate supports rollback/audit planning through `import_write_manifests`.

## Fail List

No direct SQL safety failure was found in the static review.

Static scan result:

- no dangerous `DROP TABLE`;
- no `TRUNCATE`;
- no `DELETE FROM`;
- no data `UPDATE`;
- no seed/data `INSERT`;
- no `CREATE POLICY`;
- no broad `GRANT`;
- no RLS disable statement.

Note: foreign-key `ON DELETE` clauses are not data deletion commands and are
acceptable in this candidate review.

## Blocker List

Apply blockers before A-16F:

- missing owner marker `APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY`;
- target Supabase project not confirmed in this phase;
- backup/rollback/no-go position not confirmed in this phase;
- dry-run not run because A-16E1 forbids DB apply commands;
- no post-apply read-only verification result yet;
- no final RLS/grant policy for runtime read/write access yet;
- no decision yet whether import session runtime uses guarded service-role
  backend flow or user-client Data API flow.

Design caution:

- current schema has no single `genealogy_id` or `family_tree_id` table. A-16D
  uses optional `clan_id` and `branch_id`, which matches the current lineage
  schema, but a later runtime phase must confirm exact import scope behavior.

## Naming And Schema Convention Review

Result: `A16E1_NAMING_REVIEW=PASS_WITH_SCOPE_CAUTION`.

- `db/migrations` is the current migration directory.
- File name follows the existing ordered convention:
  `YYYYMMDD_0010_a16d_import_manifest_storage_candidate.sql`.
- Table names are import-specific and do not conflict with existing people,
  family, lineage, revision, export or backup tables.
- Column names are consistent with the A-16C/A-16D manifest language:
  source hash, manifest hash, status, approval marker, owner decision, rollback
  plan and created ids.
- Foreign keys reference existing known tables: `profiles`, `people`, `clans`
  and `clan_branches`.

## RLS Fail-Closed Review

Result: `A16E1_RLS_REVIEW=PASS_FAIL_CLOSED`.

The candidate enables RLS on:

- `public.import_sessions`
- `public.import_session_warnings`
- `public.import_duplicate_candidates`
- `public.import_relationship_candidates`
- `public.import_write_manifests`

There are no policies and no grants in the candidate. This RLS fail-closed
posture is acceptable for schema apply readiness because import review data can
contain sensitive family evidence and should remain inaccessible until exact
runtime access is approved.

Supabase Data API review:

- grants decide whether `anon`, `authenticated` or `service_role` can reach a
  table through the Data API;
- RLS then decides which rows granted roles can read or mutate;
- A-16E1 intentionally does not add grants or policies;
- a later runtime/policy phase must approve grants and RLS policies together if
  the admin UI uses client/Data API access.

## Privacy And PII Review

Result: `A16E1_PRIVACY_REVIEW=PASS_WITH_RUNTIME_GUARDS_REQUIRED`.

The candidate does not require committing a real Excel file, raw workbook rows,
full person lists or private notes. Future runtime must preserve:

- no real Excel file committed;
- no raw PII in logs/docs/checkers;
- no list of real family members printed to terminal output;
- no public read access to import sessions, duplicate candidates, relationship
  candidates or write manifests;
- private notes and sensitive import evidence stay owner/admin reviewed.

## Rollback And Audit Review

Result: `A16E1_ROLLBACK_AUDIT_REVIEW=PASS_FOR_SCHEMA_CANDIDATE`.

The candidate includes rollback/audit support through:

- `import_sessions.approval_marker`;
- `import_sessions.approved_by`;
- `import_sessions.approved_at`;
- `import_write_manifests.manifest_hash`;
- `import_write_manifests.approval_marker`;
- `import_write_manifests.approved_scope`;
- `import_write_manifests.held_rows_summary`;
- `import_write_manifests.rollback_plan`;
- `import_write_manifests.created_record_ids`;
- actor and timestamp fields.

Future DB write runtime must still create a transaction/rollback runbook and
must not rely on name matching for rollback.

## Apply Recommendation

Recommendation: `DO_NOT_APPLY_YET`.

A-16E1 recommends asking owner for the explicit A-16F marker only after owner
has reviewed:

- target Supabase project;
- backup/rollback/no-go position;
- exact candidate file;
- no-seed/no-data-mutation scope;
- future RLS/grant/runtime access approach;
- post-apply read-only verification plan.

If owner wants to apply, they must provide:

```text
APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY
```

Without that exact marker, A-16F must not run.

## Hard Stop

A-16E1 does not apply DB, does not run `supabase db push`, does not run a
dry-run, does not connect production DB, does not seed, does not mutate data,
does not add dependency, does not deploy and does not push.

Blocked next phases:

- A-16F DB apply verification: blocked until owner marker is supplied.
- A-16G import session/read manifest runtime: blocked until A-16F apply and
  verification PASS.
- A-16H Excel parser dependency: blocked until exact parser dependency marker.
- A-16I DB write runtime: blocked until schema apply PASS, parser/preview
  evidence, owner-approved manifest and DB write marker.

Runtime guardrail status:

- Main Worker touched: NO
- Runtime dependency added: NO
- New service Worker created: NO
- OpenNext/Wrangler config changed: NO
- Worker size risk: NO
- Service boundary recommendation: keep large Excel parsing/validation under
  future `genealogy-import-service` or offline tooling review if parser/runtime
  grows beyond light coordination.
