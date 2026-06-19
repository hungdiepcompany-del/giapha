import { AdminShell } from "@/components/layout/admin-shell";
import { MembershipForm, MembershipList } from "@/components/genealogy/lineage-admin";
import { lineageSavedMessage } from "@/components/genealogy/lineage-labels";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatusCallout } from "@/components/ui/status-callout";
import {
  listClanBranches,
  listClans,
  listGenerationRules,
  listPersonBranchMemberships,
} from "@/lib/family/lineage-service";
import { listPeople } from "@/lib/family/people-service";
import { getPermissionContext } from "@/lib/permissions/permission-service";

export const dynamic = "force-dynamic";

type MembershipsPageProps = {
  searchParams: Promise<{
    error?: string;
    saved?: string;
  }>;
};

export default async function MembershipsPage({
  searchParams,
}: MembershipsPageProps) {
  const query = await searchParams;
  const context = await getPermissionContext();
  const [clans, branches, rules, memberships, people] = await Promise.all([
    listClans(),
    listClanBranches(),
    listGenerationRules(),
    listPersonBranchMemberships(),
    listPeople(),
  ]);
  const canManage =
    context.permissions.includes("people.update") ||
    context.permissions.includes("relationships.update") ||
    context.permissions.includes("tree.edit_layout") ||
    context.permissions.includes("settings.manage");
  const clanData = clans.ok ? clans.data : [];
  const branchData = branches.ok ? branches.data : [];
  const ruleData = rules.ok ? rules.data : [];
  const membershipData = memberships.ok ? memberships.data : [];
  const peopleData = people.ok ? people.data : [];

  return (
    <AdminShell
      userEmail={context.user?.email}
      roles={context.roles.map((role) => role.code)}
      permissions={context.permissions}
    >
      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        <PageHeader
          eyebrow="Gia phả Việt Nam"
          title="Gắn thành viên vào dòng họ/chi"
          description="Gán người vào dòng họ hoặc chi bằng thao tác rõ ràng. Không tự backfill từ branch_name hoặc generation_number."
        />

        {query.error ? (
          <StatusCallout tone="danger" className="mt-6">
            {query.error}
          </StatusCallout>
        ) : null}
        {query.saved ? (
          <StatusCallout tone="success" className="mt-6">
            {lineageSavedMessage(query.saved)}
          </StatusCallout>
        ) : null}
        {[clans, branches, rules, memberships, people].map((result, index) =>
          result.ok ? null : (
            <StatusCallout key={index} tone="danger" className="mt-6">
              {result.error}
            </StatusCallout>
          ),
        )}

        {canManage ? (
          <SectionCard className="mt-6">
            <h2 className="text-lg font-bold text-slate-950">
              Gán thành viên
            </h2>
            {clanData.length === 0 || peopleData.length === 0 ? (
              <StatusCallout tone="warning" className="mt-4">
                Cần có ít nhất một dòng họ và một thành viên trước khi gán dòng
                họ/chi.
              </StatusCallout>
            ) : null}
            <div className="mt-4">
              <MembershipForm
                clans={clanData}
                branches={branchData}
                generationRules={ruleData}
                people={peopleData}
                returnTo="/admin/genealogy/memberships"
              />
            </div>
          </SectionCard>
        ) : null}

        <div className="mt-6">
          {memberships.ok ? (
            <MembershipList
              memberships={membershipData}
              clans={clanData}
              branches={branchData}
              generationRules={ruleData}
              people={peopleData}
              returnTo="/admin/genealogy/memberships"
            />
          ) : null}
        </div>
      </section>
    </AdminShell>
  );
}
