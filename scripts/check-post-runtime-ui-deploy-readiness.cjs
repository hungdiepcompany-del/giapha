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
  "docs/127_POST_RUNTIME_UI_DEPLOY_READINESS_GATE.md",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "package.json",
  "scripts/check-post-runtime-ui-deploy-readiness.cjs",
]);

const doc = readFile("docs/127_POST_RUNTIME_UI_DEPLOY_READINESS_GATE.md");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = readJson("package.json");

for (const token of [
  "Status: `READY_FOR_MANUAL_DEPLOY_CHECK`",
  "No deploy was performed.",
  "not `DEPLOYED`",
  "Windows",
  ".next",
  "EPERM",
  "Clean temp `npm run build`",
  "Vietnamese UI copy",
  "user-visible UI text must remain Vietnamese with diacritics",
  "Small JSON export",
  "Privacy/Security Review",
  "Main Worker Risk Review",
  "Dependency/Config Drift Review",
  "owner approval",
  "Suggested Pre-Deploy Command List",
  "Suggested Post-Deploy Smoke List",
  "No Worker created.",
  "No OpenNext/Wrangler config change.",
  "No runtime dependency added.",
  "`PLANNING.MD` not read",
]) {
  requireIncludes(doc, token, `Phase 127 doc token ${token}`);
}

if (
  !doc.includes("Status: `READY_FOR_MANUAL_DEPLOY_CHECK`") &&
  !doc.includes("Status: `NOT_READY`")
) {
  failures.push("Phase 127 doc must include READY_FOR_MANUAL_DEPLOY_CHECK or NOT_READY status");
}

for (const token of [
  "Status: `DEPLOYED`",
  "PRODUCTION_DEPLOY_PASS",
  "wrangler deploy completed",
  "Cloudflare deploy completed",
  "supabase db push",
  "CREATE TABLE",
  "ALTER TABLE",
  "INSERT INTO",
  "UPDATE public.",
  "DELETE FROM",
  "DROP TABLE",
]) {
  rejectIncludes(doc, token, `Phase 127 deploy/schema claim ${token}`);
}

for (const token of [
  "127_POST_RUNTIME_UI_DEPLOY_READINESS_GATE.md",
  "Phase 127 - Post Runtime/UI Deploy Readiness Gate",
]) {
  requireIncludes(index, token, `index token ${token}`);
}

requireIncludes(
  workLog,
  "Phase 127 - Post Runtime/UI Deploy Readiness Gate",
  "work log Phase 127 entry",
);
requireIncludes(decisionLog, "Decision 150", "decision log Decision 150");
requireIncludes(
  handoff,
  "Phase 127 - Post Runtime/UI Deploy Readiness Gate completed",
  "handoff Phase 127 entry",
);

if (
  packageJson?.scripts?.["check:post-runtime-ui-deploy-readiness"] !==
  "node scripts/check-post-runtime-ui-deploy-readiness.cjs"
) {
  failures.push("package.json missing check:post-runtime-ui-deploy-readiness script");
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
  if (file === "wrangler.toml" || file.includes("open-next") || file.includes("opennext")) {
    failures.push(`Worker/OpenNext/Wrangler config drift: ${file}`);
  }
  if (file.startsWith(".github/workflows/")) {
    failures.push(`deploy workflow mutation: ${file}`);
  }
  if (file.startsWith("services/")) {
    failures.push(`Worker/service file changed or added: ${file}`);
  }
  if (!allowedChangedFiles.has(file)) {
    failures.push(`unexpected changed file for Phase 127: ${file}`);
  }
}

for (const [label, pathspecs] of [
  ["migration files changed", ["db/migrations"]],
  ["SQL files changed", ["*.sql", "db/**/*.sql", "scripts/**/*.sql"]],
  ["Worker/service files changed", ["services"]],
  ["OpenNext/Wrangler config changed", ["wrangler.toml", "open-next.config.ts", "open-next.config.mjs", "next.config.ts"]],
  ["deploy workflow changed", [".github/workflows"]],
]) {
  const changed = gitOutput(["status", "--short", "--", ...pathspecs]);
  if (changed.trim()) failures.push(`${label}: ${changed.trim()}`);
}

if (failures.length > 0) {
  console.error("Post runtime/UI deploy readiness check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Post runtime/UI deploy readiness check passed.");
