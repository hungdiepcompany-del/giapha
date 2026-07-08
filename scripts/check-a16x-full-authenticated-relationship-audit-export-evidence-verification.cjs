#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath =
  "docs/PLAN_A16X_FULL_AUTHENTICATED_RELATIONSHIP_AUDIT_EXPORT_EVIDENCE_VERIFICATION.md";
const checkerPath =
  "scripts/check-a16x-full-authenticated-relationship-audit-export-evidence-verification.cjs";
const packagePath = "package.json";
const layoutPath = "app/layout.tsx";
const wranglerPath = "wrangler.toml";
const evidencePath = ".tmp/a16o-dry-run-relationship-audit-export-full.json";
const expectedSha =
  "380E45CFDDAE78D0FEA9904B45B7901901708915E335B8D000428A962B5DE513";

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

function asArrayLength(value) {
  return Array.isArray(value) ? value.length : null;
}

const doc = read(docPath);
const packageJson = readJson(packagePath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const a16wDoc = read("docs/PLAN_A16W_FULL_AUTHENTICATED_RELATIONSHIP_AUDIT_EXPORT_EVIDENCE_READINESS.md");
const a16x2Doc = read(
  "docs/PLAN_A16X2_CORRECT_A16O_FULL_RELATIONSHIP_AUDIT_EXPORT_SHAPE_VERIFICATION.md",
);
const layout = read(layoutPath);
const wrangler = read(wranglerPath);
const a16x2SupersededEvidence =
  a16x2Doc.includes(
    "A16X2_A16O_FULL_RELATIONSHIP_AUDIT_EXPORT_JSON_EVIDENCE_GATE=SATISFIED_SHAPE_ONLY",
  ) &&
  a16x2Doc.includes(
    "A16X2_OWNER_JSON_SHA256=B30CF84A78B78CF750EACE9BDBC9D697040D623B194AB095875E66F8EBFF1289",
  );

for (const token of [
  "A-16X-FULL-AUTHENTICATED-RELATIONSHIP-AUDIT-EXPORT-EVIDENCE-VERIFICATION",
  "A16X_FULL_AUTHENTICATED_EXPORT_EVIDENCE_STATUS=BLOCKED_JSON_SHAPE_MISMATCH",
  "A16X_BLOCKER=OWNER_PROVIDED_JSON_SHAPE_MISMATCH_FAMILY_BACKUP_NOT_A16O_FULL_RELATIONSHIP_AUDIT_EXPORT",
  "A16X_OWNER_JSON_CLASSIFICATION=FAMILY_BACKUP_JSON_NOT_A16O_AUDIT_EXPORT",
  "A16O_DEPLOY_SMOKE_READY_OWNER_FULL_JSON_NEEDED",
  "A16O_EXPORT_AUTH_BOUNDARY_PASS",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "OWNER_PROVIDED_A16W_AUTHENTICATED_FULL_RELATIONSHIP_AUDIT_EXPORT_JSON",
  "D:\\CODE\\gia-pha-family-20260708.json",
  ".tmp\\a16o-dry-run-relationship-audit-export-full.json",
  "A16X_OWNER_JSON_FILE_AVAILABLE=YES",
  "A16X_OWNER_JSON_FILE_SIZE_BYTES=33121",
  `A16X_OWNER_JSON_SHA256=${expectedSha}`,
  "A16X_OWNER_JSON_SHA256_MATCH=YES",
  "A16X_RAW_FULL_JSON_EVIDENCE_COMMITTED=NO",
  "A16X_OWNER_JSON_TOP_LEVEL_TYPE=object",
  "app_export_version",
  "family_parents",
  "tree_layout_nodes",
  "people=8",
  "families=7",
  "family_parents=6",
  "family_children=6",
  "couple_relationships=3",
  "tree_layout_nodes=13",
  "tree_layouts=1",
  "marker=A16O_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY",
  "sessionId=2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "summary.proposedPeopleExportCount=102",
  "summary.proposedRelationshipExportCount=134",
  "proposedPeople.length=102",
  "proposedRelationships.length=134",
  "A16X_A16O_FULL_AUDIT_EXPORT_SHAPE_MATCH=NO",
  "A16X_OFFLINE_A16N_FULL_AUDIT_RUN=NO_SHAPE_MISMATCH",
  "A16X_A16N_FULL_RELATIONSHIP_AUDIT_JSON_ACCEPTED=NO",
  "A16X_NO_GO_RULE=A16R_IMPORT_RETRY_REMAINS_BLOCKED_UNTIL_OWNER_PROVIDES_A16O_FULL_AUDIT_EXPORT_JSON_AND_A16N_OFFLINE_AUDIT_ACCEPTS_IT",
  "A16X_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16X_DIRECT_RPC_OFFICIAL_IMPORT_CALLED=NO",
  "A16X_A16R_IMPORT_RETRY_RUN=NO",
  "A16X_REAL_GENEALOGY_WRITE=NO",
  "A16X_SQL_RUN=NO",
  "A16X_DB_PUSH_RUN=NO",
  "A16X_MIGRATION_REPAIR_RUN=NO",
  "A16X_SEED_RUN=NO",
  "A16X_PERMISSIONS_ROLES_AUTH_USERS_MEMBERSHIPS_MUTATED=NO",
  "A16X_DEPLOY_RUN=NO",
  "A16X_WRANGLER_DEPLOY_RUN=NO",
  "A16X_WRANGLER_TOML_CHANGED=NO",
  "A16X_APP_LAYOUT_TSX_CHANGED=NO",
  "A16X_RAW_JSON_CONTENT_PRINTED=NO",
  "Main Worker touched: `NO`",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [a16wDoc, "A16W_BLOCKER=OWNER_AUTHENTICATED_FULL_RELATIONSHIP_AUDIT_EXPORT_JSON_MISSING", "A-16W prior blocker"],
  [index, "PLAN_A16X_FULL_AUTHENTICATED_RELATIONSHIP_AUDIT_EXPORT_EVIDENCE_VERIFICATION.md", "index entry"],
  [workLog, "A16X_FULL_AUTHENTICATED_EXPORT_EVIDENCE_STATUS=BLOCKED_JSON_SHAPE_MISMATCH", "work log status"],
  [decisionLog, "A-16X rejects family backup JSON as full relationship audit evidence", "decision log entry"],
  [handoff, "A16X_BLOCKER=OWNER_PROVIDED_JSON_SHAPE_MISMATCH_FAMILY_BACKUP_NOT_A16O_FULL_RELATIONSHIP_AUDIT_EXPORT", "handoff blocker"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.[
    "check:a16x-full-authenticated-relationship-audit-export-evidence-verification"
  ] !==
  "node scripts/check-a16x-full-authenticated-relationship-audit-export-evidence-verification.cjs"
) {
  failures.push(
    "missing package script check:a16x-full-authenticated-relationship-audit-export-evidence-verification",
  );
}

const evidenceAbsolutePath = path.join(root, evidencePath);
if (!fs.existsSync(evidenceAbsolutePath)) {
  failures.push(`missing local evidence file ${evidencePath}`);
} else {
  const buffer = fs.readFileSync(evidenceAbsolutePath);
  const sha = crypto.createHash("sha256").update(buffer).digest("hex").toUpperCase();
  const currentEvidenceWasSupersededByA16x2 =
    a16x2SupersededEvidence &&
    buffer.length === 211516 &&
    sha === "B30CF84A78B78CF750EACE9BDBC9D697040D623B194AB095875E66F8EBFF1289";
  if (!currentEvidenceWasSupersededByA16x2) {
    if (buffer.length !== 33121) failures.push(`unexpected evidence size ${buffer.length}`);
    if (sha !== expectedSha) failures.push(`unexpected evidence sha ${sha}`);
  }

  let payload = null;
  try {
    payload = JSON.parse(buffer.toString("utf8"));
  } catch {
    failures.push("evidence file is not valid JSON");
  }

  if (currentEvidenceWasSupersededByA16x2) {
    requireIncludes(
      a16x2Doc,
      "A16X2_A16O_FULL_AUDIT_EXPORT_SHAPE_MATCH=YES",
      "A-16X2 superseding shape evidence",
    );
  } else if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const requiredMissing = [
      "marker",
      "sessionId",
      "dryRunPreviewOnly",
      "auditExportOnly",
      "fullRelationshipAuditExport",
      "readOnly",
      "dbWrite",
      "peopleWrite",
      "relationshipWrite",
      "treeLayoutWrite",
      "revisionWrite",
      "canProceedToOfficialImport",
      "officialImportOpen",
      "summary",
      "proposedPeople",
      "proposedRelationships",
    ].filter((key) => !(key in payload));

    if (requiredMissing.length !== 16) {
      failures.push("evidence unexpectedly resembles A-16O export shape");
    }
    if (payload.marker === "A16O_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY") {
      failures.push("evidence marker unexpectedly matches A-16O full export");
    }
    if (asArrayLength(payload.people) !== 8) failures.push("expected backup people count 8");
    if (asArrayLength(payload.family_parents) !== 6) failures.push("expected backup family_parents count 6");
    if (asArrayLength(payload.family_children) !== 6) failures.push("expected backup family_children count 6");
    if (asArrayLength(payload.proposedPeople) !== null) failures.push("unexpected proposedPeople array exists");
    if (asArrayLength(payload.proposedRelationships) !== null) {
      failures.push("unexpected proposedRelationships array exists");
    }
  } else {
    failures.push("evidence top-level shape is not object");
  }
}

rejectPattern(layout, /crxlauncher|suppressHydrationWarning\s*=\s*{?\s*true/i, "layout hydration workaround");
rejectPattern(wrangler, /A16X|A16O_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY/i, "wrangler evidence/config change");

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
  "scripts/check-a16w-full-authenticated-relationship-audit-export-evidence-readiness.cjs",
  "scripts/check-a16x2-correct-a16o-full-relationship-audit-export-shape-verification.cjs",
  "docs/PLAN_A16X2_CORRECT_A16O_FULL_RELATIONSHIP_AUDIT_EXPORT_SHAPE_VERIFICATION.md",
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

const changedPatch = git(["diff", "--", ...changedFiles.filter((file) => allowedChangedFiles.has(file))]);
for (const pattern of [
  /POST\s+\/official-import/i,
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
  console.error("A-16X full authenticated relationship audit export evidence verification check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16X full authenticated relationship audit export evidence verification check passed.");
