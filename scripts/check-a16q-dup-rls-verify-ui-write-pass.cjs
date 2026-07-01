const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16Q_DUP_RLS_VERIFY_UI_WRITE_PASS.md";
const checkerPath = "scripts/check-a16q-dup-rls-verify-ui-write-pass.cjs";
const packagePath = "package.json";
const servicePath =
  "lib/import/giapha4/duplicate-decision-review-service.ts";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const clientPanelPath = "components/imports/duplicate-decision-review-client.tsx";
const patchRoutePath =
  "app/api/admin/import-sessions/[sessionId]/duplicates/[duplicateId]/route.ts";
const reviewPackPath = "lib/import/giapha4/import-review-pack-service.ts";
const preflightGatePath = "lib/import/giapha4/official-import-preflight-gate.ts";
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

function rejectPattern(content, pattern, label = String(pattern)) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

const doc = readFile(docPath);
readFile(checkerPath);
const packageJson = readJson(packagePath);
const service = readFile(servicePath);
const panel = readFile(panelPath);
const clientPanel = readFile(clientPanelPath);
const patchRoute = readFile(patchRoutePath);
const reviewPack = readFile(reviewPackPath);
const preflightGate = readFile(preflightGatePath);
const officialService = readFile(officialServicePath);
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16Q-DUP-RLS-VERIFY-UI-WRITE-PASS",
  "A16Q_DUP_RLS_UI_WRITE_STATUS=OWNER_RLS_VERIFY_PASS_UI_WRITE_ENABLED",
  "A16Q_DUP_RLS_OWNER_APPLY_CONFIRMED",
  "A16Q_DUP_RLS_VERIFY_PASS_CONFIRMED",
  "A16Q_DUP_IMPORT_SESSION_ID=8158711d-1c3c-4208-987d-6fec6a1c5a1a",
  "unresolved_duplicate_rows=8",
  "PATCH /api/admin/import-sessions/[sessionId]/duplicates/[duplicateId]",
  "import_duplicate_candidates",
  "owner_decision",
  "decided_by",
  "decided_at",
  "decision_note",
  "canRunOfficialImport=false",
  "official import button remains disabled",
  "No RPC call",
  "No POST call to `/official-import`",
  "No SQL run by Codex",
  "No DB push",
  "No writes to real genealogy tables",
  "No deploy and no push",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

if (
  packageJson?.scripts?.["check:a16q-dup-rls-verify-ui-write-pass"] !==
  "node scripts/check-a16q-dup-rls-verify-ui-write-pass.cjs"
) {
  failures.push("missing package script check:a16q-dup-rls-verify-ui-write-pass");
}

for (const [content, token, label] of [
  [index, "PLAN_A16Q_DUP_RLS_VERIFY_UI_WRITE_PASS.md", "index entry"],
  [
    workLog,
    "A16Q_DUP_RLS_UI_WRITE_STATUS=OWNER_RLS_VERIFY_PASS_UI_WRITE_ENABLED",
    "work log status",
  ],
  [decisionLog, "Decision 226", "decision log entry"],
  [
    handoff,
    "A16Q_DUP_RLS_UI_WRITE_STATUS=OWNER_RLS_VERIFY_PASS_UI_WRITE_ENABLED",
    "handoff status",
  ],
]) {
  requireIncludes(content, token, label);
}

for (const token of [
  "export async function PATCH",
  "updateDuplicateOwnerDecision",
  "sessionId",
  "duplicateId",
]) {
  requireIncludes(patchRoute, token, `PATCH route token ${token}`);
}
rejectPattern(patchRoute, /\.rpc\s*\(/i, "PATCH route must not call RPC");
rejectPattern(
  patchRoute,
  /official-import|a16p_tx_execute_giapha4_official_import/i,
  "PATCH route must not touch official import",
);

for (const token of [
  "updateDuplicateOwnerDecision",
  "maybeCreateServerSupabaseClient",
  "getPermissionContext",
  "allowedOwnerDecisions",
  "unresolved",
  "create_new",
  "link_existing",
  "ignore_candidate",
  "needs_review",
  ".from(\"import_duplicate_candidates\")",
  ".update({",
  "owner_decision: ownerDecision",
  "decided_by: context.profile.id",
  "decided_at: decidedAt",
  "decision_note: decisionNote",
  ".eq(\"id\", input.duplicateId)",
  ".eq(\"import_session_id\", input.sessionId)",
  "ownerDecision === \"link_existing\"",
  "existing_person_id",
  "canProceedToOfficialImport: false",
  "canRunOfficialImport: false",
]) {
  requireIncludes(service, token, `duplicate service token ${token}`);
}
rejectPattern(service, /\.rpc\s*\(/i, "duplicate service must not call RPC");
rejectPattern(
  service,
  /a16p_tx_execute_giapha4_official_import|official-import/i,
  "duplicate service must not touch official import",
);
rejectPattern(
  service,
  /\.from\(\s*["'](people|relationships|families|tree_layout|revisions|profiles)["']\s*\)[\s\S]{0,240}\.update\s*\(/i,
  "duplicate service must not update real genealogy tables",
);

for (const token of [
  "\"use client\"",
  "method: \"PATCH\"",
  "Ứng viên trùng cần quyết định",
  "Quyết định này chỉ lưu ở vùng staging",
  "Lưu quyết định",
  "Đã lưu quyết định",
  "Tạo người mới",
  "Liên kết với người đã có",
  "Bỏ qua ứng viên",
  "Cần rà soát thêm",
  "router.refresh",
]) {
  requireIncludes(clientPanel, token, `client panel token ${token}`);
}
requireIncludes(panel, "DuplicateDecisionReviewClient", "server panel renders client decision UI");
requireIncludes(panel, "Xác nhận nhập chính thức — chưa mở", "official import disabled copy");
requireIncludes(panel, "disabled", "official import button disabled");
requireIncludes(panel, "aria-disabled=\"true\"", "official import aria disabled");

for (const token of [
  "unresolvedDuplicateCandidates === 0",
  "needsReviewDuplicateCandidates === 0",
  "canProceedToOfficialImport: false",
]) {
  requireIncludes(reviewPack, token, `review pack duplicate gate token ${token}`);
}

for (const token of [
  "unresolvedDuplicateCandidates > 0",
  "needsReviewDuplicateCandidates > 0",
  "canOpenOfficialImport: false",
  "officialImportEnabled: false",
]) {
  requireIncludes(preflightGate, token, `preflight gate token ${token}`);
}

for (const token of [
  "unresolvedDuplicateCandidates > 0",
  "needsReviewDuplicateCandidates > 0",
  "canRunOfficialImport: false",
]) {
  requireIncludes(officialService, token, `official service duplicate gate token ${token}`);
}
rejectPattern(officialService, /\.rpc\s*\(/i, "official service must not call RPC");

const changedFiles = gitOutput(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  checkerPath,
  servicePath,
  panelPath,
  clientPanelPath,
  patchRoutePath,
  "package.json",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "scripts/check-a16q-dup-duplicate-candidate-owner-decision-review.cjs",
  "scripts/check-a16q-dup-rls-verify-ui-write-blocked.cjs",
  "lib/import/giapha4/manifest-validation-service.ts",
  "docs/PLAN_A16Q_FIX3_LUNAR_DEATH_DATE_CONTRADICTION.md",
  "scripts/check-a16q-fix3-lunar-death-date-contradiction.cjs",
  "scripts/check-a16q-fix-import-session-ui-date-hydration.cjs",
  "scripts/check-a16q-fix2-row95-date-count-consistency.cjs",
  "docs/PLAN_A16Q_DUP_SAVE_FIX.md",
  "scripts/check-a16q-dup-save-fix.cjs",
  "docs/PLAN_A16Q_DUP_LIVE_SAVE_FIX.md",
  "scripts/check-a16q-dup-live-save-fix.cjs",
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === ".env.local" || file.endsWith(".env.local")) {
    failures.push(".env.local must not be changed");
  }
  if (file.startsWith("db/migrations/") || file.startsWith("supabase/migrations/")) {
    failures.push(`migration must not change in this phase ${file}`);
  }
  if (file.startsWith("db/checks/")) {
    failures.push(`SQL check must not change in this phase ${file}`);
  }
  if (file.startsWith("supabase/.temp/")) {
    failures.push(`supabase/.temp must not be changed ${file}`);
  }
  if (/\.(xls|xlsx|csv|png|jpg|jpeg|webp|zip|storageState\.json)$/i.test(file)) {
    failures.push(`real data/storage/screenshot file must not be changed ${file}`);
  }
}

const scriptFiles = gitOutput(["ls-files", "scripts"])
  .split(/\r?\n/)
  .filter(Boolean)
  .filter((file) => !path.basename(file).startsWith("check-"));

for (const file of scriptFiles) {
  const content = readFile(file);
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

for (const content of [doc, service, patchRoute, clientPanel]) {
  rejectPattern(content, /service_role|SUPABASE_SERVICE_ROLE|eyJ[A-Za-z0-9_-]{20,}\./, "secret-like token");
}

if (failures.length > 0) {
  console.error("A-16Q-DUP-RLS-VERIFY-UI-WRITE-PASS checker failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16Q-DUP-RLS-VERIFY-UI-WRITE-PASS checker PASS");
