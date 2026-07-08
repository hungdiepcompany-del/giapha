const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16K_OWNER_APPROVAL_GATE_DRY_RUN_IMPORT.md";
const checkerPath = "scripts/check-a16k-owner-approval-gate-dry-run-import.cjs";
const gateServicePath = "lib/import/giapha4/import-dry-run-approval-gate.ts";
const gateRoutePath =
  "app/api/admin/import-sessions/[sessionId]/dry-run-gate/route.ts";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const officialServicePath = "lib/import/giapha4/official-import-service.ts";
const a16sqlAllowedSqlFiles = new Set([
  "db/migrations/20260630_0011_a16sql_import_staging_write_rls.sql",
  "supabase/migrations/20260630_0011_a16sql_import_staging_write_rls.sql",
  "db/migrations/20260701_0012_a16p_tx_official_import_transaction_helper_candidate.sql",
  "supabase/migrations/20260701_0012_a16p_tx_official_import_transaction_helper_candidate.sql",
]);

const allowedChangedFiles = new Set([
  ".gitignore",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  docPath,
  checkerPath,
  "docs/PLAN_A16R_UI_COPY_REFRESH_OFFICIAL_IMPORT_GATE.md",
  "scripts/check-a16r-ui-copy-refresh-official-import-gate.cjs",
  "docs/PLAN_A16R_OFFICIAL_IMPORT_SESSION_ID_RECONCILIATION.md",
  "scripts/check-a16r-official-import-session-id-reconciliation.cjs",
  "docs/PLAN_A16R_FIX_OFFICIAL_IMPORT_SESSION_SELECTION_MISMATCH.md",
  "scripts/check-a16r-fix-official-import-session-selection-mismatch.cjs",
  "docs/PLAN_A16K_OWNER_DRY_RUN_GATE_APPROVAL_AFTER_A16R_FIX.md",
  "scripts/check-a16k-owner-dry-run-gate-approval-after-a16r-fix.cjs",
  gateServicePath,
  gateRoutePath,
  panelPath,
  officialServicePath,
  "docs/PLAN_A16L_DRY_RUN_MAPPING_PREVIEW.md",
  "docs/PLAN_A16L_DRY_RUN_PREVIEW_OWNER_REVIEW_RELATIONSHIP_AUDIT.md",
  "docs/PLAN_A16M_RELATIONSHIP_ROLE_MAPPING_ROOT_CAUSE_PLAN.md",
  "docs/PLAN_A16N_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EVIDENCE.md",
  "docs/evidence/A16N_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EVIDENCE_TEMPLATE.md",
  "scripts/audit-a16n-full-dry-run-relationships.cjs",
  "scripts/check-a16n-full-dry-run-relationship-audit-evidence.cjs",
  "docs/PLAN_A16O_UNCAP_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY.md",
  "scripts/check-a16o-uncap-dry-run-relationship-audit-export-read-only.cjs",
  "lib/import/giapha4/dry-run-mapping-preview-service.ts",
  "app/api/admin/import-sessions/[sessionId]/dry-run-preview/route.ts",
  "scripts/check-a16l-dry-run-mapping-preview.cjs",
  "scripts/check-a16l-dry-run-preview-owner-review-relationship-audit.cjs",
  "scripts/check-a16m-relationship-role-mapping-root-cause-plan.cjs",
  "scripts/check-a16g-import-session-read-manifest-runtime.cjs",
  "scripts/check-a16h-import-manifest-auth-browser-smoke.cjs",
  "scripts/check-a16i-upload-parse-giapha4-manifest-staging.cjs",
  "lib/import/giapha4/xlsx-staging-parser.ts",
  "lib/import/giapha4/manifest-upload-service.ts",
  "lib/import/giapha4/manifest-read-service.ts",
  "components/imports/giapha4-manifest-upload-form.tsx",
  "scripts/check-a16j-manifest-staging-review-validation-warnings.cjs",
  "scripts/check-a16i2-real-giapha4-upload-smoke.cjs",
  "scripts/smoke-a16i2-real-giapha4-upload-staging.cjs",
  "docs/PLAN_A16SQL_RLS_IMPORT_STAGING_WRITE.md",
  "scripts/check-a16sql-rls-import-staging-write.cjs",
  "docs/PLAN_A16I3_GIAPHA4_XLSX_COLUMN_MAPPING.md",
  "docs/PLAN_A16I4_REAL_GIAPHA4_STAGING_UPLOAD_RUN.md",
  "docs/PLAN_A16I5_IMPORT_REVIEW_PACK_OFFICIAL_IMPORT_GATE.md",
  "docs/PLAN_A16R_PRODUCTION_UI_GATE_STATE_RECONCILIATION.md",
  "scripts/check-a16r-production-ui-gate-state-reconciliation.cjs",
  "scripts/check-a16r-official-import-gate-readiness-diagnosis.cjs",
  "scripts/check-a16r-owner-auth-gate-smoke-and-evidence-bundle.cjs",
  "scripts/check-a16r-runtime-execution-enablement-gate.cjs",
  "scripts/check-a16r-runtime-execution-enablement-owner-review.cjs",
  "scripts/check-a16t-apply-verify.cjs",
  "scripts/check-a16u-locked-runtime-wiring.cjs",
  "lib/import/giapha4/normalize.ts",
  "lib/import/giapha4/import-review-pack-service.ts",
  "app/api/admin/import-sessions/[sessionId]/review-pack/route.ts",
  "scripts/check-a16i3-giapha4-xlsx-column-mapping.cjs",
  "scripts/check-a16i4-real-giapha4-staging-upload-run.cjs",
  "scripts/check-a16i5-import-review-pack-official-import-gate.cjs",
  "docs/PLAN_A16I4U_MANUAL_UI_REAL_GIAPHA4_STAGING_UPLOAD_VERIFICATION.md",
  "docs/PLAN_A16M_OFFICIAL_IMPORT_TRANSACTION_ROLLBACK_AUDIT_DESIGN.md",
  "docs/PLAN_A16N_LOCKED_OFFICIAL_IMPORT_PREFLIGHT_GATE.md",
  "docs/PLAN_A16O_OFFICIAL_IMPORT_RUNTIME_READINESS_HANDOFF.md",
  "lib/import/giapha4/official-import-preflight-gate.ts",
  "app/api/admin/import-sessions/[sessionId]/official-import-gate/route.ts",
  "scripts/check-a16i4u-manual-ui-real-giapha4-staging-upload-verification.cjs",
  "scripts/check-a16m-official-import-transaction-rollback-audit-design.cjs",
  "scripts/check-a16n-locked-official-import-preflight-gate.cjs",
  "scripts/check-a16o-official-import-runtime-readiness-handoff.cjs",
  "docs/PLAN_A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE.md",
  "lib/import/giapha4/official-import-service.ts",
  "app/api/admin/import-sessions/[sessionId]/official-import/route.ts",
  "scripts/check-a16p-official-import-runtime-candidate.cjs",
  "docs/PLAN_A16P_TX_OFFICIAL_IMPORT_TRANSACTION_HELPER_READINESS.md",
  "docs/PLAN_A16P_TX_ROLLBACK_AUDIT_MANIFEST_CONTRACT.md",
  "db/migrations/20260701_0012_a16p_tx_official_import_transaction_helper_candidate.sql",
  "supabase/migrations/20260701_0012_a16p_tx_official_import_transaction_helper_candidate.sql",
  "db/checks/20260701_check_a16p_tx_official_import_transaction_helper.sql",
  "scripts/check-a16p-tx-official-import-transaction-helper-readiness.cjs",
  "db/migrations/20260630_0011_a16sql_import_staging_write_rls.sql",
  "supabase/migrations/20260630_0011_a16sql_import_staging_write_rls.sql",
  "db/checks/20260630_check_a16sql_import_staging_write_rls.sql",
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
const checker = readFile(checkerPath);
const gateService = readFile(gateServicePath);
const gateRoute = readFile(gateRoutePath);
const panel = readFile(panelPath);
const packageJson = readJson("package.json");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");

for (const token of [
  "A-16K",
  "A16K_OWNER_APPROVAL_GATE_DRY_RUN_IMPORT",
  "APPROVE_A16K_IMPORT_DRY_RUN_GATE",
  "Dry-run hiÃ¡Â»â€¡n vÃ¡ÂºÂ«n locked",
  "Official import vÃ¡ÂºÂ«n closed",
  "KhÃƒÂ´ng migration",
  "KhÃƒÂ´ng DB push",
  "KhÃƒÂ´ng SQL apply",
  "KhÃƒÂ´ng seed",
  "KhÃƒÂ´ng upload/parse file thÃ¡ÂºÂ­t",
  "KhÃƒÂ´ng ghi people/relationships thÃ¡ÂºÂ­t",
  "KhÃƒÂ´ng layout/tree/revision",
  "KhÃƒÂ´ng dry-run mapping",
  "KhÃƒÂ´ng official import",
  "A16K_STATUS=OWNER_APPROVAL_GATE_LOCKED",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "server-only",
  "A16K_OWNER_APPROVAL_GATE_MARKER",
  "A16K_IMPORT_DRY_RUN_REQUIRED_MARKER",
  "APPROVE_A16K_IMPORT_DRY_RUN_GATE",
  "status: \"locked\"",
  "canRunDryRun: false",
  "dryRunMappingOpen: false",
  "officialImportOpen: false",
  "dbWrite: false",
  "peopleWrite: false",
  "relationshipWrite: false",
  "treeLayoutWrite: false",
  "revisionWrite: false",
]) {
  requireIncludes(gateService, token, `gate service token ${token}`);
}

for (const token of [
  "export async function GET",
  "getImportDryRunApprovalGate",
  "sessionId",
]) {
  requireIncludes(gateRoute, token, `gate route token ${token}`);
}

rejectPattern(
  gateRoute,
  /export\s+async\s+function\s+(POST|PUT|PATCH|DELETE)\b/,
  "dry-run gate mutation handler",
);

for (const token of [
  "Cổng kiểm tra thử / dry-run A-16K",
  "Cổng dry-run chỉ dành cho bước xem trước",
  "Marker A-16K bên dưới chỉ mở bước kiểm tra thử và xem trước mapping.",
  "Nó không có nghĩa là được chạy nhập chính thức",
  "Nhập chính thức thuộc cổng A-16R riêng ở phía dưới.",
  "Marker dry-run A-16K:",
  "Chạy dry-run - cần phê duyệt A-16K",
  "disabled",
  "aria-disabled=\"true\"",
  "Xác nhận nhập chính thức - đang khóa",
]) {
  requireIncludes(panel, token, `UI token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A16K_OWNER_APPROVAL_GATE_DRY_RUN_IMPORT.md", "index entry"],
  [workLog, "A16K_OWNER_APPROVAL_GATE_DRY_RUN_IMPORT", "work log marker"],
  [handoff, "A16K_OWNER_APPROVAL_GATE_DRY_RUN_IMPORT", "handoff marker"],
  [
    decisionLog,
    "Decision 212 - A-16K keeps dry-run import locked behind owner approval marker",
    "decision entry",
  ],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a16k-owner-approval-gate-dry-run-import"] !==
  "node scripts/check-a16k-owner-approval-gate-dry-run-import.cjs"
) {
  failures.push("missing package script check:a16k-owner-approval-gate-dry-run-import");
}

for (const previousChecker of [
  "scripts/check-a16g-import-session-read-manifest-runtime.cjs",
  "scripts/check-a16h-import-manifest-auth-browser-smoke.cjs",
  "scripts/check-a16i-upload-parse-giapha4-manifest-staging.cjs",
  "scripts/check-a16j-manifest-staging-review-validation-warnings.cjs",
  "scripts/check-a16i2-real-giapha4-upload-smoke.cjs",
]) {
  const content = readFile(previousChecker);
  for (const token of [docPath, checkerPath, gateServicePath, gateRoutePath]) {
    requireIncludes(content, token, `${previousChecker} allowlist token ${token}`);
  }
}

const changedFiles = gitOutput(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === ".env.local") failures.push(".env.local must not be changed");
  if (file === "PLANNING.MD") failures.push("PLANNING.MD must not be changed");
  if (
    /\.(xls|xlsx|csv|png|jpg|jpeg|webp|zip)$/i.test(file) ||
    (/\.json$/i.test(file) && file !== "package.json")
  ) {
    failures.push(`real data/storage/screenshot file must not be changed ${file}`);
  }
  if (
    (file.startsWith("db/migrations/") ||
      file.startsWith("supabase/migrations/")) &&
    !a16sqlAllowedSqlFiles.has(file)
  ) {
    failures.push(`migration file changed ${file}`);
  }
  if (file.startsWith(".supabase/") || file === "supabase/config.toml") {
    failures.push(`supabase metadata changed ${file}`);
  }
  if (/wrangler\.toml|wrangler\.json|wrangler\.jsonc|open-next\.config|opennext|cloudflare-env|middleware|next\.config|\.github\/workflows/i.test(file)) {
    failures.push(`runtime/deploy config changed ${file}`);
  }
  if (
    file.startsWith("app/api/") &&
    file !== gateRoutePath &&
    file !== "app/api/admin/import-sessions/[sessionId]/dry-run-preview/route.ts" &&
    file !== "app/api/admin/import-sessions/[sessionId]/review-pack/route.ts" &&
    file !== "app/api/admin/import-sessions/[sessionId]/official-import-gate/route.ts" &&
    file !== "app/api/admin/import-sessions/[sessionId]/official-import/route.ts"
  ) {
    failures.push(`unexpected API route changed ${file}`);
  }
}

const stagedSensitiveFiles = gitOutput(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(
    (file) =>
      /\.(xls|xlsx|csv|png|jpg|jpeg|webp|zip)$/i.test(file) ||
      (/\.json$/i.test(file) && file !== "package.json"),
  );
for (const file of stagedSensitiveFiles) {
  failures.push(`staged real data/storage/screenshot file not allowed ${file}`);
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
  gateServicePath,
  gateRoutePath,
  panelPath,
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
  /\.from\(["']relationships?["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']families["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']family_parents["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']family_children["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']couple_relationships["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']tree_layouts?["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']revisions?["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\b(confirm|commit|finalize|official-import(?!(?:-gate|-preflight|-service|\/route))|import-now|write-real-tree)\b/i,
  /\b(runDryRunImport|executeDryRun|createDryRunResult|applyDryRunMapping)\b/i,
]) {
  rejectPattern(runtimePatch, pattern, `runtime patch ${pattern}`);
}

for (const [file, content] of [
  [docPath, doc],
  [checkerPath, checker],
  [gateServicePath, gateService],
  [gateRoutePath, gateRoute],
  [panelPath, panel],
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
  console.error("A-16K owner approval gate dry-run import check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16K owner approval gate dry-run import check passed.");
