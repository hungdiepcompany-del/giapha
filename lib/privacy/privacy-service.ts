import type { Person } from "@/lib/family/people-types";
import type {
  FamilyTreeGraph,
  TreeGraphNode,
  TreePersonNode,
} from "@/lib/family/tree-types";
import type {
  AdminPerson,
  FamilyPerson,
  PrivacyMode,
  PublicPerson,
} from "@/lib/privacy/privacy-types";

export type PublicPersonSource = Pick<
  Person,
  | "id"
  | "slug"
  | "full_name"
  | "display_name"
  | "is_living"
  | "generation_number"
  | "branch_name"
  | "visibility"
  | "deleted_at"
> & {
  birth_date?: string | null;
  death_date?: string | null;
};

function yearOf(value: string | null | undefined) {
  return value ? value.slice(0, 4) : null;
}

function safeLabel(person: PublicPersonSource) {
  return person.display_name || person.full_name;
}

export function canShowPersonInMode(
  person: PublicPersonSource,
  mode: PrivacyMode,
) {
  if (person.deleted_at) {
    return false;
  }

  if (mode === "admin") {
    return true;
  }

  if (mode === "family") {
    return person.visibility === "public" || person.visibility === "family";
  }

  return person.visibility === "public";
}

export function toPublicPerson(person: PublicPersonSource): PublicPerson | null {
  if (!canShowPersonInMode(person, "public")) {
    return null;
  }

  const isLiving = person.is_living;

  return {
    id: person.id,
    slug: person.slug,
    label: safeLabel(person),
    full_name: person.full_name,
    display_name: person.display_name,
    is_living: person.is_living,
    life_status: person.is_living ? "living" : "deceased",
    generation_number: person.generation_number,
    branch_name: person.branch_name,
    birth_year: isLiving ? null : yearOf(person.birth_date),
    death_year: isLiving ? null : yearOf(person.death_date),
    visibility: "public",
  };
}

export function toFamilyPerson(person: Person): FamilyPerson | null {
  if (!canShowPersonInMode(person, "family")) {
    return null;
  }

  return {
    id: person.id,
    slug: person.slug,
    label: safeLabel(person),
    full_name: person.full_name,
    display_name: person.display_name,
    is_living: person.is_living,
    life_status: person.is_living ? "living" : "deceased",
    generation_number: person.generation_number,
    branch_name: person.branch_name,
    birth_year: yearOf(person.birth_date),
    death_year: yearOf(person.death_date),
    visibility: "public",
    birth_place: person.birth_place,
    home_town: person.home_town,
  };
}

export function toAdminPerson(person: Person): AdminPerson {
  return {
    id: person.id,
    slug: person.slug,
    full_name: person.full_name,
    display_name: person.display_name,
    gender: person.gender,
    birth_date: person.birth_date,
    birth_date_precision: person.birth_date_precision,
    death_date: person.death_date,
    death_date_precision: person.death_date_precision,
    is_living: person.is_living,
    birth_place: person.birth_place,
    home_town: person.home_town,
    branch_name: person.branch_name,
    generation_number: person.generation_number,
    short_bio: person.short_bio,
    notes_private: person.notes_private,
    visibility: person.visibility,
  };
}

export function sanitizePersonForMode(
  person: Person,
  mode: PrivacyMode,
): PublicPerson | FamilyPerson | AdminPerson | null {
  if (mode === "admin") {
    return canShowPersonInMode(person, mode) ? toAdminPerson(person) : null;
  }

  if (mode === "family") {
    return toFamilyPerson(person);
  }

  return toPublicPerson(person);
}

function sanitizeTreePersonNode(
  node: TreePersonNode,
  mode: PrivacyMode,
): TreePersonNode | null {
  if (mode === "admin") {
    return node;
  }

  if (mode === "family" && node.visibility === "private") {
    return null;
  }

  if (mode === "public" && node.visibility !== "public") {
    return null;
  }

  if (mode === "public") {
    const canShowLineage =
      !node.isLiving && node.lineageVisibility === "public";

    return {
      ...node,
      birthYear: node.isLiving ? null : node.birthYear,
      deathYear: node.isLiving ? null : node.deathYear,
      lineageClanName: canShowLineage ? node.lineageClanName : null,
      lineageBranchName: canShowLineage ? node.lineageBranchName : null,
      lineageMembershipType: canShowLineage ? node.lineageMembershipType : null,
      lineageVisibility: canShowLineage ? node.lineageVisibility : null,
      branchName: canShowLineage ? node.branchName : null,
      generationNumber: canShowLineage ? node.generationNumber : null,
    };
  }

  return node;
}

export function sanitizeTreeGraphForMode(
  graph: FamilyTreeGraph,
  mode: PrivacyMode,
): FamilyTreeGraph {
  if (mode === "admin") {
    return graph;
  }

  const nodes = graph.nodes
    .map((node): TreeGraphNode | null => {
      if (node.kind === "family") {
        if (mode === "public" && node.visibility !== "public") {
          return null;
        }

        if (mode === "family" && node.visibility === "private") {
          return null;
        }

        return node;
      }

      return sanitizeTreePersonNode(node, mode);
    })
    .filter((node): node is TreeGraphNode => Boolean(node));
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = graph.edges.filter(
    (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target),
  );

  return {
    nodes,
    edges,
    meta: {
      ...graph.meta,
      mode: mode === "family" ? "internal" : mode,
      personCount: nodes.filter((node) => node.kind === "person").length,
      familyCount: nodes.filter((node) => node.kind === "family").length,
      coupleCount: edges.filter((edge) => edge.kind === "couple").length,
    },
  };
}
