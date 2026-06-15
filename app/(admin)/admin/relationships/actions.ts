"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  addChildToFamily,
  addParentToFamily,
  createCoupleRelationship,
  createFamily,
  softDeleteCoupleRelationship,
  softDeleteFamily,
  softDeleteFamilyChild,
  softDeleteFamilyParent,
} from "@/lib/family/relationship-service";
import {
  formDataToCoupleRelationshipInput,
  formDataToFamilyChildInput,
  formDataToFamilyInput,
  formDataToFamilyParentInput,
} from "@/lib/family/relationship-validation";

function errorParam(message: string) {
  return encodeURIComponent(message);
}

function returnTo(formData: FormData) {
  return String(formData.get("return_to") ?? "/admin/relationships");
}

function redirectWithError(formData: FormData, error: string): never {
  const target = returnTo(formData);
  const separator = target.includes("?") ? "&" : "?";

  redirect(`${target}${separator}error=${errorParam(error)}`);
}

function revalidateRelationshipPaths(personId?: string | null) {
  revalidatePath("/admin/relationships");
  revalidatePath("/admin/people");

  if (personId) {
    revalidatePath(`/admin/people/${personId}`);
  }
}

export async function createFamilyAction(formData: FormData) {
  const result = await createFamily(formDataToFamilyInput(formData));

  if (!result.ok) {
    redirectWithError(formData, result.error);
  }

  revalidateRelationshipPaths();
  redirect(`/admin/relationships?saved=family_created`);
}

export async function addParentToFamilyAction(formData: FormData) {
  const result = await addParentToFamily(formDataToFamilyParentInput(formData));

  if (!result.ok) {
    redirectWithError(formData, result.error);
  }

  revalidateRelationshipPaths(String(formData.get("context_person_id") ?? ""));
  redirect(`${returnTo(formData)}?saved=parent_added`);
}

export async function addChildToFamilyAction(formData: FormData) {
  const result = await addChildToFamily(formDataToFamilyChildInput(formData));

  if (!result.ok) {
    redirectWithError(formData, result.error);
  }

  revalidateRelationshipPaths(String(formData.get("context_person_id") ?? ""));
  redirect(`${returnTo(formData)}?saved=child_added`);
}

export async function createCoupleRelationshipAction(formData: FormData) {
  const result = await createCoupleRelationship(
    formDataToCoupleRelationshipInput(formData),
  );

  if (!result.ok) {
    redirectWithError(formData, result.error);
  }

  revalidateRelationshipPaths(String(formData.get("context_person_id") ?? ""));
  redirect(`${returnTo(formData)}?saved=couple_created`);
}

export async function softDeleteFamilyAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const reason = String(formData.get("delete_reason") ?? "").trim() || null;
  const result = await softDeleteFamily(id, reason);

  if (!result.ok) {
    redirectWithError(formData, result.error);
  }

  revalidateRelationshipPaths();
  redirect("/admin/relationships?saved=family_deleted");
}

export async function softDeleteFamilyParentAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const reason = String(formData.get("delete_reason") ?? "").trim() || null;
  const result = await softDeleteFamilyParent(id, reason);

  if (!result.ok) {
    redirectWithError(formData, result.error);
  }

  revalidateRelationshipPaths(String(formData.get("context_person_id") ?? ""));
  redirect(`${returnTo(formData)}?saved=parent_deleted`);
}

export async function softDeleteFamilyChildAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const reason = String(formData.get("delete_reason") ?? "").trim() || null;
  const result = await softDeleteFamilyChild(id, reason);

  if (!result.ok) {
    redirectWithError(formData, result.error);
  }

  revalidateRelationshipPaths(String(formData.get("context_person_id") ?? ""));
  redirect(`${returnTo(formData)}?saved=child_deleted`);
}

export async function softDeleteCoupleRelationshipAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const reason = String(formData.get("delete_reason") ?? "").trim() || null;
  const result = await softDeleteCoupleRelationship(id, reason);

  if (!result.ok) {
    redirectWithError(formData, result.error);
  }

  revalidateRelationshipPaths(String(formData.get("context_person_id") ?? ""));
  redirect(`${returnTo(formData)}?saved=couple_deleted`);
}
