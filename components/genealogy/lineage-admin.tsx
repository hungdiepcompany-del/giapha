import { ActionLink } from "@/components/ui/action-link";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/section-card";
import { LineageSubmitButton } from "@/components/genealogy/lineage-submit-button";
import {
  childPolicyLabels,
  membershipTypeLabels,
  numberingMethodLabels,
  spousePolicyLabels,
  stepPolicyLabels,
  visibilityLabels,
} from "@/components/genealogy/lineage-labels";
import {
  createClanAction,
  createClanBranchAction,
  createGenerationRuleAction,
  createPersonBranchMembershipAction,
  updateClanAction,
  updateClanBranchAction,
  updateGenerationRuleAction,
  updatePersonBranchMembershipAction,
} from "@/app/(admin)/admin/genealogy/actions";
import {
  GENERATION_CHILD_POLICIES,
  GENERATION_NUMBERING_METHODS,
  GENERATION_SPOUSE_POLICIES,
  GENERATION_STEP_POLICIES,
  LINEAGE_VISIBILITIES,
  MEMBERSHIP_TYPES,
  type Clan,
  type ClanBranch,
  type GenerationRule,
  type PersonBranchMembership,
} from "@/lib/family/lineage-types";
import type { Person } from "@/lib/family/people-types";

type LineageSelectData = {
  clans: Clan[];
  branches: ClanBranch[];
  generationRules: GenerationRule[];
  people?: Person[];
};

const inputClass =
  "mt-1 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-base text-stone-950 outline-none focus:border-[#245744] disabled:bg-stone-100";

function FieldLabel({ children }: { children: string }) {
  return <span className="text-sm font-semibold text-stone-800">{children}</span>;
}

function FieldHelp({ children }: { children: string }) {
  return <p className="mt-1 text-sm leading-6 text-stone-500">{children}</p>;
}

function nameForPerson(person?: Pick<Person, "full_name" | "display_name"> | null) {
  return person ? person.display_name || person.full_name : null;
}

function clanName(clans: Clan[], clanId: string) {
  return clans.find((clan) => clan.id === clanId)?.clan_name ?? clanId;
}

function branchName(branches: ClanBranch[], branchId?: string | null) {
  if (!branchId) return "Chưa chọn chi";
  return branches.find((branch) => branch.id === branchId)?.branch_name ?? branchId;
}

function personName(people: Person[] | undefined, personId?: string | null) {
  if (!personId) return "Chưa chọn thành viên";
  return (
    nameForPerson(people?.find((person) => person.id === personId)) ?? personId
  );
}

function returnInput(returnTo: string) {
  return <input type="hidden" name="return_to" value={returnTo} />;
}

function VisibilitySelect({ defaultValue }: { defaultValue?: string }) {
  return (
    <select
      name="visibility"
      defaultValue={defaultValue ?? "family"}
      className={inputClass}
    >
      {LINEAGE_VISIBILITIES.map((visibility) => (
        <option key={visibility} value={visibility}>
          {visibilityLabels[visibility]}
        </option>
      ))}
    </select>
  );
}

export function ClanForm({
  clan,
  returnTo,
}: {
  clan?: Clan;
  returnTo: string;
}) {
  return (
    <form action={clan ? updateClanAction : createClanAction} className="space-y-4">
      {returnInput(returnTo)}
      {clan ? <input type="hidden" name="id" value={clan.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <FieldLabel>Mã dòng họ *</FieldLabel>
          <input
            name="clan_code"
            required
            autoComplete="off"
            placeholder="VD: NGUYEN-TIEN"
            defaultValue={clan?.clan_code ?? ""}
            className={inputClass}
          />
          <FieldHelp>Dùng mã ngắn, ổn định để phân biệt các dòng họ.</FieldHelp>
        </label>
        <label className="block">
          <FieldLabel>Tên dòng họ *</FieldLabel>
          <input
            name="clan_name"
            required
            placeholder="VD: Nguyễn Tiến"
            defaultValue={clan?.clan_name ?? ""}
            className={inputClass}
          />
        </label>
        <label className="block">
          <FieldLabel>Họ chính</FieldLabel>
          <input
            name="family_name"
            placeholder="VD: Nguyễn"
            defaultValue={clan?.family_name ?? ""}
            className={inputClass}
          />
        </label>
        <label className="block">
          <FieldLabel>Nơi phát tích</FieldLabel>
          <input
            name="origin_place"
            placeholder="Tỉnh/thành, làng/xã nếu có"
            defaultValue={clan?.origin_place ?? ""}
            className={inputClass}
          />
        </label>
        <label className="block">
          <FieldLabel>ID thủy tổ/người khởi nguồn</FieldLabel>
          <input
            name="founder_person_id"
            placeholder="UUID thành viên, để trống nếu chưa rõ"
            defaultValue={clan?.founder_person_id ?? ""}
            className={inputClass}
          />
          <FieldHelp>Chỉ nhập khi thành viên đã tồn tại trong hệ thống.</FieldHelp>
        </label>
        <label className="block">
          <FieldLabel>ID trưởng họ hiện tại</FieldLabel>
          <input
            name="current_head_person_id"
            placeholder="UUID thành viên, để trống nếu chưa rõ"
            defaultValue={clan?.current_head_person_id ?? ""}
            className={inputClass}
          />
        </label>
        <label className="block">
          <FieldLabel>Phạm vi hiển thị</FieldLabel>
          <VisibilitySelect defaultValue={clan?.visibility} />
          <FieldHelp>Công khai chỉ nên dùng cho dữ liệu đã được duyệt để hiển thị ở trang công khai.</FieldHelp>
        </label>
      </div>
      <label className="block">
        <FieldLabel>Mô tả</FieldLabel>
        <textarea
          name="description"
          placeholder="Ghi chú ngắn về dòng họ, nơi phát tích hoặc nguồn xác minh."
          defaultValue={clan?.description ?? ""}
          rows={3}
          className={`${inputClass} min-h-24`}
        />
      </label>
      <LineageSubmitButton
        idleLabel={clan ? "Cập nhật dòng họ" : "Tạo dòng họ"}
        pendingLabel="Đang lưu dòng họ..."
      />
    </form>
  );
}

export function BranchForm({
  branch,
  clans,
  branches,
  returnTo,
}: {
  branch?: ClanBranch;
  clans: Clan[];
  branches: ClanBranch[];
  returnTo: string;
}) {
  return (
    <form
      action={branch ? updateClanBranchAction : createClanBranchAction}
      className="space-y-4"
    >
      {returnInput(returnTo)}
      {branch ? <input type="hidden" name="id" value={branch.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <FieldLabel>Dòng họ *</FieldLabel>
          <select
            name="clan_id"
            required
            defaultValue={branch?.clan_id ?? clans[0]?.id ?? ""}
            className={inputClass}
          >
            <option value="" disabled>
              Chọn dòng họ
            </option>
            {clans.map((clan) => (
              <option key={clan.id} value={clan.id}>
                {clan.clan_name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <FieldLabel>Chi cha</FieldLabel>
          <select
            name="parent_branch_id"
            defaultValue={branch?.parent_branch_id ?? ""}
            className={inputClass}
          >
            <option value="">Không có chi cha</option>
            {branches
              .filter((candidate) => candidate.id !== branch?.id)
              .map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.branch_name}
                </option>
              ))}
          </select>
        </label>
        <label className="block">
          <FieldLabel>Mã chi *</FieldLabel>
          <input
            name="branch_code"
            required
            autoComplete="off"
            placeholder="VD: CHI-1"
            defaultValue={branch?.branch_code ?? ""}
            className={inputClass}
          />
        </label>
        <label className="block">
          <FieldLabel>Tên chi *</FieldLabel>
          <input
            name="branch_name"
            required
            placeholder="VD: Chi trưởng"
            defaultValue={branch?.branch_name ?? ""}
            className={inputClass}
          />
        </label>
        <label className="block">
          <FieldLabel>Cấp chi</FieldLabel>
          <input
            name="branch_level"
            type="number"
            min="1"
            defaultValue={branch?.branch_level ?? 1}
            className={inputClass}
          />
          <FieldHelp>Cấp 1 là chi lớn ngay dưới dòng họ.</FieldHelp>
        </label>
        <label className="block">
          <FieldLabel>Thứ tự sắp xếp</FieldLabel>
          <input
            name="sort_order"
            type="number"
            defaultValue={branch?.sort_order ?? 0}
            className={inputClass}
          />
        </label>
        <label className="block">
          <FieldLabel>Phạm vi hiển thị</FieldLabel>
          <VisibilitySelect defaultValue={branch?.visibility} />
        </label>
      </div>
      <label className="block">
        <FieldLabel>Mô tả</FieldLabel>
        <textarea
          name="description"
          placeholder="Ghi chú ngắn về chi, nhánh hoặc nguồn xác minh."
          defaultValue={branch?.description ?? ""}
          rows={3}
          className={`${inputClass} min-h-24`}
        />
      </label>
      <LineageSubmitButton
        idleLabel={branch ? "Cập nhật chi" : "Tạo chi"}
        pendingLabel="Đang lưu chi..."
        disabled={clans.length === 0}
      />
    </form>
  );
}

export function GenerationRuleForm({
  rule,
  clans,
  branches,
  returnTo,
}: {
  rule?: GenerationRule;
  clans: Clan[];
  branches: ClanBranch[];
  returnTo: string;
}) {
  return (
    <form
      action={rule ? updateGenerationRuleAction : createGenerationRuleAction}
      className="space-y-4"
    >
      {returnInput(returnTo)}
      {rule ? <input type="hidden" name="id" value={rule.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <FieldLabel>Dòng họ *</FieldLabel>
          <select
            name="clan_id"
            required
            defaultValue={rule?.clan_id ?? clans[0]?.id ?? ""}
            className={inputClass}
          >
            <option value="" disabled>
              Chọn dòng họ
            </option>
            {clans.map((clan) => (
              <option key={clan.id} value={clan.id}>
                {clan.clan_name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <FieldLabel>Chi áp dụng</FieldLabel>
          <select
            name="branch_id"
            defaultValue={rule?.branch_id ?? ""}
            className={inputClass}
          >
            <option value="">Áp dụng toàn dòng họ</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.branch_name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <FieldLabel>ID người gốc</FieldLabel>
          <input
            name="root_person_id"
            placeholder="UUID thành viên, để trống nếu chưa chốt"
            defaultValue={rule?.root_person_id ?? ""}
            className={inputClass}
          />
          <FieldHelp>Không tự tính đời trong phase này; ID này chỉ là metadata.</FieldHelp>
        </label>
        <label className="block">
          <FieldLabel>Đời bắt đầu</FieldLabel>
          <input
            name="start_generation"
            type="number"
            min="1"
            defaultValue={rule?.start_generation ?? 1}
            className={inputClass}
          />
        </label>
        <label className="block">
          <FieldLabel>Cách đánh số đời</FieldLabel>
          <select
            name="numbering_method"
            defaultValue={rule?.numbering_method ?? "root_is_one"}
            className={inputClass}
          >
            {GENERATION_NUMBERING_METHODS.map((method) => (
              <option key={method} value={method}>
                {numberingMethodLabels[method]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <FieldLabel>Quy ước con nuôi</FieldLabel>
          <select
            name="adopted_child_policy"
            defaultValue={rule?.adopted_child_policy ?? "family_decision"}
            className={inputClass}
          >
            {GENERATION_CHILD_POLICIES.map((policy) => (
              <option key={policy} value={policy}>
                {childPolicyLabels[policy]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <FieldLabel>Quy ước con riêng/kế</FieldLabel>
          <select
            name="step_child_policy"
            defaultValue={rule?.step_child_policy ?? "not_bloodline_by_default"}
            className={inputClass}
          >
            {GENERATION_STEP_POLICIES.map((policy) => (
              <option key={policy} value={policy}>
                {stepPolicyLabels[policy]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <FieldLabel>Quy ước hiển thị vợ/chồng</FieldLabel>
          <select
            name="spouse_display_policy"
            defaultValue={rule?.spouse_display_policy ?? "spouse_of_generation"}
            className={inputClass}
          >
            {GENERATION_SPOUSE_POLICIES.map((policy) => (
              <option key={policy} value={policy}>
                {spousePolicyLabels[policy]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-h-10 items-center gap-3 pt-6 text-sm font-semibold text-slate-800">
          <input
            name="is_active"
            type="checkbox"
            defaultChecked={rule?.is_active ?? true}
            className="h-4 w-4"
          />
          Đang áp dụng
        </label>
      </div>
      <label className="block">
        <FieldLabel>Ghi chú</FieldLabel>
        <textarea
          name="notes"
          placeholder="Ghi rõ quy ước gia đình nếu có ngoại lệ."
          defaultValue={rule?.notes ?? ""}
          rows={3}
          className={`${inputClass} min-h-24`}
        />
      </label>
      <LineageSubmitButton
        idleLabel={rule ? "Cập nhật quy tắc đời" : "Tạo quy tắc đời"}
        pendingLabel="Đang lưu quy tắc..."
        disabled={clans.length === 0}
      />
    </form>
  );
}

export function MembershipForm({
  membership,
  clans,
  branches,
  generationRules,
  people = [],
  personId,
  returnTo,
}: LineageSelectData & {
  membership?: PersonBranchMembership;
  personId?: string;
  returnTo: string;
}) {
  const fixedPersonId = personId ?? membership?.person_id ?? "";

  return (
    <form
      action={
        membership
          ? updatePersonBranchMembershipAction
          : createPersonBranchMembershipAction
      }
      className="space-y-4"
    >
      {returnInput(returnTo)}
      {membership ? <input type="hidden" name="id" value={membership.id} /> : null}
      {fixedPersonId ? (
        <input type="hidden" name="person_id" value={fixedPersonId} />
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        {!fixedPersonId ? (
          <label className="block">
            <FieldLabel>Thành viên *</FieldLabel>
            <select
              name="person_id"
              required
              defaultValue={membership?.person_id ?? people[0]?.id ?? ""}
              className={inputClass}
            >
              <option value="" disabled>
                Chọn thành viên
              </option>
              {people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.display_name || person.full_name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="block">
          <FieldLabel>Dòng họ *</FieldLabel>
          <select
            name="clan_id"
            required
            defaultValue={membership?.clan_id ?? clans[0]?.id ?? ""}
            className={inputClass}
          >
            <option value="" disabled>
              Chọn dòng họ
            </option>
            {clans.map((clan) => (
              <option key={clan.id} value={clan.id}>
                {clan.clan_name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <FieldLabel>Chi</FieldLabel>
          <select
            name="branch_id"
            defaultValue={membership?.branch_id ?? ""}
            className={inputClass}
          >
            <option value="">Chưa chọn chi</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.branch_name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <FieldLabel>Quy tắc đời</FieldLabel>
          <select
            name="generation_rule_id"
            defaultValue={membership?.generation_rule_id ?? ""}
            className={inputClass}
          >
            <option value="">Chưa chọn quy tắc</option>
            {generationRules.map((rule) => (
              <option key={rule.id} value={rule.id}>
                {clanName(clans, rule.clan_id)} /{" "}
                {branchName(branches, rule.branch_id)} / Đời bắt đầu{" "}
                {rule.start_generation}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <FieldLabel>Đời</FieldLabel>
          <input
            name="generation_number"
            type="number"
            min="1"
            placeholder="Để trống nếu chưa xác định"
            defaultValue={membership?.generation_number ?? ""}
            className={inputClass}
          />
          <FieldHelp>Nhập thủ công; hệ thống không tự backfill từ people.generation_number.</FieldHelp>
        </label>
        <label className="block">
          <FieldLabel>Loại gắn dòng họ/chi</FieldLabel>
          <select
            name="membership_type"
            defaultValue={membership?.membership_type ?? "bloodline"}
            className={inputClass}
          >
            {MEMBERSHIP_TYPES.map((type) => (
              <option key={type} value={type}>
                {membershipTypeLabels[type]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <FieldLabel>Thứ tự sắp xếp</FieldLabel>
          <input
            name="sort_order"
            type="number"
            defaultValue={membership?.sort_order ?? 0}
            className={inputClass}
          />
        </label>
        <label className="block">
          <FieldLabel>Phạm vi hiển thị</FieldLabel>
          <VisibilitySelect defaultValue={membership?.visibility} />
          <FieldHelp>Công khai chỉ hiển thị ngoài trang công khai khi người đó không còn sống và dòng họ/chi được đánh dấu công khai.</FieldHelp>
        </label>
        <label className="flex min-h-10 items-center gap-3 pt-6 text-sm font-semibold text-slate-800">
          <input
            name="is_primary"
            type="checkbox"
            defaultChecked={membership?.is_primary ?? true}
            className="h-4 w-4"
          />
          Gắn chính
        </label>
      </div>
      <label className="block">
        <FieldLabel>Lý do nhập đời thủ công</FieldLabel>
        <input
          name="generation_override_reason"
          placeholder="VD: Theo gia phả giấy, quyết định hội đồng gia đình..."
          defaultValue={membership?.generation_override_reason ?? ""}
          className={inputClass}
        />
      </label>
      <label className="block">
        <FieldLabel>Ghi chú nguồn</FieldLabel>
        <textarea
          name="source_note"
          placeholder="Ghi nguồn xác minh ngắn gọn. Không nhập bí mật nhạy cảm nếu không cần."
          defaultValue={membership?.source_note ?? ""}
          rows={3}
          className={`${inputClass} min-h-24`}
        />
      </label>
      <LineageSubmitButton
        idleLabel={membership ? "Cập nhật gắn dòng họ/chi" : "Gán dòng họ/chi"}
        pendingLabel="Đang lưu gắn dòng họ/chi..."
        disabled={clans.length === 0 || (!fixedPersonId && people.length === 0)}
      />
    </form>
  );
}

export function ClanList({
  clans,
  returnTo,
}: {
  clans: Clan[];
  returnTo: string;
}) {
  if (clans.length === 0) {
    return (
      <EmptyState
        title="Chưa có dòng họ"
        description="Tạo dòng họ đầu tiên trước khi thêm chi, quy tắc đời hoặc gán thành viên."
        actions={
          <ActionLink href="/admin/genealogy/clans">Tạo dòng họ</ActionLink>
        }
      />
    );
  }

  return (
    <div className="grid gap-4">
      {clans.map((clan) => (
        <SectionCard key={clan.id} className="bg-[#fff8e8]/95">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#7a2f24]">Tên họ</p>
              <h3 className="mt-1 text-xl font-bold text-stone-950">
                {clan.clan_name}
              </h3>
              <p className="mt-1 text-sm text-stone-600">
                {clan.clan_code} / {visibilityLabels[clan.visibility]}
              </p>
              {clan.origin_place ? (
              <p className="mt-2 text-sm text-stone-700">
                  Nơi phát tích: {clan.origin_place}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-3">
              <ActionLink href="/admin/tree">Xem phả đồ</ActionLink>
              <ActionLink href="/admin/people">Danh sách thành viên</ActionLink>
            </div>
            <ActionLink href="/admin/genealogy/branches">
              Quản lý chi
            </ActionLink>
          </div>
          <div className="mt-5 border-t border-amber-900/10 pt-5">
            <ClanForm clan={clan} returnTo={returnTo} />
          </div>
        </SectionCard>
      ))}
    </div>
  );
}

export function BranchList({
  branches,
  clans,
  returnTo,
}: {
  branches: ClanBranch[];
  clans: Clan[];
  returnTo: string;
}) {
  if (branches.length === 0) {
    return (
      <EmptyState
        title="Chưa có chi"
        description="Chi chỉ tạo được sau khi đã có ít nhất một dòng họ."
        actions={
          <ActionLink href="/admin/genealogy/clans">
            Kiểm tra dòng họ
          </ActionLink>
        }
      />
    );
  }

  return (
    <div className="grid gap-4">
      {branches.map((branch) => (
        <SectionCard key={branch.id} className="bg-[#fff8e8]/95">
          <div>
            <p className="text-sm font-semibold text-[#7a2f24]">Chi nhánh</p>
            <h3 className="mt-1 text-xl font-bold text-stone-950">
              {branch.branch_name}
            </h3>
            <p className="mt-1 text-sm text-stone-600">
              {branch.branch_code} / {clanName(clans, branch.clan_id)} / Cấp{" "}
              {branch.branch_level}
            </p>
          </div>
          <div className="mt-5 border-t border-amber-900/10 pt-5">
            <BranchForm
              branch={branch}
              clans={clans}
              branches={branches}
              returnTo={returnTo}
            />
          </div>
        </SectionCard>
      ))}
    </div>
  );
}

export function GenerationRuleList({
  rules,
  clans,
  branches,
  returnTo,
}: {
  rules: GenerationRule[];
  clans: Clan[];
  branches: ClanBranch[];
  returnTo: string;
}) {
  if (rules.length === 0) {
    return (
      <EmptyState
        title="Chưa có quy tắc đời"
        description="Tạo quy tắc toàn dòng họ hoặc riêng cho từng chi để thống nhất cách nhập đời."
        actions={
          <ActionLink href="/admin/genealogy/generation-rules">
            Tạo quy tắc đời
          </ActionLink>
        }
      />
    );
  }

  return (
    <div className="grid gap-4">
      {rules.map((rule) => (
        <SectionCard key={rule.id}>
          <div>
            <h3 className="text-lg font-bold text-slate-950">
              {clanName(clans, rule.clan_id)} /{" "}
              {branchName(branches, rule.branch_id)}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Đời bắt đầu {rule.start_generation} /{" "}
              {numberingMethodLabels[rule.numbering_method]} /{" "}
              {rule.is_active ? "Đang áp dụng" : "Tạm dừng"}
            </p>
          </div>
          <div className="mt-5 border-t border-slate-100 pt-5">
            <GenerationRuleForm
              rule={rule}
              clans={clans}
              branches={branches}
              returnTo={returnTo}
            />
          </div>
        </SectionCard>
      ))}
    </div>
  );
}

export function MembershipList({
  memberships,
  clans,
  branches,
  generationRules,
  people,
  returnTo,
}: LineageSelectData & {
  memberships: PersonBranchMembership[];
  people: Person[];
  returnTo: string;
}) {
  if (memberships.length === 0) {
    return (
      <EmptyState
        title="Chưa gán thành viên"
        description="Gán thành viên vào dòng họ/chi bằng thao tác rõ ràng; hệ thống không tự backfill từ trường legacy."
        actions={
          <ActionLink href="/admin/people">Mở danh sách thành viên</ActionLink>
        }
      />
    );
  }

  return (
    <div className="grid gap-4">
      {memberships.map((membership) => (
        <SectionCard key={membership.id}>
          <div>
            <h3 className="text-lg font-bold text-slate-950">
              {personName(people, membership.person_id)}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              {clanName(clans, membership.clan_id)} /{" "}
              {branchName(branches, membership.branch_id)} /{" "}
              {membershipTypeLabels[membership.membership_type]}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <ActionLink href={`/admin/people/${membership.person_id}`}>
              Mở hồ sơ thành viên
            </ActionLink>
            <ActionLink href="/admin/tree">Xem trên cây</ActionLink>
          </div>
          <div className="mt-5 border-t border-slate-100 pt-5">
            <MembershipForm
              membership={membership}
              clans={clans}
              branches={branches}
              generationRules={generationRules}
              people={people}
              returnTo={returnTo}
            />
          </div>
        </SectionCard>
      ))}
    </div>
  );
}

export function MembershipSummary({
  memberships,
  clans,
  branches,
}: {
  memberships: PersonBranchMembership[];
  clans: Clan[];
  branches: ClanBranch[];
}) {
  if (memberships.length === 0) {
    return (
      <EmptyState
        title="Chưa có gắn dòng họ/chi"
        description="Thành viên này chưa được gán vào dòng họ hoặc chi. Hãy gán thủ công khi đã có dữ liệu xác minh."
      />
    );
  }

  return (
    <div className="grid gap-3">
      {memberships.map((membership) => (
        <div
          key={membership.id}
          className="border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
        >
          <div className="font-bold text-slate-950">
            {clanName(clans, membership.clan_id)} /{" "}
            {branchName(branches, membership.branch_id)}
          </div>
          <div className="mt-1">
            {membershipTypeLabels[membership.membership_type]} /{" "}
            {membership.is_primary ? "Gắn chính" : "Gắn phụ"} /{" "}
            {visibilityLabels[membership.visibility]}
          </div>
          {membership.generation_number ? (
            <div className="mt-1">Đời {membership.generation_number}</div>
          ) : null}
          {membership.source_note ? (
            <div className="mt-2 text-slate-600">{membership.source_note}</div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
