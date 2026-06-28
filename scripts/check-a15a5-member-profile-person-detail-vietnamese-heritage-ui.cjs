const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];
const marker = "A15A5_MEMBER_PROFILE_PERSON_DETAIL_VIETNAMESE_HERITAGE_UI";

const allowedChangedFiles = new Set([
  "app/(admin)/admin/people/[id]/page.tsx",
  "app/(public)/people/[slug]/page.tsx",
  "components/people/person-form.tsx",
  "components/public/public-person-profile.tsx",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "docs/PLAN_A15A5_MEMBER_PROFILE_PERSON_DETAIL_VIETNAMESE_HERITAGE_UI.md",
  "package.json",
  "scripts/check-a15a2-modern-vietnamese-genealogy-tree-editor-ui.cjs",
  "scripts/check-a15a3-vietnamese-heritage-public-tree-view-ui.cjs",
  "scripts/check-a15a4-vietnamese-heritage-family-list-admin-dashboard-ui.cjs",
  "scripts/check-a15a5-member-profile-person-detail-vietnamese-heritage-ui.cjs",
]);

function readFile(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function readJson(relativePath) {
  const content = readFile(relativePath);
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    failures.push(`${relativePath} is not valid JSON`);
    return null;
  }
}

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

function rejectPattern(content, pattern, label = String(pattern)) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

function gitOutput(args) {
  try {
    return childProcess.execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch {
    failures.push(`git ${args.join(" ")} failed`);
    return "";
  }
}

function gitShowHead(relativePath) {
  try {
    return childProcess.execFileSync("git", ["show", `HEAD:${relativePath}`], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return "";
  }
}

const packageJson = readJson("package.json");
const doc = readFile(
  "docs/PLAN_A15A5_MEMBER_PROFILE_PERSON_DETAIL_VIETNAMESE_HERITAGE_UI.md",
);
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");
const a15a2Checker = readFile(
  "scripts/check-a15a2-modern-vietnamese-genealogy-tree-editor-ui.cjs",
);
const a15a3Checker = readFile(
  "scripts/check-a15a3-vietnamese-heritage-public-tree-view-ui.cjs",
);
const a15a4Checker = readFile(
  "scripts/check-a15a4-vietnamese-heritage-family-list-admin-dashboard-ui.cjs",
);

const uiFiles = [
  "app/(admin)/admin/people/[id]/page.tsx",
  "app/(public)/people/[slug]/page.tsx",
  "components/people/person-form.tsx",
  "components/public/public-person-profile.tsx",
];
const ui = uiFiles.map(readFile).join("\n");

for (const token of [
  "A-15A5 - Member Profile / Person Detail Vietnamese Heritage UI",
  marker,
  "Phạm Vi UI-Only",
  "Màn Được Chỉnh",
  "Màn Không Đụng",
  "Nguyên Tắc Không Copy Website Tham Khảo",
  "không copy code, asset, logo",
  "không mở runtime/service boundary",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  marker,
  "Hồ sơ thành viên",
  "Thông tin cơ bản",
  "Gia đình & quan hệ",
  "Chưa cập nhật",
  "Không tìm thấy thành viên",
  "Đang tải hồ sơ thành viên",
  "Ghi chú",
  "Quyền riêng tư",
  "Thêm cha",
  "Thêm vợ/chồng",
  "Xem trong phả đồ",
]) {
  requireIncludes(ui, token, `UI token ${token}`);
}

for (const [content, token, label] of [
  [
    index,
    "PLAN_A15A5_MEMBER_PROFILE_PERSON_DETAIL_VIETNAMESE_HERITAGE_UI.md",
    "index entry",
  ],
  [
    workLog,
    "A-15A5 - Member Profile / Person Detail Vietnamese Heritage UI",
    "work log entry",
  ],
  [
    handoff,
    "A-15A5 - Member Profile / Person Detail Vietnamese Heritage UI completed",
    "handoff entry",
  ],
  [workLog, marker, "work log marker"],
  [handoff, marker, "handoff marker"],
  [
    decisionLog,
    "Decision 183 - A-15A5 member profile/person detail polish is UI-only",
    "decision log entry",
  ],
  [
    a15a2Checker,
    "A-15A2 Modern Vietnamese Genealogy Tree Editor UI check passed.",
    "A-15A2 checker intact",
  ],
  [
    a15a3Checker,
    "A-15A3 Vietnamese heritage public tree view UI check passed.",
    "A-15A3 checker intact",
  ],
  [
    a15a4Checker,
    "A-15A4 Vietnamese heritage family list/admin dashboard UI check passed.",
    "A-15A4 checker intact",
  ],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.[
    "check:a15a5:member-profile-person-detail-vietnamese-heritage-ui"
  ] !==
  "node scripts/check-a15a5-member-profile-person-detail-vietnamese-heritage-ui.cjs"
) {
  failures.push(
    "missing package script check:a15a5:member-profile-person-detail-vietnamese-heritage-ui",
  );
}

for (const scriptName of [
  "check:a15a2:modern-vietnamese-genealogy-tree-editor-ui",
  "check:a15a3:vietnamese-heritage-public-tree-view-ui",
  "check:a15a4:vietnamese-heritage-family-list-admin-dashboard-ui",
]) {
  if (!packageJson?.scripts?.[scriptName]) {
    failures.push(`${scriptName} was removed`);
  }
}

const changedFiles = gitOutput(["status", "--porcelain"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === "PLANNING.MD") failures.push("PLANNING.MD must not be changed");
  if (file.startsWith("db/") || file.endsWith(".sql")) {
    failures.push(`database/sql file changed ${file}`);
  }
  if (/schema|migration|seed/i.test(file) && !file.startsWith("docs/")) {
    failures.push(`schema/migration/seed-like file changed ${file}`);
  }
  if (/wrangler|open-next|opennext|cloudflare-env|middleware|next\.config/i.test(file)) {
    failures.push(`Worker/OpenNext/Wrangler/runtime config file changed ${file}`);
  }
  if (
    file.startsWith("app/api/") ||
    file.startsWith("lib/") ||
    file.startsWith("server/") ||
    file.startsWith("services/") ||
    file.startsWith("pages/")
  ) {
    failures.push(`API/service/runtime file changed ${file}`);
  }
  if (/storage-state|storage_state|session|cookie|token|secret|\.png$|\.jpg$|\.jpeg$|\.webp$/i.test(file)) {
    failures.push(`possible secret/session/evidence/external asset artifact changed ${file}`);
  }
}

const packageHead = gitShowHead("package.json");
if (packageHead) {
  const before = JSON.parse(packageHead);
  const beforeDeps = JSON.stringify(before.dependencies ?? {});
  const afterDeps = JSON.stringify(packageJson.dependencies ?? {});
  const beforeDevDeps = JSON.stringify(before.devDependencies ?? {});
  const afterDevDeps = JSON.stringify(packageJson.devDependencies ?? {});

  if (beforeDeps !== afterDeps || beforeDevDeps !== afterDevDeps) {
    failures.push("dependency drift detected");
  }
}

for (const pattern of [
  /\bCREATE\s+TABLE\b/i,
  /\bALTER\s+TABLE\b/i,
  /\bDROP\s+TABLE\b/i,
  /\bINSERT\s+INTO\b/i,
  /\bUPDATE\s+[a-z_]/i,
  /\bDELETE\s+FROM\b/i,
  /\bTRUNCATE\s+TABLE\b/i,
  /\bCREATE\s+POLICY\b/i,
  /\bALTER\s+POLICY\b/i,
  /\bservice_role\b/i,
  /sb_(secret|service)_[A-Za-z0-9_-]{12,}/,
  /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/,
  /Bearer\s+[A-Za-z0-9._-]{12,}/,
  /https?:\/\/(?!localhost|127\.0\.0\.1)/i,
  /<img\s/i,
  /backgroundImage\s*:/i,
  /url\(["']?https?:/i,
  /phatue|phả\s*tuệ|giad[aạ]iviet|gia\s*phả\s*đại\s*việt/i,
]) {
  rejectPattern(ui, pattern, pattern.toString());
}

if (failures.length > 0) {
  console.error("A-15A5 member profile/person detail Vietnamese heritage UI check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-15A5 member profile/person detail Vietnamese heritage UI check passed.");
