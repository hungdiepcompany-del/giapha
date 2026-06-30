const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16I2_REAL_GIAPHA4_UPLOAD_SMOKE.md";
const smokePath = "scripts/smoke-a16i2-real-giapha4-upload-staging.cjs";
const checkerPath = "scripts/check-a16i2-real-giapha4-upload-smoke.cjs";

const allowedChangedFiles = new Set([
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  docPath,
  smokePath,
  checkerPath,
  "scripts/check-a16g-import-session-read-manifest-runtime.cjs",
  "scripts/check-a16h-import-manifest-auth-browser-smoke.cjs",
  "scripts/check-a16i-upload-parse-giapha4-manifest-staging.cjs",
  "scripts/check-a16j-manifest-staging-review-validation-warnings.cjs",
  "docs/PLAN_A16K_OWNER_APPROVAL_GATE_DRY_RUN_IMPORT.md",
  "lib/import/giapha4/import-dry-run-approval-gate.ts",
  "app/api/admin/import-sessions/[sessionId]/dry-run-gate/route.ts",
  "components/imports/import-session-manifest-panel.tsx",
  "scripts/check-a16k-owner-approval-gate-dry-run-import.cjs",
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
const smoke = readFile(smokePath);
const checker = readFile(checkerPath);
const packageJson = readJson("package.json");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const a16gChecker = readFile(
  "scripts/check-a16g-import-session-read-manifest-runtime.cjs",
);
const a16hChecker = readFile(
  "scripts/check-a16h-import-manifest-auth-browser-smoke.cjs",
);
const a16iChecker = readFile(
  "scripts/check-a16i-upload-parse-giapha4-manifest-staging.cjs",
);
const a16jChecker = readFile(
  "scripts/check-a16j-manifest-staging-review-validation-warnings.cjs",
);
const uploadForm = readFile("components/imports/giapha4-manifest-upload-form.tsx");

for (const token of [
  "A-16I2",
  "A16I2_REAL_GIAPHA4_UPLOAD_SMOKE",
  "A16I2_GIAPHA4_REAL_UPLOAD_BASE_URL",
  "A16I2_GIAPHA4_REAL_UPLOAD_STORAGE_STATE",
  "A16I2_GIAPHA4_REAL_FILE_PATH",
  "SAFE_SKIP_MISSING_EXPLICIT_ENV",
  "SAFE_SKIP_MISSING_REAL_FILE",
  "FAIL_REAL_FILE_INSIDE_REPO",
  "SAFE_SKIP_UNSUPPORTED_XLS",
  ".xlsx",
  ".xls",
  "chỉ manifest staging/session staging",
  "không ghi people/person thật",
  "không ghi relationships thật",
  "không cập nhật layout/tree/revision thật",
  "không mở official import",
  "không log dữ liệu cá nhân thô",
  "Không migration",
  "Không DB push",
  "Không SQL apply",
  "Không seed",
  "Không deploy",
  "Không push",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "printStatus(\"SAFE_SKIP_MISSING_EXPLICIT_ENV\"",
  "printStatus(\"FAIL_REAL_FILE_INSIDE_REPO\"",
  "printStatus(\"SAFE_SKIP_UNSUPPORTED_XLS\"",
  "printStatus(\"PASS\"",
  "A16I2_GIAPHA4_REAL_UPLOAD_BASE_URL",
  "A16I2_GIAPHA4_REAL_UPLOAD_STORAGE_STATE",
  "A16I2_GIAPHA4_REAL_FILE_PATH",
  "fs.existsSync(realFilePath)",
  "isInside(rootResolved, realFilePath)",
  "gitTracked(relative)",
  "setInputFiles(realFilePath)",
  "/api/admin/import-sessions/upload",
  "mutationAllowed",
  "hasDangerousAction",
  "confirm|commit|finalize|official-import|import-now|apply|write-real-tree",
  "counts_available: false",
  "warning_codes",
]) {
  requireIncludes(smoke, token, `smoke token ${token}`);
}

if (
  packageJson?.scripts?.["smoke:a16i2-real-giapha4-upload-staging"] !==
  "node scripts/smoke-a16i2-real-giapha4-upload-staging.cjs"
) {
  failures.push("missing package script smoke:a16i2-real-giapha4-upload-staging");
}

if (
  packageJson?.scripts?.["check:a16i2-real-giapha4-upload-smoke"] !==
  "node scripts/check-a16i2-real-giapha4-upload-smoke.cjs"
) {
  failures.push("missing package script check:a16i2-real-giapha4-upload-smoke");
}

for (const [content, token, label] of [
  [index, "PLAN_A16I2_REAL_GIAPHA4_UPLOAD_SMOKE.md", "index entry"],
  [workLog, "A16I2_REAL_GIAPHA4_UPLOAD_SMOKE", "work log marker"],
  [handoff, "A16I2_REAL_GIAPHA4_UPLOAD_SMOKE", "handoff marker"],
  [
    decisionLog,
    "Decision 211 - A-16I2 real file upload smoke stays staging-only and explicit-env gated",
    "decision entry",
  ],
]) {
  requireIncludes(content, token, label);
}

for (const token of [docPath, smokePath, checkerPath]) {
  requireIncludes(a16gChecker, token, `A-16G checker allowlist token ${token}`);
  requireIncludes(a16hChecker, token, `A-16H checker allowlist token ${token}`);
  requireIncludes(a16iChecker, token, `A-16I checker allowlist token ${token}`);
  requireIncludes(a16jChecker, token, `A-16J checker allowlist token ${token}`);
}

rejectPattern(smoke, /fileChooser\.setFiles/i, "automated fileChooser.setFiles");
rejectPattern(smoke, /D:\\DATA\\PRIVATE|Pham Van\.xlsx/i, "hardcoded real file example");
rejectPattern(smoke, /console\.log\((bodyText|refreshedText|uploadJson|manifestJson|validationJson)\)/, "raw data log");
rejectPattern(smoke, /rawRows|rowData|fullName.*console\.log|birthDateText.*console\.log|homeTown.*console\.log/i, "raw personal row logging");
rejectPattern(uploadForm, /SUPABASE_SERVICE_ROLE_KEY|service_role/i, "service role in client component");

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
  /export\s+async\s+function\s+(POST|PUT|PATCH|DELETE)\b[\s\S]{0,200}(confirm|commit|finalize|official-import|import-now)/i,
]) {
  rejectPattern(smoke + checker, pattern, `A-16I2 script ${pattern}`);
}

for (const [file, content] of [
  [docPath, doc],
  [smokePath, smoke],
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
  if (file.startsWith("db/migrations/") || file.startsWith("supabase/migrations/")) {
    failures.push(`migration file changed ${file}`);
  }
  if (file.startsWith(".supabase/") || file === "supabase/config.toml") {
    failures.push(`supabase metadata changed ${file}`);
  }
  if (/wrangler\.toml|wrangler\.json|wrangler\.jsonc|open-next\.config|opennext|cloudflare-env|middleware|next\.config|\.github\/workflows/i.test(file)) {
    failures.push(`runtime/deploy config changed ${file}`);
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

const trackedSensitiveFiles = gitOutput(["ls-files"])
  .split(/\r?\n/)
  .filter(Boolean)
  .filter((file) => /\.(xls|xlsx|csv)$/i.test(file));
for (const file of trackedSensitiveFiles) {
  if (!file.startsWith("test-fixtures/") && !file.startsWith("fixtures/")) {
    failures.push(`tracked real spreadsheet-like file outside fixture path ${file}`);
  }
}

if (failures.length > 0) {
  console.error("A-16I2 real Gia Pha 4 upload smoke check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16I2 real Gia Pha 4 upload smoke check passed.");
