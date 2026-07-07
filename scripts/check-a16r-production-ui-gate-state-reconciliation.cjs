const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16R_PRODUCTION_UI_GATE_STATE_RECONCILIATION.md";
const checkerPath = "scripts/check-a16r-production-ui-gate-state-reconciliation.cjs";
const packagePath = "package.json";
const wranglerPath = "wrangler.toml";
const dryRunGatePath = "lib/import/giapha4/import-dry-run-approval-gate.ts";
const dryRunPreviewPath = "lib/import/giapha4/dry-run-mapping-preview-service.ts";
const officialGatePath = "lib/import/giapha4/official-import-preflight-gate.ts";
const officialServicePath = "lib/import/giapha4/official-import-service.ts";
const postRoutePath =
  "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";
const gateRoutePath =
  "app/api/admin/import-sessions/[sessionId]/official-import-gate/route.ts";
const importPagePath = "app/(admin)/admin/exports/import/page.tsx";
const panelPath = "components/imports/import-session-manifest-panel.tsx";

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
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const dryRunGate = read(dryRunGatePath);
const dryRunPreview = read(dryRunPreviewPath);
const officialGate = read(officialGatePath);
const officialService = read(officialServicePath);
const postRoute = read(postRoutePath);
const gateRoute = read(gateRoutePath);
const importPage = read(importPagePath);
const panel = read(panelPath);

for (const token of [
  "A-16R-PRODUCTION-UI-GATE-STATE-RECONCILIATION",
  "A16R_PRODUCTION_UI_GATE_STATE_RECONCILIATION_STATUS=PASS_DOCS_CHECKER_ONLY",
  "A16R_PRODUCTION_UI_GATE_STATE_CLASSIFICATION=UI_COPY_STALE_BUT_RUNTIME_GATE_CORRECT",
  "A16R_PRODUCTION_UI_GATE_STATE_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "APPROVE_A16K_IMPORT_DRY_RUN_GATE",
  "APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "APPROVE_A16R_RUNTIME_EXECUTION_AFTER_A16V_VERIFY",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "A16R_PRODUCTION_UI_GATE_STATE_A16K_DRY_RUN_MARKER_REQUIRED=YES",
  "A16R_PRODUCTION_UI_GATE_STATE_A16K_REQUIRED_BEFORE_A16R_SESSION_EXECUTION=NO_SOURCE_EVIDENCE",
  "A16R_PRODUCTION_UI_GATE_STATE_UI_STALE_OR_MISLEADING=YES_DRY_RUN_COPY_CAN_BE_MISREAD_AS_OFFICIAL_IMPORT_BLOCKER",
  "A16R_PRODUCTION_UI_GATE_STATE_PRODUCTION_MISSING_A16K_PERSISTED_EVIDENCE=NO_SOURCE_EVIDENCE_FOR_OFFICIAL_IMPORT",
  "A16R_PRODUCTION_UI_GATE_STATE_SOURCE_CAN_RUN_OFFICIAL_IMPORT=false",
  "A16R_PRODUCTION_UI_GATE_STATE_PRODUCTION_CAN_RUN_OFFICIAL_IMPORT=UNKNOWN_AUTH_OR_PERMISSION_BLOCKED",
  "A16R_PRODUCTION_UI_GATE_STATE_SOURCE_OFFICIAL_IMPORT_BUTTON=DISABLED",
  "A16R_PRODUCTION_UI_GATE_STATE_PRODUCTION_OFFICIAL_IMPORT_BUTTON=UNKNOWN_AUTH_OR_PERMISSION_BLOCKED",
  "YES_FOR_DRY_RUN_GATE_SOURCE",
  "NO_SOURCE_EVIDENCE_A16K_NOT_IN_OFFICIAL_IMPORT_RUNTIME_GATE",
  "SOURCE_FALSE_BECAUSE_A16R_RUNTIME_ENABLEMENT_SESSION_AUTH_PERMISSION_AND_FAIL_CLOSED_GATE_NOT_A16K",
  "A16R_PRODUCTION_UI_GATE_STATE_REMAINING_BLOCKER=OFFICIAL_IMPORT_RUNTIME_SOURCE_FAIL_CLOSED_AND_AUTHENTICATED_OWNER_ADMIN_CONTEXT_NOT_PROVEN",
  "A16R_PRODUCTION_UI_GATE_STATE_A16R_SESSION_MARKER_MISSING=YES_FOR_CURRENT_RUNTIME_EXECUTION_CONTEXT",
  "A16R_PRODUCTION_UI_GATE_STATE_RUNTIME_ENABLEMENT_MARKER_REQUIRED=YES",
  "A16R_PRODUCTION_UI_GATE_STATE_OWNER_ADMIN_AUTH_CONTEXT_PROVEN=NO",
  "A16R_IMPORT_MAY_BE_RETRIED_NEXT=NO",
  "A16R_PRODUCTION_UI_GATE_STATE_NEXT_ALLOWED_ACTION=CREATE_SEPARATE_UI_COPY_REFRESH_PHASE_OR_RERUN_AUTHENTICATED_READ_ONLY_GATE_SMOKE_NO_POST_DO_NOT_IMPORT",
  "A16R_PRODUCTION_UI_GATE_STATE_DEPLOY_RUN=NO",
  "A16R_PRODUCTION_UI_GATE_STATE_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16R_PRODUCTION_UI_GATE_STATE_OFFICIAL_IMPORT_CONFIRM_BUTTON_CLICKED=NO",
  "A16R_PRODUCTION_UI_GATE_STATE_DIRECT_RPC_CALLED=NO",
  "A16R_PRODUCTION_UI_GATE_STATE_REAL_GENEALOGY_WRITE=NO",
  "A16R_PRODUCTION_UI_GATE_STATE_SQL_RUN=NO",
  "A16R_PRODUCTION_UI_GATE_STATE_DB_PUSH_RUN=NO",
  "A16R_PRODUCTION_UI_GATE_STATE_MIGRATION_REPAIR_RUN=NO",
  "A16R_PRODUCTION_UI_GATE_STATE_SEED_RUN=NO",
  "A16R_PRODUCTION_UI_GATE_STATE_PERMISSIONS_ROLES_AUTH_USERS_MEMBERSHIPS_MUTATED=NO",
  "A16R_PRODUCTION_UI_GATE_STATE_CAN_RUN_OFFICIAL_IMPORT_BYPASSED=NO",
  "A16R_PRODUCTION_UI_GATE_STATE_FAIL_CLOSED_GUARDS_WEAKENED=NO",
  "A16R_PRODUCTION_UI_GATE_STATE_WRANGLER_TOML_CHANGED=NO",
  "NONE_FOR_THIS_PHASE_UI_GATE_STATE_DOCS_CHECKER_ONLY",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [dryRunGate, "A16K_IMPORT_DRY_RUN_REQUIRED_MARKER", "dry-run marker const"],
  [dryRunGate, "APPROVE_A16K_IMPORT_DRY_RUN_GATE", "dry-run required marker"],
  [dryRunGate, "canRunDryRun: false", "dry-run source locked"],
  [dryRunGate, "officialImportOpen: false", "dry-run gate official import closed"],
  [dryRunPreview, "A16L_DRY_RUN_APPROVAL_MARKER", "dry-run preview marker"],
  [dryRunPreview, "canProceedToOfficialImport: false", "dry-run preview cannot proceed"],
  [officialGate, "A16R_REQUIRED_OFFICIAL_IMPORT_SESSION_MARKER", "official session marker"],
  [officialGate, "APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_<SESSION_ID>", "official generic marker"],
  [officialGate, "canOpenOfficialImport: false", "official gate canOpen false"],
  [officialGate, "officialImportEnabled: false", "official gate enabled false"],
  [officialService, "A16R_RUNTIME_EXECUTION_ENABLEMENT_MARKER", "runtime marker const"],
  [officialService, "APPROVE_A16R_RUNTIME_EXECUTION_AFTER_A16V_VERIFY", "runtime marker value"],
  [officialService, "A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID", "audited session const"],
  [officialService, "A16R_AUDITED_OFFICIAL_IMPORT_MARKER", "audited session marker const"],
  [officialService, "A16U_REQUIRED_A16R_RETRY_MARKER =\n  A16R_AUDITED_OFFICIAL_IMPORT_MARKER", "audited session marker alias"],
  [officialService, "A16R_BLOCKED_RUNTIME_EXECUTION_NOT_ENABLED_AFTER_A16V_VERIFY", "runtime blocker"],
  [officialService, "canRunOfficialImport: false", "runtime canRun false"],
  [officialService, "confirmRuntimeExecutionEnablementMarker", "runtime confirmation field"],
  [postRoute, "export async function POST", "official import route exists"],
  [postRoute, "A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED", "official import env lock"],
  [postRoute, "canRunOfficialImport: false", "route canRun false"],
  [gateRoute, "export async function GET", "official gate GET only"],
  [importPage, "getPermissionContext", "import page permission context"],
  [importPage, "context.permissions.includes(\"imports.create\")", "import page imports.create"],
  [panel, "getImportDryRunApprovalGate", "panel dry-run gate"],
  [panel, "buildOfficialImportPreflightGateFromManifest", "panel official gate"],
  [panel, "A16R_RUNTIME_EXECUTION_ENABLEMENT_MARKER", "panel runtime marker"],
  [panel, "aria-disabled=\"true\"", "panel disabled buttons"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a16r-production-ui-gate-state-reconciliation"] !==
  "node scripts/check-a16r-production-ui-gate-state-reconciliation.cjs"
) {
  failures.push("missing package script check:a16r-production-ui-gate-state-reconciliation");
}

for (const [content, token, label] of [
  [index, "PLAN_A16R_PRODUCTION_UI_GATE_STATE_RECONCILIATION.md", "index entry"],
  [workLog, "A16R_PRODUCTION_UI_GATE_STATE_RECONCILIATION_STATUS=PASS_DOCS_CHECKER_ONLY", "work log status"],
  [decisionLog, "A-16R production UI gate state treats A-16K as dry-run UI copy, not the official import runtime blocker", "decision entry"],
  [handoff, "A16R_PRODUCTION_UI_GATE_STATE_CLASSIFICATION=UI_COPY_STALE_BUT_RUNTIME_GATE_CORRECT", "handoff classification"],
]) {
  requireIncludes(content, token, label);
}

for (const content of [doc]) {
  rejectPattern(content, /A16R_IMPORT_RETRY_NEXT=YES/, "must not allow A-16R retry next");
  rejectPattern(content, /MUTATED=YES/, "must not mutate roles/auth/users");
  rejectPattern(content, /SUPABASE_SERVICE_ROLE_KEY\s*=/i, "secret assignment");
  rejectPattern(content, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");
}

for (const [label, content] of [
  [officialServicePath, officialService],
  [postRoutePath, postRoute],
]) {
  rejectPattern(content, /\.rpc\s*\(/i, `${label} must not call direct RPC`);
  rejectPattern(content, /canRunOfficialImport:\s*true/, `${label} must remain fail-closed`);
}

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  checkerPath,
  "docs/PLAN_A16R_UI_COPY_REFRESH_OFFICIAL_IMPORT_GATE.md",
  "scripts/check-a16r-ui-copy-refresh-official-import-gate.cjs",
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
  "scripts/check-a16k-owner-approval-gate-dry-run-import.cjs",
  "scripts/check-a16l-dry-run-preview-owner-review-relationship-audit.cjs",
  "scripts/check-a16m-relationship-role-mapping-root-cause-plan.cjs",
  "scripts/check-a16r-official-import-gate-readiness-diagnosis.cjs",
  "scripts/check-a16r-owner-auth-gate-smoke-and-evidence-bundle.cjs",
  "scripts/check-a16r-runtime-execution-enablement-gate.cjs",
  "scripts/check-a16r-runtime-execution-enablement-owner-review.cjs",
  "scripts/check-a16r-github-actions-linux-deploy-smoke.cjs",
  "scripts/check-a16r-owner-admin-import-permission-diagnosis.cjs",
  "scripts/check-a16r-authenticated-owner-import-gate-smoke-retry.cjs",
  "scripts/check-a16r-authenticated-official-import-gate-smoke.cjs",
  "scripts/check-a16l-dry-run-mapping-preview.cjs",
  "scripts/check-a16t-apply-verify.cjs",
  "scripts/check-a16u-locked-runtime-wiring.cjs",
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === ".env.local" || file.endsWith(".env.local")) failures.push(`forbidden env file ${file}`);
  if (file.startsWith("supabase/.temp/")) failures.push(`forbidden supabase temp ${file}`);
  if (/\.(xls|xlsx|csv)$/i.test(file)) failures.push(`forbidden spreadsheet/csv ${file}`);
  if (/^(db\/migrations|supabase\/migrations|db\/checks)\//.test(file)) {
    failures.push(`forbidden SQL/check file ${file}`);
  }
  if (
    file === wranglerPath ||
    file === "open-next.config.ts" ||
    file === "next.config.ts" ||
    file.startsWith(".github/workflows/") ||
    (file.startsWith("app/") &&
      file !== "app/api/admin/import-sessions/[sessionId]/dry-run-gate/route.ts") ||
    (file.startsWith("lib/") &&
      file !== officialServicePath &&
      file !== dryRunGatePath) ||
    (file.startsWith("components/") && file !== panelPath)
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
  console.error("A-16R production UI gate state reconciliation check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16R production UI gate state reconciliation check passed.");
