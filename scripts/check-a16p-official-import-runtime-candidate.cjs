const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE.md";
const servicePath = "lib/import/giapha4/official-import-service.ts";
const routePath =
  "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const checkerPath = "scripts/check-a16p-official-import-runtime-candidate.cjs";
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
const service = readFile(servicePath);
const route = readFile(routePath);
const panel = readFile(panelPath);
const checker = readFile(checkerPath);
const packageJson = readJson("package.json");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16P",
  "APPROVE_A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE",
  "A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE",
  "A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED=false",
  "A16P_BLOCKED_TRANSACTION_HELPER_MISSING",
  "A16P_STATUS=BLOCKED_TRANSACTION_HELPER_MISSING",
  "Không chạy import thật",
  "Không ghi people/person thật",
  "Không migration",
  "Không DB push",
  "Không SQL apply",
  "Không deploy",
  "Không push",
  "A-16P-TX",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE",
  "A16P_BLOCKED_TRANSACTION_HELPER_MISSING",
  "getImportManifest",
  "buildManifestValidationReview",
  "buildDryRunMappingPreview",
  "buildImportReviewPackFromManifest",
  "canRunOfficialImport: false",
  "piiPrinted: false",
  "transactionStatus: \"BLOCKED_TRANSACTION_HELPER_NOT_APPLIED\"",
  "A16P_TX_TRANSACTION_RPC_NAME",
  "public.a16p_tx_execute_giapha4_official_import",
  "rollbackManifestPreview",
  "auditManifestPreview",
  "IMPORT_COMPLETED",
  "A16P_TX_TRANSACTION_HELPER_NOT_APPLIED_BLOCKER",
]) {
  requireIncludes(service, token, `service token ${token}`);
}

for (const token of [
  "export async function POST",
  "A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED",
  "process.env.A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED === \"true\"",
  "status: \"LOCKED\"",
  "Nhập chính thức chưa được bật trong môi trường này.",
  "getPermissionContext",
  "confirmMarker",
  "confirmSessionId",
  "confirmNoValidationErrors",
  "confirmRollbackReviewed",
  "confirmAuditReviewed",
  "getOfficialImportRuntimeCandidate",
]) {
  requireIncludes(route, token, `route token ${token}`);
}

rejectPattern(route, /export\s+async\s+function\s+(GET|PUT|PATCH|DELETE)\b/, "non-POST official import route export");

for (const token of [
  "Ứng viên nhập chính thức đã được chuẩn bị nhưng chưa được bật",
  "Chưa chạy nhập chính thức",
  "Nút nhập chính thức vẫn",
  "disabled",
  "aria-disabled=\"true\"",
]) {
  requireIncludes(panel, token, `panel token ${token}`);
}

if (
  packageJson?.scripts?.["check:a16p-official-import-runtime-candidate"] !==
  "node scripts/check-a16p-official-import-runtime-candidate.cjs"
) {
  failures.push("missing package script check:a16p-official-import-runtime-candidate");
}

for (const [content, token, label] of [
  [index, "PLAN_A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE.md", "index entry"],
  [workLog, "A16P_STATUS=BLOCKED_TRANSACTION_HELPER_MISSING", "work log status"],
  [decisionLog, "Decision 217", "decision log entry"],
  [handoff, "A16P_STATUS=BLOCKED_TRANSACTION_HELPER_MISSING", "handoff status"],
]) {
  requireIncludes(content, token, label);
}

for (const pattern of [
  /\.from\(["']people["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']families["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']family_parents["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']family_children["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']couple_relationships["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']tree_layouts?["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']revisions?["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\bcreatePerson\s*\(/,
  /\bcreateFamily\s*\(/,
  /\baddParentToFamily\s*\(/,
  /\baddChildToFamily\s*\(/,
  /\bcreateCoupleRelationship\s*\(/,
  /\blogRevision\s*\(/,
]) {
  rejectPattern(service, pattern, `service ${pattern}`);
}

for (const pattern of [
  /\breadFileSync\([^)]*\.(xls|xlsx|csv)/i,
  /\bJSZip\b/,
  /\bparseWorkbook\b/,
  /\bservice_role\b/i,
  /\bSUPABASE_SERVICE_ROLE_KEY\b/,
  /\bSECURITY\s+DEFINER\b/i,
  /\bgrant\b[\s\S]{0,80}\b(anon|public)\b/i,
  /\bdisable\s+row\s+level\s+security\b/i,
]) {
  rejectPattern(service + route + doc, pattern, `source/doc ${pattern}`);
}

const scriptFiles = gitOutput(["ls-files", "scripts"])
  .split(/\r?\n/)
  .filter(Boolean)
  .filter((file) => file !== checkerPath);

for (const file of scriptFiles) {
  const content = readFile(file);
  for (const pattern of [
    /fetch\([^)]*official-import(?!-gate)/i,
    /curl[\s\S]{0,160}official-import(?!-gate)/i,
    /method\s*:\s*["']POST["'][\s\S]{0,240}official-import(?!-gate)/i,
    /official-import(?!-gate)[\s\S]{0,160}method\s*:\s*["']POST["']/i,
  ]) {
    rejectPattern(content, pattern, `${file} calls official import POST ${pattern}`);
  }
}

const changedFiles = gitOutput(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

for (const file of changedFiles) {
  if (file === ".env.local") failures.push(".env.local must not be changed");
  if (file === "PLANNING.MD") failures.push("PLANNING.MD must not be changed");
  if (
    (file.startsWith("db/migrations/") || file.startsWith("supabase/migrations/")) &&
    !allowedA16pTxSqlFiles.has(file)
  ) {
    failures.push(`migration file changed ${file}`);
  }
  if (/\.(xls|xlsx|csv|png|jpg|jpeg|webp|zip)$/i.test(file)) {
    failures.push(`real data/storage/screenshot file changed ${file}`);
  }
}

for (const file of gitOutput(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean)) {
  if (/\.(xls|xlsx|csv|png|jpg|jpeg|webp|zip)$/i.test(file)) {
    failures.push(`staged real data/storage/screenshot file not allowed ${file}`);
  }
}

for (const [file, content] of [
  [docPath, doc],
  [servicePath, service],
  [routePath, route],
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
  console.error("A-16P official import runtime candidate check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16P official import runtime candidate check passed.");
