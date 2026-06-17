const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const PREFIX = "[backup:storage:sandbox]";
const backupDir = path.join(process.cwd(), "fixtures", "backup");
const sandboxDir = path.join(process.cwd(), "fixtures", "backup-sandbox");
const fixtureName = "sample-family.fixture.json";
const manifestName = "sample-family.manifest.fixture.json";
const indexName = "storage-index.fixture.json";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readText(absolutePath, label) {
  assert(fs.existsSync(absolutePath), `${label} file is missing`);
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
    assert(!pattern.test(serialized), "sandbox data contains a secret-like pattern");
  }
}

function verifyFixtureManifest(fixtureText, fixture, manifest) {
  assert(fixture.metadata?.environment === "fixture", "fixture environment mismatch");
  assert(fixture.metadata.fixture_marker === "SAMPLE_FIXTURE_ONLY", "fixture marker mismatch");
  assert(fixture.metadata.contains_real_data === false, "fixture must not contain real data");
  assert(fixture.metadata.contains_secret === false, "fixture must not contain secret data");
  assert(manifest.environment === "fixture", "manifest environment mismatch");
  assert(manifest.contains_real_data === false, "manifest must not contain real data");
  assert(manifest.contains_secret === false, "manifest must not contain secret data");
  assert(manifest.fixture_file === fixtureName, "manifest fixture file mismatch");
  assert(manifest.fixture_checksum_sha256 === sha256Hex(fixtureText), "fixture checksum mismatch");
}

function writeJson(absolutePath, value) {
  fs.writeFileSync(absolutePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function main() {
  const sourceFixturePath = path.join(backupDir, fixtureName);
  const sourceManifestPath = path.join(backupDir, manifestName);
  const sandboxFixturePath = path.join(sandboxDir, fixtureName);
  const sandboxManifestPath = path.join(sandboxDir, manifestName);
  const sandboxIndexPath = path.join(sandboxDir, indexName);

  const fixtureText = readText(sourceFixturePath, "fixture");
  const manifestText = readText(sourceManifestPath, "manifest");
  const fixture = JSON.parse(fixtureText);
  const manifest = JSON.parse(manifestText);

  verifyFixtureManifest(fixtureText, fixture, manifest);
  scanForSecretPatterns({ fixture, manifest });

  fs.mkdirSync(sandboxDir, { recursive: true });
  fs.copyFileSync(sourceFixturePath, sandboxFixturePath);
  fs.copyFileSync(sourceManifestPath, sandboxManifestPath);

  const index = {
    marker: "LOCAL_SANDBOX_ONLY",
    environment: "fixture",
    storage: "local-sandbox",
    created_at: "2026-06-17T08:30:00+07:00",
    contains_real_data: false,
    contains_secret: false,
    files: [
      {
        name: fixtureName,
        source: `fixtures/backup/${fixtureName}`,
        sandbox_path: `fixtures/backup-sandbox/${fixtureName}`,
        checksum_sha256: sha256Hex(fixtureText),
      },
      {
        name: manifestName,
        source: `fixtures/backup/${manifestName}`,
        sandbox_path: `fixtures/backup-sandbox/${manifestName}`,
        checksum_sha256: sha256Hex(manifestText),
      },
    ],
    result: "PASS",
  };

  scanForSecretPatterns(index);
  writeJson(sandboxIndexPath, index);

  console.log(`${PREFIX} LOCAL_SANDBOX_ONLY`);
  console.log(`${PREFIX} Fixture copied: PASS`);
  console.log(`${PREFIX} Manifest copied: PASS`);
  console.log(`${PREFIX} Storage index: PASS`);
  console.log(`${PREFIX} Secret scan: PASS`);
  console.log(`${PREFIX} Result: PASS`);
}

try {
  main();
} catch (error) {
  console.error(`${PREFIX} Result: FAIL`);
  console.error(`${PREFIX} ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
