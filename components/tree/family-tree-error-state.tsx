type FamilyTreeErrorStateProps = {
  message: string;
};

function safeTreeErrorMessage(message: string) {
  if (!message.trim()) {
    return "Không tìm thấy gia phả được yêu cầu hoặc bạn chưa có quyền xem.";
  }

  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("permission") ||
    lowerMessage.includes("policy") ||
    lowerMessage.includes("unauthorized")
  ) {
    return "Gia phả này đang được giới hạn quyền xem. Bạn chưa có quyền xem cây gia phả này.";
  }

  if (
    lowerMessage.includes("supabase") ||
    lowerMessage.includes("relation") ||
    lowerMessage.includes("sql") ||
    lowerMessage.includes("database")
  ) {
    return "Cây gia phả chưa sẵn sàng hiển thị. Gia đình có thể đang cập nhật dữ liệu hoặc quyền xem.";
  }

  return message;
}

export function FamilyTreeErrorState({ message }: FamilyTreeErrorStateProps) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
      <h2 className="text-lg font-bold">Không thể tải phả đồ</h2>
      <p className="mt-2 text-sm font-semibold leading-6">
        Không thể tải phả đồ. Vui lòng thử lại sau.
      </p>
      <p className="mt-2 text-sm leading-6">{safeTreeErrorMessage(message)}</p>
      <p className="mt-3 text-sm leading-6">
        Không thể tải cây gia phả theo cách xem hiện tại. Hãy thử tải lại trang
        hoặc quay về trang trước. Nếu bạn cần xem dữ liệu gia đình nội bộ, hãy
        liên hệ người quản trị gia phả để được cấp quyền.
      </p>
    </div>
  );
}
