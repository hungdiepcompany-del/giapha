import { AdminShell } from "@/components/layout/admin-shell";
import { PersonForm } from "@/components/people/person-form";
import { createPersonAction } from "@/app/(admin)/admin/people/actions";
import { getPermissionContext } from "@/lib/permissions/permission-service";

export const dynamic = "force-dynamic";

type NewPersonPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewPersonPage({ searchParams }: NewPersonPageProps) {
  const params = await searchParams;
  const context = await getPermissionContext();
  const canCreate = context.permissions.includes("people.create");

  return (
    <AdminShell
      userEmail={context.user?.email}
      roles={context.roles.map((role) => role.code)}
      permissions={context.permissions}
    >
      <section className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="border-b border-slate-200 pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
            People CRUD foundation
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Thêm thành viên
          </h1>
        </div>
        <div className="mt-6 border border-slate-200 bg-white p-6">
          {canCreate ? (
            <PersonForm
              action={createPersonAction}
              error={params.error}
              submitLabel="Tạo thành viên"
            />
          ) : (
            <div className="border border-amber-200 bg-amber-50 p-6 text-amber-900">
              {context.reason === "missing_supabase_config"
                ? "Chưa cấu hình Supabase."
                : "Bạn chưa có quyền tạo thành viên."}
            </div>
          )}
        </div>
      </section>
    </AdminShell>
  );
}

