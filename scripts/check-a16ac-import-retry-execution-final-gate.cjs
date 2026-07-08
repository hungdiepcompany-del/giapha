#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16AC_IMPORT_RETRY_EXECUTION_FINAL_GATE.md";
const checkerPath = "scripts/check-a16ac-import-retry-execution-final-gate.cjs";
const packagePath = "package.json";
const expectedSessionId = "2af4bfb6-a20e-453e-9804-1b8c0afbdd68";

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
const service = read("lib/import/giapha4/official-import-service.ts");
const route = read("app/api/admin/import-sessions/[sessionId]/official-import/route.ts");
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = readJson(packagePath);
const layout = read("app/layout.tsx");
const wrangler = read("wrangler.toml");

for (const token of [
  "A-16AC-A16R-IMPORT-RETRY-EXECUTION-FINAL-GATE",
  "OWNER_APPROVED_A16R_IMPORT_RETRY_EXECUTION",
  "A16AC_OWNER_IMPORT_EXECUTION_APPROVAL_MARKER_PRESENT=YES",
  "A16AC_FINAL_EXECUTION_GATE_CLASSIFICATION=BLOCKED_RUNTIME_EXECUTION_NOT_ENABLED",
  "A16AC_BLOCKER=A16R_BLOCKED_RUNTIME_EXECUTION_NOT_ENABLED_AFTER_A16V_VERIFY",
  "A16AC_EXECUTION_ALLOWED=NO",
  "A16AC_FINAL_OWNER_RUN_COMMAND_PRINTED=NO",
  "A16AC_A16R_IMPORT_RETRY_EXECUTED=NO",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "READY_FOR_SEPARATE_OWNER_IMPORT_EXECUTION_APPROVAL",
  "A16AC_A16O_FULL_AUDIT_EXPORT_GATE=PASS",
  "A16AC_A16X2_SHAPE_GATE=PASS",
  "A16AC_A16AA_WARNING_REVIEW_GATE=PASS",
  "A16AC_OWNER_WARNING_REVIEW_APPROVAL_GATE=PASS",
  "A16AC_BLOCKED_ERROR_GATE=PASS_ZERO_BLOCKED_ERRORS",
  "A16AC_IMPORT_BLOCKING_WARNING_GATE=PASS_NONE_FOUND",
  `A16AC_AUDITED_SESSION_ID=${expectedSessionId}`,
  `GET /api/admin/import-sessions/${expectedSessionId}/dry-run-preview?auditExport=relationships-full`,
  `POST /api/admin/import-sessions/${expectedSessionId}/official-import`,
  "A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED",
  "LOCKED",
  "canRunOfficialImport: false",
  "A16R_BLOCKED_RUNTIME_EXECUTION_NOT_ENABLED_AFTER_A16V_VERIFY",
  "A16V_OWNER_VERIFIED_RUNTIME_STILL_DISABLED",
  "public.a16p_tx_execute_giapha4_official_import",
  "A-16AD-RUNTIME-EXECUTION-ENABLEMENT-IMPLEMENTATION-GATE",
  "A16AC_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16AC_DIRECT_RPC_OFFICIAL_IMPORT_CALLED=NO",
  "A16AC_A16R_IMPORT_RETRY_RUN=NO",
  "A16AC_REAL_GENEALOGY_WRITE=NO",
  "A16AC_SQL_RUN=NO",
  "A16AC_DB_PUSH_RUN=NO",
  "A16AC_MIGRATION_REPAIR_RUN=NO",
  "A16AC_SEED_RUN=NO",
  "A16AC_PERMISSIONS_ROLES_AUTH_USERS_MEMBERSHIPS_MUTATED=NO",
  "A16AC_DEPLOY_RUN=NO",
  "A16AC_WINDOWS_LOCAL_DEPLOY_RUN=NO",
  "A16AC_WRANGLER_DEPLOY_RUN=NO",
  "A16AC_WRANGLER_TOML_CHANGED=NO",
  "A16AC_APP_LAYOUT_TSX_CHANGED=NO",
  "A16AC_RAW_JSON_CONTENT_PRINTED=NO",
  "A16AC_RAW_FULL_JSON_EVIDENCE_COMMITTED=NO",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [read("docs/PLAN_A16AB_IMPORT_RETRY_PREFLIGHT_APPROVAL_GATE.md"), "A16AB_FINAL_PREFLIGHT_CLASSIFICATION=READY_FOR_SEPARATE_OWNER_IMPORT_EXECUTION_APPROVAL", "A-16AB ready classification"],
  [read("docs/PLAN_A16AA_RELATIONSHIP_AUDIT_WARNING_REVIEW_IMPORT_RETRY_READINESS.md"), "A16AA_IMPORT_BLOCKING_WARNING_CATEGORY_FOUND=NO", "A-16AA no import-blocking warning"],
  [read("docs/PLAN_A16X2_CORRECT_A16O_FULL_RELATIONSHIP_AUDIT_EXPORT_SHAPE_VERIFICATION.md"), "A16X2_A16O_FULL_RELATIONSHIP_AUDIT_EXPORT_JSON_EVIDENCE_GATE=SATISFIED_SHAPE_ONLY", "A-16X2 shape gate"],
  [read("docs/PLAN_A16O_UNCAP_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY.md"), "A16O_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY", "A-16O read-only export marker"],
  [service, "canRunOfficialImport: false", "service remains fail closed"],
  [service, "A16R_BLOCKED_RUNTIME_EXECUTION_NOT_ENABLED_AFTER_A16V_VERIFY", "service runtime blocker"],
  [service, "A16V_OWNER_VERIFIED_RUNTIME_STILL_DISABLED", "service transaction status"],
  [route, "A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED", "route feature flag"],
  [route, "lockedResponse", "route locked response"],
  [route, "canRunOfficialImport: false", "route remains fail closed"],
  [index, "PLAN_A16AC_IMPORT_RETRY_EXECUTION_FINAL_GATE.md", "index entry"],
  [workLog, "A16AC_FINAL_EXECUTION_GATE_CLASSIFICATION=BLOCKED_RUNTIME_EXECUTION_NOT_ENABLED", "work log classification"],
  [decisionLog, "A-16AC blocks A-16R import retry execution because runtime remains fail-closed", "decision log entry"],
  [handoff, "A16AC_BLOCKER=A16R_BLOCKED_RUNTIME_EXECUTION_NOT_ENABLED_AFTER_A16V_VERIFY", "handoff blocker"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a16ac-import-retry-execution-final-gate"] !==
  "node scripts/check-a16ac-import-retry-execution-final-gate.cjs"
) {
  failures.push("missing package script check:a16ac-import-retry-execution-final-gate");
}

rejectPattern(doc, /EXECUTION_ALLOWED_PENDING_OWNER_FINAL_RUN_COMMAND/, "allowed execution classification");
rejectPattern(doc, /curl\b|Invoke-RestMethod/i, "final executable command");
rejectPattern(layout, /crxlauncher|suppressHydrationWarning\s*=\s*{?\s*true/i, "layout hydration workaround");
rejectPattern(wrangler, /A16AC|A16R_IMPORT_RETRY/i, "wrangler evidence/config change");

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
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
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file.startsWith(".tmp/")) failures.push(`.tmp file must not be committed ${file}`);
  if (file !== packagePath && /\.(json|xlsx|xls|csv|zip)$/i.test(file)) {
    failures.push(`raw evidence/data file must not be committed ${file}`);
  }
  if (file === "wrangler.toml" || file === "app/layout.tsx") {
    failures.push(`forbidden file changed ${file}`);
  }
  if (/^(db\/migrations|supabase\/migrations|db\/checks|app\/|lib\/)/.test(file)) {
    failures.push(`forbidden runtime/db file changed ${file}`);
  }
}

const stagedFiles = git(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected staged file ${file}`);
  if (file.startsWith(".tmp/") || /\.(json|xlsx|xls|csv|zip)$/i.test(file)) {
    failures.push(`raw evidence/data file staged ${file}`);
  }
}

const changedPatch = git([
  "diff",
  "--",
  ...changedFiles.filter((file) => allowedChangedFiles.has(file)),
]);
for (const pattern of [
  /\.rpc\s*\(/i,
  /canProceedToOfficialImport:\s*true/i,
  /canRunOfficialImport:\s*true/i,
  /officialImportOpen:\s*true/i,
  /\bsupabase\s+db\s+push\b/i,
  /EXECUTION_ALLOWED_PENDING_OWNER_FINAL_RUN_COMMAND/i,
]) {
  rejectPattern(changedPatch, pattern, `changed patch ${pattern}`);
}

if (failures.length > 0) {
  console.error("A-16AC import retry execution final gate check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16AC import retry execution final gate check passed.");
