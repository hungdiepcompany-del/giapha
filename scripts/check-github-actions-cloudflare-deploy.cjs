const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const failures = [];

function read(relativePath) {
  try {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  } catch {
    failures.push(`missing ${relativePath}`);
    return "";
  }
}

function requireText(content, token) {
  if (!content.includes(token)) failures.push(`missing ${token}`);
}

function requireCount(content, token, expected) {
  const actual = content.split(token).length - 1;
  if (actual !== expected) failures.push(`${token} expected ${expected}, found ${actual}`);
}

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

const workflow = read(".github/workflows/cloudflare-deploy.yml");
const packageJson = JSON.parse(read("package.json") || "{}");

for (const token of [
  "workflow_dispatch:",
  "expected_source_sha",
  "m2f-private-backup-release-control",
  "environment: core-production",
  "node scripts/m2f-release-evidence-guard.cjs source",
  "wrangler versions upload --name web-gia-pha --keep-vars --tag",
  '--var "NEXT_PUBLIC_SUPABASE_URL:$NEXT_PUBLIC_SUPABASE_URL"',
  '--var "NEXT_PUBLIC_SUPABASE_ANON_KEY:$NEXT_PUBLIC_SUPABASE_ANON_KEY"',
  '--var "A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED:$A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED"',
  '--var "A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED:$A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED"',
  'test -n "$NEXT_PUBLIC_SUPABASE_URL"',
  'test -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY"',
  "wrangler versions deploy",
  "check:a16ax-cloudflare-runtime-vars-preservation-deploy-wiring",
  "npm run typecheck",
  "npm run lint",
]) {
  requireText(workflow, token);
}

requireCount(workflow, "environment: core-production", 2);
for (const variable of [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED",
  "A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED",
]) {
  requireCount(workflow, `--var "${variable}:$${variable}"`, 1);
}
requireExactMainRuntimeVarOverrides(workflow);

for (const forbidden of [
  "push:",
  "pull_request:",
  "schedule:",
  "npm run deploy",
  "cloudflare-deploy-${{ github.ref }}",
  "environment: backup-production",
  "BACKUP_SERVICE_INTERNAL_TOKEN",
  "BACKUP_SERVICE_PRODUCTION",
  "--secrets-file",
  '--var "NEXT_PUBLIC_APP_URL:',
  '--var "SUPABASE_SERVICE_ROLE_KEY:',
]) {
  if (workflow.includes(forbidden)) failures.push(`forbidden ${forbidden}`);
}

for (const secretLike of [/sb_secret_/i, /sb_publishable_/i, /eyJ[A-Za-z0-9_-]{20,}/]) {
  if (secretLike.test(workflow)) failures.push("workflow contains a literal API key");
}

if (
  packageJson.scripts?.["check:github-actions-deploy"] !==
  "node scripts/check-github-actions-cloudflare-deploy.cjs"
) {
  failures.push("package script missing");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("GitHub Actions Cloudflare runtime-override release-control check passed.");
