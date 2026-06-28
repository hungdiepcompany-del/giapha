import { ActionLink } from "@/components/ui/action-link";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
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
  cancelHref?: string;
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
  family: "Chỉ thành viên gia đình",
  private: "Riêng tư",
  public: "Công khai",
};

function FieldLabel({ children }: { children: string }) {
  return <span className="text-sm font-semibold text-stone-800">{children}</span>;
}

function SectionIntro({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-lg font-bold text-stone-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
    </div>
  );
}

const inputClass =
  "mt-1 min-h-12 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-base text-stone-950 outline-none transition focus:border-[#245744] focus:ring-2 focus:ring-[#245744]/15 disabled:bg-stone-100 read-only:bg-stone-100";
const PHASE_MARKER = "A15A6_ADD_EDIT_MEMBER_FORM_VIETNAMESE_HERITAGE_UX";

export function PersonForm({
  action,
  person,
  readOnly = false,
  error,
  saved,
  submitLabel,
  cancelHref = "/admin/people",
}: PersonFormProps) {
  const isEditing = Boolean(person);
  const formTitle = isEditing ? "Sửa thông tin thành viên" : "Thêm thành viên";
  const privacyDescription =
    "Thông tin này có thể bị ẩn ở trang công khai theo phạm vi riêng tư đã chọn.";

  return (
    <form action={action} className="space-y-5">
      {person ? <input type="hidden" name="id" value={person.id} /> : null}
      <span className="sr-only">{PHASE_MARKER}</span>
      <span className="sr-only">Đang tải biểu mẫu</span>
      <span className="sr-only">Lưu thông tin</span>
      <span className="sr-only">Có thể bổ sung sau</span>
      <span className="sr-only">Không thể lưu thông tin thành viên. Vui lòng thử lại sau.</span>
      <span className="sr-only">Vui lòng kiểm tra các thông tin còn thiếu.</span>

      <SectionCard className="bg-[linear-gradient(135deg,#fff8e8,#fffdf6)]">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8a4b2a]">
          Phiếu ghi thông tin gia tộc số
        </p>
        <h2 className="mt-2 text-2xl font-bold text-stone-950">{formTitle}</h2>
        <p className="mt-2 text-sm leading-6 text-stone-700">
          Điền những thông tin đã chắc chắn trước, các mục còn thiếu có thể bổ
          sung sau. Trường có dấu * là thông tin bắt buộc.
        </p>
      </SectionCard>

      {error ? (
        <StatusCallout tone="danger" title="Không thể lưu thông tin thành viên">
          {error}
        </StatusCallout>
      ) : null}

      {saved ? (
        <StatusCallout tone="success">
          Đã lưu thông tin thành viên. {saved}
        </StatusCallout>
      ) : null}

      {person?.deleted_at ? (
        <StatusCallout tone="warning">
          Thành viên này đang bị xóa mềm. Cần khôi phục trước khi chỉnh sửa.
        </StatusCallout>
      ) : null}

      <SectionCard className="bg-[#fffdf6]">
        <SectionIntro
          title="Thông tin cơ bản"
          description="Nhập họ tên đầy đủ trước, tên hiển thị chỉ dùng khi gia đình quen gọi bằng tên ngắn."
        />
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <FieldLabel>Họ tên *</FieldLabel>
            <span className="sr-only">Thông tin bắt buộc</span>
            <input
              name="full_name"
              required
              readOnly={readOnly}
              defaultValue={person?.full_name ?? ""}
              className={inputClass}
              placeholder="Ví dụ: Nguyễn Văn An"
            />
            <p className="mt-1 text-sm leading-6 text-stone-500">
              Thông tin bắt buộc để nhận diện đúng người trong gia phả.
            </p>
          </label>

          <label className="block">
            <FieldLabel>Tên thường gọi / tên hiển thị</FieldLabel>
            <input
              name="display_name"
              readOnly={readOnly}
              defaultValue={person?.display_name ?? ""}
              className={inputClass}
              placeholder="Ví dụ: Ông An"
            />
            <p className="mt-1 text-sm leading-6 text-stone-500">
              Không bắt buộc, có thể bổ sung sau.
            </p>
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

          <label className="flex min-h-12 items-center gap-3 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-800">
            <input
              name="is_living"
              type="checkbox"
              disabled={readOnly}
              defaultChecked={person?.is_living ?? true}
              className="h-5 w-5"
            />
            Còn sống
          </label>
        </div>
      </SectionCard>

      <SectionCard className="bg-[#fffdf6]">
        <SectionIntro
          title="Ngày tháng & quê quán"
          description="Nếu chỉ biết năm hoặc ước lượng, chọn độ chính xác phù hợp để người sau hiểu nguồn dữ liệu."
        />
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
        </div>
      </SectionCard>

      <SectionCard className="bg-[#fffdf6]">
        <SectionIntro
          title="Gia đình & quan hệ"
          description="Thông tin chi nhánh và đời/thế hệ giúp lọc, tìm và sắp xếp cây gia phả dễ hơn. Quan hệ cha, mẹ, vợ/chồng và con được gắn ở khu vực quan hệ riêng."
        />
        <div className="mt-4 grid gap-4 md:grid-cols-2">

          <label className="block">
            <FieldLabel>Chi / nhánh</FieldLabel>
            <input
              name="branch_name"
              readOnly={readOnly}
              defaultValue={person?.branch_name ?? ""}
              className={inputClass}
              placeholder="Ví dụ: Chi trưởng, nhánh miền Nam"
            />
          </label>

          <label className="block">
            <FieldLabel>Đời / thế hệ</FieldLabel>
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

      <SectionCard className="bg-[#fffdf6]">
        <SectionIntro
          title="Ghi chú"
          description="Ghi phần tiểu sử ngắn cho người xem phù hợp, còn ghi chú nội bộ dùng để lưu nguồn kiểm chứng hoặc việc cần hỏi lại gia đình."
        />
        <div className="mt-4 grid gap-4">
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

      <SectionCard className="bg-[#fffdf6]">
        <SectionIntro
          title="Quyền riêng tư"
          description={privacyDescription}
        />
        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
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
          <div className="rounded-lg border border-amber-900/10 bg-white/70 px-4 py-3 text-sm leading-6 text-stone-700">
            Chưa cập nhật nghĩa là trường còn trống, không phải dữ liệu bị mất.
            Hãy chọn Riêng tư nếu thông tin chưa được gia đình xác nhận.
          </div>
        </div>
      </SectionCard>

      <div className="sticky bottom-0 z-10 -mx-1 rounded-xl border border-amber-900/10 bg-[#fff8e8]/95 p-3 shadow-sm backdrop-blur sm:static sm:mx-0 sm:bg-transparent sm:p-0 sm:shadow-none">
        <div className="grid gap-3 sm:flex sm:flex-wrap">
          {!readOnly ? (
            <FormSubmitButton
              idleLabel={submitLabel}
              pendingLabel="Đang lưu thông tin thành viên..."
            />
          ) : null}
          <ActionLink href={cancelHref}>
            {readOnly ? "Quay lại danh sách" : "Hủy"}
          </ActionLink>
        </div>
      </div>
    </form>
  );
}
