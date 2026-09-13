const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const workflowPath = path.join(root, ".github/workflows/backup-service-deploy.yml");
const failures = [];
const workflow = fs.existsSync(workflowPath) ? fs.readFileSync(workflowPath, "utf8") : "";

function requireText(token) {
  if (!workflow.includes(token)) failures.push(`missing ${token}`);
}

function rejectText(token) {
  if (workflow.includes(token)) failures.push(`forbidden ${token}`);
}

for (const token of [
  "workflow_dispatch:",
  "Manual upload-only",
  "BACKUP_SERVICE_INTERNAL_TOKEN: ${{ secrets.BACKUP_SERVICE_INTERNAL_TOKEN }}",
  "BACKUP_DATA_KEY_V1_B64: ${{ secrets.BACKUP_DATA_KEY_V1_B64 }}",
  "BACKUP_OBJECT_KEY_HMAC_V1_B64: ${{ secrets.BACKUP_OBJECT_KEY_HMAC_V1_B64 }}",
  "umask 077",
  "chmod 600 \"$SECRETS_FILE\"",
  "trap 'rm -f \"$SECRETS_FILE\"' EXIT",
  "wrangler versions upload --env production --secrets-file \"$SECRETS_FILE\"",
]) requireText(token);

for (const token of ["inputs:", "action:", "version_id:", "schedule:", "push:", "pull_request:", "wrangler deploy", "wrangler versions deploy", "actions/upload-artifact", "echo \"${BACKUP_SERVICE"]) rejectText(token);

if (failures.length) {
  console.error("Backup service Worker GitHub Actions deploy readiness check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup service Worker GitHub Actions deploy readiness check passed.");
