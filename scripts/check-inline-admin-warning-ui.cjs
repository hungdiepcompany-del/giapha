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

const packageJson = readJson("package.json");
const doc = readFile("docs/121A_INLINE_ADMIN_WARNING_UI.md");
const badge = readFile("components/genealogy/admin-warning-badge.tsx");
const list = readFile("components/genealogy/admin-warning-list.tsx");
const rules = readFile("lib/family/inline-warning-rules.ts");
const types = readFile("lib/family/inline-warning-types.ts");
const peoplePage = readFile("app/(admin)/admin/people/[id]/page.tsx");
const genealogyPage = readFile("app/(admin)/admin/genealogy/page.tsx");
const membershipsPage = readFile("app/(admin)/admin/genealogy/memberships/page.tsx");
const treePanel = readFile("components/tree/tree-editor-side-panel.tsx");
const publicRouteFiles = gitOutput(["ls-files", "app/(public)", "components/public"])
  .split(/\r?\n/)
  .filter(Boolean);

for (const token of [
  "Status: `COMPLETED_LOCAL_STATIC_VALIDATED`",
  "Owner approval: `OPTION_D_INLINE_ADMIN_WARNING_UI_ONLY`",
  "Already-Loaded Data Boundary",
  "Admin People Warning Surface",
  "Admin Genealogy Warning Surface",
  "Tree Editor Warning Surface",
  "Privacy And Permission Behavior",
  "No persistent warning table",
  "No full-tree scan",
  "No migration",
  "No DB apply",
  "No Worker created",
  "No OpenNext/Wrangler config change",
  "No runtime dependency added",
]) {
  requireIncludes(doc, token, `Phase 121A doc token ${token}`);
}

for (const token of ["Thông tin", "Cảnh báo", "Cần xử lý", "aria-label"]) {
  requireIncludes(badge, token, `warning badge token ${token}`);
}

for (const token of [
  "Việc tiếp theo:",
  "không có nghĩa là toàn bộ cây đã được quét",
  "chỉ dùng dữ liệu đã tải",
  "không lưu",
  "trạng thái",
  "không hiển thị trên public",
]) {
  requireIncludes(list, token, `warning list token ${token}`);
}

for (const token of [
  "PERSON_IDENTITY_INCOMPLETE",
  "PERSON_DATE_ORDER_INVALID",
  "PRIVACY_VISIBILITY_CONFLICT",
  "BRANCH_PRIMARY_MEMBERSHIP_MULTIPLE",
  "LINEAGE_ASSIGNMENT_INCOMPLETE",
  "LINEAGE_GENERATION_CONFLICT",
  "TREE_LINEAGE_DISPLAY_INCOMPLETE",
  "getPersonInlineWarnings",
  "getLineageDashboardInlineWarnings",
  "getTreeNodeInlineWarnings",
]) {
  requireIncludes(rules, token, `inline warning rule ${token}`);
}

for (const token of ["info", "warning", "blocking"]) {
  requireIncludes(types, token, `warning severity ${token}`);
}

for (const [content, token, label] of [
  [peoplePage, "getPersonInlineWarnings", "people page integration"],
  [genealogyPage, "getLineageDashboardInlineWarnings", "genealogy page integration"],
  [membershipsPage, "getLineageDashboardInlineWarnings", "membership page integration"],
  [treePanel, "getTreeNodeInlineWarnings", "tree editor integration"],
]) {
  requireIncludes(content, token, label);
  requireIncludes(content, "AdminWarningList", `${label} component`);
}

if (
  packageJson?.scripts?.["check:inline-admin-warning-ui"] !==
  "node scripts/check-inline-admin-warning-ui.cjs"
) {
  failures.push("package.json missing check:inline-admin-warning-ui script");
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

const allowedRuntimeFiles = new Set([
  "app/(admin)/admin/people/[id]/page.tsx",
  "app/(admin)/admin/genealogy/page.tsx",
  "app/(admin)/admin/genealogy/memberships/page.tsx",
  "components/tree/tree-editor-side-panel.tsx",
  "components/genealogy/admin-warning-badge.tsx",
  "components/genealogy/admin-warning-list.tsx",
  "lib/family/inline-warning-types.ts",
  "lib/family/inline-warning-rules.ts",
]);

const status = gitOutput(["status", "--short"]);
const changedFiles = status
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => line.slice(3).trim().replaceAll("\\", "/"));

for (const file of changedFiles) {
  if (file.toLowerCase().endsWith(".sql")) {
    failures.push(`SQL file changed or added: ${file}`);
  }
  if (
    /^(app|components|lib|server)\//.test(file) &&
    !allowedRuntimeFiles.has(file)
  ) {
    failures.push(`runtime file outside Phase 121A scope: ${file}`);
  }
}

for (const file of allowedRuntimeFiles) {
  const content = readFile(file);
  for (const token of [
    ".from(",
    "fetch(",
    "createClient",
    "source_note",
    "notes_private",
    "person_media",
    "data_quality_warnings",
    "quality_warnings",
    "createBucket",
    ".storage.from(",
    "generateThumbnail",
    "fullTreeScan",
    "runQualityScan",
  ]) {
    rejectIncludes(content, token, `${token} in ${file}`);
  }
}

for (const file of publicRouteFiles) {
  const content = readFile(file);
  for (const token of [
    "AdminWarningList",
    "AdminWarningBadge",
    "inline-warning-rules",
    "inline-warning-types",
    "getPersonInlineWarnings",
    "getLineageDashboardInlineWarnings",
    "getTreeNodeInlineWarnings",
    "data_quality_warnings",
    "quality_warnings",
  ]) {
    rejectIncludes(content, token, `${token} in public route file ${file}`);
  }
}

for (const pathspec of [
  "db/migrations",
  "services",
  "wrangler.toml",
  "open-next.config.ts",
  "next.config.ts",
  ".github/workflows",
  "app/(public)",
  "PLANNING.MD",
]) {
  const pathStatus = gitOutput(["status", "--short", "--", pathspec]);
  if (pathStatus.trim()) failures.push(`${pathspec} touched: ${pathStatus.trim()}`);
}

if (failures.length > 0) {
  console.error("Inline admin warning UI check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Inline admin warning UI check passed.");
