const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16AL_OFFICIAL_IMPORT_RUNTIME_MARKER_ALIGNMENT.md";
const checkerPath =
  "scripts/check-a16al-official-import-runtime-marker-alignment.cjs";
const packagePath = "package.json";
const servicePath = "lib/import/giapha4/official-import-service.ts";
const routePath =
  "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const preflightGatePath = "lib/import/giapha4/official-import-preflight-gate.ts";
const sessionId = "2af4bfb6-a20e-453e-9804-1b8c0afbdd68";
const runtimeMarker = "APPROVE_A16R_RUNTIME_EXECUTION_AFTER_A16V_VERIFY";
const sessionMarker =
  "APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68";

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
const service = read(servicePath);
const route = read(routePath);
const panel = read(panelPath);
const preflightGate = read(preflightGatePath);
const packageJson = readJson(packagePath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const wrangler = read("wrangler.toml");
const layout = read("app/layout.tsx");

for (const token of [
  "A-16AL - A-16R Official Import Runtime Marker Alignment",
  "A16AL_STATUS=PASS_MARKERS_ALIGNED_EXECUTION_READY_NOT_PROVEN_READ_ONLY",
  "A16AL_CLASSIFICATION=SOURCE_MARKERS_ALIGNED_BUT_RUNTIME_REQUIRES_SAME_RUN_POST_CONFIRMATION",
  "A16R_IMPORT_RETRY_NEXT=NO",
  `A16AL_RUNTIME_MARKER=${runtimeMarker}`,
  `A16AL_SESSION_MARKER=${sessionMarker}`,
  `A16AL_SESSION_ID=${sessionId}`,
  "A16AL_MARKER_MISMATCH=NO",
  "A16AL_UI_CAN_BECOME_EXECUTION_READY_FROM_READ_ONLY_GET=NO",
  "A16AL_RUNTIME_CAN_BECOME_EXECUTION_READY_WITHOUT_SAME_RUN_CONFIRMATION=NO",
  "A16AL_BLOCKER=READ_ONLY_UI_DOES_NOT_SUBMIT_SAME_RUN_OFFICIAL_IMPORT_CONFIRMATION",
  "A16AL_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16AL_A16R_IMPORT_RETRY_EXECUTED=NO",
  "A16AL_DIRECT_MANUAL_RPC_CALLED=NO",
  "A16AL_SQL_RUN=NO",
  "A16AL_DB_PUSH_RUN=NO",
  "A16AL_MIGRATION_REPAIR_RUN=NO",
  "A16AL_SEED_RUN=NO",
  "A16AL_DEPLOY_RUN=NO",
  "A16AL_AUTH_USER_ROLE_PERMISSION_MEMBERSHIP_MUTATION=NO",
  "A16AL_REAL_GENEALOGY_WRITE=NO",
  "A16AL_RAW_JSON_COMMITTED=NO",
  "A16AL_WRANGLER_TOML_CHANGED=NO",
  "A16AL_APP_LAYOUT_TSX_CHANGED=NO",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [service, "A16R_RUNTIME_EXECUTION_ENABLEMENT_MARKER", "service runtime marker const"],
  [service, runtimeMarker, "service runtime marker value"],
  [service, "A16R_AUDITED_OFFICIAL_IMPORT_MARKER", "service session marker const"],
  [
    service,
    "`APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_${A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID}`",
    "service session marker template",
  ],
  [service, `\"${sessionId}\" as const`, "service audited session id"],
  [
    service,
    "confirmation.confirmRuntimeExecutionEnablementMarker ===\n    A16R_RUNTIME_EXECUTION_ENABLEMENT_MARKER",
    "service runtime marker comparison",
  ],
  [
    service,
    "confirmation.confirmMarker !== A16U_REQUIRED_A16R_RETRY_MARKER",
    "service session marker validation",
  ],
  [
    service,
    "confirmation.confirmSessionId !== sessionId",
    "service session id validation",
  ],
  [route, "confirmRuntimeExecutionEnablementMarker", "route parses runtime marker"],
  [route, "confirmMarker: body.confirmMarker", "route parses session marker"],
  [route, "confirmSessionId: body.confirmSessionId", "route parses session id"],
  [route, runtimeMarker, "route runtime marker missing reason"],
  [route, "A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED", "route candidate env gate"],
  [
    route,
    "A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED",
    "route execution branch env gate",
  ],
  [panel, "A16R_RUNTIME_EXECUTION_ENABLEMENT_MARKER", "panel displays runtime marker"],
  [panel, "officialImportSessionMarker", "panel displays session marker"],
  [panel, "disabled", "panel official import button disabled"],
  [panel, "aria-disabled=\"true\"", "panel official import aria disabled"],
  [
    preflightGate,
    "canOpenOfficialImport: false",
    "read-only GET gate cannot open official import",
  ],
  [
    preflightGate,
    "officialImportEnabled: false",
    "read-only GET gate official import disabled",
  ],
]) {
  requireIncludes(content, token, label);
}

rejectPattern(
  panel,
  /fetch\s*\([\s\S]{0,240}\/official-import/i,
  "UI must not POST official import",
);
rejectPattern(
  preflightGate,
  /canOpenOfficialImport:\s*true|officialImportEnabled:\s*true/i,
  "read-only preflight gate must not open official import",
);
rejectPattern(doc, /A16R_IMPORT_RETRY_NEXT=YES/i, "A-16R retry must remain NO");
rejectPattern(
  doc + panel + preflightGate,
  /canRunOfficialImport:\s*true|canProceedToOfficialImport:\s*true/i,
  "A-16AL must not open official import",
);
rejectPattern(
  doc + index + workLog + decisionLog + handoff,
  /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i,
  "secret-like token",
);
rejectPattern(wrangler, /A16AL|A16R_IMPORT_RETRY/i, "wrangler config must not change");
rejectPattern(layout, /A16AL|official-import/i, "app layout must not change");

if (
  packageJson?.scripts?.[
    "check:a16al-official-import-runtime-marker-alignment"
  ] !==
  "node scripts/check-a16al-official-import-runtime-marker-alignment.cjs"
) {
  failures.push(
    "missing package script check:a16al-official-import-runtime-marker-alignment",
  );
}

for (const [content, token, label] of [
  [
    index,
    "PLAN_A16AL_OFFICIAL_IMPORT_RUNTIME_MARKER_ALIGNMENT.md",
    "index entry",
  ],
  [
    workLog,
    "A16AL_STATUS=PASS_MARKERS_ALIGNED_EXECUTION_READY_NOT_PROVEN_READ_ONLY",
    "work log status",
  ],
  [
    decisionLog,
    "A-16AL marker approval is evidence, not runtime state without same-run confirmation",
    "decision log entry",
  ],
  [
    handoff,
    "A16AL_STATUS=PASS_MARKERS_ALIGNED_EXECUTION_READY_NOT_PROVEN_READ_ONLY",
    "handoff status",
  ],
]) {
  requireIncludes(content, token, label);
}

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
  "scripts/check-a16ae-runtime-official-import-enablement-candidate.cjs",
  "scripts/check-a16ah-official-import-runtime-execution-branch-candidate.cjs",
  "scripts/check-a16ak-official-import-session-duplicate-readiness.cjs",
  "scripts/check-a16r-runtime-execution-enablement-gate.cjs",
  "scripts/check-a16r-runtime-execution-enablement-owner-review.cjs",
  "scripts/check-a16r-official-import-gate-readiness-diagnosis.cjs",
]);

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
  if (file !== packagePath && /\.(json|xlsx|xls|csv|zip)$/i.test(file)) {
    failures.push(`forbidden raw data/evidence file ${file}`);
  }
}

const stagedFiles = git(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected staged file ${file}`);
}

const changedPatch = git([
  "diff",
  "--",
  ...changedFiles.filter((file) => allowedChangedFiles.has(file)),
]);
for (const pattern of [
  /\bPOST\s+\/official-import\b/i,
  /\bsupabase\s+db\s+push\b/i,
  /\bwrangler\s+deploy\b/i,
]) {
  rejectPattern(changedPatch, pattern, `changed patch ${pattern}`);
}

if (failures.length > 0) {
  console.error("A-16AL official import runtime marker alignment check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16AL official import runtime marker alignment check passed.");
