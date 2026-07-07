import "server-only";

export const A16K_OWNER_APPROVAL_GATE_MARKER =
  "A16K_OWNER_APPROVAL_GATE_DRY_RUN_IMPORT";

export const A16K_IMPORT_DRY_RUN_REQUIRED_MARKER =
  "APPROVE_A16K_IMPORT_DRY_RUN_GATE";

export const A16K_AUDITED_DRY_RUN_SESSION_ID =
  "2af4bfb6-a20e-453e-9804-1b8c0afbdd68" as const;

export const A16K_BLOCKED_UNVERIFIED_SESSION_ID =
  "ae7a5fe3-6a29-4f60-85f7-76108ed02565" as const;

export type ImportDryRunApprovalGate = {
  marker: typeof A16K_OWNER_APPROVAL_GATE_MARKER;
  dryRunGate: {
    requiredMarker: typeof A16K_IMPORT_DRY_RUN_REQUIRED_MARKER;
    approvedMarker: typeof A16K_IMPORT_DRY_RUN_REQUIRED_MARKER;
    auditedSessionId: typeof A16K_AUDITED_DRY_RUN_SESSION_ID;
    sessionMatchesAudited: boolean;
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

export function getImportDryRunApprovalGate(
  sessionId?: string | null,
): ImportDryRunApprovalGate {
  const sessionMatchesAudited = sessionId === A16K_AUDITED_DRY_RUN_SESSION_ID;

  if (!sessionMatchesAudited) {
    return {
      marker: A16K_OWNER_APPROVAL_GATE_MARKER,
      dryRunGate: {
        requiredMarker: A16K_IMPORT_DRY_RUN_REQUIRED_MARKER,
        approvedMarker: A16K_IMPORT_DRY_RUN_REQUIRED_MARKER,
        auditedSessionId: A16K_AUDITED_DRY_RUN_SESSION_ID,
        sessionMatchesAudited,
        status: "locked",
        canRunDryRun: false,
        reason:
          "Dry-run chi mo cho phien da duoc kiem toan sau A-16R; phien dang xem khong khop.",
      },
      dryRunMappingOpen: false,
      officialImportOpen: false,
      dbWrite: false,
      peopleWrite: false,
      relationshipWrite: false,
      treeLayoutWrite: false,
      revisionWrite: false,
      message: "Dry-run import chua duoc mo cho phien nay.",
    };
  }

  return {
    marker: A16K_OWNER_APPROVAL_GATE_MARKER,
    dryRunGate: {
      requiredMarker: A16K_IMPORT_DRY_RUN_REQUIRED_MARKER,
      approvedMarker: A16K_IMPORT_DRY_RUN_REQUIRED_MARKER,
      auditedSessionId: A16K_AUDITED_DRY_RUN_SESSION_ID,
      sessionMatchesAudited,
      status: "open",
      canRunDryRun: true,
      reason:
        "Owner da phe duyet marker A-16K cho dry-run read-only cua phien da kiem toan.",
    },
    dryRunMappingOpen: true,
    officialImportOpen: false,
    dbWrite: false,
    peopleWrite: false,
    relationshipWrite: false,
    treeLayoutWrite: false,
    revisionWrite: false,
    message: "Dry-run import read-only da mo cho phien da kiem toan.",
  };
}
