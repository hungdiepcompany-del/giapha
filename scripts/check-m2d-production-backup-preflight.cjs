const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const failures = [];

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function requireText(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

function rejectText(content, token, label = token) {
  if (content.includes(token)) failures.push(`forbidden ${label}`);
}

const configText = read("services/backup-service/wrangler.jsonc");
const worker = read("services/backup-service/src/index.ts");
const crypto = read("services/backup-service/src/production-crypto.ts");
const preflight = read("services/backup-service/src/production-preflight.ts");
const mainWrangler = read("wrangler.toml");
const client = read("server/services/backup-service-client.ts");
const route = read("app/api/admin/backups/service-preflight/route.ts");
const workflow = read(".github/workflows/backup-service-deploy.yml");
const test = read("scripts/test-m2d-production-backup-preflight.mjs");
const doc = read("docs/M2D_PRODUCTION_BACKUP_PRIVATE_PREFLIGHT_CONTRACT.md");

let config;
try {
  config = JSON.parse(configText);
} catch {
  failures.push("wrangler config is not strict JSON");
}

if (config) {
  if (config.workers_dev !== false || config.preview_urls !== false) failures.push("top-level worker must disable workers.dev and preview URLs");
  if (Object.hasOwn(config, "route") || Object.hasOwn(config, "routes") || Object.hasOwn(config, "triggers")) failures.push("public routes or cron are forbidden");
  const production = config.env?.production;
  if (!production || production.vars?.BACKUP_SERVICE_MODE !== "production" || production.vars?.BACKUP_ACTIVE_KEY_VERSION !== "v1") failures.push("production mode/version contract missing");
  if (production?.workers_dev !== false || production?.preview_urls !== false) failures.push("production workers.dev and preview URLs must be disabled");
  const binding = production?.r2_buckets?.find((entry) => entry.binding === "BACKUP_BUCKET");
  if (!binding || binding.bucket_name !== "gia-pha-prod-backups-apac-v1" || Object.hasOwn(binding, "preview_bucket_name")) failures.push("exact private production R2 binding missing");
  const secrets = production?.secrets?.required || [];
  const expectedSecrets = ["BACKUP_SERVICE_INTERNAL_TOKEN", "BACKUP_DATA_KEY_V1_B64", "BACKUP_OBJECT_KEY_HMAC_V1_B64"];
  if (secrets.length !== expectedSecrets.length || expectedSecrets.some((name) => !secrets.includes(name))) failures.push("production secret names must be exact");
  const fixture = config.env?.["fixture-local"];
  if (!fixture || fixture.vars?.BACKUP_SERVICE_MODE !== "fixture-local" || fixture.r2_buckets?.[0]?.remote !== false) failures.push("M2A fixture-local isolation changed");
}

for (const token of [
  "/internal/backup/production-preflight",
  "PRODUCTION_PREFLIGHT_SUCCESS_CODE",
  "validateProductionPreflight",
  "timingSafeEqual",
  "handleFixtureRoundTrip",
]) requireText(worker, token, `worker ${token}`);

for (const token of [
  "canonicalBase64To32Bytes",
  "PRODUCTION_DATA_KEY_INVALID",
  "PRODUCTION_OBJECT_KEY_HMAC_INVALID",
  "PRODUCTION_BACKUP_IV_BYTES = 12",
  "crypto.getRandomValues",
  "AES-GCM",
  "protocolVersion",
  "dataKeyVersion",
  "opaqueOperationId",
  "chunkIndex: 0",
  "totalChunks: 1",
  "PRODUCTION_BACKUP_MAX_PLAINTEXT_BYTES = 8 * 1024 * 1024",
  "PRODUCTION_CHUNK_OVERSIZE",
  "deriveOpaqueProductionObjectKey",
]) requireText(crypto, token, `production crypto ${token}`);
for (const forbidden of ["R2Bucket", ".put(", ".get(", ".list(", ".delete(", "fetch("]) rejectText(crypto, forbidden, `production crypto ${forbidden}`);

for (const token of [
  "PRODUCTION_PREFLIGHT_MARKER",
  "BACKUP_SERVICE_MODE !== \"production\"",
  "!env.BACKUP_BUCKET",
  "BACKUP_DATA_KEY_V1_B64",
  "BACKUP_OBJECT_KEY_HMAC_V1_B64",
  "BACKUP_ACTIVE_KEY_VERSION !== \"v1\"",
  "canonicalBase64To32Bytes(env.BACKUP_DATA_KEY_V1_B64, \"PRODUCTION_DATA_KEY_INVALID\")",
  "canonicalBase64To32Bytes(env.BACKUP_OBJECT_KEY_HMAC_V1_B64, \"PRODUCTION_OBJECT_KEY_HMAC_INVALID\")",
]) requireText(preflight, token, `preflight ${token}`);
for (const forbidden of [".put(", ".get(", ".list(", ".delete(", "encrypt", "fetch("]) rejectText(preflight, forbidden, `preflight ${forbidden}`);

for (const token of ["[secrets]", "required = [\"BACKUP_SERVICE_INTERNAL_TOKEN\"]", "[[services]]", "binding = \"BACKUP_SERVICE_PRODUCTION\"", "service = \"web-gia-pha-backup-service-production\""]) requireText(mainWrangler, token, `main Wrangler ${token}`);
for (const token of [
  "import { getCloudflareContext } from \"@opennextjs/cloudflare\"",
  "BACKUP_SERVICE_PRODUCTION",
  "BACKUP_SERVICE_INTERNAL_TOKEN",
  "new Request(`http://backup-service.internal${BACKUP_SERVICE_PRODUCTION_PREFLIGHT_PATH}`",
  "method: \"POST\"",
  "authorization: `Bearer ${token}`",
  "\"x-request-id\": requestId",
  "service.fetch(createProductionPreflightRequest(requestId, token))",
  "isExactProductionPreflightResponse",
]) requireText(client, token, `main client ${token}`);
for (const forbidden of [
  "globalThis.fetch",
  "fetch(\"http",
  "fetch('http",
  "headers: request.headers",
  "...request.headers",
  "new Headers(request.headers)",
  "request.headers",
  "request.body",
  "request.url",
  "Request |",
  "Headers |",
  "cookies(",
  "console.error(",
  "throw error",
  "String(error)",
]) rejectText(client, forbidden, `main client ${forbidden}`);

for (const token of ["import \"server-only\"", "const REQUIRED_DRY_RUN_PERMISSION = \"backup.operator.dry_run\";", "const FALLBACK_DRY_RUN_PERMISSION = \"permissions.manage\";", "backupServiceProductionPreflight", "service_preflight_unavailable", "production_backup: false", "storage_upload: false", "restore: false"]) requireText(route, token, `route ${token}`);
for (const forbidden of ["request.headers", "request.body", "request.url", "process.env", "createClient", "supabase", "storage.from", ".upload(", "cookies(", "console.error(", "throw error", "String(error)"]) rejectText(route, forbidden, `route ${forbidden}`);

for (const token of ["Manual upload-only", "workflow_dispatch", "--secrets-file", "trap 'rm -f \"$SECRETS_FILE\"' EXIT", "umask 077", "chmod 600 \"$SECRETS_FILE\"", "wrangler versions upload --env production", "BACKUP_SERVICE_INTERNAL_TOKEN: ${{ secrets.BACKUP_SERVICE_INTERNAL_TOKEN }}", "BACKUP_DATA_KEY_V1_B64: ${{ secrets.BACKUP_DATA_KEY_V1_B64 }}", "BACKUP_OBJECT_KEY_HMAC_V1_B64: ${{ secrets.BACKUP_OBJECT_KEY_HMAC_V1_B64 }}"]) requireText(workflow, token, `workflow ${token}`);
for (const forbidden of ["inputs:", "action:", "version_id:", "schedule:", "push:", "pull_request:", "wrangler deploy", "wrangler versions deploy", "actions/upload-artifact", "echo \"${BACKUP_SERVICE"]) rejectText(workflow, forbidden, `workflow ${forbidden}`);

for (const token of ["M2D production preflight", "zero R2/data", "fresh IV", "fixture isolation", "Result: PASS"]) requireText(test, token, `test ${token}`);
for (const token of ["source-only", "no public route", "no production backup", "no restore", "separate Owner gate", "BACKUP_DATA_KEY_V1_B64", "BACKUP_OBJECT_KEY_HMAC_V1_B64", "main Worker required secret name", "BACKUP_SERVICE_INTERNAL_TOKEN", "no executable exact-version deployment branch", "protected GitHub environment", "known-good prior version", "private marker-only smoke path", "routing-drift proof", "rollback ordering"]) requireText(doc, token, `doc ${token}`);

if (failures.length) {
  console.error("M2D production backup preflight check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("M2D production backup preflight check passed.");
