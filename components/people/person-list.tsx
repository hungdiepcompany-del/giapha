import Link from "next/link";

import type { Person } from "@/lib/family/people-types";
import { softDeletePersonAction } from "@/app/(admin)/admin/people/actions";

type PersonListProps = {
  people: Person[];
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

export function PersonList({
  people,
  canCreate,
  canUpdate,
  canDelete,
}: PersonListProps) {
  if (people.length === 0) {
    return (
      <div className="border border-slate-200 bg-white p-6 text-slate-700">
        <p>Chưa có thành viên nào.</p>
        {canCreate ? (
          <Link className="mt-4 inline-flex font-semibold underline" href="/admin/people/new">
            Thêm thành viên đầu tiên
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-slate-200 bg-white">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-slate-700">
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
            <tr key={person.id} className="border-b border-slate-100">
              <td className="px-4 py-3">
                <div className="font-semibold text-slate-900">
                  {person.display_name || person.full_name}
                </div>
                {person.display_name ? (
                  <div className="text-xs text-slate-500">{person.full_name}</div>
                ) : null}
              </td>
              <td className="px-4 py-3">{person.generation_number ?? "-"}</td>
              <td className="px-4 py-3">{person.branch_name ?? "-"}</td>
              <td className="px-4 py-3">
                {person.is_living ? "Còn sống" : "Đã mất"}
              </td>
              <td className="px-4 py-3">{person.visibility}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-3">
                  <Link className="font-semibold underline" href={`/admin/people/${person.id}`}>
                    {canUpdate ? "Sửa" : "Xem"}
                  </Link>
                  {canDelete && !person.deleted_at ? (
                    <form action={softDeletePersonAction}>
                      <input type="hidden" name="id" value={person.id} />
                      <button type="submit" className="font-semibold text-red-700 underline">
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

