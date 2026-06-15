"use server";

import {
  FAMILY_IMPORT_MAX_BYTES,
} from "@/lib/family/import-types";
import { previewFamilyJsonImport } from "@/lib/family/json-import-preview-service";
import type { ImportPreviewActionState } from "@/app/(admin)/admin/exports/import/state";

function byteLength(text: string) {
  return new TextEncoder().encode(text).length;
}

async function readImportText(formData: FormData) {
  const file = formData.get("family_json_file");
  const pastedText = formData.get("family_json_text");

  if (
    file &&
    typeof file === "object" &&
    "size" in file &&
    "text" in file &&
    typeof file.size === "number" &&
    typeof file.text === "function" &&
    file.size > 0
  ) {
    if (file.size > FAMILY_IMPORT_MAX_BYTES) {
      return {
        ok: false as const,
        error: "File vượt quá giới hạn 5MB cho Phase 10.",
      };
    }

    return {
      ok: true as const,
      text: await file.text(),
    };
  }

  if (typeof pastedText === "string" && pastedText.trim()) {
    if (byteLength(pastedText) > FAMILY_IMPORT_MAX_BYTES) {
      return {
        ok: false as const,
        error: "Nội dung vượt quá giới hạn 5MB cho Phase 10.",
      };
    }

    return {
      ok: true as const,
      text: pastedText,
    };
  }

  return {
    ok: false as const,
    error: "Vui lòng upload hoặc paste nội dung family.json.",
  };
}

export async function previewImportAction(
  _previousState: ImportPreviewActionState,
  formData: FormData,
): Promise<ImportPreviewActionState> {
  const importText = await readImportText(formData);

  if (!importText.ok) {
    return {
      status: "error",
      message: importText.error,
      preview: null,
    };
  }

  const result = await previewFamilyJsonImport(importText.text);

  return {
    status: result.ok ? "success" : "error",
    message: result.ok ? "Đã kiểm tra file. Phase 10 chưa ghi dữ liệu." : result.error,
    preview: result.ok ? result.data : (result.data ?? null),
  };
}
