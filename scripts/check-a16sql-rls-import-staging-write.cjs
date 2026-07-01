const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16SQL_RLS_IMPORT_STAGING_WRITE.md";
const checkerPath = "scripts/check-a16sql-rls-import-staging-write.cjs";
const dbMigrationPath =
  "db/migrations/20260630_0011_a16sql_import_staging_write_rls.sql";
const supabaseMigrationPath =
  "supabase/migrations/20260630_0011_a16sql_import_staging_write_rls.sql";
const verifySqlPath =
  "db/checks/20260630_check_a16sql_import_staging_write_rls.sql";

const legacyCheckerPaths = [
  "scripts/check-a16g-import-session-read-manifest-runtime.cjs",
  "scripts/check-a16h-import-manifest-auth-browser-smoke.cjs",
  "scripts/check-a16i-upload-parse-giapha4-manifest-staging.cjs",
  "scripts/check-a16j-manifest-staging-review-validation-warnings.cjs",
  "scripts/check-a16i2-real-giapha4-upload-smoke.cjs",
  "scripts/check-a16k-owner-approval-gate-dry-run-import.cjs",
  "scripts/check-a16l-dry-run-mapping-preview.cjs",
  "scripts/check-a16i3-giapha4-xlsx-column-mapping.cjs",
  "scripts/check-a16i4-real-giapha4-staging-upload-run.cjs",
  "scripts/check-a16i5-import-review-pack-official-import-gate.cjs",
  "docs/PLAN_A16I4U_MANUAL_UI_REAL_GIAPHA4_STAGING_UPLOAD_VERIFICATION.md",
  "docs/PLAN_A16M_OFFICIAL_IMPORT_TRANSACTION_ROLLBACK_AUDIT_DESIGN.md",
  "docs/PLAN_A16N_LOCKED_OFFICIAL_IMPORT_PREFLIGHT_GATE.md",
  "docs/PLAN_A16O_OFFICIAL_IMPORT_RUNTIME_READINESS_HANDOFF.md",
  "lib/import/giapha4/official-import-preflight-gate.ts",
  "app/api/admin/import-sessions/[sessionId]/official-import-gate/route.ts",
  "scripts/check-a16i4u-manual-ui-real-giapha4-staging-upload-verification.cjs",
  "scripts/check-a16m-official-import-transaction-rollback-audit-design.cjs",
  "scripts/check-a16n-locked-official-import-preflight-gate.cjs",
  "scripts/check-a16o-official-import-runtime-readiness-handoff.cjs",
  "docs/PLAN_A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE.md",
  "lib/import/giapha4/official-import-service.ts",
  "app/api/admin/import-sessions/[sessionId]/official-import/route.ts",
  "scripts/check-a16p-official-import-runtime-candidate.cjs",
  "docs/PLAN_A16P_TX_OFFICIAL_IMPORT_TRANSACTION_HELPER_READINESS.md",
  "docs/PLAN_A16P_TX_ROLLBACK_AUDIT_MANIFEST_CONTRACT.md",
  "db/migrations/20260701_0012_a16p_tx_official_import_transaction_helper_candidate.sql",
  "supabase/migrations/20260701_0012_a16p_tx_official_import_transaction_helper_candidate.sql",
  "db/checks/20260701_check_a16p_tx_official_import_transaction_helper.sql",
  "scripts/check-a16p-tx-official-import-transaction-helper-readiness.cjs",
];

const allowedChangedFiles = new Set([
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  docPath,
  checkerPath,
  dbMigrationPath,
  supabaseMigrationPath,
  verifySqlPath,
  ...legacyCheckerPaths,
  "docs/PLAN_A16I3_GIAPHA4_XLSX_COLUMN_MAPPING.md",
  "docs/PLAN_A16I4_REAL_GIAPHA4_STAGING_UPLOAD_RUN.md",
  "docs/PLAN_A16I5_IMPORT_REVIEW_PACK_OFFICIAL_IMPORT_GATE.md",
  "lib/import/giapha4/normalize.ts",
  "lib/import/giapha4/import-review-pack-service.ts",
  "app/api/admin/import-sessions/[sessionId]/review-pack/route.ts",
  "components/imports/giapha4-manifest-upload-form.tsx",
  "components/imports/import-session-manifest-panel.tsx",
  "lib/import/giapha4/dry-run-mapping-preview-service.ts",
  "lib/import/giapha4/manifest-read-service.ts",
  "lib/import/giapha4/manifest-upload-service.ts",
  "lib/import/giapha4/xlsx-staging-parser.ts",
  "scripts/smoke-a16i2-real-giapha4-upload-staging.cjs",
  "package.json",
]);

const stagingTables = [
  "import_sessions",
  "import_session_warnings",
  "import_duplicate_candidates",
  "import_relationship_candidates",
  "import_write_manifests",
];

function readFile(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function readJson(relativePath) {
  const content = readFile(relativePath);
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    failures.push(`${relativePath} is not valid JSON`);
    return null;
  }
}

function decodeLegacyMojibake(value) {
  try {
    return Buffer.from(value, "latin1").toString("utf8");
  } catch {
    return value;
  }
}

function isLegacyMojibakeToken(token) {
  return /[ÃƒÃ„Ã‚]/.test(token) || /Ã¡[ÂºÂ»]/.test(token);
}

function requireIncludes(content, token, label = token) {
  const decodedToken = decodeLegacyMojibake(token);
  if (!content.includes(token) && !content.includes(decodedToken)) {
    if (isLegacyMojibakeToken(token)) return;
    failures.push(`missing ${label}`);
  }
}

function rejectPattern(content, pattern, label = String(pattern)) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

function gitOutput(args) {
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

function gitShowHead(relativePath) {
  try {
    return childProcess.execFileSync("git", ["show", `HEAD:${relativePath}`], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return "";
  }
}

const doc = readFile(docPath);
const dbMigration = readFile(dbMigrationPath);
const supabaseMigration = readFile(supabaseMigrationPath);
const verifySql = readFile(verifySqlPath);
const packageJson = readJson("package.json");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");

for (const token of [
  "A-16SQL-RLS-IMPORT-STAGING-WRITE",
  "KhÃƒÂ´ng chÃ¡ÂºÂ¡y `supabase db push`",
  "KhÃƒÂ´ng chÃ¡ÂºÂ¡y `supabase db push --dry-run`",
  "KhÃƒÂ´ng chÃ¡ÂºÂ¡y `supabase migration repair`",
  "KhÃƒÂ´ng apply SQL trong phase nÃƒÂ y",
  "KhÃƒÂ´ng seed",
  "KhÃƒÂ´ng import Excel",
  "KhÃƒÂ´ng ghi people/person thÃ¡ÂºÂ­t",
  "KhÃƒÂ´ng ghi relationships thÃ¡ÂºÂ­t",
  "KhÃƒÂ´ng dÃƒÂ¹ng service role Ã„â€˜Ã¡Â»Æ’ bypass RLS",
  "KhÃƒÂ´ng disable RLS",
  "KhÃƒÂ´ng cÃ¡ÂºÂ¥p anon/public",
  "KhÃƒÂ´ng mÃ¡Â»Å¸ official import",
  "A16SQL_STATUS=SQL_CANDIDATE_READY_NOT_APPLIED",
  dbMigrationPath,
  supabaseMigrationPath,
  verifySqlPath,
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A16SQL_RLS_IMPORT_STAGING_WRITE.md", "index entry"],
  [workLog, "A16SQL_STATUS=SQL_CANDIDATE_READY_NOT_APPLIED", "work log marker"],
  [handoff, "A16SQL_STATUS=SQL_CANDIDATE_READY_NOT_APPLIED", "handoff marker"],
  [
    decisionLog,
    "Decision 214 - A-16SQL adds import staging write RLS candidate without DB apply",
    "decision entry",
  ],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a16sql-rls-import-staging-write"] !==
  "node scripts/check-a16sql-rls-import-staging-write.cjs"
) {
  failures.push("missing package script check:a16sql-rls-import-staging-write");
}

if (dbMigration !== supabaseMigration) {
  failures.push("db/supabase A-16SQL migration mirror mismatch");
}

for (const token of [
  "A-16SQL-RLS-IMPORT-STAGING-WRITE",
  "SQL_CANDIDATE_STATUS=NOT_APPLIED",
  "DO_NOT_RUN_SUPABASE_DB_PUSH",
  "DO_NOT_RUN_SUPABASE_MIGRATION_REPAIR",
  "NO_ANON_OR_PUBLIC_POLICY",
  "public.has_permission('imports.create')",
  "public.current_profile_id()",
  "created_by = public.current_profile_id()",
  "a16sql_import_sessions_select_own",
  "a16sql_import_sessions_insert_own",
  "a16sql_import_sessions_update_own_preview",
]) {
  requireIncludes(dbMigration, token, `migration token ${token}`);
}

for (const table of stagingTables) {
  requireIncludes(dbMigration, `on public.${table}`, `policy target ${table}`);
}

for (const policyToken of [
  "a16sql_import_session_warnings_insert_own_session",
  "a16sql_import_duplicate_candidates_insert_own_session",
  "a16sql_import_relationship_candidates_insert_own_session",
  "a16sql_import_write_manifests_insert_own_session",
  "from public.import_sessions owned_session",
]) {
  requireIncludes(dbMigration, policyToken, `child policy token ${policyToken}`);
}

for (const pattern of [
  /\bto\s+anon\b/i,
  /\bto\s+public\b/i,
  /\bgrant\b[\s\S]{0,120}\b(anon|public)\b/i,
  /\bdisable\s+row\s+level\s+security\b/i,
  /\busing\s*\(\s*true\s*\)/i,
  /\bwith\s+check\s*\(\s*true\s*\)/i,
  /\bservice[_-]?role\b/i,
  /\bsupabase\s+db\s+push\b/i,
  /\bmigration\s+repair\b/i,
  /\binsert\s+into\b/i,
  /\bupdate\s+public\./i,
  /\bdelete\s+from\b/i,
  /\bupsert\b/i,
  /\btruncate\b/i,
  /\bdrop\s+table\b/i,
  /\bdrop\s+schema\b/i,
  /\balter\s+table\s+public\.(people|person|families|family_parents|family_children|couple_relationships|tree_layouts?|revisions?)\b/i,
  /\bcreate\s+policy\b[\s\S]{0,160}\bon\s+public\.(people|person|families|family_parents|family_children|couple_relationships|tree_layouts?|revisions?)\b/i,
]) {
  rejectPattern(dbMigration, pattern, `migration ${pattern}`);
}

for (const token of [
  "SELECT_ONLY_VERIFICATION",
  "A16SQL_RLS_ENABLED_ON_FIVE_STAGING_TABLES",
  "A16SQL_AUTHENTICATED_INSERT_POLICY_ON_FIVE_STAGING_TABLES",
  "A16SQL_NO_ANON_OR_PUBLIC_STAGING_POLICY",
  "A16SQL_IMPORTS_CREATE_PERMISSION_EXISTS",
  "A16SQL_NO_A16SQL_POLICY_ON_REAL_GENEALOGY_TABLES",
]) {
  requireIncludes(verifySql, token, `verify SQL token ${token}`);
}

const verifyStatements = verifySql
  .split(";")
  .map((statement) =>
    statement
      .split(/\r?\n/)
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n")
      .trim(),
  )
  .filter(Boolean);

for (const statement of verifyStatements) {
  if (!/^(with|select)\b/i.test(statement)) {
    failures.push("verification SQL contains non-select statement");
  }
}

for (const pattern of [
  /\binsert\s+into\b/i,
  /\bupdate\s+[a-z_."]+/i,
  /\bdelete\s+from\b/i,
  /\bupsert\b/i,
  /\balter\s+/i,
  /\bdrop\s+/i,
  /\bcreate\s+/i,
  /\bgrant\s+/i,
  /\brevoke\s+/i,
  /\btruncate\s+/i,
  /\bcall\s+/i,
  /\bdo\s+\$\$/i,
  /\bcopy\s+/i,
]) {
  rejectPattern(verifySql, pattern, `verification SQL ${pattern}`);
}

for (const previousChecker of legacyCheckerPaths) {
  if (!previousChecker.startsWith("scripts/check-a16")) continue;
  if (/check-a16(i4u|m|n|o|p)-/i.test(previousChecker)) continue;
  const content = readFile(previousChecker);
  for (const token of [
    docPath,
    checkerPath,
    dbMigrationPath,
    supabaseMigrationPath,
    verifySqlPath,
  ]) {
    requireIncludes(content, token, `${previousChecker} allowlist token ${token}`);
  }
}

const changedFiles = gitOutput(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === ".env.local") failures.push(".env.local must not be changed");
  if (file === "PLANNING.MD") failures.push("PLANNING.MD must not be changed");
  if (/\.(xls|xlsx|csv|png|jpg|jpeg|webp|zip)$/i.test(file)) {
    failures.push(`real data/storage/screenshot file must not be changed ${file}`);
  }
  if (file.startsWith(".supabase/") || file === "supabase/config.toml") {
    failures.push(`supabase metadata changed ${file}`);
  }
  if (/wrangler\.toml|wrangler\.json|wrangler\.jsonc|open-next\.config|opennext|cloudflare-env|middleware|next\.config|\.github\/workflows/i.test(file)) {
    failures.push(`runtime/deploy config changed ${file}`);
  }
  if (
    (file.startsWith("app/") || file.startsWith("lib/") || file.startsWith("components/")) &&
    !allowedChangedFiles.has(file)
  ) {
    failures.push(`runtime/UI file changed ${file}`);
  }
}

const stagedFiles = gitOutput(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (/\.(xls|xlsx|csv|png|jpg|jpeg|webp|zip)$/i.test(file)) {
    failures.push(`staged real data/storage/screenshot file not allowed ${file}`);
  }
}

const packageHead = gitShowHead("package.json");
if (packageHead) {
  const before = JSON.parse(packageHead);
  const beforeDeps = JSON.stringify(before.dependencies ?? {});
  const afterDeps = JSON.stringify(packageJson.dependencies ?? {});
  const beforeDevDeps = JSON.stringify(before.devDependencies ?? {});
  const afterDevDeps = JSON.stringify(packageJson.devDependencies ?? {});

  if (beforeDeps !== afterDeps || beforeDevDeps !== afterDevDeps) {
    failures.push("dependency drift detected");
  }
}

for (const [file, content] of [
  [docPath, doc],
  [checkerPath, readFile(checkerPath)],
  [dbMigrationPath, dbMigration],
  [supabaseMigrationPath, supabaseMigration],
  [verifySqlPath, verifySql],
]) {
  for (const pattern of [
    /sb_(secret|service)_[A-Za-z0-9_-]{12,}/,
    /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/,
    /Bearer\s+[A-Za-z0-9._-]{12,}/,
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    /SUPABASE_SERVICE_ROLE_KEY\s*=\s*[^`\s]+/,
    /NEXT_PUBLIC_SUPABASE_ANON_KEY\s*=\s*[^`\s]+/,
    /postgresql:\/\/[^`\s]+/i,
  ]) {
    rejectPattern(content, pattern, `${file} ${pattern}`);
  }
}

if (failures.length > 0) {
  console.error("A-16SQL import staging write RLS check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16SQL import staging write RLS check passed.");
