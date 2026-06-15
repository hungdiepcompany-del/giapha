import { createCoupleRelationshipAction } from "@/app/(admin)/admin/relationships/actions";
import {
  COUPLE_RELATIONSHIP_STATUSES,
  RELATIONSHIP_DATE_PRECISIONS,
  RELATIONSHIP_VISIBILITIES,
} from "@/lib/family/relationship-types";

type CoupleFormProps = {
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

export function CoupleForm({ contextPersonId, returnTo }: CoupleFormProps) {
  return (
    <form action={createCoupleRelationshipAction} className="space-y-4 border border-slate-200 bg-white p-4">
      <h3 className="text-base font-semibold text-slate-950">Tạo quan hệ đôi</h3>
      <input type="hidden" name="return_to" value={returnTo} />
      {contextPersonId ? (
        <>
          <input type="hidden" name="context_person_id" value={contextPersonId} />
          <input type="hidden" name="person1_id" value={contextPersonId} />
        </>
      ) : null}
      {!contextPersonId ? (
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Person 1 ID</span>
          <input
            name="person1_id"
            required
            className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2 font-mono text-sm"
            placeholder="UUID thành viên"
          />
        </label>
      ) : null}
      <label className="block">
        <span className="text-sm font-semibold text-slate-800">
          {contextPersonId ? "Person ID của vợ/chồng/bạn đời" : "Person 2 ID"}
        </span>
        <input
          name="person2_id"
          required
          className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2 font-mono text-sm"
          placeholder="UUID thành viên"
        />
      </label>
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
          <span className="text-sm font-semibold text-slate-800">Ngày bắt đầu</span>
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
          <span className="text-sm font-semibold text-slate-800">Ngày kết thúc</span>
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
        <span className="text-sm font-semibold text-slate-800">Family ID liên kết</span>
        <input
          name="family_id"
          className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2 font-mono text-sm"
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
