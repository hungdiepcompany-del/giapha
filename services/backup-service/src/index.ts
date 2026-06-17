type BackupServiceEnv = {
  BACKUP_SERVICE_INTERNAL_TOKEN?: string;
  BACKUP_SERVICE_MODE?: string;
};

type JsonEnvelope = {
  ok: boolean;
  code: string;
  message: string;
  data: Record<string, unknown> | null;
  requestId: string;
};

const INTERNAL_DRY_RUN_MARKER = "BACKUP_SERVICE_DRY_RUN_ONLY";

function jsonResponse(envelope: JsonEnvelope, status = 200): Response {
  return new Response(JSON.stringify(envelope, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function envelope(
  ok: boolean,
  code: string,
  message: string,
  data: Record<string, unknown> | null,
  requestId: string,
): JsonEnvelope {
  return { ok, code, message, data, requestId };
}

function requestId(): string {
  return crypto.randomUUID();
}

function hasValidInternalAuth(request: Request, env: BackupServiceEnv): boolean {
  const configuredToken = env.BACKUP_SERVICE_INTERNAL_TOKEN;
  if (!configuredToken) {
    return false;
  }

  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) {
    return false;
  }

  const suppliedToken = authorization.slice("Bearer ".length).trim();
  return suppliedToken.length > 0 && suppliedToken === configuredToken;
}

function requireInternalAuth(request: Request, env: BackupServiceEnv, id: string): Response | null {
  if (hasValidInternalAuth(request, env)) {
    return null;
  }

  return jsonResponse(
    envelope(false, "AUTH_REQUIRED", "Authorization is required.", null, id),
    401,
  );
}

function handleHealth(id: string, env: BackupServiceEnv): Response {
  return jsonResponse(
    envelope(true, "BACKUP_SERVICE_HEALTH_OK", "Backup service scaffold is reachable.", {
      service: "backup-service",
      mode: env.BACKUP_SERVICE_MODE || "scaffold",
      productionBackup: "not-implemented",
      storageUpload: "not-implemented",
    }, id),
  );
}

function handleDryRun(id: string): Response {
  return jsonResponse(
    envelope(true, "BACKUP_SERVICE_DRY_RUN_OK", "Backup service dry-run scaffold completed.", {
      marker: INTERNAL_DRY_RUN_MARKER,
      realBackupCreated: false,
      realStorageUpload: false,
      restoreExecuted: false,
    }, id),
  );
}

function handleFixtureVerify(id: string): Response {
  return jsonResponse(
    envelope(true, "BACKUP_SERVICE_FIXTURE_VERIFY_OK", "Fixture verify scaffold completed.", {
      marker: "BACKUP_SERVICE_FIXTURE_VERIFY_ONLY",
      fixtureRead: "skipped",
      realDataRead: false,
      restoreExecuted: false,
    }, id),
  );
}

const backupServiceWorker = {
  async fetch(request: Request, env: BackupServiceEnv): Promise<Response> {
    const id = requestId();
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      if (request.method !== "GET") {
        return jsonResponse(envelope(false, "METHOD_NOT_ALLOWED", "Method not allowed.", null, id), 405);
      }
      return handleHealth(id, env);
    }

    if (url.pathname === "/internal/backup/dry-run") {
      if (request.method !== "POST") {
        return jsonResponse(envelope(false, "METHOD_NOT_ALLOWED", "Method not allowed.", null, id), 405);
      }
      const authFailure = requireInternalAuth(request, env, id);
      if (authFailure) {
        return authFailure;
      }
      return handleDryRun(id);
    }

    if (url.pathname === "/internal/backup/fixture-verify") {
      if (request.method !== "POST") {
        return jsonResponse(envelope(false, "METHOD_NOT_ALLOWED", "Method not allowed.", null, id), 405);
      }
      const authFailure = requireInternalAuth(request, env, id);
      if (authFailure) {
        return authFailure;
      }
      return handleFixtureVerify(id);
    }

    return jsonResponse(envelope(false, "NOT_FOUND", "Route not found.", null, id), 404);
  },
};

export default backupServiceWorker;
