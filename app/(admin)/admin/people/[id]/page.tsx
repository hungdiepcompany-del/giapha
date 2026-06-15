import { AdminShell } from "@/components/layout/admin-shell";
import { PersonForm } from "@/components/people/person-form";
import { CoupleForm } from "@/components/relationships/couple-form";
import { RelationshipForm } from "@/components/relationships/relationship-form";
import { RelationshipSummary } from "@/components/relationships/relationship-summary";
import {
  restorePersonAction,
  softDeletePersonAction,
  updatePersonAction,
} from "@/app/(admin)/admin/people/actions";
import { getPersonById } from "@/lib/family/people-service";
import {
  getPersonRelationshipSummary,
  listRelationships,
} from "@/lib/family/relationship-service";
import { getPermissionContext } from "@/lib/permissions/permission-service";

export const dynamic = "force-dynamic";

type PersonDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
    saved?: string;
  }>;
};

export default async function PersonDetailPage({
  params,
  searchParams,
}: PersonDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const context = await getPermissionContext();
  const canView = context.permissions.includes("people.view");
  const canUpdate = context.permissions.includes("people.update");
  const canDelete = context.permissions.includes("people.delete");
  const canRestore = context.permissions.includes("people.restore");
  const canViewRelationships = context.permissions.includes("relationships.view");
  const canCreateRelationships = context.permissions.includes(
    "relationships.create",
  );
  const canDeleteRelationships = context.permissions.includes(
    "relationships.delete",
  );
  const personResult = canView
    ? await getPersonById(id)
    : {
        ok: false as const,
        error:
          context.reason === "missing_supabase_config"
            ? "Chưa cấu hình Supabase."
            : "Bạn chưa có quyền xem thành viên.",
      };
  const relationshipResult =
    personResult.ok && canViewRelationships
      ? await getPersonRelationshipSummary(id)
      : null;
  const relationshipListResult =
    personResult.ok && canCreateRelationships ? await listRelationships() : null;

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
            Chi tiết thành viên
          </h1>
        </div>

        <div className="mt-6 border border-slate-200 bg-white p-6">
          {personResult.ok ? (
            <div className="space-y-8">
              <PersonForm
                action={updatePersonAction}
                person={personResult.data}
                readOnly={!canUpdate || Boolean(personResult.data.deleted_at)}
                error={query.error}
                saved={query.saved}
                submitLabel="Lưu thay đổi"
              />

              <div className="border-t border-slate-200 pt-6">
                {!personResult.data.deleted_at && canDelete ? (
                  <form action={softDeletePersonAction} className="space-y-3">
                    <input type="hidden" name="id" value={personResult.data.id} />
                    <label className="block">
                      <span className="text-sm font-semibold text-slate-800">
                        Lý do xóa mềm
                      </span>
                      <input
                        name="delete_reason"
                        className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2"
                      />
                    </label>
                    <button
                      type="submit"
                      className="min-h-11 border border-red-700 bg-red-700 px-5 py-3 text-sm font-semibold text-white"
                    >
                      Xóa mềm
                    </button>
                  </form>
                ) : null}

                {personResult.data.deleted_at && canRestore ? (
                  <form action={restorePersonAction}>
                    <input type="hidden" name="id" value={personResult.data.id} />
                    <button
                      type="submit"
                      className="min-h-11 border border-emerald-700 bg-emerald-700 px-5 py-3 text-sm font-semibold text-white"
                    >
                      Khôi phục
                    </button>
                  </form>
                ) : null}
              </div>

              <div className="border-t border-slate-200 pt-6">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-slate-950">
                    Quan hệ gia đình
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Phase 4 lưu quan hệ ở bảng riêng, không ghi cha/mẹ/vợ/chồng
                    trực tiếp vào bảng people.
                  </p>
                </div>

                {relationshipResult?.ok ? (
                  <RelationshipSummary
                    data={relationshipResult.data}
                    canDelete={canDeleteRelationships}
                    returnTo={`/admin/people/${personResult.data.id}`}
                    contextPersonId={personResult.data.id}
                  />
                ) : (
                  <div className="border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    {relationshipResult?.error ??
                      "Bạn chưa có quyền xem quan hệ gia đình."}
                  </div>
                )}

                {canCreateRelationships && relationshipListResult?.ok ? (
                  <div className="mt-6 space-y-6">
                    <RelationshipForm
                      families={relationshipListResult.data.families}
                      contextPersonId={personResult.data.id}
                      returnTo={`/admin/people/${personResult.data.id}`}
                      mode="person"
                    />
                    <CoupleForm
                      contextPersonId={personResult.data.id}
                      returnTo={`/admin/people/${personResult.data.id}`}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="border border-amber-200 bg-amber-50 p-6 text-amber-900">
              {personResult.error}
            </div>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
