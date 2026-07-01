# A-16Q-FIX3 - Lunar Death Date Contradiction and Duplicate UI Save Verification

Marker: `A-16Q-FIX3`

Status: `A16Q_FIX3_STATUS=LUNAR_DEATH_CONTRADICTION_WARNING_DUP_SAVE_VERIFIED`

## Mục tiêu

A-16Q-FIX3 sửa case dòng 95 khi dữ liệu ngày mất có mâu thuẫn hệ lịch:

- Ngày sinh dương lịch: `26/5/2014`.
- Cột “Ngày mất (Dương lịch)” có giá trị `28/4/2014`.
- Cột “Ngày giỗ (Âm lịch)” cũng là `28/4/2014`.
- Tiểu sử ghi mẫu đã được owner cung cấp: sinh và mất cùng ngày dương lịch
  `26/5/2014`, tức ngày `28 tháng 04 năm 2014 âm lịch`.

Kết luận an toàn: `28/4/2014` trong vùng ngày mất có khả năng là ngày âm lịch
hoặc nhập lệch calendar, nên không được so sánh trực tiếp với ngày sinh dương
lịch để tạo blocker `death_before_birth`.

## Rule

- Nếu death date full precision nhưng trùng với death anniversary lunar, hoặc
  tiểu sử/ghi chú có pattern `tức ngày ... âm lịch`, thì death calendar được
  suy luận là `calendar_conflict`.
- Nếu notes chứa cả ngày sinh/mất dương lịch cùng ngày như `26/5/2014`, không
  tạo blocker từ giá trị ngày mất đang mâu thuẫn.
- Nếu death calendar là `lunar`, `unknown` hoặc `calendar_conflict` thì không
  tạo ERROR `death_before_birth`; chỉ tạo WARNING cần chủ nhà xác nhận.
- `death_before_birth` chỉ là ERROR khi chắc chắn cùng hệ lịch đã biết, đủ full
  precision và `deathDate < birthDate`, hoặc khi death year chắc chắn nhỏ hơn
  birth year trong cùng hệ lịch đã biết.
- Không tự sửa dữ liệu nguồn.

## Sanitized Regression

- Marker code: `A16Q_FIX3_ROW95_LUNAR_CONTRADICTION_REGRESSION_CASE`.
- Row number: 95.
- PII: redacted.
- Birth date: `2014-05-26`, calendar `solar`.
- Death value: `2014-04-28`, column label `Ngày mất (Dương lịch)`.
- Lunar anniversary value: `28/4/2014`.
- Notes pattern: `tức ngày ... âm lịch`.
- Inferred death calendar: `calendar_conflict`.
- Expected code: `death_date_calendar_conflict_needs_review`.
- Expected severity: `warning`.
- Expected blocker: `false`.

## Duplicate UI Save Verification

- Duplicate decision save UI remains enabled from the owner-confirmed RLS PASS
  phase.
- UI still requires owner action through “Lưu quyết định”.
- The client component does not auto choose `create_new`, `link_existing`,
  `ignore_candidate`, `needs_review` or `unresolved`.
- Current owner evidence still has `unresolved_duplicate_rows=8`, so duplicate
  blockers remain until owner saves decisions.

## Official Import Lock

- `canRunOfficialImport=false`.
- Official import button remains disabled.
- No RPC call.
- No POST `/official-import`.
- No SQL run by Codex.
- No DB push, no migration repair and no seed.
- No writes to `people`, `relationships`, `families`, `layout`, `tree`,
  `revision` or `profile`.
- No deploy and no push.
