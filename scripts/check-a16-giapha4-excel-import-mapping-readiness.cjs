const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];
const docPath = "docs/PLAN_A16_GIAPHA4_EXCEL_IMPORT_MAPPING_READINESS.md";
const inspectPath = "scripts/inspect-giapha4-excel-import.cjs";
const checkerPath = "scripts/check-a16-giapha4-excel-import-mapping-readiness.cjs";
const marker = "A16_GIAPHA4_EXCEL_IMPORT_MAPPING_READINESS";
const a16bDocPath = "docs/PLAN_A16B_GIAPHA4_EXCEL_IMPORT_PREVIEW_RUNTIME_UI.md";
const a16bCheckerPath = "scripts/check-a16b-giapha4-excel-import-preview-runtime-ui.cjs";
const a16cDocPath = "docs/PLAN_A16C_OWNER_REVIEW_IMPORT_PREVIEW_DB_WRITE_APPROVAL_DESIGN.md";
const a16cCheckerPath = "scripts/check-a16c-owner-review-import-preview-db-write-approval-design.cjs";
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
  inspectPath,
  checkerPath,
  a16bDocPath,
  a16bCheckerPath,
  a16cDocPath,
  a16cCheckerPath,
  a16dDocPath,
  a16dCheckerPath,
  a16dMigrationPath,
  a16eDocPath,
  a16eCheckerPath,
  a16e1DocPath,
  a16e1CheckerPath,
  a16e2DocPath,
  a16e2CheckerPath,
  "app/(admin)/admin/exports/import/page.tsx",
  "app/api/admin/import/giapha4/preview/route.ts",
  "components/imports/giapha4-import-preview-form.tsx",
  "lib/import/giapha4/types.ts",
  "lib/import/giapha4/normalize.ts",
  "lib/import/giapha4/parser.ts",
  "lib/import/giapha4/preview.ts",
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

const packageJson = readJson("package.json");
const doc = readFile(docPath);
const inspectScript = readFile(inspectPath);
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");

for (const token of [
  "A-16 - Import Du Lieu Gia Pha 4.0 Tu File Excel iPhone",
  "A-16",
  marker,
  "preview-only",
  "NO_DB_WRITE",
  "khong commit file Excel that",
  "khong commit du lieu ca nhan that",
  "privacy/PII policy",
  "duplicate policy",
  "relationship mapping",
  "future owner approval gate",
  "SAFE_SKIP_EXCEL_DEPENDENCY_MISSING",
  "A16B runtime preview/import UI",
  "DB write later phase",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "full_name / display_name",
  "gender",
  "birth_date",
  "death_date",
  "is_living",
  "birth_place",
  "home_town",
  "branch_name",
  "generation_number",
  "notes_private",
  "visibility",
  "parent-child",
  "spouse/couple",
]) {
  requireIncludes(doc, token, `mapping token ${token}`);
}

for (const token of [
  "GIAPHA4_EXCEL_PATH",
  "SAFE_SKIP_EXCEL_DEPENDENCY_MISSING",
  "printed_pii",
  "db_write",
  "masked_sample_shape",
]) {
  requireIncludes(inspectScript, token, `inspect token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A16_GIAPHA4_EXCEL_IMPORT_MAPPING_READINESS.md", "index entry"],
  [workLog, "A-16 - Import Du Lieu Gia Pha 4.0 Tu File Excel iPhone", "work log entry"],
  [handoff, "A-16 - Import Du Lieu Gia Pha 4.0 Tu File Excel iPhone recorded", "handoff entry"],
  [decisionLog, "Decision 193 - A-16 keeps Gia Pha 4.0 Excel import preview-only until owner approval", "decision log entry"],
  [workLog, marker, "work log marker"],
  [handoff, marker, "handoff marker"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a16:giapha4-excel-import-mapping-readiness"] !==
  "node scripts/check-a16-giapha4-excel-import-mapping-readiness.cjs"
) {
  failures.push("missing package script check:a16:giapha4-excel-import-mapping-readiness");
}

if (
  packageJson?.scripts?.["inspect:giapha4-excel"] !==
  "node scripts/inspect-giapha4-excel-import.cjs"
) {
  failures.push("missing package script inspect:giapha4-excel");
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
    /wrangler\.toml|wrangler\.json|wrangler\.jsonc|open-next\.config|opennext|cloudflare-env|middleware|next\.config|\.github\/workflows/i.test(
      file,
    )
  ) {
    failures.push(`runtime/deploy config changed ${file}`);
  }
  if (
    !allowedChangedFiles.has(file) &&
    (file.startsWith("app/api/") ||
      file.startsWith("lib/") ||
      file.startsWith("server/") ||
      file.startsWith("services/") ||
      file.startsWith("pages/"))
  ) {
    failures.push(`API/service/runtime file changed ${file}`);
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

for (const pattern of [
  /sb_(secret|service)_[A-Za-z0-9_-]{12,}/,
  /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/,
  /Bearer\s+[A-Za-z0-9._-]{12,}/,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
]) {
  rejectPattern(doc, pattern, pattern.toString());
  rejectPattern(inspectScript, pattern, pattern.toString());
}

if (failures.length > 0) {
  console.error("A-16 Gia Pha 4 Excel import mapping readiness check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16 Gia Pha 4 Excel import mapping readiness check passed.");
