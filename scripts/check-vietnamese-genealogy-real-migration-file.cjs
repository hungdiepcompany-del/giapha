const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];
const migrationPath = "db/migrations/20260618_0008_vietnamese_genealogy_first_migration.sql";
const migrationAbsolutePath = path.join(root, migrationPath);

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

function rejectPattern(content, pattern, label) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

function gitStatus(pathspec) {
  try {
    return childProcess.execFileSync("git", ["status", "--short", "--", pathspec], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch {
    failures.push(`git status failed for ${pathspec}`);
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

function listSqlMigrationsWithMarker(marker) {
  const migrationsDir = path.join(root, "db", "migrations");
  if (!fs.existsSync(migrationsDir)) return [];

  return fs
    .readdirSync(migrationsDir)
    .filter((fileName) => fileName.endsWith(".sql"))
    .filter((fileName) => {
      const content = fs.readFileSync(path.join(migrationsDir, fileName), "utf8");
      return content.includes(marker);
    });
}

const migration = readFile(migrationPath);
const phaseDoc = readFile("docs/111_VIETNAMESE_GENEALOGY_REAL_MIGRATION_FILE.md");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = readJson("package.json");

const markerFiles = listSqlMigrationsWithMarker("VIETNAMESE_GENEALOGY_PHASE_111_REAL_MIGRATION");
if (markerFiles.length !== 1 || markerFiles[0] !== path.basename(migrationPath)) {
  failures.push(
    `expected exactly one Phase 111 migration marker in ${migrationPath}, found ${markerFiles.join(", ") || "none"}`,
  );
}

for (const token of [
  "VIETNAMESE_GENEALOGY_PHASE_111_REAL_MIGRATION",
  "OWNER_APPROVED_FILE_CREATION_ONLY",
  "DO_NOT_APPLY_WITHOUT_SEPARATE_PHASE_113_APPROVAL",
]) {
  requireIncludes(migration, token, `migration marker ${token}`);
}

for (const table of [
  "clans",
  "clan_branches",
  "generation_rules",
  "person_branch_memberships",
]) {
  requireIncludes(
    migration,
    `create table if not exists public.${table}`,
    `approved table ${table}`,
  );
  requireIncludes(
    migration,
    `alter table public.${table} enable row level security`,
    `RLS enabled for ${table}`,
  );
  requireIncludes(migration, `on public.${table}`, `policy block for ${table}`);
}

for (const forbidden of [
  "person_names",
  "person_life_events",
  "person_burials",
  "person_media",
]) {
  rejectPattern(migration, new RegExp(`\\b${forbidden}\\b`, "i"), `forbidden table ${forbidden}`);
}

for (const pattern of [
  /\bDROP\s+TABLE\b/i,
  /\bDROP\s+COLUMN\b/i,
  /\bTRUNCATE\b/i,
  /\bDELETE\s+FROM\b/i,
  /\bALTER\s+TYPE\b/i,
  /\bALTER\s+TABLE\b[^;\n]*(?:DROP|ALTER\s+COLUMN|RENAME\s+COLUMN|RENAME\s+TO|TYPE)\b/i,
  /\bUPDATE\s+public\.people\b/i,
  /\bUPDATE\s+people\b/i,
  /\bINSERT\s+INTO\s+public\.people\b/i,
  /\bINSERT\s+INTO\s+people\b/i,
  /\bsupabase\s+db\s+push\b/i,
  /\bpsql\b/i,
]) {
  rejectPattern(migration, pattern, `destructive SQL/backfill/apply instruction ${pattern}`);
}

for (const token of [
  "clans_active_code_unique",
  "clan_branches_active_code_per_clan_unique",
  "person_branch_memberships_active_primary_person_unique",
  "generation_rules_branch_same_clan_fk",
  "person_branch_memberships_branch_same_clan_fk",
  "public.has_permission('people.view')",
  "public.has_permission('tree.view')",
  "public.has_permission('people.update')",
  "public.has_permission('relationships.update')",
  "public.has_permission('tree.edit_layout')",
  "public.has_permission('settings.manage')",
]) {
  requireIncludes(migration, token, `migration safety token ${token}`);
}

for (const token of [
  "# Phase 111 - Vietnamese Genealogy Real Migration File",
  "REAL_MIGRATION_FILE_CREATED_NOT_APPLIED",
  "Apply status: `NOT_APPLIED`",
  migrationPath,
  "`person_names`",
  "`person_life_events`",
  "`person_burials`",
  "`person_media`",
  "No public-wide direct table policy is added.",
  "Phase 112 Domain Migration Apply Readiness",
]) {
  requireIncludes(phaseDoc, token, `Phase 111 doc token ${token}`);
}

requireIncludes(index, "111_VIETNAMESE_GENEALOGY_REAL_MIGRATION_FILE.md", "index entry");
requireIncludes(workLog, "Phase 111 Vietnamese Genealogy Real Migration File", "work log entry");
requireIncludes(decisionLog, "Decision 131", "decision log entry");
requireIncludes(handoff, "Phase 111 Vietnamese Genealogy Real Migration File completed", "handoff entry");

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (
    scripts["check:vietnamese-genealogy-real-migration-file"] !==
    "node scripts/check-vietnamese-genealogy-real-migration-file.cjs"
  ) {
    failures.push("package.json missing check:vietnamese-genealogy-real-migration-file script");
  }
}

const packageHead = gitShowHead("package.json");
if (packageHead && packageJson) {
  const previousPackage = JSON.parse(packageHead);
  const previousDeps = JSON.stringify(previousPackage.dependencies || {});
  const previousDevDeps = JSON.stringify(previousPackage.devDependencies || {});
  const currentDeps = JSON.stringify(packageJson.dependencies || {});
  const currentDevDeps = JSON.stringify(packageJson.devDependencies || {});

  if (previousDeps !== currentDeps) failures.push("runtime dependencies changed in Phase 111");
  if (previousDevDeps !== currentDevDeps) failures.push("devDependencies changed in Phase 111");
}

const migrationStatus = gitStatus("db/migrations")
  .trim()
  .split(/\r?\n/)
  .filter(Boolean);

for (const line of migrationStatus) {
  const statusPath = line.slice(3).replaceAll("\\", "/");
  if (statusPath !== migrationPath) {
    failures.push(`unexpected migration status outside Phase 111 file: ${line}`);
  }
}

const runtimeStatuses = [
  gitStatus("app"),
  gitStatus("components"),
  gitStatus("lib"),
  gitStatus("server"),
  gitStatus("services"),
  gitStatus("wrangler.toml"),
  gitStatus("open-next.config.ts"),
  gitStatus("next.config.ts"),
].join("");

if (runtimeStatuses.trim()) {
  failures.push(`runtime or deploy surface changed in Phase 111: ${runtimeStatuses.trim()}`);
}

if (!fs.existsSync(migrationAbsolutePath)) {
  failures.push(`missing migration file at ${migrationPath}`);
}

if (failures.length > 0) {
  console.error("Vietnamese genealogy real migration file check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Vietnamese genealogy real migration file check passed.");
