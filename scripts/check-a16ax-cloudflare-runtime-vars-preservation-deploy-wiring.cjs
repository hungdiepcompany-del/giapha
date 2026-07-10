#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath =
  "docs/PLAN_A16AX_CLOUDFLARE_RUNTIME_VARS_PRESERVATION_DEPLOY_WIRING.md";
const checkerPath =
  "scripts/check-a16ax-cloudflare-runtime-vars-preservation-deploy-wiring.cjs";
const workflowPath = ".github/workflows/cloudflare-deploy.yml";
const packagePath = "package.json";
const routePath = "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const expectedDeployScript =
  "opennextjs-cloudflare build && opennextjs-cloudflare deploy -- --keep-vars";

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
const packageJson = readJson(packagePath);
const route = read(routePath);
const panel = read(panelPath);
const wrangler = read("wrangler.toml");
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const layout = read("app/layout.tsx");

for (const token of [
  "A-16AX - Cloudflare Runtime Vars Preservation Deploy Wiring",
  "A16AX_STATUS=PASS_DEPLOY_PATH_PRESERVES_CLOUDFLARE_RUNTIME_VARS_NOT_DEPLOYED",
  "A16AW_BLOCKER=GITHUB_ACTIONS_REPOSITORY_VARS_ARE_NOT_CLOUDFLARE_WORKER_RUNTIME_VARS_AND_DEPLOY_DOES_NOT_KEEP_DASHBOARD_RUNTIME_VARS",
  "A16AX_PREVIOUS_BLOCKER=A16AR_LOCKED_RUNTIME_CANDIDATE_ENV_DISABLED",
  "A16AX_PREVIOUS_BLOCKER_2=A16AR_LOCKED_EXECUTION_BRANCH_ENV_DISABLED",
  `A16AX_DEPLOY_SCRIPT=${expectedDeployScript}`,
  "A16AX_WORKFLOW_DEPLOY_STEP=run: npm run deploy",
  "A16AX_WORKFLOW_CHECK_STEP=npm run check:a16ax-cloudflare-runtime-vars-preservation-deploy-wiring",
  "A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED=true",
  "A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED=true",
  "A16AX_ROUTE_REQUIRES_A16P_TRUE=YES",
  "A16AX_ROUTE_REQUIRES_A16AH_TRUE=YES",
  "A16AX_UI_REQUIRES_A16P_TRUE=YES",
  "A16AX_UI_REQUIRES_A16AH_TRUE=YES",
  "A16AX_FAIL_CLOSED_DEFAULTS_PRESERVED=YES",
  "A16AX_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16AX_A16R_IMPORT_RETRY_EXECUTED=NO",
  "A16AX_DIRECT_MANUAL_RPC_CALLED=NO",
  "A16AX_SQL_RUN=NO",
  "A16AX_DB_MUTATION_RUN=NO",
  "A16AX_DEPLOY_RUN=NO",
  "A16AX_CLOUDFLARE_ENV_SECRET_CHANGED=NO",
  "A16AX_WRANGLER_TOML_CHANGED=NO",
  "A16AX_APP_LAYOUT_TSX_CHANGED=NO",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "Service boundary recommendation: `NONE_FOR_A16AX_DEPLOY_SCRIPT_ONLY`",
  "A16AX_NEXT_ACTION=OWNER_SET_CLOUDFLARE_WORKER_RUNTIME_VARS_THEN_RUN_MANUAL_GITHUB_ACTIONS_DEPLOY_AND_RERUN_A16AY_READ_ONLY_SMOKE_NO_POST",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

if (packageJson?.scripts?.deploy !== expectedDeployScript) {
  failures.push("deploy script must preserve dashboard runtime vars with --keep-vars");
}
if (
  packageJson?.scripts?.["check:a16ax-cloudflare-runtime-vars-preservation-deploy-wiring"] !==
  "node scripts/check-a16ax-cloudflare-runtime-vars-preservation-deploy-wiring.cjs"
) {
  failures.push("missing package script check:a16ax-cloudflare-runtime-vars-preservation-deploy-wiring");
}

for (const [content, token, label] of [
  [workflow, "workflow_dispatch:", "manual-only workflow_dispatch"],
  [workflow, "npm run check:a16ax-cloudflare-runtime-vars-preservation-deploy-wiring", "A-16AX workflow checker"],
  [workflow, "run: npm run deploy", "workflow deploy step uses package deploy script"],
  [route, "process.env.A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED === \"true\"", "route A16P strict gate"],
  [route, "process.env.A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED === \"true\"", "route A16AH strict gate"],
  [panel, "process.env.A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED === \"true\"", "panel A16P strict gate"],
  [panel, "process.env.A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED === \"true\"", "panel A16AH strict gate"],
  [index, "PLAN_A16AX_CLOUDFLARE_RUNTIME_VARS_PRESERVATION_DEPLOY_WIRING.md", "index entry"],
  [workLog, "A16AX_STATUS=PASS_DEPLOY_PATH_PRESERVES_CLOUDFLARE_RUNTIME_VARS_NOT_DEPLOYED", "work log status"],
  [decisionLog, "Decision 302 - A-16AX preserves Cloudflare dashboard runtime vars during manual deploy", "decision log entry"],
  [handoff, "A16AX_NEXT_ACTION=OWNER_SET_CLOUDFLARE_WORKER_RUNTIME_VARS_THEN_RUN_MANUAL_GITHUB_ACTIONS_DEPLOY_AND_RERUN_A16AY_READ_ONLY_SMOKE_NO_POST", "handoff next action"],
]) {
  requireIncludes(content, token, label);
}

rejectPattern(doc, /A16AX_POST_OFFICIAL_IMPORT_CALLED=YES/i, "POST must remain NO");
rejectPattern(doc, /A16AX_A16R_IMPORT_RETRY_EXECUTED=YES|A16R_IMPORT_RETRY_NEXT=YES/i, "A-16R retry must remain NO");
rejectPattern(doc, /A16AX_SQL_RUN=YES|A16AX_DB_MUTATION_RUN=YES|A16AX_DEPLOY_RUN=YES/i, "mutation/deploy must remain NO");
rejectPattern(doc + checker, /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i, "private email literal");
rejectPattern(doc + checker, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");
rejectPattern(wrangler, /A16AX|A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED|A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED/i, "wrangler config must not contain A-16 runtime vars");
rejectPattern(layout, /A16AX|official-import/i, "app layout must not change");

const deployIndex = workflow.indexOf("npm run deploy");
const checkerIndex = workflow.indexOf(
  "npm run check:a16ax-cloudflare-runtime-vars-preservation-deploy-wiring",
);
if (checkerIndex < 0 || deployIndex < 0 || checkerIndex > deployIndex) {
  failures.push("A-16AX checker must run before workflow deploy step");
}

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  checkerPath,
  packagePath,
  workflowPath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "scripts/check-a15e2-production-500-rollback-deploy-failure-diagnostics.cjs",
  "scripts/check-a16r-opennext-cloudflare-deploy-bundle-fix-candidate.cjs",
  "scripts/check-a16au-github-actions-runtime-env-flag-wiring.cjs",
  "scripts/check-a16aw-runtime-env-flag-propagation-diagnosis.cjs",
  "scripts/check-a16ah-official-import-runtime-execution-branch-candidate.cjs",
  "scripts/check-a16ar-owner-same-run-official-import-confirmation-ui-plumbing.cjs",
  "scripts/check-a16ae-runtime-official-import-enablement-candidate.cjs",
  "scripts/check-a16v-official-import-real-transaction-execution-branch.cjs",
  "docs/PLAN_A16AZ_OFFICIAL_IMPORT_POST_409_SESSION_STATE_DIAGNOSIS.md",
  "scripts/check-a16az-official-import-post-409-session-state-diagnosis.cjs",
  "docs/PLAN_A16BA_READ_ONLY_SESSION_STATE_RUNTIME_CONTRACT_FIX_PLAN.md",
  "scripts/check-a16ba-read-only-session-state-runtime-contract-fix-plan.cjs",
  "docs/PLAN_A16BB_SANITIZED_SESSION_STATE_RUNTIME_GATE_CANDIDATE.md",
  "scripts/check-a16bb-sanitized-session-state-runtime-gate-candidate.cjs",
  "scripts/verify-a16bb-sanitized-session-state.cjs",
  "lib/import/giapha4/official-import-session-state-gate.ts",
  "lib/import/giapha4/official-import-service.ts",
  "lib/import/giapha4/official-import-preflight-gate.ts",
  "components/imports/import-session-manifest-panel.tsx",
  "scripts/check-a16r-runtime-execution-enablement-gate.cjs",
  "scripts/check-a16v-apply-verify.cjs",
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
  console.error("A-16AX Cloudflare runtime vars preservation deploy wiring check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16AX Cloudflare runtime vars preservation deploy wiring check passed.");
