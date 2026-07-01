const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16P_TX_APPLY_VERIFY.md";
const readinessDocPath =
  "docs/PLAN_A16P_TX_OFFICIAL_IMPORT_TRANSACTION_HELPER_READINESS.md";
const dbMigrationPath =
  "db/migrations/20260701_0012_a16p_tx_official_import_transaction_helper_candidate.sql";
const supabaseMigrationPath =
  "supabase/migrations/20260701_0012_a16p_tx_official_import_transaction_helper_candidate.sql";
const verificationSqlPath =
  "db/checks/20260701_check_a16p_tx_official_import_transaction_helper.sql";
const servicePath = "lib/import/giapha4/official-import-service.ts";
const routePath =
  "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const checkerPath = "scripts/check-a16p-tx-apply-verify.cjs";

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
const readinessDoc = readFile(readinessDocPath);
const dbMigration = readFile(dbMigrationPath);
const supabaseMigration = readFile(supabaseMigrationPath);
const verificationSql = readFile(verificationSqlPath);
const service = readFile(servicePath);
const route = readFile(routePath);
const panel = readFile(panelPath);
const checker = readFile(checkerPath);
const packageJson = readJson("package.json");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

if (dbMigration !== supabaseMigration) {
  failures.push("db migration and supabase mirror must remain byte-for-byte identical");
}

for (const token of [
  "A-16P-TX-APPLY-VERIFY",
  "A16P_TX_APPLY_VERIFY_STATUS=PASS_OWNER_CONFIRMED",
  "Owner manual apply PASS",
  "Verification PASS",
  "public.a16p_tx_execute_giapha4_official_import",
  "Function comment",
  "NOT_APPLIED",
  "RPC exists but fail-closed",
  "Official import still locked",
  "canRunOfficialImport=false",
  "UI button disabled",
  "No RPC call",
  "No POST official import call",
  "No real genealogy writes",
  "No SQL run",
  "No DB push",
  "No migration repair",
  "No seed",
  "A-16Q Session-specific Official Import Execution Approval",
  "APPROVE_A16Q_OFFICIAL_IMPORT_SESSION_EXECUTION",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "Function `public.a16p_tx_execute_giapha4_official_import` exists",
  "not `SECURITY DEFINER`",
  "search_path=public, pg_temp",
  "No `EXECUTE` for `anon` or `public`",
  "Function fails closed",
  "No A-16P policy on real tables",
  "No auto import trigger",
]) {
  requireIncludes(doc, token, `verification evidence ${token}`);
}

for (const token of [
  "A16P_TX_STATUS=PASS_WITH_BLOCKER_TRANSACTION_NOT_APPLIED",
  "APPROVE_A16P_TX_RPC_MANUAL_SQL_APPLY",
  "APPROVE_A16Q_OFFICIAL_IMPORT_SESSION_EXECUTION",
]) {
  requireIncludes(readinessDoc, token, `readiness doc token ${token}`);
}

for (const token of [
  "SELECT_ONLY_VERIFICATION",
  "DO_NOT_RUN_RPC",
  "DO_NOT_RUN_OFFICIAL_IMPORT",
  "DO_NOT_MUTATE_DB",
  "A16P_TX_FUNCTION_EXISTS",
  "A16P_TX_FUNCTION_IS_NOT_SECURITY_DEFINER",
  "A16P_TX_FUNCTION_HAS_FIXED_SEARCH_PATH",
  "A16P_TX_NO_EXECUTE_FOR_ANON_OR_PUBLIC",
  "A16P_TX_FUNCTION_FAILS_CLOSED",
  "A16P_TX_NO_A16P_POLICY_ON_REAL_TABLES",
  "A16P_TX_NO_AUTO_IMPORT_TRIGGER",
]) {
  requireIncludes(verificationSql, token, `verification SQL token ${token}`);
}

for (const token of [
  "A16P_TX_TRANSACTION_RPC_NAME",
  "public.a16p_tx_execute_giapha4_official_import",
  "BLOCKED_TRANSACTION_HELPER_NOT_APPLIED",
  "canRunOfficialImport: false",
  "transactionStatus: \"BLOCKED_TRANSACTION_HELPER_NOT_APPLIED\"",
]) {
  requireIncludes(service, token, `service token ${token}`);
}

rejectPattern(service, /\.rpc\s*\(/i, "service must not call RPC");

for (const token of [
  "A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED",
  "process.env.A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED === \"true\"",
  "status: \"LOCKED\"",
  "canRunOfficialImport: false",
]) {
  requireIncludes(route, token, `route token ${token}`);
}

for (const token of ["disabled", "aria-disabled=\"true\""]) {
  requireIncludes(panel, token, `panel token ${token}`);
}

if (
  packageJson?.scripts?.["check:a16p-tx-apply-verify"] !==
  "node scripts/check-a16p-tx-apply-verify.cjs"
) {
  failures.push("missing package script check:a16p-tx-apply-verify");
}

for (const [content, token, label] of [
  [index, "PLAN_A16P_TX_APPLY_VERIFY.md", "index apply-verify entry"],
  [workLog, "A16P_TX_APPLY_VERIFY_STATUS=PASS_OWNER_CONFIRMED", "work log status"],
  [decisionLog, "Decision 219", "decision log entry"],
  [handoff, "A16P_TX_APPLY_VERIFY_STATUS=PASS_OWNER_CONFIRMED", "handoff status"],
]) {
  requireIncludes(content, token, label);
}

const scriptFiles = gitOutput(["ls-files", "scripts"])
  .split(/\r?\n/)
  .filter(Boolean)
  .filter((file) => !path.basename(file).startsWith("check-"));

for (const file of scriptFiles) {
  const content = readFile(file);
  for (const pattern of [
    /fetch\([^)]*official-import(?!-gate)/i,
    /curl[\s\S]{0,160}official-import(?!-gate)/i,
    /method\s*:\s*["']POST["'][\s\S]{0,240}official-import(?!-gate)/i,
    /\.rpc\s*\(\s*["']a16p_tx_execute_giapha4_official_import["']/i,
  ]) {
    rejectPattern(content, pattern, `${file} must not call official import POST/RPC ${pattern}`);
  }
}

const allowedChangedFiles = new Set([
  docPath,
  checkerPath,
  "package.json",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "scripts/check-a16p-tx-official-import-transaction-helper-readiness.cjs",
]);

const changedFiles = gitOutput(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === ".env.local") failures.push(".env.local must not be changed");
  if (file === "PLANNING.MD") failures.push("PLANNING.MD must not be changed");
  if (file !== "package.json" && /\.(xls|xlsx|csv|png|jpg|jpeg|webp|zip|json)$/i.test(file)) {
    failures.push(`real data/storage/screenshot/state file must not be changed ${file}`);
  }
  if (file.startsWith("db/migrations/") || file.startsWith("supabase/migrations/")) {
    failures.push(`SQL migration file must not change in apply-verify record phase ${file}`);
  }
  if (file.startsWith("db/checks/")) {
    failures.push(`verification SQL file must not change in apply-verify record phase ${file}`);
  }
  if (file.startsWith("app/") || file.startsWith("lib/") || file.startsWith("components/")) {
    failures.push(`runtime/UI behavior file must not change ${file}`);
  }
}

for (const file of gitOutput(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean)) {
  if (file !== "package.json" && /\.(xls|xlsx|csv|png|jpg|jpeg|webp|zip|json)$/i.test(file)) {
    failures.push(`staged real data/storage/screenshot/state file not allowed ${file}`);
  }
}

for (const [file, content] of [
  [docPath, doc],
  [checkerPath, checker],
  [readinessDocPath, readinessDoc],
  [servicePath, service],
  [routePath, route],
]) {
  for (const pattern of [
    /sb_(secret|service)_[A-Za-z0-9_-]{12,}/,
    /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/,
    /Bearer\s+[A-Za-z0-9._-]{12,}/,
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    /postgresql:\/\/[^`\s]+/i,
  ]) {
    rejectPattern(content, pattern, `${file} ${pattern}`);
  }
}

if (failures.length > 0) {
  console.error("A-16P-TX apply verify check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16P-TX apply verify check passed.");
