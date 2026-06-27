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
    return "Công khai";
  }

  if (value === "private") {
    return "Riêng tư";
  }

  return "Nội bộ gia đình";
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
        description="Bắt đầu bằng cách thêm người đầu tiên, sau đó nối quan hệ cha mẹ, con hoặc vợ chồng. Trang công khai sẽ chỉ hiển thị dữ liệu được phép."
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
    <div className="grid gap-4">
      <div className="rounded-md border border-stone-200 bg-[#fffaf0] px-4 py-3 text-sm text-stone-700 shadow-sm">
        Đang hiển thị{" "}
        <span className="font-bold text-stone-950">{people.length}</span> thành
        viên. Mở hồ sơ trước khi sửa để tránh thay đổi nhầm thông tin gia phả.
      </div>

      <div className="grid gap-3 md:hidden">
        {people.map((person) => (
          <article
            key={person.id}
            className="rounded-md border border-stone-200 bg-[#fffaf0] p-4 shadow-sm"
          >
            <div className="font-bold text-stone-950">
              {person.display_name || person.full_name}
            </div>
            {person.display_name ? (
              <div className="mt-1 text-sm text-stone-500">
                {person.full_name}
              </div>
            ) : null}
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm text-stone-700">
              <div>
                <dt className="font-semibold text-stone-800">Đời</dt>
                <dd>{person.generation_number ?? "Chưa rõ"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-stone-800">Trạng thái</dt>
                <dd>{person.is_living ? "Còn sống" : "Đã mất"}</dd>
              </div>
              <div className="col-span-2">
                <dt className="font-semibold text-stone-800">Chi/nhánh</dt>
                <dd>{person.branch_name ?? "Chưa rõ"}</dd>
              </div>
              <div className="col-span-2">
                <dt className="font-semibold text-stone-800">
                  Phạm vi hiển thị
                </dt>
                <dd>{visibilityLabel(person.visibility)}</dd>
              </div>
            </dl>
            {person.deleted_at ? (
              <div className="mt-3 inline-flex rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-900">
                Đã xóa mềm
              </div>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                className="inline-flex min-h-10 items-center rounded-md border border-[#245744] bg-white px-3 py-2 text-sm font-semibold text-[#245744]"
                href={`/admin/people/${person.id}`}
              >
                {canUpdate ? "Sửa hồ sơ" : "Xem hồ sơ"}
              </Link>
              {canDelete && !person.deleted_at ? (
                <form action={softDeletePersonAction}>
                  <input type="hidden" name="id" value={person.id} />
                  <button
                    type="submit"
                    aria-label={`Xóa mềm hồ sơ ${person.display_name || person.full_name}`}
                    className="inline-flex min-h-10 items-center rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700"
                  >
                    Xóa mềm
                  </button>
                </form>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-md border border-stone-200 bg-white shadow-sm md:block">
        <table className="w-full min-w-[820px] border-collapse text-left text-sm">
          <thead className="bg-[#f6efe2] text-stone-700">
            <tr>
              <th className="border-b border-stone-200 px-4 py-3">Họ tên</th>
              <th className="border-b border-stone-200 px-4 py-3">Đời</th>
              <th className="border-b border-stone-200 px-4 py-3">Chi/nhánh</th>
              <th className="border-b border-stone-200 px-4 py-3">Trạng thái</th>
              <th className="border-b border-stone-200 px-4 py-3">
                Phạm vi hiển thị
              </th>
              <th className="border-b border-stone-200 px-4 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {people.map((person) => (
              <tr
                key={person.id}
                className="border-b border-stone-100 align-top last:border-b-0"
              >
                <td className="px-4 py-4">
                  <div className="font-semibold text-stone-900">
                    {person.display_name || person.full_name}
                  </div>
                  {person.display_name ? (
                    <div className="mt-1 text-xs text-stone-500">
                      {person.full_name}
                    </div>
                  ) : null}
                  {person.deleted_at ? (
                    <div className="mt-2 inline-flex rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-900">
                      Đã xóa mềm
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-4">
                  {person.generation_number ?? "Chưa rõ"}
                </td>
                <td className="px-4 py-4">{person.branch_name ?? "Chưa rõ"}</td>
                <td className="px-4 py-4">
                  {person.is_living ? "Còn sống" : "Đã mất"}
                </td>
                <td className="px-4 py-4">
                  <span className="rounded-md border border-stone-200 bg-[#fffaf0] px-2 py-1 text-xs font-semibold text-stone-700">
                    {visibilityLabel(person.visibility)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      className="font-semibold text-[#245744] underline"
                      href={`/admin/people/${person.id}`}
                    >
                      {canUpdate ? "Sửa hồ sơ" : "Xem hồ sơ"}
                    </Link>
                    {canDelete && !person.deleted_at ? (
                      <form action={softDeletePersonAction}>
                        <input type="hidden" name="id" value={person.id} />
                        <button
                          type="submit"
                          aria-label={`Xóa mềm hồ sơ ${person.display_name || person.full_name}`}
                          className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700"
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
    </div>
  );
}
