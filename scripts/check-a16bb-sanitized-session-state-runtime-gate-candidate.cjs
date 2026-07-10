#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath =
  "docs/PLAN_A16BB_SANITIZED_SESSION_STATE_RUNTIME_GATE_CANDIDATE.md";
const checkerPath =
  "scripts/check-a16bb-sanitized-session-state-runtime-gate-candidate.cjs";
const verifierPath = "scripts/verify-a16bb-sanitized-session-state.cjs";
const helperPath = "lib/import/giapha4/official-import-session-state-gate.ts";
const servicePath = "lib/import/giapha4/official-import-service.ts";
const preflightPath = "lib/import/giapha4/official-import-preflight-gate.ts";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const routePath =
  "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";
const schemaPath =
  "supabase/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql";
const rpcPath =
  "supabase/migrations/20260703_0016_a16v_official_import_real_transaction_execution_branch_candidate.sql";
const packagePath = "package.json";

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
const checker = read(checkerPath);
const verifier = read(verifierPath);
const helper = read(helperPath);
const service = read(servicePath);
const preflight = read(preflightPath);
const panel = read(panelPath);
const route = read(routePath);
const schema = read(schemaPath);
const rpc = read(rpcPath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = readJson(packagePath);
const wrangler = read("wrangler.toml");
const layout = read("app/layout.tsx");

for (const token of [
  "A-16BB - Sanitized Session-state Diagnostic And Runtime State-gate Candidate",
  "A16BB_STATUS=PASS_SANITIZED_STATE_DIAGNOSTIC_AND_STATE_GATE_CANDIDATE_NO_IMPORT",
  "A16BB_TARGET_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "A16BB_SESSION_STATE_DIAGNOSTIC_MARKER=A16BB_SANITIZED_SESSION_STATE_DIAGNOSTIC_READ_ONLY",
  "A16BB_STORED_SESSION_STATE=preview_generated",
  "A16BB_READ_ONLY_VERIFIER_STATUS=PASS_READ_ONLY_SANITIZED_METADATA",
  "A16BB_PREVIEW_MANIFEST_HASH_PRESENT=YES",
  "A16BB_APPROVAL_MARKER_PRESENT=NO",
  "A16BB_WARNING_COUNT=46",
  "A16BB_DUPLICATE_CANDIDATE_COUNT=8",
  "A16BB_RELATIONSHIP_CANDIDATE_COUNT=134",
  "A16BB_PERSON_CANDIDATE_COUNT=102",
  "A16BB_WRITE_MANIFEST_STATUS_COUNTS=draft:1",
  "A16BB_OWNER_APPROVED_WRITE_MANIFEST_COUNT=0",
  "A16BB_OFFICIAL_IMPORT_BATCH_STATUS_COUNTS=none",
  "A16BB_BLOCKER_WARNING_COUNT_OPEN_OR_NEEDS_REVIEW=0",
  "A16BB_UNRESOLVED_DUPLICATE_COUNT=0",
  "A16BB_NEEDS_REVIEW_DUPLICATE_COUNT=0",
  "A16BB_RPC_ACCEPTS_SESSION_STATES=ready_for_owner_approval,owner_approved_for_db_write",
  "A16BB_RUNTIME_UI_API_EXECUTION_ELIGIBLE_STATE=owner_approved_for_db_write",
  "A16BB_READY_FOR_OWNER_APPROVAL_EXECUTION_ELIGIBLE=NO",
  "A16BB_REQUIRED_WRITE_MANIFEST_STATES=owner_approved,ready_for_apply",
  "A16BB_CURRENT_SESSION_EXECUTION_ELIGIBLE=NO",
  "A16BB_CURRENT_BLOCKER=STORED_SESSION_STATE_PREVIEW_GENERATED_NOT_OWNER_APPROVED_FOR_DB_WRITE",
  "A16BB_WRITE_MANIFEST_BLOCKER=OWNER_APPROVED_WRITE_MANIFEST_MISSING",
  "A16BB_OBSOLETE_STAGED_SOURCE_LOCATIONS_BEFORE_FIX=lib/import/giapha4/official-import-service.ts",
  "A16BB_OBSOLETE_STAGED_SOURCE_LOCATIONS_AFTER_FIX=NONE_IN_RUNTIME_SOURCE",
  "A16BB_SERVICE_GATE_UPDATED=YES",
  "A16BB_UI_GATE_UPDATED=YES",
  "A16BB_GET_PREFLIGHT_GATE_UPDATED=YES",
  "A16BB_POST_ROUTE_GATE_CONSISTENCY=DELEGATES_TO_SERVICE_STATE_GATE_BEFORE_RPC",
  "A16BB_INVALID_STATES_REMAIN_BLOCKED=YES",
  "A16BB_READY_FOR_OWNER_APPROVAL_REMAINS_BLOCKED_FOR_POST=YES",
  "A16BB_PREVIEW_GENERATED_REMAINS_BLOCKED_FOR_POST=YES",
  "A16BB_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16BB_A16R_IMPORT_RETRY_EXECUTED=NO",
  "A16BB_DIRECT_MANUAL_RPC_CALLED=NO",
  "A16BB_IMPORT_RPC_INVOKED=NO",
  "A16BB_SESSION_STATE_UPDATED=NO",
  "A16BB_MANUAL_SQL_RUN=NO",
  "A16BB_SQL_DB_MUTATION_RUN=NO",
  "A16BB_DEPLOY_RUN=NO",
  "A16BB_RAW_JSON_COMMITTED=NO",
  "A16BB_PRIVATE_DATA_PRINTED=NO",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "A16BB_NEXT_ACTION=A16BC_OWNER_APPROVAL_SESSION_STATE_TRANSITION_CANDIDATE_NO_IMPORT_NO_RPC",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

if (
  packageJson?.scripts?.["check:a16bb-sanitized-session-state-runtime-gate-candidate"] !==
  "node scripts/check-a16bb-sanitized-session-state-runtime-gate-candidate.cjs"
) {
  failures.push("missing package script check:a16bb-sanitized-session-state-runtime-gate-candidate");
}
if (
  packageJson?.scripts?.["verify:a16bb-sanitized-session-state"] !==
  "node scripts/verify-a16bb-sanitized-session-state.cjs"
) {
  failures.push("missing package script verify:a16bb-sanitized-session-state");
}

for (const [content, token, label] of [
  [helper, "A16BB_OFFICIAL_IMPORT_EXECUTION_ELIGIBLE_SESSION_STATE", "helper execution state constant"],
  [helper, '"owner_approved_for_db_write" as const', "helper owner-approved state"],
  [helper, '"ready_for_owner_approval" as const', "helper ready state"],
  [helper, "A16BB_BLOCKED_SESSION_STATE_READY_FOR_OWNER_APPROVAL_NOT_OWNER_APPROVED_FOR_DB_WRITE", "ready state blocker"],
  [helper, "A16BB_BLOCKED_SESSION_STATE_TERMINAL_OR_ALREADY_IMPORT_PROCESSED", "terminal blocker"],
  [helper, "buildOfficialImportSessionStateGate", "helper function"],
  [service, "buildOfficialImportSessionStateGate", "service uses state gate"],
  [service, "A16BB_OFFICIAL_IMPORT_EXECUTION_ELIGIBLE_SESSION_STATE", "service uses execution eligible state"],
  [preflight, "buildOfficialImportSessionStateGate", "preflight uses state gate"],
  [preflight, "A16BB_OFFICIAL_IMPORT_EXECUTION_ELIGIBLE_SESSION_STATE", "preflight expected state"],
  [panel, "buildOfficialImportSessionStateGate", "panel uses state gate"],
  [panel, "a16bbSessionStateGate.executionEligible", "panel blocks by state gate"],
  [panel, "A-16BB session state gate", "panel displays sanitized state gate"],
  [route, "getOfficialImportRuntimeCandidate", "POST route delegates to service gate"],
  [schema, "'owner_approved_for_db_write'", "schema owner approved state"],
  [rpc, "v_session.status not in ('ready_for_owner_approval', 'owner_approved_for_db_write')", "RPC accepted states"],
  [rpc, "status in ('owner_approved', 'ready_for_apply')", "RPC write manifest states"],
  [verifier, "PASS_READ_ONLY_SANITIZED_METADATA", "verifier pass status"],
  [verifier, "postOfficialImportCalled: false", "verifier no POST"],
  [verifier, ".from(\"import_sessions\")", "verifier reads import_sessions"],
  [verifier, ".from(\"import_write_manifests\")", "verifier reads write manifests"],
  [verifier, ".from(\"official_import_batches\")", "verifier reads batches"],
  [index, "PLAN_A16BB_SANITIZED_SESSION_STATE_RUNTIME_GATE_CANDIDATE.md", "index entry"],
  [workLog, "A16BB_STATUS=PASS_SANITIZED_STATE_DIAGNOSTIC_AND_STATE_GATE_CANDIDATE_NO_IMPORT", "work log status"],
  [decisionLog, "Decision 305 - A-16BB requires owner_approved_for_db_write for the runtime/UI POST gate", "decision log entry"],
  [handoff, "A16BB_NEXT_ACTION=A16BC_OWNER_APPROVAL_SESSION_STATE_TRANSITION_CANDIDATE_NO_IMPORT_NO_RPC", "handoff next action"],
]) {
  requireIncludes(content, token, label);
}

rejectPattern(service, /status\s*!==\s*["']staged["']/, "runtime source must not require staged");
rejectPattern(service, /tráº¡ng thÃ¡i staged|staged Ä‘á»ƒ xÃ©t|staged/i, "service staged wording");
for (const [label, content] of [
  [verifierPath, verifier],
  [checkerPath, checker],
]) {
  rejectPattern(content, /\.(?:insert|update|delete|upsert|rpc)\s*\(/i, `${label} mutation/RPC`);
  rejectPattern(content, /console\.log\([^)]*(serviceRoleKey|SUPABASE_SERVICE_ROLE_KEY|supabaseUrl)/i, `${label} secret print`);
  rejectPattern(content, /eyJ[A-Za-z0-9_-]{20,}|sb_secret_[A-Za-z0-9_-]+/i, `${label} secret-like token`);
}
rejectPattern(doc, /A16BB_POST_OFFICIAL_IMPORT_CALLED=YES|A16R_IMPORT_RETRY_NEXT=YES/i, "doc must keep import closed");
rejectPattern(doc, /A16BB_SQL_DB_MUTATION_RUN=YES|A16BB_DEPLOY_RUN=YES|A16BB_SESSION_STATE_UPDATED=YES/i, "doc must keep mutation/deploy closed");
rejectPattern(wrangler, /A16BB|A16R_IMPORT_RETRY/i, "wrangler must not change for A-16BB");
rejectPattern(layout, /A16BB|official-import/i, "app layout must not change for A-16BB");

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  checkerPath,
  verifierPath,
  helperPath,
  servicePath,
  preflightPath,
  panelPath,
  packagePath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "docs/PLAN_A16BA_READ_ONLY_SESSION_STATE_RUNTIME_CONTRACT_FIX_PLAN.md",
  "scripts/check-a16ba-read-only-session-state-runtime-contract-fix-plan.cjs",
  "scripts/check-a16ae-runtime-official-import-enablement-candidate.cjs",
  "scripts/check-a16ah-official-import-runtime-execution-branch-candidate.cjs",
  "scripts/check-a16ar-owner-same-run-official-import-confirmation-ui-plumbing.cjs",
  "scripts/check-a16ax-cloudflare-runtime-vars-preservation-deploy-wiring.cjs",
  "scripts/check-a16az-official-import-post-409-session-state-diagnosis.cjs",
  "scripts/check-a16r-runtime-execution-enablement-gate.cjs",
  "scripts/check-a16v-apply-verify.cjs",
  "docs/PLAN_A16BC_OWNER_APPROVAL_STATE_TRANSITION_READINESS.md",
  "docs/PLAN_A16BE_OFFICIAL_IMPORT_RPC_SESSION_OWNERSHIP_CONTRACT_DIAGNOSIS.md",
  "docs/PLAN_A16BF_RPC_INVOCATION_IDENTITY_PRECHECK_CONTRACT_ALIGNMENT.md",
  "docs/PLAN_A16BH_PRODUCTION_A16BF_IDENTITY_PRECHECK_RPC_CONTRACT_DRIFT_DIAGNOSIS.md",
  "docs/PLAN_A16BI_SAME_CLIENT_RPC_BINDING_PRODUCTION_CONTRACT_READ_ONLY_VERIFICATION.md",
  "lib/import/giapha4/import-session-owner-approval-state-service.ts",
  "app/api/admin/import-sessions/[sessionId]/owner-approval-state/route.ts",
  "components/imports/a16bc-owner-approval-state-client.tsx",
  "scripts/check-a16bc-owner-approval-state-transition-readiness.cjs",
  "scripts/check-a16be-official-import-rpc-session-ownership-contract-diagnosis.cjs",
  "scripts/check-a16bf-rpc-invocation-identity-precheck-contract-alignment.cjs",
  "app/api/admin/import-sessions/[sessionId]/official-import-identity-precheck/route.ts",
  "scripts/check-a16bh-production-a16bf-identity-precheck-rpc-contract-drift-diagnosis.cjs",
  "scripts/check-a16bi-same-client-rpc-binding-production-contract-read-only-verification.cjs",
  "scripts/verify-a16be-session-ownership-contract.cjs",
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === "wrangler.toml" || file === "app/layout.tsx") {
    failures.push(`forbidden changed file ${file}`);
  }
  if (/^(db\/migrations|supabase\/migrations|db\/checks)\//.test(file)) {
    failures.push(`forbidden SQL/check file ${file}`);
  }
  if (file.startsWith(".tmp/") || file.startsWith(".tmp\\")) {
    failures.push(`forbidden raw temp evidence file ${file}`);
  }
  if (file !== packagePath && /\.(json|xlsx|xls|csv|zip)$/i.test(file)) {
    failures.push(`forbidden raw data/evidence file ${file}`);
  }
}

const stagedFiles = git(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected staged file ${file}`);
}

if (failures.length > 0) {
  console.error("A-16BB sanitized session-state runtime gate candidate check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16BB sanitized session-state runtime gate candidate check passed.");
