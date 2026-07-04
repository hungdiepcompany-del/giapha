const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16R_POST_DEPLOY_HTTP500_ROOT_CAUSE.md";
const packagePath = "package.json";
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
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16R-POST-DEPLOY-HTTP500-ROOT-CAUSE",
  "A16R_POST_DEPLOY_HTTP500_ROOT_CAUSE_STATUS=LIKELY_ROOT_CAUSE_IDENTIFIED_DOCS_ONLY",
  "A16R_POST_DEPLOY_HTTP500_ROOT_CAUSE_CLASSIFICATION=OPENNEXT_CLOUDFLARE_INCOMPATIBILITY",
  "A16R_POST_DEPLOY_HTTP500_ROOT_CAUSE_CONFIDENCE=LIKELY_NOT_PROVEN_BY_FAILED_VERSION_STACKTRACE",
  "A16R_POST_DEPLOY_HTTP500_ROOT_CAUSE_SUBTYPE=WINDOWS_LOCAL_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_INCOMPATIBILITY",
  "d158869a-3d32-4697-8ad8-815a64526b36",
  "77fc3067-b197-4bce-8a36-eb2bde6bacc8",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "REMOTE_REPO_SLUG_MATCH=YES_SSH_ALIAS_ACCEPTED",
  "WORKING_TREE_CLEAN=YES",
  "PRODUCTION_POST_DEPLOY_SMOKE_RESULT=FAILED_500_ALL_REQUIRED_GET_ROUTES",
  "HTTP_500_ALL_REQUIRED_GET_ROUTES",
  "ROLLBACK_RESULT=PASS_RESTORED_PREVIOUS_VERSION",
  "POST_ROLLBACK_PUBLIC_ROUTES_STATUS=PASS_GET_200",
  "POST_ROLLBACK_OFFICIAL_IMPORT_GATE_GET_STATUS=PASS_GUARDED_401",
  "WRANGLER_VERSION_METADATA_MATCH_FAILED_AND_ROLLBACK=YES",
  "MISSING_ENV_AT_RUNTIME=LESS_LIKELY_FROM_VERSION_METADATA",
  "BINDING_MISMATCH=NOT_SEEN_IN_VERSION_METADATA",
  "FAILED_VERSION_LOGS_STATUS=NOT_AVAILABLE_AFTER_ROLLBACK_NO_TAIL_TRAFFIC_GENERATED",
  "5fb248c..eb7d77d",
  "app/api/admin/import-sessions/[sessionId]/official-import/route.ts",
  "components/imports/import-session-manifest-panel.tsx",
  "lib/import/giapha4/official-import-service.ts",
  "app/layout.tsx changed: NO",
  "app/(public)/page.tsx changed: NO",
  "app/(public)/tree/page.tsx changed: NO",
  "app/auth/login/page.tsx changed: NO",
  "lib/supabase/server.ts changed: NO",
  "wrangler.toml changed: NO",
  "open-next.config.ts changed: NO",
  "next.config.ts changed: NO",
  "Runtime dependencies changed: NO",
  "MODULE_TOP_LEVEL_RUNTIME_ERROR",
  "MISSING_ENV_AT_RUNTIME",
  "OPENNEXT_CLOUDFLARE_INCOMPATIBILITY",
  "OFFICIAL_IMPORT_GUARD_IMPORT_SIDE_EFFECT",
  "AUTH_MIDDLEWARE_RUNTIME_ERROR",
  "UNKNOWN_NEEDS_LOGS",
  "A16R_POST_DEPLOY_HTTP500_NEXT_ALLOWED_ACTION=PREPARE_LINUX_OR_GITHUB_ACTIONS_DEPLOY_RETRY_WITH_PREVIEW_AND_ROLLBACK_PLAN",
  "A16R_POST_DEPLOY_HTTP500_DEPLOY_RUN=NO",
  "A16R_POST_DEPLOY_HTTP500_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16R_POST_DEPLOY_HTTP500_DIRECT_RPC_CALLED=NO",
  "A16R_POST_DEPLOY_HTTP500_REAL_GENEALOGY_WRITE=NO",
  "A16R_POST_DEPLOY_HTTP500_SQL_RUN=NO",
  "A16R_POST_DEPLOY_HTTP500_DB_PUSH_RUN=NO",
  "A16R_POST_DEPLOY_HTTP500_MIGRATION_REPAIR_RUN=NO",
  "A16R_POST_DEPLOY_HTTP500_SEED_RUN=NO",
  "A16R_POST_DEPLOY_HTTP500_PRODUCTION_DATA_CHANGED=NO",
  "A16R_POST_DEPLOY_HTTP500_WRANGLER_TOML_CHANGED=NO",
  "No POST `/official-import`.",
  "No direct RPC call.",
  "No real genealogy data write.",
  "No SQL, Supabase DB push, migration repair or seed.",
  "No Cloudflare deploy.",
  "Main Worker source touched: NO",
  "Runtime dependency added: NO",
  "New service Worker created: NO",
  "OpenNext/Wrangler config changed: NO",
  "NONE_FOR_THIS_PHASE_USE_LINUX_DEPLOY_RETRY_PHASE",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

if (
  packageJson?.scripts?.["check:a16r-post-deploy-http500-root-cause"] !==
  "node scripts/check-a16r-post-deploy-http500-root-cause.cjs"
) {
  failures.push("missing package script check:a16r-post-deploy-http500-root-cause");
}

for (const [content, token, label] of [
  [index, "PLAN_A16R_POST_DEPLOY_HTTP500_ROOT_CAUSE.md", "index root cause entry"],
  [
    workLog,
    "A16R_POST_DEPLOY_HTTP500_ROOT_CAUSE_STATUS=LIKELY_ROOT_CAUSE_IDENTIFIED_DOCS_ONLY",
    "work log root cause status",
  ],
  [
    decisionLog,
    "A-16R post-deploy HTTP 500 likely caused by Windows OpenNext deploy incompatibility",
    "decision log root cause decision",
  ],
  [
    handoff,
    "A16R_POST_DEPLOY_HTTP500_ROOT_CAUSE_STATUS=LIKELY_ROOT_CAUSE_IDENTIFIED_DOCS_ONLY",
    "handoff root cause status",
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
  "docs/PLAN_A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_FIX_CANDIDATE.md",
  packagePath,
  "scripts/check-a16r-post-deploy-http500-root-cause.cjs",
  "scripts/check-a16r-opennext-cloudflare-deploy-bundle-fix-candidate.cjs",
  "docs/PLAN_A16R_GITHUB_ACTIONS_LINUX_DEPLOY_SMOKE.md",
  "scripts/check-a16r-github-actions-linux-deploy-smoke.cjs",
  "docs/PLAN_A16R_OFFICIAL_IMPORT_GATE_READINESS_DIAGNOSIS.md",
  "scripts/check-a16r-official-import-gate-readiness-diagnosis.cjs",
  "docs/PLAN_A16R_AUTHENTICATED_OFFICIAL_IMPORT_GATE_SMOKE.md",
  "scripts/check-a16r-authenticated-official-import-gate-smoke.cjs",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
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
    file === wranglerPath ||
    file === "open-next.config.ts" ||
    file === "next.config.ts" ||
    file.startsWith("app/") ||
    file.startsWith("lib/") ||
    file.startsWith("components/")
  ) {
    failures.push(`runtime/config file must not change in this phase ${file}`);
  }
}

const stagedFiles = git(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected staged file ${file}`);
}

if (failures.length > 0) {
  console.error("A-16R post-deploy HTTP 500 root cause check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16R post-deploy HTTP 500 root cause check passed.");
