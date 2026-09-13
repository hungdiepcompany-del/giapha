const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const failures = [];

function read(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function requireText(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

function rejectText(content, token, label = token) {
  if (content.includes(token)) failures.push(`forbidden ${label}`);
}

function parseJson(relativePath) {
  try {
    return JSON.parse(read(relativePath));
  } catch {
    failures.push(`${relativePath} is not strict JSON`);
    return null;
  }
}

const config = parseJson("services/backup-service/wrangler.jsonc");
const source = read("services/backup-service/src/recoverability.ts");
const handler = read("services/backup-service/src/index.ts");
const generated = read("services/backup-service/worker-configuration.d.ts");
const test = read("scripts/test-m2a-private-r2-recoverability-fixture.mjs");
const readme = read("services/backup-service/README.md");
const doc = read("docs/44_BACKUP_SERVICE_WORKER_ENV_SECRET_CONTRACT.md");
const plan = read("docs/PLAN_M2A_PRIVATE_R2_RECOVERABILITY_SOURCE_LOCAL_FIXTURE.md");
const packageJson = parseJson("package.json");

if (config) {
  if (config.workers_dev !== false) failures.push("workers_dev must remain false");
  if (config.preview_urls !== false) failures.push("preview URLs must remain false");
  if (Object.hasOwn(config, "route") || Object.hasOwn(config, "routes")) failures.push("routes are not allowed");
  if (config.vars?.BACKUP_SERVICE_MODE !== "scaffold") failures.push("default mode must be scaffold");
  if (config.compatibility_date !== "2026-09-13") failures.push("compatibility date mismatch");
  if (config.r2_buckets) failures.push("top-level config must not declare an R2 binding");
  const topLevelSecrets = config.secrets?.required || [];
  if (topLevelSecrets.length !== 1 || topLevelSecrets[0] !== "BACKUP_SERVICE_INTERNAL_TOKEN") {
    failures.push("top-level config must require only BACKUP_SERVICE_INTERNAL_TOKEN");
  }
  const fixtureEnv = config.env?.["fixture-local"];
  if (!fixtureEnv || fixtureEnv.vars?.BACKUP_SERVICE_MODE !== "fixture-local") failures.push("fixture-local mode missing");
  const binding = fixtureEnv?.r2_buckets?.find((item) => item.binding === "BACKUP_BUCKET");
  if (!binding || binding.remote !== false || !binding.bucket_name || !binding.preview_bucket_name) failures.push("local-only BACKUP_BUCKET binding missing");
  const requiredSecrets = fixtureEnv?.secrets?.required || [];
  for (const name of ["BACKUP_SERVICE_INTERNAL_TOKEN", "BACKUP_ENCRYPTION_KEY_B64"]) {
    if (!requiredSecrets.includes(name)) failures.push(`missing required secret name ${name}`);
  }
  const productionEnv = config.env?.production;
  if (!productionEnv || productionEnv.vars?.BACKUP_SERVICE_MODE !== "production") failures.push("production mode missing");
  if (productionEnv?.vars?.BACKUP_ACTIVE_KEY_VERSION !== "v1") failures.push("production active key version missing");
  if (productionEnv?.workers_dev !== false || productionEnv?.preview_urls !== false) failures.push("production workers.dev and preview URLs must remain false");
  const productionBinding = productionEnv?.r2_buckets?.find((item) => item.binding === "BACKUP_BUCKET");
  if (!productionBinding || productionBinding.bucket_name !== "gia-pha-prod-backups-apac-v1") failures.push("production BACKUP_BUCKET binding missing");
  const productionSecrets = productionEnv?.secrets?.required || [];
  const expectedProductionSecrets = ["BACKUP_SERVICE_INTERNAL_TOKEN", "BACKUP_DATA_KEY_V1_B64", "BACKUP_OBJECT_KEY_HMAC_V1_B64"];
  if (productionSecrets.length !== expectedProductionSecrets.length || expectedProductionSecrets.some((name) => !productionSecrets.includes(name))) {
    failures.push("production required secret names mismatch");
  }
}

for (const token of [
  "SAMPLE_FIXTURE_ONLY",
  "cd811bce7d5732f478e01ce40650fd01cbd4c78f220b74d3b611a5dba9de6786",
  "AES-256-GCM",
  "AES_GCM_IV_BYTES = 12",
  "additionalData: toArrayBuffer(aad)",
  "ciphertext_sha256",
  "plaintext_sha256",
  "artifact_sha256",
  "bucket.put",
  "bucket.get",
  "m2a-private-r2-recoverability/${created.result.artifact_sha256}.fixture.json",
  "RECOVERABILITY_FIXTURE_SHA256_NOT_ALLOWLISTED",
]) requireText(source, token, `recoverability ${token}`);

for (const token of [
  "/internal/backup/fixture-roundtrip",
  "fixture-local",
  "timingSafeEqual",
  "readBoundedFixtureRequest",
  "BACKUP_SERVICE_FIXTURE_ROUNDTRIP_OK",
]) requireText(handler, token, `handler ${token}`);

for (const forbidden of [".delete(", ".list(", "fetch(\"http", "fetch('http", "realBackupCreated: true", "realStorageUpload: true", "restoreExecuted: true"]) {
  rejectText(`${source}\n${handler}`, forbidden);
}

for (const token of ["interface Env extends __BaseEnv_Env", "BACKUP_BUCKET: R2Bucket", "BACKUP_SERVICE_MODE: \"fixture-local\"", "BACKUP_SERVICE_INTERNAL_TOKEN: string", "BACKUP_ENCRYPTION_KEY_B64: string"]) {
  requireText(generated, token, `generated bindings ${token}`);
}
requireText(handler, "type BackupServiceEnv = Env", "handler generated Env alias");

for (const token of ["exact fixture allowlist", "concurrent artifact-derived keys", "Worker auth/mode/request-bound runtime", "wrong key", "tampered ciphertext", "tampered manifest", "tampered checksum", "wrong marker", "wrong fixture flags", "oversize fixture"]) {
  requireText(test, token, `fixture test ${token}`);
}

for (const token of ["fixture-local", "remote: false", "Owner-gated", "AES-256-GCM", "BACKUP_ENCRYPTION_KEY_B64", "SAMPLE_FIXTURE_ONLY"]) {
  requireText(`${readme}\n${doc}\n${plan}`, token, `documentation ${token}`);
}

if (packageJson?.scripts?.["test:m2a-private-r2-recoverability-fixture"] !== "node --experimental-strip-types --experimental-loader ./scripts/m2a-node-ts-extension-loader.mjs scripts/test-m2a-private-r2-recoverability-fixture.mjs") {
  failures.push("missing fixture test package script");
}
if (packageJson?.scripts?.["check:m2a-private-r2-recoverability"] !== "node scripts/check-m2a-private-r2-recoverability.cjs") {
  failures.push("missing recoverability checker package script");
}

if (failures.length) {
  console.error("M2A private R2 recoverability check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("M2A private R2 recoverability check passed.");
