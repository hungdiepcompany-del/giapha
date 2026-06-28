import { createCoupleRelationshipAction } from "@/app/(admin)/admin/relationships/actions";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import type { Person } from "@/lib/family/people-types";
import {
  COUPLE_RELATIONSHIP_STATUSES,
  RELATIONSHIP_DATE_PRECISIONS,
  RELATIONSHIP_VISIBILITIES,
} from "@/lib/family/relationship-types";

type CoupleFormProps = {
  people: Person[];
  contextPersonId?: string;
  returnTo: string;
};

const statusLabels: Record<string, string> = {
  married: "Đã kết hôn",
  partner: "Bạn đời",
  engaged: "Đính hôn",
  divorced: "Ly hôn",
  separated: "Ly thân",
  widowed: "Góa",
  unknown: "Chưa rõ",
};

const precisionLabels: Record<string, string> = {
  exact: "Chính xác",
  year_month: "Năm/tháng",
  year: "Năm",
  approximate: "Ước lượng",
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

function FieldLabel({ children }: { children: string }) {
  return <span className="text-sm font-semibold text-stone-800">{children}</span>;
}

function FieldHelp({ children }: { children: string }) {
  return <p className="mt-1 text-sm leading-6 text-stone-500">{children}</p>;
}

function PersonSelect({
  label,
  name,
  people,
  excludePersonId,
}: {
  label: string;
  name: string;
  people: Person[];
  excludePersonId?: string;
}) {
  const candidates = people
    .filter((person) => !excludePersonId || person.id !== excludePersonId)
    .sort((a, b) => personLabel(a).localeCompare(personLabel(b), "vi"));

  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <select name={name} required defaultValue="" className={inputClass}>
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

export function CoupleForm({
  people,
  contextPersonId,
  returnTo,
}: CoupleFormProps) {
  return (
    <form action={createCoupleRelationshipAction} className="space-y-4">
      <div className="rounded-2xl border border-amber-900/10 bg-[#fffdf6] p-4 shadow-sm sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a4b2a]">
          Vợ/chồng
        </p>
        <h3 className="mt-2 text-lg font-bold text-stone-950">
          Thêm vợ/chồng
        </h3>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Dùng cho vợ/chồng hoặc bạn đời. Quan hệ đôi được lưu riêng với đơn vị
          gia đình cha/mẹ/con.
        </p>

        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            Đang thêm vợ/chồng. Hãy kiểm tra đúng người trước khi lưu vì quan hệ
            này có thể ảnh hưởng cách đọc phả đồ.
          </div>
          <input type="hidden" name="return_to" value={returnTo} />
          {contextPersonId ? (
            <>
              <input type="hidden" name="context_person_id" value={contextPersonId} />
              <input type="hidden" name="person1_id" value={contextPersonId} />
            </>
          ) : (
            <PersonSelect
              label="Chọn thành viên thứ nhất"
              name="person1_id"
              people={people}
            />
          )}
          <PersonSelect
            label={
              contextPersonId
                ? "Chọn vợ/chồng/bạn đời"
                : "Chọn thành viên thứ hai"
            }
            name="person2_id"
            people={people}
            excludePersonId={contextPersonId}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <FieldLabel>Trạng thái</FieldLabel>
              <select
                name="relationship_status"
                defaultValue="married"
                className={inputClass}
              >
                {COUPLE_RELATIONSHIP_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
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
              <FieldLabel>Ngày bắt đầu</FieldLabel>
              <input name="start_date" type="date" className={inputClass} />
            </label>
            <label className="block">
              <FieldLabel>Độ chính xác ngày bắt đầu</FieldLabel>
              <select
                name="start_date_precision"
                defaultValue="unknown"
                className={inputClass}
              >
                {RELATIONSHIP_DATE_PRECISIONS.map((precision) => (
                  <option key={precision} value={precision}>
                    {precisionLabels[precision]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <FieldLabel>Ngày kết thúc</FieldLabel>
              <input name="end_date" type="date" className={inputClass} />
            </label>
            <label className="block">
              <FieldLabel>Độ chính xác ngày kết thúc</FieldLabel>
              <select
                name="end_date_precision"
                defaultValue="unknown"
                className={inputClass}
              >
                {RELATIONSHIP_DATE_PRECISIONS.map((precision) => (
                  <option key={precision} value={precision}>
                    {precisionLabels[precision]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block">
            <FieldLabel>Gia đình liên kết</FieldLabel>
            <input
              name="family_id"
              className={inputClass}
              placeholder="Có thể để trống"
            />
            <FieldHelp>
              Chỉ nhập khi đã biết chính xác gia đình cần liên kết; nếu chưa
              chắc, hãy để trống.
            </FieldHelp>
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
            idleLabel="Thêm vợ/chồng"
            pendingLabel="Đang lưu quan hệ gia đình..."
            tone="dark"
          />
        </div>
      </div>
    </form>
  );
}
