const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16R_AFTER_A16V_OFFICIAL_IMPORT_EXECUTION_BUNDLE.md";
const postVerifyDocPath = "docs/PLAN_A16R_AFTER_A16V_POST_IMPORT_VERIFY.md";
const packagePath = "package.json";
const servicePath = "lib/import/giapha4/official-import-service.ts";
const routePath = "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const importPagePath = "app/(admin)/admin/exports/import/page.tsx";
const uploadFormPath = "components/imports/giapha4-manifest-upload-form.tsx";
const cloudflareDeployWorkflowPath = ".github/workflows/cloudflare-deploy.yml";
const buildGateWorkflowPath = ".github/workflows/opennext-build-gate.yml";

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
const packageJson = readJson(packagePath);
const service = readFile(servicePath);
const route = readFile(routePath);
const panel = readFile(panelPath);
const importPage = readFile(importPagePath);
const uploadForm = readFile(uploadFormPath);
const cloudflareDeployWorkflow = readFile(cloudflareDeployWorkflowPath);
const buildGateWorkflow = readFile(buildGateWorkflowPath);
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16R-AFTER-A16V-OFFICIAL-IMPORT-EXECUTION-BUNDLE",
  "A16R_AFTER_A16V_BUNDLE_STATUS=BLOCKED_POST_DEPLOY_SMOKE_INSUFFICIENT",
  "A16R_AFTER_A16V_IMPORT_STATUS=NOT_CALLED_BLOCKED",
  "A16R_AFTER_A16V_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "A16R_AFTER_A16V_APPROVAL_MARKER_MATCHED=YES",
  "APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "A16R_AFTER_A16V_REPO_HYGIENE_STATUS=PASS_CLEAN_NOT_AHEAD",
  "A16R_AFTER_A16V_HEAD=d6fbb7c",
  "A16R_AFTER_A16V_STAGED_FILES=NONE",
  "A16R_AFTER_A16V_DIRTY_OUTSIDE_SCOPE_FILES=NONE",
  "A16R_AFTER_A16V_PUSH_STATUS=PASS_ALREADY_UP_TO_DATE",
  "A16R_AFTER_A16V_DEPLOY_STATUS=PASS_OWNER_CONFIRMED_PRODUCTION_DEPLOYED",
  "workflow_dispatch",
  "OWNER_CONFIRMED_A16V_DEPLOYED_TO_PRODUCTION",
  "A16R_AFTER_A16V_POST_DEPLOY_SMOKE_STATUS=BLOCKED_SOURCE_RUNTIME_GATE_FAIL_CLOSED",
  "/admin/exports/import",
  "GiaPha4ManifestUploadForm",
  "POST /api/admin/import-sessions/upload",
  "POST /api/admin/import-sessions/[sessionId]/official-import",
  "A16R_AFTER_A16V_RUNTIME_SOURCE_STATUS=BLOCKED",
  "A16R_AFTER_A16V_RUNTIME_CAN_RUN_OFFICIAL_IMPORT=false",
  "A16R_AFTER_A16V_RUNTIME_A16V_SQL_CANDIDATE_STATUS=OWNER_APPLIED_VERIFIED",
  "A16R_AFTER_A16V_RUNTIME_BLOCKER=A16R_BLOCKED_RUNTIME_EXECUTION_NOT_ENABLED_AFTER_A16V_VERIFY",
  "A16R_AFTER_A16V_EXECUTION_GATE_STATUS=NOT_REACHED_SOURCE_RUNTIME_GATE_BLOCKED",
  "A16T_APPLY_VERIFY_STATUS=PASS_OWNER_APPLIED_AND_VERIFIED",
  "A16U_STATUS=A16U_LOCKED_TRANSACTION_BRANCH_READY_NOT_EXECUTED",
  "A16V_APPLY_VERIFY_STATUS=PASS_OWNER_APPLIED_AND_VERIFIED",
  "A16V_REAL_TRANSACTION_BRANCH_READY=YES",
  "A16R_RETRY_ALLOWED_AFTER_A16V=YES",
  "A16R_AFTER_A16V_A16T_APPLY_VERIFY_PASS=YES",
  "A16R_AFTER_A16V_A16U_LOCKED_BRANCH_READY=YES",
  "A16R_AFTER_A16V_A16V_APPLY_VERIFY_PASS=YES",
  "A16R_AFTER_A16V_A16V_REAL_TRANSACTION_BRANCH_READY=YES",
  "A16R_AFTER_A16V_STAGING_PEOPLE=102",
  "A16R_AFTER_A16V_STAGING_RELATIONSHIPS=134",
  "A16R_AFTER_A16V_VALIDATION_ERRORS=0",
  "A16R_AFTER_A16V_DRY_RUN_BLOCKERS=0",
  "A16R_AFTER_A16V_DUPLICATE_UNRESOLVED=0",
  "A16R_AFTER_A16V_DUPLICATE_NEEDS_REVIEW=0",
  "A16R_AFTER_A16V_DUPLICATE_CREATE_NEW=8",
  "A16R_AFTER_A16V_OFFICIAL_IMPORT_POST_CALLED=NO",
  "A16R_AFTER_A16V_OFFICIAL_IMPORT_POST_CALLED_EXACTLY_ONCE=NO_NOT_CALLED",
  "A16R_AFTER_A16V_RPC_DIRECT_CALLED=NO",
  "A16R_AFTER_A16V_CREATED_PEOPLE_COUNT=0",
  "A16R_AFTER_A16V_CREATED_RELATIONSHIP_COUNT=0",
  "A16R_AFTER_A16V_REAL_GENEALOGY_WRITE_STATUS=NO_WRITE",
  "A16R_AFTER_A16V_OFFICIAL_IMPORT_BATCH_EVIDENCE=NO_NEW_EXECUTION_EVIDENCE_IMPORT_NOT_CALLED",
  "A16R_AFTER_A16V_ROLLBACK_MANIFEST_EVIDENCE=NO_NEW_EXECUTION_EVIDENCE_IMPORT_NOT_CALLED",
  "A16R_AFTER_A16V_IDEMPOTENCY_EVIDENCE=NO_NEW_EXECUTION_EVIDENCE_IMPORT_NOT_CALLED",
  "A16R_AFTER_A16V_CAN_RUN_OFFICIAL_IMPORT=false",
  "A16R_AFTER_A16V_OFFICIAL_IMPORT_BUTTON=DISABLED",
  "A16R_AFTER_A16V_SQL_STATUS=NOT_RUN",
  "A16R_AFTER_A16V_DB_PUSH_STATUS=NOT_RUN",
  "A16R_AFTER_A16V_MIGRATION_REPAIR_STATUS=NOT_RUN",
  "A16R_AFTER_A16V_SEED_STATUS=NOT_RUN",
  "A16R_AFTER_A16V_DEPLOY_COMMAND_STATUS=NOT_RUN",
  "A16R_AFTER_A16V_PUSH_COMMAND_STATUS=NOT_RUN",
  "A16R_AFTER_A16V_NO_BLIND_RETRY=YES",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "A16R_AFTER_A16V_POST_IMPORT_VERIFY_STATUS=NOT_RUN_IMPORT_NOT_CALLED",
  "A16R_AFTER_A16V_IMPORT_STATUS=NOT_CALLED_BLOCKED",
]) {
  requireIncludes(postVerifyDoc, token, `post verify doc token ${token}`);
}

if (
  packageJson?.scripts?.["check:a16r-after-a16v-official-import-execution-bundle"] !==
  "node scripts/check-a16r-after-a16v-official-import-execution-bundle.cjs"
) {
  failures.push("missing package script check:a16r-after-a16v-official-import-execution-bundle");
}
if (
  packageJson?.scripts?.["check:a16r-after-a16v-post-import-verify"] !==
  "node scripts/check-a16r-after-a16v-post-import-verify.cjs"
) {
  failures.push("missing package script check:a16r-after-a16v-post-import-verify");
}

for (const [content, token, label] of [
  [index, "PLAN_A16R_AFTER_A16V_OFFICIAL_IMPORT_EXECUTION_BUNDLE.md", "index bundle entry"],
  [index, "PLAN_A16R_AFTER_A16V_POST_IMPORT_VERIFY.md", "index post verify entry"],
  [workLog, "A16R_AFTER_A16V_BUNDLE_STATUS=BLOCKED_PRODUCTION_DEPLOY_EVIDENCE_MISSING", "work log bundle status"],
  [workLog, "A16R_AFTER_A16V_BUNDLE_STATUS=BLOCKED_POST_DEPLOY_SMOKE_INSUFFICIENT", "work log retry status"],
  [decisionLog, "A-16R after A-16V retry stops at source runtime gate", "decision log retry decision"],
  [handoff, "A16R_AFTER_A16V_BUNDLE_STATUS=BLOCKED_POST_DEPLOY_SMOKE_INSUFFICIENT", "handoff retry status"],
]) {
  requireIncludes(content, token, label);
}

for (const [content, token, label] of [
  [importPage, "GiaPha4ManifestUploadForm", "admin import page upload form"],
  [uploadForm, "/api/admin/import-sessions/upload", "staging upload endpoint"],
  [service, "canRunOfficialImport: false", "service remains fail closed"],
  [service, "A16R_BLOCKED_RUNTIME_EXECUTION_NOT_ENABLED_AFTER_A16V_VERIFY", "A-16R runtime execution blocker remains explicit"],
  [service, "sqlCandidateStatus: \"OWNER_APPLIED_VERIFIED\"", "A-16V source branch owner verified in runtime evidence"],
  [service, "verificationEvidenceSource: \"docs/PLAN_A16V_APPLY_VERIFY.md\"", "A-16V runtime evidence source"],
  [route, "getOfficialImportRuntimeCandidate", "official import route remains guarded"],
  [panel, "disabled", "official import button disabled"],
  [panel, "aria-disabled=\"true\"", "official import button aria disabled"],
  [cloudflareDeployWorkflow, "workflow_dispatch", "manual deploy workflow"],
  [cloudflareDeployWorkflow, "npm run deploy", "existing deploy command"],
  [buildGateWorkflow, "push:", "build gate push trigger"],
  [buildGateWorkflow, "npx opennextjs-cloudflare build", "build gate only"],
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

rejectPattern(doc + postVerifyDoc + service + route, /SUPABASE_SERVICE_ROLE_KEY\s*=/i, "secret assignment");
rejectPattern(doc + postVerifyDoc + service + route, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");

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
  console.error("A-16R after A-16V official import execution bundle check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16R after A-16V official import execution bundle check passed.");
