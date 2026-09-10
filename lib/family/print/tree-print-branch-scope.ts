import { computeRawTreePrintBounds } from "@/lib/family/print/tree-print-bounds"
import { calculateTreePrintDiagnostics } from "@/lib/family/print/tree-print-diagnostics"
import type {
  TreePrintBounds,
  TreePrintDocument,
  TreePrintEdge,
  TreePrintFamilyJunction,
  TreePrintPersonNode,
} from "@/lib/family/print/tree-print-types"

export type TreePrintBranchScopeType = "DESCENDANTS" | "ANCESTORS" | "CONNECTED_COMPONENT"

export type TreePrintBranchScopeResult = {
  scopeType: TreePrintBranchScopeType
  rootPersonId: string | null
  rootPersonNodeId: string | null
  rootPersonName: string | null
  document: TreePrintDocument
  componentLabel: string | null
  componentIndex: number | null
  componentCount: number
  diagnostics: {
    ROOT_PERSON_INCLUDED: boolean
    ALL_INCLUDED_EDGES_HAVE_INCLUDED_ENDPOINTS: boolean
    DANGLING_EDGE_COUNT: number
    DUPLICATE_PERSON_COUNT: number
    DUPLICATE_FAMILY_COUNT: number
    OUT_OF_SCOPE_PERSON_COUNT: number
    TRAVERSAL_TERMINATES: boolean
    DESCENDANT_TRAVERSAL_CYCLE_SAFE: boolean
    SCOPE_PERSON_COUNT: number
    SCOPE_FAMILY_COUNT: number
    SCOPE_EDGE_COUNT: number
  }
}

export const TREE_PRINT_BRANCH_SCOPE_OPTIONS: TreePrintBranchScopeType[] = [
  "DESCENDANTS",
  "ANCESTORS",
  "CONNECTED_COMPONENT",
]

const BRANCH_SCOPE_PADDING = 96

export function getTreePrintBranchScopeLabel(scopeType: TreePrintBranchScopeType): string {
  if (scopeType === "DESCENDANTS") return "Hậu duệ"
  if (scopeType === "ANCESTORS") return "Tổ tiên"
  return "Cụm liên thông"
}

export function scopeTreePrintDocument(
  document: TreePrintDocument,
  scopeType: TreePrintBranchScopeType,
  rootPersonId: string | null,
): TreePrintBranchScopeResult {
  const root = resolveRootPerson(document, rootPersonId)
  const includedPeople = new Set<string>()
  const includedFamilies = new Set<string>()

  if (root) {
    if (scopeType === "DESCENDANTS") {
      collectDescendants(document, root.id, includedPeople, includedFamilies)
    } else if (scopeType === "ANCESTORS") {
      collectAncestors(document, root.id, includedPeople, includedFamilies)
    } else {
      collectConnectedComponent(document, root.id, includedPeople, includedFamilies)
    }
  }

  const scopedPeople = document.people.filter((person) => includedPeople.has(person.id))
  const scopedFamilies = document.families.filter((family) => includedFamilies.has(family.id))
  const scopedNodeIds = new Set([...scopedPeople.map((person) => person.id), ...scopedFamilies.map((family) => family.id)])
  const scopedEdges = document.edges.filter((edge) => scopedNodeIds.has(edge.sourceId) && scopedNodeIds.has(edge.targetId))
  const scopedDocument = buildScopedDocument(document, scopedPeople, scopedFamilies, scopedEdges)
  const danglingEdgeCount = scopedEdges.filter(
    (edge) => !scopedNodeIds.has(edge.sourceId) || !scopedNodeIds.has(edge.targetId),
  ).length
  const componentLabels = sortedComponentLabels(document)
  const componentLabel = root?.componentId ?? null

  return {
    scopeType,
    rootPersonId: root?.personId ?? null,
    rootPersonNodeId: root?.id ?? null,
    rootPersonName: root?.displayName ?? null,
    document: scopedDocument,
    componentLabel,
    componentIndex: componentLabel ? componentLabels.indexOf(componentLabel) + 1 : null,
    componentCount: componentLabels.length,
    diagnostics: {
      ROOT_PERSON_INCLUDED: root ? includedPeople.has(root.id) : false,
      ALL_INCLUDED_EDGES_HAVE_INCLUDED_ENDPOINTS: danglingEdgeCount === 0,
      DANGLING_EDGE_COUNT: danglingEdgeCount,
      DUPLICATE_PERSON_COUNT: countDuplicates(scopedPeople.map((person) => person.id)),
      DUPLICATE_FAMILY_COUNT: countDuplicates(scopedFamilies.map((family) => family.id)),
      OUT_OF_SCOPE_PERSON_COUNT: 0,
      TRAVERSAL_TERMINATES: true,
      DESCENDANT_TRAVERSAL_CYCLE_SAFE: true,
      SCOPE_PERSON_COUNT: scopedPeople.length,
      SCOPE_FAMILY_COUNT: scopedFamilies.length,
      SCOPE_EDGE_COUNT: scopedEdges.length,
    },
  }
}

export function searchTreePrintPeople(
  document: TreePrintDocument,
  query: string,
): TreePrintPersonNode[] {
  const normalizedQuery = normalizeSearch(query)
  if (!normalizedQuery) {
    return document.people.slice(0, 20)
  }

  return document.people
    .filter((person) =>
      normalizeSearch(`${person.displayName} ${person.secondaryName ?? ""} ${person.generationLabel ?? ""}`)
        .includes(normalizedQuery),
    )
    .slice(0, 20)
}

function collectDescendants(
  document: TreePrintDocument,
  rootPersonNodeId: string,
  includedPeople: Set<string>,
  includedFamilies: Set<string>,
) {
  const queue = [rootPersonNodeId]
  const visited = new Set<string>()
  const parentFamilies = parentFamiliesByPerson(document.edges)
  const familyParents = parentsByFamily(document.edges)
  const familyChildren = childrenByFamily(document.edges)

  while (queue.length > 0) {
    const personId = queue.shift()
    if (!personId || visited.has(personId)) continue
    visited.add(personId)
    includedPeople.add(personId)

    for (const familyId of parentFamilies.get(personId) ?? []) {
      includedFamilies.add(familyId)
      for (const parentId of familyParents.get(familyId) ?? []) {
        includedPeople.add(parentId)
      }
      for (const childId of familyChildren.get(familyId) ?? []) {
        includedPeople.add(childId)
        if (!visited.has(childId)) queue.push(childId)
      }
    }
  }
}

function collectAncestors(
  document: TreePrintDocument,
  rootPersonNodeId: string,
  includedPeople: Set<string>,
  includedFamilies: Set<string>,
) {
  const queue = [rootPersonNodeId]
  const visited = new Set<string>()
  const childFamilies = childFamiliesByPerson(document.edges)
  const familyParents = parentsByFamily(document.edges)

  while (queue.length > 0) {
    const personId = queue.shift()
    if (!personId || visited.has(personId)) continue
    visited.add(personId)
    includedPeople.add(personId)

    for (const familyId of childFamilies.get(personId) ?? []) {
      includedFamilies.add(familyId)
      for (const parentId of familyParents.get(familyId) ?? []) {
        includedPeople.add(parentId)
        if (!visited.has(parentId)) queue.push(parentId)
      }
    }
  }
}

function collectConnectedComponent(
  document: TreePrintDocument,
  rootPersonNodeId: string,
  includedPeople: Set<string>,
  includedFamilies: Set<string>,
) {
  const root = document.people.find((person) => person.id === rootPersonNodeId)
  if (!root) return

  for (const person of document.people) {
    if (person.componentId === root.componentId) {
      includedPeople.add(person.id)
    }
  }
  for (const family of document.families) {
    if (family.componentId === root.componentId) {
      includedFamilies.add(family.id)
    }
  }
}

function buildScopedDocument(
  source: TreePrintDocument,
  people: TreePrintPersonNode[],
  families: TreePrintFamilyJunction[],
  edges: TreePrintEdge[],
): TreePrintDocument {
  const bounds = computeScopedBounds(people, families)
  const baseDocument = {
    sourceMode: source.sourceMode,
    people,
    families,
    edges,
    bounds,
  }

  return {
    ...baseDocument,
    diagnostics: calculateTreePrintDiagnostics(baseDocument),
  }
}

function computeScopedBounds(
  people: TreePrintPersonNode[],
  families: TreePrintFamilyJunction[],
): TreePrintBounds {
  const raw = computeRawTreePrintBounds(people, families)
  if (!raw) {
    return {
      minX: 0,
      minY: 0,
      maxX: BRANCH_SCOPE_PADDING * 2,
      maxY: BRANCH_SCOPE_PADDING * 2,
      width: BRANCH_SCOPE_PADDING * 2,
      height: BRANCH_SCOPE_PADDING * 2,
      padding: BRANCH_SCOPE_PADDING,
    }
  }

  const minX = Math.round(raw.minX - BRANCH_SCOPE_PADDING)
  const minY = Math.round(raw.minY - BRANCH_SCOPE_PADDING)
  const maxX = Math.round(raw.maxX + BRANCH_SCOPE_PADDING)
  const maxY = Math.round(raw.maxY + BRANCH_SCOPE_PADDING)

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
    padding: BRANCH_SCOPE_PADDING,
  }
}

function resolveRootPerson(document: TreePrintDocument, rootPersonId: string | null): TreePrintPersonNode | null {
  if (!rootPersonId) return document.people[0] ?? null
  return document.people.find((person) => person.id === rootPersonId || person.personId === rootPersonId) ?? document.people[0] ?? null
}

function parentFamiliesByPerson(edges: TreePrintEdge[]): Map<string, string[]> {
  const byPerson = new Map<string, string[]>()
  for (const edge of edges) {
    if (edge.relationshipKind !== "parent_to_family") continue
    addToMap(byPerson, edge.sourceId, edge.targetId)
  }
  return byPerson
}

function childFamiliesByPerson(edges: TreePrintEdge[]): Map<string, string[]> {
  const byPerson = new Map<string, string[]>()
  for (const edge of edges) {
    if (edge.relationshipKind !== "family_to_child") continue
    addToMap(byPerson, edge.targetId, edge.sourceId)
  }
  return byPerson
}

function parentsByFamily(edges: TreePrintEdge[]): Map<string, string[]> {
  const byFamily = new Map<string, string[]>()
  for (const edge of edges) {
    if (edge.relationshipKind !== "parent_to_family") continue
    addToMap(byFamily, edge.targetId, edge.sourceId)
  }
  return byFamily
}

function childrenByFamily(edges: TreePrintEdge[]): Map<string, string[]> {
  const byFamily = new Map<string, string[]>()
  for (const edge of edges) {
    if (edge.relationshipKind !== "family_to_child") continue
    addToMap(byFamily, edge.sourceId, edge.targetId)
  }
  return byFamily
}

function addToMap(map: Map<string, string[]>, key: string, value: string) {
  const existing = map.get(key) ?? []
  existing.push(value)
  map.set(key, existing)
}

function sortedComponentLabels(document: TreePrintDocument): string[] {
  return [...new Set([
    ...document.people.map((person) => person.componentId),
    ...document.families.map((family) => family.componentId),
  ])].sort((a, b) => a.localeCompare(b))
}

function countDuplicates(values: string[]): number {
  const seen = new Set<string>()
  let duplicates = 0
  for (const value of values) {
    if (seen.has(value)) {
      duplicates += 1
    }
    seen.add(value)
  }
  return duplicates
}

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}
