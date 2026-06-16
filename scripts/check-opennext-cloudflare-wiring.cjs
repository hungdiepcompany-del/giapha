const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const root = process.cwd();
const failures = [];

function readFile(relativePath) {
  const absolutePath = path.join(root, relativePath);

  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }

  return fs.readFileSync(absolutePath, "utf8");
}

const packageJsonRaw = readFile("package.json");
const packageJson = packageJsonRaw ? JSON.parse(packageJsonRaw) : {};
const dependencies = {
  ...(packageJson.dependencies || {}),
  ...(packageJson.devDependencies || {}),
};
const scripts = packageJson.scripts || {};

if (!dependencies["@opennextjs/cloudflare"]) {
  failures.push("package.json missing @opennextjs/cloudflare");
}

if (!dependencies.wrangler) {
  failures.push("package.json missing wrangler");
}

for (const scriptName of ["preview", "deploy", "upload", "cf-typegen"]) {
  if (!scripts[scriptName]) {
    failures.push(`package.json missing script ${scriptName}`);
  }
}

readFile("open-next.config.ts");
readFile("docs/99_NEXT_AI_HANDOFF.md");

const wranglerToml = fs.existsSync(path.join(root, "wrangler.toml"))
  ? readFile("wrangler.toml")
  : "";
const wranglerJsonc = fs.existsSync(path.join(root, "wrangler.jsonc"))
  ? readFile("wrangler.jsonc")
  : "";
const wranglerConfig = wranglerToml || wranglerJsonc;

if (!wranglerConfig) {
  failures.push("missing wrangler.toml or wrangler.jsonc");
}

if (!wranglerConfig.includes(".open-next/worker.js")) {
  failures.push("wrangler config missing .open-next/worker.js");
}

if (!wranglerConfig.includes(".open-next/assets")) {
  failures.push("wrangler config missing .open-next/assets");
}

const gitignore = readFile(".gitignore");
if (!/^\.open-next$/m.test(gitignore)) {
  failures.push(".gitignore missing .open-next");
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

if (failures.length > 0) {
  console.error("OpenNext Cloudflare wiring check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("OpenNext Cloudflare wiring check passed.");
