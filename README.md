# Felines 🐾

> An educational platform for people who aren't "cat people" — at least, not yet.

Felines maps stray cat colonies and helps everyday people — not just existing cat lovers — understand what's happening with the cats near them, and what to do about it. It's a bilingual (Portuguese/English) web app centered on Natal, RN, Brazil: an interactive map of real colonies, a step-by-step emergency help flow that needs no account, a 19-article educational guide, a community reporting system, and a full caretaker toolkit for the people who already feed and manage these colonies every day.

**Built for [Hack the Kitty 2026](https://hackthekitty.com)**
**Repository:** https://github.com/luarawork/felines
**Live demo:** not yet deployed — see [Live Demo](#live-demo) below for why, and [Getting Started](#getting-started) to run it locally in a few minutes.

---

## Table of Contents

- [The Problem](#the-problem)
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
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## The Problem

There are an estimated 480 million stray cats worldwide, and more than 10 million in Brazil alone. Shelters and NGOs are already past capacity — roughly 185,000 animals are living in institutions with no room to take in another one — and removal-based "solutions" don't work either: decades of attempts across different cities show an emptied territory gets reoccupied within months, usually by a less stable, not-yet-castrated group. The World Health Organization's own guidance is TNR (Trap-Neuter-Return), not removal, for exactly this reason.

Every cat-welfare platform we looked at talks to people who already care: established caretakers, donors, adopters. That leaves out the much larger group that matters just as much — the neighbor annoyed by the smell on their street, the passerby who found a kitten and panicked, the person who saw something concerning and didn't know if it was worth reporting. Nearly 40% of Brazilians report having had a conflict with a neighbor involving animals, and a lot of that friction comes down to not knowing why the cats are there, who (if anyone) is already caring for them, or that castration — not removal — is what actually works. Caretakers, meanwhile, often work alone and invisibly, with no way for a worried neighbor to even find out they exist.

Felines is built for that gap. It doesn't require buying into a "cat person" identity to be useful — it asks a much smaller question: what's happening near you, right now, and what's the smallest useful thing you can do about it?

---

## Live Demo

**This project is not deployed to a public URL as of this submission**, and there is no seeded demo account. Both are listed in the [Roadmap](#roadmap) as the immediate next steps after the hackathon. This section explains what a judge would see either way, so the README stands on its own without requiring a running instance.

The app runs locally in a few minutes with a free Supabase project and a free OpenWeatherMap key — see [Getting Started](#getting-started) for the exact steps.

### What's reachable without any account

- Browse the interactive colony map, with pins shown at a privacy-protecting blurred location (see [Progressive Location Blur](#progressive-location-blur))
- Open any colony's public page — cover photo, narrative, cats, timeline, needs
- Read the full 19-article educational guide, the 36-term glossary, and the toxic-plants reference
- Open "Preciso de ajuda" (Need help) — a 2-step emergency assistant covering 9 situation types, no login wall
- Submit most report types (sightings, injured/sick cats, suspected poisoning, abuse, disease outbreaks) — an account requirement would defeat the point during an actual emergency
- View any caretaker's public profile, the community stories wall, the resource-exchange board, and the local contacts directory (14 real, verified contacts for Natal, RN)
- View the public `/impact` page with live platform-wide statistics
- Take the neighborhood diagnosis quiz to figure out what's likely going on with cats near you
- Switch the entire UI between Portuguese and English at any time

### What requires an account

- Register a new colony on the map, or link yourself as a caretaker of an existing one
- Log feedings/water check-ins, add named cats, write a caretaker's letter, set up recurring care reminders
- See a colony's exact location instead of the blurred approximation ([why](#progressive-location-blur))
- Confirm or manually resolve community reports; report a lost cat
- Post to the community stories wall or the resource-exchange board
- Track reading progress through the educational guide and take the "what kind of neighbor are you" personalization quiz
- View your full contribution history and receive notifications (extreme weather for your colonies, a cat unseen for 7+ days, someone thanking one of your actions)

---

## Features

### 🗺️ Interactive Colony Map

Built on Leaflet.js (`react-leaflet`) over OpenStreetMap tiles, `/map` renders three kinds of pins — colonies (terracotta), sightings (gray), and emergencies (red, pulsing) — with clustering at low zoom levels so dense areas stay readable. Visitors can search colonies by name and filter by pin type and castration status. A persistent activity panel lists everything currently visible, updating live as the map is panned or zoomed. A weather banner reflects real conditions at the map's current center (not a fixed city), refetching as the map moves. Anonymous visitors who suspect a pin is fake or nonexistent can flag it — a colony accumulating enough false-pin flags is visually marked as disputed.

### 🔒 Progressive Location Blur

The platform's most important security *and* UX decision — protecting the cats themselves, not just data:

- **Level 1 (anonymous):** ~500m blur offset, shown as a visible uncertainty circle — enough to see "there's a colony in this neighborhood," never enough to find a specific address.
- **Level 2 (signed in, not yet a caretaker):** ~100m blur offset — an account is a small trust signal, but not enough to hand out a precise address before someone's shown any actual commitment.
- **Level 3 (linked caretaker or the colony's creator):** exact coordinates, returned only by a server-side function that re-checks the caretaker relationship against the database on every single call — never from a cached client flag.

Exact coordinates are never reachable through a direct table query, for any role — see [Security](#security) for the mechanism. The reasoning: exact coordinates in the wrong hands could be used to find and harm the cats living there.

### 🏘️ Colony Pages

Each colony has a cover photo (with photo history preserved in the timeline instead of just being overwritten), a narrative description, and a castration-status badge that's automatically calculated from the actual registered cats, not a manually-set flag. Any number of caretakers can link to the same colony, each shown with their avatar and a link to their public profile. The page organizes into tabs:

- **Cats** — named cats with photos and a castration toggle; a cat unseen for 7+ days gets a visible nudge and triggers a caretaker notification.
- **Timeline** — a chronological log of everything that's happened: feedings, water check-ins, new cats, castration rounds, edits to the colony's info, cover-photo changes, and automatic climate-event entries from the weather integration. Every entry can be hearted (❤️) to thank whoever did it.
- **Needs** — castration progress, active help/neutering requests, and recurring care reminders (feeding, water, health checks, or a custom task) with a repeat interval and an overdue/due-today/due-in-N-days badge.
- **Reports** — reports filed specifically against this colony.
- **Letter** — a message caretakers leave for whoever comes next, with full version history.
- **Edit** — an edit-history log of changes made to the colony's core info.

A colony becomes community-verified once it accumulates 3 independent confirmations. A "Sinalizar" (flag) action lets anyone report a colony page as fake or harmful.

### 📚 Educational Guide

19 short articles across 5 progressive thematic levels (from "what even is a colony" to "what nobody tells you before becoming a caretaker"), each with a reading progress bar, at least two sourced fact chips, and links to related articles at the end. Reading progress is saved per signed-in user and shown on `/profile`. After reading at least 3 articles, a 3-question personalization quiz unlocks (distinct from the neighborhood diagnosis quiz below), sorting the reader into one of three "neighbor profiles" — Observer, Backup, or Guardian — with a suggested first action. There are no wrong answers; it's about framing a next step, not scoring. The guide is complemented by a 36-term bilingual glossary, a toxic-plants reference for cat owners, and a short caretaker course at `/curso`.

### 🚨 Emergency Help Flow

"Preciso de ajuda," available from the navbar on every page, opens a global modal (not a separate route) with a 2-step assistant: pick what's happening from 9 situations — a cat you've spotted, an injured/sick cat, a lone kitten, a building conflict, suspected poisoning or abuse, a disease outbreak, a missing cat, a threat to a whole colony, or something else — then mark the location on a map. Each situation shows tailored, plain-language guidance and, where relevant, a specific alert pointing to real local resources: the Disque Denúncia hotline (181), Lei 9.605/98 (Brazil's animal-abuse law), CIOSP emergency (190), or the municipal zoonosis control center (CCZ). Most situations let you submit a report directly from the flow without an account; a missing cat requires one, since the whole point is letting a finder reach the owner.

### 📋 Community Reports

`/reports` lists open community reports across 9 categories (no food/water, injured/sick, new kitten, missing cat, suspected poisoning, suspected abuse, disease outbreak, threat to colony, sighting). Anyone can submit most types without an account — an emergency shouldn't wait on a signup — but viewing the list and confirming/resolving requires signing in. A report auto-resolves once 3 different community members confirm it, via an atomic database function that also blocks a report's own creator from confirming it and prevents the same person confirming twice. Reports about suspected poisoning, abuse, or disease outbreaks are automatically flagged as "sensitive" by a database trigger and always leave a permanent timeline entry when resolved — they're never silently deleted, since that history matters to whoever considers caretaking that colony later. Submissions are rate-limited (10/hour for anonymous callers, 30/hour for authenticated ones) to curb abuse of the no-account path.

### 🤝 Community Features

`/reports` is actually a 4-tab hub — **Relatos** (reports, above), **Troca de recursos** (a resource-exchange board where anyone can offer or request supplies, transport, medication, or volunteer time), **Contatos** (a curated directory of 14 real, verified contacts in Natal, RN — veterinary hospitals, NGOs, the environmental police, and official reporting hotlines), and **Histórias** (a public wall where linked caretakers share moments from their colonies, with reactions from any signed-in visitor). `/contacts` and `/stories` also work as standalone deep links to the same content.

### 🌡️ Weather Integration

A weather banner (OpenWeatherMap) shows current conditions and a care alert for extreme heat or heavy rain, since both directly affect food/water availability and shelter needs for street cats. It always uses real coordinates — a colony's own location on its detail page, or the map's current visible center on `/map` — never a single hardcoded city, and extreme readings are logged as automatic climate events in the relevant colony's timeline.

### 👤 User Profiles & Caretaker System

`/profile` shows a signed-in user's colonies, a knowledge-guide progress bar, a personal care streak, an earned badge set, and a unified contribution timeline merging colonies registered, caretaking links, feedings logged, reports filed, confirmations given, and thanks sent or received. Anyone — signed in or not — can view a caretaker's public profile at `/u/[id]`. Registering a colony automatically links its creator as a caretaker; linking or stepping down updates access to management controls immediately, without a reload.

### 🔔 Notifications & Care Reminders

A bell icon with an unread badge leads to `/notifications`. Alerts fire for extreme weather affecting a caretaker's colonies, a cat unseen for 7+ days, and someone hearting one of your timeline actions — each deduplicated so the same alert doesn't repeat. Caretakers can also set up recurring care reminders per colony (feeding, water, health checks, or a custom task) with their own overdue/due-today tracking.

### 🌍 Bilingual Support (PT/EN)

The entire interface — navigation, all 19 articles, the 36-term glossary, every form, every modal — exists in full Portuguese and English, switchable at any time from the navbar, with the preference remembered and the page's `lang` attribute updated to match. This isn't a machine translation layer bolted on top; every piece of content has a human-reviewed English counterpart.

### 🐱 Cat Assistant

A small floating cat character with a looping video appears contextually at key moments in the visitor's journey — first-ever visit, being idle on the home page or on `/reports`, finishing an article, registering a first colony, viewing an empty map area, or completing the neighborhood quiz — and shares one of 8 real cat facts (not platform data) in a speech bubble. It respects a 15-minute cooldown between appearances, never interrupts an open modal or active typing, and honors `prefers-reduced-motion` with a static, non-animated fallback.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js 16 (App Router, Turbopack) + TypeScript + React 19 | Server components keep data-fetching close to the database for public pages; client components handle the genuinely interactive parts (map, forms, modals) |
| Styling | Tailwind CSS v4 (CSS-based `@theme`, no JS config file) | Fast iteration on a custom editorial design system without leaving the markup |
| Map | Leaflet.js + `react-leaflet` + `react-leaflet-cluster` | Open source, no API key or usage quota, full control over custom pin styling, the blur-circle overlay, and marker clustering |
| Database | Supabase (PostgreSQL) | Row Level Security lets sensitive rules — location blur, report visibility, who can edit what — live in the database itself, not just application code |
| Auth | Supabase Auth | Email/password wired directly into Postgres' `auth.users`, so every RLS policy can reference `auth.uid()` |
| Storage | Supabase Storage | One bucket for every uploaded image — colony covers, cat photos, avatars, timeline and report photos — with server-side size/MIME enforcement |
| Weather | OpenWeatherMap API | Free tier, simple REST call, good enough granularity for a "should I worry about my cats today" banner |
| Geocoding | Nominatim (OpenStreetMap) | Free, no API key, used for reverse-geocoding a colony's city name |

---

## Architecture

```
Browser
  │
  ├─→ Next.js 16 App Router (server components fetch public data directly;
  │    client components handle the map, forms, and modals)
  │
  ├─→ Supabase
  │     ├─ PostgreSQL — 25 tables, Row Level Security enabled on all of them
  │     ├─ 24 server-side (SECURITY DEFINER) functions for anything a row
  │     │   policy alone can't express safely — see Security below
  │     ├─ Auth — email/password, backs every RLS policy via auth.uid()
  │     └─ Storage — one bucket, server-enforced size/MIME limits
  │
  ├─→ Leaflet.js + OpenStreetMap tiles (map rendering)
  ├─→ OpenWeatherMap API (weather banner)
  └─→ Nominatim / OpenStreetMap (reverse geocoding)
```

There is no custom backend server — every write and read goes through Supabase's auto-generated REST API and RPC endpoints, gated entirely by RLS policies and the security-definer functions described below. The Next.js layer never holds a service-role key or bypasses RLS; it uses the same public anon key a browser would.

**Database migrations:** 75 numbered SQL files in `supabase/migrations/`, applied in order, spanning the initial schema through the most recent security-grant fix. Each migration is a single, reviewed, incremental change — nothing here was ever run outside of that sequence.

---

## Security

Security here means two distinct things: protecting user data (standard practice), and protecting the cats themselves from anyone using the platform's own data against them. Every control below was a deliberate design decision made when the relevant feature was built, then verified — and in some cases corrected — during a dedicated security review before submission. Full technical detail lives in [`AUDIT_REPORT.md`](AUDIT_REPORT.md); this section is the summary a judge doesn't need to run code to evaluate.

### Progressive Location Blur — the mechanism

The property that makes the three-tier system in [Features](#progressive-location-blur) actually enforceable, not just a UI convention: the database revokes `SELECT` on the exact `latitude`/`longitude` columns from **every** role except the function that's allowed to read them —

```sql
revoke select (latitude, longitude) on colonies from anon, authenticated;
```

That means even a signed-in caretaker's own browser cannot fetch those two columns directly; the *only* path to the real value is `get_colony_exact_location(p_colony_id)`, a `SECURITY DEFINER` function that re-checks the caretaker/creator relationship against the database on every call — never a cached session flag or a client-side boolean the browser could tamper with. The identical column-vs-function pattern is reused for `reports.latitude`/`longitude`, since a report's exact location could otherwise leak a colony's near-exact position through its own open reports.

### Row Level Security, by table

All 25 application tables have RLS enabled; the design default for a new table is "start from zero access, grant back exactly what's needed." A few representative examples:

| Table | Public can | Requires auth | Why |
|---|---|---|---|
| `colonies` | Read name/narrative/blurred coordinates/castration status | Insert, update (creator/caretaker only) | The map is meant to be publicly browsable — that's the product. Writes need an identity to attribute the change to. |
| `reports` | Insert (no account needed) | Read full rows, update/resolve | An active emergency can't wait for a signup — but browsing and resolving is gated so it isn't a fully open surface. |
| `caretakers` | Read | Insert own link, delete own link only | "Who cares for this colony" builds public trust, so it's readable by anyone; only the caretaker themselves can step down. |
| `profiles` | Read `id`/`display_name`/`avatar_url`/`created_at` | Own care-streak fields, only via a dedicated RPC | Display name/avatar are the public identity; streak numbers are a private motivational signal, never a leaderboard — this was a real gap found and fixed, see below. |

### Why RPCs use `SECURITY DEFINER`

A Postgres function needs `SECURITY DEFINER` only when it has to do something the calling role's own grants wouldn't allow on their own. In this codebase that's always one of two shapes: (1) writing a row that belongs to someone else — notifying a caretaker, thanking someone's action — where the caller's own RLS grant on that table doesn't (and shouldn't) permit it directly; or (2) authorization logic a row policy can't express, like `get_colony_exact_location` needing to check "is this specific caller a caretaker of this specific colony" and return different data based on the answer, or `confirm_report` needing an atomic counter increment plus a self-confirm guard plus an auto-resolve check as one transaction. The pattern to watch for — and the one that produced every real finding below — is a `SECURITY DEFINER` function accepting unvalidated caller input that ends up somewhere another user will see it.

### Vulnerabilities found and fixed

Two issues were reported by [Aikido Security](https://www.aikido.dev/)'s automated scanning during development and fixed the same day:

**Path Traversal (HIGH severity).** File uploads across 6 different upload sites (colony photos, cat photos, avatars, timeline photos, story photos, and the new-colony form) were building storage paths from user-influenced input without sanitization. Fixed by centralizing path construction in `lib/storage.ts` — `buildSafeStoragePath()` strips `..` sequences and non-safe characters and generates the filename from a UUID plus a validated extension, never the original filename, and `assertSafeStoragePath()` is called again immediately before every single `.upload()` call site as defense-in-depth. Commit: `security: fix path traversal vulnerability in file uploads — Aikido report`.

**SSRF in Geocoding (LOW severity).** The reverse-geocoding call to Nominatim was interpolating latitude/longitude directly into a URL string with no validation. Fixed with `lib/validateCoordinates.ts` (rejects out-of-range or non-finite coordinates before any request is built), `URLSearchParams` instead of string interpolation, and `redirect: "error"` on the fetch so a malicious redirect can't be followed silently. While fixing this, the identical unvalidated pattern was also found in the weather-fetch helper — outside Aikido's original report — and fixed the same way. Commit: `security: fix SSRF vulnerability in geocoding requests — Aikido report`.

A third, unrelated finding — CVE-2026-41305, a PostCSS AST-stringification issue nested inside `next`'s own transitive dependencies — was resolved via an `npm` `overrides` entry forcing a single patched version across the dependency tree, verified with a clean `npm audit`.

### Additional gaps found during the pre-submission security review

A dedicated review — live-testing every RLS policy and RPC with the real public anon key, not just reading the code — found and fixed several gaps beyond the Aikido reports:

- **`profiles.current_streak`/`longest_streak`/`last_action_date` were publicly readable by anyone**, despite an existing code comment stating streaks are "never exposed on a public profile." A row policy allowing `select` on `profiles` doesn't restrict *which columns* are readable — column-level grants do. Fixed by revoking table-wide `SELECT` and granting back only the genuinely public columns, with streak data now readable exclusively through a `get_own_streak()` RPC scoped to `auth.uid() = id`.
- **`notify_caretakers`/`notify_nearby_caretakers` accepted arbitrary free text from the caller** and inserted it verbatim into another user's notifications — reachable directly via the public REST RPC endpoint with the anon key, bypassing the app's UI entirely. Fixed by removing the free-text parameter; the function now selects from a small set of fixed, server-built message templates.
- **`thank_action()` had no self-thank guard**, unlike the equivalent, already-guarded `confirm_report()`. Fixed to no-op if the caller authored the action being thanked.
- **A live-tested RPC (`record_daily_visit`) was still callable by the anonymous key** even though its migration file said otherwise — the deployed database had drifted from the migration history. Found via direct `curl` testing against the real Supabase REST endpoint with the anon key, fixed with a follow-up migration re-asserting the correct grant, and re-verified live afterward.
- Several tables (`colonies.narrative`, `cats.name`, `reports.description`, `caretakers.letter`) had **no database-level length limit at all** — a client-side `maxLength` is a UX nicety, not a boundary, since a direct REST call with the public anon key can send arbitrary-length text. Fixed with `CHECK (char_length(...) <= n)` constraints matching the pattern already used elsewhere.

### Other measures

- **Rate limiting:** 10 requests/hour (anonymous) and 30/hour (authenticated) on report submissions, keyed by IP or user id — the one write path reachable with no account at all.
- **Security headers** (`next.config.ts`): `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, a `Permissions-Policy` blocking camera/microphone and restricting geolocation to same-origin, and a `Content-Security-Policy` scoped to only the app's real external origins (Supabase, OpenStreetMap tiles, OpenWeatherMap, Nominatim).
- **Report integrity:** a unique constraint on `(report_id, user_id)` stops the same account inflating a report's confirmation count; a report's own creator is blocked from confirming it, both in the UI and inside the database function itself.
- **File validation:** type and size (5MB max) checked client-side before upload, and enforced again at the Supabase Storage bucket level so a direct API call can't bypass the client check.
- No `dangerouslySetInnerHTML` anywhere in the codebase; no `select("*")` queries anywhere; no service-role key ever present in application code.

---

## Testing

### Methodology

Testing combined three approaches, since none alone would have caught everything below: reading the code, exercising the actual user flows manually in both anonymous and signed-in states, and — critically — issuing raw HTTP requests directly against the live Supabase REST and RPC endpoints with the real public anon key, exactly as an attacker with no account would. That last approach is what caught the RLS/RPC gaps listed under [Security](#security) above; code review alone had missed them because the *intent* documented in comments didn't match the *deployed* database state.

### Key flows tested

Every major user journey was walked through in both anonymous and authenticated states: home → map → colony detail → filing a report → the emergency help flow → reading an article → the personalization quiz → registering a colony → linking as a caretaker → confirming and resolving a report → the public caretaker profile.

### Security tests (verified live against the anon key)

| Test | Result |
|---|---|
| Read a colony's exact `latitude`/`longitude` via direct REST query | Correctly rejected (permission denied) |
| Read a report's exact coordinates via direct REST query | Correctly rejected |
| Call `get_colony_exact_location` for a colony you're not linked to | Correctly rejected |
| Call `confirm_report` on your own report | Correctly rejected (self-confirm guard) |
| Upload with `../` in the storage path | Sanitized before the request reaches storage |
| Reverse-geocode request with out-of-range coordinates | Rejected before any external request is built |
| Call `record_daily_visit` with the anon key | Initially succeeded (drift found, migration fixed, re-verified as rejected) |

### Edge cases covered

- Colony health index and castration badge calculated correctly with **zero registered cats** (no division-by-zero)
- Double-clicking a feeding/water check-in button produces exactly one event, not two (debounce guard)
- The 11th anonymous report submission within an hour is blocked by the rate limiter
- The same signed-in user confirming the same report twice is blocked
- A user attempting to thank their own timeline action is blocked
- Submitting a duplicate false-pin flag against the same colony is blocked by a database constraint
- A file of the wrong MIME type or over the 5MB limit is rejected before the upload request is even sent
- Visiting `/colony/[id]` with a nonexistent id renders a proper 404, not a blank or broken page
- A signed-out visitor opening any account-gated action sees an explanation and a link to sign up, never a silent redirect

### Bugs found and fixed

Across a series of dedicated audit passes (functional, accessibility, security, UI consistency, content, and performance), more than 40 bugs were found and fixed. The most significant:

- **A critical anonymous-visitor bug**: `/reports` unconditionally redirected any signed-out visitor to `/login`, regardless of which of its 4 tabs they were trying to view — caused by the tab component keeping all tab panels mounted simultaneously (only toggling a `hidden` attribute), so an effect meant to gate one tab fired for every visitor to the page. Fixed by replacing the hard redirect with an inline sign-in prompt scoped to just that tab.
- Articles were marked "read" on page mount instead of on scroll-to-bottom.
- A feeding/water check-in double-click race could create two log entries for one action.
- A fully built `NeuteringRequestBanner` component existed but was never actually rendered anywhere on the colony page.
- The signup form ignored a `returnTo` parameter and never redirected back to the page that prompted the signup.
- 15 modals had no focus trap; keyboard users could tab out of an open dialog into the page behind it. Fixed with one shared hook reused across every modal.
- Two forms relied on placeholder text as their only label, which disappears the moment a screen reader user starts typing. Fixed with real, associated `<label>` elements.
- Several success-state text colors failed WCAG contrast (measured at 3.3:1 against a 4.5:1 minimum). Corrected across the palette.

The complete, itemized list — file references, exact fixes, and the reasoning behind each — is in [`AUDIT_REPORT.md`](AUDIT_REPORT.md).

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

Copy `.env.example` to `.env.local` and fill in real values:

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

- **`NEXT_PUBLIC_SUPABASE_URL`** and **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** — Supabase dashboard → your project → Project Settings → API. The anon key is safe to expose client-side by design; every sensitive rule is enforced by RLS and the security-definer functions described above, not by hiding this key.
- **`NEXT_PUBLIC_WEATHER_API_KEY`** — OpenWeatherMap → "My API keys" (free account, free tier is sufficient).
- **`NEXT_PUBLIC_SITE_URL`** — defaults to `http://localhost:3000` for local development; only change it for a deployed instance.

### Database Setup

`supabase/migrations/` contains 75 numbered SQL files — run them **in order** in the Supabase SQL Editor (Supabase dashboard → SQL Editor → paste each file's contents → Run), since most assume everything before them has already been applied. `0001_init.sql` creates the core schema and RLS policies; the rest are incremental features, RPCs, and the security fixes described above.

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm run start
```

---

## Project Structure

```
felines/
├── app/                       # Next.js App Router — 21 page routes
│   ├── page.tsx               # Home — hero, impact stats, entry points, the guide
│   ├── map/                   # Interactive colony map
│   ├── colony/[id]/           # Colony detail (tabs: cats, timeline, needs, reports, letter, edit)
│   ├── colony/new/            # Register a colony
│   ├── cat/[id]/              # Individual cat page
│   ├── learn/[slug]/          # Individual educational article
│   ├── glossary/              # 36-term bilingual glossary
│   ├── plants/                # Toxic plants reference
│   ├── curso/                 # Caretaker course
│   ├── reports/               # Reports / resources / contacts / stories hub
│   ├── resources/, contacts/, stories/  # Standalone deep links into the hub above
│   ├── impact/                # Public platform-wide impact statistics
│   ├── profile/                # Signed-in user's profile
│   ├── u/[id]/                 # Public caretaker profile
│   ├── notifications/          # Notification inbox
│   ├── login/, signup/, forgot-password/, reset-password/  # Auth
│   └── api/reports/           # Rate-limited report submission endpoint
├── components/                 # ~90 single-concern React components
├── hooks/
│   └── useFelinesAssistant.ts # Cat assistant trigger logic
├── lib/
│   ├── articles.ts             # All 19 educational articles
│   ├── glossary.ts             # 36 glossary terms, bilingual
│   ├── catCuriosities.ts       # 8 real cat facts for the assistant
│   ├── quiz.ts                 # The "what kind of neighbor are you" quiz
│   ├── neighborhoodQuiz.ts     # The neighborhood-diagnosis quiz (a distinct, situational quiz)
│   ├── reportTypes.ts          # The 9 report type definitions/labels
│   ├── rateLimit.ts            # In-memory rate limiter for report submissions
│   ├── storage.ts              # Safe upload-path building (anti path traversal)
│   ├── geocode.ts               # Validated reverse geocoding (anti SSRF)
│   ├── validateCoordinates.ts  # Geographic range validation
│   └── i18n/pt.ts, en.ts       # Full Portuguese and English translations
├── supabase/migrations/         # 75 numbered SQL migrations (schema, RLS, RPCs)
├── AUDIT_REPORT.md              # Full itemized security/bug/refactor audit
└── LICENSE_COMPLIANCE.md        # Third-party license findings, reviewed and documented
```

---

## How AI Was Used

This project was built solo by **Luara** (UX Designer / Business Analyst) using **Claude Code** for implementation, across many focused sessions.

**Human direction (founder only):**
- Problem identification and target-audience insight — the founder herself didn't know what a cat colony was before starting this project, and used that gap as her own primary persona for design decisions.
- The strategic read on the hackathon's "world domination" theme — that for a project like this, it means converting the people who *aren't* allies yet, not preaching to people who already love cats. No tool suggested this framing.
- Every product decision: what to build, what to cut, and why.
- Security design intent — framing progressive location blur as animal protection first, data protection second.
- Visual identity, sourced from the logo cat's own coloring.
- Curating the 14 real, verified local contacts for Natal, RN.
- Reviewing and approving every article, translation, and cat fact before it shipped.
- Directing every audit pass and reviewing every finding across the project's security, accessibility, functional, content, and performance reviews.

**Claude Code (implementation):**
- All Next.js/TypeScript code, all 75 Supabase migrations, and the 21 page routes.
- Running the security, accessibility, functional, and performance audits, and identifying the specific bugs and gaps described above.
- Initial drafts of articles and translations, always reviewed and corrected by the founder before shipping.

**Collaborative:**
- Security architecture — the founder defined what needed protecting and why; Claude Code implemented the RLS policies, grants, and RPCs that enforce it.
- User flows — designed by the founder, implemented by Claude Code, refined together across multiple review passes.
- The cat assistant — tone and content approved by the founder, triggers and animation timing implemented by Claude Code.

---

## Impact Data

The numbers behind why this platform exists, cited on the home page and throughout the educational guide:

- **480 million** stray cats worldwide (World Animal Foundation).
- **10+ million** stray cats in Brazil alone (WHO), with only around **7,400** in formal shelters.
- **~185,000** animals already living in NGOs/shelters operating at capacity (Instituto Pet Brasil, 2023) — there's no realistic sheltering capacity to remove cats at scale.
- **~40%** of Brazilians report having had a conflict with a neighbor involving animals (IBGE).
- Animal abandonment in Brazil grew from an estimated **3.9 million** animals (2018) to **8.8 million** (2020).
- **71%** of people who abuse animals also commit crimes against humans (Brazilian Ministry of the Environment, citing "The Link" research) — animal welfare and community safety are not separate issues.
- The World Health Organization recommends TNR (Trap-Neuter-Return) as the preferred method for stray population control — not removal.

---

## Roadmap

- Deploy to a public URL and seed a demo account for evaluators
- Expand beyond Natal, RN to additional cities, one at a time
- A PWA build for offline-capable use in the field
- Integration with municipal TNR programs and public clinics
- Scheduled (not just on-page-load) notification checks
- A public API for researchers and city governments
- A caretaker mentorship network connecting new and experienced caretakers

---

## License

**No license file is currently included in this repository.** Treat the code as all-rights-reserved unless and until a license is formally added. (A separate document, [`LICENSE_COMPLIANCE.md`](LICENSE_COMPLIANCE.md), records a third-party dependency license review completed during development — that's about a dependency of this project, not a license grant for the project itself.)

---

## Acknowledgments

- The Hack the Kitty 2026 organizers, for the prompt that started this.
- Alley Cat Allies, for publicly available TNR research and methodology.
- The World Health Organization and IBGE, for the population and conflict data cited throughout.
- Instituto Pet Brasil, for Brazilian shelter-capacity statistics.
- The real, often invisible caretakers of Natal, RN, who keep colonies fed, castrated, and looked after with no platform, budget, or recognition — this project exists to make that work a little more visible.
