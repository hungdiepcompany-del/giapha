import { AdminShell } from "@/components/layout/admin-shell";
import { CoupleForm } from "@/components/relationships/couple-form";
import { RelationshipForm } from "@/components/relationships/relationship-form";
import { RelationshipSummary } from "@/components/relationships/relationship-summary";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatusCallout } from "@/components/ui/status-callout";
import { listPeople } from "@/lib/family/people-service";
import { listRelationships } from "@/lib/family/relationship-service";
import { getPermissionContext } from "@/lib/permissions/permission-service";

export const dynamic = "force-dynamic";

type RelationshipsPageProps = {
  searchParams: Promise<{
    error?: string;
    saved?: string;
  }>;
};

export default async function RelationshipsPage({
  searchParams,
}: RelationshipsPageProps) {
  const query = await searchParams;
  const context = await getPermissionContext();
  const canView = context.permissions.includes("relationships.view");
  const canCreate = context.permissions.includes("relationships.create");
  const canDelete = context.permissions.includes("relationships.delete");
  const canViewPeople = context.permissions.includes("people.view");
  const result = canView
    ? await listRelationships()
    : {
        ok: false as const,
        error:
          context.reason === "missing_supabase_config"
            ? "Chưa cấu hình Supabase."
            : "Bạn chưa có quyền xem quan hệ gia đình.",
      };
  const peopleResult = canCreate && canViewPeople ? await listPeople() : null;
  const people = peopleResult?.ok ? peopleResult.data : [];

  return (
    <AdminShell
      userEmail={context.user?.email}
      roles={context.roles.map((role) => role.code)}
      permissions={context.permissions}
    >
      <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <PageHeader
          eyebrow="Phiếu quan hệ gia đình"
          title="Gia đình & quan hệ"
          description="Gắn cha, mẹ, vợ/chồng và con bằng các biểu mẫu rõ ràng. Mã nội bộ vẫn được hệ thống xử lý phía sau khi lưu."
        />

        <div className="mt-6 grid gap-4 text-sm leading-6 text-stone-700 md:grid-cols-3">
          <SectionCard>
            <h2 className="font-bold text-stone-950">Gia đình</h2>
            <p className="mt-2">
              Một đơn vị gia đình gom cha/mẹ và danh sách con để phả đồ đọc đúng
              nhánh.
            </p>
          </SectionCard>
          <SectionCard>
            <h2 className="font-bold text-stone-950">Cha mẹ / con</h2>
            <p className="mt-2">
              Chọn gia đình và chọn thành viên theo tên để gắn cha/mẹ hoặc con.
            </p>
          </SectionCard>
          <SectionCard>
            <h2 className="font-bold text-stone-950">Vợ/chồng</h2>
            <p className="mt-2">
              Vợ/chồng hoặc bạn đời được lưu độc lập với gia đình cha/mẹ/con.
            </p>
          </SectionCard>
        </div>

        {query.error ? (
          <StatusCallout
            tone="danger"
            className="mt-6"
            title="Không thể lưu thông tin thành viên"
          >
            {query.error}
          </StatusCallout>
        ) : null}

        {query.saved ? (
          <StatusCallout tone="success" className="mt-6">
            Đã lưu thông tin thành viên. {query.saved}
          </StatusCallout>
        ) : null}

        <div className="mt-6">
          {result.ok ? (
            <div className="space-y-8">
              <RelationshipSummary
                data={result.data}
                canDelete={canDelete}
                returnTo="/admin/relationships"
              />
              {canCreate ? (
                <div className="space-y-6">
                  <StatusCallout tone="info">
                    Chọn thành viên theo tên hiển thị; mã nội bộ chỉ được dùng ở
                    phía sau khi lưu quan hệ.
                  </StatusCallout>
                  {!canViewPeople ? (
                    <StatusCallout tone="warning">
                      Bạn cần quyền xem thành viên để chọn người khi tạo quan hệ.
                    </StatusCallout>
                  ) : null}
                  <div className="rounded-2xl border border-amber-900/10 bg-[#fff8e8] p-4 shadow-sm sm:p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a4b2a]">
                      Thêm người thân
                    </p>
                    <h2 className="mt-2 text-xl font-bold text-stone-950">
                      Thêm quan hệ mới
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-stone-600">
                      Nên tạo đơn vị gia đình trước, sau đó gắn cha/mẹ và con.
                      Quan hệ vợ/chồng có thể tạo độc lập.
                    </p>
                  </div>
                  <RelationshipForm
                    families={result.data.families}
                    people={people}
                    returnTo="/admin/relationships"
                  />
                  <CoupleForm people={people} returnTo="/admin/relationships" />
                </div>
              ) : null}
            </div>
          ) : (
            <StatusCallout tone="warning">{result.error}</StatusCallout>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
