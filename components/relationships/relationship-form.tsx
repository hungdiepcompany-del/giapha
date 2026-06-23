import {
  addChildToFamilyAction,
  addParentToFamilyAction,
  createFamilyAction,
} from "@/app/(admin)/admin/relationships/actions";
import type { Person } from "@/lib/family/people-types";
import {
  CHILD_RELATIONSHIP_TYPES,
  PARENT_RELATIONSHIP_TYPES,
  PARENT_ROLES,
  RELATIONSHIP_VISIBILITIES,
  type FamilyWithMembers,
} from "@/lib/family/relationship-types";

type RelationshipFormProps = {
  families: FamilyWithMembers[];
  people: Person[];
  contextPersonId?: string;
  returnTo: string;
  mode?: "page" | "person";
};

const parentRoleLabels: Record<string, string> = {
  father: "Cha",
  mother: "Mẹ",
  parent: "Phụ huynh",
  unknown: "Chưa rõ",
};

const parentTypeLabels: Record<string, string> = {
  biological: "Ruột",
  adoptive: "Nuôi",
  step: "Kế",
  guardian: "Giám hộ",
  unknown: "Chưa rõ",
};

const childTypeLabels: Record<string, string> = {
  biological: "Con ruột",
  adoptive: "Con nuôi",
  step: "Con riêng/kế",
  foster: "Con được chăm sóc",
  unknown: "Chưa rõ",
};

const visibilityLabels: Record<string, string> = {
  family: "Nội bộ gia đình",
  private: "Riêng tư",
  public: "Công khai",
};

function personLabel(person: Pick<Person, "full_name" | "display_name" | "birth_date">) {
  const name = person.display_name || person.full_name;
  const birthYear = person.birth_date ? person.birth_date.slice(0, 4) : null;

  return birthYear ? `${name} - sinh ${birthYear}` : name;
}

function PersonSelect({
  label,
  name,
  people,
  defaultValue,
  excludePersonId,
}: {
  label: string;
  name: string;
  people: Person[];
  defaultValue?: string;
  excludePersonId?: string;
}) {
  const candidates = people
    .filter((person) => !excludePersonId || person.id !== excludePersonId)
    .sort((a, b) => personLabel(a).localeCompare(personLabel(b), "vi"));

  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <select
        name={name}
        required
        defaultValue={defaultValue ?? ""}
        className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
      >
        <option value="">Chọn thành viên</option>
        {candidates.map((person) => (
          <option key={person.id} value={person.id}>
            {personLabel(person)}
          </option>
        ))}
      </select>
      {candidates.length === 0 ? (
        <p className="mt-1 text-xs text-amber-700">
          Chưa có danh sách thành viên để chọn. Cần quyền xem thành viên trước
          khi tạo quan hệ.
        </p>
      ) : null}
    </label>
  );
}

export function RelationshipForm({
  families,
  people,
  contextPersonId,
  returnTo,
  mode = "page",
}: RelationshipFormProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <form
        action={createFamilyAction}
        className="space-y-4 border border-slate-200 bg-white p-4"
      >
        <h3 className="text-base font-semibold text-slate-950">
          Tạo đơn vị gia đình
        </h3>
        <p className="text-sm leading-6 text-slate-600">
          Dùng khi cần một nhóm cha/mẹ và con. Có thể tạo gia đình trước rồi gắn người sau.
        </p>
        <input type="hidden" name="return_to" value={returnTo} />
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">
            Mã gia đình
          </span>
          <input
            name="family_code"
            className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
            placeholder="Ví dụ: FAM-001"
          />
          <p className="mt-1 text-xs text-slate-500">
            Có thể để trống nếu gia đình chưa có quy ước mã riêng.
          </p>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">
            Tên hiển thị
          </span>
          <input
            name="family_label"
            className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
            placeholder="Ví dụ: Gia đình ông Bảy và bà Lan"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">
            Phạm vi hiển thị
          </span>
          <select
            name="visibility"
            defaultValue="family"
            className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
          >
            {RELATIONSHIP_VISIBILITIES.map((visibility) => (
              <option key={visibility} value={visibility}>
                {visibilityLabels[visibility]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Ghi chú</span>
          <textarea
            name="notes"
            rows={3}
            className="mt-1 w-full border border-slate-300 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="min-h-11 border border-slate-900 bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
        >
          Tạo gia đình
        </button>
      </form>

      <form
        action={addParentToFamilyAction}
        className="space-y-4 border border-slate-200 bg-white p-4"
      >
        <h3 className="text-base font-semibold text-slate-950">
          {mode === "person" ? "Thêm cha/mẹ cho thành viên này" : "Thêm cha/mẹ"}
        </h3>
        <p className="text-sm leading-6 text-slate-600">
          Chọn đúng đơn vị gia đình trước khi gắn cha/mẹ để tránh nối nhầm nhánh.
        </p>
        <input type="hidden" name="return_to" value={returnTo} />
        {contextPersonId ? (
          <input type="hidden" name="context_person_id" value={contextPersonId} />
        ) : null}
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">
            Gia đình
          </span>
          <select
            name="family_id"
            required
            className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
          >
            <option value="">Chọn gia đình</option>
            {families.map((family) => (
              <option key={family.id} value={family.id}>
                {family.family_label || family.family_code || family.id}
              </option>
            ))}
          </select>
          {families.length === 0 ? (
            <p className="mt-1 text-xs text-amber-700">
              Chưa có đơn vị gia đình. Hãy tạo gia đình trước rồi quay lại gắn cha/mẹ.
            </p>
          ) : null}
        </label>
        <PersonSelect
          label="Chọn cha/mẹ"
          name="person_id"
          people={people}
          excludePersonId={contextPersonId}
        />
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Vai trò</span>
          <select
            name="parent_role"
            defaultValue="unknown"
            className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
          >
            {PARENT_ROLES.map((role) => (
              <option key={role} value={role}>
                {parentRoleLabels[role]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">
            Loại quan hệ
          </span>
          <select
            name="relationship_type"
            defaultValue="unknown"
            className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
          >
            {PARENT_RELATIONSHIP_TYPES.map((type) => (
              <option key={type} value={type}>
                {parentTypeLabels[type]}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="min-h-11 border border-slate-900 bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
        >
          Thêm cha/mẹ
        </button>
      </form>

      <form
        action={addChildToFamilyAction}
        className="space-y-4 border border-slate-200 bg-white p-4"
      >
        <h3 className="text-base font-semibold text-slate-950">
          {mode === "person" ? "Thêm con cho gia đình của thành viên" : "Thêm con"}
        </h3>
        <p className="text-sm leading-6 text-slate-600">
          Con được gắn vào một đơn vị gia đình, không gắn trực tiếp bằng cách kéo cạnh trên cây.
        </p>
        <input type="hidden" name="return_to" value={returnTo} />
        {contextPersonId ? (
          <input type="hidden" name="context_person_id" value={contextPersonId} />
        ) : null}
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">
            Gia đình
          </span>
          <select
            name="family_id"
            required
            className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
          >
            <option value="">Chọn gia đình</option>
            {families.map((family) => (
              <option key={family.id} value={family.id}>
                {family.family_label || family.family_code || family.id}
              </option>
            ))}
          </select>
          {families.length === 0 ? (
            <p className="mt-1 text-xs text-amber-700">
              Chưa có đơn vị gia đình. Hãy tạo gia đình trước rồi quay lại gắn con.
            </p>
          ) : null}
        </label>
        <PersonSelect
          label="Chọn con"
          name="person_id"
          people={people}
          defaultValue={mode === "person" ? contextPersonId : ""}
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
            {CHILD_RELATIONSHIP_TYPES.map((type) => (
              <option key={type} value={type}>
                {childTypeLabels[type]}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="min-h-11 border border-slate-900 bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
        >
          Thêm con
        </button>
      </form>
    </div>
  );
}
