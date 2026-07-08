const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16R_UI_COPY_REFRESH_OFFICIAL_IMPORT_GATE.md";
const checkerPath = "scripts/check-a16r-ui-copy-refresh-official-import-gate.cjs";
const packagePath = "package.json";
const wranglerPath = "wrangler.toml";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const officialServicePath = "lib/import/giapha4/official-import-service.ts";
const officialRoutePath =
  "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";
const dryRunGatePath = "lib/import/giapha4/import-dry-run-approval-gate.ts";
const officialGatePath = "lib/import/giapha4/official-import-preflight-gate.ts";

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

function rejectIncludes(content, token, label = token) {
  if (content.includes(token)) failures.push(`forbidden ${label}`);
}

function rejectPattern(content, pattern, label = String(pattern)) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

const doc = read(docPath);
const packageJson = readJson(packagePath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const panel = read(panelPath);
const officialService = read(officialServicePath);
const officialRoute = read(officialRoutePath);
const dryRunGate = read(dryRunGatePath);
const officialGate = read(officialGatePath);

for (const token of [
  "A-16R-UI-COPY-REFRESH-OFFICIAL-IMPORT-GATE",
  "A16R_UI_COPY_REFRESH_OFFICIAL_IMPORT_GATE_STATUS=PASS_UI_COPY_CLARIFIED_FAIL_CLOSED",
  "A16R_UI_COPY_REFRESH_CLASSIFICATION=UI_COPY_CLARIFIED_A16K_DRY_RUN_SEPARATE_FROM_A16R_OFFICIAL_IMPORT",
  "A16R_UI_COPY_REFRESH_A16K_A16R_SEPARATED=YES",
  "A16R_UI_COPY_REFRESH_DRY_RUN_DOES_NOT_AUTHORIZE_OFFICIAL_IMPORT=YES",
  "A16R_UI_COPY_REFRESH_OFFICIAL_IMPORT_BUTTON=DISABLED",
  "A16R_UI_COPY_REFRESH_CAN_RUN_OFFICIAL_IMPORT=false",
  "A16R_UI_COPY_REFRESH_CAN_RUN_OFFICIAL_IMPORT_FORCED_TRUE=NO",
  "A16R_UI_COPY_REFRESH_FAIL_CLOSED_GUARDS_WEAKENED=NO",
  "A16R_UI_COPY_REFRESH_LOCK_REASON=NO_EXACT_SESSION_EXECUTION_APPROVAL_AND_OWNER_ADMIN_PRODUCTION_CONTEXT_NOT_PROVEN",
  "APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "APPROVE_A16R_RUNTIME_EXECUTION_AFTER_A16V_VERIFY",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "A16R_UI_COPY_REFRESH_DEPLOY_RUN=NO",
  "A16R_UI_COPY_REFRESH_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16R_UI_COPY_REFRESH_OFFICIAL_IMPORT_CONFIRM_BUTTON_CLICKED=NO",
  "A16R_UI_COPY_REFRESH_DIRECT_RPC_CALLED=NO",
  "A16R_UI_COPY_REFRESH_REAL_GENEALOGY_WRITE=NO",
  "A16R_UI_COPY_REFRESH_SQL_RUN=NO",
  "A16R_UI_COPY_REFRESH_DB_PUSH_RUN=NO",
  "A16R_UI_COPY_REFRESH_MIGRATION_REPAIR_RUN=NO",
  "A16R_UI_COPY_REFRESH_SEED_RUN=NO",
  "A16R_UI_COPY_REFRESH_PERMISSIONS_ROLES_AUTH_USERS_MEMBERSHIPS_MUTATED=NO",
  "A16R_UI_COPY_REFRESH_WINDOWS_LOCAL_DEPLOY_RUN=NO",
  "A16R_UI_COPY_REFRESH_WRANGLER_TOML_CHANGED=NO",
  "A16R_UI_COPY_REFRESH_NEXT_ALLOWED_ACTION=OWNER_LOGIN_TO_PRODUCTION_WITH_EXPECTED_OWNER_ADMIN_ACCOUNT_THEN_RERUN_AUTHENTICATED_READ_ONLY_GATE_SMOKE_NO_POST_DO_NOT_IMPORT",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "Cổng kiểm tra thử / dry-run A-16K",
  "Cổng dry-run chỉ dành cho bước xem trước",
  "Marker A-16K bên dưới chỉ mở bước kiểm tra thử và xem trước mapping.",
  "Nó không có nghĩa là được chạy nhập chính thức",
  "Nhập chính thức thuộc cổng A-16R riêng ở phía dưới.",
  "Marker dry-run A-16K:",
  "Chạy dry-run - cần phê duyệt A-16K",
  "Cổng nhập chính thức A-16R",
  "Trạng thái hiện tại: nhập chính thức vẫn khóa",
  "Cổng A-16R là cổng chạy thật.",
  "A-16K dry-run",
  "không thay thế cho cổng thực thi A-16R.",
  "officialImportSessionMarker",
  "A16R_AUDITED_OFFICIAL_IMPORT_MARKER",
  "A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID",
  "officialImportSessionMismatch",
  "Marker chạy thật cho đúng phiên A-16R:",
  "Marker bật runtime execution sau A-16V, tách riêng với marker",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_MARKER",
  "Không chạy nhập chính thức trong phase này.",
  "disabled",
  "aria-disabled=\"true\"",
  "Xác nhận nhập chính thức - đang khóa",
]) {
  requireIncludes(panel, token, `panel token ${token}`);
}

for (const [content, token, label] of [
  [dryRunGate, "APPROVE_A16K_IMPORT_DRY_RUN_GATE", "A-16K dry-run marker"],
  [dryRunGate, "canRunDryRun: false", "A-16K dry-run remains locked"],
  [dryRunGate, "officialImportOpen: false", "A-16K does not open official import"],
  [officialGate, "canOpenOfficialImport: false", "A-16R gate canOpen false"],
  [officialGate, "officialImportEnabled: false", "A-16R gate enabled false"],
  [officialService, "canRunOfficialImport: false", "official service canRun false"],
  [officialService, "A16R_AUDITED_OFFICIAL_IMPORT_MARKER", "official service audited marker"],
  [officialService, "A16U_REQUIRED_A16R_RETRY_MARKER =\n  A16R_AUDITED_OFFICIAL_IMPORT_MARKER", "official service audited marker alias"],
  [officialService, "A16R_BLOCKED_RUNTIME_EXECUTION_NOT_ENABLED_AFTER_A16V_VERIFY", "runtime blocker"],
  [officialRoute, "export async function POST", "POST route exists but not called"],
  [officialRoute, "canRunOfficialImport: false", "route canRun false"],
]) {
  requireIncludes(content, token, label);
}

rejectIncludes(
  panel,
  "Marker yêu cầu: {dryRunGate.dryRunGate.requiredMarker}",
  "old generic dry-run marker UI copy",
);
rejectIncludes(
  panel,
  "Marker session-specific cho phase chạy thật",
  "old generic official session UI copy",
);
rejectIncludes(
  panel,
  "officialImportGate.requiredFutureMarker",
  "generic placeholder marker must not be rendered",
);

for (const [label, content] of [
  [officialServicePath, officialService],
  [officialRoutePath, officialRoute],
]) {
  rejectPattern(content, /\.rpc\s*\(/i, `${label} must not call direct RPC`);
  rejectPattern(content, /canRunOfficialImport:\s*true/, `${label} must remain fail-closed`);
}

rejectPattern(doc + panel + officialService + officialRoute, /SUPABASE_SERVICE_ROLE_KEY\s*=/i, "secret assignment");
rejectPattern(doc + panel + officialService + officialRoute, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");

if (
  packageJson?.scripts?.["check:a16r-ui-copy-refresh-official-import-gate"] !==
  "node scripts/check-a16r-ui-copy-refresh-official-import-gate.cjs"
) {
  failures.push("missing package script check:a16r-ui-copy-refresh-official-import-gate");
}

for (const [content, token, label] of [
  [index, "PLAN_A16R_UI_COPY_REFRESH_OFFICIAL_IMPORT_GATE.md", "index UI copy entry"],
  [workLog, "A16R_UI_COPY_REFRESH_OFFICIAL_IMPORT_GATE_STATUS=PASS_UI_COPY_CLARIFIED_FAIL_CLOSED", "work log UI copy status"],
  [decisionLog, "A-16R import UI copy separates dry-run preview from official import execution while staying locked", "decision log UI copy decision"],
  [handoff, "A16R_UI_COPY_REFRESH_OFFICIAL_IMPORT_GATE_STATUS=PASS_UI_COPY_CLARIFIED_FAIL_CLOSED", "handoff UI copy status"],
]) {
  requireIncludes(content, token, label);
}

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const a16oRuntimeChangedFiles = new Set([
  "app/api/admin/import-sessions/[sessionId]/dry-run-preview/route.ts",
  "lib/import/giapha4/dry-run-mapping-preview-service.ts",
  "lib/import/giapha4/manifest-read-service.ts",
]);

const allowedChangedFiles = new Set([
  ".gitignore",
  docPath,
  checkerPath,
  "docs/PLAN_A16R_OFFICIAL_IMPORT_SESSION_ID_RECONCILIATION.md",
  "scripts/check-a16r-official-import-session-id-reconciliation.cjs",
  "docs/PLAN_A16R_FIX_OFFICIAL_IMPORT_SESSION_SELECTION_MISMATCH.md",
  "scripts/check-a16r-fix-official-import-session-selection-mismatch.cjs",
  "docs/PLAN_A16K_OWNER_DRY_RUN_GATE_APPROVAL_AFTER_A16R_FIX.md",
  "scripts/check-a16k-owner-dry-run-gate-approval-after-a16r-fix.cjs",
  dryRunGatePath,
  "app/api/admin/import-sessions/[sessionId]/dry-run-gate/route.ts",
  panelPath,
  officialServicePath,
  packagePath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "docs/PLAN_A16L_DRY_RUN_PREVIEW_OWNER_REVIEW_RELATIONSHIP_AUDIT.md",
  "docs/PLAN_A16M_RELATIONSHIP_ROLE_MAPPING_ROOT_CAUSE_PLAN.md",
  "docs/PLAN_A16N_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EVIDENCE.md",
  "docs/evidence/A16N_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EVIDENCE_TEMPLATE.md",
  "scripts/audit-a16n-full-dry-run-relationships.cjs",
  "scripts/check-a16n-full-dry-run-relationship-audit-evidence.cjs",
  "docs/PLAN_A16O_UNCAP_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY.md",
  "scripts/check-a16o-uncap-dry-run-relationship-audit-export-read-only.cjs",
  "docs/PLAN_A16O_DEPLOY_READ_ONLY_AUDIT_EXPORT_SMOKE.md",
  "scripts/check-a16o-deploy-read-only-audit-export-smoke.cjs",
  ...a16oRuntimeChangedFiles,
  "scripts/check-a16k-owner-approval-gate-dry-run-import.cjs",
  "scripts/check-a16l-dry-run-mapping-preview.cjs",
  "scripts/check-a16l-dry-run-preview-owner-review-relationship-audit.cjs",
  "scripts/check-a16m-relationship-role-mapping-root-cause-plan.cjs",
  "scripts/check-a16r-production-ui-gate-state-reconciliation.cjs",
  "scripts/check-a16r-official-import-gate-readiness-diagnosis.cjs",
  "scripts/check-a16r-owner-auth-gate-smoke-and-evidence-bundle.cjs",
  "scripts/check-a16r-runtime-execution-enablement-gate.cjs",
  "scripts/check-a16r-runtime-execution-enablement-owner-review.cjs",
  "scripts/check-a16t-apply-verify.cjs",
  "scripts/check-a16u-locked-runtime-wiring.cjs",
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === ".env.local" || file.endsWith(".env.local")) failures.push(`forbidden env file ${file}`);
  if (file.startsWith("supabase/.temp/")) failures.push(`forbidden supabase temp ${file}`);
  if (/\.(xls|xlsx|csv|png|jpg|jpeg|webp|zip)$/i.test(file)) {
    failures.push(`forbidden data/screenshot file ${file}`);
  }
  if (/^(db\/migrations|supabase\/migrations|db\/checks)\//.test(file)) {
    failures.push(`forbidden SQL/check file ${file}`);
  }
  if (
    file === wranglerPath ||
    file === "open-next.config.ts" ||
    file === "next.config.ts" ||
    file.startsWith(".github/workflows/") ||
    (file.startsWith("app/") &&
      !a16oRuntimeChangedFiles.has(file) &&
      file !== "app/api/admin/import-sessions/[sessionId]/dry-run-gate/route.ts") ||
    (file.startsWith("lib/") &&
      !a16oRuntimeChangedFiles.has(file) &&
      file !== officialServicePath &&
      file !== dryRunGatePath)
  ) {
    failures.push(`runtime/config/source file must not change in this phase ${file}`);
  }
}

const stagedFiles = git(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected staged file ${file}`);
}

if (failures.length > 0) {
  console.error("A-16R UI copy refresh official import gate check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16R UI copy refresh official import gate check passed.");
