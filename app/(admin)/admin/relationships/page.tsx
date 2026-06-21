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
      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        <PageHeader
          eyebrow="Nền tảng quản lý quan hệ"
          title="Quan hệ gia đình"
          description="Gia đình là đơn vị nối cha/mẹ với con; quan hệ đôi lưu vợ/chồng/bạn đời riêng để giữ mô hình rõ ràng."
        />

        <div className="mt-6 grid gap-4 text-sm leading-6 text-slate-700 md:grid-cols-3">
          <SectionCard>
            <h2 className="font-bold text-slate-950">Gia đình</h2>
            <p className="mt-2">
              Một đơn vị gia đình gom cha/mẹ và danh sách con.
            </p>
          </SectionCard>
          <SectionCard>
            <h2 className="font-bold text-slate-950">Cha mẹ / con</h2>
            <p className="mt-2">
              Chọn gia đình và chọn thành viên theo tên để gắn cha/mẹ hoặc con.
            </p>
          </SectionCard>
          <SectionCard>
            <h2 className="font-bold text-slate-950">Quan hệ đôi</h2>
            <p className="mt-2">
              Vợ/chồng/bạn đời được lưu độc lập với gia đình.
            </p>
          </SectionCard>
        </div>

        {query.error ? (
          <StatusCallout tone="danger" className="mt-6">
            {query.error}
          </StatusCallout>
        ) : null}

        {query.saved ? (
          <StatusCallout tone="success" className="mt-6">
            Đã lưu thay đổi: {query.saved}
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
                  <RelationshipForm
                    families={result.data.families}
                    people={people}
                    returnTo="/admin/relationships"
                  />
                  <CoupleForm
                    people={people}
                    returnTo="/admin/relationships"
                  />
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
