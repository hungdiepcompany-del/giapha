#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const immutableMigrations = [
  [
    "db/migrations/20260711_0018_a16bm_official_import_row_lock_rls_fix_candidate.sql",
    "supabase/migrations/20260711_0018_a16bm_official_import_row_lock_rls_fix_candidate.sql",
    "7D62C16E201D452FD73B4E06C8F140361873C0C054A876EDDBFF28DD55FACC42",
  ],
  [
    "db/migrations/20260711_0019_a16bo_revoke_anon_import_staging_grants.sql",
    "supabase/migrations/20260711_0019_a16bo_revoke_anon_import_staging_grants.sql",
    "879A7472026683268A2343324D0CBA8EB6EE2E3E1D0A246CDE158478C0C38038",
  ],
  [
    "db/migrations/20260711_0020_a16br_revisions_insert_rls_and_anon_grant_cleanup.sql",
    "supabase/migrations/20260711_0020_a16br_revisions_insert_rls_and_anon_grant_cleanup.sql",
    "530129F27EAD748641C71D2C26718043D0B51639FC6104EFFC4B9D222550C0FC",
  ],
];

const dbMigrationPath =
  "db/migrations/20260711_0021_a16bt_secure_public_genealogy_read_boundary.sql";
const supabaseMigrationPath =
  "supabase/migrations/20260711_0021_a16bt_secure_public_genealogy_read_boundary.sql";
const verifySqlPath =
  "db/checks/20260711_check_a16bt_secure_public_genealogy_read_boundary.sql";
const checkerPath = "scripts/check-a16bt-secure-public-genealogy-read-boundary.cjs";
const planPath = "docs/PLAN_A16BT_SECURE_PUBLIC_GENEALOGY_READ_BOUNDARY.md";
const runbookPath = "docs/PLAN_A16BT_SQL_APPLY_VERIFY_LOCALHOST_SMOKE.md";
const publicServicePath = "lib/family/public-family-service.ts";
const treeTypesPath = "lib/family/tree-types.ts";
const treeBuilderPath = "lib/family/tree-graph-builder.ts";
const privacyServicePath = "lib/privacy/privacy-service.ts";
const packagePath = "package.json";

const expected0021Sha =
  "A7277E8A682610447BEC8142564C1A94B5FDE1AB4726C76D7DDF8205486B5D2C";

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
  return crypto.createHash("sha256").update(readBuffer(relativePath)).digest("hex").toUpperCase();
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

for (const [dbPath, supabasePath, expectedSha] of immutableMigrations) {
  if (sha256Hex(dbPath) !== expectedSha) failures.push(`${dbPath} immutable SHA changed`);
  if (sha256Hex(supabasePath) !== expectedSha) {
    failures.push(`${supabasePath} immutable SHA changed`);
  }
  if (read(dbPath) !== read(supabasePath)) failures.push(`${dbPath} mirror mismatch`);
}

const dbMigration = read(dbMigrationPath);
const supabaseMigration = read(supabaseMigrationPath);
const verifySql = read(verifySqlPath);
const publicService = read(publicServicePath);
const treeTypes = read(treeTypesPath);
const treeBuilder = read(treeBuilderPath);
const privacyService = read(privacyServicePath);
const plan = read(planPath);
const runbook = read(runbookPath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = readJson(packagePath);

if (dbMigration !== supabaseMigration) failures.push("migration 0021 mirrors differ");
if (sha256Hex(dbMigrationPath) !== expected0021Sha) failures.push("db migration 0021 SHA mismatch");
if (sha256Hex(supabaseMigrationPath) !== expected0021Sha) {
  failures.push("supabase migration 0021 SHA mismatch");
}

for (const token of [
  "A16BT_SECURE_PUBLIC_GENEALOGY_READ_BOUNDARY",
  "SQL_CANDIDATE_STATUS=NOT_APPLIED",
  "MIGRATION_0020_IMMUTABLE_SHA256=530129F27EAD748641C71D2C26718043D0B51639FC6104EFFC4B9D222550C0FC",
  "revoke select on table public.people from anon;",
  "revoke select on table public.people from public;",
  "revoke select on table public.families from anon;",
  "revoke select on table public.families from public;",
  "revoke select on table public.family_parents from anon;",
  "revoke select on table public.family_parents from public;",
  "revoke select on table public.family_children from anon;",
  "revoke select on table public.family_children from public;",
  "grant select (",
  ") on table public.people to anon;",
  ") on table public.families to anon;",
  ") on table public.family_parents to anon;",
  ") on table public.family_children to anon;",
  "create policy a16bt_public_people_select_active_public",
  "create policy a16bt_public_families_select_active_public",
  "create policy a16bt_public_family_parents_select_active_public_edges",
  "create policy a16bt_public_family_children_select_active_public_edges",
  "to anon",
  "visibility = 'public'",
  "deleted_at is null",
  "public_family.id = family_parents.family_id",
  "public_person.id = family_parents.person_id",
  "public_family.id = family_children.family_id",
  "public_person.id = family_children.person_id",
]) {
  requireIncludes(dbMigration, token, `migration 0021 token ${token}`);
}

for (const forbidden of [
  "notes_private",
  "created_by",
  "updated_by",
  "deleted_by",
  "delete_reason",
  "birth_date",
  "death_date",
  "birth_place",
  "home_town",
  "short_bio",
]) {
  const grantColumnPattern = new RegExp(`grant\\s+select\\s*\\([\\s\\S]*\\b${forbidden}\\b[\\s\\S]*\\)\\s+on\\s+table\\s+public\\.(people|families|family_parents|family_children)\\s+to\\s+anon`, "i");
  rejectPattern(dbMigration, grantColumnPattern, `anon column grant for ${forbidden}`);
}

rejectPattern(dbMigration, /grant\s+select\s+on\s+table\s+public\.(people|families|family_parents|family_children)\s+to\s+(anon|public)/i, "broad anon/PUBLIC table SELECT grant");
rejectPattern(dbMigration, /grant\s+(insert|update|delete|truncate|references|trigger)/i, "anon/PUBLIC mutation grant");
rejectPattern(dbMigration, /\bservice_role\b/i, "service_role change");
rejectPattern(dbMigration, /\bto\s+authenticated\b/i, "authenticated policy/grant change in 0021");
rejectPattern(dbMigration, /\bdisable\s+row\s+level\s+security\b/i, "disable RLS");
rejectPattern(dbMigration, /\bforce\s+row\s+level\s+security\b/i, "FORCE RLS");

for (const token of [
  "A16BT_SECURE_PUBLIC_GENEALOGY_READ_BOUNDARY_SELECT_ONLY_VERIFY",
  "SQL_CHECK_STATUS=SELECT_ONLY",
  "required_anon_columns",
  "forbidden_anon_columns",
  "broad_anon_table_select_grant_count",
  "broad_public_table_select_grant_count",
  "missing_required_anon_column_grant_count",
  "forbidden_private_column_anon_grant_count",
  "notes_private_anon_select_privilege",
  "forbidden_anon_mutation_grant_count",
  "forbidden_public_mutation_grant_count",
  "people_anon_policy_active_public",
  "families_anon_policy_active_public",
  "family_parents_anon_policy_active_public_family_and_person",
  "family_children_anon_policy_active_public_family_and_person",
  "existing_authenticated_policies_remain_unchanged",
  "forbidden_anon_public_write_policy_count",
  "rls_enabled_table_count",
  "a16br_revisions_insert_policy_remains_unchanged",
  "rpc_remains_security_invoker",
  "no_automatic_import_trigger",
  "a16bt_secure_public_genealogy_read_boundary_verified",
]) {
  requireIncludes(verifySql, token, `verification SQL token ${token}`);
}

rejectPattern(verifySql, /^\s*(insert|update|delete|alter|create|drop|grant|revoke|truncate)\b/im, "verification SQL must remain SELECT-only");
rejectPattern(verifySql, /\bfrom\s+public\.(people|families|family_parents|family_children)\b(?!\s+public_)/i, "verification SQL must not query genealogy rows directly");
rejectPattern(verifySql, /\bfor\s+update\b/i, "verification SQL must not lock rows");

for (const [constantName, columns] of [
  [
    "PEOPLE_PUBLIC_SELECT",
    ["id", "slug", "full_name", "display_name", "is_living", "branch_name", "generation_number", "visibility", "deleted_at"],
  ],
  ["FAMILY_PUBLIC_SELECT", ["id", "family_code", "family_label", "visibility", "deleted_at"]],
  ["FAMILY_PARENT_PUBLIC_SELECT", ["id", "family_id", "person_id", "parent_role", "deleted_at"]],
  ["FAMILY_CHILD_PUBLIC_SELECT", ["id", "family_id", "person_id", "child_relationship_type", "deleted_at"]],
]) {
  requireIncludes(publicService, `const ${constantName}`, `public query constant ${constantName}`);
  for (const column of columns) requireIncludes(publicService, column, `${constantName} column ${column}`);
}

for (const token of [
  ".from(\"people\")",
  ".from(\"families\")",
  ".from(\"family_parents\")",
  ".from(\"family_children\")",
  ".select(PEOPLE_PUBLIC_SELECT)",
  ".select(FAMILY_PUBLIC_SELECT)",
  ".select(FAMILY_PARENT_PUBLIC_SELECT)",
  ".select(FAMILY_CHILD_PUBLIC_SELECT)",
  "PublicGenealogyPersonRow",
  "toPublicPerson(data)",
]) {
  requireIncludes(publicService, token, `public service token ${token}`);
}

rejectPattern(publicService, /select\(\s*["'`]\*/, "public service select star");
rejectPattern(publicService, /\bnotes_private\b/, "notes_private in public service");
rejectPattern(publicService, /\b(created_by|updated_by|deleted_by|delete_reason|birth_date|death_date|birth_place|home_town|short_bio)\b/, "private or non-allowlisted public service column");
rejectPattern(publicService, /maybeCreateAdminSupabaseClient|service_role|SUPABASE_SERVICE_ROLE/i, "service role in public service");

for (const token of [
  "TreePersonInput",
  "TreeFamilyInput",
  "TreeFamilyParentInput",
  "TreeFamilyChildInput",
  "TreeCoupleRelationshipInput",
]) {
  requireIncludes(treeTypes, token, `tree type token ${token}`);
  requireIncludes(treeBuilder, token, `tree builder token ${token}`);
}
requireIncludes(privacyService, "PublicPersonSource", "public person source type");
const publicPersonSourceBlock =
  privacyService.match(/export type PublicPersonSource[\s\S]*?};/)?.[0] ?? "";
if (!publicPersonSourceBlock) {
  failures.push("missing PublicPersonSource block");
} else {
  rejectPattern(publicPersonSourceBlock, /\bnotes_private\b/i, "PublicPersonSource must not include notes_private");
}

for (const token of [
  "A16BT_STATUS=CANDIDATE_READY_NOT_APPLIED_OWNER_REVIEW_REQUIRED",
  "A16BT_PUBLIC_ACCESS_MODEL=COLUMN_LEVEL_GRANTS_PLUS_ANON_RLS",
  "A16BT_PRIVATE_COLUMN_EXPOSURE=BLOCKED",
  "A16BT_LOCALHOST_SMOKE=SAFE_SKIP_NO_ISOLATED_LOCAL_DB_NO_PRODUCTION_ROW_QUERY",
  "A16BT_DEPLOY_REQUIRED=NO",
  "A16R_IMPORT_RETRY_NEXT=NO",
  `A16BT_MIGRATION_0021=${dbMigrationPath}`,
  `A16BT_SUPABASE_MIRROR=${supabaseMigrationPath}`,
  `A16BT_VERIFICATION_SQL=${verifySqlPath}`,
  `A16BT_MIGRATION_0021_SHA256=${expected0021Sha}`,
  "A16BT_PUBLIC_QUERY_PEOPLE_COLUMNS=id,slug,full_name,display_name,is_living,branch_name,generation_number,visibility,deleted_at",
  "A16BT_PUBLIC_QUERY_FAMILIES_COLUMNS=id,family_code,family_label,visibility,deleted_at",
  "A16BT_PUBLIC_QUERY_FAMILY_PARENTS_COLUMNS=id,family_id,person_id,parent_role,deleted_at",
  "A16BT_PUBLIC_QUERY_FAMILY_CHILDREN_COLUMNS=id,family_id,person_id,child_relationship_type,deleted_at",
  "A16BT_SQL_EXECUTED_BY_CODEX=NO",
  "A16BT_MIGRATION_0021_APPLIED=NO",
]) {
  requireIncludes(plan, token, `plan token ${token}`);
}

for (const token of [
  "A16BT_RUNBOOK_STATUS=OWNER_REVIEW_REQUIRED_NOT_APPLIED",
  "A16BT_STATUS=PASS_WITH_ACCEPTED_MANUAL_APPLY_MIGRATION_HISTORY_GAP",
  "OWNER_ACCEPT_A16BT_MANUAL_APPLY_HISTORY_GAP_DB_EFFECTS_VERIFIED",
  "DB_EFFECTS_VERIFIED=YES",
  "MIGRATION_HISTORY_VERIFIED=NO",
  "MIGRATION_RERUN_ALLOWED=NO",
  "FUTURE_CLI_RECONCILIATION_REQUIRED=YES",
  "SQL_EXECUTED=NO",
  "DEPLOY=NO",
  "PUSH=NO",
  "IMPORT_RPC_CALLED=NO",
  "A16R_RETRY=NO",
  "APPROVE_A16BT_APPLY_SECURE_PUBLIC_GENEALOGY_READ_BOUNDARY",
  "A16BT_RUNBOOK_SQL_EXECUTION_ALLOWED=NO",
  "A16BT_RUNBOOK_DEPLOY_ALLOWED=NO",
  "A16BT_RUNBOOK_IMPORT_RPC_ALLOWED=NO",
  "A16BT_EXPECTED_POST_APPLY_VERIFY=a16bt_secure_public_genealogy_read_boundary_verified_TRUE",
  "A16BT_LOCALHOST_SMOKE_PLAN=AFTER_LOCAL_BUILD_NO_PRODUCTION_MUTATION",
]) {
  requireIncludes(runbook, token, `runbook token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A16BT_SECURE_PUBLIC_GENEALOGY_READ_BOUNDARY.md", "index A-16BT plan"],
  [index, "PLAN_A16BT_SQL_APPLY_VERIFY_LOCALHOST_SMOKE.md", "index A-16BT runbook"],
  [workLog, "A-16BT - Secure public genealogy read boundary", "work log A-16BT"],
  [workLog, "A16BT_STATUS=PASS_WITH_ACCEPTED_MANUAL_APPLY_MIGRATION_HISTORY_GAP", "work log A-16BT accepted history gap"],
  [workLog, "FUTURE_CLI_RECONCILIATION_REQUIRED=YES", "work log A-16BT future CLI reconciliation"],
  [decisionLog, "Decision 320 - A-16BT secures public genealogy reads with column grants", "decision A-16BT"],
  [decisionLog, "Decision 323 - A-16BT accepts verified DB effects with migration-history gap", "decision A-16BT accepted history gap"],
  [decisionLog, "MIGRATION_RERUN_ALLOWED=NO", "decision A-16BT migration rerun blocked"],
  [handoff, "A16BT_STATUS=CANDIDATE_READY_NOT_APPLIED_OWNER_REVIEW_REQUIRED", "handoff A-16BT"],
  [handoff, "A16BT_STATUS=PASS_WITH_ACCEPTED_MANUAL_APPLY_MIGRATION_HISTORY_GAP", "handoff A-16BT accepted history gap"],
  [handoff, "NEXT_ACTION=RETURN_TO_A16BF_A16R_CRITICAL_PATH", "handoff A-16BT next action"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a16bt-secure-public-genealogy-read-boundary"] !==
  "node scripts/check-a16bt-secure-public-genealogy-read-boundary.cjs"
) {
  failures.push("missing package A-16BT check script");
}

rejectPattern(plan + runbook + workLog + decisionLog + handoff, /A16R_IMPORT_RETRY_NEXT=YES/i, "A-16R retry must remain NO");
rejectPattern(plan + runbook + workLog + decisionLog + handoff, /A16BT_DEPLOY_REQUIRED=YES/i, "deploy must remain NO");
rejectPattern(plan + runbook + dbMigration + verifySql + publicService, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  dbMigrationPath,
  supabaseMigrationPath,
  verifySqlPath,
  checkerPath,
  "scripts/check-a16bq-downstream-rpc-write-contract-read-only-verification.cjs",
  "scripts/check-a16br-revisions-insert-rls-and-anon-grant-cleanup.cjs",
  planPath,
  runbookPath,
  publicServicePath,
  treeTypesPath,
  treeBuilderPath,
  privacyServicePath,
  packagePath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (immutableMigrations.some(([dbPath, supabasePath]) => file === dbPath || file === supabasePath)) {
    failures.push(`immutable migration must not change: ${file}`);
  }
  if (file.startsWith(".tmp/") || file.startsWith(".tmp\\")) failures.push(`forbidden raw temp file ${file}`);
  if (file !== packagePath && /\.(json|xlsx|xls|csv|zip)$/i.test(file)) {
    failures.push(`forbidden raw data/evidence file ${file}`);
  }
}

const stagedFiles = git(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected staged file ${file}`);
}

if (failures.length > 0) {
  console.error("A-16BT secure public genealogy read boundary check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16BT secure public genealogy read boundary check passed.");
