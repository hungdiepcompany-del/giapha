const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16M_RELATIONSHIP_ROLE_MAPPING_ROOT_CAUSE_PLAN.md";
const checkerPath =
  "scripts/check-a16m-relationship-role-mapping-root-cause-plan.cjs";
const packagePath = "package.json";
const parserPath = "lib/import/giapha4/xlsx-staging-parser.ts";
const normalizePath = "lib/import/giapha4/normalize.ts";
const uploadServicePath = "lib/import/giapha4/manifest-upload-service.ts";
const manifestReadPath = "lib/import/giapha4/manifest-read-service.ts";
const dryRunPreviewPath =
  "lib/import/giapha4/dry-run-mapping-preview-service.ts";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const officialServicePath = "lib/import/giapha4/official-import-service.ts";
const officialGatePath = "lib/import/giapha4/official-import-preflight-gate.ts";
const a16vSqlPath =
  "db/migrations/20260703_0016_a16v_official_import_real_transaction_execution_branch_candidate.sql";
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
const normalize = read(normalizePath);
const uploadService = read(uploadServicePath);
const manifestRead = read(manifestReadPath);
const dryRunPreview = read(dryRunPreviewPath);
const panel = read(panelPath);
const officialService = read(officialServicePath);
const officialGate = read(officialGatePath);
const a16vSql = read(a16vSqlPath);
const layout = read(layoutPath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16M-RELATIONSHIP-ROLE-MAPPING-ROOT-CAUSE-PLAN",
  "A16M_RELATIONSHIP_ROLE_MAPPING_ROOT_CAUSE_STATUS=PLAN_ONLY_IMPORT_BLOCKED",
  "A16L_DRY_RUN_PREVIEW_OWNER_REVIEW_BLOCKED_RELATIONSHIP_ROLE_AUDIT_REQUIRED",
  "A16M_ROOT_CAUSE_CLASSIFICATION=A16M_ROOT_CAUSE_UNKNOWN_NEEDS_FULL_EXPORT_EVIDENCE",
  "A16M_IMPORT_SAFETY_CLASSIFICATION=LIKELY_YES",
  "A16M_CONFIRMED_RUNTIME_WRITE_RISK=UNKNOWN",
  "A16M_RECOMMENDED_NEXT_PHASE=A-16N-FULL-DRY-RUN-RELATIONSHIP-AUDIT-EVIDENCE",
  "A16M_AUDITED_IMPORT_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "A16M_BAD_UNVERIFIED_SESSION_ID=ae7a5fe3-6a29-4f60-85f7-76108ed02565",
  "proposedPeopleCount=102",
  "proposedRelationshipCount=134",
  "blockedByErrorCount=0",
  "warningCount=92",
  "canProceedToOfficialImport=false",
  "officialImportOpen=false",
  "readOnly=true",
  "dbWrite=false",
  "peopleWrite=false",
  "relationshipWrite=false",
  "treeLayoutWrite=false",
  "revisionWrite=false",
  "Bố: Phạm Thị Bích",
  "Mẹ: Nguyễn Hoàng Hiệp",
  "Bố: Phạm Thị Học",
  "Mẹ: Nguyễn Văn Tiến",
  "Bố: Phạm Thị Phòng",
  "Mẹ: Nguyễn Văn Trung",
  "Bố: Phạm Thị Nhỡ (cụ bà Trá)",
  "Mẹ: Phạm Văn Trá",
  "A16M_RELATIONSHIP_CANDIDATE_CREATOR=lib/import/giapha4/xlsx-staging-parser.ts::buildParentRelationshipCandidates",
  "A16M_RELATIONSHIP_STAGING_WRITER=lib/import/giapha4/manifest-upload-service.ts::toRelationshipRows",
  "A16M_RELATIONSHIP_STAGING_TABLE=import_relationship_candidates",
  "A16M_PARENT_ROLE_FIELD_IN_PARSER=parentRole",
  "A16M_PARENT_ROLE_PERSISTED_IN_IMPORT_RELATIONSHIP_CANDIDATES=NO",
  "A16M_RELATIONSHIP_LABEL_FIELD_IN_PARSER=relationshipLabelVi",
  "A16M_RELATIONSHIP_LABEL_PERSISTED_FIELD=relationship_label_vi",
  "A16M_SOURCE_PERSON_FINGERPRINT_SIDE=parent",
  "A16M_RELATED_PERSON_FINGERPRINT_SIDE=child",
  "A16M_SOURCE_ROW_INDEX_SIDE=child_row",
  "A16M_RELATED_ROW_INDEX_SIDE=child_row",
  "A16M_ROLE_LABEL_DERIVED_FROM_SOURCE_COLUMN_HEADER=YES",
  "A16M_ROLE_LABEL_DERIVED_FROM_INFERRED_GENDER=NO",
  "A16M_ROLE_LABEL_DERIVED_FROM_RELATIONSHIP_DIRECTION=NO",
  "A16M_ROLE_LABEL_DERIVED_FROM_PARENT_CANDIDATE_ROLE=YES",
  "A16M_ROLE_LABEL_DERIVED_FROM_UI_PREVIEW_FORMATTING=NO",
  "A16M_ROLE_LABEL_DERIVED_FROM_STAGING_PASSTHROUGH=YES",
  "A16M_RELATIONSHIP_LABEL_CREATED_AT_PARSE_TIME=YES",
  "A16M_RELATIONSHIP_LABEL_CREATED_DURING_MANIFEST_STAGING=NO",
  "A16M_RELATIONSHIP_LABEL_CREATED_DURING_DRY_RUN_PREVIEW=NO",
  "A16M_RELATIONSHIP_LABEL_CREATED_ONLY_IN_UI_RENDER=NO",
  "A16M_RELATIONSHIP_LABEL_PERSISTED_IN_IMPORT_RELATIONSHIP_CANDIDATES=YES",
  "A16M_GENDER_SOURCE=PARSED_DIRECTLY_FROM_GIAPHA4_GENDER_COLUMN",
  "A16M_GENDER_INFERRED_FROM_NAME=NO",
  "A16M_GENDER_INFERRED_FROM_PARENT_ROLE=NO",
  "A16M_GENDER_NULLABLE_OR_UNKNOWN=YES",
  "A16M_OFFICIAL_IMPORT_PARENT_ROLE_SOURCE=relationship_label_vi",
  "A16M_OFFICIAL_IMPORT_DIRECTION_SOURCE=source_person_fingerprint_PARENT_AND_related_person_fingerprint_CHILD",
  "A16M_OFFICIAL_IMPORT_WOULD_USE_LABEL_TO_WRITE_PARENT_ROLE=YES",
  "A16M_NO_GO_RULE=IF_PARENT_ROLE_OR_DIRECTION_UNPROVEN_OFFICIAL_IMPORT_REMAINS_BLOCKED",
  "A16M_RUNTIME_PARSER_IMPORT_BEHAVIOR_CHANGED=NO",
  "A16M_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16M_DIRECT_RPC_OFFICIAL_IMPORT_CALLED=NO",
  "A16M_REAL_GENEALOGY_WRITE=NO",
  "A16M_SQL_RUN=NO",
  "A16M_DB_PUSH_RUN=NO",
  "A16M_MIGRATION_REPAIR_RUN=NO",
  "A16M_SEED_RUN=NO",
  "A16M_PERMISSIONS_ROLES_AUTH_USERS_MEMBERSHIPS_MUTATED=NO",
  "A16M_DEPLOY_RUN=NO",
  "A16M_WRANGLER_TOML_CHANGED=NO",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "LOCAL_HYDRATION_ADVISORY_LIKELY_BROWSER_EXTENSION_INJECTION",
  "A16M_APP_LAYOUT_TSX_CHANGED=NO",
  "A16M_APP_LAYOUT_CRXLAUNCHER_ADDED=NO",
  "A16M_HYDRATION_GLOBAL_SUPPRESSION_ADDED=NO",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [parser, "buildParentRelationshipCandidates", "parser relationship builder"],
  [parser, "addParentCandidate(\"father\", \"fatherExternalId\", \"fatherName\")", "father candidate call"],
  [parser, "addParentCandidate(\"mother\", \"motherExternalId\", \"motherName\")", "mother candidate call"],
  [parser, "sourcePersonFingerprint: matched?.fingerprint", "source fingerprint is parent"],
  [parser, "relatedPersonFingerprint: input.person.fingerprint", "related fingerprint is child"],
  [parser, "relationshipLabelVi: `${roleLabel}: ${parentName || parentExternalId}`", "parser label creation"],
  [parser, "parentRole: role", "parser parentRole in memory"],
  [normalize, "normalizeGiaPha4Gender", "gender normalizer"],
  [normalize, "[\"nam\", \"male\", \"m\"]", "male explicit source values"],
  [normalize, "[\"nu\", \"female\", \"f\"]", "female explicit source values"],
  [uploadService, "relationship_label_vi: candidate.relationshipLabelVi", "persist label"],
  [uploadService, "source_person_fingerprint: candidate.sourcePersonFingerprint", "persist source fingerprint"],
  [uploadService, "related_person_fingerprint: candidate.relatedPersonFingerprint", "persist related fingerprint"],
  [manifestRead, "relationshipLabelVi: row.relationship_label_vi", "read label passthrough"],
  [dryRunPreview, "relationshipLabelVi: relationship.relationshipLabelVi", "dry-run label passthrough"],
  [panel, "{relationship.relationshipLabelVi}", "UI direct label render"],
  [officialService, "canRunOfficialImport: false", "official service locked"],
  [officialGate, "officialImportEnabled: false", "official gate locked"],
  [a16vSql, "insert into public.family_parents", "A16V family parents insert branch"],
  [a16vSql, "lower(rel.relationship_label_vi)", "A16V derives parent role from label"],
  [a16vSql, "parent.source_person_fingerprint = rel.source_person_fingerprint", "A16V source fingerprint parent join"],
  [a16vSql, "fam.child_fingerprint = rel.related_person_fingerprint", "A16V related fingerprint child join"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a16m-relationship-role-mapping-root-cause-plan"] !==
  "node scripts/check-a16m-relationship-role-mapping-root-cause-plan.cjs"
) {
  failures.push("missing package script check:a16m-relationship-role-mapping-root-cause-plan");
}

for (const [content, token, label] of [
  [index, "PLAN_A16M_RELATIONSHIP_ROLE_MAPPING_ROOT_CAUSE_PLAN.md", "index entry"],
  [workLog, "A16M_RELATIONSHIP_ROLE_MAPPING_ROOT_CAUSE_STATUS=PLAN_ONLY_IMPORT_BLOCKED", "work log status"],
  [decisionLog, "A-16M keeps official import blocked until relationship role root cause is proven", "decision log entry"],
  [handoff, "A16M_RELATIONSHIP_ROLE_MAPPING_ROOT_CAUSE_STATUS=PLAN_ONLY_IMPORT_BLOCKED", "handoff status"],
]) {
  requireIncludes(content, token, label);
}

rejectIncludes(layout, "crxlauncher", "layout must not add crxlauncher");
rejectPattern(layout, /suppressHydrationWarning\s*=\s*{?\s*true/i, "global hydration suppression");
rejectPattern(officialService, /canRunOfficialImport:\s*true/, "official import canRun true");
rejectPattern(officialGate, /officialImportEnabled:\s*true|canOpenOfficialImport:\s*true/, "official gate true");

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
  packagePath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "scripts/check-a16l-dry-run-preview-owner-review-relationship-audit.cjs",
  "scripts/check-a16l-dry-run-mapping-preview.cjs",
  "docs/PLAN_A16N_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EVIDENCE.md",
  "docs/evidence/A16N_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EVIDENCE_TEMPLATE.md",
  "scripts/audit-a16n-full-dry-run-relationships.cjs",
  "scripts/check-a16n-full-dry-run-relationship-audit-evidence.cjs",
  "docs/PLAN_A16O_UNCAP_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY.md",
  "scripts/check-a16o-uncap-dry-run-relationship-audit-export-read-only.cjs",
  "docs/PLAN_A16O_DEPLOY_READ_ONLY_AUDIT_EXPORT_SMOKE.md",
  "scripts/check-a16o-deploy-read-only-audit-export-smoke.cjs",
  ...a16oRuntimeChangedFiles,
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
  console.error("A-16M relationship role mapping root-cause plan check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16M relationship role mapping root-cause plan check passed.");
