const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16T_A16U_TRANSACTION_BRANCH_REQUIREMENTS.md";
const schemaDocPath = "docs/PLAN_A16T_OFFICIAL_IMPORT_AUDIT_ROLLBACK_IDEMPOTENCY_SCHEMA.md";
const packagePath = "package.json";
const servicePath = "lib/import/giapha4/official-import-service.ts";

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
const packageJson = readJson(packagePath);
const service = readFile(servicePath);
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16T-A16U-TRANSACTION-BRANCH-REQUIREMENTS",
  "A16T_A16U_REQUIREMENTS_STATUS=READY_FOR_A16U_AFTER_SCHEMA_APPLY_VERIFY",
  "A16U_REQUIREMENT_ALL_OR_NOTHING_TRANSACTION=YES",
  "A16U_REQUIREMENT_IDEMPOTENCY_BY_IMPORT_SESSION_ID=YES",
  "A16U_REQUIREMENT_AUDIT_BATCH_INSERT=YES",
  "A16U_REQUIREMENT_ROLLBACK_MANIFEST_INSERT=YES",
  "A16U_REQUIREMENT_IMPORT_COMPLETION_MARKER=YES",
  "A16U_REQUIREMENT_POST_IMPORT_COUNTS=YES",
  "created_people_count",
  "created_relationship_count",
  "audit_record_count",
  "rollback_manifest_count",
  "import_session_status",
  "A16T_A16U_RPC_CALLED=NO",
  "A16T_A16U_OFFICIAL_IMPORT_POST_CALLED=NO",
  "A16T_A16U_REAL_GENEALOGY_WRITE_STATUS=NO_WRITE",
  "A16T_A16U_CAN_RUN_OFFICIAL_IMPORT=false",
  "A16T_A16U_OFFICIAL_IMPORT_BUTTON=DISABLED",
]) {
  requireIncludes(doc, token, `requirements token ${token}`);
}

requireIncludes(schemaDoc, "A16T_STATUS=CANDIDATE_READY_NOT_APPLIED", "schema doc status");

if (
  packageJson?.scripts?.["check:a16t-a16u-transaction-branch-requirements"] !==
  "node scripts/check-a16t-a16u-transaction-branch-requirements.cjs"
) {
  failures.push("missing package script check:a16t-a16u-transaction-branch-requirements");
}

for (const [content, token, label] of [
  [index, "PLAN_A16T_A16U_TRANSACTION_BRANCH_REQUIREMENTS.md", "index A-16U requirements entry"],
  [workLog, "A16T_A16U_REQUIREMENTS_STATUS=READY_FOR_A16U_AFTER_SCHEMA_APPLY_VERIFY", "work log A-16U requirements status"],
  [decisionLog, "Decision 235", "decision log A-16T entry"],
  [handoff, "A16T_A16U_REQUIREMENTS_STATUS=READY_FOR_A16U_AFTER_SCHEMA_APPLY_VERIFY", "handoff A-16U requirements status"],
]) {
  requireIncludes(content, token, label);
}

rejectPattern(service, /\.rpc\s*\(/i, "official import service must not call RPC in A-16T");
rejectPattern(
  service,
  /\.from\(\s*["'](people|relationships|families|family_parents|family_children|couple_relationships|tree_layouts?|revisions|profiles)["']\s*\)[\s\S]{0,240}\.(insert|update|delete|upsert)\s*\(/i,
  "official import service must not write real genealogy tables",
);

if (failures.length > 0) {
  console.error("A-16T A-16U requirements check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16T A-16U requirements check passed.");
