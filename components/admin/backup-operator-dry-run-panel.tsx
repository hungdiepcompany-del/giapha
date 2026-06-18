"use client";

import { useState } from "react";

type DryRunResult = {
  ok?: boolean;
  marker?: string;
  permission_guard?: string;
  permission_source?: string | null;
  mode?: string;
  worker_call?: boolean;
  production_backup?: boolean;
  storage_upload?: boolean;
  restore?: boolean;
  request_id?: string;
};

type BackupOperatorDryRunPanelProps = {
  permissionGuard: "BACKUP_OPERATOR_UI_PERMISSION_GUARD";
  permissionSource: "backup.operator.view" | "permissions.manage";
};

export const BACKUP_OPERATOR_UI_PERMISSION_GUARD =
  "BACKUP_OPERATOR_UI_PERMISSION_GUARD";

const safetyItems = [
  "Dry-run only",
  "No production backup",
  "No storage upload",
  "No restore",
  "No real worker call",
];

export function BackupOperatorDryRunPanel({
  permissionGuard,
  permissionSource,
}: BackupOperatorDryRunPanelProps) {
  const [result, setResult] = useState<DryRunResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  async function runDryRunCheck() {
    setIsRunning(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/backups/service-dry-run", {
        method: "POST",
      });
      const payload = (await response.json()) as DryRunResult;

      if (!response.ok) {
        setError("Dry-run route returned a non-success response.");
        setResult(payload);
        return;
      }

      setResult(payload);
    } catch {
      setError("Dry-run route could not be reached from the browser.");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div
      className="grid gap-5"
      data-permission-guard={permissionGuard}
      data-permission-source={permissionSource}
    >
      <div className="border border-emerald-200 bg-emerald-50 p-4">
        <h2 className="text-base font-bold text-emerald-950">
          Operator dry-run status
        </h2>
        <div className="mt-3 grid gap-2 text-sm text-emerald-900 sm:grid-cols-2">
          {safetyItems.map((item) => (
            <div key={item} className="border border-emerald-200 bg-white px-3 py-2">
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-950">
              Run dry-run check
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Calls the main app local dry-run route and confirms that worker,
              storage, backup and restore actions remain disabled.
            </p>
          </div>
          <button
            type="button"
            onClick={runDryRunCheck}
            disabled={isRunning}
            className="border border-slate-950 bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300"
          >
            {isRunning ? "Checking..." : "Run dry-run check"}
          </button>
        </div>

        {error ? (
          <div className="mt-4 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {error}
          </div>
        ) : null}

        {result ? (
          <div className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
            <div className="border border-slate-200 p-3">
              <div className="font-semibold text-slate-950">Mode</div>
              <div className="mt-1 font-mono">{String(result.mode ?? "unknown")}</div>
            </div>
            <div className="border border-slate-200 p-3">
              <div className="font-semibold text-slate-950">Request ID</div>
              <div className="mt-1 break-all font-mono">
                {String(result.request_id ?? "unknown")}
              </div>
            </div>
            <div className="border border-slate-200 p-3">
              <div className="font-semibold text-slate-950">Permission guard</div>
              <div className="mt-1 break-all font-mono">
                {String(result.permission_guard ?? permissionGuard)}
              </div>
            </div>
            <div className="border border-slate-200 p-3">
              <div className="font-semibold text-slate-950">Permission source</div>
              <div className="mt-1 break-all font-mono">
                {String(result.permission_source ?? permissionSource)}
              </div>
            </div>
            <div className="border border-slate-200 p-3">
              <div className="font-semibold text-slate-950">Worker call</div>
              <div className="mt-1 font-mono">{String(result.worker_call)}</div>
            </div>
            <div className="border border-slate-200 p-3">
              <div className="font-semibold text-slate-950">Production backup</div>
              <div className="mt-1 font-mono">
                {String(result.production_backup)}
              </div>
            </div>
            <div className="border border-slate-200 p-3">
              <div className="font-semibold text-slate-950">Storage upload</div>
              <div className="mt-1 font-mono">{String(result.storage_upload)}</div>
            </div>
            <div className="border border-slate-200 p-3">
              <div className="font-semibold text-slate-950">Restore</div>
              <div className="mt-1 font-mono">{String(result.restore)}</div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
