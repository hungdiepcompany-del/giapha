import "server-only";

import { buildRevisionDiff } from "@/lib/family/revision-diff";
import type {
  Revision,
  RevisionAction,
  RevisionDetail,
  RevisionItem,
  RevisionListFilter,
  RevisionServiceResult,
} from "@/lib/family/revision-types";
import type { PermissionCode } from "@/lib/permissions/permission-types";
import { getPermissionContext } from "@/lib/permissions/permission-service";
import { maybeCreateAdminSupabaseClient } from "@/lib/supabase/admin";

export type { RevisionAction } from "@/lib/family/revision-types";

const REVISION_SELECT = `
  id,
  entity_type,
  entity_id,
  action,
  before_json,
  after_json,
  changed_by,
  changed_at,
  change_reason
`;

const REVISION_ITEM_SELECT = `
  id,
  revision_id,
  field_name,
  before_json,
  after_json,
  created_at
`;

function errorResult<T>(error: string, reason?: string): RevisionServiceResult<T> {
  return {
    ok: false,
    error,
    reason,
  };
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

async function requireRevisionPermission(permission: PermissionCode) {
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

function normalizeFilter(filter: RevisionListFilter = {}): RevisionListFilter {
  return {
    entity_type: filter.entity_type?.trim() || undefined,
    action: filter.action && filter.action !== "all" ? filter.action : undefined,
    entity_id: filter.entity_id?.trim() || undefined,
    changed_by: filter.changed_by?.trim() || undefined,
    changed_from: filter.changed_from?.trim() || undefined,
    changed_to: filter.changed_to?.trim() || undefined,
  };
}

export async function logRevision(params: {
  entityType: string;
  entityId: string;
  action: RevisionAction;
  before: unknown | null;
  after: unknown | null;
  changedBy: string | null;
  reason?: string | null;
}) {
  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return;
  }

  await supabase.from("revisions").insert({
    entity_type: params.entityType,
    entity_id: params.entityId,
    action: params.action,
    before_json: params.before,
    after_json: params.after,
    changed_by: params.changedBy,
    change_reason: params.reason ?? null,
  });
}

export async function listRevisions(
  filter: RevisionListFilter = {},
): Promise<RevisionServiceResult<Revision[]>> {
  const permission = await requireRevisionPermission("revisions.view");

  if (!permission.ok) {
    return errorResult(permission.error, permission.reason);
  }

  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult("Chưa cấu hình Supabase.", "missing_admin_config");
  }

  const normalized = normalizeFilter(filter);

  if (normalized.entity_id && !isUuid(normalized.entity_id)) {
    return errorResult("Entity ID không hợp lệ.", "invalid_entity_id");
  }

  if (normalized.changed_by && !isUuid(normalized.changed_by)) {
    return errorResult("Changed by không hợp lệ.", "invalid_changed_by");
  }

  let query = supabase
    .from("revisions")
    .select(REVISION_SELECT)
    .order("changed_at", { ascending: false })
    .limit(100);

  if (normalized.entity_type) {
    query = query.eq("entity_type", normalized.entity_type);
  }

  if (normalized.action) {
    query = query.eq("action", normalized.action);
  }

  if (normalized.entity_id) {
    query = query.eq("entity_id", normalized.entity_id);
  }

  if (normalized.changed_by) {
    query = query.eq("changed_by", normalized.changed_by);
  }

  if (normalized.changed_from) {
    query = query.gte("changed_at", normalized.changed_from);
  }

  if (normalized.changed_to) {
    query = query.lte("changed_at", normalized.changed_to);
  }

  const { data, error } = await query.returns<Revision[]>();

  if (error) {
    return errorResult(error.message, "revision_list_failed");
  }

  return {
    ok: true,
    data: data ?? [],
  };
}

export async function getRevisionDetail(
  revisionId: string,
): Promise<RevisionServiceResult<RevisionDetail>> {
  const permission = await requireRevisionPermission("revisions.view");

  if (!permission.ok) {
    return errorResult(permission.error, permission.reason);
  }

  if (!isUuid(revisionId)) {
    return errorResult("Revision ID không hợp lệ.", "invalid_revision_id");
  }

  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult("Chưa cấu hình Supabase.", "missing_admin_config");
  }

  const { data: revision, error: revisionError } = await supabase
    .from("revisions")
    .select(REVISION_SELECT)
    .eq("id", revisionId)
    .maybeSingle<Revision>();

  if (revisionError) {
    return errorResult(revisionError.message, "revision_get_failed");
  }

  if (!revision) {
    return errorResult("Không tìm thấy revision.", "revision_not_found");
  }

  const { data: items, error: itemsError } = await supabase
    .from("revision_items")
    .select(REVISION_ITEM_SELECT)
    .eq("revision_id", revision.id)
    .order("created_at", { ascending: true })
    .returns<RevisionItem[]>();

  if (itemsError) {
    return errorResult(itemsError.message, "revision_items_get_failed");
  }

  return {
    ok: true,
    data: {
      revision,
      items: items ?? [],
      diff: buildRevisionDiff(revision.before_json, revision.after_json),
      can_restore: permission.context.permissions.includes("revisions.restore"),
    },
  };
}

export async function listRevisionsForEntity(
  entityType: string,
  entityId: string,
): Promise<RevisionServiceResult<Revision[]>> {
  return listRevisions({
    entity_type: entityType,
    entity_id: entityId,
  });
}
