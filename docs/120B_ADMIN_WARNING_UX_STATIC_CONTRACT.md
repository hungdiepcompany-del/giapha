# Phase 120B - Admin Warning UX Static Contract

Static UX contract status: `DESIGN_ONLY`

## Summary

Phase 120B defines a static admin warning UX contract for future media and data-quality warnings. It does not query warning tables, create fake runtime data, implement components, add routes, mutate data, create schema or deploy service infrastructure.

The contract exists so future UI work can stay clear, accessible and privacy-safe before any persistent warning model exists.

## Warning Locations

- Admin people: person detail, identity section, lineage membership section and relationship overview.
- Admin genealogy: clan, branch, generation rule and membership management screens.
- Admin tree editor: selected-node side panel or compact warning summary, not dense warnings inside every node.
- Import preview later: grouped row/person warnings before import confirmation.
- Export readiness later: package-level warnings before large JSON/GEDCOM/ZIP/media export.

## Vietnamese Labels

- `Thông tin`
- `Cảnh báo`
- `Cần xử lý`

The final visual design may map these labels to info, warning and blocking severity, but public pages must not display admin-only warning language.

## UX States

- No warnings: friendly empty state explaining that no warnings exist for the current scope.
- Warning list: short list with severity, title and next action.
- Grouped warnings: grouped by person, family, branch, import row, export package or warning category.
- Blocking warning: visibly blocks only the risky action, not ordinary admin navigation.
- Dismissed/resolved warning later: future state that requires source, audit and privacy design before persistence.

## Privacy-Safe Copy Rules

- Do not include private notes, source text, hidden relationship facts or raw storage keys in warning copy.
- Public routes must not show admin warning copy.
- Living-person context stays admin-only.
- Duplicate-candidate copy must avoid naming records the current admin cannot view.
- Media warnings must not expose bucket names, signed URLs or object keys on public routes.
- Export/import warnings must distinguish structural issues from private content without printing private content.

## Accessibility And Basic UI Rules

- Warning severity cannot rely on color alone.
- Use text labels and semantic grouping.
- Keep warning titles short and action-oriented.
- Blocking warnings must explain which action is blocked and why.
- Lists should be keyboard navigable in future UI work.
- Empty states should be calm and not imply that data was fully scanned unless a scan actually ran.

## What Can Be Done Without DB Schema

- Static copy contract.
- Non-runtime examples in docs.
- Acceptance checklist for future warning components.
- Lightweight inline hints in a future approved runtime phase when derived from data already loaded for the current admin view.

## What Requires Future Schema Or Service

- Persistent dismissed/resolved state.
- Warning history or audit trail.
- Full-family or full-tree warning counts.
- Duplicate candidate scoring.
- Import-wide validation reports.
- Export-readiness package warnings.
- Media scan or thumbnail/file safety warnings.
- Scheduled or quality-service generated warnings.

## Explicitly Not Implemented

- No migration.
- No `.sql` file.
- No DB apply.
- No SQL mutation.
- No seed/backfill.
- No warning table query.
- No fake runtime warning data.
- No runtime component.
- No route.
- No full-tree runtime scan.
- No import/export runtime scan.
- No media upload or thumbnail processing.
- No Worker.
- No OpenNext/Wrangler config change.
- No runtime dependency.
- No deploy.
- No push.

## Recommended Future Phase

Recommended next UX phase: Phase 120C admin warning component acceptance checklist and static examples. Runtime component implementation should wait until the owner chooses lightweight inline hints or a persistent warning/service model.

## Runtime And Worker Boundary Status

- Main Worker touched: NO
- Runtime dependency added: NO
- New service Worker created: NO
- OpenNext/Wrangler config changed: NO
- Worker size risk introduced by this phase: NO
- Service boundary recommendation: keep UX static until warning source, privacy and persistence model are approved
