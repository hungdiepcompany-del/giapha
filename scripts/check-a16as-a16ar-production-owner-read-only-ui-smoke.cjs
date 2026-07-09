#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16AS_A16AR_PRODUCTION_OWNER_READ_ONLY_UI_SMOKE.md";
const checkerPath = "scripts/check-a16as-a16ar-production-owner-read-only-ui-smoke.cjs";
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
  "A-16AS - A-16AR Production Owner Read-only UI Smoke",
  "A16AS_STATUS=BLOCKED_AUTHENTICATED_CONTEXT_IMPORTS_CREATE_PERMISSION_MISSING",
  "A16AS_DEPLOY_MARKER=OWNER_CONFIRMED_A16AR_GITHUB_ACTIONS_DEPLOY_SUCCEEDED_FOR_COMMIT_9a11248",
  "A16AS_PRODUCTION_URL=https://web-gia-pha.hungdiepcompany.workers.dev",
  "A16AS_UI_PATH=/admin/exports/import",
  "A16AS_TARGET_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "A16AS_PRODUCTION_ROUTE_LOADED=YES",
  "A16AS_ADMIN_SHELL_VISIBLE=YES",
  "A16AS_AUTHENTICATED_CONTEXT_VISIBLE=YES",
  "A16AS_VISIBLE_PERMISSION_COUNT=0",
  "A16AS_IMPORTS_CREATE_PRESENT=NO",
  "A16AS_IMPORT_PANEL_VISIBLE=NO",
  "A16AS_A16R_BLOCK_VISIBLE=NO",
  "A16AS_AUDITED_SESSION_VISIBLE=NO",
  "A16AS_RUNTIME_MARKER_VISIBLE=NO",
  "A16AS_SESSION_MARKER_VISIBLE=NO",
  "A16AS_FINAL_CONFIRMATION_CHECKBOX_VISIBLE=NO",
  "A16AS_OFFICIAL_IMPORT_BUTTON_STATE=NOT_RENDERED",
  "A16AS_SANITIZED_UI_REASON=Bạn chưa có quyền imports.create.",
  "A16AS_BLOCKER=AUTHENTICATED_PRODUCTION_CONTEXT_PERMISSION_COUNT_0_IMPORTS_CREATE_MISSING",
  "A16AS_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16AS_A16R_IMPORT_RETRY_EXECUTED=NO",
  "A16AS_DIRECT_MANUAL_RPC_CALLED=NO",
  "A16AS_SQL_RUN=NO",
  "A16AS_DB_MUTATION_RUN=NO",
  "A16AS_MIGRATION_REPAIR_RUN=NO",
  "A16AS_SEED_RUN=NO",
  "A16AS_DEPLOY_RUN=NO",
  "A16AS_AUTH_ROLE_PERMISSION_MEMBERSHIP_MUTATION=NO",
  "A16AS_GENEALOGY_MUTATION=NO",
  "A16AS_RAW_JSON_COMMITTED=NO",
  "A16AS_PRIVATE_DATA_PRINTED=NO",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "A16AS_NEXT_ACTION=OWNER_REOPEN_PRODUCTION_ADMIN_IMPORT_ROUTE_WITH_TRUE_OWNER_ADMIN_IMPORT_CONTEXT_THEN_RERUN_READ_ONLY_UI_SMOKE_NO_POST",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A16AS_A16AR_PRODUCTION_OWNER_READ_ONLY_UI_SMOKE.md", "index entry"],
  [workLog, "A16AS_STATUS=BLOCKED_AUTHENTICATED_CONTEXT_IMPORTS_CREATE_PERMISSION_MISSING", "work log status"],
  [handoff, "A16AS_BLOCKER=AUTHENTICATED_PRODUCTION_CONTEXT_PERMISSION_COUNT_0_IMPORTS_CREATE_MISSING", "handoff blocker"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a16as-a16ar-production-owner-read-only-ui-smoke"] !==
  "node scripts/check-a16as-a16ar-production-owner-read-only-ui-smoke.cjs"
) {
  failures.push("missing package script check:a16as-a16ar-production-owner-read-only-ui-smoke");
}

rejectPattern(doc, /A16AS_POST_OFFICIAL_IMPORT_CALLED=YES/i, "POST must remain NO");
rejectPattern(doc, /A16AS_A16R_IMPORT_RETRY_EXECUTED=YES|A16R_IMPORT_RETRY_NEXT=YES/i, "A-16R retry must remain NO");
rejectPattern(doc, /A16AS_SQL_RUN=YES|A16AS_DB_MUTATION_RUN=YES|A16AS_DEPLOY_RUN=YES/i, "forbidden mutation/deploy status");
rejectPattern(doc + checker, /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i, "private email literal");
rejectPattern(doc + checker, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");
rejectPattern(wrangler, /A16AS|A16R_IMPORT_RETRY/i, "wrangler config must not change");
rejectPattern(layout, /A16AS|official-import/i, "app layout must not change");

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
  console.error("A-16AS A-16AR production owner read-only UI smoke check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16AS A-16AR production owner read-only UI smoke check passed.");
