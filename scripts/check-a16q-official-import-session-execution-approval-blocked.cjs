const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath =
  "docs/PLAN_A16Q_OFFICIAL_IMPORT_SESSION_EXECUTION_APPROVAL_BLOCKED.md";
const checkerPath =
  "scripts/check-a16q-official-import-session-execution-approval-blocked.cjs";
const packagePath = "package.json";
const servicePath = "lib/import/giapha4/official-import-service.ts";
const gatePath = "lib/import/giapha4/official-import-preflight-gate.ts";
const routePath =
  "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";
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
const checker = readFile(checkerPath);
const packageJson = readJson(packagePath);
const service = readFile(servicePath);
const gate = readFile(gatePath);
const route = readFile(routePath);
const panel = readFile(panelPath);
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16Q",
  "A16Q_STATUS=BLOCKED_MISSING_MARKER_OR_SESSION_ID",
  "Missing owner marker record",
  "APPROVE_A16Q_OFFICIAL_IMPORT_SESSION_EXECUTION",
  "Missing session id",
  "A16Q_IMPORT_SESSION_ID=<uuid>",
  "102 staged members",
  "134 parent relationship candidates",
  "RPC `public.a16p_tx_execute_giapha4_official_import` da duoc owner apply thu",
  "verification PASS",
  "Official import van chua chay",
  "`canRunOfficialImport=false`",
  "UI button disabled",
  "No RPC call",
  "No POST official import call",
  "No real genealogy writes",
  "APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_<SESSION_ID>",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "Exact session id",
  "Validation errors = 0",
  "Blockers = 0",
  "Unresolved parent references = 0",
  "Duplicate/conflict unresolved = 0",
  "Rollback reviewed",
  "Audit reviewed",
  "Dry-run/review pack current",
  "Owner accepts 102 staged people and 134 parent relationships",
  "Owner understands import is irreversible unless rollback works",
  "Owner understands A-16R will be the phase that may actually mutate data",
  "A-16R must not deploy/push unless separately approved",
]) {
  requireIncludes(doc, token, `approval checklist token ${token}`);
}

if (
  packageJson?.scripts?.[
    "check:a16q-official-import-session-execution-approval-blocked"
  ] !==
  "node scripts/check-a16q-official-import-session-execution-approval-blocked.cjs"
) {
  failures.push(
    "missing package script check:a16q-official-import-session-execution-approval-blocked",
  );
}

for (const [content, token, label] of [
  [index, "PLAN_A16Q_OFFICIAL_IMPORT_SESSION_EXECUTION_APPROVAL_BLOCKED.md", "index entry"],
  [workLog, "A16Q_STATUS=BLOCKED_MISSING_MARKER_OR_SESSION_ID", "work log status"],
  [decisionLog, "Decision 220", "decision log entry"],
  [handoff, "A16Q_STATUS=BLOCKED_MISSING_MARKER_OR_SESSION_ID", "handoff status"],
]) {
  requireIncludes(content, token, label);
}

for (const token of [
  "canRunOfficialImport: false",
  "transactionStatus: \"BLOCKED_TRANSACTION_HELPER_NOT_APPLIED\"",
  "A16P_TX_TRANSACTION_RPC_NAME",
]) {
  requireIncludes(service, token, `service token ${token}`);
}

rejectPattern(service, /\.rpc\s*\(/i, "service must not call RPC");

for (const token of [
  "canOpenOfficialImport: false",
  "officialImportEnabled: false",
]) {
  requireIncludes(gate, token, `gate token ${token}`);
}

for (const token of [
  "A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED",
  "status: \"LOCKED\"",
  "canRunOfficialImport: false",
]) {
  requireIncludes(route, token, `route token ${token}`);
}

for (const token of [
  "Cổng nhập chính thức",
  "Nhập chính thức chưa được mở",
  "disabled",
  "aria-disabled=\"true\"",
  "Xác nhận nhập chính thức",
]) {
  requireIncludes(panel, token, `panel token ${token}`);
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
  packagePath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "scripts/check-a16p-tx-apply-verify.cjs",
]);

const changedFiles = gitOutput(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === ".env.local") failures.push(".env.local must not be changed");
  if (file === "PLANNING.MD") failures.push("PLANNING.MD must not be changed");
  if (file !== packagePath && /\.(xls|xlsx|csv|png|jpg|jpeg|webp|zip|json)$/i.test(file)) {
    failures.push(`real data/storage/screenshot/state file must not be changed ${file}`);
  }
  if (file.startsWith("db/migrations/") || file.startsWith("supabase/migrations/")) {
    failures.push(`migration must not change ${file}`);
  }
  if (file.startsWith("db/checks/")) {
    failures.push(`SQL verification file must not change ${file}`);
  }
  if (file.startsWith("app/") || file.startsWith("lib/") || file.startsWith("components/")) {
    failures.push(`runtime/UI behavior file must not change ${file}`);
  }
}

for (const file of gitOutput(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean)) {
  if (file !== packagePath && /\.(xls|xlsx|csv|png|jpg|jpeg|webp|zip|json)$/i.test(file)) {
    failures.push(`staged real data/storage/screenshot/state file not allowed ${file}`);
  }
}

for (const [file, content] of [
  [docPath, doc],
  [checkerPath, checker],
  [packagePath, JSON.stringify(packageJson ?? {})],
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
  console.error("A-16Q blocked session execution approval check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16Q blocked session execution approval check passed.");
