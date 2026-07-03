const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16R_AFTER_A16V_POST_IMPORT_VERIFY.md";
const bundleDocPath = "docs/PLAN_A16R_AFTER_A16V_OFFICIAL_IMPORT_EXECUTION_BUNDLE.md";
const packagePath = "package.json";
const servicePath = "lib/import/giapha4/official-import-service.ts";
const routePath = "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";
const panelPath = "components/imports/import-session-manifest-panel.tsx";

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

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

function rejectPattern(content, pattern, label = String(pattern)) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

const doc = readFile(docPath);
const bundleDoc = readFile(bundleDocPath);
const packageJson = readJson(packagePath);
const service = readFile(servicePath);
const route = readFile(routePath);
const panel = readFile(panelPath);
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16R-AFTER-A16V-POST-IMPORT-VERIFY",
  "A16R_AFTER_A16V_POST_IMPORT_VERIFY_STATUS=NOT_RUN_IMPORT_NOT_CALLED",
  "A16R_AFTER_A16V_BUNDLE_STATUS=BLOCKED_POST_DEPLOY_SMOKE_INSUFFICIENT",
  "A16R_AFTER_A16V_IMPORT_STATUS=NOT_CALLED_BLOCKED",
  "A16R_AFTER_A16V_POST_IMPORT_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "A16R_AFTER_A16V_RUNTIME_CAN_RUN_OFFICIAL_IMPORT=false",
  "A16R_AFTER_A16V_RUNTIME_A16V_SQL_CANDIDATE_STATUS=OWNER_APPLIED_VERIFIED",
  "A16R_AFTER_A16V_RUNTIME_BLOCKER=A16R_BLOCKED_RUNTIME_EXECUTION_NOT_ENABLED_AFTER_A16V_VERIFY",
  "A16R_AFTER_A16V_POST_IMPORT_STAGING_PEOPLE_COUNT=102",
  "A16R_AFTER_A16V_POST_IMPORT_STAGING_RELATIONSHIP_COUNT=134",
  "A16R_AFTER_A16V_POST_IMPORT_VALIDATION_ERROR_COUNT=0",
  "A16R_AFTER_A16V_POST_IMPORT_DRY_RUN_BLOCKER_COUNT=0",
  "A16R_AFTER_A16V_POST_IMPORT_DUPLICATE_UNRESOLVED_COUNT=0",
  "A16R_AFTER_A16V_POST_IMPORT_DUPLICATE_NEEDS_REVIEW_COUNT=0",
  "A16R_AFTER_A16V_POST_IMPORT_DUPLICATE_CREATE_NEW_COUNT=8",
  "A16R_AFTER_A16V_POST_IMPORT_CREATED_PEOPLE_COUNT=0",
  "A16R_AFTER_A16V_POST_IMPORT_CREATED_RELATIONSHIP_COUNT=0",
  "A16R_AFTER_A16V_POST_IMPORT_AUDIT_BATCH_EVIDENCE=NO_IMPORT_NOT_CALLED",
  "A16R_AFTER_A16V_POST_IMPORT_ROLLBACK_MANIFEST_EVIDENCE=NO_IMPORT_NOT_CALLED",
  "A16R_AFTER_A16V_POST_IMPORT_IDEMPOTENCY_EVIDENCE=NO_IMPORT_NOT_CALLED",
  "A16R_AFTER_A16V_POST_IMPORT_COMPLETION_MARKER=NONE_IMPORT_NOT_CALLED",
  "A16R_AFTER_A16V_POST_IMPORT_SECOND_POST_TEST=NOT_RUN_NO_IDEMPOTENCY_RETRY",
  "A16R_AFTER_A16V_POST_IMPORT_ROLLBACK_REQUIRED=NO_IMPORT_NOT_CALLED",
  "A16R_AFTER_A16V_POST_IMPORT_CAN_RUN_OFFICIAL_IMPORT=false",
  "A16R_AFTER_A16V_POST_IMPORT_BUTTON_STATE=DISABLED",
  "A16R_AFTER_A16V_POST_IMPORT_REAL_GENEALOGY_WRITE_STATUS=NO_WRITE",
  "A16R_AFTER_A16V_POST_IMPORT_OFFICIAL_IMPORT_POST_CALLED=NO",
  "A16R_AFTER_A16V_POST_IMPORT_RPC_DIRECT_CALLED=NO",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "A16R_AFTER_A16V_BUNDLE_STATUS=BLOCKED_POST_DEPLOY_SMOKE_INSUFFICIENT",
  "A16R_AFTER_A16V_IMPORT_STATUS=NOT_CALLED_BLOCKED",
  "A16R_AFTER_A16V_OFFICIAL_IMPORT_POST_CALLED=NO",
]) {
  requireIncludes(bundleDoc, token, `bundle doc token ${token}`);
}

if (
  packageJson?.scripts?.["check:a16r-after-a16v-post-import-verify"] !==
  "node scripts/check-a16r-after-a16v-post-import-verify.cjs"
) {
  failures.push("missing package script check:a16r-after-a16v-post-import-verify");
}

for (const [content, token, label] of [
  [index, "PLAN_A16R_AFTER_A16V_POST_IMPORT_VERIFY.md", "index post verify entry"],
  [workLog, "A16R_AFTER_A16V_POST_IMPORT_VERIFY_STATUS=NOT_RUN_IMPORT_NOT_CALLED", "work log post verify status"],
  [decisionLog, "A-16R after A-16V retry stops at source runtime gate", "decision log retry decision"],
  [handoff, "A16R_AFTER_A16V_POST_IMPORT_VERIFY_STATUS=NOT_RUN_IMPORT_NOT_CALLED", "handoff post verify status"],
]) {
  requireIncludes(content, token, label);
}

for (const [content, token, label] of [
  [service, "canRunOfficialImport: false", "service remains fail closed"],
  [route, "getOfficialImportRuntimeCandidate", "official import route remains guarded"],
  [panel, "disabled", "official import button disabled"],
  [panel, "aria-disabled=\"true\"", "official import button aria disabled"],
]) {
  requireIncludes(content, token, label);
}

for (const [label, content] of [
  [servicePath, service],
  [routePath, route],
]) {
  rejectPattern(content, /\.rpc\s*\(/i, `${label} must not directly call RPC`);
  rejectPattern(
    content,
    /\.from\(\s*["'](people|relationships|families|family_parents|family_children|couple_relationships|tree_layouts?|revisions|profiles)["']\s*\)[\s\S]{0,240}\.(insert|update|delete|upsert)\s*\(/i,
    `${label} must not write real genealogy tables`,
  );
}

rejectPattern(doc + bundleDoc + service + route, /SUPABASE_SERVICE_ROLE_KEY\s*=/i, "secret assignment");
rejectPattern(doc + bundleDoc + service + route, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");

const stagedFiles = gitOutput(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (["CHECK_CLOUDFLARE_ACCOUNT.bat", "GUARD.bat", "GIA_PHA_GITHUB_MENU.bat"].includes(file)) {
    failures.push(`forbidden staged outside-scope file ${file}`);
  }
  if (file === ".env.local" || file.endsWith(".env.local")) failures.push(`forbidden staged env file ${file}`);
  if (file.startsWith("supabase/.temp/")) failures.push(`forbidden staged supabase temp ${file}`);
  if (/\.(xls|xlsx|csv)$/i.test(file)) failures.push(`forbidden staged spreadsheet/csv ${file}`);
  if (/^(db\/migrations|supabase\/migrations|db\/checks)\//.test(file)) {
    failures.push(`forbidden staged SQL/check file ${file}`);
  }
}

if (failures.length > 0) {
  console.error("A-16R after A-16V post-import verify check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16R after A-16V post-import verify check passed.");
