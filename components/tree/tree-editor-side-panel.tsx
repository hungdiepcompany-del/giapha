"use client";

import Link from "next/link";

import {
  CHILD_RELATIONSHIP_TYPES,
  COUPLE_RELATIONSHIP_STATUSES,
  PARENT_RELATIONSHIP_TYPES,
  PARENT_ROLES,
  type ChildRelationshipType,
  type CoupleRelationshipStatus,
  type ParentRelationshipType,
  type ParentRole,
} from "@/lib/family/relationship-types";
import type {
  FamilyTreeGraph,
  TreeGraphNode,
  TreePersonNode,
} from "@/lib/family/tree-types";

type TreeEditorSidePanelProps = {
  graph: FamilyTreeGraph;
  selectedNode: TreeGraphNode | null;
  canCreateRelationships: boolean;
  addParentAction: (formData: FormData) => void | Promise<void>;
  addSpouseAction: (formData: FormData) => void | Promise<void>;
  addChildAction: (formData: FormData) => void | Promise<void>;
};

function personLabel(node: TreePersonNode) {
  return node.displayName || node.fullName;
}

function peopleById(graph: FamilyTreeGraph) {
  return new Map(
    graph.nodes
      .filter((node): node is TreePersonNode => node.kind === "person")
      .map((node) => [node.id, node]),
  );
}

function relationshipSummary(graph: FamilyTreeGraph, personNodeId: string) {
  const people = peopleById(graph);
  const parents: TreePersonNode[] = [];
  const children: TreePersonNode[] = [];
  const spouses: TreePersonNode[] = [];

  for (const childEdge of graph.edges.filter(
    (edge) => edge.kind === "parent_child" && edge.target === personNodeId,
  )) {
    for (const parentEdge of graph.edges.filter(
      (edge) => edge.kind === "family_unit" && edge.target === childEdge.source,
    )) {
      const parent = people.get(parentEdge.source);

      if (parent) {
        parents.push(parent);
      }
    }
  }

  for (const parentEdge of graph.edges.filter(
    (edge) => edge.kind === "family_unit" && edge.source === personNodeId,
  )) {
    for (const childEdge of graph.edges.filter(
      (edge) => edge.kind === "parent_child" && edge.source === parentEdge.target,
    )) {
      const child = people.get(childEdge.target);

      if (child) {
        children.push(child);
      }
    }
  }

  for (const edge of graph.edges.filter((edge) => edge.kind === "couple")) {
    if (edge.source === personNodeId) {
      const spouse = people.get(edge.target);

      if (spouse) {
        spouses.push(spouse);
      }
    }

    if (edge.target === personNodeId) {
      const spouse = people.get(edge.source);

      if (spouse) {
        spouses.push(spouse);
      }
    }
  }

  return {
    parents: [...new Map(parents.map((node) => [node.id, node])).values()],
    children: [...new Map(children.map((node) => [node.id, node])).values()],
    spouses: [...new Map(spouses.map((node) => [node.id, node])).values()],
  };
}

function RelationList({
  title,
  people,
}: {
  title: string;
  people: TreePersonNode[];
}) {
  return (
    <div>
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      <ul className="mt-2 space-y-1 text-sm text-slate-700">
        {people.length > 0 ? (
          people.map((person) => <li key={person.id}>{personLabel(person)}</li>)
        ) : (
          <li>Chưa có dữ liệu.</li>
        )}
      </ul>
    </div>
  );
}

function RelatedPersonInput() {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-800">
        UUID người liên quan
      </span>
      <input
        name="related_person_id"
        required
        className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2 font-mono text-sm"
        placeholder="UUID thành viên đã tồn tại"
      />
    </label>
  );
}

export function TreeEditorSidePanel({
  graph,
  selectedNode,
  canCreateRelationships,
  addParentAction,
  addSpouseAction,
  addChildAction,
}: TreeEditorSidePanelProps) {
  if (!selectedNode) {
    return (
      <aside className="border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-bold text-slate-950">Side panel</h2>
        <p className="mt-2 text-sm text-slate-600">
          Chọn một person node để xem quan hệ và thao tác.
        </p>
      </aside>
    );
  }

  if (selectedNode.kind !== "person") {
    return (
      <aside className="border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-bold text-slate-950">Family node</h2>
        <p className="mt-2 text-sm text-slate-600">
          Phase 6 chưa hỗ trợ sửa trực tiếp family node.
        </p>
      </aside>
    );
  }

  const summary = relationshipSummary(graph, selectedNode.id);
  const dateRange =
    selectedNode.birthYear || selectedNode.deathYear
      ? `${selectedNode.birthYear ?? "?"} - ${selectedNode.deathYear ?? (selectedNode.isLiving ? "" : "?")}`
      : null;

  return (
    <aside className="space-y-6 border border-slate-200 bg-white p-4">
      <div>
        <h2 className="text-lg font-bold text-slate-950">
          {personLabel(selectedNode)}
        </h2>
        {selectedNode.displayName ? (
          <p className="mt-1 text-sm text-slate-500">{selectedNode.fullName}</p>
        ) : null}
        <div className="mt-3 grid gap-1 text-sm text-slate-700">
          {dateRange ? <div>{dateRange}</div> : null}
          {selectedNode.generationNumber ? (
            <div>Đời {selectedNode.generationNumber}</div>
          ) : null}
          {selectedNode.branchName ? <div>{selectedNode.branchName}</div> : null}
          <div>{selectedNode.isLiving ? "Còn sống" : "Đã mất"}</div>
        </div>
        <Link
          href={`/admin/people/${selectedNode.personId}`}
          className="mt-4 inline-flex min-h-11 items-center border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900"
        >
          Mở hồ sơ
        </Link>
      </div>

      <div className="grid gap-4">
        <RelationList title="Cha/mẹ" people={summary.parents} />
        <RelationList title="Vợ/chồng/bạn đời" people={summary.spouses} />
        <RelationList title="Con" people={summary.children} />
      </div>

      {canCreateRelationships ? (
        <div className="space-y-4 border-t border-slate-200 pt-4">
          <form action={addParentAction} className="space-y-3">
            <input type="hidden" name="return_to" value="/admin/tree/edit" />
            <input
              type="hidden"
              name="selected_person_id"
              value={selectedNode.personId}
            />
            <h3 className="text-sm font-bold text-slate-950">Thêm cha/mẹ</h3>
            <RelatedPersonInput />
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-800">Vai trò</span>
                <select
                  name="parent_role"
                  defaultValue="father"
                  className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
                >
                  {PARENT_ROLES.map((role: ParentRole) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-800">Loại</span>
                <select
                  name="relationship_type"
                  defaultValue="biological"
                  className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
                >
                  {PARENT_RELATIONSHIP_TYPES.map(
                    (type: ParentRelationshipType) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ),
                  )}
                </select>
              </label>
            </div>
            <button
              type="submit"
              className="min-h-11 border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Thêm cha/mẹ
            </button>
          </form>

          <form action={addSpouseAction} className="space-y-3 border-t border-slate-100 pt-4">
            <input type="hidden" name="return_to" value="/admin/tree/edit" />
            <input
              type="hidden"
              name="selected_person_id"
              value={selectedNode.personId}
            />
            <h3 className="text-sm font-bold text-slate-950">
              Thêm vợ/chồng/bạn đời
            </h3>
            <RelatedPersonInput />
            <label className="block">
              <span className="text-sm font-semibold text-slate-800">
                Trạng thái
              </span>
              <select
                name="relationship_status"
                defaultValue="married"
                className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
              >
                {COUPLE_RELATIONSHIP_STATUSES.map(
                  (status: CoupleRelationshipStatus) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ),
                )}
              </select>
            </label>
            <button
              type="submit"
              className="min-h-11 border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Thêm vợ/chồng
            </button>
          </form>

          <form action={addChildAction} className="space-y-3 border-t border-slate-100 pt-4">
            <input type="hidden" name="return_to" value="/admin/tree/edit" />
            <input
              type="hidden"
              name="selected_person_id"
              value={selectedNode.personId}
            />
            <h3 className="text-sm font-bold text-slate-950">Thêm con</h3>
            <RelatedPersonInput />
            <label className="block">
              <span className="text-sm font-semibold text-slate-800">
                Loại quan hệ con
              </span>
              <select
                name="child_relationship_type"
                defaultValue="biological"
                className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
              >
                {CHILD_RELATIONSHIP_TYPES.map(
                  (type: ChildRelationshipType) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ),
                )}
              </select>
            </label>
            <button
              type="submit"
              className="min-h-11 border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Thêm con
            </button>
          </form>
        </div>
      ) : (
        <div className="border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Bạn chưa có quyền tạo quan hệ từ cây.
        </div>
      )}
    </aside>
  );
}
