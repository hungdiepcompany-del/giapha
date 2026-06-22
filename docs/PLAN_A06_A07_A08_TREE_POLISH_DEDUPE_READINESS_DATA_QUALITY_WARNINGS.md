# Plan A-06/A-07/A-08 - Tree Polish, Dedupe Readiness, Data Quality Warnings

Status: `PASS_LOCAL_STATIC`

## Summary

This bundle strengthens the Tree Editor as the primary, highest-value product
surface. It polishes the tree canvas, person cards, Vietnamese toolbar and
add-relative panel; records future merge/dedupe readiness; and adds lightweight
read-only data quality suggestions derived only from the graph already loaded
in the admin Tree Editor.

No database write, merge, delete, schema, migration, Worker, dependency or
deployment behavior is added.

## Why A-06/A-07/A-08 were grouped

Visual polish, duplicate guidance and data quality suggestions all meet at the
same operator workflow: reviewing a person and adding relatives directly on the
tree. Grouping them keeps the UX coherent while keeping merge/dedupe runtime
strictly outside scope.

## A-06 visual polish result

- The tree canvas receives more horizontal priority and a taller stable working
  area.
- The selected person is visually distinct.
- Toolbar actions are compact and written in Vietnamese.
- The side panel uses shorter copy and clearer sections.
- Default React Flow controls with English tooltips are not rendered in the
  Tree Editor.

## Tree node/card result

Person cards now have:

- A stronger name hierarchy.
- A selected state labeled `Người đang chọn`.
- Clear year fallback: `Chưa rõ năm sinh` and `Chưa rõ năm mất`.
- `Đời thứ ...` and `Chi nhánh: ...` labels when data is available.
- No UUID or private notes as primary display.

Family intermediary cards now display `Gia đình` instead of an English
implementation label.

## Tree toolbar result

The toolbar now uses:

- `Vừa màn hình`
- `Phóng to`
- `Thu nhỏ`
- `Sắp xếp lại cây`
- `Lưu bố cục`
- `Khôi phục bố cục tự động`

Dragging and saving still affect layout only. Relationship data is unchanged.

## Add-relative panel result

The side panel emphasizes:

- `Người đang chọn`
- Existing relationships
- `Gợi ý hoàn thiện dữ liệu`
- `Thêm người thân`
- `Chọn quan hệ`
- `Chọn hoặc tạo thành viên`
- Final confirmation

Copy is shorter, while existing actions and permission checks remain unchanged.

## Duplicate suggestion polish result

The A-05 duplicate suggestion remains advisory and limited to five candidates.
It stays inside the new-person form and uses a secondary outlined action for
`Vẫn tạo thành viên mới`, while `Dùng thành viên này để gắn quan hệ` continues
to switch to the existing-member relationship path.

## A-07 merge/dedupe readiness result

A future merge candidate should require multiple signals, not name equality
alone:

- Normalized name similarity.
- Birth/death date compatibility.
- Parent, spouse and child context.
- Branch and generation compatibility.
- Existing revisions and source provenance.

Duplicate warnings may be visible only to authenticated operators who already
have permission to view the underlying people/tree data. A future merge action
should require a separately approved high-trust permission and explicit owner
approval.

Future merge impact must be reviewed across:

- Canonical person record and slug.
- Parent/child and couple relationships.
- Revision history and actor attribution.
- Tree layout node references.
- Clan/branch membership and generation rules.
- JSON/GEDCOM/ZIP/export stable IDs and compatibility.
- Private notes, source notes and visibility.

Fields that must never be combined automatically include private notes, source
notes, conflicting dates, living/deceased status, visibility, relationship
facts and lineage membership. Ambiguous identity, conflicting family context or
privacy differences require owner decision.

## No-auto-merge guard

- Không auto merge.
- Không xóa person tự động.
- Không xóa relationship tự động.
- Không ghi đè private/source notes tự động.
- Không merge nếu chưa có audit/rollback rõ.
- Không merge nếu chưa có owner approval.

This bundle creates no merge UI, service, action, route or database mutation.

## Future merge approval boundary

Before runtime merge can be considered, a separate owner-approved phase must
define:

- Permission and reviewer roles.
- Preview of every affected record and relationship.
- Revision/audit event shape.
- Transaction and idempotency behavior.
- Stable ID and export compatibility.
- Rollback or restore procedure.
- Post-merge verification and privacy review.

## A-08 data quality warning result

The selected-person panel now shows `Gợi ý hoàn thiện dữ liệu`. Suggestions can
include:

- `Có thể đã tồn tại thành viên tương tự`
- `Thành viên này chưa có năm sinh`
- `Thành viên này chưa có năm mất`
- `Thành viên này chưa có cha/mẹ trong cây`
- `Thành viên này chưa có quan hệ gia đình nào`

The panel states:
`Đây chỉ là gợi ý kiểm tra, hệ thống không tự thay đổi dữ liệu.`

## Warning logic

Warnings are calculated client-side from the selected person, current graph
edges and people already loaded in the Tree Editor. The logic compares only the
selected person against the loaded people list, limits suggestions and does not
perform a full-tree pairwise scan, network request or database write.

## Privacy/permission result

The Tree Editor keeps its existing authenticated server-side permission
boundary. Warning copy does not expose `notes_private`, `source_note`, hidden
relationship facts, tokens, sessions, cookies, service role keys, signed URLs,
storage keys, raw SQL or stack traces.

## Vietnamese UI copy result

New user-facing copy is Vietnamese with diacritics. Internal route names,
function names, enum values, field names and `personId` values remain English
and internal.

## Deferred items

- Runtime person merge or dedupe.
- Person or relationship deletion/replacement.
- Database-level dedupe and unique constraints.
- Migration or schema changes.
- Authenticated browser smoke.
- Portrait/media/document work.
- GEDCOM/ZIP import/export expansion.
- Backup/restore runtime.
- New Worker.
- Deploy.

## Checker result

Added `scripts/check-tree-polish-dedupe-readiness-data-quality.cjs` and
`npm run check:tree-polish-dedupe-readiness-data-quality`.

The checker guards Vietnamese tree copy, selected-card polish, warning
read-only behavior, merge readiness/no-auto-merge wording, internal UUID
behavior and no migration/SQL/Worker/config/dependency/deploy drift.

## Validation results

- Required static checkers, env safety, migration order, typecheck and lint:
  PASS.
- Workspace-root `npm run build`: blocked before compile by the known Windows
  `.next` ACL `EPERM` unlink error.
- Clean temporary-copy production build: PASS.
- Local browser opened `/admin/tree/edit`, but the current session had no
  `tree.view` permission. The route failed closed with Vietnamese permission
  copy, so authenticated canvas visual smoke was not claimed.
- Browser status:
  `TREE_POLISH_BROWSER_SMOKE_SKIPPED_NO_AUTHORIZED_SESSION`.

## Recommended next phase

Recommended next phase: authenticated browser smoke for the polished Tree
Editor when explicit owner/operator browser auth is available, or a separate
docs-only merge transaction/audit design phase that still does not authorize
runtime merge.
