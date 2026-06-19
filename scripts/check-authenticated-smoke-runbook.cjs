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
  "docs/129_AUTHENTICATED_PRODUCTION_SMOKE_RUNBOOK.md",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "package.json",
  "scripts/check-authenticated-smoke-runbook.cjs",
]);

const doc = readFile("docs/129_AUTHENTICATED_PRODUCTION_SMOKE_RUNBOOK.md");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = readJson("package.json");

for (const token of [
  "Status: `SAFE_SKIP_MISSING_EXPLICIT_AUTHENTICATED_SMOKE_ENV`",
  "https://web-gia-pha.hungdiepcompany.workers.dev",
  "Shell-Only Env Policy",
  "<set-in-shell-only>",
  "Forbidden Credential Handling",
  "Authenticated Smoke Checklist",
  "Role/Permission Smoke Matrix",
  "Privacy Smoke Matrix",
  "JSON Export Smoke Matrix",
  "Vietnamese UI Smoke Matrix",
  "Expected PASS/FAIL/SAFE_SKIP Statuses",
  "No-Go Conditions",
  "Incident Rollback/Escalation Notes",
  "No authenticated smoke run without explicit shell-only environment.",
  "No credential requested.",
  "No secret written to docs/chat.",
  "`PLANNING.MD` not read",
]) {
  requireIncludes(doc, token, `Phase 129 doc token ${token}`);
}

for (const token of [
  "129_AUTHENTICATED_PRODUCTION_SMOKE_RUNBOOK.md",
  "Phase 129 - Authenticated Production Smoke Runbook",
]) {
  requireIncludes(index, token, `index token ${token}`);
}

requireIncludes(
  workLog,
  "Phase 129 - Authenticated Production Smoke Readiness / Operator Runbook",
  "work log Phase 129 entry",
);
requireIncludes(decisionLog, "Decision 152", "decision log Decision 152");
requireIncludes(
  handoff,
  "Phase 129 - Authenticated Production Smoke Runbook completed",
  "handoff Phase 129 entry",
);

if (
  packageJson?.scripts?.["check:authenticated-smoke-runbook"] !==
  "node scripts/check-authenticated-smoke-runbook.cjs"
) {
  failures.push("package.json missing check:authenticated-smoke-runbook script");
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

const placeholderSafeDoc = doc.replace(
  /^\$env:[A-Z0-9_]+="<set-in-shell-only>"$/gm,
  "$env:PLACEHOLDER=<set-in-shell-only>",
);

const secretPatterns = [
  { label: "JWT-like value", pattern: /eyJ[A-Za-z0-9_-]{8,}/ },
  { label: "Supabase secret value", pattern: /sb_secret_[A-Za-z0-9_-]+/i },
  { label: "service role assignment", pattern: /service_role/i },
  { label: "service role env assignment", pattern: /SUPABASE_SERVICE_ROLE_KEY\s*=/ },
  { label: "cookie assignment", pattern: /COOKIE\s*=\s*(?!<set-in-shell-only>)/i },
  { label: "session assignment", pattern: /SESSION\s*=\s*(?!<set-in-shell-only>)/i },
  { label: "authorization bearer value", pattern: /Bearer\s+\S+/i },
  { label: "GitHub token value", pattern: /ghp_[A-Za-z0-9]+/i },
];

for (const { label, pattern } of secretPatterns) {
  if (pattern.test(placeholderSafeDoc)) {
    failures.push(`secret-like value in Phase 129 doc: ${label}`);
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
    failures.push(`workflow drift: ${file}`);
  }
  if (!allowedChangedFiles.has(file)) {
    failures.push(`unexpected changed file for Phase 129: ${file}`);
  }
}

if (failures.length > 0) {
  console.error("Authenticated production smoke runbook check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Authenticated production smoke runbook check passed.");
