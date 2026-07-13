#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath =
  "docs/PLAN_A17P_LEGACY_RECONCILIATION_AUDIT_DRY_RUN_OWNER_REVIEW_PACK.md";
const checkerPath = "scripts/check-a17p-manual-owner-approval-evidence.cjs";
const a17pRCheckerPath = "scripts/check-a17p-r-immutable-owner-decision-pack.cjs";
const a17pRPackPath = "docs/evidence/A17P_OWNER_DECISION_PACK.json";
const a17pRShaPath = "docs/evidence/A17P_OWNER_DECISION_PACK.sha256";

const approvedRoleGroups = [
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

function section(content, startToken, nextHeading = "\n## ") {
  const start = content.indexOf(startToken);
  if (start === -1) return "";
  const rest = content.slice(start);
  const next = rest.indexOf(nextHeading, 1);
  return next === -1 ? rest : rest.slice(0, next);
}

const doc = read(docPath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = readJson("package.json");

const originForFix3 = git(["branch", "-r", "--contains", "19c6cb0"]);
if (!originForFix3.includes("origin/main")) {
  failures.push("origin/main does not contain 19c6cb0");
}

for (const token of [
  "A17P_MANUAL_APPROVAL_STATUS=PASS_OWNER_APPROVED_21_GROUP_RECONCILIATION_RECORDED",
  "OWNER_APPROVAL=A17P_MANUAL_21_GROUP_RECONCILIATION_APPROVED",
  "VERIFIED_SOURCE=A17P_FIX3_OWNER_FACING_PRODUCTION_RESULT",
  "TOTAL_REVIEWED_GROUP_COUNT=22",
  "APPROVED_EXECUTION_GROUP_COUNT=21",
  "EXCLUDED_GROUP_COUNT=1",
  "BLOCKED_DATA_CONFLICT_COUNT=0",
  "REQUEST_MORE_EVIDENCE_COUNT=0",
  "EXCLUDED_GROUP_REF=721e2ae3d95dd418af40b6459531b870",
  "EXCLUDED_GROUP_REASON=PENDING_ONE_PARENT_AND_DELETED_FAMILY_CONTEXT_RECONCILIATION",
  "DELETED_FAMILY_REF=16ead1f516a885724a2bddd11e14472b",
  "DELETED_FAMILY_DECISION=SEPARATE_RECONCILIATION_REQUIRED",
  "OWNER_APPROVES_EQUIVALENT_CANDIDATE_POLICY=YES",
  "SURVIVOR_POLICY=FAMILY_REVIEW_ORDER_1_FOR_EACH_OF_THE_21_APPROVED_GROUPS",
  "SURVIVOR_POLICY_REASON=STRUCTURALLY_EQUIVALENT_CANDIDATES_WITH_NO_LAYOUT_OR_DOMAIN_CONFLICT",
  "AUTOMATIC_SURVIVOR_SELECTION=NO",
  "OWNER_EXPLICITLY_SELECTED_POLICY=YES",
  "OWNER_CONFIRMS_ROLE_CORRECTION_GROUP_COUNT=8",
  "EXPECTED_APPROVED_CANDIDATE_FAMILY_COUNT=57",
  "EXPECTED_APPROVED_SURVIVOR_COUNT=21",
  "EXPECTED_VOID_FAMILY_COUNT=36",
  "EXPECTED_PARENT_MEMBERSHIPS_NORMALIZED=72",
  "EXPECTED_CHILD_MEMBERSHIPS_PRESERVED=57",
  "EXPECTED_CHILD_MEMBERSHIPS_LOST=0",
  "DECISION_PACK_FINALIZED=NO",
  "DECISION_PACK_HASH_CREATED=NO",
  "RECONCILIATION_EXECUTED=NO",
  "DATABASE_MUTATION=NO",
  "RELATIONSHIP_ROLE_CHANGED=NO",
  "SQL_EXECUTED=NO",
  "RPC_CALLED=NO",
  "DEPLOY=NO",
  "PUSH=NO",
  "NEXT_ACTION=A17P_R_FINALIZE_IMMUTABLE_OWNER_DECISION_PACK",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of approvedRoleGroups) {
  requireIncludes(doc, token, `approved role group ${token}`);
}

for (const [content, token, label] of [
  [
    index,
    "A17P_MANUAL_APPROVAL_STATUS=PASS_OWNER_APPROVED_21_GROUP_RECONCILIATION_RECORDED",
    "index owner approval",
  ],
  [
    workLog,
    "A17P_MANUAL_APPROVAL_STATUS=PASS_OWNER_APPROVED_21_GROUP_RECONCILIATION_RECORDED",
    "work log owner approval",
  ],
  [
    decisionLog,
    "Decision 348 - A-17P manual owner approval recorded for 21 groups",
    "decision owner approval",
  ],
  [
    handoff,
    "A17P_MANUAL_APPROVAL_STATUS=PASS_OWNER_APPROVED_21_GROUP_RECONCILIATION_RECORDED",
    "handoff owner approval",
  ],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a17p-manual-owner-approval-evidence"] !==
  `node ${checkerPath}`
) {
  failures.push("missing package script check:a17p-manual-owner-approval-evidence");
}

const ownerApprovalSections = [
  section(doc, "## A-17P Manual Owner Approval Evidence"),
  section(workLog, "## 2026-07-13 - A-17P manual owner approval evidence"),
  section(decisionLog, "## Decision 348"),
  section(handoff, "## 2026-07-13 - A-17P manual owner approval evidence"),
].join("\n");

rejectPattern(
  ownerApprovalSections,
  /Nguyễn|Phạm|Trần|Đỗ|Đào|bà Chạy|Hoàng|Minh|Văn|Thị|Hữu|Quang|PRIVATE KEY|access_token|refresh_token|SUPABASE_SERVICE_ROLE_KEY=|eyJ/i,
  "production name, secret or token-looking content",
);

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  checkerPath,
  a17pRCheckerPath,
  a17pRPackPath,
  a17pRShaPath,
  "package.json",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "docs/templates/A17P_LEGACY_RECONCILIATION_OWNER_REVIEW_PACK_TEMPLATE.md",
  "scripts/check-a17p-fix2-owner-facing-legacy-family-review-query.cjs",
  "scripts/check-a17p-fix3-parent-role-gender-review-evidence.cjs",
  "scripts/check-a17p-legacy-reconciliation-audit-dry-run-owner-review-pack.cjs",
  "db/checks/20260713_check_a17q_tx1_legacy_family_reconciliation_executor_candidate.sql",
  "db/migrations/20260713_0026_a17q_tx1_legacy_family_reconciliation_transaction_executor_candidate.sql",
  "supabase/migrations/20260713_0026_a17q_tx1_legacy_family_reconciliation_transaction_executor_candidate.sql",
  "docs/PLAN_A17Q_TX1_LEGACY_FAMILY_RECONCILIATION_TRANSACTION_EXECUTOR_CANDIDATE.md",
  "scripts/check-a17q-tx1-legacy-family-reconciliation-transaction-executor-candidate.cjs",
  "scripts/check-a17q-tx1-fix1-hardened-reconciliation-executor.cjs",
  "docs/PLAN_A17Q_TX1_FIX1_OWNER_REVIEW_HARDENED_RECONCILIATION_EXECUTOR_CANDIDATE.md",
  "scripts/check-a17q-tx1-fix1-owner-review.cjs",
  "scripts/check-export-import-boundary-design.cjs",
  "scripts/check-export-import-final-readiness.cjs",
]);

for (const file of changedFiles) {
  if (/^(app|components|lib|services)\//.test(file)) {
    failures.push(`runtime file changed during A-17P manual approval record: ${file}`);
  }
  if (/^(db\/migrations|supabase\/migrations)\//.test(file) && !allowedChangedFiles.has(file)) {
    failures.push(`migration changed during A-17P manual approval record: ${file}`);
  }
  if (!allowedChangedFiles.has(file)) {
    failures.push(`unexpected A-17P manual approval dirty file: ${file}`);
  }
}

if (failures.length > 0) {
  console.error("A-17P manual owner approval evidence check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-17P manual owner approval evidence check passed.");
