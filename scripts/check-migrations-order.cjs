const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const migrationsDir = path.join(root, "db", "migrations");
const requiredPrefixes = ["0001", "0002", "0003", "0004", "0005", "0006"];
const conflictMarkerPattern = /^(<<<<<<<|=======|>>>>>>>)$/m;
const failures = [];

if (!fs.existsSync(migrationsDir)) {
  failures.push("db/migrations missing");
} else {
  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((fileName) => fileName.endsWith(".sql"));
  const sortedMigrationFiles = [...migrationFiles].sort((a, b) =>
    a.localeCompare(b),
  );

  const prefixes = sortedMigrationFiles.map((fileName) => {
    const match = fileName.match(/^\d{8}_(\d{4})_/);
    return match?.[1] ?? null;
  });

  for (const requiredPrefix of requiredPrefixes) {
    if (!prefixes.includes(requiredPrefix)) {
      failures.push(`migration prefix ${requiredPrefix} missing`);
    }
  }

  const seenPrefixes = new Set();
  for (const prefix of prefixes) {
    if (!prefix) {
      failures.push("migration file without YYYYMMDD_0000_ prefix");
      continue;
    }

    if (seenPrefixes.has(prefix)) {
      failures.push(`duplicate migration prefix ${prefix}`);
    }

    seenPrefixes.add(prefix);
  }

  const numericPrefixes = prefixes
    .filter((prefix) => prefix !== null)
    .map((prefix) => Number(prefix));

  for (let index = 1; index < numericPrefixes.length; index += 1) {
    if (numericPrefixes[index] < numericPrefixes[index - 1]) {
      failures.push("migration prefixes are not ordered by file name");
      break;
    }
  }

  for (const fileName of sortedMigrationFiles) {
    const content = fs.readFileSync(path.join(migrationsDir, fileName), "utf8");

    if (conflictMarkerPattern.test(content)) {
      failures.push(`${fileName} contains conflict marker`);
    }
  }

  console.log("Migrations found:");
  for (const fileName of sortedMigrationFiles) {
    console.log(`- ${fileName}`);
  }
}

if (failures.length > 0) {
  console.error("Migration order check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Migration order check passed.");
