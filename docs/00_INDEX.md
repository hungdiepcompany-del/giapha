# Bản đồ tài liệu

Không bắt AI đọc tất cả file `.md` mỗi lần. AI chỉ đọc file liên quan task để tiết kiệm token và tránh loãng context.

| File | Mục đích | Khi nào cần đọc |
| --- | --- | --- |
| README.md | Tổng quan dự án, stack, nguyên tắc dữ liệu lâu dài và cách chạy/deploy placeholder. | Luôn đọc khi bắt đầu một task mới hoặc cần định hướng dự án. |
| AGENTS.md | Quy tắc làm việc cho AI coding. | Luôn đọc trước khi AI sửa code hoặc tài liệu. |
| 01_PROJECT_OVERVIEW.md | Mục tiêu, người dùng chính và nguyên tắc 100 năm. | Khi cần hiểu phạm vi sản phẩm hoặc tránh mở rộng sai hướng. |
| 02_ARCHITECTURE.md | Stack, luồng chính, server/client boundary và deploy. | Khi task liên quan kiến trúc, runtime, Supabase, Cloudflare hoặc service layer. |
| 03_DATABASE_MODEL.md | Mô hình bảng nền, bảng gia phả, layout, revision và backup. | Khi task liên quan schema, migration, query hoặc quan hệ gia phả. |
| 04_PERMISSION_PRIVACY_MODEL.md | Roles, permissions, public/private mode và RLS. | Khi task liên quan auth, quyền, riêng tư, public page hoặc RLS. |
| 05_TREE_UI_MODEL.md | Nguyên tắc React Flow/ELK.js, node card, side panel và toolbar. | Khi task liên quan cây gia phả, layout cây hoặc chỉnh sửa trực tiếp trên cây. |
| 06_EXPORT_BACKUP_MODEL.md | Nguyên tắc JSON/GEDCOM/ZIP, manifest, checksum và import. | Khi task liên quan export, import, backup, phục hồi hoặc chuyển đổi dữ liệu. |
| 07_PHASE_PLAN.md | Kế hoạch theo phase, scope, nghiệm thu và lệnh test. | Khi lập kế hoạch, chọn task tiếp theo hoặc kiểm tra task có đúng phase không. |
| 08_AI_WORK_LOG.md | Nhật ký việc AI đã làm. | Sau mỗi task để cập nhật lịch sử làm việc và bằng chứng kiểm tra. |
| 09_DECISION_LOG.md | Các quyết định kiến trúc/sản phẩm quan trọng. | Khi có quyết định mới hoặc cần kiểm tra lý do của quyết định cũ. |
| 99_NEXT_AI_HANDOFF.md | Trạng thái mới nhất và handoff cho AI tiếp theo. | Luôn đọc phần trên cùng trước khi tiếp tục dự án. |

