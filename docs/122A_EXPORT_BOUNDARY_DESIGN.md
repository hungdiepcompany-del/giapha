# Phase 122A - Export Boundary Design

Status: `DESIGN_ONLY_LOCAL_STATIC_VALIDATED`

## Summary

Phase 122A defines the export boundary for Vietnamese genealogy data after the
verified lineage tables and inline admin warning UI work. This is a design and
approval-gate phase only.

This phase does not implement new export runtime, does not expand large
JSON/GEDCOM/ZIP generation, does not create media export, does not create a
Worker and does not change deployment configuration.

## Current Export Foundation Review

The current export foundation already provides:

- `family.json` as the canonical data-preservation format.
- `family.ged` as a GEDCOM portability layer for supported person/family data.
- `full-backup.zip` containing `family.json`, `family.ged`, `manifest.json`
  and `checksums.json`.
- `manifest.json` with schema/app metadata, counts and checksum algorithm.
- Server-side route permission checks using the existing export permissions.

The Vietnamese genealogy lineage tables are verified in the database, but
export/import/GEDCOM/ZIP integration for lineage metadata remains deferred.

## Why Large Export Must Stay Out Of The Main Worker

Small coordination and permission-checked download requests may remain in the
main app Worker. Large export assembly must not be folded into the main
Cloudflare/OpenNext Worker by default because it can create:

- CPU and memory pressure while serializing large family trees.
- Timeout risk for GEDCOM and ZIP generation.
- Bundle-size and cold-start risk from heavy export or archive code.
- Privacy risk if media, source notes or private records are mixed into a
  public export path.
- Operational risk if checksum, manifest and rollback behavior are not
  reviewed together.

Large export work must follow `docs/RUNTIME_WORKER_GUARDRAIL.md` and
`docs/SERVICE_BOUNDARY_ROADMAP.md`.

## Export Types

### `family.json`

`family.json` remains the canonical portability format. It should preserve data
that cannot safely or completely fit into GEDCOM, including Vietnamese lineage
metadata, privacy metadata, layout data and compatibility metadata.

### GEDCOM

GEDCOM remains a compatibility format. It should export supported people,
family and relationship facts conservatively. Data that cannot be represented
without loss must remain in `family.json`.

Large GEDCOM generation or GEDCOM expansion must wait for a separate approval
gate.

### ZIP Bundle

The ZIP bundle should remain a packaging layer around canonical JSON, GEDCOM,
manifest and checksums. Large ZIP creation belongs in an export-service or
async job later.

### Media Bundle Later

Media export is deferred. Future media bundles must include approved storage,
privacy, manifest and checksum decisions before runtime implementation.

## Data Groups

Future export design must account for these groups:

- `people`
- `families`
- `family_parents`
- `family_children`
- `couple_relationships`
- `clans`
- `clan_branches`
- `generation_rules`
- `person_branch_memberships`
- `tree_layouts`
- `tree_layout_nodes`
- `revisions`
- privacy metadata

The lineage groups must not be silently dropped from future canonical export
contracts once export expansion is approved.

## Privacy Rules

- Living-person handling must be explicit for every export mode.
- Public exports must use public-safe DTOs and must not reuse admin export
  payloads.
- `public`, `family` and `private` visibility must be preserved in canonical
  data while public outputs filter or redact according to policy.
- Private notes and internal source notes must not leak into public export,
  GEDCOM, manifest, logs or browser-visible output.
- Media object keys, signed URLs and private storage details must not appear in
  public export output.

## Boundary

- The main app can coordinate small export requests, auth, permission checks
  and lightweight metadata responses.
- Large JSON, GEDCOM and ZIP export must use a future
  `genealogy-export-service`, async job or offline/operator tool after owner
  approval.
- Media export must wait for media storage/privacy decisions and a
  service-boundary review.
- Export-readiness scans that traverse large data or media packages must not
  run in the main Worker without a separate boundary approval.

## Approval Gate Before Export-Service Worker

Before any export-service Worker is created, the owner must approve:

- service name and source path;
- responsibility boundary;
- route contract and request/response envelope;
- auth strategy, service binding or internal token strategy;
- env/secret contract with no raw secrets committed;
- small/large export threshold;
- manifest and checksum behavior;
- privacy model for living/private data;
- safe-skip smoke plan;
- deploy and rollback plan.

## Approval Gate Before ZIP/GEDCOM Expansion

Before ZIP or GEDCOM expansion is implemented, the owner must approve:

- exact data groups included;
- canonical `family.json` schema/version impact;
- GEDCOM lossiness policy;
- ZIP manifest and checksum shape;
- privacy redaction behavior;
- runtime placement decision: main app, export-service, async job or offline
  tool;
- validation and rollback plan.

## Explicitly Not Implemented

- No migration.
- No `.sql` file.
- No DB apply.
- No SQL mutation.
- No seed/backfill.
- No large JSON/GEDCOM/ZIP export runtime.
- No media export/import.
- No Worker created.
- No export-service Worker.
- No OpenNext/Wrangler config change.
- No runtime dependency added.
- No deploy.
- No push.

## Recommended Future Phase

Recommended next export phase: Phase 122B static export contract with a
versioned `family.json` candidate, manifest/checksum examples and a no-runtime
approval checklist.
