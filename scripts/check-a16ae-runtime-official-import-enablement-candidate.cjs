#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16AE_RUNTIME_OFFICIAL_IMPORT_ENABLEMENT_CANDIDATE.md";
const checkerPath = "scripts/check-a16ae-runtime-official-import-enablement-candidate.cjs";
const servicePath = "lib/import/giapha4/official-import-service.ts";
const routePath = "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";
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
const service = read(servicePath);
const route = read(routePath);
const a16ah = read("docs/PLAN_A16AH_OFFICIAL_IMPORT_RUNTIME_EXECUTION_BRANCH_CANDIDATE.md");
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = readJson(packagePath);
const layout = read("app/layout.tsx");
const wrangler = read("wrangler.toml");

for (const token of [
  "A-16AE-RUNTIME-OFFICIAL-IMPORT-ENABLEMENT-CANDIDATE",
  "A16AE_RUNTIME_ENABLEMENT_CANDIDATE_STATUS=PASS_SOURCE_CANDIDATE_READY_NOT_EXECUTED",
  "A16AE_DEFAULT_STATE=FAIL_CLOSED",
  "A16AE_EXECUTION_ALLOWED_NOW=NO",
  "A16AE_FINAL_IMPORT_COMMAND_PRINTED=NO",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "A16AE_CAN_RUN_SOURCE=const canRunOfficialImport = reasons.length === 0",
  "status=\"BLOCKED\"",
  "canRunOfficialImport=false",
  "transactionStatus=\"A16V_OWNER_VERIFIED_RUNTIME_STILL_DISABLED\"",
  "status=\"CANDIDATE_READY_NOT_EXECUTED\"",
  "canRunOfficialImport=true",
  "transactionStatus=\"A16AE_RUNTIME_ENABLEMENT_CANDIDATE_READY_NOT_EXECUTED\"",
  "A16AE_ROUTE_FLAG=A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED",
  "A16AE_ROUTE_DEFAULT_CAN_RUN=false",
  "A16AE_GATE_ROUTE_FLAG_REQUIRED=true",
  "A16AE_GATE_STRICT_PERMISSION_REQUIRED=imports.create+people.create+relationships.create+permissions.manage",
  `A16AE_GATE_SESSION_ID_REQUIRED=${expectedSessionId}`,
  "A16AE_GATE_VALIDATION_ERROR_COUNT_REQUIRED=0",
  "A16AE_GATE_DRY_RUN_BLOCKED_BY_ERROR_COUNT_REQUIRED=0",
  "A16AE_GATE_DUPLICATE_UNRESOLVED_REQUIRED=0",
  "A16AE_GATE_DUPLICATE_NEEDS_REVIEW_REQUIRED=0",
  "A16AE_GATE_CONFIRM_RUNTIME_EXECUTION_ENABLEMENT_MARKER_REQUIRED=APPROVE_A16R_RUNTIME_EXECUTION_AFTER_A16V_VERIFY",
  "A16AE_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16AE_DIRECT_RPC_OFFICIAL_IMPORT_CALLED=NO",
  "A16AE_RPC_CALL_PRESENT_IN_SOURCE=NO",
  "A16AE_A16R_IMPORT_RETRY_RUN=NO",
  "A16AE_REAL_GENEALOGY_WRITE=NO",
  "A16AE_SQL_RUN=NO",
  "A16AE_DB_PUSH_RUN=NO",
  "A16AE_MIGRATION_REPAIR_RUN=NO",
  "A16AE_SEED_RUN=NO",
  "A16AE_DEPLOY_RUN=NO",
  "A16AE_WRANGLER_DEPLOY_RUN=NO",
  "A16AE_WRANGLER_TOML_CHANGED=NO",
  "A16AE_APP_LAYOUT_TSX_CHANGED=NO",
  "A-16AF-RUNTIME-ENABLEMENT-DEPLOY-SMOKE-GATE",
  "Main Worker touched: `YES_LIMITED_OFFICIAL_IMPORT_ROUTE_SERVICE_CANDIDATE`",
  "Runtime dependency added: `NO`",
  "OpenNext/Wrangler config changed: `NO`",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "const canRunOfficialImport = reasons.length === 0",
  "status: canRunOfficialImport ? \"READY_NOT_EXECUTED\" : \"BLOCKED\"",
  "const status: OfficialImportCandidateStatus = canRunOfficialImport",
  "? \"CANDIDATE_READY_NOT_EXECUTED\"",
  "transactionStatus: canRunOfficialImport",
  "\"A16AE_RUNTIME_ENABLEMENT_CANDIDATE_READY_NOT_EXECUTED\"",
  "canRunOfficialImport,",
  "routeFlagRequired: true",
  "blocker: canRunOfficialImport ? null : blockedReason",
  "confirmation.confirmMarker !== A16U_REQUIRED_A16R_RETRY_MARKER",
  "confirmation.confirmSessionId !== sessionId",
  "confirmation.confirmNoValidationErrors",
  "confirmation.confirmNoDryRunBlockers",
  "confirmation.confirmDuplicateDecisionsComplete",
  "confirmation.confirmA16TApplyVerified",
  "confirmation.confirmA16ULockedBranchReady",
  "confirmation.confirmA16VApplyVerified",
  "confirmation.confirmA16VRealTransactionBranchReady",
  "confirmRuntimeExecutionEnablementMarker",
  "confirmation.confirmProductionUiVisible",
  "confirmation.confirmProductionDeployReady",
  "confirmation.confirmRollbackReviewed",
  "confirmation.confirmAuditReviewed",
  "hasStrictOfficialImportPermission",
  "imports.create",
  "people.create",
  "relationships.create",
  "permissions.manage",
  "params.manifest.session.status !== \"staged\"",
  "params.manifest.session.id !== A16U_REQUIRED_SESSION_ID",
  "validation.summary.errorCount > 0",
  "dryRun.summary.blockedByErrorCount > 0",
  "duplicateDecisionSummary.unresolvedDuplicateCandidates > 0",
  "duplicateDecisionSummary.needsReviewDuplicateCandidates > 0",
  "ambiguityStatus !== \"clear\"",
]) {
  requireIncludes(service, token, `service token ${token}`);
}

for (const token of [
  "A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED",
  "process.env.A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED === \"true\"",
  "lockedResponse",
  "canRunOfficialImport: false",
  "getOfficialImportRuntimeCandidate",
]) {
  requireIncludes(route, token, `route token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A16AE_RUNTIME_OFFICIAL_IMPORT_ENABLEMENT_CANDIDATE.md", "index entry"],
  [workLog, "A16AE_RUNTIME_ENABLEMENT_CANDIDATE_STATUS=PASS_SOURCE_CANDIDATE_READY_NOT_EXECUTED", "work log status"],
  [decisionLog, "A-16AE adds guarded runtime official import enablement candidate without execution", "decision log entry"],
  [handoff, "A16AE_DEFAULT_STATE=FAIL_CLOSED", "handoff default state"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a16ae-runtime-official-import-enablement-candidate"] !==
  "node scripts/check-a16ae-runtime-official-import-enablement-candidate.cjs"
) {
  failures.push("missing package script check:a16ae-runtime-official-import-enablement-candidate");
}

for (const [label, content] of [
  [servicePath, service],
  [routePath, route],
]) {
  if (/\.rpc\s*\(/i.test(content)) {
    requireIncludes(
      a16ah,
      "A16AH_STATUS=PASS_SOURCE_BRANCH_CANDIDATE_NOT_EXECUTED",
      `${label} later A-16AH branch evidence`,
    );
    requireIncludes(
      service,
      "if (!candidate.canRunOfficialImport || params.executionBranchEnabled !== true)",
      `${label} A-16AH same-run gate before executor`,
    );
    requireIncludes(
      route,
      "process.env.A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED === \"true\"",
      `${label} A-16AH env gate`,
    );
  }
  rejectPattern(
    content,
    /\.from\(\s*["'](people|relationships|families|family_parents|family_children|couple_relationships|tree_layouts?|revisions|profiles)["']\s*\)[\s\S]{0,240}\.(insert|update|delete|upsert)\s*\(/i,
    `${label} must not write real genealogy tables`,
  );
}
rejectPattern(layout, /crxlauncher|suppressHydrationWarning\s*=\s*{?\s*true/i, "layout hydration workaround");
rejectPattern(wrangler, /A16AE|A16R_IMPORT_RETRY/i, "wrangler evidence/config change");

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  checkerPath,
  "docs/PLAN_A16AL_OFFICIAL_IMPORT_RUNTIME_MARKER_ALIGNMENT.md",
  "scripts/check-a16al-official-import-runtime-marker-alignment.cjs",
  "docs/PLAN_A16AM_OWNER_SAME_RUN_OFFICIAL_IMPORT_POST_CONFIRMATION.md",
  "scripts/check-a16am-owner-same-run-official-import-post-confirmation.cjs",
  "scripts/check-a16aa-relationship-audit-warning-review-import-retry-readiness.cjs",
  "scripts/check-a16ab-import-retry-preflight-approval-gate.cjs",
  "scripts/check-a16x2-correct-a16o-full-relationship-audit-export-shape-verification.cjs",
  "scripts/check-a16ak-official-import-session-duplicate-readiness.cjs",
  "scripts/check-a16r-runtime-execution-enablement-gate.cjs",
  "scripts/check-a16r-runtime-execution-enablement-owner-review.cjs",
  "scripts/check-a16r-official-import-gate-readiness-diagnosis.cjs",
  servicePath,
  routePath,
  packagePath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "scripts/check-a16ac-import-retry-execution-final-gate.cjs",
  "scripts/check-a16ad-runtime-official-import-enablement-blocker-diagnosis.cjs",
  "docs/PLAN_A16AF_RUNTIME_IMPORT_ENABLEMENT_CANDIDATE_PRODUCTION_SMOKE.md",
  "scripts/check-a16af-runtime-import-enablement-candidate-production-smoke.cjs",
  "scripts/check-a16r-fix-official-import-session-selection-mismatch.cjs",
  "scripts/check-a16r-runtime-execution-enablement-gate.cjs",
  "scripts/check-a16r-runtime-execution-enablement-owner-review.cjs",
  "scripts/check-a16v-apply-verify.cjs",
  "docs/PLAN_A16AH_OFFICIAL_IMPORT_RUNTIME_EXECUTION_BRANCH_CANDIDATE.md",
  "scripts/check-a16ah-official-import-runtime-execution-branch-candidate.cjs",
  "scripts/check-a16af-runtime-import-enablement-candidate-production-smoke.cjs",
  "scripts/check-a16ag-a16r-official-import-retry-execution.cjs",
  "scripts/check-a16t-apply-verify.cjs",
  "scripts/check-a16u-locked-runtime-wiring.cjs",
  "scripts/check-a16u-official-import-transaction-branch.cjs",
  "scripts/check-a16v-official-import-real-transaction-execution-branch.cjs",
  "scripts/check-a16u-verify-runbook.cjs",
  "scripts/check-a16v-a16r-execution-retry-requirements.cjs",
  "scripts/check-a16r-runtime-execution-enablement-gate.cjs",
  "scripts/check-a16r-runtime-execution-enablement-owner-review.cjs",
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
  if (/^(db\/migrations|supabase\/migrations|db\/checks)\//.test(file)) {
    failures.push(`forbidden runtime/db file ${file}`);
  }
}

const stagedFiles = git(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected staged file ${file}`);
}

const changedPatch = git([
  "diff",
  "--",
  ...changedFiles.filter((file) => allowedChangedFiles.has(file)),
]);
for (const pattern of [
  /supabase\s+db\s+push/i,
]) {
  rejectPattern(changedPatch, pattern, `changed patch ${pattern}`);
}

if (failures.length > 0) {
  console.error("A-16AE runtime official import enablement candidate check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16AE runtime official import enablement candidate check passed.");
