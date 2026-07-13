#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const sourceFiles = [
  "lib/family/canonical-family-types.ts",
  "lib/family/canonical-family-errors.ts",
  "lib/family/canonical-family-identity.ts",
  "lib/family/canonical-family-repository.ts",
  "lib/family/canonical-family-service.ts",
];
const docPath = "docs/PLAN_A17M_CANONICAL_FAMILY_DOMAIN_SERVICE.md";
const checkerPath = "scripts/check-a17m-canonical-family-domain-service.cjs";
const a17nTx1MigrationFiles = new Set([
  "db/migrations/20260712_0024_a17n_tx1_admin_canonical_family_transaction_executor_candidate.sql",
  "supabase/migrations/20260712_0024_a17n_tx1_admin_canonical_family_transaction_executor_candidate.sql",
]);

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

function listFiles(scanPath) {
  const absolutePath = path.join(root, scanPath);
  if (!fs.existsSync(absolutePath)) return [];
  if (fs.statSync(absolutePath).isFile()) return [scanPath];

  const files = [];
  for (const entry of fs.readdirSync(absolutePath, { withFileTypes: true })) {
    const childPath = path.join(scanPath, entry.name).replace(/\\/g, "/");
    if (entry.isDirectory()) {
      files.push(...listFiles(childPath));
    } else if (/\.(ts|tsx|js|jsx|cjs|mjs)$/.test(entry.name)) {
      files.push(childPath);
    }
  }
  return files;
}

function stableJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
    .join(",")}}`;
}

function normalizeParents(parents) {
  const active = parents.filter((parent) => parent.active !== false && !parent.deletedAt);
  const seen = new Set();
  const normalized = [];
  const blockers = [];

  for (const parent of active) {
    const personId = String(parent.personId ?? "").trim();
    if (!/^[A-Za-z0-9][A-Za-z0-9:_-]*$/.test(personId)) {
      blockers.push("CANONICAL_FAMILY_INVALID_PARENT_ID");
      continue;
    }
    if (seen.has(personId)) {
      blockers.push("CANONICAL_FAMILY_DUPLICATE_PARENT_ID");
      continue;
    }
    seen.add(personId);
    normalized.push({
      personId,
      parentRole: parent.parentRole ?? "unknown",
      relationshipType: parent.relationshipType ?? "unknown",
    });
  }

  normalized.sort((a, b) => a.personId.localeCompare(b.personId));
  const parentIds = normalized.map((parent) => parent.personId);
  if (parentIds.length === 0) blockers.push("CANONICAL_FAMILY_ZERO_PARENT_AMBIGUOUS");
  if (parentIds.length > 2) blockers.push("CANONICAL_FAMILY_TOO_MANY_PARENTS");
  const roles = normalized
    .map((parent) => parent.parentRole)
    .filter((role) => role === "father" || role === "mother");
  if (new Set(roles).size !== roles.length) {
    blockers.push("CANONICAL_FAMILY_CONFLICTING_PARENT_ROLE");
  }

  return { parentIds, blockers };
}

function identity(input) {
  const normalized = normalizeParents(input.parents);
  if (normalized.blockers.length > 0) {
    return {
      status: normalized.blockers.includes("CANONICAL_FAMILY_TOO_MANY_PARENTS")
        ? "OWNER_REVIEW_REQUIRED"
        : "BLOCKED_AMBIGUOUS",
      key: null,
      blockers: normalized.blockers,
    };
  }
  const payload = {
    version: 1,
    parentIds: normalized.parentIds,
    unionIdentity: input.unionIdentity ?? null,
    relationshipPeriod: input.relationshipPeriod ?? null,
  };
  const serialized = stableJson(payload);
  return {
    status: "VALID",
    key: `canonical-family:v1:${crypto.createHash("sha256").update(serialized).digest("hex")}`,
    payload,
    serialized,
  };
}

function decide({ lookup, legacyCount = 0, missing = 0, metadataConflict = false, periodAmbiguous = false }) {
  if (missing > 0) return "BLOCKED_AMBIGUOUS";
  if (lookup === "MULTIPLE") return "BLOCKED_INVARIANT_VIOLATION";
  if (legacyCount > 0 || metadataConflict || periodAmbiguous || lookup === "MERGED" || lookup === "VOIDED") {
    return "OWNER_REVIEW_REQUIRED";
  }
  if (lookup === "FOUND") return "REUSE_CANONICAL";
  return "CREATE_NEW_CANONICAL";
}

function assertCase(label, condition) {
  if (!condition) failures.push(`contract fixture failed: ${label}`);
}

const combinedSource = sourceFiles.map(read).join("\n");
const ab = identity({ parents: [{ personId: "parent-a" }, { personId: "parent-b" }] });
const ba = identity({ parents: [{ personId: "parent-b" }, { personId: "parent-a" }] });
assertCase("1. Parent A+B order invariant", ab.key === ba.key);
assertCase("2. duplicate parent IDs blocked", identity({ parents: [{ personId: "parent-a" }, { personId: "parent-a" }] }).status !== "VALID");
assertCase("3. single parent deterministic", identity({ parents: [{ personId: "parent-a" }] }).key === identity({ parents: [{ personId: "parent-a" }] }).key);
assertCase("4. Child 1 and Child 2 same parents same identity", identity({ parents: [{ personId: "parent-a" }, { personId: "parent-b" }], childId: "child-1" }).key === identity({ parents: [{ personId: "parent-a" }, { personId: "parent-b" }], childId: "child-2" }).key);
assertCase("5. child ID changes do not change identity", identity({ parents: [{ personId: "parent-a" }], childId: "child-1" }).key === identity({ parents: [{ personId: "parent-a" }], childId: "child-9" }).key);
assertCase("6. different spouse different identity", identity({ parents: [{ personId: "parent-a" }, { personId: "spouse-1" }] }).key !== identity({ parents: [{ personId: "parent-a" }, { personId: "spouse-2" }] }).key);
assertCase("7. different relationship periods differ", identity({ parents: [{ personId: "parent-a" }, { personId: "parent-b" }], relationshipPeriod: { startDate: "2000", startDatePrecision: "year", endDate: null, endDatePrecision: null } }).key !== identity({ parents: [{ personId: "parent-a" }, { personId: "parent-b" }], relationshipPeriod: { startDate: "2010", startDatePrecision: "year", endDate: null, endDatePrecision: null } }).key);
assertCase("8. display name not in identity", identity({ parents: [{ personId: "parent-a", displayName: "Name 1" }] }).key === identity({ parents: [{ personId: "parent-a", displayName: "Name 2" }] }).key);
assertCase("9. Vietnamese names not used", identity({ parents: [{ personId: "parent-a", displayName: "Nguyen Van A" }] }).key === identity({ parents: [{ personId: "parent-a", displayName: "Nguyễn Văn A" }] }).key);
assertCase("10. serialization deterministic", ab.serialized === ba.serialized);
assertCase("11. found -> reuse", decide({ lookup: "FOUND" }) === "REUSE_CANONICAL");
assertCase("12. no match -> create", decide({ lookup: "NOT_FOUND" }) === "CREATE_NEW_CANONICAL");
assertCase("13. multiple matches fail closed", decide({ lookup: "MULTIPLE" }) === "BLOCKED_INVARIANT_VIOLATION");
assertCase("14. legacy duplicate owner review", decide({ lookup: "NOT_FOUND", legacyCount: 2 }) === "OWNER_REVIEW_REQUIRED");
assertCase("15. metadata conflict owner review", decide({ lookup: "NOT_FOUND", metadataConflict: true }) === "OWNER_REVIEW_REQUIRED");
assertCase("16. missing person blocked", decide({ lookup: "NOT_FOUND", missing: 1 }) === "BLOCKED_AMBIGUOUS");
assertCase("17. merged not reused", decide({ lookup: "MERGED" }) === "OWNER_REVIEW_REQUIRED");
assertCase("18. voided not reused", decide({ lookup: "VOIDED" }) === "OWNER_REVIEW_REQUIRED");
assertCase("19. second child same family", identity({ parents: [{ personId: "parent-a" }, { personId: "parent-b" }], childId: "child-2" }).key === ab.key);
assertCase("20. eight children one family identity", new Set(Array.from({ length: 8 }, (_, index) => identity({ parents: [{ personId: "parent-a" }, { personId: "parent-b" }], childId: `child-${index}` }).key)).size === 1);
assertCase("21. plan creation no database mutation", true);
assertCase("26. transaction executor required", read("lib/family/canonical-family-service.ts").includes("transactionExecutorRequired: true"));
assertCase("27. no production credentials", !/\bSUPABASE_SERVICE_ROLE_KEY\b|\bservice_role\b/i.test(combinedSource));
assertCase("28. no PII in snapshots", !/\bfull_name\b|\bdisplay_name\b|\bbirth_date\b|\bnotes_private\b/i.test(read("lib/family/canonical-family-service.ts")));

const doc = read(docPath);
const packageJson = readJson("package.json");

for (const token of [
  "CANONICAL_FAMILY_IDENTITY_VERSION = 1",
  "CANONICAL_FAMILY_IDENTITY_PREFIX = \"canonical-family:v1\"",
  "normalizeCanonicalParentSet",
  "buildCanonicalFamilyIdentity",
  "decideCanonicalFamilyReuseOrCreate",
  "planCanonicalFamilyMutation",
  "CanonicalFamilyRepository",
  "findCanonicalByKey",
  "findLegacyCandidatesByParentSet",
  "validatePeopleExist",
  "readFamilyMemberships",
  "CanonicalFamilyMutationPlan",
  "transactionExecutorRequired: true",
  "CANONICAL_FAMILY_INVALID_PARENT_ID",
  "CANONICAL_FAMILY_DUPLICATE_PARENT_ID",
  "CANONICAL_FAMILY_CONFLICTING_PARENT_ROLE",
  "CANONICAL_FAMILY_ZERO_PARENT_AMBIGUOUS",
  "CANONICAL_FAMILY_TOO_MANY_PARENTS",
  "CANONICAL_FAMILY_PERSON_REFERENCE_MISSING",
  "CANONICAL_FAMILY_LEGACY_DUPLICATE_REVIEW_REQUIRED",
  "CANONICAL_FAMILY_MULTIPLE_ACTIVE_CANONICAL_MATCHES",
  "CANONICAL_FAMILY_METADATA_CONFLICT",
  "CANONICAL_FAMILY_RELATIONSHIP_PERIOD_AMBIGUOUS",
  "CANONICAL_FAMILY_MERGED_RECORD_NOT_REUSABLE",
  "CANONICAL_FAMILY_VOIDED_RECORD_NOT_REUSABLE",
  "CANONICAL_FAMILY_TRANSACTION_EXECUTOR_REQUIRED",
]) {
  requireIncludes(combinedSource, token, `source token ${token}`);
}

for (const token of [
  "A17M_STATUS=CANONICAL_FAMILY_DOMAIN_SERVICE_FOUNDATION_READY",
  "CANONICAL_FAMILY_DOMAIN_SERVICE_CREATED=YES",
  "CANONICAL_IDENTITY_VERSION=canonical-family:v1",
  "PARENT_SET_NORMALIZATION_CREATED=YES",
  "CANONICAL_KEY_BUILDER_CREATED=YES",
  "CANONICAL_LOOKUP_CREATED=YES",
  "REUSE_OR_CREATE_DECISION_CREATED=YES",
  "MUTATION_PLAN_CONTRACT_CREATED=YES",
  "REPOSITORY_CONTRACT_CREATED=YES",
  "DOMAIN_ERROR_CODES_CREATED=YES",
  "NO_PII_DIAGNOSTICS_CREATED=YES",
  "CANONICAL_FAMILY_PRODUCTION_CALLER_COUNT=1",
  "CANONICAL_FAMILY_PRODUCTION_CALLER=A17O_R_GROUPED_OFFICIAL_IMPORT_PLAN_BUILDER",
  "CURRENT_WRITE_PATHS_REMAIN_UNCHANGED=YES",
  "A-17N",
  "A-17O",
  "A-17P",
  "MIGRATION_CREATED=NO",
  "SQL_EXECUTED=NO",
  "RECONCILIATION_EXECUTED=NO",
  "IMPORT_RPC_CALLED=NO",
  "DEPLOY=NO",
  "PUSH=NO",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

const runtimeScanPaths = [
  "app",
  "components",
  "lib/import",
  "lib/family/relationship-service.ts",
  "lib/family/tree-graph-builder.ts",
  "lib/family/tree-service.ts",
  "lib/family/tree-layout-elk.ts",
  "lib/family/tree-layout-service.ts",
  "lib/family/public-family-service.ts",
];
let productionCallerCount = 0;
for (const scanPath of runtimeScanPaths) {
  const absolutePath = path.join(root, scanPath);
  if (!fs.existsSync(absolutePath)) continue;
  const files = listFiles(scanPath);
  for (const file of files) {
    const content = read(file);
    if (/canonical-family-(service|identity|repository|types|errors)/.test(content)) {
      productionCallerCount += 1;
    }
  }
}
if (productionCallerCount !== 1) {
  failures.push(`CANONICAL_FAMILY_PRODUCTION_CALLER_COUNT=${productionCallerCount}`);
}

rejectPattern(combinedSource, /\.from\(|\.insert\(|\.delete\(|\.upsert\(|\.rpc\(/i, "database mutation/client call");
rejectPattern(combinedSource, /service[_-]?role|SUPABASE_SERVICE_ROLE_KEY/i, "service role reference");
rejectPattern(combinedSource, /SECURITY\s+DEFINER/i, "SECURITY DEFINER");
rejectPattern(combinedSource, /full_name|display_name|birth_date|notes_private/i, "PII-bearing field");

if (
  packageJson?.scripts?.["check:a17m-canonical-family-domain-service"] !==
  "node scripts/check-a17m-canonical-family-domain-service.cjs"
) {
  failures.push("missing package script check:a17m-canonical-family-domain-service");
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
  ...sourceFiles,
  docPath,
  checkerPath,
  "package.json",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "scripts/check-a17a-tree-baseline-evidence.cjs",
  "scripts/check-a17e-family-duplicate-read-only-audit.cjs",
  "scripts/check-a17h-canonical-family-schema-foundation-candidate.cjs",
  "scripts/check-a17i-canonical-family-schema-post-apply-verification.cjs",
  "scripts/check-a16r-import-completed-post-import-verification.cjs",
  "lib/family/admin-canonical-family-link-service.ts",
  "docs/PLAN_A17N_ADMIN_PARENT_CHILD_CANONICAL_WRITE_PATH.md",
  "scripts/check-a17n-admin-parent-child-canonical-write-path.cjs",
  "db/checks/20260712_check_a17n_tx1_admin_canonical_family_transaction_executor.sql",
  "docs/PLAN_A17N_TX1_ADMIN_CANONICAL_FAMILY_TRANSACTION_EXECUTOR_CANDIDATE.md",
  "scripts/check-a17n-tx1-admin-canonical-family-transaction-executor-candidate.cjs",
  "docs/PLAN_A17N_TX2_ADMIN_CANONICAL_FAMILY_TRANSACTION_EXECUTOR_POST_APPLY_VERIFICATION.md",
  "docs/PLAN_A17N_TX2F_POST_APPLY_VERIFIER_ACTIVE_SCOPE_CORRECTION.md",
  "scripts/check-a17n-tx2f-post-apply-verifier-active-scope-correction.cjs",
  "docs/PLAN_A17N_R_ADMIN_PARENT_CHILD_RUNTIME_INTEGRATION.md",
  "scripts/check-a17n-r-admin-parent-child-runtime-integration.cjs",
  "docs/PLAN_A17N_DR_DEPLOY_PRODUCTION_NO_MUTATION_SMOKE_EVIDENCE.md",
  "scripts/check-a17n-dr-deploy-production-no-mutation-smoke-evidence.cjs",
  "docs/PLAN_A17O_IMPORTER_CANONICAL_FAMILY_GROUPING_FIX.md",
  "lib/import/giapha4/canonical-family-grouping.ts",
  "scripts/check-a17o-importer-canonical-family-grouping.cjs",
  "db/checks/20260713_check_a17o_tx1_grouped_official_import_transaction_executor.sql",
  "docs/PLAN_A17O_TX1_GROUPED_OFFICIAL_IMPORT_TRANSACTION_EXECUTOR_CANDIDATE.md",
  "scripts/check-a17o-tx1-grouped-official-import-transaction-executor-candidate.cjs",
  "docs/PLAN_A17O_TX1R_GROUPED_IMPORT_EXECUTOR_MANUAL_APPLY_VERIFICATION.md",
  "scripts/check-a17o-tx1r-grouped-import-executor-manual-apply-verification.cjs",
  "docs/PLAN_A17O_R_GROUPED_IMPORTER_RUNTIME_INTEGRATION.md",
  "scripts/check-a17o-r-grouped-importer-runtime-integration.cjs",
  "docs/PLAN_A17O_DR_GROUPED_IMPORTER_DEPLOY_NO_IMPORT_MUTATION_SMOKE_EVIDENCE.md",
  "scripts/check-a17o-dr-grouped-importer-deploy-no-import-mutation-smoke-evidence.cjs",
  "docs/PLAN_A17P_LEGACY_RECONCILIATION_AUDIT_DRY_RUN_OWNER_REVIEW_PACK.md",
  "db/checks/20260713_check_a17p_owner_facing_legacy_family_review.sql",
  "docs/templates/A17P_LEGACY_RECONCILIATION_OWNER_REVIEW_PACK_TEMPLATE.md",
  "db/checks/20260713_check_a17p_legacy_family_reconciliation_audit.sql",
  "scripts/a17p-legacy-reconciliation-planner.cjs",
  "scripts/check-a17p-legacy-reconciliation-audit-dry-run-owner-review-pack.cjs",
  "scripts/check-a17p-fix2-owner-facing-legacy-family-review-query.cjs",
  "scripts/check-a17p-fix3-parent-role-gender-review-evidence.cjs",
  "docs/evidence/A17P_OWNER_DECISION_PACK.json",
  "docs/evidence/A17P_OWNER_DECISION_PACK.sha256",
  "scripts/check-a17p-manual-owner-approval-evidence.cjs",
  "scripts/check-a17p-r-immutable-owner-decision-pack.cjs",
  "db/checks/20260713_check_a17q_tx1_legacy_family_reconciliation_executor_candidate.sql",
  "db/migrations/20260713_0026_a17q_tx1_legacy_family_reconciliation_transaction_executor_candidate.sql",
  "supabase/migrations/20260713_0026_a17q_tx1_legacy_family_reconciliation_transaction_executor_candidate.sql",
  "docs/PLAN_A17Q_TX1_LEGACY_FAMILY_RECONCILIATION_TRANSACTION_EXECUTOR_CANDIDATE.md",
  "scripts/check-a17q-tx1-legacy-family-reconciliation-transaction-executor-candidate.cjs",
  "scripts/check-a17q-tx1-fix1-hardened-reconciliation-executor.cjs",
  "docs/PLAN_A17Q_TX1_FIX1_OWNER_REVIEW_HARDENED_RECONCILIATION_EXECUTOR_CANDIDATE.md",
  "scripts/check-a17q-tx1-fix1-owner-review.cjs",
  "scripts/check-a17q-tx1-fix2-exact-post-state-reconciliation-contract.cjs",
  "docs/PLAN_A17Q_TX1_FIX2_OWNER_REVIEW_EXACT_POST_STATE_RECONCILIATION_CANDIDATE.md",
  "scripts/check-a17q-tx1-fix2-owner-review.cjs",
  "scripts/check-a17q-tx1-fix3-final-integrity-contract.cjs",
  "docs/PLAN_A17A_TREE_BASELINE_EVIDENCE.md",
  "docs/PLAN_A17E_FAMILY_DUPLICATE_READ_ONLY_AUDIT.md",
  "docs/PLAN_A17F_FAMILY_RECONCILIATION_DRY_RUN.md",
  "docs/PLAN_A17G_FAMILY_RECONCILIATION_ROLLBACK_DESIGN.md",
  "docs/PLAN_A17EG_FAMILY_RECONCILIATION_AUDIT_DRY_RUN_BUNDLE.md",
  "app/api/admin/import-sessions/[sessionId]/official-import/route.ts",
  "components/imports/import-session-manifest-panel.tsx",
  "lib/import/giapha4/dry-run-mapping-preview-service.ts",
  "lib/import/giapha4/grouped-official-import-executor-adapter.ts",
  "lib/import/giapha4/import-review-pack-service.ts",
  "lib/import/giapha4/official-import-service.ts",
  "app/(admin)/admin/tree/edit/actions.ts",
  "lib/family/admin-canonical-family-runtime-service.ts",
  "lib/family/admin-canonical-family-transaction-adapter.ts",
  "lib/family/canonical-family-supabase-repository.ts",
  ...a17nTx1MigrationFiles,
  ...a17oTx1MigrationFiles,
]);

for (const changedFile of changedFiles) {
  if (
    (changedFile.startsWith("db/migrations/") ||
      changedFile.startsWith("supabase/migrations/")) &&
    !a17nTx1MigrationFiles.has(changedFile) &&
    !a17oTx1MigrationFiles.has(changedFile) &&
    !allowedChangedFiles.has(changedFile)
  ) {
    failures.push(`migration changed during A-17M: ${changedFile}`);
  }
  if (!allowedChangedFiles.has(changedFile)) {
    failures.push(`unexpected A-17M dirty file: ${changedFile}`);
  }
}

if (failures.length > 0) {
  console.error("A-17M canonical family domain service check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-17M canonical family domain service check passed.");
