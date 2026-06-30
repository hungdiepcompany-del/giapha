# A-16I2 - Real Gia Phả 4 Upload Smoke

Marker: `A16I2_REAL_GIAPHA4_UPLOAD_SMOKE`

## Mục tiêu

A-16I2 thêm smoke test có kiểm soát để owner/operator có thể upload một file
Gia Phả 4 thật vào manifest staging trong môi trường dev/staging đã đăng nhập.
Smoke kiểm tra parser A-16I, màn review manifest A-16G và validation A-16J với
dữ liệu thật nhưng không mở import chính thức.

## Env explicit

Smoke chỉ chạy thật khi có đủ ba biến:

- `A16I2_GIAPHA4_REAL_UPLOAD_BASE_URL`
- `A16I2_GIAPHA4_REAL_UPLOAD_STORAGE_STATE`
- `A16I2_GIAPHA4_REAL_FILE_PATH`

Nếu thiếu bất kỳ biến nào, smoke dừng trước khi mở browser hoặc đọc file:

```text
A16I2_REAL_UPLOAD_SMOKE_STATUS=SAFE_SKIP_MISSING_EXPLICIT_ENV
```

Nếu file thật không tồn tại:

```text
A16I2_REAL_UPLOAD_SMOKE_STATUS=SAFE_SKIP_MISSING_REAL_FILE
```

Nếu file thật nằm trong repo `D:\CODE\GIA PHẢ` hoặc có thể bị Git track:

```text
A16I2_REAL_UPLOAD_SMOKE_STATUS=FAIL_REAL_FILE_INSIDE_REPO
```

## File thật

File Gia Phả 4 thật phải nằm ngoài repo. Không copy file thật vào repo, không
commit file thật, không commit storage state/cookie/session và không commit ảnh
chụp chứa dữ liệu thật.

Giới hạn định dạng:

- `.xlsx`: được phép upload vào manifest staging.
- `.xls`: chưa hỗ trợ vì parser binary `.xls` chưa được duyệt; smoke trả
  `SAFE_SKIP_UNSUPPORTED_XLS` và không cố parse.

## Dữ liệu được phép ghi

A-16I2 chỉ được phép ghi manifest staging/session staging qua flow A-16I.
Nói ngắn gọn: chỉ manifest staging/session staging, không ghi dữ liệu gia phả
thật.

- `import_sessions`
- `import_session_warnings`
- `import_duplicate_candidates`
- `import_relationship_candidates`
- `import_write_manifests`

Dữ liệu không được ghi:

- không ghi people/person thật;
- không ghi relationships thật;
- không cập nhật layout/tree/revision thật;
- không mở official import;
- không tạo route confirm/commit/finalize/import-now/official-import;
- không deploy;
- không push.

## Chính sách log

Smoke không log dữ liệu cá nhân thô. Nếu chạy thật, chỉ output summary count,
session id nếu không nhạy cảm và warning code. Không output raw rows, họ tên đầy
đủ, ngày sinh đầy đủ, quê quán đầy đủ, ghi chú riêng hoặc nội dung workbook.

Machine-readable output khi PASS:

```text
A16I2_REAL_UPLOAD_SMOKE_STATUS=PASS
A16I2_SESSION_ID=<id>
A16I2_PEOPLE_COUNT=<number>
A16I2_RELATIONSHIP_COUNT=<number>
A16I2_ERROR_COUNT=<number>
A16I2_WARNING_COUNT=<number>
A16I2_INFO_COUNT=<number>
A16I2_COUNTS_AVAILABLE=true
```

Nếu không đọc được count:

```text
A16I2_COUNTS_AVAILABLE=false
```

## Mutation guard

Smoke chặn mọi mutation nguy hiểm. Allowlist mutation duy nhất:

- `POST /api/admin/import-sessions/upload`

GET list/manifest/validation được phép. Smoke fail nếu route/action chứa:

- `confirm`
- `commit`
- `finalize`
- `official-import`
- `import-now`
- `apply`
- `write-real-tree`

## Scripts

- `scripts/smoke-a16i2-real-giapha4-upload-staging.cjs`
- `scripts/check-a16i2-real-giapha4-upload-smoke.cjs`

Package scripts:

- `smoke:a16i2-real-giapha4-upload-staging`
- `check:a16i2-real-giapha4-upload-smoke`

## Kết quả hiện tại

Trên máy hiện tại chưa có explicit env/file thật A-16I2 trong shell chạy
validation, nên smoke safe-skip:

```text
A16I2_REAL_UPLOAD_SMOKE_STATUS=SAFE_SKIP_MISSING_EXPLICIT_ENV
A16I2_COUNTS_AVAILABLE=false
```

Đây là kết quả chấp nhận được cho phase này vì checker vẫn xác nhận smoke có
cổng chạy thật an toàn và không đọc file khi thiếu env.

## Validation

Kết quả local sau phase:

- `check:env:safe`: PASS
- `check:migrations`: PASS
- `check:a16g-import-session-read-manifest-runtime`: PASS
- `check:a16h-import-manifest-auth-browser-smoke`: PASS
- `check:a16i-upload-parse-giapha4-manifest-staging`: PASS
- `check:a16j-manifest-staging-review-validation-warnings`: PASS
- `check:a16i2-real-giapha4-upload-smoke`: PASS
- `smoke:a16i2-real-giapha4-upload-staging`: SAFE_SKIP_MISSING_EXPLICIT_ENV
- `typecheck`: PASS
- `lint`: PASS
- `build`: PASS
- `git diff --check`: PASS
- `git diff --cached --check`: PASS

## Guardrails

- Không migration.
- Không DB push.
- Không SQL apply.
- Không `supabase migration repair`.
- Không seed.
- Không ghi people/person thật.
- Không ghi relationships thật.
- Không cập nhật layout/tree/revision thật.
- Không mở official import.
- Không deploy.
- Không push.

## Bước tiếp theo

- A-16I2 rerun thật khi owner cung cấp explicit env và file `.xlsx` ngoài repo.
- A-16I3 nếu smoke file thật phát hiện bug parser/validation cần hardening.
- A-16K nếu owner muốn thiết kế approval gate cho dry-run/import chính thức.
