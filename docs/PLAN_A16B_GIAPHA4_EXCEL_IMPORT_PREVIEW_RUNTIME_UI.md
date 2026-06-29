# A-16B - Gia Pha 4.0 Excel Import Preview Runtime UI

Status: `A16B_PREVIEW_RUNTIME_STATUS=SAFE_SKIP_MISSING_EXCEL_PARSER_DEPENDENCY`

Marker: `A-16B`

Marker: `A16B_GIAPHA4_EXCEL_IMPORT_PREVIEW_RUNTIME_UI`

## Muc Tieu

A-16B tao khung preview-only trong admin cho file Excel Gia Pha 4.0 tu iPhone.
Phase nay chi cho owner chon file, goi API preview an toan, hien thi summary,
warning, duplicate/ambiguity placeholders va blocker khi thieu Excel parser.

```text
A16B_SCOPE=PREVIEW_RUNTIME_UI_SAFE_SKIP
A16B_PREVIEW_RUNTIME_STATUS=SAFE_SKIP_MISSING_EXCEL_PARSER_DEPENDENCY
A16B_DB_STATUS=NO_DB_WRITE
A16B_DEPENDENCY_ADDED=NO
A16B_DEPLOY_STATUS=NO_DEPLOY
A16B_PRODUCTION_MUTATION=NO
```

## Pham Vi preview-only

Duoc lam:

- them UI trong route hien co `/admin/exports/import`;
- them API preview safe-skip `POST /api/admin/import/giapha4/preview`;
- them module `lib/import/giapha4/*` cho preview contract, normalize va parser
  safe-skip;
- them checker A-16B;
- cap nhat docs index, work log, decision log va handoff.

Khong lam:

- NO_DB_WRITE;
- no insert/update/delete/upsert DB;
- no migration;
- no seed;
- no RLS/auth/permission contract change;
- no production data mutation;
- no deploy;
- no push;
- no dependency without owner approval;
- khong commit file Excel that;
- khong commit du lieu ca nhan that.

## dependency status

Direct dependency status inherited from A-16:

```text
xlsx=MISSING
exceljs=MISSING
csv-parse=MISSING
papaparse=MISSING
DEPENDENCY_ADDED_IN_A16B=NO
A16B_PREVIEW_RUNTIME_STATUS=SAFE_SKIP_MISSING_EXCEL_PARSER_DEPENDENCY
```

Because no approved Excel parser exists, A-16B does not parse rows from real
workbooks. The runtime returns a structured safe-skip preview instead of fake
parsed data.

## parser architecture

Created paths:

- `lib/import/giapha4/types.ts`: preview result, warning, relationship,
  duplicate and summary types.
- `lib/import/giapha4/normalize.ts`: small pure helpers for trim/collapse
  spaces, gender, generation and date text normalization.
- `lib/import/giapha4/parser.ts`: safe-skip parser boundary. It detects `.xls`
  or `.xlsx`, returns metadata/counts only and sets `db_write: false`.
- `lib/import/giapha4/preview.ts`: permission guard and file-size guard before
  returning preview JSON.

Parser behavior in A-16B:

- accepts only a local browser-uploaded `File` object;
- does not store file long-term;
- does not call Supabase writes;
- does not print raw names or rows;
- does not fake person/relationship rows when parser is missing;
- records warning `SAFE_SKIP_MISSING_EXCEL_PARSER_DEPENDENCY`.

## UI flow

UI was added to `/admin/exports/import` before the existing `family.json`
preview form.

Flow:

1. Owner opens admin import page.
2. Owner selects `.xls` or `.xlsx`.
3. UI shows file extension and size only, not raw filename.
4. Owner clicks `Xem trước dữ liệu`.
5. Client posts file to `/api/admin/import/giapha4/preview`.
6. API returns safe-skip preview because parser dependency is missing.
7. UI shows summary cards, warning list, empty preview sections for persons,
   relationships, duplicate candidates and unmapped columns.
8. Button `Nhập dữ liệu thật` is disabled.

khong co nut nhap that hoat dong. If a future button is shown, it must stay
disabled with this copy:

`Nhập dữ liệu thật sẽ được mở ở phase sau sau khi owner phê duyệt.`

## API/server action flow

API path:

`POST /api/admin/import/giapha4/preview`

Behavior:

- uses existing admin permission context;
- allows config-missing local/static preview gate like current import preview
  patterns;
- requires authenticated user with `imports.create` when Supabase config is
  available;
- reads multipart form data only for the selected file metadata;
- enforces 5MB max file size;
- returns preview JSON;
- NO_DB_WRITE;
- no long-term file storage;
- no raw PII logging.

No server action is used for Gia Pha 4.0 in A-16B. The existing `family.json`
server action remains unchanged.

## privacy/PII policy

- khong commit file Excel that;
- khong commit du lieu ca nhan that;
- khong in toan bo danh sach nguoi that vao logs;
- khong upload du lieu len dich vu ngoai;
- UI preview can show real data to owner in a future parser phase, but A-16B
  currently shows no row-level personal data because parser is missing;
- API response exposes file kind and size only, not raw filename;
- docs/checker do not contain real family names or rows.

## duplicate policy

Policy inherited from A-16:

- same full name plus same birth/death date: strong candidate;
- same full name plus same generation/branch: medium candidate;
- same full name only: weak candidate;
- no auto merge;
- no auto delete;
- no auto link quan he mo ho.

A-16B does not compute duplicates because parser dependency is missing. The UI
still reserves the duplicate candidate section and states owner review is
required later.

## warning/ambiguity policy

- Missing parser is a warning with safe-skip status.
- Unsupported file type is a warning.
- Ambiguous parent/spouse/child references must become warnings when parser is
  later enabled.
- Owner review is required for ambiguous parent, mother, spouse or child links.
- No automatic relationship linking by name only.

## A-16C Gate

future owner approval gate cho A-16C:

- owner approves an Excel parser dependency or an offline conversion path;
- owner confirms real workbook handling stays local/private and ignored;
- sanitized fixture exists if tests need committed sample data;
- preview with rows/persons/relationships is reviewed without PII logs;
- duplicate and ambiguity rules are accepted;
- service-boundary impact is reviewed for large files;
- DB write remains closed until a separate import-write approval phase with
  backup, transaction, rollback and revision/import log plan.

## Runtime Worker Boundary

- Main Worker touched: YES, only small admin UI/API coordination and safe-skip
  preview.
- Runtime dependency added: NO.
- New service Worker created: NO.
- OpenNext/Wrangler config changed: NO.
- Worker size risk: LOW for A-16B because no Excel parser or heavy validation
  dependency was added.
- Service boundary recommendation: use offline tooling or
  `genealogy-import-service` before parsing large Gia Pha 4.0 workbooks.

## Validation Plan

- `npm run check:env:safe`
- `npm run check:a16:giapha4-excel-import-mapping-readiness`
- `npm run check:a16b:giapha4-excel-import-preview-runtime-ui`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `git diff --cached --check`
