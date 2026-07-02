const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16T_APPLY_VERIFY.md";
const schemaDocPath = "docs/PLAN_A16T_OFFICIAL_IMPORT_AUDIT_ROLLBACK_IDEMPOTENCY_SCHEMA.md";
const dbMigrationPath =
  "db/migrations/20260702_0014_a16t_official_import_audit_rollback_idempotency_schema_candidate.sql";
const supabaseMigrationPath =
  "supabase/migrations/20260702_0014_a16t_official_import_audit_rollback_idempotency_schema_candidate.sql";
const verifySqlPath =
  "db/checks/20260702_check_a16t_official_import_audit_rollback_idempotency_schema.sql";
const packagePath = "package.json";
const servicePath = "lib/import/giapha4/official-import-service.ts";
const panelPath = "components/imports/import-session-manifest-panel.tsx";

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
const schemaDoc = readFile(schemaDocPath);
const dbMigration = readFile(dbMigrationPath);
const supabaseMigration = readFile(supabaseMigrationPath);
const verifySql = readFile(verifySqlPath);
const packageJson = readJson(packagePath);
const service = readFile(servicePath);
const panel = readFile(panelPath);
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16T-APPLY-VERIFY",
  "A16T_APPLY_VERIFY_STATUS=BLOCKED_VERIFY_EVIDENCE_INSUFFICIENT_OR_FAILED",
  "A16T_BASELINE_COMMIT=fa8a21d",
  "A16T_BASELINE_STATUS=A16T_STATUS=CANDIDATE_READY_NOT_APPLIED",
  dbMigrationPath,
  supabaseMigrationPath,
  verifySqlPath,
  "A16T_PASS_TO_A16U_BUNDLE_STATUS=BLOCKED_AT_A16T_VERIFY",
  "A16T_OWNER_APPLY_EVIDENCE_STATUS=CLAIMED_WITHOUT_VERIFICATION_OUTPUT",
  "A16T_OWNER_VERIFY_EVIDENCE_STATUS=INSUFFICIENT_PLACEHOLDER_ONLY",
  "A16T_OWNER_VERIFICATION_RESULT=INSUFFICIENT_OR_FAILED",
  "A16T_OWNER_EVIDENCE_PLACEHOLDER_DETECTED=YES",
  "A16T_APPLY_VERIFY_DO_NOT_FAKE_PASS=YES",
  "official_import_batches",
  "official_import_rollback_manifests",
  "idempotency unique guard",
  "idempotency_key",
  "A16T_APPLY_VERIFY_OFFICIAL_IMPORT_BATCHES_VERIFIED=NO_INSUFFICIENT_EVIDENCE",
  "A16T_APPLY_VERIFY_OFFICIAL_IMPORT_ROLLBACK_MANIFESTS_VERIFIED=NO_INSUFFICIENT_EVIDENCE",
  "A16T_APPLY_VERIFY_IDEMPOTENCY_GUARD_VERIFIED=NO_INSUFFICIENT_EVIDENCE",
  "A16T_APPLY_VERIFY_NO_ANON_PUBLIC_VERIFIED=NO_INSUFFICIENT_EVIDENCE",
  "A16T_APPLY_VERIFY_NO_AUTO_IMPORT_TRIGGER_VERIFIED=NO_INSUFFICIENT_EVIDENCE",
  "A16T_APPLY_VERIFY_RUNTIME_FAIL_CLOSED=YES",
  "A16T_APPLY_VERIFY_CAN_RUN_OFFICIAL_IMPORT=false",
  "A16T_APPLY_VERIFY_OFFICIAL_IMPORT_BUTTON=DISABLED",
  "A16T_APPLY_VERIFY_RPC_CALLED=NO",
  "A16T_APPLY_VERIFY_OFFICIAL_IMPORT_POST_CALLED=NO",
  "A16T_APPLY_VERIFY_REAL_GENEALOGY_WRITE_STATUS=NO_WRITE",
  "A16U_STATUS=NOT_STARTED_A16T_VERIFY_BLOCKED",
  "A16U_PHASES_STARTED=NO",
  "A16U_SQL_CANDIDATE_CREATED=NO",
  "A16U_SQL_CANDIDATE_PATH=N/A_A16T_VERIFY_BLOCKED",
  "A16U_SQL_MIRROR_BYTE_FOR_BYTE=N/A_A16T_VERIFY_BLOCKED",
  "A16T_APPLY_VERIFY_SQL_RUN_BY_CODEX=NO",
  "A16T_APPLY_VERIFY_DB_PUSH_STATUS=NOT_RUN",
  "A16T_APPLY_VERIFY_MIGRATION_REPAIR_STATUS=NOT_RUN",
  "A16T_APPLY_VERIFY_SEED_STATUS=NOT_RUN",
  "A16T_APPLY_VERIFY_DEPLOY_STATUS=NOT_DEPLOYED",
  "A16T_APPLY_VERIFY_PUSH_STATUS=NOT_PUSHED",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

const currentStatus = doc.match(/^Status:\s+`([^`]+)`/m)?.[1] ?? "";
if (currentStatus === "A16T_APPLY_VERIFY_STATUS=PASS_OWNER_APPLIED_AND_VERIFIED") {
  for (const token of [
    "A16T_OWNER_APPLY_EVIDENCE_STATUS=PASS",
    "A16T_OWNER_VERIFY_EVIDENCE_STATUS=PASS",
    "A16T_APPLY_VERIFY_OFFICIAL_IMPORT_BATCHES_VERIFIED=YES",
    "A16T_APPLY_VERIFY_OFFICIAL_IMPORT_ROLLBACK_MANIFESTS_VERIFIED=YES",
    "A16T_APPLY_VERIFY_IDEMPOTENCY_GUARD_VERIFIED=YES",
    "A16T_APPLY_VERIFY_NO_ANON_PUBLIC_VERIFIED=YES",
    "A16T_APPLY_VERIFY_NO_AUTO_IMPORT_TRIGGER_VERIFIED=YES",
  ]) {
    requireIncludes(doc, token, `PASS evidence token ${token}`);
  }
} else if (
  !doc.includes("A16T_OWNER_APPLY_EVIDENCE_STATUS=CLAIMED_WITHOUT_VERIFICATION_OUTPUT")
) {
  failures.push("missing explicit owner evidence status for non-PASS state");
}

requireIncludes(schemaDoc, "A16T_STATUS=CANDIDATE_READY_NOT_APPLIED", "A-16T baseline status");
if (dbMigration !== supabaseMigration) {
  failures.push("A-16T db/supabase migration mirror mismatch");
}
requireIncludes(verifySql, "SELECT_ONLY_VERIFICATION", "verification SQL remains SELECT-only");

if (
  packageJson?.scripts?.["check:a16t-apply-verify"] !==
  "node scripts/check-a16t-apply-verify.cjs"
) {
  failures.push("missing package script check:a16t-apply-verify");
}

for (const [content, token, label] of [
  [index, "PLAN_A16T_APPLY_VERIFY.md", "index A-16T apply verify entry"],
  [workLog, "A16T_APPLY_VERIFY_STATUS=BLOCKED_VERIFY_EVIDENCE_INSUFFICIENT_OR_FAILED", "work log A-16T apply verify status"],
  [decisionLog, "Decision 236", "decision log A-16T apply verify entry"],
  [handoff, "A16T_APPLY_VERIFY_STATUS=BLOCKED_VERIFY_EVIDENCE_INSUFFICIENT_OR_FAILED", "handoff A-16T apply verify status"],
]) {
  requireIncludes(content, token, label);
}

for (const token of [
  "A16T_SCHEMA_CANDIDATE_NOT_APPLIED_BLOCKER",
  "A16T_BLOCKED_SCHEMA_CANDIDATE_NOT_APPLIED",
  "status: \"BLOCKED\"",
  "canRunOfficialImport: false",
  "importedPeopleCount: 0",
  "importedRelationshipCount: 0",
]) {
  requireIncludes(service, token, `service token ${token}`);
}

for (const token of ["disabled", "aria-disabled=\"true\""]) {
  requireIncludes(panel, token, `official button disabled token ${token}`);
}

rejectPattern(service, /\.rpc\s*\(/i, "official import service must not call RPC");
rejectPattern(
  service,
  /\.from\(\s*["'](people|relationships|families|family_parents|family_children|couple_relationships|tree_layouts?|revisions|profiles)["']\s*\)[\s\S]{0,240}\.(insert|update|delete|upsert)\s*\(/i,
  "official import service must not write real genealogy tables",
);

for (const [content, label] of [
  [doc, docPath],
  [readFile("scripts/check-a16t-apply-verify.cjs"), "scripts/check-a16t-apply-verify.cjs"],
]) {
  rejectPattern(content, /SUPABASE_SERVICE_ROLE_KEY\s*=/i, `${label} secret assignment`);
  rejectPattern(content, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, `${label} secret-like token`);
  rejectPattern(content, /fetch\s*\([^)]*official-import/i, `${label} POST official import call`);
  rejectPattern(content, /\.rpc\s*\(/i, `${label} RPC call`);
}

const changedFiles = gitOutput(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  "scripts/check-a16t-apply-verify.cjs",
  packagePath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "scripts/check-a16t-official-import-audit-rollback-idempotency-schema.cjs",
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === ".env.local" || file.endsWith(".env.local")) failures.push(".env.local must not change");
  if (file.startsWith("db/migrations/")) failures.push(`migration must not change in A-16T-APPLY-VERIFY ${file}`);
  if (file.startsWith("supabase/migrations/")) failures.push(`supabase migration must not change in A-16T-APPLY-VERIFY ${file}`);
  if (file.startsWith("db/checks/")) failures.push(`SQL check must not change in A-16T-APPLY-VERIFY ${file}`);
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
  console.error("A-16T apply verification check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16T apply verification check passed.");
