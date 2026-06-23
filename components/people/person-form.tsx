import { ActionLink } from "@/components/ui/action-link";
import { SectionCard } from "@/components/ui/section-card";
import { StatusCallout } from "@/components/ui/status-callout";
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
  female: "Nữ",
  male: "Nam",
  other: "Khác",
  unknown: "Chưa rõ",
};

const precisionLabels: Record<string, string> = {
  approximate: "Ước lượng",
  exact: "Chính xác",
  unknown: "Chưa rõ",
  year: "Năm",
  year_month: "Năm/tháng",
};

const visibilityLabels: Record<string, string> = {
  family: "Nội bộ gia đình - chỉ nội bộ gia đình",
  private: "Riêng tư - hạn chế tối đa",
  public: "Công khai - có thể hiển thị ở trang công khai",
};

function FieldLabel({ children }: { children: string }) {
  return <span className="text-sm font-semibold text-slate-800">{children}</span>;
}

const inputClass =
  "mt-1 min-h-11 w-full border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none focus:border-slate-900 disabled:bg-slate-100 read-only:bg-slate-100";

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

      {error ? <StatusCallout tone="danger">{error}</StatusCallout> : null}

      {saved ? (
        <StatusCallout tone="success">Đã lưu thay đổi: {saved}</StatusCallout>
      ) : null}

      {person?.deleted_at ? (
        <StatusCallout tone="warning">
          Thành viên này đang bị xóa mềm. Cần khôi phục trước khi chỉnh sửa.
        </StatusCallout>
      ) : null}

      <SectionCard>
        <h2 className="text-lg font-bold text-slate-950">Thông tin cơ bản</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Nên nhập họ tên đầy đủ trước, tên hiển thị chỉ dùng khi gia đình quen gọi bằng tên ngắn.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <FieldLabel>Họ tên *</FieldLabel>
            <input
              name="full_name"
              required
              readOnly={readOnly}
              defaultValue={person?.full_name ?? ""}
              className={inputClass}
              placeholder="Ví dụ: Nguyễn Văn An"
            />
          </label>

          <label className="block">
            <FieldLabel>Tên hiển thị</FieldLabel>
            <input
              name="display_name"
              readOnly={readOnly}
              defaultValue={person?.display_name ?? ""}
              className={inputClass}
              placeholder="Ví dụ: Ông An"
            />
          </label>

          <label className="block">
            <FieldLabel>Giới tính</FieldLabel>
            <select
              name="gender"
              disabled={readOnly}
              defaultValue={person?.gender ?? "unknown"}
              className={inputClass}
            >
              {PERSON_GENDERS.map((gender) => (
                <option key={gender} value={gender}>
                  {genderLabels[gender]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-h-11 items-center gap-3 pt-6 text-sm font-semibold text-slate-800">
            <input
              name="is_living"
              type="checkbox"
              disabled={readOnly}
              defaultChecked={person?.is_living ?? true}
              className="h-4 w-4"
            />
            Còn sống
          </label>
        </div>
      </SectionCard>

      <SectionCard>
        <h2 className="text-lg font-bold text-slate-950">
          Ngày sinh / ngày mất
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Nếu chỉ biết năm hoặc ước lượng, chọn độ chính xác phù hợp để người sau hiểu nguồn dữ liệu.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <FieldLabel>Ngày sinh</FieldLabel>
            <input
              name="birth_date"
              type="date"
              readOnly={readOnly}
              defaultValue={person?.birth_date ?? ""}
              className={inputClass}
            />
          </label>

          <label className="block">
            <FieldLabel>Độ chính xác ngày sinh</FieldLabel>
            <select
              name="birth_date_precision"
              disabled={readOnly}
              defaultValue={person?.birth_date_precision ?? "unknown"}
              className={inputClass}
            >
              {PERSON_DATE_PRECISIONS.map((precision) => (
                <option key={precision} value={precision}>
                  {precisionLabels[precision]}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <FieldLabel>Ngày mất</FieldLabel>
            <input
              name="death_date"
              type="date"
              readOnly={readOnly}
              defaultValue={person?.death_date ?? ""}
              className={inputClass}
            />
          </label>

          <label className="block">
            <FieldLabel>Độ chính xác ngày mất</FieldLabel>
            <select
              name="death_date_precision"
              disabled={readOnly}
              defaultValue={person?.death_date_precision ?? "unknown"}
              className={inputClass}
            >
              {PERSON_DATE_PRECISIONS.map((precision) => (
                <option key={precision} value={precision}>
                  {precisionLabels[precision]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </SectionCard>

      <SectionCard>
        <h2 className="text-lg font-bold text-slate-950">
          Quê quán / chi nhánh
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Thông tin chi/nhánh và đời thứ giúp lọc, tìm và sắp xếp cây gia phả dễ hơn.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <FieldLabel>Nơi sinh</FieldLabel>
            <input
              name="birth_place"
              readOnly={readOnly}
              defaultValue={person?.birth_place ?? ""}
              className={inputClass}
              placeholder="Nơi sinh, nếu gia đình biết rõ"
            />
          </label>

          <label className="block">
            <FieldLabel>Quê quán</FieldLabel>
            <input
              name="home_town"
              readOnly={readOnly}
              defaultValue={person?.home_town ?? ""}
              className={inputClass}
              placeholder="Quê quán hoặc nguyên quán"
            />
          </label>

          <label className="block">
            <FieldLabel>Chi/nhánh</FieldLabel>
            <input
              name="branch_name"
              readOnly={readOnly}
              defaultValue={person?.branch_name ?? ""}
              className={inputClass}
              placeholder="Ví dụ: Chi trưởng, nhánh miền Nam"
            />
          </label>

          <label className="block">
            <FieldLabel>Đời thứ</FieldLabel>
            <input
              name="generation_number"
              type="number"
              min="1"
              readOnly={readOnly}
              defaultValue={person?.generation_number ?? ""}
              className={inputClass}
            />
          </label>
        </div>
      </SectionCard>

      <SectionCard>
        <h2 className="text-lg font-bold text-slate-950">Riêng tư / ghi chú</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Chọn phạm vi hiển thị trước khi ghi tiểu sử. Ghi chú riêng tư chỉ dành cho quản trị, không dùng cho trang công khai.
        </p>
        <div className="mt-4 grid gap-4">
          <label className="block">
            <FieldLabel>Phạm vi hiển thị</FieldLabel>
            <select
              name="visibility"
              disabled={readOnly}
              defaultValue={person?.visibility ?? "family"}
              className={inputClass}
            >
              {PERSON_VISIBILITIES.map((visibility) => (
                <option key={visibility} value={visibility}>
                  {visibilityLabels[visibility]}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <FieldLabel>Tiểu sử ngắn</FieldLabel>
            <textarea
              name="short_bio"
              readOnly={readOnly}
              defaultValue={person?.short_bio ?? ""}
              rows={4}
              className={`${inputClass} min-h-28`}
              placeholder="Tóm tắt ngắn có thể hiển thị theo phạm vi đã chọn"
            />
          </label>

          <label className="block">
            <FieldLabel>Ghi chú riêng tư</FieldLabel>
            <textarea
              name="notes_private"
              readOnly={readOnly}
              defaultValue={person?.notes_private ?? ""}
              rows={4}
              className={`${inputClass} min-h-28`}
              placeholder="Ghi chú nội bộ, nguồn kiểm chứng hoặc việc cần hỏi lại gia đình"
            />
          </label>
        </div>
      </SectionCard>

      <div className="flex flex-wrap gap-3">
        {!readOnly ? (
          <button
            type="submit"
            className="min-h-11 border border-slate-900 bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            {submitLabel}
          </button>
        ) : null}
        <ActionLink href="/admin/people">
          {readOnly ? "Quay lại danh sách" : "Hủy thay đổi"}
        </ActionLink>
      </div>
    </form>
  );
}
