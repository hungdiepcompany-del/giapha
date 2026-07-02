const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16S_OFFICIAL_IMPORT_TRANSACTION_EXECUTION_BRANCH.md";
const contractDocPath =
  "docs/PLAN_A16S_TRANSACTION_AUDIT_ROLLBACK_IDEMPOTENCY_CONTRACT.md";
const runbookDocPath = "docs/PLAN_A16S_SQL_APPLY_VERIFY_RUNBOOK.md";
const packagePath = "package.json";
const servicePath = "lib/import/giapha4/official-import-service.ts";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const sqlCandidatePath =
  "db/migrations/20260702_0014_a16s_official_import_transaction_execution_branch_candidate.sql";
const supabaseMirrorPath =
  "supabase/migrations/20260702_0014_a16s_official_import_transaction_execution_branch_candidate.sql";

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
const contractDoc = readFile(contractDocPath);
const runbookDoc = readFile(runbookDocPath);
const packageJson = readJson(packagePath);
const service = readFile(servicePath);
const panel = readFile(panelPath);
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16S-OFFICIAL-IMPORT-TRANSACTION-EXECUTION-BRANCH",
  "A16S_STATUS=BLOCKED_SCHEMA_AUDIT_ROLLBACK_IDEMPOTENCY_INSUFFICIENT",
  "A16S_SQL_CANDIDATE_CREATED=NO",
  "A16S_SQL_CANDIDATE_PATH=NOT_CREATED_BECAUSE_BLOCKED_SCHEMA_AUDIT_ROLLBACK_IDEMPOTENCY_INSUFFICIENT",
  "A16S_SUPABASE_MIRROR_PATH=NOT_CREATED_BECAUSE_BLOCKED_SCHEMA_AUDIT_ROLLBACK_IDEMPOTENCY_INSUFFICIENT",
  "A16S_SQL_MIRROR_BYTE_FOR_BYTE=N/A_SAFE_BLOCKED_NO_SQL_CANDIDATE",
  "A16S_RUNTIME_FAIL_CLOSED=YES",
  "A16S_CAN_RUN_OFFICIAL_IMPORT=false",
  "A16S_OFFICIAL_IMPORT_BUTTON=DISABLED",
  "A16S_RPC_CALLED=NO",
  "A16S_OFFICIAL_IMPORT_POST_CALLED=NO",
  "A16S_REAL_GENEALOGY_WRITE_STATUS=NO_WRITE",
  "A16S_BLOCKED_SCHEMA_AUDIT_ROLLBACK_IDEMPOTENCY_INSUFFICIENT",
  "REAL_EXECUTION_BRANCH_NOT_OPEN_IN_A16P_TX",
  "A16S_DB_PUSH_STATUS=NOT_RUN",
  "A16S_MIGRATION_REPAIR_STATUS=NOT_RUN",
  "A16S_SEED_STATUS=NOT_RUN",
  "A16S_SQL_RUN_STATUS=NOT_RUN",
  "A16S_DEPLOY_STATUS=NOT_DEPLOYED",
  "A16S_PUSH_STATUS=NOT_PUSHED",
  "A16S_SERVICE_ROLE_CLIENT_SIDE_STATUS=NOT_USED",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "A16S_CONTRACT_STATUS=BLOCKED_SCHEMA_AUDIT_ROLLBACK_IDEMPOTENCY_INSUFFICIENT",
  "A16S_SQL_APPLY_VERIFY_STATUS=SAFE_BLOCKED_NO_SQL_CANDIDATE",
]) {
  requireIncludes(contractDoc + runbookDoc, token, `paired doc token ${token}`);
}

if (fs.existsSync(path.join(root, sqlCandidatePath))) {
  failures.push(`SQL candidate must not exist while blocked: ${sqlCandidatePath}`);
}
if (fs.existsSync(path.join(root, supabaseMirrorPath))) {
  failures.push(`Supabase mirror must not exist while blocked: ${supabaseMirrorPath}`);
}

if (
  packageJson?.scripts?.["check:a16s-official-import-transaction-execution-branch"] !==
  "node scripts/check-a16s-official-import-transaction-execution-branch.cjs"
) {
  failures.push("missing package script check:a16s-official-import-transaction-execution-branch");
}

for (const [content, token, label] of [
  [index, "PLAN_A16S_OFFICIAL_IMPORT_TRANSACTION_EXECUTION_BRANCH.md", "index A-16S run entry"],
  [workLog, "A16S_STATUS=BLOCKED_SCHEMA_AUDIT_ROLLBACK_IDEMPOTENCY_INSUFFICIENT", "work log A-16S status"],
  [decisionLog, "Decision 234", "decision log A-16S entry"],
  [handoff, "A16S_STATUS=BLOCKED_SCHEMA_AUDIT_ROLLBACK_IDEMPOTENCY_INSUFFICIENT", "handoff A-16S status"],
]) {
  requireIncludes(content, token, label);
}

for (const token of [
  "A16S_OFFICIAL_IMPORT_TRANSACTION_EXECUTION_BRANCH_MARKER",
  "A16S_SCHEMA_AUDIT_ROLLBACK_IDEMPOTENCY_INSUFFICIENT_BLOCKER",
  "A16S_BLOCKED_SCHEMA_AUDIT_ROLLBACK_IDEMPOTENCY_INSUFFICIENT",
  "status: \"BLOCKED\"",
  "canRunOfficialImport: false",
  "importedPeopleCount: 0",
  "importedRelationshipCount: 0",
]) {
  requireIncludes(service, token, `service token ${token}`);
}

for (const token of ["disabled", "aria-disabled=\"true\""]) {
  requireIncludes(panel, token, `official import button disabled token ${token}`);
}

rejectPattern(service, /\.rpc\s*\(/i, "official import service must not call RPC");
rejectPattern(
  service,
  /\.from\(\s*["'](people|relationships|families|family_parents|family_children|couple_relationships|tree_layouts?|revisions|profiles)["']\s*\)[\s\S]{0,240}\.(insert|update|delete|upsert)\s*\(/i,
  "official import service must not write real genealogy tables",
);
rejectPattern(service, /SUPABASE_SERVICE_ROLE_KEY|service_role/i, "no service role in official import service");

for (const [relativePath, content] of [
  [
    "scripts/check-a16s-official-import-transaction-execution-branch.cjs",
    readFile("scripts/check-a16s-official-import-transaction-execution-branch.cjs"),
  ],
  [
    "scripts/check-a16s-transaction-audit-rollback-idempotency-contract.cjs",
    readFile("scripts/check-a16s-transaction-audit-rollback-idempotency-contract.cjs"),
  ],
  [
    "scripts/check-a16s-sql-apply-verify-runbook.cjs",
    readFile("scripts/check-a16s-sql-apply-verify-runbook.cjs"),
  ],
]) {
  rejectPattern(content, /\.rpc\s*\(/i, `${relativePath} must not call RPC`);
  rejectPattern(content, /fetch\s*\([\s\S]{0,240}official-import/i, `${relativePath} must not POST official import`);
  rejectPattern(content, /supabase\s+db\s+push/i, `${relativePath} must not run db push`);
}

const changedFiles = gitOutput(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  contractDocPath,
  runbookDocPath,
  "scripts/check-a16s-official-import-transaction-execution-branch.cjs",
  "scripts/check-a16s-transaction-audit-rollback-idempotency-contract.cjs",
  "scripts/check-a16s-sql-apply-verify-runbook.cjs",
  packagePath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  servicePath,
  "scripts/check-a16r-run-official-import.cjs",
  "scripts/check-a16r-post-import-verification.cjs",
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === ".env.local" || file.endsWith(".env.local")) failures.push(".env.local must not change");
  if (file.startsWith("db/migrations/") || file.startsWith("supabase/migrations/")) {
    failures.push(`migration must not change while A-16S is blocked: ${file}`);
  }
  if (file.startsWith("db/checks/")) failures.push(`SQL check must not change ${file}`);
  if (file.startsWith("supabase/.temp/")) failures.push(`supabase temp must not change ${file}`);
  if (/\.(xls|xlsx|csv)$/i.test(file)) failures.push(`spreadsheet/csv must not change ${file}`);
}

const stagedFiles = gitOutput(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (/\.(xls|xlsx|csv)$/i.test(file)) failures.push(`staged data file ${file}`);
}

if (failures.length > 0) {
  console.error("A-16S transaction execution branch check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16S transaction execution branch check passed.");
