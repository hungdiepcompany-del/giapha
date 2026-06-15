import "server-only";

import { sha256Hex } from "@/lib/family/checksum";
import { collectFamilyExportData } from "@/lib/family/export-collector";
import type { ExportBuildOptions, GedcomExportResult } from "@/lib/family/export-types";
import type { Person } from "@/lib/family/people-types";
import type {
  CoupleRelationship,
  Family,
  FamilyParent,
  RelationshipServiceResult,
} from "@/lib/family/relationship-types";

function exportDateStamp(date: Date) {
  return date.toISOString().slice(0, 10).replaceAll("-", "");
}

function crossRef(prefix: "I" | "F", index: number) {
  return `@${prefix}${index}@`;
}

function escapeGedcomValue(value: string) {
  return value.replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim();
}

function gedcomSex(person: Person) {
  if (person.gender === "male") {
    return "M";
  }

  if (person.gender === "female") {
    return "F";
  }

  if (person.gender === "other") {
    return "X";
  }

  return "U";
}

function addDate(lines: string[], level: number, tag: string, value: string | null) {
  if (!value) {
    return;
  }

  lines.push(`${level} ${tag}`);
  lines.push(`${level + 1} DATE ${escapeGedcomValue(value)}`);
}

function mapParentTag(parent: FamilyParent, person: Person | undefined) {
  if (parent.parent_role === "father") {
    return "HUSB";
  }

  if (parent.parent_role === "mother") {
    return "WIFE";
  }

  if (person?.gender === "male") {
    return "HUSB";
  }

  if (person?.gender === "female") {
    return "WIFE";
  }

  return null;
}

function addPersonRecord(
  lines: string[],
  person: Person,
  personRef: string,
  familyRefsByPerson: Map<string, Set<string>>,
) {
  lines.push(`0 ${personRef} INDI`);
  lines.push(`1 NAME ${escapeGedcomValue(person.full_name)}`);
  lines.push(`1 SEX ${gedcomSex(person)}`);
  addDate(lines, 1, "BIRT", person.birth_date);
  addDate(lines, 1, "DEAT", person.death_date);

  const refs = familyRefsByPerson.get(person.id);

  if (refs) {
    for (const familyRef of refs) {
      lines.push(`1 FAMS ${familyRef}`);
    }
  }
}

function addFamilyRecord(
  lines: string[],
  family: Family,
  familyRef: string,
  parents: FamilyParent[],
  children: string[],
  peopleById: Map<string, Person>,
  personRefs: Map<string, string>,
) {
  const usedParentTags = new Set<string>();
  const unresolvedParents: string[] = [];

  lines.push(`0 ${familyRef} FAM`);

  for (const parent of parents) {
    const person = peopleById.get(parent.person_id);
    const tag = mapParentTag(parent, person);
    const personRef = personRefs.get(parent.person_id);

    if (!tag || !personRef || usedParentTags.has(tag)) {
      unresolvedParents.push(parent.person_id);
      continue;
    }

    lines.push(`1 ${tag} ${personRef}`);
    usedParentTags.add(tag);
  }

  for (const personId of children) {
    const personRef = personRefs.get(personId);

    if (personRef) {
      lines.push(`1 CHIL ${personRef}`);
    }
  }

  if (family.family_label) {
    lines.push(`1 NOTE Family label: ${escapeGedcomValue(family.family_label)}`);
  }

  for (const personId of unresolvedParents) {
    lines.push(`1 NOTE Parent role could not be mapped safely for ${personId}`);
  }
}

function addCoupleFamilyRecord(
  lines: string[],
  couple: CoupleRelationship,
  familyRef: string,
  peopleById: Map<string, Person>,
  personRefs: Map<string, string>,
) {
  const first = peopleById.get(couple.person1_id);
  const second = peopleById.get(couple.person2_id);
  const firstRef = personRefs.get(couple.person1_id);
  const secondRef = personRefs.get(couple.person2_id);

  lines.push(`0 ${familyRef} FAM`);

  if (firstRef && secondRef) {
    if (first?.gender === "female" && second?.gender === "male") {
      lines.push(`1 HUSB ${secondRef}`);
      lines.push(`1 WIFE ${firstRef}`);
    } else {
      lines.push(`1 HUSB ${firstRef}`);
      lines.push(`1 WIFE ${secondRef}`);
    }
  }

  lines.push(
    `1 NOTE Couple relationship status: ${escapeGedcomValue(
      couple.relationship_status,
    )}`,
  );
  addDate(lines, 1, "MARR", couple.start_date);
}

export async function buildGedcomExport(
  options: ExportBuildOptions = {},
): Promise<RelationshipServiceResult<GedcomExportResult>> {
  const collection = await collectFamilyExportData(options);

  if (!collection.ok) {
    return collection;
  }

  const people = [...collection.data.people].sort((a, b) =>
    a.id.localeCompare(b.id),
  );
  const peopleById = new Map(people.map((person) => [person.id, person]));
  const personRefs = new Map(
    people.map((person, index) => [person.id, crossRef("I", index + 1)]),
  );
  const familyRefsByPerson = new Map<string, Set<string>>();
  const lines: string[] = [
    "0 HEAD",
    "1 SOUR WEB_GIA_PHA",
    "1 GEDC",
    "2 VERS 7.0",
    "1 CHAR UTF-8",
  ];

  const families = [...collection.data.families].sort((a, b) =>
    a.id.localeCompare(b.id),
  );
  const familyRefs = new Map(
    families.map((family, index) => [family.id, crossRef("F", index + 1)]),
  );

  for (const parent of collection.data.family_parents) {
    const familyRef = familyRefs.get(parent.family_id);

    if (!familyRef) {
      continue;
    }

    const refs = familyRefsByPerson.get(parent.person_id) ?? new Set<string>();
    refs.add(familyRef);
    familyRefsByPerson.set(parent.person_id, refs);
  }

  for (const person of people) {
    addPersonRecord(lines, person, personRefs.get(person.id) ?? "", familyRefsByPerson);
  }

  for (const family of families) {
    const familyRef = familyRefs.get(family.id);

    if (!familyRef) {
      continue;
    }

    addFamilyRecord(
      lines,
      family,
      familyRef,
      collection.data.family_parents.filter((row) => row.family_id === family.id),
      collection.data.family_children
        .filter((row) => row.family_id === family.id)
        .map((row) => row.person_id),
      peopleById,
      personRefs,
    );
  }

  const orphanCouples = collection.data.couple_relationships.filter(
    (couple) => !couple.family_id || !familyRefs.has(couple.family_id),
  );
  let nextFamilyIndex = families.length + 1;

  for (const couple of orphanCouples) {
    addCoupleFamilyRecord(
      lines,
      couple,
      crossRef("F", nextFamilyIndex),
      peopleById,
      personRefs,
    );
    nextFamilyIndex += 1;
  }

  lines.push("0 TRLR");

  const content = `${lines.join("\n")}\n`;
  const exportedAt = new Date();

  return {
    ok: true,
    data: {
      content,
      file_name: `gia-pha-family-${exportDateStamp(exportedAt)}.ged`,
      mime_type: "text/plain; charset=utf-8",
      checksum: sha256Hex(content),
      record_count: people.length + families.length + orphanCouples.length,
    },
  };
}
