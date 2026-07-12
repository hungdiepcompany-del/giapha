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

const doc = read("docs/PLAN_A17D_CANONICAL_TREE_GRAPH_CONTRACT.md");
const summary = read("docs/PLAN_A17AD_TREE_ARCHITECTURE_FOUNDATION_BUNDLE.md");
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = readJson("package.json");

for (const token of [
  "A17D_STATUS=CANONICAL_GRAPH_CONTRACT_READY_FOR_OWNER_REVIEW",
  "TreePersonNode",
  "TreeFamilyUnit",
  "TreeGraphEdge",
  "TreeGraphContext",
  "A17D_PERSON_NODE_PRIMARY=YES",
  "A17D_FAMILY_UNIT_NODE_COMPACT=YES",
  "A17D_COUPLE_DUPLICATION_SUPPRESSED_WHEN_FAMILY_UNIT_EXISTS=YES",
  "A17D_TECHNICAL_ENUM_LABELS_INTERNAL_ONLY=YES",
  "A17D_CONNECTED_COMPONENTS_EXPLICIT=YES",
  "A17D_PUBLIC_PRIVACY_SANITIZATION_REQUIRED_BEFORE_GRAPH=YES",
  "A17D_LAYOUT_PRIORITY_DEFINED=YES",
  "A17D_NO_PII_DIAGNOSTICS=YES",
  "parent_to_family",
  "family_to_child",
  "spouse_union",
  "derived_couple_hidden",
  "locked_saved",
  "generated",
  "fallback",
  "LAYOUT_FALLBACK_USED",
  "CANONICAL_FAMILY_AMBIGUOUS",
]) {
  requireIncludes(doc, token, `A17D doc token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A17D_CANONICAL_TREE_GRAPH_CONTRACT.md", "index A17D entry"],
  [workLog, "A17D_STATUS=CANONICAL_GRAPH_CONTRACT_READY_FOR_OWNER_REVIEW", "work log A17D status"],
  [decisionLog, "Decision 328 - A-17 canonical family tree foundation accepted for owner review", "decision A17 entry"],
  [handoff, "A17D_STATUS=CANONICAL_GRAPH_CONTRACT_READY_FOR_OWNER_REVIEW", "handoff A17D status"],
  [summary, "A17D_STATUS=CANONICAL_GRAPH_CONTRACT_READY_FOR_OWNER_REVIEW", "summary A17D status"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a17d-canonical-tree-graph-contract"] !==
  "node scripts/check-a17d-canonical-tree-graph-contract.cjs"
) {
  failures.push("missing package script check:a17d-canonical-tree-graph-contract");
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
  console.error("A-17D canonical tree graph contract check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-17D canonical tree graph contract check passed.");
