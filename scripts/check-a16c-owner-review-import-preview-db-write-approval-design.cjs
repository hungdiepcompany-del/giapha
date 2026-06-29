const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16C_OWNER_REVIEW_IMPORT_PREVIEW_DB_WRITE_APPROVAL_DESIGN.md";
const checkerPath = "scripts/check-a16c-owner-review-import-preview-db-write-approval-design.cjs";
const marker = "A16C_OWNER_REVIEW_IMPORT_PREVIEW_DB_WRITE_APPROVAL_DESIGN";
const a16dDocPath = "docs/PLAN_A16D_IMPORT_SCHEMA_CANDIDATE_MANIFEST_STORAGE_DESIGN.md";
const a16dCheckerPath = "scripts/check-a16d-import-schema-candidate-manifest-storage-design.cjs";
const a16dMigrationPath = "db/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql";
const a16eDocPath = "docs/PLAN_A16E_IMPORT_SCHEMA_CANDIDATE_DB_APPLY_GATE.md";
const a16eCheckerPath = "scripts/check-a16e-import-schema-candidate-db-apply-gate.cjs";
const a16e1DocPath = "docs/PLAN_A16E1_OWNER_REVIEW_IMPORT_SCHEMA_APPLY_GATE.md";
const a16e1CheckerPath = "scripts/check-a16e1-owner-review-import-schema-apply-gate.cjs";
const a16e2DocPath = "docs/PLAN_A16E2_IMPORT_SCHEMA_CANDIDATE_APPLY_BLOCKER_RESOLUTION.md";
const a16e2CheckerPath = "scripts/check-a16e2-import-schema-candidate-apply-blocker-resolution.cjs";

const allowedChangedFiles = new Set([
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  docPath,
  checkerPath,
  "scripts/check-a16-giapha4-excel-import-mapping-readiness.cjs",
  "scripts/check-a16b-giapha4-excel-import-preview-runtime-ui.cjs",
  a16dDocPath,
  a16dCheckerPath,
  a16dMigrationPath,
  a16eDocPath,
  a16eCheckerPath,
  a16e1DocPath,
  a16e1CheckerPath,
  a16e2DocPath,
  a16e2CheckerPath,
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
const packageJson = readJson("package.json");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");

for (const token of [
  "A-16C",
  marker,
  "NO_DB_WRITE",
  "owner review workflow",
  "approval states",
  "approval marker",
  "import manifest",
  "rollback strategy",
  "duplicate policy",
  "Khong auto merge",
  "Khong auto delete",
  "relationship ambiguity policy",
  "privacy/PII policy",
  "UI Vietnamese review flow",
  "Future Phase Gate A-16D/A-16E",
  "APPROVE_A16D_GIAPHA4_IMPORT_SCHEMA_CANDIDATE",
  "APPROVE_A16E_GIAPHA4_IMPORT_DB_WRITE_RUNTIME",
  "held_rows",
  "source_file_hash",
  "rollback manifest",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "Xem lại dữ liệu nhập",
  "Xác nhận đã kiểm tra cảnh báo",
  "Xác nhận đã kiểm tra người trùng",
  "Xác nhận đã kiểm tra quan hệ gia đình",
  "Ghi dữ liệu thật sẽ được mở ở phase sau sau khi owner phê duyệt",
]) {
  requireIncludes(doc, token, `Vietnamese UI token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A16C_OWNER_REVIEW_IMPORT_PREVIEW_DB_WRITE_APPROVAL_DESIGN.md", "index entry"],
  [workLog, marker, "work log marker"],
  [handoff, marker, "handoff marker"],
  [decisionLog, "Decision 195 - A-16C requires owner-bound approval marker before Gia Pha 4 DB write", "decision entry"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a16c:owner-review-import-preview-db-write-approval-design"] !==
  "node scripts/check-a16c-owner-review-import-preview-db-write-approval-design.cjs"
) {
  failures.push("missing package script check:a16c:owner-review-import-preview-db-write-approval-design");
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
  if (!allowedChangedFiles.has(file) && /schema|migration|seed/i.test(file) && !file.startsWith("docs/")) {
    failures.push(`schema/migration/seed-like file changed ${file}`);
  }
  if (
    /app\/api\/.*import.*write|app\/api\/.*giapha4.*write|actions\.ts|service\.ts|route\.ts$/i.test(
      file,
    ) &&
    !allowedChangedFiles.has(file)
  ) {
    failures.push(`runtime write/import route changed ${file}`);
  }
  if (
    /wrangler\.toml|wrangler\.json|wrangler\.jsonc|open-next\.config|opennext|cloudflare-env|middleware|next\.config|\.github\/workflows/i.test(
      file,
    )
  ) {
    failures.push(`runtime/deploy config changed ${file}`);
  }
  if (/storage-state|storage_state|cookie|token|secret|\.env|\.png$|\.jpg$|\.jpeg$|\.webp$/i.test(file)) {
    failures.push(`possible secret/session/evidence artifact changed ${file}`);
  }
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
  [checkerPath, readFile(checkerPath)],
]) {
  for (const pattern of [
    /sb_(secret|service)_[A-Za-z0-9_-]{12,}/,
    /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/,
    /Bearer\s+[A-Za-z0-9._-]{12,}/,
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  ]) {
    rejectPattern(content, pattern, `${file} ${pattern}`);
  }
}

const importRuntimeFiles = changedFiles.filter((file) =>
  /app\/api\/.*import|lib\/import|components\/imports|app\/\(admin\)\/admin\/exports\/import/.test(
    file,
  ),
);

for (const file of importRuntimeFiles) {
  const content = readFile(file);
  for (const pattern of [
    /\.insert\s*\(/,
    /\.update\s*\(/,
    /\.upsert\s*\(/,
    /\.delete\s*\(/,
    /\binsert\s+into\b/i,
    /\bupdate\s+[a-z_"]+\s+set\b/i,
    /\bdelete\s+from\b/i,
  ]) {
    rejectPattern(content, pattern, `${file} ${pattern}`);
  }
}

if (failures.length > 0) {
  console.error("A-16C owner review import approval design check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16C owner review import approval design check passed.");
