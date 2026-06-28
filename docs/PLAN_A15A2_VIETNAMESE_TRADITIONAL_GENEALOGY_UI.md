# A-15A2 - Vietnamese Traditional Genealogy UI Reference Polish

Status: `UI_POLISH_COMPLETED_LOCAL`

Marker: `A15A2_VIETNAMESE_TRADITIONAL_GENEALOGY_UI`

Scope: UI/UX only.

## Mục tiêu

A-15A2 áp dụng lớp polish giao diện gia phả Việt Nam truyền thống hơn trên các
màn hình đang có: public shell/home/tree, admin shell/dashboard, danh sách dòng
họ/gia phả, danh sách thành viên và node/card trong phả đồ.

Phong cách được dùng:

- nền giấy cổ tông stone/amber/cream;
- banner công khai có cảm giác từ đường và dòng họ;
- CTA chính xanh ngọc trầm, điểm nhấn đỏ nâu trầm;
- card mềm, bo vừa phải, shadow nhẹ;
- phả đồ ưu tiên vùng canvas lớn;
- node thành viên gọn, có placeholder chữ cái đầu, tên, đời và năm sinh/mất;
- card danh sách gia phả có lối đi rõ tới `Xem phả đồ` và
  `Danh sách thành viên`;
- admin/sidebar nhóm rõ theo `Dòng họ`, `Phả đồ`, `Website`, `Quản trị`.

## Boundary

A-15A2 không mở:

- database/schema/migration;
- auth/permission/RLS;
- API/action/service logic;
- route mới hoặc đổi route;
- Worker/OpenNext/Wrangler/deploy/runtime boundary;
- dependency/package mới;
- external asset/logo/image từ website mẫu;
- push.

Các file `app/(admin)/.../page.tsx` nếu có thay đổi chỉ là copy/layout/class
trên route hiện hữu; không thay đổi query, action, permission hoặc data flow.

## Implementation Notes

- Public shell có marker `data-ui-phase` và banner "Không gian từ đường số của
  dòng họ".
- Public home thêm cảm giác bìa sổ phả hệ, CTA `Xem phả đồ`, nền giấy ấm và
  thẻ thống kê mềm.
- Public tree dùng wrapper rộng hơn, callout `Cách xem phả đồ` và canvas tree
  giữ vai trò chính.
- Tree viewer/editor tăng chiều cao canvas, toolbar dịu hơn, node person giảm
  chiều rộng và thêm placeholder chữ cái đầu.
- Admin shell gom menu thành `Dòng họ`, `Phả đồ`, `Website`, `Quản trị` mà
  không tạo route mới.
- Admin dashboard và trang `Danh sách gia phả` bổ sung card ngắn, dễ quét,
  có CTA `Xem phả đồ` và `Danh sách thành viên`.

## Validation Plan

Required commands:

- `npm run check:env:safe`
- `npm run check:a15a2:vietnamese-traditional-genealogy-ui`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`

Browser visual smoke may be run locally after implementation for public routes
only. Authenticated/admin visual proof still requires explicit owner/operator
session and must safe-skip without it.
