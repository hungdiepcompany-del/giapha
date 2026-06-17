const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const failures = [];

function readFile(relativePath) {
  const absolutePath = path.join(root, relativePath);

  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }

  return fs.readFileSync(absolutePath, "utf8");
}

function readJson(relativePath) {
  const content = readFile(relativePath);
  if (!content) {
    return null;
  }

  try {
    return JSON.parse(content);
  } catch {
    failures.push(`${relativePath} is not valid JSON`);
    return null;
  }
}

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) {
    failures.push(`missing ${label}`);
  }
}

function rejectIncludes(content, token, label = token) {
  if (content.includes(token)) {
    failures.push(`forbidden ${label}`);
  }
}

function scanForSecretPatterns(relativePath, content) {
  for (const pattern of [
    /sb_secret_[A-Za-z0-9_-]+/i,
    /eyJ[A-Za-z0-9_-]{20,}/,
    /SUPABASE_SERVICE_ROLE_KEY\s*=\s*["'][^"']+["']/,
    /GOOGLE_CLIENT_SECRET\s*=\s*["'][^"']+["']/,
    /CLOUDFLARE_API_TOKEN\s*=\s*["'][^"']+["']/,
    /CLOUDFLARE_ACCOUNT_ID\s*=\s*["'][^"']+["']/,
  ]) {
    if (pattern.test(content)) {
      failures.push(`${relativePath} appears to contain a plaintext secret/token/key`);
      break;
    }
  }
}

const doc = readFile("docs/37_REPOSITORY_HYGIENE_GITHUB_MENU_REVIEW.md");
const packageJson = readJson("package.json");

for (const section of [
  "## Current Repository Status",
  "## Dirty File Under Review",
  "## Diff Summary",
  "## Decision",
  "## Safety Boundary",
  "## Validation",
  "## Final Git Status",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "GIA_PHA_GITHUB_MENU.bat",
  "Decision: `REVERT_TO_HEAD`",
  "no meaningful content diff",
  "line-ending",
  "No deploy",
  "No push",
  "No schema or migration changes",
  "No real data mutation",
  "No production API/DB/network call",
  "No secret read",
]) {
  requireIncludes(doc, token);
}

for (const forbidden of [
  "fetch(",
  "createClient",
  "wrangler deploy",
  "opennextjs-cloudflare deploy",
  "supabase db push",
]) {
  rejectIncludes(doc, forbidden, `repository hygiene doc ${forbidden}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:repository-hygiene-github-menu-review"] !== "node scripts/check-repository-hygiene-github-menu-review.cjs") {
    failures.push("package.json missing check:repository-hygiene-github-menu-review script");
  }
}

scanForSecretPatterns("docs/37_REPOSITORY_HYGIENE_GITHUB_MENU_REVIEW.md", doc);

if (failures.length > 0) {
  console.error("Repository hygiene GitHub menu review check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Repository hygiene GitHub menu review check passed.");
