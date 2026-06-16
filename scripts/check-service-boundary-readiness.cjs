const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const root = process.cwd();
const failures = [];

const requiredFiles = [
  "docs/15_SERVICE_BOUNDARY_WORKER_SPLIT.md",
  "services/_template-worker/README.md",
  "services/_template-worker/src/index.ts",
  "services/_template-worker/wrangler.toml",
  "docs/99_NEXT_AI_HANDOFF.md",
];

const filesToCheckForConflicts = [
  "docs/15_SERVICE_BOUNDARY_WORKER_SPLIT.md",
  "services/_template-worker/README.md",
  "services/_template-worker/package.json",
  "services/_template-worker/wrangler.toml",
  "services/_template-worker/src/index.ts",
];

function readFile(relativePath) {
  const absolutePath = path.join(root, relativePath);

  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }

  return fs.readFileSync(absolutePath, "utf8");
}

for (const file of requiredFiles) {
  readFile(file);
}

const packageJsonRaw = readFile("package.json");
const packageJson = packageJsonRaw ? JSON.parse(packageJsonRaw) : {};
const scripts = packageJson.scripts || {};

if (scripts["check:service-boundary"] !== "node scripts/check-service-boundary-readiness.cjs") {
  failures.push("package.json missing script check:service-boundary");
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
  console.error("Service boundary readiness check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Service boundary readiness check passed.");
