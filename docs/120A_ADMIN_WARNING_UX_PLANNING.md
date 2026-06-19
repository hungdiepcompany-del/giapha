# Phase 120A - Admin Warning UX Planning

Status: `DESIGN_ONLY_LOCAL_STATIC_VALIDATED`

## Summary

Phase 120A plans how future admin warning UX should present media and data-quality guidance without implementing runtime UI. It is documentation only. It does not create components, routes, mock runtime data, schema, migrations, service Workers, dependencies or deploy changes.

## Admin Warning UX Principles

- Warnings should help admins act, not shame or overwhelm them.
- The first line should state the issue; the second line may give the next action.
- Use consistent severity labels and colors across people, genealogy and tree admin surfaces.
- Do not block ordinary browsing for informational warnings.
- Reserve blocking warnings for actions that would create data risk, such as future import confirmation or public exposure.
- Keep private context inside admin-only surfaces.

## Suggested Locations

- Person detail: near biography, lineage membership and relationship sections.
- Genealogy admin dashboard: small summary counts for clan/branch/generation membership issues.
- Clan and branch forms: inline hints for missing Sino-Vietnamese name, branch code or generation rule context.
- Tree editor: compact badges on selected person panel, not crowded directly inside every node.
- Future import preview: grouped warnings by row/person before confirmation.

## Vietnamese Severity Labels

- Info: `Thông tin`
- Warning: `Cần chú ý`
- Blocking: `Cần xử lý trước khi tiếp tục`

Suggested copy shape:

- `Thông tin`: `Có thông tin nên bổ sung khi gia đình xác minh được.`
- `Cần chú ý`: `Dữ liệu này có thể chưa khớp với phả hệ hiện tại.`
- `Cần xử lý trước khi tiếp tục`: `Cần xử lý cảnh báo này trước khi thực hiện thao tác rủi ro.`

## Empty State Copy

- People detail: `Chưa có cảnh báo dữ liệu cho hồ sơ này.`
- Genealogy admin: `Chưa phát hiện cảnh báo phả hệ trong phạm vi đang xem.`
- Tree editor: `Chưa có cảnh báo hiển thị cho nút đang chọn.`
- Future import preview: `Không có cảnh báo chặn trong dữ liệu xem trước.`

## Privacy-Safe Behavior

- Public pages must not show admin warning text.
- Warning text should avoid copying private notes or source details.
- Living-person context remains admin-only.
- Duplicate suspicion should show only records the current admin is allowed to view.
- Media warnings must not expose storage keys, signed URLs or object names on public routes.

## What Is Deferred

- Runtime warning components.
- Persistent warning tables.
- Full-family data quality scan.
- Import-wide validation.
- Media metadata schema.
- Media upload, thumbnail generation and storage bucket work.
- Service Worker creation or Worker binding.
- OpenNext/Wrangler config changes.

## Next Phase Recommendation

Phase 120B may draft a static admin warning contract and component acceptance checklist. Runtime implementation should wait until the owner chooses whether warnings are lightweight view-derived hints or persistent service-generated records.

## Runtime And Worker Boundary Status

- Main Worker touched: NO
- Runtime dependency added: NO
- New service Worker created: NO
- OpenNext/Wrangler config changed: NO
- Worker size risk introduced by this phase: NO
- Runtime UI implemented: NO
- Mock runtime data added: NO
- Migration created: NO
- SQL file created: NO
- DB apply: NO
- SQL mutation: NO
- Deploy: NO
- Push: NO
