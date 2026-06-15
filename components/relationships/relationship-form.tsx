import {
  addChildToFamilyAction,
  addParentToFamilyAction,
  createFamilyAction,
} from "@/app/(admin)/admin/relationships/actions";
import {
  CHILD_RELATIONSHIP_TYPES,
  PARENT_RELATIONSHIP_TYPES,
  PARENT_ROLES,
  RELATIONSHIP_VISIBILITIES,
  type FamilyWithMembers,
} from "@/lib/family/relationship-types";

type RelationshipFormProps = {
  families: FamilyWithMembers[];
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

export function RelationshipForm({
  families,
  contextPersonId,
  returnTo,
  mode = "page",
}: RelationshipFormProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <form action={createFamilyAction} className="space-y-4 border border-slate-200 bg-white p-4">
        <h3 className="text-base font-semibold text-slate-950">Tạo family</h3>
        <input type="hidden" name="return_to" value={returnTo} />
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Mã family</span>
          <input
            name="family_code"
            className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
            placeholder="FAM-001"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Tên hiển thị</span>
          <input
            name="family_label"
            className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
            placeholder="Gia đình ông/bà..."
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Visibility</span>
          <select
            name="visibility"
            defaultValue="family"
            className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
          >
            {RELATIONSHIP_VISIBILITIES.map((visibility) => (
              <option key={visibility} value={visibility}>
                {visibility}
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
          Tạo family
        </button>
      </form>

      <form action={addParentToFamilyAction} className="space-y-4 border border-slate-200 bg-white p-4">
        <h3 className="text-base font-semibold text-slate-950">
          {mode === "person" ? "Thêm cha/mẹ cho thành viên này" : "Thêm cha/mẹ"}
        </h3>
        <input type="hidden" name="return_to" value={returnTo} />
        {contextPersonId ? (
          <input type="hidden" name="context_person_id" value={contextPersonId} />
        ) : null}
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Family</span>
          <select
            name="family_id"
            required
            className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
          >
            <option value="">Chọn family</option>
            {families.map((family) => (
              <option key={family.id} value={family.id}>
                {family.family_label || family.family_code || family.id}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">
            Person ID của cha/mẹ
          </span>
          <input
            name="person_id"
            required
            className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2 font-mono text-sm"
            placeholder="UUID thành viên"
          />
        </label>
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
          <span className="text-sm font-semibold text-slate-800">Loại quan hệ</span>
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

      <form action={addChildToFamilyAction} className="space-y-4 border border-slate-200 bg-white p-4">
        <h3 className="text-base font-semibold text-slate-950">
          {mode === "person" ? "Thêm con cho family của thành viên" : "Thêm con"}
        </h3>
        <input type="hidden" name="return_to" value={returnTo} />
        {contextPersonId ? (
          <input type="hidden" name="context_person_id" value={contextPersonId} />
        ) : null}
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Family</span>
          <select
            name="family_id"
            required
            className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
          >
            <option value="">Chọn family</option>
            {families.map((family) => (
              <option key={family.id} value={family.id}>
                {family.family_label || family.family_code || family.id}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Person ID của con</span>
          <input
            name="person_id"
            required
            defaultValue={mode === "person" ? contextPersonId : ""}
            className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2 font-mono text-sm"
            placeholder="UUID thành viên"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Loại quan hệ con</span>
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
