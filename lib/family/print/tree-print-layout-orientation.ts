import { computeTreePrintBounds } from "@/lib/family/print/tree-print-bounds"
import {
  packTreePrintComponents,
  type TreePrintComponentPackingDiagnostics,
  type TreePrintPositionedComponent,
} from "@/lib/family/print/tree-print-component-packing"
import {
  collectTreePrintSemanticCoupleRelations,
  TREE_PRINT_COUPLE_CROSS_COMPONENT_INVALID_CODE,
  TREE_PRINT_COUPLE_GENERATION_MISMATCH_CODE,
  TREE_PRINT_COUPLE_INVARIANT_TOLERANCE,
  TREE_PRINT_COUPLE_LAYOUT_AXIS_MISMATCH_CODE,
  TREE_PRINT_COUPLE_POST_PACKING_AXIS_MISMATCH_CODE,
  TREE_PRINT_GENERATION_CONSTRAINT_CYCLE_CODE,
  TREE_PRINT_LAYOUT_INVALID_COORDINATE_CODE,
  validateCoupleComponentInvariant,
  validateCoupleGenerationInvariant,
  validateCoupleLayoutAxisInvariant,
  type TreePrintCoupleInvariantViolation,
  type TreePrintSemanticCoupleRelation,
} from "@/lib/family/print/tree-print-couple-invariants"
import { calculateTreePrintDiagnostics } from "@/lib/family/print/tree-print-diagnostics"
import {
  layoutFlowForResolvedOrientation,
  resolvedOrientationForLayoutFlow,
  type TreePrintLayoutFlow,
  type TreePrintResolvedOrientation,
} from "@/lib/family/print/tree-print-orientation"
import {
  fontLayoutUnitToPt,
  layoutUnitToMm,
} from "@/lib/family/print/tree-print-units"
import type {
  TreePrintDocument,
  TreePrintEdge,
  TreePrintFamilyJunction,
  TreePrintPersonNode,
  TreePrintPoint,
  TreePrintRelationshipKind,
} from "@/lib/family/print/tree-print-types"

export type TreePrintPositionedNode = TreePrintPersonNode
export type TreePrintPositionedFamily = TreePrintFamilyJunction
export type TreePrintPositionedEdge = TreePrintEdge

export const TREE_PRINT_LAYOUT_ALGORITHM_VERSION = "A17P2P6_SEMANTIC_COUPLE_INVARIANT_V1"

export type TreePrintLayoutCandidateDiagnostics = {
  CONTENT_WIDTH_LAYOUT_UNITS: number
  CONTENT_HEIGHT_LAYOUT_UNITS: number
  CONTENT_ASPECT_RATIO: number
  NODE_OVERLAP_COUNT: number
  EDGE_CARD_INTERSECTION_COUNT: number
  EDGE_EDGE_CROSSING_COUNT_IF_AVAILABLE: number | null
  MAX_EDGE_SPAN: number
  TOTAL_EDGE_LENGTH: number
  COMPONENT_COUNT: number
  PACKED_COMPONENT_COUNT: number
  COMPONENT_OVERLAP_COUNT: number
  MISSING_COMPONENT_COUNT: number
  COMPONENT_PACKING_EFFICIENCY: number
  INTERNAL_WHITESPACE_RATIO: number
  BASELINE_INTERNAL_WHITESPACE_RATIO: number
  PACKING_IMPROVEMENT: number
  ESTIMATED_ARTBOARD_WIDTH_MM: number
  ESTIMATED_ARTBOARD_HEIGHT_MM: number
  ACTUAL_FONT_SIZE_PT: number
  ACTUAL_CARD_WIDTH_MM: number
  ACTUAL_CARD_HEIGHT_MM: number
  TREE_CROPPING_COUNT: number
  MISSING_PERSON_COUNT: number
  DUPLICATE_PERSON_COUNT: number
  MISSING_FAMILY_COUNT: number
  DUPLICATE_FAMILY_COUNT: number
  MISSING_EDGE_COUNT: number
  DUPLICATE_EDGE_COUNT: number
  DANGLING_EDGE_COUNT: number
  ZERO_LENGTH_EDGE_COUNT: number
  INVALID_EDGE_PATH_COUNT: number
  SEMANTIC_COUPLE_RELATION_COUNT: number
  COUPLE_GENERATION_MISMATCH_COUNT: number
  COUPLE_LAYOUT_AXIS_MISMATCH_COUNT: number
  COUPLE_POST_PACKING_AXIS_MISMATCH_COUNT: number
  COUPLE_CROSS_COMPONENT_INVALID_COUNT: number
  PRINT_LAYOUT_INVALID_COORDINATE_COUNT: number
  GENERATION_CONSTRAINT_CYCLE_COUNT: number
  NON_UNIFORM_COMPONENT_TRANSLATION_COUNT: number
  TEXT_UPRIGHT: true
  TREE_ROTATION_DEGREES: 0
  PERSON_CARD_TEXT_ROTATION_DEGREES: 0
}

export type TreePrintLayoutCandidate = {
  id: string
  layoutAlgorithmVersion: typeof TREE_PRINT_LAYOUT_ALGORITHM_VERSION
  orientation: TreePrintResolvedOrientation
  layoutFlow: TreePrintLayoutFlow
  document: TreePrintDocument
  nodes: TreePrintPositionedNode[]
  familyJunctions: TreePrintPositionedFamily[]
  edges: TreePrintPositionedEdge[]
  components: TreePrintPositionedComponent[]
  componentPacking: TreePrintComponentPackingDiagnostics
  bounds: TreePrintDocument["bounds"]
  diagnostics: TreePrintLayoutCandidateDiagnostics
}

type PersonGenerationState = {
  personGeneration: Map<string, number>
  familyGeneration: Map<string, number>
  semanticCoupleRelations: TreePrintSemanticCoupleRelation[]
  generationViolations: TreePrintCoupleInvariantViolation[]
}

const PERSON_LANE_GAP = 96
const GENERATION_GAP = 260

export function createTreePrintLayoutCandidates(document: TreePrintDocument): {
  landscape: TreePrintLayoutCandidate
  portrait: TreePrintLayoutCandidate
} {
  return {
    landscape: createTreePrintLayoutCandidate(document, "top-to-bottom"),
    portrait: createTreePrintLayoutCandidate(document, "left-to-right"),
  }
}

export function createTreePrintLayoutCandidate(
  document: TreePrintDocument,
  layoutFlow: TreePrintLayoutFlow,
): TreePrintLayoutCandidate {
  const orientation = resolvedOrientationForLayoutFlow(layoutFlow)
  const generationState = solveGenerations(document)
  const people = positionPeople(document, generationState.personGeneration, layoutFlow)
  const families = positionFamilies(document, people, generationState, layoutFlow)
  const edges = routeEdges(document.edges, people, families, layoutFlow)
  const bounds = computeTreePrintBounds(people, families, document.bounds.padding)
  const baseDocument = {
    sourceMode: document.sourceMode,
    people,
    families,
    edges,
    bounds,
  }
  const candidateDocument = {
    ...baseDocument,
    diagnostics: calculateTreePrintDiagnostics(baseDocument),
  }
  const postLayoutAxisValidation = validateCoupleLayoutAxisInvariant({
    people: candidateDocument.people,
    coupleRelations: generationState.semanticCoupleRelations,
    layoutFlow,
    tolerance: TREE_PRINT_COUPLE_INVARIANT_TOLERANCE,
    stage: "post-layout",
    diagnosticCode: TREE_PRINT_COUPLE_LAYOUT_AXIS_MISMATCH_CODE,
  })
  const postLayoutComponentValidation = validateCoupleComponentInvariant({
    people: candidateDocument.people,
    coupleRelations: generationState.semanticCoupleRelations,
    stage: "post-layout",
  })
  const packed = packTreePrintComponents(candidateDocument, layoutFlow)
  const postPackingAxisValidation = validateCoupleLayoutAxisInvariant({
    people: packed.document.people,
    coupleRelations: generationState.semanticCoupleRelations,
    layoutFlow,
    tolerance: TREE_PRINT_COUPLE_INVARIANT_TOLERANCE,
    stage: "post-packing",
    diagnosticCode: TREE_PRINT_COUPLE_POST_PACKING_AXIS_MISMATCH_CODE,
  })
  const postPackingComponentValidation = validateCoupleComponentInvariant({
    people: packed.document.people,
    coupleRelations: generationState.semanticCoupleRelations,
    stage: "post-packing",
  })
  const diagnostics = buildCandidateDiagnostics(document, packed.document, packed.diagnostics, {
    semanticCoupleRelations: generationState.semanticCoupleRelations,
    generationViolations: generationState.generationViolations,
    postLayoutViolations: [
      ...postLayoutAxisValidation.violations,
      ...postLayoutComponentValidation.violations,
    ],
    postPackingViolations: [
      ...postPackingAxisValidation.violations,
      ...postPackingComponentValidation.violations,
    ],
  })

  return {
    id: `print-layout-${orientation}-${layoutFlow}`,
    layoutAlgorithmVersion: TREE_PRINT_LAYOUT_ALGORITHM_VERSION,
    orientation,
    layoutFlow,
    document: packed.document,
    nodes: packed.document.people,
    familyJunctions: packed.document.families,
    edges: packed.document.edges,
    components: packed.components,
    componentPacking: packed.diagnostics,
    bounds: packed.document.bounds,
    diagnostics,
  }
}

function solveGenerations(document: TreePrintDocument): PersonGenerationState {
  const personGeneration = new Map<string, number>()
  const familyGeneration = new Map<string, number>()
  const relations = buildRelationshipMaps(document)
  const semanticCoupleRelations = collectTreePrintSemanticCoupleRelations(document)
  const spouseGroups = createDisjointSet(document.people.map((person) => person.id).sort())
  const peopleByComponent = groupPeopleByComponent(document.people)
  const generationViolations: TreePrintCoupleInvariantViolation[] = []

  for (const relation of semanticCoupleRelations) {
    spouseGroups.union(relation.sourcePersonId, relation.targetPersonId)
  }

  for (const [, people] of [...peopleByComponent.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const componentPersonIds = new Set(people.map((person) => person.id))
    const componentGroups = [...new Set(people.map((person) => spouseGroups.find(person.id)))].sort()
    const groupGeneration = new Map(componentGroups.map((groupId) => [groupId, 0]))
    const constraintsByKey = new Map<string, { parentGroup: string; childGroup: string; relationshipId: string }>()

    for (const [familyId, parents] of [...relations.parentsByFamily.entries()].sort(([a], [b]) => a.localeCompare(b))) {
      const children = (relations.childrenByFamily.get(familyId) ?? []).slice().sort()
      for (const parent of parents.slice().sort()) {
        if (!componentPersonIds.has(parent)) continue
        const parentGroup = spouseGroups.find(parent)
        for (const child of children) {
          if (!componentPersonIds.has(child)) continue
          const childGroup = spouseGroups.find(child)
          if (parentGroup === childGroup) {
            generationViolations.push({
              diagnosticCode: TREE_PRINT_GENERATION_CONSTRAINT_CYCLE_CODE,
              stage: "generation-solve",
              relationshipId: familyId,
              sourcePersonId: parent,
              targetPersonId: child,
              sourceGeneration: groupGeneration.get(parentGroup) ?? null,
              targetGeneration: groupGeneration.get(childGroup) ?? null,
              message: "Parent-child constraint collapses into the same spouse group.",
            })
            continue
          }
          const key = `${parentGroup}->${childGroup}:${familyId}`
          constraintsByKey.set(key, { parentGroup, childGroup, relationshipId: familyId })
        }
      }
    }

    const constraints = [...constraintsByKey.values()].sort((a, b) => {
      if (a.parentGroup !== b.parentGroup) return a.parentGroup.localeCompare(b.parentGroup)
      if (a.childGroup !== b.childGroup) return a.childGroup.localeCompare(b.childGroup)
      return a.relationshipId.localeCompare(b.relationshipId)
    })
    const maxIterations = Math.max(1, componentGroups.length)
    for (let iteration = 0; iteration < maxIterations; iteration += 1) {
      let changed = false
      for (const constraint of constraints) {
        const parentGeneration = groupGeneration.get(constraint.parentGroup) ?? 0
        const childGeneration = groupGeneration.get(constraint.childGroup) ?? 0
        const nextChildGeneration = parentGeneration + 1
        if (childGeneration < nextChildGeneration) {
          groupGeneration.set(constraint.childGroup, nextChildGeneration)
          changed = true
        }
      }
      if (!changed) break
    }

    for (const constraint of constraints) {
      const parentGeneration = groupGeneration.get(constraint.parentGroup) ?? 0
      const childGeneration = groupGeneration.get(constraint.childGroup) ?? 0
      if (childGeneration < parentGeneration + 1) {
        generationViolations.push({
          diagnosticCode: TREE_PRINT_GENERATION_CONSTRAINT_CYCLE_CODE,
          stage: "generation-solve",
          relationshipId: constraint.relationshipId,
          sourcePersonId: constraint.parentGroup,
          targetPersonId: constraint.childGroup,
          sourceGeneration: parentGeneration,
          targetGeneration: childGeneration,
          message: "Parent-child constraints did not converge within the component generation solver.",
        })
      }
    }

    const minGeneration = Math.min(...componentGroups.map((groupId) => groupGeneration.get(groupId) ?? 0))
    for (const person of people) {
      const groupId = spouseGroups.find(person.id)
      personGeneration.set(person.id, (groupGeneration.get(groupId) ?? 0) - minGeneration)
    }
  }

  for (const family of document.families) {
    const parents = relations.parentsByFamily.get(family.id) ?? []
    const children = relations.childrenByFamily.get(family.id) ?? []
    const parentGenerations = parents
      .map((personId) => personGeneration.get(personId))
      .filter((value): value is number => typeof value === "number")
    const childGenerations = children
      .map((personId) => personGeneration.get(personId))
      .filter((value): value is number => typeof value === "number")
    if (parentGenerations.length > 0) {
      familyGeneration.set(family.id, Math.min(...parentGenerations) + 0.5)
    } else if (childGenerations.length > 0) {
      familyGeneration.set(family.id, Math.max(0, Math.min(...childGenerations) - 0.5))
    } else {
      familyGeneration.set(family.id, 0.5)
    }
  }

  const generationValidation = validateCoupleGenerationInvariant({
    people: document.people,
    coupleRelations: semanticCoupleRelations,
    solvedGenerations: personGeneration,
    stage: "post-solve",
  })

  return {
    personGeneration,
    familyGeneration,
    semanticCoupleRelations,
    generationViolations: [
      ...generationViolations,
      ...generationValidation.violations,
    ],
  }
}

function positionPeople(
  document: TreePrintDocument,
  personGeneration: Map<string, number>,
  layoutFlow: TreePrintLayoutFlow,
): TreePrintPersonNode[] {
  const dimensions = personDimensions(document.people)
  const laneStep = layoutFlow === "top-to-bottom"
    ? dimensions.width + PERSON_LANE_GAP
    : dimensions.height + PERSON_LANE_GAP
  const generationStep = layoutFlow === "top-to-bottom"
    ? dimensions.height + GENERATION_GAP
    : dimensions.width + GENERATION_GAP
  const laneByPerson = assignLanes(document, personGeneration)

  return document.people.map((person) => {
    const generation = personGeneration.get(person.id) ?? 0
    const lane = laneByPerson.get(person.id) ?? 0
    const x = layoutFlow === "top-to-bottom" ? lane * laneStep : generation * generationStep
    const y = layoutFlow === "top-to-bottom" ? generation * generationStep : lane * laneStep

    return {
      ...person,
      x: Math.round(x),
      y: Math.round(y),
      layoutGenerationIndex: generation,
      layoutGenerationAxisAnchor: Math.round((layoutFlow === "top-to-bottom"
        ? y + person.height / 2
        : x + person.width / 2) * 100) / 100,
    }
  })
}

function positionFamilies(
  source: TreePrintDocument,
  people: TreePrintPersonNode[],
  generationState: PersonGenerationState,
  layoutFlow: TreePrintLayoutFlow,
): TreePrintFamilyJunction[] {
  const relations = buildRelationshipMaps(source)
  const peopleById = new Map(people.map((person) => [person.id, person]))
  const dimensions = personDimensions(source.people)
  const generationStep = layoutFlow === "top-to-bottom"
    ? dimensions.height + GENERATION_GAP
    : dimensions.width + GENERATION_GAP

  return source.families.map((family) => {
    const parents = (relations.parentsByFamily.get(family.id) ?? [])
      .map((id) => peopleById.get(id))
      .filter((person): person is TreePrintPersonNode => Boolean(person))
    const children = (relations.childrenByFamily.get(family.id) ?? [])
      .map((id) => peopleById.get(id))
      .filter((person): person is TreePrintPersonNode => Boolean(person))
    const connected = [...parents, ...children]
    const fallbackGeneration = generationState.familyGeneration.get(family.id) ?? 0.5

    if (layoutFlow === "top-to-bottom") {
      const x = connected.length > 0
        ? average(connected.map((person) => centerOfPerson(person).x))
        : fallbackGeneration * generationStep
      const parentBottom = parents.length > 0
        ? Math.max(...parents.map((person) => person.y + person.height))
        : fallbackGeneration * generationStep
      const childTop = children.length > 0
        ? Math.min(...children.map((person) => person.y))
        : parentBottom + GENERATION_GAP
      return {
        ...family,
        x: Math.round(x),
        y: Math.round((parentBottom + childTop) / 2),
      }
    }

    const parentRight = parents.length > 0
      ? Math.max(...parents.map((person) => person.x + person.width))
      : fallbackGeneration * generationStep
    const childLeft = children.length > 0
      ? Math.min(...children.map((person) => person.x))
      : parentRight + GENERATION_GAP
    const y = connected.length > 0
      ? average(connected.map((person) => centerOfPerson(person).y))
      : fallbackGeneration * generationStep
    return {
      ...family,
      x: Math.round((parentRight + childLeft) / 2),
      y: Math.round(y),
    }
  })
}

function assignLanes(
  document: TreePrintDocument,
  personGeneration: Map<string, number>,
): Map<string, number> {
  const semanticCoupleRelations = collectTreePrintSemanticCoupleRelations(document)
  const spouseParent = createDisjointSet(document.people.map((person) => person.id).sort())
  for (const relation of semanticCoupleRelations) {
    spouseParent.union(relation.sourcePersonId, relation.targetPersonId)
  }

  const peopleByGeneration = new Map<number, TreePrintPersonNode[]>()
  for (const person of document.people) {
    const generation = personGeneration.get(person.id) ?? 0
    const list = peopleByGeneration.get(generation) ?? []
    list.push(person)
    peopleByGeneration.set(generation, list)
  }

  const laneByPerson = new Map<string, number>()
  let nextLane = 0
  for (const generation of [...peopleByGeneration.keys()].sort((a, b) => a - b)) {
    const people = peopleByGeneration.get(generation) ?? []
    const groups = new Map<string, TreePrintPersonNode[]>()
    for (const person of people) {
      const root = spouseParent.find(person.id)
      const list = groups.get(root) ?? []
      list.push(person)
      groups.set(root, list)
    }

    const orderedGroups = [...groups.values()].sort((a, b) => {
      const aFirst = a.slice().sort(compareSourcePeople)[0]
      const bFirst = b.slice().sort(compareSourcePeople)[0]
      return compareSourcePeople(aFirst, bFirst)
    })

    for (const group of orderedGroups) {
      for (const person of group.slice().sort(compareSourcePeople)) {
        laneByPerson.set(person.id, nextLane)
        nextLane += 1
      }
    }
  }

  return laneByPerson
}

function routeEdges(
  sourceEdges: TreePrintEdge[],
  people: TreePrintPersonNode[],
  families: TreePrintFamilyJunction[],
  layoutFlow: TreePrintLayoutFlow,
): TreePrintEdge[] {
  const byId = new Map<string, TreePrintPersonNode | TreePrintFamilyJunction>([
    ...people.map((node) => [node.id, node] as const),
    ...families.map((node) => [node.id, node] as const),
  ])

  return sourceEdges.flatMap((edge) => {
    const source = byId.get(edge.sourceId)
    const target = byId.get(edge.targetId)
    if (!source || !target) return []

    return [{
      ...edge,
      points: routeEdge(edge.relationshipKind, source, target, layoutFlow),
    }]
  })
}

function routeEdge(
  kind: TreePrintRelationshipKind,
  source: TreePrintPersonNode | TreePrintFamilyJunction,
  target: TreePrintPersonNode | TreePrintFamilyJunction,
  layoutFlow: TreePrintLayoutFlow,
): TreePrintPoint[] {
  if (kind === "couple") {
    const sourceCenter = nodeCenter(source)
    const targetCenter = nodeCenter(target)
    if (layoutFlow === "left-to-right") {
      const sourceSide = sourceCenter.y <= targetCenter.y ? "bottom" : "top"
      const targetSide = sourceCenter.y <= targetCenter.y ? "top" : "bottom"
      const start = attachmentPoint(source, sourceSide)
      const end = attachmentPoint(target, targetSide)
      const midY = Math.round((start.y + end.y) / 2)
      return [start, { x: start.x, y: midY }, { x: end.x, y: midY }, end]
    }

    const sourceSide = sourceCenter.x <= targetCenter.x ? "right" : "left"
    const targetSide = sourceCenter.x <= targetCenter.x ? "left" : "right"
    const start = attachmentPoint(source, sourceSide)
    const end = attachmentPoint(target, targetSide)
    const midX = Math.round((start.x + end.x) / 2)
    return [start, { x: midX, y: start.y }, { x: midX, y: end.y }, end]
  }

  if (layoutFlow === "left-to-right") {
    const start = attachmentPoint(source, kind === "family_to_child" ? "center" : "right")
    const end = attachmentPoint(target, kind === "family_to_child" ? "left" : "center")
    const midX = Math.round((start.x + end.x) / 2)
    return [start, { x: midX, y: start.y }, { x: midX, y: end.y }, end]
  }

  const start = attachmentPoint(source, kind === "family_to_child" ? "center" : "bottom")
  const end = attachmentPoint(target, kind === "family_to_child" ? "top" : "center")
  const midY = Math.round((start.y + end.y) / 2)
  return [start, { x: start.x, y: midY }, { x: end.x, y: midY }, end]
}

function buildCandidateDiagnostics(
  source: TreePrintDocument,
  document: TreePrintDocument,
  componentPacking: TreePrintComponentPackingDiagnostics,
  invariants: {
    semanticCoupleRelations: TreePrintSemanticCoupleRelation[]
    generationViolations: TreePrintCoupleInvariantViolation[]
    postLayoutViolations: TreePrintCoupleInvariantViolation[]
    postPackingViolations: TreePrintCoupleInvariantViolation[]
  },
): TreePrintLayoutCandidateDiagnostics {
  const contentAspectRatio = document.bounds.width / Math.max(1, document.bounds.height)
  const sourcePeople = new Set(source.people.map((person) => person.id))
  const sourceFamilies = new Set(source.families.map((family) => family.id))
  const sourceEdges = new Set(source.edges.map((edge) => edge.id))
  const peopleIds = document.people.map((person) => person.id)
  const familyIds = document.families.map((family) => family.id)
  const edgeIds = document.edges.map((edge) => edge.id)
  const nodeIds = new Set([...peopleIds, ...familyIds])
  const zeroLengthEdgeCount = document.edges.filter((edge) => edgeLength(edge) <= 0).length
  const invalidEdgePathCount = document.edges.filter((edge) =>
    edge.points.length < 2 || edge.points.some((point) => !Number.isFinite(point.x) || !Number.isFinite(point.y)),
  ).length
  const cardWidth = document.people[0]?.width ?? source.people[0]?.width ?? 190
  const cardHeight = document.people[0]?.height ?? source.people[0]?.height ?? 118
  const invariantViolations = [
    ...invariants.generationViolations,
    ...invariants.postLayoutViolations,
    ...invariants.postPackingViolations,
  ]

  return {
    CONTENT_WIDTH_LAYOUT_UNITS: document.bounds.width,
    CONTENT_HEIGHT_LAYOUT_UNITS: document.bounds.height,
    CONTENT_ASPECT_RATIO: roundTo(contentAspectRatio, 4),
    NODE_OVERLAP_COUNT: document.diagnostics.NODE_OVERLAP_COUNT,
    EDGE_CARD_INTERSECTION_COUNT: document.diagnostics.EDGE_CARD_INTERSECTION_COUNT,
    EDGE_EDGE_CROSSING_COUNT_IF_AVAILABLE: null,
    MAX_EDGE_SPAN: Math.max(
      document.diagnostics.MAX_HORIZONTAL_EDGE_SPAN,
      document.diagnostics.MAX_VERTICAL_EDGE_SPAN,
    ),
    TOTAL_EDGE_LENGTH: roundTo(document.edges.reduce((sum, edge) => sum + edgeLength(edge), 0), 2),
    COMPONENT_COUNT: document.diagnostics.CONNECTED_COMPONENT_COUNT,
    PACKED_COMPONENT_COUNT: componentPacking.PACKED_COMPONENT_COUNT,
    COMPONENT_OVERLAP_COUNT: componentPacking.COMPONENT_OVERLAP_COUNT,
    MISSING_COMPONENT_COUNT: componentPacking.MISSING_COMPONENT_COUNT,
    COMPONENT_PACKING_EFFICIENCY: componentPacking.COMPONENT_PACKING_EFFICIENCY,
    INTERNAL_WHITESPACE_RATIO: componentPacking.INTERNAL_WHITESPACE_RATIO,
    BASELINE_INTERNAL_WHITESPACE_RATIO: componentPacking.BASELINE_INTERNAL_WHITESPACE_RATIO,
    PACKING_IMPROVEMENT: componentPacking.PACKING_IMPROVEMENT,
    ESTIMATED_ARTBOARD_WIDTH_MM: roundTo(layoutUnitToMm(document.bounds.width), 2),
    ESTIMATED_ARTBOARD_HEIGHT_MM: roundTo(layoutUnitToMm(document.bounds.height), 2),
    ACTUAL_FONT_SIZE_PT: roundTo(fontLayoutUnitToPt(14, 1), 2),
    ACTUAL_CARD_WIDTH_MM: roundTo(layoutUnitToMm(cardWidth), 2),
    ACTUAL_CARD_HEIGHT_MM: roundTo(layoutUnitToMm(cardHeight), 2),
    TREE_CROPPING_COUNT: document.diagnostics.OUT_OF_BOUNDS_NODE_COUNT,
    MISSING_PERSON_COUNT: countMissing(sourcePeople, peopleIds),
    DUPLICATE_PERSON_COUNT: countDuplicates(peopleIds),
    MISSING_FAMILY_COUNT: countMissing(sourceFamilies, familyIds),
    DUPLICATE_FAMILY_COUNT: countDuplicates(familyIds),
    MISSING_EDGE_COUNT: countMissing(sourceEdges, edgeIds),
    DUPLICATE_EDGE_COUNT: countDuplicates(edgeIds),
    DANGLING_EDGE_COUNT: document.edges.filter((edge) => !nodeIds.has(edge.sourceId) || !nodeIds.has(edge.targetId)).length,
    ZERO_LENGTH_EDGE_COUNT: zeroLengthEdgeCount,
    INVALID_EDGE_PATH_COUNT: invalidEdgePathCount,
    SEMANTIC_COUPLE_RELATION_COUNT: invariants.semanticCoupleRelations.length,
    COUPLE_GENERATION_MISMATCH_COUNT: countViolations(invariantViolations, TREE_PRINT_COUPLE_GENERATION_MISMATCH_CODE),
    COUPLE_LAYOUT_AXIS_MISMATCH_COUNT: countViolations(invariants.postLayoutViolations, TREE_PRINT_COUPLE_LAYOUT_AXIS_MISMATCH_CODE),
    COUPLE_POST_PACKING_AXIS_MISMATCH_COUNT: countViolations(invariants.postPackingViolations, TREE_PRINT_COUPLE_POST_PACKING_AXIS_MISMATCH_CODE),
    COUPLE_CROSS_COMPONENT_INVALID_COUNT: countViolations(invariantViolations, TREE_PRINT_COUPLE_CROSS_COMPONENT_INVALID_CODE),
    PRINT_LAYOUT_INVALID_COORDINATE_COUNT: countViolations(invariantViolations, TREE_PRINT_LAYOUT_INVALID_COORDINATE_CODE),
    GENERATION_CONSTRAINT_CYCLE_COUNT: countViolations(invariantViolations, TREE_PRINT_GENERATION_CONSTRAINT_CYCLE_CODE),
    NON_UNIFORM_COMPONENT_TRANSLATION_COUNT: componentPacking.NON_UNIFORM_COMPONENT_TRANSLATION_COUNT,
    TEXT_UPRIGHT: true,
    TREE_ROTATION_DEGREES: 0,
    PERSON_CARD_TEXT_ROTATION_DEGREES: 0,
  }
}

function buildRelationshipMaps(document: TreePrintDocument) {
  const parentsByFamily = new Map<string, string[]>()
  const childrenByFamily = new Map<string, string[]>()

  for (const edge of document.edges) {
    if (edge.relationshipKind === "parent_to_family") {
      addToMap(parentsByFamily, edge.targetId, edge.sourceId)
    } else if (edge.relationshipKind === "family_to_child") {
      addToMap(childrenByFamily, edge.sourceId, edge.targetId)
    }
  }

  return {
    parentsByFamily,
    childrenByFamily,
  }
}

function groupPeopleByComponent(people: TreePrintPersonNode[]): Map<string, TreePrintPersonNode[]> {
  const byComponent = new Map<string, TreePrintPersonNode[]>()
  for (const person of people) {
    const list = byComponent.get(person.componentId) ?? []
    list.push(person)
    byComponent.set(person.componentId, list)
  }
  return byComponent
}

function personDimensions(people: TreePrintPersonNode[]): { width: number; height: number } {
  return {
    width: Math.max(190, ...people.map((person) => person.width)),
    height: Math.max(118, ...people.map((person) => person.height)),
  }
}

function nodeCenter(node: TreePrintPersonNode | TreePrintFamilyJunction): TreePrintPoint {
  if ("radius" in node) return { x: node.x, y: node.y }
  return centerOfPerson(node)
}

function centerOfPerson(person: TreePrintPersonNode): TreePrintPoint {
  return {
    x: person.x + person.width / 2,
    y: person.y + person.height / 2,
  }
}

function attachmentPoint(
  node: TreePrintPersonNode | TreePrintFamilyJunction,
  side: "top" | "bottom" | "left" | "right" | "center",
): TreePrintPoint {
  if ("radius" in node) return nodeCenter(node)
  if (side === "top") return { x: node.x + node.width / 2, y: node.y }
  if (side === "bottom") return { x: node.x + node.width / 2, y: node.y + node.height }
  if (side === "left") return { x: node.x, y: node.y + node.height / 2 }
  if (side === "right") return { x: node.x + node.width, y: node.y + node.height / 2 }
  return centerOfPerson(node)
}

function edgeLength(edge: TreePrintEdge): number {
  let total = 0
  for (let index = 0; index < edge.points.length - 1; index += 1) {
    const start = edge.points[index]
    const end = edge.points[index + 1]
    const dx = end.x - start.x
    const dy = end.y - start.y
    total += Math.sqrt(dx * dx + dy * dy)
  }
  return total
}

function addToMap(map: Map<string, string[]>, key: string, value: string) {
  const existing = map.get(key) ?? []
  existing.push(value)
  map.set(key, existing)
}

function compareSourcePeople(a: TreePrintPersonNode, b: TreePrintPersonNode): number {
  if (a.componentId !== b.componentId) return a.componentId.localeCompare(b.componentId)
  if (a.x !== b.x) return a.x - b.x
  if (a.y !== b.y) return a.y - b.y
  return a.id.localeCompare(b.id)
}

function average(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function countMissing(sourceIds: Set<string>, actualIds: string[]): number {
  const actual = new Set(actualIds)
  return [...sourceIds].filter((id) => !actual.has(id)).length
}

function countDuplicates(values: string[]): number {
  const seen = new Set<string>()
  let duplicates = 0
  for (const value of values) {
    if (seen.has(value)) duplicates += 1
    seen.add(value)
  }
  return duplicates
}

function countViolations(violations: TreePrintCoupleInvariantViolation[], diagnosticCode: string): number {
  return violations.filter((violation) => violation.diagnosticCode === diagnosticCode).length
}

function createDisjointSet(ids: string[]) {
  const parent = new Map(ids.map((id) => [id, id]))

  function find(id: string): string {
    const current = parent.get(id) ?? id
    if (current === id) {
      parent.set(id, id)
      return id
    }
    const root = find(current)
    parent.set(id, root)
    return root
  }

  function union(a: string, b: string) {
    const rootA = find(a)
    const rootB = find(b)
    if (rootA !== rootB) {
      const keep = rootA <= rootB ? rootA : rootB
      const replace = rootA <= rootB ? rootB : rootA
      parent.set(replace, keep)
    }
  }

  return { find, union }
}

function roundTo(value: number, fractionDigits: number): number {
  const factor = 10 ** fractionDigits
  return Math.round(value * factor) / factor
}

export function getTreePrintLayoutFlowForOrientation(
  orientation: TreePrintResolvedOrientation,
): TreePrintLayoutFlow {
  return layoutFlowForResolvedOrientation(orientation)
}
