import Link from "next/link";

import {
  PERSON_DATE_PRECISIONS,
  PERSON_GENDERS,
  PERSON_VISIBILITIES,
  type Person,
} from "@/lib/family/people-types";

type PersonFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  person?: Person;
  readOnly?: boolean;
  error?: string;
  saved?: string;
  submitLabel: string;
};

const genderLabels: Record<string, string> = {
  male: "Nam",
  female: "Nữ",
  other: "Khác",
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
  public: "Public - có thể hiển thị ở trang công khai",
  family: "Family - chỉ nội bộ gia đình",
  private: "Private - riêng tư, hạn chế tối đa",
};

export function PersonForm({
  action,
  person,
  readOnly = false,
  error,
  saved,
  submitLabel,
}: PersonFormProps) {
  return (
    <form action={action} className="space-y-6">
      {person ? <input type="hidden" name="id" value={person.id} /> : null}

      {error ? (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {saved ? (
        <div className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Đã lưu thay đổi: {saved}
        </div>
      ) : null}

      {person?.deleted_at ? (
        <div className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Thành viên này đang bị xóa mềm. Cần khôi phục trước khi chỉnh sửa.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Họ tên *</span>
          <input
            name="full_name"
            required
            readOnly={readOnly}
            defaultValue={person?.full_name ?? ""}
            className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-800">
            Tên hiển thị
          </span>
          <input
            name="display_name"
            readOnly={readOnly}
            defaultValue={person?.display_name ?? ""}
            className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Giới tính</span>
          <select
            name="gender"
            disabled={readOnly}
            defaultValue={person?.gender ?? "unknown"}
            className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
          >
            {PERSON_GENDERS.map((gender) => (
              <option key={gender} value={gender}>
                {genderLabels[gender]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-3 pt-6 text-sm font-semibold text-slate-800">
          <input
            name="is_living"
            type="checkbox"
            disabled={readOnly}
            defaultChecked={person?.is_living ?? true}
            className="h-4 w-4"
          />
          Còn sống
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Ngày sinh</span>
          <input
            name="birth_date"
            type="date"
            readOnly={readOnly}
            defaultValue={person?.birth_date ?? ""}
            className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-800">
            Độ chính xác ngày sinh
          </span>
          <select
            name="birth_date_precision"
            disabled={readOnly}
            defaultValue={person?.birth_date_precision ?? "unknown"}
            className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
          >
            {PERSON_DATE_PRECISIONS.map((precision) => (
              <option key={precision} value={precision}>
                {precisionLabels[precision]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Ngày mất</span>
          <input
            name="death_date"
            type="date"
            readOnly={readOnly}
            defaultValue={person?.death_date ?? ""}
            className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-800">
            Độ chính xác ngày mất
          </span>
          <select
            name="death_date_precision"
            disabled={readOnly}
            defaultValue={person?.death_date_precision ?? "unknown"}
            className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
          >
            {PERSON_DATE_PRECISIONS.map((precision) => (
              <option key={precision} value={precision}>
                {precisionLabels[precision]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Nơi sinh</span>
          <input
            name="birth_place"
            readOnly={readOnly}
            defaultValue={person?.birth_place ?? ""}
            className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Quê quán</span>
          <input
            name="home_town"
            readOnly={readOnly}
            defaultValue={person?.home_town ?? ""}
            className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Chi/nhánh</span>
          <input
            name="branch_name"
            readOnly={readOnly}
            defaultValue={person?.branch_name ?? ""}
            className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Đời thứ</span>
          <input
            name="generation_number"
            type="number"
            min="1"
            readOnly={readOnly}
            defaultValue={person?.generation_number ?? ""}
            className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-semibold text-slate-800">Visibility</span>
        <select
          name="visibility"
          disabled={readOnly}
          defaultValue={person?.visibility ?? "family"}
          className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
        >
          {PERSON_VISIBILITIES.map((visibility) => (
            <option key={visibility} value={visibility}>
              {visibilityLabels[visibility]}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-slate-800">Tiểu sử ngắn</span>
        <textarea
          name="short_bio"
          readOnly={readOnly}
          defaultValue={person?.short_bio ?? ""}
          rows={4}
          className="mt-1 w-full border border-slate-300 px-3 py-2"
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-slate-800">
          Ghi chú riêng tư
        </span>
        <textarea
          name="notes_private"
          readOnly={readOnly}
          defaultValue={person?.notes_private ?? ""}
          rows={4}
          className="mt-1 w-full border border-slate-300 px-3 py-2"
        />
      </label>

      <div className="flex flex-wrap gap-3">
        {!readOnly ? (
          <button
            type="submit"
            className="min-h-11 border border-slate-900 bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            {submitLabel}
          </button>
        ) : null}
        <Link
          href="/admin/people"
          className="inline-flex min-h-11 items-center border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900"
        >
          Hủy
        </Link>
      </div>
    </form>
  );
}

