import { AdminShell } from "@/components/layout/admin-shell";
import { ActionLink } from "@/components/ui/action-link";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatusCallout } from "@/components/ui/status-callout";
import { requirePermission } from "@/lib/permissions/require-permission";

export const dynamic = "force-dynamic";

const quickActions = [
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
    href: "/admin/genealogy",
    title: "Danh sách gia phả",
    description: "Quản lý dòng họ, chi nhánh, đời thứ và gán thành viên thủ công.",
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
    label: "Public/Admin",
    value: "Tách rõ",
    description: "Trang công khai chỉ đọc; thao tác quản trị nằm sau đăng nhập.",
  },
  {
    label: "Merge/dedupe",
    value: "Đang đóng",
    description: "Chưa apply DB, chưa mở runtime, chưa đăng ký permission runtime.",
  },
  {
    label: "Backup gate",
    value: "Cần evidence",
    description: "A-13B vẫn cần xác nhận backup riêng trước mọi bước DB apply.",
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
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <PageHeader
          eyebrow="Sổ quản trị gia phả"
          title="Quản trị GIA PHẢ"
          description="Điểm bắt đầu để chăm sóc hồ sơ thành viên, quan hệ, cây gia phả, lịch sử chỉnh sửa và dữ liệu xuất khẩu dài hạn. Các thao tác dữ liệu quan trọng vẫn đi qua quyền và cổng an toàn riêng."
        />

        <div className="mt-6 rounded-xl border border-amber-900/10 bg-[#fff8e8] p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-normal text-[#7a2f24]">
                Bàn việc dòng họ
              </p>
              <h2 className="mt-2 text-xl font-bold text-stone-950">
                Chào mừng trở lại. Hôm nay bạn muốn cập nhật thông tin nào?
              </h2>
              <p className="mt-2 text-sm leading-6 text-stone-700">
                Cách làm an toàn là thêm hoặc mở hồ sơ thành viên, đối chiếu
                quan hệ gia đình, rồi kiểm tra lại cây công khai để tránh lộ
                thông tin riêng tư.
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

        <div className="mt-6 grid gap-4 md:grid-cols-3">
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
                  Mở mục này
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
