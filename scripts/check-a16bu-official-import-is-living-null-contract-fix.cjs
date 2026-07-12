#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const migration0016DbPath =
  "db/migrations/20260703_0016_a16v_official_import_real_transaction_execution_branch_candidate.sql";
const migration0016SupabasePath =
  "supabase/migrations/20260703_0016_a16v_official_import_real_transaction_execution_branch_candidate.sql";
const dbMigrationPath =
  "db/migrations/20260712_0022_a16bu_official_import_is_living_null_contract_fix.sql";
const supabaseMigrationPath =
  "supabase/migrations/20260712_0022_a16bu_official_import_is_living_null_contract_fix.sql";
const checkerPath =
  "scripts/check-a16bu-official-import-is-living-null-contract-fix.cjs";
const planPath =
  "docs/PLAN_A16BU_OFFICIAL_IMPORT_IS_LIVING_NULL_CONTRACT_FIX.md";

const expected0016Sha =
  "68B98F59F575CADA6A0AB3AA0ACB856ED78984A5320A4DD784DB97E0D2317903";

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

function normalizeForSignature(content) {
  return content
    .match(
      /create or replace function public\.a16p_tx_execute_giapha4_official_import\([\s\S]*?\)\s*returns jsonb\s*language plpgsql\s*security invoker\s*set search_path = public, pg_temp/i,
    )?.[0]
    .replace(/\s+/g, " ")
    .trim();
}

function inferIsLiving(candidate) {
  const raw = candidate.isLiving == null ? "" : String(candidate.isLiving);
  const normalized = raw.trim().toLowerCase();
  if (normalized === "true" || normalized === "false") {
    return normalized === "true";
  }
  const deathDateText =
    candidate.deathDateText == null ? "" : String(candidate.deathDateText);
  return deathDateText.trim() === "";
}

const migration0016Db = read(migration0016DbPath);
const migration0016Supabase = read(migration0016SupabasePath);
const dbMigration = read(dbMigrationPath);
const supabaseMigration = read(supabaseMigrationPath);
const plan = read(planPath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = readJson("package.json");

if (sha256Hex(migration0016DbPath) !== expected0016Sha) {
  failures.push("db migration 0016 immutable SHA changed");
}
if (sha256Hex(migration0016SupabasePath) !== expected0016Sha) {
  failures.push("supabase migration 0016 immutable SHA changed");
}
if (migration0016Db !== migration0016Supabase) {
  failures.push("migration 0016 db/supabase mirrors differ");
}
if (dbMigration !== supabaseMigration) {
  failures.push("migration 0022 db/supabase mirrors differ");
}

const signature0016 = normalizeForSignature(migration0016Db);
const signature0022 = normalizeForSignature(dbMigration);
if (!signature0016 || !signature0022 || signature0016 !== signature0022) {
  failures.push("function signature/security/search_path drifted from 0016");
}

for (const token of [
  "A16BU_OFFICIAL_IMPORT_IS_LIVING_NULL_CONTRACT_FIX",
  "create or replace function public.a16p_tx_execute_giapha4_official_import",
  "returns jsonb",
  "language plpgsql",
  "security invoker",
  "set search_path = public, pg_temp",
  "lower(btrim(coalesce(candidate ->> 'isLiving', ''))) in ('true', 'false')",
  "then lower(btrim(candidate ->> 'isLiving'))::boolean",
  "else nullif(btrim(coalesce(candidate ->> 'deathDateText', '')), '') is null",
  "end as is_living",
  "revoke execute on function public.a16p_tx_execute_giapha4_official_import",
  ") from anon;",
  ") from public;",
]) {
  requireIncludes(dbMigration, token, `migration 0022 token ${token}`);
}

for (const token of [
  "if not public.has_permission('imports.create')",
  "if not public.has_permission('people.create')",
  "if not public.has_permission('relationships.create')",
  "if not public.has_permission('permissions.manage')",
  "for update",
  "idempotency_key",
  "official_import_rollback_manifests",
  "insert into public.revisions",
  "insert into public.people",
  "insert into public.families",
  "insert into public.family_parents",
  "insert into public.family_children",
  "update public.import_sessions",
  "update public.official_import_batches",
]) {
  requireIncludes(dbMigration, token, `preserved transaction contract token ${token}`);
}

rejectPattern(dbMigration, /^\s*security\s+definer\b/im, "SECURITY DEFINER");
rejectPattern(dbMigration, /\bgrant\s+execute\b[\s\S]*\b(to|from)\s+(anon|public)\b/i, "anon/PUBLIC EXECUTE grant");
rejectPattern(dbMigration, /\bgrant\s+execute\b/i, "new EXECUTE grant");
rejectPattern(dbMigration, /\bcandidate\s+\?\s+'isLiving'\b/i, "nullable candidate ? isLiving branch");
rejectPattern(dbMigration, /\(candidate\s*->>\s*'isLiving'\)::boolean/i, "direct nullable isLiving cast");
rejectPattern(dbMigration, /\bcall\s+public\.a16p_tx_execute_giapha4_official_import\b/i, "RPC call");
rejectPattern(dbMigration, /\bselect\s+public\.a16p_tx_execute_giapha4_official_import\s*\(/i, "RPC invocation");
rejectPattern(dbMigration, /\bperform\s+public\.a16p_tx_execute_giapha4_official_import\s*\(/i, "RPC invocation");

const fixtures = [
  ["BOOLEAN_TRUE_FIXTURE", { isLiving: true }, true],
  ["BOOLEAN_FALSE_FIXTURE", { isLiving: false }, false],
  ["STRING_TRUE_FIXTURE", { isLiving: "true" }, true],
  ["STRING_FALSE_FIXTURE", { isLiving: "false" }, false],
  ["NULL_WITHOUT_DEATH_FIXTURE", { isLiving: null }, true],
  ["NULL_WITH_DEATH_FIXTURE", { isLiving: null, deathDateText: "2020" }, false],
  ["MISSING_WITHOUT_DEATH_FIXTURE", {}, true],
  ["MISSING_WITH_DEATH_FIXTURE", { deathDateText: "2020" }, false],
  ["EMPTY_IS_LIVING_FIXTURE", { isLiving: "" }, true],
  [
    "EMPTY_IS_LIVING_WITH_DEATH_FIXTURE",
    { isLiving: "", deathDateText: "2020" },
    false,
  ],
  ["INVALID_VALUE_FALLBACK_FIXTURE", { isLiving: "unknown" }, true],
  [
    "INVALID_VALUE_WITH_DEATH_FALLBACK_FIXTURE",
    { isLiving: "unknown", deathDateText: "2020" },
    false,
  ],
];

for (const [label, candidate, expected] of fixtures) {
  const actual = inferIsLiving(candidate);
  if (actual !== expected || actual == null) {
    failures.push(`${label} expected ${expected} got ${actual}`);
  }
}

for (const token of [
  "A16BU_STATUS=CANDIDATE_READY_NOT_APPLIED_OWNER_REVIEW_REQUIRED",
  "ROOT_CAUSE_CONFIRMED=YES",
  "IS_LIVING_NULL_SOURCE_CONTRACT=A16V_CANDIDATE_EXISTS_BRANCH_TREATS_JSON_NULL_AS_PRESENT",
  "MIGRATION_0016_HASH_MATCH=YES",
  "CORRECTIVE_MIGRATION=db/migrations/20260712_0022_a16bu_official_import_is_living_null_contract_fix.sql",
  "SQL_EXECUTED=NO",
  "MIGRATION_APPLIED=NO",
  "IMPORT_RPC_CALLED=NO",
  "A16R_RETRY=NO",
  "OWNER_REVIEW_CORRECTIVE_MIGRATION_THEN_SEPARATE_APPLY_VERIFY_PHASE",
]) {
  requireIncludes(plan, token, `plan token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A16BU_OFFICIAL_IMPORT_IS_LIVING_NULL_CONTRACT_FIX.md", "index A-16BU"],
  [workLog, "A16BU_STATUS=CANDIDATE_READY_NOT_APPLIED_OWNER_REVIEW_REQUIRED", "work log A-16BU"],
  [decisionLog, "Decision 325 - A-16BU fixes official import is_living null derivation", "decision A-16BU"],
  [handoff, "A16BU_STATUS=CANDIDATE_READY_NOT_APPLIED_OWNER_REVIEW_REQUIRED", "handoff A-16BU"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a16bu-official-import-is-living-null-contract-fix"] !==
  "node scripts/check-a16bu-official-import-is-living-null-contract-fix.cjs"
) {
  failures.push("missing package script check:a16bu-official-import-is-living-null-contract-fix");
}

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);
const allowedChangedFiles = new Set([
  dbMigrationPath,
  supabaseMigrationPath,
  planPath,
  checkerPath,
  "package.json",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "scripts/check-a16bq-downstream-rpc-write-contract-read-only-verification.cjs",
  "scripts/check-a16bf-rpc-invocation-identity-precheck-contract-alignment.cjs",
  "scripts/check-a16bh-production-a16bf-identity-precheck-rpc-contract-drift-diagnosis.cjs",
  "scripts/check-a16bi-same-client-rpc-binding-production-contract-read-only-verification.cjs",
  "scripts/check-a16r-runtime-execution-enablement-gate.cjs",
  "scripts/check-a16r-runtime-execution-enablement-owner-review.cjs",
  "scripts/check-a16r-official-import-gate-readiness-diagnosis.cjs",
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === ".env.local" || file.endsWith(".env.local")) {
    failures.push(`forbidden env file ${file}`);
  }
  if (file.startsWith("supabase/.temp/")) failures.push(`forbidden supabase temp ${file}`);
  if (/\.(xls|xlsx|csv)$/i.test(file)) failures.push(`forbidden data file ${file}`);
  if (
    /^(db\/migrations|supabase\/migrations)\//.test(file) &&
    file !== dbMigrationPath &&
    file !== supabaseMigrationPath
  ) {
    failures.push(`forbidden migration change ${file}`);
  }
}

if (failures.length > 0) {
  console.error("A-16BU official import is_living null contract fix check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16BU official import is_living null contract fix check passed.");
