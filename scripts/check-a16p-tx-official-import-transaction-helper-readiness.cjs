const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16P_TX_OFFICIAL_IMPORT_TRANSACTION_HELPER_READINESS.md";
const rollbackAuditDocPath = "docs/PLAN_A16P_TX_ROLLBACK_AUDIT_MANIFEST_CONTRACT.md";
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
const checkerPath =
  "scripts/check-a16p-tx-official-import-transaction-helper-readiness.cjs";

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

function normalizeSqlForDestructiveScan(sql) {
  return sql
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");
}

const doc = readFile(docPath);
const rollbackAuditDoc = readFile(rollbackAuditDocPath);
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
  failures.push("db migration and supabase mirror must be byte-for-byte identical");
}

for (const token of [
  "A-16P-TX",
  "A16P_BLOCKED_TRANSACTION_HELPER_MISSING",
  dbMigrationPath,
  supabaseMigrationPath,
  verificationSqlPath,
  "public.a16p_tx_execute_giapha4_official_import",
  "PASS_WITH_BLOCKER_TRANSACTION_NOT_APPLIED",
  "APPROVE_A16P_TX_RPC_MANUAL_SQL_APPLY",
  "APPROVE_A16Q_OFFICIAL_IMPORT_SESSION_EXECUTION",
  "No DB apply",
  "No SQL run",
  "No RPC call",
  "No POST official import call",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "A-16P-TX2",
  "created_people_ids",
  "created_relationship_ids",
  "validation summary",
  "dry-run summary",
  "A16P_TX_AUDIT_TABLE_OR_SERVICE_MISSING",
  "A16P_TX_AUDIT_OR_ROLLBACK_PERSISTENCE_MISSING",
]) {
  requireIncludes(rollbackAuditDoc, token, `rollback/audit doc token ${token}`);
}

for (const token of [
  "A-16P-TX - Official Import Transaction Helper / RPC Schema Readiness",
  "SQL_CANDIDATE_STATUS=NOT_APPLIED",
  "DO_NOT_RUN_AUTOMATICALLY",
  "OWNER_MANUAL_REVIEW_REQUIRED",
  "create or replace function public.a16p_tx_execute_giapha4_official_import",
  "p_dry_run_only boolean default true",
  "security invoker",
  "set search_path = public, pg_temp",
  "public.current_profile_id()",
  "public.has_permission('imports.create')",
  "public.has_permission('people.create')",
  "public.has_permission('relationships.create')",
  "public.has_permission('permissions.manage')",
  "A16P_TX_SCHEMA_INSUFFICIENT_FOR_SAFE_TRANSACTION",
  "A16P_TX_AUDIT_OR_ROLLBACK_PERSISTENCE_MISSING",
  "A16P_TX_AUDIT_TABLE_OR_SERVICE_MISSING",
  "REAL_EXECUTION_BRANCH_NOT_OPEN_IN_A16P_TX",
  "can_run_official_import",
  "pii_printed",
  "revoke execute on function public.a16p_tx_execute_giapha4_official_import",
]) {
  requireIncludes(dbMigration, token, `migration token ${token}`);
}

const migrationNoComments = normalizeSqlForDestructiveScan(dbMigration);
for (const pattern of [
  /\btruncate\b/i,
  /\bdrop\s+table\b/i,
  /\bdelete\s+from\s+public\.(people|families|family_parents|family_children|couple_relationships|tree_layouts?|revisions?|profiles)\b/i,
  /\bupdate\s+public\.(people|families|family_parents|family_children|couple_relationships|tree_layouts?|revisions?|profiles)\b/i,
  /\binsert\s+into\s+public\.(people|families|family_parents|family_children|couple_relationships|tree_layouts?|revisions?|profiles)\b/i,
  /\bdisable\s+row\s+level\s+security\b/i,
  /\bgrant\b[\s\S]{0,100}\b(anon|public)\b/i,
  /\bseed\b/i,
]) {
  rejectPattern(migrationNoComments, pattern, `migration ${pattern}`);
}

for (const token of [
  "SELECT_ONLY_VERIFICATION",
  "DO_NOT_RUN_RPC",
  "DO_NOT_RUN_OFFICIAL_IMPORT",
  "DO_NOT_MUTATE_DB",
  "A16P_TX_FUNCTION_EXISTS",
  "A16P_TX_NO_EXECUTE_FOR_ANON_OR_PUBLIC",
  "A16P_TX_NO_AUTO_IMPORT_TRIGGER",
  "A16P_TX_NO_A16P_POLICY_ON_REAL_TABLES",
  "check_name",
  "status",
  "details",
]) {
  requireIncludes(verificationSql, token, `verification SQL token ${token}`);
}

const verificationNoComments = normalizeSqlForDestructiveScan(verificationSql);
for (const pattern of [
  /\b(insert|update|delete|upsert|truncate|drop|alter|create|grant|revoke)\b/i,
  /a16p_tx_execute_giapha4_official_import\s*\(/i,
]) {
  rejectPattern(verificationNoComments, pattern, `verification SQL ${pattern}`);
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

rejectPattern(service, /\.rpc\s*\(/i, "service must not call RPC in A-16P-TX");

for (const token of [
  "A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED",
  "process.env.A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED === \"true\"",
  "status: \"LOCKED\"",
  "canRunOfficialImport: false",
]) {
  requireIncludes(route, token, `route token ${token}`);
}

for (const token of [
  "Xác nhận nhập chính thức",
  "disabled",
  "aria-disabled=\"true\"",
]) {
  requireIncludes(panel, token, `panel token ${token}`);
}

if (
  packageJson?.scripts?.[
    "check:a16p-tx-official-import-transaction-helper-readiness"
  ] !==
  "node scripts/check-a16p-tx-official-import-transaction-helper-readiness.cjs"
) {
  failures.push("missing package script check:a16p-tx-official-import-transaction-helper-readiness");
}

for (const [content, token, label] of [
  [index, "PLAN_A16P_TX_OFFICIAL_IMPORT_TRANSACTION_HELPER_READINESS.md", "index A-16P-TX readiness entry"],
  [index, "PLAN_A16P_TX_ROLLBACK_AUDIT_MANIFEST_CONTRACT.md", "index rollback/audit entry"],
  [workLog, "A16P_TX_STATUS=PASS_WITH_BLOCKER_TRANSACTION_NOT_APPLIED", "work log A-16P-TX status"],
  [decisionLog, "APPROVE_A16P_TX_RPC_MANUAL_SQL_APPLY", "decision future apply marker"],
  [handoff, "A16P_TX_STATUS=PASS_WITH_BLOCKER_TRANSACTION_NOT_APPLIED", "handoff A-16P-TX status"],
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

const changedFiles = gitOutput(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  rollbackAuditDocPath,
  dbMigrationPath,
  supabaseMigrationPath,
  verificationSqlPath,
  servicePath,
  routePath,
  panelPath,
  checkerPath,
  "package.json",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "scripts/check-a16g-import-session-read-manifest-runtime.cjs",
  "scripts/check-a16h-import-manifest-auth-browser-smoke.cjs",
  "scripts/check-a16i-upload-parse-giapha4-manifest-staging.cjs",
  "scripts/check-a16j-manifest-staging-review-validation-warnings.cjs",
  "scripts/check-a16i2-real-giapha4-upload-smoke.cjs",
  "scripts/check-a16k-owner-approval-gate-dry-run-import.cjs",
  "scripts/check-a16l-dry-run-mapping-preview.cjs",
  "scripts/check-a16sql-rls-import-staging-write.cjs",
  "scripts/check-a16i3-giapha4-xlsx-column-mapping.cjs",
  "scripts/check-a16i4-real-giapha4-staging-upload-run.cjs",
  "scripts/check-a16i5-import-review-pack-official-import-gate.cjs",
  "scripts/check-a16i4u-manual-ui-real-giapha4-staging-upload-verification.cjs",
  "scripts/check-a16m-official-import-transaction-rollback-audit-design.cjs",
  "scripts/check-a16n-locked-official-import-preflight-gate.cjs",
  "scripts/check-a16o-official-import-runtime-readiness-handoff.cjs",
  "scripts/check-a16p-official-import-runtime-candidate.cjs",
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === ".env.local") failures.push(".env.local must not be changed");
  if (file === "PLANNING.MD") failures.push("PLANNING.MD must not be changed");
  if (file !== "package.json" && /\.(xls|xlsx|csv|png|jpg|jpeg|webp|zip|json)$/i.test(file)) {
    failures.push(`real data/storage/screenshot/state file must not be changed ${file}`);
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
  [rollbackAuditDocPath, rollbackAuditDoc],
  [dbMigrationPath, dbMigration],
  [supabaseMigrationPath, supabaseMigration],
  [verificationSqlPath, verificationSql],
  [servicePath, service],
  [routePath, route],
  [checkerPath, checker],
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
  console.error("A-16P-TX official import transaction helper readiness check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16P-TX official import transaction helper readiness check passed.");
