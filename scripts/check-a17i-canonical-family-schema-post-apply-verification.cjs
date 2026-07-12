#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const migrationPath =
  "db/migrations/20260712_0023_a17h_canonical_family_schema_foundation_candidate.sql";
const mirrorPath =
  "supabase/migrations/20260712_0023_a17h_canonical_family_schema_foundation_candidate.sql";
const verifierSqlPath =
  "db/checks/20260712_check_a17i_canonical_family_schema_post_apply.sql";
const applyDocPath = "docs/PLAN_A17SQL_H_OWNER_MANUAL_SCHEMA_APPLY.md";
const verificationDocPath =
  "docs/PLAN_A17I_CANONICAL_FAMILY_SCHEMA_POST_APPLY_VERIFICATION.md";
const checkerPath =
  "scripts/check-a17i-canonical-family-schema-post-apply-verification.cjs";
const expectedSha =
  "B5E62D048F284D9E4F03E2294FE060E696E7905890D88587A18503E0786A07AA";

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function readBuffer(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return Buffer.from("");
  }
  return fs.readFileSync(absolutePath);
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

function sha256Hex(relativePath) {
  return crypto
    .createHash("sha256")
    .update(readBuffer(relativePath))
    .digest("hex")
    .toUpperCase();
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

const migration = read(migrationPath);
const mirror = read(mirrorPath);
const verifierSql = read(verifierSqlPath);
const applyDoc = read(applyDocPath);
const verificationDoc = read(verificationDocPath);
const docs = `${applyDoc}\n${verificationDoc}`;
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = readJson("package.json");

if (migration !== mirror) failures.push("migration 0023 db/supabase mirrors differ");
if (sha256Hex(migrationPath) !== expectedSha) failures.push("db migration 0023 SHA drifted");
if (sha256Hex(mirrorPath) !== expectedSha) failures.push("supabase migration 0023 SHA drifted");

for (const token of [
  "A17SQL_H_STATUS=PASS_OWNER_MANUAL_SCHEMA_APPLY_COMPLETED",
  "MIGRATION_APPLY_EVIDENCE_RECORDED=YES",
  `MIGRATION_FILE=${migrationPath}`,
  `MIGRATION_SHA256=${expectedSha}`,
  "OWNER_MANUAL_APPLY_COMPLETED=YES",
  "MIGRATION_RERUN=NO",
]) {
  requireIncludes(applyDoc, token, `apply doc token ${token}`);
}

for (const token of [
  "A17I_STATUS=PASS_SCHEMA_POST_APPLY_VERIFIED",
  "POST_APPLY_VERIFICATION_RECORDED=YES",
  "EXISTING_FAMILY_COUNT_BEFORE=74",
  "EXISTING_FAMILY_COUNT_AFTER=74",
  "EXPECTED_COLUMNS_PRESENT=YES",
  "EXPECTED_CONSTRAINTS_PRESENT=YES",
  "CANONICAL_LOOKUP_INDEX_PRESENT=YES",
  "UNIQUE_INDEX_LEGACY_SAFE=YES",
  "NEW_TABLES_RLS_ENABLED=YES",
  "NEW_TABLES_RLS_ENABLED_COUNT=3",
  "ANON_GRANT_COUNT=0",
  "PUBLIC_GRANT_COUNT=0",
  "ANON_GRANTS_PRESENT=NO",
  "PUBLIC_GRANTS_PRESENT=NO",
  "ANON_POLICY_COUNT=0",
  "PUBLIC_POLICY_COUNT=0",
  "AUTHENTICATED_POLICY_COUNT=9",
  "ANON_POLICIES_PRESENT=NO",
  "PUBLIC_POLICIES_PRESENT=NO",
  "OWNER_DECISION_ROW_COUNT=0",
  "RECONCILIATION_BATCH_ROW_COUNT=0",
  "ROLLBACK_MANIFEST_ROW_COUNT=0",
  "CANONICAL_KEY_BACKFILL_COUNT=0",
  "MERGED_OR_VOIDED_LEGACY_FAMILY_COUNT=0",
  "SAFE_AUTOMATIC_GROUP_COUNT=0",
  "OWNER_REVIEW_GROUP_COUNT=22",
  "REDUNDANT_FAMILY_COUNT=38",
  "INVALID_PERSON_REFERENCE_COUNT=2",
  "INACTIVE_OR_SOFT_DELETED_MEMBERSHIP_COUNT=1",
  "LAYOUT_REFERENCES_AFFECTED_COUNT=3",
  "PRODUCTION_RECONCILIATION_REMAINS_BLOCKED=YES",
  "START_SEPARATE_A17M_CANONICAL_FAMILY_DOMAIN_SERVICE_PHASE",
]) {
  requireIncludes(verificationDoc, token, `verification doc token ${token}`);
}

for (const token of [
  "a17h_expected_columns_present",
  "a17h_expected_constraints_present",
  "a17h_canonical_lookup_index_present",
  "a17h_unique_index_legacy_safe",
  "a17h_new_tables_rls_enabled",
  "a17h_no_anon_or_public_policies",
  "a17h_no_anon_or_public_grants",
  "a17h_existing_family_count_unchanged",
  "a17h_no_canonical_key_backfill",
  "a17h_no_batch_decision_or_manifest_seeded",
]) {
  requireIncludes(verifierSql, token, `verifier SQL token ${token}`);
}

for (const token of [
  "SQL_EXECUTED=NO",
  "SQL_MUTATION_EXECUTED=NO",
  "GENEALOGY_ROWS_MODIFIED=NO",
  "RECONCILIATION_EXECUTED=NO",
  "IMPORT_RPC_CALLED=NO",
  "DEPLOY=NO",
  "PUSH=NO",
]) {
  requireIncludes(docs, token, `safety token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A17SQL_H_OWNER_MANUAL_SCHEMA_APPLY.md", "index A17SQL-H entry"],
  [index, "PLAN_A17I_CANONICAL_FAMILY_SCHEMA_POST_APPLY_VERIFICATION.md", "index A17I entry"],
  [workLog, "A17SQL_H_STATUS=PASS_OWNER_MANUAL_SCHEMA_APPLY_COMPLETED", "work log A17SQL-H"],
  [workLog, "A17I_STATUS=PASS_SCHEMA_POST_APPLY_VERIFIED", "work log A17I"],
  [decisionLog, "Decision 331 - A-17I records owner manual apply and post-apply verification", "decision A17I"],
  [handoff, "A17I_STATUS=PASS_SCHEMA_POST_APPLY_VERIFIED", "handoff A17I"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a17i-canonical-family-schema-post-apply-verification"] !==
  "node scripts/check-a17i-canonical-family-schema-post-apply-verification.cjs"
) {
  failures.push("missing package script check:a17i-canonical-family-schema-post-apply-verification");
}

rejectPattern(docs, /GENEALOGY_ROWS_MODIFIED=YES|RECONCILIATION_EXECUTED=YES|IMPORT_RPC_CALLED=YES|DEPLOY=YES|PUSH=YES/i, "closed safety boundary drift");
rejectPattern(docs, /OWNER_DECISION_ROWS_CREATED=[1-9]|RECONCILIATION_BATCH_ROWS_CREATED=[1-9]|ROLLBACK_MANIFEST_ROWS_CREATED=[1-9]/i, "seeded reconciliation rows");
rejectPattern(docs, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  applyDocPath,
  verificationDocPath,
  checkerPath,
  "package.json",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "scripts/check-a17a-tree-baseline-evidence.cjs",
  "scripts/check-a17e-family-duplicate-read-only-audit.cjs",
  "scripts/check-a17h-canonical-family-schema-foundation-candidate.cjs",
]);

for (const changedFile of changedFiles) {
  if (changedFile.startsWith("db/migrations/") || changedFile.startsWith("supabase/migrations/")) {
    failures.push(`migration changed during A-17I docs-only phase: ${changedFile}`);
  }

  if (!allowedChangedFiles.has(changedFile)) {
    failures.push(`unexpected A-17I dirty file: ${changedFile}`);
  }
}

if (failures.length > 0) {
  console.error("A-17I canonical family schema post-apply verification check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-17I canonical family schema post-apply verification check passed.");
