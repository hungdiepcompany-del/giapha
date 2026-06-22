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
  "components/tree/tree-editor-side-panel.tsx",
  "docs/PLAN_A04_A05_TREE_EDITOR_SMOKE_AND_DUPLICATE_SUGGESTION.md",
  "docs/132_ROUTINE_PRODUCTION_MONITORING_SNAPSHOT.md",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "package.json",
  "scripts/check-tree-duplicate-suggestion-ux.cjs",
  "scripts/check-tree-inline-create-person-ux.cjs",
  "scripts/check-tree-relationship-picker-ux.cjs",
  "scripts/check-vietnamese-cultural-ui-ux.cjs",
  "scripts/check-authenticated-smoke-result.cjs",
  "scripts/check-post-runtime-ui-deploy-readiness.cjs",
  "scripts/check-production-monitoring-auth-smoke-prep.cjs",
  "scripts/check-routine-production-monitoring-snapshot.cjs",
]);

const doc = readFile("docs/132_ROUTINE_PRODUCTION_MONITORING_SNAPSHOT.md");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = readJson("package.json");

for (const token of [
  "Status: `ROUTINE_PUBLIC_PRODUCTION_MONITORING_PASS`",
  "https://web-gia-pha.hungdiepcompany.workers.dev",
  "Monitoring Timestamp",
  "Public Route Status Table",
  "| `/` | 200 | YES | 0 | 0 | PASS |",
  "| `/tree` | 200 | YES | 0 | 0 | PASS |",
  "| `/auth/login` | 200 | YES | 0 | 0 | PASS |",
  "Vietnamese UI Copy Result",
  "Privacy/Forbidden Marker Result",
  "Authenticated Smoke Status",
  "PHASE_130_BLOCKED_MISSING_EXPLICIT_AUTHENTICATED_SMOKE_ENV",
  "SAFE_SKIP_MISSING_EXPLICIT_AUTHENTICATED_SMOKE_ENV",
  "Credential Safety Result",
  "Build/Check Result",
  "Explicitly Not Done",
  "No authenticated smoke run.",
  "No credential requested.",
  "No secret printed or written.",
  "No deploy.",
  "No push.",
  "No migration.",
  "No `.sql`.",
  "No DB apply.",
  "No SQL/data mutation.",
  "No Worker created.",
  "No OpenNext/Wrangler config change.",
  "No runtime dependency added.",
  "`PLANNING.MD` not read",
]) {
  requireIncludes(doc, token, `Phase 132 doc token ${token}`);
}

for (const token of [
  "132_ROUTINE_PRODUCTION_MONITORING_SNAPSHOT.md",
  "Phase 132 - Routine Production Monitoring Snapshot",
]) {
  requireIncludes(index, token, `index token ${token}`);
}

requireIncludes(
  workLog,
  "Phase 132 - Routine Production Monitoring Snapshot",
  "work log Phase 132 entry",
);
requireIncludes(decisionLog, "Decision 155", "decision log Decision 155");
requireIncludes(
  handoff,
  "Phase 132 - Routine Production Monitoring Snapshot completed",
  "handoff Phase 132 entry",
);

if (
  packageJson?.scripts?.["check:routine-production-monitoring-snapshot"] !==
  "node scripts/check-routine-production-monitoring-snapshot.cjs"
) {
  failures.push("package.json missing check:routine-production-monitoring-snapshot script");
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
  { label: "Supabase secret value", pattern: /sb_secret_[A-Za-z0-9_-]{3,}/i },
  { label: "service role env assignment", pattern: /SUPABASE_SERVICE_ROLE_KEY\s*=/ },
  { label: "cookie assignment", pattern: /COOKIE\s*=/i },
  { label: "session assignment", pattern: /SESSION\s*=/i },
  { label: "authorization value", pattern: /Bearer\s+\S{8,}/i },
  { label: "GitHub classic token", pattern: /ghp_[A-Za-z0-9]+/i },
  { label: "GitHub OAuth token", pattern: /gho_[A-Za-z0-9]+/i },
  { label: "GitHub fine-grained token", pattern: /github_pat_[A-Za-z0-9_]+/i },
];

for (const { label, pattern } of secretPatterns) {
  if (pattern.test(doc)) {
    failures.push(`secret-like value in Phase 132 doc: ${label}`);
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
    failures.push(`unexpected changed file for Phase 132: ${file}`);
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
  console.error("Routine production monitoring snapshot check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Routine production monitoring snapshot check passed.");
