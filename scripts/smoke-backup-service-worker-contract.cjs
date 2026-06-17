const fs = require("node:fs");
const path = require("node:path");

const PREFIX = "[smoke:backup-service-worker:contract]";
const sourcePath = path.join(process.cwd(), "services", "backup-service", "src", "index.ts");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function main() {
  const source = fs.readFileSync(sourcePath, "utf8");
  assert(source.includes("/health"), "health route missing");
  assert(source.includes("/internal/backup/dry-run"), "dry-run route missing");
  assert(source.includes("/internal/backup/fixture-verify"), "fixture verify route missing");
  assert(source.includes("BACKUP_SERVICE_DRY_RUN_ONLY"), "dry-run marker missing");
  assert(source.includes("Authorization") || source.includes("authorization"), "authorization handling missing");
  assert(source.includes("Bearer "), "bearer handling missing");
  assert(source.includes("401"), "401 handling missing");

  console.log(`${PREFIX} BACKUP_SERVICE_CONTRACT_SMOKE_ONLY`);
  console.log(`${PREFIX} Source routes: PASS`);
  console.log(`${PREFIX} Auth contract: PASS`);
  console.log(`${PREFIX} Dry-run marker: PASS`);
  console.log(`${PREFIX} Runtime execution: SKIPPED`);
  console.log(`${PREFIX} Result: PASS`);
}

try {
  main();
} catch (error) {
  console.error(`${PREFIX} Result: FAIL`);
  console.error(`${PREFIX} ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
