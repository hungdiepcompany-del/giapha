const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16R_RUN_RETRY_OFFICIAL_IMPORT_BUNDLE.md";
const postVerifyDocPath = "docs/PLAN_A16R_RUN_RETRY_POST_IMPORT_VERIFY.md";
const servicePath = "lib/import/giapha4/official-import-service.ts";
const routePath = "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const packagePath = "package.json";

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
const postVerifyDoc = readFile(postVerifyDocPath);
const service = readFile(servicePath);
const route = readFile(routePath);
const panel = readFile(panelPath);
const packageJson = readJson(packagePath);
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16R-RUN-RETRY-OFFICIAL-IMPORT-BUNDLE",
  "A16R_RUN_RETRY_BUNDLE_STATUS=BLOCKED_AT_EXECUTION_GATE",
  "A16R_RUN_RETRY_STATUS=BLOCKED_TRANSACTION_BRANCH_NOT_READY",
  "A16R_RUN_RETRY_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "A16R_RUN_RETRY_APPROVAL_MARKER_MATCHED=YES",
  "A16R_RUN_RETRY_STAGING_PEOPLE=102",
  "A16R_RUN_RETRY_STAGING_RELATIONSHIPS=134",
  "A16R_RUN_RETRY_VALIDATION_ERRORS=0",
  "A16R_RUN_RETRY_DRY_RUN_BLOCKERS=0",
  "A16R_RUN_RETRY_DUPLICATE_UNRESOLVED=0",
  "A16R_RUN_RETRY_DUPLICATE_NEEDS_REVIEW=0",
  "A16R_RUN_RETRY_DUPLICATE_CREATE_NEW=8",
  "A16R_RUN_RETRY_A16T_APPLY_VERIFY_PASS=YES",
  "A16R_RUN_RETRY_A16U_LOCKED_BRANCH_READY=YES",
  "A16R_RUN_RETRY_PRODUCTION_UI_VISIBLE=YES",
  "A16R_RUN_RETRY_EXECUTION_GATE_STATUS=BLOCKED",
  "A16R_RUN_RETRY_SERVICE_STATUS=BLOCKED",
  "A16R_RUN_RETRY_CAN_RUN_OFFICIAL_IMPORT=false",
  "A16R_RUN_RETRY_TRANSACTION_STATUS=A16U_LOCKED_TRANSACTION_BRANCH_READY_NOT_EXECUTED",
  "A16R_RUN_RETRY_RUNTIME_GUARD=A16U_LOCKED_RUNTIME_GUARD_A16R_RETRY_REQUIRED",
  "A16R_RUN_RETRY_OFFICIAL_IMPORT_EXECUTION_STATUS=NOT_RUN_EXECUTION_GATE_BLOCKED",
  "A16R_RUN_RETRY_OFFICIAL_IMPORT_POST_CALLED=NO",
  "A16R_RUN_RETRY_OFFICIAL_IMPORT_POST_CALLED_EXACTLY_ONCE=NO_NOT_CALLED",
  "A16R_RUN_RETRY_RPC_DIRECT_CALLED=NO",
  "A16R_RUN_RETRY_CREATED_PEOPLE_COUNT=0",
  "A16R_RUN_RETRY_CREATED_RELATIONSHIP_COUNT=0",
  "A16R_RUN_RETRY_REAL_GENEALOGY_WRITE_STATUS=NO_WRITE",
  "A16R_RUN_RETRY_OFFICIAL_IMPORT_BATCH_SCHEMA_EVIDENCE=YES_A16T",
  "A16R_RUN_RETRY_OFFICIAL_IMPORT_BATCH_EXECUTION_EVIDENCE=NO_IMPORT_NOT_RUN",
  "A16R_RUN_RETRY_ROLLBACK_MANIFEST_SCHEMA_EVIDENCE=YES_A16T",
  "A16R_RUN_RETRY_ROLLBACK_MANIFEST_EXECUTION_EVIDENCE=NO_IMPORT_NOT_RUN",
  "A16R_RUN_RETRY_IDEMPOTENCY_SCHEMA_EVIDENCE=YES_A16T",
  "A16R_RUN_RETRY_IDEMPOTENCY_EXECUTION_EVIDENCE=NO_IMPORT_NOT_RUN",
  "A16R_RUN_RETRY_OFFICIAL_IMPORT_BUTTON=DISABLED",
  "A16R_RUN_RETRY_DB_PUSH_STATUS=NOT_RUN",
  "A16R_RUN_RETRY_MIGRATION_REPAIR_STATUS=NOT_RUN",
  "A16R_RUN_RETRY_SEED_STATUS=NOT_RUN",
  "A16R_RUN_RETRY_DEPLOY_STATUS=NOT_DEPLOYED",
  "A16R_RUN_RETRY_PUSH_STATUS=NOT_PUSHED",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "A16R_RUN_RETRY_POST_IMPORT_VERIFY_STATUS=NOT_RUN_EXECUTION_GATE_BLOCKED",
  "A16R_RUN_RETRY_POST_IMPORT_CREATED_PEOPLE_COUNT=0",
]) {
  requireIncludes(postVerifyDoc, token, `post verify doc token ${token}`);
}

for (const token of [
  "A16U_LOCKED_RUNTIME_GUARD",
  "A16U_REQUIRED_A16R_RETRY_MARKER",
  "status: \"BLOCKED\"",
  "canRunOfficialImport: false",
  "transactionStatus: \"A16U_LOCKED_TRANSACTION_BRANCH_READY_NOT_EXECUTED\"",
  "importedPeopleCount: 0",
  "importedRelationshipCount: 0",
  "auditBatchContract",
  "rollbackManifestContract",
]) {
  requireIncludes(service, token, `service token ${token}`);
}

for (const token of [
  "A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED",
  "lockedResponse",
  "canRunOfficialImport: false",
  "getOfficialImportRuntimeCandidate",
]) {
  requireIncludes(route, token, `route token ${token}`);
}

for (const token of ["disabled", "aria-disabled=\"true\""]) {
  requireIncludes(panel, token, `official button disabled token ${token}`);
}

if (
  packageJson?.scripts?.["check:a16r-run-retry-official-import-bundle"] !==
  "node scripts/check-a16r-run-retry-official-import-bundle.cjs"
) {
  failures.push("missing package script check:a16r-run-retry-official-import-bundle");
}
if (
  packageJson?.scripts?.["check:a16r-run-retry-post-import-verify"] !==
  "node scripts/check-a16r-run-retry-post-import-verify.cjs"
) {
  failures.push("missing package script check:a16r-run-retry-post-import-verify");
}

for (const [content, token, label] of [
  [index, "PLAN_A16R_RUN_RETRY_OFFICIAL_IMPORT_BUNDLE.md", "index retry bundle entry"],
  [index, "PLAN_A16R_RUN_RETRY_POST_IMPORT_VERIFY.md", "index retry post verify entry"],
  [workLog, "A16R_RUN_RETRY_BUNDLE_STATUS=BLOCKED_AT_EXECUTION_GATE", "work log retry status"],
  [decisionLog, "A-16R retry stops at execution gate", "decision log retry decision"],
  [handoff, "A16R_RUN_RETRY_BUNDLE_STATUS=BLOCKED_AT_EXECUTION_GATE", "handoff retry status"],
]) {
  requireIncludes(content, token, label);
}

for (const [label, content] of [
  [servicePath, service],
  [routePath, route],
]) {
  rejectPattern(content, /\.rpc\s*\(/i, `${label} must not call RPC`);
  rejectPattern(
    content,
    /\.from\(\s*["'](people|relationships|families|family_parents|family_children|couple_relationships|tree_layouts?|revisions|profiles)["']\s*\)[\s\S]{0,240}\.(insert|update|delete|upsert)\s*\(/i,
    `${label} must not write real genealogy tables`,
  );
}

rejectPattern(doc + postVerifyDoc + service + route, /SUPABASE_SERVICE_ROLE_KEY\s*=/i, "secret assignment");
rejectPattern(doc + postVerifyDoc + service + route, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");

const stagedFiles = gitOutput(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (
    file === "CHECK_CLOUDFLARE_ACCOUNT.bat" ||
    file === "GUARD.bat" ||
    file === "GIA_PHA_GITHUB_MENU.bat"
  ) {
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
  console.error("A-16R retry official import bundle check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16R retry official import bundle check passed.");
