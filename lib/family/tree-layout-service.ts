import "server-only";

import type { PermissionCode } from "@/lib/permissions/permission-types";
import { getPermissionContext } from "@/lib/permissions/permission-service";
import { maybeCreateAdminSupabaseClient } from "@/lib/supabase/admin";
import { logRevision } from "@/lib/family/revision-service";
import type { RelationshipServiceResult } from "@/lib/family/relationship-types";
import type {
  FamilyTreeGraph,
  TreeLayout,
  TreeLayoutNode,
  TreeNodePositionInput,
} from "@/lib/family/tree-types";

const DEFAULT_LAYOUT_CODE = "admin-default";

const TREE_LAYOUT_SELECT = `
  id,
  layout_code,
  layout_name,
  layout_scope,
  is_default,
  description,
  created_at,
  created_by,
  updated_at,
  updated_by,
  deleted_at,
  deleted_by,
  delete_reason
`;

const TREE_LAYOUT_NODE_SELECT = `
  id,
  layout_id,
  node_id,
  node_kind,
  person_id,
  family_id,
  x,
  y,
  is_locked,
  is_collapsed,
  style_json,
  created_at,
  created_by,
  updated_at,
  updated_by,
  deleted_at,
  deleted_by,
  delete_reason
`;

function errorResult<T>(
  error: string,
  reason?: string,
): RelationshipServiceResult<T> {
  return {
    ok: false,
    error,
    reason,
  };
}

async function requireTreePermission(permission: PermissionCode) {
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

function normalizePosition(input: TreeNodePositionInput): TreeNodePositionInput {
  return {
    ...input,
    person_id: input.node_kind === "person" ? input.person_id ?? null : null,
    family_id: input.node_kind === "family" ? input.family_id ?? null : null,
    x: Number.isFinite(input.x) ? input.x : 0,
    y: Number.isFinite(input.y) ? input.y : 0,
  };
}

async function readDefaultLayout() {
  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult<TreeLayout | null>(
      "Chưa cấu hình Supabase.",
      "missing_admin_config",
    );
  }

  const { data, error } = await supabase
    .from("tree_layouts")
    .select(TREE_LAYOUT_SELECT)
    .eq("layout_code", DEFAULT_LAYOUT_CODE)
    .is("deleted_at", null)
    .maybeSingle<TreeLayout>();

  if (error) {
    return errorResult<TreeLayout | null>(
      error.message,
      "tree_layout_get_failed",
    );
  }

  return {
    ok: true as const,
    data: data ?? null,
  };
}

async function ensureDefaultLayout(changedBy: string | null) {
  const current = await readDefaultLayout();

  if (!current.ok) {
    return current;
  }

  if (current.data) {
    return {
      ok: true as const,
      data: current.data,
    };
  }

  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult<TreeLayout>(
      "Chưa cấu hình Supabase.",
      "missing_admin_config",
    );
  }

  const { data, error } = await supabase
    .from("tree_layouts")
    .insert({
      layout_code: DEFAULT_LAYOUT_CODE,
      layout_name: "Bố cục cây mặc định cho quản trị",
      layout_scope: "admin",
      is_default: true,
      description: "Vị trí thủ công được lưu từ /admin/tree/edit.",
      created_by: changedBy,
      updated_by: changedBy,
    })
    .select(TREE_LAYOUT_SELECT)
    .single<TreeLayout>();

  if (error || !data) {
    return errorResult<TreeLayout>(
      error?.message ?? "Không thể tạo layout mặc định.",
      "tree_layout_create_failed",
    );
  }

  await logRevision({
    entityType: "tree_layouts",
    entityId: data.id,
    action: "create",
    before: null,
    after: data,
    changedBy,
  });

  return {
    ok: true as const,
    data,
  };
}

export async function getDefaultTreeLayout(): Promise<
  RelationshipServiceResult<TreeLayout | null>
> {
  const permission = await requireTreePermission("tree.view");

  if (!permission.ok) {
    return errorResult(permission.error, permission.reason);
  }

  return readDefaultLayout();
}

export async function applySavedLayoutToGraph(
  graph: FamilyTreeGraph,
): Promise<RelationshipServiceResult<FamilyTreeGraph>> {
  const layout = await getDefaultTreeLayout();

  if (!layout.ok) {
    return errorResult(layout.error, layout.reason);
  }

  if (!layout.data) {
    return {
      ok: true,
      data: graph,
    };
  }

  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult("Chưa cấu hình Supabase.", "missing_admin_config");
  }

  const { data, error } = await supabase
    .from("tree_layout_nodes")
    .select(TREE_LAYOUT_NODE_SELECT)
    .eq("layout_id", layout.data.id)
    .is("deleted_at", null)
    .returns<TreeLayoutNode[]>();

  if (error) {
    return errorResult(error.message, "tree_layout_nodes_get_failed");
  }

  const byNodeId = new Map((data ?? []).map((node) => [node.node_id, node]));

  return {
    ok: true,
    data: {
      ...graph,
      nodes: graph.nodes.map((node) => {
        const saved = byNodeId.get(node.id);

        if (!saved) {
          return node;
        }

        return {
          ...node,
          position: {
            x: Number(saved.x),
            y: Number(saved.y),
          },
        };
      }),
    },
  };
}

export async function saveTreeNodePositions(
  positions: TreeNodePositionInput[],
): Promise<RelationshipServiceResult<TreeLayout>> {
  const permission = await requireTreePermission("tree.edit_layout");

  if (!permission.ok) {
    return errorResult(permission.error, permission.reason);
  }

  const profileId = permission.context.profile?.id ?? null;
  const layout = await ensureDefaultLayout(profileId);

  if (!layout.ok) {
    return errorResult(layout.error, layout.reason);
  }

  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult("Chưa cấu hình Supabase.", "missing_admin_config");
  }

  const normalized = positions.map(normalizePosition);
  const activeNodeIds = new Set(normalized.map((position) => position.node_id));
  const { data: beforeNodes, error: beforeError } = await supabase
    .from("tree_layout_nodes")
    .select(TREE_LAYOUT_NODE_SELECT)
    .eq("layout_id", layout.data.id)
    .is("deleted_at", null)
    .returns<TreeLayoutNode[]>();

  if (beforeError) {
    return errorResult(beforeError.message, "tree_layout_nodes_get_failed");
  }

  for (const position of normalized) {
    const existing = (beforeNodes ?? []).find(
      (node) => node.node_id === position.node_id,
    );

    if (existing) {
      const { error } = await supabase
        .from("tree_layout_nodes")
        .update({
          node_kind: position.node_kind,
          person_id: position.person_id,
          family_id: position.family_id,
          x: position.x,
          y: position.y,
          updated_by: profileId,
        })
        .eq("id", existing.id);

      if (error) {
        return errorResult(error.message, "tree_layout_node_update_failed");
      }

      continue;
    }

    const { error } = await supabase.from("tree_layout_nodes").insert({
      layout_id: layout.data.id,
      node_id: position.node_id,
      node_kind: position.node_kind,
      person_id: position.person_id,
      family_id: position.family_id,
      x: position.x,
      y: position.y,
      created_by: profileId,
      updated_by: profileId,
    });

    if (error) {
      return errorResult(error.message, "tree_layout_node_create_failed");
    }
  }

  for (const node of beforeNodes ?? []) {
    if (activeNodeIds.has(node.node_id)) {
      continue;
    }

    const { error } = await supabase
      .from("tree_layout_nodes")
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: profileId,
        delete_reason: "Removed from saved tree layout.",
        updated_by: profileId,
      })
      .eq("id", node.id);

    if (error) {
      return errorResult(error.message, "tree_layout_node_delete_failed");
    }
  }

  await logRevision({
    entityType: "tree_layouts",
    entityId: layout.data.id,
    action: "update",
    before: beforeNodes ?? [],
    after: normalized,
    changedBy: profileId,
    reason: "save_tree_node_positions",
  });

  return {
    ok: true,
    data: layout.data,
  };
}

export async function resetTreeLayout(): Promise<
  RelationshipServiceResult<TreeLayout | null>
> {
  const permission = await requireTreePermission("tree.edit_layout");

  if (!permission.ok) {
    return errorResult(permission.error, permission.reason);
  }

  const layout = await readDefaultLayout();

  if (!layout.ok) {
    return errorResult(layout.error, layout.reason);
  }

  if (!layout.data) {
    return {
      ok: true,
      data: null,
    };
  }

  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult("Chưa cấu hình Supabase.", "missing_admin_config");
  }

  const profileId = permission.context.profile?.id ?? null;
  const { data: beforeNodes, error: beforeError } = await supabase
    .from("tree_layout_nodes")
    .select(TREE_LAYOUT_NODE_SELECT)
    .eq("layout_id", layout.data.id)
    .is("deleted_at", null)
    .returns<TreeLayoutNode[]>();

  if (beforeError) {
    return errorResult(beforeError.message, "tree_layout_nodes_get_failed");
  }

  const { error } = await supabase
    .from("tree_layout_nodes")
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: profileId,
        delete_reason: "Đặt lại bố cục về bố cục tự động.",
      updated_by: profileId,
    })
    .eq("layout_id", layout.data.id)
    .is("deleted_at", null);

  if (error) {
    return errorResult(error.message, "tree_layout_reset_failed");
  }

  await logRevision({
    entityType: "tree_layouts",
    entityId: layout.data.id,
    action: "delete",
    before: beforeNodes ?? [],
    after: [],
    changedBy: profileId,
    reason: "reset_tree_layout",
  });

  return {
    ok: true,
    data: layout.data,
  };
}
