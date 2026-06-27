const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const allowedChangedFiles = new Set([
  "app/(admin)/admin/people/page.tsx",
  "app/(admin)/admin/relationships/page.tsx",
  "app/(admin)/admin/revisions/page.tsx",
  "app/(admin)/admin/system/status/page.tsx",
  "app/(admin)/admin/tree/edit/actions.ts",
  "app/(public)/people/[slug]/page.tsx",
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
  "components/relationships/couple-form.tsx",
  "components/relationships/relationship-form.tsx",
  "components/relationships/relationship-summary.tsx",
  "components/tree/family-node-card.tsx",
  "components/tree/family-tree-empty-state.tsx",
  "components/tree/family-tree-error-state.tsx",
  "components/tree/family-tree-toolbar.tsx",
  "components/tree/family-tree-viewer.tsx",
  "components/tree/tree-editor-side-panel.tsx",
  "components/tree/tree-editor-toolbar.tsx",
  "components/ui/action-link.tsx",
  "components/ui/empty-state.tsx",
  "components/ui/page-header.tsx",
  "components/ui/section-card.tsx",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "docs/PLAN_A14_UI_UX_OVERHAUL.md",
  "docs/PLAN_A14A_RELATED_MEMBER_ADD_UX.md",
  "docs/PLAN_A14B_PUBLIC_TREE_HOME_UX.md",
  "package.json",
  "scripts/check-a14-ui-ux-overhaul.cjs",
  "scripts/check-a14a-related-member-add-ux.cjs",
  "scripts/check-a14b-public-tree-home-ux.cjs",
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
  "app/(admin)/admin/page.tsx",
  "components/ui/status-callout.tsx",
  "docs/PLAN_A14C_ADMIN_DASHBOARD_LAYOUT_UX.md",
  "scripts/check-a14c-admin-dashboard-layout-ux.cjs",
  "app/(admin)/admin/tree/page.tsx",
  "app/(admin)/admin/tree/edit/page.tsx",
  "components/tree/family-tree-editor.tsx",
  "docs/PLAN_A14D_TREE_VIEWER_INTERACTION_UX.md",
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

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

function rejectIncludes(content, token, label = token) {
  if (content.includes(token)) failures.push(`forbidden ${label}`);
}

const packageJson = readJson("package.json");
const doc = readFile("docs/PLAN_A14_UI_UX_OVERHAUL.md");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

const files = {
  adminShell: readFile("components/layout/admin-shell.tsx"),
  publicShell: readFile("components/layout/public-shell.tsx"),
  pageHeader: readFile("components/ui/page-header.tsx"),
  emptyState: readFile("components/ui/empty-state.tsx"),
  peoplePage: readFile("app/(admin)/admin/people/page.tsx"),
  peopleList: readFile("components/people/person-list.tsx"),
  peopleForm: readFile("components/people/person-form.tsx"),
  relationshipsPage: readFile("app/(admin)/admin/relationships/page.tsx"),
  relationshipForm: readFile("components/relationships/relationship-form.tsx"),
  relationshipSummary: readFile("components/relationships/relationship-summary.tsx"),
  coupleForm: readFile("components/relationships/couple-form.tsx"),
  treeToolbar: readFile("components/tree/tree-editor-toolbar.tsx"),
  treeSidePanel: readFile("components/tree/tree-editor-side-panel.tsx"),
  familyToolbar: readFile("components/tree/family-tree-toolbar.tsx"),
  importForm: readFile("components/imports/json-import-preview-form.tsx"),
  loginForm: readFile("components/auth/login-form.tsx"),
  loginPage: readFile("app/auth/login/page.tsx"),
  revisionsPage: readFile("app/(admin)/admin/revisions/page.tsx"),
  systemStatus: readFile("app/(admin)/admin/system/status/page.tsx"),
  publicHome: readFile("components/public/public-home.tsx"),
};

const combinedUi = Object.values(files).join("\n");

for (const token of [
  "Status: `PASS_LOCAL_STATIC`",
  "A-14A - UI/UX Audit",
  "A-14B - UI Design Direction",
  "A-14C - Layout / Navigation Polish",
  "A-14D - Tree Viewer / Tree Editor UX",
  "A-14E - Forms / Tables / Detail Pages Polish",
  "A-14F - Vietnamese Copy / Accessibility / Safety",
  "A-14G - Static Checker / UI Guard",
  "A-14H - Docs / Decision / Handoff",
  "A-14I - Validation",
  "A-14J - Commit boundary",
  "DB merge/dedupe vẫn chưa apply",
  "Runtime merge/dedupe vẫn đóng",
  "Permission runtime chưa đăng ký",
  "Backup gate vẫn chưa bị bypass",
  "Không deploy trong phase này",
]) {
  requireIncludes(doc, token, `A-14 doc token ${token}`);
}

for (const token of [
  "PLAN_A14_UI_UX_OVERHAUL.md",
  "A-14 Bundle - UI/UX Overhaul",
]) {
  requireIncludes(index, token, `index token ${token}`);
  requireIncludes(workLog, token, `work log token ${token}`);
  requireIncludes(handoff, token, `handoff token ${token}`);
}

requireIncludes(
  decisionLog,
  "Decision 168 - A-14 is UI/UX polish only",
  "Decision 168",
);
requireIncludes(
  `${doc}\n${handoff}\n${decisionLog}`,
  "BLOCKED_PENDING_OWNER_BACKUP_GATE_CONFIRMATION",
  "backup gate remains blocked",
);

for (const token of [
  "Tổng quan",
  "Cây gia phả",
  "An toàn / hệ thống",
  "Dòng họ / chi / đời",
  "Người dùng:",
  "Số quyền:",
  "Lọc danh sách",
  "Xóa bộ lọc",
  "Sửa hồ sơ",
  "Xem hồ sơ",
  "Thêm quan hệ mới",
  "Chưa có quan hệ cha/mẹ/con",
  "Gắn thành viên đã có",
  "Thêm vào cây",
  "Gợi ý tránh tạo trùng",
  "Không thể gửi magic link lúc này",
  "Mã kiểm tra",
  "Vị trí trong file",
  "Nội dung cần xử lý",
  "Chưa có bản ghi lịch sử phù hợp",
  "Trạng thái hệ thống",
  "Vào quản trị",
]) {
  requireIncludes(combinedUi, token, `Vietnamese UI token ${token}`);
}

for (const token of [
  "mergePerson",
  "dedupePerson",
  "people.merge.execute",
  "people.merge.rollback",
  "APPROVE_A13_MERGE_DEDUPE_DB_SCHEMA_VERIFIED",
  "sb_secret_",
  "eyJhbGci",
  "Bearer ",
]) {
  rejectIncludes(combinedUi, token, `forbidden UI/runtime token ${token}`);
}

for (const token of [
  "notes_private",
  "source_note",
  "source_notes",
  "private_notes",
]) {
  const publicUi = [
    readFile("components/public/public-home.tsx"),
    readFile("components/public/public-tree-shell.tsx"),
    readFile("components/public/public-person-profile.tsx"),
    readFile("app/(public)/page.tsx"),
    readFile("app/(public)/tree/page.tsx"),
    readFile("app/(public)/people/[slug]/page.tsx"),
  ].join("\n");
  rejectIncludes(publicUi, token, `public private/source note token ${token}`);
}

if (
  packageJson?.scripts?.["check:a14-ui-ux-overhaul"] !==
  "node scripts/check-a14-ui-ux-overhaul.cjs"
) {
  failures.push("package.json missing check:a14-ui-ux-overhaul script");
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
    failures.push("dev dependencies changed");
  }
}

const runtimeDiff = gitOutput(["diff", "--", "app", "components", "lib", "server"]);
for (const token of [
  "mergePerson",
  "dedupePerson",
  "deletePerson",
  "deleteRelationship",
  "supabase.from(\"people\").delete",
  "supabase.from('people').delete",
]) {
  rejectIncludes(runtimeDiff, token, `runtime merge/delete mutation ${token}`);
}

const status = gitOutput(["status", "--short", "--untracked-files=all"]);
for (const line of status.split(/\r?\n/).filter(Boolean)) {
  const file = line.slice(3).trim().replaceAll("\\", "/");
  const lowerFile = file.toLowerCase();

  if (file === "PLANNING.MD") failures.push("PLANNING.MD changed or staged");
  if (lowerFile.endsWith(".sql")) failures.push(`SQL file changed or added: ${file}`);
  if (file.startsWith("db/migrations/")) {
    failures.push(`migration file changed or added: ${file}`);
  }
  if (
    file === "wrangler.toml" ||
    file.includes("open-next") ||
    file.includes("opennext") ||
    file === "next.config.ts" ||
    file.startsWith("services/")
  ) {
    failures.push(`Worker/OpenNext/Wrangler/service drift: ${file}`);
  }
  if (file.startsWith(".github/workflows/")) {
    failures.push(`deploy workflow mutation: ${file}`);
  }
  if (!allowedChangedFiles.has(file)) {
    failures.push(`unexpected changed file for A-14: ${file}`);
  }
}

if (failures.length > 0) {
  console.error("A-14 UI/UX overhaul check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-14 UI/UX overhaul check passed.");
