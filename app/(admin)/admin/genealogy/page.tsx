import { AdminShell } from "@/components/layout/admin-shell";
import { ActionLink } from "@/components/ui/action-link";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatusCallout } from "@/components/ui/status-callout";
import { getLineageDashboard } from "@/lib/family/lineage-service";
import { getPermissionContext } from "@/lib/permissions/permission-service";

export const dynamic = "force-dynamic";

type GenealogyPageProps = {
  searchParams: Promise<{
    error?: string;
    saved?: string;
  }>;
};

function canReadLineage(permissions: string[]) {
  return permissions.includes("people.view") || permissions.includes("tree.view");
}

function canManageLineage(permissions: string[]) {
  return (
    permissions.includes("people.update") ||
    permissions.includes("relationships.update") ||
    permissions.includes("tree.edit_layout") ||
    permissions.includes("settings.manage")
  );
}

export default async function GenealogyPage({
  searchParams,
}: GenealogyPageProps) {
  const query = await searchParams;
  const context = await getPermissionContext();
  const canView = canReadLineage(context.permissions);
  const canManage = canManageLineage(context.permissions);
  const result = canView
    ? await getLineageDashboard()
    : {
        ok: false as const,
        error:
          context.reason === "missing_supabase_config"
            ? "Supabase is not configured."
            : "Missing people.view or tree.view.",
      };

  return (
    <AdminShell
      userEmail={context.user?.email}
      roles={context.roles.map((role) => role.code)}
      permissions={context.permissions}
    >
      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        <PageHeader
          eyebrow="Vietnamese genealogy"
          title="Clan, branch and generation"
          description="Manage lineage metadata that was added by the approved Vietnamese genealogy migration."
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

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <SectionCard>
            <h2 className="text-2xl font-bold text-slate-950">
              {result.ok ? result.data.clans.length : "-"}
            </h2>
            <p className="mt-1 text-sm text-slate-600">Clans</p>
            <ActionLink href="/admin/genealogy/clans" className="mt-4">
              Open
            </ActionLink>
          </SectionCard>
          <SectionCard>
            <h2 className="text-2xl font-bold text-slate-950">
              {result.ok ? result.data.branches.length : "-"}
            </h2>
            <p className="mt-1 text-sm text-slate-600">Branches</p>
            <ActionLink href="/admin/genealogy/branches" className="mt-4">
              Open
            </ActionLink>
          </SectionCard>
          <SectionCard>
            <h2 className="text-2xl font-bold text-slate-950">
              {result.ok ? result.data.generationRules.length : "-"}
            </h2>
            <p className="mt-1 text-sm text-slate-600">Generation rules</p>
            <ActionLink
              href="/admin/genealogy/generation-rules"
              className="mt-4"
            >
              Open
            </ActionLink>
          </SectionCard>
          <SectionCard>
            <h2 className="text-2xl font-bold text-slate-950">
              {result.ok ? result.data.memberships.length : "-"}
            </h2>
            <p className="mt-1 text-sm text-slate-600">Memberships</p>
            <ActionLink href="/admin/genealogy/memberships" className="mt-4">
              Open
            </ActionLink>
          </SectionCard>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <StatusCallout tone="info">
            Read uses existing permissions people.view or tree.view. Manage uses
            existing permissions people.update, relationships.update,
            tree.edit_layout or settings.manage.
          </StatusCallout>
          <StatusCallout tone="warning">
            No automatic backfill from people.branch_name or
            people.generation_number is performed. Enter memberships explicitly.
          </StatusCallout>
        </div>

        {!result.ok ? (
          <StatusCallout tone="danger" className="mt-6">
            {result.error}
          </StatusCallout>
        ) : null}

        {!canManage ? (
          <StatusCallout tone="warning" className="mt-6">
            You can view lineage data, but you do not have one of the existing
            manage permissions for updates.
          </StatusCallout>
        ) : null}
      </section>
    </AdminShell>
  );
}
