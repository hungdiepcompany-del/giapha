const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const sessionId = "2af4bfb6-a20e-453e-9804-1b8c0afbdd68";
const approvalMarker =
  "APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68";

const runbookDocPath = "docs/PLAN_A16R_OFFICIAL_IMPORT_RUNBOOK.md";
const preflightDocPath = "docs/PLAN_A16R_PREFLIGHT_BUNDLE.md";
const gateDocPath = "docs/PLAN_A16R_SESSION_APPROVAL_GATE.md";
const packagePath = "package.json";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const preflightGatePath = "lib/import/giapha4/official-import-preflight-gate.ts";

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

const runbook = readFile(runbookDocPath);
readFile(preflightDocPath);
readFile(gateDocPath);
const packageJson = readJson(packagePath);
const panel = readFile(panelPath);
const preflightGate = readFile(preflightGatePath);
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16R-RUNBOOK",
  "A16R_RUNBOOK_STATUS=PASS_RUNBOOK_READY_NOT_EXECUTED",
  sessionId,
  approvalMarker,
  "A16R_RUNBOOK_STAGING_PEOPLE_COUNT=102",
  "A16R_RUNBOOK_STAGING_RELATIONSHIP_COUNT=134",
  "A16R_RUNBOOK_VALIDATION_ERROR_COUNT=0",
  "A16R_RUNBOOK_DRY_RUN_BLOCKER_COUNT=0",
  "A16R_RUNBOOK_DUPLICATE_UNRESOLVED_COUNT=0",
  "A16R_RUNBOOK_DUPLICATE_NEEDS_REVIEW_COUNT=0",
  "A16R_RUNBOOK_DUPLICATE_CREATE_NEW_COUNT=8",
  "A16R_RUNBOOK_DUPLICATE_BLOCKER_STATUS=PASS",
  "docs/PLAN_A16M_OFFICIAL_IMPORT_TRANSACTION_ROLLBACK_AUDIT_DESIGN.md",
  "docs/PLAN_A16P_TX_ROLLBACK_AUDIT_MANIFEST_CONTRACT.md",
  "No-Go Checklist",
  "Rollback Checklist",
  "Audit Checklist",
  "Post-Run Verification For A Later Phase",
  "Stop before any future import execution",
  "A16R_RUNBOOK_OFFICIAL_IMPORT_ROUTE=POST /api/admin/import-sessions/2af4bfb6-a20e-453e-9804-1b8c0afbdd68/official-import",
  "A16R_RUNBOOK_OFFICIAL_IMPORT_RPC=public.a16p_tx_execute_giapha4_official_import",
  "A16R_RUNBOOK_ROUTE_STATUS=NOT_CALLED",
  "A16R_RUNBOOK_RPC_STATUS=NOT_CALLED",
  "A16R_RUNBOOK_POST_RUN_SESSION_ID_MATCH=REQUIRED",
  "A16R_RUNBOOK_SQL_STATUS=NOT_RUN",
  "A16R_RUNBOOK_DB_PUSH_STATUS=NOT_RUN",
  "A16R_RUNBOOK_MIGRATION_REPAIR_STATUS=NOT_RUN",
  "A16R_RUNBOOK_SEED_STATUS=NOT_RUN",
  "A16R_RUNBOOK_OFFICIAL_IMPORT_POST_STATUS=NOT_CALLED",
  "A16R_RUNBOOK_REAL_GENEALOGY_WRITE_STATUS=NO_WRITE",
  "A16R_RUNBOOK_AUTO_PEOPLE_CREATE_STATUS=NO_AUTO_CREATE",
  "A16R_RUNBOOK_AUTO_RELATIONSHIP_CREATE_STATUS=NO_AUTO_CREATE",
  "A16R_RUNBOOK_A16R_EXECUTION_STATUS=NOT_OPENED",
  "canRunOfficialImport=false",
  "officialImportButtonDisabled=true",
]) {
  requireIncludes(runbook, token, `runbook token ${token}`);
}

if (
  packageJson?.scripts?.["check:a16r-official-import-runbook"] !==
  "node scripts/check-a16r-official-import-runbook.cjs"
) {
  failures.push("missing package script check:a16r-official-import-runbook");
}

for (const [content, token, label] of [
  [index, "PLAN_A16R_OFFICIAL_IMPORT_RUNBOOK.md", "index runbook entry"],
  [
    workLog,
    "A16R_RUNBOOK_STATUS=PASS_RUNBOOK_READY_NOT_EXECUTED",
    "work log runbook status",
  ],
  [decisionLog, "Decision 232", "decision log A-16R entry"],
  [
    handoff,
    "A16R_RUNBOOK_STATUS=PASS_RUNBOOK_READY_NOT_EXECUTED",
    "handoff runbook status",
  ],
]) {
  requireIncludes(content, token, label);
}

for (const token of [
  "canOpenOfficialImport: false",
  "officialImportEnabled: false",
]) {
  requireIncludes(preflightGate, token, `preflight gate lock token ${token}`);
}

for (const token of ["disabled", "aria-disabled=\"true\""]) {
  requireIncludes(panel, token, `panel disabled token ${token}`);
}

for (const [relativePath, content] of [
  ["scripts/check-a16r-preflight-bundle.cjs", readFile("scripts/check-a16r-preflight-bundle.cjs")],
  ["scripts/check-a16r-official-import-runbook.cjs", readFile("scripts/check-a16r-official-import-runbook.cjs")],
  ["scripts/check-a16r-session-approval-gate.cjs", readFile("scripts/check-a16r-session-approval-gate.cjs")],
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
  preflightDocPath,
  runbookDocPath,
  gateDocPath,
  "scripts/check-a16r-preflight-bundle.cjs",
  "scripts/check-a16r-official-import-runbook.cjs",
  "scripts/check-a16r-session-approval-gate.cjs",
  "docs/PLAN_A16R_RUN_OFFICIAL_IMPORT.md",
  "docs/PLAN_A16R_POST_IMPORT_VERIFICATION.md",
  "scripts/check-a16r-run-official-import.cjs",
  "scripts/check-a16r-post-import-verification.cjs",
  packagePath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "scripts/check-a16q-dup-decision-verify.cjs",
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === ".env.local" || file.endsWith(".env.local")) {
    failures.push(".env.local must not be changed");
  }
  if (file.startsWith("db/migrations/") || file.startsWith("supabase/migrations/")) {
    failures.push(`migration must not change ${file}`);
  }
  if (file.startsWith("db/checks/")) failures.push(`SQL check must not change ${file}`);
  if (file.startsWith("supabase/.temp/")) {
    failures.push(`supabase temp must not change ${file}`);
  }
  if (/\.(xls|xlsx|csv)$/i.test(file)) {
    failures.push(`spreadsheet/csv must not be changed ${file}`);
  }
}

const stagedFiles = gitOutput(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (/\.(xls|xlsx|csv)$/i.test(file)) failures.push(`staged data file ${file}`);
}

if (failures.length > 0) {
  console.error("A-16R-RUNBOOK check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16R-RUNBOOK check passed.");
