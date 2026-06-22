"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  addChildToFamily,
  addParentToFamily,
  createCoupleRelationship,
  createFamily,
} from "@/lib/family/relationship-service";
import { createPerson } from "@/lib/family/people-service";
import {
  resetTreeLayout,
  saveTreeNodePositions,
} from "@/lib/family/tree-layout-service";
import type { PersonGender } from "@/lib/family/people-types";
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

async function createTreeFamily(label: string, notes: string | null) {
  return createFamily({
    family_label: label,
    visibility: "family",
    notes,
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
  const notes = requiredText(formData, "notes") || null;
  const family = await createTreeFamily("Family created from tree editor", notes);

  if (!family.ok) {
    redirectWithError(formData, family.error);
  }

  const parent = await addParentToFamily({
    family_id: family.data.id,
    person_id: parentId,
    parent_role: parentRole,
    relationship_type: relationshipType,
    notes,
  });

  if (!parent.ok) {
    redirectWithError(formData, parent.error);
  }

  const child = await addChildToFamily({
    family_id: family.data.id,
    person_id: childId,
    child_relationship_type: "biological",
    notes,
  });

  if (!child.ok) {
    redirectWithError(formData, child.error);
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
  const notes = requiredText(formData, "notes") || null;
  const family = await createTreeFamily("Family created from tree editor", notes);

  if (!family.ok) {
    redirectWithError(formData, family.error);
  }

  const parent = await addParentToFamily({
    family_id: family.data.id,
    person_id: parentId,
    parent_role: "parent",
    relationship_type: "unknown",
    notes,
  });

  if (!parent.ok) {
    redirectWithError(formData, parent.error);
  }

  const child = await addChildToFamily({
    family_id: family.data.id,
    person_id: childId,
    child_relationship_type: childRelationshipType,
    notes,
  });

  if (!child.ok) {
    redirectWithError(formData, child.error);
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
  const birthDate = yearToDate(optionalText(formData, "birth_year"));
  const deathDate = yearToDate(optionalText(formData, "death_year"));
  const person = await createPerson({
    full_name: requiredText(formData, "full_name"),
    gender: (optionalText(formData, "gender") ?? "unknown") as PersonGender,
    birth_date: birthDate,
    birth_date_precision: birthDate ? "year" : "unknown",
    death_date: deathDate,
    death_date_precision: deathDate ? "year" : "unknown",
    is_living: !deathDate,
    short_bio: optionalText(formData, "short_bio"),
    visibility: "family",
  });

  if (!person.ok) {
    redirectWithError(formData, person.error);
  }

  const newPersonId = person.data.id;
  const notes = "Tạo nhanh từ Cây gia phả";

  if (relationKind === "father" || relationKind === "mother") {
    const family = await createTreeFamily("Family created from tree editor", notes);

    if (!family.ok) {
      redirectWithError(
        formData,
        `Đã tạo thành viên mới nhưng chưa gắn được quan hệ: ${family.error}`,
      );
    }

    const parent = await addParentToFamily({
      family_id: family.data.id,
      person_id: newPersonId,
      parent_role: relationKind,
      relationship_type: "biological",
      notes,
    });

    if (!parent.ok) {
      redirectWithError(
        formData,
        `Đã tạo thành viên mới nhưng chưa gắn được quan hệ: ${parent.error}`,
      );
    }

    const child = await addChildToFamily({
      family_id: family.data.id,
      person_id: selectedId,
      child_relationship_type: "biological",
      notes,
    });

    if (!child.ok) {
      redirectWithError(
        formData,
        `Đã tạo thành viên mới nhưng chưa gắn được quan hệ: ${child.error}`,
      );
    }
  } else if (relationKind === "child") {
    const family = await createTreeFamily("Family created from tree editor", notes);

    if (!family.ok) {
      redirectWithError(
        formData,
        `Đã tạo thành viên mới nhưng chưa gắn được quan hệ: ${family.error}`,
      );
    }

    const parent = await addParentToFamily({
      family_id: family.data.id,
      person_id: selectedId,
      parent_role: "parent",
      relationship_type: "unknown",
      notes,
    });

    if (!parent.ok) {
      redirectWithError(
        formData,
        `Đã tạo thành viên mới nhưng chưa gắn được quan hệ: ${parent.error}`,
      );
    }

    const child = await addChildToFamily({
      family_id: family.data.id,
      person_id: newPersonId,
      child_relationship_type: "biological",
      notes,
    });

    if (!child.ok) {
      redirectWithError(
        formData,
        `Đã tạo thành viên mới nhưng chưa gắn được quan hệ: ${child.error}`,
      );
    }
  } else if (relationKind === "spouse") {
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
  } else {
    redirectWithError(formData, "Loại quan hệ không hợp lệ.");
  }

  revalidateTreePaths();
  redirectWithSaved(formData, "inline_person_created");
}
