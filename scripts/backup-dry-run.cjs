const PREFIX = "[backup:dry-run]";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function timestampParts(date) {
  return {
    datePart: [
      date.getUTCFullYear(),
      pad(date.getUTCMonth() + 1),
      pad(date.getUTCDate()),
    ].join(""),
    timePart: [pad(date.getUTCHours()), pad(date.getUTCMinutes())].join(""),
  };
}

function buildMockBackup() {
  const createdAt = "2026-06-17T08:30:00+07:00";
  const stamp = timestampParts(new Date("2026-06-17T01:30:00Z"));
  const fileName = `gia-pha-backup-${stamp.datePart}-${stamp.timePart}-dry-run.json`;
  const mockData = {
    people: [
      { id: "sample-root", display_name: "Sample Root", visibility: "private" },
      { id: "sample-child", display_name: "Sample Child", visibility: "family" },
    ],
    relationships: [
      { parent_id: "sample-root", child_id: "sample-child", relationship: "parent" },
    ],
  };
  const manifest = {
    project: "gia-pha",
    environment: "dry-run",
    backup_type: "json",
    created_at: createdAt,
    app_commit: "DRY_RUN_COMMIT",
    production_url: "https://web-gia-pha.hungdiepcompany.workers.dev/",
    contains_real_data: false,
    contains_secret: false,
    operator: "dry-run",
    notes: "Static dry-run payload. No files are written.",
    people_count: mockData.people.length,
    relationship_count: mockData.relationships.length,
    restore_compatibility: {
      manifest_present: true,
      members_present: true,
      relationships_present: true,
      privacy_flags_present: true,
      non_production_environment: true,
    },
  };

  return { fileName, manifest, mockData };
}

function validateManifestShape(manifest) {
  const requiredFields = [
    "project",
    "environment",
    "backup_type",
    "created_at",
    "app_commit",
    "production_url",
    "contains_real_data",
    "contains_secret",
    "operator",
    "notes",
    "people_count",
    "relationship_count",
    "restore_compatibility",
  ];

  for (const field of requiredFields) {
    assert(Object.hasOwn(manifest, field), `manifest missing ${field}`);
  }

  assert(manifest.project === "gia-pha", "manifest project mismatch");
  assert(manifest.environment === "dry-run", "manifest must be dry-run");
  assert(manifest.contains_real_data === false, "dry-run cannot contain real data");
  assert(manifest.contains_secret === false, "dry-run cannot contain secret data");
}

function validateNamingConvention(fileName) {
  assert(
    /^gia-pha-backup-\d{8}-\d{4}-dry-run\.json$/.test(fileName),
    "mock filename does not match convention",
  );
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
    assert(!pattern.test(serialized), "mock output contains a secret-like pattern");
  }
}

function validateRestoreCompatibility(manifest, mockData) {
  assert(manifest.restore_compatibility.manifest_present, "manifest check failed");
  assert(mockData.people.length >= 2, "mock members missing");
  assert(mockData.relationships.length >= 1, "mock relationships missing");
  assert(
    mockData.people.every((person) => typeof person.visibility === "string"),
    "privacy flags missing",
  );
  assert(manifest.environment !== "production", "dry-run cannot target production");
}

function main() {
  const backup = buildMockBackup();

  validateManifestShape(backup.manifest);
  validateNamingConvention(backup.fileName);
  scanForSecretPatterns(backup);
  validateRestoreCompatibility(backup.manifest, backup.mockData);

  console.log(`${PREFIX} DRY_RUN_ONLY`);
  console.log(`${PREFIX} No production API calls.`);
  console.log(`${PREFIX} Manifest shape: PASS`);
  console.log(`${PREFIX} Naming convention: PASS`);
  console.log(`${PREFIX} Secret pattern scan: PASS`);
  console.log(`${PREFIX} Restore compatibility checklist: PASS`);
  console.log(`${PREFIX} Result: PASS`);
}

try {
  main();
} catch (error) {
  console.error(`${PREFIX} Result: FAIL`);
  console.error(`${PREFIX} ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
