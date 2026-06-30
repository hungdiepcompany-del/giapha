const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath =
  "docs/PLAN_A16F5M_MANUAL_SQL_APPLY_VERIFICATION_MIGRATION_STATE_RECONCILIATION.md";
const checkerPath =
  "scripts/check-a16f5m-manual-sql-apply-verification-migration-state-reconciliation.cjs";
const sourceMigrationPath = "db/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql";
const mirrorMigrationPath = "supabase/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql";

const allowedChangedFiles = new Set([
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  docPath,
  checkerPath,
  "scripts/check-a16-giapha4-excel-import-mapping-readiness.cjs",
  "scripts/check-a16b-giapha4-excel-import-preview-runtime-ui.cjs",
  "scripts/check-a16c-owner-review-import-preview-db-write-approval-design.cjs",
  "scripts/check-a16d-import-schema-candidate-manifest-storage-design.cjs",
  "scripts/check-a16e-import-schema-candidate-db-apply-gate.cjs",
  "scripts/check-a16e1-owner-review-import-schema-apply-gate.cjs",
  "scripts/check-a16e2-import-schema-candidate-apply-blocker-resolution.cjs",
  "scripts/check-a16f-import-schema-db-apply-verification.cjs",
  "scripts/check-a16f1-supabase-cli-project-link-readiness.cjs",
  "scripts/check-a16f2-supabase-project-link-migration-path-readiness.cjs",
  "scripts/check-a16f3-supabase-metadata-link-migration-path-bridge.cjs",
  "scripts/check-a16f4-supabase-db-dry-run-only.cjs",
  "scripts/check-a16f4r-supabase-db-dry-run-only-rerun.cjs",
  "package.json",
]);

function readFile(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function readBytes(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return Buffer.from("");
  }
  return fs.readFileSync(absolutePath);
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

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
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

function sha256(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex").toUpperCase();
}

const doc = readFile(docPath);
const checker = readFile(checkerPath);
const sourceBytes = readBytes(sourceMigrationPath);
const mirrorBytes = readBytes(mirrorMigrationPath);
const packageJson = readJson("package.json");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");

for (const token of [
  "A-16F5M",
  "A16F5M_STATUS=PASS_MANUAL_SQL_APPLY_VERIFIED_RECONCILIATION_REQUIRED",
  "A16F5M_MANUAL_SQL_APPLY=OWNER_APPLIED_IN_SUPABASE_DASHBOARD",
  "A16F5M_TABLES_EXIST=PASS",
  "A16F5M_RLS_ENABLED=PASS",
  "A16F5M_NO_PUBLIC_ANON_POLICY=PASS",
  "A16F5M_ZERO_SEED_ROWS=PASS",
  "import_sessions",
  "import_session_warnings",
  "import_duplicate_candidates",
  "import_relationship_candidates",
  "import_write_manifests",
  "RLS is enabled",
  "no unintended public/anon policy",
  "row_count = 0",
  "A16F5M_MIGRATION_HISTORY_RISK=MANUAL_SQL_APPLY_NOT_RECORDED_BY_SUPABASE_CLI_HISTORY",
  "A16F5M_RECONCILIATION_REQUIRED=TRUE",
  "Do not run this migration again through `supabase db push`",
  "Do not run the SQL file again",
  "A16F5M_DB_PUSH_STATUS=NOT_RUN",
  "A16F5M_DB_DRY_RUN_STATUS=NOT_RUN",
  "A16F5M_DB_APPLY_STATUS=NOT_RUN_BY_CODEX",
  "A16F5M_SEED_STATUS=NO_SEED",
  "A16F5M_EXCEL_IMPORT_STATUS=NO_EXCEL_IMPORT",
  "A16F5M_PEOPLE_WRITE_STATUS=NO_WRITE",
  "A16F5M_RELATIONSHIP_WRITE_STATUS=NO_WRITE",
  "A16F5M_DATA_WRITE_STATUS=NO_INSERT_UPDATE_DELETE_UPSERT",
  "did not run `supabase db push`",
  "did not run `supabase db push --dry-run`",
  "did not apply DB",
  "did not seed",
  "did not import Excel",
  "did not write `people`",
  "did not write relationships",
  "A16G_GATE_SCHEMA_TABLES_VERIFIED=TRUE",
  "A16G_GATE_RUNTIME_SCOPE=IMPORT_MANIFEST_SESSION_TABLES_ONLY",
  "A16G_GATE_PEOPLE_WRITE=FORBIDDEN",
  "A16G_GATE_RELATIONSHIP_WRITE=FORBIDDEN",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A16F5M_MANUAL_SQL_APPLY_VERIFICATION_MIGRATION_STATE_RECONCILIATION.md", "index entry"],
  [workLog, "A16F5M_STATUS=PASS_MANUAL_SQL_APPLY_VERIFIED_RECONCILIATION_REQUIRED", "work log marker"],
  [handoff, "A16F5M_STATUS=PASS_MANUAL_SQL_APPLY_VERIFIED_RECONCILIATION_REQUIRED", "handoff marker"],
  [
    decisionLog,
    "Decision 206 - A-16F5M accepts owner manual SQL verification while requiring migration history reconciliation",
    "decision entry",
  ],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.[
    "check:a16f5m:manual-sql-apply-verification-migration-state-reconciliation"
  ] !==
  "node scripts/check-a16f5m-manual-sql-apply-verification-migration-state-reconciliation.cjs"
) {
  failures.push(
    "missing package script check:a16f5m:manual-sql-apply-verification-migration-state-reconciliation",
  );
}

if (!sourceBytes.equals(mirrorBytes)) {
  failures.push("source and mirror migration differ byte-for-byte");
}

const expectedHash = "D22593729092FEF43C295126E74D5FDCD41ABD696A08DFEC63218C7E1851ABBE";
if (sha256(sourceBytes) !== expectedHash) failures.push("source migration hash does not match expected");
if (sha256(mirrorBytes) !== expectedHash) failures.push("mirror migration hash does not match expected");

const changedFiles = gitOutput(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === ".env.local") failures.push(".env.local must not be changed");
  if (file === "PLANNING.MD") failures.push("PLANNING.MD must not be changed");
  if (/\.(xls|xlsx|csv)$/i.test(file)) failures.push(`real import file must not be staged ${file}`);
  if (!allowedChangedFiles.has(file) && (file.startsWith("db/") || file.endsWith(".sql"))) {
    failures.push(`database/sql file changed ${file}`);
  }
  if (
    !allowedChangedFiles.has(file) &&
    (file.startsWith("supabase/") || file.startsWith(".supabase/"))
  ) {
    failures.push(`unexpected supabase metadata changed ${file}`);
  }
  if (/storage-state|storage_state|cookie|token|secret|\.env|\.png$|\.jpg$|\.jpeg$|\.webp$/i.test(file)) {
    failures.push(`possible secret/session/evidence artifact changed ${file}`);
  }
  if (
    /wrangler\.toml|wrangler\.json|wrangler\.jsonc|open-next\.config|opennext|cloudflare-env|middleware|next\.config|\.github\/workflows/i.test(
      file,
    )
  ) {
    failures.push(`runtime/deploy config changed ${file}`);
  }
  if (
    !allowedChangedFiles.has(file) &&
    (file.startsWith("app/api/") ||
      file.startsWith("app/actions") ||
      file.startsWith("lib/") ||
      file.startsWith("server/") ||
      file.startsWith("services/") ||
      file.startsWith("pages/"))
  ) {
    failures.push(`API/service/runtime file changed ${file}`);
  }
}

const stagedDataFiles = gitOutput(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter((file) => /\.(xls|xlsx|csv)$/i.test(file));
for (const file of stagedDataFiles) {
  failures.push(`staged real import file not allowed ${file}`);
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
  [checkerPath, checker],
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

for (const pattern of [
  /\bA16F5M_DB_APPLY_STATUS=PASS\b/,
  /\bA16F5M_DB_PUSH_STATUS=PASS\b/,
  /\bA16F5M_DB_DRY_RUN_STATUS=PASS\b/,
  /\bA16F5M_EXCEL_IMPORT_STATUS=PASS\b/,
  /\bA16F5M_PEOPLE_WRITE_STATUS=PASS\b/,
  /\bA16F5M_RELATIONSHIP_WRITE_STATUS=PASS\b/,
]) {
  rejectPattern(doc, pattern, `doc ${pattern}`);
}

if (failures.length > 0) {
  console.error("A-16F5M manual SQL apply verification reconciliation check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16F5M manual SQL apply verification reconciliation check passed.");
