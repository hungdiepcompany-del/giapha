import "server-only";

import {
  FAMILY_IMPORT_MAX_BYTES,
  type ImportConflict,
  type ImportPreview,
  type ImportPreviewResult,
} from "@/lib/family/import-types";
import { parseFamilyJsonImport } from "@/lib/family/json-import-validator";
import { getPermissionContext } from "@/lib/permissions/permission-service";
import { maybeCreateAdminSupabaseClient } from "@/lib/supabase/admin";

type ExistingPerson = {
  id: string;
  slug: string | null;
};

type ExistingId = {
  id: string;
};

function byteLength(text: string) {
  return new TextEncoder().encode(text).length;
}

function issuePreview(
  rawText: string,
  conflictCheckMessage: string | null,
): ImportPreview {
  const parsed = parseFamilyJsonImport(rawText);

  return {
    summary: parsed.summary,
    issues: parsed.issues,
    conflicts: [],
    conflict_check_status: conflictCheckMessage ? "unavailable" : "available",
    conflict_check_message: conflictCheckMessage,
    can_confirm: false,
  };
}

function uniqueNonEmpty(values: Array<string | null | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

async function findImportConflicts(
  input: NonNullable<ReturnType<typeof parseFamilyJsonImport>["input"]>,
): Promise<
  | {
      status: "available";
      conflicts: ImportConflict[];
      message: null;
    }
  | {
      status: "unavailable";
      conflicts: [];
      message: string;
    }
> {
  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return {
      status: "unavailable",
      conflicts: [],
      message: "Chưa cấu hình Supabase service role nên chỉ kiểm tra cấu trúc file.",
    };
  }

  const peopleIds = uniqueNonEmpty(input.people.map((person) => person.id));
  const personSlugs = uniqueNonEmpty(input.people.map((person) => person.slug));
  const familyIds = uniqueNonEmpty(input.families.map((family) => family.id));
  const treeLayoutIds = uniqueNonEmpty(
    input.tree_layouts.map((layout) => layout.id),
  );

  const [peopleById, peopleBySlug, families, treeLayouts] = await Promise.all([
    peopleIds.length > 0
      ? supabase
          .from("people")
          .select("id, slug")
          .in("id", peopleIds)
          .returns<ExistingPerson[]>()
      : Promise.resolve({ data: [], error: null }),
    personSlugs.length > 0
      ? supabase
          .from("people")
          .select("id, slug")
          .in("slug", personSlugs)
          .returns<ExistingPerson[]>()
      : Promise.resolve({ data: [], error: null }),
    familyIds.length > 0
      ? supabase
          .from("families")
          .select("id")
          .in("id", familyIds)
          .returns<ExistingId[]>()
      : Promise.resolve({ data: [], error: null }),
    treeLayoutIds.length > 0
      ? supabase
          .from("tree_layouts")
          .select("id")
          .in("id", treeLayoutIds)
          .returns<ExistingId[]>()
      : Promise.resolve({ data: [], error: null }),
  ]);

  const firstError =
    peopleById.error ?? peopleBySlug.error ?? families.error ?? treeLayouts.error;

  if (firstError) {
    return {
      status: "unavailable",
      conflicts: [],
      message: `Không kiểm tra được conflict DB: ${firstError.message}.`,
    };
  }

  const conflicts: ImportConflict[] = [
    ...(peopleById.data ?? []).map((person) => ({
      kind: "people_id" as const,
      id: person.id,
      message: `Person ID đã tồn tại trong DB: ${person.id}.`,
    })),
    ...(peopleBySlug.data ?? []).map((person) => ({
      kind: "person_slug" as const,
      id: person.id,
      value: person.slug ?? undefined,
      message: `Slug đã tồn tại trong DB: ${person.slug}.`,
    })),
    ...(families.data ?? []).map((family) => ({
      kind: "family_id" as const,
      id: family.id,
      message: `Family ID đã tồn tại trong DB: ${family.id}.`,
    })),
    ...(treeLayouts.data ?? []).map((layout) => ({
      kind: "tree_layout_id" as const,
      id: layout.id,
      message: `Tree layout ID đã tồn tại trong DB: ${layout.id}.`,
    })),
  ];

  return {
    status: "available",
    conflicts,
    message: null,
  };
}

export async function previewFamilyJsonImport(
  rawText: string,
): Promise<ImportPreviewResult> {
  if (!rawText.trim()) {
    return {
      ok: false,
      error: "Chưa có nội dung family.json để kiểm tra.",
      reason: "empty_import",
      data: issuePreview("", "Chưa chạy kiểm tra DB."),
    };
  }

  if (byteLength(rawText) > FAMILY_IMPORT_MAX_BYTES) {
    return {
      ok: false,
      error: "File vượt quá giới hạn 5MB cho Phase 10.",
      reason: "file_too_large",
      data: issuePreview(rawText, "Chưa chạy kiểm tra DB vì file quá lớn."),
    };
  }

  const context = await getPermissionContext();
  const configMissing =
    context.reason === "missing_supabase_config" ||
    context.reason === "missing_admin_config";

  if (!configMissing && !context.user) {
    return {
      ok: false,
      error: "Bạn cần đăng nhập để kiểm tra import.",
      reason: context.reason ?? "anonymous",
      data: issuePreview(rawText, "Chưa chạy kiểm tra DB vì chưa đăng nhập."),
    };
  }

  if (
    !configMissing &&
    context.user &&
    !context.permissions.includes("imports.create")
  ) {
    return {
      ok: false,
      error: "Thiếu quyền imports.create.",
      reason: context.reason ?? "missing_imports.create",
      data: issuePreview(rawText, "Chưa chạy kiểm tra DB vì thiếu quyền."),
    };
  }

  const parsed = parseFamilyJsonImport(rawText);

  if (!parsed.input) {
    return {
      ok: false,
      error: "family.json không hợp lệ.",
      reason: "invalid_json",
      data: {
        summary: parsed.summary,
        issues: parsed.issues,
        conflicts: [],
        conflict_check_status: "unavailable",
        conflict_check_message: "Chưa chạy kiểm tra DB vì JSON không hợp lệ.",
        can_confirm: false,
      },
    };
  }

  const hasBlockingIssue = parsed.issues.some(
    (issue) => issue.severity === "error",
  );
  const conflictCheck = hasBlockingIssue
    ? {
        status: "unavailable" as const,
        conflicts: [],
        message: "Chưa chạy kiểm tra DB vì file còn lỗi cấu trúc.",
      }
    : configMissing
      ? {
          status: "unavailable" as const,
          conflicts: [],
          message:
            "Chưa cấu hình Supabase nên chỉ kiểm tra cấu trúc file, không kiểm tra conflict DB.",
        }
      : await findImportConflicts(parsed.input);

  const preview: ImportPreview = {
    summary: parsed.summary,
    issues: parsed.issues,
    conflicts: conflictCheck.conflicts,
    conflict_check_status: conflictCheck.status,
    conflict_check_message: conflictCheck.message,
    can_confirm: false,
  };

  if (hasBlockingIssue) {
    return {
      ok: false,
      error: "family.json còn lỗi cần sửa trước khi import.",
      reason: "validation_failed",
      data: preview,
    };
  }

  return {
    ok: true,
    data: preview,
  };
}
