# Felines — UI Consistency & Modernization Audit

Full-platform UI audit across 4 parallel workstreams: consistency, modernization/education, animation/motion, and mobile/dark-sections. Complements [`AUDIT_REPORT.md`](AUDIT_REPORT.md) (bugs/refactor/security).

## 1. Foundational fix (done first, before the 4 workstreams)

The dark-section design tokens (`--color-felines-dark`/`-dark-accent` in [`app/globals.css`](app/globals.css)) were a lighter caramel brown (`#8a5a35`/`#a4734a`) rather than the canonical palette's coffee-brown (`#2D1810`/`#3D2318`). Since every dark section reads these two CSS variables via Tailwind's `bg-felines-dark` utility, correcting them once cascaded everywhere without touching individual components. Also aligned `text-secondary-on-dark` (`#C4A090`) and added a missing `success-hover` token.

## 2. UI consistency audit

Full findings table in the workstream's own commit description; summary:

**Fixed (S effort):**
- Inline hex `style={{ color: "#..." }}` colors replaced with `felines-*` Tailwind classes in `AnonymousReportNotice.tsx`, `FactChip.tsx`, `LocationBlurBadge.tsx`, `ReadingProgressBar.tsx`, `ColonyStatsTab.tsx`, `ColonyDetailClient.tsx`.
- Raw hex dark-section background (`bg-[#2D1810]`) in `ImpactPageClient.tsx` → `bg-felines-dark`.
- `ColonyMilestones.tsx` raw hex card background + inline `borderLeft` style → palette classes.

**Flagged (M/L effort, not fixed):**
- Leaflet marker/polygon colors as raw hex strings in `ColonyMap.tsx`, `MapMarkerPicker.tsx`, `MapPreviewIllustration.tsx` — Leaflet's `divIcon`/`pathOptions` APIs require literal color strings, can't take Tailwind classes. Effort M: centralize into shared JS constants for traceability.
- `text-white` used in 43 files instead of the semantically-named `text-felines-text-primary-on-dark` (value-identical, `#ffffff`, but inconsistent token naming). Effort L: mass find/replace needs case-by-case review (button text vs. dark-section text have different intent even at the same color value).

**Confirmed already clean:** no off-palette gray/blue/purple Tailwind classes anywhere, focus rings uniformly `#c4704f` via one global rule, no icon library mixing (emoji-only, deliberate), single `NavBar`/`ColonyTabs`/`EmptyState` implementation each (no hand-rolled duplicates).

## 3. Modernization & educational UI

**Fixed (S effort):**
- Map empty state ("no colonies visible") now surfaces a rotating "did you know" fact via the existing `RotatingSingleFact` component, previously built but unused here.
- Colony narrative text given more visual weight (`text-lg`, primary color instead of small/secondary).
- Uncastrated-colony nudge added to the Needs tab, linking to the TNR article.
- Profile streak card: 🔥 and count bumped to `text-3xl font-bold` (was buried in small text).
- Profile badges: each type now gets a distinct color (accent/success/warning/emergency) instead of one identical gray pill style.
- Colony health index (`ColonyStatsTab.tsx`): now progressive disclosure — score + status shown first, the 5 weighted factors revealed only behind a "See how it's calculated" toggle.

**Confirmed already at the bar (no change needed):** home hero sizing/spacing, dark-section CTA inversion, map search/filter styling, colony cover-photo hero treatment, article level-grouping system, reading progress bar smoothness, `HelpFlow` situation-specific guidance, `ColonyMilestones` treatment.

**Flagged:** Leaflet zoom control restyling (Medium — finicky DOM to touch safely).

## 4. Animation & motion system

Confirmed substantial existing infrastructure (`Reveal` scroll-reveal component, `CountUpStat`, a global `prefers-reduced-motion` block that already disables all transitions/animations site-wide) and extended it rather than rebuilding:

**Added:**
- Scroll reveal on `ArticlePageClient.tsx` and `GlossaryList.tsx` (previously missing).
- `CountUpStat` wired into `ColonyStatsTab.tsx` summary cards.
- Map pin hover: spring-eased scale with cubic-bezier overshoot.
- Logo bounce-on-mount, language-switcher sliding background indicator (replacing an instant color swap), streak flame flicker animation.
- Modal enter transitions (backdrop fade + panel slide-up) added to `HelpModalProvider`, `CatsConflictModal`, `GlobalSearchButton`.
- Loading skeletons: new `.felines-skeleton` shimmer utility, applied to the map loading state, profile page (was `return null`), and two new route-level `loading.tsx` files for `/colony/[id]` and `/learn/[slug]` (neither had any loading UI before).

**Flagged:** `ColonyTabs` sliding active-underline (Medium — a real ref-measured implementation, deferred to avoid colliding with a concurrent mobile-scroll change to the same file); confetti-style success bursts (explicitly out of scope, no new dependency).

## 5. Mobile & dark-section polish

**Fixed (S effort):**
- Tap targets bumped to 44×44px minimum: `ActionThanksButton`, `StoryHeartButton`, `GlobalSearchButton`'s search icon, the navbar "I need help" CTA.
- `ColonyTabs` now scrolls horizontally on overflow instead of wrapping/squishing.

**Flagged:** language-switcher PT/EN pills left at 32px deliberately (bumping to 44px would visually balloon a small joined control) — a design-call, not an oversight; swipe gestures and a bottom-sheet pattern for map filters/help flow (both Medium/Large, no gesture library added per instructions).

**Dark sections:** fully audited, found already compliant — correct token usage, correct on-dark text colors, correct nested-card treatment, `onDark` button variant consistently applied, no overflow/gap bugs at 375px. No fixes needed.

## 6. Current state

- `npm run lint` — 0 errors, 0 warnings.
- `npm run build` — succeeds, all routes compile cleanly (including 2 new `loading.tsx` skeleton routes).
- Working tree clean; 8 commits from this audit, each scoped to its workstream.

## 7. Backlog (flagged, not fixed)

| Item | Effort | Why deferred |
|---|---|---|
| Centralize Leaflet hex colors into shared constants | M | Leaflet APIs require literal color strings, not Tailwind classes |
| `text-white` → `text-felines-text-primary-on-dark` rename (43 files) | L | Value-identical; needs case-by-case review, not a blind find/replace |
| Leaflet zoom control restyling | M | Finicky DOM structure, risk of breaking button semantics |
| `ColonyTabs` sliding active-underline | M | Needs ref-measured positioning; deferred to avoid a concurrent-edit collision this session |
| Swipe gestures (colony tabs, notifications) | M/L | No gesture library added per instructions; needs a deliberate UX decision first |
| Bottom-sheet pattern (map filters, help flow) | M | Existing dropdown/inline panels don't map cleanly to a "trivial" bottom-sheet retrofit |
