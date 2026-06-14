const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();

const requiredPaths = [
  "app/auth/callback/route.ts",
  "app/auth/logout/route.ts",
  "app/unauthorized/page.tsx",
  "lib/auth/profile-service.ts",
  "lib/permissions/permission-service.ts",
  "lib/permissions/require-permission.ts",
  "db/migrations/20260614_0002_auth_permission_hardening.sql",
  "db/snippets/assign-owner-role.sql",
  "docs/99_NEXT_AI_HANDOFF.md",
];

const missing = requiredPaths.filter((relativePath) => {
  return !fs.existsSync(path.join(root, relativePath));
});

const packageJsonPath = path.join(root, "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

if (!packageJson.scripts?.["check:auth-permissions"]) {
  missing.push("package.json scripts.check:auth-permissions");
}

if (missing.length > 0) {
  console.error("Auth/permission check failed. Missing:");
  for (const item of missing) {
    console.error(`- ${item}`);
  }
  process.exit(1);
}

console.log("Auth/permission check passed.");
