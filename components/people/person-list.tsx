import Link from "next/link";

import { softDeletePersonAction } from "@/app/(admin)/admin/people/actions";
import { ActionLink } from "@/components/ui/action-link";
import { EmptyState } from "@/components/ui/empty-state";
import type { Person } from "@/lib/family/people-types";

type PersonListProps = {
  people: Person[];
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

function visibilityLabel(value: string) {
  if (value === "public") {
    return "Public";
  }

  if (value === "private") {
    return "Private";
  }

  return "Family";
}

export function PersonList({
  people,
  canCreate,
  canUpdate,
  canDelete,
}: PersonListProps) {
  if (people.length === 0) {
    return (
      <EmptyState
        title="Chưa có thành viên"
        description="Bắt đầu bằng cách thêm người đầu tiên, sau đó nối quan hệ cha mẹ, con hoặc vợ chồng."
        actions={
          canCreate ? (
            <ActionLink href="/admin/people/new" variant="primary">
              Thêm thành viên đầu tiên
            </ActionLink>
          ) : null
        }
      />
    );
  }

  return (
    <div className="overflow-x-auto border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[820px] border-collapse text-left text-sm">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            <th className="border-b border-slate-200 px-4 py-3">Họ tên</th>
            <th className="border-b border-slate-200 px-4 py-3">Đời</th>
            <th className="border-b border-slate-200 px-4 py-3">Chi/nhánh</th>
            <th className="border-b border-slate-200 px-4 py-3">Trạng thái</th>
            <th className="border-b border-slate-200 px-4 py-3">Visibility</th>
            <th className="border-b border-slate-200 px-4 py-3">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {people.map((person) => (
            <tr key={person.id} className="border-b border-slate-100 align-top">
              <td className="px-4 py-4">
                <div className="font-semibold text-slate-900">
                  {person.display_name || person.full_name}
                </div>
                {person.display_name ? (
                  <div className="mt-1 text-xs text-slate-500">
                    {person.full_name}
                  </div>
                ) : null}
                {person.deleted_at ? (
                  <div className="mt-2 inline-flex border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-900">
                    Đã xóa mềm
                  </div>
                ) : null}
              </td>
              <td className="px-4 py-4">{person.generation_number ?? "-"}</td>
              <td className="px-4 py-4">{person.branch_name ?? "-"}</td>
              <td className="px-4 py-4">
                {person.is_living ? "Còn sống" : "Đã mất"}
              </td>
              <td className="px-4 py-4">
                <span className="border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700">
                  {visibilityLabel(person.visibility)}
                </span>
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-3">
                  <Link
                    className="font-semibold text-emerald-700 underline"
                    href={`/admin/people/${person.id}`}
                  >
                    {canUpdate ? "Sửa" : "Xem"}
                  </Link>
                  {canDelete && !person.deleted_at ? (
                    <form action={softDeletePersonAction}>
                      <input type="hidden" name="id" value={person.id} />
                      <button
                        type="submit"
                        className="font-semibold text-red-700 underline"
                      >
                        Xóa mềm
                      </button>
                    </form>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
