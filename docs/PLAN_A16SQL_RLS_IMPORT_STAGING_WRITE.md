# A-16SQL-RLS-IMPORT-STAGING-WRITE - Import Staging Write RLS Candidate

Final status: `A16SQL_STATUS=SQL_CANDIDATE_READY_NOT_APPLIED`

## Mục tiêu

A-16SQL-RLS-IMPORT-STAGING-WRITE tạo SQL candidate để mở quyền ghi staging
tối thiểu cho luồng A-16I upload Gia Phả 4. Lỗi thực tế cần xử lý ở DB layer:

- `Không đọc được file Gia Phả 4`
- `Không tạo được import session staging. Bảng có thể đang được RLS bảo vệ hoặc bạn chưa có quyền ghi staging.`

Giả thuyết được ghi nhận: 5 bảng import manifest staging đã được owner apply
thủ công và bật RLS trong A-16F5M, nhưng chưa có policy INSERT/WRITE phù hợp
cho authenticated user có quyền `imports.create`.

## Phạm Vi

Được tạo trong phase này:

- SQL candidate:
  `db/migrations/20260630_0011_a16sql_import_staging_write_rls.sql`
- Supabase mirror byte-for-byte:
  `supabase/migrations/20260630_0011_a16sql_import_staging_write_rls.sql`
- SQL kiểm chứng chỉ SELECT:
  `db/checks/20260630_check_a16sql_import_staging_write_rls.sql`
- Checker:
  `scripts/check-a16sql-rls-import-staging-write.cjs`
- Package script:
  `check:a16sql-rls-import-staging-write`

Không thay đổi runtime upload/preview UI/API trong phase này.

## Ranh Giới An Toàn

- Không chạy `supabase db push`.
- Không chạy `supabase db push --dry-run`.
- Không chạy `supabase migration repair`.
- Không apply SQL trong phase này.
- Không seed.
- Không import Excel.
- Không ghi people/person thật.
- Không ghi relationships thật.
- Không ghi layout/tree/revision thật.
- Không dùng service role để bypass RLS.
- Không disable RLS.
- Không cấp anon/public.
- Không mở official import.
- Không deploy.
- Không push.
- Không commit secret hoặc file dữ liệu thật.

## Policy Candidate

Candidate chỉ nhắm 5 bảng staging đã được A-16F5M xác nhận:

- `import_sessions`
- `import_session_warnings`
- `import_duplicate_candidates`
- `import_relationship_candidates`
- `import_write_manifests`

Nguyên tắc:

- Role policy: `to authenticated`.
- Predicate bắt buộc: `public.has_permission('imports.create')`.
- Session ownership: `created_by = public.current_profile_id()`.
- `import_sessions`: mở `SELECT`, `INSERT`, `UPDATE` cho session preview của
  chính người tạo; không mở `DELETE`.
- Các bảng con: mở `SELECT`, `INSERT` khi session cha thuộc chính người tạo;
  không mở `UPDATE`/`DELETE`.
- `import_write_manifests`: chỉ cho `status = 'draft'`, `created_by` là
  profile hiện tại, chưa `approved_by`, chưa `approved_at`, chưa `completed_at`.
- Không policy nào dùng `using (true)` hoặc `with check (true)`.
- Không policy nào dùng `to anon`, `to public` hoặc grant public/anon.
- Không policy nào thêm vào bảng real genealogy như `people`,
  `couple_relationships`, layout/tree/revision.

## Vì Sao Có SELECT Policy

Luồng A-16I gọi:

1. `insert(import_sessions).select("id").single()`.
2. Insert warnings/duplicates/relationships/write manifest.
3. Update summary của `import_sessions`.

Với Supabase/PostgREST và RLS, `INSERT ... RETURNING` cần policy đọc phù hợp để
trả `id`; `UPDATE` cũng cần hàng hiện hữu đi qua policy. Vì vậy candidate mở
`SELECT` theo ownership, không phải mở read toàn bộ staging.

## Rollback Plan

Nếu owner apply candidate và cần rollback policy, rollback chỉ xóa policy
A-16SQL:

- `a16sql_import_sessions_select_own`
- `a16sql_import_sessions_insert_own`
- `a16sql_import_sessions_update_own_preview`
- `a16sql_import_session_warnings_select_own_session`
- `a16sql_import_session_warnings_insert_own_session`
- `a16sql_import_duplicate_candidates_select_own_session`
- `a16sql_import_duplicate_candidates_insert_own_session`
- `a16sql_import_relationship_candidates_select_own_session`
- `a16sql_import_relationship_candidates_insert_own_session`
- `a16sql_import_write_manifests_select_own_session`
- `a16sql_import_write_manifests_insert_own_session`

Rollback không cần xóa bảng và không cần đụng dữ liệu people/relationships thật.

## Kiểm Chứng Sau Khi Apply Thủ Công

Chỉ sau owner approval và manual SQL apply, owner/operator có thể chạy SQL
read-only trong Supabase SQL Editor:

`db/checks/20260630_check_a16sql_import_staging_write_rls.sql`

Query này chỉ SELECT metadata và kiểm:

- RLS vẫn enabled trên 5 bảng staging.
- 5 bảng có authenticated SELECT policy.
- 5 bảng có authenticated INSERT policy.
- Chỉ `import_sessions` có authenticated UPDATE policy.
- Không có anon/public staging policy.
- Permission `imports.create` tồn tại.
- Không có policy A-16SQL trên bảng gia phả thật.

## Migration History Risk

A-16F5M đã ghi nhận schema import manifest được owner apply thủ công qua
Supabase Dashboard, không qua Supabase CLI migration history. Vì vậy:

- Không chạy lại migration này bằng `supabase db push` khi chưa có
  reconciliation plan.
- Không chạy `supabase migration repair` trong phase này.
- Nếu sau này dùng Supabase CLI, phải kiểm tra migration history trước.

## Validation Plan

Chạy local:

- `npm run check:env:safe`
- `npm run check:migrations`
- `npm run check:a16g-import-session-read-manifest-runtime`
- `npm run check:a16h-import-manifest-auth-browser-smoke`
- `npm run check:a16i-upload-parse-giapha4-manifest-staging`
- `npm run check:a16j-manifest-staging-review-validation-warnings`
- `npm run check:a16i2-real-giapha4-upload-smoke`
- `npm run check:a16k-owner-approval-gate-dry-run-import`
- `npm run check:a16l-dry-run-mapping-preview`
- `npm run check:a16sql-rls-import-staging-write`
- `npm run smoke:a16i2-real-giapha4-upload-staging`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `git diff --cached --check`

Phase này không chứng minh DB production đã có policy; chỉ chứng minh candidate
và checker local hợp lệ.
