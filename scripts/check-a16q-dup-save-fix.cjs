const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16Q_DUP_SAVE_FIX.md";
const checkerPath = "scripts/check-a16q-dup-save-fix.cjs";
const packagePath = "package.json";
const routePath =
  "app/api/admin/import-sessions/[sessionId]/duplicates/[duplicateId]/route.ts";
const servicePath =
  "lib/import/giapha4/duplicate-decision-review-service.ts";
const clientPath = "components/imports/duplicate-decision-review-client.tsx";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const reviewPackPath = "lib/import/giapha4/import-review-pack-service.ts";
const officialServicePath = "lib/import/giapha4/official-import-service.ts";

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
const route = readFile(routePath);
const service = readFile(servicePath);
const client = readFile(clientPath);
const panel = readFile(panelPath);
const reviewPack = readFile(reviewPackPath);
const officialService = readFile(officialServicePath);
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16Q-DUP-SAVE-FIX",
  "A16Q_DUP_SAVE_FIX_STATUS=PATCH_DIAGNOSTICS_AND_UI_SAVE_REPAIRED",
  "8158711d-1c3c-4208-987d-6fec6a1c5a1a",
  "owner_decision=unresolved",
  "existing_person_id=null",
  "DUPLICATE_DECISION_NOT_IN_SESSION",
  "DUPLICATE_DECISION_LINK_EXISTING_REQUIRES_EXISTING_PERSON",
  "DUPLICATE_DECISION_UPDATE_RLS_DENIED",
  "DUPLICATE_DECISION_UPDATE_NO_ROW_RETURNED",
  "DUPLICATE_DECISION_SAVED",
  "ownerDecision",
  "decisionNote",
  "canRunOfficialImport=false",
  "Official import button remains disabled",
  "No RPC call",
  "No POST `/official-import`",
  "No SQL run",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

if (
  packageJson?.scripts?.["check:a16q-dup-save-fix"] !==
  "node scripts/check-a16q-dup-save-fix.cjs"
) {
  failures.push("missing package script check:a16q-dup-save-fix");
}

for (const [content, token, label] of [
  [index, "PLAN_A16Q_DUP_SAVE_FIX.md", "index entry"],
  [
    workLog,
    "A16Q_DUP_SAVE_FIX_STATUS=PATCH_DIAGNOSTICS_AND_UI_SAVE_REPAIRED",
    "work log status",
  ],
  [decisionLog, "Decision 228", "decision log entry"],
  [
    handoff,
    "A16Q_DUP_SAVE_FIX_STATUS=PATCH_DIAGNOSTICS_AND_UI_SAVE_REPAIRED",
    "handoff status",
  ],
]) {
  requireIncludes(content, token, label);
}

for (const token of [
  "export async function PATCH",
  "updateDuplicateOwnerDecision",
  "ownerDecision: payload.ownerDecision",
  "decisionNote: payload.decisionNote",
]) {
  requireIncludes(route, token, `route token ${token}`);
}
rejectPattern(route, /\.rpc\s*\(/i, "PATCH route must not call RPC");
rejectPattern(route, /official-import|a16p_tx_execute_giapha4_official_import/i, "PATCH route must not touch official import");

for (const token of [
  "DuplicateDecisionDiagnosticCode",
  "DUPLICATE_DECISION_INVALID_VALUE",
  "DUPLICATE_DECISION_UNAUTHENTICATED",
  "DUPLICATE_DECISION_FORBIDDEN",
  "DUPLICATE_DECISION_SUPABASE_UNAVAILABLE",
  "DUPLICATE_DECISION_READ_RLS_DENIED",
  "DUPLICATE_DECISION_NOT_IN_SESSION",
  "DUPLICATE_DECISION_LINK_EXISTING_REQUIRES_EXISTING_PERSON",
  "DUPLICATE_DECISION_UPDATE_RLS_DENIED",
  "DUPLICATE_DECISION_UPDATE_NO_ROW_RETURNED",
  "DUPLICATE_DECISION_SAVED",
  "diagnosticCode",
  "getDuplicateDecisionReview(input.sessionId)",
  "review.candidates.find",
  "candidate.id === input.duplicateId",
  "ownerDecision === \"link_existing\"",
  "!existingRow.existingPersonId",
  ".from(\"import_duplicate_candidates\")",
  ".update({",
  "owner_decision: ownerDecision",
  "decided_by: context.profile.id",
  "decided_at: decidedAt",
  "decision_note: decisionNote",
  ".eq(\"id\", input.duplicateId)",
  ".eq(\"import_session_id\", input.sessionId)",
]) {
  requireIncludes(service, token, `service token ${token}`);
}
rejectPattern(service, /\.rpc\s*\(/i, "duplicate service must not call RPC");
rejectPattern(service, /\.from\(\s*["'](people|relationships|families|tree_layout|revisions|profiles)["']\s*\)[\s\S]{0,240}\.update\s*\(/i, "duplicate service must not update real genealogy tables");

for (const token of [
  "type SaveNotice",
  "setSaveNotice(null)",
  "tone: \"error\"",
  "tone: \"success\"",
  "Mã chẩn đoán",
  "diagnosticCode",
  "getVisibleDecisionOptions",
  "option.value !== \"link_existing\" || Boolean(candidate.existingPersonId)",
  "method: \"PATCH\"",
  "ownerDecision: draft.ownerDecision",
  "decisionNote: draft.decisionNote",
  "router.refresh",
]) {
  requireIncludes(client, token, `client token ${token}`);
}
rejectPattern(client, /useEffect\s*\([\s\S]{0,320}saveDecision/i, "client must not auto-save decisions");
rejectPattern(client, /setDrafts\s*\([\s\S]{0,240}(create_new|link_existing|ignore_candidate)[\s\S]{0,240}\)/i, "client must not auto choose a final duplicate decision");

for (const token of [
  "unresolvedDuplicateCandidates === 0",
  "needsReviewDuplicateCandidates === 0",
  "canProceedToOfficialImport: false",
]) {
  requireIncludes(reviewPack, token, `review pack gate token ${token}`);
}

for (const token of [
  "DuplicateDecisionReviewClient",
  "Xác nhận nhập chính thức — chưa mở",
  "disabled",
  "aria-disabled=\"true\"",
]) {
  requireIncludes(panel, token, `panel official import lock token ${token}`);
}

for (const token of [
  "canRunOfficialImport: false",
  "unresolvedDuplicateCandidates > 0",
  "needsReviewDuplicateCandidates > 0",
]) {
  requireIncludes(officialService, token, `official service lock token ${token}`);
}
rejectPattern(officialService, /\.rpc\s*\(/i, "official import service must not call RPC");

const scriptFiles = gitOutput(["ls-files", "scripts"])
  .split(/\r?\n/)
  .filter(Boolean)
  .filter((file) => !path.basename(file).startsWith("check-"));

for (const file of scriptFiles) {
  const content = readFile(file);
  rejectPattern(
    content,
    /\.rpc\s*\(\s*["']a16p_tx_execute_giapha4_official_import["']/i,
    `${file} must not call official import RPC`,
  );
  rejectPattern(
    content,
    /method\s*:\s*["']POST["'][\s\S]{0,240}official-import(?!-gate)/i,
    `${file} must not POST official import`,
  );
}

const allowedChangedFiles = new Set([
  docPath,
  checkerPath,
  packagePath,
  routePath,
  servicePath,
  clientPath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "scripts/check-a16q-dup-rls-verify-ui-write-pass.cjs",
]);

const changedFiles = gitOutput(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === ".env.local" || file.endsWith(".env.local")) {
    failures.push(".env.local must not be changed");
  }
  if (file.startsWith("db/migrations/") || file.startsWith("supabase/migrations/")) {
    failures.push(`migration must not change ${file}`);
  }
  if (file.startsWith("db/checks/")) {
    failures.push(`SQL check file must not change ${file}`);
  }
  if (file.startsWith("supabase/.temp/")) {
    failures.push(`supabase/.temp must not be changed ${file}`);
  }
  if (/\.(xls|xlsx|csv|png|jpg|jpeg|webp|zip|storageState\.json)$/i.test(file)) {
    failures.push(`real data/storage/screenshot file must not be changed ${file}`);
  }
}

for (const content of [doc, service, route, client]) {
  rejectPattern(content, /service_role|SUPABASE_SERVICE_ROLE|eyJ[A-Za-z0-9_-]{20,}\./, "secret-like token");
}

if (failures.length > 0) {
  console.error("A-16Q-DUP-SAVE-FIX checker failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16Q-DUP-SAVE-FIX checker PASS");
