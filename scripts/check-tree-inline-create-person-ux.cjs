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
  "app/(admin)/admin/tree/edit/actions.ts",
  "app/(admin)/admin/tree/edit/page.tsx",
  "components/tree/family-node-card.tsx",
  "components/tree/family-tree-editor.tsx",
  "components/tree/tree-editor-side-panel.tsx",
  "components/tree/tree-editor-toolbar.tsx",
  "components/genealogy/admin-warning-list.tsx",
  "docs/PLAN_A06_A07_A08_TREE_POLISH_DEDUPE_READINESS_DATA_QUALITY_WARNINGS.md",
  "docs/PLAN_A09_AUTHENTICATED_TREE_EDITOR_BROWSER_SMOKE.md",
  "docs/PLAN_A10_MERGE_DEDUPE_TRANSACTION_AUDIT_DESIGN.md",
  "docs/PLAN_A04_A05_TREE_EDITOR_SMOKE_AND_DUPLICATE_SUGGESTION.md",
  "docs/PLAN_A03_TREE_INLINE_CREATE_PERSON_UX.md",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "package.json",
  "app/(admin)/admin/people/page.tsx",
  "app/(admin)/admin/relationships/page.tsx",
  "app/(admin)/admin/revisions/page.tsx",
  "app/(admin)/admin/system/status/page.tsx",
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
  "app/(admin)/admin/tree/page.tsx",
  "docs/PLAN_A14D_TREE_VIEWER_INTERACTION_UX.md",
  "scripts/check-a14d-tree-viewer-interaction-ux.cjs",
]);

const packageJson = readJson("package.json");
const sidePanel = readFile("components/tree/tree-editor-side-panel.tsx");
const editor = readFile("components/tree/family-tree-editor.tsx");
const page = readFile("app/(admin)/admin/tree/edit/page.tsx");
const actions = readFile("app/(admin)/admin/tree/edit/actions.ts");
const doc = readFile("docs/PLAN_A03_TREE_INLINE_CREATE_PERSON_UX.md");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "Tạo thành viên mới",
  "Chọn thành viên đã có",
  "Lưu và gắn quan hệ",
  "Người đang chọn",
  "Thêm người thân",
  "Quan hệ với người đang chọn",
  "Chọn quan hệ",
  "Họ và tên",
  "Chọn giới tính",
  "Năm sinh",
  "Năm mất",
  "Ghi chú ngắn",
  "Nhập họ và tên thành viên...",
  "Đang lưu thành viên...",
  "Bạn không có quyền thực hiện thao tác này.",
  "useFormStatus",
  "disabled={pending}",
]) {
  requireIncludes(sidePanel, token, `side panel token ${token}`);
}

for (const token of [
  "createPersonAndAttachFromTreeAction",
  "createPerson(",
  "addParentToFamily",
  "addChildToFamily",
  "createCoupleRelationship",
  "Đã tạo thành viên mới nhưng chưa gắn được quan hệ",
  "inline_person_created",
]) {
  requireIncludes(actions, token, `action token ${token}`);
}

for (const token of [
  "canCreatePeople",
  "createPersonAndAttachAction",
]) {
  requireIncludes(editor, token, `editor token ${token}`);
  requireIncludes(page, token, `page/editor wiring token ${token}`);
}

requireIncludes(
  page,
  "Đã thêm thành viên mới và gắn quan hệ vào cây gia phả.",
  "success message",
);

for (const token of [
  "Enter UUID",
  "Paste UUID",
  "Person UUID",
  "Related person UUID",
  "Nhập UUID",
  "Dán UUID",
  "UUID thành viên",
  "relationship id",
]) {
  rejectIncludes(sidePanel, token, `manual UUID/ID UI copy ${token}`);
}

for (const token of [
  "source_note",
  "service_role",
  "sb_secret_",
  "Bearer ",
  "COOKIE",
  "SESSION",
  "signedUrl",
  "signed_url",
  "raw SQL",
  "stack trace",
]) {
  rejectIncludes(sidePanel, token, `private/secret marker ${token}`);
}

for (const token of [
  "Status: `PASS_LOCAL_STATIC`",
  "Summary",
  "User problem",
  "Scope",
  "Existing create person flow reviewed",
  "UX before",
  "UX after",
  "Relationship types supported",
  "Create person then attach relationship behavior",
  "Internal UUID behavior",
  "Vietnamese UI copy result",
  "Privacy/permission result",
  "Deferred items",
  "Checker result",
  "Validation results",
  "Recommended next phase",
]) {
  requireIncludes(doc, token, `Plan A-03 doc token ${token}`);
}

for (const token of [
  "PLAN_A03_TREE_INLINE_CREATE_PERSON_UX.md",
  "Plan A-03",
]) {
  requireIncludes(index, token, `index token ${token}`);
  requireIncludes(workLog, token, `work log token ${token}`);
  requireIncludes(handoff, token, `handoff token ${token}`);
}

requireIncludes(
  decisionLog,
  "Decision 158 - Tree inline create person reuses existing services",
  "decision log Decision 158",
);

if (
  packageJson?.scripts?.["check:tree-inline-create-person-ux"] !==
  "node scripts/check-tree-inline-create-person-ux.cjs"
) {
  failures.push("package.json missing check:tree-inline-create-person-ux script");
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
    failures.push(`unexpected changed file for Plan A-03: ${file}`);
  }
}

if (failures.length > 0) {
  console.error("Tree inline create person UX check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Tree inline create person UX check passed.");
