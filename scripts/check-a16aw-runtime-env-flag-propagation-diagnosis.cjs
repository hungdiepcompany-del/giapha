#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16AW_RUNTIME_ENV_FLAG_PROPAGATION_DIAGNOSIS.md";
const checkerPath = "scripts/check-a16aw-runtime-env-flag-propagation-diagnosis.cjs";
const packagePath = "package.json";
const workflowPath = ".github/workflows/cloudflare-deploy.yml";
const wranglerPath = "wrangler.toml";
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
const workflow = read(workflowPath);
const wrangler = read(wranglerPath);
const route = read(routePath);
const panel = read(panelPath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const layout = read("app/layout.tsx");

for (const token of [
  "A-16AW - Runtime Env Flag Propagation Diagnosis",
  "A16AW_STATUS=DIAGNOSED_RUNTIME_ENV_PROPAGATION_BLOCKED_NO_IMPORT",
  "A16AW_OWNER_ADMIN_CONTEXT=YES_OWNER_PROVIDED_SANITIZED",
  "A16AW_OWNER_ROLE=OWNER",
  "A16AW_VISIBLE_PERMISSION_COUNT=25",
  "A16AW_IMPORTS_CREATE_PRESENT=YES",
  "A16AW_PERMISSIONS_MANAGE_PRESENT=YES",
  "A16AW_TARGET_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "A16AW_CURRENT_BLOCKER=A16AR_LOCKED_RUNTIME_CANDIDATE_ENV_DISABLED",
  "A16AW_CURRENT_BLOCKER_2=A16AR_LOCKED_EXECUTION_BRANCH_ENV_DISABLED",
  "A16AW_CURRENT_BLOCKER_3=A16AR_LOCKED_SAME_RUN_PREFLIGHT_FALSE",
  "A16AW_BLOCKER=GITHUB_ACTIONS_REPOSITORY_VARS_ARE_NOT_CLOUDFLARE_WORKER_RUNTIME_VARS_AND_DEPLOY_DOES_NOT_KEEP_DASHBOARD_RUNTIME_VARS",
  "A16AW_WORKFLOW_JOB_ENV_WIRED=YES",
  "A16AW_WRANGLER_VARS_PRESENT=NO",
  "A16AW_DEPLOY_COMMAND_USES_KEEP_VARS=NO",
  "A16AW_CLOUDFLARE_DASHBOARD_RUNTIME_VARS_VERIFIED=NO_NOT_READ_OR_MUTATED",
  "A16AW_PRODUCTION_RUNTIME_FLAGS_ACTIVE=NO_OWNER_UI_EVIDENCE",
  "A16AW_ROUTE_REQUIRES_A16P_TRUE=YES",
  "A16AW_ROUTE_REQUIRES_A16AH_TRUE=YES",
  "A16AW_UI_REQUIRES_A16P_TRUE=YES",
  "A16AW_UI_REQUIRES_A16AH_TRUE=YES",
  "opennextjs-cloudflare deploy -- --keep-vars",
  "A16AW_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16AW_A16R_IMPORT_RETRY_EXECUTED=NO",
  "A16AW_DIRECT_MANUAL_RPC_CALLED=NO",
  "A16AW_SQL_RUN=NO",
  "A16AW_DB_MUTATION_RUN=NO",
  "A16AW_DEPLOY_RUN=NO",
  "A16AW_CLOUDFLARE_ENV_SECRET_CHANGED=NO",
  "A16AW_WRANGLER_TOML_CHANGED=NO",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "Service boundary recommendation: `NONE_FOR_A16AW_DIAGNOSIS_ONLY`",
  "A16AW_NEXT_ACTION=A16AX_WIRE_DEPLOY_KEEP_VARS_OR_OWNER_SET_CLOUDFLARE_WORKER_RUNTIME_VARS_THEN_REDEPLOY_AND_RERUN_READ_ONLY_SMOKE_NO_POST",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [workflow, "A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED: ${{ vars.A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED || 'false' }}", "workflow A16P job env"],
  [workflow, "A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED: ${{ vars.A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED || 'false' }}", "workflow A16AH job env"],
  [route, "process.env.A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED === \"true\"", "route A16P strict gate"],
  [route, "process.env.A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED === \"true\"", "route A16AH strict gate"],
  [panel, "process.env.A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED === \"true\"", "panel A16P strict gate"],
  [panel, "process.env.A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED === \"true\"", "panel A16AH strict gate"],
  [index, "PLAN_A16AW_RUNTIME_ENV_FLAG_PROPAGATION_DIAGNOSIS.md", "index entry"],
  [workLog, "A16AW_STATUS=DIAGNOSED_RUNTIME_ENV_PROPAGATION_BLOCKED_NO_IMPORT", "work log status"],
  [handoff, "A16AW_BLOCKER=GITHUB_ACTIONS_REPOSITORY_VARS_ARE_NOT_CLOUDFLARE_WORKER_RUNTIME_VARS_AND_DEPLOY_DOES_NOT_KEEP_DASHBOARD_RUNTIME_VARS", "handoff blocker"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a16aw-runtime-env-flag-propagation-diagnosis"] !==
  "node scripts/check-a16aw-runtime-env-flag-propagation-diagnosis.cjs"
) {
  failures.push("missing package script check:a16aw-runtime-env-flag-propagation-diagnosis");
}

if (/\[vars\]|A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED|A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED/i.test(wrangler)) {
  failures.push("wrangler.toml must not contain A-16 runtime vars in A-16AW");
}
rejectPattern(doc, /A16AW_POST_OFFICIAL_IMPORT_CALLED=YES/i, "POST must remain NO");
rejectPattern(doc, /A16AW_A16R_IMPORT_RETRY_EXECUTED=YES|A16R_IMPORT_RETRY_NEXT=YES/i, "A-16R retry must remain NO");
rejectPattern(doc, /A16AW_SQL_RUN=YES|A16AW_DB_MUTATION_RUN=YES|A16AW_DEPLOY_RUN=YES/i, "mutation/deploy must remain NO");
rejectPattern(doc + checker, /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i, "private email literal");
rejectPattern(doc + checker, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");
rejectPattern(layout, /A16AW|official-import/i, "app layout must not change");

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
  "scripts/check-a16av-runtime-env-flags-production-read-only-smoke.cjs",
  "docs/PLAN_A16AX_CLOUDFLARE_RUNTIME_VARS_PRESERVATION_DEPLOY_WIRING.md",
  "scripts/check-a16ax-cloudflare-runtime-vars-preservation-deploy-wiring.cjs",
  ".github/workflows/cloudflare-deploy.yml",
  "docs/09_DECISION_LOG.md",
  "scripts/check-a15e2-production-500-rollback-deploy-failure-diagnostics.cjs",
  "scripts/check-a16r-opennext-cloudflare-deploy-bundle-fix-candidate.cjs",
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
  console.error("A-16AW runtime env flag propagation diagnosis check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16AW runtime env flag propagation diagnosis check passed.");
