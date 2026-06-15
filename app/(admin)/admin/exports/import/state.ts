import type { ImportPreview } from "@/lib/family/import-types";

export type ImportPreviewActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
  preview: ImportPreview | null;
};

export const initialImportPreviewActionState: ImportPreviewActionState = {
  status: "idle",
  message: null,
  preview: null,
};
