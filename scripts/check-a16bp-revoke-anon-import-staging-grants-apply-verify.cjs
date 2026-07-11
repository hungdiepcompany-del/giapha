#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];
const expected0018Sha =
  "7D62C16E201D452FD73B4E06C8F140361873C0C054A876EDDBFF28DD55FACC42";
const expected0019Sha =
  "879A7472026683268A2343324D0CBA8EB6EE2E3E1D0A246CDE158478C0C38038";
const migration0018Db =
  "db/migrations/20260711_0018_a16bm_official_import_row_lock_rls_fix_candidate.sql";
const migration0018Supabase =
  "supabase/migrations/20260711_0018_a16bm_official_import_row_lock_rls_fix_candidate.sql";
const migration0019Db =
  "db/migrations/20260711_0019_a16bo_revoke_anon_import_staging_grants.sql";
const migration0019Supabase =
  "supabase/migrations/20260711_0019_a16bo_revoke_anon_import_staging_grants.sql";
const docPath = "docs/PLAN_A16BP_REVOKE_ANON_IMPORT_STAGING_GRANTS_APPLY_VERIFY.md";
const checkerPath = "scripts/check-a16bp-revoke-anon-import-staging-grants-apply-verify.cjs";

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function sha256Hex(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return crypto.createHash("sha256").update(fs.readFileSync(absolutePath)).digest("hex").toUpperCase();
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

const doc = read(docPath);
const packageJson = JSON.parse(read("package.json") || "{}");
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const checker = read(checkerPath);
const wrangler = read("wrangler.toml");
const layout = read("app/layout.tsx");

for (const migrationPath of [migration0018Db, migration0018Supabase]) {
  if (sha256Hex(migrationPath) !== expected0018Sha) failures.push(`${migrationPath} SHA256 changed`);
}
for (const migrationPath of [migration0019Db, migration0019Supabase]) {
  if (sha256Hex(migrationPath) !== expected0019Sha) failures.push(`${migrationPath} SHA256 changed`);
}

for (const token of [
  "A16BP_STATUS=PASS_OWNER_MANUAL_APPLY_AND_VERIFIED",
  "A16BO_VERIFICATION_STATUS=PASS_ALL_BOOLEAN_CHECKS_TRUE",
  "A16R_IMPORT_RETRY_NEXT=NO",
  `A16BP_APPLIED_MIGRATION_SHA256=${expected0019Sha}`,
  `A16BP_MIGRATION_0018_IMMUTABLE_SHA256=${expected0018Sha}`,
  `A16BP_MIGRATION_0019_IMMUTABLE_SHA256=${expected0019Sha}`,
  "A16BP_FORBIDDEN_ANON_PUBLIC_TABLE_GRANT_COUNT=0",
  "A16BP_FORBIDDEN_ANON_PUBLIC_POLICY_COUNT=0",
  "A16BP_A16BO_REVOKE_ANON_IMPORT_STAGING_GRANTS_VERIFIED=true",
  "A16BP_NEXT_PHASE=A16BQ_DOWNSTREAM_RPC_WRITE_CONTRACT_READ_ONLY_VERIFICATION",
  "A16BP_SQL_RUN_BY_CODEX=NO",
  "A16BP_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16BP_IMPORT_RPC_CALLED=NO",
]) {
  requireIncludes(doc, token, `A-16BP doc token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A16BP_REVOKE_ANON_IMPORT_STAGING_GRANTS_APPLY_VERIFY.md", "index A-16BP"],
  [workLog, "A-16BP - Owner apply evidence record", "work log A-16BP"],
  [decisionLog, "Decision 316 - A-16BP records owner-applied A-16BO verification pass", "decision A-16BP"],
  [handoff, "A16BP_STATUS=PASS_OWNER_MANUAL_APPLY_AND_VERIFIED", "handoff A-16BP"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a16bp-revoke-anon-import-staging-grants-apply-verify"] !==
  "node scripts/check-a16bp-revoke-anon-import-staging-grants-apply-verify.cjs"
) {
  failures.push("missing package A-16BP check script");
}

rejectPattern(doc + workLog + handoff, /A16R_IMPORT_RETRY_NEXT=YES/i, "A-16R retry must remain NO");
rejectPattern(wrangler, /A16BP|A16BQ|A16R_IMPORT_RETRY/i, "wrangler config must not change");
rejectPattern(layout, /A16BP|A16BQ|official-import/i, "app layout must not change");
rejectPattern(doc + checker, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);
const allowedChangedFiles = new Set([
  docPath,
  "docs/PLAN_A16BQ_DOWNSTREAM_RPC_WRITE_CONTRACT_READ_ONLY_VERIFICATION.md",
  checkerPath,
  "scripts/check-a16bq-downstream-rpc-write-contract-read-only-verification.cjs",
  "package.json",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === migration0018Db || file === migration0018Supabase || file === migration0019Db || file === migration0019Supabase) {
    failures.push(`applied migration must remain immutable: ${file}`);
  }
}

if (failures.length > 0) {
  console.error("A-16BP apply evidence check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16BP apply evidence check passed.");
