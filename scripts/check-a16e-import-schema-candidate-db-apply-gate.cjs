const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const marker = "A16E_IMPORT_SCHEMA_CANDIDATE_DB_APPLY_GATE";
const docPath = "docs/PLAN_A16E_IMPORT_SCHEMA_CANDIDATE_DB_APPLY_GATE.md";
const checkerPath = "scripts/check-a16e-import-schema-candidate-db-apply-gate.cjs";
const migrationPath = "db/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql";
const a16e1DocPath = "docs/PLAN_A16E1_OWNER_REVIEW_IMPORT_SCHEMA_APPLY_GATE.md";
const a16e1CheckerPath = "scripts/check-a16e1-owner-review-import-schema-apply-gate.cjs";
const a16e2DocPath = "docs/PLAN_A16E2_IMPORT_SCHEMA_CANDIDATE_APPLY_BLOCKER_RESOLUTION.md";
const a16e2CheckerPath = "scripts/check-a16e2-import-schema-candidate-apply-blocker-resolution.cjs";

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
  a16e1DocPath,
  a16e1CheckerPath,
  a16e2DocPath,
  a16e2CheckerPath,
  migrationPath,
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

function stripSqlComments(sql) {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/--.*$/gm, "");
}

const doc = readFile(docPath);
const migration = readFile(migrationPath);
const packageJson = readJson("package.json");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");

for (const token of [
  "A-16E",
  marker,
  "A16E_DB_APPLY_STATUS=NOT_APPLIED",
  "A16E_DB_WRITE_STATUS=NO_DB_WRITE",
  "A16E_HARD_STOP_REASON=MISSING_APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY",
  "APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY",
  "A16E_SQL_CANDIDATE_STATIC_REVIEW=PASS",
  "A16E_RLS_REVIEW=PASS_FAIL_CLOSED",
  "RLS Fail-Closed Review",
  "Migration Apply Prerequisites",
  "Dry-run template",
  "Apply template",
  "Rollback / Fallback Note",
  "A-16E did not apply DB",
  "supabase db push --dry-run --linked",
  "supabase db push --linked",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A16E_IMPORT_SCHEMA_CANDIDATE_DB_APPLY_GATE.md", "index entry"],
  [workLog, marker, "work log marker"],
  [handoff, marker, "handoff marker"],
  [decisionLog, "Decision 197 - A-16E blocks import manifest schema apply until explicit owner marker", "decision entry"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a16e:import-schema-candidate-db-apply-gate"] !==
  "node scripts/check-a16e-import-schema-candidate-db-apply-gate.cjs"
) {
  failures.push("missing package script check:a16e:import-schema-candidate-db-apply-gate");
}

for (const token of [
  "A16D_IMPORT_SCHEMA_CANDIDATE_MANIFEST_STORAGE_DESIGN",
  "DO_NOT_RUN_SUPABASE_DB_PUSH",
  "NO_EXCEL_FILE_STORAGE",
  "create table if not exists public.import_sessions",
  "create table if not exists public.import_session_warnings",
  "create table if not exists public.import_duplicate_candidates",
  "create table if not exists public.import_relationship_candidates",
  "create table if not exists public.import_write_manifests",
  "alter table public.import_sessions enable row level security",
  "alter table public.import_session_warnings enable row level security",
  "alter table public.import_duplicate_candidates enable row level security",
  "alter table public.import_relationship_candidates enable row level security",
  "alter table public.import_write_manifests enable row level security",
]) {
  requireIncludes(migration, token, `migration token ${token}`);
}

const sqlWithoutComments = stripSqlComments(migration);
for (const pattern of [
  /\bdrop\s+table\b/i,
  /\btruncate\b/i,
  /\bdelete\s+from\b/i,
  /\binsert\s+into\b/i,
  /\bupsert\b/i,
  /\bupdate\s+[a-z_".]+\s+set\b/i,
  /\bcreate\s+policy\b/i,
  /\balter\s+table\s+[^;]+disable\s+row\s+level\s+security\b/i,
  /\bgrant\s+/i,
]) {
  rejectPattern(sqlWithoutComments, pattern, `migration ${pattern}`);
}

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
  [migrationPath, migration],
  [checkerPath, readFile(checkerPath)],
]) {
  for (const pattern of [
    /sb_(secret|service)_[A-Za-z0-9_-]{12,}/,
    /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/,
    /Bearer\s+[A-Za-z0-9._-]{12,}/,
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  ]) {
    rejectPattern(content, pattern, `${file} ${pattern}`);
  }
}

if (failures.length > 0) {
  console.error("A-16E import schema candidate DB apply gate check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16E import schema candidate DB apply gate check passed.");
