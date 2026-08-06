import "server-only";

export const A16K_OWNER_APPROVAL_GATE_MARKER =
  "A16K_OWNER_APPROVAL_GATE_DRY_RUN_IMPORT";

export const A16K_IMPORT_DRY_RUN_REQUIRED_MARKER =
  "APPROVE_A16K_IMPORT_DRY_RUN_GATE";

export const A16K_AUDITED_DRY_RUN_SESSION_ID =
  "2af4bfb6-a20e-453e-9804-1b8c0afbdd68" as const;

export const A16K_BLOCKED_UNVERIFIED_SESSION_ID =
  "ae7a5fe3-6a29-4f60-85f7-76108ed02565" as const;

export type ImportDryRunApprovalGateInput = {
  sessionId?: string | null;
  manifestId?: string | null;
  stagingVersion?: string | null;
  validationErrorCount?: number;
  validationBlockerCount?: number;
  pendingWarningCount?: number;
};

export type ImportDryRunApprovalGate = {
  marker: typeof A16K_OWNER_APPROVAL_GATE_MARKER;
  dryRunGate: {
    requiredMarker: typeof A16K_IMPORT_DRY_RUN_REQUIRED_MARKER;
    approvedMarker: typeof A16K_IMPORT_DRY_RUN_REQUIRED_MARKER;
    sessionId: string | null;
    auditedSessionId: string | null;
    manifestId: string | null;
    stagingVersion: string | null;
    sessionExplicit: boolean;
    validationErrorsClear: boolean;
    validationBlockersClear: boolean;
    requiredWarningsReviewed: boolean;
    status: "open" | "locked";
    canRunDryRun: boolean;
    reason: string;
  };
  dryRunMappingOpen: boolean;
  officialImportOpen: false;
  dbWrite: false;
  peopleWrite: false;
  relationshipWrite: false;
  treeLayoutWrite: false;
  revisionWrite: false;
  message: string;
};

function normalizeInput(
  input?: string | null | ImportDryRunApprovalGateInput,
): ImportDryRunApprovalGateInput {
  if (typeof input === "string" || input === null || typeof input === "undefined") {
    return { sessionId: input ?? null };
  }

  return input;
}

export function getImportDryRunApprovalGate(
  input?: string | null | ImportDryRunApprovalGateInput,
): ImportDryRunApprovalGate {
  const normalized = normalizeInput(input);
  const validationErrorCount = normalized.validationErrorCount ?? 0;
  const validationBlockerCount =
    normalized.validationBlockerCount ?? validationErrorCount;
  const pendingWarningCount = normalized.pendingWarningCount ?? 0;
  const sessionExplicit = Boolean(normalized.sessionId);
  const validationErrorsClear = validationErrorCount === 0;
  const validationBlockersClear = validationBlockerCount === 0;
  const requiredWarningsReviewed = pendingWarningCount === 0;
  const canRunDryRun =
    sessionExplicit &&
    validationErrorsClear &&
    validationBlockersClear &&
    requiredWarningsReviewed;
  const reason = !sessionExplicit
    ? "Dry-run can only run for an explicit current sessionId."
    : !validationErrorsClear || !validationBlockersClear
      ? "Dry-run is locked because validation still has errors/blockers."
      : !requiredWarningsReviewed
        ? "Dry-run is locked until required warning groups are reviewed."
        : "Dry-run read-only preview is open for the current session.";

  return {
    marker: A16K_OWNER_APPROVAL_GATE_MARKER,
    dryRunGate: {
      requiredMarker: A16K_IMPORT_DRY_RUN_REQUIRED_MARKER,
      approvedMarker: A16K_IMPORT_DRY_RUN_REQUIRED_MARKER,
      sessionId: normalized.sessionId ?? null,
      auditedSessionId: normalized.sessionId ?? null,
      manifestId: normalized.manifestId ?? null,
      stagingVersion: normalized.stagingVersion ?? null,
      sessionExplicit,
      validationErrorsClear,
      validationBlockersClear,
      requiredWarningsReviewed,
      status: canRunDryRun ? "open" : "locked",
      canRunDryRun,
      reason,
    },
    dryRunMappingOpen: canRunDryRun,
    officialImportOpen: false,
    dbWrite: false,
    peopleWrite: false,
    relationshipWrite: false,
    treeLayoutWrite: false,
    revisionWrite: false,
    message: canRunDryRun
      ? "Dry-run import read-only is open for this current staging session."
      : "Dry-run import remains locked for this current staging session.",
  };
}
