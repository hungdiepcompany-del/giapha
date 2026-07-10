const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath =
  "docs/PLAN_A16BE_OFFICIAL_IMPORT_RPC_SESSION_OWNERSHIP_CONTRACT_DIAGNOSIS.md";
const checkerPath =
  "scripts/check-a16be-official-import-rpc-session-ownership-contract-diagnosis.cjs";
const verifierPath = "scripts/verify-a16be-session-ownership-contract.cjs";
const servicePath = "lib/import/giapha4/official-import-service.ts";
const routePath =
  "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";
const migrationPath =
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
const verifier = read(verifierPath);
const service = read(servicePath);
const route = read(routePath);
const migration = read(migrationPath);
const packageJson = JSON.parse(read(packagePath));
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A16BE_STATUS=DIAGNOSED_READ_ONLY_OWNERSHIP_METADATA_PASS_RPC_CONTEXT_BLOCKED",
  "A16BE_TARGET_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "A16BE_READ_ONLY_VERIFIER_STATUS=PASS_READ_ONLY_SANITIZED_OWNERSHIP_METADATA",
  "A16BE_SESSION_CREATED_BY_IDENTIFIER_TYPE=CURRENT_OWNER_PROFILE_ID",
  "A16BE_SESSION_OWNED_BY_CURRENT_PROFILE=YES",
  "A16BE_RUNTIME_IDENTIFIER_TYPE=PROFILE_ID_FROM_PERMISSION_CONTEXT_ADMIN_LOOKUP",
  "A16BE_RPC_EXPECTED_IDENTIFIER_TYPE=PROFILE_ID_FROM_PUBLIC_CURRENT_PROFILE_ID_SECURITY_INVOKER",
  "A16BE_RUNTIME_ACTOR_PROFILE_ID_PASSED_TO_RPC=NO",
  "A16BE_RPC_ACCEPTS_ACTOR_PROFILE_ID_PARAMETER=NO",
  "A16BE_EXACT_CONTRACT_MISMATCH=NO_STORED_SESSION_OWNER_MISMATCH_BUT_RUNTIME_ADMIN_PERMISSION_CONTEXT_AND_RPC_INVOKER_AUTH_CONTEXT_NOT_PROVEN_IDENTICAL_IN_SAME_RUN",
  "A16BE_BLOCKER=A16BE_BLOCKED_RPC_INVOKER_AUTH_CONTEXT_OR_PRODUCTION_RPC_CONTRACT_DRIFT_SESSION_NOT_FOUND_OR_NOT_OWNED",
  "A16BE_MINIMUM_FAIL_CLOSED_FIX_CANDIDATE=A16BF_RPC_INVOCATION_IDENTITY_CONTRACT_PRECHECK_AND_RPC_CONTRACT_ALIGNMENT",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "A16BE_POST_OFFICIAL_IMPORT_CALLED=NO_IN_THIS_PHASE",
  "A16BE_IMPORT_RPC_EXECUTED=NO_IN_THIS_PHASE",
  "A16BE_SQL_RUN=NO",
  "A16BE_DB_MUTATION_RUN=NO",
  "A16BE_NEXT_ACTION=A16BF_RPC_INVOCATION_IDENTITY_CONTRACT_PRECHECK_NO_IMPORT_NO_DEPLOY",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [verifier, "A16BE_SESSION_OWNERSHIP_CONTRACT_READ_ONLY", "verifier marker"],
  [verifier, "sessionCreatedByIdentifierType", "created_by classification"],
  [verifier, "sessionOwnedByCurrentProfile", "ownership match boolean"],
  [verifier, "rpcCalled: false", "rpc false output"],
  [verifier, "postOfficialImportCalled: false", "post false output"],
  [verifier, "sessionStateChanged: false", "session state false output"],
  [verifier, "rawPrivateDataPrinted: false", "private data false output"],
  [verifier, ".from(\"import_sessions\")", "read import_sessions"],
  [verifier, ".from(\"profiles\")", "read profiles"],
  [service, "actorProfileId: params.actor.profile?.id ?? null", "runtime actorProfileId exists"],
  [service, "rpcClient.rpc(", "runtime RPC branch exists"],
  [route, "getPermissionContext()", "route permission context"],
  [migration, "v_profile_id uuid := public.current_profile_id();", "RPC profile source"],
  [migration, "and created_by = v_profile_id", "RPC ownership predicate"],
  [migration, "raise exception 'SESSION_NOT_FOUND_OR_NOT_OWNED'", "RPC blocker"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson.scripts?.[
    "check:a16be-official-import-rpc-session-ownership-contract-diagnosis"
  ] !==
  "node scripts/check-a16be-official-import-rpc-session-ownership-contract-diagnosis.cjs"
) {
  failures.push("missing package check script");
}

if (
  packageJson.scripts?.["verify:a16be-session-ownership-contract"] !==
  "node scripts/verify-a16be-session-ownership-contract.cjs"
) {
  failures.push("missing package verify script");
}

for (const [content, token, label] of [
  [index, "PLAN_A16BE_OFFICIAL_IMPORT_RPC_SESSION_OWNERSHIP_CONTRACT_DIAGNOSIS.md", "index A-16BE"],
  [workLog, "A-16BE - Official import RPC session ownership contract diagnosis", "work log A-16BE"],
  [decisionLog, "Decision 307 - A-16BE keeps RPC ownership fail-closed", "decision log A-16BE"],
  [handoff, "A16BE_BLOCKER=A16BE_BLOCKED_RPC_INVOKER_AUTH_CONTEXT_OR_PRODUCTION_RPC_CONTRACT_DRIFT_SESSION_NOT_FOUND_OR_NOT_OWNED", "handoff blocker"],
]) {
  requireIncludes(content, token, label);
}

rejectPattern(verifier, /\.rpc\s*\(/i, "verifier RPC call");
rejectPattern(verifier, /fetch\s*\(|\/official-import/i, "verifier POST/fetch official import");
rejectPattern(verifier, /\.(insert|update|upsert|delete)\s*\(/i, "verifier DB mutation");
rejectPattern(verifier, /\bfrom\s*\(\s*["'](?:people|families|family_parents|family_children|couple_relationships|revisions)["']\s*\)/i, "verifier genealogy table read");
rejectPattern(doc + verifier, /SUPABASE_SERVICE_ROLE_KEY\s*=/i, "secret assignment");
rejectPattern(doc + verifier, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  checkerPath,
  verifierPath,
  servicePath,
  packagePath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "docs/PLAN_A16BF_RPC_INVOCATION_IDENTITY_PRECHECK_CONTRACT_ALIGNMENT.md",
  "scripts/check-a16bf-rpc-invocation-identity-precheck-contract-alignment.cjs",
  "docs/PLAN_A16BH_PRODUCTION_A16BF_IDENTITY_PRECHECK_RPC_CONTRACT_DRIFT_DIAGNOSIS.md",
  "app/api/admin/import-sessions/[sessionId]/official-import-identity-precheck/route.ts",
  "scripts/check-a16bh-production-a16bf-identity-precheck-rpc-contract-drift-diagnosis.cjs",
  "scripts/check-a16ah-official-import-runtime-execution-branch-candidate.cjs",
  "scripts/check-a16bb-sanitized-session-state-runtime-gate-candidate.cjs",
  "scripts/check-a16bc-owner-approval-state-transition-readiness.cjs",
  "scripts/check-a16r-runtime-execution-enablement-gate.cjs",
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === "wrangler.toml" || file === "app/layout.tsx") {
    failures.push(`forbidden changed file ${file}`);
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
  console.error("A-16BE RPC session ownership contract diagnosis check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16BE RPC session ownership contract diagnosis check passed.");
