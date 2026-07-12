"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  linkExistingChildFromTree,
  linkExistingParentFromTree,
} from "@/lib/family/admin-canonical-family-runtime-service";
import { createPerson } from "@/lib/family/people-service";
import { createCoupleRelationship } from "@/lib/family/relationship-service";
import {
  resetTreeLayout,
  saveTreeNodePositions,
} from "@/lib/family/tree-layout-service";
import type { PersonGender, PersonVisibility } from "@/lib/family/people-types";
import type {
  ChildRelationshipType,
  CoupleRelationshipStatus,
  ParentRelationshipType,
  ParentRole,
} from "@/lib/family/relationship-types";
import type { TreeNodePositionInput } from "@/lib/family/tree-types";

function errorParam(message: string) {
  return encodeURIComponent(message);
}

function returnTo(formData: FormData) {
  return String(formData.get("return_to") ?? "/admin/tree/edit");
}

function redirectWithError(formData: FormData, error: string): never {
  const target = returnTo(formData);
  const separator = target.includes("?") ? "&" : "?";

  redirect(`${target}${separator}error=${errorParam(error)}`);
}

function redirectWithSaved(formData: FormData, saved: string): never {
  const target = returnTo(formData);
  const separator = target.includes("?") ? "&" : "?";

  redirect(`${target}${separator}saved=${saved}`);
}

function revalidateTreePaths() {
  revalidatePath("/admin/tree");
  revalidatePath("/admin/tree/edit");
  revalidatePath("/admin/relationships");
  revalidatePath("/admin/people");
}

function requiredText(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function optionalText(formData: FormData, name: string) {
  return requiredText(formData, name) || null;
}

function yearToDate(value: string | null) {
  if (!value) {
    return null;
  }

  return /^\d{4}$/.test(value) ? `${value}-01-01` : null;
}

function dateInputToDate(value: string | null) {
  if (!value) {
    return null;
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function optionalNumber(formData: FormData, name: string) {
  const value = optionalText(formData, name);

  if (!value) {
    return null;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) ? parsed : null;
}

function visibilityValue(value: string | null): PersonVisibility {
  if (value === "public" || value === "private" || value === "family") {
    return value;
  }

  return "family";
}

function parsePositions(formData: FormData): TreeNodePositionInput[] {
  const raw = requiredText(formData, "positions_json");

  if (!raw) {
    return [];
  }

  const parsed = JSON.parse(raw) as TreeNodePositionInput[];

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.filter((position) => {
    return (
      typeof position.node_id === "string" &&
      (position.node_kind === "person" || position.node_kind === "family")
    );
  });
}

export async function saveTreeLayoutAction(formData: FormData) {
  try {
    const result = await saveTreeNodePositions(parsePositions(formData));

    if (!result.ok) {
      redirectWithError(formData, result.error);
    }
  } catch {
    redirectWithError(formData, "Dữ liệu vị trí layout không hợp lệ.");
  }

  revalidateTreePaths();
  redirectWithSaved(formData, "layout_saved");
}

export async function resetTreeLayoutAction(formData: FormData) {
  const result = await resetTreeLayout();

  if (!result.ok) {
    redirectWithError(formData, result.error);
  }

  revalidateTreePaths();
  redirectWithSaved(formData, "layout_reset");
}

export async function addParentFromTreeAction(formData: FormData) {
  const childId = requiredText(formData, "selected_person_id");
  const parentId = requiredText(formData, "related_person_id");
  const parentRole = (requiredText(formData, "parent_role") ||
    "parent") as ParentRole;
  const relationshipType = (requiredText(formData, "relationship_type") ||
    "unknown") as ParentRelationshipType;
  const result = await linkExistingParentFromTree({
    childId,
    parentId,
    parentRole,
    relationshipType,
  });

  if (!result.ok) {
    redirectWithError(formData, result.message);
  }

  revalidateTreePaths();
  redirectWithSaved(formData, "parent_added");
}

export async function addChildFromTreeAction(formData: FormData) {
  const parentId = requiredText(formData, "selected_person_id");
  const childId = requiredText(formData, "related_person_id");
  const childRelationshipType = (requiredText(
    formData,
    "child_relationship_type",
  ) || "biological") as ChildRelationshipType;
  const result = await linkExistingChildFromTree({
    parentId,
    childId,
    childRelationshipType,
    explicitFamilyId: optionalText(formData, "family_id"),
  });

  if (!result.ok) {
    redirectWithError(formData, result.message);
  }

  revalidateTreePaths();
  redirectWithSaved(formData, "child_added");
}

export async function addSpouseFromTreeAction(formData: FormData) {
  const selectedId = requiredText(formData, "selected_person_id");
  const relatedId = requiredText(formData, "related_person_id");
  const relationshipStatus = (requiredText(formData, "relationship_status") ||
    "married") as CoupleRelationshipStatus;
  const notes = requiredText(formData, "notes") || null;
  const result = await createCoupleRelationship({
    person1_id: selectedId,
    person2_id: relatedId,
    relationship_status: relationshipStatus,
    visibility: "family",
    notes,
  });

  if (!result.ok) {
    redirectWithError(formData, result.error);
  }

  revalidateTreePaths();
  redirectWithSaved(formData, "spouse_added");
}

export async function createPersonAndAttachFromTreeAction(formData: FormData) {
  const selectedId = requiredText(formData, "selected_person_id");
  const relationKind = requiredText(formData, "relation_kind");
  const formMode = requiredText(formData, "form_mode");

  if (
    relationKind === "father" ||
    relationKind === "mother" ||
    relationKind === "child"
  ) {
    redirectWithError(
      formData,
      "Chưa thể tạo thành viên mới kèm quan hệ trong cùng một giao dịch an toàn.",
    );
  }

  if (relationKind !== "spouse") {
    redirectWithError(formData, "Loại quan hệ không hợp lệ.");
  }

  const birthDateInput = dateInputToDate(optionalText(formData, "birth_date"));
  const deathDateInput = dateInputToDate(optionalText(formData, "death_date"));
  const birthDate = birthDateInput ?? yearToDate(optionalText(formData, "birth_year"));
  const deathDate = deathDateInput ?? yearToDate(optionalText(formData, "death_year"));
  const isLivingInput = formData.get("is_living");
  const person = await createPerson({
    full_name: requiredText(formData, "full_name"),
    display_name: optionalText(formData, "display_name"),
    gender: (optionalText(formData, "gender") ?? "unknown") as PersonGender,
    birth_date: birthDate,
    birth_date_precision: birthDateInput ? "exact" : birthDate ? "year" : "unknown",
    death_date: deathDate,
    death_date_precision: deathDateInput ? "exact" : deathDate ? "year" : "unknown",
    is_living: deathDate ? false : formMode === "detail" ? isLivingInput === "on" : true,
    birth_place: optionalText(formData, "birth_place"),
    home_town: optionalText(formData, "home_town"),
    branch_name: optionalText(formData, "branch_name"),
    generation_number: optionalNumber(formData, "generation_number"),
    short_bio: optionalText(formData, "short_bio"),
    notes_private: optionalText(formData, "notes_private"),
    visibility: visibilityValue(optionalText(formData, "visibility")),
  });

  if (!person.ok) {
    redirectWithError(formData, person.error);
  }

  const newPersonId = person.data.id;
  const notes = "Tạo nhanh từ Cây gia phả";
  const spouse = await createCoupleRelationship({
    person1_id: selectedId,
    person2_id: newPersonId,
    relationship_status: "married",
    visibility: "family",
    notes,
  });

  if (!spouse.ok) {
    redirectWithError(
      formData,
      `Đã tạo thành viên mới nhưng chưa gắn được quan hệ: ${spouse.error}`,
    );
  }

  revalidateTreePaths();
  redirectWithSaved(formData, "inline_person_created");
}
