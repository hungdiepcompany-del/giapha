const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16T_SCHEMA_APPLY_VERIFY_RUNBOOK.md";
const schemaDocPath = "docs/PLAN_A16T_OFFICIAL_IMPORT_AUDIT_ROLLBACK_IDEMPOTENCY_SCHEMA.md";
const dbMigrationPath =
  "db/migrations/20260702_0014_a16t_official_import_audit_rollback_idempotency_schema_candidate.sql";
const supabaseMigrationPath =
  "supabase/migrations/20260702_0014_a16t_official_import_audit_rollback_idempotency_schema_candidate.sql";
const verifySqlPath =
  "db/checks/20260702_check_a16t_official_import_audit_rollback_idempotency_schema.sql";
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

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

function rejectPattern(content, pattern, label = String(pattern)) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

const doc = readFile(docPath);
const schemaDoc = readFile(schemaDocPath);
const dbMigration = readFile(dbMigrationPath);
const supabaseMigration = readFile(supabaseMigrationPath);
const verifySql = readFile(verifySqlPath);
const packageJson = readJson(packagePath);
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16T-SCHEMA-APPLY-VERIFY-RUNBOOK",
  "A16T_SCHEMA_APPLY_VERIFY_STATUS=READY_FOR_OWNER_REVIEW_NOT_APPLIED",
  dbMigrationPath,
  supabaseMigrationPath,
  "A16T_SQL_MIRROR_BYTE_FOR_BYTE=PASS",
  verifySqlPath,
  "A16T_VERIFICATION_SQL_SELECT_ONLY=YES",
  "A16T_SQL_APPLY_STATUS=NOT_RUN",
  "A16T_SQL_VERIFY_STATUS=NOT_RUN_IN_THIS_PHASE",
  "A16T_SCHEMA_APPLY_DB_PUSH_STATUS=NOT_RUN",
  "A16T_SCHEMA_APPLY_MIGRATION_REPAIR_STATUS=NOT_RUN",
  "A16T_SCHEMA_APPLY_SEED_STATUS=NOT_RUN",
  "A16T_SCHEMA_APPLY_RPC_CALLED=NO",
  "A16T_SCHEMA_APPLY_OFFICIAL_IMPORT_POST_CALLED=NO",
  "A16T_SCHEMA_APPLY_REAL_GENEALOGY_WRITE_STATUS=NO_WRITE",
]) {
  requireIncludes(doc, token, `runbook token ${token}`);
}

requireIncludes(schemaDoc, "A16T_STATUS=CANDIDATE_READY_NOT_APPLIED", "schema doc status");

if (dbMigration !== supabaseMigration) {
  failures.push("A-16T db/supabase migration mirror mismatch");
}

rejectPattern(
  verifySql,
  /^\s*(insert|update|delete|create|alter|drop|truncate|grant|revoke)\b/im,
  "verification SQL must be SELECT-only",
);

if (
  packageJson?.scripts?.["check:a16t-schema-apply-verify-runbook"] !==
  "node scripts/check-a16t-schema-apply-verify-runbook.cjs"
) {
  failures.push("missing package script check:a16t-schema-apply-verify-runbook");
}

for (const [content, token, label] of [
  [index, "PLAN_A16T_SCHEMA_APPLY_VERIFY_RUNBOOK.md", "index A-16T runbook entry"],
  [workLog, "A16T_SCHEMA_APPLY_VERIFY_STATUS=READY_FOR_OWNER_REVIEW_NOT_APPLIED", "work log A-16T runbook status"],
  [decisionLog, "Decision 235", "decision log A-16T entry"],
  [handoff, "A16T_SCHEMA_APPLY_VERIFY_STATUS=READY_FOR_OWNER_REVIEW_NOT_APPLIED", "handoff A-16T runbook status"],
]) {
  requireIncludes(content, token, label);
}

if (failures.length > 0) {
  console.error("A-16T schema apply/verify runbook check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16T schema apply/verify runbook check passed.");
