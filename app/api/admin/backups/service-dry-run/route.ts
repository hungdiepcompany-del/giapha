import { NextResponse } from "next/server";

import {
  backupServiceDryRun,
  backupServiceFixtureVerify,
  backupServiceHealth,
} from "@/server/services/backup-service-client";

export const dynamic = "force-dynamic";

export const BACKUP_OPERATOR_API_DRY_RUN_ONLY =
  "BACKUP_OPERATOR_API_DRY_RUN_ONLY";

type BackupOperatorDryRunEnvelope = {
  ok: true;
  marker: typeof BACKUP_OPERATOR_API_DRY_RUN_ONLY;
  mode: "dry_run";
  worker_call: false;
  production_backup: false;
  storage_upload: false;
  restore: false;
  route: "/api/admin/backups/service-dry-run";
  permission_boundary: "dry_run_contract_pending_permission_hardening";
  request_id: string;
  adapter: {
    health: ReturnType<typeof backupServiceHealth>;
    dry_run: ReturnType<typeof backupServiceDryRun>;
    fixture_verify: ReturnType<typeof backupServiceFixtureVerify>;
  };
};

function createRequestId(): string {
  return `backup-operator-api-dry-run-${Date.now()}`;
}

function createDryRunEnvelope(): BackupOperatorDryRunEnvelope {
  const requestId = createRequestId();
  const input = {
    requestId,
    source: "main-app" as const,
  };

  return {
    ok: true,
    marker: BACKUP_OPERATOR_API_DRY_RUN_ONLY,
    mode: "dry_run",
    worker_call: false,
    production_backup: false,
    storage_upload: false,
    restore: false,
    route: "/api/admin/backups/service-dry-run",
    permission_boundary: "dry_run_contract_pending_permission_hardening",
    request_id: requestId,
    adapter: {
      health: backupServiceHealth(input),
      dry_run: backupServiceDryRun(input),
      fixture_verify: backupServiceFixtureVerify(input),
    },
  };
}

export async function GET() {
  return NextResponse.json(createDryRunEnvelope());
}

export async function POST() {
  return NextResponse.json(createDryRunEnvelope());
}
