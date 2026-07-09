const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16AK_OFFICIAL_IMPORT_SESSION_DUPLICATE_READINESS.md";
const checkerPath =
  "scripts/check-a16ak-official-import-session-duplicate-readiness.cjs";
const packagePath = "package.json";
const pagePath = "app/(admin)/admin/exports/import/page.tsx";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const duplicateClientPath =
  "components/imports/duplicate-decision-review-client.tsx";
const officialServicePath = "lib/import/giapha4/official-import-service.ts";

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
const packageJson = readJson(packagePath);
const page = read(pagePath);
const panel = read(panelPath);
const duplicateClient = read(duplicateClientPath);
const officialService = read(officialServicePath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16AK - Official Import Session And Duplicate Decision Readiness",
  "A16AK_STATUS=PASS_SOURCE_UI_BINDS_IMPORT_READINESS_TO_AUDITED_SESSION_FAIL_CLOSED",
  "A16AK_CLASSIFICATION=SOURCE_UI_SESSION_SELECTION_MISMATCH_FOR_IMPORT_READINESS",
  "cc7c7e6a-58fe-4824-be57-86d00b008306",
  "2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "A16AK_UI_AUDITED_SESSION_SOURCE=A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID",
  "A16AK_UI_GET_IMPORT_MANIFEST_CALL=getImportManifest(A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID)",
  "A16AK_BLOCKER=DEPLOY_AND_AUTHENTICATED_OWNER_REVIEW_REQUIRED_TO_PROVE_AUDITED_SESSION_DUPLICATE_DECISION_RUNTIME_STATE",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "A16AK_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16AK_DIRECT_RPC_CALLED=NO",
  "A16AK_REAL_GENEALOGY_WRITE=NO",
  "A16AK_SQL_RUN=NO",
  "A16AK_DB_PUSH_RUN=NO",
  "A16AK_MIGRATION_REPAIR_RUN=NO",
  "A16AK_SEED_RUN=NO",
  "A16AK_DEPLOY_RUN=NO",
  "A16AK_AUTH_USER_ROLE_PERMISSION_MEMBERSHIP_MUTATION=NO",
  "A16AK_RAW_JSON_COMMITTED=NO",
  "A16AK_WRANGLER_TOML_CHANGED=NO",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [page, "A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID", "page imports audited session id"],
  [
    page,
    "getImportManifest(A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID)",
    "page loads audited session manifest",
  ],
  [
    page,
    "Không dùng phiên mới nhất",
    "page warns against latest session selection",
  ],
  [
    page,
    "family.json backup",
    "page distinguishes family backup from audited import session",
  ],
  [panel, "DuplicateDecisionReviewClient", "panel renders duplicate review client"],
  [panel, "officialImportSessionMismatch", "panel keeps mismatch warning guard"],
  [panel, "disabled", "official import button remains disabled"],
  [panel, "aria-disabled=\"true\"", "official import aria-disabled"],
  [
    duplicateClient,
    "`/api/admin/import-sessions/${sessionId}/duplicates/${candidate.id}`",
    "duplicate save remains session-scoped",
  ],
  [
    officialService,
    "A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID",
    "official service audited session const",
  ],
]) {
  requireIncludes(content, token, label);
}

rejectIncludes(page, "listImportSessions", "page must not select latest session");
rejectIncludes(page, "sessions[0]", "page must not use first/latest session");
rejectPattern(
  page + panel + duplicateClient,
  /fetch\s*\([\s\S]{0,240}\/official-import/i,
  "UI must not call official import",
);
rejectPattern(
  doc + page + panel + duplicateClient,
  /A16R_IMPORT_RETRY_NEXT=YES|canRunOfficialImport:\s*true|canProceedToOfficialImport:\s*true/,
  "A-16AK must not open official import",
);
rejectPattern(
  doc + page + panel + duplicateClient,
  /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i,
  "secret-like token",
);

if (
  packageJson?.scripts?.["check:a16ak-official-import-session-duplicate-readiness"] !==
  "node scripts/check-a16ak-official-import-session-duplicate-readiness.cjs"
) {
  failures.push(
    "missing package script check:a16ak-official-import-session-duplicate-readiness",
  );
}

for (const [content, token, label] of [
  [
    index,
    "PLAN_A16AK_OFFICIAL_IMPORT_SESSION_DUPLICATE_READINESS.md",
    "index entry",
  ],
  [
    workLog,
    "A16AK_STATUS=PASS_SOURCE_UI_BINDS_IMPORT_READINESS_TO_AUDITED_SESSION_FAIL_CLOSED",
    "work log status",
  ],
  [
    decisionLog,
    "A-16AK binds owner import readiness UI to the audited A-16R session",
    "decision log entry",
  ],
  [
    handoff,
    "A16AK_STATUS=PASS_SOURCE_UI_BINDS_IMPORT_READINESS_TO_AUDITED_SESSION_FAIL_CLOSED",
    "handoff status",
  ],
]) {
  requireIncludes(content, token, label);
}

const allowedChangedFiles = new Set([
  docPath,
  checkerPath,
  "docs/PLAN_A16AL_OFFICIAL_IMPORT_RUNTIME_MARKER_ALIGNMENT.md",
  "scripts/check-a16al-official-import-runtime-marker-alignment.cjs",
  "scripts/check-a16ae-runtime-official-import-enablement-candidate.cjs",
  "scripts/check-a16r-runtime-execution-enablement-gate.cjs",
  "scripts/check-a16r-runtime-execution-enablement-owner-review.cjs",
  "scripts/check-a16r-official-import-gate-readiness-diagnosis.cjs",
  "scripts/check-a16r-fix-official-import-session-selection-mismatch.cjs",
  "scripts/check-a16q-dup-decision-verify.cjs",
  "scripts/check-a16ah-official-import-runtime-execution-branch-candidate.cjs",
  pagePath,
  packagePath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
]);

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === "wrangler.toml" || file === "app/layout.tsx") {
    failures.push(`forbidden changed file ${file}`);
  }
  if (/^(db\/migrations|supabase\/migrations|db\/checks)\//.test(file)) {
    failures.push(`forbidden SQL/check file ${file}`);
  }
  if (file.startsWith(".tmp/") || file.startsWith(".tmp\\")) {
    failures.push(`forbidden raw temp evidence file ${file}`);
  }
  if (/\.(xls|xlsx|csv|zip|json)$/i.test(file) && file !== packagePath) {
    failures.push(`forbidden raw data/evidence file ${file}`);
  }
}

const stagedFiles = git(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected staged file ${file}`);
}

if (failures.length > 0) {
  console.error("A-16AK official import session duplicate readiness check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16AK official import session duplicate readiness check passed.");
