const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const allowedChangedFiles = new Set([
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "components/public/public-home.tsx",
  "components/layout/public-shell.tsx",
  "scripts/check-a15a1-public-home-modern-heritage-ui.cjs",
  "docs/PLAN_A15A1_PUBLIC_HOME_MODERN_HERITAGE_UI.md",
  "scripts/check-a15a0-gemini-modern-heritage-design-spec.cjs",
  "docs/PLAN_A15A0_GEMINI_MODERN_HERITAGE_UI_UX_DESIGN_SPEC.md",
  "docs/PLAN_A14F_BROWSER_VISUAL_SMOKE_READINESS.md",
  "docs/PLAN_A14G_PUBLIC_BROWSER_VISUAL_SMOKE.md",
  "scripts/check-a14g-public-browser-visual-smoke.cjs",
  "package.json",
  "scripts/check-a14-ui-ux-overhaul.cjs",
  "scripts/check-a14a-related-member-add-ux.cjs",
  "scripts/check-a14b-public-tree-home-ux.cjs",
  "scripts/check-a14c-admin-dashboard-layout-ux.cjs",
  "scripts/check-a14d-tree-viewer-interaction-ux.cjs",
  "scripts/check-a14e-mobile-ux-sweep.cjs",
  "scripts/check-a14f-browser-visual-smoke-readiness.cjs",
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

function rejectPattern(content, pattern, label = String(pattern)) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
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
const doc = readFile("docs/PLAN_A14F_BROWSER_VISUAL_SMOKE_READINESS.md");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const heading of [
  "## A-14F1 - Visual Smoke Scope Audit",
  "## A-14F2 - Browser Environment Requirements",
  "## A-14F3 - Visual Pass/Fail Criteria",
  "## A-14F4 - Readiness Script / Safe-skip Checker",
  "## A-14F5 - Optional Local Smoke Commands Docs",
  "## A-14F6 - Docs / Decision / Handoff",
  "## A-14F7 - Validation",
  "## A-14F8 - Commit",
]) {
  requireIncludes(doc, heading, `A-14F doc section ${heading}`);
}

for (const token of [
  "Browser Visual Smoke Readiness",
  "PASS_LOCAL_STATIC_WITH_BROWSER_SAFE_SKIP",
  "classic modern genealogy",
  "SAFE_SKIP_BROWSER_TOOL_UNAVAILABLE",
  "Public/read-only visual smoke candidates",
  "Admin/auth-required visual smoke candidates",
  "Mobile/tablet visual smoke candidates",
  "LOCAL_SMOKE_BASE_URL",
  "PROD_SMOKE_BASE_URL",
  "GIA_PHA_AUTH_BROWSER_SMOKE",
  "GIA_PHA_SMOKE_BASE_URL",
  "GIA_PHA_AUTH_STORAGE_STATE_PATH",
  "safe dataset approval",
  "Mutation paths",
  "require separate safe dataset approval",
  "not visual PASS",
  "No real browser visual PASS claimed",
  "Public tree remains read-only",
  "Không schema change",
  "Không DB apply",
  "Không check SQL trên DB",
  "Không merge/dedupe runtime",
  "Không permission runtime",
  "Không deploy",
  "BLOCKED_PENDING_OWNER_BACKUP_GATE_CONFIRMATION",
  "PLANNING.MD",
]) {
  requireIncludes(doc, token, `A-14F doc token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A14F_BROWSER_VISUAL_SMOKE_READINESS.md", "index entry"],
  [workLog, "A-14F - Browser Visual Smoke Readiness", "work log entry"],
  [decisionLog, "Decision 174 - A-14F browser visual smoke readiness is not visual PASS", "decision log entry"],
  [handoff, "A-14F - Browser Visual Smoke Readiness completed", "handoff entry"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a14f-browser-visual-smoke-readiness"] !==
  "node scripts/check-a14f-browser-visual-smoke-readiness.cjs"
) {
  failures.push("missing package script check:a14f-browser-visual-smoke-readiness");
}

const changedFiles = gitOutput(["diff", "--name-only"])
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) {
    failures.push(`unexpected changed file ${file}`);
  }
  if (file === "PLANNING.MD") failures.push("PLANNING.MD must not be changed");
  if (file.startsWith("db/") || file.endsWith(".sql")) {
    failures.push(`database/sql file changed ${file}`);
  }
  if (/wrangler|open-next|opennext/i.test(file)) {
    failures.push(`Worker/OpenNext/Wrangler file changed ${file}`);
  }
  if (file.startsWith("services/") || file.startsWith("server/services/")) {
    failures.push(`service runtime file changed ${file}`);
  }
  if (/storage-state|session|cookie|token/i.test(file) && !file.startsWith("docs/")) {
    failures.push(`possible auth/session artifact changed ${file}`);
  }
}

const packageHead = gitShowHead("package.json");
if (packageHead) {
  const before = JSON.parse(packageHead);
  const beforeDeps = JSON.stringify(before.dependencies ?? {});
  const afterDeps = JSON.stringify(packageJson.dependencies ?? {});
  const beforeDevDeps = JSON.stringify(before.devDependencies ?? {});
  const afterDevDeps = JSON.stringify(packageJson.devDependencies ?? {});

  if (beforeDeps !== afterDeps || beforeDevDeps !== afterDevDeps) {
    failures.push("dependency drift detected");
  }
}

const changedGuardedRuntimeContent = changedFiles
  .filter((file) => {
    if (file.startsWith("docs/")) return false;
    if (file === "scripts/check-a14f-browser-visual-smoke-readiness.cjs") {
      return false;
    }
    if (
      !(
        file.startsWith("app/") ||
        file.startsWith("components/") ||
        file.startsWith("lib/") ||
        file.startsWith("server/") ||
        file.startsWith("services/")
      )
    ) {
      return false;
    }
    return /\.(tsx?|jsx?)$/.test(file);
  })
  .map((file) => readFile(file))
  .join("\n");

for (const token of [
  "mergePersons",
  "executeMerge",
  "rollbackMerge",
  "dedupePersons",
  "deleteDuplicatePerson",
  "people.merge.execute",
  "service_role",
  "sb_secret_",
  "SUPABASE_SERVICE_ROLE_KEY=",
  "APPROVE_A13_BACKUP_GATE_CONFIRMED",
]) {
  rejectIncludes(changedGuardedRuntimeContent, token, `forbidden token ${token}`);
}

for (const pattern of [
  /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/,
  /sb_(secret|service)_[A-Za-z0-9_-]{12,}/,
  /Bearer\s+[A-Za-z0-9._-]{12,}/,
  /refresh_token["'\s:=]+[A-Za-z0-9._-]{12,}/i,
  /access_token["'\s:=]+[A-Za-z0-9._-]{12,}/i,
  /Cookie:\s*[^,\n]{12,}/i,
]) {
  rejectPattern(changedGuardedRuntimeContent, pattern, `secret/session pattern ${pattern}`);
}

for (const token of [
  "CREATE TABLE",
  "ALTER TABLE",
  "DROP TABLE",
  "INSERT INTO",
  "UPDATE ",
  "DELETE FROM",
  "TRUNCATE",
]) {
  rejectIncludes(changedGuardedRuntimeContent, token, `SQL mutation token ${token}`);
}

if (doc.includes("Browser visual smoke PASS") || doc.includes("visual smoke PASS")) {
  failures.push("A-14F must not claim browser visual smoke PASS");
}

if (failures.length > 0) {
  console.error("A-14F browser visual smoke readiness check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-14F browser visual smoke readiness check passed.");
