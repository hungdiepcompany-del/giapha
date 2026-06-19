import { AdminShell } from "@/components/layout/admin-shell";
import { AdminWarningList } from "@/components/genealogy/admin-warning-list";
import { lineageSavedMessage } from "@/components/genealogy/lineage-labels";
import { ActionLink } from "@/components/ui/action-link";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatusCallout } from "@/components/ui/status-callout";
import { getLineageDashboard } from "@/lib/family/lineage-service";
import { getLineageDashboardInlineWarnings } from "@/lib/family/inline-warning-rules";
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
            ? "Chưa cấu hình Supabase cho môi trường hiện tại."
            : "Bạn cần quyền people.view hoặc tree.view để xem dữ liệu dòng họ.",
      };
  const inlineWarnings = result.ok
    ? getLineageDashboardInlineWarnings(result.data)
    : [];

  return (
    <AdminShell
      userEmail={context.user?.email}
      roles={context.roles.map((role) => role.code)}
      permissions={context.permissions}
    >
      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        <PageHeader
          eyebrow="Gia phả Việt Nam"
          title="Dòng họ, chi nhánh và đời"
          description="Quản lý metadata dòng họ đã được verify sau migration gia phả Việt Nam. Mọi gán thành viên đều nhập rõ ràng, không tự backfill."
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

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <SectionCard>
            <h2 className="text-2xl font-bold text-slate-950">
              {result.ok ? result.data.clans.length : "-"}
            </h2>
            <p className="mt-1 text-sm text-slate-600">Dòng họ</p>
            <ActionLink href="/admin/genealogy/clans" className="mt-4">
              Mở quản lý
            </ActionLink>
          </SectionCard>
          <SectionCard>
            <h2 className="text-2xl font-bold text-slate-950">
              {result.ok ? result.data.branches.length : "-"}
            </h2>
            <p className="mt-1 text-sm text-slate-600">Chi</p>
            <ActionLink href="/admin/genealogy/branches" className="mt-4">
              Mở quản lý
            </ActionLink>
          </SectionCard>
          <SectionCard>
            <h2 className="text-2xl font-bold text-slate-950">
              {result.ok ? result.data.generationRules.length : "-"}
            </h2>
            <p className="mt-1 text-sm text-slate-600">Quy tắc đời</p>
            <ActionLink
              href="/admin/genealogy/generation-rules"
              className="mt-4"
            >
              Mở quản lý
            </ActionLink>
          </SectionCard>
          <SectionCard>
            <h2 className="text-2xl font-bold text-slate-950">
              {result.ok ? result.data.memberships.length : "-"}
            </h2>
            <p className="mt-1 text-sm text-slate-600">Gán thành viên</p>
            <ActionLink href="/admin/genealogy/memberships" className="mt-4">
              Mở quản lý
            </ActionLink>
          </SectionCard>
        </div>

        {result.ok ? (
          <AdminWarningList
            warnings={inlineWarnings}
            title="Cảnh báo dữ liệu dòng họ đang hiển thị"
            className="mt-6"
          />
        ) : null}

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <StatusCallout tone="info">
            Quyền xem dùng permission hiện có `people.view` hoặc `tree.view`.
            Quyền cập nhật dùng `people.update`, `relationships.update`,
            `tree.edit_layout` hoặc `settings.manage`.
          </StatusCallout>
          <StatusCallout tone="warning">
            Không tự backfill từ `people.branch_name` hoặc
            `people.generation_number`. Hãy gán dòng họ/chi thủ công khi có
            dữ liệu xác minh.
          </StatusCallout>
        </div>

        {!result.ok ? (
          <StatusCallout tone="danger" className="mt-6">
            {result.error}
          </StatusCallout>
        ) : null}

        {!canManage ? (
          <StatusCallout tone="warning" className="mt-6">
            Bạn có thể xem dữ liệu dòng họ/chi, nhưng chưa có quyền cập nhật
            trong nhóm permission hiện có.
          </StatusCallout>
        ) : null}
      </section>
    </AdminShell>
  );
}
