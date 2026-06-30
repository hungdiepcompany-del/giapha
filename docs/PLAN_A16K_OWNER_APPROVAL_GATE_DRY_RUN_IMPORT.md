# Plan A-16K - Owner Approval Gate for Dry-run Import

Marker: `A16K_OWNER_APPROVAL_GATE_DRY_RUN_IMPORT`

Owner approval marker required for any later phase:
`APPROVE_A16K_IMPORT_DRY_RUN_GATE`

Final status: `A16K_STATUS=OWNER_APPROVAL_GATE_LOCKED`

## Mục tiêu

A-16K thêm cổng phê duyệt owner trước khi bất kỳ bước dry-run import nào được mở. Phase này chỉ tạo trạng thái gate, API đọc trạng thái, UI khóa hành động, tài liệu và checker.

Dry-run hiện vẫn locked. Official import vẫn closed.

## Phạm vi UI/runtime

- Added server-only gate service:
  `lib/import/giapha4/import-dry-run-approval-gate.ts`.
- Added GET-only API:
  `GET /api/admin/import-sessions/[sessionId]/dry-run-gate`.
- Updated `/admin/exports/import` through
  `components/imports/import-session-manifest-panel.tsx`.
- Added disabled UI block:
  `Cổng phê duyệt dry-run`,
  `Dry-run import chưa được mở`,
  `Cần owner phê duyệt trước khi chạy dry-run.`,
  `Marker yêu cầu: APPROVE_A16K_IMPORT_DRY_RUN_GATE`,
  `Dữ liệu staging vẫn chưa được nhập vào cây gia phả thật.` and
  `Chạy dry-run — cần phê duyệt`.
- Official import CTA remains disabled:
  `Xác nhận nhập chính thức — chưa mở`.

## Guardrail

- Không migration.
- Không sửa migration cũ.
- Không DB push.
- Không chạy `supabase db push`.
- Không chạy `supabase db push --dry-run`.
- Không chạy `supabase migration repair`.
- Không SQL apply.
- Không seed.
- Không upload/parse file thật.
- Không ghi people/relationships thật.
- Không tạo/sửa/xóa people/person thật.
- Không tạo/sửa/xóa relationships thật.
- Không layout/tree/revision.
- Không dry-run mapping.
- Không tạo kết quả dry-run.
- Không official import.
- Không confirm/commit/finalize/import-now route.
- Không mở CTA import chính thức.
- Không service role trong client.
- Không hardcode credential/token/cookie.
- Không deploy.
- Không push.
- Không commit secret/storage state/file thật.

## Điều kiện mở phase sau

- Owner phải phê duyệt marker rõ ràng:
  `APPROVE_A16K_IMPORT_DRY_RUN_GATE`.
- A-16J validation phải được review.
- A-16I2 real-file smoke nên PASS thật hoặc owner chấp nhận SAFE_SKIP rõ ràng.
- Phase sau phải là phase riêng, ví dụ A-16L, và vẫn chỉ được dry-run mapping staging nếu chưa có approval ghi dữ liệu thật.

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
- `npm run smoke:a16i2-real-giapha4-upload-staging` -
  SAFE_SKIP_MISSING_EXPLICIT_ENV.
- `npm run typecheck` - PASS.
- `npm run lint` - PASS.
- `npm run build` - PASS.
- `git diff --check` - PASS.
- `git diff --cached --check` - PASS.

`smoke:a16i2-real-giapha4-upload-staging` safe-skipped because explicit owner base URL, storage state and file path env were absent.

## Bước tiếp theo

- If owner approves `APPROVE_A16K_IMPORT_DRY_RUN_GATE`: open A-16L for dry-run mapping from staging to planned people/relationships without real writes.
- If real-file smoke still needs proof: open A-16I2-RUN with owner-provided `.xlsx` outside git and storage state outside git.
