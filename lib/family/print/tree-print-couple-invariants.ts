import type { TreePrintLayoutFlow } from "@/lib/family/print/tree-print-orientation"
import type {
  TreePrintDocument,
  TreePrintEdge,
  TreePrintPersonNode,
} from "@/lib/family/print/tree-print-types"

export const TREE_PRINT_COUPLE_INVARIANT_TOLERANCE = 0.01
export const TREE_PRINT_COUPLE_GENERATION_MISMATCH_CODE = "A17P2P6_COUPLE_GENERATION_MISMATCH"
export const TREE_PRINT_COUPLE_LAYOUT_AXIS_MISMATCH_CODE = "A17P2P6_COUPLE_LAYOUT_AXIS_MISMATCH"
export const TREE_PRINT_COUPLE_POST_PACKING_AXIS_MISMATCH_CODE = "A17P2P6_COUPLE_POST_PACKING_AXIS_MISMATCH"
export const TREE_PRINT_COUPLE_CROSS_COMPONENT_INVALID_CODE = "A17P2P6_COUPLE_CROSS_COMPONENT_INVALID"
export const TREE_PRINT_LAYOUT_INVALID_COORDINATE_CODE = "A17P2P6_PRINT_LAYOUT_INVALID_COORDINATE"
export const TREE_PRINT_GENERATION_CONSTRAINT_CYCLE_CODE = "A17P2P6_GENERATION_CONSTRAINT_CYCLE"

export type TreePrintSemanticCoupleRelationSource =
  | "EXPLICIT_COUPLE_EDGE"
  | "SHARED_FAMILY_PARENTS"

export type TreePrintSemanticCoupleRelation = {
  relationshipId: string
  sourcePersonId: string
  targetPersonId: string
  source: TreePrintSemanticCoupleRelationSource
  familyId?: string | null
}

export type TreePrintCoupleInvariantViolation = {
  diagnosticCode: string
  stage: string
  relationshipId: string
  sourcePersonId: string
  targetPersonId: string
  sourceGeneration?: number | null
  targetGeneration?: number | null
  sourceAxis?: number | null
  targetAxis?: number | null
  sourceComponentId?: string | null
  targetComponentId?: string | null
  sourceTranslation?: { dx: number; dy: number } | null
  targetTranslation?: { dx: number; dy: number } | null
  message: string
}

export type TreePrintCoupleInvariantValidation = {
  valid: boolean
  violations: TreePrintCoupleInvariantViolation[]
}

export function collectTreePrintSemanticCoupleRelations(
  document: Pick<TreePrintDocument, "people" | "edges">,
): TreePrintSemanticCoupleRelation[] {
  const personIds = new Set(document.people.map((person) => person.id))
  const relations: TreePrintSemanticCoupleRelation[] = []

  for (const edge of document.edges.slice().sort(compareEdges)) {
    if (edge.relationshipKind !== "couple") continue
    if (!personIds.has(edge.sourceId) || !personIds.has(edge.targetId)) continue
    relations.push(canonicalRelation({
      relationshipId: edge.id,
      sourcePersonId: edge.sourceId,
      targetPersonId: edge.targetId,
      source: "EXPLICIT_COUPLE_EDGE",
      familyId: null,
    }))
  }

  const parentsByFamily = new Map<string, string[]>()
  for (const edge of document.edges.slice().sort(compareEdges)) {
    if (edge.relationshipKind !== "parent_to_family") continue
    if (!personIds.has(edge.sourceId)) continue
    const list = parentsByFamily.get(edge.targetId) ?? []
    list.push(edge.sourceId)
    parentsByFamily.set(edge.targetId, list)
  }

  for (const [familyId, parents] of [...parentsByFamily.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const uniqueParents = [...new Set(parents)].sort()
    for (let index = 0; index < uniqueParents.length; index += 1) {
      for (let next = index + 1; next < uniqueParents.length; next += 1) {
        const sourcePersonId = uniqueParents[index]
        const targetPersonId = uniqueParents[next]
        relations.push(canonicalRelation({
          relationshipId: `${familyId}:shared-parents:${sourcePersonId}:${targetPersonId}`,
          sourcePersonId,
          targetPersonId,
          source: "SHARED_FAMILY_PARENTS",
          familyId,
        }))
      }
    }
  }

  return relations.sort(compareRelations)
}

export function validateCoupleGenerationInvariant(input: {
  people: TreePrintPersonNode[]
  coupleRelations: TreePrintSemanticCoupleRelation[]
  solvedGenerations: Map<string, number>
  stage?: string
}): TreePrintCoupleInvariantValidation {
  const components = componentByPerson(input.people)
  const violations: TreePrintCoupleInvariantViolation[] = []
  const stage = input.stage ?? "post-solve"

  for (const relation of input.coupleRelations) {
    const sourceGeneration = input.solvedGenerations.get(relation.sourcePersonId) ?? null
    const targetGeneration = input.solvedGenerations.get(relation.targetPersonId) ?? null
    if (sourceGeneration === targetGeneration && sourceGeneration !== null) continue

    violations.push({
      diagnosticCode: TREE_PRINT_COUPLE_GENERATION_MISMATCH_CODE,
      stage,
      relationshipId: relation.relationshipId,
      sourcePersonId: relation.sourcePersonId,
      targetPersonId: relation.targetPersonId,
      sourceGeneration,
      targetGeneration,
      sourceComponentId: components.get(relation.sourcePersonId) ?? null,
      targetComponentId: components.get(relation.targetPersonId) ?? null,
      message: "Semantic couple endpoints must resolve to the same print generation.",
    })
  }

  return {
    valid: violations.length === 0,
    violations,
  }
}

export function validateCoupleLayoutAxisInvariant(input: {
  people: TreePrintPersonNode[]
  coupleRelations: TreePrintSemanticCoupleRelation[]
  layoutFlow: TreePrintLayoutFlow
  tolerance?: number
  stage?: string
  diagnosticCode?: string
}): TreePrintCoupleInvariantValidation {
  const peopleById = new Map(input.people.map((person) => [person.id, person]))
  const components = componentByPerson(input.people)
  const tolerance = input.tolerance ?? TREE_PRINT_COUPLE_INVARIANT_TOLERANCE
  const stage = input.stage ?? "post-layout"
  const diagnosticCode = input.diagnosticCode ?? TREE_PRINT_COUPLE_LAYOUT_AXIS_MISMATCH_CODE
  const violations: TreePrintCoupleInvariantViolation[] = []

  for (const relation of input.coupleRelations) {
    const source = peopleById.get(relation.sourcePersonId)
    const target = peopleById.get(relation.targetPersonId)
    const sourceAxis = source ? generationAxisAnchor(source, input.layoutFlow) : null
    const targetAxis = target ? generationAxisAnchor(target, input.layoutFlow) : null

    if (!isFiniteNumber(sourceAxis) || !isFiniteNumber(targetAxis)) {
      violations.push({
        diagnosticCode: TREE_PRINT_LAYOUT_INVALID_COORDINATE_CODE,
        stage,
        relationshipId: relation.relationshipId,
        sourcePersonId: relation.sourcePersonId,
        targetPersonId: relation.targetPersonId,
        sourceAxis,
        targetAxis,
        sourceComponentId: components.get(relation.sourcePersonId) ?? null,
        targetComponentId: components.get(relation.targetPersonId) ?? null,
        message: "Semantic couple endpoint is missing a finite generation-axis coordinate.",
      })
      continue
    }

    if (Math.abs(sourceAxis - targetAxis) <= tolerance) continue

    violations.push({
      diagnosticCode,
      stage,
      relationshipId: relation.relationshipId,
      sourcePersonId: relation.sourcePersonId,
      targetPersonId: relation.targetPersonId,
      sourceGeneration: source?.layoutGenerationIndex ?? null,
      targetGeneration: target?.layoutGenerationIndex ?? null,
      sourceAxis,
      targetAxis,
      sourceComponentId: source?.componentId ?? null,
      targetComponentId: target?.componentId ?? null,
      message: "Semantic couple endpoints must stay on the same generation axis after layout.",
    })
  }

  return {
    valid: violations.length === 0,
    violations,
  }
}

export function validateCoupleComponentInvariant(input: {
  people: TreePrintPersonNode[]
  coupleRelations: TreePrintSemanticCoupleRelation[]
  stage?: string
}): TreePrintCoupleInvariantValidation {
  const components = componentByPerson(input.people)
  const stage = input.stage ?? "post-packing"
  const violations: TreePrintCoupleInvariantViolation[] = []

  for (const relation of input.coupleRelations) {
    const sourceComponentId = components.get(relation.sourcePersonId) ?? null
    const targetComponentId = components.get(relation.targetPersonId) ?? null
    if (sourceComponentId && targetComponentId && sourceComponentId === targetComponentId) continue

    violations.push({
      diagnosticCode: TREE_PRINT_COUPLE_CROSS_COMPONENT_INVALID_CODE,
      stage,
      relationshipId: relation.relationshipId,
      sourcePersonId: relation.sourcePersonId,
      targetPersonId: relation.targetPersonId,
      sourceComponentId,
      targetComponentId,
      message: "Semantic couple endpoints must belong to the same connected component.",
    })
  }

  return {
    valid: violations.length === 0,
    violations,
  }
}

function canonicalRelation(relation: TreePrintSemanticCoupleRelation): TreePrintSemanticCoupleRelation {
  if (relation.sourcePersonId <= relation.targetPersonId) return relation
  return {
    ...relation,
    sourcePersonId: relation.targetPersonId,
    targetPersonId: relation.sourcePersonId,
  }
}

function compareRelations(a: TreePrintSemanticCoupleRelation, b: TreePrintSemanticCoupleRelation): number {
  if (a.sourcePersonId !== b.sourcePersonId) return a.sourcePersonId.localeCompare(b.sourcePersonId)
  if (a.targetPersonId !== b.targetPersonId) return a.targetPersonId.localeCompare(b.targetPersonId)
  if (a.source !== b.source) return a.source.localeCompare(b.source)
  return a.relationshipId.localeCompare(b.relationshipId)
}

function compareEdges(a: TreePrintEdge, b: TreePrintEdge): number {
  return a.id.localeCompare(b.id)
}

function componentByPerson(people: TreePrintPersonNode[]): Map<string, string> {
  return new Map(people.map((person) => [person.id, person.componentId]))
}

function generationAxisAnchor(person: TreePrintPersonNode, layoutFlow: TreePrintLayoutFlow): number {
  const axis = layoutFlow === "top-to-bottom"
    ? person.y + person.height / 2
    : person.x + person.width / 2
  return Math.round(axis * 100) / 100
}

function isFiniteNumber(value: number | null): value is number {
  return typeof value === "number" && Number.isFinite(value)
}
