# Template Worker

Template này chỉ là mẫu cho service worker tương lai của WEB GIA PHẢ. Không liên kết template này vào app chính, không deploy trực tiếp và không đặt secret thật trong repo.

## Khi dùng

Copy thư mục này sang tên worker thật, ví dụ:

- `services/export-backup-worker`
- `services/import-validate-worker`
- `services/media-worker`
- `services/pdf-image-export-worker`

Sau khi copy, cập nhật `name` trong `wrangler.toml`, cấu hình secret thật bằng Cloudflare và thiết kế contract riêng cho service đó.

## Routes

- `GET /health`: health check công khai, trả JSON envelope.
- `POST /internal/example`: route nội bộ mẫu, yêu cầu `Authorization: Bearer <SERVICE_INTERNAL_TOKEN>`.

## Auth

`SERVICE_INTERNAL_TOKEN` là placeholder binding trong template. Token thật phải được cấu hình bằng Cloudflare secret hoặc cơ chế quản lý secret tương đương, không commit vào repo.

## JSON envelope

Response thành công:

```json
{
  "ok": true,
  "data": {}
}
```

Response lỗi:

```json
{
  "ok": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Unauthorized"
  }
}
```
