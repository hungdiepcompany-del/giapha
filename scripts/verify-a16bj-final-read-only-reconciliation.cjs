#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");
const { createClient } = require("@supabase/supabase-js");

const root = process.cwd();
const marker = "A16BJ_FINAL_READ_ONLY_OFFICIAL_IMPORT_RETRY_RECONCILIATION";
const targetSessionId = "2af4bfb6-a20e-453e-9804-1b8c0afbdd68";
const ownerProfileId = "4f99ba5c-5a4c-4fb2-ae09-04e60ddb6bdc";
const executionEligibleState = "owner_approved_for_db_write";
const expectedPeopleCount = 102;
const expectedRelationshipCount = 134;

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const entries = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    entries[match[1]] = value;
  }
  return entries;
}

const localEnv = {
  ...parseEnvFile(path.join(root, ".env")),
  ...parseEnvFile(path.join(root, ".env.local")),
  ...process.env,
};

function output(payload) {
  console.log(
    JSON.stringify(
      {
        marker,
        targetSessionKnown: true,
        dbMutation: false,
        sqlRun: false,
        importRpcCalled: false,
        postOfficialImportCalled: false,
        sessionStateChanged: false,
        rawPrivateDataPrinted: false,
        secretsPrinted: false,
        ...payload,
      },
      null,
      2,
    ),
  );
}

function gitOk(args) {
  try {
    childProcess.execFileSync("git", args, {
      cwd: root,
      stdio: ["ignore", "ignore", "ignore"],
    });
    return true;
  } catch {
    return false;
  }
}

function statusCounts(rows) {
  return Object.fromEntries(
    Object.entries(
      rows.reduce((acc, row) => {
        const status = String(row.status ?? row.rollback_status ?? "unknown");
        acc[status] = (acc[status] ?? 0) + 1;
        return acc;
      }, {}),
    ).sort(([left], [right]) => left.localeCompare(right)),
  );
}

async function readCount(query) {
  const { count, error } = await query;
  if (error) return { ok: false, count: null };
  return { ok: true, count: count ?? 0 };
}

function countValue(result) {
  return result.ok ? result.count : null;
}

async function main() {
  const supabaseUrl = localEnv.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = localEnv.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    output({
      ok: false,
      status: "SKIPPED_MISSING_READ_ONLY_CREDENTIALS",
      finalRetryReadiness:
        "BLOCKED_READ_ONLY_CREDENTIALS_UNAVAILABLE_FOR_FINAL_RECONCILIATION",
    });
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const sessionResult = await supabase
    .from("import_sessions")
    .select(
      "status,created_by,person_candidate_count,relationship_candidate_count,warning_count,duplicate_candidate_count,approval_marker,preview_manifest_hash",
    )
    .eq("id", targetSessionId)
    .maybeSingle();

  if (sessionResult.error) {
    output({
      ok: false,
      status: "BLOCKED_READ_ERROR_IMPORT_SESSIONS",
      finalRetryReadiness: "BLOCKED_SESSION_READ_ERROR",
    });
    return;
  }

  if (!sessionResult.data) {
    output({
      ok: false,
      status: "BLOCKED_SESSION_NOT_FOUND",
      finalRetryReadiness: "BLOCKED_SESSION_NOT_FOUND",
    });
    return;
  }

  const batchResult = await supabase
    .from("official_import_batches")
    .select("status")
    .eq("import_session_id", targetSessionId);
  const rollbackResult = await supabase
    .from("official_import_rollback_manifests")
    .select("rollback_status")
    .eq("import_session_id", targetSessionId);

  if (batchResult.error || rollbackResult.error) {
    output({
      ok: false,
      status: "BLOCKED_READ_ERROR_IMPORT_AUDIT_TABLES",
      storedSessionState: sessionResult.data.status,
      finalRetryReadiness: "BLOCKED_AUDIT_TABLE_READ_ERROR",
    });
    return;
  }

  const writeManifestResult = await supabase
    .from("import_write_manifests")
    .select("status,approved_scope")
    .eq("import_session_id", targetSessionId);
  if (writeManifestResult.error) {
    output({
      ok: false,
      status: "BLOCKED_READ_ERROR_IMPORT_WRITE_MANIFESTS",
      storedSessionState: sessionResult.data.status,
      finalRetryReadiness: "BLOCKED_WRITE_MANIFEST_READ_ERROR",
    });
    return;
  }

  const peopleCandidates = await readCount(
    supabase
      .from("import_person_candidates")
      .select("id", { count: "exact", head: true })
      .eq("import_session_id", targetSessionId),
  );
  const relationshipCandidates = await readCount(
    supabase
      .from("import_relationship_candidates")
      .select("id", { count: "exact", head: true })
      .eq("import_session_id", targetSessionId),
  );
  const blockerWarnings = await readCount(
    supabase
      .from("import_session_warnings")
      .select("id", { count: "exact", head: true })
      .eq("import_session_id", targetSessionId)
      .eq("severity", "blocker")
      .not("review_status", "in", "(resolved,acknowledged)"),
  );
  const duplicateBlockers = await readCount(
    supabase
      .from("import_duplicate_candidates")
      .select("id", { count: "exact", head: true })
      .eq("import_session_id", targetSessionId)
      .in("owner_decision", ["unresolved", "needs_review", "hold"]),
  );
  const relationshipAmbiguous = await readCount(
    supabase
      .from("import_relationship_candidates")
      .select("id", { count: "exact", head: true })
      .eq("import_session_id", targetSessionId)
      .eq("relationship_type", "parent_child")
      .neq("ambiguity_status", "clear"),
  );
  const relationshipMissingSource = await readCount(
    supabase
      .from("import_relationship_candidates")
      .select("id", { count: "exact", head: true })
      .eq("import_session_id", targetSessionId)
      .eq("relationship_type", "parent_child")
      .is("source_person_fingerprint", null),
  );
  const relationshipMissingRelated = await readCount(
    supabase
      .from("import_relationship_candidates")
      .select("id", { count: "exact", head: true })
      .eq("import_session_id", targetSessionId)
      .eq("relationship_type", "parent_child")
      .is("related_person_fingerprint", null),
  );
  const relationshipOwnerBlocked = await readCount(
    supabase
      .from("import_relationship_candidates")
      .select("id", { count: "exact", head: true })
      .eq("import_session_id", targetSessionId)
      .eq("relationship_type", "parent_child")
      .in("owner_decision", ["hold", "skip"]),
  );
  const revisionImportMarkers = await readCount(
    supabase
      .from("revisions")
      .select("id", { count: "exact", head: true })
      .eq("change_reason", "A-16V official import candidate")
      .eq("after_json->>import_session_id", targetSessionId),
  );

  const batchRows = batchResult.data ?? [];
  const rollbackRows = rollbackResult.data ?? [];
  const writeManifestRows = writeManifestResult.data ?? [];
  const approvedWriteManifest = writeManifestRows.find((row) =>
    ["owner_approved", "ready_for_apply"].includes(String(row.status)),
  );
  const approvedScope = approvedWriteManifest?.approved_scope;
  const approvedScopePersonCandidateCount =
    approvedScope &&
    typeof approvedScope === "object" &&
    !Array.isArray(approvedScope) &&
    Array.isArray(approvedScope.person_candidates)
      ? approvedScope.person_candidates.length
      : null;
  const batchStatusCounts = statusCounts(batchRows);
  const rollbackStatusCounts = statusCounts(rollbackRows);
  const writeManifestStatusCounts = statusCounts(writeManifestRows);
  const completedOrInProgressBatchCount = batchRows.filter((row) =>
    ["pending", "running", "completed", "rollback_required"].includes(
      String(row.status),
    ),
  ).length;
  const completedWriteManifestCount = writeManifestRows.filter(
    (row) => row.status === "write_completed",
  ).length;
  const relationshipBlockerCount =
    (countValue(relationshipAmbiguous) ?? 0) +
    (countValue(relationshipMissingSource) ?? 0) +
    (countValue(relationshipMissingRelated) ?? 0) +
    (countValue(relationshipOwnerBlocked) ?? 0);
  const partialWriteDetected =
    batchRows.length > 0 ||
    rollbackRows.length > 0 ||
    completedWriteManifestCount > 0 ||
    (countValue(revisionImportMarkers) ?? 0) > 0 ||
    ["write_started", "write_completed", "rollback_required", "rolled_back"].includes(
      sessionResult.data.status,
    );

  const allReadCountsOk = [
    peopleCandidates,
    relationshipCandidates,
    blockerWarnings,
    duplicateBlockers,
    relationshipAmbiguous,
    relationshipMissingSource,
    relationshipMissingRelated,
    relationshipOwnerBlocked,
    revisionImportMarkers,
  ].every((result) => result.ok);
  const identityMatch = sessionResult.data.created_by === ownerProfileId;
  const stateOk = sessionResult.data.status === executionEligibleState;
  const stagedPeopleCount =
    approvedScopePersonCandidateCount ?? sessionResult.data.person_candidate_count;
  const stagedRelationshipCount = countValue(relationshipCandidates);
  const countsOk =
    stagedPeopleCount === expectedPeopleCount &&
    stagedRelationshipCount === expectedRelationshipCount;
  const blockersOk =
    countValue(blockerWarnings) === 0 &&
    countValue(duplicateBlockers) === 0 &&
    relationshipBlockerCount === 0;
  const auditClean =
    batchRows.length === 0 &&
    rollbackRows.length === 0 &&
    completedOrInProgressBatchCount === 0 &&
    !partialWriteDetected;
  const sourceEvidenceOk =
    gitOk(["merge-base", "--is-ancestor", "fff4019", "HEAD"]) &&
    fs.existsSync(
      path.join(
        root,
        "app/api/admin/import-sessions/[sessionId]/official-import-identity-precheck/route.ts",
      ),
    );
  const finalReady =
    allReadCountsOk &&
    identityMatch &&
    stateOk &&
    countsOk &&
    blockersOk &&
    auditClean &&
    sourceEvidenceOk;

  output({
    ok: finalReady,
    status: finalReady
      ? "PASS_FINAL_READ_ONLY_RECONCILIATION"
      : "BLOCKED_FINAL_READ_ONLY_RECONCILIATION",
    storedSessionState: sessionResult.data.status,
    executionEligibleState,
    identityMatch,
    sessionCreatedByIdentifierType: identityMatch
      ? "CURRENT_RPC_VISIBLE_OWNER_PROFILE"
      : "MISMATCHED_OR_UNKNOWN_PROFILE",
    officialImportBatchExists: batchRows.length > 0,
    officialImportBatchStatusCounts: batchStatusCounts,
    completedOrInProgressOfficialImportBatchCount: completedOrInProgressBatchCount,
    rollbackManifestExists: rollbackRows.length > 0,
    rollbackManifestStatusCounts: rollbackStatusCounts,
    rollbackManifestTiedToCompletedBatch:
      rollbackRows.length > 0 && batchStatusCounts.completed > 0,
    partialWriteDetected,
    partialWriteDetectionBasis:
      "official_import_batches,rollback_manifests,write_manifest_status,revision_import_session_markers,session_terminal_write_states",
    importRevisionMarkerCount: countValue(revisionImportMarkers),
    stagedPeopleCount,
    stagedPeopleCountSource:
      approvedScopePersonCandidateCount === null
        ? "import_sessions.person_candidate_count"
        : "import_write_manifests.approved_scope.person_candidates",
    personCandidateTableCount: countValue(peopleCandidates),
    stagedRelationshipCount,
    sessionPeopleCandidateCount: sessionResult.data.person_candidate_count,
    sessionRelationshipCandidateCount:
      sessionResult.data.relationship_candidate_count,
    sessionWarningCount: sessionResult.data.warning_count,
    blockerWarningCount: countValue(blockerWarnings),
    duplicateBlockerCount: countValue(duplicateBlockers),
    relationshipBlockerCount,
    writeManifestStatusCounts,
    ownerApprovedWriteManifestCount:
      (writeManifestStatusCounts.owner_approved ?? 0) +
      (writeManifestStatusCounts.ready_for_apply ?? 0),
    approvalMarkerPresent: Boolean(sessionResult.data.approval_marker),
    previewManifestHashPresent: Boolean(sessionResult.data.preview_manifest_hash),
    deployedSourceEvidence:
      "OWNER_PROVIDED_A16BH_AUTHENTICATED_GET_PASS_AND_RPC_METADATA_PASS_9_OF_9_PLUS_LOCAL_HEAD_INCLUDES_FFF4019",
    localHeadIncludesFff4019: gitOk(["merge-base", "--is-ancestor", "fff4019", "HEAD"]),
    a16bhDiagnosticRouteExistsInCheckout: sourceEvidenceOk,
    rootCauseClassification: finalReady
      ? "LIKELY_PRE_FFF4019_STALE_DEPLOYMENT_OR_PRE_DIAGNOSTIC_EXECUTION_PATH_NO_REMAINING_READ_ONLY_BLOCKER"
      : "REMAINING_READ_ONLY_BLOCKER_PRESENT",
    finalRetryReadiness: finalReady
      ? "READY_FOR_SEPARATE_OWNER_APPROVED_SINGLE_RETRY_NOT_EXECUTED_IN_A16BJ"
      : "BLOCKED_FINAL_READ_ONLY_RECONCILIATION",
    a16rImportRetryNext: "NO_IN_THIS_PHASE",
  });
}

main().catch(() => {
  output({
    ok: false,
    status: "BLOCKED_UNEXPECTED_READ_ONLY_VERIFIER_ERROR",
    finalRetryReadiness: "BLOCKED_UNEXPECTED_READ_ONLY_VERIFIER_ERROR",
  });
});
