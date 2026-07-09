#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16AG_A16R_OFFICIAL_IMPORT_RETRY_EXECUTION.md";
const checkerPath = "scripts/check-a16ag-a16r-official-import-retry-execution.cjs";
const packagePath = "package.json";
const servicePath = "lib/import/giapha4/official-import-service.ts";
const routePath = "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";
const sessionId = "2af4bfb6-a20e-453e-9804-1b8c0afbdd68";

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function readJson(relativePath) {
  const content = read(relativePath);
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    failures.push(`${relativePath} is not valid JSON`);
    return null;
  }
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

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

function rejectPattern(content, pattern, label = String(pattern)) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

const doc = read(docPath);
const packageJson = readJson(packagePath);
const service = read(servicePath);
const route = read(routePath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const wrangler = read("wrangler.toml");
const layout = read("app/layout.tsx");

for (const token of [
  "A-16AG-A16R-OFFICIAL-IMPORT-RETRY-EXECUTION",
  "OWNER_APPROVED_A16R_IMPORT_RETRY_EXECUTION",
  `A16AG_TARGET_SESSION_ID=${sessionId}`,
  "A16AG_EXECUTION_STATUS=BLOCKED_ROUTE_RUNTIME_NOT_EXECUTION_CAPABLE",
  "A16AG_OFFICIAL_IMPORT_POST_CALLED=NO",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "A16AG_A16O_FULL_AUDIT_EXPORT_GATE=PASS",
  "A16AG_A16X2_SHAPE_GATE=PASS",
  "A16AG_A16AA_WARNING_REVIEW_GATE=PASS",
  "A16AG_A16AB_PREFLIGHT_GATE=READY_FOR_SEPARATE_OWNER_IMPORT_EXECUTION_APPROVAL",
  "A16AG_A16AE_RUNTIME_CANDIDATE_DEPLOYED=YES_OWNER_CONFIRMED",
  "A16AG_A16AF_PRODUCTION_READ_ONLY_SMOKE=PASS_READ_ONLY_BLOCKED_SAFE",
  "A16AG_BLOCKED_ERROR_COUNT=0",
  "A16AG_IMPORT_BLOCKING_WARNING_CATEGORY_FOUND=NO",
  "A16AG_OWNER_EXECUTION_APPROVAL_MARKER_PRESENT=YES",
  "A16AG_GET_OFFICIAL_IMPORT_GATE_HTTP_STATUS=401",
  "A16AG_GET_OFFICIAL_IMPORT_GATE_OFFICIAL_IMPORT_ENABLED=false",
  "A16AG_GET_OFFICIAL_IMPORT_ROUTE_HTTP_STATUS=405",
  "A16AG_ROUTE_RUNTIME_ALLOW_GATE=FAIL",
  "A16AG_BLOCKER=ROUTE_RUNTIME_ONLY_EXPOSES_CANDIDATE_READY_NOT_EXECUTED_NO_RPC_EXECUTION_BRANCH",
  "A16AG_SOURCE_READY_STATUS=CANDIDATE_READY_NOT_EXECUTED",
  "A16AG_SOURCE_READY_TRANSACTION_STATUS=A16AE_RUNTIME_ENABLEMENT_CANDIDATE_READY_NOT_EXECUTED",
  "A16AG_SOURCE_RUNTIME_RPC_CALL_PRESENT=NO",
  "A16AG_SOURCE_IMPORTED_PEOPLE_COUNT_ON_CANDIDATE=0",
  "A16AG_SOURCE_IMPORTED_RELATIONSHIP_COUNT_ON_CANDIDATE=0",
  "A16AG_RESULT_STATUS=BLOCKED",
  "A16AG_IMPORTED_PEOPLE_COUNT=0",
  "A16AG_IMPORTED_RELATIONSHIPS_COUNT=0",
  "A16AG_WARNINGS_COUNT=94",
  `A16AG_IMPORT_SESSION_ID=${sessionId}`,
  "A16AG_AUDIT_STATUS=NOT_CREATED_IMPORT_NOT_EXECUTED",
  "A16AG_ROLLBACK_STATUS=NOT_CREATED_IMPORT_NOT_EXECUTED",
  "A16AG_IDEMPOTENCY_STATUS=NOT_CONSUMED_IMPORT_NOT_EXECUTED",
  "A16AG_OFFICIAL_IMPORT_POST_CALLED_EXACTLY_ONCE=NO_NOT_CALLED_GATE_BLOCKED",
  "A16AG_DIRECT_RPC_IMPORT_CALLED=NO",
  "A16AG_REAL_GENEALOGY_WRITE=NO",
  "A16AG_SQL_RUN=NO",
  "A16AG_DB_PUSH_RUN=NO",
  "A16AG_MIGRATION_REPAIR_RUN=NO",
  "A16AG_SEED_RUN=NO",
  "A16AG_AUTH_USERS_ROLES_PERMISSIONS_MEMBERSHIPS_MUTATED=NO",
  "A16AG_DEPLOY_RUN=NO",
  "A16AG_RAW_JSON_CONTENT_PRINTED=NO",
  "A16AG_RAW_JSON_COMMITTED=NO",
  "A16AG_NO_RETRY_REPEATED=YES",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A16AG_A16R_OFFICIAL_IMPORT_RETRY_EXECUTION.md", "index entry"],
  [workLog, "A16AG_EXECUTION_STATUS=BLOCKED_ROUTE_RUNTIME_NOT_EXECUTION_CAPABLE", "work log status"],
  [decisionLog, "A-16AG blocks official import retry because deployed runtime is still candidate-only", "decision log entry"],
  [handoff, "A16AG_BLOCKER=ROUTE_RUNTIME_ONLY_EXPOSES_CANDIDATE_READY_NOT_EXECUTED_NO_RPC_EXECUTION_BRANCH", "handoff blocker"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a16ag-a16r-official-import-retry-execution"] !==
  "node scripts/check-a16ag-a16r-official-import-retry-execution.cjs"
) {
  failures.push("missing package script check:a16ag-a16r-official-import-retry-execution");
}

for (const token of [
  "const canRunOfficialImport = reasons.length === 0",
  "? \"CANDIDATE_READY_NOT_EXECUTED\"",
  "\"A16AE_RUNTIME_ENABLEMENT_CANDIDATE_READY_NOT_EXECUTED\"",
  "importedPeopleCount: 0",
  "importedRelationshipCount: 0",
  "transactionRpcName: A16P_TX_TRANSACTION_RPC_NAME",
]) {
  requireIncludes(service, token, `service token ${token}`);
}

requireIncludes(route, "export async function POST", "route POST exists");
requireIncludes(route, "getOfficialImportRuntimeCandidate", "route delegates candidate");
requireIncludes(route, "A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED", "route flag");

rejectPattern(service + route, /\.rpc\s*\(/i, "runtime must not call direct RPC");
rejectPattern(
  service + route,
  /\.from\(\s*["'](people|relationships|families|family_parents|family_children|couple_relationships|tree_layouts?|revisions|profiles)["']\s*\)[\s\S]{0,240}\.(insert|update|delete|upsert)\s*\(/i,
  "runtime must not write real genealogy tables in A-16AG source",
);
rejectPattern(doc, /A16AG_OFFICIAL_IMPORT_POST_CALLED=YES/i, "A-16AG must not claim POST called");
rejectPattern(doc, /A16R_IMPORT_RETRY_NEXT=YES/i, "A-16R retry must remain NO");
rejectPattern(doc + index + workLog + decisionLog + handoff, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");
rejectPattern(wrangler, /A16AG|A16R_IMPORT_RETRY/i, "wrangler config must not change for A-16AG");
rejectPattern(layout, /A16AG/i, "layout must not change for A-16AG");

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  checkerPath,
  packagePath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file.startsWith(".tmp/")) failures.push(`.tmp file must not be committed ${file}`);
  if (file !== packagePath && /\.(json|xlsx|xls|csv|zip)$/i.test(file)) {
    failures.push(`raw evidence/data file must not be committed ${file}`);
  }
  if (file === "wrangler.toml" || file === "app/layout.tsx") {
    failures.push(`forbidden file changed ${file}`);
  }
  if (/^(db\/migrations|supabase\/migrations|db\/checks)\//.test(file)) {
    failures.push(`forbidden SQL/check file ${file}`);
  }
}

const stagedFiles = git(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected staged file ${file}`);
}

const changedPatch = git([
  "diff",
  "--",
  ...changedFiles.filter((file) => allowedChangedFiles.has(file)),
]);
for (const pattern of [
  /\bsupabase\s+db\s+push\b/i,
  /\bwrangler\s+deploy\b/i,
]) {
  rejectPattern(changedPatch, pattern, `changed patch ${pattern}`);
}

if (failures.length > 0) {
  console.error("A-16AG official import retry execution check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16AG official import retry execution check passed.");
