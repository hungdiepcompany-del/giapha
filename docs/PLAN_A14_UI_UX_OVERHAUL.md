# Plan A-14 - UI/UX Overhaul

Status: `PASS_LOCAL_STATIC`

## Scope

A-14 Bundle - UI/UX Overhaul chỉ polish trải nghiệm người dùng, bố cục, điều hướng, form, bảng, empty/loading/error state, Tree Editor và copy tiếng Việt.

Không phải phase DB/runtime. DB merge/dedupe vẫn chưa apply. Check SQL chưa chạy trên DB. Runtime merge/dedupe vẫn đóng. Permission runtime chưa đăng ký. Backup gate vẫn chưa bị bypass và vẫn ở trạng thái `BLOCKED_PENDING_OWNER_BACKUP_GATE_CONFIRMATION`.

Không deploy trong phase này. Không push trong phase này.

## A-14A - UI/UX Audit

Các màn hình khó dùng nhất:

- `/admin/tree/edit`: nhiều thao tác có rủi ro nhầm dữ liệu gia phả nhất. Toolbar, trạng thái người đang chọn và form gắn người thân phải rõ hơn viewer thường.
- `/admin/relationships`: người dùng dễ nhầm giữa đơn vị gia đình, cha/mẹ/con và quan hệ đôi.
- `/admin/people`: bảng desktop thiếu fallback mobile và chưa nhắc người dùng mở hồ sơ trước khi sửa.
- `/admin/exports/import`: kết quả kiểm tra dùng nhãn kỹ thuật như code/path nên cần dịch thân thiện hơn.
- `/auth/login`: lỗi Supabase/OAuth không nên lộ thô cho người dùng.

Thành phần gây rối:

- Header quản trị chứa nhiều nút ngang hàng, không nhóm theo việc hằng ngày, cây gia phả và an toàn dữ liệu.
- Form quan hệ chưa nói rõ nên tạo gia đình trước rồi mới gắn cha/mẹ/con.
- Tree Editor chưa cảnh báo đủ mạnh khi gắn một thành viên đã có vào quan hệ mới.
- Lịch sử chỉnh sửa và trạng thái hệ thống có heading tự viết riêng, chưa dùng primitive chung.

Chỗ thiếu hướng dẫn tiếng Việt:

- Bộ lọc thành viên thiếu mô tả mục đích.
- Form người thiếu help text cho tên hiển thị, độ chính xác ngày, chi/nhánh, ghi chú riêng tư.
- Import preview dùng nhãn "Code" và "Path".
- Login có chữ kỹ thuật "Supabase Auth", "callback" và có thể hiện lỗi thô.

Chỗ spacing/typography/layout kém:

- Admin navigation dạng chip dài khó quét trên màn hình nhỏ.
- Bảng thành viên chỉ tối ưu desktop.
- Page header một số trang không dùng cùng typography.
- Các form quan hệ thiếu khoảng nghỉ giữa phần giải thích và field.

Chỗ thiếu empty/loading/error state:

- People list có empty state nhưng chưa có mobile card state.
- Relationship summary empty state chỉ là câu ngắn, chưa hướng dẫn bước tiếp theo.
- Revisions empty state chưa dùng component chung.
- Login error state cần thông điệp thân thiện.
- Tree Editor pending label cần phân biệt gắn người đã có và tạo người mới.

Nguy cơ thao tác nhầm dữ liệu gia phả:

- Xóa mềm người hoặc quan hệ đặt gần link sửa/xem.
- Gắn người đã có vào cây có thể nối nhầm nếu không đối chiếu tên/năm sinh/chi nhánh.
- Kéo node trong Tree Editor có thể bị hiểu là sửa quan hệ thật.
- Nhập quan hệ đôi có thể bị nhầm với quan hệ cha/mẹ/con nếu không giải thích rõ.

## A-14B - UI Design Direction

Hướng UI giữ nền tĩnh, ít màu chói, ưu tiên đọc rõ cho người lớn tuổi:

- Admin layout có sidebar nhóm rõ: Làm việc hằng ngày, Cây gia phả, An toàn dữ liệu.
- Header trang dùng `PageHeader` thống nhất với title, mô tả ngắn và action area.
- Primary action dùng nền slate đậm; secondary action dùng nền trắng; danger action dùng đỏ và wording rõ.
- Card/section giữ nền trắng, border rõ, không thêm dependency UI.
- Empty state luôn nói bước tiếp theo.
- Loading/pending state mô tả đúng thao tác đang làm.
- Error state không lộ raw technical error cho user thường.
- Copy tiếng Việt có dấu, hạn chế thuật ngữ kỹ thuật trên UI.

## A-14C - Layout / Navigation Polish

Đã polish:

- `components/layout/admin-shell.tsx`: chuyển điều hướng quản trị thành sidebar có nhóm, active state rõ và link trang công khai riêng.
- `components/layout/public-shell.tsx`: label đăng nhập ngắn hơn, brand rõ hơn.
- `components/ui/page-header.tsx`: typography dễ đọc hơn, action area responsive.
- `app/globals.css`: thêm focus-visible rõ cho keyboard và input/button/link.

Không đổi route. Không ẩn chức năng hiện có.

## A-14D - Tree Viewer / Tree Editor UX

Đã polish:

- `components/tree/tree-editor-toolbar.tsx`: thêm cảnh báo rõ kéo thẻ chỉ đổi bố cục, muốn sửa quan hệ phải dùng bảng chi tiết.
- `components/tree/tree-editor-side-panel.tsx`: thêm hướng dẫn khi chưa chọn người, cảnh báo trước khi gắn thành viên đã có, pending label riêng cho gắn người đã có và tạo người mới.
- `components/tree/family-tree-toolbar.tsx`: nhóm tìm kiếm, thêm `aria-live` cho trạng thái tìm/loading.

Duplicate suggestion vẫn là gợi ý, không chặn người trùng tên. Data quality warning vẫn chỉ đọc từ dữ liệu đã load và không tự sửa dữ liệu. Không mở runtime merge/dedupe. Không xóa person/relationship.

## A-14E - Forms / Tables / Detail Pages Polish

Đã polish:

- `components/people/person-list.tsx`: thêm summary, mobile card fallback, wording sửa/xem hồ sơ rõ hơn.
- `components/people/person-form.tsx`: thêm help text và placeholder cho nhóm thông tin chính, ngày sinh/mất, chi/nhánh và ghi chú riêng tư.
- `components/relationships/relationship-form.tsx`: thêm hướng dẫn tạo đơn vị gia đình trước, cảnh báo khi chưa có gia đình.
- `components/relationships/couple-form.tsx`: giải thích quan hệ đôi tách với cha/mẹ/con.
- `components/relationships/relationship-summary.tsx`: empty state có hướng dẫn bước tiếp theo.
- `app/(admin)/admin/revisions/page.tsx` và `app/(admin)/admin/system/status/page.tsx`: dùng `PageHeader`, `EmptyState`, `StatusCallout`.

Không đổi schema, không thêm field DB.

## A-14F - Vietnamese Copy / Accessibility / Safety

Đã polish:

- Login không lộ raw Supabase error message; lỗi chuyển thành hướng dẫn thân thiện.
- Import preview đổi nhãn `Code`/`Path` thành `Mã kiểm tra`/`Vị trí trong file`.
- Icon-only button không được thêm mới.
- Focus state toàn cục rõ hơn cho keyboard.
- Public UI vẫn không dùng `notes_private`, `source_note` hoặc `source_notes`.
- Các warning Tree Editor nhấn mạnh hệ thống không tự thay đổi dữ liệu.

## A-14G - Static Checker / UI Guard

Thêm `scripts/check-a14-ui-ux-overhaul.cjs` và `npm run check:a14-ui-ux-overhaul`.

Checker A-14 kiểm:

- Có tài liệu A-14 audit/polish/handoff.
- Không có migration mới.
- Không có `.sql` mới.
- Không route/action/service merge/dedupe mới.
- Không đăng ký permission runtime mới.
- Không Worker/OpenNext/Wrangler/service/deploy workflow change.
- Không dependency mới.
- Không public private notes/source notes.
- UI copy chính có tiếng Việt.
- Tree Editor còn label/panel/warning quan trọng.
- Backup gate vẫn không bị bypass.

Cập nhật compatibility allowlist cho các checker Tree/A-10/A-11/A-12 liên quan để A-14 UI files không bị tính là drift sai scope, trong khi SQL/Worker/merge runtime vẫn bị chặn.

## A-14H - Docs / Decision / Handoff

Đã cập nhật:

- `docs/PLAN_A14_UI_UX_OVERHAUL.md`
- `docs/00_INDEX.md`
- `docs/08_AI_WORK_LOG.md`
- `docs/09_DECISION_LOG.md`
- `docs/99_NEXT_AI_HANDOFF.md`

Decision mới: A-14 là UI/UX polish only, không phải DB/runtime phase.

## A-14I - Validation

Validation local static được chạy sau khi hoàn tất code/docs/checker:

- A-14 checker: PASS.
- UI/Vietnamese/tree checkers hiện có: PASS hoặc expected safe-skip nếu thiếu explicit auth session.
- A-10/A-11/A-12 merge/dedupe checkers: PASS.
- A-13 backup gate: vẫn blocked, không bypass.
- `npm run check:env:safe`: PASS.
- `npm run check:migrations`: PASS.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS hoặc ghi rõ Windows `.next` EPERM nếu xảy ra.
- `git diff --check`: PASS.
- `git diff --cached --check`: PASS.

## A-14J - Commit boundary

Commit chỉ được tạo nếu validation PASS. Không push.

Recommended commit message:

`ui: polish genealogy user experience`

## Explicitly Not Done

- No DB apply.
- No check SQL run on DB.
- No migration created.
- No `.sql` file created.
- No seed/backfill.
- No production data mutation.
- No runtime merge/dedupe.
- No route/action/service merge/dedupe.
- No permission runtime registration.
- No backup gate bypass.
- No deploy.
- No push.
- No Worker/OpenNext/Wrangler config change.
- No runtime dependency or dev dependency added.
- No secret committed.
- `PLANNING.MD` was not read or committed.

## Runtime Worker Guardrail Report

- Main Worker touched: YES, UI/runtime component files only.
- Runtime dependency added: NO.
- New service Worker created: NO.
- OpenNext/Wrangler config changed: NO.
- Worker size risk: NO.
- Service boundary recommendation: NONE for A-14; keep future heavy export/import/media/backup/data-quality work behind separate service-boundary approval.
