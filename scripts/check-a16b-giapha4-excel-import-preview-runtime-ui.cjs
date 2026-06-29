const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16B_GIAPHA4_EXCEL_IMPORT_PREVIEW_RUNTIME_UI.md";
const checkerPath = "scripts/check-a16b-giapha4-excel-import-preview-runtime-ui.cjs";
const packagePath = "package.json";
const marker = "A16B_GIAPHA4_EXCEL_IMPORT_PREVIEW_RUNTIME_UI";
const a16dDocPath = "docs/PLAN_A16D_IMPORT_SCHEMA_CANDIDATE_MANIFEST_STORAGE_DESIGN.md";
const a16dCheckerPath = "scripts/check-a16d-import-schema-candidate-manifest-storage-design.cjs";
const a16dMigrationPath = "db/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql";
const a16eDocPath = "docs/PLAN_A16E_IMPORT_SCHEMA_CANDIDATE_DB_APPLY_GATE.md";
const a16eCheckerPath = "scripts/check-a16e-import-schema-candidate-db-apply-gate.cjs";

const previewFiles = [
  "app/(admin)/admin/exports/import/page.tsx",
  "components/imports/giapha4-import-preview-form.tsx",
  "app/api/admin/import/giapha4/preview/route.ts",
  "lib/import/giapha4/types.ts",
  "lib/import/giapha4/normalize.ts",
  "lib/import/giapha4/parser.ts",
  "lib/import/giapha4/preview.ts",
];

const allowedChangedFiles = new Set([
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  docPath,
  "scripts/check-a16-giapha4-excel-import-mapping-readiness.cjs",
  checkerPath,
  "docs/PLAN_A16C_OWNER_REVIEW_IMPORT_PREVIEW_DB_WRITE_APPROVAL_DESIGN.md",
  "scripts/check-a16c-owner-review-import-preview-db-write-approval-design.cjs",
  a16dDocPath,
  a16dCheckerPath,
  a16dMigrationPath,
  a16eDocPath,
  a16eCheckerPath,
  "package.json",
  ...previewFiles,
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
const packageJson = readJson(packagePath);
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const previewContents = previewFiles.map((file) => [file, readFile(file)]);

for (const token of [
  "A-16B",
  marker,
  "preview-only",
  "NO_DB_WRITE",
  "khong commit file Excel that",
  "privacy/PII policy",
  "duplicate policy",
  "warning/ambiguity policy",
  "khong co nut nhap that hoat dong",
  "future owner approval gate cho A-16C",
  "A16B_PREVIEW_RUNTIME_STATUS=SAFE_SKIP_MISSING_EXCEL_PARSER_DEPENDENCY",
  "parser architecture",
  "UI flow",
  "API/server action flow",
  "dependency status",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [index, docPath, "index entry"],
  [workLog, marker, "work log marker"],
  [handoff, marker, "handoff marker"],
  [decisionLog, "Decision 194 - A-16B keeps Gia Pha 4 Excel preview safe-skip until parser approval", "decision entry"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a16b:giapha4-excel-import-preview-runtime-ui"] !==
  "node scripts/check-a16b-giapha4-excel-import-preview-runtime-ui.cjs"
) {
  failures.push("missing package script check:a16b:giapha4-excel-import-preview-runtime-ui");
}

const uiContent = readFile("components/imports/giapha4-import-preview-form.tsx");
for (const token of [
  "Xem trước dữ liệu",
  "Tải lại file",
  "Nhập dữ liệu thật",
  "Nhập dữ liệu thật sẽ được mở ở phase sau sau khi owner phê duyệt.",
  "ghi database",
]) {
  requireIncludes(uiContent, token, `UI token ${token}`);
}

const routeContent = readFile("app/api/admin/import/giapha4/preview/route.ts");
requireIncludes(routeContent, "previewGiaPha4ExcelImport", "API route preview service");
requireIncludes(routeContent, "POST", "API route POST");

const parserContent = readFile("lib/import/giapha4/parser.ts");
requireIncludes(parserContent, "SAFE_SKIP_MISSING_EXCEL_PARSER_DEPENDENCY", "parser safe-skip status");
requireIncludes(parserContent, "db_write: false", "parser no DB write");
requireIncludes(parserContent, "printed_pii: false", "parser no PII log contract");

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

const packageHead = gitShowHead(packagePath);
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

for (const [file, content] of previewContents) {
  for (const pattern of [
    /\.insert\s*\(/,
    /\.update\s*\(/,
    /\.upsert\s*\(/,
    /\.delete\s*\(/,
    /\binsert\s+into\b/i,
    /\bupdate\s+[a-z_"]+\s+set\b/i,
    /\bdelete\s+from\b/i,
    /console\.(log|info|warn|error)\s*\(/,
  ]) {
    rejectPattern(content, pattern, `${file} ${pattern}`);
  }
}

for (const [file, content] of [
  [docPath, doc],
  [checkerPath, readFile(checkerPath)],
  ...previewContents,
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

if (failures.length > 0) {
  console.error("A-16B Gia Pha 4 Excel import preview runtime/UI check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16B Gia Pha 4 Excel import preview runtime/UI check passed.");
