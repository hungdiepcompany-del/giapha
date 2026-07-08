#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16AB_IMPORT_RETRY_PREFLIGHT_APPROVAL_GATE.md";
const checkerPath = "scripts/check-a16ab-import-retry-preflight-approval-gate.cjs";
const packagePath = "package.json";
const evidencePath = ".tmp/a16o-dry-run-relationship-audit-export-full.json";
const layoutPath = "app/layout.tsx";
const wranglerPath = "wrangler.toml";

const expectedSha =
  "B30CF84A78B78CF750EACE9BDBC9D697040D623B194AB095875E66F8EBFF1289";
const expectedMarker =
  "A16O_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY";
const expectedSessionId = "2af4bfb6-a20e-453e-9804-1b8c0afbdd68";

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

const doc = read(docPath);
const packageJson = readJson(packagePath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const a16oDoc = read("docs/PLAN_A16O_UNCAP_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY.md");
const a16x2Doc = read(
  "docs/PLAN_A16X2_CORRECT_A16O_FULL_RELATIONSHIP_AUDIT_EXPORT_SHAPE_VERIFICATION.md",
);
const a16aaDoc = read(
  "docs/PLAN_A16AA_RELATIONSHIP_AUDIT_WARNING_REVIEW_IMPORT_RETRY_READINESS.md",
);
const layout = read(layoutPath);
const wrangler = read(wranglerPath);

for (const token of [
  "A-16AB-A16R-IMPORT-RETRY-PREFLIGHT-APPROVAL-GATE",
  "A16AB_PREFLIGHT_STATUS=PASS_READY_FOR_SEPARATE_OWNER_IMPORT_EXECUTION_APPROVAL",
  "A16AB_FINAL_PREFLIGHT_CLASSIFICATION=READY_FOR_SEPARATE_OWNER_IMPORT_EXECUTION_APPROVAL",
  "A16AB_A16R_IMPORT_RETRY_EXECUTED=NO",
  "A16R_IMPORT_RETRY_NEXT=NO",
  expectedMarker,
  expectedSessionId,
  "GET /api/admin/import-sessions/2af4bfb6-a20e-453e-9804-1b8c0afbdd68/dry-run-preview?auditExport=relationships-full",
  "canProceedToOfficialImport=false",
  "officialImportOpen=false",
  "A16X2_A16O_FULL_RELATIONSHIP_AUDIT_EXPORT_JSON_EVIDENCE_GATE=SATISFIED_SHAPE_ONLY",
  expectedSha,
  "proposedPeople=102",
  "proposedRelationships=134",
  "blockedByErrorCount=0",
  "warningCount=94",
  "A16AA_WARNING_REVIEW_STATUS=PASS_WARNINGS_CLASSIFIED_OWNER_REVIEW_REQUIRED",
  "A16AA_WARNING_COUNT=94",
  "A16AA_BLOCKED_BY_ERROR_COUNT=0",
  "A16AA_IMPORT_BLOCKING_WARNING_CATEGORY_FOUND=NO",
  "A16AA_OWNER_REVIEW_REQUIRED=YES",
  "OWNER_APPROVED_A16AA_WARNING_REVIEW_FOR_A16R_IMPORT_RETRY_PREFLIGHT",
  "A16AB_OWNER_A16AA_WARNING_REVIEW_APPROVAL_MARKER_PRESENT=YES",
  "A16AB_A16O_FULL_AUDIT_EXPORT_GATE=PASS",
  "A16AB_A16X2_SHAPE_GATE=PASS",
  "A16AB_A16AA_WARNING_REVIEW_GATE=PASS",
  "A16AB_OWNER_WARNING_REVIEW_APPROVAL_GATE=PASS",
  "A16AB_BLOCKED_ERROR_GATE=PASS_ZERO_BLOCKED_ERRORS",
  "A16AB_IMPORT_BLOCKING_WARNING_GATE=PASS_NONE_FOUND",
  "OWNER_APPROVED_A16R_IMPORT_RETRY_EXECUTION",
  "A16AB_OWNER_IMPORT_EXECUTION_APPROVAL_MARKER_PRESENT=NO",
  "A16AB_IMPORT_EXECUTION_PHASE_REQUIRED=YES",
  "A16AB_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16AB_DIRECT_RPC_OFFICIAL_IMPORT_CALLED=NO",
  "A16AB_A16R_IMPORT_RETRY_RUN=NO",
  "A16AB_REAL_GENEALOGY_WRITE=NO",
  "A16AB_SQL_RUN=NO",
  "A16AB_DB_PUSH_RUN=NO",
  "A16AB_MIGRATION_REPAIR_RUN=NO",
  "A16AB_SEED_RUN=NO",
  "A16AB_PERMISSIONS_ROLES_AUTH_USERS_MEMBERSHIPS_MUTATED=NO",
  "A16AB_DEPLOY_RUN=NO",
  "A16AB_WRANGLER_DEPLOY_RUN=NO",
  "A16AB_WRANGLER_TOML_CHANGED=NO",
  "A16AB_APP_LAYOUT_TSX_CHANGED=NO",
  "A16AB_RAW_JSON_CONTENT_PRINTED=NO",
  "A16AB_RAW_FULL_JSON_EVIDENCE_COMMITTED=NO",
  "Main Worker touched: `NO`",
  "Runtime dependency added: `NO`",
  "OpenNext/Wrangler config changed: `NO`",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [a16oDoc, "A16O_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY", "A-16O marker"],
  [a16x2Doc, "A16X2_A16O_FULL_RELATIONSHIP_AUDIT_EXPORT_JSON_EVIDENCE_GATE=SATISFIED_SHAPE_ONLY", "A-16X2 shape gate"],
  [a16aaDoc, "A16AA_IMPORT_BLOCKING_WARNING_CATEGORY_FOUND=NO", "A-16AA warning gate"],
  [index, "PLAN_A16AB_IMPORT_RETRY_PREFLIGHT_APPROVAL_GATE.md", "index entry"],
  [workLog, "A16AB_PREFLIGHT_STATUS=PASS_READY_FOR_SEPARATE_OWNER_IMPORT_EXECUTION_APPROVAL", "work log status"],
  [decisionLog, "A-16AB marks retry preflight ready for separate owner import execution approval", "decision log entry"],
  [handoff, "A16AB_FINAL_PREFLIGHT_CLASSIFICATION=READY_FOR_SEPARATE_OWNER_IMPORT_EXECUTION_APPROVAL", "handoff classification"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a16ab-import-retry-preflight-approval-gate"] !==
  "node scripts/check-a16ab-import-retry-preflight-approval-gate.cjs"
) {
  failures.push("missing package script check:a16ab-import-retry-preflight-approval-gate");
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
  if (payload) {
    if (payload.marker !== expectedMarker) failures.push("unexpected evidence marker");
    if (payload.sessionId !== expectedSessionId) failures.push("unexpected evidence sessionId");
    if (payload.proposedPeople?.length !== 102) failures.push("expected proposedPeople count 102");
    if (payload.proposedRelationships?.length !== 134) {
      failures.push("expected proposedRelationships count 134");
    }
    if (payload.summary?.blockedByErrorCount !== 0) {
      failures.push("expected blockedByErrorCount 0");
    }
    if (payload.summary?.warningCount !== 94) failures.push("expected warningCount 94");
    if (payload.canProceedToOfficialImport !== false) {
      failures.push("canProceedToOfficialImport must be false");
    }
    if (payload.officialImportOpen !== false) failures.push("officialImportOpen must be false");
  }
}

rejectPattern(layout, /crxlauncher|suppressHydrationWarning\s*=\s*{?\s*true/i, "layout hydration workaround");
rejectPattern(wrangler, /A16AB|A16O_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY/i, "wrangler evidence/config change");

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
  if (file.startsWith(".tmp/") || /\.(json|xlsx|xls|csv|zip)$/i.test(file)) {
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
  console.error("A-16AB import retry preflight approval gate check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16AB import retry preflight approval gate check passed.");
