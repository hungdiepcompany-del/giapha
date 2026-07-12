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

const doc = read("docs/PLAN_A17G_FAMILY_RECONCILIATION_ROLLBACK_DESIGN.md");
const summary = read("docs/PLAN_A17EG_FAMILY_RECONCILIATION_AUDIT_DRY_RUN_BUNDLE.md");
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = readJson("package.json");

for (const token of [
  "A17G_STATUS=ROLLBACK_CONTRACT_READY_FOR_OWNER_REVIEW",
  "ROLLBACK_MANIFEST_CONTRACT_DEFINED=YES",
  "ROLLBACK_RESTORE_ORDER_DEFINED=YES",
  "POST_RECONCILIATION_EDIT_CONFLICT_DEFINED=YES",
  "BACKUP_EVIDENCE_REQUIREMENTS_DEFINED=YES",
  "ROLLBACK_STILL_SAFE",
  "ROLLBACK_REQUIRES_OWNER_REVIEW",
  "ROLLBACK_BLOCKED_LATER_EDITS_WOULD_BE_LOST",
  "database backup",
  "JSON export",
  "GEDCOM or equivalent export",
  "ZIP export",
  "SHA256 hashes",
  "ANON_OR_PUBLIC_EXECUTION_ALLOWED=NO",
  "SECURITY_DEFINER_ALLOWED_WITHOUT_SEPARATE_OWNER_APPROVAL=NO",
]) {
  requireIncludes(doc, token, `A17G doc token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A17G_FAMILY_RECONCILIATION_ROLLBACK_DESIGN.md", "index A17G entry"],
  [workLog, "A17G_STATUS=ROLLBACK_CONTRACT_READY_FOR_OWNER_REVIEW", "work log A17G status"],
  [decisionLog, "Decision 329 - A-17E to A-17G family reconciliation remains read-only and blocked", "decision A17EG entry"],
  [handoff, "A17G_STATUS=ROLLBACK_CONTRACT_READY_FOR_OWNER_REVIEW", "handoff A17G status"],
  [summary, "ROLLBACK_MANIFEST_CONTRACT_DEFINED=YES", "summary rollback manifest"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a17g-family-reconciliation-rollback-design"] !==
  "node scripts/check-a17g-family-reconciliation-rollback-design.cjs"
) {
  failures.push("missing package script check:a17g-family-reconciliation-rollback-design");
}

rejectPattern(doc + summary, /MIGRATION_APPLIED=YES|GENEALOGY_ROWS_MODIFIED=YES|RECONCILIATION_EXECUTED=YES|IMPORT_RPC_CALLED=YES|DEPLOY=YES|PUSH=YES/i, "closed safety boundary drift");
rejectPattern(doc + summary, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");

if (failures.length > 0) {
  console.error("A-17G family reconciliation rollback design check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-17G family reconciliation rollback design check passed.");
