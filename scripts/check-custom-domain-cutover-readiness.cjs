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

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) {
    failures.push(`missing ${label}`);
  }
}

const doc = readFile("docs/20_CUSTOM_DOMAIN_CUTOVER_READINESS.md");

for (const section of [
  "## Production Baseline",
  "## Candidate Custom Domain",
  "## Cutover Goal",
  "## Cloudflare Readiness Checklist",
  "## Supabase Auth Readiness Checklist",
  "## Google OAuth Readiness Checklist",
  "## App Configuration Readiness",
  "## Smoke Test Plan",
  "## Rollback Plan",
  "## Pre-Cutover Approval Checklist",
  "## Domain Cutover Risk Matrix",
  "## Phase 20 Gaps",
  "## Phase 20 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section);
}

for (const token of [
  "CUSTOM_DOMAIN_CUTOVER_READINESS_BASELINE",
  "web-gia-pha",
  "https://web-gia-pha.hungdiepcompany.workers.dev/",
  ".github/workflows/cloudflare-deploy.yml",
  "wrangler.toml",
  "Candidate custom domain:",
  "<TO_BE_CONFIRMED>",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "PROD_SMOKE_BASE_URL",
  "window.location.origin",
  "Phase 19 status: PASS_WITH_NOTES",
  "GIA_PHA_GITHUB_MENU.bat",
  "Do not deploy in Phase 20",
  "Do not change real DNS",
  "Do not change a real Cloudflare custom domain or route",
  "Do not change Supabase/Auth/OAuth production config",
  "Do not call Cloudflare, Supabase, Google, or DNS APIs to mutate config",
  "Do not hardcode secret/token/key values",
  "Do not commit `GIA_PHA_GITHUB_MENU.bat`",
]) {
  requireIncludes(doc, token);
}

const packageJsonRaw = readFile("package.json");
const packageJson = packageJsonRaw ? JSON.parse(packageJsonRaw) : {};
const scripts = packageJson.scripts || {};

if (
  scripts["check:custom-domain-cutover-readiness"] !==
  "node scripts/check-custom-domain-cutover-readiness.cjs"
) {
  failures.push("package.json missing script check:custom-domain-cutover-readiness");
}

for (const file of [
  "docs/20_CUSTOM_DOMAIN_CUTOVER_READINESS.md",
  "scripts/check-custom-domain-cutover-readiness.cjs",
]) {
  const content = readFile(file);

  for (const pattern of [
    /sb_secret_[A-Za-z0-9_-]+/i,
    /eyJ[A-Za-z0-9_-]{20,}/,
    /SUPABASE_SERVICE_ROLE_KEY\s*=\s*["'][^"']+["']/,
    /GOOGLE_CLIENT_SECRET\s*=\s*["'][^"']+["']/,
    /CLOUDFLARE_API_TOKEN\s*=\s*["'][^"']+["']/,
    /CLOUDFLARE_ACCOUNT_ID\s*=\s*["'][^"']+["']/,
  ]) {
    if (pattern.test(content)) {
      failures.push(`${file} appears to contain a plaintext secret/token/key`);
      break;
    }
  }
}

if (failures.length > 0) {
  console.error("Custom domain cutover readiness check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Custom domain cutover readiness check passed.");
