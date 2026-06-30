import "server-only";

export const A16K_OWNER_APPROVAL_GATE_MARKER =
  "A16K_OWNER_APPROVAL_GATE_DRY_RUN_IMPORT";

export const A16K_IMPORT_DRY_RUN_REQUIRED_MARKER =
  "APPROVE_A16K_IMPORT_DRY_RUN_GATE";

export type ImportDryRunApprovalGate = {
  marker: typeof A16K_OWNER_APPROVAL_GATE_MARKER;
  dryRunGate: {
    requiredMarker: typeof A16K_IMPORT_DRY_RUN_REQUIRED_MARKER;
    status: "locked";
    canRunDryRun: false;
    reason: string;
  };
  dryRunMappingOpen: false;
  officialImportOpen: false;
  dbWrite: false;
  peopleWrite: false;
  relationshipWrite: false;
  treeLayoutWrite: false;
  revisionWrite: false;
  message: string;
};

export function getImportDryRunApprovalGate(): ImportDryRunApprovalGate {
  return {
    marker: A16K_OWNER_APPROVAL_GATE_MARKER,
    dryRunGate: {
      requiredMarker: A16K_IMPORT_DRY_RUN_REQUIRED_MARKER,
      status: "locked",
      canRunDryRun: false,
      reason: "Cần owner phê duyệt trước khi chạy dry-run import.",
    },
    dryRunMappingOpen: false,
    officialImportOpen: false,
    dbWrite: false,
    peopleWrite: false,
    relationshipWrite: false,
    treeLayoutWrite: false,
    revisionWrite: false,
    message: "Dry-run import chưa được mở.",
  };
}
