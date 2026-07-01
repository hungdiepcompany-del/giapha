const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16Q_FIX_IMPORT_SESSION_UI_DATE_HYDRATION.md";
const checkerPath = "scripts/check-a16q-fix-import-session-ui-date-hydration.cjs";
const smokePath = "scripts/smoke-a16q-import-session-ui-evidence.cjs";
const packagePath = "package.json";
const normalizePath = "lib/import/giapha4/normalize.ts";
const parserPath = "lib/import/giapha4/xlsx-staging-parser.ts";
const validationPath = "lib/import/giapha4/manifest-validation-service.ts";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const servicePath = "lib/import/giapha4/official-import-service.ts";
const routePath =
  "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";
const layoutPath = "app/layout.tsx";

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
readFile(checkerPath);
const smoke = readFile(smokePath);
const packageJson = readJson(packagePath);
const normalize = readFile(normalizePath);
const parser = readFile(parserPath);
const validation = readFile(validationPath);
const panel = readFile(panelPath);
const service = readFile(servicePath);
const route = readFile(routePath);
const layout = readFile(layoutPath);
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16Q-FIX",
  "A16Q_FIX_STATUS=VALIDATION_FIX_READY_UI_SMOKE_SAFE_SKIP_CAPABLE",
  "deathYear < birthYear",
  "ERROR `death_before_birth`",
  "WARNING, không block",
  "full date precision",
  "same-year/incomplete precision",
  "birthDateCalendar = solar",
  "deathDateCalendar = lunar | solar | unknown",
  "deathAnniversaryCalendar = lunar",
  "Không so sánh trực tiếp",
  "dòng 19",
  "dòng 95",
  "crxlauncher",
  "browser extension",
  "Không thêm `suppressHydrationWarning`",
  "canRunOfficialImport=false",
  "UI button disabled",
  "Không gọi RPC",
  "Không gọi POST official import",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

if (
  packageJson?.scripts?.["check:a16q-fix-import-session-ui-date-hydration"] !==
  "node scripts/check-a16q-fix-import-session-ui-date-hydration.cjs"
) {
  failures.push("missing package script check:a16q-fix-import-session-ui-date-hydration");
}

if (
  packageJson?.scripts?.["smoke:a16q-import-session-ui-evidence"] !==
  "node scripts/smoke-a16q-import-session-ui-evidence.cjs"
) {
  failures.push("missing package script smoke:a16q-import-session-ui-evidence");
}

for (const [content, token, label] of [
  [index, "PLAN_A16Q_FIX_IMPORT_SESSION_UI_DATE_HYDRATION.md", "index entry"],
  [workLog, "A16Q_FIX_STATUS=VALIDATION_FIX_READY_UI_SMOKE_SAFE_SKIP_CAPABLE", "work log status"],
  [decisionLog, "Decision 221", "decision log entry"],
  [handoff, "A16Q_FIX_STATUS=VALIDATION_FIX_READY_UI_SMOKE_SAFE_SKIP_CAPABLE", "handoff status"],
]) {
  requireIncludes(content, token, label);
}

const yearOnlyIndex = normalize.indexOf('if (/^\\d{4}$/.test(normalized))');
const serialIndex = normalize.indexOf('if (/^\\d+(\\.\\d+)?$/.test(normalized))');
if (yearOnlyIndex === -1 || serialIndex === -1 || yearOnlyIndex > serialIndex) {
  failures.push("year-only Gia Pha 4 date must be handled before Excel serial parsing");
}
requireIncludes(normalize, "Ngày chỉ có năm", "year-only date warning");

for (const token of [
  "headerTextByKey",
  "inferDateCalendarFromHeader",
  "birth_date_calendar",
  "death_date_calendar",
  "death_anniversary_calendar",
  "return \"solar\"",
  "return \"lunar\"",
  "return \"unknown\"",
]) {
  requireIncludes(parser, token, `parser calendar token ${token}`);
}

for (const token of [
  'precision: "year" | "year_month" | "full"',
  'calendarType: "solar" | "lunar" | "unknown"',
  "inferBirthDateCalendar",
  "inferDeathDateCalendar",
  "hasSameKnownCalendar",
  "death_date_calendar_mismatch_needs_review",
  "death_date_calendar_unknown_needs_review",
  "death_date_precision_needs_review",
  "birth_date_precision_needs_review",
  "death_same_year_incomplete_precision",
  "deathParts.year < birthParts.year",
  "deathParts.year === birthParts.year",
  "!hasSameKnownCalendar(birthParts, deathParts)",
  "hasSameKnownCalendar(birthParts, deathParts)",
  "!isFullDatePrecision(birthParts)",
  "!isFullDatePrecision(deathParts)",
  "compareFullDateParts(deathParts, birthParts) < 0",
]) {
  requireIncludes(validation, token, `validation token ${token}`);
}
rejectPattern(validation, /compareDateParts\s*\(/, "old missing-precision comparison");

const sameYearWarningBlock =
  /death_same_year_incomplete_precision[\s\S]{0,240}"warning"/.test(validation) ||
  /"warning"[\s\S]{0,240}death_same_year_incomplete_precision/.test(validation);
if (!sameYearWarningBlock) {
  failures.push("same-year incomplete precision case must be a warning");
}

for (const token of [
  "canRunOfficialImport: false",
  "transactionStatus: \"BLOCKED_TRANSACTION_HELPER_NOT_APPLIED\"",
]) {
  requireIncludes(service, token, `service lock token ${token}`);
}
rejectPattern(service, /\.rpc\s*\(/i, "official import service must not call RPC");

for (const token of [
  "A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED",
  "canRunOfficialImport: false",
]) {
  requireIncludes(route, token, `route lock token ${token}`);
}

for (const token of ["disabled", "aria-disabled=\"true\"", "Xác nhận nhập chính thức"]) {
  requireIncludes(panel, token, `panel disabled token ${token}`);
}

requireIncludes(layout, '<html lang="vi" className="h-full">', "plain root html tag");
rejectPattern(layout, /crxlauncher/i, "layout must not create crxlauncher");
rejectPattern(layout, /suppressHydrationWarning/i, "layout must not suppress hydration warning");

for (const token of [
  "SAFE_SKIP_MISSING_EXPLICIT_ENV",
  "A16Q_FIX_IMPORT_SESSION_SMOKE_BASE_URL",
  "A16Q_FIX_IMPORT_SESSION_SMOKE_STORAGE_STATE",
  "official import CTA is not disabled",
  "dangerous mutation detected",
]) {
  requireIncludes(smoke, token, `smoke token ${token}`);
}
rejectPattern(smoke, /\.rpc\s*\(/i, "smoke must not call RPC");
rejectPattern(smoke, /official-import(?!.*CTA|.*locked|.*disabled|.*button|.*route|.*gate)/i, "smoke must not target official import endpoint");

const scriptFiles = gitOutput(["ls-files", "scripts"])
  .split(/\r?\n/)
  .filter(Boolean)
  .filter((file) => !path.basename(file).startsWith("check-"));

for (const file of scriptFiles) {
  const content = file === smokePath ? smoke : readFile(file);
  rejectPattern(
    content,
    /\.rpc\s*\(\s*["']a16p_tx_execute_giapha4_official_import["']/i,
    `${file} must not call official import RPC`,
  );
  rejectPattern(
    content,
    /method\s*:\s*["']POST["'][\s\S]{0,240}official-import(?!-gate)/i,
    `${file} must not POST official import`,
  );
}

const allowedChangedFiles = new Set([
  docPath,
  checkerPath,
  smokePath,
  packagePath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  normalizePath,
  parserPath,
  validationPath,
  "components/imports/import-session-manifest-panel.tsx",
  "lib/import/giapha4/dry-run-mapping-preview-service.ts",
  "lib/import/giapha4/import-review-pack-service.ts",
  "lib/import/giapha4/manifest-read-service.ts",
  "docs/PLAN_A16Q_FIX2_ROW95_DATE_AND_COUNT_CONSISTENCY.md",
  "scripts/check-a16q-fix2-row95-date-count-consistency.cjs",
]);

const changedFiles = gitOutput(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === ".env.local" || file.endsWith(".env.local")) {
    failures.push(".env.local must not be changed");
  }
  if (file.startsWith("db/migrations/") || file.startsWith("supabase/migrations/")) {
    failures.push(`migration must not change ${file}`);
  }
  if (file.startsWith("db/checks/")) {
    failures.push(`SQL check file must not change ${file}`);
  }
  if (/\.(xls|xlsx|csv|png|jpg|jpeg|webp|zip)$/i.test(file)) {
    failures.push(`real data/storage/screenshot file must not be changed ${file}`);
  }
}

for (const file of gitOutput(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean)) {
  if (/\.(xls|xlsx|csv|png|jpg|jpeg|webp|zip)$/i.test(file)) {
    failures.push(`forbidden staged data/storage file ${file}`);
  }
}

for (const content of [doc, smoke]) {
  rejectPattern(content, /service_role|SUPABASE_SERVICE_ROLE|eyJ[A-Za-z0-9_-]{20,}\./, "secret-like token");
}

if (failures.length > 0) {
  console.error("A-16Q-FIX checker failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16Q-FIX checker PASS");
