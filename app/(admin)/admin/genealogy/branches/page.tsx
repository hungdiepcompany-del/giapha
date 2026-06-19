import { AdminShell } from "@/components/layout/admin-shell";
import { BranchForm, BranchList } from "@/components/genealogy/lineage-admin";
import { lineageSavedMessage } from "@/components/genealogy/lineage-labels";
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
          eyebrow="Gia phả Việt Nam"
          title="Chi nhánh"
          description="Quản lý thứ bậc chi/nhánh trong từng dòng họ."
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
            <h2 className="text-lg font-bold text-slate-950">Tạo chi</h2>
            {clanData.length === 0 ? (
              <StatusCallout tone="warning" className="mt-4">
                Cần tạo ít nhất một dòng họ trước khi thêm chi.
              </StatusCallout>
            ) : null}
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
