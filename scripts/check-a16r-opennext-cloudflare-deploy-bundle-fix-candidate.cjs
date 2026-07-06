const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_FIX_CANDIDATE.md";
const rootCauseDocPath = "docs/PLAN_A16R_POST_DEPLOY_HTTP500_ROOT_CAUSE.md";
const correctAccountDocPath = "docs/PLAN_A16R_GIAPHA_CORRECT_ACCOUNT_DEPLOY_SMOKE.md";
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
const rootCauseDoc = read(rootCauseDocPath);
const correctAccountDoc = read(correctAccountDocPath);
const packageJson = readJson(packagePath);
const wrangler = read("wrangler.toml");
const openNextConfig = read("open-next.config.ts");
const nextConfig = read("next.config.ts");
const workflow = read(".github/workflows/cloudflare-deploy.yml");
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16R-OPENNEXT-CLOUDFLARE-DEPLOY-BUNDLE-FIX-CANDIDATE",
  "A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_FIX_CANDIDATE_STATUS=FIX_CANDIDATE_READY_DOCS_ONLY",
  "A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_FIX_CANDIDATE_CLASSIFICATION=USE_MANUAL_GITHUB_ACTIONS_LINUX_DEPLOY_PATH",
  rootCauseDocPath,
  correctAccountDocPath,
  "d158869a-3d32-4697-8ad8-815a64526b36",
  "77fc3067-b197-4bce-8a36-eb2bde6bacc8",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "REMOTE_REPO_SLUG_MATCH=YES_SSH_ALIAS_ACCEPTED",
  "WORKING_TREE_CLEAN=YES",
  "3cc224cb65757066b1bf48de7d2af49ca2f598ee",
  "REPO_LOCAL_WINDOWS_NEXT_ACL_CAVEAT=EPERM_UNLINK_DOT_NEXT_BUILD_56416d4ae4ce586f_JS",
  ".next/build/56416d4ae4ce586f.js",
  "OPENNEXT_WINDOWS_COMPATIBILITY_WARNING_OBSERVED=YES",
  "A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_SAFE_PATH=MANUAL_GITHUB_ACTIONS_LINUX_DEPLOY_FROM_CLEAN_CHECKOUT",
  "A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_LOCAL_BUILD_FALLBACK=CLEAN_TEMP_MIRROR_BUILD_ONLY_NOT_PREFERRED_DEPLOY",
  "A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_WRANGLER_TOML_CHANGE_REQUIRED=NO",
  "A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_OPENNEXT_CONFIG_CHANGE_REQUIRED=NO",
  "A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_NEXT_CONFIG_CHANGE_REQUIRED=NO",
  "A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_DEPLOY_SCRIPT_CHANGE_REQUIRED=NO",
  "A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_PACKAGE_SCRIPT_CHANGE_REQUIRED=YES_CHECKER_ONLY",
  "A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_HELPER_SCRIPT_ADDED=NO",
  "A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_WORKFLOW_CHANGE_REQUIRED=NO",
  "A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_DEPLOY_RUN=NO",
  "A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_DIRECT_RPC_CALLED=NO",
  "A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_REAL_GENEALOGY_WRITE=NO",
  "A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_SQL_RUN=NO",
  "A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_DB_PUSH_RUN=NO",
  "A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_MIGRATION_REPAIR_RUN=NO",
  "A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_SEED_RUN=NO",
  "A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_PRODUCTION_DATA_CHANGED=NO",
  "A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_RUNTIME_GUARDS_WEAKENED=NO",
  "A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_WRANGLER_TOML_CHANGED=NO",
  "No POST `/official-import`.",
  "No direct RPC call.",
  "No real genealogy data write.",
  "No SQL, Supabase DB push, migration repair or seed.",
  "No Cloudflare deploy.",
  "Main Worker source touched: NO",
  "Runtime dependency added: NO",
  "New service Worker created: NO",
  "OpenNext/Wrangler config changed: NO",
  "NONE_FOR_THIS_PHASE_USE_MANUAL_GITHUB_ACTIONS_LINUX_DEPLOY_RETRY_PHASE",
  "A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_NEXT_GATE=SEPARATE_MANUAL_GITHUB_ACTIONS_LINUX_DEPLOY_SMOKE_WITH_ROLLBACK_READY",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "A16R_POST_DEPLOY_HTTP500_ROOT_CAUSE_CLASSIFICATION=OPENNEXT_CLOUDFLARE_INCOMPATIBILITY",
  "A16R_POST_DEPLOY_HTTP500_ROOT_CAUSE_SUBTYPE=WINDOWS_LOCAL_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_INCOMPATIBILITY",
  "A16R_POST_DEPLOY_HTTP500_ROOT_CAUSE_CONFIDENCE=LIKELY_NOT_PROVEN_BY_FAILED_VERSION_STACKTRACE",
]) {
  requireIncludes(rootCauseDoc, token, `root cause token ${token}`);
}

for (const token of [
  "A16R_GIAPHA_CORRECT_ACCOUNT_DEPLOY_SMOKE_STATUS=DEPLOYED_SMOKE_FAILED_ROLLED_BACK",
  "PRODUCTION_POST_DEPLOY_SMOKE_RESULT=FAILED_500_ALL_REQUIRED_GET_ROUTES",
  "BUILD_STATUS=PASS_CLEAN_MIRROR_SOURCE_BUILD_CHECKOUT_ARTIFACT_ACL_BLOCKED",
]) {
  requireIncludes(correctAccountDoc, token, `correct account token ${token}`);
}

requireIncludes(wrangler, 'name = "web-gia-pha"', "wrangler worker name");
requireIncludes(wrangler, 'main = ".open-next/worker.js"', "wrangler OpenNext worker entry");
requireIncludes(wrangler, 'directory = ".open-next/assets"', "wrangler OpenNext assets");
requireIncludes(openNextConfig, "defineCloudflareConfig", "OpenNext config");
requireIncludes(nextConfig, "NextConfig", "Next config");
requireIncludes(workflow, "workflow_dispatch:", "manual workflow trigger");
requireIncludes(workflow, "runs-on: ubuntu-latest", "Linux runner");
requireIncludes(workflow, "run: npm ci", "clean install");
requireIncludes(workflow, "run: npm run deploy", "workflow deploy command");

if (/\b(push|pull_request|schedule):/i.test(workflow)) {
  failures.push("Cloudflare deploy workflow must remain manual-only");
}

if (
  packageJson?.scripts?.["check:a16r-opennext-cloudflare-deploy-bundle-fix-candidate"] !==
  "node scripts/check-a16r-opennext-cloudflare-deploy-bundle-fix-candidate.cjs"
) {
  failures.push("missing package script check:a16r-opennext-cloudflare-deploy-bundle-fix-candidate");
}

if (packageJson?.scripts?.deploy !== "opennextjs-cloudflare build && opennextjs-cloudflare deploy") {
  failures.push("deploy script must remain unchanged in this docs/checker phase");
}

if (packageJson?.scripts?.upload !== "opennextjs-cloudflare build && opennextjs-cloudflare upload") {
  failures.push("upload script must remain unchanged in this docs/checker phase");
}

for (const [content, token, label] of [
  [index, "PLAN_A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_FIX_CANDIDATE.md", "index fix candidate entry"],
  [
    workLog,
    "A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_FIX_CANDIDATE_STATUS=FIX_CANDIDATE_READY_DOCS_ONLY",
    "work log fix candidate status",
  ],
  [
    decisionLog,
    "A-16R OpenNext deploy bundle fix candidate uses manual GitHub Actions Linux deploy",
    "decision log fix candidate decision",
  ],
  [
    handoff,
    "A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_FIX_CANDIDATE_STATUS=FIX_CANDIDATE_READY_DOCS_ONLY",
    "handoff fix candidate status",
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
  "scripts/check-a16r-opennext-cloudflare-deploy-bundle-fix-candidate.cjs",
  "docs/PLAN_A16R_GITHUB_ACTIONS_LINUX_DEPLOY_SMOKE.md",
  "scripts/check-a16r-github-actions-linux-deploy-smoke.cjs",
  "docs/PLAN_A16R_OFFICIAL_IMPORT_GATE_READINESS_DIAGNOSIS.md",
  "scripts/check-a16r-official-import-gate-readiness-diagnosis.cjs",
  "docs/PLAN_A16R_AUTHENTICATED_OFFICIAL_IMPORT_GATE_SMOKE.md",
  "scripts/check-a16r-authenticated-official-import-gate-smoke.cjs",
  "docs/PLAN_A16R_AUTHENTICATED_OWNER_IMPORT_GATE_SMOKE_RETRY.md",
  "scripts/check-a16r-authenticated-owner-import-gate-smoke-retry.cjs",
  "docs/PLAN_A16R_OWNER_ADMIN_IMPORT_PERMISSION_DIAGNOSIS.md",
  "scripts/check-a16r-owner-admin-import-permission-diagnosis.cjs",
  "docs/PLAN_A16R_OWNER_AUTH_GATE_SMOKE_AND_EVIDENCE_BUNDLE.md",
  "scripts/check-a16r-owner-auth-gate-smoke-and-evidence-bundle.cjs",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "scripts/check-a16r-post-deploy-http500-root-cause.cjs",
  "scripts/check-a16r-giapha-correct-account-deploy-smoke.cjs",
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
    file === "wrangler.toml" ||
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
  console.error("A-16R OpenNext Cloudflare deploy bundle fix candidate check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16R OpenNext Cloudflare deploy bundle fix candidate check passed.");
