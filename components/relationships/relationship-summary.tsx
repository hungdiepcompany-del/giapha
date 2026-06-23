import {
  softDeleteCoupleRelationshipAction,
  softDeleteFamilyAction,
  softDeleteFamilyChildAction,
  softDeleteFamilyParentAction,
} from "@/app/(admin)/admin/relationships/actions";
import { EmptyState } from "@/components/ui/empty-state";
import type {
  FamilyChild,
  FamilyParent,
  FamilyWithMembers,
  PersonRelationshipSummary,
  RelationshipList,
} from "@/lib/family/relationship-types";

type RelationshipSummaryProps = {
  data: RelationshipList | PersonRelationshipSummary;
  canDelete: boolean;
  returnTo: string;
  contextPersonId?: string;
};

function personName(row: FamilyParent | FamilyChild) {
  return row.person?.display_name || row.person?.full_name || row.person_id;
}

const visibilityLabels: Record<string, string> = {
  family: "Nội bộ gia đình",
  private: "Riêng tư",
  public: "Công khai",
};

function DeleteButton({
  id,
  action,
  returnTo,
  contextPersonId,
  label,
}: {
  id: string;
  action: (formData: FormData) => void | Promise<void>;
  returnTo: string;
  contextPersonId?: string;
  label: string;
}) {
  return (
    <form action={action} className="inline">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="return_to" value={returnTo} />
      {contextPersonId ? (
        <input type="hidden" name="context_person_id" value={contextPersonId} />
      ) : null}
      <button type="submit" className="font-semibold text-red-700 underline">
        {label}
      </button>
    </form>
  );
}

function FamilyBlock({
  family,
  canDelete,
  returnTo,
  contextPersonId,
}: {
  family: FamilyWithMembers;
  canDelete: boolean;
  returnTo: string;
  contextPersonId?: string;
}) {
  return (
    <article className="border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-950">
            {family.family_label || family.family_code || family.id}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Phạm vi hiển thị: {visibilityLabels[family.visibility]}
          </p>
        </div>
        {canDelete ? (
          <DeleteButton
            id={family.id}
            action={softDeleteFamilyAction}
            returnTo={returnTo}
            contextPersonId={contextPersonId}
            label="Xóa mềm gia đình"
          />
        ) : null}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <h4 className="text-sm font-semibold text-slate-800">Cha/mẹ</h4>
          <ul className="mt-2 space-y-2 text-sm text-slate-700">
            {family.parents.length > 0 ? (
              family.parents.map((parent) => (
                <li key={parent.id} className="flex flex-wrap items-center gap-2">
                  <span>{personName(parent)}</span>
                  <span className="text-slate-500">
                    ({parent.parent_role}, {parent.relationship_type})
                  </span>
                  {canDelete ? (
                    <DeleteButton
                      id={parent.id}
                      action={softDeleteFamilyParentAction}
                      returnTo={returnTo}
                      contextPersonId={contextPersonId}
                      label="Xóa"
                    />
                  ) : null}
                </li>
              ))
            ) : (
              <li>Chưa có cha/mẹ.</li>
            )}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-800">Con</h4>
          <ul className="mt-2 space-y-2 text-sm text-slate-700">
            {family.children.length > 0 ? (
              family.children.map((child) => (
                <li key={child.id} className="flex flex-wrap items-center gap-2">
                  <span>{personName(child)}</span>
                  <span className="text-slate-500">
                    ({child.child_relationship_type})
                  </span>
                  {canDelete ? (
                    <DeleteButton
                      id={child.id}
                      action={softDeleteFamilyChildAction}
                      returnTo={returnTo}
                      contextPersonId={contextPersonId}
                      label="Xóa"
                    />
                  ) : null}
                </li>
              ))
            ) : (
              <li>Chưa có con.</li>
            )}
          </ul>
        </div>
      </div>
    </article>
  );
}

function familyList(
  data: RelationshipList | PersonRelationshipSummary,
): FamilyWithMembers[] {
  if ("families" in data) {
    return data.families;
  }

  const byId = new Map<string, FamilyWithMembers>();

  for (const family of [
    ...data.asParentInFamilies,
    ...data.asChildInFamilies,
  ]) {
    byId.set(family.id, family);
  }

  return [...byId.values()];
}

export function RelationshipSummary({
  data,
  canDelete,
  returnTo,
  contextPersonId,
}: RelationshipSummaryProps) {
  const families = familyList(data);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {families.length > 0 ? (
          families.map((family) => (
            <FamilyBlock
              key={family.id}
              family={family}
              canDelete={canDelete}
              returnTo={returnTo}
              contextPersonId={contextPersonId}
            />
          ))
        ) : (
          <EmptyState
            title="Chưa có quan hệ cha/mẹ/con"
            description="Tạo một đơn vị gia đình, sau đó gắn cha/mẹ và con bằng cách chọn thành viên theo tên."
          />
        )}
      </div>

      <div className="border border-slate-200 bg-white p-4">
        <h3 className="text-base font-semibold text-slate-950">Quan hệ đôi</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {data.couples.length > 0 ? (
            data.couples.map((couple) => (
              <li key={couple.id} className="flex flex-wrap items-center gap-2">
                <span>
                  {couple.person1?.display_name ||
                    couple.person1?.full_name ||
                    couple.person1_id}
                  {" với "}
                  {couple.person2?.display_name ||
                    couple.person2?.full_name ||
                    couple.person2_id}
                </span>
                <span className="text-slate-500">
                  ({couple.relationship_status})
                </span>
                {canDelete ? (
                  <DeleteButton
                    id={couple.id}
                    action={softDeleteCoupleRelationshipAction}
                    returnTo={returnTo}
                    contextPersonId={contextPersonId}
                    label="Xóa mềm"
                  />
                ) : null}
              </li>
            ))
          ) : (
            <li className="text-slate-600">
              Chưa có quan hệ đôi. Khi có thông tin chắc chắn, hãy tạo quan hệ vợ/chồng/bạn đời ở form bên dưới.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
