import { PublicHome } from "@/components/public/public-home";
import { getPublicFamilyStats } from "@/lib/family/public-family-service";

export const dynamic = "force-dynamic";

export default async function PublicHomePage() {
  const stats = await getPublicFamilyStats();

  return (
    <PublicHome
      peopleCount={stats.ok ? stats.data.peopleCount : 0}
      treeNodeCount={stats.ok ? stats.data.treeNodeCount : 0}
    />
  );
}
