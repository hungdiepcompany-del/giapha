import { fixtureRoundTrip } from "./recoverability";
import {
  PRODUCTION_PREFLIGHT_SUCCESS_CODE,
  validateProductionPreflight,
  type ProductionPreflightEnv,
} from "./production-preflight";

type BackupServiceEnv = Env & ProductionPreflightEnv;

declare global {
  interface SubtleCrypto {
    timingSafeEqual(first: BufferSource, second: BufferSource): boolean;
  }
}

type JsonEnvelope = {
  ok: boolean;
  code: string;
  message: string;
  data: Record<string, unknown> | null;
  requestId: string;
};

const INTERNAL_DRY_RUN_MARKER = "BACKUP_SERVICE_DRY_RUN_ONLY";
const MAX_FIXTURE_REQUEST_BYTES = 8 * 1024;

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

async function hasValidInternalAuth(request: Request, env: BackupServiceEnv): Promise<boolean> {
  const configuredToken = env.BACKUP_SERVICE_INTERNAL_TOKEN;
  if (!configuredToken) {
    return false;
  }

  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) {
    return false;
  }

  const suppliedToken = authorization.slice("Bearer ".length).trim();
  if (!suppliedToken) {
    return false;
  }

  try {
    const [expectedHash, suppliedHash] = await Promise.all([
      crypto.subtle.digest("SHA-256", new TextEncoder().encode(configuredToken)),
      crypto.subtle.digest("SHA-256", new TextEncoder().encode(suppliedToken)),
    ]);
    return crypto.subtle.timingSafeEqual(expectedHash, suppliedHash);
  } catch {
    return false;
  }
}

async function requireInternalAuth(request: Request, env: BackupServiceEnv, id: string): Promise<Response | null> {
  if (await hasValidInternalAuth(request, env)) {
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

function handleProductionPreflight(id: string, env: BackupServiceEnv): Response {
  try {
    return jsonResponse(
      envelope(
        true,
        PRODUCTION_PREFLIGHT_SUCCESS_CODE,
        "Production backup configuration preflight completed.",
        validateProductionPreflight(env),
        id,
      ),
    );
  } catch {
    return jsonResponse(
      envelope(false, "BACKUP_SERVICE_PRODUCTION_PREFLIGHT_FAILED", "Production backup configuration preflight failed.", null, id),
      422,
    );
  }
}

async function readBoundedFixtureRequest(request: Request): Promise<string> {
  const contentLength = request.headers.get("content-length");
  if (contentLength && (!/^\d+$/.test(contentLength) || Number(contentLength) > MAX_FIXTURE_REQUEST_BYTES)) {
    throw new Error("RECOVERABILITY_REQUEST_OVERSIZE");
  }
  const reader = request.body?.getReader();
  if (!reader) throw new Error("RECOVERABILITY_REQUEST_BODY_REQUIRED");
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_FIXTURE_REQUEST_BYTES) throw new Error("RECOVERABILITY_REQUEST_OVERSIZE");
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

async function handleFixtureRoundTrip(request: Request, id: string, env: BackupServiceEnv): Promise<Response> {
  if (String(env.BACKUP_SERVICE_MODE) !== "fixture-local") {
    return jsonResponse(
      envelope(false, "FIXTURE_LOCAL_MODE_REQUIRED", "Fixture-local mode is required.", null, id),
      403,
    );
  }

  try {
    const result = await fixtureRoundTrip(
      env.BACKUP_BUCKET,
      env.BACKUP_ENCRYPTION_KEY_B64,
      await readBoundedFixtureRequest(request),
    );
    return jsonResponse(
      envelope(true, "BACKUP_SERVICE_FIXTURE_ROUNDTRIP_OK", "Fixture roundtrip completed.", result, id),
    );
  } catch {
    return jsonResponse(
      envelope(false, "BACKUP_SERVICE_FIXTURE_ROUNDTRIP_FAILED", "Fixture roundtrip failed.", null, id),
      422,
    );
  }
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
      const authFailure = await requireInternalAuth(request, env, id);
      if (authFailure) {
        return authFailure;
      }
      return handleDryRun(id);
    }

    if (url.pathname === "/internal/backup/fixture-verify") {
      if (request.method !== "POST") {
        return jsonResponse(envelope(false, "METHOD_NOT_ALLOWED", "Method not allowed.", null, id), 405);
      }
      const authFailure = await requireInternalAuth(request, env, id);
      if (authFailure) {
        return authFailure;
      }
      return handleFixtureVerify(id);
    }

    if (url.pathname === "/internal/backup/fixture-roundtrip") {
      if (request.method !== "POST") {
        return jsonResponse(envelope(false, "METHOD_NOT_ALLOWED", "Method not allowed.", null, id), 405);
      }
      const authFailure = await requireInternalAuth(request, env, id);
      if (authFailure) {
        return authFailure;
      }
      return handleFixtureRoundTrip(request, id, env);
    }

    if (url.pathname === "/internal/backup/production-preflight") {
      if (request.method !== "POST") {
        return jsonResponse(envelope(false, "METHOD_NOT_ALLOWED", "Method not allowed.", null, id), 405);
      }
      const authFailure = await requireInternalAuth(request, env, id);
      if (authFailure) {
        return authFailure;
      }
      return handleProductionPreflight(id, env);
    }

    return jsonResponse(envelope(false, "NOT_FOUND", "Route not found.", null, id), 404);
  },
} satisfies ExportedHandler<BackupServiceEnv>;

export default backupServiceWorker;
