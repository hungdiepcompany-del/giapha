import type {
  ClanBranch,
  GenerationRule,
  LineageDashboard,
  PersonBranchMembership,
} from "@/lib/family/lineage-types";
import type { Person } from "@/lib/family/people-types";
import type { TreePersonNode } from "@/lib/family/tree-types";
import type { InlineAdminWarning } from "@/lib/family/inline-warning-types";

function warning(
  code: string,
  severity: InlineAdminWarning["severity"],
  title: string,
  message: string,
  action: string,
): InlineAdminWarning {
  return { code, severity, title, message, action };
}

function compareDateOrder(birthDate: string | null, deathDate: string | null) {
  return Boolean(birthDate && deathDate && birthDate > deathDate);
}

function membershipConflictCount(
  memberships: PersonBranchMembership[],
  branches: ClanBranch[],
  generationRules: GenerationRule[],
) {
  const branchById = new Map(branches.map((branch) => [branch.id, branch]));
  const ruleById = new Map(generationRules.map((rule) => [rule.id, rule]));
  let conflicts = 0;

  for (const membership of memberships) {
    const branch = membership.branch_id
      ? branchById.get(membership.branch_id)
      : null;
    const rule = membership.generation_rule_id
      ? ruleById.get(membership.generation_rule_id)
      : null;

    if (branch && branch.clan_id !== membership.clan_id) {
      conflicts += 1;
      continue;
    }

    if (
      rule &&
      (rule.clan_id !== membership.clan_id ||
        (rule.branch_id && rule.branch_id !== membership.branch_id))
    ) {
      conflicts += 1;
    }
  }

  return conflicts;
}

function multiplePrimaryPersonCount(memberships: PersonBranchMembership[]) {
  const primaryCounts = new Map<string, number>();

  for (const membership of memberships) {
    if (!membership.is_primary) continue;
    primaryCounts.set(
      membership.person_id,
      (primaryCounts.get(membership.person_id) ?? 0) + 1,
    );
  }

  return [...primaryCounts.values()].filter((count) => count > 1).length;
}

export function getPersonInlineWarnings({
  person,
  memberships,
  branches,
  generationRules,
}: {
  person: Person;
  memberships: PersonBranchMembership[];
  branches: ClanBranch[];
  generationRules: GenerationRule[];
}): InlineAdminWarning[] {
  const warnings: InlineAdminWarning[] = [];

  if (!person.birth_date || !person.gender || person.gender === "unknown") {
    warnings.push(
      warning(
        "PERSON_IDENTITY_INCOMPLETE",
        "info",
        "Hồ sơ còn thiếu thông tin cơ bản",
        "Ngày sinh hoặc giới tính chưa được xác định đầy đủ trong hồ sơ đang xem.",
        "Bổ sung khi gia đình có nguồn xác minh phù hợp.",
      ),
    );
  }

  if (compareDateOrder(person.birth_date, person.death_date)) {
    warnings.push(
      warning(
        "PERSON_DATE_ORDER_INVALID",
        "blocking",
        "Ngày tháng không hợp lý",
        "Ngày mất đang sớm hơn ngày sinh trong chính hồ sơ này.",
        "Kiểm tra lại hai trường ngày trước khi tiếp tục cập nhật dữ liệu liên quan.",
      ),
    );
  }

  if (person.is_living && person.visibility === "public") {
    warnings.push(
      warning(
        "PRIVACY_VISIBILITY_CONFLICT",
        "warning",
        "Hồ sơ người còn sống đang để công khai",
        "Chế độ công khai có thể làm lộ thông tin nhận diện của người còn sống.",
        "Kiểm tra lại mức hiển thị và chỉ giữ công khai khi đã được gia đình cho phép.",
      ),
    );
  }

  const primaryCount = memberships.filter((membership) => membership.is_primary).length;
  if (primaryCount > 1) {
    warnings.push(
      warning(
        "BRANCH_PRIMARY_MEMBERSHIP_MULTIPLE",
        "blocking",
        "Có nhiều gắn dòng họ/chi chính",
        "Hồ sơ đang có hơn một membership được đánh dấu là gắn chính.",
        "Chọn một membership chính; chuyển các membership còn lại thành gắn phụ.",
      ),
    );
  }

  if (
    memberships.some(
      (membership) =>
        !membership.branch_id || !membership.generation_number,
    )
  ) {
    warnings.push(
      warning(
        "LINEAGE_ASSIGNMENT_INCOMPLETE",
        "info",
        "Thông tin chi hoặc đời chưa đầy đủ",
        "Có membership chưa chọn chi hoặc chưa nhập đời trong dữ liệu đã tải.",
        "Bổ sung thủ công khi gia đình đã xác minh được thông tin.",
      ),
    );
  }

  if (membershipConflictCount(memberships, branches, generationRules) > 0) {
    warnings.push(
      warning(
        "LINEAGE_GENERATION_CONFLICT",
        "warning",
        "Gắn dòng họ/chi chưa khớp",
        "Chi hoặc quy tắc đời đã chọn không cùng phạm vi với membership hiện tại.",
        "Kiểm tra lại dòng họ, chi và quy tắc đời của membership.",
      ),
    );
  }

  return warnings;
}

export function getLineageDashboardInlineWarnings(
  dashboard: LineageDashboard,
): InlineAdminWarning[] {
  const warnings: InlineAdminWarning[] = [];
  const missingBranchCount = dashboard.memberships.filter(
    (membership) => !membership.branch_id,
  ).length;
  const missingGenerationCount = dashboard.memberships.filter(
    (membership) => !membership.generation_number,
  ).length;
  const multiplePrimaryCount = multiplePrimaryPersonCount(
    dashboard.memberships,
  );
  const conflictCount = membershipConflictCount(
    dashboard.memberships,
    dashboard.branches,
    dashboard.generationRules,
  );

  if (dashboard.memberships.length === 0) {
    warnings.push(
      warning(
        "LINEAGE_MEMBERSHIP_EMPTY",
        "info",
        "Chưa có gắn thành viên",
        "Phạm vi dữ liệu đang xem chưa có membership dòng họ/chi.",
        "Chỉ gắn thành viên khi đã có nguồn gia đình xác minh.",
      ),
    );
  }

  if (missingBranchCount > 0 || missingGenerationCount > 0) {
    warnings.push(
      warning(
        "LINEAGE_ASSIGNMENT_INCOMPLETE",
        "info",
        "Một số gắn dòng họ/chi chưa đầy đủ",
        `${missingBranchCount} membership chưa chọn chi; ${missingGenerationCount} membership chưa nhập đời.`,
        "Mở quản lý gắn thành viên và bổ sung từng trường đã được xác minh.",
      ),
    );
  }

  if (multiplePrimaryCount > 0) {
    warnings.push(
      warning(
        "BRANCH_PRIMARY_MEMBERSHIP_MULTIPLE",
        "blocking",
        "Có thành viên có nhiều gắn chính",
        `${multiplePrimaryCount} thành viên đang có nhiều hơn một membership chính.`,
        "Giữ một membership chính cho mỗi thành viên.",
      ),
    );
  }

  if (conflictCount > 0) {
    warnings.push(
      warning(
        "LINEAGE_GENERATION_CONFLICT",
        "warning",
        "Có membership chưa khớp phạm vi",
        `${conflictCount} membership có chi hoặc quy tắc đời không cùng dòng họ/chi.`,
        "Kiểm tra lại phạm vi của chi và quy tắc đời trước khi cập nhật.",
      ),
    );
  }

  return warnings;
}

export function getTreeNodeInlineWarnings(
  node: TreePersonNode,
): InlineAdminWarning[] {
  const warnings: InlineAdminWarning[] = [];

  if (!node.branchName || !node.generationNumber) {
    warnings.push(
      warning(
        "TREE_LINEAGE_DISPLAY_INCOMPLETE",
        "info",
        "Thông tin hiển thị trên cây chưa đầy đủ",
        "Nút đang chọn chưa có chi hoặc đời trong dữ liệu đã tải.",
        "Mở hồ sơ để kiểm tra và bổ sung khi có nguồn xác minh.",
      ),
    );
  }

  if (node.isLiving && node.visibility === "public") {
    warnings.push(
      warning(
        "PRIVACY_VISIBILITY_CONFLICT",
        "warning",
        "Người còn sống đang để công khai",
        "Nút đang chọn thuộc hồ sơ người còn sống có mức hiển thị công khai.",
        "Mở hồ sơ và kiểm tra lại mức hiển thị.",
      ),
    );
  }

  return warnings;
}
