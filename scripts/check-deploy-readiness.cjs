const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const root = process.cwd();

const requiredFiles = [
  "package.json",
  "next.config.ts",
  "wrangler.toml",
  ".env.example",
  "docs/10_SUPABASE_SETUP.md",
  "docs/12_REAL_SUPABASE_SMOKE_TEST_REPORT.md",
  "docs/13_DEPLOY_READINESS.md",
];

const requiredEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_APP_URL",
];

const filesToCheckForConflicts = [
  "README.md",
  "package.json",
  "next.config.ts",
  "wrangler.toml",
  ".env.example",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/10_SUPABASE_SETUP.md",
  "docs/12_REAL_SUPABASE_SMOKE_TEST_REPORT.md",
  "docs/13_DEPLOY_READINESS.md",
  "docs/99_NEXT_AI_HANDOFF.md",
];

const failures = [];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    failures.push(`missing ${file}`);
  }
}

const envExamplePath = path.join(root, ".env.example");
if (fs.existsSync(envExamplePath)) {
  const envExample = fs.readFileSync(envExamplePath, "utf8");

  for (const key of requiredEnv) {
    const match = envExample.match(new RegExp(`^${key}=(.*)$`, "m"));

    if (!match) {
      failures.push(`.env.example missing ${key}`);
      continue;
    }

    if (match[1].trim() !== "") {
      failures.push(`.env.example ${key} must be an empty placeholder`);
    }
  }
}

let trackedEnvLocal = "";
try {
  trackedEnvLocal = execFileSync("git", ["ls-files", ".env.local"], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
} catch {
  failures.push("could not verify git tracking state for .env.local");
}

if (trackedEnvLocal) {
  failures.push(".env.local is tracked by git");
}

for (const file of filesToCheckForConflicts) {
  const absolutePath = path.join(root, file);

  if (!fs.existsSync(absolutePath)) {
    continue;
  }

  const content = fs.readFileSync(absolutePath, "utf8");

  if (/^(<<<<<<<|=======|>>>>>>>)$/m.test(content)) {
    failures.push(`conflict marker in ${file}`);
  }
}

if (failures.length > 0) {
  console.error("Deploy readiness check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Deploy readiness check passed.");
