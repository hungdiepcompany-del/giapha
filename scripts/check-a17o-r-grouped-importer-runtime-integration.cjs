#!/usr/bin/env node

// Git-free/package-free static and fixture contract for the A17O-R runtime path.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = process.cwd();
const failures = [];
const paths = {
  grouping: "lib/import/giapha4/canonical-family-grouping.ts",
  adapter: "lib/import/giapha4/grouped-official-import-executor-adapter.ts",
  service: "lib/import/giapha4/official-import-service.ts",
  manifestRead: "lib/import/giapha4/manifest-read-service.ts",
  route: "app/api/admin/import-sessions/[sessionId]/official-import/route.ts",
  dryRun: "lib/import/giapha4/dry-run-mapping-preview-service.ts",
  reviewPack: "lib/import/giapha4/import-review-pack-service.ts",
};

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}
function sha(value) { return crypto.createHash("sha256").update(value).digest("hex"); }
function stableJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
}
function requireIncludes(content, token, label = token) { if (!content.includes(token)) failures.push(`missing ${label}`); }
function rejectPattern(content, pattern, label) { if (pattern.test(content)) failures.push(`forbidden ${label}`); }
function assertCase(label, condition) { if (!condition) failures.push(`fixture failed: ${label}`); }

function hasCompleteExecutionManifest(manifest) {
  const session = manifest?.session;
  return Boolean(
    session &&
      manifest.peoplePreview.length === session.personCandidateCount &&
      manifest.relationshipsPreview.length === session.relationshipCandidateCount &&
      manifest.warnings.length === session.warningCount &&
      manifest.duplicateCandidates.length === session.duplicateCandidateCount,
  );
}

function groupKey(parents) {
  const parentFingerprints = Array.from(new Set(parents)).sort();
  return `a17o-import-family-group:v1:${sha(JSON.stringify({ version: "a17o-import-family-group:v1", parentFingerprints }))}`;
}
function groupedFixture(childCount, reverse = false, duplicateRows = false) {
  const rows = Array.from({ length: childCount }, (_, index) => [["parent-a", `child-${index + 1}`], ["parent-b", `child-${index + 1}`]]).flat();
  if (duplicateRows) rows.push(["parent-a", "child-1"], ["parent-b", "child-1"]);
  if (reverse) rows.reverse();
  const parents = new Set(), children = new Set(), references = new Set();
  for (const [parent, child] of rows) { parents.add(parent); children.add(child); references.add(sha(stableJson({ parent, child }))); }
  const plan = { contractVersion: 1, familyGroups: [{ groupKey: groupKey(parents), parents: [...parents].sort(), children: [...children].sort(), sourceReferenceHashes: [...references].sort() }] };
  return { plan, hash: sha(stableJson(plan)) };
}

// Pure JS fixture of the runtime contract; no package metadata or TypeScript transpilation.
function derivePersistedDatabaseApprovalMarker(manifest) {
  const sessionMarker = manifest?.session?.approvalMarker;
  const eligible = (manifest?.writeManifests || []).filter((item) => item.status === "owner_approved" || item.status === "ready_for_apply");
  if (typeof sessionMarker !== "string" || sessionMarker.trim().length === 0) return { ok: false, reason: "SESSION_MARKER_MISSING_OR_BLANK" };
  if (eligible.length !== 1) return { ok: false, reason: "EXACTLY_ONE_WRITE_MANIFEST_REQUIRED" };
  const writeMarker = eligible[0]?.approvalMarker;
  if (typeof writeMarker !== "string" || writeMarker.trim().length === 0) return { ok: false, reason: "WRITE_MARKER_MISSING_OR_BLANK" };
  if (writeMarker !== sessionMarker) return { ok: false, reason: "MARKERS_MISMATCH" };
  return { ok: true, marker: writeMarker };
}

function markerContractFailures(source) {
  const missing = [];
  for (const token of [
    "function deriveA17ODatabaseApprovalMarker(", "manifest.writeManifests.filter(",
    'writeManifest.status === "owner_approved"', 'writeManifest.status === "ready_for_apply"',
    "eligibleWriteManifests.length !== 1", 'typeof sessionMarker !== "string" || sessionMarker.trim().length === 0',
    'typeof writeManifestMarker !== "string" ||', "writeManifestMarker.trim().length === 0",
    "if (writeManifestMarker !== sessionMarker)", "const a17oDatabaseApproval = deriveA17ODatabaseApprovalMarker(",
    "if (!a17oDatabaseApproval.ok)", "approvalMarker: a17oDatabaseApproval.marker",
    "confirmMarker: a17oDatabaseApproval.marker", "confirmation.confirmMarker !== expectedSessionMarker",
    "A17O_R_DATABASE_APPROVAL_MARKER_PROVENANCE_BLOCKED_BEFORE_RPC",
  ]) if (!source.includes(token)) missing.push(token);
  const deriveAt = source.indexOf("const a17oDatabaseApproval = deriveA17ODatabaseApprovalMarker(");
  const planAt = source.indexOf("const groupedPlanResult = buildA17OGroupedOfficialImportPlan(");
  const rpcAt = source.indexOf("const executionResult = await executor(");
  if (!(deriveAt >= 0 && deriveAt < planAt && planAt < rpcAt)) missing.push("approval provenance ordering");
  return missing;
}

function completeManifestContractFailures(source) {
  const missing = [];
  for (const token of [
    "params.manifest.peoplePreview.length !==",
    "params.manifest.session.personCandidateCount",
    "params.manifest.relationshipsPreview.length !==",
    "params.manifest.session.relationshipCandidateCount",
    "params.manifest.warnings.length !== params.manifest.session.warningCount",
    "params.manifest.duplicateCandidates.length !==",
    "params.manifest.session.duplicateCandidateCount",
    "reasons.push(A17O_R_COMPLETE_EXECUTION_MANIFEST_REQUIRED_BLOCKER)",
  ]) if (!source.includes(token)) missing.push(token);
  const completenessAt = source.indexOf(
    "reasons.push(A17O_R_COMPLETE_EXECUTION_MANIFEST_REQUIRED_BLOCKER)",
  );
  const clientAt = source.indexOf("const sameRunRpcClient =");
  const rpcAt = source.indexOf("const executionResult = await executor(");
  if (!(completenessAt >= 0 && completenessAt < clientAt && clientAt < rpcAt)) {
    missing.push("complete manifest fail-closed ordering before RPC");
  }
  return missing;
}

const source = Object.fromEntries(Object.entries(paths).map(([key, value]) => [key, read(value)]));
for (const failure of markerContractFailures(source.service)) failures.push(`marker contract: ${failure}`);
for (const failure of completeManifestContractFailures(source.service)) {
  failures.push(`complete manifest contract: ${failure}`);
}
for (const [label, from, to] of [
  ["route marker validation", "confirmation.confirmMarker !== expectedSessionMarker", "false"],
  ["exactly-one manifest guard", "eligibleWriteManifests.length !== 1", "eligibleWriteManifests.length < 1"],
  ["write marker nonblank guard", "writeManifestMarker.trim().length === 0", "false"],
  ["session/write marker equality", "if (writeManifestMarker !== sessionMarker)", "if (false)"],
  ["plan marker provenance", "approvalMarker: a17oDatabaseApproval.marker", "approvalMarker: params.confirmation.confirmMarker as string"],
  ["RPC marker provenance", "confirmMarker: a17oDatabaseApproval.marker", "confirmMarker: params.confirmation.confirmMarker as string"],
]) assertCase(`negative ${label}`, markerContractFailures(source.service.replace(from, to)).length > 0);
for (const [label, from, to] of [
  ["people cardinality", "params.manifest.peoplePreview.length !==", "false &&"],
  ["relationship cardinality", "params.manifest.relationshipsPreview.length !==", "false &&"],
  ["warning cardinality", "params.manifest.warnings.length !==", "false &&"],
  ["duplicate cardinality", "params.manifest.duplicateCandidates.length !==", "false &&"],
]) assertCase(
  `negative ${label}`,
  completeManifestContractFailures(source.service.replace(from, to)).length > 0,
);

const marker = "APPROVE_A16BC_OWNER_APPROVED_FOR_DB_WRITE";
const manifest = (sessionMarker, writeManifests) => ({ session: { approvalMarker: sessionMarker }, writeManifests });
const approved = (approvalMarker = marker) => ({ status: "owner_approved", approvalMarker });
const ready = (approvalMarker = marker) => ({ status: "ready_for_apply", approvalMarker });
assertCase("owner approved marker passes", derivePersistedDatabaseApprovalMarker(manifest(marker, [approved()])).ok);
assertCase("ready-for-apply marker passes", derivePersistedDatabaseApprovalMarker(manifest(marker, [ready()])).ok);
assertCase("missing session marker blocks", !derivePersistedDatabaseApprovalMarker(manifest(null, [approved()])).ok);
assertCase("blank session marker blocks", !derivePersistedDatabaseApprovalMarker(manifest(" ", [approved()])).ok);
assertCase("zero eligible manifests blocks", !derivePersistedDatabaseApprovalMarker(manifest(marker, [])).ok);
assertCase("multiple eligible manifests block", !derivePersistedDatabaseApprovalMarker(manifest(marker, [approved(), ready()])).ok);
assertCase("blank write marker blocks", !derivePersistedDatabaseApprovalMarker(manifest(marker, [approved(" ")])).ok);
assertCase("mismatched markers block", !derivePersistedDatabaseApprovalMarker(manifest(marker, [approved("other")])).ok);
const siblings = groupedFixture(8);
assertCase("eight siblings form one canonical family", siblings.plan.familyGroups.length === 1 && siblings.plan.familyGroups[0].children.length === 8);
assertCase("input ordering is stable", siblings.hash === groupedFixture(8, true).hash);
assertCase("duplicate source rows are stable", siblings.hash === groupedFixture(8, false, true).hash);
const completeOverHundredManifest = {
  session: {
    personCandidateCount: 102,
    relationshipCandidateCount: 134,
    warningCount: 46,
    duplicateCandidateCount: 8,
  },
  peoplePreview: Array.from({ length: 102 }, (_, index) => ({ index })),
  relationshipsPreview: Array.from({ length: 134 }, (_, index) => ({ index })),
  warnings: Array.from({ length: 46 }, (_, index) => ({ index })),
  duplicateCandidates: Array.from({ length: 8 }, (_, index) => ({ index })),
};
assertCase(
  "complete execution manifest above preview limit passes",
  hasCompleteExecutionManifest(completeOverHundredManifest),
);
assertCase(
  "100-person preview truncation blocks before RPC",
  !hasCompleteExecutionManifest({
    ...completeOverHundredManifest,
    peoplePreview: completeOverHundredManifest.peoplePreview.slice(0, 100),
  }),
);
assertCase(
  "100-relationship preview truncation blocks before RPC",
  !hasCompleteExecutionManifest({
    ...completeOverHundredManifest,
    relationshipsPreview:
      completeOverHundredManifest.relationshipsPreview.slice(0, 100),
  }),
);
assertCase(
  "warning truncation blocks before RPC",
  !hasCompleteExecutionManifest({
    ...completeOverHundredManifest,
    warnings: completeOverHundredManifest.warnings.slice(0, 45),
  }),
);
assertCase(
  "duplicate-candidate truncation blocks before RPC",
  !hasCompleteExecutionManifest({
    ...completeOverHundredManifest,
    duplicateCandidates: completeOverHundredManifest.duplicateCandidates.slice(0, 7),
  }),
);

for (const [content, token, label] of [
  [source.grouping, "A17O_IMPORTER_CANONICAL_GROUPING_RUNTIME_ACTIVE = true", "grouping runtime active"],
  [source.grouping, "buildA17OGroupedOfficialImportPlan", "grouped plan builder"],
  [source.grouping, "childIdIncludedInGroupKey: false", "child identity excluded"],
  [source.adapter, "a17o_tx_execute_grouped_giapha4_official_import", "grouped executor adapter"],
  [source.adapter, "p_confirm_marker", "adapter confirmation marker"], [source.adapter, "p_dry_run_only", "adapter dry-run argument"],
  [source.service, "A17O_R_GROUPED_PLAN_BLOCKED_BEFORE_RPC", "plan fail-closed branch"], [source.service, "runRpcInvocationIdentityPrecheck", "identity precheck"],
  [source.service, "A17O_R_BLOCKED_COMPLETE_EXECUTION_MANIFEST_REQUIRED", "complete execution manifest blocker"],
  [source.service, "officialImportExecution: true", "official execution read mode"],
  [source.manifestRead, "A16R_APPROVAL_CRITICAL_MANIFEST_MAX_ROWS", "bounded complete-scope read limit"],
  [source.route, "confirmation.confirmMarker", "route confirmation marker"], [source.dryRun, "groupedExecutorMutationCall: false", "dry-run no mutation"],
  [source.reviewPack, "canonicalFamilyGroupCount", "review-pack grouped count"],
]) requireIncludes(content, token, label);
assertCase(
  "shared manifest reader uses the complete-scope ceiling",
  source.manifestRead.includes("_options: ImportManifestReadOptions = {}") &&
    source.manifestRead.includes("void _options;") &&
    !/options\.fullAuditExport\s*\|\|\s*options\.officialImportExecution\s*\?\s*1000\s*:\s*100/.test(source.manifestRead),
);
for (const [content, label] of [[source.adapter, paths.adapter], [source.service, paths.service], [source.route, paths.route], [source.grouping, paths.grouping]]) {
  rejectPattern(content, /SUPABASE_SERVICE_ROLE_KEY|service[_-]?role/i, `${label} service role`);
  rejectPattern(content, /fetch\([\s\S]{0,200}official-import/i, `${label} production endpoint call`);
  rejectPattern(content, /\.from\([\s\S]{0,160}\.(insert|update|delete|upsert)\s*\(/i, `${label} direct database write`);
}
rejectPattern(source.adapter, /A16P_TX|a16p_tx_execute_giapha4_official_import/i, "old executor fallback");
rejectPattern(source.grouping, /fullName|displayName|notesPrivate|birthPlace|homeTown/i, "PII in grouped diagnostics");

if (failures.length) { console.error("A-17O-R grouped importer runtime integration check failed:"); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log("A-17O-R grouped importer runtime integration check passed.");
console.log("GIT_METADATA=NOT_REQUIRED");
console.log("PACKAGE_METADATA=NOT_REQUIRED");
console.log("TYPESCRIPT_TRANSPILATION=NOT_REQUIRED");
console.log("SQL_EXECUTED=NO");
console.log("RPC_CALLED=NO");
module.exports = {
  completeManifestContractFailures,
  derivePersistedDatabaseApprovalMarker,
  markerContractFailures,
};
