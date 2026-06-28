import {
  addChildToFamilyAction,
  addParentToFamilyAction,
  createFamilyAction,
} from "@/app/(admin)/admin/relationships/actions";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import type { Person } from "@/lib/family/people-types";
import type { ReactNode } from "react";
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
  family: "Chỉ thành viên gia đình",
  private: "Riêng tư",
  public: "Công khai",
};

const inputClass =
  "mt-1 min-h-12 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-base text-stone-950 outline-none transition focus:border-[#245744] focus:ring-2 focus:ring-[#245744]/15";

function personLabel(person: Pick<Person, "full_name" | "display_name" | "birth_date">) {
  const name = person.display_name || person.full_name;
  const birthYear = person.birth_date ? person.birth_date.slice(0, 4) : null;

  return birthYear ? `${name} - sinh ${birthYear}` : name;
}

function FormCard({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-amber-900/10 bg-[#fffdf6] p-4 shadow-sm sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a4b2a]">
        {eyebrow}
      </p>
      <h3 className="mt-2 text-lg font-bold text-stone-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function FieldLabel({ children }: { children: string }) {
  return <span className="text-sm font-semibold text-stone-800">{children}</span>;
}

function FieldHelp({ children }: { children: string }) {
  return <p className="mt-1 text-sm leading-6 text-stone-500">{children}</p>;
}

function RelationWarning({ children }: { children: string }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
      {children}
    </div>
  );
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
      <FieldLabel>{label}</FieldLabel>
      <select
        name={name}
        required
        defaultValue={defaultValue ?? ""}
        className={inputClass}
      >
        <option value="">Chọn thành viên</option>
        {candidates.map((person) => (
          <option key={person.id} value={person.id}>
            {personLabel(person)}
          </option>
        ))}
      </select>
      {candidates.length === 0 ? (
        <FieldHelp>
          Chưa có danh sách thành viên để chọn. Cần quyền xem thành viên trước
          khi tạo quan hệ.
        </FieldHelp>
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
    <div className="grid gap-5 xl:grid-cols-3">
      <form action={createFamilyAction} className="space-y-4">
        <FormCard
          eyebrow="Gia đình & quan hệ"
          title="Tạo đơn vị gia đình"
          description="Dùng khi cần một nhóm cha/mẹ và con. Có thể tạo gia đình trước rồi gắn người sau."
        >
          <div className="space-y-4">
            <input type="hidden" name="return_to" value={returnTo} />
            <RelationWarning>
              Thao tác này tạo một đơn vị quan hệ để phả đồ đọc cấu trúc cha,
              mẹ và con. Hãy đặt tên dễ hiểu nếu gia đình có nhiều nhánh.
            </RelationWarning>
            <label className="block">
              <FieldLabel>Mã gia đình</FieldLabel>
              <input
                name="family_code"
                className={inputClass}
                placeholder="Ví dụ: FAM-001"
              />
              <FieldHelp>Có thể để trống nếu gia đình chưa có quy ước mã riêng.</FieldHelp>
            </label>
            <label className="block">
              <FieldLabel>Tên hiển thị</FieldLabel>
              <input
                name="family_label"
                className={inputClass}
                placeholder="Ví dụ: Gia đình ông Bảy và bà Lan"
              />
            </label>
            <label className="block">
              <FieldLabel>Phạm vi hiển thị</FieldLabel>
              <select name="visibility" defaultValue="family" className={inputClass}>
                {RELATIONSHIP_VISIBILITIES.map((visibility) => (
                  <option key={visibility} value={visibility}>
                    {visibilityLabels[visibility]}
                  </option>
                ))}
              </select>
              <FieldHelp>Thông tin này có thể bị ẩn ở trang công khai.</FieldHelp>
            </label>
            <label className="block">
              <FieldLabel>Ghi chú</FieldLabel>
              <textarea
                name="notes"
                rows={3}
                className={`${inputClass} min-h-24`}
                placeholder="Không bắt buộc, có thể bổ sung sau"
              />
            </label>
            <FormSubmitButton
              idleLabel="Tạo gia đình"
              pendingLabel="Đang lưu quan hệ gia đình..."
              tone="dark"
            />
          </div>
        </FormCard>
      </form>

      <form action={addParentToFamilyAction} className="space-y-4">
        <FormCard
          eyebrow="Cha / mẹ"
          title={mode === "person" ? "Thêm cha/mẹ cho thành viên này" : "Thêm cha/mẹ"}
          description="Chọn đúng đơn vị gia đình trước khi gắn cha hoặc mẹ để tránh nối nhầm nhánh."
        >
          <div className="space-y-4">
            <input type="hidden" name="return_to" value={returnTo} />
            {contextPersonId ? (
              <input type="hidden" name="context_person_id" value={contextPersonId} />
            ) : null}
            <RelationWarning>
              Đang thêm cha hoặc mẹ. Quan hệ này có thể làm thay đổi cách phả đồ
              hiển thị nhánh gia đình.
            </RelationWarning>
            <label className="block">
              <FieldLabel>Gia đình</FieldLabel>
              <select name="family_id" required className={inputClass}>
                <option value="">Chọn gia đình</option>
                {families.map((family) => (
                  <option key={family.id} value={family.id}>
                    {family.family_label || family.family_code || family.id}
                  </option>
                ))}
              </select>
              {families.length === 0 ? (
                <FieldHelp>
                  Chưa có đơn vị gia đình. Hãy tạo gia đình trước rồi quay lại
                  gắn cha/mẹ.
                </FieldHelp>
              ) : null}
            </label>
            <PersonSelect
              label="Chọn cha/mẹ"
              name="person_id"
              people={people}
              excludePersonId={contextPersonId}
            />
            <label className="block">
              <FieldLabel>Vai trò</FieldLabel>
              <select name="parent_role" defaultValue="unknown" className={inputClass}>
                {PARENT_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {parentRoleLabels[role]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <FieldLabel>Loại quan hệ</FieldLabel>
              <select
                name="relationship_type"
                defaultValue="unknown"
                className={inputClass}
              >
                {PARENT_RELATIONSHIP_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {parentTypeLabels[type]}
                  </option>
                ))}
              </select>
            </label>
            <FormSubmitButton
              idleLabel="Thêm cha/mẹ"
              pendingLabel="Đang lưu quan hệ gia đình..."
              tone="dark"
            />
          </div>
        </FormCard>
      </form>

      <form action={addChildToFamilyAction} className="space-y-4">
        <FormCard
          eyebrow="Con"
          title={mode === "person" ? "Thêm con cho gia đình của thành viên" : "Thêm con"}
          description="Con được gắn vào một đơn vị gia đình, không gắn trực tiếp bằng cách kéo cạnh trên cây."
        >
          <div className="space-y-4">
            <input type="hidden" name="return_to" value={returnTo} />
            {contextPersonId ? (
              <input type="hidden" name="context_person_id" value={contextPersonId} />
            ) : null}
            <RelationWarning>
              Đang thêm con. Hãy kiểm tra lại cha/mẹ trong đơn vị gia đình trước
              khi lưu.
            </RelationWarning>
            <label className="block">
              <FieldLabel>Gia đình</FieldLabel>
              <select name="family_id" required className={inputClass}>
                <option value="">Chọn gia đình</option>
                {families.map((family) => (
                  <option key={family.id} value={family.id}>
                    {family.family_label || family.family_code || family.id}
                  </option>
                ))}
              </select>
              {families.length === 0 ? (
                <FieldHelp>
                  Chưa có đơn vị gia đình. Hãy tạo gia đình trước rồi quay lại
                  gắn con.
                </FieldHelp>
              ) : null}
            </label>
            <PersonSelect
              label="Chọn con"
              name="person_id"
              people={people}
              defaultValue={mode === "person" ? contextPersonId : ""}
            />
            <label className="block">
              <FieldLabel>Loại quan hệ con</FieldLabel>
              <select
                name="child_relationship_type"
                defaultValue="biological"
                className={inputClass}
              >
                {CHILD_RELATIONSHIP_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {childTypeLabels[type]}
                  </option>
                ))}
              </select>
            </label>
            <FormSubmitButton
              idleLabel="Thêm con"
              pendingLabel="Đang lưu quan hệ gia đình..."
              tone="dark"
            />
          </div>
        </FormCard>
      </form>
    </div>
  );
}
