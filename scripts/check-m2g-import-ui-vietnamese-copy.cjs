const fs = require("node:fs");
const path = require("node:path");

const pagePath = path.join(
  process.cwd(),
  "app",
  "(admin)",
  "admin",
  "exports",
  "import",
  "page.tsx",
);
const source = fs.readFileSync(pagePath, "utf8");
const normalizedSource = source.replace(/\s+/gu, " ");

const expectedCopy = [
  "Chưa cấu hình Supabase. Trang vẫn cho kiểm tra cấu trúc JSON, nhưng không kiểm tra xung đột DB.",
  "Bạn cần đăng nhập để kiểm tra nhập dữ liệu.",
  "Bạn chưa có quyền imports.create.",
  "Nhập dữ liệu an toàn",
  "Kiểm tra và staging dữ liệu nhập",
  "Tải lên Gia Phả 4 theo session staging rõ ràng. Xác nhận nhập chính thức vẫn khóa trong phase này.",
  "Quay lại Sao lưu / Xuất dữ liệu",
  "Preview chỉ đọc staging/import metadata. Không tạo thành viên, quan hệ, layout cây, revision hoặc official import.",
  "Session ID trong URL không hợp lệ.",
  "Chưa chọn phiên nhập.",
  "Công cụ cũ và lịch sử kiểm toán",
  "Session A-16R lịch sử",
  "là bằng chứng kiểm toán.",
  "Workflow runtime hiện tại không dùng",
];
const legacyCopy = [
  "Chua cau hinh",
  "Trang van cho kiem tra",
  "Ban can dang nhap",
  "Ban chua co quyen",
  "Nhap du lieu an toan",
  "Kiem tra va staging du lieu nhap",
  "Tai len Gia Pha 4",
  "Quay lai Sao luu / Xuat du lieu",
  "Preview chi doc",
  "khong hop le",
  "Chua chon phien nhap",
  "Cong cu cu va lich su kiem toan",
  "lich su",
  "chi la bang chung kiem toan",
];
const expectedBlocks = [
  "Session ID trong URL không hợp lệ. Trang không tự chọn phiên mới nhất và không đọc session lịch sử thay thế.",
  "Chưa chọn phiên nhập. Sau khi upload staging thành công, trang sẽ chuyển sang URL có sessionId cụ thể. Refresh, tab mới và back/forward đều dựa trên session trong URL.",
  "Session A-16R lịch sử {HISTORICAL_A16R_AUDIT_SESSION_ID} chỉ là bằng chứng kiểm toán. Workflow runtime hiện tại không dùng session này làm gate.",
];
const mojibake = /(?:Ã.|Â.|â€™|â€œ|â€|�)/u;

for (const copy of expectedCopy) {
  if (!source.includes(copy)) throw new Error(`MISSING_EXPECTED_COPY: ${copy}`);
}
for (const snippet of legacyCopy) {
  if (source.includes(snippet)) throw new Error(`LEGACY_UNACCENTED_COPY: ${snippet}`);
}
for (const block of expectedBlocks) {
  if (!normalizedSource.includes(block)) {
    throw new Error(`MISSING_EXPECTED_COPY_BLOCK: ${block}`);
  }
}
if (mojibake.test(source)) throw new Error("MOJIBAKE_COPY_PRESENT");
if (source.includes(", không ghi dữ liệu")) throw new Error("INHERITED_COPY_REINTRODUCED_WRITE_CLAIM");

console.log(JSON.stringify({
  status: "PASS",
  checker: "m2g-import-ui-vietnamese-copy",
  expectedCopyCount: expectedCopy.length,
  expectedBlockCount: expectedBlocks.length,
  legacySnippetCount: legacyCopy.length,
  mojibake: false,
}));
