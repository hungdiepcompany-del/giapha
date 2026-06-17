export const MAIN_APP_BACKUP_SERVICE_CLIENT_DRY_RUN_ONLY =
  "MAIN_APP_BACKUP_SERVICE_CLIENT_DRY_RUN_ONLY";

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
