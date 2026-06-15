import type { FamilyJsonExport } from "@/lib/family/export-types";

export const FAMILY_IMPORT_MAX_BYTES = 5 * 1024 * 1024;
export const FAMILY_IMPORT_SUPPORTED_SCHEMA_VERSION = "1.0.0";

export type FamilyJsonImportInput = FamilyJsonExport;

export type ImportValidationSeverity = "error" | "warning" | "info";

export type ImportValidationIssue = {
  severity: ImportValidationSeverity;
  code: string;
  message: string;
  path?: string;
};

export type ImportSummary = {
  schema_version: string | null;
  app_name: string | null;
  exported_at: string | null;
  people_count: number;
  family_count: number;
  family_parent_count: number;
  family_child_count: number;
  couple_relationship_count: number;
  tree_layout_count: number;
  tree_layout_node_count: number;
};

export type ImportConflictKind =
  | "people_id"
  | "person_slug"
  | "family_id"
  | "tree_layout_id";

export type ImportConflict = {
  kind: ImportConflictKind;
  id?: string;
  value?: string;
  message: string;
};

export type ImportConflictCheckStatus = "available" | "unavailable";

export type ImportPreview = {
  summary: ImportSummary;
  issues: ImportValidationIssue[];
  conflicts: ImportConflict[];
  conflict_check_status: ImportConflictCheckStatus;
  conflict_check_message: string | null;
  can_confirm: false;
};

export type ImportPreviewResult =
  | {
      ok: true;
      data: ImportPreview;
    }
  | {
      ok: false;
      error: string;
      reason?: string;
      data?: ImportPreview;
    };
