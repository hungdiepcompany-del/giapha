import { ActionLink } from "@/components/ui/action-link";
import { EmptyState } from "@/components/ui/empty-state";

type FamilyTreeEmptyStateProps = {
  mode?: "admin" | "public";
};

export function FamilyTreeEmptyState({
  mode = "admin",
}: FamilyTreeEmptyStateProps) {
  const isPublic = mode === "public";

  return (
    <EmptyState
      title="Chưa có dữ liệu cây gia phả"
      description={
        isPublic
          ? "Cây công khai sẽ xuất hiện khi gia đình có thành viên và quan hệ đủ điều kiện hiển thị. Một số thông tin riêng tư có thể đã được ẩn."
          : "Cây sẽ xuất hiện khi có thành viên và quan hệ gia đình đủ điều kiện hiển thị."
      }
      actions={
        isPublic ? (
          <ActionLink href="/" variant="primary">
            Quay về trang chủ
          </ActionLink>
        ) : (
          <>
            <ActionLink href="/admin/people">Mở thành viên</ActionLink>
            <ActionLink href="/admin/relationships" variant="primary">
              Mở quan hệ gia đình
            </ActionLink>
          </>
        )
      }
    />
  );
}
