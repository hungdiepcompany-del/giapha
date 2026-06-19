# Phase 118B - Media Static Contract And Approval Gate

Static media contract status: `DESIGN_ONLY`

## Summary

Phase 118B turns the Phase 118A media boundary design into a static contract and approval checklist. This is not a schema, storage, upload, thumbnail, Worker or runtime implementation phase.

The contract exists so a future AI cannot treat media planning as permission to create tables, buckets, upload routes, processing jobs or a media-service Worker. Any real implementation still needs a separate owner-approved phase.

## Proposed Future Metadata Entities

These are domain concepts only, not table names and not migration authorization:

- Person media: portrait, profile image, personal source scan or person-specific document attachment.
- Family media: family group photo, household document, family book page or certificate.
- Clan media: clan book excerpt, ancestor hall image or clan-level source document.
- Branch media: branch charter, branch photo, branch source scan or generation-rule evidence.
- Memorial/grave media: tombstone photo, grave location photo, memorial ceremony photo or cemetery source image.

Future schema design must decide whether these concepts share one normalized metadata entity or separate approved tables. That decision is not made by this phase.

## Proposed Future Storage Contract

Any future storage design must define:

- Storage provider: Supabase Storage, Cloudflare R2 or another owner-approved provider.
- Bucket/container: name, privacy mode, policy model and lifecycle expectations.
- Object key: opaque provider key, never a secret, never a direct public URL for private files.
- Content type: accepted MIME types and rejection behavior.
- File size: maximum size, operator-facing limit and no-go threshold.
- Checksum: checksum algorithm, when calculated and where recorded.
- Visibility: public, family or private, with server-side enforcement.
- Thumbnail key: derivative reference only after thumbnail generation is approved.
- Upload owner: authenticated actor, admin/operator identity and audit fields.

The storage contract must include deletion, retention, backup/export manifest impact and restore behavior before real media storage is enabled.

## Privacy Contract

- Public, family and private visibility must be explicit.
- Living person protection applies before public display.
- No direct public bucket leakage is allowed for private or family media.
- Private media access requires signed URL or equivalent server-authorized access.
- Storage keys, signed URL material and provider internals must not be exposed on public routes.
- Captions and source notes inherit the privacy of the attached media or the linked record, whichever is stricter.

## Media-Service Boundary

The following work belongs behind a future approved media-service/storage boundary when it becomes heavy or provider-specific:

- Upload signing and upload finalization.
- Thumbnail generation.
- Image processing, resize, compression and metadata extraction.
- Virus/file safety scan.
- Deletion, retention, lifecycle and derivative cleanup.
- Media backup manifest and checksum generation for large packages.

The main app may later coordinate metadata and UI only after explicit approval. It must not absorb heavy media processing by default.

## Approval Gate Before Future Media Migration

Do not create a media migration until all items are satisfied:

- Owner approval explicitly names the media migration phase.
- Schema design identifies metadata entity shape, references, deletion behavior and audit fields.
- Storage provider decision is documented.
- RLS/privacy review covers public/family/private visibility and living person protection.
- Export/backup impact review covers media manifest, checksum, restore and `media.zip` behavior.
- Rollback/no-go conditions are written.
- Existing excluded/deferred table decisions are reopened only by explicit owner approval.

## Approval Gate Before Media-Service Worker

Do not create a media-service Worker until all items are satisfied:

- Route contract exists for every endpoint.
- Request/response envelope is documented.
- Env/secret contract names variables without storing secret values.
- Auth/internal token or service-binding strategy is approved.
- Smoke test plan includes safe-skip behavior when URL/env is missing.
- Deploy, rollback and no-go plan exists.
- Main app integration plan states whether calls are service binding, internal URL or adapter-only.
- Worker size and dependency impact are reviewed separately from the main Cloudflare/OpenNext Worker.

## Explicitly Not Implemented

- No migration.
- No `.sql` file.
- No DB apply.
- No SQL mutation.
- No seed/backfill.
- No table creation.
- No storage bucket/container.
- No media upload.
- No thumbnail generation.
- No image/video/file processing.
- No virus/file safety scan.
- No media-service Worker.
- No Worker.
- No Wrangler/OpenNext config change.
- No runtime dependency.
- No deploy.
- No push.

## Recommended Future Phase

Recommended next media phase: Phase 118C media schema candidate and storage-policy checklist, still docs/static unless the owner explicitly approves a real migration or service implementation phase.

## Runtime And Worker Boundary Status

- Main Worker touched: NO
- Runtime dependency added: NO
- New service Worker created: NO
- OpenNext/Wrangler config changed: NO
- Worker size risk introduced by this phase: NO
- Service boundary recommendation: keep media upload/thumbnail/file processing behind future media-service or storage boundary
