const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];
const requiredEnvNames = [
  "GIA_PHA_AUTH_BROWSER_SMOKE",
  "GIA_PHA_SMOKE_BASE_URL",
  "GIA_PHA_AUTH_STORAGE_STATE_PATH",
];

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
  "docs/PLAN_A09_AUTHENTICATED_TREE_EDITOR_BROWSER_SMOKE.md",
  "docs/PLAN_A10_MERGE_DEDUPE_TRANSACTION_AUDIT_DESIGN.md",
  "docs/PLAN_A11_MERGE_DEDUPE_SCHEMA_CANDIDATE_READINESS.md",
  "docs/PLAN_A12_MERGE_DEDUPE_REAL_MIGRATION_APPLY_PLAN.md",
  "docs/PLAN_A13_MERGE_DEDUPE_DB_APPLY_VERIFICATION.md",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "package.json",
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
  "docs/PLAN_A14_UI_UX_OVERHAUL.md",
  "docs/PLAN_A14A_RELATED_MEMBER_ADD_UX.md",
  "docs/PLAN_A14B_PUBLIC_TREE_HOME_UX.md",
  "scripts/check-a14-ui-ux-overhaul.cjs",
  "scripts/check-a14a-related-member-add-ux.cjs",
  "scripts/check-a14b-public-tree-home-ux.cjs",
  "scripts/check-merge-dedupe-transaction-audit-design.cjs",
  "scripts/check-merge-dedupe-schema-candidate-readiness.cjs",
  "scripts/check-merge-dedupe-real-migration-readiness.cjs",
  "scripts/merge-dedupe-schema-candidate.sql.draft",
  "db/migrations/20260622_0009_merge_dedupe_schema_candidate.sql",
  "db/checks/check_merge_dedupe_schema.sql",
  "scripts/check-tree-editor-auth-browser-smoke.cjs",
  "scripts/check-tree-polish-dedupe-readiness-data-quality.cjs",
  "scripts/check-tree-duplicate-suggestion-ux.cjs",
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
  "scripts/check-vietnamese-genealogy-schema-candidate.cjs",
  "scripts/check-vietnamese-genealogy-first-migration-scope.cjs",
  "scripts/check-vietnamese-genealogy-real-migration-file.cjs",
  "app/(admin)/admin/page.tsx",
  "components/ui/status-callout.tsx",
  "docs/PLAN_A14C_ADMIN_DASHBOARD_LAYOUT_UX.md",
  "scripts/check-a14c-admin-dashboard-layout-ux.cjs",
]);

const packageJson = readJson("package.json");
const doc = readFile("docs/PLAN_A09_AUTHENTICATED_TREE_EDITOR_BROWSER_SMOKE.md");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");
const sidePanel = readFile("components/tree/tree-editor-side-panel.tsx");
const toolbar = readFile("components/tree/tree-editor-toolbar.tsx");
const nodeCard = readFile("components/tree/family-node-card.tsx");
const envReady =
  process.env.GIA_PHA_AUTH_BROWSER_SMOKE === "1" &&
  requiredEnvNames.every((name) => Boolean(process.env[name]));

for (const token of [
  "Summary",
  "Smoke target",
  "Auth/session safety rule",
  "Explicit env/session requirements",
  "Smoke result",
  "Safe-skip reason",
  "Permission result",
  "Tree canvas result",
  "Toolbar result",
  "Add-relative panel result",
  "Existing member attach result",
  "Create new person attach result",
  "Duplicate suggestion result",
  "Data quality warning result",
  "Vietnamese UI result",
  "Privacy/security result",
  "Bugs found/fixed",
  "Deferred items",
  "Checker result",
  "Validation results",
  "Recommended next phase",
  "A09_ATTACH_EXISTING_MUTATION_SKIPPED_MISSING_EXPLICIT_SAFE_DATASET",
  "A09_CREATE_PERSON_MUTATION_SKIPPED_MISSING_EXPLICIT_SAFE_DATASET",
]) {
  requireIncludes(doc, token, `A-09 doc token ${token}`);
}

if (!envReady) {
  requireIncludes(
    doc,
    "Status: `A09_AUTH_BROWSER_SMOKE_SKIPPED_MISSING_EXPLICIT_AUTH_SESSION`",
    "safe-skip status",
  );
  requireIncludes(
    doc,
    "A09_AUTH_BROWSER_SMOKE_SKIPPED_MISSING_EXPLICIT_AUTH_SESSION",
    "safe-skip result",
  );
  rejectIncludes(
    doc,
    "Status: `A09_AUTH_BROWSER_SMOKE_PASS`",
    "PASS claim without explicit auth session",
  );
}

for (const token of [
  "Thêm người thân",
  "Chọn thành viên đã có",
  "Tạo thành viên mới",
  "Lưu và gắn quan hệ",
  "Đang lưu thành viên...",
  "Có thể đã tồn tại thành viên tương tự",
  "Dùng thành viên này để gắn quan hệ",
  "Vẫn tạo thành viên mới",
  "Gợi ý hoàn thiện dữ liệu",
  "Đây chỉ là gợi ý kiểm tra",
  "disabled={pending}",
]) {
  requireIncludes(sidePanel, token, `Tree Editor smoke copy/guard ${token}`);
}

for (const token of [
  "Vừa màn hình",
  "Phóng to",
  "Thu nhỏ",
  "Sắp xếp lại cây",
]) {
  requireIncludes(toolbar, token, `toolbar token ${token}`);
}

requireIncludes(nodeCard, "Người đang chọn", "selected person state");

for (const token of [
  "Fit view",
  "Zoom in",
  "Zoom out",
  "Reset layout",
  "Use existing",
  "Create anyway",
  "Person UUID",
  "Related person UUID",
  "Enter UUID",
  "Paste UUID",
]) {
  rejectIncludes(
    `${sidePanel}\n${toolbar}\n${nodeCard}`,
    token,
    `forbidden user-facing text ${token}`,
  );
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
  rejectIncludes(
    `${sidePanel}\n${toolbar}\n${nodeCard}`,
    token,
    `private/secret marker ${token}`,
  );
}

for (const token of [
  "PLAN_A09_AUTHENTICATED_TREE_EDITOR_BROWSER_SMOKE.md",
  "Plan A-09",
]) {
  requireIncludes(index, token, `index token ${token}`);
  requireIncludes(workLog, token, `work log token ${token}`);
  requireIncludes(handoff, token, `handoff token ${token}`);
}

if (
  packageJson?.scripts?.["check:tree-editor-auth-browser-smoke"] !==
  "node scripts/check-tree-editor-auth-browser-smoke.cjs"
) {
  failures.push("package.json missing check:tree-editor-auth-browser-smoke script");
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

const status = gitOutput(["status", "--short", "--untracked-files=all"]);
for (const line of status.split(/\r?\n/).filter(Boolean)) {
  const file = line.slice(3).trim().replaceAll("\\", "/");
  const lowerFile = file.toLowerCase();
  const isApprovedA12SqlArtifact =
    file === "db/migrations/20260622_0009_merge_dedupe_schema_candidate.sql" ||
    file === "db/checks/check_merge_dedupe_schema.sql";

  if (file === "PLANNING.MD") failures.push("PLANNING.MD changed or staged");
  if (lowerFile.endsWith(".sql") && !isApprovedA12SqlArtifact) {
    failures.push(`SQL file changed: ${file}`);
  }
  if (file.startsWith("db/migrations/") && !isApprovedA12SqlArtifact) {
    failures.push(`migration file changed: ${file}`);
  }
  if (
    file === "wrangler.toml" ||
    file.includes("open-next") ||
    file.includes("opennext")
  ) {
    failures.push(`Worker/OpenNext/Wrangler config drift: ${file}`);
  }
  if (file.startsWith("services/")) {
    failures.push(`Worker/service file changed: ${file}`);
  }
  if (file.startsWith(".github/workflows/")) {
    failures.push(`deploy workflow mutation: ${file}`);
  }
  if (!allowedChangedFiles.has(file)) {
    failures.push(`unexpected changed file for Plan A-09: ${file}`);
  }
}

if (failures.length > 0) {
  console.error("Tree Editor authenticated browser smoke check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

if (envReady) {
  console.log(
    "A09_AUTH_BROWSER_SMOKE_READY_EXPLICIT_SESSION - browser execution evidence is still required before PASS.",
  );
} else {
  console.log(
    "A09_AUTH_BROWSER_SMOKE_SKIPPED_MISSING_EXPLICIT_AUTH_SESSION",
  );
}
