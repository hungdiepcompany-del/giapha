import "server-only";

import JSZip from "jszip";

import { sha256Hex } from "@/lib/family/checksum";
import {
  type BackupManifest,
  type ExportBuildOptions,
  type ExportFileResult,
} from "@/lib/family/export-types";
import { buildGedcomExport } from "@/lib/family/gedcom-exporter";
import { buildFamilyJsonExport } from "@/lib/family/json-exporter";
import type { RelationshipServiceResult } from "@/lib/family/relationship-types";

function exportDateStamp(date: Date) {
  return date.toISOString().slice(0, 10).replaceAll("-", "");
}

function byteLength(value: string | Uint8Array) {
  return Buffer.byteLength(value);
}

export async function buildFullBackupZip(
  options: ExportBuildOptions = {},
): Promise<RelationshipServiceResult<ExportFileResult<Buffer>>> {
  const familyJson = await buildFamilyJsonExport(options);

  if (!familyJson.ok) {
    return familyJson;
  }

  const gedcom = await buildGedcomExport(options);

  if (!gedcom.ok) {
    return gedcom;
  }

  const familyJsonContent = `${JSON.stringify(familyJson.data, null, 2)}\n`;
  const familyJsonChecksum = sha256Hex(familyJsonContent);
  const gedcomChecksum = sha256Hex(gedcom.data.content);
  const manifest: BackupManifest = {
    ...familyJson.data.manifest,
    backup_type: "full_backup_zip",
    files: [
      {
        path: "family.json",
        mime_type: "application/json; charset=utf-8",
        checksum: familyJsonChecksum,
        size_bytes: byteLength(familyJsonContent),
      },
      {
        path: "family.ged",
        mime_type: gedcom.data.mime_type,
        checksum: gedcomChecksum,
        size_bytes: byteLength(gedcom.data.content),
      },
      {
        path: "manifest.json",
        mime_type: "application/json; charset=utf-8",
        checksum: "",
        size_bytes: 0,
      },
      {
        path: "checksums.json",
        mime_type: "application/json; charset=utf-8",
        checksum: "",
        size_bytes: 0,
      },
    ],
    limitations: [
      "Phase 8 chưa có media upload thật, media_count = 0.",
      "Import đầy đủ chưa được bật để tránh ghi đè dữ liệu khi chưa có preview/validation.",
    ],
  };
  const finalizedManifest: BackupManifest = {
    ...manifest,
    files: manifest.files.map((file) =>
      file.path === "manifest.json"
        ? {
            ...file,
            size_bytes: byteLength(`${JSON.stringify(manifest, null, 2)}\n`),
          }
        : file,
    ),
  };
  const finalizedManifestContent = `${JSON.stringify(finalizedManifest, null, 2)}\n`;
  const finalizedChecksums = {
    algorithm: "sha256",
    files: {
      "family.json": familyJsonChecksum,
      "family.ged": gedcomChecksum,
      "manifest.json": sha256Hex(finalizedManifestContent),
    },
  };
  const finalizedChecksumsContent = `${JSON.stringify(finalizedChecksums, null, 2)}\n`;
  const zip = new JSZip();

  zip.file("family.json", familyJsonContent);
  zip.file("family.ged", gedcom.data.content);
  zip.file("manifest.json", finalizedManifestContent);
  zip.file("checksums.json", finalizedChecksumsContent);
  zip.folder("media");

  const content = await zip.generateAsync({ type: "nodebuffer" });
  const exportedAt = new Date(familyJson.data.exported_at);

  return {
    ok: true,
    data: {
      content,
      file_name: `gia-pha-full-backup-${exportDateStamp(exportedAt)}.zip`,
      mime_type: "application/zip",
      checksum: sha256Hex(content),
      record_count:
        familyJson.data.manifest.people_count +
        familyJson.data.manifest.family_count +
        familyJson.data.manifest.relationship_count +
        familyJson.data.manifest.tree_layout_count +
        familyJson.data.manifest.tree_layout_node_count,
      media_count: 0,
    },
  };
}
