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
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "package.json",
  "scripts/check-merge-dedupe-transaction-audit-design.cjs",
  "scripts/check-tree-editor-auth-browser-smoke.cjs",
  "scripts/check-tree-polish-dedupe-readiness-data-quality.cjs",
  "scripts/check-tree-duplicate-suggestion-ux.cjs",
  "scripts/check-tree-inline-create-person-ux.cjs",
  "scripts/check-tree-relationship-picker-ux.cjs",
  "scripts/check-vietnamese-cultural-ui-ux.cjs",
  "scripts/check-authenticated-smoke-result.cjs",
  "scripts/check-export-import-final-readiness.cjs",
  "scripts/check-inline-admin-warning-ui.cjs",
  "scripts/check-post-runtime-ui-deploy-readiness.cjs",
  "scripts/check-production-monitoring-auth-smoke-prep.cjs",
  "scripts/check-routine-production-monitoring-snapshot.cjs",
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
  "notes_private",
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

const status = gitOutput(["status", "--short"]);
for (const line of status.split(/\r?\n/).filter(Boolean)) {
  const file = line.slice(3).trim().replaceAll("\\", "/");
  const lowerFile = file.toLowerCase();

  if (file === "PLANNING.MD") failures.push("PLANNING.MD changed or staged");
  if (lowerFile.endsWith(".sql")) failures.push(`SQL file changed: ${file}`);
  if (file.startsWith("db/migrations/")) {
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
