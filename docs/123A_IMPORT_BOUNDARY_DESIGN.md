# Phase 123A - Import Boundary Design

Status: `DESIGN_ONLY_LOCAL_STATIC_VALIDATED`

## Summary

Phase 123A defines the import boundary for Vietnamese genealogy data and backup
restore workflows. This is a documentation and approval-gate phase only.

This phase does not implement a large parser, does not apply imports, does not
mutate the database, does not create a Worker and does not change deployment
configuration.

## Current Import Foundation Review

The current import foundation supports safe `family.json` preview behavior:

- `/admin/exports/import` can receive pasted or uploaded JSON for preview.
- The validator checks structure, schema version, required arrays, duplicate
  IDs, required person names, references and ancestor cycle risks.
- Conflict checks are server-side and report existing IDs/slugs/layout IDs when
  configuration and permission allow.
- If Supabase config is unavailable, structural validation can still run while
  database conflict checks fail safely.
- The current foundation does not write to the database, store uploaded files,
  restore data or overwrite production data.

## Import Types

### `family.json`

`family.json` is the first import target because it is the canonical
portability format. Large or production import must still pass preview,
conflict detection, owner approval and rollback gates.

### GEDCOM Later

GEDCOM import is deferred. GEDCOM is lossy compared with canonical JSON and
requires mapping, ambiguity handling and privacy review before implementation.

### ZIP Bundle Later

ZIP restore is deferred. ZIP restore must verify manifest, checksums and member
paths before parsing any contained data.

### Media Restore Later

Media restore is deferred until media schema, storage provider, signed-access
rules, checksums and deletion/retention behavior are approved.

## Import Stages

Future import phases must separate these stages:

1. upload/receive;
2. parse;
3. validate;
4. preview;
5. conflict detection;
6. owner approval;
7. apply;
8. rollback/no-go.

The apply stage must remain blocked until the owner approves the exact import
scope, target environment, backup/snapshot, rollback plan and mutation path.

## Validation Groups

Future import validation must include:

- person identity;
- relationship consistency;
- clan, branch and generation membership;
- privacy visibility;
- duplicate candidates;
- missing required relationships;
- layout references;
- revision/import-log expectations.

Large validation must not silently become a main Worker runtime scan.

## Boundary

- Preview and validation can be lightweight in the main app only for small
  payloads and existing safe preview behavior.
- Large import parsing or validation must use a future
  `genealogy-import-service`, async job or offline/operator tool after owner
  approval.
- Conflict detection that scans large family data must be service-boundary
  governed.
- Import apply must never run as a side effect of preview.

## No Direct Production Mutation Without Approval Gate

No production import mutation may run unless a future phase records:

- explicit owner approval;
- target project/environment;
- fresh backup or snapshot;
- exact file and checksum;
- dry-run/preview evidence;
- mutation plan and expected row counts;
- rollback/no-go plan;
- revision/import log behavior;
- post-apply verification plan.

## Approval Gate Before Import-Service Worker

Before any import-service Worker is created, the owner must approve:

- service name and source path;
- responsibility boundary;
- upload size and payload limits;
- parse/validate/preview route contract;
- request/response envelope;
- auth strategy, service binding or internal token strategy;
- env/secret contract with no raw secrets committed;
- safe-skip smoke plan;
- deploy and rollback plan;
- main app integration plan.

## Approval Gate Before Large Import Runtime

Before any large import runtime is implemented, the owner must approve:

- accepted formats and size thresholds;
- schema version compatibility rules;
- duplicate/conflict behavior;
- transaction and rollback strategy;
- privacy behavior for living/private records;
- import log and revision behavior;
- service-boundary placement.

## Explicitly Not Implemented

- No migration.
- No `.sql` file.
- No DB apply.
- No SQL mutation.
- No seed/backfill.
- No import parser runtime.
- No large import validation runtime.
- No import apply runtime.
- No media export/import.
- No Worker created.
- No import-service Worker.
- No OpenNext/Wrangler config change.
- No runtime dependency added.
- No deploy.
- No push.

## Recommended Future Phase

Recommended next import phase: Phase 123B static import contract with example
preview outcomes, conflict categories, owner-approval checklist and safe no-go
conditions.
