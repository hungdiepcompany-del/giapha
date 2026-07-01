const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16Q_FIX3_LUNAR_DEATH_DATE_CONTRADICTION.md";
const checkerPath = "scripts/check-a16q-fix3-lunar-death-date-contradiction.cjs";
const packagePath = "package.json";
const validationPath = "lib/import/giapha4/manifest-validation-service.ts";
const duplicateClientPath = "components/imports/duplicate-decision-review-client.tsx";
const duplicateServicePath =
  "lib/import/giapha4/duplicate-decision-review-service.ts";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const officialServicePath = "lib/import/giapha4/official-import-service.ts";

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
const packageJson = readJson(packagePath);
const validation = readFile(validationPath);
const duplicateClient = readFile(duplicateClientPath);
const duplicateService = readFile(duplicateServicePath);
const panel = readFile(panelPath);
const officialService = readFile(officialServicePath);
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16Q-FIX3",
  "A16Q_FIX3_STATUS=LUNAR_DEATH_CONTRADICTION_WARNING_DUP_SAVE_VERIFIED",
  "Row number: 95",
  "PII: redacted",
  "2014-05-26",
  "2014-04-28",
  "Ngày mất (Dương lịch)",
  "28/4/2014",
  "tức ngày ... âm lịch",
  "calendar_conflict",
  "death_date_calendar_conflict_needs_review",
  "Expected severity: `warning`",
  "Expected blocker: `false`",
  "unresolved_duplicate_rows=8",
  "canRunOfficialImport=false",
  "Official import button remains disabled",
  "No RPC call",
  "No POST `/official-import`",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

if (
  packageJson?.scripts?.["check:a16q-fix3-lunar-death-date-contradiction"] !==
  "node scripts/check-a16q-fix3-lunar-death-date-contradiction.cjs"
) {
  failures.push("missing package script check:a16q-fix3-lunar-death-date-contradiction");
}

for (const [content, token, label] of [
  [index, "PLAN_A16Q_FIX3_LUNAR_DEATH_DATE_CONTRADICTION.md", "index entry"],
  [
    workLog,
    "A16Q_FIX3_STATUS=LUNAR_DEATH_CONTRADICTION_WARNING_DUP_SAVE_VERIFIED",
    "work log status",
  ],
  [decisionLog, "Decision 227", "decision log entry"],
  [
    handoff,
    "A16Q_FIX3_STATUS=LUNAR_DEATH_CONTRADICTION_WARNING_DUP_SAVE_VERIFIED",
    "handoff status",
  ],
]) {
  requireIncludes(content, token, label);
}

for (const token of [
  "A16Q_FIX3_ROW95_LUNAR_CONTRADICTION_REGRESSION_CASE",
  "rowNumber: 95",
  "pii: \"redacted\"",
  "birthDateText: \"2014-05-26\"",
  "deathDateText: \"2014-04-28\"",
  "deathAnniversaryLunarDate: \"28/4/2014\"",
  "notesPattern: \"tức ngày ... âm lịch\"",
  "inferredDeathCalendar: \"calendar_conflict\"",
  "death_date_calendar_conflict_needs_review",
  "severity: \"warning\"",
  "blocker: false",
  "hasDeathDateCalendarContradiction",
  "slashDateToIso(person.memorialLunarDate)",
  "extractVietnameseDateMentionIso",
  "notesMentionSameSolarBirthAndDeath",
  "deathParts.calendarType === \"calendar_conflict\"",
  "Ngày mất có dấu hiệu khác hệ lịch với ngày sinh",
  "trùng ngày giỗ âm lịch",
]) {
  requireIncludes(validation, token, `validation token ${token}`);
}

for (const token of [
  "deathParts.calendarType === \"unknown\"",
  "!hasSameKnownCalendar(birthParts, deathParts)",
  "reason: \"year_before_birth\"",
  "reason: \"full_date_before_birth\"",
  "compareFullDateParts(deathParts, birthParts) < 0",
]) {
  requireIncludes(validation, token, `strict error guard token ${token}`);
}

if (
  !/deathParts\.calendarType === "calendar_conflict"[\s\S]{0,160}status:\s*"warning"[\s\S]{0,160}code: "death_date_calendar_conflict_needs_review"/.test(
    validation,
  )
) {
  failures.push("calendar conflict must return warning conflict diagnosis");
}

for (const token of [
  "method: \"PATCH\"",
  "Lưu quyết định",
  "Đã lưu quyết định",
  "createInitialDrafts",
  "normalizeInitialDecision",
]) {
  requireIncludes(duplicateClient, token, `duplicate client token ${token}`);
}
rejectPattern(
  duplicateClient,
  /useEffect\s*\([\s\S]{0,320}saveDecision|saveDecision\s*\([^)]*\)\s*;?\s*\/\/\s*auto/i,
  "duplicate client must not auto-save owner decisions",
);
rejectPattern(
  duplicateClient,
  /setDrafts\s*\([\s\S]{0,240}(create_new|link_existing|ignore_candidate)[\s\S]{0,240}\)/i,
  "duplicate client must not auto choose a final decision",
);

for (const token of [
  "canRunOfficialImport: false",
  "canProceedToOfficialImport: false",
  "peopleWrite: false",
  "relationshipWrite: false",
  "realGenealogyWrite: false",
]) {
  requireIncludes(duplicateService, token, `duplicate service guard token ${token}`);
}
rejectPattern(duplicateService, /\.rpc\s*\(/i, "duplicate service must not call RPC");

for (const token of [
  "DuplicateDecisionReviewClient",
  "Xác nhận nhập chính thức — chưa mở",
  "disabled",
  "aria-disabled=\"true\"",
]) {
  requireIncludes(panel, token, `panel lock token ${token}`);
}

for (const token of [
  "canRunOfficialImport: false",
  "transactionStatus: \"BLOCKED_TRANSACTION_HELPER_NOT_APPLIED\"",
]) {
  requireIncludes(officialService, token, `official import lock token ${token}`);
}
rejectPattern(officialService, /\.rpc\s*\(/i, "official import service must not call RPC");

const scriptFiles = gitOutput(["ls-files", "scripts"])
  .split(/\r?\n/)
  .filter(Boolean)
  .filter((file) => !path.basename(file).startsWith("check-"));

for (const file of scriptFiles) {
  const content = readFile(file);
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
  packagePath,
  validationPath,
  "scripts/check-a16q-fix-import-session-ui-date-hydration.cjs",
  "scripts/check-a16q-fix2-row95-date-count-consistency.cjs",
  "scripts/check-a16q-dup-rls-verify-ui-write-pass.cjs",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
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
  if (file.startsWith("supabase/.temp/")) {
    failures.push(`supabase/.temp must not be changed ${file}`);
  }
  if (/\.(xls|xlsx|csv|png|jpg|jpeg|webp|zip|storageState\.json)$/i.test(file)) {
    failures.push(`real data/storage/screenshot file must not be changed ${file}`);
  }
}

for (const content of [doc, validation]) {
  rejectPattern(content, /service_role|SUPABASE_SERVICE_ROLE|eyJ[A-Za-z0-9_-]{20,}\./, "secret-like token");
}

if (failures.length > 0) {
  console.error("A-16Q-FIX3 checker failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16Q-FIX3 checker PASS");
