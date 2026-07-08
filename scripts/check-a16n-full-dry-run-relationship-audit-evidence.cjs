const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16N_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EVIDENCE.md";
const templatePath =
  "docs/evidence/A16N_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EVIDENCE_TEMPLATE.md";
const auditScriptPath = "scripts/audit-a16n-full-dry-run-relationships.cjs";
const checkerPath =
  "scripts/check-a16n-full-dry-run-relationship-audit-evidence.cjs";
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

function rejectIncludes(content, token, label = token) {
  if (content.includes(token)) failures.push(`forbidden ${label}`);
}

function rejectPattern(content, pattern, label = String(pattern)) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

const doc = read(docPath);
const template = read(templatePath);
const auditScript = read(auditScriptPath);
const checker = read(checkerPath);
const packageJson = readJson(packagePath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const layout = read(layoutPath);

for (const token of [
  "A-16N-FULL-DRY-RUN-RELATIONSHIP-AUDIT-EVIDENCE",
  "A16N_FULL_DRY_RUN_RELATIONSHIP_AUDIT_STATUS=A16N_EVIDENCE_TOOLING_READY_OWNER_JSON_NEEDED",
  "A16M_ROOT_CAUSE_UNKNOWN_NEEDS_FULL_EXPORT_EVIDENCE",
  "LIKELY_YES",
  "UNKNOWN",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "A16N_AUDITED_IMPORT_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "A16N_BAD_UNVERIFIED_SESSION_ID=ae7a5fe3-6a29-4f60-85f7-76108ed02565",
  "proposedPeopleCount=102",
  "proposedRelationshipCount=134",
  "blockedByErrorCount=0",
  "warningCount=92",
  "canProceedToOfficialImport=false",
  "officialImportOpen=false",
  "dryRunPreviewOnly=true",
  "readOnly=true",
  "dbWrite=false",
  "peopleWrite=false",
  "relationshipWrite=false",
  "treeLayoutWrite=false",
  "revisionWrite=false",
  "A16N_FULL_OWNER_JSON_AVAILABLE=NO",
  "A16N_EVIDENCE_TOOLING_READY_OWNER_JSON_NEEDED",
  "scripts/audit-a16n-full-dry-run-relationships.cjs",
  "docs/evidence/A16N_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EVIDENCE_TEMPLATE.md",
  "A16N_FULL_AUDIT_REQUIRED_FOR_ALL_RELATIONSHIPS=134",
  "REVIEW_ROLE_GENDER_MISMATCH",
  "REVIEW_MISSING_PERSON_LOOKUP",
  "REVIEW_AMBIGUOUS_RELATIONSHIP",
  "REVIEW_WEAK_CONFIDENCE",
  "REVIEW_DIRECTION_SUSPECTED",
  "A16N_NO_GO_RULE=OFFICIAL_IMPORT_REMAINS_BLOCKED_UNTIL_FULL_AUDIT_PROVES_NO_PARENT_ROLE_WRITE_RISK_OR_FIX_PHASE_RERUNS_DRY_RUN",
  "A-16O-FIX-RELATIONSHIP-ROLE-MAPPING",
  "A-16O-OWNER-ACCEPTS-SOURCE-RELATIONSHIP-ROLES_AFTER_FULL_AUDIT",
  "A-16O-LABEL-ONLY-PREVIEW-CORRECTION",
  "A16N_RUNTIME_PARSER_IMPORT_BEHAVIOR_CHANGED=NO",
  "A16N_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16N_DIRECT_RPC_OFFICIAL_IMPORT_CALLED=NO",
  "A16N_REAL_GENEALOGY_WRITE=NO",
  "A16N_SQL_RUN=NO",
  "A16N_DB_PUSH_RUN=NO",
  "A16N_MIGRATION_REPAIR_RUN=NO",
  "A16N_SEED_RUN=NO",
  "A16N_PERMISSIONS_ROLES_AUTH_USERS_MEMBERSHIPS_MUTATED=NO",
  "A16N_DEPLOY_RUN=NO",
  "A16N_WRANGLER_TOML_CHANGED=NO",
  "A16N_APP_LAYOUT_TSX_CHANGED=NO",
  "A16N_APP_LAYOUT_CRXLAUNCHER_ADDED=NO",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "curl.exe \"https://web-gia-pha.hungdiepcompany.workers.dev/api/admin/import-sessions/2af4bfb6-a20e-453e-9804-1b8c0afbdd68/dry-run-preview\" -o \".tmp\\a16n-dry-run-preview.json\"",
  "npm run audit:a16n-full-dry-run-relationships",
  "no import/no POST",
]) {
  requireIncludes(template, token, `template token ${token}`);
}

for (const token of [
  "readJsonFile",
  "validateTopLevel",
  "dryRunPreviewOnly",
  "relationshipWrite",
  "canProceedToOfficialImport",
  "officialImportOpen",
  "EXPECTED_PEOPLE_COUNT = 102",
  "EXPECTED_RELATIONSHIP_COUNT = 134",
  "EXPECTED_BLOCKED_BY_ERROR_COUNT = 0",
  "EXPECTED_WARNING_COUNT = 92",
  "buildPersonLookup",
  "sourcePersonGender is female",
  "sourcePersonGender is male",
  "REVIEW_ROLE_GENDER_MISMATCH",
  "REVIEW_MISSING_PERSON_LOOKUP",
  "REVIEW_AMBIGUOUS_RELATIONSHIP",
  "REVIEW_WEAK_CONFIDENCE",
  "REVIEW_DIRECTION_SUSPECTED",
  "KEEP_OFFICIAL_IMPORT_BLOCKED_AND_REVIEW_A16N_AUDIT_ROWS",
]) {
  requireIncludes(auditScript, token, `audit script token ${token}`);
}

for (const pattern of [
  /\bhttps?:\/\//i,
  /\bfetch\s*\(/i,
  /\baxios\b/i,
  /\.rpc\s*\(/i,
  /\bcreateClient\b/i,
  /\bSUPABASE_SERVICE_ROLE_KEY\b/i,
  /\bprocess\.env\./i,
  /\bofficial-import\b(?!.*warning)/i,
]) {
  rejectPattern(auditScript, pattern, `audit script forbidden ${pattern}`);
}

if (
  packageJson?.scripts?.["audit:a16n-full-dry-run-relationships"] !==
  "node scripts/audit-a16n-full-dry-run-relationships.cjs"
) {
  failures.push("missing package script audit:a16n-full-dry-run-relationships");
}
if (
  packageJson?.scripts?.["check:a16n-full-dry-run-relationship-audit-evidence"] !==
  "node scripts/check-a16n-full-dry-run-relationship-audit-evidence.cjs"
) {
  failures.push("missing package script check:a16n-full-dry-run-relationship-audit-evidence");
}

for (const [content, token, label] of [
  [index, "PLAN_A16N_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EVIDENCE.md", "index entry"],
  [workLog, "A16N_FULL_DRY_RUN_RELATIONSHIP_AUDIT_STATUS=A16N_EVIDENCE_TOOLING_READY_OWNER_JSON_NEEDED", "work log status"],
  [decisionLog, "A-16N prepares offline full relationship audit evidence before any import fix", "decision log entry"],
  [handoff, "A16N_FULL_DRY_RUN_RELATIONSHIP_AUDIT_STATUS=A16N_EVIDENCE_TOOLING_READY_OWNER_JSON_NEEDED", "handoff status"],
]) {
  requireIncludes(content, token, label);
}

rejectIncludes(layout, "crxlauncher", "layout must not add crxlauncher");
rejectPattern(layout, /suppressHydrationWarning\s*=\s*{?\s*true/i, "global hydration suppression");

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const a16oRuntimeChangedFiles = new Set([
  "app/api/admin/import-sessions/[sessionId]/dry-run-preview/route.ts",
  "lib/import/giapha4/dry-run-mapping-preview-service.ts",
  "lib/import/giapha4/manifest-read-service.ts",
]);

const allowedChangedFiles = new Set([
  ".gitignore",
  docPath,
  templatePath,
  auditScriptPath,
  checkerPath,
  packagePath,
  "docs/PLAN_A16O_UNCAP_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY.md",
  "scripts/check-a16o-uncap-dry-run-relationship-audit-export-read-only.cjs",
  "docs/PLAN_A16O_DEPLOY_READ_ONLY_AUDIT_EXPORT_SMOKE.md",
  "scripts/check-a16o-deploy-read-only-audit-export-smoke.cjs",
  ...a16oRuntimeChangedFiles,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
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
  if (file === layoutPath) failures.push("app/layout.tsx must not change");
  if (file === wranglerPath) failures.push("wrangler.toml must not change");
  if (file.startsWith("supabase/.temp/")) failures.push(`forbidden supabase temp ${file}`);
  if (/\.(xls|xlsx|csv|png|jpg|jpeg|webp|zip)$/i.test(file)) {
    failures.push(`forbidden data/screenshot file ${file}`);
  }
  if (/^(db\/migrations|supabase\/migrations|db\/checks)\//.test(file)) {
    failures.push(`forbidden SQL/check file ${file}`);
  }
  if (
    !a16oRuntimeChangedFiles.has(file) &&
    (
    file.startsWith("app/") ||
    file.startsWith("components/") ||
    file.startsWith("lib/") ||
    file === "next.config.ts" ||
    file === "open-next.config.ts" ||
    file.startsWith(".github/workflows/")
    )
  ) {
    failures.push(`runtime/source/config file changed ${file}`);
  }
}

const changedPatch = git(["diff", "--", ...changedFiles]);
for (const pattern of [
  /POST\s+\/official-import/i,
  /\.rpc\s*\(/i,
  /\bsupabase\s+db\s+push\b/i,
  /\bINSERT\s+INTO\s+public\.(people|family_parents|family_children|families|tree_layouts|revisions)\b/i,
  /\bUPDATE\s+public\.(people|family_parents|family_children|families|tree_layouts|revisions)\b/i,
  /\bDELETE\s+FROM\s+public\.(people|family_parents|family_children|families|tree_layouts|revisions)\b/i,
  /canProceedToOfficialImport:\s*true/i,
  /canRunOfficialImport:\s*true/i,
  /officialImportOpen:\s*true/i,
]) {
  rejectPattern(changedPatch, pattern, `changed patch ${pattern}`);
}

const stagedFiles = git(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected staged file ${file}`);
}

for (const [file, content] of [
  [docPath, doc],
  [templatePath, template],
  [auditScriptPath, auditScript],
  [checkerPath, checker],
]) {
  for (const pattern of [
    /sb_(secret|service)_[A-Za-z0-9_-]{12,}/,
    /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/,
    /Bearer\s+[A-Za-z0-9._-]{12,}/,
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    /SUPABASE_SERVICE_ROLE_KEY\s*=\s*[^`\s]+/,
    /NEXT_PUBLIC_SUPABASE_ANON_KEY\s*=\s*[^`\s]+/,
    /postgresql:\/\/[^`\s]+/i,
  ]) {
    rejectPattern(content, pattern, `${file} ${pattern}`);
  }
}

if (failures.length > 0) {
  console.error("A-16N full dry-run relationship audit evidence check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16N full dry-run relationship audit evidence check passed.");
