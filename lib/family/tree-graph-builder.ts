import type { Person } from "@/lib/family/people-types";
import type {
  CoupleRelationship,
  Family,
  FamilyChild,
  FamilyParent,
} from "@/lib/family/relationship-types";
import type {
  FamilyTreeGraph,
  TreeBuilderInput,
  TreeBuildOptions,
  TreeGraphNode,
  TreeRelationshipEdge,
} from "@/lib/family/tree-types";

function yearOf(value: string | null) {
  return value ? value.slice(0, 4) : null;
}

function canShowVisibility(
  visibility: "public" | "family" | "private",
  mode: TreeBuildOptions["mode"],
) {
  if (mode === "admin") {
    return true;
  }

  if (mode === "internal") {
    return visibility === "public" || visibility === "family";
  }

  return visibility === "public";
}

function visiblePerson(person: Person, mode: TreeBuildOptions["mode"]) {
  if (person.deleted_at) {
    return false;
  }

  if (!canShowVisibility(person.visibility, mode)) {
    return false;
  }

  if (mode === "public" && person.is_living && person.visibility !== "public") {
    return false;
  }

  return true;
}

function visibleFamily(family: Family, mode: TreeBuildOptions["mode"]) {
  return !family.deleted_at && canShowVisibility(family.visibility, mode);
}

function visibleParent(row: FamilyParent) {
  return !row.deleted_at;
}

function visibleChild(row: FamilyChild) {
  return !row.deleted_at;
}

function visibleCouple(
  row: CoupleRelationship,
  mode: TreeBuildOptions["mode"],
) {
  return !row.deleted_at && canShowVisibility(row.visibility, mode);
}

function toPersonNode(person: Person): TreeGraphNode {
  return {
    id: `person:${person.id}`,
    kind: "person",
    personId: person.id,
    fullName: person.full_name,
    displayName: person.display_name,
    birthYear: yearOf(person.birth_date),
    deathYear: yearOf(person.death_date),
    isLiving: person.is_living,
    branchName: person.branch_name,
    generationNumber: person.generation_number,
    visibility: person.visibility,
    position: {
      x: 0,
      y: 0,
    },
  };
}

function toFamilyNode(family: Family): TreeGraphNode {
  return {
    id: `family:${family.id}`,
    kind: "family",
    familyId: family.id,
    label: family.family_label || family.family_code || "Family unit",
    visibility: family.visibility,
    position: {
      x: 0,
      y: 0,
    },
  };
}

export function buildFamilyTreeGraph(
  input: TreeBuilderInput,
  options: TreeBuildOptions = { mode: "admin" },
): FamilyTreeGraph {
  const visiblePeople = input.people.filter((person) =>
    visiblePerson(person, options.mode),
  );
  const personIds = new Set(visiblePeople.map((person) => person.id));
  const families = input.families.filter((family) =>
    visibleFamily(family, options.mode),
  );
  const familyIds = new Set(families.map((family) => family.id));

  const familyParents = input.familyParents.filter(
    (row) =>
      visibleParent(row) &&
      familyIds.has(row.family_id) &&
      personIds.has(row.person_id),
  );
  const familyChildren = input.familyChildren.filter(
    (row) =>
      visibleChild(row) &&
      familyIds.has(row.family_id) &&
      personIds.has(row.person_id),
  );
  const coupleRelationships = input.coupleRelationships.filter(
    (row) =>
      visibleCouple(row, options.mode) &&
      personIds.has(row.person1_id) &&
      personIds.has(row.person2_id),
  );

  const familiesWithEdges = families.filter((family) => {
    return (
      familyParents.some((row) => row.family_id === family.id) ||
      familyChildren.some((row) => row.family_id === family.id)
    );
  });
  const nodes: TreeGraphNode[] = [
    ...visiblePeople.map(toPersonNode),
    ...familiesWithEdges.map(toFamilyNode),
  ];
  const familyNodeIds = new Set(familiesWithEdges.map((family) => family.id));
  const edges: TreeRelationshipEdge[] = [];

  for (const parent of familyParents) {
    if (!familyNodeIds.has(parent.family_id)) {
      continue;
    }

    edges.push({
      id: `parent:${parent.id}`,
      kind: "family_unit",
      source: `person:${parent.person_id}`,
      target: `family:${parent.family_id}`,
      label: parent.parent_role,
      sourceEntityId: parent.id,
    });
  }

  for (const child of familyChildren) {
    if (!familyNodeIds.has(child.family_id)) {
      continue;
    }

    edges.push({
      id: `child:${child.id}`,
      kind: "parent_child",
      source: `family:${child.family_id}`,
      target: `person:${child.person_id}`,
      label: child.child_relationship_type,
      sourceEntityId: child.id,
    });
  }

  for (const couple of coupleRelationships) {
    edges.push({
      id: `couple:${couple.id}`,
      kind: "couple",
      source: `person:${couple.person1_id}`,
      target: `person:${couple.person2_id}`,
      label: couple.relationship_status,
      sourceEntityId: couple.id,
    });
  }

  return {
    nodes,
    edges,
    meta: {
      mode: options.mode,
      personCount: visiblePeople.length,
      familyCount: familiesWithEdges.length,
      coupleCount: coupleRelationships.length,
    },
  };
}
