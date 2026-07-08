#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath =
  "docs/PLAN_A16O_UNCAP_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY.md";
const checkerPath =
  "scripts/check-a16o-uncap-dry-run-relationship-audit-export-read-only.cjs";
const routePath =
  "app/api/admin/import-sessions/[sessionId]/dry-run-preview/route.ts";
const previewServicePath =
  "lib/import/giapha4/dry-run-mapping-preview-service.ts";
const manifestReadPath = "lib/import/giapha4/manifest-read-service.ts";
const auditScriptPath = "scripts/audit-a16n-full-dry-run-relationships.cjs";
const packagePath = "package.json";
const wranglerPath = "wrangler.toml";
const layoutPath = "app/layout.tsx";

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

function rejectIncludes(content, token, label = token) {
  if (content.includes(token)) failures.push(`forbidden ${label}`);
}

function rejectPattern(content, pattern, label = String(pattern)) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

const doc = read(docPath);
const route = read(routePath);
const previewService = read(previewServicePath);
const manifestRead = read(manifestReadPath);
const auditScript = read(auditScriptPath);
const packageJson = readJson(packagePath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const wrangler = read(wranglerPath);
const layout = read(layoutPath);

for (const token of [
  "A-16O-UNCAP-DRY-RUN-RELATIONSHIP-AUDIT-EXPORT-READ-ONLY",
  "2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "ae7a5fe3-6a29-4f60-85f7-76108ed02565",
  "proposedRelationshipPreviewCount=100",
  "proposedRelationshipCount=134",
  "REVIEW_ROLE_GENDER_MISMATCH=34",
  "father_label_source_gender_female=17",
  "mother_label_source_gender_male=17",
  "A16O_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY",
  "A16L_DRY_RUN_MAPPING_PREVIEW_FROM_MANIFEST_STAGING",
  "APPROVE_A16K_IMPORT_DRY_RUN_GATE",
  "auditExportOnly=true",
  "fullRelationshipAuditExport=true",
  "readOnly=true",
  "dbWrite=false",
  "peopleWrite=false",
  "relationshipWrite=false",
  "treeLayoutWrite=false",
  "revisionWrite=false",
  "canProceedToOfficialImport=false",
  "officialImportOpen=false",
  "exportCapped=false",
  "proposedPeopleExportCount=102",
  "proposedRelationshipExportCount=134",
  "A-16O-DEPLOY-READ-ONLY-AUDIT-EXPORT-SMOKE",
  "A16R_IMPORT_RETRY_NEXT=NO",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [route, "export async function GET", "route GET"],
  [route, "auditExport", "route auditExport query"],
  [route, "relationships-full", "route relationships-full query"],
  [previewService, "A16O_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY", "service marker"],
  [previewService, "sourceMarker", "service source marker"],
  [previewService, "auditExportOnly = true", "service audit export flag assignment"],
  [previewService, "fullRelationshipAuditExport = true", "service full export flag assignment"],
  [previewService, "summary.exportCapped = false", "service export capped false"],
  [previewService, "summary.proposedPeopleExportCount", "service people export count"],
  [previewService, "summary.proposedRelationshipExportCount", "service relationship export count"],
  [previewService, "getImportDryRunApprovalGate(sessionId)", "service A-16K gate"],
  [previewService, "A16K_AUDITED_DRY_RUN_SESSION_ID", "service audited session const"],
  [manifestRead, "fullAuditExport?: boolean", "manifest full audit option"],
  [manifestRead, "const previewLimit = options.fullAuditExport ? 1000 : 100", "default cap preserved"],
  [manifestRead, ".limit(previewLimit)", "manifest query limit option"],
  [auditScript, "A16N_FULL_RELATIONSHIP_AUDIT_JSON_ACCEPTED", "audit script accepted marker"],
  [auditScript, "A16N_CAPPED_PREVIEW_JSON_REJECTED_FOR_FULL_AUDIT", "audit script capped reject marker"],
  [auditScript, "--partial", "audit script partial mode"],
]) {
  requireIncludes(content, token, label);
}

rejectPattern(route, /export\s+async\s+function\s+(POST|PUT|PATCH|DELETE)\b/, "dry-run preview route must stay GET-only");
rejectPattern(previewService, /canProceedToOfficialImport:\s*true|officialImportOpen:\s*true|canRunOfficialImport:\s*true/, "official import gate true");
rejectPattern(previewService + route, /\.rpc\s*\(/, "direct RPC call");
rejectPattern(previewService + route, /\bofficial-import\b/i, "official import path in export implementation");
rejectIncludes(wrangler, "A16O_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY", "wrangler changed for A-16O");
rejectIncludes(layout, "crxlauncher", "layout must not add crxlauncher");
rejectPattern(layout, /suppressHydrationWarning\s*=\s*{?\s*true/i, "global hydration suppression");

if (
  packageJson?.scripts?.["check:a16o-uncap-dry-run-relationship-audit-export-read-only"] !==
  "node scripts/check-a16o-uncap-dry-run-relationship-audit-export-read-only.cjs"
) {
  failures.push("missing package script check:a16o-uncap-dry-run-relationship-audit-export-read-only");
}
if (
  packageJson?.scripts?.["audit:a16n-full-dry-run-relationships"] !==
  "node scripts/audit-a16n-full-dry-run-relationships.cjs"
) {
  failures.push("missing package script audit:a16n-full-dry-run-relationships");
}

for (const [content, token, label] of [
  [index, "PLAN_A16O_UNCAP_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY.md", "index entry"],
  [workLog, "A16O_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY", "work log marker"],
  [decisionLog, "A-16O adds read-only full relationship audit export without opening official import", "decision log entry"],
  [handoff, "A16O_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY", "handoff marker"],
]) {
  requireIncludes(content, token, label);
}

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  ".gitignore",
  docPath,
  checkerPath,
  routePath,
  previewServicePath,
  manifestReadPath,
  auditScriptPath,
  packagePath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "docs/PLAN_A16O_DEPLOY_READ_ONLY_AUDIT_EXPORT_SMOKE.md",
  "scripts/check-a16o-deploy-read-only-audit-export-smoke.cjs",
  "scripts/check-a16n-full-dry-run-relationship-audit-evidence.cjs",
  "scripts/check-a16m-relationship-role-mapping-root-cause-plan.cjs",
  "scripts/check-a16l-dry-run-preview-owner-review-relationship-audit.cjs",
  "scripts/check-a16l-dry-run-mapping-preview.cjs",
  "scripts/check-a16k-owner-dry-run-gate-approval-after-a16r-fix.cjs",
  "scripts/check-a16k-owner-approval-gate-dry-run-import.cjs",
  "scripts/check-a16r-fix-official-import-session-selection-mismatch.cjs",
  "scripts/check-a16r-ui-copy-refresh-official-import-gate.cjs",
  "scripts/check-a16r-production-ui-gate-state-reconciliation.cjs",
  "scripts/check-a16t-apply-verify.cjs",
  "scripts/check-a16u-locked-runtime-wiring.cjs",
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === ".env.local" || file.endsWith(".env.local")) failures.push(`forbidden env file ${file}`);
  if (file === wranglerPath) failures.push("wrangler.toml must not change");
  if (file === layoutPath) failures.push("app/layout.tsx must not change");
  if (/^(db\/migrations|supabase\/migrations|db\/checks)\//.test(file)) {
    failures.push(`forbidden SQL/check file ${file}`);
  }
  if (file !== packagePath && /\.(xls|xlsx|csv|png|jpg|jpeg|webp|zip|json)$/i.test(file)) {
    failures.push(`raw/data artifact must not be changed ${file}`);
  }
  if (file.startsWith(".tmp/")) failures.push(`.tmp file must not be committed ${file}`);
}

const stagedFiles = git(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected staged file ${file}`);
  if (file.startsWith(".tmp/") || /\.(json|xlsx|xls|csv|zip)$/i.test(file)) {
    failures.push(`raw/data artifact staged ${file}`);
  }
}

const changedPatch = git(["diff", "--", ...changedFiles.filter((file) => allowedChangedFiles.has(file))]);
for (const pattern of [
  /canProceedToOfficialImport:\s*true/i,
  /officialImportOpen:\s*true/i,
  /canRunOfficialImport:\s*true/i,
  /\.rpc\s*\(/i,
  /supabase\s+db\s+push/i,
]) {
  rejectPattern(changedPatch, pattern, `changed patch ${pattern}`);
}

if (failures.length > 0) {
  console.error("A-16O uncap dry-run relationship audit export check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16O uncap dry-run relationship audit export check passed.");
