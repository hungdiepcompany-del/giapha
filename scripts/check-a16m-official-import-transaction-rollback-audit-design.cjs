const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];
const docPath =
  "docs/PLAN_A16M_OFFICIAL_IMPORT_TRANSACTION_ROLLBACK_AUDIT_DESIGN.md";
const checkerPath =
  "scripts/check-a16m-official-import-transaction-rollback-audit-design.cjs";
const allowedA16pTxSqlFiles = new Set([
  "db/migrations/20260701_0012_a16p_tx_official_import_transaction_helper_candidate.sql",
  "supabase/migrations/20260701_0012_a16p_tx_official_import_transaction_helper_candidate.sql",
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
const packageJson = readJson("package.json");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16M",
  "Transaction All-Or-Nothing Design",
  "rollback manifest",
  "Audit / Revision Design",
  "Failure / No-Go Conditions",
  "duplicate/conflict",
  "Graph Validation Policy",
  "APPROVE_A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE",
  "Marker này chỉ là requirement tương lai",
  "Không tạo route này trong A-16M",
  "Không tạo service write runtime này trong A-16M",
  "A16M_STATUS=OFFICIAL_IMPORT_DESIGN_READY_RUNTIME_NOT_OPENED",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

if (
  packageJson?.scripts?.[
    "check:a16m-official-import-transaction-rollback-audit-design"
  ] !==
  "node scripts/check-a16m-official-import-transaction-rollback-audit-design.cjs"
) {
  failures.push("missing package script check:a16m-official-import-transaction-rollback-audit-design");
}

for (const [content, token, label] of [
  [index, "PLAN_A16M_OFFICIAL_IMPORT_TRANSACTION_ROLLBACK_AUDIT_DESIGN.md", "index entry"],
  [workLog, "A16M_STATUS=OFFICIAL_IMPORT_DESIGN_READY_RUNTIME_NOT_OPENED", "work log marker"],
  [handoff, "A16M_STATUS=OFFICIAL_IMPORT_DESIGN_READY_RUNTIME_NOT_OPENED", "handoff marker"],
]) {
  requireIncludes(content, token, label);
}

const changedFiles = gitOutput(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);
for (const file of changedFiles) {
  if (
    (file.startsWith("db/migrations/") || file.startsWith("supabase/migrations/")) &&
    !allowedA16pTxSqlFiles.has(file)
  ) {
    failures.push(`migration file changed ${file}`);
  }
  if (/official-import-service\.ts$/.test(file) && file !== "lib/import/giapha4/official-import-service.ts") {
    failures.push(`official import write service changed ${file}`);
  }
  if (
    /app\/api\/.*official-import\/route\.ts$/i.test(file.replace(/\\/g, "/")) &&
    file !== "app/api/admin/import-sessions/[sessionId]/official-import/route.ts"
  ) {
    failures.push(`official import POST route candidate changed ${file}`);
  }
  if (/\.(xls|xlsx|csv|png|jpg|jpeg|webp|zip)$/i.test(file)) {
    failures.push(`real data/storage/screenshot file changed ${file}`);
  }
}

const runtimePatch = gitOutput(["diff", "--", "app", "lib", "components"]);
for (const pattern of [
  /\bCREATE\s+TABLE\b/i,
  /\bALTER\s+TABLE\b/i,
  /\bINSERT\s+INTO\b/i,
  /\bUPDATE\s+[a-z_]/i,
  /\bDELETE\s+FROM\b/i,
  /\.from\(["']people["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']family_parents["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']family_children["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']couple_relationships["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']revisions["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /export\s+async\s+function\s+(POST|PUT|PATCH|DELETE)\b[\s\S]{0,300}official/i,
]) {
  rejectPattern(runtimePatch, pattern, `runtime patch ${pattern}`);
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
    /postgresql:\/\/[^`\s]+/i,
  ]) {
    rejectPattern(content, pattern, `${file} ${pattern}`);
  }
}

if (failures.length > 0) {
  console.error("A-16M official import transaction rollback audit design check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16M official import transaction rollback audit design check passed.");
