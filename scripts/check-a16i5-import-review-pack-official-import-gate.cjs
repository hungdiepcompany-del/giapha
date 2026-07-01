const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16I5_IMPORT_REVIEW_PACK_OFFICIAL_IMPORT_GATE.md";
const checkerPath =
  "scripts/check-a16i5-import-review-pack-official-import-gate.cjs";
const servicePath = "lib/import/giapha4/import-review-pack-service.ts";
const routePath =
  "app/api/admin/import-sessions/[sessionId]/review-pack/route.ts";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const a16sqlAllowlistTokens = [
  "docs/PLAN_A16SQL_RLS_IMPORT_STAGING_WRITE.md",
  "scripts/check-a16sql-rls-import-staging-write.cjs",
  "db/migrations/20260630_0011_a16sql_import_staging_write_rls.sql",
  "supabase/migrations/20260630_0011_a16sql_import_staging_write_rls.sql",
  "db/checks/20260630_check_a16sql_import_staging_write_rls.sql",
  "docs/PLAN_A16P_TX_OFFICIAL_IMPORT_TRANSACTION_HELPER_READINESS.md",
  "docs/PLAN_A16P_TX_ROLLBACK_AUDIT_MANIFEST_CONTRACT.md",
  "db/migrations/20260701_0012_a16p_tx_official_import_transaction_helper_candidate.sql",
  "supabase/migrations/20260701_0012_a16p_tx_official_import_transaction_helper_candidate.sql",
  "db/checks/20260701_check_a16p_tx_official_import_transaction_helper.sql",
  "scripts/check-a16p-tx-official-import-transaction-helper-readiness.cjs",
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

const doc = readFile(docPath);
const checker = readFile(checkerPath);
const service = readFile(servicePath);
const route = readFile(routePath);
const panel = readFile(panelPath);
const packageJson = readJson("package.json");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");

for (const token of a16sqlAllowlistTokens) {
  requireIncludes(checker, token, `A-16SQL allowlist token ${token}`);
}

for (const token of [
  "A-16I5",
  "GÃƒÂ³i rÃƒÂ  soÃƒÂ¡t",
  "GET /api/admin/import-sessions/[sessionId]/review-pack",
  "canProceedToOfficialImport=false",
  "readyForOfficialImport=false",
  "KhÃƒÂ´ng ghi `people/person`",
  "KhÃƒÂ´ng mÃ¡Â»Å¸ route/action `confirm`, `import-now`, `finalize`, hoÃ¡ÂºÂ·c nhÃ¡ÂºÂ­p chÃƒÂ­nh thÃ¡Â»Â©c",
  "A16I5_STATUS=OWNER_REVIEW_PACK_READY_OFFICIAL_IMPORT_CLOSED",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "A16I5_IMPORT_REVIEW_PACK_OFFICIAL_IMPORT_GATE",
  "buildImportReviewPackFromManifest",
  "getImportReviewPack",
  "getImportManifest",
  "buildManifestValidationReview",
  "buildDryRunMappingPreview",
  "previewOnly: true",
  "canProceedToOfficialImport: false",
  "readyForOfficialImport: false",
  "READY_FOR_OWNER_REVIEW",
  "NOT_READY",
]) {
  requireIncludes(service, token, `service token ${token}`);
}

for (const token of [
  "export async function GET",
  "getImportReviewPack",
  "NextResponse.json",
]) {
  requireIncludes(route, token, `route token ${token}`);
}

for (const token of [
  "GÃƒÂ³i rÃƒÂ  soÃƒÂ¡t trÃ†Â°Ã¡Â»â€ºc khi nhÃ¡ÂºÂ­p",
  "SÃ¡ÂºÂµn sÃƒÂ ng Ã„â€˜Ã¡Â»Æ’ owner rÃƒÂ  soÃƒÂ¡t",
  "ChÃ†Â°a Ã„â€˜Ã¡Â»Â§ Ã„â€˜iÃ¡Â»Âu kiÃ¡Â»â€¡n nhÃ¡ÂºÂ­p chÃƒÂ­nh thÃ¡Â»Â©c",
  "reviewPack.marker",
]) {
  requireIncludes(panel, token, `panel token ${token}`);
}

if (
  packageJson?.scripts?.["check:a16i5-import-review-pack-official-import-gate"] !==
  "node scripts/check-a16i5-import-review-pack-official-import-gate.cjs"
) {
  failures.push("missing package script check:a16i5-import-review-pack-official-import-gate");
}

for (const [content, token, label] of [
  [index, "PLAN_A16I5_IMPORT_REVIEW_PACK_OFFICIAL_IMPORT_GATE.md", "index entry"],
  [
    workLog,
    "A16I5_STATUS=OWNER_REVIEW_PACK_READY_OFFICIAL_IMPORT_CLOSED",
    "work log marker",
  ],
  [
    handoff,
    "A16I5_STATUS=OWNER_REVIEW_PACK_READY_OFFICIAL_IMPORT_CLOSED",
    "handoff marker",
  ],
  [
    decisionLog,
    "Decision 215 - A-16I5 adds read-only import review pack while official import remains closed",
    "decision entry",
  ],
]) {
  requireIncludes(content, token, label);
}

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
    (file.startsWith("db/migrations/") ||
      file.startsWith("supabase/migrations/")) &&
    !a16sqlAllowlistTokens.includes(file)
  ) {
    failures.push(`migration file changed ${file}`);
  }
  if (
    file.startsWith("app/api/") &&
    file !== routePath &&
    file !== "app/api/admin/import-sessions/upload/route.ts" &&
    file !== "app/api/admin/import-sessions/[sessionId]/validation/route.ts" &&
    file !== "app/api/admin/import-sessions/[sessionId]/dry-run-gate/route.ts" &&
    file !== "app/api/admin/import-sessions/[sessionId]/dry-run-preview/route.ts" &&
    file !== "app/api/admin/import-sessions/[sessionId]/official-import-gate/route.ts" &&
    file !== "app/api/admin/import-sessions/[sessionId]/official-import/route.ts"
  ) {
    failures.push(`unexpected API/action changed ${file}`);
  }
}

const stagedDataFiles = gitOutput(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter((file) => /\.(xls|xlsx|csv|json)$/i.test(file) && file !== "package.json");
for (const file of stagedDataFiles) failures.push(`staged real data/storage file ${file}`);

const runtimePatch = gitOutput(["diff", "--", servicePath, routePath, panelPath]);
for (const pattern of [
  /\bsupabase\s+db\s+push\b/i,
  /\bmigration\s+repair\b/i,
  /\bCREATE\s+TABLE\b/i,
  /\bALTER\s+TABLE\b/i,
  /\bINSERT\s+INTO\b/i,
  /\bUPDATE\s+[a-z_]/i,
  /\bDELETE\s+FROM\b/i,
  /\.from\(["']people["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']person["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']relationships["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']tree_layouts?["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']revisions?["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\b(confirm|commit|finalize|official-import(?!(?:-gate|-preflight|-service|\/route))|import-now|write-real-tree)\b/i,
]) {
  rejectPattern(runtimePatch, pattern, `runtime patch ${pattern}`);
}

for (const [file, content] of [
  [docPath, doc],
  [checkerPath, checker],
  [servicePath, service],
  [routePath, route],
  [panelPath, panel],
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
  console.error("A-16I5 import review pack official import gate check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16I5 import review pack official import gate check passed.");
