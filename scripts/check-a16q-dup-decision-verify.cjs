const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16Q_DUP_DECISION_VERIFY.md";
const checkerPath = "scripts/check-a16q-dup-decision-verify.cjs";
const packagePath = "package.json";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const clientPath = "components/imports/duplicate-decision-review-client.tsx";
const servicePath =
  "lib/import/giapha4/duplicate-decision-review-service.ts";
const reviewPackPath = "lib/import/giapha4/import-review-pack-service.ts";
const preflightGatePath = "lib/import/giapha4/official-import-preflight-gate.ts";
const officialServicePath = "lib/import/giapha4/official-import-service.ts";
const patchRoutePath =
  "app/api/admin/import-sessions/[sessionId]/duplicates/[duplicateId]/route.ts";

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
readFile(checkerPath);
const packageJson = readJson(packagePath);
const panel = readFile(panelPath);
const client = readFile(clientPath);
const service = readFile(servicePath);
const reviewPack = readFile(reviewPackPath);
const preflightGate = readFile(preflightGatePath);
const officialService = readFile(officialServicePath);
const patchRoute = readFile(patchRoutePath);
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16Q-DUP-DECISION-VERIFY",
  "A16Q_DUP_DECISION_VERIFY_STATUS=OWNER_EVIDENCE_DUPLICATE_DECISIONS_COMPLETED",
  "919df333e26e8142f792feceba9b155a306f9dbb",
  "2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "owner_decision,count",
  "create_new,8",
  "unresolved,0",
  "needs_review,0",
  "A16Q_DUP_DECISION_VERIFY_CREATE_NEW_COUNT=8",
  "A16Q_DUP_DECISION_VERIFY_UNRESOLVED_COUNT=0",
  "A16Q_DUP_DECISION_VERIFY_NEEDS_REVIEW_COUNT=0",
  "A16Q_DUP_DECISION_VERIFY_DUPLICATE_BLOCKER_STATUS=PASS_NO_UNRESOLVED_OR_NEEDS_REVIEW",
  "`create_new` is still only a staging owner decision",
  "canRunOfficialImport=false",
  "officialImportButtonDisabled=true",
  "A16Q_DUP_DECISION_VERIFY_OFFICIAL_IMPORT_STATUS=LOCKED",
  "A16Q_DUP_DECISION_VERIFY_SQL_STATUS=NOT_RUN_BY_CODEX",
  "A16Q_DUP_DECISION_VERIFY_DB_PUSH_STATUS=NOT_RUN",
  "A16Q_DUP_DECISION_VERIFY_SEED_STATUS=NOT_RUN",
  "A16Q_DUP_DECISION_VERIFY_RPC_STATUS=NOT_CALLED",
  "A16Q_DUP_DECISION_VERIFY_OFFICIAL_IMPORT_POST_STATUS=NOT_CALLED",
  "A16Q_DUP_DECISION_VERIFY_REAL_GENEALOGY_WRITE_STATUS=NO_WRITE",
  "A16Q_DUP_DECISION_VERIFY_AUTO_DECISION_STATUS=NO_AUTO_DECISION",
  "A16Q_DUP_DECISION_VERIFY_DEPLOY_STATUS=NOT_DEPLOYED",
  "A16Q_DUP_DECISION_VERIFY_PUSH_STATUS=NOT_PUSHED",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

if (
  packageJson?.scripts?.["check:a16q-dup-decision-verify"] !==
  "node scripts/check-a16q-dup-decision-verify.cjs"
) {
  failures.push("missing package script check:a16q-dup-decision-verify");
}

for (const [content, token, label] of [
  [index, "PLAN_A16Q_DUP_DECISION_VERIFY.md", "index entry"],
  [
    workLog,
    "A16Q_DUP_DECISION_VERIFY_STATUS=OWNER_EVIDENCE_DUPLICATE_DECISIONS_COMPLETED",
    "work log status",
  ],
  [decisionLog, "Decision 231", "decision log entry"],
  [
    handoff,
    "A16Q_DUP_DECISION_VERIFY_STATUS=OWNER_EVIDENCE_DUPLICATE_DECISIONS_COMPLETED",
    "handoff status",
  ],
]) {
  requireIncludes(content, token, label);
}

for (const token of [
  "duplicateDecisionSummary.unresolvedDuplicateCandidates === 0",
  "duplicateDecisionSummary.needsReviewDuplicateCandidates === 0",
  "canProceedToOfficialImport: false",
]) {
  requireIncludes(reviewPack, token, `review pack token ${token}`);
}

for (const token of [
  "duplicateDecisionSummary.unresolvedDuplicateCandidates > 0",
  "duplicateDecisionSummary.needsReviewDuplicateCandidates > 0",
  "canOpenOfficialImport: false",
  "officialImportEnabled: false",
]) {
  requireIncludes(preflightGate, token, `preflight gate token ${token}`);
}

for (const token of [
  "duplicateDecisionSummary.unresolvedDuplicateCandidates > 0",
  "duplicateDecisionSummary.needsReviewDuplicateCandidates > 0",
  "canRunOfficialImport: false",
]) {
  requireIncludes(officialService, token, `official service token ${token}`);
}

for (const token of [
  "finalDuplicateDecisions",
  "\"create_new\"",
  "\"ignore_candidate\"",
  "\"link_existing\"",
  "canRunOfficialImport: false",
  "realGenealogyWrite: false",
  ".from(\"import_duplicate_candidates\")",
  ".eq(\"id\", input.duplicateId)",
  ".eq(\"import_session_id\", input.sessionId)",
]) {
  requireIncludes(service, token, `service token ${token}`);
}

for (const token of [
  "Xác nhận nhập chính thức",
  "disabled",
  "aria-disabled=\"true\"",
  "canRunOfficialImport=false",
]) {
  if (token === "canRunOfficialImport=false") {
    requireIncludes(doc, token, `doc official lock token ${token}`);
  } else {
    requireIncludes(panel, token, `panel official button token ${token}`);
  }
}

for (const [label, content] of [
  [clientPath, client],
  [panelPath, panel],
  [servicePath, service],
  [patchRoutePath, patchRoute],
]) {
  rejectPattern(content, /\.rpc\s*\(/i, `${label} must not call RPC`);
  rejectPattern(
    content,
    /a16p_tx_execute_giapha4_official_import|POST\s+\/official-import/i,
    `${label} must not call official import`,
  );
  rejectPattern(
    content,
    /\.from\(\s*["'](people|relationships|families|tree_layout|revisions|profiles)["']\s*\)[\s\S]{0,240}\.(insert|update|delete|upsert)\s*\(/i,
    `${label} must not write real genealogy tables`,
  );
}

const changedFiles = gitOutput(["status", "--porcelain", "--untracked-files=all"])
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
  "scripts/check-a16q-dup-decision-ux-fix.cjs",
  "scripts/check-a16q-dup-live-save-fix.cjs",
  "scripts/check-a16q-dup-save-fix.cjs",
  "scripts/check-a16q-dup-rls-verify-ui-write-pass.cjs",
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
  console.error("A-16Q-DUP-DECISION-VERIFY check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16Q-DUP-DECISION-VERIFY check passed.");
