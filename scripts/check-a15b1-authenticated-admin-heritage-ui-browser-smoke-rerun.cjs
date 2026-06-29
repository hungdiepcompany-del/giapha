const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];
const marker = "A15B1_AUTHENTICATED_ADMIN_HERITAGE_UI_BROWSER_SMOKE_RERUN";
const docPath =
  "docs/PLAN_A15B1_AUTHENTICATED_ADMIN_HERITAGE_UI_BROWSER_SMOKE_RERUN.md";

const allowedChangedFiles = new Set([
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "docs/PLAN_A15C_OWNER_ADMIN_SESSION_PERMISSION_SMOKE_READINESS.md",
  docPath,
  "docs/PLAN_A15C2_SUPABASE_AUTH_BROWSER_SESSION_BINDING_DIAGNOSTICS.md",
  "docs/PLAN_A15B2_MANUAL_AUTHENTICATED_ADMIN_HERITAGE_UI_SMOKE.md",
  "docs/PLAN_A15E_HERITAGE_UI_PRODUCTION_DEPLOY_READINESS_SMOKE.md",
  "package.json",
  "scripts/check-a15a2-modern-vietnamese-genealogy-tree-editor-ui.cjs",
  "scripts/check-a15a3-vietnamese-heritage-public-tree-view-ui.cjs",
  "scripts/check-a15a4-vietnamese-heritage-family-list-admin-dashboard-ui.cjs",
  "scripts/check-a15a5-member-profile-person-detail-vietnamese-heritage-ui.cjs",
  "scripts/check-a15a6-add-edit-member-form-vietnamese-heritage-ux.cjs",
  "scripts/check-a15b-authenticated-heritage-ui-browser-smoke.cjs",
  "scripts/smoke-a15c-owner-admin-session-permission-readiness.cjs",
  "scripts/check-a15c-owner-admin-session-permission-smoke-readiness.cjs",
  "scripts/check-a15b1-authenticated-admin-heritage-ui-browser-smoke-rerun.cjs",
  "scripts/smoke-a15c2-auth-browser-session-binding-diagnostics.cjs",
  "scripts/check-a15c2-supabase-auth-browser-session-binding-diagnostics.cjs",
  "scripts/check-a15b2-manual-authenticated-admin-heritage-ui-smoke.cjs",
  "scripts/check-a15e-heritage-ui-production-deploy-readiness-smoke.cjs",
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
  "A-15B1 - Authenticated Admin Heritage UI Browser Smoke Rerun",
  marker,
  "A-15C readiness rerun result: `PASS`",
  "OWNER_ADMIN_PERMISSION_READY_READ_ONLY",
  "Verification-Only",
  "Không mutate dữ liệu",
  "Không submit form",
  "Không seed",
  "Không gán role",
  "Browser session result: `FAIL_AUTH_SESSION_NOT_BOUND`",
  "Admin shell result: `FAIL_UNKNOWN_USER_ROLE_PERMISSION_ZERO`",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const route of [
  "/admin",
  "/admin/genealogy",
  "/admin/tree/edit",
  "/admin/people/new",
  "/admin/relationships",
  "/admin/people/[id]",
  "/tree",
]) {
  requireIncludes(doc, route, `route ${route}`);
}

for (const status of ["PASS", "PARTIAL", "SAFE_SKIP", "FAIL"]) {
  requireIncludes(doc, status, `status ${status}`);
}

for (const token of [
  "Quản trị gia phả",
  "Dòng họ của tôi",
  "Gia phả",
  "Thành viên",
  "Thế hệ",
  "Nhánh quan hệ",
  "Người dùng: Không rõ",
  "Vai trò: Chưa có vai trò",
  "Số quyền: 0",
]) {
  requireIncludes(doc, token, `Vietnamese smoke text ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A15B1_AUTHENTICATED_ADMIN_HERITAGE_UI_BROWSER_SMOKE_RERUN.md", "index entry"],
  [workLog, "A-15B1 - Authenticated Admin Heritage UI Browser Smoke Rerun", "work log entry"],
  [handoff, "A-15B1 - Authenticated Admin Heritage UI Browser Smoke Rerun completed", "handoff entry"],
  [decisionLog, "Decision 187 - A-15B1 browser smoke rerun remains verification-only", "decision log entry"],
  [workLog, marker, "work log marker"],
  [handoff, marker, "handoff marker"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a15b1:authenticated-admin-heritage-ui-browser-smoke-rerun"] !==
  "node scripts/check-a15b1-authenticated-admin-heritage-ui-browser-smoke-rerun.cjs"
) {
  failures.push("missing package script check:a15b1:authenticated-admin-heritage-ui-browser-smoke-rerun");
}

for (const scriptName of [
  "check:a15a2:modern-vietnamese-genealogy-tree-editor-ui",
  "check:a15a3:vietnamese-heritage-public-tree-view-ui",
  "check:a15a4:vietnamese-heritage-family-list-admin-dashboard-ui",
  "check:a15a5:member-profile-person-detail-vietnamese-heritage-ui",
  "check:a15a6:add-edit-member-form-vietnamese-heritage-ux",
  "check:a15b:authenticated-heritage-ui-browser-smoke",
  "check:a15c:owner-admin-session-permission-smoke-readiness",
]) {
  if (!packageJson?.scripts?.[scriptName]) {
    failures.push(`${scriptName} was removed`);
  }
}

for (const checker of [
  "scripts/check-a15a2-modern-vietnamese-genealogy-tree-editor-ui.cjs",
  "scripts/check-a15a3-vietnamese-heritage-public-tree-view-ui.cjs",
  "scripts/check-a15a4-vietnamese-heritage-family-list-admin-dashboard-ui.cjs",
  "scripts/check-a15a5-member-profile-person-detail-vietnamese-heritage-ui.cjs",
  "scripts/check-a15a6-add-edit-member-form-vietnamese-heritage-ux.cjs",
  "scripts/check-a15b-authenticated-heritage-ui-browser-smoke.cjs",
]) {
  const content = readFile(checker);
  requireIncludes(content, docPath, `${checker} allows A-15B1 doc`);
  requireIncludes(
    content,
    "scripts/check-a15b1-authenticated-admin-heritage-ui-browser-smoke-rerun.cjs",
    `${checker} allows A-15B1 checker`,
  );
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
  /https?:\/\/(?!localhost|127\.0\.0\.1)/i,
  /phatue|phả\s*tuệ|giad[aạ]iviet|gia\s*phả\s*đại\s*việt/i,
  /\.png|\.jpg|\.jpeg|\.webp|\.svg/i,
]) {
  rejectPattern(doc, pattern, pattern.toString());
}

if (failures.length > 0) {
  console.error("A-15B1 authenticated admin heritage UI browser smoke rerun check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-15B1 authenticated admin heritage UI browser smoke rerun check passed.");
