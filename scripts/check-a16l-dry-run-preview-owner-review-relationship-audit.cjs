const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath =
  "docs/PLAN_A16L_DRY_RUN_PREVIEW_OWNER_REVIEW_RELATIONSHIP_AUDIT.md";
const checkerPath =
  "scripts/check-a16l-dry-run-preview-owner-review-relationship-audit.cjs";
const packagePath = "package.json";
const parserPath = "lib/import/giapha4/xlsx-staging-parser.ts";
const uploadServicePath = "lib/import/giapha4/manifest-upload-service.ts";
const manifestReadPath = "lib/import/giapha4/manifest-read-service.ts";
const dryRunPreviewPath =
  "lib/import/giapha4/dry-run-mapping-preview-service.ts";
const dryRunPreviewRoutePath =
  "app/api/admin/import-sessions/[sessionId]/dry-run-preview/route.ts";
const dryRunGateRoutePath =
  "app/api/admin/import-sessions/[sessionId]/dry-run-gate/route.ts";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const officialServicePath = "lib/import/giapha4/official-import-service.ts";
const officialGatePath = "lib/import/giapha4/official-import-preflight-gate.ts";
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
const checker = read(checkerPath);
const packageJson = readJson(packagePath);
const parser = read(parserPath);
const uploadService = read(uploadServicePath);
const manifestRead = read(manifestReadPath);
const dryRunPreview = read(dryRunPreviewPath);
const dryRunPreviewRoute = read(dryRunPreviewRoutePath);
const dryRunGateRoute = read(dryRunGateRoutePath);
const panel = read(panelPath);
const officialService = read(officialServicePath);
const officialGate = read(officialGatePath);
const layout = read(layoutPath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16L-DRY-RUN-PREVIEW-OWNER-REVIEW-RELATIONSHIP-AUDIT",
  "A16L_DRY_RUN_PREVIEW_OWNER_REVIEW_RELATIONSHIP_AUDIT_STATUS=BLOCKED_RELATIONSHIP_ROLE_AUDIT_REQUIRED_READ_ONLY",
  "A16L_DRY_RUN_PREVIEW_OWNER_REVIEW_CLASSIFICATION=A16L_DRY_RUN_PREVIEW_OWNER_REVIEW_BLOCKED_RELATIONSHIP_ROLE_AUDIT_REQUIRED",
  "A16L_AUDITED_DRY_RUN_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "A16L_BAD_UNVERIFIED_SESSION_ID=ae7a5fe3-6a29-4f60-85f7-76108ed02565",
  "APPROVE_A16K_IMPORT_DRY_RUN_GATE",
  "A16L_DRY_RUN_MAPPING_PREVIEW_FROM_MANIFEST_STAGING",
  "dryRunPreviewOnly=true",
  "readOnly=true",
  "dbWrite=false",
  "peopleWrite=false",
  "relationshipWrite=false",
  "treeLayoutWrite=false",
  "revisionWrite=false",
  "canProceedToOfficialImport=false",
  "officialImportOpen=false",
  "proposedPeopleCount=102",
  "proposedRelationshipCount=134",
  "blockedByErrorCount=0",
  "warningCount=92",
  "A16L_RELATIONSHIP_LABEL_SOURCE=PARSER_PARENT_COLUMN_TO_IMPORT_RELATIONSHIP_CANDIDATE_FIELD_PASSTHROUGH",
  "A16L_DRY_RUN_PREVIEW_LABEL_RENDERING_SYNTHESIZES_ROLE=NO",
  "A16L_DRY_RUN_PREVIEW_SERVICE_SYNTHESIZES_ROLE=NO",
  "A16L_RELATIONSHIP_ROLE_CONFIRMED_MAPPING_BUG=UNKNOWN_NOT_PROVEN",
  "A16L_RELATIONSHIP_ROLE_SOURCE_DATA_SEMANTICS_ISSUE=UNKNOWN_NOT_PROVEN",
  "A16L_RELATIONSHIP_ROLE_PREVIEW_RENDERING_ISSUE=NO_SOURCE_EVIDENCE",
  "A16L_RELATIONSHIP_ROLE_NEEDS_SOURCE_EVIDENCE=YES",
  "A16L_RELATIONSHIP_AUDIT_TOTAL_PROPOSED_RELATIONSHIPS=134",
  "A16L_SUSPICIOUS_ROLE_GENDER_MISMATCH_EXAMPLE_COUNT=8",
  "A16L_SUSPICIOUS_ROLE_GENDER_MISMATCH_TOTAL=UNKNOWN_NOT_DETERMINABLE_FROM_OWNER_EXCERPT",
  "Bố: Phạm Thị Bích",
  "Mẹ: Nguyễn Hoàng Hiệp",
  "Bố: Phạm Thị Học",
  "Mẹ: Nguyễn Văn Tiến",
  "Bố: Phạm Thị Phòng",
  "Mẹ: Nguyễn Văn Trung",
  "Bố: Phạm Thị Nhỡ (cụ bà Trá)",
  "Mẹ: Phạm Văn Trá",
  "A16L_WARNING_AUDIT_TOTAL=92",
  "A16L_WARNING_AUDIT_GROUP_COUNTS_REQUIRE_RAW_WARNING_LIST=YES",
  "Birth date only year / incomplete precision",
  "Death date only year / incomplete precision",
  "Lunar/solar calendar conflict",
  "Death same year incomplete precision",
  "Duplicate person candidate",
  "Parser warnings",
  "A16L_DUPLICATE_EXAMPLE=Nguyễn Văn Tiến / Nguyễn Văn Tiện",
  "A16L_DUPLICATE_NGUYEN_VAN_TIEN_TIEN_OWNER_REVIEW_REQUIRED=YES",
  "A16L_DUPLICATE_AUTO_MERGE=NO",
  "A16L_DUPLICATE_AUTO_DELETE=NO",
  "A16L_DUPLICATE_AUTO_CORRECT=NO",
  "A16L_AUTO_DATE_CORRECTION=NO",
  "A16L_OFFICIAL_IMPORT_REMAINS_LOCKED=YES",
  "A16L_CAN_RUN_OFFICIAL_IMPORT=false",
  "A16L_OFFICIAL_IMPORT_ENABLED=false",
  "A16L_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16L_OFFICIAL_IMPORT_CONFIRM_CLICKED=NO",
  "A16L_DIRECT_RPC_OFFICIAL_IMPORT_CALLED=NO",
  "A16L_REAL_GENEALOGY_WRITE=NO",
  "A16L_SQL_RUN=NO",
  "A16L_DB_PUSH_RUN=NO",
  "A16L_MIGRATION_REPAIR_RUN=NO",
  "A16L_SEED_RUN=NO",
  "A16L_PERMISSIONS_ROLES_AUTH_USERS_MEMBERSHIPS_MUTATED=NO",
  "A16L_DEPLOY_RUN=NO",
  "A16L_WINDOWS_LOCAL_DEPLOY_RUN=NO",
  "A16L_WRANGLER_TOML_CHANGED=NO",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "LOCAL_HYDRATION_ADVISORY_LIKELY_BROWSER_EXTENSION_INJECTION",
  "A16L_APP_LAYOUT_TSX_CHANGED=NO",
  "A16L_APP_LAYOUT_CRXLAUNCHER_ADDED=NO",
  "A16L_HYDRATION_GLOBAL_SUPPRESSION_ADDED=NO",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [parser, "fatherExternalId", "parser father external id"],
  [parser, "motherExternalId", "parser mother external id"],
  [parser, "fatherName", "parser father name"],
  [parser, "motherName", "parser mother name"],
  [parser, "role === \"father\" ? \"Bố\" : \"Mẹ\"", "parser role label"],
  [parser, "relationshipLabelVi: `${roleLabel}: ${parentName || parentExternalId}`", "parser relationship label"],
  [parser, "sourcePersonFingerprint: matched?.fingerprint", "parser source fingerprint parent"],
  [parser, "relatedPersonFingerprint: input.person.fingerprint", "parser child fingerprint"],
  [uploadService, "relationship_label_vi: candidate.relationshipLabelVi", "upload persists relationship label"],
  [manifestRead, "relationship_label_vi", "read relationship label column"],
  [manifestRead, "relationshipLabelVi: row.relationship_label_vi", "read relationship label passthrough"],
  [dryRunPreview, "relationshipLabelVi: relationship.relationshipLabelVi", "dry-run relationship label passthrough"],
  [dryRunPreview, "canProceedToOfficialImport: false", "dry-run canProceed false"],
  [dryRunPreview, "officialImportOpen: false", "dry-run official import closed"],
  [dryRunPreview, "dbWrite: false", "dry-run db write false"],
  [dryRunPreview, "relationshipWrite: false", "dry-run relationship write false"],
  [dryRunPreviewRoute, "export async function GET", "dry-run preview GET"],
  [dryRunPreviewRoute, "getDryRunMappingPreview", "dry-run preview route service"],
  [dryRunGateRoute, "export async function GET", "dry-run gate GET"],
  [panel, "{relationship.relationshipLabelVi}", "panel direct label render"],
  [officialService, "canRunOfficialImport: false", "official service canRun false"],
  [officialGate, "canOpenOfficialImport: false", "official gate canOpen false"],
  [officialGate, "officialImportEnabled: false", "official gate enabled false"],
]) {
  requireIncludes(content, token, label);
}

rejectPattern(
  dryRunPreviewRoute + dryRunGateRoute,
  /export\s+async\s+function\s+(POST|PUT|PATCH|DELETE)\b/,
  "dry-run routes must stay GET-only",
);
rejectPattern(officialService, /canRunOfficialImport:\s*true/, "official import canRun true");
rejectPattern(officialGate, /officialImportEnabled:\s*true|canOpenOfficialImport:\s*true/, "official gate true");
rejectIncludes(layout, "crxlauncher", "layout must not add crxlauncher");
rejectPattern(layout, /suppressHydrationWarning\s*=\s*{?\s*true/i, "global hydration suppression");

if (
  packageJson?.scripts?.["check:a16l-dry-run-preview-owner-review-relationship-audit"] !==
  "node scripts/check-a16l-dry-run-preview-owner-review-relationship-audit.cjs"
) {
  failures.push(
    "missing package script check:a16l-dry-run-preview-owner-review-relationship-audit",
  );
}

for (const [content, token, label] of [
  [index, "PLAN_A16L_DRY_RUN_PREVIEW_OWNER_REVIEW_RELATIONSHIP_AUDIT.md", "index entry"],
  [workLog, "A16L_DRY_RUN_PREVIEW_OWNER_REVIEW_RELATIONSHIP_AUDIT_STATUS=BLOCKED_RELATIONSHIP_ROLE_AUDIT_REQUIRED_READ_ONLY", "work log status"],
  [decisionLog, "A-16L dry-run relationship preview requires owner role audit before official import", "decision log entry"],
  [handoff, "A16L_DRY_RUN_PREVIEW_OWNER_REVIEW_RELATIONSHIP_AUDIT_STATUS=BLOCKED_RELATIONSHIP_ROLE_AUDIT_REQUIRED_READ_ONLY", "handoff status"],
]) {
  requireIncludes(content, token, label);
}

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
  checkerPath,
  "docs/PLAN_A16M_RELATIONSHIP_ROLE_MAPPING_ROOT_CAUSE_PLAN.md",
  "scripts/check-a16m-relationship-role-mapping-root-cause-plan.cjs",
  "docs/PLAN_A16N_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EVIDENCE.md",
  "docs/evidence/A16N_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EVIDENCE_TEMPLATE.md",
  "scripts/audit-a16n-full-dry-run-relationships.cjs",
  "scripts/check-a16n-full-dry-run-relationship-audit-evidence.cjs",
  "docs/PLAN_A16O_UNCAP_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY.md",
  "scripts/check-a16o-uncap-dry-run-relationship-audit-export-read-only.cjs",
  "docs/PLAN_A16O_DEPLOY_READ_ONLY_AUDIT_EXPORT_SMOKE.md",
  "scripts/check-a16o-deploy-read-only-audit-export-smoke.cjs",
  ...a16oRuntimeChangedFiles,
  packagePath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
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

const stagedFiles = git(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected staged file ${file}`);
}

const changedPatch = git(["diff", "--", ...changedFiles]);
for (const pattern of [
  /POST\s+\/official-import/i,
  /\.rpc\s*\(/i,
  /\bsupabase\s+db\s+push\b/i,
  /\bINSERT\s+INTO\b/i,
  /\bUPDATE\s+[a-z_]/i,
  /\bDELETE\s+FROM\b/i,
  /\bCREATE\s+TABLE\b/i,
  /\bALTER\s+TABLE\b/i,
  /canProceedToOfficialImport:\s*true/i,
  /canRunOfficialImport:\s*true/i,
  /officialImportOpen:\s*true/i,
]) {
  rejectPattern(changedPatch, pattern, `changed patch ${pattern}`);
}

for (const [file, content] of [
  [docPath, doc],
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
  console.error("A-16L dry-run preview owner-review relationship audit check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16L dry-run preview owner-review relationship audit check passed.");
