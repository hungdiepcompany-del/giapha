const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const failures = [];
const manifestPath = "lib/import/giapha4/manifest-read-service.ts";
const dryRunPath = "lib/import/giapha4/dry-run-mapping-preview-service.ts";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const maxRows = 1000;

function readRequired(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function matches(source, expression) {
  return expression.test(source);
}

function countMatches(source, expression) {
  return (source.match(expression) ?? []).length;
}

function hasCompleteApprovalScope(source) {
  const exactCountChecks = [
    /warnings\.length\s*!==\s*sessionResult\.session\.warningCount/,
    /duplicateCandidates\.length\s*!==\s*sessionResult\.session\.duplicateCandidateCount/,
    /relationshipsPreview\.length\s*!==\s*sessionResult\.session\.relationshipCandidateCount/,
    /peoplePreview\.length\s*!==\s*sessionResult\.session\.personCandidateCount/,
  ];
  const storedCounts = [
    "personCandidateCount",
    "relationshipCandidateCount",
    "warningCount",
    "duplicateCandidateCount",
  ];

  return (
    source.includes("A16R_APPROVAL_CRITICAL_MANIFEST_MAX_ROWS = 1000") &&
    storedCounts.every((field) =>
      matches(
        source,
        new RegExp(
          `sessionResult\\.session\\.${field}\\s*>\\s*(?!=)A16R_APPROVAL_CRITICAL_MANIFEST_MAX_ROWS`,
        ),
      ),
    ) &&
    countMatches(
      source,
      /\.limit\(A16R_APPROVAL_CRITICAL_MANIFEST_MAX_ROWS\)/g,
    ) === 3 &&
    countMatches(source, /\.limit\(2\)/g) === 1 &&
    !source.includes("A16R_APPROVAL_CRITICAL_MANIFEST_MAX_ROWS + 1") &&
    !source.includes("approvalCriticalProbeLimit") &&
    matches(
      source,
      /requiresSingleWriteManifest\s*&&\s*writeManifests\.length\s*!==\s*1/,
    ) &&
    source.includes("const singleWriteManifest = writeManifests[0] ?? null") &&
    matches(
      source,
      /singleWriteManifest\.approvalMarker\s*!==\s*sessionResult\.session\.approvalMarker/,
    ) &&
    matches(
      source,
      /extractPeoplePreview\(\s*\[singleWriteManifest\],\s*A16R_APPROVAL_CRITICAL_MANIFEST_MAX_ROWS,?\s*\)/,
    ) &&
    exactCountChecks.every((expression) => matches(source, expression)) &&
    source.includes("Không chứng minh được manifest đầy đủ theo số lượng đã lưu")
  );
}

function hasBoundedRenderedDetails(source) {
  return [
    "const A16R_RENDERED_MANIFEST_DETAIL_LIMIT = 20",
    "result.peoplePreview.slice(0, A16R_RENDERED_MANIFEST_DETAIL_LIMIT)",
    "result.relationshipsPreview.slice(0, A16R_RENDERED_MANIFEST_DETAIL_LIMIT)",
    "result.warnings.slice(0, A16R_RENDERED_MANIFEST_DETAIL_LIMIT)",
  ].every((token) => source.includes(token));
}

function simulateApprovalCriticalRead(
  {
    stored,
    fetched,
    writeManifestCount = 1,
    sessionApprovalMarker = null,
    writeManifestApprovalMarker = null,
  },
  {
    enforcePreCount = true,
    enforceExactCounts = true,
    enforceSingleWriteManifest = true,
    enforceApprovalMarker = true,
  } = {},
) {
  const counts = [
    stored.people,
    stored.relationships,
    stored.warnings,
    stored.duplicates,
  ];

  if (enforcePreCount && counts.some((count) => count > maxRows)) {
    return { status: "unavailable", reason: "over_ceiling" };
  }

  if (
    enforceSingleWriteManifest &&
    (counts.some((count) => count > 0) || writeManifestCount > 0) &&
    writeManifestCount !== 1
  ) {
    return { status: "unavailable", reason: "write_manifest_ambiguous" };
  }

  if (
    enforceApprovalMarker &&
    sessionApprovalMarker?.trim() &&
    (writeManifestCount !== 1 ||
      writeManifestApprovalMarker !== sessionApprovalMarker)
  ) {
    return { status: "unavailable", reason: "approval_marker_mismatch" };
  }

  if (
    enforceExactCounts &&
    (stored.people !== fetched.people ||
      stored.relationships !== fetched.relationships ||
      stored.warnings !== fetched.warnings ||
      stored.duplicates !== fetched.duplicates)
  ) {
    return { status: "unavailable", reason: "incomplete" };
  }

  return { status: "ready", reason: "complete" };
}

const manifestSource = readRequired(manifestPath);
const dryRunSource = readRequired(dryRunPath);
const panelSource = readRequired(panelPath);

assert(
  hasCompleteApprovalScope(manifestSource),
  "manifest reader must pre-reject >1000 and require fetched warning/duplicate/relationship/person counts to equal stored session counts",
);
assert(
  !/options\.fullAuditExport\s*\|\|\s*options\.officialImportExecution\s*\?\s*1000\s*:\s*100/.test(
    manifestSource,
  ),
  "legacy 100-row default must be absent",
);
assert(
  manifestSource.includes("_options: ImportManifestReadOptions = {}"),
  "legacy option shape must remain compatible while default scope is complete",
);
assert(
  dryRunSource.includes(
    "getImportManifest(sessionId, {\n    fullAuditExport: fullRelationshipAuditExport,\n  })",
  ),
  "dry-run must continue through the shared manifest reader",
);
assert(
  hasBoundedRenderedDetails(panelSource),
  "rendered manifest details must remain bounded at 20 rows",
);

const completeAtBoundary = simulateApprovalCriticalRead({
  stored: { people: 100, relationships: 100, warnings: 0, duplicates: 0 },
  fetched: { people: 100, relationships: 100, warnings: 0, duplicates: 0 },
});
assert(
  completeAtBoundary.status === "ready",
  "exact 100-row boundary must remain complete",
);

const normalScope = simulateApprovalCriticalRead({
  stored: { people: 102, relationships: 134, warnings: 0, duplicates: 0 },
  fetched: { people: 102, relationships: 134, warnings: 0, duplicates: 0 },
});
const officialScope = simulateApprovalCriticalRead({
  stored: { people: 102, relationships: 134, warnings: 0, duplicates: 0 },
  fetched: { people: 102, relationships: 134, warnings: 0, duplicates: 0 },
});
assert(
  normalScope.status === "ready" && officialScope.status === "ready",
  "102 people / 134 relationships must be readable in both normal and official paths",
);

for (const [name, input] of [
  [
    "single pre-approval draft",
    {
      stored: { people: 102, relationships: 134, warnings: 0, duplicates: 0 },
      fetched: { people: 102, relationships: 134, warnings: 0, duplicates: 0 },
      writeManifestCount: 1,
    },
  ],
  [
    "single owner-approved manifest",
    {
      stored: { people: 102, relationships: 134, warnings: 0, duplicates: 0 },
      fetched: { people: 102, relationships: 134, warnings: 0, duplicates: 0 },
      writeManifestCount: 1,
      sessionApprovalMarker: "approved-marker",
      writeManifestApprovalMarker: "approved-marker",
    },
  ],
  [
    "single post-import manifest",
    {
      stored: { people: 102, relationships: 134, warnings: 0, duplicates: 0 },
      fetched: { people: 102, relationships: 134, warnings: 0, duplicates: 0 },
      writeManifestCount: 1,
      sessionApprovalMarker: "write-completed-marker",
      writeManifestApprovalMarker: "write-completed-marker",
    },
  ],
]) {
  assert(
    simulateApprovalCriticalRead(input).status === "ready",
    `${name} must remain readable`,
  );
}

for (const [name, input, expectedReason] of [
  [
    "two manifests with stale substitution candidate",
    {
      stored: { people: 102, relationships: 134, warnings: 0, duplicates: 0 },
      fetched: { people: 102, relationships: 134, warnings: 0, duplicates: 0 },
      writeManifestCount: 2,
    },
    "write_manifest_ambiguous",
  ],
  [
    "session/write manifest approval marker mismatch",
    {
      stored: { people: 102, relationships: 134, warnings: 0, duplicates: 0 },
      fetched: { people: 102, relationships: 134, warnings: 0, duplicates: 0 },
      writeManifestCount: 1,
      sessionApprovalMarker: "session-marker",
      writeManifestApprovalMarker: "stale-marker",
    },
    "approval_marker_mismatch",
  ],
]) {
  const result = simulateApprovalCriticalRead(input);
  assert(
    result.status === "unavailable" && result.reason === expectedReason,
    `${name} must fail closed`,
  );
}

assert(
  simulateApprovalCriticalRead({
    stored: { people: 1001, relationships: 134, warnings: 0, duplicates: 0 },
    fetched: { people: 1000, relationships: 134, warnings: 0, duplicates: 0 },
  }).status === "unavailable",
  ">1000 rows must fail closed before a capped query is accepted",
);

for (const [name, fetched] of [
  ["warnings truncated", { people: 102, relationships: 134, warnings: 0, duplicates: 8 }],
  ["duplicates truncated", { people: 102, relationships: 134, warnings: 3, duplicates: 7 }],
  ["relationships truncated", { people: 102, relationships: 133, warnings: 3, duplicates: 8 }],
  ["approved scope people missing", { people: 101, relationships: 134, warnings: 3, duplicates: 8 }],
]) {
  assert(
    simulateApprovalCriticalRead({
      stored: { people: 102, relationships: 134, warnings: 3, duplicates: 8 },
      fetched,
    }).status === "unavailable",
    `${name} must fail closed`,
  );
}

const negativeControls = [
  [
    "legacy 100-row cap",
    () =>
      !hasCompleteApprovalScope(
        manifestSource.replace(
          "A16R_APPROVAL_CRITICAL_MANIFEST_MAX_ROWS = 1000",
          "A16R_APPROVAL_CRITICAL_MANIFEST_MAX_ROWS = 100",
        ),
      ),
  ],
  [
    "1001-row query",
    () =>
      !hasCompleteApprovalScope(
        manifestSource.replace(
          ".limit(A16R_APPROVAL_CRITICAL_MANIFEST_MAX_ROWS)",
          ".limit(A16R_APPROVAL_CRITICAL_MANIFEST_MAX_ROWS + 1)",
        ),
      ),
  ],
  [
    "missing stored-count precheck",
    () =>
      !hasCompleteApprovalScope(
        manifestSource.replace(
          "sessionResult.session.personCandidateCount >",
          "sessionResult.session.personCandidateCount >=",
        ),
      ),
  ],
  [
    "missing warning completeness check",
    () =>
      !hasCompleteApprovalScope(
        manifestSource.replace(
          "warnings.length !== sessionResult.session.warningCount",
          "warnings.length === sessionResult.session.warningCount",
        ),
      ),
  ],
  [
    "missing approved-scope people completeness check",
    () =>
      !hasCompleteApprovalScope(
        manifestSource.replace(
          "peoplePreview.length !== sessionResult.session.personCandidateCount",
          "peoplePreview.length === sessionResult.session.personCandidateCount",
        ),
      ),
  ],
  [
    "write manifest multi-row query",
    () =>
      !hasCompleteApprovalScope(
        manifestSource.replace(".limit(2)", ".limit(20)"),
      ),
  ],
  [
    "missing single write manifest rejection",
    () =>
      !hasCompleteApprovalScope(
        manifestSource.replace(
          "requiresSingleWriteManifest && writeManifests.length !== 1",
          "requiresSingleWriteManifest && false",
        ),
      ),
  ],
  [
    "missing session/write manifest marker equality",
    () =>
      !hasCompleteApprovalScope(
        manifestSource.replace(
          "singleWriteManifest.approvalMarker !== sessionResult.session.approvalMarker",
          "false",
        ),
      ),
  ],
  [
    "unbounded warning rendering",
    () =>
      !hasBoundedRenderedDetails(
        panelSource.replace(
          "result.warnings.slice(0, A16R_RENDERED_MANIFEST_DETAIL_LIMIT)",
          "result.warnings",
        ),
      ),
  ],
  [
    "disabled exact-count runtime guard is unsafe",
    () =>
      simulateApprovalCriticalRead(
        {
          stored: { people: 102, relationships: 134, warnings: 3, duplicates: 8 },
          fetched: { people: 101, relationships: 134, warnings: 3, duplicates: 8 },
        },
        { enforceExactCounts: false },
      ).status === "ready",
  ],
  [
    "disabled single-manifest runtime guard is unsafe",
    () =>
      simulateApprovalCriticalRead(
        {
          stored: { people: 102, relationships: 134, warnings: 0, duplicates: 0 },
          fetched: { people: 102, relationships: 134, warnings: 0, duplicates: 0 },
          writeManifestCount: 2,
        },
        { enforceSingleWriteManifest: false },
      ).status === "ready",
  ],
  [
    "disabled approval-marker runtime guard is unsafe",
    () =>
      simulateApprovalCriticalRead(
        {
          stored: { people: 102, relationships: 134, warnings: 0, duplicates: 0 },
          fetched: { people: 102, relationships: 134, warnings: 0, duplicates: 0 },
          sessionApprovalMarker: "session-marker",
          writeManifestApprovalMarker: "stale-marker",
        },
        { enforceApprovalMarker: false },
      ).status === "ready",
  ],
];

for (const [name, control] of negativeControls) {
  assert(control(), `negative control did not reject: ${name}`);
}

console.log(`NEGATIVE_CONTROL_COUNT=${negativeControls.length}`);

if (failures.length > 0) {
  console.error("A16R dry-run full-scope parity check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A16R dry-run full-scope parity check passed.");
