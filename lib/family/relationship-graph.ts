import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

type ParentRow = {
  family_id: string;
  person_id: string;
};

type ChildRow = {
  family_id: string;
  person_id: string;
};

type Edge = {
  parentId: string;
  childId: string;
};

export async function wouldCreateAncestorCycle(params: {
  supabase: SupabaseClient;
  parentId: string;
  childId: string;
}) {
  if (params.parentId === params.childId) {
    return {
      ok: true as const,
      createsCycle: true,
    };
  }

  const [{ data: parents, error: parentsError }, { data: children, error }] =
    await Promise.all([
      params.supabase
        .from("family_parents")
        .select("family_id, person_id")
        .is("deleted_at", null)
        .returns<ParentRow[]>(),
      params.supabase
        .from("family_children")
        .select("family_id, person_id")
        .is("deleted_at", null)
        .returns<ChildRow[]>(),
    ]);

  if (parentsError || error) {
    return {
      ok: false as const,
      error: parentsError?.message ?? error?.message ?? "Không thể kiểm tra vòng lặp.",
    };
  }

  const edges: Edge[] = [];
  const childrenByFamily = new Map<string, string[]>();

  for (const row of children ?? []) {
    const current = childrenByFamily.get(row.family_id) ?? [];
    current.push(row.person_id);
    childrenByFamily.set(row.family_id, current);
  }

  for (const parent of parents ?? []) {
    for (const childId of childrenByFamily.get(parent.family_id) ?? []) {
      edges.push({
        parentId: parent.person_id,
        childId,
      });
    }
  }

  edges.push({
    parentId: params.parentId,
    childId: params.childId,
  });

  const parentsByChild = new Map<string, string[]>();

  for (const edge of edges) {
    const current = parentsByChild.get(edge.childId) ?? [];
    current.push(edge.parentId);
    parentsByChild.set(edge.childId, current);
  }

  const seen = new Set<string>();
  const stack = [params.parentId];

  while (stack.length > 0) {
    const current = stack.pop();

    if (!current || seen.has(current)) {
      continue;
    }

    seen.add(current);

    for (const ancestor of parentsByChild.get(current) ?? []) {
      if (ancestor === params.childId) {
        return {
          ok: true as const,
          createsCycle: true,
        };
      }

      stack.push(ancestor);
    }
  }

  return {
    ok: true as const,
    createsCycle: false,
  };
}
