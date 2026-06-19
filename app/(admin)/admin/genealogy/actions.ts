"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createClan,
  createClanBranch,
  createGenerationRule,
  createPersonBranchMembership,
  updateClan,
  updateClanBranch,
  updateGenerationRule,
  updatePersonBranchMembership,
} from "@/lib/family/lineage-service";
import {
  formDataToClanBranchInput,
  formDataToClanInput,
  formDataToGenerationRuleInput,
  formDataToPersonBranchMembershipInput,
} from "@/lib/family/lineage-validation";

function errorParam(message: string) {
  return encodeURIComponent(message);
}

function friendlyError(message: string) {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("duplicate key") ||
    normalized.includes("unique constraint")
  ) {
    return "Mã hoặc bản ghi này đã tồn tại. Vui lòng kiểm tra lại mã dòng họ, mã chi nhánh hoặc gán thành viên hiện có.";
  }

  if (
    normalized.includes("foreign key") ||
    normalized.includes("violates foreign key")
  ) {
    return "Bản ghi liên kết không còn tồn tại hoặc chưa được chọn đúng. Vui lòng tải lại trang và chọn lại.";
  }

  if (normalized.includes("missing one of")) {
    return "Bạn chưa có quyền cập nhật thông tin dòng họ/chi.";
  }

  if (
    normalized.includes("supabase is not configured") ||
    normalized.includes("chưa cấu hình supabase")
  ) {
    return "Chưa cấu hình Supabase cho môi trường hiện tại.";
  }

  return message;
}

function returnTo(formData: FormData, fallback = "/admin/genealogy") {
  return String(formData.get("return_to") ?? fallback);
}

function redirectWithError(formData: FormData, error: string): never {
  const target = returnTo(formData);
  const separator = target.includes("?") ? "&" : "?";

  redirect(`${target}${separator}error=${errorParam(friendlyError(error))}`);
}

function redirectWithSaved(formData: FormData, saved: string): never {
  const target = returnTo(formData);
  const separator = target.includes("?") ? "&" : "?";

  redirect(`${target}${separator}saved=${encodeURIComponent(saved)}`);
}

function revalidateGenealogyPaths(personId?: string | null) {
  revalidatePath("/admin/genealogy");
  revalidatePath("/admin/genealogy/clans");
  revalidatePath("/admin/genealogy/branches");
  revalidatePath("/admin/genealogy/generation-rules");
  revalidatePath("/admin/genealogy/memberships");
  revalidatePath("/admin/tree");
  revalidatePath("/admin/tree/edit");
  revalidatePath("/tree");

  if (personId) {
    revalidatePath(`/admin/people/${personId}`);
  }
}

export async function createClanAction(formData: FormData) {
  const result = await createClan(formDataToClanInput(formData));

  if (!result.ok) {
    redirectWithError(formData, result.error);
  }

  revalidateGenealogyPaths();
  redirectWithSaved(formData, "clan_created");
}

export async function updateClanAction(formData: FormData) {
  const result = await updateClan({
    id: String(formData.get("id") ?? ""),
    ...formDataToClanInput(formData),
  });

  if (!result.ok) {
    redirectWithError(formData, result.error);
  }

  revalidateGenealogyPaths();
  redirectWithSaved(formData, "clan_updated");
}

export async function createClanBranchAction(formData: FormData) {
  const result = await createClanBranch(formDataToClanBranchInput(formData));

  if (!result.ok) {
    redirectWithError(formData, result.error);
  }

  revalidateGenealogyPaths();
  redirectWithSaved(formData, "branch_created");
}

export async function updateClanBranchAction(formData: FormData) {
  const result = await updateClanBranch({
    id: String(formData.get("id") ?? ""),
    ...formDataToClanBranchInput(formData),
  });

  if (!result.ok) {
    redirectWithError(formData, result.error);
  }

  revalidateGenealogyPaths();
  redirectWithSaved(formData, "branch_updated");
}

export async function createGenerationRuleAction(formData: FormData) {
  const result = await createGenerationRule(
    formDataToGenerationRuleInput(formData),
  );

  if (!result.ok) {
    redirectWithError(formData, result.error);
  }

  revalidateGenealogyPaths();
  redirectWithSaved(formData, "generation_rule_created");
}

export async function updateGenerationRuleAction(formData: FormData) {
  const result = await updateGenerationRule({
    id: String(formData.get("id") ?? ""),
    ...formDataToGenerationRuleInput(formData),
  });

  if (!result.ok) {
    redirectWithError(formData, result.error);
  }

  revalidateGenealogyPaths();
  redirectWithSaved(formData, "generation_rule_updated");
}

export async function createPersonBranchMembershipAction(formData: FormData) {
  const input = formDataToPersonBranchMembershipInput(formData);
  const result = await createPersonBranchMembership(input);

  if (!result.ok) {
    redirectWithError(formData, result.error);
  }

  revalidateGenealogyPaths(input.person_id);
  redirectWithSaved(formData, "membership_created");
}

export async function updatePersonBranchMembershipAction(formData: FormData) {
  const input = formDataToPersonBranchMembershipInput(formData);
  const result = await updatePersonBranchMembership({
    id: String(formData.get("id") ?? ""),
    ...input,
  });

  if (!result.ok) {
    redirectWithError(formData, result.error);
  }

  revalidateGenealogyPaths(input.person_id);
  redirectWithSaved(formData, "membership_updated");
}
