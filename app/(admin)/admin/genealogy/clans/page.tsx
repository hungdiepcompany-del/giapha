import { AdminShell } from "@/components/layout/admin-shell";
import { ClanForm, ClanList } from "@/components/genealogy/lineage-admin";
import { lineageSavedMessage } from "@/components/genealogy/lineage-labels";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatusCallout } from "@/components/ui/status-callout";
import { listClans } from "@/lib/family/lineage-service";
import { getPermissionContext } from "@/lib/permissions/permission-service";

export const dynamic = "force-dynamic";

type ClansPageProps = {
  searchParams: Promise<{
    error?: string;
    saved?: string;
  }>;
};

export default async function ClansPage({ searchParams }: ClansPageProps) {
  const query = await searchParams;
  const context = await getPermissionContext();
  const result = await listClans();
  const canManage =
    context.permissions.includes("people.update") ||
    context.permissions.includes("relationships.update") ||
    context.permissions.includes("tree.edit_layout") ||
    context.permissions.includes("settings.manage");

  return (
    <AdminShell
      userEmail={context.user?.email}
      roles={context.roles.map((role) => role.code)}
      permissions={context.permissions}
    >
      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        <PageHeader
          eyebrow="Gia phả Việt Nam"
          title="Dòng họ"
          description="Tạo và cập nhật dòng họ gốc, không thêm schema mới và không backfill từ trường legacy."
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

        {canManage ? (
          <SectionCard className="mt-6">
            <h2 className="text-lg font-bold text-slate-950">Tạo dòng họ</h2>
            <div className="mt-4">
              <ClanForm returnTo="/admin/genealogy/clans" />
            </div>
          </SectionCard>
        ) : null}

        <div className="mt-6">
          {result.ok ? (
            <ClanList clans={result.data} returnTo="/admin/genealogy/clans" />
          ) : (
            <StatusCallout tone="danger">{result.error}</StatusCallout>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
