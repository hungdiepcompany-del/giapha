# Real Supabase Smoke Test Report

## Status

PASS

Phase 12 records the stable baseline after the user-confirmed real Supabase smoke test. This is a documentation and stability phase only; no schema, migration, auth logic, UI feature, import confirm, restore flow, deploy, or remote push was performed.

## Environment

- Local project: `D:\CODE\GIA PHẢ`
- Supabase env: configured
- Secrets committed: no
- Deploy: not yet
- Push remote: not yet

## Database

- Migrations 0001-0006: NOT_CONFIRMED by direct migration evidence in this phase
- Real database operation: PASS, user confirmed a real family person was added to the real database
- Re-running all migrations after real data: prohibited unless reviewed

Once real family data exists, do not rerun the full migration set blindly. Any production-like migration action must be reviewed against current schema/data state first.

## Auth

- Google OAuth: PASS, user confirmed login succeeded
- Magic link: NOT_CONFIRMED in this phase
- PKCE issue: transient, resolved without code change
- OWNER assignment: PASS from prior user confirmation that the active profile has OWNER role

## Admin routes

User confirmed main smoke-test routes/functions were OK. Per-route evidence was not captured in this phase, so each route below is recorded as PASS_USER_CONFIRMED rather than independently re-tested by Codex.

- `/admin`: PASS_USER_CONFIRMED
- `/admin/system/status`: PASS_USER_CONFIRMED
- `/admin/people`: PASS_USER_CONFIRMED
- `/admin/relationships`: PASS_USER_CONFIRMED
- `/admin/tree`: PASS_USER_CONFIRMED
- `/admin/tree/edit`: PASS_USER_CONFIRMED
- `/admin/exports`: PASS_USER_CONFIRMED
- `/admin/exports/import`: PASS_USER_CONFIRMED
- `/admin/revisions`: PASS_USER_CONFIRMED

## Public routes

- `/`: PASS_USER_CONFIRMED
- `/tree`: PASS_USER_CONFIRMED
- `/people/[slug]`: NOT_CONFIRMED

## Data operations

- Add person: PASS
- Edit person: NOT_CONFIRMED
- Soft delete/restore: NOT_CONFIRMED
- Add relationship: NOT_CONFIRMED
- Tree render: PASS_USER_CONFIRMED
- Tree edit/layout: PASS_USER_CONFIRMED

## Export/import/revision

- `family.json`: PASS_USER_CONFIRMED
- `family.ged`: PASS_USER_CONFIRMED
- `full-backup.zip`: PASS_USER_CONFIRMED
- Import preview: PASS_USER_CONFIRMED
- Import confirm: disabled
- Revision list/detail: PASS_USER_CONFIRMED
- Restore revision: disabled

## Known warnings

- npm audit: moderate Next/PostCSS warnings may remain; no force fix
- Import confirm not implemented
- Revision restore not implemented
- Deploy not done
- Remote push not done

## Stable Baseline

Current baseline is stable before UI polish. It includes project foundation, auth and permissions, people CRUD foundation, relationship CRUD foundation, tree viewer/editor, public/private mode, export/backup, revision history, JSON import preview, Supabase integration gate, Google OAuth login, and user-confirmed real Supabase smoke-test success.

## Next recommendation

Phase 13 - UI Polish Foundation
