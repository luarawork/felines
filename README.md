# Felines 🐾

> An educational platform for people who aren't "cat people" — at least, not yet.

Felines maps cat colonies and helps everyday citizens understand what's happening with stray cats in their neighborhood — and what they can do about it. No cat expertise required.

The platform is built for the neighbor with a conflict, the curious passerby, and the person who wants to help but doesn't know how. We talk to neighbors before they become guardians — without asking them to love cats first.

**Built for [Hack the Kitty 2026](https://hackthekitty.com)** (June 24 – July 7, 2026)

---

## The Problem

There are an estimated 480 million stray cats worldwide, and more than 10 million in Brazil alone. Shelters and NGOs are already over capacity — roughly 185,000 animals are living in institutions with no more room to take in another one. Removal-based "solutions" don't work either: decades of attempts across different cities show that an emptied territory gets reoccupied within months, usually by a less stable, not-yet-castrated group.

Most of the friction isn't really about the cats — it's about information. Nearly 40% of people report having had a conflict with a neighbor involving animals, and a lot of that comes down to not knowing why the cats are there, who (if anyone) is already caring for them, or that castration — not removal — is the method that actually works long-term.

Every cat-welfare platform we looked at talks to people who already care: established caretakers, donors, adopters. That leaves out the much larger group that matters just as much — the person annoyed by the smell on their street, the one who found a kitten and panicked, the one who saw something concerning and didn't know if it was worth reporting. Caretakers, meanwhile, often work alone and invisibly, with no way for a worried neighbor to even find out they exist.

Felines is built for that gap. It doesn't require buying into "cat person" identity to be useful — it just asks: what's happening near you, and what's the smallest useful thing you can do about it right now?

---

## Live Demo

Not yet deployed to a public URL — deployment to Netlify is part of the post-hackathon roadmap (see below). In the meantime, the platform runs locally in a few minutes; see [Getting Started](#getting-started).

There is no seeded demo account at this time. Every feature below is reachable by creating a free account through `/signup`, or — for most of the map, the educational guide, and the emergency help flow — with no account at all.

**Without an account, you can:**
- Browse the interactive map, with colony pins shown at a privacy-protecting blurred location
- Read the entire 18-article educational guide
- Open the "Preciso de ajuda" (Need help) emergency assistant and get situation-specific guidance
- Submit most report types (sightings, injured/sick cats, suspected abuse, disease outbreaks)
- View any colony's public page and any caretaker's public profile
- Flag a colony, report, or profile you believe is fake or harmful

**With an account, you additionally can:**
- Register a new colony on the map (with a required photo and exact pin placement)
- Link yourself as a caretaker of any mapped colony — or step down later
- Log feedings and water check-ins, add named cats, and write a letter for the next caretaker
- See the colony's exact location instead of the blurred approximation
- Confirm or resolve community reports, and report a lost cat
- Track your reading progress, take the "what kind of neighbor are you" quiz, and see your full contribution history
- Receive notifications for extreme weather and cats that haven't been seen in a while

---

## Features

### 🗺️ Interactive Colony Map

Built on Leaflet.js (`react-leaflet`), the `/map` page renders three kinds of pins — colonies (terracotta), sightings (gray), and emergencies (red, pulsing) — over an OpenStreetMap tile layer. Visitors can search colonies by name, toggle pin types and castration-status filters, and a persistent activity panel lists everything currently visible on screen, updating live as the map is panned or zoomed. Signed-in users can additionally turn on a heat-map overlay that highlights colonies likely needing attention (an open report and/or no feeding logged in 7+ days). A weather banner in the corner reflects the conditions at the map's current center, refetching as it moves.

### 🔒 Progressive Location Blur

Exact colony coordinates are never exposed to a direct database query — they're protected at three levels, escalating with trust:

- **Level 1 (anonymous visitors):** a wide blurred offset (roughly ±0.005°, about 500m) with a visible uncertainty circle, computed once at registration time and stored in `latitude_blurred`/`longitude_blurred`.
- **Level 2 (signed-in, non-caretaker):** a closer blurred offset (roughly ±0.001°, about 100m), stored in `latitude_blurred_near`/`longitude_blurred_near`.
- **Level 3 (linked caretaker or the colony's creator):** the real, exact coordinates — but only ever returned by `get_colony_exact_location()`, a `SECURITY DEFINER` Postgres function that re-validates the caretaker link against the database on every call. No client query, cached value, or role grant can read the `latitude`/`longitude` columns directly — table-level `SELECT` on those two columns is revoked from both `anon` and `authenticated`.

This exists for one reason: exact coordinates in the wrong hands could be used to find and harm the cats. A small lock badge appears over blurred pins so visitors understand what they're looking at is an approximate area, not a precise address.

### 📚 Educational Guide

18 short articles organized into 5 thematic levels (from "what even is a colony" to "what nobody tells you before becoming a caretaker"), merged into the home page as a sequence of alternating light/dark sections rather than a single long list. Each article tracks estimated reading time, shows a couple of sourced fact chips, and links to related articles at the end. Reading progress is saved per signed-in user (`knowledge_progress`), shown as a progress bar and a row of unlocked article badges on `/profile`. After reading at least 3 articles, a 3-question personalization quiz unlocks, sorting the reader into one of three "neighbor profiles" (Observer, Backup, Guardian) with a suggested first action — there's no wrong answer, it's about framing a next step, not scoring.

### 🏘️ Colony Pages

Each colony (`/colony/[id]`) has a full-bleed cover photo, a narrative description, and a castration-status badge that automatically reflects the actual registered cats once there are any (e.g. "3 de 5 gatos castrados") instead of just the manually-set status from registration. Any number of caretakers can be linked to the same colony, shown as a row of avatar + name, each linking to their public profile. The page is organized into three tabs:

- **Gatos** — named cats with photos, castration toggle, and a "last seen" timestamp; a cat unseen for 7+ days gets a visible nudge ("does anyone know if he's okay?") and triggers a notification to caretakers.
- **Linha do tempo** — a collective, chronological history of everything that's happened: feedings, water check-ins, new cats, castration rounds, edits to the colony's info, cover-photo changes (the previous photo is preserved as a timeline entry instead of just disappearing), and more. Each entry shows who did it, links to their public profile, and can be hearted (❤️) by any signed-in visitor to thank that specific action — which notifies whoever did it.
- **Necessidades** — castration progress, active help/neutering requests, and **recurring care reminders** (feeding, water, health checks, or a custom task) that a caretaker can set up with a repeat interval in days; each shows an overdue/due-today/due-in-N-days badge computed from `last_done_at + frequency_days`, and any linked caretaker can mark one done. Scoped to caretakers/creator only via RLS — this is a private planning tool, not a public-facing section.
- **Carta de quem cuidou antes** — a letter caretakers leave for whoever comes next, with full version history.

A weather banner (now labeled with the actual place name, e.g. "Natal, 28°C, few clouds"), a rotating fact chip about street cats in general, a thank-you button per caretaker, and a "Sinalizar" (flag) link for reporting fake or harmful colony pages round out the page.

### 🚨 Emergency Help Flow

The "Preciso de ajuda" button, available from the navbar on every page, opens a global modal (not a separate route) with a 2-step assistant: pick what's happening from 8 situations (injured/sick cat, lone kitten, suspected poisoning/abuse, disease outbreak, building conflict, missing cat, threat to the colony, or something else), then mark where on a map. Each situation shows tailored, plain-language guidance and, when relevant, a specific alert with real local resources — the Disque Denúncia hotline (181), Lei 9.605/98 (Brazil's animal-abuse law), or the municipal zoonosis control center, depending on the situation. Most situations let you submit a report directly from the flow without an account; reporting a missing cat requires one, since the whole point is letting a finder reach the owner.

### 📋 Community Reports

`/reports` lists open community reports, filterable by type across all 9 categories (no food/water, injured/sick, new kitten, missing cat, suspected poisoning, suspected abuse, disease outbreak, threat to colony, sighting). Anyone can submit one — accounts aren't required, since waiting for a signup would defeat the point during an emergency — but viewing the list and confirming/resolving requires being signed in. A report resolves automatically once 3 different community members confirm it (`confirm_report()`, an atomic RPC that also blocks a report's own creator from confirming it themselves and prevents the same person from confirming twice). "Sensitive" reports (suspected poisoning, abuse, or disease outbreak) are flagged automatically by a database trigger and always leave a permanent timeline entry when resolved — they're never silently deleted. A linked caretaker can also resolve a report on their colony manually. Every report shows who filed it (or "Relato anônimo" if filed without an account), linked to their public profile.

### 🌡️ Weather Integration

A weather banner (OpenWeatherMap) shows the current conditions and a care alert for extreme heat or heavy rain, since both directly affect food/water availability and shelter needs for street cats. It reflects real coordinates — a colony's own location on its detail page, or the map's current visible center on `/map`, refetching as the map is panned — rather than a single fixed city.

### 👤 User Profiles and Caretaker System

`/profile` shows a signed-in user's avatar, display name, the colonies they created or linked to as a caretaker, a knowledge-guide progress bar, and a unified "Sua jornada" timeline merging every contribution into one chronological feed: colonies registered, becoming a caretaker, feedings logged, reports filed, confirmations given, and thanks sent or received. Anyone — signed in or not — can view a caretaker's public profile at `/u/[id]`, showing their colonies, the reports they've filed, and the confirmations they've given (type/status/date only, never private details). Registering a new colony automatically links its creator as a caretaker; becoming or stepping down from caretaking updates access to the colony's management controls immediately, without a page reload, via a shared `ColonyAccessProvider` context.

### 🔔 Notifications

A bell icon in the navbar (with an unread badge) leads to `/notifications`. Two kinds of alerts are generated automatically when a signed-in caretaker loads any page: extreme weather (below 10°C or above 32°C) for any colony they care for, and a cat that hasn't been marked "seen" in 7+ days. A third type fires whenever someone hearts one of your timeline actions. All three are deduplicated (at most one per colony/cat/day) by checking for an existing row before inserting a new one — there's no backend cron in this stack, so the check runs client-side on page load instead.

### 🎯 Onboarding

First-time visitors to the home page see a one-time dismissible banner explaining what the platform does (remembered via `localStorage`, never shown again afterward). The first time anyone clicks a blurred colony circle on the map, a one-time tooltip explains why the pin looks fuzzy instead of precise. Anonymous visitors filling out a report see a contextual notice that an account isn't required for that action; visitors hitting an account-gated action see a notice explaining why an account helps, with direct links to `/signup` and `/login` instead of a silent redirect.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js 16 (App Router, Turbopack) + TypeScript | Server components keep data-fetching close to the database for public pages (colony, profile, reports list), while client components handle the genuinely interactive parts (map, forms, modals) |
| Styling | Tailwind CSS v4 (CSS-based `@theme`, no JS config file) | Fast iteration on a custom editorial design system without leaving the markup |
| Map | Leaflet.js + react-leaflet | Open source, no API key or usage quota, full control over custom pin styling and the blur-circle overlay |
| Database | Supabase (PostgreSQL) | Row Level Security lets sensitive rules (location blur, report visibility, who can edit what) live in the database itself, not just in application code |
| Auth | Supabase Auth | Email/password auth wired directly into Postgres' `auth.users`, so every RLS policy can reference `auth.uid()` |
| Storage | Supabase Storage | One bucket (`colony-photos`) for every uploaded image — colony covers, cat photos, avatars, timeline and report photos — with server-side size/MIME enforcement |
| Weather | OpenWeatherMap API | Free tier, simple REST call, good enough granularity for a "should I worry about my cats today" banner |
| Deploy | Netlify (planned) | Native Next.js support, generous free tier for a hackathon project |

---

## Security Architecture

This section exists to show the reasoning, not just the mechanism — every
control below was a deliberate design decision, made when the relevant
feature was built, not a hardening pass bolted on afterward. (A full audit
of the *whole* codebase against this design, including what it found, lives
in [`AUDIT_REPORT.md`](AUDIT_REPORT.md).)

### Progressive Location Blur

**Why this exists at all:** a colony's exact coordinates in the wrong hands
could be used to find and harm the cats living there. The threat isn't
"someone sees the map" — it's "someone who wants to hurt animals gets a
precise address." That risk scales with how much the app can verify about
who's asking, so the response is a **three-tier trust ladder** instead of a
single all-or-nothing setting:

| Tier | Who | What they get | Column(s) | Why this tier gets this much |
|---|---|---|---|---|
| 1 | Anonymous visitor | ~500m blur radius, shown as a visible uncertainty circle (not a precise pin) | `latitude_blurred` / `longitude_blurred` | Enough to see "there's a colony in this neighborhood" — the whole point of the public map — without ever narrowing down to a specific building or lot |
| 2 | Signed-in, not yet a caretaker | ~100m blur radius | `latitude_blurred_near` / `longitude_blurred_near` | An account is a small trust signal (traceable, rate-limited by Supabase Auth itself) but not enough to hand someone an exact address before they've shown any actual commitment to that colony |
| 3 | Linked caretaker or the colony's creator | Exact coordinates | `latitude` / `longitude`, **never via a direct column grant** | The person actually feeding/managing this colony needs the real address to get there |

The property that makes this actually enforceable, not just a UI
convention: `latitude`/`longitude` are **revoked from every role at the
grant level**, not merely hidden by a row policy —
[`revoke select (latitude, longitude) on colonies from anon, authenticated`](supabase/migrations/0016_progressive_location_blur.sql).
That means even a signed-in caretaker's own browser can't fetch those two
columns directly (`supabase.from("colonies").select("latitude")` fails
regardless of who's asking); the *only* path to the exact value is
[`get_colony_exact_location(p_colony_id)`](supabase/migrations/0001_init.sql),
a `SECURITY DEFINER` function that re-checks the caretaker/creator
relationship **against the database, on every call** — never from a cached
session flag, a client-side "isCaretaker" boolean, or anything the client
could tamper with. The identical pattern (blurred columns for lower tiers,
a grant-revoked exact column, an RPC gate) was reused for
[`reports.latitude`/`longitude`](supabase/migrations/0040_blur_report_coordinates.sql)
once it became clear a report's exact location could otherwise leak a
colony's near-exact position through its own open reports.

A small lock badge appears over blurred pins on the map specifically so a
visitor understands what they're looking at is an approximate area, not
imprecise data — the ambiguity is intentional, and the UI says so.

### Row Level Security (RLS), by table

Every application table has RLS enabled — there is no table anywhere in
this schema with a permissive "allow everything" policy, and the design
default for a new table is "start from zero access, grant back exactly
what's needed," not the reverse. The reasoning per table, not just the rule:

| Table | Public can | Requires auth | Why |
|---|---|---|---|
| [`colonies`](supabase/migrations/0001_init.sql) | Read name/narrative/blurred coordinates/castration status | Insert, update (creator/caretaker only) | The map is meant to be publicly browsable — that's the product. Writes need an identity to attribute the change to. |
| [`reports`](supabase/migrations/0024_public_report_pins.sql) | Insert (no account needed) | Read full rows, update/resolve | Emergencies (a poisoned cat, active abuse) can't wait for someone to create an account first — but browsing the list and resolving reports is gated so it isn't a fully open read/write surface. |
| [`caretakers`](supabase/migrations/0001_init.sql) | Read | Insert own link, delete own link only | "Who cares for this colony" is meant to build public trust, so it's readable by anyone; only the caretaker themselves can step down — another caretaker can't remove someone else. |
| [`knowledge_progress`](supabase/migrations/0001_init.sql) | Nothing | Read/write own rows only | Reading progress is personal — there's no reason another user, or the public, should see which articles you've read. |
| [`profiles`](supabase/migrations/0066_restrict_streak_columns_to_owner.sql) | Read `id`/`display_name`/`avatar_url`/`created_at` | Own streak fields via `get_own_streak()` RPC only | Display name/avatar are the public-facing identity; care-streak numbers are a private motivational signal, never a leaderboard. |
| Storage (`colony-photos` bucket) | Read | Insert (size/MIME enforced server-side) | Public photos need public read; uploads need an account, and the 5MB/image-MIME limit is enforced [at the bucket level](supabase/migrations/0026_storage_bucket_limits.sql), not just client-side, since a client-only check is trivially bypassed with a real access token and a raw HTTP request. |

### Why RPCs use `SECURITY DEFINER`

A Postgres function needs `SECURITY DEFINER` when it has to do something
the *calling* role's own grants wouldn't allow on their own — in this
codebase, that's always one of two shapes:

1. **Writing a row that belongs to someone else** — notifying another
   user means inserting into *their* `notifications` row, which the
   caller's own RLS grant on that table doesn't (and shouldn't) permit
   directly. Examples: `notify_caretakers`, `notify_followers`,
   `thank_action`, `respond_to_help_request`, `respond_to_resource_post`.
2. **Authorization logic a row policy can't express** — `get_colony_exact_location`
   needs to check "is this caller a caretaker of *this specific* colony"
   and return different data based on the answer, which is a function's
   job, not a `SELECT ... WHERE` policy's; `confirm_report` needs an
   atomic counter increment plus a self-confirm guard plus an auto-resolve
   check, all as one transaction.

The security property that actually matters for each of these: **what can
the caller control, and where does it end up?** A `SECURITY DEFINER`
function that just bypasses a check on the caller's *own* data is low
risk. One that accepts caller-supplied content and writes it somewhere
another user will see it is where real bugs live — see
[`AUDIT_REPORT.md §2.1`](AUDIT_REPORT.md#21-notify_caretakersnotify_nearby_caretakers--message-injection-via-direct-rpc-call-fixed-applied)
for the one place this codebase actually got that wrong (since fixed).

### Rate Limiting

[`lib/rateLimit.ts`](lib/rateLimit.ts) — an in-memory sliding-window limiter
(10 requests/hour for anonymous callers, 30/hour for authenticated, keyed
by IP or user id) — guards `/api/reports` specifically, since that's the
one write path reachable by someone with no account at all. Every other
user-generated-content path (contacts, stories, resource posts, flags)
already requires authentication, which changes the abuse math from "free
and untraceable" to "tied to a real account" — a meaningfully higher cost
even without a per-endpoint limit, though extending rate limiting to those
paths too remains on the backlog (see [`AUDIT_REPORT.md §2.9`](AUDIT_REPORT.md#29-rate-limiting)).

### Report Integrity

A report needs 3 confirmations from 3 *different* people to auto-resolve — enforced by a unique constraint on `(report_id, user_id)` in `report_confirmations`, so the same account can't inflate the count by clicking repeatedly. The report's own creator is blocked from confirming it, both client-side (the button doesn't render for them) and server-side (`confirm_report()` checks `created_by` before recording anything). Sensitive report types (suspected poisoning, suspected abuse, disease outbreak) are marked automatically by a trigger and always leave a permanent timeline trace when resolved, whether that happens via the 3-confirmation threshold or a caretaker's manual resolve. This is deliberate, not incidental: a poisoning incident from months ago is relevant context for a new caretaker deciding whether to link themselves to that colony, in a way a routine feeding log isn't — so the record of "this happened" never disappears, even after the report itself is marked resolved. See [`AUDIT_REPORT.md §2.7`](AUDIT_REPORT.md#27-why-sensitive-reports-stay-permanent-in-the-timeline) for the full reasoning.

### Security Headers

`next.config.ts` sets `X-Frame-Options: DENY` (clickjacking protection), `X-Content-Type-Options: nosniff` (MIME-sniffing protection), `Referrer-Policy: strict-origin-when-cross-origin`, a `Permissions-Policy` restricting camera/microphone entirely and geolocation to same-origin, and a `Content-Security-Policy` scoped to the app's actual external origins (Supabase, OpenStreetMap tiles, OpenWeatherMap, Nominatim) — nothing else is allowed to load or connect.

---

## Database Schema

| Table | Purpose | Key columns | RLS |
|---|---|---|---|
| `colonies` | A mapped cat colony | `name`, `narrative`, `latitude`/`longitude` (creator/caretaker-only via RPC), `latitude_blurred`/`longitude_blurred`, `latitude_blurred_near`/`longitude_blurred_near`, `castration_status`, `cover_photo_url`, `created_by` | ✅ |
| `cats` | A named cat within a colony | `colony_id`, `name`, `photo_url`, `castrated`, `last_seen` | ✅ |
| `caretakers` | Links a user to a colony they care for | `colony_id`, `user_id`, `letter` | ✅ |
| `reports` | A community report (sighting, emergency, or lost cat) | `colony_id`, `type`, `description`, `photo_url`, `latitude`/`longitude`, `status`, `confirmations`, `sensitive`, `related_report_id`, `created_by` | ✅ |
| `report_confirmations` | One row per person who confirmed a report | `report_id`, `user_id` (unique together) | ✅ |
| `timeline_events` | The chronological log of everything that happens to a colony | `colony_id`, `event_type`, `description`, `photo_url`, `created_by` | ✅ |
| `feedings` | A logged food or water check-in | `colony_id`, `user_id`, `type` (`food`/`water`) | ✅ |
| `knowledge_progress` | Which articles a user has read | `user_id`, `article_slug` | ✅ |
| `thanks` | A one-time "thanks for caretaking" between a sender and a caretaker | `colony_id`, `caretaker_user_id`, `sender_user_id` | ✅ |
| `action_thanks` | A heart on one specific timeline event | `timeline_event_id`, `sender_user_id` (unique together) | ✅ |
| `flags` | A flag on a colony, report, or profile suspected of being fake/harmful | `target_type`, `target_id`, `reason`, `details`, `created_by` | ✅ |
| `notifications` | In-app alerts (weather, stale cats, action thanks) | `user_id`, `colony_id`, `type`, `message`, `read` | ✅ |
| `profiles` | Public-facing display name/avatar, mirroring `auth.users` | `id` (= `auth.users.id`), `display_name`, `avatar_url` | ✅ |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A free Supabase project
- A free OpenWeatherMap API key

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd felines
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (see below).
4. Run every file in `supabase/migrations/` in numeric order against your Supabase project (see below).
5. Start the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Create a `.env.local` file in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_WEATHER_API_KEY=
```

- **`NEXT_PUBLIC_SUPABASE_URL`** and **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** — found in your Supabase project under Project Settings → API. The anon key is safe to expose client-side; every sensitive operation is enforced by RLS and the RPCs described above, not by hiding this key.
- **`NEXT_PUBLIC_WEATHER_API_KEY`** — an OpenWeatherMap API key (free tier is sufficient). Despite the `NEXT_PUBLIC_` prefix implying it's meant to be public, be aware it is genuinely fetched client-side in a couple of code paths today (see the note at the top of `lib/weather.ts`) — treat it as a low-sensitivity key, not a secret.

### Running Supabase Migrations

`supabase/migrations/` contains 39 numbered SQL files — run them **in order** (`0001`, `0002`, `0003`, ...) in the Supabase SQL Editor, since most assume everything before them has already been applied. A few are worth knowing about specifically:

- **`0001_init.sql`** — initial schema and RLS policies for the core tables.
- **`0002_colony_photos.sql`** — adds the `colony-photos` storage bucket.
- **`0016_progressive_location_blur.sql`** / **`0017_fix_exact_location_grant.sql`** / **`0018_regenerate_wide_blur.sql`** — the 3-level location blur system.
- **`0024_public_report_pins.sql`** / **`0025_public_report_history_and_confirmations.sql`** — column-scoped public access to reports.
- **`0026_storage_bucket_limits.sql`** — server-side file size/MIME enforcement.
- **`0035_notifications.sql`** / **`0039_action_thanks.sql`** — the notifications system and per-action thanks.
- **`0003_seed_demo_data.sql`** is optional seed data for local testing; **`0037_full_data_reset.sql`** is a one-time, deliberately destructive script for wiping all application rows during development — don't run it against data you want to keep.
- The rest are incremental fixes, RPCs, and cleanups made along the way (several `00xx_cleanup_*.sql` files remove test/debug data created during early development).

---

## Project Structure

```
felines/
├── app/                          # Next.js App Router pages
│   ├── colony/
│   │   ├── [id]/                # Colony detail page
│   │   └── new/                 # Colony registration form
│   ├── learn/[slug]/            # Individual educational article
│   ├── login/, signup/          # Authentication
│   ├── map/                     # Interactive map
│   ├── notifications/           # Notification inbox
│   ├── profile/                 # Signed-in user's profile
│   ├── reports/                 # Community reports list
│   ├── u/[id]/                  # Public caretaker profile
│   └── page.tsx                 # Home — hero, stats, entry points, learning guide
├── components/                   # ~53 React components (one concern each:
│                                 # map, forms, modals, timeline pieces, etc.)
├── lib/                          # Framework-free utilities and content
│   ├── articles.ts               # All 18 educational articles
│   ├── reportTypes.ts            # The 9 report type definitions/labels
│   ├── notifications.ts          # Extreme weather + stale cat notification logic
│   ├── weather.ts                # OpenWeatherMap fetch helper
│   ├── quiz.ts                   # The 3-question neighbor-profile quiz
│   ├── profile.ts                # Display name/avatar helpers
│   └── storage.ts                # Safe upload path building + client-side validation
└── supabase/
    └── migrations/                # 39 numbered SQL migrations (schema, RLS, RPCs)
```

---

## Pages

| Route | Description | Auth required |
|---|---|---|
| `/` | Home — hero, impact stats, entry points, and the full educational guide | No |
| `/map` | Interactive colony map | No (exact coordinates require being a linked caretaker) |
| `/colony/[id]` | Colony detail page — cats, timeline, caretaker letter, actions | No (editing/managing requires being a linked caretaker or the creator) |
| `/colony/new` | Register a new colony | Yes |
| `/learn/[slug]` | Individual educational article | No |
| `/reports` | Community reports list | Yes (viewing/confirming); submitting most types doesn't require an account, but happens via the help modal or a colony page, not this page directly |
| `/profile` | Signed-in user's profile and contribution history | Yes |
| `/u/[id]` | Public caretaker profile | No |
| `/notifications` | Notification inbox | Yes |
| `/login`, `/signup` | Authentication | No |

The emergency help flow ("Preciso de ajuda") isn't a separate route — it's a global modal available from the navbar on every page, via `HelpModalProvider`.

---

## Educational Content

**Level 1 — The basics**
- `what-is-a-cat-colony` — O que é, exatamente, uma colônia de gatos?
- `por-que-existem-gatos-de-rua` — Por que os gatos sempre voltam pro mesmo lugar
- `castracao-reduz-conflitos` — A castração resolve mais conflito do que qualquer reclamação
- `why-removing-cats-doesnt-work` — Por que remover os gatos nunca resolve de verdade
- `what-is-tnr-and-why-it-works` — TNR: as 3 letras que resolvem o problema de verdade
- `stray-cats-in-brazil-the-numbers` — Os números que mostram o tamanho real do problema
- `common-myths-about-stray-cats` — 5 mitos sobre gatos de rua que vale desmontar agora
- `feral-semi-feral-e-socializado` — Feral, semi-feral ou socializado? O comportamento explica tudo

**Level 2 — Getting involved**
- `how-to-approach-a-stray-cat` — Como se aproximar de um gato de rua sem ser mordido
- `found-a-kitten-alone` — Achou um filhote sozinho? Respire antes de agir
- `como-ajudar-sem-adotar` — Você não precisa adotar nenhum gato pra fazer diferença
- `small-actions-real-impact` — Pequenas ações que realmente fazem diferença

**Level 3 — Responding to emergencies**
- `how-to-report-animal-abuse` — Maus-tratos são crime. Veja como denunciar direito
- `found-injured-cat-step-by-step` — Gato ferido na rua: 5 passos, sem complicar
- `how-to-help-injured-cat` — O gato ferido sobreviveu ao resgate. E agora?

**Level 4 — Living alongside a colony**
- `cats-bothering-your-building` — Os gatos estão incomodando seu prédio? Isso aqui funciona de verdade
- `living-with-a-cat-colony` — Convivendo bem com a colônia que mora perto de você

**Level 5 — Going further**
- `tornando-se-cuidador` — O que ninguém te conta antes de virar cuidador

---

## Impact Data

The numbers behind the platform's framing (cited in the home page hero and the educational guide):

- **480 million** stray cats worldwide.
- **10+ million** stray cats in Brazil alone.
- **~185,000** animals already living in NGOs/shelters operating at capacity — there's no realistic sheltering capacity to remove cats at scale.
- **~40%** of people report having had a conflict with a neighbor involving animals.
- The World Health Organization recommends TNR (Trap-Neuter-Return) as the preferred method for stray population control — not removal.

---

## The Hackathon Context

Built solo for **Hack the Kitty 2026** (June 24 – July 7, 2026). As of this writing, the project sits at 93 commits across 4 days of active development, spanning the full schema/RLS/RPC design, every feature described above, a complete editorial UI redesign, a full Portuguese copy pass, and an accessibility/security audit.

The theme nudges toward "world domination" — our read on that is: world domination, for a project like this, means converting the people who aren't allies yet. Not the people who already love cats, but the neighbor who's annoyed, the passerby who's curious, the person who saw something and didn't know it was worth mentioning. That's who Felines is actually trying to reach.

---

## Roadmap

- Deploy to Netlify and add a seeded demo account for evaluators
- Expand beyond Natal, RN to additional cities, one at a time
- Integration with municipal TNR programs and clinics
- A PWA build for offline-capable mobile use in the field
- Scheduled (not just on-page-load) notification checks
- A public, live impact dashboard (colonies mapped, cats castrated, reports resolved)

---

## License

No license file is currently included in this repository. Treat the code as all-rights-reserved unless/until a license is added.

---

## Acknowledgments

- The Hack the Kitty organizers, for the prompt that started this.
- Alley Cat Allies, for publicly available TNR research and methodology.
- The World Health Organization, for stray population control guidance.
- The real, often invisible caretakers who keep colonies fed, castrated, and looked after with no platform, budget, or recognition — this project exists to make that work a little more visible.
