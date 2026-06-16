const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const root = process.cwd();
const failures = [];
const productionUrl = "https://web-gia-pha.hungdiepcompany.workers.dev";

function readFile(relativePath) {
  const absolutePath = path.join(root, relativePath);

  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }

  return fs.readFileSync(absolutePath, "utf8");
}

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) {
    failures.push(`missing ${label}`);
  }
}

function assertNotTracked(relativePath) {
  try {
    const tracked = execFileSync("git", ["ls-files", relativePath], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();

    if (tracked) {
      failures.push(`${relativePath} is tracked by git`);
    }
  } catch {
    failures.push(`could not verify git tracking state for ${relativePath}`);
  }
}

const doc = readFile("docs/16_PRODUCTION_STABILIZATION.md");
requireIncludes(doc, productionUrl, "production URL");
requireIncludes(doc, "Worker name: `web-gia-pha`", "worker name");

for (const route of ["/", "/tree", "/auth/login", "/admin", "/admin/system/status"]) {
  requireIncludes(doc, `- \`${route}\``, `route smoke checklist ${route}`);
}

for (const section of [
  "## Supabase Auth Checklist",
  "## Google OAuth Checklist",
  "## Auth/Login Checklist",
  "## Public/Private Privacy Checklist",
  "## Export Backup Production Checklist",
  "## Logs/Observability Checklist",
  "## Blocking Conditions",
  "## Procedure After Each Deploy",
]) {
  requireIncludes(doc, section);
}

const workflow = readFile(".github/workflows/cloudflare-deploy.yml");
requireIncludes(workflow, "workflow_dispatch:");

for (const forbidden of ["pull_request:", "push:", "schedule:"]) {
  if (workflow.toLowerCase().includes(forbidden)) {
    failures.push(`deploy workflow contains forbidden trigger: ${forbidden}`);
  }
}

assertNotTracked(".env.local");
assertNotTracked(".dev.vars");

const newFilesToScan = [
  "docs/16_PRODUCTION_STABILIZATION.md",
  "scripts/check-production-stabilization.cjs",
];

for (const file of newFilesToScan) {
  const content = readFile(file);
  const patterns =
    file.endsWith(".cjs")
      ? [/sb_secret_[A-Za-z0-9_-]+/i, /eyJ[A-Za-z0-9_-]{20,}/]
      : [
          /sb_secret_[A-Za-z0-9_-]+/i,
          /eyJ[A-Za-z0-9_-]{20,}/,
          /SUPABASE_SERVICE_ROLE_KEY\s*=\s*["'][^"']+["']/,
          /CLOUDFLARE_API_TOKEN\s*=\s*["'][^"']+["']/,
          /CLOUDFLARE_ACCOUNT_ID\s*=\s*["'][^"']+["']/,
        ];

  for (const pattern of patterns) {
    if (pattern.test(content)) {
      failures.push(`${file} appears to contain a plaintext secret/token/key`);
      break;
    }
  }
}

async function runOptionalSmoke() {
  const baseUrl = process.env.PROD_SMOKE_BASE_URL;

  if (!baseUrl) {
    console.log("Production smoke skipped: PROD_SMOKE_BASE_URL is not set.");
    return;
  }

  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const routeRules = [
    { route: "/", acceptable: [200, 301, 302, 307, 308] },
    { route: "/tree", acceptable: [200, 301, 302, 307, 308] },
    { route: "/auth/login", acceptable: [200, 301, 302, 307, 308] },
    { route: "/admin", acceptable: [200, 301, 302, 303, 307, 308, 401, 403] },
    { route: "/admin/system/status", acceptable: [200, 301, 302, 303, 307, 308, 401, 403] },
  ];

  for (const rule of routeRules) {
    const response = await fetch(`${normalizedBaseUrl}${rule.route}`, {
      method: "GET",
      redirect: "manual",
    });

    if (!rule.acceptable.includes(response.status)) {
      failures.push(
        `production smoke ${rule.route} returned ${response.status}, expected one of ${rule.acceptable.join(", ")}`,
      );
    }
  }
}

runOptionalSmoke()
  .then(() => {
    if (failures.length > 0) {
      console.error("Production stabilization check failed:");
      for (const failure of failures) {
        console.error(`- ${failure}`);
      }
      process.exit(1);
    }

    console.log("Production stabilization check passed.");
  })
  .catch((error) => {
    console.error("Production stabilization optional smoke failed:");
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
