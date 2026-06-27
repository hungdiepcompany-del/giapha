"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { AdminWarningList } from "@/components/genealogy/admin-warning-list";
import { getTreeNodeInlineWarnings } from "@/lib/family/inline-warning-rules";
import type { InlineAdminWarning } from "@/lib/family/inline-warning-types";
import type {
  FamilyTreeGraph,
  TreeGraphNode,
  TreePersonNode,
} from "@/lib/family/tree-types";

type RelationKind = "father" | "mother" | "child" | "spouse";
type EntryMode = "existing" | "new";
type CreateMode = "quick" | "detail";

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

function normalizeDuplicateName(value: string) {
  return normalizeSearch(value).replace(/\s+/g, " ");
}

function tokenizedName(value: string) {
  return normalizeDuplicateName(value)
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean);
}

function yearDistance(inputYear: string, candidateYear: string | null) {
  if (!inputYear || !candidateYear) {
    return null;
  }

  const input = Number(inputYear);
  const candidate = Number(candidateYear);

  if (!Number.isInteger(input) || !Number.isInteger(candidate)) {
    return null;
  }

  return Math.abs(input - candidate);
}

function duplicateSuggestionScore(
  candidate: TreePersonNode,
  fullName: string,
  birthYear: string,
  deathYear: string,
) {
  const normalizedInput = normalizeDuplicateName(fullName);

  if (!normalizedInput) {
    return 0;
  }

  const candidateNames = [
    candidate.fullName,
    candidate.displayName,
  ].filter(Boolean);
  const candidateTokens = new Set(
    candidateNames.flatMap((name) => tokenizedName(String(name))),
  );
  const inputTokens = tokenizedName(normalizedInput);
  const exactNameMatch = candidateNames.some(
    (name) => normalizeDuplicateName(String(name)) === normalizedInput,
  );
  const sharedTokenCount = inputTokens.filter((token) =>
    candidateTokens.has(token),
  ).length;
  const birthDistance = yearDistance(birthYear, candidate.birthYear);
  const deathDistance = yearDistance(deathYear, candidate.deathYear);
  let score = 0;

  if (exactNameMatch) {
    score += 100;
  } else if (inputTokens.length >= 2 && sharedTokenCount >= 2) {
    score += 55 + sharedTokenCount * 5;
  } else if (inputTokens.length >= 1 && sharedTokenCount >= 1) {
    score += 25;
  }

  if (birthDistance === 0) {
    score += 30;
  } else if (birthDistance !== null && birthDistance <= 2) {
    score += 18;
  }

  if (deathDistance === 0) {
    score += 20;
  } else if (deathDistance !== null && deathDistance <= 2) {
    score += 10;
  }

  return score;
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

function relationLabel(relationKind: RelationKind) {
  if (relationKind === "father") return "cha";
  if (relationKind === "mother") return "mẹ";
  if (relationKind === "child") return "con";
  return "vợ/chồng/bạn đời";
}

function relationContext(relationKind: RelationKind, selectedName: string) {
  if (relationKind === "father") {
    return `Người mới sẽ được gắn là cha của ${selectedName}.`;
  }

  if (relationKind === "mother") {
    return `Người mới sẽ được gắn là mẹ của ${selectedName}.`;
  }

  if (relationKind === "child") {
    return `Người mới sẽ được gắn là con của ${selectedName}.`;
  }

  return `Người mới sẽ được gắn là vợ/chồng/bạn đời của ${selectedName}.`;
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

function getTreeDataQualitySuggestions({
  selectedNode,
  people,
  summary,
}: {
  selectedNode: TreePersonNode;
  people: TreePersonNode[];
  summary: ReturnType<typeof relationshipSummary>;
}): InlineAdminWarning[] {
  const suggestions: InlineAdminWarning[] = [];
  const addSuggestion = (
    code: string,
    title: string,
    message: string,
    action: string,
  ) => {
    suggestions.push({
      code,
      severity: "info",
      title,
      message,
      action,
    });
  };

  if (!selectedNode.birthYear) {
    addSuggestion(
      "TREE_PERSON_BIRTH_YEAR_MISSING",
      "Thành viên này chưa có năm sinh",
      "Năm sinh giúp phân biệt người trùng tên và sắp xếp thế hệ dễ hơn.",
      "Bổ sung khi gia đình có nguồn xác minh phù hợp.",
    );
  }

  if (!selectedNode.isLiving && !selectedNode.deathYear) {
    addSuggestion(
      "TREE_PERSON_DEATH_YEAR_MISSING",
      "Thành viên này chưa có năm mất",
      "Hồ sơ đã ghi nhận là đã mất nhưng chưa có năm mất.",
      "Bổ sung khi đã xác minh được thông tin.",
    );
  }

  if (summary.parents.length === 0) {
    addSuggestion(
      "TREE_PERSON_PARENTS_MISSING",
      "Thành viên này chưa có cha/mẹ trong cây",
      "Có thể đây là người đầu nhánh, hoặc quan hệ cha/mẹ chưa được bổ sung.",
      "Kiểm tra lại gia phả trước khi thêm quan hệ.",
    );
  }

  if (
    summary.parents.length === 0 &&
    summary.children.length === 0 &&
    summary.spouses.length === 0
  ) {
    addSuggestion(
      "TREE_PERSON_RELATIONSHIPS_EMPTY",
      "Thành viên này chưa có quan hệ gia đình nào",
      "Thẻ đang đứng riêng trong dữ liệu cây hiện tại.",
      "Thêm quan hệ khi đã xác định đúng người thân.",
    );
  }

  const normalizedSelectedName = normalizeDuplicateName(
    personLabel(selectedNode),
  );
  const hasSimilarMember = people.some(
    (person) =>
      person.personId !== selectedNode.personId &&
      normalizeDuplicateName(personLabel(person)) === normalizedSelectedName,
  );

  if (normalizedSelectedName && hasSimilarMember) {
    addSuggestion(
      "TREE_PERSON_SIMILAR_NAME",
      "Có thể đã tồn tại thành viên tương tự",
      "Cây đang có người khác với tên rất giống thành viên đang chọn.",
      "Đối chiếu năm sinh và quan hệ trước khi tạo thêm hồ sơ.",
    );
  }

  return suggestions.slice(0, 5);
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
  selectedRelatedPersonId,
  onSelectPerson,
}: {
  people: TreePersonNode[];
  pickerId: string;
  selectedPersonId: string;
  selectedRelatedPersonId: string;
  onSelectPerson: (personId: string) => void;
}) {
  const candidates = useMemo(() => {
    return people
      .filter((person) => person.personId !== selectedPersonId)
      .sort((a, b) => personLabel(a).localeCompare(personLabel(b), "vi"));
  }, [people, selectedPersonId]);
  const [query, setQuery] = useState("");
  const selectedPerson = candidates.find(
    (person) => person.personId === selectedRelatedPersonId,
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
          className="mt-1 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base"
          placeholder="Tìm theo tên, năm sinh hoặc chi nhánh..."
          role="combobox"
          aria-expanded="true"
          aria-controls={pickerId}
          aria-autocomplete="list"
        />
      </label>

      <select
        name="related_person_id"
        value={selectedRelatedPersonId}
        onChange={(event) => onSelectPerson(event.target.value)}
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
        className="max-h-56 overflow-y-auto rounded-md border border-stone-200 bg-white"
      >
        {filteredCandidates.length > 0 ? (
          filteredCandidates.map((person) => {
            const isSelected = person.personId === selectedRelatedPersonId;

            return (
              <button
                key={person.personId}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onSelectPerson(person.personId);
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

function SubmitButton({
  label = "Lưu và gắn quan hệ",
  pendingLabel = "Đang lưu quan hệ...",
}: {
  label?: string;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-11 w-full rounded-md border border-[#245744] bg-[#245744] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-stone-500 sm:w-auto"
    >
      {pending ? pendingLabel : label}
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
  selectedRelatedPersonId,
  onSelectPerson,
}: {
  relationKind: RelationKind;
  people: TreePersonNode[];
  selectedPersonId: string;
  selectedRelatedPersonId: string;
  onSelectPerson: (personId: string) => void;
}) {
  return (
    <>
      <RelatedPersonPicker
        people={people}
        pickerId={`tree-${relationKind}-person-results`}
        selectedPersonId={selectedPersonId}
        selectedRelatedPersonId={selectedRelatedPersonId}
        onSelectPerson={onSelectPerson}
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

function DuplicateSuggestionBox({
  people,
  selectedPersonId,
  fullName,
  birthYear,
  deathYear,
  onUseExistingPerson,
}: {
  people: TreePersonNode[];
  selectedPersonId: string;
  fullName: string;
  birthYear: string;
  deathYear: string;
  onUseExistingPerson: (personId: string) => void;
}) {
  const suggestions = useMemo(() => {
    const trimmedName = fullName.trim();

    if (!trimmedName) {
      return [];
    }

    return people
      .filter((person) => person.personId !== selectedPersonId)
      .map((person) => ({
        person,
        score: duplicateSuggestionScore(person, trimmedName, birthYear, deathYear),
      }))
      .filter(({ score }) => score >= 55)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(({ person }) => person);
  }, [birthYear, deathYear, fullName, people, selectedPersonId]);

  if (!fullName.trim()) {
    return null;
  }

  return (
    <div className="border border-amber-200 bg-amber-50 p-3">
      <div className="text-xs font-semibold uppercase text-amber-800">
        Gợi ý tránh tạo trùng
      </div>
      {suggestions.length > 0 ? (
        <div className="mt-2 space-y-3">
          <h4 className="text-sm font-bold text-amber-950">
            Có thể đã tồn tại thành viên tương tự
          </h4>
          <div className="space-y-2">
            {suggestions.map((person) => (
              <div
                key={person.personId}
                className="min-w-0 rounded-md border border-amber-200 bg-white p-3"
              >
                <div className="break-words text-sm font-semibold text-slate-950">
                  {personLabel(person)}
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  {personOptionLabel(person)}
                </div>
                <div className="mt-3 grid gap-2 min-[380px]:flex min-[380px]:flex-wrap">
                  <button
                    type="button"
                    onClick={() => onUseExistingPerson(person.personId)}
                    className="min-h-11 rounded-md border border-[#245744] bg-[#245744] px-3 py-2 text-sm font-semibold text-white"
                  >
                    Dùng thành viên này để gắn quan hệ
                  </button>
                  <span className="inline-flex min-h-11 items-center rounded-md border border-stone-200 px-3 py-2 text-xs text-stone-600">
                    Thành viên đã có
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-amber-900">
            Tạo mới vẫn đúng nếu đây là người khác trong gia đình.
          </p>
        </div>
      ) : (
        <p className="mt-2 text-sm text-amber-900">
          Không tìm thấy thành viên tương tự.
        </p>
      )}
    </div>
  );
}

function NewPersonFields({
  relationKind,
  people,
  selectedPersonId,
  selectedPersonName,
  onUseExistingPerson,
}: {
  relationKind: RelationKind;
  people: TreePersonNode[];
  selectedPersonId: string;
  selectedPersonName: string;
  onUseExistingPerson: (personId: string) => void;
}) {
  const [fullName, setFullName] = useState("");
  const [createMode, setCreateMode] = useState<CreateMode>("quick");
  const [birthYear, setBirthYear] = useState("");
  const [deathYear, setDeathYear] = useState("");
  const selectedRelationLabel = relationLabel(relationKind);
  const isDetail = createMode === "detail";

  return (
    <div className="grid gap-4">
      <input type="hidden" name="form_mode" value={createMode} />
      <div className="border border-stone-200 bg-[#fffaf0] p-3 text-sm leading-6 text-stone-800">
        <div className="font-bold text-stone-950">
          Bạn đang thêm {selectedRelationLabel} cho: {selectedPersonName}
        </div>
        <div className="mt-1">{relationContext(relationKind, selectedPersonName)}</div>
        <div className="mt-1 text-stone-600">
          Kiểm tra kỹ để tránh gắn nhầm quan hệ trong gia phả.
        </div>
      </div>

      <div className="grid gap-2 min-[380px]:grid-cols-2" role="group" aria-label="Chọn cách nhập thành viên mới">
        <button
          type="button"
          onClick={() => setCreateMode("quick")}
          className={`min-h-11 rounded-md border px-3 py-2 text-sm font-semibold ${
            createMode === "quick"
              ? "border-stone-900 bg-stone-900 text-white"
              : "border-stone-300 bg-white text-stone-800"
          }`}
        >
          Thêm nhanh
        </button>
        <button
          type="button"
          onClick={() => setCreateMode("detail")}
          className={`min-h-11 rounded-md border px-3 py-2 text-sm font-semibold ${
            createMode === "detail"
              ? "border-stone-900 bg-stone-900 text-white"
              : "border-stone-300 bg-white text-stone-800"
          }`}
        >
          Nhập chi tiết hơn
        </button>
      </div>

      <div className="grid gap-3">
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Họ và tên *</span>
          <input
            name="full_name"
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="mt-1 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base"
            placeholder="Nhập họ và tên thành viên..."
          />
        </label>

        {isDetail ? (
          <label className="block">
            <span className="text-sm font-semibold text-slate-800">
              Tên thường gọi / tên hiển thị
            </span>
            <input
              name="display_name"
              className="mt-1 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base"
              placeholder="Ví dụ: Ông Ba, Bà Tư..."
            />
          </label>
        ) : null}

        <label className="block">
          <span className="text-sm font-semibold text-slate-800">
            Chọn giới tính
          </span>
          <select
            key={relationKind}
            name="gender"
            defaultValue={defaultGender(relationKind)}
            className="mt-1 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base"
          >
            {genderOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">
            {isDetail ? "Năm sinh nếu chưa biết ngày" : "Năm sinh"}
          </span>
          <input
            name="birth_year"
            type="number"
            min="1"
            max="9999"
            value={birthYear}
            onChange={(event) => setBirthYear(event.target.value)}
            className="mt-1 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base"
            placeholder="Ví dụ: 1950"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">
            {isDetail ? "Năm mất nếu chưa biết ngày" : "Năm mất"}
          </span>
          <input
            name="death_year"
            type="number"
            min="1"
            max="9999"
            value={deathYear}
            onChange={(event) => setDeathYear(event.target.value)}
            className="mt-1 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base"
            placeholder="Để trống nếu còn sống"
          />
        </label>
      </div>

      {isDetail ? (
        <div className="grid gap-3 border-t border-stone-200 pt-4">
          <label className="flex min-h-11 items-center gap-3 text-sm font-semibold text-slate-800">
            <input
              name="is_living"
              type="checkbox"
              defaultChecked
              className="h-4 w-4"
            />
            Còn sống nếu chưa có ngày mất
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-slate-800">
                Ngày sinh
              </span>
              <input
                name="birth_date"
                type="date"
                className="mt-1 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-800">
                Ngày mất
              </span>
              <input
                name="death_date"
                type="date"
                className="mt-1 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-slate-800">
                Nơi sinh
              </span>
              <input
                name="birth_place"
                className="mt-1 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base"
                placeholder="Nơi sinh, nếu đã biết"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-800">
                Quê quán
              </span>
              <input
                name="home_town"
                className="mt-1 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base"
                placeholder="Quê quán hoặc nguyên quán"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-slate-800">
                Chi/nhánh
              </span>
              <input
                name="branch_name"
                className="mt-1 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base"
                placeholder="Ví dụ: Chi trưởng"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-800">
                Đời thứ
              </span>
              <input
                name="generation_number"
                type="number"
                min="1"
                className="mt-1 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base"
                placeholder="Ví dụ: 5"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-slate-800">
              Phạm vi hiển thị
            </span>
            <select
              name="visibility"
              defaultValue="family"
              className="mt-1 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base"
            >
              <option value="family">Nội bộ gia đình</option>
              <option value="private">Riêng tư</option>
              <option value="public">Công khai</option>
            </select>
          </label>
        </div>
      ) : (
        <input type="hidden" name="visibility" value="family" />
      )}

      <label className="block">
        <span className="text-sm font-semibold text-slate-800">
          Ghi chú ngắn
        </span>
        <textarea
          name="short_bio"
          rows={3}
          className="mt-1 min-h-28 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base"
          placeholder="Thông tin công khai ngắn, nếu cần..."
        />
      </label>
      {isDetail ? (
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">
            Ghi chú riêng tư
          </span>
          <textarea
            name="notes_private"
            rows={3}
            className="mt-1 min-h-28 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base"
            placeholder="Chỉ hiển thị trong quản trị, không đưa ra trang công khai."
          />
        </label>
      ) : null}
      <DuplicateSuggestionBox
        people={people}
        selectedPersonId={selectedPersonId}
        fullName={fullName}
        birthYear={birthYear}
        deathYear={deathYear}
        onUseExistingPerson={onUseExistingPerson}
      />
      {fullName.trim() ? (
        <div className="text-xs text-slate-600">
          <button
            type="submit"
            className="min-h-11 rounded-md border border-stone-300 bg-white px-3 py-2 font-semibold text-stone-800"
          >
            Vẫn tạo thành viên mới
          </button>
        </div>
      ) : null}
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
  const [selectedRelatedPersonId, setSelectedRelatedPersonId] = useState("");

  if (!selectedNode) {
    return (
      <aside className="min-w-0 rounded-md border border-stone-200 bg-[#fffaf0] p-4">
        <h2 className="text-lg font-bold text-slate-950">Bảng chi tiết</h2>
        <p className="mt-2 text-sm text-slate-600">
          Chọn một thành viên để xem quan hệ và thao tác.
        </p>
        <div className="mt-4 border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
          Mẹo: kéo thẻ trên cây chỉ đổi bố cục hiển thị. Muốn thêm cha/mẹ, vợ/chồng/bạn đời hoặc con, hãy chọn một người rồi dùng form trong bảng này.
        </div>
      </aside>
    );
  }

  if (selectedNode.kind !== "person") {
    return (
      <aside className="min-w-0 rounded-md border border-stone-200 bg-[#fffaf0] p-4">
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
  const dateRange = `${selectedNode.birthYear ?? "Chưa rõ năm sinh"} - ${
    selectedNode.deathYear ??
    (selectedNode.isLiving ? "nay" : "Chưa rõ năm mất")
  }`;
  const inlineWarnings = [
    ...getTreeNodeInlineWarnings(selectedNode),
    ...getTreeDataQualitySuggestions({
      selectedNode,
      people,
      summary,
    }),
  ].slice(0, 5);
  const existingAction = actionForRelation(relationKind, {
    addParentAction,
    addSpouseAction,
    addChildAction,
  });
  const canUseNewPersonFlow = canCreateRelationships && canCreatePeople;

  return (
    <aside className="min-w-0 space-y-5 rounded-md border border-stone-200 bg-[#fffaf0] p-4 shadow-sm">
      <div className="border-l-4 border-emerald-700 pl-4">
        <div className="text-xs font-bold text-emerald-800">
          Người đang chọn
        </div>
        <h2 className="text-lg font-bold text-slate-950">
          {personLabel(selectedNode)}
        </h2>
        {selectedNode.displayName ? (
          <p className="mt-1 text-sm text-slate-500">{selectedNode.fullName}</p>
        ) : null}
        <div className="mt-3 grid gap-1 text-sm text-slate-700">
          <div>{dateRange}</div>
          {selectedNode.generationNumber ? (
            <div>Đời thứ {selectedNode.generationNumber}</div>
          ) : null}
          {selectedNode.branchName ? (
            <div>Chi nhánh: {selectedNode.branchName}</div>
          ) : null}
          <div>{selectedNode.isLiving ? "Còn sống" : "Đã mất"}</div>
        </div>
        <Link
          href={`/admin/people/${selectedNode.personId}`}
          className="mt-4 inline-flex min-h-11 items-center border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900"
        >
          Mở hồ sơ
        </Link>
      </div>

      <div className="grid gap-4 border-t border-slate-200 pt-4">
        <RelationList title="Cha/mẹ" people={summary.parents} />
        <RelationList title="Vợ/chồng/bạn đời" people={summary.spouses} />
        <RelationList title="Con" people={summary.children} />
      </div>

      <AdminWarningList
        warnings={inlineWarnings}
        title="Gợi ý hoàn thiện dữ liệu"
        emptyMessage="Chưa có gợi ý từ dữ liệu đang hiển thị."
      />
      <p className="-mt-3 text-xs leading-5 text-slate-500">
        Đây chỉ là gợi ý kiểm tra, hệ thống không tự thay đổi dữ liệu.
      </p>

      {canCreateRelationships ? (
        <div className="space-y-4 border-t border-slate-200 pt-5">
          <div>
            <h3 className="text-base font-bold text-slate-950">
              Thêm người thân
            </h3>
            <div className="mt-1 text-sm font-semibold text-slate-800">
              Quan hệ với người đang chọn
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Chọn quan hệ, sau đó dùng thành viên đã có hoặc tạo người mới.
            </p>
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-800">
              Chọn quan hệ
            </div>
            <div className="mt-2 grid gap-2 min-[380px]:grid-cols-2">
              {relationOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setRelationKind(option.value);
                    setSelectedRelatedPersonId("");
                  }}
                  className={`min-h-11 rounded-md border px-3 py-2 text-sm font-semibold ${
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
                onChange={() => {
                  setEntryMode("new");
                  setSelectedRelatedPersonId("");
                }}
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
                selectedRelatedPersonId={selectedRelatedPersonId}
                onSelectPerson={setSelectedRelatedPersonId}
              />
              {selectedRelatedPersonId ? (
                <div className="border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
                  Bạn đang gắn một thành viên đã có vào quan hệ mới. Hãy đối chiếu tên, năm sinh và chi nhánh trước khi lưu để tránh nối nhầm dữ liệu gia phả.
                </div>
              ) : null}
              <SubmitButton label="Gắn thành viên đã có" pendingLabel="Đang gắn quan hệ..." />
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
              <NewPersonFields
                relationKind={relationKind}
                people={people}
                selectedPersonId={selectedNode.personId}
                selectedPersonName={personLabel(selectedNode)}
                onUseExistingPerson={(personId) => {
                  setSelectedRelatedPersonId(personId);
                  setEntryMode("existing");
                }}
              />
              <SubmitButton
                label="Thêm vào cây"
                pendingLabel="Đang lưu thành viên..."
              />
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
