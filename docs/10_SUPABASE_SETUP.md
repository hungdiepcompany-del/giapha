# Supabase setup

Phase 11 chuẩn hóa cổng kiểm tra tích hợp Supabase thật. Tài liệu này chỉ hướng dẫn cấu hình và smoke test; không yêu cầu commit secret, không deploy, không tự động chạy migration production.

## Không commit secret

- `.env.local` chỉ nằm local trên máy dev.
- `.env.local` đã nằm trong `.gitignore`.
- Không paste service role key vào chat/log/tài liệu.
- Không chụp màn hình hoặc copy raw token vào issue/PR.
- Chỉ dùng script `npm run check:env:safe` để kiểm trạng thái present/missing, không in giá trị.

## Biến môi trường cần có

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Gợi ý thao tác local:

1. Copy `.env.example` thành `.env.local`.
2. Điền giá trị từ Supabase project thật.
3. Chạy `npm run check:env:safe`.
4. Không commit `.env.local`.

Nếu `.env.local` thiếu key, script chỉ báo `missing` và kết luận smoke test Supabase thật chưa sẵn sàng. Script không in giá trị secret.

## Thứ tự chạy migration

Chạy trên Supabase SQL Editor hoặc CLI đã xác thực đúng project, theo đúng thứ tự:

1. `20260614_0001_foundation_auth_roles_permissions.sql`
2. `20260614_0002_auth_permission_hardening.sql`
3. `20260614_0003_people_foundation.sql`
4. `20260614_0004_relationship_foundation.sql`
5. `20260614_0005_tree_layout_foundation.sql`
6. `20260614_0006_export_backup_foundation.sql`

Trước khi chạy migration thật:

```bash
npm run check:migrations
```

Sau khi chạy migration thật, đăng nhập ít nhất một lần để profile được tạo, rồi mới gán OWNER.

## Gán OWNER

- Dùng `db/snippets/assign-owner-role.sql`.
- Chỉ chạy sau khi user đã đăng nhập ít nhất một lần để có profile.
- Kiểm tra kỹ email literal trong snippet trước khi chạy.
- Không auto OWNER trong app code.
- Chỉ chạy từ SQL console/admin context đáng tin cậy.

## Smoke test browser

Chạy app local:

```bash
npm run dev
```

Sau đó kiểm tra bằng browser thật:

- `/auth/login`
- Magic link callback
- `/admin`
- `/admin/people`
- `/admin/relationships`
- `/admin/tree`
- `/admin/tree/edit`
- `/admin/exports`
- `/admin/exports/import`
- `/admin/revisions`
- `/tree`

## Admin system status

Route `/admin/system/status` chỉ hiển thị trạng thái cấu hình dạng yes/no:

- Supabase URL configured
- Anon key configured
- Service role configured server-side
- Foundation checks cần chạy

Route này yêu cầu `settings.manage` hoặc `permissions.manage`. Route không hiển thị secret và không query dữ liệu nhạy cảm.
