const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const baseUrlEnv = "A16Q_FIX_IMPORT_SESSION_SMOKE_BASE_URL";
const storageStateEnv = "A16Q_FIX_IMPORT_SESSION_SMOKE_STORAGE_STATE";
const routePath = "/admin/exports/import";

function printStatus(status, details = {}) {
  console.log(`A16Q_FIX_UI_SMOKE_STATUS=${status}`);
  for (const [key, value] of Object.entries(details)) {
    if (value === undefined || value === null || value === "") continue;
    console.log(`A16Q_FIX_UI_SMOKE_${key.toUpperCase()}=${String(value)}`);
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

function isDangerousMutation(method, rawUrl) {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase())) {
    return false;
  }

  let pathname = rawUrl;
  try {
    pathname = new URL(rawUrl).pathname;
  } catch {
    // Keep raw URL text for conservative matching.
  }

  return /\/(admin|api)\/.*(import|import-sessions|exports)/i.test(pathname);
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

function extractFirstNumber(text, labelPattern) {
  const match = text.match(labelPattern);
  return match ? match[1] : "UNKNOWN";
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
      session_id: "UNKNOWN",
      people_count: "UNKNOWN",
      relationship_count: "UNKNOWN",
      error_count: "UNKNOWN",
      warning_count: "UNKNOWN",
      blocker_count: "UNKNOWN",
    });
    return;
  }

  const playwright = await loadPlaywright();
  const chromium = playwright?.chromium;
  if (!chromium) {
    printStatus("SAFE_SKIP_BROWSER_RUNTIME_UNAVAILABLE", {
      reason: "playwright runtime is not installed in this checkout",
      session_id: "UNKNOWN",
      people_count: "UNKNOWN",
      relationship_count: "UNKNOWN",
      error_count: "UNKNOWN",
      warning_count: "UNKNOWN",
      blocker_count: "UNKNOWN",
    });
    return;
  }

  const dangerousMutations = [];
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      storageState: storageStatePath,
      locale: "vi-VN",
    });
    const page = await context.newPage();

    page.on("request", (request) => {
      if (isDangerousMutation(request.method(), request.url())) {
        dangerousMutations.push(`${request.method()} ${new URL(request.url()).pathname}`);
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
    for (const text of [
      "Phiên nhập dữ liệu",
      "Manifest dữ liệu",
      "Dữ liệu bên dưới chỉ là bản xem trước",
      "Xác nhận nhập chính thức",
      "chưa mở",
    ]) {
      if (!bodyText.includes(text)) {
        throw new Error(`missing UI text: ${text}`);
      }
    }

    const importButton = page.getByRole("button", {
      name: /Xác nhận nhập chính thức/i,
    });
    if ((await importButton.count()) === 0) {
      throw new Error("official import CTA button not found");
    }
    if (!(await importButton.first().isDisabled())) {
      throw new Error("official import CTA is not disabled");
    }
    if (dangerousMutations.length > 0) {
      throw new Error(`dangerous mutation detected: ${dangerousMutations.join(", ")}`);
    }

    printStatus("PASS", {
      route: routePath,
      session_id: extractFirstNumber(bodyText, /Phiên nhập[^0-9a-f-]*([0-9a-f-]{36})/i),
      people_count: extractFirstNumber(bodyText, /(?:Số người staging|Người staging|Thành viên staging)\D+(\d+)/i),
      relationship_count: extractFirstNumber(bodyText, /(?:Số quan hệ staging|Quan hệ staging|Quan hệ cha mẹ)\D+(\d+)/i),
      error_count: extractFirstNumber(bodyText, /(?:Số lỗi|Lỗi cần xử lý)\D+(\d+)/i),
      warning_count: extractFirstNumber(bodyText, /(?:Số cảnh báo|Cảnh báo manifest)\D+(\d+)/i),
      blocker_count: extractFirstNumber(bodyText, /(?:Lỗi chặn dry-run|Dry-run bị chặn)\D+(\d+)/i),
      official_import_locked: "true",
    });
  } catch (error) {
    printStatus("FAIL", {
      reason: sanitizeError(error),
      session_id: "UNKNOWN",
    });
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
  }
}

main().catch((error) => {
  printStatus("FAIL", {
    reason: sanitizeError(error),
    session_id: "UNKNOWN",
  });
  process.exitCode = 1;
});
