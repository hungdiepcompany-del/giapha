const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();

const requiredPaths = [
  "lib/family/revision-types.ts",
  "lib/family/revision-service.ts",
  "lib/family/revision-diff.ts",
  "app/(admin)/admin/revisions/page.tsx",
  "app/(admin)/admin/revisions/[id]/page.tsx",
  "docs/99_NEXT_AI_HANDOFF.md",
];

const missing = requiredPaths.filter((relativePath) => {
  return !fs.existsSync(path.join(root, relativePath));
});

const packageJson = JSON.parse(
  fs.readFileSync(path.join(root, "package.json"), "utf8"),
);

if (!packageJson.scripts?.["check:revisions"]) {
  missing.push("package.json scripts.check:revisions");
}

const revisionService = fs.readFileSync(
  path.join(root, "lib/family/revision-service.ts"),
  "utf8",
);

for (const exportedName of [
  "listRevisions",
  "getRevisionDetail",
  "listRevisionsForEntity",
]) {
  if (!revisionService.includes(exportedName)) {
    missing.push(`revision-service ${exportedName}`);
  }
}

const revisionDiff = fs.readFileSync(
  path.join(root, "lib/family/revision-diff.ts"),
  "utf8",
);

if (!revisionDiff.includes("buildRevisionDiff")) {
  missing.push("revision-diff buildRevisionDiff");
}

if (missing.length > 0) {
  console.error("Revision history foundation check failed. Missing:");
  for (const item of missing) {
    console.error(`- ${item}`);
  }
  process.exit(1);
}

console.log("Revision history foundation check passed.");
