#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath =
  "docs/PLAN_A16X2_CORRECT_A16O_FULL_RELATIONSHIP_AUDIT_EXPORT_SHAPE_VERIFICATION.md";
const checkerPath =
  "scripts/check-a16x2-correct-a16o-full-relationship-audit-export-shape-verification.cjs";
const packagePath = "package.json";
const evidencePath = ".tmp/a16o-dry-run-relationship-audit-export-full.json";
const layoutPath = "app/layout.tsx";
const wranglerPath = "wrangler.toml";

const expectedSha =
  "B30CF84A78B78CF750EACE9BDBC9D697040D623B194AB095875E66F8EBFF1289";
const expectedSessionId = "2af4bfb6-a20e-453e-9804-1b8c0afbdd68";
const expectedMarker =
  "A16O_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY";

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
const a16zDoc = read("docs/PLAN_A16Z_AUDIT_EXPORT_DOWNLOAD_PATH_EXPOSURE.md");
const a16xDoc = read(
  "docs/PLAN_A16X_FULL_AUTHENTICATED_RELATIONSHIP_AUDIT_EXPORT_EVIDENCE_VERIFICATION.md",
);
const layout = read(layoutPath);
const wrangler = read(wranglerPath);

for (const token of [
  "A-16X2-CORRECT-A16O-FULL-RELATIONSHIP-AUDIT-EXPORT-SHAPE-VERIFICATION",
  "A16X2_FULL_AUTHENTICATED_EXPORT_EVIDENCE_STATUS=PASS_CORRECT_A16O_FULL_RELATIONSHIP_AUDIT_EXPORT_SHAPE",
  "A16X2_A16O_FULL_RELATIONSHIP_AUDIT_EXPORT_JSON_EVIDENCE_GATE=SATISFIED_SHAPE_ONLY",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "OWNER_PROVIDED_A16X2_CORRECT_A16O_FULL_RELATIONSHIP_AUDIT_EXPORT_JSON",
  "/admin/exports/import",
  "Tai A-16O audit export JSON",
  "a16o-dry-run-relationship-audit-export-full.json",
  ".tmp\\a16o-dry-run-relationship-audit-export-full.json",
  "A16X2_OWNER_JSON_FILE_AVAILABLE=YES",
  "A16X2_OWNER_JSON_FILE_SIZE_BYTES=211516",
  `A16X2_OWNER_JSON_SHA256=${expectedSha}`,
  "A16X2_OWNER_PROMPT_SHA_PLACEHOLDER=YES",
  "A16X2_RAW_FULL_JSON_EVIDENCE_COMMITTED=NO",
  "A16X2_RAW_JSON_CONTENT_PRINTED=NO",
  "A16X2_OWNER_JSON_TOP_LEVEL_TYPE=object",
  "approvalMarker",
  "proposedPeople",
  "proposedRelationships",
  `A16X2_EXPECTED_MARKER=${expectedMarker}`,
  `A16X2_OWNER_JSON_MARKER=${expectedMarker}`,
  "A16X2_SESSION_ID_PRESENT=YES",
  "A16X2_SESSION_ID_MATCHES_AUDITED=YES",
  `A16X2_SESSION_ID=${expectedSessionId}`,
  "A16X2_SUMMARY_PRESENT=YES",
  "A16X2_SUMMARY_PROPOSED_PEOPLE_COUNT=102",
  "A16X2_SUMMARY_PROPOSED_PEOPLE_EXPORT_COUNT=102",
  "A16X2_SUMMARY_PROPOSED_RELATIONSHIP_COUNT=134",
  "A16X2_SUMMARY_PROPOSED_RELATIONSHIP_EXPORT_COUNT=134",
  "A16X2_SUMMARY_EXPORT_CAPPED=NO",
  "A16X2_SUMMARY_BLOCKED_BY_ERROR_COUNT=0",
  "A16X2_SUMMARY_WARNING_COUNT=94",
  "A16X2_PROPOSED_PEOPLE_COUNT=102",
  "A16X2_PROPOSED_RELATIONSHIPS_COUNT=134",
  "A16X2_DRY_RUN_PREVIEW_ONLY=YES",
  "A16X2_AUDIT_EXPORT_ONLY=YES",
  "A16X2_FULL_RELATIONSHIP_AUDIT_EXPORT=YES",
  "A16X2_READ_ONLY=YES",
  "A16X2_DB_WRITE=NO",
  "A16X2_PEOPLE_WRITE=NO",
  "A16X2_RELATIONSHIP_WRITE=NO",
  "A16X2_TREE_LAYOUT_WRITE=NO",
  "A16X2_REVISION_WRITE=NO",
  "A16X2_CAN_PROCEED_TO_OFFICIAL_IMPORT=NO",
  "A16X2_OFFICIAL_IMPORT_OPEN=NO",
  "A16X2_A16O_FULL_AUDIT_EXPORT_SHAPE_MATCH=YES",
  "A16X2_OWNER_JSON_CLASSIFICATION=A16O_FULL_RELATIONSHIP_AUDIT_EXPORT_JSON",
  "A16X2_FAMILY_JSON_BACKUP_SHAPE=NO",
  "A-16AB-FULL-RELATIONSHIP-AUDIT-RUN-OFFLINE",
  "A16X2_OFFLINE_A16N_FULL_AUDIT_RUN=NO_SHAPE_ONLY_PHASE",
  "A16X2_A16R_IMPORT_RETRY_APPROVAL_PRESENT=NO",
  "A16X2_FOLLOW_UP_UI_MOJIBAKE_REVIEW_NEEDED=YES",
  "A16X2_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16X2_DIRECT_RPC_OFFICIAL_IMPORT_CALLED=NO",
  "A16X2_A16R_IMPORT_RETRY_RUN=NO",
  "A16X2_REAL_GENEALOGY_WRITE=NO",
  "A16X2_SQL_RUN=NO",
  "A16X2_DB_PUSH_RUN=NO",
  "A16X2_MIGRATION_REPAIR_RUN=NO",
  "A16X2_SEED_RUN=NO",
  "A16X2_PERMISSIONS_ROLES_AUTH_USERS_MEMBERSHIPS_MUTATED=NO",
  "A16X2_DEPLOY_RUN=NO",
  "A16X2_WRANGLER_DEPLOY_RUN=NO",
  "A16X2_WRANGLER_TOML_CHANGED=NO",
  "A16X2_APP_LAYOUT_TSX_CHANGED=NO",
  "Main Worker touched: `NO`",
  "Runtime dependency added: `NO`",
  "OpenNext/Wrangler config changed: `NO`",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [a16zDoc, "A16Z_PRODUCTION_UI_CORRECT_A16O_AUDIT_EXPORT_DOWNLOAD_SOURCE_READY=YES", "A-16Z source ready"],
  [a16xDoc, "A16X_A16O_FULL_AUDIT_EXPORT_SHAPE_MATCH=NO", "A-16X prior mismatch"],
  [index, "PLAN_A16X2_CORRECT_A16O_FULL_RELATIONSHIP_AUDIT_EXPORT_SHAPE_VERIFICATION.md", "index entry"],
  [workLog, "A16X2_FULL_AUTHENTICATED_EXPORT_EVIDENCE_STATUS=PASS_CORRECT_A16O_FULL_RELATIONSHIP_AUDIT_EXPORT_SHAPE", "work log status"],
  [decisionLog, "A-16X2 accepts the correct A-16O audit export shape without opening import", "decision log entry"],
  [handoff, "A16X2_A16O_FULL_RELATIONSHIP_AUDIT_EXPORT_JSON_EVIDENCE_GATE=SATISFIED_SHAPE_ONLY", "handoff evidence gate"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.[
    "check:a16x2-correct-a16o-full-relationship-audit-export-shape-verification"
  ] !==
  "node scripts/check-a16x2-correct-a16o-full-relationship-audit-export-shape-verification.cjs"
) {
  failures.push(
    "missing package script check:a16x2-correct-a16o-full-relationship-audit-export-shape-verification",
  );
}

const evidenceAbsolutePath = path.join(root, evidencePath);
if (!fs.existsSync(evidenceAbsolutePath)) {
  failures.push(`missing local evidence file ${evidencePath}`);
} else {
  const buffer = fs.readFileSync(evidenceAbsolutePath);
  const sha = crypto.createHash("sha256").update(buffer).digest("hex").toUpperCase();
  if (buffer.length !== 211516) failures.push(`unexpected evidence size ${buffer.length}`);
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
    const summary = isPlainObject(payload.summary) ? payload.summary : null;
    if (payload.marker !== expectedMarker) failures.push("unexpected evidence marker");
    if (payload.sessionId !== expectedSessionId) failures.push("unexpected sessionId");
    if (!summary) failures.push("missing summary object");
    if (!Array.isArray(payload.proposedPeople)) failures.push("missing proposedPeople array");
    if (!Array.isArray(payload.proposedRelationships)) {
      failures.push("missing proposedRelationships array");
    }
    if (payload.proposedPeople?.length !== 102) failures.push("expected proposedPeople count 102");
    if (payload.proposedRelationships?.length !== 134) {
      failures.push("expected proposedRelationships count 134");
    }
    if (summary?.proposedPeopleCount !== 102) failures.push("expected summary proposedPeopleCount 102");
    if (summary?.proposedPeopleExportCount !== 102) {
      failures.push("expected summary proposedPeopleExportCount 102");
    }
    if (summary?.proposedRelationshipCount !== 134) {
      failures.push("expected summary proposedRelationshipCount 134");
    }
    if (summary?.proposedRelationshipExportCount !== 134) {
      failures.push("expected summary proposedRelationshipExportCount 134");
    }
    if (summary?.exportCapped !== false) failures.push("expected exportCapped false");
    if (summary?.blockedByErrorCount !== 0) failures.push("expected blockedByErrorCount 0");
    if (summary?.warningCount !== 94) failures.push("expected warningCount 94");
    for (const [key, expected] of [
      ["dryRunPreviewOnly", true],
      ["auditExportOnly", true],
      ["fullRelationshipAuditExport", true],
      ["readOnly", true],
      ["dbWrite", false],
      ["peopleWrite", false],
      ["relationshipWrite", false],
      ["treeLayoutWrite", false],
      ["revisionWrite", false],
      ["canProceedToOfficialImport", false],
      ["officialImportOpen", false],
    ]) {
      if (payload[key] !== expected) failures.push(`unexpected flag ${key}`);
    }
    for (const backupKey of [
      "app_export_version",
      "schema_version",
      "families",
      "family_parents",
      "family_children",
      "tree_layouts",
      "tree_layout_nodes",
    ]) {
      if (backupKey in payload) failures.push(`backup-style key present ${backupKey}`);
    }
  }
}

rejectPattern(layout, /crxlauncher|suppressHydrationWarning\s*=\s*{?\s*true/i, "layout hydration workaround");
rejectPattern(wrangler, /A16X2|A16O_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY/i, "wrangler evidence/config change");

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
  "scripts/check-a16x-full-authenticated-relationship-audit-export-evidence-verification.cjs",
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
  console.error("A-16X2 correct A-16O full relationship audit export shape check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16X2 correct A-16O full relationship audit export shape check passed.");
