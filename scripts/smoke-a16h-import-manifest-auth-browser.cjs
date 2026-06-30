const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const baseUrlEnv = "A16H_IMPORT_MANIFEST_SMOKE_BASE_URL";
const storageStateEnv = "A16H_IMPORT_MANIFEST_SMOKE_STORAGE_STATE";
const routePath = "/admin/exports/import";
const marker = "A16H_IMPORT_MANIFEST_AUTH_BROWSER_SMOKE";

function printStatus(status, details = {}) {
  console.log(`A16H_BROWSER_SMOKE_STATUS=${status}`);
  for (const [key, value] of Object.entries(details)) {
    if (value === undefined || value === null || value === "") continue;
    console.log(`A16H_BROWSER_SMOKE_${key.toUpperCase()}=${String(value)}`);
  }
}

function resolveStorageState(value) {
  if (!value) return "";
  return path.isAbsolute(value) ? value : path.join(root, value);
}

function sanitizeError(error) {
  const message = error instanceof Error ? error.message : String(error);
  return message
    .replace(/(Bearer\s+)[A-Za-z0-9._-]+/gi, "$1[REDACTED]")
    .replace(/(access_token=)[^&\s]+/gi, "$1[REDACTED]")
    .replace(/(refresh_token=)[^&\s]+/gi, "$1[REDACTED]")
    .replace(/(cookie:?\s*)[^\r\n]+/gi, "$1[REDACTED]");
}

function isMutation(method) {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase());
}

function isDangerousMutationUrl(rawUrl) {
  let pathname = rawUrl;
  try {
    pathname = new URL(rawUrl).pathname;
  } catch {
    // Keep raw URL text for conservative matching.
  }

  const routeLooksRelevant = /\/(admin|api)\/.*(import|import-sessions|exports)/i.test(pathname);
  const dangerousAction =
    /(confirm|commit|finalize|official-import|import-now|apply|write|create-person|relationship|layout|revision)/i.test(
      pathname,
    );

  return routeLooksRelevant || dangerousAction;
}

async function loadPlaywright() {
  try {
    return await import("playwright");
  } catch {
    try {
      return await import("@playwright/test");
    } catch {
      return null;
    }
  }
}

async function main() {
  const baseUrl = process.env[baseUrlEnv];
  const storageStateValue = process.env[storageStateEnv];
  const storageStatePath = resolveStorageState(storageStateValue);

  if (!baseUrl || !storageStateValue || !fs.existsSync(storageStatePath)) {
    printStatus("SAFE_SKIP_MISSING_EXPLICIT_ENV", {
      reason: !baseUrl
        ? `missing ${baseUrlEnv}`
        : !storageStateValue
          ? `missing ${storageStateEnv}`
          : `${storageStateEnv} file not found`,
      marker,
    });
    return;
  }

  const playwright = await loadPlaywright();
  const chromium = playwright?.chromium;
  if (!chromium) {
    printStatus("SAFE_SKIP_BROWSER_RUNTIME_UNAVAILABLE", {
      reason: "playwright runtime is not installed in this checkout",
      marker,
    });
    return;
  }

  const blockedMutations = [];
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      storageState: storageStatePath,
      locale: "vi-VN",
    });
    const page = await context.newPage();

    page.on("request", (request) => {
      const method = request.method().toUpperCase();
      const url = request.url();
      if (isMutation(method) && isDangerousMutationUrl(url)) {
        blockedMutations.push(`${method} ${new URL(url).pathname}`);
      }
    });

    const target = new URL(routePath, baseUrl).toString();
    const response = await page.goto(target, {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    if (!response || response.status() >= 500) {
      throw new Error(`page returned ${response ? response.status() : "no response"}`);
    }

    const finalUrl = page.url();
    if (/\/auth\/login|\/unauthorized/i.test(finalUrl)) {
      throw new Error(`unexpected redirect to ${new URL(finalUrl).pathname}`);
    }

    const bodyText = await page.locator("body").innerText({ timeout: 10000 });
    const requiredText = [
      "Phiên nhập dữ liệu",
      "Manifest dữ liệu",
      "Dữ liệu bên dưới chỉ là bản xem trước, chưa được nhập vào cây gia phả.",
      "Xác nhận nhập chính thức",
      "chưa mở",
    ];

    for (const text of requiredText) {
      if (!bodyText.includes(text)) {
        throw new Error(`missing Vietnamese text: ${text}`);
      }
    }

    const importButton = page.getByRole("button", {
      name: /Xác nhận nhập chính thức/i,
    });
    const buttonCount = await importButton.count();
    if (buttonCount === 0) {
      throw new Error("official import CTA button not found");
    }
    if (!(await importButton.first().isDisabled())) {
      throw new Error("official import CTA is not disabled");
    }

    if (blockedMutations.length > 0) {
      throw new Error(`dangerous mutation request detected: ${blockedMutations.join(", ")}`);
    }

    printStatus("PASS", {
      route: routePath,
      marker,
    });
  } catch (error) {
    printStatus("FAIL", {
      reason: sanitizeError(error),
      marker,
    });
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
  }
}

main().catch((error) => {
  printStatus("FAIL", {
    reason: sanitizeError(error),
    marker,
  });
  process.exitCode = 1;
});
