#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { createClient } = require("@supabase/supabase-js");

const root = process.cwd();
const marker = "A16BE_SESSION_OWNERSHIP_CONTRACT_READ_ONLY";
const targetSessionId = "2af4bfb6-a20e-453e-9804-1b8c0afbdd68";
const ownerAuthUserId = "d0627fdd-6a21-4f9b-aa53-642d6228c1bb";
const ownerProfileId = "4f99ba5c-5a4c-4fb2-ae09-04e60ddb6bdc";

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

function classifyIdentifier(value) {
  if (!value) return "MISSING";
  if (value === ownerProfileId) return "CURRENT_OWNER_PROFILE_ID";
  if (value === ownerAuthUserId) return "CURRENT_OWNER_AUTH_USER_ID_UNEXPECTED";
  return "OTHER_PROFILE_ID_OR_HISTORICAL_IMPORTER";
}

async function main() {
  const supabaseUrl = localEnv.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = localEnv.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    output({
      ok: false,
      status: "SKIPPED_MISSING_READ_ONLY_CREDENTIALS",
      sessionOwnerIdentifierType: "UNKNOWN_CREDENTIALS_UNAVAILABLE",
      runtimeIdentifierType: "PROFILE_ID_FROM_PERMISSION_CONTEXT",
      rpcExpectedIdentifierType: "PROFILE_ID_FROM_PUBLIC_CURRENT_PROFILE_ID",
      exactContractMismatch: "UNKNOWN_CREDENTIALS_UNAVAILABLE",
    });
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const profileResult = await supabase
    .from("profiles")
    .select("id,auth_user_id,status")
    .eq("auth_user_id", ownerAuthUserId)
    .maybeSingle();

  if (profileResult.error) {
    output({
      ok: false,
      status: "BLOCKED_READ_ERROR_PROFILES",
      sessionOwnerIdentifierType: "UNKNOWN_PROFILE_READ_ERROR",
      runtimeIdentifierType: "PROFILE_ID_FROM_PERMISSION_CONTEXT",
      rpcExpectedIdentifierType: "PROFILE_ID_FROM_PUBLIC_CURRENT_PROFILE_ID",
      exactContractMismatch: "UNKNOWN_PROFILE_READ_ERROR",
    });
    return;
  }

  const sessionResult = await supabase
    .from("import_sessions")
    .select("id,status,created_by,updated_by,approved_by,approval_marker")
    .eq("id", targetSessionId)
    .maybeSingle();

  if (sessionResult.error) {
    output({
      ok: false,
      status: "BLOCKED_READ_ERROR_IMPORT_SESSIONS",
      sessionOwnerIdentifierType: "UNKNOWN_SESSION_READ_ERROR",
      runtimeIdentifierType: "PROFILE_ID_FROM_PERMISSION_CONTEXT",
      rpcExpectedIdentifierType: "PROFILE_ID_FROM_PUBLIC_CURRENT_PROFILE_ID",
      exactContractMismatch: "UNKNOWN_SESSION_READ_ERROR",
    });
    return;
  }

  if (!sessionResult.data) {
    output({
      ok: false,
      status: "BLOCKED_SESSION_NOT_FOUND",
      sessionOwnerIdentifierType: "SESSION_NOT_FOUND",
      runtimeIdentifierType: "PROFILE_ID_FROM_PERMISSION_CONTEXT",
      rpcExpectedIdentifierType: "PROFILE_ID_FROM_PUBLIC_CURRENT_PROFILE_ID",
      exactContractMismatch: "SESSION_NOT_FOUND",
    });
    return;
  }

  const session = sessionResult.data;
  const createdByType = classifyIdentifier(session.created_by);
  const updatedByType = classifyIdentifier(session.updated_by);
  const approvedByType = classifyIdentifier(session.approved_by);

  let createdByProfileExists = null;
  let createdByProfileAuthMatchesOwner = null;
  if (
    session.created_by &&
    session.created_by !== ownerProfileId &&
    session.created_by !== ownerAuthUserId
  ) {
    const ownerResult = await supabase
      .from("profiles")
      .select("id,auth_user_id,status")
      .eq("id", session.created_by)
      .maybeSingle();
    if (!ownerResult.error) {
      createdByProfileExists = Boolean(ownerResult.data);
      createdByProfileAuthMatchesOwner =
        ownerResult.data?.auth_user_id === ownerAuthUserId;
    }
  }

  const profileMatchesProvided =
    profileResult.data?.id === ownerProfileId &&
    profileResult.data?.auth_user_id === ownerAuthUserId;
  const sessionOwnedByCurrentProfile = session.created_by === ownerProfileId;

  output({
    ok: true,
    status: "PASS_READ_ONLY_SANITIZED_OWNERSHIP_METADATA",
    storedSessionState: session.status,
    approvalMarkerPresent: Boolean(session.approval_marker),
    currentOwnerProfileResolved: Boolean(profileResult.data),
    currentOwnerProfileMatchesProvided: profileMatchesProvided,
    sessionCreatedByPresent: Boolean(session.created_by),
    sessionCreatedByIdentifierType: createdByType,
    sessionUpdatedByIdentifierType: updatedByType,
    sessionApprovedByIdentifierType: approvedByType,
    sessionOwnedByCurrentProfile,
    sessionCreatedByProfileExists: createdByProfileExists,
    sessionCreatedByProfileAuthMatchesOwner: createdByProfileAuthMatchesOwner,
    runtimeIdentifierType: "PROFILE_ID_FROM_PERMISSION_CONTEXT",
    rpcExpectedIdentifierType: "PROFILE_ID_FROM_PUBLIC_CURRENT_PROFILE_ID",
    rpcLookupPredicate:
      "import_sessions.id = p_import_session_id AND import_sessions.created_by = public.current_profile_id()",
    securityInvokerParticipates: true,
    rlsLikelyParticipates: true,
    exactContractMismatch: sessionOwnedByCurrentProfile
      ? "NONE_FOR_SESSION_CREATED_BY_PROFILE_ID"
      : `SESSION_CREATED_BY_${createdByType}_BUT_RPC_CURRENT_PROFILE_ID_IS_CURRENT_OWNER_PROFILE_ID`,
  });
}

main().catch(() => {
  output({
    ok: false,
    status: "BLOCKED_UNEXPECTED_READ_ONLY_VERIFIER_ERROR",
    sessionOwnerIdentifierType: "UNKNOWN_UNEXPECTED_ERROR",
    runtimeIdentifierType: "PROFILE_ID_FROM_PERMISSION_CONTEXT",
    rpcExpectedIdentifierType: "PROFILE_ID_FROM_PUBLIC_CURRENT_PROFILE_ID",
    exactContractMismatch: "UNKNOWN_UNEXPECTED_ERROR",
  });
});
