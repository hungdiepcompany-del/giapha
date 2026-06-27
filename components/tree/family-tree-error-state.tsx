type FamilyTreeErrorStateProps = {
  message: string;
};

export function FamilyTreeErrorState({ message }: FamilyTreeErrorStateProps) {
  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 p-6 text-amber-900">
      <h2 className="text-lg font-bold">Không thể tải cây gia phả</h2>
      <p className="mt-2 text-sm leading-6">
        {message || "Không tìm thấy gia phả được yêu cầu hoặc bạn chưa có quyền xem."}
      </p>
      <p className="mt-3 text-sm leading-6">
        Hãy quay lại trang công khai hoặc liên hệ người quản trị gia đình nếu
        bạn cho rằng mình cần được cấp quyền.
      </p>
    </div>
  );
}
