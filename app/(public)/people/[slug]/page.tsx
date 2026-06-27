import { notFound } from "next/navigation";

import { PublicPersonProfile } from "@/components/public/public-person-profile";
import { PublicShell } from "@/components/layout/public-shell";
import { FamilyTreeErrorState } from "@/components/tree/family-tree-error-state";
import { getPublicPersonProfile } from "@/lib/family/public-family-service";

export const dynamic = "force-dynamic";

type PublicPersonPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PublicPersonPage({ params }: PublicPersonPageProps) {
  const { slug } = await params;
  const result = await getPublicPersonProfile(slug);

  if (!result.ok) {
    if (
      result.reason === "public_person_not_found" ||
      result.reason === "public_person_hidden"
    ) {
      notFound();
    }

    return (
      <PublicShell>
        <section className="mx-auto w-full max-w-3xl px-6 py-10">
          <FamilyTreeErrorState message="Không thể tải hồ sơ công khai. Gia đình có thể đang cập nhật dữ liệu hoặc quyền xem." />
        </section>
      </PublicShell>
    );
  }

  return <PublicPersonProfile person={result.data} />;
}
