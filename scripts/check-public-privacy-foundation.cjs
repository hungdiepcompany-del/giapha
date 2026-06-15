const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();

const requiredPaths = [
  "lib/privacy/privacy-service.ts",
  "lib/privacy/privacy-types.ts",
  "lib/family/public-family-service.ts",
  "app/(public)/tree/page.tsx",
  "app/(public)/people/[slug]/page.tsx",
  "app/(admin)/admin/preview/public/page.tsx",
  "components/public/public-home.tsx",
  "components/public/public-person-profile.tsx",
  "components/public/public-tree-shell.tsx",
  "docs/04_PERMISSION_PRIVACY_MODEL.md",
  "docs/99_NEXT_AI_HANDOFF.md",
];

const missing = requiredPaths.filter((relativePath) => {
  return !fs.existsSync(path.join(root, relativePath));
});

const packageJson = JSON.parse(
  fs.readFileSync(path.join(root, "package.json"), "utf8"),
);

if (!packageJson.scripts?.["check:public-privacy"]) {
  missing.push("package.json scripts.check:public-privacy");
}

const privacyService = fs.readFileSync(
  path.join(root, "lib/privacy/privacy-service.ts"),
  "utf8",
);

for (const exportedName of [
  "canShowPersonInMode",
  "toPublicPerson",
  "sanitizePersonForMode",
  "sanitizeTreeGraphForMode",
]) {
  if (!privacyService.includes(exportedName)) {
    missing.push(`privacy-service ${exportedName}`);
  }
}

if (privacyService.includes("notes_private") && privacyService.includes("PublicPerson &")) {
  missing.push("PublicPerson includes notes_private");
}

const publicService = fs.readFileSync(
  path.join(root, "lib/family/public-family-service.ts"),
  "utf8",
);

for (const exportedName of [
  "getPublicFamilyTreeGraph",
  "getPublicPersonProfile",
  "getPublicFamilyStats",
]) {
  if (!publicService.includes(exportedName)) {
    missing.push(`public-family-service ${exportedName}`);
  }
}

if (missing.length > 0) {
  console.error("Public/privacy foundation check failed. Missing:");
  for (const item of missing) {
    console.error(`- ${item}`);
  }
  process.exit(1);
}

console.log("Public/privacy foundation check passed.");
