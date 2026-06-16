import { ActionLink } from "@/components/ui/action-link";
import { EmptyState } from "@/components/ui/empty-state";

export function FamilyTreeEmptyState() {
  return (
    <EmptyState
      title="Chưa có dữ liệu cây"
      description="Cây sẽ xuất hiện sau khi có thành viên và quan hệ gia đình chưa bị xóa mềm."
      actions={
        <>
          <ActionLink href="/admin/people">Mở thành viên</ActionLink>
          <ActionLink href="/admin/relationships" variant="primary">
            Mở quan hệ gia đình
          </ActionLink>
        </>
      }
    />
  );
}
