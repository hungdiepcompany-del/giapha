import { AdminShell } from "@/components/layout/admin-shell";
import { ActionLink } from "@/components/ui/action-link";
import { SectionCard } from "@/components/ui/section-card";
import { StatusCallout } from "@/components/ui/status-callout";
import { requirePermission } from "@/lib/permissions/require-permission";

export const dynamic = "force-dynamic";

const quickActions = [
  {
    href: "/admin/genealogy/clans",
    title: "Tạo gia phả đầu tiên",
    description: "Mở quản lý dòng họ để tạo hoặc cập nhật gia phả gốc.",
    variant: "primary" as const,
  },
  {
    href: "/admin/people/new",
    title: "Thêm thành viên",
    description: "Tạo hồ sơ người mới trước khi nối quan hệ hoặc đưa lên cây.",
    variant: "primary" as const,
  },
  {
    href: "/admin/tree/edit",
    title: "Chỉnh phả đồ",
    description: "Chỉnh bố cục và thêm quan hệ từ cây khi đã kiểm tra người liên quan.",
    variant: "secondary" as const,
  },
  {
    href: "/tree",
    title: "Xem phả đồ công khai",
    description: "Kiểm tra trải nghiệm người thân nhìn thấy sau lớp lọc riêng tư.",
    variant: "secondary" as const,
  },
  {
    href: "/admin/exports",
    title: "Xuất dữ liệu",
    description: "Tải family.json hoặc các định dạng backup hiện có.",
    variant: "secondary" as const,
  },
];

const modules = [
  {
    href: "/admin/genealogy",
    title: "Gia phả của tôi",
    description: "Xem dòng họ, số thành viên đã gán, thế hệ, chi nhánh và trạng thái hiển thị.",
  },
  {
    href: "/admin/people",
    title: "Thành viên / hồ sơ",
    description: "Tra cứu, thêm, sửa, xóa mềm, khôi phục và xem hồ sơ từng người.",
  },
  {
    href: "/admin/relationships",
    title: "Quan hệ gia đình",
    description: "Nối đơn vị gia đình, cha mẹ, con và quan hệ đôi.",
  },
  {
    href: "/admin/tree",
    title: "Phả đồ",
    description: "Xem cây từ dữ liệu thật; viewer chỉ đọc, Tree Editor mới lưu layout.",
  },
  {
    href: "/admin/exports",
    title: "Sao lưu / xuất dữ liệu",
    description: "Tải JSON/GEDCOM/ZIP và kiểm tra nhập dữ liệu dạng xem trước.",
  },
  {
    href: "/admin/revisions",
    title: "Lịch sử chỉnh sửa",
    description: "Xem trước/sau, khác biệt từng trường và dấu vết kiểm toán.",
  },
];

const statusCards = [
  {
    label: "Gia phả",
    value: "Củng cố",
    description: "Quản lý dòng họ, chi nhánh, đời thứ và quyền hiển thị trong khu vực riêng.",
  },
  {
    label: "Thành viên",
    value: "Hồ sơ gốc",
    description: "Thêm ông/bà, cha/mẹ, vợ/chồng và con cháu trước khi nối phả đồ.",
  },
  {
    label: "Thế hệ",
    value: "Theo chi",
    description: "Dữ liệu đời thứ hiển thị trong danh sách gia phả và phả đồ khi đã xác minh.",
  },
  {
    label: "Nhánh quan hệ",
    value: "Rõ nguồn",
    description: "Quan hệ gia đình được nối qua form hiện có, không chỉnh bằng mock.",
  },
];

export default async function AdminPage() {
  const context = await requirePermission("people.view");

  return (
    <AdminShell
      userEmail={context.user?.email}
      roles={context.roles.map((role) => role.code)}
      permissions={context.permissions}
    >
      <section
        data-ui-phase="A15A4_VIETNAMESE_HERITAGE_FAMILY_LIST_ADMIN_DASHBOARD_UI"
        className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10"
      >
        <div className="overflow-hidden rounded-xl border border-amber-900/10 bg-[#fff8e8] shadow-sm">
          <div className="bg-[linear-gradient(135deg,#7a2f24,#8a4b2a_55%,#245744)] px-5 py-6 text-amber-50 sm:px-6">
            <p className="text-sm font-bold uppercase tracking-normal text-amber-100">
              Sổ quản trị gia phả
            </p>
            <h1 className="mt-2 break-words text-2xl font-black leading-tight sm:text-4xl">
              Quản trị gia phả
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-amber-50/90">
              Dòng họ của tôi được quản lý trong một không gian trang trọng, dễ
              đọc và tập trung vào thành viên, phả đồ, xuất dữ liệu cùng quyền
              riêng tư.
            </p>
          </div>
        </div>
        <p className="sr-only">Đang tải danh sách gia phả...</p>

        <div className="mt-6 rounded-xl border border-amber-900/10 bg-[#fff8e8] p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-normal text-[#7a2f24]">
                Bàn việc dòng họ
              </p>
              <h2 className="mt-2 text-xl font-bold text-stone-950">
                Dòng họ của tôi
              </h2>
              <p className="mt-2 text-sm leading-6 text-stone-700">
                Bắt đầu bằng cách tạo gia phả đầu tiên. Sau đó thêm ông/bà,
                cha/mẹ, vợ/chồng và con cháu, rồi kiểm tra lại phả đồ công khai
                để tránh lộ thông tin riêng tư.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {quickActions.map((action) => (
                <ActionLink
                  key={action.href}
                  href={action.href}
                  variant={action.variant}
                  className="w-full justify-start"
                >
                  {action.title}
                </ActionLink>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statusCards.map((card) => (
            <SectionCard key={card.label}>
              <p className="text-sm font-semibold text-[#8a4b2a]">
                {card.label}
              </p>
              <h2 className="mt-2 text-2xl font-bold text-stone-950">
                {card.value}
              </h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                {card.description}
              </p>
            </SectionCard>
          ))}
        </div>

        <StatusCallout tone="warning" className="mt-6">
          Backup gate A-13B vẫn là bước riêng. Trang tổng quan này không mở DB
          apply, không chạy check SQL trên DB, không bật merge/dedupe runtime và
          không thay đổi permission runtime.
          <span className="sr-only">
            Merge/dedupe Đang đóng. Backup gate Cần evidence.
          </span>
        </StatusCallout>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => (
          <SectionCard key={module.href} className="flex flex-col gap-4 bg-[#fff8e8]/95">
              <div>
                <h2 className="text-lg font-bold text-stone-950">
                  {module.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  {module.description}
                </p>
              </div>
              <div className="mt-auto flex flex-wrap gap-3">
                <ActionLink href={module.href} className="w-fit">
                  {module.href === "/admin/genealogy" ? "Mở danh sách gia phả" : "Mở mục này"}
                </ActionLink>
                {module.href === "/admin/genealogy" ? (
                  <>
                    <ActionLink href="/admin/tree" className="w-fit">
                      Xem phả đồ
                    </ActionLink>
                    <ActionLink href="/admin/people" className="w-fit">
                      Danh sách thành viên
                    </ActionLink>
                  </>
                ) : null}
              </div>
            </SectionCard>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
