#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const failures = [];

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

const doc = read("docs/PLAN_A17B_CANONICAL_FAMILY_UNIT_DESIGN.md");
const summary = read("docs/PLAN_A17AD_TREE_ARCHITECTURE_FOUNDATION_BUNDLE.md");
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = readJson("package.json");

for (const token of [
  "A17B_STATUS=CANONICAL_FAMILY_DESIGN_READY_FOR_OWNER_REVIEW",
  "A17B_CANONICAL_IDENTITY_NOT_CHILD_KEYED=YES",
  "A17B_SORTED_PARENT_IDS_SUFFICIENT_FOR_ALL_CASES=NO",
  "A17B_OWNER_REVIEW_REQUIRED_FOR_AMBIGUOUS_UNIONS=YES",
  "A17B_SCHEMA_CHANGE_REQUIRED_NOW=NO",
  "normalizedActiveParentIds",
  "unionIdentity",
  "relationshipPeriod",
  "familyStatus",
  "sourceProvenance",
  "legacyException",
  "normalizeParentSet",
  "buildCanonicalFamilyIdentity",
  "findCanonicalFamily",
  "findOrCreateCanonicalFamily",
  "attachParentToCanonicalFamily",
  "attachChildToCanonicalFamily",
  "attachCoupleMetadata",
  "classifyFamilyMergeSafety",
  "previewFamilyReconciliation",
  "buildFamilyRollbackManifest",
  "SAFE_AUTOMATIC_CANDIDATE",
  "OWNER_REVIEW_REQUIRED",
  "BLOCKED_AMBIGUOUS",
  "NOT_A_DUPLICATE",
]) {
  requireIncludes(doc, token, `A17B doc token ${token}`);
}

for (let caseNumber = 1; caseNumber <= 20; caseNumber += 1) {
  requireIncludes(doc, `${caseNumber}.`, `A17B case ${caseNumber}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A17B_CANONICAL_FAMILY_UNIT_DESIGN.md", "index A17B entry"],
  [workLog, "A17B_STATUS=CANONICAL_FAMILY_DESIGN_READY_FOR_OWNER_REVIEW", "work log A17B status"],
  [decisionLog, "Decision 328 - A-17 canonical family tree foundation accepted for owner review", "decision A17 entry"],
  [handoff, "A17B_STATUS=CANONICAL_FAMILY_DESIGN_READY_FOR_OWNER_REVIEW", "handoff A17B status"],
  [summary, "A17B_STATUS=CANONICAL_FAMILY_DESIGN_READY_FOR_OWNER_REVIEW", "summary A17B status"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a17b-canonical-family-unit-design"] !==
  "node scripts/check-a17b-canonical-family-unit-design.cjs"
) {
  failures.push("missing package script check:a17b-canonical-family-unit-design");
}

rejectPattern(
  doc + summary,
  /MIGRATION_APPLIED=YES|RECONCILIATION_EXECUTED=YES|IMPORT_RPC_CALLED=YES|OFFICIAL_IMPORT_RETRY=YES|DEPLOY=YES|PUSH=YES/i,
  "closed safety boundary drift",
);
rejectPattern(
  doc + summary,
  /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i,
  "secret-like token",
);

if (failures.length > 0) {
  console.error("A-17B canonical family unit design check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-17B canonical family unit design check passed.");
