#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

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

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

function rejectIncludes(content, token, label = token) {
  if (content.includes(token)) failures.push(`forbidden ${label}`);
}

function section(content, heading) {
  const start = content.indexOf(heading);
  if (start < 0) {
    failures.push(`missing section ${heading}`);
    return "";
  }
  const next = content.indexOf("\n## ", start + heading.length);
  return next < 0 ? content.slice(start) : content.slice(start, next);
}

const policyDocPath =
  "docs/PLAN_A17Q_TX3C_VALIDATION_SEPARATION_MANUAL_APPLY.md";
const tx3DocPath = "docs/PLAN_A17Q_TX3_FAMILY_PARENTS_RLS_BOUNDARY.md";
const migrationPath =
  "db/migrations/20260714_0028_a17q_tx3_family_parents_rls_boundary_patch.sql";
const expectedSha =
  "9BBDB8CC9F161EC93A6B2FA97FE0F899C13242A270D2CAB328A95BE8893A23F7";

const policyDoc = read(policyDocPath);
const tx3Doc = read(tx3DocPath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = JSON.parse(read("package.json") || "{}");
const migration = read(migrationPath);

const tx3cSection = section(policyDoc, "## UI Validation Gate");
const browserSection = section(policyDoc, "## Browser Access Gate");
const databaseSection = section(policyDoc, "## Database Mutation Gate");
const evidenceSection = section(policyDoc, "## Evidence Reuse");
const tx3ValidationSection = section(tx3Doc, "## TX3C Validation Separation");

const requiredPolicyTokens = [
  "A17Q_TX3C_VALIDATION_SEPARATION_STATUS=PASS_POLICY_READY",
  "POLICY_SEPARATION_IMPLEMENTED=YES",
  "Starting with A17Q_TX3C, application UI validation, external browser-access\nvalidation, and database mutation validation are independent gates.",
  "database-only phase must not rerun general UI smoke",
  "PHASE_CHANGE_CLASS=DATABASE_SCHEMA+EXTERNAL_ADMIN_ACCESS",
  "FRONTEND_AFFECTING_CHANGE=NO",
  "RUNTIME_APPLICATION_CHANGE=NO",
  "DEPLOYMENT_CHANGE=NO",
  "TARGET_PROJECT_REF=frkyeuxrlcflmsxxsolp",
  `MIGRATION_SHA256=${expectedSha}`,
  "RPC_CALLED=NO",
  "RECONCILIATION_EXECUTED=NO",
  "UNRELATED_SQL_EXECUTED=NO",
];

for (const token of requiredPolicyTokens) {
  requireIncludes(policyDoc, token, `policy token ${token}`);
}

for (const token of [
  "UI_VALIDATION_REQUIRED=NO",
  "UI_VALIDATION_REASON=database-only migration apply; no frontend-affecting change",
  "UI_VALIDATION_EVIDENCE_REUSED=NO",
  "UI_SMOKE_EXECUTED=NO",
  "APPLICATION_UI_TESTED=NO",
]) {
  requireIncludes(tx3cSection, token, `TX3C UI gate ${token}`);
}
rejectIncludes(tx3cSection, "UI_SMOKE_EXECUTED=YES", "TX3C UI smoke required");
rejectIncludes(tx3cSection, "UI_VALIDATION_REQUIRED=YES", "TX3C UI validation required");

for (const token of [
  "BROWSER_ACCESS_REQUIRED=YES",
  "BROWSER_ACCESS_STATUS=PENDING_VISIBLE_SUPABASE_PROJECT_REF",
  "VISIBLE_EXTERNAL_TARGET_VERIFIED=PENDING",
  "VISIBLE_PROJECT_REF_VERIFIED=REQUIRED",
  "SQL_EDITOR_PROJECT_VERIFIED=REQUIRED",
  "APPLICATION_UI_TESTED=NO",
]) {
  requireIncludes(browserSection, token, `browser access gate ${token}`);
}
requireIncludes(policyDoc, "Chrome use for Supabase SQL Editor access is not application UI testing.", "Chrome is external admin access");

for (const token of [
  "DATABASE_MUTATION_AUTHORIZED=OWNER_AUTHORIZED_AFTER_TARGET_AND_CHECKSUM_VERIFIED",
  "DATABASE_TARGET_VERIFIED=REQUIRED",
  "MIGRATION_IDENTITY_VERIFIED=REQUIRED",
  `MIGRATION_SHA256=${expectedSha}`,
  "MIGRATION_EXECUTED=PENDING",
  "POST_APPLY_DATABASE_VERIFICATION=PENDING",
]) {
  requireIncludes(databaseSection, token, `database gate ${token}`);
}

for (const token of [
  "EVIDENCE_REUSE_ALLOWED=YES",
  "REUSED_EVIDENCE=A17Q_TX3C_PRECHECK_STATUS=PASS",
  "ORIGIN_MAIN_CONTAINS_9D1CF0A=YES",
  "REMOTE_SYNC=0/0",
  "WORKTREE_CLEAN=YES",
  "TARGET_PROJECT_REF=frkyeuxrlcflmsxxsolp",
  `MIGRATION_SHA256=${expectedSha}`,
  "EVIDENCE_INVALIDATION_REASON=NONE",
]) {
  requireIncludes(evidenceSection, token, `evidence reuse ${token}`);
}

for (const token of [
  "PHASE_CHANGE_CLASS=DATABASE_SCHEMA+EXTERNAL_ADMIN_ACCESS",
  "UI_VALIDATION_REQUIRED=NO",
  "UI_SMOKE_EXECUTED=NO",
  "APPLICATION_UI_TESTED=NO",
  "BROWSER_ACCESS_REQUIRED=YES",
  "DATABASE_TARGET_VERIFIED=REQUIRED",
  "MIGRATION_IDENTITY_VERIFIED=REQUIRED",
  `MIGRATION_SHA256=${expectedSha}`,
  "EVIDENCE_REUSE_ALLOWED=YES",
  "RPC_CALLED=NO",
  "RECONCILIATION_EXECUTED=NO",
]) {
  requireIncludes(tx3ValidationSection, token, `TX3 doc validation token ${token}`);
}

requireIncludes(index, "PLAN_A17Q_TX3C_VALIDATION_SEPARATION_MANUAL_APPLY.md", "index entry");
requireIncludes(workLog, "A17Q_TX3C_VALIDATION_SEPARATION_STATUS=PASS_POLICY_READY", "work log status");
requireIncludes(decisionLog, "Starting with A17Q_TX3C", "decision log durable policy");
requireIncludes(handoff, "A17Q_TX3C_VALIDATION_SEPARATION_STATUS=PASS_POLICY_READY", "handoff status");
requireIncludes(handoff, "UI_VALIDATION_REQUIRED=NO", "handoff UI gate");
requireIncludes(handoff, "BROWSER_ACCESS_REQUIRED=YES", "handoff browser gate");

if (
  packageJson.scripts?.["check:a17q-tx3c-validation-separation"] !==
  "node scripts/check-a17q-tx3c-validation-separation.cjs"
) {
  failures.push("package script missing for TX3C validation separation checker");
}

requireIncludes(migration, "security definer", "approved 0028 migration remains present");
requireIncludes(migration, "owner to postgres", "approved 0028 owner statement remains present");
rejectIncludes(policyDoc, "Run public/admin Gia Pha UI smoke", "unrelated UI smoke instruction");

if (failures.length) {
  console.error("A17Q TX3C validation separation check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A17Q_TX3C_VALIDATION_SEPARATION_STATUS=PASS_POLICY_READY");
console.log("POLICY_SEPARATION_IMPLEMENTED=YES");
console.log("PHASE_CHANGE_CLASS=DATABASE_SCHEMA+EXTERNAL_ADMIN_ACCESS");
console.log("UI_VALIDATION_REQUIRED=NO");
console.log("UI_SMOKE_EXECUTED=NO");
console.log("BROWSER_ACCESS_REQUIRED=YES");
console.log("DATABASE_TARGET_VERIFIED=REQUIRED");
console.log("MIGRATION_IDENTITY_VERIFIED=REQUIRED");
console.log(`MIGRATION_SHA256=${expectedSha}`);
console.log("EVIDENCE_REUSE_ALLOWED=YES");
console.log("RPC_CALLED=NO");
console.log("RECONCILIATION_EXECUTED=NO");
