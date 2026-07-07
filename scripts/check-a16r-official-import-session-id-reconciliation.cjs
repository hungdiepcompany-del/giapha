const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16R_OFFICIAL_IMPORT_SESSION_ID_RECONCILIATION.md";
const checkerPath = "scripts/check-a16r-official-import-session-id-reconciliation.cjs";
const packagePath = "package.json";
const wranglerPath = "wrangler.toml";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const pagePath = "app/(admin)/admin/exports/import/page.tsx";
const manifestReadPath = "lib/import/giapha4/manifest-read-service.ts";
const officialServicePath = "lib/import/giapha4/official-import-service.ts";
const officialRoutePath =
  "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";

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
const panel = read(panelPath);
const page = read(pagePath);
const manifestRead = read(manifestReadPath);
const officialService = read(officialServicePath);
const officialRoute = read(officialRoutePath);

for (const token of [
  "A-16R-OFFICIAL-IMPORT-SESSION-ID-RECONCILIATION",
  "A16R_OFFICIAL_IMPORT_SESSION_ID_RECONCILIATION_STATUS=RECONCILED_READ_ONLY_NO_IMPORT",
  "A16R_OFFICIAL_IMPORT_SESSION_ID_RECONCILIATION_CLASSIFICATION=UNKNOWN_NEEDS_READ_ONLY_SESSION_EVIDENCE",
  "A16R_OFFICIAL_IMPORT_SESSION_ID_AUTHORITATIVE=UNKNOWN",
  "APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_ae7a5fe3-6a29-4f60-85f7-76108ed02565",
  "ae7a5fe3-6a29-4f60-85f7-76108ed02565",
  "APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "A16R_SESSION_2AF4BFB6_PEOPLE_COUNT=102",
  "A16R_SESSION_2AF4BFB6_RELATIONSHIP_COUNT=134",
  "A16R_SESSION_2AF4BFB6_VALIDATION_ERRORS=0",
  "A16R_SESSION_2AF4BFB6_DRY_RUN_BLOCKERS=0",
  "A16R_SESSION_2AF4BFB6_DUPLICATE_UNRESOLVED=0",
  "A16R_SESSION_2AF4BFB6_DUPLICATE_NEEDS_REVIEW=0",
  "A16R_SESSION_2AF4BFB6_DUPLICATE_CREATE_NEW=8",
  "A16R_SESSION_AE7A5FE3_PEOPLE_COUNT=UNKNOWN",
  "A16R_SESSION_AE7A5FE3_RELATIONSHIP_COUNT=UNKNOWN",
  "A16R_SESSION_AE7A5FE3_VALIDATION_ERRORS=UNKNOWN",
  "A16R_SESSION_AE7A5FE3_DRY_RUN_BLOCKERS=UNKNOWN",
  "A16R_SESSION_AE7A5FE3_DUPLICATE_UNRESOLVED=UNKNOWN",
  "A16R_SESSION_AE7A5FE3_DUPLICATE_NEEDS_REVIEW=UNKNOWN",
  "A16R_SESSION_AE7A5FE3_DUPLICATE_CREATE_NEW=UNKNOWN",
  "A16R_SESSION_ID_RECONCILIATION_OBSERVED_UI_MARKER_CORRECT=UNKNOWN",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "A16R_IMPORT_MAY_BE_RETRIED_NEXT=NO",
  "A16R_SESSION_ID_RECONCILIATION_DEPLOY_RUN=NO",
  "A16R_SESSION_ID_RECONCILIATION_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16R_SESSION_ID_RECONCILIATION_DIRECT_RPC_CALLED=NO",
  "A16R_SESSION_ID_RECONCILIATION_REAL_GENEALOGY_WRITE=NO",
  "A16R_SESSION_ID_RECONCILIATION_SQL_RUN=NO",
  "A16R_SESSION_ID_RECONCILIATION_DB_PUSH_RUN=NO",
  "A16R_SESSION_ID_RECONCILIATION_MIGRATION_REPAIR_RUN=NO",
  "A16R_SESSION_ID_RECONCILIATION_SEED_RUN=NO",
  "A16R_SESSION_ID_RECONCILIATION_PERMISSIONS_ROLES_AUTH_USERS_MEMBERSHIPS_MUTATED=NO",
  "A16R_SESSION_ID_RECONCILIATION_WRANGLER_TOML_CHANGED=NO",
  "A16R_SESSION_ID_RECONCILIATION_DIRECT_PRODUCTION_DB_QUERY=NO",
  "A16R_SESSION_ID_RECONCILIATION_NEXT_ALLOWED_ACTION=OWNER_AUTHENTICATED_READ_ONLY_SESSION_DETAIL_SMOKE_FOR_BOTH_SESSION_IDS_NO_POST_NO_IMPORT",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [panel, "const officialImportSessionMarker = session", "panel dynamic session marker"],
  [panel, "APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_${session.id}", "panel marker from session id"],
  [panel, "APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68", "panel fallback marker"],
  [page, "listImportSessions()", "page lists sessions"],
  [page, "getImportManifest(importSessionsResult.sessions[0].id)", "page selects first session"],
  [manifestRead, ".from(\"import_sessions\")", "manifest reads import_sessions"],
  [manifestRead, ".order(\"created_at\", { ascending: false })", "manifest newest-first ordering"],
  [manifestRead, ".limit(20)", "manifest list limit"],
  [manifestRead, ".eq(\"id\", sessionId)", "manifest session lookup by id"],
  [officialService, "A16U_REQUIRED_SESSION_ID", "official service required session const"],
  [officialService, "2af4bfb6-a20e-453e-9804-1b8c0afbdd68", "official service hardcoded prior session"],
  [officialService, "canRunOfficialImport: false", "official service fail closed"],
  [officialRoute, "export async function POST", "official POST route exists but not called"],
  [officialRoute, "canRunOfficialImport: false", "official route fail closed"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a16r-official-import-session-id-reconciliation"] !==
  "node scripts/check-a16r-official-import-session-id-reconciliation.cjs"
) {
  failures.push("missing package script check:a16r-official-import-session-id-reconciliation");
}

for (const [content, token, label] of [
  [index, "PLAN_A16R_OFFICIAL_IMPORT_SESSION_ID_RECONCILIATION.md", "index entry"],
  [workLog, "A16R_OFFICIAL_IMPORT_SESSION_ID_RECONCILIATION_STATUS=RECONCILED_READ_ONLY_NO_IMPORT", "work log status"],
  [decisionLog, "A-16R official import session id remains unknown until both sessions are read-only verified", "decision log entry"],
  [handoff, "A16R_OFFICIAL_IMPORT_SESSION_ID_RECONCILIATION_STATUS=RECONCILED_READ_ONLY_NO_IMPORT", "handoff status"],
]) {
  requireIncludes(content, token, label);
}

for (const [label, content] of [
  [officialServicePath, officialService],
  [officialRoutePath, officialRoute],
]) {
  rejectPattern(content, /\.rpc\s*\(/i, `${label} must not call direct RPC`);
  rejectPattern(content, /canRunOfficialImport:\s*true/, `${label} must remain fail-closed`);
}

rejectPattern(doc, /A16R_IMPORT_RETRY_NEXT=YES/, "A-16R retry must not be YES");
rejectPattern(doc, /AUTHORITATIVE=(?!UNKNOWN)/, "authoritative session must remain UNKNOWN");
rejectPattern(doc + panel + page + manifestRead + officialService + officialRoute, /SUPABASE_SERVICE_ROLE_KEY\s*=/i, "secret assignment");
rejectPattern(doc + panel + page + manifestRead + officialService + officialRoute, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");

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
  "scripts/check-a16r-ui-copy-refresh-official-import-gate.cjs",
  "scripts/check-a16r-production-ui-gate-state-reconciliation.cjs",
  "scripts/check-a16r-owner-auth-gate-smoke-and-evidence-bundle.cjs",
  "scripts/check-a16r-official-import-gate-readiness-diagnosis.cjs",
  "scripts/check-a16r-runtime-execution-enablement-gate.cjs",
  "scripts/check-a16r-runtime-execution-enablement-owner-review.cjs",
  "scripts/check-a16k-owner-approval-gate-dry-run-import.cjs",
  "scripts/check-a16t-apply-verify.cjs",
  "scripts/check-a16u-locked-runtime-wiring.cjs",
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === ".env.local" || file.endsWith(".env.local")) failures.push(`forbidden env file ${file}`);
  if (file.startsWith("supabase/.temp/")) failures.push(`forbidden supabase temp ${file}`);
  if (/\.(xls|xlsx|csv|png|jpg|jpeg|webp|zip)$/i.test(file)) {
    failures.push(`forbidden data/screenshot file ${file}`);
  }
  if (/^(db\/migrations|supabase\/migrations|db\/checks)\//.test(file)) {
    failures.push(`forbidden SQL/check file ${file}`);
  }
  if (
    file === wranglerPath ||
    file === "open-next.config.ts" ||
    file === "next.config.ts" ||
    file.startsWith(".github/workflows/") ||
    file.startsWith("app/") ||
    file.startsWith("components/") ||
    file.startsWith("lib/")
  ) {
    failures.push(`runtime/config/source file must not change in this phase ${file}`);
  }
}

const stagedFiles = git(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected staged file ${file}`);
}

if (failures.length > 0) {
  console.error("A-16R official import session id reconciliation check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16R official import session id reconciliation check passed.");
