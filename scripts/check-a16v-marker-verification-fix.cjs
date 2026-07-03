const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16V_MARKER_VERIFICATION_FIX.md";
const candidatePath =
  "db/migrations/20260703_0017_a16v_marker_verification_fix_candidate.sql";
const mirrorPath =
  "supabase/migrations/20260703_0017_a16v_marker_verification_fix_candidate.sql";
const verificationPath =
  "db/checks/20260703_check_a16v_official_import_real_transaction_execution_branch.sql";
const servicePath = "lib/import/giapha4/official-import-service.ts";
const routePath = "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";
const panelPath = "components/imports/import-session-manifest-panel.tsx";

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

function rejectPattern(content, pattern, label = String(pattern)) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
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

const doc = read(docPath);
const candidate = read(candidatePath);
const mirror = read(mirrorPath);
const verification = read(verificationPath);
const service = read(servicePath);
const route = read(routePath);
const panel = read(panelPath);
const packageJson = JSON.parse(read("package.json") || "{}");
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");

if (candidate && mirror && candidate !== mirror) {
  failures.push("0017 source and Supabase mirror differ");
}

for (const token of [
  "A16V_MARKER_VERIFICATION_FIX_STATUS=CANDIDATE_READY_NOT_APPLIED",
  "A16V_APPLY_VERIFY_STATUS=BLOCKED_A16V_MARKER_FAIL_PENDING_FIX",
  "A16V marker = FAIL",
  "Chosen fix: `COMMENT ON FUNCTION`",
  "20260703_0017_a16v_marker_verification_fix_candidate.sql",
  "obj_description(function_oid, 'pg_proc')",
  "did not run SQL",
  "did not call RPC",
  "did not POST `/official-import`",
  "canRunOfficialImport=false",
  "official import button disabled",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "A16V_MARKER_VERIFICATION_FIX_CANDIDATE",
  "SQL_CANDIDATE_STATUS=NOT_APPLIED",
  "DO_NOT_RUN_AUTOMATICALLY",
  "OWNER_MANUAL_REVIEW_REQUIRED",
  "COMMENT_ONLY_MARKER_FIX",
  "comment on function public.a16p_tx_execute_giapha4_official_import",
  "A16V_OFFICIAL_IMPORT_REAL_TRANSACTION_EXECUTION_BRANCH_CANDIDATE",
  "A16V_MARKER_VERIFICATION_FIX_CANDIDATE",
]) {
  requireIncludes(candidate, token, `candidate token ${token}`);
}

for (const token of [
  "SELECT_ONLY_VERIFICATION",
  "obj_description(p.oid, 'pg_proc') as function_comment",
  "coalesce(function_check.function_comment, '')",
  "DO_NOT_CALL_RPC",
  "DO_NOT_RUN_OFFICIAL_IMPORT",
]) {
  requireIncludes(verification, token, `verification token ${token}`);
}

for (const [label, content] of [
  [candidatePath, candidate],
  [verificationPath, verification],
]) {
  rejectPattern(content, /\bdrop\s+(table|function|schema|policy|trigger)\b/i, `${label} drop`);
  rejectPattern(content, /\btruncate\b/i, `${label} truncate`);
  rejectPattern(content, /\bdelete\s+from\b/i, `${label} delete`);
  rejectPattern(content, /\balter\s+table\b[\s\S]{0,120}\bdisable\s+row\s+level\s+security\b/i, `${label} disable RLS`);
  rejectPattern(content, /\bcreate\s+trigger\b/i, `${label} create trigger`);
  rejectPattern(content, /\bgrant\b[\s\S]{0,140}\b(anon|public)\b/i, `${label} anon/public grant`);
  rejectPattern(content, /\bperform\s+public\.a16p_tx_execute_giapha4_official_import\b/i, `${label} function call`);
  rejectPattern(content, /\bselect\s+public\.a16p_tx_execute_giapha4_official_import\b/i, `${label} function select call`);
}

rejectPattern(
  verification,
  /(^|\n)\s*(insert|update|delete|upsert|merge|truncate|alter|create|drop|grant|revoke)\b/i,
  "verification must remain SELECT-only",
);
rejectPattern(service + route, /\.rpc\s*\(/i, "runtime must not call RPC");
rejectPattern(route, /official-import[\s\S]{0,120}\.fetch\s*\(/i, "route must not POST official import");

requireIncludes(service, "canRunOfficialImport: false", "runtime canRunOfficialImport false");
requireIncludes(service, "A16V_REAL_TRANSACTION_BRANCH_NOT_APPLIED_OR_VERIFIED_BLOCKER", "runtime A-16V blocker");
requireIncludes(panel, "disabled", "official import button disabled");
requireIncludes(panel, "aria-disabled=\"true\"", "official import aria disabled");

if (
  packageJson.scripts?.["check:a16v-marker-verification-fix"] !==
  "node scripts/check-a16v-marker-verification-fix.cjs"
) {
  failures.push("missing package script check:a16v-marker-verification-fix");
}

for (const [content, token, label] of [
  [index, "PLAN_A16V_MARKER_VERIFICATION_FIX.md", "index A-16V marker fix entry"],
  [workLog, "A16V_MARKER_VERIFICATION_FIX_STATUS=CANDIDATE_READY_NOT_APPLIED", "work log marker fix status"],
  [decisionLog, "A-16V marker verification fix", "decision log marker fix"],
  [handoff, "A16V_MARKER_VERIFICATION_FIX_STATUS=CANDIDATE_READY_NOT_APPLIED", "handoff marker fix status"],
]) {
  requireIncludes(content, token, label);
}

rejectPattern(doc + candidate + verification + service + route, /SUPABASE_SERVICE_ROLE_KEY\s*=/i, "secret assignment");
rejectPattern(doc + candidate + verification + service + route, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");

const stagedFiles = git(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (["CHECK_CLOUDFLARE_ACCOUNT.bat", "GUARD.bat", "GIA_PHA_GITHUB_MENU.bat"].includes(file)) {
    failures.push(`forbidden staged outside-scope file ${file}`);
  }
  if (file === ".env.local" || file.endsWith(".env.local")) failures.push(".env.local must not be staged");
  if (file.startsWith("supabase/.temp/")) failures.push(`supabase temp staged ${file}`);
  if (/\.(xls|xlsx|csv)$/i.test(file)) failures.push(`data file staged ${file}`);
}

if (failures.length > 0) {
  console.error("A-16V marker verification fix check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16V marker verification fix check passed.");
