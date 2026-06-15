import type { RevisionDiffField } from "@/lib/family/revision-types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stableStringify(value: unknown) {
  if (value === undefined) {
    return "__undefined__";
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function valuesEqual(left: unknown, right: unknown) {
  return stableStringify(left) === stableStringify(right);
}

export function buildRevisionDiff(
  beforeJson: unknown | null,
  afterJson: unknown | null,
): RevisionDiffField[] {
  if (!isRecord(beforeJson) && !isRecord(afterJson)) {
    return [
      {
        field_name: "__root__",
        old_value: beforeJson,
        new_value: afterJson,
        changed: !valuesEqual(beforeJson, afterJson),
      },
    ];
  }

  const beforeRecord = isRecord(beforeJson) ? beforeJson : {};
  const afterRecord = isRecord(afterJson) ? afterJson : {};
  const fieldNames = Array.from(
    new Set([...Object.keys(beforeRecord), ...Object.keys(afterRecord)]),
  ).sort((left, right) => left.localeCompare(right));

  return fieldNames
    .map((fieldName) => {
      const oldValue = beforeRecord[fieldName];
      const newValue = afterRecord[fieldName];

      return {
        field_name: fieldName,
        old_value: oldValue ?? null,
        new_value: newValue ?? null,
        changed: !valuesEqual(oldValue, newValue),
      };
    })
    .filter((field) => field.changed);
}

export function formatRevisionValue(value: unknown) {
  if (value === null || value === undefined) {
    return "null";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
