const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

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

function rejectIncludes(content, token, label = token) {
  if (content.includes(token)) failures.push(`forbidden ${label}`);
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

const allowedChangedFiles = new Set([
  "app/(admin)/admin/people/[id]/page.tsx",
  "app/(admin)/admin/relationships/page.tsx",
  "components/relationships/couple-form.tsx",
  "components/relationships/relationship-form.tsx",
  "docs/UI_UX_VN_02_VIETNAMESE_CULTURAL_UI_UX_HARDENING.md",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "package.json",
  "scripts/check-vietnamese-cultural-ui-ux.cjs",
]);

const packageJson = readJson("package.json");
const relationshipForm = readFile("components/relationships/relationship-form.tsx");
const coupleForm = readFile("components/relationships/couple-form.tsx");
const relationshipsPage = readFile("app/(admin)/admin/relationships/page.tsx");
const treeSidePanel = readFile("components/tree/tree-editor-side-panel.tsx");
const adminShell = readFile("components/layout/admin-shell.tsx");
const doc = readFile("docs/UI_UX_VN_02_VIETNAMESE_CULTURAL_UI_UX_HARDENING.md");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "Chọn thành viên",
  "Chọn cha/mẹ",
  "Chọn con",
  "Chọn vợ/chồng/bạn đời",
  "Tạo quan hệ đôi",
  "Nội bộ gia đình",
  "Công khai",
  "Riêng tư",
  "Chưa có danh sách thành viên để chọn",
]) {
  requireIncludes(
    `${relationshipForm}\n${coupleForm}`,
    token,
    `relationship form Vietnamese token ${token}`,
  );
}

for (const token of [
  "Chọn gia đình và chọn thành viên theo tên",
  "mã nội bộ chỉ được dùng ở",
  "Bạn cần quyền xem thành viên",
]) {
  requireIncludes(relationshipsPage, token, `relationships page token ${token}`);
}

for (const token of [
  "RelatedPersonPicker",
  "Tìm thành viên",
  "ID nội bộ được dùng tự động sau khi chọn",
]) {
  requireIncludes(treeSidePanel, token, `tree editor picker token ${token}`);
}

for (const token of [
  "Gia phả Việt Nam",
  "Cây gia phả",
  "Quan hệ gia đình",
]) {
  requireIncludes(adminShell, token, `admin navigation Vietnamese token ${token}`);
}

for (const [relativePath, content] of [
  ["components/relationships/relationship-form.tsx", relationshipForm],
  ["components/relationships/couple-form.tsx", coupleForm],
  ["app/(admin)/admin/relationships/page.tsx", relationshipsPage],
]) {
  for (const token of [
    "Enter UUID",
    "Paste UUID",
    "Person ID",
    "Related person ID",
    "UUID thành viên",
    "nhập UUID",
    "copy ID",
    "ID thành viên",
    "font-mono text-sm",
  ]) {
    rejectIncludes(content, token, `${relativePath} visible/manual ID copy ${token}`);
  }
}

for (const [relativePath, content] of [
  ["components/relationships/relationship-form.tsx", relationshipForm],
  ["components/relationships/couple-form.tsx", coupleForm],
  ["components/tree/tree-editor-side-panel.tsx", treeSidePanel],
  ["app/(admin)/admin/relationships/page.tsx", relationshipsPage],
]) {
  for (const token of [
    "notes_private",
    "source_note",
    "service_role",
    "sb_secret_",
    "Bearer ",
    "COOKIE",
    "SESSION",
  ]) {
    rejectIncludes(content, token, `${relativePath} private/secret marker ${token}`);
  }
}

for (const token of [
  "Status: `PASS_LOCAL_STATIC`",
  "Summary",
  "Owner Requirements",
  "UI Text Hardening Result",
  "Vietnamese Style Direction",
  "Navigation/Menu Result",
  "Cây Gia Phả Priority Result",
  "Tree Viewer/Editor UX Result",
  "Form/Input/Dropdown Result",
  "Code/Internal Values Unchanged",
  "Privacy/Security Result",
  "Deferred Items",
  "Checker Result",
  "Validation Results",
  "Recommended Next Phase",
]) {
  requireIncludes(doc, token, `UI-UX-VN-02 doc token ${token}`);
}

for (const token of [
  "UI_UX_VN_02_VIETNAMESE_CULTURAL_UI_UX_HARDENING.md",
  "UI-UX-VN-02",
]) {
  requireIncludes(index, token, `index token ${token}`);
  requireIncludes(workLog, token, `work log token ${token}`);
  requireIncludes(handoff, token, `handoff token ${token}`);
}

requireIncludes(
  decisionLog,
  "Decision 157 - Vietnamese cultural UI favors names and kinship labels over manual IDs",
  "decision log UI-UX-VN-02 decision",
);

if (
  packageJson?.scripts?.["check:vietnamese-cultural-ui-ux"] !==
  "node scripts/check-vietnamese-cultural-ui-ux.cjs"
) {
  failures.push("package.json missing check:vietnamese-cultural-ui-ux script");
}

const packageHead = gitShowHead("package.json");
if (packageHead && packageJson) {
  const previousPackage = JSON.parse(packageHead);
  if (
    JSON.stringify(previousPackage.dependencies || {}) !==
    JSON.stringify(packageJson.dependencies || {})
  ) {
    failures.push("runtime dependencies changed");
  }
  if (
    JSON.stringify(previousPackage.devDependencies || {}) !==
    JSON.stringify(packageJson.devDependencies || {})
  ) {
    failures.push("devDependencies changed");
  }
}

const status = gitOutput(["status", "--short"]);
for (const line of status.split(/\r?\n/).filter(Boolean)) {
  const file = line.slice(3).trim().replaceAll("\\", "/");
  const lowerFile = file.toLowerCase();

  if (file === "PLANNING.MD") {
    failures.push("PLANNING.MD changed or staged");
  }
  if (lowerFile.endsWith(".sql")) {
    failures.push(`SQL file changed or added: ${file}`);
  }
  if (file.startsWith("db/migrations/")) {
    failures.push(`migration file changed or added: ${file}`);
  }
  if (
    file === "wrangler.toml" ||
    file.includes("open-next") ||
    file.includes("opennext")
  ) {
    failures.push(`Worker/OpenNext/Wrangler config drift: ${file}`);
  }
  if (file.startsWith("services/")) {
    failures.push(`Worker/service file changed or added: ${file}`);
  }
  if (file.startsWith(".github/workflows/")) {
    failures.push(`deploy workflow mutation: ${file}`);
  }
  if (!allowedChangedFiles.has(file)) {
    failures.push(`unexpected changed file for UI-UX-VN-02: ${file}`);
  }
}

if (failures.length > 0) {
  console.error("Vietnamese cultural UI/UX check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Vietnamese cultural UI/UX check passed.");
