const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const PREFIX = "[backup:storage:verify-upload:dry-run]";
const adapterDir = path.join(process.cwd(), "fixtures", "backup-sandbox", "adapter");
const fixtureName = "sample-family.fixture.json";
const manifestName = "sample-family.manifest.fixture.json";
const indexName = "adapter-index.fixture.json";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readText(absolutePath, label) {
  assert(
    fs.existsSync(absolutePath),
    `${label} file is missing. Run npm run backup:storage:adapter:local first.`,
  );
  return fs.readFileSync(absolutePath, "utf8");
}

function sha256Hex(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function scanForSecretPatterns(value) {
  const serialized = JSON.stringify(value);
  const patterns = [
    /eyJ[A-Za-z0-9_-]{20,}/,
    /sb_[A-Za-z0-9_-]*secret[A-Za-z0-9_-]*/i,
    /password\s*[:=]/i,
    /private[_-]?key\s*[:=]/i,
    /access[_-]?token\s*[:=]/i,
  ];

  for (const pattern of patterns) {
    assert(!pattern.test(serialized), "storage upload dry-run contains a secret-like pattern");
  }
}

function main() {
  const fixturePath = path.join(adapterDir, fixtureName);
  const manifestPath = path.join(adapterDir, manifestName);
  const indexPath = path.join(adapterDir, indexName);

  const fixtureText = readText(fixturePath, "adapter fixture");
  const manifestText = readText(manifestPath, "adapter manifest");
  const indexText = readText(indexPath, "adapter index");

  const fixture = JSON.parse(fixtureText);
  const manifest = JSON.parse(manifestText);
  const index = JSON.parse(indexText);
  const fixtureChecksum = sha256Hex(fixtureText);
  const manifestChecksum = sha256Hex(manifestText);
  const artifact = index.artifacts?.find((item) => item.name === fixtureName);

  assert(index.marker === "LOCAL_STORAGE_ADAPTER_ONLY", "adapter index marker mismatch");
  assert(index.environment === "fixture", "adapter index environment mismatch");
  assert(index.contains_real_data === false, "adapter index must not contain real data");
  assert(index.contains_secret === false, "adapter index must not contain secret data");
  assert(fixture.metadata?.fixture_marker === "SAMPLE_FIXTURE_ONLY", "fixture marker mismatch");
  assert(fixture.metadata.environment === "fixture", "fixture environment mismatch");
  assert(fixture.metadata.contains_real_data === false, "fixture must not contain real data");
  assert(fixture.metadata.contains_secret === false, "fixture must not contain secret data");
  assert(manifest.environment === "fixture", "manifest environment mismatch");
  assert(manifest.contains_real_data === false, "manifest must not contain real data");
  assert(manifest.contains_secret === false, "manifest must not contain secret data");
  assert(manifest.fixture_file === fixtureName, "manifest fixture file mismatch");
  assert(manifest.fixture_checksum_sha256 === fixtureChecksum, "manifest fixture checksum mismatch");
  assert(artifact, "adapter index artifact entry missing");
  assert(artifact.fixture_checksum_sha256 === fixtureChecksum, "adapter index fixture checksum mismatch");
  assert(artifact.manifest_checksum_sha256 === manifestChecksum, "adapter index manifest checksum mismatch");
  assert(artifact.verification_status === "PASS", "adapter index verification status mismatch");

  scanForSecretPatterns({ fixture, manifest, index });

  console.log(`${PREFIX} STORAGE_UPLOAD_VERIFY_DRY_RUN_ONLY`);
  console.log(`${PREFIX} Adapter index: PASS`);
  console.log(`${PREFIX} Manifest checksum: PASS`);
  console.log(`${PREFIX} Fixture marker: PASS`);
  console.log(`${PREFIX} Real data flag: PASS`);
  console.log(`${PREFIX} Secret flag: PASS`);
  console.log(`${PREFIX} Secret scan: PASS`);
  console.log(`${PREFIX} Cloud upload: SKIPPED`);
  console.log(`${PREFIX} Result: PASS`);
}

try {
  main();
} catch (error) {
  console.error(`${PREFIX} Result: FAIL`);
  console.error(`${PREFIX} ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
