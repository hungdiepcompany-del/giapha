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
      title={
        isPublic
          ? "Gia phả này chưa có thành viên."
          : "Chưa có dữ liệu cây gia phả"
      }
      description={
        isPublic
          ? "Gia phả này chưa có dữ liệu công khai. Cây công khai sẽ xuất hiện khi gia đình có thành viên và quan hệ đủ điều kiện hiển thị. Một số thông tin riêng tư có thể đã được ẩn."
          : "Hãy thêm người đầu tiên, sau đó thêm cha, thêm mẹ, thêm vợ/chồng hoặc thêm con để cây gia phả bắt đầu hình thành."
      }
      actions={
        isPublic ? (
          <ActionLink href="/" variant="primary">
            Quay về trang chủ
          </ActionLink>
        ) : (
          <>
            <ActionLink href="/admin/people/new" variant="primary">
              Thêm người đầu tiên
            </ActionLink>
            <ActionLink href="/admin/relationships" variant="primary">
              Thêm quan hệ gia đình
            </ActionLink>
          </>
        )
      }
    />
  );
}
