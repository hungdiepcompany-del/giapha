const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const PREFIX = "[backup:fixture:verify]";
const fixturePath = path.join(process.cwd(), "fixtures", "backup", "sample-family.fixture.json");
const manifestPath = path.join(process.cwd(), "fixtures", "backup", "sample-family.manifest.fixture.json");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readJsonFile(absolutePath, label) {
  assert(fs.existsSync(absolutePath), `${label} file is missing`);
  return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
}

function readTextFile(absolutePath, label) {
  assert(fs.existsSync(absolutePath), `${label} file is missing`);
  return fs.readFileSync(absolutePath, "utf8");
}

function sha256Hex(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function relationshipCount(fixture) {
  return fixture.family_parents.length + fixture.family_children.length;
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
    assert(!pattern.test(serialized), "fixture data contains a secret-like pattern");
  }
}

function verifyFixture(fixture) {
  assert(fixture.metadata?.project === "gia-pha", "fixture project mismatch");
  assert(fixture.metadata.environment === "fixture", "fixture environment mismatch");
  assert(fixture.metadata.fixture_marker === "SAMPLE_FIXTURE_ONLY", "fixture marker mismatch");
  assert(fixture.metadata.contains_real_data === false, "fixture must not contain real data");
  assert(fixture.metadata.contains_secret === false, "fixture must not contain secret data");
  assert(Array.isArray(fixture.people), "fixture people must be an array");
  assert(fixture.people.length >= 3 && fixture.people.length <= 5, "fixture people count invalid");
  assert(fixture.people.every((person) => person.display_name.startsWith("Sample ")), "fixture must use sample names");
  assert(Array.isArray(fixture.families) && fixture.families.length > 0, "fixture family missing");
  assert(Array.isArray(fixture.family_parents) && fixture.family_parents.length > 0, "fixture parents missing");
  assert(Array.isArray(fixture.family_children) && fixture.family_children.length > 0, "fixture children missing");
}

function verifyManifest(manifest, fixture) {
  assert(manifest.project === "gia-pha", "manifest project mismatch");
  assert(manifest.environment === "fixture", "manifest environment mismatch");
  assert(manifest.backup_type === "sample_fixture", "manifest backup type mismatch");
  assert(manifest.fixture_marker === "SAMPLE_FIXTURE_ONLY", "manifest marker mismatch");
  assert(manifest.contains_real_data === false, "manifest must not contain real data");
  assert(manifest.contains_secret === false, "manifest must not contain secret data");
  assert(manifest.fixture_file === "sample-family.fixture.json", "manifest fixture file mismatch");
  assert(manifest.people_count === fixture.people.length, "manifest people count mismatch");
  assert(manifest.relationship_count === relationshipCount(fixture), "manifest relationship count mismatch");
  assert(manifest.checksum_algorithm === "sha256", "manifest checksum algorithm mismatch");
  assert(typeof manifest.fixture_checksum_sha256 === "string", "manifest checksum missing");
}

function main() {
  const fixtureText = readTextFile(fixturePath, "fixture");
  const fixture = readJsonFile(fixturePath, "fixture");
  const manifest = readJsonFile(manifestPath, "manifest");

  verifyManifest(manifest, fixture);
  verifyFixture(fixture);
  assert(manifest.fixture_checksum_sha256 === sha256Hex(fixtureText), "fixture checksum mismatch");
  scanForSecretPatterns({ fixture, manifest });

  console.log(`${PREFIX} FIXTURE_ONLY`);
  console.log(`${PREFIX} Manifest shape: PASS`);
  console.log(`${PREFIX} Fixture shape: PASS`);
  console.log(`${PREFIX} Checksum: PASS`);
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
