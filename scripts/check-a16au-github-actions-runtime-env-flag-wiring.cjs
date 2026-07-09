#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16AU_GITHUB_ACTIONS_RUNTIME_ENV_FLAG_WIRING.md";
const checkerPath = "scripts/check-a16au-github-actions-runtime-env-flag-wiring.cjs";
const packagePath = "package.json";
const workflowPath = ".github/workflows/cloudflare-deploy.yml";
const routePath =
  "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";
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
const workflow = read(workflowPath);
const route = read(routePath);
const panel = read(panelPath);
const packageJson = readJson(packagePath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const wrangler = read("wrangler.toml");
const layout = read("app/layout.tsx");

for (const token of [
  "A-16AU - GitHub Actions Runtime Env Flag Wiring",
  "A16AU_STATUS=PASS_WORKFLOW_ENV_WIRING_READY_NOT_DEPLOYED",
  "A16AU_FLAG_1=A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED",
  "A16AU_FLAG_2=A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED",
  "A16AU_EXPECTED_ENABLED_VALUE=true",
  "A16AU_DEFAULT_WHEN_MISSING=false",
  "A16AU_FAIL_CLOSED_DEFAULT=YES",
  "A16AU_ROUTE_REQUIRES_A16P_TRUE=YES",
  "A16AU_ROUTE_REQUIRES_A16AH_TRUE=YES",
  "A16AU_UI_REQUIRES_A16P_TRUE=YES",
  "A16AU_UI_REQUIRES_A16AH_TRUE=YES",
  "A16AU_SERVER_SIDE_GATES_STILL_ENFORCED=YES",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "A16AU_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16AU_A16R_IMPORT_RETRY_EXECUTED=NO",
  "A16AU_DIRECT_MANUAL_RPC_CALLED=NO",
  "A16AU_SQL_RUN=NO",
  "A16AU_DB_MUTATION_RUN=NO",
  "A16AU_DEPLOY_RUN=NO",
  "A16AU_CLOUDFLARE_ENV_SECRET_CHANGED=NO",
  "A16AU_WRANGLER_TOML_CHANGED=NO",
  "A16AU_APP_LAYOUT_TSX_CHANGED=NO",
  "Main Worker touched: `NO`",
  "Runtime dependency added: `NO`",
  "OpenNext/Wrangler config changed: `NO`",
  "A16AU_NEXT_ACTION=OWNER_SET_GITHUB_ACTIONS_VARS_THEN_MANUAL_CLOUDFLARE_DEPLOY_AND_A16AV_READ_ONLY_UI_SMOKE_NO_POST",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [
    workflow,
    "A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED: ${{ vars.A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED || 'false' }}",
    "workflow A16P vars default false",
  ],
  [
    workflow,
    "A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED: ${{ vars.A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED || 'false' }}",
    "workflow A16AH vars default false",
  ],
  [
    workflow,
    "test -n \"${A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED}\"",
    "workflow verifies A16P value present",
  ],
  [
    workflow,
    "test -n \"${A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED}\"",
    "workflow verifies A16AH value present",
  ],
  [
    route,
    "process.env.A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED === \"true\"",
    "route A16P strict true",
  ],
  [
    route,
    "process.env.A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED === \"true\"",
    "route A16AH strict true",
  ],
  [
    panel,
    "process.env.A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED === \"true\"",
    "panel A16P strict true",
  ],
  [
    panel,
    "process.env.A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED === \"true\"",
    "panel A16AH strict true",
  ],
  [index, "PLAN_A16AU_GITHUB_ACTIONS_RUNTIME_ENV_FLAG_WIRING.md", "index entry"],
  [workLog, "A16AU_STATUS=PASS_WORKFLOW_ENV_WIRING_READY_NOT_DEPLOYED", "work log status"],
  [handoff, "A16AU_STATUS=PASS_WORKFLOW_ENV_WIRING_READY_NOT_DEPLOYED", "handoff status"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.[
    "check:a16au-github-actions-runtime-env-flag-wiring"
  ] !== "node scripts/check-a16au-github-actions-runtime-env-flag-wiring.cjs"
) {
  failures.push("missing package script check:a16au-github-actions-runtime-env-flag-wiring");
}

rejectPattern(doc, /A16AU_POST_OFFICIAL_IMPORT_CALLED=YES/i, "POST must remain NO");
rejectPattern(doc, /A16AU_A16R_IMPORT_RETRY_EXECUTED=YES|A16R_IMPORT_RETRY_NEXT=YES/i, "A-16R retry must remain NO");
rejectPattern(doc, /A16AU_SQL_RUN=YES|A16AU_DB_MUTATION_RUN=YES|A16AU_DEPLOY_RUN=YES/i, "mutation/deploy must remain NO");
rejectPattern(workflow, /A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED:\s*true/i, "workflow must not hardcode A16P true");
rejectPattern(workflow, /A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED:\s*true/i, "workflow must not hardcode A16AH true");
rejectPattern(doc + checker, /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i, "private email literal");
rejectPattern(doc + checker, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");
rejectPattern(wrangler, /A16AU|A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED|A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED/i, "wrangler config must not change");
rejectPattern(layout, /A16AU|official-import/i, "app layout must not change");

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  workflowPath,
  docPath,
  checkerPath,
  packagePath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "scripts/check-a16at-production-runtime-execution-env-gate-readiness.cjs",
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
  console.error("A-16AU GitHub Actions runtime env flag wiring check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16AU GitHub Actions runtime env flag wiring check passed.");
