# A-15A1 - Public Home Modern Heritage UI

Status: `PASS_LOCAL_STATIC`

Source: `docs/PLAN_A15A0_GEMINI_MODERN_HERITAGE_UI_UX_DESIGN_SPEC.md`

Scope: Public Home UI only.

## A-15A1.1 - Inspect Public Home

- Home route: `app/(public)/page.tsx`.
- Main Public Home component: `components/public/public-home.tsx`.
- Shared shell used directly by Public Home: `components/layout/public-shell.tsx`.
- Shared components used by Public Home: `components/ui/action-link.tsx` and
  `components/ui/section-card.tsx`.
- `ActionLink` and `SectionCard` were not changed in this phase; Public Home
  passes scoped class overrides where needed.
- Existing UI already had a warm direction, but the home hero still read like a
  product landing page with feature-grid language, squared card corners and a
  less explicit teal/amber Modern Heritage token set.

## A-15A1.2 - Modern Heritage Public Home Polish

- Applied warm paper background with `bg-stone-50`.
- Updated hero to feel like a family genealogy cover page:
  `Lưu giữ ký ức, kết nối các thế hệ.`
- Added warmer supporting copy:
  `Cội nguồn yêu thương của dòng họ...`
- Primary CTA now uses `bg-teal-700 text-white hover:bg-teal-800`,
  `rounded-full`, `min-h-11` via `ActionLink`, and `shadow-sm`.
- Secondary admin/login action stays quieter with `border-stone-200`,
  `text-stone-700`, `hover:bg-stone-100` and rounded-full styling.
- Stats/card area uses `bg-white/90`, `border-stone-200`, `rounded-xl`,
  `rounded-2xl`, `shadow-sm` and `shadow-md`.
- Amber accent is used for the home eyebrow and privacy note:
  `bg-amber-50 text-amber-800`.

## A-15A1.3 - Mobile Public Home

- Header navigation remains stacked on mobile with two public links and a quiet
  admin link.
- Hero text uses mobile-safe `text-3xl` before scaling to `sm:text-5xl`.
- CTA buttons stack in a grid on small screens and keep `min-h-11`.
- Cards stack to one column before wider breakpoints.
- No sticky, drawer, bottom navigation, new menu state or gesture behavior was
  added.

## A-15A1.4 - Vietnamese Copy

- Public Home copy was polished to Vietnamese with diacritics.
- Copy is short, warm and family-oriented.
- No internal route, key, service or permission identifier was changed.
- No feature promise was added beyond existing public tree, privacy filtering
  and export availability for admins.

## A-15A1.5 - Checker

- Added `scripts/check-a15a1-public-home-modern-heritage-ui.cjs`.
- Added package command `check:a15a1-public-home-modern-heritage-ui`.
- Checker validates:
  - A-15A1 doc exists and references Gemini Modern Heritage source.
  - Public Home scope and UI-only boundary are documented.
  - Public Home uses `stone`, `teal`, `amber`, `rounded`, `shadow` and
    `min-h-11` / equivalent touch target tokens.
  - Vietnamese copy evidence exists.
  - Changed files stay in Public Home / public shell / docs / checker scope.
  - No DB/schema/migration, `.sql`, API/action/service logic, auth/permission,
    route, Worker/OpenNext/Wrangler, dependency, deploy, secret/session/token/
    cookie/storage-state or `PLANNING.MD` drift is present.

## A-15A1.6 - Validation

Validation result: `PASS_LOCAL_STATIC_AND_BROWSER_SMOKE`.

Required commands for this phase:

- `npm run check:a15a1-public-home-modern-heritage-ui`
- `npm run check:a15a0-gemini-modern-heritage-design-spec`
- `npm run check:a14g-public-browser-visual-smoke`
- `npm run check:a14f-browser-visual-smoke-readiness`
- `npm run check:a14e-mobile-ux-sweep`
- `npm run check:a14d-tree-viewer-interaction-ux`
- `npm run check:a14c-admin-dashboard-layout-ux`
- `npm run check:a14b-public-tree-home-ux`
- `npm run check:a14a-related-member-add-ux`
- `npm run check:ui-polish`
- `npm run check:vietnamese-ui-copy`
- `npm run check:vietnamese-cultural-ui-ux`
- `npm run check:env:safe`
- `npm run check:migrations`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `git diff --cached --check`

Observed results:

- Required static/checker validation: PASS.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS.
- Browser smoke on `http://localhost:3100/`: PASS.
- Desktop overflow check: PASS.
- Mobile viewport `390x844` overflow check: PASS.
- Root build passed directly; no clean temp-copy workaround was required.

## A-15A1.7 - Commit Boundary

Commit target: `ui: apply modern heritage public home polish`.

Boundary confirmed:

- Public Home only.
- UI-only.
- No DB/schema/migration.
- No `.sql`.
- No DB apply or check SQL on DB.
- No API/action/service logic change.
- No auth/permission/middleware/RLS change.
- No route change.
- No tree layout algorithm change.
- No runtime merge/dedupe.
- No permission runtime registration.
- No Worker/OpenNext/Wrangler change.
- No dependency.
- No deploy.
- No secret/session/token/cookie/storage-state.
- `PLANNING.MD` not read or committed.
