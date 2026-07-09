const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16V_APPLY_VERIFY.md";
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
const a16ah = read("docs/PLAN_A16AH_OFFICIAL_IMPORT_RUNTIME_EXECUTION_BRANCH_CANDIDATE.md");
const panel = read(panelPath);
const packageJson = JSON.parse(read("package.json") || "{}");
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A16V_APPLY_VERIFY_STATUS=PASS_OWNER_APPLIED_AND_VERIFIED",
  "A16V_REAL_TRANSACTION_BRANCH_READY=YES",
  "A16R_RETRY_ALLOWED_AFTER_A16V=YES",
  "db/migrations/20260703_0016_a16v_official_import_real_transaction_execution_branch_candidate.sql",
  "db/migrations/20260703_0017_a16v_marker_verification_fix_candidate.sql",
  "db/checks/20260703_check_a16v_official_import_real_transaction_execution_branch.sql",
  "Raw owner verification output",
  "Codex did not run SQL",
  "did not call RPC",
  "did not call `POST /official-import`",
  "did not write people/relationships/families/layout/tree/revision/profile data",
  "did not deploy and did not push",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const checkName of [
  "A16V marker",
  "all or nothing batch",
  "completed batch branch",
  "people insert branch",
  "family insert branch",
  "family parents insert branch",
  "family children insert branch",
  "revision audit branch",
  "rollback manifest",
  "idempotency guard",
  "idempotency unique guard exists",
  "rollback unique guard exists",
  "no anon/public execute grants",
  "no auto import trigger",
  "not security definer",
  "fixed search_path public pg_temp",
  "official_import_batches exists",
  "official_import_rollback_manifests exists",
]) {
  requireIncludes(
    doc,
    `A16V_REAL_TRANSACTION_BRANCH_VERIFY,${checkName},PASS`,
    `raw PASS evidence ${checkName}`,
  );
}

rejectPattern(doc, /A16V_REAL_TRANSACTION_BRANCH_VERIFY,[^,\n]+,FAIL/i, "FAIL evidence must not be present");

if (
  packageJson.scripts?.["check:a16v-apply-verify"] !==
  "node scripts/check-a16v-apply-verify.cjs"
) {
  failures.push("missing package script check:a16v-apply-verify");
}

for (const [content, token, label] of [
  [index, "PLAN_A16V_APPLY_VERIFY.md", "index A-16V apply verify entry"],
  [workLog, "A16V_APPLY_VERIFY_STATUS=PASS_OWNER_APPLIED_AND_VERIFIED", "work log A-16V apply status"],
  [decisionLog, "A-16V apply verification PASS", "decision log A-16V apply"],
  [handoff, "A16V_APPLY_VERIFY_STATUS=PASS_OWNER_APPLIED_AND_VERIFIED", "handoff A-16V apply status"],
]) {
  requireIncludes(content, token, label);
}

if (/\.rpc\s*\(/i.test(service + route)) {
  requireIncludes(
    a16ah,
    "A16AH_STATUS=PASS_SOURCE_BRANCH_CANDIDATE_NOT_EXECUTED",
    "A-16AH source branch candidate evidence for later runtime RPC branch",
  );
  requireIncludes(
    service,
    "if (!candidate.canRunOfficialImport || params.executionBranchEnabled !== true)",
    "A-16AH same-run gate before executor",
  );
  requireIncludes(
    route,
    "process.env.A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED === \"true\"",
    "A-16AH route execution branch env gate",
  );
}
rejectPattern(route, /fetch\s*\([^)]*official-import/i, "runtime must not client POST official import");
requireIncludes(service, "const canRunOfficialImport = reasons.length === 0", "runtime canRunOfficialImport candidate gate");
requireIncludes(panel, "disabled", "official import button disabled");
requireIncludes(panel, "aria-disabled=\"true\"", "official import aria disabled");

rejectPattern(doc + service + route, /SUPABASE_SERVICE_ROLE_KEY\s*=/i, "secret assignment");
rejectPattern(doc + service + route, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");

const stagedFiles = git(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (["CHECK_CLOUDFLARE_ACCOUNT.bat", "GUARD.bat", "GIA_PHA_GITHUB_MENU.bat"].includes(file)) {
    failures.push(`forbidden staged outside-scope file ${file}`);
  }
  if (file === ".env.local" || file.endsWith(".env.local")) failures.push(".env.local must not be staged");
  if (file.startsWith("supabase/.temp/")) failures.push(`supabase temp staged ${file}`);
  if (/\.(xls|xlsx|csv)$/i.test(file)) failures.push(`data file staged ${file}`);
}

if (failures.length > 0) {
  console.error("A-16V apply verification check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16V apply verification check passed.");
