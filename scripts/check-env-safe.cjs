const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const envExamplePath = path.join(root, ".env.example");
const envLocalPath = path.join(root, ".env.local");
const requiredKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

function parseEnvFile(filePath) {
  const result = new Map();
  const content = fs.readFileSync(filePath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const equalsIndex = trimmed.indexOf("=");

    if (equalsIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed.slice(equalsIndex + 1).trim();

    result.set(key, value.length > 0);
  }

  return result;
}

const failures = [];
let missingRequiredLocalKey = false;

if (!fs.existsSync(envExamplePath)) {
  failures.push(".env.example missing");
}

console.log(".env.example:", fs.existsSync(envExamplePath) ? "present" : "missing");

if (!fs.existsSync(envLocalPath)) {
  console.log(".env.local: missing");
  console.log("Env safe check passed without local secrets.");
  process.exit(failures.length > 0 ? 1 : 0);
}

console.log(".env.local: present");

const envLocal = parseEnvFile(envLocalPath);

for (const key of requiredKeys) {
  const status = envLocal.get(key) ? "present" : "missing";

  console.log(`${key}: ${status}`);

  if (status === "missing") {
      missingRequiredLocalKey = true;
  }
}

if (failures.length > 0) {
  console.error("Env safe check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

if (missingRequiredLocalKey) {
  console.log("Env safe check passed; Supabase real smoke test is not ready.");
  process.exit(0);
}

console.log("Env safe check passed.");
