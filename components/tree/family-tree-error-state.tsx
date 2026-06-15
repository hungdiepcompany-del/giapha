type FamilyTreeErrorStateProps = {
  message: string;
};

export function FamilyTreeErrorState({ message }: FamilyTreeErrorStateProps) {
  return (
    <div className="border border-amber-200 bg-amber-50 p-6 text-amber-900">
      <h2 className="text-lg font-bold">Không thể tải cây gia phả</h2>
      <p className="mt-2 text-sm">{message}</p>
    </div>
  );
}
