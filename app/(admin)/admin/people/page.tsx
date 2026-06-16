import { AdminShell } from "@/components/layout/admin-shell";
import { PersonList } from "@/components/people/person-list";
import { ActionLink } from "@/components/ui/action-link";
import { PageHeader } from "@/components/ui/page-header";
import { StatusCallout } from "@/components/ui/status-callout";
import { listPeople } from "@/lib/family/people-service";
import type { PersonListFilter, PersonVisibility } from "@/lib/family/people-types";
import { getPermissionContext } from "@/lib/permissions/permission-service";

export const dynamic = "force-dynamic";

type PeoplePageProps = {
  searchParams: Promise<{
    q?: string;
    visibility?: string;
    is_living?: string;
    error?: string;
  }>;
};

export default async function PeoplePage({ searchParams }: PeoplePageProps) {
  const params = await searchParams;
  const context = await getPermissionContext();

  const canView = context.permissions.includes("people.view");
  const canCreate = context.permissions.includes("people.create");
  const canUpdate = context.permissions.includes("people.update");
  const canDelete = context.permissions.includes("people.delete");

  const filters: PersonListFilter = {
    search: params.q,
    visibility: (params.visibility || "all") as PersonVisibility | "all",
    isLiving:
      params.is_living === "living" || params.is_living === "deceased"
        ? params.is_living
        : "all",
  };

  const peopleResult = canView
    ? await listPeople(filters)
    : {
        ok: false as const,
        error:
          context.reason === "missing_supabase_config"
            ? "Chưa cấu hình Supabase."
            : "Bạn chưa có quyền xem danh sách thành viên.",
      };

  return (
    <AdminShell
      userEmail={context.user?.email}
      roles={context.roles.map((role) => role.code)}
      permissions={context.permissions}
    >
      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        <PageHeader
          eyebrow="People CRUD foundation"
          title="Thành viên"
          description="Tra cứu, lọc và mở hồ sơ từng người. Dữ liệu riêng tư vẫn nằm sau permission."
          actions={
            canCreate ? (
              <ActionLink href="/admin/people/new" variant="primary">
                Thêm thành viên
              </ActionLink>
            ) : null
          }
        />

        <form className="mt-6 grid gap-3 border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
          <label className="block md:col-span-2">
            <span className="text-sm font-semibold text-slate-800">Tìm kiếm</span>
            <input
              name="q"
              defaultValue={params.q ?? ""}
              className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
              placeholder="Nhập họ tên hoặc tên hiển thị"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Visibility</span>
            <select
              name="visibility"
              defaultValue={params.visibility ?? "all"}
              className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
            >
              <option value="all">Tất cả</option>
              <option value="public">Public</option>
              <option value="family">Family</option>
              <option value="private">Private</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Trạng thái</span>
            <select
              name="is_living"
              defaultValue={params.is_living ?? "all"}
              className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
            >
              <option value="all">Tất cả</option>
              <option value="living">Còn sống</option>
              <option value="deceased">Đã mất</option>
            </select>
          </label>
          <div className="md:col-span-4">
            <button
              type="submit"
              className="min-h-11 border border-slate-900 bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Lọc danh sách
            </button>
          </div>
        </form>

        {params.error ? (
          <StatusCallout tone="danger" className="mt-6">
            {params.error}
          </StatusCallout>
        ) : null}

        <div className="mt-6">
          {peopleResult.ok ? (
            <PersonList
              people={peopleResult.data}
              canCreate={canCreate}
              canUpdate={canUpdate}
              canDelete={canDelete}
            />
          ) : (
            <StatusCallout tone="warning">{peopleResult.error}</StatusCallout>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
