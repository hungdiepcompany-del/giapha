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

function stripSqlComments(sql) {
  return sql.replace(/\/\*[\s\S]*?\*\//g, "").replace(/--.*$/gm, "");
}

const doc = read("docs/PLAN_A17F_FAMILY_RECONCILIATION_DRY_RUN.md");
const sql = read("db/checks/20260712_check_a17f_family_reconciliation_dry_run.sql");
const sqlWithoutComments = stripSqlComments(sql);
const summary = read("docs/PLAN_A17EG_FAMILY_RECONCILIATION_AUDIT_DRY_RUN_BUNDLE.md");
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = readJson("package.json");

for (const token of [
  "A17F_STATUS=PASS_READ_ONLY_RECONCILIATION_DRY_RUN_READY_FOR_OWNER_REVIEW",
  "A17F_SQL=db/checks/20260712_check_a17f_family_reconciliation_dry_run.sql",
  "A17F_CANONICAL_SELECTION_RANDOM=NO",
  "expected_family_count_before",
  "expected_family_count_after",
  "expected_family_records_merged",
  "expected_parent_rows_after",
  "expected_child_rows_after",
  "expected_couple_links_updated",
  "expected_layout_references_updated",
  "PEOPLE_PRESERVATION_INVARIANT=PASS",
  "PARENT_SEMANTICS_PRESERVATION_INVARIANT=PASS",
  "CHILD_SEMANTICS_PRESERVATION_INVARIANT=PASS",
  "COUPLE_SEMANTICS_PRESERVATION_INVARIANT=PASS",
  "CONNECTED_COMPONENT_PRESERVATION_INVARIANT=PASS",
  "A17F_PRODUCTION_RECONCILIATION_ALLOWED=NO",
]) {
  requireIncludes(doc, token, `A17F doc token ${token}`);
}

for (const token of [
  "A17F_FAMILY_RECONCILIATION_DRY_RUN",
  "SELECT_ONLY_DETERMINISTIC_DRY_RUN",
  "NO_PII_OUTPUT",
  "canonical_selection as",
  "dry_run_groups as",
  "expected_family_count_after",
  "people_preservation_invariant",
  "parent_semantics_preservation_invariant",
  "child_semantics_preservation_invariant",
  "couple_semantics_preservation_invariant",
  "connected_component_preservation_invariant",
  "proposed_canonical_family_id_hash",
]) {
  requireIncludes(sql, token, `A17F SQL token ${token}`);
}

rejectPattern(sqlWithoutComments, /^\s*(insert|update|delete|alter|create|drop|grant|revoke|truncate|call)\b/im, "A17F SQL must stay SELECT-only");
rejectPattern(sqlWithoutComments, /\ba16p_tx_execute_giapha4_official_import\s*\(/i, "A17F SQL must not call official import RPC");
rejectPattern(sqlWithoutComments, /\bfor\s+update\b/i, "A17F SQL must not lock rows");

for (const [content, token, label] of [
  [index, "PLAN_A17F_FAMILY_RECONCILIATION_DRY_RUN.md", "index A17F entry"],
  [workLog, "A17F_STATUS=PASS_READ_ONLY_RECONCILIATION_DRY_RUN_READY_FOR_OWNER_REVIEW", "work log A17F status"],
  [decisionLog, "Decision 329 - A-17E to A-17G family reconciliation remains read-only and blocked", "decision A17EG entry"],
  [handoff, "A17F_STATUS=PASS_READ_ONLY_RECONCILIATION_DRY_RUN_READY_FOR_OWNER_REVIEW", "handoff A17F status"],
  [summary, "EXPECTED_FAMILY_COUNT_AFTER=36", "summary dry-run family count"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a17f-family-reconciliation-dry-run"] !==
  "node scripts/check-a17f-family-reconciliation-dry-run.cjs"
) {
  failures.push("missing package script check:a17f-family-reconciliation-dry-run");
}

rejectPattern(doc + sql + summary, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");
rejectPattern(doc + summary, /MIGRATION_APPLIED=YES|GENEALOGY_ROWS_MODIFIED=YES|RECONCILIATION_EXECUTED=YES|IMPORT_RPC_CALLED=YES|DEPLOY=YES|PUSH=YES/i, "closed safety boundary drift");

if (failures.length > 0) {
  console.error("A-17F family reconciliation dry-run check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-17F family reconciliation dry-run check passed.");
