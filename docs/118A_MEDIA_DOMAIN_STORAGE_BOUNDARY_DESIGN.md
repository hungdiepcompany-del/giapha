# Phase 118A - Media Domain And Storage Boundary Design

Status: `DESIGN_ONLY_LOCAL_STATIC_VALIDATED`

## Summary

Phase 118A defines the future media domain boundary for Vietnamese genealogy records. It is a planning artifact only. It does not create schema, migration, storage buckets, upload flows, thumbnails, service Workers, runtime dependencies or deploy changes.

Media is important for genealogy because portraits, grave photos, family documents and event images carry source evidence as well as family memory. That value also makes media risky: files can be large, private, personal and expensive to process inside the main Cloudflare/OpenNext Worker.

## Why Media Must Not Be Added Directly To The Main Worker Yet

- File upload, thumbnail generation, metadata extraction, image/video validation, virus scanning and ZIP packaging can make startup size and execution time grow quickly.
- Media processing may need dependencies that are inappropriate for the main Worker bundle.
- Private family files must not be exposed through public bucket URLs or public pages without explicit visibility checks.
- A failed or slow media pipeline must not block core people, relationship, tree and lineage administration.
- `docs/RUNTIME_WORKER_GUARDRAIL.md` and `docs/SERVICE_BOUNDARY_ROADMAP.md` require heavy media work to stay out of the main Worker until a service boundary is approved.

## Media Use Cases

- Person portrait: primary profile photo, historical portrait, avatar replacement for admin UI and future public profile display.
- Grave or tombstone photo: cemetery image, grave marker, location evidence and source note.
- Family document or photo: household registry, family book page, certificate, letter, scanned document or group family photo.
- Branch or clan document: clan book excerpt, ancestor hall image, branch charter or source scan.
- Event photo: ceremony, anniversary, memorial, reunion or migration event evidence.

## Proposed Metadata Model

This phase does not name or create a real table. A future migration may introduce candidate media metadata tables after owner approval.

Suggested metadata concepts:

- Attachment owner: person attachment, family attachment, branch attachment or clan attachment.
- Media kind: portrait, grave photo, family document, branch document, event photo or source scan.
- Visibility: private, family, clan, public candidate, with living-person protection evaluated before public exposure.
- Caption and source note: short human description and source provenance.
- Storage key: opaque provider key, never a raw secret and never a public bucket URL by default.
- Thumbnail reference: optional future derivative key produced by a media-service boundary, not the main Worker.
- Audit fields: created by, created at, updated by, updated at and optional review status.

The candidate metadata model should reference existing people, families, clan/branch records or future event records without duplicating sensitive person data.

## Storage Options

- Supabase Storage: practical if RLS/storage policies can enforce privacy and signed URLs are generated server-side.
- Cloudflare R2: practical for long-lived object storage and future service Worker mediation.
- Future media-service Worker: preferred boundary for upload signing, validation, thumbnail generation and derivative management if media processing becomes heavy.

The selected option must be documented before implementation and must include privacy, retention, deletion and rollback behavior.

## Privacy And Security

- Living-person media is private by default.
- Public display requires explicit visibility and a privacy-safe person state.
- Raw storage keys and signed URLs must not be written into public static content.
- Admin UI may show metadata and warnings, but direct file access must be mediated by server-side authorization.
- Source notes can contain sensitive family context and must follow the same privacy model as the attached record.

## Service Boundary

- Main app allowed in a future approved phase: metadata CRUD, small server-side authorization checks and lightweight UI coordination.
- Media-service or storage boundary required in a future approved phase: upload signing, thumbnail generation, image/video processing, virus scan, large file validation, derivative generation and object lifecycle work.
- Large export/import/media/GEDCOM/ZIP processing remains governed by `docs/RUNTIME_WORKER_GUARDRAIL.md` and `docs/SERVICE_BOUNDARY_ROADMAP.md`.

## Required Future Migration Gates

- Explicit owner approval for any migration.
- Candidate schema reviewed against privacy, RLS, deletion and retention needs.
- Additive-only migration unless a separate destructive approval exists.
- RLS and policies must be designed before apply.
- No use of deferred/excluded tables from previous phases unless a new owner-approved schema phase reopens that decision.

## Required Future Worker And Service Gates

- Decide whether the media flow stays metadata-only in the main app or needs a separate media-service Worker.
- Confirm no new heavy dependency enters the main Cloudflare/OpenNext Worker.
- Confirm OpenNext/Wrangler config changes only happen in an approved Worker/service phase.
- Confirm upload and thumbnail processing are tested without production data before rollout.

## No-Go Conditions

- No schema or migration approval.
- No privacy model for living-person media.
- No RLS/storage policy plan.
- No clear ownership of upload signing and thumbnail generation.
- Need for heavy image/video/document processing without service boundary approval.
- Any plan that exposes public bucket URLs directly for private family media.

## Recommended Phase 118B Scope

Phase 118B may draft a media metadata schema candidate and storage policy checklist. It should remain docs/static unless the owner explicitly approves a migration phase. It must not create buckets, upload files, process thumbnails or create a Worker.

## Runtime And Worker Boundary Status

- Main Worker touched: NO
- Runtime dependency added: NO
- New service Worker created: NO
- OpenNext/Wrangler config changed: NO
- Worker size risk introduced by this phase: NO
- Storage bucket created: NO
- Media upload implemented: NO
- Thumbnail or image processing implemented: NO
- Heavy export/import/media/GEDCOM/ZIP work: deferred to boundary-governed future phases
- Migration created: NO
- SQL file created: NO
- DB apply: NO
- SQL mutation: NO
- Seed/backfill: NO
- Deploy: NO
- Push: NO
