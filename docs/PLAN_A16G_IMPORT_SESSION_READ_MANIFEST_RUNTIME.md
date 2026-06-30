# A-16G - Import Session / Read Manifest Runtime

Status: `A16G_STATUS=IMPORT_SESSION_READ_MANIFEST_RUNTIME_READY`

Marker: `A-16G`

Runtime marker: `A16G_IMPORT_SESSION_READ_MANIFEST_RUNTIME`

## Goal

A-16G opens the first runtime foundation for Gia Pha 4 import manifest review.
It only reads import session metadata and import manifest rows so the owner can
review staged manifest data before any real import.

This phase does not import data into the real genealogy tree.

## Context

A-16F5M recorded owner manual SQL apply PASS for:

- `import_sessions`
- `import_session_warnings`
- `import_duplicate_candidates`
- `import_relationship_candidates`
- `import_write_manifests`

Owner also reported RLS enabled, no unintended public/anon policy and zero seed
rows. Because the SQL was applied manually in Supabase Dashboard, Supabase CLI
migration history may still need reconciliation before any future CLI migration
operation.

## Runtime Scope

Implemented read-only runtime:

- `lib/import/giapha4/manifest-read-service.ts`
- `GET /api/admin/import-sessions`
- `GET /api/admin/import-sessions/[sessionId]`
- `GET /api/admin/import-sessions/[sessionId]/manifest`
- Read-only admin UI panel on `/admin/exports/import`

The stable response shape includes:

- `session`
- `sessions`
- `manifestSummary`
- `peoplePreview`
- `relationshipsPreview`
- `warnings`
- `canImport: false`

The service uses the existing auth/permission context and Supabase server client
with the user's cookie session. It does not use service role in client code and
does not bypass RLS. If RLS blocks reads or the manifest is empty, the UI/API
returns a safe Vietnamese empty/error state instead of crashing.

## UI Copy

The admin page now includes Vietnamese read-only copy:

- `Phiên nhập dữ liệu`
- `Manifest dữ liệu`
- `Chưa có dữ liệu manifest`
- `Dữ liệu bên dưới chỉ là bản xem trước, chưa được nhập vào cây gia phả.`
- `Chưa mở bước xác nhận nhập chính thức.`
- `Không tìm thấy phiên nhập hoặc bạn không có quyền truy cập.`
- `Xác nhận nhập chính thức — chưa mở`

## Safety Boundary

A-16G confirms:

```text
A16G_DB_PUSH_STATUS=NOT_RUN
A16G_DB_DRY_RUN_STATUS=NOT_RUN
A16G_SQL_APPLY_STATUS=NOT_RUN
A16G_MIGRATION_STATUS=NO_NEW_MIGRATION
A16G_SEED_STATUS=NO_SEED
A16G_EXCEL_IMPORT_STATUS=NO_REAL_EXCEL_IMPORT
A16G_PEOPLE_WRITE_STATUS=NO_WRITE
A16G_RELATIONSHIP_WRITE_STATUS=NO_WRITE
A16G_TREE_LAYOUT_WRITE_STATUS=NO_WRITE
A16G_REVISION_WRITE_STATUS=NO_WRITE
A16G_CAN_IMPORT=false
A16G_IMPORT_CONFIRM_ACTION=DISABLED_READ_ONLY
A16G_DEPLOY_STATUS=NOT_DEPLOYED
A16G_PUSH_STATUS=NOT_PUSHED
```

A-16G did not create a migration, did not modify old migrations, did not run
`supabase db push`, did not run `supabase db push --dry-run`, did not run SQL
apply, did not seed, did not import Excel into DB, did not create real people,
did not create real relationships, did not update tree layout, did not write
revisions, did not deploy and did not push.

Exact no-go confirmations:

- did not run `supabase db push`
- did not run `supabase db push --dry-run`
- did not run SQL apply

## Next Phase Options

A later A-16H can be one of two separate owner-approved tracks:

- Authenticated browser smoke for the read-only manifest screen.
- Upload/parse Gia Pha 4 file into manifest staging only, still without writing
  real people/relationships.

Runtime guardrail status:

- Main Worker touched: YES, small existing Next.js route/page/service only.
- Runtime dependency added: NO
- New service Worker created: NO
- OpenNext/Wrangler config changed: NO
- Worker size risk: LOW
- Service boundary recommendation: keep future heavy Excel parsing/import apply
  behind a separate approval phase and avoid main Worker expansion unless
  explicitly accepted.
