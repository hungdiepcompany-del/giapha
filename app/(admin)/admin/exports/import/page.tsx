import Link from "next/link";

import { JsonImportPreviewForm } from "@/components/imports/json-import-preview-form";
import { AdminShell } from "@/components/layout/admin-shell";
import { getPermissionContext } from "@/lib/permissions/permission-service";

export const dynamic = "force-dynamic";

export default async function AdminImportPage() {
  const context = await getPermissionContext();
  const configMissing =
    context.reason === "missing_supabase_config" ||
    context.reason === "missing_admin_config";
  const canPreview = configMissing || context.permissions.includes("imports.create");
  const message = configMissing
    ? "Chưa cấu hình Supabase. Trang vẫn cho kiểm tra cấu trúc JSON, nhưng không kiểm tra conflict DB."
    : !context.user
      ? "Bạn cần đăng nhập để kiểm tra import."
      : "Bạn chưa có quyền imports.create.";

  return (
    <AdminShell
      userEmail={context.user?.email}
      roles={context.roles.map((role) => role.code)}
      permissions={context.permissions}
    >
      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="border-b border-slate-200 pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Import JSON foundation
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Kiểm tra backup JSON
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">
            Upload hoặc paste family.json để kiểm tra schema, quan hệ, vòng tổ
            tiên và conflict ID/slug. Phase 10 chỉ preview, không ghi dữ liệu vào
            database.
          </p>
          <Link
            href="/admin/exports"
            className="mt-4 inline-flex text-sm font-semibold text-emerald-700 underline"
          >
            Quay lại Backup / Export
          </Link>
        </div>

        {!canPreview ? (
          <div className="mt-6 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            {message}
          </div>
        ) : (
          <div className="mt-6">
            {configMissing ? (
              <div className="mb-6 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                {message}
              </div>
            ) : null}
            <JsonImportPreviewForm />
          </div>
        )}
      </section>
    </AdminShell>
  );
}
