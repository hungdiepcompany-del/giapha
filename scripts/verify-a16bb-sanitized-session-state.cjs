#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { createClient } = require("@supabase/supabase-js");

const root = process.cwd();
const targetSessionId = "2af4bfb6-a20e-453e-9804-1b8c0afbdd68";
const marker = "A16BB_SANITIZED_SESSION_STATE_DIAGNOSTIC_READ_ONLY";
const executionEligibleState = "owner_approved_for_db_write";

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
        targetSessionId,
        dbMutation: false,
        sqlRun: false,
        rpcCalled: false,
        postOfficialImportCalled: false,
        rawPrivateDataPrinted: false,
        secretsPrinted: false,
        ...payload,
      },
      null,
      2,
    ),
  );
}

function statusCounts(rows) {
  return Object.fromEntries(
    Object.entries(
      rows.reduce((acc, row) => {
        const status = String(row.status ?? "unknown");
        acc[status] = (acc[status] ?? 0) + 1;
        return acc;
      }, {}),
    ).sort(([left], [right]) => left.localeCompare(right)),
  );
}

async function counted(query) {
  const { count, error } = await query;
  if (error) return { ok: false, count: null };
  return { ok: true, count: count ?? 0 };
}

async function main() {
  const supabaseUrl = localEnv.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = localEnv.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    output({
      ok: false,
      status: "SKIPPED_MISSING_READ_ONLY_CREDENTIALS",
      storedSessionState: "UNKNOWN_CREDENTIALS_UNAVAILABLE",
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
      "id,status,warning_count,duplicate_candidate_count,relationship_candidate_count,person_candidate_count,preview_manifest_hash,approval_marker",
    )
    .eq("id", targetSessionId)
    .maybeSingle();

  if (sessionResult.error) {
    output({
      ok: false,
      status: "BLOCKED_READ_ERROR_IMPORT_SESSIONS",
      storedSessionState: "UNKNOWN_READ_ERROR",
    });
    return;
  }

  if (!sessionResult.data) {
    output({
      ok: false,
      status: "BLOCKED_SESSION_NOT_FOUND",
      storedSessionState: "NOT_FOUND",
    });
    return;
  }

  const writeManifestResult = await supabase
    .from("import_write_manifests")
    .select("status")
    .eq("import_session_id", targetSessionId);

  if (writeManifestResult.error) {
    output({
      ok: false,
      status: "BLOCKED_READ_ERROR_IMPORT_WRITE_MANIFESTS",
      storedSessionState: sessionResult.data.status,
    });
    return;
  }

  const batchResult = await supabase
    .from("official_import_batches")
    .select("status")
    .eq("import_session_id", targetSessionId);

  if (batchResult.error) {
    output({
      ok: false,
      status: "BLOCKED_READ_ERROR_OFFICIAL_IMPORT_BATCHES",
      storedSessionState: sessionResult.data.status,
    });
    return;
  }

  const blockerWarnings = await counted(
    supabase
      .from("import_session_warnings")
      .select("id", { count: "exact", head: true })
      .eq("import_session_id", targetSessionId)
      .eq("severity", "blocker")
      .in("review_status", ["open", "needs_review"]),
  );
  const unresolvedDuplicates = await counted(
    supabase
      .from("import_duplicate_candidates")
      .select("id", { count: "exact", head: true })
      .eq("import_session_id", targetSessionId)
      .eq("owner_decision", "unresolved"),
  );
  const needsReviewDuplicates = await counted(
    supabase
      .from("import_duplicate_candidates")
      .select("id", { count: "exact", head: true })
      .eq("import_session_id", targetSessionId)
      .eq("owner_decision", "needs_review"),
  );

  const storedSessionState = sessionResult.data.status;
  const writeManifestStatusCounts = statusCounts(writeManifestResult.data ?? []);
  const ownerApprovedWriteManifestCount =
    (writeManifestStatusCounts.owner_approved ?? 0) +
    (writeManifestStatusCounts.ready_for_apply ?? 0);
  const officialImportBatchStatusCounts = statusCounts(batchResult.data ?? []);

  output({
    ok: true,
    status: "PASS_READ_ONLY_SANITIZED_METADATA",
    storedSessionState,
    executionEligibleState,
    sessionStateExecutionEligible: storedSessionState === executionEligibleState,
    sessionStateReviewReady: storedSessionState === "ready_for_owner_approval",
    previewManifestHashPresent: Boolean(sessionResult.data.preview_manifest_hash),
    approvalMarkerPresent: Boolean(sessionResult.data.approval_marker),
    warningCount: sessionResult.data.warning_count,
    duplicateCandidateCount: sessionResult.data.duplicate_candidate_count,
    relationshipCandidateCount: sessionResult.data.relationship_candidate_count,
    personCandidateCount: sessionResult.data.person_candidate_count,
    writeManifestStatusCounts,
    ownerApprovedWriteManifestCount,
    officialImportBatchStatusCounts,
    blockerWarningCountOpenOrNeedsReview: blockerWarnings.count,
    unresolvedDuplicateCount: unresolvedDuplicates.count,
    needsReviewDuplicateCount: needsReviewDuplicates.count,
  });
}

main().catch(() => {
  output({
    ok: false,
    status: "BLOCKED_UNEXPECTED_READ_ONLY_VERIFIER_ERROR",
    storedSessionState: "UNKNOWN_UNEXPECTED_ERROR",
  });
});
