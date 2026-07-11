#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const migration0018Db =
  "db/migrations/20260711_0018_a16bm_official_import_row_lock_rls_fix_candidate.sql";
const migration0018Supabase =
  "supabase/migrations/20260711_0018_a16bm_official_import_row_lock_rls_fix_candidate.sql";
const migration0019Db =
  "db/migrations/20260711_0019_a16bo_revoke_anon_import_staging_grants.sql";
const migration0019Supabase =
  "supabase/migrations/20260711_0019_a16bo_revoke_anon_import_staging_grants.sql";
const expected0018Sha =
  "7D62C16E201D452FD73B4E06C8F140361873C0C054A876EDDBFF28DD55FACC42";
const expected0019Sha =
  "879A7472026683268A2343324D0CBA8EB6EE2E3E1D0A246CDE158478C0C38038";

const dbMigrationPath =
  "db/migrations/20260711_0020_a16br_revisions_insert_rls_and_anon_grant_cleanup.sql";
const supabaseMigrationPath =
  "supabase/migrations/20260711_0020_a16br_revisions_insert_rls_and_anon_grant_cleanup.sql";
const verifySqlPath =
  "db/checks/20260711_check_a16br_revisions_insert_rls_and_anon_grant_cleanup.sql";
const docPath = "docs/PLAN_A16BR_REVISIONS_INSERT_RLS_AND_ANON_GRANT_CLEANUP.md";
const runbookPath = "docs/PLAN_A16BR_SQL_APPLY_VERIFY_RUNBOOK.md";
const checkerPath = "scripts/check-a16br-revisions-insert-rls-and-anon-grant-cleanup.cjs";
const bqDocPath = "docs/PLAN_A16BQ_DOWNSTREAM_RPC_WRITE_CONTRACT_READ_ONLY_VERIFICATION.md";
const bqCheckerPath =
  "scripts/check-a16bq-downstream-rpc-write-contract-read-only-verification.cjs";
const packagePath = "package.json";
const oldMigration0020Sha =
  "0A7F69196C97071C7304E4D0CE28DA1C134E95AF3DEFA00C8958FC7971591CF0";
const expectedMigration0020Sha =
  "530129F27EAD748641C71D2C26718043D0B51639FC6104EFFC4B9D222550C0FC";

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

const migration0018DbSql = read(migration0018Db);
const migration0018SupabaseSql = read(migration0018Supabase);
const migration0019DbSql = read(migration0019Db);
const migration0019SupabaseSql = read(migration0019Supabase);
const dbMigration = read(dbMigrationPath);
const supabaseMigration = read(supabaseMigrationPath);
const verifySql = read(verifySqlPath);
const doc = read(docPath);
const runbook = read(runbookPath);
const checker = read(checkerPath);
const bqDoc = read(bqDocPath);
const bqChecker = read(bqCheckerPath);
const packageJson = readJson(packagePath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const wrangler = read("wrangler.toml");
const layout = read("app/layout.tsx");
const publicHomePage = read("app/(public)/page.tsx");
const publicTreePage = read("app/(public)/tree/page.tsx");
const publicPersonPage = read("app/(public)/people/[slug]/page.tsx");
const publicPreviewPage = read("app/(admin)/admin/preview/public/page.tsx");
const publicFamilyService = read("lib/family/public-family-service.ts");
const serverSupabase = read("lib/supabase/server.ts");

if (sha256Hex(migration0018Db) !== expected0018Sha) failures.push("db migration 0018 SHA256 changed");
if (sha256Hex(migration0018Supabase) !== expected0018Sha) {
  failures.push("supabase migration 0018 SHA256 changed");
}
if (sha256Hex(migration0019Db) !== expected0019Sha) failures.push("db migration 0019 SHA256 changed");
if (sha256Hex(migration0019Supabase) !== expected0019Sha) {
  failures.push("supabase migration 0019 SHA256 changed");
}
if (migration0018DbSql !== migration0018SupabaseSql) failures.push("migration 0018 mirrors differ");
if (migration0019DbSql !== migration0019SupabaseSql) failures.push("migration 0019 mirrors differ");
if (dbMigration !== supabaseMigration) failures.push("db and supabase migration 0020 mirrors differ");
if (sha256Hex(dbMigrationPath) !== expectedMigration0020Sha) {
  failures.push("db migration 0020 SHA256 must match corrected public-read contract");
}
if (sha256Hex(supabaseMigrationPath) !== expectedMigration0020Sha) {
  failures.push("supabase migration 0020 SHA256 must match corrected public-read contract");
}
if (sha256Hex(dbMigrationPath) === oldMigration0020Sha || sha256Hex(supabaseMigrationPath) === oldMigration0020Sha) {
  failures.push("superseded migration 0020 SHA256 must never be applied");
}

for (const token of [
  "A16BR_REVISIONS_INSERT_RLS_AND_ANON_GRANT_CLEANUP",
  "SQL_CANDIDATE_STATUS=NOT_APPLIED",
  "NO_AUTHENTICATED_GRANT_CHANGE",
  "NO_SERVICE_ROLE_CHANGE",
  "NO_RLS_DISABLE",
  "NO_FORCE_RLS",
  "NO_ANON_OR_PUBLIC_POLICY",
  "create policy a16br_revisions_insert_official_import_create",
  "for insert",
  "to authenticated",
  "changed_by = public.current_profile_id()",
  "action = 'create'",
  "entity_type in ('people', 'families')",
  "public.has_permission('imports.create')",
  "public.has_permission('permissions.manage')",
  "public.has_permission('people.create')",
  "public.has_permission('relationships.create')",
  "change_reason = 'A-16V official import candidate'",
  "after_json ->> 'source' = 'A-16V Gia Pha 4 official import candidate'",
  "after_json ? 'import_session_id'",
  "source_row_index",
  "child_source_row_index",
  "from public.import_sessions owned_session",
  "owned_session.created_by = public.current_profile_id()",
  "ready_for_owner_approval",
  "owner_approved_for_db_write",
]) {
  requireIncludes(dbMigration, token, `migration 0020 token ${token}`);
}

for (const tableName of [
  "families",
  "family_children",
  "family_parents",
  "people",
]) {
  const revokeMutation = `revoke insert, update, delete, truncate, references, trigger
on table public.${tableName} from`;
  requireIncludes(
    dbMigration,
    `${revokeMutation} anon;`,
    `migration 0020 anon mutation revoke ${tableName}`,
  );
  requireIncludes(
    dbMigration,
    `${revokeMutation} public;`,
    `migration 0020 PUBLIC mutation revoke ${tableName}`,
  );
  rejectPattern(
    dbMigration,
    new RegExp(`revoke\\s+all\\s+privileges\\s+on\\s+table\\s+public\\.${tableName}\\s+from\\s+(anon|public)`, "i"),
    `migration 0020 must preserve verified public SELECT on ${tableName}`,
  );
}

for (const tableName of [
  "revisions",
  "import_session_warnings",
  "import_duplicate_candidates",
  "import_relationship_candidates",
]) {
  requireIncludes(
    dbMigration,
    `revoke all privileges on table public.${tableName} from anon;`,
    `migration 0020 anon revoke ${tableName}`,
  );
  requireIncludes(
    dbMigration,
    `revoke all privileges on table public.${tableName} from public;`,
    `migration 0020 PUBLIC revoke ${tableName}`,
  );
}

for (const token of [
  "A16BR_REVISIONS_INSERT_RLS_AND_ANON_GRANT_CLEANUP_SELECT_ONLY_VERIFY",
  "SQL_CHECK_STATUS=SELECT_ONLY",
  "required_table_privileges",
  "forbidden_anon_mutation_grant_count",
  "forbidden_public_mutation_grant_count",
  "staging_and_revision_anon_grant_count",
  "public_core_anon_select_table_count",
  "forbidden_anon_public_write_policy_count",
  "public_core_anon_select_contract",
  "people_public_select_policy_exists_if_needed",
  "families_public_select_policy_exists_if_needed",
  "family_parents_public_select_policy_exists_if_needed",
  "family_children_public_select_policy_exists_if_needed",
  "missing_authenticated_required_privilege_count",
  "all_rpc_tables_rls_enabled",
  "force_rls_table_count",
  "existing_revisions_select_policies_remain_unchanged",
  "new_revisions_insert_policy_exists",
  "new_revisions_policy_role_authenticated_only",
  "new_revisions_policy_checks_changed_by_current_profile",
  "new_revisions_policy_limits_action_create",
  "new_revisions_policy_limits_entity_types_people_families",
  "new_revisions_policy_checks_imports_create",
  "new_revisions_policy_checks_permissions_manage",
  "new_revisions_policy_checks_people_relationships_create_by_entity_type",
  "new_revisions_policy_requires_official_import_marker_fields",
  "new_revisions_policy_verifies_owned_import_session_id",
  "new_revisions_policy_checks_session_status_compatible",
  "official_import_batches_update_policy_unchanged_runtime_compatible",
  "official_import_batches_update_contract_runtime_compatible_without_completed_literal",
  "rpc_remains_security_invoker",
  "no_automatic_import_trigger",
  "a16br_revisions_insert_rls_and_anon_grant_cleanup_verified",
]) {
  requireIncludes(verifySql, token, `verification SQL token ${token}`);
}

for (const token of [
  "A16BR_STATUS=CANDIDATE_READY_NOT_APPLIED_OWNER_REVIEW_REQUIRED",
  "A16BR_FIX_STATUS=PUBLIC_READ_PATH_VERIFIED",
  "A16BR_PUBLIC_READ_CLASSIFICATION=BLOCKED_PRESERVE_PUBLIC_ANON_SELECT",
  "A16BR_SQL_APPLIED=NO",
  "revisions_supports_rpc_insert=false",
  "A16BR_OFFICIAL_IMPORT_BATCH_UPDATE_STATUS=PASS_RUNTIME_COMPATIBLE",
  "A16BR_A16BQ_BATCH_LIFECYCLE_BOOLEAN=FALSE_NEGATIVE_CHECKER_TOO_STRICT",
  `A16BR_MIGRATION_0020=${dbMigrationPath}`,
  `A16BR_SUPABASE_MIRROR=${supabaseMigrationPath}`,
  `A16BR_VERIFICATION_SQL=${verifySqlPath}`,
  `A16BR_MIGRATION_0020_SUPERSEDED_SHA256=${oldMigration0020Sha}`,
  `A16BR_MIGRATION_0020_SHA256=${expectedMigration0020Sha}`,
  "A16BR_MIGRATION_0018_IMMUTABLE_SHA256=7D62C16E201D452FD73B4E06C8F140361873C0C054A876EDDBFF28DD55FACC42",
  "A16BR_MIGRATION_0019_IMMUTABLE_SHA256=879A7472026683268A2343324D0CBA8EB6EE2E3E1D0A246CDE158478C0C38038",
  "A16BR_REVISIONS_INSERT_BLOCKER=FIX_CANDIDATE_READY",
  "A16BR_ANON_GRANT_COUNT_BEFORE=56",
  "A16BR_PUBLIC_DB_ACCESS_PATH=SERVER_SIDE_SUPABASE_ANON_CLIENT_DIRECT_TABLE_SELECT",
  "A16BR_PUBLIC_ROUTES_INSPECTED=/,/tree,/people/[slug],/admin/preview/public",
  "A16BR_ANON_SELECT_REQUIRED_TABLES=people,families,family_parents,family_children",
  "A16BR_PUBLIC_CORE_ANON_SELECT_REQUIRED=YES",
  "A16BR_STAGING_AND_REVISION_ANON_GRANT_COUNT_EXPECTED_AFTER=0",
  "A16BR_PUBLIC_PAGE_SMOKE_PLAN=RUN_AFTER_OWNER_APPLY_BEFORE_ANY_A16R_RETRY",
  "A16BR_REVISIONS_POLICY_STATUS=PRESERVED_NO_DEFECT_FOUND",
  "A16BR_SQL_EXECUTED_BY_CODEX=NO",
  "A16BR_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16BR_IMPORT_RPC_CALLED=NO",
  "A16BR_DEPLOY_RUN=NO",
  "A16R_IMPORT_RETRY_NEXT=NO",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "A16BR_RUNBOOK_STATUS=OWNER_REVIEW_REQUIRED_NOT_APPLIED",
  "A16BR_FIX_STATUS=PUBLIC_READ_PATH_VERIFIED",
  "A16BR_PUBLIC_READ_CLASSIFICATION=BLOCKED_PRESERVE_PUBLIC_ANON_SELECT",
  "APPROVE_A16BR_APPLY_REVISIONS_INSERT_RLS_AND_ANON_GRANT_CLEANUP",
  "A16BR_RUNBOOK_SUPABASE_DB_PUSH_ALLOWED=NO",
  "A16BR_RUNBOOK_POST_OFFICIAL_IMPORT_ALLOWED=NO",
  "A16BR_RUNBOOK_IMPORT_RPC_ALLOWED=NO",
  "A16BR_RUNBOOK_A16R_RETRY_ALLOWED=NO",
  "A16BR_EXPECTED_POST_APPLY_VERIFY=a16br_revisions_insert_rls_and_anon_grant_cleanup_verified_TRUE",
  "public_core_anon_select_contract=true",
  "forbidden_anon_mutation_grant_count=0",
  "forbidden_public_mutation_grant_count=0",
  "staging_and_revision_anon_grant_count=0",
  "A16BR_NEXT_PHASE_AFTER_APPLY_VERIFY=A16BS_OWNER_SELECT_ONLY_APPLY_VERIFY_EVIDENCE_NO_IMPORT_RETRY",
]) {
  requireIncludes(runbook, token, `runbook token ${token}`);
}

for (const token of [
  "A16BQ_OFFICIAL_IMPORT_BATCH_UPDATE_STATUS=PASS_RUNTIME_COMPATIBLE",
  "A16BQ_BATCH_LIFECYCLE_BOOLEAN=FALSE_NEGATIVE_CHECKER_TOO_STRICT",
  "official_import_batches_update_policy_runtime_compatible",
  "updated_by = current_profile_id()",
]) {
  requireIncludes(bqDoc, token, `A-16BQ correction token ${token}`);
}

for (const [content, token, label] of [
  [index, "BLOCKED_PRESERVE_PUBLIC_ANON_SELECT", "index A-16BR fix classification"],
  [index, "PLAN_A16BR_REVISIONS_INSERT_RLS_AND_ANON_GRANT_CLEANUP.md", "index A-16BR plan"],
  [index, "PLAN_A16BR_SQL_APPLY_VERIFY_RUNBOOK.md", "index A-16BR runbook"],
  [workLog, "A-16BR-FIX - Public read-path compatibility audit before migration 0020 apply", "work log A-16BR fix"],
  [workLog, "A-16BR - Revisions INSERT RLS contract and anon grant cleanup candidate", "work log A-16BR"],
  [decisionLog, "Decision 319 - A-16BR-FIX preserves verified public anon SELECT", "decision A-16BR fix"],
  [decisionLog, "Decision 318 - A-16BR adds narrow official-import revision INSERT RLS", "decision A-16BR"],
  [handoff, "A16BR_FIX_STATUS=PUBLIC_READ_PATH_VERIFIED", "handoff A-16BR fix"],
  [handoff, "A16BR_STATUS=CANDIDATE_READY_NOT_APPLIED_OWNER_REVIEW_REQUIRED", "handoff A-16BR"],
]) {
  requireIncludes(content, token, label);
}

for (const [content, token, label] of [
  [publicHomePage, "getPublicFamilyStats", "public home stats path"],
  [publicTreePage, "getPublicFamilyTreeGraph", "public tree graph path"],
  [publicPersonPage, "getPublicPersonProfile", "public person profile path"],
  [publicPreviewPage, "getPublicFamilyTreeGraph", "admin public preview path"],
  [publicFamilyService, "maybeCreateServerSupabaseClient", "public service server anon client"],
  [publicFamilyService, '.from("people")', "public people direct table read"],
  [publicFamilyService, '.from("families")', "public families direct table read"],
  [publicFamilyService, '.from("family_parents")', "public family_parents direct table read"],
  [publicFamilyService, '.from("family_children")', "public family_children direct table read"],
  [publicFamilyService, '.eq("visibility", "public")', "public visibility filter"],
  [publicFamilyService, '.is("deleted_at", null)', "public deleted_at filter"],
  [serverSupabase, "createServerClient(config.supabaseUrl, config.supabaseAnonKey", "server Supabase anon key client"],
  [serverSupabase, "NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon env name"],
]) {
  requireIncludes(content, token, label);
}

rejectPattern(publicFamilyService, /maybeCreateAdminSupabaseClient|service_role|SUPABASE_SERVICE_ROLE/i, "public family service must not use service role");

if (
  packageJson?.scripts?.["check:a16br-revisions-insert-rls-and-anon-grant-cleanup"] !==
  "node scripts/check-a16br-revisions-insert-rls-and-anon-grant-cleanup.cjs"
) {
  failures.push("missing package A-16BR check script");
}

rejectPattern(dbMigration, /^\s*grant\b/im, "migration 0020 must not add grants");
rejectPattern(dbMigration, /\bto\s+(anon|public)\b[\s\S]{0,80}\bwith\s+check\b/i, "migration 0020 must not create anon/public write policy");
rejectPattern(dbMigration, /\bdisable\s+row\s+level\s+security\b/i, "migration 0020 must not disable RLS");
rejectPattern(dbMigration, /\bforce\s+row\s+level\s+security\b/i, "migration 0020 must not FORCE RLS");
rejectPattern(dbMigration, /\bservice_role\b/i, "migration 0020 must not change service_role");
rejectPattern(dbMigration, /\ba16p_tx_execute_giapha4_official_import\s*\(/i, "migration 0020 must not invoke import RPC");
rejectPattern(dbMigration, /\b(update|delete|truncate)\s+public\./i, "migration 0020 must not mutate table rows");
rejectPattern(dbMigration, /\binsert\s+into\s+public\./i, "migration 0020 must not insert data rows");
rejectPattern(dbMigration, /\bfor\s+(update|delete)\b/i, "migration 0020 must not add revisions update/delete policy");

rejectPattern(verifySql, /^\s*(insert|update|delete|alter|create|drop|grant|revoke|truncate)\b/im, "verification SQL must remain SELECT-only");
rejectPattern(verifySql, /\bfor\s+update\b/i, "verification SQL must not lock production rows");
rejectPattern(verifySql, /\ba16p_tx_execute_giapha4_official_import\s*\(/i, "verification SQL must not invoke import RPC");
rejectPattern(
  bqDoc,
  /official_import_batches_supports_rpc_update_lifecycle[\s\S]{0,900}%completed%/i,
  "A-16BQ official_import_batches UPDATE check must not require literal completed",
);
rejectPattern(doc + runbook + workLog + handoff, /A16R_IMPORT_RETRY_NEXT=YES/i, "A-16R retry must remain NO");
rejectPattern(wrangler, /A16BR|A16R_IMPORT_RETRY/i, "wrangler config must not change");
rejectPattern(layout, /A16BR|official-import/i, "app layout must not change");
rejectPattern(doc + runbook + dbMigration + verifySql + checker + bqDoc + bqChecker, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  dbMigrationPath,
  supabaseMigrationPath,
  verifySqlPath,
  docPath,
  runbookPath,
  checkerPath,
  bqDocPath,
  bqCheckerPath,
  packagePath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if ([migration0018Db, migration0018Supabase, migration0019Db, migration0019Supabase].includes(file)) {
    failures.push(`immutable migration must not change: ${file}`);
  }
  if (file === "wrangler.toml" || file === "app/layout.tsx") failures.push(`forbidden changed file ${file}`);
  if (file.startsWith(".tmp/") || file.startsWith(".tmp\\")) failures.push(`forbidden raw temp evidence file ${file}`);
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
  console.error("A-16BR revisions insert RLS and anon grant cleanup check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16BR revisions insert RLS and anon grant cleanup check passed.");
