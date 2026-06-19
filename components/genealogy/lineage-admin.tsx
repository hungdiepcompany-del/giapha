import { ActionLink } from "@/components/ui/action-link";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/section-card";
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
  "mt-1 min-h-10 w-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-slate-900 disabled:bg-slate-100";
const buttonClass =
  "min-h-10 border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700";

function FieldLabel({ children }: { children: string }) {
  return <span className="text-sm font-semibold text-slate-800">{children}</span>;
}

function nameForPerson(person?: Pick<Person, "full_name" | "display_name"> | null) {
  return person ? person.display_name || person.full_name : null;
}

function clanName(clans: Clan[], clanId: string) {
  return clans.find((clan) => clan.id === clanId)?.clan_name ?? clanId;
}

function branchName(branches: ClanBranch[], branchId?: string | null) {
  if (!branchId) return "No branch";
  return branches.find((branch) => branch.id === branchId)?.branch_name ?? branchId;
}

function personName(people: Person[] | undefined, personId?: string | null) {
  if (!personId) return "No person";
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
          <FieldLabel>Clan code *</FieldLabel>
          <input
            name="clan_code"
            required
            defaultValue={clan?.clan_code ?? ""}
            className={inputClass}
          />
        </label>
        <label className="block">
          <FieldLabel>Clan name *</FieldLabel>
          <input
            name="clan_name"
            required
            defaultValue={clan?.clan_name ?? ""}
            className={inputClass}
          />
        </label>
        <label className="block">
          <FieldLabel>Family name</FieldLabel>
          <input
            name="family_name"
            defaultValue={clan?.family_name ?? ""}
            className={inputClass}
          />
        </label>
        <label className="block">
          <FieldLabel>Origin place</FieldLabel>
          <input
            name="origin_place"
            defaultValue={clan?.origin_place ?? ""}
            className={inputClass}
          />
        </label>
        <label className="block">
          <FieldLabel>Founder person ID</FieldLabel>
          <input
            name="founder_person_id"
            defaultValue={clan?.founder_person_id ?? ""}
            className={inputClass}
          />
        </label>
        <label className="block">
          <FieldLabel>Current head person ID</FieldLabel>
          <input
            name="current_head_person_id"
            defaultValue={clan?.current_head_person_id ?? ""}
            className={inputClass}
          />
        </label>
        <label className="block">
          <FieldLabel>Visibility</FieldLabel>
          <VisibilitySelect defaultValue={clan?.visibility} />
        </label>
      </div>
      <label className="block">
        <FieldLabel>Description</FieldLabel>
        <textarea
          name="description"
          defaultValue={clan?.description ?? ""}
          rows={3}
          className={`${inputClass} min-h-24`}
        />
      </label>
      <button type="submit" className={buttonClass}>
        {clan ? "Update clan" : "Create clan"}
      </button>
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
          <FieldLabel>Clan *</FieldLabel>
          <select
            name="clan_id"
            required
            defaultValue={branch?.clan_id ?? clans[0]?.id ?? ""}
            className={inputClass}
          >
            <option value="" disabled>
              Select clan
            </option>
            {clans.map((clan) => (
              <option key={clan.id} value={clan.id}>
                {clan.clan_name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <FieldLabel>Parent branch</FieldLabel>
          <select
            name="parent_branch_id"
            defaultValue={branch?.parent_branch_id ?? ""}
            className={inputClass}
          >
            <option value="">No parent branch</option>
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
          <FieldLabel>Branch code *</FieldLabel>
          <input
            name="branch_code"
            required
            defaultValue={branch?.branch_code ?? ""}
            className={inputClass}
          />
        </label>
        <label className="block">
          <FieldLabel>Branch name *</FieldLabel>
          <input
            name="branch_name"
            required
            defaultValue={branch?.branch_name ?? ""}
            className={inputClass}
          />
        </label>
        <label className="block">
          <FieldLabel>Branch level</FieldLabel>
          <input
            name="branch_level"
            type="number"
            min="1"
            defaultValue={branch?.branch_level ?? 1}
            className={inputClass}
          />
        </label>
        <label className="block">
          <FieldLabel>Sort order</FieldLabel>
          <input
            name="sort_order"
            type="number"
            defaultValue={branch?.sort_order ?? 0}
            className={inputClass}
          />
        </label>
        <label className="block">
          <FieldLabel>Visibility</FieldLabel>
          <VisibilitySelect defaultValue={branch?.visibility} />
        </label>
      </div>
      <label className="block">
        <FieldLabel>Description</FieldLabel>
        <textarea
          name="description"
          defaultValue={branch?.description ?? ""}
          rows={3}
          className={`${inputClass} min-h-24`}
        />
      </label>
      <button type="submit" className={buttonClass} disabled={clans.length === 0}>
        {branch ? "Update branch" : "Create branch"}
      </button>
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
          <FieldLabel>Clan *</FieldLabel>
          <select
            name="clan_id"
            required
            defaultValue={rule?.clan_id ?? clans[0]?.id ?? ""}
            className={inputClass}
          >
            <option value="" disabled>
              Select clan
            </option>
            {clans.map((clan) => (
              <option key={clan.id} value={clan.id}>
                {clan.clan_name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <FieldLabel>Branch</FieldLabel>
          <select
            name="branch_id"
            defaultValue={rule?.branch_id ?? ""}
            className={inputClass}
          >
            <option value="">Clan-wide rule</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.branch_name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <FieldLabel>Root person ID</FieldLabel>
          <input
            name="root_person_id"
            defaultValue={rule?.root_person_id ?? ""}
            className={inputClass}
          />
        </label>
        <label className="block">
          <FieldLabel>Start generation</FieldLabel>
          <input
            name="start_generation"
            type="number"
            min="1"
            defaultValue={rule?.start_generation ?? 1}
            className={inputClass}
          />
        </label>
        <label className="block">
          <FieldLabel>Numbering method</FieldLabel>
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
          <FieldLabel>Adopted child policy</FieldLabel>
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
          <FieldLabel>Step child policy</FieldLabel>
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
          <FieldLabel>Spouse display policy</FieldLabel>
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
          Active
        </label>
      </div>
      <label className="block">
        <FieldLabel>Notes</FieldLabel>
        <textarea
          name="notes"
          defaultValue={rule?.notes ?? ""}
          rows={3}
          className={`${inputClass} min-h-24`}
        />
      </label>
      <button type="submit" className={buttonClass} disabled={clans.length === 0}>
        {rule ? "Update rule" : "Create rule"}
      </button>
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
            <FieldLabel>Person *</FieldLabel>
            <select
              name="person_id"
              required
              defaultValue={membership?.person_id ?? people[0]?.id ?? ""}
              className={inputClass}
            >
              <option value="" disabled>
                Select person
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
          <FieldLabel>Clan *</FieldLabel>
          <select
            name="clan_id"
            required
            defaultValue={membership?.clan_id ?? clans[0]?.id ?? ""}
            className={inputClass}
          >
            <option value="" disabled>
              Select clan
            </option>
            {clans.map((clan) => (
              <option key={clan.id} value={clan.id}>
                {clan.clan_name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <FieldLabel>Branch</FieldLabel>
          <select
            name="branch_id"
            defaultValue={membership?.branch_id ?? ""}
            className={inputClass}
          >
            <option value="">No branch</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.branch_name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <FieldLabel>Generation rule</FieldLabel>
          <select
            name="generation_rule_id"
            defaultValue={membership?.generation_rule_id ?? ""}
            className={inputClass}
          >
            <option value="">No rule</option>
            {generationRules.map((rule) => (
              <option key={rule.id} value={rule.id}>
                {clanName(clans, rule.clan_id)} /{" "}
                {branchName(branches, rule.branch_id)} / Gen{" "}
                {rule.start_generation}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <FieldLabel>Generation number</FieldLabel>
          <input
            name="generation_number"
            type="number"
            min="1"
            defaultValue={membership?.generation_number ?? ""}
            className={inputClass}
          />
        </label>
        <label className="block">
          <FieldLabel>Membership type</FieldLabel>
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
          <FieldLabel>Sort order</FieldLabel>
          <input
            name="sort_order"
            type="number"
            defaultValue={membership?.sort_order ?? 0}
            className={inputClass}
          />
        </label>
        <label className="block">
          <FieldLabel>Visibility</FieldLabel>
          <VisibilitySelect defaultValue={membership?.visibility} />
        </label>
        <label className="flex min-h-10 items-center gap-3 pt-6 text-sm font-semibold text-slate-800">
          <input
            name="is_primary"
            type="checkbox"
            defaultChecked={membership?.is_primary ?? true}
            className="h-4 w-4"
          />
          Primary membership
        </label>
      </div>
      <label className="block">
        <FieldLabel>Generation override reason</FieldLabel>
        <input
          name="generation_override_reason"
          defaultValue={membership?.generation_override_reason ?? ""}
          className={inputClass}
        />
      </label>
      <label className="block">
        <FieldLabel>Source note</FieldLabel>
        <textarea
          name="source_note"
          defaultValue={membership?.source_note ?? ""}
          rows={3}
          className={`${inputClass} min-h-24`}
        />
      </label>
      <button
        type="submit"
        className={buttonClass}
        disabled={clans.length === 0 || (!fixedPersonId && people.length === 0)}
      >
        {membership ? "Update membership" : "Create membership"}
      </button>
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
        title="No clans yet"
        description="Create the first clan before adding branches, generation rules or memberships."
      />
    );
  }

  return (
    <div className="grid gap-4">
      {clans.map((clan) => (
        <SectionCard key={clan.id}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-950">
                {clan.clan_name}
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {clan.clan_code} / {visibilityLabels[clan.visibility]}
              </p>
              {clan.origin_place ? (
                <p className="mt-2 text-sm text-slate-700">
                  Origin: {clan.origin_place}
                </p>
              ) : null}
            </div>
            <ActionLink href="/admin/genealogy/branches">
              Manage branches
            </ActionLink>
          </div>
          <div className="mt-5 border-t border-slate-100 pt-5">
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
        title="No branches yet"
        description="Branches can be added after at least one clan exists."
      />
    );
  }

  return (
    <div className="grid gap-4">
      {branches.map((branch) => (
        <SectionCard key={branch.id}>
          <div>
            <h3 className="text-lg font-bold text-slate-950">
              {branch.branch_name}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              {branch.branch_code} / {clanName(clans, branch.clan_id)} / Level{" "}
              {branch.branch_level}
            </p>
          </div>
          <div className="mt-5 border-t border-slate-100 pt-5">
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
        title="No generation rules yet"
        description="Create a clan-wide or branch-specific numbering rule."
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
              Start generation {rule.start_generation} /{" "}
              {numberingMethodLabels[rule.numbering_method]} /{" "}
              {rule.is_active ? "Active" : "Inactive"}
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
        title="No memberships yet"
        description="Assign people to clans and branches without automatic backfill."
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
        title="No branch membership"
        description="This person has not been assigned to a clan or branch yet."
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
            {membership.is_primary ? "Primary" : "Secondary"} /{" "}
            {visibilityLabels[membership.visibility]}
          </div>
          {membership.generation_number ? (
            <div className="mt-1">Generation {membership.generation_number}</div>
          ) : null}
          {membership.source_note ? (
            <div className="mt-2 text-slate-600">{membership.source_note}</div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
