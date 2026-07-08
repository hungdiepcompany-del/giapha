#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16Y_IMPORT_EXECUTION_PLANNING_RECONCILIATION.md";
const checkerPath = "scripts/check-a16y-import-execution-planning-reconciliation.cjs";
const packagePath = "package.json";
const planningPath = "PLANNING.MD";
const layoutPath = "app/layout.tsx";
const wranglerPath = "wrangler.toml";

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
const planning = read(planningPath);
const packageJson = readJson(packagePath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const exportsPage = read("app/(admin)/admin/exports/page.tsx");
const importPage = read("app/(admin)/admin/exports/import/page.tsx");
const dryRunRoute = read("app/api/admin/import-sessions/[sessionId]/dry-run-preview/route.ts");
const dryRunService = read("lib/import/giapha4/dry-run-mapping-preview-service.ts");
const layout = read(layoutPath);
const wrangler = read(wranglerPath);

for (const token of [
  "A-16Y-IMPORT-EXECUTION-PLANNING-RECONCILIATION",
  "A16Y_IMPORT_EXECUTION_PLANNING_STATUS=PASS_PLANNING_RECONCILED_A16R_RETRY_BLOCKED",
  "A16Y_TRUE_OBJECTIVE=SAFELY_IMPORT_GIA_PHA_4_DATA_INTO_PRODUCTION_WITH_DRY_RUN_AUDIT_OWNER_APPROVAL_AND_ROLLBACK_GATES",
  "A16X_BLOCKER=OWNER_PROVIDED_JSON_SHAPE_MISMATCH_FAMILY_BACKUP_NOT_A16O_FULL_RELATIONSHIP_AUDIT_EXPORT",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "A16X_OWNER_JSON_CLASSIFICATION=FAMILY_BACKUP_JSON_NOT_A16O_AUDIT_EXPORT",
  "A16Y_FAMILY_JSON_BACKUP_SUFFICIENT_FOR_A16R_RETRY=NO",
  "A16Y_MISSING_ARTIFACT=A16O_FULL_RELATIONSHIP_AUDIT_EXPORT_JSON",
  "GET /api/admin/import-sessions/2af4bfb6-a20e-453e-9804-1b8c0afbdd68/dry-run-preview?auditExport=relationships-full",
  "marker=A16O_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY",
  "summary.proposedPeopleExportCount=102",
  "summary.proposedRelationshipExportCount=134",
  "A16Y_PRODUCTION_UI_CORRECT_A16O_AUDIT_EXPORT_DOWNLOAD_EXPOSED=NO_OR_UNCLEAR",
  "A16Y_GENERAL_FAMILY_BACKUP_DOWNLOAD_EXPOSED=YES",
  "A16Y_A16O_AUDIT_EXPORT_API_EXISTS=YES",
  "A-16Z-AUDIT-EXPORT-DOWNLOAD-PATH-EXPOSURE",
  "A-16AA-FULL-AUDIT-EXPORT-SHAPE-VERIFY",
  "A-16AB-FULL-RELATIONSHIP-AUDIT-RUN-OFFLINE",
  "A-16AC-RELATIONSHIP-ROLE-MAPPING-FIX-OR-OWNER-ACCEPTANCE-PLAN",
  "A-16AD-FINAL-A16R-RETRY-PREFLIGHT-RECONCILIATION",
  "A16Y_A16R_IMPORT_RETRY_STATUS=NO_BLOCKED_BY_A16X_SHAPE_MISMATCH_AND_MISSING_A16O_AUDIT_EXPORT",
  "Do not start unrelated UI, backup, domain, backup-service, media, custom",
  "Main Worker touched: `NO`",
  "Runtime dependency added: `NO`",
  "OpenNext/Wrangler config changed: `NO`",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [planning, "A-16Y - Import Execution Planning Reconciliation", "planning section"],
  [planning, "A16Y_A16R_IMPORT_RETRY_STATUS=NO_BLOCKED_BY_A16X_SHAPE_MISMATCH_AND_MISSING_A16O_AUDIT_EXPORT", "planning retry status"],
  [index, "PLAN_A16Y_IMPORT_EXECUTION_PLANNING_RECONCILIATION.md", "index entry"],
  [workLog, "A16Y_IMPORT_EXECUTION_PLANNING_STATUS=PASS_PLANNING_RECONCILED_A16R_RETRY_BLOCKED", "work log status"],
  [decisionLog, "A-16Y re-anchors Gia Pha 4 import execution to audit evidence gates", "decision log entry"],
  [handoff, "A16Y_PRODUCTION_UI_CORRECT_A16O_AUDIT_EXPORT_DOWNLOAD_EXPOSED=NO_OR_UNCLEAR", "handoff UI status"],
  [exportsPage, "/admin/exports/download/json", "general family json download"],
  [exportsPage, "family.json", "family json UI title"],
  [importPage, "ImportSessionManifestPanel", "import page manifest panel"],
  [dryRunRoute, "auditExport === \"relationships-full\"", "route audit query"],
  [dryRunService, "A16O_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY", "service audit marker"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a16y-import-execution-planning-reconciliation"] !==
  "node scripts/check-a16y-import-execution-planning-reconciliation.cjs"
) {
  failures.push("missing package script check:a16y-import-execution-planning-reconciliation");
}

rejectPattern(layout, /crxlauncher|suppressHydrationWarning\s*=\s*{?\s*true/i, "layout hydration workaround");
rejectPattern(wrangler, /A16Y|A16O_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY/i, "wrangler evidence/config change");

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  planningPath,
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
  if (
    file.startsWith("app/") ||
    file.startsWith("components/") ||
    file.startsWith("lib/") ||
    file.startsWith(".github/") ||
    file === "next.config.ts" ||
    file === "open-next.config.ts"
  ) {
    failures.push(`runtime/source/config file changed ${file}`);
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
  console.error("A-16Y import execution planning reconciliation check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16Y import execution planning reconciliation check passed.");
