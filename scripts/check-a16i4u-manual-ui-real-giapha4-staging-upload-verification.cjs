const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];
const docPath =
  "docs/PLAN_A16I4U_MANUAL_UI_REAL_GIAPHA4_STAGING_UPLOAD_VERIFICATION.md";
const checkerPath =
  "scripts/check-a16i4u-manual-ui-real-giapha4-staging-upload-verification.cjs";

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
  "A-16I4U",
  "Đã nhận diện sheet Thành viên",
  "102",
  "134",
  "PASS_OWNER_CONFIRMED",
  "Official import: `NOT_OPENED`",
  "Real genealogy writes: `NOT_RUN`",
  "Không ghi raw personal rows",
  "không ghi tên file thật",
  "A16I4U_STATUS=PASS_OWNER_CONFIRMED_STAGING_ONLY_OFFICIAL_IMPORT_NOT_OPENED",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

if (doc.includes("raw personal rows")) {
  for (let index = failures.length - 1; index >= 0; index -= 1) {
    if (failures[index].includes("raw personal rows")) failures.splice(index, 1);
  }
}

if (
  packageJson?.scripts?.[
    "check:a16i4u-manual-ui-real-giapha4-staging-upload-verification"
  ] !==
  "node scripts/check-a16i4u-manual-ui-real-giapha4-staging-upload-verification.cjs"
) {
  failures.push("missing package script check:a16i4u-manual-ui-real-giapha4-staging-upload-verification");
}

for (const [content, token, label] of [
  [index, "PLAN_A16I4U_MANUAL_UI_REAL_GIAPHA4_STAGING_UPLOAD_VERIFICATION.md", "index entry"],
  [workLog, "A16I4U_STATUS=PASS_OWNER_CONFIRMED_STAGING_ONLY_OFFICIAL_IMPORT_NOT_OPENED", "work log marker"],
  [handoff, "A16I4U_STATUS=PASS_OWNER_CONFIRMED_STAGING_ONLY_OFFICIAL_IMPORT_NOT_OPENED", "handoff marker"],
]) {
  requireIncludes(content, token, label);
}

for (const pattern of [
  /\braw row sample\b/i,
  /\bsupabase\s+db\s+push\s*:\s*PASS\b/i,
  /\bsupabase\s+migration\s+repair\s*:\s*PASS\b/i,
  /\bSQL apply\s*:\s*PASS\b/i,
  /\bdeploy\s*:\s*PASS\b/i,
  /\bpush\s*:\s*PASS\b/i,
  /CREATE\s+TABLE/i,
  /ALTER\s+TABLE/i,
  /INSERT\s+INTO/i,
]) {
  rejectPattern(doc, pattern, `doc ${pattern}`);
}

const changedFiles = gitOutput(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);
for (const file of changedFiles) {
  if (file === ".env.local") failures.push(".env.local must not be changed");
  if (/\.(xls|xlsx|csv|png|jpg|jpeg|webp|zip)$/i.test(file)) {
    failures.push(`real data/storage/screenshot file changed ${file}`);
  }
  if (file.startsWith("db/migrations/") || file.startsWith("supabase/migrations/")) {
    failures.push(`migration file changed ${file}`);
  }
}

const trackedDataFiles = gitOutput(["ls-files"])
  .split(/\r?\n/)
  .filter((file) => /\.(xls|xlsx|csv)$/i.test(file));
for (const file of trackedDataFiles) failures.push(`tracked real data file ${file}`);

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
  console.error("A-16I4U manual UI real Gia Pha 4 staging upload verification check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16I4U manual UI real Gia Pha 4 staging upload verification check passed.");
