const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16Q_FIX2_ROW95_DATE_AND_COUNT_CONSISTENCY.md";
const checkerPath = "scripts/check-a16q-fix2-row95-date-count-consistency.cjs";
const packagePath = "package.json";
const validationPath = "lib/import/giapha4/manifest-validation-service.ts";
const readServicePath = "lib/import/giapha4/manifest-read-service.ts";
const dryRunPath = "lib/import/giapha4/dry-run-mapping-preview-service.ts";
const reviewPackPath = "lib/import/giapha4/import-review-pack-service.ts";
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
const readService = readFile(readServicePath);
const dryRun = readFile(dryRunPath);
const reviewPack = readFile(reviewPackPath);
const panel = readFile(panelPath);
const officialService = readFile(officialServicePath);
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16Q-FIX2",
  "A16Q_FIX2_STATUS=ROW95_WARNING_AND_COUNTS_ALIGNED",
  "Row number: 95",
  "PII: redacted",
  "Death calendar: `unknown`",
  "Expected severity: `warning`",
  "Expected blocker: `false`",
  "same-year",
  "calendar mismatch",
  "Death calendar unknown",
  "102 people, 134 relationships",
  "100 people, 100 relationships",
  "canRunOfficialImport=false",
  "UI button disabled",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

if (
  packageJson?.scripts?.["check:a16q-fix2-row95-date-count-consistency"] !==
  "node scripts/check-a16q-fix2-row95-date-count-consistency.cjs"
) {
  failures.push("missing package script check:a16q-fix2-row95-date-count-consistency");
}

for (const [content, token, label] of [
  [index, "PLAN_A16Q_FIX2_ROW95_DATE_AND_COUNT_CONSISTENCY.md", "index entry"],
  [workLog, "A16Q_FIX2_STATUS=ROW95_WARNING_AND_COUNTS_ALIGNED", "work log status"],
  [decisionLog, "Decision 222", "decision log entry"],
  [handoff, "A16Q_FIX2_STATUS=ROW95_WARNING_AND_COUNTS_ALIGNED", "handoff status"],
]) {
  requireIncludes(content, token, label);
}

for (const token of [
  "A16Q_FIX2_ROW95_SANITIZED_REGRESSION_CASE",
  "rowNumber: 95",
  "pii: \"redacted\"",
  "death_date_calendar_unknown_needs_review",
  "severity: \"warning\"",
  "blocker: false",
  "diagnoseDeathBeforeBirth",
  "deathParts.calendarType === \"unknown\"",
  "!hasSameKnownCalendar(birthParts, deathParts)",
  "reason: \"year_before_birth\"",
  "reason: \"full_date_before_birth\"",
]) {
  requireIncludes(validation, token, `validation token ${token}`);
}

rejectPattern(
  validation,
  /birthParts\s*&&\s*deathParts\s*&&\s*deathParts\.year\s*<\s*birthParts\.year[\s\S]{0,240}"error"/,
  "direct year-before-birth error must go through diagnosis",
);

for (const token of [
  "peoplePreviewCount",
  "relationshipPreviewCount",
  "manifest.session?.personCandidateCount",
  "manifest.session?.relationshipCandidateCount",
]) {
  requireIncludes(validation, token, `validation count token ${token}`);
}

for (const token of [
  "sessionResult.session.relationshipCandidateCount",
  "extractPeoplePreview",
  "if (people.length >= 100) return people",
]) {
  requireIncludes(readService, token, `read service token ${token}`);
}

for (const token of [
  "stagedPeoplePreviewCount",
  "proposedPeoplePreviewCount",
  "stagedRelationshipPreviewCount",
  "proposedRelationshipPreviewCount",
  "manifest.session?.personCandidateCount",
  "manifest.session?.relationshipCandidateCount",
]) {
  requireIncludes(dryRun, token, `dry-run count token ${token}`);
}

for (const token of [
  "peoplePreviewCount",
  "relationshipPreviewCount",
  "proposedPeoplePreviewCount",
  "proposedRelationshipPreviewCount",
]) {
  requireIncludes(reviewPack, token, `review pack token ${token}`);
  requireIncludes(panel, token, `panel token ${token}`);
}

for (const token of [
  "Mẫu",
  "value={validation.summary.peopleCount}",
  "value={validation.summary.peoplePreviewCount}",
  "value={validation.summary.relationshipCount}",
  "value={validation.summary.relationshipPreviewCount}",
]) {
  requireIncludes(panel, token, `panel count label token ${token}`);
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
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  validationPath,
  readServicePath,
  dryRunPath,
  reviewPackPath,
  panelPath,
  "lib/import/giapha4/official-import-preflight-gate.ts",
  "lib/import/giapha4/official-import-service.ts",
  "app/api/admin/import-sessions/[sessionId]/official-import/route.ts",
  "scripts/check-a16q-fix-import-session-ui-date-hydration.cjs",
  "docs/PLAN_A16Q_FIX3_LUNAR_DEATH_DATE_CONTRADICTION.md",
  "scripts/check-a16q-fix3-lunar-death-date-contradiction.cjs",
  "scripts/check-a16q-dup-rls-verify-ui-write-pass.cjs",
  "docs/PLAN_A16Q_LOCAL_UI_IMPORT_SMOKE_GATE_COPY_REFRESH.md",
  "scripts/smoke-a16q-local-ui-import-guided.cjs",
  "scripts/check-a16q-local-ui-import-smoke-gate-copy-refresh.cjs",
  "docs/PLAN_A16Q_DUPLICATE_CANDIDATE_OWNER_DECISION_REVIEW.md",
  "scripts/check-a16q-dup-duplicate-candidate-owner-decision-review.cjs",
  "lib/import/giapha4/duplicate-decision-review-service.ts",
  "app/api/admin/import-sessions/[sessionId]/duplicates/route.ts",
  "db/migrations/20260701_0013_a16q_dup_duplicate_decision_rls_candidate.sql",
  "supabase/migrations/20260701_0013_a16q_dup_duplicate_decision_rls_candidate.sql",
  "db/checks/20260701_check_a16q_dup_duplicate_decision_rls.sql",
]);

const allowedA16qDupSqlFiles = new Set([
  "db/migrations/20260701_0013_a16q_dup_duplicate_decision_rls_candidate.sql",
  "supabase/migrations/20260701_0013_a16q_dup_duplicate_decision_rls_candidate.sql",
  "db/checks/20260701_check_a16q_dup_duplicate_decision_rls.sql",
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
  if (
    (file.startsWith("db/migrations/") || file.startsWith("supabase/migrations/")) &&
    !allowedA16qDupSqlFiles.has(file)
  ) {
    failures.push(`migration must not change ${file}`);
  }
  if (file.startsWith("db/checks/") && !allowedA16qDupSqlFiles.has(file)) {
    failures.push(`SQL check file must not change ${file}`);
  }
  if (/\.(xls|xlsx|csv|png|jpg|jpeg|webp|zip)$/i.test(file)) {
    failures.push(`real data/storage/screenshot file must not be changed ${file}`);
  }
}

for (const content of [doc]) {
  rejectPattern(content, /service_role|SUPABASE_SERVICE_ROLE|eyJ[A-Za-z0-9_-]{20,}\./, "secret-like token");
}

if (failures.length > 0) {
  console.error("A-16Q-FIX2 checker failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16Q-FIX2 checker PASS");
