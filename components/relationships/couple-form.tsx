import { createCoupleRelationshipAction } from "@/app/(admin)/admin/relationships/actions";
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
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <select
        name={name}
        required
        defaultValue=""
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

export function CoupleForm({
  people,
  contextPersonId,
  returnTo,
}: CoupleFormProps) {
  return (
    <form
      action={createCoupleRelationshipAction}
      className="space-y-4 border border-slate-200 bg-white p-4"
    >
      <h3 className="text-base font-semibold text-slate-950">
        Tạo quan hệ đôi
      </h3>
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
          <span className="text-sm font-semibold text-slate-800">Trạng thái</span>
          <select
            name="relationship_status"
            defaultValue="married"
            className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
          >
            {COUPLE_RELATIONSHIP_STATUSES.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
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
          <span className="text-sm font-semibold text-slate-800">
            Ngày bắt đầu
          </span>
          <input
            name="start_date"
            type="date"
            className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">
            Độ chính xác ngày bắt đầu
          </span>
          <select
            name="start_date_precision"
            defaultValue="unknown"
            className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
          >
            {RELATIONSHIP_DATE_PRECISIONS.map((precision) => (
              <option key={precision} value={precision}>
                {precisionLabels[precision]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">
            Ngày kết thúc
          </span>
          <input
            name="end_date"
            type="date"
            className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">
            Độ chính xác ngày kết thúc
          </span>
          <select
            name="end_date_precision"
            defaultValue="unknown"
            className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
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
        <span className="text-sm font-semibold text-slate-800">
          Gia đình liên kết
        </span>
        <input
          name="family_id"
          className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
          placeholder="Tùy chọn"
        />
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
        Tạo quan hệ đôi
      </button>
    </form>
  );
}
