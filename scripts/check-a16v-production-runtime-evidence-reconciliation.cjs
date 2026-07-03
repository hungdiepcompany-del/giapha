const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16V_PRODUCTION_RUNTIME_EVIDENCE_RECONCILIATION.md";
const servicePath = "lib/import/giapha4/official-import-service.ts";
const routePath = "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";
const panelPath = "components/imports/import-session-manifest-panel.tsx";

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

function rejectPattern(content, pattern, label = String(pattern)) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

function git(args) {
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

const doc = read(docPath);
const service = read(servicePath);
const route = read(routePath);
const panel = read(panelPath);
const packageJson = JSON.parse(read("package.json") || "{}");
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16V-PRODUCTION-RUNTIME-EVIDENCE-RECONCILIATION",
  "A16V_PRODUCTION_RUNTIME_EVIDENCE_RECONCILIATION_STATUS=PASS_RECONCILED_RUNTIME_EVIDENCE_MISMATCH",
  "A16V_PRODUCTION_RUNTIME_ROOT_CAUSE=EVIDENCE_READER_MISMATCH",
  "A16V_PRODUCTION_RUNTIME_A16R_RETRY_ALLOWED=NO",
  "A16V_APPLY_VERIFY_STATUS=PASS_OWNER_APPLIED_AND_VERIFIED",
  "A16V_REAL_TRANSACTION_BRANCH_READY=YES",
  "SQL_NOT_APPLIED=NO_OWNER_EVIDENCE_SAYS_A16V_PASS",
  "STALE_PRODUCTION_SOURCE=NO_LOCAL_SOURCE_MATCHED_THE_BLOCKER_TOO",
  "EVIDENCE_READER_MISMATCH=YES",
  "POST_DEPLOY_SMOKE_MISSING=NO_OWNER_DEPLOY_EVIDENCE_EXISTS",
  "A16V_PRODUCTION_RUNTIME_SOURCE_SQL_CANDIDATE_STATUS=OWNER_APPLIED_VERIFIED",
  "A16V_PRODUCTION_RUNTIME_SOURCE_VERIFICATION_EVIDENCE=docs/PLAN_A16V_APPLY_VERIFY.md",
  "A16V_PRODUCTION_RUNTIME_BLOCKER=A16R_BLOCKED_RUNTIME_EXECUTION_NOT_ENABLED_AFTER_A16V_VERIFY",
  "A16V_PRODUCTION_RUNTIME_CAN_RUN_OFFICIAL_IMPORT=false",
  "confirmA16VApplyVerified",
  "confirmA16VRealTransactionBranchReady",
  "confirmProductionDeployReady",
  "A16V_PRODUCTION_RUNTIME_OFFICIAL_IMPORT_POST_CALLED=NO",
  "A16V_PRODUCTION_RUNTIME_RPC_DIRECT_CALLED=NO",
  "A16V_PRODUCTION_RUNTIME_REAL_GENEALOGY_WRITE=NO",
  "A16V_PRODUCTION_RUNTIME_DEPLOY_RUN=NO",
  "A16V_PRODUCTION_RUNTIME_DB_PUSH_RUN=NO",
  "A16V_PRODUCTION_RUNTIME_MIGRATION_REPAIR_RUN=NO",
  "A16V_PRODUCTION_RUNTIME_SEED_RUN=NO",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "A16R_RUNTIME_EXECUTION_NOT_ENABLED_AFTER_A16V_VERIFY_BLOCKER",
  "A16R_BLOCKED_RUNTIME_EXECUTION_NOT_ENABLED_AFTER_A16V_VERIFY",
  "sqlCandidateStatus: \"OWNER_APPLIED_VERIFIED\"",
  "verificationEvidenceSource: \"docs/PLAN_A16V_APPLY_VERIFY.md\"",
  "canRunOfficialImport: false",
  "status: \"BLOCKED\"",
  "transactionStatus: \"A16V_OWNER_VERIFIED_RUNTIME_STILL_DISABLED\"",
]) {
  requireIncludes(service, token, `service token ${token}`);
}

for (const token of [
  "confirmA16VApplyVerified",
  "confirmA16VRealTransactionBranchReady",
  "confirmProductionDeployReady",
  "getOfficialImportRuntimeCandidate",
  "canRunOfficialImport: false",
]) {
  requireIncludes(route, token, `route token ${token}`);
}

requireIncludes(panel, "disabled", "official import button disabled");
requireIncludes(panel, "aria-disabled=\"true\"", "official import aria disabled");

if (
  packageJson.scripts?.["check:a16v-production-runtime-evidence-reconciliation"] !==
  "node scripts/check-a16v-production-runtime-evidence-reconciliation.cjs"
) {
  failures.push("missing package script check:a16v-production-runtime-evidence-reconciliation");
}

for (const [content, token, label] of [
  [index, "PLAN_A16V_PRODUCTION_RUNTIME_EVIDENCE_RECONCILIATION.md", "index reconciliation entry"],
  [workLog, "A16V_PRODUCTION_RUNTIME_EVIDENCE_RECONCILIATION_STATUS=PASS_RECONCILED_RUNTIME_EVIDENCE_MISMATCH", "work log reconciliation status"],
  [decisionLog, "A-16V production runtime evidence mismatch is reconciled without opening import", "decision log reconciliation decision"],
  [handoff, "A16V_PRODUCTION_RUNTIME_ROOT_CAUSE=EVIDENCE_READER_MISMATCH", "handoff reconciliation root cause"],
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

rejectPattern(doc + service + route, /SUPABASE_SERVICE_ROLE_KEY\s*=/i, "secret assignment");
rejectPattern(doc + service + route, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");

const stagedFiles = git(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (["CHECK_CLOUDFLARE_ACCOUNT.bat", "GUARD.bat", "GIA_PHA_GITHUB_MENU.bat"].includes(file)) {
    failures.push(`forbidden staged outside-scope file ${file}`);
  }
  if (file === ".env.local" || file.endsWith(".env.local")) failures.push(`forbidden staged env file ${file}`);
  if (file.startsWith("supabase/.temp/")) failures.push(`forbidden staged supabase temp ${file}`);
  if (/\.(xls|xlsx|csv)$/i.test(file)) failures.push(`forbidden staged spreadsheet/csv ${file}`);
}

if (failures.length > 0) {
  console.error("A-16V production runtime evidence reconciliation check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16V production runtime evidence reconciliation check passed.");
