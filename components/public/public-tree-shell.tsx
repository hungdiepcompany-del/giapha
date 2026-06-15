import { FamilyTreeErrorState } from "@/components/tree/family-tree-error-state";
import { FamilyTreeViewer } from "@/components/tree/family-tree-viewer";
import { FamilyTreeEmptyState } from "@/components/tree/family-tree-empty-state";
import { PublicShell } from "@/components/layout/public-shell";
import type { FamilyTreeGraph } from "@/lib/family/tree-types";

type PublicTreeShellProps = {
  result:
    | {
        ok: true;
        data: FamilyTreeGraph;
      }
    | {
        ok: false;
        error: string;
      };
};

export function PublicTreeShell({ result }: PublicTreeShellProps) {
  return (
    <PublicShell>
      <section className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className="border-b border-slate-200 pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Public tree
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Cây gia phả public
          </h1>
        </div>

        <div className="mt-6">
          {result.ok ? (
            result.data.nodes.length > 0 ? (
              <FamilyTreeViewer graph={result.data} />
            ) : (
              <FamilyTreeEmptyState />
            )
          ) : (
            <FamilyTreeErrorState message={result.error} />
          )}
        </div>
      </section>
    </PublicShell>
  );
}
