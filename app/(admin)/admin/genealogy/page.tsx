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
      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <PageHeader
          eyebrow="Gia phả Việt Nam"
          title="Danh sách gia phả"
          description="Theo dõi dòng họ, chi nhánh, số thế hệ và thành viên đã gán. Mọi gán thành viên đều nhập rõ ràng, không tự backfill."
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

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SectionCard className="bg-[#fff8e8]/95">
            <p className="text-sm font-semibold text-[#7a2f24]">Dòng họ</p>
            <h2 className="mt-2 text-3xl font-bold text-[#245744]">
              {result.ok ? result.data.clans.length : "-"}
            </h2>
            <p className="mt-1 text-sm text-stone-600">tên họ đang quản lý</p>
            <div className="mt-4 grid gap-2">
              <ActionLink href="/admin/genealogy/clans">Mở quản lý</ActionLink>
              <ActionLink href="/admin/tree">Xem phả đồ</ActionLink>
            </div>
          </SectionCard>
          <SectionCard className="bg-[#fff8e8]/95">
            <p className="text-sm font-semibold text-[#7a2f24]">Chi nhánh</p>
            <h2 className="mt-2 text-3xl font-bold text-[#245744]">
              {result.ok ? result.data.branches.length : "-"}
            </h2>
            <p className="mt-1 text-sm text-stone-600">nhánh trong dòng họ</p>
            <ActionLink href="/admin/genealogy/branches" className="mt-4">
              Mở quản lý
            </ActionLink>
          </SectionCard>
          <SectionCard className="bg-[#fff8e8]/95">
            <p className="text-sm font-semibold text-[#7a2f24]">Số thế hệ</p>
            <h2 className="mt-2 text-3xl font-bold text-[#245744]">
              {result.ok ? result.data.generationRules.length : "-"}
            </h2>
            <p className="mt-1 text-sm text-stone-600">quy tắc đời đã ghi</p>
            <ActionLink
              href="/admin/genealogy/generation-rules"
              className="mt-4"
            >
              Mở quản lý
            </ActionLink>
          </SectionCard>
          <SectionCard className="bg-[#fff8e8]/95">
            <p className="text-sm font-semibold text-[#7a2f24]">Thành viên</p>
            <h2 className="mt-2 text-3xl font-bold text-[#245744]">
              {result.ok ? result.data.memberships.length : "-"}
            </h2>
            <p className="mt-1 text-sm text-stone-600">người đã gán dòng họ</p>
            <div className="mt-4 grid gap-2">
              <ActionLink href="/admin/genealogy/memberships">
                Mở quản lý
              </ActionLink>
              <ActionLink href="/admin/people">Danh sách thành viên</ActionLink>
            </div>
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
            Quyền xem dùng quyền hiện có `people.view` hoặc `tree.view`.
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
            trong nhóm quyền hiện có.
          </StatusCallout>
        ) : null}
      </section>
    </AdminShell>
  );
}
