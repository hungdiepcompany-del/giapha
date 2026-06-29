const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16F2_SUPABASE_PROJECT_LINK_MIGRATION_PATH_READINESS.md";
const checkerPath = "scripts/check-a16f2-supabase-project-link-migration-path-readiness.cjs";

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

const doc = readFile(docPath);
const checker = readFile(checkerPath);
const packageJson = readJson("package.json");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");

for (const token of [
  "A-16F2",
  "A16F2_SUPABASE_PROJECT_LINK_MIGRATION_PATH_READINESS_RECORDED",
  "A16F2_STATUS=SAFE_SKIP_OR_BLOCKED",
  "A16F2_NPX_SUPABASE_CLI=AVAILABLE_VERSION_2_108_0",
  "A16F2_OWNER_CONFIRMED_PROJECT_REF=frkyeuxrlcflmsxxsolp",
  "A16F2_PROJECT_LINK_READINESS=BLOCKED_NOT_LINKED",
  "A16F2_MIGRATION_PATH_READINESS=BLOCKED_PATH_STRATEGY_NOT_APPLIED",
  "A16F2_DB_PUSH_STATUS=NOT_RUN",
  "A16F2_DB_DRY_RUN_STATUS=NOT_RUN",
  "A16F2_DB_APPLY_STATUS=NOT_RUN",
  "A16F2_SEED_STATUS=NO_SEED",
  "A16F2_DATA_WRITE_STATUS=NO_INSERT_UPDATE_DELETE_UPSERT",
  "A16F2_EXCEL_IMPORT_STATUS=NO_EXCEL_IMPORT",
  "frkyeuxrlcflmsxxsolp",
  "npx --yes supabase --version",
  "npx --yes supabase link --project-ref frkyeuxrlcflmsxxsolp",
  "db/migrations",
  "supabase/migrations",
  "A16F2_A16F3_RECOMMENDATION=CREATE_SUPABASE_METADATA_AND_BRIDGE_CANDIDATE_WITH_EXPLICIT_CHECKER",
  "did not run `supabase db push`",
  "did not run `supabase db push --dry-run --linked`",
  "APPROVE_A16F_GIAPHA4_IMPORT_SCHEMA_DB_APPLY",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A16F2_SUPABASE_PROJECT_LINK_MIGRATION_PATH_READINESS.md", "index entry"],
  [workLog, "A16F2_SUPABASE_PROJECT_LINK_MIGRATION_PATH_READINESS_RECORDED", "work log marker"],
  [handoff, "A16F2_SUPABASE_PROJECT_LINK_MIGRATION_PATH_READINESS_RECORDED", "handoff marker"],
  [decisionLog, "Decision 202 - A-16F2 records project ref but keeps DB apply blocked until link and migration path are bridged", "decision entry"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a16f2:supabase-project-link-migration-path-readiness"] !==
  "node scripts/check-a16f2-supabase-project-link-migration-path-readiness.cjs"
) {
  failures.push("missing package script check:a16f2:supabase-project-link-migration-path-readiness");
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
  if (!allowedChangedFiles.has(file) && (file.startsWith("supabase/") || file.startsWith(".supabase/"))) {
    failures.push(`supabase metadata changed unexpectedly ${file}`);
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
  ]) {
    rejectPattern(content, pattern, `${file} ${pattern}`);
  }
}

for (const pattern of [
  /\bA16F2_STATUS=PASS\b/,
  /\bA16F2_PROJECT_LINK_READINESS=PASS\b/,
  /\bA16F2_DB_APPLY_STATUS=PASS\b/,
  /\bA16F2_DB_DRY_RUN_STATUS=PASS\b/,
]) {
  rejectPattern(doc, pattern, `doc ${pattern}`);
}

if (failures.length > 0) {
  console.error("A-16F2 Supabase project link migration path readiness check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16F2 Supabase project link migration path readiness check passed.");
