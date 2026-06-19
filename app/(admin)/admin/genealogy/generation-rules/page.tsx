import { AdminShell } from "@/components/layout/admin-shell";
import {
  GenerationRuleForm,
  GenerationRuleList,
} from "@/components/genealogy/lineage-admin";
import { lineageSavedMessage } from "@/components/genealogy/lineage-labels";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatusCallout } from "@/components/ui/status-callout";
import {
  listClanBranches,
  listClans,
  listGenerationRules,
} from "@/lib/family/lineage-service";
import { getPermissionContext } from "@/lib/permissions/permission-service";

export const dynamic = "force-dynamic";

type GenerationRulesPageProps = {
  searchParams: Promise<{
    error?: string;
    saved?: string;
  }>;
};

export default async function GenerationRulesPage({
  searchParams,
}: GenerationRulesPageProps) {
  const query = await searchParams;
  const context = await getPermissionContext();
  const [clans, branches, rules] = await Promise.all([
    listClans(),
    listClanBranches(),
    listGenerationRules(),
  ]);
  const canManage =
    context.permissions.includes("people.update") ||
    context.permissions.includes("relationships.update") ||
    context.permissions.includes("tree.edit_layout") ||
    context.permissions.includes("settings.manage");
  const clanData = clans.ok ? clans.data : [];
  const branchData = branches.ok ? branches.data : [];
  const ruleData = rules.ok ? rules.data : [];

  return (
    <AdminShell
      userEmail={context.user?.email}
      roles={context.roles.map((role) => role.code)}
      permissions={context.permissions}
    >
      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        <PageHeader
          eyebrow="Gia phả Việt Nam"
          title="Quy tắc đời"
          description="Ghi nhận cách đánh số đời cho toàn dòng họ hoặc từng chi. Phase này chỉ lưu metadata, không tự tính đời."
        />

        {query.error ? (
          <StatusCallout tone="danger" className="mt-6">
            {query.error}
          </StatusCallout>
        ) : null}
        {query.saved ? (
          <StatusCallout tone="success" className="mt-6">
            {lineageSavedMessage(query.saved)}
          </StatusCallout>
        ) : null}
        {[clans, branches, rules].map((result, index) =>
          result.ok ? null : (
            <StatusCallout key={index} tone="danger" className="mt-6">
              {result.error}
            </StatusCallout>
          ),
        )}

        {canManage ? (
          <SectionCard className="mt-6">
            <h2 className="text-lg font-bold text-slate-950">
              Tạo quy tắc đời
            </h2>
            {clanData.length === 0 ? (
              <StatusCallout tone="warning" className="mt-4">
                Cần tạo ít nhất một dòng họ trước khi thêm quy tắc đời.
              </StatusCallout>
            ) : null}
            <div className="mt-4">
              <GenerationRuleForm
                clans={clanData}
                branches={branchData}
                returnTo="/admin/genealogy/generation-rules"
              />
            </div>
          </SectionCard>
        ) : null}

        <div className="mt-6">
          {rules.ok ? (
            <GenerationRuleList
              rules={ruleData}
              clans={clanData}
              branches={branchData}
              returnTo="/admin/genealogy/generation-rules"
            />
          ) : null}
        </div>
      </section>
    </AdminShell>
  );
}
