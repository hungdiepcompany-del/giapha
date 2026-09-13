import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";

export const MAIN_APP_BACKUP_SERVICE_CLIENT_DRY_RUN_ONLY =
  "MAIN_APP_BACKUP_SERVICE_CLIENT_DRY_RUN_ONLY";

export const BACKUP_SERVICE_PRODUCTION_PREFLIGHT_MARKER =
  "BACKUP_SERVICE_PRODUCTION_PREFLIGHT_ONLY";
export const BACKUP_SERVICE_PRODUCTION_PREFLIGHT_PATH =
  "/internal/backup/production-preflight";

type BackupServiceProductionFetcher = {
  fetch(request: Request): Promise<Response>;
};

declare global {
  interface CloudflareEnv {
    BACKUP_SERVICE_PRODUCTION: BackupServiceProductionFetcher;
    BACKUP_SERVICE_INTERNAL_TOKEN: string;
  }
}

export const BACKUP_SERVICE_BASE_URL_PLACEHOLDER = "BACKUP_SERVICE_BASE_URL";
export const BACKUP_SERVICE_INTERNAL_TOKEN_PLACEHOLDER = "BACKUP_SERVICE_INTERNAL_TOKEN";

export type BackupServiceClientAction = "health" | "dryRun" | "fixtureVerify";

export type BackupServiceClientEnvelope = {
  ok: boolean;
  code: string;
  message: string;
  data: Record<string, unknown> | null;
  requestId: string;
  dryRun: true;
};

export type BackupServiceDryRunRequest = {
  requestId?: string;
  requestedByProfileId?: string;
  source?: "main-app";
};

function createRequestId(): string {
  return `main-app-backup-dry-run-${Date.now()}`;
}

function envelope(
  code: string,
  message: string,
  data: Record<string, unknown> | null,
  requestId: string,
): BackupServiceClientEnvelope {
  return {
    ok: true,
    code,
    message,
    data,
    requestId,
    dryRun: true,
  };
}

function requestId(input?: BackupServiceDryRunRequest): string {
  return input?.requestId || createRequestId();
}

export function backupServiceHealth(input?: BackupServiceDryRunRequest): BackupServiceClientEnvelope {
  const id = requestId(input);
  return envelope(
    "MAIN_APP_BACKUP_SERVICE_HEALTH_DRY_RUN",
    "Backup service health call is disabled and simulated by the main app.",
    {
      marker: MAIN_APP_BACKUP_SERVICE_CLIENT_DRY_RUN_ONLY,
      action: "health" satisfies BackupServiceClientAction,
      networkCall: false,
      workerCalled: false,
      placeholderBaseUrl: BACKUP_SERVICE_BASE_URL_PLACEHOLDER,
    },
    id,
  );
}

export function backupServiceDryRun(input?: BackupServiceDryRunRequest): BackupServiceClientEnvelope {
  const id = requestId(input);
  return envelope(
    "MAIN_APP_BACKUP_SERVICE_DRY_RUN_ONLY",
    "Backup service dry-run is simulated by the main app.",
    {
      marker: MAIN_APP_BACKUP_SERVICE_CLIENT_DRY_RUN_ONLY,
      action: "dryRun" satisfies BackupServiceClientAction,
      realBackupCreated: false,
      realStorageUpload: false,
      workerCalled: false,
      requestedByProfileId: input?.requestedByProfileId || null,
      source: input?.source || "main-app",
    },
    id,
  );
}

export function backupServiceFixtureVerify(input?: BackupServiceDryRunRequest): BackupServiceClientEnvelope {
  const id = requestId(input);
  return envelope(
    "MAIN_APP_BACKUP_SERVICE_FIXTURE_VERIFY_DRY_RUN",
    "Backup service fixture verify is simulated by the main app.",
    {
      marker: MAIN_APP_BACKUP_SERVICE_CLIENT_DRY_RUN_ONLY,
      action: "fixtureVerify" satisfies BackupServiceClientAction,
      fixtureRead: "skipped",
      realDataRead: false,
      restoreExecuted: false,
      workerCalled: false,
    },
    id,
  );
}

export function createDisabledBackupServiceNetworkClient(): never {
  throw new Error("backup_service_network_disabled");
}

export type BackupServiceProductionPreflightResponse = {
  ok: true;
  code: "BACKUP_SERVICE_PRODUCTION_PREFLIGHT_OK";
  message: "Production backup configuration preflight completed.";
  data: {
    marker: typeof BACKUP_SERVICE_PRODUCTION_PREFLIGHT_MARKER;
    mode: "production";
    r2Binding: "BACKUP_BUCKET";
    activeKeyVersion: "v1";
  };
  requestId: string;
};

function createProductionPreflightRequest(requestId: string, token: string): Request {
  return new Request(`http://backup-service.internal${BACKUP_SERVICE_PRODUCTION_PREFLIGHT_PATH}`, {
    method: "POST",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      "x-request-id": requestId,
    },
    body: JSON.stringify({ marker: BACKUP_SERVICE_PRODUCTION_PREFLIGHT_MARKER }),
  });
}

function isExactProductionPreflightResponse(value: unknown, requestId: string): value is BackupServiceProductionPreflightResponse {
  if (!value || typeof value !== "object") return false;
  const response = value as Record<string, unknown>;
  if (Object.keys(response).length !== 5 || response.ok !== true || response.code !== "BACKUP_SERVICE_PRODUCTION_PREFLIGHT_OK") return false;
  if (response.message !== "Production backup configuration preflight completed." || response.requestId !== requestId) return false;
  const data = response.data;
  if (!data || typeof data !== "object") return false;
  const safeData = data as Record<string, unknown>;
  return Object.keys(safeData).length === 4
    && safeData.marker === BACKUP_SERVICE_PRODUCTION_PREFLIGHT_MARKER
    && safeData.mode === "production"
    && safeData.r2Binding === "BACKUP_BUCKET"
    && safeData.activeKeyVersion === "v1";
}

export async function backupServiceProductionPreflight(
  requestId = crypto.randomUUID(),
): Promise<BackupServiceProductionPreflightResponse> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const token = env.BACKUP_SERVICE_INTERNAL_TOKEN;
    const service = env.BACKUP_SERVICE_PRODUCTION;
    if (typeof token !== "string" || token.length === 0 || !service || typeof service.fetch !== "function") {
      throw new Error("backup_service_production_binding_unavailable");
    }

    const response = await service.fetch(createProductionPreflightRequest(requestId, token));
    if (!response.ok || response.headers.get("content-type")?.split(";", 1)[0] !== "application/json") {
      throw new Error("backup_service_production_preflight_invalid_response");
    }
    const payload: unknown = await response.json();
    if (!isExactProductionPreflightResponse(payload, requestId)) {
      throw new Error("backup_service_production_preflight_invalid_response");
    }
    return payload;
  } catch {
    throw new Error("backup_service_production_preflight_unavailable");
  }
}
