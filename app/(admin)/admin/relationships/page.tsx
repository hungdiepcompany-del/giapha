import { AdminShell } from "@/components/layout/admin-shell";
import { CoupleForm } from "@/components/relationships/couple-form";
import { RelationshipForm } from "@/components/relationships/relationship-form";
import { RelationshipSummary } from "@/components/relationships/relationship-summary";
import { getPermissionContext } from "@/lib/permissions/permission-service";
import { listRelationships } from "@/lib/family/relationship-service";

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
  const result = canView
    ? await listRelationships()
    : {
        ok: false as const,
        error:
          context.reason === "missing_supabase_config"
            ? "Chưa cấu hình Supabase."
            : "Bạn chưa có quyền xem quan hệ gia đình.",
      };

  return (
    <AdminShell
      userEmail={context.user?.email}
      roles={context.roles.map((role) => role.code)}
      permissions={context.permissions}
    >
      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="border-b border-slate-200 pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Relationship CRUD foundation
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Quan hệ gia đình
          </h1>
        </div>

        {query.error ? (
          <div className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {query.error}
          </div>
        ) : null}

        {query.saved ? (
          <div className="mt-6 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Đã lưu thay đổi: {query.saved}
          </div>
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
                  <RelationshipForm
                    families={result.data.families}
                    returnTo="/admin/relationships"
                  />
                  <CoupleForm returnTo="/admin/relationships" />
                </div>
              ) : null}
            </div>
          ) : (
            <div className="border border-amber-200 bg-amber-50 p-6 text-amber-900">
              {result.error}
            </div>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
