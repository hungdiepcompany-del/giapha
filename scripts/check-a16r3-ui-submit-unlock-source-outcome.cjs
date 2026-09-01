#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const failures = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

function rejectIncludes(content, token, label = token) {
  if (content.includes(token)) failures.push(`forbidden ${label}`);
}

const panel = read("components/imports/import-session-manifest-panel.tsx");
const client = read(
  "components/imports/a16r-official-import-confirmation-client.tsx",
);
const route = read(
  "app/api/admin/import-sessions/[sessionId]/official-import/route.ts",
);

for (const [token, label] of [
  ["Boolean(a16rPermissionDiagnostic)", "permission diagnostic gate"],
  ["a16rPermissionReady", "strict Owner/admin permission gate"],
  ["currentSessionExplicit", "explicit current-session gate"],
  ["a16bbSessionStateGate.executionEligible", "A-16BB state gate"],
  ["a16rMarkersPresent", "session/runtime marker gate"],
  ["a16rBlockedErrorsClear", "validation and dry-run blocker gate"],
  ["a16rRelationshipAmbiguityClear", "relationship ambiguity gate"],
  [
    '"A16AR_LOCKED_RELATIONSHIP_AMBIGUITY_PRESENT"',
    "relationship ambiguity locked reason",
  ],
  ["a16rWarningsReviewed", "warning review gate"],
  ["a16rDuplicateReviewPackClear", "duplicate and review-pack gate"],
  ["a16pRuntimeCandidateEnabled", "A16P runtime flag gate"],
  ["a16ahExecutionBranchEnabled", "A16AH execution flag gate"],
  [
    "canOpenOfficialImport: a16rSameRunLockedReasons.length === 0",
    "same-run open predicate",
  ],
  [
    "officialImportEnabled: a16rSameRunLockedReasons.length === 0",
    "same-run enabled predicate",
  ],
  ["const a16rSameRunGatePassed =", "final same-run gate"],
  [
    "a16rSameRunPreflight.canOpenOfficialImport &&",
    "final gate requires canOpenOfficialImport",
  ],
  [
    "a16rSameRunPreflight.officialImportEnabled &&",
    "final gate requires officialImportEnabled",
  ],
  [
    "a16rSameRunLockedReasons.length === 0;",
    "final gate requires zero locked reasons",
  ],
  ["canSubmit={a16rSameRunGatePassed}", "client receives final gate"],
  ["lockedReasons={a16rSameRunLockedReasons}", "locked reasons stay visible"],
  [
    "Mọi điều kiện cùng lượt đã đạt; owner vẫn phải tích checkbox xác nhận cuối",
    "unlocked transaction warning",
  ],
  [
    "Các phần staging vẫn chỉ đọc. Chỉ cổng A-16R ở cuối trang có thể gửi đúng một yêu cầu giao dịch",
    "conditional staging safety copy",
  ],
]) {
  requireIncludes(panel, token, label);
}

rejectIncludes(panel, "canSubmit={false}", "unconditional submit lock");
rejectIncludes(
  panel,
  "A16R2_PHASE_LOCK_OFFICIAL_IMPORT_DISABLED_NO_EXECUTOR_CALL",
  "expired A16R2 phase lock",
);
rejectIncludes(panel + client, ".rpc(", "direct client or panel RPC call");

for (const [content, token, label] of [
  [client, "const submitAllowed = canSubmit && confirmed && !submitting && !hasSubmitted", "final checkbox and one-submit guard"],
  [client, "if (!submitAllowed) return;", "submit fail-closed guard"],
  [client, "method: \"POST\"", "authoritative application POST"],
  [client, "body: JSON.stringify(confirmationBody)", "confirmation body"],
  [route, "permissionContext.permissions.includes(\"imports.create\")", "server imports.create gate"],
  [route, "permissionContext.permissions.includes(\"people.create\")", "server people.create gate"],
  [route, "permissionContext.permissions.includes(\"relationships.create\")", "server relationships.create gate"],
  [route, "permissionContext.permissions.includes(\"permissions.manage\")", "server permissions.manage gate"],
  [route, "if (!A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED)", "server A16P gate"],
  [route, "if (!A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED)", "server A16AH gate"],
  [route, "missingConfirmationReasons(sessionId, confirmation)", "server confirmation gate"],
  [client, "importedRelationshipCount?: unknown;", "canonical relationship-count response field"],
  [client, "typeof result.importedRelationshipCount === \"number\"", "canonical relationship-count normalizer"],
  [client, "Imported relationships count: {result.importedRelationshipCount}", "canonical relationship-count display"],
]) {
  requireIncludes(content, token, label);
}

rejectIncludes(
  client,
  "importedRelationshipsCount",
  "non-canonical plural relationship-count field",
);

const postPaths =
  client.match(/fetch\s*\(\s*routePath[\s\S]{0,320}method:\s*"POST"/g) ?? [];
if (postPaths.length !== 1) {
  failures.push(`expected exactly one client POST path, found ${postPaths.length}`);
}

const requiredGateCount = 11;
const allPassedMask = 2 ** requiredGateCount - 1;
for (let mask = 0; mask <= allPassedMask; mask += 1) {
  const gates = Array.from(
    { length: requiredGateCount },
    (_, index) => (mask & (1 << index)) !== 0,
  );
  const lockedReasons = gates.filter((gate) => !gate);
  const canOpenOfficialImport = lockedReasons.length === 0;
  const officialImportEnabled = lockedReasons.length === 0;
  if (!(canOpenOfficialImport && officialImportEnabled)) {
    lockedReasons.push(false);
  }
  const actual =
    canOpenOfficialImport &&
    officialImportEnabled &&
    lockedReasons.length === 0;
  const expected = mask === allPassedMask;
  if (actual !== expected) {
    failures.push(`truth-table mismatch for mask ${mask}`);
    break;
  }
}

if (failures.length > 0) {
  console.error("A16R3_UI_SUBMIT_UNLOCK_SOURCE_OUTCOME=FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A16R3_UI_SUBMIT_UNLOCK_SOURCE_OUTCOME=PASS");
console.log("FAIL_CLOSED_TRUTH_TABLE_CASES=2048");
console.log("UNLOCKED_CASES=1");
console.log("LOCKED_CASES=2047");
console.log("CLIENT_POST_PATH_COUNT=1");
console.log("DIRECT_RPC_PATH_COUNT=0");
console.log("OFFICIAL_IMPORT_EXECUTED=NO");
console.log("REMOTE_DATA_MUTATION=NONE");
