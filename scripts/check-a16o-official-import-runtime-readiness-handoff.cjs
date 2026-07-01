const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];
const docPath = "docs/PLAN_A16O_OFFICIAL_IMPORT_RUNTIME_READINESS_HANDOFF.md";
const checkerPath =
  "scripts/check-a16o-official-import-runtime-readiness-handoff.cjs";
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
  "A-16O",
  "102",
  "134",
  "Thành viên",
  "Official import not opened",
  "A-16P — Official Import Runtime Candidate",
  "APPROVE_A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE",
  "Hard No-Go",
  "no marker",
  "validation errors",
  "unresolved duplicates",
  "rollback cannot be produced",
  "A16O_STATUS=OFFICIAL_IMPORT_RUNTIME_READINESS_HANDOFF_BLOCKED_UNTIL_A16P_MARKER",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

if (
  packageJson?.scripts?.["check:a16o-official-import-runtime-readiness-handoff"] !==
  "node scripts/check-a16o-official-import-runtime-readiness-handoff.cjs"
) {
  failures.push("missing package script check:a16o-official-import-runtime-readiness-handoff");
}

for (const [content, token, label] of [
  [index, "PLAN_A16O_OFFICIAL_IMPORT_RUNTIME_READINESS_HANDOFF.md", "index entry"],
  [
    workLog,
    "A16O_STATUS=OFFICIAL_IMPORT_RUNTIME_READINESS_HANDOFF_BLOCKED_UNTIL_A16P_MARKER",
    "work log marker",
  ],
  [
    handoff,
    "A16O_STATUS=OFFICIAL_IMPORT_RUNTIME_READINESS_HANDOFF_BLOCKED_UNTIL_A16P_MARKER",
    "handoff marker",
  ],
]) {
  requireIncludes(content, token, label);
}

for (const pattern of [
  /\bCREATE\s+TABLE\b/i,
  /\bALTER\s+TABLE\b/i,
  /\bINSERT\s+INTO\b/i,
  /\bDELETE\s+FROM\b/i,
  /\bsupabase\s+db\s+push\b/i,
  /\bmigration\s+repair\b/i,
  /\bdeploy\s*:\s*PASS\b/i,
  /\bpush\s*:\s*PASS\b/i,
]) {
  rejectPattern(doc, pattern, `doc ${pattern}`);
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
  if (/\.(xls|xlsx|csv|png|jpg|jpeg|webp|zip)$/i.test(file)) {
    failures.push(`real data/storage/screenshot file changed ${file}`);
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
    /postgresql:\/\/[^`\s]+/i,
  ]) {
    rejectPattern(content, pattern, `${file} ${pattern}`);
  }
}

if (failures.length > 0) {
  console.error("A-16O official import runtime readiness handoff check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16O official import runtime readiness handoff check passed.");
