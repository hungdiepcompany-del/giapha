#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A17O_R_GROUPED_IMPORTER_RUNTIME_INTEGRATION.md";
const groupingPath = "lib/import/giapha4/canonical-family-grouping.ts";
const adapterPath =
  "lib/import/giapha4/grouped-official-import-executor-adapter.ts";
const servicePath = "lib/import/giapha4/official-import-service.ts";
const routePath =
  "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";
const dryRunPath = "lib/import/giapha4/dry-run-mapping-preview-service.ts";
const reviewPackPath = "lib/import/giapha4/import-review-pack-service.ts";
const tx1rDocPath =
  "docs/PLAN_A17O_TX1R_GROUPED_IMPORT_EXECUTOR_MANUAL_APPLY_VERIFICATION.md";
const tx1MigrationPath =
  "db/migrations/20260713_0025_a17o_tx1_grouped_official_import_transaction_executor_candidate.sql";
const completedSession = "2af4bfb6-a20e-453e-9804-1b8c0afbdd68";

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

function stableJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
    .join(",")}}`;
}

function sha(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function groupKey(parents) {
  const parentFingerprints = Array.from(new Set(parents)).sort();
  return `a17o-import-family-group:v1:${sha(
    JSON.stringify({
      version: "a17o-import-family-group:v1",
      parentFingerprints,
    }),
  )}`;
}

function groupedFixture(childCount, order = "normal", duplicateRows = false) {
  const children = Array.from({ length: childCount }, (_, index) => `child-${index + 1}`);
  const rows = children.flatMap((child) => [
    ["parent-a", child],
    ["parent-b", child],
  ]);
  if (duplicateRows) rows.push(["parent-a", "child-1"], ["parent-b", "child-1"]);
  if (order === "reversed") rows.reverse();
  const groups = new Map();
  for (const [parent, child] of rows) {
    const key = groupKey(["parent-a", "parent-b"]);
    const group = groups.get(key) ?? {
      groupKey: key,
      parents: new Set(),
      children: new Set(),
      sourceReferenceHashes: new Set(),
    };
    group.parents.add(parent);
    group.children.add(child);
    group.sourceReferenceHashes.add(sha(stableJson({ parent, child })));
    groups.set(key, group);
  }
  const normalized = Array.from(groups.values()).map((group) => ({
    groupKey: group.groupKey,
    parents: Array.from(group.parents).sort(),
    children: Array.from(group.children).sort(),
    sourceReferenceHashes: Array.from(group.sourceReferenceHashes).sort(),
  }));
  const plan = {
    contractVersion: 1,
    familyGroups: normalized,
    counts: {
      sourceChildRelationshipCount: normalized.reduce(
        (sum, group) => sum + group.children.length,
        0,
      ),
      canonicalFamilyGroupCount: normalized.length,
      plannedParentMembershipCount: normalized.reduce(
        (sum, group) => sum + group.parents.length,
        0,
      ),
      plannedChildMembershipCount: normalized.reduce(
        (sum, group) => sum + group.children.length,
        0,
      ),
    },
  };
  return { plan, hash: sha(stableJson(plan)) };
}

function assertCase(label, condition) {
  if (!condition) failures.push(`fixture failed: ${label}`);
}

const doc = read(docPath);
const grouping = read(groupingPath);
const adapter = read(adapterPath);
const service = read(servicePath);
const route = read(routePath);
const dryRun = read(dryRunPath);
const reviewPack = read(reviewPackPath);
const tx1rDoc = read(tx1rDocPath);
const tx1Migration = read(tx1MigrationPath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = readJson("package.json");

const oneChild = groupedFixture(1);
const twoSiblings = groupedFixture(2);
const eightSiblings = groupedFixture(8);
const ninthSibling = groupedFixture(9);
const reversed = groupedFixture(8, "reversed");
const duplicateRows = groupedFixture(8, "normal", true);

assertCase("one child one family", oneChild.plan.counts.canonicalFamilyGroupCount === 1);
assertCase("two siblings one family", twoSiblings.plan.counts.canonicalFamilyGroupCount === 1);
assertCase(
  "eight siblings one family",
  eightSiblings.plan.counts.canonicalFamilyGroupCount === 1 &&
    eightSiblings.plan.counts.sourceChildRelationshipCount === 8 &&
    eightSiblings.plan.counts.plannedParentMembershipCount === 2 &&
    eightSiblings.plan.counts.plannedChildMembershipCount === 8,
);
assertCase("ninth sibling family count unchanged", ninthSibling.plan.counts.canonicalFamilyGroupCount === 1);
assertCase("reversed input order same plan", eightSiblings.hash === reversed.hash);
assertCase("duplicate source rows same family count", duplicateRows.plan.counts.canonicalFamilyGroupCount === 1);

for (const [content, token, label] of [
  [tx1rDoc, "A17O_RUNTIME_INTEGRATION_READINESS=READY_GROUPED_EXECUTOR_APPLIED_AND_VERIFIED", "TX1R readiness evidence"],
  [tx1Migration, "create or replace function public.a17o_tx_execute_grouped_giapha4_official_import", "grouped executor migration"],
  [tx1Migration, "p_grouped_plan jsonb", "grouped plan argument"],
  [tx1Migration, "p_idempotency_key text", "idempotency argument"],
  [tx1Migration, "p_mutation_plan_hash text", "mutation hash argument"],
  [grouping, "A17O_IMPORTER_CANONICAL_GROUPING_RUNTIME_ACTIVE = true", "runtime active constant"],
  [grouping, "A17O_GROUPED_PLAN_CONTRACT_VERSION", "plan contract version"],
  [grouping, "buildA17OGroupedOfficialImportPlan", "grouped plan builder"],
  [grouping, "stableCanonicalJson(basePlan)", "hash after normalized plan"],
  [grouping, "childIdIncludedInGroupKey: false", "child identity excluded"],
  [grouping, "parentInputOrderAffectsGroupKey: false", "parent order excluded"],
  [grouping, "sourceReferenceHashes", "safe source reference hashes"],
  [adapter, "A17O_GROUPED_OFFICIAL_IMPORT_RPC_FUNCTION_NAME", "adapter RPC function constant"],
  [adapter, "a17o_tx_execute_grouped_giapha4_official_import", "exact grouped RPC name"],
  [adapter, "p_import_session_id", "adapter import session arg"],
  [adapter, "p_confirm_marker", "adapter marker arg"],
  [adapter, "p_confirm_manifest_hash", "adapter manifest hash arg"],
  [adapter, "p_confirm_review_pack_hash", "adapter review hash arg"],
  [adapter, "p_grouped_plan", "adapter grouped plan arg"],
  [adapter, "p_idempotency_key", "adapter idempotency arg"],
  [adapter, "p_mutation_plan_hash", "adapter mutation hash arg"],
  [adapter, "p_confirm_validation_errors_resolved", "adapter validation confirm arg"],
  [adapter, "p_confirm_rollback_reviewed", "adapter rollback confirm arg"],
  [adapter, "p_confirm_audit_reviewed", "adapter audit confirm arg"],
  [adapter, "p_dry_run_only", "adapter dry run arg"],
  [adapter, "validateGroupedRpcResult", "adapter result validation"],
  [adapter, "A17O_R_BLOCKED_GROUPED_RPC_PLAN_HASH_MISMATCH", "adapter plan hash mismatch"],
  [adapter, "A17O_R_BLOCKED_GROUPED_RPC_COUNT_MISMATCH", "adapter count mismatch"],
  [service, "buildA17OGroupedOfficialImportPlan", "service builds grouped plan"],
  [service, "executeA17OGroupedOfficialImportWithSupabase(input)", "service grouped adapter wrapper"],
  [service, "if (!candidate.canRunOfficialImport || params.executionBranchEnabled !== true)", "candidate gate before RPC"],
  [service, "A17O_R_GROUPED_PLAN_BLOCKED_BEFORE_RPC", "grouped plan fail closed"],
  [service, "runRpcInvocationIdentityPrecheck", "identity precheck preserved"],
  [dryRun, "groupedFamilyImportPlan", "dry-run grouped counts"],
  [dryRun, "dryRunSourceOnly: true", "dry-run source only"],
  [dryRun, "groupedExecutorMutationCall: false", "dry-run no mutation call"],
  [reviewPack, "canonicalFamilyGroupCount", "review pack grouped counts"],
  [dryRun, "Các anh, chị, em có cùng cha mẹ sẽ được nhập vào cùng một gia đình.", "Vietnamese preview copy"],
  [doc, "A17O_R_STATUS=PASS_GROUPED_IMPORTER_RUNTIME_SOURCE_INTEGRATED", "A17O-R status"],
  [index, "PLAN_A17O_R_GROUPED_IMPORTER_RUNTIME_INTEGRATION.md", "index A17O-R"],
  [workLog, "A17O_R_STATUS=PASS_GROUPED_IMPORTER_RUNTIME_SOURCE_INTEGRATED", "work log A17O-R"],
  [decisionLog, "Decision 342 - A-17O-R activates grouped official importer runtime source path", "decision log A17O-R"],
  [handoff, "A17O_R_STATUS=PASS_GROUPED_IMPORTER_RUNTIME_SOURCE_INTEGRATED", "handoff A17O-R"],
]) {
  requireIncludes(content, token, label);
}

for (const [content, label] of [
  [adapter, adapterPath],
  [service, servicePath],
  [route, routePath],
  [grouping, groupingPath],
]) {
  rejectPattern(content, /SUPABASE_SERVICE_ROLE_KEY|service[_-]?role/i, `${label} service role`);
  rejectPattern(content, /fetch\([\s\S]{0,200}official-import/i, `${label} production endpoint call`);
  rejectPattern(content, /\.from\([\s\S]{0,160}\.(insert|update|delete|upsert)\s*\(/i, `${label} direct database write`);
}

rejectPattern(
  service,
  /\.rpc\(\s*A16P_TX_TRANSACTION_RPC_FUNCTION_NAME|a16p_tx_execute_giapha4_official_import[\s\S]{0,160}\.rpc\(/,
  "active old executor call",
);
rejectPattern(adapter, /A16P_TX|a16p_tx_execute_giapha4_official_import/i, "old executor fallback in adapter");
rejectPattern(adapter, /catch[\s\S]{0,240}executeOfficialImport|fallback/i, "sequential fallback in adapter");
rejectPattern(grouping, /fullName|displayName|notesPrivate|birthPlace|homeTown/i, "PII in grouped plan diagnostics");
rejectPattern(tx1Migration, /drop function public\.a16p_tx_execute_giapha4_official_import/i, "old executor dropped");

if (
  packageJson?.scripts?.["check:a17o-r-grouped-importer-runtime-integration"] !==
  "node scripts/check-a17o-r-grouped-importer-runtime-integration.cjs"
) {
  failures.push("missing package script check:a17o-r-grouped-importer-runtime-integration");
}

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);
const allowedA17QTx1Migrations = new Set([
  "db/migrations/20260713_0026_a17q_tx1_legacy_family_reconciliation_transaction_executor_candidate.sql",
  "supabase/migrations/20260713_0026_a17q_tx1_legacy_family_reconciliation_transaction_executor_candidate.sql",
]);
for (const file of changedFiles) {
  if (
    /^(db\/migrations|supabase\/migrations)\//.test(file) &&
    !allowedA17QTx1Migrations.has(file)
  ) {
    failures.push(`migration changed during A-17O-R: ${file}`);
  }
}

requireIncludes(service, completedSession, "completed production session retained as negative guard evidence");
requireIncludes(doc, "COMPLETED_OFFICIAL_IMPORT_REJECTED_BEFORE_RPC=YES", "completed session rejected doc");
requireIncludes(doc, "COMPLETED_PRODUCTION_SESSION_GROUPED_RPC_CALL_COUNT=0", "completed grouped call count doc");
requireIncludes(doc, "COMPLETED_PRODUCTION_SESSION_OLD_RPC_CALL_COUNT=0", "completed old call count doc");

if (failures.length > 0) {
  console.error("A-17O-R grouped importer runtime integration check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-17O-R grouped importer runtime integration check passed.");
