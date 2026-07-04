const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16R_GIAPHA_CORRECT_ACCOUNT_DEPLOY_SMOKE.md";
const packagePath = "package.json";
const routePath = "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";
const servicePath = "lib/import/giapha4/official-import-service.ts";
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
const route = read(routePath);
const service = read(servicePath);
const wrangler = read(wranglerPath);

for (const token of [
  "A-16R-GIAPHA-CORRECT-ACCOUNT-DEPLOY-SMOKE",
  "A16R_GIAPHA_CORRECT_ACCOUNT_DEPLOY_SMOKE_STATUS=DEPLOYED_SMOKE_FAILED_ROLLED_BACK",
  "A16R_GIAPHA_CORRECT_ACCOUNT_PREFLIGHT_STATUS=PASS",
  "A16R_GIAPHA_CORRECT_ACCOUNT_VALIDATION_STATUS=PASS_WITH_CLEAN_MIRROR_BUILD_CHECKOUT_NEXT_ACL_BLOCKED",
  "REMOTE_REPO_SLUG_MATCH=YES_SSH_ALIAS_ACCEPTED",
  "eb7d77d410c955b74ae73d963d8d8a4fe855b9df",
  "HEAD_EQUALS_ORIGIN_MAIN=YES",
  "WORKING_TREE_CLEAN=YES",
  "BUILD_STATUS=PASS_CLEAN_MIRROR_SOURCE_BUILD_CHECKOUT_ARTIFACT_ACL_BLOCKED",
  "hungdiepcompany@gmail.com",
  "Hungdiepcompany@gmail.com's Account",
  "2974c02a3713cc906eddb18833d69077",
  "CURRENT_ACCOUNT_IS_NOT_PREVIOUS_WRONG_ACCOUNT=YES",
  "CLOUDFLARE_ACCOUNT_MATCH=YES",
  "web-gia-pha",
  "TARGET_WORKER_FOUND=YES",
  "TARGET_WORKER_CLASSIFICATION=FOUND_IN_CORRECT_ACCOUNT",
  "DEPLOY_ALLOWED=YES",
  "DEPLOY_COMMAND_RUN=YES",
  "DEPLOY_RESULT=PASS",
  "DEPLOY_SOURCE=CLEAN_TEMP_MIRROR_CHECKOUT_NEXT_ACL_AVOIDANCE",
  "https://web-gia-pha.hungdiepcompany.workers.dev",
  "d158869a-3d32-4697-8ad8-815a64526b36",
  "PRODUCTION_POST_DEPLOY_SMOKE_RESULT=FAILED_500_ALL_REQUIRED_GET_ROUTES",
  "RUNTIME_ENABLEMENT_MARKER_RECOGNIZED=UNKNOWN_SMOKE_500",
  "A16V_RECONCILIATION_EVIDENCE_RECOGNIZED=UNKNOWN_SMOKE_500",
  "PRODUCTION_CAN_RUN_OFFICIAL_IMPORT=unknown",
  "PRODUCTION_OFFICIAL_IMPORT_BUTTON=unknown",
  "REMAINING_BLOCKER=POST_DEPLOY_SMOKE_500_ALL_REQUIRED_GET_ROUTES",
  "ROLLBACK_RESULT=PASS_RESTORED_PREVIOUS_VERSION",
  "77fc3067-b197-4bce-8a36-eb2bde6bacc8",
  "POST_ROLLBACK_PUBLIC_ROUTES_STATUS=PASS_GET_200",
  "POST_ROLLBACK_OFFICIAL_IMPORT_GATE_GET_STATUS=PASS_GUARDED_401",
  "ACTIVE_VERSION_AFTER_ROLLBACK=77fc3067-b197-4bce-8a36-eb2bde6bacc8",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "A16R_IMPORT_MAY_BE_RETRIED_NEXT=NO",
  "A16R_IMPORT_RETRY_BLOCKER=POST_DEPLOY_SMOKE_FAILED_AND_ROLLED_BACK",
  "A16R_GIAPHA_CORRECT_ACCOUNT_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16R_GIAPHA_CORRECT_ACCOUNT_DIRECT_RPC_CALLED=NO",
  "A16R_GIAPHA_CORRECT_ACCOUNT_REAL_GENEALOGY_WRITE=NO",
  "A16R_GIAPHA_CORRECT_ACCOUNT_SQL_RUN=NO",
  "A16R_GIAPHA_CORRECT_ACCOUNT_DB_PUSH_RUN=NO",
  "A16R_GIAPHA_CORRECT_ACCOUNT_MIGRATION_REPAIR_RUN=NO",
  "A16R_GIAPHA_CORRECT_ACCOUNT_SEED_RUN=NO",
  "A16R_GIAPHA_CORRECT_ACCOUNT_WRANGLER_TOML_CHANGED=NO",
  "No POST `/official-import`.",
  "No direct RPC call.",
  "No real genealogy data write.",
  "Main Worker source touched: NO",
  "Runtime dependency added: NO",
  "New service Worker created: NO",
  "OpenNext/Wrangler config changed: NO",
  "INVESTIGATE_DEPLOYED_RUNTIME_500_BEFORE_A16R_RETRY",
  "A16R_GIAPHA_CORRECT_ACCOUNT_NEXT_GATE=INVESTIGATE_DEPLOYED_RUNTIME_500_THEN_REDEPLOY_SMOKE",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const routeSmoke of [
  "/`: `500`, body length `21`",
  "/tree`: `500`, body length `21`",
  "/auth/login`: `500`, body length `21`",
  "/admin/exports/import`: `500`, body length `21`",
  "/`: `200`, body length `20799`",
  "/tree`: `200`, body length `18765`",
  "/auth/login`: `200`, body length `12180`",
  "/admin/exports/import`: `200`, body length `19173`",
]) {
  requireIncludes(doc, routeSmoke, `route smoke ${routeSmoke}`);
}

requireIncludes(wrangler, 'name = "web-gia-pha"', "wrangler target worker name");
requireIncludes(route, "canRunOfficialImport: false", "route remains fail closed");
requireIncludes(service, "canRunOfficialImport: false", "service remains fail closed");

if (
  packageJson?.scripts?.["check:a16r-giapha-correct-account-deploy-smoke"] !==
  "node scripts/check-a16r-giapha-correct-account-deploy-smoke.cjs"
) {
  failures.push("missing package script check:a16r-giapha-correct-account-deploy-smoke");
}

for (const [content, token, label] of [
  [index, "PLAN_A16R_GIAPHA_CORRECT_ACCOUNT_DEPLOY_SMOKE.md", "index correct account deploy smoke entry"],
  [
    workLog,
    "A16R_GIAPHA_CORRECT_ACCOUNT_DEPLOY_SMOKE_STATUS=DEPLOYED_SMOKE_FAILED_ROLLED_BACK",
    "work log correct account deploy smoke status",
  ],
  [
    decisionLog,
    "A-16R correct account deploy smoke failed and rolled back",
    "decision log correct account deploy smoke decision",
  ],
  [
    handoff,
    "A16R_GIAPHA_CORRECT_ACCOUNT_DEPLOY_SMOKE_STATUS=DEPLOYED_SMOKE_FAILED_ROLLED_BACK",
    "handoff correct account deploy smoke status",
  ],
]) {
  requireIncludes(content, token, label);
}

for (const [label, content] of [
  [docPath, doc],
  [routePath, route],
  [servicePath, service],
]) {
  rejectPattern(content, /\.rpc\s*\(/i, `${label} must not call RPC`);
  rejectPattern(content, /fetch\s*\([\s\S]{0,240}\/official-import/i, `${label} must not call official import`);
  rejectPattern(
    content,
    /\.from\(\s*["'](people|relationships|families|family_parents|family_children|couple_relationships|tree_layouts?|revisions|profiles)["']\s*\)[\s\S]{0,240}\.(insert|update|delete|upsert)\s*\(/i,
    `${label} must not write real genealogy tables`,
  );
}

rejectPattern(doc + route + service, /canRunOfficialImport:\s*true/, "must not open canRunOfficialImport");
rejectPattern(doc + route + service, /SUPABASE_SERVICE_ROLE_KEY\s*=/i, "secret assignment");
rejectPattern(doc + route + service, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  "docs/PLAN_A16R_POST_DEPLOY_HTTP500_ROOT_CAUSE.md",
  "docs/PLAN_A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_FIX_CANDIDATE.md",
  packagePath,
  "scripts/check-a16r-post-deploy-http500-root-cause.cjs",
  "scripts/check-a16r-opennext-cloudflare-deploy-bundle-fix-candidate.cjs",
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
  "docs/PLAN_A16R_GITHUB_ACTIONS_LINUX_DEPLOY_SMOKE.md",
  "scripts/check-a16r-github-actions-linux-deploy-smoke.cjs",
  "docs/PLAN_A16R_OFFICIAL_IMPORT_GATE_READINESS_DIAGNOSIS.md",
  "scripts/check-a16r-official-import-gate-readiness-diagnosis.cjs",
  "docs/PLAN_A16R_AUTHENTICATED_OFFICIAL_IMPORT_GATE_SMOKE.md",
  "scripts/check-a16r-authenticated-official-import-gate-smoke.cjs",
  "docs/PLAN_A16R_AUTHENTICATED_OWNER_IMPORT_GATE_SMOKE_RETRY.md",
  "scripts/check-a16r-authenticated-owner-import-gate-smoke-retry.cjs",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === ".env.local" || file.endsWith(".env.local")) failures.push(`forbidden env file ${file}`);
  if (file.startsWith("supabase/.temp/")) failures.push(`forbidden supabase temp ${file}`);
  if (/\.(xls|xlsx|csv)$/i.test(file)) failures.push(`forbidden spreadsheet/csv ${file}`);
  if (/^(db\/migrations|supabase\/migrations|db\/checks)\//.test(file)) {
    failures.push(`forbidden SQL/check file ${file}`);
  }
  if (file === wranglerPath) failures.push("wrangler.toml must not change");
  if (["CHECK_CLOUDFLARE_ACCOUNT.bat", "GUARD.bat", "GIA_PHA_GITHUB_MENU.bat"].includes(file)) {
    failures.push(`forbidden outside-scope file ${file}`);
  }
}

const stagedFiles = git(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected staged file ${file}`);
  if (file === wranglerPath) failures.push("wrangler.toml must not be staged");
}

if (failures.length > 0) {
  console.error("A-16R GIA PHA correct account deploy smoke check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16R GIA PHA correct account deploy smoke check passed.");
