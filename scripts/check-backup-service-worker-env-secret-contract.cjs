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
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    failures.push(`${relativePath} is not valid JSON`);
    return null;
  }
}

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

function rejectIncludes(content, token, label = token) {
  if (content.includes(token)) failures.push(`forbidden ${label}`);
}

const doc = readFile("docs/44_BACKUP_SERVICE_WORKER_ENV_SECRET_CONTRACT.md");
const wrangler = readJson("services/backup-service/wrangler.jsonc");
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Backup Service Baseline",
  "## Env/Secret Contract Goal",
  "## Required Secrets",
  "## Optional Vars",
  "## Secret Provisioning Checklist",
  "## Secret Rotation Checklist",
  "## Local Development Boundary",
  "## CI Boundary",
  "## Logging Safety",
  "## Failure Modes",
  "## No-Secret-In-Docs Policy",
  "## Phase 44 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "BACKUP_SERVICE_INTERNAL_TOKEN",
  "BACKUP_ENCRYPTION_KEY_B64",
  "BACKUP_STORAGE_PROVIDER",
  "BACKUP_STORAGE_DRY_RUN",
  "BACKUP_STORAGE_PREFIX",
  "BACKUP_RETENTION_POLICY",
  "future runtime secret",
  "Do not put the real value in docs",
  "Do not put the real value in `wrangler.jsonc` vars",
  "Do not commit it to `.env.local`",
  "Do not commit it to `.dev.vars`",
  "Do not print it in logs",
  "No secret provisioning is performed in Phase 44",
  "No secret rotation is performed in Phase 44",
]) {
  requireIncludes(doc, token);
}

for (const forbidden of [
  "wrangler secret",
  "npx wrangler",
  "supabase db push",
  "googleapis",
  "process.env.BACKUP_SERVICE_INTERNAL_TOKEN",
]) {
  rejectIncludes(doc.toLowerCase(), forbidden.toLowerCase(), `doc ${forbidden}`);
}

for (const secretPattern of [
  /SUPABASE_SERVICE_ROLE_KEY\s*[:=]\s*['"][^'"]+['"]/,
  /CLOUDFLARE_API_TOKEN\s*[:=]\s*['"][^'"]+['"]/,
  /GOOGLE_CLIENT_SECRET\s*[:=]\s*['"][^'"]+['"]/,
  /BACKUP_SERVICE_INTERNAL_TOKEN\s*[:=]\s*['"][^'"]+['"]/,
  /password\s*[:=]\s*['"][^'"]+['"]/i,
  /eyJ[A-Za-z0-9_-]{20,}/,
]) {
  if (secretPattern.test(doc)) failures.push(`possible plaintext secret matched ${secretPattern}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:backup-service-worker-env-secret-contract"] !== "node scripts/check-backup-service-worker-env-secret-contract.cjs") {
    failures.push("package.json missing check:backup-service-worker-env-secret-contract script");
  }
}

if (wrangler) {
  const topLevelSecrets = wrangler.secrets?.required || [];
  if (topLevelSecrets.length !== 1 || topLevelSecrets[0] !== "BACKUP_SERVICE_INTERNAL_TOKEN") {
    failures.push("wrangler top level must require only BACKUP_SERVICE_INTERNAL_TOKEN");
  }
  if (wrangler.r2_buckets) failures.push("wrangler top level must not declare BACKUP_BUCKET");
  const fixtureEnv = wrangler.env?.["fixture-local"];
  const fixtureSecrets = fixtureEnv?.secrets?.required || [];
  for (const name of ["BACKUP_SERVICE_INTERNAL_TOKEN", "BACKUP_ENCRYPTION_KEY_B64"]) {
    if (!fixtureSecrets.includes(name)) failures.push(`fixture-local missing required secret name ${name}`);
  }
  if (fixtureEnv?.vars?.BACKUP_SERVICE_MODE !== "fixture-local") {
    failures.push("fixture-local must declare its non-inheritable mode");
  }
  const binding = fixtureEnv?.r2_buckets?.find((item) => item.binding === "BACKUP_BUCKET");
  if (!binding || binding.remote !== false) failures.push("fixture-local local-development R2 binding missing");
  if (Object.values(wrangler.vars || {}).some((value) => String(value).includes("BACKUP_ENCRYPTION_KEY_B64"))) {
    failures.push("wrangler vars must not contain BACKUP_ENCRYPTION_KEY_B64");
  }
}

if (failures.length > 0) {
  console.error("Backup service worker env secret contract check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup service worker env secret contract check passed.");
