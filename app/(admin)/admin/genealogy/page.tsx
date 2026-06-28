import { AdminShell } from "@/components/layout/admin-shell";
import { AdminWarningList } from "@/components/genealogy/admin-warning-list";
import { lineageSavedMessage } from "@/components/genealogy/lineage-labels";
import { ActionLink } from "@/components/ui/action-link";
import { EmptyState } from "@/components/ui/empty-state";
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

const visibilityLabels = {
  public: "Công khai",
  family: "Gia đình",
  private: "Riêng tư",
};

function formatDate(value: string | null) {
  if (!value) {
    return "Chưa rõ";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
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
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="rounded-xl border border-amber-900/10 bg-[#fff8e8] p-5 shadow-sm sm:p-6">
          <PageHeader
            eyebrow="Gia phả Việt Nam"
            title="Gia phả của tôi"
            description="Theo dõi dòng họ, chi nhánh, số thế hệ, thành viên đã gán và trạng thái công khai/riêng tư. Mọi gán thành viên đều nhập rõ ràng, không tự backfill."
            actions={
              canManage ? (
                <ActionLink href="/admin/genealogy/clans" variant="primary">
                  Tạo gia phả đầu tiên
                </ActionLink>
              ) : null
            }
          />
          <p className="sr-only">Đang tải danh sách gia phả...</p>
        </div>

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
            <p className="text-sm font-semibold text-[#7a2f24]">Gia phả</p>
            <h2 className="mt-2 text-3xl font-bold text-[#245744]">
              {result.ok ? result.data.clans.length : "-"}
            </h2>
            <p className="mt-1 text-sm text-stone-600">dòng họ đang quản lý</p>
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

        {result.ok ? (
          <div className="mt-6">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-normal text-[#7a2f24]">
                  Danh sách gia phả
                </p>
                <h2 className="mt-1 text-xl font-bold text-stone-950">
                  Dòng họ của tôi
                </h2>
              </div>
              <ActionLink href="/admin/genealogy/clans" className="w-fit">
                Chỉnh sửa
              </ActionLink>
            </div>

            {result.data.clans.length === 0 ? (
              <EmptyState
                title="Chưa có gia phả nào."
                description="Bắt đầu bằng cách tạo gia phả đầu tiên, sau đó thêm chi nhánh, thế hệ và gán thành viên khi đã xác minh dữ liệu."
                actions={
                  canManage ? (
                    <ActionLink href="/admin/genealogy/clans" variant="primary">
                      Tạo gia phả đầu tiên
                    </ActionLink>
                  ) : (
                    <span className="inline-flex min-h-11 items-center rounded-md border border-amber-900/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700">
                      Tài khoản hiện tại chưa có quyền quản trị khu vực này.
                    </span>
                  )
                }
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {result.data.clans.map((clan) => {
                  const branchCount = result.data.branches.filter(
                    (branch) => branch.clan_id === clan.id,
                  ).length;
                  const memberCount = result.data.memberships.filter(
                    (membership) => membership.clan_id === clan.id,
                  ).length;
                  const generationCount = new Set(
                    result.data.memberships
                      .filter(
                        (membership) =>
                          membership.clan_id === clan.id &&
                          membership.generation_number !== null,
                      )
                      .map((membership) => membership.generation_number),
                  ).size;

                  return (
                    <SectionCard
                      key={clan.id}
                      className="flex flex-col gap-4 bg-[#fff8e8]/95"
                    >
                      <div className="rounded-lg border border-amber-900/10 bg-[#f2dfbd]/60 px-3 py-2">
                        <p className="text-xs font-bold uppercase tracking-normal text-[#7a2f24]">
                          {visibilityLabels[clan.visibility]}
                        </p>
                        <h3 className="mt-1 break-words text-xl font-black text-stone-950">
                          {clan.clan_name}
                        </h3>
                        <p className="mt-1 text-sm text-stone-700">
                          {clan.description ?? "Gia phả đang được gia đình cập nhật thông tin."}
                        </p>
                      </div>
                      <dl className="grid gap-2 text-sm sm:grid-cols-2">
                        <div className="rounded-lg border border-amber-900/10 bg-white/80 p-3">
                          <dt className="font-semibold text-stone-600">Thành viên</dt>
                          <dd className="mt-1 text-lg font-bold text-[#245744]">
                            {memberCount.toLocaleString("vi-VN")}
                          </dd>
                        </div>
                        <div className="rounded-lg border border-amber-900/10 bg-white/80 p-3">
                          <dt className="font-semibold text-stone-600">Số thế hệ</dt>
                          <dd className="mt-1 text-lg font-bold text-[#245744]">
                            {generationCount > 0
                              ? generationCount.toLocaleString("vi-VN")
                              : "Chưa rõ"}
                          </dd>
                        </div>
                        <div className="rounded-lg border border-amber-900/10 bg-white/80 p-3">
                          <dt className="font-semibold text-stone-600">Chi nhánh</dt>
                          <dd className="mt-1 text-lg font-bold text-[#245744]">
                            {branchCount.toLocaleString("vi-VN")}
                          </dd>
                        </div>
                        <div className="rounded-lg border border-amber-900/10 bg-white/80 p-3">
                          <dt className="font-semibold text-stone-600">Cập nhật gần nhất</dt>
                          <dd className="mt-1 text-lg font-bold text-[#245744]">
                            {formatDate(clan.updated_at)}
                          </dd>
                        </div>
                      </dl>
                      <div className="mt-auto grid gap-2 sm:grid-cols-2">
                        <ActionLink href="/admin/tree" variant="primary">
                          Xem phả đồ
                        </ActionLink>
                        <ActionLink href="/admin/people">
                          Quản lý thành viên
                        </ActionLink>
                        <ActionLink href="/admin/genealogy/clans">
                          Chỉnh sửa
                        </ActionLink>
                        <ActionLink href="/admin/preview/public">
                          Thiết lập riêng tư
                        </ActionLink>
                      </div>
                    </SectionCard>
                  );
                })}
              </div>
            )}
          </div>
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
            Không thể tải danh sách gia phả. Vui lòng thử lại sau.{" "}
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
