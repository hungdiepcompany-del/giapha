# PLAN A-16N - Locked Official Import Preflight Gate

Marker: `A-16N`

## Mục tiêu

A-16N thêm cổng khóa/preflight cho nhập chính thức để UI/API hiển thị rõ official import chưa mở và điều kiện cần trước khi mở. Đây là read-only/locked gate, không phải runtime nhập.

## Runtime/UI Được Thêm

- Read-only service: `lib/import/giapha4/official-import-preflight-gate.ts`.
- GET-only route: `GET /api/admin/import-sessions/[sessionId]/official-import-gate`.
- UI block trên admin import panel: `Cổng nhập chính thức`.
- Button disabled: `Xác nhận nhập chính thức — chưa mở`.

Không tạo POST/PUT/PATCH/DELETE. Không DB mutation.

## Gate Response

Route response có:

- `sessionId`.
- `canOpenOfficialImport: false`.
- `officialImportEnabled: false`.
- `requiredFutureMarker: APPROVE_A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE`.
- `requiredBeforeRuntime`.
- `noGoReasons`.
- message tiếng Việt.

## UI Copy

UI hiển thị:

- `Cổng nhập chính thức`.
- `Nhập chính thức chưa được mở`.
- `Dữ liệu staging đã đọc được, nhưng chưa ghi vào cây gia phả thật.`
- `Cần thiết kế transaction, rollback, audit và owner approval riêng trước khi mở.`
- `Marker yêu cầu cho phase sau: APPROVE_A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE`.
- `Xác nhận nhập chính thức — chưa mở`.

## Required Before Runtime

- owner review staging counts;
- validation errors resolved;
- duplicate/conflict reviewed;
- rollback design accepted;
- audit design accepted;
- transaction design accepted;
- separate runtime phase approved.

## Guardrails

- `canOpenOfficialImport=false`.
- `officialImportEnabled=false`.
- `canProceedToOfficialImport=false` in dry-run/review pack remains unchanged.
- Không route POST official import.
- Không server action official import.
- Không people/relationship/layout/revision writes.
- Không migration/SQL apply/DB push/seed/deploy/push.
- Không service-role bypass.
- Không anon/public grant.

`A16N_STATUS=LOCKED_OFFICIAL_IMPORT_PREFLIGHT_GATE_READY`
