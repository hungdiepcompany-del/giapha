const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");

const sourceRoots = [
  "components/tree-print",
  "lib/family/print",
  "app/(admin)/admin/tree/print",
];

const forbiddenPatterns = [
  { name: "LATIN1_UTF8_LEAD_C3", re: /\u00c3/ },
  { name: "LATIN1_UTF8_LEAD_C2", re: /\u00c2/ },
  { name: "LATIN1_UTF8_LEAD_C4", re: /\u00c4/ },
  { name: "LATIN1_UTF8_LEAD_C6", re: /\u00c6/ },
  { name: "REPLACEMENT_CHARACTER", re: /\ufffd/ },
  { name: "VIETNAMESE_TONE_BYTES_SPLIT", re: /\u00e1[\u00ba\u00bb]/ },
  { name: "SMART_PUNCTUATION_MOJIBAKE", re: /\u00e2(?:\u20ac|\u0153|\u201d|\u201c|\u201e|\u2014)/ },
];

function walk(relativeDir) {
  const absoluteDir = path.join(root, relativeDir);
  if (!fs.existsSync(absoluteDir)) return [];
  return fs.readdirSync(absoluteDir, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = path.join(relativeDir, entry.name).replace(/\\/g, "/");
    if (entry.isDirectory()) return walk(relativePath);
    if (!/\.(?:ts|tsx|cjs|mjs|css|json)$/.test(entry.name)) return [];
    return [relativePath];
  });
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

const files = sourceRoots.flatMap(walk).sort();
const failures = [];

for (const file of files) {
  const lines = read(file).split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const pattern of forbiddenPatterns) {
      if (pattern.re.test(line)) {
        failures.push(`${file}:${index + 1}:${pattern.name}`);
      }
    }
  });
}

assert.deepEqual(failures, []);

const printSource = files.map(read).join("\n");
for (const label of [
  "Bảng chẩn đoán: ",
  "Hiện bảng chẩn đoán",
  "Ẩn bảng chẩn đoán",
  "Chẩn đoán bật",
  "Chẩn đoán tắt",
  "Vừa màn hình",
  "Phóng to",
  "Thu nhỏ",
  "Tải SVG khổ bạt",
  "Thử In / Lưu PDF",
  "Hướng thực tế",
  "Bố trí thế hệ",
  "Khoảng trống",
  "Cụm",
  "Khổ cuộn dùng",
  "Mật độ",
]) {
  assert.ok(printSource.includes(label), `missing exact Vietnamese label: ${label}`);
}

console.log("[A17P2P6R1 Mojibake] PASS");
