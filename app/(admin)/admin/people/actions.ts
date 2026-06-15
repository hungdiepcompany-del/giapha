"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createPerson,
  restorePerson,
  softDeletePerson,
  updatePerson,
} from "@/lib/family/people-service";
import { formDataToPersonInput } from "@/lib/family/people-validation";

function errorParam(message: string) {
  return encodeURIComponent(message);
}

export async function createPersonAction(formData: FormData) {
  const result = await createPerson(formDataToPersonInput(formData));

  if (!result.ok) {
    redirect(`/admin/people/new?error=${errorParam(result.error)}`);
  }

  revalidatePath("/admin/people");
  redirect(`/admin/people/${result.data.id}?saved=created`);
}

export async function updatePersonAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const result = await updatePerson({
    id,
    ...formDataToPersonInput(formData),
  });

  if (!result.ok) {
    redirect(`/admin/people/${id}?error=${errorParam(result.error)}`);
  }

  revalidatePath("/admin/people");
  redirect(`/admin/people/${result.data.id}?saved=updated`);
}

export async function softDeletePersonAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const reason = String(formData.get("delete_reason") ?? "").trim() || null;
  const result = await softDeletePerson(id, reason);

  if (!result.ok) {
    redirect(`/admin/people/${id}?error=${errorParam(result.error)}`);
  }

  revalidatePath("/admin/people");
  redirect(`/admin/people/${id}?saved=deleted`);
}

export async function restorePersonAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const result = await restorePerson(id);

  if (!result.ok) {
    redirect(`/admin/people/${id}?error=${errorParam(result.error)}`);
  }

  revalidatePath("/admin/people");
  redirect(`/admin/people/${id}?saved=restored`);
}

