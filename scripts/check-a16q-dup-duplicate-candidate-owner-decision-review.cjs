const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath =
  "docs/PLAN_A16Q_DUPLICATE_CANDIDATE_OWNER_DECISION_REVIEW.md";
const checkerPath =
  "scripts/check-a16q-dup-duplicate-candidate-owner-decision-review.cjs";
const servicePath =
  "lib/import/giapha4/duplicate-decision-review-service.ts";
const readServicePath = "lib/import/giapha4/manifest-read-service.ts";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const gatePath = "lib/import/giapha4/official-import-preflight-gate.ts";
const officialServicePath = "lib/import/giapha4/official-import-service.ts";
const reviewPackPath = "lib/import/giapha4/import-review-pack-service.ts";
const routePath = "app/api/admin/import-sessions/[sessionId]/duplicates/route.ts";
const patchRoutePath =
  "app/api/admin/import-sessions/[sessionId]/duplicates/[duplicateId]/route.ts";
const migrationPath =
  "db/migrations/20260701_0013_a16q_dup_duplicate_decision_rls_candidate.sql";
const mirrorMigrationPath =
  "supabase/migrations/20260701_0013_a16q_dup_duplicate_decision_rls_candidate.sql";
const checkSqlPath =
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

function rejectPattern(content, pattern, label = String(pattern)) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

const doc = readFile(docPath);
readFile(checkerPath);
const packageJson = readJson("package.json");
const service = readFile(servicePath);
const readService = readFile(readServicePath);
const panel = readFile(panelPath);
const gate = readFile(gatePath);
const officialService = readFile(officialServicePath);
const reviewPack = readFile(reviewPackPath);
const route = readFile(routePath);
const migration = readFile(migrationPath);
const mirrorMigration = readFile(mirrorMigrationPath);
const checkSql = readFile(checkSqlPath);
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");
const passBranchActive = fs.existsSync(path.join(root, passDocPath));
const clientPanel = passBranchActive ? readFile(clientPanelPath) : "";

for (const token of [
  "A-16Q-DUP",
  "A16Q_DUP_STATUS=BLOCKED_DUPLICATE_DECISION_RLS_UPDATE_MISSING",
  "A16Q_DUP_IMPORT_SESSION_ID=8158711d-1c3c-4208-987d-6fec6a1c5a1a",
  "duplicate_candidate_count=8",
  "unresolved_duplicate_rows=8",
  "Không được chạy A-16R",
  "Không có policy UPDATE an toàn",
  "GET /api/admin/import-sessions/[sessionId]/duplicates",
  "canEditDecisions=false",
  "canRunOfficialImport=false",
  "Official import UI button disabled",
  "Final: `create_new`, `link_existing`, `ignore_candidate`",
  "Blocking: `unresolved`, `needs_review`",
  "hold` tương đương `needs_review`",
  "skip` tương đương `ignore_candidate`",
  "SQL_CANDIDATE_STATUS=NOT_APPLIED",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

if (
  packageJson?.scripts?.[
    "check:a16q-dup-duplicate-candidate-owner-decision-review"
  ] !== "node scripts/check-a16q-dup-duplicate-candidate-owner-decision-review.cjs"
) {
  failures.push("missing package script check:a16q-dup-duplicate-candidate-owner-decision-review");
}

for (const [content, token, label] of [
  [index, "PLAN_A16Q_DUPLICATE_CANDIDATE_OWNER_DECISION_REVIEW.md", "index entry"],
  [workLog, "A16Q_DUP_STATUS=BLOCKED_DUPLICATE_DECISION_RLS_UPDATE_MISSING", "work log status"],
  [decisionLog, "Decision 224", "decision log entry"],
  [handoff, "A16Q_DUP_STATUS=BLOCKED_DUPLICATE_DECISION_RLS_UPDATE_MISSING", "handoff status"],
]) {
  requireIncludes(content, token, label);
}

for (const token of [
  "A16Q_DUPLICATE_DECISION_REVIEW_MARKER",
  "A16Q_DUP_STATUS=BLOCKED_DUPLICATE_DECISION_RLS_UPDATE_MISSING",
  "canRunOfficialImport: false",
  "officialImportButtonDisabled: true",
  "unresolvedDuplicateCandidates",
  "needsReviewDuplicateCandidates",
  "owner_decision",
  "decided_by",
  "decided_at",
  "decision_note",
  "isBlockingDuplicateDecision",
  "needs_review",
  "ignore_candidate",
]) {
  requireIncludes(service, token, `service token ${token}`);
}
if (passBranchActive) {
  requireIncludes(service, "canEditDecisions: true", "PASS branch canEditDecisions true");
  requireIncludes(service, "updateDuplicateOwnerDecision", "PASS branch update service");
} else {
  requireIncludes(service, "canEditDecisions: false", "blocked branch canEditDecisions false");
  requireIncludes(service, "editBlockedReasons", "blocked branch edit blocked reasons");
  rejectPattern(service, /\.update\s*\(/i, "duplicate review service must not update");
}
rejectPattern(service, /\.rpc\s*\(/i, "duplicate review service must not call RPC");

for (const token of [
  "getDuplicateDecisionReview",
  "NextResponse.json",
  "GET",
]) {
  requireIncludes(route, token, `GET route token ${token}`);
}
rejectPattern(route, /export\s+async\s+function\s+PATCH/i, "GET route must not PATCH");
rejectPattern(route, /method\s*:\s*["']POST["']/i, "GET route must not POST");

if (fs.existsSync(path.join(root, patchRoutePath))) {
  const patchRoute = readFile(patchRoutePath);
  if (passBranchActive) {
    requireIncludes(patchRoute, "export async function PATCH", "PASS branch PATCH route");
    requireIncludes(patchRoute, "updateDuplicateOwnerDecision", "PASS branch PATCH service call");
    rejectPattern(patchRoute, /\.rpc\s*\(/i, "PATCH route must not call RPC");
  } else {
    rejectPattern(
      patchRoute,
      /export\s+async\s+function\s+PATCH/i,
      "PATCH duplicate route must not exist before RLS update apply",
    );
  }
}

for (const token of [
  "decided_by",
  "decided_at",
  "ownerDecision: row.owner_decision",
  "decidedBy: row.decided_by",
  "decidedAt: row.decided_at",
]) {
  requireIncludes(readService, token, `read service token ${token}`);
}

if (passBranchActive) {
  requireIncludes(panel, "DuplicateDecisionReviewClient", "server panel client duplicate review");
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
    "Ứng viên trùng cần quyết định",
    "Cổng quyết định đang khóa",
    "Lưu quyết định ứng viên trùng — chưa mở",
    "disabled",
    "aria-disabled=\"true\"",
    "Trùng chưa quyết định",
    "Mẫu người đang đọc",
    "Mẫu quan hệ đang đọc",
  ]) {
    requireIncludes(panel, token, `panel token ${token}`);
  }
}

for (const token of [
  "duplicateDecisionSummary",
  "unresolvedDuplicateCandidates",
  "needsReviewDuplicateCandidates",
  "canRunOfficialImport: false",
]) {
  requireIncludes(reviewPack, token, `review pack token ${token}`);
}

for (const token of [
  "buildDuplicateDecisionSummary",
  "ứng viên trùng chưa có quyết định owner",
  "ứng viên trùng cần chủ nhà rà soát",
  "canOpenOfficialImport: false",
  "officialImportEnabled: false",
]) {
  requireIncludes(gate, token, `gate token ${token}`);
}

for (const token of [
  "buildDuplicateDecisionSummary",
  "Còn ứng viên trùng chưa có quyết định owner",
  "Còn ứng viên trùng đang ở trạng thái cần chủ nhà rà soát",
  "canRunOfficialImport: false",
]) {
  requireIncludes(officialService, token, `official service token ${token}`);
}
rejectPattern(officialService, /ownerDecision\s*===\s*["']pending["']/, "legacy pending duplicate gate");
rejectPattern(officialService, /\.rpc\s*\(/i, "official import service must not call RPC");

if (migration !== mirrorMigration) {
  failures.push("A-16Q-DUP db/supabase migration files must be byte-for-byte identical");
}

for (const token of [
  "SQL_CANDIDATE_STATUS=NOT_APPLIED",
  "DO_NOT_RUN_SUPABASE_DB_PUSH",
  "NO_OFFICIAL_IMPORT_EXECUTION",
  "NO_PEOPLE_RELATIONSHIP_FAMILY_LAYOUT_REVISION_WRITE",
  "NO_ANON_OR_PUBLIC_POLICY",
  "NO_ANON_OR_PUBLIC_GRANT",
  "drop constraint if exists import_duplicate_candidates_owner_decision_check",
  "needs_review",
  "ignore_candidate",
  "revoke update on public.import_duplicate_candidates from authenticated",
  "grant update (",
  "owner_decision",
  "decided_by",
  "decided_at",
  "decision_note",
  "for update",
  "to authenticated",
  "public.has_permission('imports.create')",
  "created_by = public.current_profile_id()",
  "owner_decision <> 'link_existing'",
]) {
  requireIncludes(migration, token, `migration token ${token}`);
}

for (const token of [
  "SELECT-only verification",
  "pg_policies",
  "information_schema.column_privileges",
  "update_policy_exists",
  "owner_scoped_policy",
  "decision_constraint_supports_review_values",
  "no_public_or_anon_policy",
]) {
  requireIncludes(checkSql, token, `check SQL token ${token}`);
}
rejectPattern(
  checkSql,
  /^\s*(insert|update|delete|alter|create|drop|grant|revoke)\b/im,
  "check SQL must stay SELECT-only",
);

const changedFiles = gitOutput(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  checkerPath,
  servicePath,
  readServicePath,
  panelPath,
  gatePath,
  officialServicePath,
  reviewPackPath,
  routePath,
  patchRoutePath,
  passDocPath,
  passCheckerPath,
  clientPanelPath,
  migrationPath,
  mirrorMigrationPath,
  checkSqlPath,
  "package.json",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "scripts/check-a16q-fix-import-session-ui-date-hydration.cjs",
  "scripts/check-a16q-fix2-row95-date-count-consistency.cjs",
  "scripts/check-a16q-local-ui-import-smoke-gate-copy-refresh.cjs",
  "scripts/check-a16q-dup-rls-verify-ui-write-blocked.cjs",
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === ".env.local" || file.endsWith(".env.local")) {
    failures.push(".env.local must not be changed");
  }
  if (file.startsWith("supabase/.temp/")) {
    failures.push(`supabase/.temp must not be changed ${file}`);
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

for (const content of [doc, service, route, migration, checkSql]) {
  rejectPattern(content, /service_role|SUPABASE_SERVICE_ROLE|eyJ[A-Za-z0-9_-]{20,}\./, "secret-like token");
}

if (failures.length > 0) {
  console.error("A-16Q-DUP checker failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16Q-DUP checker PASS");
