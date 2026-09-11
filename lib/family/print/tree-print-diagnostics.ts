import type {
  TreePrintBounds,
  TreePrintDiagnosticIssue,
  TreePrintDiagnostics,
  TreePrintDocument,
  TreePrintEdge,
  TreePrintPersonNode,
  TreePrintPoint,
} from "@/lib/family/print/tree-print-types";

type Rect = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

function rectFor(person: TreePrintPersonNode): Rect {
  return {
    id: person.id,
    x: person.x,
    y: person.y,
    width: person.width,
    height: person.height,
  };
}

function rectanglesIntersect(a: Rect, b: Rect) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function pointInRect(point: TreePrintPoint, rect: Rect) {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

function direction(a: TreePrintPoint, b: TreePrintPoint, c: TreePrintPoint) {
  return (c.x - a.x) * (b.y - a.y) - (b.x - a.x) * (c.y - a.y);
}

function segmentsIntersect(
  a: TreePrintPoint,
  b: TreePrintPoint,
  c: TreePrintPoint,
  d: TreePrintPoint,
) {
  const d1 = direction(c, d, a);
  const d2 = direction(c, d, b);
  const d3 = direction(a, b, c);
  const d4 = direction(a, b, d);

  return (
    ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
    ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))
  );
}

function segmentIntersectsRect(a: TreePrintPoint, b: TreePrintPoint, rect: Rect) {
  if (pointInRect(a, rect) || pointInRect(b, rect)) {
    return true;
  }

  const topLeft = { x: rect.x, y: rect.y };
  const topRight = { x: rect.x + rect.width, y: rect.y };
  const bottomLeft = { x: rect.x, y: rect.y + rect.height };
  const bottomRight = { x: rect.x + rect.width, y: rect.y + rect.height };

  return (
    segmentsIntersect(a, b, topLeft, topRight) ||
    segmentsIntersect(a, b, topRight, bottomRight) ||
    segmentsIntersect(a, b, bottomRight, bottomLeft) ||
    segmentsIntersect(a, b, bottomLeft, topLeft)
  );
}

function edgeSpan(edge: TreePrintEdge) {
  const xs = edge.points.map((point) => point.x);
  const ys = edge.points.map((point) => point.y);
  return {
    horizontal: Math.max(...xs) - Math.min(...xs),
    vertical: Math.max(...ys) - Math.min(...ys),
  };
}

function outOfBounds(rect: Rect, bounds: TreePrintBounds) {
  return (
    rect.x < bounds.minX ||
    rect.y < bounds.minY ||
    rect.x + rect.width > bounds.maxX ||
    rect.y + rect.height > bounds.maxY
  );
}

export function calculateTreePrintDiagnostics(
  document: Omit<TreePrintDocument, "diagnostics">,
): TreePrintDiagnostics {
  const issues: TreePrintDiagnosticIssue[] = [];
  const peopleRects = document.people.map(rectFor);
  let nodeOverlapCount = 0;
  let edgeCardIntersectionCount = 0;
  let maxHorizontalEdgeSpan = 0;
  let maxVerticalEdgeSpan = 0;

  for (let index = 0; index < peopleRects.length; index += 1) {
    for (let next = index + 1; next < peopleRects.length; next += 1) {
      if (rectanglesIntersect(peopleRects[index], peopleRects[next])) {
        nodeOverlapCount += 1;
        issues.push({
          id: `node-overlap:${peopleRects[index].id}:${peopleRects[next].id}`,
          severity: "ERROR",
          message: "Hai thẻ người đang chồng lên nhau.",
          nodeIds: [peopleRects[index].id, peopleRects[next].id],
        });
      }
    }
  }

  for (const edge of document.edges) {
    const span = edgeSpan(edge);
    maxHorizontalEdgeSpan = Math.max(maxHorizontalEdgeSpan, span.horizontal);
    maxVerticalEdgeSpan = Math.max(maxVerticalEdgeSpan, span.vertical);

    for (let index = 0; index < edge.points.length - 1; index += 1) {
      const start = edge.points[index];
      const end = edge.points[index + 1];

      for (const rect of peopleRects) {
        if (rect.id === edge.sourceId || rect.id === edge.targetId) {
          continue;
        }

        if (segmentIntersectsRect(start, end, rect)) {
          edgeCardIntersectionCount += 1;
          issues.push({
            id: `edge-card:${edge.id}:${rect.id}:${index}`,
            severity: "WARNING",
            message: "Một cạnh đi qua thẻ người không phải điểm nối hợp lệ.",
            nodeIds: [rect.id],
            edgeId: edge.id,
          });
        }
      }
    }

    const longEdgeThreshold = Math.max(900, document.bounds.width * 0.35);
    if (span.horizontal > longEdgeThreshold || span.vertical > longEdgeThreshold) {
      issues.push({
        id: `long-edge:${edge.id}`,
        severity: "INFO",
        message: "Cạnh này có nhịp dài, nên kiểm tra khi xem toàn cục.",
        edgeId: edge.id,
      });
    }
  }

  const outOfBoundsNodeCount = peopleRects.filter((rect) =>
    outOfBounds(rect, document.bounds),
  ).length;

  return {
    PERSON_COUNT: document.people.length,
    FAMILY_COUNT: document.families.length,
    EDGE_COUNT: document.edges.length,
    CONNECTED_COMPONENT_COUNT: new Set([
      ...document.people.map((node) => node.componentId),
      ...document.families.map((node) => node.componentId),
    ]).size,
    TREE_MIN_X: document.bounds.minX,
    TREE_MIN_Y: document.bounds.minY,
    TREE_MAX_X: document.bounds.maxX,
    TREE_MAX_Y: document.bounds.maxY,
    TREE_WIDTH: document.bounds.width,
    TREE_HEIGHT: document.bounds.height,
    NODE_OVERLAP_COUNT: nodeOverlapCount,
    EDGE_CARD_INTERSECTION_COUNT: edgeCardIntersectionCount,
    MAX_HORIZONTAL_EDGE_SPAN: Math.round(maxHorizontalEdgeSpan),
    MAX_VERTICAL_EDGE_SPAN: Math.round(maxVerticalEdgeSpan),
    OUT_OF_BOUNDS_NODE_COUNT: outOfBoundsNodeCount,
    issues,
  };
}
