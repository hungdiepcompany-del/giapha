#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16AF_RUNTIME_IMPORT_ENABLEMENT_CANDIDATE_PRODUCTION_SMOKE.md";
const checkerPath = "scripts/check-a16af-runtime-import-enablement-candidate-production-smoke.cjs";
const packagePath = "package.json";
const servicePath = "lib/import/giapha4/official-import-service.ts";
const routePath = "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";

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
const wrangler = read("wrangler.toml");
const layout = read("app/layout.tsx");

for (const token of [
  "A-16AF-RUNTIME-IMPORT-ENABLEMENT-CANDIDATE-PRODUCTION-SMOKE",
  "OWNER_CONFIRMED_A16AE_GITHUB_ACTIONS_DEPLOY_SUCCEEDED_FOR_COMMIT_5ddd7c0",
  "A16AF_PRODUCTION_SMOKE_STATUS=PASS_READ_ONLY_BLOCKED_SAFE",
  "A16AF_CAN_RUN_OFFICIAL_IMPORT_STATUS=NOT_ENABLED_BY_READ_ONLY_PRODUCTION_SMOKE",
  "A16AF_BLOCKER=RUNTIME_CANDIDATE_NOT_OBSERVABLE_OR_RUNNABLE_BY_SAFE_GET_OFFICIAL_IMPORT_ROUTE_GET_405_GATE_GET_401",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "A16AF_GET_ROOT_HTTP_STATUS=200",
  "A16AF_GET_AUTH_LOGIN_HTTP_STATUS=200",
  "A16AF_GET_ADMIN_EXPORTS_IMPORT_HTTP_STATUS=200",
  "A16AF_GET_OFFICIAL_IMPORT_GATE_HTTP_STATUS=401",
  "A16AF_GET_OFFICIAL_IMPORT_GATE_READ_ONLY=true",
  "A16AF_GET_OFFICIAL_IMPORT_GATE_CAN_OPEN_OFFICIAL_IMPORT=false",
  "A16AF_GET_OFFICIAL_IMPORT_GATE_OFFICIAL_IMPORT_ENABLED=false",
  "A16AF_GET_OFFICIAL_IMPORT_GATE_REVIEW_PACK_READINESS=NOT_READY",
  "A16AF_GET_OFFICIAL_IMPORT_GATE_NO_GO_REASONS_COUNT=4",
  "A16AF_GET_OFFICIAL_IMPORT_ROUTE_HTTP_STATUS=405",
  "A16AF_IMPORT_EXECUTION_ALLOWED=NO",
  "A16AF_FINAL_IMPORT_COMMAND_PRINTED=NO",
  "A16AF_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16AF_A16R_IMPORT_RETRY_RUN=NO",
  "A16AF_DIRECT_RPC_OFFICIAL_IMPORT_CALLED=NO",
  "A16AF_REAL_GENEALOGY_WRITE=NO",
  "A16AF_SQL_RUN=NO",
  "A16AF_DB_PUSH_RUN=NO",
  "A16AF_MIGRATION_REPAIR_RUN=NO",
  "A16AF_SEED_RUN=NO",
  "A16AF_DEPLOY_RUN=NO",
  "A16AF_WRANGLER_DEPLOY_RUN=NO",
  "A16AF_RAW_JSON_CONTENT_PRINTED=NO",
  "A16AF_RAW_JSON_COMMITTED=NO",
  "A16AF_WRANGLER_TOML_CHANGED=NO",
  "A16AF_APP_LAYOUT_TSX_CHANGED=NO",
  "Main Worker touched: `NO`",
  "Runtime dependency added: `NO`",
  "OpenNext/Wrangler config changed: `NO`",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A16AF_RUNTIME_IMPORT_ENABLEMENT_CANDIDATE_PRODUCTION_SMOKE.md", "index entry"],
  [workLog, "A16AF_PRODUCTION_SMOKE_STATUS=PASS_READ_ONLY_BLOCKED_SAFE", "work log status"],
  [decisionLog, "A-16AF production smoke keeps runtime import execution blocked after A-16AE deploy", "decision log entry"],
  [handoff, "A16AF_CAN_RUN_OFFICIAL_IMPORT_STATUS=NOT_ENABLED_BY_READ_ONLY_PRODUCTION_SMOKE", "handoff canRun status"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a16af-runtime-import-enablement-candidate-production-smoke"] !==
  "node scripts/check-a16af-runtime-import-enablement-candidate-production-smoke.cjs"
) {
  failures.push("missing package script check:a16af-runtime-import-enablement-candidate-production-smoke");
}

rejectPattern(doc, /A16R_IMPORT_RETRY_NEXT=YES/i, "A-16R retry must remain NO");
rejectPattern(doc, /A16AF_IMPORT_EXECUTION_ALLOWED=YES/i, "A-16AF must not allow execution");
rejectPattern(doc, /A16AF_POST_OFFICIAL_IMPORT_CALLED=YES/i, "A-16AF must not call official import");
rejectPattern(doc + index + workLog + decisionLog + handoff, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");
rejectPattern(wrangler, /A16AF|A16R_IMPORT_RETRY/i, "wrangler config changed for A-16AF");
rejectPattern(layout, /A16AF|official-import/i, "layout changed for A-16AF");

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
  "scripts/check-a16ac-import-retry-execution-final-gate.cjs",
  "scripts/check-a16ad-runtime-official-import-enablement-blocker-diagnosis.cjs",
  "scripts/check-a16ae-runtime-official-import-enablement-candidate.cjs",
  "scripts/check-a16r-fix-official-import-session-selection-mismatch.cjs",
  "scripts/check-a16r-runtime-execution-enablement-gate.cjs",
  "scripts/check-a16r-runtime-execution-enablement-owner-review.cjs",
  servicePath,
  routePath,
  "docs/PLAN_A16AH_OFFICIAL_IMPORT_RUNTIME_EXECUTION_BRANCH_CANDIDATE.md",
  "scripts/check-a16ah-official-import-runtime-execution-branch-candidate.cjs",
  "scripts/check-a16ag-a16r-official-import-retry-execution.cjs",
  "scripts/check-a16v-apply-verify.cjs",
  "scripts/check-a16t-apply-verify.cjs",
  "scripts/check-a16u-locked-runtime-wiring.cjs",
  "scripts/check-a16u-official-import-transaction-branch.cjs",
  "scripts/check-a16v-official-import-real-transaction-execution-branch.cjs",
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file.startsWith(".tmp/")) failures.push(`.tmp file must not be committed ${file}`);
  if (file !== packagePath && /\.(json|xlsx|xls|csv|zip)$/i.test(file)) {
    failures.push(`raw evidence/data file must not be committed ${file}`);
  }
  if (file === "wrangler.toml" || file === "app/layout.tsx") {
    failures.push(`forbidden file changed ${file}`);
  }
  if (/^(db\/migrations|supabase\/migrations|db\/checks)\//.test(file)) {
    failures.push(`forbidden SQL/check file ${file}`);
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
  /\bsupabase\s+db\s+push\b/i,
  /\.from\(\s*["'](people|relationships|families|family_parents|family_children|couple_relationships|tree_layouts?|revisions|profiles)["']\s*\)[\s\S]{0,240}\.(insert|update|delete|upsert)\s*\(/i,
]) {
  rejectPattern(changedPatch, pattern, `changed patch ${pattern}`);
}

if (failures.length > 0) {
  console.error("A-16AF runtime import enablement candidate production smoke check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16AF runtime import enablement candidate production smoke check passed.");
