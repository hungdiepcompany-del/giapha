const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath =
  "docs/PLAN_A16R_FIX_OFFICIAL_IMPORT_SESSION_SELECTION_MISMATCH.md";
const checkerPath =
  "scripts/check-a16r-fix-official-import-session-selection-mismatch.cjs";
const packagePath = "package.json";
const wranglerPath = "wrangler.toml";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const officialServicePath = "lib/import/giapha4/official-import-service.ts";
const officialRoutePath =
  "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";

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

for (const token of [
  "A-16R-FIX-OFFICIAL-IMPORT-SESSION-SELECTION-MISMATCH",
  "A16R_FIX_OFFICIAL_IMPORT_SESSION_SELECTION_MISMATCH_STATUS=PASS_MARKER_BOUND_TO_AUDITED_SESSION_FAIL_CLOSED",
  "A16R_FIX_OFFICIAL_IMPORT_SESSION_SELECTION_MISMATCH_CLASSIFICATION=SESSION_ID_UI_SELECTION_MISMATCH",
  "A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "A16R_UNVERIFIED_UI_SESSION_ID=ae7a5fe3-6a29-4f60-85f7-76108ed02565",
  "A16R_AUDITED_SESSION_OK=true",
  "A16R_AUDITED_SESSION_HTTP_STATUS=200",
  "A16R_AUDITED_SESSION_PREVIEW_ONLY=true",
  "A16R_AUDITED_SESSION_CAN_IMPORT=false",
  "A16R_AUDITED_SESSION_DB_WRITE=false",
  "A16R_AUDITED_SESSION_PEOPLE_WRITE=false",
  "A16R_AUDITED_SESSION_RELATIONSHIP_WRITE=false",
  "A16R_AUDITED_SESSION_SOURCE_FILE_NAME=Phạm Văn.xls.xlsx",
  "A16R_AUDITED_SESSION_ROW_COUNT=102",
  "A16R_AUDITED_SESSION_PERSON_CANDIDATE_COUNT=102",
  "A16R_AUDITED_SESSION_RELATIONSHIP_CANDIDATE_COUNT=134",
  "A16R_AUDITED_SESSION_WARNING_COUNT=46",
  "A16R_AUDITED_SESSION_DUPLICATE_CANDIDATE_COUNT=8",
  "A16R_AUDITED_SESSION_WRITE_MANIFEST_COUNT=1",
  "A16R_FIX_SESSION_SELECTION_REQUIRED_SESSION_CHECK=YES",
  "A16R_FIX_SESSION_SELECTION_REQUIRED_MARKER_CHECK=YES",
  "A16R_FIX_SESSION_SELECTION_CAN_RUN_OFFICIAL_IMPORT=false",
  "A16R_FIX_SESSION_SELECTION_CAN_RUN_OFFICIAL_IMPORT_FORCED_TRUE=NO",
  "A16R_FIX_SESSION_SELECTION_OFFICIAL_IMPORT_BUTTON=DISABLED",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "A16R_IMPORT_MAY_BE_RETRIED_NEXT=NO",
  "A16R_FIX_SESSION_SELECTION_DEPLOY_RUN=NO",
  "A16R_FIX_SESSION_SELECTION_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16R_FIX_SESSION_SELECTION_DIRECT_RPC_CALLED=NO",
  "A16R_FIX_SESSION_SELECTION_REAL_GENEALOGY_WRITE=NO",
  "A16R_FIX_SESSION_SELECTION_SQL_RUN=NO",
  "A16R_FIX_SESSION_SELECTION_DB_PUSH_RUN=NO",
  "A16R_FIX_SESSION_SELECTION_MIGRATION_REPAIR_RUN=NO",
  "A16R_FIX_SESSION_SELECTION_SEED_RUN=NO",
  "A16R_FIX_SESSION_SELECTION_PERMISSIONS_ROLES_AUTH_USERS_MEMBERSHIPS_MUTATED=NO",
  "A16R_FIX_SESSION_SELECTION_WRANGLER_TOML_CHANGED=NO",
  "A16R_FIX_SESSION_SELECTION_NEXT_ALLOWED_ACTION=DEPLOY_VIA_MANUAL_GITHUB_ACTIONS_LINUX_THEN_OWNER_AUTHENTICATED_READ_ONLY_UI_SMOKE_NO_POST_NO_IMPORT",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [officialService, "A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID", "audited session const"],
  [officialService, "A16R_AUDITED_OFFICIAL_IMPORT_MARKER", "audited marker const"],
  [officialService, "A16U_REQUIRED_SESSION_ID = A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID", "required session alias"],
  [officialService, "A16U_REQUIRED_A16R_RETRY_MARKER =\n  A16R_AUDITED_OFFICIAL_IMPORT_MARKER", "required marker alias"],
  [officialService, "2af4bfb6-a20e-453e-9804-1b8c0afbdd68", "audited session value"],
  [officialService, "confirmation.confirmMarker !== A16U_REQUIRED_A16R_RETRY_MARKER", "marker check"],
  [officialService, "params.manifest.session.id !== A16U_REQUIRED_SESSION_ID", "required session check"],
  [officialService, "canRunOfficialImport: false", "service fail closed"],
  [officialRoute, "canRunOfficialImport: false", "route fail closed"],
  [panel, "A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID", "panel audited session import"],
  [panel, "A16R_AUDITED_OFFICIAL_IMPORT_MARKER", "panel audited marker import"],
  [panel, "const officialImportSessionMarker = A16R_AUDITED_OFFICIAL_IMPORT_MARKER", "panel audited marker binding"],
  [panel, "officialImportSessionMismatch", "panel mismatch flag"],
  [panel, "Phiên đang xem không khớp phiên nhập chính thức đã được kiểm toán.", "Vietnamese mismatch warning"],
  [panel, "Phiên đang xem:", "current session label"],
  [panel, "Phiên nhập chính thức đã kiểm toán:", "audited session label"],
  [panel, "Không dùng phiên đang xem làm marker nhập chính thức.", "do not use current session copy"],
  [panel, "disabled", "disabled button"],
  [panel, "aria-disabled=\"true\"", "aria disabled button"],
]) {
  requireIncludes(content, token, label);
}

rejectIncludes(
  panel,
  "APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_${session.id}",
  "panel must not build official marker from arbitrary session.id",
);
rejectIncludes(
  panel,
  "APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_${currentSessionId}",
  "panel must not build official marker from currentSessionId",
);

for (const [label, content] of [
  [officialServicePath, officialService],
  [officialRoutePath, officialRoute],
]) {
  rejectPattern(content, /\.rpc\s*\(/i, `${label} must not call direct RPC`);
  rejectPattern(content, /canRunOfficialImport:\s*true/, `${label} must remain fail-closed`);
}

rejectPattern(doc, /A16R_IMPORT_RETRY_NEXT=YES/, "A-16R retry must not be YES");
rejectPattern(doc + panel + officialService + officialRoute, /SUPABASE_SERVICE_ROLE_KEY\s*=/i, "secret assignment");
rejectPattern(doc + panel + officialService + officialRoute, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");

if (
  packageJson?.scripts?.["check:a16r-fix-official-import-session-selection-mismatch"] !==
  "node scripts/check-a16r-fix-official-import-session-selection-mismatch.cjs"
) {
  failures.push("missing package script check:a16r-fix-official-import-session-selection-mismatch");
}

for (const [content, token, label] of [
  [index, "PLAN_A16R_FIX_OFFICIAL_IMPORT_SESSION_SELECTION_MISMATCH.md", "index entry"],
  [workLog, "A16R_FIX_OFFICIAL_IMPORT_SESSION_SELECTION_MISMATCH_STATUS=PASS_MARKER_BOUND_TO_AUDITED_SESSION_FAIL_CLOSED", "work log status"],
  [decisionLog, "A-16R official import marker is bound to the audited session, not the current UI session", "decision log entry"],
  [handoff, "A16R_FIX_OFFICIAL_IMPORT_SESSION_SELECTION_MISMATCH_STATUS=PASS_MARKER_BOUND_TO_AUDITED_SESSION_FAIL_CLOSED", "handoff status"],
]) {
  requireIncludes(content, token, label);
}

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  checkerPath,
  panelPath,
  officialServicePath,
  packagePath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "scripts/check-a16r-official-import-session-id-reconciliation.cjs",
  "scripts/check-a16r-ui-copy-refresh-official-import-gate.cjs",
  "scripts/check-a16r-production-ui-gate-state-reconciliation.cjs",
  "scripts/check-a16r-owner-auth-gate-smoke-and-evidence-bundle.cjs",
  "scripts/check-a16r-official-import-gate-readiness-diagnosis.cjs",
  "scripts/check-a16r-runtime-execution-enablement-gate.cjs",
  "scripts/check-a16r-runtime-execution-enablement-owner-review.cjs",
  "scripts/check-a16k-owner-approval-gate-dry-run-import.cjs",
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
    file.startsWith("app/") ||
    (file.startsWith("components/") && file !== panelPath) ||
    (file.startsWith("lib/") && file !== officialServicePath)
  ) {
    failures.push(`runtime/config/source file outside scope ${file}`);
  }
}

const stagedFiles = git(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected staged file ${file}`);
}

if (failures.length > 0) {
  console.error("A-16R fix official import session selection mismatch check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16R fix official import session selection mismatch check passed.");
