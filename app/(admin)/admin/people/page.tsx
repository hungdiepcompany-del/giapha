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
          eyebrow="Hồ sơ thành viên"
          title="Thành viên"
          description="Tra cứu, lọc và mở hồ sơ từng người. Dữ liệu riêng tư và ghi chú quản trị vẫn nằm sau permission."
          actions={
            canCreate ? (
              <ActionLink href="/admin/people/new" variant="primary">
                Thêm thành viên
              </ActionLink>
            ) : null
          }
        />

        <form className="mt-6 grid gap-4 rounded-md border border-stone-200 bg-[#fffaf0] p-5 shadow-sm md:grid-cols-4">
          <div className="md:col-span-4">
            <h2 className="text-base font-bold text-stone-950">
              Lọc danh sách
            </h2>
            <p className="mt-1 text-sm leading-6 text-stone-600">
              Tìm đúng người trước khi sửa hồ sơ hoặc nối quan hệ. Nếu chưa
              chắc, hãy mở hồ sơ để đối chiếu chi nhánh, đời thứ và trạng thái
              riêng tư.
            </p>
          </div>
          <label className="block md:col-span-2">
            <span className="text-sm font-semibold text-stone-800">Tìm kiếm</span>
            <input
              name="q"
              defaultValue={params.q ?? ""}
              className="mt-1 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-950 outline-none focus:border-[#245744]"
              placeholder="Nhập họ tên hoặc tên thường gọi"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-stone-800">
              Phạm vi hiển thị
            </span>
            <select
              name="visibility"
              defaultValue={params.visibility ?? "all"}
              className="mt-1 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-950 outline-none focus:border-[#245744]"
            >
              <option value="all">Tất cả</option>
              <option value="public">Công khai</option>
              <option value="family">Nội bộ gia đình</option>
              <option value="private">Riêng tư</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-stone-800">Trạng thái</span>
            <select
              name="is_living"
              defaultValue={params.is_living ?? "all"}
              className="mt-1 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-950 outline-none focus:border-[#245744]"
            >
              <option value="all">Tất cả</option>
              <option value="living">Còn sống</option>
              <option value="deceased">Đã mất</option>
            </select>
          </label>
          <div className="flex flex-wrap gap-3 md:col-span-4">
            <button
              type="submit"
              className="min-h-11 rounded-md border border-[#245744] bg-[#245744] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1f4939]"
            >
              Lọc danh sách
            </button>
            <ActionLink href="/admin/people">
              Xóa bộ lọc
            </ActionLink>
          </div>
        </form>

        {params.error ? (
          <StatusCallout tone="danger" className="mt-6">
            Không thể hoàn tất thao tác. Hãy kiểm tra quyền và thử lại.
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
