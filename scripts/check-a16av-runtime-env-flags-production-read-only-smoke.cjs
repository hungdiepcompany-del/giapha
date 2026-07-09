#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16AV_RUNTIME_ENV_FLAGS_PRODUCTION_READ_ONLY_SMOKE.md";
const checkerPath = "scripts/check-a16av-runtime-env-flags-production-read-only-smoke.cjs";
const packagePath = "package.json";

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
const checker = read(checkerPath);
const packageJson = readJson(packagePath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const wrangler = read("wrangler.toml");
const layout = read("app/layout.tsx");

for (const token of [
  "A-16AV - Runtime Env Flags Production Read-only Smoke",
  "A16AV_STATUS=BLOCKED_AUTHENTICATED_CONTEXT_IMPORTS_CREATE_PERMISSION_MISSING",
  "A16AV_DEPLOY_MARKER=OWNER_CONFIRMED_A16AU_GITHUB_ACTIONS_DEPLOY_SUCCEEDED_FOR_COMMIT_ea9fe40",
  "A16AV_PRODUCTION_URL=https://web-gia-pha.hungdiepcompany.workers.dev",
  "A16AV_UI_PATH=/admin/exports/import",
  "A16AV_TARGET_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "A16AV_PRODUCTION_ROUTE_LOADED=YES",
  "A16AV_ADMIN_SHELL_VISIBLE=YES",
  "A16AV_AUTHENTICATED_CONTEXT_VISIBLE=YES",
  "A16AV_VISIBLE_PERMISSION_COUNT=0",
  "A16AV_IMPORTS_CREATE_PRESENT=NO",
  "A16AV_IMPORT_PANEL_VISIBLE=NO",
  "A16AV_A16R_BLOCK_VISIBLE=NO",
  "A16AV_AUDITED_SESSION_VISIBLE=NO",
  "A16AV_RUNTIME_MARKER_VISIBLE=NO",
  "A16AV_SESSION_MARKER_VISIBLE=NO",
  "A16AV_RUNTIME_CANDIDATE_ENV_ACTIVE=UNKNOWN_NOT_RENDERED",
  "A16AV_EXECUTION_BRANCH_ENV_ACTIVE=UNKNOWN_NOT_RENDERED",
  "A16AV_ENV_LOCK_REASONS_VISIBLE=UNKNOWN_NOT_RENDERED",
  "A16AV_SAME_RUN_PREFLIGHT_LOCK_VISIBLE=UNKNOWN_NOT_RENDERED",
  "A16AV_FINAL_CONFIRMATION_CHECKBOX_VISIBLE=NO",
  "A16AV_OFFICIAL_IMPORT_BUTTON_STATE=NOT_RENDERED",
  "A16AV_SANITIZED_UI_REASON=Báº¡n chÆ°a cÃ³ quyá»n imports.create.",
  "A16AV_BLOCKER=AUTHENTICATED_PRODUCTION_CONTEXT_PERMISSION_COUNT_0_IMPORTS_CREATE_MISSING",
  "A16AV_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16AV_A16R_IMPORT_RETRY_EXECUTED=NO",
  "A16AV_DIRECT_MANUAL_RPC_CALLED=NO",
  "A16AV_SQL_RUN=NO",
  "A16AV_DB_MUTATION_RUN=NO",
  "A16AV_MIGRATION_REPAIR_RUN=NO",
  "A16AV_SEED_RUN=NO",
  "A16AV_DEPLOY_RUN=NO",
  "A16AV_AUTH_ROLE_PERMISSION_MEMBERSHIP_MUTATION=NO",
  "A16AV_GENEALOGY_MUTATION=NO",
  "A16AV_RAW_JSON_COMMITTED=NO",
  "A16AV_PRIVATE_DATA_PRINTED=NO",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "A16AV_NEXT_ACTION=OWNER_REOPEN_PRODUCTION_ADMIN_IMPORT_ROUTE_WITH_TRUE_OWNER_ADMIN_IMPORT_CONTEXT_THEN_RERUN_A16AV_READ_ONLY_UI_SMOKE_NO_POST",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A16AV_RUNTIME_ENV_FLAGS_PRODUCTION_READ_ONLY_SMOKE.md", "index entry"],
  [workLog, "A16AV_STATUS=BLOCKED_AUTHENTICATED_CONTEXT_IMPORTS_CREATE_PERMISSION_MISSING", "work log status"],
  [handoff, "A16AV_BLOCKER=AUTHENTICATED_PRODUCTION_CONTEXT_PERMISSION_COUNT_0_IMPORTS_CREATE_MISSING", "handoff blocker"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a16av-runtime-env-flags-production-read-only-smoke"] !==
  "node scripts/check-a16av-runtime-env-flags-production-read-only-smoke.cjs"
) {
  failures.push("missing package script check:a16av-runtime-env-flags-production-read-only-smoke");
}

rejectPattern(doc, /A16AV_POST_OFFICIAL_IMPORT_CALLED=YES/i, "POST must remain NO");
rejectPattern(doc, /A16AV_A16R_IMPORT_RETRY_EXECUTED=YES|A16R_IMPORT_RETRY_NEXT=YES/i, "A-16R retry must remain NO");
rejectPattern(doc, /A16AV_SQL_RUN=YES|A16AV_DB_MUTATION_RUN=YES|A16AV_DEPLOY_RUN=YES/i, "mutation/deploy must remain NO");
rejectPattern(doc + checker, /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i, "private email literal");
rejectPattern(doc + checker, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");
rejectPattern(wrangler, /A16AV|A16R_IMPORT_RETRY/i, "wrangler config must not change");
rejectPattern(layout, /A16AV|official-import/i, "app layout must not change");

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
  "docs/99_NEXT_AI_HANDOFF.md",
  "scripts/check-a16ar-owner-same-run-official-import-confirmation-ui-plumbing.cjs",
  "scripts/check-a16as-a16ar-production-owner-read-only-ui-smoke.cjs",
  "scripts/check-a16at-production-runtime-execution-env-gate-readiness.cjs",
  "scripts/check-a16au-github-actions-runtime-env-flag-wiring.cjs",
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

if (failures.length > 0) {
  console.error("A-16AV runtime env flags production read-only smoke check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16AV runtime env flags production read-only smoke check passed.");
