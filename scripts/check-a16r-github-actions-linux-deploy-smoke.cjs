const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16R_GITHUB_ACTIONS_LINUX_DEPLOY_SMOKE.md";
const packagePath = "package.json";
const workflowPath = ".github/workflows/cloudflare-deploy.yml";
const wranglerPath = "wrangler.toml";

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
const workflow = read(workflowPath);
const wrangler = read(wranglerPath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16R-GITHUB-ACTIONS-LINUX-DEPLOY-SMOKE",
  "A16R_GITHUB_ACTIONS_LINUX_DEPLOY_SMOKE_STATUS=PASS_DEPLOYED_SMOKE_GET_ONLY_IMPORT_LOCKED",
  "A16R_GITHUB_ACTIONS_LINUX_DEPLOY_PREFLIGHT_STATUS=PASS",
  "A16R_GITHUB_ACTIONS_LINUX_DEPLOY_VALIDATION_STATUS=PASS_REPO_LOCAL_BUILD",
  "A16R_GITHUB_ACTIONS_LINUX_DEPLOY_PATH=MANUAL_GITHUB_ACTIONS_LINUX_FROM_CLEAN_ORIGIN_MAIN",
  "A16R_GITHUB_ACTIONS_LINUX_DEPLOY_RESULT=PASS",
  "A16R_GITHUB_ACTIONS_LINUX_PRODUCTION_SMOKE_RESULT=PASS_REQUIRED_GET_ROUTES_NO_500",
  "A16R_GITHUB_ACTIONS_LINUX_ROLLBACK_RESULT=NOT_RUN_NO_PRODUCTION_BREAKING_500",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "REMOTE_REPO_SLUG_MATCH=YES_SSH_ALIAS_ACCEPTED",
  "WORKING_TREE_CLEAN=YES",
  "cee98384e7df6b6fc3c6703c1ff523b844d89254",
  "A16R_GITHUB_ACTIONS_LINUX_DEPLOY_BUILD_CAVEAT=NONE_REPO_LOCAL_BUILD_PASS",
  "Cloudflare Deploy",
  ".github/workflows/cloudflare-deploy.yml",
  "workflow_dispatch",
  "ubuntu-latest",
  "npm ci",
  "npm run deploy",
  "28656644567",
  "84987243856",
  "https://github.com/hungdiepcompany-del/giapha/actions/runs/28656644567",
  "A16R_GITHUB_ACTIONS_LINUX_WORKFLOW_RESULT=SUCCESS",
  "Deploy to Cloudflare: success",
  "web-gia-pha",
  "hungdiepcompany@gmail.com",
  "77fc3067-b197-4bce-8a36-eb2bde6bacc8",
  "d158869a-3d32-4697-8ad8-815a64526b36",
  "4e7841b6-62ca-4b71-a46c-ccc21ad6cefc",
  "2026-07-03T11:10:25.249Z",
  "100%",
  "UNKNOWN_CLOUDFLARE_METADATA_BUT_TRIGGERED_BY_GITHUB_ACTIONS_RUN_28656644567",
  "/`: `200`, body length `20799`",
  "/tree`: `200`, body length `18765`",
  "/auth/login`: `200`, body length `12180`",
  "/admin/exports/import`: `200`, body length `19173`",
  "official-import-gate`:\n  `401`, body length `1282`",
  "A16R_GITHUB_ACTIONS_LINUX_PRODUCTION_PUBLIC_ROUTES_STATUS=PASS_GET_200",
  "A16R_GITHUB_ACTIONS_LINUX_OFFICIAL_IMPORT_GATE_GET_STATUS=PASS_GUARDED_401",
  "A16R_GITHUB_ACTIONS_LINUX_PRODUCTION_500_OBSERVED=NO",
  "A16R_GITHUB_ACTIONS_LINUX_ROLLBACK_REQUIRED=NO",
  "`gate.readOnly`: `true`",
  "`gate.canOpenOfficialImport`: `false`",
  "`gate.officialImportEnabled`: `false`",
  "APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_<SESSION_ID>",
  "`gate.reviewPackReadiness`: `NOT_READY`",
  "A16R_GITHUB_ACTIONS_LINUX_RUNTIME_ENABLEMENT_MARKER_RECOGNIZED=GET_GATE_GUARDED_LOCKED",
  "A16R_GITHUB_ACTIONS_LINUX_PRODUCTION_CAN_RUN_OFFICIAL_IMPORT=false",
  "A16R_GITHUB_ACTIONS_LINUX_IMPORT_GATE_REMAINS_FAIL_CLOSED=YES",
  "A16R_IMPORT_MAY_BE_RETRIED_NEXT=NO",
  "A16R_IMPORT_RETRY_BLOCKER=OFFICIAL_IMPORT_GATE_REMAINS_LOCKED_AND_REQUIRES_SESSION_SPECIFIC_APPROVAL",
  "A16R_GITHUB_ACTIONS_LINUX_ROLLBACK_COMMAND_RUN=NO",
  "A16R_GITHUB_ACTIONS_LINUX_WINDOWS_LOCAL_DEPLOY_RUN=NO",
  "A16R_GITHUB_ACTIONS_LINUX_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16R_GITHUB_ACTIONS_LINUX_DIRECT_RPC_CALLED=NO",
  "A16R_GITHUB_ACTIONS_LINUX_REAL_GENEALOGY_WRITE=NO",
  "A16R_GITHUB_ACTIONS_LINUX_SQL_RUN=NO",
  "A16R_GITHUB_ACTIONS_LINUX_DB_PUSH_RUN=NO",
  "A16R_GITHUB_ACTIONS_LINUX_MIGRATION_REPAIR_RUN=NO",
  "A16R_GITHUB_ACTIONS_LINUX_SEED_RUN=NO",
  "A16R_GITHUB_ACTIONS_LINUX_CAN_RUN_OFFICIAL_IMPORT_BYPASSED=NO",
  "A16R_GITHUB_ACTIONS_LINUX_SESSION_RUN_MARKER_USED_TO_EXECUTE_IMPORT=NO",
  "A16R_GITHUB_ACTIONS_LINUX_FAIL_CLOSED_GUARDS_WEAKENED=NO",
  "A16R_GITHUB_ACTIONS_LINUX_WRANGLER_TOML_CHANGED=NO",
  "No POST `/official-import`.",
  "No direct RPC call.",
  "No real genealogy data write.",
  "No SQL, Supabase DB push, migration repair or seed.",
  "No Windows-local deploy path.",
  "Main Worker source touched: NO",
  "Runtime dependency added: NO",
  "New service Worker created: NO",
  "OpenNext/Wrangler config changed: NO",
  "A16R_GITHUB_ACTIONS_LINUX_NEXT_GATE=SEPARATE_OFFICIAL_IMPORT_EXECUTION_APPROVAL_GATE_REQUIRED",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

requireIncludes(workflow, "workflow_dispatch:", "manual workflow trigger");
requireIncludes(workflow, "runs-on: ubuntu-latest", "Linux runner");
requireIncludes(workflow, "run: npm ci", "clean install");
requireIncludes(workflow, "run: npm run deploy", "workflow deploy command");
requireIncludes(wrangler, 'name = "web-gia-pha"', "wrangler worker name");

if (/\b(push|pull_request|schedule):/i.test(workflow)) {
  failures.push("Cloudflare deploy workflow must remain manual-only");
}

if (
  packageJson?.scripts?.["check:a16r-github-actions-linux-deploy-smoke"] !==
  "node scripts/check-a16r-github-actions-linux-deploy-smoke.cjs"
) {
  failures.push("missing package script check:a16r-github-actions-linux-deploy-smoke");
}

for (const [content, token, label] of [
  [index, "PLAN_A16R_GITHUB_ACTIONS_LINUX_DEPLOY_SMOKE.md", "index GitHub Actions deploy smoke entry"],
  [
    workLog,
    "A16R_GITHUB_ACTIONS_LINUX_DEPLOY_SMOKE_STATUS=PASS_DEPLOYED_SMOKE_GET_ONLY_IMPORT_LOCKED",
    "work log GitHub Actions deploy smoke status",
  ],
  [
    decisionLog,
    "A-16R GitHub Actions Linux deploy smoke passes while official import remains locked",
    "decision log GitHub Actions deploy smoke decision",
  ],
  [
    handoff,
    "A16R_GITHUB_ACTIONS_LINUX_DEPLOY_SMOKE_STATUS=PASS_DEPLOYED_SMOKE_GET_ONLY_IMPORT_LOCKED",
    "handoff GitHub Actions deploy smoke status",
  ],
]) {
  requireIncludes(content, token, label);
}

rejectPattern(doc, /\.rpc\s*\(/i, "doc must not call RPC");
rejectPattern(doc, /fetch\s*\([\s\S]{0,240}\/official-import/i, "doc must not call official import");
rejectPattern(doc, /canRunOfficialImport:\s*true/, "doc must not open canRunOfficialImport");
rejectPattern(doc, /SUPABASE_SERVICE_ROLE_KEY\s*=/i, "secret assignment");
rejectPattern(doc, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  packagePath,
  "scripts/check-a16r-github-actions-linux-deploy-smoke.cjs",
  "docs/PLAN_A16R_OFFICIAL_IMPORT_GATE_READINESS_DIAGNOSIS.md",
  "scripts/check-a16r-official-import-gate-readiness-diagnosis.cjs",
  "docs/PLAN_A16R_AUTHENTICATED_OFFICIAL_IMPORT_GATE_SMOKE.md",
  "scripts/check-a16r-authenticated-official-import-gate-smoke.cjs",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "scripts/check-a16r-post-deploy-http500-root-cause.cjs",
  "scripts/check-a16r-giapha-correct-account-deploy-smoke.cjs",
  "scripts/check-a16r-opennext-cloudflare-deploy-bundle-fix-candidate.cjs",
  "scripts/check-a16r-giapha-cloudflare-account-verify-deploy-smoke.cjs",
  "scripts/check-a16r-giapha-cloudflare-account-recovery.cjs",
  "scripts/check-a16r-runtime-execution-enablement-push-deploy-smoke.cjs",
  "scripts/check-a16r-runtime-execution-enablement-gate.cjs",
  "scripts/check-a16r-runtime-execution-enablement-owner-review.cjs",
  "scripts/check-a16t-apply-verify.cjs",
  "scripts/check-a16t-grant-rls-hardening-fix.cjs",
  "scripts/check-a16u-official-import-transaction-branch.cjs",
  "scripts/check-a16u-locked-runtime-wiring.cjs",
  "scripts/check-a16u-verify-runbook.cjs",
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === ".env.local" || file.endsWith(".env.local")) failures.push(`forbidden env file ${file}`);
  if (file.startsWith("supabase/.temp/")) failures.push(`forbidden supabase temp ${file}`);
  if (/\.(xls|xlsx|csv)$/i.test(file)) failures.push(`forbidden spreadsheet/csv ${file}`);
  if (/^(db\/migrations|supabase\/migrations|db\/checks)\//.test(file)) {
    failures.push(`forbidden SQL/check file ${file}`);
  }
  if (
    file === wranglerPath ||
    file === "open-next.config.ts" ||
    file === "next.config.ts" ||
    file.startsWith(".github/workflows/") ||
    file.startsWith("app/") ||
    file.startsWith("lib/") ||
    file.startsWith("components/")
  ) {
    failures.push(`runtime/config/deploy file must not change in this phase ${file}`);
  }
}

const stagedFiles = git(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected staged file ${file}`);
}

if (failures.length > 0) {
  console.error("A-16R GitHub Actions Linux deploy smoke check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16R GitHub Actions Linux deploy smoke check passed.");
