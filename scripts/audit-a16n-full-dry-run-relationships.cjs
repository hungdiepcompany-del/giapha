#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const AUDITED_SESSION_ID = "2af4bfb6-a20e-453e-9804-1b8c0afbdd68";
const EXPECTED_PEOPLE_COUNT = 102;
const EXPECTED_RELATIONSHIP_COUNT = 134;
const EXPECTED_BLOCKED_BY_ERROR_COUNT = 0;
const EXPECTED_WARNING_COUNT = 92;

function usage() {
  console.error(
    [
      "Usage:",
      "  node scripts/audit-a16n-full-dry-run-relationships.cjs <dry-run-preview.json> [--markdown <report.md>] [--partial]",
      "",
      "This is an offline/read-only parser for an owner-exported dry-run preview JSON file.",
      "It does not call production APIs, Supabase, RPC, SQL, or official import.",
    ].join("\n"),
  );
}

function parseArgs(argv) {
  const args = [...argv];
  const inputPath = args.shift();
  let markdownPath = null;
  let partialMode = false;

  while (args.length > 0) {
    const arg = args.shift();
    if (arg === "--markdown") {
      markdownPath = args.shift() ?? null;
      continue;
    }
    if (arg === "--partial") {
      partialMode = true;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!inputPath) throw new Error("Missing dry-run preview JSON path.");
  if (markdownPath === "") throw new Error("Missing markdown output path.");

  return { inputPath, markdownPath, partialMode };
}

function readJsonFile(filePath) {
  const absolutePath = path.resolve(filePath);
  const content = fs.readFileSync(absolutePath, "utf8");
  return JSON.parse(content);
}

function normalizeText(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");
}

function comparable(value) {
  return normalizeText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d");
}

function roleFromLabel(label) {
  const normalized = comparable(label);
  if (normalized.startsWith("bo:") || normalized.startsWith("cha:")) return "father";
  if (normalized.startsWith("me:")) return "mother";
  return "unknown";
}

function hasFemaleNameMarker(name) {
  const normalized = ` ${comparable(name)} `;
  return /\bthi\b/.test(normalized) || /\bba\b/.test(normalized) || /\bcu ba\b/.test(normalized);
}

function hasMaleNameMarker(name) {
  const normalized = ` ${comparable(name)} `;
  return /\bvan\b/.test(normalized) || /\bong\b/.test(normalized) || /\bcu ong\b/.test(normalized);
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function assertEqual(actual, expected, label, failures) {
  if (actual !== expected) failures.push(`${label}: expected ${expected}, got ${actual}`);
}

function validateTopLevel(payload, partialMode = false) {
  const failures = [];
  const summary = payload.summary ?? {};
  const proposedPeople = asArray(payload.proposedPeople);
  const proposedRelationships = asArray(payload.proposedRelationships);
  const peopleExportCount =
    summary.proposedPeopleExportCount ?? proposedPeople.length;
  const relationshipExportCount =
    summary.proposedRelationshipExportCount ?? proposedRelationships.length;

  assertEqual(payload.sessionId, AUDITED_SESSION_ID, "sessionId", failures);
  assertEqual(payload.dryRunPreviewOnly, true, "dryRunPreviewOnly", failures);
  assertEqual(payload.readOnly, true, "readOnly", failures);
  assertEqual(payload.dbWrite, false, "dbWrite", failures);
  assertEqual(payload.peopleWrite, false, "peopleWrite", failures);
  assertEqual(payload.relationshipWrite, false, "relationshipWrite", failures);
  assertEqual(payload.treeLayoutWrite, false, "treeLayoutWrite", failures);
  assertEqual(payload.revisionWrite, false, "revisionWrite", failures);
  assertEqual(payload.canProceedToOfficialImport, false, "canProceedToOfficialImport", failures);
  assertEqual(payload.officialImportOpen, false, "officialImportOpen", failures);
  assertEqual(summary.proposedPeopleCount, EXPECTED_PEOPLE_COUNT, "summary.proposedPeopleCount", failures);
  assertEqual(
    summary.proposedRelationshipCount,
    EXPECTED_RELATIONSHIP_COUNT,
    "summary.proposedRelationshipCount",
    failures,
  );
  assertEqual(
    summary.blockedByErrorCount,
    EXPECTED_BLOCKED_BY_ERROR_COUNT,
    "summary.blockedByErrorCount",
    failures,
  );
  assertEqual(summary.warningCount, EXPECTED_WARNING_COUNT, "summary.warningCount", failures);

  if (!partialMode) {
    assertEqual(payload.auditExportOnly, true, "auditExportOnly", failures);
    assertEqual(
      payload.fullRelationshipAuditExport,
      true,
      "fullRelationshipAuditExport",
      failures,
    );
    assertEqual(summary.exportCapped, false, "summary.exportCapped", failures);
    assertEqual(peopleExportCount, EXPECTED_PEOPLE_COUNT, "proposedPeopleExportCount", failures);
    assertEqual(
      relationshipExportCount,
      EXPECTED_RELATIONSHIP_COUNT,
      "proposedRelationshipExportCount",
      failures,
    );
  }

  if (
    !partialMode &&
    summary.proposedRelationshipCount === EXPECTED_RELATIONSHIP_COUNT &&
    proposedRelationships.length < EXPECTED_RELATIONSHIP_COUNT
  ) {
    failures.push("A16N_CAPPED_PREVIEW_JSON_REJECTED_FOR_FULL_AUDIT");
  }

  return failures;
}

function buildPersonLookup(proposedPeople) {
  const lookup = new Map();
  for (const person of proposedPeople) {
    const sourceFingerprint = normalizeText(person.sourceFingerprint);
    if (!sourceFingerprint) continue;
    lookup.set(sourceFingerprint, {
      sourceFingerprint,
      fullName: normalizeText(person.fullName),
      displayName: normalizeText(person.displayName),
      gender: normalizeText(person.gender || "unknown"),
      sourceRowIndex: person.sourceRowIndex ?? null,
      generationNumber: person.generationNumber ?? null,
      birthDateText: person.birthDateText ?? null,
      deathDateText: person.deathDateText ?? null,
    });
  }
  return lookup;
}

function classifyRelationship(relationship, index, peopleByFingerprint) {
  const reasons = [];
  const categories = new Set();
  let severity = "info";

  const sourceFingerprint = normalizeText(relationship.sourcePersonFingerprint);
  const relatedFingerprint = normalizeText(relationship.relatedPersonFingerprint);
  const sourcePerson = peopleByFingerprint.get(sourceFingerprint) ?? null;
  const relatedPerson = peopleByFingerprint.get(relatedFingerprint) ?? null;
  const role = roleFromLabel(relationship.relationshipLabelVi);
  const sourceGender = comparable(sourcePerson?.gender ?? "unknown");

  if (!sourcePerson || !relatedPerson) {
    categories.add("REVIEW_MISSING_PERSON_LOOKUP");
    severity = "high";
    if (!sourcePerson) reasons.push("sourcePersonFingerprint missing from proposedPeople");
    if (!relatedPerson) reasons.push("relatedPersonFingerprint missing from proposedPeople");
  }

  if (relationship.relationshipType !== "parent_child") {
    categories.add("REVIEW_UNKNOWN");
    if (severity === "info") severity = "medium";
    reasons.push(`relationshipType is ${relationship.relationshipType || "missing"}`);
  }

  if (relationship.confidence !== "strong") {
    categories.add("REVIEW_WEAK_CONFIDENCE");
    if (severity === "info") severity = "medium";
    reasons.push(`confidence is ${relationship.confidence || "missing"}`);
  }

  if (relationship.ambiguityStatus !== "clear") {
    categories.add("REVIEW_AMBIGUOUS_RELATIONSHIP");
    if (severity === "info") severity = "medium";
    reasons.push(`ambiguityStatus is ${relationship.ambiguityStatus || "missing"}`);
  }

  if (role === "father" && sourceGender === "female") {
    categories.add("REVIEW_ROLE_GENDER_MISMATCH");
    severity = "high";
    reasons.push("relationshipLabelVi starts with father role but sourcePersonGender is female");
  }

  if (role === "mother" && sourceGender === "male") {
    categories.add("REVIEW_ROLE_GENDER_MISMATCH");
    severity = "high";
    reasons.push("relationshipLabelVi starts with mother role but sourcePersonGender is male");
  }

  if (sourcePerson && (sourceGender === "unknown" || !sourceGender)) {
    if (role === "father" && hasFemaleNameMarker(sourcePerson.fullName)) {
      categories.add("REVIEW_UNKNOWN");
      if (severity === "info") severity = "medium";
      reasons.push("father label with culturally female name marker and unknown parsed gender");
    }
    if (role === "mother" && hasMaleNameMarker(sourcePerson.fullName)) {
      categories.add("REVIEW_UNKNOWN");
      if (severity === "info") severity = "medium";
      reasons.push("mother label with culturally male name marker and unknown parsed gender");
    }
  }

  if (sourcePerson && relatedPerson) {
    const sourceGeneration = Number(sourcePerson.generationNumber);
    const relatedGeneration = Number(relatedPerson.generationNumber);
    if (
      Number.isFinite(sourceGeneration) &&
      Number.isFinite(relatedGeneration) &&
      sourceGeneration >= relatedGeneration
    ) {
      categories.add("REVIEW_DIRECTION_SUSPECTED");
      severity = "high";
      reasons.push(
        `parent generation ${sourceGeneration} is not before child generation ${relatedGeneration}`,
      );
    }
  }

  const classification = categories.size > 0 ? [...categories].join("+") : "PASS_CLEAR";

  return {
    relationshipIndex: index + 1,
    sourceRowIndex: relationship.sourceRowIndex ?? null,
    relationshipType: relationship.relationshipType ?? null,
    relationshipLabelVi: relationship.relationshipLabelVi ?? null,
    sourcePersonFingerprint: sourceFingerprint || null,
    sourcePersonName: sourcePerson?.fullName ?? null,
    sourcePersonGender: sourcePerson?.gender ?? null,
    relatedPersonFingerprint: relatedFingerprint || null,
    relatedPersonName: relatedPerson?.fullName ?? null,
    relatedPersonGender: relatedPerson?.gender ?? null,
    confidence: relationship.confidence ?? null,
    ambiguityStatus: relationship.ambiguityStatus ?? null,
    suspiciousReason: reasons.join("; ") || null,
    severity,
    classification,
  };
}

function summarize(payload, auditRows, validationFailures, partialMode = false) {
  const countWhere = (predicate) => auditRows.filter(predicate).length;

  const summary = {
    sessionId: payload.sessionId,
    totalPeople: asArray(payload.proposedPeople).length,
    totalRelationships: auditRows.length,
    passClearCount: countWhere((row) => row.classification === "PASS_CLEAR"),
    suspiciousCount: countWhere((row) => row.classification !== "PASS_CLEAR"),
    roleGenderMismatchCount: countWhere((row) =>
      row.classification.includes("REVIEW_ROLE_GENDER_MISMATCH"),
    ),
    missingPersonLookupCount: countWhere((row) =>
      row.classification.includes("REVIEW_MISSING_PERSON_LOOKUP"),
    ),
    ambiguousCount: countWhere((row) =>
      row.classification.includes("REVIEW_AMBIGUOUS_RELATIONSHIP"),
    ),
    weakConfidenceCount: countWhere((row) =>
      row.classification.includes("REVIEW_WEAK_CONFIDENCE"),
    ),
    directionSuspectedCount: countWhere((row) =>
      row.classification.includes("REVIEW_DIRECTION_SUSPECTED"),
    ),
    unknownCount: countWhere((row) => row.classification.includes("REVIEW_UNKNOWN")),
    officialImportOpen: payload.officialImportOpen,
    canProceedToOfficialImport: payload.canProceedToOfficialImport,
    auditAcceptanceMarker:
      !partialMode &&
      validationFailures.length === 0 &&
      asArray(payload.proposedPeople).length === EXPECTED_PEOPLE_COUNT &&
      auditRows.length === EXPECTED_RELATIONSHIP_COUNT
        ? "A16N_FULL_RELATIONSHIP_AUDIT_JSON_ACCEPTED"
        : null,
    writeFlags: {
      dryRunPreviewOnly: payload.dryRunPreviewOnly,
      readOnly: payload.readOnly,
      dbWrite: payload.dbWrite,
      peopleWrite: payload.peopleWrite,
      relationshipWrite: payload.relationshipWrite,
      treeLayoutWrite: payload.treeLayoutWrite,
      revisionWrite: payload.revisionWrite,
    },
    validationFailures,
    recommendation:
      validationFailures.length > 0 || auditRows.some((row) => row.classification !== "PASS_CLEAR")
        ? "KEEP_OFFICIAL_IMPORT_BLOCKED_AND_REVIEW_A16N_AUDIT_ROWS"
        : "RELATIONSHIP_ROWS_PASS_OFFLINE_AUDIT_KEEP_IMPORT_LOCKED_UNTIL_SEPARATE_OWNER_APPROVAL",
  };

  return summary;
}

function markdownReport(summary, auditRows) {
  const lines = [
    "# A-16N Full Dry-run Relationship Audit Report",
    "",
    "## Summary",
    "",
    "```json",
    JSON.stringify(summary, null, 2),
    "```",
    "",
    "## Review Rows",
    "",
    "| # | Classification | Severity | Label | Source | Source gender | Related | Related gender | Reason |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
  ];

  for (const row of auditRows) {
    lines.push(
      [
        row.relationshipIndex,
        row.classification,
        row.severity,
        row.relationshipLabelVi ?? "",
        row.sourcePersonName ?? row.sourcePersonFingerprint ?? "",
        row.sourcePersonGender ?? "",
        row.relatedPersonName ?? row.relatedPersonFingerprint ?? "",
        row.relatedPersonGender ?? "",
        row.suspiciousReason ?? "",
      ]
        .map((value) => String(value).replace(/\|/g, "\\|"))
        .join(" | ")
        .replace(/^/, "| ")
        .replace(/$/, " |"),
    );
  }

  return `${lines.join("\n")}\n`;
}

function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    usage();
    console.error(error.message);
    process.exit(2);
  }

  const payload = readJsonFile(args.inputPath);
  const validationFailures = validateTopLevel(payload, args.partialMode);
  const proposedPeople = asArray(payload.proposedPeople);
  const proposedRelationships = asArray(payload.proposedRelationships);
  const peopleByFingerprint = buildPersonLookup(proposedPeople);
  const auditRows = proposedRelationships.map((relationship, index) =>
    classifyRelationship(relationship, index, peopleByFingerprint),
  );
  const summary = summarize(payload, auditRows, validationFailures, args.partialMode);
  const output = { summary, auditRows };

  if (args.markdownPath) {
    fs.mkdirSync(path.dirname(path.resolve(args.markdownPath)), { recursive: true });
    fs.writeFileSync(args.markdownPath, markdownReport(summary, auditRows), "utf8");
  }

  console.log(JSON.stringify(output, null, 2));

  if (summary.auditAcceptanceMarker) {
    console.error(summary.auditAcceptanceMarker);
  }
  if (
    validationFailures.includes("A16N_CAPPED_PREVIEW_JSON_REJECTED_FOR_FULL_AUDIT")
  ) {
    console.error("A16N_CAPPED_PREVIEW_JSON_REJECTED_FOR_FULL_AUDIT");
  }

  if (validationFailures.length > 0) process.exitCode = 1;
}

main();
