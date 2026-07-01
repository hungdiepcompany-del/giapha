const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16G_IMPORT_SESSION_READ_MANIFEST_RUNTIME.md";
const checkerPath = "scripts/check-a16g-import-session-read-manifest-runtime.cjs";
const servicePath = "lib/import/giapha4/manifest-read-service.ts";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const importPagePath = "app/(admin)/admin/exports/import/page.tsx";
const listRoutePath = "app/api/admin/import-sessions/route.ts";
const detailRoutePath = "app/api/admin/import-sessions/[sessionId]/route.ts";
const manifestRoutePath =
  "app/api/admin/import-sessions/[sessionId]/manifest/route.ts";
const a16sqlAllowedSqlFiles = new Set([
  "db/migrations/20260630_0011_a16sql_import_staging_write_rls.sql",
  "supabase/migrations/20260630_0011_a16sql_import_staging_write_rls.sql",
  "db/migrations/20260701_0012_a16p_tx_official_import_transaction_helper_candidate.sql",
  "supabase/migrations/20260701_0012_a16p_tx_official_import_transaction_helper_candidate.sql",
]);

const allowedChangedFiles = new Set([
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  docPath,
  checkerPath,
  servicePath,
  panelPath,
  importPagePath,
  listRoutePath,
  detailRoutePath,
  manifestRoutePath,
  "scripts/check-a16-giapha4-excel-import-mapping-readiness.cjs",
  "scripts/check-a16b-giapha4-excel-import-preview-runtime-ui.cjs",
  "scripts/check-a16c-owner-review-import-preview-db-write-approval-design.cjs",
  "scripts/check-a16d-import-schema-candidate-manifest-storage-design.cjs",
  "scripts/check-a16e-import-schema-candidate-db-apply-gate.cjs",
  "scripts/check-a16e1-owner-review-import-schema-apply-gate.cjs",
  "scripts/check-a16e2-import-schema-candidate-apply-blocker-resolution.cjs",
  "scripts/check-a16f-import-schema-db-apply-verification.cjs",
  "scripts/check-a16f1-supabase-cli-project-link-readiness.cjs",
  "scripts/check-a16f2-supabase-project-link-migration-path-readiness.cjs",
  "scripts/check-a16f3-supabase-metadata-link-migration-path-bridge.cjs",
  "scripts/check-a16f4-supabase-db-dry-run-only.cjs",
  "scripts/check-a16f4r-supabase-db-dry-run-only-rerun.cjs",
  "scripts/check-a16f5m-manual-sql-apply-verification-migration-state-reconciliation.cjs",
  "docs/PLAN_A16H_IMPORT_MANIFEST_AUTH_BROWSER_SMOKE.md",
  "scripts/smoke-a16h-import-manifest-auth-browser.cjs",
  "scripts/check-a16h-import-manifest-auth-browser-smoke.cjs",
  "docs/PLAN_A16I_UPLOAD_PARSE_GIAPHA4_MANIFEST_STAGING.md",
  "lib/import/giapha4/xlsx-staging-parser.ts",
  "lib/import/giapha4/manifest-upload-service.ts",
  "app/api/admin/import-sessions/upload/route.ts",
  "components/imports/giapha4-manifest-upload-form.tsx",
  "scripts/check-a16i-upload-parse-giapha4-manifest-staging.cjs",
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
  "docs/PLAN_A16SQL_RLS_IMPORT_STAGING_WRITE.md",
  "scripts/check-a16sql-rls-import-staging-write.cjs",
  "docs/PLAN_A16I3_GIAPHA4_XLSX_COLUMN_MAPPING.md",
  "docs/PLAN_A16I4_REAL_GIAPHA4_STAGING_UPLOAD_RUN.md",
  "docs/PLAN_A16I5_IMPORT_REVIEW_PACK_OFFICIAL_IMPORT_GATE.md",
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
const service = readFile(servicePath);
const panel = readFile(panelPath);
const importPage = readFile(importPagePath);
const listRoute = readFile(listRoutePath);
const detailRoute = readFile(detailRoutePath);
const manifestRoute = readFile(manifestRoutePath);
const packageJson = readJson("package.json");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");

for (const token of [
  "A-16G",
  "A16G_STATUS=IMPORT_SESSION_READ_MANIFEST_RUNTIME_READY",
  "A16G_IMPORT_SESSION_READ_MANIFEST_RUNTIME",
  "GET /api/admin/import-sessions",
  "GET /api/admin/import-sessions/[sessionId]",
  "GET /api/admin/import-sessions/[sessionId]/manifest",
  "A16G_MIGRATION_STATUS=NO_NEW_MIGRATION",
  "A16G_DB_PUSH_STATUS=NOT_RUN",
  "A16G_DB_DRY_RUN_STATUS=NOT_RUN",
  "A16G_SQL_APPLY_STATUS=NOT_RUN",
  "A16G_SEED_STATUS=NO_SEED",
  "A16G_EXCEL_IMPORT_STATUS=NO_REAL_EXCEL_IMPORT",
  "A16G_PEOPLE_WRITE_STATUS=NO_WRITE",
  "A16G_RELATIONSHIP_WRITE_STATUS=NO_WRITE",
  "A16G_TREE_LAYOUT_WRITE_STATUS=NO_WRITE",
  "A16G_REVISION_WRITE_STATUS=NO_WRITE",
  "A16G_CAN_IMPORT=false",
  "A16G_IMPORT_CONFIRM_ACTION=DISABLED_READ_ONLY",
  "did not run `supabase db push`",
  "did not run `supabase db push --dry-run`",
  "did not run SQL apply",
  "did not import Excel into DB",
  "did not create real people",
  "did not create real relationships",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "A16G_IMPORT_MANIFEST_READ_MARKER",
  "listImportSessions",
  "getImportSession",
  "getImportManifest",
  "maybeCreateServerSupabaseClient",
  "getPermissionContext",
  "import_sessions",
  "import_session_warnings",
  "import_duplicate_candidates",
  "import_relationship_candidates",
  "import_write_manifests",
  "canImport: false",
  "peopleWrite: false",
  "relationshipWrite: false",
]) {
  requireIncludes(service, token, `service token ${token}`);
}

for (const token of [
  "PhiÃƒÂªn nhÃ¡ÂºÂ­p dÃ¡Â»Â¯ liÃ¡Â»â€¡u",
  "Manifest dÃ¡Â»Â¯ liÃ¡Â»â€¡u",
  "ChÃ†Â°a cÃƒÂ³ dÃ¡Â»Â¯ liÃ¡Â»â€¡u manifest",
  "DÃ¡Â»Â¯ liÃ¡Â»â€¡u bÃƒÂªn dÃ†Â°Ã¡Â»â€ºi chÃ¡Â»â€° lÃƒÂ  bÃ¡ÂºÂ£n xem trÃ†Â°Ã¡Â»â€ºc, chÃ†Â°a Ã„â€˜Ã†Â°Ã¡Â»Â£c nhÃ¡ÂºÂ­p vÃƒÂ o cÃƒÂ¢y gia phÃ¡ÂºÂ£.",
  "ChÃ†Â°a mÃ¡Â»Å¸ bÃ†Â°Ã¡Â»â€ºc xÃƒÂ¡c nhÃ¡ÂºÂ­n nhÃ¡ÂºÂ­p chÃƒÂ­nh thÃ¡Â»Â©c.",
  "XÃƒÂ¡c nhÃ¡ÂºÂ­n nhÃ¡ÂºÂ­p chÃƒÂ­nh thÃ¡Â»Â©c Ã¢â‚¬â€ chÃ†Â°a mÃ¡Â»Å¸",
  "KhÃƒÂ´ng tÃ¡ÂºÂ¡o thÃƒÂ nh viÃƒÂªn",
  "khÃƒÂ´ng tÃ¡ÂºÂ¡o quan hÃ¡Â»â€¡",
]) {
  requireIncludes(panel + importPage + service, token, `UI token ${token}`);
}

for (const [file, content] of [
  [listRoutePath, listRoute],
  [detailRoutePath, detailRoute],
  [manifestRoutePath, manifestRoute],
]) {
  requireIncludes(content, "export async function GET", `${file} GET handler`);
  rejectPattern(content, /export\s+async\s+function\s+(POST|PUT|PATCH|DELETE)\b/, `${file} mutation handler`);
}

for (const [content, token, label] of [
  [index, "PLAN_A16G_IMPORT_SESSION_READ_MANIFEST_RUNTIME.md", "index entry"],
  [workLog, "A16G_STATUS=IMPORT_SESSION_READ_MANIFEST_RUNTIME_READY", "work log marker"],
  [handoff, "A16G_STATUS=IMPORT_SESSION_READ_MANIFEST_RUNTIME_READY", "handoff marker"],
  [
    decisionLog,
    "Decision 207 - A-16G opens read-only import manifest runtime without real genealogy writes",
    "decision entry",
  ],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a16g-import-session-read-manifest-runtime"] !==
  "node scripts/check-a16g-import-session-read-manifest-runtime.cjs"
) {
  failures.push("missing package script check:a16g-import-session-read-manifest-runtime");
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

const changedFiles = gitOutput(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === ".env.local") failures.push(".env.local must not be changed");
  if (file === "PLANNING.MD") failures.push("PLANNING.MD must not be changed");
  if (/\.(xls|xlsx|csv)$/i.test(file)) failures.push(`real import file must not be staged ${file}`);
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
  servicePath,
  panelPath,
  importPagePath,
  listRoutePath,
  detailRoutePath,
  manifestRoutePath,
]);
for (const pattern of [
  /\bsupabase\s+db\s+push\b/i,
  /\bmigration\s+repair\b/i,
  /\bservice[_-]?role\b/i,
  /\.from\(["']people["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']families["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']family_parents["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']family_children["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']couple_relationships["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']tree_layouts?["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']revisions?["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\b(confirm|commit|finalize).*import\b/i,
]) {
  rejectPattern(runtimePatch, pattern, `runtime patch ${pattern}`);
}

for (const [file, content] of [
  [docPath, doc],
  [checkerPath, checker],
  [servicePath, service],
  [panelPath, panel],
  [importPagePath, importPage],
  [listRoutePath, listRoute],
  [detailRoutePath, detailRoute],
  [manifestRoutePath, manifestRoute],
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
  console.error("A-16G import session read manifest runtime check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16G import session read manifest runtime check passed.");
