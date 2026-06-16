# Service Boundary & Worker Split Plan

## Status

READINESS_ONLY

Phase 15B chỉ chuẩn bị boundary và template cho khả năng tách service sau này. Chưa tách Worker thật, chưa tạo Cloudflare service thật, chưa deploy và chưa đổi business logic.

## Phase 15B Technical Status

PASS_WITH_KNOWN_AUDIT_ADVISORIES

- Phase 15B technical status: PASS.
- Commit status: allowed with audit exception.
- Audit status: `npm audit --audit-level=moderate` still reports advisories in dependency/toolchain chain: `next`/`postcss`, `@opennextjs/cloudflare`, `wrangler`, `esbuild` and `ws`.
- Policy: no `npm audit fix --force`; track upstream package updates.
- Reason: current advisory remediation may require force/breaking changes and could destabilize Next/OpenNext deploy wiring.

## Main Web Worker

Giữ:

- UI public
- UI admin
- auth callback
- people CRUD nhẹ
- relationship CRUD nhẹ
- tree viewer/editor nhẹ
- gọi service phụ khi cần

Không giữ lâu dài:

- ZIP lớn
- PDF/image export
- media processing
- backup automation
- import confirm lớn

## Candidate Split Services

### export-backup-worker

Tương lai xử lý:

- family.json
- GEDCOM
- ZIP backup
- checksum
- scheduled/manual backup

### import-validate-worker

Tương lai xử lý:

- JSON parse
- schema validation
- missing reference validation
- cycle check
- conflict report
- phase đầu không ghi DB

### media-worker

Tương lai xử lý:

- media upload
- image resize/compress
- metadata
- media backup

### pdf-image-export-worker

Tương lai xử lý:

- tree image export
- PDF export

## Split Trigger Thresholds

Tách service nếu có một trong các dấu hiệu:

- OpenNext Worker gzip gần 2.5 MiB trên Free plan.
- Deploy fail vì Worker size.
- Export/import request timeout hoặc memory tăng.
- ZIP/PDF/image xử lý chậm.
- Route chính bị ảnh hưởng bởi package nặng.
- Một module cần queue/cron/retry.

## Cloudflare/OpenNext Notes

- App Next.js SSR/server routes deploy qua Cloudflare Workers/OpenNext.
- OpenNext build/deploy nên chạy bằng WSL/Linux/GitHub Actions nếu Windows gặp lỗi.
- Không sửa app logic chỉ để né lỗi OpenNext Windows local.
- Static assets nên để static assets, không gọi Worker nếu không cần.

## Boundary Rule

UI không nên phụ thuộc trực tiếp vào implementation nặng nếu service có thể tách.
Dùng adapter/client layer để sau này đổi từ local function sang HTTP/service binding.

## Do Not Split Yet

Hiện tại chưa tách thật vì:

- App còn nhỏ.
- Dữ liệu gia phả ban đầu chưa lớn.
- Cần deploy lần đầu và đo bundle thật.
