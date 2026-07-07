# Felines 🐾

> An educational platform for people who aren't "cat people" — at least, not yet.

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js%2016-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Netlify](https://img.shields.io/badge/Deploy-Netlify-00C7B7?logo=netlify&logoColor=white)](https://www.netlify.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Hack the Kitty 2026](https://img.shields.io/badge/%23hackthekitty-2026-B66119)](https://hackthekitty.com)

- **Live demo:** [add after deploy] — see [Live Demo](#3-live-demo) below for current status
- **Repository:** https://github.com/luarawork/felines
- **Documentation (PT):** [Felines — Documentação](https://bronzed-longship-a0f.notion.site/Felines-Documenta-o-392f091b2b7481048a73e27049a939cb)
- **Documentation (EN):** [Felines — Documentation](https://bronzed-longship-a0f.notion.site/Felines-Documentation-EN-392f091b2b7481ff9a45e3b8b06f3993)
- **Wiki (product vision, research & benchmark, personas, user flows, design decisions, visual identity, UI design system, features deep-dive, content strategy, architecture, database schema, security deep-dive, API reference, environment setup, testing, how AI was used, behind the scenes, process log, roadmap):** https://github.com/luarawork/felines/wiki

If you'd like to know more about my work: [luara.work](https://luara.work/)

---

## Table of Contents

1. [The Problem](#1-the-problem)
2. [The Hackathon Theme](#2-the-hackathon-theme)
3. [Live Demo](#3-live-demo)
4. [Features](#4-features)
5. [Tech Stack](#5-tech-stack)
6. [Architecture](#6-architecture)
7. [Security](#7-security)
8. [Testing](#8-testing)
9. [Getting Started](#9-getting-started)
10. [Project Structure](#10-project-structure)
11. [How AI Was Used](#11-how-ai-was-used)
12. [Impact Data](#12-impact-data)
13. [Roadmap](#13-roadmap)
14. [Documentation](#14-documentation)
15. [Contributing](#15-contributing)
16. [License](#16-license)
17. [Acknowledgments](#17-acknowledgments)

---

## 1. The Problem

**Scale.** An estimated 10 million stray cats live on Brazil's streets (World Health Organization / WSPA), out of roughly 480 million worldwide (World Animal Foundation, 2021). Brazil's formal shelter network is nowhere near that scale — Instituto Pet Brasil counts roughly 185,000 animals already living in NGOs and shelters operating at capacity, meaning the overwhelming majority of that population survives with no institutional support at all. Abandonment is trending the wrong way too: an estimated 3.9 million animals in 2018 grew to 8.8 million by 2020.

**The gap.** Every cat-welfare platform we looked at talks to people who already care: established caretakers, donors, adopters. Nobody built a bridge for the much larger group that matters just as much — the neighbor annoyed by the smell on their street, the passerby who's curious but non-committal, the person who wants to help but has no idea where to start, or who's actively hostile to the cats on their block. Nearly 40% of Brazilians report having had a conflict with a neighbor involving animals (IBGE), and a lot of that friction comes down to not knowing why the cats are there, who (if anyone) is already caring for them, or that castration — not removal — is what actually works. The stakes are higher than property-line disputes, too: 71% of people who abuse animals also commit crimes against humans (Brazilian Ministry of the Environment, citing "The Link" research), which means treating neighborhood animal conflict as a nuisance issue rather than a community-safety one misses the point.

**The solution.** Felines is built for that gap — and it is, deliberately, an **educational platform first**, not a colony-registration tool that happens to have some articles attached. It talks to the unconvinced. Conversion happens through logic, not guilt: the vacuum effect that explains why removing cats fails, the way castration reduces the exact behaviors that cause conflict, the fact that a mapped, cared-for colony is quieter and calmer than an unmanaged one. Once that understanding lands, the platform hands the person concrete actions — reporting a sighting, registering a colony, becoming a caretaker — that only make sense *because* the education came first. **The product never asks for altruism up front.** It makes the practical case, and lets people arrive at caring on their own terms.

---

## 2. The Hackathon Theme — "World Domination," the Strategic Reading

Most projects at this hackathon will read "world domination" literally — biggest reach, flashiest growth loop, most users acquired. We think that's the shallower reading. The more faithful one:

> Real domination isn't convincing the already-convinced. It's conquering those who still resist.

Every returning cat lover, every existing NGO donor, every already-committed caretaker is a person Felines didn't need to reach — they were already reached. The people worth building for are the ones who start from friction, indifference, or mild hostility, and end up contributing anyway, because the platform met them exactly where they were instead of asking them to change first. That's why every feature below — the tone of the articles, the fact that the emergency flow needs no account, the fact that the product never guilt-trips — is built around a single conversion path:

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
            ↓
      Territory conquered.
```

Nobody is asked to love cats to take the first step, and by the time they've taken a few, most of them do anyway.

---

## 3. Live Demo

**This project is not yet deployed to a public URL as of this submission.** Once deployed to Netlify, this section will be updated with the live URL and the demo account below. In the meantime, the app runs locally in a few minutes with a free Supabase project and a free OpenWeatherMap key — see [Getting Started](#9-getting-started).

### Demo account (once deployed)

| | |
|---|---|
| Email | `judge@felines.app` |
| Password | `FelinesDemo2026` |

### Without an account you can:

- Browse the interactive colony map, with pins shown at a privacy-protecting blurred location
- Read colony narratives and full timelines
- Explore all 19 educational articles across 5 progressive levels
- Use the emergency help flow ("Preciso de ajuda") — 9 situation types, no login wall
- Submit most report types (sightings, injured/sick cats, suspected poisoning, abuse, disease outbreaks)
- Read the glossary — 36 bilingual terms
- Take the neighborhood-diagnosis quiz
- View the public impact page (`/impact`)

### With the demo account you can:

- See a colony's more precise location instead of the blurred approximation ([why](#71-progressive-location-blur))
- Register a new colony, or link yourself as a caretaker of an existing one
- Log feeding and water check-ins, add named cats, write a caretaker's letter, set up recurring care reminders
- Access every caretaker-only feature (confirm/resolve reports, post help/neutering requests, respond to resource posts)
- View your full contribution history and earned badges
- Access the caretaker course at `/curso` and earn the "Cuidador Preparado" certification

---

## 4. Features

This is an educational platform first — the guide below is the point of the product, and every other feature (the map included) is one of the actions that education leads to, not a separate goal competing with it.

<details>
<summary>📚 Educational Guide</summary>
<br>

19 articles across 5 progressive thematic levels, following a deliberate narrative arc: first understand the world cats live in, then understand the actual problem (not the assumed one), then understand the platform's specific impact, then understand what a reader personally can do. Titles are written for **search intent** ("why removing cats doesn't work"), not product framing ("about our mission") — someone searching their actual question should land here.

Each article has a reading progress bar, sourced fact chips, and links to related articles. Reading progress is saved per signed-in user and shown on `/profile`. After reading at least 3 articles — never fewer — a 3-question personalization quiz unlocks, sorting the reader into one of three "neighbor profiles" (Observer, Backup, or Guardian) with a suggested first action; there are no wrong answers. The 3-article gate exists because classifying someone before they have any context produces a generic, forgettable result — the quiz is a payoff for having engaged, not a cold-open personality test.

The guide is complemented by a **36-term bilingual glossary** (now also linked directly from the profile page's Knowledge section, alongside courses and quizzes — the same place a reader is already reviewing what they've learned), a toxic-plants reference, a separate neighborhood-diagnosis quiz, and a short caretaker course at `/curso` culminating in a **unique certification** ("Cuidador Preparado"). The certification can only be earned once per account — a badge anyone can re-earn by retaking a quiz signals nothing; a badge that's genuinely one-time is worth displaying.

</details>

<details>
<summary>🗺️ Interactive Colony Map</summary>
<br>

One of the actions the educational guide leads to, not a separate goal — once someone understands why colonies exist and why they matter, the map is where that understanding becomes something concrete and local. Built on Leaflet.js (`react-leaflet`) over OpenStreetMap tiles, `/map` renders three pin types, each color and behavior chosen deliberately: **colonies** (terracotta — warm, not alarming, since most colonies are a neutral fact, not a problem), **sightings** (gray — informational, doesn't compete visually with anything urgent), and **emergencies** (red, pulsing — the one visual language on the whole map that's allowed to demand attention). Pins cluster automatically at low zoom so dense urban areas stay legible instead of turning into a wall of overlapping markers. A search box filters colonies by name; toggles filter by pin type and castration status. A persistent activity panel lists everything currently visible, updating live as the map is panned or zoomed.

**Weather banner.** Reflects real conditions at the map's *current* center, refetching as the map moves — not a fixed city. This isn't decoration: extreme heat and cold directly affect outdoor cat welfare, and a caretaker checking the map for their neighborhood should see weather for that neighborhood, not for wherever the app happened to default to.

**3-strikes moderation.** Anonymous visitors who suspect a pin is fake can flag it. Once a single colony pin accumulates **3 false-pin flags**, a database trigger removes it from the map automatically and bars whoever registered it from posting new colonies or reports for 1 month — no human moderator has to be paged for every case. If the same account triggers this a 3rd time, the ban becomes permanent. This is deliberately **distributed moderation**: nobody at Felines has to manually review every disputed pin, but a single disgruntled flag also can't take a real colony down — it takes three independent people agreeing something is wrong.

**Sighting clustering.** When 3 or more sightings land within roughly 200 meters of each other with no existing colony nearby, the database automatically creates a "suggested colony" and notifies caretakers within 5km. Colonies emerge organically in real life — a few sightings here and there before anyone formally "discovers" the colony — so the detection logic mirrors that instead of requiring someone to manually notice the pattern first.

</details>

<details>
<summary>🔒 Progressive Location Blur</summary>
<br>

The platform's most important design decision — and the one every judge should read carefully, because it isn't framed as data privacy. **It's animal safety.** Colonies have been targeted after their locations were shared carelessly online; a public, precise map of where vulnerable animals live is a real physical risk, not just a data-exposure one.

| Level | Who | What they get | Enforced by |
|---|---|---|---|
| 1 | Anonymous visitor | ~500m blur radius, shown as a visible uncertainty circle | `latitude_blurred`/`longitude_blurred` — the only columns `anon` has a grant on |
| 2 | Signed in, not a caretaker | ~100m blur radius | `latitude_blurred_near`/`longitude_blurred_near` — the only *additional* columns `authenticated` has a grant on |
| 3 | Linked caretaker or the colony's creator | Exact coordinates | `get_colony_exact_location(p_colony_id)` — re-checks the caretaker/creator link against the database on **every call** |

The property that makes this enforceable rather than a UI convention that a curious visitor could bypass with an API client:

```sql
revoke select (latitude, longitude) on colonies from anon, authenticated;
```

Even a signed-in caretaker's own browser cannot fetch those two columns directly — the *only* path to the real value is the RPC above, and it never trusts a cached session flag or a client-side boolean. Access is re-validated from scratch on every single call.

</details>

<details>
<summary>🏘️ Colony Pages</summary>
<br>

Each colony has a cover photo (with photo history preserved in the timeline instead of just being silently overwritten — a caretaker updating the cover shouldn't erase the visual record of how the colony has changed), a narrative description, and a castration-status badge that's **automatically calculated** from the actual registered cats, never a manually-set flag that could drift out of sync with reality.

Any number of caretakers can link to the same colony, deliberately with **no hierarchy or "owner" model** — a colony is a shared responsibility, and a first-come "owner" role would discourage a second or third person from stepping in later. The page organizes into 5 tabs, each with its own reason to exist:

- **Cats** — named cats with photos and a castration toggle. A cat unseen for 7+ days triggers a visible nudge and a caretaker notification. Individual cat notes (`cat_notes`) are **intentionally immutable** — once posted, they can be removed but never silently edited, because an observation about an animal's health is closer to evidence than to a draft that should stay editable forever.
- **Timeline** — a chronological, narrative log of everything that's happened at the colony, each entry heart-able to thank whoever did it. It's written as a story, not a system log, because a new caretaker reading it should understand the colony's history, not just its data.
- **Needs** — three deliberately *separate* systems: general help requests (food, foster homes, transport, medication — anything ad hoc), neutering requests (a distinct, trackable pipeline since castration is the platform's core intervention and deserves its own status lifecycle), and the resource-exchange board. Keeping these separate means a caretaker asking "does this colony need transport to a vet" isn't buried under "does this colony need cats castrated" — they're different questions with different urgency.
- **Reports** — every report filed against this colony, in one place.
- **Letter** — a message caretakers leave for whoever comes next, with full version history. Passing the baton to a future caretaker should carry the *dignity* of an actual handoff note, not just get lost the moment someone else takes over.

A colony becomes **community-verified** once it accumulates 3 independent confirmations from people who are neither its creator nor one of its linked caretakers — self-verification is blocked at the row-policy level — and once verified, it never un-verifies. Anyone can also flag a colony page as fake or harmful, feeding into the 3-strikes system above.

</details>

<details>
<summary>🚨 Emergency Help Flow</summary>
<br>

"Preciso de ajuda," available from the navbar on every page, opens a global modal with a 2-step assistant: pick what's happening from 9 situations — a spotted cat, an injured/sick cat, a lone kitten, a building conflict, suspected poisoning or abuse, a disease outbreak, a missing cat, a threat to a whole colony, or something else — then mark the location on a map. Each situation shows tailored guidance and, where relevant, a specific pointer to real local resources: the Disque Denúncia hotline (181), Lei 9.605/98 (Brazil's animal-abuse law), CIOSP emergency (190), or the municipal zoonosis control center (CCZ).

**Most situations let you submit a report without an account.** This is a deliberate ethical decision, not an oversight: in an active emergency, urgency has to outrank identification. Requiring a signup before someone can report a poisoning in progress would be actively harmful design.

</details>

<details>
<summary>📋 Community Reports</summary>
<br>

`/reports` lists open community reports across 9 categories. Anyone can submit most types without an account, for the same reason as the emergency flow above. Viewing the list and confirming/resolving requires signing in, since resolution is a trust action that should be tied to an identity.

A report **auto-resolves once 3 different community members confirm it**, via a single atomic database function — atomicity matters here specifically to prevent a race condition where two confirmations arriving within milliseconds of each other could both read "2 confirmations so far" and neither triggers the resolve. The same function blocks a report's own creator from confirming it and blocks the same person confirming twice. Reports about suspected poisoning, abuse, or disease outbreaks are automatically flagged "sensitive" by a database trigger and **always leave a permanent timeline entry when resolved, never silently deleted** — evidence of a poisoning incident 8 months ago is relevant context for a new caretaker deciding whether to link themselves to that colony, in a way routine feedings simply aren't.

Submissions are rate-limited in **two independent layers**: 10/hour anonymous and 30/hour authenticated at the Next.js API layer, plus a database-level circuit breaker that still applies even if someone bypasses the API entirely and calls the public Supabase REST endpoint directly with the anon key ([more in Security](#75-rate-limiting-in-two-layers)).

</details>

<details>
<summary>🤝 Community Resources</summary>
<br>

`/reports` is a 4-tab hub — **Relatos** (reports, above), **Troca de recursos** (a resource-exchange board for supplies, transport, medication, or volunteer time — offers and requests expire after 30 days, since a stale "I have cat food to give away" post from 3 months ago erodes trust in the whole board; expiry forces the listing to stay current or disappear), **Contatos** (a directory of **14 real, individually verified contacts** in Natal, RN — veterinary hospitals, NGOs, the environmental police, official hotlines, manually researched rather than aggregated from an unverified public list, because a wrong emergency number in a crisis is worse than no number at all), and **Histórias** (a public wall where linked caretakers share moments from their colonies, with reactions from any signed-in visitor — **restricted to logged-in viewers**, since personal, identifiable content about a real place and real people warrants the accountability of a real account on both sides).

</details>

<details>
<summary>🔔 Notifications — 10 types</summary>
<br>

| Type | Trigger |
|---|---|
| `action_thanks` | Someone thanks a specific timeline action you performed |
| `help_request_response` | Someone responds to a help request on a colony you care for |
| `sighting_cluster` | 3+ sightings cluster near a colony you care for |
| `resource_interest` | Someone expresses interest in your resource-exchange post |
| `story_reaction` | Someone reacts to a story you shared |
| `extreme_weather` | Extreme heat, cold, or heavy rain at a colony you care for |
| `cat_unseen` | A specific cat hasn't been seen in 7+ days |
| `area_alert` | A serious report (poisoning/abuse/disease/threat) within 5km |
| `report_submitted` | A new report was filed on a colony you care for |
| `colony_removed_ban` | A colony you registered was removed for repeated false-pin flags |

A few of these are worth explaining individually, because the reasoning behind each is a security or product-integrity decision, not decoration:

- **`extreme_weather`** exists because weather isn't trivia here — 32°C+ or sub-10°C conditions are a real welfare risk for outdoor cats, so the alert is contextual care information, not a notification for its own sake.
- **`cat_unseen`** fires **per cat, not per colony** — a colony with 8 registered cats where one hasn't been seen in a week shouldn't get buried in an aggregate "some cat somewhere might be missing" message. Precision here is the whole point.
- **`area_alert`** is built from a **fixed, server-side message template**, never free text supplied by the reporting user. This is a deliberate security decision: if the message content were caller-supplied, the notification system would be a ready-made spam/phishing vector — anyone could trigger a real notification to real caretakers with arbitrary text. The template can only vary by a validated enum (`report_type`), never by string content.
- **`colony_removed_ban`** is deliberately transparent — a person who gets banned is told exactly why and for how long, rather than silently losing the ability to post with no explanation.

</details>

<details>
<summary>🐱 Cat Assistant</summary>
<br>

A small floating cat character with a looping video, loosely inspired by the cultural memory of Microsoft Office's Clippy — a contextual animated helper that shows up at the right moment instead of constantly. It appears from **9 distinct triggers**: first-ever visit, idle on the home page, idle on `/reports`, idle on a colony page, idle on `/profile`, finishing an article, registering a first colony, viewing an empty map area, or completing the neighborhood quiz — sharing one of several real cat facts in a speech bubble.

These are deliberately **fun curiosities, not statistics** — the platform's actual impact numbers already live in the fact chips throughout the guide and on `/impact`; mixing playful trivia into that same channel would dilute both the fun and the credibility of the real data. The assistant respects a 15-minute cooldown between appearances, never interrupts an open modal or active typing, and honors `prefers-reduced-motion` with a static, non-animated fallback.

</details>

<details>
<summary>🌍 Bilingual Support (PT/EN)</summary>
<br>

The entire interface — navigation, all 19 articles, the 36-term glossary, every form, every modal — exists in full Portuguese and English, switchable at any time from the navbar, with the preference remembered in `localStorage` and the page's `lang` attribute updated dynamically to match. Every piece of content has a **human-reviewed** English counterpart; nothing is machine-translated at runtime.

</details>

<details>
<summary>🏅 Badges and Streaks</summary>
<br>

Badges recognize *actions taken* (🤝 Caretaker, 🐾 Registered a colony, 🍽️ Fed, 🥫 Donated, 🚨 Reported, 🙏 Thanked, 🎓 Certified) — never a leaderboard position. There's no ranking against other users anywhere in the product, because competition would incentivize the wrong behavior (racking up actions to win, rather than caring for an actual colony).

The care streak resets to **1, not 0**, after a missed day — a punitive full reset is demotivating in a way that discourages someone from ever coming back after one lapse, while a soft reset still reflects that the unbroken run ended without erasing the habit entirely. Streaks are **always private** — never shown on the public profile, never in any comparison — because this is personal motivation, not a competition with other caretakers.

There are also two genuinely distinct thank-you systems, worth separating because conflating them would create ambiguity about what's actually being appreciated: **`action_thanks`** thanks a *specific* timeline action (e.g. "thank you for this exact feeding") and notifies whoever performed it; the plain **`thanks`** table is a broader, caretaker-level thank-you not tied to one action, feeds the 🙏 badge, but deliberately sends no notification of its own, since it's closer to a running tally of appreciation than a real-time event.

</details>

---

## 5. Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js 16 (App Router, Turbopack) + TypeScript + React 19 | Server components keep public-page data-fetching close to the database; strict typing catches whole classes of bugs before runtime |
| Styling | Tailwind CSS v4 (CSS-based `@theme`, no JS config file) | Fast iteration on a custom editorial design system without leaving the markup |
| Map | Leaflet.js + `react-leaflet` + `react-leaflet-cluster` | Open source, no API key or usage quota, full control over custom pin styling, the blur-circle overlay, and marker clustering |
| Database | Supabase (PostgreSQL) | Row Level Security lets sensitive rules — location blur, report visibility, who can edit what — live in the database itself, not scattered across client-side checks |
| Auth | Supabase Auth | Email/password wired directly into Postgres' `auth.users`, so every RLS policy can reference `auth.uid()` natively |
| Storage | Supabase Storage | One bucket for every uploaded image, with server-side size/MIME enforcement and RLS on write access |
| i18n | Custom PT/EN context (`lib/i18n`) | The translation surface is fully known and finite — every string lives in two files — so a lightweight context avoids the bundle size and routing complexity of a general-purpose i18n framework |
| Deploy | Netlify | Native Next.js support, automatic CD from GitHub, generous free tier |
| Weather | OpenWeatherMap API | Free tier, simple REST call, real coordinates instead of a fixed city |
| Geocoding | Nominatim (OpenStreetMap) | Free, no API key, used for reverse-geocoding a colony's city name |

**Key decisions:**

- **Supabase over Firebase** — RLS means sensitive access rules live as reviewable, testable SQL instead of scattered client-side checks. Postgres also gives real relational constraints (foreign keys, `CHECK` length/range limits, partial unique indexes) that a document store doesn't offer natively.
- **Leaflet over Mapbox/Google Maps** — no API key, no usage-based billing risk during a live demo, and full control over the pin styling and blur-circle overlay the location-blur feature depends on.
- **Custom i18n over a framework like `next-intl`** — no URL-based locale routing is needed here, so a lightweight context avoids that complexity entirely.

---

## 6. Architecture

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

     Map Layer (client-side)
     Leaflet.js · OpenStreetMap tiles
```

There is no custom backend server — every write and read goes through Supabase's auto-generated REST API and RPC endpoints, gated entirely by RLS policies and `SECURITY DEFINER` functions. **The Next.js layer never holds a service-role key or bypasses RLS; it uses the same public anon key a browser would.** This is a deliberate constraint, not a limitation: it means the security boundary is the database itself, testable directly with `curl` and the public anon key, rather than trust placed in a server layer that could drift out of sync with the database's actual rules.

### Key data flows

**Anonymous user viewing a colony:**
```
User opens /map
  → Query returns BLURRED coordinates only
    (latitude_blurred, longitude_blurred)
  → RLS prevents exact coordinates from returning
    even if requested directly via the REST API
  → User clicks a pin → /colony/[id]
  → Any direct query for the exact coordinate columns:
    permission denied (42501)
```

**Caretaker accessing an exact location:**
```
User's browser calls RPC get_colony_exact_location(colony_id)
  → RPC validates the caretaker/creator link server-side,
    against the database, not a client-supplied flag
  → Returns exact coordinates only if validation passes
  → Cannot be bypassed client-side — there is no code
    path that reaches the exact columns any other way
  → Re-validates the link on every single call —
    a stale "am I a caretaker" boolean is never trusted
```

**File upload:**
```
User selects a photo
  → MIME type validated against an explicit allowlist
    (jpeg/png/webp/gif — not a broad "image/*" match,
    which would also accept image/svg+xml)
  → Size validated (max 5MB)
  → buildSafeStoragePath() generates the storage path:
    a sanitized prefix + a UUID-based filename
    (the original filename is never used — no user
    input ever reaches the path)
  → assertSafeStoragePath() re-checks the path immediately
    before the actual .upload() call, as a second
    belt-and-suspenders guard
  → Upload to Supabase Storage
    (RLS: authenticated write, public read)
```

Full folder structure is in [§10](#10-project-structure).

---

## 7. Security

> Security in Felines goes beyond protecting user data. The product maps the approximate locations of vulnerable animals. A malicious actor with exact coordinates could find and harm them. Every security decision below was made with that physical risk in mind, not just a data-privacy one — this framing shapes the *entire* database design, not one isolated feature.

Every control here was a deliberate design decision, then independently verified — and in several cases corrected — across multiple dedicated security review passes before submission, including a final pass treating the review as real penetration-test preparation. Full technical detail, every finding (fixed or otherwise), and every test performed lives in [`AUDIT_REPORT.md`](docs/AUDIT_REPORT.md); our vulnerability-disclosure process is in [`SECURITY.md`](SECURITY.md).

### 7.1 Progressive Location Blur

Covered in detail in [§4](#-progressive-location-blur), repeated here because it's the security decision most worth understanding end to end:

- Exact and blurred coordinates are stored as **separate columns**, not computed on the fly from one true value — so there's no code path where "just don't show the exact one" is the only thing standing between a request and the real coordinates.
- Protection is enforced via **column-level RLS grants**, not row-level filtering: `revoke select (latitude, longitude) on colonies from anon, authenticated`. A direct `curl` request with the anon key for `colonies?select=latitude,longitude` returns `42501 permission denied` — confirmed live, not just reviewed in code.
- Exact coordinates are **never returned by any public query, for any role**. The only path to them is `get_colony_exact_location()`, a `SECURITY DEFINER` function that re-confirms the caretaker/creator relationship against the database on every call.
- The identical column-vs-function pattern is reused for `reports.latitude`/`longitude`, since a report's exact location could otherwise leak a colony's near-exact position through its own open reports.

### 7.2 Row Level Security — 26 Tables

RLS is enabled on every one of the 26 application tables. No table anywhere in the schema has an unrestricted "allow all" policy — every policy scopes access to a specific role, a specific relationship (`auth.uid() = created_by`, a caretaker link, etc.), or an explicit column grant.

| Table | Anonymous | Authenticated | Caretaker / Owner |
|---|---|---|---|
| `colonies` | Blurred columns only | Blurred + near-blurred columns | Exact coordinates via RPC |
| `reports` | INSERT only (no SELECT) | INSERT + SELECT | SELECT + UPDATE (own or caretaker's colony) |
| `knowledge_progress` | No access | Own rows only | Own rows only |
| `profiles` | Public fields only (name, avatar) | Own full row + others' public fields | Same |
| `flags` | INSERT only | INSERT only | INSERT only |
| `notifications` | No access | Own rows only (select/update/delete) | Same |

All of these were tested with direct HTTP requests against the live Supabase REST endpoint using the real public anon key — the same vantage point an attacker with no account has — not just reviewed as SQL. See [§8](#8-testing) for the specific tests and results.

### 7.3 Secure RPCs

Every RPC that writes data on behalf of another user, or that needs to make an authorization decision a row policy can't express, is `SECURITY DEFINER` and was individually reviewed for two failure modes: (1) does it accept anonymous calls it shouldn't, and (2) does it trust caller-supplied input that reaches somewhere another user will see it.

**A real vulnerability found during development:** several RPCs were callable by the anon key by default Supabase privilege — `record_daily_visit`, in particular, was found still callable anonymously during a live test despite its migration's own comment claiming otherwise (the deployed database had drifted from what the migration history implied). Fixed by [`0075_reassert_record_daily_visit_grant.sql`](supabase/migrations/0075_reassert_record_daily_visit_grant.sql), then re-verified live.

| RPC | Protection | Migration |
|---|---|---|
| `get_colony_exact_location` | Caretaker/creator link re-validated server-side, every call | [`0016`](supabase/migrations/0016_progressive_location_blur.sql) |
| `confirm_report` | Atomic increment, blocks self-confirmation and duplicate confirmation | [`0038`](supabase/migrations/0038_flag_profiles_and_self_confirm.sql) |
| `record_daily_visit` | Idempotent (one per day), anon access re-revoked after drift was found | [`0064`](supabase/migrations/0064_daily_visit_streak_and_colony_city.sql), [`0075`](supabase/migrations/0075_reassert_record_daily_visit_grant.sql) |
| `thank_action` | Blocks self-thanking | [`0068`](supabase/migrations/0068_prevent_self_thank.sql) |
| `notify_caretakers` / `notify_nearby_caretakers` | Fixed server-side message template, no caller-supplied free text | [`0065`](supabase/migrations/0065_harden_notify_caretakers.sql) |
| `notify_caretakers` (rate limit) | Database-level circuit breaker — one notification batch per colony per 5 minutes, even via direct REST calls | [`0078`](supabase/migrations/0078_rate_limit_notify_caretakers.sql) |
| `is_user_banned` | `SECURITY DEFINER`, used inside INSERT policies so ban status can be checked without a public grant on the underlying columns | [`0082`](supabase/migrations/0082_false_pin_ban_system.sql) |

A note on `notify_caretakers`: the fixed message template wasn't a stylistic choice, it was a security decision. Every granted RPC is exposed as a public REST endpoint (`/rest/v1/rpc/notify_caretakers`) reachable with the same anon key that ships in every page load — if the message content were caller-supplied, this endpoint would be a ready-made spam/phishing vector, letting anyone inject arbitrary text into real notifications sent to real caretakers.

### 7.4 Aikido Security Findings

Both findings from an external security review, documented here in full, not summarized away:

**Path Traversal (HIGH severity) ✅ Fixed**

File uploads across 6 upload sites (colony photos, cat photos, avatars, timeline photos, story photos, the new-colony form) were building storage paths from user-influenced input without sanitization — a filename or prefix containing `../` sequences could, in principle, write outside the intended storage folder.

Fixed by centralizing all path construction in [`lib/security/storage.ts`](lib/security/storage.ts):
- `buildSafeStoragePath()` strips `../`/`..\` sequences and any character outside an explicit allowlist
- The filename is never the user's original filename — it's a timestamp + random token + a validated extension
- `validatePhotoFile()` checks an explicit MIME allowlist (`image/jpeg`, `image/png`, `image/webp`, `image/gif`) instead of a broad `image/*` match, which would also accept `image/svg+xml` — SVGs can embed `<script>` tags, a known upload-based XSS vector unrelated to the path-traversal finding but caught during the same hardening pass
- `assertSafeStoragePath()` re-asserts the path can't contain `..` or start with `/`, called again immediately before every `.upload()` call as defense in depth — not just buried once inside the builder

Commit: `security: fix path traversal vulnerability in file uploads — Aikido report`

**SSRF in Geocoding (LOW severity) ✅ Fixed**

The reverse-geocoding call to Nominatim interpolated latitude/longitude directly into a URL string with no validation. Severity was rated LOW because coordinates in practice come from Leaflet map clicks, not typed input — but it was fixed for defense in depth regardless of how likely exploitation was in the current UI.

Fixed with [`lib/security/validateCoordinates.ts`](lib/security/validateCoordinates.ts) (rejects out-of-range, `NaN`, `Infinity`, or non-numeric coordinates before any request is built), `URLSearchParams` instead of string interpolation in [`lib/external/geocode.ts`](lib/external/geocode.ts), and `redirect: "error"` so a malicious redirect response can't be followed silently. While patching this, the same unvalidated pattern was found in the weather-fetch helper — outside Aikido's original report — and fixed identically, plus a pre-existing bug where the geocoding response's language was always Portuguese regardless of the visitor's actual language preference.

Commit: `security: fix SSRF vulnerability in geocoding requests — Aikido report`

### 7.5 Additional Security Layers

**Security headers** (`next.config.ts`):

| Header | Value | Protects against |
|---|---|---|
| `X-DNS-Prefetch-Control` | `on` | Controls DNS prefetching behavior |
| `X-Frame-Options` | `DENY` | Clickjacking |
| `X-Content-Type-Options` | `nosniff` | MIME-type sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Referrer/URL leakage to third parties |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(self)` | Unwanted browser permission access |
| `X-XSS-Protection` | `1; mode=block` | Legacy XSS fallback for older browsers |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Downgrade to plain HTTP |
| `Content-Security-Policy` | Scoped to the app's actual external origins (Supabase, OpenStreetMap tiles, OpenWeatherMap, Nominatim) | XSS, unauthorized resource loading |

**Input validation, everywhere, at both layers.** Client-side `maxLength` and range checks are a UX nicety — every real boundary is re-enforced by a database `CHECK` constraint, since a direct REST call with the public anon key bypasses the client entirely:
- `char_length` constraints on every free-text column (colony name, narrative, report description, cat name, caretaker letter, story content, resource description, profile display name, public contact — matching limits already used in the UI)
- Geographic range `CHECK` constraints (`-90..90` latitude, `-180..180` longitude) on every coordinate column in `colonies` and `reports`, not just at the point where the app happens to call an external API
- MIME-type allowlist on every upload path (see [§7.4](#74-aikido-security-findings))

#### 7.5.1 Rate limiting, in two layers

- **API layer**: `lib/security/rateLimit.ts`, an in-memory sliding-window limiter — 10 requests/hour for anonymous callers, 30/hour for authenticated, keyed by IP or user id.
- **Database layer**: a circuit breaker inside `notify_caretakers()` itself, so the limit still holds even if a caller skips the Next.js API route entirely and calls the public Supabase RPC endpoint directly with the anon key — the one code path the first layer physically cannot see.

**Auth security:**
- The post-login/signup `returnTo` redirect parameter is validated by [`lib/security/safeReturnTo.ts`](lib/security/safeReturnTo.ts) to accept only an internal path starting with exactly one `/` — rejecting `//evil.com` and any absolute URL, closing an open-redirect vector that could otherwise fire a phishing redirect immediately after a real login.
- No service-role key exists anywhere in client-side code, server code, `.env.local`, or git history — confirmed by a full-repository grep, not assumed.
- Streak data (`profiles.current_streak`, `longest_streak`) and ban status (`banned`, `banned_until`, `ban_count`) are **not publicly readable** — protected the same way exact coordinates are, via column-level grant revocation plus a narrow `SECURITY DEFINER` accessor function, not a row policy alone.

**Full audit report, including every test performed and its result:** [`docs/AUDIT_REPORT.md`](docs/AUDIT_REPORT.md).

---

## 8. Testing

### Methodology

Three approaches, since no single one would have caught everything below: **code review** (structured passes across the full codebase, across multiple dedicated sessions), **API testing** (raw HTTP requests directly against the live Supabase REST/RPC endpoints using the real public anon key — the same vantage point an attacker with no account has), and **manual flow testing** (walking every major journey in both anonymous and signed-in states). The API-testing pass is what caught the RLS/RPC gaps documented above — reading the code alone had missed them, because the *intent* documented in a migration's own comments didn't always match the *deployed* database's actual state.

### Main flows tested

Every major journey, walked as both an anonymous visitor and a signed-in user: home → map → colony detail → filing a report → the emergency help flow → reading an article → the personalization quiz → registering a colony → linking as a caretaker → confirming and resolving a report → the public caretaker profile.

### Security tests (via API, using the anon key)

| Test | Expected | Result |
|---|---|---|
| `SELECT latitude FROM colonies` | Permission denied | ✅ |
| `SELECT latitude FROM reports` | Permission denied | ✅ |
| Call `get_colony_exact_location` for a colony you're not linked to | Permission denied | ✅ |
| Call `confirm_report` on your own report | Rejected (self-confirm guard) | ✅ |
| Call `thank_action` on your own action | Rejected (self-thank guard) | ✅ |
| Call `record_daily_visit` anonymously | Initially succeeded (drift found), fixed, re-verified rejected | ✅ |
| Upload with `../` in the storage path | Sanitized before reaching storage | ✅ |
| Reverse-geocode with out-of-range coordinates | Rejected before any request is built | ✅ |
| `SELECT current_streak FROM profiles` for another user | Permission denied (column-level grant) | ✅ |
| Insert a `colonies.narrative` beyond the length limit | Rejected by a `CHECK` constraint | ✅ |
| Insert a colony/report with out-of-range coordinates | Rejected by a `CHECK` constraint | ✅ |
| `SELECT * FROM knowledge_progress` for another user | Empty result, RLS scoped to own rows | ✅ |
| Submit a 3rd false-pin flag against the same colony | Colony removed, creator banned, notified | ✅ |
| Call `notify_caretakers` directly via REST, repeatedly | Rate-limited by the database circuit breaker | ✅ |
| `returnTo=//evil.com` on login | Rejected, falls back to a safe internal path | ✅ |

### Edge cases covered

- Colony health index and castration badge calculated correctly with zero registered cats (no division-by-zero)
- Double-clicking a feeding/water check-in produces exactly one event, not two
- The 11th anonymous report submission within an hour is blocked by the rate limiter
- The same user confirming the same report twice is blocked
- A duplicate false-pin flag against the same colony is blocked by a database constraint
- A wrong-MIME-type or over-5MB file is rejected before the upload request is sent
- `/colony/[id]` with a nonexistent id renders a proper 404
- A signed-out visitor on an account-gated action sees an explanation and a signup link, never a silent redirect
- Recording a care-streak action twice on the same day is idempotent (doesn't double-count)
- A streak's reset lands on 1, not 0, after a missed day

### Accessibility (WCAG 2.2)

- Color-contrast failures found and fixed (a success-state text color measured 3.3:1 against a 4.5:1 minimum)
- 15 modals had no focus trap — keyboard users could tab out of an open dialog into the page behind it; fixed with one shared hook reused everywhere
- 2 forms relied on placeholder text as their only label, which disappears the moment a screen reader user starts typing — fixed with real, associated `<label>` elements
- Every animation respects `prefers-reduced-motion`, with a static fallback for the cat assistant
- Touch targets verified at a minimum of 44×44px across every interactive element, including a navbar overflow bug and several sub-44px buttons found during a dedicated mobile pass
- The page's `lang` attribute updates dynamically with the PT/EN toggle, so assistive technology announces content in the correct language

### Numbers

**40+ bugs found and fixed** across many dedicated audit sessions (functional, security, accessibility, UI consistency, content, performance, and mobile responsiveness) over the course of the project, plus a dedicated final pre-submission security pass. The UI-consistency, motion, and mobile-specific findings are itemized separately in [`docs/UI_AUDIT_REPORT.md`](docs/UI_AUDIT_REPORT.md); the full security history is in [`docs/AUDIT_REPORT.md`](docs/AUDIT_REPORT.md).

---

## 9. Getting Started

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

### Environment variables

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

**Important:** these are `NEXT_PUBLIC_` variables, intentionally exposed to the browser — they're the anon/public keys, and security is enforced by Supabase RLS, not by keeping these values secret. **Never use the service-role key as a `NEXT_PUBLIC_` variable** — doing so would bypass every RLS policy described in [§7](#7-security) from the client.

Where to find each value:
- **`NEXT_PUBLIC_SUPABASE_URL`** and **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** — Supabase dashboard → your project → Project Settings → API.
- **`NEXT_PUBLIC_WEATHER_API_KEY`** — OpenWeatherMap → "My API keys" (free account; a fresh key can take up to 2 hours to activate).
- **`NEXT_PUBLIC_SITE_URL`** — defaults to `http://localhost:3000` for local development.

### Database setup

`supabase/migrations/` contains 85 numbered SQL files — run them **in order** in the Supabase SQL Editor (Dashboard → SQL Editor → paste each file's contents → Run), since most assume everything before them has already been applied. `0001_init.sql` creates the core schema and RLS policies; the rest are incremental features, RPCs, and security fixes. A few files near the end are one-time maintenance scripts (test-data cleanup, a full data wipe that preserves accounts) rather than schema changes — each says so in its own header comment, and is safe to skip on a fresh database.

### Run

```bash
npm run dev      # development server
npm run build    # production build — must pass with zero errors before commit
npm run lint     # linter — must be zero warnings before commit
npm run start    # production server
```

Open [http://localhost:3000](http://localhost:3000).

---

## 10. Project Structure

```
felines/
├── app/                        # Next.js App Router — 21 page routes
│   ├── page.tsx                # Home — hero, impact stats, entry points, the guide
│   ├── map/                    # Interactive colony map
│   ├── colony/[id]/            # Colony detail — 5 tabs (cats, timeline, needs, reports, letter)
│   ├── colony/new/             # Register a colony
│   ├── learn/[slug]/           # Individual educational article (19 total)
│   ├── glossary/, plants/, curso/  # Glossary, toxic plants, caretaker course
│   ├── reports/                # Reports / resources / contacts / stories hub
│   ├── impact/                 # Public platform-wide impact statistics
│   ├── notifications/          # Notification inbox
│   ├── profile/, u/[id]/       # Signed-in profile, public caretaker profile
│   └── login/, signup/         # Auth
├── components/                 # ~90 single-concern React components, grouped by domain
│   ├── assistant/, auth/, colony/, impact/, learn/
│   ├── map/, profile/, reports/, resources/, shared/, stories/
├── hooks/
│   └── useFelinesAssistant.ts  # Cat assistant trigger logic — 9 distinct triggers
├── lib/
│   ├── content/                # Static content sources (articles, glossary, quizzes, type enums)
│   ├── security/                # storage.ts, safeReturnTo.ts, rateLimit.ts, validateCoordinates.ts
│   ├── data/                    # Supabase read/write helpers (notifications, profile, reports)
│   ├── external/                # Third-party API wrappers (geocode.ts, weather.ts, siteUrl.ts)
│   ├── i18n/pt.ts, en.ts       # Full Portuguese and English translations
│   └── supabaseClient.ts       # Shared Supabase client (anon key, used client- and server-side)
├── supabase/migrations/         # 85 numbered SQL migrations (schema, RLS, RPCs) — 26 tables
├── docs/AUDIT_REPORT.md         # Full itemized security/bug/refactor audit
├── docs/UI_AUDIT_REPORT.md      # UI consistency, motion, and mobile audit
├── docs/LICENSE_COMPLIANCE.md   # Third-party dependency license findings
├── SECURITY.md                  # Vulnerability disclosure policy
└── CONTRIBUTING.md               # Local setup and contribution guidelines
```

---

## 11. How AI Was Used

This section is deliberately specific, because it matters to us that it's read correctly: **Felines is not an AI-generated product. AI was a tool. Every decision, every idea, and every ethical judgment call in this project was made by a human.**

Built solo by **Luara Oliveira** (UX Designer / Business Analyst), using **Claude Code** for implementation.

**What was 100% human:**
- The central insight behind the entire product — that the platform should talk to people who aren't cat people yet — came from the founder not knowing what a cat colony was before starting this project. She used that gap in her own knowledge as the primary persona for every design decision, which required living the confusion first, not something a tool can originate.
- The strategic reading of "world domination" as conquering the unconvinced, not preaching to the choir ([§2](#2-the-hackathon-theme--world-domination-the-strategic-reading)).
- Every product decision: what to build, what to cut, and why.
- The security architecture's framing — progressive location blur as **animal safety first, data privacy second** — a founder decision that shapes the entire database design; Claude Code implemented the RLS policies, grants, and RPCs that enforce it.
- The decision to let anonymous users report *situations*, never *people* — an ethical line the product holds throughout the emergency and reporting flows.
- Visual identity — the color palette derived directly from the logo cat.
- Curation and verification of the 14 real local contacts in the community directory.
- Every database migration's design — all 85 Supabase migrations (schema, RLS policies, RPCs, and security fixes) reflect the founder's own database design decisions, with Claude Code writing the SQL syntax under her direction.
- Every direction change, every audit finding's disposition, and every code review across the project's many working sessions.

**What Claude Code did:**
- Wrote the Next.js/TypeScript application code across 21 routes and ~90 components.
- Implemented all 85 database migrations from the founder's design decisions.
- Drafted initial article and translation copy for review.
- Ran the security, accessibility, functional, and performance audits, and identified specific bugs and fixes.

**What was collaborative:**
- Security implementation — the founder defined what to protect and why (the animal-safety framing above); Claude Code implemented the specific RLS grants and functions.
- Educational content — the founder defined structure, tone, and the 5-level progression; Claude Code wrote the initial drafts, which were then human-reviewed and corrected before publishing.
- The cat assistant — the founder defined tone and approved every individual curiosity shown.

| What was human | What was a tool |
|---|---|
| The core insight and target audience | Writing TypeScript/React code |
| Every product and scope decision | Writing SQL syntax under her direction |
| Designing all 85 database migrations | — |
| Security intent (animal-safety framing) | Implementing RLS policies and RPCs |
| Curating 14 real local contacts | Initial article/translation drafts |
| Reviewing and approving all content | Running audits and flagging bugs |
| Every direction change across sessions | Executing the fixes once approved |

Every piece of published content — articles, translations, cat facts, the 14 real local contacts — was human-reviewed before publishing, not auto-published from a model's first draft. Every statistic cited throughout this README and the app comes from a real, named, verifiable source (WHO, IBGE, Instituto Pet Brasil, the Brazilian Ministry of the Environment) — never a generated figure.

**AI wrote the code. The product is the founder's thinking.**

---

## 12. Impact Data

The numbers behind why this platform exists — every figure cited from a real, named source:

| Data | Source |
|---|---|
| 10 million stray cats in Brazil | World Health Organization / WSPA |
| 480 million stray cats worldwide | World Animal Foundation (2021) |
| ~185,000 animals already living in NGOs/shelters operating at capacity | Instituto Pet Brasil (2023) |
| Abandonment in Brazil grew from ~3.9 million (2018) to ~8.8 million (2020) | Instituto Pet Brasil |
| ~40% of Brazilians report a neighbor conflict involving animals | IBGE |
| 71% of people who abuse animals also commit crimes against humans | Brazilian Ministry of the Environment, citing "The Link" research |

---

## 13. Roadmap

**Near term:**
- A neutering calendar with direct NGO/CCZ scheduling integration — turning the existing neutering-request pipeline into something an NGO can actually book against.
- A QR code per colony, bridging the physical pin (a sign posted at the site) to its digital page.
- A PWA build for offline-capable article access in the field.
- Configurable push notifications for care reminders, instead of the current read-on-visit model.

**Medium term:**
- A public data API for researchers and city governments.
- Deeper municipal CCZ integration.
- A foster-home network.
- A TNR impact simulator, modeling the vacuum effect for a specific neighborhood.

Full roadmap, including smaller planned improvements: [GitHub Wiki — Roadmap](https://github.com/luarawork/felines/wiki/Roadmap).

---

## 14. Documentation

More detail on the product than fits in this README:

- 🇧🇷 [Documentação em Português](https://bronzed-longship-a0f.notion.site/Felines-Documenta-o-392f091b2b7481048a73e27049a939cb)
- 🇺🇸 [Documentation in English](https://bronzed-longship-a0f.notion.site/Felines-Documentation-EN-392f091b2b7481ff9a45e3b8b06f3993)
- **GitHub Wiki:** https://github.com/luarawork/felines/wiki — the full detail behind every section of this README and more: product vision and positioning, sourced research and the competitor benchmark, user personas and flows, 18 documented design decisions, visual identity and the UI design system, a fully detailed feature-by-feature breakdown, content strategy, architecture, database schema and RPC reference, an in-depth security page (including the live Aikido dashboard screenshot), environment setup, the full testing record, how AI was used, the story behind the product, the day-by-day development log, and the roadmap.

---

## 15. Contributing

Contributions are welcome — from a typo fix to a new feature. Start with [`CONTRIBUTING.md`](CONTRIBUTING.md) for local setup, code standards, and how a proposed change should relate to the project's actual values. Please also read the [Code of Conduct](CODE_OF_CONDUCT.md) before opening a pull request.

---

## 16. License

MIT — see [`LICENSE`](LICENSE). Third-party dependency license findings (reviewed, not blocking) are documented in [`docs/LICENSE_COMPLIANCE.md`](docs/LICENSE_COMPLIANCE.md).

---

## 17. Acknowledgments

- The #hackthekitty — Hack the Kitty 2026 organizers, for the prompt that started this.
- Alley Cat Allies, for publicly available TNR research and vacuum-effect methodology.
- The World Health Organization and IBGE, for the population and conflict data cited throughout.
- Instituto Pet Brasil, for Brazilian shelter-capacity and abandonment statistics.
- The real, often invisible caretakers and cats of Natal, RN, who inspired every decision in this product — this exists to make their work a little more visible.
- My cat-loving friends and the many people who patiently answered my questions and taught me so much about cats throughout this project.
