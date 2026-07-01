const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16Q_DUP_RLS_VERIFY_UI_WRITE_BLOCKED.md";
const checkerPath = "scripts/check-a16q-dup-rls-verify-ui-write-blocked.cjs";
const packagePath = "package.json";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const getRoutePath = "app/api/admin/import-sessions/[sessionId]/duplicates/route.ts";
const patchRoutePath =
  "app/api/admin/import-sessions/[sessionId]/duplicates/[duplicateId]/route.ts";
const duplicateServicePath =
  "lib/import/giapha4/duplicate-decision-review-service.ts";
const reviewPackPath = "lib/import/giapha4/import-review-pack-service.ts";
const preflightGatePath = "lib/import/giapha4/official-import-preflight-gate.ts";
const officialServicePath = "lib/import/giapha4/official-import-service.ts";
const migrationPath =
  "db/migrations/20260701_0013_a16q_dup_duplicate_decision_rls_candidate.sql";
const mirrorMigrationPath =
  "supabase/migrations/20260701_0013_a16q_dup_duplicate_decision_rls_candidate.sql";
const sqlCheckPath =
  "db/checks/20260701_check_a16q_dup_duplicate_decision_rls.sql";
const passDocPath = "docs/PLAN_A16Q_DUP_RLS_VERIFY_UI_WRITE_PASS.md";
const passCheckerPath = "scripts/check-a16q-dup-rls-verify-ui-write-pass.cjs";
const clientPanelPath = "components/imports/duplicate-decision-review-client.tsx";

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
const packageJson = readJson(packagePath);
const panel = readFile(panelPath);
const getRoute = readFile(getRoutePath);
const duplicateService = readFile(duplicateServicePath);
const reviewPack = readFile(reviewPackPath);
const preflightGate = readFile(preflightGatePath);
const officialService = readFile(officialServicePath);
const migration = readFile(migrationPath);
const mirrorMigration = readFile(mirrorMigrationPath);
const sqlCheck = readFile(sqlCheckPath);
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");
const passBranchActive = fs.existsSync(path.join(root, passDocPath));
const clientPanel = passBranchActive ? readFile(clientPanelPath) : "";

for (const token of [
  "A-16Q-DUP-RLS-VERIFY-UI-WRITE",
  "A16Q_DUP_RLS_UI_WRITE_STATUS=BLOCKED_MISSING_OWNER_RLS_APPLY_VERIFY_EVIDENCE",
  "A16Q_DUP_IMPORT_SESSION_ID=8158711d-1c3c-4208-987d-6fec6a1c5a1a",
  "A16Q_DUP_RLS_OWNER_APPLY_CONFIRMED",
  "A16Q_DUP_RLS_VERIFY_PASS_CONFIRMED",
  "Không bật PATCH route active",
  "Không bật nút lưu decision",
  "canEditDecisions=false",
  "canRunOfficialImport=false",
  "Official import button vẫn disabled",
  "Không tạo `PATCH /api/admin/import-sessions/[sessionId]/duplicates/[duplicateId]`",
  "Không gọi RPC",
  "Không gọi POST `/official-import`",
  "Không ghi `people`, `relationships`, `families`, `layout`, `tree`, `revision` hoặc `profile` thật",
  "unresolved_duplicate_rows=8",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

if (
  packageJson?.scripts?.["check:a16q-dup-rls-verify-ui-write-blocked"] !==
  "node scripts/check-a16q-dup-rls-verify-ui-write-blocked.cjs"
) {
  failures.push("missing package script check:a16q-dup-rls-verify-ui-write-blocked");
}

for (const [content, token, label] of [
  [index, "PLAN_A16Q_DUP_RLS_VERIFY_UI_WRITE_BLOCKED.md", "index entry"],
  [
    workLog,
    "A16Q_DUP_RLS_UI_WRITE_STATUS=BLOCKED_MISSING_OWNER_RLS_APPLY_VERIFY_EVIDENCE",
    "work log status",
  ],
  [decisionLog, "Decision 225", "decision log entry"],
  [
    handoff,
    "A16Q_DUP_RLS_UI_WRITE_STATUS=BLOCKED_MISSING_OWNER_RLS_APPLY_VERIFY_EVIDENCE",
    "handoff status",
  ],
]) {
  requireIncludes(content, token, label);
}

for (const token of [
  "getDuplicateDecisionReview",
  "export async function GET",
]) {
  requireIncludes(getRoute, token, `GET duplicate route token ${token}`);
}
rejectPattern(getRoute, /export\s+async\s+function\s+PATCH/i, "GET route must not define PATCH");
rejectPattern(getRoute, /\.update\s*\(/i, "GET route must not update");
rejectPattern(getRoute, /\.rpc\s*\(/i, "GET route must not call RPC");

if (fs.existsSync(path.join(root, patchRoutePath))) {
  const patchRoute = readFile(patchRoutePath);
  if (passBranchActive) {
    requireIncludes(patchRoute, "export async function PATCH", "PASS branch PATCH route");
    requireIncludes(patchRoute, "updateDuplicateOwnerDecision", "PASS branch PATCH service call");
    rejectPattern(patchRoute, /\.rpc\s*\(/i, "PATCH route must not call RPC");
  } else if (/export\s+async\s+function\s+PATCH/i.test(patchRoute)) {
    failures.push("PATCH duplicate route must not be active without owner RLS evidence");
  }
}

const duplicateServiceTokens = [
  "canRunOfficialImport: false",
  "officialImportButtonDisabled: true",
];
if (passBranchActive) {
  duplicateServiceTokens.push("canEditDecisions: true", "updateDuplicateOwnerDecision");
} else {
  duplicateServiceTokens.push(
    "canEditDecisions: false",
    "editBlockedReasons",
    "Thiếu policy UPDATE an toàn",
  );
}
for (const token of duplicateServiceTokens) {
  requireIncludes(duplicateService, token, `duplicate service token ${token}`);
}
if (!passBranchActive) {
  rejectPattern(duplicateService, /\.update\s*\(/i, "duplicate service must not update in blocked branch");
}
rejectPattern(duplicateService, /\.rpc\s*\(/i, "duplicate service must not call RPC");

if (passBranchActive) {
  requireIncludes(panel, "DuplicateDecisionReviewClient", "PASS branch duplicate client panel");
  for (const token of [
    "Ứng viên trùng cần quyết định",
    "Quyết định này chỉ lưu ở vùng staging",
    "Lưu quyết định",
    "Đã lưu quyết định",
    "method: \"PATCH\"",
  ]) {
    requireIncludes(clientPanel, token, `client panel token ${token}`);
  }
} else {
for (const token of [
  "Lưu quyết định ứng viên trùng — chưa mở",
  "Cổng quyết định đang khóa",
  "disabled",
  "aria-disabled=\"true\"",
]) {
  requireIncludes(panel, token, `panel blocked UI token ${token}`);
}
rejectIncludes(panel, "Đã lưu quyết định", "save success copy must not be enabled in blocked branch");
rejectPattern(
  panel,
  /fetch\s*\([\s\S]{0,240}duplicates[\s\S]{0,240}method\s*:\s*["']PATCH["']/i,
  "panel must not call PATCH duplicate decision in blocked branch",
);
}

for (const token of [
  "unresolvedDuplicateCandidates === 0",
  "needsReviewDuplicateCandidates === 0",
  "canProceedToOfficialImport: false",
]) {
  requireIncludes(reviewPack, token, `review pack gate token ${token}`);
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
  requireIncludes(officialService, token, `official service lock token ${token}`);
}
rejectPattern(officialService, /\.rpc\s*\(/i, "official import service must not call RPC");

for (const token of [
  "SQL_CANDIDATE_STATUS=NOT_APPLIED",
  "NO_OFFICIAL_IMPORT_EXECUTION",
  "NO_PEOPLE_RELATIONSHIP_FAMILY_LAYOUT_REVISION_WRITE",
  "NO_ANON_OR_PUBLIC_POLICY",
  "for update",
  "with check",
]) {
  requireIncludes(migration, token, `migration candidate token ${token}`);
}
if (migration !== mirrorMigration) {
  failures.push("A-16Q-DUP migration mirror must remain byte-for-byte identical");
}

for (const token of [
  "SELECT-only verification",
  "pg_policies",
  "update_policy_exists",
  "owner_scoped_policy",
  "no_public_or_anon_policy",
]) {
  requireIncludes(sqlCheck, token, `SQL check token ${token}`);
}
rejectPattern(
  sqlCheck,
  /^\s*(insert|update|delete|alter|create|drop|grant|revoke)\b/im,
  "SQL check must remain SELECT-only",
);

const changedFiles = gitOutput(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  checkerPath,
  passDocPath,
  passCheckerPath,
  clientPanelPath,
  duplicateServicePath,
  panelPath,
  patchRoutePath,
  "scripts/check-a16q-dup-duplicate-candidate-owner-decision-review.cjs",
  packagePath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === ".env.local" || file.endsWith(".env.local")) {
    failures.push(".env.local must not be changed");
  }
  if (file.startsWith("db/migrations/") || file.startsWith("supabase/migrations/")) {
    failures.push(`migration must not change in blocked branch ${file}`);
  }
  if (file.startsWith("db/checks/")) {
    failures.push(`SQL check file must not change in blocked branch ${file}`);
  }
  if (/\.(xls|xlsx|csv|png|jpg|jpeg|webp|zip)$/i.test(file)) {
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

for (const content of [doc, duplicateService, getRoute]) {
  rejectPattern(content, /service_role|SUPABASE_SERVICE_ROLE|eyJ[A-Za-z0-9_-]{20,}\./, "secret-like token");
}

if (failures.length > 0) {
  console.error("A-16Q-DUP-RLS-VERIFY-UI-WRITE blocked checker failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16Q-DUP-RLS-VERIFY-UI-WRITE blocked checker PASS");
