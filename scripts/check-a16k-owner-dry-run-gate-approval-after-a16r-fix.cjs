const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath =
  "docs/PLAN_A16K_OWNER_DRY_RUN_GATE_APPROVAL_AFTER_A16R_FIX.md";
const checkerPath =
  "scripts/check-a16k-owner-dry-run-gate-approval-after-a16r-fix.cjs";
const packagePath = "package.json";
const gateServicePath = "lib/import/giapha4/import-dry-run-approval-gate.ts";
const gateRoutePath =
  "app/api/admin/import-sessions/[sessionId]/dry-run-gate/route.ts";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const officialServicePath = "lib/import/giapha4/official-import-service.ts";
const officialGatePath = "lib/import/giapha4/official-import-preflight-gate.ts";
const layoutPath = "app/layout.tsx";
const wranglerPath = "wrangler.toml";

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
const gateService = read(gateServicePath);
const gateRoute = read(gateRoutePath);
const panel = read(panelPath);
const officialService = read(officialServicePath);
const officialGate = read(officialGatePath);
const layout = read(layoutPath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16K-OWNER-DRY-RUN-GATE-APPROVAL-AFTER-A16R-FIX",
  "A16K_OWNER_DRY_RUN_GATE_APPROVAL_AFTER_A16R_FIX_STATUS=PASS_AUDITED_SESSION_DRY_RUN_GATE_OPEN_READ_ONLY",
  "A16K_OWNER_DRY_RUN_GATE_APPROVAL_AFTER_A16R_FIX_CLASSIFICATION=OWNER_APPROVED_DRY_RUN_GATE_AUDITED_SESSION_ONLY",
  "APPROVE_A16K_IMPORT_DRY_RUN_GATE",
  "A16K_AUDITED_DRY_RUN_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "A16K_BLOCKED_UNVERIFIED_SESSION_ID=ae7a5fe3-6a29-4f60-85f7-76108ed02565",
  "A16K_AFTER_A16R_FIX_OFFICIAL_IMPORT_GATE_GET=PASS",
  "A16K_AFTER_A16R_FIX_OFFICIAL_IMPORT_GATE_CAN_OPEN_OFFICIAL_IMPORT=false",
  "A16K_AFTER_A16R_FIX_OFFICIAL_IMPORT_GATE_OFFICIAL_IMPORT_ENABLED=false",
  "A16K_AFTER_A16R_FIX_REVIEW_PACK_READINESS=READY_FOR_OWNER_REVIEW",
  "A16K_AFTER_A16R_FIX_VALIDATION_PEOPLE_COUNT=102",
  "A16K_AFTER_A16R_FIX_VALIDATION_RELATIONSHIP_COUNT=134",
  "A16K_AFTER_A16R_FIX_VALIDATION_ERROR_COUNT=0",
  "A16K_AFTER_A16R_FIX_VALIDATION_WARNING_COUNT=92",
  "A16K_DRY_RUN_GATE_CAN_OPEN_FOR_AUDITED_SESSION=YES",
  "A16K_DRY_RUN_GATE_BLOCKS_OTHER_SESSIONS=YES",
  "A16K_DRY_RUN_GATE_BLOCKS_AE7A5FE3=YES",
  "A16K_VALIDATION_WARNINGS_REMAIN_OWNER_REVIEW_WARNINGS=YES",
  "A16K_WARNING_COUNT_92_CONVERTED_TO_HARD_BLOCKER=NO",
  "A16K_APPROVAL_OPENS_OFFICIAL_IMPORT=NO",
  "A16K_OFFICIAL_IMPORT_REMAINS_LOCKED=YES",
  "A16K_OFFICIAL_IMPORT_OPEN=false",
  "A16K_CAN_OPEN_OFFICIAL_IMPORT=false",
  "A16K_OFFICIAL_IMPORT_ENABLED=false",
  "A16K_CAN_RUN_OFFICIAL_IMPORT=false",
  "A16K_CAN_RUN_OFFICIAL_IMPORT_FORCED_TRUE=NO",
  "A16K_OFFICIAL_IMPORT_BUTTON_DISABLED=YES",
  "A16K_A16R_FAIL_CLOSED_GUARDS_WEAKENED=NO",
  "A16K_DRY_RUN_DB_WRITE=false",
  "A16K_DRY_RUN_PEOPLE_WRITE=false",
  "A16K_DRY_RUN_RELATIONSHIP_WRITE=false",
  "A16K_DRY_RUN_TREE_LAYOUT_WRITE=false",
  "A16K_DRY_RUN_REVISION_WRITE=false",
  "A16K_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16K_DIRECT_RPC_OFFICIAL_IMPORT_CALLED=NO",
  "A16K_REAL_GENEALOGY_WRITE=NO",
  "A16K_SQL_RUN=NO",
  "A16K_DB_PUSH_RUN=NO",
  "A16K_MIGRATION_REPAIR_RUN=NO",
  "A16K_SEED_RUN=NO",
  "A16K_PERMISSIONS_ROLES_AUTH_USERS_MEMBERSHIPS_MUTATED=NO",
  "A16K_WRANGLER_TOML_CHANGED=NO",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "LOCAL_HYDRATION_ADVISORY_LIKELY_BROWSER_EXTENSION_INJECTION",
  "A16K_APP_LAYOUT_TSX_CHANGED=NO",
  "A16K_APP_LAYOUT_CRXLAUNCHER_ADDED=NO",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [gateService, "A16K_AUDITED_DRY_RUN_SESSION_ID", "audited dry-run session const"],
  [gateService, "2af4bfb6-a20e-453e-9804-1b8c0afbdd68", "audited session value"],
  [gateService, "A16K_BLOCKED_UNVERIFIED_SESSION_ID", "blocked bad session const"],
  [gateService, "ae7a5fe3-6a29-4f60-85f7-76108ed02565", "bad session value"],
  [gateService, "APPROVE_A16K_IMPORT_DRY_RUN_GATE", "owner approval marker"],
  [gateService, "sessionId === A16K_AUDITED_DRY_RUN_SESSION_ID", "audited session comparison"],
  [gateService, "status: \"open\"", "audited session gate open"],
  [gateService, "canRunDryRun: true", "audited session dry-run true"],
  [gateService, "dryRunMappingOpen: true", "audited session dry-run mapping open"],
  [gateService, "status: \"locked\"", "non-audited session gate locked"],
  [gateService, "canRunDryRun: false", "non-audited session dry-run false"],
  [gateService, "dryRunMappingOpen: false", "non-audited session dry-run mapping closed"],
  [gateService, "officialImportOpen: false", "dry-run does not open official import"],
  [gateService, "dbWrite: false", "dry-run dbWrite false"],
  [gateService, "peopleWrite: false", "dry-run peopleWrite false"],
  [gateService, "relationshipWrite: false", "dry-run relationshipWrite false"],
  [gateService, "treeLayoutWrite: false", "dry-run treeLayoutWrite false"],
  [gateService, "revisionWrite: false", "dry-run revisionWrite false"],
  [gateRoute, "...getImportDryRunApprovalGate(sessionId)", "route passes session id"],
  [panel, "getImportDryRunApprovalGate(currentSessionId)", "panel passes current session id"],
  [panel, "Dry-run read-only đã mở cho phiên đã kiểm toán", "panel audited dry-run open copy"],
  [panel, "Dry-run vẫn khóa cho phiên đang xem", "panel non-audited locked copy"],
  [panel, "Xác nhận nhập chính thức - đang khóa", "official import button remains locked"],
  [officialGate, "canOpenOfficialImport: false", "official gate canOpen false"],
  [officialGate, "officialImportEnabled: false", "official gate enabled false"],
  [officialService, "canRunOfficialImport: false", "official service canRun false"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a16k-owner-dry-run-gate-approval-after-a16r-fix"] !==
  "node scripts/check-a16k-owner-dry-run-gate-approval-after-a16r-fix.cjs"
) {
  failures.push("missing package script check:a16k-owner-dry-run-gate-approval-after-a16r-fix");
}

for (const [content, token, label] of [
  [index, "PLAN_A16K_OWNER_DRY_RUN_GATE_APPROVAL_AFTER_A16R_FIX.md", "index entry"],
  [workLog, "A16K_OWNER_DRY_RUN_GATE_APPROVAL_AFTER_A16R_FIX_STATUS=PASS_AUDITED_SESSION_DRY_RUN_GATE_OPEN_READ_ONLY", "work log status"],
  [decisionLog, "A-16K owner approval opens dry-run gate only for the audited A-16R session", "decision log entry"],
  [handoff, "A16K_OWNER_DRY_RUN_GATE_APPROVAL_AFTER_A16R_FIX_STATUS=PASS_AUDITED_SESSION_DRY_RUN_GATE_OPEN_READ_ONLY", "handoff status"],
]) {
  requireIncludes(content, token, label);
}

rejectIncludes(layout, "crxlauncher", "layout must not add crxlauncher");
rejectPattern(gateRoute, /export\s+async\s+function\s+(POST|PUT|PATCH|DELETE)\b/, "dry-run gate mutation handler");
rejectPattern(gateService + gateRoute + panel, /\.rpc\s*\(/i, "direct RPC");
rejectPattern(gateService + gateRoute + panel, /official-import(?!-gate|-preflight|-service)/i, "official import route/action");
rejectPattern(officialService, /canRunOfficialImport:\s*true/, "official import must remain fail closed");
rejectPattern(doc, /A16R_IMPORT_RETRY_NEXT=YES/, "A-16R retry must not be YES");
rejectPattern(doc + gateService + gateRoute + panel + officialService, /SUPABASE_SERVICE_ROLE_KEY\s*=/i, "secret assignment");
rejectPattern(doc + gateService + gateRoute + panel + officialService, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  ".gitignore",
  docPath,
  checkerPath,
  gateServicePath,
  gateRoutePath,
  panelPath,
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
  "app/api/admin/import-sessions/[sessionId]/dry-run-preview/route.ts",
  "lib/import/giapha4/dry-run-mapping-preview-service.ts",
  "lib/import/giapha4/manifest-read-service.ts",
  "scripts/check-a16k-owner-approval-gate-dry-run-import.cjs",
  "scripts/check-a16l-dry-run-mapping-preview.cjs",
  "scripts/check-a16l-dry-run-preview-owner-review-relationship-audit.cjs",
  "scripts/check-a16m-relationship-role-mapping-root-cause-plan.cjs",
  "scripts/check-a16r-fix-official-import-session-selection-mismatch.cjs",
  "scripts/check-a16r-ui-copy-refresh-official-import-gate.cjs",
  "scripts/check-a16r-production-ui-gate-state-reconciliation.cjs",
  "scripts/check-a16r-official-import-session-id-reconciliation.cjs",
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
  if (file === layoutPath) failures.push("app/layout.tsx must not change");
  if (file === wranglerPath) failures.push("wrangler.toml must not change");
  if (file.startsWith("supabase/.temp/")) failures.push(`forbidden supabase temp ${file}`);
  if (/\.(xls|xlsx|csv|png|jpg|jpeg|webp|zip)$/i.test(file)) {
    failures.push(`forbidden data/screenshot file ${file}`);
  }
  if (/^(db\/migrations|supabase\/migrations|db\/checks)\//.test(file)) {
    failures.push(`forbidden SQL/check file ${file}`);
  }
}

const stagedFiles = git(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected staged file ${file}`);
}

if (failures.length > 0) {
  console.error("A-16K owner dry-run gate approval after A-16R fix check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16K owner dry-run gate approval after A-16R fix check passed.");
