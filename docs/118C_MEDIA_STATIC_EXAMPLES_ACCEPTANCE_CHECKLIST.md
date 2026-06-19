# Phase 118C - Media Static Examples And Acceptance Checklist

Static examples status: `DESIGN_ONLY`

## Summary

Phase 118C provides non-runtime media examples and acceptance checklists for future implementation review. Every identifier, object key and payload below is illustrative only. Nothing here authorizes schema, storage, upload, processing, Worker or deploy work.

## Example Media Metadata Payloads

### Portrait Photo

```yaml
example_kind: portrait_photo
target_type: person
target_id: example-person-id
visibility: family
caption: Anh chan dung da duoc gia dinh xac minh
source: Family archive
storage_key: people/example-person-id/original/example-portrait.jpg
thumbnail_key: people/example-person-id/thumbnail/example-portrait.webp
content_type: image/jpeg
file_size: 1843200
checksum: sha256:example-only
upload_owner: example-admin-id
```

Acceptance note: a living person's portrait remains family/private unless explicit privacy review permits public display.

### Grave/Tomb Photo

```yaml
example_kind: grave_tomb_photo
target_type: person
target_id: example-ancestor-id
visibility: family
caption: Anh bia mo, thong tin vi tri duoc giu noi bo
source: Family field record
storage_key: memorial/example-ancestor-id/original/tombstone.jpg
content_type: image/jpeg
file_size: 2457600
checksum: sha256:example-only
upload_owner: example-editor-id
```

Acceptance note: location and source details may require stricter privacy than the image.

### Family Document

```yaml
example_kind: family_document
target_type: family
target_id: example-family-id
visibility: private
caption: Ban scan tai lieu gia dinh
source: Private family archive
storage_key: families/example-family-id/original/document.pdf
content_type: application/pdf
file_size: 5242880
checksum: sha256:example-only
upload_owner: example-owner-id
```

Acceptance note: personal documents default to private and require server-authorized access.

### Clan/Branch Archive Photo

```yaml
example_kind: clan_branch_archive_photo
target_type: branch
target_id: example-branch-id
visibility: family
caption: Anh tu lieu cua chi
source: Branch archive
storage_key: branches/example-branch-id/original/archive-photo.jpg
content_type: image/jpeg
file_size: 3145728
checksum: sha256:example-only
upload_owner: example-admin-id
```

### Event Photo

```yaml
example_kind: event_photo
target_type: family_event
target_id: example-event-id
visibility: family
caption: Anh le tuong niem
source: Family contributor
storage_key: events/example-event-id/original/memorial.jpg
content_type: image/jpeg
file_size: 2097152
checksum: sha256:example-only
upload_owner: example-contributor-id
```

Acceptance note: this example does not authorize an event table or media table.

## Example Visibility Cases

- Public: only after explicit visibility choice, public-safe linked record and living-person protection.
- Family: authenticated family viewers with server-side permission checks.
- Private: authorized admins/operators only, using signed URL or equivalent protected access.
- Living-person-sensitive: private by default; no public fallback and no direct bucket URL.

## Example Storage Contract Cases

- Original object: immutable original key plus content type, size, checksum and uploader identity.
- Thumbnail object: derivative key linked to the original; generated only by an approved media-service process.
- Checksum: SHA-256 or approved equivalent recorded for integrity and export/backup verification.
- Content type: allow-listed MIME type verified independently from file extension.
- File size: measured server-side and checked against an approved limit.
- Owner/uploader: authenticated actor and linked domain owner recorded separately.
- Retention/deletion state: active, pending deletion, retained for backup or deleted after approved lifecycle handling.

## Unsafe Examples That Must Be Rejected

- Public direct bucket URL for private media.
- Missing visibility.
- Missing owner/source.
- Unsupported content type.
- Oversized file.
- Unscanned executable-like file.
- Storage key containing a secret or credential.
- Thumbnail claimed as complete when no approved processor ran.

## Future Media Migration Acceptance Checklist

- [ ] Explicit owner approval names the migration phase.
- [ ] Schema candidate defines references, visibility, audit fields and soft-delete/lifecycle behavior.
- [ ] RLS/privacy review covers public, family, private and living-person-sensitive cases.
- [ ] Storage provider and object-key strategy are approved.
- [ ] No direct public bucket leakage is possible.
- [ ] Export/backup media manifest and checksum impact are reviewed.
- [ ] Rollback, post-apply verification and no-go conditions are documented.

## Future Media-Service Worker Acceptance Checklist

- [ ] Owner approval names the service implementation phase.
- [ ] Route and request/response contracts exist.
- [ ] Env/secret names are documented without secret values.
- [ ] Auth/internal token or service-binding strategy is approved.
- [ ] Upload, thumbnail, image processing and virus/file safety responsibilities are bounded.
- [ ] Safe-skip smoke plan exists.
- [ ] Deploy, rollback and main-app integration plans exist.
- [ ] Heavy dependencies stay out of the main Cloudflare/OpenNext Worker.

## Future Export/Backup Media Acceptance Checklist

- [ ] Media manifest records object identity, checksum, content type, size and visibility safely.
- [ ] Private media remains protected during export generation and download.
- [ ] `media.zip` and large ZIP assembly follow the export service boundary.
- [ ] Restore behavior validates checksum and avoids overwriting existing objects without confirmation.
- [ ] Missing objects and stale metadata produce explicit report entries.
- [ ] Large export/backup work does not move into the main Worker by default.

## No-Go Conditions Before Any Media Runtime Implementation

- Missing owner approval.
- Missing schema/storage/privacy decision.
- Missing RLS or signed-access design.
- Missing service boundary for heavy processing.
- Missing export/backup impact review.
- Any direct public URL path for private media.
- Any plan to use executable-like files without approved safety scanning.

## Explicitly Not Implemented

- No migration.
- No `.sql` file.
- No DB apply.
- No SQL mutation.
- No seed/backfill.
- No table creation.
- No storage bucket.
- No media upload.
- No thumbnail/image processing.
- No file safety scan.
- No large export/import/GEDCOM/ZIP.
- No Worker created.
- No OpenNext/Wrangler config change.
- No runtime dependency added.
- No deploy.
- No push.

## Recommended Future Phase

Phase 118D may prepare a media schema candidate review or service contract review only after the owner chooses the next approval boundary. These examples are not implementation authorization.
