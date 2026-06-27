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
  "docs/PLAN_A14G_PUBLIC_BROWSER_VISUAL_SMOKE.md",
  "package.json",
  "scripts/check-a14-ui-ux-overhaul.cjs",
  "scripts/check-a14a-related-member-add-ux.cjs",
  "scripts/check-a14b-public-tree-home-ux.cjs",
  "scripts/check-a14c-admin-dashboard-layout-ux.cjs",
  "scripts/check-a14d-tree-viewer-interaction-ux.cjs",
  "scripts/check-a14e-mobile-ux-sweep.cjs",
  "scripts/check-a14f-browser-visual-smoke-readiness.cjs",
  "scripts/check-a14g-public-browser-visual-smoke.cjs",
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
const doc = readFile("docs/PLAN_A14G_PUBLIC_BROWSER_VISUAL_SMOKE.md");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");
const a14fDoc = readFile("docs/PLAN_A14F_BROWSER_VISUAL_SMOKE_READINESS.md");

for (const heading of [
  "## A-14G1 - Public Smoke Target Resolution",
  "## A-14G2 - Browser Tooling / Smoke Mode Check",
  "## A-14G3 - Public Home Visual Smoke",
  "## A-14G4 - Public Tree Viewer Visual Smoke",
  "## A-14G5 - Public Person Profile Visual Smoke",
  "## A-14G6 - Public Error / Not-found / Private State Smoke",
  "## A-14G7 - Mobile Public Visual Smoke",
  "## A-14G8 - Screenshot / Evidence Handling",
  "## A-14G9 - Public Browser Smoke Report",
  "## A-14G10 - Checker",
  "## A-14G11 - Docs / Decision / Handoff",
  "## A-14G12 - Validation",
  "## A-14G13 - Commit",
]) {
  requireIncludes(doc, heading, `A-14G doc section ${heading}`);
}

for (const token of [
  "Public Browser Visual Smoke",
  "SAFE_SKIP_MISSING_PUBLIC_BASE_URL",
  "SAFE_SKIP_MISSING_PUBLIC_SAFE_PERSON_SLUG",
  "SAFE_SKIP_BROWSER_TOOL_UNAVAILABLE",
  "SAFE_SKIP_MOBILE_VIEWPORT_TOOLING_UNAVAILABLE",
  "PUBLIC_VISUAL_SMOKE_BASE_URL",
  "LOCAL_SMOKE_BASE_URL",
  "PROD_SMOKE_BASE_URL",
  "PUBLIC_VISUAL_SMOKE_PERSON_SLUG",
  "Không có base URL",
  "Không smoke admin/auth-required route",
  "Không click mutation",
  "Không DB apply",
  "Không check SQL trên DB",
  "Không migration",
  "Không merge/dedupe runtime",
  "Không permission runtime",
  "Không deploy",
  "Không push",
  "Backup gate remains",
  "BLOCKED_PENDING_OWNER_BACKUP_GATE_CONFIRMATION",
  "PLANNING.MD",
  "classic modern genealogy",
  "Public tree remains read-only",
  "Public-only",
  "Base URL gate",
  "Public-safe slug gate",
  "Screenshot/evidence safety",
  "notes_private",
  "source_note",
  "Không tự host local server",
  "Không tự đoán URL",
  "Không query DB để tự tìm",
]) {
  requireIncludes(doc, token, `A-14G doc token ${token}`);
}

// Checker must guard against false visual PASS claims
if (doc.includes("Browser visual smoke PASS") && !doc.includes("SAFE_SKIP")) {
  failures.push("A-14G must not claim browser visual smoke PASS without explicit SAFE_SKIP context");
}

// Must keep cross-phase compatibility references
for (const [content, token, label] of [
  [index, "PLAN_A14G_PUBLIC_BROWSER_VISUAL_SMOKE.md", "index entry"],
  [workLog, "A-14G - Public Browser Visual Smoke", "work log entry"],
  [
    decisionLog,
    "Decision 175 - A-14G public browser visual smoke is SAFE_SKIP without explicit base URL",
    "decision log entry",
  ],
  [handoff, "A-14G - Public Browser Visual Smoke completed", "handoff entry"],
]) {
  requireIncludes(content, token, label);
}

// Cross-reference A-14F readiness
requireIncludes(a14fDoc, "Browser Visual Smoke Readiness", "A-14F doc presence");
requireIncludes(
  doc,
  "A-14A/B/C/D/E/F",
  "A-14G doc must reference A-14A/B/C/D/E/F prior phases",
);

if (
  packageJson?.scripts?.["check:a14g-public-browser-visual-smoke"] !==
  "node scripts/check-a14g-public-browser-visual-smoke.cjs"
) {
  failures.push("missing package script check:a14g-public-browser-visual-smoke");
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
  if (
    /storage-state|storage_state|screenshot|\.png$|\.jpg$|\.jpeg$/i.test(file) &&
    !file.startsWith("docs/")
  ) {
    failures.push(`possible auth/session/screenshot artifact changed ${file}`);
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
    if (file === "scripts/check-a14g-public-browser-visual-smoke.cjs") {
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

if (failures.length > 0) {
  console.error("A-14G public browser visual smoke check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-14G public browser visual smoke check passed.");
