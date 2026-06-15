import type { Person } from "@/lib/family/people-types";
import type {
  CoupleRelationship,
  Family,
  FamilyChild,
  FamilyParent,
} from "@/lib/family/relationship-types";
import type { TreeLayout, TreeLayoutNode } from "@/lib/family/tree-types";

export const FAMILY_EXPORT_SCHEMA_VERSION = "1.0.0";
export const FAMILY_EXPORT_APP_NAME = "WEB GIA PHẢ";
export const FAMILY_EXPORT_APP_VERSION = "0.1.0";

export type ExportPrivacyMode = "admin" | "family" | "public";
export type ExportAction = "create" | "download";

export type ExportBuildOptions = {
  action?: ExportAction;
  include_deleted?: boolean;
  privacy_mode?: ExportPrivacyMode;
};

export type FamilyExportPerson = Person;
export type FamilyExportFamily = Family;
export type FamilyExportParent = Omit<FamilyParent, "person">;
export type FamilyExportChild = Omit<FamilyChild, "person">;
export type FamilyExportCouple = Omit<CoupleRelationship, "person1" | "person2">;
export type FamilyExportTreeLayout = TreeLayout;
export type FamilyExportTreeLayoutNode = TreeLayoutNode;

export type FamilyExportCollection = {
  exported_by: string | null;
  people: FamilyExportPerson[];
  families: FamilyExportFamily[];
  family_parents: FamilyExportParent[];
  family_children: FamilyExportChild[];
  couple_relationships: FamilyExportCouple[];
  tree_layouts: FamilyExportTreeLayout[];
  tree_layout_nodes: FamilyExportTreeLayoutNode[];
};

export type FamilyJsonManifest = {
  app_name: string;
  app_version: string;
  schema_version: string;
  exported_at: string;
  exported_by: string | null;
  privacy_mode: ExportPrivacyMode;
  people_count: number;
  family_count: number;
  relationship_count: number;
  tree_layout_count: number;
  tree_layout_node_count: number;
  media_count: number;
  checksum_algorithm: "sha256";
};

export type FamilyJsonExport = FamilyExportCollection & {
  schema_version: string;
  app_name: string;
  app_version: string;
  exported_at: string;
  privacy_mode: ExportPrivacyMode;
  manifest: FamilyJsonManifest;
};

export type GedcomExportResult = {
  content: string;
  file_name: string;
  mime_type: "text/plain; charset=utf-8";
  checksum: string;
  record_count: number;
};

export type BackupManifest = FamilyJsonManifest & {
  backup_type: "full_backup_zip";
  files: Array<{
    path: string;
    mime_type: string;
    checksum: string;
    size_bytes: number;
  }>;
  limitations: string[];
};

export type ExportFileResult<TContent = string> = {
  content: TContent;
  file_name: string;
  mime_type: string;
  checksum: string;
  record_count: number;
  media_count: number;
};
