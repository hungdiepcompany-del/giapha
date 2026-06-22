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
  "docs/130_AUTHENTICATED_PRODUCTION_SMOKE_RESULT.md",
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

const doc = readFile("docs/130_AUTHENTICATED_PRODUCTION_SMOKE_RESULT.md");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = readJson("package.json");

for (const token of [
  "Status: `PHASE_130_BLOCKED_MISSING_EXPLICIT_AUTHENTICATED_SMOKE_ENV`",
  "https://web-gia-pha.hungdiepcompany.workers.dev",
  "Git Sync Result",
  "Shell-Only Env Presence Result",
  "Credential Safety Result",
  "Pre-Smoke Validation Result",
  "Auth/Session Smoke Result",
  "Role/Permission Smoke Result",
  "Privacy Smoke Result",
  "Vietnamese UI Smoke Result",
  "Small JSON Export Smoke Result",
  "Blocked/Safe-Skip Reason",
  "Explicitly Not Done",
  "No credential requested.",
  "No secret printed or written.",
  "`PLANNING.MD` not read",
]) {
  requireIncludes(doc, token, `Phase 130 doc token ${token}`);
}

for (const token of [
  "130_AUTHENTICATED_PRODUCTION_SMOKE_RESULT.md",
  "Phase 130 - Authenticated Production Smoke Result",
]) {
  requireIncludes(index, token, `index token ${token}`);
}

requireIncludes(
  workLog,
  "Phase 130 - Authenticated Production Smoke Execution",
  "work log Phase 130 entry",
);
requireIncludes(decisionLog, "Decision 153", "decision log Decision 153");
requireIncludes(
  handoff,
  "Phase 130 - Authenticated Production Smoke Result completed",
  "handoff Phase 130 entry",
);

if (
  packageJson?.scripts?.["check:authenticated-smoke-result"] !==
  "node scripts/check-authenticated-smoke-result.cjs"
) {
  failures.push("package.json missing check:authenticated-smoke-result script");
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

const secretPatterns = [
  { label: "JWT-like value", pattern: /eyJ[A-Za-z0-9_-]{8,}/ },
  { label: "Supabase secret value", pattern: /sb_secret_[A-Za-z0-9_-]+/i },
  { label: "privileged key label", pattern: /service_role/i },
  { label: "privileged env assignment", pattern: /SUPABASE_SERVICE_ROLE_KEY\s*=/ },
  { label: "cookie assignment", pattern: /COOKIE\s*=/i },
  { label: "session assignment", pattern: /SESSION\s*=/i },
  { label: "authorization value", pattern: /Bearer\s+\S+/i },
  { label: "GitHub classic token", pattern: /ghp_[A-Za-z0-9]+/i },
  { label: "GitHub OAuth token", pattern: /gho_[A-Za-z0-9]+/i },
  { label: "GitHub fine-grained token", pattern: /github_pat_[A-Za-z0-9_]+/i },
];

for (const { label, pattern } of secretPatterns) {
  if (pattern.test(doc)) {
    failures.push(`secret-like value in Phase 130 doc: ${label}`);
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
    failures.push(`unexpected changed file for Phase 130: ${file}`);
  }
}

if (failures.length > 0) {
  console.error("Authenticated production smoke result check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Authenticated production smoke result check passed.");
