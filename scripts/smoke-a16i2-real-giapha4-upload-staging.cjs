const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const marker = "A16I2_REAL_GIAPHA4_UPLOAD_SMOKE";
const baseUrlEnv = "A16I2_GIAPHA4_REAL_UPLOAD_BASE_URL";
const storageStateEnv = "A16I2_GIAPHA4_REAL_UPLOAD_STORAGE_STATE";
const filePathEnv = "A16I2_GIAPHA4_REAL_FILE_PATH";
const routePath = "/admin/exports/import";

function printStatus(status, details = {}) {
  console.log(`A16I2_REAL_UPLOAD_SMOKE_STATUS=${status}`);
  console.log(`A16I2_REAL_UPLOAD_SMOKE_MARKER=${marker}`);
  for (const [key, value] of Object.entries(details)) {
    if (value === undefined || value === null || value === "") continue;
    console.log(`A16I2_${key.toUpperCase()}=${String(value)}`);
  }
}

function resolveMaybeAbsolute(value) {
  if (!value) return "";
  return path.resolve(path.isAbsolute(value) ? value : path.join(root, value));
}

function isInside(parent, child) {
  const relative = path.relative(parent, child);
  return Boolean(relative) && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function gitTracked(relativePath) {
  try {
    childProcess.execFileSync("git", ["ls-files", "--error-unmatch", relativePath], {
      cwd: root,
      stdio: ["ignore", "ignore", "ignore"],
    });
    return true;
  } catch {
    return false;
  }
}

function sanitizeError(error) {
  const message = error instanceof Error ? error.message : String(error);
  return message
    .replace(/(Bearer\s+)[A-Za-z0-9._-]+/gi, "$1[REDACTED]")
    .replace(/(access_token=)[^&\s]+/gi, "$1[REDACTED]")
    .replace(/(refresh_token=)[^&\s]+/gi, "$1[REDACTED]")
    .replace(/(cookie:?\s*)[^\r\n]+/gi, "$1[REDACTED]")
    .replace(/[A-Za-z]:\\[^\r\n]+/g, "[REDACTED_PATH]");
}

function failWith(reasonCode, message) {
  const error = new Error(message);
  error.reasonCode = reasonCode;
  throw error;
}

function classifyUploadFailure(status, uploadJson) {
  const warningCodes = Array.isArray(uploadJson?.warnings)
    ? uploadJson.warnings.map((item) => item?.warningCode).filter(Boolean)
    : [];
  const text = [
    uploadJson?.message,
    uploadJson?.errorCode,
    uploadJson?.reason,
    warningCodes.join(" "),
  ]
    .filter(Boolean)
    .join(" ");

  if (status === 401) return "AUTH_SESSION_MISSING";
  if (status === 403 || /imports\.create|permission|forbidden|không có quyền/i.test(text)) {
    return "PERMISSION_IMPORTS_CREATE_MISSING";
  }
  if (/RLS|row-level|import session staging|không tạo được import session/i.test(text)) {
    return "RLS_STAGING_WRITE_BLOCKED";
  }
  if (/A16I3_REQUIRED_HEADERS_MISSING|A16I_HEADER_NOT_RECOGNIZED/i.test(text)) {
    return "PARSER_HEADER_MISSING";
  }
  if (/A16I3_MEMBER_SHEET_MISSING/i.test(text)) return "PARSER_SHEET_MISSING";
  if (/A16I_XLS_NOT_SUPPORTED_WITHOUT_PARSER_DEPENDENCY|unsupported xls/i.test(text)) {
    return "PARSER_UNSUPPORTED_XLS";
  }
  return "UNKNOWN_UPLOAD_ERROR";
}

function classifyFailure(error) {
  if (error?.reasonCode) return error.reasonCode;
  const message = error instanceof Error ? error.message : String(error);
  if (/unexpected redirect to \/auth\/login|unexpected redirect to \/unauthorized/i.test(message)) {
    return "AUTH_SESSION_MISSING";
  }
  if (/ECONNREFUSED|ENOTFOUND|network|page returned|no response|timeout/i.test(message)) {
    return "NETWORK_OR_BASE_URL_ERROR";
  }
  if (/A16I3_REQUIRED_HEADERS_MISSING|A16I_HEADER_NOT_RECOGNIZED/i.test(message)) {
    return "PARSER_HEADER_MISSING";
  }
  if (/A16I3_MEMBER_SHEET_MISSING/i.test(message)) return "PARSER_SHEET_MISSING";
  if (/\.xls|unsupported xls/i.test(message)) return "PARSER_UNSUPPORTED_XLS";
  if (/imports\.create|forbidden|permission/i.test(message)) {
    return "PERMISSION_IMPORTS_CREATE_MISSING";
  }
  if (/RLS|row-level|staging write/i.test(message)) return "RLS_STAGING_WRITE_BLOCKED";
  return "UNKNOWN_UPLOAD_ERROR";
}

function isMutation(method) {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase());
}

function mutationAllowed(method, rawUrl) {
  if (method.toUpperCase() !== "POST") return false;
  try {
    return new URL(rawUrl).pathname === "/api/admin/import-sessions/upload";
  } catch {
    return rawUrl.includes("/api/admin/import-sessions/upload");
  }
}

function hasDangerousAction(rawUrl) {
  let pathname = rawUrl;
  try {
    pathname = new URL(rawUrl).pathname;
  } catch {
    // Keep raw URL text for conservative matching.
  }
  return /(confirm|commit|finalize|official-import(?!-gate)|import-now|apply|write-real-tree)/i.test(
    pathname,
  );
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

function readSafeCounts(uploadJson, validationJson) {
  const uploadSummary = uploadJson?.summary ?? {};
  const validationSummary = validationJson?.summary ?? {};
  const warningCodes = Array.isArray(uploadJson?.warnings)
    ? uploadJson.warnings
        .map((item) => item?.warningCode)
        .filter((value) => typeof value === "string" && value.length > 0)
        .slice(0, 20)
    : [];

  return {
    sessionId: uploadSummary.sessionId ?? validationJson?.sessionId ?? null,
    peopleCount: validationSummary.peopleCount ?? uploadSummary.personCandidateCount,
    relationshipCount:
      validationSummary.relationshipCount ?? uploadSummary.relationshipCandidateCount,
    errorCount: validationSummary.errorCount,
    warningCount: validationSummary.warningCount ?? uploadSummary.warningCount,
    infoCount: validationSummary.infoCount,
    warningCodes,
  };
}

async function main() {
  const baseUrl = process.env[baseUrlEnv];
  const storageStateValue = process.env[storageStateEnv];
  const filePathValue = process.env[filePathEnv];

  if (!baseUrl || !storageStateValue || !filePathValue) {
    printStatus("SAFE_SKIP_MISSING_EXPLICIT_ENV", {
      missing_env: [baseUrlEnv, storageStateEnv, filePathEnv]
        .filter((name) => !process.env[name])
        .join(","),
      counts_available: false,
    });
    return;
  }

  const storageStatePath = resolveMaybeAbsolute(storageStateValue);
  const realFilePath = resolveMaybeAbsolute(filePathValue);

  if (!fs.existsSync(storageStatePath)) {
    printStatus("SAFE_SKIP_MISSING_EXPLICIT_ENV", {
      missing_env: `${storageStateEnv}_FILE_NOT_FOUND`,
      counts_available: false,
    });
    return;
  }

  if (!fs.existsSync(realFilePath)) {
    printStatus("SAFE_SKIP_MISSING_REAL_FILE", {
      counts_available: false,
    });
    return;
  }

  const rootResolved = path.resolve(root);
  if (isInside(rootResolved, realFilePath) || realFilePath === rootResolved) {
    const relative = path.relative(rootResolved, realFilePath);
    const tracked = relative ? gitTracked(relative) : false;
    printStatus("FAIL_REAL_FILE_INSIDE_REPO", {
      file_inside_repo: true,
      git_tracked: tracked,
      counts_available: false,
    });
    process.exitCode = 1;
    return;
  }

  const extension = path.extname(realFilePath).toLowerCase();
  if (extension === ".xls") {
    printStatus("SAFE_SKIP_UNSUPPORTED_XLS", {
      reason_code: "PARSER_UNSUPPORTED_XLS",
      file_extension: ".xls",
      counts_available: false,
    });
    return;
  }

  if (extension !== ".xlsx") {
    printStatus("FAIL_UNSUPPORTED_FILE_EXTENSION", {
      file_extension: extension || "none",
      counts_available: false,
    });
    process.exitCode = 1;
    return;
  }

  const playwright = await loadPlaywright();
  const chromium = playwright?.chromium;
  if (!chromium) {
    printStatus("SAFE_SKIP_BROWSER_RUNTIME_UNAVAILABLE", {
      counts_available: false,
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
      if (isMutation(method) && !mutationAllowed(method, url)) {
        blockedMutations.push(`${method} ${new URL(url).pathname}`);
      }
      if (hasDangerousAction(url)) {
        blockedMutations.push(`${method} ${new URL(url).pathname}`);
      }
    });

    const target = new URL(routePath, baseUrl).toString();
    const response = await page.goto(target, {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    if (!response || response.status() >= 500) {
      failWith(
        "NETWORK_OR_BASE_URL_ERROR",
        `page returned ${response ? response.status() : "no response"}`,
      );
    }

    const finalUrl = page.url();
    if (/\/auth\/login|\/unauthorized/i.test(finalUrl)) {
      failWith("AUTH_SESSION_MISSING", `unexpected redirect to ${new URL(finalUrl).pathname}`);
    }

    const bodyText = await page.locator("body").innerText({ timeout: 10000 });
    for (const text of [
      "Tải lên file Gia Phả 4",
      "Chỉ ghi vào vùng staging",
      "Xác nhận nhập chính thức",
      "chưa mở",
    ]) {
      if (!bodyText.includes(text)) throw new Error(`missing Vietnamese text: ${text}`);
    }

    const officialImportButton = page.getByRole("button", {
      name: /Xác nhận nhập chính thức/i,
    });
    if ((await officialImportButton.count()) === 0) {
      throw new Error("official import CTA button not found");
    }
    if (!(await officialImportButton.first().isDisabled())) {
      throw new Error("official import CTA is not disabled");
    }

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(realFilePath);

    const uploadResponsePromise = page.waitForResponse(
      (item) =>
        item.request().method() === "POST" &&
        new URL(item.url()).pathname === "/api/admin/import-sessions/upload",
      { timeout: 60000 },
    );

    await page.getByRole("button", { name: /Đọc file và tạo manifest/i }).click();
    const uploadResponse = await uploadResponsePromise;
    const uploadJson = await uploadResponse.json().catch(() => null);

    if (!uploadResponse.ok() || !uploadJson?.ok) {
      failWith(
        classifyUploadFailure(uploadResponse.status(), uploadJson),
        `upload staging failed with status ${uploadResponse.status()}`,
      );
    }

    const sessionId = uploadJson.summary?.sessionId;
    if (!sessionId) throw new Error("upload response did not expose staging session id");

    const manifestUrl = new URL(
      `/api/admin/import-sessions/${sessionId}/manifest`,
      baseUrl,
    ).toString();
    const validationUrl = new URL(
      `/api/admin/import-sessions/${sessionId}/validation`,
      baseUrl,
    ).toString();
    const dryRunPreviewUrl = new URL(
      `/api/admin/import-sessions/${sessionId}/dry-run-preview`,
      baseUrl,
    ).toString();

    const [manifestResponse, validationResponse, dryRunPreviewResponse] = await Promise.all([
      page.request.get(manifestUrl),
      page.request.get(validationUrl),
      page.request.get(dryRunPreviewUrl),
    ]);
    const manifestJson = await manifestResponse.json().catch(() => null);
    const validationJson = await validationResponse.json().catch(() => null);
    const dryRunPreviewJson = await dryRunPreviewResponse.json().catch(() => null);

    if (!manifestResponse.ok() || !manifestJson?.ok) {
      throw new Error(`manifest read failed with status ${manifestResponse.status()}`);
    }
    if (!validationResponse.ok() || !validationJson?.ok) {
      throw new Error(`validation read failed with status ${validationResponse.status()}`);
    }
    if (!dryRunPreviewResponse.ok() || !dryRunPreviewJson?.ok) {
      throw new Error(
        `dry-run preview read failed with status ${dryRunPreviewResponse.status()}`,
      );
    }

    await page.reload({ waitUntil: "networkidle", timeout: 30000 });
    const refreshedText = await page.locator("body").innerText({ timeout: 10000 });
    for (const text of [
      "Kiểm tra dữ liệu staging",
      "Số lỗi",
      "Số cảnh báo",
      "Số thông tin",
    ]) {
      if (!refreshedText.includes(text)) throw new Error(`missing validation UI: ${text}`);
    }

    if (blockedMutations.length > 0) {
      throw new Error(
        `dangerous mutation request detected: ${blockedMutations.join(", ")}`,
      );
    }

    const counts = readSafeCounts(uploadJson, validationJson);
    printStatus("PASS", {
      session_id: counts.sessionId,
      people_count: counts.peopleCount,
      relationship_count: counts.relationshipCount,
      error_count: counts.errorCount,
      warning_count: counts.warningCount,
      info_count: counts.infoCount,
      warning_codes: counts.warningCodes.join(","),
      dry_run_preview_status: dryRunPreviewJson.ok ? "available" : "unavailable",
      dry_run_people_count: dryRunPreviewJson.summary?.proposedPeopleCount,
      dry_run_relationship_count: dryRunPreviewJson.summary?.proposedRelationshipCount,
      can_proceed_to_official_import:
        dryRunPreviewJson.summary?.canProceedToOfficialImport ?? false,
      counts_available: true,
      file_extension: ".xlsx",
    });
  } catch (error) {
    printStatus("FAIL", {
      reason_code: classifyFailure(error),
      reason: sanitizeError(error),
      counts_available: false,
    });
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
  }
}

main().catch((error) => {
  printStatus("FAIL", {
    reason: sanitizeError(error),
    counts_available: false,
  });
  process.exitCode = 1;
});
