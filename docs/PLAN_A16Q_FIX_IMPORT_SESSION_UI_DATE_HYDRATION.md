# A-16Q-FIX - Import Session UI Evidence + Date Precision Fix + Hydration Assessment

Marker: `A-16Q-FIX`

Status: `A16Q_FIX_STATUS=VALIDATION_FIX_READY_UI_SMOKE_SAFE_SKIP_CAPABLE`

## Mục tiêu

A-16Q-FIX gom ba việc an toàn trước khi xét nhập chính thức Gia Phả 4:

1. Sửa validation ngày sinh/ngày mất để không block sai trường hợp mất cùng năm sinh khi dữ liệu chỉ có năm hoặc thiếu ngày/tháng.
2. Chuẩn bị smoke UI import session read-only để lấy session id, counts, errors, warnings và blockers nếu có auth/storage state rõ ràng.
3. Ghi nhận hydration warning `crxlauncher=""` trên thẻ `<html>` là khả năng cao do browser extension; không sửa `app/layout.tsx` khi chưa có evidence lỗi từ app.

## Phạm vi an toàn

- Không chạy official import.
- Không gọi RPC.
- Không gọi POST `/official-import`.
- Không chạy SQL.
- Không `supabase db push`.
- Không migration repair.
- Không seed.
- Không ghi `people`, `relationships`, `families`, `layout`, `tree`, `revision` hoặc `profile` thật.
- Không deploy.
- Không push.
- Không commit Excel, secret, env hoặc storage state.
- UI smoke chỉ read-only; nếu thiếu auth/storage state rõ ràng thì `SAFE_SKIP`.

## Date Precision Rule

Validation mới phải precision-aware:

- `deathYear < birthYear` => ERROR `death_before_birth`.
- `deathYear = birthYear` nhưng birth/death thiếu month/day, không đủ date precision, khác hệ lịch hoặc chưa rõ hệ lịch => WARNING, không block.
- Chỉ khi cả birth và death đều cùng calendar type, đủ full date precision và `deathDate < birthDate` => ERROR `death_before_birth`.
- Ngày chỉ có năm hoặc chưa chắc định dạng => WARNING `needs_review`.
- Không tự sửa dữ liệu nguồn.
- `Ngày Sinh` được hiểu là dương lịch: `birthDateCalendar = solar`.
- `Ngày mất` có thể là `deathDateCalendar = lunar | solar | unknown`.
- `Ngày giỗ` trong ngữ cảnh gia phả Việt được hiểu là âm lịch: `deathAnniversaryCalendar = lunar`.
- Không so sánh trực tiếp ngày sinh dương lịch với ngày mất âm lịch hoặc ngày mất chưa rõ hệ lịch như cùng một calendar.

Owner đã xác nhận dòng 19 và dòng 95 là người mất khi còn nhỏ, cùng năm với năm sinh, không phải ngày mất trước ngày sinh. Vì vậy hai case same-year/incomplete precision này phải là warning, không còn là blocker.

## Code Changes

- `lib/import/giapha4/normalize.ts`
  - Chuỗi 4 chữ số như `2020` được giữ là year-only date trước khi xét Excel serial number.
  - Year-only date trả warning để owner rà soát, không biến thành full date giả.
- `lib/import/giapha4/xlsx-staging-parser.ts`
  - Lưu hoặc suy luận calendar metadata vào raw metadata:
    `birth_date_calendar=solar`, `death_date_calendar=solar|lunar|unknown` và
    `death_anniversary_calendar=lunar`.
- `lib/import/giapha4/manifest-validation-service.ts`
  - `DateParts` có `precision: "year" | "year_month" | "full"`.
  - `DateParts` có `calendarType: "solar" | "lunar" | "unknown"`.
  - `death_before_birth` chỉ error khi `deathYear < birthYear`, hoặc khi cả hai ngày full precision và ngày mất thật sự nhỏ hơn ngày sinh.
  - Nếu birth/death khác calendar type hoặc death calendar unknown thì tạo warning cần chủ nhà xác nhận, không tạo blocker `death_before_birth`.
  - Same-year incomplete precision dùng warning `death_same_year_incomplete_precision`.
  - Year-only/incomplete birth/death dùng warning rà soát độ chính xác.

## UI Evidence

Owner-reported UI evidence từ import session hiện tại:

- Dòng staging: 102.
- Thành viên staging: 102.
- Quan hệ staging: 134.
- Cảnh báo: 44.
- Evidence cũ từng hiển thị số lỗi: 2.
- Dry-run bị chặn: 2.
- Hai lỗi cũ là `death_before_birth` ở dòng 19 và dòng 95.

Sau fix, hai lỗi same-year/incomplete precision dòng 19 và dòng 95 không được tính là blocker. UI smoke A-16Q-FIX chỉ đọc màn import session; không click dry-run, không click official import và không tạo dữ liệu thật.

Nếu có explicit env:

- `A16Q_FIX_IMPORT_SESSION_SMOKE_BASE_URL`
- `A16Q_FIX_IMPORT_SESSION_SMOKE_STORAGE_STATE`

thì smoke có thể mở `/admin/exports/import`, đọc text UI, kiểm tra nút nhập chính thức disabled và ghi counts nhìn thấy được. Nếu thiếu env hoặc thiếu Playwright runtime, smoke trả `SAFE_SKIP`.

## Hydration Assessment

Console warning Next.js có attribute `crxlauncher=""` trên `<html>`.

Assessment:

- `app/layout.tsx` không tạo attribute `crxlauncher`.
- Pattern `crxlauncher=""` trên thẻ `<html>` có khả năng cao do browser extension inject trước/sau hydration.
- Không thêm `suppressHydrationWarning`.
- Không sửa `app/layout.tsx` nếu chưa có evidence app code tạo mismatch.

## Official Import Lock

Official import vẫn khóa:

- `canRunOfficialImport=false`.
- UI button disabled.
- Không gọi RPC.
- Không gọi POST official import.
- Không ghi dữ liệu gia phả thật.

Next phase xét nhập chính thức vẫn cần owner approval session-specific riêng, không mở trong A-16Q-FIX.
