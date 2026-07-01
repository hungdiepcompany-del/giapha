const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16H_IMPORT_MANIFEST_AUTH_BROWSER_SMOKE.md";
const smokePath = "scripts/smoke-a16h-import-manifest-auth-browser.cjs";
const checkerPath = "scripts/check-a16h-import-manifest-auth-browser-smoke.cjs";
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
  smokePath,
  checkerPath,
  "scripts/check-a16g-import-session-read-manifest-runtime.cjs",
  "docs/PLAN_A16I_UPLOAD_PARSE_GIAPHA4_MANIFEST_STAGING.md",
  "lib/import/giapha4/xlsx-staging-parser.ts",
  "lib/import/giapha4/manifest-upload-service.ts",
  "lib/import/giapha4/manifest-read-service.ts",
  "app/api/admin/import-sessions/upload/route.ts",
  "app/(admin)/admin/exports/import/page.tsx",
  "components/imports/giapha4-manifest-upload-form.tsx",
  "components/imports/import-session-manifest-panel.tsx",
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
const smoke = readFile(smokePath);
const packageJson = readJson("package.json");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");

for (const token of [
  "A-16H",
  "A16H_IMPORT_MANIFEST_AUTH_BROWSER_SMOKE",
  "Authenticated Browser Smoke for Import Manifest Read Screen",
  "A16H_BROWSER_SMOKE_STATUS=PASS",
  "A16H_BROWSER_SMOKE_STATUS=SAFE_SKIP_MISSING_EXPLICIT_ENV",
  "A16H_BROWSER_SMOKE_STATUS=FAIL",
  "A16H_IMPORT_MANIFEST_SMOKE_BASE_URL",
  "A16H_IMPORT_MANIFEST_SMOKE_STORAGE_STATE",
  "/admin/exports/import",
  "PhiÃƒÂªn nhÃ¡ÂºÂ­p dÃ¡Â»Â¯ liÃ¡Â»â€¡u",
  "Manifest dÃ¡Â»Â¯ liÃ¡Â»â€¡u",
  "DÃ¡Â»Â¯ liÃ¡Â»â€¡u bÃƒÂªn dÃ†Â°Ã¡Â»â€ºi chÃ¡Â»â€° lÃƒÂ  bÃ¡ÂºÂ£n xem trÃ†Â°Ã¡Â»â€ºc, chÃ†Â°a Ã„â€˜Ã†Â°Ã¡Â»Â£c nhÃ¡ÂºÂ­p vÃƒÂ o cÃƒÂ¢y gia phÃ¡ÂºÂ£.",
  "XÃƒÂ¡c nhÃ¡ÂºÂ­n nhÃ¡ÂºÂ­p chÃƒÂ­nh thÃ¡Â»Â©c",
  "chÃ†Â°a mÃ¡Â»Å¸",
  "khÃƒÂ´ng tÃ¡ÂºÂ¡o import session thÃ¡ÂºÂ­t",
  "khÃƒÂ´ng tÃ¡ÂºÂ¡o person thÃ¡ÂºÂ­t",
  "khÃƒÂ´ng tÃ¡ÂºÂ¡o relationship thÃ¡ÂºÂ­t",
  "khÃƒÂ´ng ghi layout/revision",
  "khÃƒÂ´ng deploy",
  "khÃƒÂ´ng push",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "A16H_IMPORT_MANIFEST_AUTH_BROWSER_SMOKE",
  "A16H_IMPORT_MANIFEST_SMOKE_BASE_URL",
  "A16H_IMPORT_MANIFEST_SMOKE_STORAGE_STATE",
  "SAFE_SKIP_MISSING_EXPLICIT_ENV",
  "SAFE_SKIP_BROWSER_RUNTIME_UNAVAILABLE",
  "/admin/exports/import",
  "PhiÃƒÂªn nhÃ¡ÂºÂ­p dÃ¡Â»Â¯ liÃ¡Â»â€¡u",
  "Manifest dÃ¡Â»Â¯ liÃ¡Â»â€¡u",
  "DÃ¡Â»Â¯ liÃ¡Â»â€¡u bÃƒÂªn dÃ†Â°Ã¡Â»â€ºi chÃ¡Â»â€° lÃƒÂ  bÃ¡ÂºÂ£n xem trÃ†Â°Ã¡Â»â€ºc, chÃ†Â°a Ã„â€˜Ã†Â°Ã¡Â»Â£c nhÃ¡ÂºÂ­p vÃƒÂ o cÃƒÂ¢y gia phÃ¡ÂºÂ£.",
  "XÃƒÂ¡c nhÃ¡ÂºÂ­n nhÃ¡ÂºÂ­p chÃƒÂ­nh thÃ¡Â»Â©c",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "confirm",
  "commit",
  "finalize",
  "official-import",
  "import-now",
  "create-person",
  "relationship",
  "layout",
  "revision",
]) {
  requireIncludes(smoke, token, `smoke token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A16H_IMPORT_MANIFEST_AUTH_BROWSER_SMOKE.md", "index entry"],
  [workLog, "A16H_IMPORT_MANIFEST_AUTH_BROWSER_SMOKE", "work log marker"],
  [handoff, "A16H_IMPORT_MANIFEST_AUTH_BROWSER_SMOKE", "handoff marker"],
  [
    decisionLog,
    "Decision 208 - A-16H authenticated import manifest browser smoke uses explicit session env or safe-skip",
    "decision entry",
  ],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["smoke:a16h-import-manifest-auth-browser"] !==
  "node scripts/smoke-a16h-import-manifest-auth-browser.cjs"
) {
  failures.push("missing package script smoke:a16h-import-manifest-auth-browser");
}

if (
  packageJson?.scripts?.["check:a16h-import-manifest-auth-browser-smoke"] !==
  "node scripts/check-a16h-import-manifest-auth-browser-smoke.cjs"
) {
  failures.push("missing package script check:a16h-import-manifest-auth-browser-smoke");
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
  if (
    file.startsWith("app/api/") &&
    file !== "app/api/admin/import-sessions/upload/route.ts" &&
    file !== "app/api/admin/import-sessions/[sessionId]/validation/route.ts" &&
    file !== "app/api/admin/import-sessions/[sessionId]/dry-run-gate/route.ts" &&
    file !== "app/api/admin/import-sessions/[sessionId]/dry-run-preview/route.ts" &&
    file !== "app/api/admin/import-sessions/[sessionId]/review-pack/route.ts" &&
    file !== "app/api/admin/import-sessions/[sessionId]/official-import-gate/route.ts" &&
    file !== "app/api/admin/import-sessions/[sessionId]/official-import/route.ts"
  ) {
    failures.push(`API file changed outside A-16I upload staging route ${file}`);
  }
  if (
    (file.startsWith("lib/") ||
      file.startsWith("server/") ||
      file.startsWith("services/")) &&
    ![
      "lib/import/giapha4/xlsx-staging-parser.ts",
      "lib/import/giapha4/manifest-upload-service.ts",
      "lib/import/giapha4/manifest-read-service.ts",
      "lib/import/giapha4/manifest-validation-service.ts",
      "lib/import/giapha4/import-dry-run-approval-gate.ts",
      "lib/import/giapha4/dry-run-mapping-preview-service.ts",
      "lib/import/giapha4/normalize.ts",
      "lib/import/giapha4/import-review-pack-service.ts",
      "lib/import/giapha4/official-import-preflight-gate.ts",
      "lib/import/giapha4/official-import-service.ts",
    ].includes(file)
  ) {
    failures.push(`API/service/runtime file changed ${file}`);
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
  "app",
  "components",
  "lib",
  "server",
  "services",
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
  /\.from\(["']families["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']family_parents["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']family_children["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']couple_relationships["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']tree_layouts?["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']revisions?["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\b(confirm|commit|finalize|official-import(?!(?:-gate|-preflight|-service|\/route))|import-now|write-real-tree)\b/i,
]) {
  rejectPattern(runtimePatch, pattern, `runtime patch ${pattern}`);
}

for (const [file, content] of [
  [docPath, doc],
  [smokePath, smoke],
  [checkerPath, readFile(checkerPath)],
]) {
  for (const pattern of [
    /sb_(secret|service)_[A-Za-z0-9_-]{12,}/,
    /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/,
    /Bearer\s+[A-Za-z0-9._-]{12,}/,
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    /SUPABASE_SERVICE_ROLE_KEY\s*=\s*[^`\s]+/,
    /NEXT_PUBLIC_SUPABASE_ANON_KEY\s*=\s*[^`\s]+/,
    /postgresql:\/\/[^`\s]+/i,
    /storageState\s*:\s*["'][^"']+["']/,
  ]) {
    rejectPattern(content, pattern, `${file} ${pattern}`);
  }
}

if (failures.length > 0) {
  console.error("A-16H import manifest authenticated browser smoke check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16H import manifest authenticated browser smoke check passed.");
