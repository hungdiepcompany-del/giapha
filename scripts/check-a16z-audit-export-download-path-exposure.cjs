#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16Z_AUDIT_EXPORT_DOWNLOAD_PATH_EXPOSURE.md";
const checkerPath = "scripts/check-a16z-audit-export-download-path-exposure.cjs";
const packagePath = "package.json";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const routePath = "app/api/admin/import-sessions/[sessionId]/dry-run-preview/route.ts";
const servicePath = "lib/import/giapha4/dry-run-mapping-preview-service.ts";
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
const panel = read(panelPath);
const route = read(routePath);
const service = read(servicePath);
const packageJson = readJson(packagePath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const a16yDoc = read("docs/PLAN_A16Y_IMPORT_EXECUTION_PLANNING_RECONCILIATION.md");
const layout = read(layoutPath);
const wrangler = read(wranglerPath);

for (const token of [
  "A-16Z-AUDIT-EXPORT-DOWNLOAD-PATH-EXPOSURE",
  "A16Z_AUDIT_EXPORT_DOWNLOAD_PATH_STATUS=PASS_OWNER_FACING_READ_ONLY_DOWNLOAD_EXPOSED",
  "A16Z_PURPOSE=PREVENT_FAMILY_JSON_BACKUP_CONFUSION_WITH_A16O_AUDIT_EXPORT_JSON",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "GET /api/admin/import-sessions/2af4bfb6-a20e-453e-9804-1b8c0afbdd68/dry-run-preview?auditExport=relationships-full",
  "/admin/exports/import",
  "components/imports/import-session-manifest-panel.tsx",
  "Tải A-16O audit export JSON",
  "a16o-dry-run-relationship-audit-export-full.json",
  "/admin/exports/download/json",
  "A16Y_FAMILY_JSON_BACKUP_SUFFICIENT_FOR_A16R_RETRY=NO",
  "A16Y_MISSING_ARTIFACT=A16O_FULL_RELATIONSHIP_AUDIT_EXPORT_JSON",
  "A16Z_PRODUCTION_UI_CORRECT_A16O_AUDIT_EXPORT_DOWNLOAD_SOURCE_READY=YES",
  "A16Z_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16Z_DIRECT_RPC_OFFICIAL_IMPORT_CALLED=NO",
  "A16Z_A16R_IMPORT_RETRY_RUN=NO",
  "A16Z_REAL_GENEALOGY_WRITE=NO",
  "A16Z_SQL_RUN=NO",
  "A16Z_DB_PUSH_RUN=NO",
  "A16Z_DEPLOY_RUN=NO",
  "A16Z_WRANGLER_TOML_CHANGED=NO",
  "A16Z_APP_LAYOUT_TSX_CHANGED=NO",
  "Main Worker touched: `YES_MINIMAL_IMPORT_SESSION_UI_ONLY`",
  "Runtime dependency added: `NO`",
  "OpenNext/Wrangler config changed: `NO`",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [panel, "import { ActionLink } from \"@/components/ui/action-link\";", "panel ActionLink import"],
  [panel, "A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID", "audited session constant"],
  [panel, "auditExport=relationships-full", "panel audit export href"],
  [panel, "download=\"a16o-dry-run-relationship-audit-export-full.json\"", "panel download filename"],
  [panel, "A-16O audit export JSON", "button label"],
  [panel, "family.json", "family json distinction"],
  [panel, "A16O_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY", "A-16O marker copy"],
  [route, "export async function GET", "route GET"],
  [route, "auditExport === \"relationships-full\"", "route full export selector"],
  [service, "A16O_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY", "service marker"],
  [service, "officialImportOpen: false", "service official import closed"],
  [a16yDoc, "A16Y_FAMILY_JSON_BACKUP_SUFFICIENT_FOR_A16R_RETRY=NO", "A-16Y family json conclusion"],
  [index, "PLAN_A16Z_AUDIT_EXPORT_DOWNLOAD_PATH_EXPOSURE.md", "index entry"],
  [workLog, "A16Z_AUDIT_EXPORT_DOWNLOAD_PATH_STATUS=PASS_OWNER_FACING_READ_ONLY_DOWNLOAD_EXPOSED", "work log status"],
  [decisionLog, "A-16Z exposes the A-16O audit export path without opening import", "decision log entry"],
  [handoff, "A16Z_PRODUCTION_UI_CORRECT_A16O_AUDIT_EXPORT_DOWNLOAD_SOURCE_READY=YES", "handoff source ready"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a16z-audit-export-download-path-exposure"] !==
  "node scripts/check-a16z-audit-export-download-path-exposure.cjs"
) {
  failures.push("missing package script check:a16z-audit-export-download-path-exposure");
}

rejectPattern(route, /export\s+async\s+function\s+(POST|PUT|PATCH|DELETE)\b/, "dry-run preview route must stay GET-only");
rejectPattern(panel, /href={[^}]*official-import|href="[^"]*official-import/i, "panel must not link official import");
rejectPattern(panel + route + service, /\.rpc\s*\(/, "direct RPC call");
rejectPattern(panel + route + service, /canRunOfficialImport:\s*true|canProceedToOfficialImport:\s*true|officialImportOpen:\s*true/, "official import true flag");
rejectPattern(layout, /crxlauncher|suppressHydrationWarning\s*=\s*{?\s*true/i, "layout hydration workaround");
rejectPattern(wrangler, /A16Z|A16O_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY/i, "wrangler evidence/config change");

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  checkerPath,
  packagePath,
  panelPath,
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

const changedPatch = git(["diff", "--", ...changedFiles.filter((file) => allowedChangedFiles.has(file))]);
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
  console.error("A-16Z audit export download path exposure check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16Z audit export download path exposure check passed.");
