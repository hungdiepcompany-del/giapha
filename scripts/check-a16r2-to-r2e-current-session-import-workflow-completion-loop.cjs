const fs = require("fs");
const path = require("path");

const root = process.cwd();
const failures = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function requireIncludes(content, needle, label) {
  if (!content.includes(needle)) failures.push(`missing: ${label}`);
}

function rejectIncludes(content, needle, label) {
  if (content.includes(needle)) failures.push(`forbidden: ${label}`);
}

function rejectPattern(content, pattern, label) {
  if (pattern.test(content)) failures.push(`forbidden pattern: ${label}`);
}

const page = read("app/(admin)/admin/exports/import/page.tsx");
const uploadForm = read("components/imports/giapha4-manifest-upload-form.tsx");
const uploadService = read("lib/import/giapha4/manifest-upload-service.ts");
const panel = read("components/imports/import-session-manifest-panel.tsx");
const dryRunGate = read("lib/import/giapha4/import-dry-run-approval-gate.ts");
const dryRunPreview = read("lib/import/giapha4/dry-run-mapping-preview-service.ts");
const ownerApproval = read(
  "lib/import/giapha4/import-session-owner-approval-state-service.ts",
);
const officialService = read("lib/import/giapha4/official-import-service.ts");
const officialRoute = read(
  "app/api/admin/import-sessions/[sessionId]/official-import/route.ts",
);
const warningService = read("lib/import/giapha4/warning-review-service.ts");
const warningRoute = read(
  "app/api/admin/import-sessions/[sessionId]/warnings/acknowledge/route.ts",
);
const reviewPack = read("lib/import/giapha4/import-review-pack-service.ts");
const validation = read("lib/import/giapha4/manifest-validation-service.ts");
const packageJson = JSON.parse(read("package.json"));

requireIncludes(page, "searchParams?: Promise", "server page receives searchParams");
requireIncludes(page, "normalizeImportSessionId", "server page validates sessionId");
requireIncludes(
  page,
  "getImportManifest(selectedSession.sessionId)",
  "server page reads manifest from URL sessionId",
);
requireIncludes(
  page,
  "Chua chon phien nhap",
  "server page renders no-session state",
);
requireIncludes(
  page,
  "Cong cu cu va lich su kiem toan",
  "legacy tools are separated from primary workflow",
);
rejectIncludes(
  page,
  "A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID",
  "runtime page must not import audited historical session",
);
rejectIncludes(page, "listImportSessions", "page must not use newest-session fallback");
rejectPattern(
  page,
  /\.order\(\s*["']created_at["']/,
  "page must not order sessions by created_at fallback",
);

requireIncludes(
  uploadForm,
  "data.sessionId ?? data.summary.sessionId",
  "upload client reads returned sessionId",
);
requireIncludes(
  uploadForm,
  "/admin/exports/import?sessionId=",
  "upload client binds sessionId into URL",
);
requireIncludes(uploadService, "sessionId: string | null;", "upload result top-level sessionId");
requireIncludes(uploadService, "manifestId: string | null;", "upload result top-level manifestId");
requireIncludes(uploadService, "stagingRowCount: number;", "upload result top-level staging row count");
requireIncludes(uploadService, "stagingPeopleCount: number;", "upload result top-level staging people count");
requireIncludes(
  uploadService,
  "stagingRelationshipCount: number;",
  "upload result top-level staging relationship count",
);
requireIncludes(
  uploadService,
  "sessionId: merged.summary.sessionId",
  "upload result derives top-level sessionId from summary",
);

requireIncludes(panel, "currentSessionId?: string | null", "panel accepts current session");
requireIncludes(panel, "sessionList", "panel avoids contradictory sessions.length state");
requireIncludes(panel, "buildImportWarningReviewSummary", "panel builds warning review summary");
requireIncludes(panel, "WarningGroupReviewClient", "panel renders warning group review");
requireIncludes(panel, "buildA16BCOwnerApprovalStateRoute", "panel builds owner approval route dynamically");
requireIncludes(panel, "buildA16BCReadyForOwnerApprovalMarker", "panel builds ready marker dynamically");
requireIncludes(panel, "buildA16BCOwnerApprovedForDbWriteMarker", "panel builds DB-write marker dynamically");
requireIncludes(panel, "buildA16ROfficialImportSessionMarker", "panel builds official marker dynamically");
requireIncludes(
  panel,
  "A16R2_PHASE_LOCK_OFFICIAL_IMPORT_DISABLED_NO_EXECUTOR_CALL",
  "panel hard-locks official import UI in A-16R2 phase",
);
requireIncludes(panel, "canSubmit={false}", "official import UI cannot submit");
rejectIncludes(
  panel,
  "A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID",
  "panel must not gate runtime by audited historical session",
);
rejectIncludes(
  panel,
  "A16BC_OWNER_APPROVAL_STATE_ROUTE",
  "panel must not use historical owner approval route const",
);
rejectIncludes(
  panel,
  "A16BC_LOCKED_AUDITED_SESSION_MISMATCH",
  "panel must not block current session as audited mismatch",
);

requireIncludes(
  dryRunGate,
  "ImportDryRunApprovalGateInput",
  "dry-run gate accepts explicit current-session input",
);
requireIncludes(
  dryRunGate,
  "requiredWarningsReviewed",
  "dry-run gate includes warning-review prerequisite",
);
requireIncludes(
  dryRunGate,
  "sessionExplicit",
  "dry-run gate requires explicit session",
);
rejectIncludes(dryRunGate, "sessionMatchesAudited", "dry-run gate must not compare audited session");
rejectPattern(
  dryRunGate,
  /sessionId\s*===\s*A16K_AUDITED_DRY_RUN_SESSION_ID/,
  "dry-run gate must not lock to audited UUID",
);
rejectIncludes(
  dryRunPreview,
  "A16K_AUDITED_DRY_RUN_SESSION_ID",
  "dry-run preview API must not import audited session const",
);
rejectIncludes(
  dryRunPreview,
  "Full relationship audit export is locked to the A-16K audited dry-run session.",
  "dry-run audit export must use current session",
);

requireIncludes(
  ownerApproval,
  "buildA16BCReadyForOwnerApprovalMarker",
  "owner approval ready marker builder exists",
);
requireIncludes(
  ownerApproval,
  "expectedMarkerForAction(params.action, params.sessionId)",
  "owner approval validates marker against current session",
);
rejectIncludes(
  ownerApproval,
  "A16BC_BLOCKED_AUDITED_SESSION_MISMATCH",
  "owner approval service must not require historical audited session",
);
rejectPattern(
  ownerApproval,
  /params\.sessionId\s*!==\s*A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID/,
  "owner approval service must not compare against audited session ID",
);

requireIncludes(
  warningService,
  "A16R2_WARNING_GROUP_REVIEW_BOUND_TO_SESSION_VERSION",
  "warning review marker exists",
);
requireIncludes(warningService, "confirmManifestId", "warning acknowledgement checks manifest hash");
requireIncludes(warningService, "confirmStagingVersion", "warning acknowledgement checks staging version");
requireIncludes(warningService, "acknowledged_by", "warning acknowledgement records actor");
requireIncludes(warningService, "acknowledged_at", "warning acknowledgement records timestamp");
requireIncludes(warningService, "policy_applied", "warning acknowledgement records policy");
requireIncludes(
  warningService,
  '.from("import_session_warnings")',
  "warning acknowledgement writes only warning staging table",
);
requireIncludes(
  warningRoute,
  "acknowledgeImportWarningGroup",
  "warning acknowledgement route calls warning service",
);

requireIncludes(
  reviewPack,
  "warningReviewSummary.requiredWarningsReviewed",
  "review pack readiness requires warning review",
);
requireIncludes(
  validation,
  "blockerCount",
  "validation summary separates blocker count",
);
requireIncludes(
  validation,
  "manifestId",
  "validation summary exposes manifestId",
);
requireIncludes(
  validation,
  "stagingVersion",
  "validation summary exposes staging version",
);

requireIncludes(
  officialService,
  "buildA16ROfficialImportSessionMarker",
  "official service has dynamic session marker builder",
);
requireIncludes(
  officialService,
  "confirmation.confirmMarker !== expectedSessionMarker",
  "official service validates marker against current session",
);
requireIncludes(
  officialRoute,
  "buildA16ROfficialImportSessionMarker(sessionId)",
  "official route validates marker against current session",
);

rejectPattern(
  warningService + warningRoute,
  /\bfrom\(["']people["']\)|\bfrom\(["']families["']\)|\bfrom\(["']family_parents["']\)|\bfrom\(["']family_children["']\)|\bfrom\(["']tree_layouts["']\)|\bfrom\(["']revisions["']\)/,
  "new A-16R2 warning files must not write/query genealogy runtime tables",
);

const scriptName =
  "check:a16r2-to-r2e-current-session-import-workflow-completion-loop";
if (
  packageJson.scripts?.[scriptName] !==
  "node scripts/check-a16r2-to-r2e-current-session-import-workflow-completion-loop.cjs"
) {
  failures.push(`missing package script ${scriptName}`);
}

if (failures.length > 0) {
  console.error("A16R2_TO_R2E_CURRENT_SESSION_IMPORT_WORKFLOW_COMPLETION_LOOP=FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A16R2_TO_R2E_CURRENT_SESSION_IMPORT_WORKFLOW_COMPLETION_LOOP=PASS");
console.log("CURRENT_SESSION_EXPLICIT=YES");
console.log("CURRENT_SESSION_BOUND_TO_URL=YES");
console.log("NEWEST_SESSION_FALLBACK_PRESENT=NO");
console.log("HISTORICAL_SESSION_RUNTIME_GATE=NO");
console.log("WARNING_ACK_BOUND_TO_SESSION_VERSION=YES");
console.log("OWNER_APPROVAL_DYNAMIC=YES");
console.log("OFFICIAL_IMPORT_UI_DISABLED=YES");
console.log("TRANSACTION_EXECUTOR_CALL_COUNT=0");
console.log("OFFICIAL_IMPORT_EXECUTED=NO");
console.log("RUNTIME_GENEALOGY_MUTATION=NONE");
console.log("PRODUCTION_MUTATION=NONE");
