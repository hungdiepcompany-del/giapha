const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16I_UPLOAD_PARSE_GIAPHA4_MANIFEST_STAGING.md";
const checkerPath = "scripts/check-a16i-upload-parse-giapha4-manifest-staging.cjs";
const parserPath = "lib/import/giapha4/xlsx-staging-parser.ts";
const servicePath = "lib/import/giapha4/manifest-upload-service.ts";
const routePath = "app/api/admin/import-sessions/upload/route.ts";
const uploadFormPath = "components/imports/giapha4-manifest-upload-form.tsx";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const pagePath = "app/(admin)/admin/exports/import/page.tsx";

const allowedChangedFiles = new Set([
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  docPath,
  checkerPath,
  parserPath,
  servicePath,
  routePath,
  uploadFormPath,
  panelPath,
  pagePath,
  "lib/import/giapha4/manifest-read-service.ts",
  "scripts/check-a16g-import-session-read-manifest-runtime.cjs",
  "scripts/check-a16h-import-manifest-auth-browser-smoke.cjs",
  "docs/PLAN_A16J_MANIFEST_STAGING_REVIEW_VALIDATION_WARNINGS.md",
  "lib/import/giapha4/manifest-validation-service.ts",
  "app/api/admin/import-sessions/[sessionId]/validation/route.ts",
  "scripts/check-a16j-manifest-staging-review-validation-warnings.cjs",
  "docs/PLAN_A16I2_REAL_GIAPHA4_UPLOAD_SMOKE.md",
  "scripts/smoke-a16i2-real-giapha4-upload-staging.cjs",
  "scripts/check-a16i2-real-giapha4-upload-smoke.cjs",
  "docs/PLAN_A16K_OWNER_APPROVAL_GATE_DRY_RUN_IMPORT.md",
  "lib/import/giapha4/import-dry-run-approval-gate.ts",
  "app/api/admin/import-sessions/[sessionId]/dry-run-gate/route.ts",
  "scripts/check-a16k-owner-approval-gate-dry-run-import.cjs",
  "docs/PLAN_A16L_DRY_RUN_MAPPING_PREVIEW.md",
  "lib/import/giapha4/dry-run-mapping-preview-service.ts",
  "app/api/admin/import-sessions/[sessionId]/dry-run-preview/route.ts",
  "scripts/check-a16l-dry-run-mapping-preview.cjs",
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
const parser = readFile(parserPath);
const service = readFile(servicePath);
const route = readFile(routePath);
const uploadForm = readFile(uploadFormPath);
const panel = readFile(panelPath);
const page = readFile(pagePath);
const manifestReadService = readFile("lib/import/giapha4/manifest-read-service.ts");
const packageJson = readJson("package.json");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const a16gChecker = readFile("scripts/check-a16g-import-session-read-manifest-runtime.cjs");
const a16hChecker = readFile("scripts/check-a16h-import-manifest-auth-browser-smoke.cjs");

for (const token of [
  "A-16I",
  "A16I_UPLOAD_PARSE_GIAPHA4_MANIFEST_STAGING",
  "POST /api/admin/import-sessions/upload",
  "staging-only",
  "XLSX",
  "XLS",
  "Không migration",
  "Không DB push",
  "Không SQL apply",
  "Không seed/import vào bảng thật",
  "Không tạo people/person thật",
  "Không tạo relationship thật",
  "Không cập nhật layout/tree/revision thật",
  "Không mở import chính thức",
  "Không deploy",
  "Không push",
  "A-16J",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "A16I_GIAPHA4_STAGING_PARSER_MARKER",
  "JSZip",
  "parseGiaPha4XlsxForStaging",
  "A16I_XLS_NOT_SUPPORTED_WITHOUT_PARSER_DEPENDENCY",
  "A16I_HEADER_NOT_RECOGNIZED",
  "personCandidates",
  "relationshipCandidates",
  "duplicateCandidates",
  "warnings",
]) {
  requireIncludes(parser, token, `parser token ${token}`);
}

for (const token of [
  "uploadGiaPha4ManifestStaging",
  "maybeCreateServerSupabaseClient",
  "getPermissionContext",
  "imports.create",
  "import_sessions",
  "import_session_warnings",
  "import_duplicate_candidates",
  "import_relationship_candidates",
  "import_write_manifests",
  "A16I_STAGING_ONLY_NOT_APPROVED",
  "canImport: false",
  "peopleWrite: false",
  "relationshipWrite: false",
  "treeLayoutWrite: false",
  "revisionWrite: false",
]) {
  requireIncludes(service, token, `service token ${token}`);
}

for (const token of [
  "export async function POST",
  "uploadGiaPha4ManifestStaging",
]) {
  requireIncludes(route, token, `route token ${token}`);
}

for (const token of [
  "Tải lên file Gia Phả 4",
  "Chỉ ghi vào vùng staging, chưa nhập vào cây gia phả thật.",
  "Chọn file",
  "Đọc file và tạo manifest",
  "Đang đọc file...",
  "Đã tạo manifest staging",
  "Không đọc được file Gia Phả 4",
  "Xác nhận nhập chính thức — chưa mở",
  "/api/admin/import-sessions/upload",
]) {
  requireIncludes(uploadForm + page, token, `UI token ${token}`);
}

for (const token of [
  "peoplePreview",
  "Thành viên staging",
  "Quan hệ staging",
  "Xác nhận nhập chính thức — chưa mở",
]) {
  requireIncludes(panel + manifestReadService, token, `manifest read UI token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A16I_UPLOAD_PARSE_GIAPHA4_MANIFEST_STAGING.md", "index entry"],
  [workLog, "A16I_UPLOAD_PARSE_GIAPHA4_MANIFEST_STAGING", "work log marker"],
  [handoff, "A16I_UPLOAD_PARSE_GIAPHA4_MANIFEST_STAGING", "handoff marker"],
  [
    decisionLog,
    "Decision 209 - A-16I stages Gia Phả 4 uploads without opening official import",
    "decision entry",
  ],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a16i-upload-parse-giapha4-manifest-staging"] !==
  "node scripts/check-a16i-upload-parse-giapha4-manifest-staging.cjs"
) {
  failures.push("missing package script check:a16i-upload-parse-giapha4-manifest-staging");
}

if (
  packageJson?.scripts?.["check:a16j-manifest-staging-review-validation-warnings"] !==
  "node scripts/check-a16j-manifest-staging-review-validation-warnings.cjs"
) {
  failures.push("missing package script check:a16j-manifest-staging-review-validation-warnings");
}

for (const token of [
  "check:a16i-upload-parse-giapha4-manifest-staging",
  routePath,
  servicePath,
]) {
  requireIncludes(a16gChecker, token, `A-16G checker allowlist token ${token}`);
  requireIncludes(a16hChecker, token, `A-16H checker allowlist token ${token}`);
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

const stagedDataFiles = gitOutput(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter((file) => /\.(xls|xlsx|csv)$/i.test(file));
for (const file of stagedDataFiles) {
  failures.push(`staged real import file not allowed ${file}`);
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

const runtimePatch = gitOutput([
  "diff",
  "--",
  parserPath,
  servicePath,
  routePath,
  uploadFormPath,
  panelPath,
  pagePath,
  "lib/import/giapha4/manifest-read-service.ts",
  "lib/import/giapha4/import-dry-run-approval-gate.ts",
  "app/api/admin/import-sessions/[sessionId]/dry-run-gate/route.ts",
  "lib/import/giapha4/dry-run-mapping-preview-service.ts",
  "app/api/admin/import-sessions/[sessionId]/dry-run-preview/route.ts",
]);

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
  /\.from\(["']families["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']family_parents["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']family_children["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']couple_relationships["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']tree_layouts?["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']revisions?["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\b(confirm|commit|finalize|official-import|import-now|write-real-tree)\b/i,
]) {
  rejectPattern(runtimePatch, pattern, `runtime patch ${pattern}`);
}

const uploadRouteNames = gitOutput(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter((file) => file.startsWith("app/api/") || file.includes("actions."));
for (const file of uploadRouteNames) {
  if (
    file !== routePath &&
    file !== "app/api/admin/import-sessions/[sessionId]/validation/route.ts" &&
    file !== "app/api/admin/import-sessions/[sessionId]/dry-run-gate/route.ts" &&
    file !== "app/api/admin/import-sessions/[sessionId]/dry-run-preview/route.ts"
  ) {
    failures.push(`unexpected API/action changed ${file}`);
  }
}

for (const [file, content] of [
  [docPath, doc],
  [checkerPath, readFile(checkerPath)],
  [parserPath, parser],
  [servicePath, service],
  [routePath, route],
  [uploadFormPath, uploadForm],
  [panelPath, panel],
  [pagePath, page],
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

if (failures.length > 0) {
  console.error("A-16I upload/parse Gia Pha 4 manifest staging check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16I upload/parse Gia Pha 4 manifest staging check passed.");
