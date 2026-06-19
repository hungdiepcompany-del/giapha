# Phase 121A - Lightweight Inline Admin Warning UI

Status: `COMPLETED_LOCAL_STATIC_VALIDATED`

Owner approval: `OPTION_D_INLINE_ADMIN_WARNING_UI_ONLY`

## Scope

Phase 121A implements small, deterministic warning hints on existing admin
surfaces. It does not start a persistent data-quality system, media work, a
full-tree scanner, or a service Worker.

The warning UI uses the approved Vietnamese severity labels:

- `Thông tin`
- `Cảnh báo`
- `Cần xử lý`

Each warning includes a deterministic code, a short explanation and an
actionable next step. Color is not the only severity signal.

## Already-Loaded Data Boundary

Warning helpers are pure functions. They receive person, lineage dashboard,
membership or selected tree-node data that the page has already loaded.

- No warning helper queries Supabase.
- No extra fetch is added.
- No full-tree scan is added.
- No warning state is persisted.
- An empty warning list only describes the data currently displayed; it does
  not claim that the whole family tree was scanned.

## Admin People Warning Surface

The admin person detail page can show:

- incomplete basic identity fields;
- invalid birth/death date order;
- living-person public visibility risk;
- multiple primary lineage memberships;
- incomplete branch/generation assignment;
- branch or generation-rule scope conflict.

The warning panel is rendered only after the person and required lineage lists
have loaded successfully.

## Admin Genealogy Warning Surface

The genealogy dashboard and membership management page can show aggregate
warnings from the already-loaded lineage collections:

- no memberships in the displayed scope;
- missing branch or generation assignment;
- multiple primary memberships for a person;
- branch or generation-rule scope conflicts.

No additional list or count query is introduced for warnings.

## Tree Editor Warning Surface

The selected person-node side panel can show:

- missing branch or generation display data;
- living-person public visibility risk.

The helper only receives the selected node already present in the loaded tree
graph. It does not traverse or scan the full graph for quality findings.

## Privacy And Permission Behavior

- Warning surfaces remain inside existing server-guarded admin routes and the
  existing admin tree editor.
- Warning copy does not expose `notes_private`, `source_note`, credentials or
  hidden relationship details.
- No warning component is added to public routes.
- Living-person visibility warnings remain administrative hints and do not
  disclose extra person data.
- If required page data fails to load, the warning panel fails closed instead
  of presenting incomplete findings as authoritative.

## Runtime And Worker Boundary

- Main Worker touched: existing admin application bundle only
- Runtime dependency added: NO
- New service Worker created: NO
- OpenNext/Wrangler config changed: NO
- Heavy export/import/media/GEDCOM/ZIP work added: NO
- Full-tree or full-database quality scan added: NO
- Worker size risk introduced: minimal component/helper code only

This phase follows `docs/RUNTIME_WORKER_GUARDRAIL.md` and
`docs/SERVICE_BOUNDARY_ROADMAP.md`. Heavy scanning, media processing and large
export/import work remain deferred to separately approved boundary-governed
phases.

## Explicitly Not Implemented

- No migration.
- No `.sql` file.
- No DB apply.
- No SQL mutation.
- No seed/backfill.
- No persistent warning table.
- No full-tree scan.
- No media upload, storage or processing.
- No Worker created.
- No OpenNext/Wrangler config change.
- No runtime dependency added.
- No deploy.
- No push.

## Validation

Validation status: `PASS_WITH_CLEAN_TEMP_BUILD`

The Phase 121A checker verifies the approved files, deterministic warning
codes, Vietnamese labels, privacy copy, dependency stability and all
schema/Worker/config/public-route boundaries.

- Phase 121A and inherited media/data-quality/domain checkers: PASS
- Environment safety and migration order checks: PASS
- Typecheck and lint: PASS
- Workspace-root build: blocked before compile by the pre-existing Windows
  `.next` ACL `EPERM` unlink error
- Clean temp copy `npm run build`: PASS
- Git whitespace checks: PASS

## Recommended Next Phase

Keep media, persistent warnings and heavy data-quality scans deferred. Any
future Phase 121B must receive separate owner approval and must name its schema,
service or runtime boundary explicitly.
