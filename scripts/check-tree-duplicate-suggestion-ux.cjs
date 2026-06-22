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
  "components/tree/family-node-card.tsx",
  "components/tree/family-tree-editor.tsx",
  "components/tree/tree-editor-side-panel.tsx",
  "components/tree/tree-editor-toolbar.tsx",
  "components/genealogy/admin-warning-list.tsx",
  "docs/PLAN_A06_A07_A08_TREE_POLISH_DEDUPE_READINESS_DATA_QUALITY_WARNINGS.md",
  "docs/PLAN_A09_AUTHENTICATED_TREE_EDITOR_BROWSER_SMOKE.md",
  "docs/PLAN_A04_A05_TREE_EDITOR_SMOKE_AND_DUPLICATE_SUGGESTION.md",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "package.json",
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
]);

const packageJson = readJson("package.json");
const sidePanel = readFile("components/tree/tree-editor-side-panel.tsx");
const treePage = readFile("app/(admin)/admin/tree/edit/page.tsx");
const doc = readFile(
  "docs/PLAN_A04_A05_TREE_EDITOR_SMOKE_AND_DUPLICATE_SUGGESTION.md",
);
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "DuplicateSuggestionBox",
  "duplicateSuggestionScore",
  "normalizeDuplicateName",
  "tokenizedName",
  "yearDistance",
  "slice(0, 5)",
  "onUseExistingPerson",
  "setEntryMode(\"existing\")",
  "setSelectedRelatedPersonId(personId)",
  "selectedRelatedPersonId",
  "name=\"related_person_id\"",
  "value={selectedRelatedPersonId}",
]) {
  requireIncludes(sidePanel, token, `duplicate suggestion behavior ${token}`);
}

for (const token of [
  "Có thể đã tồn tại thành viên tương tự",
  "Dùng thành viên này để gắn quan hệ",
  "Vẫn tạo thành viên mới",
  "Không tìm thấy thành viên tương tự",
  "Gợi ý tránh tạo trùng",
  "Thành viên đã có",
  "Tạo mới vẫn đúng nếu đây là người khác trong gia đình",
]) {
  requireIncludes(sidePanel, token, `Vietnamese duplicate suggestion copy ${token}`);
}

for (const token of [
  "Đã gắn quan hệ với thành viên đã có trong cây gia phả.",
  "Đã thêm thành viên mới và gắn quan hệ vào cây gia phả.",
]) {
  requireIncludes(treePage, token, `tree page success copy ${token}`);
}

for (const token of [
  "\"Duplicate\"",
  ">Duplicate<",
  "\"Suggestion\"",
  ">Suggestion<",
  "Use existing",
  "Create anyway",
  "Similar person",
]) {
  rejectIncludes(sidePanel, token, `English user-facing copy ${token}`);
}

for (const token of [
  "Enter UUID",
  "Paste UUID",
  "Person UUID",
  "Related person UUID",
  "Nhập UUID",
  "Dán UUID",
  "UUID thành viên",
]) {
  rejectIncludes(sidePanel, token, `manual UUID UI copy ${token}`);
}

for (const token of [
  "notes_private",
  "source_note",
  "hidden relationship facts",
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
  rejectIncludes(sidePanel, token, `private/secret marker ${token}`);
}

for (const token of [
  "Status: `PASS_LOCAL_STATIC`",
  "Summary",
  "Why A-04 and A-05 were grouped",
  "A-04 smoke result",
  "A-04 safe-skip reason",
  "A-03 bug fixes",
  "A-05 user problem",
  "Duplicate suggestion UX result",
  "Matching strategy",
  "Use existing member behavior",
  "Create new anyway behavior",
  "Internal UUID behavior",
  "Vietnamese UI copy result",
  "Privacy/permission result",
  "Deferred items",
  "Checker result",
  "Validation results",
  "Recommended next phase",
]) {
  requireIncludes(doc, token, `A-04/A-05 doc token ${token}`);
}

for (const token of [
  "PLAN_A04_A05_TREE_EDITOR_SMOKE_AND_DUPLICATE_SUGGESTION.md",
  "PLAN_A04_A05_TREE_EDITOR_SMOKE_AND_DUPLICATE_SUGGESTION",
]) {
  requireIncludes(index, token, `index token ${token}`);
  requireIncludes(workLog, token, `work log token ${token}`);
  requireIncludes(handoff, token, `handoff token ${token}`);
}

requireIncludes(
  decisionLog,
  "Decision 159 - Tree quick-create duplicate suggestion stays client-side and advisory",
  "decision log Decision 159",
);

if (
  packageJson?.scripts?.["check:tree-duplicate-suggestion-ux"] !==
  "node scripts/check-tree-duplicate-suggestion-ux.cjs"
) {
  failures.push("package.json missing check:tree-duplicate-suggestion-ux script");
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
    failures.push(`unexpected changed file for Plan A-04/A-05: ${file}`);
  }
}

for (const [label, pathspecs] of [
  ["migration files changed", ["db/migrations"]],
  ["SQL files changed", ["*.sql", "db/**/*.sql", "scripts/**/*.sql"]],
  ["Worker/service files changed", ["services"]],
  [
    "OpenNext/Wrangler config changed",
    ["wrangler.toml", "open-next.config.ts", "open-next.config.mjs", "next.config.ts"],
  ],
  ["deploy workflow changed", [".github/workflows"]],
]) {
  const changed = gitOutput(["status", "--short", "--", ...pathspecs]);
  if (changed.trim()) failures.push(`${label}: ${changed.trim()}`);
}

if (failures.length > 0) {
  console.error("Tree duplicate suggestion UX check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Tree duplicate suggestion UX check passed.");
