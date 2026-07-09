#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16AD_RUNTIME_OFFICIAL_IMPORT_ENABLEMENT_BLOCKER_DIAGNOSIS.md";
const checkerPath = "scripts/check-a16ad-runtime-official-import-enablement-blocker-diagnosis.cjs";
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
const a16ac = read("docs/PLAN_A16AC_IMPORT_RETRY_EXECUTION_FINAL_GATE.md");
const a16v = read("docs/PLAN_A16V_APPLY_VERIFY.md");
const ownerReview = read("docs/PLAN_A16R_RUNTIME_EXECUTION_ENABLEMENT_OWNER_REVIEW.md");
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = readJson(packagePath);
const layout = read("app/layout.tsx");
const wrangler = read("wrangler.toml");

for (const token of [
  "A-16AD-RUNTIME-OFFICIAL-IMPORT-ENABLEMENT-BLOCKER-DIAGNOSIS",
  "A16AD_DIAGNOSIS_STATUS=PASS_BLOCKER_CLASSIFIED_READ_ONLY",
  "A16AD_BLOCKER_CLASSIFICATION=SOURCE_RUNTIME_IMPLEMENTATION_REMAINS_FAIL_CLOSED",
  "A16AD_BLOCKER=A16R_BLOCKED_RUNTIME_EXECUTION_NOT_ENABLED_AFTER_A16V_VERIFY",
  "A16AD_EXECUTION_ALLOWED=NO",
  "A16AD_FINAL_IMPORT_COMMAND_PRINTED=NO",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED",
  "lockedResponse",
  "OfficialImportCandidateResult",
  "ok: false",
  "canRunOfficialImport: false",
  "buildOfficialImportRuntimeCandidate",
  "status: \"BLOCKED\"",
  "transactionStatus: \"A16V_OWNER_VERIFIED_RUNTIME_STILL_DISABLED\"",
  "runtimeExecutionEnablementGate",
  "A16R_BLOCKED_RUNTIME_EXECUTION_NOT_ENABLED_AFTER_A16V_VERIFY",
  "YES_ROUTE_FLAG_PRESENT_BUT_NOT_SUFFICIENT",
  "NOT_PRIMARY_BLOCKER_SOURCE_STILL_FAIL_CLOSED",
  "NO_AUDITED_SESSION_MATCHES_2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "NO_POST_ROUTE_EXISTS",
  "NOT_PROVEN_AND_NOT_PRIMARY_SOURCE_STILL_FAIL_CLOSED",
  "YES_CHECKERS_INTENTIONALLY_ENFORCE_FAIL_CLOSED_STATE",
  "NO_OWNER_EXECUTION_APPROVAL_MARKER_PRESENT",
  "NO_PRIOR_RUNTIME_ENABLEMENT_MARKER_WAS_REVIEWED_BUT_SOURCE_STILL_FAIL_CLOSED",
  "YES_SERVICE_RETURNS_BLOCKED_CAN_RUN_FALSE_UNCONDITIONALLY",
  "OWNER_APPROVED_A16R_IMPORT_RETRY_EXECUTION",
  "APPROVE_A16R_RUNTIME_EXECUTION_AFTER_A16V_VERIFY",
  "A16V_APPLY_VERIFY_STATUS=PASS_OWNER_APPLIED_AND_VERIFIED",
  "A16V_REAL_TRANSACTION_BRANCH_READY=YES",
  expectedSessionId,
  "POST /api/admin/import-sessions/[sessionId]/official-import",
  "public.a16p_tx_execute_giapha4_official_import",
  "A-16AE-RUNTIME-OFFICIAL-IMPORT-ENABLEMENT-CANDIDATE",
  "A16AD_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16AD_DIRECT_RPC_OFFICIAL_IMPORT_CALLED=NO",
  "A16AD_A16R_IMPORT_RETRY_RUN=NO",
  "A16AD_REAL_GENEALOGY_WRITE=NO",
  "A16AD_SQL_RUN=NO",
  "A16AD_DB_PUSH_RUN=NO",
  "A16AD_MIGRATION_REPAIR_RUN=NO",
  "A16AD_SEED_RUN=NO",
  "A16AD_PERMISSIONS_ROLES_AUTH_USERS_MEMBERSHIPS_MUTATED=NO",
  "A16AD_DEPLOY_RUN=NO",
  "A16AD_WINDOWS_LOCAL_DEPLOY_RUN=NO",
  "A16AD_WRANGLER_DEPLOY_RUN=NO",
  "A16AD_WRANGLER_TOML_CHANGED=NO",
  "A16AD_APP_LAYOUT_TSX_CHANGED=NO",
  "A16AD_RAW_JSON_CONTENT_PRINTED=NO",
  "A16AD_RAW_FULL_JSON_EVIDENCE_COMMITTED=NO",
  "Main Worker touched: `NO`",
  "Runtime dependency added: `NO`",
  "OpenNext/Wrangler config changed: `NO`",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [route, "const A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED =", "route env feature flag"],
  [route, "process.env.A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED === \"true\"", "route env comparison"],
  [route, "lockedResponse", "route locked response"],
  [route, "canRunOfficialImport: false", "route canRun false"],
  [route, "getOfficialImportRuntimeCandidate", "route delegates to service"],
  [service, "export type OfficialImportCandidateResult", "service result type"],
  [service, "ok: false", "service ok false"],
  [service, "canRunOfficialImport: false", "service canRun false"],
  [service, "status: \"BLOCKED\"", "service blocked status"],
  [service, "transactionStatus: \"A16V_OWNER_VERIFIED_RUNTIME_STILL_DISABLED\"", "service disabled transaction status"],
  [service, "runtimeExecutionEnablementGate", "service runtime gate"],
  [service, "A16R_BLOCKED_RUNTIME_EXECUTION_NOT_ENABLED_AFTER_A16V_VERIFY", "service blocker"],
  [service, "sqlCandidateStatus: \"OWNER_APPLIED_VERIFIED\"", "A-16V owner verified source marker"],
  [a16ac, "A16AC_BLOCKER=A16R_BLOCKED_RUNTIME_EXECUTION_NOT_ENABLED_AFTER_A16V_VERIFY", "A-16AC blocker"],
  [a16v, "A16V_APPLY_VERIFY_STATUS=PASS_OWNER_APPLIED_AND_VERIFIED", "A-16V apply verify pass"],
  [ownerReview, "A16R_RUNTIME_EXECUTION_ENABLEMENT_OWNER_MARKER_VALID=YES", "runtime marker reviewed"],
  [index, "PLAN_A16AD_RUNTIME_OFFICIAL_IMPORT_ENABLEMENT_BLOCKER_DIAGNOSIS.md", "index entry"],
  [workLog, "A16AD_BLOCKER_CLASSIFICATION=SOURCE_RUNTIME_IMPLEMENTATION_REMAINS_FAIL_CLOSED", "work log classification"],
  [decisionLog, "A-16AD classifies runtime official import enablement blocker as source fail-closed", "decision log entry"],
  [handoff, "A16AD_BLOCKER=A16R_BLOCKED_RUNTIME_EXECUTION_NOT_ENABLED_AFTER_A16V_VERIFY", "handoff blocker"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a16ad-runtime-official-import-enablement-blocker-diagnosis"] !==
  "node scripts/check-a16ad-runtime-official-import-enablement-blocker-diagnosis.cjs"
) {
  failures.push("missing package script check:a16ad-runtime-official-import-enablement-blocker-diagnosis");
}

rejectPattern(doc, /EXECUTION_ALLOWED_PENDING_OWNER_FINAL_RUN_COMMAND/i, "allowed execution classification");
rejectPattern(doc, /curl\b|Invoke-RestMethod/i, "final executable command");
rejectPattern(layout, /crxlauncher|suppressHydrationWarning\s*=\s*{?\s*true/i, "layout hydration workaround");
rejectPattern(wrangler, /A16AD|A16R_IMPORT_RETRY/i, "wrangler evidence/config change");

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
  console.error("A-16AD runtime official import enablement blocker diagnosis check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16AD runtime official import enablement blocker diagnosis check passed.");
