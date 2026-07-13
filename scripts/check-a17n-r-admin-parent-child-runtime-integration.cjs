#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const treeActionsPath = "app/(admin)/admin/tree/edit/actions.ts";
const linkServicePath = "lib/family/admin-canonical-family-link-service.ts";
const runtimeServicePath = "lib/family/admin-canonical-family-runtime-service.ts";
const rpcAdapterPath = "lib/family/admin-canonical-family-transaction-adapter.ts";
const supabaseRepositoryPath = "lib/family/canonical-family-supabase-repository.ts";
const docPath = "docs/PLAN_A17N_R_ADMIN_PARENT_CHILD_RUNTIME_INTEGRATION.md";
const checkerPath = "scripts/check-a17n-r-admin-parent-child-runtime-integration.cjs";
const migration0024 =
  "db/migrations/20260712_0024_a17n_tx1_admin_canonical_family_transaction_executor_candidate.sql";

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

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

function rejectPattern(content, pattern, label = String(pattern)) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
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

const treeActions = read(treeActionsPath);
const linkService = read(linkServicePath);
const runtimeService = read(runtimeServicePath);
const rpcAdapter = read(rpcAdapterPath);
const supabaseRepository = read(supabaseRepositoryPath);
const doc = read(docPath);
const packageJson = readJson("package.json");
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");

for (const [content, token, label] of [
  [treeActions, "linkExistingParentFromTree", "tree action parent runtime service"],
  [treeActions, "linkExistingChildFromTree", "tree action child runtime service"],
  [runtimeService, "createServerSupabaseClient", "end-user server Supabase client"],
  [runtimeService, "createAdminCanonicalFamilyTransactionExecutor", "runtime uses RPC adapter"],
  [runtimeService, "createSupabaseCanonicalFamilyRepository", "runtime uses Supabase repository"],
  [runtimeService, "supabase.auth.getUser()", "authenticated user lookup"],
  [runtimeService, "profiles", "profile validation"],
  [runtimeService, "permissions", "permission validation"],
  [runtimeService, "relationships.create", "relationships.create permission"],
  [runtimeService, "relationships.update", "relationships.update permission"],
  [runtimeService, "wouldCreateAncestorCycle", "cycle validation"],
  [rpcAdapter, "execute_admin_canonical_family_parent_child_write", "approved RPC name"],
  [rpcAdapter, "p_operation_type", "RPC operation arg"],
  [rpcAdapter, "p_idempotency_key", "RPC idempotency arg"],
  [rpcAdapter, "p_mutation_plan_hash", "RPC hash arg"],
  [rpcAdapter, ".rpc(RPC_NAME", "RPC adapter call"],
  [linkService, "buildAdminCanonicalMutationExecutorIdentity", "deterministic executor identity"],
  [linkService, "hashAdminCanonicalMutationPlan", "mutation plan hash"],
  [linkService, "idempotencyKey", "idempotency key required"],
  [linkService, "mutationPlanHash", "mutation plan hash required"],
  [linkService, "BLOCKED_IDEMPOTENCY_CONFLICT", "idempotency conflict result"],
  [linkService, "BLOCKED_NEW_PERSON_TRANSACTION_CONTRACT_REQUIRED", "new person fail closed"],
  [linkService, "MULTIPLE_CHILD_FAMILY_CONTEXTS", "multiple child context fail closed"],
  [linkService, "MULTIPLE_SPOUSE_CONTEXTS", "multiple spouse context fail closed"],
  [linkService, "CANONICAL_FAMILY_LEGACY_DUPLICATE_REVIEW_REQUIRED", "legacy duplicate review"],
  [linkService, "PARENT_LINK_ALREADY_EXISTS", "duplicate parent no-op"],
  [linkService, "CHILD_LINK_ALREADY_EXISTS", "duplicate child no-op"],
  [linkService, "BLOCKED_CYCLE", "cycle blocker"],
  [supabaseRepository, "findCanonicalByKey", "canonical lookup repository"],
  [supabaseRepository, "findLegacyCandidatesByParentSet", "legacy candidate repository"],
  [supabaseRepository, "validatePeopleExist", "people existence validation"],
]) {
  requireIncludes(content, token, label);
}

for (const [content, label] of [
  [treeActions, treeActionsPath],
  [runtimeService, runtimeServicePath],
  [rpcAdapter, rpcAdapterPath],
  [supabaseRepository, supabaseRepositoryPath],
  [linkService, linkServicePath],
]) {
  rejectPattern(content, /SUPABASE_SERVICE_ROLE_KEY|service[_-]?role/i, `${label} service role`);
  rejectPattern(content, /SECURITY\s+DEFINER/i, `${label} SECURITY DEFINER`);
}

rejectPattern(
  treeActions,
  /\bcreateFamily\s*\(|\bcreateTreeFamily\s*\(|\baddParentToFamily\s*\(|\baddChildToFamily\s*\(/,
  "direct family or membership write helper in tree action",
);
rejectPattern(
  treeActions,
  /\.from\(\s*["'](?:families|family_parents|family_children)["']\s*\)[\s\S]{0,240}\.(?:insert|update|delete|upsert)\s*\(/i,
  "direct Supabase family write in tree action",
);
rejectPattern(
  treeActions,
  /linkExistingParentFromTree[\s\S]{0,240}(?:createFamily|addParentToFamily|addChildToFamily)|linkExistingChildFromTree[\s\S]{0,240}(?:createFamily|addParentToFamily|addChildToFamily)/,
  "sequential mutation fallback after canonical service",
);

rejectPattern(
  [runtimeService, rpcAdapter, linkService].join("\n"),
  /\bfull_name\b|\bdisplay_name\b|\bbirth_date\b|\bdeath_date\b|\bhome_town\b|\bshort_bio\b|\bnotes_private\b|\bemail\b/i,
  "PII diagnostics in canonical runtime path",
);

const productionCallers = [
  treeActions.includes("linkExistingParentFromTree("),
  treeActions.includes("linkExistingChildFromTree("),
].filter(Boolean).length;
if (productionCallers !== 2) {
  failures.push(`expected production caller count 2, got ${productionCallers}`);
}

for (const [relativePath, forbiddenToken] of [
  ["lib/import/giapha4/official-import-service.ts", "admin-canonical-family-runtime-service"],
  ["app/(admin)/admin/relationships/actions.ts", "admin-canonical-family-runtime-service"],
  ["lib/family/public-family-service.ts", "admin-canonical-family-runtime-service"],
  ["lib/family/tree-graph-builder.ts", "admin-canonical-family-runtime-service"],
  ["lib/family/tree-layout-elk.ts", "admin-canonical-family-runtime-service"],
]) {
  if (read(relativePath).includes(forbiddenToken)) {
    failures.push(`unexpected runtime caller in ${relativePath}`);
  }
}

for (const token of [
  "A17N_R_STATUS=PASS_RUNTIME_INTEGRATION_DEPLOYED_AND_NO_MUTATION_SMOKE_VERIFIED",
  "A17N_DR_STATUS=PASS_DEPLOY_AND_PRODUCTION_NO_MUTATION_SMOKE_RECORDED",
  "DEPLOYED_COMMIT=256d746",
  "DATABASE_BASELINE_BEFORE_SMOKE=PASS",
  "BROWSER_NO_MUTATION_SMOKE=PASS",
  "DATABASE_BASELINE_AFTER_SMOKE=PASS",
  "A17O_READINESS=READY_A17N_DEPLOY_SMOKE_EVIDENCE_RECORDED",
  "PRECONDITION_TX2_PASS=YES",
  "ADMIN_PARENT_ACTION_INTEGRATED=YES",
  "ADMIN_CHILD_ACTION_INTEGRATED=YES",
  "CANONICAL_APPLICATION_SERVICE_ACTIVE=YES",
  "TRANSACTION_EXECUTOR_ADAPTER_CREATED=YES",
  "APPROVED_RPC_USED=YES",
  "END_USER_SERVER_CONTEXT_USED=YES",
  "SERVICE_ROLE_USED=NO",
  "UNCONDITIONAL_PARENT_FAMILY_CREATE_REMOVED=YES",
  "UNCONDITIONAL_CHILD_FAMILY_CREATE_REMOVED=YES",
  "DIRECT_PARENT_MEMBERSHIP_INSERT_REMOVED_FROM_ACTION=YES",
  "DIRECT_CHILD_MEMBERSHIP_INSERT_REMOVED_FROM_ACTION=YES",
  "SEQUENTIAL_MUTATION_FALLBACK_PRESENT=NO",
  "IDEMPOTENCY_KEY_REQUIRED=YES",
  "MUTATION_PLAN_HASH_REQUIRED=YES",
  "PERMISSION_VALIDATION_PRESERVED=YES",
  "PROFILE_VALIDATION_PRESERVED=YES",
  "CYCLE_VALIDATION_PRESERVED=YES",
  "LEGACY_DUPLICATE_FAILS_CLOSED=YES",
  "MULTIPLE_SPOUSE_CONTEXT_FAILS_CLOSED=YES",
  "NEW_PERSON_AND_LINK_STATUS=BLOCKED_NEW_PERSON_TRANSACTION_CONTRACT_REQUIRED",
  "CANONICAL_FAMILY_PRODUCTION_CALLER_COUNT=2",
  "MIGRATION_CREATED=NO",
  "SQL_EXECUTED=NO",
  "PRODUCTION_MUTATION_SMOKE_EXECUTED_BY_CODEX=NO",
  "OFFICIAL_IMPORT_RPC_CALLED=NO",
  "DEPLOY_EXECUTED_BY_A17N_R_PHASE=NO",
  "PUSH_EXECUTED_BY_A17N_R_PHASE=NO",
  "RETRY_A17O_OFFICIAL_IMPORTER_CANONICAL_FAMILY_GROUPING_FIX",
]) {
  requireIncludes(doc, token, `A-17N-R doc token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A17N_R_ADMIN_PARENT_CHILD_RUNTIME_INTEGRATION.md", "index A-17N-R"],
  [workLog, "A17N_R_STATUS=PASS_RUNTIME_INTEGRATION_DEPLOYED_AND_NO_MUTATION_SMOKE_VERIFIED", "work log A-17N-R"],
  [decisionLog, "Decision 337 - A-17N-R activates canonical admin parent child runtime writes", "decision A-17N-R"],
  [handoff, "A17N_R_STATUS=PASS_RUNTIME_INTEGRATION_DEPLOYED_AND_NO_MUTATION_SMOKE_VERIFIED", "handoff A-17N-R"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a17n-r-admin-parent-child-runtime-integration"] !==
  "node scripts/check-a17n-r-admin-parent-child-runtime-integration.cjs"
) {
  failures.push("missing package script check:a17n-r-admin-parent-child-runtime-integration");
}

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);
const a17oTx1MigrationFiles = new Set([
  "db/migrations/20260713_0025_a17o_tx1_grouped_official_import_transaction_executor_candidate.sql",
  "supabase/migrations/20260713_0025_a17o_tx1_grouped_official_import_transaction_executor_candidate.sql",
]);

const allowedChangedFiles = new Set([
  treeActionsPath,
  linkServicePath,
  runtimeServicePath,
  rpcAdapterPath,
  supabaseRepositoryPath,
  docPath,
  checkerPath,
  "scripts/check-a17n-admin-parent-child-canonical-write-path.cjs",
  "scripts/check-a17n-dr-deploy-production-no-mutation-smoke-evidence.cjs",
  "scripts/check-a16r-import-completed-post-import-verification.cjs",
  "scripts/check-a17a-tree-baseline-evidence.cjs",
  "scripts/check-a17e-family-duplicate-read-only-audit.cjs",
  "scripts/check-a17h-canonical-family-schema-foundation-candidate.cjs",
  "scripts/check-a17i-canonical-family-schema-post-apply-verification.cjs",
  "scripts/check-a17m-canonical-family-domain-service.cjs",
  "scripts/check-a17n-tx1-admin-canonical-family-transaction-executor-candidate.cjs",
  "scripts/check-a17n-tx2f-post-apply-verifier-active-scope-correction.cjs",
  "package.json",
  "docs/PLAN_A17O_IMPORTER_CANONICAL_FAMILY_GROUPING_FIX.md",
  "lib/import/giapha4/canonical-family-grouping.ts",
  "scripts/check-a17o-importer-canonical-family-grouping.cjs",
  "db/checks/20260713_check_a17o_tx1_grouped_official_import_transaction_executor.sql",
  "docs/PLAN_A17O_TX1_GROUPED_OFFICIAL_IMPORT_TRANSACTION_EXECUTOR_CANDIDATE.md",
  "scripts/check-a17o-tx1-grouped-official-import-transaction-executor-candidate.cjs",
  ...a17oTx1MigrationFiles,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "docs/PLAN_A17N_DR_DEPLOY_PRODUCTION_NO_MUTATION_SMOKE_EVIDENCE.md",
]);

for (const changedFile of changedFiles) {
  if (
    /^(db\/migrations|supabase\/migrations)\//.test(changedFile) &&
    !a17oTx1MigrationFiles.has(changedFile)
  ) {
    failures.push(`migration changed during A-17N-R: ${changedFile}`);
  }
  if (!allowedChangedFiles.has(changedFile)) {
    failures.push(`unexpected A-17N-R dirty file: ${changedFile}`);
  }
}

if (git(["diff", "--name-only", "--", migration0024]).trim()) {
  failures.push("migration 0024 changed");
}

if (failures.length > 0) {
  console.error("A-17N-R admin parent/child runtime integration check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-17N-R admin parent/child runtime integration check passed.");
