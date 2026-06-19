import { AdminShell } from "@/components/layout/admin-shell";
import { BranchForm, BranchList } from "@/components/genealogy/lineage-admin";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatusCallout } from "@/components/ui/status-callout";
import { listClanBranches, listClans } from "@/lib/family/lineage-service";
import { getPermissionContext } from "@/lib/permissions/permission-service";

export const dynamic = "force-dynamic";

type BranchesPageProps = {
  searchParams: Promise<{
    error?: string;
    saved?: string;
  }>;
};

export default async function BranchesPage({ searchParams }: BranchesPageProps) {
  const query = await searchParams;
  const context = await getPermissionContext();
  const [clans, branches] = await Promise.all([listClans(), listClanBranches()]);
  const canManage =
    context.permissions.includes("people.update") ||
    context.permissions.includes("relationships.update") ||
    context.permissions.includes("tree.edit_layout") ||
    context.permissions.includes("settings.manage");
  const clanData = clans.ok ? clans.data : [];
  const branchData = branches.ok ? branches.data : [];

  return (
    <AdminShell
      userEmail={context.user?.email}
      roles={context.roles.map((role) => role.code)}
      permissions={context.permissions}
    >
      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        <PageHeader
          eyebrow="Vietnamese genealogy"
          title="Branches"
          description="Manage chi/nhanh hierarchy inside each clan."
        />

        {query.error ? (
          <StatusCallout tone="danger" className="mt-6">
            {query.error}
          </StatusCallout>
        ) : null}
        {query.saved ? (
          <StatusCallout tone="success" className="mt-6">
            Saved: {query.saved}
          </StatusCallout>
        ) : null}
        {!clans.ok ? (
          <StatusCallout tone="danger" className="mt-6">
            {clans.error}
          </StatusCallout>
        ) : null}
        {!branches.ok ? (
          <StatusCallout tone="danger" className="mt-6">
            {branches.error}
          </StatusCallout>
        ) : null}

        {canManage ? (
          <SectionCard className="mt-6">
            <h2 className="text-lg font-bold text-slate-950">Create branch</h2>
            <div className="mt-4">
              <BranchForm
                clans={clanData}
                branches={branchData}
                returnTo="/admin/genealogy/branches"
              />
            </div>
          </SectionCard>
        ) : null}

        <div className="mt-6">
          {branches.ok ? (
            <BranchList
              branches={branchData}
              clans={clanData}
              returnTo="/admin/genealogy/branches"
            />
          ) : null}
        </div>
      </section>
    </AdminShell>
  );
}
