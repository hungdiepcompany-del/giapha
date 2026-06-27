const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const allowedChangedFiles = new Set([
  "app/(admin)/admin/page.tsx",
  "app/(admin)/admin/people/page.tsx",
  "components/layout/admin-shell.tsx",
  "components/people/person-form.tsx",
  "components/people/person-list.tsx",
  "components/ui/action-link.tsx",
  "components/ui/empty-state.tsx",
  "components/ui/page-header.tsx",
  "components/ui/section-card.tsx",
  "components/ui/status-callout.tsx",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "docs/PLAN_A14C_ADMIN_DASHBOARD_LAYOUT_UX.md",
  "package.json",
  "scripts/check-a14-ui-ux-overhaul.cjs",
  "scripts/check-a14a-related-member-add-ux.cjs",
  "scripts/check-a14b-public-tree-home-ux.cjs",
  "scripts/check-a14c-admin-dashboard-layout-ux.cjs",
  "scripts/check-merge-dedupe-real-migration-readiness.cjs",
  "scripts/check-merge-dedupe-schema-candidate-readiness.cjs",
  "scripts/check-merge-dedupe-transaction-audit-design.cjs",
  "scripts/check-tree-duplicate-suggestion-ux.cjs",
  "scripts/check-tree-editor-auth-browser-smoke.cjs",
  "scripts/check-tree-inline-create-person-ux.cjs",
  "scripts/check-tree-polish-dedupe-readiness-data-quality.cjs",
  "scripts/check-tree-relationship-picker-ux.cjs",
  "scripts/check-vietnamese-cultural-ui-ux.cjs",
  "scripts/check-vietnamese-ui-copy.cjs",
  "app/(admin)/admin/tree/page.tsx",
  "app/(admin)/admin/tree/edit/page.tsx",
  "components/public/public-tree-shell.tsx",
  "components/tree/family-node-card.tsx",
  "components/tree/family-tree-editor.tsx",
  "components/tree/family-tree-empty-state.tsx",
  "components/tree/family-tree-error-state.tsx",
  "components/tree/family-tree-toolbar.tsx",
  "components/tree/family-tree-viewer.tsx",
  "components/tree/tree-editor-side-panel.tsx",
  "components/tree/tree-editor-toolbar.tsx",
  "docs/PLAN_A14D_TREE_VIEWER_INTERACTION_UX.md",
  "scripts/check-a14e-mobile-ux-sweep.cjs",
  "docs/PLAN_A14E_MOBILE_UX_SWEEP.md",
  "scripts/check-a14f-browser-visual-smoke-readiness.cjs",
  "docs/PLAN_A14F_BROWSER_VISUAL_SMOKE_READINESS.md",
  "docs/PLAN_A14G_PUBLIC_BROWSER_VISUAL_SMOKE.md",
  "scripts/check-a14g-public-browser-visual-smoke.cjs",
  "components/public/public-person-profile.tsx",
  "components/public/public-home.tsx",
  "components/layout/public-shell.tsx",
  "scripts/check-a14d-tree-viewer-interaction-ux.cjs",
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

const doc = readFile("docs/PLAN_A14C_ADMIN_DASHBOARD_LAYOUT_UX.md");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = readJson("package.json");
const adminShell = readFile("components/layout/admin-shell.tsx");
const dashboard = readFile("app/(admin)/admin/page.tsx");
const peoplePage = readFile("app/(admin)/admin/people/page.tsx");
const personList = readFile("components/people/person-list.tsx");
const personForm = readFile("components/people/person-form.tsx");
const actionLink = readFile("components/ui/action-link.tsx");
const sectionCard = readFile("components/ui/section-card.tsx");
const emptyState = readFile("components/ui/empty-state.tsx");
const statusCallout = readFile("components/ui/status-callout.tsx");

for (const heading of [
  "## A-14C1 - Audit Admin UX",
  "## A-14C2 - Admin Visual System Alignment",
  "## A-14C3 - Admin Sidebar / Navigation Polish",
  "## A-14C4 - Admin Dashboard Polish",
  "## A-14C5 - Tables / Lists UX Polish",
  "## A-14C6 - Forms / Detail Pages Polish",
  "## A-14C7 - Admin Safety / Permission UX",
  "## A-14C8 - Vietnamese Copy / Accessibility Sweep",
  "## A-14C9 - Checker",
  "## A-14C10 - Docs / Decision / Handoff",
  "## A-14C11 - Validation",
  "## A-14C12 - Commit",
]) {
  requireIncludes(doc, heading, `A-14C doc section ${heading}`);
}

for (const token of [
  "classic modern genealogy",
  "cổ điển pha hiện đại",
  "warm paper",
  "stone text",
  "muted rust",
  "deep green",
  "Không schema change",
  "Không DB apply",
  "Không check SQL trên DB",
  "Không merge/dedupe runtime",
  "Không permission runtime",
  "Không deploy",
  "Backup gate",
  "BLOCKED_PENDING_OWNER_BACKUP_GATE_CONFIRMATION",
]) {
  requireIncludes(doc, token, `A-14C doc token ${token}`);
}

for (const token of [
  "Tổng quan",
  "Thành viên / hồ sơ",
  "Cây gia phả",
  "Nhập / xuất dữ liệu",
  "An toàn / hệ thống",
  "Sổ gia phả nội bộ",
  "Điều hướng quản trị",
]) {
  requireIncludes(adminShell, token, `admin navigation token ${token}`);
}

for (const token of [
  "Sổ quản trị gia phả",
  "Việc thường làm",
  "Thêm thành viên",
  "Mở Tree Editor",
  "Xem cây công khai",
  "Xuất dữ liệu",
  "Merge/dedupe",
  "Đang đóng",
  "Backup gate",
  "Cần evidence",
  "không bật merge/dedupe runtime",
]) {
  requireIncludes(dashboard, token, `admin dashboard token ${token}`);
}

for (const token of [
  "Hồ sơ thành viên",
  "Lọc danh sách",
  "Nhập họ tên hoặc tên thường gọi",
  "Không thể hoàn tất thao tác",
]) {
  requireIncludes(peoplePage, token, `people admin token ${token}`);
}

for (const token of [
  "Chưa có thành viên",
  "Thêm thành viên đầu tiên",
  "Xem hồ sơ",
  "Sửa hồ sơ",
  "Xóa mềm",
  "Trang công khai sẽ chỉ hiển thị dữ liệu được phép",
]) {
  requireIncludes(personList, token, `person list token ${token}`);
}

for (const [content, token, label] of [
  [actionLink, "rounded-md", "rounded action link"],
  [sectionCard, "rounded-md", "rounded section card"],
  [emptyState, "rounded-md", "rounded empty state"],
  [statusCallout, "rounded-md", "rounded status callout"],
  [personForm, "focus:border-[#245744]", "admin form green focus"],
]) {
  requireIncludes(content, token, label);
}

for (const [content, token, label] of [
  [index, "PLAN_A14C_ADMIN_DASHBOARD_LAYOUT_UX.md", "index entry"],
  [workLog, "A-14C - Admin Dashboard / Layout UX Polish", "work log entry"],
  [handoff, "A-14C - Admin Dashboard / Layout UX Polish", "handoff entry"],
  [decisionLog, "Decision 171 - A-14C admin UX polish is UI-only", "Decision 171"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a14c-admin-dashboard-layout-ux"] !==
  "node scripts/check-a14c-admin-dashboard-layout-ux.cjs"
) {
  failures.push("package.json missing check:a14c-admin-dashboard-layout-ux script");
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

for (const [content, label] of [
  [adminShell, "admin shell"],
  [dashboard, "dashboard"],
  [peoplePage, "people page"],
  [personList, "person list"],
]) {
  for (const token of [
    "notes_private",
    "source_note",
    "source_notes",
    "private_notes",
    "service_role",
    "sb_secret_",
    "Bearer ",
  ]) {
    rejectIncludes(content, token, `${label} private/secret token ${token}`);
  }
}

const runtimeDiff = gitOutput([
  "diff",
  "HEAD",
  "--",
  "app",
  "components",
  "lib",
  "server",
  "services",
]);
for (const [label, pattern] of [
  ["mergePersons", /\bmergePersons\b/],
  ["executeMerge", /\bexecuteMerge\b/],
  ["rollbackMerge", /\brollbackMerge\b/],
  ["dedupePersons", /\bdedupePersons\b/],
  ["deleteDuplicatePerson", /\bdeleteDuplicatePerson\b/],
  ["merge route", /\/api\/[^\s]+\/merge\b/],
  ["dedupe route", /\/api\/[^\s]+\/dedupe\b/],
  ["permission runtime registration", /people\.merge\.execute/],
]) {
  if (pattern.test(runtimeDiff)) failures.push(`forbidden runtime pattern ${label}`);
}

const status = gitOutput(["status", "--short", "--untracked-files=all"]);
for (const line of status.split(/\r?\n/).filter(Boolean)) {
  const file = line.slice(3).trim().replaceAll("\\", "/");
  const lowerFile = file.toLowerCase();

  if (file === "PLANNING.MD") failures.push("PLANNING.MD changed or staged");
  if (lowerFile.endsWith(".sql")) failures.push(`SQL file changed: ${file}`);
  if (file.startsWith("db/")) failures.push(`db file changed: ${file}`);
  if (
    file === "wrangler.toml" ||
    file.includes("open-next") ||
    file.includes("opennext") ||
    file.startsWith("services/") ||
    file.startsWith(".github/workflows/")
  ) {
    failures.push(`Worker/OpenNext/Wrangler/deploy drift: ${file}`);
  }
  if (!allowedChangedFiles.has(file)) {
    failures.push(`unexpected changed file for A-14C: ${file}`);
  }
}

if (failures.length > 0) {
  console.error("A-14C admin dashboard/layout UX check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-14C admin dashboard/layout UX check passed.");
