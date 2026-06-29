# A-16 - Import Du Lieu Gia Pha 4.0 Tu File Excel iPhone

Status: `PREVIEW_ONLY_MAPPING_READINESS_RECORDED`

Marker: `A-16`

Marker: `A16_GIAPHA4_EXCEL_IMPORT_MAPPING_READINESS`

## Muc Tieu

A-16 chuan bi import du lieu Gia Pha 4.0 tu file Excel iPhone vao he thong GIA
PHA bang cach phan tich readiness, thiet ke mapping, dinh nghia preview-only
flow va tao checker an toan. Phase nay khong ghi DB that.

```text
A16_SCOPE=READ_ONLY_ANALYSIS_MAPPING_PREVIEW_READINESS
A16_DB_STATUS=NO_DB_WRITE
A16_DEPLOY_STATUS=NO_DEPLOY
A16_PRODUCTION_MUTATION=NO
```

## Pham Vi Khong Ghi DB

Duoc lam:

- doc import design va mapping spec;
- doc duplicate policy va relationship mapping;
- tao script inspect read-only safe-skip;
- tao checker readiness;
- cap nhat docs index, work log, decision log va handoff.

Khong lam:

- NO_DB_WRITE;
- no DB insert/update/delete;
- no migration;
- no seed;
- no RLS/auth/permission change;
- no API runtime chinh;
- no production data mutation;
- no deploy;
- no push;
- no dependency without owner approval;
- no commit file Excel that;
- no commit du lieu ca nhan that.

## privacy/PII policy

- khong commit file Excel that;
- khong commit du lieu ca nhan that;
- khong in toan bo danh sach nguoi that vao log;
- khong dua du lieu ca nhan vao docs/checker;
- khong upload du lieu len dich vu ngoai;
- neu can fixture thi tao fixture da an danh/sanitized;
- script inspect chi duoc in metadata, sheet names, row count, column headers va
  sample shape da mask;
- khong tao output file chua PII.

## Repo Va File Mau

Commands da chay:

- `git status -sb`
- `git log --oneline --decorate -12`
- `git check-ignore -v .env.local`
- tim file `.xls`, `.xlsx`, `.csv` trong `data/import-samples/`, `tmp/`,
  `private/` va root project;
- doc `package.json`;
- kiem tra optional parser bang `require.resolve`.

Observed:

```text
GIT_STATUS_BEFORE_A16=PASS_SYNCED_CLEAN
HEAD_BEFORE_A16=fc1e951 docs: verify github actions linux production deploy
ENV_LOCAL_IGNORED=true
ENV_LOCAL_IGNORE_RULE=.gitignore:17:.env.*
DATA_IMPORT_SAMPLES_DIR=MISSING
TMP_DIR=MISSING
PRIVATE_DIR=MISSING
ROOT_EXCEL_FILE_FOUND=NO
REAL_EXCEL_FILE_COMMITTED=NO
REAL_EXCEL_FILE_STAGED=NO
```

No real Gia Pha 4.0 Excel file was found in the checked safe locations during
A-16. The example owner filename `Pham Van.xls` is treated as an example only
and is not committed.

Before placing a real family Excel file in the repo workspace, owner should use
an ignored local-only folder such as `private/` or `tmp/`, or add an ignore rule
in a separate safe-prep step. Do not commit the real file.

## Dependency Readiness

Direct dependency check:

```text
xlsx=MISSING
exceljs=MISSING
csv-parse=MISSING
papaparse=MISSING
EXCEL_PREVIEW_SCRIPT_STATUS=SAFE_SKIP_EXCEL_DEPENDENCY_MISSING
DEPENDENCY_ADDED_IN_A16=NO
```

A-16 does not add an Excel parser dependency because owner approval was not
provided. `scripts/inspect-giapha4-excel-import.cjs` exists, accepts
`GIAPHA4_EXCEL_PATH` or an arg path, and safe-skips when no Excel parser is
installed.

## Cau Truc Excel Quan Sat Duoc

No real workbook was available in A-16, so sheet names, row counts and actual
headers remain:

```text
EXCEL_STRUCTURE_STATUS=NOT_OBSERVED_NO_SAMPLE_FILE
SHEET_NAMES=UNKNOWN
HEADER_COLUMNS=UNKNOWN
ROW_COUNT=UNKNOWN
```

Expected Gia Pha 4.0 header families to inspect later:

| Expected field group | Possible column meaning | Handling |
| --- | --- | --- |
| Ho ten | ho ten day du cua thanh vien | map to `full_name`; never log full values in docs |
| Ten thuong goi / phap danh / ten khac | alias or display label | map to `display_name` or preserve in private note |
| Gioi tinh | nam/nu/khac/khong ro | normalize to `male`, `female`, `other`, `unknown` |
| Ngay sinh | date/year/month-year/free text | map to `birth_date` plus precision when parseable |
| Ngay mat | date/year/month-year/free text | map to `death_date` plus precision when parseable |
| Que quan | ancestral home town | map to `home_town` |
| Noi sinh | place of birth | map to `birth_place` |
| Doi / the he | generation number | map to `generation_number` when positive integer |
| Chi / nhanh | branch label | map to `branch_name`; future lineage tables later |
| Cha | father/parent reference by name or row ref | relationship candidate only |
| Me | mother/parent reference by name or row ref | relationship candidate only |
| Vo / chong | spouse reference | spouse/couple candidate only |
| Con | child references | parent-child candidate only |
| Ghi chu | free text | prefer `notes_private` or `import_notes` bucket |
| Trang thai con song / da mat | living/deceased status | map to `is_living`, cross-check death date |

## Proposed Person Mapping

This mapping targets current `people` fields only; no schema moi trong A-16.

| Gia Pha 4.0 meaning | Current field | Proposed rule |
| --- | --- | --- |
| Ho ten | full_name / display_name | `full_name` is required; `display_name` can use alias/preferred name |
| Ten thuong goi, phap danh, ten khac | display_name, notes_private | display name if user-facing; otherwise preserve as private import note |
| Gioi tinh | gender | normalize Vietnamese values to `male`, `female`, `other`, `unknown` |
| Ngay sinh | birth_date | parse ISO/date/year if safe; set precision `exact`, `year_month`, `year`, `approximate`, `unknown` |
| Ngay mat | death_date | parse same as birth date; if present set `is_living=false` |
| Trang thai song/mat | is_living | death date wins; explicit deceased sets false; unknown defaults true only for preview candidate |
| Noi sinh | birth_place | trimmed text |
| Que quan | home_town | trimmed text |
| Chi / nhanh | branch_name | preserve text; no lineage table write in A-16 |
| Doi / the he | generation_number | positive integer only; invalid values become warning |
| Tieu su ngan | short_bio | only if source column is intended public/family safe |
| Ghi chu rieng | notes_private | sensitive or uncertain text goes private |
| Visibility | visibility | default `family`; owner can choose later in preview UI |

Unmapped or ambiguous fields:

- preserve as `import_notes` in preview report, not DB in A-16;
- sensitive free text should become `notes_private` candidate;
- fields with unclear meaning should be skipped with warning;
- source row number should remain traceability metadata only.

## relationship mapping

Relationship candidates are preview-only and must not write `families`,
`family_parents`, `family_children` or `couple_relationships` in A-16.

| Gia Pha 4.0 relation | Current model target | Proposed rule |
| --- | --- | --- |
| Cha | parent-child | create preview family candidate with parent_role `father` |
| Me | parent-child | create preview family candidate with parent_role `mother` |
| Cha/me unknown | parent-child | parent_role `unknown`; warning if ambiguous |
| Con | parent-child | add child candidate to family candidate |
| Vo/chong | spouse/couple | create `couple_relationships` candidate with status `married` or `unknown` |
| Tai hon / nhieu vo chong | spouse/couple | create separate candidate pairs; require owner review |
| Con rieng / con nuoi | parent-child | use relationship type `step`, `adoptive` or `unknown` only when source is explicit |
| Chi / nhanh | people/lineage later | keep `branch_name`; future lineage membership needs separate approval |

Relationship preview should keep source row references and normalized lookup keys,
but never auto-resolve ambiguous people by name only.

## Import Pipeline An Toan

preview-only flow:

1. Owner places Excel file in ignored local folder.
2. Read local Excel file with an approved parser dependency or external
   conversion process.
3. Parse rows into raw row objects.
4. Normalize names, dates, gender, status, branch and generation.
5. Build person candidates.
6. Build relationship candidates.
7. Detect duplicates and ambiguous references.
8. Show preview-only report with masked/summarized evidence.
9. Owner confirms in a later approved phase.
10. Only a future approved DB write later phase inserts/updates data.

No import confirm, no restore, no overwrite and no hard delete are allowed in
A-16.

## duplicate policy

- Same `full_name` plus same `birth_date` and same `death_date`: strong
  duplicate candidate.
- Same `full_name` plus same `generation_number` or same `branch_name`: medium
  duplicate candidate.
- Same name only: weak candidate; never auto merge.
- Missing parent/spouse references: warning, not blocker for preview.
- Ambiguous spouse/parent: owner review required.
- No auto delete.
- No auto merge.
- No automatic overwrite of existing people.

## Blockers / Risks

- No real Excel sample was present in safe locations, so structure is not
  observed.
- No Excel parser dependency is installed.
- Real family data is highly sensitive and must stay local/ignored.
- Gia Pha 4.0 may export merged cells, encoded Vietnamese text, multiple sheets
  or relationship columns that need app-specific interpretation.
- Relationship resolution by names can be ambiguous in Vietnamese families.
- Large import preview may need offline tooling or `genealogy-import-service`
  boundary later.

## A16B runtime preview/import UI

Conditions to open A-16B:

- future owner approval gate is explicitly recorded for parser/runtime preview;
- owner provides sanitized fixture or confirms local-only real file handling;
- owner approves Excel parser dependency or an external conversion step;
- preview script can report sheet names, row counts and headers without PII;
- mapping gaps are reviewed by owner;
- no production DB write is still maintained;
- service boundary impact is reviewed for large files.

## DB write later phase

Conditions to open a DB write later phase:

- owner explicitly approves DB write phase;
- fresh production backup exists and rollback plan is documented;
- import preview is reviewed and accepted by owner;
- duplicate/ambiguity warnings are resolved;
- transaction plan covers people, families, parents, children and couples;
- revision/import log plan is implemented;
- no hard delete and no auto merge remain enforced;
- permissions and privacy review are complete.

## Service Boundary

- Main Worker touched: NO.
- Runtime dependency added: NO.
- New service Worker created: NO.
- OpenNext/Wrangler config changed: NO.
- Worker size risk: NO for A-16 docs/checker/script safe-skip.
- Service boundary recommendation: consider offline tooling or
  `genealogy-import-service` for large Excel previews after owner approval.

## Validation Plan

- `npm run check:env:safe`
- `npm run check:a16:giapha4-excel-import-mapping-readiness`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `git diff --cached --check`
