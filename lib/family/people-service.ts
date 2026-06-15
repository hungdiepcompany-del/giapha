import "server-only";

import type { PermissionCode } from "@/lib/permissions/permission-types";
import { getPermissionContext } from "@/lib/permissions/permission-service";
import { maybeCreateAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  validatePersonInput,
  type ValidationResult,
} from "@/lib/family/people-validation";
import type {
  CreatePersonInput,
  PeopleServiceResult,
  Person,
  PersonListFilter,
  UpdatePersonInput,
} from "@/lib/family/people-types";

type RevisionAction = "create" | "update" | "delete" | "restore";

const PEOPLE_SELECT = `
  id,
  slug,
  full_name,
  display_name,
  gender,
  birth_date,
  birth_date_precision,
  death_date,
  death_date_precision,
  is_living,
  birth_place,
  home_town,
  branch_name,
  generation_number,
  short_bio,
  notes_private,
  visibility,
  created_at,
  created_by,
  updated_at,
  updated_by,
  deleted_at,
  deleted_by,
  delete_reason
`;

function errorResult<T>(error: string, reason?: string): PeopleServiceResult<T> {
  return {
    ok: false,
    error,
    reason,
  };
}

async function requirePeoplePermission(permission: PermissionCode) {
  const context = await getPermissionContext();

  if (!context.user) {
    return {
      ok: false as const,
      error:
        context.reason === "missing_supabase_config"
          ? "Chưa cấu hình Supabase."
          : "Bạn cần đăng nhập.",
      reason: context.reason ?? "anonymous",
      context,
    };
  }

  if (!context.permissions.includes(permission)) {
    return {
      ok: false as const,
      error: `Thiếu quyền ${permission}.`,
      reason: context.reason ?? `missing_${permission}`,
      context,
    };
  }

  return {
    ok: true as const,
    context,
  };
}

function slugify(value: string) {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "thanh-vien";
}

function createSlug(fullName: string) {
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Date.now().toString(36);

  return `${slugify(fullName)}-${suffix}`;
}

function validateOrError(
  input: CreatePersonInput,
): ValidationResult<CreatePersonInput> {
  return validatePersonInput(input);
}

async function logPeopleRevision(params: {
  action: RevisionAction;
  entityId: string;
  before: Person | null;
  after: Person | null;
  changedBy: string | null;
  reason?: string | null;
}) {
  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return;
  }

  await supabase.from("revisions").insert({
    entity_type: "people",
    entity_id: params.entityId,
    action: params.action,
    before_json: params.before,
    after_json: params.after,
    changed_by: params.changedBy,
    change_reason: params.reason ?? null,
  });
}

export async function listPeople(
  filters: PersonListFilter = {},
): Promise<PeopleServiceResult<Person[]>> {
  const permission = await requirePeoplePermission("people.view");

  if (!permission.ok) {
    return errorResult(permission.error, permission.reason);
  }

  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult("Chưa cấu hình Supabase.", "missing_admin_config");
  }

  let query = supabase
    .from("people")
    .select(PEOPLE_SELECT)
    .order("updated_at", { ascending: false });

  if (!filters.includeDeleted) {
    query = query.is("deleted_at", null);
  }

  if (filters.search) {
    const search = filters.search.trim();
    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,display_name.ilike.%${search}%`,
      );
    }
  }

  if (filters.visibility && filters.visibility !== "all") {
    query = query.eq("visibility", filters.visibility);
  }

  if (filters.isLiving === "living") {
    query = query.eq("is_living", true);
  }

  if (filters.isLiving === "deceased") {
    query = query.eq("is_living", false);
  }

  const { data, error } = await query.returns<Person[]>();

  if (error) {
    return errorResult(error.message, "people_list_failed");
  }

  return {
    ok: true,
    data: data ?? [],
  };
}

export async function getPersonById(
  id: string,
): Promise<PeopleServiceResult<Person>> {
  const permission = await requirePeoplePermission("people.view");

  if (!permission.ok) {
    return errorResult(permission.error, permission.reason);
  }

  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult("Chưa cấu hình Supabase.", "missing_admin_config");
  }

  const { data, error } = await supabase
    .from("people")
    .select(PEOPLE_SELECT)
    .eq("id", id)
    .maybeSingle<Person>();

  if (error) {
    return errorResult(error.message, "people_get_failed");
  }

  if (!data) {
    return errorResult("Không tìm thấy thành viên.", "people_not_found");
  }

  return {
    ok: true,
    data,
  };
}

export async function createPerson(
  input: CreatePersonInput,
): Promise<PeopleServiceResult<Person>> {
  const permission = await requirePeoplePermission("people.create");

  if (!permission.ok) {
    return errorResult(permission.error, permission.reason);
  }

  const validated = validateOrError(input);

  if (!validated.ok) {
    return errorResult(validated.errors.join(" "), "validation_failed");
  }

  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult("Chưa cấu hình Supabase.", "missing_admin_config");
  }

  const profileId = permission.context.profile?.id ?? null;
  const { data, error } = await supabase
    .from("people")
    .insert({
      ...validated.data,
      slug: createSlug(validated.data.full_name),
      created_by: profileId,
      updated_by: profileId,
    })
    .select(PEOPLE_SELECT)
    .single<Person>();

  if (error || !data) {
    return errorResult(error?.message ?? "Không thể tạo thành viên.", "create_failed");
  }

  await logPeopleRevision({
    action: "create",
    entityId: data.id,
    before: null,
    after: data,
    changedBy: profileId,
  });

  return {
    ok: true,
    data,
  };
}

export async function updatePerson(
  input: UpdatePersonInput,
): Promise<PeopleServiceResult<Person>> {
  const permission = await requirePeoplePermission("people.update");

  if (!permission.ok) {
    return errorResult(permission.error, permission.reason);
  }

  const existing = await getPersonById(input.id);

  if (!existing.ok) {
    return existing;
  }

  if (existing.data.deleted_at) {
    return errorResult(
      "Không thể sửa thành viên đã xóa mềm. Hãy khôi phục trước.",
      "person_deleted",
    );
  }

  const validated = validateOrError({
    ...existing.data,
    ...input,
    full_name: input.full_name ?? existing.data.full_name,
  });

  if (!validated.ok) {
    return errorResult(validated.errors.join(" "), "validation_failed");
  }

  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult("Chưa cấu hình Supabase.", "missing_admin_config");
  }

  const profileId = permission.context.profile?.id ?? null;
  const { data, error } = await supabase
    .from("people")
    .update({
      ...validated.data,
      updated_by: profileId,
    })
    .eq("id", input.id)
    .select(PEOPLE_SELECT)
    .single<Person>();

  if (error || !data) {
    return errorResult(
      error?.message ?? "Không thể cập nhật thành viên.",
      "update_failed",
    );
  }

  await logPeopleRevision({
    action: "update",
    entityId: data.id,
    before: existing.data,
    after: data,
    changedBy: profileId,
    reason: input.delete_reason ?? null,
  });

  return {
    ok: true,
    data,
  };
}

export async function softDeletePerson(
  id: string,
  reason?: string | null,
): Promise<PeopleServiceResult<Person>> {
  const permission = await requirePeoplePermission("people.delete");

  if (!permission.ok) {
    return errorResult(permission.error, permission.reason);
  }

  const existing = await getPersonById(id);

  if (!existing.ok) {
    return existing;
  }

  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult("Chưa cấu hình Supabase.", "missing_admin_config");
  }

  const profileId = permission.context.profile?.id ?? null;
  const { data, error } = await supabase
    .from("people")
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: profileId,
      delete_reason: reason ?? null,
      updated_by: profileId,
    })
    .eq("id", id)
    .select(PEOPLE_SELECT)
    .single<Person>();

  if (error || !data) {
    return errorResult(error?.message ?? "Không thể xóa mềm.", "delete_failed");
  }

  await logPeopleRevision({
    action: "delete",
    entityId: data.id,
    before: existing.data,
    after: data,
    changedBy: profileId,
    reason,
  });

  return {
    ok: true,
    data,
  };
}

export async function restorePerson(
  id: string,
): Promise<PeopleServiceResult<Person>> {
  const permission = await requirePeoplePermission("people.restore");

  if (!permission.ok) {
    return errorResult(permission.error, permission.reason);
  }

  const existing = await getPersonById(id);

  if (!existing.ok) {
    return existing;
  }

  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult("Chưa cấu hình Supabase.", "missing_admin_config");
  }

  const profileId = permission.context.profile?.id ?? null;
  const { data, error } = await supabase
    .from("people")
    .update({
      deleted_at: null,
      deleted_by: null,
      delete_reason: null,
      updated_by: profileId,
    })
    .eq("id", id)
    .select(PEOPLE_SELECT)
    .single<Person>();

  if (error || !data) {
    return errorResult(
      error?.message ?? "Không thể khôi phục thành viên.",
      "restore_failed",
    );
  }

  await logPeopleRevision({
    action: "restore",
    entityId: data.id,
    before: existing.data,
    after: data,
    changedBy: profileId,
  });

  return {
    ok: true,
    data,
  };
}

