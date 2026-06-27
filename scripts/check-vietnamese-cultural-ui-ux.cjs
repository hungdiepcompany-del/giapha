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
  "app/(admin)/admin/tree/edit/page.tsx",
  "app/(admin)/admin/people/[id]/page.tsx",
  "app/(admin)/admin/relationships/page.tsx",
  "app/(public)/people/[slug]/page.tsx",
  "components/relationships/couple-form.tsx",
  "components/relationships/relationship-form.tsx",
  "components/tree/family-node-card.tsx",
  "components/tree/family-tree-editor.tsx",
  "components/tree/tree-editor-side-panel.tsx",
  "components/tree/tree-editor-toolbar.tsx",
  "components/genealogy/admin-warning-list.tsx",
  "docs/PLAN_A06_A07_A08_TREE_POLISH_DEDUPE_READINESS_DATA_QUALITY_WARNINGS.md",
  "docs/PLAN_A09_AUTHENTICATED_TREE_EDITOR_BROWSER_SMOKE.md",
  "docs/PLAN_A10_MERGE_DEDUPE_TRANSACTION_AUDIT_DESIGN.md",
  "docs/PLAN_A04_A05_TREE_EDITOR_SMOKE_AND_DUPLICATE_SUGGESTION.md",
  "docs/UI_UX_VN_02_VIETNAMESE_CULTURAL_UI_UX_HARDENING.md",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "package.json",
  "app/(admin)/admin/people/page.tsx",
  "app/(admin)/admin/revisions/page.tsx",
  "app/(admin)/admin/system/status/page.tsx",
  "app/(admin)/admin/tree/edit/actions.ts",
  "app/auth/login/page.tsx",
  "app/globals.css",
  "components/auth/login-form.tsx",
  "components/imports/json-import-preview-form.tsx",
  "components/layout/admin-shell.tsx",
  "components/layout/public-shell.tsx",
  "components/people/person-form.tsx",
  "components/people/person-list.tsx",
  "components/public/public-home.tsx",
  "components/public/public-person-profile.tsx",
  "components/public/public-tree-shell.tsx",
  "components/relationships/relationship-summary.tsx",
  "components/tree/family-tree-toolbar.tsx",
  "components/tree/family-tree-empty-state.tsx",
  "components/tree/family-tree-error-state.tsx",
  "components/tree/family-tree-viewer.tsx",
  "components/ui/action-link.tsx",
  "components/ui/empty-state.tsx",
  "components/ui/page-header.tsx",
  "components/ui/section-card.tsx",
  "docs/PLAN_A14_UI_UX_OVERHAUL.md",
  "docs/PLAN_A14A_RELATED_MEMBER_ADD_UX.md",
  "docs/PLAN_A14B_PUBLIC_TREE_HOME_UX.md",
  "scripts/check-a14-ui-ux-overhaul.cjs",
  "scripts/check-a14a-related-member-add-ux.cjs",
  "scripts/check-a14b-public-tree-home-ux.cjs",
  "scripts/check-merge-dedupe-transaction-audit-design.cjs",
  "scripts/check-merge-dedupe-schema-candidate-readiness.cjs",
  "scripts/check-merge-dedupe-real-migration-readiness.cjs",
  "scripts/check-tree-duplicate-suggestion-ux.cjs",
  "scripts/check-tree-polish-dedupe-readiness-data-quality.cjs",
  "scripts/check-tree-editor-auth-browser-smoke.cjs",
  "scripts/check-tree-inline-create-person-ux.cjs",
  "scripts/check-tree-relationship-picker-ux.cjs",
  "scripts/check-vietnamese-cultural-ui-ux.cjs",
  "scripts/check-vietnamese-ui-copy.cjs",
  "scripts/check-authenticated-smoke-result.cjs",
  "scripts/check-export-import-final-readiness.cjs",
  "scripts/check-inline-admin-warning-ui.cjs",
  "scripts/check-post-runtime-ui-deploy-readiness.cjs",
  "scripts/check-production-monitoring-auth-smoke-prep.cjs",
  "scripts/check-routine-production-monitoring-snapshot.cjs",
  "app/(admin)/admin/page.tsx",
  "components/ui/status-callout.tsx",
  "docs/PLAN_A14C_ADMIN_DASHBOARD_LAYOUT_UX.md",
  "scripts/check-a14c-admin-dashboard-layout-ux.cjs",
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
  "Chọn thành viên đã có",
  "Tạo thành viên mới",
  "Lưu và gắn quan hệ",
]) {
  requireIncludes(treeSidePanel, token, `tree editor picker token ${token}`);
}

for (const token of [
  "Dòng họ / chi / đời",
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
