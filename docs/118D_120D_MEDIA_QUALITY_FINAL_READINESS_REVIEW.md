# Phase 118D-120D - Media And Data Quality Final Readiness Review

Status: `FINAL_REVIEW_DOCS_ONLY`

## Summary

The Phase 118A-120C documentation bundle is complete enough to support an owner decision about the next planning path. It is not implementation authorization.

Current recommendation without new owner approval:

`A. Defer all implementation; keep docs/contracts only.`

Conditional alternative:

`D. Start inline admin warning UI only, no schema` may be proposed in a separate explicitly approved runtime phase, limited to lightweight hints derived from data already loaded for an authorized admin view.

## Phase 118D Media Review

### What Is Ready

- Media use cases are documented for portraits, grave/tomb photos, family documents, clan/branch archives and event photos.
- Candidate metadata, visibility, storage-key, checksum, uploader and retention concepts are documented.
- Public/family/private and living-person-sensitive privacy rules are documented.
- Unsafe direct public bucket access is explicitly rejected.
- Acceptance gates exist for future migration, media-service Worker and export/backup integration.
- Heavy upload, thumbnail and file processing work is assigned to a service/storage boundary rather than the main Worker.

### What Is Not Ready

- No approved media schema exists.
- No storage provider has been selected.
- No bucket/container policy exists.
- No RLS/storage policy has been reviewed or approved.
- No upload, signed URL, deletion or retention runtime contract exists.
- No media-service route/env/auth/smoke/deploy/rollback package exists.
- Media export/restore behavior has not been implemented or production-tested.

### Missing Decisions Before Media Migration

- Normalized metadata entity versus multiple attachment entities.
- Approved target references and deletion behavior.
- Storage provider and object-key strategy.
- Public/family/private policy and living-person defaults.
- RLS/storage policy and signed-access model.
- Export/backup manifest, checksum, restore and retention impact.
- Migration rollback and post-apply verification plan.

### Missing Decisions Before Media-Service Worker

- Service name and responsibility boundary.
- Upload/finalize/thumbnail/file-safety route contract.
- Request/response envelope.
- Env/secret and internal authentication strategy.
- Dependency and Worker-size review.
- Safe-skip smoke, deploy, rollback and main-app integration plans.

### Recommended Next Media Path

Default: defer media implementation.

If the owner prioritizes media planning, choose one separately approved path:

- Schema candidate only.
- Storage provider decision only.
- Media-service design only.

Do not combine all three into an implementation phase without separate gates.

## Phase 119D Data-Quality Review

### What Is Ready

- Warning categories and deterministic example codes are documented.
- Info, warning and blocking severity contracts are documented.
- Vietnamese admin copy, privacy-safe public behavior and resolution paths are documented.
- Inline, persistent and service-generated warning boundaries are separated.
- Acceptance gates exist for persistent warning migration and quality-service Worker.

### What Is Not Ready

- No persistent warning schema exists.
- No stale-warning invalidation or resolution lifecycle is approved.
- No read-only full-tree scan design has performance limits.
- No quality-service route/env/auth/smoke/deploy plan exists.
- No production evidence exists for false-positive rate, scan cost or privacy-safe logging.

### Checks Suitable For Inline-Only Without DB Schema

These may be considered only in a separately approved lightweight runtime phase and only from data already loaded:

- Missing required identity fields.
- Impossible date order within one loaded person record.
- Multiple primary branch memberships in the loaded membership set.
- Branch/generation conflict from already loaded lineage data.
- Relationship cycle risk during an existing proposed relationship mutation.
- Simple privacy visibility conflict before an existing admin action.

Inline hints must not claim full-tree coverage or persistent resolution.

### Checks Requiring A Persistent Warning Table

- Dismissed/resolved warning state.
- Warning history and audit trail.
- Assigned reviewer or review status.
- Stable warnings that must survive page reloads.
- Recurring scan findings that need lifecycle tracking.

### Checks Requiring A Quality-Service Worker Or Offline Boundary

- Full-tree relationship cycle scan.
- Large duplicate-person candidate scoring.
- Whole-family date plausibility scan.
- Import-wide conflict and quality validation.
- Export-readiness scan across large data/media packages.
- Scheduled recurring privacy or lineage quality scans.

### Recommended Next Data-Quality Path

Default: defer implementation.

Conditional low-risk path: propose inline hints only in a separate owner-approved runtime phase. Persistent schema and quality-service design remain separate choices.

## Phase 120D Admin Warning UX Review

### UX That Can Be Implemented Without Schema

Only after separate runtime approval:

- Lightweight inline hints from data already loaded for authorized admin pages.
- Static severity labels and privacy-safe copy.
- Empty states that do not claim a scan ran.
- Blocking presentation for an existing risky action when validation already exists.

### UX That Must Wait For Persistent Warnings

- Dismissed/resolved state.
- Warning history.
- Reviewer assignment.
- Cross-page warning inbox.
- Stable grouped counts across sessions.

### UX That Must Wait For Import/Export Readiness

- Import-wide grouped warnings.
- Import confirmation blocking based on large validation.
- Export package readiness reports.
- Media/checksum completeness reports.
- Large JSON/GEDCOM/ZIP readiness summaries.

### Privacy No-Go Conditions

- Public routes display admin warning details.
- Hidden relationship facts are exposed.
- Private notes or source text are copied into warning messages.
- Living-person-sensitive details are exposed.
- Media bucket names, object keys or signed URLs are shown publicly.
- Empty state implies full coverage when no scan ran.

### Recommended Next Admin Warning Path

Without owner approval: keep docs/contracts only.

With explicit owner approval: a narrow inline admin warning UI phase may be considered if it adds no schema, persistence, heavy scan, new dependency or service call.

## Decision Matrix

| Option | Readiness | Owner approval required | Allowed next scope | Main reason |
| --- | --- | --- | --- | --- |
| A. Defer all implementation; keep docs/contracts only | `RECOMMENDED_DEFAULT` | No additional implementation approval | Documentation maintenance only | Safest while schema/provider/service choices remain open. |
| B. Start media schema candidate phase | `READY_FOR_OWNER_DECISION` | Yes | Docs/static schema candidate and approval gate only | Media concepts are documented, but provider/RLS/export decisions remain open. |
| C. Start data-quality persistent warning schema candidate phase | `READY_FOR_OWNER_DECISION` | Yes | Docs/static schema candidate and lifecycle/RLS review only | Warning contract exists, but persistence lifecycle is unresolved. |
| D. Start inline admin warning UI only, no schema | `CONDITIONALLY_READY` | Yes | Lightweight admin hints from already loaded data; no persistence or scan | Can remain small, but it is still runtime work and must be separately approved. |
| E. Start media-service Worker design phase | `READY_FOR_DESIGN_ONLY_DECISION` | Yes | Boundary, route, env/auth, smoke, deploy/rollback docs only | Implementation is not ready; design can proceed separately. |
| F. Start quality-service Worker design phase | `READY_FOR_DESIGN_ONLY_DECISION` | Yes | Boundary, scan limits, route, env/auth, smoke, deploy/rollback docs only | Heavy scans need a service/offline boundary before implementation. |

## Recommended Next Path

Recommended now: `A. Defer all implementation; keep docs/contracts only`.

If the owner wants visible incremental value, request explicit approval for `D. Start inline admin warning UI only, no schema`, constrained to:

- Admin-only routes.
- Existing permissions.
- Data already loaded for the current view.
- No persistence.
- No full-tree or import/export scan.
- No media upload/processing.
- No new Worker, dependency or config.

## Required Owner Approvals Before

### Media Migration

- Explicit migration-phase approval.
- Approved schema candidate.
- Storage provider decision.
- RLS/privacy and export/backup impact review.
- Backup, rollback and post-apply verification plan.

### Media-Service Worker

- Explicit service design approval, then separate implementation/deploy approval.
- Route, request/response, env/secret and auth contracts.
- Smoke, deployment, rollback and integration plans.

### Persistent Warning Migration

- Explicit migration-phase approval.
- Warning lifecycle, RLS/privacy and stale-resolution design.
- Backup, rollback and verification plan.

### Quality-Service Worker

- Explicit service design approval, then separate implementation/deploy approval.
- Scan scope/limits, privacy-safe logging, route/env/auth, smoke and rollback plans.

### Runtime Warning UI

- Explicit runtime phase approval.
- Exact routes, permissions, warning sources and privacy behavior.
- Confirmation that no persistent schema or heavy scan is introduced unless separately approved.

### Export/Import/GEDCOM/ZIP Expansion

- Explicit boundary-governed phase approval.
- Large-workload placement, privacy, backup/rollback, manifest/checksum and smoke plans.

## No-Go Conditions

- No explicit owner approval for the selected option.
- A planning doc is treated as migration/runtime/Worker authorization.
- Media provider, RLS or signed-access decisions are missing.
- Persistent warnings lack lifecycle and privacy design.
- Full-tree or import/export scans are placed in the main Worker.
- Private or living-person data can reach public routes.
- Worker route/env/auth/smoke/deploy/rollback contracts are incomplete.

## Privacy And Security Notes

- Living-person media and warnings remain private/admin-only by default.
- Public behavior must fail closed.
- Private notes, hidden relationship facts, storage keys, signed URLs and raw source material must not be copied into public output or logs.
- Service role credentials and provider secrets remain server-side and are not part of this documentation bundle.

## Worker And Runtime Impact

- Main Worker touched: NO
- Runtime dependency added: NO
- New service Worker created: NO
- OpenNext/Wrangler config changed: NO
- Worker size risk introduced: NO
- Service boundary recommendation: keep media processing and large quality/import/export scans outside the main Worker

## Explicitly Not Implemented

- No migration.
- No `.sql` file.
- No DB apply.
- No SQL mutation.
- No seed/backfill.
- No media upload/storage bucket.
- No thumbnail/image/video/file processing.
- No persistent warning table.
- No full-tree runtime scan.
- No runtime warning UI.
- No large export/import/GEDCOM/ZIP.
- No Worker created.
- No OpenNext/Wrangler config change.
- No runtime dependency added.
- No deploy.
- No push.
