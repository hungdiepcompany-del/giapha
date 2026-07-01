const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16Q_DUP_LIVE_SAVE_FIX.md";
const checkerPath = "scripts/check-a16q-dup-live-save-fix.cjs";
const packagePath = "package.json";
const clientPath = "components/imports/duplicate-decision-review-client.tsx";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const servicePath =
  "lib/import/giapha4/duplicate-decision-review-service.ts";
const getRoutePath =
  "app/api/admin/import-sessions/[sessionId]/duplicates/route.ts";
const patchRoutePath =
  "app/api/admin/import-sessions/[sessionId]/duplicates/[duplicateId]/route.ts";

function readFile(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function readJson(relativePath) {
  const content = readFile(relativePath);
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    failures.push(`${relativePath} is not valid JSON`);
    return null;
  }
}

function gitOutput(args) {
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

const doc = readFile(docPath);
readFile(checkerPath);
const packageJson = readJson(packagePath);
const client = readFile(clientPath);
const panel = readFile(panelPath);
const service = readFile(servicePath);
const getRoute = readFile(getRoutePath);
const patchRoute = readFile(patchRoutePath);
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16Q-DUP-LIVE-SAVE-FIX",
  "A16Q_DUP_LIVE_SAVE_FIX_STATUS=LIVE_SESSION_BINDING_REPAIRED",
  "DUPLICATE_DECISION_NOT_IN_SESSION",
  "Danh sách ứng viên trùng đã cũ, vui lòng tải lại phiên nhập.",
  "PATCH uses the duplicate candidate UUID from `candidate.id`, not",
  "sourceRowIndex",
  "success and error are not shown at the same time",
  "never auto-decides duplicate candidates",
  "A16Q_DUP_LIVE_SAVE_FIX_SQL_STATUS=NOT_RUN",
  "A16Q_DUP_LIVE_SAVE_FIX_DB_PUSH_STATUS=NOT_RUN",
  "A16Q_DUP_LIVE_SAVE_FIX_RPC_STATUS=NOT_CALLED",
  "A16Q_DUP_LIVE_SAVE_FIX_OFFICIAL_IMPORT_POST_STATUS=NOT_CALLED",
  "A16Q_DUP_LIVE_SAVE_FIX_REAL_GENEALOGY_WRITE_STATUS=NO_WRITE",
  "canRunOfficialImport=false",
  "officialImportButtonDisabled=true",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

if (
  packageJson?.scripts?.["check:a16q-dup-live-save-fix"] !==
  "node scripts/check-a16q-dup-live-save-fix.cjs"
) {
  failures.push("missing package script check:a16q-dup-live-save-fix");
}

for (const [content, token, label] of [
  [index, "PLAN_A16Q_DUP_LIVE_SAVE_FIX.md", "index entry"],
  [
    workLog,
    "A16Q_DUP_LIVE_SAVE_FIX_STATUS=LIVE_SESSION_BINDING_REPAIRED",
    "work log status",
  ],
  [decisionLog, "Decision 229", "decision log entry"],
  [
    handoff,
    "A16Q_DUP_LIVE_SAVE_FIX_STATUS=LIVE_SESSION_BINDING_REPAIRED",
    "handoff status",
  ],
]) {
  requireIncludes(content, token, label);
}

for (const token of [
  "buildDuplicateListKey",
  "incomingDuplicateListKey",
  "const [activeSessionId] = useState(sessionId)",
  "const [activeDuplicateListKey]",
  "useState(incomingDuplicateListKey)",
  "isStaleDuplicateList",
  "Danh sách ứng viên trùng đã cũ, vui lòng tải lại phiên nhập.",
  "disabled={isPending || isStaleDuplicateList}",
  "isUuid(candidate.id)",
  "`/api/admin/import-sessions/${sessionId}/duplicates/${candidate.id}`",
  "type SaveNotice",
  "setSaveNotice(null)",
  "tone: \"error\"",
  "tone: \"success\"",
  "setLastSavedId(null)",
]) {
  requireIncludes(client, token, `client token ${token}`);
}

rejectPattern(
  client,
  /duplicates\/\$\{candidate\.sourceRowIndex\}|duplicates\/\$\{sourceRowIndex\}/,
  "client must not PATCH with sourceRowIndex",
);
rejectPattern(
  client,
  /useEffect\s*\([\s\S]{0,360}saveDecision/i,
  "client must not auto-save decisions",
);
rejectPattern(
  client,
  /setDrafts\s*\([\s\S]{0,260}(create_new|link_existing|ignore_candidate)[\s\S]{0,260}\)/i,
  "client must not auto choose a final duplicate decision",
);

for (const token of [
  "key={`duplicate-review-${session.id}-${session.updatedAt}`}",
  "sessionId={session.id}",
  "duplicateCandidates={result.duplicateCandidates}",
]) {
  requireIncludes(panel, token, `panel token ${token}`);
}

for (const token of [
  "export async function GET",
  "getDuplicateDecisionReview(sessionId)",
  "sessionId",
]) {
  requireIncludes(getRoute, token, `GET route token ${token}`);
}

for (const token of [
  "export async function PATCH",
  "sessionId",
  "duplicateId",
  "updateDuplicateOwnerDecision",
  "ownerDecision: payload.ownerDecision",
  "decisionNote: payload.decisionNote",
]) {
  requireIncludes(patchRoute, token, `PATCH route token ${token}`);
}

for (const token of [
  "candidate.id === input.duplicateId",
  ".eq(\"id\", input.duplicateId)",
  ".eq(\"import_session_id\", input.sessionId)",
  "DUPLICATE_DECISION_NOT_IN_SESSION",
  "ownerDecision === \"link_existing\"",
  "canRunOfficialImport: false",
  "realGenealogyWrite: false",
]) {
  requireIncludes(service, token, `service token ${token}`);
}

for (const [label, content] of [
  [clientPath, client],
  [panelPath, panel],
  [servicePath, service],
  [getRoutePath, getRoute],
  [patchRoutePath, patchRoute],
]) {
  rejectPattern(content, /\.rpc\s*\(/i, `${label} must not call RPC`);
  rejectPattern(
    content,
    /a16p_tx_execute_giapha4_official_import|POST\s+\/official-import/i,
    `${label} must not call official import`,
  );
  rejectPattern(
    content,
    /\.from\(\s*["'](people|relationships|families|tree_layout|revisions|profiles)["']\s*\)[\s\S]{0,240}\.(insert|update|delete|upsert)\s*\(/i,
    `${label} must not write real genealogy tables`,
  );
}

const changedFiles = gitOutput(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  checkerPath,
  packagePath,
  clientPath,
  panelPath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "scripts/check-a16q-dup-save-fix.cjs",
  "scripts/check-a16q-dup-rls-verify-ui-write-pass.cjs",
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === ".env.local" || file.endsWith(".env.local")) {
    failures.push(".env.local must not be changed");
  }
  if (file.startsWith("db/migrations/") || file.startsWith("supabase/migrations/")) {
    failures.push(`migration must not change ${file}`);
  }
  if (file.startsWith("db/checks/")) failures.push(`SQL check must not change ${file}`);
  if (file.startsWith("supabase/.temp/")) {
    failures.push(`supabase temp must not change ${file}`);
  }
  if (/\.(xls|xlsx|csv)$/i.test(file)) {
    failures.push(`spreadsheet/csv must not be changed ${file}`);
  }
}

const stagedFiles = gitOutput(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (/\.(xls|xlsx|csv)$/i.test(file)) failures.push(`staged data file ${file}`);
}

if (failures.length > 0) {
  console.error("A-16Q-DUP-LIVE-SAVE-FIX check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16Q-DUP-LIVE-SAVE-FIX check passed.");
