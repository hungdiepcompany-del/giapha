"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { AdminWarningList } from "@/components/genealogy/admin-warning-list";
import { getTreeNodeInlineWarnings } from "@/lib/family/inline-warning-rules";
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

function personOptionLabel(node: TreePersonNode) {
  const details = [
    node.birthYear ? `sinh ${node.birthYear}` : null,
    node.generationNumber ? `đời ${node.generationNumber}` : null,
    node.branchName,
  ].filter(Boolean);

  return details.length > 0
    ? `${personLabel(node)} · ${details.join(" · ")}`
    : personLabel(node);
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

const parentRoleLabels: Record<ParentRole, string> = {
  father: "Cha",
  mother: "Mẹ",
  parent: "Phụ huynh",
  unknown: "Chưa rõ",
};

const parentTypeLabels: Record<ParentRelationshipType, string> = {
  adoptive: "Nuôi",
  biological: "Ruột",
  guardian: "Giám hộ",
  step: "Kế",
  unknown: "Chưa rõ",
};

const childTypeLabels: Record<ChildRelationshipType, string> = {
  adoptive: "Con nuôi",
  biological: "Con ruột",
  foster: "Con được chăm sóc",
  step: "Con riêng/kế",
  unknown: "Chưa rõ",
};

const coupleStatusLabels: Record<CoupleRelationshipStatus, string> = {
  divorced: "Ly hôn",
  engaged: "Đính hôn",
  married: "Đã kết hôn",
  partner: "Bạn đời",
  separated: "Ly thân",
  unknown: "Chưa rõ",
  widowed: "Góa",
};

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

function RelatedPersonPicker({
  people,
  pickerId,
  selectedPersonId,
}: {
  people: TreePersonNode[];
  pickerId: string;
  selectedPersonId: string;
}) {
  const candidates = useMemo(() => {
    return people
      .filter((person) => person.personId !== selectedPersonId)
      .sort((a, b) => personLabel(a).localeCompare(personLabel(b), "vi"));
  }, [people, selectedPersonId]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const selectedPerson = candidates.find(
    (person) => person.personId === selectedId,
  );
  const normalizedQuery = normalizeSearch(query);
  const filteredCandidates = normalizedQuery
    ? candidates.filter((person) => {
        const searchable = normalizeSearch(
          [
            person.fullName,
            person.displayName,
            person.birthYear,
            person.branchName,
            person.generationNumber ? `doi ${person.generationNumber}` : null,
          ]
            .filter(Boolean)
            .join(" "),
        );

        return searchable.includes(normalizedQuery);
      })
    : candidates.slice(0, 8);

  return (
    <div className="space-y-2">
      <label className="block">
        <span className="text-sm font-semibold text-slate-800">
          Tìm thành viên
        </span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2 text-sm"
          placeholder="Tìm theo tên, năm sinh hoặc chi nhánh..."
          role="combobox"
          aria-expanded="true"
          aria-controls={pickerId}
          aria-autocomplete="list"
        />
      </label>

      <select
        name="related_person_id"
        value={selectedId}
        onChange={(event) => setSelectedId(event.target.value)}
        required
        className="sr-only"
        aria-label="Thành viên liên quan đã chọn"
      >
        <option value="">Chưa chọn thành viên liên quan</option>
        {candidates.map((person) => (
          <option key={person.personId} value={person.personId}>
            {personOptionLabel(person)}
          </option>
        ))}
      </select>

      <div
        id={pickerId}
        role="listbox"
        className="max-h-56 overflow-y-auto border border-slate-200 bg-white"
      >
        {filteredCandidates.length > 0 ? (
          filteredCandidates.map((person) => {
            const isSelected = person.personId === selectedId;

            return (
              <button
                key={person.personId}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  setSelectedId(person.personId);
                  setQuery(personOptionLabel(person));
                }}
                className={`block min-h-11 w-full px-3 py-2 text-left text-sm ${
                  isSelected
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-800 hover:bg-slate-50"
                }`}
              >
                {personOptionLabel(person)}
              </button>
            );
          })
        ) : (
          <p className="px-3 py-3 text-sm text-slate-600">
            Không tìm thấy thành viên phù hợp.
          </p>
        )}
      </div>

      <p className="text-xs text-slate-500">
        Kết quả chọn:{" "}
        {selectedPerson
          ? personOptionLabel(selectedPerson)
          : "Chưa chọn thành viên."}
      </p>
      <p className="text-xs text-slate-500">
        ID nội bộ được dùng tự động sau khi chọn, người dùng không cần nhập thủ công.
      </p>
    </div>
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
        <h2 className="text-lg font-bold text-slate-950">Bảng chi tiết</h2>
        <p className="mt-2 text-sm text-slate-600">
          Chọn một nút thành viên để xem quan hệ và thao tác.
        </p>
      </aside>
    );
  }

  if (selectedNode.kind !== "person") {
    return (
      <aside className="border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-bold text-slate-950">Nút gia đình</h2>
        <p className="mt-2 text-sm text-slate-600">
          Phase 6 chưa hỗ trợ sửa trực tiếp nút gia đình.
        </p>
      </aside>
    );
  }

  const summary = relationshipSummary(graph, selectedNode.id);
  const people = graph.nodes.filter(
    (node): node is TreePersonNode => node.kind === "person",
  );
  const dateRange =
    selectedNode.birthYear || selectedNode.deathYear
      ? `${selectedNode.birthYear ?? "?"} - ${selectedNode.deathYear ?? (selectedNode.isLiving ? "" : "?")}`
      : null;
  const inlineWarnings = getTreeNodeInlineWarnings(selectedNode);

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

      <AdminWarningList
        warnings={inlineWarnings}
        title="Cảnh báo nút đang chọn"
      />

      {canCreateRelationships ? (
        <div className="space-y-4 border-t border-slate-200 pt-4">
          <p className="text-sm font-semibold text-slate-800">
            Người đang chọn: {personLabel(selectedNode)}
          </p>
          <form action={addParentAction} className="space-y-3">
            <input type="hidden" name="return_to" value="/admin/tree/edit" />
            <input
              type="hidden"
              name="selected_person_id"
              value={selectedNode.personId}
            />
            <h3 className="text-sm font-bold text-slate-950">Thêm cha/mẹ</h3>
            <RelatedPersonPicker
              people={people}
              pickerId="tree-parent-person-results"
              selectedPersonId={selectedNode.personId}
            />
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
                      {parentRoleLabels[role]}
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
                        {parentTypeLabels[type]}
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
            <RelatedPersonPicker
              people={people}
              pickerId="tree-spouse-person-results"
              selectedPersonId={selectedNode.personId}
            />
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
                      {coupleStatusLabels[status]}
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
            <RelatedPersonPicker
              people={people}
              pickerId="tree-child-person-results"
              selectedPersonId={selectedNode.personId}
            />
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
                    {childTypeLabels[type]}
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
