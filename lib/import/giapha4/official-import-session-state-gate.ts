export const A16BB_SESSION_STATE_DIAGNOSTIC_MARKER =
  "A16BB_SANITIZED_SESSION_STATE_DIAGNOSTIC_READ_ONLY";

export const A16BB_OFFICIAL_IMPORT_EXECUTION_ELIGIBLE_SESSION_STATE =
  "owner_approved_for_db_write" as const;

export const A16BB_OFFICIAL_IMPORT_REVIEW_READY_SESSION_STATE =
  "ready_for_owner_approval" as const;

export const A16BB_BLOCKED_SESSION_STATE_MISSING =
  "A16BB_BLOCKED_SESSION_STATE_MISSING";

export const A16BB_BLOCKED_SESSION_STATE_READY_FOR_OWNER_APPROVAL_NOT_OWNER_APPROVED_FOR_DB_WRITE =
  "A16BB_BLOCKED_SESSION_STATE_READY_FOR_OWNER_APPROVAL_NOT_OWNER_APPROVED_FOR_DB_WRITE";

export const A16BB_BLOCKED_SESSION_STATE_TERMINAL_OR_ALREADY_IMPORT_PROCESSED =
  "A16BB_BLOCKED_SESSION_STATE_TERMINAL_OR_ALREADY_IMPORT_PROCESSED";

export const A16BB_BLOCKED_SESSION_STATE_NOT_CANONICAL_FOR_OFFICIAL_IMPORT =
  "A16BB_BLOCKED_SESSION_STATE_NOT_CANONICAL_FOR_OFFICIAL_IMPORT";

export const A16BB_SESSION_STATE_EXECUTION_ELIGIBLE =
  "A16BB_SESSION_STATE_EXECUTION_ELIGIBLE_OWNER_APPROVED_FOR_DB_WRITE";

const terminalOrConsumedStates = new Set([
  "write_started",
  "write_completed",
  "rollback_required",
  "rolled_back",
  "expired_preview",
  "rejected_needs_fix",
]);

export function buildOfficialImportSessionStateGate(
  status: string | null | undefined,
) {
  if (!status) {
    return {
      status: null,
      executionEligible: false,
      reviewReady: false,
      blocker: A16BB_BLOCKED_SESSION_STATE_MISSING,
      message:
        "Import session status is missing, so official import remains locked.",
    } as const;
  }

  if (status === A16BB_OFFICIAL_IMPORT_EXECUTION_ELIGIBLE_SESSION_STATE) {
    return {
      status,
      executionEligible: true,
      reviewReady: true,
      blocker: null,
      message: A16BB_SESSION_STATE_EXECUTION_ELIGIBLE,
    } as const;
  }

  if (status === A16BB_OFFICIAL_IMPORT_REVIEW_READY_SESSION_STATE) {
    return {
      status,
      executionEligible: false,
      reviewReady: true,
      blocker:
        A16BB_BLOCKED_SESSION_STATE_READY_FOR_OWNER_APPROVAL_NOT_OWNER_APPROVED_FOR_DB_WRITE,
      message:
        "Import session is ready for owner approval but is not owner-approved for DB write.",
    } as const;
  }

  if (terminalOrConsumedStates.has(status)) {
    return {
      status,
      executionEligible: false,
      reviewReady: false,
      blocker: A16BB_BLOCKED_SESSION_STATE_TERMINAL_OR_ALREADY_IMPORT_PROCESSED,
      message:
        "Import session is terminal, consumed, failed, expired, or already in write lifecycle.",
    } as const;
  }

  return {
    status,
    executionEligible: false,
    reviewReady: false,
    blocker: A16BB_BLOCKED_SESSION_STATE_NOT_CANONICAL_FOR_OFFICIAL_IMPORT,
    message:
      "Import session is not in the canonical owner-approved DB-write state.",
  } as const;
}
