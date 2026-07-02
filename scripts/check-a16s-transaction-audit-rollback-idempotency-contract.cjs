const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const contractDocPath =
  "docs/PLAN_A16S_TRANSACTION_AUDIT_ROLLBACK_IDEMPOTENCY_CONTRACT.md";
const runDocPath = "docs/PLAN_A16S_OFFICIAL_IMPORT_TRANSACTION_EXECUTION_BRANCH.md";
const packagePath = "package.json";
const pTxContractPath = "docs/PLAN_A16P_TX_ROLLBACK_AUDIT_MANIFEST_CONTRACT.md";
const a16tDbMigrationPath =
  "db/migrations/20260702_0014_a16t_official_import_audit_rollback_idempotency_schema_candidate.sql";
const a16tSupabaseMigrationPath =
  "supabase/migrations/20260702_0014_a16t_official_import_audit_rollback_idempotency_schema_candidate.sql";

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

const doc = readFile(contractDocPath);
const runDoc = readFile(runDocPath);
const pTxContract = readFile(pTxContractPath);
const packageJson = readJson(packagePath);
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16S-TRANSACTION-AUDIT-ROLLBACK-IDEMPOTENCY-CONTRACT",
  "A16S_CONTRACT_STATUS=BLOCKED_SCHEMA_AUDIT_ROLLBACK_IDEMPOTENCY_INSUFFICIENT",
  "A16S_CONTRACT_ALL_OR_NOTHING_REQUIRED=YES",
  "A16S_CONTRACT_IDEMPOTENCY_REQUIRED=YES",
  "A16S_CONTRACT_IMPORT_COMPLETION_MARKER_REQUIRED=YES",
  "A16S_CONTRACT_AUDIT_REVISION_REQUIRED=YES",
  "A16S_CONTRACT_ROLLBACK_MANIFEST_REQUIRED=YES",
  "A16S_CONTRACT_POST_IMPORT_VERIFICATION_REQUIRED=YES",
  "created_people_count",
  "created_relationship_count",
  "audit_record_count",
  "rollback_manifest_count",
  "import_session_status",
  "A16S_IDEMPOTENCY_GUARD_STATUS=BLOCKED_SCHEMA_INSUFFICIENT",
  "A16S_AUDIT_REVISION_CONTRACT_STATUS=BLOCKED_SCHEMA_INSUFFICIENT",
  "A16S_ROLLBACK_MANIFEST_CONTRACT_STATUS=BLOCKED_SCHEMA_INSUFFICIENT",
  "A16S_POST_IMPORT_VERIFICATION_CONTRACT_STATUS=DOCUMENTED_BUT_NOT_EXECUTABLE",
  "A16S_CONTRACT_SQL_CANDIDATE_CREATED=NO",
  "A16S_CONTRACT_RPC_CALLED=NO",
  "A16S_CONTRACT_OFFICIAL_IMPORT_POST_CALLED=NO",
  "A16S_CONTRACT_REAL_GENEALOGY_WRITE_STATUS=NO_WRITE",
]) {
  requireIncludes(doc, token, `contract doc token ${token}`);
}

requireIncludes(runDoc, "A16S_STATUS=BLOCKED_SCHEMA_AUDIT_ROLLBACK_IDEMPOTENCY_INSUFFICIENT", "run doc blocked status");
requireIncludes(pTxContract, "A16P_TX_AUDIT_OR_ROLLBACK_PERSISTENCE_MISSING", "A-16P-TX rollback blocker");

if (
  packageJson?.scripts?.["check:a16s-transaction-audit-rollback-idempotency-contract"] !==
  "node scripts/check-a16s-transaction-audit-rollback-idempotency-contract.cjs"
) {
  failures.push("missing package script check:a16s-transaction-audit-rollback-idempotency-contract");
}

for (const [content, token, label] of [
  [index, "PLAN_A16S_TRANSACTION_AUDIT_ROLLBACK_IDEMPOTENCY_CONTRACT.md", "index contract entry"],
  [workLog, "A16S_CONTRACT_STATUS=BLOCKED_SCHEMA_AUDIT_ROLLBACK_IDEMPOTENCY_INSUFFICIENT", "work log contract status"],
  [decisionLog, "Decision 234", "decision log A-16S entry"],
  [handoff, "A16S_CONTRACT_STATUS=BLOCKED_SCHEMA_AUDIT_ROLLBACK_IDEMPOTENCY_INSUFFICIENT", "handoff contract status"],
]) {
  requireIncludes(content, token, label);
}

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

for (const file of changedFiles) {
  if (
    (file.startsWith("db/migrations/") || file.startsWith("supabase/migrations/")) &&
    file !== a16tDbMigrationPath &&
    file !== a16tSupabaseMigrationPath
  ) {
    failures.push(`migration must not change while A-16S is blocked: ${file}`);
  }
  if (file === ".env.local" || file.endsWith(".env.local")) failures.push(".env.local must not change");
  if (/\.(xls|xlsx|csv)$/i.test(file)) failures.push(`spreadsheet/csv must not change ${file}`);
}

if (failures.length > 0) {
  console.error("A-16S audit/rollback/idempotency contract check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16S audit/rollback/idempotency contract check passed.");
