import { computeTreePrintBounds, computeRawTreePrintBounds } from "@/lib/family/print/tree-print-bounds";
import { calculateTreePrintDiagnostics } from "@/lib/family/print/tree-print-diagnostics";
import type {
  TreePrintBuildOptions,
  TreePrintDocument,
  TreePrintEdge,
  TreePrintFamilyJunction,
  TreePrintPersonNode,
  TreePrintPoint,
  TreePrintRelationshipKind,
} from "@/lib/family/print/tree-print-types";
import {
  TREE_PRINT_DEFAULT_PADDING,
  TREE_PRINT_FAMILY_RADIUS,
  TREE_PRINT_PERSON_HEIGHT_COMPACT,
  TREE_PRINT_PERSON_HEIGHT_STANDARD,
  TREE_PRINT_PERSON_WIDTH,
} from "@/lib/family/print/tree-print-types";
import type { FamilyTreeGraph, TreeGraphNode } from "@/lib/family/tree-types";

type ComponentLookup = Map<string, string>;

function lifeYearsLabel(node: Extract<TreeGraphNode, { kind: "person" }>) {
  if (!node.birthYear && !node.deathYear) {
    return null;
  }

  return `${node.birthYear ?? "?"} - ${node.deathYear ?? (node.isLiving ? "nay" : "?")}`;
}

function componentLookupFor(graph: FamilyTreeGraph): ComponentLookup {
  const parent = new Map<string, string>();

  function find(id: string): string {
    const current = parent.get(id) ?? id;
    if (current === id) {
      parent.set(id, id);
      return id;
    }
    const root = find(current);
    parent.set(id, root);
    return root;
  }

  function union(a: string, b: string) {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) {
      parent.set(rootB, rootA);
    }
  }

  for (const node of graph.nodes) {
    parent.set(node.id, node.id);
  }

  for (const edge of graph.edges) {
    union(edge.source, edge.target);
  }

  const roots = [...new Set(graph.nodes.map((node) => find(node.id)))].sort();
  const labelByRoot = new Map(roots.map((root, index) => [root, `C${index + 1}`]));
  return new Map(graph.nodes.map((node) => [node.id, labelByRoot.get(find(node.id)) ?? "C1"]));
}

function mapPeople(
  graph: FamilyTreeGraph,
  components: ComponentLookup,
  height: number,
): TreePrintPersonNode[] {
  return graph.nodes.flatMap((node) => {
    if (node.kind !== "person") {
      return [];
    }

    return [
      {
        id: node.id,
        personId: node.personId,
        x: Math.round(node.position.x),
        y: Math.round(node.position.y),
        width: TREE_PRINT_PERSON_WIDTH,
        height,
        displayName: node.displayName || node.fullName,
        secondaryName: node.displayName ? node.fullName : null,
        generationLabel: node.generationNumber ? `Đời thứ ${node.generationNumber}` : null,
        lifeYearsLabel: lifeYearsLabel(node),
        livingStatus: node.isLiving ? "Còn sống" : "Đã mất",
        componentId: components.get(node.id) ?? "C1",
      },
    ];
  });
}

function mapFamilies(
  graph: FamilyTreeGraph,
  components: ComponentLookup,
): TreePrintFamilyJunction[] {
  return graph.nodes.flatMap((node) => {
    if (node.kind !== "family") {
      return [];
    }

    return [
      {
        id: node.id,
        familyId: node.familyId,
        x: Math.round(node.position.x + TREE_PRINT_FAMILY_RADIUS),
        y: Math.round(node.position.y + TREE_PRINT_FAMILY_RADIUS),
        radius: TREE_PRINT_FAMILY_RADIUS,
        label: node.label,
        componentId: components.get(node.id) ?? "C1",
      },
    ];
  });
}

function nodeCenter(node: TreePrintPersonNode | TreePrintFamilyJunction) {
  if ("radius" in node) {
    return { x: node.x, y: node.y };
  }

  return {
    x: node.x + node.width / 2,
    y: node.y + node.height / 2,
  };
}

function attachmentPoint(
  node: TreePrintPersonNode | TreePrintFamilyJunction,
  side: "top" | "bottom" | "left" | "right" | "center",
) {
  if ("radius" in node) {
    return nodeCenter(node);
  }

  if (side === "top") return { x: node.x + node.width / 2, y: node.y };
  if (side === "bottom") return { x: node.x + node.width / 2, y: node.y + node.height };
  if (side === "left") return { x: node.x, y: node.y + node.height / 2 };
  if (side === "right") return { x: node.x + node.width, y: node.y + node.height / 2 };
  return nodeCenter(node);
}

function relationshipKind(kind: FamilyTreeGraph["edges"][number]["kind"]): TreePrintRelationshipKind {
  if (kind === "couple") return "couple";
  if (kind === "family_unit") return "parent_to_family";
  if (kind === "parent_child") return "family_to_child";
  return "other";
}

function routeEdge(
  kind: TreePrintRelationshipKind,
  source: TreePrintPersonNode | TreePrintFamilyJunction,
  target: TreePrintPersonNode | TreePrintFamilyJunction,
): TreePrintPoint[] {
  if (kind === "couple") {
    const sourceCenter = nodeCenter(source);
    const targetCenter = nodeCenter(target);
    const sourceSide = sourceCenter.x <= targetCenter.x ? "right" : "left";
    const targetSide = sourceCenter.x <= targetCenter.x ? "left" : "right";
    const start = attachmentPoint(source, sourceSide);
    const end = attachmentPoint(target, targetSide);
    const midX = Math.round((start.x + end.x) / 2);
    return [start, { x: midX, y: start.y }, { x: midX, y: end.y }, end];
  }

  const start = attachmentPoint(source, kind === "family_to_child" ? "center" : "bottom");
  const end = attachmentPoint(target, kind === "family_to_child" ? "top" : "center");
  const midY = Math.round((start.y + end.y) / 2);
  return [start, { x: start.x, y: midY }, { x: end.x, y: midY }, end];
}

function mapEdges(
  graph: FamilyTreeGraph,
  people: TreePrintPersonNode[],
  families: TreePrintFamilyJunction[],
): TreePrintEdge[] {
  const byId = new Map<string, TreePrintPersonNode | TreePrintFamilyJunction>([
    ...people.map((node) => [node.id, node] as const),
    ...families.map((node) => [node.id, node] as const),
  ]);

  return graph.edges.flatMap((edge) => {
    const source = byId.get(edge.source);
    const target = byId.get(edge.target);

    if (!source || !target) {
      return [];
    }

    const kind = relationshipKind(edge.kind);
    return [
      {
        id: edge.id,
        sourceId: edge.source,
        targetId: edge.target,
        relationshipKind: kind,
        points: routeEdge(kind, source, target),
      },
    ];
  });
}

export function createTreePrintDocument(
  graph: FamilyTreeGraph,
  options: TreePrintBuildOptions = {},
): TreePrintDocument {
  const density = options.density ?? "standard";
  const padding = options.padding ?? TREE_PRINT_DEFAULT_PADDING;
  const height =
    density === "compact"
      ? TREE_PRINT_PERSON_HEIGHT_COMPACT
      : TREE_PRINT_PERSON_HEIGHT_STANDARD;
  const components = componentLookupFor(graph);
  const rawPeople = mapPeople(graph, components, height);
  const rawFamilies = mapFamilies(graph, components);
  const rawBounds = computeRawTreePrintBounds(rawPeople, rawFamilies);
  const dx = rawBounds ? padding - rawBounds.minX : padding;
  const dy = rawBounds ? padding - rawBounds.minY : padding;
  const people = rawPeople.map((node) => ({
    ...node,
    x: Math.round(node.x + dx),
    y: Math.round(node.y + dy),
  }));
  const families = rawFamilies.map((node) => ({
    ...node,
    x: Math.round(node.x + dx),
    y: Math.round(node.y + dy),
  }));
  const edges = mapEdges({ ...graph, nodes: graph.nodes }, people, families);
  const bounds = computeTreePrintBounds(people, families, padding);
  const baseDocument = {
    sourceMode: graph.meta.mode,
    people,
    families,
    edges,
    bounds,
  };

  return {
    ...baseDocument,
    diagnostics: calculateTreePrintDiagnostics(baseDocument),
  };
}
