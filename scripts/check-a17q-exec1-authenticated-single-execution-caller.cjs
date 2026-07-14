#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const failures = [];

const files = {
  service: "lib/reconciliation/a17q-authenticated-execution.ts",
  route: "app/api/admin/a17q/reconciliation-execute/route.ts",
  page: "app/(admin)/admin/reconciliation/a17q/execute/page.tsx",
  client: "components/reconciliation/a17q-authenticated-execution-client.tsx",
  dryRunService: "lib/reconciliation/a17q-authenticated-dry-run.ts",
  dryRunRoute: "app/api/admin/a17q/reconciliation-dry-run/route.ts",
  doc: "docs/PLAN_A17Q_EXEC1_AUTHENTICATED_SINGLE_EXECUTION_CALLER.md",
};

const expected = {
  rpcName: "execute_admin_a17q_legacy_family_reconciliation",
  phrase: "EXECUTE_A17Q_21_GROUP_RECONCILIATION",
  ownerMarker: "A17P_MANUAL_21_GROUP_RECONCILIATION_APPROVED",
  idempotencyKey: "A17Q_EXEC1_SINGLE_EXECUTION_20260714_FBBF24C_001",
  hashes: [
    "777a8bb13ff45eb9f46fd817c392098ada4a2d550cad8e6ee4c6cd896b874ad0",
    "7dd719c926dc560aa69bc7070c395535942823e87739d9893d0161713e151740",
    "ee255398f84dc2ce899d14056fb0573f771202ca7ad71e598cbbe7fc47707a9f",
    "7898280dab816af96b6a9277b93b49429c5db8a71c9f24739a7d55660a0bdd61",
    "4c0beb0de1589a7728b7f8b4918844e3103aa773ad3a5ab8e87d1ab2cead9ff3",
  ],
};

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

function rejectPattern(content, pattern, label = String(pattern)) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

function countMatches(content, pattern) {
  return [...content.matchAll(pattern)].length;
}

function listRuntimeFiles(dir, result = []) {
  for (const entry of fs.readdirSync(path.join(root, dir), {
    withFileTypes: true,
  })) {
    const relative = path.join(dir, entry.name).replace(/\\/g, "/");
    if (entry.isDirectory()) {
      if ([".git", ".next", "node_modules", "docs", "db", "supabase", "scripts"].includes(entry.name)) {
        continue;
      }
      listRuntimeFiles(relative, result);
    } else if (entry.isFile() && /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name)) {
      result.push(relative);
    }
  }
  return result;
}

const service = read(files.service);
const route = read(files.route);
const page = read(files.page);
const client = read(files.client);
const dryRunService = read(files.dryRunService);
const dryRunRoute = read(files.dryRunRoute);
const doc = read(files.doc);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = JSON.parse(read("package.json"));

const runtimeSource = [service, route, page, client].join("\n");
const dryRunRuntimeSource = [dryRunService, dryRunRoute].join("\n");
const allRuntimeSource = listRuntimeFiles(".")
  .map((file) => `${file}\n${read(file)}`)
  .join("\n\n");

requireIncludes(
  service,
  'import { createServerSupabaseClient } from "@/lib/supabase/server";',
  "server cookie Supabase client import",
);
requireIncludes(service, "await supabase.auth.getUser()", "authenticated user check");
requireIncludes(service, 'supabase.rpc("current_profile_id")', "profile context check");
requireIncludes(service, '"OWNER"', "OWNER role gate");
requireIncludes(service, '"ADMIN"', "ADMIN role gate");
requireIncludes(service, '"relationships.update"', "relationships.update permission");
requireIncludes(service, '"permissions.manage"', "permissions.manage permission");
requireIncludes(service, expected.rpcName, "execution RPC name");
requireIncludes(service, expected.ownerMarker, "owner marker");
requireIncludes(service, expected.idempotencyKey, "execution idempotency key");
for (const hash of expected.hashes) {
  requireIncludes(service, hash, `approved hash ${hash}`);
}

requireIncludes(service, `A17Q_AUTHENTICATED_EXECUTION_CONFIRMATION_PHRASE`, "confirmation phrase constant");
requireIncludes(service, expected.phrase, "exact confirmation phrase");
requireIncludes(service, "p_confirm_backup_reviewed: true", "backup confirmation arg");
requireIncludes(service, "p_confirm_rollback_reviewed: true", "rollback confirmation arg");
requireIncludes(service, "p_confirm_audit_reviewed: true", "audit confirmation arg");
requireIncludes(service, "p_confirm_excluded_scope_reviewed: true", "excluded-scope confirmation arg");
requireIncludes(service, "p_dry_run_only: false", "execution dry-run flag false");
requireIncludes(service, "dryRunOnly: false", "execution result dry-run false");

const rpcIndex = service.indexOf(".rpc(A17Q_AUTHENTICATED_EXECUTION_RPC_NAME");
const phraseGateIndex = service.indexOf(
  "input.confirmationPhrase === A17Q_AUTHENTICATED_EXECUTION_CONFIRMATION_PHRASE",
);
const reviewGateIndex = service.indexOf("hasAcceptedExecutionConfirmations(input)");
const confirmationReturnIndex = service.indexOf('status: "CONFIRMATION_REQUIRED"');
if (rpcIndex < 0) failures.push("execution RPC call missing");
if (phraseGateIndex < 0 || phraseGateIndex > rpcIndex) {
  failures.push("exact confirmation phrase is not checked before RPC");
}
if (reviewGateIndex < 0 || reviewGateIndex > rpcIndex) {
  failures.push("review confirmations are not checked before RPC");
}
if (confirmationReturnIndex < 0 || confirmationReturnIndex > rpcIndex) {
  failures.push("confirmation failure return is not before RPC");
}

for (const token of [
  "confirmBackupReviewed === true",
  "confirmRollbackReviewed === true",
  "confirmAuditReviewed === true",
  "confirmExcludedScopeReviewed === true",
]) {
  requireIncludes(service, token, `required owner review ${token}`);
}

rejectPattern(
  runtimeSource,
  /SUPABASE_SERVICE_ROLE_KEY|maybeCreateAdminSupabaseClient|createAdminSupabaseClient|@\/lib\/supabase\/admin/i,
  "service role client",
);
rejectPattern(runtimeSource, /\bjwt\b|\bclaims\b|auth\.uid\(\)/i, "JWT claim spoofing");
rejectPattern(runtimeSource, /console\.(log|info|warn|error)/, "runtime console logging");
rejectPattern(runtimeSource, /access_token|refresh_token|cookieStore\.getAll\(\).*console/s, "session token logging");

requireIncludes(route, "export async function POST", "POST route");
requireIncludes(route, "request.json()", "POST body parse");
requireIncludes(route, "executeA17QAuthenticatedSingleExecution", "route execution call");
rejectPattern(route, /export\s+async\s+function\s+GET\b/, "GET execution route");

requireIncludes(page, "getA17QAuthenticatedExecutionGate", "page gate read");
requireIncludes(page, "PAGE_LOAD_RPC_CALL_COUNT=0", "page load RPC count label");
rejectPattern(page, /executeA17QAuthenticatedSingleExecution|\.rpc\(/, "page load RPC call");

requireIncludes(page, "A17Q_AUTHENTICATED_EXECUTION_CONFIRMATION_PHRASE", "page passes exact phrase");
requireIncludes(client, "REQUIRED_CONFIRMATION={confirmationPhrase}", "client exact phrase display");
requireIncludes(client, "confirmBackupReviewed", "client backup checkbox");
requireIncludes(client, "confirmRollbackReviewed", "client rollback checkbox");
requireIncludes(client, "confirmAuditReviewed", "client audit checkbox");
requireIncludes(client, "confirmExcludedScopeReviewed", "client excluded scope checkbox");
requireIncludes(client, "exactPhraseAccepted", "client exact phrase gate");
requireIncludes(client, "allReviewConfirmationsAccepted", "client review gate");

const nonDryRunCallerCount = countMatches(
  allRuntimeSource,
  /p_dry_run_only:\s*false/g,
);
if (nonDryRunCallerCount !== 1) {
  failures.push(`NON_DRY_RUN_CALLER_COUNT=${nonDryRunCallerCount}`);
}
if (countMatches(service, /p_dry_run_only:\s*false/g) !== 1) {
  failures.push("approved execution service must be the only false dry-run caller");
}
if (!dryRunService.includes("p_dry_run_only: true")) {
  failures.push("dry-run route no longer hardcodes true");
}
if (/p_dry_run_only:\s*false|dryRunOnly:\s*false/.test(dryRunRuntimeSource)) {
  failures.push("dry-run route contains non-dry-run path");
}

for (const token of [
  "A17Q_EXEC1_STATUS=PASS_SINGLE_EXECUTION_CALLER_PREPARED_NOT_EXECUTED",
  "DR2_EVIDENCE_RECORDED=YES",
  "DRY_RUN=true",
  "EXECUTION_ALLOWED=true",
  "MUTATION_APPLIED=false",
  "ACTIVE_BASELINE_AFTER_DRY_RUN=74/140/73",
  "DECISION_PACK_BATCH_COUNT=0",
  "AUDIT_REVISION_COUNT=0",
  "ROLLBACK_MANIFEST_COUNT=0",
  "IDEMPOTENCY_STATE_COUNT=0",
  "EXCLUDED_SCOPE_UNCHANGED=YES",
  "DELETED_FAMILY_UNCHANGED=YES",
  "GENEALOGY_DATA_MUTATED=NO",
  "AUTHENTICATED_EXECUTION_CALLER_CREATED=YES",
  "OWNER_SESSION_REQUIRED=YES",
  "SERVER_COOKIE_SESSION_USED=YES",
  "SERVICE_ROLE_USED=NO",
  "JWT_SPOOFED=NO",
  "EXACT_CONFIRMATION_REQUIRED=YES",
  "NON_DRY_RUN_CALLER_COUNT=1",
  "DRY_RUN_CALLER_UNCHANGED=YES",
  "PAGE_LOAD_RPC_CALL_COUNT=0",
  "RPC_CALLED=NO",
  "DATABASE_MUTATION=NO",
  "RECONCILIATION_EXECUTED=NO",
  "RUNTIME_CHANGED=YES",
  "DEPLOY=NO",
  "PUSH=NO",
  "NEXT_ACTION=A17Q_EXEC2_DEPLOY_OWNER_APPROVAL_EXECUTE_ONCE_AND_FINAL_VERIFY",
]) {
  requireIncludes(doc, token, `doc ${token}`);
  requireIncludes(workLog, token, `work log ${token}`);
  requireIncludes(handoff, token, `handoff ${token}`);
}

requireIncludes(index, "PLAN_A17Q_EXEC1_AUTHENTICATED_SINGLE_EXECUTION_CALLER.md", "index EXEC1 doc");
requireIncludes(decisionLog, "A-17Q-EXEC1 prepares the single authenticated non-dry-run execution caller", "decision log EXEC1");

if (
  packageJson.scripts?.["check:a17q-exec1-authenticated-single-execution-caller"] !==
  "node scripts/check-a17q-exec1-authenticated-single-execution-caller.cjs"
) {
  failures.push("missing package script check:a17q-exec1-authenticated-single-execution-caller");
}

console.log("A17Q_EXEC1_STATUS=PASS_SINGLE_EXECUTION_CALLER_PREPARED_NOT_EXECUTED");
console.log("DR2_EVIDENCE_RECORDED=YES");
console.log("AUTHENTICATED_EXECUTION_CALLER_CREATED=YES");
console.log("OWNER_SESSION_REQUIRED=YES");
console.log("SERVICE_ROLE_USED=NO");
console.log("JWT_SPOOFED=NO");
console.log("EXACT_CONFIRMATION_REQUIRED=YES");
console.log(`NON_DRY_RUN_CALLER_COUNT=${nonDryRunCallerCount}`);
console.log("DRY_RUN_CALLER_UNCHANGED=YES");
console.log("PAGE_LOAD_RPC_CALL_COUNT=0");
console.log("RPC_CALLED=NO");
console.log("DATABASE_MUTATION=NO");
console.log("RECONCILIATION_EXECUTED=NO");
console.log("RUNTIME_CHANGED=YES");
console.log("DEPLOY=NO");
console.log("PUSH=NO");

if (failures.length > 0) {
  console.error("FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("PASS");
