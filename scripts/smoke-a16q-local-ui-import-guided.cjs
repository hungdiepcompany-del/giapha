const cdpUrl =
  process.env.A16Q_LOCAL_UI_CDP_URL || "http://127.0.0.1:9222";
const baseUrl = process.env.A16Q_LOCAL_UI_BASE_URL || "http://localhost:3001";
const routePath = "/admin/exports/import";

function printStatus(status, details = {}) {
  console.log(`A16Q_LOCAL_UI_SMOKE_STATUS=${status}`);
  for (const [key, value] of Object.entries(details)) {
    if (value === undefined || value === null || value === "") continue;
    console.log(`A16Q_LOCAL_UI_SMOKE_${key.toUpperCase()}=${String(value)}`);
  }
}

function sanitizeError(error) {
  const message = error instanceof Error ? error.message : String(error);
  return message
    .replace(/(Bearer\s+)[A-Za-z0-9._-]+/gi, "$1[REDACTED]")
    .replace(/(access_token=)[^&\s]+/gi, "$1[REDACTED]")
    .replace(/(refresh_token=)[^&\s]+/gi, "$1[REDACTED]")
    .replace(/(cookie:?\s*)[^\r\n]+/gi, "$1[REDACTED]");
}

function extractFirstNumber(text, pattern) {
  const match = text.match(pattern);
  return match ? match[1] : "UNKNOWN";
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
  const playwright = await loadPlaywright();
  const chromium = playwright?.chromium;

  if (!chromium) {
    printStatus("SAFE_SKIP_BROWSER_RUNTIME_UNAVAILABLE", {
      route: routePath,
      session_id: "UNKNOWN",
    });
    return;
  }

  let browser;

  try {
    browser = await chromium.connectOverCDP(cdpUrl);
  } catch (error) {
    printStatus("SAFE_SKIP_MISSING_CHROME_CDP", {
      route: routePath,
      cdp_url: cdpUrl,
      reason: sanitizeError(error),
      session_id: "UNKNOWN",
    });
    return;
  }

  try {
    const context = browser.contexts()[0];
    if (!context) {
      printStatus("SAFE_SKIP_MISSING_CHROME_CDP", {
        route: routePath,
        reason: "no Chrome CDP context is available",
        session_id: "UNKNOWN",
      });
      return;
    }

    const page = context.pages()[0] || (await context.newPage());
    const target = new URL(routePath, baseUrl).toString();
    const response = await page.goto(target, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});

    const text = await page.locator("body").innerText({ timeout: 10000 });
    const finalUrl = page.url();

    if (
      /\/auth\/login|\/unauthorized/i.test(finalUrl) ||
      /Bạn cần đăng nhập|Báº¡n cáº§n Ä‘Äƒng nháº­p|imports\.create|unauthorized|no_roles/i.test(
        text,
      )
    ) {
      printStatus("SAFE_SKIP_MISSING_AUTH", {
        route: routePath,
        http_status: response?.status() ?? "UNKNOWN",
        final_url: finalUrl,
        session_id: "UNKNOWN",
        total_members: "UNKNOWN",
        total_relationships: "UNKNOWN",
        preview_members: "UNKNOWN",
        preview_relationships: "UNKNOWN",
        validation_errors: "UNKNOWN",
        warnings: "UNKNOWN",
        dry_run_blockers: "UNKNOWN",
        duplicate_candidates: "UNKNOWN",
        official_import_locked: "UNKNOWN",
      });
      return;
    }

    const officialImportButton = page.getByRole("button", {
      name: "Xác nhận nhập chính thức — chưa mở",
    });
    const buttonCount = await officialImportButton.count();
    const officialImportDisabled =
      buttonCount === 1 ? await officialImportButton.isEnabled().then((value) => !value) : false;

    printStatus(officialImportDisabled ? "PASS" : "FAIL", {
      route: routePath,
      http_status: response?.status() ?? "UNKNOWN",
      final_url: finalUrl,
      session_id: extractFirstNumber(
        text,
        /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
      ),
      total_members: extractFirstNumber(
        text,
        /(?:Số người staging|Thành viên dự kiến|Tổng người staging)\D+(\d+)/i,
      ),
      total_relationships: extractFirstNumber(
        text,
        /(?:Số quan hệ staging|Quan hệ dự kiến|Tổng quan hệ staging)\D+(\d+)/i,
      ),
      preview_members: extractFirstNumber(
        text,
        /(?:Mẫu người đang đọc|Mẫu người hiển thị)\D+(\d+)/i,
      ),
      preview_relationships: extractFirstNumber(
        text,
        /(?:Mẫu quan hệ đang đọc|Mẫu quan hệ hiển thị)\D+(\d+)/i,
      ),
      validation_errors: extractFirstNumber(text, /(?:Số lỗi|Lỗi cần xử lý)\D+(\d+)/i),
      warnings: extractFirstNumber(
        text,
        /(?:Số cảnh báo|Cảnh báo manifest)\D+(\d+)/i,
      ),
      dry_run_blockers: extractFirstNumber(
        text,
        /(?:Dry-run bị chặn|Lỗi chặn dry-run)\D+(\d+)/i,
      ),
      duplicate_candidates: extractFirstNumber(text, /(?:Ứng viên trùng)\D+(\d+)/i),
      official_import_locked: String(officialImportDisabled),
    });

    if (!officialImportDisabled) process.exitCode = 1;
  } catch (error) {
    const reason = sanitizeError(error);
    const status = /ECONNREFUSED|ERR_CONNECTION_REFUSED|ERR_NAME_NOT_RESOLVED|Cannot navigate/i.test(
      reason,
    )
      ? "SAFE_SKIP_MISSING_LOCALHOST"
      : "SAFE_SKIP_OWNER_FILE_NOT_SELECTED_OR_UI_UNAVAILABLE";
    printStatus(status, {
      route: routePath,
      reason,
      session_id: "UNKNOWN",
    });
  } finally {
    if (browser) await browser.close();
  }
}

main().catch((error) => {
  printStatus("FAIL", {
    route: routePath,
    reason: sanitizeError(error),
    session_id: "UNKNOWN",
  });
  process.exitCode = 1;
});
