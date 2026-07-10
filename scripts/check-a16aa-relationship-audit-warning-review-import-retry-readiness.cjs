#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath =
  "docs/PLAN_A16AA_RELATIONSHIP_AUDIT_WARNING_REVIEW_IMPORT_RETRY_READINESS.md";
const checkerPath =
  "scripts/check-a16aa-relationship-audit-warning-review-import-retry-readiness.cjs";
const packagePath = "package.json";
const evidencePath = ".tmp/a16o-dry-run-relationship-audit-export-full.json";
const layoutPath = "app/layout.tsx";
const wranglerPath = "wrangler.toml";

const expectedSha =
  "B30CF84A78B78CF750EACE9BDBC9D697040D623B194AB095875E66F8EBFF1289";
const expectedSessionId = "2af4bfb6-a20e-453e-9804-1b8c0afbdd68";
const expectedMarker =
  "A16O_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY";
const expectedWarningCounts = {
  parse_warning_a16i3_birth_date_needs_review: 37,
  birth_date_precision_needs_review: 36,
  parse_warning_a16i3_death_date_needs_review: 8,
  death_date_calendar_conflict_needs_review: 8,
  death_date_precision_needs_review: 3,
  death_same_year_incomplete_precision: 1,
  duplicate_person_candidate: 1,
};

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function readJson(relativePath) {
  const content = read(relativePath);
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    failures.push(`${relativePath} is not valid JSON`);
    return null;
  }
}

function git(args) {
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

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

const doc = read(docPath);
const packageJson = readJson(packagePath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const a16x2Doc = read(
  "docs/PLAN_A16X2_CORRECT_A16O_FULL_RELATIONSHIP_AUDIT_EXPORT_SHAPE_VERIFICATION.md",
);
const layout = read(layoutPath);
const wrangler = read(wranglerPath);

for (const token of [
  "A-16AA-RELATIONSHIP-AUDIT-WARNING-REVIEW-IMPORT-RETRY-READINESS",
  "A16AA_WARNING_REVIEW_STATUS=PASS_WARNINGS_CLASSIFIED_OWNER_REVIEW_REQUIRED",
  "A16AA_IMPORT_BLOCKING_WARNING_CATEGORY_FOUND=NO",
  "A16AA_OWNER_REVIEW_REQUIRED=YES",
  "A16R_IMPORT_RETRY_NEXT=NO",
  ".tmp\\a16o-dry-run-relationship-audit-export-full.json",
  expectedMarker,
  expectedSessionId,
  `SHA256:\n  \`${expectedSha}\``,
  "A16X2_A16O_FULL_RELATIONSHIP_AUDIT_EXPORT_JSON_EVIDENCE_GATE=SATISFIED_SHAPE_ONLY",
  "A16AA_PROPOSED_PEOPLE_COUNT=102",
  "A16AA_PROPOSED_RELATIONSHIPS_COUNT=134",
  "A16AA_RAW_FULL_JSON_EVIDENCE_COMMITTED=NO",
  "A16AA_RAW_JSON_CONTENT_PRINTED=NO",
  "A16AA_TOTAL_ISSUES_COUNT=95",
  "A16AA_INFO_ISSUES_COUNT=1",
  "A16AA_WARNING_COUNT=94",
  "A16AA_BLOCKED_BY_ERROR_COUNT=0",
  "A16AA_SUMMARY_BLOCKED_BY_ERROR_COUNT=0",
  "parse_warning_a16i3_birth_date_needs_review",
  "birth_date_precision_needs_review",
  "parse_warning_a16i3_death_date_needs_review",
  "death_date_calendar_conflict_needs_review",
  "death_date_precision_needs_review",
  "death_same_year_incomplete_precision",
  "duplicate_person_candidate",
  "A16AA_INFO_CATEGORY=parse_warning_a16i3_member_sheet_detected",
  "A16AA_IMPORT_RETRY_READINESS_CLASSIFICATION=OWNER_APPROVAL_CAN_BE_REQUESTED_AFTER_WARNING_REVIEW",
  "A16AA_IMPORT_BLOCKING_ERROR_PRESENT=NO",
  "A16AA_OWNER_ACCEPTANCE_REQUIRED_BEFORE_A16R_RETRY_PREFLIGHT=YES",
  "OWNER_APPROVED_A16AA_WARNING_REVIEW_FOR_A16R_IMPORT_RETRY_PREFLIGHT",
  "A16AA_OWNER_APPROVAL_MARKER_PRESENT=NO",
  "A16AA_A16R_IMPORT_RETRY_PREFLIGHT_READY=NO_OWNER_APPROVAL_MISSING",
  "A16AA_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16AA_DIRECT_RPC_OFFICIAL_IMPORT_CALLED=NO",
  "A16AA_A16R_IMPORT_RETRY_RUN=NO",
  "A16AA_REAL_GENEALOGY_WRITE=NO",
  "A16AA_SQL_RUN=NO",
  "A16AA_DB_PUSH_RUN=NO",
  "A16AA_MIGRATION_REPAIR_RUN=NO",
  "A16AA_SEED_RUN=NO",
  "A16AA_PERMISSIONS_ROLES_AUTH_USERS_MEMBERSHIPS_MUTATED=NO",
  "A16AA_DEPLOY_RUN=NO",
  "A16AA_WRANGLER_DEPLOY_RUN=NO",
  "A16AA_WRANGLER_TOML_CHANGED=NO",
  "A16AA_APP_LAYOUT_TSX_CHANGED=NO",
  "Main Worker touched: `NO`",
  "Runtime dependency added: `NO`",
  "OpenNext/Wrangler config changed: `NO`",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [a16x2Doc, "A16X2_A16O_FULL_AUDIT_EXPORT_SHAPE_MATCH=YES", "A-16X2 shape pass"],
  [index, "PLAN_A16AA_RELATIONSHIP_AUDIT_WARNING_REVIEW_IMPORT_RETRY_READINESS.md", "index entry"],
  [workLog, "A16AA_WARNING_REVIEW_STATUS=PASS_WARNINGS_CLASSIFIED_OWNER_REVIEW_REQUIRED", "work log status"],
  [decisionLog, "A-16AA classifies relationship audit warnings as owner-review required but not import-blocking", "decision log entry"],
  [handoff, "OWNER_APPROVED_A16AA_WARNING_REVIEW_FOR_A16R_IMPORT_RETRY_PREFLIGHT", "handoff owner marker"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.[
    "check:a16aa-relationship-audit-warning-review-import-retry-readiness"
  ] !==
  "node scripts/check-a16aa-relationship-audit-warning-review-import-retry-readiness.cjs"
) {
  failures.push(
    "missing package script check:a16aa-relationship-audit-warning-review-import-retry-readiness",
  );
}

const evidenceAbsolutePath = path.join(root, evidencePath);
if (!fs.existsSync(evidenceAbsolutePath)) {
  failures.push(`missing local evidence file ${evidencePath}`);
} else {
  const buffer = fs.readFileSync(evidenceAbsolutePath);
  const sha = crypto.createHash("sha256").update(buffer).digest("hex").toUpperCase();
  if (sha !== expectedSha) failures.push(`unexpected evidence sha ${sha}`);

  let payload = null;
  try {
    payload = JSON.parse(buffer.toString("utf8"));
  } catch {
    failures.push("evidence file is not valid JSON");
  }

  if (!isPlainObject(payload)) {
    failures.push("evidence top-level shape is not object");
  } else {
    if (payload.marker !== expectedMarker) failures.push("unexpected evidence marker");
    if (payload.sessionId !== expectedSessionId) failures.push("unexpected sessionId");
    if (payload.proposedPeople?.length !== 102) failures.push("expected proposedPeople count 102");
    if (payload.proposedRelationships?.length !== 134) {
      failures.push("expected proposedRelationships count 134");
    }
    if (payload.summary?.blockedByErrorCount !== 0) {
      failures.push("expected blockedByErrorCount 0");
    }
    if (payload.summary?.warningCount !== 94) failures.push("expected warningCount 94");
    if (payload.canProceedToOfficialImport !== false) {
      failures.push("official import proceed flag must be false");
    }
    if (payload.officialImportOpen !== false) failures.push("official import must stay closed");

    const issues = Array.isArray(payload.issues) ? payload.issues : [];
    const severityCounts = {};
    const warningCategoryCounts = {};
    let errorCount = 0;
    for (const issue of issues) {
      const severity = issue?.severity ?? "MISSING_SEVERITY";
      severityCounts[severity] = (severityCounts[severity] ?? 0) + 1;
      if (severity === "error") errorCount += 1;
      if (severity === "warning") {
        const code = issue?.code ?? "MISSING_CODE";
        warningCategoryCounts[code] = (warningCategoryCounts[code] ?? 0) + 1;
      }
    }
    if (issues.length !== 95) failures.push(`expected total issues 95, got ${issues.length}`);
    if (severityCounts.info !== 1) failures.push("expected one info issue");
    if (severityCounts.warning !== 94) failures.push("expected 94 warnings");
    if (errorCount !== 0) failures.push("expected zero error severity issues");
    for (const [category, expectedCount] of Object.entries(expectedWarningCounts)) {
      if (warningCategoryCounts[category] !== expectedCount) {
        failures.push(`unexpected warning count ${category}`);
      }
    }
    const unexpectedWarningCategories = Object.keys(warningCategoryCounts).filter(
      (category) => !(category in expectedWarningCounts),
    );
    if (unexpectedWarningCategories.length > 0) {
      failures.push(`unexpected warning categories ${unexpectedWarningCategories.join(",")}`);
    }
  }
}

rejectPattern(layout, /crxlauncher|suppressHydrationWarning\s*=\s*{?\s*true/i, "layout hydration workaround");
rejectPattern(wrangler, /A16AA|A16O_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY/i, "wrangler evidence/config change");

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  checkerPath,
  packagePath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "docs/PLAN_A16AM_OWNER_SAME_RUN_OFFICIAL_IMPORT_POST_CONFIRMATION.md",
  "scripts/check-a16am-owner-same-run-official-import-post-confirmation.cjs",
  "scripts/check-a16ab-import-retry-preflight-approval-gate.cjs",
  "scripts/check-a16x2-correct-a16o-full-relationship-audit-export-shape-verification.cjs",
  "scripts/check-a16ae-runtime-official-import-enablement-candidate.cjs",
  "scripts/check-a16ah-official-import-runtime-execution-branch-candidate.cjs",
  "scripts/check-a16ak-official-import-session-duplicate-readiness.cjs",
  "scripts/check-a16al-official-import-runtime-marker-alignment.cjs",
  "scripts/check-a16r-official-import-gate-readiness-diagnosis.cjs",
  "scripts/check-a16t-apply-verify.cjs",
  "scripts/check-a16u-locked-runtime-wiring.cjs",
  "scripts/check-a16u-official-import-transaction-branch.cjs",
  "scripts/check-a16ar-owner-same-run-official-import-confirmation-ui-plumbing.cjs",
  "scripts/check-a16ax-cloudflare-runtime-vars-preservation-deploy-wiring.cjs",
  "scripts/check-a16v-official-import-real-transaction-execution-branch.cjs",
  "scripts/check-a16ac-import-retry-execution-final-gate.cjs",
  "docs/PLAN_A16AZ_OFFICIAL_IMPORT_POST_409_SESSION_STATE_DIAGNOSIS.md",
  "scripts/check-a16az-official-import-post-409-session-state-diagnosis.cjs",
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file.startsWith(".tmp/")) failures.push(`.tmp file must not be committed ${file}`);
  if (file !== packagePath && /\.(json|xlsx|xls|csv|zip)$/i.test(file)) {
    failures.push(`raw evidence/data file must not be committed ${file}`);
  }
  if (file === wranglerPath || file === layoutPath) failures.push(`forbidden file changed ${file}`);
  if (/^(db\/migrations|supabase\/migrations|db\/checks)\//.test(file)) {
    failures.push(`forbidden SQL/check file ${file}`);
  }
}

const stagedFiles = git(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected staged file ${file}`);
  if (
    file.startsWith(".tmp/") ||
    (file !== packagePath && /\.(json|xlsx|xls|csv|zip)$/i.test(file))
  ) {
    failures.push(`raw evidence/data file staged ${file}`);
  }
}

const changedPatch = git([
  "diff",
  "--",
  ...changedFiles.filter((file) => allowedChangedFiles.has(file)),
]);
for (const pattern of [
  /export\s+async\s+function\s+POST\b[\s\S]{0,200}official-import/i,
  /method:\s*["']POST["'][\s\S]{0,200}official-import/i,
  /\.rpc\s*\(/i,
  /canProceedToOfficialImport:\s*true/i,
  /canRunOfficialImport:\s*true/i,
  /officialImportOpen:\s*true/i,
  /\bsupabase\s+db\s+push\b/i,
  /"deploy"\s*:\s*"[^"]*wrangler\s+deploy/i,
]) {
  rejectPattern(changedPatch, pattern, `changed patch ${pattern}`);
}

if (failures.length > 0) {
  console.error("A-16AA relationship audit warning review check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16AA relationship audit warning review check passed.");
