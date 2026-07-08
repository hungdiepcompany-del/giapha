#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath =
  "docs/PLAN_A16W_FULL_AUTHENTICATED_RELATIONSHIP_AUDIT_EXPORT_EVIDENCE_READINESS.md";
const checkerPath =
  "scripts/check-a16w-full-authenticated-relationship-audit-export-evidence-readiness.cjs";
const packagePath = "package.json";
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
const packageJson = readJson(packagePath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const a16oDeployDoc = read("docs/PLAN_A16O_DEPLOY_READ_ONLY_AUDIT_EXPORT_SMOKE.md");
const a16oUncapDoc = read("docs/PLAN_A16O_UNCAP_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY.md");
const a16nDoc = read("docs/PLAN_A16N_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EVIDENCE.md");
const auditScript = read("scripts/audit-a16n-full-dry-run-relationships.cjs");
const layout = read(layoutPath);
const wrangler = read(wranglerPath);

for (const token of [
  "A-16W-FULL-AUTHENTICATED-RELATIONSHIP-AUDIT-EXPORT-EVIDENCE-READINESS",
  "A16W_FULL_AUTHENTICATED_EXPORT_EVIDENCE_STATUS=BLOCKED_OWNER_AUTHENTICATED_FULL_JSON_NOT_AVAILABLE",
  "A16W_BLOCKER=OWNER_AUTHENTICATED_FULL_RELATIONSHIP_AUDIT_EXPORT_JSON_MISSING",
  "A16O_DEPLOY_SMOKE_READY_OWNER_FULL_JSON_NEEDED",
  "A16O_EXPORT_AUTH_BOUNDARY_PASS",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "c3494db docs: record A16O production smoke verification",
  "OWNER_CONFIRMED_A16O_GITHUB_ACTIONS_DEPLOY_SUCCEEDED_FOR_COMMIT_e74ec38",
  ".tmp\\a16o-dry-run-relationship-audit-export-full.json",
  ".tmp\\a16n-dry-run-preview.json",
  "A16W_AUDITED_IMPORT_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "A16W_BAD_UNVERIFIED_SESSION_ID=ae7a5fe3-6a29-4f60-85f7-76108ed02565",
  "https://web-gia-pha.hungdiepcompany.workers.dev/api/admin/import-sessions/2af4bfb6-a20e-453e-9804-1b8c0afbdd68/dry-run-preview?auditExport=relationships-full",
  "marker=A16O_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY",
  "sourceMarker=A16L_DRY_RUN_MAPPING_PREVIEW_FROM_MANIFEST_STAGING",
  "approvalMarker=APPROVE_A16K_IMPORT_DRY_RUN_GATE",
  "dryRunPreviewOnly=true",
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
  "proposedPeopleExportCount=102",
  "proposedRelationshipExportCount=134",
  "exportCapped=false",
  "proposedPeople.length=102",
  "proposedRelationships.length=134",
  "npm run audit:a16n-full-dry-run-relationships -- .tmp\\a16o-dry-run-relationship-audit-export-full.json",
  "A16N_FULL_RELATIONSHIP_AUDIT_JSON_ACCEPTED",
  "A16N_CAPPED_PREVIEW_JSON_REJECTED_FOR_FULL_AUDIT",
  "A16W_FULL_AUTHENTICATED_EXPORT_EVIDENCE_AVAILABLE=NO",
  "A16W_FULL_AUTHENTICATED_EXPORT_EVIDENCE_MISSING=YES",
  "A16W_FULL_AUTHENTICATED_EXPORT_EVIDENCE_BLOCKED=YES",
  "A16W_OFFLINE_A16N_FULL_AUDIT_RUN=NO",
  "A16W_A16R_IMPORT_RETRY_STATUS=NO_FULL_EXPORT_EVIDENCE_MISSING",
  "A16W_NO_GO_RULE=A16R_IMPORT_RETRY_REMAINS_BLOCKED_UNTIL_OWNER_AUTHENTICATED_FULL_EXPORT_JSON_EXISTS_AND_A16N_FULL_AUDIT_ACCEPTS_IT",
  "A16W_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16W_DIRECT_RPC_OFFICIAL_IMPORT_CALLED=NO",
  "A16W_A16R_IMPORT_RETRY_RUN=NO",
  "A16W_REAL_GENEALOGY_WRITE=NO",
  "A16W_SQL_RUN=NO",
  "A16W_DB_PUSH_RUN=NO",
  "A16W_MIGRATION_REPAIR_RUN=NO",
  "A16W_SEED_RUN=NO",
  "A16W_PERMISSIONS_ROLES_AUTH_USERS_MEMBERSHIPS_MUTATED=NO",
  "A16W_DEPLOY_RUN=NO",
  "A16W_WINDOWS_LOCAL_DEPLOY_RUN=NO",
  "A16W_WRANGLER_DEPLOY_RUN=NO",
  "A16W_WRANGLER_TOML_CHANGED=NO",
  "A16W_APP_LAYOUT_TSX_CHANGED=NO",
  "A16W_RAW_FULL_JSON_EVIDENCE_COMMITTED=NO",
  "Main Worker touched: `NO`",
  "Runtime dependency added: `NO`",
  "OpenNext/Wrangler config changed: `NO`",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [a16oDeployDoc, "A16O_DEPLOY_SMOKE_READY_OWNER_FULL_JSON_NEEDED", "A-16O deploy status"],
  [a16oDeployDoc, "A16O_EXPORT_AUTH_BOUNDARY_PASS", "A-16O auth boundary"],
  [a16oUncapDoc, "A16O_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY", "A-16O full export marker"],
  [a16nDoc, "A16N_FULL_DRY_RUN_RELATIONSHIP_AUDIT_STATUS=A16N_EVIDENCE_TOOLING_READY_OWNER_JSON_NEEDED", "A-16N owner JSON needed"],
  [auditScript, "A16N_FULL_RELATIONSHIP_AUDIT_JSON_ACCEPTED", "A-16N accepted marker"],
  [auditScript, "A16N_CAPPED_PREVIEW_JSON_REJECTED_FOR_FULL_AUDIT", "A-16N capped reject marker"],
  [index, "PLAN_A16W_FULL_AUTHENTICATED_RELATIONSHIP_AUDIT_EXPORT_EVIDENCE_READINESS.md", "index entry"],
  [workLog, "A16W_FULL_AUTHENTICATED_EXPORT_EVIDENCE_STATUS=BLOCKED_OWNER_AUTHENTICATED_FULL_JSON_NOT_AVAILABLE", "work log status"],
  [decisionLog, "A-16W keeps A-16R import retry blocked until authenticated full export evidence exists", "decision log entry"],
  [handoff, "A16W_BLOCKER=OWNER_AUTHENTICATED_FULL_RELATIONSHIP_AUDIT_EXPORT_JSON_MISSING", "handoff blocker"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.[
    "check:a16w-full-authenticated-relationship-audit-export-evidence-readiness"
  ] !==
  "node scripts/check-a16w-full-authenticated-relationship-audit-export-evidence-readiness.cjs"
) {
  failures.push(
    "missing package script check:a16w-full-authenticated-relationship-audit-export-evidence-readiness",
  );
}

// A-16W is a historical readiness gate. Later phases may place a local .tmp
// file and classify it separately; do not make this checker depend on mutable
// local evidence state.

rejectPattern(layout, /crxlauncher|suppressHydrationWarning\s*=\s*{?\s*true/i, "layout hydration workaround");
rejectPattern(wrangler, /A16W|A16O_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY/i, "wrangler evidence/config change");

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
  console.error("A-16W full authenticated relationship audit export readiness check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16W full authenticated relationship audit export readiness check passed.");
