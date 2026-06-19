# Phase 121B - Inline Warning UI Post-Integration Smoke

Status: `COMPLETED_LOCAL_STATIC_VALIDATED`

## Summary

Phase 121B reviewed the Phase 121A inline admin warning UI after integration.
The review confirmed that the warning UI remains a lightweight admin-only
helper surface and does not open media, persistent warnings, full-tree scans,
migration, Worker, dependency or deploy scope.

One checker hardening was added: `check:inline-admin-warning-ui` now also scans
public route/component files to reject admin warning imports, inline warning
helpers and persistent-warning table references on public surfaces.

## Smoke/Review Result

- Admin genealogy route with no effective permissions fails closed: the page
  shows the existing permission message and does not render fake warning data.
- Public tree route renders without admin warning panels or admin warning copy.
- Browser console for the public tree smoke did not report warnings or errors.
- Source audit confirmed warning helpers are pure and receive only data already
  loaded by the current admin surface.

## UI/Copy Review

- Severity labels remain clear and in Vietnamese: `Thông tin`, `Cảnh báo`,
  `Cần xử lý`.
- Warning cards include a visible text label, title, explanation and
  `Việc tiếp theo:` action line; color is not the only signal.
- Empty state says that no warning was found from the displayed data and does
  not claim that the whole family tree was scanned.
- Footer copy states that warnings only use data already loaded on the admin
  page, are not stored and are not shown on public routes.

## Privacy Review

- Warning messages do not include `notes_private`, `source_note`, hidden
  relationship facts, credentials, storage keys or raw source material.
- Warning UI is integrated only on admin people, admin genealogy, membership
  management and admin tree-editor selected-node surfaces.
- Public route source files are now covered by the Phase 121A checker against
  admin warning UI/helper imports and persistent warning references.
- Public behavior remains fail-closed under the existing permission/privacy
  model.

## Performance Boundary Review

- No extra warning query was added.
- No warning state is persisted.
- No full-tree or full-database scan was added.
- No media/upload/storage/thumbnail processing was added.
- No large export/import/GEDCOM/ZIP work was added.
- No Worker, OpenNext/Wrangler config or dependency change was made.

## Checker Result

`check:inline-admin-warning-ui` now verifies:

- approved Phase 121A doc markers;
- deterministic warning codes and labels;
- admin people/genealogy/tree integrations;
- dependency stability;
- no SQL/migration/config/Worker/public-route changes in the current diff;
- no forbidden warning persistence/media/scan/private-field tokens in the
  Phase 121A runtime files;
- no admin warning imports/helpers or persistent-warning references in public
  route/component source files.

## Validation Result

- `npm run check:inline-admin-warning-ui`: PASS
- `npm run check:media-quality-final-readiness`: PASS
- `npm run check:media-quality-static-examples`: PASS
- `npm run check:media-quality-static-contracts`: PASS
- `npm run check:media-quality-boundary-design`: PASS
- `npm run check:vietnamese-genealogy-manual-sql-diagnostic-pass`: PASS
- `npm run check:vietnamese-genealogy-domain-ui`: PASS
- `npm run check:vietnamese-genealogy-domain`: PASS
- `npm run check:env:safe`: PASS
- `npm run check:migrations`: PASS
- `npm run typecheck`: PASS
- `npm run lint`: PASS
- Workspace-root `npm run build`: blocked before compile by the existing
  Windows `.next` ACL `EPERM` unlink error
- Clean temp copy `npm run build`: PASS
- `git diff --check`: PASS
- `git diff --cached --check`: PASS

## Explicitly Deferred Items

- Persistent warning table.
- Dismissed/resolved warning lifecycle.
- Full-tree data-quality scan.
- Duplicate-person scoring.
- Import/export/GEDCOM/ZIP readiness scans.
- Media upload/storage/processing.
- Media-service Worker.
- Quality-service Worker.
- Deploy/push.

## Next Recommended Phase

Keep media, persistent warnings and heavy data-quality scans deferred. The next
phase should be separately owner-approved and should be either documentation or
static design for one bounded path, such as a data-quality service design,
persistent warning schema candidate, or export/import boundary design.
