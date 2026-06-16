const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const workflowPath = ".github/workflows/cloudflare-deploy.yml";
const absoluteWorkflowPath = path.join(root, workflowPath);
const failures = [];

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) {
    failures.push(`workflow missing ${label}`);
  }
}

if (!fs.existsSync(absoluteWorkflowPath)) {
  failures.push(`missing ${workflowPath}`);
} else {
  const workflow = fs.readFileSync(absoluteWorkflowPath, "utf8");
  const lowerWorkflow = workflow.toLowerCase();

  requireIncludes(workflow, "workflow_dispatch:");
  requireIncludes(workflow, "runs-on: ubuntu-latest");
  requireIncludes(workflow, "uses: actions/checkout@v4");
  requireIncludes(workflow, "uses: actions/setup-node@v4");
  requireIncludes(workflow, "node-version: '24'", "node-version 24");
  requireIncludes(workflow, "run: npm ci", "npm ci");
  requireIncludes(workflow, "secrets.CLOUDFLARE_API_TOKEN");
  requireIncludes(workflow, "secrets.CLOUDFLARE_ACCOUNT_ID");
  requireIncludes(workflow, "vars.NEXT_PUBLIC_SUPABASE_URL");
  requireIncludes(workflow, "vars.NEXT_PUBLIC_SUPABASE_ANON_KEY");
  requireIncludes(workflow, "vars.NEXT_PUBLIC_APP_URL");
  requireIncludes(workflow, "secrets.SUPABASE_SERVICE_ROLE_KEY");
  requireIncludes(workflow, "npm run check:env:safe");
  requireIncludes(workflow, "npm run check:migrations");
  requireIncludes(workflow, "npm run check:deploy-readiness");
  requireIncludes(workflow, "npm run check:opennext-cloudflare");
  requireIncludes(workflow, "npm run check:service-boundary");
  requireIncludes(workflow, "npm run check:github-actions-opennext");
  requireIncludes(workflow, "npm run check:github-actions-deploy");
  requireIncludes(workflow, "npm run typecheck");
  requireIncludes(workflow, "npm run lint");
  requireIncludes(workflow, "npm run build");
  requireIncludes(workflow, "npm run deploy");

  for (const forbidden of [
    "pull_request:",
    "push:",
    "schedule:",
    "npm run upload",
    "npm.cmd run upload",
    "wrangler deploy",
    "npm audit fix",
    "npm.cmd audit fix",
  ]) {
    if (lowerWorkflow.includes(forbidden)) {
      failures.push(`workflow contains forbidden entry: ${forbidden}`);
    }
  }

  for (const forbiddenSecretPattern of [
    /sb_secret_/i,
    /eyJ[A-Za-z0-9_-]{20,}/,
    /CLOUDFLARE_API_TOKEN:\s*['"][^$][^'"]+['"]/,
    /CLOUDFLARE_ACCOUNT_ID:\s*['"][^$][^'"]+['"]/,
    /SUPABASE_SERVICE_ROLE_KEY:\s*['"][^$][^'"]+['"]/,
  ]) {
    if (forbiddenSecretPattern.test(workflow)) {
      failures.push("workflow appears to contain a real secret value");
      break;
    }
  }
}

const packageJsonPath = path.join(root, "package.json");
if (!fs.existsSync(packageJsonPath)) {
  failures.push("missing package.json");
} else {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const script = packageJson.scripts?.["check:github-actions-deploy"];

  if (script !== "node scripts/check-github-actions-cloudflare-deploy.cjs") {
    failures.push("package.json missing script check:github-actions-deploy");
  }
}

if (failures.length > 0) {
  console.error("GitHub Actions Cloudflare deploy workflow check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("GitHub Actions Cloudflare deploy workflow check passed.");
