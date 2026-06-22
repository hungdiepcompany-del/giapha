"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { AdminWarningList } from "@/components/genealogy/admin-warning-list";
import { getTreeNodeInlineWarnings } from "@/lib/family/inline-warning-rules";
import type {
  FamilyTreeGraph,
  TreeGraphNode,
  TreePersonNode,
} from "@/lib/family/tree-types";

type RelationKind = "father" | "mother" | "child" | "spouse";
type EntryMode = "existing" | "new";

type TreeEditorSidePanelProps = {
  graph: FamilyTreeGraph;
  selectedNode: TreeGraphNode | null;
  canCreateRelationships: boolean;
  canCreatePeople: boolean;
  addParentAction: (formData: FormData) => void | Promise<void>;
  addSpouseAction: (formData: FormData) => void | Promise<void>;
  addChildAction: (formData: FormData) => void | Promise<void>;
  createPersonAndAttachAction: (formData: FormData) => void | Promise<void>;
};

const relationOptions: Array<{ value: RelationKind; label: string }> = [
  { value: "father", label: "Cha" },
  { value: "mother", label: "Mẹ" },
  { value: "child", label: "Con" },
  { value: "spouse", label: "Vợ/chồng/bạn đời" },
];

const genderOptions = [
  { value: "unknown", label: "Chưa rõ" },
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "other", label: "Khác" },
];

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

function defaultGender(relationKind: RelationKind) {
  if (relationKind === "father") {
    return "male";
  }

  if (relationKind === "mother") {
    return "female";
  }

  return "unknown";
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
        className="max-h-48 overflow-y-auto border border-slate-200 bg-white"
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
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-11 border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-500"
    >
      {pending ? "Đang lưu thành viên..." : "Lưu và gắn quan hệ"}
    </button>
  );
}

function actionForRelation(
  relationKind: RelationKind,
  actions: {
    addParentAction: (formData: FormData) => void | Promise<void>;
    addSpouseAction: (formData: FormData) => void | Promise<void>;
    addChildAction: (formData: FormData) => void | Promise<void>;
  },
) {
  if (relationKind === "child") {
    return actions.addChildAction;
  }

  if (relationKind === "spouse") {
    return actions.addSpouseAction;
  }

  return actions.addParentAction;
}

function ExistingRelationshipFields({
  relationKind,
  people,
  selectedPersonId,
}: {
  relationKind: RelationKind;
  people: TreePersonNode[];
  selectedPersonId: string;
}) {
  return (
    <>
      <RelatedPersonPicker
        people={people}
        pickerId={`tree-${relationKind}-person-results`}
        selectedPersonId={selectedPersonId}
      />
      {relationKind === "father" || relationKind === "mother" ? (
        <>
          <input type="hidden" name="parent_role" value={relationKind} />
          <input type="hidden" name="relationship_type" value="biological" />
        </>
      ) : null}
      {relationKind === "child" ? (
        <input
          type="hidden"
          name="child_relationship_type"
          value="biological"
        />
      ) : null}
      {relationKind === "spouse" ? (
        <input type="hidden" name="relationship_status" value="married" />
      ) : null}
    </>
  );
}

function NewPersonFields({ relationKind }: { relationKind: RelationKind }) {
  return (
    <div className="grid gap-3">
      <label className="block">
        <span className="text-sm font-semibold text-slate-800">Họ và tên *</span>
        <input
          name="full_name"
          required
          className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
          placeholder="Nhập họ và tên thành viên..."
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-slate-800">
          Chọn giới tính
        </span>
        <select
          key={relationKind}
          name="gender"
          defaultValue={defaultGender(relationKind)}
          className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
        >
          {genderOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Năm sinh</span>
          <input
            name="birth_year"
            type="number"
            min="1"
            max="9999"
            className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
            placeholder="Ví dụ: 1950"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Năm mất</span>
          <input
            name="death_year"
            type="number"
            min="1"
            max="9999"
            className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
            placeholder="Để trống nếu còn sống"
          />
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-semibold text-slate-800">
          Ghi chú ngắn
        </span>
        <textarea
          name="short_bio"
          rows={3}
          className="mt-1 w-full border border-slate-300 px-3 py-2"
          placeholder="Thông tin công khai ngắn, nếu cần..."
        />
      </label>
    </div>
  );
}

export function TreeEditorSidePanel({
  graph,
  selectedNode,
  canCreateRelationships,
  canCreatePeople,
  addParentAction,
  addSpouseAction,
  addChildAction,
  createPersonAndAttachAction,
}: TreeEditorSidePanelProps) {
  const [relationKind, setRelationKind] = useState<RelationKind>("father");
  const [entryMode, setEntryMode] = useState<EntryMode>("existing");

  if (!selectedNode) {
    return (
      <aside className="border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-bold text-slate-950">Bảng chi tiết</h2>
        <p className="mt-2 text-sm text-slate-600">
          Chọn một thành viên để xem quan hệ và thao tác.
        </p>
      </aside>
    );
  }

  if (selectedNode.kind !== "person") {
    return (
      <aside className="border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-bold text-slate-950">Thẻ gia đình</h2>
        <p className="mt-2 text-sm text-slate-600">
          Chọn một thành viên cụ thể để thêm người thân hoặc chỉnh quan hệ.
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
      ? `${selectedNode.birthYear ?? "?"} - ${
          selectedNode.deathYear ?? (selectedNode.isLiving ? "" : "?")
        }`
      : null;
  const inlineWarnings = getTreeNodeInlineWarnings(selectedNode);
  const existingAction = actionForRelation(relationKind, {
    addParentAction,
    addSpouseAction,
    addChildAction,
  });
  const canUseNewPersonFlow = canCreateRelationships && canCreatePeople;

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
        title="Cảnh báo thẻ đang chọn"
      />

      {canCreateRelationships ? (
        <div className="space-y-4 border-t border-slate-200 pt-4">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Người đang chọn: {personLabel(selectedNode)}
            </p>
            <h3 className="mt-2 text-base font-bold text-slate-950">
              Thêm người thân
            </h3>
            <div className="mt-2 text-sm font-semibold text-slate-800">
              Quan hệ với người đang chọn
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Chọn quan hệ với người đang chọn, rồi chọn thành viên đã có hoặc
              tạo thành viên mới để thêm vào cây gia phả.
            </p>
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-800">
              Chọn quan hệ
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {relationOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRelationKind(option.value)}
                  className={`min-h-10 border px-3 py-2 text-sm font-semibold ${
                    relationKind === option.value
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 bg-white text-slate-800 hover:border-slate-600"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-slate-800">
              Chọn hoặc tạo thành viên
            </legend>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name="tree_entry_mode"
                value="existing"
                checked={entryMode === "existing"}
                onChange={() => setEntryMode("existing")}
              />
              Chọn thành viên đã có
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name="tree_entry_mode"
                value="new"
                checked={entryMode === "new"}
                disabled={!canUseNewPersonFlow}
                onChange={() => setEntryMode("new")}
              />
              Tạo thành viên mới
            </label>
          </fieldset>

          {entryMode === "existing" ? (
            <form action={existingAction} className="space-y-3">
              <input type="hidden" name="return_to" value="/admin/tree/edit" />
              <input
                type="hidden"
                name="selected_person_id"
                value={selectedNode.personId}
              />
              <ExistingRelationshipFields
                relationKind={relationKind}
                people={people}
                selectedPersonId={selectedNode.personId}
              />
              <SubmitButton />
            </form>
          ) : (
            <form action={createPersonAndAttachAction} className="space-y-3">
              <input type="hidden" name="return_to" value="/admin/tree/edit" />
              <input
                type="hidden"
                name="selected_person_id"
                value={selectedNode.personId}
              />
              <input type="hidden" name="relation_kind" value={relationKind} />
              <NewPersonFields relationKind={relationKind} />
              <SubmitButton />
            </form>
          )}

          {!canUseNewPersonFlow ? (
            <div className="border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              Bạn không có quyền thực hiện thao tác này.
            </div>
          ) : null}
        </div>
      ) : (
        <div className="border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Bạn không có quyền thực hiện thao tác này.
        </div>
      )}
    </aside>
  );
}
