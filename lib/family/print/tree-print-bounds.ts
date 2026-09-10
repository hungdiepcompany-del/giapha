import type {
  TreePrintBounds,
  TreePrintFamilyJunction,
  TreePrintPersonNode,
} from "@/lib/family/print/tree-print-types";

type RawBounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

function emptyBounds(padding: number): TreePrintBounds {
  return {
    minX: 0,
    minY: 0,
    maxX: padding * 2,
    maxY: padding * 2,
    width: padding * 2,
    height: padding * 2,
    padding,
  };
}

export function computeRawTreePrintBounds(
  people: TreePrintPersonNode[],
  families: TreePrintFamilyJunction[],
): RawBounds | null {
  let bounds: RawBounds | null = null;

  function include(minX: number, minY: number, maxX: number, maxY: number) {
    if (!bounds) {
      bounds = { minX, minY, maxX, maxY };
      return;
    }

    bounds.minX = Math.min(bounds.minX, minX);
    bounds.minY = Math.min(bounds.minY, minY);
    bounds.maxX = Math.max(bounds.maxX, maxX);
    bounds.maxY = Math.max(bounds.maxY, maxY);
  }

  for (const person of people) {
    include(person.x, person.y, person.x + person.width, person.y + person.height);
  }

  for (const family of families) {
    include(
      family.x - family.radius,
      family.y - family.radius,
      family.x + family.radius,
      family.y + family.radius,
    );
  }

  return bounds;
}

export function computeTreePrintBounds(
  people: TreePrintPersonNode[],
  families: TreePrintFamilyJunction[],
  padding: number,
): TreePrintBounds {
  const raw = computeRawTreePrintBounds(people, families);

  if (!raw) {
    return emptyBounds(padding);
  }

  const width = raw.maxX - raw.minX + padding * 2;
  const height = raw.maxY - raw.minY + padding * 2;

  return {
    minX: 0,
    minY: 0,
    maxX: Math.round(width),
    maxY: Math.round(height),
    width: Math.round(width),
    height: Math.round(height),
    padding,
  };
}
