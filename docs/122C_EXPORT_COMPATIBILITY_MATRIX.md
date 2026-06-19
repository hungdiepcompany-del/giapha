# Phase 122C - Export Compatibility Matrix

Compatibility status: `DESIGN_ONLY`

## Summary

This phase records export compatibility expectations for `family.json`, GEDCOM,
ZIP bundle and future media bundle work. It is a documentation and static
readiness matrix only. It does not implement export runtime, parser runtime,
large export assembly, media processing or service Worker behavior.

No migration. No `.sql` file. No DB apply. No SQL mutation. No seed/backfill.
No large JSON/GEDCOM/ZIP runtime. No import parser runtime. No media
export/import. No backup/restore runtime. No Worker created. No
OpenNext/Wrangler config change. No runtime dependency added. No deploy. No
push.

Boundary markers: No OpenNext/Wrangler config change. No push.

## Export Format Matrix

| Format | Current status | Compatibility role | Runtime/service gate |
| --- | --- | --- | --- |
| `family.json` | JSON-only now | Canonical portability format for structured genealogy data, lineage metadata, layouts and versioned restore dry-run review. | Small main-app JSON hardening may be considered later only if it does not add heavy runtime, dependency or Worker changes. |
| GEDCOM | GEDCOM-mappable | Mapping notes can cover people, families and parent/child/spouse links; lineage-specific Vietnamese fields need extension review. | Any real GEDCOM generation must pass export-service or approved small-runtime boundary review. |
| ZIP bundle | ZIP/manifest only | Intended to package `family.json`, manifest, checksums and later media references. | Large ZIP generation must not run in the main Cloudflare/OpenNext Worker without service-boundary approval. |
| media bundle later | Deferred, privacy-sensitive | Future portraits, grave photos and documents require metadata, signed access, retention and consent rules. | Requires media-service/export-service approval before runtime. |

## Data Compatibility Matrix

| Data group | Classification | Export compatibility notes |
| --- | --- | --- |
| `people` | supported now, JSON-only now, GEDCOM-mappable, privacy-sensitive | Core identity records are exportable through `family.json`; GEDCOM mapping must redact living/private fields by scope. |
| `families` | supported now, JSON-only now, GEDCOM-mappable | Family records are compatible with both `family.json` and GEDCOM family blocks. |
| `family_parents` | supported now, JSON-only now, GEDCOM-mappable | Parent references must remain stable and resolve within the export package. |
| `family_children` | supported now, JSON-only now, GEDCOM-mappable | Child references must remain stable and preserve ordering when available. |
| `couple_relationships` | supported now, JSON-only now, GEDCOM-mappable, privacy-sensitive | Relationship facts may be scope-filtered for public export. |
| `clans` | JSON-only now, GEDCOM-mappable | Clan metadata maps cleanly to `family.json`; GEDCOM mapping needs extension notes. |
| `clan_branches` | JSON-only now, GEDCOM-mappable | Branch membership should preserve branch code/name and clan reference. |
| `generation_rules` | JSON-only now, ZIP/manifest only | Rules are better preserved as structured JSON and described in manifest compatibility notes. |
| `person_branch_memberships` | JSON-only now, GEDCOM-mappable | Membership records can be mapped as notes/extensions after privacy review. |
| `tree_layouts` | JSON-only now, ZIP/manifest only | Layout is app-specific and should stay outside GEDCOM canonical genealogy facts. |
| `revisions` | JSON-only now, ZIP/manifest only, privacy-sensitive | Revision summaries may be exported for admin backups only; private notes are not public export data. |
| future media | deferred, ZIP/manifest only, privacy-sensitive | Media references and checksums can be planned, but binary export is deferred. |
| future warnings | deferred, JSON-only now, privacy-sensitive | Warning summaries may be future admin-only metadata; public export must not expose internal quality findings. |

## Public/Family/Admin Export Matrix

| Scope | Allowed data | Privacy restrictions | Compatibility expectation |
| --- | --- | --- | --- |
| Public export | Public person names, public family links and public lineage labels only. | Living-person sensitive dates, private notes, internal source notes, hidden relationships and warning details are excluded. | Backward compatible `family.json` subset with clear privacy metadata. |
| Family/internal export | Family-approved fields, lineage metadata and selected relationship details. | Still excludes private admin notes, hidden facts outside viewer rights and raw source material. | Full `family.json` sections may be present with scope markers. |
| Admin backup export | Complete approved backup scope, manifest and checksums. | Must remain operator-gated and privacy audited before runtime. | Intended for ZIP/manifest backup compatibility, not public sharing. |

## Living-Person Handling Matrix

| Field category | Public export | Family/internal export | Admin backup export |
| --- | --- | --- | --- |
| Name/display label | Redacted or abbreviated when privacy requires. | Allowed according to family visibility settings. | Included when backup scope is approved. |
| Birth/death dates | Omit sensitive living-person details by default. | Include only if permitted by visibility policy. | Included for approved operator backup. |
| Contact/private notes/source notes | Not exported. | Not exported unless an explicit future policy approves. | Admin-only backup candidate; must not appear in public exports. |
| Relationship privacy flags | Enforced as filters. | Enforced as filters. | Preserved for restore and audit. |

## Backward Compatibility Expectations

- `family.json` must include a stable `schema_version`.
- Older exports should be accepted by future import preview when required
  sections and references can be understood.
- Missing optional sections should produce warnings, not automatic mutation.
- Deprecated fields should be preserved or mapped only through documented
  compatibility rules.

## Forward Compatibility Expectations

- Unknown future fields should be ignored or preserved as metadata during
  preview, not treated as permission to apply production changes.
- Future media and warning sections remain optional and deferred until their
  service boundaries are approved.
- Future GEDCOM/ZIP extensions must not change main Worker behavior without a
  separate owner-approved runtime phase.

## No-Go Export Cases

- Export that would expose private notes, source notes, hidden relationships or
  living-person sensitive details to a public scope.
- Large GEDCOM/ZIP/media generation in the main Cloudflare/OpenNext Worker.
- Export runtime that adds dependencies, Worker config or OpenNext/Wrangler
  changes without approval.
- Admin backup export without operator authorization, manifest and checksum
  review.
- Any export work that implies schema, migration, SQL, DB apply, seed/backfill
  or deploy approval.

## Export-Service Readiness Status

Export-service readiness is `NOT_READY_FOR_RUNTIME`. The docs now contain
boundary design, static examples and this compatibility matrix, but a future
export-service Worker still requires owner approval, service-boundary design,
privacy review, size/startup review, auth contract, observability and rollback
planning.

## Explicitly Not Implemented

- No export runtime implementation.
- No GEDCOM generator.
- No ZIP generator.
- No media bundle export.
- No backup job runtime.
- No new service Worker.
- No runtime dependency.
- No migration, SQL, DB apply, seed/backfill, deploy or push.

## Recommended Future Phase

Recommended next phase: defer implementation, or start a separate
owner-approved small main-app JSON export hardening design only if it does not
add heavy runtime, dependency or Worker changes.
