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
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "package.json",
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
  "Người đang chọn",
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
  "Sắp xếp lại cây",
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
  "notes_private",
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

const status = gitOutput(["status", "--short"]);
for (const line of status.split(/\r?\n/).filter(Boolean)) {
  const file = line.slice(3).trim().replaceAll("\\", "/");
  const lowerFile = file.toLowerCase();

  if (file === "PLANNING.MD") failures.push("PLANNING.MD changed or staged");
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
    failures.push(`unexpected changed file for Plan A-06/A-07/A-08: ${file}`);
  }
}

if (failures.length > 0) {
  console.error("Tree polish/dedupe readiness/data quality check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Tree polish/dedupe readiness/data quality check passed.");
