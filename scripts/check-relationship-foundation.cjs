const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();

const requiredPaths = [
  "db/migrations/20260614_0004_relationship_foundation.sql",
  "lib/family/revision-service.ts",
  "lib/family/relationship-types.ts",
  "lib/family/relationship-validation.ts",
  "lib/family/relationship-graph.ts",
  "lib/family/relationship-service.ts",
  "app/(admin)/admin/relationships/actions.ts",
  "app/(admin)/admin/relationships/page.tsx",
  "components/relationships/relationship-form.tsx",
  "components/relationships/couple-form.tsx",
  "components/relationships/relationship-summary.tsx",
  "docs/99_NEXT_AI_HANDOFF.md",
];

const missing = requiredPaths.filter((relativePath) => {
  return !fs.existsSync(path.join(root, relativePath));
});

const packageJson = JSON.parse(
  fs.readFileSync(path.join(root, "package.json"), "utf8"),
);

if (!packageJson.scripts?.["check:relationships"]) {
  missing.push("package.json scripts.check:relationships");
}

const migration = fs.readFileSync(
  path.join(root, "db/migrations/20260614_0004_relationship_foundation.sql"),
  "utf8",
);

for (const tableName of [
  "families",
  "family_parents",
  "family_children",
  "couple_relationships",
]) {
  if (!migration.includes(`public.${tableName}`)) {
    missing.push(`migration table ${tableName}`);
  }
}

for (const forbidden of ["father_id", "mother_id", "spouse_id"]) {
  if (new RegExp(`\\n\\s*${forbidden}\\s+`).test(migration)) {
    missing.push(`forbidden relationship column ${forbidden}`);
  }
}

const service = fs.readFileSync(
  path.join(root, "lib/family/relationship-service.ts"),
  "utf8",
);

for (const permission of [
  "relationships.view",
  "relationships.create",
  "relationships.update",
  "relationships.delete",
]) {
  if (!service.includes(permission)) {
    missing.push(`service permission ${permission}`);
  }
}

if (missing.length > 0) {
  console.error("Relationship foundation check failed. Missing:");
  for (const item of missing) {
    console.error(`- ${item}`);
  }
  process.exit(1);
}

console.log("Relationship foundation check passed.");
