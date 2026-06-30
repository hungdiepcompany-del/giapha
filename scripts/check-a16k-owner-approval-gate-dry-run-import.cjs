const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16K_OWNER_APPROVAL_GATE_DRY_RUN_IMPORT.md";
const checkerPath = "scripts/check-a16k-owner-approval-gate-dry-run-import.cjs";
const gateServicePath = "lib/import/giapha4/import-dry-run-approval-gate.ts";
const gateRoutePath =
  "app/api/admin/import-sessions/[sessionId]/dry-run-gate/route.ts";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const a16sqlAllowedSqlFiles = new Set([
  "db/migrations/20260630_0011_a16sql_import_staging_write_rls.sql",
  "supabase/migrations/20260630_0011_a16sql_import_staging_write_rls.sql",
]);

const allowedChangedFiles = new Set([
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  docPath,
  checkerPath,
  gateServicePath,
  gateRoutePath,
  panelPath,
  "docs/PLAN_A16L_DRY_RUN_MAPPING_PREVIEW.md",
  "lib/import/giapha4/dry-run-mapping-preview-service.ts",
  "app/api/admin/import-sessions/[sessionId]/dry-run-preview/route.ts",
  "scripts/check-a16l-dry-run-mapping-preview.cjs",
  "scripts/check-a16g-import-session-read-manifest-runtime.cjs",
  "scripts/check-a16h-import-manifest-auth-browser-smoke.cjs",
  "scripts/check-a16i-upload-parse-giapha4-manifest-staging.cjs",
  "scripts/check-a16j-manifest-staging-review-validation-warnings.cjs",
  "scripts/check-a16i2-real-giapha4-upload-smoke.cjs",
  "docs/PLAN_A16SQL_RLS_IMPORT_STAGING_WRITE.md",
  "scripts/check-a16sql-rls-import-staging-write.cjs",
  "db/migrations/20260630_0011_a16sql_import_staging_write_rls.sql",
  "supabase/migrations/20260630_0011_a16sql_import_staging_write_rls.sql",
  "db/checks/20260630_check_a16sql_import_staging_write_rls.sql",
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
const gateService = readFile(gateServicePath);
const gateRoute = readFile(gateRoutePath);
const panel = readFile(panelPath);
const packageJson = readJson("package.json");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");

for (const token of [
  "A-16K",
  "A16K_OWNER_APPROVAL_GATE_DRY_RUN_IMPORT",
  "APPROVE_A16K_IMPORT_DRY_RUN_GATE",
  "Dry-run hiện vẫn locked",
  "Official import vẫn closed",
  "Không migration",
  "Không DB push",
  "Không SQL apply",
  "Không seed",
  "Không upload/parse file thật",
  "Không ghi people/relationships thật",
  "Không layout/tree/revision",
  "Không dry-run mapping",
  "Không official import",
  "A16K_STATUS=OWNER_APPROVAL_GATE_LOCKED",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "server-only",
  "A16K_OWNER_APPROVAL_GATE_MARKER",
  "A16K_IMPORT_DRY_RUN_REQUIRED_MARKER",
  "APPROVE_A16K_IMPORT_DRY_RUN_GATE",
  "status: \"locked\"",
  "canRunDryRun: false",
  "dryRunMappingOpen: false",
  "officialImportOpen: false",
  "dbWrite: false",
  "peopleWrite: false",
  "relationshipWrite: false",
  "treeLayoutWrite: false",
  "revisionWrite: false",
]) {
  requireIncludes(gateService, token, `gate service token ${token}`);
}

for (const token of [
  "export async function GET",
  "getImportDryRunApprovalGate",
  "sessionId",
]) {
  requireIncludes(gateRoute, token, `gate route token ${token}`);
}

rejectPattern(
  gateRoute,
  /export\s+async\s+function\s+(POST|PUT|PATCH|DELETE)\b/,
  "dry-run gate mutation handler",
);

for (const token of [
  "Cổng phê duyệt dry-run",
  "Dry-run import chưa được mở",
  "Cần owner phê duyệt trước khi chạy dry-run.",
  "Marker yêu cầu:",
  "Dữ liệu staging vẫn",
  "chưa được nhập vào cây gia phả thật",
  "Chạy dry-run — cần phê duyệt",
  "disabled",
  "aria-disabled=\"true\"",
  "Xác nhận nhập chính thức — chưa mở",
]) {
  requireIncludes(panel, token, `UI token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A16K_OWNER_APPROVAL_GATE_DRY_RUN_IMPORT.md", "index entry"],
  [workLog, "A16K_OWNER_APPROVAL_GATE_DRY_RUN_IMPORT", "work log marker"],
  [handoff, "A16K_OWNER_APPROVAL_GATE_DRY_RUN_IMPORT", "handoff marker"],
  [
    decisionLog,
    "Decision 212 - A-16K keeps dry-run import locked behind owner approval marker",
    "decision entry",
  ],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a16k-owner-approval-gate-dry-run-import"] !==
  "node scripts/check-a16k-owner-approval-gate-dry-run-import.cjs"
) {
  failures.push("missing package script check:a16k-owner-approval-gate-dry-run-import");
}

for (const previousChecker of [
  "scripts/check-a16g-import-session-read-manifest-runtime.cjs",
  "scripts/check-a16h-import-manifest-auth-browser-smoke.cjs",
  "scripts/check-a16i-upload-parse-giapha4-manifest-staging.cjs",
  "scripts/check-a16j-manifest-staging-review-validation-warnings.cjs",
  "scripts/check-a16i2-real-giapha4-upload-smoke.cjs",
]) {
  const content = readFile(previousChecker);
  for (const token of [docPath, checkerPath, gateServicePath, gateRoutePath]) {
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
  if (
    /\.(xls|xlsx|csv|png|jpg|jpeg|webp|zip)$/i.test(file) ||
    (/\.json$/i.test(file) && file !== "package.json")
  ) {
    failures.push(`real data/storage/screenshot file must not be changed ${file}`);
  }
  if (
    (file.startsWith("db/migrations/") ||
      file.startsWith("supabase/migrations/")) &&
    !a16sqlAllowedSqlFiles.has(file)
  ) {
    failures.push(`migration file changed ${file}`);
  }
  if (file.startsWith(".supabase/") || file === "supabase/config.toml") {
    failures.push(`supabase metadata changed ${file}`);
  }
  if (/wrangler\.toml|wrangler\.json|wrangler\.jsonc|open-next\.config|opennext|cloudflare-env|middleware|next\.config|\.github\/workflows/i.test(file)) {
    failures.push(`runtime/deploy config changed ${file}`);
  }
  if (
    file.startsWith("app/api/") &&
    file !== gateRoutePath &&
    file !== "app/api/admin/import-sessions/[sessionId]/dry-run-preview/route.ts"
  ) {
    failures.push(`unexpected API route changed ${file}`);
  }
}

const stagedSensitiveFiles = gitOutput(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(
    (file) =>
      /\.(xls|xlsx|csv|png|jpg|jpeg|webp|zip)$/i.test(file) ||
      (/\.json$/i.test(file) && file !== "package.json"),
  );
for (const file of stagedSensitiveFiles) {
  failures.push(`staged real data/storage/screenshot file not allowed ${file}`);
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

const runtimePatch = gitOutput([
  "diff",
  "--",
  gateServicePath,
  gateRoutePath,
  panelPath,
]);

for (const pattern of [
  /\bsupabase\s+db\s+push\b/i,
  /\bmigration\s+repair\b/i,
  /\bCREATE\s+TABLE\b/i,
  /\bALTER\s+TABLE\b/i,
  /\bDROP\s+TABLE\b/i,
  /\bINSERT\s+INTO\b/i,
  /\bUPDATE\s+[a-z_]/i,
  /\bDELETE\s+FROM\b/i,
  /\.from\(["']people["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']person["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']relationships?["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']families["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']family_parents["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']family_children["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']couple_relationships["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']tree_layouts?["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']revisions?["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\b(confirm|commit|finalize|official-import|import-now|write-real-tree)\b/i,
  /\b(runDryRunImport|executeDryRun|createDryRunResult|applyDryRunMapping)\b/i,
]) {
  rejectPattern(runtimePatch, pattern, `runtime patch ${pattern}`);
}

for (const [file, content] of [
  [docPath, doc],
  [checkerPath, checker],
  [gateServicePath, gateService],
  [gateRoutePath, gateRoute],
  [panelPath, panel],
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
  console.error("A-16K owner approval gate dry-run import check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16K owner approval gate dry-run import check passed.");
