#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath =
  "docs/PLAN_A16AT_PRODUCTION_RUNTIME_EXECUTION_ENV_GATE_READINESS.md";
const checkerPath =
  "scripts/check-a16at-production-runtime-execution-env-gate-readiness.cjs";
const packagePath = "package.json";
const routePath =
  "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const servicePath = "lib/import/giapha4/official-import-service.ts";
const workflowPath = ".github/workflows/cloudflare-deploy.yml";

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
const route = read(routePath);
const panel = read(panelPath);
const service = read(servicePath);
const workflow = read(workflowPath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const wrangler = read("wrangler.toml");
const layout = read("app/layout.tsx");

for (const token of [
  "A-16AT - Production Runtime Execution Env Gate Readiness",
  "A16AT_STATUS=READY_RUNBOOK_ENV_GATE_BLOCKED_NO_IMPORT",
  "A16AT_OWNER_ADMIN_CONTEXT_PROVEN=YES_OWNER_PROVIDED_SANITIZED",
  "A16AT_OWNER_ROLE=OWNER",
  "A16AT_VISIBLE_PERMISSION_COUNT=25",
  "A16AT_IMPORTS_CREATE_PRESENT=YES",
  "A16AT_PERMISSIONS_MANAGE_PRESENT=YES",
  "A16AT_OWNER_ADMIN_IMPORT_CONTEXT=YES",
  "A16AT_PERMISSION_BLOCKER_RESOLVED=YES",
  "A16AT_TARGET_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "A16AT_CURRENT_BLOCKER=A16AR_LOCKED_RUNTIME_CANDIDATE_ENV_DISABLED",
  "A16AT_CURRENT_BLOCKER_2=A16AR_LOCKED_EXECUTION_BRANCH_ENV_DISABLED",
  "A16AT_CURRENT_BLOCKER_3=A16AR_LOCKED_SAME_RUN_PREFLIGHT_FALSE",
  "A16AT_BLOCKER_CLASSIFICATION=PRODUCTION_RUNTIME_EXECUTION_ENV_FLAGS_DISABLED",
  "A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED",
  "A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED",
  "A16AT_RUNTIME_MARKER_REQUIRED=APPROVE_A16R_RUNTIME_EXECUTION_AFTER_A16V_VERIFY",
  "A16AT_SESSION_MARKER_REQUIRED=APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "A16AT_STRICT_PERMISSION_SET_REQUIRED=imports.create,people.create,relationships.create,permissions.manage",
  "A16AT_SAME_RUN_PREFLIGHT_REQUIRED=canOpenOfficialImport:true,officialImportEnabled:true",
  "A16AT_WORKFLOW_ENV_CURRENTLY_PASSES_A16_FLAGS=NO",
  "A16AT_CLOUDFLARE_ENV_CHANGED=NO",
  "A16AT_GITHUB_ACTIONS_ENV_CHANGED=NO",
  "A16AT_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16AT_A16R_IMPORT_RETRY_EXECUTED=NO",
  "A16AT_DIRECT_MANUAL_RPC_CALLED=NO",
  "A16AT_SQL_RUN=NO",
  "A16AT_DB_MUTATION_RUN=NO",
  "A16AT_DEPLOY_RUN=NO",
  "A16AT_CLOUDFLARE_ENV_SECRET_CHANGED=NO",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "Main Worker touched: `NO`",
  "Runtime dependency added: `NO`",
  "OpenNext/Wrangler config changed: `NO`",
  "A16AT_NEXT_ACTION=OWNER_CONFIGURE_RUNTIME_ENV_FLAGS_OR_REQUEST_A16AU_GITHUB_ACTIONS_ENV_WIRING_THEN_REDEPLOY_AND_RERUN_READ_ONLY_SMOKE_NO_POST",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [
    route,
    "process.env.A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED === \"true\"",
    "route A16P true comparison",
  ],
  [
    route,
    "process.env.A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED === \"true\"",
    "route A16AH true comparison",
  ],
  [
    panel,
    "process.env.A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED === \"true\"",
    "panel A16P true comparison",
  ],
  [
    panel,
    "process.env.A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED === \"true\"",
    "panel A16AH true comparison",
  ],
  [
    service,
    "A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENV =\n  \"A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED\"",
    "service A16AH env const",
  ],
  [
    workflow,
    "NEXT_PUBLIC_APP_URL: ${{ vars.NEXT_PUBLIC_APP_URL }}",
    "current deploy workflow env block",
  ],
  [index, "PLAN_A16AT_PRODUCTION_RUNTIME_EXECUTION_ENV_GATE_READINESS.md", "index entry"],
  [workLog, "A16AT_STATUS=READY_RUNBOOK_ENV_GATE_BLOCKED_NO_IMPORT", "work log status"],
  [handoff, "A16AT_BLOCKER_CLASSIFICATION=PRODUCTION_RUNTIME_EXECUTION_ENV_FLAGS_DISABLED", "handoff blocker"],
]) {
  requireIncludes(content, token, label);
}

if (/A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED:\s*true/i.test(workflow)) {
  failures.push("workflow must not hardcode A16P env flag true");
}
if (/A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED:\s*true/i.test(workflow)) {
  failures.push("workflow must not hardcode A16AH env flag true");
}

if (
  packageJson?.scripts?.[
    "check:a16at-production-runtime-execution-env-gate-readiness"
  ] !==
  "node scripts/check-a16at-production-runtime-execution-env-gate-readiness.cjs"
) {
  failures.push(
    "missing package script check:a16at-production-runtime-execution-env-gate-readiness",
  );
}

rejectPattern(doc, /A16AT_POST_OFFICIAL_IMPORT_CALLED=YES/i, "POST must remain NO");
rejectPattern(doc, /A16AT_A16R_IMPORT_RETRY_EXECUTED=YES|A16R_IMPORT_RETRY_NEXT=YES/i, "A-16R retry must remain NO");
rejectPattern(doc, /A16AT_SQL_RUN=YES|A16AT_DB_MUTATION_RUN=YES|A16AT_DEPLOY_RUN=YES/i, "mutation/deploy must remain NO");
rejectPattern(doc, /hungdiepcompany@gmail\.com/i, "private account email must not be committed");
rejectPattern(doc + checker, /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i, "private email literal");
rejectPattern(doc + checker, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");
rejectPattern(wrangler, /A16AT|A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED|A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED/i, "wrangler config must not change");
rejectPattern(layout, /A16AT|official-import/i, "app layout must not change");

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  checkerPath,
  ".github/workflows/cloudflare-deploy.yml",
  "docs/PLAN_A16AU_GITHUB_ACTIONS_RUNTIME_ENV_FLAG_WIRING.md",
  "scripts/check-a16au-github-actions-runtime-env-flag-wiring.cjs",
  packagePath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "scripts/check-a16as-a16ar-production-owner-read-only-ui-smoke.cjs",
  "scripts/check-a16ar-owner-same-run-official-import-confirmation-ui-plumbing.cjs",
  "docs/PLAN_A16AV_RUNTIME_ENV_FLAGS_PRODUCTION_READ_ONLY_SMOKE.md",
  "scripts/check-a16av-runtime-env-flags-production-read-only-smoke.cjs",
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
  console.error("A-16AT production runtime execution env gate readiness check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16AT production runtime execution env gate readiness check passed.");
