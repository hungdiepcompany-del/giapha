const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const marker = "MAIN_APP_BACKUP_SERVICE_BINDING_SMOKE_ONLY";
const failures = [];

function log(line) {
  console.log(`[smoke:main-app-backup-service-binding] ${line}`);
}

function readRequired(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

log(marker);

const adapter = readRequired("server/services/backup-service-client.ts");
const guardrail = readRequired("scripts/check-backup-service-binding-guardrails.cjs");
const operatorContract = readRequired("scripts/check-backup-operator-api-dry-run-contract.cjs");
const packageJsonText = readRequired("package.json");

requireIncludes(adapter, "MAIN_APP_BACKUP_SERVICE_CLIENT_DRY_RUN_ONLY", "adapter dry-run marker");
requireIncludes(adapter, "backupServiceHealth", "adapter health action");
requireIncludes(adapter, "backupServiceDryRun", "adapter dryRun action");
requireIncludes(adapter, "backupServiceFixtureVerify", "adapter fixtureVerify action");
requireIncludes(adapter, "BackupServiceClientEnvelope", "adapter envelope type");
requireIncludes(adapter, "backup_service_network_disabled", "network disabled guard");
requireIncludes(guardrail, "Backup service binding guardrail check passed", "guardrail checker");
requireIncludes(operatorContract, "Backup operator API dry-run contract check passed", "operator API checker");
requireIncludes(packageJsonText, "\"check:backup-service-binding-guardrails\"", "guardrail package script");
requireIncludes(packageJsonText, "\"check:main-app-backup-service-client-dry-run-adapter\"", "adapter package script");
requireIncludes(packageJsonText, "\"smoke:main-app-backup-service-binding\"", "smoke package script");

if (failures.length > 0) {
  for (const failure of failures) log(`FAIL ${failure}`);
  process.exit(1);
}

log("Adapter: PASS");
log("Guardrail checker: PASS");
log("Operator API contract: PASS");
log("Package scripts: PASS");
log("Network execution: SKIPPED");
log("Result: PASS");
