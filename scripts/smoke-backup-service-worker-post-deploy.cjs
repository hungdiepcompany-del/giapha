const marker = "POST_DEPLOY_SMOKE_ONLY";

function write(line) {
  console.log(`[smoke:backup-service-worker:post-deploy] ${line}`);
}

function safeError(error) {
  return {
    name: error && error.name ? error.name : "Error",
    message: error && error.message ? error.message : "Unknown error",
  };
}

async function readSafeJson(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

function endpointUrl(baseUrl, pathname) {
  const url = new URL(baseUrl);
  url.pathname = pathname;
  url.search = "";
  url.hash = "";
  return url;
}

async function smokeRequest(label, url, init) {
  const response = await fetch(url, init);
  const body = await readSafeJson(response);
  const code = body && typeof body.code === "string" ? body.code : "NO_SAFE_CODE";
  const message = body && typeof body.message === "string" ? body.message : "No safe message.";

  write(`${label}: status=${response.status} code=${code} message=${message}`);

  if (!response.ok) {
    throw new Error(`${label} failed with status ${response.status}`);
  }
}

async function main() {
  write(marker);

  const baseUrl = process.env.BACKUP_SERVICE_SMOKE_BASE_URL;
  const token = process.env.BACKUP_SERVICE_SMOKE_TOKEN;

  if (!baseUrl) {
    write("SKIPPED because BACKUP_SERVICE_SMOKE_BASE_URL is not set");
    return;
  }

  let parsedBaseUrl;
  try {
    parsedBaseUrl = new URL(baseUrl);
  } catch {
    throw new Error("BACKUP_SERVICE_SMOKE_BASE_URL is not a valid URL");
  }

  if (!["http:", "https:"].includes(parsedBaseUrl.protocol)) {
    throw new Error("BACKUP_SERVICE_SMOKE_BASE_URL must use an HTTP protocol");
  }

  await smokeRequest("GET /health", endpointUrl(parsedBaseUrl, "/health"), {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  });

  if (!token) {
    write("SKIPPED internal endpoints because BACKUP_SERVICE_SMOKE_TOKEN is not set");
    return;
  }

  const headers = {
    accept: "application/json",
    authorization: `Bearer ${token}`,
    "content-type": "application/json",
  };

  await smokeRequest("POST /internal/backup/dry-run", endpointUrl(parsedBaseUrl, "/internal/backup/dry-run"), {
    method: "POST",
    headers,
    body: JSON.stringify({
      marker,
      mode: "dry-run",
      realBackupCreated: false,
      realStorageUpload: false,
      restoreExecuted: false,
    }),
  });

  await smokeRequest("POST /internal/backup/fixture-verify", endpointUrl(parsedBaseUrl, "/internal/backup/fixture-verify"), {
    method: "POST",
    headers,
    body: JSON.stringify({
      marker,
      mode: "fixture-verify",
      realBackupCreated: false,
      realStorageUpload: false,
      restoreExecuted: false,
    }),
  });

  write("Result: PASS");
}

main().catch((error) => {
  const safe = safeError(error);
  write(`FAIL ${safe.name}: ${safe.message}`);
  process.exit(1);
});
