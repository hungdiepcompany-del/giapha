const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const runbookDocPath = "docs/PLAN_A16S_SQL_APPLY_VERIFY_RUNBOOK.md";
const runDocPath = "docs/PLAN_A16S_OFFICIAL_IMPORT_TRANSACTION_EXECUTION_BRANCH.md";
const packagePath = "package.json";
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

const doc = readFile(runbookDocPath);
const runDoc = readFile(runDocPath);
const packageJson = readJson(packagePath);
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16S-SQL-APPLY-VERIFY-RUNBOOK",
  "A16S_SQL_APPLY_VERIFY_STATUS=SAFE_BLOCKED_NO_SQL_CANDIDATE",
  "A16S_SQL_CANDIDATE_CREATED=NO",
  "A16S_SQL_CANDIDATE_PATH=NOT_CREATED_BECAUSE_BLOCKED_SCHEMA_AUDIT_ROLLBACK_IDEMPOTENCY_INSUFFICIENT",
  "A16S_SUPABASE_MIRROR_PATH=NOT_CREATED_BECAUSE_BLOCKED_SCHEMA_AUDIT_ROLLBACK_IDEMPOTENCY_INSUFFICIENT",
  "A16S_SQL_MIRROR_BYTE_FOR_BYTE=N/A_SAFE_BLOCKED_NO_SQL_CANDIDATE",
  "A16S_SQL_APPLY_STATUS=NOT_RUN",
  "A16S_SQL_VERIFY_STATUS=NOT_RUN_NO_SQL_CANDIDATE",
  "no anon/public execute grant",
  "no broad grant",
  "no RLS disable",
  "A16S_SQL_RUN_STATUS=NOT_RUN",
  "A16S_DB_PUSH_STATUS=NOT_RUN",
  "A16S_MIGRATION_REPAIR_STATUS=NOT_RUN",
  "A16S_SEED_STATUS=NOT_RUN",
  "A16S_RPC_CALLED=NO",
  "A16S_OFFICIAL_IMPORT_POST_CALLED=NO",
  "A16S_REAL_GENEALOGY_WRITE_STATUS=NO_WRITE",
]) {
  requireIncludes(doc, token, `runbook token ${token}`);
}

requireIncludes(runDoc, "A16S_STATUS=BLOCKED_SCHEMA_AUDIT_ROLLBACK_IDEMPOTENCY_INSUFFICIENT", "run doc blocked status");

if (fs.existsSync(path.join(root, sqlCandidatePath))) {
  failures.push(`SQL candidate must not exist while blocked: ${sqlCandidatePath}`);
}
if (fs.existsSync(path.join(root, supabaseMirrorPath))) {
  failures.push(`Supabase mirror must not exist while blocked: ${supabaseMirrorPath}`);
}

if (
  packageJson?.scripts?.["check:a16s-sql-apply-verify-runbook"] !==
  "node scripts/check-a16s-sql-apply-verify-runbook.cjs"
) {
  failures.push("missing package script check:a16s-sql-apply-verify-runbook");
}

for (const [content, token, label] of [
  [index, "PLAN_A16S_SQL_APPLY_VERIFY_RUNBOOK.md", "index runbook entry"],
  [workLog, "A16S_SQL_APPLY_VERIFY_STATUS=SAFE_BLOCKED_NO_SQL_CANDIDATE", "work log SQL runbook status"],
  [decisionLog, "Decision 234", "decision log A-16S entry"],
  [handoff, "A16S_SQL_APPLY_VERIFY_STATUS=SAFE_BLOCKED_NO_SQL_CANDIDATE", "handoff SQL runbook status"],
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
  if (file.startsWith("db/migrations/") || file.startsWith("supabase/migrations/")) {
    failures.push(`migration must not change while A-16S is blocked: ${file}`);
  }
  if (file === ".env.local" || file.endsWith(".env.local")) failures.push(".env.local must not change");
  if (/\.(xls|xlsx|csv)$/i.test(file)) failures.push(`spreadsheet/csv must not change ${file}`);
}

if (failures.length > 0) {
  console.error("A-16S SQL apply/verify runbook check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16S SQL apply/verify runbook check passed.");
