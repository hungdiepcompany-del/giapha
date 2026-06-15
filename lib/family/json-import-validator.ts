import {
  FAMILY_IMPORT_SUPPORTED_SCHEMA_VERSION,
  type FamilyJsonImportInput,
  type ImportSummary,
  type ImportValidationIssue,
} from "@/lib/family/import-types";

type JsonObject = Record<string, unknown>;

type ValidationState = {
  input: FamilyJsonImportInput | null;
  summary: ImportSummary;
  issues: ImportValidationIssue[];
};

const EMPTY_SUMMARY: ImportSummary = {
  schema_version: null,
  app_name: null,
  exported_at: null,
  people_count: 0,
  family_count: 0,
  family_parent_count: 0,
  family_child_count: 0,
  couple_relationship_count: 0,
  tree_layout_count: 0,
  tree_layout_node_count: 0,
};

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: JsonObject, key: string) {
  return typeof value[key] === "string" ? value[key] : null;
}

function getArray(value: JsonObject, key: string, issues: ImportValidationIssue[]) {
  if (!Array.isArray(value[key])) {
    issues.push({
      severity: "error",
      code: "invalid_array",
      path: key,
      message: `${key} phải là mảng.`,
    });
    return [];
  }

  return value[key] as JsonObject[];
}

function idAt(row: unknown) {
  return isObject(row) && typeof row.id === "string" ? row.id.trim() : "";
}

function stringAt(row: unknown, key: string) {
  return isObject(row) && typeof row[key] === "string"
    ? row[key].trim()
    : "";
}

function nullableStringAt(row: unknown, key: string) {
  if (!isObject(row)) {
    return "";
  }

  const value = row[key];
  return typeof value === "string" ? value.trim() : "";
}

function addDuplicateIssues(
  rows: unknown[],
  collectionName: string,
  issues: ImportValidationIssue[],
) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  rows.forEach((row, index) => {
    const id = idAt(row);

    if (!id) {
      issues.push({
        severity: "error",
        code: "missing_id",
        path: `${collectionName}.${index}.id`,
        message: `${collectionName}[${index}] thiếu id.`,
      });
      return;
    }

    if (seen.has(id)) {
      duplicates.add(id);
    }

    seen.add(id);
  });

  for (const duplicateId of duplicates) {
    issues.push({
      severity: "error",
      code: "duplicate_id",
      path: collectionName,
      message: `${collectionName} có id trùng: ${duplicateId}.`,
    });
  }
}

function addReferenceIssue(
  issues: ImportValidationIssue[],
  code: string,
  path: string,
  message: string,
) {
  issues.push({
    severity: "error",
    code,
    path,
    message,
  });
}

function validateReferences(
  people: JsonObject[],
  families: JsonObject[],
  familyParents: JsonObject[],
  familyChildren: JsonObject[],
  couples: JsonObject[],
  treeLayouts: JsonObject[],
  treeLayoutNodes: JsonObject[],
  issues: ImportValidationIssue[],
) {
  const personIds = new Set(people.map(idAt).filter(Boolean));
  const familyIds = new Set(families.map(idAt).filter(Boolean));
  const treeLayoutIds = new Set(treeLayouts.map(idAt).filter(Boolean));

  familyParents.forEach((row, index) => {
    const familyId = stringAt(row, "family_id");
    const personId = stringAt(row, "person_id");

    if (!familyIds.has(familyId)) {
      addReferenceIssue(
        issues,
        "missing_family_reference",
        `family_parents.${index}.family_id`,
        `family_parents[${index}] tham chiếu family_id không tồn tại.`,
      );
    }

    if (!personIds.has(personId)) {
      addReferenceIssue(
        issues,
        "missing_person_reference",
        `family_parents.${index}.person_id`,
        `family_parents[${index}] tham chiếu person_id không tồn tại.`,
      );
    }
  });

  familyChildren.forEach((row, index) => {
    const familyId = stringAt(row, "family_id");
    const personId = stringAt(row, "person_id");

    if (!familyIds.has(familyId)) {
      addReferenceIssue(
        issues,
        "missing_family_reference",
        `family_children.${index}.family_id`,
        `family_children[${index}] tham chiếu family_id không tồn tại.`,
      );
    }

    if (!personIds.has(personId)) {
      addReferenceIssue(
        issues,
        "missing_person_reference",
        `family_children.${index}.person_id`,
        `family_children[${index}] tham chiếu person_id không tồn tại.`,
      );
    }
  });

  couples.forEach((row, index) => {
    const person1Id = stringAt(row, "person1_id");
    const person2Id = stringAt(row, "person2_id");

    if (!personIds.has(person1Id)) {
      addReferenceIssue(
        issues,
        "missing_person_reference",
        `couple_relationships.${index}.person1_id`,
        `couple_relationships[${index}] tham chiếu person1_id không tồn tại.`,
      );
    }

    if (!personIds.has(person2Id)) {
      addReferenceIssue(
        issues,
        "missing_person_reference",
        `couple_relationships.${index}.person2_id`,
        `couple_relationships[${index}] tham chiếu person2_id không tồn tại.`,
      );
    }

    if (person1Id && person1Id === person2Id) {
      addReferenceIssue(
        issues,
        "self_couple_relationship",
        `couple_relationships.${index}`,
        `couple_relationships[${index}] không được nối một người với chính họ.`,
      );
    }
  });

  treeLayoutNodes.forEach((row, index) => {
    const layoutId = stringAt(row, "layout_id");
    const personId = nullableStringAt(row, "person_id");
    const familyId = nullableStringAt(row, "family_id");

    if (!treeLayoutIds.has(layoutId)) {
      addReferenceIssue(
        issues,
        "missing_tree_layout_reference",
        `tree_layout_nodes.${index}.layout_id`,
        `tree_layout_nodes[${index}] tham chiếu layout_id không tồn tại.`,
      );
    }

    if (personId && !personIds.has(personId)) {
      addReferenceIssue(
        issues,
        "missing_person_reference",
        `tree_layout_nodes.${index}.person_id`,
        `tree_layout_nodes[${index}] tham chiếu person_id không tồn tại.`,
      );
    }

    if (familyId && !familyIds.has(familyId)) {
      addReferenceIssue(
        issues,
        "missing_family_reference",
        `tree_layout_nodes.${index}.family_id`,
        `tree_layout_nodes[${index}] tham chiếu family_id không tồn tại.`,
      );
    }
  });
}

function validateAncestorCycles(
  familyParents: JsonObject[],
  familyChildren: JsonObject[],
  issues: ImportValidationIssue[],
) {
  const parentsByFamily = new Map<string, string[]>();
  const childrenByFamily = new Map<string, string[]>();

  for (const row of familyParents) {
    const familyId = stringAt(row, "family_id");
    const personId = stringAt(row, "person_id");

    if (!familyId || !personId) {
      continue;
    }

    parentsByFamily.set(familyId, [
      ...(parentsByFamily.get(familyId) ?? []),
      personId,
    ]);
  }

  for (const row of familyChildren) {
    const familyId = stringAt(row, "family_id");
    const personId = stringAt(row, "person_id");

    if (!familyId || !personId) {
      continue;
    }

    childrenByFamily.set(familyId, [
      ...(childrenByFamily.get(familyId) ?? []),
      personId,
    ]);
  }

  const descendants = new Map<string, Set<string>>();

  for (const [familyId, parents] of parentsByFamily) {
    const children = childrenByFamily.get(familyId) ?? [];

    for (const parentId of parents) {
      const set = descendants.get(parentId) ?? new Set<string>();

      children.forEach((childId) => set.add(childId));
      descendants.set(parentId, set);
    }
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();

  function visit(personId: string, stack: string[]): string[] | null {
    if (visiting.has(personId)) {
      return [...stack, personId];
    }

    if (visited.has(personId)) {
      return null;
    }

    visiting.add(personId);

    for (const childId of descendants.get(personId) ?? []) {
      const cycle = visit(childId, [...stack, personId]);

      if (cycle) {
        return cycle;
      }
    }

    visiting.delete(personId);
    visited.add(personId);
    return null;
  }

  for (const personId of descendants.keys()) {
    const cycle = visit(personId, []);

    if (cycle) {
      issues.push({
        severity: "error",
        code: "ancestor_cycle",
        path: "family_parents/family_children",
        message: `Phát hiện vòng quan hệ tổ tiên: ${cycle.join(" -> ")}.`,
      });
      return;
    }
  }
}

export function parseFamilyJsonImport(rawText: string): ValidationState {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawText);
  } catch (error) {
    return {
      input: null,
      summary: EMPTY_SUMMARY,
      issues: [
        {
          severity: "error",
          code: "invalid_json",
          message:
            error instanceof Error
              ? `Không đọc được JSON: ${error.message}.`
              : "Không đọc được JSON.",
        },
      ],
    };
  }

  if (!isObject(parsed)) {
    return {
      input: null,
      summary: EMPTY_SUMMARY,
      issues: [
        {
          severity: "error",
          code: "invalid_root",
          message: "family.json phải là object ở cấp gốc.",
        },
      ],
    };
  }

  return validateFamilyJsonImport(parsed);
}

export function validateFamilyJsonImport(value: JsonObject): ValidationState {
  const issues: ImportValidationIssue[] = [];
  const schemaVersion = getString(value, "schema_version");
  const appName = getString(value, "app_name");
  const exportedAt = getString(value, "exported_at");

  if (!schemaVersion) {
    issues.push({
      severity: "error",
      code: "missing_schema_version",
      path: "schema_version",
      message: "Thiếu schema_version.",
    });
  } else if (schemaVersion !== FAMILY_IMPORT_SUPPORTED_SCHEMA_VERSION) {
    issues.push({
      severity: "error",
      code: "unsupported_schema_version",
      path: "schema_version",
      message: `Chỉ hỗ trợ schema_version ${FAMILY_IMPORT_SUPPORTED_SCHEMA_VERSION}.`,
    });
  }

  const people = getArray(value, "people", issues);
  const families = getArray(value, "families", issues);
  const familyParents = getArray(value, "family_parents", issues);
  const familyChildren = getArray(value, "family_children", issues);
  const couples = getArray(value, "couple_relationships", issues);
  const treeLayouts = getArray(value, "tree_layouts", issues);
  const treeLayoutNodes = getArray(value, "tree_layout_nodes", issues);

  addDuplicateIssues(people, "people", issues);
  addDuplicateIssues(families, "families", issues);
  addDuplicateIssues(treeLayouts, "tree_layouts", issues);

  people.forEach((row, index) => {
    if (!stringAt(row, "full_name")) {
      issues.push({
        severity: "error",
        code: "missing_full_name",
        path: `people.${index}.full_name`,
        message: `people[${index}] thiếu full_name hợp lệ.`,
      });
    }
  });

  validateReferences(
    people,
    families,
    familyParents,
    familyChildren,
    couples,
    treeLayouts,
    treeLayoutNodes,
    issues,
  );
  validateAncestorCycles(familyParents, familyChildren, issues);

  return {
    input: value as FamilyJsonImportInput,
    summary: {
      schema_version: schemaVersion,
      app_name: appName,
      exported_at: exportedAt,
      people_count: people.length,
      family_count: families.length,
      family_parent_count: familyParents.length,
      family_child_count: familyChildren.length,
      couple_relationship_count: couples.length,
      tree_layout_count: treeLayouts.length,
      tree_layout_node_count: treeLayoutNodes.length,
    },
    issues,
  };
}
