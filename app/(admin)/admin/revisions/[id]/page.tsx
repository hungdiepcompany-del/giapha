import Link from "next/link";

import { AdminShell } from "@/components/layout/admin-shell";
import { formatRevisionValue } from "@/lib/family/revision-diff";
import { getRevisionDetail } from "@/lib/family/revision-service";
import { getPermissionContext } from "@/lib/permissions/permission-service";

export const dynamic = "force-dynamic";

type RevisionDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function relatedEntityHref(entityType: string, entityId: string) {
  if (entityType === "people") {
    return `/admin/people/${entityId}`;
  }

  if (
    entityType === "families" ||
    entityType === "family_parents" ||
    entityType === "family_children" ||
    entityType === "couple_relationships"
  ) {
    return "/admin/relationships";
  }

  if (entityType === "tree_layouts" || entityType === "tree_layout_nodes") {
    return "/admin/tree/edit";
  }

  return null;
}

function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap border border-slate-200 bg-slate-950 p-4 text-xs leading-5 text-slate-100">
      {formatRevisionValue(value)}
    </pre>
  );
}

export default async function RevisionDetailPage({
  params,
}: RevisionDetailPageProps) {
  const { id } = await params;
  const context = await getPermissionContext();
  const canView = context.permissions.includes("revisions.view");
  const result = canView
    ? await getRevisionDetail(id)
    : {
        ok: false as const,
        error:
          context.reason === "missing_supabase_config"
            ? "Chưa cấu hình Supabase."
            : "Bạn chưa có quyền xem revision.",
      };

  return (
    <AdminShell
      userEmail={context.user?.email}
      roles={context.roles.map((role) => role.code)}
      permissions={context.permissions}
    >
      <section className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Revision detail
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              Chi tiết revision
            </h1>
          </div>
          <Link
            href="/admin/revisions"
            className="inline-flex min-h-11 items-center border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900"
          >
            Quay lại lịch sử
          </Link>
        </div>

        <div className="mt-6">
          {result.ok ? (
            <div className="space-y-6">
              <div className="grid gap-4 border border-slate-200 bg-white p-5 text-sm text-slate-700 md:grid-cols-3">
                <div>
                  <div className="font-bold text-slate-950">Thời gian</div>
                  <div className="mt-1">{formatDate(result.data.revision.changed_at)}</div>
                </div>
                <div>
                  <div className="font-bold text-slate-950">Action</div>
                  <div className="mt-1">{result.data.revision.action}</div>
                </div>
                <div>
                  <div className="font-bold text-slate-950">Entity</div>
                  <div className="mt-1">{result.data.revision.entity_type}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="font-bold text-slate-950">Entity ID</div>
                  <div className="mt-1 font-mono text-xs">
                    {result.data.revision.entity_id}
                  </div>
                </div>
                <div>
                  <div className="font-bold text-slate-950">Người sửa</div>
                  <div className="mt-1 font-mono text-xs">
                    {result.data.revision.changed_by ?? "Không rõ"}
                  </div>
                </div>
                <div className="md:col-span-3">
                  <div className="font-bold text-slate-950">Lý do</div>
                  <div className="mt-1">
                    {result.data.revision.change_reason ?? "Không có"}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {relatedEntityHref(
                  result.data.revision.entity_type,
                  result.data.revision.entity_id,
                ) ? (
                  <Link
                    href={
                      relatedEntityHref(
                        result.data.revision.entity_type,
                        result.data.revision.entity_id,
                      ) ?? "/admin/revisions"
                    }
                    className="inline-flex min-h-11 items-center border border-slate-900 bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
                  >
                    Mở entity liên quan
                  </Link>
                ) : null}
                <button
                  type="button"
                  disabled
                  className="inline-flex min-h-11 cursor-not-allowed items-center border border-slate-300 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-500"
                >
                  Khôi phục chưa bật
                </button>
              </div>

              {result.data.can_restore ? (
                <div className="border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  Bạn có quyền `revisions.restore`, nhưng Phase 9 chỉ bật
                  placeholder. Restore thật cần transaction, validation và ghi
                  revision mới ở phase sau.
                </div>
              ) : (
                <div className="border border-slate-200 bg-white p-4 text-sm text-slate-700">
                  Restore thật chưa được bật trong Phase 9.
                </div>
              )}

              <div className="border border-slate-200 bg-white p-5">
                <h2 className="text-xl font-bold text-slate-950">Diff field</h2>
                {result.data.diff.length > 0 ? (
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead className="bg-slate-100 text-slate-700">
                        <tr>
                          <th className="px-4 py-3">Field</th>
                          <th className="px-4 py-3">Before</th>
                          <th className="px-4 py-3">After</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.data.diff.map((field) => (
                          <tr
                            key={field.field_name}
                            className="border-t border-slate-200 align-top"
                          >
                            <td className="px-4 py-3 font-semibold text-slate-950">
                              {field.field_name}
                            </td>
                            <td className="max-w-sm px-4 py-3 font-mono text-xs text-slate-700">
                              <pre className="whitespace-pre-wrap">
                                {formatRevisionValue(field.old_value)}
                              </pre>
                            </td>
                            <td className="max-w-sm px-4 py-3 font-mono text-xs text-slate-700">
                              <pre className="whitespace-pre-wrap">
                                {formatRevisionValue(field.new_value)}
                              </pre>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-700">
                    Không có field thay đổi hoặc JSON không đủ dữ liệu để so sánh.
                  </p>
                )}
              </div>

              {result.data.items.length > 0 ? (
                <div className="border border-slate-200 bg-white p-5">
                  <h2 className="text-xl font-bold text-slate-950">
                    Revision items
                  </h2>
                  <div className="mt-4 grid gap-3">
                    {result.data.items.map((item) => (
                      <div key={item.id} className="border border-slate-200 p-4">
                        <div className="text-sm font-bold text-slate-950">
                          {item.field_name ?? "entity"}
                        </div>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          <JsonBlock value={item.before_json} />
                          <JsonBlock value={item.after_json} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h2 className="mb-3 text-xl font-bold text-slate-950">
                    Before JSON
                  </h2>
                  <JsonBlock value={result.data.revision.before_json} />
                </div>
                <div>
                  <h2 className="mb-3 text-xl font-bold text-slate-950">
                    After JSON
                  </h2>
                  <JsonBlock value={result.data.revision.after_json} />
                </div>
              </div>
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
