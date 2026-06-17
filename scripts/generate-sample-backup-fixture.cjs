const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const PREFIX = "[backup:fixture:generate]";
const outputDir = path.join(process.cwd(), "fixtures", "backup");
const fixturePath = path.join(outputDir, "sample-family.fixture.json");
const manifestPath = path.join(outputDir, "sample-family.manifest.fixture.json");

function sha256Hex(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function buildFixture() {
  return {
    metadata: {
      project: "gia-pha",
      environment: "fixture",
      fixture_marker: "SAMPLE_FIXTURE_ONLY",
      schema_version: "fixture-1.0.0",
      created_at: "2026-06-17T08:30:00+07:00",
      contains_real_data: false,
      contains_secret: false,
      notes: "Static sample fixture for backup automation readiness checks.",
    },
    people: [
      {
        id: "sample-root",
        display_name: "Sample Root",
        gender: "unknown",
        visibility: "private",
        is_living: false,
      },
      {
        id: "sample-parent",
        display_name: "Sample Parent",
        gender: "unknown",
        visibility: "family",
        is_living: true,
      },
      {
        id: "sample-child",
        display_name: "Sample Child",
        gender: "unknown",
        visibility: "family",
        is_living: true,
      },
      {
        id: "sample-relative",
        display_name: "Sample Relative",
        gender: "unknown",
        visibility: "public",
        is_living: true,
      },
    ],
    families: [
      {
        id: "sample-family-1",
        family_label: "Sample Fixture Family",
        visibility: "family",
      },
    ],
    family_parents: [
      {
        family_id: "sample-family-1",
        person_id: "sample-parent",
        parent_role: "parent",
      },
    ],
    family_children: [
      {
        family_id: "sample-family-1",
        person_id: "sample-child",
        child_relationship_type: "biological",
      },
      {
        family_id: "sample-family-1",
        person_id: "sample-relative",
        child_relationship_type: "adopted",
      },
    ],
    privacy_flags: {
      has_private_records: true,
      has_family_records: true,
      has_public_records: true,
    },
  };
}

function buildManifest(fixture, fixtureContent) {
  return {
    project: "gia-pha",
    environment: "fixture",
    backup_type: "sample_fixture",
    fixture_marker: "SAMPLE_FIXTURE_ONLY",
    created_at: fixture.metadata.created_at,
    schema_version: fixture.metadata.schema_version,
    contains_real_data: false,
    contains_secret: false,
    fixture_file: "sample-family.fixture.json",
    people_count: fixture.people.length,
    relationship_count:
      fixture.family_parents.length + fixture.family_children.length,
    checksum_algorithm: "sha256",
    fixture_checksum_sha256: sha256Hex(fixtureContent),
  };
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
    assert(!pattern.test(serialized), "fixture contains a secret-like pattern");
  }
}

function main() {
  const fixture = buildFixture();
  const fixtureContent = `${JSON.stringify(fixture, null, 2)}\n`;
  const manifest = buildManifest(fixture, fixtureContent);
  const manifestContent = `${JSON.stringify(manifest, null, 2)}\n`;

  assert(fixture.metadata.environment === "fixture", "fixture environment mismatch");
  assert(fixture.metadata.contains_real_data === false, "fixture must be fake data");
  assert(fixture.metadata.contains_secret === false, "fixture must not contain secret");
  assert(fixture.people.length >= 3 && fixture.people.length <= 5, "fixture member count invalid");
  scanForSecretPatterns({ fixture, manifest });

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(fixturePath, fixtureContent, "utf8");
  fs.writeFileSync(manifestPath, manifestContent, "utf8");

  console.log(`${PREFIX} SAMPLE_FIXTURE_ONLY`);
  console.log(`${PREFIX} Fixture file: PASS`);
  console.log(`${PREFIX} Manifest file: PASS`);
  console.log(`${PREFIX} Secret pattern scan: PASS`);
  console.log(`${PREFIX} Result: PASS`);
}

try {
  main();
} catch (error) {
  console.error(`${PREFIX} Result: FAIL`);
  console.error(`${PREFIX} ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
