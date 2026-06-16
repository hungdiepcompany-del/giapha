const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const workflowPath = ".github/workflows/opennext-build-gate.yml";
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
  requireIncludes(workflow, "npm run check:opennext-cloudflare");
  requireIncludes(workflow, "npm run check:service-boundary");
  requireIncludes(workflow, "npm run build");
  requireIncludes(workflow, "npx opennextjs-cloudflare build");

  for (const forbidden of [
    "wrangler deploy",
    "npm run deploy",
    "npm.cmd run deploy",
    "npm run upload",
    "npm.cmd run upload",
  ]) {
    if (lowerWorkflow.includes(forbidden)) {
      failures.push(`workflow contains forbidden command: ${forbidden}`);
    }
  }

  for (const forbiddenSecretPattern of [
    /sb_secret_/i,
    /eyJ[A-Za-z0-9_-]{20,}/,
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
  const script = packageJson.scripts?.["check:github-actions-opennext"];

  if (script !== "node scripts/check-github-actions-opennext-gate.cjs") {
    failures.push("package.json missing script check:github-actions-opennext");
  }
}

if (failures.length > 0) {
  console.error("GitHub Actions OpenNext gate check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("GitHub Actions OpenNext gate check passed.");
