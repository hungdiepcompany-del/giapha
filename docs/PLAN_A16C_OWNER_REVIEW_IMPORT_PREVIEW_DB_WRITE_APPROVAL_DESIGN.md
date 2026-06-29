# A-16C - Owner Review Import Preview DB Write Approval Design

Status: `A16C_OWNER_REVIEW_APPROVAL_DESIGN_RECORDED`

Marker: `A-16C`

Marker: `A16C_OWNER_REVIEW_IMPORT_PREVIEW_DB_WRITE_APPROVAL_DESIGN`

## Muc Tieu A-16C

A-16C thiet ke quy trinh owner review cho preview import Gia Pha 4.0 Excel
truoc khi xin phe duyet bat ky phase ghi DB that nao. Phase nay la
design/documentation/checker only.

```text
A16C_SCOPE=OWNER_REVIEW_APPROVAL_DESIGN_ONLY
A16C_DB_STATUS=NO_DB_WRITE
A16C_MIGRATION_STATUS=NO_MIGRATION
A16C_SEED_STATUS=NO_SEED
A16C_DEPENDENCY_ADDED=NO
A16C_DEPLOY_STATUS=NO_DEPLOY
A16C_PRODUCTION_MUTATION=NO
```

## Dieu Kien Phu Thuoc A-16/A-16B

Preconditions checked before A-16C:

- A-16 complete: commit `f824cbe`, mapping/readiness doc exists.
- A-16B complete: commit `a05f1a9`, preview runtime/admin UI safe-skip exists.
- `git status -sb`: `main...origin/main [ahead 2]` before A-16C edits.
- `git check-ignore -v .env.local`: `.gitignore:17:.env.*`.
- No `.xls`, `.xlsx` or `.csv` file was staged before A-16C.

A-16C does not change the A-16 mapping and does not override the A-16B parser
safe-skip status. A-16B is still blocked from row-level parsing until owner
approves a parser dependency or offline conversion path.

## Khong DB Write Trong A-16C

Allowed:

- design owner review workflow;
- design approval states;
- design import manifest;
- design future DB write plan;
- design rollback strategy;
- create checker and package command;
- update docs index, work log, decision log and handoff.

Not allowed:

- NO_DB_WRITE;
- no insert/update/delete/upsert;
- no route/action/service that writes import data;
- no migration;
- no seed;
- no RLS/auth/permission runtime change;
- no deploy;
- no push;
- no production data mutation;
- no real Excel file commit;
- no real personal data in docs/checkers/logs;
- no dependency added;
- no active real-import button.

## owner review workflow

Owner review workflow must be sequential and evidence-based:

1. Review 1 - kiem tra summary import:
   - tong so dong doc duoc;
   - so thanh vien du kien;
   - so quan he du kien;
   - so canh bao;
   - so duplicate candidates;
   - so cot chua map.
2. Review 2 - kiem tra danh sach thanh vien du kien:
   - ho ten, gioi tinh, doi/the he, sinh/mat, que quan, chi/nhanh;
   - confirm missing required fields;
   - hold rows with uncertain person identity.
3. Review 3 - kiem tra quan he cha/me/con:
   - father/mother candidates;
   - child candidates;
   - adopted/step/unknown relationship type when explicit;
   - no auto link when relation is ambiguous.
4. Review 4 - kiem tra quan he vo/chong:
   - spouse/couple candidates;
   - multiple marriages or remarriage cases;
   - relationship status and date uncertainty.
5. Review 5 - kiem tra duplicate/ambiguity:
   - strong/medium/weak duplicate candidates;
   - ambiguous name-only matches;
   - missing referenced people.
6. Review 6 - kiem tra du lieu rieng tu/ghi chu:
   - sensitive notes go to private/import notes;
   - public/family/private visibility needs owner review;
   - no private note is published by default.
7. Review 7 - xac nhan scope import:
   - import all safe rows;
   - hold ambiguous rows;
   - skip unsupported/unmapped fields;
   - confirm no auto merge/delete.
8. Review 8 - owner approval marker:
   - attach approval marker to exact preview manifest/hash;
   - record approved scope and blockers;
   - open only the next approved design/runtime phase.

## approval states

Proposed design-only import review states:

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

There is no migration in A-16C. If the current schema has no table for import
review state or manifest persistence, create an A-16D schema candidate phase
first. Do not store these states in DB during A-16C.

## approval marker

Required future markers:

- `APPROVE_A16D_GIAPHA4_IMPORT_SCHEMA_CANDIDATE`
- or, if no schema is needed,
  `APPROVE_A16E_GIAPHA4_IMPORT_DB_WRITE_RUNTIME`

Approval marker policy:

- marker must be supplied explicitly by owner;
- marker must bind to the import preview summary hash or manifest id;
- marker must include mapping version and generated timestamp;
- marker must not be reused for another Excel file;
- marker expires when source Excel file, mapping rules, parser version or
  preview summary changes;
- marker does not authorize auto merge;
- marker does not authorize auto delete;
- marker does not authorize relationship auto-link when ambiguous;
- marker does not authorize production deploy.

## import manifest

Design-only import manifest fields:

| Field | Purpose |
| --- | --- |
| `source_file_name` | local owner-visible filename; do not commit real filename in docs |
| `source_file_size` | uploaded source size |
| `source_file_hash` | hash for binding marker to exact source |
| `generated_at` | preview generation time |
| `mapping_version` | mapping contract version |
| `row_count` | rows read |
| `person_count` | person candidates |
| `relationship_count` | relationship candidates |
| `warning_count` | warnings |
| `duplicate_candidate_count` | duplicate candidates |
| `unmapped_column_count` | columns not mapped |
| `owner_review_status` | design state from approval states |
| `approval_marker` | owner marker when provided |
| `approved_by` | owner/admin identity for future phase |
| `approved_at` | timestamp for future approval |
| `write_plan_summary` | planned DB write groups |
| `rollback_plan_summary` | rollback scope summary |

A-16C does not store this manifest in DB and does not store the real Excel file.
If persistent manifest storage is needed, A-16D must design a schema candidate
with privacy/RLS/export implications.

## DB write plan design

Future DB write phase only, not implemented in A-16C:

1. create people:
   - create only approved new people;
   - skip or hold rows without enough identity evidence;
   - preserve visibility and private notes policy.
2. create parent-child relationships:
   - create family candidates for reviewed father/mother/child groups;
   - use relationship type only when source is explicit;
   - hold ambiguous parent/child links.
3. create spouse/couple relationships:
   - create reviewed spouse/couple pairs;
   - handle multiple spouse cases as separate reviewed pairs;
   - no self-relationship or ambiguous name-only pair.
4. attach branch/generation metadata if schema supports it:
   - use current `branch_name` and `generation_number` where possible;
   - lineage membership tables require separate schema approval if needed.
5. preserve private notes/import notes:
   - sensitive notes stay private;
   - import trace metadata needs explicit schema/runtime plan.
6. skip/hold ambiguous rows:
   - produce `held_rows` for unresolved rows;
   - never silently drop uncertain rows without summary.
7. generate audit summary:
   - counts by create/skip/hold;
   - actor/timestamp;
   - source manifest id/hash.
8. generate rollback manifest:
   - exact IDs created by import session;
   - relationship IDs created by import session;
   - skipped and held rows.

## duplicate policy

Duplicate/merge policy:

- Khong auto merge.
- Khong auto delete.
- Strong duplicate is suggestion only.
- Medium/weak duplicate must be owner reviewed.
- Same name without enough evidence must create a new person or be held by owner
  decision.
- Existing records must not be overwritten automatically.
- DB write phase must include `held_rows` for uncertain data.
- Duplicate decisions must be recorded in import plan/rollback manifest before
  writing any data.

## relationship ambiguity policy

Relationship ambiguity policy:

- Ambiguous parent/spouse/child references must not auto link.
- Missing parent/spouse reference is a warning, not a preview blocker.
- Name-only parent/spouse matching is insufficient for automatic DB write.
- Relationship candidates must preserve source row reference and normalized
  lookup key.
- Parent-child relationship type defaults to `unknown` unless source explicitly
  says biological/adoptive/step/guardian/foster.
- Spouse/couple relationship status defaults to `unknown` unless source is
  explicit.

## privacy/PII policy

- Real preview data can be visible only to owner/admin in UI.
- Docs/checkers must not contain real family names or raw person rows.
- Logs must contain count/summary/masked sample only.
- Real Excel files must not be committed.
- No upload to external services.
- No fixture from real data unless sanitized.
- Private notes/import notes must not become public by default.
- Approval marker must bind to a manifest/hash, not to a pasted list of real
  personal data in docs.

## rollback strategy

Future DB write phase must create a rollback manifest with:

- people created;
- relationships created;
- memberships/branch links created;
- notes/import metadata created;
- skipped rows;
- held rows;
- duplicate decisions;
- actor/timestamp;
- source manifest id/hash.

Rollback policy:

- rollback only records created by the import session;
- do not delete or mutate people that existed before import unless separately
  approved;
- do not rollback outside the source manifest scope;
- do not hard delete if soft delete/revision exists;
- rollback must preserve revision/import audit evidence;
- rollback must be blocked if manifest/hash does not match the import session.

## UI Vietnamese review flow

Future owner review UI design should include Vietnamese user-facing text:

- `Xem lại dữ liệu nhập`
- `Xác nhận đã kiểm tra cảnh báo`
- `Xác nhận đã kiểm tra người trùng`
- `Xác nhận đã kiểm tra quan hệ gia đình`
- `Xác nhận đã kiểm tra dữ liệu riêng tư`
- `Sẵn sàng xin duyệt ghi dữ liệu`
- disabled button: `Ghi dữ liệu thật`
- disabled copy:
  `Ghi dữ liệu thật sẽ được mở ở phase sau sau khi owner phê duyệt`

Suggested sections:

- Review checklist panel;
- warning acknowledgement;
- duplicate review table;
- parent/child relationship review table;
- spouse/couple relationship review table;
- privacy/private notes review;
- approval summary;
- manifest hash/summary display.

A-16C does not implement this UI. If UI implementation is approved later, it
must keep real DB write disabled until the required approval marker and future
phase gates are present.

## Future Phase Gate A-16D/A-16E

Open A-16D only if persistent schema is needed:

- owner provides `APPROVE_A16D_GIAPHA4_IMPORT_SCHEMA_CANDIDATE`;
- schema candidate covers import manifest/review states/rollback manifest;
- RLS/privacy/export implications are reviewed;
- no DB apply occurs in schema-candidate phase.

Open A-16E only if no schema is needed or after A-16D is approved/applied:

- owner provides `APPROVE_A16E_GIAPHA4_IMPORT_DB_WRITE_RUNTIME`;
- approval marker binds to exact preview summary hash or manifest id;
- fresh backup and rollback plan exist;
- parser dependency/offline conversion path is approved;
- duplicate/relationship/privacy review is complete;
- no auto merge/delete;
- held rows are listed;
- DB write transaction plan and rollback manifest are ready.

## Runtime Worker Boundary

- Main Worker touched: NO.
- Runtime dependency added: NO.
- New service Worker created: NO.
- OpenNext/Wrangler config changed: NO.
- Worker size risk: NO for A-16C docs/checker only.
- Service boundary recommendation: keep large Excel parsing/validation in
  offline tooling or future `genealogy-import-service` unless owner explicitly
  approves main-app parser/runtime expansion.

## Validation Plan

- `npm run check:env:safe`
- `npm run check:a16:giapha4-excel-import-mapping-readiness`
- `npm run check:a16b:giapha4-excel-import-preview-runtime-ui`
- `npm run check:a16c:owner-review-import-preview-db-write-approval-design`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `git diff --cached --check`
