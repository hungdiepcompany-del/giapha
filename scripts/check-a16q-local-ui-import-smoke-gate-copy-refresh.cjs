const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16Q_LOCAL_UI_IMPORT_SMOKE_GATE_COPY_REFRESH.md";
const checkerPath =
  "scripts/check-a16q-local-ui-import-smoke-gate-copy-refresh.cjs";
const smokePath = "scripts/smoke-a16q-local-ui-import-guided.cjs";
const packagePath = "package.json";
const gatePath = "lib/import/giapha4/official-import-preflight-gate.ts";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const officialServicePath = "lib/import/giapha4/official-import-service.ts";

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

function rejectIncludes(content, token, label = token) {
  if (content.includes(token)) failures.push(`forbidden ${label}`);
}

function rejectPattern(content, pattern, label = String(pattern)) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

const doc = readFile(docPath);
readFile(checkerPath);
const smoke = readFile(smokePath);
const packageJson = readJson(packagePath);
const gate = readFile(gatePath);
const panel = readFile(panelPath);
const officialService = readFile(officialServicePath);
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16Q-LOCAL-UI",
  "A16Q_LOCAL_UI_STATUS=SAFE_SKIP_MISSING_AUTH_GATE_COPY_REFRESHED",
  "SAFE_SKIP_MISSING_AUTH",
  "SAFE_SKIP_BROWSER_RUNTIME_UNAVAILABLE",
  "SAFE_SKIP_MISSING_CHROME_CDP",
  "http://localhost:3001/admin/exports/import",
  "Session id: `UNKNOWN`",
  "APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_<SESSION_ID>",
  "validation errors = 0",
  "dry-run blockers = 0",
  "rollback reviewed",
  "audit reviewed",
  "UI button remains disabled",
  "No script calls RPC",
  "No script calls POST official import",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

if (
  packageJson?.scripts?.["check:a16q-local-ui-import-smoke-gate-copy-refresh"] !==
  "node scripts/check-a16q-local-ui-import-smoke-gate-copy-refresh.cjs"
) {
  failures.push("missing package script check:a16q-local-ui-import-smoke-gate-copy-refresh");
}
if (
  packageJson?.scripts?.["smoke:a16q-local-ui-import-guided"] !==
  "node scripts/smoke-a16q-local-ui-import-guided.cjs"
) {
  failures.push("missing package script smoke:a16q-local-ui-import-guided");
}

for (const [content, token, label] of [
  [index, "PLAN_A16Q_LOCAL_UI_IMPORT_SMOKE_GATE_COPY_REFRESH.md", "index entry"],
  [workLog, "A16Q_LOCAL_UI_STATUS=SAFE_SKIP_MISSING_AUTH_GATE_COPY_REFRESHED", "work log status"],
  [decisionLog, "Decision 223", "decision log entry"],
  [handoff, "A16Q_LOCAL_UI_STATUS=SAFE_SKIP_MISSING_AUTH_GATE_COPY_REFRESHED", "handoff status"],
]) {
  requireIncludes(content, token, label);
}

for (const token of [
  "A16R_REQUIRED_OFFICIAL_IMPORT_SESSION_MARKER",
  "APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_<SESSION_ID>",
  "Runtime candidate",
  "transaction helper",
  "Validation errors phải bằng 0",
  "Dry-run blockers phải bằng 0",
  "Rollback plan",
  "Audit/revision plan",
  "canOpenOfficialImport: false",
  "officialImportEnabled: false",
]) {
  requireIncludes(gate, token, `gate token ${token}`);
}

for (const token of [
  "APPROVE_A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE",
  "A-16N chỉ là cổng khóa read-only",
  "Thiếu marker tương lai",
]) {
  rejectIncludes(gate, token, `stale gate copy ${token}`);
  rejectIncludes(panel, token, `stale panel copy ${token}`);
}

for (const token of [
  "officialImportGate.message",
  "Marker session-specific",
  "disabled",
  "aria-disabled=\"true\"",
]) {
  requireIncludes(panel, token, `panel token ${token}`);
}

for (const token of [
  "canRunOfficialImport: false",
  "transactionStatus: \"BLOCKED_TRANSACTION_HELPER_NOT_APPLIED\"",
]) {
  requireIncludes(officialService, token, `official import lock token ${token}`);
}
rejectPattern(officialService, /\.rpc\s*\(/i, "official import service must not call RPC");

for (const token of [
  "SAFE_SKIP_MISSING_LOCALHOST",
  "SAFE_SKIP_BROWSER_RUNTIME_UNAVAILABLE",
  "SAFE_SKIP_MISSING_CHROME_CDP",
  "SAFE_SKIP_MISSING_AUTH",
  "A16Q_LOCAL_UI_CDP_URL",
  "connectOverCDP",
  "browser.contexts()[0]",
  "official_import_locked",
]) {
  requireIncludes(smoke, token, `smoke token ${token}`);
}
rejectPattern(smoke, /\.rpc\s*\(/i, "smoke must not call RPC");
rejectPattern(smoke, /storageState|userDataDir|localStorage/i, "smoke must not read or save auth storage");
rejectPattern(
  smoke,
  /method\s*:\s*["']POST["'][\s\S]{0,240}official-import(?!-gate)/i,
  "smoke must not POST official import",
);

const scriptFiles = gitOutput(["ls-files", "scripts"])
  .split(/\r?\n/)
  .filter(Boolean)
  .filter((file) => !path.basename(file).startsWith("check-"));

for (const file of scriptFiles) {
  const content = file === smokePath ? smoke : readFile(file);
  rejectPattern(
    content,
    /\.rpc\s*\(\s*["']a16p_tx_execute_giapha4_official_import["']/i,
    `${file} must not call official import RPC`,
  );
  rejectPattern(
    content,
    /method\s*:\s*["']POST["'][\s\S]{0,240}official-import(?!-gate)/i,
    `${file} must not POST official import`,
  );
}

const allowedChangedFiles = new Set([
  docPath,
  checkerPath,
  smokePath,
  packagePath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  gatePath,
  panelPath,
  "lib/import/giapha4/official-import-service.ts",
  "app/api/admin/import-sessions/[sessionId]/official-import/route.ts",
  "scripts/check-a16q-fix-import-session-ui-date-hydration.cjs",
  "scripts/check-a16q-fix2-row95-date-count-consistency.cjs",
  "docs/PLAN_A16Q_DUPLICATE_CANDIDATE_OWNER_DECISION_REVIEW.md",
  "scripts/check-a16q-dup-duplicate-candidate-owner-decision-review.cjs",
  "lib/import/giapha4/duplicate-decision-review-service.ts",
  "lib/import/giapha4/manifest-read-service.ts",
  "lib/import/giapha4/import-review-pack-service.ts",
  "app/api/admin/import-sessions/[sessionId]/duplicates/route.ts",
  "db/migrations/20260701_0013_a16q_dup_duplicate_decision_rls_candidate.sql",
  "supabase/migrations/20260701_0013_a16q_dup_duplicate_decision_rls_candidate.sql",
  "db/checks/20260701_check_a16q_dup_duplicate_decision_rls.sql",
]);

const allowedA16qDupSqlFiles = new Set([
  "db/migrations/20260701_0013_a16q_dup_duplicate_decision_rls_candidate.sql",
  "supabase/migrations/20260701_0013_a16q_dup_duplicate_decision_rls_candidate.sql",
  "db/checks/20260701_check_a16q_dup_duplicate_decision_rls.sql",
]);

const changedFiles = gitOutput(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === ".env.local" || file.endsWith(".env.local")) {
    failures.push(".env.local must not be changed");
  }
  if (
    (file.startsWith("db/migrations/") || file.startsWith("supabase/migrations/")) &&
    !allowedA16qDupSqlFiles.has(file)
  ) {
    failures.push(`migration must not change ${file}`);
  }
  if (file.startsWith("db/checks/") && !allowedA16qDupSqlFiles.has(file)) {
    failures.push(`SQL check file must not change ${file}`);
  }
  if (/\.(xls|xlsx|csv|png|jpg|jpeg|webp|zip)$/i.test(file)) {
    failures.push(`real data/storage/screenshot file must not be changed ${file}`);
  }
}

for (const content of [doc, smoke]) {
  rejectPattern(content, /service_role|SUPABASE_SERVICE_ROLE|eyJ[A-Za-z0-9_-]{20,}\./, "secret-like token");
}

if (failures.length > 0) {
  console.error("A-16Q-LOCAL-UI checker failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16Q-LOCAL-UI checker PASS");
