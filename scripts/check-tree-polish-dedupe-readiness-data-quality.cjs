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
  "components/tree/family-node-card.tsx",
  "components/tree/family-tree-editor.tsx",
  "components/tree/tree-editor-side-panel.tsx",
  "components/tree/tree-editor-toolbar.tsx",
  "components/genealogy/admin-warning-list.tsx",
  "docs/PLAN_A06_A07_A08_TREE_POLISH_DEDUPE_READINESS_DATA_QUALITY_WARNINGS.md",
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
  "scripts/merge-dedupe-schema-candidate.sql.draft",
  "db/migrations/20260622_0009_merge_dedupe_schema_candidate.sql",
  "db/checks/check_merge_dedupe_schema.sql",
  "scripts/check-tree-polish-dedupe-readiness-data-quality.cjs",
  "scripts/check-tree-editor-auth-browser-smoke.cjs",
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
  "app/(admin)/admin/tree/page.tsx",
  "app/(admin)/admin/tree/edit/page.tsx",
  "docs/PLAN_A14D_TREE_VIEWER_INTERACTION_UX.md",
  "scripts/check-a14d-tree-viewer-interaction-ux.cjs",
]);

const packageJson = readJson("package.json");
const nodeCard = readFile("components/tree/family-node-card.tsx");
const editor = readFile("components/tree/family-tree-editor.tsx");
const toolbar = readFile("components/tree/tree-editor-toolbar.tsx");
const sidePanel = readFile("components/tree/tree-editor-side-panel.tsx");
const doc = readFile(
  "docs/PLAN_A06_A07_A08_TREE_POLISH_DEDUPE_READINESS_DATA_QUALITY_WARNINGS.md",
);
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "Đang chọn",
  "Chưa rõ năm sinh",
  "Chưa rõ năm mất",
  "Đời thứ",
  "Chi nhánh:",
  "Gia đình",
]) {
  requireIncludes(nodeCard, token, `tree node/card copy ${token}`);
}

for (const token of [
  "Vừa màn hình",
  "Phóng to",
  "Thu nhỏ",
  "Đưa cây về giữa",
  "Lưu bố cục",
  "Khôi phục bố cục tự động",
]) {
  requireIncludes(toolbar, token, `tree toolbar copy ${token}`);
}

for (const token of [
  "onZoomIn",
  "onZoomOut",
  "zoomIn",
  "zoomOut",
  "2xl:grid-cols-[minmax(0,1fr)_400px]",
  "h-[760px]",
]) {
  requireIncludes(`${toolbar}\n${editor}`, token, `tree polish behavior ${token}`);
}

for (const token of [
  "Gợi ý hoàn thiện dữ liệu",
  "Đây chỉ là gợi ý kiểm tra, hệ thống không tự thay đổi dữ liệu.",
  "Có thể đã tồn tại thành viên tương tự",
  "Thành viên này chưa có năm sinh",
  "Thành viên này chưa có cha/mẹ trong cây",
  "getTreeDataQualitySuggestions",
  "Thêm người thân",
]) {
  requireIncludes(sidePanel, token, `data quality UI ${token}`);
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
  "storage key",
  "raw SQL",
  "stack trace",
]) {
  rejectIncludes(
    `${nodeCard}\n${toolbar}\n${sidePanel}`,
    token,
    `private/secret marker ${token}`,
  );
}

for (const token of [
  ">Merge<",
  ">Duplicate<",
  ">Dedupe<",
  "Data quality",
  ">Warning<",
  "Fit view",
  "Zoom in",
  "Zoom out",
  "Enter UUID",
  "Paste UUID",
  "Nhập UUID",
  "Dán UUID",
]) {
  rejectIncludes(
    `${nodeCard}\n${toolbar}\n${sidePanel}`,
    token,
    `forbidden user-facing copy ${token}`,
  );
}

for (const token of [
  "Status: `PASS_LOCAL_STATIC`",
  "Summary",
  "Why A-06/A-07/A-08 were grouped",
  "A-06 visual polish result",
  "Tree node/card result",
  "Tree toolbar result",
  "Add-relative panel result",
  "Duplicate suggestion polish result",
  "A-07 merge/dedupe readiness result",
  "No-auto-merge guard",
  "Future merge approval boundary",
  "A-08 data quality warning result",
  "Warning logic",
  "Privacy/permission result",
  "Vietnamese UI copy result",
  "Deferred items",
  "Checker result",
  "Validation results",
  "Recommended next phase",
  "Không auto merge.",
  "Không xóa person tự động.",
  "Không xóa relationship tự động.",
  "Không ghi đè private/source notes tự động.",
  "Không merge nếu chưa có audit/rollback rõ.",
  "Không merge nếu chưa có owner approval.",
]) {
  requireIncludes(doc, token, `A-06/A-07/A-08 doc token ${token}`);
}

for (const token of [
  "PLAN_A06_A07_A08_TREE_POLISH_DEDUPE_READINESS_DATA_QUALITY_WARNINGS.md",
  "PLAN_A06_A07_A08_TREE_POLISH_DEDUPE_READINESS_DATA_QUALITY_WARNINGS",
]) {
  requireIncludes(index, token, `index token ${token}`);
  requireIncludes(workLog, token, `work log token ${token}`);
  requireIncludes(handoff, token, `handoff token ${token}`);
}

requireIncludes(
  decisionLog,
  "Decision 160 - Tree data quality guidance is read-only and merge stays approval-gated",
  "decision log Decision 160",
);

if (
  packageJson?.scripts?.[
    "check:tree-polish-dedupe-readiness-data-quality"
  ] !==
  "node scripts/check-tree-polish-dedupe-readiness-data-quality.cjs"
) {
  failures.push(
    "package.json missing check:tree-polish-dedupe-readiness-data-quality script",
  );
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

const mutationSources = gitOutput([
  "diff",
  "--",
  "app",
  "lib",
  "server",
  "components",
]);
for (const token of [
  "mergePerson",
  "dedupePerson",
  "deletePerson",
  "deleteRelationship",
  "supabase.from(\"people\").delete",
  "supabase.from('people').delete",
]) {
  rejectIncludes(mutationSources, token, `runtime merge/delete mutation ${token}`);
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
    failures.push(`SQL file changed or added: ${file}`);
  }
  if (file.startsWith("db/migrations/") && !isApprovedA12SqlArtifact) {
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
    failures.push(`unexpected changed file for Plan A-06/A-07/A-08: ${file}`);
  }
}

if (failures.length > 0) {
  console.error("Tree polish/dedupe readiness/data quality check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Tree polish/dedupe readiness/data quality check passed.");
