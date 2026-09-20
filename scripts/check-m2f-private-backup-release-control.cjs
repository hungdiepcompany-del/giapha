const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const failures = [];
const read = (relativePath) => {
  try { return fs.readFileSync(path.join(root, relativePath), "utf8"); }
  catch { failures.push(`missing ${relativePath}`); return ""; }
};
const requireText = (text, token) => { if (!text.includes(token)) failures.push(`missing ${token}`); };
const rejectText = (text, token) => { if (text.includes(token)) failures.push(`forbidden ${token}`); };
const requireCount = (text, token, count, label) => {
  const actual = text.split(token).length - 1;
  if (actual !== count) failures.push(`${label} expected ${count}, found ${actual}`);
};

const approvedMainRuntimeVarKeys = new Set([
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED",
  "A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED",
]);

function requireExactMainRuntimeVarOverrides(content) {
  const lines = content.split(/\r?\n/);
  const start = lines.findIndex(
    (line) =>
      /npx\s+wrangler\s+versions\s+upload\b/.test(line) &&
      /--name(?:=|\s+)["']?web-gia-pha\b/.test(line),
  );
  if (start < 0) {
    failures.push("missing main wrangler versions upload command");
    return;
  }

  let command = lines[start].trim();
  let index = start;
  while (/\\\s*$/.test(command) && index + 1 < lines.length) {
    command = `${command.replace(/\\\s*$/, "")} ${lines[++index].trim()}`;
  }

  const keys = [];
  const pattern = /(?:^|\s)--var(?:=|\s+)(?:"([^"]*)"|'([^']*)'|([^\s\\]+))/g;
  for (const match of command.matchAll(pattern)) {
    const spec = match[1] ?? match[2] ?? match[3] ?? "";
    const separator = spec.indexOf(":");
    if (separator <= 0) {
      failures.push(`malformed main runtime override ${spec}`);
      continue;
    }
    keys.push(spec.slice(0, separator));
  }

  for (const key of approvedMainRuntimeVarKeys) {
    const count = keys.filter((candidate) => candidate === key).length;
    if (count !== 1) failures.push(`main runtime override ${key} expected 1, found ${count}`);
  }
  for (const key of keys) {
    if (!approvedMainRuntimeVarKeys.has(key)) failures.push(`unexpected main runtime override ${key}`);
  }
}

const backup = read(".github/workflows/backup-service-deploy.yml");
const main = read(".github/workflows/cloudflare-deploy.yml");
const contract = read("docs/M2F_PRIVATE_BACKUP_RELEASE_CONTROL_CONTRACT.md");
const guard = read("scripts/m2f-release-evidence-guard.cjs");
const packageJson = JSON.parse(read("package.json") || "{}");

for (const workflow of [backup, main]) {
  for (const token of [
    "workflow_dispatch:",
    "expected_source_sha",
    "m2f-private-backup-release-control",
    "actions/checkout@v5",
    "ref: \"${{ inputs.expected_source_sha }}\"",
    "node scripts/m2f-release-evidence-guard.cjs source",
    "contents: read",
  ]) requireText(workflow, token);
  for (const token of ["push:", "pull_request:", "schedule:", "github.ref }}"]) rejectText(workflow, token);
}

requireText(backup, "environment: backup-production");
requireCount(main, "environment: core-production", 2, "main protected core environment coverage");

for (const token of [
  "bootstrap",
  "wrangler deploy --strict --env production --secrets-file",
  "absence absent-error.json",
  "wrangler deployments status --name web-gia-pha --json",
  "wrangler versions view \"$MAIN_VERSION_ID\" --name web-gia-pha --json",
  "main main-before.json main-after.json",
  "BACKUP_VERSION_ID=\"$(node -e \"const x=require('./versions-after.json')",
  "annotations?.['workers/tag']",
  "wrangler versions upload --env production --secrets-file",
  "current-deployment before.json \"$EXPECTED_CURRENT_DEPLOYMENT_ID\" \"$EXPECTED_CURRENT_VERSION_ID\"",
  "target-version target-versions.json \"$TARGET_VERSION_ID\"",
  "wrangler versions deploy \"${TARGET_VERSION_ID}@100%\"",
  "MAIN_ROLLBACK_100_VERIFIED",
  "umask 077; SECRETS_FILE=\"$(mktemp)\"; export SECRETS_FILE",
  "trap 'rm -f \"$SECRETS_FILE\"' EXIT",
  "chmod 600 \"$SECRETS_FILE\"",
]) requireText(backup, token);
for (const token of ["versions delete", "workers delete", "wrangler delete"]) rejectText(backup, token);
requireCount(backup, "actions/setup-node@v5", 3, "backup setup-node coverage");
requireCount(backup, "- run: npm ci", 3, "backup npm ci coverage");
requireCount(backup, "CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}", 3, "backup account identity coverage");
requireCount(backup, "annotations?.['workers/tag']", 2, "backup bootstrap/upload tag proof coverage");
requireCount(backup, "m2f-release-evidence-guard.cjs version versions-after.json", 2, "backup bootstrap/upload version proof coverage");

for (const token of [
  "wrangler deployments status --name web-gia-pha --json",
  "wrangler versions upload --name web-gia-pha --keep-vars --tag \"$RELEASE_TAG\"",
  '--var "NEXT_PUBLIC_SUPABASE_URL:$NEXT_PUBLIC_SUPABASE_URL"',
  '--var "NEXT_PUBLIC_SUPABASE_ANON_KEY:$NEXT_PUBLIC_SUPABASE_ANON_KEY"',
  '--var "A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED:$A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED"',
  '--var "A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED:$A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED"',
  "annotations?.['workers/tag']",
  "target-version target-versions.json \"$TARGET_VERSION_ID\"",
]) requireText(main, token);
requireExactMainRuntimeVarOverrides(main);
for (const token of [
  "environment: backup-production",
  "BACKUP_SERVICE_INTERNAL_TOKEN",
  "BACKUP_SERVICE_PRODUCTION",
  "--secrets-file",
  "SECRETS_FILE",
  '--var "NEXT_PUBLIC_APP_URL:',
  '--var "SUPABASE_SERVICE_ROLE_KEY:',
]) rejectText(main, token);
requireCount(main, "actions/setup-node@v5", 2, "main setup-node coverage");
requireCount(main, "- run: npm ci", 2, "main npm ci coverage");
requireCount(main, "CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}", 2, "main account identity coverage");
if (main.includes("npm run deploy")) failures.push("direct main deploy bypass");

for (const token of [
  "10007",
  "gia-pha-prod-backups-apac-v1",
  "BACKUP_OPERATOR_PRODUCTION_PREFLIGHT_ONLY",
  "BACKUP_SERVICE_PRODUCTION_PREFLIGHT_OK",
  "MAIN_ROLLBACK_100_VERIFIED",
  "No R2/data operation",
  "workers/tag",
  "remote active version view",
  "free core",
]) requireText(contract, token);

for (const token of [
  "assertSourceIdentity",
  "assertPrivateConfig",
  "isExact10007",
  "assertVersion",
  "assertTargetVersion",
  "assertCurrentDeployment",
  "assertRoutingEqual",
  "assertMainUnchanged",
  "refs/heads/main",
  "workers/tag",
  "codes.length === 1",
  "versionView",
]) requireText(guard, token);
rejectText(main, "npx wrangler deployments list --name web-gia-pha --json");
rejectText(backup, "npx wrangler deployments list --name web-gia-pha --json");
rejectText(backup, "npx wrangler deployments list --name web-gia-pha-backup-service-production --json > before.json");

if (packageJson.scripts?.["check:m2f-release-control"] !== "node scripts/check-m2f-private-backup-release-control.cjs") failures.push("package script missing");
if (packageJson.scripts?.["test:m2f-release-evidence"] !== "node scripts/test-m2f-release-evidence-guard.cjs") failures.push("test script missing");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("M2F private backup release control check passed.");
