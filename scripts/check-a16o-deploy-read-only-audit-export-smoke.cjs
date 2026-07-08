#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16O_DEPLOY_READ_ONLY_AUDIT_EXPORT_SMOKE.md";
const checkerPath = "scripts/check-a16o-deploy-read-only-audit-export-smoke.cjs";
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
const layout = read(layoutPath);
const wrangler = read(wranglerPath);

for (const token of [
  "A-16O-DEPLOY-READ-ONLY-AUDIT-EXPORT-SMOKE",
  "2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "ae7a5fe3-6a29-4f60-85f7-76108ed02565",
  "e74ec38 feat: add A16O read-only full relationship audit export",
  "OWNER_CONFIRMED_A16O_GITHUB_ACTIONS_DEPLOY_SUCCEEDED_FOR_COMMIT_e74ec38",
  "GITHUB_ACTIONS_CLOUDFLARE_DEPLOY_WORKFLOW_BRANCH_MAIN",
  "Windows-local deploy",
  "wrangler deploy",
  "https://web-gia-pha.hungdiepcompany.workers.dev/api/admin/import-sessions/2af4bfb6-a20e-453e-9804-1b8c0afbdd68/dry-run-preview?auditExport=relationships-full",
  "A16O_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY",
  "proposedPeopleExportCount=102",
  "proposedRelationshipExportCount=134",
  "exportCapped=false",
  "readOnly=true",
  "dbWrite=false",
  "peopleWrite=false",
  "relationshipWrite=false",
  "treeLayoutWrite=false",
  "revisionWrite=false",
  "canProceedToOfficialImport=false",
  "officialImportOpen=false",
  "A16O_EXPORT_AUTH_BOUNDARY_PASS",
  "unauthenticated `401` response as full 102/134 audit evidence",
  "npm run audit:a16n-full-dry-run-relationships -- .tmp\\a16o-dry-run-relationship-audit-export-full.json",
  "A16O_DEPLOY_SMOKE_READY_OWNER_FULL_JSON_NEEDED",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "A16O_DEPLOY_SMOKE_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16O_DEPLOY_SMOKE_DIRECT_RPC_OFFICIAL_IMPORT_CALLED=NO",
  "A16O_DEPLOY_SMOKE_REAL_GENEALOGY_WRITE=NO",
  "A16O_DEPLOY_SMOKE_SQL_RUN=NO",
  "A16O_DEPLOY_SMOKE_DB_PUSH_RUN=NO",
  "A16O_DEPLOY_SMOKE_MIGRATION_REPAIR_RUN=NO",
  "A16O_DEPLOY_SMOKE_SEED_RUN=NO",
  "A16O_DEPLOY_SMOKE_PERMISSIONS_ROLES_AUTH_USERS_MEMBERSHIPS_MUTATED=NO",
  "A16O_DEPLOY_SMOKE_WINDOWS_LOCAL_DEPLOY_RUN=NO",
  "A16O_DEPLOY_SMOKE_WRANGLER_TOML_CHANGED=NO",
  "A16O_DEPLOY_SMOKE_APP_LAYOUT_TSX_CHANGED=NO",
  "A16O_DEPLOY_SMOKE_RAW_JSON_EVIDENCE_COMMITTED=NO",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A16O_DEPLOY_READ_ONLY_AUDIT_EXPORT_SMOKE.md", "index entry"],
  [workLog, "A16O_DEPLOY_SMOKE_READY_OWNER_FULL_JSON_NEEDED", "work log classification"],
  [decisionLog, "A-16O deploy smoke records auth boundary before owner full JSON audit", "decision log entry"],
  [handoff, "A16O_DEPLOY_SMOKE_READY_OWNER_FULL_JSON_NEEDED", "handoff classification"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a16o-deploy-read-only-audit-export-smoke"] !==
  "node scripts/check-a16o-deploy-read-only-audit-export-smoke.cjs"
) {
  failures.push("missing package script check:a16o-deploy-read-only-audit-export-smoke");
}

rejectPattern(layout, /crxlauncher|suppressHydrationWarning\s*=\s*{?\s*true/i, "layout hydration workaround");
rejectPattern(wrangler, /A16O_DEPLOY|A16O_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY/i, "wrangler A-16O change");

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
  "scripts/check-a16o-uncap-dry-run-relationship-audit-export-read-only.cjs",
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
  if (
    file.startsWith(".tmp/") ||
    (file !== packagePath && /\.(json|xlsx|xls|csv|zip)$/i.test(file))
  ) {
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
]) {
  rejectPattern(changedPatch, pattern, `changed patch ${pattern}`);
}

if (failures.length > 0) {
  console.error("A-16O deploy read-only audit export smoke check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16O deploy read-only audit export smoke check passed.");
