export const visibilityLabels: Record<string, string> = {
  family: "Nội bộ gia đình",
  private: "Riêng tư",
  public: "Công khai",
};

export const membershipTypeLabels: Record<string, string> = {
  adopted: "Con nuôi",
  bloodline: "Huyết thống",
  in_law: "Dâu/rể",
  spouse: "Vợ/chồng",
  step: "Con riêng/kế",
  unknown: "Chưa rõ",
};

export const numberingMethodLabels: Record<string, string> = {
  manual: "Nhập thủ công",
  root_is_one: "Gốc tính là đời 1",
  root_is_zero: "Gốc tính là đời 0",
};

export const childPolicyLabels: Record<string, string> = {
  count_as_bloodline: "Tính như huyết thống",
  display_only: "Chỉ hiển thị",
  exclude_from_generation: "Không tính đời",
  family_decision: "Theo quyết định gia đình",
};

export const stepPolicyLabels: Record<string, string> = {
  display_only: "Chỉ hiển thị",
  exclude_from_generation: "Không tính đời",
  family_decision: "Theo quyết định gia đình",
  not_bloodline_by_default: "Mặc định không tính huyết thống",
};

export const spousePolicyLabels: Record<string, string> = {
  family_decision: "Theo quyết định gia đình",
  hide_generation: "Không hiển thị đời",
  same_generation_display: "Hiển thị cùng đời",
  spouse_of_generation: "Hiển thị theo đời của vợ/chồng",
};

export const savedActionLabels: Record<string, string> = {
  branch_created: "Đã tạo chi nhánh.",
  branch_updated: "Đã cập nhật chi nhánh.",
  clan_created: "Đã tạo dòng họ.",
  clan_updated: "Đã cập nhật dòng họ.",
  generation_rule_created: "Đã tạo quy tắc đời.",
  generation_rule_updated: "Đã cập nhật quy tắc đời.",
  membership_created: "Đã gán thành viên vào dòng họ/chi.",
  membership_updated: "Đã cập nhật thông tin gán dòng họ/chi.",
};

export function lineageSavedMessage(saved?: string | null) {
  if (!saved) return "Đã lưu thay đổi.";
  return savedActionLabels[saved] ?? "Đã lưu thay đổi.";
}
