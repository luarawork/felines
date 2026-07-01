# Felines — Full Codebase Audit Report

Three-part audit (bugs, refactoring, security) completed across the entire
codebase. Work was split across four parallel passes: auth/colony/map bugs,
reports/help/learn/profile/notifications bugs, code quality, and security.

## 1. Bugs found and fixed

| # | Bug | File(s) | Fix |
|---|-----|---------|-----|
| 1 | Articles marked "read" on page mount instead of scroll-to-bottom | [`components/ArticleProgressTracker.tsx`](components/ArticleProgressTracker.tsx) | Now records `knowledge_progress` only within 48px of the bottom of the article, matching [`ReadingProgressBar`](components/ReadingProgressBar.tsx)'s threshold |
| 2 | Feeding/water check-in double-click race | [`components/ColonyActions.tsx`](components/ColonyActions.tsx) | Added a `checkInPending` guard disabling both buttons the instant a click registers, instead of only after the insert resolves |
| 3 | `NeuteringRequestBanner` built but never rendered | [`components/ColonyDetailClient.tsx`](components/ColonyDetailClient.tsx) | Imported and rendered next to `HelpRequestBanner` — caretakers previously had no way to advance a neutering request's status from the colony page |
| 4 | `FlagButton` allowed duplicate flags per user (generic flag flow) | [`components/FlagButton.tsx`](components/FlagButton.tsx) | Client-side handling of unique-violation as "already flagged" + migration [`0070`](supabase/migrations/0070_flag_dedup_generic_reasons.sql) |
| 5 | SignupForm ignored `returnTo`, never redirected post-signup | [`components/SignupForm.tsx`](components/SignupForm.tsx), [`app/signup/page.tsx`](app/signup/page.tsx) | Reads `returnTo`, redirects on live session, forwards into post-confirmation login link; wrapped page in `<Suspense>` (was a pre-existing build-breaking bug — `useSearchParams()` requires it) |
| 6 | `knowledge_progress` upsert had no matching unique constraint | [`supabase/migrations/0069`](supabase/migrations/0069_knowledge_progress_and_flag_uniqueness.sql) | `ON CONFLICT (user_id, article_slug)` was silently failing/duplicating without a backing unique index |
| 7 | False-pin flags had no per-user-per-colony uniqueness at the DB level | [`supabase/migrations/0069`](supabase/migrations/0069_knowledge_progress_and_flag_uniqueness.sql) | Partial unique index scoped to the 4 false-pin reasons |
| 8 | `notify_caretakers`/`notify_nearby_caretakers` accepted arbitrary free-text from the caller, exploitable via direct anon RPC call | [`supabase/migrations/0065`](supabase/migrations/0065_harden_notify_caretakers.sql) | Message now built server-side from a validated `p_type`/`p_report_type`, caller text never stored |
| 9 | `profiles.current_streak/longest_streak/last_action_date` were publicly readable by anyone, contradicting the migration 0043 comment that streaks are never public | [`supabase/migrations/0066`](supabase/migrations/0066_restrict_streak_columns_to_owner.sql) | Revoked table-wide SELECT, added `get_own_streak()` RPC gated to `auth.uid() = id` |
| 10 | `colonies.name/narrative`, `cats.name`, `reports.description`, `caretakers.letter` had **no DB-level length limit at all** | [`supabase/migrations/0067`](supabase/migrations/0067_missing_length_checks.sql) | Added `char_length` CHECK constraints, matching the pattern already used on stories/help_requests/resource_posts |
| 11 | `thank_action()` never blocked self-thanking (unlike `confirm_report`'s explicit guard) | [`supabase/migrations/0068`](supabase/migrations/0068_prevent_self_thank.sql) | No-ops if the caller authored the timeline event being thanked |

All 11 migrations above (`0065`–`0070`, plus `0072`/`0073` from the
contacts/resource-exchange feature work and `0071` for the Natal contact
seed) have since been **run against the live database** — see
[§7](#7-migration-status) for the up-to-date list.

## 2. Security issues found and fixed

Of the 11 bugs above, **5 are security-relevant** (#4, #6, #8, #9, #11) and one
is a data-integrity gap that's also an abuse surface (#10 — unbounded text
fields via direct REST calls with the public anon key). This section explains
*why* each of those fixes was necessary, not just what changed — the reasoning
matters more than the diff for anyone auditing this later.

### 2.1 `notify_caretakers`/`notify_nearby_caretakers` — message injection via direct RPC call (fixed, applied)

**File:** [`supabase/migrations/0065_harden_notify_caretakers.sql`](supabase/migrations/0065_harden_notify_caretakers.sql)

Both functions are `SECURITY DEFINER` (they write `notifications` rows for
users other than the caller — see [§2.6](#26-why-rpcs-use-security-definer)
for why that pattern exists at all) and are granted `EXECUTE` to `anon`,
because anonymous reporters legitimately need to trigger a caretaker
notification when they file a report. The bug: the *original* versions
accepted a free-text `p_message` parameter straight from the caller and
inserted it verbatim. Since Supabase exposes every granted RPC as a public
REST endpoint (`/rest/v1/rpc/notify_caretakers`) reachable with the same
public anon key that ships in every page load, this meant **anyone could
call the endpoint directly — bypassing the app's UI entirely — and inject
arbitrary text into any colony's caretaker notifications**, using a
`colony_id` that's already enumerable from the public map. A believable
attack: spam every caretaker in the city with a phishing link disguised as
a report notification.

**Fix:** the functions no longer accept a message at all. They take a
validated `p_type` (`report_submitted` or `area_alert`) and, for
`area_alert`, a `p_report_type` constrained to the same 4-value enum
`reports.type` already uses. The message text is built from a fixed
`case` statement *inside* the SQL function — a caller can select which
canned message fires, but can never write arbitrary text into it.

### 2.2 `profiles.current_streak`/`longest_streak`/`last_action_date` — publicly readable by anyone (fixed, applied)

**File:** [`supabase/migrations/0066_restrict_streak_columns_to_owner.sql`](supabase/migrations/0066_restrict_streak_columns_to_owner.sql)

`profiles_select_public` (`for select using (true)`, from
[`0015_profiles.sql`](supabase/migrations/0015_profiles.sql)) is a **row**
policy — it says who can read *rows*, not which *columns* of those rows.
[`0043_care_streak.sql`](supabase/migrations/0043_care_streak.sql) added the
three streak columns to `profiles` with a comment explicitly stating streaks
are "deliberately personal — never exposed on a public profile," but never
added the column-level grant needed to actually enforce that. Confirmed
live: an anonymous `curl` request against
`/rest/v1/profiles?select=id,current_streak,longest_streak,last_action_date`
returned another user's real streak data with zero authentication. The row
policy was correct; the column exposure underneath it was not — this is
exactly the row-vs-column distinction documented in
[`0016_progressive_location_blur.sql`](supabase/migrations/0016_progressive_location_blur.sql)
for colony coordinates, just missed for a newer table.

**Fix:** `revoke select on profiles from anon, authenticated`, then
`grant select (id, display_name, avatar_url, created_at)` back explicitly —
the genuinely public fields. Streak data is now readable only through
`get_own_streak()`, a `SECURITY DEFINER` RPC that filters `where p.id =
auth.uid()` — a row policy can't express "only this row's streak columns,
but the same row's other columns stay public," so this had to move to a
function the same way exact coordinates did.

### 2.3 Missing DB-level length limits (fixed, applied)

**File:** [`supabase/migrations/0067_missing_length_checks.sql`](supabase/migrations/0067_missing_length_checks.sql)

`colonies.name`/`narrative`, `cats.name`, `reports.description`, and
`caretakers.letter` had **no `CHECK` constraint on length at all** —
inconsistent with every other free-text column added later
(`community_contacts.notes`, `resource_posts.description`,
`help_requests.description`, `colony_stories.story_text` all have one).
Client-side `maxLength` on an `<input>` is a UX nicety, not a security
boundary — nothing stops a direct REST call with the public anon key from
sending a multi-megabyte string into any of these columns, which is both a
storage-cost and a rendering-DoS concern (an absurdly long narrative could
degrade the colony page for every visitor). **Fix:** `char_length` checks
matching the sizes already used elsewhere (name fields ~100–150 chars,
free-text fields ~1000–2000 chars).

### 2.4 `thank_action()` — no self-thank guard (fixed, applied)

**File:** [`supabase/migrations/0068_prevent_self_thank.sql`](supabase/migrations/0068_prevent_self_thank.sql)

[`confirm_report()`](supabase/migrations/0038_flag_profiles_and_self_confirm.sql)
explicitly blocks a report's own creator from confirming it — a deliberate,
documented guard. `thank_action()` (added in
[`0039_action_thanks.sql`](supabase/migrations/0039_action_thanks.sql)) never
got the equivalent check, so a user could thank their own timeline action
and inflate their own thanks-received count. Same class of bug as
[§2.1](#21-notify_caretakersnotify_nearby_caretakers--message-injection-via-direct-rpc-call-fixed-applied):
a function's actual permissiveness didn't match its documented intent.
**Fix:** the function now no-ops (returns without inserting) if the caller
authored the timeline event being thanked.

### 2.5 Duplicate flags / duplicate reading-progress rows (fixed, applied)

**Files:** [`0069_knowledge_progress_and_flag_uniqueness.sql`](supabase/migrations/0069_knowledge_progress_and_flag_uniqueness.sql), [`0070_flag_dedup_generic_reasons.sql`](supabase/migrations/0070_flag_dedup_generic_reasons.sql)

Two independent gaps, both "the client-side upsert/dedup logic assumed a
database constraint that was never actually created":

- `components/ArticleProgressTracker.tsx` calls
  `.upsert(..., { onConflict: "user_id,article_slug" })` on
  `knowledge_progress`, but no `unique(user_id, article_slug)` constraint
  ever existed — Postgres requires a matching unique/exclusion constraint
  for `ON CONFLICT` to do anything; without one, calls either error
  silently or insert duplicate rows (masked at *read* time by a client-side
  `Set()` dedup in `ProfileContent.tsx`, but real at *write* time).
- `flags` had no constraint stopping the same user from submitting
  multiple false-pin reports against the same colony, contradicting the
  "one flag per user per colony" behavior the UI implies.

**Fix:** both migrations add the missing unique indexes (the flags one is a
*partial* unique index scoped to just the false-pin reasons, so it doesn't
collide with the generic-flag dedup added separately in
[`0070`](supabase/migrations/0070_flag_dedup_generic_reasons.sql), which
covers `fake_location`/`harmful_content`/`spam`/`other` with its own
disjoint partial index).

### 2.6 Why RPCs use `SECURITY DEFINER`

A Postgres function is `SECURITY DEFINER` when it needs to do something the
*calling* role's own RLS grants wouldn't allow — almost always "write a row
that belongs to someone other than the caller." Every `SECURITY DEFINER`
function in this codebase falls into exactly one of two categories, and
each one is deliberately narrow about what it lets the caller actually do:

1. **Cross-user notification writes** — `notify_caretakers`, `notify_nearby_caretakers` ([`0059`](supabase/migrations/0059_notify_caretakers_on_report.sql), [`0062`](supabase/migrations/0062_notify_nearby_caretakers.sql)), `notify_followers` ([`0051`](supabase/migrations/0051_colony_followers.sql)), `thank_action` ([`0039`](supabase/migrations/0039_action_thanks.sql)), `respond_to_help_request` ([`0050`](supabase/migrations/0050_help_requests.sql)), `respond_to_resource_post` ([`0056`](supabase/migrations/0056_resource_exchange.sql)) — the caller needs to insert into *another user's* `notifications` row, which their own grant on that table doesn't (and shouldn't) permit directly. Each of these either takes no caller-supplied free text at all, or (after [§2.1](#21-notify_caretakersnotify_nearby_caretakers--message-injection-via-direct-rpc-call-fixed-applied)) builds its message from a fixed template.
2. **Server-side authorization the row policy language can't express** — `get_colony_exact_location` (auth check must happen *inside* the function to return different data per caller, not just gate row visibility), `get_own_streak` (same shape as above, for [§2.2](#22-profilescurrent_streaklongest_streaklast_action_date--publicly-readable-by-anyone-fixed-pending)), `confirm_report` (atomic counter increment + self-confirm guard + auto-resolve, all of which need to happen as one transaction, not a bare `UPDATE`), `mark_cat_seen_today`, `earn_caretaker_certification`, `check_colony_verification`, `recalculate_colony_health`, `record_daily_visit`, `record_care_streak`.

The pattern to watch for — and the one that produced every real finding in
this section — is a `SECURITY DEFINER` function accepting **unvalidated
input that ends up in a place another user will see it** (a message, a
notification, a stored value). A function that's `SECURITY DEFINER` purely
to bypass a row check on the *caller's own* data is a much smaller risk
than one that writes data attributed to or visible by someone else.

### 2.7 Why sensitive reports stay permanent in the timeline

`reports.sensitive` is set automatically by a trigger
([`set_report_sensitivity()`](supabase/migrations/0001_init.sql)) for three
types: `suspected_poisoning`, `suspected_abuse`, `disease_outbreak`. These
are exactly the categories where "this happened, once, at this colony" is
information worth preserving even after the immediate issue is resolved —
a poisoning incident 8 months ago is relevant context for a new caretaker
deciding whether to link themselves to that colony, in a way that "someone
logged a feeding" from 8 months ago simply isn't. `confirm_report()` and a
caretaker's manual resolve path both insert a permanent `timeline_events`
row (`event_type = 'report_resolved'`) specifically when `sensitive = true`
— non-sensitive reports resolve without leaving that trace, since a routine
sighting or a "no food/water" report doesn't carry the same long-term
relevance once it's handled. This is a **product decision enforced in the
database**, not a client-side display choice: the timeline entry is
inserted by the same `SECURITY DEFINER` RPC that resolves the report, so
there's no code path that resolves a sensitive report without also
recording that it happened.

### 2.8 Progressive location blur — the mechanics

Full detail lives in the README's
[Security Architecture → Progressive Location Blur](README.md#progressive-location-blur)
section; summarized here because it's one of the two or three decisions
most worth understanding in this codebase:

| Level | Who | Data source | Offset | Enforced by |
|---|---|---|---|---|
| 1 | Anonymous | `latitude_blurred`/`longitude_blurred` | ~±0.005° (~500m) | Column is the only one anon has any grant on |
| 2 | Signed in, not a caretaker | `latitude_blurred_near`/`longitude_blurred_near` | ~±0.001° (~100m) | Column is the only *additional* one `authenticated` has a grant on |
| 3 | Linked caretaker or colony creator | `latitude`/`longitude` (exact) | none | `get_colony_exact_location(p_colony_id)` — re-checks the caretaker/creator link against the database **on every call**, never from a cached client value |

The critical property: `latitude`/`longitude` are **not reachable by any
direct table query, for any role** — `revoke select (latitude, longitude)
on colonies from anon, authenticated` in
[`0016_progressive_location_blur.sql`](supabase/migrations/0016_progressive_location_blur.sql)
means even a signed-in caretaker's own client can't get the exact
coordinates from `supabase.from("colonies").select("latitude")`; the RPC is
the *only* path, and it validates the relationship server-side every time,
so a stale client-side "am I a caretaker" flag can never leak coordinates
it shouldn't. The identical column-vs-function pattern was later reused for
`reports.latitude`/`longitude`
([`0040_blur_report_coordinates.sql`](supabase/migrations/0040_blur_report_coordinates.sql))
once it became clear that a report's exact coordinates could otherwise leak
a colony's near-exact position through its own open reports.

### 2.9 Rate limiting

Only `/api/reports` has rate limiting today —
[`lib/rateLimit.ts`](lib/rateLimit.ts), an in-memory sliding-window limiter
(10 requests/hour for anonymous callers, 30/hour for authenticated,
keyed by IP for anon and user id for authenticated). It exists there
specifically because that's the one endpoint an anonymous visitor with no
account at all can hit repeatedly. Everything else that could be spammed —
posting a `community_contacts` entry, a `colony_stories` post, a
`resource_posts` listing, a `flags` submission — already requires
authentication, which raises the cost of abuse from "free and anonymous"
to "tied to a real account," a meaningfully different threat model even
without an additional rate limit. This is flagged in
[§4](#4-effort-estimated-backlog-not-fixed-this-session) as a **Medium**
item worth adding regardless, not because there's a known exploit, but
because "requires an account" alone doesn't stop a single account from
posting in a tight loop.

### Additional items verified as already correct (no change needed)

- Exact `latitude`/`longitude` on `colonies` and `reports` — confirmed via live anon-key curl requests, both return `permission denied`; blurred columns succeed.
- `knowledge_progress` cross-user read — confirmed empty result for unauthenticated/cross-user access.
- File upload: MIME-type checked (not just extension), 5MB limit enforced both client-side and at the Supabase bucket level ([`0026_storage_bucket_limits.sql`](supabase/migrations/0026_storage_bucket_limits.sql)), storage paths always machine-generated (no path traversal) — see [`lib/storage.ts`](lib/storage.ts).
- No `dangerouslySetInnerHTML` anywhere in the repo (checked for XSS via story text, colony narratives, cat names, letters).
- No `select("*")` anywhere in app code.
- No service-role key or other secret in app code or git history.
- All `NEXT_PUBLIC_*` env vars are genuinely meant to be public; `.env.local` is gitignored; [`.env.example`](.env.example) created (was missing).
- `confirm_report`/`mark_cat_seen_today` — atomic `UPDATE`, no race condition.
- Security headers ([`next.config.ts`](next.config.ts)) — added `Content-Security-Policy` and `Permissions-Policy` (were missing; `X-Frame-Options`/`X-Content-Type-Options`/`Referrer-Policy` already existed).
- `npm audit` — 2 moderate findings, both in a transitive `postcss` dependency bundled inside `next`'s own `node_modules`; no fix available without a major Next.js downgrade. Flagged, not actionable.

**Flagged, not fixed (needs a decision):**
- **Resource/story/flag submission has no rate limiting**, unlike `/api/reports` — see [§2.9](#29-rate-limiting) above. Effort: **Medium** — needs a `lib/rateLimit.ts`-style module wired into each insert path.
- **Session expiry mid-action**: no global interceptor for an expired JWT during a mid-form action; each form just shows a generic error. Effort: **Medium** — needs a UX decision (silent refresh vs. force re-login) before implementing a shared wrapper.

## 3. Refactoring changes made

The code-quality pass found the codebase already close to clean:
- **Zero** real `any`/`as any` usages found.
- Lint was already clean (no unused vars/imports, no missing hook dependencies) before this audit started.
- All `<img>` tags already carry deliberate `eslint-disable` comments for dynamic Supabase storage URLs.
- All three `key={index}` usages found are on genuinely static/non-reorderable lists (progress dots, a fixed feature list, a single-item remount trick) — not the reordering-bug pattern, left as-is.
- Form validation logic already shared via `lib/storage.ts` (`validatePhotoFile`, `buildSafeStoragePath`) across all upload forms — no duplication found.
- One real fix made: `components/CaretakerLetters.tsx` was computing the same `.filter()` twice per render; extracted into a single `useMemo`.

**Flagged, not fixed (needs larger, riskier work):**
- 6 components exceed the project's own 150-line target: `GlobalSearchButton.tsx` (330), `NewColonyForm.tsx` (455), `CatManager.tsx` (426), `HelpFlow.tsx` (314), `app/page.tsx` (301), `EditColonyForm.tsx` (265). Effort: **Large** — genuine extraction/splitting work, correctly out of scope for a blind pass.
- `lib/submitReport.ts`'s `type`/`status` fields could be narrowed to unions matching the codebase's existing `"pt" | "en"` pattern. Effort: **Small**, deferred since the file was actively being edited by the bug-hunt pass during this session.

## 4. Effort-estimated backlog (not fixed this session)

| Item | Effort | Why deferred |
|---|---|---|
| Rate limiting on resource/story/flag submission | M | New shared module needed across multiple insert paths |
| Session-expiry recovery UX | M | Needs a product decision on silent-refresh vs. force-relogin |
| Split 6 components over 150 lines | L | Extraction risk too high for a blind pass; needs dedicated review |
| Union types for `submitReport`'s `type`/`status` | S | Blocked on other in-flight edits to the same file this session |

## 5. Patterns noticed

- The team already has strong conventions (helper functions taking `t` as a
  parameter to avoid `react-hooks/purity` violations, `security definer`
  functions with internal auth checks, migration comments explaining *why*)
  — most "bugs" the audit checklist anticipated turned out to already be
  handled correctly, a sign the codebase has had careful, incremental
  security review already (see [`supabase/migrations/0047_security_advisor_fixes.sql`](supabase/migrations/0047_security_advisor_fixes.sql)).
- The recurring real gap was **trusting client-supplied data server-side**
  in a few specific RPCs (`notify_caretakers`, missing length checks) —
  worth a standing habit of asking "what if this RPC is called directly via
  `/rest/v1/rpc/...` with the public anon key, bypassing the app entirely?"
  for any new SECURITY DEFINER function.
- Several components were fully built and correctly wired to their own data
  model but never actually rendered anywhere (`NeuteringRequestBanner`) —
  worth a quick "is this component imported anywhere?" grep pass after
  building a new feature.

## 6. Current state

- `npm run lint` — 0 errors, 0 warnings.
- `npm run build` — succeeds, all 21 routes compile cleanly.
- `npm audit` — 2 moderate (transitive, no actionable fix).
- Working tree clean; all changes committed in small, scoped commits.

## 7. Migration status

Per this project's rule, no migration is ever executed by an agent session —
each one is drafted, reviewed, and then run manually by the project owner via
the Supabase SQL editor. As of this writing:

**Applied:**

| Migration | Purpose |
|---|---|
| [`0065_harden_notify_caretakers.sql`](supabase/migrations/0065_harden_notify_caretakers.sql) | Fixes [§2.1](#21-notify_caretakersnotify_nearby_caretakers--message-injection-via-direct-rpc-call-fixed-applied) |
| [`0066_restrict_streak_columns_to_owner.sql`](supabase/migrations/0066_restrict_streak_columns_to_owner.sql) | Fixes [§2.2](#22-profilescurrent_streaklongest_streaklast_action_date--publicly-readable-by-anyone-fixed-applied) |
| [`0067_missing_length_checks.sql`](supabase/migrations/0067_missing_length_checks.sql) | Fixes [§2.3](#23-missing-db-level-length-limits-fixed-applied) |
| [`0068_prevent_self_thank.sql`](supabase/migrations/0068_prevent_self_thank.sql) | Fixes [§2.4](#24-thank_action--no-self-thank-guard-fixed-applied) |
| [`0069_knowledge_progress_and_flag_uniqueness.sql`](supabase/migrations/0069_knowledge_progress_and_flag_uniqueness.sql) | Fixes [§2.5](#25-duplicate-flags--duplicate-reading-progress-rows-fixed-applied) |
| [`0070_flag_dedup_generic_reasons.sql`](supabase/migrations/0070_flag_dedup_generic_reasons.sql) | Fixes bug #4 |
| [`0071_seed_natal_contacts.sql`](supabase/migrations/0071_seed_natal_contacts.sql) | Seeds `community_contacts` with 14 real Natal/RN contacts |
| [`0072_contacts_update_policy.sql`](supabase/migrations/0072_contacts_update_policy.sql) | Adds the missing update-own RLS policy for `community_contacts` |
| [`0073_resource_contact_exchange.sql`](supabase/migrations/0073_resource_contact_exchange.sql) | Adds `resource_post_interests` + `profiles.public_contact` |

**Pending (not yet run):**

| Migration | Purpose |
|---|---|
| [`0074_care_reminders.sql`](supabase/migrations/0074_care_reminders.sql) | New `care_reminders` table + RLS for the recurring-reminders feature |

## 8. Recommendations for next steps

1. Run [`0074_care_reminders.sql`](supabase/migrations/0074_care_reminders.sql) via the Supabase SQL editor.
2. Decide on the rate-limiting and session-expiry UX questions flagged above; both are self-contained enough to implement in a follow-up session once a direction is chosen.
3. Consider a dedicated session to split the 6 oversized components — each is a contained, well-understood piece of UI, so the risk is manageable with focused attention rather than a blind sweep.
4. Re-run `npm audit` after any future `next` major-version upgrade to confirm the transitive `postcss` advisory clears on its own.
