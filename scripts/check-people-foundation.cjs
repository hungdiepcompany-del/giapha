const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();

const requiredPaths = [
  "db/migrations/20260614_0003_people_foundation.sql",
  "lib/family/people-types.ts",
  "lib/family/people-validation.ts",
  "lib/family/people-service.ts",
  "app/(admin)/admin/people/page.tsx",
  "app/(admin)/admin/people/new/page.tsx",
  "app/(admin)/admin/people/[id]/page.tsx",
  "components/people/person-form.tsx",
  "components/people/person-list.tsx",
  "docs/99_NEXT_AI_HANDOFF.md",
];

const missing = requiredPaths.filter((relativePath) => {
  return !fs.existsSync(path.join(root, relativePath));
});

const packageJson = JSON.parse(
  fs.readFileSync(path.join(root, "package.json"), "utf8"),
);

if (!packageJson.scripts?.["check:people"]) {
  missing.push("package.json scripts.check:people");
}

if (missing.length > 0) {
  console.error("People foundation check failed. Missing:");
  for (const item of missing) {
    console.error(`- ${item}`);
  }
  process.exit(1);
}

console.log("People foundation check passed.");
