# Phase 120C - Admin Warning UX Acceptance Checklist

Static UX acceptance status: `DESIGN_ONLY`

## Summary

Phase 120C defines acceptance criteria and copy examples for future admin warning UI. It does not implement components, routes, warning queries, fake runtime data, persistence or scan services.

## Admin UX Acceptance Checklist

### People Page

- [ ] Warnings appear near the relevant identity, lineage or relationship section.
- [ ] The page distinguishes information, warning and blocking severity.
- [ ] A blocking warning blocks only the risky action.
- [ ] Private details remain admin-only.

### Genealogy Page

- [ ] Clan, branch, generation and membership warnings identify the affected scope.
- [ ] Grouped counts do not imply a full scan unless one actually ran.
- [ ] Resolution links use existing authorized admin paths.

### Tree Editor

- [ ] Warning summary appears in the selected-node panel rather than crowding every node.
- [ ] Relationship cycle risk is clear before a proposed save.
- [ ] Color is not the only signal.

### Import Preview Later

- [ ] Warnings are grouped by row/person and severity.
- [ ] Blocking issues prevent import confirmation only.
- [ ] Preview remains non-mutating.
- [ ] Large validation follows the import/service boundary.

### Export Readiness Later

- [ ] Warnings identify package-level readiness without exposing private content.
- [ ] Missing media/checksum issues are actionable.
- [ ] Large JSON/GEDCOM/ZIP/media checks follow the export service boundary.

## Vietnamese Copy Examples

- No warnings: `Chưa có cảnh báo trong phạm vi đang xem.`
- Info: `Thông tin: Hồ sơ còn mục có thể bổ sung khi gia đình xác minh được.`
- Warning: `Cảnh báo: Dữ liệu này cần được kiểm tra thêm.`
- Blocking: `Cần xử lý: Hãy xử lý cảnh báo này trước khi tiếp tục thao tác.`
- Resolved later: `Đã xử lý: Cảnh báo này đã được xác minh và đóng.`

These are static examples, not runtime strings or fake scan results.

## Accessibility And Clarity Checklist

- [ ] Color not only signal.
- [ ] Clear labels for every severity.
- [ ] No raw technical error leakage.
- [ ] Actionable next step.
- [ ] Safe empty state that does not claim a scan ran.
- [ ] Keyboard and screen-reader semantics planned for future components.
- [ ] Warning title and affected scope remain concise.

## Privacy-Safe Checklist

- [ ] No hidden relationship facts on public routes.
- [ ] No private note leakage.
- [ ] No living-person sensitive detail leakage.
- [ ] No storage key, signed URL or bucket detail on public routes.
- [ ] Duplicate candidates show only records the current admin may view.
- [ ] Public behavior fails closed.

## What Can Be Implemented Without DB Schema

- Static copy and component acceptance criteria.
- Lightweight inline hints derived from data already loaded for an authorized admin view, but only in a future explicitly approved runtime phase.
- Client presentation rules that do not claim persistent resolution or full scan coverage.

## What Requires Future Schema Or Service

- Persistent dismissed/resolved state.
- Warning history and audit trail.
- Full-tree or full-family warning counts.
- Duplicate scoring.
- Import-wide validation reports.
- Export-readiness package scans.
- Media safety/thumbnail warnings.
- Scheduled or quality-service generated warnings.

## Explicitly Not Implemented

- No migration.
- No `.sql` file.
- No DB apply.
- No SQL mutation.
- No seed/backfill.
- No warning table query.
- No fake runtime data.
- No runtime warning UI.
- No component or route.
- No persistent warning table.
- No full-tree runtime scan.
- No media upload/storage bucket.
- No thumbnail/image processing.
- No large export/import/GEDCOM/ZIP.
- No Worker created.
- No OpenNext/Wrangler config change.
- No runtime dependency added.
- No deploy.
- No push.

## Recommended Future Phase

Phase 120D may review a non-runtime component specification or, with explicit owner approval, define a narrowly scoped lightweight inline-warning runtime phase. Persistent or service-generated warnings remain separately gated.
