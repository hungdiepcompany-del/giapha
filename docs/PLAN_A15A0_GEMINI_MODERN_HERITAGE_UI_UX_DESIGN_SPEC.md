# A-15A0 - Gemini Modern Heritage UI/UX Design Spec

Status: `DESIGN_SPEC_ACCEPTED_FOR_UI_ONLY_IMPLEMENTATION`

Source: Gemini UI/UX design output.

Design direction: Modern Heritage / Di sản Hiện đại.

Scope: design reference only.

Implementation: deferred to later A-15A1+ phases.

Boundary: A-15A0 is docs-only. It does not authorize UI component edits, database/schema/migration changes, API/action/service logic changes, auth/permission changes, route changes, runtime changes, Worker/OpenNext/Wrangler changes, dependency changes, deploy or push.

---

# UI/UX Design Specification: Dự án GIA PHẢ

*Tài liệu thiết kế giao diện (UI) và trải nghiệm người dùng (UX) dành cho quá trình triển khai của Codex.*

---

## 1. Executive Design Summary

- **Mục tiêu thiết kế:** Biến ứng dụng Gia Phả thành một nơi lưu giữ ký ức gia đình, dòng họ với giao diện ấm áp, trang trọng, nhưng vẫn giữ được sự tinh gọn, dễ dùng cho người lớn tuổi và người không rành công nghệ.
- **Phong cách (Style Direction):** "Modern Heritage" (Cổ điển pha Hiện đại). Giữ sự trang nghiêm của văn hóa truyền thống nhưng áp dụng các nguyên tắc UI hiện đại: thoáng đãng, phân cấp thông tin rõ ràng, không nặng nề.
- **Tôn chỉ UX:**
  - **Rõ ràng & Dễ đọc:** Chữ to, độ tương phản tốt, touch-target (vùng chạm) lớn.
  - **Cảm xúc & Ấm áp:** Tránh cảm giác như phần mềm quản lý kho/dashboard doanh nghiệp.
  - **Phân tách Rõ rệt:** Chế độ xem (Public) mang tính chiêm nghiệm, đọc; Chế độ quản trị (Admin) mang tính điều khiển, nhưng vẫn phải an toàn, tránh thao tác nhầm.

---

## 2. Design Problems (Đánh giá UI hiện tại)

Dựa trên góc nhìn của một sản phẩm gia phả, dưới đây là các vấn đề thường gặp ở giao diện mặc định/hiện tại cần được Codex giải quyết:

1. **Thiếu cảm xúc gia đình (Giống dashboard kỹ thuật):** Sử dụng quá nhiều các khối màu xám, xanh blue sáng (tech-blue), viền sắc cạnh, data grid lưới thô cứng khiến app trông giống một phần mềm quản lý nhân sự hơn là gia phả.
2. **Khó dùng với người lớn tuổi:** Cỡ chữ quá nhỏ (thường là 12-14px), độ tương phản kém (chữ xám nhạt trên nền xám). Nút bấm không có label rõ ràng hoặc diện tích bấm quá nhỏ trên mobile.
3. **Màu sắc không phù hợp:** Màu trắng tinh (pure white) và xám lạnh (cool gray) gây chói mắt và thiếu sự trang trọng, ấm cúng của dòng họ.
4. **Nguy cơ rối trên Mobile:** Bảng danh sách thành viên (People List) dễ bị tràn ngang, phải cuộn ngang mỏi tay. Toolbar của cây gia phả che khuất màn hình.
5. **Vấn đề Tree Viewer/Editor:**
   - Node (thẻ) của từng người quá to, chứa quá nhiều chữ làm cho toàn bộ cây bị loãng, không nhìn được bao quát.
   - Không có dấu hiệu thị giác (visual cue) rõ ràng giữa việc "Đang xem" và "Đang ở chế độ chỉnh sửa/thêm người".

---

## 3. Proposed Visual System

**Tên Style Direction:** *Modern Heritage (Di sản Hiện đại)*

Hệ thống token màu sắc và style cần áp dụng (sử dụng class của Tailwind CSS):

- **Nền (Background):**
  - Giao diện chung: Dùng màu giấy ấm/ngà (Warm Ivory/Paper) `bg-stone-50` hoặc `bg-[#FAFAF9]`.
  - Nền phụ (Sidebar/Header admin): `bg-stone-100`.
  - Nền Card/Content: `bg-white` hoặc `bg-white/95` để tạo chiều sâu.
- **Màu chữ (Text):**
  - Chữ chính (Tiêu đề, tên): `text-stone-900` (Charcoal / Nâu đen mờ, tuyệt đối không dùng đen tuyền #000).
  - Chữ phụ (Ngày tháng, ghi chú): `text-stone-500` hoặc `text-stone-600`.
- **Màu nhấn (Accent & Primary Action):**
  - **Primary Action (Lưu, Thêm, Xem chi tiết):** Xanh trầm (Deep Green / Teal) `bg-teal-700` hoặc `bg-emerald-800`. Thể hiện sự sinh sôi nảy nở, cội nguồn.
  - **Accent/Tag (Điểm nhấn truyền thống):** Nâu đỏ mờ (Muted Rust) `text-amber-800` nền `bg-amber-50`. Thích hợp cho nhãn "Đời thứ X", "Chi/Nhánh".
- **Màu Cảnh báo (Danger):** Đỏ gạch `bg-red-700`.
- **Border & Shadow:**
  - Border mỏng, màu ấm: `border-stone-200`.
  - Shadow: Nhẹ, khuếch tán rộng `shadow-sm`, `shadow-md` (hạn chế shadow gắt).
- **Typography Tone:**
  - Khuyến khích dùng Font Sans-serif hiện đại nhưng nét tròn (như Inter).
  - **Size tối thiểu:** `text-base` (16px) cho text thường, `text-sm` (14px) cho nhãn. Không dùng `text-xs`.
- **Border Radius:** Mềm mại. Card dùng `rounded-xl` hoặc `rounded-2xl`. Nút dùng `rounded-lg` hoặc `rounded-full`.

---

## 4. Screen-by-screen Redesign

### 4.1. Public Home (Trang chủ)
- **Hero Section:** Bố cục chia giữa (center-aligned). Background là màu `stone-50` với một pattern mờ (nếu có) hoặc màu trơn ấm áp.
- **Typography:** Tiêu đề lớn (h1) dùng màu `teal-800` hoặc `stone-900`.
- **CTA:** Nút "Xem cây gia phả" to, rõ ràng, bo góc `rounded-full`, màu `bg-teal-700 text-white`.
- **Cảm giác:** Như trang bìa của một cuốn sổ lưu bút trang trọng.

### 4.2. Public Tree (Cây gia phả chung)
- **Canvas:** Nền trơn `bg-stone-50`. Khung canvas chiếm tối đa diện tích.
- **Toolbar:** Floating (nổi) ở góc dưới hoặc trên. Dạng `glassmorphism` nhẹ (`bg-white/80 backdrop-blur shadow-sm`).
- **Empty State:** Hình ảnh tĩnh lặng hoặc icon cây mờ. Chữ "Gia phả đang được cập nhật".
- **Mini Help:** Một tooltip hoặc mảng text mờ nhỏ ở góc dưới: "Kéo thả để di chuyển • Cuộn để thu phóng".

### 4.3. Public Person Profile (Hồ sơ người)
- **Layout:** Dạng "Thẻ định danh" (Profile Card) nằm giữa màn hình (đọc như một trang sách). Nền trắng `bg-white`, bo góc tròn `rounded-2xl`, shadow nhẹ.
- **Hiển thị:** Avatar tròn lớn. Tên đậm `text-2xl`.
- **Tag:** Đời thứ mấy, thuộc chi nào hiển thị bằng tag `bg-amber-50 text-amber-800`.
- **Dữ liệu trống:** Ẩn hoàn toàn nhãn nếu không có dữ liệu, KHÔNG hiển thị chữ "N/A" hay "null".

### 4.4. Admin Dashboard (Tổng quan quản trị)
- **Layout:** Tránh dạng module launcher khô cứng. Thay bằng Lời chào + Thống kê nhẹ nhàng.
- **Quick Actions:** Các nút lớn dạng thẻ có icon, màu nền dịu (`bg-teal-50 text-teal-800`), bo góc `rounded-xl`. Ví dụ: [Thêm thành viên], [Chỉnh sửa cây].
- **Safety Cards:** Các mục nguy hiểm (Xóa, Export) nằm ở dưới cùng, có viền mờ `border-stone-200`, không dùng màu đỏ rực trừ khi là nút action cuối cùng.

### 4.5. Admin Sidebar / Header
- **Sidebar Desktop:** Màu nền `bg-stone-50` hoặc trắng. Active state có nền `bg-teal-50` và chữ `text-teal-700`, font `font-medium`.
- **Mobile Navigation:** Chuyển thành Bottom Navigation hoặc Hamburger Menu mượt mà, chữ to.

### 4.6. People List (Danh sách thành viên)
- **Desktop:** Table sạch sẽ, border-bottom `border-stone-100`. Bỏ hết đường kẻ dọc dọc.
- **Mobile:** Chuyển Table thành danh sách Card. Mỗi Card hiển thị Tên (đậm), Năm sinh, và nút Menu (ba chấm) góc phải.
- **Actions:** Nút "Xem", "Sửa" dùng icon màu `stone-500`, hover sang `teal-600`.

### 4.7. Person Form (Form thêm/sửa)
- **Phân nhóm:** Chia form thành các Section Card riêng biệt (vd: Thông tin cơ bản, Quan hệ gia đình, Ghi chú).
- **Label:** Đặt trên input, chữ `text-stone-700 font-medium`.
- **Mobile:** Action Bar (Hủy / Lưu) nổi (fixed) ở dưới cùng màn hình (bottom-0) để người dùng không phải cuộn tìm nút Lưu.

---

## 5. Tree Viewer / Tree Editor Detailed Redesign

Đây là màn hình cốt lõi, cần sự tinh tế cao.

- **Chế độ Xem (Public Tree Viewer):**
  - **Node Card:** Rất gọn. Kích thước khoảng `w-40` tới `w-48`. Bo góc `rounded-lg`. Nền `bg-white`, viền `border-stone-200`. Avatar nhỏ (size 8 hoặc 10). Tên (1-2 dòng, text-sm font-semibold). Năm sinh-mất (text-xs text-stone-500).
  - **Tương tác:** Click vào Node sẽ mở Sidebar trượt từ phải ra (Slide-over panel) hiển thị chi tiết người đó, thay vì chuyển trang (tránh mất ngữ cảnh cây).
  - **Hover:** Đổi màu viền `hover:border-teal-400`.

- **Chế độ Sửa (Admin Tree Editor):**
  - **Banner Trạng thái:** Trên cùng có một dải banner mỏng `bg-amber-100 text-amber-800 text-sm` ghi "Chế độ chỉnh sửa".
  - **Selected Node:** Khi chọn một người, Node đó có viền dày `ring-2 ring-teal-600`.
  - **Action Menu:** Khi chọn Node, hiện ra các nút nhanh quanh Node hoặc trên Panel bên phải: [Sửa thông tin], [+ Thêm Vợ/Chồng], [+ Thêm Con].
  - **Add-relative Panel:** Drawer trượt từ bên phải (Desktop) hoặc Bottom Sheet (Mobile) có bóng mờ che phía sau (backdrop `bg-stone-900/20`).

---

## 6. Mobile UX Rules

- **Tap/Touch Target:** Tất cả các nút bấm, node, icon phải đảm bảo diện tích chạm tối thiểu `44x44px` (Tailwind: `min-h-[44px] min-w-[44px]` hoặc padding tương đương).
- **Cỡ chữ:** Khuyến khích `text-base` (16px) làm mặc định cho input và đoạn văn để tránh iPhone tự động zoom khi focus.
- **Tránh tràn ngang (No horizontal scroll ngoài ý muốn):** Form và List phải full-width `w-full` và bọc trong padding. Table phải chuyển sang dạng Card List hoặc có bọc `overflow-x-auto` nếu bắt buộc.
- **Tree Canvas trên Mobile:** Phải cho phép Pan (dùng 1 ngón) và Zoom (Pinch 2 ngón). Nút Toolbar phải để dạng lưới nổi ở dưới cùng (Bottom fixed floating toolbar).

---

## 7. Vietnamese UX Copy Pack

Sử dụng tiếng Việt chuẩn, ấm áp, lịch sự:

- **Public Home Hero:** "Lưu giữ ký ức, kết nối các thế hệ." / "Cội nguồn yêu thương của dòng họ."
- **Public Tree Help (Desktop):** "Cuộn chuột để thu phóng, nhấn giữ để di chuyển."
- **Public Tree Help (Mobile):** "Dùng hai ngón tay để thu phóng, kéo để di chuyển."
- **Empty Public Tree:** "Cây gia phả đang được cập nhật."
- **Private Tree:** "Gia phả nội bộ. Vui lòng liên hệ ban quản trị để xem thông tin."
- **Missing Data:** (Để trống hoặc ghi "Chưa có thông tin" - KHÔNG dùng "N/A", "null").
- **Admin Dashboard Intro:** "Chào mừng trở lại. Hôm nay bạn muốn cập nhật thông tin nào?"
- **Tree Editor Help:** "Nhấn vào một thành viên để chỉnh sửa hoặc thêm người thân."
- **Add-relative Panel:** "Thêm người thân cho [Tên]"
- **Duplicate Suggestion:** "Có vẻ thành viên này đã có trong gia phả. Vui lòng kiểm tra lại để tránh trùng lặp."
- **Error State:** "Đã có lỗi xảy ra. Xin vui lòng thử lại sau một lát."
- **Loading State:** "Đang tải dữ liệu gia phả..."
- **No Selected Person:** "Hãy chọn một người trên cây gia phả để xem chi tiết."

---

## 8. Component Implementation Checklist For Codex

Dưới đây là bảng Checklist cho Codex để implement UI. **Codex CHỈ thay đổi class Tailwind và bố cục JSX, KHÔNG chạm vào logic hay API.**

| Component/Screen | Vấn đề hiện tại (Thường gặp) | Thiết kế mới (Yêu cầu) | Tailwind/Style Hint | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **PublicShell** | Layout lạnh, nền trắng bóc. | Nền ấm, Header thoáng. | `bg-stone-50`, text màu `stone-900`. | Trang web có tông màu giấy ấm áp. |
| **PublicHome** | Giống landing page SaaS. | Hero section trang trọng, font chữ rõ ràng. | Dùng `bg-stone-50`, CTA `bg-teal-700 rounded-full`. | Có cảm giác gia đình, CTA nổi bật. |
| **PublicTreeShell** | Canvas tối, toolbar thô cứng. | Canvas sáng, toolbar glassmorphism nổi. | Canvas `bg-stone-50`, Toolbar `bg-white/80 backdrop-blur rounded-2xl shadow-sm`. | Toolbar không che khuất cây. |
| **PublicPersonProfile** | Hiển thị field rỗng ("null"). | Dạng thẻ sách, ẩn field rỗng. | Card `bg-white rounded-2xl shadow-md border-stone-100`, tag `bg-amber-50 text-amber-800`. | Căn giữa đẹp, không có text lỗi kĩ thuật. |
| **AdminShell** | Sidebar xám/đen cứng. | Nền sáng, menu item mềm mại. | Nền `bg-stone-100`, active link `bg-white text-teal-700 shadow-sm rounded-lg`. | Trông như app Mac/iOS hiện đại nhưng ấm. |
| **AdminDashboard** | Trông như module launcher. | Thẻ Welcome nhẹ nhàng, Quick actions dùng icon. | Card `bg-white p-6 rounded-2xl`, text `text-stone-700`. | Thân thiện, câu chào lịch sự. |
| **PeopleList** | Table tràn ngang trên Mobile. | Desktop table sạch, Mobile chuyển thành Card list. | Mobile: `<div className="flex flex-col gap-3">...</div>` | Responsive hoàn toàn, không cần cuộn ngang trên mobile. |
| **PersonForm** | Field nhồi nhét, nút nhỏ. | Label to (16px), chia block, nút Lưu nổi (Mobile). | Label `text-stone-700 font-medium`, Nút lưu `fixed bottom-4 left-4 right-4` (Mobile). | Form dễ điền cho người mắt kém. |
| **FamilyTreeViewer** | Cây rối, không có state rõ ràng. | Node gọn gàng, click mở Slide-over panel. | Node `bg-white border-stone-200 rounded-lg`. | Cây hiển thị rõ ràng, mượt. |
| **FamilyNodeCard** | Quá to, che mất line nối. | Giảm width, thông tin cô đọng. | `w-44 p-3 border border-stone-200 shadow-sm`. | Đọc được tên rõ ràng. |
| **FamilyTreeEditor** | Dễ nhầm với chế độ Xem. | Có Banner cảnh báo sửa. | Banner `bg-amber-100 text-amber-800 p-2 text-center text-sm`. | Nhận biết ngay đang ở Editor. |
| **TreeEditorSidePanel** | Panel che nội dung, giật. | Trượt từ bên phải (Drawer) mượt mà. | `fixed right-0 top-0 h-full w-80 bg-white shadow-2xl transition-transform`. | Animation mượt. |
| **Empty/ErrorState** | Báo lỗi kỹ thuật khô khan. | Icon mềm mại, text tiếng Việt ấm áp. | `flex flex-col items-center text-stone-500 gap-4`. | Thân thiện, an tâm. |

---

## 9. Do-not-change Boundary (Ràng buộc giới hạn cho Codex)

**Codex, KHI BẠN TRIỂN KHAI TÀI LIỆU NÀY, BẠN TUYỆT ĐỐI KHÔNG ĐƯỢC:**
1. **Không thay đổi Database/Schema:** Không tạo migration mới, không đổi kiểu dữ liệu (DB).
2. **Không thay đổi API / Actions:** Giữ nguyên các hàm `fetch`, `server actions`, mutation hiện tại.
3. **Không thay đổi Auth/Permission:** Không chạm vào middleware, RLS, hoặc logic phân quyền.
4. **Không đổi cấu trúc Route:** Không di chuyển hay đổi tên file trong thư mục `app/` hoặc `pages/`.
5. **Không thêm Dependency:** Chỉ dùng Tailwind CSS, React, và các icon library đã có (Lucide, Radix, v.v.). Không cài thêm thư viện UI mới (như Material UI, Chakra...).
6. **Không đụng chạm thuật toán:** Thuật toán tính toán vị trí cây (layout algorithm), thuật toán export/import/backup, thuật toán xử lý họ hàng giữ nguyên.

*Nhiệm vụ của bạn chỉ là: Đọc file JSX hiện tại -> Sửa chuỗi class Tailwind -> Sắp xếp lại thẻ HTML/JSX -> Áp dụng file Copy tiếng Việt.*

---

## 10. Final Acceptance Criteria

Giao diện mới được xem là hoàn thành khi:
1. Nhìn bằng mắt thường thấy phong cách sáng, ấm, có hơi hướng gia đình (tone Stone + Teal + Amber).
2. Kiểm tra trên Mobile không bị tràn trang (horizontal overflow) ở màn hình danh sách và form.
3. Chữ trên màn hình đủ lớn, dễ đọc. Không có text nào là tiếng Anh hoặc ngôn ngữ hệ thống lộ ra ngoài (ví dụ: mất chữ "null", "undefined").
4. Cây gia phả ở chế độ Admin và Public phân biệt được với nhau bằng thị giác (Banner báo hiệu).
5. Code logic cũ hoạt động bình thường, không gãy tính năng thêm/sửa/xóa thành viên.


---

## A-15A0 Implementation Boundary Note

The following ideas in this Gemini Modern Heritage design spec may be implemented only when the current UI already has compatible state/layout. If new interaction logic, route behavior, mutation behavior or persisted state is needed, the item is deferred to a later reviewed phase and must be marked `DEFERRED_REQUIRES_INTERACTION_LOGIC_REVIEW`:

- slide-over selected person panel;
- bottom navigation;
- fixed mobile form action bar;
- drawer/bottom sheet animation;
- pinch zoom gesture;
- new avatar/media behavior;
- any new menu state;
- any new mutation path.

A-15A0 does not authorize implementation of the items above. Future A-15A1+ implementation must be split by screen, follow this spec without inventing unreviewed design direction, and keep DB/API/auth/permission/route/runtime/deploy/dependency boundaries closed unless a later prompt explicitly opens that scope.
