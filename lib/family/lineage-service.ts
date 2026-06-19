import "server-only";

import type { PermissionCode } from "@/lib/permissions/permission-types";
import { getPermissionContext } from "@/lib/permissions/permission-service";
import { maybeCreateAdminSupabaseClient } from "@/lib/supabase/admin";
import { logRevision, type RevisionAction } from "@/lib/family/revision-service";
import {
  validateClanBranchInput,
  validateClanInput,
  validateGenerationRuleInput,
  validatePersonBranchMembershipInput,
} from "@/lib/family/lineage-validation";
import type {
  Clan,
  ClanBranch,
  CreateClanBranchInput,
  CreateClanInput,
  CreateGenerationRuleInput,
  CreatePersonBranchMembershipInput,
  GenerationRule,
  LineageDashboard,
  LineageServiceResult,
  PersonBranchMembership,
  PublicLineageMembership,
  UpdateClanBranchInput,
  UpdateClanInput,
  UpdateGenerationRuleInput,
  UpdatePersonBranchMembershipInput,
} from "@/lib/family/lineage-types";

const READ_PERMISSIONS: PermissionCode[] = ["people.view", "tree.view"];
const MANAGE_PERMISSIONS: PermissionCode[] = [
  "people.update",
  "relationships.update",
  "tree.edit_layout",
  "settings.manage",
];

const CLAN_SELECT = `
  id,
  clan_code,
  clan_name,
  family_name,
  origin_place,
  founder_person_id,
  current_head_person_id,
  description,
  visibility,
  created_at,
  created_by,
  updated_at,
  updated_by,
  deleted_at,
  deleted_by,
  delete_reason
`;

const BRANCH_SELECT = `
  id,
  clan_id,
  parent_branch_id,
  branch_code,
  branch_name,
  branch_level,
  sort_order,
  founder_person_id,
  head_person_id,
  representative_person_id,
  description,
  visibility,
  created_at,
  created_by,
  updated_at,
  updated_by,
  deleted_at,
  deleted_by,
  delete_reason
`;

const GENERATION_RULE_SELECT = `
  id,
  clan_id,
  branch_id,
  root_person_id,
  start_generation,
  numbering_method,
  adopted_child_policy,
  step_child_policy,
  spouse_display_policy,
  notes,
  is_active,
  created_at,
  created_by,
  updated_at,
  updated_by,
  deleted_at,
  deleted_by,
  delete_reason
`;

const MEMBERSHIP_SELECT = `
  id,
  person_id,
  clan_id,
  branch_id,
  generation_rule_id,
  generation_number,
  generation_override_reason,
  membership_type,
  is_primary,
  sort_order,
  source_note,
  visibility,
  created_at,
  created_by,
  updated_at,
  updated_by,
  deleted_at,
  deleted_by,
  delete_reason
`;

function errorResult<T>(error: string, reason?: string): LineageServiceResult<T> {
  return {
    ok: false,
    error,
    reason,
  };
}

async function requireAnyLineagePermission(permissions: PermissionCode[]) {
  const context = await getPermissionContext();

  if (!context.user) {
    return {
      ok: false as const,
      error:
        context.reason === "missing_supabase_config"
          ? "Supabase is not configured."
          : "You need to sign in.",
      reason: context.reason ?? "anonymous",
      context,
    };
  }

  const allowed = permissions.some((permission) =>
    context.permissions.includes(permission),
  );

  if (!allowed) {
    return {
      ok: false as const,
      error: `Missing one of: ${permissions.join(", ")}.`,
      reason: context.reason ?? `missing_${permissions.join("_or_")}`,
      context,
    };
  }

  return {
    ok: true as const,
    context,
  };
}

function profileId(permission: Awaited<ReturnType<typeof requireAnyLineagePermission>>) {
  return permission.ok ? permission.context.profile?.id ?? null : null;
}

async function logLineageRevision(params: {
  entityType: string;
  entityId: string;
  action: RevisionAction;
  before: unknown | null;
  after: unknown | null;
  changedBy: string | null;
  reason?: string | null;
}) {
  await logRevision({
    entityType: params.entityType,
    entityId: params.entityId,
    action: params.action,
    before: params.before,
    after: params.after,
    changedBy: params.changedBy,
    reason: params.reason,
  });
}

async function getActiveClan(id: string) {
  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult<Clan>("Supabase is not configured.", "missing_admin_config");
  }

  const { data, error } = await supabase
    .from("clans")
    .select(CLAN_SELECT)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle<Clan>();

  if (error) return errorResult<Clan>(error.message, "clan_get_failed");
  if (!data) return errorResult<Clan>("Clan not found.", "clan_not_found");

  return { ok: true as const, data };
}

async function getActiveBranch(id: string) {
  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult<ClanBranch>(
      "Supabase is not configured.",
      "missing_admin_config",
    );
  }

  const { data, error } = await supabase
    .from("clan_branches")
    .select(BRANCH_SELECT)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle<ClanBranch>();

  if (error) return errorResult<ClanBranch>(error.message, "branch_get_failed");
  if (!data) {
    return errorResult<ClanBranch>("Branch not found.", "branch_not_found");
  }

  return { ok: true as const, data };
}

async function getActiveGenerationRule(id: string) {
  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult<GenerationRule>(
      "Supabase is not configured.",
      "missing_admin_config",
    );
  }

  const { data, error } = await supabase
    .from("generation_rules")
    .select(GENERATION_RULE_SELECT)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle<GenerationRule>();

  if (error) {
    return errorResult<GenerationRule>(error.message, "generation_rule_get_failed");
  }
  if (!data) {
    return errorResult<GenerationRule>(
      "Generation rule not found.",
      "generation_rule_not_found",
    );
  }

  return { ok: true as const, data };
}

async function getActiveMembership(id: string) {
  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult<PersonBranchMembership>(
      "Supabase is not configured.",
      "missing_admin_config",
    );
  }

  const { data, error } = await supabase
    .from("person_branch_memberships")
    .select(MEMBERSHIP_SELECT)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle<PersonBranchMembership>();

  if (error) {
    return errorResult<PersonBranchMembership>(
      error.message,
      "membership_get_failed",
    );
  }
  if (!data) {
    return errorResult<PersonBranchMembership>(
      "Membership not found.",
      "membership_not_found",
    );
  }

  return { ok: true as const, data };
}

export async function listClans(): Promise<LineageServiceResult<Clan[]>> {
  const permission = await requireAnyLineagePermission(READ_PERMISSIONS);

  if (!permission.ok) return errorResult(permission.error, permission.reason);

  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult("Supabase is not configured.", "missing_admin_config");
  }

  const { data, error } = await supabase
    .from("clans")
    .select(CLAN_SELECT)
    .is("deleted_at", null)
    .order("clan_name", { ascending: true })
    .returns<Clan[]>();

  if (error) return errorResult(error.message, "clan_list_failed");

  return { ok: true, data: data ?? [] };
}

export async function listClanBranches(
  clanId?: string,
): Promise<LineageServiceResult<ClanBranch[]>> {
  const permission = await requireAnyLineagePermission(READ_PERMISSIONS);

  if (!permission.ok) return errorResult(permission.error, permission.reason);

  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult("Supabase is not configured.", "missing_admin_config");
  }

  let query = supabase
    .from("clan_branches")
    .select(BRANCH_SELECT)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })
    .order("branch_name", { ascending: true });

  if (clanId) {
    query = query.eq("clan_id", clanId);
  }

  const { data, error } = await query.returns<ClanBranch[]>();

  if (error) return errorResult(error.message, "branch_list_failed");

  return { ok: true, data: data ?? [] };
}

export async function listGenerationRules(
  clanId?: string,
): Promise<LineageServiceResult<GenerationRule[]>> {
  const permission = await requireAnyLineagePermission(READ_PERMISSIONS);

  if (!permission.ok) return errorResult(permission.error, permission.reason);

  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult("Supabase is not configured.", "missing_admin_config");
  }

  let query = supabase
    .from("generation_rules")
    .select(GENERATION_RULE_SELECT)
    .is("deleted_at", null)
    .order("start_generation", { ascending: true })
    .order("updated_at", { ascending: false });

  if (clanId) {
    query = query.eq("clan_id", clanId);
  }

  const { data, error } = await query.returns<GenerationRule[]>();

  if (error) return errorResult(error.message, "generation_rule_list_failed");

  return { ok: true, data: data ?? [] };
}

export async function listPersonBranchMemberships(
  personId?: string,
): Promise<LineageServiceResult<PersonBranchMembership[]>> {
  const permission = await requireAnyLineagePermission(READ_PERMISSIONS);

  if (!permission.ok) return errorResult(permission.error, permission.reason);

  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult("Supabase is not configured.", "missing_admin_config");
  }

  let query = supabase
    .from("person_branch_memberships")
    .select(MEMBERSHIP_SELECT)
    .is("deleted_at", null)
    .order("is_primary", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });

  if (personId) {
    query = query.eq("person_id", personId);
  }

  const { data, error } = await query.returns<PersonBranchMembership[]>();

  if (error) return errorResult(error.message, "membership_list_failed");

  return { ok: true, data: data ?? [] };
}

export async function getLineageDashboard(): Promise<
  LineageServiceResult<LineageDashboard>
> {
  const [clans, branches, generationRules, memberships] = await Promise.all([
    listClans(),
    listClanBranches(),
    listGenerationRules(),
    listPersonBranchMemberships(),
  ]);

  const firstError = [clans, branches, generationRules, memberships].find(
    (result) => !result.ok,
  );

  if (firstError && !firstError.ok) {
    return errorResult(firstError.error, firstError.reason);
  }

  return {
    ok: true,
    data: {
      clans: clans.ok ? clans.data : [],
      branches: branches.ok ? branches.data : [],
      generationRules: generationRules.ok ? generationRules.data : [],
      memberships: memberships.ok ? memberships.data : [],
    },
  };
}

export async function createClan(
  input: CreateClanInput,
): Promise<LineageServiceResult<Clan>> {
  const permission = await requireAnyLineagePermission(MANAGE_PERMISSIONS);

  if (!permission.ok) return errorResult(permission.error, permission.reason);

  const validated = validateClanInput(input);

  if (!validated.ok) {
    return errorResult(validated.errors.join(" "), "validation_failed");
  }

  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult("Supabase is not configured.", "missing_admin_config");
  }

  const actor = profileId(permission);
  const { data, error } = await supabase
    .from("clans")
    .insert({
      ...validated.data,
      created_by: actor,
      updated_by: actor,
    })
    .select(CLAN_SELECT)
    .single<Clan>();

  if (error || !data) {
    return errorResult(error?.message ?? "Could not create clan.", "clan_create_failed");
  }

  await logLineageRevision({
    entityType: "clans",
    entityId: data.id,
    action: "create",
    before: null,
    after: data,
    changedBy: actor,
  });

  return { ok: true, data };
}

export async function updateClan(
  input: UpdateClanInput,
): Promise<LineageServiceResult<Clan>> {
  const permission = await requireAnyLineagePermission(MANAGE_PERMISSIONS);

  if (!permission.ok) return errorResult(permission.error, permission.reason);

  const existing = await getActiveClan(input.id);

  if (!existing.ok) return existing;

  const validated = validateClanInput({
    ...existing.data,
    ...input,
    clan_code: input.clan_code ?? existing.data.clan_code,
    clan_name: input.clan_name ?? existing.data.clan_name,
  });

  if (!validated.ok) {
    return errorResult(validated.errors.join(" "), "validation_failed");
  }

  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult("Supabase is not configured.", "missing_admin_config");
  }

  const actor = profileId(permission);
  const { data, error } = await supabase
    .from("clans")
    .update({
      ...validated.data,
      updated_by: actor,
    })
    .eq("id", input.id)
    .select(CLAN_SELECT)
    .single<Clan>();

  if (error || !data) {
    return errorResult(error?.message ?? "Could not update clan.", "clan_update_failed");
  }

  await logLineageRevision({
    entityType: "clans",
    entityId: data.id,
    action: "update",
    before: existing.data,
    after: data,
    changedBy: actor,
  });

  return { ok: true, data };
}

export async function createClanBranch(
  input: CreateClanBranchInput,
): Promise<LineageServiceResult<ClanBranch>> {
  const permission = await requireAnyLineagePermission(MANAGE_PERMISSIONS);

  if (!permission.ok) return errorResult(permission.error, permission.reason);

  const validated = validateClanBranchInput(input);

  if (!validated.ok) {
    return errorResult(validated.errors.join(" "), "validation_failed");
  }

  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult("Supabase is not configured.", "missing_admin_config");
  }

  const actor = profileId(permission);
  const { data, error } = await supabase
    .from("clan_branches")
    .insert({
      ...validated.data,
      created_by: actor,
      updated_by: actor,
    })
    .select(BRANCH_SELECT)
    .single<ClanBranch>();

  if (error || !data) {
    return errorResult(
      error?.message ?? "Could not create branch.",
      "branch_create_failed",
    );
  }

  await logLineageRevision({
    entityType: "clan_branches",
    entityId: data.id,
    action: "create",
    before: null,
    after: data,
    changedBy: actor,
  });

  return { ok: true, data };
}

export async function updateClanBranch(
  input: UpdateClanBranchInput,
): Promise<LineageServiceResult<ClanBranch>> {
  const permission = await requireAnyLineagePermission(MANAGE_PERMISSIONS);

  if (!permission.ok) return errorResult(permission.error, permission.reason);

  const existing = await getActiveBranch(input.id);

  if (!existing.ok) return existing;

  const validated = validateClanBranchInput({
    ...existing.data,
    ...input,
    clan_id: input.clan_id ?? existing.data.clan_id,
    branch_code: input.branch_code ?? existing.data.branch_code,
    branch_name: input.branch_name ?? existing.data.branch_name,
  });

  if (!validated.ok) {
    return errorResult(validated.errors.join(" "), "validation_failed");
  }

  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult("Supabase is not configured.", "missing_admin_config");
  }

  const actor = profileId(permission);
  const { data, error } = await supabase
    .from("clan_branches")
    .update({
      ...validated.data,
      updated_by: actor,
    })
    .eq("id", input.id)
    .select(BRANCH_SELECT)
    .single<ClanBranch>();

  if (error || !data) {
    return errorResult(
      error?.message ?? "Could not update branch.",
      "branch_update_failed",
    );
  }

  await logLineageRevision({
    entityType: "clan_branches",
    entityId: data.id,
    action: "update",
    before: existing.data,
    after: data,
    changedBy: actor,
  });

  return { ok: true, data };
}

export async function createGenerationRule(
  input: CreateGenerationRuleInput,
): Promise<LineageServiceResult<GenerationRule>> {
  const permission = await requireAnyLineagePermission(MANAGE_PERMISSIONS);

  if (!permission.ok) return errorResult(permission.error, permission.reason);

  const validated = validateGenerationRuleInput(input);

  if (!validated.ok) {
    return errorResult(validated.errors.join(" "), "validation_failed");
  }

  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult("Supabase is not configured.", "missing_admin_config");
  }

  const actor = profileId(permission);
  const { data, error } = await supabase
    .from("generation_rules")
    .insert({
      ...validated.data,
      created_by: actor,
      updated_by: actor,
    })
    .select(GENERATION_RULE_SELECT)
    .single<GenerationRule>();

  if (error || !data) {
    return errorResult(
      error?.message ?? "Could not create generation rule.",
      "generation_rule_create_failed",
    );
  }

  await logLineageRevision({
    entityType: "generation_rules",
    entityId: data.id,
    action: "create",
    before: null,
    after: data,
    changedBy: actor,
  });

  return { ok: true, data };
}

export async function updateGenerationRule(
  input: UpdateGenerationRuleInput,
): Promise<LineageServiceResult<GenerationRule>> {
  const permission = await requireAnyLineagePermission(MANAGE_PERMISSIONS);

  if (!permission.ok) return errorResult(permission.error, permission.reason);

  const existing = await getActiveGenerationRule(input.id);

  if (!existing.ok) return existing;

  const validated = validateGenerationRuleInput({
    ...existing.data,
    ...input,
    clan_id: input.clan_id ?? existing.data.clan_id,
  });

  if (!validated.ok) {
    return errorResult(validated.errors.join(" "), "validation_failed");
  }

  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult("Supabase is not configured.", "missing_admin_config");
  }

  const actor = profileId(permission);
  const { data, error } = await supabase
    .from("generation_rules")
    .update({
      ...validated.data,
      updated_by: actor,
    })
    .eq("id", input.id)
    .select(GENERATION_RULE_SELECT)
    .single<GenerationRule>();

  if (error || !data) {
    return errorResult(
      error?.message ?? "Could not update generation rule.",
      "generation_rule_update_failed",
    );
  }

  await logLineageRevision({
    entityType: "generation_rules",
    entityId: data.id,
    action: "update",
    before: existing.data,
    after: data,
    changedBy: actor,
  });

  return { ok: true, data };
}

export async function createPersonBranchMembership(
  input: CreatePersonBranchMembershipInput,
): Promise<LineageServiceResult<PersonBranchMembership>> {
  const permission = await requireAnyLineagePermission(MANAGE_PERMISSIONS);

  if (!permission.ok) return errorResult(permission.error, permission.reason);

  const validated = validatePersonBranchMembershipInput(input);

  if (!validated.ok) {
    return errorResult(validated.errors.join(" "), "validation_failed");
  }

  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult("Supabase is not configured.", "missing_admin_config");
  }

  const actor = profileId(permission);
  const { data, error } = await supabase
    .from("person_branch_memberships")
    .insert({
      ...validated.data,
      created_by: actor,
      updated_by: actor,
    })
    .select(MEMBERSHIP_SELECT)
    .single<PersonBranchMembership>();

  if (error || !data) {
    return errorResult(
      error?.message ?? "Could not create membership.",
      "membership_create_failed",
    );
  }

  await logLineageRevision({
    entityType: "person_branch_memberships",
    entityId: data.id,
    action: "create",
    before: null,
    after: data,
    changedBy: actor,
  });

  return { ok: true, data };
}

export async function updatePersonBranchMembership(
  input: UpdatePersonBranchMembershipInput,
): Promise<LineageServiceResult<PersonBranchMembership>> {
  const permission = await requireAnyLineagePermission(MANAGE_PERMISSIONS);

  if (!permission.ok) return errorResult(permission.error, permission.reason);

  const existing = await getActiveMembership(input.id);

  if (!existing.ok) return existing;

  const validated = validatePersonBranchMembershipInput({
    ...existing.data,
    ...input,
    person_id: input.person_id ?? existing.data.person_id,
    clan_id: input.clan_id ?? existing.data.clan_id,
  });

  if (!validated.ok) {
    return errorResult(validated.errors.join(" "), "validation_failed");
  }

  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult("Supabase is not configured.", "missing_admin_config");
  }

  const actor = profileId(permission);
  const { data, error } = await supabase
    .from("person_branch_memberships")
    .update({
      ...validated.data,
      updated_by: actor,
    })
    .eq("id", input.id)
    .select(MEMBERSHIP_SELECT)
    .single<PersonBranchMembership>();

  if (error || !data) {
    return errorResult(
      error?.message ?? "Could not update membership.",
      "membership_update_failed",
    );
  }

  await logLineageRevision({
    entityType: "person_branch_memberships",
    entityId: data.id,
    action: "update",
    before: existing.data,
    after: data,
    changedBy: actor,
  });

  return { ok: true, data };
}

export async function listPublicLineageMembershipsForPeople(
  personIds: string[],
): Promise<LineageServiceResult<Record<string, PublicLineageMembership>>> {
  const uniqueIds = [...new Set(personIds)].filter(Boolean);

  if (uniqueIds.length === 0) {
    return { ok: true, data: {} };
  }

  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult("Supabase is not configured.", "missing_admin_config");
  }

  const [memberships, clans, branches] = await Promise.all([
    supabase
      .from("person_branch_memberships")
      .select(MEMBERSHIP_SELECT)
      .in("person_id", uniqueIds)
      .eq("visibility", "public")
      .eq("is_primary", true)
      .is("deleted_at", null)
      .returns<PersonBranchMembership[]>(),
    supabase
      .from("clans")
      .select(CLAN_SELECT)
      .eq("visibility", "public")
      .is("deleted_at", null)
      .returns<Clan[]>(),
    supabase
      .from("clan_branches")
      .select(BRANCH_SELECT)
      .eq("visibility", "public")
      .is("deleted_at", null)
      .returns<ClanBranch[]>(),
  ]);

  const firstError = memberships.error ?? clans.error ?? branches.error;

  if (firstError) {
    return errorResult(firstError.message, "public_lineage_query_failed");
  }

  const clanMap = new Map((clans.data ?? []).map((clan) => [clan.id, clan]));
  const branchMap = new Map(
    (branches.data ?? []).map((branch) => [branch.id, branch]),
  );
  const byPerson: Record<string, PublicLineageMembership> = {};

  for (const membership of memberships.data ?? []) {
    const clan = clanMap.get(membership.clan_id);
    const branch = membership.branch_id
      ? branchMap.get(membership.branch_id)
      : null;

    if (!clan) continue;
    if (membership.branch_id && !branch) continue;

    byPerson[membership.person_id] = {
      branch_name: branch?.branch_name ?? null,
      clan_name: clan.clan_name,
      generation_number: membership.generation_number,
      membership_type: membership.membership_type,
    };
  }

  return {
    ok: true,
    data: byPerson,
  };
}
