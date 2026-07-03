# Felines 🐾

> An educational platform for people who aren't "cat people" — at least, not yet.

**Felines is not a colony registry.** It's an educational platform built to turn people who don't particularly like street cats — the annoyed neighbor, the indifferent passerby, the person who's never given it a thought — into people who understand the problem well enough to actually help. Mapping colonies is one of the *actions* the platform gives someone once they've been convinced, not the point of the product.

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js%2016-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Netlify](https://img.shields.io/badge/Deploy-Netlify-00C7B7?logo=netlify&logoColor=white)](https://www.netlify.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![#hackthekitty](https://img.shields.io/badge/%23hackthekitty-The%20World%20Cat%20Domination%20Day%20Hackathon-B66119)](https://hackthekitty.com)

- **Live demo:** [add after deploy] — see [Live Demo](#live-demo) below for current status
- **Repository:** https://github.com/luarawork/felines

### 📖 Documentation

For the full product documentation, visit the Notion:

- 🇧🇷 [Documentação em Português](https://bronzed-longship-a0f.notion.site/Felines-Documenta-o-392f091b2b7481048a73e27049a939cb)
- 🇺🇸 [Documentation in English](https://bronzed-longship-a0f.notion.site/Felines-Documentation-EN-392f091b2b7481ff9a45e3b8b06f3993)

If you'd like to know more about my work: [luara.work](https://luara.work/)

---

## Table of Contents

- [The Problem](#the-problem)
- [The Hackathon Theme](#the-hackathon-theme)
- [Live Demo](#live-demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Security](#security)
- [Testing](#testing)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [How AI Was Used](#how-ai-was-used)
- [Impact Data](#impact-data)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## The Problem

There are an estimated 10 million stray cats in Brazil alone (World Health Organization / WSPA), and 480 million worldwide (World Animal Foundation). Shelters and NGOs are already past capacity — roughly 185,000 animals are living in institutions with no room to take in another one (Instituto Pet Brasil, 2023), and abandonment in Brazil grew from an estimated 3.9 million animals in 2018 to 8.8 million by 2020. Removal-based "solutions" don't work either: decades of attempts across different cities show that an emptied territory gets reoccupied within months — the WHO's own guidance is TNR (Trap-Neuter-Return), not removal, for exactly this reason.

Every cat-welfare platform we looked at talks to people who already care: established caretakers, donors, adopters. Nobody built a bridge for the much larger group that matters just as much — the neighbor annoyed by the smell on their street, the passerby who's curious but non-committal, the person who wants to help but has no idea where to start. Nearly 40% of Brazilians report having had a conflict with a neighbor involving animals (IBGE), and a lot of that friction comes down to not knowing why the cats are there, who (if anyone) is already caring for them, or that castration — not removal — is what actually works.

Felines is built for that gap — and it is, deliberately, an **educational platform first**, not a colony-registration tool that happens to have some articles attached. Its job is to take someone who doesn't like street cats and walk them, through logic rather than guilt, to the point where they understand the problem well enough to act: the vacuum effect that explains why removal fails, the way castration reduces the exact behaviors that cause conflict, the fact that a mapped, cared-for colony is quieter and calmer than an unmanaged one. Once that understanding lands, the platform hands the person concrete actions — reporting a sighting, registering a colony, becoming a caretaker — that only make sense *because* the education came first. The product never asks for altruism up front. It makes the practical case, and lets people arrive at caring on their own terms.

---

## The Hackathon Theme

The brief nudges toward "world domination." Our reading of that, for a project like this:

> Real domination isn't convincing the already-convinced. It's conquering those who still resist.

Every returning cat lover, every existing NGO donor, every already-committed caretaker is a person Felines didn't need to reach — they were already reached. The people worth building for are the ones who start from friction, indifference, or mild hostility, and end up contributing anyway, because the platform met them exactly where they were instead of asking them to change first.

```
Citizen with a problem or curiosity
            ↓
  Finds Felines — feels understood, not judged
            ↓
  Discovers that removal doesn't work (vacuum effect)
            ↓
        Acts out of self-interest
            ↓
  Without realizing it, became a guardian. 🐾
```

That's the whole strategy in one flow: nobody is asked to love cats to take the first step, and by the time they've taken a few, most of them do anyway.

---

## Live Demo

**This project is not yet deployed to a public URL as of this submission.** Once deployed to Netlify, this section will be updated with the live URL and a seeded demo account judges can use directly, without running anything locally.

In the meantime, the app runs locally in a few minutes with a free Supabase project and a free OpenWeatherMap key — see [Getting Started](#getting-started). This section describes what a judge will find either way.

### Demo account (once deployed)

| | |
|---|---|
| Email | `judge@felines.app` |
| Password | `FelinesDemo2026` |

### Without an account

- Browse the interactive colony map, with pins shown at a privacy-protecting blurred location
- Open any colony's public page — cover photo, narrative, cats, timeline, needs
- Read the full 19-article educational guide, the 36-term glossary, and the toxic-plants reference
- Open "Preciso de ajuda" (Need help) — a 2-step emergency assistant covering 9 situation types, no login wall
- Submit most report types (sightings, injured/sick cats, suspected poisoning, abuse, disease outbreaks)
- Switch the entire UI between Portuguese and English at any time

### With the demo account

- See a colony's exact location instead of the blurred approximation ([why](#progressive-location-blur))
- Register a new colony, or link yourself as a caretaker of an existing one
- Log feedings/water check-ins, add named cats, write a caretaker's letter, set up recurring care reminders
- Confirm or manually resolve community reports; report a lost cat
- Post to the community stories wall or the resource-exchange board
- Track reading progress and take the personalization quiz, and view a full contribution history

---

## Features

<details>
<summary>🗺️ Interactive Colony Map</summary>
<br>

Built on Leaflet.js (`react-leaflet`) over OpenStreetMap tiles, `/map` renders three kinds of pins — colonies (terracotta), sightings (gray), and emergencies (red, pulsing) — with clustering at low zoom levels so dense areas stay readable. Visitors can search colonies by name and filter by pin type and castration status. A persistent activity panel lists everything currently visible, updating live as the map is panned or zoomed. A weather banner reflects real conditions at the map's current center (not a fixed city), refetching as the map moves. Anonymous visitors who suspect a pin is fake or nonexistent can flag it — a colony accumulating enough false-pin flags is visually marked as disputed.

</details>

<details>
<summary>🔒 Progressive Location Blur</summary>
<br>

The platform's most important security *and* UX decision — protecting the cats themselves, not just data:

- **Level 1 (anonymous):** ~500m blur offset, shown as a visible uncertainty circle.
- **Level 2 (signed in, not yet a caretaker):** ~100m blur offset.
- **Level 3 (linked caretaker or the colony's creator):** exact coordinates, returned only by a server-side function that re-checks the caretaker relationship against the database on every call.

Exact coordinates are never reachable through a direct table query, for any role — see [Security](#progressive-location-blur-1) for the mechanism. See the full reasoning below in the Security section.

</details>

<details>
<summary>🏘️ Colony Pages</summary>
<br>

Each colony has a cover photo (with photo history preserved in the timeline instead of just being overwritten), a narrative description, and a castration-status badge that's automatically calculated from the actual registered cats, not a manually-set flag. Any number of caretakers can link to the same colony, each shown with their avatar and a link to their public profile. The page organizes into tabs: **Cats** (named cats with photos and a castration toggle; a cat unseen for 7+ days gets a visible nudge and a caretaker notification), **Timeline** (a chronological log of everything that's happened, each entry heart-able to thank whoever did it), **Needs** (castration progress, active help/neutering requests, recurring care reminders with overdue/due-today badges), **Reports** (reports filed against this colony), **Letter** (a message caretakers leave for whoever comes next, with full version history), and **Edit** (an edit-history log). A colony becomes community-verified once it accumulates 3 independent confirmations, and anyone can flag a colony page as fake or harmful.

</details>

<details>
<summary>📚 Educational Guide</summary>
<br>

19 short articles across 5 progressive thematic levels (from "what even is a colony" to "what nobody tells you before becoming a caretaker"), each with a reading progress bar, sourced fact chips, and links to related articles. Reading progress is saved per signed-in user and shown on `/profile`. After reading at least 3 articles, a 3-question personalization quiz unlocks, sorting the reader into one of three "neighbor profiles" — Observer, Backup, or Guardian — with a suggested first action; there are no wrong answers. The guide is complemented by a 36-term bilingual glossary, a toxic-plants reference, a separate neighborhood-diagnosis quiz, and a short caretaker course at `/curso`.

</details>

<details>
<summary>🚨 Emergency Help Flow</summary>
<br>

"Preciso de ajuda," available from the navbar on every page, opens a global modal with a 2-step assistant: pick what's happening from 9 situations — a spotted cat, an injured/sick cat, a lone kitten, a building conflict, suspected poisoning or abuse, a disease outbreak, a missing cat, a threat to a whole colony, or something else — then mark the location on a map. Each situation shows tailored guidance and, where relevant, a specific alert pointing to real local resources: the Disque Denúncia hotline (181), Lei 9.605/98 (Brazil's animal-abuse law), CIOSP emergency (190), or the municipal zoonosis control center (CCZ). Most situations let you submit a report directly from the flow without an account.

</details>

<details>
<summary>📋 Community Reports</summary>
<br>

`/reports` lists open community reports across 9 categories. Anyone can submit most types without an account — an emergency shouldn't wait on a signup — but viewing the list and confirming/resolving requires signing in. A report auto-resolves once 3 different community members confirm it, via an atomic database function that also blocks a report's own creator from confirming it and prevents the same person confirming twice. Reports about suspected poisoning, abuse, or disease outbreaks are automatically flagged "sensitive" by a database trigger and always leave a permanent timeline entry when resolved — never silently deleted. Submissions are rate-limited (10/hour anonymous, 30/hour authenticated) to curb abuse of the no-account path.

</details>

<details>
<summary>🤝 Community Features</summary>
<br>

`/reports` is a 4-tab hub — **Relatos** (reports, above), **Troca de recursos** (a resource-exchange board for supplies, transport, medication, or volunteer time), **Contatos** (a curated directory of 14 real, verified contacts in Natal, RN — veterinary hospitals, NGOs, the environmental police, official hotlines), and **Histórias** (a public wall where linked caretakers share moments from their colonies, with reactions from any signed-in visitor). `/contacts` and `/stories` also work as standalone deep links into the same content.

</details>

<details>
<summary>🌍 Bilingual Support (PT/EN)</summary>
<br>

The entire interface — navigation, all 19 articles, the 36-term glossary, every form, every modal — exists in full Portuguese and English, switchable at any time from the navbar, with the preference remembered and the page's `lang` attribute updated to match. Every piece of content has a human-reviewed English counterpart; nothing is machine-translated at runtime.

</details>

<details>
<summary>🐱 Cat Assistant</summary>
<br>

A small floating cat character with a looping video appears contextually at key moments — first-ever visit, being idle on the home page or on `/reports`, finishing an article, registering a first colony, viewing an empty map area, or completing the neighborhood quiz — sharing one of 8 real cat facts in a speech bubble. Respects a 15-minute cooldown between appearances, never interrupts an open modal or active typing, and honors `prefers-reduced-motion` with a static, non-animated fallback.

</details>

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js 16 (App Router, Turbopack) + TypeScript + React 19 | Server components keep data-fetching close to the database for public pages; client components handle the map, forms, and modals |
| Styling | Tailwind CSS v4 (CSS-based `@theme`, no JS config file) | Fast iteration on a custom editorial design system without leaving the markup |
| Map | Leaflet.js + `react-leaflet` + `react-leaflet-cluster` | Open source, no API key or usage quota, full control over custom pin styling, the blur-circle overlay, and marker clustering |
| Database | Supabase (PostgreSQL) | Row Level Security lets sensitive rules — location blur, report visibility, who can edit what — live in the database itself |
| Auth | Supabase Auth | Email/password wired directly into Postgres' `auth.users`, so every RLS policy can reference `auth.uid()` |
| Storage | Supabase Storage | One bucket for every uploaded image, with server-side size/MIME enforcement |
| i18n | Custom PT/EN context (`lib/i18n`) | Full control over per-string translation and instant switching, without an external i18n framework's runtime overhead |
| Deploy | Netlify | Native Next.js support, generous free tier |
| Weather | OpenWeatherMap API | Free tier, simple REST call, real coordinates instead of a fixed city |
| Geocoding | Nominatim (OpenStreetMap) | Free, no API key, used for reverse-geocoding a colony's city name |

---

## Architecture

```
              Browser / Mobile Web
                      ↓
     Next.js 16 (Netlify)
     App Router · TypeScript · Tailwind CSS
                      ↓
     Supabase (PostgreSQL)
     Auth · Storage · RLS · RPCs
                      ↓
     External APIs
     OpenWeatherMap · Nominatim (OSM)

     Map Layer
     Leaflet.js · OpenStreetMap tiles
```

There is no custom backend server — every write and read goes through Supabase's auto-generated REST API and RPC endpoints, gated entirely by RLS policies and security-definer functions. The Next.js layer never holds a service-role key or bypasses RLS; it uses the same public anon key a browser would.

**Key architectural decisions:**

- **Supabase over Firebase** — RLS means sensitive access rules live as SQL, reviewable and testable independently of application code, instead of being scattered across client-side checks. Postgres also gives us real relational constraints (foreign keys, `CHECK` length limits, partial unique indexes) that a document store doesn't.
- **Leaflet over Mapbox/Google Maps** — no API key, no usage-based billing risk during a hackathon demo, and full control over the pin styling and blur-circle overlay that the location-blur feature depends on.
- **Custom i18n over a framework** — the app's translation surface is fully known and finite (every string lives in two files), so a lightweight context avoids the bundle size and abstraction overhead of a general-purpose i18n library.
- **Progressive blur as a database-enforced grant, not a client filter** — detailed below; the short version is that a client-side "don't show this" is trivially bypassed by a direct API call, so the actual protection has to live at the grant level.

**Database migrations:** 76 numbered SQL files in `supabase/migrations/`, applied in order — 75 schema/RLS/RPC changes plus one pre-submission test-data cleanup script, each a single, reviewed, incremental change.

---

## Security

Security here means two distinct things: protecting user data (standard practice), and protecting the cats themselves from anyone using the platform's own data against them — colonies have been targeted after their locations were shared carelessly online, which is why this is treated as animal safety, not just data privacy. Every control below was a deliberate design decision, then verified — and in some cases corrected — during a dedicated security review before submission. Full technical detail lives in [`AUDIT_REPORT.md`](docs/AUDIT_REPORT.md); our vulnerability-disclosure process is in [`SECURITY.md`](SECURITY.md).

### Progressive Location Blur

| Level | Who | What they get | Enforced by |
|---|---|---|---|
| 1 | Anonymous visitor | ~500m blur radius, shown as a visible uncertainty circle | `latitude_blurred`/`longitude_blurred` — the only columns `anon` has a grant on |
| 2 | Signed in, not a caretaker | ~100m blur radius | `latitude_blurred_near`/`longitude_blurred_near` — the only *additional* columns `authenticated` has a grant on |
| 3 | Linked caretaker or the colony's creator | Exact coordinates | `get_colony_exact_location(p_colony_id)` — re-checks the caretaker/creator link against the database on **every call** |

The property that makes this enforceable, not just a UI convention:

```sql
revoke select (latitude, longitude) on colonies from anon, authenticated;
```

Even a signed-in caretaker's own browser cannot fetch those two columns directly — the *only* path to the real value is the RPC above, which never trusts a cached session flag or a client-side boolean. The identical column-vs-function pattern is reused for `reports.latitude`/`longitude`, since a report's exact location could otherwise leak a colony's near-exact position through its own open reports.

### Aikido Security Findings

**Path Traversal (HIGH) ✅ Fixed**
File uploads across 6 upload sites (colony photos, cat photos, avatars, timeline photos, story photos, the new-colony form) were building storage paths from user-influenced input without sanitization. Fixed by centralizing path construction in `lib/storage.ts` — `buildSafeStoragePath()` strips `..` sequences and unsafe characters and generates the filename from a UUID plus a validated extension, never the original filename, with `assertSafeStoragePath()` called again immediately before every `.upload()` call site as defense-in-depth.
Commit: `security: fix path traversal vulnerability in file uploads — Aikido report`

**SSRF in Geocoding (LOW) ✅ Fixed**
The reverse-geocoding call to Nominatim was interpolating latitude/longitude directly into a URL string with no validation. Fixed with `lib/validateCoordinates.ts` (rejects out-of-range or non-finite coordinates before any request is built), `URLSearchParams` instead of string interpolation, and `redirect: "error"` so a malicious redirect can't be followed silently.
**Bonus fix:** while patching this, we found the same unvalidated pattern in the weather-fetch helper — outside Aikido's original report — and fixed it identically, plus a pre-existing bug where the geocoding response's language was always Portuguese regardless of the visitor's actual language preference.
Commit: `security: fix SSRF vulnerability in geocoding requests — Aikido report`

### Additional Security

- **RLS on all 25 application tables**, tested live against the real public anon key, not just reviewed in code.
- **Every critical RPC rejects the anon key** — a live-tested gap (`record_daily_visit` was still callable anonymously despite its migration saying otherwise; the deployed database had drifted from the migration history) was found and fixed with a follow-up migration re-asserting the correct grant, then re-verified.
- **Security headers** (`next.config.ts`): `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, a `Permissions-Policy` blocking camera/microphone, and a `Content-Security-Policy` scoped to only the app's real external origins.
- **Rate limiting**: 10/hour (anonymous) and 30/hour (authenticated) on report submissions.
- **Input validation on both client and server** — client-side checks are a UX nicety; every boundary is re-enforced by a database `CHECK` constraint or an RLS policy, since a direct REST call with the public anon key bypasses the client entirely.
- **Field size limits on every free-text database column** (`colonies.narrative`, `cats.name`, `reports.description`, `caretakers.letter`, and others) — found missing during the internal review and fixed with `char_length` constraints, closing a storage-cost and rendering-DoS surface.
- Full itemized findings, reasoning, and fix history: [`AUDIT_REPORT.md`](docs/AUDIT_REPORT.md).

---

## Testing

### Methodology

Three approaches, since no single one would have caught everything below: **code review** (a structured pass across the full codebase), **API testing** (raw HTTP requests directly against the live Supabase REST/RPC endpoints using the real public anon key — the same vantage point an attacker with no account has), and **manual flow testing** (walking every major journey in both anonymous and signed-in states). The API-testing pass is what caught the RLS/RPC gaps below; reading the code alone had missed them because the *intent* documented in comments didn't match the *deployed* database state.

### What was tested

Every major flow: home → map → colony detail → filing a report → the emergency help flow → reading an article → the personalization quiz → registering a colony → linking as a caretaker → confirming and resolving a report → the public caretaker profile — each walked through as both an anonymous visitor and a signed-in user.

**30+ edge cases**, including:
- Colony health index and castration badge calculated correctly with zero registered cats (no division-by-zero)
- Double-clicking a feeding/water check-in produces exactly one event, not two
- The 11th anonymous report submission within an hour is blocked by the rate limiter
- The same user confirming the same report twice is blocked
- A user attempting to thank their own timeline action is blocked
- A duplicate false-pin flag against the same colony is blocked by a database constraint
- A wrong-MIME-type or over-5MB file is rejected before the upload request is sent
- `/colony/[id]` with a nonexistent id renders a proper 404
- A signed-out visitor on an account-gated action sees an explanation and a signup link, never a silent redirect

**12 security tests via API**, all verified against the live anon key:
1. Read a colony's exact coordinates via direct REST query → rejected
2. Read a report's exact coordinates via direct REST query → rejected
3. Call `get_colony_exact_location` for a colony you're not linked to → rejected
4. Call `confirm_report` on your own report → rejected (self-confirm guard)
5. Upload with `../` in the storage path → sanitized before reaching storage
6. Reverse-geocode with out-of-range coordinates → rejected before any request is built
7. Call `record_daily_visit` with the anon key → initially succeeded (drift found), fixed, re-verified as rejected
8. Read `profiles.current_streak` for another user → rejected (column-level grant)
9. Call `notify_caretakers` with arbitrary free text → rejected (parameter removed; message now server-templated)
10. Call `thank_action` on your own action → rejected (self-thank guard)
11. Insert a `colonies.narrative` beyond the length limit → rejected by a `CHECK` constraint
12. Read `knowledge_progress` for another user → empty result, RLS scoped to own rows only

### Accessibility (WCAG 2.2)

- Color-contrast failures found and fixed (a success-state text color measured 3.3:1 against a 4.5:1 minimum)
- 15 modals had no focus trap — keyboard users could tab out of an open dialog into the page behind it; fixed with one shared hook reused everywhere
- 2 forms relied on placeholder text as their only label, which disappears the moment a screen reader user starts typing — fixed with real, associated `<label>` elements
- Every animation respects `prefers-reduced-motion`, with a static fallback for the cat assistant
- Touch targets verified at a minimum of 44×44px across every interactive element, including a navbar overflow bug and several sub-44px buttons found during a dedicated mobile pass

### Numbers

**40+ bugs found and fixed** across **9 dedicated audit sessions** (functional, security, accessibility, UI consistency, content, performance, and mobile responsiveness) over the course of the project. The UI-consistency, motion, and mobile-specific findings are itemized separately in [`docs/UI_AUDIT_REPORT.md`](docs/UI_AUDIT_REPORT.md).

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A free [Supabase](https://supabase.com) project
- A free [OpenWeatherMap](https://openweathermap.org/api) API key

### Installation

```bash
git clone https://github.com/luarawork/felines
cd felines
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_WEATHER_API_KEY=your_openweathermap_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Where to find each value:

- **`NEXT_PUBLIC_SUPABASE_URL`** and **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** — Supabase dashboard → your project → Project Settings → API. The anon key is safe to expose client-side by design; every sensitive rule is enforced by RLS and the security-definer functions described above.
- **`NEXT_PUBLIC_WEATHER_API_KEY`** — OpenWeatherMap → "My API keys" (free account, free tier is sufficient).
- **`NEXT_PUBLIC_SITE_URL`** — defaults to `http://localhost:3000` for local development.

### Database Setup

`supabase/migrations/` contains 76 numbered SQL files — run them **in order** in the Supabase SQL Editor (Dashboard → SQL Editor → paste each file's contents → Run), since most assume everything before them has already been applied. `0001_init.sql` creates the core schema and RLS policies; the rest are incremental features, RPCs, and security fixes. (The final file, `0076`, is a one-time test-data cleanup script — safe to skip on a fresh database.)

### Run

```bash
npm run dev        # development
npm run build       # production build
npm run start       # production server
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
felines/
├── app/                       # Next.js App Router — 21 page routes
│   ├── page.tsx               # Home — hero, impact stats, entry points, the guide
│   ├── map/                   # Interactive colony map
│   ├── colony/[id]/           # Colony detail (tabs: cats, timeline, needs, reports, letter, edit)
│   ├── colony/new/            # Register a colony
│   ├── learn/[slug]/          # Individual educational article
│   ├── glossary/, plants/, curso/  # Glossary, toxic plants, caretaker course
│   ├── reports/               # Reports / resources / contacts / stories hub
│   ├── impact/                # Public platform-wide impact statistics
│   ├── profile/, u/[id]/      # Signed-in profile, public caretaker profile
│   └── login/, signup/        # Auth
├── components/                 # ~90 single-concern React components
├── hooks/useFelinesAssistant.ts  # Cat assistant trigger logic
├── lib/
│   ├── articles.ts, glossary.ts, catCuriosities.ts   # Content sources
│   ├── storage.ts, geocode.ts, validateCoordinates.ts  # Security-hardened utilities
│   ├── rateLimit.ts            # In-memory rate limiter for report submissions
│   └── i18n/pt.ts, en.ts       # Full Portuguese and English translations
├── supabase/migrations/         # 76 numbered SQL migrations (schema, RLS, RPCs)
├── docs/AUDIT_REPORT.md         # Full itemized security/bug/refactor audit
├── docs/UI_AUDIT_REPORT.md      # UI consistency, motion, and mobile audit
├── docs/LICENSE_COMPLIANCE.md   # Third-party dependency license findings
├── SECURITY.md                  # Vulnerability disclosure policy
└── CONTRIBUTING.md               # Local setup and contribution guidelines
```

---

## How AI Was Used

This section is deliberately specific, because it matters to us that it's read correctly: **Felines is not an AI-generated product. AI was a tool.** Every decision, every idea, and every ethical judgment call in this project was made by a human.

Built solo by **Luara Oliveira** (UX Designer / Business Analyst), using **Claude Code** for implementation.

The central insight behind the entire product — that the platform should talk to people who aren't cat people yet — came from the founder not knowing what a cat colony was before starting this project. She used that gap in her own knowledge as the primary persona for every design decision, which is not something a tool can originate; it required living the confusion first.

**Every product decision was human**: what to build, what to cut, which of the six judges' perspectives to weigh in a given tradeoff, and the strategic read on the hackathon's "world domination" theme.

**Every security decision was human in intent**: framing progressive location blur as animal protection first and data protection second was a founder decision; Claude Code implemented the RLS policies, grants, and RPCs that enforce it.

**Every database migration was designed by the founder** — all 76 Supabase migrations (schema, RLS policies, RPCs, and security fixes) were her own database design decisions, with Claude Code writing the SQL syntax under her direction.

**Claude Code's role was implementation and audit execution**: writing the Next.js/TypeScript code, running the security/accessibility/functional/performance audits, identifying specific bugs, and drafting initial article and translation copy.

**Every piece of content was human-reviewed before publishing**: articles, translations, cat facts, and the 14 real local contacts were curated and verified by the founder, not auto-published from a model's first draft. All statistics cited throughout this README and the app come from real, named, verifiable sources (WHO, IBGE, Instituto Pet Brasil, the Brazilian Ministry of the Environment) — not generated figures.

Every audit finding, every direction change, and every code review across the project's many working sessions was directed and approved by the founder — Claude Code never shipped a change unreviewed.

| What was human | What was a tool |
|---|---|
| The core insight and target audience | Writing TypeScript/React code |
| Every product and scope decision | Writing SQL syntax under her direction |
| Designing all 76 database migrations | — |
| Security intent (animal safety framing) | Implementing RLS policies and RPCs |
| Curating 14 real local contacts | Initial article/translation drafts |
| Reviewing and approving all content | Running audits and flagging bugs |
| Every direction change across sessions | Executing the fixes once approved |

---

## Impact Data

The numbers behind why this platform exists:

- **10 million** stray cats in Brazil (World Health Organization / WSPA).
- **480 million** stray cats worldwide (World Animal Foundation).
- **~40%** of Brazilians report having had a conflict with a neighbor involving animals (IBGE).
- **71%** of people who abuse animals also commit crimes against humans (Brazilian Ministry of the Environment, citing "The Link" research) — animal welfare and community safety are not separate issues.
- **~185,000** animals already living in NGOs/shelters operating at capacity (Instituto Pet Brasil, 2023).
- Animal abandonment in Brazil grew from an estimated **3.9 million** (2018) to **8.8 million** (2020).

---

## Roadmap

- A neutering calendar with direct NGO/CCZ scheduling integration
- A QR code per colony, bridging the physical pin (a sign at the site) to its digital page
- A PWA build for offline-capable use in the field
- A public data API for researchers and city governments

Full roadmap, including smaller planned improvements, lives in the project [Wiki](https://github.com/luarawork/felines/wiki).

---

## Contributing

Contributions are welcome — from a typo fix to a new feature. Start with [`CONTRIBUTING.md`](CONTRIBUTING.md) for local setup, code standards, and how a proposed change should relate to the project's actual values. Please also read the [Code of Conduct](CODE_OF_CONDUCT.md) before opening a pull request.

---

## License

MIT — see [`LICENSE`](LICENSE). Third-party dependency license findings (reviewed, not blocking) are documented in [`docs/LICENSE_COMPLIANCE.md`](docs/LICENSE_COMPLIANCE.md).

---

## Acknowledgments

- The #hackthekitty — The World Cat Domination Day Hackathon organizers, for the prompt that started this.
- Alley Cat Allies, for publicly available TNR research and methodology.
- The World Health Organization and IBGE, for the population and conflict data cited throughout.
- Instituto Pet Brasil, for Brazilian shelter-capacity statistics.
- The real, often invisible caretakers of Natal, RN, who keep colonies fed, castrated, and looked after with no platform, budget, or recognition — this project exists to make that work a little more visible.
- My cat-loving friends and the many people who patiently answered my questions and taught me so much about cats throughout this project.
