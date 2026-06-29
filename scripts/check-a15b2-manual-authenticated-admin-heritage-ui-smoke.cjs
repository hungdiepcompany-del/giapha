const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];
const marker = "A15B2_MANUAL_AUTHENTICATED_ADMIN_HERITAGE_UI_SMOKE";
const docPath =
  "docs/PLAN_A15B2_MANUAL_AUTHENTICATED_ADMIN_HERITAGE_UI_SMOKE.md";
const checkerPath =
  "scripts/check-a15b2-manual-authenticated-admin-heritage-ui-smoke.cjs";

const allowedChangedFiles = new Set([
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  docPath,
  "package.json",
  "scripts/check-a15a2-modern-vietnamese-genealogy-tree-editor-ui.cjs",
  "scripts/check-a15a3-vietnamese-heritage-public-tree-view-ui.cjs",
  "scripts/check-a15a4-vietnamese-heritage-family-list-admin-dashboard-ui.cjs",
  "scripts/check-a15a5-member-profile-person-detail-vietnamese-heritage-ui.cjs",
  "scripts/check-a15a6-add-edit-member-form-vietnamese-heritage-ux.cjs",
  "scripts/check-a15b-authenticated-heritage-ui-browser-smoke.cjs",
  "scripts/check-a15c-owner-admin-session-permission-smoke-readiness.cjs",
  "scripts/check-a15b1-authenticated-admin-heritage-ui-browser-smoke-rerun.cjs",
  "scripts/check-a15c2-supabase-auth-browser-session-binding-diagnostics.cjs",
  checkerPath,
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
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");

for (const token of [
  "A-15B2 - Manual Authenticated Admin Heritage UI Smoke",
  marker,
  "Documentation/Checker-Only",
  "PASS_OWNER_CONFIRMED",
  "AUTH_RUNTIME_STATUS=PASS_OWNER_CONFIRMED",
  "AUTOMATED_BROWSER_SMOKE_STATUS=NEEDS_PERSISTED_SESSION_CONTEXT",
  "A15C3_AUTH_FIX_NEEDED=false",
  "A15D_PERMISSION_SEED_NEEDED=false",
  "/admin",
  "/admin/genealogy",
  "/admin/tree/edit",
  "/admin/people/new",
  "/admin/relationships",
  "/admin/people/[id]",
  "no mutation",
  "no seed",
  "no role assignment",
  "no env commit",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A15B2_MANUAL_AUTHENTICATED_ADMIN_HERITAGE_UI_SMOKE.md", "index entry"],
  [workLog, "A-15B2 - Manual Authenticated Admin Heritage UI Smoke", "work log entry"],
  [handoff, "A-15B2 - Manual Authenticated Admin Heritage UI Smoke recorded", "handoff entry"],
  [decisionLog, "Decision 189 - A-15B2 closes auth fix path based on owner manual confirmation", "decision log entry"],
  [workLog, marker, "work log marker"],
  [handoff, marker, "handoff marker"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a15b2:manual-authenticated-admin-heritage-ui-smoke"] !==
  "node scripts/check-a15b2-manual-authenticated-admin-heritage-ui-smoke.cjs"
) {
  failures.push("missing package script check:a15b2:manual-authenticated-admin-heritage-ui-smoke");
}

for (const scriptName of [
  "check:a15a2:modern-vietnamese-genealogy-tree-editor-ui",
  "check:a15a3:vietnamese-heritage-public-tree-view-ui",
  "check:a15a4:vietnamese-heritage-family-list-admin-dashboard-ui",
  "check:a15a5:member-profile-person-detail-vietnamese-heritage-ui",
  "check:a15a6:add-edit-member-form-vietnamese-heritage-ux",
  "check:a15b:authenticated-heritage-ui-browser-smoke",
  "check:a15c:owner-admin-session-permission-smoke-readiness",
  "check:a15b1:authenticated-admin-heritage-ui-browser-smoke-rerun",
  "check:a15c2:supabase-auth-browser-session-binding-diagnostics",
]) {
  if (!packageJson?.scripts?.[scriptName]) failures.push(`${scriptName} was removed`);
}

for (const checker of [
  "scripts/check-a15a2-modern-vietnamese-genealogy-tree-editor-ui.cjs",
  "scripts/check-a15a3-vietnamese-heritage-public-tree-view-ui.cjs",
  "scripts/check-a15a4-vietnamese-heritage-family-list-admin-dashboard-ui.cjs",
  "scripts/check-a15a5-member-profile-person-detail-vietnamese-heritage-ui.cjs",
  "scripts/check-a15a6-add-edit-member-form-vietnamese-heritage-ux.cjs",
  "scripts/check-a15b-authenticated-heritage-ui-browser-smoke.cjs",
  "scripts/check-a15c-owner-admin-session-permission-smoke-readiness.cjs",
  "scripts/check-a15b1-authenticated-admin-heritage-ui-browser-smoke-rerun.cjs",
  "scripts/check-a15c2-supabase-auth-browser-session-binding-diagnostics.cjs",
]) {
  const content = readFile(checker);
  requireIncludes(content, docPath, `${checker} allows A-15B2 doc`);
  requireIncludes(content, checkerPath, `${checker} allows A-15B2 checker`);
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
    failures.push(`possible secret/session/evidence artifact changed ${file}`);
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
  /https?:\/\/(?!localhost|127\.0\.0\.1)/i,
]) {
  rejectPattern(doc, pattern, pattern.toString());
}

if (failures.length > 0) {
  console.error("A-15B2 manual authenticated admin heritage UI smoke check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-15B2 manual authenticated admin heritage UI smoke check passed.");
