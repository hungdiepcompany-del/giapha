const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16I3_GIAPHA4_XLSX_COLUMN_MAPPING.md";
const checkerPath = "scripts/check-a16i3-giapha4-xlsx-column-mapping.cjs";
const parserPath = "lib/import/giapha4/xlsx-staging-parser.ts";
const normalizePath = "lib/import/giapha4/normalize.ts";
const uploadServicePath = "lib/import/giapha4/manifest-upload-service.ts";
const uploadFormPath = "components/imports/giapha4-manifest-upload-form.tsx";
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
const parser = readFile(parserPath);
const normalize = readFile(normalizePath);
const uploadService = readFile(uploadServicePath);
const uploadForm = readFile(uploadFormPath);
const packageJson = readJson("package.json");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of a16sqlAllowlistTokens) {
  requireIncludes(checker, token, `A-16SQL allowlist token ${token}`);
}

for (const token of [
  "A-16I3",
  "Gia PhÃ¡ÂºÂ£ 4",
  "ThÃƒÂ nh viÃƒÂªn",
  "MÃƒÂ£ GP",
  "MÃƒÂ£ GP BÃ¡Â»â€˜",
  "MÃƒÂ£ GP MÃ¡ÂºÂ¹",
  "KhÃƒÂ´ng tÃ¡ÂºÂ¡o migration",
  "KhÃƒÂ´ng ghi `people/person` thÃ¡ÂºÂ­t",
  "KhÃƒÂ´ng mÃ¡Â»Å¸ Ã„â€˜Ã†Â°Ã¡Â»Âng `confirm`, `import-now`, `finalize`, hoÃ¡ÂºÂ·c nhÃ¡ÂºÂ­p chÃƒÂ­nh thÃ¡Â»Â©c",
  "A16I3_STATUS=XLSX_COLUMN_MAPPING_READY_STAGING_ONLY",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "A16I3_GIAPHA4_COLUMN_MAPPING_MARKER",
  "a16i3-giapha4-manifest-staging-v2",
  "a16i3-jszip-xlsx-thanh-vien-v2",
  "MAIN_MEMBER_SHEET_NAME",
  "MÃƒÂ£ GP",
  "HÃ¡Â»Â tÃƒÂªn",
  "MÃƒÂ£ GP BÃ¡Â»â€˜",
  "MÃƒÂ£ GP MÃ¡ÂºÂ¹",
  "A16I3_MEMBER_SHEET_MISSING",
  "A16I3_REQUIRED_HEADERS_MISSING",
  "parseSummary",
  "externalId",
  "parentExternalId",
  "missing_reference",
]) {
  requireIncludes(parser, token, `parser token ${token}`);
}

for (const token of [
  "normalizeGiaPha4NullableText",
  "parseGiaPha4PositiveNumber",
  "isGiaPha4NullPlaceholder",
  "0/0/0",
  "0",
  "5",
]) {
  requireIncludes(normalize, token, `normalize token ${token}`);
}

for (const token of [
  "parseSummary",
  "mapping_stage: \"A-16I3\"",
  "parse_summary",
]) {
  requireIncludes(uploadService, token, `upload service token ${token}`);
}

for (const token of [
  "Ã„ÂÃƒÂ£ nhÃ¡ÂºÂ­n diÃ¡Â»â€¡n sheet ThÃƒÂ nh viÃƒÂªn",
  "MÃƒÂ£ GP",
  "Quan hÃ¡Â»â€¡ cha/mÃ¡ÂºÂ¹",
]) {
  requireIncludes(uploadForm, token, `upload UI token ${token}`);
}

if (
  packageJson?.scripts?.["check:a16i3-giapha4-xlsx-column-mapping"] !==
  "node scripts/check-a16i3-giapha4-xlsx-column-mapping.cjs"
) {
  failures.push("missing package script check:a16i3-giapha4-xlsx-column-mapping");
}

for (const [content, token, label] of [
  [index, "PLAN_A16I3_GIAPHA4_XLSX_COLUMN_MAPPING.md", "index entry"],
  [workLog, "A16I3_STATUS=XLSX_COLUMN_MAPPING_READY_STAGING_ONLY", "work log marker"],
  [handoff, "A16I3_STATUS=XLSX_COLUMN_MAPPING_READY_STAGING_ONLY", "handoff marker"],
]) {
  requireIncludes(content, token, label);
}

const stagedDataFiles = gitOutput(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter((file) => /\.(xls|xlsx|csv)$/i.test(file));
for (const file of stagedDataFiles) failures.push(`staged real data file ${file}`);

const changedFiles = gitOutput(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);
for (const file of changedFiles) {
  if (file === ".env.local") failures.push(".env.local must not be changed");
  if (/\.(xls|xlsx|csv)$/i.test(file)) failures.push(`real import file changed ${file}`);
  if (
    file.startsWith("db/migrations/") ||
    file.startsWith("supabase/migrations/")
  ) {
    failures.push(`migration file changed ${file}`);
  }
}

const runtimePatch = gitOutput([
  "diff",
  "--",
  parserPath,
  normalizePath,
  uploadServicePath,
  uploadFormPath,
]);
for (const pattern of [
  /\bsupabase\s+db\s+push\b/i,
  /\bmigration\s+repair\b/i,
  /\bCREATE\s+TABLE\b/i,
  /\bALTER\s+TABLE\b/i,
  /\bINSERT\s+INTO\b/i,
  /\.from\(["']people["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']person["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']family_children["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\b(confirm|commit|finalize|official-import(?!(?:-gate|-preflight|-service|\/route))|import-now|write-real-tree)\b/i,
]) {
  rejectPattern(runtimePatch, pattern, `runtime patch ${pattern}`);
}

for (const [file, content] of [
  [docPath, doc],
  [checkerPath, checker],
  [parserPath, parser],
  [normalizePath, normalize],
  [uploadServicePath, uploadService],
  [uploadFormPath, uploadForm],
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
  console.error("A-16I3 Gia Pha 4 XLSX column mapping check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16I3 Gia Pha 4 XLSX column mapping check passed.");
