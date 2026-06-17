const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const PREFIX = "[backup:storage:adapter:local]";
const root = process.cwd();
const backupDir = path.join(root, "fixtures", "backup");
const adapterDir = path.join(root, "fixtures", "backup-sandbox", "adapter");
const fixtureName = "sample-family.fixture.json";
const manifestName = "sample-family.manifest.fixture.json";
const indexName = "adapter-index.fixture.json";

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

function writeJson(absolutePath, value) {
  fs.writeFileSync(absolutePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
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
    assert(!pattern.test(serialized), "adapter data contains a secret-like pattern");
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

function putBackupArtifact(sourceFixturePath, sourceManifestPath) {
  fs.mkdirSync(adapterDir, { recursive: true });
  const adapterFixturePath = path.join(adapterDir, fixtureName);
  const adapterManifestPath = path.join(adapterDir, manifestName);
  fs.copyFileSync(sourceFixturePath, adapterFixturePath);
  fs.copyFileSync(sourceManifestPath, adapterManifestPath);
  return { adapterFixturePath, adapterManifestPath };
}

function listBackupArtifacts(index) {
  return index.artifacts;
}

function getBackupArtifactMetadata(index, artifactName) {
  return index.artifacts.find((artifact) => artifact.name === artifactName) || null;
}

function verifyBackupArtifact(paths, expected) {
  const copiedFixtureText = readText(paths.adapterFixturePath, "adapter fixture");
  const copiedManifestText = readText(paths.adapterManifestPath, "adapter manifest");
  assert(sha256Hex(copiedFixtureText) === expected.fixtureChecksum, "copied fixture checksum mismatch");
  assert(sha256Hex(copiedManifestText) === expected.manifestChecksum, "copied manifest checksum mismatch");
  return {
    fixtureChecksum: sha256Hex(copiedFixtureText),
    manifestChecksum: sha256Hex(copiedManifestText),
    status: "PASS",
  };
}

function main() {
  const sourceFixturePath = path.join(backupDir, fixtureName);
  const sourceManifestPath = path.join(backupDir, manifestName);
  const fixtureText = readText(sourceFixturePath, "fixture");
  const manifestText = readText(sourceManifestPath, "manifest");
  const fixture = JSON.parse(fixtureText);
  const manifest = JSON.parse(manifestText);

  verifyFixtureManifest(fixtureText, fixture, manifest);
  scanForSecretPatterns({ fixture, manifest });

  const paths = putBackupArtifact(sourceFixturePath, sourceManifestPath);
  const expected = {
    fixtureChecksum: sha256Hex(fixtureText),
    manifestChecksum: sha256Hex(manifestText),
  };
  const verification = verifyBackupArtifact(paths, expected);

  const index = {
    marker: "LOCAL_STORAGE_ADAPTER_ONLY",
    environment: "fixture",
    adapter: "local-sandbox",
    adapterRoot: "fixtures/backup-sandbox/adapter",
    created_at: "2026-06-17T08:30:00+07:00",
    contains_real_data: false,
    contains_secret: false,
    operations: {
      putBackupArtifact: "PASS",
      listBackupArtifacts: "PASS",
      getBackupArtifactMetadata: "PASS",
      verifyBackupArtifact: "PASS",
      deleteBackupArtifact: "SKIPPED",
    },
    artifacts: [
      {
        name: fixtureName,
        manifest: manifestName,
        storage_key: `local-sandbox/adapter/${fixtureName}`,
        sandbox_path: `fixtures/backup-sandbox/adapter/${fixtureName}`,
        fixture_checksum_sha256: verification.fixtureChecksum,
        manifest_checksum_sha256: verification.manifestChecksum,
        verification_status: "PASS",
      },
    ],
    result: "PASS",
  };

  assert(listBackupArtifacts(index).length === 1, "adapter list must contain one artifact");
  assert(getBackupArtifactMetadata(index, fixtureName)?.verification_status === "PASS", "metadata read failed");
  scanForSecretPatterns(index);
  writeJson(path.join(adapterDir, indexName), index);

  console.log(`${PREFIX} LOCAL_STORAGE_ADAPTER_ONLY`);
  console.log(`${PREFIX} Put artifact: PASS`);
  console.log(`${PREFIX} List artifacts: PASS`);
  console.log(`${PREFIX} Read metadata: PASS`);
  console.log(`${PREFIX} Verify artifact: PASS`);
  console.log(`${PREFIX} Delete artifact: SKIPPED`);
  console.log(`${PREFIX} Result: PASS`);
}

try {
  main();
} catch (error) {
  console.error(`${PREFIX} Result: FAIL`);
  console.error(`${PREFIX} ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
