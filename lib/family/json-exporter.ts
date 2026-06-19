import "server-only";

import { sha256Hex } from "@/lib/family/checksum";
import { collectFamilyExportData } from "@/lib/family/export-collector";
import {
  FAMILY_EXPORT_APP_NAME,
  FAMILY_EXPORT_APP_EXPORT_VERSION,
  FAMILY_EXPORT_APP_VERSION,
  FAMILY_EXPORT_SCHEMA_VERSION,
  type ExportBuildOptions,
  type ExportFileResult,
  type ExportPrivacyMode,
  type ExportScope,
  type FamilyExportCollection,
  type FamilyJsonExport,
  type FamilyJsonManifest,
} from "@/lib/family/export-types";
import type { RelationshipServiceResult } from "@/lib/family/relationship-types";

function exportDateStamp(date: Date) {
  return date.toISOString().slice(0, 10).replaceAll("-", "");
}

function relationshipCount(data: FamilyExportCollection) {
  return (
    data.family_parents.length +
    data.family_children.length +
    data.couple_relationships.length
  );
}

function exportScope(privacyMode: ExportPrivacyMode): ExportScope {
  if (privacyMode === "public") {
    return "public_json";
  }

  if (privacyMode === "family") {
    return "family_json";
  }

  return "admin_full_backup";
}

export function buildFamilyJsonManifest(
  data: FamilyExportCollection,
  exportedAt: string,
  privacyMode: ExportPrivacyMode,
): FamilyJsonManifest {
  const scope = exportScope(privacyMode);

  return {
    app_name: FAMILY_EXPORT_APP_NAME,
    app_version: FAMILY_EXPORT_APP_VERSION,
    app_export_version: FAMILY_EXPORT_APP_EXPORT_VERSION,
    schema_version: FAMILY_EXPORT_SCHEMA_VERSION,
    exported_at: exportedAt,
    exported_by: data.exported_by,
    export_scope: scope,
    privacy_scope: privacyMode,
    privacy_mode: privacyMode,
    people_count: data.people.length,
    family_count: data.families.length,
    relationship_count: relationshipCount(data),
    clan_count: data.clans.length,
    clan_branch_count: data.clan_branches.length,
    generation_rule_count: data.generation_rules.length,
    person_branch_membership_count: data.person_branch_memberships.length,
    tree_layout_count: data.tree_layouts.length,
    tree_layout_node_count: data.tree_layout_nodes.length,
    media_count: 0,
    checksum_algorithm: "sha256",
  };
}

export async function buildFamilyJsonExport(
  options: ExportBuildOptions = {},
): Promise<RelationshipServiceResult<FamilyJsonExport>> {
  const collection = await collectFamilyExportData(options);

  if (!collection.ok) {
    return collection;
  }

  const privacyMode = options.privacy_mode ?? "admin";
  const exportedAt = new Date().toISOString();
  const manifest = buildFamilyJsonManifest(
    collection.data,
    exportedAt,
    privacyMode,
  );

  return {
    ok: true,
    data: {
      schema_version: FAMILY_EXPORT_SCHEMA_VERSION,
      app_name: FAMILY_EXPORT_APP_NAME,
      app_version: FAMILY_EXPORT_APP_VERSION,
      app_export_version: FAMILY_EXPORT_APP_EXPORT_VERSION,
      exported_at: exportedAt,
      exported_by: collection.data.exported_by,
      export_scope: exportScope(privacyMode),
      privacy_scope: privacyMode,
      privacy_mode: privacyMode,
      people: collection.data.people,
      families: collection.data.families,
      family_parents: collection.data.family_parents,
      family_children: collection.data.family_children,
      couple_relationships: collection.data.couple_relationships,
      clans: collection.data.clans,
      clan_branches: collection.data.clan_branches,
      generation_rules: collection.data.generation_rules,
      person_branch_memberships: collection.data.person_branch_memberships,
      tree_layouts: collection.data.tree_layouts,
      tree_layout_nodes: collection.data.tree_layout_nodes,
      manifest,
    },
  };
}

export async function buildFamilyJsonFile(
  options: ExportBuildOptions = {},
): Promise<RelationshipServiceResult<ExportFileResult>> {
  const familyJson = await buildFamilyJsonExport(options);

  if (!familyJson.ok) {
    return familyJson;
  }

  const content = `${JSON.stringify(familyJson.data, null, 2)}\n`;
  const checksum = sha256Hex(content);
  const dateStamp = exportDateStamp(new Date(familyJson.data.exported_at));

  return {
    ok: true,
    data: {
      content,
      file_name: `gia-pha-family-${dateStamp}.json`,
      mime_type: "application/json; charset=utf-8",
      checksum,
      record_count:
        familyJson.data.people.length +
        familyJson.data.families.length +
        familyJson.data.family_parents.length +
        familyJson.data.family_children.length +
        familyJson.data.couple_relationships.length +
        familyJson.data.clans.length +
        familyJson.data.clan_branches.length +
        familyJson.data.generation_rules.length +
        familyJson.data.person_branch_memberships.length +
        familyJson.data.tree_layouts.length +
        familyJson.data.tree_layout_nodes.length,
      media_count: 0,
    },
  };
}
