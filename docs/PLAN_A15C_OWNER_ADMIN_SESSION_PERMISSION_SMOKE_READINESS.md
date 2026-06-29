# A-15C - Owner/Admin Session Permission Smoke Readiness

Status: `READINESS_RECORDED_LOCAL`

Marker: `A15C_OWNER_ADMIN_SESSION_PERMISSION_SMOKE_READINESS`

## Mục Tiêu

A-15C xác minh bằng truy vấn đọc-only rằng tài khoản owner/admin đã có auth user,
profile, role và permission đủ để chạy browser smoke admin sau A-15B.

Nguyên tắc kiểm tra: SELECT/read-only, không mutate dữ liệu.

## Phạm Vi SELECT/Read-Only

Được làm:

- đọc `.env.local` cục bộ để kiểm tra biến môi trường cần cho smoke;
- dùng Supabase admin client phía script để tra cứu auth user, profile, role và
  permission;
- in ra cờ boolean và count, không in secret, email, token hoặc id riêng tư.

Không làm:

- Không seed dữ liệu;
- Không gán role;
- Không sửa role/permission;
- Không đổi database, migration, RLS, auth, API contract hoặc service runtime;
- Không tạo session browser và không lưu cookie/token.

## Điều Kiện Chạy

Script:

- `npm run smoke:a15c:owner-admin-session-permission-readiness`

Biến shell tạm:

- `A15C_OWNER_EMAIL`

Biến env cục bộ được kiểm tra bằng cờ có/không:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Kết Quả Rerun

Command đã chạy đọc-only sau khi set `A15C_OWNER_EMAIL` trong shell:

```text
ENV_SUPABASE_URL_PRESENT=true
ENV_SUPABASE_ANON_PRESENT=true
ENV_SERVICE_ROLE_PRESENT=true
ADMIN_CLIENT_READY=true
AUTH_USER_FOUND=true
PROFILE_FOUND=true
ROLE_COUNT=1
PERMISSION_COUNT=25
REQUIRED_ADMIN_PERMISSION_MISSING_COUNT=0
READINESS_STATUS=PASS
READINESS_REASON=OWNER_ADMIN_PERMISSION_READY_READ_ONLY
```

Kết luận: owner/admin permission readiness là `PASS`. Vì vậy không cần A-15D
seed/gán quyền cho phase browser smoke này.

## Giới Hạn

A-15C chỉ chứng minh dữ liệu auth/profile/role/permission đã sẵn sàng trong DB.
Nó không chứng minh browser hiện tại đã có cookie/session owner/admin. A-15B1
vẫn phải mở browser thật để xác nhận session có được bind vào app local hay chưa.

## Validation Plan

- `npm run smoke:a15c:owner-admin-session-permission-readiness`
- `npm run check:a15c:owner-admin-session-permission-smoke-readiness`
