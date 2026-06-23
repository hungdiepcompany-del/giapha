# Plan A-14A - Related Member Add UX Overhaul

Status: `PASS_LOCAL_STATIC`

## Scope

A-14A improves the Tree Editor "Thêm người thân" flow and establishes a classic modern genealogy style direction. This is UI/UX runtime polish using existing schema/service fields only.

Boundary:

- DB chưa apply.
- Check SQL chưa chạy trên DB.
- Runtime merge/dedupe vẫn đóng.
- Permission runtime chưa đăng ký.
- Backup gate chưa bị bypass and remains `BLOCKED_PENDING_OWNER_BACKUP_GATE_CONFIRMATION`.
- No migration, no `.sql`, no schema change, no Worker/OpenNext/Wrangler change, no dependency and no deploy.

Local git relation to `origin/main` before continuing A-14A: `ahead 0 / behind 0`; no push was attempted.

## A-14A1 - Audit luồng thêm thành viên liên quan

Current flow reviewed:

1. Chọn một người trên cây.
2. Mở panel thêm người thân.
3. Chọn quan hệ cha, mẹ, con hoặc vợ/chồng/bạn đời.
4. Chọn người đã có hoặc tạo người mới.
5. Xem duplicate suggestion.
6. Xem data-quality warning.
7. Submit qua server action hiện có.

Findings:

- Form tạo người mới trước A-14A bị cảm giác "cắt cụt": chỉ có họ tên, giới tính, năm sinh, năm mất và ghi chú ngắn.
- Field hiện có nhưng thiếu trong form Tree Editor: tên hiển thị, ngày sinh chính xác, ngày mất chính xác, trạng thái còn sống, nơi sinh, quê quán, chi/nhánh, đời thứ, phạm vi hiển thị và ghi chú riêng tư admin-only.
- Thao tác dễ nhầm nhất: gắn người đã có vào quan hệ mới nhưng không đối chiếu đủ tên/năm sinh/chi nhánh.
- Copy cần rõ hơn: người dùng phải biết đang thêm ai cho ai và quan hệ sắp tạo là gì.
- Nút chính/phụ trước đó chưa thể hiện rõ "Thêm nhanh" so với "Nhập chi tiết hơn".
- Pending state cần phân biệt gắn người đã có với tạo người mới.
- Mobile cần form dạng một cột, field không bị chen ngang.

Không thêm "anh/chị/em" trong UI runtime vì relationship service hiện tại chưa có action an toàn cho sibling. Đây là đề xuất phase schema/service riêng sau nếu owner duyệt.

## A-14A2 - Classic Modern Genealogy Style Direction

Direction:

- Classic modern genealogy: nền giấy ấm, chữ stone tối, điểm nhấn xanh trầm và đỏ nâu tiết chế.
- Trang trọng nhưng không nặng nề; ưu tiên cảm giác tư liệu gia đình, dòng họ, ký ức và truyền thống.
- Card/section có viền nhẹ, bo góc vừa phải, không neon, không gradient mạnh, không hiệu ứng rối.
- Typography vẫn dùng stack hiện có, cỡ chữ đủ lớn, tránh font cầu kỳ khó đọc.
- Button rõ primary/secondary/danger, focus state rõ cho keyboard.

Applied:

- `app/globals.css`: nền giấy ấm, focus-visible rõ.
- `components/layout/admin-shell.tsx` and `components/layout/public-shell.tsx`: shell warm paper + stone palette.
- `components/ui/page-header.tsx`, `components/ui/section-card.tsx`, `components/ui/action-link.tsx`, `components/ui/empty-state.tsx`: shared classic-modern primitives.

## A-14A3 - Thiết kế UX mới: Thêm nhanh / Nhập chi tiết

Implemented two create modes in `components/tree/tree-editor-side-panel.tsx`:

- `Thêm nhanh`: họ và tên, giới tính, năm sinh, năm mất, ghi chú ngắn, duplicate suggestion and primary button `Thêm vào cây`.
- `Nhập chi tiết hơn`: all quick fields plus tên thường gọi/tên hiển thị, còn sống, ngày sinh, ngày mất, nơi sinh, quê quán, chi/nhánh, đời thứ, phạm vi hiển thị and ghi chú riêng tư.

Server action `createPersonAndAttachFromTreeAction()` now reads only existing `CreatePersonInput` fields:

- `full_name`
- `display_name`
- `gender`
- `birth_date`
- `birth_date_precision`
- `death_date`
- `death_date_precision`
- `is_living`
- `birth_place`
- `home_town`
- `branch_name`
- `generation_number`
- `short_bio`
- `notes_private`
- `visibility`

No DB field was added.

Fields not added because current schema/service does not support them:

- Nơi mất.
- Tên khác/multiple aliases beyond `display_name`.
- Thứ tự anh/chị/em.
- Người liên quan khác.
- Sibling-specific relation action.
- Lineage membership assignment inside this inline create form.

These belong to a later schema/service phase, not A-14A.

## A-14A4 - Context rõ ràng khi thêm người thân

Panel now shows:

- `Bạn đang thêm {quan hệ} cho: {người đang chọn}`.
- A sentence describing the relation to be created, for example parent/child/spouse.
- Warning copy: `Kiểm tra kỹ để tránh gắn nhầm quan hệ trong gia phả.`

This keeps context visible before submit.

## A-14A5 - Gắn người đã có vào cây

Attach-existing flow now includes a stronger warning after a related member is selected:

`Bạn đang gắn một thành viên đã có vào quan hệ mới. Hãy đối chiếu tên, năm sinh và chi nhánh trước khi lưu để tránh nối nhầm dữ liệu gia phả.`

The picker still shows name, birth year, generation and branch where available. No auto-merge, no delete and no dedupe runtime.

## A-14A6 - Duplicate suggestion and data-quality warning

Preserved:

- Duplicate suggestion is suggestion-only.
- Same-name people remain allowed.
- No automatic merge.
- No automatic delete.
- No hidden relationship mutation outside submit.

UI keeps:

- `Gợi ý tránh tạo trùng`.
- `Có thể đã tồn tại thành viên tương tự`.
- `Tạo mới vẫn đúng nếu đây là người khác trong gia đình`.
- Data-quality warning remains read-only and uses already loaded graph data.

## A-14A7 - Form state, validation, responsive

Implemented:

- Required field remains `Họ và tên *`.
- Primary submit copy: `Thêm vào cây`.
- Secondary mode switch: `Nhập chi tiết hơn`.
- Pending state: `Đang lưu thành viên...` for create-new and `Đang gắn quan hệ...` for attach-existing.
- Server action keeps existing validation through `createPerson()`.
- Mobile uses grid/flex single-column behavior already present in the panel.

## A-14A8 - Privacy/security guard

Privacy:

- `notes_private` appears only in admin Tree Editor detailed mode.
- Public UI still does not render `notes_private`, `source_note` or `source_notes`.
- No raw auth/session/token/cookie logging.
- No service-role-as-user.
- No permission bypass or permission runtime registration.

## A-14A9 - Checker

Added `scripts/check-a14a-related-member-add-ux.cjs` and package script:

`npm run check:a14a-related-member-add-ux`

Checker verifies:

- A-14A doc exists.
- Classic modern style direction exists.
- Two modes `Thêm nhanh` and `Nhập chi tiết hơn` exist.
- Context copy for selected person exists.
- Existing `CreatePersonInput` fields are wired.
- Duplicate suggestion remains suggestion-only.
- Public private/source notes are not exposed.
- No migration or `.sql` change.
- No merge/dedupe runtime route/action/service.
- No permission runtime registration.
- No Worker/OpenNext/Wrangler/service/deploy workflow change.
- No dependency change.
- Backup gate remains blocked.

## A-14A10 - Docs / Decision / Handoff

Updated:

- `docs/PLAN_A14A_RELATED_MEMBER_ADD_UX.md`
- `docs/00_INDEX.md`
- `docs/08_AI_WORK_LOG.md`
- `docs/09_DECISION_LOG.md`
- `docs/99_NEXT_AI_HANDOFF.md`

Decision: A-14A is safe UI/UX runtime polish, classic modern style, no schema/DB/runtime merge/dedupe/permission change.

## A-14A11 - Validation

Validation result:

- `npm run check:a14a-related-member-add-ux`: PASS.
- `npm run check:a14-ui-ux-overhaul`: PASS.
- `npm run check:ui-polish`: PASS.
- `npm run check:vietnamese-ui-copy`: PASS.
- `npm run check:vietnamese-cultural-ui-ux`: PASS.
- `npm run check:tree-relationship-picker-ux`: PASS.
- `npm run check:tree-inline-create-person-ux`: PASS.
- `npm run check:tree-duplicate-suggestion-ux`: PASS.
- `npm run check:tree-polish-dedupe-readiness-data-quality`: PASS.
- `npm run check:tree-editor-auth-browser-smoke`: expected safe-skip `A09_AUTH_BROWSER_SMOKE_SKIPPED_MISSING_EXPLICIT_AUTH_SESSION`.
- `npm run check:merge-dedupe-transaction-audit-design`: PASS.
- `npm run check:merge-dedupe-schema-candidate-readiness`: PASS.
- `npm run check:merge-dedupe-real-migration-readiness`: PASS.
- `npm run check:env:safe`: PASS.
- `npm run check:migrations`: PASS.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS.
- `git diff --check`: PASS.
- `git diff --cached --check`: PASS.

Root build PASS directly; no Windows `.next` EPERM occurred, so no clean temp-copy build was needed.

## A-14A12 - Commit

Commit only if validation PASS. Do not push.

Suggested commit message:

`ui: improve related member add experience`

## Explicitly Not Done

- No DB apply.
- No check SQL run on DB.
- No migration.
- No `.sql` file.
- No seed/backfill.
- No schema change.
- No runtime merge/dedupe.
- No route/action/service merge/dedupe.
- No permission runtime registration.
- No backup gate bypass.
- No deploy.
- No push.
- No dependency added.
- No secret committed.
- `PLANNING.MD` was not read or committed.

## Runtime Worker Guardrail Report

- Main Worker touched: YES, existing Tree Editor UI/action and shared UI style only.
- Runtime dependency added: NO.
- New service Worker created: NO.
- OpenNext/Wrangler config changed: NO.
- Worker size risk: NO.
- Service boundary recommendation: NONE for A-14A.
