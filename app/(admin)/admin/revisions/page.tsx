import Link from "next/link";

import { AdminShell } from "@/components/layout/admin-shell";
import type { RevisionAction, RevisionListFilter } from "@/lib/family/revision-types";
import { listRevisions } from "@/lib/family/revision-service";
import { getPermissionContext } from "@/lib/permissions/permission-service";

export const dynamic = "force-dynamic";

const entityTypes = [
  "people",
  "families",
  "family_parents",
  "family_children",
  "couple_relationships",
  "tree_layouts",
  "tree_layout_nodes",
];

const actions: Array<RevisionAction | "all"> = [
  "all",
  "create",
  "update",
  "delete",
  "restore",
];

type RevisionsPageProps = {
  searchParams: Promise<{
    entity_type?: string;
    action?: string;
    entity_id?: string;
    changed_by?: string;
    changed_from?: string;
    changed_to?: string;
  }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function RevisionsPage({ searchParams }: RevisionsPageProps) {
  const params = await searchParams;
  const context = await getPermissionContext();
  const canView = context.permissions.includes("revisions.view");
  const filter: RevisionListFilter = {
    entity_type: params.entity_type,
    action: actions.includes(params.action as RevisionAction)
      ? (params.action as RevisionAction | "all")
      : "all",
    entity_id: params.entity_id,
    changed_by: params.changed_by,
    changed_from: params.changed_from,
    changed_to: params.changed_to,
  };
  const result = canView
    ? await listRevisions(filter)
    : {
        ok: false as const,
        error:
          context.reason === "missing_supabase_config"
            ? "Chưa cấu hình Supabase."
            : "Bạn chưa có quyền xem lịch sử chỉnh sửa.",
      };

  return (
    <AdminShell
      userEmail={context.user?.email}
      roles={context.roles.map((role) => role.code)}
      permissions={context.permissions}
    >
      <section className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className="border-b border-slate-200 pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Revision history foundation
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Lịch sử chỉnh sửa
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">
            Theo dõi ai đã sửa dữ liệu gia phả, sửa lúc nào và thay đổi trước/sau.
            Phase này chỉ xem lịch sử; restore thật chưa được bật.
          </p>
        </div>

        <form className="mt-6 grid gap-3 border border-slate-200 bg-white p-4 md:grid-cols-6">
          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Entity</span>
            <select
              name="entity_type"
              defaultValue={params.entity_type ?? ""}
              className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
            >
              <option value="">Tất cả</option>
              {entityTypes.map((entityType) => (
                <option key={entityType} value={entityType}>
                  {entityType}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Action</span>
            <select
              name="action"
              defaultValue={params.action ?? "all"}
              className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
            >
              {actions.map((action) => (
                <option key={action} value={action}>
                  {action === "all" ? "Tất cả" : action}
                </option>
              ))}
            </select>
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-semibold text-slate-800">Entity ID</span>
            <input
              name="entity_id"
              defaultValue={params.entity_id ?? ""}
              className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
              placeholder="UUID bản ghi"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Từ ngày</span>
            <input
              type="date"
              name="changed_from"
              defaultValue={params.changed_from ?? ""}
              className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Đến ngày</span>
            <input
              type="date"
              name="changed_to"
              defaultValue={params.changed_to ?? ""}
              className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="block md:col-span-3">
            <span className="text-sm font-semibold text-slate-800">Người sửa</span>
            <input
              name="changed_by"
              defaultValue={params.changed_by ?? ""}
              className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
              placeholder="Profile UUID"
            />
          </label>
          <div className="flex items-end md:col-span-3">
            <button
              type="submit"
              className="min-h-11 border border-slate-900 bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
            >
              Lọc lịch sử
            </button>
          </div>
        </form>

        <div className="mt-6">
          {result.ok ? (
            result.data.length > 0 ? (
              <div className="overflow-x-auto border border-slate-200 bg-white">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="px-4 py-3">Thời gian</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Entity</th>
                      <th className="px-4 py-3">Entity ID</th>
                      <th className="px-4 py-3">Người sửa</th>
                      <th className="px-4 py-3">Lý do</th>
                      <th className="px-4 py-3">Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.map((revision) => (
                      <tr key={revision.id} className="border-t border-slate-200">
                        <td className="px-4 py-3 text-slate-700">
                          {formatDate(revision.changed_at)}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-950">
                          {revision.action}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {revision.entity_type}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-700">
                          {revision.entity_id}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-700">
                          {revision.changed_by ?? "Không rõ"}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {revision.change_reason ?? "-"}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/revisions/${revision.id}`}
                            className="font-semibold text-emerald-700 underline"
                          >
                            Xem
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="border border-slate-200 bg-white p-6 text-sm text-slate-700">
                Chưa có revision phù hợp bộ lọc.
              </div>
            )
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
