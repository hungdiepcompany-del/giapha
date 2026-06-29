const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];
const marker = "A15C_OWNER_ADMIN_SESSION_PERMISSION_SMOKE_READINESS";
const docPath = "docs/PLAN_A15C_OWNER_ADMIN_SESSION_PERMISSION_SMOKE_READINESS.md";
const smokePath = "scripts/smoke-a15c-owner-admin-session-permission-readiness.cjs";
const checkerPath = "scripts/check-a15c-owner-admin-session-permission-smoke-readiness.cjs";
const b1DocPath =
  "docs/PLAN_A15B1_AUTHENTICATED_ADMIN_HERITAGE_UI_BROWSER_SMOKE_RERUN.md";
const b1CheckerPath =
  "scripts/check-a15b1-authenticated-admin-heritage-ui-browser-smoke-rerun.cjs";
const c2DocPath =
  "docs/PLAN_A15C2_SUPABASE_AUTH_BROWSER_SESSION_BINDING_DIAGNOSTICS.md";
const c2SmokePath =
  "scripts/smoke-a15c2-auth-browser-session-binding-diagnostics.cjs";
const c2CheckerPath =
  "scripts/check-a15c2-supabase-auth-browser-session-binding-diagnostics.cjs";

const allowedChangedFiles = new Set([
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  docPath,
  b1DocPath,
  c2DocPath,
  "package.json",
  "scripts/check-a15a2-modern-vietnamese-genealogy-tree-editor-ui.cjs",
  "scripts/check-a15a3-vietnamese-heritage-public-tree-view-ui.cjs",
  "scripts/check-a15a4-vietnamese-heritage-family-list-admin-dashboard-ui.cjs",
  "scripts/check-a15a5-member-profile-person-detail-vietnamese-heritage-ui.cjs",
  "scripts/check-a15a6-add-edit-member-form-vietnamese-heritage-ux.cjs",
  "scripts/check-a15b-authenticated-heritage-ui-browser-smoke.cjs",
  smokePath,
  checkerPath,
  b1CheckerPath,
  c2SmokePath,
  c2CheckerPath,
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
const doc = readFile(docPath);
const smoke = readFile(smokePath);
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");

for (const token of [
  "A-15C - Owner/Admin Session Permission Smoke Readiness",
  marker,
  "READINESS_STATUS=PASS",
  "OWNER_ADMIN_PERMISSION_READY_READ_ONLY",
  "ENV_SUPABASE_URL_PRESENT=true",
  "AUTH_USER_FOUND=true",
  "PROFILE_FOUND=true",
  "ROLE_COUNT=1",
  "PERMISSION_COUNT=25",
  "REQUIRED_ADMIN_PERMISSION_MISSING_COUNT=0",
  "SELECT/read-only",
  "Không seed",
  "Không gán role",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "A15C_OWNER_EMAIL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "OWNER_ADMIN_PERMISSION_READY_READ_ONLY",
  "requiredAdminPermissions",
  "printResult(result)",
]) {
  requireIncludes(smoke, token, `smoke token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A15C_OWNER_ADMIN_SESSION_PERMISSION_SMOKE_READINESS.md", "index entry"],
  [workLog, "A-15C - Owner/Admin Session Permission Smoke Readiness", "work log entry"],
  [handoff, "A-15C - Owner/Admin Session Permission Smoke Readiness recorded", "handoff entry"],
  [decisionLog, "Decision 186 - A-15C owner/admin readiness is SELECT-only", "decision log entry"],
  [workLog, marker, "work log marker"],
  [handoff, marker, "handoff marker"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["smoke:a15c:owner-admin-session-permission-readiness"] !==
  "node scripts/smoke-a15c-owner-admin-session-permission-readiness.cjs"
) {
  failures.push("missing package script smoke:a15c:owner-admin-session-permission-readiness");
}

if (
  packageJson?.scripts?.["check:a15c:owner-admin-session-permission-smoke-readiness"] !==
  "node scripts/check-a15c-owner-admin-session-permission-smoke-readiness.cjs"
) {
  failures.push("missing package script check:a15c:owner-admin-session-permission-smoke-readiness");
}

for (const scriptName of [
  "check:a15a2:modern-vietnamese-genealogy-tree-editor-ui",
  "check:a15a3:vietnamese-heritage-public-tree-view-ui",
  "check:a15a4:vietnamese-heritage-family-list-admin-dashboard-ui",
  "check:a15a5:member-profile-person-detail-vietnamese-heritage-ui",
  "check:a15a6:add-edit-member-form-vietnamese-heritage-ux",
  "check:a15b:authenticated-heritage-ui-browser-smoke",
]) {
  if (!packageJson?.scripts?.[scriptName]) {
    failures.push(`${scriptName} was removed`);
  }
}

const changedFiles = gitOutput(["status", "--porcelain"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === ".env.local") failures.push(".env.local must not be changed");
  if (file === "PLANNING.MD") failures.push("PLANNING.MD must not be changed");
  if (file.startsWith("db/") || file.endsWith(".sql")) {
    failures.push(`database/sql file changed ${file}`);
  }
  if (/schema|migration|seed/i.test(file) && !file.startsWith("docs/")) {
    failures.push(`schema/migration/seed-like file changed ${file}`);
  }
  if (/wrangler|open-next|opennext|cloudflare-env|middleware|next\.config/i.test(file)) {
    failures.push(`Worker/OpenNext/Wrangler/runtime config file changed ${file}`);
  }
  if (
    file.startsWith("app/api/") ||
    file.startsWith("lib/") ||
    file.startsWith("server/") ||
    file.startsWith("services/") ||
    file.startsWith("pages/")
  ) {
    failures.push(`API/service/runtime file changed ${file}`);
  }
  if (/storage-state|storage_state|cookie|token|secret|\.png$|\.jpg$|\.jpeg$|\.webp$/i.test(file)) {
    failures.push(`possible secret/session/evidence/external asset artifact changed ${file}`);
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

for (const pattern of [
  /\bCREATE\s+TABLE\b/i,
  /\bALTER\s+TABLE\b/i,
  /\bDROP\s+TABLE\b/i,
  /\bINSERT\s+INTO\b/i,
  /\bUPDATE\s+[a-z_]/i,
  /\bDELETE\s+FROM\b/i,
  /\bTRUNCATE\s+TABLE\b/i,
  /\bCREATE\s+POLICY\b/i,
  /\bALTER\s+POLICY\b/i,
  /sb_(secret|service)_[A-Za-z0-9_-]{12,}/,
  /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/,
  /Bearer\s+[A-Za-z0-9._-]{12,}/,
]) {
  rejectPattern(doc + "\n" + smoke, pattern, pattern.toString());
}

if (failures.length > 0) {
  console.error("A-15C owner/admin session permission smoke readiness check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-15C owner/admin session permission smoke readiness check passed.");
