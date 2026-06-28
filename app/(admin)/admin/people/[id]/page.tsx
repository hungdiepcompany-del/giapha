import Link from "next/link";
import type { ReactNode } from "react";

import { AdminShell } from "@/components/layout/admin-shell";
import {
  MembershipForm,
  MembershipSummary,
} from "@/components/genealogy/lineage-admin";
import { AdminWarningList } from "@/components/genealogy/admin-warning-list";
import { PersonForm } from "@/components/people/person-form";
import { CoupleForm } from "@/components/relationships/couple-form";
import { RelationshipForm } from "@/components/relationships/relationship-form";
import { RelationshipSummary } from "@/components/relationships/relationship-summary";
import {
  restorePersonAction,
  softDeletePersonAction,
  updatePersonAction,
} from "@/app/(admin)/admin/people/actions";
import {
  listClanBranches,
  listClans,
  listGenerationRules,
  listPersonBranchMemberships,
} from "@/lib/family/lineage-service";
import { getPersonInlineWarnings } from "@/lib/family/inline-warning-rules";
import { getPersonById, listPeople } from "@/lib/family/people-service";
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

const PHASE_MARKER = "A15A5_MEMBER_PROFILE_PERSON_DETAIL_VIETNAMESE_HERITAGE_UI";

function valueOrMissing(value: string | number | null | undefined) {
  return value || "Chưa cập nhật";
}

function formatDate(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "Chưa cập nhật";
}

function visibilityLabel(value: string | null | undefined) {
  if (value === "public") return "Công khai";
  if (value === "family") return "Nội bộ gia đình";
  if (value === "private") return "Riêng tư";
  return "Chưa cập nhật";
}

function genderLabel(value: string | null | undefined) {
  if (value === "male") return "Nam";
  if (value === "female") return "Nữ";
  if (value === "other") return "Khác";
  return "Chưa rõ";
}

function InfoTile({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="rounded-lg border border-amber-900/10 bg-white/75 px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
        {label}
      </dt>
      <dd className="mt-1 break-words text-base font-bold text-stone-950">
        {valueOrMissing(value)}
      </dd>
    </div>
  );
}

function AdminPanel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-amber-900/10 bg-[#fff8e8] p-4 shadow-sm sm:p-5">
      <div>
        <h2 className="text-xl font-bold text-stone-950">{title}</h2>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
        ) : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

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
  const canViewRevisions = context.permissions.includes("revisions.view");
  const canViewRelationships = context.permissions.includes("relationships.view");
  const canViewLineage =
    context.permissions.includes("people.view") ||
    context.permissions.includes("tree.view");
  const canManageLineage =
    context.permissions.includes("people.update") ||
    context.permissions.includes("relationships.update") ||
    context.permissions.includes("tree.edit_layout") ||
    context.permissions.includes("settings.manage");
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
  const relationshipPeopleResult =
    personResult.ok && canCreateRelationships ? await listPeople() : null;
  const lineageResult =
    personResult.ok && canViewLineage
      ? await Promise.all([
          listClans(),
          listClanBranches(),
          listGenerationRules(),
          listPersonBranchMemberships(id),
        ])
      : null;
  const [clansResult, branchesResult, rulesResult, membershipsResult] =
    lineageResult ?? [null, null, null, null];
  const lineageError =
    clansResult && !clansResult.ok
      ? clansResult.error
      : branchesResult && !branchesResult.ok
        ? branchesResult.error
        : membershipsResult && !membershipsResult.ok
          ? membershipsResult.error
          : "Bạn cần quyền people.view hoặc tree.view để xem dữ liệu dòng họ/chi.";
  const inlineWarnings =
    personResult.ok &&
    branchesResult?.ok &&
    rulesResult?.ok &&
    membershipsResult?.ok
      ? getPersonInlineWarnings({
          person: personResult.data,
          memberships: membershipsResult.data,
          branches: branchesResult.data,
          generationRules: rulesResult.data,
        })
      : [];

  return (
    <AdminShell
      userEmail={context.user?.email}
      roles={context.roles.map((role) => role.code)}
      permissions={context.permissions}
    >
      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <span className="sr-only">{PHASE_MARKER}</span>
        <span className="sr-only">Đang tải hồ sơ thành viên</span>
        <div className="rounded-2xl border border-amber-900/10 bg-[#fff8e8] p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#245744]">
                Hồ sơ thành viên
              </p>
              <h1 className="mt-2 text-3xl font-bold text-stone-950">
                {personResult.ok
                  ? personResult.data.display_name ||
                    personResult.data.full_name
                  : "Không tìm thấy thành viên"}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">
                Xem và chỉnh sửa thông tin từng người trong gia phả. Quan hệ gia
                đình, dòng họ và ghi chú riêng tư vẫn đi qua quyền hiện có.
              </p>
            </div>
            <div className="grid gap-2 sm:flex sm:flex-wrap">
              <Link
                href="/admin/people"
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-[#245744]"
              >
                Danh sách thành viên
              </Link>
              <Link
                href="/admin/tree/edit"
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#245744] bg-[#245744] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1f4939]"
              >
                Xem trong phả đồ
              </Link>
              {canCreateRelationships ? (
                <Link
                  href="/admin/relationships"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#7f1d1d] bg-[#7f1d1d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6f1a1a]"
                >
                  Thêm quan hệ
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-6">
          {personResult.ok ? (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-6">
                <AdminPanel
                  title="Thông tin cơ bản"
                  description="Các trường chính của hồ sơ thành viên. Dữ liệu này được dùng cho danh sách, phả đồ và hồ sơ công khai theo phạm vi riêng tư."
                >
                  <PersonForm
                    action={updatePersonAction}
                    person={personResult.data}
                    readOnly={!canUpdate || Boolean(personResult.data.deleted_at)}
                    error={query.error}
                    saved={query.saved}
                    submitLabel="Cập nhật thông tin"
                    cancelHref={`/admin/people/${personResult.data.id}`}
                  />
                </AdminPanel>

                <AdminPanel
                  title="Dòng họ và chi"
                  description="Thông tin gắn dòng họ/chi được lưu riêng, không tự backfill từ trường legacy của people."
                >
                  {clansResult?.ok &&
                  branchesResult?.ok &&
                  membershipsResult?.ok ? (
                    <MembershipSummary
                      memberships={membershipsResult.data}
                      clans={clansResult.data}
                      branches={branchesResult.data}
                    />
                  ) : (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                      {lineageError}
                    </div>
                  )}

                  {canManageLineage &&
                  clansResult?.ok &&
                  branchesResult?.ok &&
                  rulesResult?.ok ? (
                    <div className="mt-5 rounded-xl border border-amber-900/10 bg-white/70 p-4">
                      <h3 className="text-base font-bold text-stone-950">
                        Gán dòng họ / chi
                      </h3>
                      {clansResult.data.length === 0 ? (
                        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                          Cần tạo dòng họ trước khi gán thành viên này vào dòng
                          họ/chi.
                        </div>
                      ) : null}
                      <div className="mt-4">
                        <MembershipForm
                          personId={personResult.data.id}
                          clans={clansResult.data}
                          branches={branchesResult.data}
                          generationRules={rulesResult.data}
                          returnTo={`/admin/people/${personResult.data.id}`}
                        />
                      </div>
                    </div>
                  ) : null}
                </AdminPanel>

                <AdminPanel
                  title="Gia đình & quan hệ"
                  description="Thêm cha, thêm mẹ, thêm vợ/chồng hoặc thêm con bằng các form quan hệ hiện có. Trước khi xóa quan hệ, hãy đối chiếu lại trên phả đồ."
                >
                  {relationshipResult?.ok ? (
                    <RelationshipSummary
                      data={relationshipResult.data}
                      canDelete={canDeleteRelationships}
                      returnTo={`/admin/people/${personResult.data.id}`}
                      contextPersonId={personResult.data.id}
                    />
                  ) : (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                      {relationshipResult?.error ??
                        "Bạn chưa có quyền xem quan hệ gia đình."}
                    </div>
                  )}

                  {canCreateRelationships && relationshipListResult?.ok ? (
                    <div className="mt-6 space-y-6">
                      <div className="rounded-xl border border-amber-900/10 bg-white/70 p-4">
                        <h3 className="text-base font-bold text-stone-950">
                          Thêm cha / mẹ / con
                        </h3>
                        <div className="mt-4">
                          <RelationshipForm
                            families={relationshipListResult.data.families}
                            people={
                              relationshipPeopleResult?.ok
                                ? relationshipPeopleResult.data
                                : []
                            }
                            contextPersonId={personResult.data.id}
                            returnTo={`/admin/people/${personResult.data.id}`}
                            mode="person"
                          />
                        </div>
                      </div>
                      <div className="rounded-xl border border-amber-900/10 bg-white/70 p-4">
                        <h3 className="text-base font-bold text-stone-950">
                          Thêm vợ/chồng
                        </h3>
                        <div className="mt-4">
                          <CoupleForm
                            people={
                              relationshipPeopleResult?.ok
                                ? relationshipPeopleResult.data
                                : []
                            }
                            contextPersonId={personResult.data.id}
                            returnTo={`/admin/people/${personResult.data.id}`}
                          />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </AdminPanel>
              </div>

              <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
                <AdminPanel title="Tóm tắt hồ sơ">
                  <dl className="grid gap-3">
                    <InfoTile
                      label="Họ tên"
                      value={personResult.data.full_name}
                    />
                    <InfoTile
                      label="Tên hiển thị"
                      value={personResult.data.display_name}
                    />
                    <InfoTile
                      label="Giới tính"
                      value={genderLabel(personResult.data.gender)}
                    />
                    <InfoTile
                      label="Trạng thái"
                      value={personResult.data.is_living ? "Còn sống" : "Đã mất"}
                    />
                    <InfoTile
                      label="Ngày sinh"
                      value={formatDate(personResult.data.birth_date)}
                    />
                    <InfoTile
                      label="Ngày mất"
                      value={formatDate(personResult.data.death_date)}
                    />
                    <InfoTile
                      label="Đời / thế hệ"
                      value={
                        personResult.data.generation_number
                          ? `Đời thứ ${personResult.data.generation_number}`
                          : null
                      }
                    />
                    <InfoTile
                      label="Phạm vi"
                      value={visibilityLabel(personResult.data.visibility)}
                    />
                  </dl>
                </AdminPanel>

                <AdminWarningList
                  warnings={inlineWarnings}
                  title="Cảnh báo hồ sơ đang xem"
                />

                <AdminPanel
                  title="Lịch sử & an toàn"
                  description="Kiểm tra revision trước khi sửa lớn, và chỉ xóa mềm khi gia đình đã xác nhận."
                >
                  <div className="grid gap-3">
                    {canViewRevisions ? (
                      <Link
                        href={`/admin/revisions?entity_type=people&entity_id=${personResult.data.id}`}
                        className="inline-flex min-h-11 items-center justify-center rounded-lg border border-stone-900 bg-stone-900 px-4 py-2 text-sm font-semibold text-white"
                      >
                        Mở lịch sử chỉnh sửa
                      </Link>
                    ) : null}

                    {!personResult.data.deleted_at && canDelete ? (
                      <form
                        action={softDeletePersonAction}
                        className="rounded-xl border border-red-200 bg-red-50 p-4"
                      >
                        <input
                          type="hidden"
                          name="id"
                          value={personResult.data.id}
                        />
                        <label className="block">
                          <span className="text-sm font-semibold text-red-900">
                            Lý do xóa mềm
                          </span>
                          <input
                            name="delete_reason"
                            className="mt-1 min-h-11 w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-stone-950"
                            placeholder="Ghi rõ lý do để người sau hiểu"
                          />
                        </label>
                        <button
                          type="submit"
                          className="mt-3 min-h-11 rounded-lg border border-red-700 bg-red-700 px-5 py-3 text-sm font-semibold text-white"
                        >
                          Xóa mềm hồ sơ
                        </button>
                      </form>
                    ) : null}

                    {personResult.data.deleted_at && canRestore ? (
                      <form action={restorePersonAction}>
                        <input
                          type="hidden"
                          name="id"
                          value={personResult.data.id}
                        />
                        <button
                          type="submit"
                          className="min-h-11 rounded-lg border border-emerald-700 bg-emerald-700 px-5 py-3 text-sm font-semibold text-white"
                        >
                          Khôi phục hồ sơ
                        </button>
                      </form>
                    ) : null}
                  </div>
                </AdminPanel>
              </aside>
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950 shadow-sm">
              <h2 className="text-xl font-bold">Không tìm thấy thành viên</h2>
              <p className="mt-2 text-sm leading-6">
                {personResult.error} Hồ sơ có thể không tồn tại, đã bị ẩn, hoặc
                tài khoản hiện tại chưa có quyền xem.
              </p>
              <div className="mt-4">
                <Link
                  href="/admin/people"
                  className="inline-flex min-h-11 items-center rounded-lg border border-[#245744] bg-[#245744] px-5 py-3 text-sm font-semibold text-white"
                >
                  Quay lại danh sách thành viên
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
