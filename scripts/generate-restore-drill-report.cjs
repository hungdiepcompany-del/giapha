const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const PREFIX = "[restore:drill:report]";
const backupDir = path.join(process.cwd(), "fixtures", "backup");
const reportDir = path.join(backupDir, "reports");
const fixtureName = "sample-family.fixture.json";
const manifestName = "sample-family.manifest.fixture.json";
const reportName = "sample-restore-drill-report.fixture.json";
const allowedVisibility = new Set(["private", "family", "public"]);

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

function relationshipCount(fixture) {
  return fixture.family_parents.length + fixture.family_children.length;
}

function validateManifest(fixtureText, fixture, manifest) {
  assert(fixture.metadata?.environment === "fixture", "fixture environment mismatch");
  assert(manifest.environment === "fixture", "manifest environment mismatch");
  assert(manifest.contains_real_data === false, "manifest must not contain real data");
  assert(manifest.contains_secret === false, "manifest must not contain secret data");
  assert(manifest.people_count === fixture.people.length, "manifest people count mismatch");
  assert(manifest.relationship_count === relationshipCount(fixture), "manifest relationship count mismatch");
  assert(manifest.fixture_checksum_sha256 === sha256Hex(fixtureText), "fixture checksum mismatch");
}

function validateGraph(fixture) {
  const peopleIds = new Set(fixture.people.map((person) => person.id));
  const familyIds = new Set(fixture.families.map((family) => family.id));

  assert(peopleIds.size === fixture.people.length, "person ids must be unique");
  assert(familyIds.size === fixture.families.length, "family ids must be unique");

  for (const parent of fixture.family_parents) {
    assert(familyIds.has(parent.family_id), `parent family missing: ${parent.family_id}`);
    assert(peopleIds.has(parent.person_id), `parent person missing: ${parent.person_id}`);
  }

  for (const child of fixture.family_children) {
    assert(familyIds.has(child.family_id), `child family missing: ${child.family_id}`);
    assert(peopleIds.has(child.person_id), `child person missing: ${child.person_id}`);
  }
}

function validatePrivacy(fixture) {
  for (const person of fixture.people) {
    assert(allowedVisibility.has(person.visibility), `unknown person visibility: ${person.visibility}`);
    assert(typeof person.is_living === "boolean", `is_living must be boolean for ${person.id}`);
  }

  for (const family of fixture.families) {
    assert(allowedVisibility.has(family.visibility), `unknown family visibility: ${family.visibility}`);
  }
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
    assert(!pattern.test(serialized), "restore drill report contains a secret-like pattern");
  }
}

function writeReport(report) {
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(path.join(reportDir, reportName), `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

function main() {
  const fixturePath = path.join(backupDir, fixtureName);
  const manifestPath = path.join(backupDir, manifestName);
  const fixtureText = readText(fixturePath, "fixture");
  const manifestText = readText(manifestPath, "manifest");
  const fixture = JSON.parse(fixtureText);
  const manifest = JSON.parse(manifestText);

  validateManifest(fixtureText, fixture, manifest);
  validateGraph(fixture);
  validatePrivacy(fixture);
  scanForSecretPatterns({ fixture, manifest });

  const report = {
    marker: "RESTORE_DRILL_REPORT_ONLY",
    timestamp: "2026-06-17T08:30:00+07:00",
    environment: "fixture-dry-run",
    fixtureFilename: fixtureName,
    manifestFilename: manifestName,
    manifestStatus: "PASS",
    memberGraphStatus: "PASS",
    privacyStatus: "PASS",
    secretScanStatus: "PASS",
    result: "PASS",
    noProductionMutation: true,
    restoreExecution: "SKIPPED",
    noProductionBackupCreated: true,
    fixtureChecksum: sha256Hex(fixtureText),
    manifestChecksum: sha256Hex(manifestText),
    notes: "Fixture-only restore drill report. No production mutation.",
  };

  scanForSecretPatterns(report);
  writeReport(report);

  console.log(`${PREFIX} RESTORE_DRILL_REPORT_ONLY`);
  console.log(`${PREFIX} Manifest status: PASS`);
  console.log(`${PREFIX} Member graph status: PASS`);
  console.log(`${PREFIX} Privacy status: PASS`);
  console.log(`${PREFIX} Secret scan status: PASS`);
  console.log(`${PREFIX} Report file: PASS`);
  console.log(`${PREFIX} Result: PASS`);
}

try {
  main();
} catch (error) {
  console.error(`${PREFIX} Result: FAIL`);
  console.error(`${PREFIX} ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
