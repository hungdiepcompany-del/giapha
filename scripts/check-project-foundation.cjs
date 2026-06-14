const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();

const requiredPaths = [
  "package.json",
  "app",
  "lib/supabase/client.ts",
  "lib/supabase/server.ts",
  "lib/supabase/admin.ts",
  "db/migrations",
  "docs/99_NEXT_AI_HANDOFF.md",
  "AGENTS.md",
];

const missing = requiredPaths.filter((relativePath) => {
  return !fs.existsSync(path.join(root, relativePath));
});

const migrationsDir = path.join(root, "db", "migrations");
const hasFoundationMigration =
  fs.existsSync(migrationsDir) &&
  fs
    .readdirSync(migrationsDir)
    .some((fileName) =>
      /foundation_auth_roles_permissions\.sql$/.test(fileName),
    );

if (!hasFoundationMigration) {
  missing.push("db/migrations/*foundation_auth_roles_permissions.sql");
}

if (missing.length > 0) {
  console.error("Foundation check failed. Missing:");
  for (const item of missing) {
    console.error(`- ${item}`);
  }
  process.exit(1);
}

console.log("Foundation check passed.");
