const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const PREFIX = "[restore:dry-run]";
const fixturePath = path.join(process.cwd(), "fixtures", "backup", "sample-family.fixture.json");
const manifestPath = path.join(process.cwd(), "fixtures", "backup", "sample-family.manifest.fixture.json");
const allowedVisibility = new Set(["private", "family", "public"]);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readTextFile(absolutePath, label) {
  assert(fs.existsSync(absolutePath), `${label} file is missing`);
  return fs.readFileSync(absolutePath, "utf8");
}

function readJsonFile(absolutePath, label) {
  return JSON.parse(readTextFile(absolutePath, label));
}

function sha256Hex(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function assertUnique(items, getKey, label) {
  const seen = new Set();
  for (const item of items) {
    const key = getKey(item);
    assert(typeof key === "string" && key.length > 0, `${label} id missing`);
    assert(!seen.has(key), `${label} id duplicated: ${key}`);
    seen.add(key);
  }
  return seen;
}

function relationshipCount(fixture) {
  return fixture.family_parents.length + fixture.family_children.length;
}

function verifyManifestIntegrity(fixtureText, fixture, manifest) {
  assert(fixture.metadata?.environment === "fixture", "fixture environment mismatch");
  assert(fixture.metadata.fixture_marker === "SAMPLE_FIXTURE_ONLY", "fixture marker mismatch");
  assert(fixture.metadata.contains_real_data === false, "fixture must not contain real data");
  assert(fixture.metadata.contains_secret === false, "fixture must not contain secret data");
  assert(manifest.environment === "fixture", "manifest environment mismatch");
  assert(manifest.backup_type === "sample_fixture", "manifest backup type mismatch");
  assert(manifest.contains_real_data === false, "manifest must not contain real data");
  assert(manifest.contains_secret === false, "manifest must not contain secret data");
  assert(manifest.people_count === fixture.people.length, "manifest people count mismatch");
  assert(manifest.relationship_count === relationshipCount(fixture), "manifest relationship count mismatch");
  assert(manifest.checksum_algorithm === "sha256", "manifest checksum algorithm mismatch");
  assert(manifest.fixture_checksum_sha256 === sha256Hex(fixtureText), "fixture checksum mismatch");
}

function verifyGraph(fixture) {
  assert(Array.isArray(fixture.people), "people must be an array");
  assert(Array.isArray(fixture.families), "families must be an array");
  assert(Array.isArray(fixture.family_parents), "family_parents must be an array");
  assert(Array.isArray(fixture.family_children), "family_children must be an array");

  const peopleIds = assertUnique(fixture.people, (person) => person.id, "person");
  const familyIds = assertUnique(fixture.families, (family) => family.id, "family");
  const childIdsWithParentCoverage = new Set();

  for (const parent of fixture.family_parents) {
    assert(familyIds.has(parent.family_id), `parent family missing: ${parent.family_id}`);
    assert(peopleIds.has(parent.person_id), `parent person missing: ${parent.person_id}`);
  }

  for (const child of fixture.family_children) {
    assert(familyIds.has(child.family_id), `child family missing: ${child.family_id}`);
    assert(peopleIds.has(child.person_id), `child person missing: ${child.person_id}`);
    const hasParentForFamily = fixture.family_parents.some((parent) => parent.family_id === child.family_id);
    assert(hasParentForFamily, `child family has no parent edge: ${child.family_id}`);
    childIdsWithParentCoverage.add(child.person_id);
  }

  for (const expectedChildId of ["sample-child", "sample-relative"]) {
    assert(childIdsWithParentCoverage.has(expectedChildId), `${expectedChildId} must have parent coverage`);
  }
}

function verifyPrivacy(fixture) {
  for (const person of fixture.people) {
    assert(allowedVisibility.has(person.visibility), `unknown person visibility: ${person.visibility}`);
    assert(typeof person.is_living === "boolean", `is_living must be boolean for ${person.id}`);
  }

  for (const family of fixture.families) {
    assert(allowedVisibility.has(family.visibility), `unknown family visibility: ${family.visibility}`);
  }

  for (const [key, value] of Object.entries(fixture.privacy_flags || {})) {
    assert(typeof value === "boolean", `privacy flag must be boolean: ${key}`);
  }

  assert(Object.keys(fixture.privacy_flags || {}).length >= 3, "privacy flags are incomplete");
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

function buildRestorePlan(fixture) {
  return {
    people_to_validate: fixture.people.length,
    families_to_validate: fixture.families.length,
    relationship_edges_to_validate: relationshipCount(fixture),
    execution: "SKIPPED",
  };
}

function main() {
  const fixtureText = readTextFile(fixturePath, "fixture");
  const fixture = readJsonFile(fixturePath, "fixture");
  const manifest = readJsonFile(manifestPath, "manifest");

  verifyManifestIntegrity(fixtureText, fixture, manifest);
  verifyGraph(fixture);
  verifyPrivacy(fixture);
  scanForSecretPatterns({ fixture, manifest });
  const plan = buildRestorePlan(fixture);

  assert(plan.execution === "SKIPPED", "restore execution must be skipped");

  console.log(`${PREFIX} RESTORE_DRY_RUN_ONLY`);
  console.log(`${PREFIX} Manifest integrity: PASS`);
  console.log(`${PREFIX} Graph validation: PASS`);
  console.log(`${PREFIX} Privacy validation: PASS`);
  console.log(`${PREFIX} Restore execution: SKIPPED`);
  console.log(`${PREFIX} Result: PASS`);
}

try {
  main();
} catch (error) {
  console.error(`${PREFIX} Result: FAIL`);
  console.error(`${PREFIX} ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
