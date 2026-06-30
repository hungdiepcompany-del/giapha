# Plan A-16L - Dry-run Mapping Preview from Manifest Staging

Marker: `A16L_DRY_RUN_MAPPING_PREVIEW_FROM_MANIFEST_STAGING`

Owner approval marker received for opening read-only dry-run preview:
`APPROVE_A16K_IMPORT_DRY_RUN_GATE`

Final status: `A16L_STATUS=DRY_RUN_MAPPING_PREVIEW_READY`

## Mục tiêu

A-16L thêm bản xem trước dry-run mapping từ manifest staging sang payload dự kiến cho people/relationships. Phase này chỉ tạo object preview trong runtime/API response và UI review, không ghi preview vào DB và không ghi vào cây gia phả thật.

Official import vẫn closed.

## Phạm vi runtime/UI

- Added server-only preview service:
  `lib/import/giapha4/dry-run-mapping-preview-service.ts`.
- Added GET-only API:
  `GET /api/admin/import-sessions/[sessionId]/dry-run-preview`.
- Updated `/admin/exports/import` through
  `components/imports/import-session-manifest-panel.tsx`.
- UI shows:
  `Bản xem trước dry-run`,
  `Dữ liệu này chỉ là bản mô phỏng, chưa được ghi vào cây gia phả thật.`,
  `Người dự kiến tạo`,
  `Quan hệ dự kiến tạo`,
  `Không thể dry-run vì còn lỗi dữ liệu staging` and
  `Xác nhận nhập chính thức — chưa mở`.

## Mapping preview

The preview reads the A-16G/A-16I manifest staging result and the A-16J validation result in memory:

- staged person -> proposed person payload.
- staged relationship -> proposed relationship payload.
- source row/fingerprint/source table reference.
- related A-16J warning/error items where applicable.

Summary fields:

- `stagedPeopleCount`
- `proposedPeopleCount`
- `stagedRelationshipCount`
- `proposedRelationshipCount`
- `blockedByErrorCount`
- `warningCount`
- `canProceedToOfficialImport: false`

## Guardrail

- Không migration.
- Không sửa migration cũ.
- Không DB push.
- Không chạy `supabase db push`.
- Không chạy `supabase migration repair`.
- Không SQL apply.
- Không seed.
- Không upload/parse file thật.
- Không ghi people/relationships thật.
- Không insert/update/delete/upsert vào people/person thật.
- Không insert/update/delete/upsert vào relationships thật.
- Không layout/tree/revision.
- Không ghi preview vào DB.
- Không official import.
- Không confirm/commit/finalize/import-now route.
- Không deploy.
- Không push.
- Không commit secret/storage state/file thật.

## Checker

- Added `scripts/check-a16l-dry-run-mapping-preview.cjs`.
- Added package script:
  `check:a16l-dry-run-mapping-preview`.
- A-16G/A-16H/A-16I/A-16J/A-16I2/A-16K checker allowlists were updated narrowly for the A-16L read-only preview files.

## Validation

Validation đã chạy:

- `npm run check:env:safe` - PASS.
- `npm run check:migrations` - PASS.
- `npm run check:a16g-import-session-read-manifest-runtime` - PASS.
- `npm run check:a16h-import-manifest-auth-browser-smoke` - PASS.
- `npm run check:a16i-upload-parse-giapha4-manifest-staging` - PASS.
- `npm run check:a16j-manifest-staging-review-validation-warnings` - PASS.
- `npm run check:a16i2-real-giapha4-upload-smoke` - PASS.
- `npm run check:a16k-owner-approval-gate-dry-run-import` - PASS.
- `npm run check:a16l-dry-run-mapping-preview` - PASS.
- `npm run smoke:a16i2-real-giapha4-upload-staging` -
  SAFE_SKIP_MISSING_EXPLICIT_ENV.
- `npm run typecheck` - PASS.
- `npm run lint` - PASS.
- `npm run build` - PASS.

`smoke:a16i2-real-giapha4-upload-staging` safe-skipped because explicit owner base URL, storage state and file path env were absent.

## Bước tiếp theo

- Owner reviews the dry-run mapping preview and A-16J validation issues.
- Any future official import remains a separate phase with transaction, rollback, audit/revision rules and explicit owner approval.
