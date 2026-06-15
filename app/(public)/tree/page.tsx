import { PublicTreeShell } from "@/components/public/public-tree-shell";
import { getPublicFamilyTreeGraph } from "@/lib/family/public-family-service";

export const dynamic = "force-dynamic";

export default async function PublicTreePage() {
  const result = await getPublicFamilyTreeGraph();

  return <PublicTreeShell result={result} />;
}
