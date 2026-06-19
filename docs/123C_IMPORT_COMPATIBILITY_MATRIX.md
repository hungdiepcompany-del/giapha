# Phase 123C - Import Compatibility Matrix

Compatibility status: `DESIGN_ONLY`

## Summary

This phase records import compatibility expectations for current, older and
future `family.json` files, GEDCOM, ZIP bundle and future media bundle work. It
does not implement an import parser, import runtime, restore/apply mutation,
large validation service or service Worker.

No migration. No `.sql` file. No DB apply. No SQL mutation. No seed/backfill.
No large JSON/GEDCOM/ZIP runtime. No import parser runtime. No media
export/import. No backup/restore runtime. No Worker created. No
OpenNext/Wrangler config change. No runtime dependency added. No deploy. No
push.

Boundary markers: No OpenNext/Wrangler config change. No push.

## Import Source Matrix

| Source | Current status | Compatibility expectation | Runtime/service gate |
| --- | --- | --- | --- |
| `family.json` current version | JSON-only now | Preview can validate known sections, references, privacy metadata and checksums in a future phase. | Runtime parser remains deferred. |
| `family.json` older version | Backward-compatible candidate | Preview should identify missing optional sections and map older fields through documented compatibility rules. | Mapping code requires separate approval. |
| `family.json` future version | Forward-compatible candidate | Unknown fields should be ignored or preserved as metadata during preview unless they affect safety. | Future-version handling must stay preview-first. |
| GEDCOM | GEDCOM-mappable, deferred | GEDCOM import requires identity, relationship and extension review before any mutation. | Parser/runtime must not be added without import-service or approved small-runtime gate. |
| ZIP bundle | ZIP/manifest only, deferred | ZIP import should verify manifest, checksums and contained `family.json` before parsing payloads. | Large ZIP processing must follow service-boundary approval. |
| Media bundle later | Deferred, privacy-sensitive | Media import requires signed storage, metadata, privacy and malware/content workflow decisions. | Requires media-service/import-service approval before runtime. |

## Validation Matrix

| Validation area | Required preview behavior | Compatibility result |
| --- | --- | --- |
| identity | Detect stable IDs, duplicate candidates, required labels and living-person privacy markers. | Block or require owner decision when identity is ambiguous. |
| relationships | Resolve parent, child, spouse and couple references before apply. | Block import when references are missing or contradictory. |
| lineage | Validate clan, branch, generation rule and membership consistency. | Require owner decision for lineage conflicts. |
| tree layout | Treat layout as app-specific optional metadata. | Skip or warn when layout cannot map safely. |
| privacy | Enforce visibility, living-person and private note/source note restrictions. | Block import when payload would expose private data outside allowed scope. |
| duplicates | Produce conflict candidates rather than overwriting. | Require owner decision before merging or update existing. |
| unsupported fields | Preserve as metadata or warn in preview when safe. | Block only when unsupported fields affect identity, privacy or mutation safety. |
| checksums | Verify manifest and file checksums before trusting package content. | Block ZIP/backup import on checksum mismatch. |

## Conflict Handling Matrix

| Action | When allowed | Gate |
| --- | --- | --- |
| create new | New records have stable IDs, valid references and no privacy conflicts. | Preview approval required before future apply. |
| update existing | Only when identity match is strong and field changes are reviewed. | Require owner decision and rollback plan before mutation. |
| skip | Optional unsupported sections or user-declined updates. | Preview must explain skipped fields. |
| require owner decision | Duplicate candidates, lineage conflicts, living-person privacy questions or relationship ambiguity. | No automatic apply. |
| block import | Missing required references, checksum mismatch, unsafe privacy exposure or unsupported destructive operation. | Import remains blocked until corrected. |

## Import Preview Compatibility Expectations

- Preview is mandatory before any future restore/import apply.
- Preview must separate accepted rows, warnings, blocking errors, conflict
  candidates and owner approval requirements.
- Preview must not mutate production data.
- Preview must not call a large parser/runtime path in the main Worker without
  boundary approval.
- Public or family-scoped import preview must not expose private notes, source
  notes, credentials or raw hidden relationship facts.

## Restore/Import Apply Gate

Restore/import apply is a production mutation and remains `NOT_READY_FOR_RUNTIME`.
Before any apply path exists, the owner must approve target project, backup or
snapshot evidence, rollback plan, operator identity, mutation scope, dry-run
PASS evidence and post-apply verification.

## No-Go Import Cases

- Direct production mutation without preview and owner approval.
- Import parser runtime for GEDCOM/ZIP/media in the main Worker without service
  boundary approval.
- Any apply path that can insert, modify or delete data before backup and
  rollback gates.
- Import that exposes private notes, source notes, hidden relationships,
  credentials or living-person sensitive details to unauthorized viewers.
- Import work that implies schema, migration, SQL, DB apply, seed/backfill,
  dependency, Worker, config, deploy or push approval.

## Import-Service Readiness Status

Import-service readiness is `NOT_READY_FOR_RUNTIME`. The docs now contain
boundary design, static examples and this import compatibility matrix, but a
future import-service Worker still requires owner approval, service-boundary
design, parser safety review, privacy review, auth contract, dry-run evidence
and rollback planning.

## Explicitly Not Implemented

- No import parser/runtime.
- No GEDCOM parser.
- No ZIP parser.
- No media import.
- No restore/apply mutation.
- No backup/restore runtime.
- No new service Worker.
- No runtime dependency.
- No migration, SQL, DB apply, seed/backfill, deploy or push.

## Recommended Future Phase

Recommended next phase: defer implementation, or start a separate
owner-approved import-service design phase that remains docs/static until a
later approval gate.
