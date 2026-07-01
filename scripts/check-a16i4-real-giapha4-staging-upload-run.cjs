const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16I4_REAL_GIAPHA4_STAGING_UPLOAD_RUN.md";
const checkerPath = "scripts/check-a16i4-real-giapha4-staging-upload-run.cjs";
const smokePath = "scripts/smoke-a16i2-real-giapha4-upload-staging.cjs";
const a16sqlAllowlistTokens = [
  "docs/PLAN_A16SQL_RLS_IMPORT_STAGING_WRITE.md",
  "scripts/check-a16sql-rls-import-staging-write.cjs",
  "db/migrations/20260630_0011_a16sql_import_staging_write_rls.sql",
  "supabase/migrations/20260630_0011_a16sql_import_staging_write_rls.sql",
  "db/checks/20260630_check_a16sql_import_staging_write_rls.sql",
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

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

function rejectPattern(content, pattern, label = String(pattern)) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

const doc = readFile(docPath);
const checker = readFile(checkerPath);
const smoke = readFile(smokePath);
const packageJson = readJson("package.json");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of a16sqlAllowlistTokens) {
  requireIncludes(checker, token, `A-16SQL allowlist token ${token}`);
}

for (const token of [
  "A-16I4",
  "A16I2_GIAPHA4_REAL_UPLOAD_BASE_URL",
  "A16I2_GIAPHA4_REAL_UPLOAD_STORAGE_STATE",
  "A16I2_GIAPHA4_REAL_FILE_PATH",
  "SAFE_SKIP_MISSING_EXPLICIT_ENV",
  "AUTH_SESSION_MISSING",
  "PERMISSION_IMPORTS_CREATE_MISSING",
  "RLS_STAGING_WRITE_BLOCKED",
  "PARSER_HEADER_MISSING",
  "PARSER_SHEET_MISSING",
  "PARSER_UNSUPPORTED_XLS",
  "NETWORK_OR_BASE_URL_ERROR",
  "UNKNOWN_UPLOAD_ERROR",
  "can_proceed_to_official_import=false",
  "A16I4_STATUS=REAL_STAGING_UPLOAD_SMOKE_READY_OR_SAFE_SKIP",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "classifyUploadFailure",
  "classifyFailure",
  "reason_code",
  "AUTH_SESSION_MISSING",
  "PERMISSION_IMPORTS_CREATE_MISSING",
  "RLS_STAGING_WRITE_BLOCKED",
  "PARSER_HEADER_MISSING",
  "PARSER_SHEET_MISSING",
  "PARSER_UNSUPPORTED_XLS",
  "NETWORK_OR_BASE_URL_ERROR",
  "UNKNOWN_UPLOAD_ERROR",
  "/api/admin/import-sessions/upload",
  "/api/admin/import-sessions/${sessionId}/validation",
  "/api/admin/import-sessions/${sessionId}/dry-run-preview",
  "can_proceed_to_official_import",
  "counts_available: false",
]) {
  requireIncludes(smoke, token, `smoke token ${token}`);
}

if (
  packageJson?.scripts?.["check:a16i4-real-giapha4-staging-upload-run"] !==
  "node scripts/check-a16i4-real-giapha4-staging-upload-run.cjs"
) {
  failures.push("missing package script check:a16i4-real-giapha4-staging-upload-run");
}

for (const [content, token, label] of [
  [index, "PLAN_A16I4_REAL_GIAPHA4_STAGING_UPLOAD_RUN.md", "index entry"],
  [
    workLog,
    "A16I4_STATUS=REAL_STAGING_UPLOAD_SMOKE_READY_OR_SAFE_SKIP",
    "work log marker",
  ],
  [
    handoff,
    "A16I4_STATUS=REAL_STAGING_UPLOAD_SMOKE_READY_OR_SAFE_SKIP",
    "handoff marker",
  ],
]) {
  requireIncludes(content, token, label);
}

const stagedDataFiles = gitOutput(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter((file) => /\.(xls|xlsx|csv|json)$/i.test(file) && file !== "package.json");
for (const file of stagedDataFiles) failures.push(`staged real data/storage file ${file}`);

const changedFiles = gitOutput(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);
for (const file of changedFiles) {
  if (file === ".env.local") failures.push(".env.local must not be changed");
  if (/\.(xls|xlsx|csv|png|jpg|jpeg|webp|zip)$/i.test(file)) {
    failures.push(`real data/screenshot file changed ${file}`);
  }
  if (
    file.startsWith("db/migrations/") ||
    file.startsWith("supabase/migrations/")
  ) {
    failures.push(`migration file changed ${file}`);
  }
}

for (const pattern of [
  /\bsupabase\s+db\s+push\b/i,
  /\bmigration\s+repair\b/i,
]) {
  rejectPattern(smoke, pattern, `smoke ${pattern}`);
}

for (const [file, content] of [
  [docPath, doc],
  [checkerPath, checker],
  [smokePath, smoke],
]) {
  for (const pattern of [
    /sb_(secret|service)_[A-Za-z0-9_-]{12,}/,
    /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/,
    /Bearer\s+[A-Za-z0-9._-]{12,}/,
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    /SUPABASE_SERVICE_ROLE_KEY\s*=\s*[^`\s]+/,
    /postgresql:\/\/[^`\s]+/i,
  ]) {
    rejectPattern(content, pattern, `${file} ${pattern}`);
  }
}

if (failures.length > 0) {
  console.error("A-16I4 real Gia Pha 4 staging upload run check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16I4 real Gia Pha 4 staging upload run check passed.");
