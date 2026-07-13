#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const ownerSqlPath =
  "db/checks/20260713_check_a17p_owner_facing_legacy_family_review.sql";
const docPath =
  "docs/PLAN_A17P_LEGACY_RECONCILIATION_AUDIT_DRY_RUN_OWNER_REVIEW_PACK.md";
const templatePath =
  "docs/templates/A17P_LEGACY_RECONCILIATION_OWNER_REVIEW_PACK_TEMPLATE.md";
const checkerPath =
  "scripts/check-a17p-fix3-parent-role-gender-review-evidence.cjs";
const manualApprovalCheckerPath =
  "scripts/check-a17p-manual-owner-approval-evidence.cjs";
const a17pRCheckerPath = "scripts/check-a17p-r-immutable-owner-decision-pack.cjs";
const a17pRPackPath = "docs/evidence/A17P_OWNER_DECISION_PACK.json";
const a17pRShaPath = "docs/evidence/A17P_OWNER_DECISION_PACK.sha256";

const expectedAdvisoryGroups = [
  "697e2ea051fc81496e186ce579ad0990",
  "f8a4b569a15428f13eb7c7a633219d8a",
  "669d75955c5ed0e3616936f0beeea162",
  "6e3ab58476a5c3ca27b63fd740c55e56",
  "a33cc1f6470a638e2607615fe6959eb7",
  "b34bbc4b9a7e5d3d71733d808c894e6c",
  "c0d499673c250e0b883a899dc6a27101",
  "e309bb5c052bf74a4228b00e4146eda0",
];

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

function assertCase(label, condition) {
  if (!condition) failures.push(`fixture failed: ${label}`);
}

function section(content, startToken, nextHeading = "\n## ") {
  const start = content.indexOf(startToken);
  if (start === -1) return "";
  const rest = content.slice(start);
  const next = rest.indexOf(nextHeading, 1);
  return next === -1 ? rest : rest.slice(0, next);
}

function splitTopLevel(text, separator) {
  const output = [];
  let inQuote = false;
  let depth = 0;
  let last = 0;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (inQuote) {
      if (char === "'" && next === "'") {
        index += 1;
        continue;
      }
      if (char === "'") inQuote = false;
      continue;
    }
    if (char === "'") {
      inQuote = true;
      continue;
    }
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (
      depth === 0 &&
      text.slice(index, index + separator.length).toLowerCase() === separator
    ) {
      output.push(text.slice(last, index));
      last = index + separator.length;
      index += separator.length - 1;
    }
  }
  output.push(text.slice(last));
  return output;
}

const ownerSql = read(ownerSqlPath);
const doc = read(docPath);
const template = read(templatePath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = readJson("package.json");

const originForFix2 = git(["branch", "-r", "--contains", "9611bbf"]);
if (!originForFix2.includes("origin/main")) {
  failures.push("origin/main does not contain 9611bbf");
}

const sanitizedSql = ownerSql
  .replace(/'([^']|'')*'/g, "''")
  .replace(/--.*$/gm, "")
  .replace(/\/\*[\s\S]*?\*\//g, "");

rejectPattern(
  sanitizedSql,
  /\b(insert|update|delete|merge|truncate|alter|drop|create|grant|revoke|call|do|perform)\b/i,
  "mutation/RPC statement in owner-facing SQL",
);
rejectPattern(sanitizedSql, /\brpc\b/i, "RPC marker in owner-facing SQL");
rejectPattern(
  sanitizedSql,
  /\bset\s+parent_role\b|\bparent_role\s*:=|\bparent_role\s*=/i,
  "automatic relationship role correction",
);

for (const token of [
  "parent_gender",
  "expected_role_from_gender",
  "role_gender_review_status",
  "role_gender_warning",
  "owner_confirmed_relationship_role",
  "potential_role_gender_mismatch_parent_count",
  "potential_role_gender_mismatch_family_count",
  "role_gender_owner_review_required",
  "owner_review_role_gender_advisory",
  "parent_gender_evidence_present_pass",
  "role_gender_advisory_present_pass",
  "potential_role_gender_mismatch_group_count",
  "no_automatic_role_correction_pass",
  "owner_role_confirmation_placeholders_null_pass",
  "role_gender_review_by_group",
  "where cpmr.role_gender_review_status = 'POTENTIAL_MISMATCH'",
  "null::text as owner_confirmed_relationship_role",
  "true as no_automatic_role_correction_pass",
  "true as owner_role_confirmation_placeholders_null_pass",
]) {
  requireIncludes(ownerSql, token, `owner SQL token ${token}`);
}

for (const token of [
  "CONSISTENT",
  "POTENTIAL_MISMATCH",
  "GENDER_UNKNOWN",
  "ROLE_NOT_GENDER_SPECIFIC",
  "OWNER_CONFIRMATION_REQUIRED",
]) {
  requireIncludes(ownerSql, token, `role gender status ${token}`);
}

for (const token of expectedAdvisoryGroups) {
  if (ownerSql.includes(token)) {
    failures.push(`expected advisory group hardcoded in query: ${token}`);
  }
}

const ownerReviewStart = ownerSql.indexOf("owner_review_rows as (");
const ownerReviewEnd = ownerSql.indexOf("\n)\nselect", ownerReviewStart);
if (ownerReviewStart === -1 || ownerReviewEnd === -1) {
  failures.push("owner_review_rows CTE not found");
} else {
  const ownerReviewBody = ownerSql
    .slice(ownerReviewStart, ownerReviewEnd)
    .replace(/^owner_review_rows as \(\s*/, "")
    .trim();
  const branches = splitTopLevel(ownerReviewBody, "\n  union all\n");
  const counts = branches.map((branch) => {
    const match = branch.match(/select\s+([\s\S]*?)\n  from /i);
    return match ? splitTopLevel(match[1], ",").length : -1;
  });
  assertCase(
    "owner_review_rows union branches share one schema",
    counts.length === 8 && counts.every((count) => count === counts[0]),
  );
}

function expectedRoleFromGender(gender) {
  if (gender === "male") return "father";
  if (gender === "female") return "mother";
  return null;
}

function roleGenderReview(gender, role) {
  const normalizedGender = gender == null ? null : String(gender).trim().toLowerCase();
  const normalizedRole = role == null ? "unknown" : String(role).trim().toLowerCase();
  if (!["father", "mother"].includes(normalizedRole)) {
    return "ROLE_NOT_GENDER_SPECIFIC";
  }
  if (!normalizedGender || normalizedGender === "unknown") {
    return "GENDER_UNKNOWN";
  }
  if (normalizedGender === "male" && normalizedRole === "mother") {
    return "POTENTIAL_MISMATCH";
  }
  if (normalizedGender === "female" && normalizedRole === "father") {
    return "POTENTIAL_MISMATCH";
  }
  if (["male", "female"].includes(normalizedGender)) {
    return "CONSISTENT";
  }
  return "OWNER_CONFIRMATION_REQUIRED";
}

assertCase(
  "female + father is flagged",
  roleGenderReview("female", "father") === "POTENTIAL_MISMATCH",
);
assertCase(
  "male + mother is flagged",
  roleGenderReview("male", "mother") === "POTENTIAL_MISMATCH",
);
assertCase(
  "male + father passes",
  roleGenderReview("male", "father") === "CONSISTENT" &&
    expectedRoleFromGender("male") === "father",
);
assertCase(
  "female + mother passes",
  roleGenderReview("female", "mother") === "CONSISTENT" &&
    expectedRoleFromGender("female") === "mother",
);
assertCase(
  "unknown gender does not infer",
  roleGenderReview("unknown", "father") === "GENDER_UNKNOWN" &&
    expectedRoleFromGender("unknown") === null,
);
assertCase(
  "generic parent role is not mismatch",
  roleGenderReview("female", "parent") === "ROLE_NOT_GENDER_SPECIFIC",
);
assertCase(
  "owner-confirmed role remains null in SQL contract",
  ownerSql.includes("null::text as owner_confirmed_relationship_role") &&
    !/owner_confirmed_relationship_role\s*=\s*'(father|mother|parent|unknown)'/i.test(ownerSql),
);
assertCase(
  "one-parent and deleted-family cases remain",
  ownerSql.includes("ONE_PARENT_GROUP") &&
    ownerSql.includes("DELETED_FAMILY_ADVISORY") &&
    ownerSql.includes("16ead1f516a885724a2bddd11e14472b"),
);

for (const token of [
  "A17P_FIX3_STATUS=PASS_PARENT_ROLE_GENDER_REVIEW_EVIDENCE_READY",
  "PARENT_GENDER_INCLUDED=YES",
  "ROLE_GENDER_ADVISORY_CREATED=YES",
  "ROLE_GENDER_INTEGRITY_FIELDS_CREATED=YES",
  "AUTOMATIC_ROLE_CORRECTION_PRESENT=NO",
  "OWNER_ROLE_CONFIRMATION_PLACEHOLDERS_NULL=YES",
  "EXPECTED_ROLE_GENDER_MISMATCH_GROUP_COUNT=8",
  "SQL_EXECUTED=NO",
  "DATABASE_MUTATION=NO",
  "RELATIONSHIP_ROLE_CHANGED=NO",
  "RECONCILIATION_EXECUTED=NO",
  "DEPLOY=NO",
  "PUSH=NO",
  "NEXT_ACTION=PUSH_FIX3_AND_RERUN_OWNER_FACING_SELECT_ONLY_QUERY",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of expectedAdvisoryGroups) {
  requireIncludes(doc, token, `expected advisory group ${token}`);
}

for (const token of [
  "PARENT_GENDER=",
  "EXPECTED_ROLE_FROM_GENDER=",
  "ROLE_GENDER_REVIEW_STATUS=",
  "ROLE_GENDER_WARNING=",
  "OWNER_CONFIRMED_RELATIONSHIP_ROLE=",
  "ROLE_GENDER_REVIEW=PASS|OWNER_CONFIRMED|REQUEST_MORE_EVIDENCE|BLOCKED",
]) {
  requireIncludes(template, token, `template token ${token}`);
}

for (const [content, token, label] of [
  [index, "A17P_FIX3_STATUS=PASS_PARENT_ROLE_GENDER_REVIEW_EVIDENCE_READY", "index FIX3"],
  [workLog, "A17P_FIX3_STATUS=PASS_PARENT_ROLE_GENDER_REVIEW_EVIDENCE_READY", "work log FIX3"],
  [decisionLog, "Decision 347 - A-17P-FIX3 adds parent role gender review evidence", "decision FIX3"],
  [handoff, "A17P_FIX3_STATUS=PASS_PARENT_ROLE_GENDER_REVIEW_EVIDENCE_READY", "handoff FIX3"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a17p-fix3-parent-role-gender-review-evidence"] !==
  `node ${checkerPath}`
) {
  failures.push("missing package script check:a17p-fix3-parent-role-gender-review-evidence");
}

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  ownerSqlPath,
  docPath,
  templatePath,
  checkerPath,
  manualApprovalCheckerPath,
  a17pRCheckerPath,
  a17pRPackPath,
  a17pRShaPath,
  "package.json",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "scripts/check-a17p-fix2-owner-facing-legacy-family-review-query.cjs",
  "scripts/check-a17p-legacy-reconciliation-audit-dry-run-owner-review-pack.cjs",
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
  "docs/PLAN_A17Q_TX1_FIX3_OWNER_REVIEW_FINAL_MIGRATION_CANDIDATE.md",
  "scripts/check-a17q-tx1-fix3-owner-review.cjs",
  "scripts/check-a17a-tree-baseline-evidence.cjs",
  "scripts/check-a17e-family-duplicate-read-only-audit.cjs",
  "scripts/check-a17h-canonical-family-schema-foundation-candidate.cjs",
  "scripts/check-a17i-canonical-family-schema-post-apply-verification.cjs",
  "scripts/check-a17m-canonical-family-domain-service.cjs",
  "scripts/check-a17n-admin-parent-child-canonical-write-path.cjs",
  "scripts/check-a17n-dr-deploy-production-no-mutation-smoke-evidence.cjs",
  "scripts/check-a17n-r-admin-parent-child-runtime-integration.cjs",
  "scripts/check-a17n-tx1-admin-canonical-family-transaction-executor-candidate.cjs",
  "scripts/check-a17n-tx2f-post-apply-verifier-active-scope-correction.cjs",
  "scripts/check-a17o-dr-grouped-importer-deploy-no-import-mutation-smoke-evidence.cjs",
  "scripts/check-a17o-importer-canonical-family-grouping.cjs",
  "scripts/check-a17o-tx1-grouped-official-import-transaction-executor-candidate.cjs",
  "scripts/check-a17o-tx1r-grouped-import-executor-manual-apply-verification.cjs",
  "scripts/check-export-import-boundary-design.cjs",
  "scripts/check-export-import-final-readiness.cjs",
]);

for (const file of changedFiles) {
  if (/^(app|components|lib|services)\//.test(file)) {
    failures.push(`runtime file changed during A-17P-FIX3: ${file}`);
  }
  if (/^(db\/migrations|supabase\/migrations)\//.test(file) && !allowedChangedFiles.has(file)) {
    failures.push(`migration changed during A-17P-FIX3: ${file}`);
  }
  if (!allowedChangedFiles.has(file)) {
    failures.push(`unexpected A-17P-FIX3 dirty file: ${file}`);
  }
}

const fix3DocSections = [
  section(doc, "## A-17P-FIX3 Parent Role Gender Review Evidence"),
  template,
  section(workLog, "## 2026-07-13 - A-17P-FIX3"),
  section(decisionLog, "## Decision 347"),
  section(handoff, "## 2026-07-13 - A-17P-FIX3"),
].join("\n");

rejectPattern(
  fix3DocSections,
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|SUPABASE_SERVICE_ROLE_KEY=|eyJ|BEGIN RSA|PRIVATE KEY|access_token|refresh_token/i,
  "production UUID, secret or token-looking content",
);

if (failures.length > 0) {
  console.error("A-17P-FIX3 parent role gender review evidence check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-17P-FIX3 parent role gender review evidence check passed.");
