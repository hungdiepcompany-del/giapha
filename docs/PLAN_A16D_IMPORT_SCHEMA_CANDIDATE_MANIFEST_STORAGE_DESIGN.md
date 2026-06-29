# A-16D - Import Schema Candidate / Manifest Storage Design

Status: `A16D_IMPORT_SCHEMA_CANDIDATE_MANIFEST_STORAGE_DESIGN_RECORDED`

Marker: `A-16D`

Marker: `A16D_IMPORT_SCHEMA_CANDIDATE_MANIFEST_STORAGE_DESIGN`

```text
A16D_SCOPE=SCHEMA_CANDIDATE_DESIGN_AND_CHECKER_ONLY
A16D_DB_APPLY_STATUS=NOT_APPLIED
A16D_DB_WRITE_STATUS=NO_DB_WRITE
A16D_MIGRATION_CANDIDATE_CREATED=YES
A16D_SEED_STATUS=NO_SEED
A16D_DEPENDENCY_ADDED=NO
A16D_DEPLOY_STATUS=NO_DEPLOY
A16D_PRODUCTION_MUTATION=NO
A16D_EXCEL_STORAGE_STATUS=NO_EXCEL_FILE_STORAGE
```

## Muc Tieu

A-16D thiet ke noi luu tru trang thai preview/review/import manifest cho luong
nhap Gia Pha 4.0 Excel. Phase nay chi tao tai lieu, checker va mot migration
SQL candidate chua apply de owner review cau truc bang truoc khi xin phe duyet
DB apply rieng.

Phase nay khong mo import that. Khong co route/action/service nao ghi people,
families, family_parents, family_children, couple_relationships hoac lineage
membership.

## Dieu Kien Phu Thuoc

Preconditions checked before A-16D:

- A-16 complete: commit `f824cbe`, mapping/readiness doc and checker exist.
- A-16B complete: commit `a05f1a9`, preview runtime/UI safe-skip exists.
- A-16C complete: commit `b58ee98`, owner review approval design exists.
- `git status -sb`: `main...origin/main [ahead 3]` before A-16D edits.
- `.env.local` is ignored by `.gitignore:17:.env.*`.
- No `.xls`, `.xlsx` or `.csv` file was staged before A-16D.

A-16D does not override A-16B parser safe-skip status. Row-level Gia Pha 4.0
Excel parsing and real DB write still need later owner approval.

## Pham Vi UI/Runtime/DB

Allowed in A-16D:

- survey existing migration/schema conventions;
- design import session, warning, duplicate candidate, relationship candidate
  and write manifest storage;
- create one SQL migration candidate file, not applied;
- create static checker and package command;
- update docs index, work log, decision log and handoff.

Not allowed in A-16D:

- NO_DB_WRITE;
- no Supabase command that applies schema, including `supabase db push`;
- no production DB connection;
- no insert/update/delete/upsert against real data;
- no seed;
- no RLS/auth/permission runtime change;
- no API contract change for real import write;
- no route/action/service writing people or relationships;
- no real Excel, CSV, screenshot or PII artifact committed;
- no dependency added;
- no deploy and no push.

## Schema Survey

Observed migration convention:

- migration directory: `db/migrations`;
- existing ordered files use `YYYYMMDD_000N_description.sql`;
- latest file before A-16D:
  `db/migrations/20260622_0009_merge_dedupe_schema_candidate.sql`;
- A-16D candidate path:
  `db/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql`.

Relevant existing tables:

- people and family relationship tables:
  `people`, `families`, `family_parents`, `family_children`,
  `couple_relationships`;
- lineage tables:
  `clans`, `clan_branches`, `generation_rules`,
  `person_branch_memberships`;
- audit/export related tables:
  `revisions`, `revision_items`, `export_jobs`, `backup_records`.

There is no single `genealogy_id` or `family_tree_id` table in the current
schema. The candidate therefore uses optional `clan_id` and `branch_id` as the
closest existing lineage scope, and leaves exact runtime scoping to a later
owner-approved apply/runtime phase.

## Candidate Tables

The SQL candidate creates five tables:

| Table | Purpose |
| --- | --- |
| `public.import_sessions` | Import session metadata, source hash, mapping version, review status, counts, approval marker and retention metadata. |
| `public.import_session_warnings` | Warning/error rows with deterministic codes, severity and Vietnamese review messages. |
| `public.import_duplicate_candidates` | Duplicate suggestions linked to source row fingerprints and optional existing `people.id`. |
| `public.import_relationship_candidates` | Parent-child, spouse/couple and branch membership relationship suggestions with ambiguity/owner decision state. |
| `public.import_write_manifests` | Future owner-approved write manifest, approved scope, held rows summary, created record ids and rollback plan. |

Candidate status:

```text
SQL_CANDIDATE_FILE=db/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql
SQL_CANDIDATE_STATUS=NOT_APPLIED
SQL_CANDIDATE_MARKER=A16D_IMPORT_SCHEMA_CANDIDATE_MANIFEST_STORAGE_DESIGN
SQL_APPLY_GATE=APPROVE_A16E_IMPORT_MANIFEST_SCHEMA_APPLY
RUNTIME_IMPORT_WRITE_GATE=APPROVE_A16F_GIAPHA4_IMPORT_DB_WRITE_RUNTIME
```

## Import Session Status

Design-only status values:

- `preview_generated`
- `owner_reviewing`
- `warnings_acknowledged`
- `duplicates_reviewed`
- `relationships_reviewed`
- `privacy_reviewed`
- `ready_for_owner_approval`
- `owner_approved_for_db_write`
- `rejected_needs_fix`
- `expired_preview`
- `write_started`
- `write_completed`
- `rollback_required`
- `rolled_back`

The write-related states are present only so the future runtime can bind a
write manifest to the same review record. A-16D does not set these states in DB.

## Privacy And PII Policy

A-16D does not store or commit a real Excel file. The candidate is designed to
store only metadata, source hash, counts, deterministic row indexes and
fingerprints where possible.

Rules for later runtime:

- no raw workbook content in `import_sessions`;
- no real workbook artifact committed to git;
- no raw PII in checker output, logs or docs;
- duplicate candidates should use fingerprints/reason codes instead of copying
  full raw source rows;
- relationship candidates should store row references, fingerprints and owner
  decision state, not a dump of the spreadsheet;
- private notes from source files remain private and require owner review before
  any public display or export.

## RLS And Permission Candidate

The candidate enables RLS on all five tables and intentionally creates no RLS
policy in A-16D. This keeps the schema fail-closed until a later owner-approved
phase defines exact permissions.

No permission seed is added in A-16D. Existing `imports.create` is noted as a
possible future permission anchor, but A-16D does not grant or register any
new permission.

Future RLS/policy review must decide:

- which roles can create preview sessions;
- which roles can read import manifests;
- which roles can approve manifests;
- whether held rows and duplicate candidates require stricter visibility;
- how import manifests appear in backup/export scopes.

## Duplicate Candidate Storage

Duplicate candidate policy:

- no automatic merge;
- no automatic delete;
- strong, medium, weak and ambiguous matches are suggestions only;
- owner decision must be one of `create_new`, `link_existing`, `hold` or
  `skip`;
- same-name-only matches must stay `ambiguous` unless extra evidence exists.

The table references `people.id` only for an optional existing-person match.
Creating or linking a person remains blocked until A-16F or a later approved
runtime phase.

## Relationship Candidate Storage

Relationship candidate policy:

- parent-child links must be owner reviewed;
- spouse/couple links must be owner reviewed;
- branch membership links must be owner reviewed;
- missing or conflicting references remain held;
- ambiguous relationships must not be auto-linked.

The table supports `parent_child`, `spouse_couple` and `branch_membership`
candidate types because the current schema already has family/couple and
lineage tables.

## Approval Marker Policy

Approval marker must bind to the exact source file hash, preview manifest hash,
mapping version and generated review result.

Required future gates:

- A-16E DB apply verification gate:
  `APPROVE_A16E_IMPORT_MANIFEST_SCHEMA_APPLY`.
- A-16F DB write runtime gate:
  `APPROVE_A16F_GIAPHA4_IMPORT_DB_WRITE_RUNTIME`.

Approval marker does not authorize:

- DB apply during A-16D;
- real import write runtime;
- auto merge;
- auto delete;
- ambiguous relationship auto-link;
- production deploy.

## Retention And Cleanup Policy

Candidate retention fields are metadata-only:

- `created_at`;
- `updated_at`;
- `retention_until`;
- session `status`.

Later phases should define cleanup behavior for expired preview sessions,
warnings, duplicate candidates, relationship candidates and unused write
manifests. A-16D does not implement cleanup runtime.

## Rollback And Audit Strategy

Future write manifests must include:

- approved scope;
- planned counts;
- held rows summary;
- rollback plan;
- created record ids grouped by table;
- actor and timestamp fields;
- approval marker and manifest hash.

Rollback must not rely on name matching. It must use exact ids created by the
approved import write transaction or a later approved audit mechanism.

## Safety Checks

A-16D checker verifies:

- phase doc exists and contains the marker;
- package command exists;
- docs index, work log, decision log and handoff contain A-16D;
- SQL candidate exists and is marked `NOT_APPLIED`;
- candidate includes the five expected tables and RLS enabled;
- candidate avoids seed, data mutation statements, broad grants and policies;
- changed files stay in the A-16D allowlist;
- no `.env.local`, Excel/CSV, session, token, image or evidence artifact is
  changed;
- package dependencies did not change.

## Next Phase Gate

Next possible phase:

- A-16E: DB apply verification gate for the import manifest schema candidate.

A-16E must be separately approved and must include backup readiness, target
project confirmation, one-file apply plan, rollback/no-go plan and post-apply
catalog verification.

DB write runtime remains blocked until A-16F or a later explicitly approved
phase after parser/preview evidence, owner review evidence, schema apply
verification and rollback planning are complete.
