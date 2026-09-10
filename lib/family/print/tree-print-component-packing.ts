import { computeRawTreePrintBounds, computeTreePrintBounds } from "@/lib/family/print/tree-print-bounds"
import { calculateTreePrintDiagnostics } from "@/lib/family/print/tree-print-diagnostics"
import type { TreePrintLayoutFlow } from "@/lib/family/print/tree-print-orientation"
import type {
  TreePrintBounds,
  TreePrintDocument,
  TreePrintFamilyJunction,
  TreePrintPersonNode,
} from "@/lib/family/print/tree-print-types"

type ComponentBox = {
  componentId: string
  componentKey: string
  personCount: number
  familyCount: number
  edgeCount: number
  bounds: TreePrintBounds
  sumArea: number
}

export type TreePrintPositionedComponent = {
  componentId: string
  componentKey: string
  personCount: number
  familyCount: number
  edgeCount: number
  rawBounds: TreePrintBounds
  packedBounds: TreePrintBounds
  dx: number
  dy: number
}

export type TreePrintComponentPackingDiagnostics = {
  RAW_COMPONENT_BOUNDS_AREA: number
  RAW_CONTENT_BOUNDS_AREA: number
  PACKED_CONTENT_BOUNDS_AREA: number
  ARTBOARD_CONTENT_AREA: number
  COMPONENT_PACKING_EFFICIENCY: number
  INTERNAL_WHITESPACE_RATIO: number
  BASELINE_INTERNAL_WHITESPACE_RATIO: number
  MAX_COMPONENT_GAP: number
  MIN_COMPONENT_GAP: number
  COMPONENT_OVERLAP_COUNT: number
  PACKED_COMPONENT_COUNT: number
  MISSING_COMPONENT_COUNT: number
  PACKING_IMPROVEMENT: number
  NON_UNIFORM_COMPONENT_TRANSLATION_COUNT: number
}

export type TreePrintComponentPackingResult = {
  document: TreePrintDocument
  components: TreePrintPositionedComponent[]
  diagnostics: TreePrintComponentPackingDiagnostics
}

export const TREE_PRINT_COMPONENT_GAP_LAYOUT_UNITS = 180

export function packTreePrintComponents(
  document: TreePrintDocument,
  layoutFlow: TreePrintLayoutFlow,
  gap = TREE_PRINT_COMPONENT_GAP_LAYOUT_UNITS,
): TreePrintComponentPackingResult {
  const sourceComponents = buildComponentBoxes(document)
  const ordered = sourceComponents.slice().sort(compareComponentBoxes)
  const placements = layoutFlow === "top-to-bottom"
    ? packHorizontalShelves(ordered, gap)
    : packVerticalShelves(ordered, gap)
  const placementById = new Map(placements.map((component) => [component.componentId, component]))
  const nodeComponent = buildNodeComponentLookup(document)

  const people = document.people.map((person) => {
    const placement = placementById.get(person.componentId)
    if (!placement) return { ...person }
    return {
      ...person,
      x: Math.round(person.x + placement.dx),
      y: Math.round(person.y + placement.dy),
      layoutGenerationAxisAnchor:
        typeof person.layoutGenerationAxisAnchor === "number"
          ? Math.round((person.layoutGenerationAxisAnchor + (layoutFlow === "top-to-bottom" ? placement.dy : placement.dx)) * 100) / 100
          : person.layoutGenerationAxisAnchor,
    }
  })
  const families = document.families.map((family) => {
    const placement = placementById.get(family.componentId)
    if (!placement) return { ...family }
    return {
      ...family,
      x: Math.round(family.x + placement.dx),
      y: Math.round(family.y + placement.dy),
    }
  })
  const edges = document.edges.map((edge) => {
    const componentId = nodeComponent.get(edge.sourceId) ?? nodeComponent.get(edge.targetId)
    const placement = componentId ? placementById.get(componentId) : null
    if (!placement) {
      return {
        ...edge,
        points: edge.points.map((point) => ({ ...point })),
      }
    }

    return {
      ...edge,
      points: edge.points.map((point) => ({
        x: Math.round(point.x + placement.dx),
        y: Math.round(point.y + placement.dy),
      })),
    }
  })
  const bounds = computeTreePrintBounds(people, families, document.bounds.padding)
  const packedDocumentBase = {
    sourceMode: document.sourceMode,
    people,
    families,
    edges,
    bounds,
  }
  const packedDocument = {
    ...packedDocumentBase,
    diagnostics: calculateTreePrintDiagnostics(packedDocumentBase),
  }
  const components = placements.map((placement) => ({
    componentId: placement.componentId,
    componentKey: placement.componentKey,
    personCount: placement.personCount,
    familyCount: placement.familyCount,
    edgeCount: placement.edgeCount,
    rawBounds: placement.bounds,
    packedBounds: translateBounds(placement.bounds, placement.dx, placement.dy),
    dx: placement.dx,
    dy: placement.dy,
  }))

  return {
    document: packedDocument,
    components,
    diagnostics: buildPackingDiagnostics(document, packedDocument, sourceComponents, components),
  }
}

function buildComponentBoxes(document: TreePrintDocument): ComponentBox[] {
  const componentIds = new Set<string>()
  for (const person of document.people) componentIds.add(person.componentId)
  for (const family of document.families) componentIds.add(family.componentId)

  return [...componentIds].map((componentId) => {
    const people = document.people.filter((person) => person.componentId === componentId)
    const families = document.families.filter((family) => family.componentId === componentId)
    const nodeIds = new Set([...people.map((person) => person.id), ...families.map((family) => family.id)])
    const edgeCount = document.edges.filter((edge) => nodeIds.has(edge.sourceId) || nodeIds.has(edge.targetId)).length
    const bounds = boundsFromRaw(people, families, document.bounds.padding)
    const ids = [...nodeIds].sort()
    return {
      componentId,
      componentKey: ids.join("|"),
      personCount: people.length,
      familyCount: families.length,
      edgeCount,
      bounds,
      sumArea: sumNodeArea(people, families),
    }
  })
}

function compareComponentBoxes(a: ComponentBox, b: ComponentBox): number {
  if (a.personCount !== b.personCount) return b.personCount - a.personCount
  if (a.familyCount !== b.familyCount) return b.familyCount - a.familyCount
  return a.componentKey.localeCompare(b.componentKey)
}

function packHorizontalShelves(
  components: ComponentBox[],
  gap: number,
): Array<ComponentBox & { dx: number; dy: number }> {
  if (components.length === 0) return []
  const totalArea = components.reduce((sum, component) => sum + area(component.bounds), 0)
  const targetWidth = Math.max(
    components[0].bounds.width,
    Math.sqrt(Math.max(1, totalArea)) * 1.75,
  )
  const placements: Array<ComponentBox & { dx: number; dy: number }> = []
  let cursorX = 0
  let cursorY = 0
  let rowHeight = 0

  for (const component of components) {
    if (cursorX > 0 && cursorX + component.bounds.width > targetWidth) {
      cursorX = 0
      cursorY += rowHeight + gap
      rowHeight = 0
    }
    placements.push({
      ...component,
      dx: cursorX - component.bounds.minX,
      dy: cursorY - component.bounds.minY,
    })
    cursorX += component.bounds.width + gap
    rowHeight = Math.max(rowHeight, component.bounds.height)
  }

  return placements
}

function packVerticalShelves(
  components: ComponentBox[],
  gap: number,
): Array<ComponentBox & { dx: number; dy: number }> {
  if (components.length === 0) return []
  const totalArea = components.reduce((sum, component) => sum + area(component.bounds), 0)
  const targetHeight = Math.max(
    components[0].bounds.height,
    Math.sqrt(Math.max(1, totalArea)) * 1.75,
  )
  const placements: Array<ComponentBox & { dx: number; dy: number }> = []
  let cursorX = 0
  let cursorY = 0
  let columnWidth = 0

  for (const component of components) {
    if (cursorY > 0 && cursorY + component.bounds.height > targetHeight) {
      cursorY = 0
      cursorX += columnWidth + gap
      columnWidth = 0
    }
    placements.push({
      ...component,
      dx: cursorX - component.bounds.minX,
      dy: cursorY - component.bounds.minY,
    })
    cursorY += component.bounds.height + gap
    columnWidth = Math.max(columnWidth, component.bounds.width)
  }

  return placements
}

function buildPackingDiagnostics(
  source: TreePrintDocument,
  packed: TreePrintDocument,
  rawComponents: ComponentBox[],
  packedComponents: TreePrintPositionedComponent[],
): TreePrintComponentPackingDiagnostics {
  const rawComponentBoundsArea = rawComponents.reduce((sum, component) => sum + area(component.bounds), 0)
  const rawContentBoundsArea = Math.max(1, source.bounds.width * source.bounds.height)
  const packedRaw = computeRawTreePrintBounds(packed.people, packed.families)
  const packedContentBoundsArea = packedRaw
    ? Math.max(1, (packedRaw.maxX - packedRaw.minX) * (packedRaw.maxY - packedRaw.minY))
    : 1
  const artboardContentArea = Math.max(1, packed.bounds.width * packed.bounds.height)
  const baselineWhitespace = clampRatio(1 - rawComponentBoundsArea / rawContentBoundsArea)
  const internalWhitespace = clampRatio(1 - rawComponentBoundsArea / packedContentBoundsArea)
  const gaps = componentGaps(packedComponents)

  return {
    RAW_COMPONENT_BOUNDS_AREA: roundTo(rawComponentBoundsArea, 2),
    RAW_CONTENT_BOUNDS_AREA: roundTo(rawContentBoundsArea, 2),
    PACKED_CONTENT_BOUNDS_AREA: roundTo(packedContentBoundsArea, 2),
    ARTBOARD_CONTENT_AREA: roundTo(artboardContentArea, 2),
    COMPONENT_PACKING_EFFICIENCY: roundTo(clampRatio(rawComponentBoundsArea / packedContentBoundsArea), 4),
    INTERNAL_WHITESPACE_RATIO: roundTo(internalWhitespace, 4),
    BASELINE_INTERNAL_WHITESPACE_RATIO: roundTo(baselineWhitespace, 4),
    MAX_COMPONENT_GAP: roundTo(gaps.max, 2),
    MIN_COMPONENT_GAP: roundTo(gaps.min, 2),
    COMPONENT_OVERLAP_COUNT: countComponentOverlaps(packedComponents),
    PACKED_COMPONENT_COUNT: packedComponents.length,
    MISSING_COMPONENT_COUNT: Math.max(0, rawComponents.length - packedComponents.length),
    PACKING_IMPROVEMENT: roundTo(baselineWhitespace - internalWhitespace, 4),
    NON_UNIFORM_COMPONENT_TRANSLATION_COUNT: countNonUniformComponentTranslations(source, packed, packedComponents),
  }
}

function countNonUniformComponentTranslations(
  source: TreePrintDocument,
  packed: TreePrintDocument,
  components: TreePrintPositionedComponent[],
): number {
  const expected = new Map(components.map((component) => [component.componentId, { dx: component.dx, dy: component.dy }]))
  const packedPeople = new Map(packed.people.map((person) => [person.id, person]))
  const packedFamilies = new Map(packed.families.map((family) => [family.id, family]))
  let nonUniform = 0

  for (const person of source.people) {
    const translation = expected.get(person.componentId)
    const next = packedPeople.get(person.id)
    if (!translation || !next) continue
    if (!sameTranslation(next.x - person.x, next.y - person.y, translation.dx, translation.dy)) {
      nonUniform += 1
    }
  }

  for (const family of source.families) {
    const translation = expected.get(family.componentId)
    const next = packedFamilies.get(family.id)
    if (!translation || !next) continue
    if (!sameTranslation(next.x - family.x, next.y - family.y, translation.dx, translation.dy)) {
      nonUniform += 1
    }
  }

  return nonUniform
}

function buildNodeComponentLookup(document: TreePrintDocument): Map<string, string> {
  return new Map([
    ...document.people.map((person) => [person.id, person.componentId] as const),
    ...document.families.map((family) => [family.id, family.componentId] as const),
  ])
}

function boundsFromRaw(
  people: TreePrintPersonNode[],
  families: TreePrintFamilyJunction[],
  padding: number,
): TreePrintBounds {
  const raw = computeRawTreePrintBounds(people, families)
  if (!raw) {
    return {
      minX: 0,
      minY: 0,
      maxX: padding * 2,
      maxY: padding * 2,
      width: padding * 2,
      height: padding * 2,
      padding,
    }
  }

  return {
    minX: Math.round(raw.minX),
    minY: Math.round(raw.minY),
    maxX: Math.round(raw.maxX),
    maxY: Math.round(raw.maxY),
    width: Math.round(raw.maxX - raw.minX),
    height: Math.round(raw.maxY - raw.minY),
    padding,
  }
}

function translateBounds(bounds: TreePrintBounds, dx: number, dy: number): TreePrintBounds {
  const minX = Math.round(bounds.minX + dx)
  const minY = Math.round(bounds.minY + dy)
  const maxX = Math.round(bounds.maxX + dx)
  const maxY = Math.round(bounds.maxY + dy)
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
    padding: bounds.padding,
  }
}

function sumNodeArea(
  people: TreePrintPersonNode[],
  families: TreePrintFamilyJunction[],
): number {
  const peopleArea = people.reduce((sum, person) => sum + person.width * person.height, 0)
  const familyArea = families.reduce((sum, family) => sum + family.radius * family.radius * 4, 0)
  return Math.max(1, peopleArea + familyArea)
}

function componentGaps(components: TreePrintPositionedComponent[]): { min: number; max: number } {
  if (components.length < 2) return { min: 0, max: 0 }
  let min = Number.POSITIVE_INFINITY
  let max = 0

  for (let index = 0; index < components.length; index += 1) {
    for (let next = index + 1; next < components.length; next += 1) {
      const gap = rectGap(components[index].packedBounds, components[next].packedBounds)
      min = Math.min(min, gap)
      max = Math.max(max, gap)
    }
  }

  return {
    min: Number.isFinite(min) ? min : 0,
    max,
  }
}

function countComponentOverlaps(components: TreePrintPositionedComponent[]): number {
  let overlaps = 0
  for (let index = 0; index < components.length; index += 1) {
    for (let next = index + 1; next < components.length; next += 1) {
      if (rectsOverlap(components[index].packedBounds, components[next].packedBounds)) {
        overlaps += 1
      }
    }
  }
  return overlaps
}

function rectsOverlap(a: TreePrintBounds, b: TreePrintBounds): boolean {
  return (
    a.minX < b.maxX &&
    a.maxX > b.minX &&
    a.minY < b.maxY &&
    a.maxY > b.minY
  )
}

function rectGap(a: TreePrintBounds, b: TreePrintBounds): number {
  const dx = Math.max(0, Math.max(a.minX - b.maxX, b.minX - a.maxX))
  const dy = Math.max(0, Math.max(a.minY - b.maxY, b.minY - a.maxY))
  if (dx === 0) return dy
  if (dy === 0) return dx
  return Math.sqrt(dx * dx + dy * dy)
}

function area(bounds: Pick<TreePrintBounds, "width" | "height">): number {
  return Math.max(1, bounds.width * bounds.height)
}

function clampRatio(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(1, Math.max(0, value))
}

function sameTranslation(actualDx: number, actualDy: number, expectedDx: number, expectedDy: number): boolean {
  return Math.abs(actualDx - expectedDx) <= 0.01 && Math.abs(actualDy - expectedDy) <= 0.01
}

function roundTo(value: number, fractionDigits: number): number {
  const factor = 10 ** fractionDigits
  return Math.round(value * factor) / factor
}
